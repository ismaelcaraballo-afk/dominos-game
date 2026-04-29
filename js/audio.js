/**
 * audio.js — Web Audio API sound engine
 *
 * All sounds are synthesised procedurally (no external files needed).
 * Call Audio.init() once after a user gesture to unlock the AudioContext.
 *
 * Public API:
 *   Audio.init()
 *   Audio.play(name)   — 'place' | 'draw' | 'pass' | 'win' | 'lose' | 'click' | 'shuffle'
 *   Audio.setVolume(0–1)
 *   Audio.toggle()     — mute / unmute
 */

'use strict';

const Audio = (() => {
  let ctx    = null;
  let master = null;   // GainNode
  let muted  = false;

  // ------------------------------------------------------------------ Init

  function init() {
    if (ctx) return;
    ctx    = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(ctx.destination);
  }

  function _ensureCtx() {
    if (!ctx) init();
    if (ctx.state === 'suspended') ctx.resume();
  }

  // ------------------------------------------------------------------ Volume

  function setVolume(v) {
    _ensureCtx();
    master.gain.setTargetAtTime(Math.max(0, Math.min(1, v)), ctx.currentTime, 0.01);
  }

  function toggle() {
    muted = !muted;
    master.gain.setTargetAtTime(muted ? 0 : 0.55, ctx.currentTime, 0.01);
    return !muted;
  }

  // ------------------------------------------------------------------ Helpers

  /** Short oscillator burst. */
  function _osc({ type = 'sine', freq = 440, freq2, duration = 0.12,
                  gain = 0.4, attack = 0.005, decay = 0.08 } = {}) {
    _ensureCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (freq2 !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(freq2, now + duration);
    }

    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(gain, now + attack);
    env.gain.exponentialRampToValueAtTime(0.0001, now + attack + decay);

    osc.connect(env);
    env.connect(master);
    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  /** White-noise burst. */
  function _noise({ duration = 0.1, gain = 0.25, lpFreq = 2000 } = {}) {
    _ensureCtx();
    const now      = ctx.currentTime;
    const bufLen   = ctx.sampleRate * duration;
    const buf      = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data     = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;

    const src    = ctx.createBufferSource();
    src.buffer   = buf;

    const filter = ctx.createBiquadFilter();
    filter.type  = 'lowpass';
    filter.frequency.value = lpFreq;

    const env    = ctx.createGain();
    env.gain.setValueAtTime(gain, now);
    env.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    src.connect(filter);
    filter.connect(env);
    env.connect(master);
    src.start(now);
  }

  // ------------------------------------------------------------------ Sounds

  const sounds = {
    /** Tile placed on board — woody thud */
    place() {
      _noise({ duration: 0.08, gain: 0.35, lpFreq: 900 });
      _osc({ type: 'triangle', freq: 180, freq2: 90, duration: 0.1, gain: 0.2, decay: 0.09 });
    },

    /** Draw tile from boneyard — soft slide */
    draw() {
      _noise({ duration: 0.12, gain: 0.18, lpFreq: 1400 });
      _osc({ type: 'sine', freq: 320, freq2: 280, duration: 0.12, gain: 0.12, decay: 0.1 });
    },

    /** Pass turn — low dull thump */
    pass() {
      _osc({ type: 'triangle', freq: 120, freq2: 80, duration: 0.15, gain: 0.22, decay: 0.12 });
    },

    /** Round / game win — ascending arpeggio */
    win() {
      _ensureCtx();
      const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
      notes.forEach((f, i) => {
        const now  = ctx.currentTime + i * 0.13;
        const osc  = ctx.createOscillator();
        const env  = ctx.createGain();
        osc.type   = 'triangle';
        osc.frequency.value = f;
        env.gain.setValueAtTime(0, now);
        env.gain.linearRampToValueAtTime(0.35, now + 0.01);
        env.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
        osc.connect(env); env.connect(master);
        osc.start(now); osc.stop(now + 0.4);
      });
    },

    /** Round loss — descending minor chord */
    lose() {
      _ensureCtx();
      const notes = [523, 466, 415, 370]; // C5 Bb4 Ab4 F#4
      notes.forEach((f, i) => {
        const now = ctx.currentTime + i * 0.11;
        const osc = ctx.createOscillator();
        const env = ctx.createGain();
        osc.type  = 'sawtooth';
        osc.frequency.value = f;
        env.gain.setValueAtTime(0, now);
        env.gain.linearRampToValueAtTime(0.2, now + 0.01);
        env.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
        osc.connect(env); env.connect(master);
        osc.start(now); osc.stop(now + 0.35);
      });
    },

    /** Button click — crisp tick */
    click() {
      _osc({ type: 'square', freq: 800, freq2: 600, duration: 0.05,
             gain: 0.15, attack: 0.002, decay: 0.04 });
    },

    /** Shuffle / deal — rapid noise flutter */
    shuffle() {
      _ensureCtx();
      for (let i = 0; i < 6; i++) {
        const t = ctx.currentTime + i * 0.045;
        const buf    = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
        const data   = buf.getChannelData(0);
        for (let j = 0; j < data.length; j++) data[j] = Math.random() * 2 - 1;
        const src    = ctx.createBufferSource();
        src.buffer   = buf;
        const env    = ctx.createGain();
        env.gain.setValueAtTime(0.22, t);
        env.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
        src.connect(env); env.connect(master);
        src.start(t);
      }
    },
  };

  // ------------------------------------------------------------------ play()

  function play(name) {
    if (muted) return;
    const fn = sounds[name];
    if (!fn) { console.warn(`Audio: unknown sound "${name}"`); return; }
    try { fn(); } catch (e) { console.warn('Audio playback error', e); }
  }

  // ------------------------------------------------------------------ Expose

  return { init, play, setVolume, toggle };
})();
