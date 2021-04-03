import {Client} from 'boardgame.io/react';
import {Local} from 'boardgame.io/multiplayer'
import {GloryToRome} from './Game';
import {GloryToRomeBoard} from './Board';


const GloryToRomeClient = Client({
    game: GloryToRome,
    board: GloryToRomeBoard,
    numPlayers: 3,
    multiplayer: Local(),
});

const App = () => (
    <div>
        <table>
            <tr>
                <td><GloryToRomeClient playerID="0"/></td>
                <td><GloryToRomeClient playerID="1"/></td>
                <td><GloryToRomeClient playerID="2"/></td>
            </tr>
        </table>
    </div>
);

export default App;