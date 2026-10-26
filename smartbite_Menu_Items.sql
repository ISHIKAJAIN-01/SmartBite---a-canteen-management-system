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
INSERT INTO `Menu_Items` VALUES (1,'Masala Dosa',2,40.00,'Prepared',1,0),(2,'Rajma Chawal',2,40.00,'Prepared',1,0),(3,'Chole Chawal',2,40.00,'Prepared',1,0),(4,'Pav Bhaji',2,40.00,'Prepared',1,0),(5,'Fried Rice',2,40.00,'Prepared',1,0),(6,'Fried Rice + Manchurian',2,60.00,'Prepared',1,0),(7,'Vada Pav',2,30.00,'Prepared',1,0),(8,'Fries',2,40.00,'Prepared',1,0),(9,'Peri Peri Fries',2,60.00,'Prepared',1,0),(10,'Cheese Fries',2,60.00,'Prepared',1,0),(11,'Chilli Potato',2,40.00,'Prepared',1,0),(12,'Honey Chilli Potato',2,45.00,'Prepared',1,0),(13,'Masala Idli',2,40.00,'Prepared',1,0),(14,'Burger',2,45.00,'Prepared',1,0),(15,'Grill Sandwich',2,30.00,'Prepared',1,0),(16,'Cheese Grill Sandwich',2,45.00,'Prepared',1,0),(17,'Aloo Patty',2,12.00,'Prepared',1,0),(18,'Paneer Patty',2,15.00,'Prepared',1,0),(19,'Veg Chowmein',2,30.00,'Prepared',1,0),(20,'White Sauce Pasta',2,50.00,'Prepared',1,0),(21,'Mixed Sauce Pasta',2,50.00,'Prepared',1,0),(22,'Red Sauce Pasta',2,45.00,'Prepared',1,0),(23,'Big Aloo Patty',2,15.00,'Prepared',1,0),(24,'Big Paneer Patty',2,25.00,'Prepared',1,0),(25,'Masala Maggi',2,30.00,'Prepared',1,0),(26,'Vegetable Maggi',2,35.00,'Prepared',1,0),(27,'Cheese Maggi',2,40.00,'Prepared',1,0),(28,'Onion Tomato Maggi',2,35.00,'Prepared',1,0),(29,'Cheese Burger',2,75.00,'Prepared',1,0),(30,'Club Cheese Burger',2,75.00,'Prepared',1,0),(31,'Red Sauce Pasta with Cheese',2,60.00,'Prepared',1,0),(32,'White Sauce Pasta with Cheese',2,65.00,'Prepared',1,0),(33,'Mixed Sauce Pasta with Cheese',2,65.00,'Prepared',1,0),(34,'Chilli Paneer',2,60.00,'Prepared',1,0),(35,'Chole Kulche',2,40.00,'Prepared',1,0),(36,'Chole Bhature',2,40.00,'Prepared',1,0),(37,'Plain Dosa',2,35.00,'Prepared',1,0),(38,'Veg Masala Dosa',2,50.00,'Prepared',1,0),(39,'Maharaja Masala Dosa',2,60.00,'Prepared',1,0),(40,'Paneer Dosa',2,60.00,'Prepared',1,0),(41,'Uttapam',2,70.00,'Prepared',1,0),(42,'Pizza Uttapam',2,120.00,'Prepared',1,0),(43,'Idli Sambhar',2,30.00,'Prepared',1,0),(44,'Veg Kathi Roll',2,50.00,'Prepared',1,0),(45,'Aloo Tikki Kathi Roll',2,60.00,'Prepared',1,0),(46,'Paneer Kathi Roll',2,70.00,'Prepared',1,0),(47,'Peri Peri Cheese Kathi Roll',2,80.00,'Prepared',1,0),(48,'Chilli Paneer Kathi Roll',2,80.00,'Prepared',1,0),(49,'Soya Kathi Roll',2,70.00,'Prepared',1,0),(50,'Chilli Chowmein Kathi Roll',2,70.00,'Prepared',1,0),(51,'Lachha Paratha',2,50.00,'Prepared',1,0),(52,'Malabar Paratha',2,25.00,'Prepared',1,0),(53,'Aloo Paratha',2,25.00,'Prepared',1,0),(54,'Gobi Paratha',2,30.00,'Prepared',1,0),(55,'Aloo Pyaz Paratha',2,30.00,'Prepared',1,0),(56,'Mix Veg Paratha',2,40.00,'Prepared',1,0),(57,'Paneer Paratha',2,40.00,'Prepared',1,0),(58,'Mix Cheese Paratha',2,55.00,'Prepared',1,0),(59,'Pizza Pocket',2,20.00,'Prepared',1,0),(60,'Pizza Puff',2,20.00,'Prepared',1,0),(61,'Garlic Bread',2,40.00,'Prepared',1,0),(62,'Aloo Tikki Sub',2,80.00,'Prepared',1,0),(63,'Aloo Tikki Sub with Cheese',2,95.00,'Prepared',1,0),(64,'Coke (250 ml)',1,20.00,'Ready to Serve',1,0),(65,'Coke (750 ml)',1,40.00,'Ready to Serve',1,0),(66,'Thums Up (250 ml)',1,20.00,'Ready to Serve',1,0),(67,'Thums Up (750 ml)',1,40.00,'Ready to Serve',1,0),(68,'Sprite (250 ml)',1,20.00,'Ready to Serve',1,0),(69,'Sprite (750 ml)',1,40.00,'Ready to Serve',1,0),(70,'Limca (250 ml)',1,20.00,'Ready to Serve',1,0),(71,'Limca (750 ml)',1,40.00,'Ready to Serve',1,0),(72,'Fanta (250 ml)',1,20.00,'Ready to Serve',1,0),(73,'Fanta (750 ml)',1,40.00,'Ready to Serve',1,0),(74,'Maaza (200 ml)',1,20.00,'Ready to Serve',1,0),(75,'Minute Maid (500 ml)',1,10.00,'Ready to Serve',1,0),(76,'Minute Maid (1 litre)',1,20.00,'Ready to Serve',1,0),(77,'Dasani Water (500 ml)',1,10.00,'Ready to Serve',1,0),(78,'Dasani Water (1 litre)',1,20.00,'Ready to Serve',1,0),(79,'Chai',3,12.00,'Prepared',1,0),(80,'Masala / Aadrak Chai',3,15.00,'Prepared',1,0),(81,'Cold Coffee',3,50.00,'Prepared',1,0),(128,'Masala Dosa',2,40.00,'Prepared',1,0),(129,'Rajma Chawal',2,40.00,'Prepared',1,0),(130,'Chole Chawal',2,40.00,'Prepared',1,0),(131,'Pav Bhaji',2,40.00,'Prepared',1,0),(132,'Fried Rice',2,40.00,'Prepared',1,0),(133,'Fried Rice + Manchurian',2,60.00,'Prepared',1,0),(134,'Vada Pav',2,30.00,'Prepared',1,0),(135,'Fries',2,40.00,'Prepared',1,0),(136,'Peri Peri Fries',2,60.00,'Prepared',1,0),(137,'Cheese Fries',2,60.00,'Prepared',1,0),(138,'Chilli Potato',2,40.00,'Prepared',1,0),(139,'Honey Chilli Potato',2,45.00,'Prepared',1,0),(140,'Masala Idli',2,40.00,'Prepared',1,0),(141,'Burger',2,45.00,'Prepared',1,0),(142,'Grill Sandwich',2,30.00,'Prepared',1,0),(143,'Cheese Grill Sandwich',2,45.00,'Prepared',1,0),(144,'Aloo Patty',2,12.00,'Prepared',1,0),(145,'Paneer Patty',2,15.00,'Prepared',1,0),(146,'Veg Chowmein',2,30.00,'Prepared',1,0),(147,'White Sauce Pasta',2,50.00,'Prepared',1,0),(148,'Mixed Sauce Pasta',2,50.00,'Prepared',1,0),(149,'Red Sauce Pasta',2,45.00,'Prepared',1,0),(150,'Big Aloo Patty',2,15.00,'Prepared',1,0),(151,'Big Paneer Patty',2,25.00,'Prepared',1,0),(152,'Masala Maggi',2,30.00,'Prepared',1,0),(153,'Vegetable Maggi',2,35.00,'Prepared',1,0),(154,'Cheese Maggi',2,40.00,'Prepared',1,0),(155,'Onion Tomato Maggi',2,35.00,'Prepared',1,0),(156,'Cheese Burger',2,75.00,'Prepared',1,0),(157,'Club Cheese Burger',2,75.00,'Prepared',1,0),(158,'Red Sauce Pasta with Cheese',2,60.00,'Prepared',1,0),(159,'White Sauce Pasta with Cheese',2,65.00,'Prepared',1,0),(160,'Mixed Sauce Pasta with Cheese',2,65.00,'Prepared',1,0),(161,'Chilli Paneer',2,60.00,'Prepared',1,0),(162,'Chole Kulche',2,40.00,'Prepared',1,0),(163,'Chole Bhature',2,40.00,'Prepared',1,0),(164,'Plain Dosa',2,35.00,'Prepared',1,0),(165,'Veg Masala Dosa',2,50.00,'Prepared',1,0),(166,'Maharaja Masala Dosa',2,60.00,'Prepared',1,0),(167,'Paneer Dosa',2,60.00,'Prepared',1,0),(168,'Uttapam',2,70.00,'Prepared',1,0),(169,'Pizza Uttapam',2,120.00,'Prepared',1,0),(170,'Idli Sambhar',2,30.00,'Prepared',1,0),(171,'Veg Kathi Roll',2,50.00,'Prepared',1,0),(172,'Aloo Tikki Kathi Roll',2,60.00,'Prepared',1,0),(173,'Paneer Kathi Roll',2,70.00,'Prepared',1,0),(174,'Peri Peri Cheese Kathi Roll',2,80.00,'Prepared',1,0),(175,'Chilli Paneer Kathi Roll',2,80.00,'Prepared',1,0),(176,'Soya Kathi Roll',2,70.00,'Prepared',1,0),(177,'Chilli Chowmein Kathi Roll',2,70.00,'Prepared',1,0),(178,'Lachha Paratha',2,50.00,'Prepared',1,0),(179,'Malabar Paratha',2,25.00,'Prepared',1,0),(180,'Aloo Paratha',2,25.00,'Prepared',1,0),(181,'Gobi Paratha',2,30.00,'Prepared',1,0),(182,'Aloo Pyaz Paratha',2,30.00,'Prepared',1,0),(183,'Mix Veg Paratha',2,40.00,'Prepared',1,0),(184,'Paneer Paratha',2,40.00,'Prepared',1,0),(185,'Mix Cheese Paratha',2,55.00,'Prepared',1,0),(186,'Pizza Pocket',2,20.00,'Prepared',1,0),(187,'Pizza Puff',2,20.00,'Prepared',1,0),(188,'Garlic Bread',2,40.00,'Prepared',1,0),(189,'Aloo Tikki Sub',2,80.00,'Prepared',1,0),(190,'Aloo Tikki Sub with Cheese',2,95.00,'Prepared',1,0),(191,'Coke (250 ml)',1,20.00,'Ready to Serve',1,0),(192,'Coke (750 ml)',1,40.00,'Ready to Serve',1,0),(193,'Thums Up (250 ml)',1,20.00,'Ready to Serve',1,0),(194,'Thums Up (750 ml)',1,40.00,'Ready to Serve',1,0),(195,'Sprite (250 ml)',1,20.00,'Ready to Serve',1,0),(196,'Sprite (750 ml)',1,40.00,'Ready to Serve',1,0),(197,'Limca (250 ml)',1,20.00,'Ready to Serve',1,0),(198,'Limca (750 ml)',1,40.00,'Ready to Serve',1,0),(199,'Fanta (250 ml)',1,20.00,'Ready to Serve',1,0),(200,'Fanta (750 ml)',1,40.00,'Ready to Serve',1,0),(201,'Maaza (200 ml)',1,20.00,'Ready to Serve',1,0),(202,'Minute Maid (500 ml)',1,10.00,'Ready to Serve',1,0),(203,'Minute Maid (1 litre)',1,20.00,'Ready to Serve',1,0),(204,'Dasani Water (500 ml)',1,10.00,'Ready to Serve',1,0),(205,'Dasani Water (1 litre)',1,20.00,'Ready to Serve',1,0),(206,'Chai',3,12.00,'Prepared',1,0),(207,'Masala / Aadrak Chai',3,15.00,'Prepared',1,0),(208,'Cold Coffee',3,50.00,'Prepared',1,0);
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
