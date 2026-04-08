## Tests E2E Playwright

### Installation navigateurs

```bash
npx playwright install chromium
```

### Lancer les tests

```bash
npm run test:e2e
```

### Tests authentifies (optionnel)

Definir des variables d'environnement:

```bash
set E2E_USER_EMAIL=ton-email@example.com
set E2E_USER_PASSWORD=ton-mot-de-passe
```

Puis relancer:

```bash
npm run test:e2e
```
