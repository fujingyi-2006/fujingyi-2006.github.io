// ========== 汉诺塔游戏类 ==========
class HanoiGame {
    constructor(disksCount = 4) {
        this.disksCount = Math.min(8, Math.max(3, disksCount));
        this.pegs = [[], [], []];
        this.moves = 0;
        this.isAutoSolving = false;
        this.selectedPeg = null;
        this.selectedDiskSize = null;
        this.winFlag = false;
        this.solveSteps = [];
        
        this.initPegs();
    }

    // 初始化圆盘 (所有圆盘在 peg 0)
    initPegs() {
        this.pegs = [[], [], []];
        for (let i = this.disksCount; i >= 1; i--) {
            this.pegs[0].push(i);
        }
        this.moves = 0;
        this.winFlag = false;
        this.selectedPeg = null;
        this.selectedDiskSize = null;
        this.updateMoveCounter();
    }

    // 获取柱子顶部圆盘
    getTopDisk(pegIdx) {
        if (this.pegs[pegIdx].length === 0) return Infinity;
        return this.pegs[pegIdx][this.pegs[pegIdx].length - 1];
    }

    // 检查移动合法性
    isValidMove(fromPeg, toPeg) {
        if (fromPeg === toPeg) return false;
        if (this.pegs[fromPeg].length === 0) return false;
        const diskFrom = this.getTopDisk(fromPeg);
        const diskTo = this.getTopDisk(toPeg);
        return diskFrom < diskTo;
    }

    // 执行移动
    executeMove(fromPeg, toPeg) {
        if (!this.isValidMove(fromPeg, toPeg)) return false;
        const disk = this.pegs[fromPeg].pop();
        this.pegs[toPeg].push(disk);
        this.moves++;
        this.updateMoveCounter();
        return true;
    }

    // 尝试移动 (外部调用)
    attemptMove(fromPeg, toPeg) {
        if (this.isAutoSolving || this.winFlag) {
            this.showWarning("自动求解中或游戏已胜利，请重置");
            return false;
        }
        if (!this.isValidMove(fromPeg, toPeg)) {
            this.showWarning("❌ 大盘不能放在小盘上！❌", true);
            return false;
        }
        const disk = this.pegs[fromPeg].pop();
        this.pegs[toPeg].push(disk);
        this.moves++;
        this.updateMoveCounter();
        this.selectedPeg = null;
        this.selectedDiskSize = null;
        this.render();
        this.checkWin();
        return true;
    }

    // 胜利检测
    checkWin() {
        if (this.pegs[2].length === this.disksCount && !this.winFlag) {
            this.winFlag = true;
            this.showVictoryUI();
            this.render();
        }
    }

    showVictoryUI() {
        this.showWarning("🎉 胜利！太棒了！ 🎉", false, 2000);
        const container = document.querySelector('.pegs-container');
        container.classList.add('victory-glow');
        setTimeout(() => container.classList.remove('victory-glow'), 1800);
    }

    showWarning(msg, isError = true, duration = 1200) {
        const warnDiv = document.getElementById('warningMsg');
        warnDiv.innerText = msg;
        if (isError) {
            warnDiv.style.background = "#b6452e";
            const container = document.querySelector('.pegs-container');
            container.classList.add('warning-shake');
            setTimeout(() => container.classList.remove('warning-shake'), 400);
        } else {
            warnDiv.style.background = "#2c6e2c";
        }
        setTimeout(() => {
            if (document.getElementById('warningMsg') && !this.isAutoSolving && !this.winFlag) {
                document.getElementById('warningMsg').innerText = "✨ 点击圆盘 → 点击柱子 ✨";
                warnDiv.style.background = "#a13e2d";
            }
        }, duration);
    }

    updateMoveCounter() {
        document.getElementById('moveCount').innerText = this.moves;
    }

    // 递归生成求解步骤
    generateSolveSteps(n, from, to, aux, stepsArray) {
        if (n === 1) {
            stepsArray.push({ from, to });
            return;
        }
        this.generateSolveSteps(n - 1, from, aux, to, stepsArray);
        stepsArray.push({ from, to });
        this.generateSolveSteps(n - 1, aux, to, from, stepsArray);
    }

    // 开始自动求解
    startAutoSolve() {
        if (this.isAutoSolving) return;
        if (this.winFlag) {
            this.showWarning("游戏已胜利，按重置后再试", true);
            return;
        }
        this.isAutoSolving = true;
        this.solveSteps = [];
        this.generateSolveSteps(this.disksCount, 0, 2, 1, this.solveSteps);
        
        document.getElementById('autoSolveBtn').disabled = true;
        document.getElementById('resetBtn').disabled = true;
        document.getElementById('diskCountInput').disabled = true;
        
        this.selectedPeg = null;
        this.selectedDiskSize = null;
        this.render();
        this.runStepByStep(0);
    }

    runStepByStep(stepIndex) {
        if (!this.isAutoSolving) return;
        if (stepIndex >= this.solveSteps.length) {
            this.finishAutoSolve();
            return;
        }
        const step = this.solveSteps[stepIndex];
        if (this.isValidMove(step.from, step.to)) {
            const diskVal = this.pegs[step.from][this.pegs[step.from].length - 1];
            this.executeMove(step.from, step.to);
            this.render();
            this