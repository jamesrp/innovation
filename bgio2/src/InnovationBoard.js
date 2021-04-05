import React from 'react';

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
    // For cards in hand, these are always ChooseOpener commands for now.
    // TODO: if we are out of chooseOpener, use different fn.
    this.props.G[this.props.playerID].hand.forEach(element => hand.push(
        <li onClick={() => this.props.moves.ChooseOpener(element.id)}>
          {element.name}
        </li>
    ))

    let board = [];
    // For cards in hand, these are always ChooseOpener commands for now.
    // TODO: if we are out of chooseOpener, use different fn.
    this.props.G[this.props.playerID].board.forEach(element => board.push(
        <li>
          {element.name}
        </li>
    ))

    return (
      <div>
        <h1> Player {this.props.playerID} board</h1>
        {message}
        <h4>My Hand</h4>
        <ul>{hand}</ul>
        <h4>My board</h4>
        <ul>{board}</ul>
      </div>
    );
  }
}