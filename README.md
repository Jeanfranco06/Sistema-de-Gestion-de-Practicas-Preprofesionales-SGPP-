# SGPP - Sistema de Gestion de Practicas Preprofesionales

Plataforma web para administrar el ciclo de practicas preprofesionales de la Escuela Profesional de Ingenieria Industrial de la Universidad Nacional de Trujillo. Centraliza los tramites, documentos, planes, convenios, seguimiento y control de horas para estudiantes, docentes asesores, tutores externos y personal administrativo.

![Estado](https://img.shields.io/badge/estado-en%20desarrollo-yellow)
![Backend](https://img.shields.io/badge/backend-Spring%20Boot%203-6DB33F)
![Frontend](https://img.shields.io/badge/frontend-React%2019-149ECA)
![Database](https://img.shields.io/badge/base%20de%20datos-PostgreSQL%2015-4169E1)

## Tecnologias

| Capa | Tecnologias |
| --- | --- |
| Backend | Java 17, Spring Boot 3.2, Spring Security, JWT, Spring Data JPA, Flyway y OpenAPI |
| Frontend | React 19, TypeScript, Vite, React Router, React Query, Tailwind CSS y MUI |
| Base de datos | PostgreSQL 15 |
| Infraestructura local | Docker Compose y pgAdmin |

## Estructura

```text
.
|-- backend/
|   |-- sgpp-api/       # Aplicacion Spring Boot, seguridad y migraciones Flyway
|   |-- sgpp-core/      # Dominio, servicios y controladores REST
|   `-- sgpp-shared/    # Tipos, excepciones y enumeraciones compartidas
|-- frontend/           # Aplicacion React + Vite
|-- docs/               # Guias tecnicas, funcionales y de despliegue
`-- docker-compose.yml  # PostgreSQL y pgAdmin para desarrollo local
```

## Requisitos

- Java 17 o superior
- Maven 3.8 o superior
- Node.js 18 o superior
- Docker y Docker Compose

## Inicio rapido

1. Cree los archivos de entorno a partir de las plantillas:

   ```powershell
   Copy-Item .env.example .env
   Copy-Item frontend/.env.example frontend/.env
   ```

2. Inicie PostgreSQL y pgAdmin:

   ```bash
   docker compose up -d
   ```

3. En una terminal, compile e inicie la API:

   ```bash
   cd backend
   mvn -pl sgpp-api -am package
   mvn -pl sgpp-api spring-boot:run
   ```

4. En otra terminal, instale e inicie el frontend:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

El perfil local utiliza PostgreSQL en el puerto `5434`. El archivo `frontend/.env` debe conservar `VITE_API_BASE_URL=http://localhost:8082/api/v1`.

| Servicio | Direccion |
| --- | --- |
| Frontend | http://localhost:5173 |
| API | http://localhost:8082/api/v1 |
| Swagger UI | http://localhost:8082/api/v1/swagger-ui.html |
| pgAdmin | http://localhost:5051 |

## Configuracion

Las variables locales se definen en `.env`; no suba este archivo al repositorio. Las principales son:

| Variable | Uso | Valor local predeterminado |
| --- | --- | --- |
| `POSTGRES_DB` | Base de datos | `sgpp_db` |
| `POSTGRES_USER` | Usuario de PostgreSQL | `postgres` |
| `POSTGRES_PASSWORD` | Contrasena de PostgreSQL | `postgres` |
| `POSTGRES_PORT` | Puerto publicado de PostgreSQL | `5434` |
| `JWT_SECRET` | Firma de tokens JWT | Debe reemplazarse por un secreto propio |
| `VITE_API_BASE_URL` | URL publica de la API para el frontend | `http://localhost:8082/api/v1` |

## Verificacion

Ejecute las comprobaciones antes de abrir un cambio:

```bash
# Backend, desde backend/
mvn -pl sgpp-api -am test

# Frontend, desde frontend/
npm run lint
npm run build
```

## Usuarios de prueba

Las migraciones Flyway crean cuentas iniciales con la contrasena `password123`.

| Usuario | Rol |
| --- | --- |
| `adminsys1` | ADMIN_SISTEMA |
| `estudiante1` | ESTUDIANTE |
| `docente1` | DOCENTE_ASESOR |
| `tutor1` | TUTOR_EXTERNO |
| `secretaria1` | SECRETARIA |
| `comite1` | COMITE_PRACTICAS |
| `director1` | DIRECTOR |

Cambie o deshabilite estas credenciales antes de publicar el sistema.

## Documentacion

- [Guia de ejecucion local](docs/GUIA_EJECUCION_LOCAL.md)
- [Manual de usuario](docs/MANUAL_USUARIO_SGPP.md)
- [Documentacion del codigo fuente](docs/DOCUMENTACION_CODIGO_FUENTE_SGPP.md)
- [Estado funcional](docs/ESTADO_FUNCIONAL_SGPP.md)
- [Plan de pruebas E2E](docs/PLAN_DE_PRUEBAS_E2E.md)
- [Despliegue en produccion](docs/DESPLIEGUE_PRODUCCION.md)
- [Ejemplos de solicitudes API](docs/API_TEST_EXAMPLES.md)

## Produccion

La guia de [despliegue en produccion](docs/DESPLIEGUE_PRODUCCION.md) describe la configuracion propuesta con Vercel para el frontend, Render para la API y Supabase para PostgreSQL y archivos. Configure secretos y origenes CORS directamente en el proveedor; nunca exponga credenciales en variables `VITE_*`.
