
exports.up = function(knex) {
  return knex.schema.createTable('receipt_patch', table => {
      table.integer('receipt');
      table.integer('patch');
  })
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('receipt_patch');
};
