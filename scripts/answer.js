const EMOJI = {
    "green": "🟩",
    "yellow": "🟨",
    "gray": "⬛",
    "grey": "⬛"
};

// Builds the spoiler-free share text from the colored rows.
// info: { mode: 'daily'|'random', seed, hardMode }
export function buildShareText(info = {}) {
    const lines = [];
    document.querySelectorAll(".game-row").forEach(row => {
        const cells = Array.from(row.querySelectorAll("select, .text-ctrl"));
        const emojis = cells.map(cell => EMOJI[cell.style.backgroundColor]);
        // Skip rows that were never submitted
        if (emojis.length && emojis.every(Boolean)) lines.push(emojis.join(""));
    });

    const solved = lines[lines.length - 1] === EMOJI.green.repeat(5);
    const score = `${solved ? lines.length : "X"}/7${info.hardMode ? "*" : ""}`;
    const label = info.mode === "daily"
        ? `Daily ${new Date().toISOString().slice(0, 10)}`
        : `Random (seed ${info.seed})`;

    return `Bibirble ${label} ${score}\n\n${lines.join("\n")}\n\nCould you beat this score?`;
}

// Shares the result: native share sheet on phones, clipboard otherwise, and
// always shows the text so it can be copied by hand.
export async function share(info = {}) {
    const shareText = buildShareText(info);
    const shareEl = document.getElementById("submit");

    let view = document.getElementById("view");
    if (!view) {
        view = document.createElement("div");
        view.id = "view";
        document.querySelector(".frame").appendChild(view);
    }
    view.innerHTML = "";
    const heading = view.appendChild(document.createElement("h6"));
    heading.innerText = "Copy the following text if automatic copying doesn't work!";
    const p = view.appendChild(document.createElement("p"));
    p.innerText = shareText;
    // Make room for the share text
    const keyboard = document.querySelector(".keyboard-panel");
    if (keyboard) keyboard.classList.add("hidden");

    if (navigator.share) {
        try {
            await navigator.share({ text: shareText });
            if (shareEl) shareEl.innerText = "Shared!";
            return;
        } catch (e) {
            if (e && e.name === "AbortError") return; // player closed the share sheet
        }
    }
    try {
        await navigator.clipboard.writeText(shareText);
        if (shareEl) shareEl.innerText = "Copied to Clipboard";
    } catch (e) {
        if (shareEl) shareEl.innerText = "Copy the text below";
    }
}
