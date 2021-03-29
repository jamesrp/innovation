import {INVALID_MOVE} from 'boardgame.io/core';
import {PlayerView} from 'boardgame.io/core';


export const GloryToRome = {
    setup: mySetup,
    // playerView: PlayerView.STRIP_SECRETS,

    turn: {
        moveLimit: 1,
        order: {
            // Get the initial value of playOrderPos.
            // This is called at the beginning of the phase.
            // first: (G, ctx) => {
            //     return ctx.playOrder.find(element => element === G.leader); // Scared to use indexOf with stringy ===.
            // },
            first: (G, ctx) => 0,

            // Get the next value of playOrderPos.
            // This is called at the end of each turn.
            // The phase ends if this returns undefined.
            next: (G, ctx) => (ctx.playOrderPos + 1) % ctx.numPlayers,
        }
    },

    phases: {
        declare: {
            moves: {Think, Play},
            start: true,
        },

        resolve: {
            moves: {ResolveCardPlayed, EndResolveCardPlayed},
            turn: {moveLimit: 100000}, // can we do infinite? we want to call endTurn ourselves.
        },
    },

    moves: {
        Think,
        Play,
    },

    endIf: (G, ctx) => {
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
    },


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

// State machine for passing turn order:
// Leader can either lead or think.
// If they think, pass the leader and start over.
// If they lead, give each player in turn order a chance to follow or think.
// Then, the leader as well as everyone who followed get to resolve the effect.
// Afterwards, pass the leader and start over.

function Think(G, ctx, playerID) {
    // Actually draw the cards.
    // TODO: offer jack.
    // TODO: offer to draw 1 card if desired even if could draw more.
    let handLimit = 5;
    let toDraw = handLimit - G[playerID].hand.length;
    if (toDraw <= 0) {
        toDraw = 1;
    }
    if (toDraw > G.secret.deck.length) {
        toDraw = G.secret.deck.length;
    }
    G[playerID].hand = G[playerID].hand.concat(G.secret.deck.splice(0, toDraw));

    if (G.leader === playerID) {
        G.leader = NextLeader(G.leader);
        ctx.events.endTurn({next: G.leader});
    } else {
        MarkOneDeclared(G, ctx);
    }
}

function Play(G, ctx, id, playerID) {
    let removed = G[playerID].hand.splice(id, 1);
    if (removed.length === 0) {
        return INVALID_MOVE;
    }
    let card = removed[0];

    G.public[playerID].cardPlayed = Array(1).fill(card);
    G.numToResolve += 1;

    if (G.leader === playerID) {
        G.numToDeclare = ctx.numPlayers - 1;
    } else {
        MarkOneDeclared(G, ctx);
    }
}

function MarkOneDeclared(G, ctx) {
    G.numToDeclare -= 1;
    if (G.numToDeclare === 0) {
        ctx.events.setPhase('resolve');
        ctx.events.endTurn({next: G.leader});
    }
}

// For now, a manual button when we are done resolving.
// Later this should be tracked via clients and auto ended probably.
function EndResolveCardPlayed(G, ctx) {
    G.numToResolve -= 1;
    if (G.numToResolve === 0) {
        CleanupCardsPlayed(G, ctx);
        ctx.events.setPhase('declare');
    }
    ctx.events.endTurn();
}

// Does the effect but leaves the card in cardPlayed
// TODO: make this take a choice of what to do instead of choosing arr[0].
function ResolveCardPlayed(G, ctx, fromZone, playerID) {
    if (G.public[playerID].cardPlayed.length === 0) {
        return INVALID_MOVE;
    }
    let cardPlayed = G.public[playerID].cardPlayed[0].name;

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
        if (G.public[playerID].stockpile.length !== 0) {
            G.public[playerID].vault = G.public[playerID].vault.concat(G.public[playerID].stockpile.splice(0, 1));
        }
    } else if (cardPlayed === "laborer") {
        if (G.public.pool.length !== 0) {
            G.public[playerID].stockpile = G.public[playerID].stockpile.concat(G.public.pool.splice(0, 1));
        }
    }
    EndResolveCardPlayed(G, ctx);
}

function CleanupCardsPlayed(G, ctx) {
    let players = Array.of("0", "1"); // so hacky... clean up.
    players.forEach(playerID => {
        if (G[playerID].cardPlayed.length === 0) {
            return;
        }
        G.public.pool.push(G[playerID].cardPlayed.pop());
    });
}

function mySetup(ctx) {
    let numCards = ctx.numPlayers * 3;
    let merchant = {name: "merchant"};
    let laborer = {name: "laborer"};
    let craftsman = {name: "craftsman"};
    let deck = Array(numCards).fill(merchant)
        .concat(Array(numCards).fill(laborer))
        .concat(Array(numCards).fill(craftsman));
    let hand0 = Array(1).fill(merchant).concat(Array(1).fill(laborer));
    let hand1 = Array(1).fill(merchant).concat(Array(1).fill(laborer));
    let pool = Array(1).fill(merchant).concat(Array(1).fill(laborer));
    // TODO: generalize to 3+ players.
    // TODO: actually randomize the hands as part of the deck.
    // TODO: the number of cards in opp hand should be public.
    return {
        numToDeclare: ctx.numPlayers,
        numToResolve: 0,
        leader: ctx.currentPlayer,
        public: {
            pool: pool,
            '0': {
                stockpile: Array(0),
                vault: Array(0),
                cardPlayed: Array(0),
            },
            '1': {
                stockpile: Array(0),
                vault: Array(0),
                cardPlayed: Array(0),
            },
        },
        secret: {
            deck: ctx.random.Shuffle(deck),
            // deck: deck,
        },
        '0': {
            hand: hand0,
        },
        '1': {
            hand: hand1,
        },
    }
}

// hacky
function NextLeader(leader) {
    if (leader === "0") {
        return "1";
    }
    return "0";
}

