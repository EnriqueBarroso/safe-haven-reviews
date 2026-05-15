import { test, expect } from '@playwright/test'
import { loginAsTestUser } from '../helpers/auth'
import { cleanupTestData } from '../helpers/cleanup'

async function selectRadix(page: any, labelText: string, optionText: string) {
  const fieldGroup = page.locator('div.space-y-2').filter({ hasText: labelText }).first()
  await fieldGroup.getByRole('combobox').click()
  await page.getByRole('option', { name: optionText }).click()
}

async function clickStars(page: any, testId: string, stars: number) {
  await page.getByTestId(testId).getByRole('button').nth(stars - 1).click()
}

test.describe('Publicar reseña', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page)
  })

  test.afterAll(async () => {
    await cleanupTestData()
  })

  test('publica una reseña para un perfil nuevo y redirige al perfil', async ({ page }) => {
    await page.goto('/submit-review/review')

    // ── Datos del perfil ─────────────────────────────────────
    // Selectores por id (añadidos al form tras detectar que no había placeholder)
    await page.fill('#profile-name', `Test E2E ${Date.now()}`)
    await page.fill('#profile-city', 'Madrid')

    await selectRadix(page, 'Categoría',       'Chica')
    await selectRadix(page, 'Rango de Precio', 'Más de 150€')
    await selectRadix(page, 'Tipo de Servicio', 'Independiente')

    // ── Valoraciones ─────────────────────────────────────────
    await clickStars(page, 'rating-veracity',      4)
    await clickStars(page, 'rating-punctuality',   4)
    await clickStars(page, 'rating-communication', 4)
    await clickStars(page, 'rating-hygiene',        4)

    // ── Detalles ─────────────────────────────────────────────
    await page.fill('#review-price',    '120')
    await page.fill('#review-duration', '60')
    await page.fill('textarea[placeholder*="Cuéntanos"]',
      'Experiencia de prueba E2E. Perfil creado por tests automáticos.')

    await page.getByRole('button', { name: 'Publicar Reseña' }).click()

    await page.waitForURL(/\/profiles\/.*/, { timeout: 30_000 })
    expect(page.url()).toContain('/profiles/')
  })
})
