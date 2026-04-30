/**
 * main.js — Entry point & event wiring
 *
 * Wires all button clicks and delegates to Game / UI.
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  // ================================================================
  // AUDIO — init on first user interaction to satisfy browser policy
  // ================================================================
  let audioReady = false;
  function ensureAudio() {
    if (!audioReady) { Audio.init(); audioReady = true; }
  }
  document.body.addEventListener('pointerdown', ensureAudio, { once: true });

  // Helper: play a click sound on every .btn press
  document.body.addEventListener('click', (e) => {
    if (e.target.closest('.btn')) { ensureAudio(); Audio.play('click'); }
  });

  // ================================================================
  // THEME SWITCHER
  // ================================================================
  const themePicker = document.getElementById('theme-picker');
  const savedTheme  = localStorage.getItem('dominos-theme') || 'felt';
  document.body.dataset.theme = savedTheme;
  themePicker.value = savedTheme;

  themePicker.addEventListener('change', () => {
    document.body.dataset.theme = themePicker.value;
    localStorage.setItem('dominos-theme', themePicker.value);
  });

  // ================================================================
  // MUTE BUTTONS (start screen + game HUD share state)
  // ================================================================
  function _updateMuteButtons(soundOn) {
    const label = soundOn ? '🔔 Sound' : '🔕 Muted';
    const gameLabel = soundOn ? '🔔' : '🔕';
    const btnMute     = document.getElementById('btn-mute');
    const btnMuteGame = document.getElementById('btn-mute-game');
    if (btnMute)     btnMute.textContent     = label;
    if (btnMuteGame) btnMuteGame.textContent = gameLabel;
  }

  document.getElementById('btn-mute').addEventListener('click', () => {
    ensureAudio();
    const soundOn = Audio.toggle();
    _updateMuteButtons(soundOn);
  });

  document.getElementById('btn-mute-game').addEventListener('click', () => {
    ensureAudio();
    const soundOn = Audio.toggle();
    _updateMuteButtons(soundOn);
  });

  // ================================================================
  // START SCREEN
  // ================================================================
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

  // ================================================================
  // SETUP SCREEN
  // ================================================================
  document.getElementById('btn-start-game').addEventListener('click', () => {
    const playerCount = parseInt(document.getElementById('player-count').value, 10);
    const pointsGoal  = parseInt(document.getElementById('points-goal').value, 10);
    Audio.play('shuffle');
    Game.startGame({ playerCount, pointsGoal });
  });

  document.getElementById('btn-back-setup').addEventListener('click', () => {
    UI.showScreen('start');
  });

  // ================================================================
  // HOW TO PLAY SCREEN
  // ================================================================
  document.getElementById('btn-back-howto').addEventListener('click', () => {
    UI.showScreen('start');
  });

  // ================================================================
  // GAME SCREEN
  // ================================================================
  document.getElementById('btn-menu').addEventListener('click', () => {
    UI.showPauseMenu();
  });

  document.getElementById('btn-resume').addEventListener('click', () => {
    UI.hidePauseMenu();
  });

  document.getElementById('btn-pause-main-menu').addEventListener('click', () => {
    UI.hideOverlays();
    UI.showScreen('start');
  });

  document.getElementById('btn-pass').addEventListener('click', () => {
    const player = Game.getCurrentPlayer();
    if (player.type === 'human' && !player.canPlay() && Game.getBoneyardCount() === 0) {
      Audio.play('pass');
      Game.passTurn(player);
    }
  });

  document.getElementById('boneyard-pile').addEventListener('click', () => {
    const player = Game.getCurrentPlayer();
    if (player.type !== 'human') return;
    if (Game.getBoneyardCount() === 0) return;
    const drawn = Game.drawFromBoneyard(player);
    if (drawn) {
      Audio.play('draw');
      if (!player.canPlay() && Game.getBoneyardCount() === 0) {
        UI.setPassEnabled(true);
      }
    }
  });

  // ================================================================
  // ROUND-END OVERLAY
  // ================================================================
  document.getElementById('btn-next-round').addEventListener('click', () => {
    UI.hideOverlays();
    Audio.play('shuffle');
    Game.nextRound();
  });

  // ================================================================
  // GAME-OVER OVERLAY
  // ================================================================
  document.getElementById('btn-play-again').addEventListener('click', () => {
    UI.hideOverlays();
    Audio.play('shuffle');
    Game.newGame();
  });

  document.getElementById('btn-main-menu').addEventListener('click', () => {
    UI.hideOverlays();
    UI.showScreen('start');
  });

  // ================================================================
  // AUDIO HOOKS exposed for game.js to call
  // ================================================================
  window.GameAudio = {
    onTilePlaced()  { Audio.play('place'); },
    onRoundWin()    { Audio.play('win');   },
    onRoundLose()   { Audio.play('lose');  },
  };

  // Show start screen
  UI.showScreen('start');
});
