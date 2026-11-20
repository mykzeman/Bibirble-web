// The Bible translations players can pick in Settings. Each one's verses are
// built by bibirble's tools/sort.py into its own file next to this one, and
// only the picked version's file is downloaded. Keep in sync with VERSIONS in
// tools/sort.py and bibirble's src/BibleVersions.h.
export const VERSIONS = [
    { id: "web", name: "World English Bible", short: "WEB", file: "bible_sections.json" },
    { id: "kjv", name: "King James Version", short: "KJV", file: "bible_sections_kjv.json" },
    { id: "dr", name: "Douay-Rheims", short: "DRA", file: "bible_sections_dr.json" },
    { id: "cpdv", name: "Catholic Public Domain Version", short: "CPDV", file: "bible_sections_cpdv.json" }
];

const STORAGE_KEY = "bibleVersion";

// The version with this id, or the World English Bible.
export function findVersion(id) {
    return VERSIONS.find(v => v.id === id) || VERSIONS[0];
}

// The version picked in Settings (remembered on this device).
export function getSavedVersion() {
    try {
        return findVersion(localStorage.getItem(STORAGE_KEY));
    } catch (e) {
        return VERSIONS[0];
    }
}

export function saveVersion(id) {
    try {
        localStorage.setItem(STORAGE_KEY, findVersion(id).id);
    } catch (e) { /* storage blocked: the choice lasts until the page closes */ }
}
