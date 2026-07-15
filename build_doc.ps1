$artifactPath = "C:\Users\Diego\.gemini\antigravity\brain\24979d1c-9837-4c91-a100-6252ae0cbf0f\codigo_fuente_parte_2_completo.md"
$basePath = "c:\Users\Diego\Downloads\cadena\Sistema-de-Gestion-de-Practicas-Preprofesionales-SGPP-\backend"

Function Add-FileToDoc {
    param ($title, $desc, $relativePath)
    $fullPath = Join-Path $basePath $relativePath
    Add-Content $artifactPath "

$desc"
    Add-Content $artifactPath "
**Archivo:** $title ($relativePath)"
    if (Test-Path $fullPath) {
        $ext = (Get-Item $fullPath).Extension.TrimStart('.')
        if ($ext -eq 'yml') { $ext = 'yaml' }
        if ($ext -eq 'xml') { $ext = 'xml' }
        Add-Content $artifactPath "```"
        Get-Content $fullPath | Add-Content $artifactPath
        Add-Content $artifactPath "```"
    } else {
        Add-Content $artifactPath "*(El archivo no fue encontrado en la ruta especificada)*"
    }
}

Set-Content $artifactPath "# 4. CONFIGURACIÓN DEL ENTORNO BACKEND (SPRING BOOT)

En esta sección se detalla la configuración del servidor, dependencias y seguridad.
"

Add-Content $artifactPath "
### 4.1. Configuraciones de Construcción Maven (POM)"
Add-FileToDoc "POM Padre" "Gestiona la versión de Spring Boot, dependencias globales y declara los submódulos Maven." "pom.xml"
Add-FileToDoc "POM del módulo API" "Dependencias de API, web, Flyway, JWT y OpenAPI." "sgpp-api\pom.xml"
Add-FileToDoc "POM del módulo Core" "Configuración de JPA, validación y lógica de negocio." "sgpp-core\pom.xml"
Add-FileToDoc "POM del módulo Shared" "Configuración de utilidades compartidas." "sgpp-shared\pom.xml"

Add-Content $artifactPath "
### 4.2. Módulo de Inicialización y Configuración General (sgpp-api)"
Add-FileToDoc "SgppApplication.java" "Clase principal de arranque del backend Spring Boot." "sgpp-api\src\main\java\edu\unt\ingenieria_industrial\sgpp\api\SgppApplication.java"
Add-FileToDoc "application.yml" "Parámetros generales de puerto, base de datos y configuración de Flyway." "sgpp-api\src\main\resources\application.yml"

Add-Content $artifactPath "
### 4.3. Configuración de Seguridad y Filtros JWT (sgpp-api/security)"
Add-FileToDoc "SecurityConfig.java" "Configura las políticas CORS, declara endpoints públicos y privados y define restricciones de acceso basadas en roles." "sgpp-api\src\main\java\edu\unt\ingenieria_industrial\sgpp\api\config\SecurityConfig.java"
Add-FileToDoc "JwtAuthenticationFilter.java" "Filtro que intercepta las peticiones para validar el token JWT." "sgpp-api\src\main\java\edu\unt\ingenieria_industrial\sgpp\api\security\JwtAuthenticationFilter.java"
Add-FileToDoc "JwtService.java" "Encapsula la creación, firma y verificación de los tokens JWT emitidos al iniciar sesión." "sgpp-api\src\main\java\edu\unt\ingenieria_industrial\sgpp\api\security\JwtService.java"

Add-Content $artifactPath "
### 4.4. Módulo de Utilidades Compartidas (sgpp-shared)"
Add-FileToDoc "GlobalExceptionHandler.java" "Captura los errores de forma centralizada y retorna respuestas JSON con códigos HTTP correctos." "sgpp-shared\src\main\java\edu\unt\ingenieria_industrial\sgpp\shared\exception\GlobalExceptionHandler.java"
Add-FileToDoc "RolSistema.java" "Definición estricta de los roles de usuario en el sistema." "sgpp-shared\src\main\java\edu\unt\ingenieria_industrial\sgpp\shared\enums\RolSistema.java"
Add-FileToDoc "EstadoPractica.java" "Definición de los estados del trámite de prácticas preprofesionales." "sgpp-shared\src\main\java\edu\unt\ingenieria_industrial\sgpp\shared\enums\EstadoPractica.java"


Add-Content $artifactPath "
# 5. LÓGICA DE DOMINIO Y NEGOCIO (sgpp-core)

Este es el núcleo de la aplicación. Contiene controladores, entidades JPA, repositorios y servicios con las reglas de negocio."

Add-Content $artifactPath "
### 5.1. Módulo de Gestión de Expedientes de Prácticas (expediente)"
Add-FileToDoc "Expediente.java" "Entidad que representa el expediente completo del estudiante." "sgpp-core\src\main\java\edu\unt\ingenieria_industrial\sgpp\core\expediente\model\Expediente.java"
Add-FileToDoc "ExpedienteController.java" "Controlador REST para la gestión y consulta de expedientes." "sgpp-core\src\main\java\edu\unt\ingenieria_industrial\sgpp\core\expediente\controller\ExpedienteController.java"
Add-FileToDoc "ExpedienteService.java" "Interfaz del servicio de expedientes." "sgpp-core\src\main\java\edu\unt\ingenieria_industrial\sgpp\core\expediente\service\ExpedienteService.java"
Add-FileToDoc "ExpedienteServiceImpl.java" "Implementación de la lógica de negocio para expedientes." "sgpp-core\src\main\java\edu\unt\ingenieria_industrial\sgpp\core\expediente\service\impl\ExpedienteServiceImpl.java"

Add-Content $artifactPath "
### 5.2. Módulo de Control de Horas (hora)"
Add-FileToDoc "ControlHora.java" "Entidad para el control general de horas acumuladas y requeridas." "sgpp-core\src\main\java\edu\unt\ingenieria_industrial\sgpp\core\hora\model\ControlHora.java"
Add-FileToDoc "RegistroHora.java" "Entidad para los registros diarios de asistencia o bitácora de horas." "sgpp-core\src\main\java\edu\unt\ingenieria_industrial\sgpp\core\hora\model\RegistroHora.java"
Add-FileToDoc "ControlHoraService.java" "Interfaz del servicio para control de horas." "sgpp-core\src\main\java\edu\unt\ingenieria_industrial\sgpp\core\hora\service\ControlHoraService.java"
Add-FileToDoc "ControlHoraServiceImpl.java" "Lógica de validación de horas y registro de asistencia." "sgpp-core\src\main\java\edu\unt\ingenieria_industrial\sgpp\core\hora\service\impl\ControlHoraServiceImpl.java"

Add-Content $artifactPath "
### 5.3. Módulo de Evaluaciones y Rúbricas (evaluacion)"
Add-FileToDoc "EvaluacionController.java" "Controlador de Evaluaciones." "sgpp-core\src\main\java\edu\unt\ingenieria_industrial\sgpp\core\evaluacion\controller\EvaluacionController.java"
Add-FileToDoc "EvaluacionService.java" "Lógica del Servicio de Evaluaciones." "sgpp-core\src\main\java\edu\unt\ingenieria_industrial\sgpp\core\evaluacion\service\EvaluacionService.java"

Add-Content $artifactPath "
### 5.4. Módulo Académico, Sedes y Empresas (academico, empresarial, sedes)"
Add-FileToDoc "Empresa.java" "Entidad Empresa." "sgpp-core\src\main\java\edu\unt\ingenieria_industrial\sgpp\core\empresarial\model\Empresa.java"
Add-FileToDoc "ConvenioService.java" "Servicio de Gestión de Convenios." "sgpp-core\src\main\java\edu\unt\ingenieria_industrial\sgpp\core\empresarial\service\ConvenioService.java"

Add-Content $artifactPath "
### 5.5. Módulos Transversales y de Reportes"
Add-FileToDoc "NotificacionEventoService.java" "Servicio de notificaciones." "sgpp-core\src\main\java\edu\unt\ingenieria_industrial\sgpp\core\service\NotificacionEventoService.java"
Add-FileToDoc "ReporteController.java" "Generación de reportes." "sgpp-core\src\main\java\edu\unt\ingenieria_industrial\sgpp\core\reporte\controller\ReporteController.java"


Add-Content $artifactPath "
# 6. PERSISTENCIA Y BASE DE DATOS (PostgreSQL + Flyway)
"

Add-Content $artifactPath "
### 6.1. Script de Estructura de la Base de Datos"
Add-FileToDoc "V1__create_usuario_rol_tables.sql" "Creación de tablas de usuarios, roles y credenciales básicas." "sgpp-api\src\main\resources\db\migration\V1__create_usuario_rol_tables.sql"
Add-FileToDoc "V4__create_sedes_tables.sql" "Estructura de sedes y convenios." "sgpp-api\src\main\resources\db\migration\V4__create_sedes_tables.sql"
Add-FileToDoc "V6__create_documentos_tables.sql" "Gestión de archivos subidos." "sgpp-api\src\main\resources\db\migration\V6__create_documentos_tables.sql"
Add-FileToDoc "V21__create_validacion_academica_tables.sql" "Flujo de validaciones curriculares." "sgpp-api\src\main\resources\db\migration\V21__create_validacion_academica_tables.sql"
Add-FileToDoc "V25__ampliar_expediente_y_nuevas_tablas.sql" "Relación con el Comité y validaciones finales." "sgpp-api\src\main\resources\db\migration\V25__ampliar_expediente_y_nuevas_tablas.sql"
Add-FileToDoc "V28__create_control_hora_tables.sql" "Tablas del control de asistencia y bitácora de horas." "sgpp-api\src\main\resources\db\migration\V28__create_control_hora_tables.sql"
Add-FileToDoc "V31__create_notificacion_tables.sql" "Bandeja de notificaciones internas." "sgpp-api\src\main\resources\db\migration\V31__create_notificacion_tables.sql"

Add-Content $artifactPath "
### 6.2. Datos Semilla (Seed Data)"
Add-FileToDoc "V8__insert_seed_data_dominio.sql" "Inserciones de criterios y configuraciones iniciales." "sgpp-api\src\main\resources\db\migration\V8__insert_seed_data_dominio.sql"
Add-FileToDoc "V24__seed_demo_users.sql" "Usuarios por defecto para pruebas del sistema." "sgpp-api\src\main\resources\db\migration\V24__seed_demo_users.sql"
Add-FileToDoc "V35__seed_expedientes_y_datos_completos.sql" "Poblado inicial de datos para demostración." "sgpp-api\src\main\resources\db\migration\V35__seed_expedientes_y_datos_completos.sql"

Write-Host "Done"
