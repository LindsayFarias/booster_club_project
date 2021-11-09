
exports.up = function(knex) {
  return knex.schema.createTable('patch_preOrder', table => {
      table.integer('patch');
      table.integer('preOrder');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('patch_preOrder');
};
