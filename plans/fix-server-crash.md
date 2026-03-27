# Plano: Correção do Crash do Servidor

## Diagnóstico Confirmado

O servidor crasha no boot por causa de **1 import quebrado** em `mail-sync.ts`, introduzido no commit `773bd47`.

### Causa Raiz

No commit `773bd47` ("fix: critical email send/receive bugs"), a função `decrypt` foi renomeada para `decryptSecret` em `src/server/lib/crypto.ts`. A refatoração atualizou os imports em vários arquivos, mas **errou o path em `mail-sync.ts`**:

| Arquivo | Path relativo | Resolve para | Status |
|---------|--------------|-------------|--------|
| `lib/mail.ts` | `'./crypto'` | `src/server/lib/crypto.ts` | ✅ (corrigido) |
| `lib/mail-sync.ts` | `'../../lib/crypto'` | `src/lib/crypto.ts` | ❌ (NÃO corrigido) |
| `routes/mail/send.ts` | `'../../lib/crypto'` | `src/server/lib/crypto.ts` | ✅ (corrigido) |
| `routes/mail/mailboxes.ts` | `'../../lib/crypto'` | `src/server/lib/crypto.ts` | ✅ (corrigido) |
| `routes/outreach/email-accounts.ts` | `'../../lib/crypto'` | `src/server/lib/crypto.ts` | ✅ (já estava correto) |

**Por que crasha:** `mail-sync.ts` está em `src/server/lib/`. O path `../../lib/crypto` sobe 2 níveis até `src/` e resolve para `src/lib/crypto.ts` (arquivo diferente que exporta `encrypt`/`decrypt`, não `encryptSecret`/`decryptSecret`). O Node lança `SyntaxError: Named export 'decryptSecret' not found`.

**Por que funcionava antes:** Antes do commit, importava `{ decrypt }` de `../../lib/crypto` que resolvia para `src/lib/crypto.ts` que exportava `decrypt` — funcionava.

### Cadeia de crash

```
server/index.ts (boot)
  → import mailRoutes from './routes/mail'
    → import syncRoutes from './sync'
      → import { syncMailbox } from '../../lib/mail-sync'
        → import { decryptSecret } from '../../lib/crypto'  ❌ CRASH
```

---

## Correções

### 1. Fix: `src/server/lib/mail-sync.ts` linha 7

**Atual:**
```typescript
import { decryptSecret } from '../../lib/crypto'
```

**Correto:**
```typescript
import { decryptSecret } from './crypto'
```

### 2. Instalar dependência `html-to-text`

O pacote `html-to-text` é usado em `src/server/lib/html-to-text.ts` mas não está em `package.json`. Atualmente funciona como dependência transitiva de `mailparser`, mas pode quebrar a qualquer momento.

- Remover `// @ts-ignore` da linha 1 de `src/server/lib/html-to-text.ts`
- Adicionar `"html-to-text": "^9.0.5"` às dependências em `package.json`

### 3. Corrigir porta padrão do servidor

`src/server/index.ts:31` usa `3001` como padrão, mas toda a documentação (`CLAUDE.md`, `.env.example`) diz `9001`.

**Atual:**
```typescript
const PORT = process.env.PORT || 3001
```

**Correto:**
```typescript
const PORT = process.env.PORT || 9001
```

---

## Validação

Após as correções:
1. `npm run dev:server` deve iniciar sem erros
2. `GET /api/system/branding` deve retornar 200
3. `GET /health` deve retornar `{ status: 'ok' }`
