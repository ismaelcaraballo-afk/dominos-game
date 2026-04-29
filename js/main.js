/**
 * main.js — Entry point & event wiring
 *
 * Wires all button clicks and delegates to Game / UI.
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  // ---- Start screen ----
  document.getElementById('btn-vs-cpu').addEventListener('click', () => {
    UI.showScreen('setup');
    document.getElementById('player-count').value = '2';
  });

  document.getElementById('btn-local-mp').addEventListener('click', () => {
    UI.showScreen('setup');
  });

  document.getElementById('btn-how-to-play').addEventListener('click', () => {
    UI.showScreen('howto');
  });

  // ---- Setup screen ----
  document.getElementById('btn-start-game').addEventListener('click', () => {
    const playerCount = parseInt(document.getElementById('player-count').value, 10);
    const pointsGoal  = parseInt(document.getElementById('points-goal').value, 10);
    Game.startGame({ playerCount, pointsGoal });
  });

  document.getElementById('btn-back-setup').addEventListener('click', () => {
    UI.showScreen('start');
  });

  // ---- How to Play screen ----
  document.getElementById('btn-back-howto').addEventListener('click', () => {
    UI.showScreen('start');
  });

  // ---- Game screen ----
  document.getElementById('btn-menu').addEventListener('click', () => {
    // Simple confirm before leaving
    if (confirm('Return to main menu? Current game will be lost.')) {
      UI.hideOverlays();
      UI.showScreen('start');
    }
  });

  document.getElementById('btn-pass').addEventListener('click', () => {
    const player = Game.getCurrentPlayer();
    if (player.type === 'human' && !player.canPlay() && Game.getBoneyardCount() === 0) {
      Game.passTurn(player);
    }
  });

  document.getElementById('boneyard-pile').addEventListener('click', () => {
    const player = Game.getCurrentPlayer();
    if (player.type !== 'human') return;
    if (Game.getBoneyardCount() === 0) return;
    const drawn = Game.drawFromBoneyard(player);
    if (drawn) {
      // After drawing, check if can now play
      if (!player.canPlay() && Game.getBoneyardCount() === 0) {
        UI.setPassEnabled(true);
      }
    }
  });

  // ---- Round-end overlay ----
  document.getElementById('btn-next-round').addEventListener('click', () => {
    UI.hideOverlays();
    Game.nextRound();
  });

  // ---- Game-over overlay ----
  document.getElementById('btn-play-again').addEventListener('click', () => {
    UI.hideOverlays();
    Game.newGame();
  });

  document.getElementById('btn-main-menu').addEventListener('click', () => {
    UI.hideOverlays();
    UI.showScreen('start');
  });

  // Show the start screen on load
  UI.showScreen('start');
});
