import { setRow } from './submit.js';
import { sliceList } from "./parse.js";

let bibleData = [];
function getDailySeed() {
    const today = new Date().toISOString().slice(0, 10); // "2026-07-02"
    let hash = 0;
    for (let i = 0; i < today.length; i++) {
        hash = (hash << 5) - hash + today.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

// swap this in for your random idx:

export async function initGame() {
    try {
        const res = await fetch("scripts/bible_sections.json");
        bibleData = await res.json();
        
        // Pick random verse
        const idx = getDailySeed() % bibleData.length;
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
        
        return idx;
    } catch (e) {
        console.error("Failed to load game data", e);
        return 0;
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

export function submitFromData(stage, idx) {
    const verse = bibleData[idx];
    if (!verse) return [stage, idx];

    // Check the row
    const nextStage = setRow(stage, verse);
    
    // Update the revealed text based on new stage
    updateReveal(verse, nextStage);
    
    return [nextStage, idx];
}