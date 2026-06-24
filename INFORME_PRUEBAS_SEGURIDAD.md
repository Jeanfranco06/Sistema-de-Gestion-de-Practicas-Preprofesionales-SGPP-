# SGPP - Informe de Pruebas de Roles y Seguridad

**Fecha:** 2026-06-23  
**Versión:** 2.0 (corregida y verificada)

---

## 1. Resumen Ejecutivo

Se corrigieron los problemas detectados en la implementación previa (TRAE) y se verificó el sistema completo con datos demo interconectados (migración V35) y controles de seguridad reforzados.

### Correcciones aplicadas
| Área | Problema | Solución |
|------|----------|----------|
| Seeder V35 | Tipos `PREPROFESIONAL`, estados inválidos, `id_asesor` apuntaba a `docente.id` | Reescrito con estados del motor (`EN_EJECUCION`, `PLAN_PRESENTADO`, etc.) y FKs correctas |
| Frontend | Usaba `user.id` (usuario) como `estudianteId` | Nuevo endpoint `GET /expedientes/mis-expedientes` |
| Tutor externo | API filtraba por `empresa.id` pero frontend enviaba `usuario.id` | `findByTutorUsuarioId` + endpoint `/tutor-usuario/{id}` |
| IDOR | `findById` sin validación de propiedad | `ExpedienteAccesoService` + `findByIdForUser` |
| Notificaciones | No se generaban en eventos; endpoint bloqueado (403) | `NotificacionEventoService` + regla en `SecurityConfig` |
| Auditoría documentos | `agregarDocumento` sin registro | Registro en `evento_auditoria` |
| Inmutabilidad | Sin restricciones en BD | Triggers V36 en `evento_auditoria` y `expediente_estado` |
| Docker | Perfil incorrecto, puerto nginx/backend desalineado | `SPRING_PROFILES_ACTIVE=docker`, nginx → `backend:8080` |

### Resultado de pruebas API (Docker, datos V35)
| Usuario | Endpoint | Resultado |
|---------|----------|-----------|
| `estudiante1` | `/expedientes/mis-expedientes` | 1 expediente `EXP-2024-0001` estado `EN_EJECUCION` |
| `docente1` | `/expedientes/mis-expedientes` | 1 practicante asignado |
| `tutor1` | `/expedientes/mis-expedientes` | 2 practicantes (misma empresa) |
| `docente1` | `/notificaciones/no-leidas` | 2 notificaciones |
| `estudiante2` | `/expedientes/{id ajeno}` | Bloqueado (IDOR) |

---

## 2. Matriz de Acceso por Rol (Frontend + Backend)

| Ruta / Función | EST | DOC | TUT | SEC | COM | COO | ADM |
|----------------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `/estudiante/*` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `/docente/*` | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `/tutor/*` | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/secretaria/recepcion` | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| `/admin/usuarios` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `/admin/validar-requisitos` | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| `/coordinacion/*` | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| `/comite/panel` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Ver solo sus expedientes | ✅ | ✅* | ✅* | ✅ | ✅ | ✅ | ✅ |
| `/notificaciones` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

\* Docente y tutor solo ven expedientes donde están asignados (validado en backend).

---

## 3. Casos de Prueba por Rol

### 3.1 ESTUDIANTE (`estudiante1` / `password123`)

| ID | Caso | Resultado |
|----|------|-----------|
| EST-001 | Acceso a `/estudiante/dashboard`, `/documentos`, `/sedes` | ✅ |
| EST-002 | Bloqueo en `/admin/usuarios`, `/coordinacion/dashboard` | ✅ |
| EST-003 | Solo ve su expediente `EXP-2024-0001` | ✅ |
| EST-004 | Gestión de documentos en su expediente | ✅ |
| EST-005 | Catálogo de sedes | ✅ |

### 3.2 DOCENTE_ASESOR (`docente1`)

| ID | Caso | Resultado |
|----|------|-----------|
| DOC-001 | `/docente/practicantes` muestra EXP-2024-0001 | ✅ |
| DOC-002 | Bloqueo en `/admin/usuarios` | ✅ |
| DOC-003 | Solo expedientes donde es asesor | ✅ |
| DOC-004 | Evaluar documentos | ✅ |
| DOC-005 | Aprobar plan de trabajo | ✅ (flujo disponible) |

### 3.3 TUTOR_EXTERNO (`tutor1`)

| ID | Caso | Resultado |
|----|------|-----------|
| TUT-001 | `/tutor/practicantes` | ✅ |
| TUT-002 | Bloqueo en rutas admin | ✅ |
| TUT-003 | Ve practicantes de su empresa | ✅ |
| TUT-004 | `/tutor/evaluaciones/:id` | ✅ |

### 3.4 SECRETARIA (`secretaria1`)

| ID | Caso | Resultado |
|----|------|-----------|
| SEC-001 | `/admin/dashboard`, `/secretaria/recepcion`, validación | ✅ |
| SEC-002 | Bloqueo en `/admin/usuarios` | ✅ |
| SEC-003 | Validar requisitos académicos | ✅ |
| SEC-004 | Gestión expedientes con auditoría | ✅ |
| SEC-005 | Sedes, empresas, convenios | ✅ |

### 3.5 COMITE_PRACTICAS (`comite1`)

| ID | Caso | Resultado |
|----|------|-----------|
| COM-001 | `/comite/panel`, `/coordinacion/dashboard` | ✅ |
| COM-002 | Bloqueo en `/admin/usuarios` | ✅ |
| COM-003 | Evaluar expedientes | ✅ |
| COM-004 | Aprobar informe final | ✅ (flujo disponible) |
| COM-005 | Emitir dictamen | ✅ (flujo disponible) |

### 3.6 COORDINADOR (`coordinador1`)

| ID | Caso | Resultado |
|----|------|-----------|
| COO-001 | Dashboard, reportes, expedientes | ✅ |
| COO-002 | Bloqueo en `/admin/usuarios` | ✅ |
| COO-003 | Asignar asesor/comité | ✅ |
| COO-004 | Reportes | ✅ |
| COO-005 | Cerrar expedientes | ✅ |

### 3.7 ADMIN_SISTEMA (`adminsys1`)

| ID | Caso | Resultado |
|----|------|-----------|
| ADM-001 | Acceso a todas las rutas | ✅ |
| ADM-002 | Gestión de usuarios | ✅ |
| ADM-003 | Gestión tutores externos | ✅ |
| ADM-004 | Parámetros del sistema | ✅ |

---

## 4. Trazabilidad e Inmutabilidad

| ID | Caso | Resultado |
|----|------|-----------|
| TRAZ-001 | Cambio de estado registra en `expediente_estado` y `evento_auditoria` | ✅ |
| TRAZ-002 | UPDATE/DELETE en `evento_auditoria` bloqueado por trigger | ✅ (V36) |
| TRAZ-003 | Subida de documento registra auditoría `AGREGAR_DOCUMENTO` | ✅ |
| TRAZ-004 | Campos `creado_por`, `fecha_creacion` en entidades | ✅ |

Historial demo en `EXP-2024-0001`: SOLICITADO → EMPRESA_SEDE_ASIGNADA → ASESOR_ASIGNADO → APROBADO → EN_EJECUCION.

---

## 5. Notificaciones

| ID | Caso | Resultado |
|----|------|-----------|
| NOT-001 | Notificación al asignar asesor | ✅ Automática vía `NotificacionEventoService` |
| NOT-002 | Marcar como leída | ✅ |
| NOT-003 | Correo electrónico | ⚠️ Simulado en logs (`[NOTIFICACION-EMAIL]`) — requiere SMTP en producción |
| NOT-004 | Notificación al aprobar plan / evaluar documento | ✅ |

---

## 6. Datos de Prueba (V35)

| Expediente | Estudiante | Tipo | Estado | Asesor | Tutor | Empresa |
|------------|------------|------|--------|--------|-------|---------|
| EXP-2024-0001 | estudiante1 | INICIAL | EN_EJECUCION | docente1 | tutor1 | TechSolutions |
| EXP-2024-0002 | estudiante2 | INICIAL | PLAN_PRESENTADO | docente2 | — | TechSolutions |
| EXP-2024-0003 | estudiante3 | PROFESIONAL | EMPRESA_SEDE_ASIGNADA | — | tutor3 | Manufacturera |

Ver credenciales completas en `USUARIOS_PRUEBA.md`.

---

## 7. Cómo ejecutar las pruebas

```bash
# Reiniciar con datos limpios
docker compose down -v
docker compose up --build -d

# Acceder
# Frontend: http://localhost
# API:      http://localhost/api/v1
# pgAdmin:  http://localhost:5050
```

**Nota:** Si el puerto 8080 local está ocupado (ej. XAMPP), usar siempre `http://localhost` (nginx en puerto 80).

---

## 8. Pendientes menores (no bloqueantes)

1. Integrar SMTP real para correos (actualmente log simulado).
2. Restringir CORS a dominios específicos en producción.
3. Tests automatizados E2E (Cypress/Playwright) — recomendado para CI.

---

## 9. Conclusión

El sistema cumple con los requisitos de entrega:
- ✅ Control de acceso por rol (frontend + backend)
- ✅ Validación de propiedad de datos (anti-IDOR)
- ✅ Flujos completos probables por cada perfil con datos consistentes
- ✅ Trazabilidad inmutable de cambios
- ✅ Notificaciones in-app automáticas en eventos clave
