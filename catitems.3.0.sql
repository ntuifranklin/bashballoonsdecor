-- MySQL dump 10.13  Distrib 8.0.40, for Linux (x86_64)
--
-- Host: 172.17.0.2    Database: bashrentaldbprodbbd
-- ------------------------------------------------------
-- Server version	11.5.2-MariaDB-ubu2404

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `category_items`
--

DROP TABLE IF EXISTS `category_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
  CONSTRAINT `category_items_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category_items`
--

LOCK TABLES `category_items` WRITE;
/*!40000 ALTER TABLE `category_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `category_items` ENABLE KEYS */;
UNLOCK TABLES;
