# GUÍA DE ESTILOS

## Pokeclicker

**Elaborado por**: Carlos González Rodríguez  
**Fecha de elaboración**: Mayo 2026  
**Versión del documento**: 1.0  
**Última actualización**: 18 de Mayo de 2026

---

## ÍNDICE

1. [Introducción](#introducción)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Convenciones de Nombres](#convenciones-de-nombres)
5. [Componentes React](#componentes-react)
6. [Estilos CSS y Diseño Visual](#estilos-css-y-diseño-visual)
7. [TypeScript y Tipado](#typescript-y-tipado)
8. [Base de Datos (Prisma)](#base-de-datos-prisma)
9. [Autenticación y Seguridad](#autenticación-y-seguridad)
10. [Validación de Datos](#validación-de-datos)
11. [Importes y Path Aliases](#importes-y-path-aliases)
12. [Buenas Prácticas de Desarrollo](#buenas-prácticas-de-desarrollo)
13. [Ejemplos Prácticos](#ejemplos-prácticos)
14. [Checklist de Calidad](#checklist-de-calidad)

---

## 1. Introducción

La presente guía de estilos ha sido elaborada con el propósito de establecer normas consistentes y uniformes para el desarrollo de la aplicación **Pokeclicker**. Esta guía proporciona especificaciones detalladas sobre convenciones de código, estructura de componentes, diseño visual, manejo de datos y mejores prácticas de desarrollo.

El objetivo principal es garantizar la coherencia en el código, facilitar la mantenibilidad del proyecto y proporcionar directrices claras para todos los desarrolladores que trabajen en la aplicación.

---

## 2. Stack Tecnológico

### 2.1 Componentes Principales

| Componente | Versión         | Propósito                                          |
| ---------- | --------------- | -------------------------------------------------- |
| Next.js    | 16.2.4          | Framework de React para SSR y renderizado híbrido  |
| React      | 19.2.4 (Canary) | Librería de interfaz de usuario con React Compiler |
| TypeScript | 5               | Lenguaje tipado basado en JavaScript               |
| Prisma ORM | 7.8.0           | Gestor de base de datos y migraciones              |
| MariaDB    | Última          | Sistema de gestión de base de datos relacional     |
| NextAuth   | 4.24.14         | Autenticación y gestión de sesiones                |
| Zod        | 4.4.2           | Validación de esquemas y datos                     |
| Bcrypt     | 6.0.0           | Hasheado seguro de contraseñas                     |
| ESLint     | 9               | Linting y análisis de código                       |

### 2.2 Herramientas de Desarrollo

- **IDE**: Visual Studio Code
- **Gestor de paquetes**: pnpm con workspaces
- **Control de versiones**: Git/GitHub
- **Testing**: [A especificar según necesidad]
- **Base de datos visual**: Prisma Studio

---

## 3. Estructura del Proyecto

---

### 3.1 Organización de Directorios

La estructura de directorios sigue el patrón de Next.js 16 con App Router, organizada de la siguiente manera:
pokeclicker/
├── src/
│ ├── app/ # App router (Next.js)
│ │ ├── layout.tsx # Layout raíz
│ │ ├── page.tsx # Página inicio (redirect)
│ │ ├── globals.css # Estilos globales
│ │ ├── providers.tsx # Proveedores (NextAuth, etc)
│ │ ├── admin/ # Rutas protegidas admin
│ │ │ ├── layout.tsx
│ │ │ ├── page.tsx # Dashboard admin
│ │ │ ├── economy/ # Gestión economía
│ │ │ ├── settings/ # Configuración global
│ │ │ └── users/ # Gestión usuarios
│ │ ├── api/ # Rutas API
│ │ │ ├── admin/
│ │ │ │ ├── prices/ # Gestión precios
│ │ │ │ ├── stats/ # Estadísticas
│ │ │ │ └── users/ # Datos usuarios
│ │ │ ├── auth/
│ │ │ │ ├── [...nextauth]/ # NextAuth endpoints
│ │ │ │ └── register/ # Registro
│ │ │ ├── game/
│ │ │ │ ├── prices/ # Precios items
│ │ │ │ ├── save/ # Guardar progreso
│ │ │ │ └── state/ # Estado del juego
│ │ │ ├── pokeapi/
│ │ │ │ └── item/ # Integración PokéAPI
│ │ │ └── seed/ # Seed de datos
│ │ ├── auth/ # Páginas autenticación
│ │ │ ├── components/ # Componentes auth
│ │ │ ├── login/
│ │ │ └── register/
│ │ └── game/ # Sección principal del juego
│ │ ├── components/ # Componentes del juego
│ │ ├── GameWrapper.tsx
│ │ ├── GameClient.tsx
│ │ ├── types.ts
│ │ └── game.module.css
│ ├── lib/
│ │ ├── db.ts # Instancia Prisma
│ │ ├── format.ts # Utilidades de formato
│ │ ├── auth/ # Configuración autenticación
│ │ │ ├── auth.ts
│ │ │ ├── config.ts
│ │ │ ├── hooks.ts
│ │ │ └── utils.ts
│ │ ├── middleware/ # Middlewares
│ │ │ └── rateLimit.ts
│ │ └── validations/ # Esquemas Zod
│ │ ├── auth.ts
│ │ └── gameState.ts
│ ├── services/ # Servicios externos
│ │ └── pokeapi.ts # Integración PokéAPI
│ ├── auth.ts # Configuración NextAuth
│ └── proxy.ts # Proxy de requests
├── prisma/
│ ├── prisma.config.ts # Configuración Prisma 7
│ ├── schema.prisma # Schema Prisma
│ ├── migrations/ # Historial migraciones
│ └── generated/ # Cliente Prisma generado
├── public/
│ └── manifest.json
├── package.json
├── tsconfig.json
├── eslint.config.mjs
├── next.config.ts
└── pnpm-workspace.yaml

```

---

## 4. Convenciones de Nombres

Las convenciones de nombres establecidas garantizan consistencia y legibilidad del código.

#### 4.1.1 Directorios

- Se utilizan **minúsculas con guiones** para directorios estándar: `auth`, `game`, `api`
- Los directorios **privados de Next.js** utilizan guión bajo: `_private`, `_middleware`
- Los directorios **dinámicos** se envuelven en corchetes: `[id]`, `[...slug]`

**Ejemplos válidos**:
```

src/app/api/auth/[...nextauth]/route.ts ✅
src/app/game/components/GameHeader.tsx ✅
src/lib/auth/config.ts ✅

````

#### 4.1.2 Componentes React

Los componentes React siguen las siguientes reglas:

- **PascalCase**: Todos los nombres de componentes en PascalCase
- **Un componente por archivo**: Cada archivo exporta un único componente por defecto
- **Nombre del archivo coincide con el componente**: `GameHeader.tsx` contiene `export default function GameHeader()`

**Ejemplo correcto**:
```typescript
// src/app/game/components/GameHeader.tsx
export default function GameHeader({ userName, money }: GameHeaderProps) {
  return <header>...</header>;
}
````

#### 4.1.3 Funciones y Variables

Todas las funciones y variables utilizan las siguientes convenciones:

- **camelCase**: Regla general para variables y funciones
- **CONSTANT_CASE**: Para constantes globales y valores inmutables
- **Prefijos booleanos**: `is`, `has`, `should` para variables booleanas

**Ejemplos**:

```typescript
// Variables y funciones
const calculateDamage = (base: number, bonus: number) => base + bonus;
const getUserName = (user: User) => user.name;

// Constantes
const MAX_POKEBALLS = 100;
const API_TIMEOUT = 5000;
const RARITY_THRESHOLDS = [0.1, 0.5, 0.9];

// Booleanos
const isUserAdmin = user.role === "admin";
const hasInventorySpace = inventory.length < maxSize;
```

#### 4.1.4 Interfaces y Tipos

La tipificación en TypeScript utiliza las siguientes convenciones:

- **PascalCase**: Todos los nombres de interfaces y tipos en PascalCase
- **Sufijo `Props`**: Para propiedades de componentes React
- **Sufijo `Response/Request`**: Para tipos de API
- **Sin prefijo `I`**: Evitar el prefijo antiguo de interfaces

**Ejemplos correctos**:

```typescript
interface GameState {
  money: number;
  inventory: Item[];
}

interface GameHeaderProps {
  userName: string;
  money: number;
  onSettingsClick?: () => void;
}

interface UserResponse {
  id: string;
  email: string;
  role: Role;
}
```

#### 4.1.5 Archivos de Estilos CSS Modules

Los archivos de estilos siguen la siguiente nomenclatura:

- **Extensión obligatoria**: `.module.css` para todos los CSS Modules
- **Nombre coincidente**: El archivo de estilos comparte nombre con el componente

**Estructura válida**:

```
src/app/game/
├── game.module.css
└── components/
    ├── GameHeader.tsx
    └── ClickerSection.tsx
```

En `game.module.css` se definen estilos compartidos por múltiples componentes de la sección.

---

## 5. Componentes React

### 5.1 Estructura Básica de un Componente

Todos los componentes React deben seguir la siguiente estructura estándar para garantizar coherencia y facilitar el mantenimiento:

```typescript
// ✅ Componente bien estructurado
import { ReactNode } from "react";
import styles from "./component-name.module.css";

interface ComponentNameProps {
  title: string;
  children: ReactNode;
  onAction?: () => void;
  isLoading?: boolean;
}

export default function ComponentName({
  title,
  children,
  onAction,
  isLoading = false,
}: ComponentNameProps) {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{title}</h2>
      {isLoading ? <div>Cargando...</div> : children}
    </div>
  );
}
```

### 5.2 Componentes Cliente vs Servidor

Next.js 16 permite diferenciar entre componentes cliente y servidor. Esta sección especifica cuándo usar cada uno.

#### 5.2.1 Componentes Servidor (Server Components)

Los componentes servidor se utilizan para:

- Acceder directamente a base de datos (Prisma)
- Operaciones de seguridad (validación de tokens)
- Datos que no cambian frecuentemente
- Reducir JavaScript enviado al cliente

**Ejemplo de componente servidor**:

```typescript
// src/app/game/page.tsx
export default async function GamePage() {
  const gameData = await fetchGameData();
  return <GameWrapper initialData={gameData} />;
}
```

#### 5.2.2 Componentes Cliente (Client Components)

Los componentes cliente se utilizan para:

- Interactividad: botones, formularios, modales
- Hooks: `useState`, `useEffect`, `useContext`
- Event listeners: clicks, cambios de entrada, etc.
- Estado local de la UI

**Marcador obligatorio**: Deben comenzar con `'use client'`:

```typescript
// src/app/game/GameWrapper.tsx
'use client';

import dynamic from 'next/dynamic';

const GameClient = dynamic(() => import('./GameClient'), { ssr: false });

export default function GameWrapper() {
  return <GameClient />;
}
```

#### 5.2.3 Patrón de Contexto

Para múltiples niveles de componentes, se recomienda usar `Context API`:

```typescript
import { createContext, useContext, ReactNode } from 'react';

interface GameContextType {
  money: number;
  userName: string;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({
  children,
  money,
  userName
}: {
  children: ReactNode;
  money: number;
  userName: string;
}) {
  return (
    <GameContext.Provider value={{ money, userName }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
}
```

### 5.3 Manejo de Errores

Todos los componentes principales deben implementar Error Boundaries:

```typescript
'use client';

import { ReactNode, useState } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error) => ReactNode;
}

export default function ErrorBoundary({
  children,
  fallback
}: ErrorBoundaryProps) {
  const [error, setError] = useState<Error | null>(null);

  if (error) {
    return fallback?.(error) ?? <div>Error: {error.message}</div>;
  }

  return <>{children}</>;
}
```

### 5.4 Importes Dinámicos (Dynamic Import)

Para componentes que requieren renderizado solo en cliente:

```typescript
import dynamic from 'next/dynamic';

const GameClient = dynamic(() => import('./GameClient'), {
  ssr: false,
  loading: () => <div>Cargando...</div>
});
```

---

## 6. Estilos CSS y Diseño Visual

### 6.1 CSS Modules - Principios Fundamentales

Los CSS Modules proporcionan encapsulación de estilos y evitan conflictos de nombres. Se utilizan las siguientes prácticas:

1. **Modularización**: Cada componente su propio archivo de estilos
2. **Nombres descriptivos**: Clases con propósito claro y semantia
3. **Nomenclatura camelCase en JavaScript**: Mientras que en CSS se usa dash-case
4. **Mobile-first**: Estilos base para dispositivos móviles, media queries para desktop

### 6.2 Ejemplo de CSS Module

```css
/* ✅ game.module.css */
.header {
  display: flex;
  justify-content: space-between;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
  gap: 1rem;
}

.headerLeft {
  flex: 1;
}

.playerName {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    padding: 0.75rem;
  }

  .playerName {
    font-size: 1.25rem;
  }
}
```

### 6.3 Importación en Componentes

Los CSS Modules se importan en TypeScript siguiendo esta convención:

```typescript
import styles from './game.module.css';

export default function GameHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <h1 className={styles.playerName}>Jugador</h1>
      </div>
    </header>
  );
}
```

### 6.4 Responsive Design

Se implementa responsive design con media queries ordenadas de forma creciente (mobile-first):

```css
.container {
  padding: 1rem;
  font-size: 1rem;
}

/* Tablets: 768px y superior */
@media (min-width: 768px) {
  .container {
    padding: 1.5rem;
    font-size: 1.1rem;
  }
}

/* Desktop: 1024px y superior */
@media (min-width: 1024px) {
  .container {
    padding: 2rem;
    font-size: 1.25rem;
  }
}
```

### 6.5 Variables CSS

Se pueden usar variables CSS para consistencia:

```css
:root {
  --color-primary: #667eea;
  --color-secondary: #764ba2;
  --spacing-unit: 1rem;
  --border-radius: 0.5rem;
}

.button {
  background-color: var(--color-primary);
  padding: var(--spacing-unit);
  border-radius: var(--border-radius);
}
```

### 6.6 Combinación de Clases

Para componentes con múltiples clases o estilos condicionales:

```typescript
// ✅ Múltiples clases
<button className={`${styles.button} ${styles.primary}`} />

// ✅ Condicionales
<div className={isLoading ? styles.loading : styles.ready} />

// ✅ Usar métodos auxiliares para lógica compleja
const getButtonClasses = (isPrimary: boolean, isDisabled: boolean) => [
  styles.button,
  isPrimary && styles.primary,
  isDisabled && styles.disabled,
].filter(Boolean).join(' ');

<button className={getButtonClasses(true, false)} />
```

---

## 7. TypeScript y Tipado

### 7.1 Tipos e Interfaces

TypeScript en modo strict (`"strict": true` en tsconfig.json) requiere tipificación completa:

```typescript
// ✅ Bien tipado
interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "player";
  createdAt: Date;
  updatedAt?: Date;
}

// ✅ Usar tipos genéricos para reutilización
type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

// ✅ Tipos de función
type UserFetcher = (id: string) => Promise<User>;

// ✅ Uniones discriminadas
type GameAction =
  | { type: "CATCH"; pokemon: Pokemon }
  | { type: "LEVEL_UP"; amount: number }
  | { type: "ERROR"; message: string };
```

### 7.2 Strict Mode

El proyecto utiliza `"strict": true` en `tsconfig.json`, lo que activa:

- `noImplicitAny`: No se permite `any` implícito
- `strictNullChecks`: `null` y `undefined` son tipos explícitos
- `strictFunctionTypes`: Verificación estricta de tipos de función
- `strictBindCallApply`: Verificación de `bind`, `call` y `apply`

**Ejemplos correctos en strict mode**:

```typescript
// ❌ Error: Type 'User | undefined' doesn't have property 'name'
function greetUser(user: User | undefined) {
  console.log(user.name);
}
// ✅ Correcto: Verificar antes de acceder
function greetUser(user: User | undefined) {
  if (user) {
    console.log(user.name);
  }
}

// ✅ O con operador de encadenamiento
console.log(user?.name ?? "Visitante");

// ✅ Alternativa: Assert de no nulo
function greetUserAssert(user: User | undefined) {
  if (!user) throw new Error("User is required");
  console.log(user.name);
}
```

### 7.3 Funciones y Parámetros Tipados

```typescript
// ✅ Función con parámetros y tipo de retorno
const calculateTotal = (items: Item[], tax: number = 0.1): number => {
  return items.reduce((sum, item) => sum + item.price, 0) * (1 + tax);
};

// ✅ Funciones asincrónicas
async function saveGameState(userId: string, state: GameState): Promise<void> {
  await prisma.usuario.update({
    where: { id: userId },
    data: { state: JSON.stringify(state) },
  });
}

// ✅ Callbacks con tipos de evento
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  console.log(event.currentTarget.id);
};

// ✅ Funciones genéricas
const createArray = <T>(item: T, length: number): T[] => {
  return Array.from({ length }, () => item);
};
```

### 7.4 Uniones Discriminadas

Para máxima seguridad de tipos con estados complejos:

```typescript
// ✅ Unión discriminada (recomendado)
type GameAction =
  | { type: "CATCH"; pokemon: Pokemon }
  | { type: "LEVEL_UP"; amount: number }
  | { type: "ERROR"; message: string };

function handleGameAction(action: GameAction) {
  switch (action.type) {
    case "CATCH":
      addPokemon(action.pokemon);
      break;
    case "LEVEL_UP":
      increaseLevelBy(action.amount);
      break;
    case "ERROR":
      console.error(action.message);
      break;
  }
}
```

---

## 8. Base de Datos (Prisma)

## 8. Base de Datos (Prisma)

### 8.1 Configuración de Prisma 7

Prisma 7 cambió la ubicación de la configuración. El proyecto utiliza:

- **Configuración**: `prisma/prisma.config.ts` (con conexión a BD)
- **Schema**: `prisma/schema.prisma` (sin URL, solo modelos)
- **URL de conexión**: Definida en `.env` como `DATABASE_URL`

### 8.2 Archivo de Configuración

```typescript
// prisma/prisma.config.ts
import "dotenv/config";

export default {
  datasource: {
    url: process.env.DATABASE_URL,
  },
};
```

### 8.3 Schema Prisma

```prisma
// prisma/schema.prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Usuario {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  password  String   // Almacenar hasheado con bcrypt
  role      Role     @default(PLAYER)
  money     Float    @default(0)

  pokemon   Pokemon[]
  mejoras   Mejora[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Role {
  ADMIN
  PLAYER
}

model Pokemon {
  id        String   @id @default(cuid())
  name      String
  level     Int      @default(1)

  usuarioId String
  usuario   Usuario  @relation(fields: [usuarioId], references: [id])

  createdAt DateTime @default(now())
}

model Mejora {
  id        String   @id @default(cuid())
  name      String
  cost      Float

  usuarioId String
  usuario   Usuario  @relation(fields: [usuarioId], references: [id])

  purchasedAt DateTime @default(now())
}
```

### 8.4 Acceso a la Base de Datos

#### En Componentes Servidor

Para acceso directo a base de datos (recomendado):

```typescript
// src/lib/db.ts
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

// Usar en Server Component:
export async function getUser(id: string) {
  return await prisma.usuario.findUnique({
    where: { id },
    include: {
      pokemon: true,
      mejoras: true,
    },
  });
}
```

#### En Componentes Cliente (vía API)

Los componentes cliente no pueden acceder a Prisma directamente. Deben usar rutas API:

```typescript
// src/app/api/users/[id]/route.ts
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const user = await prisma.usuario.findUnique({
    where: { id: params.id },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}
```

```typescript
// En componente cliente
"use client";

async function fetchUserData(id: string) {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) throw new Error("Failed to fetch user");
  return response.json();
}
```

### 8.5 Migraciones

Las migraciones deben usar el flag `--config`:

```bash
# Crear nueva migración
pnpm run db:migrate --name "feature_description"

# Aplicar migraciones (producción)
pnpm run db:migrate:deploy

# Ver estado de migraciones
pnpm run db:status

# Resetear BD (desarrollo solamente)
pnpm run db:reset

# Validar schema
pnpm run db:validate

# Ver BD con interfaz visual
pnpm run db:studio
```

**Importante**: Todas las migraciones incluyen automáticamente `--config prisma/prisma.config.ts`

---

## 9. Autenticación y Seguridad

### Configuración NextAuth

```typescript
// src/lib/auth/config.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { loginSchema } from "@/lib/validations/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";

export const authConfig: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsedCredentials = loginSchema.safeParse(credentials);
        if (!parsedCredentials.success) return null;

        const { email, password } = parsedCredentials.data;
        const user = await prisma.usuario.findUnique({ where: { email } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};
```

### 9.1 Configuración de NextAuth

NextAuth 4.24.14 maneja autenticación y sesiones. La configuración utiliza `CredentialsProvider` para validación de email/contraseña:

```typescript
// src/lib/auth/config.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { loginSchema } from "@/lib/validations/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";

export const authConfig: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsedCredentials = loginSchema.safeParse(credentials);
        if (!parsedCredentials.success) return null;

        const { email, password } = parsedCredentials.data;
        const user = await prisma.usuario.findUnique({ where: { email } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
};
```

### 9.2 Uso en Componentes Cliente

Para acceder a la sesión en componentes cliente:

```typescript
'use client';

import { useSession, signOut } from 'next-auth/react';

export default function UserMenu() {
  const { data: session, status } = useSession();

  if (status === 'loading') return <div>Cargando...</div>;
  if (status === 'unauthenticated') {
    return <a href="/auth/login">Iniciar sesión</a>;
  }

  return (
    <div>
      <p>Bienvenido, {session?.user?.name}</p>
      <button onClick={() => signOut({ callbackUrl: '/auth/login' })}>
        Cerrar sesión
      </button>
    </div>
  );
}
```

### 9.3 Protección de Rutas

Para proteger rutas de administrador:

```typescript
// src/app/admin/layout.tsx
import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || (session.user as any)?.role !== 'ADMIN') {
    redirect('/');
  }

  return <>{children}</>;
}
```

### 9.4 Seguridad de Contraseñas

Las contraseñas se almacenan hasheadas con bcrypt:

```typescript
import bcrypt from "bcrypt";

// Al registrar usuario
const hashedPassword = await bcrypt.hash(plainPassword, 10);
await prisma.usuario.create({
  data: {
    email,
    name,
    password: hashedPassword,
  },
});

// Al verificar contraseña
const isValid = await bcrypt.compare(plainPassword, hashedPassword);
```

---

## 10. Validación de Datos

````typescript
// src/lib/validations/auth.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Nombre requerido"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
### 10.1 Esquemas Zod

Zod 4.4.2 proporciona validación en tiempo de ejecución. Se definen esquemas para validar datos de entrada:

```typescript
// src/lib/validations/auth.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

export const registerSchema = loginSchema.extend({
  name: z.string().min(2, 'Nombre requerido'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

// Extraer tipos TypeScript de los esquemas
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
````

### 10.2 Validación en Rutas API

```typescript
// src/app/api/auth/register/route.ts
import { registerSchema } from "@/lib/validations/auth";
import { z } from "zod";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validar datos contra esquema
    const validatedData = registerSchema.parse(body);

    // Procesar registro con datos validados...

    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ errors: error.flatten() }, { status: 400 });
    }
    return Response.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
```

### 10.3 Validación en Componentes Cliente

```typescript
'use client';

import { registerSchema, type RegisterInput } from '@/lib/validations/auth';

export default function RegisterForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (formData: FormData) => {
    try {
      const data = {
        email: formData.get('email'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword'),
        name: formData.get('name'),
      };

      // Validar antes de enviar
      const validatedData = registerSchema.parse(data);

      // Enviar al servidor...
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(error.flatten().fieldErrors as Record<string, string>);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Formulario */}
    </form>
  );
}
```

### 10.4 Esquema de Estado de Juego

```typescript
// src/lib/validations/gameState.ts
import { z } from "zod";

export const gameStateSchema = z.object({
  money: z.number().min(0),
  level: z.number().min(1),
  pokemonCaught: z.array(z.string()),
  improvements: z.record(z.number()),
});

export type GameState = z.infer<typeof gameStateSchema>;
```

---

## 11. Importes y Path Aliases

### 11.1 Configuración en `tsconfig.json`

El proyecto utiliza path aliases para simplificar importes:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 11.2 Uso de Path Aliases

```typescript
// ✅ Con alias (recomendado)
import { prisma } from "@/lib/db";
import styles from "@/app/game/game.module.css";
import GameHeader from "@/app/game/components/GameHeader";
import { useGame } from "@/lib/hooks/useGame";

// ❌ Sin alias (evitar)
import { prisma } from "../../../lib/db";
import styles from "../../../app/game/game.module.css";
```

### 11.3 Rutas Comunes

| Alias        | Ruta             | Propósito                                     |
| ------------ | ---------------- | --------------------------------------------- |
| `@/lib`      | `./src/lib`      | Funciones de utilidad, db, auth, validaciones |
| `@/app`      | `./src/app`      | Estructura de rutas de Next.js                |
| `@/services` | `./src/services` | Servicios externos (API calls)                |
| `@/types`    | `./src/types`    | Definiciones de tipos TypeScript              |

---

## 12. Buenas Prácticas de Desarrollo

### 12.1 Principio DRY (Don't Repeat Yourself)

El código duplicado dificulta el mantenimiento. Se debe reutilizar lógica:

```typescript
// ❌ Código repetitivo
const checkUserAdmin = (role: string) => role === "admin";
const checkUserPlayer = (role: string) => role === "player";
const checkUserMod = (role: string) => role === "moderator";

// ✅ Reutilizable
const hasRole = (userRole: string, requiredRole: string): boolean =>
  userRole === requiredRole;

// ✅ Usando array
const ADMIN_ROLES = ["admin", "superadmin"];
const isAdmin = (role: string) => ADMIN_ROLES.includes(role);
```

### 12.2 Single Responsibility Principle

Cada componente o función debe tener una única responsabilidad:

```typescript
// ❌ Componente hace demasiado
function GameScreen() {
  // Lógica de renderizado
  // Lógica de guardado
  // Lógica de audio
  // Lógica de eventos
}

// ✅ Componentes especializados
function GamePage() {
  return (
    <>
      <GameRenderer />
      <GameUI />
      <GameAudioManager />
    </>
  );
}
```

### 12.3 Manejo de Errores

El manejo robusto de errores es esencial:

```typescript
// ✅ Manejo completo
export async function handleUserAction(userId: string) {
  try {
    const user = await prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // Procesamiento...

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
      return { success: false, error: error.message };
    }
    throw error;
  }
}
```

### 12.4 Async/Await

Preferir `async/await` sobre promesas anidadas:

```typescript
// ✅ Async/await legible
async function loadGameData(userId: string) {
  try {
    const user = await fetchUser(userId);
    const inventory = await fetchInventory(userId);
    const stats = await fetchStats(userId);

    return { user, inventory, stats };
  } catch (error) {
    console.error("Error loading game data", error);
    throw error;
  }
}

// ✅ Paralelizar cuando sea posible
async function loadGameDataParallel(userId: string) {
  const [user, inventory, stats] = await Promise.all([
    fetchUser(userId),
    fetchInventory(userId),
    fetchStats(userId),
  ]);

  return { user, inventory, stats };
}
```

### 12.5 Comentarios Significativos

Los comentarios deben explicar el "por qué", no el "qué":

````typescript
// ✅ Comentario útil
// Usar bcrypt con salt de 10 para equilibrar seguridad y velocidad
const hashedPassword = await bcrypt.hash(plainPassword, 10);

// ❌ Comentario innecesario
// Hashear la contraseña
const hashedPassword = await bcrypt.hash(plainPassword, 10);
// Usamos debounce de 300ms para evitar múltiples guardaros
// mientras el usuario ajusta su configuración
const debouncedSave = debounce(() => saveGame(), 300);

// ✅ Documentar decisiones no obvias
// El cálculo de daño incluye bonus crítico pero excluye
// el bonus de tipo Pokémon porque se aplica después
const calculateDamage = (base: number, crits: number) => {
  return (base * (1 + crits)) * CRITICAL_MULTIPLIER;
};

### 12.6 Tamaño de Funciones

Las funciones deben ser pequeñas y enfocadas en una única tarea:

```typescript
// ❌ Función muy larga (antipatrón)
function processPlayerAction() {
  // 200 líneas de código...
}

// ✅ Funciones pequeñas y especializadas
function processPlayerAction(action: PlayerAction): void {
  validateAction(action);
  executeAction(action);
  saveGameState();
}

function validateAction(action: PlayerAction): void {
  if (!action || !action.type) {
    throw new Error('Invalid action');
  }
}

function executeAction(action: PlayerAction): void {
  // Ejecutar la acción...
}
````

### 12.7 Nombres Consistentes

Los nombres deben ser descriptivos y seguir convenciones:

```typescript
// ✅ Nombres descriptivos y consistentes
const pokemonRepository = {
  findById: async (id: string) => {},
  findAll: async () => {},
  findByRarity: async (rarity: string) => {},
  save: async (pokemon: Pokemon) => {},
  delete: async (id: string) => {},
};

// ❌ Nombres genéricos e inconsistentes
const data = {
  get: async () => {},
  set: async () => {},
  fetch: async () => {},
};
```

---

## 13. Ejemplos Prácticos

```typescript
// src/app/game/components/PokemonCard.tsx
"use client";

import { useState } from "react";
import styles from "../game.module.css";

interface Pokemon {
  id: string;
  name: string;
  imageUrl: string;
  rarity: "common" | "rare" | "legendary";
}

interface PokemonCardProps {
  pokemon: Pokemon;
  onSelect: (pokemon: Pokemon) => void;
  isSelected?: boolean;
}

export default function PokemonCard({
  pokemon,
  onSelect,
  isSelected = false,
}: PokemonCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    onSelect(pokemon);
  };

  const cardClassName = [
    styles.pokemonCard,
    isSelected && styles.selected,
    isHovered && styles.hovered,
    styles[`rarity-${pokemon.rarity}`],
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article
      className={cardClassName}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
    >
      <div className={styles.cardImage}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={pokemon.imageUrl} alt={pokemon.name} />
      </div>
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{pokemon.name}</h3>
        <span className={styles.rarityBadge}>{pokemon.rarity}</span>
      </div>
    </article>
  );
}
```

````css
/* src/app/game/game.module.css - Extensión */
.pokemonCard {
  display: flex;
  flex-direction: column;
  border-radius: 0.5rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fff;
  box-shadow: var(--shadow-sm);
}

.pokemonCard:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.pokemonCard.selected {
  border: 2px solid var(--color-primary);
}

.cardImage {
  width: 100%;
  aspect-ratio: 1;
  background: var(--color-gray-100);
  overflow: hidden;
}

.cardImage img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.cardContent {
  padding: var(--space-md);
}

.cardTitle {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.rarityBadge {
  display: inline-block;
  margin-top: var(--space-sm);
  padding: 0.25rem 0.75rem;
  background: var(--color-secondary);
  color: #fff;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.rarity-common {
  --color-secondary: #6b7280;
}

.rarity-rare {
  --color-secondary: #3b82f6;
}

.rarity-legendary {
  --color-secondary: #f59e0b;
}
### 13.1 Componente Cliente Completo

Este ejemplo muestra un componente cliente con tipificación, estilos CSS Modules e interactividad:

```typescript
// src/app/game/components/PokemonCard.tsx
'use client';

import { useState } from 'react';
import styles from '../game.module.css';

interface Pokemon {
  id: string;
  name: string;
  imageUrl: string;
  rarity: 'common' | 'rare' | 'legendary';
}

interface PokemonCardProps {
  pokemon: Pokemon;
  onSelect: (pokemon: Pokemon) => void;
  isSelected?: boolean;
}

export default function PokemonCard({
  pokemon,
  onSelect,
  isSelected = false,
}: PokemonCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    onSelect(pokemon);
  };

  const cardClassName = [
    styles.pokemonCard,
    isSelected && styles.selected,
    isHovered && styles.hovered,
    styles[`rarity-${pokemon.rarity}`],
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article
      className={cardClassName}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
    >
      <div className={styles.cardImage}>
        <img src={pokemon.imageUrl} alt={pokemon.name} />
      </div>
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{pokemon.name}</h3>
        <span className={styles.rarityBadge}>{pokemon.rarity}</span>
      </div>
    </article>
  );
}
````

### 13.2 Estilos CSS Correspondientes

```css
/* src/app/game/game.module.css */
.pokemonCard {
  display: flex;
  flex-direction: column;
  border-radius: 0.5rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fff;
  box-shadow: var(--shadow-sm);
}

.pokemonCard:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.pokemonCard.selected {
  border: 2px solid var(--color-primary);
}

.cardImage {
  width: 100%;
  aspect-ratio: 1;
  background: var(--color-gray-100);
  overflow: hidden;
}

.cardImage img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.cardContent {
  padding: var(--space-md);
}

.cardTitle {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.rarityBadge {
  display: inline-block;
  margin-top: var(--space-sm);
  padding: 0.25rem 0.75rem;
  background: var(--color-secondary);
  color: #fff;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.rarity-common {
  --color-secondary: #6b7280;
}
.rarity-rare {
  --color-secondary: #3b82f6;
}
.rarity-legendary {
  --color-secondary: #f59e0b;
}
```

### 13.3 Ruta API Completa

```typescript
// src/app/api/game/save/route.ts
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { gameStateSchema } from "@/lib/validations/gameState";
import { z } from "zod";

export async function POST(request: Request) {
  try {
    // Paso 1: Autenticación
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    // Paso 2: Validar datos
    const body = await request.json();
    const validatedState = gameStateSchema.parse(body);

    // Paso 3: Guardar en BD
    await prisma.usuario.update({
      where: { id: session.user.id },
      data: {
        money: validatedState.money,
        // ... otros campos
      },
    });

    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: "Datos inválidos", details: error.flatten() },
        { status: 400 },
      );
    }

    console.error("Error saving game:", error);
    return Response.json(
      { error: "Error al guardar el juego" },
      { status: 500 },
    );
  }
}
```

---

## 14. Checklist de Calidad

Antes de hacer commit, verificar los siguientes puntos:

### Código

- [ ] Código pasa linting: `pnpm lint`
- [ ] TypeScript sin errores (verificar en editor)
- [ ] Nombres descriptivos y consistentes en todo el código
- [ ] Componentes son reutilizables y no tienen dependencias ocultas
- [ ] Props correctamente tipadas con interfaces
- [ ] Manejo de errores implementado en rutas API y componentes
- [ ] Sin `console.log`, `console.debug` o código de debugging
- [ ] Sin `any` explícitos en TypeScript

### Estilos

- [ ] CSS Modules organizados y colocalizados con componentes
- [ ] Clases en dash-case dentro de CSS
- [ ] Responsive design probado en móvil y desktop
- [ ] Variables CSS utilizadas para colores y espaciado
- [ ] No hay estilos globales conflictivos

### Accesibilidad

- [ ] Elementos interactivos tienen `role` apropiado
- [ ] Inputs tienen `label` asociado
- [ ] Navegación por teclado funciona correctamente
- [ ] Contraste de colores suficiente (WCAG AA mínimo)

### Base de Datos

- [ ] Migraciones aplicadas correctamente: `pnpm run db:status`
- [ ] Schema Prisma válido: `pnpm run db:validate`
- [ ] Tipos generados: `pnpm run db:generate`

### Seguridad

- [ ] Contraseñas hasheadas con bcrypt
- [ ] Validación de entrada con Zod
- [ ] Rutas protegidas verifican autenticación
- [ ] No hay datos sensibles en el cliente

---

## Recursos Útiles

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Prisma Docs](https://www.prisma.io/docs/)
- [Zod Documentation](https://zod.dev)
- [NextAuth.js](https://next-auth.js.org/)

---

**Última actualización**: Mayo 18, 2026  
**Responsable**: Equipo de Desarrollo  
**Cambios recientes**: Migración a Prisma 7, Next.js 16, React 19 con Compiler
