import React from 'react';
import {boardStyle, tableStyle, cellStyleSide, cellStyleElements, handStyle, facedownCardStyle} from './styles';
import {message, sumArray} from './common';

export class ElementsBoard extends React.Component {
    render() {
        // TODO: it would be nice to be able to reset the game and total up the overall points automatically.
        let msg = message(this.props.ctx, this.props.playerID);
        if (this.props.ctx.gameover) {
            msg = msg + " - claiming " + this.props.G.winnerPoints.toString() + " points";
        }

        let opp = "0";
        if (this.props.playerID === "0") {
            opp = "1";
        }
        let myTurn = (this.props.playerID === this.props.ctx.currentPlayer);

        let sideStyle = cellStyleSide('clear', false);
        sideStyle.width = '180px';

        let actionHeaderStyle = handStyle('clear');
        let actionStyle = handStyle('purple');
        let actionStyleClickable = handStyle('purple');
        actionStyleClickable.border = '3px solid #555';

        let oppFakeHand = Array(this.props.G.playerHandCounts[opp]).fill('?');

        let rulesStyle = {
            width: '800px',
            lineHeight: '25px',
            textAlign: 'center',
            margin: 'auto',
        };

        let oppHand = this.props.G.playerHandCounts[opp] === 0 ? '0' : '?';
        let oppBoard = sumArray(this.props.G.playerPiles[opp]);
        let table = sumArray(this.props.G.table);
        let myBoard = sumArray(this.props.G.playerPiles[this.props.playerID]);
        let myHand = sumArray(this.props.G[this.props.playerID].hand);
        let canKnock = (myBoard + myHand) <= table;

        return (
            <div>
                <div style={boardStyle()}>
                    <h3> Player {this.props.playerID} board {msg}</h3>
                    <table id="board" style={tableStyle()}>
                        <tbody>
                        <tr>
                            <td style={sideStyle}>Opponent hand ({oppHand})</td>
                            <td style={cellStyleElements('red')}>{renderCards(oppFakeHand)}</td>
                        </tr>
                        <tr>
                            <td style={sideStyle}>Opponent board ({oppBoard})</td>
                            <td style={cellStyleElements('red')}>{renderCards(this.props.G.playerPiles[opp])}</td>
                        </tr>
                        <tr>
                            <td style={sideStyle}>Discards</td>
                            <td style={cellStyleElements('grey')}>{renderCards(this.props.G.discards)}</td>
                        </tr>
                        <tr>
                            <td style={sideStyle}>Table ({table})</td>
                            <td style={cellStyleElements('grey')}>{renderCards(this.props.G.table)}</td>
                        </tr>
                        <tr>
                            <td style={sideStyle}>My board ({myBoard})</td>
                            <td style={cellStyleElements('yellow')}>{renderCards(this.props.G.playerPiles[this.props.playerID])}</td>
                        </tr>
                        <tr>
                            <td style={sideStyle}>My hand ({myHand})</td>
                            <td style={cellStyleElements('yellow')}>{renderCards(this.props.G[this.props.playerID].hand, myTurn ? this.props.moves.Play : null)}</td>
                        </tr>
                        </tbody>
                    </table>
                    <table id="controls" style={tableStyle()}>
                        <tbody>
                        <tr>
                            <td style={actionHeaderStyle}>Other Actions</td>
                        </tr>
                        <tr>
                            {maybeClickableTD(actionStyle, "DRAW from table", (myTurn && this.props.G.table.length > 0) ? this.props.moves.Draw : null)}
                        </tr>
                        <tr>
                            {maybeClickableTD(actionStyle, "DISCARD a 6", (myTurn && this.props.G[this.props.playerID].hand.includes(6)) ? this.props.moves.Discard : null)}
                        </tr>
                        <tr>
                            {maybeClickableTD(actionStyle, "KNOCK", (myTurn && canKnock) ? this.props.moves.Knock : null)}
                        </tr>
                        <tr>
                            {maybeClickableTD(actionStyle, "FOLD", myTurn ? this.props.moves.Fold : null)}
                        </tr>
                        </tbody>
                    </table>
                    <h4>Rules (see <a href="https://boardgamegeek.com/boardgame/73313/elements">BGG</a>)</h4>
                    <div style={rulesStyle}>
                        <p>Elements, a.k.a. Khmer, is a bluffing and deduction game for two players that contains only
                            sixteen cards, with each player trying to figure out the best time to end the round so that
                            they can win. The goal each round is to have a hand of cards with a higher sum than the
                            opponent, but equal to or less than the sum played to the table.

                            To set up a round, deal six cards face down to each player, then remove the remaining four
                            cards, unseen, from the game. On your turn, you take one of these five actions:</p>

                        <p>PLAY a card from your hand to the table, overlapping any cards previously played and
                            announcing the sum of all revealed cards.</p>
                        <p>DRAW the most recently played card from the table and place it in front of you; this card
                            counts as being in your hand, thereby increasing the sum of your hand and lowering the sum
                            on the table, but you cannot discard or play this card.</p>
                        <p>DISCARD a 6 card from your hand, placing it to the side out of play for this round.</p>
                        <p>KNOCK to end the round and see who wins; you may do this only if the sum of cards in your
                            hand is equal to or less than the sum on the table. The players then compare sums, and
                            whoever has the highest sum (without going over the sum of cards on the table) wins 2
                            points; if the players are tied, the player who knocked loses.</p>
                        <p>FOLD to end the round because you think that you will lose; the opponent wins 1 point.</p>

                        <p>Shuffle all the cards, and redeal; the player who scored in the round starts the next round,
                            and the first player to collect 6 points wins. Alternatively, players can play only a single
                            round to determine the winner, ignoring the FOLD action since that's a sure loser...</p>
                    </div>
                </div>
            </div>
        );
    }
}

function renderCards(arr, onClick) {
    let x = [1, 2, 3];
    let style = facedownCardStyle('brown');
    style.border = '3px solid #555';
    if (onClick === undefined || onClick === null) {
        style.border = '1px solid #555';
    }
    let content = arr.flatMap(c => {
        if (onClick === undefined || onClick === null) {
            return <td style={style}>{c}</td>;
        }
        return <td onClick={() => onClick(c)} style={style}>{c}</td>;
    });
    return <table>
        <tr>
            <td>{content}</td>
        </tr>
    </table>;
}

function maybeClickableTD(style, msg, onClick) {
    if (onClick === undefined || onClick === null) {
        return <td style={style}>{msg}</td>;
    }
    let styleClickable = {
        ...style,
    }
    styleClickable.border = '3px solid #555';
    return <td style={styleClickable} onClick={() => onClick()}>{msg}</td>;
}