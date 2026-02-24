# NSO Forms (Next.js + Postgres + Prisma + Docker)

## Run (Docker)
```bash
docker compose up -d --build
docker compose exec web npx prisma migrate dev --name init
docker compose exec web npm run prisma:seed
```

## Seed admin user
ค่าปริยายของ seed:
- Email: `admin@nso.local`
- Password: `Admin@1234`

สามารถ override ได้ด้วย environment variables: `ADMIN_EMAIL`, `ADMIN_NAME`, `ADMIN_PASSWORD`.
