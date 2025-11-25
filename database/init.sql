-- ==========================================
-- Archivo: init.sql
-- Propósito: Crear las tablas principales del proyecto Scan2Cook
-- ==========================================

-- Borrado previo (para reiniciar en desarrollo)
DROP TABLE IF EXISTS ingredients CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ==========================================
-- Tabla de usuarios
-- ==========================================
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- Tabla de tickets (OCR)
-- ==========================================
CREATE TABLE tickets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  image_path TEXT NOT NULL,
  raw_text TEXT,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- Tabla de productos (lo que el usuario tiene en casa)
-- ==========================================
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  ticket_id INTEGER REFERENCES tickets(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  quantity INTEGER DEFAULT 1,
  category VARCHAR(50),
  expiration_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- Tabla de recetas
-- ==========================================
CREATE TABLE recipes (
  id SERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  cook_time INTEGER,
  difficulty VARCHAR(20),
  image_url TEXT
);

-- ==========================================
-- Tabla de ingredientes de recetas
-- (relación N:M entre recetas y productos)
-- ==========================================
CREATE TABLE ingredients (
  id SERIAL PRIMARY KEY,
  recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
  product_name VARCHAR(100) NOT NULL,
  quantity VARCHAR(50)
);



