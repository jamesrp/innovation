import {INVALID_MOVE} from 'boardgame.io/core';
import {PlayerView} from 'boardgame.io/core';

// The main flow of who moves next is driven by a stack.
// If the stack is empty, that means it's the current leader's turn to move.
// Otherwise, there should be some objects on the stack describing whose
// turn it is to move and what they can do.
// Then in our move handlers, we can check this for correctness.
// TODO: does it make sense to use steps/phases for any of this?
// A worked example would be:
// 0: stack empty. p1 leader. p1 needs to lead or think.
//    - p1 thinks.
// 1: stack empty. p2 leader. p2 needs to lead or think.
//    - p2 leads laborer.
// 2: stack is: [p2Laborer, p1FollowOrThink, p4FollowOrThink, p3FollowOrThink].
//    - p3 follows.
// 3: stack is: [p2Laborer, p3Laborer, p1FollowOrThink, p4FollowOrThink].
//    - p4 thinks. They have a vomitorium.
// 4: stack is: [p2Laborer, p3Laborer, p1FollowOrThink, p4FollowOrThink].
//    - p3 follows.

export const GloryToRome = {
    name: 'glory-to-rome',
    minPlayers: 2,
    maxPlayers: 4,
    setup: mySetup,
    // playerView: PlayerView.STRIP_SECRETS,

    phases: {
        declare: {
            moves: {Think, Play},
            start: true,
        },

        resolve: {
            moves: {ResolveCardPlayed, EndResolveCardPlayed},
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
        G.leader = nextPlayer(ctx, G.leader, ctx.numPlayers);
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
        ctx.events.endTurn({next: nextPlayer(ctx, ctx.playerID, ctx.numPlayers)});
    } else {
        MarkOneDeclared(G, ctx);
    }
}

function MarkOneDeclared(G, ctx) {
    G.numToDeclare -= 1;
    if (G.numToDeclare === 0) {
        ctx.events.setPhase('resolve');
        ctx.events.endTurn({next: G.leader});
    } else {
        ctx.events.endTurn({next: nextPlayer(ctx, ctx.playerID, ctx.numPlayers)});
    }
}

// For now, a manual button when we are done resolving.
// Later this should be tracked via clients and auto ended probably.
function EndResolveCardPlayed(G, ctx) {
    G.numToResolve -= 1;
    if (G.numToResolve === 0) {
        CleanupCardsPlayed(G, ctx);
        ctx.events.setPhase('declare');
        G.leader = nextPlayer(ctx, G.leader, ctx.numPlayers);
        ctx.events.endTurn({next: G.leader});
    } else {
        ctx.events.endTurn({next: nextPlayerToResolve(G, ctx, ctx.playerID)});
    }
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
    // TODO: later once we have clients, we can only do this if player uses up all their moves
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
    let G = {
        numToDeclare: ctx.numPlayers,
        numToResolve: 0,
        leader: ctx.currentPlayer,
        public: {
            pool: Array(1).fill(merchant).concat(Array(1).fill(laborer)),
        },
        secret: {
            deck: ctx.random.Shuffle(deck),
        },
    };
    for (let i = 0; i < ctx.numPlayers; i++) {
        let p = i.toString();
        let hand = Array(1).fill(merchant).concat(Array(1).fill(laborer));
        G[p] = {
            hand: hand,
        };
        G.public[p] = {
            stockpile: Array(0),
            vault: Array(0),
            cardPlayed: Array(0),
        };

    }
    // TODO: actually randomize the hands as part of the deck.
    // TODO: the number of cards in opp hand should be public.
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

function nextPlayerToResolve(G, ctx, player) {
    let candidate = nextPlayer(ctx, player);
    // ctx.log.setMetadata('candidate: ' + candidate + ': cardPlayed: ');
    // while (G.public[candidate].cardPlayed.length === 0) {
    //     candidate = nextPlayer(candidate);
    //     // detect bug/infinite loop if candidate = player
    //     if (candidate === player) {
    //         return candidate; // what else are we going to do?
    //     }
    // }
    return candidate;
}

