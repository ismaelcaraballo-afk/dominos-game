/**
 * game.js — Core game state machine
 *
 * States: IDLE → DEALING → PLAYING → ROUND_END → GAME_OVER
 */

'use strict';

const Game = (() => {
  // Config
  let config = {
    playerCount: 2,
    pointsGoal:  100,
    tilesPerHand: 7,
  };

  // State
  let players   = [];
  let boneyard  = [];
  let turnIndex = 0;
  let roundNum  = 0;
  let state     = 'IDLE';

  // ------------------------------------------------------------------ Public

  function getState()          { return state; }
  function getPlayers()        { return players; }
  function getCurrentPlayer()  { return players[turnIndex]; }
  function getBoneyardCount()  { return boneyard.length; }
  function getRoundNum()       { return roundNum; }

  /**
   * Start a brand new game.
   * @param {{ playerCount:number, pointsGoal:number }} cfg
   */
  function startGame(cfg) {
    Object.assign(config, cfg);
    roundNum = 0;
    players = _createPlayers();
    _startRound();
  }

  /** Draw one tile from boneyard into player's hand. Returns tile or null. */
  function drawFromBoneyard(player) {
    if (boneyard.length === 0) return null;
    const tile = boneyard.pop();
    player.addTile(tile);
    UI.refreshHand(player);
    UI.updateBoneyard(boneyard.length);
    return tile;
  }

  /**
   * Attempt to play a tile.
   * @param {Player} player
   * @param {{high:number,low:number,id:string}} tile
   * @param {'left'|'right'} end
   * @returns {boolean} success
   */
  function playTile(player, tile, end) {
    const validEnds = Board.validEnds(tile);
    if (!validEnds.includes(end)) return false;

    player.removeTile(tile.id);
    Board.place(tile, end);
    if (window.GameAudio) GameAudio.onTilePlaced();

    UI.refreshHand(getCurrentPlayer());
    UI.updateScores(players);

    if (player.isEmpty()) {
      _endRound('win', player);
      return true;
    }

    _advanceTurn();
    return true;
  }

  /** Called when a player cannot play and boneyard is empty. */
  function passTurn(player) {
    _advanceTurn();
  }

  // ------------------------------------------------------------------ Private

  function _createPlayers() {
    const list = [];
    list.push(new Player('You', 'human', 0));
    for (let i = 1; i < config.playerCount; i++) {
      list.push(new Player(`CPU ${i}`, 'cpu', i));
    }
    return list;
  }

  function _startRound() {
    roundNum++;
    Board.reset();
    boneyard = shuffle(createFullSet());
    players.forEach(p => p.clearHand());

    // Deal hands
    players.forEach(p => {
      for (let i = 0; i < config.tilesPerHand; i++) {
        p.addTile(boneyard.pop());
      }
    });

    // Determine who goes first (highest double, else highest tile)
    turnIndex = _findFirstPlayer();

    state = 'PLAYING';
    UI.showScreen('game');
    UI.updateBoneyard(boneyard.length);
    UI.updateScores(players);
    UI.refreshHand(getCurrentPlayer());

    _doTurn();
  }

  function _findFirstPlayer() {
    // Look for highest double
    for (let v = 6; v >= 0; v--) {
      for (let i = 0; i < players.length; i++) {
        if (players[i].hand.some(t => t.high === v && t.low === v)) return i;
      }
    }
    // Fallback: player with highest single tile
    let best = 0, bestPips = -1;
    players.forEach((p, i) => {
      const top = Math.max(...p.hand.map(pipCount));
      if (top > bestPips) { bestPips = top; best = i; }
    });
    return best;
  }

  function _advanceTurn() {
    // Check for block (nobody can play)
    const allBlocked = players.every(p => !p.canPlay());
    if (allBlocked && boneyard.length === 0) {
      _endRound('block', null);
      return;
    }

    turnIndex = (turnIndex + 1) % players.length;
    UI.highlightActivePlayer(turnIndex);
    UI.refreshHand(getCurrentPlayer());
    _doTurn();
  }

  function _doTurn() {
    const player = getCurrentPlayer();
    UI.highlightActivePlayer(turnIndex);

    if (player.type === 'cpu') {
      UI.setPassEnabled(false);
      CPU.takeTurn(
        player,
        drawFromBoneyard,
        (p, tile, end) => playTile(p, tile, end),
        passTurn
      );
    } else {
      // Human — enable/disable pass
      const canAct = player.canPlay() || boneyard.length > 0;
      UI.setPassEnabled(!player.canPlay() && boneyard.length === 0);
      UI.refreshHand(player);
    }
  }

  function _endRound(reason, winner) {
    state = 'ROUND_END';

    let winnerIdx = winner ? winner.index : -1;
    let pointsScored = 0;

    if (reason === 'win') {
      // Winner scores sum of all opponents' hands
      pointsScored = players
        .filter(p => p !== winner)
        .reduce((s, p) => s + p.handValue(), 0);
      winner.addScore(pointsScored);
    } else {
      // Block: player with lowest hand value wins
      const sorted = [...players].sort((a, b) => a.handValue() - b.handValue());
      const blockWinner = sorted[0];
      winnerIdx = blockWinner.index;
      pointsScored = players
        .filter(p => p !== blockWinner)
        .reduce((s, p) => s + p.handValue(), 0);
      blockWinner.addScore(pointsScored);
    }

    UI.updateScores(players);

    const gameWinner = players.find(p => p.score >= config.pointsGoal);
    if (gameWinner) {
      state = 'GAME_OVER';
      if (window.GameAudio) {
        gameWinner.index === 0 ? GameAudio.onRoundWin() : GameAudio.onRoundLose();
      }
      UI.showGameOver(gameWinner);
    } else {
      if (window.GameAudio) {
        players[winnerIdx].index === 0 ? GameAudio.onRoundWin() : GameAudio.onRoundLose();
      }
      UI.showRoundEnd(players[winnerIdx], pointsScored, reason);
    }
  }

  /** Restart to new game without changing player count. */
  function newGame() {
    players.forEach(p => { p.score = 0; });
    _startRound();
  }

  function nextRound() {
    _startRound();
  }

  return {
    startGame, newGame, nextRound,
    playTile, passTurn, drawFromBoneyard,
    getState, getPlayers, getCurrentPlayer,
    getBoneyardCount, getRoundNum,
  };
})();
