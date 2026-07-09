# Plan de Pruebas E2E (End-to-End) - SGPP UNT

Este documento sirve como guía paso a paso para verificar el flujo completo del Sistema de Gestión de Prácticas Preprofesionales (SGPP) de la Escuela de Ingeniería Industrial (UNT). Puede utilizarse como un checklist interactivo durante las fases de QA y validación.

## 1. Requisitos Previos

- [ ] Entorno desplegado correctamente (Frontend en React/Vite, Backend en Spring Boot, PostgreSQL en ejecución).
- [ ] Base de datos limpia o reseteada a su estado base (ej. usando la migración `V38__reset_datos_demo_for_testing.sql` que mantiene solo a los administradores del sistema).
- [ ] Conocer las URLs de acceso:
  - Frontend (App Web): `http://localhost:5173`
  - Backend API (Swagger/Swagger UI): `http://localhost:8080`

## 2. Creación de Usuarios (Paso Inicial Obligatorio)

*Instrucción: Usar la cuenta de Administrador de Sistema (`ADMIN_SISTEMA`) en el módulo de "Administración > Usuarios".*

- [ ] **Estudiante**: 
  - Registrar nombres, apellidos, correo, documento de identidad y código institucional. 
  - Asignar el rol `ESTUDIANTE` y marcar tipo "INTERNO".
  - *Verificación*: Ingresar con las credenciales y comprobar que el Sidebar muestra los grupos de "Gestión Académica" e "Institucional".
- [ ] **Docente Asesor**: 
  - Registrar datos y asignar el rol `DOCENTE_ASESOR`.
  - *Verificación*: Ingresar y comprobar que el Sidebar muestra la pestaña "Mis Practicantes".
- [ ] **Tutor Externo**: 
  - Registrar perfil de tutor indicando Empresa y Cargo. Asignar rol `TUTOR_EXTERNO` y tipo "EXTERNO".
  - *Verificación*: Ingresar y comprobar acceso a la sección de "Evaluaciones".
- [ ] **Secretaría Académica**: 
  - Asignar rol `SECRETARIA`.
  - *Verificación*: Ingresar y comprobar acceso a "Dashboard Administrativo" y "Recepción Admin".
- [ ] **Comité de Prácticas**: 
  - Asignar rol `COMITE_PRACTICAS`.
  - *Verificación*: Comprobar acceso al "Panel Comité" y reportes consolidados.
- [ ] **Coordinador/Director de Escuela**: 
  - Asignar rol `COORDINADOR` (o `DIRECTOR`).
  - *Verificación*: Comprobar acceso a "Panel Ejecutivo" e indicadores estadísticos.

## 3. Configuración Base

*Instrucción: Usar la cuenta de Secretaría o Administrador.*

- [ ] **Empresa y Sede**: Desde el módulo de Entidades Externas, registrar una empresa válida (con RUC y Razón Social) y agregarle al menos una sede (dirección física).
- [ ] **Convenio**: Registrar un convenio vigente asociado a la empresa anterior, estableciendo fechas válidas.
- [ ] *Verificación*: Validar en la interfaz que el convenio aparece como activo y probar el indicador de alerta (fecha próxima a vencer).

## 4. Flujo Completo de una Práctica (Paso a Paso)

**Inicio del Trámite**
- [ ] **Estudiante**: Solicita práctica inicial (elige entre Inicial, Intermedia o Final/Profesional) seleccionando la sede y empresa recién registrada.
- [ ] **Secretaría**: Revisa la solicitud, valida los requisitos administrativos en sistema y emite la "Carta de Presentación".
- [ ] **Estudiante**: Una vez entregada la carta física, sube al sistema la "Carta de Aceptación" firmada por la empresa receptora.

**Plan de Prácticas**
- [ ] **Estudiante**: Sube el documento o completa el formulario del "Plan de Prácticas".
- [ ] **Docente Asesor**: Revisa el Plan de Prácticas y registra de manera intencional una *observación de prueba*.
- [ ] **Estudiante**: Entra al sistema, lee la observación y "levanta" la observación enviando la versión corregida.
- [ ] **Docente Asesor**: Verifica la corrección y aprueba el Plan de Prácticas final.

**Ejecución y Seguimiento**
- [ ] **Estudiante**: Realiza el registro periódico de horas en la plataforma.
- [ ] **Estudiante**: Presenta el Informe Parcial 1 (o Hito 1 según su cronograma).
- [ ] **Estudiante**: Presenta el Informe Parcial 2 (si aplica al tipo de práctica).
- [ ] **Estudiante**: Presenta el Informe Final o Memoria de Prácticas.
- [ ] **Docente Asesor**: Revisa los informes y registra las notas correspondientes por unidad/criterio.

**Evaluaciones**
- [ ] **Tutor Externo**: Ingresa con su cuenta y registra la rúbrica/evaluación de desempeño del practicante en la empresa.

**Cierre Administrativo**
- [ ] **Comité de Prácticas**: Revisa el expediente consolidado (informes, notas, plan) y emite un "Dictamen Final Aprobatorio".
- [ ] **Secretaría**: Realiza la última validación de requisitos de egreso o término de trámite.
- [ ] **Sistema**: El expediente cambia automáticamente a estado `CERRADO` o `FINALIZADO`.
- [ ] **Secretaría**: Genera y emite la "Constancia de Prácticas" oficial para el estudiante.

## 5. Verificación de Reglas Normativas

Durante la ejecución del flujo anterior, se deben validar las siguientes reglas de negocio duras:

- [ ] **Plazos de Envío**: El sistema advierte y valida que el plan se suba en un máximo de *15 días* tras ser aceptado en la empresa.
- [ ] **Plazos de Subsanación**: El estudiante dispone de hasta *7 días* para levantar observaciones del plan, y *10 días* para observaciones en informes.
- [ ] **Horas Mínimas Obligatorias**: El sistema impide la emisión de la constancia si el acumulado de horas registradas es menor al mínimo normativo (ej. 64h en Iniciales / 360h en Profesionales).
- [ ] **Cálculo de Promedio**: El promedio final mostrado al Comité coincide con la fórmula de pesos estipulada en la rúbrica de la escuela (Nota Docente vs Nota Empresa).
- [ ] **Bloqueos Automáticos**: Al forzar/simular que se vence un plazo en la base de datos, el estudiante ve el bloqueo pertinente en la UI y no puede enviar documentos a destiempo sin autorización.

## 6. Verificación de Accesos por Rol (Seguridad)

- [ ] **Estudiante**: No ve botones de administración, no puede acceder a las URL de `/admin` y no puede consultar IDs de expedientes que pertenezcan a otros alumnos.
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
| 7   | Solicitud de Trámite Inicial | Estudiante | | |
| 8   | Emisión Carta de Presentación | Secretaría | | |
| 9   | Subida Carta de Aceptación | Estudiante | | |
| 10  | Presentación del Plan de Prácticas | Estudiante | | |
| 11  | Observación generada al Plan | Docente Asesor | | |
| 12  | Levantamiento de Observación | Estudiante | | |
| 13  | Aprobación del Plan | Docente Asesor | | |
| 14  | Registro de Horas validadas | Estudiante | | |
| 15  | Presentación de Informe Parcial | Estudiante | | |
| 16  | Presentación de Informe Final | Estudiante | | |
| 17  | Calificación Docente | Docente Asesor | | |
| 18  | Calificación Tutor Externo | Tutor Externo | | |
| 19  | Dictamen de Comité | Comité | | |
| 20  | Validación Final / Cierre Expediente | Secretaría | | |
| 21  | Emisión Constancia de Prácticas | Secretaría | | |
| 22  | Test de Restricciones (Horas, Notas)| Sistema | | |
| 23  | Test de Plazos y Bloqueos | Sistema | | |
| 24  | Test de Aislamiento de Roles (Auth)| QA / Todos | | |

*Fin del documento.*
