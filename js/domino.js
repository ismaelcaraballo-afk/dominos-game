/**
 * domino.js — Tile data model & pip layout
 *
 * A domino is represented as { high, low, id }
 * where high >= low (0–6).
 */

'use strict';

// Pip grid positions (9 slots in a 3×3 grid, indexed 0–8)
//   0 1 2
//   3 4 5
//   6 7 8
const PIP_LAYOUTS = {
  0: [],
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

/**
 * Generate a full standard double-six set (28 tiles).
 * @returns {Array<{high:number, low:number, id:string}>}
 */
function createFullSet() {
  const tiles = [];
  for (let high = 0; high <= 6; high++) {
    for (let low = 0; low <= high; low++) {
      tiles.push({ high, low, id: `${high}-${low}` });
    }
  }
  return tiles;
}

/**
 * Fisher–Yates shuffle (mutates array).
 * @param {Array} arr
 * @returns {Array}
 */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Return pip slot indices for a given face value.
 * @param {number} value 0–6
 * @returns {number[]}
 */
function getPipSlots(value) {
  return PIP_LAYOUTS[value] ?? [];
}

/**
 * Whether a tile is a double.
 * @param {{high:number, low:number}} tile
 * @returns {boolean}
 */
function isDouble(tile) {
  return tile.high === tile.low;
}

/**
 * Total pip count of a tile.
 * @param {{high:number, low:number}} tile
 * @returns {number}
 */
function pipCount(tile) {
  return tile.high + tile.low;
}
