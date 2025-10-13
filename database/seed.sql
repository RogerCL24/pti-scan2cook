-- ==========================================
-- Archivo: seed.sql
-- Propósito: Insertar datos iniciales en la base de datos
-- ==========================================

-- Usuarios de ejemplo
INSERT INTO users (name, email, password_hash)
VALUES
('Irene López', 'irene@scan2cook.com', 'hashedpassword1'),
('Roger García', 'roger@scan2cook.com', 'hashedpassword2');

-- Tickets de ejemplo
INSERT INTO tickets (user_id, image_path, raw_text, processed)
VALUES
(1, 'ocr_uploads/ticket_irene_01.jpg', 'ARROZ 2x\nTOMATE 1x\nLECHE 1x', TRUE),
(2, 'ocr_uploads/ticket_roger_01.jpg', 'PASTA 1x\nSALSA 1x', TRUE);

-- Productos iniciales
INSERT INTO products (user_id, ticket_id, name, quantity, category, expiration_date)
VALUES
(1, 1, 'Arroz', 2, 'Cereales', '2025-12-01'),
(1, 1, 'Tomate triturado', 3, 'Conservas', '2026-01-15'),
(2, 2, 'Pasta', 1, 'Cereales', '2025-09-10');

-- Recetas de ejemplo
INSERT INTO recipes (title, description, cook_time, difficulty, image_url)
VALUES
('Arroz con tomate', 'Receta sencilla y rápida para aprovechar el arroz sobrante.', 20, 'Fácil', 'https://example.com/arroz.jpg'),
('Pasta con salsa de tomate', 'Plato clásico con ingredientes básicos de despensa.', 25, 'Fácil', 'https://example.com/pasta.jpg');

-- Ingredientes de las recetas
INSERT INTO ingredients (recipe_id, product_name, quantity)
VALUES
(1, 'Arroz', '200g'),
(1, 'Tomate triturado', '150ml'),
(2, 'Pasta', '250g'),
(2, 'Tomate triturado', '100ml');
