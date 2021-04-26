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

        let cardPlayed = [];
        this.props.G.public[this.props.playerID].cardPlayed.forEach((element, index, array) => cardPlayed.push(
            <span>
                {element.name}
            </span>
        ))

        let stack = [];
        this.props.G.stack.forEach((element, index, array) => stack.push(
            <li>
                {element.name}
            </li>
        ))

        let hand = [];
        // For leading/following, Play. Otherwise, ClickCard.
        if (this.props.ctx.phase === 'lead' || this.props.ctx.phase === 'follow') {
            this.props.G[this.props.playerID].hand.forEach((element, index, array) => hand.push(
                <li onClick={() => this.props.moves.Play(index, this.props.playerID)}>
                    {element.name} - {element.id}
                </li>
            ))
        } else {
            this.props.G[this.props.playerID].hand.forEach((element, index, array) => hand.push(
                <li onClick={() => this.props.moves.ClickCard(element.id)}>
                    {element.name} - {element.id}
                </li>
            ))
        }


        let pool = [];
        this.props.G.public.pool.forEach((element, index, array) => pool.push(
            <li onClick={() => this.props.moves.ClickCard(element.id)}>
                {element.name} - {element.id}
            </li>
        ))

        let stockpile = [];
        this.props.G.public[this.props.playerID].stockpile.forEach((element, index, array) => stockpile.push(
            <li onClick={() => this.props.moves.ClickCard(element.id)}>
                {element.name} - {element.id}
            </li>
        ))

        let clients = [];
        this.props.G.public[this.props.playerID].clients.forEach((element, index, array) => clients.push(
            <li onClick={() => this.props.moves.ClickCard(element.id)}>
                {element.name} - {element.id}
            </li>
        ))
        this.props.G.public[this.props.playerID].clientsTapped.forEach((element, index, array) => clients.push(
            <li onClick={() => this.props.moves.ClickCard(element.id)}>
                {element.name} - {element.id} [tapped]
            </li>
        ))

        let buildings = [];
        this.props.G.public[this.props.playerID].buildings.forEach(element => {
            let card = element.card;
            if (element.completed) {
                buildings.push(
                    <li onClick={() => this.props.moves.ClickCard(element.id)}>
                        {card.name} - {card.id}
                    </li>
                )
            } else {
                buildings.push(
                    <li onClick={() => this.props.moves.ClickCard(element.id)}>
                        {card.name} - {card.id} [{element.material.length} / {card.points}]
                    </li>
                )
            }

        })

        let vault = [];
        this.props.G.public[this.props.playerID].vault.forEach((element, index, array) => vault.push(
            <li onClick={() => this.props.moves.ClickCard(element.id)}>
                {element.name} - {element.id}
            </li>
        ))

        let log = [];
        this.props.G.log.forEach(elem => log.push(<li>{elem}</li>));

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
                    <li onClick={() => this.props.moves.ClickMenu("no")}>
                        Decline
                    </li>
                </ul>
                <h4>Card led/followed: {cardPlayed}</h4>
                <h4>The Stack</h4>
                <ul>{stack}</ul>
                <h4>My Hand</h4>
                <ul>{hand}</ul>
                <h4>My Clients</h4>
                <ul>{clients}</ul>
                <h4>My Buildings</h4>
                <ul>{buildings}</ul>
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
                <h4>Log</h4>
                <ul>{log}</ul>
            </div>
        );
    }
}