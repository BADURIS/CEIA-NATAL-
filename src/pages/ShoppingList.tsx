import { Copy, Eye, EyeOff, FileText, Pencil, Plus, Printer, RotateCcw, Share2, Trash2 } from "../lib/icons";
import { useState } from "react";
import { Link } from "../lib/router";
import { DraftNotice, PageHeader } from "../components/ui";
import { MARKET_SECTIONS, toText } from "../engine/shopping";
import { useCeia } from "../store/ceia";

export default function ShoppingList() {
  const { shopping, checked, toggleChecked, removeItem, editItem, addManual, resetList, guests } = useCeia();
  const [pendingOnly, setPendingOnly] = useState(false);
  const [newName, setNewName] = useState("");
  const [newQty, setNewQty] = useState("");
  const [msg, setMsg] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text());
      setMsg("Lista copiada");
    } catch {
      setMsg("Não foi possível copiar");
    }
  };

  const visible = shopping.filter((i) => !pendingOnly || !checked.includes(i.key));
  const done = shopping.filter((i) => checked.includes(i.key)).length;
  const text = () => toText(shopping, guests);

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: "Lista da ceia", text: text() });
      else {
        await navigator.clipboard.writeText(text());
        setMsg("Lista copiada");
      }
    } catch {
      /* compartilhamento cancelado */
    }
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([text()], { type: "text/plain;charset=utf-8" }));
    Object.assign(document.createElement("a"), { href: url, download: "lista-ceia-facil.txt" }).click();
    URL.revokeObjectURL(url);
  };

  if (!shopping.length)
    return (
      <div>
        <PageHeader eyebrow="Lista de compras" title="Nada por aqui ainda" />
        <Link to="/salgados" className="btn-primary">Montar minha ceia</Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader eyebrow={`Lista de compras · ${guests} convidados`} title="Hora do mercado" subtitle={`${done} de ${shopping.length} itens comprados`} />
      <div className="mb-2 h-2 overflow-hidden rounded-full bg-cream-200"><div className="h-full bg-gold-500 transition-all" style={{ width: `${(done / shopping.length) * 100}%` }} /></div>

      <div className="no-print my-5 flex flex-wrap gap-2">
        <button onClick={() => setPendingOnly(!pendingOnly)} className="btn-ghost">{pendingOnly ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}{pendingOnly ? "Mostrar tudo" : "Só pendentes"}</button>
        <button onClick={share} className="btn-ghost"><Share2 className="h-4 w-4" />Compartilhar</button>
        <button onClick={() => window.print()} className="btn-ghost"><Printer className="h-4 w-4" />Imprimir / PDF</button>
        <button onClick={download} className="btn-ghost"><FileText className="h-4 w-4" />Texto</button>
        <button onClick={copy} className="btn-ghost"><Copy className="h-4 w-4" />Copiar</button>
        <button onClick={resetList} className="btn-ghost"><RotateCcw className="h-4 w-4" />Restaurar</button>
        {msg && <span className="self-center text-sm text-pine-600">{msg}</span>}
      </div>

      <div className="space-y-6">
        {MARKET_SECTIONS.map((s) => {
          const items = visible.filter((i) => i.section === s);
          if (!items.length) return null;
          return (
            <section key={s}>
              <h2 className="mb-2 font-sans text-xs font-semibold uppercase tracking-widest text-gold-600">{s}</h2>
              <ul className="card divide-y divide-pine-900/5">
                {items.map((i) => {
                  const on = checked.includes(i.key);
                  return (
                    <li key={i.key} className="flex items-center gap-3 px-4 py-3">
                      <button
                        onClick={() => toggleChecked(i.key)}
                        aria-label={on ? "Desmarcar" : "Marcar como comprado"}
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition ${on ? "border-pine-800 bg-pine-800 text-cream-50" : "border-pine-800/25"}`}
                      >
                        {on && "✓"}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className={`font-medium ${on ? "text-pine-700/40 line-through" : "text-pine-900"}`}>{i.name}</p>
                        <p className="truncate text-xs text-pine-700/55">{i.sources.join(", ")}</p>
                        {i.note && <p className="text-xs text-gold-600">{i.note}</p>}
                      </div>
                      {editing === i.key ? (
                        <form
                          className="flex items-center gap-1"
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (draft.trim()) editItem(i.key, draft.trim());
                            setEditing(null);
                          }}
                        >
                          <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={(e) => e.currentTarget.form?.requestSubmit()} className="w-28 rounded-full bg-cream-100 px-3 py-1.5 text-base outline-none ring-2 ring-pine-800/30" aria-label={`Quantidade de ${i.name}`} />
                        </form>
                      ) : (
                        <div className="max-w-[42%] shrink-0 text-right">
                          <p className={`text-sm font-semibold leading-snug ${on ? "text-pine-700/40" : "text-pine-800"}`}>{i.display}</p>
                          {i.packHint && <p className="text-xs text-pine-700/55">{i.packHint}</p>}
                        </div>
                      )}
                      <button
                        onClick={() => {
                          setDraft(i.display);
                          setEditing(i.key);
                        }}
                        aria-label="Editar quantidade"
                        className="no-print rounded-full p-1.5 text-pine-700/60 hover:bg-cream-200"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => removeItem(i.key)} aria-label="Remover item" className="no-print rounded-full p-1.5 text-pine-700/60 hover:bg-cream-200">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      <form
        className="no-print card mt-6 flex flex-wrap gap-2 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!newName.trim()) return;
          addManual(newName.trim(), newQty.trim() || "1");
          setNewName("");
          setNewQty("");
        }}
      >
        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Adicionar item (ex.: guardanapos)" className="min-w-0 flex-1 rounded-full bg-cream-100 px-4 py-2 outline-none ring-pine-800/30 focus:ring-2" />
        <input value={newQty} onChange={(e) => setNewQty(e.target.value)} placeholder="Qtd." className="w-24 rounded-full bg-cream-100 px-4 py-2 outline-none ring-pine-800/30 focus:ring-2" />
        <button className="btn-primary px-4 py-2"><Plus className="h-4 w-4" /></button>
      </form>

      <div className="mt-6"><DraftNotice /></div>
    </div>
  );
}
