
exports.up = function(knex) {
  return knex.schema.createTable('events', table => {
      table.increments('id');
      table.text('title');
      table.date('date');
      table.text('about');
      table.integer('income');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('events')
};
