import React from 'react';

export class GloryToRomeBoard extends React.Component {
    onClick() {
        this.props.moves.Think(this.props.playerID);
    }

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


        const cellStyle = {
            border: '1px solid #555',
            width: '50px',
            height: '50px',
            lineHeight: '50px',
            textAlign: 'center',
        };

        let think = [];
        for (let i = 0; i < 1; i++) {
            let cells = [];
            for (let j = 0; j < 1; j++) {
                const id = 1 * i + j;
                cells.push(
                    <td style={cellStyle} key={id} onClick={() => this.onClick()}>
                        Think
                    </td>
                );
            }
            think.push(<tr key={i}>{cells}</tr>);
        }


        let hand = [];

        // For cards in hand, these are always Play commands for now.
        this.props.G[this.props.playerID].hand.forEach((element, index, array )=> hand.push(
            <li onClick={() => this.props.moves.Play(index, this.props.playerID)}>
                {element.name}
            </li>
        ))

        let pool = [];
        this.props.G.public.pool.forEach((element, index, array ) => pool.push(
            <li onClick={() => this.props.moves.ResolveCardPlayed("pool", index, this.props.playerID)}>
                {element.name}
            </li>
        ))

        let stockpile = [];
        this.props.G.public[this.props.playerID].stockpile.forEach((element, index, array ) => pool.push(
            <li onClick={() => this.props.moves.ResolveCardPlayed("stockpile", index, this.props.playerID)}>
                {element.name}
            </li>
        ))

        let vault = [];
        this.props.G.public[this.props.playerID].vault.forEach((element, index, array ) => pool.push(
            <li onClick={() => this.props.moves.ResolveCardPlayed("vault", index, this.props.playerID)}>
                {element.name}
            </li>
        ))

        let opp = '0';
        if (this.props.playerID === '0') {
            opp = '1';
        }


        return (
            <div>
                <h3> Player {this.props.playerID} board</h3>
                {message}
                <h4>Actions</h4>
                <table id="think">
                    <tbody>
                    <tr>{think}</tr>
                    </tbody>
                </table>
                <h4>My Hand</h4>
                <ul>{hand}</ul>
                <h4>My Stockpile</h4>
                <ul>{stockpile}</ul>
                <h4>My Vault</h4>
                <ul>{vault}</ul>
                <h4>The Pool</h4>
                <ul>{pool}</ul>

                <h4>Other info</h4>
                <li>Opponent hand size: {this.props.G[opp].hand.length}</li>
                <li>Deck size: {this.props.G.secret.deck.length}</li>
                <h4>Outcome of game:</h4>
                {
                    winner
                }
            </div>
        );
    }
}