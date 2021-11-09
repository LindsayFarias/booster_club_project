
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('patch_preOrder').del()
    .then(function () {
      // Inserts seed entries
      return knex('patch_preOrder').insert([
        {patch: 2, preOrder: 2},
        {patch: 2, preOrder: 1}
      ]);
    });
};
