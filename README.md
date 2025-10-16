# 🐍 贪吃蛇游戏

一个集成了用户认证和积分系统的现代化贪吃蛇游戏，使用 Supabase 作为后端服务。

## ✨ 功能特性

- 🎮 经典贪吃蛇游戏玩法
- 👤 用户注册和登录系统
- 🏆 个人最高分记录
- 💰 积分系统（首次注册赠送100积分）
- 📱 响应式设计，支持移动设备
- 🎨 现代化UI设计，毛玻璃效果
- ⌨️ 支持键盘和虚拟按键控制

## 🚀 快速开始

### 1. Supabase 设置

1. 访问 [Supabase](https://supabase.com) 并创建新项目
2. 在项目仪表板中，找到 **Settings** > **API**
3. 复制 `Project URL` 和 `anon public` 密钥

### 2. 数据库设置

在 Supabase SQL 编辑器中执行以下 SQL 创建用户档案表：

```sql
-- 创建用户档案表
CREATE TABLE user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    points INTEGER DEFAULT 100,
    high_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 设置行级安全策略 (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 用户只能查看和修改自己的档案
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 3. 安全配置项目

⚠️ **重要：为了保护您的Supabase配置信息，请遵循以下安全步骤**

#### 方法一：使用配置模板（推荐）

1. 复制配置模板文件：
```bash
cp supabase-config.template.js supabase-config.js
```

2. 编辑 `supabase-config.js` 文件，替换占位符：
```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-actual-anon-key-here';
```

#### 方法二：使用环境变量

1. 复制环境变量示例文件：
```bash
cp .env.example .env
```

2. 编辑 `.env` 文件：
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-actual-anon-key-here
```

#### 🔒 安全提醒

- ✅ 配置文件已自动添加到 `.gitignore`，不会被提交到版本控制
- ✅ 支持演示模式：未配置时自动使用本地存储
- ❌ 永远不要将真实密钥提交到 Git 仓库
- ❌ 不要在聊天工具或邮件中分享密钥

详细安全指南请查看 [SECURITY.md](SECURITY.md)

### 4. 运行项目

直接在浏览器中打开 `index.html` 文件即可开始游戏！

## 🎯 游戏规则

- 使用方向键或 WASD 控制蛇的移动
- 移动设备可使用屏幕上的虚拟方向键
- 吃到食物获得分数，蛇身会变长
- 撞墙或撞到自己游戏结束
- 游戏结束后会根据分数获得积分奖励

## 💰 积分系统

- **注册奖励**：首次注册赠送 100 积分
- **游戏奖励**：每 10 游戏分数 = 1 积分
- **额外奖励**：每达到 100 分获得 5 额外积分

## 📁 项目结构

```
贪吃蛇游戏/
├── index.html                    # 主页面
├── style.css                     # 样式文件
├── game.js                       # 游戏逻辑
├── supabase-config.js           # Supabase配置和认证管理 (需要配置)
├── supabase-config.template.js  # Supabase配置模板 (安全模板)
├── demo-config.js               # 演示模式配置
├── auth.js                      # 认证界面交互逻辑
├── .env.example                 # 环境变量示例文件
├── .gitignore                   # Git忽略文件 (保护敏感信息)
├── README.md                    # 项目说明
└── SECURITY.md                  # 安全配置指南
```

## 🛠️ 技术栈

- **前端**：HTML5, CSS3, JavaScript (ES6+)
- **后端**：Supabase (PostgreSQL + Auth)
- **样式**：CSS Grid, Flexbox, 毛玻璃效果
- **认证**：Supabase Auth

## 🔧 自定义配置

### 修改积分规则

在 `auth.js` 文件中的 `GamePointsManager` 类中可以调整积分规则：

```javascript
class GamePointsManager {
    constructor() {
        this.pointsPerFood = 1;      // 每吃一个食物的积分
        this.bonusThreshold = 100;   // 奖励积分的分数阈值
        this.bonusPoints = 5;        // 奖励积分数量
    }
}
```

### 修改游戏设置

在 `game.js` 文件中可以调整游戏参数：

```javascript
this.gridSize = 20;  // 网格大小
// 游戏速度在 gameLoop 方法中的 setTimeout 调整
```

## 🚨 安全注意事项

1. **Supabase 配置安全**：
   - 使用配置模板文件，避免直接修改源码
   - 确保敏感配置文件已添加到 `.gitignore`
   - 定期轮换 API 密钥

2. **数据库权限**：确保已正确设置 RLS 策略

3. **HTTPS**：生产环境建议使用 HTTPS

4. **浏览器兼容性**：建议使用现代浏览器（Chrome, Firefox, Safari, Edge）

5. **密钥管理**：
   - 不要在代码中硬编码密钥
   - 使用环境变量或安全的配置管理
   - 团队协作时使用安全的密钥分享工具

## 🐛 故障排除

### 常见问题

1. **登录失败**
   - 检查 Supabase 配置是否正确
   - 确认数据库表已创建
   - 检查浏览器控制台错误信息

2. **积分不更新**
   - 确认用户已登录
   - 检查数据库连接
   - 查看浏览器控制台是否有错误

3. **样式显示异常**
   - 确认所有 CSS 文件已正确加载
   - 检查浏览器是否支持 backdrop-filter

## 📄 许可证

MIT License - 可自由使用和修改

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

享受游戏吧！🎮