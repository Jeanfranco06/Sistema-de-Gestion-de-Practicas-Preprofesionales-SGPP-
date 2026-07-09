# Auditoría del Flujo del Estudiante - SGPP

**Fecha:** 9 de julio de 2026  
**Objetivo:** Revisión integral del flujo del rol ESTUDIANTE según normativa UNT 2025 y reglamento de Ingeniería Industrial

---

## 1. PROBLEMAS ENCONTRADOS

### 1.1 Incoherencias en Tipos de Práctica

**Problema:** El sistema define tipos de práctica que no coinciden con la normativa.

**Estado actual:**
- Backend (V14__insert_tipo_practica_seed_data.sql): INICIAL (120h), FINAL (240h), PROFESIONAL (480h)
- Frontend (SolicitarPractica.jsx): Muestra INTERMEDIA que no existe en backend
- Contexto_SGPP.md: INICIAL (64h, 2 créditos), FINAL (360h, 3 meses), PROFESIONAL (360h)

**Normativa:**
- Reglamento Ingeniería Industrial: Solo INICIAL y FINAL/PROFESIONAL
- UNT 2025: Curriculares vs Extracurriculares
- No existe "INTERMEDIA" en normativa

**Impacto:** Alto - Confusión para estudiantes, evaluaciones incorrectas, incumplimiento normativo

---

### 1.2 Inconsistencia en Horas Requeridas

**Problema:** Las horas configuradas no coinciden entre sí ni con la normativa.

**Estado actual:**
- Base de datos: INICIAL=120h, FINAL=240h, PROFESIONAL=480h
- Documento base: INICIAL=64h, FINAL=360h, PROFESIONAL=360h
- Frontend Dashboard: INICIAL=120h, FINAL=180h, PROFESIONAL=200h

**Normativa:**
- Prácticas Iniciales: 64 horas (2 créditos académicos)
- Prácticas Finales: 360 horas (3 meses mínimo)
- Prácticas Profesionales: 360 horas (egresados, máx. 1 año)

**Impacto:** Alto - Validaciones incorrectas, cálculos de progreso erróneos

---

### 1.3 Estados del Expediente No Coherentes

**Problema:** Los estados del expediente no forman un flujo claro y completo según la normativa.

**Estado actual (ExpedienteServiceImpl.java):**
- SOLICITADO
- EMPRESA_SEDE_ASIGNADA
- VALIDADO_SECRETARIA
- CARTA_PRESENTACION_EMITIDA
- CARTA_ACEPTACION_PRESENTADA
- ASESOR_ASIGNADO
- COMITE_ASIGNADO
- PLAN_PRESENTADO
- PLAN_APROBADO
- PLAN_OBSERVADO
- EN_EJECUCION
- INFORME_PARCIAL_PRESENTADO
- INFORME_FINAL_PRESENTADO
- INFORME_FINAL_APROBADO
- EVALUADO
- CERRADO

**Problemas:**
- No hay estado para "Listo para emisión de carta"
- No hay estado para "Plan en revisión"
- No hay distinción clara entre observaciones de plan vs documentos
- No hay estado para "Constancia disponible"
- El flujo no distingue entre inicial y final/profesional

**Impacto:** Alto - Flujo confuso, transiciones incorrectas, bloqueos inadecuados

---

### 1.4 Documentos No Alineados con Normativa

**Problema:** Los tipos de documentos definidos no coinciden con los requisitos normativos.

**Estado actual (GestionDocumental.jsx):**
- INICIAL: CARTA_ACEPTACION, PLAN_PRACTICA, INFORME_PARCIAL, INFORME_FINAL, CONSTANCIA_CULMINACION, VISTO_BUENO
- FINAL: CARTA_ACEPTACION, PLAN_PRACTICA, INFORME_FINAL, CONSTANCIA_CULMINACION, FICHA_EVALUACION

**Normativa según Contexto_SGPP.md:**
- Carta de Presentación (emitida por Escuela)
- Carta de Aceptación (empresa)
- Plan de Prácticas (Anexo 1)
- Informes Parciales (semanas 5, 10, 15 para iniciales)
- Informe Final
- Ficha de Evaluación (Anexo 2 - empresa)
- Constancia de Prácticas (empresa)
- Calificación del Expediente (Anexo 4 - Comité)
- Constancia de Prácticas Concluidas (Dirección)

**Faltantes:**
- Carta de Presentación (no está en gestión documental del estudiante)
- Distinción entre constancia de empresa vs constancia de Dirección
- No hay manejo de Anexos específicos

**Impacto:** Medio - Documentos faltantes, confusión en requisitos

---

### 1.5 Evaluación No Diferenciada por Componente

**Problema:** El sistema de evaluación no implementa la estructura de tres componentes normativa.

**Estado actual (Evaluacion.java):**
- Evaluación genérica con puntajes
- No distingue entre: Plan (10%), Empresa (50%), Informe (40%)
- No hay manejo de evaluación por unidades académicas

**Normativa:**
- Componente 1: Plan de Prácticas (Docente Asesor) - 10 puntos (10%)
- Componente 2: Evaluación de empresa (Tutor Externo) - 50 puntos (50%)
- Componente 3: Informe Final (Comité) - 40 puntos (40%)
- Para curriculares: Promedio por unidades (Unidad 1, 2, 3)

**Impacto:** Alto - Cálculos incorrectos, notas no normativas

---

### 1.6 Informes Parciales No Siguen Normativa

**Problema:** El sistema de informes parciales no implementa las semanas específicas normativas.

**Estado actual (InformesPeriodicos.jsx):**
- Datos mock: Semana 5, 10, 15
- No hay validación de fechas reales
- No hay bloqueo por semana
- No hay distinción por tipo de práctica

**Normativa:**
- Prácticas Iniciales: Informes en semana 5, 10 y 15
- Prácticas Finales: Solo informe final
- Plazos específicos para cada informe

**Impacto:** Medio - Informes fuera de plazo, sin validación

---

### 1.7 Validaciones Académicas Incompletas

**Problema:** Las validaciones académicas no cubren todos los requisitos normativos.

**Estado actual (ValidacionAcademicaServiceImpl.java):**
- Matrícula activa
- Prerrequisitos (créditos)
- PPI aprobadas (para finales)
- Semestre mínimo
- Créditos mínimos

**Faltantes según normativa:**
- Para INICIAL: VIII ciclo, matrícula en curso
- Para FINAL: IX o X ciclo, aprobación de iniciales
- Para PROFESIONAL: Egresado (máx. 1 año)
- Validación de convenio vigente
- Validación de capacidad de sede

**Impacto:** Alto - Estudiantes no aptos pueden solicitar prácticas

---

### 1.8 Plazos Normativos No Implementados

**Problema:** Los plazos normativos no están configurados ni validados.

**Normativa:**
- Plan de prácticas: 15 primeros días del ciclo
- Observaciones al plan: 7 días calendario para levantar
- Observaciones a documentos: 10 días calendario
- Duración mínima finales: 360 horas / 3 meses

**Estado actual:**
- PlazoService existe pero no se usa completamente
- No hay validación de vencimiento de plazos
- No hay bloqueo de acciones fuera de plazo

**Impacto:** Alto - Incumplimiento de plazos, procesos fuera de norma

---

### 1.9 Frontend No Distingue Tipos de Práctica

**Problema:** El frontend trata todos los tipos de práctica de manera similar.

**Estado actual:**
- DashboardEstudiante.jsx: Usa misma lógica para todos los tipos
- GestionDocumental.jsx: Solo distingue INICIAL vs FINAL
- SolicitarPractica.jsx: Muestra INTERMEDIA que no existe
- InformesPeriodicos.jsx: Solo para iniciales

**Impacto:** Medio - UX confusa, funcionalidad incorrecta por tipo

---

### 1.10 Faltan Vistas Importantes

**Problema:** Faltan vistas necesarias para el flujo completo del estudiante.

**Faltantes:**
- Vista de detalle del expediente con timeline completo
- Vista de plan de prácticas (registro y visualización)
- Vista de observaciones con plazos
- Vista de seguimiento de horas
- Vista de evaluación y notas
- Vista de constancia final
- Vista de notificaciones

**Impacto:** Medio - Flujo incompleto, información no visible

---

## 2. CAMBIOS REQUERIDOS

### 2.1 Backend

#### 2.1.1 Corregir Tipos de Práctica
- Eliminar INTERMEDIA si existe
- Actualizar horas: INICIAL=64, FINAL=360, PROFESIONAL=360
- Agregar campo curricular (boolean)
- Agregar campo duración mínima en días

#### 2.1.2 Redefinir Estados del Expediente
- Crear enum con estados coherentes
- Implementar máquina de estados con transiciones válidas
- Distinguir flujos por tipo de práctica

#### 2.1.3 Implementar Evaluación por Componentes
- Crear entidades para cada componente de evaluación
- Implementar cálculo automático de promedio
- Diferenciar evaluación vigesimal vs cualitativa

#### 2.1.4 Implementar Validaciones Completas
- Agregar validación de ciclo académico
- Agregar validación de convenio vigente
- Agregar validación de capacidad de sede
- Implementar bloqueo por tipo de práctica

#### 2.1.5 Implementar Control de Plazos
- Configurar plazos normativos en parámetros
- Validar fechas límite
- Bloquear acciones fuera de plazo
- Notificar vencimientos

#### 2.1.6 Actualizar Documentos
- Agregar tipo CARTA_PRESENTACION
- Diferenciar constancias
- Agregar anexos normativos
- Implementar estados específicos por documento

### 2.2 Frontend

#### 2.2.1 Actualizar Dashboard
- Distinguir por tipo de práctica
- Mostrar timeline de estados
- Mostrar plazos y vencimientos
- Mostrar componentes de evaluación

#### 2.2.2 Actualizar SolicitarPractica
- Eliminar INTERMEDIA
- Mostrar requisitos por tipo
- Validar antes de enviar
- Mostrar normativa aplicable

#### 2.2.3 Actualizar GestionDocumental
- Agregar Carta de Presentación
- Diferenciar documentos por tipo
- Mostrar plazos de observación
- Implementar subsanación

#### 2.2.4 Actualizar InformesPeriodicos
- Validar semanas específicas
- Bloquear fuera de plazo
- Distinguir por tipo de práctica
- Mostrar historial

#### 2.2.5 Crear Vistas Faltantes
- DetalleExpediente con timeline
- PlanPracticas
- Observaciones
- SeguimientoHoras
- EvaluacionNotas
- ConstanciaFinal
- Notificaciones

---

## 3. FLUJO PROPUESTO

### 3.1 Prácticas Iniciales

1. **SOLICITADO** → Estudiante crea expediente
2. **EMPRESA_SEDE_ASIGNADA** → Estudiante selecciona empresa/sede
3. **VALIDADO_SECRETARIA** → Secretaría valida requisitos
4. **CARTA_PRESENTACION_EMITIDA** → Dirección emite carta
5. **CARTA_ACEPTACION_PRESENTADA** → Estudiante carga carta empresa
6. **ASESOR_ASIGNADO** → Sistema asigna asesor
7. **PLAN_PRESENTADO** → Estudiante carga plan (15 días)
8. **PLAN_EN_REVISION** → Asesor revisa
9. **PLAN_APROBADO** → Asesor aprueba
10. **EN_EJECUCION** → Inician prácticas
11. **INFORME_PARCIAL_1_PRESENTADO** → Semana 5
12. **INFORME_PARCIAL_2_PRESENTADO** → Semana 10
13. **INFORME_FINAL_PRESENTADO** → Semana 15
14. **EVALUACION_PENDIENTE** → Esperando calificaciones
15. **EVALUADO** → Calificaciones registradas
16. **CERRADO** → Constancia emitida

### 3.2 Prácticas Finales/Profesionales

1. **SOLICITADO** → Estudiante crea expediente
2. **EMPRESA_SEDE_ASIGNADA** → Estudiante selecciona empresa/sede
3. **VALIDADO_SECRETARIA** → Secretaría valida requisitos
4. **CARTA_PRESENTACION_EMITIDA** → Dirección emite carta
5. **CARTA_ACEPTACION_PRESENTADA** → Estudiante carga carta empresa
6. **COMITE_ASIGNADO** → Sistema asigna comité
7. **PLAN_PRESENTADO** → Estudiante carga plan (15 días)
8. **PLAN_EN_REVISION_COMITE** → Comité revisa
9. **PLAN_APROBADO** → Comité aprueba
10. **EN_EJECUCION** → Inician prácticas (mínimo 3 meses)
11. **INFORME_FINAL_PRESENTADO** → Estudiante carga informe
12. **INFORME_EN_REVISION** → Comité revisa
13. **INFORME_APROBADO** → Comité aprueba
14. **EVALUACION_EMPRESA_PENDIENTE** → Esperando evaluación empresa
15. **EVALUACION_COMPLETA** → Todas las evaluaciones registradas
16. **DICTAMEN_EMITIDO** → Comité emite dictamen
17. **CERRADO** → Constancia emitida

---

## 4. PRIORIDADES

### Alta Prioridad
1. Corregir tipos de práctica y horas
2. Redefinir estados del expediente
3. Implementar evaluación por componentes
4. Implementar validaciones académicas completas

### Media Prioridad
1. Implementar control de plazos
2. Actualizar documentos
3. Actualizar frontend existente
4. Crear vistas faltantes

### Baja Prioridad
1. Mejoras UX adicionales
2. Reportes avanzados
3. Notificaciones push

---

## 5. RIESGOS

- **Riesgo de datos existentes:** Cambiar tipos de práctica puede afectar expedientes activos
- **Riesgo de compatibilidad:** Cambios en estados pueden romper frontend
- **Riesgo normativo:** Implementación incorrecta puede causar incumplimiento
- **Riesgo de rendimiento:** Validaciones adicionales pueden afectar performance

---

## 6. CAMBIOS IMPLEMENTADOS

### 6.1 Backend

#### 6.1.1 Tipos de Práctica (V41)
- **Migración:** `V41__corregir_tipos_practica_normativa_unt2025.sql`
- **Cambios:**
  - Corregido horas: INICIAL=64, FINAL=360, PROFESIONAL=360
  - Agregados campos: `curricular`, `duracion_minima_dias`, `ciclo_minimo`, `creditos`, `condicion_acceso`
  - Eliminado tipo INTERMEDIA (no normado)
- **Entidad:** `TipoPractica.java` actualizada con nuevos campos
- **DTO:** `TipoPracticaDTO.java` actualizado
- **Servicio:** `TipoPracticaServiceImpl.java` actualizado

#### 6.1.2 Estados del Expediente
- **Nuevo Enum:** `EstadoExpediente.java` con 25 estados normativos
- **Validación:** Máquina de estados con transiciones válidas
- **Servicio:** `ExpedienteServiceImpl.java` actualizado para usar el enum
- **Compatibilidad:** Validación legacy para estados existentes

#### 6.1.3 Evaluación por Componentes
- **Nueva Entidad:** `ComponenteEvaluacion.java`
- **Repository:** `ComponenteEvaluacionRepository.java`
- **DTO:** `ComponenteEvaluacionDTO.java`
- **Servicio:** ` ComponenteEvaluacionService.java` e implementación
- **Lógica:** PLAN (10%), EMPRESA (50%), INFORME (40%)

#### 6.1.4 Validaciones Académicas
- **Servicio:** `ValidacionAcademicaServiceImpl.java` actualizado
- **Nuevas Reglas:**
  - `CURSOS_HASTA_DECIMO`: Validación de décimo ciclo
  - `EGRESADO`: Verificación de egreso
  - `ANIO_EGRESO_MAXIMO`: Validación de máximo 1 año desde egreso

#### 6.1.5 Plazos Normativos (V42)
- **Migración:** `V42__configurar_plazos_normativos_unt2025.sql`
- **Tabla:** `plazo_parametro` creada
- **Plazos configurados:**
  - Plan de prácticas: 15 días
  - Observaciones plan: 7 días
  - Observaciones documentos: 10 días
  - Informes parciales: semanas 5, 10, 15
  - Duración mínima: 90 días

#### 6.1.6 Tipos de Documentos (V43)
- **Migración:** `V43__actualizar_tipos_documento_normativa_unt2025.sql`
- **Nuevos tipos:**
  - CARTA_PRESENTACION
  - CARTA_ACEPTACION
  - PLAN_PRACTICA
  - FICHA_EVALUACION
  - CONSTANCIA_EMPRESA
  - INFORME_PARCIAL_1, INFORME_PARCIAL_2
  - INFORME_FINAL_INICIAL, INFORME_FINAL
  - DICTAMEN_FINAL
  - CONSTANCIA_CULMINACION

### 6.2 Frontend

#### 6.2.1 SolicitarPractica.jsx
- **Eliminado:** Tipo INTERMEDIA (no normado)
- **Actualizado:** Iconos y colores para 3 tipos

#### 6.2.2 DashboardEstudiante.jsx
- **Corregido:** Horas según normativa (INICIAL=64, FINAL=360, PROFESIONAL=360)
- **Actualizado:** Documentos obligatorios por tipo de práctica
- **Agregado:** Información específica del tipo de práctica (requisitos, informes)

#### 6.2.3 GestionDocumental.jsx
- **Actualizado:** Documentos obligatorios para INICIAL, FINAL y PROFESIONAL
- **Nuevos documentos:**
  - CARTA_PRESENTACION
  - INFORME_PARCIAL_1, INFORME_PARCIAL_2
  - FICHA_EVALUACION
  - CONSTANCIA_EMPRESA

#### 6.2.4 InformesPeriodicos.jsx
- **Actualizado:** HITOS con nombres descriptivos según normativa
- **Agregado:** Tipos de documento (INFORME_PARCIAL_1, INFORME_PARCIAL_2, INFORME_FINAL_INICIAL)
- **Semana específicas:** 5, 10, 15

### 6.3 Flujo de Inicio del Trámite

#### 6.3.1 Validaciones Académicas Automáticas (PracticaController)
- **Implementación:** Validación académica automática al solicitar práctica
- **Servicio:** ValidacionAcademicaService.validarEstudiante()
- **Lógica:** Valida requisitos académicos según tipo de práctica antes de crear expediente
- **Respuesta:** Retorna detalles de requisitos no cumplidos si aplica

#### 6.3.2 Generación de Documento de Solicitud (ExpedienteServiceImpl)
- **Implementación:** Generación automática de documento SOLICITUD_PRACTICA al crear expediente
- **Estado:** APROBADO por defecto (documento generado por sistema)
- **Migración:** V43 agregó tipo de documento SOLICITUD_PRACTICA
- **Componentes:** Inicialización automática de componentes de evaluación (PLAN, EMPRESA, INFORME)

#### 6.3.3 Frontend SolicitarPractica.jsx
- **Validación:** Manejo de errores de validación académica con SweetAlert2
- **UI:** Muestra detalles de requisitos no cumplidos de forma amigable
- **INTERMEDIA:** Eliminado tipo de práctica no normado

### 6.4 Perfil Académico del Estudiante

#### 6.4.1 Backend UsuarioController
- **Endpoint:** PUT /usuarios/estudiante/perfil-academico (solo estudiantes)
- **DTO:** EstudianteUpdateDTO con campos: semestreActual, creditosAprobados, promedioPonderado, fechaIngreso, estadoAcademico
- **Servicio:** UsuarioService.actualizarPerfilAcademico(username, dto)

#### 6.4.2 Frontend PerfilEstudiante.jsx
- **Formulario:** Actualización de información académica del estudiante
- **Verificación:** Indicadores visuales de CUMPLE/NO CUMPLE por tipo de práctica
- **Requisitos:** INICIAL (100 créditos/6to semestre), FINAL (180 créditos/9no semestre), PROFESIONAL (180 créditos/9no semestre)
- **API:** usuariosApi.actualizarPerfilAcademico(formData)
- **Ruta:** /estudiante/perfil agregada en App.jsx
- **Accesos:** Botón en DashboardEstudiante (icono persona) y menú "Mi perfil" en AppLayout

#### 6.4.3 Migración V44
- **Archivo:** V44__agregar_validacion_profesional.sql
- **Contenido:** Reglas de validación académica para tipo PROFESIONAL
- **Normas:** RE_II y L-UNT-2025 aplicadas a PROFESIONAL
- **Requisitos:** Matrícula activa, créditos mínimos, PPI aprobada, ciclo mínimo

## 7. TAREAS PENDIENTES

### 7.1 Media Prioridad
- Crear vista de detalle de expediente con timeline
- Crear vista de plan de prácticas
- Implementar validación de fechas en InformesPeriodicos
- Agregar endpoint para ComponenteEvaluacion en controller
- Integrar ComponenteEvaluacion en ExpedienteServiceImpl

### 7.2 Baja Prioridad
- Mejoras UX adicionales
- Reportes avanzados
- Notificaciones push

## 8. RECOMENDACIONES

1. **Testing:** Ejecutar migraciones y probar cambios en ambiente de desarrollo
2. **Data Migration:** Verificar datos existentes después de migraciones
3. **Validación:** Probar flujo completo para cada tipo de práctica
4. **Documentación:** Actualizar manual de usuario con nuevos requisitos
5. **Capacitación:** Capacitar a usuarios sobre cambios normativos
