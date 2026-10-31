// ======================================================================
// TEMPORARY TESTING CONFIGURATION - NOT THE FINAL TEAM SCHEMA
// ======================================================================
// This points order placement at `tmp_menu_test`, a throwaway table created
// by database/tmp_menu_test.sql, so POST /api/orders can be tested before the
// real menu table exists.
//
// TODO (before the final team version):
//   1. Replace these three values with the REAL menu table and column names
//      (see `SHOW CREATE TABLE <real menu table>;`).
//   2. Drop `tmp_menu_test` from your local database.
//   3. Do NOT commit this temporary configuration or the temporary SQL file
//      as the team's final implementation.
//
//   table       : name of the menu table
//   idColumn    : the column that Order_Items.item_id refers to (the menu primary key)
//   priceColumn : the column holding the current unit price
//
// Names are used as SQL identifiers, so only letters, digits and "_" are allowed.

module.exports = {
  table: "Menu_Items",
  idColumn: "item_id",
  priceColumn: "price",
};

