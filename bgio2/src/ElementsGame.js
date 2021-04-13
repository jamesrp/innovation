import {INVALID_MOVE, PlayerView} from 'boardgame.io/core';

import {sumArray} from './common';

export const Elements = {
    name: 'elements',
    minPlayers: 2,
    maxPlayers: 2,
    setup: mySetup,

    turn: {
        moveLimit: 1,
    },

    moves: {
        Play, Draw, Discard, Fold, Knock: {
            move: Knock,
            client: false,
        }
    },

    playerView: stripSecrets,

    endIf: (G, ctx) => {
        if (G.winner !== '') {
            return {winner: G.winner};
        }
    },
};

function Play(G, ctx, num) {
    let index = G[ctx.playerID].hand.indexOf(num);
    if (index === -1) {
        return INVALID_MOVE;
    }
    G.table.push(G[ctx.playerID].hand.splice(index, 1)[0]);
    G.playerHandCounts[ctx.playerID] -= 1;
}

function Draw(G, ctx) {
    if (G.table.length === 0) {
        return INVALID_MOVE;
    }
    G.playerPiles[ctx.playerID].push(G.table.pop());
}

function Discard(G, ctx) {
    let index = G[ctx.playerID].hand.indexOf(6);
    if (index === -1) {
        return INVALID_MOVE;
    }
    G.discards.push(G[ctx.playerID].hand.splice(index, 1)[0]);
    G.playerHandCounts[ctx.playerID] -= 1;
}

function Knock(G, ctx) {
    // TODO: check victory. If tied, knocker loses. Winner gets 2 points.
    let tableSum = G.table.reduce((x, y) => x + y);
    let playerSums = {
        "0": sumArray(G["0"].hand) + sumArray(G.playerPiles["0"]),
        "1": sumArray(G["1"].hand) + sumArray(G.playerPiles["1"]),
    }
    if (playerSums[ctx.playerID] > tableSum) {
        return INVALID_MOVE;
    }
    G.winnerPoints = 2;
    let oppID = opp(ctx.playerID);
    if (playerSums[oppID] > tableSum) {
        G.winner = ctx.playerID;
        return;
    }
    if (playerSums[oppID] >= playerSums[ctx.playerID]) {
        G.winner = oppID;
        return;
    }
    G.winner = ctx.playerID;
}

function Fold(G, ctx) {
    // scoop and give opp 1 point.
    G.winner = opp(ctx.playerID);
    G.winnerPoints = 1;
}

function mySetup(ctx) {
    let deck = ctx.random.Shuffle(Array(1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 6, 6, 6, 6));
    let initialHandSize = 6;
    return {
        "0": {
            hand: deck.splice(0, initialHandSize),
        },
        "1": {
            hand: deck.splice(0, initialHandSize),
        },
        table: [],
        discards: [],
        playerPiles: {
            "0": [],
            "1": [],
        },
        playerHandCounts: {
            "0": initialHandSize,
            "1": initialHandSize,
        },
        winner: '',
        winnerPoints: 0,
    };
}

function opp(playerID) {
    let x = "0";
    if (playerID === "0") {
        x = "1";
    }
    return x;
}

function stripSecrets(G, ctx, playerID) {
    if (ctx.gameover) {
        return G;
    }
    return PlayerView.STRIP_SECRETS(G, ctx, playerID);
}