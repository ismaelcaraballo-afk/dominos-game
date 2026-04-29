/**
 * cpu.js — Simple CPU player strategy
 *
 * Strategy: greedy — always plays the highest-pip playable tile.
 * Prefers matching the higher-value end of the chain.
 * Draws from boneyard when no play is available.
 */

'use strict';

const CPU = (() => {

  /**
   * Choose and execute the CPU turn.
   * @param {Player} player
   * @param {Function} onDraw  - callback(player) to draw a tile
   * @param {Function} onPlay  - callback(player, tile, end)
   * @param {Function} onPass  - callback(player)
   */
  function takeTurn(player, onDraw, onPlay, onPass) {
    // Small delay so CPU doesn't feel instant
    setTimeout(() => {
      _executeTurn(player, onDraw, onPlay, onPass);
    }, 900);
  }

  function _executeTurn(player, onDraw, onPlay, onPass) {
    let playable = player.playableTiles();

    // Draw until can play or boneyard empty
    while (playable.length === 0 && Game.getBoneyardCount() > 0) {
      onDraw(player);
      playable = player.playableTiles();
    }

    if (playable.length === 0) {
      onPass(player);
      return;
    }

    // Pick highest-value tile
    playable.sort((a, b) => pipCount(b) - pipCount(a));
    const chosen = playable[0];

    // Pick an end (prefer left if it matches double, else right)
    const ends = Board.validEnds(chosen);
    let end = ends[0];
    if (ends.length > 1) {
      // Prefer the end whose open value is higher
      end = Board.getLeftEnd() >= Board.getRightEnd() ? 'left' : 'right';
      if (!ends.includes(end)) end = ends[0];
    }

    onPlay(player, chosen, end);
  }

  return { takeTurn };
})();
