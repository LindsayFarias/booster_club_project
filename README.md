# 1 ROPS Booster Club App

## Schema
![Schema Image](./data/schema.png)

## Database
With a database, the 1 ROPS booster club will be able to keep track of income and expenditures and provide a platform for planning big events. The booster club can utilize the information in the database to help provide a healthy continuity for future members.

## Routes

## Leaning Tool
This project will also act as a good learning device, providing the steps necessary to create a full stack app
1. npm init -y
2. npm install express pg knex
3. knex init
4. npm install jest supertest --save-dev
5. npm install cors morgan nodemon --save
6. make sure to touch an app.js and update JSON to include proper start and test scripts **start script:** "start": "nodemon app.js" **test script:** "test": "NODE_ENV:development jest"
7. start with creating a good README.md with a well structured plan of what you want to provide the user from the backend and the routes to do so
8. If you are using Docker to store your data prior to deployment, open Docker app and run the container in which you will be storing your data. Will be utilizing the Postgres image in this app. Steps to set up and run a postgres container:
    * docker pull postgres
    * docker run --name (name of container) -e POSTGRES_PASSWORD=(password) -d -p 5432:5432 -v $HOME/docker/volumes/postgres:/var/lib/postgresql/data postgres
        * if docker container is already created: docker run (container name)
    * docker exec -it (container name) /bin/bash, you are now in the shell of your container
    * psql -U postgres, running your image in your container
    * Now in your container you can CREATE DATABASE (database name) or \c into a database. To view tables when in a database: \d or to look at a specific table \dt (table name)
    * When done, ^C to escape out
9. Look into setting up knex and express app in the respective folders
10. Be sure to create a gitHub repository to save your work, commit often! To create repository, go to [GitHub]('https://github.com').