import {INVALID_MOVE, TurnOrder} from 'boardgame.io/core';

const acceleratedSetup = true; // Give each player a bunch of stuff to speed up debugging.

const functionsTable = {
    "wheel": (G, playerID) => drawMultiple(G, playerID, 1, 2),
    "writing": (G, playerID) => drawMultiple(G, playerID, 2, 1),
    "shareDraw": (G, playerID) => drawNormal(G, playerID),
};

// TODO:
// - Finish the stack pusher and unwinder.
//

function ClickCard(G, ctx, id) {
    let x = executeWithCard(G, ctx, G.stack.pop(), id);
    TryUnwindStack(G, ctx);
    return x;
}

function ClickMenu(G, ctx, msg) {
    let x = executeWithMenu(G, ctx, G.stack.pop(), msg);
    TryUnwindStack(G, ctx);
    return x;
}

function TryUnwindStack(G, ctx) {
    while (G.stack.length !== 0 && G.stack[G.stack.length - 1].playerToMove === '') {
        executeBlind(G, ctx, G.stack.pop());
    }
}

function executeBlind(G, ctx, stackable) {
    let md = stackable.fnName + ': topAge = ' + topAge(G, stackable.playerID).toString();
    console.log(md);
    G.log.push(md);
    functionsTable[stackable.fnName](G, stackable.playerID);
}

function executeWithCard(G, ctx, stackable, id) {
    // TODO
}

function executeWithMenu(G, ctx, stackable, msg) {
    // TODO
}

// Stackable:
let stackable = {
    playerToMove: "0",  // or '' if nobody
    // And one of:
    menuOptions: Array(0),
    cardOptions: Array(0),


};

export const Innovation = {
    name: 'innovation',
    minPlayers: 2,
    maxPlayers: 4,
    setup: mySetup,

    turn: {
        moveLimit: 1,
    },

    moves: {
        MeldAction
    },

    phases: {
        // TODO: can we get rid of the stage here and just do this?
        //   order: TurnOrder.CUSTOM(['1', '3']),
        // with moveLimit=1?
        startPhase: {
            moves: {MeldAction},
            stages: {
                myFirstStage: {
                    moves: {MeldAction},
                },
            },
            start: true,
        },

        mainPhase: {
            moves: {
                MeldAction, AchieveAction,
                DogmaAction: {
                    // Crashes otherwise by trying to access deck locally.
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
                    // Get the initial value of playOrderPos.
                    // This is called at the beginning of the phase.
                    first: (G, ctx) => 0, // TODO: how to determine?

                    // Get the next value of playOrderPos.
                    // This is called at the end of each turn.
                    // The phase ends if this returns undefined.
                    next: (G, ctx) => {
                        // seems to not be getting called?
                        console.log("checking next player in mainPhase");
                        console.log(parseInt(G.turnOrderStateMachine.leader));
                        return parseInt(G.turnOrderStateMachine.leader);
                    },
                }
            }
        },
        // After each Dogma() call, call TryUnwindStack().
        // Also call it after each ClickMenu/ClickCard
        resolveStack: {
            moves: {ClickMenu, ClickCard},
            endIf: G => (G.stack.length === 0),
            next: 'mainPhase',
            turn: {
                moveLimit: 1,
                order: {
                    // Get the initial value of playOrderPos.
                    // This is called at the beginning of the phase.
                    first: playerPosFromStackable,

                    // Get the next value of playOrderPos.
                    // This is called at the end of each turn.
                    // The phase ends if this returns undefined.
                    next: playerPosFromStackable,
                }
            }
        },
        // phase = main, brodo clicks Math
        // BOT - sharedraw - brodo math - jpfeiff  math
        // framework notices stack nonempty and sets phase = resolve
        // TODO: jpfeiff becomes current player?
    },

};

function playerPosFromStackable(G, ctx) {
    let stackable = G.stack[G.stack.length - 1];
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
        G.turnOrder = Array.of(G.turnOrderStateMachine.leader);
    }
}

function DrawAction(G, ctx) {
    drawNormal(G, ctx.playerID)
    accountForActions(G, ctx);
}

function drawNormal(G, playerID) {
    let ageToDraw = topAge(G, playerID);
    console.log(ageToDraw);
    drawAux(G, playerID, ageToDraw);
}

function drawMultiple(G, playerID, age, num) {
    for (let i = 0; i < num; i++) {
        drawAux(G, playerID, age);
    }
}

// TODO: want to use typescript... ageToDraw is an int.
function drawAux(G, playerID, ageToDraw) {
    console.log('drawAux');
    // TODO: handle drawing an 11.
    while (true) {
        console.log('G.decks keys:');
        console.log(Object.keys(G.decks));

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
export function topAge(G, playerID) {
    let topAges = G[playerID].board.map(element => element.age);
    console.log(topAges);
    let age = 1;
    if (topAges.length !== 0) {
        age = Math.max(...topAges);
    }
    console.log(age);
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
    if (ctx.phase === 'startPhase') {
        openingPhaseBookkeeping(G, ctx);
    } else {
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
    // TODO: for now we always share, actually check symbols.
    G.stack.push({
        name: "shareDraw",
        playerToMove: "",
        fnName: "shareDraw",
        playerID: ctx.playerID,
    })
    card.dogmasFunction.forEach(fnName => {
        G.stack.push({
            name: fnName,
            playerToMove: "",
            fnName: fnName,
            playerID: ctx.playerID,
        })
    });

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
        G.leader = players[0];
        ctx.events.setPhase('mainPhase');
        ctx.events.endTurn({next: G.leader});
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
                dogmasFunction: ["wheel"],
                mainSymbol: "castle",
                symbols: ["hex", "", "", "castle", "castle", "castle"],
            });
            cards.push({
                id: ctx.random.Number().toString(),
                color: "blue",
                age: age,
                name: "Writing - age " + age.toString() + " - copy " + i.toString(),
                dogmasEnglish: ["Draw a 2."],
                dogmasFunction: ["writing"],
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