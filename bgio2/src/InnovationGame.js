import {INVALID_MOVE, TurnOrder} from 'boardgame.io/core';
import {generateDecks, stackablesTable} from './InnovationData';

const acceleratedSetup = true; // Give each player a bunch of stuff to speed up debugging.

const functionsTable = {
    "wheel": (G, playerID) => drawMultiple(G, playerID, 1, 2),
    "writing": (G, playerID) => drawMultiple(G, playerID, 2, 1),
    "shareDraw": (G, playerID) => drawNormal(G, playerID),
    "scoreOneFromHand": (G, playerID, cardID) => {
        let index = G[playerID].hand.findIndex(element => (element.id === cardID));
        if (index === -1) {
            return INVALID_MOVE;
        }
        let name = G[playerID].hand[index].name;
        G[playerID].score.push(G[playerID].hand[index]);
        G[playerID].hand.splice(index, 1);
        G.log.push("Player " + playerID + " scores " + name + " from hand");
    },
    "mayDrawAThree": (G, playerID, msg) => {
        if (msg === "no") {
            G.log.push("Player " + playerID + " declines to draw a 3");
            return;
        }
        if (msg === "yes") {
            drawMultiple(G, playerID, 3, 1)
            return;
        }
        return INVALID_MOVE;
    },
};

function ClickCard(G, ctx, id) {
    let stackable = G.stack.pop();
    let x = functionsTable[stackable.executeWithCard](G, stackable.playerID, id);
    TryUnwindStack(G, ctx);
    return x;
}

function ClickMenu(G, ctx, msg) {
    let stackable = G.stack.pop();
    let x = functionsTable[stackable.executeWithMenu](G, stackable.playerID, msg);
    TryUnwindStack(G, ctx);
    return x;
}

function TryUnwindStack(G, ctx) {
    while (G.stack.length !== 0 && G.stack[G.stack.length - 1].playerToMove === '') {
        let stackable = G.stack.pop();
        functionsTable[stackable.executeBlind](G, stackable.playerID);
    }
}

export const Innovation = {
    name: 'innovation',
    minPlayers: 2,
    maxPlayers: 4,
    setup: mySetup,

    phases: {
        startPhase: {
            moves: {MeldAction},
            turn: {
                moveLimit: 1,
            },
            start: true,
            next: 'mainPhase',
            endIf: (G, ctx) => (G.numDoneOpening === ctx.numPlayers),
        },

        mainPhase: {
            moves: {
                MeldAction, AchieveAction,
                DogmaAction: {
                    // May crash since we don't know what the dogma will do.
                    move: DogmaAction,
                    client: false,
                },
                DrawAction: {
                    // Crashes otherwise by trying to access deck locally.
                    move: DrawAction,
                    client: false,
                }
            },
            endIf: G => (G.stack.length !== 0),
            next: 'resolveStack',
            turn: {
                moveLimit: 1,
                order: {
                    first: (G, ctx) => parseInt(G.turnOrderStateMachine.leader),
                    next: (G, ctx) => parseInt(G.turnOrderStateMachine.leader),
                }
            }
        },

        resolveStack: {
            moves: {
                // Both of these need the server since we don't know
                // what effect they will end up executing.
                ClickMenu: {
                    move: ClickMenu,
                    client: false,
                }, ClickCard: {
                    move: ClickCard,
                    client: false,
                },
            },
            endIf: G => (G.stack.length === 0),
            next: 'mainPhase',
            turn: {
                moveLimit: 1,
                order: {
                    first: playerPosFromStackable,
                    next: playerPosFromStackable,
                }
            }
        },
    },

};

function playerPosFromStackable(G, ctx) {
    let stackable = G.stack[G.stack.length - 1];
    console.log("playerPosFromStackable", stackable.playerToMove);
    return parseInt(stackable.playerToMove);
}

// accountForActions mutates the actions state machine
// after a player uses a main-phase action.
//
function accountForActions(G, ctx) {
    // TODO: we don't handle the initial turns where you only get 1 action.
    G.turnOrderStateMachine.movesAsLeader += 1;
    if (G.turnOrderStateMachine.movesAsLeader == 2) {
        G.turnOrderStateMachine.leader = nextPlayer(G.turnOrderStateMachine.leader, ctx.numPlayers);
        G.turnOrderStateMachine.movesAsLeader = 0;
    }
}

function DrawAction(G, ctx) {
    drawNormal(G, ctx.playerID)
    accountForActions(G, ctx);
}

function drawNormal(G, playerID) {
    let ageToDraw = topAge(G, playerID);
    drawAux(G, playerID, ageToDraw);
}

function drawMultiple(G, playerID, age, num) {
    for (let i = 0; i < num; i++) {
        drawAux(G, playerID, age);
    }
}

// TODO: want to use typescript... ageToDraw is an int.
function drawAux(G, playerID, ageToDraw) {
    while (ageToDraw <= 10) {
        if (G.decks[ageToDraw].length === 0) {
            ageToDraw += 1;
        } else {
            break;
        }
    }
    if (ageToDraw >= 11) {
        G.drewEleven = true;
    }
    G.log.push("Player " + playerID + " draws a " + ageToDraw.toString());
    G[playerID].hand.push(G.decks[ageToDraw].pop());
}

// TODO: topAges gets all cards on board. Need to implement piles.
// TODO: rounding up to 1 in this function for now.
// Technically we are supposed to return 0 for an empty board,
// but not sure if it matters.
export function topAge(G, playerID) {
    let topAges = G[playerID].board.map(element => element.age);
    let age = 1;
    if (topAges.length !== 0) {
        age = Math.max(...topAges);
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
    let name = G[ctx.playerID].hand[index].name;
    G[ctx.playerID].board.push(G[ctx.playerID].hand[index]);
    G[ctx.playerID].hand.splice(index, 1);
    if (ctx.phase === 'startPhase') {
        openingPhaseBookkeeping(G, ctx);
    } else {
        G.log.push("Player " + ctx.playerID + " melds " + name);
        accountForActions(G, ctx);
    }
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
    G.log.push("Player " + ctx.playerID + " achieves " + G.achievements[index].name);
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
    G.log.push("Player " + ctx.playerID + " activates " + card.name);

    // TODO: for now we always share; need to actually check symbols.
    G.stack.push(stackablesTable["shareDraw"](G, ctx.playerID));
    card.dogmasFunction.forEach(dogmaName => G.stack.push(stackablesTable[dogmaName](G, ctx.playerID)));

    TryUnwindStack(G, ctx);
    accountForActions(G, ctx);
}

// TODO: does this work?
function openingPhaseBookkeeping(G, ctx) {
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
        G.turnOrderStateMachine.leader = players[0];
    }
}

function mySetup(ctx) {
    let G = {
        log: Array(0),
        decks: generateDecks(ctx),
        turnOrderStateMachine: {
            numSingleTurnsRemaining: false,
            leader: "0",
            movesAsLeader: 0,
            initialTurnsRemaining: Math.floor(ctx.numPlayers / 2),
        },
        stack: Array(0),
        achievements: Array(0),
        numDoneOpening: 0,
        drewEleven: false,
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
        G.achievements.push(G.decks[i].pop());
    }
    if (acceleratedSetup) {
        for (let age = 2; age < 8; age++) {
            for (let i = 0; i < ctx.numPlayers; i++) {
                G[i.toString()].hand.push(G.decks[age].pop());
                G[i.toString()].score.push(G.decks[age].pop());
            }
        }
    }
    return G;
}

function nextPlayer(player, numPlayers) {
    return ((parseInt(player, 10) + 1) % numPlayers).toString();
}