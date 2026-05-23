# SGPP - Sistema de Gestión de Prácticas Preprofesionales

Backend del Sistema de Gestión de Prácticas Preprofesionales de la Escuela Profesional de Ingeniería Industrial de la Universidad Nacional de Trujillo.

## Tecnologías

- Java 17
- Spring Boot 3.2.0
- Spring Security 6.x con JWT
- Spring Data JPA + Hibernate
- PostgreSQL 15+
- Flyway (migraciones de base de datos)
- Lombok
- MapStruct
- OpenAPI/Swagger

## Estructura del Proyecto

```
edu.unt.ingenieria_industrial.sgpp
├── api/                    # Configuración de la API
│   ├── config/            # Configuraciones (Security, OpenAPI, JPA Auditing)
│   ├── exception/         # Excepciones personalizadas y manejo global
│   ├── security/          # JWT, filtros, autenticación
│   └── common/            # Clases comunes (BaseEntity, ApiResponse)
├── core/                   # Módulos del dominio
│   ├── usuarios/          # Gestión de usuarios y perfiles
│   ├── sedes/             # Gestión de sedes (pendiente)
│   ├── practicas/         # Gestión de prácticas (pendiente)
│   ├── documentos/        # Gestión documental (pendiente)
│   ├── evaluacion/        # Sistema de evaluación (pendiente)
│   ├── monitoreo/         # Monitoreo y seguimiento (pendiente)
│   ├── notificaciones/    # Sistema de notificaciones (pendiente)
│   └── reportes/          # Reportes y dashboards (pendiente)
└── shared/                 # Componentes compartidos
    └── enums/             # Enumeraciones del sistema
```

## Requisitos Funcionales Implementados

### RF-01: Acceso con credenciales institucionales

**Implementación:**
- El sistema utiliza Spring Security para autenticación basada en credenciales (username/password).
- Actualmente, las credenciales se almacenan localmente en la base de datos PostgreSQL.
- La arquitectura está preparada para integración futura con LDAP/OAuth2 institucional de la UNT.
- El endpoint `/auth/login` valida credenciales y genera un token JWT.

**Componentes que cumplen RF-01:**
- `AuthenticationController`: Endpoint POST `/auth/login`
- `UserDetailsServiceImpl`: Carga de usuario desde base de datos
- `SecurityConfig`: Configuración de autenticación
- `JwtService`: Generación y validación de tokens JWT
- `UsuarioRepository`: Consulta de usuarios por username

**Preparación para integración institucional:**
- La interfaz `UserDetailsService` puede ser reemplazada por una implementación que consulte LDAP.
- El `AuthenticationProvider` puede ser personalizado para validar contra directorio activo.
- La estructura de usuarios soporta múltiples roles y perfiles.

### RF-02: Manejo de perfiles por rol

**Implementación:**
- Sistema RBAC (Role-Based Access Control) implementado con Spring Security.
- Roles definidos: ESTUDIANTE, DOCENTE_ASESOR, TUTOR_EXTERNO, SECRETARIA, COMITE_PRACTICAS, COORDINADOR, DIRECTOR.
- Perfiles específicos: Estudiante, Docente, TutorExterno (entidades separadas con relaciones 1:1 con Usuario).
- Los roles se almacenan en la tabla `usuario_rol` (relación many-to-many resuelta).
- Los permisos se asignan mediante authorities en el token JWT.

**Componentes que cumplen RF-02:**
- `Rol`: Entidad que define roles del sistema
- `UsuarioRol`: Tabla puente para asignación de roles a usuarios
- `Estudiante`, `Docente`, `TutorExterno`: Entidades de perfil específicas
- `UserDetailsImpl`: Mapea roles a authorities de Spring Security
- `SecurityConfig`: Configura reglas de acceso por endpoint

**Reglas de acceso implementadas:**
- Un usuario puede tener múltiples roles.
- Los roles se incluyen en el token JWT como authorities.
- Los endpoints están protegidos por configuración de seguridad.
- El endpoint `/auth/me` retorna el perfil y roles del usuario autenticado.

## Configuración de Base de Datos

### Local (Development)

1. Crear base de datos PostgreSQL:
```sql
CREATE DATABASE sgpp_db;
```

2. Configurar credenciales en `application-local.yml`:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/sgpp_db
    username: postgres
    password: postgres
```

3. Las migraciones Flyway se ejecutan automáticamente al iniciar la aplicación.

### Datos Semilla

La migración `V2__insert_seed_data.sql` inserta:
- 7 roles del sistema
- 7 usuarios de prueba (password: `password123`)
- Perfiles de estudiante, docente y tutor externo

**Usuarios de prueba:**
- `estudiante1` / `password123` - Rol: ESTUDIANTE
- `docente1` / `password123` - Rol: DOCENTE_ASESOR
- `tutor1` / `password123` - Rol: TUTOR_EXTERNO
- `secretaria1` / `password123` - Rol: SECRETARIA
- `comite1` / `password123` - Rol: COMITE_PRACTICAS
- `coordinador1` / `password123` - Rol: COORDINADOR
- `director1` / `password123` - Rol: DIRECTOR

## Instrucciones de Ejecución

### Prerrequisitos

- Java 17 o superior
- Maven 3.6+
- PostgreSQL 15+
- pgAdmin (opcional, para gestión visual de la base de datos)

### Pasos para ejecutar localmente

#### Opción 1: Desde IntelliJ IDEA (Recomendado)

1. **Configurar base de datos:**
   - Abre pgAdmin
   - Ejecuta el siguiente SQL:
   ```sql
   CREATE DATABASE sgpp_db;
   ```

2. **Verificar configuración:**
   - Abre `src/main/resources/application-local.yml`
   - Verifica que las credenciales de PostgreSQL sean correctas:
   ```yaml
   spring:
     datasource:
       url: jdbc:postgresql://localhost:5432/sgpp_db
       username: postgres
       password: postgres
   ```

3. **Ejecutar la aplicación:**
   - Abre la clase `SgppApplication.java`
   - Clic derecho → Run 'SgppApplication.main()'
   - La aplicación se iniciará en el puerto 8080

4. **Verificar que la aplicación inició correctamente:**
   - Verás en la consola: `Started SgppApplication in X.XXX seconds`
   - La aplicación estará disponible en: `http://localhost:8080/api/v1`
   - Swagger UI: `http://localhost:8080/api/v1/swagger-ui.html`
   - API Docs: `http://localhost:8080/api/v1/api-docs`

#### Opción 2: Desde línea de comandos (Maven)

1. **Configurar base de datos:**
   ```sql
   CREATE DATABASE sgpp_db;
   ```

2. **Compilar el proyecto:**
   ```bash
   mvn clean install
   ```

3. **Ejecutar la aplicación:**
   ```bash
   mvn spring-boot:run -Dspring-boot.run.profiles=local
   ```

4. **Verificar que la aplicación inició correctamente:**
   - La aplicación estará disponible en: `http://localhost:8080/api/v1`
   - Swagger UI: `http://localhost:8080/api/v1/swagger-ui.html`
   - API Docs: `http://localhost:8080/api/v1/api-docs`

### Recrear la base de datos desde cero

Si necesitas recrear la base de datos (por ejemplo, después de modificar migraciones):

1. **Eliminar y recrear la base de datos:**
   ```sql
   DROP DATABASE IF EXISTS sgpp_db;
   CREATE DATABASE sgpp_db;
   ```

2. **Reiniciar la aplicación** - Flyway ejecutará todas las migraciones automáticamente.

### Verificar las tablas creadas

Después de ejecutar la aplicación, Flyway habrá creado 34 tablas (33 del dominio + flyway_schema_history). Puedes verificar esto desde pgAdmin:

1. Abre pgAdmin
2. Conéctate al servidor PostgreSQL
3. Expande `Databases` → `sgpp_db` → `Schemas` → `public` → `Tables`
4. Deberías ver 34 tablas incluyendo: usuario, rol, estudiante, docente, empresa, sede_practica, practica, documento, evaluacion, etc.

## Ejemplos de Requests

### Login

**Request:**
```bash
POST http://localhost:8080/api/v1/auth/login
Content-Type: application/json

{
  "username": "estudiante1",
  "password": "password123"
}
```

**Response Exitoso (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "expiresIn": 86400000,
  "usuario": {
    "id": 1,
    "username": "estudiante1",
    "email": "estudiante1@unt.edu.pe",
    "nombres": "Juan Carlos",
    "apellidoPaterno": "Pérez",
    "apellidoMaterno": "López",
    "numeroDocumento": "12345678",
    "tipoDocumento": "DNI",
    "roles": ["ESTUDIANTE"],
    "activo": true
  }
}
```

**Response con credenciales inválidas (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Credenciales inválidas",
  "data": null,
  "timestamp": "2024-05-22T21:00:00"
}
```

**Response con cuenta bloqueada (403 Forbidden):**
```json
{
  "success": false,
  "message": "Cuenta deshabilitada o bloqueada",
  "data": null,
  "timestamp": "2024-05-22T21:00:00"
}
```

### Obtener Perfil Actual

**Request:**
```bash
GET http://localhost:8080/api/v1/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response Exitoso (200 OK):**
```json
{
  "id": 1,
  "username": "estudiante1",
  "email": "estudiante1@unt.edu.pe",
  "nombres": "Juan Carlos",
  "apellidoPaterno": "Pérez",
  "apellidoMaterno": "López",
  "numeroDocumento": "12345678",
  "tipoDocumento": "DNI",
  "roles": ["ESTUDIANTE"],
  "activo": true
}
```

**Response sin autenticación (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Full authentication is required to access this resource",
  "data": null,
  "timestamp": "2024-05-22T21:00:00"
}
```

## Endpoints Disponibles

### Autenticación

- `POST /api/v1/auth/login` - Iniciar sesión
- `GET /api/v1/auth/me` - Obtener perfil del usuario autenticado

### Documentación

- `GET /api/v1/swagger-ui.html` - Swagger UI
- `GET /api/v1/api-docs` - OpenAPI JSON

### Actuator

- `GET /api/v1/actuator/health` - Health check
- `GET /api/v1/actuator/info` - Información de la aplicación

## Próximos Pasos

El backend base está listo. Los siguientes módulos pendientes de implementación son:

1. **Módulo de Sedes y Empresas** - Gestión de catálogo de empresas, sedes y convenios
2. **Módulo de Prácticas** - Gestión del ciclo de vida de prácticas
3. **Módulo Documental** - Expedientes digitales y motor de estados
4. **Módulo de Evaluación** - Rúbricas digitales y sistema de evaluación
5. **Módulo de Monitoreo** - Registro de horas y seguimiento
6. **Módulo de Notificaciones** - Sistema de alertas automáticas
7. **Módulo de Reportes** - Dashboards y KPIs

## Notas Importantes

- El JWT tiene una validez de 24 horas (configurable en `application-local.yml`).
- Las contraseñas se almacenan encriptadas con BCrypt.
- El sistema implementa auditoría automática de fechas de creación y actualización.
- La estructura está preparada para escalar a microservicios si se requiere.
- El código sigue principios de SOLID y Clean Architecture.

## Contacto

Escuela Profesional de Ingeniería Industrial
Universidad Nacional de Trujillo
Email: soporte@unt.edu.pe
