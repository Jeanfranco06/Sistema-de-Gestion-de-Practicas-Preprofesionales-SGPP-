# SGPP Backend Base - Ejemplos de Pruebas API

## Configuración Base
- **URL Base:** `http://localhost:8080/api/v1`
- **Content-Type:** `application/json`

---

## 1. HEALTH CHECK (Público)

### Request
```bash
curl -X GET http://localhost:8080/api/v1/public/health
```

### Response Esperado (200 OK)
```json
{
  "status": "UP",
  "message": "SGPP Backend Base está funcionando correctamente",
  "timestamp": 1700000000000
}
```

---

## 2. INFORMACIÓN DEL SISTEMA (Público)

### Request
```bash
curl -X GET http://localhost:8080/api/v1/public/info
```

### Response Esperado (200 OK)
```json
{
  "system": "SGPP - Sistema de Gestión de Prácticas Preprofesionales",
  "version": "1.0.0",
  "phase": "Backend Base - Autenticación y Usuarios",
  "description": "Backend base con autenticación JWT, RBAC y gestión de usuarios"
}
```

---

## 3. LOGIN EXITOSO (Estudiante)

### Request
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "estudiante1",
    "password": "password123"
  }'
```

### Response Esperado (200 OK)
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

---

## 4. LOGIN EXITOSO (Docente)

### Request
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "docente1",
    "password": "password123"
  }'
```

### Response Esperado (200 OK)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "expiresIn": 86400000,
  "usuario": {
    "id": 2,
    "username": "docente1",
    "email": "docente1@unt.edu.pe",
    "nombres": "María Elena",
    "apellidoPaterno": "Rodríguez",
    "apellidoMaterno": "García",
    "numeroDocumento": "87654321",
    "tipoDocumento": "DNI",
    "roles": ["DOCENTE_ASESOR"],
    "activo": true
  }
}
```

---

## 5. LOGIN EXITOSO (Administrativo - Comité)

### Request
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "comite1",
    "password": "password123"
  }'
```

### Response Esperado (200 OK)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "expiresIn": 86400000,
  "usuario": {
    "id": 5,
    "username": "comite1",
    "email": "comite1@unt.edu.pe",
    "nombres": "Luis Fernando",
    "apellidoPaterno": "Torres",
    "apellidoMaterno": "Ramírez",
    "numeroDocumento": "44556677",
    "tipoDocumento": "DNI",
    "roles": ["COMITE_PRACTICAS"],
    "activo": true
  }
}
```

---

## 6. LOGIN FALLIDO (Credenciales incorrectas)

### Request
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "estudiante1",
    "password": "wrongpassword"
  }'
```

### Response Esperado (401 Unauthorized)
```json
{
  "timestamp": "2024-01-01T00:00:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Bad credentials",
  "path": "/api/v1/auth/login"
}
```

---

## 7. LOGIN FALLIDO (Usuario inexistente)

### Request
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "usuario_inexistente",
    "password": "password123"
  }'
```

### Response Esperado (401 Unauthorized)
```json
{
  "timestamp": "2024-01-01T00:00:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Bad credentials",
  "path": "/api/v1/auth/login"
}
```

---

## 8. OBTENER PERFIL ACTUAL (Con token válido)

### Request
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

### Response Esperado (200 OK)
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

---

## 9. ACCESO SIN TOKEN (Protegido)

### Request
```bash
curl -X GET http://localhost:8080/api/v1/auth/me
```

### Response Esperado (401 Unauthorized)
```json
{
  "timestamp": "2024-01-01T00:00:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Full authentication is required to access this resource",
  "path": "/api/v1/auth/me"
}
```

---

## 10. ACCESO CON TOKEN INVÁLIDO

### Request
```bash
curl -X GET http://localhost:8080/api/v1/auth/me \
  -H "Authorization: Bearer invalid_token_here"
```

### Response Esperado (401 Unauthorized)
```json
{
  "timestamp": "2024-01-01T00:00:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid JWT token",
  "path": "/api/v1/auth/me"
}
```

---

## 11. ENDPOINT ADMINISTRATIVO (Con rol correcto)

### Request
```bash
# Login como comite1 (tiene rol COMITE_PRACTICAS)
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "comite1", "password": "password123"}' \
  | jq -r '.token')

# Acceder a endpoint administrativo
curl -X GET http://localhost:8080/api/v1/admin/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

### Response Esperado (200 OK)
```json
{
  "message": "Acceso autorizado a dashboard administrativo",
  "user": "comite1",
  "roles": ["ROLE_COMITE_PRACTICAS"],
  "access": "ADMINISTRATIVE"
}
```

---

## 12. ENDPOINT ADMINISTRATIVO (Con rol incorrecto)

### Request
```bash
# Login como estudiante1 (NO tiene rol administrativo)
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "estudiante1", "password": "password123"}' \
  | jq -r '.token')

# Intentar acceder a endpoint administrativo
curl -X GET http://localhost:8080/api/v1/admin/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

### Response Esperado (403 Forbidden)
```json
{
  "timestamp": "2024-01-01T00:00:00",
  "status": 403,
  "error": "Forbidden",
  "message": "Access Denied",
  "path": "/api/v1/admin/dashboard"
}
```

---

## 13. ENDPOINT ESTUDIANTE (Con rol correcto)

### Request
```bash
# Login como estudiante1
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "estudiante1", "password": "password123"}' \
  | jq -r '.token')

# Acceder a endpoint de estudiante
curl -X GET http://localhost:8080/api/v1/estudiante/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

### Response Esperado (200 OK)
```json
{
  "message": "Acceso autorizado a dashboard de estudiante",
  "user": "estudiante1",
  "roles": ["ROLE_ESTUDIANTE"],
  "access": "ESTUDIANTE"
}
```

---

## 14. ENDPOINT ESTUDIANTE (Con rol incorrecto)

### Request
```bash
# Login como docente1 (NO tiene rol ESTUDIANTE)
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "docente1", "password": "password123"}' \
  | jq -r '.token')

# Intentar acceder a endpoint de estudiante
curl -X GET http://localhost:8080/api/v1/estudiante/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

### Response Esperado (403 Forbidden)
```json
{
  "timestamp": "2024-01-01T00:00:00",
  "status": 403,
  "error": "Forbidden",
  "message": "Access Denied",
  "path": "/api/v1/estudiante/dashboard"
}
```

---

## 15. ENDPOINT DOCENTE (Con rol correcto)

### Request
```bash
# Login como docente1
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "docente1", "password": "password123"}' \
  | jq -r '.token')

# Acceder a endpoint de docente
curl -X GET http://localhost:8080/api/v1/docente/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

### Response Esperado (200 OK)
```json
{
  "message": "Acceso autorizado a dashboard de docente",
  "user": "docente1",
  "roles": ["ROLE_DOCENTE_ASESOR"],
  "access": "DOCENTE_ASESOR"
}
```

---

## 16. ENDPOINT AUTENTICADO (Cualquier usuario autenticado)

### Request
```bash
# Login con cualquier usuario
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "estudiante1", "password": "password123"}' \
  | jq -r '.token')

# Acceder a endpoint autenticado
curl -X GET http://localhost:8080/api/v1/authenticated/profile \
  -H "Authorization: Bearer $TOKEN"
```

### Response Esperado (200 OK)
```json
{
  "message": "Acceso autorizado - usuario autenticado",
  "user": "estudiante1",
  "roles": ["ROLE_ESTUDIANTE"],
  "access": "AUTHENTICATED"
}
```

---

## 17. ENDPOINT AUTENTICADO (Sin token)

### Request
```bash
curl -X GET http://localhost:8080/api/v1/authenticated/profile
```

### Response Esperado (401 Unauthorized)
```json
{
  "timestamp": "2024-01-01T00:00:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Full authentication is required to access this resource",
  "path": "/api/v1/authenticated/profile"
}
```

---

## RESUMEN DE USUARIOS DE PRUEBA

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

## POSTMAN COLLECTION

Para importar en Postman, crear una colección con las siguientes configuraciones:

1. **Variables de Colección:**
   - `baseUrl`: `http://localhost:8080/api/v1`
   - `token`: (se llena después del login)

2. **Requests:**
   - Health Check: `GET {{baseUrl}}/public/health`
   - Login: `POST {{baseUrl}}/auth/login`
   - Get Profile: `GET {{baseUrl}}/auth/me` (Header: `Authorization: Bearer {{token}}`)
   - Admin Dashboard: `GET {{baseUrl}}/admin/dashboard` (Header: `Authorization: Bearer {{token}}`)
   - Estudiante Dashboard: `GET {{baseUrl}}/estudiante/dashboard` (Header: `Authorization: Bearer {{token}}`)
   - Docente Dashboard: `GET {{baseUrl}}/docente/dashboard` (Header: `Authorization: Bearer {{token}}`)
   - Authenticated Profile: `GET {{baseUrl}}/authenticated/profile` (Header: `Authorization: Bearer {{token}}`)

3. **Test Script en Login:**
```javascript
var jsonData = pm.response.json();
pm.collectionVariables.set("token", jsonData.token);
```
