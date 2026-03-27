# Plano: Correção do Envio de Emails + Sistema de Logging

## Diagnóstico Confirmado (Análise Profunda)

### Fluxo exato quando vanildo@skale.club envia para vanildo@skale.club:

```
POST /api/mail/mailboxes/:id/send
  → isNative = true (mailbox nativa existe, criada antes de virar admin)
  → storeMessage(id, 'sent', ...) → ✅ salva no Sent
  → findLocalUser('vanildo@skale.club')
      → domínio 'skale.club' verificado? SIM → continua
      → usuário 'vanildo@skale.club' existe? SIM → continua  
      → user.isAdmin? SIM → retorna null ❌ BLOQUEIO 1
  → externalRecipients = ['vanildo@skale.club']
  → processInboundEmail('vanildo@skale.club')
      → domínio 'skale.club' verificado? SIM → organizationId encontrado
      → rotas para 'vanildo@skale.club'? NÃO → action: 'none'
  → directRelayRecipients = ['vanildo@skale.club']
  → relayMessage() → SMTP relay → email sai do servidor → precisa voltar via MX
  → SEM PORTA 25 → email se perde ❌ BLOQUEIO 2
  → catch(relayErr) → erro silenciado
  → { success: true } → "Email sent successfully" ❌ ENGANOSO
```

### Dois bloqueios independentes:

| Bloqueio | Local | Causa | Impacto |
|---------|-------|-------|---------|
| **1** | `native-mail.ts:145` | `isAdmin` exclui admins de `findLocalUser` | Admins nunca recebem delivery local |
| **2** | `send.ts:294` | Erro de relay é capturado e silenciado | Usuário vê "sucesso" mas email não chegou |

### E se o domínio não estiver verificado?

Se `skale.club` não estiver verificado, `findLocalUser` retorna `null` na linha 138 (antes do check de admin). Nesse caso, corrigir o `isAdmin` não adianta — o email ainda vai para relay externo. Mas como o domínio ESTÁ verificado (confirmado pelo fato de que `processInboundEmail` encontra a organização), o Bloqueio 1 é o primário.

### Verificação: a mailbox nativa existe?

`createUserMailbox` é chamada em `auth.ts:193` na criação do usuário. A função **não exclui admins** — ela cria a mailbox para qualquer userId. A exclusão só acontece no safety net de `mailboxes.ts:30` que roda no GET (mas não impede o envio). Portanto, a mailbox nativa de vanildo existe.

### Verificação: storeMessage funciona?

Para o Sent: `storeMessage(mailboxId, 'sent', ...)` → busca folder com `type='sent'` → pasta foi criada por `createUserMailbox` com `type: 'sent'` → ✅ funciona.

Para o Inbox (se chegasse lá): `storeMessage(recipientMailbox.id, 'inbox', ...)` → busca folder com `type='inbox'` → pasta foi criada com `type: 'inbox'` → ✅ funcionaria.

---

## Correções

### 1. Corrigir `findLocalUser` — remover exclusão de admins

**Arquivo:** `src/server/lib/native-mail.ts:145`

```typescript
// Antes
if (!user || user.isAdmin) return null

// Depois
if (!user) return null
```

**Justificativa:** A exclusão de admin faz sentido em `authenticateNativeUser` (linha 27) para impedir login SMTP/IMAP de admins. Mas `findLocalUser` é para **rota de delivery** — se um admin tem mailbox nativa, ele deve receber emails localmente. O comentário na linha 140 confirma: "A non-admin user with that exact email must exist" — mas a exclusão de admin na linha 145 contradiz o propósito da função.

### 2. Adicionar logging estruturado no `send.ts`

**Arquivo:** `src/server/routes/mail/send.ts`

Adicionar logs em cada ponto de decisão:

```typescript
console.log(`[Send] from=${mailbox.email} native=${isNative} to=[${allRecipients.join(',')}]`)

// Após findLocalUser para cada destinatário:
console.log(`[Send] ${addr} → findLocalUser: domain=${emailDomain} verified=${!!verifiedDomain} user=${!!user} isAdmin=${user?.isAdmin} → ${recipientUserId ? 'LOCAL' : 'EXTERNAL'}`)

// Após storeMessage no Sent:
console.log(`[Send] Sent folder: ${folder ? 'stored' : 'FOLDER NOT FOUND'}`)

// Após local delivery:
console.log(`[Send] Local delivery to ${recipientEmail}: ${recipientMailbox ? 'stored in inbox' : 'MAILBOX NOT FOUND'}`)

// Após relay:
console.log(`[Send] Relay: routed=${routedRecipients.length} direct=${directRelayRecipients.length}`)

// No catch do relay:
console.error(`[Send] Relay FAILED:`, relayErr)

// No final:
console.log(`[Send] Completed in ${Date.now() - startTime}ms`)
```

### 3. Retornar status de delivery na resposta

**Arquivo:** `src/server/routes/mail/send.ts:358-362`

```typescript
res.json({
    success: true,
    messageId,
    delivery: {
        sentFolder: true,
        localDelivered: localRecipients.length,
        externalRelayed: externalRecipients.length,
    }
})
```

### 4. Log no `storeMessage` quando folder não encontrado

**Arquivo:** `src/server/routes/mail/send.ts:114`

```typescript
if (!folder) {
    console.warn(`[Send] storeMessage: folder type '${folderType}' not found for mailbox ${mailboxId}`)
    return
}
```
