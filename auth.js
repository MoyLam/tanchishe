// 认证界面交互逻辑
class AuthUI {
    constructor() {
        this.loginForm = null;
        this.registerForm = null;
        this.authMessage = null;
        
        this.init();
    }

    init() {
        // 等待DOM加载完成后再初始化
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.bindEvents());
        } else {
            this.bindEvents();
        }
    }

    bindEvents() {
        this.loginForm = document.getElementById('login-form');
        this.registerForm = document.getElementById('register-form');
        this.authMessage = document.getElementById('auth-message');

        // 表单切换
        const showRegisterBtn = document.getElementById('show-register');
        const showLoginBtn = document.getElementById('show-login');
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        const logoutBtn = document.getElementById('logout-btn');
        const loginUsername = document.getElementById('login-username');
        const loginPassword = document.getElementById('login-password');
        const registerPasswordConfirm = document.getElementById('register-password-confirm');

        if (showRegisterBtn) {
            showRegisterBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showRegisterForm();
            });
        }

        if (showLoginBtn) {
            showLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginForm();
            });
        }

        // 登录按钮
        if (loginBtn) {
            loginBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.handleLogin();
            });
        }

        // 注册按钮
        if (registerBtn) {
            registerBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.handleRegister();
            });
        }

        // 退出按钮
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.handleLogout();
            });
        }

        // 回车键提交
        if (loginUsername) {
            loginUsername.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleLogin();
            });
        }
        
        if (loginPassword) {
            loginPassword.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleLogin();
            });
        }

        if (registerPasswordConfirm) {
            registerPasswordConfirm.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleRegister();
            });
        }
    }

    showLoginForm() {
        this.loginForm.style.display = 'block';
        this.registerForm.style.display = 'none';
        this.clearMessage();
        this.clearForms();
    }

    showRegisterForm() {
        this.loginForm.style.display = 'none';
        this.registerForm.style.display = 'block';
        this.clearMessage();
        this.clearForms();
    }

    clearForms() {
        // 清空所有输入框
        document.getElementById('login-username').value = '';
        document.getElementById('login-password').value = '';
        document.getElementById('register-username').value = '';
        document.getElementById('register-password').value = '';
        document.getElementById('register-password-confirm').value = '';
    }

    showMessage(message, type = 'info') {
        this.authMessage.textContent = message;
        this.authMessage.className = `auth-message ${type}`;
        this.authMessage.style.display = 'block';
        
        // 3秒后自动隐藏消息
        setTimeout(() => {
            this.clearMessage();
        }, 3000);
    }

    clearMessage() {
        this.authMessage.style.display = 'none';
        this.authMessage.textContent = '';
        this.authMessage.className = 'auth-message';
    }

    async handleLogin() {
        const usernameOrEmail = document.getElementById('login-username')?.value?.trim();
        const password = document.getElementById('login-password')?.value;

        // 表单验证
        if (!usernameOrEmail || !password) {
            this.showMessage('请填写用户名/邮箱和密码', 'error');
            return;
        }

        if (usernameOrEmail.length < 3) {
            this.showMessage('用户名/邮箱至少需要3个字符', 'error');
            return;
        }

        // 显示加载状态
        const loginBtn = document.getElementById('login-btn');
        const originalText = loginBtn?.textContent;
        if (loginBtn) {
            loginBtn.textContent = '登录中...';
            loginBtn.disabled = true;
        }

        try {
            // 检查authManager是否存在
            if (!authManager) {
                this.showMessage('系统初始化中，请稍后再试', 'error');
                return;
            }

            const result = await authManager.login(usernameOrEmail, password);
            
            if (result.success) {
                this.showMessage(result.message, 'success');
                this.clearForms();
            } else {
                this.showMessage(result.message, 'error');
            }
        } catch (error) {
            this.showMessage('登录失败，请稍后重试', 'error');
        } finally {
            if (loginBtn) {
                loginBtn.textContent = originalText;
                loginBtn.disabled = false;
            }
        }
    }

    async handleRegister() {
        const username = document.getElementById('register-username')?.value?.trim();
        const email = document.getElementById('register-email')?.value?.trim();
        const password = document.getElementById('register-password')?.value;
        const confirmPassword = document.getElementById('register-password-confirm')?.value;

        // 表单验证
        if (!username || !email || !password || !confirmPassword) {
            this.showMessage('请填写所有字段', 'error');
            return;
        }

        if (username.length < 3) {
            this.showMessage('用户名至少需要3个字符', 'error');
            return;
        }

        if (password.length < 6) {
            this.showMessage('密码至少需要6个字符', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showMessage('两次输入的密码不一致', 'error');
            return;
        }

        // 用户名格式验证（只允许字母、数字、下划线）
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!usernameRegex.test(username)) {
            this.showMessage('用户名只能包含字母、数字和下划线', 'error');
            return;
        }

        // 验证邮箱格式
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            this.showMessage('请输入有效的邮箱地址', 'error');
            return;
        }

        // 显示加载状态
        const registerBtn = document.getElementById('register-btn');
        const originalText = registerBtn?.textContent;
        if (registerBtn) {
            registerBtn.textContent = '注册中...';
            registerBtn.disabled = true;
        }

        try {
            // 检查authManager是否存在
            if (!authManager) {
                this.showMessage('系统初始化中，请稍后再试', 'error');
                return;
            }

            const result = await authManager.register(email, password, username);
            
            if (result.success) {
                this.showMessage(result.message, 'success');
                this.clearForms();
                // 注册成功后直接显示游戏界面（authManager 已经处理）
                // 不需要再切换到登录界面
            } else {
                // 显示详细的错误信息
                const errorMsg = result.error || result.message || '注册失败，请稍后重试';
                console.error('注册失败:', errorMsg);
                this.showMessage(errorMsg, 'error');
            }
        } catch (error) {
            this.showMessage('注册失败，请稍后重试', 'error');
        } finally {
            if (registerBtn) {
                registerBtn.textContent = originalText;
                registerBtn.disabled = false;
            }
        }
    }

    async handleLogout() {
        const logoutBtn = document.getElementById('logout-btn');
        const originalText = logoutBtn?.textContent;
        if (logoutBtn) {
            logoutBtn.textContent = '退出中...';
            logoutBtn.disabled = true;
        }

        try {
            // 检查authManager是否存在
            if (!authManager) {
                this.showMessage('系统初始化中，请稍后再试', 'error');
                return;
            }

            const result = await authManager.logout();
            
            if (result.success) {
                this.showMessage(result.message, 'success');
            } else {
                this.showMessage(result.message, 'error');
            }
        } catch (error) {
            this.showMessage('退出失败，请稍后重试', 'error');
        } finally {
            if (logoutBtn) {
                logoutBtn.textContent = originalText;
                logoutBtn.disabled = false;
            }
        }
    }
}

// 游戏积分管理类
class GamePointsManager {
    constructor() {
        this.pointsPerFood = 10;
        this.bonusMultiplier = 1.5;
    }

    // 计算游戏积分
    calculatePoints(score, gameTime) {
        let points = score * this.pointsPerFood;
        
        // 时间奖励：游戏时间越长，奖励越多
        if (gameTime > 60) { // 超过1分钟
            points = Math.floor(points * this.bonusMultiplier);
        }
        
        return points;
    }

    // 更新用户积分
    async updateUserPoints(gameScore, gameTime) {
        // 检查authManager是否存在
        if (!authManager) {
            console.warn('authManager未初始化，无法更新积分');
            return;
        }

        const earnedPoints = this.calculatePoints(gameScore, gameTime);
        const currentPoints = authManager.getCurrentPoints();
        const newPoints = currentPoints + earnedPoints;
        
        await authManager.updateUserPoints(newPoints);
        
        // 显示积分奖励动画
        this.showPointsReward(earnedPoints);
        
        return earnedPoints;
    }

    // 显示积分奖励动画
    showPointsReward(points) {
        const rewardElement = document.createElement('div');
        rewardElement.className = 'points-reward';
        rewardElement.textContent = `+${points} 积分!`;
        
        document.body.appendChild(rewardElement);
        
        // 动画结束后移除元素
        setTimeout(() => {
            if (rewardElement.parentNode) {
                rewardElement.parentNode.removeChild(rewardElement);
            }
        }, 3000);
    }
}

// 创建全局实例
let authUI = null;
let gamePointsManager = null;

// 初始化认证UI
function initializeAuthUI() {
    if (!authUI) {
        authUI = new AuthUI();
    }
    if (!gamePointsManager) {
        gamePointsManager = new GamePointsManager();
    }
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAuthUI);
} else {
    initializeAuthUI();
}