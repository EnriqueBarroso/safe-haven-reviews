import { test, expect } from '@playwright/test'
import { bypassAgeGate } from '../helpers/auth'

test.describe('Registro de usuario', () => {
  test('muestra mensaje de éxito tras registrar un email nuevo', async ({ page }) => {
    await bypassAgeGate(page)
    await page.goto('/auth/register')

    // Email único por ejecución para evitar duplicados en Supabase
    const uniqueEmail = `test+${Date.now()}@yafui.dev`

    await page.fill('#email',           uniqueEmail)
    await page.fill('#password',        'TestPassword123!')
    await page.fill('#confirmPassword', 'TestPassword123!')

    // Checkbox de términos (Radix Checkbox — click sobre el label)
    await page.getByLabel('Acepto los Términos y la Política de Privacidad').click()

    await page.getByRole('button', { name: 'Crear Cuenta' }).click()

    await expect(
      page.getByText('¡Registro exitoso!')
    ).toBeVisible({ timeout: 10_000 })
  })

  test('muestra error cuando las contraseñas no coinciden', async ({ page }) => {
    await bypassAgeGate(page)
    await page.goto('/auth/register')

    await page.fill('#email',           `mismatch+${Date.now()}@yafui.dev`)
    await page.fill('#password',        'Password123!')
    await page.fill('#confirmPassword', 'OtraPassword!')
    await page.getByLabel('Acepto los Términos y la Política de Privacidad').click()

    await page.getByRole('button', { name: 'Crear Cuenta' }).click()

    await expect(
      page.getByText('Las contraseñas no coinciden')
    ).toBeVisible({ timeout: 5_000 })
  })
})
