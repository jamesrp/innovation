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

    } else if (playerID === ctx.currentPlayer) {
        message = ' - MY TURN!';
    }
    return message;
}