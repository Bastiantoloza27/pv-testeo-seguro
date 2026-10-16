import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function ChartCard({ title, data, x }) {
  return (
    <Card className="p-4">
      <div className="text-sm font-medium mb-3">{title}</div>
      <div className="h-48">
        {data.length ? (
          <ResponsiveContainer>
            <BarChart data={data}>
              <XAxis dataKey={x} fontSize={11} tickLine={false} />
              <YAxis allowDecimals={false} fontSize={11} width={28} />
              <Tooltip />
              <Bar dataKey="count" name="Cantidad" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <div className="h-full grid place-items-center text-sm text-muted-foreground">Sin datos aún</div>}
      </div>
    </Card>
  );
}

export default function PersonasStats() {
  const { data: faenas = [] } = useQuery({ queryKey: ["agg-faena"], queryFn: async () => (await base44.entities.Trabajador.aggregate({ query: { estado: "activo" }, groupBy: "faena", sort: "-count" })).rows });
  const { data: meses = [] } = useQuery({ queryKey: ["agg-mes"], queryFn: async () => (await base44.entities.Testeo.aggregate({ dateBucket: { field: "fecha", unit: "month" }, sort: "fecha" })).rows });
  const { data: top = [] } = useQuery({ queryKey: ["agg-top"], queryFn: async () => (await base44.entities.Testeo.aggregate({ groupBy: "codigo", sort: "-count", limit: 10 })).rows });

  const mesKey = meses[0] ? Object.keys(meses[0]).find((k) => k !== "count") : "fecha";
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <ChartCard title="Trabajadores activos por faena" data={faenas} x="faena" />
      <ChartCard title="Testeos por mes" data={meses.map((m) => ({ ...m, mes: String(m[mesKey]).slice(0, 7) }))} x="mes" />
      <ChartCard title="Más veces seleccionados (código)" data={top} x="codigo" />
    </div>
  );
}