# Creator Portal — Repo Map

**You're in:** `/home/user/creator-portal-vespera/`

This is the **production Creator Portal** repo. Clone of [`Vespera-World-Creator-Portal`](https://github.com/Vespera-World/Vespera-World-Creator-Portal).

## What's in this repo

| Path | What |
|---|---|
| `app/link/[handle]/` | Public link-in-bio pages (chromatic, pearl logo, lust mode) |
| `app/auth/login/` | Magic link + Google + Facebook + SMS login |
| `app/portal/*` | Creator portal: profile, content, settings, messages, analytics, finances, tasks |
| `app/admin/*` | Admin section: dashboard, creators, invite, settings |
| `app/api/webhooks/chatwoot/` | ChatWoot webhook receiver (HMAC-verified) |
| `app/api/track/link-click/` | Click tracking endpoint |
| `app/api/invite/` | Creator invite endpoint (magic link) |
| `lib/supabase/*` | Supabase client/server config |
| `lib/chatwoot.ts` | ChatWoot API helpers |
| `lib/tolgee.tsx` | i18n (English/Spanish via Tolgee) |

Runs on **port 3000**. Start with `pnpm dev`.

## Sister repo — the Platform

**`/home/user/v0-vespera-world-crm-platform/`** — Clone of [`vespera-world-platform-final`](https://github.com/Vespera-World/vespera-world-platform-final)

Despite the misleading folder name (v0 scaffold leftover), this is the **canonical Vespera World Platform** repo:
- Admin dashboard (full feature set)
- Database migrations (16+ SQL files)
- Integration docs (EcartPay, ChatWoot, etc.)
- Auth configuration
- Wiki (`docs/vespera-world-wiki/`)

Runs on **port 3001**. Start with `PORT=3001 pnpm dev` from that folder.

## How they relate

```
┌─────────────────────────────────────────────────────────┐
│            vespera-world-platform-final (3001)            │
│  Admin dashboard · Schema migrations · Integrations docs  │
│  Database setup · Auth configuration · AI agents          │
└─────────────────────────────────────────────────────────┘
                          ▲
                          │ shares Supabase
                          │
┌─────────────────────────────────────────────────────────┐
│          Vespera-World-Creator-Portal (3000)             │
│  Public link pages · Creator portal · ChatWoot webhook   │
│  Auth UI · Lust mode · Click tracking · Magic link        │
└─────────────────────────────────────────────────────────┘
```

Both share:
- Supabase project `wliaunsmsxexjmivwfyr`
- Auth tables (`auth.users`, `profiles`, `creator_portal_users`)
- Storage buckets
- Same env vars (Supabase URL + anon key)

## Local dev startup

```bash
# Terminal 1: Portal (this repo, port 3000)
cd /home/user/creator-portal-vespera
pnpm dev

# Terminal 2: Platform (sister repo, port 3001)
cd /home/user/v0-vespera-world-crm-platform
PORT=3001 pnpm dev
```

## When to use which

| Task | Repo |
|---|---|
| Creator portal UI | portal (this) |
| Public `/link/[handle]` pages | portal (this) |
| Auth/login pages | portal (this) |
| Webhook handlers | portal (this) |
| Admin dashboard work | platform (sister) |
| New SQL migrations | platform (sister) |
| Integration docs | platform (sister) |

## Other Vespera repos

See `REPO_MAP.md` in `/home/user/v0-vespera-world-crm-platform/` for the full list.