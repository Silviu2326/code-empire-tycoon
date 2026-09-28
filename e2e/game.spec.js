import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
});

async function newGame(page) {
  await page.getByRole('button', { name: 'Nueva partida' }).click();
  await page
    .getByRole('dialog', { name: /Bienvenida/ })
    .getByRole('button', { name: '¡A programar!' })
    .click();
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
  await expect(page.getByText('Plazas 0/2')).toBeVisible();
  await page.getByRole('button', { name: /\/mes/ }).first().click();
  await page.getByRole('dialog').getByRole('button', { name: 'Contratar' }).click();
  await expect(page.getByText('Plazas 1/2')).toBeVisible();
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

test('desarrollar la idea inicial cumple el primer objetivo', async ({ page }) => {
  await newGame(page);
  await expect(page.getByText('Objetivos')).toBeVisible();
  await page.getByRole('navigation').getByRole('button', { name: 'Proyectos' }).click();
  await page.getByRole('button', { name: /Code Quest/ }).click();
  await expect(page.getByRole('heading', { name: 'Desarrollar idea' })).toBeVisible();
  await page.getByRole('button', { name: 'Crear proyecto' }).click();
  await expect(page.getByRole('heading', { name: 'Code Quest' })).toBeVisible();
  await page.getByRole('navigation').getByRole('button', { name: 'Oficina' }).click();
  await expect(page.getByText('1/7')).toBeVisible();
});

test('la pantalla de imperio muestra etapas, managers bloqueados y eventos', async ({ page }) => {
  await newGame(page);
  await page.getByRole('button', { name: 'Imperio', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Ruta del imperio' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Bloqueado' }).first()).toBeDisabled();
  await expect(page.getByText('Requisito: Nivel 4 y un producto lanzado')).toBeVisible();
});

test('exportar e importar una partida desde opciones', async ({ page }) => {
  await newGame(page);
  await page.getByRole('button', { name: 'Menú' }).click();
  await page.getByRole('button', { name: 'Opciones' }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar partida' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^code-empire-nivel1-2025-05\.json$/);
  const path = await download.path();

  await page.getByLabel('Archivo de partida').setInputFiles(path);
  await page.getByRole('button', { name: 'Importar y jugar' }).click();
  await expect(page.getByRole('navigation', { name: 'Secciones' })).toBeVisible();

  await page.getByRole('button', { name: 'Menú' }).click();
  await page.getByRole('button', { name: 'Opciones' }).click();
  await page
    .getByLabel('Archivo de partida')
    .setInputFiles({ name: 'mal.json', mimeType: 'application/json', buffer: Buffer.from('{}') });
  await expect(page.getByRole('alert')).toContainText('compatible');
});

test('Esc cierra solo el diálogo de arriba', async ({ page }) => {
  await newGame(page);
  await page.getByRole('button', { name: 'Menú' }).click();
  await page.getByRole('button', { name: 'Opciones' }).click();
  await page.getByRole('button', { name: 'Borrar partida guardada' }).click();
  await expect(page.getByRole('dialog', { name: 'Borrar partida' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Borrar partida' })).toHaveCount(0);
  await expect(page.getByRole('dialog', { name: 'Opciones' })).toBeVisible();
});

test('flujo completo: desarrollar, lanzar y cobrar un producto', async ({ page }) => {
  await newGame(page);
  await page.getByRole('navigation').getByRole('button', { name: 'Proyectos' }).click();
  await page.getByRole('button', { name: /Code Quest/ }).click();
  await page.getByRole('button', { name: 'Crear proyecto' }).click();
  await expect(page.getByRole('heading', { name: 'Code Quest' })).toBeVisible();

  // Adelantamos el desarrollo casi al final para no esperar meses reales.
  await page.getByRole('button', { name: 'Menú' }).click();
  await page.getByRole('button', { name: 'Guardar y salir al menú' }).click();
  await page.evaluate(() => {
    const key = 'code-empire-tycoon-save-v2';
    const game = JSON.parse(localStorage.getItem(key));
    game.projects = game.projects.map((project) => (project.status === 'dev' ? { ...project, progress: 99 } : project));
    game.speed = 4;
    localStorage.setItem(key, JSON.stringify(game));
  });
  await page.reload();
  await page.getByRole('button', { name: /Cargar partida/ }).click();
  const moneyBefore = await page.getByTitle('Dinero').textContent();
  await page.getByRole('button', { name: /Reanudar/ }).click();

  await page.getByRole('navigation').getByRole('button', { name: 'Proyectos' }).click();
  await expect(page.getByRole('tab', { name: /Completados \(1\)/ })).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: /Pausar/ }).click();
  await expect(page.getByTitle('Dinero')).not.toHaveText(moneyBefore);
  await page.getByRole('tab', { name: /Completados/ }).click();
  await expect(page.getByText(/Ingresos totales/)).toBeVisible();
});

test('todas las pantallas se abren sin errores y sus botones tienen nombre', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await newGame(page);

  const checkButtons = async (where) => {
    const unnamed = await page.evaluate(() =>
      [...document.querySelectorAll('button')]
        .filter((button) => !(button.getAttribute('aria-label') || button.textContent).trim())
        .map((button) => button.outerHTML.slice(0, 80))
    );
    expect(unnamed, `botones sin nombre en ${where}`).toEqual([]);
  };

  await checkButtons('Oficina');
  await page.getByRole('button', { name: 'Imperio', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Imperio', exact: true })).toBeVisible();
  await checkButtons('Imperio');

  for (const tab of ['Proyectos', 'IA', 'Empleados', 'Marketing', 'Oficina']) {
    await page.getByRole('navigation').getByRole('button', { name: tab }).click();
    await expect(page.locator('.screen-body h2').first()).toBeVisible();
    await checkButtons(tab);
  }

  await page.getByRole('navigation').getByRole('button', { name: 'Proyectos' }).click();
  await page.getByRole('button', { name: '+ Nuevo proyecto' }).click();
  await checkButtons('Crear proyecto');
  await page.getByRole('button', { name: 'Crear proyecto' }).click();
  for (const tab of ['Equipo', 'Análisis', 'Resumen']) {
    await page.getByRole('tab', { name: tab }).click();
    await checkButtons(`Proyecto · ${tab}`);
  }

  for (const [open, dialog] of [
    [/Balance mensual/, 'Balance mensual'],
    ['Menú', 'Menú']
  ]) {
    await page.getByRole('button', { name: open }).click();
    await expect(page.getByRole('dialog', { name: dialog })).toBeVisible();
    await checkButtons(dialog);
    await page.keyboard.press('Escape');
  }
  expect(errors).toEqual([]);
});

test('el reloj conserva el progreso del mes al cambiar de velocidad y al pausar', async ({ page }) => {
  await newGame(page);
  const progress = () => page.locator('.month-progress span').evaluate((bar) => new DOMMatrix(getComputedStyle(bar).transform).a);

  await page.getByRole('button', { name: /Reanudar/ }).click();
  await page.waitForTimeout(1500);
  const beforeSpeed = await progress();
  expect(beforeSpeed).toBeGreaterThan(0.2);

  await page.getByRole('button', { name: /Velocidad 1x/ }).click();
  expect(await progress()).toBeGreaterThanOrEqual(beforeSpeed);

  await page.getByRole('button', { name: /Pausar/ }).click();
  const paused = await progress();
  await page.waitForTimeout(800);
  expect(await progress()).toBeCloseTo(paused, 2);
  await expect(page.getByText('May 2025')).toBeVisible();
});

test('el panel Por hacer guía al jugador y lleva a la pantalla correcta', async ({ page }) => {
  await newGame(page);
  await expect(page.getByLabel(/tareas pendientes/)).toBeVisible();
  await page.getByRole('button', { name: /desarrolla tu idea «Code Quest»/ }).click();
  await expect(page.getByRole('heading', { name: 'Desarrollar idea' })).toBeVisible();
});
