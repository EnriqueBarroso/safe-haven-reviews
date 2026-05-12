import { test, expect } from '@playwright/test'
import { loginAsTestUser } from '../helpers/auth'

test.describe('Responder a una reseña (hilo)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page)
  })

  test('publica una respuesta en un hilo existente', async ({ page }) => {
    const slug = process.env.TEST_PROFILE_SLUG
    if (!slug) {
      test.skip(true, 'TEST_PROFILE_SLUG no configurado — omitiendo test de respuesta')
      return
    }

    await page.goto(`/profiles/${slug}`)

    // Clic en el primer botón "Responder" visible
    await page.getByRole('button', { name: 'Responder' }).first().click()

    // El formulario de respuesta aparece
    const replyTextarea = page.getByPlaceholder('Escribe tu respuesta...')
    await expect(replyTextarea).toBeVisible({ timeout: 5_000 })

    const replyText = `Respuesta de test E2E — ${Date.now()}`
    await replyTextarea.fill(replyText)

    await page.getByRole('button', { name: 'Responder' }).last().click()

    // La respuesta aparece en el hilo tras éxito
    await expect(page.getByText(replyText)).toBeVisible({ timeout: 15_000 })
  })
})
