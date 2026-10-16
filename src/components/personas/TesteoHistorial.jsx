import React from "react";
import { Card } from "@/components/ui/card";
import { RESULTADOS, TIPOS } from "@/lib/personas";

const COLOR = { negativo: "text-primary", no_negativo: "text-red-700", negativa: "text-red-700", ausente: "text-muted-foreground" };

export default function TesteoHistorial({ items, loading }) {
  return (
    <Card>
      <div className="px-4 py-3 border-b font-medium">Historial de sorteos y testeos</div>
      {loading ? <div className="p-6 text-center text-muted-foreground">Cargando…</div> : !items.length ? (
        <div className="p-6 text-center text-muted-foreground">Aún no ha salido seleccionado en un sorteo.</div>
      ) : (
        <ul>
          {items.map((t) => (
            <li key={t.id} className="px-4 py-3 border-b last:border-0 flex flex-wrap justify-between gap-2 text-sm">
              <div>
                <div className="font-medium">{t.fecha} · {t.turno}{t.sorteo && <span className="font-mono text-muted-foreground"> · {t.sorteo}</span>}</div>
                <div className="text-muted-foreground">{TIPOS[t.tipo]}{t.observacion && ` · ${t.observacion}`}</div>
              </div>
              <span className={`font-medium ${COLOR[t.resultado]}`}>{RESULTADOS[t.resultado]}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}