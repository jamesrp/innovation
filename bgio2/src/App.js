import {Client, Lobby} from 'boardgame.io/react';
import {SocketIO} from 'boardgame.io/multiplayer'
import {LostCities} from './LostCitiesGame';
import {LostCitiesBoard} from './LostCitiesBoard';
import {Elements} from './ElementsGame';
import {ElementsBoard} from './ElementsBoard';
import {Innovation} from './InnovationGame';
import {InnovationBoard} from './InnovationBoard';
import {GloryToRome} from './GloryToRomeGame';
import {GloryToRomeBoard} from './GloryToRomeBoard';

const ElementsClient = Client({
    game: Elements,
    board: ElementsBoard,
    multiplayer: SocketIO({server: 'localhost:8000'}),
    numPlayers: 2,
    debug: false,
});

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
    numPlayers: 3,
    debug: false,
});

// A helper page with some links.
// localhost:3000/lobby/gameName
// localhost:3000/match/gameName/matchID/playerID
function MainPage() {
    return <div>
        <p>Expected one of two URL formats:</p>
        <p><a href="/lobby">/lobby</a></p>
        <p><a href="/match/gameName/matchID/playerID">/match/gameName/matchID/playerID</a></p>
    </div>;
}

function MakeLobby() {
    return <div><p>BTW - lobby is broken right now. Just navigate to game URLs yourself.</p><Lobby
        gameServer={`http://${window.location.hostname}:8000`}
        lobbyServer={`http://${window.location.hostname}:8080`}
        gameComponents={[
            {game: LostCities, board: LostCitiesBoard},
            {game: Innovation, board: InnovationBoard},
            {game: GloryToRome, board: GloryToRomeBoard}
        ]}
    /></div>;
}

function MakeClient(game, match, player) {
    let myClient = <p>game not found!</p>;
    if (game === "lostcities") {
        myClient = <LostCitiesClient playerID={player} matchID={match}/>;
    } else if (game === "innovation") {
        myClient = <InnovationClient playerID={player} matchID={match}/>;
    } else if (game === "glorytorome") {
        myClient = <GloryToRomeClient playerID={player} matchID={match}/>;
    }  else if (game === "elements") {
        myClient = <ElementsClient playerID={player} matchID={match}/>;
    }
    return myClient;
}

// RouteRequest routes a URL in one of these formats:
// localhost:3000/lobby/gameName
// localhost:3000/match/gameName/matchID/playerID
// TODO: should we use query params instead?
function RouteRequest() {
    let pathArray = window.location.pathname.split('/');
    if (pathArray.length <= 1) {
        return MainPage();
    }
    let lobbyOrMatch = pathArray[1];
    let game = pathArray[2];
    if (lobbyOrMatch === "match") {
        if (game === "lc" || game === "l") {
            game = "lostcities";
        } else if (game === "i") {
            game = "innovation";
        } else if (game === "g" || game === "gtr") {
            game = "glorytorome";
        }  else if (game === "e") {
            game = "elements";
        }
        let match = game + "/" + pathArray[3];
        let player = pathArray[4];
        return MakeClient(game, match, player);
    }
    if (lobbyOrMatch === "lobby") {
        return MakeLobby();
    }
    // Didn't understand URL - serve main page.
    return MainPage();
}

const App = () => (
    <div>
        {RouteRequest()}
    </div>
);

export default App;