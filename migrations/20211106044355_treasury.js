
exports.up = function(knex) {
  return knex.schema.createTable('treasury', table => {
      table.integer('income');
      table.integer('expenditures');
      table.integer('total');
  })
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('treasury');
};
