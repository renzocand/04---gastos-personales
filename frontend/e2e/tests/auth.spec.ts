import { expect, test } from '@playwright/test';
import { AppShell } from '../pages/app-shell.page';
import { LoginPage } from '../pages/login.page';
import { RegisterPage } from '../pages/register.page';
import { newUser } from '../support/users';

/**
 * Pruebas de aceptación de autenticación: HU-13 (registro), HU-14 (login),
 * HU-15 (cierre de sesión y rutas protegidas). PA-20 .. PA-25.
 */
test.describe('Autenticación', () => {
  test('PA-20: registro exitoso de usuario → entra al dashboard', async ({ page }) => {
    const register = new RegisterPage(page);
    await register.open();
    await register.register(newUser());

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(new AppShell(page).logoutButton).toBeVisible();
  });

  test('PA-21: registrar un DNI ya registrado muestra error', async ({ page }) => {
    const user = newUser();
    const register = new RegisterPage(page);

    await register.open();
    await register.register(user);
    await expect(page).toHaveURL(/\/dashboard$/);

    // Cerrar sesión e intentar registrar el MISMO DNI otra vez.
    await new AppShell(page).logout();
    await expect(page).toHaveURL(/\/login$/);
    await register.open();
    await register.register(user);

    await expect(register.error).toBeVisible();
    await expect(page).toHaveURL(/\/register$/);
  });

  test('PA-22: inicio de sesión con credenciales válidas', async ({ page }) => {
    const user = newUser();
    const register = new RegisterPage(page);
    await register.open();
    await register.register(user);
    await new AppShell(page).logout();

    const login = new LoginPage(page);
    await login.open();
    await login.login(user.dni, user.password);

    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('PA-23: credenciales inválidas muestran mensaje de error', async ({ page }) => {
    const login = new LoginPage(page);
    await login.open();
    await login.login('00000000', 'clave-incorrecta');

    await expect(login.error).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('PA-24: cierre de sesión correcto', async ({ page }) => {
    const register = new RegisterPage(page);
    await register.open();
    await register.register(newUser());
    await expect(page).toHaveURL(/\/dashboard$/);

    await new AppShell(page).logout();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('PA-25: tras cerrar sesión no se accede a rutas protegidas', async ({ page }) => {
    const register = new RegisterPage(page);
    await register.open();
    await register.register(newUser());
    await new AppShell(page).logout();
    await expect(page).toHaveURL(/\/login$/);

    // Navegar directo a una ruta protegida → el authGuard redirige al login.
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login$/);
  });
});
