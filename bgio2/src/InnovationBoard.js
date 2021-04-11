import React from 'react';

import {topAge, colors, ages} from './InnovationGame';
import {cellStyle, cellStyleClickable, cellStyleSide, facedownCardStyle, tableStyle} from "./styles";

export class InnovationBoard extends React.Component {
    render() {
        let message = '';
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
            message = ' - MY TURN!';
        }

        let decks = [];
        ages.forEach(element => decks.push(
            <li>
                Age {element} : {this.props.G.decks[element].length} cards left
            </li>
        ))

        let opp = "0";
        if (this.props.playerID === "0") {
            opp = "1";
        }

        let tbody = [];
        // Opponent hand, opp tableau, decks, my tableau, my hand, game log.
        //  -- stack off to the side of decks if present.
        let oppHandContents = this.props.G[opp].hand.flatMap(c => <td style={facedownCardStyle('brown')}>{c.age}</td>);
        let decksA = Array.of(1,2,3,4,5).flatMap(age => <td style={facedownCardStyle('brown')}> Age {age} [{this.props.G.decks[age].length}]</td>);
        let decksB = Array.of(6,7,8,9,10).flatMap(age => <td style={facedownCardStyle('brown')}> Age {age} [{this.props.G.decks[age].length}]</td>);
        tbody.push(<tr><td style={cellStyleSide('clear', false)}>Opp hand</td><td colspan="5"><table><tr><td>{oppHandContents}</td></tr></table></td></tr>);
        tbody.push(<tr><td style={cellStyleSide('clear', false)}>Decks</td>{decksA}</tr>);
        tbody.push(<tr><td style={cellStyleSide('clear', false)}>Decks</td>{decksB}</tr>);

        // Depending on the phase, make different things clickable.
        // TODO: need to display other player's board etc.
        if (this.props.ctx.phase === "resolveStack") {
            let menu = '';
            // TODO bug - shouldn't stack always have something in it if we have it?
            // if (this.props.G.stack.length !== 0) {
            //     let topStackable = this.props.G.stack[this.props.G.stack - 1];
            //     if (topStackable.menuOptions !== undefined) {
            //         menu = renderList(topStackable.menuOptions, "Menu options", x => x, element => this.props.moves.ClickMenu(element));
            //     }
            // }
                    menu = renderList(Array.of("yes", "no"), "Menu options", x => x, element => this.props.moves.ClickMenu(element));

            return (
                <div>
                    <h1> Player {this.props.playerID} board</h1>
                    {message}
                    <h4>Resolving stack...</h4>
                    {renderList(this.props.G.stack, "The Stack", x => x.name + "[player " + x.playerID + "]")}
                    {menu}
                    {renderCardList(this.props.G[this.props.playerID].hand, "My hand", element => this.props.moves.ClickCard(element.id))}
                    {renderTableau(this.props.G[this.props.playerID].board, "My board", element => this.props.moves.ClickCard(element.id))}
                    {renderTableau(this.props.G[opp].board, "Opp board", element => this.props.moves.ClickCard(element.id))}
                    {renderCardList(this.props.G[this.props.playerID].achievements, "My achievements")}
                    {renderCardList(this.props.G.achievements, "Unclaimed achievements", element => this.props.moves.ClickCard(element.id))}
                    {renderCardList(this.props.G[this.props.playerID].score, "My score", element => this.props.moves.ClickCard(element.id))}
                    {renderList(this.props.G.log, "Log", x => x)}
                    <h4>Decks</h4>
                    <ul>{decks}</ul>
                </div>
            );
        }
        return (
            <div>
                <h3> Player {this.props.playerID} board {message}</h3>
                <table style={tableStyle()}>
                    <tbody>{tbody}</tbody>
                </table>
                <h4 onClick={() => this.props.moves.DrawAction()}>Click to draw!</h4>
                {renderCardList(this.props.G[this.props.playerID].hand, "My hand", element => this.props.moves.MeldAction(element.id))}
                {renderTableau(this.props.G[this.props.playerID].board, "My board", element => this.props.moves.DogmaAction(element.id))}
                {renderTableau(this.props.G[opp].board, "Opp board")}
                {renderCardList(this.props.G[this.props.playerID].achievements, "My achievements")}
                {renderCardList(this.props.G.achievements, "Unclaimed achievements", element => this.props.moves.AchieveAction(element.id))}
                {renderCardList(this.props.G[this.props.playerID].score, "My score")}
                {renderList(this.props.G.log, "Log", x => x)}
                <h4>Decks</h4>
                <ul>{decks}</ul>
            </div>
        );
    }
}

function renderCardList(arr, name, onClickFn) {
    return renderList(arr, name, c => c.name, onClickFn);
}

function renderList(arr, name, nameFn, onClickFn) {
    let lis = [];
    arr.forEach(element => {
        if (onClickFn === undefined) {
            lis.push(
                <li>
                    {nameFn(element)}
                </li>
            )
        } else {
            lis.push(
                <li onClick={() => onClickFn(element)}>
                    {nameFn(element)}
                </li>
            )
        }
    })
    return <div>
        <h4>{name}</h4>
        <ul>{lis}</ul>
    </div>
}

function renderTableau(board, msg, onClickFn) {
    return <div>
        <p>{msg}</p>
        <ul>
            <li>{renderCardList(board['green'], 'green', onClickFn)}</li>
            <li>{renderCardList(board['yellow'], 'yellow', onClickFn)}</li>
            <li>{renderCardList(board['red'], 'red', onClickFn)}</li>
            <li>{renderCardList(board['blue'], 'blue', onClickFn)}</li>
            <li>{renderCardList(board['purple'], 'purple', onClickFn)}</li>
        </ul>
    </div>
}