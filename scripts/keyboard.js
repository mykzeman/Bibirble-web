import { FinalSubmit } from "./game.js";

let lastFocusedInput = null;

document.addEventListener('focusin', (e) => {
    if (e.target.tagName === "INPUT") {
        lastFocusedInput = e.target;
    }
});

function focusNextInput() {
    // Get all focusable elements in the active game row
    const activeRow = document.querySelector(".game-row:not(.disabled)");
    if (!activeRow) return;

    const inputs = Array.from(activeRow.querySelectorAll("input.text-ctrl"));
    const currentIndex = inputs.indexOf(document.activeElement);

    if (currentIndex !== -1 && currentIndex < inputs.length - 1) {
        inputs[currentIndex + 1].focus();
    } else if (currentIndex === -1 && inputs.length > 0) {
        // If nothing focused, focus first
        inputs[0].focus();
    }
}

function focusLastInput() {
    // Get all focusable elements in the active game row
    const activeRow = document.querySelector(".game-row:not(.disabled)");
    if (!activeRow) return;

    const inputs = Array.from(activeRow.querySelectorAll("input.text-ctrl"));
    const currentIndex = inputs.indexOf(document.activeElement);

    if (currentIndex !== -1 && currentIndex > 0) {
        inputs[currentIndex - 1].focus();
    } else if (currentIndex === -1 && inputs.length > 0) {
        // If nothing focused, focus first
        inputs[0].focus();
    }
}

function keyboardInput(key) {
    const focusedElement = lastFocusedInput || document.activeElement;
    
    // Only allow typing in text inputs
    if (!focusedElement || focusedElement.tagName !== "INPUT" || focusedElement.disabled) return;
    
    const SPECIAL_KEYS = ["Del", 'Submit Answer'];
    
    if (SPECIAL_KEYS.includes(key)) {
        switch (key) {
            case "Del":
                focusedElement.value = '';
                focusLastInput();
                break;
  
            case "Submit Answer":
                FinalSubmit();
                break;
            default:
                break;
        }
    } else {
        focusedElement.value = key;
        // Auto-advance
        focusNextInput();
    }
}

document.querySelectorAll('.button').forEach(button => {
    const handleInteraction = (e) => {
        if (e.type === 'touchstart') {
            e.preventDefault();
        }
        const key = button.innerHTML;
        keyboardInput(key);
    };

    button.addEventListener('mousedown', (e) => e.preventDefault());
    button.addEventListener('touchstart', handleInteraction, { passive: false });
    button.addEventListener('click', handleInteraction);
});