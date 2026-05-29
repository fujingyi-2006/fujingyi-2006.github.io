const gameState = {
    diskCount: 3,
    pegs: [[], [], []],
    moves: 0,
    isAutoSolving: false,
    selectedPegIndex: null
};

const diskCountInput = document.getElementById('diskCount');
const resetBtn = document.getElementById('resetBtn');
const autoSolveBtn = document.getElementById('autoSolveBtn');
const moveCountSpan = document.getElementById('moveCount');
const victoryScreen = document.getElementById('victoryScreen');
const finalMovesSpan = document.getElementById('finalMoves');
const playAgainBtn = document.getElementById('playAgainBtn');
const pegContainers = document.querySelectorAll('.peg-container');

// 初始化游戏
function initGame(count = 3) {
    gameState.diskCount = count;
    gameState.pegs = [[], [], []];
    gameState.moves = 0;
    gameState.selectedPegIndex = null;
    gameState.isAutoSolving = false;
    moveCountSpan.textContent = '0';
    victoryScreen.classList.remove('show');

    // 按大小顺序初始化圆盘
    for (let i = count; i >= 1; i--) {
        gameState.pegs[0].push(i);
    }
    renderGame();
}

// 渲染圆盘（核心！保证圆盘能显示）
function renderGame() {
    pegContainers.forEach((peg, index) => {
        const stackEl = peg.querySelector('.disk-stack');
        stackEl.innerHTML = '';

        gameState.pegs[index].forEach(size => {
            const disk = document.createElement('div');
            disk.classList.add('disk');
            disk.dataset.size = size;
            stackEl.appendChild(disk);
        });
    });
}

// 移动合法性检查
function isValidMove(from, to) {
    const topFrom = gameState.pegs[from].at(-1);
    const topTo = gameState.pegs[to].at(-1);
    if (!topFrom) return false;
    return !topTo || topFrom < topTo;
}

// 执行移动
function executeMove(from, to) {
    const disk = gameState.pegs[from].pop();
    gameState.pegs[to].push(disk);
    gameState.moves++;
    moveCountSpan.textContent = gameState.moves;
    renderGame();
}

// 胜利判断
function checkWin() {
    return gameState.pegs[2].length === gameState.diskCount;
}

// 点击事件处理
pegContainers.forEach((peg, index) => {
    peg.addEventListener('click', (e) => {
        if (gameState.isAutoSolving) return;

        // 点击圆盘选中
        if (e.target.classList.contains('disk')) {
            const diskSize = parseInt(e.target.dataset.size);
            const topDisk = gameState.pegs[index].at(-1);

            if (topDisk === diskSize && gameState.selectedPegIndex === null) {
                gameState.selectedPegIndex = index;
                e.target.classList.add('selected');
            }
        } 
        // 点击柱子放置圆盘
        else if (gameState.selectedPegIndex !== null) {
            const fromPeg = gameState.selectedPegIndex;
            if (isValidMove(fromPeg, index)) {
                executeMove(fromPeg, index);
                if (checkWin()) {
                    setTimeout(() => {
                        finalMovesSpan.textContent = gameState.moves;
                        victoryScreen.classList.add('show');
                    }, 300);
                }
            }
            gameState.selectedPegIndex = null;
            renderGame();
        }
    });
});

// 自动求解（递归汉诺塔）
async function autoSolve() {
    if (gameState.isAutoSolving) return;
    gameState.isAutoSolving = true;
    autoSolveBtn.disabled = true;
    resetBtn.disabled = true;
    diskCountInput.disabled = true;

    await solve(gameState.diskCount, 0, 2, 1);

    gameState.isAutoSolving = false;
    autoSolveBtn.disabled = false;
    resetBtn.disabled = false;
    diskCountInput.disabled = false;

    if (checkWin()) {
        finalMovesSpan.textContent = gameState.moves;
        victoryScreen.classList.add('show');
    }
}

function solve(n, from, to, aux) {
    return new Promise(async (resolve) => {
        if (n === 1) {
            await new Promise(r => setTimeout(r, 500));
            executeMove(from, to);
            resolve();
            return;
        }
        await solve(n - 1, from, aux, to);
        await new Promise(r => setTimeout(r, 500));
        executeMove(from, to);
        await solve(n - 1, aux, to, from);
        resolve();
    });
}

// 按钮事件
diskCountInput.addEventListener('change', () => {
    const count = parseInt(diskCountInput.value);
    if (count >= 3 && count <= 8) {
        initGame(count);
    } else {
        diskCountInput.value = gameState.diskCount;
    }
});

resetBtn.addEventListener('click', () => initGame(gameState.diskCount));
autoSolveBtn.addEventListener('click', autoSolve);
playAgainBtn.addEventListener('click', () => initGame(gameState.diskCount));

// 页面加载后直接初始化（保证圆盘能渲染）
window.addEventListener('load', () => {
    initGame(3);
});