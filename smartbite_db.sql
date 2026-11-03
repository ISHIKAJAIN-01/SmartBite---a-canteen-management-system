CREATE DATABASE  IF NOT EXISTS `smartbite_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `smartbite_db`;
-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: smartbite_db
-- ------------------------------------------------------
-- Server version	8.0.46

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

--
-- Table structure for table `canteen_settings`
--

DROP TABLE IF EXISTS `canteen_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `canteen_settings` (
  `setting_id` int NOT NULL AUTO_INCREMENT,
  `setting_name` varchar(100) NOT NULL,
  `setting_value` text,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`setting_id`),
  UNIQUE KEY `unique_setting_name` (`setting_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `canteen_settings`
--

LOCK TABLES `canteen_settings` WRITE;
/*!40000 ALTER TABLE `canteen_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `canteen_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `category_name` (`category_name`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Coffee',NULL,1),(2,'Snacks',NULL,1),(3,'Beverages',NULL,1),(4,'Burgers',NULL,1),(5,'Meals',NULL,1),(6,'Drinks',NULL,1),(7,'Desserts',NULL,1);
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorites`
--

DROP TABLE IF EXISTS `favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorites` (
  `favorite_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `item_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`favorite_id`),
  UNIQUE KEY `unique_user_item_favorite` (`user_id`,`item_id`),
  KEY `fk_favorites_item` (`item_id`),
  CONSTRAINT `fk_favorites_item` FOREIGN KEY (`item_id`) REFERENCES `menu_items` (`item_id`),
  CONSTRAINT `fk_favorites_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorites`
--

LOCK TABLES `favorites` WRITE;
/*!40000 ALTER TABLE `favorites` DISABLE KEYS */;
/*!40000 ALTER TABLE `favorites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ingredients`
--

DROP TABLE IF EXISTS `ingredients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ingredients` (
  `ingredient_id` int NOT NULL AUTO_INCREMENT,
  `ingredient_name` varchar(120) NOT NULL,
  `unit` varchar(20) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ingredient_id`),
  UNIQUE KEY `ingredient_name` (`ingredient_name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ingredients`
--

LOCK TABLES `ingredients` WRITE;
/*!40000 ALTER TABLE `ingredients` DISABLE KEYS */;
INSERT INTO `ingredients` VALUES (1,'Milk','L',NULL),(2,'Burger buns','pcs',NULL),(3,'Tomatoes','kg',NULL),(4,'Coffee beans','kg',NULL);
/*!40000 ALTER TABLE `ingredients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory`
--

DROP TABLE IF EXISTS `inventory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory` (
  `inventory_id` int NOT NULL AUTO_INCREMENT,
  `ingredient_id` int NOT NULL,
  `quantity_on_hand` decimal(10,3) NOT NULL DEFAULT '0.000',
  `reorder_level` decimal(10,3) NOT NULL DEFAULT '0.000',
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`inventory_id`),
  UNIQUE KEY `ingredient_id` (`ingredient_id`),
  CONSTRAINT `fk_inventory_ingredient` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients` (`ingredient_id`),
  CONSTRAINT `chk_reorder_level` CHECK ((`reorder_level` >= 0)),
  CONSTRAINT `chk_stock_quantity` CHECK ((`quantity_on_hand` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory`
--

LOCK TABLES `inventory` WRITE;
/*!40000 ALTER TABLE `inventory` DISABLE KEYS */;
INSERT INTO `inventory` VALUES (1,1,12.000,10.000,'2026-10-26 09:06:11'),(2,2,12.000,20.000,'2026-10-26 08:44:59'),(3,3,2.000,5.000,'2026-10-26 08:44:59'),(4,4,10.000,5.000,'2026-11-02 15:00:33');
/*!40000 ALTER TABLE `inventory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_transactions`
--

DROP TABLE IF EXISTS `inventory_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_transactions` (
  `transaction_id` int NOT NULL AUTO_INCREMENT,
  `ingredient_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `transaction_type` varchar(30) NOT NULL,
  `quantity_change` decimal(10,3) NOT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` int DEFAULT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `transaction_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`transaction_id`),
  KEY `fk_it_ingredient` (`ingredient_id`),
  KEY `fk_it_user` (`user_id`),
  CONSTRAINT `fk_it_ingredient` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients` (`ingredient_id`),
  CONSTRAINT `fk_it_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `chk_transaction_quantity` CHECK ((`quantity_change` <> 0))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_transactions`
--

LOCK TABLES `inventory_transactions` WRITE;
/*!40000 ALTER TABLE `inventory_transactions` DISABLE KEYS */;
INSERT INTO `inventory_transactions` VALUES (1,1,NULL,'STOCK_ADJUSTED',4.000,NULL,NULL,'Stock adjusted through inventory management','2026-10-26 09:06:11'),(2,4,NULL,'STOCK_ADDED',10.000,NULL,NULL,'Initial stock added','2026-11-02 15:00:33');
/*!40000 ALTER TABLE `inventory_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `item_ingredients`
--

DROP TABLE IF EXISTS `item_ingredients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `item_ingredients` (
  `item_id` int NOT NULL,
  `ingredient_id` int NOT NULL,
  `quantity_required` decimal(10,3) NOT NULL,
  PRIMARY KEY (`item_id`,`ingredient_id`),
  KEY `fk_ii_ingredient` (`ingredient_id`),
  CONSTRAINT `fk_ii_ingredient` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients` (`ingredient_id`),
  CONSTRAINT `fk_ii_menu` FOREIGN KEY (`item_id`) REFERENCES `menu_items` (`item_id`),
  CONSTRAINT `chk_required_quantity` CHECK ((`quantity_required` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item_ingredients`
--

LOCK TABLES `item_ingredients` WRITE;
/*!40000 ALTER TABLE `item_ingredients` DISABLE KEYS */;
/*!40000 ALTER TABLE `item_ingredients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menu_items`
--

DROP TABLE IF EXISTS `menu_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu_items` (
  `item_id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL,
  `item_name` varchar(120) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `food_type` varchar(50) DEFAULT NULL,
  `prep_time_minutes` int DEFAULT NULL,
  `is_vegetarian` tinyint(1) NOT NULL DEFAULT '0',
  `is_available` tinyint(1) NOT NULL DEFAULT '1',
  `is_customer_menu_item` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`item_id`),
  KEY `fk_menu_category` (`category_id`),
  CONSTRAINT `fk_menu_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`),
  CONSTRAINT `chk_menu_price` CHECK ((`price` >= 0)),
  CONSTRAINT `chk_prep_time` CHECK (((`prep_time_minutes` is null) or (`prep_time_minutes` >= 0)))
) ENGINE=InnoDB AUTO_INCREMENT=134 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu_items`
--

LOCK TABLES `menu_items` WRITE;
/*!40000 ALTER TABLE `menu_items` DISABLE KEYS */;
INSERT INTO `menu_items` VALUES (1,1,'Cappuccino','Freshly brewed cappuccino',120.00,'Vegetarian',NULL,1,1,0),(2,2,'Veg Sandwich','Fresh vegetable sandwich',90.00,'Vegetarian',NULL,1,1,0),(3,5,'Masala Maggi','Available at your college canteen.',30.00,'Vegetarian',NULL,1,0,1),(4,6,'Cold Coffee','Available at your college canteen.',50.00,'Vegetarian',NULL,1,1,1),(5,4,'Test Burger','Temporary API test item',80.00,'Vegetarian',NULL,1,0,0),(7,5,'Masala Dosa','Available at your college canteen.',40.00,'Vegetarian',NULL,1,0,1),(8,5,'Rajma Chawal','Available at your college canteen.',40.00,'Vegetarian',NULL,1,0,1),(9,5,'Chole Chawal','Available at your college canteen.',40.00,'Vegetarian',NULL,1,0,1),(10,5,'Pav Bhaji','Available at your college canteen.',40.00,'Vegetarian',NULL,1,1,1),(11,5,'Fried Rice','Available at your college canteen.',40.00,'Vegetarian',NULL,1,1,1),(12,5,'Fried Rice + Manchurian','Available at your college canteen.',60.00,'Vegetarian',NULL,1,1,1),(13,5,'Vada Pav','Available at your college canteen.',30.00,'Vegetarian',NULL,1,1,1),(14,5,'Fries','Available at your college canteen.',40.00,'Vegetarian',NULL,1,1,1),(15,5,'Peri Peri Fries','Available at your college canteen.',60.00,'Vegetarian',NULL,1,1,1),(16,5,'Cheese Fries','Available at your college canteen.',60.00,'Vegetarian',NULL,1,1,1),(17,5,'Chilli Potato','Available at your college canteen.',40.00,'Vegetarian',NULL,1,1,1),(18,5,'Honey Chilli Potato','Available at your college canteen.',45.00,'Vegetarian',NULL,1,1,1),(19,5,'Masala Idli','Available at your college canteen.',40.00,'Vegetarian',NULL,1,1,1),(20,5,'Burger','Available at your college canteen.',45.00,'Vegetarian',NULL,1,1,1),(21,5,'Grill Sandwich','Available at your college canteen.',30.00,'Vegetarian',NULL,1,1,1),(22,5,'Cheese Grill Sandwich','Available at your college canteen.',45.00,'Vegetarian',NULL,1,1,1),(23,5,'Aloo Patty','Available at your college canteen.',12.00,'Vegetarian',NULL,1,1,1),(24,5,'Paneer Patty','Available at your college canteen.',15.00,'Vegetarian',NULL,1,1,1),(25,5,'Veg Chowmein','Available at your college canteen.',30.00,'Vegetarian',NULL,1,1,1),(26,5,'White Sauce Pasta','Available at your college canteen.',50.00,'Vegetarian',NULL,1,1,1),(27,5,'Mixed Sauce Pasta','Available at your college canteen.',50.00,'Vegetarian',NULL,1,1,1),(28,5,'Red Sauce Pasta','Available at your college canteen.',45.00,'Vegetarian',NULL,1,1,1),(29,5,'Big Aloo Patty','Available at your college canteen.',15.00,'Vegetarian',NULL,1,1,1),(30,5,'Big Paneer Patty','Available at your college canteen.',25.00,'Vegetarian',NULL,1,1,1),(31,5,'Vegetable Maggi','Available at your college canteen.',35.00,'Vegetarian',NULL,1,1,1),(32,5,'Cheese Maggi','Available at your college canteen.',40.00,'Vegetarian',NULL,1,1,1),(33,5,'Onion Tomato Maggi','Available at your college canteen.',35.00,'Vegetarian',NULL,1,1,1),(34,5,'Cheese Burger','Available at your college canteen.',75.00,'Vegetarian',NULL,1,1,1),(35,5,'Club Cheese Burger','Available at your college canteen.',75.00,'Vegetarian',NULL,1,1,1),(36,5,'Red Sauce Pasta with Cheese','Available at your college canteen.',60.00,'Vegetarian',NULL,1,1,1),(37,5,'White Sauce Pasta with Cheese','Available at your college canteen.',65.00,'Vegetarian',NULL,1,1,1),(38,5,'Mixed Sauce Pasta with Cheese','Available at your college canteen.',65.00,'Vegetarian',NULL,1,1,1),(39,5,'Chilli Paneer','Available at your college canteen.',60.00,'Vegetarian',NULL,1,1,1),(40,5,'Chole Kulche','Available at your college canteen.',40.00,'Vegetarian',NULL,1,1,1),(41,5,'Chole Bhature','Available at your college canteen.',40.00,'Vegetarian',NULL,1,1,1),(42,5,'Plain Dosa','Available at your college canteen.',35.00,'Vegetarian',NULL,1,1,1),(43,5,'Veg Masala Dosa','Available at your college canteen.',50.00,'Vegetarian',NULL,1,0,1),(44,5,'Maharaja Masala Dosa','Available at your college canteen.',60.00,'Vegetarian',NULL,1,1,1),(45,5,'Paneer Dosa','Available at your college canteen.',60.00,'Vegetarian',NULL,1,1,1),(46,5,'Uttapam','Available at your college canteen.',70.00,'Vegetarian',NULL,1,1,1),(47,5,'Pizza Uttapam','Available at your college canteen.',120.00,'Vegetarian',NULL,1,1,1),(48,5,'Idli Sambhar','Available at your college canteen.',30.00,'Vegetarian',NULL,1,1,1),(49,5,'Veg Kathi Roll','Available at your college canteen.',50.00,'Vegetarian',NULL,1,1,1),(50,5,'Aloo Tikki Kathi Roll','Available at your college canteen.',60.00,'Vegetarian',NULL,1,1,1),(51,5,'Paneer Kathi Roll','Available at your college canteen.',70.00,'Vegetarian',NULL,1,1,1),(52,5,'Peri Peri Cheese Kathi Roll','Available at your college canteen.',80.00,'Vegetarian',NULL,1,1,1),(53,5,'Chilli Paneer Kathi Roll','Available at your college canteen.',80.00,'Vegetarian',NULL,1,1,1),(54,5,'Soya Kathi Roll','Available at your college canteen.',70.00,'Vegetarian',NULL,1,1,1),(55,5,'Chilli Chowmein Kathi Roll','Available at your college canteen.',70.00,'Vegetarian',NULL,1,1,1),(56,5,'Lachha Paratha','Available at your college canteen.',50.00,'Vegetarian',NULL,1,1,1),(57,5,'Malabar Paratha','Available at your college canteen.',25.00,'Vegetarian',NULL,1,1,1),(58,5,'Aloo Paratha','Available at your college canteen.',25.00,'Vegetarian',NULL,1,1,1),(59,5,'Gobi Paratha','Available at your college canteen.',30.00,'Vegetarian',NULL,1,1,1),(60,5,'Aloo Pyaz Paratha','Available at your college canteen.',30.00,'Vegetarian',NULL,1,1,1),(61,5,'Mix Veg Paratha','Available at your college canteen.',40.00,'Vegetarian',NULL,1,1,1),(62,5,'Paneer Paratha','Available at your college canteen.',40.00,'Vegetarian',NULL,1,1,1),(63,5,'Mix Cheese Paratha','Available at your college canteen.',55.00,'Vegetarian',NULL,1,1,1),(64,5,'Pizza Pocket','Available at your college canteen.',20.00,'Vegetarian',NULL,1,1,1),(65,5,'Pizza Puff','Available at your college canteen.',20.00,'Vegetarian',NULL,1,1,1),(66,5,'Garlic Bread','Available at your college canteen.',40.00,'Vegetarian',NULL,1,1,1),(67,5,'Aloo Tikki Sub','Available at your college canteen.',80.00,'Vegetarian',NULL,1,1,1),(68,5,'Aloo Tikki Sub with Cheese','Available at your college canteen.',95.00,'Vegetarian',NULL,1,1,1),(69,2,'Coke (250 ml)','Available at your college canteen.',20.00,'Vegetarian',NULL,1,1,1),(70,2,'Coke (750 ml)','Available at your college canteen.',40.00,'Vegetarian',NULL,1,1,1),(71,2,'Thums Up (250 ml)','Available at your college canteen.',20.00,'Vegetarian',NULL,1,1,1),(72,2,'Thums Up (750 ml)','Available at your college canteen.',40.00,'Vegetarian',NULL,1,1,1),(73,2,'Sprite (250 ml)','Available at your college canteen.',20.00,'Vegetarian',NULL,1,1,1),(74,2,'Sprite (750 ml)','Available at your college canteen.',40.00,'Vegetarian',NULL,1,1,1),(75,2,'Limca (250 ml)','Available at your college canteen.',20.00,'Vegetarian',NULL,1,1,1),(76,2,'Limca (750 ml)','Available at your college canteen.',40.00,'Vegetarian',NULL,1,1,1),(77,2,'Fanta (250 ml)','Available at your college canteen.',20.00,'Vegetarian',NULL,1,1,1),(78,2,'Fanta (750 ml)','Available at your college canteen.',40.00,'Vegetarian',NULL,1,1,1),(79,2,'Maaza (200 ml)','Available at your college canteen.',20.00,'Vegetarian',NULL,1,1,1),(80,2,'Minute Maid (500 ml)','Available at your college canteen.',10.00,'Vegetarian',NULL,1,1,1),(81,2,'Minute Maid (1 litre)','Available at your college canteen.',20.00,'Vegetarian',NULL,1,1,1),(82,2,'Dasani Water (500 ml)','Available at your college canteen.',10.00,'Vegetarian',NULL,1,1,1),(83,2,'Dasani Water (1 litre)','Available at your college canteen.',20.00,'Vegetarian',NULL,1,1,1),(84,6,'Chai','Available at your college canteen.',12.00,'Vegetarian',NULL,1,1,1),(85,6,'Masala / Aadrak Chai','Available at your college canteen.',15.00,'Vegetarian',NULL,1,0,1);
-- Desserts
INSERT INTO `menu_items`
(`category_id`, `item_name`, `description`, `price`, `food_type`,
 `prep_time_minutes`, `is_vegetarian`, `is_available`, `is_customer_menu_item`)
VALUES
(7, 'Chocolate Brownie', 'Available at your college canteen.', 60.00, 'Vegetarian', NULL, 1, 1, 1),
(7, 'Chocolate Pastry', 'Available at your college canteen.', 50.00, 'Vegetarian', NULL, 1, 1, 1),
(7, 'Black Forest Pastry', 'Available at your college canteen.', 60.00, 'Vegetarian', NULL, 1, 1, 1),
(7, 'Red Velvet Pastry', 'Available at your college canteen.', 70.00, 'Vegetarian', NULL, 1, 1, 1),
(7, 'Pineapple Pastry', 'Available at your college canteen.', 50.00, 'Vegetarian', NULL, 1, 1, 1),
(7, 'Butterscotch Pastry', 'Available at your college canteen.', 60.00, 'Vegetarian', NULL, 1, 1, 1),
(7, 'Chocolate Donut', 'Available at your college canteen.', 50.00, 'Vegetarian', NULL, 1, 1, 1),
(7, 'Glazed Donut', 'Available at your college canteen.', 40.00, 'Vegetarian', NULL, 1, 1, 1),
(7, 'Strawberry Donut', 'Available at your college canteen.', 50.00, 'Vegetarian', NULL, 1, 1, 1),
(7, 'Oreo Donut', 'Available at your college canteen.', 60.00, 'Vegetarian', NULL, 1, 1, 1);
/*!40000 ALTER TABLE `menu_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menu_items_backup_before_sync`
--

DROP TABLE IF EXISTS `menu_items_backup_before_sync`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu_items_backup_before_sync` (
  `item_id` int NOT NULL DEFAULT '0',
  `category_id` int NOT NULL,
  `item_name` varchar(120) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `food_type` varchar(50) DEFAULT NULL,
  `prep_time_minutes` int DEFAULT NULL,
  `is_vegetarian` tinyint(1) NOT NULL DEFAULT '0',
  `is_available` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu_items_backup_before_sync`
--

LOCK TABLES `menu_items_backup_before_sync` WRITE;
/*!40000 ALTER TABLE `menu_items_backup_before_sync` DISABLE KEYS */;
INSERT INTO `menu_items_backup_before_sync` VALUES (1,1,'Cappuccino','Freshly brewed cappuccino',120.00,'Vegetarian',NULL,1,1),(2,2,'Veg Sandwich','Fresh vegetable sandwich',90.00,'Vegetarian',NULL,1,1),(3,2,'Masala Maggi','Spicy masala Maggi',40.00,'Vegetarian',NULL,1,0),(4,3,'Cold Coffee','Chilled creamy coffee',110.00,'Vegetarian',NULL,1,1),(5,4,'Test Burger','Temporary API test item',80.00,'Vegetarian',NULL,1,0);
/*!40000 ALTER TABLE `menu_items_backup_before_sync` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `order_code` varchar(20) NOT NULL,
  `student_name` varchar(120) NOT NULL,
  `items_summary` varchar(500) NOT NULL,
  `total` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` varchar(30) NOT NULL DEFAULT 'Placed',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_id`),
  UNIQUE KEY `order_code` (`order_code`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,'SB-1048','Aarav Sharma','Veg burger × 1, Cold coffee × 1',180.00,'Preparing','2026-10-26 09:20:06'),(2,'SB-1047','Meera Kapoor','Paneer wrap × 1',90.00,'Ready','2026-10-26 09:20:06'),(3,'SB-1046','Rohan Verma','Masala dosa × 1, Tea × 2',245.00,'Preparing','2026-10-26 09:20:06'),(4,'SB-1045','Ananya Singh','Pasta × 1, Lemonade × 1',150.00,'Collected','2026-10-26 09:20:06'),(5,'SB-1044','Kabir Malhotra','Cheese sandwich × 2',160.00,'Collected','2026-10-26 09:20:06'),(6,'SB-1043','Diya Joshi','Coffee × 1',60.00,'Collected','2026-10-26 09:20:06');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_likes`
--

DROP TABLE IF EXISTS `product_likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_likes` (
  `like_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `item_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`like_id`),
  UNIQUE KEY `unique_user_item_like` (`user_id`,`item_id`),
  KEY `fk_likes_item` (`item_id`),
  CONSTRAINT `fk_likes_item` FOREIGN KEY (`item_id`) REFERENCES `menu_items` (`item_id`),
  CONSTRAINT `fk_likes_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_likes`
--

LOCK TABLES `product_likes` WRITE;
/*!40000 ALTER TABLE `product_likes` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_likes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `review_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `item_id` int NOT NULL,
  `rating` tinyint NOT NULL,
  `comment` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`review_id`),
  UNIQUE KEY `unique_user_item_review` (`user_id`,`item_id`),
  KEY `fk_reviews_item` (`item_id`),
  CONSTRAINT `fk_reviews_item` FOREIGN KEY (`item_id`) REFERENCES `menu_items` (`item_id`),
  CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `chk_review_rating` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `role_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Student','Customer account'),(2,'Admin','Administrator account'),(3,'Staff','Staff account');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `role_id` int NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_users_role` (`role_id`),
  CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,2,'SmartbiteAdmin','haardika8c@gmail.com',NULL,'$2b$12$dFNOmrO7XmlNNms845vc1.r5cQek07R/MNa1SDYHCeCW2yFFgIkUG','2026-11-02 16:46:39',1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'smartbite_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-03  0:18:53
