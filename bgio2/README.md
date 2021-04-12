# BGIO implementations

This app is built from the boardgame.io tutorial and contains several games. Lost Cities is feature-complete and was
created to learn the framework. Innovation and Glory to Rome are unfinished.

Created from https://boardgame.io/documentation/

Usage:

1. Install nodejs and npm however (e.g. `apt-get install nodejs npm` or `brew install npm`)
1. `npm install`
1. In two terminals, `npm start` and `npm run serve`.
1. Then you have two options to load up a game and play against yourself. One is to open two browsers that don't share
   state such as Chrome and an incognito Chrome window, or else Chrome and Firefox. Then browse
   to `localhost:3000/lobby` and create a game with the UI and then join with both players.
1. HOWEVER, this is slow. So for developing I tend to navigate directly to match URLs and skip the auth. For
   example, `localhost:3000/match/i/m0/0` and `localhost:3000/match/i/m0/1` will render clients playing as player 0 and
   player 1 respectively, playing at match `m0` (can be an arbitrary string), of game `i` (== `innovation`).
