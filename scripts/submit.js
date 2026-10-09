import { findListKey, filterBooksByClues } from "./books.js";

function getGameRows(rowIndex) {
    const gameRow = document.querySelectorAll(".game-row")[rowIndex];
    if (!gameRow) return [];

    const values = [];
    const bookSelect = gameRow.querySelector(".choice");
    values.push(bookSelect.value);

    const inputs = gameRow.querySelectorAll(".text-ctrl");
    inputs.forEach(element => {
        values.push(element.value);
    });

    // Book + 4 inputs = 5 values. Ensure none are empty.
    if (values.length === 5 && values.every(v => v !== "")) {
        return values;
    } else {
        return [];
    }
}

export function setRow(currentStage, verse, options = {}) {
    const inputs = getGameRows(currentStage);

    if (inputs.length === 5) {
        const rowElements = document.querySelectorAll(".game-row");
        const activeRow = rowElements[currentStage];
        const nextRow = rowElements[currentStage + 1];

        // Hard-mode enforcement: validate guess against previous clues and dataset before accepting
        if (options.hardMode) {
            // Build constraints from previous rows
            const requiredGreens = [null, null, null, null];
            const requiredYellows = [];
            let requiredBook = null;
            let requiredArea = null;

            for (let r = 0; r < currentStage; r++) {
                const row = rowElements[r];
                const bookOpt = row.querySelector('.choice');
                const bookBg = (bookOpt && bookOpt.style && bookOpt.style.backgroundColor) ? bookOpt.style.backgroundColor : null;
                if (bookBg === 'green') {
                    requiredBook = bookOpt.value;
                } else if (bookBg === 'yellow') {
                    requiredArea = requiredArea || findListKey(bookOpt.value);
                }

                const ctrls = row.querySelectorAll('.text-ctrl');
                ctrls.forEach((ctrl, i) => {
                    const bg = ctrl.style.backgroundColor;
                    if (bg === 'green') requiredGreens[i] = ctrl.value;
                    else if (bg === 'yellow') requiredYellows.push(ctrl.value);
                });
            }

            const guessBook = inputs[0];
            const guessDigits = inputs.slice(1);
            // Check book constraints
            if (requiredBook && guessBook !== requiredBook) {
                alert('Hard mode: your guess must use the previously confirmed book.');
                return currentStage;
            }
            if (requiredArea && findListKey(guessBook) !== requiredArea) {
                alert('Hard mode: your guess must match the previously hinted book area.');
                return currentStage;
            }

            // Check green digit constraints
            for (let i = 0; i < 4; i++) {
                if (requiredGreens[i] !== null && guessDigits[i] !== requiredGreens[i]) {
                    alert('Hard mode: your guess must keep previously revealed digits in the same positions.');
                    return currentStage;
                }
            }

            // Check yellow presence
            for (const yd of requiredYellows) {
                if (!guessDigits.includes(yd)) {
                    alert('Hard mode: your guess must include previously revealed digits (yellow hints).');
                    return currentStage;
                }
            }

            // Verify guessed verse exists in dataset
            if (typeof options.isValidVerse === 'function') {
                const chapter = guessDigits[0] + guessDigits[1];
                const verseNum = guessDigits[2] + guessDigits[3];
                if (!options.isValidVerse(guessBook, chapter, verseNum)) {
                    alert('Hard mode: guessed verse must exist in the dataset.');
                    return currentStage;
                }
            }
        }

        // Disable current row
        activeRow.classList.add("disabled");
        activeRow.querySelectorAll("input, select").forEach(el => el.disabled = true);

        // Enable next row if it exists
        if (nextRow) {
            nextRow.classList.remove("disabled");
            nextRow.querySelectorAll("input, select").forEach(el => el.disabled = false);
        }

        // --- Check Book Answer ---
        let correctCount = 0;
        const bookGuess = inputs[0];
        const bookOption = activeRow.querySelector(".choice");

        if (bookGuess === verse.book) {
            bookOption.style.backgroundColor = "green";
            bookOption.style.color = "white";
            correctCount++;
        } else if (findListKey(bookGuess) === verse.area) {
            bookOption.style.backgroundColor = "yellow";
            bookOption.style.color = "black";
        } else {
            bookOption.style.backgroundColor = "gray";
            bookOption.style.color = "black";
        }

        // --- Check Digit Answers ---
        inputs.shift(); // Remove book, leave 4 digits
        
        const chapterAnswer = String(verse.chapter).padStart(2, '0');
        const verseAnswer = String(verse.verse).padStart(2, '0'); 
        // Target digits: [c1, c2, v1, v2]
        const answerDigits = [chapterAnswer.charAt(0), chapterAnswer.charAt(1), verseAnswer.charAt(0), verseAnswer.charAt(1)];
        const guessDigits = inputs;
        const textCtrls = activeRow.querySelectorAll(".text-ctrl");
        
        // Status array to track colors: 'green', 'yellow', 'gray'
        const results = new Array(4).fill('gray');
        
        // Pass 1: Find Greens (Exact Matches)
        // We use a copy of answerDigits to mark 'consumed' digits by setting them to null
        const answerPool = [...answerDigits];
        
        guessDigits.forEach((digit, i) => {
            if (digit === answerPool[i]) {
                results[i] = 'green';
                answerPool[i] = null; // Consume match
                correctCount++;
            }
        });

        // Pass 2: Find Yellows (Wrong Position)
        guessDigits.forEach((digit, i) => {
            if (results[i] !== 'green') {
                // Look for this digit in the remaining pool
                const poolIndex = answerPool.indexOf(digit);
                if (poolIndex !== -1) {
                    results[i] = 'yellow';
                    answerPool[poolIndex] = null; // Consume match
                }
            }
        });

        // Apply colors to DOM
        textCtrls.forEach((element, i) => {
            const color = results[i];
            if (color === 'green') {
                element.style.backgroundColor = "green";
                element.style.color = "white";
            } else if (color === 'yellow') {
                element.style.backgroundColor = "yellow";
                element.style.color = "black";
            } else {
                element.style.backgroundColor = "gray";
                element.style.color = "black";
            }
        });

        // --- Book hints (accessibility, never in hard mode) ---
        if (options.bookHints && !options.hardMode) {
            applyBookHints(rowElements, currentStage);
        }

        // --- Check Win/Loss ---
        if (correctCount === 5) {
            // Use setTimeout to allow UI to update colors before alert
            setTimeout(() => alert(" You got it correct!"), 10);
            return -1;
        } else if (currentStage + 1 >= 7) {
            setTimeout(() => alert(`You ran out of guesses. The correct answer was ${verse.book} ${verse.chapter}:${verse.verse}. Maybe you should read your Bible to reflect on what you got wrong!`), 10);
            return -1;
        } else {
            return currentStage + 1;
        }
    } else {
        alert("Please complete all fields in the current row before submitting.");
        return currentStage;
    }
}

// Rebuilds the book dropdowns of the rows after currentStage so they only
// offer books that still fit the book clues given so far.
function applyBookHints(rowElements, currentStage) {
    const clues = [];
    for (let r = 0; r <= currentStage; r++) {
        const select = rowElements[r].querySelector('.choice');
        clues.push({ book: select.value, color: select.style.backgroundColor });
    }
    for (let r = currentStage + 1; r < rowElements.length; r++) {
        const select = rowElements[r].querySelector('.choice');
        const allBooks = (select.dataset.allBooks || '').split(',').filter(Boolean);
        const books = filterBooksByClues(allBooks, clues);
        const current = select.value;
        select.innerHTML = '<option value=""></option>';
        books.forEach(book => {
            const option = document.createElement('option');
            option.value = book;
            option.textContent = book;
            select.appendChild(option);
        });
        // Only one book left (green clue): pick it for the player.
        if (books.length === 1) select.value = books[0];
        else if (books.includes(current)) select.value = current;
    }
}
