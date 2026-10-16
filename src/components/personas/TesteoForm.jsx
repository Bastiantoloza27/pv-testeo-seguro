import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RESULTADOS, TIPOS } from "@/lib/personas";

function Pick({ label, value, onChange, options }) {
  return (
    <div>
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>{Object.entries(options).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}

export default function TesteoForm({ open, onOpenChange, onSave }) {
  const [f, setF] = useState({ fecha: new Date().toISOString().slice(0, 10), turno: "T1", tipo: "ambos", resultado: "negativo" });
  const [saving, setSaving] = useState(false);
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v?.target ? v.target.value : v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(f);
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Registrar testeo</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="grid grid-cols-2 gap-3">
          <div><Label>Fecha</Label><Input type="date" value={f.fecha} onChange={set("fecha")} required /></div>
          <Pick label="Turno" value={f.turno} onChange={set("turno")} options={{ T1: "1° turno", T2: "2° turno", T3: "3° turno" }} />
          <div><Label>Sorteo</Label><Input placeholder="Ej: S-1410-B" value={f.sorteo || ""} onChange={set("sorteo")} /></div>
          <Pick label="Tipo" value={f.tipo} onChange={set("tipo")} options={TIPOS} />
          <div className="col-span-2"><Pick label="Resultado" value={f.resultado} onChange={set("resultado")} options={RESULTADOS} /></div>
          <div className="col-span-2"><Label>Observación</Label><Input value={f.observacion || ""} onChange={set("observacion")} /></div>
          <DialogFooter className="col-span-2"><Button type="submit" disabled={saving}>{saving ? "Guardando…" : "Guardar"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}