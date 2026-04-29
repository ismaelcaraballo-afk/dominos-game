/**
 * ui.js — DOM rendering helpers
 *
 * Responsible for:
 *  - screen transitions
 *  - tile element creation
 *  - hand, board, score, overlay rendering
 */

'use strict';

const UI = (() => {

  // Cache frequently accessed elements
  const screens = {
    start:  document.getElementById('screen-start'),
    setup:  document.getElementById('screen-setup'),
    game:   document.getElementById('screen-game'),
    howto:  document.getElementById('screen-howto'),
  };

  const overlayRound    = document.getElementById('overlay-round');
  const overlayGameover = document.getElementById('overlay-gameover');

  // ------------------------------------------------------------------
  // Screen navigation

  function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    if (screens[name]) screens[name].classList.add('active');
  }

  // ------------------------------------------------------------------
  // Tile element creation

  /**
   * Build a .tile DOM element with correct pip layout.
   * @param {{high:number, low:number, id:string}} tile
   * @param {{ placed?:boolean, horizontal?:boolean, selectable?:boolean }} opts
   * @returns {HTMLElement}
   */
  function createTileElement(tile, opts = {}) {
    const el = document.createElement('div');
    el.classList.add('tile');
    el.dataset.tileId = tile.id;
    if (opts.horizontal) el.classList.add('horizontal');
    if (opts.placed)     el.classList.add('placed');

    el.appendChild(_buildHalf(tile.high));
    const divider = document.createElement('div');
    divider.classList.add('tile-divider');
    el.appendChild(divider);
    el.appendChild(_buildHalf(tile.low));

    return el;
  }

  function _buildHalf(value) {
    const half = document.createElement('div');
    half.classList.add('tile-half');
    const slots = getPipSlots(value);
    for (let i = 0; i < 9; i++) {
      const pip = document.createElement('div');
      pip.classList.add('pip');
      if (!slots.includes(i)) pip.classList.add('hidden');
      half.appendChild(pip);
    }
    return half;
  }

  // ------------------------------------------------------------------
  // Hand rendering

  /**
   * Re-render the active human player's hand.
   * @param {Player} player
   */
  function refreshHand(player) {
    const handEl = document.getElementById('player-hand');
    if (!handEl) return;
    handEl.innerHTML = '';

    if (player.type !== 'human') return; // Only show human hand

    player.hand.forEach(tile => {
      const canPlay = Board.canPlay(tile);
      const el = createTileElement(tile, { selectable: canPlay });
      if (!canPlay) el.classList.add('unplayable');

      el.addEventListener('click', () => {
        if (!canPlay) return;
        _handleTileClick(player, tile, el);
      });

      handEl.appendChild(el);
    });
  }

  let _selectedTile = null;
  let _selectedEl   = null;

  function _handleTileClick(player, tile, el) {
    const ends = Board.validEnds(tile);

    // Deselect if clicking same tile
    if (_selectedTile && _selectedTile.id === tile.id) {
      _clearSelection();
      return;
    }

    // If board is empty, just play immediately
    if (Board.isEmpty()) {
      _clearSelection();
      Game.playTile(player, tile, 'left');
      return;
    }

    // If only one valid end — play immediately
    if (ends.length === 1) {
      _clearSelection();
      Game.playTile(player, tile, ends[0]);
      return;
    }

    // Two ends — select and let user pick
    _clearSelection();
    _selectedTile = tile;
    _selectedEl   = el;
    el.classList.add('selected');
    _showEndPicker(player, tile, ends);
  }

  function _clearSelection() {
    if (_selectedEl) _selectedEl.classList.remove('selected');
    _selectedTile = null;
    _selectedEl   = null;
    _removeEndPicker();
  }

  function _showEndPicker(player, tile, ends) {
    _removeEndPicker();
    const picker = document.createElement('div');
    picker.id = 'end-picker';
    picker.style.cssText = `
      position:fixed; bottom:110px; left:50%; transform:translateX(-50%);
      display:flex; gap:1rem; z-index:50;
      background:var(--felt-dark); padding:.75rem 1.2rem;
      border:1px solid var(--felt-light); border-radius:10px;
      box-shadow:var(--shadow);
    `;
    ends.forEach(end => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-secondary btn-sm';
      btn.textContent = end === 'left'
        ? `← Left (${Board.getLeftEnd()})`
        : `Right (${Board.getRightEnd()}) →`;
      btn.addEventListener('click', () => {
        _clearSelection();
        Game.playTile(player, tile, end);
      });
      picker.appendChild(btn);
    });
    document.body.appendChild(picker);
  }

  function _removeEndPicker() {
    document.getElementById('end-picker')?.remove();
  }

  // ------------------------------------------------------------------
  // Score bar

  function updateScores(players) {
    const container = document.getElementById('scores-container');
    if (!container) return;
    container.innerHTML = '';
    players.forEach((p, i) => {
      const pill = document.createElement('div');
      pill.classList.add('score-pill');
      pill.dataset.playerIndex = i;
      pill.innerHTML = `
        <span class="player-name">${p.name} (${p.hand.length} tiles)</span>
        <span class="player-score">${p.score} pts</span>
      `;
      container.appendChild(pill);
    });
  }

  function highlightActivePlayer(index) {
    document.querySelectorAll('.score-pill').forEach((el, i) => {
      el.classList.toggle('active-player', i === index);
    });
  }

  // ------------------------------------------------------------------
  // Boneyard

  function updateBoneyard(count) {
    const countEl = document.getElementById('boneyard-count');
    const pileEl  = document.getElementById('boneyard-pile');
    if (countEl) countEl.textContent = count;
    if (pileEl)  pileEl.classList.toggle('empty', count === 0);
  }

  // ------------------------------------------------------------------
  // Pass button

  function setPassEnabled(enabled) {
    const btn = document.getElementById('btn-pass');
    if (btn) btn.disabled = !enabled;
  }

  // ------------------------------------------------------------------
  // Overlays

  function showRoundEnd(winner, points, reason) {
    overlayRound.classList.remove('hidden');
    document.getElementById('round-result-title').textContent =
      reason === 'block' ? 'Game Blocked!' : 'Round Over!';
    document.getElementById('round-result-body').textContent =
      `${winner.name} wins this round and scores ${points} point${points !== 1 ? 's' : ''}.`;
  }

  function showGameOver(winner) {
    overlayGameover.classList.remove('hidden');
    document.getElementById('gameover-body').textContent =
      `${winner.name} reached ${winner.score} points — victory!`;
  }

  function hideOverlays() {
    overlayRound.classList.add('hidden');
    overlayGameover.classList.add('hidden');
  }

  // ------------------------------------------------------------------

  return {
    showScreen,
    createTileElement,
    refreshHand,
    updateScores,
    highlightActivePlayer,
    updateBoneyard,
    setPassEnabled,
    showRoundEnd,
    showGameOver,
    hideOverlays,
  };
})();
