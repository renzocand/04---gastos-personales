-- Seed de categorías. Idempotente: INSERT IGNORE evita duplicados al reiniciar.
-- Los ids coinciden con el union type CategoryId del frontend.
INSERT IGNORE INTO category (id, name, icon) VALUES
    ('food',      'Comida',     'UtensilsCrossed'),
    ('transport', 'Transporte', 'Bus'),
    ('leisure',   'Ocio',       'Gamepad2'),
    ('other',     'Otro',       'Package');

-- Gastos de ejemplo para poblar la demo. Idempotente (INSERT IGNORE por id).
INSERT IGNORE INTO expense (id, amount, currency, description, category_id, date) VALUES
    ('e1', 158.40, 'PEN', 'Wong San Isidro',     'food',      '2026-04-19'),
    ('e2',  22.00, 'PEN', 'Uber a Miraflores',   'transport', '2026-04-19'),
    ('e3',  15.99, 'USD', 'Netflix',             'leisure',   '2026-04-18'),
    ('e4',  18.00, 'PEN', 'Menu del dia',        'food',      '2026-04-18'),
    ('e5',  10.99, 'USD', 'Spotify',             'leisure',   '2026-04-17'),
    ('e6',  65.00, 'PEN', 'Taxi aeropuerto',     'transport', '2026-04-15'),
    ('e7',  42.50, 'PEN', 'Farmacia Inkafarma',  'other',     '2026-04-15'),
    ('e8',  28.00, 'PEN', 'Cineplanet',          'leisure',   '2026-04-14');
