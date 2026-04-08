import { test, expect } from '@playwright/test'

const email = process.env.E2E_USER_EMAIL
const password = process.env.E2E_USER_PASSWORD

test.describe('flows authentifies', () => {
  test.skip(!email || !password, 'Variables E2E_USER_EMAIL/E2E_USER_PASSWORD non definies')

  test('connexion puis acces dashboard', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill(email as string)
    await page.getByLabel('Mot de passe').fill(password as string)
    await page.getByRole('button', { name: 'Se connecter' }).click()

    await expect(page).toHaveURL(/dashboard/)
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  })
})
