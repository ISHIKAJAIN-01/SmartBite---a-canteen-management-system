SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `Orders`;
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `Orders` VALUES
(1,1,DATE_SUB(NOW(), INTERVAL 14 MINUTE),'Pending',80.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'meals_drinks'),
(2,1,DATE_SUB(NOW(), INTERVAL 12 MINUTE),'Pending',80.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'meals_drinks'),
(3,1,DATE_SUB(NOW(), INTERVAL 10 MINUTE),'Preparing',100.00,NULL,NULL,11,DATE_ADD(NOW(), INTERVAL 1 MINUTE),NULL,NULL,NULL,'meals_drinks'),
(4,1,DATE_SUB(NOW(), INTERVAL 8 MINUTE),'Pending',20.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'snacks_desserts'),
(5,1,DATE_SUB(NOW(), INTERVAL 6 MINUTE),'Pending',140.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'meals_drinks'),
(6,1,DATE_SUB(NOW(), INTERVAL 4 MINUTE),'Pending',60.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'meals_drinks'),
(7,1,DATE_SUB(NOW(), INTERVAL 2 MINUTE),'Pending',120.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'meals_drinks');

SET FOREIGN_KEY_CHECKS=1;