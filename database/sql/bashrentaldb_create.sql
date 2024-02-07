DROP TABLE IF EXISTS `customers`;
DROP TABLE IF EXISTS `order_category_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `category_items` ;
DROP TABLE IF EXISTS `categories` ;

CREATE TABLE IF NOT EXISTS `customers` (
  `customer_id` VARCHAR(16) PRIMARY KEY,
  `completename` char(255) DEFAULT NULL,
  `email` char(255) DEFAULT NULL,
  `street_address` char(255) DEFAULT NULL,
  `city` char(255) DEFAULT NULL,
  `state` char(255) DEFAULT NULL,
  `zipcode` char(255) DEFAULT NULL,
  `phone` char(255) DEFAULT NULL,
  `order_note` char(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ;

CREATE TABLE IF NOT EXISTS `categories` (
  category_id VARCHAR(16) PRIMARY KEY,
   category_name VARCHAR(255) NOT NULL UNIQUE,
	category_webid VARCHAR(16) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `category_items` (
  `item_id` VARCHAR(16) PRIMARY KEY,
  `item_name` VARCHAR(255) NOT NULL UNIQUE,
  `description` TEXT,
  `category_id` VARCHAR(16),
	`category_webid` VARCHAR(8),
  `imageurl` VARCHAR(255) DEFAULT NULL,
  `quantityAvailable` INT(11) DEFAULT NULL,
  `unitPrice` DECIMAL(10,2) DEFAULT NULL,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`category_id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `orders` (
  `order_id` char(64)  PRIMARY KEY COMMENT 'Primary Key for this order',
  `customer_id` char(64) NOT NULL,
  `order_date` timestamp NULL DEFAULT current_timestamp(),
  `total_amount` decimal(10,2) NOT NULL,
  `payment_status` enum('pending','completed','failed') DEFAULT NULL,
  `paypal_transaction_id` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE `order_category_items` (
  `order_category_items_id` char(64) PRIMARY KEY COMMENT 'Primary Key for this order category item',
  `order_id` char(64) NOT NULL COMMENT 'References an order in the order table',
  `category_id` char(64) NOT NULL COMMENT 'References the sub category from which this item belongs to',
  `quantity` int(11) NOT NULL,
  `unitSalePrice` decimal(10,2) NOT NULL COMMENT 'The price at which the category item was sold when order was being processed.',
  `subtotal` decimal(10,2) NOT NULL COMMENT 'The sub total for this item x(multiplied by) quantity',
  FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`category_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

