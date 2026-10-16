import React, { useState } from "react";
import { Shuffle, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SortearBar({ fecha, onDone }) {
  const [n, setN] = useState(5);
  const [busy, setBusy] = useState(false);
  const sortear = async () => {
    setBusy(true);
    const { items } = await base44.entities.Trabajador.filter({ estado: "activo" }, { limit: 1000, fields: ["codigo", "faena", "turno"] });
    const pick = items.sort(() => Math.random() - 0.5).slice(0, n);
    const sorteo = `S-${fecha}-${Date.now().toString().slice(-4)}`;
    await base44.entities.Testeo.bulkCreate(pick.map((p) => ({
      trabajador_id: p.id, codigo: p.codigo, faena: p.faena, fecha, sorteo,
      turno: ["T1", "T2", "T3"].includes(p.turno) ? p.turno : undefined, tipo: "ambos", resultado: "pendiente",
    })));
    setBusy(false);
    onDone();
  };
  return (
    <div className="flex gap-2">
      <Input type="number" min={1} value={n} onChange={(e) => setN(Number(e.target.value))} className="w-20 h-12 text-base bg-card" />
      <Button onClick={sortear} disabled={busy || n < 1} className="flex-1 h-12 text-base">
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shuffle className="w-4 h-4" />} Sortear {n} trabajadores
      </Button>
    </div>
  );
}