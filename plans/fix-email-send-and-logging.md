# Plano: Correção do Envio de Emails + Sistema de Logging

## Diagnóstico Confirmado (Causa Raiz)

### Por que o email "rrrr" de vanildo@skale.club para vanildo@skale.club não chegou:

**`findLocalUser()` em `native-mail.ts:145` exclui admins:**
```typescript
if (!user || user.isAdmin) return null
```

Fluxo exato:
1. ComposePage envia `POST /api/mail/mailboxes/:id/send` com `to: [{ address: 'vanildo@skale.club' }]`
2. `send.ts:154` → `isNative = true` (mailbox nativa)
3. `send.ts:243` → `storeMessage(mailboxId, 'sent', ...)` → ✅ Salva no Sent
4. `send.ts:251` → `findLocalUser('vanildo@skale.club')` → **retorna `null`** (vanildo é admin)
5. `send.ts:255` → destinatário vai para `externalRecipients`
6. `send.ts:279` → `processInboundEmail('vanildo@skale.club')` → domain verified, mas sem rotas → `action: 'none'`
7. `send.ts:292` → `relayMessage()` → envia via SMTP relay → email sai do servidor e precisa voltar via MX → **nunca volta** (sem port 25, sem loopback)
8. `send.ts:294` → erro capturado e silenciado
9. `send.ts:358` → `{ success: true }` → usuário vê "Email sent successfully"

**Resultado: Email aparece no Sent mas nunca chega ao Inbox.**

### Problemas secundários confirmados:
- `storeMessage` em `send.ts` falha silenciosamente (sem log, ao contrário do `smtp-server.ts`)
- Zero logging estruturado no fluxo de envio
- Relay errors são engolidos sem notificação

---

## Correções

### 1. Corrigir `findLocalUser` — remover exclusão de admins (`native-mail.ts:145`)

```typescript
// Antes
if (!user || user.isAdmin) return null

// Depois  
if (!user) return null
```

Admins com mailbox nativa devem receber emails localmente. A exclusão de admin só faz sentido no contexto de autenticação SMTP/IMAP (função `authenticateNativeUser`), não na rota de delivery.

### 2. Adicionar logging estruturado no `send.ts`

Adicionar `console.log` em cada ponto de decisão do fluxo:

```
[Send] from=vanildo@skale.club native=true to=[vanildo@skale.club]
[Send] findLocalUser(vanildo@skale.club) → domain=skale.club verified=true user=vanildo isAdmin=false → local
[Send] local delivery → mailboxId=abc inbox folder found → stored
[Send] completed in 45ms — sent: OK, local: 1/1, relay: N/A
```

### 3. Adicionar `storeMessage` logging no `send.ts`

Diferenciar do `smtp-server.ts` que já tem log. Adicionar log quando folder não encontrado:

```typescript
if (!folder) {
    console.warn(`[Send] storeMessage: folder type '${folderType}' not found for mailbox ${mailboxId}`)
    return
}
```

### 4. Retornar status de delivery na resposta da API

Mudar a resposta de `{ success: true }` para incluir detalhes:

```typescript
res.json({
    success: true,
    messageId,
    delivery: {
        sentFolder: true,
        localDelivered: localRecipients.length,
        externalRelayed: externalRecipients.length,
        relayErrors: relayErrors.length > 0 ? relayErrors : undefined,
    }
})
```

### 5. Mostrar erros de delivery no frontend

No `ComposePage.tsx`, verificar `response.delivery.relayErrors` e mostrar toast de aviso:

```
Email sent, but delivery to external recipients may have failed.
```
