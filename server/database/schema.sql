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

-- =========================================================
-- CATEGORIES 
-- =========================================================
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  label VARCHAR(80) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT uq_categories_label UNIQUE (label)
) ENGINE=InnoDB;

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
CREATE UNIQUE INDEX uq_collections_user_name ON collections(user_id, name);

-- =========================================================
-- ITEMS 
-- =========================================================
CREATE TABLE items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  collection_id INT NOT NULL,
  title VARCHAR(140) NOT NULL,
  cover_photo_url VARCHAR(255) NULL,   -- photo principale de la card
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

-- =========================================================
-- SEED CATEGORIES
-- =========================================================
INSERT INTO categories (label) VALUES
('Cartes'), ('Figurines'), ('Jeux vidéo'), ('Livres'), ('Montres'),
('Plantes'), ('LEGO'), ('Minéraux'), ('Vinyles'), ('Autre');
