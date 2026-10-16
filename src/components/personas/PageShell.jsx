import React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export default function PageShell({ title, subtitle, back = "/", backLabel = "Volver al panel", actions, children }) {
  return (
    <div className="min-h-screen bg-muted/40">
      <header className="bg-brand-dark text-white">
        <div className="max-w-6xl mx-auto px-4 py-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link to={back} className="inline-flex items-center gap-1 text-sm text-white/70 hover:text-white">
              <ChevronLeft className="w-4 h-4" /> {backLabel}
            </Link>
            <h1 className="text-2xl font-semibold mt-1">{title}</h1>
            {subtitle && <p className="text-sm text-white/60">{subtitle}</p>}
          </div>
          <div className="flex gap-2">{actions}</div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">{children}</main>
    </div>
  );
}