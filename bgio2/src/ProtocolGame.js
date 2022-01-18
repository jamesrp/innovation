import {INVALID_MOVE, PlayerView} from 'boardgame.io/core';

export const Protocol = {
    name: 'protocol',
    minPlayers: 2,
    maxPlayers: 2,
    setup: mySetup,

    turn: {
        minMoves: 1,
        maxMoves: 1,
    },

    moves: {
        doMove: (G, ctx, moveData) => {
            G.data[moveData.src] -= 1;
            G.data[moveData.dst] += 1;
        },
    },

    endIf: (G, ctx) => false,
};

function mySetup(ctx) {
    let G = {
        data: [8, 12, 16, 4, 9],
    };
    return G;
}