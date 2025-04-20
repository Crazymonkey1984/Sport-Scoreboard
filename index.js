// script.js

document.addEventListener('DOMContentLoaded', () => {
  // ── DOM References ──────────────────────────────
  const scores      = {
    home:  document.querySelector('.home .score'),
    guest: document.querySelector('.guest .score'),
  };
  const btns        = document.querySelectorAll('.controls button');
  const pauseBtn    = document.getElementById('pause-btn');
  const resetBtn    = document.getElementById('reset-btn');
  const clockEl     = document.getElementById('game-clock');
  const seriesEl    = document.getElementById('series-status');
  const gameDisp    = document.getElementById('game-display');
  const gameInfo    = document.getElementById('game-info');

  // ── State ────────────────────────────────────────
  const maxPeriods       = 3;
  const maxGamesPerRound = 3;

  let round          = 1;
  let gameInSeries   = 1;
  let period         = 1;
  let elapsedSeconds = 0;
  let isPaused       = false;
  let timerHandle    = null;

  let seriesWon = {
    home:  0,
    guest: 0
  };

  // ── Utility Functions ────────────────────────────
  const ordinals = ['1st','2nd','3rd'];
  function toGameOrdinal(n) {
    return ordinals[(n - 1) % ordinals.length];
  }
  function formatTime(sec) {
    const m = Math.floor(sec / 60),
          s = sec % 60;
    return `${m}:${s < 10 ? '0'+s : s}`;
  }

  function updateLeading() {
    const h = +scores.home.textContent;
    const g = +scores.guest.textContent;
    document.querySelector('.home').classList.toggle('leading', h > g);
    document.querySelector('.guest').classList.toggle('leading', g > h);
  }

  function updateSeriesStatus() {
    if (seriesWon.home > seriesWon.guest) {
      seriesEl.textContent = `Home leads ${seriesWon.home}-${seriesWon.guest}`;
    } else if (seriesWon.guest > seriesWon.home) {
      seriesEl.textContent = `Guest leads ${seriesWon.guest}-${seriesWon.home}`;
    } else {
      seriesEl.textContent = `Series tied ${seriesWon.home}-${seriesWon.guest}`;
    }
  }

  function updateGameInfo() {
    gameInfo.textContent = `Round ${round}, Game ${gameInSeries}`;
  }

  function updateGameDisplay() {
    gameDisp.textContent = toGameOrdinal(gameInSeries);
  }

  function updateClock() {
    clockEl.textContent = formatTime(elapsedSeconds);
  }

  // ── Timer Logic ──────────────────────────────────
  function startTimer() {
    clearInterval(timerHandle);
    isPaused = false;
    pauseBtn.textContent = 'Pause';
    pauseBtn.classList.remove('paused');

    timerHandle = setInterval(() => {
      if (isPaused) return;

      elapsedSeconds++;
      updateClock();

      if (elapsedSeconds >= 20 * 60) {
        clearInterval(timerHandle);
        timerHandle = null;

        if (period < maxPeriods) {
          // End of period → intermission
          isPaused = true;
          pauseBtn.textContent = 'Resume';
          pauseBtn.classList.add('paused');
          period++;
          elapsedSeconds = 0;
          updateClock();
        } else {
          // End of game
          endGame();
        }
      }
    }, 1000);
  }

  // ── Pause/Resume Button ─────────────────────────
  pauseBtn.addEventListener('click', () => {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
    pauseBtn.classList.toggle('paused', !isPaused);

    // If we just resumed and the timer was cleared, restart it
    if (!isPaused && !timerHandle) {
      startTimer();
    }
  });

  // ── End‑of‑Game Logic ────────────────────────────
  function endGame() {
    clearInterval(timerHandle);
    timerHandle = null;

    // Tally series win
    const h = +scores.home.textContent,
          g = +scores.guest.textContent;
    if (h > g)      seriesWon.home++;
    else if (g > h) seriesWon.guest++;

    // Advance game/round
    gameInSeries++;
    if (gameInSeries > maxGamesPerRound) {
      gameInSeries = 1;
      round++;
    }

    // Reset all state for next game
    scores.home.textContent  = '0';
    scores.guest.textContent = '0';
    period         = 1;
    elapsedSeconds = 0;

    // Update displays
    updateLeading();
    updateSeriesStatus();
    updateGameInfo();
    updateGameDisplay();
    updateClock();

    // Auto‑start next game’s clock
    startTimer();
  }

  // ── Score Buttons ───────────────────────────────
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const team = btn.dataset.team;
      scores[team].textContent =
        +scores[team].textContent + parseInt(btn.dataset.points, 10);
      updateLeading();
    });
  });

  // ── Manual End‑Game Button ───────────────────────
  resetBtn.addEventListener('click', endGame);

  // ── Initialization ──────────────────────────────
  updateLeading();
  updateSeriesStatus();
  updateGameInfo();
  updateGameDisplay();
  updateClock();
  startTimer();
});
