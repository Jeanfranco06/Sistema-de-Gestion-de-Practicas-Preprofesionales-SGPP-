# Pruebas E2E

Las pruebas usan Playwright y requieren que la API este disponible en `http://localhost:8082/api/v1`.

```powershell
# Una sola vez, instala el navegador de pruebas.
npx playwright install chromium

# Desde frontend/ ejecuta la suite.
npm run test:e2e
```

Por defecto usa `estudiante1` y `password123`. Se pueden reemplazar sin modificar archivos:

```powershell
$env:E2E_USERNAME = 'usuario'
$env:E2E_PASSWORD = 'clave'
npm run test:e2e
```
