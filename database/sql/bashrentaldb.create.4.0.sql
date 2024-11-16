use bashrentaldbprodbbd ;
--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `otp`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `order_category_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `customers`;
DROP TABLE IF EXISTS `category_items_images`;
DROP TABLE IF EXISTS `category_items`;
DROP TABLE IF EXISTS `categories`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE  IF NOT EXISTS `categories` (
  `category_id` VARCHAR(16) NOT NULL,
  `category_name` VARCHAR(255) NOT NULL,
  `category_webid` VARCHAR(16) NOT NULL,
  `category_weburl` VARCHAR(255) NOT NULL,
  `category_photourl` VARCHAR(512) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `modified_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `category_name` (`category_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `category_items` (
  `item_id` varchar(16) NOT NULL,
  `item_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category_id` varchar(16) DEFAULT NULL,
  `category_webid` varchar(8) DEFAULT NULL,
  `imageurl` varchar(255) DEFAULT NULL,
  `quantityAvailable` int(11) DEFAULT NULL,
  `unitPrice` decimal(10,2) DEFAULT NULL,
  `date_uploaded` datetime DEFAULT current_timestamp(),
  `date_modified` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`item_id`),
  UNIQUE KEY `item_name` (`item_name`),
  KEY `category_id` (`category_id`),
  CONSTRAINT FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE  IF NOT EXISTS `category_items_images` (
  `cloudflare_image_id` VARCHAR(64) NOT NULL,
  `item_id` VARCHAR(16) NOT NULL,
  `filename` VARCHAR(255) DEFAULT NULL,
  `variant_110x118` VARCHAR(264) DEFAULT NULL,
  `variant_384x320` VARCHAR(264) DEFAULT NULL,
  `variant_70x70` VARCHAR(264) DEFAULT NULL,
  `date_uploaded` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `date_modified` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`cloudflare_image_id`),
  KEY `item_id` (`item_id`),
  CONSTRAINT FOREIGN KEY (`item_id`) REFERENCES `category_items` (`item_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `customers`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE  IF NOT EXISTS `customers` (
  `customer_id` VARCHAR(16) NOT NULL,
  `completename` CHAR(255) DEFAULT NULL,
  `email` CHAR(255) DEFAULT NULL,
  `street_address` CHAR(255) DEFAULT NULL,
  `city` CHAR(255) DEFAULT NULL,
  `state` CHAR(255) DEFAULT NULL,
  `zipcode` CHAR(255) DEFAULT NULL,
  `phone` CHAR(255) DEFAULT NULL,
  `order_note` CHAR(255) DEFAULT NULL,
  PRIMARY KEY (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `orders`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE  IF NOT EXISTS `orders` (
  `order_id` CHAR(64) NOT NULL COMMENT 'Primary Key for this order',
  `customer_id` CHAR(64) NOT NULL,
  `order_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `payment_status` ENUM('pending','completed','failed') DEFAULT NULL,
  `paypal_transaction_id` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `order_category_items`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE  IF NOT EXISTS `order_category_items` (
  `order_category_items_id` CHAR(64) NOT NULL COMMENT 'Primary Key for this order category item',
  `order_id` CHAR(64) NOT NULL COMMENT 'References an order in the order table',
  `category_id` CHAR(64) NOT NULL COMMENT 'References the sub category from which this item belongs to',
  `quantity` INT(11) NOT NULL,
  `unitSalePrice` DECIMAL(10,2) NOT NULL COMMENT 'The price at which the category item was sold when order was being processed.',
  `subtotal` DECIMAL(10,2) NOT NULL COMMENT 'The sub total for this item x(multiplied by) quantity',
  PRIMARY KEY (`order_category_items_id`),
  KEY `order_id` (`order_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `users`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE  IF NOT EXISTS `users` (
  `user_id` VARCHAR(50) NOT NULL,
  `username` VARCHAR(50) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `last_modified` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_login` TIMESTAMP NULL DEFAULT NULL,
  `login_attempts` INT(11) DEFAULT 0,
  `user_type` ENUM('standard_admin','master_admin','customer') DEFAULT 'standard_admin',
  `account_status` ENUM('active','locked') DEFAULT 'active',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


--
-- Table structure for table `otp`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE  IF NOT EXISTS `otp` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_email` VARCHAR(50) NOT NULL,
  `otp_code` VARCHAR(10) NOT NULL,
  `expiration_time` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_email` (`user_email`),
  CONSTRAINT `otp_ibfk_1` FOREIGN KEY (`user_email`) REFERENCES `users` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=173 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

