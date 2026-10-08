# gg-dashboard

> Pré-prompt do projeto (camada 2). Carregado em toda sessão aberta aqui dentro. Máx. ~800 tokens.
> Estrutura-modelo: `~/Claude/03-templates/skeletons/_projeto-modelo/CLAUDE.md`.

## O que é
Dashboard de gestão do Grupo Gestão / SIAS: financeiro (DRE, entradas, saídas, custos),
clientes, parceiros, equipe, OKRs/metas, iniciativas, riscos, MVV e plano.
Multi-página HTML estático, uma página por área, servido na Vercel (projeto `gg-sias`).

## Intenção
Dar à liderança um painel único e sempre atualizado para decisão — sem planilha paralela.
Prioridade é **dado correto e carregamento rápido**, não sofisticação de frontend.

## Stack
| Camada | Escolha |
| --- | --- |
| Linguagem / runtime | HTML + CSS + JavaScript puro (sem build, sem bundler) |
| Framework | nenhum — `core.js` compartilhado por todas as páginas |
| Banco / storage | Supabase (`db-client.js`, mapeamento em `db-map.js`) |
| Deploy | Vercel (`.vercel/project.json` → `gg-sias`); repo `bernardovalentim7/GG` |
| Testes | nenhum ainda — **[ABERTO]** |

## Comandos
```bash
# dev: servir estático na raiz do projeto
python3 -m http.server 8000     # abre http://localhost:8000/index.html
# deploy
vercel --prod
```

## Regras deste projeto
- Sem build step. Não introduzir bundler, framework ou `package.json` sem combinar antes.
- Toda página nova reaproveita `core.js` e `styles.css`. Nada de CSS/JS duplicado por página.
- Acesso a dados **só** via `db-client.js` / `db-map.js` — não espalhar chamada Supabase pelas páginas.
- Segredo nenhum no cliente além da chave publishable do Supabase (`db-client.js`). Senha de
  usuário nunca entra em `core.js`, HTML ou tela de login — autenticação é só Supabase Auth.
- Mudança cirúrgica: uma página/um bug por vez; não "melhorar" markup adjacente.
- Teste existente é intocável: não apagar nem desabilitar sem permissão explícita.

## Estrutura
| Arquivo / pasta | Conteúdo |
| --- | --- |
| `index.html` | entrada / login |
| `*.html` (19) | uma página por área (dashboard, dre, custos, okrmetas, riscos…) |
| `core.js` | constantes, estado, helpers e modais compartilhados |
| `db-client.js`, `db-map.js` | cliente Supabase e mapeamento de tabelas |
| `styles.css`, `assets/` | estilo e logo |

## Estado
- **Agora:** migração do armazenamento local para Supabase (`db-client.js` / `db-map.js`) e
  login via Supabase Auth.
- **[SEGURANÇA — PENDENTE]:** 2 issues críticas abertas. Ver `SECURITY-CHECKLIST.md`:
  1. Rotacionar senhas (`admin`, `analista`, `viewer`) expostas no git history
  2. Ativar RLS em todas as tabelas do Supabase
- **[ABERTO]:** nenhuma suíte de testes.

*[Claude — 2026-10-07]*
