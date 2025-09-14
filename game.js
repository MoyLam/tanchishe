class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('high-score');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        // 设备检测和触摸控制相关属性
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.minSwipeDistance = 30; // 最小滑动距离
        
        this.reset();
        this.bindEvents();
        this.loadHighScore();
        
        // 根据设备类型显示不同的提示
        this.updateInstructions();
    }
    
    reset() {
        this.snake = [
            {x: 10, y: 10}
        ];
        this.dx = 0;
        this.dy = 0;
        this.food = this.generateFood();
        this.score = 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.updateScore();
        this.draw();
    }
    
    generateFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        
        return newFood;
    }
    
    updateInstructions() {
        const instructionsElement = document.querySelector('.instructions p:first-child');
        if (instructionsElement) {
            if (this.isMobile) {
                instructionsElement.textContent = '在屏幕上滑动手指控制蛇的移动方向';
            } else {
                instructionsElement.textContent = '使用方向键或WASD控制蛇的移动';
            }
        }
    }
    
    bindEvents() {
        // 键盘控制（电脑端）
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning || this.gamePaused || this.isMobile) return;
            
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    if (this.dy !== 1) {
                        this.dx = 0;
                        this.dy = -1;
                    }
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    if (this.dy !== -1) {
                        this.dx = 0;
                        this.dy = 1;
                    }
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    if (this.dx !== 1) {
                        this.dx = -1;
                        this.dy = 0;
                    }
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    if (this.dx !== -1) {
                        this.dx = 1;
                        this.dy = 0;
                    }
                    break;
            }
        });
        
        // 触摸控制（移动端）
        if (this.isMobile) {
            this.canvas.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const touch = e.touches[0];
                this.touchStartX = touch.clientX;
                this.touchStartY = touch.clientY;
            }, { passive: false });
            
            this.canvas.addEventListener('touchmove', (e) => {
                e.preventDefault();
            }, { passive: false });
            
            this.canvas.addEventListener('touchend', (e) => {
                e.preventDefault();
                if (!this.gameRunning || this.gamePaused) return;
                
                const touch = e.changedTouches[0];
                const touchEndX = touch.clientX;
                const touchEndY = touch.clientY;
                
                const deltaX = touchEndX - this.touchStartX;
                const deltaY = touchEndY - this.touchStartY;
                
                // 计算滑动距离
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                if (distance < this.minSwipeDistance) return;
                
                // 确定滑动方向
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    // 水平滑动
                    if (deltaX > 0 && this.dx !== -1) {
                        // 向右滑动
                        this.dx = 1;
                        this.dy = 0;
                    } else if (deltaX < 0 && this.dx !== 1) {
                        // 向左滑动
                        this.dx = -1;
                        this.dy = 0;
                    }
                } else {
                    // 垂直滑动
                    if (deltaY > 0 && this.dy !== -1) {
                        // 向下滑动
                        this.dx = 0;
                        this.dy = 1;
                    } else if (deltaY < 0 && this.dy !== 1) {
                        // 向上滑动
                        this.dx = 0;
                        this.dy = -1;
                    }
                }
            }, { passive: false });
        }
        
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.resetBtn.addEventListener('click', () => this.reset());
    }
    
    start() {
        if (this.gameRunning) return;
        
        // 游戏结束后可以直接点击开始游戏重新开始
        // 重置游戏状态，但保留最高分
        this.reset();
        
        this.gameRunning = true;
        this.gamePaused = false;
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        
        this.gameLoop();
    }
    
    togglePause() {
        if (!this.gameRunning) return;
        
        this.gamePaused = !this.gamePaused;
        this.pauseBtn.textContent = this.gamePaused ? '继续' : '暂停';
        
        if (!this.gamePaused) {
            this.gameLoop();
        }
    }
    
    gameLoop() {
        if (!this.gameRunning || this.gamePaused) return;
        
        this.update();
        this.draw();
        
        if (this.gameRunning) {
            setTimeout(() => this.gameLoop(), 150);
        }
    }
    
    update() {
        const head = {x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy};
        
        if (this.dx === 0 && this.dy === 0) return;
        
        if (head.x < 0 || head.x >= this.tileCount || 
            head.y < 0 || head.y >= this.tileCount ||
            this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }
        
        this.snake.unshift(head);
        
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScore();
            this.food = this.generateFood();
        } else {
            this.snake.pop();
        }
    }
    
    draw() {
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#27ae60';
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                this.ctx.fillStyle = '#2ecc71';
            } else {
                this.ctx.fillStyle = '#27ae60';
            }
            this.ctx.fillRect(
                segment.x * this.gridSize, 
                segment.y * this.gridSize, 
                this.gridSize - 2, 
                this.gridSize - 2
            );
        });
        
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            this.gridSize / 2 - 2,
            0,
            2 * Math.PI
        );
        this.ctx.fill();
        
        if (!this.gameRunning && !this.gamePaused) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'center';
            const instructionText = this.isMobile ? '点击开始游戏按钮开始' : '按开始游戏按钮开始';
            this.ctx.fillText(instructionText, this.canvas.width / 2, this.canvas.height / 2);
        }
    }
    
    updateScore() {
        this.scoreElement.textContent = this.score;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.highScoreElement.textContent = this.highScore;
            this.saveHighScore();
        }
    }
    
    saveHighScore() {
        localStorage.setItem('snakeHighScore', this.highScore);
    }
    
    loadHighScore() {
        this.highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
        this.highScoreElement.textContent = this.highScore;
    }
    
    gameOver() {
        this.gameRunning = false;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.pauseBtn.textContent = '暂停';
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.font = 'bold 30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('游戏结束!', this.canvas.width / 2, this.canvas.height / 2 - 20);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`最终得分: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});