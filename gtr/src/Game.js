import {INVALID_MOVE} from 'boardgame.io/core';
import {PlayerView} from 'boardgame.io/core';


export const GloryToRome = {
    setup: mySetup,
    playerView: PlayerView.STRIP_SECRETS,

    turn: {
        moveLimit: 1,
    },

    moves: {
        Think,
        // LeadMerchant,
        // LeadLaborer,
        // TODO: add following.
    },

    endIf: (G, ctx) => {
        if (G.secret.deck.isEmpty) {
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
    G[playerID].hand.push(G.secret.deck.splice(0,toDraw));
}

function mySetup(ctx) {
    let numCards = ctx.numPlayers * 10;
    let merchant = {name: "merchant"};
    let laborer = {name: "laborer"};
    let deck = Array(numCards).fill(merchant) + Array(numCards).fill(laborer);
    let hand0 = Array(2).fill(merchant) + Array(3).fill(laborer);
    let hand1 = Array(2).fill(merchant) + Array(3).fill(laborer);
    // TODO: generalize to 3+ players.
    // TODO: actually randomize the hands as part of the deck.
    // TODO: the number of cards in opp hand should be public.
    return {
        public: {
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
            // deck: ctx.random.Shuffle(deck),
            deck: deck,
        },
        '0': {
            hand: hand0,
        },
        '1': {
            hand: hand1,
        },
    }
}

