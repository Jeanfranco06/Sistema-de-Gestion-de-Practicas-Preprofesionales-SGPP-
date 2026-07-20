# Guía de Ejecución Local del SGPP

## Requisitos

- JDK 17 (definir `JAVA_HOME` en `C:\Program Files\Java\jdk-17` o la ruta correspondiente)
- Maven 3.9+
- Node.js 20+ y npm 10+
- PostgreSQL 15+ (o usar Docker Compose)
- (Opcional) Git

## Variables de entorno

### Backend

Crear un archivo `backend/.env` o exportar las variables en el sistema operativo. Las propiedades se leen desde `application.yml` / `application-local.yml` y se pueden sobrescribir con variables de entorno.

| Variable | Descripción | Ejemplo local |
|---|---|---|
| `JAVA_HOME` | Ruta del JDK 17 | `C:\Program Files\Java\jdk-17` |
| `DB_HOST` | Host de PostgreSQL | `localhost` |
| `DB_PORT` | Puerto de PostgreSQL | `5434` |
| `DB_NAME` | Nombre de la base de datos | `sgpp` |
| `DB_USER` | Usuario de PostgreSQL | `sgpp_user` |
| `DB_PASS` | Contraseña de PostgreSQL | `sgpp_pass` |
| `MAIL_HOST` | Servidor SMTP | `smtp.gmail.com` |
| `MAIL_PORT` | Puerto SMTP | `587` |
| `MAIL_USER` | Correo emisor | `sistema@unitru.edu.pe` |
| `MAIL_PASS` | Contraseña o token SMTP | `********` |
| `JWT_SECRET` | Secreto para firmar JWT | `cambiar-por-secreto-seguro` |
| `FRONTEND_URL` | Origen del frontend para CORS | `http://localhost:5173` |

> Nota: `backend/sgpp-api/src/main/resources/application-local.yml` ya contiene valores de desarrollo. Solo es necesario definir variables sensibles como el correo y el JWT.

### Frontend

Crear `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8082/api/v1
```

## Levantar la base de datos

Desde la raíz del proyecto:

```bash
docker-compose up -d postgres pgadmin
```

- PostgreSQL: `localhost:5434`
- pgAdmin: `http://localhost:5051`

## Ejecutar el backend

Desde `backend/`:

```bash
mvn -pl sgpp-api -am package
mvn -pl sgpp-api spring-boot:run
```

La API quedará disponible en `http://localhost:8082/api/v1`.

## Ejecutar el frontend

Desde `frontend/`:

```bash
npm install
npm run dev
```

La aplicación quedará disponible en `http://localhost:5173`.

## Verificación de calidad

Backend:

```bash
mvn -pl sgpp-api -am test
```

Frontend:

```bash
npm run lint
npm run build
```

## Notas importantes

- Flyway aplica las migraciones automáticamente al iniciar la API.
- No editar migraciones ya aplicadas; crear nuevos archivos con versión superior.
- El puerto `8082` y el contexto `/api/v1` se definen en `application-local.yml`.
- El frontend usa un proxy de Vite que redirige `/api` a `http://localhost:8082/api/v1` cuando se ejecuta en desarrollo.
