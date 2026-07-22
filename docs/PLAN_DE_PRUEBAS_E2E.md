# Plan de Pruebas End-to-End (E2E) - SGPP UNT

## 1. Objetivo de este documento

Este plan describe cómo probar manualmente el ciclo completo del **Sistema de Gestión de Prácticas Preprofesionales (SGPP)** de la Universidad Nacional de Trujillo, desde que un estudiante solicita una práctica hasta que se emite su constancia de culminación.

Cada escenario indica:

- **Quién ejecuta la acción** (rol de usuario).
- **Dónde se ejecuta** (pantalla o menú del sistema).
- **Qué se debe hacer** (pasos detallados).
- **Resultado esperado** (estado del expediente, mensajes, documentos generados).
- **Casos negativos** (errores que deben rechazarse correctamente).

Al finalizar cada prueba se debe registrar el resultado en la **matriz de resultados** (sección 8).

---

## 2. Alcance

### 2.1 Lo que se prueba

- Flujo completo de solicitud, validación, ejecución y cierre de prácticas.
- Roles y permisos de cada tipo de usuario.
- Reglas de negocio: plazos, horas mínimas, documentos obligatorios, descargas autorizadas.
- Configuración institucional: empresas, sedes, convenios, tutores, comité, parámetros del sistema.
- Seguridad: acceso a URL y endpoints restringidos.

### 2.2 Lo que NO se prueba en este plan

- Pruebas unitarias o de integración automatizadas (ya existen en backend).
- Rendimiento o carga del sistema.
- Compatibilidad con navegadores antiguos (usar Chrome, Firefox o Edge actualizado).

---

## 3. Ambiente de pruebas

Antes de comenzar, verificar que todos los servicios estén disponibles.

### 3.1 Servicios requeridos

| Servicio | URL / Puerto | Estado |
| --- | --- | --- |
| Frontend (Vite) | `http://localhost:5173` | Debe responder `200` |
| Backend (Spring Boot) | `http://localhost:8082/api/v1` | Debe responder `200` en `/actuator/health` |
| Documentación API (Swagger) | `http://localhost:8082/api/v1/swagger-ui/index.html` | Debe cargar sin errores |
| Base de datos PostgreSQL | `localhost:5434` | Debe aceptar conexiones |
| pgAdmin (opcional) | `http://localhost:5051` | Útil para revisar datos |

### 3.2 Levantar el ambiente local

```bash
# 1. Base de datos (desde la raíz del proyecto)
docker compose up -d db pgadmin

# 2. Backend (desde backend/)
$env:JAVA_HOME='C:\Program Files\Java\jdk-17'
$env:PATH="$env:JAVA_HOME\bin;$env:PATH"
mvn -pl sgpp-api spring-boot:run

# 3. Frontend (desde frontend/)
npm run dev
```

### 3.3 Datos mínimos en la base

La base debe contener al menos:

- Usuarios de prueba para cada rol (ver sección 4).
- Una **empresa** registrada y activa.
- Una **sede** asociada a la empresa, marcada como elegible.
- Un **convenio** vigente asociado a la empresa (si aplica).
- Al menos un **docente asesor** activo.
- Al menos un **tutor externo** asociado a la sede/empresa.
- Integrantes del **comité de prácticas** activos (mínimo presidente y dos miembros).
- Parámetros del sistema configurados (plazos, horas mínimas, requisitos académicos).

> **Nota importante:** no reutilizar un expediente ya cerrado para otra prueba. Crear un expediente nuevo por cada escenario.

---

## 4. Usuarios de prueba

Crear o verificar que existan cuentas activas para cada rol. Se recomienda tener un usuario exclusivo por rol para evitar confusiones.

| Rol | Función principal en el flujo | Ejemplo de usuario |
| --- | --- | --- |
| `ESTUDIANTE` | Solicita práctica, carga documentos, registra horas, presenta informes. | `estudiante1` |
| `SECRETARIA` | Valida administrativamente, asigna asesor inicial, inicia ejecución. | `secretaria1` |
| `DOCENTE_ASESOR` | Revisa plan e informes, evalúa prácticas iniciales. | `docente1` |
| `TUTOR_EXTERNO` | Valida horas y evalúa prácticas final/profesional. | `tutor1` |
| `COMITE_PRACTICAS` | Revisa, aprueba plan/informes y emite dictámenes. | `comite1` |
| `COORDINADOR` / `DIRECTOR` | Emite carta de presentación, asigna comité, dictamina, cierra. | `coordinador1` |
| `ADMIN_SISTEMA` | Administra usuarios, parámetros, reglas de plazo, requisitos. | `admin1` |

### 4.1 Credenciales iniciales (seed local)

Si se cargaron las migraciones de seed, se puede usar:

- **Usuario:** `estudiante1`
- **Contraseña:** `password123`

Verificar el resto de usuarios seed o crear los que falten desde el panel de administración.

---

## 5. Configuración base previa al flujo

Antes de probar el flujo de un estudiante, un administrador o secretaria debe configurar lo siguiente.

### 5.1 Empresa, sede y convenio

| Paso | Acción | Usuario | Resultado esperado |
| --- | --- | --- | --- |
| 5.1.1 | Registrar una empresa con RUC único y datos completos. | Admin / Secretaría | Empresa activa en el catálogo. |
| 5.1.2 | Registrar una sede asociada a la empresa, con dirección completa y encargado. | Admin / Secretaría | Sede activa y visible para estudiantes. |
| 5.1.3 | Registrar un convenio vigente asociado a la empresa (si aplica según normativa). | Admin / Secretaría | Convenio en estado vigente. |
| 5.1.4 | Verificar que la sede aparezca como elegible en el catálogo del estudiante. | Estudiante | La sede se muestra en `Centros de Práctica`. |

### 5.2 Usuarios del comité y asesores

| Paso | Acción | Usuario | Resultado esperado |
| --- | --- | --- | --- |
| 5.2.1 | Crear usuarios con rol `COMITE_PRACTICAS` (presidente y miembros). | Admin | Integrantes activos del comité. |
| 5.2.2 | Crear usuarios con rol `DOCENTE_ASESOR`. | Admin | Asesores disponibles para asignación. |
| 5.2.3 | Crear usuarios con rol `TUTOR_EXTERNO` y vincularlos a la empresa/sede. | Admin | Tutores disponibles para validación de horas. |

### 5.3 Parámetros del sistema

| Paso | Acción | Usuario | Resultado esperado |
| --- | --- | --- | --- |
| 5.3.1 | Revisar parámetros en `Admin > Configuración > Parámetros`. | Admin | Horas mínimas, plazos y umbrales configurados. |
| 5.3.2 | Revisar reglas de plazo en `Admin > Configuración > Reglas de Plazo`. | Admin | Plazos de subsanación de plan e informes definidos. |
| 5.3.3 | Revisar requisitos académicos en `Admin > Configuración > Requisitos Académicos`. | Admin | Requisitos por tipo de práctica configurados. |

---

## 6. Flujo completo de una práctica

### 6.1 Inicio del trámite

#### 6.1.1 Estudiante - Crear solicitud de práctica

**Rol:** `ESTUDIANTE`  
**Pantalla:** `Solicitar Práctica`

| # | Paso | Resultado esperado |
| --- | --- | --- |
| 1 | Iniciar sesión con usuario estudiante. | Se carga el dashboard del estudiante. |
| 2 | Abrir `Solicitar Práctica` desde el menú. | Se muestra el formulario de solicitud. |
| 3 | Seleccionar tipo de práctica: `INICIAL`, `FINAL` o `PROFESIONAL`. | `INTERMEDIA` no debe aparecer ni permitirse. |
| 4 | Seleccionar una empresa activa. | Se cargan las sedes de esa empresa. |
| 5 | Seleccionar una sede elegible. | Se muestra información de convenio vigente si aplica. |
| 6 | Confirmar la solicitud. | El sistema valida requisitos académicos, crea el expediente y lo deja en estado `EMPRESA_SEDE_ASIGNADA`. |

**Casos negativos:**

- Seleccionar sede inactiva o no elegible → debe mostrar error y no crear el expediente.
- Seleccionar empresa con convenio vencido → debe bloquear la solicitud si aplica.
- Estudiante con requisitos académicos incompletos → debe mostrar cuál falta.
- Segunda solicitud mientras existe expediente activo → debe rechazarla.

#### 6.1.2 Secretaría - Validación administrativa

**Rol:** `SECRETARIA`  
**Pantalla:** `Recepción Admin`

| # | Paso | Resultado esperado |
| --- | --- | --- |
| 1 | Iniciar sesión como secretaria. | Se carga el panel de recepción. |
| 2 | Buscar el expediente por código o nombre del estudiante. | Aparece el expediente en estado `EMPRESA_SEDE_ASIGNADA`. |
| 3 | Revisar información de empresa, sede y estudiante. | Datos correctos y completos. |
| 4 | Ejecutar `Validar` o acción equivalente. | El expediente pasa a `VALIDADO_SECRETARIA`. |

**Resultados esperados:**

- Cambio de estado registrado.
- Trazabilidad visible en el historial del expediente.
- Notificación enviada al estudiante (si el sistema de notificaciones está activo).

#### 6.1.3 Coordinación/Dirección - Emisión de Carta de Presentación

**Rol:** `COORDINADOR` o `DIRECTOR`  
**Pantalla:** `Coordinación > Detalle del expediente`

| # | Paso | Resultado esperado |
| --- | --- | --- |
| 1 | Iniciar sesión como coordinador/director. | Se carga el dashboard de coordinación. |
| 2 | Abrir `Coordinación` y buscar el expediente validado. | Expediente en estado `VALIDADO_SECRETARIA`. |
| 3 | Usar `Ver detalle` sobre el expediente. | Se abre la vista de detalle. |
| 4 | Presionar `Emitir carta` y confirmar. | Estado cambia a `CARTA_PRESENTACION_EMITIDA`. |
| 5 | Verificar en documentos del estudiante. | Aparece la carta como `Emitida por Dirección`. |

**Pruebas adicionales:**

- Descargar el PDF con el estudiante → HTTP `200`, archivo no vacío, pertenece a su expediente.
- Intentar emitir carta antes de `VALIDADO_SECRETARIA` → debe bloquearse.

#### 6.1.4 Estudiante - Carga de Carta de Aceptación

**Rol:** `ESTUDIANTE`  
**Pantalla:** `Documentos y Plan de Prácticas`

| # | Paso | Resultado esperado |
| --- | --- | --- |
| 1 | Iniciar sesión como estudiante. | Dashboard del estudiante. |
| 2 | Ir a `Documentos` o `Documentos y Plan de Prácticas`. | Lista de documentos del expediente. |
| 3 | Cargar `Carta de Aceptación (Empresa)` en PDF. | Documento asociado al expediente. |
| 4 | Confirmar carga. | Estado pasa a `CARTA_ACEPTACION_PRESENTADA`. |

**Casos negativos:**

- Cargar antes de tener Carta de Presentación emitida → debe bloquearse.
- Archivo que no sea PDF → debe rechazarse.
- Archivo que exceda el tamaño máximo permitido → debe rechazarse con mensaje claro.

---

### 6.2 Asignación previa al plan

#### 6.2.1 Práctica Inicial - Asignar docente asesor

**Rol:** `SECRETARIA`, `COORDINADOR` o `DIRECTOR`  
**Pantalla:** `Recepción Admin`

| # | Paso | Resultado esperado |
| --- | --- | --- |
| 1 | Iniciar sesión con un rol permitido. | Panel de recepción. |
| 2 | Buscar expediente en estado `CARTA_ACEPTACION_PRESENTADA` de tipo `INICIAL`. | Expediente visible. |
| 3 | Usar `Asignar Docente Asesor`. | Se abre selector de docentes activos. |
| 4 | Seleccionar docente y registrar resolución. | Estado pasa a `ASESOR_ASIGNADO`. |

**Resultados esperados:**

- El docente asesor ve al estudiante en `Mis Practicantes`.
- Se inicia el plazo para presentar el Plan Inicial.

**Casos negativos:**

- Intentar asignar asesor a práctica Final o Profesional → debe rechazarse.
- Intentar reasignar asesor cuando ya existe uno → debe rechazarse.

#### 6.2.2 Práctica Final o Profesional - Asignar comité

**Rol:** `COORDINADOR` o `DIRECTOR`  
**Pantalla:** `Coordinación`

| # | Paso | Resultado esperado |
| --- | --- | --- |
| 1 | Verificar que existan integrantes del comité activos. | Presidente y miembros disponibles. |
| 2 | Iniciar sesión como coordinador/director. | Dashboard de coordinación. |
| 3 | Filtrar expediente Final/Profesional en `CARTA_ACEPTACION_PRESENTADA`. | Expediente visible. |
| 4 | Usar `Asignar comité` desde la fila o desde detalle. | Selector de integrantes activos. |
| 5 | Seleccionar entre 1 y 3 integrantes y confirmar. | Estado pasa a `COMITE_ASIGNADO`. |

**Resultados esperados:**

- Los integrantes seleccionados ven el expediente en `Panel Comité`.
- Se inicia el plazo para presentar el Plan Final/Profesional.

**Nota:** La validación de duplicidad de integrantes del comité se aplica actualmente a nivel de backend, no solo en la UI. Si se intenta enviar un mismo usuario más de una vez en la solicitud, el backend rechazará la operación.

**Casos negativos:**

- Asignar comité a práctica Inicial → debe rechazarse.
- Seleccionar más de 3 integrantes → debe rechazarse.
- Seleccionar integrante inactivo → debe rechazarse.
- Segunda asignación de comité → debe rechazarse.
- Seleccionar el mismo integrante dos veces → rechazado con mensaje de error (validación en backend).

#### 6.2.3 Estudiante - Habilitación del plan

**Rol:** `ESTUDIANTE`  
**Pantalla:** `Plan de Prácticas` / `Documentos`

| # | Paso | Resultado esperado |
| --- | --- | --- |
| 1 | Antes de la asignación, intentar acceder a `Plan de Prácticas`. | Debe informar que falta asignación de asesor/comité. |
| 2 | Después de `ASESOR_ASIGNADO` o `COMITE_ASIGNADO`, revisar el menú. | Aparece habilitado `Plan de Prácticas` y `Gestionar plan`. |

---

### 6.3 Plan de prácticas

#### 6.3.1 Estudiante - Presentar plan

**Rol:** `ESTUDIANTE`  
**Pantalla:** `Plan de Prácticas`

| # | Paso | Resultado esperado |
| --- | --- | --- |
| 1 | Abrir `Plan de Prácticas` o `Gestionar plan` desde Documentos. | Se carga el formulario estructurado (Anexo 1). |
| 2 | Completar carátula y datos del practicante. | Campos guardados. |
| 3 | Completar datos de la empresa receptora. | Campos guardados. |
| 4 | Completar área y funcionario a cargo. | Campos guardados. |
| 5 | Describir situación problemática. | Campo obligatorio completado. |
| 6 | Registrar objetivo general. | Campo obligatorio completado. |
| 7 | Registrar al menos dos objetivos específicos. | Sistema valida cantidad mínima. |
| 8 | Registrar técnicas o procedimientos de Ingeniería Industrial. | Campo obligatorio completado. |
| 9 | Registrar cronograma: cada actividad con descripción, fecha inicio, fecha fin y duración estimada. | Fecha final no puede ser anterior a la inicial. |
| 10 | Seleccionar `Presentar Plan para revisión`. | Plan pasa a estado `PRESENTADO`; expediente a `PLAN_PRESENTADO`. |

**Casos negativos:**

- Omitir secciones obligatorias → debe mostrar mensaje de campo requerido.
- Menos de dos objetivos específicos → debe rechazar.
- Cronograma vacío → debe rechazar.
- Fecha final anterior a fecha inicial → debe rechazar.

#### 6.3.2 Revisor - Observar plan

**Rol:** `DOCENTE_ASESOR` (Inicial) o `COMITE_PRACTICAS` (Final/Profesional)  
**Pantalla:** `Mis Practicantes` / `Panel Comité`

| # | Paso | Resultado esperado |
| --- | --- | --- |
| 1 | Iniciar sesión como revisor asignado. | Lista de expedientes asignados. |
| 2 | Abrir el plan del estudiante. | Plan en estado `PENDIENTE`. |
| 3 | Cambiar estado a `EN_REVISION`. | Estado actualizado. |
| 4 | Cambiar estado a `OBSERVADO` con comentario obligatorio. | Plan `OBSERVADO`; expediente `PLAN_OBSERVADO`. |
| 5 | Registrar observación de expediente con motivo concreto. | Observación visible para el estudiante. |

**Resultados esperados:**

- Notificación al estudiante.
- Plazo de subsanación iniciado.

**Caso negativo:**

- Observar sin comentario → debe ser rechazado.

#### 6.3.3 Estudiante - Corregir y reenviar plan

**Rol:** `ESTUDIANTE`  
**Pantalla:** `Plan de Prácticas` / `Documentos`

| # | Paso | Resultado esperado |
| --- | --- | --- |
| 1 | Revisar las observaciones registradas. | Listado claro de observaciones. |
| 2 | Eliminar la versión observada del plan. | Versión anterior marcada como reemplazada. |
| 3 | Cargar o completar el plan corregido. | Nueva versión lista. |
| 4 | Reenviar. | Expediente vuelve a `PLAN_PRESENTADO`. |

**Casos negativos:**

- No se puede eliminar documento aprobado.
- No se puede eliminar documento institucional.

#### 6.3.4 Revisor - Aprobar plan

**Rol:** `DOCENTE_ASESOR` o `COMITE_PRACTICAS`  
**Pantalla:** Revisión de plan

| # | Paso | Resultado esperado |
| --- | --- | --- |
| 1 | Revisar la versión corregida. | Plan completo y sin observaciones pendientes. |
| 2 | Usar `Aprobar plan`. | Plan `APROBADO`; expediente `PLAN_APROBADO`. |

**Resultados esperados:**

- Notificación al estudiante.
- Plan queda como versión vigente aprobada.

---

### 6.4 Ejecución y seguimiento

#### 6.4.1 Secretaría/Coordinación - Iniciar ejecución

**Rol:** `SECRETARIA`, `COORDINADOR` o `DIRECTOR`  
**Pantalla:** `Recepción Admin` / `Coordinación > Detalle`

| # | Paso | Resultado esperado |
| --- | --- | --- |
| 1 | Buscar expediente en estado `PLAN_APROBADO`. | Expediente visible. |
| 2 | Indicar fecha de inicio de ejecución. | Fecha válida. |
| 3 | Indicar duración en semanas. | Número válido. |
| 4 | Confirmar inicio. | Expediente pasa a `EN_EJECUCION`. |

**Resultados esperados:**

- Se crea automáticamente un control de horas en estado `EN_PROCESO`.
- El estudiante puede registrar horas.

**Casos negativos:**

- Iniciar ejecución sin Plan aprobado → debe rechazarse.
- Fecha o duración inválidas → debe rechazarse.

#### 6.4.2 Estudiante - Registrar horas

**Rol:** `ESTUDIANTE`  
**Pantalla:** `Registro de Horas`

| # | Paso | Resultado esperado |
| --- | --- | --- |
| 1 | Abrir `Registro de Horas` (solo disponible durante ejecución). | Formulario de registro habilitado. |
| 2 | Registrar fecha no futura ni anterior al inicio de ejecución. | Fecha válida. |
| 3 | Registrar actividad realizada. | Campo obligatorio. |
| 4 | Seleccionar tipo de actividad. | Opción válida. |
| 5 | Registrar entre 1 y 24 horas por día. | Horas dentro del rango permitido. |
| 6 | Guardar. | Registro queda pendiente de validación del tutor. |

**Resultados esperados:**

- El registro no suma al acumulado hasta que el tutor lo valide.
- Acumular al menos 64 horas validadas para Inicial y 360 para Final/Profesional.

**Nota:** El backend ahora valida un mínimo diario de 6 horas por registro. Si se intentan registrar menos de 6 horas en un solo día, el sistema debe advertir o rechazar.

**Casos negativos:**

- Fecha futura → rechazada.
- Fecha anterior al inicio de ejecución → rechazada.
- Más de 24 horas en un día → rechazada.
- Registrar menos de 6 horas → advertencia o rechazo (validación de mínimo diario en backend).
- Registrar horas negativas → rechazado.
- Registrar horas fuera de ejecución → menú deshabilitado o error.

#### 6.4.3 Validación de coherencia temporal (Final/Profesional)

| # | Paso | Resultado esperado |
| --- | --- | --- |
| 1 | Para práctica Final/Profesional, distribuir registros en al menos tres meses reales. | Sistema permite continuar. |
| 2 | Caso negativo: concentrar las 360 horas en pocos días. | Sistema marca `coherenciaTemporalOk=false` y bloquea el cierre. |

#### 6.4.4 Tutor externo - Validar horas

**Rol:** `TUTOR_EXTERNO`  
**Pantalla:** `Validación de Horas` / Dashboard de tutor

| # | Paso | Resultado esperado |
| --- | --- | --- |
| 1 | Iniciar sesión como tutor asociado a la empresa/sede. | Lista de registros pendientes de estudiantes de esa sede. |
| 2 | Revisar registros pendientes. | Datos correctos. |
| 3 | Validar horas. | Acumulado actualizado. |
| 4 | Alcanzar el mínimo requerido. | Control de horas pasa a `CUMPLIDO`. |

**Caso negativo:**

- Tutor de otra empresa intenta modificar registros → debe rechazarse.

#### 6.4.5 Informes de práctica Inicial

**Rol:** `ESTUDIANTE`  
**Pantalla:** `Informes`

| # | Paso | Resultado esperado |
| --- | --- | --- |
| 1 | Cargar `INFORME_PARCIAL_1` en PDF. | Estado `INFORME_PARCIAL_1_PRESENTADO`. |
| 2 | Cargar `INFORME_PARCIAL_2` en PDF. | Estado `INFORME_PARCIAL_2_PRESENTADO`. |
| 3 | Cargar `INFORME_FINAL_INICIAL` en PDF. | Estado `INFORME_FINAL_PRESENTADO`. |

**Regla:** cada carga debe registrar el documento y la presentación del hito correspondiente.

#### 6.4.6 Informes de práctica Final/Profesional

**Rol:** `ESTUDIANTE`  
**Pantalla:** `Informes` / `Documentos`

| # | Paso | Resultado esperado |
| --- | --- | --- |
| 1 | Cargar `INFORME_FINAL` en PDF. | Estado de informe final presentado. |
| 2 | Cargar `CONSTANCIA_EMPRESA` en PDF. | Documento asociado al expediente. |
| 3 | Verificar que el tutor complete Anexo 2. | `FICHA_EVALUACION` registrada antes del cierre. |
| 4 | Asesor/Comité/Coordinación revisa el informe. | Informe en estado revisado/aprobado según corresponda. |

---

### 6.5 Evaluación, dictamen y constancia

#### 6.5.1 Práctica Inicial - Evaluación del asesor

**Rol:** `DOCENTE_ASESOR`  
**Pantalla:** `Mis Practicantes > Evaluar`

| # | Paso | Resultado esperado |
| --- | --- | --- |
| 1 | Iniciar sesión como asesor asignado. | Lista de practicantes. |
| 2 | Seleccionar al estudiante y registrar evaluación. | Formulario de nota vigesimal. |
| 3 | Registrar nota entre 0 y 20. | Nota guardada. |
| 4 | Nota aprobatoria (mayor o igual al mínimo configurado). | Expediente `EVALUADO`. |

**Resultados esperados:**

- Calificación registrada.
- Auditoría de la evaluación visible.

#### 6.5.2 Práctica Final/Profesional - Evaluación empresarial

**Rol:** `TUTOR_EXTERNO`  
**Pantalla:** `Evaluaciones`

| # | Paso | Resultado esperado |
| --- | --- | --- |
| 1 | Iniciar sesión como tutor asociado a la empresa. | Expedientes habilitados de su empresa. |
| 2 | Completar Anexo 2 (evaluación empresarial). | Evaluación completa. |
| 3 | Guardar. | `FICHA_EVALUACION` asociada al expediente. |

**Caso negativo:**

- Tutor intenta evaluar expediente de otra empresa → debe rechazarse.

#### 6.5.3 Comité/Coordinación - Dictamen final

**Rol:** `COMITE_PRACTICAS` o `COORDINADOR`  
**Pantalla:** `Panel Comité` / `Coordinación > Detalle`

| # | Paso | Resultado esperado |
| --- | --- | --- |
| 1 | Verificar informe, evaluaciones, horas y documentos. | Todos los requisitos cumplidos. |
| 2 | Emitir dictamen con texto no vacío. | Expediente `DICTAMEN_EMITIDO`. |
| 3 | Verificar documentos. | Documento institucional `DICTAMEN_FINAL` generado. |

#### 6.5.4 Dirección/Coordinación - Cierre y constancia

**Rol:** `COORDINADOR` o `DIRECTOR`  
**Pantalla:** `Coordinación > Detalle del expediente`

| # | Paso | Resultado esperado |
| --- | --- | --- |
| 1 | Abrir expediente listo para cierre. | Todos los requisitos validados por el sistema. |
| 2 | Usar `Cerrar práctica` o `Emitir constancia`. | Sistema valida: horas, coherencia temporal, nota aprobatoria, Plan aprobado, informes, Constancia de Empresa, Ficha de Evaluación, Dictamen. |
| 3 | Confirmar cierre. | Expediente `CERRADO`; práctica vinculada `COMPLETADA` e inactiva. |
| 4 | Verificar documentos. | `CONSTANCIA_CULMINACION` generada. |

**Casos negativos:**

- Intentar cierre sin un requisito → debe indicar el faltante.
- Final/Profesional con horas temporalmente incoherentes → debe bloquearse.
- Para Inicial, faltar alguno de los informes parciales o final inicial → debe bloquearse.

#### 6.5.5 Estudiante - Descarga final

**Rol:** `ESTUDIANTE`  
**Pantalla:** `Documentos y Plan de Prácticas`

| # | Paso | Resultado esperado |
| --- | --- | --- |
| 1 | Ir a Documentos. | Aparece `Constancia de Prácticas`. |
| 2 | Descargar PDF. | HTTP `200`, archivo no vacío. |

**Caso negativo:**

- Otro estudiante intenta descargar la constancia ajena → debe recibir `403` o `404`.

---

## 7. Verificación de reglas de negocio normativas

**Nota de seguridad:** El endpoint `GET /expedientes/{id}` ahora requiere autenticación. Sin un token válido, se devuelve `401 Unauthorized`. Además, los endpoints de consulta de plan (`GET`) ahora cuentan con autorización adecuada que impide que usuarios no autorizados accedan a planes ajenos.

Durante el flujo anterior se deben validar las siguientes reglas duras:

| # | Regla | Cómo probar | Resultado esperado |
| --- | --- | --- | --- |
| 7.1 | Plan habilitado por asignación | Intentar cargar Plan antes de `ASESOR_ASIGNADO` o `COMITE_ASIGNADO`. | Bloqueo con mensaje claro. |
| 7.2 | Plazo de subsanación de plan | Forzar/simular vencimiento de plazo de 7 días para observaciones del plan. | UI muestra bloqueo; no permite enviar sin autorización. |
| 7.3 | Plazo de subsanación de informes | Forzar/simular vencimiento de plazo de 10 días para observaciones en informes. | UI muestra bloqueo; no permite enviar sin autorización. |
| 7.4 | Horas mínimas obligatorias | Intentar cerrar con menos de 64h (Inicial) o 360h (Final/Profesional). | Sistema impide cierre indicando horas faltantes. |
| 7.5 | Descarga documental autorizada | Estudiante intenta descargar documento de otro expediente manipulando URL. | Recibe `403 Forbidden` o `404 Not Found`. |
| 7.6 | Bloqueos automáticos por plazo | Modificar fecha de vencimiento en base de datos y refrescar UI. | Estudiante ve bloqueo y no puede enviar documentos a destiempo. |

---

## 8. Verificación de accesos y seguridad por rol

| Rol | Qué puede hacer | Qué NO debe poder hacer | Cómo probar |
| --- | --- | --- | --- |
| `ESTUDIANTE` | Ver su expediente, cargar sus documentos, registrar sus horas, descargar sus constancias. | Ver menús de administración, acceder a `/admin/*`, consultar IDs de expedientes ajenos. | Intentar navegar a `/admin/dashboard` con URL. |
| `DOCENTE_ASESOR` | Ver solo sus practicantes asignados, revisar planes e informes, evaluar. | Ver practicantes de otros asesores, aprobar sin asignación. | Revisar `Mis Practicantes` con diferentes asesores. |
| `TUTOR_EXTERNO` | Ver estudiantes de su sede/empresa, validar horas, evaluar. | Ver o modificar estudiantes de otra empresa. | Iniciar sesión con tutor de otra empresa. |
| `COMITE_PRACTICAS` | Revisar expedientes asignados, observar, aprobar, dictaminar. | Acceder a configuración de sistema o gestión de usuarios. | Intentar abrir `/admin/configuracion`. |
| `COORDINADOR` / `DIRECTOR` | Emitir cartas, asignar comités, dictaminar, cerrar prácticas. | Modificar parámetros del sistema si no tiene rol Admin. | Revisar visibilidad de menús. |
| `ADMIN_SISTEMA` | Todo lo relacionado a administración institucional. | No debe poder alterar datos de expedientes ajenos sin trazabilidad. | Revisar auditoría. |

### 8.1 Protección de endpoints

| # | Acción | Resultado esperado |
| --- | --- | --- |
| 1 | Con token de estudiante, llamar vía Postman a `POST /api/v1/usuarios`. | `403 Forbidden`. |
| 2 | Con token de estudiante, llamar a `GET /api/v1/expedientes/{idAjeno}`. | `403 Forbidden` o `404 Not Found`. |
| 3 | Con token de secretaria, intentar eliminar un usuario. | `403 Forbidden`. |
| 4 | Sin token, llamar a cualquier endpoint protegido. | `401 Unauthorized`. |
| 5 | Intentar asignar comité con usuario duplicado (mismo integrante dos veces). | Rechazado con error de validación del backend. |

---

## 9. Funcionalidades administrativas adicionales

### 9.1 Cambio manual de estado de expediente

**Rol:** `ADMIN_SISTEMA`  
**Pantalla:** `Admin > Expedientes`

| # | Paso | Resultado esperado |
| --- | --- | --- |
| 1 | Iniciar sesión como admin. | Lista de expedientes. |
| 2 | Seleccionar un expediente y usar `Cambiar estado manual`. | Se abre diálogo con nuevo estado y motivo. |
| 3 | Seleccionar nuevo estado válido y registrar motivo. | Estado cambia; se registra en historial como `CAMBIO_MANUAL_ADMIN`. |
| 4 | Verificar trazabilidad. | Historial muestra usuario admin, fecha, estado anterior/nuevo y motivo. |

### 9.2 Configuración del sistema

**Rol:** `ADMIN_SISTEMA`  
**Pantalla:** `Admin > Configuración`

| # | Funcionalidad | Resultado esperado |
| --- | --- | --- |
| 1 | Crear/editar/eliminar parámetro del sistema. | Cambio persistente y aplicado en validaciones. |
| 2 | Crear/editar/eliminar regla de plazo. | Plazos de subsanación se calculan con la nueva regla. |
| 3 | Crear/editar/eliminar requisito académico. | Requisitos aplicados al crear nuevas solicitudes. |

---

## 10. Matriz de registro de resultados

*Registrar cada ejecución con: ✅ Funcionó, ❌ Falló, ⚠️ Observación menor.*

| ID | Paso / Escenario | Rol Ejecutor | Estado | Observaciones / Bugs |
| --- | --- | --- | --- | --- |
| 1 | Login y autenticación de estudiante | Estudiante | | |
| 2 | Login y autenticación de secretaría | Secretaría | | |
| 3 | Login y autenticación de docente asesor | Docente Asesor | | |
| 4 | Login y autenticación de tutor externo | Tutor Externo | | |
| 5 | Login y autenticación de comité | Comité | | |
| 6 | Login y autenticación de coordinador/director | Coordinador | | |
| 7 | Login y autenticación de admin | Admin Sistema | | |
| 8 | Configuración de parámetros del sistema | Admin Sistema | | |
| 9 | Configuración de reglas de plazo | Admin Sistema | | |
| 10 | Configuración de requisitos académicos | Admin Sistema | | |
| 11 | Alta de empresa | Admin / Secretaría | | |
| 12 | Alta de sede asociada a empresa | Admin / Secretaría | | |
| 13 | Alta y vinculación de convenio | Admin / Secretaría | | |
| 14 | Alta de docente asesor | Admin Sistema | | |
| 15 | Alta de tutor externo | Admin Sistema | | |
| 16 | Alta de integrantes de comité | Admin Sistema | | |
| 17 | Solicitud de práctica Inicial | Estudiante | | |
| 18 | Solicitud de práctica Final | Estudiante | | |
| 19 | Solicitud de práctica Profesional | Estudiante | | |
| 20 | Validación administrativa | Secretaría | | |
| 21 | Emisión de Carta de Presentación | Coordinador / Director | | |
| 22 | Descarga de Carta de Presentación | Estudiante | | |
| 23 | Carga de Carta de Aceptación | Estudiante | | |
| 24 | Asignación de asesor (Inicial) | Secretaría / Coordinación | | |
| 25 | Asignación de comité (Final/Profesional) | Coordinador / Director | | |
| 26 | Presentación de Plan de Prácticas | Estudiante | | |
| 27 | Observación de Plan | Asesor / Comité | | |
| 28 | Subsanación de Plan | Estudiante | | |
| 29 | Aprobación de Plan | Asesor / Comité | | |
| 30 | Inicio de ejecución | Secretaría / Coordinación | | |
| 31 | Registro de horas | Estudiante | | |
| 32 | Validación de horas por tutor | Tutor Externo | | |
| 33 | Presentación de informes (Inicial) | Estudiante | | |
| 34 | Presentación de informes (Final/Profesional) | Estudiante | | |
| 35 | Evaluación de asesor (Inicial) | Docente Asesor | | |
| 36 | Evaluación empresarial (Final/Profesional) | Tutor Externo | | |
| 37 | Dictamen final | Comité / Coordinación | | |
| 38 | Cierre de práctica y emisión de constancia | Coordinador / Director | | |
| 39 | Descarga de Constancia de Prácticas | Estudiante | | |
| 40 | Cambio manual de estado de expediente | Admin Sistema | | |
| 41 | Restricción de horas mínimas | Sistema | | |
| 42 | Restricción de coherencia temporal | Sistema | | |
| 43 | Restricción de descarga documental ajena | Estudiante | | |
| 44 | Restricción de acceso a URL de admin | Estudiante | | |
| 45 | Protección de endpoints con token incorrecto | QA / Sistema | | |
| 46 | Bloqueo por vencimiento de plazo | Sistema | | |

---

## 11. Cómo reportar un hallazgo

Para cada fallo encontrado, registrar:

1. **ID de prueba** de la matriz.
2. **Título breve** del problema.
3. **Pasos para reproducir** (lista numerada).
4. **Resultado esperado** vs **resultado obtenido**.
5. **Evidencia**: capturas de pantalla, mensaje de error, código HTTP, logs.
6. **Severidad**: Crítica / Alta / Media / Baja.
7. **Rol y usuario** con el que ocurrió.
8. **Navegador y versión**.

### Ejemplo de formato

```markdown
**ID:** 26
**Título:** Error al presentar Plan sin objetivos específicos
**Pasos:**
1. Iniciar sesión como estudiante.
2. Ir a Plan de Prácticas.
3. Completar solo objetivo general.
4. Presionar "Presentar Plan".
**Esperado:** Mensaje "Debe registrar al menos dos objetivos específicos".
**Obtenido:** El sistema permite presentar y el expediente queda en PLAN_PRESENTADO.
**Evidencia:** [captura]
**Severidad:** Alta
```

---

## 12. Consideraciones finales

- Ejecutar el flujo completo al menos una vez por tipo de práctica: `INICIAL`, `FINAL` y `PROFESIONAL`.
- Registrar todos los resultados en la matriz antes de dar por terminada la ronda de pruebas.
- No saltear casos negativos: son los que más problemas de seguridad y reglas de negocio detectan.
- Si se encuentra un error crítico, detener la prueba del flujo afectado, reportarlo y esperar corrección antes de continuar.

*Fin del documento.*
