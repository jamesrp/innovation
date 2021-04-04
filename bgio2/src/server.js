const {Server} = require('boardgame.io/server');
const {LostCities} = require('./LostCitiesGame');
const {Innovation} = require('./InnovationGame');
const {GloryToRome} = require('./GloryToRomeGame');

const server = Server({
    games: [GloryToRome, LostCities, Innovation]
});

const lobbyConfig = {
    apiPort: 8080,
    apiCallback: () => console.log('Running Lobby API on port 8080...'),
};

server.run({ port: 8000, lobbyConfig });
