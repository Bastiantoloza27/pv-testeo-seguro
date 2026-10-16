import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { MapPin, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import PageShell from "@/components/personas/PageShell";

const OPCIONES = [["negativo", "Negativo", "bg-emerald-600"], ["no_negativo", "No negativo", "bg-red-600"], ["ausente", "Ausente", "bg-slate-500"]];

export default function Terreno() {
  const [fecha, setFecha] = useState(format(new Date(), "yyyy-MM-dd"));
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["terreno", fecha],
    queryFn: async () => {
      const { items } = await base44.entities.Testeo.filter({ fecha }, { sort: "turno", limit: 200 });
      const ids = [...new Set(items.map((t) => t.trabajador_id))];
      const { items: ts } = ids.length ? await base44.entities.Trabajador.filter({ id: { $in: ids } }, { limit: 200 }) : { items: [] };
      const map = Object.fromEntries(ts.map((t) => [t.id, t]));
      return items.map((t) => ({ ...t, p: map[t.trabajador_id] || {} }));
    },
  });
  const marcar = async (id, resultado) => {
    await base44.entities.Testeo.update(id, { resultado });
    qc.invalidateQueries({ queryKey: ["terreno", fecha] });
  };

  return (
    <PageShell title="Sorteados" subtitle="Para ubicar y testear en terreno">
      <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="bg-card h-12 text-base" />
      {isLoading && <Card className="p-8 text-center text-muted-foreground">Cargando…</Card>}
      {data && !data.length && <Card className="p-8 text-center text-muted-foreground">No hay sorteados para esta fecha.</Card>}
      <div className="space-y-3">
        {data?.map((t) => (
          <Card key={t.id} className="p-4 space-y-3">
            <div>
              <div className="text-lg font-semibold leading-tight">{t.p.nombre || "—"}</div>
              <div className="text-sm text-muted-foreground font-mono">{t.p.codigo} · {t.p.cargo}</div>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-primary" />{t.faena || t.p.faena}{t.p.ubicacion && ` · ${t.p.ubicacion}`}</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-primary" />{t.turno || t.p.turno}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {OPCIONES.map(([v, l, c]) => (
                <button key={v} onClick={() => marcar(t.id, v)} className={`h-11 rounded-md text-sm font-medium ${t.resultado === v ? `${c} text-white` : "bg-muted text-foreground"}`}>{l}</button>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}