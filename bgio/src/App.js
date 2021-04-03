import { Client } from 'boardgame.io/react';
import {SocketIO} from 'boardgame.io/multiplayer'
import { Innovation } from './InnovationGame';
import { InnovationBoard } from './InnovationBoard';
import { GloryToRome } from './GloryToRomeGame';
import { GloryToRomeBoard } from './GloryToRomeBoard';
import { LostCities } from './LostCitiesGame';
import { LostCitiesBoard } from './LostCitiesBoard';

const InnovationClient = Client({
    game: Innovation,
    board: InnovationBoard,
    multiplayer: SocketIO({ server: 'localhost:8000' }),
    numPlayers: 2,
    debug: false,
});

const GloryToRomeClient = Client({
    game: GloryToRome,
    board: GloryToRomeBoard,
    multiplayer: SocketIO({ server: 'localhost:8000' }),
    numPlayers: 2,
    debug: false,
});

const LostCitiesClient = Client({
    game: LostCities,
    board: LostCitiesBoard,
    multiplayer: SocketIO({ server: 'localhost:8000' }),
    numPlayers: 2,
    debug: false,
});

// MakeClient routes a URL like:
// localhost:3000/lostcities/match1234/1
// to game     = lost cities,
//    matchID  = match1234,
//    playerID = 1.
function MakeClient() {
    let pathArray = window.location.pathname.split('/');
    let game = pathArray[1];
    let match = pathArray[2];
    let player = pathArray[3];
    if (game === "lostcities") {
        return <LostCitiesClient playerID={player} matchID={match}/>;
    } else if (game === "innovation") {
        return <InnovationClient playerID={player} matchID={match}/>;
    } else if (game === "glorytorome") {
        return <GloryToRomeClient playerID={player} matchID={match}/>;
    }
    // Couldn't parse the url, try redirecting the user to some options.
    return <p>Couldn't parse url, try: <a href="lostcities/match1234/1">lostcities/match1234/1</a></p>;
}

const App = () => (
    <div>
        {MakeClient()}
    </div>
);


export default App;