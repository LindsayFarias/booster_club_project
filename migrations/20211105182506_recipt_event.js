
exports.up = function(knex) {
  return knex.schema.createTable('receipt_event', table => {
      table.integer('receipt');
      table.integer('event');
  })
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('receipt_event');
};
