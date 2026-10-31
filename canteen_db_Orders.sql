-- MySQL dump 10.13  Distrib 8.0.46, for macos15 (arm64)
--
-- Host: 127.0.0.1    Database: canteen_db
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
-- Table structure for table `Orders`
--

DROP TABLE IF EXISTS `Orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Orders` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `order_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(30) NOT NULL DEFAULT 'Pending',
  `total_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `pickup_code` varchar(20) DEFAULT NULL,
  `special_instructions` text,
  `estimated_prep_minutes` int DEFAULT NULL,
  `estimated_ready_at` datetime DEFAULT NULL,
  `actual_ready_at` datetime DEFAULT NULL,
  `cancelled_at` datetime DEFAULT NULL,
  `cancellation_reason` text,
  `cart_type` varchar(30) NOT NULL,
  PRIMARY KEY (`order_id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Orders`
--

LOCK TABLES `Orders` WRITE;
/*!40000 ALTER TABLE `Orders` DISABLE KEYS */;
INSERT INTO `Orders` VALUES (1,1,'2026-10-25 17:22:55','Pending',250.00,'A101',NULL,NULL,NULL,NULL,NULL,NULL,'meals_drinks'),(2,1,'2026-10-25 22:33:54','Pending',110.10,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'meals_drinks'),(3,1,'2026-10-25 22:42:55','Cancelled',80.00,NULL,NULL,NULL,NULL,NULL,'2026-10-25 22:43:26','Testing snacks and desserts cancellation','snacks_desserts'),(4,1,'2026-10-25 22:46:20','Pending',50.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'meals_drinks'),(5,1,'2026-10-26 15:17:12','Pending',250.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'meals_drinks'),(6,1,'2026-10-26 15:17:27','Pending',50.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'meals_drinks'),(7,1,'2026-10-26 15:23:05','Pending',50.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'meals_drinks'),(8,1,'2026-10-26 15:23:26','Pending',50.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'meals_drinks'),(9,1,'2026-10-26 15:40:05','Cancelled',50.00,NULL,NULL,NULL,NULL,NULL,'2026-10-26 15:41:05','Cancellation test','snacks_desserts'),(10,1,'2026-10-26 15:41:57','Pending',50.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'meals_drinks'),(11,1,'2026-10-26 22:06:15','Pending',200.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'meals_drinks'),(12,1,'2026-10-26 22:06:32','Cancelled',120.00,NULL,NULL,NULL,NULL,NULL,'2026-10-26 22:23:54','Cancelled by customer','snacks_desserts'),(13,1,'2026-10-26 22:09:55','Pending',80.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'meals_drinks'),(14,1,'2026-10-26 22:13:53','Pending',40.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'meals_drinks'),(15,1,'2026-10-26 22:21:44','Pending',80.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'meals_drinks'),(16,1,'2026-10-26 22:22:11','Cancelled',20.00,NULL,NULL,NULL,NULL,NULL,'2026-10-26 22:24:00','Cancelled by customer','snacks_desserts'),(17,1,'2026-10-26 22:24:15','Pending',80.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'meals_drinks'),(18,1,'2026-10-26 22:25:24','Pending',80.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'meals_drinks'),(19,1,'2026-10-26 22:29:11','Cancelled',60.00,NULL,NULL,NULL,NULL,NULL,'2026-10-26 22:30:00','Cancelled by customer','snacks_desserts'),(20,1,'2026-10-26 22:55:40','Pending',160.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'meals_drinks'),(21,1,'2026-10-26 22:57:34','Pending',160.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'meals_drinks');
/*!40000 ALTER TABLE `Orders` ENABLE KEYS */;
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

-- Dump completed on 2026-10-26 23:08:24
