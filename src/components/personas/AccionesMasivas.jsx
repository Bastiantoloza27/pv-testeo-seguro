import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ESTADOS } from "@/lib/personas";

export default function AccionesMasivas({ ids, onDone }) {
  const [busy, setBusy] = useState(false);
  if (!ids.length) return null;
  const run = async (fn) => { setBusy(true); await fn(); setBusy(false); onDone(); };

  const cambiar = (estado) => run(() => base44.entities.Trabajador.updateMany({ id: { $in: ids } }, { $set: { estado } }));
  const borrar = () => confirm(`¿Eliminar ${ids.length} trabajadores?`) && run(() => base44.entities.Trabajador.deleteMany({ id: { $in: ids } }));

  return (
    <div className="flex flex-wrap items-center gap-3 bg-card border rounded-lg px-4 py-2 text-sm">
      <span className="font-medium">{ids.length} seleccionados</span>
      <Select onValueChange={cambiar} disabled={busy}>
        <SelectTrigger className="w-44 h-8"><SelectValue placeholder="Cambiar estado a…" /></SelectTrigger>
        <SelectContent>{Object.entries(ESTADOS).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent>
      </Select>
      <Button size="sm" variant="destructive" onClick={borrar} disabled={busy}>Eliminar</Button>
    </div>
  );
}