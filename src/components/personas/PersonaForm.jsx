import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TURNOS, ESTADOS } from "@/lib/personas";

const FIELDS = [["codigo", "Código"], ["nombre", "Nombre"], ["cargo", "Cargo"], ["faena", "Faena / grupo"], ["ubicacion", "Ubicación"]];

export default function PersonaForm({ open, onOpenChange, initial, onSave }) {
  const [f, setF] = useState(initial || { turno: "Rotativo", estado: "activo" });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(f);
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{initial ? "Editar trabajador" : "Nuevo trabajador"}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="grid grid-cols-2 gap-3">
          {FIELDS.map(([k, l]) => (
            <div key={k} className={k === "nombre" ? "col-span-2" : ""}>
              <Label>{l}</Label>
              <Input value={f[k] || ""} onChange={(e) => set(k, e.target.value)} required={k === "codigo" || k === "nombre"} />
            </div>
          ))}
          <div>
            <Label>Turno</Label>
            <Select value={f.turno} onValueChange={(v) => set("turno", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TURNOS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Estado</Label>
            <Select value={f.estado} onValueChange={(v) => set("estado", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{Object.entries(ESTADOS).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <DialogFooter className="col-span-2">
            <Button type="submit" disabled={saving}>{saving ? "Guardando…" : "Guardar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}