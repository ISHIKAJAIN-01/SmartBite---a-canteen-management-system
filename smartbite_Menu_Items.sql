-- MySQL dump 10.13  Distrib 8.0.46, for macos15 (arm64)
--
-- Host: 127.0.0.1    Database: smartbite
-- ------------------------------------------------------
-- Server version	26.7.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '74451576-a077-11f1-a734-8cc430a5ac6e:1-190';

--
-- Table structure for table `Menu_Items`
--

DROP TABLE IF EXISTS `Menu_Items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Menu_Items` (
  `item_id` int NOT NULL AUTO_INCREMENT,
  `item_name` varchar(120) NOT NULL,
  `category_id` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `item_type` enum('Prepared','Ready to Serve') NOT NULL,
  `available` tinyint(1) NOT NULL DEFAULT '1',
  `preparation_time` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`item_id`),
  KEY `fk_menu_categories` (`category_id`),
  CONSTRAINT `fk_menu_categories` FOREIGN KEY (`category_id`) REFERENCES `Categories` (`category_id`),
  CONSTRAINT `chk_menu_price` CHECK ((`price` >= 0)),
  CONSTRAINT `chk_preparation_time` CHECK ((`preparation_time` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=255 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Menu_Items`
--

LOCK TABLES `Menu_Items` WRITE;
/*!40000 ALTER TABLE `Menu_Items` DISABLE KEYS */;
INSERT INTO `Menu_Items` VALUES (1,'Masala Dosa',2,40.00,'Prepared',1,5),(2,'Rajma Chawal',2,40.00,'Prepared',1,6),(3,'Chole Chawal',2,40.00,'Prepared',1,6),(4,'Pav Bhaji',2,40.00,'Prepared',1,6),(5,'Fried Rice',2,40.00,'Prepared',1,6),(6,'Fried Rice + Manchurian',2,60.00,'Prepared',1,5),(7,'Vada Pav',2,30.00,'Prepared',1,5),(8,'Fries',2,40.00,'Prepared',1,5),(9,'Peri Peri Fries',2,60.00,'Prepared',1,5),(10,'Cheese Fries',2,60.00,'Prepared',1,5),(11,'Chilli Potato',2,40.00,'Prepared',1,5),(12,'Honey Chilli Potato',2,45.00,'Prepared',1,5),(13,'Masala Idli',2,40.00,'Prepared',1,5),(14,'Burger',2,45.00,'Prepared',1,6),(15,'Grill Sandwich',2,30.00,'Prepared',1,5),(16,'Cheese Grill Sandwich',2,45.00,'Prepared',1,5),(17,'Aloo Patty',2,12.00,'Prepared',1,5),(18,'Paneer Patty',2,15.00,'Prepared',1,5),(19,'Veg Chowmein',2,30.00,'Prepared',1,5),(20,'White Sauce Pasta',2,50.00,'Prepared',1,6),(21,'Mixed Sauce Pasta',2,50.00,'Prepared',1,5),(22,'Red Sauce Pasta',2,45.00,'Prepared',1,5),(23,'Big Aloo Patty',2,15.00,'Prepared',1,5),(24,'Big Paneer Patty',2,25.00,'Prepared',1,5),(25,'Masala Maggi',2,30.00,'Prepared',1,6),(26,'Vegetable Maggi',2,35.00,'Prepared',1,6),(27,'Cheese Maggi',2,40.00,'Prepared',1,6),(28,'Onion Tomato Maggi',2,35.00,'Prepared',1,7),(29,'Cheese Burger',2,75.00,'Prepared',1,7),(30,'Club Cheese Burger',2,75.00,'Prepared',1,8),(31,'Red Sauce Pasta with Cheese',2,60.00,'Prepared',1,7),(32,'White Sauce Pasta with Cheese',2,65.00,'Prepared',1,11),(33,'Mixed Sauce Pasta with Cheese',2,65.00,'Prepared',1,11),(34,'Chilli Paneer',2,60.00,'Prepared',1,10),(35,'Chole Kulche',2,40.00,'Prepared',1,10),(36,'Chole Bhature',2,40.00,'Prepared',1,5),(37,'Plain Dosa',2,35.00,'Prepared',1,10),(38,'Veg Masala Dosa',2,50.00,'Prepared',1,10),(39,'Maharaja Masala Dosa',2,60.00,'Prepared',1,10),(40,'Paneer Dosa',2,60.00,'Prepared',1,10),(41,'Uttapam',2,70.00,'Prepared',1,10),(42,'Pizza Uttapam',2,120.00,'Prepared',1,10),(43,'Idli Sambhar',2,30.00,'Prepared',1,10),(44,'Veg Kathi Roll',2,50.00,'Prepared',1,10),(45,'Aloo Tikki Kathi Roll',2,60.00,'Prepared',1,10),(46,'Paneer Kathi Roll',2,70.00,'Prepared',1,10),(47,'Peri Peri Cheese Kathi Roll',2,80.00,'Prepared',1,10),(48,'Chilli Paneer Kathi Roll',2,80.00,'Prepared',1,10),(49,'Soya Kathi Roll',2,70.00,'Prepared',1,10),(50,'Chilli Chowmein Kathi Roll',2,70.00,'Prepared',1,10),(51,'Lachha Paratha',2,50.00,'Prepared',1,10),(52,'Malabar Paratha',2,25.00,'Prepared',1,10),(53,'Aloo Paratha',2,25.00,'Prepared',1,10),(54,'Gobi Paratha',2,30.00,'Prepared',1,10),(55,'Aloo Pyaz Paratha',2,30.00,'Prepared',1,10),(56,'Mix Veg Paratha',2,40.00,'Prepared',1,10),(57,'Paneer Paratha',2,40.00,'Prepared',1,10),(58,'Mix Cheese Paratha',2,55.00,'Prepared',1,10),(59,'Pizza Pocket',2,20.00,'Prepared',1,10),(60,'Pizza Puff',2,20.00,'Prepared',1,10),(61,'Garlic Bread',2,40.00,'Prepared',1,10),(62,'Aloo Tikki Sub',2,80.00,'Prepared',1,10),(63,'Aloo Tikki Sub with Cheese',2,95.00,'Prepared',1,10),(64,'Coke (250 ml)',1,20.00,'Ready to Serve',1,0),(65,'Coke (750 ml)',1,40.00,'Ready to Serve',1,0),(66,'Thums Up (250 ml)',1,20.00,'Ready to Serve',1,0),(67,'Thums Up (750 ml)',1,40.00,'Ready to Serve',1,0),(68,'Sprite (250 ml)',1,20.00,'Ready to Serve',1,0),(69,'Sprite (750 ml)',1,40.00,'Ready to Serve',1,0),(70,'Limca (250 ml)',1,20.00,'Ready to Serve',1,0),(71,'Limca (750 ml)',1,40.00,'Ready to Serve',1,0),(72,'Fanta (250 ml)',1,20.00,'Ready to Serve',1,0),(73,'Fanta (750 ml)',1,40.00,'Ready to Serve',1,0),(74,'Maaza (200 ml)',1,20.00,'Ready to Serve',1,0),(75,'Minute Maid (500 ml)',1,10.00,'Ready to Serve',1,0),(76,'Minute Maid (1 litre)',1,20.00,'Ready to Serve',1,0),(77,'Dasani Water (500 ml)',1,10.00,'Ready to Serve',1,0),(78,'Dasani Water (1 litre)',1,20.00,'Ready to Serve',1,0),(79,'Chai',3,12.00,'Prepared',1,10),(80,'Masala / Aadrak Chai',3,15.00,'Prepared',1,10),(81,'Cold Coffee',3,50.00,'Prepared',1,10),(128,'Masala Dosa',2,40.00,'Prepared',1,10),(129,'Rajma Chawal',2,40.00,'Prepared',1,10),(130,'Chole Chawal',2,40.00,'Prepared',1,10),(131,'Pav Bhaji',2,40.00,'Prepared',1,10),(132,'Fried Rice',2,40.00,'Prepared',1,10),(133,'Fried Rice + Manchurian',2,60.00,'Prepared',1,10),(134,'Vada Pav',2,30.00,'Prepared',1,6),(135,'Fries',2,40.00,'Prepared',1,6),(136,'Peri Peri Fries',2,60.00,'Prepared',1,4),(137,'Cheese Fries',2,60.00,'Prepared',1,10),(138,'Chilli Potato',2,40.00,'Prepared',1,10),(139,'Honey Chilli Potato',2,45.00,'Prepared',1,10),(140,'Masala Idli',2,40.00,'Prepared',1,10),(141,'Burger',2,45.00,'Prepared',1,0),(142,'Grill Sandwich',2,30.00,'Prepared',1,0),(143,'Cheese Grill Sandwich',2,45.00,'Prepared',1,10),(144,'Aloo Patty',2,12.00,'Prepared',1,5),(145,'Paneer Patty',2,15.00,'Prepared',1,10),(146,'Veg Chowmein',2,30.00,'Prepared',1,10),(147,'White Sauce Pasta',2,50.00,'Prepared',1,10),(148,'Mixed Sauce Pasta',2,50.00,'Prepared',1,10),(149,'Red Sauce Pasta',2,45.00,'Prepared',1,10),(150,'Big Aloo Patty',2,15.00,'Prepared',1,6),(151,'Big Paneer Patty',2,25.00,'Prepared',1,10),(152,'Masala Maggi',2,30.00,'Prepared',1,10),(153,'Vegetable Maggi',2,35.00,'Prepared',1,5),(154,'Cheese Maggi',2,40.00,'Prepared',1,5),(155,'Onion Tomato Maggi',2,35.00,'Prepared',1,5),(156,'Cheese Burger',2,75.00,'Prepared',1,10),(157,'Club Cheese Burger',2,75.00,'Prepared',1,10),(158,'Red Sauce Pasta with Cheese',2,60.00,'Prepared',1,10),(159,'White Sauce Pasta with Cheese',2,65.00,'Prepared',1,10),(160,'Mixed Sauce Pasta with Cheese',2,65.00,'Prepared',1,6),(161,'Chilli Paneer',2,60.00,'Prepared',1,10),(162,'Chole Kulche',2,40.00,'Prepared',1,10),(163,'Chole Bhature',2,40.00,'Prepared',1,5),(164,'Plain Dosa',2,35.00,'Prepared',1,5),(165,'Veg Masala Dosa',2,50.00,'Prepared',1,4),(166,'Maharaja Masala Dosa',2,60.00,'Prepared',1,6),(167,'Paneer Dosa',2,60.00,'Prepared',1,5),(168,'Uttapam',2,70.00,'Prepared',1,5),(169,'Pizza Uttapam',2,120.00,'Prepared',1,10),(170,'Idli Sambhar',2,30.00,'Prepared',1,0),(171,'Veg Kathi Roll',2,50.00,'Prepared',1,10),(172,'Aloo Tikki Kathi Roll',2,60.00,'Prepared',1,10),(173,'Paneer Kathi Roll',2,70.00,'Prepared',1,10),(174,'Peri Peri Cheese Kathi Roll',2,80.00,'Prepared',1,7),(175,'Chilli Paneer Kathi Roll',2,80.00,'Prepared',1,10),(176,'Soya Kathi Roll',2,70.00,'Prepared',1,6),(177,'Chilli Chowmein Kathi Roll',2,70.00,'Prepared',1,10),(178,'Lachha Paratha',2,50.00,'Prepared',1,6),(179,'Malabar Paratha',2,25.00,'Prepared',1,6),(180,'Aloo Paratha',2,25.00,'Prepared',1,10),(181,'Gobi Paratha',2,30.00,'Prepared',1,10),(182,'Aloo Pyaz Paratha',2,30.00,'Prepared',1,0),(183,'Mix Veg Paratha',2,40.00,'Prepared',1,5),(184,'Paneer Paratha',2,40.00,'Prepared',1,7),(185,'Mix Cheese Paratha',2,55.00,'Prepared',1,10),(186,'Pizza Pocket',2,20.00,'Prepared',1,10),(187,'Pizza Puff',2,20.00,'Prepared',1,10),(188,'Garlic Bread',2,40.00,'Prepared',1,10),(189,'Aloo Tikki Sub',2,80.00,'Prepared',1,10),(190,'Aloo Tikki Sub with Cheese',2,95.00,'Prepared',1,7),(191,'Coke (250 ml)',1,20.00,'Ready to Serve',1,0),(192,'Coke (750 ml)',1,40.00,'Ready to Serve',1,0),(193,'Thums Up (250 ml)',1,20.00,'Ready to Serve',1,0),(194,'Thums Up (750 ml)',1,40.00,'Ready to Serve',1,0),(195,'Sprite (250 ml)',1,20.00,'Ready to Serve',1,0),(196,'Sprite (750 ml)',1,40.00,'Ready to Serve',1,0),(197,'Limca (250 ml)',1,20.00,'Ready to Serve',1,0),(198,'Limca (750 ml)',1,40.00,'Ready to Serve',1,0),(199,'Fanta (250 ml)',1,20.00,'Ready to Serve',1,0),(200,'Fanta (750 ml)',1,40.00,'Ready to Serve',1,0),(201,'Maaza (200 ml)',1,20.00,'Ready to Serve',1,0),(202,'Minute Maid (500 ml)',1,10.00,'Ready to Serve',1,0),(203,'Minute Maid (1 litre)',1,20.00,'Ready to Serve',1,0),(204,'Dasani Water (500 ml)',1,10.00,'Ready to Serve',1,0),(205,'Dasani Water (1 litre)',1,20.00,'Ready to Serve',1,0),(206,'Chai',3,12.00,'Prepared',1,4),(207,'Masala / Aadrak Chai',3,15.00,'Prepared',1,3),(208,'Cold Coffee',3,50.00,'Prepared',1,3);
/*!40000 ALTER TABLE `Menu_Items` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-26 23:08:23
