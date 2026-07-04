# Zeru Logistics API — MongoDB setup

The API uses **Prisma** with **MongoDB**. The main config is in `prisma/schema.prisma`; models live in `prisma/models/` (one file per model).

## Local MongoDB

1. Install and start MongoDB (e.g. `brew services start mongodb-community` on macOS).
2. Copy `.env.example` to `.env`:

```env
DATABASE_URL="mongodb://localhost:27017/zeru_logistics_api"
```

3. Push the schema to your database:

```bash
cd zeru_logistics_api
npm install
npm run prisma:push
npm run start:dev
```

Collections are created automatically when you write data. No SQL import is required.
