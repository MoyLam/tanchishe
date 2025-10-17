# 从 .env 文件生成 supabase-config.js
# 用途：在部署前或本地开发时自动生成配置文件

Write-Host "🔧 开始生成 supabase-config.js 文件..." -ForegroundColor Cyan

# 检查 .env 文件是否存在
if (-not (Test-Path ".env")) {
    Write-Host "❌ 错误：.env 文件不存在" -ForegroundColor Red
    Write-Host "请先复制 .env.example 为 .env 并填写您的配置" -ForegroundColor Yellow
    exit 1
}

# 读取 .env 文件
$envContent = Get-Content ".env"
$supabaseUrl = ""
$supabaseKey = ""

foreach ($line in $envContent) {
    if ($line -match "^SUPABASE_URL=(.+)$") {
        $supabaseUrl = $matches[1].Trim()
    }
    if ($line -match "^SUPABASE_ANON_KEY=(.+)$") {
        $supabaseKey = $matches[1].Trim()
    }
}

# 验证配置
if ([string]::IsNullOrWhiteSpace($supabaseUrl) -or [string]::IsNullOrWhiteSpace($supabaseKey)) {
    Write-Host "❌ 错误：.env 文件中缺少必要的配置" -ForegroundColor Red
    Write-Host "请确保 SUPABASE_URL 和 SUPABASE_ANON_KEY 已正确配置" -ForegroundColor Yellow
    exit 1
}

# 检查是否为示例值
if ($supabaseUrl -like "*your_supabase*" -or $supabaseKey -like "*your_supabase*") {
    Write-Host "❌ 错误：.env 文件中仍使用示例配置" -ForegroundColor Red
    Write-Host "请填写真实的 Supabase 配置值" -ForegroundColor Yellow
    exit 1
}

# 生成配置文件内容
$configContent = @"
// Supabase配置文件
// 此文件由 generate-config.ps1 自动生成，请勿手动编辑
// 生成时间: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

// Supabase配置
const SUPABASE_URL = '$supabaseUrl';
const SUPABASE_ANON_KEY = '$supabaseKey';

// 检查配置是否已更新
const isConfigured = SUPABASE_URL !== 'YOUR_SUPABASE_URL_HERE' && 
                    SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY_HERE' &&
                    SUPABASE_URL && SUPABASE_ANON_KEY;

let supabase = null;
let authManager = null;

// 初始化Supabase客户端
if (isConfigured && typeof window !== 'undefined' && window.supabase) {
    try {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase客户端初始化成功');
    } catch (error) {
        console.error('Supabase客户端初始化失败:', error);
    }
} else {
    console.log('Supabase未配置，将使用演示模式');
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
                   { success: false, message: '演示模式：注册功能不可用' };
        }

        if (!supabase) {
            return { success: false, message: 'Supabase未正确配置' };
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
            console.error('注册错误:', error);
            return { success: false, message: error.message || '注册失败，请稍后重试' };
        }
    }

    async login(emailOrUsername, password) {
        if (!isConfigured) {
            return window.demoStorage?.login(emailOrUsername, password) || 
                   { success: false, message: '演示模式：登录功能不可用' };
        }

        if (!supabase) {
            return { success: false, message: 'Supabase未正确配置' };
        }

        try {
            // 尝试使用邮箱登录
            const { data, error } = await supabase.auth.signInWithPassword({
                email: emailOrUsername,
                password: password
            });

            if (error) throw error;
            return { success: true, message: '登录成功！', user: data.user };
        } catch (error) {
            console.error('登录错误:', error);
            return { success: false, message: '用户名或密码错误' };
        }
    }

    async logout() {
        if (!isConfigured) {
            return window.demoStorage?.logout() || { success: true, message: '已退出登录' };
        }

        if (!supabase) {
            return { success: false, message: 'Supabase未正确配置' };
        }

        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            return { success: true, message: '已退出登录' };
        } catch (error) {
            console.error('退出错误:', error);
            return { success: false, message: '退出失败，请稍后重试' };
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
                this.updateUIPoints();
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
            this.currentPoints = points;
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
        
        this.updateUIPoints();
    }
}

// 初始化认证管理器
async function initializeAuth() {
    authManager = new AuthManager();
    await authManager.init();
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAuth);
} else {
    initializeAuth();
}
"@

# 写入文件
$configContent | Out-File -FilePath "supabase-config.js" -Encoding UTF8

Write-Host "✅ supabase-config.js 文件生成成功！" -ForegroundColor Green
Write-Host ""
Write-Host "📋 配置信息:" -ForegroundColor Cyan
Write-Host "  URL: $supabaseUrl" -ForegroundColor Gray
Write-Host "  KEY: $($supabaseKey.Substring(0, 20))..." -ForegroundColor Gray
Write-Host ""
Write-Host "🚀 接下来可以:" -ForegroundColor Yellow
Write-Host "  1. 在本地测试：直接打开 index.html" -ForegroundColor Gray
Write-Host "  2. 部署到服务器：将生成的 supabase-config.js 一起上传" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  注意：supabase-config.js 不会被提交到 Git（已在 .gitignore 中）" -ForegroundColor Yellow
