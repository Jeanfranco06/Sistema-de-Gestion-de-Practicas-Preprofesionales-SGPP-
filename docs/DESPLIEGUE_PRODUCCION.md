# Despliegue de Produccion

Esta configuracion despliega el frontend en Vercel, la API en Render y PostgreSQL junto con el almacenamiento privado de documentos en Supabase. Los tres servicios ofrecen planes gratuitos con limites y politicas que deben revisarse antes de un uso institucional.

## Arquitectura

```text
Navegador -> Vercel (React) -> Render (Spring Boot) -> Supabase PostgreSQL
                                              -> Supabase Storage privado
```

Los documentos no se guardan en el disco de Render, porque este puede ser efimero. La API conserva la autorizacion de descarga y usa la clave de servidor para leer y escribir en Supabase Storage.

## 1. Crear Supabase

1. Cree un proyecto de Supabase y guarde la contrasena de la base de datos.
2. En `Connect`, copie la cadena de conexion PostgreSQL recomendada para servidores. Conviertala a JDBC: `jdbc:postgresql://HOST:PUERTO/postgres?sslmode=require`.
3. Guarde el usuario y la contrasena correspondientes como `SPRING_DATASOURCE_USERNAME` y `SPRING_DATASOURCE_PASSWORD`. Si usa el pooler, el nombre de usuario puede incluir el identificador del proyecto.
4. En Storage cree el bucket privado `sgpp-documentos`. No lo marque como publico.
5. En `Project Settings > API Keys`, copie `Project URL` y una `Secret key` con prefijo `sb_secret_`. Esta clave solo se configura en Render; nunca se expone en Vercel ni se sube al repositorio.

## 2. Desplegar la API en Render

1. Publique este repositorio en GitHub, GitLab o Bitbucket sin archivos `.env` ni secretos.
2. En Render cree un Blueprint desde el repositorio. El archivo `render.yaml` crea el servicio Docker con raiz `backend` y verifica `GET /api/v1/actuator/health`.
3. Configure estas variables secretas en el servicio. Render debe usar el perfil `prod`, ya declarado por el Blueprint.

| Variable | Valor |
| --- | --- |
| `SPRING_DATASOURCE_URL` | URL JDBC de Supabase con `sslmode=require` |
| `SPRING_DATASOURCE_USERNAME` | Usuario de la conexion de Supabase |
| `SPRING_DATASOURCE_PASSWORD` | Contrasena de la conexion de Supabase |
| `CORS_ALLOWED_ORIGINS` | URL exacta del frontend, por ejemplo `https://sgpp.vercel.app` |
| `SUPABASE_URL` | Project URL de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | `Secret key` de Supabase (`sb_secret_...`) |
| `SUPABASE_STORAGE_BUCKET` | `sgpp-documentos` |
| `JWT_SECRET` | Se genera automaticamente en el Blueprint; conserve el mismo valor entre despliegues |
| `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`, `MAIL_SMTP_AUTH`, `MAIL_STARTTLS` | Solo si se habilita envio de correo |
| `SGPP_EMAIL_ENABLED` | `true` solo despues de configurar SMTP |
| `SWAGGER_ENABLED` | `false` normalmente; `true` solo para soporte temporal |

`JWT_SECRET` debe ser un secreto Base64 largo y aleatorio. Puede generarse con `openssl rand -base64 64`. No lo rote mientras existan sesiones que deban seguir vigentes.

4. Espere que Flyway complete las migraciones y compruebe `https://<api>.onrender.com/api/v1/actuator/health`. La respuesta debe contener `"status":"UP"`.
5. Mantenga `SUPABASE_STORAGE_BUCKET` privado. La API descarga los archivos autenticando al usuario, por lo que no se deben crear politicas publicas para ese bucket.

### Reparar un primer despliegue fallido

Si el log muestra `Migration V2__insert_seed_data.sql failed` y `relation "rol" does not exist`, el esquema fue marcado erróneamente con una línea base y V1 no llegó a ejecutarse. Después de publicar esta configuración, que desactiva `baseline-on-migrate` en producción, abra el SQL Editor de Supabase y ejecute solo en una base nueva sin datos reales:

```sql
DROP TABLE IF EXISTS public.flyway_schema_history;
```

Después haga un despliegue manual en Render. Flyway ejecutará V1, creará `rol` y continuará con V2. No ejecute esta sentencia en una base que ya tenga datos de producción o un historial Flyway válido.

## 3. Desplegar el frontend en Vercel

1. Importe el mismo repositorio en Vercel.
2. Configure `Root Directory` como `frontend`, framework Vite y el comando de compilacion `npm run build`.
3. Defina la variable de compilacion `VITE_API_BASE_URL=https://<api>.onrender.com/api/v1` para Production y Preview si las vistas previas deben usar la API.
4. Despliegue. `frontend/vercel.json` redirige las rutas del SPA a `index.html` para que funcionen enlaces directos y recargas.
5. Copie el dominio final de Vercel a `CORS_ALLOWED_ORIGINS` en Render y redespliegue la API. Use solo origenes HTTPS concretos, separados por comas; no use `*`.

## 4. Puesta en marcha segura

1. Los datos semilla incluyen cuentas de demostracion con la contrasena conocida `password123`. Antes de entregar la URL a usuarios, cambie la contrasena de cada cuenta habilitada o deshabilite/elimine las cuentas demo desde un administrador autorizado.
2. Cree las cuentas reales y pruebe acceso, carga y descarga de un PDF menor de 10 MB, generacion de documento y restablecimiento de contrasena si SMTP esta habilitado.
3. Compruebe desde un origen distinto que la API rechaza CORS y que `/swagger-ui.html` no esta disponible si `SWAGGER_ENABLED=false`.
4. Configure copias de seguridad de PostgreSQL y del bucket. Los planes gratuitos no sustituyen una politica de respaldo institucional.
5. Vigile los limites de uso y suspension por inactividad de los planes gratuitos. Un backend suspendido puede tardar en responder tras un periodo sin trafico.

## Variables que no van al frontend

Solo `VITE_API_BASE_URL` pertenece a Vercel. Cualquier variable prefijada con `VITE_` queda incluida en el JavaScript publico. Nunca use ese prefijo para contrasenas, `JWT_SECRET`, la Secret key de Supabase ni credenciales de base de datos.

## Correo con Gmail

Para habilitar la bienvenida y recuperación de cuentas, use una cuenta de Gmail exclusiva para el sistema. Active la verificación en dos pasos y genere una contraseña de aplicación; Gmail no permite usar la contraseña normal de la cuenta para SMTP.

En Render configure:

```text
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=cuenta.del.sistema@gmail.com
MAIL_PASS=contraseña_de_aplicacion_de_16_caracteres
MAIL_SMTP_AUTH=true
MAIL_STARTTLS=true
SGPP_EMAIL_ENABLED=true
SGPP_FRONTEND_BASE_URL=https://<su-proyecto>.vercel.app
```

`SGPP_FRONTEND_BASE_URL` debe ser la URL HTTPS final de Vercel, sin `/api/v1`. La casilla **Enviar correo de bienvenida** al crear un usuario envía el nombre de usuario y un enlace de un solo uso para que la persona elija su contraseña; una contraseña nunca se envía por correo.
