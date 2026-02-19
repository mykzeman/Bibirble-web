import { initGame, submitFromData } from "./data.js";
import { share } from "./answer.js";
var stage = 0;
var targetIndex = 0;

// Initialize the game on load
document.addEventListener('DOMContentLoaded', () => {
    initGame().then(idx => {
        targetIndex = idx;
        console.log(`Game Initialized. Target Index: ${targetIndex}`);
    });
});

export function FinalSubmit() {
    // Pass the current stage and target index
    const result = submitFromData(stage, targetIndex);
    // Update stage based on result
    stage = result[0];
    // Check for win/loss or just log
    console.log(`Round submitted. New Stage: ${stage}`);
    if (stage==-1) {
        const submit=document.getElementById("submit");
        submit.innerText="Share";
        submit.onclick=(e)=>{
            share();
            submit.disabled=true;

        }
        
    }
}