# Form Builder (Next.js + Postgres + Prisma + Docker)

## Run (Docker)
```bash
docker compose up -d --build
docker compose exec web npx prisma migrate dev --name init
```

Open:
- Builder: http://localhost:3000
- Public preview: click "ดูตัวอย่าง" (route `/f/[formId]`)
- Responses: click "คำตอบ" (route `/f/[formId]/responses`)
"# nso-forms" 
