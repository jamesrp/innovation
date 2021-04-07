import {INVALID_MOVE} from 'boardgame.io/core';

const acceleratedSetup = true; // Give each player a bunch of stuff to speed up debugging.

export const Innovation = {
    name: 'innovation',
    minPlayers: 2,
    maxPlayers: 4,
    setup: mySetup,

    moves: {
        ChooseOpener
    },

    phases: {
        startPhase: {
            moves: {ChooseOpener},
            stages: {
                myFirstStage: {
                    moves: {ChooseOpener},
                },
            },
            start: true,
        },

        mainPhase: {
            moves: {DrawAction, MeldAction, AchieveAction, DogmaAction},
            turn: {
                order: {
                    // Get the initial value of playOrderPos.
                    // This is called at the beginning of the phase.
                    first: (G, ctx) => 0,

                    // Get the next value of playOrderPos.
                    // This is called at the end of each turn.
                    // The phase ends if this returns undefined.
                    next: (G, ctx) => {
                        // TODO: if stack is nonempty, handle that. else:
                        return parseInt(G.turnOrderStateMachine.leader);
                    },
                }
            }
        },
        // BOT - sharedraw - brodo math - jpfeiff  math
        // BOT - sharedraw - brodo wheel - jpfeiff  wheel
    },

};

// accountForActions mutates the actions state machine
// after a player uses a main-phase action.
//
function accountForActions(G, ctx) {
    // TODO: implement.
    let sm = G.turnOrderStateMachine;
    if (!sm.areOpenersPlayed) {
        sm.areOpenersPlayed = true;
        // TODO: do alphabetical sort thing.
    }
    // TODO: handle initial phase where you get 1 move.
    // TODO: update numMovesPlayed and currLeader.
    sm.movesAsLeader += 1;
    if (sm.movesAsLeader == 2) {
        sm.leader = nextPlayer(sm.leader, ctx.numPlayers);
        sm.movesAsLeader = 0;
        // ctx.events.endTurn({next: sm.leader});
    }
}

function DrawAction(G, ctx) {
    let ageToDraw = topAge(G, ctx.playerID);
    drawAux(G, ctx.playerID, ageToDraw);
    accountForActions(G, ctx);
}

function drawMultiple(G, playerID, age, num) {
    for (let i = 0; i < num; i++) {
        drawAux(G, playerID, age);
    }
}

// TODO: want to use typescript... ageToDraw is an int.
function drawAux(G, playerID, ageToDraw) {
    // TODO: handle drawing an 11.
    while (true) {
        if (G.decks[ageToDraw].length === 0) {
            ageToDraw += 1;
        } else {
            break;
        }
    }
    G[playerID].hand.push(G.decks[ageToDraw].pop());
}

// TODO: topAges gets all cards on board. Need to implement piles.
// TODO: rounding up to 1 in this function for now.
// Technically we are supposed to return 0 for an empty board,
// but not sure if it matters.
function topAge(G, playerID) {
    let topAges = G[playerID].board.map(element => element.age);
    let age = 1;
    if (topAges.length !== 0) {
        age = Math.max(topAges);
    }
    return age;
}

function getScore(G, playerID) {
    let total = 0;
    G[playerID].score.forEach(element => {
        total += element.age;
    });
    return total;
}

function MeldAction(G, ctx, id) {
    let index = G[ctx.playerID].hand.findIndex(element => (element.id === id));
    if (index === -1) {
        return INVALID_MOVE;
    }
    G[ctx.playerID].board.push(G[ctx.playerID].hand[index]);
    G[ctx.playerID].hand.splice(index, 1);
    accountForActions(G, ctx);
}

function AchieveAction(G, ctx, id) {
    let index = G.achievements.findIndex(element => (element.id === id));
    if (index === -1) {
        return INVALID_MOVE;
    }
    let achievement = G.achievements[index];
    if (!isEligible(G, ctx.playerID, achievement.age)) {
        return INVALID_MOVE;
    }
    G[ctx.playerID].achievements.push(G.achievements[index]);
    G.achievements.splice(index, 1);
    accountForActions(G, ctx);
}

function isEligible(G, playerID, achievementAge) {
    // TODO: doesn't handle Echoes rules yet.
    return (topAge(G, playerID) >= achievementAge && getScore(G, playerID) >= 5 * achievementAge);
}

function DogmaAction(G, ctx, id) {
    // TODO: need to check if the card is a top card of the board, not just onboard.
    let index = G[ctx.playerID].board.findIndex(element => (element.id === id));
    if (index === -1) {
        return INVALID_MOVE;
    }
    let card = G[ctx.playerID].board[index];
    // TODO: we also need to check symbols and maybe share with opponent.
    // With currently implemented cards we would always share draw
    // but we also need to figure out whether the opponent declined
    // once they are able to do so.
    card.dogmasFunction.forEach(fnObj => {
        let fn = eval(fnObj.name);
        fn(G, ctx.playerID, ...(fnObj.extraArgs));
    });
    accountForActions(G, ctx);
}

function ChooseOpener(G, ctx, id) {
    let didMeld = MeldAction(G, ctx, id);
    if (didMeld === INVALID_MOVE) {
        return INVALID_MOVE;
    }
    G.numDoneOpening += 1;
    if (G.numDoneOpening === ctx.numPlayers) {
        let players = ctx.playOrder.slice();
        players.sort((a, b) => {
            let nameA = G[a].board[0].name;
            let nameB = G[b].board[0].name;
            if (nameA < nameB) {
                return -1;
            } else if (nameA > nameB) {
                return 1;
            }
            return 0;
        });
        G.leader = players[0];
        ctx.events.setPhase('mainPhase');
        ctx.events.endTurn({next: G.leader});
    }
}

function mySetup(ctx) {
    let G = {
        decks: generateDecks(ctx),
        turnOrderStateMachine: {
            areOpenersPlayed: false,
            numSingleTurnsRemaining: false,
            leader: "0",
            movesAsLeader: 0,
            initialTurnsRemaining: Math.floor(ctx.numPlayers / 2),
        },
        stack: Array(0),
        achievements: {},
        numDoneOpening: 0,
    };
    for (let i = 0; i < ctx.numPlayers; i++) {
        let playerData = {
            hand: Array(0),
            score: Array(0),
            achievements: Array(0),
            board: Array(0),
        };
        for (let j = 0; j < 2; j++) {
            playerData.hand.push(G.decks[1].pop());
        }
        G[i.toString()] = playerData;
    }
    for (let i = 1; i < 10; i++) {
        let card = G.decks[i].pop();
        G.achievements[i.toString()] = Array(1).fill(card);
    }
    if (acceleratedSetup) {
        for (let age = 2; age < 8; age++) {
            for (let i = 0; i < ctx.numPlayers; i++) {
                G[i.toString()].hand.push(G.decks[age].pop());
                G[i.toString()].score.push(G.decks[age].pop());
            }
        }
    }
    // TODO: this seems broken?
    ctx.events.setActivePlayers({all: 'myFirstStage', moveLimit: 1});
    return G;
}

function generateDecks(ctx) {
    let decks = {};
    for (let i = 1; i < 11; i++) {
        decks[i] = Array(0);
    }
    loadCards(ctx).forEach(element => {
        decks[element.age].push(element)
    });
    for (let i = 1; i < 11; i++) {
        decks[i] = ctx.random.Shuffle(decks[i]);
    }
    return decks;
}

function loadCards(ctx) {
    // TODO: unstub.
    let multiplicity = 5;
    let cards = Array(0);
    for (let i = 0; i < multiplicity; i++) {
        for (let age = 1; age < 11; age++) {
            cards.push({
                id: ctx.random.Number().toString(),
                color: "green",
                age: age,
                name: "The Wheel - age " + age.toString() + " - copy " + i.toString(),
                dogmasEnglish: ["Draw two 1s."],
                dogmasFunction: [{
                    name: "drawMultiple",
                    extraArgs: [1, 2],
                }],
                mainSymbol: "castle",
                symbols: ["hex", "", "", "castle", "castle", "castle"],
            });
            cards.push({
                id: ctx.random.Number().toString(),
                color: "blue",
                age: age,
                name: "Writing - age " + age.toString() + " - copy " + i.toString(),
                dogmasEnglish: ["Draw a 2."],
                dogmasFunction: [{
                    name: "drawMultiple",
                    extraArgs: [2, 1],
                }],
                mainSymbol: "bulb",
                symbols: ["hex", "", "", "bulb", "bulb", "crown"],
            });
        }
    }
    return cards;
}

function nextPlayer(player, numPlayers) {
    return ((parseInt(player, 10) + 1) % numPlayers).toString();
}