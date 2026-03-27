# Plano: Correção de Erros do Sistema

## Resumo da Análise

Análise profunda do sistema identificou **3 bugs críticos**, **3 bugs médios** e **5 melhorias menores**.

---

## Bugs Críticos (devem ser corrigidos)

### 1. Import path quebrado em `mail-sync.ts`
- **Arquivo:** `src/server/lib/mail-sync.ts:7`
- **Problema:** `import { decryptSecret } from '../../lib/crypto'` resolve para `src/lib/crypto` que NÃO existe
- **Correção:** Trocar para `'./crypto'` (mesmo diretório)

### 2. Dependência `html-to-text` não instalada
- **Arquivos:** `src/server/lib/html-to-text.ts:2`, `src/server/routes/mail/send.ts:11`
- **Problema:** O pacote `html-to-text` é importado mas não está em `package.json`. Tem `@ts-ignore` mascarando. Vai crashar em runtime ao enviar emails com HTML
- **Correção:** `npm install html-to-text` e remover o `@ts-ignore`

### 3. `favicon.svg` inexistente
- **Arquivo:** `index.html:7` referencia `/favicon.svg`
- **Problema:** Não existe diretório `public/` nem arquivo `favicon.svg`. 404 em todos os ambientes
- **Correção:** Criar `public/favicon.svg` com um ícone SVG simples

---

## Bugs Médios

### 4. Script `verify-tables.ts` completamente quebrado
- **Arquivo:** `scripts/verify-tables.ts:4,8`
- **Problema:** Usa `DIRECT_URL` (não documentado) e a query SQL é atribuída a string ao invés de executada via `client.query()`
- **Correção:** Trocar `DIRECT_URL` por `DATABASE_URL` e usar `client\`...\`` para executar a query

### 5. Porta padrão inconsistente
- **Arquivos:** `src/server/index.ts:31` defaulta para `3001`, mas `.env.example` e `CLAUDE.md` documentam `9001`
- **Correção:** Alinhar o default no código para `9001`

### 6. Vars de ambiente não documentadas
- **8 variáveis** usadas no server mas ausentes do `.env.example`: `ENABLE_MAIL_SERVER`, `MESSAGE_RETENTION_DAYS`, `WEBHOOK_LOG_RETENTION_DAYS`, `DNS_SERVERS`, `HETZNER_STORAGE_PATH`, `SYSTEM_STORAGE_PATH`, `MAIL_STORAGE_PATH`, `BASE_URL`
- **Correção:** Adicionar ao `.env.example`

---

## Melhorias Menores

### 7. Dead pages não usadas
- `src/pages/Dashboard.tsx` — não importada em nenhum lugar
- `src/pages/admin/DomainsPage.tsx` — substituída por `DomainsTab.tsx`
- **Ação:** Remover ou manter comentadas

### 8. Redirecionamentos de auth com hard navigation
- Todos os guards em `main.tsx` usam `window.location.href` causando reload completo
- **Ação:** Considerar usar wouter's `setLocation()` (baixa prioridade)

### 9. `useKeyboardShortcuts` re-registra listener a cada keystroke
- `keyTimeout` no dependency array do useEffect causa re-registro desnecessário
- **Ação:** Usar ref para o timeout

### 10. Paths desnecessários no Tailwind config
- `./app/**` e `./pages/**`, `./components/**` são redundantes com `./src/**`
- **Ação:** Limpar

### 11. Scripts de diagnóstico com IDs hardcoded
- `check-supabase-auth.ts` e `check-auth-user.ts` têm user IDs fixos
- **Ação:** Aceitar como parâmetro CLI ou remover
