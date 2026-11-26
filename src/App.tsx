import { useEffect } from "react";
import { Route, Routes, useLocation } from "./lib/router";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import RecipePage from "./pages/RecipePage";
import Drinks from "./pages/Drinks";
import MyCeia from "./pages/MyCeia";
import ShoppingList from "./pages/ShoppingList";
import Account from "./pages/Account";
import AccessGate from "./components/AccessGate";

export default function App() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route element={<AccessGate><Layout /></AccessGate>}>
        <Route path="/salgados" element={<Catalog kind="salgado" />} />
        <Route path="/sobremesas" element={<Catalog kind="sobremesa" />} />
        <Route path="/receita/:id" element={<RecipePage />} />
        <Route path="/bebidas" element={<Drinks />} />
        <Route path="/minha-ceia" element={<MyCeia />} />
        <Route path="/lista" element={<ShoppingList />} />
        <Route path="/conta" element={<Account />} />
      </Route>
    </Routes>
  );
}
