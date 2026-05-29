// 游戏状态
const gameState = {
    diskCount: 5,
    pegs: [[], [], []],
    moves: 0,
    isAutoSolving: false,
    selectedPegIndex: null,
    selectedDiskSize: null,
    diskColors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FFA07A', '#98D8C8']
};

// DOM 元素
const diskCountInput = document.getElementById('diskCount');
const resetBtn = document.getElementById('resetBtn');
const autoSolveBtn = document.getElementById('autoSolveBtn');
const moveCountSpan = document.getElementById('moveCount');
const warningMsg = document.getElementById('warningMsg');
const victoryScreen = document.getElementById('victoryScreen');
const finalMovesSpan = document.getElementById('finalMoves');
const playAgainBtn = document.getElementById('playAgainBtn');
const pegContainers = document.querySelectorAll('.peg-container');

// 初始化游戏
function initGame(diskCount = gameState.diskCount) {
    gameState.diskCount = diskCount;
    gameState.pegs = [[], [], []];
    gameState.moves = 0;
    gameState.selectedPegIndex = null;
    gameState.selectedDiskSize = null;
    gameState.isAutoSolving = false;
    moveCountSpan.textContent = '0';
    warningMsg.textContent = '';
    victoryScreen.classList.remove('show');

    for (let i = diskCount; i >= 1; i--) {
        gameState.pegs[0].push(i);
    }
    renderGame();
}

// 渲染页面
function renderGame() {
    pegContainers.forEach((pegContainer, pegIndex) => {
        const stackEl = pegContainer.querySelector('.disk-stack');
        stackEl.innerHTML = '';
        gameState.pegs[pegIndex].forEach((diskSize) => {
            const diskEl = document.createElement('div');
            diskEl.classList.add('disk');
            diskEl.dataset.size = diskSize;
            diskEl.style.width = `${diskSize * 20 + 40}px`;
            diskEl.style.backgroundColor = gameState.diskColors[diskSize - 1];
            stackEl.appendChild(diskEl);
        });
    });
}

// 弹出错误提示
function showWarning(message) {
    warningMsg.textContent = message;
    warningMsg.style.animation = 'none';
    warningMsg.offsetHeight;
    warningMsg.style.animation = 'shakeWarning 0.3s, fadeOut 2s forwards';
}

// 校验移动是否合法
function isValidMove(fromPeg, toPeg) {
    const topFrom = gameState.pegs[fromPeg].at(-1);
    const topTo = gameState.pegs[toPeg].at(-1);
    if (!topFrom) return false;
    return !topTo || topFrom < topTo;
}

// 执行移动
function executeMove(fromPeg, toPeg) {
    const disk = gameState.pegs[fromPeg].pop();
    gameState.pegs[toPeg].push(disk);
    gameState.moves++;
    moveCountSpan.textContent = gameState.moves;
    renderGame();
}

// 判断是否胜利
function checkWin() {
    return gameState.pegs[2].length === gameState.diskCount;
}

// 点击圆盘处理
function handleDiskClick(pegIndex, diskSize) {
    if (gameState.isAutoSolving) return;

    if (gameState.selectedPegIndex === null) {
        const topDisk = gameState.pegs[pegIndex].at(-1);
        if (topDisk === diskSize) {
            gameState.selectedPegIndex = pegIndex;
            gameState.selectedDiskSize = diskSize;
            const selectedDisk = document.querySelector(`.peg-container[data-peg="${pegIndex}"] .disk-stack .disk:last-child`);
            selectedDisk.classList.add('selected');
        }
    } else {
        const fromPeg = gameState.selectedPegIndex;
        const toPeg = pegIndex;

        if (fromPeg === toPeg) {
            gameState.selectedPegIndex = null;
            gameState.selectedDiskSize = null;
            renderGame();
            return;
        }

        if (isValidMove(fromPeg, toPeg)) {
            executeMove(fromPeg, toPeg);
            if (checkWin()) {
                setTimeout(() => {
                    finalMovesSpan.textContent = gameState.moves;
                    victoryScreen.classList.add('show');
                }, 500);
            }
        } else {
            showWarning('不能将大圆盘放在小圆盘上！');
        }
        gameState.selectedPegIndex = null;
        gameState.selectedDiskSize = null;
        renderGame();
    }
}

// 自动解谜
async function autoSolve() {
    if (gameState.isAutoSolving) return;
    gameState.isAutoSolving = true;
    autoSolveBtn.disabled = true;
    diskCountInput.disabled = true;
    resetBtn.disabled = true;

    await solveTower(gameState.diskCount, 0, 2, 1);

    gameState.isAutoSolving = false;
    autoSolveBtn.disabled = false;
    diskCountInput.disabled = false;
    resetBtn.disabled = false;

    if (checkWin()) {
        finalMovesSpan.textContent = gameState.moves;
        victoryScreen.classList.add('show');
    }
}

// 递归求解汉诺塔
function solveTower(n, from, to, aux) {
    return new Promise(async (resolve) => {
        if (n === 1) {
            await new Promise(r => setTimeout(r, 500));
            executeMove(from, to);
            resolve();
            return;
        }
        await solveTower(n - 1, from, aux, to);
        await new Promise(r => setTimeout(r, 500));
        executeMove(from, to);
        await solveTower(n - 1, aux, to, from);
        resolve