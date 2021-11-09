
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('pre_orders').truncate()
    .then(function () {
      // Inserts seed entries
      return knex('pre_orders').insert([
        {name: 'Wanda Cordelli', amount: 2, notes: null, picked_up: false},
        {name: 'John Eno', amount: 6, notes: null, picked_up: false},
      ]);
    });
};
