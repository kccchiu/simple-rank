// DOM Elements
const scoreForm = document.getElementById('scoreForm');
const playerNameInput = document.getElementById('playerName');
const playerTimeInput = document.getElementById('playerTime');
const rankingList = document.getElementById('rankingList');
const exportBtn = document.getElementById('exportBtn');
const clearBtn = document.getElementById('clearBtn');

// Internal data store
let scores = [];

// --- Event Listeners ---

// Handle score submission
scoreForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent default form submission

    const playerName = playerNameInput.value.trim();
    const playerTimeStr = playerTimeInput.value.trim();
    const playerTime = parseFloat(playerTimeStr);

    // Basic Validation
    if (!playerName) {
        alert('Please enter a player name.');
        return;
    }
    if (isNaN(playerTime) || playerTime <= 0) {
        alert('Please enter a valid positive time in seconds.');
        return;
    }

    // Add score to the array
    scores.push({ name: playerName, time: playerTime });

    // Sort scores by time (ascending - lower is better)
    scores.sort((a, b) => a.time - b.time);

    // Update the ranking display
    updateRankingDisplay();

    // Clear input fields
    playerNameInput.value = '';
    playerTimeInput.value = '';
    playerNameInput.focus(); // Set focus back to name input
});

// Handle export button click
exportBtn.addEventListener('click', () => {
    if (scores.length === 0) {
        alert('No scores to export.');
        return;
    }
    exportToCSV();
});

// Handle clear button click
clearBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all scores and rankings?')) {
        scores = []; // Clear the data
        updateRankingDisplay(); // Update the display
        playerNameInput.value = ''; // Clear inputs
        playerTimeInput.value = '';
    }
});

// --- Functions ---

// Update the ranking list display in the HTML
function updateRankingDisplay() {
    // Clear existing list items
    rankingList.innerHTML = '';

    if (scores.length === 0) {
        // Show placeholder if no scores
        const li = document.createElement('li');
        li.className = 'list-group-item text-muted';
        li.textContent = 'No scores submitted yet.';
        rankingList.appendChild(li);
    } else {
        // Create and append list items for each score
        scores.forEach((score, index) => {
            const li = document.createElement('li');
            li.className = 'list-group-item';

            // Rank Badge
            const rankBadge = document.createElement('span');
            rankBadge.className = 'rank-badge';
            rankBadge.textContent = index + 1;

            // Player Name
            const nameSpan = document.createElement('span');
            nameSpan.className = 'player-name';
            nameSpan.textContent = score.name;

            // Player Time
            const timeSpan = document.createElement('span');
            timeSpan.className = 'player-time';
            // Format time nicely (e.g., keep reasonable decimal places if needed)
            timeSpan.textContent = `${Number(score.time.toFixed(3))} seconds`; // Show up to 3 decimal places

            li.appendChild(rankBadge);
            li.appendChild(nameSpan);
            li.appendChild(timeSpan);

            rankingList.appendChild(li);
        });
    }
}

// Generate and trigger download of CSV file
function exportToCSV() {
    const csvHeader = "Rank,Name,Time (seconds)\n";
    const csvRows = scores.map((score, index) => {
        // Escape commas in names if necessary by enclosing in double quotes
        const name = score.name.includes(',') ? `"${score.name}"` : score.name;
        return `${index + 1},${name},${score.time}`;
    }).join("\n");

    const csvContent = csvHeader + csvRows;

    // Create a Blob object
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    // Create a link element
    const link = document.createElement("a");
    if (link.download !== undefined) { // Feature detection
        // Create a URL for the Blob
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "rankings.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url); // Clean up the object URL
    } else {
        alert("CSV export is not supported in this browser.");
    }
}

// --- Initial Setup ---
// Initial display update on page load (shows the empty message)
updateRankingDisplay();