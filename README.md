# Rumi

Plataforma SaaS para el mercado colombiano que conecta arrendadores, inquilinos y compañeros de cuarto. Interfaz completamente en español.

## Tech Stack

| Capa | Tecnologia |
|------|-----------|
| Frontend | React 19, Vite 6, Tailwind CSS v4, Zustand 5, TanStack Query 5 |
| Backend | Fastify 5, Zod, TypeScript |
| Base de datos | PostgreSQL, Prisma 6 |
| Autenticacion | JWT local (desarrollo) / AWS Cognito (produccion) |
| Infraestructura | AWS CDK, Lambda, S3 |

## Prerequisitos

- **Node.js** >= 20.0.0
- **npm** >= 10.0.0
- **PostgreSQL** instalado y corriendo

```bash
# Verificar versiones
node --version   # v20.x.x o superior
npm --version    # 10.x.x o superior
psql --version   # Cualquier version reciente
```

### Instalar PostgreSQL

**macOS (Homebrew):**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Ubuntu/Debian:**
```bash
sudo apt update && sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

## Quick Start

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/rumi.git
cd rumi

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
```

Editar el archivo `.env` y actualizar la variable `DATABASE_URL` con tu conexion de PostgreSQL:

```bash
# macOS (Homebrew) — usa tu nombre de usuario del sistema, sin contraseña
DATABASE_URL=postgresql://TU_USUARIO_MAC@localhost:5432/rumi

# Linux — normalmente el usuario por defecto es 'postgres'
DATABASE_URL=postgresql://postgres:tu_contraseña@localhost:5432/rumi
```

> **Tip:** En macOS con Homebrew, tu usuario de PostgreSQL es el mismo que tu usuario del sistema. Ejecuta `whoami` para verificar.

```bash
# 4. Crear la base de datos
createdb rumi

# 5. Generar el cliente de Prisma
npm run db:generate

# 6. Ejecutar migraciones
npm run db:migrate

# 7. Sembrar datos de prueba
npm run db:seed

# 8. Iniciar servidores de desarrollo (API + Web)
npm run dev
```

Abrir en el navegador:
- **Frontend:** http://localhost:5173
- **API:** http://localhost:3000/api/v1/health

## Variables de Entorno

Variables requeridas para desarrollo local (`STAGE=localdev`):

| Variable | Valor | Descripcion |
|----------|-------|-------------|
| `STAGE` | `localdev` | Modo de autenticacion (localdev usa JWT local) |
| `VITE_STAGE` | `localdev` | Stage para el frontend |
| `DATABASE_URL` | `postgresql://usuario@localhost:5432/rumi` | Conexion a PostgreSQL |
| `JWT_SECRET` | `rumi-local-dev-secret-change-me-in-prod` | Secreto para firmar tokens JWT |
| `API_PORT` | `3000` | Puerto del servidor API |
| `API_BASE_URL` | `http://localhost:3000` | URL base del API |
| `VITE_API_URL` | `http://localhost:3000` | URL del API para el frontend |

> Las variables de AWS Cognito, S3, y CDK solo son necesarias para los stages `dev` y `prod`.

## Scripts Disponibles

| Comando | Descripcion |
|---------|-------------|
| `npm run dev` | Inicia API + Web concurrentemente |
| `npm run dev:api` | Solo el servidor API (puerto 3000) |
| `npm run dev:web` | Solo el frontend Vite (puerto 5173) |
| `npm run build` | Construye todos los paquetes |
| `npm run test` | Ejecuta tests con Jest |
| `npm run lint` | Verifica codigo con ESLint |
| `npm run lint:fix` | Corrige errores de ESLint automaticamente |
| `npm run format` | Formatea codigo con Prettier |
| `npm run typecheck` | Verifica tipos TypeScript |
| `npm run db:generate` | Genera el cliente de Prisma |
| `npm run db:migrate` | Ejecuta migraciones de base de datos |
| `npm run db:seed` | Siembra datos de prueba |
| `npm run clean` | Limpia artefactos de build |

## Usuarios de Prueba

Despues de ejecutar `npm run db:seed`, los siguientes usuarios estan disponibles (contraseña: `password123`):

| Email | Rol | Descripcion |
|-------|-----|-------------|
| `julian@test.com` | ROOMMATE | Desarrollador, usuario principal de prueba |
| `maria@test.com` | NONE (arrendadora) | Propietaria con multiples inmuebles |
| `carlos@test.com` | ROOMMATE | Estudiante de ingenieria |
| `ana@test.com` | ROOMMATE | Diseñadora grafica |
| `santiago@test.com` | ROOMMATE | Chef profesional |
| `valentina@test.com` | ROOMMATE | Estudiante de medicina |
| `andres@test.com` | ROOMMATE | Analista financiero |
| `camila@test.com` | ROOMMATE | Musica freelance |
| `diego@test.com` | ROOMMATE | Abogado |
| `laura@test.com` | ROOMMATE | Marketing digital |
| `felipe@test.com` | ROOMMATE | Fotografo |
| `isabella@test.com` | ROOMMATE | Nutricionista |
| `mateo@test.com` | ROOMMATE | Emprendedor tech |
| `daniela@test.com` | ROOMMATE | Instructora de yoga (argentina) |
| `nicolas@test.com` | ROOMMATE | Ingeniero de sistemas |
| `mariana@test.com` | ROOMMATE | Consultora (venezolana) |

**Datos pre-cargados:** 12 inmuebles, 14 perfiles de roommate, 4 matches, 4 conversaciones con mensajes, 14 swipes, 3 calificaciones.

## Estructura del Proyecto

```
rumi/
├── packages/
│   ├── shared/          # @rumi/shared — Schemas Zod, tipos, constantes
│   ├── db/              # @rumi/db — Prisma ORM, migraciones, seed
│   │   └── prisma/
│   │       ├── schema.prisma
│   │       ├── seed.ts
│   │       └── migrations/
│   ├── api/             # @rumi/api — Servidor Fastify
│   │   └── src/
│   │       ├── server.ts
│   │       ├── app.ts
│   │       ├── plugins/     # Auth, CORS, errores
│   │       └── routes/      # auth, users, properties, roommates, matches, messages
│   ├── web/             # @rumi/web — Frontend React
│   │   └── src/
│   │       ├── pages/       # Paginas de la app
│   │       ├── components/  # Componentes UI
│   │       ├── store/       # Zustand stores
│   │       ├── services/    # Cliente API (axios)
│   │       └── i18n/        # Traducciones (español)
│   └── infra/           # @rumi/infra — AWS CDK (no necesario para dev local)
├── .env.example         # Plantilla de variables de entorno
├── CLAUDE.md            # Contexto completo del proyecto
├── ARCHITECTURE.md      # Documentacion de arquitectura
└── package.json         # Monorepo root (npm workspaces)
```

## Probar desde el Celular

Para acceder a la app desde tu celular (ambos dispositivos deben estar en la misma red WiFi):

1. Obtener la IP local de tu computador:
   ```bash
   # macOS
   ipconfig getifaddr en0

   # Linux
   hostname -I | awk '{print $1}'
   ```

2. Abrir en el navegador del celular:
   ```
   http://TU_IP_LOCAL:5173
   ```

3. Iniciar sesion con cualquier usuario de prueba.

## API Endpoints

| Grupo | Ruta Base | Descripcion |
|-------|-----------|-------------|
| Health | `GET /api/v1/health` | Estado del servidor |
| Auth | `/api/v1/auth/*` | Registro, login |
| Users | `/api/v1/users/*` | Perfil, modo de busqueda |
| Properties | `/api/v1/properties/*` | CRUD inmuebles, busqueda, vistas |
| Roommates | `/api/v1/roommates/*` | Perfil roommate, candidatos, swipes |
| Matches | `/api/v1/matches/*` | Lista de matches, unmatch |
| Messages | `/api/v1/messages/*` | Conversaciones, mensajes |
| Applications | `/api/v1/applications/*` | Solicitudes de arriendo |
| Ratings | `/api/v1/ratings/*` | Calificaciones de usuarios |
