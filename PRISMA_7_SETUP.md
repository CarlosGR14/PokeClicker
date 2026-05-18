# Prisma 7 Configuration - Permanent Solution for Pokeclicker

## TL;DR - Always Use This Command

```bash
pnpm prisma migrate dev --config prisma/prisma.config.ts
pnpm prisma generate --config prisma/prisma.config.ts
```

**Why the `--config` flag?** Prisma 7 doesn't auto-detect config files in the `prisma/` folder when using pnpm. Always specify the path explicitly.

---

## ✅ What's Configured

### 1. **prisma/prisma.config.ts** (Prisma 7 Configuration)

```typescript
import "dotenv/config"; // ← REQUIRED: Load .env variables
import { defineConfig } from "prisma/config";

export default defineConfig({
  datasource: {
    url: "mysql://root:abc123.@localhost:3306/pokeclicker",
  },
});
```

**Key Points:**

- `import "dotenv/config"` MUST be first to load environment variables
- Connection URL goes in config, NOT in schema
- We hardcoded the URL for reliability (you can use `process.env.DATABASE_URL` if preferred)

### 2. **prisma/schema.prisma** (Database Schema)

```prisma
datasource db {
  provider = "mysql"
  // NO url property here! It's in prisma.config.ts
}

generator client {
  provider = "prisma-client"
  output = "./generated"
}
```

### 3. **.env** (Environment Variables)

```
DATABASE_URL=mysql://root:abc123.@localhost:3306/pokeclicker
```

### 4. **Migrations Folder**

```
prisma/migrations/
├── 20260503155627_init/
├── 20260503192427_add_game_fields/
├── 20260506073322_add_click_bonus/
└── 20260510_add_prices_config/      ← New: Contains PrecioItem and ConfigGlobal tables
```

---

## 📋 Prisma 7 Breaking Changes from v6

| Feature           | Prisma 6            | Prisma 7              |
| ----------------- | ------------------- | --------------------- |
| Connection URL    | In `schema.prisma`  | In `prisma.config.ts` |
| Config Property   | `datasourceUrl`     | `datasource.url`      |
| Import Path       | `@prisma/internals` | `prisma/config`       |
| dotenv Import     | Optional            | **REQUIRED**          |
| Generator Default | `prisma-client-js`  | `prisma-client`       |

---

## 🚀 Common Commands

### Create/Apply Migrations

```bash
# Create NEW migration from schema changes
pnpm prisma migrate dev --name "description" --config prisma/prisma.config.ts

# Deploy existing migrations to production
pnpm prisma migrate deploy --config prisma/prisma.config.ts

# Reset database (DESTRUCTIVE - loses all data)
pnpm prisma migrate reset --force --config prisma/prisma.config.ts
```

### Database Operations

```bash
# Generate Prisma Client
pnpm prisma generate --config prisma/prisma.config.ts

# Check migration status
pnpm prisma migrate status --config prisma/prisma.config.ts

# Open Prisma Studio (GUI for database)
pnpm prisma studio --config prisma/prisma.config.ts
```

### Debugging

```bash
# Validate schema syntax
pnpm prisma validate --config prisma/prisma.config.ts

# Check database connection
pnpm prisma db execute --stdin --config prisma/prisma.config.ts
# Then type: SELECT 1;
```

---

## 📦 New Database Tables (From Latest Migration)

### `precio_item` Table

Stores base prices for all upgrades and packs in the game:

- `id` (INT, PK) - Unique identifier
- `nombre` (VARCHAR) - Item name (e.g., "Poké Ball", "Great Ball")
- `tipo` (VARCHAR) - Type (e.g., "mejora", "pack")
- `precio_base` (INT) - Base price (editable by admin)
- `cps_bonus` (DOUBLE) - Coins per second bonus
- `click_bonus` (DOUBLE) - Click bonus multiplier

### `config_global` Table

Stores global game configuration:

- `id` (INT, PK) - Always 1 (singleton)
- `multiplicador_costo` (DOUBLE) - Price multiplier (default: 1.15)

---

## 🔧 How to Make pnpm Auto-Detect Config (Optional)

If you want to avoid the `--config` flag, move the config to project root:

```bash
mv prisma/prisma.config.ts ./prisma.config.ts
# Then just use: pnpm prisma migrate dev --name "description"
```

**Trade-off:** Less organized project structure, but faster commands.

---

## ✨ API Routes Connected to Database

- **`/api/admin/prices`** - GET/PUT item prices (admin-only)
- **`/api/game/prices`** - GET current prices for game client
- **`/api/admin/stats`** - GET game statistics (total users, coins, etc.)
- **`/api/admin/users`** - GET/PUT user management (admin-only)

---

## 🐛 Troubleshooting

### Error: "The datasource.url property is required"

✅ **Solution:** Always use `--config prisma/prisma.config.ts` flag

### Error: "Cannot find module 'prisma/config'"

✅ **Solution:** Ensure `dotenv` is installed: `pnpm add dotenv`

### Error: "Migrations recorded in database diverge"

✅ **Solution:** Reset: `pnpm prisma migrate reset --force --config prisma/prisma.config.ts`

### Schema changes not reflected in database

✅ **Solution:** Run migration: `pnpm prisma migrate dev --config prisma/prisma.config.ts`

---

## 📚 Documentation Links

- [Prisma Config Reference](https://www.prisma.io/docs/orm/reference/prisma-config-reference)
- [Prisma Migrate Getting Started](https://www.prisma.io/docs/orm/prisma-migrate/getting-started)
- [MySQL Connection URLs](https://www.prisma.io/docs/orm/reference/connection-urls#mysql)

---

## ✅ Verification Checklist

Run this to verify everything is set up correctly:

```bash
# 1. Validate schema
pnpm prisma validate --config prisma/prisma.config.ts

# 2. Check migrations status
pnpm prisma migrate status --config prisma/prisma.config.ts

# 3. Verify database connection works
pnpm prisma db execute --stdin --config prisma/prisma.config.ts
# Output should show: SELECT 1; → Result: 1

# 4. Verify client generation works
pnpm prisma generate --config prisma/prisma.config.ts

# All should show ✓ GREEN
```

---

**Last Updated:** 2026-05-10  
**Prisma Version:** 7.8.0  
**Status:** ✅ PERMANENT & TESTED
