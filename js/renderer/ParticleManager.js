'use strict';

const ParticleManager = (() => {
  const COLORS = [0xffd700, 0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xffeaa7, 0xe8b84b];

  function burst(x, y, count = 50) {
    const app = PixiRenderer.getApp();
    if (!app) return;

    const particles = Array.from({ length: count }, () => {
      const p = new PIXI.Graphics();
      const size = 4 + Math.random() * 5;
      p.rect(0, 0, size, size);
      p.fill(COLORS[Math.floor(Math.random() * COLORS.length)]);
      p.x  = x;
      p.y  = y;
      p.rotation = Math.random() * Math.PI * 2;
      p._vx      = (Math.random() - 0.5) * 14;
      p._vy      = (Math.random() - 1.8) * 10;
      p._gravity = 0.45;
      p._life    = 1;
      app.stage.addChild(p);
      return p;
    });

    const tick = () => {
      let anyAlive = false;
      particles.forEach(p => {
        if (p._life <= 0) return;
        p._vy += p._gravity;
        p.x   += p._vx;
        p.y   += p._vy;
        p._life  -= 0.018;
        p.alpha   = Math.max(0, p._life);
        p.rotation += 0.08;
        if (p._life > 0) anyAlive = true;
        else app.stage.removeChild(p);
      });
      if (!anyAlive) app.ticker.remove(tick);
    };

    app.ticker.add(tick);
  }

  return { burst };
})();
