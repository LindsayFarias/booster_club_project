
exports.up = function(knex) {
  return knex.schema.createTable('pre_orders', table => {
      table.increments('id');
      table.text('name');
      table.integer('amount');
      table.text('notes');
      table.boolean('picked_up');
  })
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('pre_orders');
};
