-- MariaDB dump 10.19  Distrib 10.11.2-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: bashrentaldb
-- ------------------------------------------------------
-- Server version	10.11.2-MariaDB-1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categories` (
  `category_id` varchar(16) NOT NULL,
  `category_name` varchar(255) NOT NULL,
  `category_webid` varchar(16) NOT NULL,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `category_name` (`category_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES
('10G1coNRVArXAXyK','Flatware','9c19108cc70d42dc'),
('1Zx6DYqPodqATCyF','Tables','68c2964483c5dd89'),
('4cAZzlORUK/x9pff','Candy Carts','e45fb3f53ec72314'),
('4FbNYK2SlX97+tbX','Serverware','174bdb74a17a2c61'),
('6e0ebqYdZ1226Ts3','Silverware','2ac244c6cac19c17'),
('98xC4R9kw+qXxlp/','Drinkware','3633cb86cb3aeda3'),
('aMgUNqzSrYQnbkYN','Draping','cdd430c68b12f394'),
('CzcfVrglF1cORrS/','Pedestal and Plinths','c3b1dc73ad3e8a83'),
('EH/hrvVp5Oc3uIrt','Candles','a8c867c0f708a7c8'),
('hlliNpVwEmCLI0cp','Lighting','dc32f42895f52767'),
('ISQdbBvXb6SGHFh0','Flowers, Plants and Trees','d42d4a8dc51fccc5'),
('JGnG0WO5wyeNGxc5','Marquee and LED Signs','46073ffedd2c6888'),
('l9MaaH3gDylnsN73','Decor','4dcd9a8e107efb15'),
('mEfkVpMmFSgyuWEd','Teaware or Coffeeware','9fec515ceeb00b9d'),
('NOdc2PSP2bz6BR0Q','Linen','89583b90176011c4'),
('uKmwctxAcAbRby8O','Chairs','891d021aa00ac630'),
('w7nKt148IWrnVr6Q','Children Party Rentals','ec0fa50fad58f55e'),
('YduZmJFmovN99StC','Center Pieces','c7c0ba8f75526b63');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category_items`
--

DROP TABLE IF EXISTS `category_items`;
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
  PRIMARY KEY (`item_id`),
  UNIQUE KEY `item_name` (`item_name`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `category_items_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category_items`
--

LOCK TABLES `category_items` WRITE;
/*!40000 ALTER TABLE `category_items` DISABLE KEYS */;
INSERT INTO `category_items` VALUES
('02ed0fead3294912','Cake Knife and Server Set Silver 3 Crystals Embedded on the Handles','Cake Knife and Server Set Silver 3 Crystals Embedded on the Handles\n\n\n','10G1coNRVArXAXyK','b5cd4c14','',87,20.00),
('16052f8c91f449d3','Wood Folding Table 7&amp;amp;amp;amp;#x27; serpentine','                                                                Wood Folding Table 7&amp;amp;#x27; serpentine\r\n                            \r\n                            ','1Zx6DYqPodqATCyF','43f681e0','16052f8c91f449d3.jpeg',168,10.00),
('166f62f5e8f646d0','Ballroom Gold Dinner Spoon Blue Handle','Ballroom Gold Dinner Spoon Blue Handle When renting dinnerware, glassware, silverware, trays, bowls, serving pieces, etc. we require that return them in the crates, racks, and packaging in which they are delivered and remove any excess debris by scraping or rinsing off the equipment prior to returning. All silverware and dinnerware need to be rinse of food or drink before, they need to package for transportation in the same condition they was delivery. any damage on the items because customer don&#x27;t wrapped and package the items in the same way at delivery time will not be cover by DW fee, $150.00 will be charge for any quantity of silverware or dinnerware return with food or drink on (items return not rinse)','10G1coNRVArXAXyK','3fa42004','',47,1.25),
('22316275b8b74264','Ballroom Gold Dinner Knife White Handle','Ballroom Gold Dinner Knife White Handle\n\n','10G1coNRVArXAXyK','ed9bf239','',822,1.25),
('2b7b3265681b41cd','24K Blush&#x2F;Mauve Dining Chairs','24K Blush&#x2F;Mauve Dining Chairs\n\n','uKmwctxAcAbRby8O','64055c31','',18,16.00),
('2fa5af7ef8634bbd','Belmont Silver Dinner Knife','Belmont Silver Dinner Knife\n\n','10G1coNRVArXAXyK','82643a66','',124,1.60),
('33bcd364a75849d4','Ballroom Gold Dinner Knife Pink Handle','Ballroom Gold Dinner Knife Pink Handle\n','10G1coNRVArXAXyK','72122b35','',288,1.50),
('355ff236ed11412f','Zoie Gold Cake Tables','Zoie Gold Cake Tables\r\n                            ','1Zx6DYqPodqATCyF','510e5818','355ff236ed11412f.png',161,179.99),
('364757c4373d4f19','Ballroom Gold Dinner Fork White Handle','Ballroom Gold Dinner Fork White Handle','10G1coNRVArXAXyK','d90458ba','',789,1.25),
('371a40153bca4687','Actwan Coffee Table Gold','Gold and Glass Actwan Coffee Table. Give your set a elegant accent with this beautiful coffee table. 50&quot;L X 26&quot;W X 18&quot;H','1Zx6DYqPodqATCyF','791c630b','',17,85.00),
('3ce99bbafa2d4764','24K Peacock Dining Chairs','24K Peacock Dining Chairs','uKmwctxAcAbRby8O','c34260ed','',96,16.00),
('3ee29c2987074a7c','Wire Square Gold Cocktail Table','Wire Square Gold Cocktail Table','1Zx6DYqPodqATCyF','6786ba47','3ee29c2987074a7c.jpeg',287,90.00),
('4360d05b0ae543c3','Agnus Mirror Dining Table','Agnus Mirror Dining Table Picture 4 tables will seat 16 guest.\n\n','1Zx6DYqPodqATCyF','8932ebd8','',54,400.00),
('4482837eb9164a54','Anakin Chrome Silver Stainless Steel Barstool','Anakin Chrome Silver Stainless Steel Barstool\n\n','uKmwctxAcAbRby8O','4403443c','',98,30.00),
('4b379d2bc0354e64','24K Black Tie Dining Chairs','24K Black Tie Dining Chairs Because classics never go out of style! Have a seat at the table in style with our ultra-chic Dining Chairs.','uKmwctxAcAbRby8O','1e5402d3','',21,16.09),
('4cb102e7becc466a','9 Inch Gold Serving Tongs Gold Serving Utensils Salad Tongs Buffet Tongs','9 Inch Gold Serving Tongs Gold Serving Utensils Salad Tongs Buffet Tongs','10G1coNRVArXAXyK','0d70b1f4','',789,3.00),
('4fd7b66124584929','24K Purple Dining Chairs','24K Purple Dining Chairs Because classics never go out of style! Have a seat at the table in style with our ultra-chic Dining Chairs.','uKmwctxAcAbRby8O','358a7d44','',14,16.00),
('50b095e236324107','Christmas Garland Gold Napkin Rings','Christmas Garland Gold Napkin Rings\n\n\n\n\n','10G1coNRVArXAXyK','1b6c99b0','',104,0.85),
('51f58aa06dcb4836','Ceramic White Spoon Rest 4.8 Inches Spoon Holder','Ceramic White Spoon Rest 4.8 Inches Spoon Holder\n\n\n\n','10G1coNRVArXAXyK','3c7d1339','',209,3.00),
('676cf130c34a4e17','Ballroom Gold Dinner Fork with Red Handler','Ballroom Gold Dinner Fork with Red Handler','10G1coNRVArXAXyK','8b8140c9','',584,1.25),
('725e3a7b82c04e92','Elegant Demitasse Spoon','Elegant Demitasse Spoon\n','10G1coNRVArXAXyK','fea9d63e','',145,0.60),
('7f01185169634b63','Ballroom Gold Dinner Fork Blue Handle','Ballroom Gold Dinner Fork Blue Handle When renting dinnerware, glassware, silverware, trays, bowls, serving pieces, etc. we require that return them in the crates, racks, and packaging in which they are delivered and remove any excess debris by scraping or rinsing off the equipment prior to returning. All silverware and dinnerware need to be rinse of food or drink before, they need to package for transportation in the same condition they was delivery. any damage on the items because customer don\'t wrapped and package the items in the same way at delivery time will not be cover by DW fee, $150.00 will be charge for any quantity of silverware or dinnerware return with food or drink on (items return not rinse)','10G1coNRVArXAXyK','0783836a','',546,1.25),
('8557d107352b4a4b','Elegant Gold Dessert&#x2F;Salad Fork','Elegant Gold Dessert&#x2F;Salad Fork','10G1coNRVArXAXyK','0504bbf9','',214,1.10),
('8a50d48bb27440d8','Ballroom Gold Dessert Fork with Red Handler','Ballroom Gold Dessert Fork with Red Handler','10G1coNRVArXAXyK','d1e0e6e8','',985,1.15),
('8b9bd163e4884e19','24K Emerald Dining Chairs','24K Emerald Dining Chairs Because classics never go out of style! Have a seat at the table in style with our ultra-chic Dining Chairs.\n\n','uKmwctxAcAbRby8O','bfaf8190','',36,16.00),
('8cdd771046234df8','24K Light Blue Dining Chairs','24K Light Blue Dining Chairs Because classics never go out of style! Have a seat at the table in style with our ultra-chic Dining Chairs.','uKmwctxAcAbRby8O','db6c543a','',32,16.00),
('8d96bd27a96a4767','Ballroom Gold Dessert Spoon White Handle','Ballroom Gold Dessert Spoon White Handle','10G1coNRVArXAXyK','77d78908','',65,1.10),
('90894bf8c1ad4171','24K Navy Blue Dining Chairs','24K Navy Blue Dining Chairs Because classics never go out of style! Have a seat at the table in style with our ultra-chic Dining Chairs.','uKmwctxAcAbRby8O','7ed164b0','',69,16.00),
('93353f376133459e','  24K Lavender Dining Chairs','24K Lavender Dining Chairs Because classics never go out of style! Have a seat at the table in style with our ultra-chic Dining Chairs.','uKmwctxAcAbRby8O','59bc625f','',44,16.00),
('9b036120f5db4c9d','Amber Gold Barstool Chair with White Cushion','Amber Gold Barstool Chair with White Cushion','uKmwctxAcAbRby8O','e2ed277a','',78,30.00),
('a0a6c066f30443d9','Addison Dining Table','Addison Dining Table\n','1Zx6DYqPodqATCyF','876ed2cf','',45,99.00),
('ac07b1bd3a7840c1','Ballroom Gold Dinner Knife with Red Handler','Ballroom Gold Dinner Knife with Red Handler\n\n','10G1coNRVArXAXyK','b4a40ec9','',547,1.25),
('b8637f2b3c0343cc','  Ballroom Gold Dessert Fork White Handle','Ballroom Gold Dessert Fork White Handle','10G1coNRVArXAXyK','a48a2ad8','',985,1.15),
('c18c87b9e83e4be5','Wire Round White Cocktail Table','Wire Round White Cocktail Table\r\n                            ','1Zx6DYqPodqATCyF','9671a672','c18c87b9e83e4be5.jpeg',401,90.00),
('c84d41752c9e4a92','Christmas Tree Silver Napkin Rings','Christmas Tree Silver Napkin Rings','10G1coNRVArXAXyK','226355d1','',103,0.85),
('ce15469f0ac8445d','Elegant Gold Dessert Spoon','Elegant Gold Dessert Spoon\n','10G1coNRVArXAXyK','9cb58877','',148,0.90),
('ce80343574de49ec','Elegant Gold Butter Knife','Elegant Gold Butter Knife\n','10G1coNRVArXAXyK','08fbb48d','',148,0.60),
('ceace314cca3487a','Ballroom Gold Dessert Fork Blue Handle','Ballroom Gold Dessert Fork Blue Handle\n','10G1coNRVArXAXyK','09d950cb','',96,1.15),
('d5371d76b7774a6f','24K Lady In Pink Dining Chairs','24K Lady In Pink Dining Chairs Because classics never go out of style! Have a seat at the table in style with our ultra-chic Dining Chairs.','uKmwctxAcAbRby8O','556b37fa','',48,19.56),
('dbf60340050941b2','Wire Round Black Cocktail Table','                                Wire Round Black Cocktail Table\r\n                            ','1Zx6DYqPodqATCyF','5fd27105','dbf60340050941b2.jpeg',131,90.00),
('dcca86a81966418e','Aileen Luxe Dining Chair','Aileen Luxe Dining Chair','uKmwctxAcAbRby8O','044c6f39','',98,19.99),
('e05aa238f8ab435f','Belmont Silver Salad Fork','Belmont Silver Salad Fork\n\n\n','10G1coNRVArXAXyK','e8d247b3','',197,1.40),
('e9f4eb8e5ad84024','Amber Black Chair','Amber Black Chair','uKmwctxAcAbRby8O','a6d4f1e6','',45,99.00),
('ea505ffcb9b8467b','Belmont Silver Dinner Fork','Belmont Silver Dinner Fork','10G1coNRVArXAXyK','6ede2b71','',427,1.60),
('eb0ac7dd00bf4dc7','24K Red Carpet Dining Chairs','24K Red Carpet Dining Chairs','uKmwctxAcAbRby8O','8ab09465','',56,16.00),
('ebca6d9f86bc4d30','24K Winter Dining Chairs','24K Winter Dining Chairs Because classics never go out of style! Have a seat at the table in style with our ultra-chic Dining Chairs.','uKmwctxAcAbRby8O','3ba5ae26','',87,16.00),
('f32d653bd6754382','Amber Gold Chair with White Cushion','Amber Gold Chair with White Cushion\n\n','uKmwctxAcAbRby8O','376aadb0','',78,20.00),
('fadec2f863804104','Ballroom Gold Dinner Knife Blue Handle','Ballroom Gold Dinner Knife Blue Handle When renting dinnerware, glassware, silverware, trays, bowls, serving pieces, etc. we require that return them in the crates, racks, and packaging in which they are delivered and remove any excess debris by scraping or rinsing off the equipment prior to returning. All silverware and dinnerware need to be rinse of food or drink before, they need to package for transportation in the same condition they was delivery. any damage on the items because customer don&#x27;t wrapped and package the items in the same way at delivery time will not be cover by DW fee, $150.00 will be charge for any quantity of silverware or dinnerware return with food or drink on (items return not rinse)\n\n','10G1coNRVArXAXyK','67e6214b','',47,1.50),
('fdbf62e61f3047f6','Ballroom Gold Dinner Spoon with White Handler','Ballroom Gold Dinner Spoon with White Handler','10G1coNRVArXAXyK','a30b65f4','',175,1.25);
/*!40000 ALTER TABLE `category_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `customers` (
  `customer_id` varchar(16) NOT NULL,
  `completename` char(255) DEFAULT NULL,
  `email` char(255) DEFAULT NULL,
  `street_address` char(255) DEFAULT NULL,
  `city` char(255) DEFAULT NULL,
  `state` char(255) DEFAULT NULL,
  `zipcode` char(255) DEFAULT NULL,
  `phone` char(255) DEFAULT NULL,
  `order_note` char(255) DEFAULT NULL,
  PRIMARY KEY (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--


--
-- Table structure for table `order_category_items`
--

DROP TABLE IF EXISTS `order_category_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `order_category_items` (
  `order_category_items_id` char(64) NOT NULL COMMENT 'Primary Key for this order category item',
  `order_id` char(64) NOT NULL COMMENT 'References an order in the order table',
  `category_id` char(64) NOT NULL COMMENT 'References the sub category from which this item belongs to',
  `quantity` int(11) NOT NULL,
  `unitSalePrice` decimal(10,2) NOT NULL COMMENT 'The price at which the category item was sold when order was being processed.',
  `subtotal` decimal(10,2) NOT NULL COMMENT 'The sub total for this item x(multiplied by) quantity',
  PRIMARY KEY (`order_category_items_id`),
  KEY `order_id` (`order_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `order_category_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `order_category_items_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_category_items`
--

LOCK TABLES `order_category_items` WRITE;
/*!40000 ALTER TABLE `order_category_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_category_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `orders` (
  `order_id` char(64) NOT NULL COMMENT 'Primary Key for this order',
  `customer_id` char(64) NOT NULL,
  `order_date` timestamp NULL DEFAULT current_timestamp(),
  `total_amount` decimal(10,2) NOT NULL,
  `payment_status` enum('pending','completed','failed') DEFAULT NULL,
  `paypal_transaction_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `otp`
--

DROP TABLE IF EXISTS `otp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `otp` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_email` varchar(50) NOT NULL,
  `otp_code` varchar(10) NOT NULL,
  `expiration_time` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_email` (`user_email`),
  CONSTRAINT `otp_ibfk_1` FOREIGN KEY (`user_email`) REFERENCES `users` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=173 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `otp`
--

LOCK TABLES `otp` WRITE;
/*!40000 ALTER TABLE `otp` DISABLE KEYS */;
INSERT INTO `otp` VALUES
(164,'asong_nic@email.bashballoonsrentals.com','152240477','2024-04-16 14:05:22'),
(168,'franklin@email.bashballoonsrentals.com','085360691','2024-04-23 23:03:03'),
(169,'franklin@email.bashballoonsrentals.com','686306457','2024-04-23 23:53:03'),
(170,'franklin.nkokam.ngongang@gmail.com','266356925','2024-04-24 00:40:53');
/*!40000 ALTER TABLE `otp` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `user_id` varchar(50) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `last_modified` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL,
  `login_attempts` int(11) DEFAULT 0,
  `user_type` enum('standard_admin','master_admin','customer') DEFAULT 'standard_admin',
  `account_status` enum('active','locked') DEFAULT 'active',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
('90ad544413be0ba8ee6c6cae','franklin','franklin@email.bashballoonsrentals.com','*EA194597C5AC17C91AC312B60493D835C56698FC',NULL,NULL,'2024-04-09 22:23:46',0,'master_admin','active'),
('ba719890e6e762564eef1a','franklin.nkokam.ngongang','franklin.nkokam.ngongang@gmail.com','*EA194597C5AC17C91AC312B60493D835C56698FC',NULL,'2024-04-09 22:22:52','2024-04-06 18:01:09',0,'standard_admin','active'),
('fe76c21a8aaaa283','Asong Nic','asong_nic@email.bashballoonsrentals.com','*2921B94DC19B5D28EC1046B803187CADAC23F939',NULL,NULL,'2024-04-09 22:29:48',0,'standard_admin','active'),
('q6qSVIlN84+2621uokE1','ntuifranklin','ntuifranklin2005@gmail.com','*EA194597C5AC17C91AC312B60493D835C56698FC',NULL,NULL,'2024-02-12 19:40:09',0,'standard_admin','active'),
('uMWMmhFMA1nmvZIpsXiOfjL4YQ8=','order','order@box.bashballoonsrentals.com','*EA194597C5AC17C91AC312B60493D835C56698FC','2024-02-29 02:29:02','2024-02-29 03:06:33','2024-02-29 02:29:02',0,'master_admin','active');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-04-26 16:28:10
