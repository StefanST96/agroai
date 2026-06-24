# AgroAI

AgroAI je Next.js aplikacija za poljoprivrednu zajednicu sa funkcijama:

- autentikacija korisnika (registracija/prijava)
- feed objava sa lajkovima i komentarima
- AI asistent sa istorijom razgovora
- cene na pijaci i unos novih cena
- subvencije i konkursi
- analiza bolesti biljaka sa upload-om slike
- obavestenja i korisnicki profil

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Prisma ORM
- MySQL 8 (Docker)

## Pokretanje

1. Podigni bazu:

```bash
docker compose up -d
```

2. Instaliraj zavisnosti:

```bash
npm install
```

3. Generisi Prisma client i sinhronizuj semu:

```bash
npx prisma generate
npx prisma db push
```

4. Pokreni razvojni server:

```bash
npm run dev
```

## Environment

Obavezno u `.env`:

```env
DATABASE_URL="mysql://root:agroai123@127.0.0.1:3306/agroai"
```

Opcionalno za pravi AI chat:

```env
AI_PROVIDER=auto

# OpenAI
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini

# Ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.1:8b
```

## Baza - skolski modeli relacija

- Primary Key: `id` kolone kroz sve glavne tabele
- Foreign Key: npr. `Post.authorId -> User.id`, `Comment.postId -> Post.id`
- One-to-One: `User <-> UserProfile` (`UserProfile.userId` je `@unique`)
- One-to-Many: `User -> Post`, `Post -> Comment`, `AiConversation -> AiMessage`
- Many-to-Many: `User <-> Post` preko tabele `Like`
- JOIN: koristi se kroz Prisma `include` upite u `lib/db.ts`
- INDEX: indeksi na FK kolonama, datumima i unique poljima

## Najbitnije rute

- Home feed: `/`
- AI asistent: `/ai-asistent`
- Cene na pijaci: `/cene-na-pijaci`
- Subvencije: `/subvencije`
- Bolesti biljaka: `/bolesti-biljaka`
- Profil: `/profil`

Dodatne sekcije (povezane iz sidebara):

- `/iskustva-i-saveti`
- `/vremenska-prognoza`
- `/oprema-i-oglasi`
- `/dogadjaji`
- `/prijatelji-sajta`

## Napomena za Windows

Ako `prisma generate` prijavi `EPERM query_engine-windows.dll.node`, ugasi aktivne Node procese pa ponovi:

```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
npx prisma generate
```
