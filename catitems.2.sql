
-- Table structure for table `category_items`
--
use bashrentaldbprodbbd ;
-- START TRANSACTION ;
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
INSERT INTO `category_items` VALUES
  ('02ed0fead3294912','Cake Knife and Server Set Silver 3 Crystals Embedded on the Handles','Cake Knife and Server Set Silver 3 Crystals Embedded on the Handles\n\n\n','10G1coNRVArXAXyK','b5cd4c14','',87,20.00,'2024-11-16 00:40:40','2024-11-16 00:40:40'),

  ('16052f8c91f449d3','Wood Folding Table serpentine','Wood Folding Table serpentine\r\n                            \r\n                            ','1Zx6DYqPodqATCyF','43f681e0','16052f8c91f449d3.jpeg',168,10.00,'2024-11-16 00:40:40','2024-11-16 00:40:40'),

  ('166f62f5e8f646d0','Ballroom Gold Dinner Spoon Blue Handle','Ballroom Gold Dinner Spoon Blue Handle When renting dinnerware, glassware, silverware, trays, bowls, serving pieces, etc. we require that return them in the crates, racks, and packaging in which they are delivered and remove any excess debris by scraping or rinsing off the equipment prior to returning. All silverware and dinnerware need to be rinse of food or drink before, they need to package for transportation in the same condition they was delivery. any damage on the items because customer don&#x27;t wrapped and package the items in the same way at delivery time will not be cover by DW fee, $150.00 will be charge for any quantity of silverware or dinnerware return with food or drink on (items return not rinse)','10G1coNRVArXAXyK','3fa42004','',47,1.25,'2024-11-16 00:40:40','2024-11-16 00:40:40'),

  ('22316275b8b74264','Ballroom Gold Dinner Knife White Handle','Ballroom Gold Dinner Knife White Handle\n\n','10G1coNRVArXAXyK','ed9bf239','',822,1.25,'2024-11-16 00:40:40','2024-11-16 00:40:40'),

  ('2b7b3265681b41cd','24K Blush&#x2F;Mauve Dining Chairs','24K Blush&#x2F;Mauve Dining Chairs\n\n','uKmwctxAcAbRby8O','64055c31','',18,16.00,'2024-11-16 00:40:40','2024-11-16 00:40:40'),

  ('2fa5af7ef8634bbd','Belmont Silver Dinner Knife','Belmont Silver Dinner Knife\n\n','10G1coNRVArXAXyK','82643a66','',124,1.60,'2024-11-16 00:40:40','2024-11-16 00:40:40'),

  ('33bcd364a75849d4','Ballroom Gold Dinner Knife Pink Handle','Ballroom Gold Dinner Knife Pink Handle\n','10G1coNRVArXAXyK','72122b35','',288,1.50,'2024-11-16 00:40:40','2024-11-16 00:40:40'),

  ('355ff236ed11412f','Zoie Gold Cake Tables','Zoie Gold Cake Tables\r\n                            ','1Zx6DYqPodqATCyF','510e5818','355ff236ed11412f.png',161,179.99,'2024-11-16 00:40:40','2024-11-16 00:40:40'),

  ('364757c4373d4f19','Ballroom Gold Dinner Fork White Handle','Ballroom Gold Dinner Fork White Handle','10G1coNRVArXAXyK','d90458ba','',789,1.25,'2024-11-16 00:40:40','2024-11-16 00:40:40'),

  ('371a40153bca4687','Actwan Coffee Table Gold','Gold and Glass Actwan Coffee Table. Give your set a elegant accent with this beautiful coffee table. 50&quot;L X 26&quot;W X 18&quot;H','1Zx6DYqPodqATCyF','791c630b','',17,85.00,'2024-11-16 00:40:40','2024-11-16 00:40:40'),

  ('3ce99bbafa2d4764','24K Peacock Dining Chairs','24K Peacock Dining Chairs','uKmwctxAcAbRby8O','c34260ed','',96,16.00,'2024-11-16 00:40:40','2024-11-16 00:40:40'),

  ('3ee29c2987074a7c','Wire Square Gold Cocktail Table','Wire Square Gold Cocktail Table','1Zx6DYqPodqATCyF','6786ba47','3ee29c2987074a7c.jpeg',287,90.00,'2024-11-16 00:40:40','2024-11-16 00:40:40'),

  ('4360d05b0ae543c3','Agnus Mirror Dining Table','Agnus Mirror Dining Table Picture 4 tables will seat 16 guest.\n\n','1Zx6DYqPodqATCyF','8932ebd8','',54,400.00,'2024-11-16 00:40:40','2024-11-16 00:40:40'),

  ('4482837eb9164a54','Anakin Chrome Silver Stainless Steel Barstool','Anakin Chrome Silver Stainless Steel Barstool\n\n','uKmwctxAcAbRby8O','4403443c','',98,30.00,'2024-11-16 00:40:40','2024-11-16 00:40:40'),

  ('4b379d2bc0354e64','24K Black Tie Dining Chairs','24K Black Tie Dining Chairs Because classics never go out of style! Have a seat at the table in style with our ultra-chic Dining Chairs.','uKmwctxAcAbRby8O','1e5402d3','',21,16.09,'2024-11-16 00:40:40','2024-11-16 00:40:40'),

  ('4cb102e7becc466a','9 Inch Gold Serving Tongs Gold Serving Utensils Salad Tongs Buffet Tongs','9 Inch Gold Serving Tongs Gold Serving Utensils Salad Tongs Buffet Tongs','10G1coNRVArXAXyK','0d70b1f4','',789,3.00,'2024-11-16 00:40:40','2024-11-16 00:40:40'),

  ('4fd7b66124584929','24K Purple Dining Chairs','24K Purple Dining Chairs Because classics never go out of style! Have a seat at the table in style with our ultra-chic Dining Chairs.','uKmwctxAcAbRby8O','358a7d44','',14,16.00,'2024-11-16 00:40:40','2024-11-16 00:40:40'),

  ('50b095e236324107','Christmas Garland Gold Napkin Rings','Christmas Garland Gold Napkin Rings\n\n\n\n\n','10G1coNRVArXAXyK','1b6c99b0','',104,0.85,'2024-11-16 00:40:40','2024-11-16 00:40:40'),

  ('51f58aa06dcb4836','Ceramic White Spoon Rest 4.8 Inches Spoon Holder','Ceramic White Spoon Rest 4.8 Inches Spoon Holder\n\n\n\n','10G1coNRVArXAXyK','3c7d1339','',209,3.00,'2024-11-16 00:40:40','2024-11-16 00:40:40'),

  ('676cf130c34a4e17','Ballroom Gold Dinner Fork with Red Handler','Ballroom Gold Dinner Fork with Red Handler','10G1coNRVArXAXyK','8b8140c9','',584,1.25,'2024-11-16 00:40:40','2024-11-16 00:40:40'),

  ('725e3a7b82c04e92','Elegant Demitasse Spoon','Elegant Demitasse Spoon\n','10G1coNRVArXAXyK','fea9d63e','',145,0.60,'2024-11-16 00:40:40','2024-11-16 00:40:40'),

  ('79f50de09a114d6b','Navy Blue Art Deco Table Runner','Navy Blue Art Deco Table Runner','NOdc2PSP2bz6BR0Q','6f2d3408','https://imagedelivery.net/FsZO54BRtMf2GCnVBBnkWg/2fa5c2fb-cac7-4de4-5fb5-297485d75800/110x118',226,10.00,'2024-11-16 00:43:23','2024-11-16 00:43:23'),

  ('7f01185169634b63','Ballroom Gold Dinner Fork Blue Handle','Ballroom Gold Dinner Fork Blue Handle When renting dinnerware, glassware, silverware, trays, bowls, serving pieces, etc. we require that return them in the crates, racks, and packaging in which they are delivered and remove any excess debris by scraping or rinsing off the equipment prior to returning. All silverware and dinnerware need to be rinse of food or drink before, they need to package for transportation in the same condition they was delivery. any damage on the items because customer don\'t wrapped and package the items in the same way at delivery time will not be cover by DW fee, $150.00 will be charge for any quantity of silverware or dinnerware return with food or drink on (items return not rinse)','10G1coNRVArXAXyK','0783836a','',546,1.25,'2024-11-16 00:40:40','2024-11-16 00:40:40'),

  ('8557d107352b4a4b','Elegant Gold Dessert&#x2F;Salad Fork','Elegant Gold Dessert&#x2F;Salad Fork','10G1coNRVArXAXyK','0504bbf9','',214,1.10,'2024-11-16 00:40:40','2024-11-16 00:40:40'),

  ('8a50d48bb27440d8','Ballroom Gold Dessert Fork with Red Handler','Ballroom Gold Dessert Fork with Red Handler','10G1coNRVArXAXyK','d1e0e6e8','',985,1.15,'2024-11-16 00:40:40','2024-11-16 00:40:40'),

  ('8b9bd163e4884e19','24K Emerald Dining Chairs','24K Emerald Dining Chairs Because classics never go out of style! Have a seat at the table in style with our ultra-chic Dining Chairs.\n\n','uKmwctxAcAbRby8O','bfaf8190','',36,16.00,'2024-11-16 00:40:40','2024-11-16 00:40:40'),

  ('8cdd771046234df8','24K Light Blue Dining Chairs','24K Light Blue Dining Chairs Because classics never go out of style! Have a seat at the table in style with our ultra-chic Dining Chairs.','uKmwctxAcAbRby8O','db6c543a','',32,16.00,'2024-11-16 00:40:40','2024-11-16 00:40:40'),

  ('8d96bd27a96a4767','Ballroom Gold Dessert Spoon White Handle','Ballroom Gold Dessert Spoon White Handle','10G1coNRVArXAXyK','77d78908','',65,1.10,'2024-11-16 00:40:40','2024-11-16 00:40:40'),

  ('90894bf8c1ad4171','24K Navy Blue Dining Chairs','24K Navy Blue Dining Chairs Because classics never go out of style! Have a seat at the table in style with our ultra-chic Dining Chairs.','uKmwctxAcAbRby8O','7ed164b0','',69,16.00,'2024-11-16 00:40:40','2024-11-16 00:40:40'),

  ('93353f376133459e','24K Lavender Dining Chairs','24K Lavender Dining Chairs Because classics never go out of style! Have a seat at the table in style with our ultra-chic Dining Chairs.','uKmwctxAcAbRby8O','59bc625f','',44,16.00,'2024-11-16 00:40:40','2024-11-16 00:40:40'),

  ('9b036120f5db4c9d','Amber Gold Barstool Chair with White Cushion','Amber Gold Barstool Chair with White Cushion','uKmwctxAcAbRby8O','e2ed277a','',78,30.00,'2024-11-16 00:40:40','2024-11-16 00:40:40'),

  ('a0a6c066f30443d9','Addison Dining Table','Addison Dining Table\n','1Zx6DYqPodqATCyF','876ed2cf','',45,99.00,'2024-11-16 00:40:40','2024-11-16 00:40:40'),

  ('ac07b1bd3a7840c1','Ballroom Gold Dinner Knife with Red Handler','Ballroom Gold Dinner Knife with Red Handler\n\n','10G1coNRVArXAXyK','b4a40ec9','',547,1.25,'2024-11-16 00:40:40','2024-11-16 00:40:40'),

  ('b4802aaedd354a26','Baby Blue Lamer Satin Table Runner','Baby Blue Lamer Satin Table Runner','NOdc2PSP2bz6BR0Q','6c556d97','https://imagedelivery.net/FsZO54BRtMf2GCnVBBnkWg/3599699d-a71e-40e5-287b-24e818a63400/110x118',244,5.99,'2024-11-16 00:42:31','2024-11-16 00:42:31,

  ('b8637f2b3c0343cc','Ballroom Gold Dessert Fork White Handle','Ballroom Gold Dessert Fork White Handle','10G1coNRVArXAXyK','a48a2ad8','',985,1.15,'2024-11-16 00:40:40','2024-11-16 00:40:40'),

  ('c18c87b9e83e4be5','Wire Round White Cocktail Table','Wire Round White Cocktail Table\r\n                            ','1Zx6DYqPodqATCyF','9671a672','c18c87b9e83e4be5.jpeg',401,90.00,'2024-11-16 00:40:40','2024-11-16 00:40:40'),

  ('c84d41752c9e4a92','Christmas Tree Silver Napkin Rings','Christmas Tree Silver Napkin Rings','10G1coNRVArXAXyK','226355d1','',103,0.85,'2024-11-16 00:40:40','2024-11-16 00:40:40'),

  ('ce15469f0ac8445d','Elegant Gold Dessert Spoon','Elegant Gold Dessert Spoon\n','10G1coNRVArXAXyK','9cb58877','',148,0.90,'2024-11-16 00:40:40','2024-11-16 00:40:40'),

  ('ce80343574de49ec','Elegant Gold Butter Knife','Elegant Gold Butter Knife\n','10G1coNRVArXAXyK','08fbb48d','',148,0.60,'2024-11-16 00:40:40','2024-11-16 00:40:40'),

  ('ceace314cca3487a','Ballroom Gold Dessert Fork Blue Handle','Ballroom Gold Dessert Fork Blue Handle\n','10G1coNRVArXAXyK','09d950cb','',96,1.15,'2024-11-16 00:40:40','2024-11-16 00:40:40'),

  ('d5371d76b7774a6f','24K Lady In Pink Dining Chairs','24K Lady In Pink Dining Chairs Because classics never go out of style! Have a seat at the table in style with our ultra-chic Dining Chairs.','uKmwctxAcAbRby8O','556b37fa','',48,19.56,'2024-11-16 00:40:40','2024-11-16 00:40:40'),

  ('dbf60340050941b2','Wire Round Black Cocktail Table','Wire Round Black Cocktail Table\r\n                            ','1Zx6DYqPodqATCyF','5fd27105','dbf60340050941b2.jpeg',131,90.00,'2024-11-16 00:40:40','2024-11-16 00:40:40'),

  ('dcca86a81966418e','Aileen Luxe Dining Chair','Aileen Luxe Dining Chair','uKmwctxAcAbRby8O','044c6f39','',98,19.99,'2024-11-16 00:40:40','2024-11-16 00:40:40'),

  ('e05aa238f8ab435f','Belmont Silver Salad Fork','Belmont Silver Salad Fork\n\n\n','10G1coNRVArXAXyK','e8d247b3','',197,1.40,'2024-11-16 00:40:40','2024-11-16 00:40:40'),

  ('e9f4eb8e5ad84024','Amber Black Chair','Amber Black Chair','uKmwctxAcAbRby8O','a6d4f1e6','',45,99.00,'2024-11-16 00:40:40','2024-11-16 00:40:40'),

  ('ea505ffcb9b8467b','Belmont Silver Dinner Fork','Belmont Silver Dinner Fork','10G1coNRVArXAXyK','6ede2b71','',427,1.60,'2024-11-16 00:40:40','2024-11-16 00:40:40'),

  ('eb0ac7dd00bf4dc7','24K Red Carpet Dining Chairs','24K Red Carpet Dining Chairs','uKmwctxAcAbRby8O','8ab09465','',56,16.00,'2024-11-16 00:40:40','2024-11-16 00:40:40'),

  ('ebca6d9f86bc4d30','24K Winter Dining Chairs','24K Winter Dining Chairs Because classics never go out of style! Have a seat at the table in style with our ultra-chic Dining Chairs.','uKmwctxAcAbRby8O','3ba5ae26','',87,16.00,'2024-11-16 00:40:40','2024-11-16 00:40:40'),

  ('f32d653bd6754382','Amber Gold Chair with White Cushion','Amber Gold Chair with White Cushion\n\n','uKmwctxAcAbRby8O','376aadb0','',78,20.00,'2024-11-16 00:40:40','2024-11-16 00:40:40'),

  ('fadec2f863804104','Ballroom Gold Dinner Knife Blue Handle','Ballroom Gold Dinner Knife Blue Handle When renting dinnerware, glassware, silverware, trays, bowls, serving pieces, etc. we require that return them in the crates, racks, and packaging in which they are delivered and remove any excess debris by scraping or rinsing off the equipment prior to returning. All silverware and dinnerware need to be rinse of food or drink before, they need to package for transportation in the same condition they was delivery. any damage on the items because customer don&#x27;t wrapped and package the items in the same way at delivery time will not be cover by DW fee, $150.00 will be charge for any quantity of silverware or dinnerware return with food or drink on (items return not rinse)\n\n','10G1coNRVArXAXyK','67e6214b','',47,1.50,'2024-11-16 00:40:40','2024-11-16 00:40:40'),

  ('fdbf62e61f3047f6','Ballroom Gold Dinner Spoon with White Handler','Ballroom Gold Dinner Spoon with White Handler','10G1coNRVArXAXyK','a30b65f4','',175,1.25,'2024-11-16 00:40:40','2024-11-16 00:40:40');
UNLOCK TABLES;
--COMMIT;
