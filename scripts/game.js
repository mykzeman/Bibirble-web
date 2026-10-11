import { initGame, submitFromData } from "./data.js";
import { share } from "./answer.js";
import { AREAS } from "./books.js";

var stage = 0;
var targetIndex = 0;
var currentMode = 'daily';
var currentSeed = null;
var currentHardMode = false;
var currentUsefulOnly = false;
var currentBookHints = false;
var currentAllowMature = false;
var gameOver = false;

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
    const startDailyBtn = document.getElementById('start-daily');
    const startRandomBtn = document.getElementById('start-random');
    const openSettingsBtn = document.getElementById('open-settings');
    const settingsScreen = document.getElementById('settings-screen');
    const settingsBackBtn = document.getElementById('settings-back');
    const seedInput = document.getElementById('settings-seed');
    const newSeedBtn = document.getElementById('settings-new-seed');
    const hardSwitch = document.getElementById('hard-mode');
    const usefulSwitch = document.getElementById('useful-only');
    const hintsSwitch = document.getElementById('book-hints');


    // R18 mode: only switches on after a date-of-birth check (18 or older).
    const r18Switch = document.getElementById('r18-mode');
    const r18Verify = document.getElementById('r18-verify');
    const r18Dob = document.getElementById('r18-dob');
    const r18Confirm = document.getElementById('r18-confirm');
    const r18Message = document.getElementById('r18-message');
    let r18Verified = false;

    function showR18Message(text) {
        if (!r18Message) return;
        r18Message.textContent = text;
        r18Message.classList.toggle('hidden', !text);
    }

    if (r18Switch) {
        r18Switch.addEventListener('change', () => {
            if (r18Switch.checked && !r18Verified) {
                r18Switch.checked = false;
                if (r18Verify) r18Verify.classList.remove('hidden');
                showR18Message('Enter your date of birth to turn on R18 mode.');
                if (r18Dob) r18Dob.focus();
            } else if (!r18Switch.checked) {
                if (r18Verify) r18Verify.classList.add('hidden');
                showR18Message('');
            }
        });
    }

    if (r18Confirm) {
        r18Confirm.addEventListener('click', (e) => {
            e.preventDefault();
            const age = ageFromBirthDate(r18Dob ? r18Dob.value : '', new Date());
            if (age === null) {
                showR18Message('Please enter a valid date of birth.');
            } else if (age < 18) {
                showR18Message('Sorry, R18 mode is only for players 18 or older.');
            } else {
                r18Verified = true;
                r18Switch.checked = true;
                if (r18Verify) r18Verify.classList.add('hidden');
                showR18Message('R18 mode is on.');
            }
        });
    }
    const currentSeedDisplay = document.getElementById('current-seed-display');
    const startScreen = document.getElementById('start-screen');
    const gameArea = document.querySelector('.game-scroll-area');
    const keyboard = document.querySelector('.keyboard-panel');
    const backMenuBtn = document.getElementById('btn-back-menu');
    const areasRef = document.getElementById('areas-ref');
    let settingsReturnTo = 'menu';

    // Book areas reference (what a yellow book clue means outside hard mode)
    const areasList = document.getElementById('areas-list');
    if (areasList) {
        Object.entries(AREAS).forEach(([area, books]) => {
            const item = areasList.appendChild(document.createElement('li'));
            item.appendChild(document.createElement('strong')).textContent = area + ': ';
            item.appendChild(document.createTextNode(books.join(', ')));
        });
    }

    if (startDailyBtn) {
        startDailyBtn.addEventListener('click', async () => {
            currentMode = 'daily';
            // if already played, lock
            if (localStorage.getItem('lastPlayedDaily') === getTodayKey()) {
                lockGameForToday();
                return;
            }
            // hide start/settings screens, show game
            if (startScreen) startScreen.classList.add('hidden');
            if (settingsScreen) settingsScreen.classList.add('hidden');
            if (gameArea) gameArea.classList.remove('hidden');
            if (keyboard) keyboard.classList.remove('hidden');
            currentHardMode = !!(hardSwitch && hardSwitch.checked);
            currentUsefulOnly = !!(usefulSwitch && usefulSwitch.checked);
            currentBookHints = !!(hintsSwitch && hintsSwitch.checked);
            currentAllowMature = !!(r18Switch && r18Switch.checked);
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
            currentUsefulOnly = !!(usefulSwitch && usefulSwitch.checked);
            currentBookHints = !!(hintsSwitch && hintsSwitch.checked);
            currentAllowMature = !!(r18Switch && r18Switch.checked);
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
        // Back button: random games only, never daily or hard mode.
        if (backMenuBtn) backMenuBtn.classList.toggle('hidden', currentMode !== 'random' || currentHardMode);
        // Areas reference: not in hard mode (yellow means same testament there).
        if (areasRef) {
            areasRef.classList.toggle('hidden', currentHardMode);
            areasRef.open = false;
        }

        const opts = { mode: currentMode, usefulOnly: currentUsefulOnly, allowMature: currentAllowMature };
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
        if (currentHardMode) showHardModeIntroOnce();
    }

    // Explains the hard mode rules the first time a player starts a hard mode game.
    const hardIntro = document.getElementById('hard-mode-intro');
    const hardIntroOk = document.getElementById('hard-mode-intro-ok');
    if (hardIntroOk) hardIntroOk.addEventListener('click', () => hardIntro.close());

    function showHardModeIntroOnce() {
        if (!hardIntro || typeof hardIntro.showModal !== 'function') return;
        try {
            if (localStorage.getItem('seenHardModeIntro')) return;
            localStorage.setItem('seenHardModeIntro', '1');
        } catch (e) { /* storage blocked: still show it this time */ }
        hardIntro.showModal();
    }
    
    // Post-game controls wiring
    const btnMain = document.getElementById('btn-main-menu');
    const btnPlayRandom = document.getElementById('btn-play-random');
    const btnViewSeed = document.getElementById('btn-view-seed');
    const postGame = document.getElementById('post-game-controls');

    function resetGameUI() {
        stage = 0;
        gameOver = false;
        const view = document.getElementById('view');
        if (view) view.remove();
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

    function goToMainMenu() {
        resetGameUI();
        if (gameArea) gameArea.classList.add('hidden');
        if (keyboard) keyboard.classList.add('hidden');
        if (startScreen) startScreen.classList.remove('hidden');
        settingsReturnTo = 'menu';
    }

    if (btnMain) btnMain.addEventListener('click', goToMainMenu);
    if (backMenuBtn) backMenuBtn.addEventListener('click', goToMainMenu);

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

// Submit button: checks the guess, or shares the result once the game is over.
export function onSubmitPressed() {
    if (gameOver) {
        share({ mode: currentMode, seed: currentSeed, hardMode: currentHardMode });
    } else {
        FinalSubmit();
    }
}

export function FinalSubmit() {
    const today = getTodayKey();
    const result = submitFromData(stage, targetIndex, { hardMode: currentHardMode, bookHints: currentBookHints });
    stage = result[0];

    if (stage === -1) {
        if (currentMode === 'daily') {
            localStorage.setItem('lastPlayedDaily', today);
        }
        gameOver = true;
        const submit = document.getElementById('submit');
        if (submit) {
            submit.innerText = 'Share';
            submit.disabled = false;
        }
        // Show post-game controls
        const postGame = document.getElementById('post-game-controls');
        if (postGame) postGame.classList.remove('hidden');
    }
}

// Whole years between a YYYY-MM-DD birth date and today, or null if the
// date is missing, invalid, or in the future.
export function ageFromBirthDate(value, today) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
    if (!match) return null;
    const [year, month, day] = match.slice(1).map(Number);
    const birth = new Date(year, month - 1, day);
    if (birth.getFullYear() !== year || birth.getMonth() !== month - 1 || birth.getDate() !== day) return null;
    if (birth > today) return null;
    let age = today.getFullYear() - year;
    const hadBirthday = today.getMonth() > month - 1 ||
        (today.getMonth() === month - 1 && today.getDate() >= day);
    if (!hadBirthday) age--;
    return age;
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