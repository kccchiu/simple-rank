// --- Translations ---
const translations = {
    'en': {
        'title': 'Player Time Ranking',
        'enterScoreTitle': 'Enter Score',
        'playerNameLabel': 'Player Name',
        'timeLabel': 'Time',
        'minutesPlaceholder': 'Minutes',
        'secondsPlaceholder': 'Seconds',
        'submitButton': 'Submit Score',
        'rankingTitle': 'Ranking',
        'noScores': 'No scores submitted yet.',
        'actionsTitle': 'Actions',
        'exportButton': 'Export Results (CSV)',
        'clearButton': 'Clear All',
        'language': 'Language',
        'alertEnterName': 'Please enter a player name.',
        'alertValidTime': 'Please enter a valid positive time (minutes and/or seconds).',
        'alertNoExport': 'No scores to export.',
        'confirmClear': 'Are you sure you want to clear all scores and rankings?',
        'csvHeaderRank': 'Rank',
        'csvHeaderName': 'Name',
        'csvHeaderTime': 'Time (seconds)',
        'timeMinute': 'minute',
        'timeMinutes': 'minutes',
        'timeSecond': 'second',
        'timeSeconds': 'seconds',
        'confirmDelete': 'Are you sure you want to delete this score?',
        'timerLabel': 'Timer', // Added
        'startTimerButton': 'Start', // Added
        'stopTimerButton': 'Stop', // Added
        'timeLabelManual': 'Time (Manual Entry)' // Added for clarity
    },
    'zh-Hant': {
        'title': '遊戲挑戰站',
        'enterScoreTitle': '輸入分數',
        'playerNameLabel': '玩家名稱',
        'timeLabel': '時間',
        'minutesPlaceholder': '分鐘',
        'secondsPlaceholder': '秒',
        'submitButton': '提交分數',
        'rankingTitle': '排名',
        'noScores': '尚無分數提交。',
        'actionsTitle': '操作',
        'exportButton': '匯出結果 (CSV)',
        'clearButton': '全部清除',
        'language': '語言',
        'alertEnterName': '請輸入玩家名稱。',
        'alertValidTime': '請輸入有效的正數時間（分鐘和/或秒）。',
        'alertNoExport': '沒有分數可匯出。',
        'confirmClear': '您確定要清除所有分數和排名嗎？',
        'csvHeaderRank': '排名',
        'csvHeaderName': '名稱',
        'csvHeaderTime': '時間 (秒)',
        'timeMinute': '分鐘',
        'timeMinutes': '分鐘',
        'timeSecond': '秒',
        'timeSeconds': '秒',
        'confirmDelete': '您確定要刪除此分數嗎？',
        'timerLabel': '計時器', // Added
        'startTimerButton': '開始', // Added
        'stopTimerButton': '停止', // Added
        'timeLabelManual': '時間（手動輸入）' // Added for clarity
    }
};

// --- Translations ---
let currentLanguage = localStorage.getItem('language') || 'zh-Hant'; // Default to Traditional Chinese
function getTranslation(key) {
    return translations[currentLanguage][key] || translations['en'][key] || key; // Fallback chain
}

function translateElement(element) {
    const key = element.getAttribute('data-lang-key');
    if (key) {
        const translation = getTranslation(key);
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            if (element.placeholder) {
                element.placeholder = translation;
            }
        } else {
            element.textContent = translation;
        }
    }
}

function setLanguage(lang) {
    if (translations[lang]) {
        currentLanguage = lang;
        localStorage.setItem('language', lang); // Save preference
        // Update all elements with data-lang-key
        document.querySelectorAll('[data-lang-key]').forEach(translateElement);
        // Update dynamic elements like the ranking list placeholder
        updateRankingDisplay();
        // Update dropdown button text (optional, but good UX)
        const langDropdownButton = document.getElementById('languageDropdown');
        if (langDropdownButton) {
            langDropdownButton.textContent = getTranslation('language');
        }
    } else {
        console.error(`Language ${lang} not found.`);
    }
}


// --- DOM Elements ---
const scoreForm = document.getElementById('scoreForm');
const playerNameInput = document.getElementById('playerName');
const playerMinutesInput = document.getElementById('playerMinutes');
const playerSecondsInput = document.getElementById('playerSeconds');
const rankingList = document.getElementById('rankingList');
const exportBtn = document.getElementById('exportBtn');
const clearBtn = document.getElementById('clearBtn');
const timerDisplay = document.getElementById('timerDisplay'); // Added
const startTimerBtn = document.getElementById('startTimerBtn'); // Added
// const stopTimerBtn = document.getElementById('stopTimerBtn'); // Removed

// Internal data store
let scores = [];
// --- Event Listeners ---
scores = JSON.parse(localStorage.getItem('scores')) || [];

// Handle score submission
scoreForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const playerName = playerNameInput.value.trim();
    const playerMinutesStr = playerMinutesInput.value.trim();
    const playerSecondsStr = playerSecondsInput.value.trim();

    const playerMinutes = parseInt(playerMinutesStr, 10) || 0;
    const playerSeconds = parseFloat(playerSecondsStr) || 0.0;

    const totalTimeInSeconds = (playerMinutes * 60) + playerSeconds;

    if (!playerName) {
        alert(getTranslation('alertEnterName'));
        return;
    }
    if (totalTimeInSeconds <= 0) {
        alert(getTranslation('alertValidTime'));
        return;
    }

    scores.push({ name: playerName, time: totalTimeInSeconds });
    scores.sort((a, b) => a.time - b.time);
    updateRankingDisplay();
    showConfetti(); // Add confetti effect

    playerNameInput.value = '';
    playerMinutesInput.value = '';
    playerSecondsInput.value = '';
    playerNameInput.focus();
});

// Handle export button click
exportBtn.addEventListener('click', () => {
    if (scores.length === 0) {
        alert(getTranslation('alertNoExport'));
        return;
    }
    exportToCSV();
});

// Handle clear button click
clearBtn.addEventListener('click', () => {
    if (confirm(getTranslation('confirmClear'))) {
        scores = [];
        localStorage.removeItem('scores');
        updateRankingDisplay();
        playerNameInput.value = '';
        playerMinutesInput.value = '';
        playerSecondsInput.value = '';
    }
});

// --- Timer Variables ---
let timerInterval = null;
let startTime = 0;
let elapsedTime = 0; // Store elapsed time when stopped

// --- Timer Functions ---

// Format time in MM:SS.T
function formatTime(milliseconds) {
    const totalSecondsFloat = milliseconds / 1000;
    const minutes = Math.floor(totalSecondsFloat / 60);
    const remainingSeconds = totalSecondsFloat % 60;
    const seconds = Math.floor(remainingSeconds);
    const tenths = Math.floor((remainingSeconds - seconds) * 10);

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${tenths}`;
}

// Start the timer
function startTimer() {
    if (timerInterval) return; // Prevent multiple intervals

    startTime = Date.now() - elapsedTime; // Adjust start time if resuming
    timerInterval = setInterval(() => {
        const now = Date.now();
        const currentElapsedTime = now - startTime;
        // Update display only if the formatted time actually changes (prevents unnecessary DOM updates)
        const formatted = formatTime(currentElapsedTime);
        if (timerDisplay.textContent !== formatted) {
            timerDisplay.textContent = formatted;
        }
    }, 100); // Update display check every 100ms

    // Update button text and state
    startTimerBtn.textContent = getTranslation('stopTimerButton');
    startTimerBtn.classList.remove('btn-success');
    startTimerBtn.classList.add('btn-warning');
    // startTimerBtn.disabled = true; // Removed
    // stopTimerBtn.disabled = false; // Removed
}

// Stop the timer
function stopTimer() {
    if (!timerInterval) return; // Only stop if running

    clearInterval(timerInterval);
    timerInterval = null;
    elapsedTime = Date.now() - startTime; // Record final elapsed time
    timerDisplay.textContent = formatTime(elapsedTime); // Display final time

    // Populate the minute and second fields
    const totalSecondsRaw = elapsedTime / 1000;
    const minutes = Math.floor(totalSecondsRaw / 60);
    // Calculate seconds and tenths using truncation, matching formatTime
    const remainingSecondsFloat = totalSecondsRaw % 60;
    const seconds = Math.floor(remainingSecondsFloat);
    const tenths = Math.floor((remainingSecondsFloat - seconds) * 10);
    const secondsForInput = `${seconds}.${tenths}`; // Combine seconds and tenths

    playerMinutesInput.value = minutes;
    playerSecondsInput.value = secondsForInput;

    // Update button text and state
    startTimerBtn.textContent = getTranslation('startTimerButton');
    startTimerBtn.classList.remove('btn-warning');
    startTimerBtn.classList.add('btn-success');
    // startTimerBtn.disabled = false; // Removed
    // stopTimerBtn.disabled = true; // Removed

    // Reset elapsedTime for the next run if needed, or keep it to allow resume?
    // For now, let's reset it so Start always begins from 0 after a Stop.
    // If resume functionality is desired, remove the line below.
    elapsedTime = 0;
}

// --- Event Listener (Timer Toggle) ---
function handleTimerToggle() {
    if (timerInterval) { // If timer is running, stop it
        stopTimer();
    } else { // If timer is stopped, start it
        startTimer();
        elapsedTime = 0; // Reset elapsed time when starting from stopped state
    }
}

startTimerBtn.addEventListener('click', handleTimerToggle);
// stopTimerBtn.addEventListener('click', stopTimer); // Removed

// --- Functions ---

// Update the ranking list display in the HTML
function updateRankingDisplay() {
    localStorage.setItem('scores', JSON.stringify(scores));
    rankingList.innerHTML = '';

    if (scores.length === 0) {
        const li = document.createElement('li');
        li.className = 'list-group-item text-muted';
        li.setAttribute('data-lang-key', 'noScores'); // Add key for dynamic update
        li.textContent = getTranslation('noScores'); // Set initial text
        rankingList.appendChild(li);
    } else {
        let lastTime = -1; // Initialize with a value that won't match any real time
        let actualRank = 0;
        scores.forEach((score, index) => {
            const li = document.createElement('li');
            li.className = 'list-group-item';

            const rankBadge = document.createElement('span');
            rankBadge.className = 'rank-badge';

            // Determine rank based on time, handling ties
            // Compare times rounded to one decimal place to match display precision
            if (index === 0 || score.time.toFixed(1) !== scores[index - 1].time.toFixed(1)) {
                actualRank = index + 1; // Update rank only if time is different
                rankBadge.textContent = actualRank;
            } else {
                // It's a tie with the previous score
                rankBadge.textContent = '-'; // Display '-' for subsequent ties
            }

            const nameSpan = document.createElement('span');
            nameSpan.className = 'player-name';
            nameSpan.textContent = score.name;

            const timeSpan = document.createElement('span');
            timeSpan.className = 'player-time';
            timeSpan.style.cursor = 'pointer'; // Indicate it's clickable
            timeSpan.style.marginRight = '10px';
            timeSpan.addEventListener('click', (event) => {
                const originalTime = score.time;
                const inputElement = document.createElement('input');
                inputElement.type = 'number';
                inputElement.value = originalTime;
                inputElement.style.width = '50px'; // Adjust as needed
                timeSpan.textContent = ''; // Clear the timeSpan
                timeSpan.appendChild(inputElement);
                inputElement.focus();

                inputElement.addEventListener('blur', () => {
                    const newTime = parseFloat(inputElement.value);
                    if (!isNaN(newTime) && newTime >= 0) {
                        score.time = newTime;
                        scores.sort((a, b) => a.time - b.time);
                        updateRankingDisplay();
                    } else {
                        score.time = originalTime;
                        updateRankingDisplay();
                    }
                });

                inputElement.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter') {
                        inputElement.blur(); // Trigger blur event
                    }
                });
            });
            const totalSeconds = score.time;
            const minutes = Math.floor(totalSeconds / 60);
            const remainingSeconds = Number((totalSeconds % 60).toFixed(1)); // Show tenths

            let timeString = "";
            if (minutes > 0) {
                const minuteText = minutes === 1 ? getTranslation('timeMinute') : getTranslation('timeMinutes');
                timeString += `${minutes} ${minuteText}`;
            }
            if (remainingSeconds > 0 || minutes === 0) {
                if (timeString.length > 0) {
                    timeString += ' ';
                }
                 // Adjust for singular/plural based on whole seconds, but display with tenths
                 const wholeSeconds = Math.floor(remainingSeconds);
                 const secondText = (wholeSeconds === 1 && remainingSeconds < 2) ? getTranslation('timeSecond') : getTranslation('timeSeconds');
                 // Only add seconds part if > 0 or if total time is exactly 0
                 if (remainingSeconds > 0 || totalSeconds === 0) {
                    timeString += `${remainingSeconds.toFixed(1)} ${secondText}`; // Display with tenths
                 }
            }
            // Fallback for exactly 0 seconds if logic above didn't catch it
            timeSpan.textContent = timeString || `0 ${getTranslation('timeSeconds')}`;

            li.appendChild(rankBadge);
            li.appendChild(nameSpan);
            li.appendChild(timeSpan);

            const deleteButton = document.createElement('button');
            deleteButton.className = 'btn btn-sm delete-button';
            deleteButton.style.backgroundColor = '#ffe4e1'; /* Very Light Pink */
            deleteButton.style.color = 'black';
            deleteButton.textContent = '🗑️';
            deleteButton.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent row click
                if (confirm(getTranslation('confirmDelete'))) {
                    scores.splice(index, 1);
                    updateRankingDisplay();
                }
            });

            li.appendChild(deleteButton);
            rankingList.appendChild(li);
        });
    }
}

// Generate and trigger download of CSV file
function exportToCSV() {
    // Use translated headers
    const csvHeader = `${getTranslation('csvHeaderRank')},${getTranslation('csvHeaderName')},${getTranslation('csvHeaderTime')}\n`;
    let csvActualRank = 0;
    const csvRows = scores.map((score, index) => {
        // Determine actual numerical rank for CSV, handling ties (e.g., 1, 1, 3)
        if (index === 0 || score.time !== scores[index - 1].time) {
            csvActualRank = index + 1;
        }
        const name = score.name.includes(',') ? `"${score.name}"` : score.name;
        return `${csvActualRank},${name},${score.time}`;
    }).join("\n");

    const csvContent = csvHeader + csvRows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        // Consider adding language to filename? e.g., rankings-${currentLanguage}.csv
        link.setAttribute("download", "rankings.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } else {
        // Translate this alert too? Maybe less critical.
        alert("CSV export is not supported in this browser.");
    }
}

// --- Confetti Function ---
function showConfetti() {
    const confettiContainer = document.createElement('div');
    confettiContainer.id = 'confetti-container'; // Add ID for styling
    document.body.appendChild(confettiContainer);

    const gifSrc = 'conf.gif'; // Path to your GIF
    const gifWidth = 100; // Approximate width of your GIF in pixels, adjust if needed
    const screenWidth = window.innerWidth;
    const numGifs = Math.ceil(screenWidth / gifWidth);

    for (let i = 0; i < numGifs; i++) {
        const img = document.createElement('img');
        img.src = gifSrc;
        img.alt = 'Confetti';
        img.style.width = `${gifWidth}px`; // Set width explicitly if needed
        img.style.height = 'auto';
        confettiContainer.appendChild(img);
    }

    // Remove confetti after a few seconds
    setTimeout(() => {
        confettiContainer.remove();
    }, 3000); // Adjust duration as needed (3000ms = 3 seconds)
}


// --- Initial Setup ---
// Apply the initial language settings on page load
document.addEventListener('DOMContentLoaded', () => {
    setLanguage(currentLanguage); // Apply translations first
    // stopTimerBtn.disabled = true; // Removed - No longer needed
    // Ensure start button text is correct initially (handled by setLanguage)
});