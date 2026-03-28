# Plan: Marcar email como lido (auto com delay + botao toggle)

## Contexto

O sistema webmail ja tem infraestrutura completa de read/unread:
- DB: `mailMessages.isRead`, `mailFolders.unreadCount`
- Server: GET auto-marca como lido, PUT aceita `{ isRead }`, batch aceita `read`/`unread`
- Frontend: `useUpdateMessage` aceita `{ read: boolean }`, toolbar bulk ja existe

**O que falta:**
1. Auto-mark-as-read com delay (2-3s) — atualmente marca IMEDIATAMENTE ao selecionar
2. Botao de toggle read/unread no detalhe do email (email individual e thread)

## Mudancas

### 1. `src/pages/mail/EmailDetailPage.tsx` — Delay + botao

**Auto-mark-as-read com delay (2s):**
- Adicionar `useEffect` que inicia um `setTimeout` de 2s quando a mensagem e carregada e `!email.read`
- Cancelar o timer no cleanup do useEffect (quando o usuario sai da pagina antes do delay)
- Chamar `updateMessage.mutate({ messageId: email.id, data: { read: true } })` quando o timer dispara
- Só executar se `selectedMailbox` existe (nao para mock data)

**Botao de toggle read/unread no toolbar:**
- Adicionar icone `MailOpen` (lido) / `Mail` (nao lido) do lucide-react no toolbar (proximo a Star/Archive/Delete)
- Handler `handleToggleRead`: chama `updateMessage.mutate({ messageId: email.id, data: { read: !email.read } })`
- Mostrar tooltip "Mark as unread" quando o email esta lido, "Mark as read" quando nao lido

**Thread view:**
- `EmailThreadView` recebe callback `onToggleRead` opcional
- Passar o callback de `EmailDetailPage` para `EmailThreadView`

### 2. `src/components/mail/EmailThread.tsx` — Botao de read/unread por mensagem

- Adicionar `onToggleRead?: (messageId: string) => void` nas props de `EmailThreadProps` e `ThreadMessageCard`
- Adicionar botao `Mail`/`MailOpen` na acoes de cada mensagem do thread (proximo a Reply/ReplyAll/Forward/Star)
- O botao so aparece se `onToggleRead` for fornecido

### 3. `src/pages/mail/InboxPage.tsx` — Delay na split view

**Auto-mark-as-read com delay (2s):**
- Em vez de marcar imediatamente em `handleSelectEmail`, iniciar um `setTimeout` de 2s
- Usar `useRef` para guardar o timer ID e cancelar se o usuario trocar de email antes
- Somete marcar como lido se o email ainda estiver selecionado apos 2s

**Botao read/unread no EmailDetail inline:**
- Adicionar botao de toggle na barra de acoes do EmailDetail (ao lado de Reply/ReplyAll/Forward)

### 4. `src/components/mail/EmailDetailView.tsx` — Botao read/unread

- Adicionar prop `onToggleRead?: (id: string) => void`
- Adicionar botao `Mail`/`MailOpen` nas acoes (proximo a Star/Archive/Delete)

## Arquivos a modificar

| Arquivo | Mudanca |
|---------|---------|
| `src/pages/mail/EmailDetailPage.tsx` | Delay 2s para auto-read + botao toggle no toolbar + passar onToggleRead para thread view |
| `src/components/mail/EmailThread.tsx` | Adicionar onToggleRead callback + botao por mensagem |
| `src/pages/mail/InboxPage.tsx` | Delay 2s para auto-read com useRef cleanup + botao toggle no EmailDetail inline |
| `src/components/mail/EmailDetailView.tsx` | Adicionar onToggleRead prop + botao |

## Nao precisa alterar
- Schema (ja tem `isRead`)
- Server API (ja aceita PUT com `{ read }`)
- useMail hooks (ja tem `useUpdateMessage`)
- MailLayout (ja tem badges de unread)
- EmailList (ja tem indicadores visuais)
