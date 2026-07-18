# REQUERIMIENTOS FUNCIONALES DETALLADOS — SISTEMA SGPP
## Sistema de Gestión de Prácticas Preprofesionales — Escuela de Ingeniería Industrial UNT

> Basado en: Reglamento de Prácticas Preprofesionales UNT-Ingeniería Industrial (PP-RG-01.09), RCU N° 0010-2025-UNT, expediente real de prácticas y plan de trabajo técnico del sistema SGPP.

---

## Convenciones

- **Código:** RF-XX (Requerimiento Funcional)
- **Prioridad:** Alta / Media / Baja
- **Actor(es):** Rol(es) que interactúan con el requerimiento
- Cada RF incluye: descripción, criterios de aceptación y reglas de negocio asociadas.

---

## MÓDULO 1: AUTENTICACIÓN Y GESTIÓN DE USUARIOS

### RF-01: Autenticación con credenciales institucionales
**Prioridad:** Alta | **Actor(es):** Todos los roles

El sistema debe permitir el inicio de sesión mediante correo institucional (@unitru.edu.pe) y contraseña.

**Criterios de aceptación:**
- Validar formato de correo institucional en el frontend antes de enviar la solicitud.
- Generar token JWT con expiración configurable al autenticarse correctamente.
- Bloquear el acceso tras N intentos fallidos consecutivos (configurable).
- Redirigir automáticamente al dashboard correspondiente según el rol del usuario autenticado.
- Registrar cada intento de inicio de sesión (exitoso o fallido) con fecha, hora e IP.

---

### RF-02: Gestión de perfiles por rol (RBAC)
**Prioridad:** Alta | **Actor(es):** Coordinador/Director, Sistema

El sistema debe implementar control de acceso basado en roles (RBAC), con los siguientes roles: Estudiante, Docente Asesor, Tutor Externo, Secretaría, Comité de Prácticas, Director de Escuela/Coordinador.

**Criterios de aceptación:**
- Cada usuario tiene exactamente un rol activo principal (puede tener roles secundarios si aplica, ej. docente que también es miembro del Comité).
- Cada endpoint del backend valida el rol antes de ejecutar la operación.
- Cada pantalla del frontend se adapta según permisos del rol (menú, acciones disponibles).
- Un usuario no puede acceder a expedientes o módulos fuera de su alcance (ej. estudiante no ve expedientes de otros estudiantes).

---

### RF-03: Administración de usuarios y asignación de roles
**Prioridad:** Alta | **Actor(es):** Secretaría, Coordinador/Director

El sistema debe permitir crear, editar, deshabilitar y reasignar roles a los usuarios (docentes, secretaría, comité, estudiantes).

**Criterios de aceptación:**
- Permite búsqueda y filtrado de usuarios por nombre, rol, estado (activo/inactivo).
- Un usuario deshabilitado no puede iniciar sesión, pero su historial permanece visible.
- Todo cambio de rol queda registrado en auditoría (quién, cuándo, rol anterior, rol nuevo).

---

### RF-04: Registro y gestión de tutores externos
**Prioridad:** Alta | **Actor(es):** Secretaría, Luis (módulo usuarios)

El sistema debe permitir registrar tutores externos designados formalmente por la empresa receptora, asociándolos a un expediente/practicante específico.

**Criterios de aceptación:**
- Registro incluye: nombre, cargo, empresa, área, correo, teléfono.
- Un tutor externo solo puede ver y evaluar a los practicantes que le fueron asignados.
- El sistema valida que la empresa receptora haya designado formalmente al tutor (dato obligatorio, ver RF-08).

---

## MÓDULO 2: GESTIÓN DE EMPRESAS, SEDES Y CONVENIOS

### RF-05: Registro y gestión de empresas
**Prioridad:** Alta | **Actor(es):** Comité de Prácticas, Estudiante (consulta)

El sistema debe permitir crear, listar, editar y deshabilitar empresas o instituciones (públicas, privadas o mixtas) que aceptan practicantes.

**Criterios de aceptación:**
- Datos mínimos: razón social, RUC, dirección, representante legal, teléfono, correo, celular, descripción general, área/sector.
- Una empresa deshabilitada no aparece en el catálogo de selección del estudiante, pero conserva su historial.
- El Comité de Prácticas es responsable de mantener actualizada esta relación (Art. 11 del reglamento).

---

### RF-06: Registro y gestión de sedes de práctica
**Prioridad:** Alta | **Actor(es):** Comité de Prácticas, Estudiante (consulta)

El sistema debe permitir registrar sedes específicas (ubicaciones/áreas operativas) asociadas a una empresa, mediante el **Formato de Perfil de Sede (PG-016)**.

**Criterios de aceptación:**
- Cada sede se asocia a una empresa matriz.
- Datos: dirección específica, área/departamento, funcionario a cargo, capacidad de practicantes.
- El formulario replica los campos del Formato PG-016 oficial.

---

### RF-07: Validación de sedes registradas
**Prioridad:** Alta | **Actor(es):** Comité de Prácticas

El sistema debe permitir que el Comité valide o rechace una sede registrada, usando el **Formato de Registro de Validación (PG-017)**.

**Criterios de aceptación:**
- Una sede no validada no puede ser seleccionada por el estudiante en una nueva solicitud.
- El sistema registra quién validó, cuándo, y observaciones si la sede fue rechazada.
- Estado de la sede: `PENDIENTE_VALIDACION`, `VALIDADA`, `RECHAZADA`, `DESHABILITADA`.

---

### RF-08: Gestión de convenios institucionales
**Prioridad:** Alta | **Actor(es):** Comité de Prácticas, Director de Escuela

El sistema debe permitir registrar convenios o acuerdos preliminares entre la UNT y las empresas/instituciones receptoras.

**Criterios de aceptación:**
- Datos: tipo (convenio formal / acuerdo preliminar a nivel de Decanato), fecha de firma, fecha de vencimiento, documento adjunto (PDF), tutor(es) designado(s) por la entidad.
- Una empresa sin convenio vigente ni acuerdo preliminar no puede ser seleccionada para nuevas solicitudes de práctica.
- Regla de negocio (lineamientos UNT 2025): solo se ejecutan prácticas en instituciones con convenio o acuerdo preliminar, con tutor(es) designado(s) formalmente.

---

### RF-09: Alertas de convenios próximos a vencer
**Prioridad:** Media | **Actor(es):** Sistema, Comité, Coordinador

El sistema debe generar alertas automáticas cuando un convenio esté próximo a vencer antes de la fecha estimada de fin de prácticas de un estudiante asociado a esa empresa.

**Criterios de aceptación:**
- Alerta configurable (ej. 30, 15 y 7 días antes del vencimiento).
- Notificación in-app y por correo al Comité/Coordinador.
- El expediente del estudiante muestra un indicador visual de riesgo si su empresa tiene convenio por vencer.

---

### RF-10: Catálogo y selección de sede/empresa (vista estudiante)
**Prioridad:** Alta | **Actor(es):** Estudiante

El sistema debe mostrar al estudiante un catálogo de empresas y sedes validadas y con convenio vigente, con buscador, filtros y ficha de detalle.

**Criterios de aceptación:**
- Filtros por: rubro/sector, ubicación, disponibilidad de vacantes.
- Ficha de detalle muestra: descripción, área, requisitos, convenio vigente (sí/no).
- El estudiante solo puede seleccionar empresas/sedes en estado `VALIDADA` y con convenio vigente.

---

## MÓDULO 3: EXPEDIENTE DE PRÁCTICAS (NÚCLEO DEL SISTEMA)

### RF-11: Solicitud de inicio de práctica
**Prioridad:** Alta | **Actor(es):** Estudiante

El estudiante debe poder iniciar una solicitud de práctica, seleccionando el **tipo de práctica** (Inicial o Final/Profesional), la empresa y la sede.

**Criterios de aceptación:**
- El sistema valida automáticamente que el estudiante cumpla los requisitos académicos mínimos para el tipo de práctica elegido (ver RF-12).
- Si el estudiante no cumple requisitos, el sistema bloquea la solicitud y muestra el motivo específico.
- Solo se permite una solicitud activa por estudiante a la vez (no se pueden duplicar expedientes abiertos).
- Al crear la solicitud, el expediente pasa al estado `SOLICITUD_REGISTRADA`.

---

### RF-12: Validación de elegibilidad académica
**Prioridad:** Alta | **Actor(es):** Sistema, Secretaría

El sistema debe validar automáticamente (o semi-automáticamente) que el estudiante cumpla los requisitos académicos según el tipo de práctica:

**Criterios de aceptación:**
- **Prácticas Iniciales:** matrícula registrada en el curso; prerrequisitos aprobados (plan de estudios vigente); estar en VIII ciclo.
- **Prácticas Finales:** tener aprobadas las Prácticas Iniciales; cursos aprobados hasta el ciclo mínimo configurado (8vo según reglamento de Escuela; parametrizable a 9no según lineamientos UNT).
- **Prácticas Profesionales:** condición de egresado.
- El sistema debe permitir configurar el ciclo mínimo exigido como parámetro editable por el Coordinador/Director, sin necesidad de modificar código.

---

### RF-13: Revisión administrativa de la solicitud (Secretaría)
**Prioridad:** Alta | **Actor(es):** Secretaría

Secretaría debe revisar la solicitud del estudiante y validar los requisitos administrativos (matrícula, documentos base, ciclo) antes de habilitar la emisión de la Carta de Presentación.

**Criterios de aceptación:**
- Secretaría puede: aprobar (marcar como "lista para emisión"), observar (devolver al estudiante con motivo), o rechazar.
- El expediente pasa a `EN_REVISION_ADMINISTRATIVA` al iniciar la revisión, y a `APTA_PARA_CARTA_PRESENTACION` al aprobarse.
- Toda observación queda registrada con motivo, fecha y usuario responsable.

---

### RF-14: Emisión de la Carta de Presentación
**Prioridad:** Alta | **Actor(es):** Director de Escuela

El Director de Escuela debe poder revisar el expediente validado por Secretaría y emitir/firmar la Carta de Presentación oficial dirigida a la empresa receptora.

**Criterios de aceptación:**
- El sistema genera automáticamente el documento en PDF, replicando el formato oficial (numeración correlativa, datos del practicante, empresa, base legal Ley N° 28518, horas mínimas requeridas, duración recomendada).
- Solo puede emitirse si el expediente está en estado `APTA_PARA_CARTA_PRESENTACION`.
- Al emitirse, el expediente pasa a `CARTA_PRESENTACION_EMITIDA` y el estudiante recibe notificación.
- El documento queda disponible para descarga del estudiante y consulta de auditoría.
- Numeración correlativa configurable (ej. N°XXX-AAAA-EPIIndustrial).

---

### RF-15: Carga de la Carta de Aceptación (empresa)
**Prioridad:** Alta | **Actor(es):** Estudiante

El estudiante debe poder subir al sistema la Carta de Aceptación firmada por la empresa receptora, una vez recibida la Carta de Presentación.

**Criterios de aceptación:**
- Solo disponible si el expediente está en estado `CARTA_PRESENTACION_EMITIDA`.
- El sistema valida formato del archivo (PDF), tamaño máximo, y solicita datos clave del documento (fecha de inicio, fecha de fin estimada, área asignada, horario).
- Al subir el documento, el expediente pasa a `CARTA_ACEPTACION_CARGADA`.
- Secretaría o Comité puede validar la carta antes de continuar el flujo (revisión opcional configurable).

---

### RF-16: Gestión del Plan de Prácticas
**Prioridad:** Alta | **Actor(es):** Estudiante, Docente Asesor, Comité

El estudiante debe poder completar y subir el Plan de Prácticas siguiendo la estructura oficial (Art. 28).

**Criterios de aceptación:**
- Formulario/documento con las secciones obligatorias: carátula, datos de empresa, situación problemática, objetivos (general y específicos), técnicas/procedimientos de Ingeniería Industrial, cronograma de trabajo.
- **Prácticas Iniciales:** el plan se presenta al Docente Asesor dentro de los 15 primeros días del ciclo.
- **Prácticas Finales/Profesionales:** el plan se presenta a la Dirección de Escuela dentro de los 15 días desde la recepción de la Carta de Presentación; requiere revisión y aprobación del Comité de Prácticas.
- El sistema calcula y muestra automáticamente el plazo límite de presentación según la fecha de referencia (inicio de ciclo o recepción de carta).
- Estado del plan: `PENDIENTE`, `EN_REVISION`, `OBSERVADO`, `APROBADO`.

---

### RF-17: Revisión y aprobación del Plan de Prácticas
**Prioridad:** Alta | **Actor(es):** Docente Asesor (iniciales), Comité (finales/profesionales)

El asesor o el Comité deben poder revisar el plan, aprobarlo u observarlo con comentarios.

**Criterios de aceptación:**
- Si se observa, el sistema activa un plazo de **7 días calendario** para que el estudiante levante las observaciones.
- Al vencer el plazo sin subsanación, el sistema bloquea automáticamente la acción y notifica a Secretaría/Comité.
- El historial de revisiones del plan es inmutable y trazable (usuario, fecha, acción, comentario).
- Al aprobarse, el expediente pasa a `PLAN_APROBADO` y habilita el inicio de ejecución de la práctica.

---

### RF-18: Registro de inicio de ejecución de la práctica
**Prioridad:** Media | **Actor(es):** Sistema, Estudiante

Una vez aprobado el plan, el sistema debe habilitar el estado de ejecución y comenzar el conteo de horas/plazos.

**Criterios de aceptación:**
- El expediente pasa a `PRACTICA_EN_EJECUCION`.
- Se registra la fecha de inicio real (puede tomarse de la Carta de Aceptación) y se calcula la fecha estimada de fin según duración mínima requerida (64 horas para iniciales; 360 horas/3 meses para finales/profesionales).

---

## MÓDULO 4: SEGUIMIENTO Y CONTROL DE HORAS

### RF-19: Registro y contador automático de horas ejecutadas
**Prioridad:** Alta | **Actor(es):** Estudiante, Docente Asesor, Sistema

El sistema debe permitir registrar avances de horas ejecutadas por el estudiante y calcular automáticamente el acumulado.

**Criterios de aceptación:**
- El estudiante puede registrar horas trabajadas periódicamente (o el sistema las infiere del cronograma/asistencia registrada por el asesor).
- El sistema valida el cumplimiento del mínimo de horas exigido según tipo de práctica (64 h iniciales; 360 h finales/profesionales) antes de permitir el cierre del expediente.
- El dashboard del estudiante muestra una barra de progreso de horas acumuladas vs. requeridas.
- No se permite marcar el expediente como apto para cierre si el mínimo de horas no se ha cumplido.

---

### RF-20: Registro de asistencia y avance por el docente asesor
**Prioridad:** Media | **Actor(es):** Docente Asesor

El docente asesor debe poder registrar la asistencia de los estudiantes asesorados y el avance del Plan de Prácticas (Art. 38).

**Criterios de aceptación:**
- Registro periódico (ej. semanal) de asistencia y observaciones de avance.
- El historial de asistencia es visible para el estudiante (solo lectura) y para el Comité.

---

### RF-21: Monitoreo de prácticas (supervisión inopinada)
**Prioridad:** Media | **Actor(es):** Docente Asesor, Comité

El sistema debe permitir registrar actividades de monitoreo/supervisión de la práctica, utilizando el **Formato de Monitoreo (PG-018)**.

**Criterios de aceptación:**
- Registro de fecha de visita/supervisión, observaciones, evidencias (fotos/documentos opcionales).
- Historial de monitoreo visible en el detalle del expediente.

---

## MÓDULO 5: GESTIÓN DOCUMENTAL Y MOTOR DE ESTADOS

### RF-22: Carga de documentos requeridos por el estudiante
**Prioridad:** Alta | **Actor(es):** Estudiante

El sistema debe presentar al estudiante una tabla de documentos requeridos según su tipo de práctica (plan, informes parciales, informe final, constancia, ficha de evaluación), permitiendo cargar cada uno en formato PDF.

**Criterios de aceptación:**
- Checklist dinámico según tipo de práctica (Inicial: plan + 3 informes + constancia; Final/Profesional: plan + informe final + constancia + ficha de evaluación de empresa).
- Cada documento muestra estado visual (chip de color): Pendiente, En Revisión, Observado, Aprobado, Archivado.
- Historial de versiones por documento (cada nueva carga tras observación genera una nueva versión, sin eliminar la anterior).

---

### RF-23: Motor de estados documentales
**Prioridad:** Alta | **Actor(es):** Sistema

El sistema debe implementar un motor de estados para cada documento del expediente, con transición: **Pendiente → En Revisión → Observado → Aprobado → Archivado**.

**Criterios de aceptación:**
- Cada transición de estado se registra en un historial inmutable: usuario, acción, fecha, IP.
- No se permite saltar estados fuera de la secuencia definida (ej. no se puede pasar de Pendiente a Aprobado sin pasar por En Revisión).
- Un documento en estado Observado no puede considerarse válido para el cierre del expediente hasta pasar a Aprobado.

---

### RF-24: Habilitación y bloqueo de levantamiento de observaciones
**Prioridad:** Alta | **Actor(es):** Estudiante, Sistema

El sistema debe habilitar al estudiante para subsanar observaciones dentro del plazo correspondiente (7 días para observaciones al plan; 10 días para observaciones a documentos presentados), bloqueando automáticamente la acción al vencer el plazo.

**Criterios de aceptación:**
- El sistema muestra countdown/plazo restante visible en la pantalla del documento observado.
- Al vencer el plazo sin subsanación, el documento pasa a estado bloqueado y se notifica a Secretaría/Comité para definir siguiente acción (según Art. 45, casos no previstos los resuelve el Comité en coordinación con Dirección de Escuela).
- El estudiante no puede subir una nueva versión de un documento bloqueado sin habilitación manual de una instancia superior.

---

### RF-25: Revisión documental por el docente asesor
**Prioridad:** Alta | **Actor(es):** Docente Asesor

El asesor debe poder revisar los documentos de los estudiantes asignados, aprobarlos u observarlos con comentarios.

**Criterios de aceptación:**
- Vista de lista de estudiantes asignados al asesor, con estado resumido de cada expediente.
- Panel de revisión con: datos del estudiante, documento a revisar, botones Aprobar/Observar, caja de comentarios obligatoria al observar.
- Al aprobar el informe final, el sistema exige que el asesor "vise" (firma electrónica/conformidad) la carátula, según Art. 39; sin este visado, el informe no puede evaluarse.

---

### RF-26: Notificaciones ante cambios de estado documental
**Prioridad:** Media | **Actor(es):** Estudiante, Docente Asesor, Sistema

El sistema debe notificar automáticamente (in-app y/o correo) ante cualquier cambio de estado de un documento.

**Criterios de aceptación:**
- Eventos que disparan notificación: nuevo documento subido, documento aprobado, documento observado, plazo próximo a vencer, plazo vencido.
- Las notificaciones incluyen enlace directo al documento/expediente correspondiente.

---

## MÓDULO 6: INFORMES DE PRÁCTICA (PRÁCTICAS INICIALES)

### RF-27: Gestión de informes parciales y final (prácticas iniciales)
**Prioridad:** Alta | **Actor(es):** Estudiante, Docente Asesor

El estudiante debe poder presentar tres informes durante el curso de Prácticas Iniciales: parcial en semana 5, parcial en semana 10, e informe final en semana 15.

**Criterios de aceptación:**
- El sistema calcula y muestra las fechas límite de cada informe según el calendario académico configurado.
- Cada informe parcial es evaluado por el asesor con calificación vigesimal (0-20) y comentarios de corrección si corresponde.
- El informe final requiere visado del asesor (firma/conformidad en carátula) antes de ser evaluado.
- Si el estudiante no presenta el informe final, el sistema registra automáticamente nota 00.

---

### RF-28: Validación de formato del informe
**Prioridad:** Media | **Actor(es):** Sistema, Estudiante

El sistema debe validar (o al menos guiar) que el documento cumpla con el formato exigido: papel A-4, interlineado 1.5, márgenes (izq/sup/inf 3.5 cm, der 3 cm), fuente Times New Roman 12, referencias en formato APA.

**Criterios de aceptación:**
- El sistema provee una plantilla descargable con el formato preconfigurado.
- Validación de checklist estructural: carátula, índice, introducción, capítulos I-V, anexos (según Art. 36).
- No es obligatorio validar automáticamente el contenido textual, pero sí la presencia de las secciones mínimas mediante checklist manual del revisor.

---

## MÓDULO 7: EVALUACIÓN Y CALIFICACIÓN

### RF-29: Evaluación de desempeño por la empresa (Anexo 2)
**Prioridad:** Alta | **Actor(es):** Tutor Externo

El sistema debe implementar el formulario de evaluación de desempeño de la empresa, replicando la estructura del Anexo 2, exclusivo para prácticas Finales/Profesionales.

**Criterios de aceptación:**
- Escala de 1 a 5 por criterio (1 = peor desempeño, 5 = mejor desempeño).
- Categorías y criterios exactos:
  - **Aspectos Actitudinales** (4 criterios, 5 pts c/u): asistencia y puntualidad; responsabilidad; esfuerzo y empeño; respeto y colaboración con superiores.
  - **Aspectos Cognitivos** (2 criterios, 4 pts c/u): cultura y conocimientos generales; conocimientos técnicos de Ingeniería Industrial.
  - **Aspectos de Proyección y Desarrollo Profesional** (4 criterios, 4 pts c/u): creatividad; interacción con personas; comunicación verbal y escrita; grado de aprendizaje.
- El sistema calcula subtotales por categoría y el total ponderado a escala de 50 puntos (según Anexo 4).
- Solo el tutor externo asignado a ese expediente puede completar esta evaluación.
- Interfaz simplificada y restringida (el tutor externo no accede a otras funciones del sistema).

---

### RF-30: Evaluación del Plan de Prácticas (Anexo 4, sección 1)
**Prioridad:** Alta | **Actor(es):** Comité de Prácticas

El sistema debe permitir calificar el Plan de Prácticas con el criterio "Consistencia entre objetivos, actividades y fundamento teórico", puntaje máximo 10 puntos.

**Criterios de aceptación:**
- Aplica solo a prácticas Finales/Profesionales (el plan de iniciales se califica dentro de la Unidad 1 del curso, ver RF-32).
- El puntaje se registra dentro del expediente y se consolida en la calificación final (Anexo 4).

---

### RF-31: Evaluación del Informe de Prácticas (Anexo 4, sección 3)
**Prioridad:** Alta | **Actor(es):** Comité de Prácticas

El sistema debe permitir calificar el informe final con los criterios: aplicación coherente de esquemas metodológicos (20 pts), aplicación de técnicas de Ingeniería Industrial (10 pts), presentación y redacción (10 pts). Total: 40 puntos.

**Criterios de aceptación:**
- Aplica a prácticas Finales/Profesionales.
- El sistema consolida automáticamente: Plan (10) + Evaluación de Empresa (50) + Evaluación de Informe (40) = Total 100 puntos.
- Se registra el dictamen final firmado (digitalmente o con constancia de conformidad) por el Presidente y Miembros de la Comisión/Comité.

---

### RF-32: Registro de notas por unidades (prácticas iniciales, modalidad curricular)
**Prioridad:** Alta | **Actor(es):** Docente Asesor

El sistema debe permitir registrar las notas vigesimales por unidad del curso de Prácticas Iniciales:
- Unidad 1: Plan de Práctica (20%) + Informe Parcial (80%)
- Unidad 2: Informe Parcial
- Unidad 3: Informe Final

**Criterios de aceptación:**
- El sistema calcula automáticamente el promedio final como promedio simple de las tres unidades.
- Nota mínima aprobatoria configurable (13.5 según Art. 43; verificar y ajustar si difiere del estándar SUV).
- Si el promedio es menor al mínimo, el sistema habilita automáticamente el "Examen de Aplazados" en la semana 17, permitiendo revisión del informe corregido.

---

### RF-33: Diferenciación entre evaluación vigesimal y cualitativa
**Prioridad:** Alta | **Actor(es):** Sistema, Comité, Coordinador

El sistema debe permitir configurar, por tipo de práctica y modalidad (curricular/extracurricular), si la evaluación es vigesimal (0-20) o cualitativa (logrado / en proceso / no logrado).

**Criterios de aceptación:**
- Parámetro configurable a nivel de tipo de práctica, no hardcodeado.
- Las prácticas curriculares usan evaluación vigesimal, sin examen sustitutorio ni de aplazados (regla de lineamientos UNT, salvo excepción expresa del reglamento de Escuela para iniciales).
- Las prácticas extracurriculares usan evaluación cualitativa; el informe debe estar firmado por el asesor/tutor de la entidad receptora.

---

## MÓDULO 8: COMITÉ DE PRÁCTICAS Y DICTAMEN FINAL

### RF-34: Panel de expedientes en revisión (Comité)
**Prioridad:** Alta | **Actor(es):** Comité de Prácticas

El sistema debe mostrar al Comité una tabla de expedientes pendientes de revisión, con filtros por estado, tipo de práctica, estudiante y fecha.

**Criterios de aceptación:**
- Filtros combinables (estado + tipo + periodo).
- Acceso directo al detalle del expediente desde la tabla.
- Indicador visual de expedientes con plazos vencidos o próximos a vencer.

---

### RF-35: Validación colegiada y dictamen final
**Prioridad:** Alta | **Actor(es):** Comité de Prácticas (Presidente + Miembros)

El sistema debe permitir el registro de un dictamen final colegiado sobre el expediente, con la calificación consolidada (Anexo 4) y observaciones.

**Criterios de aceptación:**
- El dictamen requiere registro de conformidad del Presidente de Comisión y de los Miembros de Comisión (mínimo configurable, ej. 2 de 3).
- El sistema no permite cerrar el expediente sin dictamen registrado.
- El dictamen y la calificación final quedan archivados de forma inmutable.

---

### RF-36: Cierre de expediente y generación de constancia
**Prioridad:** Alta | **Actor(es):** Sistema, Director de Escuela, Comité

El sistema debe permitir el cierre formal del expediente una vez cumplidos todos los requisitos, generando la constancia de prácticas.

**Criterios de aceptación:**
- Condiciones para cierre: horas mínimas cumplidas, todos los documentos en estado Aprobado, dictamen del Comité registrado (si aplica), nota/evaluación final registrada.
- El sistema genera automáticamente la constancia en PDF con los datos del practicante, periodo, empresa y área.
- Al cerrar, el expediente pasa a `EXPEDIENTE_CERRADO` y luego `CONSTANCIA_EMITIDA`.
- El reporte consolidado se eleva automáticamente a la Dirección de Escuela para su conocimiento/archivo (según lineamientos UNT 2025).

---

## MÓDULO 9: SECRETARÍA ACADÉMICA

### RF-37: Bandeja de expedientes administrativos
**Prioridad:** Alta | **Actor(es):** Secretaría

El sistema debe proveer una bandeja con todos los expedientes en trámite administrativo, con filtros por estudiante, estado y periodo.

**Criterios de aceptación:**
- Vista de tabla con columnas: estudiante, tipo de práctica, empresa, estado actual, fecha de última acción.
- Acceso a historial completo del trámite desde la bandeja.

---

### RF-38: Gestión de incidencias de primer nivel
**Prioridad:** Media | **Actor(es):** Secretaría

El sistema debe permitir registrar incidencias administrativas (ej. documentos faltantes, inconsistencias de matrícula) y darles seguimiento.

**Criterios de aceptación:**
- Registro de incidencia con tipo, descripción, estudiante asociado, estado (abierta/en gestión/resuelta).
- Historial de incidencias visible en el detalle del expediente.

---

## MÓDULO 10: NOTIFICACIONES Y ALERTAS

### RF-39: Sistema de notificaciones in-app y por correo
**Prioridad:** Alta | **Actor(es):** Sistema, Todos los roles

El sistema debe enviar notificaciones ante eventos críticos: nueva tarea para revisar, fecha límite próxima, nueva observación recibida, documento aprobado, convenio por vencer.

**Criterios de aceptación:**
- Notificaciones in-app con badge de contador en la barra superior.
- Notificaciones por correo SMTP para eventos de alta prioridad (plazos, observaciones, aprobaciones).
- Cada notificación tiene estado leída/no leída y clasificación por prioridad (alta/media/baja).

---

### RF-40: Bloqueo automático de acciones fuera de plazo
**Prioridad:** Alta | **Actor(es):** Sistema

El sistema debe bloquear automáticamente cualquier acción del estudiante sobre un documento u observación cuyo plazo normativo haya vencido.

**Criterios de aceptación:**
- Verificación automática diaria (job/cron) de plazos vencidos.
- Al vencer un plazo, el documento cambia a estado bloqueado y se notifica a las instancias correspondientes (asesor, Comité, Secretaría).
- Solo una instancia superior (Comité/Director) puede reactivar manualmente un plazo vencido, dejando registro de la excepción y su justificación.

---

## MÓDULO 11: DASHBOARDS Y VISTAS DEL ESTUDIANTE

### RF-41: Dashboard principal del estudiante
**Prioridad:** Alta | **Actor(es):** Estudiante

El sistema debe mostrar un dashboard con: estado del expediente, horas acumuladas vs. requeridas, documentos pendientes, observaciones activas, barra de progreso del trámite, lista de tareas con fechas límite, notificaciones recientes y accesos rápidos.

**Criterios de aceptación:**
- Debe mantener el mismo patrón visual (cards, chips, tablas) ya implementado en el resto del sistema.
- La barra de progreso refleja el avance real según el estado del expediente (ver estados definidos en el documento de contexto).
- Las tareas pendientes muestran contador de días restantes y se ordenan por urgencia.

---

### RF-42: Vista de detalle del expediente (estudiante)
**Prioridad:** Alta | **Actor(es):** Estudiante

El sistema debe mostrar una vista de detalle del expediente propio, con: datos de empresa/sede/tutor/asesor, línea de tiempo del trámite, documentos asociados, observaciones, evaluaciones, horas acumuladas y estado final.

**Criterios de aceptación:**
- Línea de tiempo (timeline) visual con cada hito del proceso (solicitud, carta de presentación, carta de aceptación, plan aprobado, informes, evaluación, cierre).
- Acceso directo a descargar cada documento generado (carta de presentación, constancia).

---

### RF-43: Vista de gestión documental (estudiante)
**Prioridad:** Alta | **Actor(es):** Estudiante

El sistema debe mostrar la tabla de documentos requeridos con estado visual, opción de carga, visualización de observaciones e historial de versiones (ver RF-22).

**Criterios de aceptación:**
- Cada documento muestra: nombre, estado (chip de color), fecha de última actualización, botón de acción según estado (subir/ver observación/descargar).

---

### RF-44: Vista de notificaciones (estudiante)
**Prioridad:** Media | **Actor(es):** Estudiante

El sistema debe mostrar una pantalla de notificaciones con clasificación por prioridad y estado leída/no leída.

**Criterios de aceptación:**
- Lista ordenada por fecha (más recientes primero).
- Filtro por tipo de evento y por estado.

---

## MÓDULO 12: REPORTES Y EXPORTACIÓN

### RF-45: Reporte consolidado de prácticas
**Prioridad:** Media | **Actor(es):** Director de Escuela, Coordinador

El sistema debe generar un reporte consolidado de prácticas por periodo, con indicadores agregados: expedientes activos, tasa de aprobación, tiempo promedio de trámite, empresas más demandadas.

**Criterios de aceptación:**
- Filtros por periodo académico, tipo de práctica, estado.
- Exportación a PDF, CSV y XML.

---

### RF-46: KPIs del dashboard ejecutivo
**Prioridad:** Media | **Actor(es):** Director de Escuela, Coordinador

El sistema debe calcular y exponer indicadores clave: expedientes activos, tiempo promedio de aprobación, tasa de observaciones por asesor, distribución geográfica de sedes, empresas más demandadas.

**Criterios de aceptación:**
- Los KPIs se recalculan en tiempo real o con frecuencia configurable (ej. cada hora).
- Disponibles vía endpoint API y visualizados en el dashboard ejecutivo (gráficos de barras y circular).

---

## MÓDULO 13: AUDITORÍA Y TRAZABILIDAD

### RF-47: Historial inmutable de acciones
**Prioridad:** Alta | **Actor(es):** Sistema

El sistema debe registrar de forma inmutable toda acción relevante sobre el expediente: cambios de estado, aprobaciones, observaciones, cierres, emisión de documentos.

**Criterios de aceptación:**
- Cada registro incluye: usuario, acción, fecha/hora, IP, entidad afectada.
- El historial no puede ser editado ni eliminado por ningún rol, incluyendo administradores.
- El historial es consultable desde el detalle del expediente (solo lectura).

---

### RF-48: Verificación de integridad documental
**Prioridad:** Media | **Actor(es):** Sistema

El sistema debe garantizar que los documentos generados (Carta de Presentación, Constancia) no puedan ser alterados después de su emisión.

**Criterios de aceptación:**
- Los PDFs generados incluyen código de verificación único (hash o número correlativo).
- Cualquier regeneración de un documento crea una nueva versión, sin sobrescribir la anterior.

---

## RESUMEN DE REQUERIMIENTOS POR MÓDULO

| Módulo | N° de RF | Rango |
|---|---|---|
| Autenticación y usuarios | 4 | RF-01 a RF-04 |
| Empresas, sedes y convenios | 6 | RF-05 a RF-10 |
| Expediente de prácticas | 8 | RF-11 a RF-18 |
| Seguimiento y control de horas | 3 | RF-19 a RF-21 |
| Gestión documental y motor de estados | 5 | RF-22 a RF-26 |
| Informes de práctica (iniciales) | 2 | RF-27 a RF-28 |
| Evaluación y calificación | 5 | RF-29 a RF-33 |
| Comité de prácticas y dictamen | 3 | RF-34 a RF-36 |
| Secretaría académica | 2 | RF-37 a RF-38 |
| Notificaciones y alertas | 2 | RF-39 a RF-40 |
| Dashboards y vistas del estudiante | 4 | RF-41 a RF-44 |
| Reportes y exportación | 2 | RF-45 a RF-46 |
| Auditoría y trazabilidad | 2 | RF-47 a RF-48 |
| **TOTAL** | **48** | RF-01 a RF-48 |

---

*Documento generado a partir de: Reglamento de Prácticas Preprofesionales UNT-Ingeniería Industrial (PP-RG-01.09), RCU N° 0010-2025-UNT, expediente real de prácticas (Castillo García, Nelson Jhoel), y plan de trabajo técnico del sistema SGPP.*
