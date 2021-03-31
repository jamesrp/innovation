import React from 'react';
import {colors, computePoints} from './Game';


export class LostCitiesBoard extends React.Component {
    render() {

        // TODO: make messaging indicate whether you have to play or draw.
        // TODO: indicate which moves are clickable depending on this.
        let message = '';
        if (this.props.ctx.gameover) {
            if (this.props.ctx.gameover.winner !== undefined) {
                message = " - Player " + this.props.ctx.gameover.winner + " wins!";
                if (this.props.ctx.gameover.winner === this.props.playerID) {
                    message = " - you win!";
                }
            } else {
                message = " - it's a draw!";
            }

        } else if (this.props.playerID === this.props.ctx.currentPlayer) {
            message = ' - YOUR TURN!';
        }

        const handLiStyle = {
            height: '24px',
            lineHeight: '50px',
        };

        let hand = [];
        this.props.G[this.props.playerID].hand.forEach((element, idx, array) => hand.push(
            <li style={handLiStyle}>
                <span style={handStyle(element.color)}>{element.color} {element.number}</span> - play to&nbsp;
                <span onClick={() => this.props.moves.PlayTo(idx, element.color, "middle")} style={buttonStyle()}>middle</span> - play to&nbsp;
                <span onClick={() => this.props.moves.PlayTo(idx, element.color, "me")} style={buttonStyle()}>me</span>
            </li>
        ))

        const cellStyleSide = {
            border: '1px solid #555',
            width: '55px',
            height: '50px',
            lineHeight: '50px',
            textAlign: 'center',
        };

        let opp = "0";
        if (this.props.playerID === "0") {
            opp = "1";
        }

        // TODO: display running point totals per-pile and rolled up.
        // TODO: if a card cannot be played to my pile (b/c of ordering), don't show that move.
        // TODO: Make the hand and board colored.
        let tbody = [];
        // Header(color), opp pile, middle, my pile
        let headers = colors.flatMap(color => <th style={cellStyle(color)}>{color}</th>);
        tbody.push(<tr>
            <td style={cellStyleSide}>-</td>
            {headers}</tr>);
        let oppPile = colors.flatMap(color => <td
            style={cellStyle(color)}>{renderPile(this.props.G.playerPiles[opp][color])}</td>);
        tbody.push(<tr>
            <td style={cellStyleSide}>opp</td>
            {oppPile}</tr>);
        let middlePile = colors.flatMap(color => <td style={cellStyle(color)}
                                                     onClick={() => this.props.moves.DrawFrom(color)}>{renderPile(this.props.G.middlePiles[color])}</td>);
        tbody.push(<tr>
            <td style={cellStyleSide}>middle</td>
            {middlePile}</tr>);
        let myPile = colors.flatMap(color => <td
            style={cellStyle(color)}>{renderPile(this.props.G.playerPiles[this.props.playerID][color])}</td>);
        tbody.push(<tr>
            <td style={cellStyleSide}>me</td>
            {myPile}</tr>);

        let myPoints = computePoints(this.props.G.playerPiles[this.props.playerID]);
        let oppPoints = computePoints(this.props.G.playerPiles[opp]);

        return (
            <div>
                <h3> Player {this.props.playerID} board {message}</h3>
                <table id="board">
                    <tbody>{tbody}</tbody>
                </table>
                <h4>Deck: {this.props.G.secret.deck.length}</h4>
                <span onClick={() => this.props.moves.DrawFrom("deck")}>Draw from deck!</span>
                <h4>Hand</h4>
                <ul>{hand}</ul>
                <h4>Me: {myPoints} / Them: {oppPoints}</h4>
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
}

const colorMapForeground = {
    "white": "black",
    "green": "green",
    "red": "red",
    "blue": "blue",
    "yellow": "gold",
}

// TODO: make this look better. colors are too loud.
function cellStyle(color) {
    return  {
        border: '1px solid #555',
        width: '120px',
        height: '50px',
        lineHeight: '50px',
        textAlign: 'center',
        "background-color": colorMapBackground[color],
    };
}

function handStyle(color) {
    return  {
        // "color": colorMapForeground[color],
        border: '1px solid #555',
        "background-color": colorMapBackground[color],
    };
}

function buttonStyle() {
    return  {
        border: '1px solid #555',
    };
}