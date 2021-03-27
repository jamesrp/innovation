import React from 'react';

export class TicTacToeBoard extends React.Component {
  onClick(id) {
    this.props.moves.ClickCell(id, this.props.playerID);
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
    if (this.props.ctx.phase === "startPhase") {
      let positions = [0, 1, 2];
      if (this.props.playerID === "1") {
        positions = [6, 7, 8];
      }
      const symbols = positions.map(i => this.props.G.cells[i]);
      if (symbols.every(i => i === null)) {
        message = 'Please select a starting position.';
      } else {
        message = 'Waiting for opponent to select starting position.';
      }
    } else {
      if (this.props.playerID === this.props.ctx.currentPlayer) {
        message = 'Please make the next move.';
      } else {
        message = 'Waiting for opponent to make the next move.';
      }
    }

    const cellStyle = {
      border: '1px solid #555',
      width: '50px',
      height: '50px',
      lineHeight: '50px',
      textAlign: 'center',
    };

    let tbody = [];
    for (let i = 0; i < 3; i++) {
      let cells = [];
      for (let j = 0; j < 3; j++) {
        const id = 3 * i + j;
        cells.push(
          <td style={cellStyle} key={id} onClick={() => this.onClick(id)}>
            {this.props.G.cells[id]}
          </td>
        );
      }
      tbody.push(<tr key={i}>{cells}</tr>);
    }

    return (
      <div>
        <h1> Player {this.props.playerID} board</h1>
        {message}
        <table id="board">
          <tbody>{tbody}</tbody>
        </table>
        {winner}
      </div>
    );
  }
}