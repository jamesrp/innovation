import {Client} from 'boardgame.io/react';
import {Local} from 'boardgame.io/multiplayer'
import {LostCities} from './Game';
import {LostCitiesBoard} from './Board';


const LostCitiesClient = Client({
    game: LostCities,
    board: LostCitiesBoard,
    multiplayer: Local(),
    numPlayers: 2,
});

const App = () => (
    <div>
        <table>
            <tr>
                <td><LostCitiesClient playerID="0"/></td>
                <td><LostCitiesClient playerID="1"/></td>
            </tr>
        </table>
    </div>
);

export default App;