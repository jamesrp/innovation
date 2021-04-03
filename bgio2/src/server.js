const { Server } = require('boardgame.io/server');
const { LostCities } = require('./Game');

const server = Server({ games: [LostCities] });

server.run(8000);
