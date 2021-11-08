
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('receipt_patch').truncate()
    .then(function () {
      // Inserts seed entries
      return knex('receipt_patch').insert([
        {receipt: 4, patch: 1},
        {receipt: 5, patch: 2}
      ]);
    });
};
