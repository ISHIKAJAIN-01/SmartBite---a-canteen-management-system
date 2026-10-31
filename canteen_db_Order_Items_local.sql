SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `Order_Items`;
CREATE TABLE `Order_Items` (
  `order_item_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `item_id` int NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`order_item_id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `Orders` (`order_id`),
  CONSTRAINT `chk_oi_quantity_pos` CHECK ((`quantity` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `Order_Items` VALUES
(1,1,1,2,40.00,80.00),
(2,2,2,1,40.00,40.00),
(3,2,3,1,40.00,40.00),
(4,3,4,1,40.00,40.00),
(5,3,6,1,60.00,60.00),
(6,4,64,1,20.00,20.00),
(7,5,5,2,40.00,80.00),
(8,5,6,1,60.00,60.00),
(9,6,64,1,20.00,20.00),
(10,6,1,1,40.00,40.00),
(11,7,5,3,40.00,120.00);

SET FOREIGN_KEY_CHECKS=1;