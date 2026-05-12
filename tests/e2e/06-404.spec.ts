import { test, expect } from '@playwright/test'
import { bypassAgeGate } from '../helpers/auth'

test.describe('Página 404', () => {
  test.beforeEach(async ({ page }) => {
    await bypassAgeGate(page)
  })

  test('muestra la página 404 al visitar una ruta inexistente', async ({ page }) => {
    await page.goto('/esto-no-existe-abc123')

    await expect(page.getByText('Aquí no hay nadie')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Volver al inicio' })).toBeVisible()
  })

  test('muestra 404 para un perfil con slug inexistente', async ({ page }) => {
    await page.goto('/profiles/perfil-que-no-existe-xyz999')

    await expect(page.getByText('Aquí no hay nadie')).toBeVisible()
  })
})
