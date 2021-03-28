import {INVALID_MOVE} from 'boardgame.io/core';
import {PlayerView} from 'boardgame.io/core';


export const GloryToRome = {
    setup: mySetup,
    // playerView: PlayerView.STRIP_SECRETS,

    turn: {
        moveLimit: 1,
    },

    moves: {
        Think,
        Lead,
        // TODO: add following.
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

function Think(G, ctx, playerID) {
    let handLimit = 5;
    let toDraw = handLimit - G[playerID].hand.length;
    if (toDraw <= 0) {
        toDraw = 1;
    }
    if (toDraw > G.secret.deck.length) {
        toDraw = G.secret.deck.length;
    }
    G[playerID].hand = G[playerID].hand.concat(G.secret.deck.splice(0, toDraw));
}

// TODO: currently only leads, doesn't give opp a chance to follow or think.
// TODO: how will we let the player choose what to laborer or merchant?
// Currently we just give them idx 0 if it exists.
function Lead(G, ctx, id, playerID) {
    let removed = G[playerID].hand.splice(id, 1);
    if (removed.length === 0) {
        return INVALID_MOVE;
    }

    let name = removed[0].name;
    if (name === "merchant") {
        if (G.public[playerID].stockpile.length !== 0) {
            G.public[playerID].vault = G.public[playerID].vault.concat(G.public[playerID].stockpile.splice(0, 1));
        }
    } else if (name === "laborer") {
        if (G.public.pool.length !== 0) {
            G.public[playerID].stockpile = G.public[playerID].stockpile.concat(G.public.pool.splice(0, 1));
        }
    } else {
        return INVALID_MOVE; // Will this remove the thing or not?
    }

    // Finally, put the played card in the pool.
    G.public.pool = G.public.pool.concat(removed);
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
        public: {
            pool: pool,
            '0': {
                stockpile: Array(0),
                vault: Array(0),
            },
            '1': {
                stockpile: Array(0),
                vault: Array(0),
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

