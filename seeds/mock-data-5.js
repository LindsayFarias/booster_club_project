
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('receipt_event').truncate()
    .then(function () {
      // Inserts seed entries
      return knex('receipt_event').insert([
        {receipt: 1, event: 1},
        {receipt: 2, event: 1},
        {receipt: 3, event: 2},
      ]);
    });
};
