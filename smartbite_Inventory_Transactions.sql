-- Table 14: Inventory_Transactions (needs Users from your teammate)
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

