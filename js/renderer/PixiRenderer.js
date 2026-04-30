'use strict';

const PixiRenderer = (() => {
  let _app = null;

  async function init() {
    const wrapper = document.getElementById('board-wrapper');
    if (!wrapper) return;

    _app = new PIXI.Application();
    await _app.init({
      backgroundAlpha: 0,
      width:  wrapper.clientWidth  || 800,
      height: wrapper.clientHeight || 400,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    _app.canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
    wrapper.appendChild(_app.canvas);

    // Hide the DOM board — PixiJS canvas takes over
    const boardEl = document.getElementById('board');
    if (boardEl) boardEl.style.display = 'none';

    window.addEventListener('resize', _onResize);
  }

  function _onResize() {
    const wrapper = document.getElementById('board-wrapper');
    if (!_app || !wrapper) return;
    _app.renderer.resize(wrapper.clientWidth, wrapper.clientHeight);
    if (window.BoardRenderer) BoardRenderer.render(Board.getChain());
  }

  function getApp()   { return _app; }
  function getStage() { return _app ? _app.stage : null; }

  return { init, getApp, getStage };
})();
