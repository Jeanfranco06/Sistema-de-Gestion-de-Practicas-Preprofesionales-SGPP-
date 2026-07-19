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
- [ ] Verificar que existan integrantes activos del comité. La migración local deja un comité demo vigente para las pruebas.

## 4. Flujo Completo de una Práctica (Paso a Paso)

### 4.1 Inicio Común

- [x] **Estudiante - crear solicitud**:
  - Iniciar sesión y abrir `Solicitar Práctica`.
  - Seleccionar solo `INICIAL`, `FINAL` o `PROFESIONAL`. El tipo `INTERMEDIA` no debe mostrarse ni aceptarse.
  - Seleccionar una empresa y sede activa/elegible; verificar convenio vigente cuando aplique.
  - Confirmar la solicitud.
  - **Resultado esperado:** el sistema valida requisitos académicos, crea el expediente, asocia empresa/sede y deja el estado en `EMPRESA_SEDE_ASIGNADA`.
  - **Pruebas negativas:** sede inactiva/no elegible, convenio vencido, requisitos académicos incompletos y segunda solicitud mientras exista expediente activo.
- [x] **Secretaría - validación administrativa**:
  - Iniciar sesión como `SECRETARIA` y abrir `Recepción Admin`.
  - Buscar por código o estudiante, revisar información y ejecutar la validación.
  - **Resultado esperado:** `VALIDADO_SECRETARIA`, trazabilidad y notificación al estudiante.
- [x] **Coordinación o Dirección - Carta de Presentación**:
  - Iniciar sesión como `COORDINADOR` o `DIRECTOR`, abrir `Coordinación` y usar `Ver detalle` sobre el expediente validado.
  - Usar `Emitir carta` y confirmar.
  - **Resultado esperado:** `CARTA_PRESENTACION_EMITIDA`; se genera el PDF institucional y aparece en Documentos como `Emitida por Dirección`.
  - Descargar el PDF con el estudiante. Debe responder HTTP `200`, no estar vacío y pertenecer a su propio expediente.
- [x] **Estudiante - Carta de Aceptación**:
  - En `Documentos y Plan de Prácticas`, cargar `Carta de Aceptación (Empresa)` firmada en PDF.
  - **Resultado esperado:** el documento se asocia al expediente y el estado pasa a `CARTA_ACEPTACION_PRESENTADA`.
  - **Pruebas negativas:** cargar antes de la Carta de Presentación, archivo no PDF o exceder el máximo de la interfaz.

### 4.2 Asignación Previa al Plan

- [x] **Práctica Inicial - asignar Asesor**:
  - Con estado `CARTA_ACEPTACION_PRESENTADA`, ingresar como `SECRETARIA`, `COORDINADOR` o `DIRECTOR`.
  - Desde `Recepción Admin`, usar `Asignar Docente Asesor`, seleccionar docente activo y registrar la resolución.
  - **Resultado esperado:** `ASESOR_ASIGNADO`; el asesor ve al estudiante en `Mis Practicantes` y se inicia el plazo de Plan Inicial.
  - **Pruebas negativas:** no permitir asesor para Final/Profesional ni reasignar si ya existe asesor.
- [x] **Práctica Final o Profesional - asignar Comité**:
  - Verificar integrantes vigentes del comité. La base local dispone de presidente y miembros demo activos.
  - Iniciar sesión como `COORDINADOR` o `DIRECTOR`, abrir `Coordinación` y filtrar el expediente Final/Profesional en `CARTA_ACEPTACION_PRESENTADA`.
  - Usar `Asignar comité` desde la fila o desde `Ver detalle`.
  - Seleccionar entre uno y tres integrantes activos y confirmar.
  - **Resultado esperado:** `COMITE_ASIGNADO`; los integrantes seleccionados ven el expediente en `Panel Comité` y se inicia el plazo de Plan Final/Profesional.
  - **Pruebas negativas:** comité para Inicial, más de tres integrantes, integrante inactivo o segunda asignación.
- [ ] **Estudiante - comprobar bloqueo/habilitación del Plan**:
  - Antes de la asignación, `Plan de Prácticas` debe informar el responsable pendiente y no permitir su presentación.
  - Después de `ASESOR_ASIGNADO` o `COMITE_ASIGNADO`, debe habilitarse `Plan de Prácticas` en el menú y `Gestionar plan` en Documentos.

### 4.3 Plan de Prácticas

- [ ] **Estudiante - presentar Plan**:
  - Abrir `Plan de Prácticas` o usar `Gestionar plan` desde Documentos.
  - Completar el formulario estructurado del Anexo 1: carátula/datos del practicante, empresa receptora, área y funcionario a cargo, situación problemática, objetivo general, al menos dos objetivos específicos, técnicas o procedimientos de Ingeniería Industrial y cronograma.
  - Cada actividad del cronograma requiere descripción, fecha de inicio, fecha de fin y duración estimada; la fecha final no puede ser anterior a la inicial.
  - Seleccionar `Presentar Plan para revisión`.
  - **Resultado esperado:** se registra una versión estructurada del Plan con estado `PRESENTADO` y el expediente pasa a `PLAN_PRESENTADO`.
  - **Pruebas negativas:** omitir secciones obligatorias, no registrar objetivo general/dos específicos, cronograma vacío o fechas inválidas.
- [ ] **Revisor - iniciar revisión y observar**:
  - Para Inicial usar `DOCENTE_ASESOR`; para Final/Profesional usar integrante asignado de `COMITE_PRACTICAS`.
  - Cambiar el documento de `PENDIENTE` a `EN_REVISION`, luego a `OBSERVADO`, con comentario obligatorio.
  - Registrar una observación de expediente con motivo concreto.
  - **Resultado esperado:** documento `OBSERVADO`, expediente `PLAN_OBSERVADO`, notificación y plazo de subsanación.
  - **Prueba negativa:** observar sin comentario debe ser rechazado.
- [ ] **Estudiante - corregir y reenviar**:
  - Revisar observaciones, eliminar la versión observada y cargar PDF corregido.
  - **Resultado esperado:** el nuevo documento reenvía el expediente a `PLAN_PRESENTADO`; la interfaz permite cargar desde `PLAN_OBSERVADO` y `SUBSANADO`.
  - Confirmar que no se puede eliminar documento aprobado ni documento institucional.
- [ ] **Revisor - aprobar Plan**:
  - Revisar la versión final y usar `Aprobar plan`.
  - **Resultado esperado:** `PLAN_APROBADO`, bandera de Plan aprobada y notificación al estudiante.

### 4.4 Ejecución y Seguimiento

- [ ] **Secretaría o Coordinación - iniciar ejecución**:
  - Con expediente en `PLAN_APROBADO`, indicar fecha de inicio y duración en semanas.
  - **Resultado esperado:** `EN_EJECUCION`, fechas registradas y control de horas en `EN_PROCESO` creado automáticamente.
  - **Prueba negativa:** no iniciar sin Plan aprobado ni con fecha/duración inválidas.
- [ ] **Estudiante - registrar horas**:
  - Abrir `Registro de Horas`; solo debe estar disponible durante ejecución.
  - Registrar fecha no futura ni anterior al inicio, actividad, tipo y entre 1 y 24 horas por registro.
  - **Resultado esperado:** registro pendiente de Tutor; no suma al acumulado hasta validación.
  - Alcanzar al menos 64 horas validadas para Inicial y 360 para Final/Profesional.
  - Para Final/Profesional, distribuir registros en tres meses reales; concentrar horas en pocos días debe producir `coherenciaTemporalOk=false` y bloquear el cierre.
- [ ] **Tutor Externo - validar horas**:
  - Iniciar sesión con tutor asociado a la empresa y validar registros pendientes.
  - **Resultado esperado:** acumulado actualizado y control `CUMPLIDO` al alcanzar el mínimo.
  - **Prueba negativa:** tutor de otra empresa no puede modificar el expediente.
- [ ] **Informes de Inicial**:
  - Desde `Informes`, cargar PDF de `INFORME_PARCIAL_1`, `INFORME_PARCIAL_2` e `INFORME_FINAL_INICIAL` en ese orden.
  - Cada carga debe registrar documento y presentación del hito.
  - **Estados esperados:** `INFORME_PARCIAL_1_PRESENTADO`, `INFORME_PARCIAL_2_PRESENTADO`, `INFORME_FINAL_PRESENTADO`.
- [ ] **Informes de Final/Profesional**:
  - Cargar `INFORME_FINAL` desde `Informes` y `CONSTANCIA_EMPRESA` en PDF durante ejecución o etapa habilitada.
  - El `TUTOR_EXTERNO` completa Anexo 2. Verificar que `FICHA_EVALUACION` quede registrada antes del cierre.
  - Asesor/Comité/Coordinación revisa el informe según la asignación.

### 4.5 Evaluación, Dictamen y Constancia

- [ ] **Inicial - evaluación de Asesor**:
  - El asesor asignado registra nota vigesimal entre 0 y 20 y una nota aprobatoria para continuar.
  - **Resultado esperado:** `EVALUADO`, calificación y auditoría registradas.
- [ ] **Final o Profesional - evaluación empresarial**:
  - Tutor asociado registra Anexo 2 únicamente para expediente habilitado de su empresa.
  - **Resultado esperado:** evaluación empresarial completa y Ficha de Evaluación asociada al expediente.
- [ ] **Comité o Coordinación - Dictamen Final**:
  - Verificar informe, evaluaciones, horas y documentos; emitir dictamen con texto no vacío.
  - **Resultado esperado:** `DICTAMEN_EMITIDO` y documento institucional `DICTAMEN_FINAL`.
- [ ] **Dirección o Coordinación - cierre y Constancia**:
  - Emitir constancia desde el detalle del expediente.
  - El sistema debe validar horas, coherencia temporal para Final/Profesional, nota aprobatoria, Plan, informes, Constancia de Empresa, Ficha de Evaluación cuando aplique y Dictamen.
  - Para Inicial verificar además `INFORME_PARCIAL_1`, `INFORME_PARCIAL_2` e `INFORME_FINAL_INICIAL`.
  - **Resultado esperado:** `CERRADO`, práctica vinculada `COMPLETADA` e inactiva, y `CONSTANCIA_CULMINACION` generada.
  - **Pruebas negativas:** intentar cierre sin requisito debe indicar el faltante; Final/Profesional debe bloquear con horas temporalmente incoherentes.
- [ ] **Estudiante - descarga final**:
  - En `Documentos y Plan de Prácticas`, descargar `Constancia de Prácticas`.
  - Verificar PDF no vacío y HTTP `200`; otro estudiante debe recibir rechazo al intentar descargarla.

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
