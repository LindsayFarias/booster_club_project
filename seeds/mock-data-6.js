
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('treasury').truncate()
    .then(function () {
      // Inserts seed entries
      return knex('treasury').insert(
        {income: 5000, expenditures: 1500}
      );
    });
};
