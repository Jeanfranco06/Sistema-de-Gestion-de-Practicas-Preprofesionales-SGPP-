# Documentación de Código Fuente del SGPP

## 1. Propósito y arquitectura

SGPP es una aplicación web para gestionar prácticas preprofesionales de Ingeniería Industrial UNT. El manual operativo coordinado con este documento es [MANUAL_USUARIO_SGPP.md](MANUAL_USUARIO_SGPP.md); ambos mantienen los módulos 1 al 10 en el mismo orden.

| Capa | Implementación actual |
|---|---|
| Frontend | React 19, TypeScript, Vite, React Router, React Query, Axios, Tailwind, Design System y MUI puntual. |
| Backend | Java 17, Spring Boot 3.2, Spring Security, JWT, JPA, MapStruct, Lombok, Flyway y OpenAPI. |
| Persistencia | PostgreSQL; migraciones versionadas con Flyway. |
| Infraestructura local | Docker Compose para PostgreSQL y pgAdmin; API y frontend se ejecutan localmente. |

El reactor Maven es `backend/`: `sgpp-shared` contiene tipos comunes; `sgpp-core` contiene dominio, servicios y controladores; `sgpp-api` contiene arranque, seguridad, configuración y migraciones. El código frontend está en `frontend/src/`.

## 2. Roles, rutas y seguridad transversal

`frontend/src/App.tsx` es el mapa de rutas. Cada ruta protegida usa `auth/ProtectedRoute`; `modules/shared/layout/AppLayout.tsx` construye el menú por rol. La prioridad visual no reemplaza los permisos: un usuario multirrol conserva sus rutas permitidas.

El cliente `frontend/src/api/axios.js` toma `VITE_API_BASE_URL` o `/api/v1`, añade `Authorization: Bearer <token>` desde `localStorage` y elimina sesión/redirige a `/login` ante `401`.

La API es stateless. `sgpp-api/.../config/SecurityConfig.java` configura JWT, BCrypt, CORS con orígenes locales explícitos y reglas HTTP; cada controlador añade restricciones específicas con `@PreAuthorize`. `CurrentUserService` y las consultas `findByIdForUser` aplican acceso por relación al expediente, no solo por rol.

Rutas públicas: `/auth/login`, recuperación/restablecimiento de contraseña, Swagger, OpenAPI, `/public/**` y actuator. Rutas de interfaz públicas: `/login`, `/forgot-password`, `/reset-password`, `/no-autorizado`.

## 3. Módulo Estudiante

| Interfaz | Código frontend | API/dominio principal |
|---|---|---|
| Dashboard, mi práctica y solicitud | `modules/estudiante/` | `practicas`, `expediente` |
| Documentos e informes | `GestionDocumental.tsx`, `InformesPeriodicos.tsx` | `documental`, `expediente`, `exportacion` |
| Plan Anexo 1 | `PlanPracticas.tsx` | `plan/PlanGeneralController` |
| Horas | `RegistroHoras.tsx` | `hora/ControlHoraController` |
| Evaluación y perfil | `EvaluacionEstudiante.tsx`, `PerfilEstudiante.tsx` | `evaluacion`, `seguridad` |
| Catálogo | `sedes/pages/CatalogoSedes.tsx` | `empresarial` |

Rutas: `/estudiante/dashboard`, `/practica`, `/solicitar-practica`, `/documentos`, `/plan-practicas`, `/informes`, `/horas`, `/evaluacion`, `/perfil` y `/sedes`, todas bajo el prefijo `/estudiante`.

`PracticaController` recibe la solicitud en `POST /practicas/solicitar`; el servicio valida elegibilidad y crea el expediente. El ciclo de documentos se apoya en `DocumentoUploadController` para archivos y `ExpedienteController` para asociarlos, presentarlos y evaluarlos. Las reglas de UI no reemplazan las validaciones del backend.

## 4. Módulo Secretaría

La interfaz está en `modules/secretaria/pages/RecepcionAdministrativa.tsx` y `ValidarRequisitos.tsx`; las rutas son `/secretaria/recepcion` y `/admin/validar-requisitos`.

`ExpedienteController` concentra la validación (`PUT /expedientes/{id}/validar`), asignación de asesor (`PUT /expedientes/{id}/asignar-asesor`) e inicio de ejecución (`PUT /expedientes/{id}/iniciar-ejecucion`). `RequisitoAcademicoController`, `ValidacionAcademicaController` y los servicios de prácticas modelan los requisitos por tipo. Las transiciones e historial son responsabilidad de `ExpedienteServiceImpl`.

## 5. Módulo Docente Asesor

El frontend usa `modules/docente/pages/DashboardDocente.tsx`, `modules/evaluacion/ListaPracticantes.tsx`, `EvaluacionDocenteAsesor.tsx` y `modules/shared/pages/RevisionDocumental.tsx`. Las rutas son `/docente/dashboard`, `/docente/practicantes`, `/docente/evaluaciones/:id` y `/docente/documentos/:id`.

`PlanGeneralController` implementa presentación, observación, subsanación y aprobación de plan. `ExpedienteController` permite evaluar documentos e informes y habilitar/registrar examen de aplazados. `NotaUnidadController` expone las notas de prácticas iniciales bajo `/evaluaciones/notas-unidad/expediente/{idExpediente}`. Los servicios verifican la relación del asesor con el expediente antes de mutar datos.

## 6. Módulo Tutor Externo

El módulo frontend está en `modules/tutor/pages/`: dashboard, lista y validación de horas. Comparte `ListaPracticantes` y `EvaluacionTutorExterno.tsx`; las rutas son `/tutor/dashboard`, `/tutor/practicantes`, `/tutor/evaluaciones`, `/tutor/evaluaciones/:id`, `/tutor/horas` y `/tutor/horas/:idExpediente`.

`ControlHoraController` ofrece inicio de control, registro, validación/rechazo, cumplimiento y consultas de registros. El servicio obtiene el usuario autenticado; no acepta el usuario registrador/validador desde el cliente. `EvaluacionController` registra la evaluación empresarial; valida tipo de práctica, criterios, tutor asociado y modo de calificación. `TutorExternoController` y `TutorEmpresaController` administran los actores empresariales.

## 7. Módulo Comité de Prácticas

`modules/comite/pages/PanelComite.tsx` y `modules/evaluacion/EvaluacionComite.tsx` implementan `/comite/panel` y `/comite/evaluaciones/:id`. El detalle de coordinación también reutiliza acciones autorizadas de comité.

La asignación se expone con `PUT /expedientes/{id}/asignar-comite`; `ExpedienteComite` conserva los integrantes activos. `PlanGeneralController` ofrece observar/aprobar; `ExpedienteController` aprueba informe final y emite dictamen (`POST /expedientes/{id}/emitir-dictamen`). `ComponenteEvaluacionController` gestiona los componentes del Anexo 4. El servicio restringe la consulta y escritura a integrantes del comité asignado.

## 8. Módulo Coordinación y Dirección

La implementación frontend vive en `modules/coordinacion/pages/`: `DashboardCoordinacion.tsx`, `Reportes.tsx` y `DetalleExpediente.tsx`, con rutas `/coordinacion/dashboard`, `/reportes` y `/expedientes/:id`.

`ExpedienteController` contiene asignaciones, inicio, cierre, dictamen, examen y lectura filtrada. `CoordinacionController` genera carta de presentación y constancia; `ExportacionController` descarga por ID con validación de acceso y de ruta segura. `IntegridadService` valida requisitos de cierre. La constancia se registra con archivo, hash, fecha, usuario y código de trazabilidad.

## 9. Módulo Administración

Las páginas se encuentran en `modules/admin/pages/` y `modules/sedes/pages/`: dashboard, usuarios, tutores, empresas, sedes, convenios, expedientes, reportes y configuración. Las rutas usan el prefijo `/admin`.

| Dominio backend | Controladores relevantes |
|---|---|
| Usuarios y perfiles | `UsuarioController`, `EstudianteController`, `TutorExternoController`, `ResponsableAcademicoController` |
| Empresas y sedes | `EmpresaController`, `SedePracticaController`, `ConvenioController`, `ValidacionSedeController` |
| Indicadores y reportes | `DashboardKpiController`, `ReporteController`, `ExportacionController` |
| Parámetros, plazos y requisitos | `sgpp-api/.../sistema/ParametroSistemaController`, `PlazoController`, `RequisitoAcademicoController` |
| Auditoría | `AuditoriaController` y servicios de `integridad` |

El cambio manual de estado es `POST /expedientes/{id}/cambiar-estado-manual`, solo para `ADMIN_SISTEMA` y `ADMINISTRADOR`, y deja una entrada de historial. Los parámetros del sistema, reglas de plazo y requisitos se exponen desde los hooks `useConfiguracion.ts` y sus APIs asociadas.

## 10. Flujo de expedientes, modelo y persistencia

`core/expediente/model/EstadoExpediente.java` define el catálogo de estados. `ExpedienteServiceImpl` centraliza las transiciones, documentos, observaciones, historial y restricciones de flujo. El estado no es la única fuente de autorización: las acciones verifican actor, tipo de práctica y relación con el expediente.

Modelo principal:

| Área | Entidades o agregados |
|---|---|
| Identidad | `Usuario`, `Rol`, `UsuarioRol`, `Estudiante`, `TutorExterno`, responsables académicos y token de restablecimiento. |
| Expediente | `Expediente`, historial de estados, documentos, observaciones y comité. |
| Práctica y empresa | `Practica`, `TipoPractica`, `Empresa`, `SedePractica`, `Convenio`, validaciones y horas. |
| Plan y documentos | `PlanGeneral`, secciones, objetivos, cronograma, observaciones, versiones y documento. |
| Evaluación | evaluación, criterios, rúbricas, componentes Anexo 4 y `NotaUnidad`. |
| Gobernanza | requisitos, reglas/plazos, notificaciones, auditoría y registros de exportación. |

Las migraciones están en `sgpp-api/src/main/resources/db/migration/`. No se editan migraciones aplicadas: agregue una versión nueva. Entre las relevantes están las fundacionales (`V1` a `V8`), plan/horas/evaluación (`V26` a `V29`), trazabilidad (`V31`, `V33`, `V34`, `V36`, `V37`) y las reglas actuales de modalidad, examen, notas y calificación (`V54` a `V58`, `V63`).

## Desarrollo, configuración y verificación

Configuración local vigente:

- API: `http://localhost:8082/api/v1`; Swagger: `http://localhost:8082/api/v1/swagger-ui.html`.
- Frontend: `http://localhost:5173`; defina `VITE_API_BASE_URL=http://localhost:8082/api/v1` en `frontend/.env`.
- PostgreSQL: `localhost:5434/sgpp_db`; pgAdmin: `http://localhost:5051`.
- Almacenamiento local: `${user.home}/sgpp/uploads` y `${user.home}/sgpp/exportaciones`.
- Flyway valida migraciones y no permite ejecución fuera de orden en el perfil local.
- Defina `JWT_SECRET` y las variables SMTP para despliegues no locales.

Comandos de verificación:

```powershell
docker-compose up -d
cd backend
mvn -pl sgpp-api -am test
mvn -pl sgpp-api spring-boot:run

cd frontend
npm install
npm run lint
npm run build
npm run test:e2e
```

Las pruebas unitarias backend cubren componentes de evaluación; Playwright contiene pruebas E2E de autenticación. Consulte [GUIA_EJECUCION_LOCAL.md](GUIA_EJECUCION_LOCAL.md), [ESTADO_FUNCIONAL_SGPP.md](ESTADO_FUNCIONAL_SGPP.md) y OpenAPI para contratos y operación detallada.
