import {Client} from 'boardgame.io/react';
import {Local} from 'boardgame.io/multiplayer'
import {MinimalRepro} from './Game';
import {MinimalReproBoard} from './Board';


const MinimalReproClient = Client({
    game: MinimalRepro,
    board: MinimalReproBoard,
    multiplayer: Local(),
    numPlayers: 4,
});

const App = () => (
    <div>
        <table>
            <tr>
                <td><MinimalReproClient playerID="0"/></td>
                <td><MinimalReproClient playerID="1"/></td>
                <td><MinimalReproClient playerID="2"/></td>
                <td><MinimalReproClient playerID="3"/></td>
            </tr>
        </table>
    </div>
);

export default App;