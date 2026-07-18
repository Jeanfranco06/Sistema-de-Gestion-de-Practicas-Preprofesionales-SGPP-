# SGPP Agent Notes

## Layout

- `backend/` is a Java 17 Maven reactor: `sgpp-api` boots Spring Boot and owns configuration/Flyway resources; `sgpp-core` contains domain code and REST controllers; `sgpp-shared` contains common types, exceptions, and enums.
- `frontend/src/App.jsx` is the central route map; use `frontend/src/api/axios.js` for API calls.
- Add database migrations under `backend/sgpp-api/src/main/resources/db/migration/` as new versioned SQL files. Do not edit applied migrations.

## Commands

- From `backend/`, build all modules with `mvn clean package`; target the runnable API (and its reactor dependencies) with `mvn -pl sgpp-api -am package` or `mvn -pl sgpp-api -am test`.
- From `backend/`, run the API with `mvn -pl sgpp-api spring-boot:run`.
- From `frontend/`, run checks with `npm run lint` and `npm run build`. No frontend test script is configured.

## Local Integration

- Local Spring configuration is active by default and connects to PostgreSQL at `localhost:5434`; it defaults to API port `8082` with the `/api/v1` context path.
- `docker-compose.yml` starts only PostgreSQL (`5434`) and pgAdmin (`5051`); its backend and frontend services are commented out.
- Set `frontend/.env` to `VITE_API_BASE_URL=http://localhost:8082/api/v1` for local integration. This matches the Spring local profile and Vite `/api` proxy, unlike older documentation that references port `8080`.
