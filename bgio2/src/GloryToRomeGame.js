import {INVALID_MOVE} from 'boardgame.io/core';
import {PlayerView} from 'boardgame.io/core';

const merchant = "Merchant";
const laborer = "Laborer";
const legionary = "Legionary";
const patron = "Patron";
const craftsman = "Craftsman";
const architect = "Architect";

const functionsTable = {
    "giveOneFromHand": (G, playerID, cardID, recipientID, cardType) => {
        let index = G[playerID].hand.findIndex(element => (element.id === cardID));
        if (index === -1) {
            return INVALID_MOVE;
        }
        let card = G[playerID].hand[index];
        if (card.type !== cardType) {
            return INVALID_MOVE;
        }
        G.public[recipientID].stockpile.push(card);
        G[playerID].hand.splice(index, 1);
        G.log.push("Player " + playerID + " gives " + card.type + " to player " + recipientID);
    },
    "takeOneFromPool": (G, playerID, cardID, cardType) => {
        let index = G.public.pool.findIndex(element => (element.id === cardID));
        if (index === -1) {
            return INVALID_MOVE;
        }
        let card = G.public.pool[index];
        if (card.type !== cardType) {
            return INVALID_MOVE;
        }
        G.public[playerID].stockpile.push(card);
        G.public.pool.splice(index, 1);
        G.log.push("Player " + playerID + " takes a " + card.type + " from the stockpile");
    },
    "decline": (G, playerID, msg) => {
        if (msg === "no") {
            G.log.push("Player " + playerID + " declines");
            return;
        }
        return INVALID_MOVE;
    },
};

// TODO: probably worth debugging this in a 3-way w/ remote master and printf debug for now.
// It seems like thinking passes the turn around correctly, but resolving cards played
// doesn't work (and the pool looks strange and out of sync between players).
export const GloryToRome = {
    name: 'glory-to-rome',
    minPlayers: 2,
    maxPlayers: 4,
    setup: mySetup,
    // playerView: PlayerView.STRIP_SECRETS,

    phases: {
        lead: {
            moves: {Think, Play},
            start: true,
            endIf: (G, ctx) => {
                if (G.turnOrderStateMachine.toFollow.length > 0) {
                    return {next: 'follow'};
                }
                return false;
            },
            onBegin: (G, ctx) => {
                G.turnOrderStateMachine.leader = nextPlayer(ctx, G.turnOrderStateMachine.leader, ctx.numPlayers);
                ctx.playOrder.slice().forEach(p => G.turnOrderStateMachine.resolveMovesSpent[p] = 0);
                cleanupCardsPlayed(G, ctx);
                untapClients(G, ctx);
            },
            turn: {
                moveLimit: 1,
                order: {
                    first: (G, ctx) => parseInt(G.turnOrderStateMachine.leader),
                    next: (G, ctx) => parseInt(G.turnOrderStateMachine.leader),
                }
            }
        },
        follow: {
            moves: {Think, Play},
            endIf: (G, ctx) => {
                if (G.turnOrderStateMachine.toFollow.length === 0) {
                    return {next: 'resolve'};
                }
                return false;
            },
            onEnd: (G, ctx) => {
                // We build this in reverse order in follow(); reverse it before handing to resolve.
                // G.turnOrderStateMachine.toResolve.reverse();
            },
            turn: {
                moveLimit: 1,
                order: {
                    first: (G, ctx) => parseInt(G.turnOrderStateMachine.toFollow[G.turnOrderStateMachine.toFollow.length - 1]),
                    next: (G, ctx) => parseInt(G.turnOrderStateMachine.toFollow[G.turnOrderStateMachine.toFollow.length - 1]),
                }
            }
        },
        resolve: {
            moves: {ClickCard, ClickMenu, Pass},
            endIf: (G, ctx) => {
                if (G.stack.length > 0) {
                    return {next: 'unwindStack'};
                }
                let p = nextToResolve(G);
                // TODO: wire in nextToResolve, and make sure it is allowed to mutate - if not, find another way.
                if (p === null) {
                    return {next: 'lead'};
                }
                return false;
            },
            turn: {
                moveLimit: 1,
                order: {
                    first: (G, ctx) => nextToResolve(G),
                    next: (G, ctx) => nextToResolve(G),
                }
            }
        },
        unwindStack: {
            moves: {ClickCard, ClickMenu, Pass},
            endIf: (G, ctx) => {
                if (G.stack.length === 0) {
                    let p = nextToResolve(G);
                    if (p === null) {
                        return {next: 'lead'};
                    }
                    return {next: 'resolve'};
                }
                return false;
            },
            turn: {
                moveLimit: 1,
                order: {
                    first: (G, ctx) => parseInt(G.stack[G.stack.length - 1].playerToMove),
                    next: (G, ctx) => parseInt(G.stack[G.stack.length - 1].playerToMove),
                }
            }
        },
    },

    endIf: computeVictory,
};

function vaultPoints(vault) {
    return vault.map(i => i.points).reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0
    )
}

function Think(G, ctx) {
    // Actually draw the cards.
    // TODO: offer jack.
    // TODO: offer to draw 1 card if desired even if could draw more.
    let handLimit = 5;
    let toDraw = handLimit - G[ctx.playerID].hand.length;
    if (toDraw <= 0) {
        toDraw = 1;
    }
    if (toDraw > G.secret.deck.length) {
        toDraw = G.secret.deck.length;
    }
    G[ctx.playerID].hand = G[ctx.playerID].hand.concat(G.secret.deck.splice(0, toDraw));

    if (ctx.phase === 'follow') {
        G.turnOrderStateMachine.toFollow.pop();
    } else {
        // If leader thinks, we don't call onBegin again, so modify leader here.
        G.turnOrderStateMachine.leader = nextPlayer(ctx, G.turnOrderStateMachine.leader, ctx.numPlayers);
    }
    console.log(JSON.stringify(G.turnOrderStateMachine));
    G.log.push("Player " + ctx.playerID + " thinks");
}

function Play(G, ctx, id) {
    let removed = G[ctx.playerID].hand.splice(id, 1);
    if (removed.length === 0) {
        return INVALID_MOVE;
    }
    let card = removed[0];
    if (ctx.phase === 'follow') {
        let suitLed = G.public[G.turnOrderStateMachine.leader].cardPlayed[0];
        if (card.type !== suitLed.type) {
            return INVALID_MOVE;
        }
    }

    G.public[ctx.playerID].cardPlayed = Array(1).fill(card);
    G.numToResolve += 1;

    if (ctx.phase === 'lead') {
        G.turnOrderStateMachine.toFollow = playOrderAfterMe(ctx, ctx.playerID);
        G.turnOrderStateMachine.toResolve = playOrderAfterMe(ctx, ctx.playerID).concat([ctx.playerID]);
        G.log.push("Player " + ctx.playerID + " leads a " + card.type);
    } else {
        G.turnOrderStateMachine.toFollow.pop();
        G.log.push("Player " + ctx.playerID + " follows a " + card.type);
    }
    console.log(JSON.stringify(G.turnOrderStateMachine));
}

// TODO: should this just be ClickMenu("pass")?
function Pass(G, ctx) {
    G.turnOrderStateMachine.resolveMovesSpent[ctx.playerID] += 1000000;
    G.log.push("Player " + ctx.playerID + " passes");
    console.log(JSON.stringify(G.turnOrderStateMachine));
}

// Does the effect but leaves the card in cardPlayed
function ClickCard(G, ctx, id) {
    // In stack phase, delegate to stackable methods.
    if (ctx.phase === 'unwindStack') {
        let stackable = G.stack[G.stack.length - 1];
        let otherArgs = stackable.executeWithCardOtherArgs;
        G.stack.pop();
        return functionsTable[stackable.executeWithCard](G, ctx.playerID, id, ...otherArgs)
    }

    // Otherwise, below, we assume we are in phase resolve.
    G.turnOrderStateMachine.resolveMovesSpent[ctx.playerID] += 1;
    let cardPlayed = G.public[G.turnOrderStateMachine.leader].cardPlayed[0].type;
    let fromZone = [];
    let toZone = [];
    if (cardPlayed === merchant) {
        fromZone = G.public[ctx.playerID].stockpile;
        toZone = G.public[ctx.playerID].vault;
    } else if (cardPlayed === laborer) {
        fromZone = G.public.pool;
        toZone = G.public[ctx.playerID].stockpile;
    } else if (cardPlayed === patron) {
        fromZone = G.public.pool;
        toZone = G.public[ctx.playerID].clientsTapped;
    } else if (cardPlayed === legionary) {
        fromZone = G[ctx.playerID].hand;
    }

    if (cardPlayed === architect || cardPlayed === craftsman) {
        // TODO: we don't know how to fill buildings yet.
        // Maybe do this with drag/drop?
        return startBuilding(G, ctx.playerID, id);
    }

    let index = fromZone.findIndex(element => (element.id === id));
    if (index === -1) {
        return INVALID_MOVE;
    }
    toZone.push(fromZone[index]);

    if (cardPlayed === legionary) {
        // TODO: legionary clients need special treatment.
        G.turnOrderStateMachine.resolveMovesSpent[ctx.playerID] += 1000;
        // Legionary puts toZone[0] onto the stack:
        let cardType = fromZone[index].type;
        G.stack.push({
            name: "Legionary take from pool targeting " + cardType,
            playerToMove: ctx.playerID,
            executeWithCard: "takeOneFromPool",
            executeWithCardOtherArgs: [cardType],
            executeWithMenu: "decline",
            playerID: ctx.playerID,
        });
        playOrderAfterMe(ctx, ctx.playerID).forEach(oppID => G.stack.push({
            name: oppID + " give 1 " + cardType + " to Legionary or decline",
            playerToMove: oppID,
            executeWithCard: "giveOneFromHand",
            executeWithCardOtherArgs: [ctx.playerID, cardType],
            executeWithMenu: "decline",
            playerID: oppID,
        }));
    } else {
        // Merchant/laborer/patron can just do their thing now:
        fromZone.splice(index, 1);

        // For merchant/patron, check influence:
        if ((cardPlayed === merchant || cardPlayed === patron) && toZone.length > G.public[ctx.playerID].influence) {
            return INVALID_MOVE;
        }
    }

    G.log.push("Player " + ctx.playerID + " selects " + toZone[toZone.length - 1].name);
    console.log(JSON.stringify(G.turnOrderStateMachine));
}

function startBuilding(G, playerID, id) {
    let index = G[playerID].hand.findIndex(element => (element.id === id));
    if (index === -1) {
        return INVALID_MOVE;
    }
    G.public[playerID].buildings.push({
        card: G[playerID].hand.splice(index, 1)[0],
        material: [],
        completed: false,
    })
}

function ClickMenu(G, ctx, msg) {
    // In stack phase, delegate to stackable methods.
    if (ctx.phase === 'unwindStack') {
        // TODO: we don't currently need extraArgs for menu dispatch - will we ever?
        let stackable = G.stack[G.stack.length - 1];
        G.stack.pop();
        return functionsTable[stackable.executeWithMenu](G, ctx.playerID, msg)
    }
    return INVALID_MOVE;
}

function cleanupCardsPlayed(G, ctx) {
    let players = ctx.playOrder.slice();
    players.forEach(playerID => {
        if (G.public[playerID].cardPlayed.length === 0) {
            return;
        }
        G.public.pool.push(G.public[playerID].cardPlayed.pop());
    });
}

function untapClients(G, ctx) {
    let players = ctx.playOrder.slice();
    players.forEach(playerID => {
        G.public[playerID].clients = G.public[playerID].clients.concat(G.public[playerID].clientsTapped);
        G.public[playerID].clientsTapped = [];
    });
}

function loadCards(ctx) {
    let multiplicity = 20;
    let cards = [];
    for (let i = 0; i < multiplicity; i++) {
        cards.push({
            id: ctx.random.Number().toString(),
            color: "blue",
            name: "Sewer/Merchant",
            type: merchant,
            points: 3,
        });
        cards.push({
            id: ctx.random.Number().toString(),
            color: "orange",
            name: "Insula/Laborer",
            type: laborer,
            points: 1,
        });
        cards.push({
            id: ctx.random.Number().toString(),
            color: "red",
            name: "School/Legionary",
            type: legionary,
            points: 2,
        });
        cards.push({
            id: ctx.random.Number().toString(),
            color: "green",
            name: "Dock/Craftsman",
            type: craftsman,
            points: 1,
        });
        cards.push({
            id: ctx.random.Number().toString(),
            color: "grey",
            name: "Walls/Architect",
            type: architect,
            points: 2,
        });
        cards.push({
            id: ctx.random.Number().toString(),
            color: "purple",
            name: "Forum/Patron",
            type: patron,
            points: 3,
        });
    }
    return ctx.random.Shuffle(cards);
}

function mySetup(ctx) {
    let deck = loadCards(ctx);
    let leader = ctx.random.Shuffle(ctx.playOrder.slice())[0];
    let G = {
        turnOrderStateMachine: {
            leader: leader,
            toFollow: [],
            toResolve: [],
            resolveMovesSpent: {},
        },
        stack: [],
        public: {
            pool: [],
        },
        secret: {},
        log: [],
    };
    let startingHandSize = 15; // For debugging only - change to 4 for actual play.
    for (let i = 0; i < ctx.numPlayers; i++) {
        let p = i.toString();
        let hand = [];
        for (let j = 0; j < startingHandSize; j++) {
            hand.push(deck.pop());
        }
        G.public.pool.push(deck.pop());
        G[p] = {
            hand: hand,
        };
        G.turnOrderStateMachine.resolveMovesSpent[p] = 0;
        G.public[p] = {
            influence: 2,
            buildings: [],
            stockpile: [],
            vault: [],
            clients: [],
            clientsTapped: [],
            cardPlayed: [],
        };
    }
    G.secret.deck = deck;
    return G;
}

function nextPlayer(ctx, player, numPlayers) {
    let a = parseInt(player, 10);
    let b = a + 1;
    let c = b % numPlayers;
    let d = c.toString();
    ctx.log.setMetadata(a + b + c + d);
    return d;
    // return ((parseInt(player, 10) + 1) % numPlayers).toString();
}

function computeVictory(G, ctx) {
    if (G.secret.deck.length === 0) {
        let p0Points = vaultPoints(G.public["0"].vault);
        let p1Points = vaultPoints(G.public["1"].vault);
        if (p0Points < p1Points) {
            return {winner: '1'};
        } else if (p0Points > p1Points) {
            return {winner: '0'};
        } else {
            return {draw: true};
        }
    }
}

function playOrderAfterMe(ctx, playerID) {
    let output = [];
    for (let pid = nextPlayer(ctx, playerID, ctx.numPlayers); pid !== playerID; pid = nextPlayer(ctx, pid, ctx.numPlayers)) {
        output.push(pid);
    }
    output.reverse();
    return output;
}

function nextToResolve(G) {
    let resolveOrder = G.turnOrderStateMachine.toResolve.slice();
    resolveOrder.reverse();
    for (const playerID of resolveOrder) {
        let totalActions = G.public[playerID].cardPlayed.length;
        G.public[playerID].clients.forEach(x => {
            if (x.type === G.public[G.turnOrderStateMachine.leader].cardPlayed[0].type) {
                totalActions += 1;
            }
        })
        if (totalActions > G.turnOrderStateMachine.resolveMovesSpent[playerID]) {
            return parseInt(playerID);
        }
    }
    return null;
}