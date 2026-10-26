CREATE DATABASE IF NOT EXISTS smartbite;
USE smartbite;
SELECT DATABASE();

CREATE TABLE Roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(30) NOT NULL UNIQUE
);

INSERT INTO Roles (role_name)
VALUES
    ('Student'),
    ('Admin'),
    ('Staff');

SELECT * FROM Roles;


USE smartbite;

CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_users_roles
        FOREIGN KEY (role_id)
        REFERENCES Roles(role_id)
);

USE smartbite;

CREATE TABLE Categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(80) NOT NULL UNIQUE,
    description VARCHAR(255)
);

CREATE TABLE Menu_Items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(120) NOT NULL,
    category_id INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    item_type ENUM('Prepared', 'Ready to Serve') NOT NULL,
    available BOOLEAN NOT NULL DEFAULT TRUE,
    preparation_time INT NOT NULL DEFAULT 0,

    CONSTRAINT chk_menu_price
        CHECK (price >= 0),

    CONSTRAINT chk_preparation_time
        CHECK (preparation_time >= 0),

    CONSTRAINT fk_menu_categories
        FOREIGN KEY (category_id)
        REFERENCES Categories(category_id)
);

SHOW TABLES;
SELECT * FROM Roles;

INSERT INTO Categories (category_name, description)
VALUES
    ('Snacks', 'Quick bites and light snacks'),
    ('Meals', 'Main meals and filling dishes'),
    ('Beverages', 'Hot and cold drinks'),
    ('Desserts', 'Sweet dishes and treats');

SELECT * FROM Categories;

USE smartbite;

UPDATE Categories
SET category_name = 'Drinks'
WHERE category_name = 'Beverages';

SELECT * FROM Categories;

USE smartbite;

CREATE TEMPORARY TABLE MenuImport (
    item_name VARCHAR(120),
    category_name VARCHAR(80),
    price DECIMAL(10,2),
    item_type VARCHAR(30),
    available BOOLEAN,
    preparation_time INT
);

INSERT INTO MenuImport
(item_name, category_name, price, item_type, available, preparation_time)
VALUES
('Masala Dosa','Meals',40,'Prepared',TRUE,0),
('Rajma Chawal','Meals',40,'Prepared',TRUE,0),
('Chole Chawal','Meals',40,'Prepared',TRUE,0),
('Pav Bhaji','Meals',40,'Prepared',TRUE,0),
('Fried Rice','Meals',40,'Prepared',TRUE,0),
('Fried Rice + Manchurian','Meals',60,'Prepared',TRUE,0),
('Vada Pav','Meals',30,'Prepared',TRUE,0),
('Fries','Meals',40,'Prepared',TRUE,0),
('Peri Peri Fries','Meals',60,'Prepared',TRUE,0),
('Cheese Fries','Meals',60,'Prepared',TRUE,0),
('Chilli Potato','Meals',40,'Prepared',TRUE,0),
('Honey Chilli Potato','Meals',45,'Prepared',TRUE,0),
('Masala Idli','Meals',40,'Prepared',TRUE,0),
('Burger','Meals',45,'Prepared',TRUE,0),
('Grill Sandwich','Meals',30,'Prepared',TRUE,0),
('Cheese Grill Sandwich','Meals',45,'Prepared',TRUE,0),
('Aloo Patty','Meals',12,'Prepared',TRUE,0),
('Paneer Patty','Meals',15,'Prepared',TRUE,0),
('Veg Chowmein','Meals',30,'Prepared',TRUE,0),
('White Sauce Pasta','Meals',50,'Prepared',TRUE,0),
('Mixed Sauce Pasta','Meals',50,'Prepared',TRUE,0),
('Red Sauce Pasta','Meals',45,'Prepared',TRUE,0),
('Big Aloo Patty','Meals',15,'Prepared',TRUE,0),
('Big Paneer Patty','Meals',25,'Prepared',TRUE,0),
('Masala Maggi','Meals',30,'Prepared',TRUE,0),
('Vegetable Maggi','Meals',35,'Prepared',TRUE,0),
('Cheese Maggi','Meals',40,'Prepared',TRUE,0),
('Onion Tomato Maggi','Meals',35,'Prepared',TRUE,0),
('Cheese Burger','Meals',75,'Prepared',TRUE,0),
('Club Cheese Burger','Meals',75,'Prepared',TRUE,0),
('Red Sauce Pasta with Cheese','Meals',60,'Prepared',TRUE,0),
('White Sauce Pasta with Cheese','Meals',65,'Prepared',TRUE,0),
('Mixed Sauce Pasta with Cheese','Meals',65,'Prepared',TRUE,0),
('Chilli Paneer','Meals',60,'Prepared',TRUE,0),
('Chole Kulche','Meals',40,'Prepared',TRUE,0),
('Chole Bhature','Meals',40,'Prepared',TRUE,0),
('Plain Dosa','Meals',35,'Prepared',TRUE,0),
('Veg Masala Dosa','Meals',50,'Prepared',TRUE,0),
('Maharaja Masala Dosa','Meals',60,'Prepared',TRUE,0),
('Paneer Dosa','Meals',60,'Prepared',TRUE,0),
('Uttapam','Meals',70,'Prepared',TRUE,0),
('Pizza Uttapam','Meals',120,'Prepared',TRUE,0),
('Idli Sambhar','Meals',30,'Prepared',TRUE,0),
('Veg Kathi Roll','Meals',50,'Prepared',TRUE,0),
('Aloo Tikki Kathi Roll','Meals',60,'Prepared',TRUE,0),
('Paneer Kathi Roll','Meals',70,'Prepared',TRUE,0),
('Peri Peri Cheese Kathi Roll','Meals',80,'Prepared',TRUE,0),
('Chilli Paneer Kathi Roll','Meals',80,'Prepared',TRUE,0),
('Soya Kathi Roll','Meals',70,'Prepared',TRUE,0),
('Chilli Chowmein Kathi Roll','Meals',70,'Prepared',TRUE,0),
('Lachha Paratha','Meals',50,'Prepared',TRUE,0),
('Malabar Paratha','Meals',25,'Prepared',TRUE,0),
('Aloo Paratha','Meals',25,'Prepared',TRUE,0),
('Gobi Paratha','Meals',30,'Prepared',TRUE,0),
('Aloo Pyaz Paratha','Meals',30,'Prepared',TRUE,0),
('Mix Veg Paratha','Meals',40,'Prepared',TRUE,0),
('Paneer Paratha','Meals',40,'Prepared',TRUE,0),
('Mix Cheese Paratha','Meals',55,'Prepared',TRUE,0),
('Pizza Pocket','Meals',20,'Prepared',TRUE,0),
('Pizza Puff','Meals',20,'Prepared',TRUE,0),
('Garlic Bread','Meals',40,'Prepared',TRUE,0),
('Aloo Tikki Sub','Meals',80,'Prepared',TRUE,0),
('Aloo Tikki Sub with Cheese','Meals',95,'Prepared',TRUE,0),

('Coke (250 ml)','Snacks',20,'Ready to Serve',TRUE,0),
('Coke (750 ml)','Snacks',40,'Ready to Serve',TRUE,0),
('Thums Up (250 ml)','Snacks',20,'Ready to Serve',TRUE,0),
('Thums Up (750 ml)','Snacks',40,'Ready to Serve',TRUE,0),
('Sprite (250 ml)','Snacks',20,'Ready to Serve',TRUE,0),
('Sprite (750 ml)','Snacks',40,'Ready to Serve',TRUE,0),
('Limca (250 ml)','Snacks',20,'Ready to Serve',TRUE,0),
('Limca (750 ml)','Snacks',40,'Ready to Serve',TRUE,0),
('Fanta (250 ml)','Snacks',20,'Ready to Serve',TRUE,0),
('Fanta (750 ml)','Snacks',40,'Ready to Serve',TRUE,0),
('Maaza (200 ml)','Snacks',20,'Ready to Serve',TRUE,0),
('Minute Maid (500 ml)','Snacks',10,'Ready to Serve',TRUE,0),
('Minute Maid (1 litre)','Snacks',20,'Ready to Serve',TRUE,0),
('Dasani Water (500 ml)','Snacks',10,'Ready to Serve',TRUE,0),
('Dasani Water (1 litre)','Snacks',20,'Ready to Serve',TRUE,0),

('Chai','Drinks',12,'Prepared',TRUE,0),
('Masala / Aadrak Chai','Drinks',15,'Prepared',TRUE,0),
('Cold Coffee','Drinks',50,'Prepared',TRUE,0);

INSERT INTO Menu_Items
(item_name, category_id, price, item_type, available, preparation_time)
SELECT
    m.item_name,
    c.category_id,
    m.price,
    m.item_type,
    m.available,
    m.preparation_time
FROM MenuImport AS m
JOIN Categories AS c
    ON c.category_name = m.category_name;

SELECT COUNT(*) AS total_menu_items FROM Menu_Items;

SELECT
    m.item_id,
    m.item_name,
    c.category_name,
    m.price,
    m.item_type,
    m.available,
    m.preparation_time
FROM Menu_Items AS m
JOIN Categories AS c
    ON m.category_id = c.category_id
ORDER BY m.item_id;

DROP TEMPORARY TABLE MenuImport;

USE smartbite;

SELECT
    c.category_name,
    m.item_type,
    COUNT(*) AS item_count
FROM Menu_Items AS m
JOIN Categories AS c
    ON m.category_id = c.category_id
GROUP BY c.category_name, m.item_type
ORDER BY c.category_name, m.item_type;

USE smartbite;

SHOW TABLES;

SELECT 'Roles' AS table_name, COUNT(*) AS total FROM Roles
UNION ALL
SELECT 'Users', COUNT(*) FROM Users
UNION ALL
SELECT 'Categories', COUNT(*) FROM Categories
UNION ALL
SELECT 'Menu_Items', COUNT(*) FROM Menu_Items;

SELECT * FROM Roles;

INSERT INTO Users
    (full_name, email, password_hash, role_id)
SELECT
    'Test Student',
    'test.student@example.com',
    'DEMO_HASH_ONLY',
    role_id
FROM Roles
WHERE role_name = 'Student';

SELECT
    u.user_id,
    u.full_name,
    u.email,
    r.role_name
FROM Users AS u
JOIN Roles AS r
    ON u.role_id = r.role_id
WHERE u.email = 'test.student@example.com';

SELECT
    r.role_name,
    COUNT(u.user_id) AS total_users
FROM Roles AS r
LEFT JOIN Users AS u
    ON r.role_id = u.role_id
GROUP BY r.role_id, r.role_name;

USE smartbite;

SHOW CREATE TABLE Users;
SHOW CREATE TABLE Categories;
SHOW CREATE TABLE Menu_Items;

SELECT COUNT(*) AS total_menu_items
FROM Menu_Items;

