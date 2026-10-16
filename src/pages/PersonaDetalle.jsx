import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { differenceInDays } from "date-fns";
import PageShell from "@/components/personas/PageShell";
import PersonaForm from "@/components/personas/PersonaForm";
import TesteoForm from "@/components/personas/TesteoForm";
import TesteoHistorial from "@/components/personas/TesteoHistorial";
import { ESTADOS } from "@/lib/personas";

function Stat({ label, value }) {
  return <Card className="p-4"><div className="text-xs text-muted-foreground">{label}</div><div className="text-2xl font-semibold mt-1">{value}</div></Card>;
}

export default function PersonaDetalle() {
  const { id } = useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const [edit, setEdit] = useState(false);
  const [test, setTest] = useState(false);

  const { data: p, isLoading } = useQuery({ queryKey: ["trab", id], queryFn: () => base44.entities.Trabajador.get(id) });
  const hist = useQuery({ queryKey: ["testeos", id], queryFn: async () => (await base44.entities.Testeo.filter({ trabajador_id: id }, { sort: "-fecha", limit: 50 })).items });
  const { data: total = 0 } = useQuery({ queryKey: ["testeos-count", id], queryFn: () => base44.entities.Testeo.count({ trabajador_id: id }) });

  if (isLoading) return <div className="p-10 text-center text-muted-foreground">Cargando…</div>;
  if (!p) return <div className="p-10 text-center">Trabajador no encontrado.</div>;

  const last = hist.data?.[0];
  const ausencias = (hist.data || []).filter((t) => t.resultado === "ausente").length;

  const saveEdit = async (f) => { await base44.entities.Trabajador.update(id, f); setEdit(false); qc.invalidateQueries(); };
  const saveTest = async (f) => { await base44.entities.Testeo.create({ ...f, trabajador_id: id, codigo: p.codigo, faena: p.faena }); setTest(false); qc.invalidateQueries(); };
  const remove = async () => { if (!confirm("¿Eliminar este trabajador?")) return; await base44.entities.Trabajador.delete(id); qc.invalidateQueries(); nav("/personas"); };

  return (
    <PageShell
      title={`${p.codigo} · ${p.nombre}`}
      subtitle={[p.cargo, p.faena, p.ubicacion, p.turno, ESTADOS[p.estado]].filter(Boolean).join(" · ")}
      back="/personas" backLabel="Volver a Personas"
      actions={<>
        <Button onClick={() => setTest(true)}>Registrar testeo</Button>
        <Button variant="secondary" onClick={() => setEdit(true)}>Editar</Button>
        <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white" onClick={remove}>Eliminar</Button>
      </>}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Veces seleccionado" value={total} />
        <Stat label="Último testeo" value={last ? last.fecha : "—"} />
        <Stat label="Días desde el último" value={last ? differenceInDays(new Date(), new Date(last.fecha)) : "—"} />
        <Stat label="Ausencias" value={ausencias} />
      </div>
      <TesteoHistorial items={hist.data || []} loading={hist.isLoading} />
      {edit && <PersonaForm open={edit} onOpenChange={setEdit} initial={p} onSave={saveEdit} />}
      {test && <TesteoForm open={test} onOpenChange={setTest} onSave={saveTest} />}
    </PageShell>
  );
}