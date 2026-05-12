import type { Page } from '@playwright/test'

/** Inyecta la cookie de verificación de edad para saltar el modal en todos los tests. */
export async function bypassAgeGate(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('yafui-age-verified', 'true')
  })
}

/**
 * Inicia sesión con email/contraseña usando las env vars TEST_USER_EMAIL
 * y TEST_USER_PASSWORD. Llama a bypassAgeGate antes de navegar.
 */
export async function loginAsTestUser(page: Page) {
  const email    = process.env.TEST_USER_EMAIL
  const password = process.env.TEST_USER_PASSWORD

  if (!email || !password) {
    throw new Error(
      'TEST_USER_EMAIL y TEST_USER_PASSWORD son obligatorias. Copia .env.test.example a .env.test y rellena los valores.'
    )
  }

  await bypassAgeGate(page)
  await page.goto('/auth/signin')

  await page.fill('#email',    email)
  await page.fill('#password', password)
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click()

  // Esperamos a que la redirección post-login complete
  await page.waitForURL('/', { timeout: 15_000 })
}
