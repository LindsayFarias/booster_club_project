
exports.up = function(knex) {
  return knex.schema.createTable('members', table => {
      table.increments('id');
      table.text('name');
      table.text('position');
  })
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('members');
};
