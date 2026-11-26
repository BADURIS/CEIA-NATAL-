import { CakeSlice, Drumstick, Home, ShoppingBasket, User, UtensilsCrossed, Wine } from "../lib/icons";
import { NavLink, Outlet } from "../lib/router";
import { useCeia } from "../store/ceia";
import { Logo } from "./ui";

const NAV = [
  { to: "/", label: "Início", icon: Home, desktopOnly: false },
  { to: "/salgados", label: "Salgados", icon: Drumstick, desktopOnly: false },
  { to: "/sobremesas", label: "Sobremesas", icon: CakeSlice, desktopOnly: false },
  { to: "/bebidas", label: "Bebidas", icon: Wine, desktopOnly: true },
  { to: "/minha-ceia", label: "Minha Ceia", icon: UtensilsCrossed, desktopOnly: false },
  { to: "/lista", label: "Lista", icon: ShoppingBasket, desktopOnly: false },
  { to: "/conta", label: "Conta", icon: User, desktopOnly: true },
];

export default function Layout() {
  const { recipeIds, drinkIds } = useCeia();
  const count = recipeIds.length + drinkIds.length;
  return (
    <div className="min-h-screen pb-24 md:pb-10">
      <header className="no-print sticky top-0 z-30 border-b border-pine-900/5 bg-cream-100/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Logo />
          <nav className="hidden gap-1 md:flex">
            {NAV.slice(1).map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `rounded-full px-3.5 py-2 text-sm font-medium transition ${isActive ? "bg-pine-800 text-cream-50" : "text-pine-700 hover:bg-white"}`
                }
              >
                {n.label}
                {n.to === "/minha-ceia" && count > 0 && <span className="ml-1.5 rounded-full bg-gold-400 px-1.5 text-xs text-pine-900">{count}</span>}
              </NavLink>
            ))}
          </nav>
          <NavLink to="/bebidas" className="btn-ghost md:hidden">
            <Wine className="h-4 w-4" /> Bebidas
          </NavLink>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-6">
        <Outlet />
      </main>

      <nav className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-pine-900/10 bg-cream-50/95 backdrop-blur md:hidden">
        <div className="grid grid-cols-5">
          {NAV.filter((n) => !n.desktopOnly).map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/"}
              className={({ isActive }) => `relative flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${isActive ? "text-pine-800" : "text-pine-700/55"}`}
            >
              <n.icon className="h-5 w-5" />
              {n.label}
              {n.to === "/minha-ceia" && count > 0 && (
                <span className="absolute right-[22%] top-1.5 h-4 min-w-4 rounded-full bg-gold-500 px-1 text-[10px] leading-4 text-white">{count}</span>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
