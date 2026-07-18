# Plan de Pruebas E2E - SGPP UNT

Guía de validación funcional para el ciclo completo de prácticas preprofesionales. Cada ítem debe ejecutarse con usuarios distintos y registrar el resultado en la matriz final.

## 1. Requisitos Previos

- [ ] Frontend disponible en `http://localhost:5173`.
- [ ] Backend disponible en `http://localhost:8082/api/v1`.
- [ ] Swagger disponible en `http://localhost:8082/api/v1/swagger-ui/index.html`.
- [ ] PostgreSQL disponible en `localhost:5434`.
- [ ] La base contiene usuarios, empresa, sede, convenio y tipos de práctica activos.
- [ ] No reutilizar un expediente cerrado para otra prueba; crear uno por escenario.

## 2. Usuarios de Prueba

Crear o verificar cuentas activas para los siguientes roles:

- [ ] `ESTUDIANTE`: estudiante titular del expediente.
- [ ] `SECRETARIA`: validación administrativa, asignación de asesor inicial e inicio de ejecución cuando corresponda.
- [ ] `DOCENTE_ASESOR`: revisión documental y evaluación de práctica inicial asignada.
- [ ] `TUTOR_EXTERNO`: evaluación empresarial de práctica final o profesional.
- [ ] `COMITE_PRACTICAS`: revisión, aprobación de plan/informe y dictamen de práctica final o profesional asignada.
- [ ] `COORDINADOR` o `DIRECTOR`: emisión de Carta de Presentación y Constancia de Prácticas.
- [ ] `ADMIN_SISTEMA`: administración institucional y consulta global.

Credenciales locales iniciales, si se cargaron las migraciones de seed: usuario `estudiante1`, contraseña `password123`. Usar el nombre de usuario para la prueba de autenticación actual.

## 3. Configuración Base

- [ ] Registrar y validar una empresa con RUC único.
- [ ] Registrar una sede activa asociada a la empresa.
- [ ] Registrar un convenio vigente asociado a la empresa, cuando aplique.
- [ ] Verificar que la sede aparezca como elegible para el estudiante.

## 4. Flujo Completo de una Práctica (Paso a Paso)

### 4.1 Inicio Común

- [x] **Estudiante**: Desde `Solicitar Práctica`, solicita una práctica `INICIAL`, `FINAL` o `PROFESIONAL`; selecciona empresa y sede elegibles. No existe el tipo "Intermedia".
- [x] **Secretaría**: Desde Recepción Administrativa valida requisitos y deja el expediente en `VALIDADO_SECRETARIA`.
- [x] **Director/Coordinador**: Desde el detalle del expediente emite la Carta de Presentación. El estado debe ser `CARTA_PRESENTACION_EMITIDA`.
- [x] **Estudiante**: Desde `Documentos y Plan de Prácticas`, descarga la Carta de Presentación y carga la Carta de Aceptación PDF firmada por la empresa. El estado debe pasar a `CARTA_ACEPTACION_PRESENTADA`.

### 4.2 Asignación Previa al Plan

- [ ] **Práctica Inicial - Secretaría/Coordinación**: Asigna un `DOCENTE_ASESOR`. El estado debe ser `ASESOR_ASIGNADO`.
- [ ] **Práctica Final o Profesional - Comité/Coordinación**: Asigna los integrantes activos del comité. El estado debe ser `COMITE_ASIGNADO`.
- [ ] **Verificación estudiante**: Antes de la asignación, el Plan muestra “Disponible en la etapa correspondiente”. Después de la asignación aparece el botón `Subir`.

### 4.3 Plan de Prácticas

- [ ] **Estudiante**: En `Documentos y Plan de Prácticas`, sección `Documentos obligatorios`, carga el PDF `Plan de Prácticas (Anexo 1)`, máximo 5 MB. El sistema usa PDF como formato oficial actual; no hay formulario estructurado habilitado en la interfaz.
- [ ] **Sistema**: Registra el documento y deja el expediente en `PLAN_PRESENTADO`.
- [ ] **Docente Asesor (Inicial) o Comité (Final/Profesional)**: Inicia revisión y registra una observación de prueba con comentario obligatorio.
- [ ] **Estudiante**: Lee la observación, elimina la versión no aprobada y carga la versión corregida del Plan.
- [ ] **Docente Asesor (Inicial) o Comité (Final/Profesional)**: Aprueba el Plan. El estado debe ser `PLAN_APROBADO`.

### 4.4 Ejecución y Seguimiento

- [ ] **Secretaría o Coordinación**: Inicia ejecución indicando fecha de inicio y duración. El estado debe ser `EN_EJECUCION` y el control de horas debe crearse automáticamente.
- [ ] **Estudiante**: Desde `Registro de Horas`, registra actividades propias, con fecha no futura y máximo 24 horas por registro.
- [ ] **Tutor Externo o rol autorizado**: Valida los registros de horas requeridos para el acumulado.
- [ ] **Práctica Inicial - Estudiante**: Desde `Informes`, presenta Informe Parcial 1, Informe Parcial 2 e Informe Final Inicial según el cronograma.
- [ ] **Práctica Final o Profesional - Estudiante**: Desde `Informes`, presenta el Informe Final y carga Constancia de Empresa y Ficha de Evaluación cuando corresponda.
- [ ] **Responsable revisor**: Revisa y aprueba los informes presentados según la asignación del expediente.

### 4.5 Evaluación, Dictamen y Constancia

- [ ] **Práctica Inicial - Docente Asesor**: Registra la evaluación/calificación del estudiante asignado.
- [ ] **Práctica Final o Profesional - Tutor Externo**: Registra la evaluación empresarial (Anexo 2) solo para un expediente habilitado y asignado.
- [ ] **Comité/Coordinación**: Verifica informe, evaluaciones y horas; emite el Dictamen Final cuando el estado lo permita.
- [ ] **Director/Coordinador**: Emite la Constancia de Prácticas. El sistema valida horas, calificación, documentos de empresa y dictamen; cierra el expediente y después genera `CONSTANCIA_CULMINACION`.
- [ ] **Estudiante**: Descarga la Constancia de Prácticas desde `Documentos y Plan de Prácticas` y verifica que recibe un PDF.

## 5. Verificación de Reglas Normativas

Durante la ejecución del flujo anterior, se deben validar las siguientes reglas de negocio duras:

- [ ] **Plan habilitado por asignación**: El estudiante no puede cargar el Plan antes de `ASESOR_ASIGNADO` o `COMITE_ASIGNADO`.
- [ ] **Plazos de Subsanación**: El estudiante dispone de hasta *7 días* para levantar observaciones del plan, y *10 días* para observaciones en informes.
- [ ] **Horas Mínimas Obligatorias**: El sistema impide la emisión de la constancia si el acumulado de horas registradas es menor al mínimo normativo (ej. 64h en Iniciales / 360h en Profesionales).
- [ ] **Descarga documental**: Un estudiante puede descargar solo documentos vinculados a su expediente y recibe `403`/`404` al intentar acceder a documentos ajenos.
- [ ] **Bloqueos Automáticos**: Al forzar/simular que se vence un plazo en la base de datos, el estudiante ve el bloqueo pertinente en la UI y no puede enviar documentos a destiempo sin autorización.

## 6. Verificación de Accesos por Rol (Seguridad)

- [ ] **Estudiante**: No ve botones de administración, no puede acceder a las URL de `/admin`, no puede consultar IDs de expedientes ajenos y solo puede registrar horas de su propio expediente en ejecución.
- [ ] **Docente Asesor**: En "Mis Practicantes" *únicamente* aparecen los alumnos asignados a su carga.
- [ ] **Tutor Externo**: Solo visualiza perfiles de alumnos que están evaluando en su sede específica.
- [ ] **Protección Endpoints**: Intenta consumir mediante Postman o manipulando el token un endpoint restringido (ej. crear usuarios sin ser ADMIN) y recibe un status `403 Forbidden`.

---

## 7. Registro de Resultados

*Usa esta matriz para evidenciar las rondas de pruebas. Marca el estado como: ✅ (Funcionó), ❌ (Falló), o ⚠️ (Observación menor).*

| ID  | Paso / Escenario | Rol Ejecutor | Estado | Observaciones / Bugs Encontrados |
| --- | ---------------- | ------------ | :----: | -------------------------------- |
| 1   | Creación usuario Estudiante | Admin Sistema | | |
| 2   | Creación usuario Docente Asesor | Admin Sistema | | |
| 3   | Creación usuario Tutor Externo | Admin Sistema | | |
| 4   | Creación roles administrativos | Admin Sistema | | |
| 5   | Alta de Empresa y Sede | Secretaría | | |
| 6   | Alta y vinculación de Convenio | Secretaría | | |
| 7   | Solicitud de trámite por tipo de práctica | Estudiante | | |
| 8   | Validación administrativa y marcado "listo para carta" | Secretaría | | |
| 8b  | Emisión y firma de Carta de Presentación | Director de Escuela | | |
| 9   | Subida Carta de Aceptación | Estudiante | | |
| 10  | Asignación de asesor o comité | Secretaría / Coordinación / Comité | | |
| 11  | Presentación del Plan de Prácticas PDF | Estudiante | | |
| 12  | Observación generada al Plan | Asesor / Comité | | |
| 13  | Levantamiento de observación | Estudiante | | |
| 14  | Aprobación del Plan | Asesor / Comité | | |
| 15  | Inicio de ejecución y creación de control de horas | Secretaría / Coordinación | | |
| 16  | Registro y validación de horas | Estudiante / Tutor | | |
| 17  | Presentación de informes aplicables | Estudiante | | |
| 18  | Evaluación docente o empresarial | Asesor / Tutor Externo | | |
| 19  | Dictamen final | Comité / Coordinación | | |
| 20  | Emisión de constancia y cierre | Dirección / Coordinación | | |
| 21  | Descarga autorizada de carta y constancia | Estudiante | | |
| 22  | Test de restricciones de horas, documentos y roles | QA / Todos | | |
| 23  | Test de plazos y bloqueos | Sistema | | |

*Fin del documento.*
