import React from 'react';

export class MinimalReproBoard extends React.Component {
    render() {

        let message = '';
        if (this.props.playerID === this.props.ctx.currentPlayer) {
            message = 'Please make the next move.';
        } else {
            message = 'Waiting for opponent to make the next move.';
        }


        let log = [];
        this.props.G[this.props.playerID].log.forEach((element, index, array) => log.push(
            <li>
                {element}
            </li>
        ))

        return (
            <div>
                <h3> Player {this.props.playerID} board</h3>
                {message}
                <h4>Actions</h4>
                <ul>
                    <li onClick={() => this.props.moves.MakeMove(0)}>Press 0</li>
                    <li onClick={() => this.props.moves.MakeMove(1)}>Press 1</li>
                    <li onClick={() => this.props.moves.MakeMove(2)}>Press 2</li>
                    <li onClick={() => this.props.moves.MakeMove(3)}>Press 3</li>
                </ul>
                <h4>Log</h4>
                <ul>{log}</ul>
            </div>
        );
    }
}