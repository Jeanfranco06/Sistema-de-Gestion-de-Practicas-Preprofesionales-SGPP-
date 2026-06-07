# SGPP - Guía de Ejecución Local

Esta guía te permitirá levantar el proyecto completo (Base de Datos, Backend y Frontend) en tu máquina local en menos de 10 minutos.

---

## Requisitos Previos

| Herramienta     | Versión mínima | Verificar con            | ¿Obligatorio?         |
| --------------- | -------------- | ------------------------ | ---------------------- |
| **Docker**      | 20+            | `docker --version`       | ✅ Sí                  |
| **Docker Compose** | 2.x         | `docker compose version` | ✅ Sí                  |
| **Java (JDK)**  | 17             | `java -version`          | ✅ Sí                  |
| **Maven**       | 3.8+           | `mvn -version`           | ✅ Sí                  |
| **Node.js**     | 18+            | `node -v`                | ✅ Sí                  |
| **npm**         | 9+             | `npm -v`                 | ✅ Sí (viene con Node) |
| **Git**         | 2.x            | `git --version`          | Recomendado            |

---

## Paso 1 · Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd "SG de Practicas Pre profesionales"
```

---

## Paso 2 · Configurar Variables de Entorno

El proyecto utiliza un archivo `.env` centralizado en la raíz para definir credenciales y puertos. **Nunca** subas este archivo al repositorio (ya está en `.gitignore`).

### 2.1 Crear tu archivo `.env`

```bash
# Linux / Mac / Git Bash
cp .env.example .env

# Windows CMD
copy .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```

### 2.2 (Opcional) Personalizar valores

Abre `.env` con tu editor favorito y ajusta los valores si lo necesitas. Los valores por defecto están pensados para funcionar sin modificaciones:

```env
# Base de Datos
POSTGRES_DB=sgpp_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_PORT=5432

# pgAdmin
PGADMIN_DEFAULT_EMAIL=admin@sgpp.local
PGADMIN_DEFAULT_PASSWORD=admin

# Backend
JWT_SECRET=SGPPSECRETKEY2024UNT...
JWT_EXPIRATION=86400000

# Frontend
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

### 2.3 Crear `.env` del Frontend

```bash
# Linux / Mac / Git Bash
cp frontend/.env.example frontend/.env

# Windows PowerShell
Copy-Item frontend\.env.example frontend\.env
```

---

## Paso 3 · Levantar la Base de Datos con Docker

Este comando levanta PostgreSQL y pgAdmin de forma automática usando Docker Compose:

```bash
docker-compose up -d
```

Verifica que los contenedores estén corriendo:

```bash
docker-compose ps
```

Deberías ver algo como:

```
NAME              STATUS          PORTS
sgpp-postgres     Up (healthy)    0.0.0.0:5432->5432/tcp
sgpp-pgadmin      Up              0.0.0.0:5050->80/tcp
```

> **💡 Tip:** Puedes acceder a pgAdmin en [http://localhost:5050](http://localhost:5050) con las credenciales definidas en tu `.env` (`admin@sgpp.local` / `admin`). Para conectar al servidor PostgreSQL desde pgAdmin, usa el host `db`, puerto `5432`, y las credenciales de tu `.env`.

---

## Paso 4 · Ejecutar el Backend (Spring Boot)

### Opción A: Desde la terminal (Maven)

```bash
cd backend
mvn clean install -DskipTests
mvn -pl sgpp-api spring-boot:run -Dspring-boot.run.profiles=local
```

### Opción B: Desde IntelliJ IDEA (Recomendado para desarrollo)

1. Abre la carpeta `backend/` como proyecto en IntelliJ IDEA.
2. IntelliJ detectará automáticamente los módulos Maven (`sgpp-api`, `sgpp-core`, `sgpp-shared`).
3. Busca la clase `SgppApplication.java` dentro de `sgpp-api`.
4. Clic derecho → **Run 'SgppApplication'**.
5. Configura el **Active Profile** como `local` en la configuración de ejecución:
   - Run → Edit Configurations → Active Profiles: `local`

### Verificar que el Backend inició correctamente

Deberías ver en la consola:

```
Started SgppApplication in X.XXX seconds
Flyway: Successfully applied 2 migrations
```

Endpoints disponibles:

| Recurso          | URL                                                |
| ---------------- | -------------------------------------------------- |
| API Base         | http://localhost:8080/api/v1                        |
| Swagger UI       | http://localhost:8080/api/v1/swagger-ui.html        |
| OpenAPI JSON     | http://localhost:8080/api/v1/api-docs               |
| Health Check     | http://localhost:8080/api/v1/actuator/health        |

---

## Paso 5 · Ejecutar el Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

El servidor de desarrollo estará disponible en [http://localhost:5173](http://localhost:5173).

> **Nota:** El frontend se conectará automáticamente al Backend usando la variable `VITE_API_BASE_URL` definida en `frontend/.env`.

---

## Paso 6 · Verificar que Todo Funciona

### 6.1 Probar Login desde la terminal

```bash
curl -X POST http://localhost:8080/api/v1/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\": \"estudiante1\", \"password\": \"password123\"}"
```

Deberías recibir un JSON con el token JWT y los datos del usuario.

### 6.2 Usuarios de prueba disponibles

Flyway inserta automáticamente estos usuarios la primera vez que se ejecuta el backend. Todos usan la contraseña `password123`:

| Username       | Rol              |
| -------------- | ---------------- |
| estudiante1    | ESTUDIANTE       |
| docente1       | DOCENTE_ASESOR   |
| tutor1         | TUTOR_EXTERNO    |
| secretaria1    | SECRETARIA       |
| comite1        | COMITE_PRACTICAS |
| coordinador1   | COORDINADOR      |
| director1      | DIRECTOR         |

---

## Comandos Útiles

| Acción                                | Comando                                            |
| ------------------------------------- | -------------------------------------------------- |
| Levantar infraestructura              | `docker-compose up -d`                             |
| Detener infraestructura               | `docker-compose down`                              |
| Detener y **borrar datos**            | `docker-compose down -v`                           |
| Ver logs de PostgreSQL                | `docker-compose logs -f db`                        |
| Compilar backend                      | `cd backend && mvn clean install -DskipTests`      |
| Ejecutar backend                      | `cd backend && mvn -pl sgpp-api spring-boot:run -Dspring-boot.run.profiles=local` |
| Instalar dependencias frontend        | `cd frontend && npm install`                       |
| Ejecutar frontend                     | `cd frontend && npm run dev`                       |

---

## Solución de Problemas Comunes

### ❌ `Connection refused` al conectar a PostgreSQL

- Verifica que Docker esté corriendo: `docker-compose ps`
- Verifica que el puerto `5432` no esté ocupado por otra instancia de PostgreSQL local.
- Si tienes PostgreSQL instalado localmente, detén el servicio y usa el de Docker.

### ❌ `Flyway validation failed`

Necesitas recrear la base de datos. La forma más limpia es:

```bash
docker-compose down -v
docker-compose up -d
```

Esto elimina los volúmenes (datos) y crea la base de datos desde cero.

### ❌ `Port 8080 already in use`

Otro proceso está usando el puerto. Cambia el puerto en `application.yml`:

```yaml
server:
  port: 8081
```

O busca y detén el proceso que ocupa el puerto:

```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### ❌ `JAVA_HOME is not defined`

Configura la variable de entorno `JAVA_HOME`:

```powershell
# PowerShell (ejemplo, ajusta la ruta a tu JDK)
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
```

Para hacerlo permanente, agrégalo en las Variables de Entorno del Sistema de Windows.

### ❌ El frontend no se conecta al backend

- Verifica que `frontend/.env` exista y contenga `VITE_API_BASE_URL=http://localhost:8080/api/v1`.
- Verifica que el backend esté corriendo y accesible.
- Reinicia el servidor de Vite después de cambiar el `.env`: `npm run dev`.

---

## Estructura del Proyecto

```text
SGPP/
├── .env.example            # Plantilla de variables de entorno
├── docker-compose.yml      # Infraestructura de desarrollo (DB + pgAdmin)
├── .gitignore
├── README.md
│
├── backend/                # Backend - Spring Boot (Multi-Módulo Maven)
│   ├── pom.xml             # POM Padre
│   ├── sgpp-api/           # Módulo de ensamblaje y configuración REST
│   │   ├── pom.xml
│   │   └── src/main/
│   │       ├── java/.../api/
│   │       │   ├── config/        # SecurityConfig, OpenApiConfig, CorsConfig
│   │       │   ├── security/      # JwtService, AuthenticationController
│   │       │   └── SgppApplication.java
│   │       └── resources/
│   │           ├── application.yml
│   │           ├── application-local.yml
│   │           └── db/migration/  # Scripts SQL de Flyway
│   ├── sgpp-core/          # Módulo de lógica de dominio
│   │   ├── pom.xml
│   │   └── src/main/java/.../core/
│   │       ├── seguridad/         # Usuarios, Roles, Perfiles
│   │       ├── empresarial/       # Empresas, Sedes, Convenios
│   │       ├── practicas/         # Gestión de prácticas
│   │       ├── documental/        # Expedientes y documentos
│   │       ├── evaluacion/        # Rúbricas y evaluaciones
│   │       └── ...                # (monitoreo, notificaciones, reportes, auditoria)
│   └── sgpp-shared/        # Módulo compartido
│       ├── pom.xml
│       └── src/main/java/.../shared/
│           ├── common/            # ApiResponse, BaseEntity
│           ├── exception/         # Excepciones globales
│           └── enums/             # Enumeraciones del sistema
│
└── frontend/               # Frontend - React + Vite
    ├── .env.example
    ├── package.json
    └── src/
        ├── components/
        ├── pages/
        ├── services/
        └── context/
```

---

## Soporte

Si encuentras problemas que no están cubiertos en esta guía:

1. Revisa los logs del backend en la consola de tu IDE o terminal.
2. Revisa los logs de Docker: `docker-compose logs -f`
3. Consulta la documentación en Swagger UI: http://localhost:8080/api/v1/swagger-ui.html
4. Revisa el archivo `API_TEST_EXAMPLES.md` para ejemplos detallados de requests.
