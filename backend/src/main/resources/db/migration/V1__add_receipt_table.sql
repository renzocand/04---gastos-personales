-- Migración: Crear tabla receipt y agregar relación en expense
-- NOTA: Este proyecto usa ddl-auto=update de Hibernate, por lo que las tablas
-- se crean automáticamente. Este archivo se incluye como referencia y para
-- ambientes donde se prefiera migración manual.

-- Crear tabla receipt
CREATE TABLE IF NOT EXISTS receipt (
    id VARCHAR(36) PRIMARY KEY,
    vendor VARCHAR(100),
    date DATE NOT NULL,
    total DECIMAL(12, 2),
    source VARCHAR(20) NOT NULL,
    image_url VARCHAR(500),
    user_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_receipt_user FOREIGN KEY (user_id) REFERENCES app_user(id)
);

-- Crear índice para búsquedas por usuario
CREATE INDEX IF NOT EXISTS idx_receipt_user_id ON receipt(user_id);

-- Crear índice para búsquedas por fecha
CREATE INDEX IF NOT EXISTS idx_receipt_date ON receipt(date);

-- Agregar columna receipt_id a expense (si no existe)
ALTER TABLE expense ADD COLUMN IF NOT EXISTS receipt_id VARCHAR(36);

-- Agregar foreign key de expense a receipt
ALTER TABLE expense ADD CONSTRAINT IF NOT EXISTS fk_expense_receipt
    FOREIGN KEY (receipt_id) REFERENCES receipt(id);

-- Crear índice para la relación
CREATE INDEX IF NOT EXISTS idx_expense_receipt_id ON expense(receipt_id);
