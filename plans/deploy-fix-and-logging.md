# Plano: Correção do Deploy + Pipeline Robusto

## Diagnóstico Completo

### Por que deploys anteriores "sucederam" mas não refletiram mudanças

**Causa raiz: `appleboy/ssh-action` mascara falhas do `docker build`.**

O workflow executa todo o script SSH como um bloco único:
```bash
git pull → docker build → docker stop → docker rm → docker run
```

Quando `docker build` falha (ex: erro TypeScript), o script continua e executa `docker stop` + `docker rm` que **destroem o container antigo funcionando**. Depois `docker run` nunca executa (não há imagem nova). Resultado: **servidor fica offline** e o GitHub Actions mostra ✅ sucesso.

**Últimos 5 deploys consecutivos falharam assim** (confirmado via `gh run list`).

### Erros TypeScript que bloqueiam o build

1. **`src/server/routes/mail/send.ts:253`** — `userId: recipientUserId` passa objeto `{ userId: string }` onde se espera `string`. Deveria ser `userId: recipientUserId.userId`.

2. **`src/server/lib/html-to-text.ts:1`** — Falta declaração de tipo para `html-to-text`. Precisa instalar `@types/html-to-text` ou adicionar declaração.

---

## Correções a Implementar

### 1. Corrigir erro TypeScript em `send.ts:253`
```typescript
// Antes (erro)
localRecipients.push({ email: addr, userId: recipientUserId })

// Depois (correto)
localRecipients.push({ email: addr, userId: recipientUserId.userId })
```

### 2. Corrigir erro de tipo do `html-to-text`
Instalar `@types/html-to-text` como devDependency.

### 3. Reescrever o workflow de deploy com:
- **`set -euo pipefail`** — Falhar imediatamente em qualquer erro
- **Separar build e deploy** — Build primeiro, só parar container antigo se build sucedeu
- **Salvar imagem anterior** — Renomear `latest` para `previous` antes do build
- **Health check pós-deploy** — Verificar `/api/health` com retry
- **Rollback automático** — Se health check falhar, reverter para imagem anterior
- **Versionamento** — Passar `DEPLOY_VERSION` (commit SHA curto) e `DEPLOYED_AT`
- **Job summary** — Tabela com status do deploy no GitHub
- **Env vars faltantes** — `MAIL_HOST`, `APP_COMPANY_NAME`, `APP_APPLICATION_NAME`
- **Log estruturado** — `::group::`/`::endgroup::` para organizar output

### 4. Melhorar endpoint `/api/health`
Retornar `version`, `deployedAt`, `uptime`, `memory` para verificar qual código está rodando.
