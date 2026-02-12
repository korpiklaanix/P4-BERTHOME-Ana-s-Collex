-- =========================================================
-- COLLEX — DATABASE SCHEMA (MySQL 8+)
-- =========================================================

-- CREATE DATABASE IF NOT EXISTS collex
--   CHARACTER SET utf8mb4
--   COLLATE utf8mb4_0900_ai_ci;

-- USE collex;

-- =========================================================
-- USERS (auth)
-- =========================================================
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(80) NULL,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT uq_users_email UNIQUE (email)
) ENGINE=InnoDB;

CREATE INDEX idx_users_role ON users(role);
INSERT INTO users (email, password_hash, display_name, role)
VALUES ('demo@collex.fr', 'TEMP_HASH_TO_REPLACE', 'Demo', 'user');
-- =========================================================
-- CATEGORIES 
-- =========================================================
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  label VARCHAR(80) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT uq_categories_label UNIQUE (label)
) ENGINE=InnoDB;

INSERT INTO categories (label) VALUES
('Cartes'), ('Figurines'), ('Jeux vidéo'), ('Livres'), ('Montres'),
('Plantes'), ('LEGO'), ('Minéraux'), ('Vinyles'), ('Autre');
-- =========================================================
-- COLLECTIONS 
-- =========================================================
CREATE TABLE collections (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  category_id INT NOT NULL,
  name VARCHAR(120) NOT NULL,
  description TEXT NULL,
  is_private TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_collections_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_collections_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE INDEX idx_collections_user ON collections(user_id);
CREATE INDEX idx_collections_category ON collections(category_id);

-- éviter deux collections du même nom pour un même user
-- CREATE UNIQUE INDEX uq_collections_user_name ON collections(user_id, name);

-- INSERT INTO collections (user_id, category_id, name, description, is_private)
-- VALUES
-- (1, (SELECT id FROM categories WHERE label='Montres'), 'Montres', 'Mes montres préférées', 1),
-- (1, (SELECT id FROM categories WHERE label='LEGO'), 'LEGO Star Wars', 'Sets et minifigs Star Wars', 1),
-- (1, (SELECT id FROM categories WHERE label='Plantes'), 'Mes plantes', 'Plantes d’intérieur et boutures', 1),
-- (1, (SELECT id FROM categories WHERE label='Livres'), 'Livres Fantasy', 'Sagas, one-shots et BD', 1);

-- =========================================================
-- ITEMS 
-- =========================================================
CREATE TABLE items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  collection_id INT NOT NULL,
  title VARCHAR(140) NOT NULL,
  cover_photo_url VARCHAR(255) NULL,   
  acquired_date DATE NULL,
  description TEXT NULL,
  notes TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_items_collection
    FOREIGN KEY (collection_id) REFERENCES collections(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_items_collection ON items(collection_id);
CREATE INDEX idx_items_title ON items(title);
-- INSERT INTO items (collection_id, title, cover_photo_url, acquired_date, description, notes)
-- VALUES
-- ((SELECT id FROM collections WHERE user_id=1 AND name='Montres'), 'Seiko 5', NULL, '2023-10-12', 'Automatique, quotidienne', 'À nettoyer'),
-- ((SELECT id FROM collections WHERE user_id=1 AND name='Montres'), 'Casio Vintage', NULL, NULL, 'Petite montre rétro', NULL),

-- ((SELECT id FROM collections WHERE user_id=1 AND name='LEGO Star Wars'), 'X-Wing', NULL, NULL, 'Mon set préféré', NULL),
-- ((SELECT id FROM collections WHERE user_id=1 AND name='LEGO Star Wars'), 'Millennium Falcon', NULL, NULL, 'À exposer', 'Manque une pièce à vérifier'),

-- ((SELECT id FROM collections WHERE user_id=1 AND name='Mes plantes'), 'Monstera', NULL, '2024-06-01', 'Elle pousse vite', 'Penser tuteur'),
-- ((SELECT id FROM collections WHERE user_id=1 AND name='Mes plantes'), 'Calathea', NULL, NULL, 'Un peu capricieuse', 'Humidité ++');
-- =========================================================
-- OPTIONAL: ITEM PHOTOS 
-- =========================================================
CREATE TABLE item_photos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  item_id INT NOT NULL,
  url VARCHAR(255) NOT NULL,
  is_primary TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_item_photos_item
    FOREIGN KEY (item_id) REFERENCES items(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_item_photos_item ON item_photos(item_id);


