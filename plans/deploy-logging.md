# Plano: Deploy Logging + Correção do Pipeline de Deploy

## Diagnóstico: Por que o deploy não reflete mudanças

### Problema Principal: Mudanças locais NÃO estão no `main`

```
$ git status --short
 M package-lock.json
 M package.json
 M src/components/mail/RichTextEditor.tsx
 M src/index.css
 M src/pages/Login.tsx
 M src/pages/mail/ComposePage.tsx
 M src/server/index.ts
 M src/server/lib/html-to-text.ts
 M src/server/lib/mail-sync.ts
 M src/server/lib/mail.ts
 M tsconfig.tsbuildinfo
 M vite.config.ts
```

**Todas as mudanças estão sem commit.** O GitHub Actions só dispara em push para `main`. Se nada é feito push, o deploy nunca atualiza.

### Problemas Secundários no Pipeline

1. **Sem health check pós-deploy** — `docker run -d` retorna sucesso mesmo se o container crashar em seguida
2. **Sem build logs estruturados** — Falha silenciosa não é detectável
3. **Sem `--no-cache` no build** — Docker pode usar cache de layers antigos
4. **Sem variável de versão** — Impossível verificar qual código está rodando no servidor
5. **Env vars faltando** — `MAIL_HOST`, `APP_COMPANY_NAME`, `APP_APPLICATION_NAME` não são passados no deploy
6. **Sem rollback automático** — Se o deploy falhar, o servidor fica offline

---

## Plano de Implementação

### Fase 1: Corrigir o Pipeline de Deploy (GitHub Actions)

**Arquivo:** `.github/workflows/deploy-hetzner.yml`

1. **Adicionar `--no-cache` ao `docker build`** — Garante build limpo
2. **Adicionar variáveis de versão** — `DEPLOY_VERSION` (commit SHA curto), `DEPLOYED_AT` (timestamp)
3. **Adicionar health check pós-deploy** — Verificar `/api/health` após `docker run`, com retry
4. **Adicionar verificação do container** — Checar se container está rodando após deploy
5. **Adicionar rollback automático** — Se health check falhar, reverter para imagem anterior
6. **Adicionar log estruturado** — `::group::`/`::endgroup::` para organizar logs
7. **Adicionar job summary** — `$GITHUB_STEP_SUMMARY` com tabela de status do deploy
8. **Adicionar env vars faltantes** — `MAIL_HOST`, `APP_COMPANY_NAME`, `APP_APPLICATION_NAME`
9. **Adicionar `rm -rf dist` antes do build** — Limpar build antigo no Docker
10. **Salvar imagem anterior para rollback** — Renomear `skaleclub-mail:latest` para `skaleclub-mail:previous` antes do deploy

### Fase 2: Adicionar Versionamento no Servidor

**Arquivos:** `src/server/index.ts`, `src/server/routes/system.ts`

1. **Endpoint `/api/health` melhorado** — Retornar `version` (commit SHA), `deployedAt`, `uptime`, `memory`
2. **Endpoint `/api/deploy/info`** — Retornar informações do deploy atual (versão, timestamp, uptime)

### Fase 3: Adicionar Deploy Info no Frontend Admin

**Arquivos:** `src/components/admin/AdminLayout.tsx` (ou footer existente)

1. **Mostrar versão do deploy** no footer — "v1.2.3abc • deployed 2h ago"
2. **Link para ver logs** — Link para o GitHub Actions run correspondente

### Fase 4: Dockerfile Melhorias

**Arquivo:** `Dockerfile`

1. **Adicionar `HEALTHCHECK`** — Docker nativo para monitorar o container
2. **Adicionar `rm -rf dist` antes do build** — Limpar artefatos antigos
3. **Multi-stage build** (opcional) — Reduzir tamanho da imagem

---

## Estrutura do Novo Workflow

```
┌─────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Checkout   │───▶│  Build Image │───▶│  Deploy SSH  │───▶│ Health Check │
│  (git pull) │    │  (--no-cache)│    │  (stop+run)  │    │  (curl /api) │
└─────────────┘    └──────────────┘    └──────────────┘    └──────┬───────┘
                                                                │
                                                    ┌───────────┴──────────┐
                                                    ▼                      ▼
                                              ✅ Success              ❌ Failed
                                              Summary                Rollback
                                              Notify                 Summary
                                                                     Notify
```
