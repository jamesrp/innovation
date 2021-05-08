import {INVALID_MOVE, PlayerView} from 'boardgame.io/core';

import {sumArray} from './common';

export const Elements = {
    name: 'elements',
    minPlayers: 2,
    maxPlayers: 2,
    setup: mySetup,

    phases: {
        review: {
            next: "play",
            endIf: (G, ctx) => (G.numToReview === 0),
            turn: {
                moveLimit: 1,
            },
            stages: {
                reviewStage: {},
            },
            moves: {
                Okay: {
                    move: Okay,
                    client: false,
                }
            },
            onEnd: (G, ctx) => {
                G.startingPlayerPos = 1 - G.startingPlayerPos;
                let newG = mySetup(ctx);
                ["0", "1", "table", "playerPiles", "playerHandCounts"].forEach(fieldName => {
                    G[fieldName] = newG[fieldName];
                });
            },
        },
        play: {
            start: true,
            next: "review",
            endIf: (G, ctx) => (G.numToReview > 0),
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
        },
    },

    playerView: stripSecrets,

    endIf: (G, ctx) => {
        if (G.winner !== '') {
            return {winner: G.winner};
        }
    },
};

function Okay(G, ctx) {
    G.numToReview -= 1;
}

function Play(G, ctx, num) {
    let index = G[ctx.playerID].hand.indexOf(num);
    if (index === -1) {
        return INVALID_MOVE;
    }
    G.table.push(G[ctx.playerID].hand.splice(index, 1)[0]);
    G.playerHandCounts[ctx.playerID] -= 1;
    G.lastMove = "play";
}

function Draw(G, ctx) {
    if (G.table.length === 0) {
        return INVALID_MOVE;
    }
    G.playerPiles[ctx.playerID].push(G.table.pop());
    G.lastMove = ctx.playerID + "draw";
}

function Discard(G, ctx) {
    let index = G[ctx.playerID].hand.indexOf(6);
    if (index === -1) {
        return INVALID_MOVE;
    }
    G.discards.push(G[ctx.playerID].hand.splice(index, 1)[0]);
    G.playerHandCounts[ctx.playerID] -= 1;
    G.lastMove = "discard"
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
    adjustWinner(G, ctx, winner, 2);
}

function Fold(G, ctx) {
    // scoop and give opp 1 point.
    adjustWinner(G, ctx, opp(ctx.playerID), 1);
}

function adjustWinner(G, ctx, winner, points) {
    G.playerPoints[winner] += points;
    if (G.playerPoints[winner] >= 6) {
        G.winner = winner;
    } else {
        G.numToReview = 2;
        ctx.events.setActivePlayers({all: 'reviewStage', moveLimit: 1});
    }
}


function mySetup(ctx) {
    let deck = ctx.random.Shuffle(Array(1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 6, 6, 6, 6));
    let initialHandSize = 6;
    return {
        lastMove: "",
        numToReview: 0,
        startingPlayerPos: ctx.random.Die(2) - 1,
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
    if (ctx.gameover || ctx.phase === "review") {
        return G;
    }
    return PlayerView.STRIP_SECRETS(G, ctx, playerID);
}