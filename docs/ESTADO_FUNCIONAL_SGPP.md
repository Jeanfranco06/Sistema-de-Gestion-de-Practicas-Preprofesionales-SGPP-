# Estado Funcional del SGPP

## Propósito

Este documento describe el comportamiento operativo actual del Sistema de Gestión de Prácticas Preprofesionales (SGPP) de Ingeniería Industrial UNT. Debe actualizarse junto con cualquier cambio que altere flujos, permisos, estados, endpoints o pantallas.

La fuente normativa y funcional de referencia es:

- `docs/REQUERIMIENTOS_FUNCIONALES_SGPP.md` (RF-01 a RF-48).
- `docs/CONTEXTO_SISTEMA_SGPP.md` (reglas, plazos, responsables y documentos).

## Ejecución Local

- Backend: `http://localhost:8082/api/v1`.
- Frontend: `http://localhost:5173`.
- PostgreSQL: `localhost:5434`.
- pgAdmin: `http://localhost:5051`.
- Base de datos y pgAdmin se levantan mediante `docker-compose.yml`; backend y frontend se ejecutan localmente.

## Roles

| Rol | Responsabilidad principal |
|---|---|
| `ESTUDIANTE` | Solicita, carga documentos, presenta plan e informes y registra horas. |
| `SECRETARIA` | Valida requisitos administrativos, registra incidencias y asigna asesores para prácticas iniciales. |
| `DOCENTE_ASESOR` | Revisa documentos e informes de estudiantes asignados y registra evaluaciones de prácticas iniciales. |
| `TUTOR_EXTERNO` | Evalúa el desempeño del practicante de empresa mediante Anexo 2. |
| `COMITE_PRACTICAS` | Asigna/revisa comité, aprueba planes finales/profesionales, evalúa y emite dictamen. |
| `COORDINADOR` / `DIRECTOR` | Emite carta de presentación, controla el expediente y emite constancia. |
| `ADMIN_SISTEMA` / `ADMINISTRADOR` | Administra catálogos, usuarios y consulta institucional. |

Los endpoints de expediente aplican control por rol y por relación con el expediente. Los documentos generados asociados a un expediente también verifican esa relación antes de descargarse.

## Tipos de Práctica

| Tipo | Modalidad | Requisito de horas | Evaluación principal |
|---|---|---:|---|
| `INICIAL` | Curricular | 64 | Notas vigesimales por unidades e informes. |
| `FINAL` | Extracurricular | 360 / 3 meses | Plan, evaluación de empresa (Anexo 2) e informe/comité (Anexo 4). |
| `PROFESIONAL` | Extracurricular | 360 / 3 meses | Plan, evaluación de empresa (Anexo 2) e informe/comité (Anexo 4). |

## Flujo del Expediente

### Inicio administrativo

1. El estudiante abre `/estudiante/solicitar-practica`, selecciona tipo y sede elegible.
2. El frontend llama `POST /practicas/solicitar`.
3. El backend valida elegibilidad académica, crea el expediente y asigna empresa/sede.
4. Secretaría revisa y valida desde `/secretaria/recepcion`, pasando el expediente a `VALIDADO_SECRETARIA`.
5. Dirección o coordinación emite la Carta de Presentación; el expediente pasa a `CARTA_PRESENTACION_EMITIDA` y queda registrada una versión PDF trazable.
6. El estudiante carga la Carta de Aceptación, pasando a `CARTA_ACEPTACION_PRESENTADA`.

### Práctica Inicial

1. Secretaría/Coordinación asigna un docente asesor: `ASESOR_ASIGNADO`.
2. El estudiante presenta el plan: `PLAN_PRESENTADO`.
3. El asesor aprueba el plan: `PLAN_APROBADO`.
4. Secretaría/Coordinación inicia ejecución: `EN_EJECUCION`.
5. El estudiante registra horas y presenta informes parciales/final.
6. El asesor revisa, evalúa y registra la calificación final.
7. Tras cumplir horas, documentos y evaluación, se emite dictamen si corresponde, se cierra el expediente y se genera la constancia.

### Práctica Final o Profesional

1. Comité/Coordinación asigna el comité: `COMITE_ASIGNADO`.
2. El estudiante presenta el plan: `PLAN_PRESENTADO`.
3. El comité aprueba el plan: `PLAN_APROBADO`.
4. Secretaría/Coordinación inicia ejecución: `EN_EJECUCION`.
5. El estudiante registra horas, presenta informe final y constancia empresarial.
6. El tutor externo registra Anexo 2; el comité registra la evaluación consolidada y dictamen.
7. Tras validar los requisitos de cierre, Dirección o Coordinación emite la constancia.

## Estados Operativos Principales

El backend conserva cada transición en el historial inmutable del expediente. Los estados operativos incluyen:

`SOLICITADO` -> `EMPRESA_SEDE_ASIGNADA` -> `VALIDADO_SECRETARIA` -> `CARTA_PRESENTACION_EMITIDA` -> `CARTA_ACEPTACION_PRESENTADA` -> `ASESOR_ASIGNADO` o `COMITE_ASIGNADO` -> `PLAN_PRESENTADO` -> `PLAN_APROBADO` -> `EN_EJECUCION` -> informes/evaluación -> `EVALUADO` -> `DICTAMEN_EMITIDO` -> `CERRADO`.

Los estados de observación y subsanación (`PLAN_OBSERVADO`, `OBSERVADO`, `SUBSANADO`) conservan el historial correspondiente y no reemplazan la trazabilidad previa.

## Módulos de Interfaz

| Módulo | Ruta principal | Capacidades actuales |
|---|---|---|
| Estudiante | `/estudiante/dashboard` | Estado de expediente, horas, documentos, informes, perfil y catálogo de sedes. |
| Secretaría | `/secretaria/recepcion` | Validación administrativa, incidencias, asignación de asesor y emisión institucional disponible según permisos. |
| Docente | `/docente/dashboard` | Consulta de practicantes, revisión documental y evaluación. |
| Tutor externo | `/tutor/dashboard` | Consulta de practicantes asignados y evaluación de empresa. |
| Comité | `/comite/panel` | Consulta de expedientes sujetos a revisión y acciones de comité. |
| Coordinación | `/coordinacion/dashboard` | Gestión y consulta institucional de expedientes. |
| Detalle de coordinación | `/coordinacion/expedientes/:id` | Consulta integral, trazabilidad, horas, documentos y acciones contextuales: carta, aprobación de plan/informe, dictamen y constancia. |
| Administración | `/admin/dashboard` | Usuarios, empresas, sedes, convenios, expedientes y reportes. |

## Endpoints de Operación Relevantes

| Acción | Endpoint |
|---|---|
| Solicitar práctica | `POST /practicas/solicitar` |
| Consultar mis expedientes | `GET /expedientes/mis-expedientes` |
| Validar expediente | `PUT /expedientes/{id}/validar` |
| Emitir carta | `PUT /coordinacion/expediente/{id}/emitir-carta-presentacion` |
| Presentar carta de aceptación | `PUT /expedientes/{id}/presentar-carta-aceptacion` |
| Asignar asesor | `PUT /expedientes/{id}/asignar-asesor` |
| Asignar comité | `PUT /expedientes/{id}/asignar-comite` |
| Presentar/aprobar plan | `PUT /expedientes/{id}/presentar-plan`, `PUT /expedientes/{id}/aprobar-plan` |
| Iniciar ejecución | `PUT /expedientes/{id}/iniciar-ejecucion` |
| Registrar horas | `POST /horas/registrar/{idExpediente}` |
| Evaluar y cerrar | `PUT /expedientes/{id}/evaluar`, `PUT /expedientes/{id}/cerrar` |
| Emitir dictamen | `POST /expedientes/{id}/emitir-dictamen` |
| Emitir constancia | `PUT /coordinacion/expediente/{id}/emitir-constancia` |

## Reglas de Cierre y Constancia

La emisión de constancia verifica los requisitos de cierre definidos por el servicio de integridad, incluyendo horas, documentos y evaluación requeridos. Si el expediente se encuentra en un estado evaluable y aún no está cerrado, la emisión de constancia lo cierra primero y luego genera el PDF institucional. La respuesta retorna el expediente actualizado.

Una constancia generada se registra con archivo, hash, fecha, usuario solicitante y código de trazabilidad. La descarga de un documento asociado a expediente requiere autenticación y autorización de lectura sobre ese expediente.

## Cambios Registrados

### 2026-07-18

- Corregida la emisión de constancia en `CoordinacionController`: ahora cierra el expediente cuando corresponde y devuelve el expediente actualizado.
- Eliminada la generación duplicada de Carta de Presentación desde `CoordinacionController`; el servicio de expediente es la única fuente de generación de ese documento.
- Restringida la descarga por registro documental a usuarios autenticados con acceso de lectura al expediente asociado.
- Añadidas acciones contextuales en el detalle de coordinación para emitir Carta de Presentación y Constancia de Prácticas.
- Corregido el panel del Comité para reflejar los estados reales tras aprobar plan/informe y habilitar dictamen en los estados permitidos por el backend.
- Eliminados los valores ficticios de expediente y evaluador en la evaluación del docente asesor.
- Las emisiones de carta y constancia requieren ahora un usuario autenticado identificable; no se atribuyen a un usuario predeterminado.
- Alineado el filtro y la acción de emisión de carta del administrador con `VALIDADO_SECRETARIA`.
- La configuración ESLint se ajustó a una aplicación sin React Compiler: las reglas exclusivas del compilador no bloquean los efectos estándar de carga de datos. Se corrigieron las referencias no definidas y expresiones booleanas inválidas que impedían ejecutar el lint.
- Fase 2 completada en el detalle de coordinación: aprobación de plan, aprobación de informe final y emisión de dictamen con comentario obligatorio, además de las acciones de carta y constancia.
- Fase 3 completada: Secretaría conserva validación, incidencias y asignación de asesor para iniciales. La asignación se habilita después de `VALIDADO_SECRETARIA`; la emisión de carta y constancia queda exclusivamente en Coordinación/Dirección.
- Fase 4 completada: la revisión documental del docente/comité respeta la secuencia `PENDIENTE -> EN_REVISION -> OBSERVADO/APROBADO -> ARCHIVADO`. Las observaciones son obligatorias y la ruta de revisión solo expone roles autorizados por el backend.
- Fase 5 completada: la evaluación empresarial se limita a prácticas finales/profesionales con informe final presentado, fuerza el evaluador autenticado, verifica acceso del tutor al expediente y exige todos los criterios de empresa con puntajes válidos. La constancia adjunta acepta solo PDF.
- Fase 6 completada: el Comité solo visualiza expedientes donde tiene asignación activa. Sus acciones se limitan a prácticas finales/profesionales e incluyen aprobar u observar el plan, aprobar el informe final y emitir dictamen; cada acción verifica la asignación del integrante en backend.
- Fase 7 completada: el control de horas se crea automáticamente al iniciar ejecución. Las operaciones documentales e informes verifican el acceso del estudiante al expediente, y el gestor documental distingue cartas institucionales, informes gestionados en su módulo y documentos habilitados según el estado. El checklist inicial usa el tipo de informe final correcto y no exige Anexo 2.
- Fase 8 completada: administradores autorizados pueden consultar KPIs, generar reportes y exportarlos a PDF/CSV. Los filtros usan los estados reales del expediente y la navegación desde reportes administrativos respeta las rutas disponibles para ese rol.
- Fase 9 completada: la gestión administrativa de expedientes queda limitada a consulta y filtrado; ya no presenta acciones de emisión ni rutas de detalle reservadas para Coordinación. También se eliminaron imports sin uso en las vistas intervenidas.
- Fase 10 completada: se eliminaron imports, variables y directivas ESLint obsoletos en vistas de administración, estudiante, evaluación, secretaría y sedes. Las advertencias de lint se redujeron de 88 a 14; las restantes corresponden principalmente a dependencias de efectos y referencias de limpieza que requieren revisión de ciclo de vida.
- Corrección de acceso: `DIRECTOR` puede consultar el control, cumplimiento e historial de horas desde el detalle del expediente, sin permisos para registrar o validar horas.
- Seguridad documental: los documentos adjuntos se descargan por su ID y validan acceso de lectura al expediente. Los documentos institucionales generados se descargan desde `/exportacion/descargar/{id}` con la misma validación; ya no se exponen nombres de almacenamiento ni rutas físicas al cliente.
- Seguridad de expedientes: la consulta general devuelve todos los expedientes solo a roles con lectura institucional; estudiante, asesor, tutor y comité reciben únicamente expedientes relacionados.
- Seguridad de horas: el registro y la validación ya no reciben IDs de usuario desde el cliente. El registro exige que el usuario autenticado sea el estudiante titular, que el expediente esté en ejecución y que la fecha y cantidad de horas sean válidas.
- Corrección de disponibilidad: las pantallas solo consultan control, cumplimiento y registros de horas desde `EN_EJECUCION`. La descarga institucional admite registros heredados con rutas relativas y los resuelve por nombre dentro del directorio seguro de exportaciones.
- Corrección de cierre: la constancia institucional `CONSTANCIA_CULMINACION` se genera después de cerrar y ya no bloquea ese cierre. La integridad exige la `CONSTANCIA_EMPRESA` aportada durante la práctica y usa `INFORME_FINAL` para prácticas profesionales, igual que la interfaz.
- Consistencia de roles: la interfaz de coordinación muestra emisión de carta y constancia solo a Dirección, Coordinación y Administración del Sistema; las acciones de revisión se limitan a los roles autorizados por el backend.
- Flujo del Plan: asesor o comité solo se asignan después de la Carta de Aceptación. La pantalla documental informa el responsable pendiente, muestra la Carta institucional como emitida y bloquea eliminarla. La Constancia de Empresa se habilita durante la ejecución y la Ficha de Evaluación queda a cargo del Tutor Externo.
- Verificaciones ejecutadas: compilación Maven del reactor (`mvn -pl sgpp-api -am test -DskipTests`) y bundle del frontend (`npm run build`).

## Pendientes Técnicos Conocidos

- `npm run lint` finaliza sin errores. Persisten advertencias de limpieza por imports/variables sin uso y dependencias de hooks; deben resolverse por lotes funcionales para no mezclar cambios masivos con correcciones de negocio.
- Las reglas configurables de plazos, modalidad de evaluación y requisito académico deben mantenerse alineadas con los documentos normativos citados al inicio.
