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

        let hand = [];
        this.props.G[this.props.playerID].hand.forEach(element => hand.push(
            <li onClick={() => this.props.moves.MeldAction(element.id)}>
                {element.name}
            </li>
        ))


        let board = [];
        this.props.G[this.props.playerID].board.forEach(element => board.push(
            <li onClick={() => this.props.moves.DogmaAction(element.id)}>
                {element.name}
            </li>
        ))

        // TODO: need clickCard everywhere.
        let score = [];
        this.props.G[this.props.playerID].score.forEach(element => score.push(
            <li>
                {element.name}
            </li>
        ))

        let achievements = [];
        this.props.G[this.props.playerID].achievements.forEach(element => achievements.push(
            <li>
                {element.name}
            </li>
        ))

        let log = [];
        this.props.G.log.forEach(element => log.push(
            <li>
                {element}
            </li>
        ))
        let decks = [];
        Object.keys(this.props.G.decks).forEach(element => decks.push(
            <li>
                Age {element} : {this.props.G.decks[element].length} cards left
            </li>
        ))

        return (
            <div>
                <h1> Player {this.props.playerID} board</h1>
                {message}
                <h4>My Hand</h4>
                <ul>{hand}</ul>
                {/*<h4>My board (my top age = {topAge(this.props.G, this.props.ctx.playerID)})</h4>*/}
                <h4>My board</h4>
                <ul>{board}</ul>
                <h4>My Score</h4>
                <ul>{score}</ul>
                <h4>My achievements</h4>
                <ul>{achievements}</ul>
                <h4>Decks</h4>
                <ul>{decks}</ul>
                <h4>Log</h4>
                <ul>{log}</ul>
            </div>
        );
    }
}