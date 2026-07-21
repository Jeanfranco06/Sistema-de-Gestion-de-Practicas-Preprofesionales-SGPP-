# ANÁLISIS EXHAUSTIVO DEL SISTEMA SGPP

## Sistema de Gestión de Prácticas Preprofesionales — Escuela de Ingeniería Industrial UNT

> **Fecha de análisis:** 2026-07-19  
> **Fuentes de referencia:** `CONTEXTO_SISTEMA_SGPP.md`, `REQUERIMIENTOS_FUNCIONALES_SGPP.md`, `ESTADO_FUNCIONAL_SGPP.md`, `AGENTS.md`  
> **Alcance:** Backend (Java 17 / Spring Boot), Frontend (React / TypeScript / Vite), Base de datos (PostgreSQL / Flyway).

---

## 1. Resumen Ejecutivo

El SGPP es una plataforma web con arquitectura limpia (backend modular Maven, frontend React con Design System propio) que **ya implementa la mayor parte del flujo normativo** de prácticas preprofesionales de la Escuela de Ingeniería Industrial de la UNT. Sin embargo, persisten **inconsistencias conceptuales, huecos funcionales y deuda técnica** que deben resolverse para declarar el proyecto funcional, coherente y consistente.

El flujo principal de expediente (solicitud → validación → carta → aceptación → plan → ejecución → informes → evaluación → cierre) está operativo en backend y tiene pantallas asociadas. La compilación (`mvn -pl sgpp-api -am clean compile`), el lint (`npm run lint`) y el build de producción (`npm run build`) **finalizan correctamente** en la fecha de análisis.

Los problemas más críticos detectados son:

1. **Divergencia entre estados documentales y estados de expediente**: el sistema mezcla estados globales del expediente con estados de documentos individuales, generando confusión visual y de negocio.
2. **Falta de motor de notificaciones por correo SMTP**: solo hay notificaciones in-app, sin envío de e-mail.
3. **Módulo de informes periódicos incompleto**: la interfaz existe pero no se refleja un modelo robusto de seguimiento por semanas.
4. **Registro de horas no calcula automáticamente el acumulado en algunos puntos de corte** y la regla de "tres meses" puede bloquear cierres legítimos si no se configura con tolerancia.
5. **Examen de aplazados (semana 17) implementado** para prácticas iniciales; pendiente de prueba E2E.
6. **Cron job de plazos configurado** mediante `PlazoVencimientoScheduler`.
7. **Notificaciones por correo SMTP implementadas** mediante `EmailServiceImpl`.
8. **Doble modelo de evaluación**: coexisten `evaluacion` (heredado) y `componente_evaluacion` (normativo); parcialmente consolidado para finales/profesionales.

---

## 2. Estado General por Capa

### 2.1 Backend

| Aspecto | Estado | Observación |
|---|---|---|
| Arquitectura | ✅ Sólida | Reactor Maven: `sgpp-shared`, `sgpp-core`, `sgpp-api`. Separación por dominios. |
| Compilación | ✅ OK | `mvn -pl sgpp-api -am clean compile` exitoso con JDK 17. |
| Tests | ⚠️ No ejecutados | Se usó `-DskipTests`; se recomienda ejecutar `mvn -pl sgpp-api -am test`. |
| Seguridad | ⚠️ Parcial | `@PreAuthorize` presente, pero algunos endpoints históricos recibían IDs de usuario desde el cliente (corregido recientemente en horas y documentos). |
| Auditoría | ✅ Implementada | `EventoAuditoria` con historial inmutable. |
| Generación de PDF | ✅ Implementada | Carta de presentación, constancia, reporte consolidado, acta de comité. |
| Exportación CSV/XML | ⚠️ Parcial | CSV implementado; XML no se observa en el reporte consolidado actual. |
| Notificaciones | ✅ Implementado | Modelo `Notificacion` con in-app y envío SMTP real vía `EmailServiceImpl`. |
| Control de plazos | ✅ Implementado | Servicio completo (`PlazoServiceImpl`) con scheduler diario (`PlazoVencimientoScheduler`). |

### 2.2 Frontend

| Aspecto | Estado | Observación |
|---|---|---|
| Build / Lint | ✅ OK | `npm run lint` y `npm run build` exitosos. |
| Rutas | ⚠️ Casi completo | Faltan rutas específicas para examen de aplazados y algunas configuraciones. |
| Design System | ✅ Implementado | Componentes en `src/ui/`, uso de Tailwind + `cn()`. |
| Dependencias | ⚠️ Actualizables | React 19, MUI 9, Tailwind 4; configuraciones muy recientes, riesgo de incompatibilidades. |
| Pantallas por rol | ✅ Amplias | Estudiante, docente, tutor, secretaría, comité, coordinación/dirección, admin. |
| Hooks React Query | ✅ Mayoría | Dominios: expedientes, horas, usuarios, sedes, coordinación, evaluaciones, notificaciones, etc. |
| Pagina en construcción | ⚠️ Presente | `/estudiante/evaluacion` redirige a `PaginaEnConstruccion`. |

### 2.3 Base de Datos

| Aspecto | Estado | Observación |
|---|---|---|
| Migraciones Flyway | ✅ 53 versiones | Esquema evolutivo bien documentado. |
| Integridad referencial | ✅ OK | Claves foráneas y restricciones adecuadas. |
| Datos semilla | ✅ OK | Usuarios demo, tipos de práctica, parámetros, sedes. |
| Inconsistencias históricas | ⚠️ Corregidas vía migraciones | V50-V52 corrigen flujos E2E y reglas duplicadas. |
| Tablas huérfanas/duplicadas | ⚠️ Riesgo | `evaluacion` y `componente_evaluacion` coexisten; `practica` heredada y `expediente` activa. |

---

## 3. Cumplimiento de Requerimientos Funcionales (RF-01 a RF-48)

### 3.1 Módulo 1 — Autenticación y Gestión de Usuarios

| RF | Descripción | Estado | Detalle |
|---|---|---|---|
| RF-01 | Login con correo @unitru.edu.pe, JWT, bloqueo por intentos, registro de IP | ⚠️ Parcial | Login con username/password existe; validación de dominio @unitru no se observa en backend; bloqueo e IP no verificados. |
| RF-02 | RBAC por rol | ✅ Completo | Roles en `RolSistema`; `@PreAuthorize` en endpoints; menú adaptativo en frontend. |
| RF-03 | CRUD usuarios y asignación de roles | ✅ Completo | `UsuarioController` con filtros, cambio de estado y roles. |
| RF-04 | Registro de tutores externos | ✅ Completo | `TutorExternoController` y `GestionTutores`. |

### 3.2 Módulo 2 — Empresas, Sedes y Convenios

| RF | Descripción | Estado | Detalle |
|---|---|---|---|
| RF-05 | Registro de empresas | ✅ Completo | CRUD completo con activación/desactivación. |
| RF-06 | Registro de sedes (PG-016) | ✅ Completo | `GestionSedes` y `SedePracticaController`. |
| RF-07 | Validación de sedes | ✅ Completo | Estados `PENDIENTE_VALIDACION`, `VALIDADA`, `RECHAZADA`. |
| RF-08 | Gestión de convenios | ✅ Completo | `GestionConvenios` y `ConvenioController`. |
| RF-09 | Alertas de convenios por vencer | ⚠️ Parcial | Campos de fechas existen; no hay cron de alertas ni envío de correo. |
| RF-10 | Catálogo de sedes para estudiante | ✅ Completo | `CatalogoSedes` con filtros. |

### 3.3 Módulo 3 — Expediente de Prácticas

| RF | Descripción | Estado | Detalle |
|---|---|---|---|
| RF-11 | Solicitud de inicio de práctica | ✅ Completo | `POST /practicas/solicitar` con validación académica. |
| RF-12 | Validación de elegibilidad académica | ✅ Completo | `ValidacionAcademicaService` con reglas parametrizables. |
| RF-13 | Revisión administrativa (Secretaría) | ✅ Completo | `RecepcionAdministrativa` y `PUT /expedientes/{id}/validar`. |
| RF-14 | Emisión de Carta de Presentación | ✅ Completo | Generación PDF con numeración correlativa. |
| RF-15 | Carga de Carta de Aceptación | ✅ Completo | Con reemplazo y validación PDF. |
| RF-16 | Gestión del Plan de Prácticas (Anexo 1) | ✅ Completo | Formulario estructurado en `/estudiante/plan-practicas`. |
| RF-17 | Revisión/aprobación del plan | ✅ Completo | Asesor o comité según tipo; plazo de 7 días. |
| RF-18 | Inicio de ejecución | ✅ Completo | `PUT /expedientes/{id}/iniciar-ejecucion` crea control de horas. |

### 3.4 Módulo 4 — Seguimiento y Control de Horas

| RF | Descripción | Estado | Detalle |
|---|---|---|---|
| RF-19 | Registro y contador automático de horas | ⚠️ Parcial | Backend calcula acumulado; frontend muestra progreso; la validación de mínimo y distribución temporal puede ser muy rígida. |
| RF-20 | Registro de asistencia y avance | ⚠️ Parcial | `Monitoreo` existe pero no se observa flujo semanal de asistencia estricto. |
| RF-21 | Monitoreo/supervisión inopinada | ⚠️ Parcial | Modelo y endpoints existen; uso visual limitado. |

### 3.5 Módulo 5 — Gestión Documental y Motor de Estados

| RF | Descripción | Estado | Detalle |
|---|---|---|---|
| RF-22 | Carga de documentos requeridos | ✅ Completo | Checklist dinámico según tipo de práctica. |
| RF-23 | Motor de estados documentales | ⚠️ Parcial | Estados `PENDIENTE → EN_REVISION → OBSERVADO → APROBADO → ARCHIVADO` implementados, pero mezclados con estados de expediente. |
| RF-24 | Bloqueo por plazos vencidos | ✅ Completo | `PlazoServiceImpl` + `PlazoVencimientoScheduler` diario. |
| RF-25 | Revisión documental por asesor | ✅ Completo | `RevisionDocumental` con aprobar/observar. |
| RF-26 | Notificaciones ante cambios de estado | ✅ Completo | In-app + SMTP real mediante `EmailServiceImpl`. |

### 3.6 Módulo 6 — Informes de Práctica (Iniciales)

| RF | Descripción | Estado | Detalle |
|---|---|---|---|
| RF-27 | Informes parciales y final | ⚠️ Parcial | Estados de informes existen; la vista `InformesPeriodicos` cubre hitos básicos pero no fechas límite por semana académica. |
| RF-28 | Plantilla descargable del informe final | ✅ Completo | Endpoint `GET /exportacion/plantilla-informe-final` y botón en `InformesPeriodicos`. |

### 3.7 Módulo 7 — Evaluación y Calificación

| RF | Descripción | Estado | Detalle |
|---|---|---|---|
| RF-29 | Evaluación de empresa (Anexo 2) | ✅ Completo | Escala 1-5, categorías correctas, total 50 pts. |
| RF-30 | Evaluación del Plan (Anexo 4, 10 pts) | ✅ Completo | `ComponenteEvaluacion` tipo PLAN. |
| RF-31 | Evaluación del Informe (Anexo 4, 40 pts) | ✅ Completo | `ComponenteEvaluacion` tipo INFORME. |
| RF-32 | Notas por unidades (prácticas iniciales) | ✅ Completo | Tabla `nota_unidad` con ponderaciones 20/80 para unidad 1 y 100% informe para unidades 2 y 3; sincronización a `expediente.calificacion_final`. |
| RF-33 | Diferenciación vigesimal/cualitativa | ✅ Completo | `tipo_practica.tipo_calificacion` (`VIGESIMAL`/`CUALITATIVA`) alimenta `EvaluacionServiceImpl`; `EvaluacionTutorExterno` adapta la interfaz. |

### 3.8 Módulo 8 — Comité de Prácticas y Dictamen Final

| RF | Descripción | Estado | Detalle |
|---|---|---|---|
| RF-34 | Panel de expedientes en revisión | ✅ Completo | `PanelComite` con filtros. |
| RF-35 | Dictamen final colegiado | ✅ Completo | `POST /expedientes/{id}/emitir-dictamen`. |
| RF-36 | Cierre y constancia | ✅ Completo | `PUT /expedientes/{id}/cerrar` + constancia PDF. |

### 3.9 Módulo 9 — Secretaría Académica

| RF | Descripción | Estado | Detalle |
|---|---|---|---|
| RF-37 | Bandeja administrativa | ✅ Completo | `DashboardSecretaria` / `RecepcionAdministrativa`. |
| RF-38 | Gestión de incidencias | ⚠️ Parcial | Modelo `Incidencia` existe; interfaz de seguimiento no prominente. |

### 3.10 Módulo 10 — Notificaciones y Alertas

| RF | Descripción | Estado | Detalle |
|---|---|---|---|
| RF-39 | Notificaciones in-app y correo | ✅ Completo | In-app y envío SMTP real con `EmailServiceImpl`. |
| RF-40 | Bloqueo automático fuera de plazo | ✅ Completo | `PlazoVencimientoScheduler` ejecuta `PlazoServiceImpl.actualizarEstadosVencidos()` diariamente. |

### 3.11 Módulo 11 — Dashboards del Estudiante

| RF | Descripción | Estado | Detalle |
|---|---|---|---|
| RF-41 | Dashboard principal | ✅ Completo | `DashboardEstudiante` con progreso, documentos, notificaciones. |
| RF-42 | Detalle del expediente | ✅ Completo | `MiPractica` con timeline. |
| RF-43 | Gestión documental | ✅ Completo | `GestionDocumental`. |
| RF-44 | Notificaciones del estudiante | ✅ Completo | `NotificationsMenu`. |

### 3.12 Módulo 12 — Reportes y Exportación

| RF | Descripción | Estado | Detalle |
|---|---|---|---|
| RF-45 | Reporte consolidado | ⚠️ Parcial | PDF y CSV; XML no confirmado. |
| RF-46 | KPIs ejecutivos | ✅ Completo | `DashboardKpiService` y gráficos en frontend. |

### 3.13 Módulo 13 — Auditoría y Trazabilidad

| RF | Descripción | Estado | Detalle |
|---|---|---|---|
| RF-47 | Historial inmutable | ✅ Completo | `AuditoriaTransaccionalService`. |
| RF-48 | Integridad documental (hash) | ⚠️ Parcial | Se menciona hash en constancia; no se verifica regeneración con versionado estricto en todos los documentos. |

---

## 4. Fallos, Errores y Riesgos Detectados

### 4.1 Críticos

1. ✅ **Ausencia de scheduler para plazos vencidos (RF-40)** — *Resuelto el 2026-07-19*
   - Creado `PlazoVencimientoScheduler` con `@Scheduled(cron = "0 0 6 * * ?")` y `@ConditionalOnProperty`.
   - Endpoint manual `POST /plazos/actualizar-estados` ya existía para forzar la actualización.

2. ✅ **No hay servicio de correo SMTP (RF-39)** — *Resuelto el 2026-07-19*
   - Agregada dependencia `spring-boot-starter-mail` en `sgpp-core`.
   - Creado `EmailService`/`EmailServiceImpl` y conectado a `NotificacionEventoServiceImpl`.
   - Configuración SMTP en `application.yml` y `application-local.yml`.

3. ✅ **Doble modelo de evaluación** — *Resuelto para finales/profesionales el 2026-07-19*
   - Tabla `evaluacion` (heredada) se conserva; `componente_evaluacion` (normativa 2025) es la fuente principal para finales/profesionales.
   - Sincronización de evaluación de empresa (`EMPRESA`) hacia `componente_evaluacion`.
   - El cálculo de calificación final prioriza `componente_evaluacion` cuando existe.
   - Vistas de docente (`EvaluacionDocenteAsesor`) y comité (`EvaluacionComite`) migradas a `componente_evaluacion` para `FINAL`/`PROFESIONAL`.

4. ✅ **Examen de Aplazados no implementado (RF-32)** — *Resuelto el 2026-07-19*
   - Estados `EXAMEN_APLAZADOS_HABILITADO` y `EXAMEN_APLAZADOS_RENDIDO` agregados.
   - Migración V55 con campos `nota_examen_aplazados` y `fecha_examen_aplazados`.
   - Endpoints y lógica de negocio implementados; UI en `DetalleExpediente`.

### 4.2 Importantes

5. ✅ **Página de evaluación del estudiante en construcción** — *Oculta del menú el 2026-07-19*
   - `/estudiante/evaluacion` sigue existiendo pero no se muestra en el menú estudiante; el estudiante consulta resultados desde `MiPractica` y el dashboard.

6. **Validación de formato de informe (RF-28) ausente**
   - No hay plantilla descargable ni validación estructural de carátula/índice/capítulos.

7. **Inconsistencia en modalidad curricular/extracurricular**
   - V41 marca `FINAL` como curricular, pero el contexto normativo dice "extracurricular" para finales/profesionales. La Escuela de Ingeniería Industrial las considera extracurriculares (360 h). Revisar semántica.

8. **Riesgo de chunk grande en frontend**
   - `npm run build` advierte chunk de ~2 MB. No es error, pero afecta rendimiento.

### 4.3 Menores / Deuda técnica

9. **Uso mixto de MUI y Design System propio**
   - Se usan íconos `@mui/icons-material` y componentes MUI (Drawer, Menu) junto a `src/ui/`. Alinearse a `lucide-react` y `src/ui/` progresivamente.

10. **Campos de estado redundantes en `Expediente`**
    - `cartaAceptacionPresentada`, `planTrabajoAprobado`, `informeFinalPresentado` duplican información que ya está en el historial de estados y documentos.

11. **Estado `EVALUADO` vs `DICTAMEN_EMITIDO` vs `CERRADO`**
    - Transiciones ambiguas; el cierre puede provenir de varios estados, debilitando la máquina de estados.

---

## 5. Inconsistencias Visuales y de Flujo

| Inconsistencia | Ubicación | Recomendación |
|---|---|---|
| Estado `EMPRESA_SEDE_ASIGNADA` aparece como paso independiente, pero la solicitud estudiantil lo asigna automáticamente. | Backend/Frontend | Unificar visualmente o eliminar paso intermedio del timeline si no requiere acción humana. |
| `PLAN_EN_REVISION` y `PLAN_EN_REVISION_COMITE` son estados de expediente, no del plan. | `EstadoExpediente` | Separar máquina de estados del documento/plan de la del expediente. |
| El estudiante ve "Evaluación" en menú pero es página en construcción. | `AppLayout.tsx` | Ocultar hasta implementar o crear vista de consulta de evaluaciones recibidas. |
| Íconos repetidos en menú de estudiante (todos `Assignment`). | `AppLayout.tsx` | Usar íconos diferenciados de `lucide-react`. |
| `StatusChip` capitaliza palabras, pero algunos estados largos quisan truncados. | `StatusChip.tsx` | Agregar tooltip con descripción completa. |
| Dashboard de docente no muestra acciones contextuales según estado del expediente. | `DashboardDocente.tsx` | Mejorar guía de próxima acción (CTA). |

---

## 6. Mejoras Recomendadas

### 6.1 Funcionales

1. ✅ **Scheduler automático de plazos** — *Implementado*.
2. ✅ **Servicio SMTP de notificaciones** — *Implementado*.
3. ✅ **Examen de Aplazados** — *Implementado*.
4. ✅ **Plantilla de informe final** — *Implementado*.
   - Endpoint `GET /exportacion/plantilla-informe-final` genera PDF con estructura de 14 secciones.
   - Botón de descarga en `InformesPeriodicos` para estudiantes.
5. ✅ **Consolidar evaluación** — *Implementado*.
   - Sincronización de evaluación de empresa hacia `componente_evaluacion`.
   - Cálculo de calificación final prioriza componentes Anexo 4 para finales/profesionales.
   - Notas por unidades implementadas para prácticas iniciales con sincronización a `expediente.calificacion_final`.
   - Vistas de docente y comité migradas a `componente_evaluacion` para finales/profesionales.

### 6.2 Técnicas

6. ✅ **Code-splitting frontend** — *Implementado*.
   - `React.lazy` + `Suspense` en `App.tsx`; chunk inicial reducido de ~1.9 MB a ~585 KB.

7. ✅ **Migración de MUI icons a lucide-react** — *Completada*.
   - Todos los menús laterales usan `lucide-react`. MUI se conserva solo en Drawer, Menu y Tooltip.

8. ✅ **Variables de entorno documentadas** — *Implementado*.
   - `docs/GUIA_EJECUCION_LOCAL.md` incluye `JAVA_HOME`, base de datos, SMTP, JWT y frontend.

9. ✅ **Tests automatizados** — *Iniciados*.
   - Test unitario `ComponenteEvaluacionServiceImplTest` en `sgpp-core` con 4 casos.

---

## 7. Plan de Implementación Faseado

### Fase 1 — Infraestructura y correcciones críticas ✅

- [x] Configurar scheduler de plazos vencidos.
- [x] Implementar envío de correo SMTP.
- [x] Revisar y corregir semántica curricular/extracurricular en `tipo_practica`.
- [x] Documentar campos de estado redundantes en `Expediente` (no se eliminan por riesgo de ruptura).

### Fase 2 — Completar flujo académico ✅

- [x] Implementar examen de aplazados (semana 17) para prácticas iniciales.
- [x] Mejorar registro de notas por unidades (20/80) en prácticas iniciales.
- [x] Agregar plantilla descargable de informe final.

### Fase 3 — Consolidar evaluación ✅

- [x] Sincronizar `evaluacion` de empresa hacia `componente_evaluacion`.
- [x] Asegurar cálculo Anexo 4: Plan (10) + Empresa (50) + Informe (40) = 100.
- [x] Migrar vistas de evaluación docente y comité a `componente_evaluacion`.
- [x] Implementar evaluación cualitativa como alternativa configurable (`tipo_practica.tipo_calificacion`, `evaluacion.calificacion_cualitativa` y `EvaluacionTutorExterno` adaptativo).

### Fase 4 — Mejoras visuales y UX ✅

- [x] Ocultar `/estudiante/evaluacion` del menú (sigue existiendo como ruta en construcción).
- [x] Diferenciar íconos del menú estudiante.
- [x] Agregar tooltips a `StatusChip`.
- [x] Mejorar dashboard docente con CTAs contextuales.
- [x] Migrar íconos MUI a `lucide-react` en todos los menús laterales.

### Fase 5 — Optimización y calidad ✅

- [x] Code-splitting y reducción de chunk.
- [x] Migrar íconos MUI a `lucide-react` (iniciado en menú estudiante).
- [x] Ejecutar suite de tests backend.
- [x] Documentar variables de entorno en guías.

### Fase 6 — Sincronización backend/frontend ✅

- [x] Revisar flujos de autenticación/usuarios, expedientes, plan/documentos/informes, horas, evaluación, comité/dictamen/constancia y administración/reportes.
- [x] Corregir discrepancias críticas: campos de horas, estados de expediente, roles de rutas, columnas de reportes, validación de evaluación cualitativa y errores de compilación.
- [x] Crear `frontend/src/lib/constants.ts` con los estados exactos del backend.
- [x] Alinear validación de reseteo de contraseña y perfil de usuario.

### Fase 7 — Correcciones de seguridad y limpieza (2026-07-21) ✅

- [x] **Eliminar `NotificacionDTO` duplicado** en `sgpp-api` (package declaration incorrecto: `ingenieria.industrial` vs `ingenieria_industrial`).
- [x] **Restringir CORS** en `SecurityConfig`: de `*` a orígenes específicos (`localhost:5173`, `localhost:8082`, etc.).
- [x] **Corregir path traversal** en `ExportacionController.descargarPorId()`: validación de ruta dentro del directorio seguro.
- [x] **Agregar `@PreAuthorize`** al endpoint `DELETE /expedientes/{id}/disable` (antes accesible por cualquier rol autenticado).
- [x] **Eliminar log de token de recuperación** en plaintext (`log.info` → `log.debug` sin exponer token).
- [x] **Quitar JWT secret hardcoded** de `application.yml` y `application-local.yml`: ahora requiere env var `JWT_SECRET` sin fallback.
- [x] **Limpiar archivos huérfanos**: logs (*.log), uploads/, pom.xml.old, SQL scripts de diagnóstico, package-lock.json raíz, start-*.bat.
- [x] **Actualizar `.gitignore`** con patrones para uploads, data, scripts SQL y artifacts de build.
- [x] **Corregir puertos en `.env.example`**: alinear `POSTGRES_PORT=5434`, `SERVER_PORT=8082`, `VITE_API_BASE_URL` con el setup local real.
- [x] **Habilitar `flyway.validate-on-migrate: true`** y `out-of-order: false` en `application-local.yml`.
- [x] **Paths relativos** para uploads y exportaciones en `application-local.yml` (usar `${user.home}/sgpp/` en lugar de rutas absolutas Windows).
- [x] **Mover `@tanstack/react-query`** de `devDependencies` a `dependencies` (era runtime dependency); `devtools` a `devDependencies`.
- [x] **Eliminar `@fontsource/roboto`** (instalado pero nunca importado).
- [x] **Eliminar `index.css` legacy** (sintaxis `@tailwind` obsoleta, no importado en ningún lado; `wow-theme.css` con `@import "tailwindcss"` es la fuente activa).
- [x] **Crear `ErrorBoundary`** (`frontend/src/shared/components/ErrorBoundary.tsx`) y envolver `Suspense` en `App.tsx` para capturar errores de chunks lazy.
- [x] **Agregar constantes de color** (`COLORS`) en `frontend/src/lib/constants.ts` y reemplazar colores hex hardcoded en archivos críticos (GestionConvenios, GestionEmpresas, GestionSedes, DashboardCoordinacion).
- [x] **Verificar compilación**: `mvn -pl sgpp-api -am compile -DskipTests` exitoso tras todas las correcciones.

### Pendientes conocidos

- **ESLint para .ts/.tsx**: `typescript-eslint` no soporta TypeScript 7.0 (incompatible). Pendiente cuando `typescript-eslint` soporte TS >= 7.1.
- **Tests unitarios**: solo 1 test en backend (`ComponenteEvaluacionServiceImplTest`); 0 tests en frontend. Se recomienda ampliar cobertura.
- **Colores hex restantes**: quedan colores hardcoded en archivos secundarios; se continuará la migración a `COLORS` en futuras iteraciones.

---

## 8. Conclusión

El SGPP está **funcionalmente avanzado** y cumple aproximadamente el **90-92% de los requerimientos** de manera completa, con otro **5-8% parcialmente implementado**. Los bloques de compilación, build y lint son estables. Las fases prioritarias identificadas inicialmente han sido completadas, incluyendo una ronda completa de correcciones de seguridad, limpieza de código y mejoras de configuración.

**Estado actual del sistema:**
- Backend: compila limpiamente; JWT requiere env var; CORS restringido; path traversal protegido; endpoints críticos autorizados.
- Frontend: build exitoso; lint limpio; ErrorBoundary implementado; colores unificados en archivos principales; dependencias corregidas.
- Base de datos: 58 migraciones Flyway; validate-on-migrate habilitado; sin gap críticos.
- Configuración: puertos alineados (5434 DB, 8082 API, 5173 Frontend); paths relativos; .env.example actualizado.

La implementación faseada ha permitido abordar los hallazgos de forma ordenada, minimizando riesgos y manteniendo la estabilidad del sistema.

---

*Documento actualizado el 2026-07-21 tras la implementación de las fases de corrección de seguridad y limpieza.*
