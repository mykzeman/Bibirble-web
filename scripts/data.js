import { setRow } from './submit.js';
import { sliceList } from "./parse.js";
import { USEFUL_VERSES } from "./useful.js";
import { sortBooks, bookName, fillBookSelect } from "./books.js";
import { CHRISTMAS_VERSES, CHRISTMAS_DAY_VERSE } from "./christmas.js";

let bibleData = [];

function hashStringToInt(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

function createSeededRandom(seed) {
    let value = seed >>> 0;
    return function() {
        value ^= value << 13;
        value ^= value >>> 17;
        value ^= value << 5;
        return (value >>> 0) / 0x100000000;
    };
}

// Scrambles a seed (murmur3's finalizer) so nearby seeds, like the hashes of
// consecutive dates or seeds 1000 and 1001, land far apart. Without this the
// daily verse just walked forward a verse or two each day. Must match
// MixSeed in bibirble's SeededRandom.cpp.
function mixSeed(seed) {
    let h = seed >>> 0;
    h ^= h >>> 16;
    h = Math.imul(h, 0x85ebca6b);
    h ^= h >>> 13;
    h = Math.imul(h, 0xc2b2ae35);
    h ^= h >>> 16;
    return (h >>> 0) || 0x9e3779b9; // xorshift gets stuck on 0
}

function pickIndexFromSeed(seed, length) {
    const random = createSeededRandom(mixSeed(seed));
    return Math.floor(random() * length);
}

// The Daily follows the player's own calendar day (like Wordle), so it
// resets at their midnight instead of UTC midnight. Players behind UTC used
// to play "tomorrow's" Daily in the evening and then wait almost a full day.
// Must match GetTodayLocalDateString in bibirble's SeededRandom.cpp.
export function getLocalDateKey(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function getDailySeed(date = new Date()) {
    return hashStringToInt(getLocalDateKey(date));
}

// Indices into bibleData that make up the "Useful verses only" pool, in
// dataset order so a seed maps to the same verse every time.
function getUsefulIndices() {
    const wanted = new Set(USEFUL_VERSES.map(([book, chapter, verse]) => `${book} ${chapter}:${verse}`));
    const indices = [];
    bibleData.forEach((item, i) => {
        if (wanted.has(`${item.book} ${Number(item.chapter)}:${Number(item.verse)}`)) indices.push(i);
    });
    return indices;
}

// Indices into bibleData of the Christmas verses, in CHRISTMAS_VERSES order
// (not dataset order) so the December Daily matches the C++ version.
function getChristmasIndices() {
    const indexOf = new Map(bibleData.map((item, i) =>
        [`${item.book} ${Number(item.chapter)}:${Number(item.verse)}`, i]));
    return CHRISTMAS_VERSES
        .map(([book, chapter, verse]) => indexOf.get(`${book} ${chapter}:${verse}`))
        .filter(i => i !== undefined);
}

// December Daily: a different Christmas verse every day (the list is
// shuffled once per year), and Christmas Day is always Luke 2:11. Must
// match PickChristmasDailyPosition in bibirble's SeededRandom.cpp.
export function pickChristmasDailyPosition(poolLength, specialPosition, year, day) {
    if (day === 25 && specialPosition !== -1) return specialPosition;
    const positions = [];
    for (let k = 0; k < poolLength; k++) {
        if (k !== specialPosition) positions.push(k);
    }
    const random = createSeededRandom(mixSeed(hashStringToInt(`christmas ${year}`)));
    for (let k = positions.length - 1; k > 0; k--) {
        const j = Math.floor(random() * (k + 1));
        [positions[k], positions[j]] = [positions[j], positions[k]];
    }
    return positions[(day - 1) % positions.length];
}

// initGame now accepts options: { mode: 'daily'|'random', seed: string|number, usefulOnly: boolean, allowMature: boolean, christmas: boolean }
// christmas: pick from the Christmas verses (December).
export async function initGame(options = { mode: 'daily' }) {
    try {
        const res = await fetch("scripts/bible_sections.json");
        bibleData = await res.json();
        // Determine seed based on mode
        const mode = options.mode || 'daily';
        const today = new Date();
        let seedVal;
        if (mode === 'daily') {
            seedVal = getDailySeed(today);
        } else {
            if (options.seed !== undefined && options.seed !== null && options.seed !== '') {
                // Number seeds (like the one shown after a game) are used as-is so
                // a shared seed replays the same verse; other text is hashed.
                const seedText = String(options.seed).trim();
                seedVal = typeof options.seed === 'number' ? options.seed
                    : /^\d{1,9}$/.test(seedText) ? Number(seedText) : hashStringToInt(seedText);
            } else {
                seedVal = Math.floor(Math.random() * 1e9);
            }
        }

        // Pick verse index from seed
        // Candidate verses: the Christmas verses, the Useful pool or the
        // whole dataset, minus mature (R18) verses unless R18 mode is on.
        const christmasPool = options.christmas ? getChristmasIndices() : [];
        const christmas = christmasPool.length > 0;
        let candidates = christmas ? christmasPool
            : options.usefulOnly ? getUsefulIndices() : [];
        if (candidates.length === 0) candidates = bibleData.map((_, i) => i);
        if (!options.allowMature) candidates = candidates.filter(i => !bibleData[i].mature);
        let idx;
        if (christmas && mode === 'daily') {
            const [book, chapter, verseNum] = CHRISTMAS_DAY_VERSE;
            const special = candidates.findIndex(i => bibleData[i].book === book &&
                Number(bibleData[i].chapter) === chapter && Number(bibleData[i].verse) === verseNum);
            idx = candidates[pickChristmasDailyPosition(candidates.length, special,
                today.getFullYear(), today.getDate())];
        } else {
            idx = candidates[pickIndexFromSeed(seedVal, candidates.length)];
        }
        const verse = bibleData[idx];
        
        // Populate the dropdowns with only the books that have a verse in
        // this game's pool, so Useful mode doesn't offer impossible books.
        const uniqueValues = sortBooks(new Set(candidates.map(i => bibleData[i].book)));
        document.querySelectorAll(".choice").forEach(el => {
            // Full list, kept so book hints can rebuild the dropdown later.
            el.dataset.allBooks = uniqueValues.join(',');
            fillBookSelect(el, uniqueValues);
        });

        // Set initial reveal
        updateReveal(verse, 0);

        return { idx, seed: seedVal, christmas };
    } catch (e) {
        console.error("Failed to load game data", e);
        return { idx: 0, seed: 0, christmas: false };
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
       answer.textContent = `- ${bookName(verse.book)} ${verse.chapter}:${verse.verse}`;
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