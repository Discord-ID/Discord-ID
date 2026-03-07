This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
bun dev
```

For linting:

```bash
bun run lint
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Discord Admin Login (OAuth2)

Dashboard and admin API endpoints are protected with Discord OAuth2 via `next-auth`.

1. Copy env template:

```bash
cp .env.example .env.local
```

2. Set values in `.env.local`:

- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `NEXTAUTH_SECRET`
- `DISCORD_ADMIN_IDS` (comma separated Discord user IDs allowed as admin)
- `DISCORD_STATE_API_BASE_URL`
- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`

3. In Discord Developer Portal, add redirect URI:

```text
http://localhost:3000/api/auth/callback/discord
```

4. Login from:

```text
/login
```

Only IDs listed in `DISCORD_ADMIN_IDS` can sign in and access `/dashboard` plus `/api/admin/*`.

Navbar menampilkan status sesi:

- `Visitor` saat belum login
- `Admin` saat berhasil login Discord sebagai admin
- Avatar Discord (jika tersedia) + tombol `Login` / `Logout`

## Turso + Drizzle

Konten situs (`site_content`) dan artikel blog (`blog_posts`) sekarang memakai Turso + Drizzle.

1. Pastikan env Turso sudah diisi (`TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`).
2. Generate migration/schema metadata:

```bash
bun run db:generate
```

3. Push schema ke Turso:

```bash
bun run db:push
```

Jika env Turso belum diisi, aplikasi fallback ke penyimpanan JSON lokal di `src/data`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
