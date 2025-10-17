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
            console.log('开始注册，用户名:', username, '邮箱:', email);
            
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
                console.error('注册错误详情:', error);
                // 返回更友好的错误提示
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
                console.log('✓ 用户创建成功，用户 ID:', data.user.id);
                
                // 设置当前用户（Supabase v2 注册成功后会自动登录）
                this.currentUser = data.user;
                
                // 等待触发器创建档案
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // 加载用户档案
                await this.loadUserProfile();
                
                // 显示游戏界面
                this.showGameInterface();
                
                return { success: true, message: '注册成功！欢迎加入贪吃蛇游戏！' };
            } else {
                console.warn('⚠ 注册返回数据异常:', data);
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
            console.log('=== 登录调试信息 ===');
            console.log('接收到的参数 - 用户名/邮箱:', usernameOrEmail);
            console.log('参数类型:', typeof usernameOrEmail);
            console.log('参数长度:', usernameOrEmail?.length);
            
            let email = usernameOrEmail;
            
            // 检查输入是否是邮箱格式
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usernameOrEmail);
            console.log('是否为邮箱格式:', isEmail);
            
            // 如果输入的不是邮箱，则从数据库查找用户名对应的邮箱
            if (!isEmail) {
                console.log('检测到输入为用户名，查找对应邮箱...');
                console.log('查询条件 - username:', usernameOrEmail);
                
                const { data, error } = await supabase
                    .from('user_profiles')
                    .select('email')
                    .eq('username', usernameOrEmail)
                    .maybeSingle();
                
                if (error) {
                    console.error('查找用户名错误:', error);
                    return { error: '登录失败，请检查用户名和密码' };
                }
                
                console.log('查询结果:', data);
                
                if (!data) {
                    console.warn('未找到用户名:', usernameOrEmail);
                    return { error: '用户名或密码错误' };
                }
                
                email = data.email;
                console.log('✓ 找到对应邮箱:', email);
            }
            
            // 使用邮箱登录
            console.log('开始使用邮箱登录:', email);
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                console.error('登录错误:', error);
                let errorMessage = error.message;
                if (error.message.includes('Invalid login credentials')) {
                    errorMessage = '用户名/邮箱或密码错误';
                } else if (error.message.includes('Email not confirmed')) {
                    errorMessage = '请先验证邮箱后再登录';
                }
                return { error: errorMessage };
            }
            
            console.log('✓ 登录成功');
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
        // 注意：此方法已被触发器替代，保留作为备用
        // Supabase 触发器会在用户注册时自动创建 user_profiles 记录
        if (!isConfigured || !supabase) return;

        try {
            // 使用 upsert 替代 insert，如果已存在则更新，不存在则插入
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
                    { onConflict: 'id' }  // 如果 ID 冲突则不报错
                );

            if (error) throw error;
            console.log('✓ 用户档案创建/更新成功');
        } catch (error) {
            // 如果是重复键错误，不记录，因为这是预期的
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
                .maybeSingle();  // 改用 maybeSingle() 允许返回 null

            if (error) {
                console.error('加载用户档案错误:', error);
                return;
            }

            if (data) {
                this.currentPoints = data.points || 0;
                console.log('✓ 用户档案加载成功，当前积分:', this.currentPoints);
                this.updateUIPoints();  // 更新UI显示
            } else {
                console.warn('⚠ 未找到用户档案，可能需要在 Supabase 中创建 user_profiles 表');
                this.currentPoints = 0;
                this.updateUIPoints();  // 仍然更新UI，显示用户名
            }
        } catch (error) {
            console.error('加载用户档案错误:', error);
            this.currentPoints = 0;
        }
    }

    async updateUserPoints(newTotalPoints) {
        // 注意：这个方法接收的是新的总积分，不是增量
        if (!isConfigured) {
            return window.demoStorage?.updatePoints(newTotalPoints);
        }

        if (!supabase || !this.currentUser) return;

        try {
            this.currentPoints = newTotalPoints;  // ✅ 直接设置为新值，不再相加
            const { error } = await supabase
                .from('user_profiles')
                .update({ points: this.currentPoints })
                .eq('id', this.currentUser.id);

            if (error) throw error;
            this.updateUIPoints();  // 更新UI显示
            console.log('✓ 积分已更新为:', this.currentPoints);
        } catch (error) {
            console.error('更新用户积分错误:', error);
        }
    }

    async addUserPoints(pointsToAdd) {
        // 这个方法用于增加积分（增量）
        if (!isConfigured) {
            const currentPoints = window.demoStorage?.getCurrentPoints() || 0;
            return window.demoStorage?.updatePoints(currentPoints + pointsToAdd);
        }

        if (!supabase || !this.currentUser) return;

        try {
            this.currentPoints += pointsToAdd;  // ✅ 增加积分
            const { error } = await supabase
                .from('user_profiles')
                .update({ points: this.currentPoints })
                .eq('id', this.currentUser.id);

            if (error) throw error;
            this.updateUIPoints();  // 更新UI显示
            console.log(`✓ 积分增加 +${pointsToAdd}，总积分: ${this.currentPoints}`);
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
        
        console.log('✓ UI已更新 - 用户名:', usernameElement?.textContent, '积分:', this.currentPoints);
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