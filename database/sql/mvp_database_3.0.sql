DROP TABLE IF EXISTS `customers`;
CREATE TABLE IF NOT EXISTS `customers` (
  `customer_id` VARCHAR(16) PRIMARY KEY,
  `completename` char(255) DEFAULT NULL,
  `email` char(255) DEFAULT NULL,
  `street_address` char(255) DEFAULT NULL,
  `city` char(255) DEFAULT NULL,
  `state` char(255) DEFAULT NULL,
  `zipcode` char(255) DEFAULT NULL,
  `phone` char(255) DEFAULT NULL,
  `order_note` char(255) DEFAULT NULL,
   (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ;

DROP TABLE IF EXISTS `categories` ;
CREATE TABLE IF NOT EXISTS `categories` (
    category_id VARCHAR(16) PRIMARY KEY,
    category_name VARCHAR(255) NOT NULL,
	category_webid VARCHAR(16) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `subcategories` ;
CREATE TABLE IF NOT EXISTS `subcategories` (
    subcategory_id VARCHAR(16) PRIMARY KEY,
    subcategory_name VARCHAR(255) NOT NULL,
    category_id VARCHAR(16),
	subcategory_webid VARCHAR(8),
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `subcategory_items` ;
CREATE TABLE IF NOT EXISTS `subcategory_items` (
    item_id VARCHAR(16) PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    subcategory_id VARCHAR(16),
	subcategory_webid VARCHAR(8),
    FOREIGN KEY (subcategory_id) REFERENCES subcategories(subcategory_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

