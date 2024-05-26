const N = 12; // 행의 수
const M = 15; // 열의 수
let startCell = null;
let endCell = null;
let totalScore = 0;

let scoreBoard = [];
document.addEventListener("DOMContentLoaded", () => {
    createGameBoard(N, M);

    document
        .getElementById("check-areas-btn")
        .addEventListener("click", checkForValidAreas);

    document
        .getElementById("show-scoreboard-btn")
        .addEventListener("click", async function () {
            updateScoreboard(null, null);
            document
                .getElementById("scoreboard-modal")
                .classList.remove("hidden");
        });

    document
        .getElementById("close-modal-btn")
        .addEventListener("click", function () {
            document.getElementById("scoreboard-modal").classList.add("hidden");
        });

    document
        .getElementById("register-btn")
        .addEventListener("click", async function () {
            const username = document.getElementById("apple-username").value;
            if (username) {
                const userScore = await recordUserScore(username, totalScore);
                document
                    .querySelector(".username-modal")
                    .classList.add("hidden");
                const rankData = await getRank(username, totalScore);
                updateScoreboard(userScore, rankData);
                document
                    .getElementById("scoreboard-modal")
                    .classList.remove("hidden");
            } else {
                alert("사용자 이름을 입력해주세요");
            }
        });

    document
        .getElementById("cancel-btn")
        .addEventListener("click", async function () {
            const userScore = await recordUserScore("unknown", totalScore);
            document.querySelector(".username-modal").classList.add("hidden");
            const rankData = await getRank("unknown", totalScore);
            updateScoreboard(userScore, rankData);
            document
                .getElementById("scoreboard-modal")
                .classList.remove("hidden");
        });
});

/**
 * 기능: 게임 보드를 생성하고 사과를 배치하는 함수
 * 원리: N * M 크기의 보드를 만들고 각 셀에 랜덤한 숫자(1-9)를 배치한다.
 */
function createGameBoard(n, m) {
    const gameBoard = document.getElementById("game-board");
    gameBoard.style.gridTemplateRows = `repeat(${n}, 1fr)`;
    gameBoard.style.gridTemplateColumns = `repeat(${m}, 1fr)`;

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < m; j++) {
            const apple = document.createElement("div");
            apple.className = "apple";
            apple.textContent = Math.floor(Math.random() * 9) + 1; // 1~9 사이의 랜덤 숫자
            apple.addEventListener("click", onAppleClick);
            gameBoard.appendChild(apple);
        }
    }
}

/**
 * 기능: 사과 클릭 시의 동작 처리
 * 원리: 첫 클릭은 시작 사과, 두 번째 클릭은 끝 사과로 설정하고 선택 영역을 하이라이트한다.
 */
function onAppleClick(event) {
    const apple = event.target;
    apple.classList.add("clicked");

    if (!startCell) {
        startCell = apple;
        apple.classList.add("selected-start");
        return;
    }

    if (!endCell) {
        endCell = apple;
        apple.classList.add("selected-end");
        highlightSelection(); // 선택된 사과 영역을 하이라이트
        checkSelection(); // 합이 10인지 확인하고 제거
        return;
    }

    clearSelection(); // 이전 선택 영역 초기화
    startCell = apple;
    apple.classList.add("selected-start");
}

/**
 * 기능: 선택한 사과 영역을 하이라이트하는 함수
 * 원리: 시작 사과와 끝 사과 사이의 직사각형 영역을 계산하여 하이라이트한다.
 */
function highlightSelection() {
    const apples = document.querySelectorAll(".apple");
    const startIndex = Array.from(apples).indexOf(startCell);
    const endIndex = Array.from(apples).indexOf(endCell);
    const startRow = Math.floor(startIndex / M);
    const startCol = startIndex % M;
    const endRow = Math.floor(endIndex / M);
    const endCol = endIndex % M;

    const minRow = Math.min(startRow, endRow);
    const maxRow = Math.max(startRow, endRow);
    const minCol = Math.min(startCol, endCol);
    const maxCol = Math.max(startCol, endCol);

    for (let i = minRow; i <= maxRow; i++) {
        for (let j = minCol; j <= maxCol; j++) {
            apples[i * M + j].classList.add("selected");
        }
    }
}

/**
 * 기능: 선택한 사과 영역의 합이 10인 경우 제거하는 함수
 * 원리: 선택한 사과의 값을 합산하여 10이면 해당 사과를 제거하고, 사과 배열을 업데이트한다.
 */
function checkSelection() {
    const selectedApples = document.querySelectorAll(".selected");
    let sum = 0;
    let appleCount = 0; // 부순 사과 개수

    selectedApples.forEach((apple) => {
        const value =
            apple.textContent === "" ? 0 : parseInt(apple.textContent);
        sum += value;
        if (value !== 0) appleCount++;
    });

    if (sum !== 10) return;

    let startRow = Infinity,
        startCol = Infinity,
        endRow = -Infinity,
        endCol = -Infinity;

    selectedApples.forEach((apple) => {
        const index = Array.from(document.querySelectorAll(".apple")).indexOf(
            apple
        );
        const row = Math.floor(index / M);
        const col = index % M;

        startRow = Math.min(startRow, row);
        startCol = Math.min(startCol, col);
        endRow = Math.max(endRow, row);
        endCol = Math.max(endCol, col);

        apple.textContent = ""; // 사과 값 제거
    });

    const score = calculateScore(
        startRow,
        startCol,
        endRow,
        endCol,
        appleCount
    );
    totalScore += Math.round(score);
    updateTotalScore();
    console.log(`획득한 점수: ${score}, 총 점수: ${Math.round(totalScore)}`);
}

/**
 * 기능: 선택한 사과 영역을 초기화하는 함수
 * 원리: 선택된 사과 및 시작, 끝 사과의 하이라이트를 제거한다.
 */
function clearSelection() {
    const apples = document.querySelectorAll(".apple");
    apples.forEach((apple) => {
        apple.classList.remove("selected");
        apple.classList.remove("selected-start");
        apple.classList.remove("selected-end");
        apple.classList.remove("clicked");
    });
    startCell = null;
    endCell = null;
}

/**
 * 기능: 가능한 사과 조합이 있는지 확인하는 함수
 * 원리: 모든 가능한 직사각형 영역을 탐색하여 합이 10인 경우를 찾고, 합이 10을 초과하면 탐색을 중단한다.
 */
function checkForValidAreas() {
    const apples = document.querySelectorAll(".apple");
    for (let i1 = 0; i1 < N; i1++) {
        for (let j1 = 0; j1 < M; j1++) {
            for (let i2 = i1; i2 < N; i2++) {
                for (let j2 = j1; j2 < M; j2++) {
                    let sum = 0;
                    for (let i = i1; i <= i2; i++) {
                        for (let j = j1; j <= j2; j++) {
                            const value =
                                apples[i * M + j].textContent === ""
                                    ? 0
                                    : parseInt(apples[i * M + j].textContent);
                            sum += value;
                            if (sum > 10) break; // 합이 10을 초과하면 탐색 중단
                        }
                        if (sum > 10) break; // 합이 10을 초과하면 탐색 중단
                    }
                    if (sum === 10) {
                        console.log(
                            `가능한 사과 조합: (${i1 + 1}, ${j1 + 1}) to (${
                                i2 + 1
                            }, ${j2 + 1})`
                        );
                        alert("아직 더 사과를 지울 수 있어요! -300점!");
                        totalScore -= 300;
                        updateTotalScore();

                        //showUsernameModal();

                        return;
                    }
                }
            }
        }
    }
    alert(`모든 사과를 다 지웠어요! 총 ${Math.round(totalScore)}점!!`);
    showUsernameModal();
}

function showUsernameModal() {
    document.querySelector(".username-modal").classList.remove("hidden");
}

function closeUsernameModal() {
    document.querySelector(".username-modal").classList.add("hidden");
}

/**
 * 기능: 서버에서 스코어보드 받아오는 함수
 * 원리: fetch api를 사용하여, 서버에서 scoreboard 데이터를 받아온다.
 */
async function getScoreBoard() {
    try {
        const response = await fetch("/api/scoreboard");
        if (!response.ok) {
            throw new Error(
                "Network response was not ok " + response.statusText
            );
        }
        return await response.json();
    } catch (error) {
        console.error(error);
    }
}

async function getRank(username, score) {
    try {
        const response = await fetch("/api/rank", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, score }),
        });
        if (!response.ok) {
            throw new Error(
                "Network response was not ok " + response.statusText
            );
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}

/**
 * 기능: 서버에서 새 스코어를 등록하는 함수
 * 원리: fetch api를 사용하여, 서버에 신규 데이터를 등록한다.
 */
async function recordUserScore(username, score) {
    const userScore = {
        username: username,
        score: score,
    };

    try {
        const response = await fetch("/api/scoreboard", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userScore),
        });
        if (!response.ok) {
            throw new Error(
                "Network response was not ok " + response.statusText
            );
        }
        console.log("Score saved successfully");
    } catch (error) {
        console.error(error);
    }

    return userScore;
}

/**
 * 기능: 스코어보드를 업데이트한다.
 * 원리: 서버에서 데이터를 받아와 스코어 보드에 점수를 다시 그린다.
 */
async function updateScoreboard(latestUserScore, rankData) {
    scoreBoard = await getScoreBoard();

    const scoreboardContainer = document.querySelector(".scoreboard-content");
    scoreboardContainer.innerHTML = "";

    if (latestUserScore) {
        const description = document.querySelector("#scoreboard-modal p");
        description.textContent = `이번에 획득한 점수는 ${latestUserScore.score}점 입니다.`;
    }

    if (scoreBoard) {
        scoreBoard.forEach((userScore, index) => {
            const rank = index + 1;
            let bgColorClass =
                rank % 2 === 0
                    ? "bg-white dark:bg-gray-900"
                    : "bg-gray-100 dark:bg-gray-800";

            if (rankData && rank === rankData.rank && rank <= 5) {
                bgColorClass = "bg-yellow-100";
                console.log(rankData, rank, bgColorClass);
            }

            const scoreItem = document.createElement("div");
            scoreItem.className = `flex justify-between px-4 py-2 rounded-md ${bgColorClass}`;
            scoreItem.innerHTML = `
                <div class="font-medium w-1/12">${rank}</div>
                <div class="w-8/12">${userScore.username}</div>
                <div class="text-right font-medium w-3/12">${userScore.score}</div>
            `;

            scoreboardContainer.appendChild(scoreItem);
        });
    }

    if (rankData && rankData.rank > 5) {
        const rank = rankData.rank;
        const username = rankData.username;
        const score = rankData.score;

        const currentScoreItem = document.createElement("div");
        currentScoreItem.className = `flex justify-between px-4 py-2 rounded-md bg-yellow-100 dark:bg-gray-800`;
        currentScoreItem.innerHTML = `
            <div class="font-medium w-1/12">${rank}</div>
            <div class="w-8/12">${username}</div>
            <div class="text-right font-medium w-3/12">${score}</div>
        `;

        scoreboardContainer.appendChild(currentScoreItem);
    }
}

/**
 * 기능: 사과를 부술 때 점수를 계산하는 함수
 * 원리: 부순 사과의 개수와 거리 보너스를 기반으로 점수를 계산한다.
 */
function calculateScore(startRow, startCol, endRow, endCol, appleCount) {
    const dx = endRow - startRow;
    const dy = endCol - startCol;
    const d = Math.sqrt(dx * dx + dy * dy);
    const k = 10; // 거리 보너스 계수

    const score = 100 * appleCount + d * k;
    return score;
}

/**
 * 기능: 총 점수를 업데이트하는 함수
 * 원리: 총 점수를 표시하는 요소의 텍스트를 갱신한다.
 */
function updateTotalScore() {
    const totalScoreElement = document.getElementById("total-score");
    totalScoreElement.textContent = `현재 점수 : ${totalScore}`;
}

document.getElementById("reset-btn").addEventListener("click", resetGame);

/**
 * 기능: 게임을 새로 시작하는 함수
 * 원리: 페이지를 새로고침하여 게임을 초기화한다.
 */
function resetGame() {
    location.reload();
}
