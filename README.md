# CEIA FÁCIL — Natal Fácil: Ceia Econômica e Receitas

App web que planeja a ceia de Natal do começo ao fim: o cliente escolhe os pratos, informa quantos convidados vêm e recebe **as receitas com a quantidade certa** e a **lista de compras pronta**, separada por setor do mercado.

Produto digital de baixo valor (low ticket), vendido pela **Kiwify** por **R$ 28,99**, com acesso liberado automaticamente após o pagamento.

---

## 1. O que o app faz

| Área | O que o cliente encontra |
|---|---|
| **Pratos salgados** | 36 receitas (carnes, arrozes, farofas, saladas, entradas) com foto, ingredientes, modo de preparo, dicas, substituições e conservação |
| **Sobremesas** (bônus) | 22 receitas: pavês, pudins, mousses, tortas, rabanadas… |
| **Bebidas** (bônus) | 20 bebidas (espumante, vinhos, refrigerantes 2 L, água em jarras, sucos, drinks), com quantas garrafas/jarras comprar e receitas de drinks e sucos |
| **Convidados** | Controle no topo de cada receita (2 a 50+ pessoas). Tudo recalcula na hora, em medidas de cozinha (xícaras, colheres, unidades) e com o peso de compra no mercado |
| **Formas e fornadas** | Avisa quando a receita precisa de mais de uma forma/peça (ex.: “2 peças de pernil de 3 kg”) |
| **Combina com** | Sugestões de harmonização entre pratos e bebidas |
| **Minha Ceia** | Os pratos escolhidos, com a porção de cada um |
| **Lista de compras** | Todos os ingredientes somados, por setor do mercado; marcar como comprado, editar, remover, adicionar item, copiar/compartilhar, imprimir/PDF |
| **Segurança alimentar** | Avisos de cozimento e conservação de carnes e itens perecíveis |

A ceia e a lista ficam salvas no próprio aparelho do cliente.

---

## 2. Por onde vendemos (fluxo completo)

```
Anúncio (Instagram/Facebook)
        │
        ▼
Página de vendas ──────────────►  https://ceia-natal-beta.vercel.app/oferta
        │  botão "Quero minha ceia"
        ▼
Checkout Kiwify (R$ 28,99) ────►  https://pay.kiwify.com.br/HAtUPH1
        │  pagamento aprovado (Pix ou cartão)
        ▼
Webhook Kiwify ────────────────►  Supabase: função payment-webhook
        │  1. confere a assinatura da Kiwify (token)
        │  2. registra a compra (sem duplicar)
        │  3. libera o acesso para o e-mail do comprador
        │  4. envia o e-mail “Sua compra do CEIA FÁCIL foi aprovada!”
        ▼
Cliente abre o app ────────────►  https://ceia-natal-beta.vercel.app/
        │  “Primeiro acesso”: cria a senha com o e-mail da compra
        ▼
Acesso às receitas, bebidas e lista de compras
```

- **Reembolso ou chargeback** na Kiwify bloqueiam o acesso automaticamente.
- **Só quem comprou consegue criar senha.** O banco recusa o cadastro de qualquer e-mail sem compra aprovada.
- Link de acesso curto cadastrado na Kiwify: `https://kiwify.app/hgzModp` (leva ao app).

### Oferta (página de vendas)
- Receitas salgadas + lista de compras: ~~R$ 60~~ **R$ 28,99**
- Bônus 1 — Cardápio de Sobremesas: ~~R$ 20~~ **grátis hoje**
- Bônus 2 — Cardápio de Bebidas: ~~R$ 20~~ **grátis hoje**
- Contagem regressiva até a meia-noite (horário de quem está vendo), garantia de 7 dias, perguntas frequentes e botão “Já comprei? Entrar”.

### Materiais de divulgação
- Banner e imagem do produto do checkout: `public/checkout/`
- 3 criativos em foto (feed 1080×1350 e stories 1080×1920) e roteiros de 3 vídeos — entregues fora do repositório.
- Tráfego recomendado: Meta Ads (Instagram + Facebook). Custo máximo por venda para não ter prejuízo: cerca de R$ 24.

---

## 3. Tecnologia

| Parte | Ferramenta |
|---|---|
| App e página de vendas | Vite + React 19 + TypeScript + Tailwind CSS 4, hospedado na **Vercel** (deploy automático a cada commit no `main`) |
| Login e banco de dados | **Supabase** (Auth + Postgres com RLS + Edge Function) |
| Pagamento | **Kiwify** (checkout + webhook) |
| E-mail de compra aprovada | Gmail `sacceianatalina@gmail.com` (SMTP com senha de app) |

### Estrutura

| Pasta / arquivo | O que tem |
|---|---|
| `src/data/` | 58 receitas (`recipes.json`), fichas completas (`details-*.json`), bebidas e receitas de bebidas |
| `src/engine/` | Motor de cálculo: escala por convidados, unidades práticas e peso de compra, formas/fornadas, harmonização, lista de compras + testes |
| `src/lib/auth.tsx` | Login, cadastro, recuperação de senha e checagem de acesso pago (Supabase REST) |
| `src/components/AccessGate.tsx` | Tela de login com foto; bloqueia o app para quem não comprou |
| `src/pages/` | Telas do app |
| `public/fotos/` | 78 fotos dos pratos e bebidas |
| `public/oferta/index.html` | Página de vendas publicada em `/oferta` |
| `landing/` | Cópia da página de vendas para hospedar como site separado (opcional) |
| `public/checkout/` | Banner e imagem do produto usados na Kiwify |
| `supabase/migrations/` | `0001` tabelas e RLS · `0002` acesso por e-mail da compra · `0003` cadastro só para quem comprou |
| `supabase/seed.sql` | Catálogo de receitas para o banco |
| `supabase/functions/payment-webhook/` | Webhook da Kiwify (assinatura, idempotência, liberação/bloqueio, e-mail) |

---

## 4. Configuração (já feita em produção)

**Vercel — variáveis de ambiente**
- `VITE_SUPABASE_URL` — URL do projeto Supabase
- `VITE_SUPABASE_ANON_KEY` — chave pública (anon) do Supabase

**Supabase — segredos da função `payment-webhook`** (Edge Functions → Secrets)
- `KIWIFY_TOKEN` — token do webhook “Liberar acesso app ceia” na Kiwify
- `GMAIL_USER` — `sacceianatalina@gmail.com`
- `GMAIL_APP_PASSWORD` — senha de app do Google (gerada em myaccount.google.com/apppasswords)
- A função roda com **Verify JWT desligado** (a Kiwify não envia JWT; a segurança é a assinatura).

**Supabase — Authentication**
- “Confirm email” desligado (o cliente cria a senha e entra na hora).
- Conta de teste com acesso liberado: `teste@gmail.com` (senha com o responsável do projeto).

**Kiwify**
- Produto “CEIA NATALINA ECONOMICA”, R$ 28,99, página de vendas `…/oferta`.
- Webhook “Liberar acesso app ceia” → `https://<projeto>.supabase.co/functions/v1/payment-webhook`, eventos: Compra aprovada, Reembolso, Chargeback.

> Nunca coloque tokens, senhas ou a chave `service_role` neste repositório.

---

## 5. Operação do dia a dia

Tudo no **Supabase → SQL Editor**:

```sql
-- Liberar alguém manualmente (venda por fora, cortesia)
insert into public.entitlements (email, product_id, status)
values ('cliente@email.com', 'ceia-facil-2026', 'active')
on conflict (email, product_id) do update set status = 'active', updated_at = now();

-- Bloquear alguém
update public.entitlements set status = 'revoked', updated_at = now()
where email = 'cliente@email.com';

-- Ver as últimas compras recebidas da Kiwify
select provider_event_id, event_type, email, processed_at
from public.payment_events order by processed_at desc nulls first limit 20;
```

Logs do webhook: Supabase → Edge Functions → `payment-webhook` → **Logs** (mostra “email compra aprovada: enviado” a cada venda).

---

## 6. Desenvolvimento

```bash
npm install
npm run dev     # desenvolvimento
npm test        # testes do motor de cálculo
npm run build   # produção (dist/)
```

## 7. Pendências

- Concluir o cadastro da conta na Kiwify (Finanças → Identidade) para o checkout aceitar pagamentos.
- Fazer uma compra real de teste no Pix para validar o fluxo com um comprador de verdade.
- Revisão culinária das fichas (quantidades e tempos ainda não testados em cozinha).
- Padronizar o nome da marca: a logo diz “Natal Fácil”; o app e a página usam “ceia.fácil”.
