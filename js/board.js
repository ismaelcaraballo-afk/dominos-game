/**
 * board.js — Chain/board state management
 *
 * The board maintains an ordered chain of played tiles.
 * Each end of the chain has an "open" value that new tiles must match.
 *
 * chain: Array<{ tile, orientation, endExposed }>
 *   orientation: 'horizontal' | 'vertical'
 *   endExposed:  which face value is at this tile's outer end
 */

'use strict';

const Board = (() => {
  let chain = [];       // ordered list of placed tile objects
  let leftEnd = null;   // pip value open on the left end
  let rightEnd = null;  // pip value open on the right end
  let spinner = null;   // reference to the first double (enables branching later)

  /** Reset board for a new round. */
  function reset() {
    chain = [];
    leftEnd = null;
    rightEnd = null;
    spinner = null;
  }

  /** Whether the board is empty (no tiles placed yet). */
  function isEmpty() {
    return chain.length === 0;
  }

  /**
   * Place the very first tile of the round.
   * @param {{high:number, low:number, id:string}} tile
   */
  function placeFirst(tile) {
    if (!isEmpty()) throw new Error('Board already has tiles.');
    chain.push({ tile, side: 'center', orientation: isDouble(tile) ? 'vertical' : 'horizontal' });
    leftEnd  = tile.high;
    rightEnd = tile.low;
    if (isDouble(tile)) spinner = tile;
    _render();
  }

  /**
   * Place a tile on the left or right end.
   * @param {{high:number, low:number, id:string}} tile
   * @param {'left'|'right'} end
   */
  function place(tile, end) {
    if (isEmpty()) { placeFirst(tile); return; }

    let matchValue, newExposed;
    if (end === 'left') {
      matchValue  = leftEnd;
      newExposed  = (tile.high === leftEnd) ? tile.low : tile.high;
      chain.unshift({ tile, side: 'left', exposed: newExposed, orientation: isDouble(tile) ? 'vertical' : 'horizontal' });
      leftEnd = newExposed;
    } else {
      matchValue  = rightEnd;
      newExposed  = (tile.high === rightEnd) ? tile.low : tile.high;
      chain.push({ tile, side: 'right', exposed: newExposed, orientation: isDouble(tile) ? 'vertical' : 'horizontal' });
      rightEnd = newExposed;
    }

    if (!spinner && isDouble(tile)) spinner = tile;
    _render();
  }

  /**
   * Returns which ends a given tile can be played on.
   * @param {{high:number, low:number}} tile
   * @returns {Array<'left'|'right'>}
   */
  function validEnds(tile) {
    if (isEmpty()) return ['left']; // first play — any end works
    const ends = [];
    if (tile.high === leftEnd  || tile.low === leftEnd)  ends.push('left');
    if (tile.high === rightEnd || tile.low === rightEnd) ends.push('right');
    return ends;
  }

  /** Check if a tile can be played somewhere on the board. */
  function canPlay(tile) {
    return isEmpty() || validEnds(tile).length > 0;
  }

  function getLeftEnd()  { return leftEnd; }
  function getRightEnd() { return rightEnd; }
  function getChain()    { return [...chain]; }

  // ---------- Internal rendering ----------

  function _render() {
    if (window.BoardRenderer) {
      BoardRenderer.render([...chain]);
    } else {
      // DOM fallback when PixiJS renderer is not loaded
      const boardEl = document.getElementById('board');
      if (!boardEl) return;
      boardEl.innerHTML = '';
      chain.forEach(entry => {
        const el = UI.createTileElement(entry.tile, {
          placed: true,
          horizontal: entry.orientation === 'horizontal',
        });
        boardEl.appendChild(el);
      });
    }
  }

  return { reset, isEmpty, placeFirst, place, validEnds, canPlay,
           getLeftEnd, getRightEnd, getChain };
})();
