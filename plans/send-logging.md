# Plano: Sistema de Logging de Envio de Emails + Correção do Envio Local

## Diagnóstico: Por que o email "rrrr" não chegou

Quando `vanildo@skale.club` envia para `vanildo@skale.club` via mailbox nativa, o fluxo é:

1. **Store in Sent** (`send.ts:242-244`) — `storeMessage(mailboxId, 'sent', ...)` → ✅ Funciona (aparece no Sent)
2. **Separate recipients** (`send.ts:250-257`) — `findLocalUser('vanildo@skale.club')`:
   - Verifica se domínio `skale.club` está verificado em `domains` table → **Se NÃO verificado, retorna `null`**
   - Se verificado, verifica se existe usuário com esse email → Se admin, retorna `null`
3. **Se `findLocalUser` retorna `null`** → destinatário vai para `externalRecipients`
4. **Relay externo** (`send.ts:273-298`):
   - `processInboundEmail('vanildo@skale.club')` verifica rotas
   - Se nenhuma rota, vai para `directRelayRecipients`
   - `relayMessage()` tenta direct delivery (`direct: true`) → **FALHA** (SPF/DKIM/DMARC)
   - Erro é capturado no catch (`send.ts:294`) e **silenciosamente ignorado**
5. **Resposta**: `{ success: true }` — usuário vê "Email sent" mas nunca chegou

### Possíveis causas raiz:
- **A**: Domínio `skale.club` não está verificado na tabela `domains`
- **B**: `vanildo` é admin → `findLocalUser` retorna `null` (linha 145: `if (!user || user.isAdmin) return null`)
- **C**: Nenhum dos dois → vai para relay externo que falha silenciosamente

## Plano de Implementação

### 1. Criar tabela `mail_send_logs` no schema

Arquivo: `src/db/schema.ts`

```typescript
export const mailSendLogs = pgTable('mail_send_logs', {
    id: uuid('id').primaryKey().defaultRandom(),
    mailboxId: uuid('mailbox_id').notNull(),
    userId: uuid('user_id').notNull(),
    messageId: text('message_id').notNull(),
    subject: text('subject'),
    fromAddress: text('from_address').notNull(),
    // Recipients
    toAddresses: jsonb('to_addresses').notNull(),
    ccAddresses: jsonb('cc_addresses'),
    bccAddresses: jsonb('bcc_addresses'),
    // Results
    sentFolderStored: boolean('sent_folder_stored').default(false),
    localDeliveries: jsonb('local_deliveries').default([]),  // [{ email, mailboxId, success, error? }]
    externalRelay: jsonb('external_relay'),  // { attempted: boolean, success: boolean, error?: string }
    // Metadata
    isNative: boolean('is_native'),
    durationMs: integer('duration_ms'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})
```

### 2. Adicionar logging estruturado no `send.ts`

Arquivo: `src/server/routes/mail/send/send.ts`

No handler `POST /:mailboxId/send`, adicionar:

- **Log no início**: Registrar mailbox, recipients, isNative
- **Log após store in Sent**: Sucesso/falha
- **Log após findLocalUser**: Para cada destinatário, registrar se é local ou externo (e POR QUÊ — domain not verified, user is admin, not found)
- **Log após local delivery**: Sucesso/falha por destinatário
- **Log após relay**: Sucesso/falha com detalhes do erro
- **Log no catch**: Erro completo
- **Persistir no banco**: Inserir registro em `mail_send_logs` com todos os detalhes

### 3. Criar endpoint para consultar logs

Arquivo: `src/server/routes/mail/send.ts`

```
GET /api/mail/mailboxes/:mailboxId/send-logs?limit=50
```

Retorna os últimos logs de envio da mailbox, com status detalhado.

### 4. Criar página de logs de envio no frontend

Arquivo: `src/pages/mail/SendLogsPage.tsx` (ou aba em Settings)

Tabela com colunas: Date, Subject, To, Status (sent/relayed/failed), Details.

### 5. Corrigir o envio local para admins

Arquivo: `src/server/lib/native-mail.ts:145`

Atualmente admins são excluídos do delivery local. Se o admin tem uma mailbox nativa, deveria receber emails normalmente.

```typescript
// Antes
if (!user || user.isAdmin) return null

// Depois
if (!user) return null
```

### 6. Adicionar `console.log` estruturados no send flow

Enquanto a tabela de logs não estiver pronta, adicionar logging no console para debug imediato:

```
[Send] Starting send from vanildo@skale.club (native)
[Send] Recipient vanildo@skale.club → findLocalUser: domain 'skale.club' not verified → external
[Send] Relay attempt for vanildo@skale.club → direct delivery → Error: connection refused
[Send] Completed in 1200ms — sent folder: OK, local: 0, external: FAILED
```
