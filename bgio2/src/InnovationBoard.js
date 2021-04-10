import React from 'react';

// import {topAge} from './InnovationGame';

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

        } else if ("startPhase" === this.props.ctx.phase) {
            message = '';
            if (Object.keys(this.props.ctx.activePlayers).includes(this.props.playerID)) {
                message = ' - MY TURN!';
            }
        } else if (this.props.playerID === this.props.ctx.currentPlayer) {
            message = ' - MY TURN!';
        }

        let decks = [];
        Object.keys(this.props.G.decks).forEach(element => decks.push(
            <li>
                Age {element} : {this.props.G.decks[element].length} cards left
            </li>
        ))
        // TODO: need clickCard everywhere.
        return (
            <div>
                <h1> Player {this.props.playerID} board</h1>
                {message}
                <h4 onClick={() => this.props.moves.DrawAction()}>Click to draw!</h4>
                {renderList(this.props.G[this.props.playerID].hand, "My hand", element => this.props.moves.MeldAction(element.id))}
                {renderList(this.props.G[this.props.playerID].board, "My board", element => this.props.moves.DogmaAction(element.id))}
                {renderList(this.props.G[this.props.playerID].achievements, "My achievements")}
                {renderList(this.props.G.achievements, "Unclaimed achievements",element => this.props.moves.AchieveAction(element.id))}
                {renderList(this.props.G[this.props.playerID].score, "My score")}
                {renderList(this.props.G.log, "Log")}
                <h4>Decks</h4>
                <ul>{decks}</ul>
            </div>
        );
    }
}

function renderList(arr, name, onClickFn) {
    let lis = [];
    arr.forEach(element => {
        if (onClickFn === undefined) {
            lis.push(
                <li>
                    {element.name}
                </li>
            )
        } else {
            lis.push(
                <li onClick={() => onClickFn(element)}>
                    {element.name}
                </li>
            )
        }
    })
    return <div>
        <h4>{name}</h4>
        <ul>{lis}</ul>
    </div>
}

