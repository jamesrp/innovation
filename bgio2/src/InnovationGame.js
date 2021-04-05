import {INVALID_MOVE} from 'boardgame.io/core';

export const Innovation = {
    name: 'innovation',
    minPlayers: 2,
    maxPlayers: 4,
    setup: mySetup,

    moves: {
        ChooseOpener
    },

    phases: {
        startPhase: {
            moves: {ChooseOpener},
            stages: {
                myFirstStage: {
                    moves: {ChooseOpener},
                },
            },
            start: true,
        },

        mainPhase: {
            moves: {Draw, Meld, Achieve, Dogma},
        },
    },

};

function Draw(G, ctx) {
    // TODO: not implemented.
    return INVALID_MOVE;
}

function Meld(G, ctx) {
    // TODO: not implemented.
    return INVALID_MOVE;
}

function Achieve(G, ctx) {
    // TODO: not implemented.
    return INVALID_MOVE;
}

function Dogma(G, ctx) {
    // TODO: not implemented.
    return INVALID_MOVE;
}

function ChooseOpener(G, ctx, id) {
    let index = G[ctx.playerID].hand.findIndex(element => (element.id === id));
    if (index === -1) {
        return INVALID_MOVE;
    }
    G[ctx.playerID].board.push(G[ctx.playerID].hand[index]);
    G[ctx.playerID].hand.splice(index, 1);
    G.numDoneOpening += 1;
    if (G.numDoneOpening === ctx.numPlayers) {
        let players = ctx.playOrder.slice();
        players.sort((a, b) => {
            let nameA = G[a].board[0].name;
            let nameB = G[b].board[0].name;
            if (nameA < nameB) {
                return -1;
            } else if (nameA > nameB)  {
                return 1;
            }
            return 0;
        });
        G.leader = players[0];
        ctx.events.setPhase('mainPhase');
        ctx.events.endTurn({ next: G.leader });
    }
}

function mySetup(ctx) {
    let G = {
        decks: generateDecks(ctx),
        achievements: {},
        numDoneOpening: 0,
        leader: "0",
        initialTurnsRemaining: Math.floor(ctx.numPlayers/2),
    };
    for (let i = 0; i < ctx.numPlayers; i++) {
        let playerData = {
            hand: Array(0),
            score: Array(0),
            achievements: Array(0),
            board: Array(0),
        };
        for (let j = 0; j < 2; j++) {
            playerData.hand.push(G.decks["1"].pop());
        }
        G[i.toString()] = playerData;
    }
    for (let i = 1; i < 10; i++) {
        let card = G.decks["1"].pop();
        G.achievements[i.toString()] = Array(1).fill(card);
    }
    ctx.events.setActivePlayers({all: 'myFirstStage', moveLimit: 1});
    return G;
}

function generateDecks(ctx) {
    let decks = {};
    for (let i = 1; i < 11; i++) {
        decks[i.toString()] = Array(0);
    }
    loadCards(ctx).forEach(element => {
        decks[element.age].push(element)
    });
    for (let i = 1; i < 11; i++) {
        decks[i.toString()] = ctx.random.Shuffle(decks[i.toString()]);
    }
    return decks;
}

function loadCards(ctx) {
    // TODO: unstub.
    let cards = Array(0);
    for (let i = 0; i < 10; i++) {
        for (let age = 1; age < 11; age++) {
            cards.push({
                id: ctx.random.Number().toString(),
                color: "green",
                age: age.toString(),
                name: "The Wheel - age " + age.toString() + " - copy " + i.toString(),
                dogmasEnglish: ["Draw two 1s."],
                mainSymbol: "castle",
                symbols: ["hex", "", "", "castle", "castle", "castle"],
            });
        }
    }
    return cards;
}