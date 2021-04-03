const {Server} = require('boardgame.io/server');
const {LostCities} = require('./LostCitiesGame');
const {Innovation} = require('./InnovationGame');
const {GloryToRome} = require('./GloryToRomeGame');

const server = Server({
    games: [GloryToRome, LostCities, Innovation]
});

server.run(8000);
