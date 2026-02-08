// ====================
// CONFIG
// ====================
const GRID_SIZE = 10;

const WORDS = [
    "WOOD",
    "LATHE",
    "AIREDALE",
    "RALEIGH",
    "RETRO",
    "NEWLAND"
    // Add/remove words here (max length <= 10)
];

// ====================
// STATE
// ====================
let grid = [];
let selectedCells = [];
let foundWords = new Set();

let timerStarted = false;
let seconds = 0;
let timerInterval = null;

let soundOn = false;
let userInteracted = false;

// ====================
// DOM
// ====================
const gridEl = document.getElementById("grid");
const wordListEl = document.getElementById("wordList");
const timerEl = document.getElementById("timer");
const finalTimeEl = document.getElementById("finalTime");
const winScreen = document.getElementById("winScreen");

const bgMusic = document.getElementById("bgMusic");
const winSound = document.getElementById("winSound");
const soundToggle = document.getElementById("soundToggle");
const continueBtn = document.getElementById("continueBtn");

// ====================
// INIT
// ====================
initGame();

// ====================
// GAME SETUP
// ====================
function initGame() {
    clearInterval(timerInterval);
    timerInterval = null;
    seconds = 0;
    timerStarted = false;
    timerEl.textContent = "00:00";

    clearSelection();
    foundWords.clear();

    grid = [];
    gridEl.innerHTML = "";
    wordListEl.innerHTML = "";

    createEmptyGrid();
    placeWordsSafely();
    fillRandomLetters();
    renderGrid();
    renderWordList();

    winScreen.classList.add("hidden");

    bgMusic.pause();
    bgMusic.currentTime = 0;
    winSound.pause();
    winSound.currentTime = 0;
}

// ====================
// GRID LOGIC
// ====================
function createEmptyGrid() {
    for (let y = 0; y < GRID_SIZE; y++) {
        grid[y] = [];
        for (let x = 0; x < GRID_SIZE; x++) {
            grid[y][x] = "";
        }
    }
}

/* prevents infinite loops when word list gets awkward */
function placeWordsSafely() {
    for (const word of WORDS) {
        const upper = word.toUpperCase();

        if (upper.length > GRID_SIZE) {
            console.warn(`Skipping "${upper}" (too long for ${GRID_SIZE}x${GRID_SIZE})`);
            continue;
        }

        let placed = false;
        let attempts = 0;
        const MAX_ATTEMPTS = 500;

        while (!placed && attempts < MAX_ATTEMPTS) {
            attempts++;

            const horizontal = Math.random() < 0.5;
            const x = Math.floor(Math.random() * GRID_SIZE);
            const y = Math.floor(Math.random() * GRID_SIZE);

            if (canPlace(upper, x, y, horizontal)) {
                for (let i = 0; i < upper.length; i++) {
                    if (horizontal) grid[y][x + i] = upper[i];
                    else grid[y + i][x] = upper[i];
                }
                placed = true;
            }
        }

        if (!placed) {
            console.warn(`Could not place "${upper}" after ${MAX_ATTEMPTS} attempts`);
        }
    }
}

function canPlace(word, x, y, horizontal) {
    if (horizontal && x + word.length > GRID_SIZE) return false;
    if (!horizontal && y + word.length > GRID_SIZE) return false;

    for (let i = 0; i < word.length; i++) {
        const cell = horizontal ? grid[y][x + i] : grid[y + i][x];
        if (cell !== "" && cell !== word[i]) return false;
    }
    return true;
}

function fillRandomLetters() {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            if (grid[y][x] === "") {
                grid[y][x] = letters[Math.floor(Math.random() * letters.length)];
            }
        }
    }
}

// ====================
// RENDERING
// ====================
function renderGrid() {
    gridEl.style.setProperty("--grid-size", String(GRID_SIZE)); // critical for CSS columns
    gridEl.innerHTML = "";

    grid.forEach((row, y) => {
        row.forEach((letter, x) => {
            const div = document.createElement("div");
            div.textContent = letter;
            div.className = "cell";
            div.dataset.x = String(x);
            div.dataset.y = String(y);
            div.addEventListener("click", () => selectCell(div));
            gridEl.appendChild(div);
        });
    });
}

function renderWordList() {
    WORDS.forEach(word => {
        const upper = word.toUpperCase();
        const li = document.createElement("li");
        li.textContent = upper;
        li.id = `word-${upper}`;
        wordListEl.appendChild(li);
    });
}

// ====================
// GAMEPLAY
// ====================
function selectCell(cell) {
    userInteracted = true;
    startTimer();

    if (soundOn && bgMusic.paused) {
        bgMusic.play().catch(() => {});
    }

    const x = Number(cell.dataset.x);
    const y = Number(cell.dataset.y);

    if (selectedCells.length === 0) {
        if (!cell.classList.contains("found")) cell.classList.add("selected");
        selectedCells.push({ x, y, cell });
        return;
    }

    const last = selectedCells[selectedCells.length - 1];
    const dx = x - last.x;
    const dy = y - last.y;

    if (Math.abs(dx) + Math.abs(dy) !== 1) {
        clearSelection();
        return;
    }

    if (selectedCells.length === 1) {
        selectedCells.direction = dx !== 0 ? "horizontal" : "vertical";
    }

    if (
        (selectedCells.direction === "horizontal" && dy !== 0) ||
        (selectedCells.direction === "vertical" && dx !== 0)
    ) {
        clearSelection();
        return;
    }

    if (!cell.classList.contains("found")) cell.classList.add("selected");
    selectedCells.push({ x, y, cell });

    const currentWord = selectedCells.map(c => c.cell.textContent).join("");

    if (!isValidPrefix(currentWord)) {
        clearSelection();
        return;
    }

    checkSelection();
}

function clearSelection() {
    selectedCells.forEach(c => {
        if (!c.cell.classList.contains("found")) c.cell.classList.remove("selected");
    });
    selectedCells = [];
    delete selectedCells.direction;
}

// ====================
// WORD CHECK
// ====================
function isValidPrefix(str) {
    return WORDS.some(w => w.toUpperCase().startsWith(str));
}

function checkSelection() {
    const word = selectedCells.map(c => c.cell.textContent).join("");

    const upperWords = WORDS.map(w => w.toUpperCase());

    if (upperWords.includes(word) && !foundWords.has(word)) {
        foundWords.add(word);

        selectedCells.forEach(c => {
            c.cell.classList.remove("selected");
            c.cell.classList.add("found");
        });

        const li = document.getElementById(`word-${word}`);
        if (li) li.classList.add("found");

        clearSelection();

        if (foundWords.size === upperWords.length) {
            winGame();
        }
    }
}

// ====================
// TIMER
// ====================
function startTimer() {
    if (timerStarted) return;
    timerStarted = true;

    timerInterval = setInterval(() => {
        seconds++;
        const m = String(Math.floor(seconds / 60)).padStart(2, "0");
        const s = String(seconds % 60).padStart(2, "0");
        timerEl.textContent = `${m}:${s}`;
    }, 1000);
}

// ====================
// SOUND TOGGLE
// ====================
soundToggle.addEventListener("click", () => {
    soundOn = !soundOn;
    soundToggle.textContent = soundOn ? "SOUND: ON" : "SOUND: OFF";

    if (soundOn && userInteracted) {
        bgMusic.volume = 0.4;
        bgMusic.play().catch(() => {});
    } else {
        bgMusic.pause();
    }
});

// ====================
// WIN + PLAY AGAIN
// ====================
function winGame() {
    clearInterval(timerInterval);
    finalTimeEl.textContent = timerEl.textContent;

    bgMusic.pause();
    bgMusic.currentTime = 0;

    if (soundOn && userInteracted) {
        winSound.currentTime = 0;
        winSound.play().catch(() => {});
    }

    winScreen.classList.remove("hidden");
}

continueBtn.addEventListener("click", () => {
    winSound.pause();
    winSound.currentTime = 0;
    initGame();
});
