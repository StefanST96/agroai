# AgroAI V1 baza

Prisma struktura je u `prisma/schema.prisma` i koristi PostgreSQL.

## Tabele

- `User`: registracija, login podaci, profil i gazdinstvo.
- `Post`: objave korisnika sa kategorijama.
- `Comment`: komentari na objave.
- `Like`: lajkovi na objave, uz `@@unique([postId, authorId])` da korisnik ne lajkuje isti post vise puta.
- `Market`: pijace po gradu i regionu.
- `Product`: proizvodi i kategorije.
- `MarketPrice`: dnevne prijave cena po pijaci, proizvodu i jedinici mere.
- `Subsidy`: konkursi, institucije, iznosi, rokovi i statusi.

## Predlozeni .env

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/agroai?schema=public"
```

## Migracija

Kada se dodaju Prisma paketi u projekat:

```bash
npx prisma generate
npx prisma migrate dev --name init_v1
```

## Sledece faze

V2 moze da doda modele za AI analize slika biljaka, npr. `PlantImageUpload` i `DiseaseAnalysis`.
V3 moze da doda modele za reklame, banere, partnere i premium firme.
