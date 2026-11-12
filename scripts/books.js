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

// Tidy names to show players, like "1 Samuel" and "Song of Solomon". The
// dataset and the game logic keep using the short keys ("1samuel").
export const BOOK_NAMES = {
    genesis: "Genesis", exodus: "Exodus", leviticus: "Leviticus",
    numbers: "Numbers", deuteronomy: "Deuteronomy", joshua: "Joshua",
    judges: "Judges", ruth: "Ruth", "1samuel": "1 Samuel",
    "2samuel": "2 Samuel", "1kings": "1 Kings", "2kings": "2 Kings",
    "1chronicles": "1 Chronicles", "2chronicles": "2 Chronicles",
    ezra: "Ezra", nehemiah: "Nehemiah", esther: "Esther", job: "Job",
    psalms: "Psalms", proverbs: "Proverbs", ecclesiastes: "Ecclesiastes",
    songofsolomon: "Song of Solomon", isaiah: "Isaiah", jeremiah: "Jeremiah",
    lamentations: "Lamentations", ezekiel: "Ezekiel", daniel: "Daniel",
    hosea: "Hosea", joel: "Joel", amos: "Amos", obadiah: "Obadiah",
    jonah: "Jonah", micah: "Micah", nahum: "Nahum", habakkuk: "Habakkuk",
    zephaniah: "Zephaniah", haggai: "Haggai", zechariah: "Zechariah",
    malachi: "Malachi", matthew: "Matthew", mark: "Mark", luke: "Luke",
    john: "John", acts: "Acts", romans: "Romans",
    "1corinthians": "1 Corinthians", "2corinthians": "2 Corinthians",
    galatians: "Galatians", ephesians: "Ephesians",
    philippians: "Philippians", colossians: "Colossians",
    "1thessalonians": "1 Thessalonians", "2thessalonians": "2 Thessalonians",
    "1timothy": "1 Timothy", "2timothy": "2 Timothy", titus: "Titus",
    philemon: "Philemon", hebrews: "Hebrews", james: "James",
    "1peter": "1 Peter", "2peter": "2 Peter", "1john": "1 John",
    "2john": "2 John", "3john": "3 John", jude: "Jude",
    revelation: "Revelation"
};

export function bookName(book) {
    return BOOK_NAMES[book] || book;
}

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

// Tidy area titles for the Book areas list. The AREAS keys above stay as
// they are because they match the dataset's "area" field.
export const AREA_NAMES = {
    "Torah": "Torah",
    "Historical": "History",
    "Poems": "Poetry & Wisdom",
    "Small stories": "Small Stories",
    "Prophets Major": "Major Prophets",
    "Prophets Minor": "Minor Prophets",
    "Gospel": "Gospels",
    "Acts from Hebrews": "Acts & Hebrews",
    "Pauls letters": "Paul’s Letters",
    "Peter letters": "Peter’s Letters",
    "James and Jude": "James & Jude",
    "John Letters and Visions": "John’s Letters & Revelation"
};

export function findListKey(item) {
    for (const area in AREAS) {
        if (AREAS[area].includes(item)) return area;
    }
    return null;
}

// Hard mode groups books by who traditionally wrote them, so a yellow book
// means "same author". Books whose writer isn't known share "Unknown".
export const AUTHORS = {
    "Moses": ["genesis", "exodus", "leviticus", "numbers", "deuteronomy"],
    "Joshua": ["joshua"],
    "Samuel": ["judges", "ruth", "1samuel", "2samuel"],
    "Jeremiah": ["1kings", "2kings", "jeremiah", "lamentations"],
    "Ezra and Nehemiah": ["1chronicles", "2chronicles", "ezra", "nehemiah"],
    "David": ["psalms"],
    "Solomon": ["proverbs", "ecclesiastes", "songofsolomon"],
    "Isaiah": ["isaiah"],
    "Ezekiel": ["ezekiel"],
    "Daniel": ["daniel"],
    "Hosea": ["hosea"],
    "Joel": ["joel"],
    "Amos": ["amos"],
    "Obadiah": ["obadiah"],
    "Jonah": ["jonah"],
    "Micah": ["micah"],
    "Nahum": ["nahum"],
    "Habakkuk": ["habakkuk"],
    "Zephaniah": ["zephaniah"],
    "Haggai": ["haggai"],
    "Zechariah": ["zechariah"],
    "Malachi": ["malachi"],
    "Matthew": ["matthew"],
    "Mark": ["mark"],
    "Luke": ["luke", "acts"],
    "John": ["john", "1john", "2john", "3john", "revelation"],
    "Paul": ["romans", "1corinthians", "2corinthians", "galatians", "ephesians", "philippians", "colossians", "1thessalonians", "2thessalonians", "1timothy", "2timothy", "titus", "philemon"],
    "Peter": ["1peter", "2peter"],
    "Jesus' brothers": ["james", "jude"],
    "Unknown": ["job", "esther", "hebrews"]
};

export function findAuthor(item) {
    for (const author in AUTHORS) {
        if (AUTHORS[author].includes(item)) return author;
    }
    return null;
}

export function sortBooks(books) {
    const rank = book => {
        const i = BOOK_ORDER.indexOf(book);
        return i === -1 ? BOOK_ORDER.length : i;
    };
    return [...books].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
}

// Fills a book dropdown: a blank choice, then the books under "Old
// Testament" and "New Testament" headings, each shown by its tidy name.
// Option values stay as the dataset keys.
export function fillBookSelect(select, books) {
    select.innerHTML = '<option value=""></option>';
    const firstNewTestament = BOOK_ORDER.indexOf("matthew");
    const groups = [
        ["Old Testament", books.filter(b => BOOK_ORDER.indexOf(b) < firstNewTestament)],
        ["New Testament", books.filter(b => BOOK_ORDER.indexOf(b) >= firstNewTestament)]
    ];
    groups.forEach(([label, list]) => {
        if (list.length === 0) return;
        const group = select.appendChild(document.createElement("optgroup"));
        group.label = label;
        list.forEach(book => {
            const option = group.appendChild(document.createElement("option"));
            option.value = book;
            option.textContent = bookName(book);
        });
    });
}

// Book hints: narrows a list of books using the book clues from submitted
// rows. clues is [{ book, color }] with color 'green' | 'yellow' | 'gray'.
// groupOf maps a book to the group yellow clues use (area, or author in
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
