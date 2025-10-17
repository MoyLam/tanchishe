// 演示配置文件 - 用于快速测试功能
// 如果您想要完整的Supabase功能，请按照README.md中的说明配置supabase-config.js

// 演示模式的用户数据存储
class DemoStorage {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('demo_users') || '{}');
        this.currentUser = JSON.parse(localStorage.getItem('demo_current_user') || 'null');
    }

    saveUsers() {
        localStorage.setItem('demo_users', JSON.stringify(this.users));
    }

    saveCurrentUser() {
        localStorage.setItem('demo_current_user', JSON.stringify(this.currentUser));
    }

    register(username, password) {
        if (this.users[username]) {
            return { success: false, message: '用户名已存在' };
        }

        this.users[username] = {
            id: Date.now().toString(),
            username: username,
            password: password, // 注意：实际应用中不应明文存储密码
            points: 100,
            high_score: 0,
            created_at: new Date().toISOString()
        };

        this.saveUsers();
        return { success: true, message: '注册成功！已赠送100积分' };
    }

    login(username, password) {
        const user = this.users[username];
        if (!user || user.password !== password) {
            return { success: false, message: '用户名或密码错误' };
        }

        this.currentUser = {
            id: user.id,
            username: user.username,
            points: user.points,
            high_score: user.high_score
        };

        this.saveCurrentUser();
        return { success: true, message: '登录成功！' };
    }

    logout() {
        this.currentUser = null;
        this.saveCurrentUser();
        return { success: true, message: '已退出登录' };
    }

    updatePoints(newPoints) {
        if (!this.currentUser) return;

        this.currentUser.points = newPoints;
        this.users[this.currentUser.username].points = newPoints;
        this.saveUsers();
        this.saveCurrentUser();
    }

    updateHighScore(score) {
        if (!this.currentUser) return;

        this.currentUser.high_score = score;
        this.users[this.currentUser.username].high_score = score;
        this.saveUsers();
        this.saveCurrentUser();
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getCurrentPoints() {
        return this.currentUser ? this.currentUser.points : 0;
    }

    getUserHighScore() {
        return this.currentUser ? this.currentUser.high_score : 0;
    }
}

// 如果Supabase未配置，使用演示存储
if (typeof isConfigured !== 'undefined' && !isConfigured) {
    window.demoStorage = new DemoStorage();
    console.log('🎮 演示模式已启用 - 数据将保存在本地存储中');
    console.log('💡 要启用完整功能，请配置Supabase并刷新页面');
}