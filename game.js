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
        
        this.reset();
        this.bindEvents();
        this.loadHighScore();
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
        
        // 重置按钮状态
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.pauseBtn.textContent = '暂停';
        
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
    
    bindEvents() {
        // 键盘控制（电脑端）
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning || this.gamePaused) return;
            
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
        
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.resetBtn.addEventListener('click', () => this.reset());
        
        // 虚拟方向键事件
        document.getElementById('upBtn').addEventListener('click', () => this.handleVirtualControl('up'));
        document.getElementById('downBtn').addEventListener('click', () => this.handleVirtualControl('down'));
        document.getElementById('leftBtn').addEventListener('click', () => this.handleVirtualControl('left'));
        document.getElementById('rightBtn').addEventListener('click', () => this.handleVirtualControl('right'));
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
            this.ctx.fillText('按开始游戏按钮开始', this.canvas.width / 2, this.canvas.height / 2);
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
        // 如果用户已登录，优先从用户档案加载最高分
        if (typeof authManager !== 'undefined' && authManager && authManager.getCurrentUser()) {
            const userHighScore = authManager.userHighScore;
            if (userHighScore !== undefined && userHighScore !== null) {
                this.highScore = userHighScore;
                return;
            }
        }
        
        // 否则从本地存储加载
        const savedHighScore = localStorage.getItem('snakeHighScore');
        if (savedHighScore) {
            this.highScore = parseInt(savedHighScore);
        }
    }
    
    handleVirtualControl(direction) {
        if (!this.gameRunning || this.gamePaused) return;
        
        switch(direction) {
            case 'up':
                if (this.dy !== 1) {
                    this.dx = 0;
                    this.dy = -1;
                }
                break;
            case 'down':
                if (this.dy !== -1) {
                    this.dx = 0;
                    this.dy = 1;
                }
                break;
            case 'left':
                if (this.dx !== 1) {
                    this.dx = -1;
                    this.dy = 0;
                }
                break;
            case 'right':
                if (this.dx !== -1) {
                    this.dx = 1;
                    this.dy = 0;
                }
                break;
        }
    }
    
    gameOver() {
        this.gameRunning = false;
        
        // 更新最高分
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
            
            // 如果用户已登录，更新数据库中的最高分
            if (typeof authManager !== 'undefined' && authManager && authManager.getCurrentUser()) {
                authManager.updateHighScore(this.highScore);
            }
        }
        
        // 如果用户已登录，累计游戏得分到总积分（1分=1积分）
        if (typeof authManager !== 'undefined' && authManager && authManager.getCurrentUser()) {
            this.addPointsToUser(this.score);
        }
        
        // 重置按钮状态
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.pauseBtn.textContent = '暂停';
        
        // 显示游戏结束信息
        this.showGameOverMessage();
    }
    
    // 将游戏得分累计到用户总积分
    async addPointsToUser(gameScore) {
        if (!authManager || !authManager.getCurrentUser()) {
            return;
        }
        
        // 显示积分奖励动画
        if (gameScore > 0) {
            this.showPointsReward(gameScore);
        }

        try {
            // 获取当前用户积分
            const currentPoints = authManager.getCurrentPoints();
            // 累计新积分（1游戏分数 = 1积分）
            const newTotalPoints = currentPoints + gameScore;
            
            // 更新用户积分（这个方法内部会自动更新界面显示）
            await authManager.updateUserPoints(newTotalPoints);
            
            console.log(`游戏结束，获得 ${gameScore} 积分，总积分: ${newTotalPoints}`);
        } catch (error) {
            console.error('累计积分失败:', error);
        }
    }
    
    // 显示积分奖励动画
    showPointsReward(points) {
        const rewardElement = document.createElement('div');
        rewardElement.className = 'points-reward';
        rewardElement.textContent = `+${points} 积分！`;
        document.body.appendChild(rewardElement);
        
        // 2秒后移除元素
        setTimeout(() => {
            if (rewardElement.parentNode) {
                rewardElement.parentNode.removeChild(rewardElement);
            }
        }, 2000);
    }
    
    // 显示游戏结束信息
    showGameOverMessage() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('游戏结束!', this.canvas.width / 2, this.canvas.height / 2 - 40);
        
        this.ctx.font = '18px Arial';
        this.ctx.fillText(`本局得分: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 - 10);
        this.ctx.fillText(`最高分: ${this.highScore}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
        
        if (typeof authManager !== 'undefined' && authManager && authManager.getCurrentUser()) {
            this.ctx.fillText(`获得积分: +${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 50);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});