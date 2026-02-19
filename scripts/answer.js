export function share() {
    const emojiColor = {
        "green": "🟩",
        "yellow": "🟨",
        "grey": "⬛"
    }
    const verse = document.getElementById("answer").innerText;
    const rows = document.querySelectorAll(".game-row");
    
    let shareText ="Could you beat this score in Bibirble?\n\n"+ verse + "\n\n";
    
    rows.forEach(row => {
        let rowEmojis = "";
        const inputs = row.querySelectorAll("select,.text-ctrl");
        let validRow = true;
        inputs.forEach(input => {
            const color = input.style.backgroundColor;
            // Match color to emoji, default to grey if not found
            const emoji = emojiColor[color];
            if (!emoji) {
                validRow = false;
                return;
            }
            rowEmojis += emoji;
        });
         shareText += rowEmojis + "\n";
    });
    const shareEl=document.getElementById('submit');
    const frame=document.getElementsByClassName("frame")[0];
    const viewShare=frame.appendChild(document.createElement("div"));
    viewShare.id="view";
    const heading=viewShare.appendChild(document.createElement("h6"));
    heading.innerText="Copy the following text if automatic copying doesn't work!";
    const p=viewShare.appendChild(document.createElement("p"));
    p.innerText=shareText;
    const keyboard =document.getElementsByClassName('keyboard-panel')[0];
    keyboard.hidden=true;

    
    // Copy to clipboard
    navigator.clipboard.writeText(shareText);
    shareEl.innerText="Copied to Clipboard";
}