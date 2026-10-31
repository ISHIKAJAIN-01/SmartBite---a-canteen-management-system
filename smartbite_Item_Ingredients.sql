
-- =====================================================================
-- Table 6: Item_Ingredients
-- Run order: 3rd. Needs Menu_Items (with data) and Ingredients (with data).
-- =====================================================================

SET NAMES utf8mb4;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS Item_Ingredients;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE Item_Ingredients (
    item_id           INT NOT NULL,
    ingredient_id     INT NOT NULL,
    quantity_required DECIMAL(10,3) NOT NULL,
    PRIMARY KEY (item_id, ingredient_id),
    CONSTRAINT chk_qty_required CHECK (quantity_required > 0),
    CONSTRAINT fk_ii_item
        FOREIGN KEY (item_id) REFERENCES Menu_Items(item_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ii_ingredient
        FOREIGN KEY (ingredient_id) REFERENCES Ingredients(ingredient_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Recipes for 'Prepared' items (quantity per serving).
-- Matched by item_name, so it works even if item_ids change. Rows whose
-- item name does not exist in Menu_Items are skipped silently.
-- ---------------------------------------------------------------------
INSERT INTO Item_Ingredients (item_id, ingredient_id, quantity_required)
SELECT m.item_id, i.ingredient_id, r.qty
FROM (VALUES
    ROW('Masala Dosa',               'Dosa Batter',      150),
    ROW('Masala Dosa',               'Potato',           100),
    ROW('Masala Dosa',               'Onion',             30),
    ROW('Masala Dosa',               'Cooking Oil',       10),
    ROW('Masala Dosa',               'Spice Mix',          5),

    ROW('Rajma Chawal',              'Rajma',             80),
    ROW('Rajma Chawal',              'Rice',             150),
    ROW('Rajma Chawal',              'Onion',             30),
    ROW('Rajma Chawal',              'Tomato',            40),
    ROW('Rajma Chawal',              'Cooking Oil',       10),

    ROW('Chole Chawal',              'Chickpeas',         80),
    ROW('Chole Chawal',              'Rice',             150),
    ROW('Chole Chawal',              'Onion',             30),
    ROW('Chole Chawal',              'Tomato',            40),
    ROW('Chole Chawal',              'Cooking Oil',       10),

    ROW('Pav Bhaji',                 'Pav Bun',            2),
    ROW('Pav Bhaji',                 'Mixed Vegetables', 150),
    ROW('Pav Bhaji',                 'Butter',            15),
    ROW('Pav Bhaji',                 'Tomato',            40),

    ROW('Fried Rice',                'Rice',             150),
    ROW('Fried Rice',                'Mixed Vegetables',  60),
    ROW('Fried Rice',                'Cooking Oil',       15),

    ROW('Fried Rice + Manchurian',   'Rice',             150),
    ROW('Fried Rice + Manchurian',   'Mixed Vegetables',  60),
    ROW('Fried Rice + Manchurian',   'Manchurian Balls',   4),
    ROW('Fried Rice + Manchurian',   'Cooking Oil',       20),

    ROW('Vada Pav',                  'Pav Bun',            1),
    ROW('Vada Pav',                  'Potato',            80),
    ROW('Vada Pav',                  'Cooking Oil',       20),

    ROW('Fries',                     'Frozen Fries',     150),
    ROW('Fries',                     'Cooking Oil',       30),
    ROW('Peri Peri Fries',           'Frozen Fries',     150),
    ROW('Peri Peri Fries',           'Cooking Oil',       30),
    ROW('Peri Peri Fries',           'Spice Mix',          5),
    ROW('Cheese Fries',              'Frozen Fries',     150),
    ROW('Cheese Fries',              'Cheese',            30),
    ROW('Cheese Fries',              'Cooking Oil',       30),

    ROW('Burger',                    'Burger Bun',         1),
    ROW('Burger',                    'Potato',            80),
    ROW('Burger',                    'Onion',             20),
    ROW('Burger',                    'Cooking Oil',       15),
    ROW('Cheese Burger',             'Burger Bun',         1),
    ROW('Cheese Burger',             'Potato',            80),
    ROW('Cheese Burger',             'Cheese',            25),
    ROW('Cheese Burger',             'Cooking Oil',       15),

    ROW('Grill Sandwich',            'Bread Slices',       2),
    ROW('Grill Sandwich',            'Butter',            10),
    ROW('Grill Sandwich',            'Mixed Vegetables',  50),
    ROW('Cheese Grill Sandwich',     'Bread Slices',       2),
    ROW('Cheese Grill Sandwich',     'Butter',            10),
    ROW('Cheese Grill Sandwich',     'Mixed Vegetables',  50),
    ROW('Cheese Grill Sandwich',     'Cheese',            25),

    ROW('Aloo Patty',                'Potato',            80),
    ROW('Aloo Patty',                'Maida',             40),
    ROW('Aloo Patty',                'Cooking Oil',       25),
    ROW('Paneer Patty',              'Paneer',            50),
    ROW('Paneer Patty',              'Maida',             40),
    ROW('Paneer Patty',              'Cooking Oil',       25),

    ROW('Veg Chowmein',              'Chowmein Noodles', 150),
    ROW('Veg Chowmein',              'Mixed Vegetables',  60),
    ROW('Veg Chowmein',              'Cooking Oil',       15),

    ROW('White Sauce Pasta',         'Pasta',            100),
    ROW('White Sauce Pasta',         'White Sauce',      100),
    ROW('White Sauce Pasta',         'Mixed Vegetables',  40),
    ROW('Red Sauce Pasta',           'Pasta',            100),
    ROW('Red Sauce Pasta',           'Red Sauce',        100),
    ROW('Red Sauce Pasta',           'Mixed Vegetables',  40),
    ROW('Mixed Sauce Pasta',         'Pasta',            100),
    ROW('Mixed Sauce Pasta',         'Red Sauce',         50),
    ROW('Mixed Sauce Pasta',         'White Sauce',       50),
    ROW('Mixed Sauce Pasta',         'Mixed Vegetables',  40),

    ROW('Masala Maggi',              'Maggi Noodles',      1),
    ROW('Masala Maggi',              'Spice Mix',          3),
    ROW('Cheese Maggi',              'Maggi Noodles',      1),
    ROW('Cheese Maggi',              'Cheese',            30),

    ROW('Chilli Paneer',             'Paneer',           120),
    ROW('Chilli Paneer',             'Onion',             30),
    ROW('Chilli Paneer',             'Cooking Oil',       25),

    ROW('Chole Bhature',             'Chickpeas',         80),
    ROW('Chole Bhature',             'Maida',            100),
    ROW('Chole Bhature',             'Cooking Oil',       40),

    ROW('Plain Dosa',                'Dosa Batter',      150),
    ROW('Plain Dosa',                'Cooking Oil',       10),
    ROW('Veg Masala Dosa',           'Dosa Batter',      150),
    ROW('Veg Masala Dosa',           'Potato',           100),
    ROW('Veg Masala Dosa',           'Mixed Vegetables',  40),
    ROW('Veg Masala Dosa',           'Cooking Oil',       15),
    ROW('Maharaja Masala Dosa',      'Dosa Batter',      180),
    ROW('Maharaja Masala Dosa',      'Potato',           120),
    ROW('Maharaja Masala Dosa',      'Paneer',            40),
    ROW('Maharaja Masala Dosa',      'Cheese',            20),
    ROW('Maharaja Masala Dosa',      'Cooking Oil',       20),

    ROW('Masala Idli',               'Idli Batter',      150),
    ROW('Masala Idli',               'Spice Mix',          5),
    ROW('Masala Idli',               'Cooking Oil',       10),

    ROW('Paneer Kathi Roll',         'Maida',             80),
    ROW('Paneer Kathi Roll',         'Paneer',            60),
    ROW('Paneer Kathi Roll',         'Cooking Oil',       15),
    ROW('Soya Kathi Roll',           'Maida',             80),
    ROW('Soya Kathi Roll',           'Soya Chunks',       60),
    ROW('Soya Kathi Roll',           'Cooking Oil',       15),

    ROW('Aloo Paratha',              'Wheat Flour',      100),
    ROW('Aloo Paratha',              'Potato',            80),
    ROW('Aloo Paratha',              'Butter',            10),

    ROW('Chai',                      'Tea Leaves',         3),
    ROW('Chai',                      'Milk',             100),
    ROW('Chai',                      'Sugar',             10),
    ROW('Cold Coffee',               'Coffee Powder',      5),
    ROW('Cold Coffee',               'Milk',             200),
    ROW('Cold Coffee',               'Sugar',             15)
) AS r(item_name, ingredient_name, qty)
JOIN Menu_Items  m ON m.item_name       = r.item_name
JOIN Ingredients i ON i.ingredient_name = r.ingredient_name;

-- ---------------------------------------------------------------------
-- Packaged ('Ready to Serve') items: 1 ingredient each, the item itself,
-- quantity 1. Matches any Ready to Serve item that has an ingredient
-- with the same name.
-- ---------------------------------------------------------------------
INSERT INTO Item_Ingredients (item_id, ingredient_id, quantity_required)
SELECT m.item_id, i.ingredient_id, 1
FROM Menu_Items m
JOIN Ingredients i ON i.ingredient_name = m.item_name
WHERE m.item_type = 'Ready to Serve';