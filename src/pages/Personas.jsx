import { Link } from "react-router-dom";
import React, { useState } from "react";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Upload } from "lucide-react";
import ImportarDialog from "@/components/personas/ImportarDialog";
import AccionesMasivas from "@/components/personas/AccionesMasivas";
import PageShell from "@/components/personas/PageShell";
import PersonaForm from "@/components/personas/PersonaForm";
import PersonasTable from "@/components/personas/PersonasTable";
import PersonasStats from "@/components/personas/PersonasStats";
import { ESTADOS } from "@/lib/personas";

export default function Personas() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState("todos");
  const [faena, setFaena] = useState("todas");
  const [open, setOpen] = useState(false);
  const [importar, setImportar] = useState(false);
  const [selected, setSelected] = useState([]);
  const refresh = () => { setSelected([]); setImportar(false); qc.invalidateQueries(); };

  const query = {};
  if (estado !== "todos") query.estado = estado;
  if (faena !== "todas") query.faena = faena;
  if (q.trim()) query.$or = [{ codigo: { $regex: q.trim(), $options: "i" } }, { nombre: { $regex: q.trim(), $options: "i" } }];

  const list = useInfiniteQuery({
    queryKey: ["trabajadores", query],
    queryFn: ({ pageParam }) => base44.entities.Trabajador.filter(query, { sort: "codigo", limit: 50, cursor: pageParam }),
    getNextPageParam: (p) => (p.has_more ? p.next_cursor : undefined),
  });
  const { data: total = 0 } = useQuery({ queryKey: ["trab-count"], queryFn: () => base44.entities.Trabajador.count({ estado: "activo" }) });
  const { data: faenas = [] } = useQuery({ queryKey: ["faenas"], queryFn: async () => (await base44.entities.Trabajador.list({ distinct: "faena" })).items.filter(Boolean) });

  const items = list.data?.pages.flatMap((p) => p.items) || [];

  const save = async (f) => {
    await base44.entities.Trabajador.create(f);
    setOpen(false);
    qc.invalidateQueries();
  };

  return (
    <PageShell
      title="Personas"
      subtitle={`${total} trabajadores activos en el universo de sorteo`}
      actions={<>
        <Button variant="outline" asChild><Link to="/terreno">Sorteados (terreno)</Link></Button>
        <Button variant="secondary" onClick={() => setImportar(true)}><Upload className="w-4 h-4 mr-1" /> Importar archivo</Button>
        <Button onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-1" /> Agregar trabajador</Button>
      </>}
    >
      <PersonasStats />
      <div className="flex flex-wrap gap-3">
        <Input placeholder="Buscar por código o nombre" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs bg-card" />
        <Select value={faena} onValueChange={setFaena}>
          <SelectTrigger className="w-48 bg-card"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas las faenas</SelectItem>
            {faenas.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={estado} onValueChange={setEstado}>
          <SelectTrigger className="w-40 bg-card"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            {Object.entries(ESTADOS).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <AccionesMasivas ids={selected} onDone={refresh} />
      <PersonasTable items={items} loading={list.isLoading} selected={selected} onSelect={setSelected} />
      {importar && <ImportarDialog open={importar} onOpenChange={setImportar} onDone={refresh} />}
      {list.hasNextPage && (
        <div className="text-center">
          <Button variant="outline" onClick={() => list.fetchNextPage()} disabled={list.isFetchingNextPage}>Cargar más</Button>
        </div>
      )}
      {open && <PersonaForm open={open} onOpenChange={setOpen} onSave={save} />}
    </PageShell>
  );
}