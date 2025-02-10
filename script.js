document.addEventListener('DOMContentLoaded', () => {
    let timerInterval;
    let seconds = 0;
    let focusedInput = null; // Track the currently focused input

    function startGame() {
        const startScreen = document.getElementById('start-screen');
        const gameContent = document.getElementById('game-content');

        if (startScreen && gameContent) {
            startScreen.style.display = 'none';
            gameContent.style.display = 'block';
            startTimer();
            createCrossword();
        } else {
            console.error("Start screen or game content not found!");
        }
    }

    function startTimer() {
        timerInterval = setInterval(() => {
            seconds++;
            document.getElementById('timer').textContent = `Time: ${formatTime(seconds)}`;
        }, 1000);
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }

    const hints = [
        { hintNumber: 1, startX: 2, startY: 5, string: "OPENAI", isVertical: false },
        { hintNumber: 2, startX: 2, startY: 9, string: "ALTMAN", isVertical: true },
        { hintNumber: 3, startX: 1, startY: 7, string: "DEEPSEEK", isVertical: true },
        { hintNumber: 4, startX: 8, startY: 0, string: "STARLINK", isVertical: false },
        { hintNumber: 5, startX: 4, startY: 4, string: "COPILOT", isVertical: true },
        { hintNumber: 6, startX: 3, startY: 8, string: "LLM", isVertical: false },
        { hintNumber: 7, startX: 3, startY: 6, string: "NEURON", isVertical: true },
        { hintNumber: 8, startX: 0, startY: 2, string: "HALLUCINATE", isVertical: true },
        { hintNumber: 9, startX: 1, startY: 0, string: "LLAMA", isVertical: false },
    ];

    const rowCount = hints.reduce((maxRows, hint) =>
        hint.isVertical ? Math.max(maxRows, hint.startX + hint.string.length) : Math.max(maxRows, hint.startX + 1), 0);
    const colCount = hints.reduce((maxCols, hint) =>
        hint.isVertical ? Math.max(maxCols, hint.startY + 1) : Math.max(maxCols, hint.startY + hint.string.length), 0);

    const crosswordData = Array.from({ length: rowCount }, () => Array(colCount).fill('.'));

    hints.forEach(({ startX, startY, string, isVertical }) => {
        for (let i = 0; i < string.length; i++) {
            const x = startX + (isVertical ? i : 0);
            const y = startY + (isVertical ? 0 : i);
            crosswordData[x][y] = string[i];
        }
    });

    function createCrossword() {
        const table = document.getElementById('crossword');
        crosswordData.forEach((row, rowIndex) => {
            const tr = document.createElement('tr');
            row.forEach((cell, colIndex) => {
                const td = document.createElement('td');
                if (cell !== '.') {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.maxLength = 1;
                    input.dataset.row = rowIndex;
                    input.dataset.col = colIndex;

                    // Track focus
                    input.addEventListener('focus', () => {
                        focusedInput = input;
                    });

                    td.appendChild(input);

                    // Add hint number if present
                    const hintForPosition = hints.find(
                        (hint) =>
                            hint.startX === rowIndex &&
                            hint.startY === colIndex &&
                            hint.hintNumber !== 0
                    );
                    if (hintForPosition) {
                        const hintNumberElement = document.createElement('span');
                        hintNumberElement.textContent = hintForPosition.hintNumber;
                        hintNumberElement.classList.add('hint-number');
                        td.appendChild(hintNumberElement);
                    }
                } else {
                    td.classList.add('empty-cell'); // Mark as an empty cell
                }
                tr.appendChild(td);
            });
            table.appendChild(tr);
        });
    }

    function validatePuzzle() {
        const inputs = document.querySelectorAll("input");
        let isCorrect = true;

        inputs.forEach((inputElement) => {
            const row = inputElement.dataset.row;
            const col = inputElement.dataset.col;
            if (inputElement.value.toUpperCase() !== crosswordData[row][col]) {
                isCorrect = false;
            }
        });

        const message = document.getElementById("message");
        const backButton = document.querySelector(".home-button");
        const timerValue = document.getElementById("timer").textContent; // Get timer value
        const email = localStorage.getItem("userEmail"); // Fetch user's email

        if (isCorrect) {
            stopTimer();
            message.textContent = "Congratulations! You solved the puzzle!";
            if (backButton) {
                backButton.classList.add("green");
            }
            localStorage.setItem("crosswordCompleted", "true");
            localStorage.setItem("timerValue", timerValue);

            // Store user data in the backend
            storeUserData(email, timerValue);
        } else {
            message.textContent = "Keep trying!";
        }
    }

    async function storeUserData(email, timer) {
                    if (!email || !timer) {
                        console.error("Email or timer value is missing!");
                        return;
                    }
                
                    try {
                        const response = await fetch("http://localhost:3000/store-data", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ email, timer }),
                        });
                
                        if (response.ok) {
                            console.log("User data stored successfully!");
                        } else {
                            console.error("Failed to store user data:", await response.json());
                        }
                    } catch (error) {
                        console.error("Error while storing user data:", error);
                    }
                }
                
    function goBackToHome() {
        window.location.href = 'index.html';
    }

    // Arrow key navigation
    // Arrow key navigation
// Arrow key navigation
document.addEventListener('keydown', (event) => {
    if (!focusedInput) return;

    // Get all editable inputs
    const inputs = Array.from(document.querySelectorAll('input'));

    // Get the row and column of the currently focused input
    const currentRow = parseInt(focusedInput.dataset.row);
    const currentCol = parseInt(focusedInput.dataset.col);

    let nextRow = currentRow;
    let nextCol = currentCol;

    // Determine the next row and column based on the key pressed
    switch (event.key) {
        case 'ArrowUp':
            nextRow = currentRow - 1; // Move up one row
            break;

        case 'ArrowDown':
            nextRow = currentRow + 1; // Move down one row
            break;

        case 'ArrowLeft':
            nextCol = currentCol - 1; // Move left one column
            break;

        case 'ArrowRight':
            nextCol = currentCol + 1; // Move right one column
            break;

        default:
            return; // Ignore other keys
    }

    // Find the next input element with the corresponding row and column
    const nextInput = inputs.find(input =>
        parseInt(input.dataset.row) === nextRow &&
        parseInt(input.dataset.col) === nextCol
    );

    // Focus the next input if it exists
    if (nextInput) {
        nextInput.focus();
    }
});



    window.startGame = startGame;
    window.validatePuzzle = validatePuzzle;
    window.goBackToHome = goBackToHome;
});
