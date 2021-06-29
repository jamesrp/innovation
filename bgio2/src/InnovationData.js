import {INVALID_MOVE} from "boardgame.io/core";
import {drawMultiple, drawNormal, drawAuxAndReturn} from './InnovationGame';

export const cards = [
    {
        color: "green",
        age: 1,
        name: "The Wheel",
        dogmasEnglish: ["Draw two 1s.", "TEST"],
        dogmasFunction: ["wheel"],
        mainSymbol: "castle",
        symbols: ["hex", "", "", "castle", "castle", "castle"],
    },
    {
        color: "blue",
        age: 1,
        name: "Writing",
        dogmasEnglish: ["Draw a 2.", "TEST"],
        dogmasFunction: ["writing"],
        mainSymbol: "bulb",
        symbols: ["hex", "", "", "bulb", "bulb", "crown"],
    },
    {
        color: "purple",
        age: 1,
        name: "AP Philosophy",
        dogmasEnglish: ["Score a card from your hand."],
        dogmasFunction: ["scoreOneFromHand"],
        mainSymbol: "bulb",
        symbols: ["hex", "", "", "bulb", "bulb", "bulb"],
    },
    {
        color: "yellow",
        age: 1,
        name: "MegaWriting",
        dogmasEnglish: ["You may draw a 3.", "You may draw a 10."],
        dogmasFunction: ["mayDrawAThree", "mayDrawATen"],
        mainSymbol: "leaf",
        symbols: ["leaf", "", "", "hex", "leaf", "bulb"],
    },
    {
        color: "red",
        age: 1,
        name: "Walls",
        dogmasEnglish: ["Splay your purple cards left."],
        dogmasFunction: ["splayPurpleLeft"],
        mainSymbol: "clock",
        symbols: ["leaf", "", "", "hex", "clock", "clock"],
    },
    {
        color: "yellow",
        age: 1,
        name: "Agriculture",
        dogmasEnglish: ["You may return a card from your hand. If you do, score a card of value x+1."],
        dogmasFunction: ["returnOneFromHand"],
        mainSymbol: "leaf",
        symbols: ["leaf", "", "", "hex", "leaf", "leaf"],
    },
    {
        color: "red",
        age: 1,
        name: "A Sharp Stick",
        dogmasEnglish: ["I DEMAND you transfer a card from your score pile to my score pile."],
        dogmasFunction: ["aSharpStick"],
        mainSymbol: "factory",
        symbols: ["factory", "", "", "factory", "factory", "hex"],
    },
]

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
    let cards = Array(0);
    for (let i = 0; i < multiplicity; i++) {
        for (let age = 1; age < 11; age++) {
            cards.push({
                id: ctx.random.Number().toString(),
                color: "green",
                age: age,
                name: "The Wheel",
                dogmasEnglish: ["Draw two 1s.", "TEST"],
                dogmasFunction: ["wheel"],
                mainSymbol: "castle",
                symbols: ["hex", "", "", "castle", "castle", "castle"],
            });
            cards.push({
                id: ctx.random.Number().toString(),
                color: "blue",
                age: age,
                name: "Writing",
                dogmasEnglish: ["Draw a 2.", "TEST"],
                dogmasFunction: ["writing"],
                mainSymbol: "bulb",
                symbols: ["hex", "", "", "bulb", "bulb", "crown"],
            });
            cards.push({
                id: ctx.random.Number().toString(),
                color: "purple",
                age: age,
                name: "AP Philosophy",
                dogmasEnglish: ["Score a card from your hand."],
                dogmasFunction: ["scoreOneFromHand"],
                mainSymbol: "bulb",
                symbols: ["hex", "", "", "bulb", "bulb", "bulb"],
            });
            cards.push({
                id: ctx.random.Number().toString(),
                color: "yellow",
                age: age,
                name: "MegaWriting",
                dogmasEnglish: ["You may draw a 3.", "You may draw a 10."],
                dogmasFunction: ["mayDrawAThree", "mayDrawATen"],
                mainSymbol: "leaf",
                symbols: ["leaf", "", "", "hex", "leaf", "bulb"],
            });
            cards.push({
                id: ctx.random.Number().toString(),
                color: "red",
                age: age,
                name: "Walls",
                dogmasEnglish: ["Splay your purple cards left."],
                dogmasFunction: ["splayPurpleLeft"],
                mainSymbol: "clock",
                symbols: ["leaf", "", "", "hex", "clock", "clock"],
            });
            cards.push({
                id: ctx.random.Number().toString(),
                color: "yellow",
                age: age,
                name: "Agriculture",
                dogmasEnglish: ["You may return a card from your hand. If you do, score a card of value x+1."],
                dogmasFunction: ["returnOneFromHand"],
                mainSymbol: "leaf",
                symbols: ["leaf", "", "", "hex", "leaf", "leaf"],
            });
            cards.push({
                id: ctx.random.Number().toString(),
                color: "red",
                age: age,
                name: "A Sharp Stick",
                dogmasEnglish: ["I DEMAND you transfer a card from your score pile to my score pile."],
                dogmasFunction: ["aSharpStick"],
                mainSymbol: "factory",
                symbols: ["factory", "", "", "factory", "factory", "hex"],
            });
        }
    }
    return cards;
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

export const functionsTable = {
    "wheel": (G, playerID, originatingPlayerID) => drawMultiple(G, playerID, 1, 2),
    "writing": (G, playerID, originatingPlayerID) => drawMultiple(G, playerID, 2, 1),
    "shareDraw": (G, playerID, originatingPlayerID) => drawNormal(G, playerID),
    "scoreOneFromHand": (G, playerID, originatingPlayerID, cardID) => {
        let index = G[playerID].hand.findIndex(element => (element.id === cardID));
        if (index === -1) {
            return INVALID_MOVE;
        }
        let name = G[playerID].hand[index].name;
        G[playerID].score.push(G[playerID].hand[index]);
        G[playerID].hand.splice(index, 1);
        G.log.push("Player " + playerID + " scores " + name + " from hand");
    },
    "returnOneFromHand": (G, playerID, originatingPlayerID, cardID) => {
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
    },
    "mayDrawATen": (G, playerID, originatingPlayerID, msg) => {
        if (msg === "no") {
            G.log.push("Player " + playerID + " declines to draw a 10");
            return;
        }
        if (msg === "yes") {
            drawMultiple(G, playerID, 10, 1)
            return;
        }
        return INVALID_MOVE;
    },
    "mayDrawAThree": (G, playerID, originatingPlayerID, msg) => {
        if (msg === "no") {
            G.log.push("Player " + playerID + " declines to draw a 3");
            return;
        }
        if (msg === "yes") {
            drawMultiple(G, playerID, 3, 1)
            return;
        }
        return INVALID_MOVE;
    },
    "splayPurpleLeft": (G, playerID, originatingPlayerID) => {
        if (G[playerID].board['purple'].length > 1) {
            G[playerID].board.splay['purple'] = 'left';
        }
    },
    "decline": (G, playerID, originatingPlayerID, msg) => {
        if (msg === "no") {
            G.log.push("Player " + playerID + " declines");
            return;
        }
        return INVALID_MOVE;
    },
    // I DEMAND you transfer a card from your score pile to my score pile.
    "aSharpStick": (G, playerID, originatingPlayerID, cardID) => {
        let index = G[playerID].score.findIndex(element => (element.id === cardID));
        if (index === -1) {
            return INVALID_MOVE;
        }
        let name = G[playerID].score[index].name;
        G[originatingPlayerID].score.push(G[playerID].score[index]);
        G[playerID].score.splice(index, 1);
        G.log.push("Player " + playerID + " transfers " + name + " from their score pile to " + originatingPlayerID + "'s score pile.");
    },
};