# Endpoints de Gestión de Usuarios, Roles, Tutores y Comité

## 1. Gestión de Usuarios

**Base Path:** `/usuarios`
**Seguridad:** `COORDINADOR`, `DIRECTOR`, `ADMIN_SISTEMA`

### Endpoints

#### POST `/usuarios`
**Descripción:** Crear un nuevo usuario

**Request Body:**
```json
{
  "username": "string",
  "password": "string",
  "email": "string",
  "nombres": "string",
  "apellidoPaterno": "string",
  "apellidoMaterno": "string",
  "numeroDocumento": "string",
  "tipoDocumento": "DNI|CE|PASAPORTE",
  "telefono": "string",
  "roles": ["ESTUDIANTE", "DOCENTE_ASESOR"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Usuario creado exitosamente",
  "data": {
    "id": 1,
    "username": "string",
    "email": "string",
    "nombres": "string",
    "apellidoPaterno": "string",
    "apellidoMaterno": "string",
    "numeroDocumento": "string",
    "tipoDocumento": "DNI",
    "telefono": "string",
    "activo": true,
    "cuentaBloqueada": false,
    "roles": ["ESTUDIANTE"]
  },
  "timestamp": "2024-01-01T00:00:00"
}
```

---

#### GET `/usuarios`
**Descripción:** Listar todos los usuarios

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "string",
      "email": "string",
      "nombres": "string",
      "apellidoPaterno": "string",
      "apellidoMaterno": "string",
      "numeroDocumento": "string",
      "tipoDocumento": "DNI",
      "telefono": "string",
      "activo": true,
      "cuentaBloqueada": false,
      "roles": ["ESTUDIANTE"]
    }
  ],
  "timestamp": "2024-01-01T00:00:00"
}
```

---

#### GET `/usuarios?nombre={nombre}&correo={correo}&estado={estado}&rol={rol}&tipoUsuario={tipoUsuario}`
**Descripción:** Listar usuarios con filtros

**Query Parameters:**
- `nombre` (optional): Filtro por nombre o apellido
- `correo` (optional): Filtro por correo electrónico
- `estado` (optional): Filtro por estado (ACTIVO, INACTIVO, BLOQUEADO)
- `rol` (optional): Filtro por rol (ESTUDIANTE, DOCENTE_ASESOR, etc.)
- `tipoUsuario` (optional): Filtro por tipo de usuario (INTERNO, EXTERNO)

**Response:** Same as GET `/usuarios`

---

#### GET `/usuarios/{id}`
**Descripción:** Obtener un usuario por ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "string",
    "email": "string",
    "nombres": "string",
    "apellidoPaterno": "string",
    "apellidoMaterno": "string",
    "numeroDocumento": "string",
    "tipoDocumento": "DNI",
    "telefono": "string",
    "activo": true,
    "cuentaBloqueada": false,
    "roles": ["ESTUDIANTE"]
  },
  "timestamp": "2024-01-01T00:00:00"
}
```

---

#### GET `/usuarios/{id}/detalle`
**Descripción:** Obtener detalle completo de un usuario

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "string",
    "email": "string",
    "nombres": "string",
    "apellidoPaterno": "string",
    "apellidoMaterno": "string",
    "numeroDocumento": "string",
    "tipoDocumento": "DNI",
    "telefono": "string",
    "codigoInstitucional": "string",
    "tipoUsuario": "INTERNO",
    "activo": true,
    "cuentaBloqueada": false,
    "fechaUltimoAcceso": "2024-01-01T00:00:00",
    "fechaRegistro": "2024-01-01T00:00:00",
    "fechaActualizacion": "2024-01-01T00:00:00",
    "roles": [
      {
        "id": 1,
        "nombre": "ESTUDIANTE",
        "descripcion": "Estudiante",
        "activo": true
      }
    ],
    "estudiante": {
      "id": 1,
      "codigoEstudiantil": "string",
      "semestreActual": 8,
      "estadoAcademico": "ACTIVO"
    },
    "docente": null,
    "tutorExterno": null
  },
  "timestamp": "2024-01-01T00:00:00"
}
```

---

#### PUT `/usuarios/{id}`
**Descripción:** Actualizar un usuario

**Request Body:**
```json
{
  "nombres": "string",
  "apellidoPaterno": "string",
  "apellidoMaterno": "string",
  "telefono": "string",
  "activo": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Usuario actualizado exitosamente",
  "data": { /* UsuarioDTO */ },
  "timestamp": "2024-01-01T00:00:00"
}
```

---

#### PATCH `/usuarios/{id}/estado`
**Descripción:** Actualizar estado de un usuario

**Request Body:**
```json
{
  "estado": "ACTIVO|INACTIVO|BLOQUEADO"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Estado de usuario actualizado exitosamente",
  "timestamp": "2024-01-01T00:00:00"
}
```

---

#### DELETE `/usuarios/{id}`
**Descripción:** Deshabilitar un usuario (baja lógica)

**Response:**
```json
{
  "success": true,
  "message": "Usuario deshabilitado exitosamente",
  "timestamp": "2024-01-01T00:00:00"
}
```

---

#### POST `/usuarios/{id}/unlock`
**Descripción:** Desbloquear una cuenta de usuario

**Response:**
```json
{
  "success": true,
  "message": "Cuenta desbloqueada exitosamente",
  "timestamp": "2024-01-01T00:00:00"
}
```

---

## 2. Asignación de Roles

### Endpoints

#### GET `/usuarios/{id}/roles`
**Descripción:** Obtener roles de un usuario

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "ESTUDIANTE",
      "descripcion": "Estudiante",
      "activo": true
    }
  ],
  "timestamp": "2024-01-01T00:00:00"
}
```

---

#### POST `/usuarios/{id}/roles`
**Descripción:** Asignar roles a un usuario

**Request Body:**
```json
["ESTUDIANTE", "DOCENTE_ASESOR"]
```

**Response:**
```json
{
  "success": true,
  "message": "Roles asignados exitosamente",
  "timestamp": "2024-01-01T00:00:00"
}
```

---

#### DELETE `/usuarios/{id}/roles/{rolId}`
**Descripción:** Revocar un rol de un usuario

**Response:**
```json
{
  "success": true,
  "message": "Rol revocado exitosamente",
  "timestamp": "2024-01-01T00:00:00"
}
```

---

## 3. Gestión de Tutores de Empresa

**Base Path:** `/tutores-empresa`
**Seguridad:** `COORDINADOR`, `COMITE_PRACTICAS`, `SECRETARIA`

### Endpoints

#### GET `/tutores-empresa`
**Descripción:** Listar tutores con filtros

**Query Parameters:**
- `idEmpresa` (optional): Filtro por ID de empresa
- `idSede` (optional): Filtro por ID de sede
- `estado` (optional): Filtro por estado

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "idUsuario": 1,
      "nombres": "string",
      "apellidos": "string",
      "email": "string",
      "idEmpresa": 1,
      "empresaNombre": "string",
      "idSede": 1,
      "sedeNombre": "string",
      "cargo": "string",
      "area": "string",
      "estadoTutor": "ACTIVO",
      "activo": true,
      "fechaRegistro": "2024-01-01T00:00:00"
    }
  ],
  "timestamp": "2024-01-01T00:00:00"
}
```

---

#### GET `/tutores-empresa/{id}`
**Descripción:** Obtener detalle de un tutor por ID

**Response:**
```json
{
  "success": true,
  "data": { /* TutorEmpresaResponse */ },
  "timestamp": "2024-01-01T00:00:00"
}
```

---

#### POST `/tutores-empresa`
**Descripción:** Registrar un nuevo tutor de empresa

**Request Body:**
```json
{
  "idUsuario": 1,
  "idEmpresa": 1,
  "idSede": 1,
  "cargo": "string",
  "area": "string",
  "empresaNombre": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tutor registrado exitosamente",
  "data": { /* TutorEmpresaResponse */ },
  "timestamp": "2024-01-01T00:00:00"
}
```

---

#### PUT `/tutores-empresa/{id}`
**Descripción:** Actualizar datos de un tutor

**Request Body:**
```json
{
  "idEmpresa": 1,
  "idSede": 1,
  "cargo": "string",
  "area": "string",
  "empresaNombre": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tutor actualizado exitosamente",
  "data": { /* TutorEmpresaResponse */ },
  "timestamp": "2024-01-01T00:00:00"
}
```

---

#### PATCH `/tutores-empresa/{id}/estado`
**Descripción:** Activar o inactivar un tutor

**Query Parameters:**
- `estado`: Estado a asignar

**Response:**
```json
{
  "success": true,
  "message": "Estado del tutor actualizado exitosamente",
  "timestamp": "2024-01-01T00:00:00"
}
```

---

#### GET `/tutores-empresa/empresas/{idEmpresa}/tutores`
**Descripción:** Listar tutores por empresa

**Response:**
```json
{
  "success": true,
  "data": [ /* Array of TutorEmpresaResponse */ ],
  "timestamp": "2024-01-01T00:00:00"
}
```

---

#### GET `/tutores-empresa/sedes/{idSede}/tutores`
**Descripción:** Listar tutores por sede

**Response:**
```json
{
  "success": true,
  "data": [ /* Array of TutorEmpresaResponse */ ],
  "timestamp": "2024-01-01T00:00:00"
}
```

---

## 4. Gestión del Comité de Prácticas

**Base Path:** `/comite-practicas/integrantes`
**Seguridad:** `DIRECTOR`, `COORDINADOR`

### Endpoints

#### GET `/comite-practicas/integrantes`
**Descripción:** Listar todos los integrantes del comité (activos e históricos)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "idUsuario": 1,
      "nombres": "string",
      "apellidos": "string",
      "email": "string",
      "idDocente": 1,
      "codigoDocente": "string",
      "rolComite": "PRESIDENTE|MIEMBRO",
      "fechaInicio": "2024-01-01",
      "fechaFin": "2024-12-31",
      "estado": "ACTIVO",
      "resolucionDesignacion": "string",
      "periodoAcademico": "2024-I"
    }
  ],
  "timestamp": "2024-01-01T00:00:00"
}
```

---

#### GET `/comite-practicas/integrantes/activos`
**Descripción:** Listar solo integrantes activos del comité

**Response:** Same as GET `/comite-practicas/integrantes`

---

#### GET `/comite-practicas/integrantes/presidente`
**Descripción:** Obtener el presidente vigente del comité

**Response:**
```json
{
  "success": true,
  "data": { /* ComiteIntegranteResponse with rolComite = PRESIDENTE */ },
  "timestamp": "2024-01-01T00:00:00"
}
```

---

#### GET `/comite-practicas/integrantes/{id}`
**Descripción:** Obtener un integrante por ID

**Response:**
```json
{
  "success": true,
  "data": { /* ComiteIntegranteResponse */ },
  "timestamp": "2024-01-01T00:00:00"
}
```

---

#### POST `/comite-practicas/integrantes`
**Descripción:** Agregar un nuevo integrante al comité

**Request Body:**
```json
{
  "idUsuario": 1,
  "idDocente": 1,
  "rolComite": "PRESIDENTE|MIEMBRO",
  "fechaInicio": "2024-01-01",
  "fechaFin": "2024-12-31",
  "resolucionDesignacion": "string",
  "periodoAcademico": "2024-I"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Integrante agregado exitosamente",
  "data": { /* ComiteIntegranteResponse */ },
  "timestamp": "2024-01-01T00:00:00"
}
```

---

#### PUT `/comite-practicas/integrantes/{id}`
**Descripción:** Actualizar datos o rol de un integrante

**Request Body:** Same as POST

**Response:**
```json
{
  "success": true,
  "message": "Integrante actualizado exitosamente",
  "data": { /* ComiteIntegranteResponse */ },
  "timestamp": "2024-01-01T00:00:00"
}
```

---

#### PATCH `/comite-practicas/integrantes/{id}/estado`
**Descripción:** Activar o inactivar un integrante

**Query Parameters:**
- `estado`: Estado a asignar (ACTIVO, INACTIVO)

**Response:**
```json
{
  "success": true,
  "message": "Estado del integrante actualizado exitosamente",
  "timestamp": "2024-01-01T00:00:00"
}
```

---

## Reglas de Negocio Implementadas

### Usuarios
- No se eliminan físicamente usuarios; se usa baja lógica por estado
- El correo debe ser único
- Si el usuario tiene expedientes o evaluaciones asociadas, no se puede borrar

### Roles
- Un usuario puede tener varios roles
- No se puede duplicar el mismo rol para el mismo usuario
- No se permite revocar un rol si el usuario tiene procesos activos que dependen de ese rol

### Tutores de Empresa
- Un tutor debe estar vinculado al menos a una empresa
- Un expediente nuevo no puede continuar si no tiene tutor de empresa activo asignado
- Si un tutor se inactiva, no puede asignarse a expedientes nuevos
- El rol TUTOR_EXTERNO solo puede acceder a los expedientes asignados

### Comité de Prácticas
- Solo usuarios/docentes pueden ser integrantes del comité
- Solo debe haber un presidente activo por comité/periodo
- Si un integrante tiene expedientes en revisión, no debería ser removido abruptamente
- El presidente es el docente ordinario con mayor categoría y antigüedad entre los asesores

---

## Entidades Creadas/Modificadas

### Nuevas Entidades
1. **ComiteIntegrante** - Gestión de integrantes del comité de prácticas
2. **TipoUsuario** (Enum) - Clasificación de usuarios (INTERNO/EXTERNO)

### Entidades Modificadas
1. **Usuario** - Se agregaron campos: codigo_institucional, tipo_usuario, fecha_registro, fecha_actualizacion

### DTOs Creados
1. UsuarioDetalleResponse
2. DocenteDTO
3. AsignacionRolRequest
4. TutorEmpresaRequest
5. TutorEmpresaResponse
6. ComiteIntegranteRequest
7. ComiteIntegranteResponse
8. EstadoUsuarioRequest

### Repositorios Creados
1. ComiteIntegranteRepository

### Servicios Creados
1. ComiteIntegranteService (interface + implementation)

### Controladores Creados
1. TutorEmpresaController
2. ComiteIntegranteController

### Servicios Extendidos
1. UsuarioService - Se agregaron métodos: findDetalleById, findAllWithFilters, updateEstado, getRolesByUsuarioId, revokeRol
2. UsuarioController - Se agregaron endpoints para los nuevos métodos de servicio

---

## Notas de Implementación

- Todos los endpoints están protegidos con anotaciones `@PreAuthorize` según los roles especificados
- Se utiliza ApiResponse como respuesta estándar para todos los endpoints
- Se implementaron validaciones de negocio en los servicios
- Se reutilizaron entidades existentes cuando fue posible
- Se creó ApiResponse en core.common para mantener compatibilidad con código existente
