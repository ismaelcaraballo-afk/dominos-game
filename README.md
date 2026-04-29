# Dominos

A classic double-six block dominos game playable in the browser — no installs, no dependencies.

**Live demo:** `https://<your-username>.github.io/dominos-game/`

---

## Features

- Play vs CPU (greedy AI) or pass-and-play local multiplayer (2–4 players)
- Full double-six tile set with authentic pip rendering
- Automatic boneyard draw, pass detection, and block resolution
- Round-based scoring — first to the points goal wins
- Responsive layout (desktop & mobile)
- Deployed automatically to GitHub Pages on every push to `main`

---

## Project Structure

```
dominos-game/
├── index.html               # Single-page app shell + all screens
├── css/
│   └── style.css            # Dark felt theme, tile & layout styles
├── js/
│   ├── domino.js            # Tile model, pip layouts, shuffle
│   ├── board.js             # Chain state (left/right ends, place/validate)
│   ├── player.js            # Player class (hand, score, playable check)
│   ├── cpu.js               # Greedy CPU strategy
│   ├── game.js              # Game state machine (rounds, scoring, turns)
│   ├── ui.js                # DOM rendering (tiles, hand, scores, overlays)
│   └── main.js              # Entry point — event wiring
├── assets/
│   └── images/              # (optional) favicon, OG image
└── .github/
    └── workflows/
        └── deploy.yml       # GitHub Pages auto-deploy
```

---

## Running Locally

No build step needed — just open `index.html` in a browser:

```bash
# Option A — open directly
open index.html

# Option B — serve with any static server (avoids CORS on some browsers)
npx serve .
# or
python3 -m http.server 8080
```

---

## Deploying to GitHub Pages

1. Push this repo to GitHub.
2. Go to **Settings → Pages → Source → GitHub Actions**.
3. The `deploy.yml` workflow will publish on every push to `main`.
4. Your game will be live at `https://<username>.github.io/<repo-name>/`.

---

## Extending the Game

| Area | File | What to change |
|---|---|---|
| AI difficulty | `js/cpu.js` | Replace greedy strategy with lookahead / scoring heuristic |
| Scoring rules | `js/game.js` `_endRound()` | Add muggins, all-fives variant, etc. |
| Tile visuals | `css/style.css` `.tile` | Swap colours, use SVG pips, add animations |
| Board layout | `js/board.js` `_render()` | Implement branching chain, snake layout |
| Sound effects | `js/main.js` | Add `Audio` calls on play/draw events |

---

## License

MIT
