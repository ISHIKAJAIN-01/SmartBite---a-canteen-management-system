

-- =====================================================================
-- Table 5: Ingredients
-- Run order: 1st of my 4 files (needs nothing else).
-- =====================================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS Ingredients;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE Ingredients (
    ingredient_id   INT AUTO_INCREMENT PRIMARY KEY,
    ingredient_name VARCHAR(120) NOT NULL UNIQUE,
    unit            VARCHAR(20)  NOT NULL,
    description     VARCHAR(255) NULL
) ENGINE=InnoDB;

-- Cooking ingredients for 'Prepared' menu items
INSERT INTO Ingredients (ingredient_name, unit) VALUES
('Rice',               'grams'),
('Potato',             'grams'),
('Onion',              'grams'),
('Tomato',             'grams'),
('Paneer',             'grams'),
('Cheese',             'grams'),
('Butter',             'grams'),
('Cooking Oil',        'millilitres'),
('Bread Slices',       'pieces'),
('Pav Bun',            'pieces'),
('Burger Bun',         'pieces'),
('Pasta',              'grams'),
('Maggi Noodles',      'pieces'),
('Chowmein Noodles',   'grams'),
('Rajma',              'grams'),
('Chickpeas',          'grams'),
('Maida',              'grams'),
('Wheat Flour',        'grams'),
('Dosa Batter',        'grams'),
('Idli Batter',        'grams'),
('Mixed Vegetables',   'grams'),
('Red Sauce',          'millilitres'),
('White Sauce',        'millilitres'),
('Tea Leaves',         'grams'),
('Milk',               'millilitres'),
('Sugar',              'grams'),
('Coffee Powder',      'grams'),
('Frozen Fries',       'grams'),
('Manchurian Balls',   'pieces'),
('Soya Chunks',        'grams'),
('Spice Mix',          'grams'),

-- Packaged ('Ready to Serve') items: each one is its own single ingredient.
-- Names must match Menu_Items.item_name exactly.
('Coke (250 ml)',          'pieces'),
('Coke (750 ml)',          'pieces'),
('Thums Up (250 ml)',      'pieces'),
('Thums Up (750 ml)',      'pieces'),
('Sprite (250 ml)',        'pieces'),
('Sprite (750 ml)',        'pieces'),
('Limca (250 ml)',         'pieces'),
('Limca (750 ml)',         'pieces'),
('Fanta (250 ml)',         'pieces'),
('Fanta (750 ml)',         'pieces'),
('Maaza (200 ml)',         'pieces'),
('Minute Maid (500 ml)',   'pieces'),
('Minute Maid (1 litre)',  'pieces'),
('Dasani Water (500 ml)',  'pieces'),
('Dasani Water (1 litre)', 'pieces');