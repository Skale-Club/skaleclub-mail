# Plano: Performance — Eliminar flash de imagens quebradas e acelerar carregamento inicial

## Diagnostico

O problema nao e so o logo. E uma cadeia de gargalos no bootstrap da aplicacao:

1. **`index.html` referencia `/favicon.svg`** que nao existe (diretorio `public/` vazio) → 404 imediato
2. **`AppLogo` renderiza `<img src="/brand-mark.svg">`** (default branding) que nao existe → icone de erro
3. **Auth init e sequencial**: `supabase.auth.getSession()` → `fetchProfile('/api/users/profile')` → Express valida token com `supabase.auth.getUser()` → query no DB → ~2-3 network hops antes do spinner sumir
4. **`api-client.ts` chama `supabase.auth.getSession()` antes de CADA request** — adiciona latencia Supabase Auth em toda chamada API
5. **Endpoint `/api/system/branding` nao tem cache server-side** — `readBranding()` faz query no DB toda vez (diferente de `getCachedBranding()` usado pelo IMAP que tem cache em memoria)
6. **`MailboxProvider` faz fetch para TODOS os usuarios** — inclusive admins que nao usam mail
7. **Google Fonts bloqueia renderizacao** — `@import url(...)` no topo do CSS
8. **Sem code splitting** — todas as 30+ paginas sao importadas estaticamente
9. **Sem Suspense boundaries** — sem loading granular por componente

## Plano de Implementacao

### Fase 1: Eliminar imagens quebradas (impacto imediato, alto)

#### 1.1 Criar `public/` com SVGs fallback
- Criar `public/brand-mark.svg` — logo padrao simples (icon de envelope/mail)
- Criar `public/favicon.svg` — favicon padrao (versao menor do logo)
- Isso elimina o 404 imediato no `index.html` e no primeiro render do `AppLogo`

#### 1.2 Melhorar `AppLogo` com loading state
- Adicionar `isLoading` check do `useBranding()` — enquanto carrega, renderizar um placeholder invisivel (div com mesma dimensao) em vez de `<img>` com URL invalida
- Apos carregar, renderizar a imagem normalmente com uma transicao suave (`opacity` + `transition`)

#### 1.3 Melhorar `BrandingHead` para nao piscar favicon
- So atualizar `document.title` e `favicon.href` quando `isSuccess` for true (dados ja carregados), evitando setar `/favicon.svg` temporariamente

### Fase 2: Acelerar inicializacao de auth (impacto alto)

#### 2.1 Paralelizar auth init com branding
- Atualmente auth e branding sao independentes mas auth bloqueia tudo via `AuthCheck` → `Spinner`
- Auth ja e async via `useEffect`, branding ja e async via React Query — ambos ja rodam em paralelo. Nao precisa mudar aqui.

#### 2.2 Cache de session no cliente
- No `api-client.ts`, `getAccessToken()` chama `supabase.auth.getSession()` a cada request
- O Supabase JS client ja faz cache de session em memoria, mas ainda valida com o servidor as vezes
- **Solucao**: Manter referencia da session em memoria e so chamar `getSession()` se nao tiver token ou se estiver perto de expirar

#### 2.3 Endpoint `/api/system/branding` com cache server-side
- Usar `getCachedBranding()` (ja existe em `serverBranding.ts` com cache de 10min) em vez de `readBranding()` no endpoint GET
- Isso elimina a query no DB para branding em requests subsequentes

### Fase 3: Otimizar carregamento de recursos (impacto medio)

#### 3.1 Google Fonts — nao bloquear renderizacao
- Mover `@import url(...)` do topo de `index.css` para usar `font-display: swap` (ja esta no URL, bom)
- Alternativa: usar `<link rel="preconnect">` no `index.html` para Google Fonts

#### 3.2 MailboxProvider — nao fazer fetch para admins
- `MailboxProvider` esta no nivel raiz da app, faz fetch para TODOS os usuarios logados
- Mover `MailboxProvider` para dentro das rotas de mail apenas (dentro de `MailCheck`)
- Ou adicionar condicao: so fazer fetch se `!isAdmin`

### Fase 4: Code splitting (impacto medio, mais trabalho)

#### 4.1 Lazy loading das paginas
- Converter imports estaticos de paginas em `React.lazy()` + `Suspense`
- Agrupar por area: admin pages, mail pages, outreach pages
- Mostrar `Spinner` ou skeleton como fallback do `Suspense`

---

## Arquivos a modificar

| Arquivo | Mudanca |
|---------|---------|
| `public/brand-mark.svg` | **Novo** — SVG fallback para logo |
| `public/favicon.svg` | **Novo** — SVG fallback para favicon |
| `src/components/AppLogo.tsx` | Adicionar loading state + transicao suave |
| `src/main.tsx` (`BrandingHead`) | So atualizar favicon quando `isSuccess` |
| `src/server/routes/system.ts` | Usar `getCachedBranding()` no GET `/branding` |
| `src/lib/api-client.ts` | Cache de session em memoria para evitar `getSession()` em cada request |
| `src/main.tsx` (imports) | Converter imports estaticos em `React.lazy()` |
| `src/hooks/useMailbox.tsx` | Condicionar fetch para nao-admins |
| `index.html` | Adicionar `<link rel="preconnect">` para Google Fonts |

## Ordem de execucao

1. Fase 1 (imagens quebradas) — resolve o problema visual imediato
2. Fase 2 (auth + branding cache) — acelera o tempo ate a UI aparecer
3. Fase 3 (recursos) — reduz latencia de renderizacao
4. Fase 4 (code splitting) — reduz tamanho do bundle inicial
