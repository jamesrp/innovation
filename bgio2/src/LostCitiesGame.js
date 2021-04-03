import {INVALID_MOVE, PlayerView} from 'boardgame.io/core';

export const colors = ['white', 'blue', 'yellow', 'red', 'green'];
const drawFromZones = colors.concat(Array(1).fill("deck"));
const playToZones = ['middle', 'me'];
const investment = 'x2';
const maxNumber = 10;
const numInvestments = 3;

export const LostCities = {
    name: 'lost-cities',
    setup: mySetup,

    turn: {
        moveLimit: 2,
    },

    moves: {
        PlayTo,
        DrawFrom: {
            // Crashes otherwise by trying to access deck locally.
            move: DrawFrom,
            client: false,
        }
    },

    playerView: PlayerView.STRIP_SECRETS,

    endIf: (G, ctx) => {
        if (G.secret.deck.length === 0) {
            let p0Points = computePoints(G.playerPiles["0"]);
            let p1Points = computePoints(G.playerPiles["1"]);
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

function PlayTo(G, ctx, handIdx, color, zone) {
    // Play sequence is supposed to be Play then Draw.
    // Enforce that with numMoves checks.
    if (ctx.numMoves !== 0) {
        return INVALID_MOVE;
    }
    if (!colors.includes(color)) {
        return INVALID_MOVE;
    }
    if (!playToZones.includes(zone)) {
        return INVALID_MOVE;
    }
    if (zone === "middle") {
        G.middlePiles[color].push(G[ctx.playerID].hand.splice(handIdx, 1)[0]);
        return;
    }
    // For playing to your board, we need to make sure the numbers would stay increasing.
    let cardToPlay = G[ctx.playerID].hand.splice(handIdx, 1)[0];
    if (G.playerPiles[ctx.playerID][color].length !== 0) {
        let topCard = G.playerPiles[ctx.playerID][color].pop();
        if (isSmaller(cardToPlay.number, topCard.number)) {
            return INVALID_MOVE;
        }
        G.playerPiles[ctx.playerID][color].push(topCard);
    }
    G.playerPiles[ctx.playerID][color].push(cardToPlay);
}

function DrawFrom(G, ctx, zone) {
    // Play sequence is supposed to be Play then Draw.
    // Enforce that with numMoves checks.
    if (ctx.numMoves !== 1) {
        return INVALID_MOVE;
    }
    if (!drawFromZones.includes(zone)) {
        return INVALID_MOVE;
    }
    let fromArray = G.secret.deck;
    if (zone !== "deck") {
        fromArray = G.middlePiles[zone];
    } else {
        G.deckSize -= 1;
    }
    if (fromArray.length === 0) {
        return INVALID_MOVE;
    }
    // TODO: need to check that the player didn't play and draw the same pile.
    G[ctx.playerID].hand.push(fromArray.pop());
    sortHand(G[ctx.playerID].hand);
}

function GenerateDeck() {
    let deck = Array(0);
    colors.forEach(color => {
        deck = deck.concat(Array(numInvestments).fill({
            color: color,
            number: investment,
        }));
        for (let i = 2; i < maxNumber + 1; i++) {
            deck.push({
                color: color,
                number: i.toString(),
            });
        }
    });
    return deck;
}

function mySetup(ctx) {
    let deck = ctx.random.Shuffle(GenerateDeck());
    let piles = {};
    colors.forEach(color => piles[color] = Array(0));
    let G = {
        secret: {
            deck: deck,
        },
        middlePiles: piles,
        playerPiles: {
            "0": piles,
            "1": piles,
        },
    };
    for (let i = 0; i < ctx.numPlayers; i++) {
        let hand = deck.splice(0, 8);
        sortHand(hand);
        G[i.toString()] = {
            hand: hand,
        };
    }
    G.deckSize = deck.length;
    return G;
}

// return whether num1 < num2. num1,2 are "2" .. "10" or "INV".
function isSmaller(num1, num2) {
    if (num2 === investment) {
        return false;
    }
    if (num1 === investment) {
        return true;
    }
    return (parseInt(num1, 10) < parseInt(num2, 10));

}

export function computePointsSingle(pile) {
    if (pile.length === 0) {
        return 0;
    }
    let total = -20;
    let multiplier = 1;
    pile.forEach(card => {
        if (card.number === investment) {
            multiplier += 1;
        } else {
            total += parseInt(card.number, 10);
        }
    })
    return multiplier * total;
}

export function computePoints(piles) {
    let points = 0;
    colors.forEach(color => {
        points += computePointsSingle(piles[color]);
    });
    return points;
}

function sortHand(hand) {
    hand.sort((a, b) => {
        if (a.color === b.color) {
            if (a.number === b.number) {
                return 0;
            } else if (isSmaller(a.number, b.number)) {
                return -1;
            }
            return 1;
        }
        return colors.indexOf(a.color) - colors.indexOf(b.color);
    });
}