
exports.up = function(knex) {
  return knex.schema.createTable('patches', table => {
      table.increments('id');
      table.text('name');
      table.integer('amount_ordered');
      table.integer('amount_sold');
      table.date('date_ordered');
      table.integer('income');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('patches');
};
