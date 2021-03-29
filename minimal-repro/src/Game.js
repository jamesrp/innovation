import {INVALID_MOVE} from 'boardgame.io/core';


export const MinimalRepro = {
    setup: mySetup,

    moves: {
        MakeMove,
    },

};

function MakeMove(G, ctx, x) {
    G[ctx.playerID].log.push(ctx.turn + ": " + x);
    ctx.events.endTurn({next: ctx.playOrder[x]});
}


function mySetup(ctx) {
    let G = {};
    for (let i = 0; i < ctx.numPlayers; i++) {
        G[i.toString()] = {
            log: Array(0),
        };
    }
    return G;
}

