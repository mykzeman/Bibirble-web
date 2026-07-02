import { setRow } from './submit.js';
import { sliceList } from "./parse.js";

let bibleData = [];

function hashStringToInt(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

function getDailySeed() {
    const today = new Date().toISOString().slice(0, 10);
    return hashStringToInt(today);
}

// initGame now accepts options: { mode: 'daily'|'random', seed: string|number }
export async function initGame(options = { mode: 'daily' }) {
    try {
        const res = await fetch("scripts/bible_sections.json");
        bibleData = await res.json();
        // Determine seed based on mode
        const mode = options.mode || 'daily';
        let seedVal;
        if (mode === 'daily') {
            seedVal = getDailySeed();
        } else {
            if (options.seed !== undefined && options.seed !== null && options.seed !== '') {
                seedVal = typeof options.seed === 'number' ? options.seed : hashStringToInt(String(options.seed));
            } else {
                seedVal = Math.floor(Math.random() * 1e9);
            }
        }

        // Pick verse index from seed
        const idx = seedVal % bibleData.length;
        const verse = bibleData[idx];
        
        // Populate Dropdowns once
        const uniqueValues = [...new Set(bibleData.map(item => item.book))];
        document.querySelectorAll(".choice").forEach(el => {
            el.innerHTML = '<option value=""></option>'; // Clear existing
            uniqueValues.forEach(value => {
                const option = document.createElement("option");
                option.value = value;
                option.textContent = value;
                el.appendChild(option);
            });
        });

        // Set initial reveal
        updateReveal(verse, 0);

        return { idx, seed: seedVal };
    } catch (e) {
        console.error("Failed to load game data", e);
        return { idx: 0, seed: 0 };
    }
}





function revealVerse(verse, stage) {
    const words = verse.text.split(" ");
    const visibleIndices = new Set();
    const slices=Math.floor(words.length/7)
    const chunks = sliceList(words, slices);
    const startWords = chunks[0];
    if (stage === -1) {
        return verse.text;
    }
    
    // Always show the start word
    
        for (let i = 0; i < startWords.length; i++) {
            visibleIndices.add(words.indexOf(startWords[i]));
        }

    // Stage logic: Expand outward based on stage number
    // Stage 0: 1 word. Stage 1: 3 words. Stage 2: 5 words, etc.
    for (let i = 1; i <= stage; i++) {
        const chunk = chunks[i];
        if (!chunk) break;
        chunk.forEach(word => {
            visibleIndices.add(words.indexOf(word));
        });
    }

    // Reconstruct string
    const maskedVerse = words.map((word, index) => {
        return visibleIndices.has(index) ? word : "...";
    });

    return maskedVerse.join(" ");
}

function updateReveal(verse, stage) {
    const reveal = document.getElementById('reveal-panel');
    if (reveal) {
        reveal.innerText = revealVerse(verse, stage);
    }
    if (stage==-1) {
       const answer= reveal.appendChild(document.createElement("p"));
       answer.id="answer";
       answer.innerHTML=`- ${verse.book} ${verse.chapter}:${verse.verse}`;
    }
}

export function submitFromData(stage, idx, options = {}) {
    const verse = bibleData[idx];
    if (!verse) return [stage, idx];

    // Provide helper to validate a guessed verse exists in our dataset
    options.isValidVerse = options.isValidVerse || function(book, chapter, verseNum) {
        return bibleData.some(item => item.book === book && Number(item.chapter) === Number(chapter) && Number(item.verse) === Number(verseNum));
    };

    // Check the row (options may include hardMode)
    const nextStage = setRow(stage, verse, options);
    
    // Update the revealed text based on new stage
    updateReveal(verse, nextStage);
    
    return [nextStage, idx];
}