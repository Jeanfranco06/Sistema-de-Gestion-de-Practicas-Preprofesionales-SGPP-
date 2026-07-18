# 🚀 SGPP - Usuarios de Prueba y Cheatsheet

## Credenciales de Inicio de Sesión

Todos los usuarios usan la misma contraseña: `password123`

### 👩‍🎓 Estudiantes
| Usuario | Nombre | Rol | Expediente |
|---------|--------|-----|------------|
| `estudiante1` | Juan Carlos Pérez López | ESTUDIANTE | EXP-2024-0001 |
| `estudiante2` | Ana Lucía Mendoza Vega | ESTUDIANTE | EXP-2024-0002 |
| `estudiante3` | Pedro Antonio Castillo Ríos | ESTUDIANTE | EXP-2024-0003 |

### 👨‍🏫 Docentes
| Usuario | Nombre | Rol |
|---------|--------|-----|
| `docente1` | María Elena Rodríguez García | DOCENTE_ASESOR |
| `docente2` | Carmen Rosa Vargas Silva | DOCENTE_ASESOR |
| `docente3` | Miguel Angel Ramos Paredes | DOCENTE_ASESOR |

### 🏢 Tutores Externos
| Usuario | Nombre | Rol | Empresa |
|---------|--------|-----|---------|
| `tutor1` | Carlos Alberto Fernández Martínez | TUTOR_EXTERNO | Empresa Ejemplo S.A.C. |
| `tutor2` | Rosa María Gutiérrez López | TUTOR_EXTERNO | Corporación Industrial S.A.C. |
| `tutor3` | José Luis Hernández Cruz | TUTOR_EXTERNO | Industrias del Norte S.A. |

### 👩‍💼 Secretaría
| Usuario | Nombre | Rol |
|---------|--------|-----|
| `secretaria1` | Ana María González Sánchez | SECRETARIA |
| `secretaria2` | Diana Elizabeth Campos Flores | SECRETARIA |

### 👥 Comité de Prácticas
| Usuario | Nombre | Rol |
|---------|--------|-----|
| `comite1` | Luis Fernando Torres Ramírez | COMITE_PRACTICAS |
| `comite2` | Fernando Javier Salinas Moya | COMITE_PRACTICAS |

### 🎯 Coordinador y Director
| Usuario | Nombre | Rol |
|---------|--------|-----|
| `coordinador1` | Roberto Carlos Díaz Morales | COORDINADOR |
| `director1` | Jorge Luis Ruiz Herrera | DIRECTOR |

### 🔧 Administrador del Sistema
| Usuario | Nombre | Rol |
|---------|--------|-----|
| `adminsys1` | Sistema TI Admin | ADMIN_SISTEMA |

## Expedientes de Prueba

| Código | Estudiante | Estado |
|--------|------------|--------|
| `EXP-2024-0001` | estudiante1 | EN_EJECUCION |
| `EXP-2024-0002` | estudiante2 | PLAN_PRESENTADO |
| `EXP-2024-0003` | estudiante3 | EMPRESA_SEDE_ASIGNADA |

## Roles y Permisos

| Rol | Módulos Disponibles |
|-----|----------------------|
| **ESTUDIANTE** | Dashboard, Documentos, Sedes, Perfil |
| **DOCENTE_ASESOR** | Dashboard, Lista de practicantes, Evaluaciones |
| **TUTOR_EXTERNO** | Dashboard, Lista de practicantes, Evaluaciones |
| **SECRETARIA** | Dashboard, Recepción Administrativa, Validación de requisitos, Sedes, Empresas, Convenios, Reportes |
| **COMITE_PRACTICAS** | Dashboard, Panel Comité, Expedientes, Reportes |
| **COORDINADOR** | Dashboard, Expedientes, Reportes, Sedes, Empresas, Convenios |
| **ADMIN_SISTEMA** | TODO: Usuarios, Tutores, Validación de requisitos, Sedes, Empresas, Convenios, Reportes, Parámetros |

## Pasos para la Prueba Completa

1. **Como SECRETARIA** (`secretaria1`):
   - Validar requisitos de estudiantes
   - Gestionar expedientes, sedes y empresas
   - Recibir documentos

2. **Como DOCENTE_ASESOR** (`docente1`):
   - Ver lista de practicantes asignados
   - Aprobar/rechazar planes
   - Evaluar documentos

3. **Como TUTOR_EXTERNO** (`tutor1`):
   - Ver sus practicantes
   - Realizar evaluaciones

4. **Como COMITE_PRACTICAS** (`comite1`):
   - Evaluar expedientes y emitir dictámenes

5. **Como COORDINADOR** (`coordinador1`):
   - Ver reportes globales
   - Asignar asesores y comités

6. **Como ESTUDIANTE** (`estudiante1`):
   - Gestionar sus documentos
   - Ver su expediente y plan de prácticas

## Observaciones Importantes

- Los documentos se guardan en el directorio `/app/uploads` dentro del contenedor del backend
- Las notificaciones se crean automáticamente en eventos importantes
- Todo cambio queda registrado en la auditoría (tabla `auditoria`)
