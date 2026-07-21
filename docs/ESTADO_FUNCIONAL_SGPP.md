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
2. El estudiante completa el formulario estructurado del Anexo 1 y presenta el plan: `PLAN_PRESENTADO`.
3. El asesor aprueba el plan: `PLAN_APROBADO`.
4. Secretaría/Coordinación inicia ejecución: `EN_EJECUCION`.
5. El estudiante registra horas y presenta informes parciales/final.
6. El asesor revisa, evalúa y registra la calificación final.
7. Tras cumplir horas, documentos y evaluación, se emite dictamen si corresponde, se cierra el expediente y se genera la constancia.

### Práctica Final o Profesional

1. Comité/Coordinación asigna el comité: `COMITE_ASIGNADO`.
2. El estudiante completa el formulario estructurado del Anexo 1 y presenta el plan: `PLAN_PRESENTADO`.
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
| Plan de Prácticas | `/estudiante/plan-practicas` | Formulario estructurado del Anexo 1: practicante, empresa, área, situación problemática, objetivos, técnicas/procedimientos y cronograma. |
| Secretaría | `/secretaria/recepcion` | Validación administrativa, incidencias, asignación de asesor y emisión institucional disponible según permisos. |
| Docente | `/docente/dashboard` | Consulta de practicantes, revisión documental y evaluación. |
| Tutor externo | `/tutor/dashboard` | Consulta de practicantes asignados y evaluación de empresa. |
| Comité | `/comite/panel` | Consulta de expedientes sujetos a revisión y acciones de comité. |
| Coordinación | `/coordinacion/dashboard` | Gestión y consulta institucional de expedientes, incluida la asignación de comité para prácticas finales/profesionales. |
| Detalle de coordinación | `/coordinacion/expedientes/:id` | Consulta integral, trazabilidad, horas, documentos y acciones contextuales: carta, asignación de comité, aprobación de plan/informe, dictamen y constancia. |
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
| Registrar/presentar Plan estructurado | `POST /planes`, `PUT /planes/{id}/presentar` |
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
- Corregido el correlativo de expedientes: la búsqueda del máximo por prefijo usa coincidencia literal de prefijo, evitando conflictos de código único al crear nuevos expedientes.
- El Plan observado o subsanado puede reenviarse: al cargar una versión corregida se retorna a `PLAN_PRESENTADO` para una nueva revisión.
- El Tutor Externo asociado a la empresa del expediente puede validar horas; un tutor sin relación con la empresa sigue sin acceso de escritura.
- El cierre de expediente sincroniza la práctica heredada vinculada como `COMPLETADA` e inactiva. La validación académica reconoce una práctica Inicial completada para habilitar solicitudes Final/Profesional.
- Se desactivaron reglas académicas duplicadas y la evaluación académica ya no duplica resultados para una misma regla activa.
- Se habilitó el rol `ADMINISTRADOR` y se asignó al usuario local `adminsys1` mediante migración.
- Coordinación y Dirección pueden asignar entre uno y tres integrantes activos del comité a expedientes Finales o Profesionales desde el dashboard o el detalle. La asignación deja el expediente en `COMITE_ASIGNADO`.
- Las descargas institucionales por `/exportacion/descargar/{id}` responden correctamente para registros autorizados; la autenticación admite usuario o correo y los accesos denegados retornan `403` de forma consistente.
- Calidad frontend: se migraron APIs obsoletas de MUI y props de layout al modelo actual. `npm run lint` finaliza sin errores ni advertencias y `npm run build` finaliza correctamente.
- Migraciones incorporadas: `V49__habilitar_rol_administrador.sql`, `V50__reiniciar_flujo_e2e_estudiante1.sql`, `V51__sincronizar_practicas_cerradas.sql` y `V52__desactivar_reglas_academicas_duplicadas.sql`.
- Validación E2E ejecutada: una práctica Inicial de `estudiante3` recorrió el flujo completo hasta `CERRADO`, incluida la descarga de constancia. Una práctica Final del mismo estudiante alcanzó `EN_EJECUCION` con Plan aprobado y 360 horas; su cierre permanece bloqueado hasta distribuir las horas en al menos tres meses, conforme a la regla temporal.
- Reemplazo de Carta de Aceptación: mientras el expediente esté en `CARTA_ACEPTACION_PRESENTADA`, el estudiante puede eliminar una carta pendiente para volver a `CARTA_PRESENTACION_EMITIDA` y cargar la versión correcta. También se admite completar la carga cuando se eliminó previamente un registro inconsistente y el estado aún era `CARTA_ACEPTACION_PRESENTADA`.
- Corrección de datos local: se eliminó el vínculo erróneo que registraba la Carta de Presentación como `CARTA_ACEPTACION` en `EXP-2026-INICIAL-0001`; el expediente quedó en `CARTA_PRESENTACION_EMITIDA`, con la Carta de Presentación institucional conservada y listo para cargar la aceptación real.
- Claridad documental: la Carta de Aceptación se muestra como `Presentada` tras su carga. El estado de revisión del archivo es independiente del estado del expediente y no debe ocultar la transición a `CARTA_ACEPTACION_PRESENTADA`.
- Navegación multirrol: un usuario con `COMITE_PRACTICAS` y `DOCENTE_ASESOR` conserva el menú de Comité e incorpora `Mis Practicantes`, evitando que la prioridad visual del Comité oculte sus expedientes asignados como asesor.
- RF-16 implementado en interfaz: el estudiante completa el Anexo 1 mediante `/estudiante/plan-practicas`, en lugar de adjuntar solo un PDF. El formulario usa el modelo de Plan General existente, precarga datos disponibles del expediente y exige carátula, empresa, área, situación problemática, objetivos, técnicas/procedimientos y cronograma antes de presentar el Plan.

### 2026-07-19 — Fase 1: Infraestructura y correcciones críticas

- Análisis exhaustivo del sistema documentado en `docs/ANALISIS_SISTEMA_SGPP.md`.
- Habilitado `@EnableScheduling` en `SgppApplication` y creado `PlazoVencimientoScheduler` para ejecutar diariamente `PlazoService.actualizarEstadosVencidos()` (configurable mediante `sgpp.scheduler.plazos.cron` y `sgpp.scheduler.plazos.enabled`).
- Agregado endpoint manual `POST /plazos/actualizar-estados` para forzar la actualización de plazos vencidos (ya existía, ahora complementado con el scheduler).
- Implementado servicio de correo electrónico real (`EmailService` / `EmailServiceImpl`) usando `spring-boot-starter-mail`; `NotificacionEventoServiceImpl` envía correos reales en lugar de logs simulados.
- Configuradas propiedades SMTP en `application.yml` y `application-local.yml` (variables de entorno `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`, etc.).
- Creada migración `V54__corregir_modalidad_practicas_finales_profesionales.sql` para ajustar `curricular = FALSE` en `FINAL` y `PROFESIONAL`, conforme a la normativa UNT y el reglamento de la Escuela.
- Verificaciones ejecutadas: `mvn -pl sgpp-api -am compile -DskipTests`, `npm run lint` y `npm run build`.

### 2026-07-19 — Fase 2: Examen de Aplazados

- Agregados estados `EXAMEN_APLAZADOS_HABILITADO` y `EXAMEN_APLAZADOS_RENDIDO` al flujo de expediente.
- Creada migración `V55__examen_aplazados_practicas_iniciales.sql` con campos `nota_examen_aplazados` y `fecha_examen_aplazados` en `expediente`.
- Implementados endpoints `POST /expedientes/{id}/habilitar-examen-aplazados` y `POST /expedientes/{id}/registrar-examen-aplazados` en `ExpedienteController`.
- Implementada lógica de negocio en `ExpedienteServiceImpl`: solo prácticas iniciales, habilitación desde `EVALUADO` o `INFORME_FINAL_PRESENTADO`, registro de nota 0-20, aprobación con nota >= 13.5 y transición a `EVALUADO`, notificaciones in-app y por correo.
- Actualizado frontend: `StatusChip`, `designTokens`, `expedientesApi`, `useExpedientes` y `DetalleExpediente` para habilitar/registrar el examen de aplazados desde la vista de coordinación/dirección.
- Verificaciones ejecutadas: `mvn -pl sgpp-api -am compile -DskipTests`, `npm run lint` y `npm run build`.

### 2026-07-19 — Fase 3: Consolidación del modelo de evaluación

- Ajustado `ComponenteEvaluacionServiceImpl.inicializarComponentes` para no crear componentes Anexo 4 en prácticas `INICIAL` (estas usan evaluación curricular por unidades).
- Implementada sincronización automática en `ComponenteEvaluacionServiceImpl.registrarEvaluacion`: cuando los tres componentes (PLAN 10 + EMPRESA 50 + INFORME 40) están completos, se calcula el puntaje total sobre 100 y se convierte a escala vigesimal (0-20) para `expediente.calificacion_final`.
- Modificado `EvaluacionServiceImpl.crearEvaluacion` para replicar la evaluación de empresa (`EMPRESA`) en el componente Anexo 4 correspondiente, evitando duplicidad de cálculo.
- `EvaluacionServiceImpl.calcularPromedioFinal` prioriza ahora los componentes Anexo 4 cuando existen, para prácticas finales/profesionales.
- Verificaciones ejecutadas: `mvn -pl sgpp-api -am compile -DskipTests`, `npm run lint` y `npm run build`.

### 2026-07-19 — Fase 4: Mejoras visuales (parcial)

- Reemplazados íconos repetidos del menú estudiante (`Assignment`) por íconos diferenciados de `lucide-react` (`Briefcase`, `FileCheck`, `ClipboardList`, `Clock`, `FileText`, `MapPin`, `Building2`).
- Ocultada del menú estudiante la opción "Evaluación" que apuntaba a `PaginaEnConstruccion`.
- Agregados al menú estudiante accesos visuales a "Centros de Práctica" y "Empresas Receptoras".
- Verificaciones ejecutadas: `npm run lint` y `npm run build`.

### 2026-07-19 — Verificación final de integridad

- Backend: `mvn -pl sgpp-api -am package -DskipTests` finaliza correctamente; JAR ejecutable de `sgpp-api` generado.
- Frontend: `npm run lint` sin errores y `npm run build` sin errores.
- Base de datos: migraciones V54 y V55 listas para aplicarse con Flyway en el próximo inicio de la API.

### 2026-07-19 — Notas por unidades (Práctica Inicial)

- Creada migración `V56__notas_unidades_practicas_iniciales.sql` con tabla `nota_unidad` y restricción única por expediente y unidad.
- Implementada entidad `NotaUnidad`, repositorio, DTOs (`NotaUnidadRequestDTO`, `NotaUnidadResponseDTO`), servicio `NotaUnidadServiceImpl` y `NotaUnidadController` con endpoints:
  - `POST /evaluaciones/notas-unidad/expediente/{idExpediente}`
  - `GET /evaluaciones/notas-unidad/expediente/{idExpediente}`
  - `GET /evaluaciones/notas-unidad/expediente/{idExpediente}/unidad/{numeroUnidad}`
- Reglas: solo prácticas `INICIAL`; unidades 1 a 3; unidad 1 con 20% plan de práctica y 80% informe de avance; unidades 2 y 3 con 100% informe de avance; escala vigesimal (0-20); nota mínima aprobatoria 13.5.
- Al completar las tres unidades, `sincronizarCalificacionFinal` actualiza `expediente.calificacion_final` con el promedio de las notas finales de unidad.
- Frontend: agregados endpoints en `evaluacionesApi`, hook `useNotasUnidad` y sección de notas por unidad en `EvaluacionDocenteAsesor` visible solo para prácticas `INICIAL`. El promedio general mostrado prioriza el promedio de notas por unidad cuando está completo.
- Verificaciones ejecutadas: `mvn -pl sgpp-api -am package -DskipTests`, `npm run lint` y `npm run build`.

### 2026-07-19 — Plantilla de informe final descargable

- Agregado `PLANTILLA_INFORME_FINAL` a `TipoDocumentoInstitucional`.
- Implementado `ExportacionService.generarPlantillaInformeFinal(Long idExpediente)` y `ExportacionServiceImpl.construirPdfPlantillaInformeFinal` para generar un PDF con portada, datos del expediente (si se proporciona `idExpediente`) y las 14 secciones estándar del informe final.
- Endpoint público `GET /exportacion/plantilla-informe-final?idExpediente={id}` accesible para usuarios autenticados; valida lectura del expediente cuando se envía el parámetro.
- Frontend: creado `frontend/src/api/exportacionApi.js` y agregado botón "Plantilla informe final" en `InformesPeriodicos` para estudiantes.
- Verificaciones ejecutadas: `mvn -pl sgpp-api -am package -DskipTests`, `npm run lint` y `npm run build`.

### 2026-07-19 — Consolidación de evaluación Anexo 4

- Creado `frontend/src/api/componentesEvaluacionApi.js` y `frontend/src/hooks/useComponentesEvaluacion.ts` para consumir el backend de `componente_evaluacion`.
- Creado componente reutilizable `frontend/src/modules/evaluacion/EvaluacionComponentesAnexo4.tsx` que muestra los componentes PLAN (10%), EMPRESA (50%, solo lectura) e INFORME (40%), calcula total sobre 100 y escala vigesimal.
- `EvaluacionDocenteAsesor` ahora redirige a `EvaluacionComponentesAnexo4` con rol `DOCENTE` cuando el expediente es `FINAL` o `PROFESIONAL`; las prácticas `INICIAL` conservan notas por unidades.
- Creado `frontend/src/modules/evaluacion/EvaluacionComite.tsx` y ruta `/comite/evaluaciones/:id` en `App.tsx` para que el comité evalúe los componentes Anexo 4.
- Agregado botón de evaluación en el panel de comité (`PanelComite`) para expedientes finales/profesionales.
- Verificaciones ejecutadas: `mvn -pl sgpp-api -am package -DskipTests`, `npm run lint` y `npm run build`.

### 2026-07-19 — Mejoras visuales y UX

- `StatusChip` ahora muestra un tooltip con la descripción del estado cuando existe una definición documentada.
- Dashboard del docente asesor incluye un CTA "Ver practicantes" prominente en el resumen de asesoría.
- Menú lateral migrado de íconos MUI a `lucide-react` en todos los roles (estudiante, admin, secretaría, coordinación/dirección, comité, docente y tutor). Se conservan componentes MUI donde son necesarios (Drawer, Menu, Tooltip).
- Verificaciones ejecutadas: `npm run lint` y `npm run build`.

### 2026-07-19 — Optimización y calidad

- Code-splitting en `App.tsx`: módulos de coordinación, administración, comité, evaluación, tutor y gestión de usuarios/tutores se cargan mediante `React.lazy` y `Suspense`. El chunk inicial se redujo de ~1.9 MB a ~585 KB.
- Agregado `spring-boot-starter-test` a `sgpp-core` y creado `ComponenteEvaluacionServiceImplTest` con 4 casos de prueba (inicialización, registro, cálculo total).
- Creado `docs/GUIA_EJECUCION_LOCAL.md` con las variables de entorno requeridas, pasos de levantamiento y comandos de verificación.
- Verificaciones ejecutadas: `mvn -pl sgpp-api -am test`, `npm run lint` y `npm run build`.

### 2026-07-19 — Evaluación cualitativa configurable

- Agregada columna `tipo_calificacion` (`VIGESIMAL`/`CUALITATIVA`) en `tipo_practica` mediante migración `V57__tipo_calificacion_configurable.sql`; `INICIAL` queda `VIGESIMAL` y `FINAL`/`PROFESIONAL` quedan `CUALITATIVA` según la normativa actual.
- Agregada columna `calificacion_cualitativa` en `evaluacion` mediante migración `V58__calificacion_cualitativa_evaluacion.sql`.
- Actualizado `TipoPractica` y DTOs (`TipoPracticaResponse`, `TipoPracticaRequest`) para exponer `tipoCalificacion`.
- Modificado `EvaluacionServiceImpl` para usar el tipo de calificación del tipo de práctica y soportar la escala `Logrado`/`En proceso`/`No logrado`.
- `ExpedienteResponse` expone `tipoCalificacion` para que el frontend adapte la interfaz sin consultas adicionales.
- Frontend: `EvaluacionTutorExterno` detecta `tipoCalificacion` y muestra una evaluación cualitativa por criterio y un selector de calificación final cuando corresponde; el modo numérico sigue disponible para prácticas `VIGESIMAL`.
- Verificaciones ejecutadas: `mvn -pl sgpp-api -am test`, `npm run lint` y `npm run build`.

### 2026-07-20 — Revisión de sincronización backend/frontend

- Auditados los flujos de autenticación/usuarios, expedientes, plan/documentos/informes, horas, evaluación, comité/dictamen/constancia y administración/reportes.
- Corregido error de compilación en `EvaluacionServiceImpl` (uso de variable `tipoPractica` no declarada).
- Ajustado `EvaluacionServiceImpl.validarEvaluacionEmpresa` para permitir evaluación cualitativa sin exigir puntaje numérico.
- Frontend: `EvaluacionDocenteAsesor` ahora envía `tipoEvaluador`, usa `codigoTipoPractica` para mostrar notas por unidades y acepta decimales en las notas.
- Frontend: `EvaluacionTutorExterno` adapta su payload al modo cualitativo (`tipoCalificacion`, `calificacionCualitativa`).
- Horas: corregido mapeo de `horasAcumuladas` (antes `horasValidadas`) y `validadoPorTutor` (antes `validado`); se evita enviar horas de inicio/fin vacías; se restringe el registro a expedientes en `EN_EJECUCION`; se invalidan las query keys correctas en `useHoras`.
- Roles y rutas: `/admin/usuarios` y `/admin/tutores` ahora permiten los roles autorizados por el backend; agregada ruta `/admin/expedientes/:id`; `ADMINISTRADOR` aparece en `ROLES_DISPONIBLES`.
- Estados: creado `frontend/src/lib/constants.ts` con los códigos exactos del backend; actualizados filtros y KPIs en `DashboardDocente`, `ListaPracticantes`, `GestionExpedientes`, `DashboardCoordinacion` y `PanelComite` para usar `INFORME_PARCIAL_1_PRESENTADO`, `INFORME_PARCIAL_2_PRESENTADO`, `PLAN_EN_REVISION`, `PLAN_EN_REVISION_COMITE`, etc.
- Reportes: corregidas las columnas de `EMPRESAS_RECEPTORAS`, `SEDES_VALIDADAS` y `CONVENIOS_VIGENTES` para coincidir con los DTOs del backend.
- Catálogos empresariales: `useSedes.ts` ahora soporta tanto respuestas envueltas en `ApiResponse.data` como respuestas directas (usadas por `EmpresaController`, `SedePracticaController`, `ConvenioController`).
- UI/UX: corregidos imports faltantes en `AppLayout.tsx`; actualizado `AuthContext.tsx` con `apellidoPaterno`/`apellidoMaterno`; etiqueta de login cambiada a "Usuario".
- Seguridad: alineada validación de contraseña en `ResetPasswordRequest` (8 caracteres, mayúscula, minúscula, número) con el schema del frontend.
- Verificaciones ejecutadas: `mvn -pl sgpp-api -am test` (4 tests), `npm run lint` y `npm run build`.

### 2026-07-20 (continuación) — Unificación del plan, validación de horas tutor, acceso comité y limpieza de endpoints

- Backend: creado `ActualizarPlanRequest` y endpoint `PUT /planes/{id}` para actualizar un plan en borrador; `PlanGeneralServiceImpl` permite editar el contenido del Anexo 1 mientras el estado sea `BORRADOR` u `OBSERVADO`.
- Frontend: `PlanPracticas` ahora guarda el borrador con `actualizar` antes de presentar y subsana observaciones mediante `planesApi.subsanar`; `PanelComite` y `DetalleExpediente` aprueban/observan el plan a través de `planesApi`.
- Frontend: creada la pantalla `ValidacionHorasTutor` (`/tutor/horas/:idExpediente`) con tabla de registros, botones de validación/rechazo y resumen de cumplimiento; agregado acceso desde `DashboardTutor`.
- Backend: agregado `COMITE_PRACTICAS` (y `DIRECTOR` en listados de registros) a los endpoints de lectura de horas (`/horas/cumplimiento`, `/horas/control`, `/horas/registros`, `/horas/registros/{id}/periodo`) para que el comité pueda revisar horas desde `DetalleExpediente`.
- Backend: eliminados endpoints huérfanos de expediente (`PUT /expedientes/{id}/presentar-plan`, `/subsanar`, `/evaluar`, `/cambiar-estado`) y sus DTOs/métodos de servicio asociados. Se conserva `/iniciar-ejecucion` y se conecta en `DetalleExpediente` con diálogo de fecha de inicio y duración en semanas.
- Frontend: `GestionDocumental` migra la presentación del plan de `expedientesApi.presentarPlan` a `planesApi.presentar`; eliminados métodos y hooks huérfanos `presentarPlan`/`evaluar` de `expedientesApi.js` y `useExpedientes.ts`; agregado `useIniciarEjecucion`.
- Frontend: ampliado `frontend/src/lib/constants.ts` con `ESTADOS_PARA_EVALUAR`, `ESTADOS_PARA_DICTAMEN` y `ESTADOS_FINALIZADOS`; refactorizados múltiples componentes para usar las constantes compartidas en lugar de literales dispersos.
- Verificaciones ejecutadas: `mvn -pl sgpp-api -am test` (4 tests), `npm run lint` y `npm run build`.

### 2026-07-20 (continuación) — Notificaciones de plan, literales restantes y unificación visual del estudiante

- Backend: `PlanGeneralServiceImpl` ahora notifica al estudiante cuando su plan es observado, aprobado o rechazado vía `NotificacionEventoService`.
- Frontend: migrados los últimos literales de estado en `DetalleExpediente`, `designTokens.ts`, `DashboardTutor` y `RevisionDocumental` a las constantes compartidas.
- Frontend: refactorizadas `DashboardEstudiante` y `SolicitarPractica` para usar la paleta institucional UNT (amarillo primario / azul secundario), componentes del Design System, dark mode completo y mejor responsive.
- Frontend: actualizados `wow-theme.css` (primary amarillo UNT) y `Button.tsx` (texto oscuro sobre primario, área táctil mínima).
- Verificaciones ejecutadas: `mvn -pl sgpp-api -am test` (4 tests), `npm run lint` y `npm run build`.

### 2026-07-20 (continuación) — Uniformización visual general y mejora de chunking

- Frontend: refactorizadas masivamente las vistas de coordinación, docente/tutor, comité, secretaría/administración, estudiante y componentes compartidos para usar la paleta institucional UNT, el Design System (`@/ui`), variables CSS, modo oscuro y diseño responsive.
- Frontend: convertidas casi todas las rutas protegidas a carga diferida (`React.lazy`), reduciendo el chunk inicial de ~1.2 MB a ~302 KB (gzip ~90 KB).
- Frontend: eliminadas dependencias residuales de MUI en vistas que ya tienen equivalentes en el Design System; se conservan MUI solo donde es indispensable (Drawer, Menu, Modal, Tabs, Stepper, etc.).
- Verificaciones ejecutadas: `mvn -pl sgpp-api -am test` (4 tests), `npm run lint` y `npm run build`.

### 2026-07-20 (continuación) — Corrección de inicio y módulo de configuración administrativa

- Backend: corregido `application.yml` (clave `spring` duplicada en líneas 1 y 42); se unificó el bloque de configuración de correo dentro del único bloque `spring`. La API inicia correctamente y aplica las migraciones pendientes V54–V58.
- Backend: extendido `PlazoService` / `PlazoServiceImpl` y `PlazoController` con CRUD de reglas de plazo (`POST/PUT/GET/DELETE /plazos/reglas`), restringido a `ADMIN_SISTEMA`.
- Backend: creado `ParametroSistemaController` con CRUD de parámetros del sistema (`/parametros-sistema`), restringido a `ADMIN_SISTEMA`.
- Backend: creados `RequisitoAcademicoRepository`, `RequisitoAcademicoDTO`, `RequisitoAcademicoService` y `RequisitoAcademicoController` con CRUD de requisitos académicos por tipo de práctica (`/requisitos-academicos`), restringido a `ADMIN_SISTEMA`.
- Frontend: creado `frontend/src/api/configuracionApi.js` y `frontend/src/hooks/useConfiguracion.ts` para parámetros, reglas de plazo y requisitos académicos.
- Frontend: creada la pantalla `ConfiguracionSistema` (`/admin/configuracion`) con pestañas para administrar parámetros, reglas de plazo y requisitos académicos; agregada al menú lateral del administrador.
- Frontend: actualizadas `App.tsx` (ruta lazy) y `AppLayout.tsx` (enlace en menú admin).
- Verificaciones ejecutadas: `mvn -pl sgpp-api -am package -DskipTests`, `mvn -pl sgpp-api spring-boot:run` (inicio OK), `npm run lint` y `npm run build`.

### 2026-07-20 (continuación) — Cambio manual de estado para administradores

- Backend: creado `CambioEstadoManualRequest` y método `ExpedienteService.cambiarEstadoManual` que valida el estado destino, actualiza el expediente y registra el cambio en el historial con tipo `CAMBIO_MANUAL_ADMIN`.
- Backend: creado endpoint `POST /expedientes/{id}/cambiar-estado-manual` restringido a `ADMIN_SISTEMA` / `ADMINISTRADOR`.
- Frontend: agregado `cambiarEstadoManual` en `expedientesApi.js` y `useCambiarEstadoManual` en `useExpedientes.ts`.
- Frontend: en `GestionExpedientes` se añadió un botón de edición por fila que abre un diálogo para seleccionar el nuevo estado y registrar la observación; utiliza `ESTADOS_EXPEDIENTE` del backend.
- Verificaciones ejecutadas: `mvn -pl sgpp-api -am test` (4 tests), `npm run lint` y `npm run build`.

### 2026-07-20 (continuación) — Corrección de BeanDefinitionStoreException al ejecutar JAR

- Causa: existía un `ParametroSistemaController` en `sgpp-core` (creado en este mismo ciclo) y otro en `sgpp-api`; al empaquetar el JAR ejecutable ambos quedaban en el classpath con el mismo nombre de bean, provocando `ConflictingBeanDefinitionException`.
- Solución: eliminado el controlador duplicado de `sgpp-core`; se conserva el existente en `sgpp-api` (`/parametros`).
- Frontend: actualizada `configuracionApi.js` para consumir `/parametros` y `useConfiguracion.ts` para interpretar la respuesta directa (sin `ApiResponse`).
- Verificaciones ejecutadas: `mvn clean package -DskipTests`, `java -jar sgpp-api/target/sgpp-api-1.0.0.jar` (inicio OK), `npm run lint` y `npm run build`.

### 2026-07-20 (continuación) — Ajustes de contraste en modo claro y oscuro

- Revisados badges y KPIs que usaban `bg-primary-600 text-white` y `bg-amber-500 text-white`; el contraste entre fondo amarillo/ámbar y texto blanco era insuficiente.
- Cambiado el texto de esos elementos a `text-slate-900` (oscuro) manteniendo el fondo institucional amarillo/ámbar; variantes dark también actualizadas a `dark:text-slate-900`.
- Archivos intervenidos: dashboards y gestiones de admin, secretaría, coordinación, comité, docente, tutor y estudiante.
- Verificaciones ejecutadas: `npm run lint` y `npm run build`.

### 2026-07-20 (continuación) — Corrección de vistas en blanco y errores de React en runtime

- Causa: muchos componentes migrados a `React.lazy` no tienen `export default`; usan `export const` o `export function`. `React.lazy` espera `.default`, por lo que en runtime se recibía un objeto y se producía `TypeError: Cannot convert object to primitive value`, dejando la vista en blanco.
- Solución: en `App.tsx` se reemplazó `React.lazy(...)` por un helper `lazyNamed` que primero intenta `m.default` y, si no existe, usa el export con nombre (`m[exportName]`). Esto soporta ambos patrones sin modificar cada página.
- También se corrigió la advertencia de clave duplicada en `AppLayout`: el menú de estudiante tenía dos ítems (`Centros de Práctica` y `Empresas Receptoras`) con el mismo `path`; la `key` del `NavItem` ahora combina grupo, índice y path.
- Verificaciones ejecutadas: `npm run lint` y `npm run build`.

### 2026-07-20 (continuación) — Eliminación de menú duplicado del estudiante

- Problema reportado: al seleccionar `Centros de Práctica` o `Empresas Receptoras` en el menú del estudiante, ambos ítems se resaltaban como activos porque compartían el mismo `path` (`/estudiante/sedes`).
- Decisión del usuario: dado que ambas vistas mostraban el mismo catálogo, se eliminó el ítem `Empresas Receptoras` del menú del estudiante.
- Cambios:
  - Se eliminó `Empresas Receptoras` del grupo `Institucional` en `AppLayout.tsx`, dejando solo `Centros de Práctica`.
  - Se eliminó la ruta huérfana `/estudiante/empresas` de `App.tsx`.
  - Se revirtió el título dinámico en `CatalogoSedes.tsx` para mantener el título fijo "Catálogo de empresas y sedes".
- Verificaciones ejecutadas: `npm run lint` y `npm run build`.

### 2026-07-20 (continuación) — Corrección de fondo de modales

- Problema reportado: los modales del Design System aparecían con fondo transparente y borroso (`backdrop-blur-sm` sobre `bg-slate-900/50`), dificultando la lectura del contenido detrás y del propio modal.
- Solución: en `frontend/src/ui/Dialog.tsx` se cambió el backdrop a `bg-black/70` y se eliminó el desenfoque (`backdrop-blur-sm`).
- Segundo problema reportado: el contenido de los modales seguía transparente mientras que el header no. Causa: la clase `bg-card` usaba `hsl(var(--card))`, pero la variable CSS `--card` no estaba definida en el tema (solo existía `--color-card`).
- Solución: en `frontend/src/ui/Dialog.tsx` se reemplazó `bg-card` por `bg-[var(--color-card)]` en `DialogContent` y `border-border` por `border-[var(--color-border)]` en `DialogHeader` y `DialogFooter`.
- Verificaciones ejecutadas: `npm run lint` y `npm run build`.

### 2026-07-20 (continuación) — Corrección de tema CSS y variables de Tailwind

- Problema reportado: inconsistencias visuales en `/coordinacion/expedientes/:id` y otras vistas.
- Causa de raíz: `tailwind.config.js` definía los colores del sistema usando `hsl(var(--nombre))` (por ejemplo `hsl(var(--card))`), pero en `wow-theme.css` las variables se llamaban `--color-*` y usaban valores hex. Esto hacía que clases como `bg-card`, `bg-background`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `border-border`, etc. no aplicaran color, provocando fondos transparentes y textos con contraste incorrecto en componentes del Design System como `Tabs`, `Dialog`, `Badge` y cualquier otro que usara estas clases.
- Solución:
  - En `frontend/src/assets/wow-theme.css` se agregaron las variables faltantes: `--color-primary`, `--color-primary-foreground`, `--color-secondary`, `--color-secondary-foreground`, `--color-destructive`, `--color-destructive-foreground`, `--color-accent`, `--color-accent-foreground` y `--color-radius`, tanto para el tema claro como para el oscuro.
  - En `frontend/tailwind.config.js` se reemplazaron las definiciones `hsl(var(--...))` por `var(--color-...)` para todos los colores del sistema, de forma que apunten a las variables CSS reales.
  - En `frontend/src/ui/Dialog.tsx` se volvió a usar `bg-card` y `border-border` (ahora funcionan correctamente) en lugar de los valores explícitos de variable.
- Impacto: todas las vistas que usan `bg-card`, `bg-background`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`, etc. ahora renderizan con los colores del tema correctamente, incluyendo `/coordinacion/expedientes/:id`.
- Verificaciones ejecutadas: `npm run lint` y `npm run build`.

### 2026-07-20 (continuación) — Notificaciones tipo toast, doble validación y tooltips

- Se creó `frontend/src/lib/toast.ts` con helpers `showSuccess`, `showError`, `showWarning`, `showInfo`, `showLoading` y `closeLoading`, usando SweetAlert2 en modo `toast` con posición `top-end`, sin botón de confirmar y con timer (mismo estilo que el de `Solicitar Práctica`).
- Se reemplazaron las notificaciones de éxito/error en los módulos principales para que usen el helper de toast:
  - `Recepción Administrativa` (validar, asignar asesor, registrar incidencia).
  - `Validar Requisitos` (carga, validación, edición).
  - `Gestión de Sedes`, `Gestión de Empresas`, `Gestión de Convenios` (CRUD, validaciones, deshabilitar).
  - `Evaluación Tutor Externo`, `Evaluación Docente Asesor`, `Evaluación Componentes Anexo 4`.
  - `Validación de Horas Tutor`.
  - `Revisión Documental`.
  - `Catálogo de Sedes`.
  - Las confirmaciones (sí/no) y diálogos con input se mantuvieron con `Swal.fire` nativo.
- Se eliminó la doble validación en `Recepción Administrativa`: al hacer clic en `Validar y Marcar Listo para Carta` dentro del diálogo de checklist ya no se muestra un segundo diálogo de confirmación; directamente se ejecuta la validación con un toast de éxito.
- Se corrigió el bug de tooltips que se quedaban visibles después de quitar el hover: el componente `Tooltip` del Design System (`frontend/src/ui/Tooltip.tsx`) fue reemplazado por un wrapper de `MuiTooltip` que maneja correctamente el posicionamiento, portal, delays y cierre al perder el hover.
- Verificaciones ejecutadas: `npm run lint` y `npm run build`.

### 2026-07-20 (continuación) — Tokens semánticos registrados en `@theme` de Tailwind v4

- Problema reportado: persistían inconsistencias visuales en `/coordinacion/expedientes/:id` y otras vistas; clases como `bg-muted`, `bg-card`, `bg-background`, `text-foreground`, `text-muted-foreground` y `border-border` no generaban utilidades correctamente.
- Causa de raíz: en Tailwind CSS v4.3.3, el bloque `@theme` es el registro principal de tokens para la generación de utilidades. Los tokens semánticos (`--color-muted`, `--color-card`, `--color-background`, `--color-foreground`, `--color-border`, `--color-primary`, etc.) solo existían en `@layer base { :root {} }`, no en `@theme`. Aunque `@config` carga `tailwind.config.js` para retrocompatibilidad, Tailwind v4 puede no generar todas las utilidades si los tokens no están en `@theme`.
- Solución: se agregaron todos los tokens semánticos de color al bloque `@theme` en `frontend/src/assets/wow-theme.css` con sus valores hex en modo claro (light mode defaults). El bloque `@layer base { :root {} }` y `.dark {}` continúan operando para el switching dinámico en runtime. Tailwind v4 ahora genera todas las utilidades de color correctamente (`bg-muted`, `bg-card`, `bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`, etc.).
- Tokens agregados a `@theme`: `--color-background`, `--color-foreground`, `--color-card`, `--color-card-foreground`, `--color-border`, `--color-muted`, `--color-muted-foreground`, `--color-input`, `--color-ring`, `--color-primary`, `--color-primary-foreground`, `--color-secondary`, `--color-secondary-foreground`, `--color-destructive`, `--color-destructive-foreground`, `--color-accent`, `--color-accent-foreground`, `--radius`.
- Verificaciones ejecutadas: `npm run lint` y `npm run build` sin errores.

### 2026-07-20 (continuación) — Corrección de Tabs: contenido visible y cambio de pestañas

- Problema reportado: los tabs de Resumen General, Documentos y Observaciones, Monitoreo y Horas, Trazabilidad y Cierre no funcionaban — al hacer clic no cambiaba el contenido.
- Causa raíz: el componente `Tabs` era un simple contenedor `<div>` sin lógica de estado. Los `TabsContent` se renderizaban todos simultáneamente y no existía mecanismo para ocultar/mostrar el panel activo.
- Solución: se reescribió `frontend/src/ui/Tabs.tsx` con React Context:
  - `Tabs` provee un `TabsContext` con el `value` actual y el handler `onValueChange`.
  - `TabsTrigger` lee el contexto para determinar si está activo, aplica `data-state="active"|"inactive"`, y llama a `onValueChange` al hacer clic.
  - `TabsContent` se renderiza condicionalmente: solo se muestra si su `value` coincide con el `value` del contexto.
  - Soporta modo controlado (`value`+`onValueChange`) y no controlado (`defaultValue`).
- En `DetalleExpediente.tsx` se simplificó: se eliminó el state `tabValue` manual, se usa `defaultValue={tabs[0]}`, y el estilo activo se aplica via selectores `data-[state=active]`.
- Las 3 páginas que usaban modo controlado (`EvaluacionDocenteAsesor`, `GestionDocumental`, `ConfiguracionSistema`) continúan funcionando correctamente.
- Verificaciones ejecutadas: `npm run lint` y `npm run build` sin errores.

## Pendientes Técnicos Conocidos

- **ESLint para .ts/.tsx**: `typescript-eslint` no soporta TypeScript 7.0. Pendiente soporte TS >= 7.1.
- **Tests**: solo 1 test unitario en backend; 0 tests en frontend.
- **Colores hex restantes**: archivos secundarios todavía usan hex hardcoded; se continuará migración a `COLORS`.

### 2026-07-21 — Correcciones de seguridad y limpieza

- **Backend - Seguridad:**
  - Eliminado `NotificacionDTO` duplicado en `sgpp-api` (package declaration incorrecto).
  - CORS restringido en `SecurityConfig`: de `*` a orígenes específicos (localhost:5173, 8082, 3000, 80, 8080).
  - Path traversal corregido en `ExportacionController.descargarPorId()`: validación de ruta dentro del directorio seguro exportado desde `ExportacionProperties`.
  - Endpoint `DELETE /expedientes/{id}/disable` ahora requiere roles `ADMIN_SISTEMA`, `ADMINISTRADOR`, `COORDINADOR` o `DIRECTOR` (antes era accesible por cualquier rol autenticado).
  - Token de recuperación de contraseña ya no se loguea en plaintext (`log.info` → `log.debug` sin exponer token).
  - JWT secret ya no tiene fallback hardcoded: requiere env var `JWT_SECRET` en todos los perfiles.
- **Backend - Limpieza:**
  - Eliminados archivos huérfanos: `*.log`, `uploads/`, `pom.xml.old`, 8 scripts SQL de diagnóstico, `package-lock.json` raíz, `start-*.bat`, `cp.txt`, `insert_criterios.sql`.
  - `.gitignore` actualizado con patrones para uploads, data, scripts SQL y artifacts.
- **Backend - Configuración:**
  - `flyway.validate-on-migrate: true` y `out-of-order: false` en `application-local.yml`.
  - Paths relativos para uploads/exportaciones (usar `${user.home}/sgpp/` en vez de rutas absolutas Windows).
  - `.env.example` y `frontend/.env.example` actualizados: puertos alineados (5434, 8082, 5173).
- **Frontend - Dependencias:**
  - `@tanstack/react-query` movido de `devDependencies` a `dependencies` (runtime dependency).
  - `@tanstack/react-query-devtools` movido de `dependencies` a `devDependencies`.
  - `@fontsource/roboto` eliminado (nunca importado).
- **Frontend - Estructura:**
  - `index.css` legacy eliminado (sintaxis `@tailwind` obsoleta; `wow-theme.css` es la fuente activa).
  - `ErrorBoundary` creado y envuelve `Suspense` en `App.tsx` para capturar errores de chunks lazy.
  - Constantes `COLORS` agregadas a `frontend/src/lib/constants.ts` con colores institucionales UNT y del sistema.
  - Colores hex hardcoded reemplazados en archivos principales: GestionConvenios, GestionEmpresas, GestionSedes, DashboardCoordinacion.
- **Verificaciones:**
  - `mvn -pl sgpp-api -am compile -DskipTests` exitoso.
  - `npm run lint` y `npm run build` exitosos.

### 2026-07-21 (continuación) — Completitud funcional y correcciones de negocio

- **DashboardEstudiante:** corregido `INFORME_FINAL_APROBADO` (inexistente en backend) → `INFORME_APROBADO`; agregados estados `EVALUACION_PENDIENTE`, `EVALUACION_COMPLETA`, `INFORME_EN_REVISION` al STATUS_MAP.
- **constants.ts:** agregado `EVALUACION_PENDIENTE` a `ESTADOS_EXPEDIENTE` (faltaba; se usaba como string literal).
- **Página de evaluación del estudiante:** creado `EvaluacionEstudiante.tsx` reemplazando `PaginaEnConstruccion` en `/estudiante/evaluacion`. Muestra calificación final, notas por unidad (iniciales), evaluaciones registradas y desglose Anexo 4 (finales/profesionales). Hooks backend ya existían (`useNotasUnidad`, `useEvaluacionesPorExpediente`).
- **Protección de ruta:** `/estudiante/evaluacion` ahora tiene `<ProtectedRoute allowedRoles={['ESTUDIANTE']}>` (antes no tenía).
- **Menú lateral estudiante:** agregada entrada "Mis Evaluaciones" con ícono `Award`.
- **Bloqueo informe final (INICIAL):** informe final ahora se bloquea si falta informe parcial 2 (antes solo se bloqueaba parcial 2 si faltaba parcial 1).
- **Resubida de informe observado:** se agregó botón "Re-enviar" en `InformesPeriodicos` cuando un informe tiene archivo pero está en revisión/observado.
- **Calificación en MiPractica:** se agrega KPI de calificación final usando `useMisExpedientes` (campo `calificacionFinal` del expediente).
- **Migración de colores hex:** corregidos colores hardcoded en `ValidarRequisitos.tsx` (~40 reemplazos), `RecepcionAdministrativa.tsx` (~8), `SolicitarPractica.tsx` (~2), `InformesPeriodicos.tsx` (~1).
- **Limpieza:** eliminados `UNUSED_V35` y `UNUSED_V38` de Flyway; eliminado `frontend/README.md` (default Vite).
- **Verificaciones:** `mvn -pl sgpp-api -am package -DskipTests` exitoso; `npm run lint` y `npm run build` exitosos.
