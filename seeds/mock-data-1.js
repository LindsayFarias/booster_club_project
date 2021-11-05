
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('members').truncate()
    .then(function () {
      // Inserts seed entries
      return knex('members').insert([
        {name: 'Brendan Kennedy', position: 'President'},
        {name: 'Lindsay Farias', position: 'Secretary'}
      ]);
    });
};

