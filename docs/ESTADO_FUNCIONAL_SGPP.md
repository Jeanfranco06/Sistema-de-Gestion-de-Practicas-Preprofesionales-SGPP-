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

## Pendientes Técnicos Conocidos

- Evaluación cualitativa configurable como alternativa a la evaluación numérica.
- Refinar chunking adicional del frontend para reducir más el bundle principal.
- Ajustar reglas configurables de plazos y requisitos académicos según evolución normativa.
- Análisis exhaustivo del sistema realizado el 2026-07-19: ver `docs/ANALISIS_SISTEMA_SGPP.md`. Los hallazgos principales incluyen: scheduler automático, notificaciones SMTP, examen de aplazados, notas por unidades, plantilla de informe final, migración de evaluación a Anexo 4, mejoras visuales e íconos lucide-react implementados.
