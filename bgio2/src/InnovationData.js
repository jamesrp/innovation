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
                name: "The Wheel/" + age.toString() + "/" + i.toString(),
                dogmasEnglish: ["Draw two 1s."],
                dogmasFunction: ["wheel"],
                mainSymbol: "castle",
                symbols: ["hex", "", "", "castle", "castle", "castle"],
            });
            cards.push({
                id: ctx.random.Number().toString(),
                color: "blue",
                age: age,
                name: "Writing/" + age.toString() + "/" + i.toString(),
                dogmasEnglish: ["Draw a 2."],
                dogmasFunction: ["writing"],
                mainSymbol: "bulb",
                symbols: ["hex", "", "", "bulb", "bulb", "crown"],
            });
            cards.push({
                id: ctx.random.Number().toString(),
                color: "purple",
                age: age,
                name: "Mostly Philosophy/" + age.toString() + "/" + i.toString(),
                dogmasEnglish: ["Score a card from your hand."],
                dogmasFunction: ["scoreOneFromHand"],
                mainSymbol: "bulb",
                symbols: ["hex", "", "", "bulb", "bulb", "bulb"],
            });
            cards.push({
                id: ctx.random.Number().toString(),
                color: "yellow",
                age: age,
                name: "MegaWriting/" + age.toString() + "/" + i.toString(),
                dogmasEnglish: ["You may draw a 3."],
                dogmasFunction: ["mayDrawATen"],
                mainSymbol: "leaf",
                symbols: ["leaf", "", "", "hex", "leaf", "bulb"],
            });
        }
    }
    return cards;
}

export const stackablesTable = {
    "wheel": (G, playerID) => ({
        name: "wheel",
        playerToMove: "",
        executeBlind: "wheel",
        playerID: playerID,
    }),
    "writing": (G, playerID) => ({
        name: "writing",
        playerToMove: "",
        executeBlind: "writing",
        playerID: playerID,
    }),
    "shareDraw": (G, playerID) => ({
        name: "shareDraw",
        playerToMove: "",
        executeBlind: "shareDraw",
        playerID: playerID,
    }),
    "scoreOneFromHand": (G, playerID) => ({
        name: "scoreOneFromHand",
        playerToMove: playerID,
        executeWithCard: "scoreOneFromHand",
        cardOptions: Array(0), // TODO: fill out with player's hand.
        // TODO: if player has no hand make it a noop.
        playerID: playerID,
    }),
    "mayDrawATen": (G, playerID) => ({
        name: "mayDrawATen",
        playerToMove: playerID,
        executeWithMenu: "mayDrawATen",
        menuOptions: Array.of("yes", "no"),
        playerID: playerID,
    }),
}