// Snake Game - Vanilla JS
(function () {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const overlay = document.getElementById('overlay');
  const scoreEl = document.getElementById('score');
  const highScoreEl = document.getElementById('highScore');
  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const restartBtn = document.getElementById('restartBtn');
  const speedSelect = document.getElementById('speed');

  // Render scale for crisp lines on HiDPI displays
  function setupHiDPI() {
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    const width = 480;
    const height = 480;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  setupHiDPI();
  window.addEventListener('resize', setupHiDPI);

  // Game config
  const COLS = 24;
  const ROWS = 24;
  const CELL = canvas.width / (Math.max(1, Math.floor(window.devicePixelRatio || 1)) * COLS);

  // Colors
  const COLORS = {
    bg: '#ffffff',
    grid: 'rgba(2,6,23,0.06)',
    snakeHead: '#22c55e',
    snakeBody: '#16a34a',
    snakeOutline: '#065f46',
    eyeWhite: '#ffffff',
    eyePupil: '#0b1020',
    tongue: '#ef4444',
    food: '#f59e0b',
    foodGlow: 'rgba(245, 158, 11, 0.35)',
  };

  // Background fixed to white; no cycling

  // Game state
  let snake, dir, dirQueue, food, score, highScore, running, lastTick, tickInterval;
  // Moving food state
  const FOOD_MOVE_INTERVAL = 3; // moves once every 3 snake ticks (slower than snake)
  let foodDir = { x: 0, y: 0 };
  let foodTick = 0;
  // Particle system for explosions
  let particles = [];
  let lastFrame = 0; // for per-frame animations

  function resetGame() {
    snake = [
      { x: 8, y: 12 },
      { x: 7, y: 12 },
      { x: 6, y: 12 },
    ];
    dir = { x: 1, y: 0 };
    dirQueue = [];
    food = spawnFood();
    // initialize moving food direction and tick
    foodDir = randomDir();
    foodTick = 0;
    score = 0;
    updateScore();
    running = false;
    lastTick = 0;
    lastFrame = 0;
    particles = [];
    setSpeed(parseInt(speedSelect.value, 10));
    showOverlay('Press Start or Enter to play');
  }

  function setSpeed(cellsPerSecond) {
    const min = 3;
    const max = 24;
    const cps = Math.max(min, Math.min(max, cellsPerSecond));
    tickInterval = 1000 / cps;
  }

  function updateScore() {
    scoreEl.textContent = String(score);
    if (highScore == null) {
      highScore = parseInt(localStorage.getItem('snake.highScore') || '0', 10) || 0;
    }
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('snake.highScore', String(highScore));
    }
    highScoreEl.textContent = String(highScore);
  }

  function spawnFood() {
    while (true) {
      const x = Math.floor(Math.random() * COLS);
      const y = Math.floor(Math.random() * ROWS);
      if (!snake || !snake.some(p => p.x === x && p.y === y)) {
        return { x, y };
      }
    }
  }

  // --- Particle system ---
  function spawnParticles(x, y) {
    const fruits = ['🍎','🍌','🍇','🍊','🍓','🍉','🍐','🍒'];
    const count = 60; // bigger burst
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = CELL * (6 + Math.random() * 9); // px/sec
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const maxLife = 0.7 + Math.random() * 0.5; // seconds
      const base = CELL * (0.9 + Math.random() * 0.6); // base font size
      const rot = Math.random() * Math.PI * 2;
      const rotVel = (Math.random() * 2 - 1) * 7; // rad/sec
      const emoji = fruits[Math.floor(Math.random() * fruits.length)];
      particles.push({ type: 'fruit', emoji, x, y, vx, vy, life: 0, maxLife, base, rot, rotVel });
    }
  }

  function updateParticles(dt) {
    if (particles.length === 0) return;
    const drag = 0.9; // slightly more drag for nicer easing
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= Math.pow(drag, dt * 60);
      p.vy *= Math.pow(drag, dt * 60);
      if (p.type === 'fruit') {
        p.rot += p.rotVel * dt;
      }
      if (p.life >= p.maxLife) {
        particles.splice(i, 1);
      }
    }
  }

  function drawParticles() {
    if (particles.length === 0) return;
    for (const p of particles) {
      const t = Math.min(1, p.life / p.maxLife);
      const alpha = 1 - t;
      if (p.type === 'fruit') {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot || 0);
        // scale down over life for a popping effect
        const size = p.base * (1 - t * 0.4);
        ctx.font = `${Math.floor(size)}px Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // subtle shadow for visibility on white
        ctx.shadowColor = 'rgba(0,0,0,0.25)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetY = 1;
        ctx.fillText(p.emoji, 0, 0);
        ctx.restore();
      }
    }
  }

  function startGame() {
    if (!running) {
      running = true;
      hideOverlay();
      lastTick = performance.now();
      lastFrame = lastTick;
      requestAnimationFrame(loop);
    }
  }

  function pauseGame() {
    running = false;
    showOverlay('Paused — Press Space/P or Resume');
  }

  function togglePause() {
    running ? pauseGame() : startGame();
  }

  function gameOver() {
    running = false;
    showOverlay(`Game Over<br/>Score: ${score} — High: ${highScore}<br/><small>Enter to restart</small>`);
  }

  function loop(now) {
    if (!running) return;

    // Per-frame particle updates
    const dt = Math.min(0.05, Math.max(0, (now - lastFrame) / 1000)); // clamp dt for stability
    lastFrame = now;
    updateParticles(dt);

    // Snake updates only on tick
    if (now - lastTick >= tickInterval) {
      update();
      lastTick = now;
    }

    // Always draw each frame so explosions are smooth
    draw();
    requestAnimationFrame(loop);
  }

  function update() {
    // Direction updates: take one from queue if available
    if (dirQueue.length) {
      dir = dirQueue.shift();
    }

    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    // Wall collision -> game over
    if (head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS) {
      gameOver();
      return;
    }

    // Self collision
    if (snake.some(seg => seg.x === head.x && seg.y === head.y)) {
      gameOver();
      return;
    }

    // Move snake
    snake.unshift(head);

    // Food eaten?
    if (head.x === food.x && head.y === food.y) {
      score += 1;
      updateScore();
      // Spawn explosion at the eaten apple location (head center)
      const fx = head.x * CELL + CELL / 2;
      const fy = head.y * CELL + CELL / 2;
      spawnParticles(fx, fy);
      food = spawnFood();
      // reset movement timer for new apple
      foodDir = randomDir();
      foodTick = 0;
      // grow by not popping tail
    } else {
      snake.pop();
    }

    // Move the food every few ticks (slower)
    foodTick++;
    if (foodTick % FOOD_MOVE_INTERVAL === 0) {
      moveFood();
    }
  }

  function randomDir() {
    const dirs = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 },
    ];
    return dirs[Math.floor(Math.random() * dirs.length)];
  }

  function isOccupiedBySnake(x, y) {
    return snake.some(seg => seg.x === x && seg.y === y);
  }

  function validFoodNeighbors() {
    const candidates = [
      { x: food.x + 1, y: food.y },
      { x: food.x - 1, y: food.y },
      { x: food.x, y: food.y + 1 },
      { x: food.x, y: food.y - 1 },
    ];
    return candidates.filter(p => p.x >= 0 && p.y >= 0 && p.x < COLS && p.y < ROWS && !isOccupiedBySnake(p.x, p.y));
  }

  function moveFood() {
    // try moving in current direction if valid; otherwise pick a random valid neighbor
    const target = { x: food.x + foodDir.x, y: food.y + foodDir.y };
    const canGoCurrent = target.x >= 0 && target.y >= 0 && target.x < COLS && target.y < ROWS && !isOccupiedBySnake(target.x, target.y);
    if (canGoCurrent) {
      food = target;
      return;
    }
    const neighbors = validFoodNeighbors();
    if (neighbors.length) {
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      foodDir = { x: Math.sign(next.x - food.x), y: Math.sign(next.y - food.y) };
      food = next;
    }
    // else: stuck, do nothing this interval
  }

  function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= COLS; x++) {
      ctx.moveTo(x * CELL + 0.5, 0);
      ctx.lineTo(x * CELL + 0.5, ROWS * CELL);
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.moveTo(0, y * CELL + 0.5);
      ctx.lineTo(COLS * CELL, y * CELL + 0.5);
    }
    ctx.stroke();
  }

  function draw() {
    drawGrid();

    // Draw food as an apple emoji
    const fx = food.x * CELL + CELL / 2;
    const fy = food.y * CELL + CELL / 2;
    const emoji = '🍎';
    // Slight shadow for readability on light background (white)
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${Math.floor(CELL * 0.88)}px Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif`;
    ctx.shadowColor = 'rgba(0,0,0,0.25)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 1;
    ctx.fillText(emoji, fx, fy + 1);
    ctx.restore();

    // Draw snake: body with outline, head with eyes and tongue
    for (let i = snake.length - 1; i >= 0; i--) {
      const s = snake[i];
      const x = s.x * CELL;
      const y = s.y * CELL;
      const r = 6; // corner radius
      ctx.fillStyle = i === 0 ? COLORS.snakeHead : COLORS.snakeBody;
      ctx.strokeStyle = COLORS.snakeOutline;
      ctx.lineWidth = 2;
      roundRect(ctx, x + 2, y + 2, CELL - 4, CELL - 4, r);
      ctx.fill();
      ctx.stroke();

      // Draw head details
      if (i === 0) {
        const cx = x + CELL / 2;
        const cy = y + CELL / 2;
        const eyeOffset = CELL * 0.18;
        const eyeRadius = Math.max(1.5, CELL * 0.08);
        // Determine orientation from current direction
        let ex1, ey1, ex2, ey2;
        if (dir.x === 1 && dir.y === 0) { // right
          ex1 = cx + eyeOffset; ey1 = cy - eyeOffset;
          ex2 = cx + eyeOffset; ey2 = cy + eyeOffset;
        } else if (dir.x === -1 && dir.y === 0) { // left
          ex1 = cx - eyeOffset; ey1 = cy - eyeOffset;
          ex2 = cx - eyeOffset; ey2 = cy + eyeOffset;
        } else if (dir.x === 0 && dir.y === -1) { // up
          ex1 = cx - eyeOffset; ey1 = cy - eyeOffset;
          ex2 = cx + eyeOffset; ey2 = cy - eyeOffset;
        } else { // down
          ex1 = cx - eyeOffset; ey1 = cy + eyeOffset;
          ex2 = cx + eyeOffset; ey2 = cy + eyeOffset;
        }

        // Eye whites
        ctx.fillStyle = COLORS.eyeWhite;
        ctx.beginPath(); ctx.arc(ex1, ey1, eyeRadius * 1.2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(ex2, ey2, eyeRadius * 1.2, 0, Math.PI * 2); ctx.fill();

        // Pupils
        ctx.fillStyle = COLORS.eyePupil;
        ctx.beginPath(); ctx.arc(ex1, ey1, eyeRadius * 0.7, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(ex2, ey2, eyeRadius * 0.7, 0, Math.PI * 2); ctx.fill();

        // Tongue (small triangle protruding forward)
        const tongueLen = CELL * 0.18;
        const tongueWidth = CELL * 0.14;
        ctx.fillStyle = COLORS.tongue;
        ctx.beginPath();
        if (dir.x === 1 && dir.y === 0) { // right
          ctx.moveTo(x + CELL - 2, cy);
          ctx.lineTo(x + CELL - 2 + tongueLen, cy - tongueWidth / 2);
          ctx.lineTo(x + CELL - 2 + tongueLen, cy + tongueWidth / 2);
        } else if (dir.x === -1 && dir.y === 0) { // left
          ctx.moveTo(x + 2, cy);
          ctx.lineTo(x + 2 - tongueLen, cy - tongueWidth / 2);
          ctx.lineTo(x + 2 - tongueLen, cy + tongueWidth / 2);
        } else if (dir.x === 0 && dir.y === -1) { // up
          ctx.moveTo(cx, y + 2);
          ctx.lineTo(cx - tongueWidth / 2, y + 2 - tongueLen);
          ctx.lineTo(cx + tongueWidth / 2, y + 2 - tongueLen);
        } else { // down
          ctx.moveTo(cx, y + CELL - 2);
          ctx.lineTo(cx - tongueWidth / 2, y + CELL - 2 + tongueLen);
          ctx.lineTo(cx + tongueWidth / 2, y + CELL - 2 + tongueLen);
        }
        ctx.closePath();
        ctx.fill();
      }
    }

    // Draw fruit burst particles on top for visibility
    drawParticles();
  }

  function roundRect(ctx, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  // Overlay helpers
  function showOverlay(html) {
    overlay.innerHTML = html;
    overlay.classList.remove('hidden');
  }
  function hideOverlay() {
    overlay.classList.add('hidden');
    overlay.innerHTML = '';
  }

  // Input handling
  function queueDirection(nx, ny) {
    // Prevent reversing into immediate opposite
    const last = dirQueue.length ? dirQueue[dirQueue.length - 1] : dir;
    if (last.x + nx === 0 && last.y + ny === 0) return;
    // Avoid multiple same-direction entries in a row
    if (last.x === nx && last.y === ny) return;
    dirQueue.push({ x: nx, y: ny });
  }

  function handleKey(e) {
    const k = e.key.toLowerCase();
    if (k === 'arrowup' || k === 'w') queueDirection(0, -1);
    else if (k === 'arrowdown' || k === 's') queueDirection(0, 1);
    else if (k === 'arrowleft' || k === 'a') queueDirection(-1, 0);
    else if (k === 'arrowright' || k === 'd') queueDirection(1, 0);
    else if (k === ' ' || k === 'p') { e.preventDefault(); togglePause(); }
    else if (k === 'enter') {
      if (!running && snake) {
        // if overlay visible after game over or initial, restart/start
        if (score === 0 && snake.length === 3) startGame(); else restartGame();
      }
    }
  }

  function bindTouchControls() {
    const buttons = document.querySelectorAll('.dpad');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const dir = btn.getAttribute('data-dir');
        if (dir === 'up') queueDirection(0, -1);
        else if (dir === 'down') queueDirection(0, 1);
        else if (dir === 'left') queueDirection(-1, 0);
        else if (dir === 'right') queueDirection(1, 0);
        else if (dir === 'pause') togglePause();
      });
    });
  }

  function restartGame() {
    resetGame();
    startGame();
  }

  // Button events
  startBtn.addEventListener('click', startGame);
  pauseBtn.addEventListener('click', togglePause);
  restartBtn.addEventListener('click', restartGame);
  speedSelect.addEventListener('change', (e) => {
    const val = parseInt(e.target.value, 10);
    setSpeed(val);
  });

  window.addEventListener('keydown', handleKey, { passive: false });
  bindTouchControls();

  // Initialize
  resetGame();
  draw();
})();
