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
        this.props.G[this.props.playerID].hand.forEach(element => hand.push(
            <li onClick={() => this.props.moves.Lead(0, this.props.playerID)}>
                {element.name}
            </li>
        ))

        let pool = [];
        this.props.G.public.pool.forEach(element => pool.push(
            <li>
                {element.name}
            </li>
        ))

        let opp = '0';
        if (this.props.playerID === '0') {
            opp = '1';
        }


        return (
            <div>
                <h1> Player {this.props.playerID} board</h1>
                {message}
                <h2>Actions</h2>
                <table id="board">
                    <thead>
                    <tr>
                        <th scope="col">My Hand</th>
                    </tr>
                    <tr>
                        <th scope="col">Pool</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>
                            <ul>{hand}</ul>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <ul>{pool}</ul>
                        </td>
                    </tr>
                    </tbody>
                </table>
                <table id="think">
                    <tbody>
                    <tr>{think}</tr>
                    </tbody>
                </table>
                <h2>Other info</h2>
                <p>Opponent hand size: {this.props.G[opp].hand.length}</p>
                <p>Deck size: {this.props.G.secret.deck.length}</p>
                <h2>Outcome of game:</h2>
                {
                    winner
                }
            </div>
        );
    }
}