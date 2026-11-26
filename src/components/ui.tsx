import { CakeSlice, Citrus, CupSoda, Drumstick, GlassWater, IceCreamBowl, Info, Martini, Salad, Sandwich, Soup, Wine, type LucideIcon } from "../lib/icons";
import { useState, type ReactNode } from "react";
import { Link } from "../lib/router";
import type { Role } from "../data/types";
import { useCeia } from "../store/ceia";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className={`font-display text-2xl tracking-tight ${light ? "text-cream-50" : "text-pine-800"}`}>
      ceia<span className="text-gold-500">.</span>fácil
    </Link>
  );
}

const ROLE_VISUAL: Record<Role, { icon: LucideIcon; from: string; to: string }> = {
  principal: { icon: Drumstick, from: "#7A4A26", to: "#C9A86A" },
  acompanhamento: { icon: Soup, from: "#9A7A43", to: "#EFE5D2" },
  salada: { icon: Salad, from: "#2C5240", to: "#A9C7A0" },
  entrada: { icon: Sandwich, from: "#8A5A3B", to: "#DCC48F" },
  sobremesa: { icon: CakeSlice, from: "#6B3A4A", to: "#E8C9B5" },
};

/** Espaço reservado para a foto licenciada (Fase 3). */
export function DishVisual({ role, name, id, className = "" }: { role: Role; name: string; id?: string; className?: string }) {
  const v = ROLE_VISUAL[role];
  const [failed, setFailed] = useState(false);
  if (id && !failed)
    return (
      <div className={`relative overflow-hidden bg-cream-200 ${className}`}>
        <img src={`fotos/${id}.webp`} alt={name} loading="lazy" onError={() => setFailed(true)} className="h-full w-full object-cover" />
      </div>
    );
  const Icon = name.toLowerCase().includes("mousse") || name.toLowerCase().includes("gelatina") ? IceCreamBowl : v.icon;
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{ background: `radial-gradient(120% 90% at 30% 20%, ${v.to}, ${v.from})` }}
      aria-label={`Foto de ${name} (em breve)`}
    >
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "14px 14px" }} />
      <Icon className="relative h-12 w-12 text-white/90 drop-shadow" strokeWidth={1.4} />
      <span className="absolute bottom-2 right-2 rounded-full bg-black/25 px-2 py-0.5 text-[10px] font-medium text-white/90">foto em breve</span>
    </div>
  );
}

export const DRINK_ICON: Record<string, LucideIcon> = {
  Espumante: Wine, Vinhos: Wine, Drinks: Martini, "Sucos naturais": Citrus, Refrigerantes: CupSoda, "Águas": GlassWater,
};

export function DraftNotice({ children }: { children?: ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-2xl bg-gold-300/25 px-4 py-3 text-sm text-pine-800">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
      <span>{children ?? "Prévia com dados demonstrativos: quantidades em rascunho, ainda não testadas em cozinha."}</span>
    </div>
  );
}

const QUICK = [2, 5, 10, 15, 20, 30, 40, 50];

export function GuestControl({ compact = false }: { compact?: boolean }) {
  const { guests, setGuests } = useCeia();
  return (
    <div className={compact ? "" : "card p-5"}>
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-pine-700">Convidados</span>
        <span className="font-display text-3xl text-pine-800">
          {guests}
          <span className="ml-1 font-sans text-sm text-pine-600">{guests === 1 ? "pessoa" : "pessoas"}</span>
        </span>
      </div>
      <input
        type="range"
        min={1}
        max={80}
        value={guests}
        onChange={(e) => setGuests(+e.target.value)}
        className="guest-range mt-4 w-full"
        aria-label="Quantidade de convidados"
      />
      <div className="mt-3 flex flex-wrap gap-1.5">
        {QUICK.map((n) => (
          <button
            key={n}
            onClick={() => setGuests(n)}
            className={`chip transition ${guests === n ? "bg-pine-800 text-cream-50" : "bg-cream-200 text-pine-700 hover:bg-cream-200/70"}`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export function PageHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <header className="mb-6 animate-rise">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-1 text-3xl text-pine-800 sm:text-4xl">{title}</h1>
      {subtitle && <p className="mt-2 max-w-xl text-pine-700/80">{subtitle}</p>}
    </header>
  );
}
