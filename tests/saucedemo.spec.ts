import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { InventoryPage } from './pages/InventoryPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';

test('Successful login with valid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.open();
  await loginPage.login('standard_user', 'secret_sauce');

  await expect(page).toHaveURL(/inventory/);
  await expect(page.locator('[data-test="title"]')).toHaveText('Products');
});

test('Login fails with invalid password', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.open();
  await loginPage.login('standard_user', 'wrong_password');

  await expect(loginPage.errorMessage).toBeVisible();
  await expect(loginPage.errorMessage).toContainText(
    'Username and password do not match'
  );
});



test('Locked out user cannot login', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.open();
  await loginPage.login('locked_out_user', 'secret_sauce');

  await expect(loginPage.errorMessage).toBeVisible();
  await expect(loginPage.errorMessage).toContainText(
    'Sorry, this user has been locked out'
  );
});

test('Login fails with empty credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.open();
  await loginPage.loginButton.click();

  await expect(loginPage.errorMessage).toBeVisible();
  await expect(loginPage.errorMessage).toContainText(
    'Username is required'
  );
});


test('Product list is visible after login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);

  await loginPage.open();
  await loginPage.login('standard_user', 'secret_sauce');

  await expect(inventoryPage.inventoryList).toBeVisible();
});

test('User can add a product to the cart', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');

  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();

  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();

  await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');
});



test('User can remove a product from the cart', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');

  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();

  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');

  await page.locator('[data-test="remove-sauce-labs-backpack"]').click();

  await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveCount(0);
});


test('User can add multiple products to the cart', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);

  await loginPage.open();
  await loginPage.login('standard_user', 'secret_sauce');

  await inventoryPage.addBackpackToCart();
  await inventoryPage.addBikeLightToCart();

  await expect(inventoryPage.cartBadge).toHaveText('2');
});


test('User can sort products by price from low to high', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');

  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();

  await page.locator('[data-test="product-sort-container"]').selectOption('lohi');

  const prices = await page.locator('.inventory_item_price').allTextContents();
  const numericPrices = prices.map(price => Number(price.replace('$', '')));

  const sortedPrices = [...numericPrices].sort((a, b) => a - b);

  expect(numericPrices).toEqual(sortedPrices);
});


test('Added product is displayed in the cart', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);
  const cartPage = new CartPage(page);

  await loginPage.open();
  await loginPage.login('standard_user', 'secret_sauce');

  await inventoryPage.addBackpackToCart();
  await inventoryPage.openCart();

  await expect(page).toHaveURL(/cart/);
 await expect(
  cartPage.itemName.filter({ hasText: 'Sauce Labs Backpack' })
).toHaveText('Sauce Labs Backpack');
});

test('Checkout requires customer information', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);

  await loginPage.open();
  await loginPage.login('standard_user', 'secret_sauce');

  await inventoryPage.addBackpackToCart();
  await inventoryPage.openCart();
  await cartPage.checkout();

  await checkoutPage.continue();

  await expect(checkoutPage.errorMessage).toContainText(
    'First Name is required'
  );
});

test('User can complete checkout successfully', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);

  await loginPage.open();
  await loginPage.login('standard_user', 'secret_sauce');

  await inventoryPage.addBackpackToCart();
  await inventoryPage.openCart();
  await cartPage.checkout();

  await checkoutPage.fillCustomerInformation(
    'Miras',
    'Konarbayev',
    '050000'
  );

  await checkoutPage.continue();
  await checkoutPage.finish();

  await expect(checkoutPage.completeHeader).toHaveText(
    'Thank you for your order!'
  );
});


test('User can logout successfully', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');

  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();

  await page.locator('#react-burger-menu-btn').click();
  await page.locator('[data-test="logout-sidebar-link"]').click();

  await expect(page.locator('[data-test="login-button"]')).toBeVisible();
  await expect(page).toHaveURL('https://www.saucedemo.com/');
});


test('User can remove product from cart page', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);
  const cartPage = new CartPage(page);

  await loginPage.open();
  await loginPage.login('standard_user', 'secret_sauce');

  await inventoryPage.addBackpackToCart();
  await inventoryPage.openCart();

  await expect(cartPage.itemName).toHaveText('Sauce Labs Backpack');

  await cartPage.removeBackpack();

  await expect(cartPage.itemName).toHaveCount(0);
});

test('User can continue shopping from cart', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);
  const cartPage = new CartPage(page);

  await loginPage.open();
  await loginPage.login('standard_user', 'secret_sauce');

  await inventoryPage.addBackpackToCart();
  await inventoryPage.openCart();

  await expect(page).toHaveURL(/cart/);

  await page.locator('[data-test="continue-shopping"]').click();

  await expect(page).toHaveURL(/inventory/);
  await expect(inventoryPage.inventoryList).toBeVisible();
});