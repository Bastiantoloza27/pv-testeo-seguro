import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";

export default function ImportarDialog({ open, onOpenChange, onDone }) {
  const [rows, setRows] = useState(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(""); setBusy("Leyendo el archivo…");
    const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
    const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri, expires_in: 600 });
    const res = await base44.functions.invoke("extraerTrabajadores", { file_url: signed_url, filename: file.name }).catch((err) => ({ data: { error: err.response?.data?.error || err.message } }));
    setBusy("");
    if (res.data.error) return setError(res.data.error);
    if (!res.data.trabajadores.length) return setError("No se encontraron trabajadores en el archivo.");
    setRows(res.data.trabajadores);
  };

  const confirmar = async () => {
    setBusy("Guardando…");
    for (let i = 0; i < rows.length; i += 500) await base44.entities.Trabajador.upsert(rows.slice(i, i + 500), { key: "codigo" });
    setBusy(""); setRows(null); onDone();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Importar trabajadores</DialogTitle>
          <DialogDescription>Sube un Excel, CSV, PDF o Word. Si un código ya existe, se actualizan sus datos; si no, se agrega.</DialogDescription>
        </DialogHeader>
        {!rows ? (
          <label className="border-2 border-dashed rounded-lg p-10 flex flex-col items-center gap-2 cursor-pointer text-muted-foreground hover:bg-muted/50">
            {busy ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
            <span>{busy || "Seleccionar archivo"}</span>
            <input type="file" accept=".xlsx,.xls,.csv,.pdf,.docx,.doc" className="hidden" onChange={onFile} disabled={!!busy} />
          </label>
        ) : (
          <div className="max-h-80 overflow-auto border rounded-md text-sm">
            <table className="w-full">
              <thead className="sticky top-0 bg-muted text-left"><tr>{["Código", "Nombre", "Cargo", "Faena", "Turno", "Estado"].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead>
              <tbody>{rows.map((r, i) => <tr key={i} className="border-t"><td className="px-3 py-1.5 font-mono">{r.codigo}</td><td className="px-3">{r.nombre}</td><td className="px-3">{r.cargo}</td><td className="px-3">{r.faena}</td><td className="px-3">{r.turno}</td><td className="px-3">{r.estado}</td></tr>)}</tbody>
            </table>
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {rows && (
          <DialogFooter>
            <Button variant="outline" onClick={() => setRows(null)}>Elegir otro archivo</Button>
            <Button onClick={confirmar} disabled={!!busy}>{busy || `Importar ${rows.length} trabajadores`}</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}