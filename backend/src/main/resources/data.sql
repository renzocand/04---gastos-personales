-- Seed de categorías (origen de verdad de la lista, nombres, icono y orden).
-- UPSERT idempotente: al reiniciar actualiza las filas existentes e inserta las
-- nuevas, sin necesidad de limpiar la BD. El `icon` es el nombre del icono lucide
-- que el frontend resuelve a un componente. Los ids son códigos estables.
INSERT INTO category (id, name, icon, description, sort_order) VALUES
    ('food',      'Comida',     'UtensilsCrossed', 'Mercado, restaurantes, delivery y todo lo que comés o bebés.', 1),
    ('transport', 'Transporte', 'Bus',             'Pasajes, combustible, taxis y apps de viaje.',                 2),
    ('housing',   'Vivienda',   'Home',            'Alquiler, hipoteca y mantenimiento de tu casa.',               3),
    ('services',  'Servicios',  'Zap',             'Cuentas recurrentes: luz, agua, gas, internet y celular.',     4),
    ('health',    'Salud',      'HeartPulse',      'Farmacia, consultas médicas, seguros y exámenes.',             5),
    ('education', 'Educación',  'GraduationCap',   'Pensiones, matrículas, cursos y materiales de estudio.',       6),
    ('leisure',   'Ocio',       'Gamepad2',        'Salidas, streaming, juegos y pasatiempos.',                    7),
    ('shopping',  'Compras',    'ShoppingBag',     'Ropa, tecnología y antojos que no son de primera necesidad.',  8),
    ('other',     'Otro',       'Package',         'Gastos que no encajan en las demás categorías.',               9) AS new
ON DUPLICATE KEY UPDATE
    name = new.name,
    icon = new.icon,
    description = new.description,
    sort_order = new.sort_order;

-- Los gastos de ejemplo pertenecen a un usuario, así que no se siembran aquí
-- (no podríamos referenciar un user_id válido desde SQL plano). El usuario demo
-- + sus gastos se crean en DemoDataSeeder (con la contraseña hasheada).
