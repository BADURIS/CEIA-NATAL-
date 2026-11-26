# ceia.fácil — Sua ceia, do seu jeito.

App web para montar a ceia de Natal: escolha pratos, sobremesas e bebidas, informe os convidados e receba receitas recalculadas e a lista de compras consolidada.

> Conteúdo em **rascunho**: quantidades, tempos e fichas ainda não foram testados em cozinha.

## Rodar

```bash
npm install
npm run dev      # desenvolvimento
npm test         # testes do motor de cálculo
npm run build    # produção (dist/)
```

## Estrutura

| Pasta | O que tem |
|---|---|
| `src/data/` | 58 receitas (`recipes.json`), fichas completas (`details-*.json`), bebidas e fichas de bebidas |
| `src/engine/` | Motor de cálculo: escala (`scale.ts`), unidades práticas e peso de compra (`units.ts`), formas, harmonização e segurança (`plan.ts`), lista (`shopping.ts`) + testes |
| `src/store/` | Estado da ceia (salvo no aparelho) |
| `src/pages/`, `src/components/` | Interface |
| `supabase/migrations/` | Tabelas, RLS e regras de acesso |
| `supabase/seed.sql` | Catálogo para o banco — gerar com `npx tsx scripts/make-seed.ts` |
| `supabase/functions/payment-webhook/` | Webhook de pagamento genérico, idempotente |
| `public/fotos/` | Fotos das receitas: `<id-da-receita>.webp` |

## Publicar

- **Vercel:** importar o projeto; framework Vite, build `npm run build`, saída `dist`.
- **Supabase:** `supabase db push` (migrações) e `psql -f supabase/seed.sql`.
- **Pagamento:** ao escolher o checkout, implementar o adaptador em `payment-webhook/index.ts`,
  definir `WEBHOOK_SECRET` e apontar o webhook do provedor para
  `https://<projeto>.supabase.co/functions/v1/payment-webhook?provider=<nome>`.
  O acesso só é liberado por evento de pagamento aprovado validado no servidor.

## Acesso pago (Kiwify + Supabase)

- Só entra no app quem fez login com o **e-mail de uma compra aprovada**. A página inicial continua pública.
- Variáveis na Vercel: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` e `VITE_CHECKOUT_URL` (link de pagamento). Sem as duas primeiras, o app mostra "Acesso em configuração".
- Banco: rodar `supabase/migrations/0001_schema.sql`, `0002_acesso_kiwify.sql` e `supabase/seed.sql` no SQL Editor.
- Webhook: função `payment-webhook` (Verify JWT desligado), segredo `KIWIFY_TOKEN` = token do webhook da Kiwify. URL: `https://<projeto>.supabase.co/functions/v1/payment-webhook`, eventos compra aprovada, reembolso e chargeback.
- Liberar/bloquear alguém à mão: ver comentários no fim de `0002_acesso_kiwify.sql`.

## Pendências conhecidas

- Login no app (Supabase Auth) e sincronização da ceia com a conta: o banco e as regras já estão prontos; falta ligar a interface quando o checkout for escolhido.
- Fotos: geradas por IA a partir de `ceia-facil-prompts-fotos-IA.md`.
- Revisão culinária das fichas.
