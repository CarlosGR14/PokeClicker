# 🎯 Quick Start - Prisma Database Setup (Pokeclicker)

## For Development Team - Read This First!

### ⚡ Quick Commands

Instead of remembering long commands, use these npm scripts:

```bash
# Create new migration from schema changes
pnpm run db:migrate

# Deploy migrations to database
pnpm run db:migrate:deploy

# Regenerate Prisma Client
pnpm run db:generate

# Check database status
pnpm run db:status

# Open database GUI (Prisma Studio)
pnpm run db:studio

# ⚠️ DESTRUCTIVE: Reset entire database
pnpm run db:reset
```

### 📋 Available npm Scripts

| Command                      | What It Does                            |
| ---------------------------- | --------------------------------------- |
| `pnpm run db:migrate`        | Create & apply new migration            |
| `pnpm run db:migrate:deploy` | Deploy migrations (production)          |
| `pnpm run db:generate`       | Regenerate Prisma Client                |
| `pnpm run db:push`           | Push schema changes directly (dev only) |
| `pnpm run db:reset`          | **DESTRUCTIVE** - Reset DB              |
| `pnpm run db:status`         | Show migration status                   |
| `pnpm run db:studio`         | Open Prisma Studio GUI                  |
| `pnpm run db:validate`       | Validate schema syntax                  |

---

## 🔄 Typical Workflow

### Scenario 1: Update Database Schema

```bash
# 1. Edit prisma/schema.prisma (add/modify models)
# 2. Run migration
pnpm run db:migrate --name "add_new_feature"

# 3. Answer prompts (accept generated SQL)
# 4. Commit changes
git add prisma/
git commit -m "chore: add new feature to database"
```

### Scenario 2: Deploy to Production

```bash
# Use deploy instead of dev
pnpm run db:migrate:deploy

# No data loss - only applies new migrations
```

### Scenario 3: Verify Database Setup

```bash
# Check everything is working
pnpm run db:validate
pnpm run db:status
pnpm run db:studio  # Optional: open GUI to inspect data
```

---

## 📦 What's Configured

✅ **Database**: MySQL (localhost:3306/pokeclicker)  
✅ **ORM**: Prisma 7.8.0  
✅ **Configuration**: `prisma/prisma.config.ts`  
✅ **Migrations**: 4 migrations applied  
✅ **Tables**: usuario, pokemon, mejora, precio_item, config_global

---

## 🚨 If Something Goes Wrong

### "Migration failed"

```bash
# Check what happened
pnpm run db:status

# View migration history
ls prisma/migrations/
```

### "Database has no tables"

```bash
# Re-apply all migrations
pnpm run db:reset  # ⚠️ This deletes all data
```

### "Can't connect to database"

```bash
# Check .env file exists
cat .env

# Verify MySQL is running
# Make sure port 3306 is accessible
```

---

## 📝 Important Files

- **`prisma/schema.prisma`** - Your database schema (models/tables)
- **`prisma/prisma.config.ts`** - Prisma configuration
- **`prisma/migrations/`** - Version history of schema changes
- **`.env`** - Database connection (don't commit secrets!)
- **`PRISMA_7_SETUP.md`** - Detailed technical documentation

---

## 🎓 New Team Members

1. **First time setting up?**
   - Prisma is already configured ✓
   - Just run: `pnpm install`
   - Then: `pnpm run db:validate`

2. **Want to learn more?**
   - Read: `PRISMA_7_SETUP.md` in project root
   - Or: https://www.prisma.io/docs/

3. **Database schema**
   - View in Prisma Studio: `pnpm run db:studio`
   - Or edit: `prisma/schema.prisma`

---

## 🔐 Security Notes

- ⚠️ **Never commit `.env` file** (contains database password)
- ✅ `.env` is in `.gitignore` (protected)
- ✅ Migration files ARE committed (SQL history)
- ✅ `prisma/generated/` is ignored (regenerated on demand)

---

## 📞 Need Help?

- Detailed setup: See `PRISMA_7_SETUP.md`
- Migration issues: `pnpm run db:status`
- Database GUI: `pnpm run db:studio`
- Technical docs: https://www.prisma.io/docs/orm/reference/prisma-config-reference

---

**Last Updated:** 2026-05-10  
**Prisma Version:** 7.8.0  
**Status:** ✅ TESTED & WORKING
