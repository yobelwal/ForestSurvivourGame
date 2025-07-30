// Game state
let gameState = {
    score: 0,
    lives: 3,
    gameRunning: true,
    lumberjack: { x: 9, y: 15, direction: 'right' },
    enemies: [
        { x: 9, y: 7, direction: 'up', type: 'wolf' },
        { x: 5, y: 9, direction: 'left', type: 'tiger' },
        { x: 13, y: 9, direction: 'right', type: 'snake' }
    ],
    totalTrees: 0,
    treesChopped: 0
};

// Game board layout (19x21 grid)
// 0 = wall, 1 = tree, 2 = empty space, 3 = lumberjack start, 4 = wolf start, 5 = tiger start, 6 = snake start
const maze = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,0],
    [0,1,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,1,0],
    [0,1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1,0],
    [0,0,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,0,0],
    [2,2,2,0,1,0,1,1,1,4,1,1,1,0,1,0,2,2,2],
    [0,0,0,0,1,0,1,0,2,2,2,0,1,0,1,0,0,0,0],
    [1,1,1,1,1,5,1,0,1,1,1,0,1,6,1,1,1,1,1],
    [0,0,0,0,1,0,1,0,2,2,2,0,1,0,1,0,0,0,0],
    [2,2,2,0,1,0,1,1,1,1,1,1,1,0,1,0,2,2,2],
    [0,0,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,0,0],
    [0,1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1,0],
    [0,1,0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,1,0],
    [0,1,1,1,1,1,1,1,1,3,1,1,1,1,1,1,1,1,0],
    [0,1,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,1,0],
    [0,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];

// Initialize game
function initGame() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    
    // Reset game state
    gameState.score = 0;
    gameState.lives = 3;
    gameState.gameRunning = true;
    gameState.treesChopped = 0;
    gameState.totalTrees = 0;
    
    // Find lumberjack and enemy starting positions
    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {
            if (maze[y][x] === 3) {
                gameState.lumberjack.x = x;
                gameState.lumberjack.y = y;
            } else if (maze[y][x] === 4) {
                gameState.enemies[0].x = x;
                gameState.enemies[0].y = y;
            } else if (maze[y][x] === 5) {
                gameState.enemies[1].x = x;
                gameState.enemies[1].y = y;
            } else if (maze[y][x] === 6) {
                gameState.enemies[2].x = x;
                gameState.enemies[2].y = y;
            }
        }
    }
    
    // Create game board
    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.id = `cell-${x}-${y}`;
            
            if (maze[y][x] === 0) {
                cell.classList.add('wall');
            } else if (maze[y][x] === 1) {
                cell.classList.add('tree');
                gameState.totalTrees++;
            } else {
                cell.classList.add('empty');
            }
            
            gameBoard.appendChild(cell);
        }
    }
    
    updateDisplay();
    renderGame();
}

// Render game elements
function renderGame() {
    // Clear previous positions
    document.querySelectorAll('.lumberjack, .wolf, .tiger, .snake').forEach(el => {
        el.classList.remove('lumberjack', 'wolf', 'tiger', 'snake', 'up', 'down', 'left', 'right');
    });
    
    // Render Lumberjack
    const lumberjackCell = document.getElementById(`cell-${gameState.lumberjack.x}-${gameState.lumberjack.y}`);
    if (lumberjackCell) {
        lumberjackCell.classList.add('lumberjack', gameState.lumberjack.direction);
    }
    
    // Render Enemies
    gameState.enemies.forEach(enemy => {
        const enemyCell = document.getElementById(`cell-${enemy.x}-${enemy.y}`);
        if (enemyCell) {
            enemyCell.classList.add(enemy.type);
        }
    });
}

// Update score and lives display
function updateDisplay() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('lives').textContent = gameState.lives;
}

// Check if position is valid (not a wall)
function isValidMove(x, y) {
    if (y < 0 || y >= maze.length || x < 0 || x >= maze[0].length) {
        return false;
    }
    return maze[y][x] !== 0;
}

// Move Lumberjack
function moveLumberjack(direction) {
    if (!gameState.gameRunning) return;
    
    let newX = gameState.lumberjack.x;
    let newY = gameState.lumberjack.y;
    
    switch (direction) {
        case 'up':
            newY--;
            break;
        case 'down':
            newY++;
            break;
        case 'left':
            newX--;
            break;
        case 'right':
            newX++;
            break;
    }
    
    // Handle tunnel effect (wrap around horizontally)
    if (newX < 0) newX = maze[0].length - 1;
    if (newX >= maze[0].length) newX = 0;
    
    if (isValidMove(newX, newY)) {
        gameState.lumberjack.x = newX;
        gameState.lumberjack.y = newY;
        gameState.lumberjack.direction = direction;
        
        // Check for tree collision
        checkTreeCollision();
        
        // Check for enemy collision
        checkEnemyCollision();
        
        renderGame();
    }
}

// Check if Lumberjack chops a tree
function checkTreeCollision() {
    const cell = document.getElementById(`cell-${gameState.lumberjack.x}-${gameState.lumberjack.y}`);
    if (cell && cell.classList.contains('tree')) {
        cell.classList.remove('tree');
        cell.classList.add('empty');
        gameState.score += 10;
        gameState.treesChopped++;
        
        // Add chopping animation
        cell.classList.add('chopping');
        setTimeout(() => cell.classList.remove('chopping'), 200);
        
        updateDisplay();
        
        // Check win condition
        if (gameState.treesChopped >= gameState.totalTrees) {
            winGame();
        }
    }
}

// Check collision with enemies
function checkEnemyCollision() {
    gameState.enemies.forEach(enemy => {
        if (gameState.lumberjack.x === enemy.x && gameState.lumberjack.y === enemy.y) {
            gameState.lives--;
            updateDisplay();
            
            if (gameState.lives <= 0) {
                gameOver();
            } else {
                // Reset positions
                resetPositions();
            }
        }
    });
}

// Reset Lumberjack and Enemies to starting positions
function resetPositions() {
    // Find starting positions
    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {
            if (maze[y][x] === 3) {
                gameState.lumberjack.x = x;
                gameState.lumberjack.y = y;
                gameState.lumberjack.direction = 'right';
            } else if (maze[y][x] === 4) {
                gameState.enemies[0].x = x;
                gameState.enemies[0].y = y;
                gameState.enemies[0].direction = 'up';
            } else if (maze[y][x] === 5) {
                gameState.enemies[1].x = x;
                gameState.enemies[1].y = y;
                gameState.enemies[1].direction = 'left';
            } else if (maze[y][x] === 6) {
                gameState.enemies[2].x = x;
                gameState.enemies[2].y = y;
                gameState.enemies[2].direction = 'right';
            }
        }
    }
    renderGame();
}

// Move Enemies AI
function moveEnemies() {
    if (!gameState.gameRunning) return;
    
    gameState.enemies.forEach(enemy => {
        const directions = ['up', 'down', 'left', 'right'];
        const possibleMoves = [];
        
        // Find all valid moves
        directions.forEach(dir => {
            let newX = enemy.x;
            let newY = enemy.y;
            
            switch (dir) {
                case 'up':
                    newY--;
                    break;
                case 'down':
                    newY++;
                    break;
                case 'left':
                    newX--;
                    break;
                case 'right':
                    newX++;
                    break;
            }
            
            // Handle tunnel effect
            if (newX < 0) newX = maze[0].length - 1;
            if (newX >= maze[0].length) newX = 0;
            
            if (isValidMove(newX, newY)) {
                // Calculate distance to Lumberjack
                const distance = Math.abs(newX - gameState.lumberjack.x) + Math.abs(newY - gameState.lumberjack.y);
                possibleMoves.push({ direction: dir, x: newX, y: newY, distance });
            }
        });
        
        if (possibleMoves.length > 0) {
            // Different AI behavior for different enemies
            let chosenMove;
            
            if (enemy.type === 'wolf') {
                // Wolf: aggressive, always tries to get closer
                possibleMoves.sort((a, b) => a.distance - b.distance);
                chosenMove = possibleMoves[0];
            } else if (enemy.type === 'tiger') {
                // Tiger: smart hunter, 80% chance to choose optimal move
                possibleMoves.sort((a, b) => a.distance - b.distance);
                chosenMove = Math.random() < 0.8 ? possibleMoves[0] : possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            } else if (enemy.type === 'snake') {
                // Snake: unpredictable, 50% random movement
                if (Math.random() < 0.5) {
                    possibleMoves.sort((a, b) => a.distance - b.distance);
                    chosenMove = possibleMoves[0];
                } else {
                    chosenMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                }
            }
            
            enemy.x = chosenMove.x;
            enemy.y = chosenMove.y;
            enemy.direction = chosenMove.direction;
        }
    });
    
    // Check for collision after enemies move
    checkEnemyCollision();
    
    renderGame();
}

// Game over
function gameOver() {
    gameState.gameRunning = false;
    document.getElementById('game-over-text').textContent = 'Game Over!';
    document.getElementById('game-over').style.display = 'block';
}

// Win game
function winGame() {
    gameState.gameRunning = false;
    document.getElementById('game-over-text').textContent = 'You Win!';
    document.getElementById('game-over').style.display = 'block';
}

// Restart game
function restartGame() {
    document.getElementById('game-over').style.display = 'none';
    initGame();
}

// Keyboard controls
document.addEventListener('keydown', (event) => {
    if (!gameState.gameRunning) return;
    
    switch (event.key) {
        case 'ArrowUp':
            event.preventDefault();
            moveLumberjack('up');
            break;
        case 'ArrowDown':
            event.preventDefault();
            moveLumberjack('down');
            break;
        case 'ArrowLeft':
            event.preventDefault();
            moveLumberjack('left');
            break;
        case 'ArrowRight':
            event.preventDefault();
            moveLumberjack('right');
            break;
    }
});

// Game loop for enemy movement
function gameLoop() {
    if (gameState.gameRunning) {
        moveEnemies();
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    
    // Start enemy movement loop
    setInterval(gameLoop, 300); // Enemies move every 300ms
});

// Make restartGame globally available
window.restartGame = restartGame;
