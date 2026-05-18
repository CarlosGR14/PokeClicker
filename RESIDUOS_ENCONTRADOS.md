# 🧹 Auditoría de Residuos del Proyecto - Pokéclicker

**Fecha:** Mayo 8, 2026  
**Análisis:** Búsqueda exhaustiva de carpetas vacías, archivos sin utilidad y restos de ideas no completadas

---

## 📋 RESUMEN EJECUTIVO

Se encontraron **9 elementos** que pueden eliminarse:

- **3 carpetas vacías** (sin contenido funcional)
- **2 archivos innecesarios** (no usados por el proyecto)
- **2 rutas API obsoletas** (reemplazadas por NextAuth)
- **2 documentos potencialmente desactualizados** (requieren revisión)

---

## 🗑️ ELEMENTOS A ELIMINAR

### 1. **CARPETAS VACÍAS**

#### ❌ `src/lib/utils/`

- **Estado:** Completamente vacía
- **Propósito:** Originalmente para guardar funciones utilitarias reutilizables
- **Razón de eliminación:** Nunca se populate; no hay importaciones de esta carpeta en el código
- **Acción:** Eliminar carpeta

#### ❌ `src/app/api/auth/login/`

- **Estado:** Carpeta vacía (sin route.ts)
- **Propósito:** Ruta API para login (reemplazada por NextAuth)
- **Razón de eliminación:** Con la refactorización a NextAuth v4, la autenticación está centralizada en `[...nextauth]/route.ts`. Credenciales provider maneja todo
- **Acción:** Eliminar carpeta
- **Referencia:** [AUTH_REFACTORING.md](AUTH_REFACTORING.md) documenta esta eliminación

#### ❌ `prisma/migrations/20260506_fix_upgrade_values/`

- **Estado:** Carpeta vacía (sin archivo migration.sql)
- **Propósito:** Migración incompleta
- **Razón de eliminación:** Carpeta sin migración SQL genera problemas en `prisma migrate status`. Es un artefacto de desarrollo
- **Acción:** Eliminar carpeta
- **Verificar:** Ejecutar `prisma migrate status` después de eliminar

---

### 2. **ARCHIVOS NO UTILIZADOS**

#### ❌ `prisma.config.ts`

```typescript
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
```

- **Razón de eliminación:**
  - Prisma 7.x **no utiliza** archivos de configuración JavaScript/TypeScript
  - La configuración se lee automáticamente de `prisma/schema.prisma`
  - El archivo genera confusión y potencial conflicto si se intenta usar
  - El import `from "prisma/config"` es un package de dependencias pero no es usado por Prisma CLI

- **Impacto:** Ninguno negativo; solo clutter
- **Acción:** Eliminar archivo

#### ❌ `src/lib/middleware/rateLimit.ts`

- **Estado:** Existe pero **no se importa ni usa en ningún lugar**
- **Busqueda:** Grep search por `rateLimitMiddleware` retorna solo 1 match (su propia definición)
- **Propósito:** Middleware de rate limiting para proteger endpoints
- **Razón de no eliminación inmediata:**
  - Código está bien implementado
  - Documenta una intención válida (proteger API de abuso)
  - RECOMENDACIÓN: Implementarlo antes de eliminar
- **Acción:** VER SECCIÓN RECOMENDACIONES

---

### 3. **RUTAS API OBSOLETAS**

#### ⚠️ `src/app/api/auth/register/route.ts`

- **Estado:** Existe y funciona, pero **conflicta con NextAuth**
- **Problema:**
  - La ruta manual de registro está implementada
  - NextAuth ya proporciona un provider Credentials
  - Potencial para inconsistencias en la lógica de autenticación
  - El flujo correcto es: UI → NextAuth Credentials Provider → `src/auth.ts` callbacks

- **Código actual:**
  - Valida con Zod
  - Hashea contraseña con bcrypt
  - Crea usuario en BD
  - Retorna datos del usuario (¿para qué?)

- **Problema de arquitectura:**
  - NextAuth maneja todo internamente
  - Esta ruta es redundante si NextAuth está configurado correctamente
- **Acción:** REVISAR EN SECCIÓN RECOMENDACIONES

#### ⚠️ `src/app/api/auth/signout/`

- **Estado:** Carpeta existe pero está **vacía**
- **Razón:** NextAuth maneja signout automáticamente con `signOut()` del cliente
- **Acción:** Eliminar carpeta

---

### 4. **ARCHIVOS DE DOCUMENTACIÓN**

#### ⚠️ `DEBUGGING_REPORT.md`

- **Estado:** Contiene muchos problemas documentados en Mayo 6
- **Contenido:** 5 CRÍTICOS, 12 MAYORES, 8 MENORES
- **Problema:** Muchos de estos problemas pueden estar ya arreglados o pendientes
- **Acción:** REVISAR si los problemas listados están aún presentes en el código

Problemas mencionados:

1. Race condition en save/load de gamestate
2. Potential bucket infinite loop - passive income
3. Falta de rate limiting
4. Missing Zod validation
5. Missing error retry logic

#### ⚠️ `QUICK_FIXES.md`

- **Estado:** Lista de tasks sin terminar ("estimado: 2-3 horas")
- **Contenido:**
  1. Add Rate Limiting (NO IMPLEMENTADO)
  2. Fix Race Condition in GameClient (NO IMPLEMENTADO)
  3. Add Zod Validation for GameState (PARCIAL)
- **Acción:** IMPLEMENTAR O ELIMINAR si ya no es prioritario

#### ℹ️ `TESTING_EXAMPLES.md`

- **Estado:** Contiene ejemplos de tests que no existen en el proyecto
- **Carpeta de tests:** No existe `src/__tests__/`
- **Acción:** Eliminar archivo O crear la estructura de tests correspondiente

---

## ✅ ARCHIVOS QUE SÍ SON ÚTILES

Los siguientes archivos **NO deben eliminarse**:

- ✅ `DESIGN.md` — Sistema de diseño (útil para UI/UX)
- ✅ `PRODUCT.md` — Definición de producto (útil para contexto)
- ✅ `POKEAPI_INTEGRATION.md` — Documentación de integración (implementado)
- ✅ `AUTH_REFACTORING.md` — Documentación de refactorización (referencia histórica)
- ✅ `src/proxy.ts` — Middleware con NextAuth, en uso
- ✅ `README.md` — Documentación básica del proyecto

---

## 🎯 ACCIONES RECOMENDADAS

### Grupo A: ELIMINAR INMEDIATAMENTE (Sin riesgos)

```bash
# 1. Carpetas vacías
rmdir src/lib/utils
rmdir src/app/api/auth/login
rmdir src/app/api/auth/signout
rmdir prisma/migrations/20260506_fix_upgrade_values

# 2. Archivos innecesarios
rm prisma.config.ts

# 3. Verificar Prisma después
npx prisma migrate status
```

### Grupo B: DECIDIR (Requiere análisis adicional)

#### 1. `DEBUGGING_REPORT.md` y `QUICK_FIXES.md`

**Opción A:** Mantener pero actualizar

- Revisar cada bug listado
- Verificar si están arreglados
- Actualizar estado

**Opción B:** Eliminar

- Si ya no son relevantes
- Los bugs serían detectados en testing

**Mi recomendación:** 🔍 Revisar los 5 problemas CRÍTICOS de DEBUGGING_REPORT.md:

1. Race condition en GameClient.tsx (líneas 170-220)
2. Infinite loop en passive income
3. Falta de rate limiting (middleware existe pero no se usa)
4. Falta de Zod validation
5. Missing retry logic

#### 2. `TESTING_EXAMPLES.md`

**Decisión:** Eliminar si no planeas hacer testing pronto

- Los ejemplos son genéricos
- Podrías generarlos de nuevo cuando necesites
- O moveos a una rama/wiki si es referencia

#### 3. `src/app/api/auth/register/route.ts`

**Análisis:**

- ✅ Código está bien escrito
- ❌ Conflicta arquitecturalmente con NextAuth
- ❌ No debe usarse si NextAuth está configurado

**Opción A:** Eliminar (lo correcto)

- Dejar que NextAuth maneje autenticación
- Asegurar que las callbacks en `src/auth.ts` son correctas

**Opción B:** Mantener como alternativa

- Si necesitas API registration endpoint separado
- Pero es redundante

**Mi recomendación:** Eliminar y verificar que NextAuth está correctamente configurado

#### 4. `src/lib/middleware/rateLimit.ts`

**Decisión:** IMPLEMENTAR ANTES DE ELIMINAR

- Código está bien
- Security best practice
- Debería estar en `src/app/api/game/save/route.ts`, `src/app/api/game/state/route.ts`

---

## 🔍 VERIFICACIÓN FINAL

Después de limpiar, ejecutar:

```bash
# 1. Verificar migraciones
npx prisma migrate status

# 2. Compilar TypeScript
npm run build

# 3. Lint
npm run lint

# 4. Dev server
npm run dev
```

---

## 📊 TABLA RESUMIDA DE ACCIONES

| Elemento                                         | Tipo      | Estado         | Acción               | Prioridad |
| ------------------------------------------------ | --------- | -------------- | -------------------- | --------- |
| `src/lib/utils/`                                 | Carpeta   | Vacía          | Eliminar             | 🔴 ALTA   |
| `src/app/api/auth/login/`                        | Carpeta   | Vacía          | Eliminar             | 🔴 ALTA   |
| `src/app/api/auth/signout/`                      | Carpeta   | Vacía          | Eliminar             | 🔴 ALTA   |
| `prisma/migrations/20260506_fix_upgrade_values/` | Carpeta   | Vacía          | Eliminar             | 🔴 ALTA   |
| `prisma.config.ts`                               | Archivo   | No usado       | Eliminar             | 🔴 ALTA   |
| `src/app/api/auth/register/route.ts`             | Archivo   | Conflictivo    | Revisar/Eliminar     | 🟡 MEDIA  |
| `src/lib/middleware/rateLimit.ts`                | Archivo   | No usado       | Implementar/Eliminar | 🟡 MEDIA  |
| `DEBUGGING_REPORT.md`                            | Documento | Desactualizado | Revisar/Actualizar   | 🟢 BAJA   |
| `QUICK_FIXES.md`                                 | Documento | Pendiente      | Implementar/Eliminar | 🟢 BAJA   |
| `TESTING_EXAMPLES.md`                            | Documento | Sin tests      | Revisar/Eliminar     | 🟢 BAJA   |
