
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('patches').truncate()
    .then(function () {
      // Inserts seed entries
      return knex('patches').insert([
        { patchName: 'Crew-1', amount_ordered: 150, amount_sold: 50, date_ordered: '2021-03-22', income: 400},
        { patchName: 'Crew-2', amount_ordered: 200, amount_sold: 100, date_ordered: '2021-06-16', income: 800}
      ]);
    });
};
