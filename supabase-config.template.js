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
        window.supabaseClient = supabase;
    } catch (error) {
        console.error('Supabase客户端初始化失败:', error);
    }
} else if (!window.supabase) {
    console.error('Supabase JS 库未加载！请检查 CDN 链接');
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

            if (error) {
                let errorMessage = error.message;
                if (error.message.includes('User already registered')) {
                    errorMessage = '该邮箱已被注册，请使用其他邮箱或直接登录';
                } else if (error.message.includes('Password should be at least')) {
                    errorMessage = '密码至少需要 6 个字符';
                } else if (error.message.includes('invalid email')) {
                    errorMessage = '邮箱格式不正确';
                } else if (error.message.includes('Unable to validate email address')) {
                    errorMessage = '无法验证邮箱地址，请检查邮箱格式';
                }
                return { error: errorMessage };
            }

            if (data.user) {
                this.currentUser = data.user;
                await new Promise(resolve => setTimeout(resolve, 1000));
                await this.loadUserProfile();
                this.showGameInterface();
                return { success: true, message: '注册成功！欢迎加入贪吃蛇游戏！' };
            } else {
                return { error: '注册失败，请稍后重试' };
            }
        } catch (error) {
            console.error('注册异常:', error);
            return { error: error.message || '注册失败，请稍后重试' };
        }
    }

    async login(usernameOrEmail, password) {
        if (!isConfigured) {
            return window.demoStorage?.login(usernameOrEmail, password) || 
                   { error: '演示模式：登录功能不可用' };
        }

        if (!supabase) {
            return { error: 'Supabase未正确配置' };
        }

        try {
            let email = usernameOrEmail;
            
            // 检查输入是否是邮箱格式
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usernameOrEmail);
            
            // 如果输入的不是邮箱，则调用数据库函数查找用户名对应的邮箱
            if (!isEmail) {
                const { data, error } = await supabase.rpc('get_email_by_username', {
                    p_username: usernameOrEmail
                });
                
                if (error) {
                    console.error('查找用户名错误:', error);
                    return { error: '登录失败，请检查用户名和密码' };
                }
                
                if (!data) {
                    return { error: '用户名或密码错误' };
                }
                
                email = data;
            }
            
            // 使用邮箱登录
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                let errorMessage = error.message;
                if (error.message.includes('Invalid login credentials')) {
                    errorMessage = '用户名/邮箱或密码错误';
                } else if (error.message.includes('Email not confirmed')) {
                    errorMessage = '请先验证邮箱后再登录';
                }
                return { error: errorMessage };
            }
            
            return { success: true, user: data.user, message: '登录成功！' };
        } catch (error) {
            console.error('登录异常:', error);
            return { error: error.message || '登录失败，请稍后重试' };
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
                .upsert(
                    {
                        id: userId,
                        username: username,
                        email: email,
                        points: 100,
                        high_score: 0
                    },
                    { onConflict: 'id' }
                );

            if (error && !error.message.includes('duplicate key')) {
                console.error('创建用户档案错误:', error);
            }
        } catch (error) {
            if (!error.message.includes('duplicate key')) {
                console.error('创建用户档案错误:', error);
            }
        }
    }

    async loadUserProfile() {
        if (!isConfigured || !supabase || !this.currentUser) return;

        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', this.currentUser.id)
                .maybeSingle();

            if (error) {
                console.error('加载用户档案错误:', error);
                return;
            }

            if (data) {
                this.currentPoints = data.points || 0;
                this.updateUIPoints();
            } else {
                this.currentPoints = 0;
                this.updateUIPoints();
            }
        } catch (error) {
            console.error('加载用户档案错误:', error);
            this.currentPoints = 0;
        }
    }

    async updateUserPoints(newTotalPoints) {
        if (!isConfigured) {
            return window.demoStorage?.updatePoints(newTotalPoints);
        }

        if (!supabase || !this.currentUser) return;

        try {
            this.currentPoints = newTotalPoints;
            const { error } = await supabase
                .from('user_profiles')
                .update({ points: this.currentPoints })
                .eq('id', this.currentUser.id);

            if (error) throw error;
            this.updateUIPoints();
        } catch (error) {
            console.error('更新用户积分错误:', error);
        }
    }

    async addUserPoints(pointsToAdd) {
        if (!isConfigured) {
            const currentPoints = window.demoStorage?.getCurrentPoints() || 0;
            return window.demoStorage?.updatePoints(currentPoints + pointsToAdd);
        }

        if (!supabase || !this.currentUser) return;

        try {
            this.currentPoints += pointsToAdd;
            const { error } = await supabase
                .from('user_profiles')
                .update({ points: this.currentPoints })
                .eq('id', this.currentUser.id);

            if (error) throw error;
            this.updateUIPoints();
        } catch (error) {
            console.error('增加用户积分错误:', error);
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

    updateUIPoints() {
        const pointsElement = document.getElementById('user-points');
        const usernameElement = document.getElementById('username-display');
        
        if (pointsElement) {
            pointsElement.textContent = this.currentPoints;
        }
        
        if (usernameElement && this.currentUser) {
            const username = this.currentUser.user_metadata?.username || this.currentUser.email?.split('@')[0] || '用户';
            usernameElement.textContent = username;
        }
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
        
        // 更新界面显示
        this.updateUIPoints();
    }
}

// 初始化认证管理器
async function initializeAuth() {
    authManager = new AuthManager();
    window.authManager = authManager;
    await authManager.init();
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAuth);
} else {
    initializeAuth();
}