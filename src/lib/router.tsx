/**
 * Roteador mínimo por hash (#/rota). Funciona em qualquer hospedagem estática,
 * inclusive dentro de prévias em iframe, sem configuração de servidor.
 */
import {
  Children, createContext, isValidElement, useContext, useEffect, useState,
  type AnchorHTMLAttributes, type ReactElement, type ReactNode,
} from "react";

interface RouterState { path: string; navigate: (to: string | number) => void }
const RouterCtx = createContext<RouterState>({ path: "/", navigate: () => {} });
const ParamsCtx = createContext<Record<string, string>>({});
const OutletCtx = createContext<ReactNode>(null);

/** Hash sem barras (ex.: #receita--chester-assado) para funcionar em qualquer hospedagem. */
export const toHash = (path: string) => (path === "/" ? "#inicio" : `#${path.replace(/^\//, "").replace(/\//g, "--")}`);
const current = () => {
  const h = window.location.hash.replace(/^#\/?/, "");
  return !h || h === "inicio" ? "/" : `/${h.replace(/--/g, "/")}`;
};

export function HashRouter({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(current);
  useEffect(() => {
    const f = () => setPath(current());
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  const navigate = (to: string | number) => (typeof to === "number" ? window.history.go(to) : (window.location.hash = toHash(to)));
  return <RouterCtx.Provider value={{ path, navigate }}>{children}</RouterCtx.Provider>;
}

function match(pattern: string, path: string): Record<string, string> | null {
  const a = pattern.split("/").filter(Boolean);
  const b = path.split("/").filter(Boolean);
  if (a.length !== b.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith(":")) params[a[i].slice(1)] = decodeURIComponent(b[i]);
    else if (a[i] !== b[i]) return null;
  }
  return params;
}

interface RouteProps { path?: string; element: ReactNode; children?: ReactNode }
export function Route(_: RouteProps): null {
  return null;
}

export function Routes({ children }: { children: ReactNode }) {
  const { path } = useContext(RouterCtx);
  for (const child of Children.toArray(children)) {
    if (!isValidElement(child)) continue;
    const { path: p, element, children: nested } = (child as ReactElement<RouteProps>).props;
    if (p) {
      const params = match(p, path);
      if (params) return <ParamsCtx.Provider value={params}>{element}</ParamsCtx.Provider>;
    } else if (nested) {
      for (const n of Children.toArray(nested)) {
        if (!isValidElement(n)) continue;
        const np = (n as ReactElement<RouteProps>).props;
        const params = np.path ? match(np.path, path) : null;
        if (params)
          return (
            <ParamsCtx.Provider value={params}>
              <OutletCtx.Provider value={np.element}>{element}</OutletCtx.Provider>
            </ParamsCtx.Provider>
          );
      }
    }
  }
  return null;
}

export const Outlet = () => <>{useContext(OutletCtx)}</>;
export const useParams = () => useContext(ParamsCtx);
export const useNavigate = () => useContext(RouterCtx).navigate;
export const useLocation = () => ({ pathname: useContext(RouterCtx).path });

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { to: string };
export function Link({ to, ...rest }: LinkProps) {
  return <a href={toHash(to)} {...rest} />;
}

type NavLinkProps = Omit<LinkProps, "className"> & { end?: boolean; className?: string | ((s: { isActive: boolean }) => string) };
export function NavLink({ to, end, className, ...rest }: NavLinkProps) {
  const { path } = useContext(RouterCtx);
  const isActive = path === to || (!end && to !== "/" && path.startsWith(`${to}/`));
  return <Link to={to} className={typeof className === "function" ? className({ isActive }) : className} {...rest} />;
}
