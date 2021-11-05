
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('events').truncate()
    .then(function () {
      // Inserts seed entries
      return knex('events').insert([
        {title: 'Christmas Party', date: '2021-12-25', about: 'Hoping to spread some cheer this holiday year',
        income: 250},
        {title: 'Chili Cook-off', date: '2021-03-29', about: 'Challenge between squadron to see who has the best chili',
        income: 90}
      ]);
    });
};
