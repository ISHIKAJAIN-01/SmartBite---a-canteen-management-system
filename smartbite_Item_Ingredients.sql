-- Table 6: Item_Ingredients (needs Menu_Items from your teammate)
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
