-- Table 5: Ingredients
CREATE TABLE Ingredients (
    ingredient_id   INT AUTO_INCREMENT PRIMARY KEY,
    ingredient_name VARCHAR(120) NOT NULL UNIQUE,
    unit            VARCHAR(20)  NOT NULL,
    description     VARCHAR(255) NULL
) ENGINE=InnoDB;

