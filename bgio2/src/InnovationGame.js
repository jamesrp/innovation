import {INVALID_MOVE, TurnOrder} from 'boardgame.io/core';
import {generateDecks, stackablesTable} from './InnovationData';

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

    endIf: computeVictory,
};

const acceleratedSetup = true; // Give each player a bunch of stuff to speed up debugging.

export const colors = Array.of("yellow", "blue", "purple", "red", "green");
export const symbols = Array.of("castle", "crown", "bulb", "leaf", "factory", "clock");
export const ages = Array.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

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
    "mayDrawATen": (G, playerID, msg) => {
        if (msg === "no") {
            G.log.push("Player " + playerID + " declines to draw a 3");
            return;
        }
        if (msg === "yes") {
            drawMultiple(G, playerID, 10, 1)
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

// TODO: we need to check this during each stackable etc.
// Technically in the middle of every effect.
// Let's just check after turns for now and revisit later.
function computeVictory(G, ctx) {
    let players = ctx.playOrder.slice();
    let winningPlayers = Array(0);
    if (G.drewEleven) {
        // compute highest score.
        let scores = players.map(p => getScore(G, p));
        let highestScore = Math.max(...scores);
        winningPlayers = players.filter(p => (getScore(G, p) === highestScore));
    } else {
        winningPlayers = players.filter(p => (G[p].achievements.length >= G.achievementsToWin));
    }
    if (winningPlayers.length >= 1) {
        if (winningPlayers.length >= 2) {
            return {draw: true};
        }
        return {winner: winningPlayers[0]};
    }
}

function playerPosFromStackable(G, ctx) {
    let stackable = G.stack[G.stack.length - 1];
    console.log("playerPosFromStackable", stackable.playerToMove);
    return parseInt(stackable.playerToMove);
}

function recordMainPhaseAction(G, ctx) {
    // TODO: we don't handle the initial turns where you only get 1 action.
    G.turnOrderStateMachine.movesAsLeader += 1;
    if (G.turnOrderStateMachine.movesAsLeader == 2) {
        G.turnOrderStateMachine.leader = nextPlayer(G.turnOrderStateMachine.leader, ctx.numPlayers);
        G.turnOrderStateMachine.movesAsLeader = 0;
    }
}

function DrawAction(G, ctx) {
    drawNormal(G, ctx.playerID)
    recordMainPhaseAction(G, ctx);
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
    if (ageToDraw <= 0) {
        drawAux(G, playerID, 1);
    } else if (ageToDraw > 10) {
        G.drewEleven = true;
    } else if (G.decks[ageToDraw].length === 0) {
        drawAux(G, playerID, ageToDraw + 1);
    } else {
        G.log.push("Player " + playerID + " draws a " + ageToDraw.toString());
        G[playerID].hand.push(G.decks[ageToDraw].pop());
    }
}

// TODO: symbolCounts does not consider splay, it only takes the top card.
export function symbolCounts(board) {
    let counts = {};
    for (const key of symbols) {
        counts[key] = 0;
    }
    topCards(board).forEach(card => {
        // symbols == ["hex", "", "", "castle", "castle", "castle"] e.g.
        card.symbols.forEach(s => {
            if (s === "hex" || s === "") {
                return;
            }
            counts[s] += 1;
        })
    });
    return counts;
}

// TODO: topAges gets all cards on board. Need to implement piles.
export function topAge(G, playerID) {
    let topAges = topCards(G[playerID].board).map(element => element.age);
    let age = 0;
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
    let color = G[ctx.playerID].hand[index].color;
    G[ctx.playerID].board[color].push(G[ctx.playerID].hand[index]);
    G[ctx.playerID].hand.splice(index, 1);
    if (ctx.phase === 'startPhase') {
        openingPhaseBookkeeping(G, ctx);
    } else {
        G.log.push("Player " + ctx.playerID + " melds " + name);
        recordMainPhaseAction(G, ctx);
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
    recordMainPhaseAction(G, ctx);
}

function isEligible(G, playerID, achievementAge) {
    // TODO: doesn't handle Echoes rules yet.
    return (topAge(G, playerID) >= achievementAge && getScore(G, playerID) >= 5 * achievementAge);
}

function DogmaAction(G, ctx, id) {
    // TODO: need to check if the card is a top card of the board, not just onboard.
    let candidates = topCards(G[ctx.playerID].board);
    let index = candidates.findIndex(element => (element.id === id));
    if (index === -1) {
        return INVALID_MOVE;
    }
    let card = candidates[index];
    G.log.push("Player " + ctx.playerID + " activates " + card.name);

    // TODO: for now we always share; need to actually check symbols.
    G.stack.push(stackablesTable["shareDraw"](G, ctx.playerID));
    card.dogmasFunction.forEach(dogmaName => G.stack.push(stackablesTable[dogmaName](G, ctx.playerID)));

    TryUnwindStack(G, ctx);
    recordMainPhaseAction(G, ctx);
}

// TODO: does this work?
function openingPhaseBookkeeping(G, ctx) {
    G.numDoneOpening += 1;
    if (G.numDoneOpening === ctx.numPlayers) {
        let players = ctx.playOrder.slice();
        players.sort((a, b) => {
            let nameA = topCards(G[a].board)[0].name;
            let nameB = topCards(G[b].board)[0].name;
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
        achievementsToWin: 8 - ctx.numPlayers, // TODO: different for expansions.
        numDoneOpening: 0,
        drewEleven: false,
    };
    for (let i = 0; i < ctx.numPlayers; i++) {
        let board = {};
        for (const key of colors) {
            board[key] = [];
        }
        let playerData = {
            hand: Array(0),
            score: Array(0),
            achievements: Array(0),
            board: board,
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

function topCards(board) {
    return colors.flatMap(color => {
        if (board[color].length === 0) {
            return [];
        }
        return [board[color][board[color].length - 1]];
    });
}