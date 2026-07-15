const fs = require('fs');
const path = require('path');

const basePath = 'c:\\Users\\Diego\\Downloads\\cadena\\Sistema-de-Gestion-de-Practicas-Preprofesionales-SGPP-\\backend';
const artifactPath = 'C:\\Users\\Diego\\.gemini\\antigravity\\brain\\24979d1c-9837-4c91-a100-6252ae0cbf0f\\codigo_fuente_parte_2_completo.md';

let content = `# CÓDIGO FUENTE - PARTE 2
**Responsable:** Compañero B  
**Proyecto:** Sistema de Gestión de Prácticas Preprofesionales (SGPP)  
**Institución:** Universidad Nacional de Trujillo - Escuela Profesional de Ingeniería Industrial  

---

## 4. CONFIGURACIÓN DEL ENTORNO BACKEND (SPRING BOOT)

En esta sección se detalla la configuración del servidor, dependencias y seguridad.

`;

function addFile(title, desc, relativePath) {
    const fullPath = path.join(basePath, relativePath);
    content += `\n### ${title}\n`;
    content += `${desc}\n`;
    content += `**Archivo:** \`${relativePath}\`\n\n`;
    
    if (fs.existsSync(fullPath)) {
        let ext = path.extname(fullPath).substring(1);
        if (ext === 'yml') ext = 'yaml';
        content += `\`\`\`${ext}\n`;
        content += fs.readFileSync(fullPath, 'utf8');
        content += `\n\`\`\`\n`;
    } else {
        content += `*(El archivo no fue encontrado en la ruta especificada)*\n\n`;
    }
}

content += `\n### 4.1. Configuraciones de Construcción Maven (POM)\n`;
addFile("POM Padre", "Gestiona la versión de Spring Boot, dependencias globales y declara los submódulos Maven.", "pom.xml");
addFile("POM del módulo API", "Dependencias de API, web, Flyway, JWT y OpenAPI.", "sgpp-api\\pom.xml");
addFile("POM del módulo Core", "Configuración de JPA, validación y lógica de negocio.", "sgpp-core\\pom.xml");
addFile("POM del módulo Shared", "Configuración de utilidades compartidas.", "sgpp-shared\\pom.xml");

content += `\n### 4.2. Módulo de Inicialización y Configuración General (sgpp-api)\n`;
addFile("SgppApplication.java", "Clase principal de arranque del backend Spring Boot.", "sgpp-api\\src\\main\\java\\edu\\unt\\ingenieria_industrial\\sgpp\\api\\SgppApplication.java");
addFile("application.yml", "Parámetros generales de puerto, base de datos y configuración de Flyway.", "sgpp-api\\src\\main\\resources\\application.yml");

content += `\n### 4.3. Configuración de Seguridad y Filtros JWT (sgpp-api/security)\n`;
addFile("SecurityConfig.java", "Configura las políticas CORS, declara endpoints públicos y privados y define restricciones de acceso basadas en roles.", "sgpp-api\\src\\main\\java\\edu\\unt\\ingenieria_industrial\\sgpp\\api\\config\\SecurityConfig.java");
addFile("JwtAuthenticationFilter.java", "Filtro que intercepta las peticiones para validar el token JWT.", "sgpp-api\\src\\main\\java\\edu\\unt\\ingenieria_industrial\\sgpp\\api\\security\\JwtAuthenticationFilter.java");
addFile("JwtService.java", "Encapsula la creación, firma y verificación de los tokens JWT emitidos al iniciar sesión.", "sgpp-api\\src\\main\\java\\edu\\unt\\ingenieria_industrial\\sgpp\\api\\security\\JwtService.java");

content += `\n### 4.4. Módulo de Utilidades Compartidas (sgpp-shared)\n`;
addFile("GlobalExceptionHandler.java", "Captura los errores de forma centralizada y retorna respuestas JSON con códigos HTTP correctos.", "sgpp-shared\\src\\main\\java\\edu\\unt\\ingenieria_industrial\\sgpp\\shared\\exception\\GlobalExceptionHandler.java");
addFile("RolSistema.java", "Definición estricta de los roles de usuario en el sistema.", "sgpp-shared\\src\\main\\java\\edu\\unt\\ingenieria_industrial\\sgpp\\shared\\enums\\RolSistema.java");
addFile("EstadoPractica.java", "Definición de los estados del trámite de prácticas preprofesionales.", "sgpp-shared\\src\\main\\java\\edu\\unt\\ingenieria_industrial\\sgpp\\shared\\enums\\EstadoPractica.java");

content += `\n# 5. LÓGICA DE DOMINIO Y NEGOCIO (sgpp-core)\n\nEste es el núcleo de la aplicación. Contiene controladores, entidades JPA, repositorios y servicios con las reglas de negocio.\n`;

content += `\n### 5.1. Módulo de Gestión de Expedientes de Prácticas (expediente)\n`;
addFile("Expediente.java", "Entidad que representa el expediente completo del estudiante.", "sgpp-core\\src\\main\\java\\edu\\unt\\ingenieria_industrial\\sgpp\\core\\expediente\\model\\Expediente.java");
addFile("ExpedienteController.java", "Controlador REST para la gestión y consulta de expedientes.", "sgpp-core\\src\\main\\java\\edu\\unt\\ingenieria_industrial\\sgpp\\core\\expediente\\controller\\ExpedienteController.java");
addFile("ExpedienteService.java", "Interfaz del servicio de expedientes.", "sgpp-core\\src\\main\\java\\edu\\unt\\ingenieria_industrial\\sgpp\\core\\expediente\\service\\ExpedienteService.java");
addFile("ExpedienteServiceImpl.java", "Implementación de la lógica de negocio para expedientes.", "sgpp-core\\src\\main\\java\\edu\\unt\\ingenieria_industrial\\sgpp\\core\\expediente\\service\\impl\\ExpedienteServiceImpl.java");

content += `\n### 5.2. Módulo de Control de Horas (hora)\n`;
addFile("ControlHora.java", "Entidad para el control general de horas acumuladas y requeridas.", "sgpp-core\\src\\main\\java\\edu\\unt\\ingenieria_industrial\\sgpp\\core\\hora\\model\\ControlHora.java");
addFile("RegistroHora.java", "Entidad para los registros diarios de asistencia o bitácora de horas.", "sgpp-core\\src\\main\\java\\edu\\unt\\ingenieria_industrial\\sgpp\\core\\hora\\model\\RegistroHora.java");
addFile("ControlHoraService.java", "Interfaz del servicio para control de horas.", "sgpp-core\\src\\main\\java\\edu\\unt\\ingenieria_industrial\\sgpp\\core\\hora\\service\\ControlHoraService.java");
addFile("ControlHoraServiceImpl.java", "Lógica de validación de horas y registro de asistencia.", "sgpp-core\\src\\main\\java\\edu\\unt\\ingenieria_industrial\\sgpp\\core\\hora\\service\\impl\\ControlHoraServiceImpl.java");

content += `\n### 5.3. Módulo de Evaluaciones y Rúbricas (evaluacion)\n`;
addFile("EvaluacionController.java", "Controlador de Evaluaciones.", "sgpp-core\\src\\main\\java\\edu\\unt\\ingenieria_industrial\\sgpp\\core\\evaluacion\\controller\\EvaluacionController.java");
addFile("EvaluacionService.java", "Lógica del Servicio de Evaluaciones.", "sgpp-core\\src\\main\\java\\edu\\unt\\ingenieria_industrial\\sgpp\\core\\evaluacion\\service\\EvaluacionService.java");

content += `\n### 5.4. Módulo Académico, Sedes y Empresas (academico, empresarial, sedes)\n`;
addFile("Empresa.java", "Entidad Empresa.", "sgpp-core\\src\\main\\java\\edu\\unt\\ingenieria_industrial\\sgpp\\core\\empresarial\\model\\Empresa.java");
addFile("ConvenioService.java", "Servicio de Gestión de Convenios.", "sgpp-core\\src\\main\\java\\edu\\unt\\ingenieria_industrial\\sgpp\\core\\empresarial\\service\\ConvenioService.java");

content += `\n### 5.5. Módulos Transversales y de Reportes\n`;
addFile("NotificacionEventoService.java", "Servicio de notificaciones.", "sgpp-core\\src\\main\\java\\edu\\unt\\ingenieria_industrial\\sgpp\\core\\service\\NotificacionEventoService.java");
addFile("ReporteController.java", "Generación de reportes.", "sgpp-core\\src\\main\\java\\edu\\unt\\ingenieria_industrial\\sgpp\\core\\reporte\\controller\\ReporteController.java");

content += `\n# 6. PERSISTENCIA Y BASE DE DATOS (PostgreSQL + Flyway)\n`;

content += `\n### 6.1. Script de Estructura de la Base de Datos\n`;
addFile("V1__create_usuario_rol_tables.sql", "Creación de tablas de usuarios, roles y credenciales básicas.", "sgpp-api\\src\\main\\resources\\db\\migration\\V1__create_usuario_rol_tables.sql");
addFile("V4__create_sedes_tables.sql", "Estructura de sedes y convenios.", "sgpp-api\\src\\main\\resources\\db\\migration\\V4__create_sedes_tables.sql");
addFile("V6__create_documentos_tables.sql", "Gestión de archivos subidos.", "sgpp-api\\src\\main\\resources\\db\\migration\\V6__create_documentos_tables.sql");
addFile("V21__create_validacion_academica_tables.sql", "Flujo de validaciones curriculares.", "sgpp-api\\src\\main\\resources\\db\\migration\\V21__create_validacion_academica_tables.sql");
addFile("V25__ampliar_expediente_y_nuevas_tablas.sql", "Relación con el Comité y validaciones finales.", "sgpp-api\\src\\main\\resources\\db\\migration\\V25__ampliar_expediente_y_nuevas_tablas.sql");
addFile("V28__create_control_hora_tables.sql", "Tablas del control de asistencia y bitácora de horas.", "sgpp-api\\src\\main\\resources\\db\\migration\\V28__create_control_hora_tables.sql");
addFile("V31__create_notificacion_tables.sql", "Bandeja de notificaciones internas.", "sgpp-api\\src\\main\\resources\\db\\migration\\V31__create_notificacion_tables.sql");

content += `\n### 6.2. Datos Semilla (Seed Data)\n`;
addFile("V8__insert_seed_data_dominio.sql", "Inserciones de criterios y configuraciones iniciales.", "sgpp-api\\src\\main\\resources\\db\\migration\\V8__insert_seed_data_dominio.sql");
addFile("V24__seed_demo_users.sql", "Usuarios por defecto para pruebas del sistema.", "sgpp-api\\src\\main\\resources\\db\\migration\\V24__seed_demo_users.sql");
addFile("V35__seed_expedientes_y_datos_completos.sql", "Poblado inicial de datos para demostración.", "sgpp-api\\src\\main\\resources\\db\\migration\\V35__seed_expedientes_y_datos_completos.sql");

fs.writeFileSync(artifactPath, content);
console.log("Documento generado con exito en " + artifactPath);
