-- Table 7: Inventory (1 ingredient : 0..1 inventory row)
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
