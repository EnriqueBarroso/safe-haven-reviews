/**
 * SQL Injection Security Tests
 *
 * Verifica que todos los inputs públicos y autenticados de YaFui son inmunes
 * a SQL injection. Supabase usa PostgREST con queries parametrizadas, así que
 * los payloads deben tratarse como texto literal, nunca ejecutarse como SQL.
 *
 * Criterios de PASS por test:
 *  ✓ Sin respuestas HTTP 5xx
 *  ✓ Sin mensajes de error de BD en el DOM (syntax error, pg exception, etc.)
 *  ✓ Sin volcado de datos inesperado (tablas enteras en la respuesta)
 *  ✓ La app renderiza correctamente (estado vacío o resultado normal)
 */

import { test, expect, type Page } from '@playwright/test'
import { bypassAgeGate, loginAsTestUser } from '../helpers/auth'

// ── Payloads ────────────────────────────────────────────────────
const PAYLOADS = [
  "' OR '1'='1",
  "'; DROP TABLE profiles; --",
  "' UNION SELECT * FROM users --",
  "1; SELECT * FROM reviews --",
  "' OR 1=1 --",
] as const

// ── Patrones que revelarían un leak real de BD ───────────────────
// Mensajes de error internos de PostgreSQL / PostgREST
const DB_LEAK_PATTERNS = [
  /syntax error at or near/i,
  /unterminated quoted string/i,
  /invalid input syntax for type/i,
  /operator does not exist/i,
  /column ".+" does not exist/i,
  /relation ".+" does not exist/i,
  /pg exception/i,
  /pgrst\d{3}/i,           // códigos de error PostgREST (PGRST116, etc.)
  /permission denied for/i,
  /violates row-level security/i,
]

// ── Helper: colector de errores HTTP ────────────────────────────
function attachServerErrorCollector(page: Page): () => string[] {
  const errors: string[] = []
  page.on('response', (res) => {
    if (res.status() >= 500) errors.push(`${res.status()} ${res.url()}`)
  })
  return () => errors
}

// ── Helper: verifica que el DOM no contiene leaks de BD ─────────
async function assertNoDbLeak(page: Page, payload: string) {
  const bodyText = await page.locator('body').innerText()
  for (const pattern of DB_LEAK_PATTERNS) {
    expect(
      bodyText,
      `Posible leak de BD con payload "${payload}" (patrón: ${pattern})`
    ).not.toMatch(pattern)
  }
}

// ── Helper: verifica que no llegaron respuestas 5xx ─────────────
function assertNo5xx(getErrors: () => string[], payload: string) {
  expect(
    getErrors(),
    `Error 5xx con payload "${payload}"`
  ).toHaveLength(0)
}

// ════════════════════════════════════════════════════════════════
// GRUPO 1: Búsqueda pública — sin login
// ════════════════════════════════════════════════════════════════
test.describe('SQLi — Búsqueda pública /profiles', () => {
  for (const payload of PAYLOADS) {
    test(`?search: "${payload}"`, async ({ page }) => {
      const get5xx = attachServerErrorCollector(page)
      await bypassAgeGate(page)

      // Inyectamos el payload directamente como query param (peor caso posible)
      await page.goto(`/profiles?search=${encodeURIComponent(payload)}`)
      await page.waitForLoadState('networkidle')

      assertNo5xx(get5xx, payload)
      await assertNoDbLeak(page, payload)

      // La página debe renderizar normalmente: h1 visible, sin crash
      await expect(page.locator('h1')).toBeVisible()

      // No debe haber un dump masivo de datos (más de 50 tarjetas sería sospechoso)
      const cards = page.locator('[aria-label^="Ver perfil"]')
      const count = await cards.count()
      expect(count, 'Demasiados resultados — posible data dump').toBeLessThan(50)
    })
  }
})

// ════════════════════════════════════════════════════════════════
// GRUPO 2: Hero search — formulario en la landing
// ════════════════════════════════════════════════════════════════
test.describe('SQLi — Hero search /', () => {
  for (const payload of PAYLOADS) {
    test(`input búsqueda: "${payload}"`, async ({ page }) => {
      const get5xx = attachServerErrorCollector(page)
      await bypassAgeGate(page)
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      const searchInput = page.locator('input[aria-label*="Buscar"]').first()
      await searchInput.fill(payload)
      await page.getByRole('button', { name: 'Buscar' }).click()

      // Espera a que la navegación a /profiles?search= complete
      await page.waitForURL(/\/profiles/, { timeout: 10_000 })
      await page.waitForLoadState('networkidle')

      assertNo5xx(get5xx, payload)
      await assertNoDbLeak(page, payload)
      await expect(page.locator('h1')).toBeVisible()
    })
  }
})

// ════════════════════════════════════════════════════════════════
// GRUPO 3: Filtros de búsqueda — parámetros de URL
// ════════════════════════════════════════════════════════════════
test.describe('SQLi — Filtros URL /profiles', () => {
  const filterParams = ['city', 'category', 'serviceType']

  for (const param of filterParams) {
    for (const payload of PAYLOADS) {
      test(`?${param}: "${payload}"`, async ({ page }) => {
        const get5xx = attachServerErrorCollector(page)
        await bypassAgeGate(page)

        await page.goto(`/profiles?${param}=${encodeURIComponent(payload)}`)
        await page.waitForLoadState('networkidle')

        assertNo5xx(get5xx, payload)
        await assertNoDbLeak(page, payload)
        await expect(page.locator('h1')).toBeVisible()
      })
    }
  }
})

// ════════════════════════════════════════════════════════════════
// GRUPO 4: Formulario de reseña — campos nombre y ciudad (paso 1)
// ════════════════════════════════════════════════════════════════
test.describe('SQLi — Formulario de reseña (autenticado)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page)
  })

  for (const payload of PAYLOADS) {
    test(`nombre del perfil: "${payload}"`, async ({ page }) => {
      const get5xx = attachServerErrorCollector(page)
      await page.goto('/submit-review/review')
      await page.waitForLoadState('networkidle')

      await page.locator('#profile-name').fill(payload)
      await page.locator('#profile-city').fill('Madrid')

      // Intentar avanzar al paso 2
      const nextBtn = page.getByRole('button', { name: /siguiente/i })
      if (await nextBtn.isVisible()) await nextBtn.click()

      await page.waitForTimeout(1_500)

      assertNo5xx(get5xx, payload)
      await assertNoDbLeak(page, payload)
    })
  }

  for (const payload of PAYLOADS) {
    test(`ciudad del perfil: "${payload}"`, async ({ page }) => {
      const get5xx = attachServerErrorCollector(page)
      await page.goto('/submit-review/review')
      await page.waitForLoadState('networkidle')

      await page.locator('#profile-name').fill('Test Seguridad')
      await page.locator('#profile-city').fill(payload)

      const nextBtn = page.getByRole('button', { name: /siguiente/i })
      if (await nextBtn.isVisible()) await nextBtn.click()

      await page.waitForTimeout(1_500)

      assertNo5xx(get5xx, payload)
      await assertNoDbLeak(page, payload)
    })
  }
})

// ════════════════════════════════════════════════════════════════
// GRUPO 5: Dashboard — actualización de alias
// ════════════════════════════════════════════════════════════════
test.describe('SQLi — Dashboard alias (autenticado)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page)
  })

  for (const payload of PAYLOADS) {
    test(`campo alias: "${payload}"`, async ({ page }) => {
      const get5xx = attachServerErrorCollector(page)
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')

      const aliasInput = page.locator('#alias')
      if (!(await aliasInput.isVisible())) {
        test.skip(true, 'Input #alias no encontrado en el dashboard')
        return
      }

      // Guardamos el alias original para restaurarlo después
      const originalAlias = await aliasInput.inputValue()

      await aliasInput.fill(payload)
      await page.getByRole('button', { name: /guardar identidad/i }).click()

      await page.waitForTimeout(2_000)

      assertNo5xx(get5xx, payload)
      await assertNoDbLeak(page, payload)

      // La app debe mostrar éxito o un error de validación amigable,
      // nunca un error de BD
      const bodyText = await page.locator('body').innerText()
      expect(bodyText).not.toMatch(/pgrst/i)

      // Restaurar alias original para no contaminar datos
      await aliasInput.fill(originalAlias || 'TestUser')
      await page.getByRole('button', { name: /guardar identidad/i }).click()
      await page.waitForTimeout(1_000)
    })
  }
})
