import React from 'react';

export class GloryToRomeBoard extends React.Component {
    render() {
        let winner = 'Game not finished yet.';
        if (this.props.ctx.gameover) {
            winner =
                this.props.ctx.gameover.winner !== undefined ? (
                    <div id="winner">Winner: {this.props.ctx.gameover.winner}</div>
                ) : (
                    <div id="winner">Draw!</div>
                );
        }
        let message = '';
        if (this.props.playerID === this.props.ctx.currentPlayer) {
            message = 'Please make the next move.';
        } else {
            message = 'Waiting for opponent to make the next move.';
        }

        let stack = [];
        // For cards in hand, these are always Play commands for now.
        this.props.G.public[this.props.playerID].cardPlayed.forEach((element, index, array) => stack.push(
            <li>
                {element.name}
            </li>
        ))

        let hand = [];
        // For cards in hand, these are always Play commands for now.
        this.props.G[this.props.playerID].hand.forEach((element, index, array) => hand.push(
            <li onClick={() => this.props.moves.Play(index, this.props.playerID)}>
                {element.name}
            </li>
        ))

        let pool = [];
        this.props.G.public.pool.forEach((element, index, array) => pool.push(
            <li onClick={() => this.props.moves.ResolveCardPlayed("pool", index, this.props.playerID)}>
                {element.name}
            </li>
        ))

        // is there a bug rendering the stockpile?
        let stockpile = [];
        this.props.G.public[this.props.playerID].stockpile.forEach((element, index, array) => stockpile.push(
            <li onClick={() => this.props.moves.ResolveCardPlayed("stockpile", index, this.props.playerID)}>
                {element.name}
            </li>
        ))

        let vault = [];
        this.props.G.public[this.props.playerID].vault.forEach((element, index, array) => vault.push(
            <li onClick={() => this.props.moves.ResolveCardPlayed("vault", index, this.props.playerID)}>
                {element.name}
            </li>
        ))

        return (
            <div>
                <h3> Player {this.props.playerID} board - phase: {this.props.ctx.phase}</h3>
                {message}
                <h4>Actions</h4>
                <ul>
                    <li onClick={() => this.props.moves.Think(this.props.playerID)}>
                        Think
                    </li>
                    <li onClick={() => this.props.moves.Pass()}>
                        Pass
                    </li>
                </ul>
                <h4>On the Stack</h4>
                <ul>{stack}</ul>
                <h4>My Hand</h4>
                <ul>{hand}</ul>
                <h4>My Stockpile</h4>
                <ul>{stockpile}</ul>
                <h4>My Vault</h4>
                <ul>{vault}</ul>
                <h4>The Pool</h4>
                <ul>{pool}</ul>

                <h4>Other info</h4>
                <li>Deck size: {this.props.G.secret.deck.length}</li>
                <h4>Outcome of game:</h4>
                {
                    winner
                }
            </div>
        );
    }
}