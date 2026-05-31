-- Seed de categorías. Idempotente: INSERT IGNORE evita duplicados al reiniciar.
-- Los ids coinciden con el union type CategoryId del frontend.
INSERT IGNORE INTO category (id, name, icon) VALUES
    ('food',      'Comida',     'UtensilsCrossed'),
    ('transport', 'Transporte', 'Bus'),
    ('leisure',   'Ocio',       'Gamepad2'),
    ('other',     'Otro',       'Package');

-- Los gastos de ejemplo ahora pertenecen a un usuario, así que ya no se siembran
-- aquí (no podríamos referenciar un user_id válido desde SQL plano). El usuario
-- demo + sus gastos se crean en DemoDataSeeder (con la contraseña hasheada).
