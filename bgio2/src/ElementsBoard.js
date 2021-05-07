import React from 'react';
import {boardStyle, tableStyle, cellStyleSide, cellStyleElements, handStyle, facedownCardStyle} from './styles';
import {message, sumArray} from './common';

// TODO: use CSS file for classes, we are duplicating a lot.

export class ElementsBoard extends React.Component {
    render() {
        let msg = message(this.props.ctx, this.props.playerID);
        if (!this.props.ctx.gameover) {
            msg = "";
        }

        let opp = "0";
        if (this.props.playerID === "0") {
            opp = "1";
        }
        let myTurn = (this.props.playerID === this.props.ctx.currentPlayer);
        if (this.props.ctx.gameover) {
            myTurn = false;
        }

        let sideStyle = cellStyleSide('clear', false);
        sideStyle.width = '180px';
        sideStyle.lineHeight = '20px';

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

        let oppBoardTotal = sumArray(this.props.G.playerPiles[opp]);
        let oppTotal = oppBoardTotal.toString() + (this.props.G.playerHandCounts[opp] === 0 ? '' : ' + ?');
        let table = sumArray(this.props.G.table);
        let myTotal = sumArray(this.props.G.playerPiles[this.props.playerID]) + sumArray(this.props.G[this.props.playerID].hand);
        let canKnock = myTotal <= table;

        if (this.props.ctx.gameover) {
            oppFakeHand = this.props.G[opp].hand;
            oppTotal = oppBoardTotal + sumArray(oppFakeHand);
        }

        return (
            <div>
                <div style={boardStyle()}>
                    <h3>Elements {msg}</h3>
                    <table id="board" style={tableStyle()}>
                        <tbody>
                        <tr>
                            <td style={sideStyle}>Opponent hand ({oppTotal})<br/>
                                Match Points: [{this.props.G.playerPoints[opp]}/6]
                            </td>
                            <td style={cellStyleElements('red')}>{renderCardsBasic(oppFakeHand)}</td>
                        </tr>
                        <tr>
                            <td style={sideStyle}>Opponent board</td>
                            <td style={cellStyleElements('red')}>{renderCardsBasic(this.props.G.playerPiles[opp])}</td>
                        </tr>
                        <tr>
                            <td style={sideStyle}>Discards</td>
                            <td style={cellStyleElements('grey')}>{renderCardsBasic(this.props.G.discards)}</td>
                        </tr>
                        <tr>
                            <td style={sideStyle}>Table ({table})</td>
                            <td style={cellStyleElements('grey')}>{renderTable(this.props.G.table, myTurn ? this.props.moves.Draw : null)}</td>
                        </tr>
                        <tr>
                            <td style={sideStyle}>My board</td>
                            <td style={cellStyleElements('yellow')}>{renderCardsBasic(this.props.G.playerPiles[this.props.playerID])}</td>
                        </tr>
                        <tr>
                            <td style={sideStyle}>My hand ({myTotal})<br/>
                                Match Points: {this.props.G.playerPoints[this.props.playerID]}/6
                            </td>
                            <td style={cellStyleElements('yellow')}>{renderMyHand(this.props.G[this.props.playerID].hand, myTurn ? this.props.moves.Play : null, this.props.moves.Discard)}</td>
                        </tr>
                        </tbody>
                    </table>
                    <table id="controls" style={tableStyle()}>
                        <tbody>
                        <tr>
                            <td style={actionHeaderStyle}>Other Actions</td>
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

function renderCardsBasic(arr) {
    let style = facedownCardStyle('brown');
    style.border = '1px solid #555';

    let cards = arr.flatMap(c => <td style={style}>{c}</td>);

    return <table>
        <tr>
            {cards}
        </tr>
    </table>;
}

function renderTable(arr, onClick) {
    let style = facedownCardStyle('brown');
    style.border = '1px solid #555';

    let cards = arr.flatMap(c => <td style={style}>{c}</td>);
    if (cards.length === 0) {
        return <table>
            <tr>
                {cards}
            </tr>
        </table>;
    }

    let smallButtonStyle = facedownCardStyle('purple');
    smallButtonStyle.height = '20px';
    smallButtonStyle.lineHeight = '20px';
    smallButtonStyle.fontSize = 'x-small';
    smallButtonStyle.border = '3px solid #555';
    if (onClick === undefined || onClick === null) {
        smallButtonStyle.border = '1px solid #555';
    }
    let buttons = [];
    for (let i = 0; i < cards.length - 1; i++) {
            buttons.push( <td></td>);
    }
    if (onClick === undefined || onClick === null) {
        buttons.push( <td style={smallButtonStyle}>DRAW</td>);
    } else {
        buttons.push( <td onClick={() => onClick()} style={smallButtonStyle}>DRAW</td>);

    }

    return <table>
        <tr>
            {cards}
        </tr>
        <tr>
            {buttons}
        </tr>
    </table>;
}

function renderMyHand(arr, onClick, onClickDiscard) {
    let style = facedownCardStyle('brown');
    style.border = '3px solid #555';
    if (onClick === undefined || onClick === null) {
        style.border = '1px solid #555';
    }
    let cards = arr.flatMap(c => {
        if (onClick === undefined || onClick === null) {
            return <td style={style}>{c}</td>;
        }
        return <td onClick={() => onClick(c)} style={style}>{c}</td>;
    });
    let smallButtonStyle = facedownCardStyle('purple');
    smallButtonStyle.height = '20px';
    smallButtonStyle.lineHeight = '20px';
    smallButtonStyle.fontSize = 'x-small';
    smallButtonStyle.border = '3px solid #555';
    if (onClick === undefined || onClick === null) {
        smallButtonStyle.border = '1px solid #555';
    }
    let buttons = arr.flatMap(c => {
        if (c !== 6) {
            return <td></td>;
        }
        if (onClick === undefined || onClick === null) {
            return <td style={smallButtonStyle}>DISCARD</td>;
        }
        return <td onClick={() => onClickDiscard(c)} style={smallButtonStyle}>DISCARD</td>;
    });
    return <table>
        <tr>
            {cards}
        </tr>
        <tr>
            {buttons}
        </tr>
    </table>;
}

// function renderCards

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