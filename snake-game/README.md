# Snake Game (HTML/JS)

A modern, responsive Snake game implemented in vanilla JavaScript, HTML, and CSS. Includes keyboard and touch controls, pause/restart, speed selection, and high score persistence using `localStorage`.

## Files
- `index.html` — UI layout and canvas
- `style.css` — Styles and responsive layout
- `main.js` — Game logic and input handling

## How to Run
1. Open `index.html` directly in your browser.
   - On macOS, you can right-click `index.html` and choose "Open With" → your browser.
2. Play with keyboard or touch controls.

No build step or server is required.

## Controls
- Arrow Keys or WASD — Move
- Space or P — Pause/Resume
- Enter — Start/Restart
- On-screen D-Pad — Touch controls (mobile)

## Settings
- Speed selector: Slow, Normal, Fast, Insane
- High score automatically saved in your browser storage

## Notes
- The canvas is rendered HiDPI-aware for crisp graphics.
- The grid is 24x24; snake grows by one per food.
- Colliding with walls or yourself ends the game.
