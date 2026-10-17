/**
 * Tetris Game - Level 1
 */

(function () {

    // Canvas & DOM

    const boardCanvas = document.getElementById('board');
    const boardCtx    = boardCanvas.getContext('2d');
    const nextCanvas  = document.getElementById('next');
    const nextCtx     = nextCanvas.getContext('2d');

    const scoreElem       = document.getElementById('score');
    const linesElem       = document.getElementById('lines');
    const levelElem       = document.getElementById('level');
    const startBtn        = document.getElementById('start');
    const soundBtn        = document.getElementById('btn-sound');
    const boardMsg        = document.getElementById('board-message');
    const currPtsElem     = document.getElementById('curr-pts');
    const targetPtsElem   = document.getElementById('target-pts');
    const progressBarFill = document.getElementById('progress-bar-fill');

    const victoryModal    = document.getElementById('victory-modal');
    const modalScoreElem  = document.getElementById('modal-score');
    const modalLinesElem  = document.getElementById('modal-lines');
    const btnContinue     = document.getElementById('btn-continue');
    const btnNextLevel    = document.getElementById('btn-next-level');

    const gameoverModal   = document.getElementById('gameover-modal');
    const goScoreElem     = document.getElementById('go-score');
    const goLinesElem     = document.getElementById('go-lines');
    const btnRestart      = document.getElementById('btn-restart');

    // Hằng số

    const COLS           = 10;
    const ROWS           = 20;
    const BLOCK_SIZE     = 30;   // 300px / 10 cột
    const NEXT_BLOCK_SIZE = 24;

    // Màu sắc 7 loại khối (index 1-7)
    const COLORS = [
        null,
        { main: '#00F0FF', light: '#BCFEFE', dark: '#0099AA' }, // I
        { main: '#1E88E5', light: '#90CAF9', dark: '#0D47A1' }, // J
        { main: '#FFA726', light: '#FFE082', dark: '#E65100' }, // L
        { main: '#FFD54F', light: '#FFF9C4', dark: '#F57F17' }, // O
        { main: '#26A69A', light: '#80CBC4', dark: '#004D40' }, // S
        { main: '#AB47BC', light: '#CE93D8', dark: '#4A148C' }, // T
        { main: '#FF5252', light: '#FFCDD2', dark: '#B71C1C' }, // Z
    ];

    // Hình dạng 7 loại khối Tetromino
    const SHAPES = [
        null,
        // I
        [[0,0,0,0],
            [1,1,1,1],
            [0,0,0,0],
            [0,0,0,0]],
        // J
        [[2,0,0],
            [2,2,2],
            [0,0,0]],
        // L
        [[0,0,3],
            [3,3,3],
            [0,0,0]],
        // O
        [[4,4],
            [4,4]],
        // S
        [[0,5,5],
            [5,5,0],
            [0,0,0]],
        // T
        [[0,6,0],
            [6,6,6],
            [0,0,0]],
        // Z
        [[7,7,0],
            [0,7,7],
            [0,0,0]],
    ];

    // Âm thanh

    let audioCtx     = null;
    let soundEnabled = true;

    function initAudio() {
        if (!audioCtx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (AC) audioCtx = new AC();
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    function playTone(freq, duration, type = 'sine', vol = 0.15) {
        if (!soundEnabled || !audioCtx) return;
        try {
            const osc  = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            gain.gain.setValueAtTime(vol, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch (e) {}
    }

    function soundMove()    { playTone(180, 0.04, 'triangle', 0.08); }
    function soundDrop()    { playTone(90,  0.09, 'sine',     0.20); }

    function soundRotate() {
        if (!soundEnabled || !audioCtx) return;
        try {
            const osc  = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(320, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(520, audioCtx.currentTime + 0.07);
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.07);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.07);
        } catch (e) {}
    }

    function soundClear(count) {
        if (!soundEnabled || !audioCtx) return;
        const notes = count >= 4 ? [440, 554, 659, 880] : [523, 659, 784];
        notes.forEach((f, i) => setTimeout(() => playTone(f, 0.18, 'triangle', 0.2), i * 70));
    }

    function soundVictory() {
        if (!soundEnabled || !audioCtx) return;
        [{ f: 523.25 }, { f: 659.25 }, { f: 783.99 }, { f: 1046.50 }]
            .forEach((n, i) => setTimeout(() => playTone(n.f, 0.18, 'triangle', 0.25), i * 130));
    }

    function soundGameOver() {
        if (!soundEnabled || !audioCtx) return;
        [440, 392, 349, 293].forEach((f, i) =>
            setTimeout(() => playTone(f, 0.25, 'sawtooth', 0.15), i * 150)
        );
    }

    // Trạng thái game

    let grid, score, lines, level, targetScore;
    let level1Completed;
    let currentPiece, nextPiece, bag;
    let isPlaying, isPaused, isGameOver;
    let dropCounter, lastTime, animFrameId, dropInterval;

    // Tốc độ rơi theo cấp độ (ms/bước)
    function getDropInterval(lvl) {
        if (lvl === 1) return 850;
        if (lvl === 2) return 500;
        if (lvl === 3) return 350;
        return Math.max(150, 250 - (lvl - 4) * 30);
    }

    // Helper - Lưới & Khối


    function createGrid() {
        return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    }

    // Bốc khối ngẫu nhiên theo thuật toán 7-Bag
    function getNextPieceType() {
        if (bag.length === 0) {
            bag = [1, 2, 3, 4, 5, 6, 7];
            for (let i = bag.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [bag[i], bag[j]] = [bag[j], bag[i]];
            }
        }
        return bag.pop();
    }

    function createPiece(type) {
        const shape = SHAPES[type].map(row => [...row]);
        return {
            type,
            shape,
            x: Math.floor((COLS - shape[0].length) / 2),
            y: 0
        };
    }

    // Kiểm tra va chạm
    function collide(piece, offsetX = 0, offsetY = 0, testShape = null) {
        const shape = testShape || piece.shape;
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (!shape[r][c]) continue;
                const nx = piece.x + c + offsetX;
                const ny = piece.y + r + offsetY;
                if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
                if (ny >= 0 && grid[ny][nx] !== 0)      return true;
            }
        }
        return false;
    }

    // Điều khiển khối

    function moveLeft() {
        if (!canControl()) return;
        if (!collide(currentPiece, -1, 0)) {
            currentPiece.x--;
            soundMove();
            draw();
        }
    }

    function moveRight() {
        if (!canControl()) return;
        if (!collide(currentPiece, 1, 0)) {
            currentPiece.x++;
            soundMove();
            draw();
        }
    }

    function rotatePiece() {
        if (!canControl()) return;
        if (currentPiece.type === 4) return; // O không xoay

        const rotated = rotateMatrix(currentPiece.shape);
        const kicks   = [[0,0], [-1,0], [1,0], [-2,0], [2,0], [0,-1]];

        for (const [ox, oy] of kicks) {
            if (!collide(currentPiece, ox, oy, rotated)) {
                currentPiece.shape  = rotated;
                currentPiece.x     += ox;
                currentPiece.y     += oy;
                soundRotate();
                draw();
                return;
            }
        }
    }

    function rotateMatrix(m) {
        const N      = m.length;
        const result = Array.from({ length: N }, () => Array(N).fill(0));
        for (let r = 0; r < N; r++)
            for (let c = 0; c < N; c++)
                result[c][N - 1 - r] = m[r][c];
        return result;
    }

    function drop() {
        if (!canControl()) return;
        if (!collide(currentPiece, 0, 1)) {
            currentPiece.y++;
            dropCounter = 0;
            draw();
        } else {
            lockPiece();
        }
    }

    function softDrop() {
        if (!canControl()) return;
        if (!collide(currentPiece, 0, 1)) {
            currentPiece.y++;
            addScore(1);
            soundMove();
            dropCounter = 0;
            draw();
        } else {
            lockPiece();
        }
    }

    function hardDrop() {
        if (!canControl()) return;
        let fallen = 0;
        while (!collide(currentPiece, 0, 1)) {
            currentPiece.y++;
            fallen++;
        }
        addScore(fallen * 2);
        soundDrop();
        lockPiece();
    }

    function canControl() {
        return isPlaying && !isPaused && !isGameOver && currentPiece;
    }

    // Vị trí Y của ghost piece
    function getGhostY() {
        if (!currentPiece) return 0;
        let gy = currentPiece.y;
        while (!collide(currentPiece, 0, gy - currentPiece.y + 1)) gy++;
        return gy;
    }

    // Khóa khối & xóa hàng

    function lockPiece() {
        soundDrop();
        for (let r = 0; r < currentPiece.shape.length; r++) {
            for (let c = 0; c < currentPiece.shape[r].length; c++) {
                if (!currentPiece.shape[r][c]) continue;
                const by = currentPiece.y + r;
                const bx = currentPiece.x + c;
                if (by < 0) { triggerGameOver(); return; }
                grid[by][bx] = currentPiece.shape[r][c];
            }
        }
        clearLines();
        spawnNextPiece();
    }

    function clearLines() {
        let count = 0;
        for (let r = ROWS - 1; r >= 0; r--) {
            if (grid[r].every(v => v !== 0)) {
                grid.splice(r, 1);
                grid.unshift(Array(COLS).fill(0));
                count++;
                r++;
            }
        }
        if (count === 0) return;

        lines += count;
        // Điểm chuẩn Tetris: 1=100, 2=300, 3=500, 4=800 (x level)
        const pts = [0, 100, 300, 500, 800];
        addScore((pts[count] || count * 200) * level);
        soundClear(count);
        updateUI();
    }

    // Điểm số & UI

    function addScore(pts) {
        score += pts;
        updateUI();
        if (level === 1 && score >= 1000 && !level1Completed) {
            handleLevel1Victory();
        }
    }

    function updateUI() {
        scoreElem.textContent       = score.toLocaleString();
        linesElem.textContent       = lines;
        levelElem.textContent       = level;
        currPtsElem.textContent     = score.toLocaleString();
        targetPtsElem.textContent   = targetScore.toLocaleString();
        const pct                   = Math.min(100, Math.floor(score / targetScore * 100));
        progressBarFill.style.width = pct + '%';
    }

    // Victory / Game Over

    function handleLevel1Victory() {
        level1Completed = true;
        isPaused        = true;
        cancelAnimationFrame(animFrameId);

        soundVictory();
        launchConfetti();

        modalScoreElem.textContent = score.toLocaleString();
        modalLinesElem.textContent = lines;
        victoryModal.classList.remove('hidden');
    }

    function onContinueGame() {
        victoryModal.classList.add('hidden');
        clearConfetti();
        isPaused = false;
        lastTime = performance.now();
        animFrameId = requestAnimationFrame(gameLoop);
    }

    function onNextLevel() {
        victoryModal.classList.add('hidden');
        clearConfetti();

        level        = 2;
        targetScore  = 2500;
        dropInterval = getDropInterval(level);

        const label = document.querySelector('.progress-label span:first-child');
        if (label) label.textContent = 'Tiến trình Level ' + level;

        soundVictory();
        updateUI();

        isPaused    = false;
        lastTime    = performance.now();
        animFrameId = requestAnimationFrame(gameLoop);
    }

    function triggerGameOver() {
        isGameOver  = true;
        isPlaying   = false;
        cancelAnimationFrame(animFrameId);
        soundGameOver();

        goScoreElem.textContent = score.toLocaleString();
        goLinesElem.textContent = lines;
        gameoverModal.classList.remove('hidden');

        startBtn.textContent = '▶ Bắt đầu lại';
    }

    // Spawn khối

    function spawnNextPiece() {
        if (!nextPiece) nextPiece = createPiece(getNextPieceType());
        currentPiece = nextPiece;
        nextPiece    = createPiece(getNextPieceType());

        if (collide(currentPiece)) {
            triggerGameOver();
            return;
        }
        drawNextPiece();
    }

    // Vẽ (Rendering)

    function drawBlock(ctx, x, y, colorId, size, isGhost = false) {
        const color = COLORS[colorId];
        if (!color) return;

        const px = x * size;
        const py = y * size;

        if (isGhost) {
            ctx.save();
            ctx.strokeStyle = color.light;
            ctx.lineWidth   = 1.5;
            ctx.strokeRect(px + 1.5, py + 1.5, size - 3, size - 3);
            ctx.fillStyle   = 'rgba(188,254,254,0.06)';
            ctx.fillRect(px + 2, py + 2, size - 4, size - 4);
            ctx.restore();
            return;
        }

        ctx.save();

        // Nền khối
        ctx.fillStyle = color.main;
        ctx.fillRect(px + 1, py + 1, size - 2, size - 2);

        // Highlight trên-trái (giả 3D)
        ctx.fillStyle = color.light;
        ctx.beginPath();
        ctx.moveTo(px + 1,      py + 1);
        ctx.lineTo(px + size-1, py + 1);
        ctx.lineTo(px + size-4, py + 4);
        ctx.lineTo(px + 4,      py + 4);
        ctx.lineTo(px + 4,      py + size-4);
        ctx.lineTo(px + 1,      py + size-1);
        ctx.closePath();
        ctx.fill();

        // Bóng dưới-phải
        ctx.fillStyle = color.dark;
        ctx.beginPath();
        ctx.moveTo(px + size-1, py + 1);
        ctx.lineTo(px + size-1, py + size-1);
        ctx.lineTo(px + 1,      py + size-1);
        ctx.lineTo(px + 4,      py + size-4);
        ctx.lineTo(px + size-4, py + size-4);
        ctx.lineTo(px + size-4, py + 4);
        ctx.closePath();
        ctx.fill();

        // Ánh sáng trung tâm
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        ctx.fillRect(px + 6, py + 6, size - 12, size - 12);

        ctx.restore();
    }

    function drawGridLines() {
        boardCtx.strokeStyle = 'rgba(12,87,118,0.3)';
        boardCtx.lineWidth   = 0.5;
        for (let c = 0; c <= COLS; c++) {
            boardCtx.beginPath();
            boardCtx.moveTo(c * BLOCK_SIZE, 0);
            boardCtx.lineTo(c * BLOCK_SIZE, ROWS * BLOCK_SIZE);
            boardCtx.stroke();
        }
        for (let r = 0; r <= ROWS; r++) {
            boardCtx.beginPath();
            boardCtx.moveTo(0,              r * BLOCK_SIZE);
            boardCtx.lineTo(COLS * BLOCK_SIZE, r * BLOCK_SIZE);
            boardCtx.stroke();
        }
    }

    function draw() {
        boardCtx.clearRect(0, 0, boardCanvas.width, boardCanvas.height);
        drawGridLines();

        // Vẽ các ô đã khóa
        for (let r = 0; r < ROWS; r++)
            for (let c = 0; c < COLS; c++)
                if (grid[r][c]) drawBlock(boardCtx, c, r, grid[r][c], BLOCK_SIZE);

        // Vẽ ghost & khối đang rơi
        if (currentPiece && isPlaying && !isGameOver) {
            const ghostY = getGhostY();
            const shape  = currentPiece.shape;

            if (ghostY !== currentPiece.y) {
                for (let r = 0; r < shape.length; r++)
                    for (let c = 0; c < shape[r].length; c++)
                        if (shape[r][c])
                            drawBlock(boardCtx, currentPiece.x + c, ghostY + r, shape[r][c], BLOCK_SIZE, true);
            }

            for (let r = 0; r < shape.length; r++)
                for (let c = 0; c < shape[r].length; c++)
                    if (shape[r][c])
                        drawBlock(boardCtx, currentPiece.x + c, currentPiece.y + r, shape[r][c], BLOCK_SIZE);
        }
    }

    function drawNextPiece() {
        nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
        if (!nextPiece) return;

        const shape  = nextPiece.shape;
        const pieceW = shape[0].length * NEXT_BLOCK_SIZE;
        const pieceH = shape.length    * NEXT_BLOCK_SIZE;
        const startX = Math.floor((nextCanvas.width  - pieceW) / (2 * NEXT_BLOCK_SIZE));
        const startY = Math.floor((nextCanvas.height - pieceH) / (2 * NEXT_BLOCK_SIZE));

        for (let r = 0; r < shape.length; r++)
            for (let c = 0; c < shape[r].length; c++)
                if (shape[r][c])
                    drawBlock(nextCtx, startX + c, startY + r, shape[r][c], NEXT_BLOCK_SIZE);
    }

    // Game Loop

    function gameLoop(time = 0) {
        if (!isPlaying || isPaused || isGameOver) return;

        const dt = time - lastTime;
        lastTime = time;

        dropCounter += dt;
        if (dropCounter > dropInterval) {
            drop();
            dropCounter = 0;
        }

        draw();
        animFrameId = requestAnimationFrame(gameLoop);
    }

    // Start / Pause / Reset

    function startGame() {
        initAudio();

        grid            = createGrid();
        score           = 0;
        lines           = 0;
        level           = 1;
        targetScore     = 1000;
        level1Completed = false;
        dropInterval    = getDropInterval(1);
        bag             = [];
        nextPiece       = null;
        currentPiece    = null;
        isPlaying       = true;
        isPaused        = false;
        isGameOver      = false;
        dropCounter     = 0;

        victoryModal.classList.add('hidden');
        gameoverModal.classList.add('hidden');
        boardMsg.classList.remove('visible');
        clearConfetti();

        const label = document.querySelector('.progress-label span:first-child');
        if (label) label.textContent = 'Tiến trình Level 1';

        updateUI();
        spawnNextPiece();
        spawnNextPiece(); // spawn 2 lần: một cho currentPiece, một cho nextPiece

        startBtn.textContent = '⏸ Tạm dừng';
        lastTime    = performance.now();
        cancelAnimationFrame(animFrameId);
        animFrameId = requestAnimationFrame(gameLoop);
    }

    function togglePause() {
        if (!isPlaying || isGameOver) return;
        isPaused = !isPaused;
        if (isPaused) {
            boardMsg.classList.add('visible');
            startBtn.textContent = '▶ Tiếp tục';
            cancelAnimationFrame(animFrameId);
        } else {
            boardMsg.classList.remove('visible');
            startBtn.textContent = '⏸ Tạm dừng';
            lastTime    = performance.now();
            animFrameId = requestAnimationFrame(gameLoop);
        }
    }

    // Confetti

    function launchConfetti() {
        clearConfetti();
        const colors = ['#00F0FF','#BCFEFE','#2D99AE','#F8DAD0','#FFD700','#FF5252','#AB47BC'];
        for (let i = 0; i < 60; i++) {
            const el = document.createElement('div');
            el.className                 = 'confetti-piece';
            el.style.left                = Math.random() * 100 + 'vw';
            el.style.backgroundColor     = colors[Math.floor(Math.random() * colors.length)];
            el.style.animationDelay      = Math.random() * 0.8 + 's';
            el.style.animationDuration   = (1.8 + Math.random() * 1.5) + 's';
            document.body.appendChild(el);
        }
    }

    function clearConfetti() {
        document.querySelectorAll('.confetti-piece').forEach(el => el.remove());
    }

    // Event Listeners

    startBtn.addEventListener('click', () => {
        if (!isPlaying || isGameOver) startGame();
        else togglePause();
    });

    soundBtn.addEventListener('click', () => {
        initAudio();
        soundEnabled         = !soundEnabled;
        soundBtn.textContent = soundEnabled ? '🔊' : '🔇';
    });

    btnContinue.addEventListener('click',  onContinueGame);
    btnNextLevel.addEventListener('click', onNextLevel);
    btnRestart.addEventListener('click',   startGame);

    // Bàn phím
    window.addEventListener('keydown', (e) => {
        initAudio();

        if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) {
            e.preventDefault();
        }

        if (e.key === 'p' || e.key === 'P') { togglePause(); return; }
        if (e.key === 'm' || e.key === 'M') {
            soundEnabled         = !soundEnabled;
            soundBtn.textContent = soundEnabled ? '🔊' : '🔇';
            return;
        }

        if (!isPlaying || isPaused || isGameOver) return;

        switch (e.key) {
            case 'ArrowLeft':  case 'a': case 'A': moveLeft();    break;
            case 'ArrowRight': case 'd': case 'D': moveRight();   break;
            case 'ArrowUp':    case 'w': case 'W': rotatePiece(); break;
            case 'ArrowDown':  case 's': case 'S': softDrop();    break;
            case ' ':                               hardDrop();    break;
        }
    });

    // Cảm ứng (mobile)
    let touchX = 0, touchY = 0;
    boardCanvas.addEventListener('touchstart', (e) => {
        initAudio();
        touchX = e.touches[0].clientX;
        touchY = e.touches[0].clientY;
    }, { passive: true });

    boardCanvas.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - touchX;
        const dy = e.changedTouches[0].clientY - touchY;

        if (Math.abs(dx) < 15 && Math.abs(dy) < 15) {
            rotatePiece();
        } else if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 25)  moveRight();
            if (dx < -25) moveLeft();
        } else {
            if (dy > 30) softDrop();
        }
    }, { passive: true });

    // Vẽ màn hình trống ban đầu
    draw();
    drawNextPiece();
    updateUI();

})();
