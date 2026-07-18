# CONTEXTO GENERAL DEL SISTEMA — SGPP
## Sistema de Gestión de Prácticas Preprofesionales
### Escuela de Ingeniería Industrial — Universidad Nacional de Trujillo (UNT)

> Documento de contexto consolidado, elaborado a partir de los documentos base oficiales:
> - Reglamento de Prácticas Preprofesionales — Escuela de Ingeniería Industrial UNT (PP-RG-01.09, Octubre 2021, actualizado)
> - RCU N° 0010-2025-UNT — Lineamientos Generales que Orientan la Implementación, Ejecución y Evaluación de las Prácticas Preprofesionales en la UNT
> - Expediente real de prácticas profesionales (caso: Castillo García, Nelson Jhoel) — Carta de Presentación, Carta de Aceptación, Anexo 1 (Plan de Actividades), Anexo 2 (Evaluación de Prácticas), Constancia de Prácticas, Anexo 4 (Calificación del Expediente)
> - Plan de trabajo técnico del equipo de desarrollo (SGPP)

---

## 1. Naturaleza y objetivo del sistema

El **SGPP (Sistema de Gestión de Prácticas Preprofesionales)** es una plataforma web (backend + frontend) que digitaliza y automatiza todo el ciclo de vida de las prácticas preprofesionales de los estudiantes y egresados de la Escuela de Ingeniería Industrial de la UNT, desde la solicitud inicial hasta el cierre del expediente y la emisión de la constancia final.

El sistema debe reflejar fielmente lo establecido en dos niveles normativos:

1. **Nivel institucional (UNT):** Lineamientos generales aprobados por Consejo Universitario (RCU N° 0010-2025-UNT), aplicables a todas las Escuelas Profesionales.
2. **Nivel específico (Escuela de Ingeniería Industrial):** Reglamento propio de la Escuela (PP-RG-01.09), que detalla el proceso, plazos, formatos y responsables particulares de esta carrera.

Cuando existan diferencias entre ambos niveles, el sistema debe **priorizar el reglamento específico de la Escuela** (por ser más detallado y aplicable directamente), pero dejando parametrizable cualquier regla que pueda variar (horas mínimas, plazos, ciclos, etc.).

---

## 2. Marco legal (base normativa formal)

- Constitución Política del Perú, Art. 18 (Autonomía universitaria)
- Ley Universitaria N° 30220, Art. 46, 82
- Ley N° 28518 — Ley sobre Modalidades Formativas Laborales
- Ley N° 27444 — Ley del Procedimiento Administrativo General
- Decreto Legislativo N° 1401 — Régimen especial de modalidades formativas en el sector público y universidades
- Decreto Supremo N° 083-2019-PCM — Reglamento del D.L. 1401
- Decreto Supremo N° 007-2005-TR — Modalidades Formativas Laborales
- Decreto Supremo N° 003-2008-TR — Modifica el reglamento de Modalidades Formativas Laborales (Derecho e Internado en Ciencias de la Salud)
- Ley N° 31396 — Reconocimiento de las prácticas como experiencia laboral válida
- Ley N° 31520 — Restablece la autonomía e institucionalidad de universidades públicas
- Estatuto de la UNT
- RCU N° 0010-2025-UNT (06 de enero de 2025) — Aprueba lineamientos generales de prácticas preprofesionales

---

## 3. Definición y fines de las prácticas preprofesionales

**Definición:** Actividades que el estudiante o egresado desarrolla en empresas o instituciones públicas, privadas o mixtas, que permiten validar y complementar los conocimientos teóricos con la actividad práctica, aplicando habilidades y herramientas de ingeniería industrial con ética, conciencia social y compromiso.

**Fines:**
- Evidenciar conocimientos, habilidades y aptitudes en situaciones reales de trabajo.
- Articular y aplicar competencias adquiridas durante la formación profesional (estudios generales, específicos y de especialidad).
- Facilitar la inserción laboral del egresado y mejorar su empleabilidad.

**Según lineamientos UNT 2025:**
- Son experiencias directas de iniciación en un campo profesional.
- Se desarrollan obligatoriamente en los dos últimos semestres académicos, en el último año de formación, o máximo hasta un semestre/año después de egresar.
- Son eminentemente activas, vivenciales y de consolidación de competencias.
- Por defecto son **extracurriculares** (no sujetas a créditos), salvo que la Escuela las declare **curriculares** (con créditos y tutor docente permanente).
- El promedio razonable de horas es de **320 horas o 10 créditos académicos**, salvo programas con normativa específica distinta (como es el caso de Ingeniería Industrial, con 360 horas).

---

## 4. Niveles / Tipos de práctica (CLAVE PARA EL SISTEMA)

El sistema debe modelar **dos tipos oficiales** de práctica (no tres). No existe normativamente una categoría "Intermedia"; si el sistema la contempla, debe revisarse su origen y justificación, o eliminarla.

### 4.1 Prácticas Preprofesionales Iniciales
- Se realizan en el **VIII ciclo** de estudios.
- Se desarrollan dentro del lapso del semestre académico (son de naturaleza curricular).
- Valor: **2 créditos académicos** (4 horas semanales).
- Duración: **64 horas efectivas** (1 crédito = 32 horas de trabajo lectivo).
- Requiere asesor/tutor docente designado.
- Evaluación: sistema vigesimal (0-20), por unidades.

### 4.2 Prácticas Preprofesionales Finales / Prácticas Profesionales
- **Finales:** se realizan en IX o X ciclo de estudios.
- **Profesionales:** se realizan una vez concluida la carrera (condición de egresado).
- Son de naturaleza extracurricular.
- Jornada mínima: **6 horas diarias o 30 horas semanales**.
- Duración mínima: **360 horas efectivas, distribuidas en 3 meses** (regla específica de Ingeniería Industrial; los lineamientos UNT generales mencionan 320 horas como referencia general, por lo que debe primar la norma específica de la Escuela: 360 horas).

> **Nota de consistencia normativa:** Los lineamientos UNT 2025 indican que para matricularse en prácticas preprofesionales el estudiante debe haber aprobado los cursos hasta el **noveno ciclo**; el reglamento específico de Ingeniería Industrial indica **hasta el octavo ciclo** para prácticas finales. El sistema debe manejar esta regla como **configurable por Escuela/periodo normativo vigente**, evitando hardcodear un solo valor.

---

## 5. Actores y roles del sistema

| Rol | Función principal según normativa |
|---|---|
| **Estudiante / Egresado** | Solicita, gestiona y ejecuta su expediente de prácticas; carga documentos, planes e informes. |
| **Director de Escuela de Ingeniería Industrial** | Autoridad máxima del proceso a nivel Escuela; emite/firma la Carta de Presentación; recibe informes finales de asesores; supervisa el cumplimiento. |
| **Comité de Prácticas Preprofesionales** | Nombrado por el Consejo de Facultad a propuesta del Director de Escuela; integrado por docentes ordinarios asesores de prácticas; define lineamientos específicos, aprueba planes (para finales/profesionales), evalúa informes finales, mantiene actualizado el registro de instituciones ofertantes. |
| **Presidente del Comité de Prácticas** | Docente ordinario con mayor categoría y antigüedad entre los asesores; recibe reportes de los asesores. |
| **Asesor / Tutor de Prácticas (docente)** | Docente nombrado o contratado, responsable de orientación, seguimiento, supervisión, evaluación y calificación (vigesimal) de los practicantes en prácticas iniciales; registra notas en el Sistema Universitario Virtual (SUV); registra asistencia y avance. |
| **Secretaría / instancia administrativa** | Revisa la solicitud y valida requisitos administrativos del expediente (matrícula, documentos), dejándolo apto para la emisión de la Carta de Presentación. (Rol administrativo de soporte, distinto de quien emite/firma el documento). |
| **Tutor/Asesor de la empresa o institución receptora** | Designado formalmente por la entidad receptora; orienta y evalúa el desempeño del practicante mediante el formato institucional (Anexo 2); firma la constancia y la carta de aceptación. |
| **Docente Coordinador de Prácticas (nivel UNT general)** | Según lineamientos generales: propone el reglamento específico, gestiona convenios, monitorea ejecución, recibe informes, eleva el reporte consolidado a Dirección de Escuela para la emisión de constancias. |

---

## 6. Documentos y formatos oficiales del proceso

### 6.1 Documentos de gestión (elaborados por el Comité de Prácticas)
- **Formato de perfil de sedes de prácticas preprofesionales** — código FM01.03.02.01-DDA/PG-016
- **Formato de registro de validación del formato de sedes** — código FM01.03.02.01-DDA/PG-017
- **Formato de monitoreo de prácticas preprofesionales** — código FM01.03.02.01-DDA/PG-018

### 6.2 Documentos del expediente del estudiante (evidenciados en caso real)
1. **Formato Único de Trámite (F.U.T.)** — solicitud administrativa inicial ante Mesa de Partes, incluye tipo de solicitud (p. ej. "Carta de Presentación Pre-profesionales" o "Carta de Presentación Profesionales"), datos del solicitante, folios adjuntos.
2. **Carta de Presentación** (numerada, ej. N° 083-2025-EPIIndustrial) — emitida y firmada por el **Director de la Escuela Profesional de Ingeniería Industrial**, dirigida al representante de la empresa, presentando formalmente al estudiante/egresado. Incluye: datos del practicante, tipo de práctica, empresa destino, base legal (Ley 28518), horas mínimas requeridas (360 h), duración recomendada (3 meses).
3. **Carta de Aceptación** — emitida por la empresa receptora (representante de RR.HH. o similar), confirmando el periodo de prácticas, área asignada, horario y condiciones.
4. **Anexo 1 — Plan de Actividades de Prácticas Profesionales**, con las secciones:
   - Datos del practicante (nombre, N° de matrícula, fecha de inicio)
   - Datos de la empresa/institución receptora (razón social, dirección, teléfono, email, funcionario encargado, representante legal)
   - Área o departamento asignado y funcionario a cargo
   - Objetivos o logros previstos
   - Principales actividades esperadas con duración estimada (en semanas)
   - Técnicas y/o procedimientos de Ingeniería Industrial que se esperan aplicar
   - Firma del practicante y Vº Bº del funcionario a cargo
5. **Anexo 2 — Evaluación de Prácticas Pre-Profesionales** (evaluación de desempeño por la empresa), con estructura:
   - Datos del practicante y fechas de inicio/culminación
   - Datos de la empresa/institución y del funcionario evaluador
   - Escala de evaluación: **1 a 5** por criterio (1 = peor desempeño, 5 = mejor desempeño)
   - **A. Aspectos Actitudinales** (4 criterios x 5 pts c/u): asistencia y puntualidad; responsabilidad; esfuerzo y empeño; respeto y colaboración con superiores
   - **B. Aspectos Cognitivos** (2 criterios x 4 pts c/u): cultura y conocimientos generales; conocimientos técnicos de Ingeniería Industrial
   - **C. Aspectos de Proyección y Desarrollo Profesional** (4 criterios x 4 pts c/u): creatividad e ingenio; interacción con personas; fluidez en comunicación verbal y escrita; grado de aprendizaje y asimilación
   - Firma y sello del funcionario evaluador
6. **Constancia de Prácticas Profesionales** — documento emitido por la empresa certificando el periodo real de prácticas, área y datos del practicante, firmado por el representante autorizado (puede incluir firma digital certificada).
7. **Anexo 4 — Calificación del Expediente de Prácticas** (evaluación consolidada a cargo del Comité), con estructura de puntaje sobre 100:
   - **1. Plan de Prácticas (Anexo 1):** máximo 10 pts — criterio: consistencia entre objetivos, actividades y fundamento teórico.
   - **2. Evaluación a cargo de la empresa (Anexo 2):** máximo 50 pts, desagregado en:
     - Aspectos actitudinales: 20 pts
     - Aspectos cognitivos: 10 pts
     - Proyección profesional: 20 pts
   - **3. Evaluación del informe de prácticas:** máximo 40 pts, desagregado en:
     - Aplicación coherente y ordenada de esquemas metodológicos: 20 pts
     - Adecuada aplicación de técnicas de Ingeniería Industrial: 10 pts
     - Presentación y redacción: 10 pts
   - **Total: 100 puntos**
   - Firmado con dictamen por Presidente de Comisión y Miembros de Comisión.

> **Importante:** El Anexo 2 (evaluación de empresa, escala 1-5) y el Anexo 4 (calificación consolidada del expediente, escala 0-100) son **instrumentos distintos y complementarios**. El sistema debe soportar ambos como entidades/formularios separados, no como un solo modelo genérico de evaluación.

### 6.3 Otros documentos mencionados en el reglamento
- **Carta de aceptación de la empresa o institución destino** (requisito de ingreso al proceso)
- **Plan General de Prácticas** (presentado al asesor en iniciales; a Dirección de Escuela en finales/profesionales)
- **Informe de Práctica por fase — Formato PP-03**
- **Constancia de prácticas** otorgada por la institución destino
- **Ficha de Evaluación de desempeño** emitida por la empresa (solo prácticas finales/profesionales)
- **Informe Final de Prácticas** (estructura definida en el Art. 36 del reglamento, ver sección 9)

---

## 7. Estructura organizativa del proceso (Escuela de Ingeniería Industrial)

```
Director de Escuela de Ingeniería Industrial
        │
        ├── Comité de Prácticas Preprofesionales
        │        (docentes ordinarios asesores de prácticas)
        │        Presidencia: docente de mayor categoría/antigüedad
        │
        └── Asesores o Tutores de Práctica
                 (a nivel de curso, para prácticas iniciales)
```

**Funciones del Comité de Prácticas:**
- Establece lineamientos específicos para planificar, organizar, ejecutar y evaluar las prácticas.
- Elabora, en coordinación con el Director de Escuela y el Director de Departamento Académico, los formatos de gestión (perfil de sede, validación de sede, monitoreo).
- Mantiene actualizado el registro de instituciones ofertantes.
- Aprueba y autoriza el Plan de Prácticas (finales/profesionales).
- Evalúa los informes finales de prácticas (iniciales, finales y profesionales).
- Emite dictamen final mediante Anexo 4.

**Funciones del Asesor/Tutor de Práctica:**
- Responsable del registro, orientación, seguimiento y supervisión del practicante.
- Evalúa y cualifica al practicante, coordinando con la institución receptora.
- Registra calificativos en el SUV (sistema vigesimal, 0-20, nota mínima aprobatoria 14 en ese contexto de asesor —ver diferencia con nota de curso en sección 9).
- Informa al Presidente del Comité sobre el desarrollo de las prácticas.
- Orienta en la elaboración del Plan de Prácticas y da visto bueno al informe final.
- Registra asistencia y avance del estudiante.

---

## 8. Requisitos de acceso al proceso

### 8.1 Para Prácticas Iniciales
a. Registrar matrícula en el curso de Prácticas Preprofesionales.
b. Carta de aceptación de la empresa/institución destino.
c. Presentar el Plan General de Prácticas al docente asesor.
d. Presentar y aprobar el Informe de Práctica en cada fase (Formato PP-03).
e. Presentar constancia de prácticas otorgada por la institución destino.
f. Haber aprobado los prerrequisitos según el plan de estudios 2018 (Art. 13).

### 8.2 Para Prácticas Finales o Prácticas Profesionales
a. Tener aprobadas las Prácticas Preprofesionales Iniciales.
b. Evidenciar la carta de aceptación de la empresa/institución destino.
c. Presentar el Plan General de Prácticas a la Dirección de Escuela.
d. Presentar y aprobar el Informe de Práctica en cada fase (Formato PP-03).
e. Presentar constancia de prácticas otorgada por la institución destino.
f. Ficha de Evaluación de desempeño emitida por la empresa/institución destino.
g. Haber concluido satisfactoriamente los cursos hasta el octavo ciclo (o tener condición de egresado, para Prácticas Profesionales).

> Nota de consistencia: los lineamientos UNT 2025 exigen cursos aprobados hasta el noveno ciclo para matricularse en prácticas preprofesionales; debe tratarse como regla configurable (ver sección 4).

---

## 9. Flujo detallado del proceso (por tipo de práctica)

### 9.1 Flujo — Prácticas Iniciales
1. Estudiante matriculado en el curso, cumpliendo prerrequisitos (plan de estudios 2018).
2. Estudiante presenta el **Plan de Prácticas** al docente asesor dentro de los **15 primeros días** de iniciado el ciclo.
3. Asesor aprueba el plan (o del Comité, según corresponda).
4. Ejecución de prácticas: duración **64 horas efectivas (2 créditos)**.
5. Estudiante presenta **tres informes**:
   - Informe parcial en la **semana 5**
   - Informe parcial en la **semana 10**
   - Informe final en la **semana 15**
6. Asesor evalúa cada informe parcial (calificación vigesimal, con correcciones si corresponde).
7. Informe final evaluado y verificado por el asesor, quien da conformidad con su firma en la carátula (sin visado del asesor, el informe no se evalúa).
8. Docente asesor realiza supervisión inopinada y control de calidad durante la ejecución.
9. Calificación final del curso: promedio simple de tres unidades (Plan 20% + Informe parcial 80% en primera unidad; informe parcial en segunda unidad; informe final en tercera unidad).
10. Nota mínima aprobatoria del curso: **13.5** (promedio final).
11. Si desaprueba, derecho a **Examen de Aplazados** (revisión de informe corregido) en la **semana 17**.

### 9.2 Flujo — Prácticas Finales / Profesionales
1. Estudiante recibe su **Carta de Presentación** (emitida/firmada por el Director de Escuela).
2. Estudiante presenta el **Plan de Prácticas** a la Dirección de Escuela dentro de **15 días** desde la recepción de la Carta de Presentación.
3. Plan presentado en físico y/o subido al Drive/sistema indicado por Dirección de Escuela.
4. El Comité de Prácticas revisa, analiza, aprueba y autoriza el plan.
5. Si hay observaciones al plan: plazo máximo de **7 días calendario** para levantarlas (desde la entrega de observaciones).
6. Estudiante ejecuta la práctica cumpliendo normas de la institución receptora y aceptando al tutor asignado por ella.
7. Duración mínima: **360 horas efectivas en 3 meses**.
8. Al finalizar, se presentan: informe final del practicante + informe/ficha de desempeño de la empresa (Anexo 2) + evaluación del Comité (Anexo 4).
9. Si hay observaciones a los documentos presentados: plazo de **10 días calendario** para levantarlas.
10. El Comité evalúa el informe final (Art. 40); si no se presenta informe final, la nota es **00**.
11. Se emite la **constancia** que certifica la culminación de las prácticas.

---

## 10. Estructura y formalidades documentales exigidas

### 10.1 Estructura del Plan General de Prácticas (Art. 28)
a. Carátula (logotipo, universidad, facultad, escuela, curso, nombre del plan, autor, asesor, fecha)
b. Datos de la empresa (razón social, dirección, representante legal, teléfono, correo, celular, descripción general)
c. Situación problemática (descripción de problemas, selección del problema)
d. Objetivos de la práctica (general y específicos)
e. Técnicas y/o procedimientos de Ingeniería Industrial a aplicar
f. Cronograma de trabajo (alineado a objetivos específicos y plazos reglamentarios)

### 10.2 Formato del Informe Final (Art. 35)
- Papel A-4, digitado a espacio y medio.
- Márgenes: izquierdo, superior e inferior 3.5 cm; derecho 3 cm.
- Tipo y tamaño de letra: **Times New Roman 12**.
- Acompañado de esquemas con fuente citada.
- Citas y referencias bibliográficas según **normas APA** (6ta edición para referencias).

### 10.3 Estructura mínima del Informe Final (Art. 36)
a. Carátula
b. Índice general, de tablas, de figuras
c. Introducción
- **Capítulo I: Justificación** — Importancia de la práctica para la empresa; objetivos general y específicos
- **Capítulo II: Marco Teórico y Técnicas y/o Procedimientos** — marco conceptual; técnicas/procedimientos aplicados
- **Capítulo III: Resultados** — aplicación de técnicas/procedimientos de Ingeniería Industrial
- **Capítulo IV: Conclusiones y Recomendaciones**
- **Capítulo V: Referencias Bibliográficas** (norma APA 6)
- Anexos y Apéndices

---

## 11. Reglas de evaluación y calificación

### 11.1 Prácticas Iniciales (modalidad curricular)
- Escala **vigesimal (0-20)**.
- Unidad 1: Plan de Práctica (20%) + Informe Parcial (80%)
- Unidad 2: Informe Parcial
- Unidad 3: Informe Final
- Promedio final = promedio simple de las tres unidades.
- **Nota mínima aprobatoria: 13.5**
- Examen de Aplazados disponible en semana 17 (revisión del informe corregido).
- Nota mínima aprobatoria referida por el asesor (Art. 10.d): **14** (contexto de registro de calificativos por el asesor en el SUV — puede interpretarse como estándar general de la universidad; debe verificarse y resolverse esta aparente diferencia con el 13.5 del curso como configuración a nivel de reglamento del curso vs. estándar general SUV).

### 11.2 Prácticas Finales / Profesionales
- Evaluación a cargo del **Comité de Prácticas**, sobre el informe final.
- Instrumentos:
  - **Anexo 2** (evaluación de la empresa): escala 1-5 por criterio, en 3 categorías (actitudinal 20 pts, cognitivo 10 pts, proyección profesional 20 pts) = 50 pts
  - **Anexo 4** (calificación consolidada del expediente): 100 pts totales
    - Plan de Prácticas: 10 pts
    - Evaluación de empresa: 50 pts
    - Evaluación del informe: 40 pts
- Si no se presenta el informe final: nota **00**.
- Dictamen firmado por Presidente y Miembros de la Comisión.

### 11.3 Según lineamientos UNT 2025 (regla general complementaria)
- Si la práctica es **curricular**: evaluación vigesimal, sin exámenes sustitutorios ni de aplazados; responsabilidad del docente coordinador.
- Si la práctica es **extracurricular**: evaluación **cualitativa** (logrado / en proceso / no logrado); el informe es firmado por el asesor/tutor de la entidad receptora.

> **Regla de negocio clave para el sistema:** El tipo de evaluación (vigesimal vs. cualitativa, y con qué instrumentos) depende de si la práctica es **curricular o extracurricular**, y del **tipo de práctica** (inicial vs. final/profesional). Esto debe ser parametrizable, no fijo.

---

## 12. Plazos normativos críticos (a implementar como reglas de negocio)

| Evento | Plazo | Aplica a |
|---|---|---|
| Presentación del Plan de Prácticas (iniciales) | 15 días desde inicio del ciclo | Prácticas Iniciales |
| Presentación del Plan de Prácticas (finales/profesionales) | 15 días desde recepción de la Carta de Presentación | Finales/Profesionales |
| Levantamiento de observaciones al Plan | 7 días calendario desde entrega de observaciones | Finales/Profesionales |
| Levantamiento de observaciones a documentos presentados | 10 días calendario | Finales/Profesionales |
| Informe parcial 1 | Semana 5 del semestre | Prácticas Iniciales |
| Informe parcial 2 | Semana 10 del semestre | Prácticas Iniciales |
| Informe final | Semana 15 del semestre | Prácticas Iniciales |
| Examen de Aplazados | Semana 17 del semestre | Prácticas Iniciales |
| Duración mínima de ejecución | 64 horas (2 créditos) | Prácticas Iniciales |
| Duración mínima de ejecución | 360 horas / 3 meses | Finales/Profesionales |

---

## 13. Diferencia clave: Carta de Presentación vs. Carta de Aceptación

| Documento | Emisor | Función |
|---|---|---|
| **Carta de Presentación** | Director de la Escuela de Ingeniería Industrial (UNT) | La universidad presenta formalmente al estudiante/egresado ante la empresa receptora, indicando tipo de práctica, base legal y horas mínimas requeridas. |
| **Carta de Aceptación** | Representante de la empresa/institución receptora | La empresa confirma oficialmente que acepta al estudiante, especificando periodo, área y condiciones de la práctica. |

Ambos documentos son consecutivos: primero se emite la Carta de Presentación (paso institucional), y luego, con base en ella, la empresa responde con la Carta de Aceptación (paso empresarial). El sistema debe modelarlos como **dos entidades documentales distintas y secuenciales**, no como un solo documento.

---

## 14. Flujo administrativo de inicio de trámite (visión desde el estudiante)

1. **Estudiante:** Inicia la solicitud de prácticas, selecciona el tipo de práctica (Inicial o Final/Profesional) y registra/selecciona la empresa y sede donde desea realizarlas.
2. **Secretaría / instancia administrativa:** Revisa la solicitud, valida los requisitos administrativos (matrícula, ciclo, documentos) y deja el expediente marcado como "listo para emisión".
3. **Director de Escuela:** Revisa el expediente validado y emite/firma la Carta de Presentación oficial dirigida a la empresa.
4. **Estudiante:** Recibe la Carta de Presentación, la entrega/gestiona con la empresa, y posteriormente sube al sistema la Carta de Aceptación firmada por la empresa receptora.
5. A partir de aquí, el estudiante continúa con la presentación del Plan de Prácticas (al asesor si es inicial; a Dirección de Escuela si es final/profesional).

---

## 15. Responsabilidades a nivel institucional general (UNT)

Según lineamientos UNT 2025, el **docente coordinador de prácticas preprofesionales** (o Comité, si se conforma) debe:

a. Proponer el Reglamento específico de prácticas, alineado a los lineamientos generales.
b. Gestionar la firma de convenios entre la UNT y empresas/instituciones.
c. Monitorear la ejecución de las prácticas de cada estudiante; coordinar y acopiar informes de asesores.
d. Recibir los informes de práctica refrendados por la institución receptora y, si corresponde, por los asesores (quienes registran las notas).
e. Elevar el reporte consolidado a la Dirección de Escuela para la emisión de la constancia.
f. El asesor/tutor académico es responsable de subir las notas al sistema correspondiente (si la práctica es curricular).

**Condiciones de ejecución (lineamientos UNT 2025):**
- Las prácticas solo pueden ejecutarse en instituciones/empresas con **convenio** con la UNT, o con **acuerdo preliminar mínimo a nivel de Decanato**.
- La entidad receptora debe haber designado formalmente uno o más asesores/tutores.
- Pueden desarrollarse hasta en **tres contextos o ámbitos de desempeño laboral (rotaciones)**, si están relacionados con la formación profesional.
- El periodo mínimo debe ser similar a un semestre académico y máximo de dos semestres.
- Programas de ciencias de la salud (Medicina, Estomatología, Enfermería, Farmacia y Bioquímica, Biología, Microbiología y Parasitología) tienen tratamiento distinto (modalidad de internado), no aplicable a Ingeniería Industrial.
- Llevar y aprobar las prácticas preprofesionales es **requisito indispensable** para la condición de egresado, la obtención de certificados de estudios concluidos y el inicio de trámites de Bachiller.

---

## 16. Estados sugeridos del expediente (para modelado en el sistema)

Con base en todo el flujo descrito, el expediente de un estudiante debería transitar (al menos) por los siguientes estados:

1. `SOLICITUD_REGISTRADA`
2. `EN_REVISION_ADMINISTRATIVA` (Secretaría)
3. `APTA_PARA_CARTA_PRESENTACION`
4. `CARTA_PRESENTACION_EMITIDA`
5. `CARTA_ACEPTACION_CARGADA`
6. `PLAN_PENDIENTE`
7. `PLAN_EN_REVISION`
8. `PLAN_OBSERVADO`
9. `PLAN_APROBADO`
10. `PRACTICA_EN_EJECUCION`
11. `INFORME_PARCIAL_PENDIENTE` / `EN_REVISION` / `OBSERVADO` / `APROBADO` (repetible según fase)
12. `INFORME_FINAL_PENDIENTE` / `EN_REVISION` / `OBSERVADO` / `APROBADO`
13. `EVALUACION_EMPRESA_PENDIENTE` / `REGISTRADA` (solo finales/profesionales)
14. `EVALUACION_COMITE_PENDIENTE` / `REGISTRADA`
15. `EXPEDIENTE_CERRADO`
16. `CONSTANCIA_EMITIDA`

Cada transición debe quedar registrada con **historial inmutable** (usuario, acción, fecha), especialmente relevante para observaciones, aprobaciones y plazos vencidos.

---

## 17. Consideraciones de consistencia normativa detectadas (para resolución técnica)

| Tema | Reglamento Escuela Ing. Industrial | Lineamientos UNT 2025 | Recomendación |
|---|---|---|---|
| Horas mínimas (finales/profesionales) | 360 horas / 3 meses | ~320 horas (referencia general) | Priorizar 360 h (norma específica); parametrizable |
| Ciclo mínimo aprobado para prácticas finales | Hasta 8vo ciclo | Hasta 9no ciclo (matrícula general) | Parametrizable por Escuela/periodo vigente |
| Tipo de evaluación | Vigesimal (iniciales) / Anexos 2 y 4 (finales) | Vigesimal (curricular) / Cualitativa (extracurricular) | Definir explícitamente si cada tipo de práctica es curricular o extracurricular |
| Responsable de emisión de constancia | Director de Escuela (implícito) | Elevada por coordinador, emitida por Dirección de Escuela | Mantener a Dirección de Escuela como emisor final |
| Nota mínima aprobatoria | 13.5 (promedio del curso) / 14 (mención del asesor, Art. 10.d) | No especifica | Verificar y unificar; documentar cuál aplica y en qué contexto |

---

## 18. Resumen ejecutivo para el equipo de desarrollo

El sistema **SGPP** debe modelar, como mínimo, las siguientes entidades centrales:

- **Usuario** (con roles: Estudiante, Docente Asesor, Tutor Externo, Secretaría, Comité, Director de Escuela, Coordinador)
- **Expediente de Práctica** (entidad central: estudiante, tipo de práctica, empresa, sede, asesor, tutor externo, estado, historial)
- **Empresa / Sede / Convenio**
- **Documento** (tipado: Carta de Presentación, Carta de Aceptación, Plan de Prácticas, Informe Parcial, Informe Final, Constancia, Ficha de Evaluación)
- **Observación** (documento, plazo, estado, historial)
- **Evaluación** (con subtipos: Evaluación de Empresa [Anexo 2], Evaluación de Plan/Informe [Anexo 4], Nota por Unidad [curso inicial])
- **Notificación**
- **Reporte / Constancia**

El flujo del **estudiante** debe reflejar fielmente las etapas: solicitud → validación administrativa → Carta de Presentación → Carta de Aceptación → Plan → ejecución con seguimiento de horas → informes por fase → evaluaciones (empresa + comité/asesor) → cierre de expediente → constancia final; diferenciando siempre si la práctica es **Inicial** o **Final/Profesional**, ya que las reglas, documentos, responsables, plazos y forma de evaluación cambian sustancialmente entre ambas.

---

*Documento generado a partir de: Reglamento de Prácticas Preprofesionales UNT-Ingeniería Industrial (PP-RG-01.09), RCU N° 0010-2025-UNT, expediente real de prácticas (Castillo García, Nelson Jhoel), y plan de trabajo técnico del sistema SGPP.*
