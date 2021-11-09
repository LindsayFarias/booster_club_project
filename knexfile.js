// Update with your config settings.
// connection: '(image)://(image):(password)@localhost/(database name)'

module.exports = {

  development: {
    client: 'pg',
    connection: 'postgres://postgres:docker@localhost/booster_club'
  },

  staging: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};

//to create migration tables run npx knex migrate:make (table_to_be_created)
//to run migrations run npx knex migrate:latest
//to creates seeds to populate table with run npx knex seed:make (name_of_seed_data)
//to run seeds run npx knex seed:run