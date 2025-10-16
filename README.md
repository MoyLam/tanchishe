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

## 📄 许可证

MIT License - 可自由使用和修改

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

享受游戏吧！🎮
