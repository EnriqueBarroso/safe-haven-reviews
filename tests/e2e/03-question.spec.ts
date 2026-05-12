import { test, expect } from '@playwright/test'
import { loginAsTestUser } from '../helpers/auth'

test.describe('Publicar pregunta en el foro', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page)
  })

  test('publica un hilo y redirige al perfil en pestaña foro', async ({ page }) => {
    await page.goto('/submit-review/question')

    // Esperar a que el componente cargue la sesión (useEffect de auth)
    await page.waitForFunction(() => {
      const btn = document.querySelector('button[type="submit"]')
      return btn && !btn.hasAttribute('disabled')
    }, { timeout: 10_000 }).catch(() => {
      // Si el botón no existe o no tiene disabled, continuamos igualmente
    })

    await page.fill('input[placeholder="Ej: Luna"]',      `ForoTest ${Date.now()}`)
    await page.fill('input[placeholder="Ej: Barcelona"]', 'Sevilla')
    await page.fill(
      'textarea[placeholder*="Escribe aquí tu duda"]',
      '¿Alguien la ha visto últimamente? Pregunta de prueba E2E.'
    )

    await page.getByRole('button', { name: 'Publicar en el foro' }).click()

    await page.waitForURL(/\/profiles\/.*\?tab=forum/, { timeout: 30_000 })
    expect(page.url()).toContain('tab=forum')
  })
})
