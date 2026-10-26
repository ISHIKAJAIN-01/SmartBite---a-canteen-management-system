-- =============================================================================
-- SMARTBITE - College Canteen Food-Ordering Web Application
-- [DEVELOPMENT-ONLY FIXTURE FOR MEMBER 3]
-- Modules: Order Tracking, Queue Status, Pickup Details & Pickup Instructions
-- Target Engine: MySQL 8.0.16 or later
-- 
-- IMPORTANT INTEGRATION NOTE:
-- Database integration with the team's shared 15-table SQL schema is explicitly
-- deferred to the multi-member team integration phase.
-- This script contains isolated local development fixtures and seed data so that
-- Member 3 features can be run, validated, and demonstrated independently.
-- DO NOT overwrite or replace shared team database migrations with this file.
-- =============================================================================

CREATE DATABASE IF NOT EXISTS smartbite_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE smartbite_db;

-- 1. USERS TABLE
-- Tracks students, canteen staff, and administrators
CREATE TABLE IF NOT EXISTS Users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student', 'staff', 'admin') NOT NULL DEFAULT 'student',
  phone_number VARCHAR(20) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. MENU ITEMS TABLE
-- Stores available canteen food and beverages with preparation times
CREATE TABLE IF NOT EXISTS Menu_Items (
  item_id INT AUTO_INCREMENT PRIMARY KEY,
  item_name VARCHAR(120) NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'Main Course',
  food_type ENUM('Veg', 'Non-Veg', 'Beverage', 'Snack') NOT NULL DEFAULT 'Veg',
  price DECIMAL(10,2) NOT NULL,
  prep_time_minutes INT NOT NULL DEFAULT 10,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. ORDERS TABLE
-- Stores order status, pickup code, timestamps, and estimated times
CREATE TABLE IF NOT EXISTS Orders (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  order_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status ENUM('Placed', 'Preparing', 'Ready', 'Collected', 'Cancelled') NOT NULL DEFAULT 'Placed',
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  pickup_code VARCHAR(20) NOT NULL,
  special_instructions TEXT NULL,
  estimated_prep_minutes INT NULL,
  estimated_ready_at DATETIME NULL,
  actual_ready_at DATETIME NULL,
  cancelled_at DATETIME NULL,
  cancellation_reason VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id)
    REFERENCES Users(user_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  INDEX idx_orders_user_status (user_id, status),
  INDEX idx_orders_status_date (status, order_date)
) ENGINE=InnoDB;

-- 4. ORDER ITEMS TABLE
-- Stores specific items and quantities for each order
CREATE TABLE IF NOT EXISTS Order_Items (
  order_item_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  item_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id)
    REFERENCES Orders(order_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_order_items_item FOREIGN KEY (item_id)
    REFERENCES Menu_Items(item_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  INDEX idx_order_items_order (order_id)
) ENGINE=InnoDB;

-- 5. CANTEEN SETTINGS TABLE
-- Stores key-value configuration such as pickup instructions and operating hours
CREATE TABLE IF NOT EXISTS Canteen_Settings (
  setting_id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(50) NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  description VARCHAR(255) NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =============================================================================
-- SEED DATA
-- Realistic campus dining seed data for demonstration and testing all states
-- =============================================================================

-- Clear existing data if re-running
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE Order_Items;
TRUNCATE TABLE Orders;
TRUNCATE TABLE Menu_Items;
TRUNCATE TABLE Users;
TRUNCATE TABLE Canteen_Settings;
SET FOREIGN_KEY_CHECKS = 1;

-- Users (Students and Canteen Staff)
-- Passwords are safe bcrypt-compatible hashes or placeholder hashes
INSERT INTO Users (user_id, name, email, password_hash, role, phone_number) VALUES
(1, 'Aarav Sharma', 'aarav.sharma@college.edu', '$2b$10$w8L0X6B/L0g5X4PqP1YIauHq4wE4T4g0c2XlG6bW9M6n8P2K1aW2S', 'student', '+91 9876543210'),
(2, 'Ishika Jain', 'ishika.jain@college.edu', '$2b$10$w8L0X6B/L0g5X4PqP1YIauHq4wE4T4g0c2XlG6bW9M6n8P2K1aW2S', 'student', '+91 9876543211'),
(3, 'Rohan Mehta', 'rohan.mehta@college.edu', '$2b$10$w8L0X6B/L0g5X4PqP1YIauHq4wE4T4g0c2XlG6bW9M6n8P2K1aW2S', 'student', '+91 9876543212'),
(4, 'Canteen Counter Staff', 'staff@canteen.college.edu', '$2b$10$w8L0X6B/L0g5X4PqP1YIauHq4wE4T4g0c2XlG6bW9M6n8P2K1aW2S', 'staff', '+91 9876543299');

-- Menu Items with preparation times
INSERT INTO Menu_Items (item_id, item_name, category, food_type, price, prep_time_minutes, is_available) VALUES
(1, 'Masala Dosa', 'Breakfast / South Indian', 'Veg', 70.00, 12, TRUE),
(2, 'Paneer Grilled Sandwich', 'Snacks', 'Veg', 80.00, 10, TRUE),
(3, 'Veg Hakka Noodles', 'Chinese', 'Veg', 90.00, 15, TRUE),
(4, 'Cold Coffee with Ice Cream', 'Beverages', 'Beverage', 55.00, 5, TRUE),
(5, 'Samosa (2 pcs)', 'Snacks', 'Veg', 30.00, 4, TRUE),
(6, 'Masala Chai', 'Beverages', 'Beverage', 15.00, 3, TRUE),
(7, 'Chole Bhature', 'Lunch Specials', 'Veg', 85.00, 14, TRUE),
(8, 'Chicken Tikka Roll', 'Rolls', 'Non-Veg', 110.00, 12, TRUE);

-- Canteen Settings
INSERT INTO Canteen_Settings (setting_key, setting_value, description) VALUES
('pickup_instructions', 'Please proceed to Counter 2 (Express Food Delivery) on the ground floor. Present your 4-digit pickup code to the staff member to collect your order.', 'Instructions shown to students when order is ready'),
('canteen_name', 'SmartBite Central Canteen', 'Official canteen title'),
('opening_hours', '8:00 AM – 7:30 PM (Monday to Saturday)', 'Operating hours'),
('contact_phone', '+91 98765 43210', 'Helpdesk phone'),
('help_email', 'support@smartbite.college.edu', 'Helpdesk email');

-- Orders for Aarav Sharma (user_id = 1)
-- 101: Preparing state (active, in queue)
-- 102: Ready state (ready for pickup with code visible)
-- 103: Placed state (initial state)
-- 104: Collected state (historical)
-- 105: Cancelled state (with reason)
-- Orders for other users (for queue calculations and privacy testing):
-- 201: Ishika Jain (user_id = 2) - Preparing (ahead of or behind)

INSERT INTO Orders (
  order_id, user_id, order_date, status, total_amount, pickup_code,
  special_instructions, estimated_prep_minutes, estimated_ready_at,
  actual_ready_at, cancelled_at, cancellation_reason
) VALUES
-- Order 101: Preparing for Aarav (User 1)
(101, 1, DATE_SUB(NOW(), INTERVAL 8 MINUTE), 'Preparing', 160.00, 'SB-4819',
 'Less spicy green chutney please', 15, DATE_ADD(NOW(), INTERVAL 7 MINUTE),
 NULL, NULL, NULL),

-- Order 102: Ready for Aarav (User 1)
(102, 1, DATE_SUB(NOW(), INTERVAL 25 MINUTE), 'Ready', 135.00, 'SB-2904',
 'Extra napkins please', 12, DATE_SUB(NOW(), INTERVAL 5 MINUTE),
 DATE_SUB(NOW(), INTERVAL 5 MINUTE), NULL, NULL),

-- Order 103: Placed for Aarav (User 1)
(103, 1, DATE_SUB(NOW(), INTERVAL 2 MINUTE), 'Placed', 70.00, 'SB-7132',
 NULL, 12, DATE_ADD(NOW(), INTERVAL 14 MINUTE),
 NULL, NULL, NULL),

-- Order 104: Collected for Aarav (User 1)
(104, 1, DATE_SUB(NOW(), INTERVAL 2 HOUR), 'Collected', 110.00, 'SB-1092',
 NULL, 10, DATE_SUB(NOW(), INTERVAL 105 MINUTE),
 DATE_SUB(NOW(), INTERVAL 100 MINUTE), NULL, NULL),

-- Order 105: Cancelled for Aarav (User 1)
(105, 1, DATE_SUB(NOW(), INTERVAL 1 DAY), 'Cancelled', 90.00, 'SB-8821',
 NULL, NULL, NULL,
 NULL, DATE_SUB(NOW(), INTERVAL 23 HOUR), 'Out of ingredients: Fresh paneer unavailable'),

-- Order 201: Ishika Jain (User 2) - In progress (ahead of order 101 in queue)
(201, 2, DATE_SUB(NOW(), INTERVAL 12 MINUTE), 'Preparing', 145.00, 'SB-5531',
 NULL, 15, DATE_ADD(NOW(), INTERVAL 3 MINUTE),
 NULL, NULL, NULL);

-- Order Items
-- For Order 101 (2x Paneer Grilled Sandwich)
INSERT INTO Order_Items (order_item_id, order_id, item_id, quantity, unit_price, subtotal) VALUES
(1, 101, 2, 2, 80.00, 160.00);

-- For Order 102 (1x Masala Dosa, 1x Cold Coffee)
INSERT INTO Order_Items (order_item_id, order_id, item_id, quantity, unit_price, subtotal) VALUES
(2, 102, 1, 1, 70.00, 70.00),
(3, 102, 4, 1, 55.00, 55.00),
(4, 102, 6, 1, 10.00, 10.00);

-- For Order 103 (1x Masala Dosa)
INSERT INTO Order_Items (order_item_id, order_id, item_id, quantity, unit_price, subtotal) VALUES
(5, 103, 1, 1, 70.00, 70.00);

-- For Order 104 (2x Cold Coffee)
INSERT INTO Order_Items (order_item_id, order_id, item_id, quantity, unit_price, subtotal) VALUES
(6, 104, 4, 2, 55.00, 110.00);

-- For Order 105 (1x Veg Hakka Noodles)
INSERT INTO Order_Items (order_item_id, order_id, item_id, quantity, unit_price, subtotal) VALUES
(7, 105, 3, 1, 90.00, 90.00);

-- For Order 201 (1x Hakka Noodles, 1x Cold Coffee)
INSERT INTO Order_Items (order_item_id, order_id, item_id, quantity, unit_price, subtotal) VALUES
(8, 201, 3, 1, 90.00, 90.00),
(9, 201, 4, 1, 55.00, 55.00);
