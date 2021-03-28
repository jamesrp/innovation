import React from 'react';

export class GloryToRomeBoard extends React.Component {
    onClick() {
        this.props.moves.Think(this.props.playerID);
    }

    render() {
        let winner = '';
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

        let tbody = [];
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
            tbody.push(<tr key={i}>{cells}</tr>);
        }


        let cells = [];
        this.props.G[this.props.playerID].hand.foreach(element => cells.push(
            <td style={cellStyle}>
                {element.name}
            </td>
        ))


        return (
            <div>
                <h1> Player {this.props.playerID} board</h1>
                {message}
                <table id="board">
                    <tbody>{tbody}</tbody>
                </table>
                <table id="hand">
                    <tbody><tr>{cells}</tr></tbody>
                </table>
                {winner}
            </div>
        );
    }
}