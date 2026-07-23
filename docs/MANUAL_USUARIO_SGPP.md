# Manual de Usuario del SGPP

## 1. Propósito y acceso

El Sistema de Gestión de Prácticas Preprofesionales (SGPP) administra el ciclo de vida de las prácticas de Ingeniería Industrial UNT: solicitud, validación, plan, ejecución, horas, evaluación, dictamen y constancia.

Acceda a `http://localhost:5173/login` con su usuario y contraseña. La sesión se cierra automáticamente si el token expira. Para recuperar el acceso, use **¿Olvidaste tu contraseña?**, solicite el enlace y defina una contraseña de al menos 8 caracteres, con mayúscula, minúscula y número.

Desde el avatar puede abrir **Perfil** para actualizar datos permitidos, cambiar la foto y cerrar sesión. **Notificaciones** muestra avisos de cambios de estado, observaciones, aprobaciones y acciones pendientes.

## 2. Roles y navegación

Cada usuario solo ve los módulos y expedientes autorizados. Un usuario con varios roles conserva los accesos de cada uno.

| Rol | Función principal |
|---|---|
| Estudiante | Solicita y ejecuta su práctica; presenta documentos, plan e informes. |
| Secretaría | Revisa requisitos, valida expedientes y asigna asesores de práctica inicial. |
| Docente asesor | Supervisa, revisa y evalúa prácticas iniciales asignadas. |
| Tutor externo | Valida horas y evalúa al practicante en la empresa. |
| Comité de prácticas | Revisa planes, informes y dictámenes de prácticas final/profesional asignadas. |
| Coordinador / Director | Supervisa expedientes, emite documentos institucionales y asigna comité. |
| Administrador / Administrador del sistema | Administra catálogos, usuarios, expedientes, reportes y, según el rol, parámetros. |

Las rutas principales son: estudiante `/estudiante/dashboard`, docente `/docente/dashboard`, tutor `/tutor/dashboard`, comité `/comite/panel`, coordinación `/coordinacion/dashboard` y administración `/admin/dashboard`.

## 3. Módulo Estudiante

### Solicitud y seguimiento

1. Abra **Solicitar práctica**.
2. Seleccione el tipo de práctica y una sede elegible.
3. Confirme la solicitud. El sistema valida requisitos académicos y crea el expediente.
4. Consulte **Mi práctica** para ver estado, fechas, documentos, horas y calificación.

Tipos vigentes: `INICIAL` (64 horas; evaluación por unidades) y `FINAL` / `PROFESIONAL` (360 horas y al menos tres meses; evaluación empresarial y de comité). La solicitud puede ser rechazada si no cumple las reglas académicas configuradas.

### Documentos, plan e informes

En **Documentos** cargue los archivos solicitados por el expediente. La carta de presentación la genera la institución; cargue la carta de aceptación cuando esté disponible. Si un documento es observado, se muestra su motivo y puede usar **Reemplazar** para subir una nueva versión.

En **Plan de prácticas** complete el Anexo 1 estructurado: datos de carátula, empresa, área, situación problemática, objetivos, técnicas/procedimientos y cronograma. Puede guardar borrador y luego **Presentar**. Si se observa el plan, corrija los campos indicados y use **Subsanar y reenviar**.

En **Informes** presente los avances requeridos. Para práctica inicial, el informe final se habilita después del segundo informe parcial. Los informes observados pueden reenviarse. También puede descargar la plantilla de informe final desde esta pantalla.

### Horas, evaluación y perfil

Después de que el expediente esté **En ejecución**, registre fecha, intervalo horario y descripción de actividades en **Horas**. El tutor externo valida o rechaza cada registro; el resumen distingue horas registradas y validadas.

En **Mis evaluaciones** consulte calificación final, notas de las tres unidades (práctica inicial), evaluaciones registradas y componentes del Anexo 4 (final/profesional). En **Perfil académico** mantenga actualizados los datos que la pantalla permita modificar. **Centros de práctica** permite consultar empresas y sedes disponibles.

## 4. Módulo Secretaría

Use **Recepción administrativa** para revisar solicitudes, checklist y datos académicos. Registre incidencias cuando falte información y valide el expediente únicamente cuando cumpla los requisitos; con ello queda listo para la carta de presentación.

Después de presentar la carta de aceptación, asigne un docente asesor solo a expedientes de práctica inicial. Secretaría puede iniciar la ejecución cuando el expediente y sus aprobaciones previas lo permitan. En **Validar requisitos** se mantienen los requisitos académicos y su verificación operativa.

## 5. Módulo Docente Asesor

En **Dashboard** y **Mis practicantes** consulte exclusivamente los expedientes asignados. Abra **Documentos** para revisar archivos: inicie revisión, apruebe o observe; una observación debe explicar la corrección requerida.

Revise y apruebe u observe el plan de la práctica inicial. En **Evaluación**, registre las notas de las unidades 1 a 3 en escala 0 a 20. La unidad 1 combina plan (20 %) e informe de avance (80 %); las unidades 2 y 3 se basan en el informe. Al completar las tres, el sistema actualiza la calificación final. Para una práctica desaprobada, los roles autorizados pueden habilitar y registrar el examen de aplazados.

## 6. Módulo Tutor Externo

En el dashboard consulte únicamente practicantes vinculados a su empresa. Desde **Horas** abra cada expediente para validar o rechazar registros, revisando el resumen de cumplimiento.

En **Practicantes** o **Evaluaciones** abra la evaluación empresarial (Anexo 2). Complete todos los criterios requeridos. En prácticas final y profesional la calificación puede ser cualitativa (`Logrado`, `En proceso`, `No logrado`) según el tipo configurado; no sustituye la evaluación del comité.

## 7. Módulo Comité de Prácticas

El **Panel de comité** muestra solo expedientes final o profesional donde el integrante tiene una asignación activa. Revise el Anexo 1, observe con comentario o apruebe el plan; posteriormente revise y apruebe el informe final.

En **Evaluación** se consolidan los componentes del Anexo 4: plan (10 %), evaluación de empresa (50 %, solo lectura) e informe (40 %). Cuando corresponda, emita el dictamen con comentario. El comité puede consultar horas, documentos e historial, pero no registra horas de estudiantes.

## 8. Módulo Coordinación y Dirección

El dashboard y el detalle de expediente permiten consultar trazabilidad, documentos, horas, observaciones y estado. Las acciones disponibles dependen del estado y el rol.

Coordinación/Dirección puede:

- Emitir la carta de presentación después de la validación de secretaría.
- Asignar de uno a tres integrantes activos de comité a prácticas final/profesional.
- Aprobar u observar plan e informe final cuando esté autorizado.
- Iniciar ejecución indicando fecha de inicio y duración en semanas.
- Emitir dictamen y constancia cuando se cumplan los requisitos de cierre.

La constancia verifica horas, documentos y evaluación. Si procede, el sistema cierra primero el expediente y genera el PDF institucional trazable.

## 9. Módulo Administración

**Usuarios** administra usuarios y roles autorizados. **Tutores**, **Empresas**, **Sedes** y **Convenios** mantienen los catálogos institucionales. Deshabilite registros en lugar de eliminar información histórica cuando la pantalla ofrezca esa opción.

En **Expedientes** realice consultas y filtros administrativos. Los roles `ADMIN_SISTEMA` y `ADMINISTRADOR` pueden efectuar un cambio manual de estado dejando observación; úselo solo para correcciones administrativas justificadas.

**Reportes** y el dashboard muestran indicadores y permiten exportación. Solo `ADMIN_SISTEMA` administra en **Configuración** los parámetros, reglas de plazo y requisitos académicos.

## 10. Flujo de práctica y estados

El flujo ordinario es:

`SOLICITADO` -> `EMPRESA_SEDE_ASIGNADA` -> `VALIDADO_SECRETARIA` -> `CARTA_PRESENTACION_EMITIDA` -> `CARTA_ACEPTACION_PRESENTADA` -> `ASESOR_ASIGNADO` o `COMITE_ASIGNADO` -> plan presentado/aprobado -> `EN_EJECUCION` -> informes y evaluación -> `EVALUADO` -> `DICTAMEN_EMITIDO` -> `CERRADO`.

Los estados de observación (`PLAN_OBSERVADO`, `OBSERVADO`, `SUBSANADO`) no eliminan el historial. La práctica inicial continúa con asesor, informes y notas por unidad. La final/profesional requiere comité, evaluación de tutor, informe/constancia empresarial, componentes Anexo 4 y dictamen.

Si una acción no aparece, revise el estado del expediente, los documentos pendientes y su rol. Para errores técnicos o acceso denegado, comuníquese con administración indicando el código del expediente y una captura del mensaje.

## Referencias

- Estado funcional detallado: [ESTADO_FUNCIONAL_SGPP.md](ESTADO_FUNCIONAL_SGPP.md)
- Usuarios locales de prueba: [USUARIOS_PRUEBA.md](USUARIOS_PRUEBA.md)
- Ejecución local: [GUIA_EJECUCION_LOCAL.md](GUIA_EJECUCION_LOCAL.md)
