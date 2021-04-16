export function message(ctx, playerID) {
    let message = '';
    if (ctx.gameover) {
        if (ctx.gameover.winner !== undefined) {
            message = " - Player " + ctx.gameover.winner + " wins!";
            if (ctx.gameover.winner === playerID) {
                message = " - I win!";
            }
        } else {
            message = " - it's a draw!";
        }
    } else if (myTurnP(ctx, playerID)) {
        message = ' - MY TURN!';
    }
    return message;
}

export function myTurnP(ctx, playerID) {
    if (ctx.gameover || playerID === ctx.currentPlayer) {
        return true;
    }
    if (ctx.activePlayers !== null) {
        return ctx.activePlayers.hasOwnProperty(playerID);
    }
    return false;
}

export function sumArray(arr) {
    return arr.reduce((x, y) => x + y, 0);
}