"""Importa as receitas corretas (texto do usuário) para src/data/recipes.json e details-*.json."""
import json, re, sys, unicodedata

TXT, APP = sys.argv[1], sys.argv[2]
lines = [l.rstrip() for l in open(TXT, encoding="utf-8")]
recipes = json.load(open(f"{APP}/src/data/recipes.json", encoding="utf-8"))
det_s = json.load(open(f"{APP}/src/data/details-salgados.json", encoding="utf-8"))
det_d = json.load(open(f"{APP}/src/data/details-sobremesas.json", encoding="utf-8"))

def slug(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")

by_slug = {slug(r["name"]): r for r in recipes}

# ---- 1. separar blocos por receita ----
blocks, cur = {}, None
for l in lines:
    m = re.match(r"^\d+\.\s+(.+)$", l.strip())
    if m and slug(m.group(1)) in by_slug and not l.startswith(" "):
        cur = slug(m.group(1))
        blocks[cur] = []
        continue
    if cur:
        blocks[cur].append(l.strip())
missing = set(by_slug) - set(blocks)
assert not missing, missing

# ---- 2. ingredientes ----
FRAC = {"½": 0.5, "⅓": 1 / 3, "¼": 0.25, "¾": 0.75, "⅔": 2 / 3}
NUM = r"(\d+(?:,\d+)?\s*[½⅓¼¾⅔]?|[½⅓¼¾⅔])(?:\s+a\s+\d+(?:,\d+)?)?"

def num(s):
    s = s.strip()
    total = 0.0
    for ch, v in FRAC.items():
        if ch in s:
            total += v
            s = s.replace(ch, "")
    s = s.strip()
    if s:
        total += float(s.replace(",", "."))
    return total

UNITS = [
    (r"kg", "kg"), (r"g", "g"), (r"ml", "ml"), (r"litros?", "l"),
    (r"colher(?:es)? \(sopa\)", "colher-sopa"), (r"colher(?:es)? \(chá\)", "colher-cha"),
    (r"xícaras?", "xicara"), (r"dentes?", "dente"), (r"ramos?", "ramo"), (r"folhas?", "folha"),
    (r"latas?(?: ou caixas?)?", "lata"), (r"caixas?", "caixa"), (r"pacotes?", "pacote"),
    (r"maços?(?: pequenos?)?", "maco"), (r"pés?", "pé"), (r"talos?", "talo"), (r"vidros?", "vidro"),
    (r"envelopes?", "envelope"), (r"pitadas?", "pitada"), (r"cachos?(?: pequenos?)?", "cacho"),
    (r"pedaços?(?: pequenos?)?", "pedaco"), (r"unidades?", "un"),
]

# Nomes-base para hortifrúti/itens contáveis (singular), com tamanho/estado indo para a nota.
BASE = [
    (r"cebolas? roxas?", "Cebola roxa"), (r"cebolas?", "Cebola"), (r"tomates?(?!-cereja)", "Tomate"),
    (r"batatas?(?! palha)", "Batata"), (r"cenouras?", "Cenoura"), (r"(?:pimentão|pimentões) (?:vermelhos?|amarelos?|verdes?)", "Pimentão"),
    (r"pimentão|pimentões", "Pimentão"), (r"abobrinhas?", "Abobrinha"), (r"berinjelas?", "Berinjela"), (r"pepinos?", "Pepino"),
    (r"mangas?", "Manga"), (r"abacaxis?", "Abacaxi"), (r"mamões?|mamão", "Mamão"), (r"bananas?", "Banana"),
    (r"maçãs?", "Maçã"), (r"laranjas?", "Laranja"), (r"limões|limão", "Limão"), (r"ovos?", "Ovos"),
    (r"gemas?", "Gemas"), (r"pães franceses", "Pão francês"), (r"maracujás?", "Maracujá"),
]

def base_name(rest):
    """Separa 'cebolas médias fatiadas' em ('Cebola', 'médias fatiadas')."""
    low = rest.lower()
    for pat, name in BASE:
        m = re.match(rf"^({pat})(?=\s|,|$)\s*(.*)$", low)
        if m:
            extra = rest[m.end(1):].strip(" ,")
            color = re.match(r"(?:pimentão|pimentões) (vermelhos?|amarelos?|verdes?)", low)
            if color:
                extra = (color.group(1) + (" " + extra if extra else "")).strip()
            return name, extra or None
    return rest[0].upper() + rest[1:], None

def parse_ing(raw, group):
    s = raw.lstrip("- ").strip()
    out = {"name": None, "qty": None, "unit": None, "note": None, "group": group}
    low = s.lower()
    # itens "a gosto" / "para decorar/fritar" sem quantidade
    if re.search(r"\ba gosto\b", low) and not re.match(NUM, s):
        out.update(name=re.sub(r"\s*a gosto.*$", "", s, flags=re.I), note="a gosto")
        return out
    m = re.match(rf"^(suco|raspas|polpa) de {NUM}\s+(\w+)(.*)$", s, flags=re.I)
    if m:
        kind, q, fruit, rest = m.group(1).lower(), num(m.group(2)), m.group(3), m.group(4).strip(" ,")
        name, _ = base_name(fruit)
        note = {"suco": "para o suco", "raspas": "para as raspas", "polpa": "a polpa"}[kind]
        out.update(name=name, qty=q, unit="un", note=(note + (f"; {rest}" if rest else "")))
        return out
    m = re.match(rf"^{NUM}\s+medidas? da lata de leite$", s)
    if m:
        out.update(name="Leite", qty=round(num(m.group(1)) * 395), unit="ml", note=f"{m.group(1)} medidas da lata")
        return out
    m = re.match(rf"^{NUM}\s+(.*)$", s)
    if not m:
        note = "a gosto" if re.search(r"para (decorar|fritar)|conforme", low) or s.lower().startswith("folhas") else None
        nm = s[0].upper() + s[1:]
        mp = re.match(r"^(.+?) (para .+)$", nm)
        if mp:
            nm, note = mp.group(1), mp.group(2)
        out.update(name=nm, note=note)
        return out
    q, rest = num(m.group(1)), m.group(2).strip()
    unit = None
    for pat, u in UNITS:
        mu = re.match(rf"^({pat})(?=\s|$)\s*(?:d[eoa]s?\s+)?(.*)$", rest, flags=re.I)
        if mu:
            unit, rest = u, mu.group(2).strip()
            break
    # nota: parênteses e trechos depois de vírgula
    note = None
    paren = re.search(r"\(([^)]*)\)", rest)
    if paren:
        note = paren.group(1)
        rest = (rest[: paren.start()] + rest[paren.end():]).strip()
    if ", " in rest:
        rest, extra = rest.split(", ", 1)
        note = ", ".join(x for x in [note, extra.strip()] if x)
    m_ap = re.match(r"^(.+?) de aproximadamente (.+)$", rest)
    if m_ap:
        rest = m_ap.group(1)
        note = ", ".join(x for x in [f"aprox. {m_ap.group(2)}", note] if x)
    m_ou = re.match(r"^(.+?) ou (1 .+)$", rest)
    if m_ou:
        rest = m_ou.group(1)
        note = ", ".join(x for x in [f"ou {m_ou.group(2)}", note] if x)
    if unit is None:
        unit = "un"
        name, extra = base_name(rest)
        note = ", ".join(x for x in [extra, note] if x) or None
    elif unit == "dente":
        name = "Alho"
    else:
        name, extra = base_name(rest) if unit in ("kg", "g") else (rest[0].upper() + rest[1:], None)
        note = ", ".join(x for x in [extra, note] if x) or None
    name = name.strip()
    m_para = re.match(r"^(.+?) (para .+)$", name)
    if m_para:
        name, note = m_para.group(1), ", ".join(x for x in [m_para.group(2), note] if x)
    m_st = re.match(r"^(Manteiga|Chocolate|Leite) (gelada|derretida|sem sal|para .+)$", name)
    if m_st:
        name, note = m_st.group(1), ", ".join(x for x in [m_st.group(2), note] if x)
    if name.startswith("Pão próprio"):
        name, note = "Pão para rabanada", "ou 6 pães franceses amanhecidos"
    out.update(name=name.strip(), qty=round(q, 3), unit=unit, note=note)
    return out

GROUP = re.compile(r"^(Ingredientes(?: d[aoe]s? (.+))?|Para (?:o |a |as |os )?(.+)|Cobertura)$")

def parse_block(b):
    yield_text, ings, steps, group, mode = None, [], [], None, None
    for l in b:
        if not l or re.match(r"^[\w.-]+\.(com|br|net|nl|de|it|hu|app|co\.za|fr)(\.\w+)?$", l) or l.isdigit():
            continue
        if l.startswith("Referências"):
            break
        if l.startswith("Rendimento-base:"):
            yield_text = l.split(":", 1)[1].strip().rstrip(".")
            continue
        if l == "Modo de preparo":
            mode = "steps"
            continue
        g = GROUP.match(l)
        if g and mode != "steps":
            mode = "ing"
            label = g.group(2) or g.group(3) or ("Cobertura" if l == "Cobertura" else None)
            group = label[0].upper() + label[1:] if label else None
            continue
        if mode == "ing" and l.startswith("-"):
            ings.append(parse_ing(l, group))
        elif mode == "steps":
            m = re.match(r"^\d+\.\s+(.*)$", l)
            if m:
                steps.append(m.group(1))
    return yield_text, ings, steps

def portions(y):
    # Faixa "6 a 8 pessoas": usa o limite de cima (a ceia tem outros pratos; evita desperdício)
    rng = re.match(r"^(\d+) a (\d+)", y)
    n = [int(x) for x in re.findall(r"\d+", y)]
    if rng:
        return int(rng.group(2))
    if "pessoas" in y:
        return n[0]
    if "unidades" in y:            # bolinhos: ~3 por pessoa
        return max(1, round(n[0] / 3))
    return n[0]                    # fatias / pedaços

report = []
for sl, b in blocks.items():
    r = by_slug[sl]
    y, ings, steps = parse_block(b)
    assert y and ings and steps, (sl, y, len(ings), len(steps))
    old = r["yieldText"]
    mv = re.match(r"^((?:Travessa|Forma|Assadeira)[^(]*)", old)
    if mv:
        r["vessel"] = mv.group(1).strip()
    r["yieldText"] = y
    r["basePortions"] = portions(y)
    r["ingredients"] = ings
    r["method"] = " ".join(steps)
    r["status"] = "rascunho"
    det = det_s if r["kind"] == "salgado" else det_d
    det[r["id"]]["steps"] = steps
    report.append((r["id"], r["basePortions"], [(i["name"], i["qty"], i["unit"], i["note"], i["group"]) for i in ings]))

det_s["pao-recheado-com-queijo-e-ervas"].update(prep="40 min + 1h30 de fermentação", cook="25 a 30 min")
det_s["carne-assada-ao-molho-madeira"].update(cook="50 min a 1h na pressão (ou 2h em panela comum)")
det_s["salada-de-grao-de-bico"]["tips"] = ["400 g de grão-de-bico seco rendem cerca de 900 g cozido.", "Fica ainda melhor no dia seguinte."]
det_s["pernil-suino-assado"]["tips"] = ["Com osso ou sem osso funciona; sem osso fica mais fácil de fatiar.", "Use termômetro em vez de deixar mais tempo no forno."]
json.dump(recipes, open(f"{APP}/src/data/recipes.json", "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
json.dump(det_s, open(f"{APP}/src/data/details-salgados.json", "w", encoding="utf-8"), ensure_ascii=False, indent=0)
json.dump(det_d, open(f"{APP}/src/data/details-sobremesas.json", "w", encoding="utf-8"), ensure_ascii=False, indent=0)
for rid, p, ings in report:
    print(f"\n## {rid} ({p})")
    for i in ings:
        print("  ", i)
