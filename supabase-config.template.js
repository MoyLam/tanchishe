// Supabase配置模板文件
// 使用说明：
// 1. 本地开发：复制此文件为 supabase-config.js 并填写配置
// 2. 生产部署：由 GitHub Actions 自动注入到 index.html

// 检查是否由 GitHub Actions 注入了配置
const SUPABASE_URL = window.SUPABASE_URL || 'YOUR_SUPABASE_URL_HERE';
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY_HERE';

// 检查配置是否已更新
const isConfigured = window.isConfigured || (
    SUPABASE_URL !== 'YOUR_SUPABASE_URL_HERE' && 
    SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY_HERE' &&
    SUPABASE_URL && SUPABASE_ANON_KEY
);

let supabase = null;
let authManager = null;

// 初始化Supabase客户端
if (isConfigured && typeof window !== 'undefined' && window.supabase) {
    try {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        window.supabaseClient = supabase;  // 暴露到全局
        console.log('✓ Supabase客户端初始化成功');
        console.log('URL:', SUPABASE_URL.substring(0, 30) + '...');
    } catch (error) {
        console.error('✗ Supabase客户端初始化失败:', error);
    }
} else {
    if (!isConfigured) {
        console.log('⚠ Supabase未配置，将使用演示模式');
    } else if (!window.supabase) {
        console.error('✗ Supabase JS 库未加载！请检查 CDN 链接');
    }
}

// 认证管理器类
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.currentPoints = 0;
    }

    async init() {
        if (isConfigured && supabase) {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    this.currentUser = session.user;
                    await this.loadUserProfile();
                }

                supabase.auth.onAuthStateChange((event, session) => {
                    if (event === 'SIGNED_IN') {
                        this.currentUser = session.user;
                        this.loadUserProfile();
                        this.showGameInterface();
                    } else if (event === 'SIGNED_OUT') {
                        this.currentUser = null;
                        this.currentPoints = 0;
                        this.showAuthInterface();
                    }
                });
            } catch (error) {
                console.error('认证初始化错误:', error);
            }
        } else {
            console.log('演示模式：使用本地存储');
        }

        // 根据配置状态显示相应界面
        if (!isConfigured) {
            this.showGameInterface(); // 演示模式直接显示游戏
        } else if (this.currentUser) {
            this.showGameInterface();
        } else {
            this.showAuthInterface();
        }
    }

    async register(email, password, username) {
        if (!isConfigured) {
            return window.demoStorage?.register(email, password, username) || 
                   { error: '演示模式：注册功能不可用' };
        }

        if (!supabase) {
            return { error: 'Supabase未正确配置' };
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        username: username
                    }
                }
            });

            if (error) throw error;

            if (data.user) {
                await this.createUserProfile(data.user.id, username, email);
                return { success: true, message: '注册成功！请检查邮箱验证链接。' };
            }
        } catch (error) {
            return { error: error.message };
        }
    }

    async login(email, password) {
        if (!isConfigured) {
            return window.demoStorage?.login(email, password) || 
                   { error: '演示模式：登录功能不可用' };
        }

        if (!supabase) {
            return { error: 'Supabase未正确配置' };
        }

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;
            return { success: true, user: data.user };
        } catch (error) {
            return { error: error.message };
        }
    }

    async logout() {
        if (!isConfigured) {
            return window.demoStorage?.logout() || { success: true };
        }

        if (!supabase) {
            return { error: 'Supabase未正确配置' };
        }

        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { error: error.message };
        }
    }

    async createUserProfile(userId, username, email) {
        if (!isConfigured || !supabase) return;

        try {
            const { error } = await supabase
                .from('user_profiles')
                .insert([
                    {
                        id: userId,
                        username: username,
                        email: email,
                        points: 100,
                        high_score: 0
                    }
                ]);

            if (error) throw error;
        } catch (error) {
            console.error('创建用户档案错误:', error);
        }
    }

    async loadUserProfile() {
        if (!isConfigured || !supabase || !this.currentUser) return;

        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', this.currentUser.id)
                .single();

            if (error) throw error;

            if (data) {
                this.currentPoints = data.points || 0;
            }
        } catch (error) {
            console.error('加载用户档案错误:', error);
        }
    }

    async updateUserPoints(points) {
        if (!isConfigured) {
            return window.demoStorage?.updatePoints(points);
        }

        if (!supabase || !this.currentUser) return;

        try {
            this.currentPoints += points;
            const { error } = await supabase
                .from('user_profiles')
                .update({ points: this.currentPoints })
                .eq('id', this.currentUser.id);

            if (error) throw error;
        } catch (error) {
            console.error('更新用户积分错误:', error);
        }
    }

    async updateHighScore(score) {
        if (!isConfigured) {
            return window.demoStorage?.updateHighScore(score);
        }

        if (!supabase || !this.currentUser) return;

        try {
            const { error } = await supabase
                .from('user_profiles')
                .update({ high_score: score })
                .eq('id', this.currentUser.id);

            if (error) throw error;
        } catch (error) {
            console.error('更新最高分错误:', error);
        }
    }

    getCurrentUser() {
        if (!isConfigured) {
            return window.demoStorage?.getCurrentUser();
        }
        return this.currentUser;
    }

    getCurrentPoints() {
        if (!isConfigured) {
            return window.demoStorage?.getCurrentPoints() || 0;
        }
        return this.currentPoints;
    }

    showAuthInterface() {
        const authContainer = document.getElementById('auth-container');
        const gameContainer = document.getElementById('game-container');
        
        if (authContainer) authContainer.style.display = 'block';
        if (gameContainer) gameContainer.style.display = 'none';
    }

    showGameInterface() {
        const authContainer = document.getElementById('auth-container');
        const gameContainer = document.getElementById('game-container');
        
        if (authContainer) authContainer.style.display = 'none';
        if (gameContainer) gameContainer.style.display = 'block';
    }
}

// 初始化认证管理器
async function initializeAuth() {
    authManager = new AuthManager();
    window.authManager = authManager;  // 暴露到全局
    await authManager.init();
    console.log('✓ 认证管理器初始化完成');
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAuth);
} else {
    initializeAuth();
}