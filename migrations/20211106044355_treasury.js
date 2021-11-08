
exports.up = function(knex) {
  return knex.schema.createTable('treasury', table => {
      table.integer('income');
      table.integer('expenditures');
  })
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('treasury');
};
