import React from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ESTADOS, ESTADO_STYLE } from "@/lib/personas";

export default function PersonasTable({ items, loading, selected = [], onSelect }) {
  const toggle = (id) => onSelect(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  const all = items.length > 0 && items.every((p) => selected.includes(p.id));
  if (loading) return <Card className="p-10 text-center text-muted-foreground">Cargando…</Card>;
  if (!items.length) return <Card className="p-10 text-center text-muted-foreground">No hay trabajadores que coincidan.</Card>;
  return (
    <Card className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-muted-foreground border-b">
          <tr><th className="pl-4 w-8"><Checkbox checked={all} onCheckedChange={() => onSelect(all ? [] : items.map((p) => p.id))} /></th>{["Código", "Nombre", "Cargo", "Faena", "Turno", "Estado"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr key={p.id} className="border-b last:border-0 hover:bg-muted/50">
              <td className="pl-4"><Checkbox checked={selected.includes(p.id)} onCheckedChange={() => toggle(p.id)} /></td>
              <td className="px-4 py-3 font-mono"><Link to={`/personas/${p.id}`} className="text-primary hover:underline">{p.codigo}</Link></td>
              <td className="px-4 py-3"><Link to={`/personas/${p.id}`}>{p.nombre}</Link></td>
              <td className="px-4 py-3">{p.cargo}</td>
              <td className="px-4 py-3">{p.faena}{p.ubicacion && <span className="text-muted-foreground"> · {p.ubicacion}</span>}</td>
              <td className="px-4 py-3">{p.turno}</td>
              <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${ESTADO_STYLE[p.estado]}`}>{ESTADOS[p.estado]}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}