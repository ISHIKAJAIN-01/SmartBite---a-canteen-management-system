
-- =====================================================================
-- Table 14: Inventory_Transactions
-- Run order: 4th (last). Needs Users, Ingredients and Inventory
-- (table AND data) to exist already.
-- =====================================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS Inventory_Transactions;   -- also drops its trigger
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE Inventory_Transactions (
    transaction_id   INT AUTO_INCREMENT PRIMARY KEY,
    ingredient_id    INT NOT NULL,
    user_id          INT NULL,
    transaction_type ENUM('Usage','Wastage','Adjustment','Restock') NOT NULL,
    quantity_change  DECIMAL(10,3) NOT NULL,
    reference_type   VARCHAR(30)  NULL,
    reference_id     INT          NULL,
    notes            VARCHAR(500) NULL,
    transaction_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_qty_change CHECK (quantity_change <> 0),
    CONSTRAINT fk_it_ingredient
        FOREIGN KEY (ingredient_id) REFERENCES Ingredients(ingredient_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_it_user
        FOREIGN KEY (user_id) REFERENCES Users(user_id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Trigger: keeps Inventory.quantity_on_hand in sync with transactions
-- (positive = stock added, negative = stock removed).
-- Must be created BEFORE the inserts below.
-- NOTE: if your project loads this file through code (not the mysql
-- client), remove the two DELIMITER lines and use END; instead of END//
-- and send the trigger as a single statement.
-- ---------------------------------------------------------------------
DELIMITER //
CREATE TRIGGER trg_update_inventory
AFTER INSERT ON Inventory_Transactions
FOR EACH ROW
BEGIN
    UPDATE Inventory
    SET quantity_on_hand = quantity_on_hand + NEW.quantity_change
    WHERE ingredient_id = NEW.ingredient_id;

    IF ROW_COUNT() = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'No Inventory row exists for this ingredient';
    END IF;
END//
DELIMITER ;

-- ---------------------------------------------------------------------
-- Sample data. user_id uses the first user in Users (NULL if Users is empty).
-- ---------------------------------------------------------------------

-- Opening stock: 300 pieces / 6000 grams-or-ml of every ingredient
INSERT INTO Inventory_Transactions
    (ingredient_id, user_id, transaction_type, quantity_change, notes)
SELECT ingredient_id,
       (SELECT MIN(user_id) FROM Users),
       'Restock',
       CASE unit WHEN 'pieces' THEN 300 ELSE 6000 END,
       'Opening stock'
FROM Ingredients;

-- Sample usage / wastage / adjustment / restock
INSERT INTO Inventory_Transactions
    (ingredient_id, user_id, transaction_type, quantity_change,
     reference_type, reference_id, notes)
VALUES
-- Order #11 had 2 Masala Dosa, 2 Rajma Chawal, 1 Chole Chawal.
-- Rice, rajma and chickpeas used for it (dosa ingredients left out for brevity):
((SELECT ingredient_id FROM Ingredients WHERE ingredient_name = 'Rice'),
 (SELECT MIN(user_id) FROM Users), 'Usage', -450, 'Order', 11, 'Rice used for order 11'),
((SELECT ingredient_id FROM Ingredients WHERE ingredient_name = 'Rajma'),
 (SELECT MIN(user_id) FROM Users), 'Usage', -160, 'Order', 11, 'Rajma used for order 11'),
((SELECT ingredient_id FROM Ingredients WHERE ingredient_name = 'Chickpeas'),
 (SELECT MIN(user_id) FROM Users), 'Usage', -80,  'Order', 11, 'Chickpeas used for order 11'),

-- Heavy usage that pushes Pav Bun below its reorder level (shows in low-stock query)
((SELECT ingredient_id FROM Ingredients WHERE ingredient_name = 'Pav Bun'),
 (SELECT MIN(user_id) FROM Users), 'Usage', -270, NULL, NULL, 'Bulk usage during lunch rush'),

-- Wastage, adjustment and restock examples
((SELECT ingredient_id FROM Ingredients WHERE ingredient_name = 'Milk'),
 (SELECT MIN(user_id) FROM Users), 'Wastage', -500, NULL, NULL, 'Spoiled milk discarded'),
((SELECT ingredient_id FROM Ingredients WHERE ingredient_name = 'Potato'),
 (SELECT MIN(user_id) FROM Users), 'Adjustment', 200, NULL, NULL, 'Stock recount correction'),
((SELECT ingredient_id FROM Ingredients WHERE ingredient_name = 'Maida'),
 (SELECT MIN(user_id) FROM Users), 'Restock', 5000, NULL, NULL, 'Weekly restock');