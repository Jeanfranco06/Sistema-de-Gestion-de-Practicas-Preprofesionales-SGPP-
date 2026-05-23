# SGPP Backend Base - Guía de Ejecución Local

## Requisitos Previos

### Software Necesario
- **Java 17** o superior (JDK)
- **Maven 3.8+** 
- **PostgreSQL 15+** (o superior)
- **Git** (opcional, para control de versiones)

### Verificación de Requisitos

```bash
# Verificar Java
java -version
# Debe mostrar: openjdk version "17.x.x" o similar

# Verificar Maven
mvn -version
# Debe mostrar: Apache Maven 3.8.x o superior

# Verificar PostgreSQL
psql --version
# Debe mostrar: psql (PostgreSQL) 15.x o superior
```

---

## Paso 1: Crear la Base de Datos PostgreSQL

### 1.1 Iniciar PostgreSQL

**Windows:**
- Asegúrate de que PostgreSQL esté instalado y el servicio esté corriendo
- Puedes verificar usando pgAdmin o el servicio de Windows

**Linux/Mac:**
```bash
sudo systemctl start postgresql
# o
sudo service postgresql start
```

### 1.2 Crear la Base de Datos

Abre una terminal o usa pgAdmin y ejecuta:

```sql
-- Conectarse a PostgreSQL como usuario postgres
psql -U postgres

-- Crear la base de datos
CREATE DATABASE sgpp_db;

-- Verificar que se creó
\l

-- Salir
\q
```

**Alternativa usando pgAdmin:**
1. Abre pgAdmin
2. Conéctate al servidor PostgreSQL
3. Clic derecho en "Databases" → "Create" → "Database"
4. Nombre: `sgpp_db`
5. Clic en "Save"

---

## Paso 2: Configurar el Proyecto

### 2.1 Clonar o Navegar al Proyecto

```bash
# Si estás usando Git
cd "d:\Proyects\SG de Practicas Pre profesionales"

# O simplemente navega a la carpeta del proyecto
```

### 2.2 Verificar application-local.yml

El archivo `src/main/resources/application-local.yml` ya está configurado con:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/sgpp_db
    username: postgres
    password: postgres
```

**Si tu configuración de PostgreSQL es diferente, modifica estos valores:**

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/sgpp_db
    username: tu_usuario_postgres
    password: tu_password_postgres
```

### 2.3 Verificar Dependencias

El archivo `pom.xml` ya incluye todas las dependencias necesarias:
- Spring Boot 3.2.0
- Spring Security
- Spring Data JPA
- PostgreSQL Driver
- Flyway
- JWT (jjwt)
- Lombok
- MapStruct
- OpenAPI/Swagger

---

## Paso 3: Compilar el Proyecto

### 3.1 Limpiar y Compilar

```bash
cd "d:\Proyects\SG de Practicas Pre profesionales"

# Limpiar compilaciones anteriores
mvn clean

# Compilar el proyecto
mvn compile
```

**Si hay errores de compilación:**
- Verifica que Java 17 esté instalado
- Verifica que las dependencias se descargaron correctamente
- Ejecuta `mvn dependency:resolve` para descargar dependencias

---

## Paso 4: Ejecutar el Proyecto

### 4.1 Opción A: Usar Maven

```bash
cd "d:\Proyects\SG de Practicas Pre profesionales"

# Ejecutar con perfil local
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

### 4.2 Opción B: Usar el JAR compilado

```bash
# Primero empaquetar
mvn clean package -DskipTests

# Ejecutar el JAR
java -jar target/sgpp-backend-1.0.0.jar --spring.profiles.active=local
```

### 4.3 Opción C: Desde tu IDE (IntelliJ IDEA / Eclipse)

**IntelliJ IDEA:**
1. Abre el proyecto
2. Busca `SgppApplication.java`
3. Clic derecho → "Run 'SgppApplication'"
4. Configura el active profile: `local`

**Eclipse / STS:**
1. Importa como proyecto Maven
2. Busca `SgppApplication.java`
3. Run As → Java Application
4. Configura el active profile: `local`

---

## Paso 5: Verificar que el Proyecto Corra Correctamente

### 5.1 Verificar Logs de Inicio

El proyecto debería mostrar logs similares a:

```
Started SgppApplication in X.XXX seconds
Flyway Community Edition 10.0.1 by Redgate
Successfully baselined schema with version: 1
Successfully applied 2 migrations to schema `public`
Creating schema history table `public`.`flyway_schema_history` ...
```

**Si Flyway ejecuta las migraciones correctamente, verás:**
```
Successfully applied V1__create_usuario_rol_tables.sql
Successfully applied V2__insert_seed_data.sql
```

### 5.2 Verificar que el Servidor esté Corriendo

Abre tu navegador y navega a:
- **Health Check:** http://localhost:8080/api/v1/public/health
- **Swagger UI:** http://localhost:8080/api/v1/swagger-ui.html

Deberías ver respuestas JSON exitosas.

---

## Paso 6: Probar la Autenticación

### 6.1 Probar Login Exitoso

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "estudiante1",
    "password": "password123"
  }'
```

**Respuesta esperada:** JSON con token JWT y datos del usuario.

### 6.2 Probar Obtener Perfil

```bash
# Primero obtener el token
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "estudiante1", "password": "password123"}' \
  | jq -r '.token')

# Luego usar el token
curl -X GET http://localhost:8080/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### 6.3 Probar RBAC (Control de Acceso por Roles)

```bash
# Login como estudiante (NO tiene rol administrativo)
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "estudiante1", "password": "password123"}' \
  | jq -r '.token')

# Intentar acceder a endpoint administrativo (debería fallar con 403)
curl -X GET http://localhost:8080/api/v1/admin/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

**Respuesta esperada:** 403 Forbidden

---

## Paso 7: Verificar Swagger UI

1. Abre tu navegador
2. Navega a: http://localhost:8080/api/v1/swagger-ui.html
3. Deberías ver la documentación de la API con los siguientes grupos:
   - Autenticación
   - Validación de Roles
   - Endpoints Administrativos
   - Endpoints Estudiantes
   - Endpoints Docentes
   - Endpoints Autenticados

4. Prueba los endpoints directamente desde Swagger:
   - Expande "Autenticación"
   - Clic en POST /auth/login
   - Clic en "Try it out"
   - Ingresa credenciales: `{"username": "estudiante1", "password": "password123"}`
   - Clic en "Execute"
   - Deberías ver el token JWT en la respuesta

---

## Paso 8: Verificar Base de Datos

### 8.1 Conectarse a la Base de Datos

```bash
psql -U postgres -d sgpp_db
```

### 8.2 Verificar Tablas Creadas

```sql
\dt
```

Deberías ver las siguientes tablas:
- `rol`
- `usuario`
- `usuario_rol`
- `estudiante`
- `docente`
- `tutor_externo`
- `flyway_schema_history`

### 8.3 Verificar Datos de Prueba

```sql
-- Ver roles
SELECT * FROM rol;

-- Ver usuarios
SELECT id, username, email, nombres, apellido_paterno, activo FROM usuario;

-- Ver asignación de roles
SELECT u.username, r.nombre as rol 
FROM usuario u 
JOIN usuario_rol ur ON u.id = ur.id_usuario 
JOIN rol r ON ur.id_rol = r.id;

-- Ver estudiantes
SELECT e.codigo_estudiantil, u.nombres, u.apellido_paterno 
FROM estudiante e 
JOIN usuario u ON e.id_usuario = u.id;

-- Ver docentes
SELECT d.codigo_docente, u.nombres, u.apellido_paterno 
FROM docente d 
JOIN usuario u ON d.id_usuario = u.id;
```

---

## Solución de Problemas Comunes

### Problema: "Connection refused" a PostgreSQL

**Causa:** PostgreSQL no está corriendo o el puerto es incorrecto.

**Solución:**
1. Verifica que PostgreSQL esté corriendo
2. Verifica que el puerto sea 5432 (o modifica en application-local.yml)
3. Verifica que el usuario y contraseña sean correctos

### Problema: "Flyway validation failed"

**Causa:** Las migraciones ya se ejecutaron pero hay cambios.

**Solución:**
```bash
# Limpiar la base de datos y recrear
DROP DATABASE sgpp_db;
CREATE DATABASE sgpp_db;
# Reiniciar la aplicación
```

### Problema: "Port 8080 already in use"

**Causa:** Otro servicio está usando el puerto 8080.

**Solución:**
1. Cambia el puerto en `application.yml`:
```yaml
server:
  port: 8081
```
2. O detén el servicio que usa el puerto 8080

### Problema: "JWT token invalid"

**Causa:** El secret JWT no coincide o el token expiró.

**Solución:**
1. Verifica que el secret en `application-local.yml` sea el mismo
2. Genera un nuevo token haciendo login nuevamente

### Problema: "403 Forbidden" en endpoints protegidos

**Causa:** El usuario no tiene el rol requerido.

**Solución:**
1. Verifica que el usuario tenga el rol correcto en la base de datos
2. Usa un usuario con el rol apropiado (ver tabla de usuarios de prueba)

---

## Resumen de Usuarios de Prueba

| Username | Password | Roles |
|----------|----------|-------|
| estudiante1 | password123 | ESTUDIANTE |
| docente1 | password123 | DOCENTE_ASESOR |
| tutor1 | password123 | TUTOR_EXTERNO |
| secretaria1 | password123 | SECRETARIA |
| comite1 | password123 | COMITE_PRACTICAS |
| coordinador1 | password123 | COORDINADOR |
| director1 | password123 | DIRECTOR |

---

## Estructura del Proyecto

```
sgpp-backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── edu/unt/ingenieria_industrial/sgpp/
│   │   │       ├── SgppApplication.java
│   │   │       ├── common/
│   │   │       │   ├── BaseEntity.java
│   │   │       │   └── ApiResponse.java
│   │   │       ├── config/
│   │   │       │   ├── SecurityConfig.java
│   │   │       │   ├── JpaAuditingConfig.java
│   │   │       │   ├── AuditorAwareImpl.java
│   │   │       │   └── OpenApiConfig.java
│   │   │       ├── security/
│   │   │       │   ├── JwtService.java
│   │   │       │   ├── JwtAuthenticationFilter.java
│   │   │       │   ├── UserDetailsServiceImpl.java
│   │   │       │   ├── UserDetailsImpl.java
│   │   │       │   ├── AuthenticationController.java
│   │   │       │   ├── RoleValidationController.java
│   │   │       │   └── dto/
│   │   │       ├── usuarios/
│   │   │       │   ├── model/
│   │   │       │   │   ├── Usuario.java
│   │   │       │   │   ├── Rol.java
│   │   │       │   │   ├── UsuarioRol.java
│   │   │       │   │   ├── Estudiante.java
│   │   │       │   │   ├── Docente.java
│   │   │       │   │   └── TutorExterno.java
│   │   │       │   └── repository/
│   │   │       ├── shared/
│   │   │       │   └── enums/
│   │   │       │       ├── TipoDocumento.java
│   │   │       │       ├── EstadoAcademico.java
│   │   │       │       └── RolSistema.java
│   │   │       └── exception/
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── application-local.yml
│   │       ├── application-dev.yml
│   │       └── db/
│   │           └── migration/
│   │               ├── V1__create_usuario_rol_tables.sql
│   │               └── V2__insert_seed_data.sql
├── pom.xml
├── API_TEST_EXAMPLES.md
└── README.md
```

---

## Próximos Pasos

Una vez que el backend base esté corriendo correctamente:

1. **Revisar la documentación en Swagger:** http://localhost:8080/api/v1/swagger-ui.html
2. **Probar los ejemplos de API:** Ver `API_TEST_EXAMPLES.md`
3. **Verificar el cumplimiento de RF-01 y RF-02** (ver README.md)
4. **Preparar la entrega formal del backend base**

---

## Soporte

Si encuentras problemas:

1. Revisa los logs de la aplicación en la consola
2. Verifica que PostgreSQL esté corriendo
3. Verifica que las migraciones Flyway se ejecutaron correctamente
4. Revisa la configuración en `application-local.yml`
5. Consulta la documentación de Spring Boot y Spring Security
