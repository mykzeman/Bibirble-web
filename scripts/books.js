// Traditional (Protestant canon) book order, Genesis to Revelation. Used to
// sort the book dropdowns. Keep in sync with bibirble's BibleData.cpp.
export const BOOK_ORDER = [
    "genesis", "exodus", "leviticus", "numbers", "deuteronomy",
    "joshua", "judges", "ruth", "1samuel", "2samuel", "1kings", "2kings",
    "1chronicles", "2chronicles", "ezra", "nehemiah", "esther", "job",
    "psalms", "proverbs", "ecclesiastes", "songofsolomon", "isaiah",
    "jeremiah", "lamentations", "ezekiel", "daniel", "hosea", "joel", "amos",
    "obadiah", "jonah", "micah", "nahum", "habakkuk", "zephaniah", "haggai",
    "zechariah", "malachi",
    "matthew", "mark", "luke", "john", "acts", "romans", "1corinthians",
    "2corinthians", "galatians", "ephesians", "philippians", "colossians",
    "1thessalonians", "2thessalonians", "1timothy", "2timothy", "titus",
    "philemon", "hebrews", "james", "1peter", "2peter", "1john", "2john",
    "3john", "jude", "revelation"
];

// Book areas used for yellow (same area) clues. Must match the AREAS dict in
// bibirble's tools/sort.py, which sets each verse's "area" field.
export const AREAS = {
    "Torah": ["genesis", "exodus", "leviticus", "numbers", "deuteronomy"],
    "Historical": ["joshua", "judges", "1samuel", "2samuel", "1kings", "2kings", "1chronicles", "2chronicles", "nehemiah"],
    "Poems": ["psalms", "proverbs", "ecclesiastes", "songofsolomon", "lamentations"],
    "Small stories": ["job", "esther", "jonah", "ruth", "ezra"],
    "Prophets Major": ["isaiah", "jeremiah", "ezekiel", "daniel"],
    "Prophets Minor": ["hosea", "joel", "amos", "obadiah", "micah", "nahum", "habakkuk", "zephaniah", "haggai", "zechariah", "malachi"],
    "Gospel": ["matthew", "mark", "luke", "john"],
    "Acts from Hebrews": ["acts", "hebrews"],
    "Pauls letters": ["romans", "1corinthians", "2corinthians", "galatians", "ephesians", "philippians", "colossians", "1thessalonians", "2thessalonians", "1timothy", "2timothy", "titus", "philemon"],
    "Peter letters": ["1peter", "2peter"],
    "James and Jude": ["james", "jude"],
    "John Letters and Visions": ["1john", "2john", "3john", "revelation"]
};

export function findListKey(item) {
    for (const area in AREAS) {
        if (AREAS[area].includes(item)) return area;
    }
    return null;
}

// Hard mode gives broader yellow clues: same testament instead of same area.
// The first 39 books of BOOK_ORDER (Genesis to Malachi) are the Old Testament.
export function findTestament(item) {
    const i = BOOK_ORDER.indexOf(item);
    if (i === -1) return null;
    return i < 39 ? "Old Testament" : "New Testament";
}

export function sortBooks(books) {
    const rank = book => {
        const i = BOOK_ORDER.indexOf(book);
        return i === -1 ? BOOK_ORDER.length : i;
    };
    return [...books].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
}

// Book hints: narrows a list of books using the book clues from submitted
// rows. clues is [{ book, color }] with color 'green' | 'yellow' | 'gray'.
// groupOf maps a book to the group yellow clues use (area, or testament in
// hard mode).
export function filterBooksByClues(books, clues, groupOf = findListKey) {
    const green = clues.find(c => c.color === 'green');
    if (green) return books.filter(b => b === green.book);

    const wrongBooks = new Set(clues.map(c => c.book));
    const yellowArea = clues.filter(c => c.color === 'yellow').map(c => groupOf(c.book))[0];
    const grayAreas = new Set(clues.filter(c => c.color === 'gray').map(c => groupOf(c.book)));

    return books.filter(b => {
        if (wrongBooks.has(b)) return false;
        const area = groupOf(b);
        if (yellowArea) return area === yellowArea;
        return !grayAreas.has(area);
    });
}
