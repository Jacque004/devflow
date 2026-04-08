import { test, expect } from '@playwright/test'

test('affiche les pages auth', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByRole('heading', { name: 'Connexion' })).toBeVisible()

  await page.goto('/signup')
  await expect(page.getByRole('heading', { name: 'Inscription' })).toBeVisible()
})

test('validation login visible', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await expect(page.getByText('Email invalide')).toBeVisible()
})
