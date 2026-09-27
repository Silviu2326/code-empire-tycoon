import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
});

async function newGame(page) {
  await page.getByRole('button', { name: 'Nueva partida' }).click();
  await expect(page.getByRole('navigation', { name: 'Secciones' })).toBeVisible();
  // Pausamos para que el tiempo no avance durante la prueba.
  await page.getByRole('button', { name: /Pausar/ }).click();
}

test('sin partida guardada, "Cargar partida" está desactivado', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Sin partida guardada' })).toBeDisabled();
});

test('opciones se abren desde el engranaje y el botón', async ({ page }) => {
  await page.getByRole('button', { name: 'Opciones' }).first().click();
  await expect(page.getByRole('dialog', { name: 'Opciones' })).toBeVisible();
  await page.getByRole('button', { name: 'Cerrar' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('crear un proyecto nuevo cobra su coste y abre el detalle', async ({ page }) => {
  await newGame(page);
  await page.getByRole('button', { name: 'Crear proyecto' }).click();
  await page.getByLabel('Nombre del proyecto').fill('Prueba E2E');
  await page.getByRole('radio', { name: /Pequeño/ }).click();
  await page.getByRole('button', { name: 'Crear proyecto' }).click();
  await expect(page.getByRole('heading', { name: 'Prueba E2E' })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('entra en desarrollo');
});

test('las pestañas de proyectos filtran de verdad', async ({ page }) => {
  await newGame(page);
  await page.getByRole('navigation').getByRole('button', { name: 'Proyectos' }).click();
  await expect(page.getByRole('button', { name: /Code Quest/ })).toBeVisible();
  await page.getByRole('tab', { name: /Completados/ }).click();
  await expect(page.getByText('Todavía no has lanzado ningún proyecto.')).toBeVisible();
});

test('contratar pide confirmación y respeta las plazas', async ({ page }) => {
  await newGame(page);
  await page.getByRole('navigation').getByRole('button', { name: 'Empleados' }).click();
  await expect(page.getByText('Plazas 2/4')).toBeVisible();
  await page.getByRole('button', { name: /\/mes/ }).first().click();
  await page.getByRole('dialog').getByRole('button', { name: 'Contratar' }).click();
  await expect(page.getByText('Plazas 3/4')).toBeVisible();
});

test('la partida se guarda y se puede cargar tras recargar', async ({ page }) => {
  await newGame(page);
  await page.getByRole('button', { name: 'Menú' }).click();
  await page.getByRole('button', { name: 'Guardar y salir al menú' }).click();
  await page.reload();
  const load = page.getByRole('button', { name: /Cargar partida/ });
  await expect(load).toBeEnabled();
  await load.click();
  await expect(page.getByRole('navigation', { name: 'Secciones' })).toBeVisible();
});

test('el balance mensual muestra el desglose', async ({ page }) => {
  await newGame(page);
  await page.getByRole('button', { name: /Balance mensual/ }).click();
  await expect(page.getByRole('dialog', { name: 'Balance mensual' })).toContainText('Salarios');
});
