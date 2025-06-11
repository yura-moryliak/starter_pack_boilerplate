# Starte pack boilerplate

This is a repository as a starter pack for to get and implement further structure for full stack apps.
This pack includes the next features inside:

- [NestJS] - server part
- [Angular] - client part
- [Docker] - a docker-compose.yml to run MySQL and PHPMyAdmin
- [Auth] - added auth module with JWT access tokens, refresh mechanism settled in cookies, route gurads
- [Users] - Covered CRUD for users with auth mechanism

## ENV
To make it running properly in the local environment, make sure to do the following steps:
1. In folder server_nestjs -> .gitignore - make sure to uncomment (# dotenv environment variable files)
2. .env.dev - this .file contains all necessary environment variables to make the server running
3. Make your own adjustments for variables, especially mailing variables

## Build process
1. First build server
2. Output server files will be stored in the dist folder see schema down below
3. |./starter_pack_boilerplate
   |...
   | ./server_nestjs
   | ./dist - server output files
4. Building UI
5. By running the build process for UI - distribution will be stored in the server_nestjs dist folder
6. Check out each service package.json to see run commands

## Run local appliance
1. docker-compose up -d
2. cd ./server_nestjs -> npm run nest:start:dev
3. cd ./ui -> npm run start