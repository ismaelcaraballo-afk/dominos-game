'use strict';

const AnimationManager = (() => {

  function animateTileIn(sprite, targetX, targetY) {
    const app = PixiRenderer.getApp();
    if (!app) { sprite.x = targetX; sprite.y = targetY; return; }

    sprite.x     = targetX - 50;
    sprite.y     = targetY;
    sprite.alpha = 0;

    let progress = 0;

    const tick = () => {
      progress = Math.min(1, progress + 0.09);
      sprite.x     = targetX - 50 + 50 * _easeOut(progress);
      sprite.alpha = progress;
      if (progress >= 1) app.ticker.remove(tick);
    };

    app.ticker.add(tick);
  }

  function _easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  return { animateTileIn };
})();
