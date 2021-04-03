import { INVALID_MOVE } from 'boardgame.io/core';

export const Innovation = {
  setup: mySetup,

  turn: {
    moveLimit: 1,
  },

  moves: {
    ClickCell
  },

  phases: {
    startPhase: {
      moves: { ClickCell },
        stages: {
          myFirstStage: {
            moves: { ClickCell },
          },
        },
      next: 'play',
      endIf: G => DoneWithSetup(G.cells),
      start: true,
    },

    play: {
      moves: { ClickCell },
    },
  },

  endIf: (G, ctx) => {
    if (IsVictory(G.cells)) {
      return { winner: ctx.currentPlayer };
    }
    if (IsDraw(G.cells)) {
      return { draw: true };
    }
  },

  playerView: StripSecrets,


};

function ClickCell(G, ctx, id, playerID) {
console.log('hello ClickCell');
  if (G.cells[id] !== null) {
    return INVALID_MOVE;
  }
  if (ctx.phase === "startPhase") {
    var positions = [0, 1, 2];
    if (playerID === "1") {
      positions = [6, 7, 8];
    }
    if (!positions.includes(id)) {
      return INVALID_MOVE;
    }
  }

  G.cells[id] = playerID;
}

// Return true if `cells` is in a winning configuration.
function IsVictory(cells) {
  const positions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6],
    [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]
  ];

  const isRowComplete = row => {
    const symbols = row.map(i => cells[i]);
    return symbols.every(i => i !== null && i === symbols[0]);
  };

  return positions.map(isRowComplete).some(i => i === true);
}

// Return true if all `cells` are occupied.
function IsDraw(cells) {
  return cells.filter(c => c === null).length === 0;
}

// Determines when to end the setup phase - when 2 cells are filled.
function DoneWithSetup(cells) {
  return cells.filter(c => c === null).length === 7;
}

function mySetup(ctx) {
  ctx.events.setActivePlayers({ all: 'myFirstStage', moveLimit: 1 });
  return {
    cells: Array(9).fill(null)
   }
}

// If we are in the start phase, only show the player the move that they have made.
function StripSecrets(G, ctx, playerID)  {
  if (ctx.phase === "startPhase") {
    var opponentPositions = [0, 1, 2];
    if (playerID === "0") {
      opponentPositions = [6, 7, 8];
    }
    const r = { ...G };
    r.cells = [...(G.cells)];
    for (var i = 0; i < 3; ++i) {
        r.cells[opponentPositions[i]] = null;
    }
    return r;
  }
  return G;
}