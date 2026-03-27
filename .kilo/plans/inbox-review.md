# Plano de Revisão do Inbox/Webmail

## Resumo Executivo

O sistema de webmail possui uma arquitetura dual (admin messages + user webmail) com problemas significativos: **4 bugs críticos** que quebram funcionalidades essenciais, **3 páginas inteiramente mock** sem integração com API, e **inconsistências generalizadas** no design e nos padrões do projeto.

---

## 1. Bugs Críticos (coisas que não funcionam)

### 1.1 Filtro de pasta quebrado (client ↔ server mismatch)
- **Arquivos:** `src/lib/mail-api.ts:158` e `src/server/routes/mail/messages.ts:42`
- **Problema:** O client envia `?folder=inbox` mas o server lê `req.query.folderId`. Mensagens nunca são filtradas por pasta — a listagem sempre retorna todas as mensagens do mailbox.
- **Correção:** Padronizar para `folderId` no client (UUID da pasta) para ser consistente com o schema.

### 1.2 Paginação com total incorreto
- **Arquivo:** `src/server/routes/mail/messages.ts:79-83`
- **Problema:** A resposta envia `total: messages.length` (quantidade da página atual) em vez do total real de registros. `totalPages` também é calculado incorretamente. O infinite scroll/cliente não sabe quando parar de carregar.
- **Correção:** Usar a query de count já executada (linha 69) e extrair o valor corretamente.

### 1.3 Busca (search) retorna 404 — endpoint não existe
- **Arquivos:** `src/lib/mail-api.ts:260`, `src/hooks/useMail.ts:useSearchMessages`, `src/pages/mail/SearchPage.tsx`
- **Problema:** `mailApi.searchMessages()` chama `GET /api/mail/mailboxes/:id/search?q=...` mas não existe rota no server que atenda esse path. Toda busca resulta em erro de rede.
- **Correção:** Criar endpoint de search no server (`messages.ts`) com busca por subject, from, to, body (usando `ilike` do PostgreSQL).

### 1.4 Compose não recebe reply/forward/draft via URL params
- **Arquivo:** `src/pages/mail/ComposePage.tsx`
- **Problema:** Múltiplas páginas linkam para `/mail/compose?reply=ID`, `?forward=ID`, `?draft=ID` mas o ComposePage nunca lê esses params. O usuário sempre recebe um formulário vazio ao clicar em Reply/Forward.
- **Correção:** Usar `useSearch()` do wouter para ler query params, buscar a mensagem original via `useMessage(id)`, e pré-preencher To, Subject, Body.

---

## 2. Bugs Moderados

### 2.1 Move/Batch enviam campo errado
- **Arquivos:** `src/lib/mail-api.ts:196-208` vs `src/server/routes/mail/messages.ts:328-329, 362-366`
- **Problema:** Client envia `{ folder: string }`, server espera `{ folderId: z.string().uuid() }`. Mover mensagens e operações em lote falham na validação Zod.
- **Correção:** Client deve enviar `folderId` (UUID).

### 2.2 Campo `from.address` vs `from.email`
- **Arquivo:** `src/server/routes/mail/messages.ts:130` vs `src/lib/mail-api.ts:67`
- **Problema:** Server serializa como `{ name, address }`, client espera `{ name, email }`. O campo `email` chega como `undefined`.
- **Correção:** Server deve usar `email` como key.

### 2.3 Delete sem verificação de ownership do mailbox
- **Arquivo:** `src/server/routes/mail/messages.ts:219-221`
- **Problema:** O endpoint de delete faz soft-delete verificando apenas `eq(mailMessages.id, messageId)` sem verificar `eq(mailMessages.mailboxId, mailboxId)`.
- **Correção:** Adicionar `eq(mailMessages.mailboxId, mailboxId)` na cláusula where.

### 2.4 `isActiveRoute` usa `window.location.pathname` ao invés do hook do wouter
- **Arquivo:** `src/components/mail/MailLayout.tsx:67-69`
- **Problema:** Não re-renderiza em mudanças de rota. Highlight da pasta ativa pode ficar desatualizado.
- **Correção:** Usar `useLocation()` do wouter.

---

## 3. Páginas sem Integração com API (100% mock)

| Página | Arquivo | Situação |
|--------|---------|----------|
| **StarredPage** | `src/pages/mail/StarredPage.tsx` | Dados mock hardcoded. Nenhum hook React Query. Operações (star, delete) são apenas in-memory. |
| **DraftsPage** | `src/pages/mail/DraftsPage.tsx` | Dados mock hardcoded. Sem API. Link para compose com `?draft=ID` não funciona. |
| **TrashPage** | `src/pages/mail/TrashPage.tsx` | Dados mock hardcoded. Restore e empty trash são apenas in-memory. |

**Correção:** Todas devem usar `useMessages(folder)` com `folder='starred'`, `folder='drafts'`, `folder='trash'` e os hooks de mutação correspondentes. Remover mock data e fake loading.

---

## 4. Inconsistências de Design

### 4.1 Componentes mail não usam shadcn/ui
- **Situação:** Apenas `SettingsPage` usa componentes shadcn. Todas as outras páginas usam HTML raw com Tailwind.
- **Impacto:** Inconsistência visual, falta de acessibilidade.
- **Correção:** Substituir por `<Button>`, `<Input>`, `<Checkbox>`, `<DropdownMenu>`, `<Dialog>`.

### 4.2 Cores hardcoded ao invés de tokens semânticos
- **Arquivos:** `EmailThread.tsx`, `EmailDetailPage.tsx` (header), `SentPage.tsx` (detail), `SearchPage.tsx` (filters), `StarredPage.tsx`, `DraftsPage.tsx`
- **Problema:** Usam `text-gray-900`, `bg-gray-100`, `border-gray-200`, `text-blue-600` ao invés de `text-foreground`, `bg-muted`, `border-border`, `bg-primary`.
- **Correção:** Substituir por tokens semânticos do Tailwind.

### 4.3 Detalhe do email mostra apenas snippet (não o body completo)
- **Arquivos:** `InboxPage.tsx:399` (componente `EmailDetail` local), `EmailDetailView.tsx:122`
- **Problema:** O painel de detalhe exibe `email.snippet` como corpo. O `EmailItem` não tem campo `body`/`bodyHtml`.
- **Correção:** Adicionar `bodyHtml`/`bodyText` ao `EmailItem` e renderizar HTML sanitizado.

### 4.4 Navegação mobile causa reload completo
- **Arquivos:** `InboxPage.tsx:77`, `StarredPage.tsx:82`, `SentPage.tsx:51`, `SearchPage.tsx:136`
- **Problema:** Usam `window.location.href = ...` ao invés de `setLocation()` do wouter.
- **Correção:** Usar `setLocation()` do hook `useLocation()`.

### 4.5 Refresh causa reload completo
- **Arquivo:** `MailLayout.tsx:319-325`
- **Problema:** Botão de refresh usa `window.location.reload()` ao invés de React Query `refetch`.
- **Correção:** Usar `queryClient.invalidateQueries()` ou `refetch()`.

---

## 5. Melhorias Necessárias

### 5.1 Remover código duplicado
- `EmailThread.tsx:285-319` redefine `getAvatarColor()` e `getInitials()` localmente — devem importar de `src/lib/utils.ts`.

### 5.2 Remover mock data de produção
- `InboxPage.tsx` e `SentPage.tsx` fazem fallback para mock data. Devem mostrar estado vazio com CTA para configurar mailbox.
- `EmailDetailPage.tsx` tem ~120 linhas de mock data inline (linhas 25-147).

### 5.3 Auto-save de drafts
- `ComposePage` não tem auto-save periódico nem handler de `beforeunload`.

### 5.4 Image insertion no ComposePage
- `ComposePage.tsx:362-369` tem file input para imagens sem handler `onChange`.

### 5.5 SettingsPage sem React Query
- `SettingsPage.tsx` faz fetch manual com `useEffect` + `apiFetch` ao invés de React Query.

### 5.6 `EmailDetailView.tsx` é código morto
- Nunca efetivamente renderizado em nenhum fluxo ativo.

### 5.7 Navegação de volta ignora a pasta de origem
- `EmailDetailPage.tsx:242/250` sempre navega para `/mail/inbox` após delete/archive.

---

## 6. Plano de Implementação (ordem sugerida)

### Fase 1 — Corrigir bugs críticos (bloqueantes)
1. Corrigir mismatch `folder`/`folderId` no client e server
2. Corrigir paginação (total count)
3. Criar endpoint de search no server
4. Implementar leitura de reply/forward/draft params no ComposePage
5. Corrigir `from.address` → `from.email` no server
6. Corrigir `moveMessage` e `batchUpdate` field names
7. Adicionar verificação de ownership no delete

### Fase 2 — Integrar páginas mock com API
8. StarredPage: usar `useMessages('starred')` + hooks de mutação
9. DraftsPage: usar `useMessages('drafts')` + hooks de mutação
10. TrashPage: usar `useMessages('trash')` + hooks de mutação
11. Remover mock data e fake loading de todas as páginas

### Fase 3 — Corrigir inconsistências de design
12. Substituir cores hardcoded por tokens semânticos em todos os componentes mail
13. Migrar componentes HTML raw para shadcn/ui (Button, Input, Checkbox, DropdownMenu, Dialog)
14. Corrigir navegação mobile (remover `window.location.href`)
15. Corrigir `isActiveRoute` no MailLayout
16. Corrigir refresh para usar React Query

### Fase 4 — Melhorias de UX
17. Adicionar `bodyHtml`/`bodyText` ao `EmailItem` e renderizar corpo completo no detail view
18. Implementar auto-save de drafts no ComposePage
19. Corrigir navegação de volta no EmailDetailPage (respeitar pasta de origem)
20. Remover código morto (`EmailDetailView.tsx`, funções duplicadas)
21. Migrar SettingsPage para React Query
