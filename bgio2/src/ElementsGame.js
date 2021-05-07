import {INVALID_MOVE, PlayerView} from 'boardgame.io/core';

import {sumArray} from './common';

// TODO:
// 1) Mark the last card to have moved (anywhere) and highlight it with a blue outline.
// 5) Alternate first player for the individual games of a match. This is probably done in combination with (6),
//    so we can go to a stage where we view stuff, and then when both players exit that stage, the newG
//    will have the next startingPlayerPos.
// 6) Display the final situation of each individual game and give players a chance to view it before reshuffling.

export const Elements = {
    name: 'elements',
    minPlayers: 2,
    maxPlayers: 2,
    setup: mySetup,

    turn: {
        moveLimit: 1,
        order: {
            first: (G, ctx) => G.startingPlayerPos,
            next: (G, ctx) => (ctx.playOrderPos + 1) % ctx.numPlayers,
        }
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
    let tableSum = G.table.reduce((x, y) => x + y);
    let playerSums = {
        "0": sumArray(G["0"].hand) + sumArray(G.playerPiles["0"]),
        "1": sumArray(G["1"].hand) + sumArray(G.playerPiles["1"]),
    }
    if (playerSums[ctx.playerID] > tableSum) {
        return INVALID_MOVE;
    }
    let oppID = opp(ctx.playerID);
    let winner = oppID;
    if (playerSums[oppID] > tableSum || playerSums[oppID] < playerSums[ctx.playerID]) {
        winner = ctx.playerID;
    }
    let newG = mySetup(ctx);
    newG.startingPlayerPos = 1 - G.startingPlayerPos;
    newG.playerPoints = {...G.playerPoints};
    newG.playerPoints[winner] += 2;
    if (newG.playerPoints[winner] >= 6) {
        newG.winner = winner;
    }
    return newG;
}

function Fold(G, ctx) {
    // scoop and give opp 1 point.
    let newG = mySetup(ctx);
    newG.startingPlayerPos = 1 - G.startingPlayerPos;
    newG.playerPoints = {...G.playerPoints};
    newG.playerPoints[opp(ctx.playerID)] += 1;
    if (newG.playerPoints[opp(ctx.playerID)] === 6) {
        newG.winner = opp(ctx.playerID);
    }
    return newG;
}

function mySetup(ctx) {
    let deck = ctx.random.Shuffle(Array(1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 6, 6, 6, 6));
    let initialHandSize = 6;
    return {
        startingPlayerPos:ctx.random.Die(2)-1,
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
        playerPoints: {
            "0": 0,
            "1": 0,
        },
        winner: '',
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