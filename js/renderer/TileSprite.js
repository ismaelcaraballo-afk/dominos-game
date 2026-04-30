'use strict';

const TileSprite = (() => {
  const TILE_W  = 52;
  const TILE_H  = 104;
  const HALF_H  = TILE_H / 2;
  const PAD     = 6;
  const PIP_R   = 4;

  // Pip slot indices map to a 3×3 grid (slots 0–8):
  //  0 1 2
  //  3 4 5
  //  6 7 8
  const PIP_LAYOUTS = {
    0: [],
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
  };

  function create(tile) {
    const container = new PIXI.Container();

    // Tile body
    const bg = new PIXI.Graphics();
    bg.roundRect(0, 0, TILE_W, TILE_H, 5);
    bg.fill(0xf5f0e8);
    bg.stroke({ color: 0xc8b99a, width: 1.5 });
    container.addChild(bg);

    // Divider
    const div = new PIXI.Graphics();
    div.moveTo(PAD, HALF_H);
    div.lineTo(TILE_W - PAD, HALF_H);
    div.stroke({ color: 0x8a7a65, width: 1.5 });
    container.addChild(div);

    // Pips
    _drawHalf(container, tile.high, 0);
    _drawHalf(container, tile.low,  HALF_H);

    return container;
  }

  function _drawHalf(container, value, yBase) {
    const slots  = PIP_LAYOUTS[value] ?? [];
    const cellW  = (TILE_W - PAD * 2) / 3;
    const cellH  = (HALF_H - PAD * 2) / 3;

    slots.forEach(slot => {
      const col = slot % 3;
      const row = Math.floor(slot / 3);
      const cx  = PAD + col * cellW + cellW / 2;
      const cy  = yBase + PAD + row * cellH + cellH / 2;

      const pip = new PIXI.Graphics();
      pip.circle(cx, cy, PIP_R);
      pip.fill(0x1a1a1a);
      container.addChild(pip);
    });
  }

  return { create, TILE_W, TILE_H };
})();
