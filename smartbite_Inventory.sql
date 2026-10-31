
-- =====================================================================
-- Table 7: Inventory  (1 ingredient : 0..1 inventory row)
-- Run order: 2nd. Needs Ingredients (table and data) to exist already.
-- =====================================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS Inventory;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE Inventory (
    inventory_id     INT AUTO_INCREMENT PRIMARY KEY,
    ingredient_id    INT NOT NULL UNIQUE,
    quantity_on_hand DECIMAL(10,3) NOT NULL DEFAULT 0,
    reorder_level    DECIMAL(10,3) NOT NULL DEFAULT 0,
    last_updated     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                              ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_inv_qty     CHECK (quantity_on_hand >= 0),
    CONSTRAINT chk_inv_reorder CHECK (reorder_level >= 0),
    CONSTRAINT fk_inv_ingredient
        FOREIGN KEY (ingredient_id) REFERENCES Ingredients(ingredient_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- One row per ingredient. Stock starts at 0; the opening stock is added
-- through 'Restock' transactions in Inventory_Transactions.sql so the
-- transaction log matches the stock levels.
-- Reorder level: 50 for pieces, 1000 for everything else (adjust freely).
INSERT INTO Inventory (ingredient_id, quantity_on_hand, reorder_level)
SELECT ingredient_id,
       0,
       CASE unit WHEN 'pieces' THEN 50 ELSE 1000 END
FROM Ingredients;