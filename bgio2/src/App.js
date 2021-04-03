import {Client} from 'boardgame.io/react';
import {SocketIO} from 'boardgame.io/multiplayer'
import {LostCities} from './LostCitiesGame';
import {LostCitiesBoard} from './LostCitiesBoard';
import {Innovation} from './InnovationGame';
import {InnovationBoard} from './InnovationBoard';
import {GloryToRome} from './GloryToRomeGame';
import {GloryToRomeBoard} from './GloryToRomeBoard';


const LostCitiesClient = Client({
    game: LostCities,
    board: LostCitiesBoard,
    multiplayer: SocketIO({server: 'localhost:8000'}),
    numPlayers: 2,
    debug: false,
});

const InnovationClient = Client({
    game: Innovation,
    board: InnovationBoard,
    multiplayer: SocketIO({server: 'localhost:8000'}),
    numPlayers: 2,
    debug: false,
});

const GloryToRomeClient = Client({
    game: GloryToRome,
    board: GloryToRomeBoard,
    multiplayer: SocketIO({server: 'localhost:8000'}),
    numPlayers: 2,
    debug: false,
});

// MakeClient routes a URL like:
// localhost:3000/game/matchID/1
// to matchID, seat 1.
// TODO: should we use query params instead?
function MakeClient() {
    let pathArray = window.location.pathname.split('/');
    let game = pathArray[1];
    if (game === "lc" || game === "l") {
        game = "lostcities";
    } else if (game === "i") {
        game = "innovation";
    } else if (game === "g" || game === "gtr") {
        game = "glorytorome";
    }
    let match = game + "/" + pathArray[2];
    let player = pathArray[3];
    let myClient = <p>game not found!</p>;
    if (game === "lostcities") {
        myClient = <LostCitiesClient playerID={player} matchID={match}/>;
    } else if (game === "innovation") {
        myClient = <InnovationClient playerID={player} matchID={match}/>;
    } else if (game === "glorytorome") {
        myClient = <GloryToRomeClient playerID={player} matchID={match}/>;
    }
    return <div>
        <p>window.location.pathname = {window.location.pathname}</p>
        <p>game = {game}</p>
        <p>match = {match}</p>
        <p>player = {player}</p>
        {myClient}
    </div>;
}

const App = () => (
    <div>
        {MakeClient()}
    </div>
);

export default App;