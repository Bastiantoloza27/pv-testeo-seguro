import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const ITEM = {
  type: 'object',
  properties: {
    codigo: { type: 'string' }, nombre: { type: 'string' }, cargo: { type: 'string' },
    faena: { type: 'string' }, ubicacion: { type: 'string' },
    turno: { type: 'string', enum: ['T1', 'T2', 'T3', 'Administrativo', 'Rotativo'] },
    estado: { type: 'string', enum: ['activo', 'licencia', 'excluido'] },
  },
};
const SCHEMA = { type: 'object', properties: { trabajadores: { type: 'array', items: ITEM } } };

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { file_url, filename } = await req.json();
    if (!file_url || !filename) return Response.json({ error: 'Falta el archivo' }, { status: 400 });
    const ext = filename.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls', 'csv', 'pdf', 'docx', 'doc'].includes(ext)) return Response.json({ error: 'Formato no soportado' }, { status: 400 });

    const Core = base44.asServiceRole.integrations.Core;
    let rows = [];
    if (['xlsx', 'xls', 'csv'].includes(ext)) {
      const r = await Core.ExtractDataFromUploadedFile({ file_url, json_schema: SCHEMA });
      if (r.status !== 'success') return Response.json({ error: r.details || 'No se pudo leer el archivo' }, { status: 422 });
      rows = r.output?.trabajadores || (Array.isArray(r.output) ? r.output : []);
    } else {
      const r = await Core.InvokeLLM({
        prompt: 'Extrae el listado de trabajadores del documento adjunto. Para cada persona entrega código (o RUT/número si no hay código), nombre, cargo, faena o grupo, ubicación, turno (T1, T2, T3, Administrativo o Rotativo) y estado (activo, licencia o excluido; por defecto activo). No inventes datos: deja vacío lo que no aparezca.',
        file_urls: [file_url],
        response_json_schema: SCHEMA,
      });
      rows = r.trabajadores || [];
    }
    rows = rows.filter((x) => x.codigo && x.nombre).slice(0, 2000).map((x) => ({ estado: 'activo', turno: 'Rotativo', ...x, codigo: String(x.codigo).trim() }));
    return Response.json({ trabajadores: rows });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}