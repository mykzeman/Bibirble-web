import { initGame, submitFromData } from "./data.js";
import { share } from "./answer.js";

var stage = 0;
var targetIndex = 0;
var currentMode = 'daily';
var currentSeed = null;
var currentHardMode = false;

function getTodayKey() {
    return new Date().toISOString().slice(0, 10);
}

function lockGameForToday() {
    const revealPanel = document.getElementById('reveal-panel');
    const submit = document.getElementById('submit');

    if (revealPanel) {
        revealPanel.innerText = "You already played today! Come back tomorrow 🙌";
    }

    document.querySelectorAll('.game-row').forEach(row => {
        row.querySelectorAll('input, select, button').forEach(el => {
            el.disabled = true;
        });
    });

    if (submit) {
        submit.innerText = "Played Today";
        submit.disabled = true;
    }
}

// Initialize the game on load
// game.js
document.addEventListener('DOMContentLoaded', () => {
    const today = getTodayKey();
    const lastPlayedDaily = localStorage.getItem('lastPlayedDaily');

    const startDailyBtn = document.getElementById('start-daily');
    const startRandomBtn = document.getElementById('start-random');
    const openSettingsBtn = document.getElementById('open-settings');
    const settingsScreen = document.getElementById('settings-screen');
    const settingsBackBtn = document.getElementById('settings-back');
    const seedInput = document.getElementById('settings-seed');
    const newSeedBtn = document.getElementById('settings-new-seed');
    const hardSwitch = document.getElementById('hard-mode');
    const currentSeedDisplay = document.getElementById('current-seed-display');
    const startScreen = document.getElementById('start-screen');
    const gameArea = document.querySelector('.game-scroll-area');
    const keyboard = document.querySelector('.keyboard-panel');
    let settingsReturnTo = 'menu';

    if (startDailyBtn) {
        startDailyBtn.addEventListener('click', async () => {
            currentMode = 'daily';
            // if already played, lock
            if (lastPlayedDaily === today) {
                lockGameForToday();
                return;
            }
            // hide start/settings screens, show game
            if (startScreen) startScreen.classList.add('hidden');
            if (settingsScreen) settingsScreen.classList.add('hidden');
            if (gameArea) gameArea.classList.remove('hidden');
            if (keyboard) keyboard.classList.remove('hidden');
            currentHardMode = !!(hardSwitch && hardSwitch.checked);
            settingsReturnTo = 'game';
            await startGameFromUI();
        });
    }

    if (startRandomBtn) {
        startRandomBtn.addEventListener('click', async () => {
            currentMode = 'random';
            if (startScreen) startScreen.classList.add('hidden');
            if (settingsScreen) settingsScreen.classList.add('hidden');
            if (gameArea) gameArea.classList.remove('hidden');
            if (keyboard) keyboard.classList.remove('hidden');
            currentHardMode = !!(hardSwitch && hardSwitch.checked);
            settingsReturnTo = 'game';
            await startGameFromUI();
        });
    }

    if (seedInput) {
        seedInput.addEventListener('change', () => {
            if (currentSeedDisplay) currentSeedDisplay.textContent = seedInput.value || 'none';
        });
    }

    if (newSeedBtn) {
        newSeedBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (seedInput) {
                const randomValue = Math.floor(Math.random() * 1e9);
                seedInput.value = String(randomValue);
                if (currentSeedDisplay) currentSeedDisplay.textContent = String(randomValue);
            }
        });
    }

    if (openSettingsBtn) {
        openSettingsBtn.addEventListener('click', () => {
            if (startScreen) startScreen.classList.add('hidden');
            if (settingsScreen) settingsScreen.classList.remove('hidden');
            settingsReturnTo = 'menu';
        });
    }

    if (settingsBackBtn) {
        settingsBackBtn.addEventListener('click', () => {
            if (settingsScreen) settingsScreen.classList.add('hidden');
            if (settingsReturnTo === 'menu' && startScreen) {
                startScreen.classList.remove('hidden');
            } else if (settingsReturnTo === 'game' && gameArea) {
                gameArea.classList.remove('hidden');
                if (keyboard) keyboard.classList.remove('hidden');
            }
        });
    }

    // Show timer for daily mode (UTC-based)
    startDailyTimer();

    async function startGameFromUI(forceNewRandom = false) {
        // Reset UI rows before starting
        resetGameUI();

        const opts = { mode: currentMode };
        const seedVal = seedInput && seedInput.value ? seedInput.value.trim() : '';
        if (currentMode === 'random') {
            if (!seedVal || forceNewRandom) opts.seed = undefined;
            else opts.seed = seedVal;
        }

        const result = await initGame(opts);
        targetIndex = result.idx;
        currentSeed = result.seed;
        if (currentSeedDisplay) {
            currentSeedDisplay.textContent = currentMode === 'random' ? String(currentSeed) : 'none';
        }
        if (currentMode === 'random' && seedInput) seedInput.value = String(currentSeed);
    }
    
    // Post-game controls wiring
    const btnMain = document.getElementById('btn-main-menu');
    const btnPlayRandom = document.getElementById('btn-play-random');
    const btnViewSeed = document.getElementById('btn-view-seed');
    const postGame = document.getElementById('post-game-controls');

    function resetGameUI() {
        stage = 0;
        // Clear reveal panel
        const reveal = document.getElementById('reveal-panel');
        if (reveal) {
            reveal.innerText = '';
            const ans = document.getElementById('answer');
            if (ans) ans.remove();
        }

        const rows = document.querySelectorAll('.game-row');
        rows.forEach((row, i) => {
            const isFirst = i === 0;
            if (isFirst) row.classList.remove('disabled'); else row.classList.add('disabled');
            row.querySelectorAll('input, select').forEach(el => {
                el.disabled = !isFirst;
                if (el.tagName === 'INPUT') el.value = '';
                if (el.tagName === 'SELECT') el.value = '';
                // reset styles
                el.style.backgroundColor = '';
                el.style.color = '';
            });
        });

        const submit = document.getElementById('submit');
        if (submit) { submit.innerText = 'Submit Answer'; submit.disabled = false; }
        if (postGame) postGame.classList.add('hidden');
    }

    if (btnMain) btnMain.addEventListener('click', () => {
        resetGameUI();
        if (gameArea) gameArea.classList.add('hidden');
        if (keyboard) keyboard.classList.add('hidden');
        if (startScreen) startScreen.classList.remove('hidden');
    });

    if (btnPlayRandom) btnPlayRandom.addEventListener('click', async () => {
        // Start another random game
        currentMode = 'random';
        if (startScreen) startScreen.classList.add('hidden');
        if (gameArea) gameArea.classList.remove('hidden');
        if (keyboard) keyboard.classList.remove('hidden');
        // clear any seed input to force new random
        if (seedInput) seedInput.value = '';
        await startGameFromUI(true);
    });

    if (btnViewSeed) btnViewSeed.addEventListener('click', async () => {
        // Allow viewing/setting seed after game
        const current = currentSeed || '';
        const entered = prompt('View or enter seed (leave blank to cancel):', String(current));
        if (entered === null) return; // cancelled
        // If user provided a value, set it and start a random game with that seed
        if (entered !== '') {
            if (seedInput) seedInput.value = entered;
            currentMode = 'random';
            if (startScreen) startScreen.classList.add('hidden');
            if (gameArea) gameArea.classList.remove('hidden');
            if (keyboard) keyboard.classList.remove('hidden');
            await startGameFromUI(false);
        }
    });
});

export function FinalSubmit() {
    const today = getTodayKey();
    const result = submitFromData(stage, targetIndex, { hardMode: currentHardMode });
    stage = result[0];

    if (stage === -1) {
        if (currentMode === 'daily') {
            localStorage.setItem('lastPlayedDaily', today);
        }
        const submit = document.getElementById('submit');

        if (submit) {
            submit.innerText = 'Share';
            submit.disabled = false;
            submit.onclick = (e) => {
                e.preventDefault();
                share();
                submit.disabled = true;
            };
        }
        // Show post-game controls
        const postGame = document.getElementById('post-game-controls');
        if (postGame) postGame.classList.remove('hidden');
    }
}

function startDailyTimer() {
    const timerEl = document.getElementById('timer');
    if (!timerEl) return;

    function update() {
        const now = new Date();
        // Next challenge uses ISO date (UTC day boundary). Compute next UTC midnight.
        const nextUtcMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
        let diff = nextUtcMidnight - now;
        if (diff < 0) diff = 0;
        const hrs = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        timerEl.innerText = `Next Challenge arrives in: ${String(hrs).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
    }

    update();
    setInterval(update, 1000);
}