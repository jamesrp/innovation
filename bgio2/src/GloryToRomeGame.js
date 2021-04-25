import {INVALID_MOVE} from 'boardgame.io/core';
import {PlayerView} from 'boardgame.io/core';

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
                cleanupCardsPlayed(G, ctx);
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
                G.turnOrderStateMachine.toResolve.reverse();
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
            moves: {ResolveCardPlayed, Pass},
            endIf: (G, ctx) => {
                if (G.stack.length > 0) {
                    return {next: 'unwindStack'};
                }
                if (G.turnOrderStateMachine.toResolve.length === 0) {
                    return {next: 'lead'};
                }
                return false;
            },
            turn: {
                moveLimit: 1,
                order: {
                    first: (G, ctx) => parseInt(G.turnOrderStateMachine.toResolve[G.turnOrderStateMachine.toResolve.length - 1]),
                    next: (G, ctx) => parseInt(G.turnOrderStateMachine.toResolve[G.turnOrderStateMachine.toResolve.length - 1]),
                }
            }
        },
        unwindStack: {
            moves: {ClickCard, ClickMenu},
            endIf: (G, ctx) => {
                if (G.stack.length === 0) {
                    if (G.turnOrderStateMachine.toResolve.length === 0) {
                        return {next: 'lead'};
                    }
                    return {next: 'resolve'};
                }
                return false;
            },
            turn: {
                moveLimit: 1,
                order: {
                    first: (G, ctx) => parseInt(G.stack[G.stack.length - 1].toChoose),
                    next: (G, ctx) => parseInt(G.stack[G.stack.length - 1].toChoose),
                }
            }
        },
    },

    endIf: computeVictory,
};

function vaultPoints(vault) {
    let nameToValue = {
        'merchant': 3,
        'laborer': 1,
    };
    return vault.map(i => nameToValue[i]).reduce(
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
        // TODO: if we have clients, also:
        // G.turnOrderStateMachine.toResolve.push(ctx.playerID);
    } else {
        // If leader thinks, we don't call onBegin again, so modify leader here.
        G.turnOrderStateMachine.leader = nextPlayer(ctx, G.turnOrderStateMachine.leader, ctx.numPlayers);
    }
    console.log(JSON.stringify(G.turnOrderStateMachine));
}

function Play(G, ctx, id) {
    let removed = G[ctx.playerID].hand.splice(id, 1);
    if (removed.length === 0) {
        return INVALID_MOVE;
    }
    let card = removed[0];
    if (ctx.phase === 'follow') {
        let suitLed = G.public[G.turnOrderStateMachine.leader].cardPlayed[0];
        if (card.name !== suitLed.name) {
            return INVALID_MOVE;
        }
    }

    G.public[ctx.playerID].cardPlayed = Array(1).fill(card);
    G.numToResolve += 1;

    if (ctx.phase === 'lead') {
        G.turnOrderStateMachine.toFollow = playOrderAfterMe(ctx, ctx.playerID);
        G.turnOrderStateMachine.toResolve = [ctx.playerID];
    } else {
        G.turnOrderStateMachine.toFollow.pop();
        G.turnOrderStateMachine.toResolve.push(ctx.playerID);
    }
    console.log(JSON.stringify(G.turnOrderStateMachine));
}

function Pass(G, ctx) {
    G.turnOrderStateMachine.toResolve.pop();
    console.log(JSON.stringify(G.turnOrderStateMachine));
}

// Does the effect but leaves the card in cardPlayed
// TODO: make this take a choice of what to do instead of choosing arr[0].
function ResolveCardPlayed(G, ctx, fromZone) {
    if (G.public[ctx.playerID].cardPlayed.length === 0) {
        return INVALID_MOVE;
    }
    let cardPlayed = G.public[ctx.playerID].cardPlayed[0].name;

    if (fromZone === "pool") {
        if (cardPlayed !== "laborer") {
            return INVALID_MOVE;
        }
    } else if (fromZone === "stockpile") {
        if (cardPlayed !== "merchant") {
            return INVALID_MOVE;
        }
    } else {
        return INVALID_MOVE;
    }


    if (cardPlayed === "merchant") {
        if (G.public[ctx.playerID].stockpile.length !== 0) {
            G.public[ctx.playerID].vault = G.public[ctx.playerID].vault.concat(G.public[ctx.playerID].stockpile.splice(0, 1));
        }
    } else if (cardPlayed === "laborer") {
        if (G.public.pool.length !== 0) {
            G.public[ctx.playerID].stockpile = G.public[ctx.playerID].stockpile.concat(G.public.pool.splice(0, 1));
        }
    }

    // TODO: when we have clients, instead track moves left and only pop when done.
    G.turnOrderStateMachine.toResolve.pop();
    console.log(JSON.stringify(G.turnOrderStateMachine));
}

function ClickCard(G, ctx, id) {
    return INVALID_MOVE;
}

function ClickMenu(G, ctx, msg) {
    return INVALID_MOVE;
}

function cleanupCardsPlayed(G, ctx) {
    console.log("cleanupCardsPlayed");
    let players = ctx.playOrder.slice();
    players.forEach(playerID => {
        if (G.public[playerID].cardPlayed.length === 0) {
            return;
        }
        G.public.pool.push(G.public[playerID].cardPlayed.pop());
    });
    console.log(JSON.stringify(G.turnOrderStateMachine));
}

function mySetup(ctx) {
    let numCards = ctx.numPlayers * 8;
    let merchant = {name: "merchant"};
    let laborer = {name: "laborer"};
    let legionary = {name: "legionary"};
    let deck = Array(numCards).fill(merchant)
        .concat(Array(numCards).fill(laborer))
        .concat(Array(numCards).fill(legionary));
    let deckShuffled = ctx.random.Shuffle(deck);
    let leader = ctx.random.Shuffle(ctx.playOrder.slice())[0];
    let G = {
        turnOrderStateMachine: {
            leader: leader,
            toFollow: [],
            toResolve: [],
        },
        stack: [],
        public: {
            pool: [],
        },
        secret: {},
    };
    for (let i = 0; i < ctx.numPlayers; i++) {
        let p = i.toString();
        let hand = [];
        for (let j = 0; j < 4; j++) {
            hand.push(deckShuffled.pop());
        }
        G.public.pool.push(deckShuffled.pop());
        G[p] = {
            hand: hand,
        };
        G.public[p] = {
            stockpile: [],
            vault: [],
            cardPlayed: [],
        };
    }
    G.secret.deck = deckShuffled;
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