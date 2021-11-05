
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('event-committee').truncate()
    .then(function () {
      // Inserts seed entries
      return knex('event-committee').insert([
        {member: 1, event: 1},
        {member: 2, event: 1},
        {member: 2, event: 2}
      ]);
    });
};
