
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('receipts').del()
    .then(function () {
      // Inserts seed entries
      return knex('receipts').insert([
        {reason: 'materials for Holiday Party', expenditures: 25, associated_member: 'Farias'},
        {reason: 'raffle items for Holiday Party', expenditures: 1000, associated_member: 'Farias'},
        {reason: 'materials for Chili Cook-off', expenditures: 15, associated_member: 'Brendan'},
        {reason: 'Crew-1 Patches', expenditures: 990, associated_member: 'Farias'},
        {reason: 'Crew-2 Patches', expenditures: 1200, associated_member: 'Farias'}
      ]);
    });
};
