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

function findListKey(item) {
    const AREAS = {
        "Torah": ["genesis", "exodus", "leviticus", "numbers", "deuteronomy"],
        "Historical": ["joshua", "judges", "1samuel", "2samuel", "1kings", "2kings", "1chronicles", "2chronicles"],
        "Poems": ["psalms", "proverbs", "ecclesiastes", "songofsolomon", "lamentations"],
        "Small stories": ["job", "esther", "jonah", "ruth", "ezra"],
        "Prophets Major": ["isaiah", "jeremiah", "ezekiel", "daniel"],
        "Prophets Minor": ["hosea", "joel", "amos", "obadiah", "micah", "nahum", "habakkuk", "zephaniah", "haggai", "zechariah", "malachi", "nehemiah"],
        "Gospel": ["matthew", "mark", "luke", "john"],
        "Acts from Hebrews": ["acts", "hebrews"],
        "Pauls letters": ["romans", "1corinthians", "2corinthians", "galatians", "ephesians", "philippians", "colossians", "1thessalonians", "2thessalonians", "1timothy", "2timothy", "titus", "philemon"],
        "Peter letters": ["1peter", "2peter"],
        "James and Jude": ["james", "jude"],
        "John Letters and Visions": ["1john", "2john", "3john", "revelation"]
    };
    for (const area in AREAS) {
        if (AREAS[area].includes(item)) return area;
    }
    return null;
}

export function setRow(currentStage, verse) {
    const inputs = getGameRows(currentStage);

    if (inputs.length === 5) {
        const rowElements = document.querySelectorAll(".game-row");
        const activeRow = rowElements[currentStage];
        const nextRow = rowElements[currentStage + 1];

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