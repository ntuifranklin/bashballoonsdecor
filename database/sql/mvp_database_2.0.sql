-- MariaDB dump 10.19  Distrib 10.11.2-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: bashballoonsdecor
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
-- Table structure for table `IndividualItems`
--

DROP TABLE IF EXISTS `IndividualItems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `IndividualItems` (
  `individItemID` char(10) NOT NULL,
  `individItemTitle` char(100) NOT NULL,
  `individItemDescription` char(100) NOT NULL,
  `individItemUnitCost` float NOT NULL,
  `individItemQtyAvailable` int(11) NOT NULL,
  PRIMARY KEY (`individItemID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `IndividualItems`
--

LOCK TABLES `IndividualItems` WRITE;
/*!40000 ALTER TABLE `IndividualItems` DISABLE KEYS */;
INSERT INTO `IndividualItems` VALUES
('6b65ac0e7f','Wine Glasses','',1,10000),
('acc1607057','Glass Table','',14,300),
('b4952d9db7','Fancy Chairs','',17,764),
('b583dd37c0','DJ','',750,3),
('b661760f0','360 Picture','',220,20),
('cac96965e2','Glass Charger Plates','',6,2500),
('e33ada4996','Chafing Dishes','',9,360),
('ef0c617141','Chafing Dishes Stand','',75,289),
('f4c33c5e2c','Floor Wrap','',145,3689),
('fa8fbbce63','Champagne Glasses','',1,10000),
('fdc724fa11','Chiavari chairs (Gold, Silver, and Ice Chairs)','',8,456);
/*!40000 ALTER TABLE `IndividualItems` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `customers` (
  `customer_id` char(64) NOT NULL,
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

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_individualItems`
--

DROP TABLE IF EXISTS `order_individualItems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `order_individualItems` (
  `order_individItemID` char(64) NOT NULL COMMENT 'Primary Key for this individual item order',
  `order_id` char(64) DEFAULT NULL COMMENT 'References an order in the order table',
  `individItemID` char(64) DEFAULT NULL COMMENT 'References the individual item in this order',
  `quantity` int(11) DEFAULT NULL,
  `individItemUnitSalePrice` decimal(10,2) DEFAULT NULL COMMENT 'The price at which this individual item was sold when the order was being processed, since prices can change.',
  `subtotal` decimal(10,2) DEFAULT NULL COMMENT 'The sub total for this item x(multiplied by) quantity',
  PRIMARY KEY (`order_individItemID`),
  KEY `order_id` (`order_id`),
  KEY `individItemID` (`individItemID`),
  CONSTRAINT `order_individualItems_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `order_individualItems_ibfk_2` FOREIGN KEY (`individItemID`) REFERENCES `IndividualItems` (`individItemID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_individualItems`
--

LOCK TABLES `order_individualItems` WRITE;
/*!40000 ALTER TABLE `order_individualItems` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_individualItems` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_package`
--

DROP TABLE IF EXISTS `order_package`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `order_package` (
  `order_packageid` char(64) NOT NULL,
  `order_id` char(64) DEFAULT NULL COMMENT 'References an order in the order table',
  `packageid` char(64) DEFAULT NULL COMMENT 'References the individual item in this order',
  `quantity` int(11) DEFAULT NULL,
  `packageUnitSalePrice` decimal(10,2) DEFAULT NULL COMMENT 'The price at which this package was sold when order was being processed.',
  `subtotal` decimal(10,2) DEFAULT NULL COMMENT 'The sub total for this package x(multiplied by) quantity',
  PRIMARY KEY (`order_packageid`),
  KEY `order_id` (`order_id`),
  KEY `packageid` (`packageid`),
  CONSTRAINT `order_package_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `order_package_ibfk_2` FOREIGN KEY (`packageid`) REFERENCES `package` (`packageid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_package`
--

LOCK TABLES `order_package` WRITE;
/*!40000 ALTER TABLE `order_package` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_package` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `orders` (
  `order_id` char(64) NOT NULL COMMENT 'Primary Key for this order',
  `customer_id` char(64) DEFAULT NULL,
  `order_date` timestamp NULL DEFAULT current_timestamp(),
  `total_amount` decimal(10,2) DEFAULT NULL,
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
-- Table structure for table `package`
--

DROP TABLE IF EXISTS `package`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `package` (
  `packageid` varchar(20) NOT NULL,
  `packagedesc` varchar(22) DEFAULT NULL,
  `packagecost` smallint(6) DEFAULT NULL,
  PRIMARY KEY (`packageid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `package`
--

LOCK TABLES `package` WRITE;
/*!40000 ALTER TABLE `package` DISABLE KEYS */;
INSERT INTO `package` VALUES
('ab7adb97a1f89a92527a','Package For 250 Guests',3800),
('bfcd68043040f450b8e7','Package For 300 Guests',4900),
('d09745340cebd03c6e0a','Package For 150 Guests',3000);
/*!40000 ALTER TABLE `package` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `package_contains_items`
--

DROP TABLE IF EXISTS `package_contains_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `package_contains_items` (
  `pckcontid` varchar(18) NOT NULL,
  `packageid` varchar(20) NOT NULL,
  `packageitemid` varchar(10) NOT NULL,
  `qtyneeded` smallint(6) DEFAULT NULL,
  PRIMARY KEY (`pckcontid`,`packageid`,`packageitemid`),
  KEY `packageid` (`packageid`),
  KEY `packageitemid` (`packageitemid`),
  CONSTRAINT `package_contains_items_ibfk_1` FOREIGN KEY (`packageid`) REFERENCES `package` (`packageid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `package_contains_items_ibfk_2` FOREIGN KEY (`packageitemid`) REFERENCES `packageitems` (`packageitemid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `package_contains_items`
--

LOCK TABLES `package_contains_items` WRITE;
/*!40000 ALTER TABLE `package_contains_items` DISABLE KEYS */;
INSERT INTO `package_contains_items` VALUES
('0eb51dc25bda88e984','ab7adb97a1f89a92527a','ecdc6ce1c8',1),
('0f63244d7a1c4ea411','bfcd68043040f450b8e7','db2caf5e81',300),
('11e406111d92cb59ec','d09745340cebd03c6e0a','d2197d2019',150),
('1c519a421b23f7810b','ab7adb97a1f89a92527a','d2197d2019',250),
('2e80ed2827b19478d5','bfcd68043040f450b8e7','b32e500291',1),
('3f24ea60e82d9c4d4c','d09745340cebd03c6e0a','a7e845cfc4',150),
('428c4ccea583e5d77c','bfcd68043040f450b8e7','a7e845cfc4',300),
('4c7d682c08285184a3','bfcd68043040f450b8e7','b59dead12b',300),
('664b18f1201a338f89','bfcd68043040f450b8e7','fd5330f23a',30),
('68130e591cb311f0e9','ab7adb97a1f89a92527a','b32e500291',1),
('a913ce5abe90365205','ab7adb97a1f89a92527a','e2f3a23607',2),
('aa16c8cc5b185fdea1','ab7adb97a1f89a92527a','fd5330f23a',25),
('b62e2d71899255e85b','bfcd68043040f450b8e7','ecdc6ce1c8',1),
('b8bdf533aabe38e607','ab7adb97a1f89a92527a','db2caf5e81',250),
('ba60914d95ca2660f0','ab7adb97a1f89a92527a','b59dead12b',250),
('bc0bf40d3955776fa0','d09745340cebd03c6e0a','b32e500291',1),
('bff5246b541e6a5e98','ab7adb97a1f89a92527a','d0959bbbd3',25),
('c353e07631b3519e9f','d09745340cebd03c6e0a','d0959bbbd3',15),
('cbf7947a23309d4df9','ab7adb97a1f89a92527a','c46a203578',25),
('cdab10556e033f4fac','bfcd68043040f450b8e7','d0959bbbd3',30),
('cead7ef336d8877776','d09745340cebd03c6e0a','c46a203578',15),
('d4a4bb9c9d625a4603','ab7adb97a1f89a92527a','a7e845cfc4',250),
('d572ced7ad5e7f3343','bfcd68043040f450b8e7','c46a203578',30),
('d704c6fb3533301c7d','d09745340cebd03c6e0a','fd5330f23a',15),
('dc30c0af2f26d74921','bfcd68043040f450b8e7','d2197d2019',300),
('ddfd1673b4c7b75d88','d09745340cebd03c6e0a','e2f3a23607',2),
('e161a32edb4547d400','bfcd68043040f450b8e7','e2f3a23607',2),
('f1c4e98d4600470d27','d09745340cebd03c6e0a','db2caf5e81',150),
('f3c3de989b601b24f6','d09745340cebd03c6e0a','ecdc6ce1c8',1),
('fec021b0c0b6afa489','d09745340cebd03c6e0a','b59dead12b',200);
/*!40000 ALTER TABLE `package_contains_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `packageitems`
--

DROP TABLE IF EXISTS `packageitems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `packageitems` (
  `packageitemid` varchar(10) NOT NULL,
  `itemdesc` varchar(41) DEFAULT NULL,
  `qtyavailable` smallint(6) DEFAULT NULL,
  PRIMARY KEY (`packageitemid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `packageitems`
--

LOCK TABLES `packageitems` WRITE;
/*!40000 ALTER TABLE `packageitems` DISABLE KEYS */;
INSERT INTO `packageitems` VALUES
('a7e845cfc4','Charge Plate ',2000),
('b32e500291','Up Lighting',35),
('b59dead12b','Knives',500),
('c46a203578','Centerpieces',90),
('d0959bbbd3','Flower Balls Or Candles Holders',105),
('d2197d2019','Napkins (color of your choice )',700),
('db2caf5e81','Champagne Glasses',1250),
('e2f3a23607','Throne Chairs ',85),
('ecdc6ce1c8','Stage Decor',20),
('fd5330f23a','Round Table Cloth ( color of your choice)',145),
('LgWBYqCdA4','Spoons',500),
('VZBFfLu11p','Forks',500);
/*!40000 ALTER TABLE `packageitems` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-12-26 17:22:54
