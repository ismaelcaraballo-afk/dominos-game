/**
 * player.js — Human and CPU player model
 */

'use strict';

class Player {
  /**
   * @param {string} name
   * @param {'human'|'cpu'} type
   * @param {number} index
   */
  constructor(name, type, index) {
    this.name   = name;
    this.type   = type;
    this.index  = index;
    this.hand   = [];   // Array<tile>
    this.score  = 0;
  }

  /** Add a tile to the player's hand. */
  addTile(tile) {
    this.hand.push(tile);
  }

  /**
   * Remove a tile from hand by id and return it.
   * @param {string} tileId
   * @returns {{high:number,low:number,id:string}}
   */
  removeTile(tileId) {
    const idx = this.hand.findIndex(t => t.id === tileId);
    if (idx === -1) throw new Error(`Tile ${tileId} not in hand.`);
    return this.hand.splice(idx, 1)[0];
  }

  /** Whether the hand is empty (player went out). */
  isEmpty() {
    return this.hand.length === 0;
  }

  /** Sum of pip counts in hand (for scoring). */
  handValue() {
    return this.hand.reduce((sum, t) => sum + pipCount(t), 0);
  }

  /** Return tiles that are playable given current board ends. */
  playableTiles() {
    return this.hand.filter(t => Board.canPlay(t));
  }

  /** True if the player has any playable tile. */
  canPlay() {
    return this.playableTiles().length > 0;
  }

  /** Add points earned this round to cumulative score. */
  addScore(pts) {
    this.score += pts;
  }

  /** Reset hand for a new round (keep cumulative score). */
  clearHand() {
    this.hand = [];
  }
}
