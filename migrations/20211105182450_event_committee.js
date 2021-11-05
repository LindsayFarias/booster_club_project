
exports.up = function(knex) {
  return knex.schema.createTable('event-committee', table => {
      table.integer('member');
      table.integer('event');
  })
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('event-committee');
};
