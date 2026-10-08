# Security Checklist — gg-dashboard

> Pendências de segurança que **só podem ser feitas no painel do Supabase** (fora do código).
> O código já foi corrigido em 07/10/2026: nenhuma senha em `core.js` nem nas 19 páginas HTML.
> **Status:** [PENDENTE] — requer acesso interativo ao Supabase.

---

## Issue 1 — Rotacionar as senhas expostas

**Problema:** as senhas de `admin`, `analista` e `viewer` ficaram em texto claro em `core.js` e
nas páginas HTML. `core.js` é um arquivo versionado no repositório **público**
`github.com/bernardovalentim7/GG` — ou seja, as senhas continuam legíveis no histórico do git
mesmo depois da correção. **Remover do working tree não rotaciona nada.**

**Ação:** trocar as 3 senhas no Supabase Auth.

- [ ] Abrir https://supabase.com → projeto `nebmrxdutifnwuxebknc`
- [ ] `Authentication` → `Users`
- [ ] Para cada um dos 3 usuários — os e-mails são `admin@sias.internal`,
      `analista@sias.internal` e `viewer@sias.internal` (padrão `<login>@sias.internal`,
      montado em `core.js:184`):
  - [ ] ⋯ → `Reset password` (ou definir senha nova direto)
  - [ ] Senha nova forte (16+ caracteres)
  - [ ] Guardar no gerenciador de senhas — **nunca** de volta no código
- [ ] Testar login com as 3 contas
- [ ] Marcar este item como `[CONCLUÍDO em AAAA-MM-DD]`

**[ABERTO]** Decidir se vale reescrever o histórico do git (`git filter-repo`) ou tornar o repo
privado. Só a rotação já resolve o risco prático; a reescrita é opcional e quebra clones existentes.

---

## Issue 2 — Confirmar RLS em todas as tabelas

**Problema:** `db-client.js` expõe a chave `sb_publishable_...` no cliente. Isso é o uso correto
dessa chave **desde que RLS esteja ativo** — sem RLS, qualquer visitante lê e escreve o banco inteiro
com essa chave. Não dá pra verificar isso a partir do código.

**Ação:** conferir RLS tabela por tabela.

- [ ] `Database` → `Tables` → conferir `RLS enabled` em cada uma das 17 tabelas usadas
      (extraídas das chamadas `.from(...)` em `core.js`):
      `accounts`, `app_config`, `clients`, `entries`, `exits`, `initiative_krs`, `initiatives`,
      `mvv`, `mvv_values`, `okr_krs`, `okr_objectives`, `partners`, `pest_items`, `risk_notes`,
      `squads`, `swot_items`, `team_members`
- [ ] Rodar no SQL Editor para pegar qualquer tabela esquecida:
      ```sql
      SELECT tablename, rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY rowsecurity, tablename;
      ```
- [ ] Para cada tabela com RLS ativo, garantir que existe policy — RLS ativo **sem policy
      nenhuma bloqueia tudo**, inclusive o app:
      ```sql
      SELECT tablename, policyname, cmd, qual, with_check
      FROM pg_policies
      WHERE schemaname = 'public'
      ORDER BY tablename;
      ```
- [ ] Testar o app logado como `viewer` e como `admin` depois de ativar

**[ABERTO]** O modelo de permissão por nível (`level` 1/2/3 em `core.js`) hoje é só checagem no
front-end. Definir como isso vira policy no Postgres — provavelmente uma tabela `profiles` ligada a
`auth.uid()` com a coluna `level`, já que o JWT do Supabase não carrega esse campo sozinho.

---

## Quando terminar

1. Trocar `[PENDENTE]` por `[CONCLUÍDO em AAAA-MM-DD]` no topo
2. Remover os `[ABERTO]` correspondentes de `CLAUDE.md` (seção Estado)
3. Registrar em `~/Claude/01-grupo-gestao/memoria/06-decisoes.md`

*[Claude — 2026-10-07]*
