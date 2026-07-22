# SGPP - Sistema de Gestión de Prácticas Preprofesionales

Sistema integral para la gestión de prácticas preprofesionales de la Escuela Profesional de Ingeniería Industrial de la Universidad Nacional de Trujillo (UNT). Este proyecto proporciona una plataforma unificada para estudiantes, docentes, tutores y personal administrativo.

![Estado](https://img.shields.io/badge/Estado-En%20Desarrollo-yellow)
![Backend](https://img.shields.io/badge/Backend-Spring_Boot_3-green)
![Frontend](https://img.shields.io/badge/Frontend-React-blue)
![Database](https://img.shields.io/badge/Database-PostgreSQL-blue)
![Docker](https://img.shields.io/badge/Infra-Docker_Compose-2496ED)

---

## 🛠️ Stack Tecnológico

| Capa             | Tecnología                                  |
| ---------------- | ------------------------------------------- |
| **Backend**      | Java 17 · Spring Boot 3.2 · Spring Security 6 (JWT) · Spring Data JPA · Flyway · OpenAPI/Swagger |
| **Frontend**     | React 19 · Vite 8 · MUI 9 · Axios · React Router |
| **Base de Datos** | PostgreSQL 15+                              |
| **Infraestructura** | Docker · Docker Compose                  |

---

## 📂 Estructura del Proyecto

```text
SGPP/
├── .env.example            # 🔑 Plantilla de variables de entorno
├── docker-compose.yml      # 🐳 Infraestructura local (DB + pgAdmin)
├── .gitignore
│
├── backend/                # ☕ Spring Boot (Multi-Módulo Maven)
│   ├── pom.xml             # POM Padre
│   ├── sgpp-api/           # Ensamblaje, Config REST, Security, Flyway
│   ├── sgpp-core/          # Lógica de Dominio (Package-by-Feature)
│   └── sgpp-shared/        # Componentes compartidos (Excepciones, Enums)
│
├── frontend/               # ⚛️ React + Vite
│   ├── .env.example
│   ├── package.json
│   └── src/
│
└── README.md
```

---

## ⚡ Inicio Rápido

> **Requisitos previos:** Docker, Java 17+, Maven 3.8+, Node.js 18+

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd "SG de Practicas Pre profesionales"

# 2. Configurar variables de entorno
copy .env.example .env                     # Windows
copy frontend\.env.example frontend\.env   # Windows

# 3. Levantar la base de datos
docker-compose up -d

# 4. Compilar y ejecutar el backend
cd backend
mvn clean install -DskipTests
mvn -pl sgpp-api spring-boot:run

# 5. En otra terminal, ejecutar el frontend
cd frontend
npm install
npm run dev
```

| Servicio       | URL                                          |
| -------------- | -------------------------------------------- |
| Frontend       | http://localhost:5173                          |
| Backend API    | http://localhost:8082/api/v1                   |
| Swagger UI     | http://localhost:8082/api/v1/swagger-ui.html   |
| pgAdmin        | http://localhost:5051                           |

> 📘 **Guía detallada paso a paso:** consulta [`GUIA_EJECUCION_LOCAL.md`](GUIA_EJECUCION_LOCAL.md) para instrucciones completas, troubleshooting y configuración de IDE.

---

## ⚙️ Variables de Entorno

El proyecto utiliza un archivo `.env` centralizado en la raíz. Copia `.env.example` como `.env` y ajusta los valores a tu entorno:

| Variable                  | Descripción                        | Valor por defecto          |
| ------------------------- | ---------------------------------- | -------------------------- |
| `POSTGRES_DB`             | Nombre de la base de datos         | `sgpp_db`                  |
| `POSTGRES_USER`           | Usuario de PostgreSQL              | `postgres`                 |
| `POSTGRES_PASSWORD`       | Contraseña de PostgreSQL           | `postgres`                 |
| `POSTGRES_PORT`           | Puerto de PostgreSQL               | `5432`                     |
| `PGADMIN_DEFAULT_EMAIL`   | Email de acceso a pgAdmin          | `admin@sgpp.local`         |
| `PGADMIN_DEFAULT_PASSWORD`| Contraseña de pgAdmin              | `admin`                    |
| `JWT_SECRET`              | Clave secreta para firmar tokens   | *(ver .env.example)*       |
| `JWT_EXPIRATION`          | Duración del token JWT (ms)        | `86400000` (24h)           |
| `VITE_API_BASE_URL`       | URL base de la API para el frontend| `http://localhost:8080/api/v1` |

> **⚠️ Importante:** El archivo `.env` está en `.gitignore` y **nunca** debe subirse al repositorio. Solo `.env.example` se versiona como referencia.

---

## 🔐 Usuarios de Prueba (Datos Semilla)

Flyway inserta usuarios predefinidos la primera vez que se ejecuta. Todos usan la contraseña **`password123`**:

| Username       | Rol              |
| -------------- | ---------------- |
| adminsys1      | ADMIN_SISTEMA    |
| estudiante1    | ESTUDIANTE       |
| docente1       | DOCENTE_ASESOR   |
| tutor1         | TUTOR_EXTERNO    |
| secretaria1    | SECRETARIA       |
| comite1        | COMITE_PRACTICAS |
|                                                         .3

| director1      | DIRECTOR         |

---

## 📖 Documentación de la API

La API RESTful está documentada con OpenAPI 3. Con el backend en ejecución:

- **Swagger UI:** [http://localhost:8080/api/v1/swagger-ui.html](http://localhost:8080/api/v1/swagger-ui.html)
- **OpenAPI JSON:** [http://localhost:8080/api/v1/api-docs](http://localhost:8080/api/v1/api-docs)
- **Ejemplos de Requests:** [`API_TEST_EXAMPLES.md`](API_TEST_EXAMPLES.md)

---

## 📞 Contacto

Escuela Profesional de Ingeniería Industrial  
Universidad Nacional de Trujillo  
Email: soporte@unt.edu.pe
