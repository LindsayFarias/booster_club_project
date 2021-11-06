
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('treasury').truncate()
    .then(function () {
      // Inserts seed entries
      return knex('treasury').insert(
        {income: 2500, expenditures: 1500, total: 1000}
      );
    });
};
