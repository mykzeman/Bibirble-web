
/*****************************
 *  ⚙️  CUSTOMIZE EVERYTHING HERE
 *****************************/
const CONFIG = {
    // ── SLICING PARAMETERS ────────────────────────────────────────
    defaultChunkSize : 7,   // Default size of each chunk (if not provided)
    minChunkSize     : 1};


/**
 * Calculates the **number of steps (chunks)** needed to slice the list.
 * @param {Array}  list       - The input list
 * @param {number} [chunkSize] - Desired chunk size (uses CONFIG.defaultChunkSize if omitted)
 * @returns {number} Number of steps (chunks)
 */
 function calculateSliceSteps(list, chunkSize = CONFIG.defaultChunkSize) {
    if (!Array.isArray(list)) 
        throw new Error("First argument must be an Array.");

    const len = list.length;
    const size = Math.max(CONFIG.minChunkSize, chunkSize); // Enforce min size

    // ✅ KEY FORMULA: CEIL(total items / chunk size)
    return Math.ceil(len / size);
}

export function sliceList(list, chunkSize = CONFIG.defaultChunkSize) {
    if (!Array.isArray(list)) 
        throw new Error("First argument must be an Array.");

    const len = list.length;
    const size = Math.max(CONFIG.minChunkSize, chunkSize);
    const steps = calculateSliceSteps(list, size);
    const chunks = [];
    let start = 0;

    for (let i = 0; i < steps; i++) {
        // Calculate end index (never exceeds list length)
        const end = Math.min(start + size, len);
        chunks.push(list.slice(start, end));
        start = end;
    }

 console.log(chunks)

    return  chunks;
}

