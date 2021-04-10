import React from 'react';
import {colors, computePoints, canPlay} from './LostCitiesGame';


export class LostCitiesBoard extends React.Component {
    render() {

        // TODO: make messaging indicate whether you have to play or draw.
        // TODO: indicate which moves are clickable depending on this.
        let message = '';
        let myOption = '';
        if (this.props.ctx.gameover) {
            if (this.props.ctx.gameover.winner !== undefined) {
                message = " - Player " + this.props.ctx.gameover.winner + " wins!";
                if (this.props.ctx.gameover.winner === this.props.playerID) {
                    message = " - I win!";
                }
            } else {
                message = " - it's a draw!";
            }

        } else if (this.props.playerID === this.props.ctx.currentPlayer) {
            myOption = 'play';
            if (this.props.ctx.numMoves === 1) {
                myOption = 'draw';
            }
            message = ' - MY TURN!';
        }

        // TODO: feel like I saw a bug where the color didn't refresh
        // even though the cardname changed, after playing pos1 and drawing
        // a new card that ended up being pos1.
        let hand = [];
        this.props.G[this.props.playerID].hand.forEach((element, idx, array) => {
            let validPlay = canPlay(this.props.G.playerPiles[this.props.playerID][element.color], element);
            hand.push(
                <tr>
                    <td style={handStyle(element.color)}>{element.color} {element.number}</td>
                    <td onClick={() => this.props.moves.PlayTo(idx, element.color, "middle")}
                        style={buttonStyle(myOption === 'play')}>discard
                    </td>
                    <td onClick={() => this.props.moves.PlayTo(idx, element.color, "me")}
                        style={buttonStyle(myOption === 'play' && validPlay)}>play
                    </td>
                </tr>
            )
        });

        let opp = "0";
        if (this.props.playerID === "0") {
            opp = "1";
        }

        let myPoints = computePoints(this.props.G.playerPiles[this.props.playerID]);
        let oppPoints = computePoints(this.props.G.playerPiles[opp]);

        // TODO: display running point totals per-pile and rolled up.
        // TODO: if a card cannot be played to my pile (b/c of ordering), don't show that move.
        let tbody = [];
        // Header(color), opp pile, middle, my pile
        let headers = colors.flatMap(color => <th style={cellStyle(color)}>{color}</th>);
        tbody.push(<tr>
            <td style={cellStyleSide('brown', (myOption === 'draw'))}
                onClick={() => this.props.moves.DrawFrom("deck")}> Deck: {this.props.G.deckSize}
            </td>
            {headers}</tr>);
        let oppPile = colors.flatMap(color => <td
            style={cellStyle(color)}>{renderPile(this.props.G.playerPiles[opp][color])}</td>);
        tbody.push(<tr>
            <td style={cellStyleSide('clear', false)}>opp: {oppPoints}</td>
            {oppPile}</tr>);
        let middlePile = colors.flatMap(color => <td
            style={cellStyleClickable(color, this.props.G.middlePiles[color].length !== 0 && (myOption === 'draw'))}
            onClick={() => this.props.moves.DrawFrom(color)}>{renderPile(this.props.G.middlePiles[color])}</td>);
        tbody.push(<tr>
            <td style={cellStyleSide('clear', false)}>middle</td>
            {middlePile}</tr>);
        let myPile = colors.flatMap(color => <td
            style={cellStyle(color)}>{renderPile(this.props.G.playerPiles[this.props.playerID][color])}</td>);
        tbody.push(<tr>
            <td style={cellStyleSide('clear', false)}>me: {myPoints}</td>
            {myPile}</tr>);


        return (
            <div>
                <div style={boardStyle()}>
                    <h3> Player {this.props.playerID} board {message}</h3>
                    <table id="board" style={tableStyle()}>
                        <tbody>{tbody}</tbody>
                    </table>
                    <h4>My Hand</h4>
                    <table id="hand" style={tableStyle()}>
                        <tbody>{hand}</tbody>
                    </table>
                </div>
            </div>
        );
    }
}

function renderPile(pile) {
    return pile.flatMap(card => card.number).join(",");
}

const colorMapBackground = {
    "white": "#dedeeef",
    "green": "#b5e7a0",
    "red": "#eea29a",
    "blue": "#92a8d1",
    "yellow": "#ffef96",
    "brown": "#dac292",
    "clear": "#cccccc",
}

function cellStyle(color) {
    return {
        border: '1px solid #555',
        width: '100px',
        height: '50px',
        lineHeight: '50px',
        textAlign: 'center',
        "background-color": colorMapBackground[color],
    };
}

function cellStyleClickable(color, clickable) {
    let s = cellStyle(color);
    if (clickable) {
        s.border = '3px solid #555';
    }
    return s;
}

function cellStyleSide(color, clickable) {
    let s = cellStyle(color);
    s.width = '80px';
    if (clickable) {
        s.border = '3px solid #555';
    }
    return s;
}

function handStyle(color) {
    return {
        border: '1px solid #555',
        width: '150px',
        height: '25px',
        lineHeight: '25px',
        textAlign: 'center',
        "background-color": colorMapBackground[color],
    };
}

function buttonStyle(clickable) {
    let border = '1px solid #555';
    if (clickable) {
        border = '3px solid #555';
    }
    return {
        border: border,
        width: '120px',
        height: '25px',
        lineHeight: '25px',
        textAlign: 'center',
    };
}

function boardStyle() {
    return {
        textAlign: 'center',
    };
}

function tableStyle() {
    return {
        margin: 'auto',
    };
}