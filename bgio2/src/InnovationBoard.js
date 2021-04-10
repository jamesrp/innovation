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

        // Depending on the phase, make different things clickable.
        // TODO: need to display other player's board etc.
        if (this.props.ctx.phase === "resolveStack") {
            let menu = '';
            // TODO bug - shouldn't stack always have something in it if we have it?
            // if (this.props.G.stack.length !== 0) {
            //     let topStackable = this.props.G.stack[this.props.G.stack - 1];
            //     if (topStackable.menuOptions !== undefined) {
            //         menu = renderList(topStackable.menuOptions, "Menu options", x => x, element => this.props.moves.ClickMenu(element));
            //     }
            // }
            return (
                <div>
                    <h1> Player {this.props.playerID} board</h1>
                    {message}
                    <h4>Resolving stack...</h4>
                    {menu}
                    {renderCardList(this.props.G[this.props.playerID].hand, "My hand", element => this.props.moves.ClickCard(element.id))}
                    {renderCardList(this.props.G[this.props.playerID].board, "My board", element => this.props.moves.ClickCard(element.id))}
                    {renderCardList(this.props.G[this.props.playerID].achievements, "My achievements")}
                    {renderCardList(this.props.G.achievements, "Unclaimed achievements", element => this.props.moves.ClickCard(element.id))}
                    {renderCardList(this.props.G[this.props.playerID].score, "My score", element => this.props.moves.ClickCard(element.id))}
                    {renderList(this.props.G.stack, "The Stack", x => x.name + "[player " + x.playerID + "]")}
                    {renderList(this.props.G.log, "Log", x => x)}
                    <h4>Decks</h4>
                    <ul>{decks}</ul>
                </div>
            );
        }
        return (
            <div>
                <h1> Player {this.props.playerID} board</h1>
                {message}
                <h4 onClick={() => this.props.moves.DrawAction()}>Click to draw!</h4>
                {renderCardList(this.props.G[this.props.playerID].hand, "My hand", element => this.props.moves.MeldAction(element.id))}
                {renderCardList(this.props.G[this.props.playerID].board, "My board", element => this.props.moves.DogmaAction(element.id))}
                {renderCardList(this.props.G[this.props.playerID].achievements, "My achievements")}
                {renderCardList(this.props.G.achievements, "Unclaimed achievements", element => this.props.moves.AchieveAction(element.id))}
                {renderCardList(this.props.G[this.props.playerID].score, "My score")}
                {renderList(this.props.G.stack, "The Stack", x => x.name + "[player " + x.playerID + "]")}
                {renderList(this.props.G.log, "Log", x => x)}
                <h4>Decks</h4>
                <ul>{decks}</ul>
            </div>
        );
    }
}

function renderCardList(arr, name, onClickFn) {
    return renderList(arr, name, c => c.name, onClickFn);
}

function renderList(arr, name, nameFn, onClickFn) {
    let lis = [];
    arr.forEach(element => {
        if (onClickFn === undefined) {
            lis.push(
                <li>
                    {nameFn(element)}
                </li>
            )
        } else {
            lis.push(
                <li onClick={() => onClickFn(element)}>
                    {nameFn(element)}
                </li>
            )
        }
    })
    return <div>
        <h4>{name}</h4>
        <ul>{lis}</ul>
    </div>
}

