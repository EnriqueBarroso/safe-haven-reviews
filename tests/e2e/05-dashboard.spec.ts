import { test, expect } from '@playwright/test'
import { loginAsTestUser } from '../helpers/auth'

async function selectRadix(page: any, labelText: string, optionText: string) {
  const fieldGroup = page.locator('div.space-y-2').filter({ hasText: labelText }).first()
  await fieldGroup.getByRole('combobox').click()
  await page.getByRole('option', { name: optionText }).click()
}

async function clickStars(page: any, testId: string, stars: number) {
  await page.getByTestId(testId).getByRole('button').nth(stars - 1).click()
}

test.describe('Dashboard — borrar reseña', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page)
  })

  test('crea una reseña y la elimina desde el dashboard', async ({ page }) => {
    const uniqueName = `Borrar E2E ${Date.now()}`

    // ── 1. Publicar reseña desechable ────────────────────────
    await page.goto('/submit-review/review')

    await page.fill('#profile-name', uniqueName)
    await page.fill('#profile-city', 'Valencia')
    await selectRadix(page, 'Categoría',       'Chica')
    await selectRadix(page, 'Rango de Precio', 'Menos de 150€')
    await selectRadix(page, 'Tipo de Servicio', 'Independiente')

    await clickStars(page, 'rating-veracity',      3)
    await clickStars(page, 'rating-punctuality',   3)
    await clickStars(page, 'rating-communication', 3)
    await clickStars(page, 'rating-hygiene',        3)

    await page.fill('#review-price',    '80')
    await page.fill('#review-duration', '30')
    await page.fill('textarea[placeholder*="Cuéntanos"]',
      'Reseña creada por test E2E — será eliminada.')

    await page.getByRole('button', { name: 'Publicar Reseña' }).click()
    await page.waitForURL(/\/profiles\/.*/, { timeout: 30_000 })

    // ── 2. Ir al dashboard → pestaña actividad ───────────────
    await page.goto('/dashboard')
    await expect(page.getByText('Mi Dashboard')).toBeVisible()

    await page.getByRole('tab', { name: 'Mi Actividad' }).click()
    await page.getByRole('tab', { name: /Reseñas/ }).click()

    // ── 3. Encontrar la reseña por su nombre único ───────────
    const reviewCard = page
      .locator('div.rounded-lg.border')
      .filter({ hasText: uniqueName })
      .first()

    await expect(reviewCard).toBeVisible({ timeout: 10_000 })
    await reviewCard.getByRole('button', { name: 'Eliminar reseña' }).click()

    // ── 4. Confirmar en el modal ─────────────────────────────
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('button', { name: 'Sí, borrar reseña' }).click()

    // ── 5. La reseña desaparece ──────────────────────────────
    await expect(reviewCard).not.toBeVisible({ timeout: 10_000 })
  })
})
