import {Client} from 'boardgame.io/react';
import {Local} from 'boardgame.io/multiplayer'
import {GloryToRome} from './Game';
import {GloryToRomeBoard} from './Board';


const GloryToRomeClient = Client({
    game: GloryToRome,
    board: GloryToRomeBoard,
    multiplayer: Local(),
});

const App = () => (
    <div>
        <GloryToRomeClient playerID="0"/>
        <hr/>
        <GloryToRomeClient playerID="1"/>
    </div>
);

export default App;