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
        'timeSeconds': 'seconds'
    },
    'zh-Hant': {
        'title': '玩家時間排名',
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
        'timeSeconds': '秒'
    }
};

let currentLanguage = localStorage.getItem('language') || 'zh-Hant'; // Default to Traditional Chinese

// --- Helper Functions ---
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

// Internal data store
let scores = [];

// --- Event Listeners ---

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
        updateRankingDisplay();
        playerNameInput.value = '';
        playerMinutesInput.value = '';
        playerSecondsInput.value = '';
    }
});

// --- Functions ---

// Update the ranking list display in the HTML
function updateRankingDisplay() {
    rankingList.innerHTML = '';

    if (scores.length === 0) {
        const li = document.createElement('li');
        li.className = 'list-group-item text-muted';
        li.setAttribute('data-lang-key', 'noScores'); // Add key for dynamic update
        li.textContent = getTranslation('noScores'); // Set initial text
        rankingList.appendChild(li);
    } else {
        scores.forEach((score, index) => {
            const li = document.createElement('li');
            li.className = 'list-group-item';

            const rankBadge = document.createElement('span');
            rankBadge.className = 'rank-badge';
            rankBadge.textContent = index + 1;

            const nameSpan = document.createElement('span');
            nameSpan.className = 'player-name';
            nameSpan.textContent = score.name;

            const timeSpan = document.createElement('span');
            timeSpan.className = 'player-time';

            const totalSeconds = score.time;
            const minutes = Math.floor(totalSeconds / 60);
            const remainingSeconds = Number((totalSeconds % 60).toFixed(3));

            let timeString = "";
            if (minutes > 0) {
                const minuteText = minutes === 1 ? getTranslation('timeMinute') : getTranslation('timeMinutes');
                timeString += `${minutes} ${minuteText}`;
            }
            if (remainingSeconds > 0 || minutes === 0) {
                if (timeString.length > 0) {
                    timeString += ' ';
                }
                 const secondText = remainingSeconds === 1 ? getTranslation('timeSecond') : getTranslation('timeSeconds');
                 // Only add seconds part if > 0 or if total time is exactly 0
                 if (remainingSeconds > 0 || totalSeconds === 0) {
                    timeString += `${remainingSeconds} ${secondText}`;
                 }
            }
            // Fallback for exactly 0 seconds if logic above didn't catch it
            timeSpan.textContent = timeString || `0 ${getTranslation('timeSeconds')}`;

            li.appendChild(rankBadge);
            li.appendChild(nameSpan);
            li.appendChild(timeSpan);

            rankingList.appendChild(li);
        });
    }
}

// Generate and trigger download of CSV file
function exportToCSV() {
    // Use translated headers
    const csvHeader = `${getTranslation('csvHeaderRank')},${getTranslation('csvHeaderName')},${getTranslation('csvHeaderTime')}\n`;
    const csvRows = scores.map((score, index) => {
        const name = score.name.includes(',') ? `"${score.name}"` : score.name;
        return `${index + 1},${name},${score.time}`;
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

// --- Initial Setup ---
// Apply the initial language settings on page load
document.addEventListener('DOMContentLoaded', () => {
    setLanguage(currentLanguage);
});