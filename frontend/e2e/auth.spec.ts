import { expect, test } from '@playwright/test';

const username = process.env.E2E_USERNAME || 'estudiante1';
const password = process.env.E2E_PASSWORD || 'password123';

test.describe('Autenticacion', () => {
  test('un estudiante inicia sesion y llega a su panel', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Usuario').fill(username);
    await page.locator('input[name="password"]').fill(password);
    const loginResponse = page.waitForResponse((response) =>
      response.url().endsWith('/auth/login') && response.request().method() === 'POST'
    );
    await page.getByRole('button', { name: 'Acceder al Sistema' }).click();
    const response = await loginResponse;

    test.skip(
      response.status() === 403,
      'La cuenta configurada para E2E está bloqueada o deshabilitada. Usa E2E_USERNAME/E2E_PASSWORD con una cuenta activa.'
    );
    expect(response.status()).toBe(200);

    await expect(page).toHaveURL(/\/estudiante\/dashboard/);
    await expect(page.getByRole('heading', { name: /dashboard|panel/i })).toBeVisible();
  });

  test('credenciales invalidas muestran un mensaje util', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Usuario').fill('usuario-inexistente');
    await page.locator('input[name="password"]').fill('clave-invalida');
    const loginResponse = page.waitForResponse((response) =>
      response.url().endsWith('/auth/login') && response.request().method() === 'POST'
    );
    await page.getByRole('button', { name: 'Acceder al Sistema' }).click();
    expect([401, 403]).toContain((await loginResponse).status());

    await expect(page.getByText(/Credenciales incorrectas|Tu cuenta está deshabilitada o bloqueada/)).toBeVisible();
  });
});
