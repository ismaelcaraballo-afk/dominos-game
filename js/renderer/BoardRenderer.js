'use strict';

const BoardRenderer = (() => {
  let _container = null;
  let _lastChainLength = 0;

  function init() {
    const stage = PixiRenderer.getStage();
    if (!stage) return;
    _container = new PIXI.Container();
    stage.addChild(_container);
  }

  function render(chain) {
    if (!_container) return;
    _container.removeChildren();

    if (!chain || chain.length === 0) {
      _lastChainLength = 0;
      return;
    }

    const app    = PixiRenderer.getApp();
    const stageW = app.screen.width;
    const stageH = app.screen.height;
    const GAP    = 4;
    const tW     = TileSprite.TILE_W;
    const tH     = TileSprite.TILE_H;
    const rowMax = Math.floor((stageW - 16) / (tW + GAP));

    const isNew  = chain.length > _lastChainLength;
    _lastChainLength = chain.length;

    chain.forEach((entry, i) => {
      const col    = i % rowMax;
      const row    = Math.floor(i / rowMax);
      const totalRowTiles = Math.min(chain.length - row * rowMax, rowMax);
      const rowW   = totalRowTiles * (tW + GAP) - GAP;
      const startX = (stageW - rowW) / 2;
      const startY = (stageH - tH) / 2 - row * (tH + GAP);

      const targetX = startX + col * (tW + GAP);
      const targetY = startY;

      const sprite = TileSprite.create(entry.tile);

      // Animate the last tile in; place all others immediately
      if (isNew && i === chain.length - 1) {
        AnimationManager.animateTileIn(sprite, targetX, targetY);
      } else {
        sprite.x = targetX;
        sprite.y = targetY;
      }

      _container.addChild(sprite);
    });
  }

  return { init, render };
})();
