-- =====================================================================
-- TEMPORARY TESTING ONLY - NOT THE FINAL TEAM SCHEMA
-- =====================================================================
-- Creates a throwaway menu table so POST /api/orders can be tested before
-- the real menu table exists. Do NOT commit this file as the team's final
-- schema, and do NOT treat tmp_menu_test as the real menu.
--
-- Safe to run more than once: the table is only created if missing, and the
-- sample rows are updated in place instead of duplicated.
-- It does not touch Orders, Order_Items or Payments.
-- Needs MySQL 8.0.19 or newer (uses the row-alias form of ON DUPLICATE KEY UPDATE).
-- =====================================================================

USE canteen_db;

CREATE TABLE IF NOT EXISTS tmp_menu_test (
  item_id INT NOT NULL AUTO_INCREMENT,
  name    VARCHAR(100) NOT NULL,
  price   DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (item_id)
) ENGINE=InnoDB;

INSERT INTO tmp_menu_test (item_id, name, price) VALUES
  (1, 'Veg Sandwich', 50.00),
  (2, 'Masala Dosa',  75.50),
  (3, 'Cold Coffee',  10.10)
AS new_row
ON DUPLICATE KEY UPDATE
  name  = new_row.name,
  price = new_row.price;
