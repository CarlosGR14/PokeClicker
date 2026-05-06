# 🔐 Refactorización de Autenticación - NextAuth v4

## Descripción

Refactorización completa del sistema de autenticación personalizado (JWT manual + crypto) a **NextAuth.js v4** con patrón limpio y seguro.

## Cambios Principales

### ✅ Archivos Creados

| Archivo                 | Propósito                                                                |
| ----------------------- | ------------------------------------------------------------------------ |
| `src/auth.ts`           | Configuración centralizada de NextAuth (providers, callbacks, sesión)    |
| `src/app/providers.tsx` | SessionProvider wrapper para acceso a `useSession()` en cliente          |
| `src/middleware.ts`     | Middleware con `withAuth` para protección de rutas y validación de roles |

### ✅ Archivos Modificados

| Archivo                                   | Cambios                                                                |
| ----------------------------------------- | ---------------------------------------------------------------------- |
| `src/app/layout.tsx`                      | Reemplazó `AuthSessionProvider` → `AuthProvider` (import actualizado)  |
| `src/app/auth/login/page.tsx`             | Usa `signIn()` + `useSession()` + `useEffect` para redirección por rol |
| `src/app/game/components/GameHeader.tsx`  | Usa `signOut()` de NextAuth en lugar de fetch manual                   |
| `src/app/admin/page.tsx`                  | Usa `signOut()` de NextAuth en lugar de fetch manual                   |
| `src/app/api/auth/[...nextauth]/route.ts` | Simplificado de 300+ líneas → 6 líneas (solo handler wrapper)          |

### ❌ Archivos Eliminados (Obsoletos)

| Archivo                             | Razón                                         |
| ----------------------------------- | --------------------------------------------- |
| `src/app/api/auth/login/route.ts`   | Reemplazado por NextAuth Credentials provider |
| `src/app/api/auth/signout/route.ts` | Reemplazado por `signOut()` de NextAuth       |
| `src/lib/auth/auth.ts`              | Reemplazado por `src/auth.ts` centralizado    |
| `src/lib/auth/providers.tsx`        | Reemplazado por `src/app/providers.tsx`       |

## Arquitectura

```
┌─────────────────────────────────────────┐
│        src/app/layout.tsx               │
│    (Envuelve con AuthProvider)          │
└────────────────┬────────────────────────┘
                 │
     ┌───────────┴───────────┐
     │                       │
┌────▼─────────┐      ┌──────▼──────┐
│SessionProvider│      │  Rutas      │
│   (Cliente)   │      │  Protegidas │
└───────────────┘      └──────┬──────┘
                               │
                    ┌──────────┴─────────┐
                    │                    │
            ┌───────▼────────┐  ┌────────▼────────┐
            │  /game (JWT)   │  │  /admin (JWT)   │
            │  Role: jugador │  │  Role: admin    │
            └────────────────┘  └─────────────────┘
                    ▲                    ▲
                    │   Middleware       │
                    │  (withAuth)        │
                    │   Validación       │
                    │   de roles         │
                    │                    │
            ┌───────┴────────────────────┴──────┐
            │   src/middleware.ts                │
            │  - Validar token                   │
            │  - Verificar rol                   │
            │  - Redirigir si no autorizado      │
            └────────────────┬───────────────────┘
                             │
            ┌────────────────▼──────────────┐
            │  /auth/login                   │
            │  signIn("credentials", {...}) │
            │  useSession() para redirección│
            └────────────────┬──────────────┘
                             │
            ┌────────────────▼──────────────┐
            │  NextAuth Callbacks            │
            │  - jwt({ token, user })       │
            │  - session({ session, token })│
            └────────────────┬──────────────┘
                             │
            ┌────────────────▼──────────────┐
            │  src/auth.ts                   │
            │  - Credentials Provider        │
            │  - JWT & Session Config        │
            │  - Prisma ORM para BD          │
            └────────────────┬──────────────┘
                             │
            ┌────────────────▼──────────────┐
            │  NextAuth Route Handler        │
            │  /api/auth/[...nextauth]      │
            │  (solo 6 líneas)              │
            └────────────────────────────────┘
```

## Flujo de Autenticación

### 1️⃣ Login

```
Usuario → /auth/login
    ↓
Ingresa email + password
    ↓
handleSubmit()
    ↓
signIn("credentials", {email, password})
    ↓
NextAuth Credentials Provider
    ↓
src/auth.ts authorize()
    ↓
Validar con Prisma + bcrypt
    ↓
✅ Usuario encontrado → JWT creado
    ↓
useSession() detecta cambio
    ↓
useEffect chequea role
    ↓
router.push("/game") o router.push("/admin")
```

### 2️⃣ Protección de Rutas

```
Usuario accede a /game o /admin
    ↓
middleware.ts (withAuth)
    ↓
¿Token válido?
    ├─ NO → /auth/login
    └─ SÍ → ¿Rol correcto?
        ├─ NO → /auth/login
        └─ SÍ → ✅ Acceso permitido
```

### 3️⃣ Logout

```
Usuario → Botón "Cerrar sesión" (🚪)
    ↓
signOut({ callbackUrl: "/auth/login" })
    ↓
NextAuth destruye sesión + cookie
    ↓
Redirige a /auth/login
```

## Configuración NextAuth

### JWT

- **Estrategia**: JWT (no base de datos de sesiones)
- **Encriptación**: JWE (Next Auth maneja automáticamente)
- **Duración**: 30 días
- **Cookie**: `next-auth.session-token` (httpOnly, secure, sameSite=lax)

### Callbacks

```typescript
jwt({ token, user }) → Agrega datos al token cuando se autentica
session({ session, token }) → Expone datos del token en cliente
```

### Roles

- **jugador**: Acceso a `/game` solamente
- **admin**: Acceso a `/admin` solamente

## Beneficios de la Refactorización

| Aspecto            | Antes                | Después                    |
| ------------------ | -------------------- | -------------------------- |
| **Código**         | ~300 líneas custom   | 6 líneas (handler wrapper) |
| **Seguridad**      | JWT manual (riesgo)  | JWE nativo de NextAuth     |
| **Sesión cliente** | Cookies raw          | `useSession()` limpio      |
| **Validación**     | Manual en middleware | `withAuth` built-in        |
| **Redirección**    | Hardcodeada          | Dinámica por rol           |
| **Mantenibilidad** | Compleja             | Simple & testeable         |
| **Performance**    | Validación custom    | Optimizado nativo          |

## Testing

Todos los casos pasaron:

✅ Login jugador → `/game`
✅ Login admin → `/admin`
✅ Sin autenticación → `/auth/login`
✅ Jugador intenta `/admin` → rechazado
✅ Logout → sesión limpia

## Variables de Entorno (Requeridas)

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-clave-secreta-32-caracteres-minimo
DATABASE_URL=mysql://user:password@localhost:3306/pokeclicker
```

## Próximas Mejoras (Opcional)

- [ ] Agregador de providers OAuth (Google, GitHub)
- [ ] Two-factor authentication (2FA)
- [ ] Refresh token rotation
- [ ] Rate limiting en login
- [ ] Audit log de autenticación
- [ ] Notificaciones de inicio de sesión
