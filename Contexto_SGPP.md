# Sistema de Gestión de Prácticas Preprofesionales (SGPP) — Descripción Completa

---

## Visión general del sistema

El Sistema de Gestión de Prácticas Preprofesionales (SGPP) es una plataforma digital de gestión académica y administrativa diseñada para la Escuela de Ingeniería Industrial de la Universidad Nacional de Trujillo (UNT). Su propósito es reemplazar el proceso manual y presencial de tramitación de prácticas preprofesionales por un flujo completamente digitalizado, trazable y normativamente alineado con el Reglamento de Prácticas PP-RG-01.09 y con los Lineamientos Generales aprobados mediante Resolución de Consejo Universitario N.° 0010-2025-UNT.

El sistema actúa como una ventana única institucional: centraliza en una sola plataforma la solicitud de prácticas, la selección de empresa, la generación automática de documentos oficiales, la revisión y aprobación documental, el seguimiento de horas, la evaluación de desempeño y la emisión de la constancia de prácticas. Todo el ciclo —desde que el estudiante solicita iniciar sus prácticas hasta que la Dirección de Escuela emite la constancia que lo acredita como egresado— ocurre dentro del sistema, con plazos automatizados, historial inmutable y notificaciones en tiempo real.

---

## Problema que resuelve

El proceso manual actual presenta cuatro problemas críticos documentados:

- **Cuellos de botella administrativos:** el Plan de Prácticas debe entregarse físicamente dentro de los 15 primeros días del ciclo, pero la revisión presencial por el Comité genera acumulación de expedientes en secretaría, con demoras que llevan al estudiante a iniciar actividades en la empresa sin aprobación formal.
- **Redundancia de datos:** información como el RUC de la empresa, el tutor institucional y la dirección de la sede se registra manualmente en múltiples documentos (perfil de sedes PG-016, registro de validación PG-017, actas de monitoreo PG-018), generando errores e inversión de tiempo sin valor agregado.
- **Retrasos en el cierre del expediente:** los tutores externos incumplen plazos de evaluación y envían documentos por canales informales, retrasando la consolidación de notas y la condición de egresado del estudiante, requisito indispensable para acceder al grado de Bachiller.
- **Ausencia de trazabilidad:** sin rastro de auditoría digital, es imposible determinar en qué punto del proceso se extravió un documento o quién fue el último responsable en revisarlo, obligando al estudiante a acudir presencialmente para consultar el estado de su trámite.

---

## Tipos de prácticas que gestiona el sistema

El SGPP gestiona los tres tipos de prácticas que define la normativa institucional:

| Tipo | Ciclo / Condición | Duración mínima | Créditos | Evaluación |
|---|---|---|---|---|
| Prácticas Iniciales | VIII ciclo | 64 horas (2 créditos) | 2 créditos académicos | Vigesimal (0–20) |
| Prácticas Finales | IX o X ciclo | 360 horas (3 meses) | Sin créditos | Vigesimal o cualitativa |
| Prácticas Profesionales | Egresado (máx. 1 año) | 360 horas | Sin créditos | Cualitativa |

Las prácticas curriculares utilizan escala vigesimal (0–20, mínimo aprobatorio 13.5 para el promedio final), mientras que las extracurriculares se evalúan cualitativamente en términos de logro de competencias: **Logrado**, **En Proceso**, **No Logrado**.

---

## Actores del sistema y sus funciones

El SGPP implementa un modelo de control de acceso basado en roles (RBAC) con seis perfiles diferenciados:

### Estudiante

Es el actor que inicia y sostiene el proceso. Desde la plataforma puede solicitar el inicio de prácticas, seleccionar una sede del catálogo institucional, cargar y actualizar el Plan de Prácticas, Informes Parciales e Informe Final en PDF, gestionar el levantamiento de observaciones dentro del plazo de 7 días calendario, consultar en tiempo real el estado de sus trámites y visualizar el acumulado de horas ejecutadas.

### Docente Asesor

Docente universitario designado por la Dirección del Departamento Académico. Revisa, aprueba u observa los documentos cargados por sus practicantes, registra las calificaciones por unidades académicas conforme a los porcentajes normativos, emite el visto bueno una vez verificado el cumplimiento de metas y realiza seguimiento académico continuo. Los calificativos se registran en el sistema con escala vigesimal y el docente debe registrar la asistencia y el avance del Plan de Prácticas.

### Tutor Externo

Representante formal de la entidad receptora. Opera desde una interfaz restringida: completa formularios digitales de evaluación de competencias, confirma las horas efectivas realizadas por el practicante, adjunta la constancia institucional y reporta incidencias o cambios de área al asesor académico. Solo puede acceder a la ficha de evaluación del practicante asignado, sin visibilidad de otros expedientes.

### Secretaría Académica

Verifica los requisitos de acceso del estudiante (mínimo 140 créditos aprobados para prácticas iniciales, o cursos hasta el octavo ciclo para prácticas finales), gestiona expedientes administrativos, revisa y valida que el trámite esté completo, lo marca como *listo para emisión*, resuelve incidencias de primer nivel y mantiene el historial inmutable de trazabilidad de todos los trámites. La emisión formal y firma de documentos oficiales (Carta de Presentación, Constancia de Prácticas) corresponde a la Dirección de Escuela.

### Comité de Prácticas

Conformado por docentes ordinarios designados por el Consejo de Facultad. Mantiene y actualiza el catálogo de instituciones receptoras aptas, valida la vigencia de convenios institucionales (la normativa exige que solo se realicen prácticas en empresas con convenio o acuerdo preliminar con la UNT), participa en la revisión digital simultánea de planes e informes finales y emite el dictamen colegiado con la calificación definitiva.

### Coordinador / Director de Escuela

Autoridad académica con acceso administrativo completo. Monitorea indicadores de gestión en tiempo real (KPIs), aprueba el reporte consolidado de prácticas por periodo académico, firma digitalmente cartas de presentación y resoluciones internas, y exporta datos históricos para auditoría interna y procesos de acreditación ante SUNEDU.

---

## Flujo completo del proceso

El sistema opera como una secuencia de etapas encadenadas, cada una habilitada por la aprobación de la anterior:

### Etapa 1 — Validación de requisitos y solicitud

El estudiante ingresa al portal con sus credenciales institucionales (`@unitru.edu.pe`). El sistema valida automáticamente si cumple los requisitos académicos: créditos mínimos, ciclo vigente y estado de matrícula. Si es apto, el estudiante selecciona una empresa del catálogo de sedes autorizadas por el Comité. El sistema crea automáticamente el expediente con la empresa y sede seleccionadas, quedando en estado `EMPRESA_SEDE_ASIGNADA`.

### Etapa 2 — Validación administrativa y emisión de la Carta de Presentación

La Secretaría Académica revisa la solicitud, verifica que los datos del estudiante y la sede sean correctos y que el expediente esté completo, y marca el expediente como *apto para carta* (transición `EMPRESA_SEDE_ASIGNADA → VALIDADO_SECRETARIA`). Una vez validado, el sistema —por cuenta de la Dirección de Escuela— genera la Carta de Presentación utilizando plantillas predefinidas con la identidad visual de la UNT, la cual es firmada digitalmente por el Director de Escuela y enviada digitalmente tanto al estudiante como a la institución receptora.

### Etapa 3 — Carga y aprobación del Plan de Prácticas

El practicante carga su Plan de Prácticas en formato PDF dentro de los 15 primeros días de iniciadas las prácticas. El sistema asigna automáticamente el docente asesor y, en el caso de prácticas finales, el plan también pasa por el Comité para revisión digital simultánea. Si el plan tiene observaciones, el estudiante dispone de un plazo de 7 días calendario para levantarlas; el sistema bloquea automáticamente la opción de corrección una vez vencido el plazo.

### Etapa 4 — Ejecución y seguimiento

Durante la ejecución, el sistema realiza seguimiento automatizado. El estudiante presenta avances periódicos según el cronograma del Plan: para prácticas iniciales, un informe parcial en la semana 5, otro en la semana 10 y el Informe Final en la semana 15. El tutor externo registra el desempeño en la interfaz de la empresa, mientras el asesor académico supervisa y valida los avances en tiempo real. El sistema lleva un contador automático de horas ejecutadas y valida que el total cumpla el mínimo exigido (320 horas) antes de habilitar el cierre.

### Etapa 5 — Evaluación y calificación

La calificación del expediente de prácticas sigue una estructura de tres componentes:

| Componente | Responsable | Peso |
|---|---|---|
| Plan de Prácticas | Docente Asesor | 10 puntos (10%) |
| Evaluación de la empresa (actitudinal, cognitivo, proyección) | Tutor Externo | 50 puntos (50%) |
| Evaluación del Informe Final | Comité de Prácticas | 40 puntos (40%) |

Para las prácticas curriculares, el promedio final se calcula como el promedio simple de las tres unidades:

- **Unidad 1:** Plan de Prácticas (20%) + Informe Parcial (80%)
- **Unidad 2:** Informe Parcial
- **Unidad 3:** Informe Final (revisado por el Comité)

El sistema calcula automáticamente el promedio y aplica la regla de aprobación (mínimo 13.5). Una vez registradas y validadas por el Docente Asesor o el Comité, las calificaciones son inmutables.

### Etapa 6 — Cierre del expediente y emisión de constancia

Completadas las horas, aprobados los informes y registradas las calificaciones, la plataforma consolida los resultados y eleva el reporte consolidado a la Dirección de Escuela. El Director emite digitalmente la Constancia de Prácticas, que acredita al estudiante haber concluido satisfactoriamente el proceso y lo habilita para obtener la condición de egresado y acceder al grado de Bachiller.

---

## Documentos que gestiona el sistema

El SGPP gestiona en formato digital todos los documentos del proceso:

| Documento | Generado por | Formato | Observaciones |
|---|---|---|---|
| Carta de Presentación | Sistema (previa validación de Secretaría y firma del Director) | PDF firmado digitalmente | Se genera tras validación administrativa de Secretaría; lo firma el Director |
| Carta de Aceptación | Empresa receptora | PDF cargado por empresa | Requisito obligatorio |
| Plan de Prácticas (Anexo 1) | Estudiante | PDF | Plazo: 15 días desde inicio |
| Informes Parciales | Estudiante | PDF | Semanas 5 y 10 (iniciales) |
| Informe Final | Estudiante | PDF | Con visto bueno del asesor |
| Ficha de Evaluación (Anexo 2) | Tutor externo | Formulario digital | Criterios actitudinales, cognitivos, proyección |
| Constancia de Prácticas | Empresa receptora | PDF | Firmada por RRHH de la empresa |
| Calificación del Expediente (Anexo 4) | Comité de Prácticas | Formulario digital | Plan + evaluación empresa + informe |
| Reporte Consolidado | Sistema (automático) | PDF / CSV / XML | Para la Dirección de Escuela |
| Constancia de Prácticas Concluidas | Dirección de Escuela (previa validación de Secretaría) | PDF firmado | Habilita condición de egresado; Secretaría prepara el expediente y Dirección firma |

---

## Módulos funcionales del sistema

El SGPP está organizado en seis módulos funcionales:

### Módulo de Gestión de Usuarios y Perfiles

Integra autenticación centralizada con las credenciales institucionales de la UNT mediante OAuth2/LDAP. Gestiona los seis perfiles de acceso con sus permisos diferenciados y administra la base de datos de tutores externos con acceso restringido únicamente a las evaluaciones de los practicantes a su cargo.

### Módulo de Validación y Registro de Sedes

Mantiene el catálogo actualizado de instituciones aptas para recibir practicantes (públicas, privadas o mixtas). Automatiza la validación de convenios vigentes emitiendo alertas cuando un convenio esté próximo a vencer antes de la fecha de finalización de las prácticas del estudiante. Gestiona digitalmente los formatos PG-016 (perfil de sede) y PG-017 (validación de sede).

### Módulo de Gestión Documental y Flujos de Trabajo

Permite la carga, almacenamiento y visualización de documentos PDF. Implementa un motor de estados con historial inmutable de cambios por documento:

> **Pendiente → En Revisión → Observado → Aprobado → Archivado**

Controla los plazos normativos automáticamente: habilita el levantamiento de observaciones dentro de 7 días y bloquea la acción al vencerse.

### Módulo de Evaluación y Calificación

Aplica reglas de calificación diferenciadas según el tipo de práctica (vigesimal o cualitativa). Permite al Docente Asesor registrar notas por unidades y calcula automáticamente el promedio final. Habilita formularios de rúbricas digitales para que los tutores de empresa evalúen competencias específicas de Ingeniería Industrial (calidad, productividad, ética, entre otras).

### Módulo de Monitoreo y Alertas

Envía notificaciones automáticas por correo electrónico e in-app ante eventos críticos: asignación de un nuevo plan para revisar, llegada de una fecha límite, recepción de una observación, documento aprobado o convenio por vencer. Mantiene el contador automático de horas ejecutadas y bloquea acciones fuera de los plazos normativos.

### Módulo de Reportes y Dashboards

Genera el Reporte Consolidado de Prácticas de forma masiva para la Dirección de Escuela. Proporciona tableros de control con KPIs: tiempo promedio de aprobación, tasa de observaciones por asesor, distribución geográfica de sedes y empresas más demandadas. Permite la exportación de datos históricos a formatos CSV y XML para integración con otros sistemas de gestión universitaria.

---

## Requerimientos no funcionales clave

El sistema está diseñado bajo estándares de calidad técnica que garantizan su sostenibilidad institucional:

| Atributo | Especificación |
|---|---|
| Rendimiento | Tiempo de respuesta < 3 segundos para consultas y carga de PDF de hasta 10 MB, con 150 usuarios concurrentes |
| Disponibilidad | 99.5% en horario lectivo (06:00–22:00 h), con respaldos diarios y RTO < 24 h |
| Escalabilidad | Escalado horizontal dinámico en picos de matrícula y cierre de prácticas |
| Seguridad | Autenticación OAuth2/LDAP, cifrado AES-256, registro inmutable de transacciones (usuario, acción, timestamp, IP) |
| Integridad | Calificaciones inmutables tras validación, con sellado de tiempo y hash criptográfico |
| Usabilidad | Interfaz responsiva WCAG 2.1 AA; tutores externos logran operatividad en < 2 h sin capacitación |
| Cumplimiento normativo | Plazos institucionales parametrizados automáticamente (15 días Plan, 7 días observaciones) |
| Cobertura de pruebas | > 70% de cobertura de pruebas automatizadas |

---

## Beneficios esperados del sistema

La implementación del SGPP genera mejoras medibles en cuatro dimensiones:

- **Reducción de tiempos:** procesos que antes tomaban días se ejecutan en segundos (validación de requisitos, generación de cartas); las aprobaciones documentales se completan en aproximadamente 48 horas.
- **Cumplimiento normativo automatizado:** el sistema garantiza el cumplimiento de plazos y requisitos mediante validaciones automáticas que evitan errores o incumplimientos, sin depender de la disponibilidad presencial del personal.
- **Trazabilidad integral:** todas las acciones quedan registradas con usuario, fecha, hora e IP, habilitando auditorías de calidad y procesos de acreditación ante SUNEDU.
- **Inteligencia estratégica:** la centralización de datos permite identificar áreas con mayor demanda laboral, evaluar el desempeño estudiantil por tipo de empresa y relacionar sectores productivos con la inserción laboral de los egresados, apoyando la mejora del currículo académico.

---

## Tecnologías propuestas

El sistema se desarrolla sobre una arquitectura modular con separación clara de capas:

- **Backend:** Spring Boot (Java) con API REST, autenticación JWT y arquitectura por módulos
- **Frontend:** React con Material UI, diseño responsivo para escritorio y móvil
- **Base de datos:** PostgreSQL con modelo relacional normalizado
- **Infraestructura:** Docker Compose para despliegue local y en nube
- **Documentos:** Generación de PDF desde plantillas institucionales
- **Seguridad:** OAuth2/LDAP, AES-256, hash criptográfico para integridad de calificaciones
