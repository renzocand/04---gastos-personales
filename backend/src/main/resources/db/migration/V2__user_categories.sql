-- ============================================================================
-- V2: Categorías personalizadas por usuario
-- ============================================================================
-- Migración para crear categorías personalizadas. La tabla category global se
-- mantiene como plantilla para nuevos usuarios, pero los gastos ahora usan
-- user_category para permitir personalización por usuario.
-- ============================================================================

-- 1. Crear tabla user_category
CREATE TABLE user_category (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(50) NOT NULL,
    icon VARCHAR(50),
    description VARCHAR(500),
    sort_order INT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_category_user FOREIGN KEY (user_id) REFERENCES app_user(id)
);

CREATE INDEX idx_user_category_user ON user_category(user_id);
CREATE INDEX idx_user_category_active ON user_category(user_id, active);

-- 2. Agregar columna user_category_id a expense (nullable inicialmente)
ALTER TABLE expense ADD COLUMN user_category_id VARCHAR(36);

-- 3. Crear categorías personalizadas para usuario 76586942
-- Las 6 categorías base del usuario
INSERT INTO user_category (id, user_id, name, icon, description, sort_order, active)
SELECT
    UUID(), u.id, 'Comida', 'UtensilsCrossed',
    'Supermercado, mercado, alimentos para la casa', 1, TRUE
FROM app_user u WHERE u.dni = '76586942';

INSERT INTO user_category (id, user_id, name, icon, description, sort_order, active)
SELECT
    UUID(), u.id, 'Restaurantes', 'Utensils',
    'Salir a comer, delivery, antojos, tortas, comida en la calle', 2, TRUE
FROM app_user u WHERE u.dni = '76586942';

INSERT INTO user_category (id, user_id, name, icon, description, sort_order, active)
SELECT
    UUID(), u.id, 'Suscripciones', 'CreditCard',
    'Netflix, Spotify, servicios de streaming, membresías mensuales', 3, TRUE
FROM app_user u WHERE u.dni = '76586942';

INSERT INTO user_category (id, user_id, name, icon, description, sort_order, active)
SELECT
    UUID(), u.id, 'Vivienda', 'Home',
    'Mantenimiento de casa, hipoteca, reparaciones estructurales', 4, TRUE
FROM app_user u WHERE u.dni = '76586942';

INSERT INTO user_category (id, user_id, name, icon, description, sort_order, active)
SELECT
    UUID(), u.id, 'Limpieza', 'Sparkles',
    'Productos de limpieza, aseo personal, artículos de higiene', 5, TRUE
FROM app_user u WHERE u.dni = '76586942';

INSERT INTO user_category (id, user_id, name, icon, description, sort_order, active)
SELECT
    UUID(), u.id, 'Otros', 'Package',
    'Gastos que no encajan en las demás categorías', 99, TRUE
FROM app_user u WHERE u.dni = '76586942';

-- 4. Crear categorías adicionales solo si el usuario tiene gastos en ellas
-- Transporte
INSERT INTO user_category (id, user_id, name, icon, description, sort_order, active)
SELECT DISTINCT
    UUID(), u.id, 'Transporte', 'Bus',
    'Pasajes, combustible, taxis, apps de viaje', 6, TRUE
FROM app_user u
JOIN expense e ON e.user_id = u.id
WHERE u.dni = '76586942' AND e.category_id = 'transport';

-- Salud
INSERT INTO user_category (id, user_id, name, icon, description, sort_order, active)
SELECT DISTINCT
    UUID(), u.id, 'Salud', 'HeartPulse',
    'Farmacia, consultas médicas, seguros, exámenes', 7, TRUE
FROM app_user u
JOIN expense e ON e.user_id = u.id
WHERE u.dni = '76586942' AND e.category_id = 'health';

-- Educación
INSERT INTO user_category (id, user_id, name, icon, description, sort_order, active)
SELECT DISTINCT
    UUID(), u.id, 'Educación', 'GraduationCap',
    'Cursos, libros, materiales de estudio', 8, TRUE
FROM app_user u
JOIN expense e ON e.user_id = u.id
WHERE u.dni = '76586942' AND e.category_id = 'education';

-- Compras personales
INSERT INTO user_category (id, user_id, name, icon, description, sort_order, active)
SELECT DISTINCT
    UUID(), u.id, 'Compras personales', 'ShoppingBag',
    'Ropa, calzado, accesorios, tecnología, cuidado personal', 9, TRUE
FROM app_user u
JOIN expense e ON e.user_id = u.id
WHERE u.dni = '76586942' AND e.category_id = 'shopping';

-- Ocio
INSERT INTO user_category (id, user_id, name, icon, description, sort_order, active)
SELECT DISTINCT
    UUID(), u.id, 'Ocio', 'Gamepad2',
    'Juegos, pasatiempos, entretenimiento', 10, TRUE
FROM app_user u
JOIN expense e ON e.user_id = u.id
WHERE u.dni = '76586942' AND e.category_id = 'leisure';

-- Servicios (luz, agua, gas - diferente de Suscripciones)
INSERT INTO user_category (id, user_id, name, icon, description, sort_order, active)
SELECT DISTINCT
    UUID(), u.id, 'Servicios', 'Zap',
    'Luz, agua, gas, internet, celular', 11, TRUE
FROM app_user u
JOIN expense e ON e.user_id = u.id
WHERE u.dni = '76586942' AND e.category_id = 'services';

-- 5. Migrar gastos existentes del usuario a sus nuevas categorías
-- food → Comida
UPDATE expense e
JOIN app_user u ON e.user_id = u.id
JOIN user_category uc ON uc.user_id = u.id AND uc.name = 'Comida'
SET e.user_category_id = uc.id
WHERE u.dni = '76586942' AND e.category_id = 'food';

-- housing → Vivienda
UPDATE expense e
JOIN app_user u ON e.user_id = u.id
JOIN user_category uc ON uc.user_id = u.id AND uc.name = 'Vivienda'
SET e.user_category_id = uc.id
WHERE u.dni = '76586942' AND e.category_id = 'housing';

-- home → Limpieza
UPDATE expense e
JOIN app_user u ON e.user_id = u.id
JOIN user_category uc ON uc.user_id = u.id AND uc.name = 'Limpieza'
SET e.user_category_id = uc.id
WHERE u.dni = '76586942' AND e.category_id = 'home';

-- services → Suscripciones (o Servicios si existe)
UPDATE expense e
JOIN app_user u ON e.user_id = u.id
JOIN user_category uc ON uc.user_id = u.id AND uc.name = 'Suscripciones'
SET e.user_category_id = uc.id
WHERE u.dni = '76586942' AND e.category_id = 'services' AND e.user_category_id IS NULL;

-- Si se creó categoría Servicios, usar esa para services
UPDATE expense e
JOIN app_user u ON e.user_id = u.id
JOIN user_category uc ON uc.user_id = u.id AND uc.name = 'Servicios'
SET e.user_category_id = uc.id
WHERE u.dni = '76586942' AND e.category_id = 'services' AND e.user_category_id IS NULL;

-- other → Otros
UPDATE expense e
JOIN app_user u ON e.user_id = u.id
JOIN user_category uc ON uc.user_id = u.id AND uc.name = 'Otros'
SET e.user_category_id = uc.id
WHERE u.dni = '76586942' AND e.category_id = 'other';

-- transport → Transporte
UPDATE expense e
JOIN app_user u ON e.user_id = u.id
JOIN user_category uc ON uc.user_id = u.id AND uc.name = 'Transporte'
SET e.user_category_id = uc.id
WHERE u.dni = '76586942' AND e.category_id = 'transport';

-- health → Salud
UPDATE expense e
JOIN app_user u ON e.user_id = u.id
JOIN user_category uc ON uc.user_id = u.id AND uc.name = 'Salud'
SET e.user_category_id = uc.id
WHERE u.dni = '76586942' AND e.category_id = 'health';

-- education → Educación
UPDATE expense e
JOIN app_user u ON e.user_id = u.id
JOIN user_category uc ON uc.user_id = u.id AND uc.name = 'Educación'
SET e.user_category_id = uc.id
WHERE u.dni = '76586942' AND e.category_id = 'education';

-- shopping → Compras personales
UPDATE expense e
JOIN app_user u ON e.user_id = u.id
JOIN user_category uc ON uc.user_id = u.id AND uc.name = 'Compras personales'
SET e.user_category_id = uc.id
WHERE u.dni = '76586942' AND e.category_id = 'shopping';

-- leisure → Ocio
UPDATE expense e
JOIN app_user u ON e.user_id = u.id
JOIN user_category uc ON uc.user_id = u.id AND uc.name = 'Ocio'
SET e.user_category_id = uc.id
WHERE u.dni = '76586942' AND e.category_id = 'leisure';

-- 6. Cualquier gasto sin categoría asignada va a Otros
UPDATE expense e
JOIN app_user u ON e.user_id = u.id
JOIN user_category uc ON uc.user_id = u.id AND uc.name = 'Otros'
SET e.user_category_id = uc.id
WHERE u.dni = '76586942' AND e.user_category_id IS NULL;

-- 7. Hacer NOT NULL la columna user_category_id y agregar FK
-- Primero verificamos que no haya nulls
-- Si hay otros usuarios con gastos, esto fallará (lo cual es correcto)
ALTER TABLE expense MODIFY user_category_id VARCHAR(36) NOT NULL;

ALTER TABLE expense ADD CONSTRAINT fk_expense_user_category
    FOREIGN KEY (user_category_id) REFERENCES user_category(id);

-- 8. Eliminar la columna category_id antigua
-- El FK se eliminará automáticamente al eliminar la columna en MySQL 8+
-- Si falla, se debe eliminar manualmente el FK primero
ALTER TABLE expense DROP COLUMN category_id;
