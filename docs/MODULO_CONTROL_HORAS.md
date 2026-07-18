# Módulo de Control de Horas de Práctica - SGPP

## Resumen de Implementación

Se ha implementado el módulo de control de horas de práctica del SGPP con las siguientes características:

### 1. Entidades

**ControlHora** (`edu.unt.ingenieria_industrial.sgpp.core.hora.model.ControlHora`)
- Control de horas por expediente
- Campos: horas_requeridas, horas_acumuladas, fecha_inicio, fecha_fin_estimada, fecha_fin_real, estado
- Relación uno-a-muchos con RegistroHora

**RegistroHora** (`edu.unt.ingenieria_industrial.sgpp.core.hora.model.RegistroHora`)
- Registro individual de horas
- Campos: fecha, hora_inicio, hora_fin, horas, descripcion_actividad, tipo_registro, usuario_registra, validado_por_tutor, tutor_valida, observaciones
- Relación muchos-a-uno con ControlHora y Usuario

### 2. Reglas de Negocio Implementadas

**Prácticas Iniciales**
- Requisito: 64 horas efectivas
- Validación: Solo verifica cumplimiento cuantitativo

**Prácticas Finales/Profesionales**
- Requisito: 360 horas efectivas
- Validación cuantitativa: Total de horas >= 360
- Validación temporal: Distribución en mínimo 3 meses
- Validación de carga: Promedio semanal >= 30 horas

### 3. Servicios Implementados

**ControlHoraService** (`edu.unt.ingenieria_industrial.sgpp.core.hora.service.ControlHoraService`)
- `iniciarControlHora`: Inicia el control de horas para un expediente
- `registrarHora`: Registra horas de práctica
- `validarHora`: Valida un registro de horas por parte del tutor
- `verificarCumplimiento`: Verifica el cumplimiento de horas con alertas
- `obtenerControlHora`: Obtiene el estado actual del control de horas
- `listarRegistros`: Lista todos los registros de horas
- `listarRegistrosPorPeriodo`: Lista registros en un periodo específico
- `actualizarHorasAcumuladas`: Actualiza el total de horas acumuladas
- `puedeCerrarExpediente`: Verifica si se puede cerrar el expediente

### 4. Endpoints REST

**ControlHoraController** (`edu.unt.ingenieria_industrial.sgpp.core.hora.controller.ControlHora`)
- `POST /api/v1/horas/iniciar/{idExpediente}` - Iniciar control de horas
- `POST /api/v1/horas/registrar/{idExpediente}` - Registrar horas
- `PUT /api/v1/horas/validar/{idRegistro}` - Validar registro de horas
- `GET /api/v1/horas/cumplimiento/{idExpediente}` - Verificar cumplimiento
- `GET /api/v1/horas/control/{idExpediente}` - Obtener control de horas
- `GET /api/v1/horas/registros/{idExpediente}` - Listar registros
- `GET /api/v1/horas/registros/{idExpediente}/periodo` - Listar por periodo
- `POST /api/v1/horas/actualizar/{idExpediente}` - Actualizar horas acumuladas
- `GET /api/v1/horas/puede-cerrar/{idExpediente}` - Verificar si puede cerrar

### 5. Integración con Flujo del Expediente

Se ha modificado el método `cerrar` en `ExpedienteServiceImpl` para validar el cumplimiento de horas antes de permitir el cierre de un expediente. Si no se cumplen las horas requeridas, se lanza una `BusinessException`.

### 6. Migración de Base de Datos

**V23__create_control_hora_tables.sql**
- Crea tabla `control_hora`
- Crea tabla `registro_hora`
- Agrega constraints de foreign key
- Agrega índices para optimización

## Archivos Creados/Modificados

### Nuevos Archivos
- `backend/sgpp-core/src/main/java/edu/unt/ingenieria_industrial/sgpp/core/hora/service/ControlHoraService.java`
- `backend/sgpp-core/src/main/java/edu/unt/ingenieria_industrial/sgpp/core/hora/service/impl/ControlHoraServiceImpl.java`
- `backend/sgpp-core/src/main/java/edu/unt/ingenieria_industrial/sgpp/core/hora/controller/ControlHoraController.java`
- `backend/sgpp-api/src/main/resources/db/migration/V23__create_control_hora_tables.sql`

### Archivos Modificados
- `backend/sgpp-core/src/main/java/edu/unt/ingenieria_industrial/sgpp/core/expediente/service/impl/ExpedienteServiceImpl.java`
  - Agregada dependencia `ControlHoraService`
  - Modificado método `cerrar` para validar cumplimiento de horas

## Pasos para Compilar y Ejecutar

### 1. Configurar JAVA_HOME
Asegúrese de que la variable de entorno JAVA_HOME esté configurada correctamente apuntando a la instalación de Java 17.

### 2. Compilar el proyecto
```bash
cd backend
mvn clean install
```

### 3. Ejecutar la aplicación
```bash
cd sgpp-api
mvn spring-boot:run
```

## Resolución de Errores de Compilación

Si encuentra errores relacionados con `ApiResponse` no resuelto:

1. Asegúrese de que el módulo `sgpp-shared` esté compilado primero:
```bash
cd backend/sgpp-shared
mvn clean install
```

2. Luego compile el módulo `sgpp-core`:
```bash
cd backend/sgpp-core
mvn clean install
```

3. Finalmente compile el módulo `sgpp-api`:
```bash
cd backend/sgpp-api
mvn clean install
```

## Características Clave

### Auditoría
- Cada registro de hora incluye: usuario que registra, fecha de registro, validación del tutor, observaciones
- Trazabilidad completa de cambios en el control de horas

### Validaciones
- Fechas de registro dentro del periodo de práctica
- Solo se acumulan horas validadas por el tutor
- Alertas por insuficiencia de horas
- Alertas por inconsistencia temporal (prácticas finales/profesionales)

### Seguridad
- Endpoints protegidos con `@PreAuthorize` según roles
- Roles permitidos: ADMINISTRADOR, COORDINADOR, SECRETARIA, ESTUDIANTE, TUTOR_EXTERNO

### Integración
- Integración automática con flujo del expediente
- El sistema no permite cerrar expedientes sin cumplir horas requeridas
- Compatibilidad con expedientes anteriores (sin control de horas)
