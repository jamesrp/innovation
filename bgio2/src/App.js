import {Client} from 'boardgame.io/react';
import {SocketIO} from 'boardgame.io/multiplayer'
import {LostCities} from './Game';
import {LostCitiesBoard} from './Board';


const LostCitiesClient = Client({
    game: LostCities,
    board: LostCitiesBoard,
    multiplayer: SocketIO({ server: 'localhost:8000' }),
    numPlayers: 2,
    debug: false,
});

// MakeClient routes a URL like:
// localhost:3000/matchID/1
// to matchID, seat 1.
function MakeClient() {
    let pathArray = window.location.pathname.split('/');
    let player = pathArray[2];
    let match = pathArray[1];
    return <LostCitiesClient playerID={player} matchID={match}/>;
}

const App = () => (
    <div>
        {MakeClient()}
    </div>
);

export default App;