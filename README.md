# 🎮 Pokeclicker - Juego Clicker de Pokémon

Un juego clicker interactivo basado en el universo Pokémon, construido con tecnologías modernas de frontend y backend. Los usuarios pueden capturar Pokémon, acceder a una Pokédex, ganar monedas y comprar mejoras.

## ✨ Características Principales

- **Sistema de Clicker**: Captura Pokémon haciendo clic con mecánicas de juego progresivas
- **Pokédex Interactivo**: Visualiza y rastrea todos los Pokémon capturados
- **Sistema de Economía**: Gana monedas capturando Pokémon
- **Mejoras del Juego**: Compra mejoras que aumentan ganancias (CPS - monedas por segundo)
- **Autenticación de Usuarios**: Sistema seguro de registro e inicio de sesión
- **Panel de Administración**: Gestión de usuarios, estadísticas del juego y precios
- **Persistencia de Datos**: Guarda automática del progreso del juego
- **Responsivo**: Compatible con dispositivos móviles y de escritorio

## 🛠️ Stack Tecnológico

### Frontend

- **Next.js 15+** - Framework React con SSR/SSG
- **TypeScript** - Tipado estático para mayor seguridad
- **CSS Modules** - Estilos encapsulados y mantenibles
- **React Hooks** - Gestión de estado y efectos

### Backend

- **Next.js API Routes** - Endpoints RESTful
- **NextAuth.js** - Autenticación y sesiones
- **Prisma 7** - ORM para manejo de base de datos
- **Rate Limiting** - Protección contra abuso de APIs

### Base de Datos

- **Prisma 7** - Migraciones de esquema versionadas
- **MariaDB** - Base de datos relacional
- **Modelos**: Usuario, Pokémon, PrecioItem

### DevOps

- **pnpm** - Gestor de paquetes rápido y eficiente
- **ESLint** - Linting de código
- **TypeScript Compiler** - Compilación y validación de tipos

## 📦 Requisitos Previos

- **Node.js** 18+ o superior
- **pnpm** 8+ (gestor de paquetes)
- **MariaDB** - Base de datos requerida

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd pokeclicker
```

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Base de datos (MariaDB)
DATABASE_URL="mysql://usuario:contraseña@localhost:3306/pokeclicker"

# NextAuth
NEXTAUTH_SECRET="tu-secreto-muy-seguro-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Configurar la base de datos

```bash
# Aplicar migraciones
pnpm run db:migrate

# Cargar datos iniciales (automático con postinstall)
pnpm run db:seed
```

### 5. Iniciar servidor de desarrollo

```bash
pnpm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📋 Scripts Disponibles

```bash
# Desarrollo
pnpm run dev              # Inicia servidor de desarrollo

# Build
pnpm run build            # Construye para producción
pnpm run start            # Inicia servidor en producción

# Linting y Validación
pnpm run lint             # Ejecuta ESLint

# Base de Datos (Prisma)
pnpm run db:migrate       # Crea nueva migración e aplica cambios
pnpm run db:migrate:deploy # Aplica migraciones sin crear nuevas
pnpm run db:push          # Sincroniza esquema sin migraciones
pnpm run db:reset         # Reinicia BD y reaplica todas las migraciones
pnpm run db:studio        # Abre Prisma Studio (gestor visual de BD)
pnpm run db:validate      # Valida esquema Prisma
pnpm run db:status        # Estado actual de migraciones
pnpm run db:generate      # Regenera Prisma Client

# Seed
pnpm run db:seed          # Carga datos iniciales (precios de items)
```

## 📁 Estructura del Proyecto

```
src/
├── app/                          # Rutas y páginas de Next.js
│   ├── auth/                     # Autenticación (login, registro)
│   ├── game/                     # Página principal del juego
│   ├── admin/                    # Panel de administración
│   │   ├── economy/              # Gestión de economía
│   │   ├── settings/             # Configuración
│   │   └── users/                # Gestión de usuarios
│   └── api/                      # Rutas API
│       ├── auth/                 # Autenticación NextAuth
│       ├── game/                 # Guardado y estado del juego
│       ├── admin/                # APIs de admin
│       └── pokeapi/              # Integración con PokeAPI
├── lib/                          # Funciones de utilidad
│   ├── auth/                     # Configuración de autenticación
│   ├── db.ts                     # Instancia de Prisma Client
│   ├── middleware/               # Rate limiting, etc.
│   └── validations/              # Esquemas de validación
├── services/                     # Servicios externos
│   └── pokeapi.ts               # Cliente de PokeAPI
└── auth.ts                       # Configuración central de NextAuth

prisma/
├── prisma.config.ts             # Configuración de Prisma 7
├── schema.prisma                # Esquema de BD
└── migrations/                  # Historial de migraciones
```

## 🎮 Cómo Jugar

1. **Registrarse**: Crea una cuenta o inicia sesión en el juego
2. **Haz Clic**: Haz clic repetidamente en la pantalla para capturar Pokémon y ganar monedas
3. **Gana Monedas**: Cada clic te otorga monedas. Algunos Pokémon dan más monedas que otros
4. **Compra Mejoras**: Usa tus monedas para comprar mejoras (bolas, punches, etc.) que aumentan:
   - **CPS** (monedas por segundo): Gana monedas automáticamente
   - **Click Bonus**: Gana más monedas por cada clic
5. **Obten Pokémon**: Cada pokemon sale de un sobre y este se registra en tu Pokédex
6. **Progresa**: A más mejoras compres, más rápido ganarás monedas. ¡El progreso es infinito!

## 🔐 Sistema de Autenticación

- **NextAuth.js**: Gestión segura de sesiones
- **Credenciales**: Registro e inicio de sesión con usuario/contraseña
- **Sesiones Persistentes**: Mantén tu sesión entre visitas
- **Contraseñas Hasheadas**: Protección con bcrypt

## 💾 Modelos de Datos

### Usuario

- ID único
- Email y contraseña (hasheada)
- Monedas del juego
- Clicks históricos
- Tema de preferencia (claro/oscuro/sistema)
- Rol (jugador/admin)

### Pokémon

- ID de PokeAPI
- Nombre y datos del Pokémon
- Relación con Usuario (capturado por)

### PrecioItem

- Nombre del item
- Tipos: mejora, sobre
- Precio base
- Bonificadores: CPS (monedas por segundo) y click_bonus

## 🛡️ Seguridad

- **Rate Limiting**: Protección contra spam y abuso
- **Validación de Entrada**: Esquemas Zod para todas las APIs
- **Autenticación NextAuth**: Sesiones seguras
- **CORS Configurado**: Control de acceso cross-origin
- **Variables de Entorno**: Secretos nunca en el código
- **Validación de Esquema**: Migraciones versionadas y controladas

## 👨‍💻 Desarrollo

### Agregar Nueva Funcionalidad

1. **Crear página**: Agrega en `src/app/`
2. **Crear API**: Agrega en `src/app/api/`
3. **Actualizar esquema**: Modifica `prisma/schema.prisma`
4. **Crear migración**: `pnpm run db:migrate --name "feature_name"`
5. **Probar localmente**: `pnpm run dev`

### Convenciones de Código

- **TypeScript**: Siempre tipado
- **Componentes**: Usa Client Components solo cuando sea necesario
- **Estilos**: Usa CSS Modules para encapsulación
- **Validación**: Usa Zod para validar datos de usuario

## 🐛 Troubleshooting

### "Database error" o problemas de conexión

```bash
# Reinicia la base de datos
pnpm run db:reset

# Valida el esquema
pnpm run db:validate
```

### Prisma Client no generado

```bash
# Regenera Prisma Client
pnpm run db:generate
```

### Problemas con las migraciones

```bash
# Ver estado actual
pnpm run db:status

# Si todo falla, reiniciar
pnpm run db:reset
```

## 📚 Documentación Adicional

- [GUIA_DE_ESTILOS.md](./GUIA_DE_ESTILOS.md) - Guía de estilos del proyecto
- [DATABASE_QUICK_START.md](./DATABASE_QUICK_START.md) - Guía rápida de base de datos
- [PRISMA_7_SETUP.md](./PRISMA_7_SETUP.md) - Configuración detallada de Prisma 7

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama para tu feature: `git checkout -b feature/AmazingFeature`
3. Commit tus cambios: `git commit -m 'Add some AmazingFeature'`
4. Push a la rama: `git push origin feature/AmazingFeature`
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo licencia MIT. Ver `LICENSE` para más detalles.

## 👤 Autor

Proyecto de desarrollo educativo - Carlos Gonzalez Rodriguez - CIFP A Carballeira

## 🙏 Créditos

- [PokéAPI](https://pokeapi.co/) - Datos de Pokémon
- [Next.js](https://nextjs.org/) - Framework React
- [Prisma](https://www.prisma.io/) - ORM
- [NextAuth.js](https://next-auth.js.org/) - Autenticación

---

**¿Preguntas o problemas?** Abre un issue en el repositorio.
