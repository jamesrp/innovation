const {Server} = require('boardgame.io/server');
const {LostCities} = require('./LostCitiesGame');
const {GloryToRome} = require('./GloryToRomeGame');
const {Innovation} = require('./InnovationGame');

const server = Server({
    games: [LostCities, GloryToRome, Innovation]
});

server.run(8000);
