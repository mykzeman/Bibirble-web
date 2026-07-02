import { initGame, submitFromData } from "./data.js";
import { share } from "./answer.js";

var stage = 0;
var targetIndex = 0;

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
    const lastPlayed = localStorage.getItem('lastPlayed');

    if (lastPlayed === today) {
        lockGameForToday();
        return;
    }

    initGame().then(idx => {
        targetIndex = idx;
    });
});

export function FinalSubmit() {
    const today = getTodayKey();
    const result = submitFromData(stage, targetIndex);
    stage = result[0];

    if (stage === -1) {
        localStorage.setItem('lastPlayed', today);
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
    }
}