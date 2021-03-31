import {Client} from 'boardgame.io/react';
import {Local} from 'boardgame.io/multiplayer'
import {LostCities} from './Game';
import {LostCitiesBoard} from './Board';


const LostCitiesClient = Client({
    game: LostCities,
    board: LostCitiesBoard,
    multiplayer: Local(),
    numPlayers: 2,
    debug: false,
});

const App = () => (
    <div>
        <LostCitiesClient playerID="0"/>
        <hr/>
        <LostCitiesClient playerID="1"/>
    </div>
);

export default App;