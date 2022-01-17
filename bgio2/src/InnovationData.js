import {INVALID_MOVE} from "boardgame.io/core";
import {drawMultiple, drawNormal, drawAuxAndReturn} from './InnovationGame';

// Data model:
// Cards have all data of the card itself including the function definitions
// for how to execute the dogmas. Cards are classes and cannot be serialized.
// At runtime, we give each card a random ID for bookkeeping, and this is how
// the moves work - a player may "click card 0x9786812", and the game state
// knows how to handle that.
//
// When we put something on the stack, we need to be able to serialize it,
// so no classes or closures - just JSON data. For this we use a Stackable,
// which contains enough information to perform the action when it's time.
// A simple example is a Stackable stating that the dogma is The Wheel's
// dogma, it is activated by Agnes, and it is targeting Barbara (i.e.,
// Barbara will draw the two cards):
//   Draw two 1s (Barbara)
//   Draw two 1s (Agnes)
//   ShareDraw (Agnes)
// A more complicated example is when Agnes activates Oars, the demand hits
// Barbara, and Charles shares the non-demand:
//   I DEMAND you ... (Barbara)
//   If no cards were transferred, draw a 1. (Charles)
//   If no cards were transferred, draw a 1. (Agnes)
//   ShareDraw (Agnes)
//
// To communicate between stackables, we use a notion of named "registers"
// (or just "variables") stored in the game state - ShareDraw uses a special
// register "didShare" that the game code knows to set if a non-demand was
// shared and anything happened. Oars uses a register "oars" that only the
// two dogmas of Oars use. We also use registers for tracking the special
// achievements, e.g. "when you tuck six or score six cards in a single turn".
// This register is maintained by the game framework and has a special
// duration - most registers are reset when the stack clears, but this one
// is reset when the turn ends.
//
// We can't use a class for Stackable, but here is what it would be:
//     class Stackable {
//         constructor(name, dogmaIndex, movingPlayerID, originatingPlayerID) {
//             this.name = name;
//             this.dogmaIndex = dogmaIndex;
//             this.movingPlayerID = movingPlayerID;
//             this.originatingPlayerID = originatingPlayerID;
//         }
//     }

class Dogma {
    constructor(text, fn, isDemand) {
        this.text = text;
        // Contract is to return whether anything happened (for sharing).
        this.fn = fn;
        this.isDemand = isDemand;
    }
}

class Card {
    constructor(name, color, age, mainSymbol, symbols, dogmas) {
        this.name = name;
        this.color = color;
        this.age = age;
        this.mainSymbol = mainSymbol;
        this.symbols = symbols;
        this.dogmas = dogmas;
    }

    // Getter
    get area() {
        return this.calcArea();
    }

    // Method
    calcArea() {
        return this.height * this.width;
    }
}

export const cardsNew = {
    "The Wheel": new Card(
        "The Wheel",
        "green",
        1,
        "castle",
        ["hex", "", "", "castle", "castle", "castle"],
        [new Dogma(
            "Draw two 1s.",
            (G, playerID, originatingPlayerID) => {
                drawMultiple(G, playerID, 1, 2);
                return true;
            },
            false)]
    ),
    "Sailing": new Card(
        "Sailing",
        "green",
        1,
        "crown",
        ["crown", "", "", "crown", "hex", "leaf"],
        [new Dogma(
            "Draw and meld a 1.",
            (G, playerID, originatingPlayerID) => {
                let drawnCard = drawAuxAndReturn(G, playerID, 1, 1);
                if (drawnCard != null) {
                    return false;
                }
            },
            false)]
    ),
}


export const cards = [
    {
        color: "green",
        age: 1,
        name: "The Wheel",
        dogmasEnglish: ["Draw two 1s."],
        dogmasFunction: [(G, playerID, originatingPlayerID) => drawMultiple(G, playerID, 1, 2)],
        mainSymbol: "castle",
        symbols: ["hex", "", "", "castle", "castle", "castle"],
    },
    {
        color: "blue",
        age: 1,
        name: "Writing",
        dogmasEnglish: ["Draw a 2."],
        dogmasFunction: [(G, playerID, originatingPlayerID) => drawMultiple(G, playerID, 2, 1)],
        mainSymbol: "bulb",
        symbols: ["hex", "", "", "bulb", "bulb", "crown"],
    },
    {
        color: "purple",
        age: 1,
        name: "AP Philosophy",
        dogmasEnglish: ["Score a card from your hand."],
        dogmasFunction: [(G, playerID, originatingPlayerID, cardID) => {
            let index = G[playerID].hand.findIndex(element => (element.id === cardID));
            if (index === -1) {
                return INVALID_MOVE;
            }
            let name = G[playerID].hand[index].name;
            G[playerID].score.push(G[playerID].hand[index]);
            G[playerID].hand.splice(index, 1);
            G.log.push("Player " + playerID + " scores " + name + " from hand");
        }],
        mainSymbol: "bulb",
        symbols: ["hex", "", "", "bulb", "bulb", "bulb"],
    },
    {
        color: "yellow",
        age: 1,
        name: "MegaWriting",
        dogmasEnglish: ["You may draw a 3.", "You may draw a 10."],
        dogmasFunction: [(G, playerID, originatingPlayerID, msg) => {
            if (msg === "no") {
                G.log.push("Player " + playerID + " declines to draw a 3");
                return;
            }
            if (msg === "yes") {
                drawMultiple(G, playerID, 3, 1)
                return;
            }
            return INVALID_MOVE;
        }, (G, playerID, originatingPlayerID, msg) => {
            if (msg === "no") {
                G.log.push("Player " + playerID + " declines to draw a 10");
                return;
            }
            if (msg === "yes") {
                drawMultiple(G, playerID, 10, 1)
                return;
            }
            return INVALID_MOVE;
        }],
        mainSymbol: "leaf",
        symbols: ["leaf", "", "", "hex", "leaf", "bulb"],
    },
    {
        color: "red",
        age: 1,
        name: "Walls",
        dogmasEnglish: ["Splay your purple cards left."],
        dogmasFunction: [(G, playerID, originatingPlayerID) => {
            if (G[playerID].board['purple'].length > 1) {
                G[playerID].board.splay['purple'] = 'left';
            }
        }],
        mainSymbol: "clock",
        symbols: ["leaf", "", "", "hex", "clock", "clock"],
    },
    {
        color: "yellow",
        age: 1,
        name: "Agriculture",
        dogmasEnglish: ["You may return a card from your hand. If you do, score a card of value x+1."],
        dogmasFunction: [(G, playerID, originatingPlayerID, cardID) => {
            let index = G[playerID].hand.findIndex(element => (element.id === cardID));
            if (index === -1) {
                return INVALID_MOVE;
            }
            let name = G[playerID].hand[index].name;
            let age = G[playerID].hand[index].age;
            G.decks[age].push(G[playerID].hand[index]); // TODO push to bottom?
            G[playerID].hand.splice(index, 1);
            let scoredCard = drawAuxAndReturn(G, playerID, age + 1);
            if (scoredCard !== null) {
                G.log.push("Player " + playerID + " returns " + name + " from hand and scores a X+1");
                G[playerID].score.push(scoredCard);
            }
            G.log.push("Player " + playerID + " returns " + name + " from hand and scores a X+1");
        }],
        mainSymbol: "leaf",
        symbols: ["leaf", "", "", "hex", "leaf", "leaf"],
    },
    {
        color: "red",
        age: 1,
        name: "A Sharp Stick",
        dogmasEnglish: ["I DEMAND you transfer a card from your score pile to my score pile."],
        dogmasFunction: [(G, playerID, originatingPlayerID, cardID) => {
            let index = G[playerID].score.findIndex(element => (element.id === cardID));
            if (index === -1) {
                return INVALID_MOVE;
            }
            let name = G[playerID].score[index].name;
            G[originatingPlayerID].score.push(G[playerID].score[index]);
            G[playerID].score.splice(index, 1);
            G.log.push("Player " + playerID + " transfers " + name + " from their score pile to " + originatingPlayerID + "'s score pile.");
        }],
        mainSymbol: "factory",
        symbols: ["factory", "", "", "factory", "factory", "hex"],
    },
]

// TODO: can we merge all of these into one main dataset,
// and then just pass things around in G by name (e.g. G.hand = ["wheel", "archery"].
// Then, when client or server needs the data, just lookup.
// There are implications for bugfixes during running games but I think I actually
// like the outcome - basically everyone gets force-updated midgame.
export function generateDecks(ctx) {
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
    let multiplicity = 3;
    let output = Array(0);
    for (let i = 0; i < multiplicity; i++) {
        for (let age = 1; age < 11; age++) {
            cards.forEach(card => output.push({
                id: ctx.random.Number().toString(),
                color: "green",
                age: age,
                name: card.name,
                dogmasEnglish: card.dogmasEnglish,
                dogmasFunction: card.dogmasFunction,
                mainSymbol: card.mainSymbol,
                symbols: card.symbols,
            }));
        }
    }
    return output;
}

// We can't put these in the card objects as lambdas because BGIO can't serialize closures.
// The mapping is:
// card.dogmasFunction looks up in stackablesTable.
// stackable.{executeBlind,executeWithCard,executeWithMenu} looks up in functionsTable.
// TODO: can we remove any of this indirection?
export const stackablesTable = {
    "wheel": (G, playerID, originatingPlayerID) => ({
        name: "wheel",
        isDemand: false,
        playerToMove: "",
        originatingPlayerID: originatingPlayerID,
        executeBlind: "wheel",
        playerID: playerID,
    }),
    "writing": (G, playerID, originatingPlayerID) => ({
        name: "writing",
        isDemand: false,
        playerToMove: "",
        originatingPlayerID: originatingPlayerID,
        executeBlind: "writing",
        playerID: playerID,
    }),
    "shareDraw": (G, playerID, originatingPlayerID) => ({
        name: "shareDraw",
        isDemand: false,
        playerToMove: "",
        originatingPlayerID: originatingPlayerID,
        executeBlind: "shareDraw",
        playerID: playerID,
    }),
    "scoreOneFromHand": (G, playerID, originatingPlayerID) => ({
        name: "scoreOneFromHand",
        isDemand: false,
        playerToMove: playerID,
        originatingPlayerID: originatingPlayerID,
        executeWithCard: "scoreOneFromHand",
        cardOptions: Array(0), // TODO: fill out with player's hand.
        // TODO: if player has no hand make it a noop.
        playerID: playerID,
    }),
    "mayDrawAThree": (G, playerID, originatingPlayerID) => ({
        name: "mayDrawAThree",
        isDemand: false,
        playerToMove: playerID,
        originatingPlayerID: originatingPlayerID,
        executeWithMenu: "mayDrawAThree",
        menuOptions: Array.of("yes", "no"),
        playerID: playerID,
    }),
    "mayDrawATen": (G, playerID, originatingPlayerID) => ({
        name: "mayDrawATen",
        isDemand: false,
        playerToMove: playerID,
        originatingPlayerID: originatingPlayerID,
        executeWithMenu: "mayDrawATen",
        menuOptions: Array.of("yes", "no"),
        playerID: playerID,
    }),
    "splayPurpleLeft": (G, playerID, originatingPlayerID) => ({
        name: "splayPurpleLeft",
        isDemand: false,
        playerToMove: '',
        originatingPlayerID: originatingPlayerID,
        executeBlind: "splayPurpleLeft",
        playerID: playerID,
    }),
    "returnOneFromHand": (G, playerID, originatingPlayerID) => ({
        name: "returnOneFromHand",
        isDemand: false,
        playerToMove: playerID,
        originatingPlayerID: originatingPlayerID,
        executeWithCard: "returnOneFromHand",
        executeWithMenu: "decline",
        menuOptions: Array.of("no"),
        cardOptions: Array(0), // TODO: fill out with player's hand.
        // TODO: if player has no hand make it a noop.
        playerID: playerID,
    }),
    "aSharpStick": (G, playerID, originatingPlayerID) => ({
        name: "aSharpStick",
        isDemand: true,
        playerToMove: playerID,
        originatingPlayerID: originatingPlayerID,
        executeWithCard: "aSharpStick",
        executeBlind: "skipASharpStick", // TODO: make it so we automatically skip if applicable.
        playerID: playerID,
    }),
}

// TODO: remove these last two.
export const functionsTable = {
    "shareDraw": (G, playerID, originatingPlayerID) => drawNormal(G, playerID),
    "decline": (G, playerID, originatingPlayerID, msg) => {
        if (msg === "no") {
            G.log.push("Player " + playerID + " declines");
            return;
        }
        return INVALID_MOVE;
    },
};