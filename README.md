# SauceDemo Playwright Automation

UI test automation project for [SauceDemo](https://www.saucedemo.com/) built with **Playwright** and **TypeScript**.

## Tech Stack

- Playwright
- TypeScript
- Node.js
- Page Object Model (POM)
- GitHub Actions CI

## Test Coverage

The project contains **15 automated UI tests** covering:

- Successful login
- Invalid password validation
- Locked-out user validation
- Empty credentials validation
- Product list display
- Add product to cart
- Remove product from cart
- Add multiple products
- Product sorting
- Cart product validation
- Checkout validation
- Successful checkout
- Logout
- Remove product from cart page
- Continue shopping from cart

## Project Structure

- `tests/saucedemo.spec.ts` — automated test scenarios
- `tests/pages/` — Page Object Model classes
- `playwright.config.ts` — Playwright configuration
- `.github/workflows/playwright.yml` — GitHub Actions CI workflow

## Run Tests

Install dependencies:

```bash
npm install