# 🚀 部署指南

本文档说明如何将贪吃蛇游戏部署到服务器，并解决 Supabase 配置问题。

## 📝 问题说明

### 为什么本地正常但部署后失败？

1. **配置文件缺失**：`.env` 文件在 `.gitignore` 中被忽略，不会上传到 Git 仓库
2. **浏览器限制**：前端 JavaScript 无法直接读取 `.env` 文件
3. **解决方案**：使用脚本将 `.env` 转换为 `supabase-config.js`

## 🔧 本地开发

### 1. 初始配置

```bash
# 1. 复制环境变量示例文件
cp .env.example .env

# 2. 编辑 .env 文件，填入你的 Supabase 配置
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_ANON_KEY=your-anon-key
```

### 2. 生成配置文件

**Windows (PowerShell):**
```powershell
.\generate-config.ps1
```

**Linux/Mac (Bash):**
```bash
chmod +x generate-config.sh
./generate-config.sh
```

### 3. 测试

直接打开 `index.html` 文件测试登录注册功能。

## 🌐 部署到服务器

### 方案 1：手动部署（适用于静态服务器）

#### 步骤：

1. **在本地生成配置文件**
   ```bash
   # Windows
   .\generate-config.ps1
   
   # Linux/Mac
   ./generate-config.sh
   ```

2. **上传文件到服务器**
   
   上传以下文件：
   - `index.html`
   - `style.css`
   - `game.js`
   - `auth.js`
   - `demo-config.js`
   - `supabase-config.js` ⚠️ **重要：必须包含**
   - 其他必要文件

3. **验证部署**
   
   访问你的网站 URL，测试登录注册功能。

### 方案 2：在服务器上生成配置（推荐）

#### 步骤：

1. **上传项目文件**
   
   将整个项目（包括 `.env` 文件）上传到服务器

2. **SSH 连接到服务器**
   ```bash
   ssh user@your-server.com
   cd /path/to/your/project
   ```

3. **生成配置文件**
   ```bash
   # 确保脚本有执行权限
   chmod +x generate-config.sh
   
   # 运行生成脚本
   ./generate-config.sh
   ```

4. **验证生成结果**
   ```bash
   # 检查文件是否存在
   ls -la supabase-config.js
   
   # 查看文件开头（不要显示密钥）
   head -n 10 supabase-config.js
   ```

### 方案 3：使用环境变量（Vercel/Netlify）

如果使用 Vercel、Netlify 等平台：

1. **在平台设置环境变量**
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

2. **添加构建脚本**
   
   在 `package.json` 中添加：
   ```json
   {
     "scripts": {
       "build": "bash generate-config.sh"
     }
   }
   ```

3. **配置部署命令**
   - Build Command: `npm run build`
   - Publish Directory: `.`

## ⚠️ 重要安全提示

### 文件保护

确保以下文件**不要**上传到 Git：
- `.env`
- `supabase-config.js`
- 任何包含密钥的文件

这些文件已在 `.gitignore` 中配置。

### 验证 .gitignore

```bash
# 检查哪些文件会被提交
git status

# 确保 .env 和 supabase-config.js 不在列表中
```

### 密钥轮换

定期在 Supabase Dashboard 中轮换你的 API 密钥。

## 🔍 故障排查

### 问题 1：登录注册提示错误

**症状：** 部署后点击登录/注册按钮，提示 "系统初始化中，请稍后再试"

**原因：** `supabase-config.js` 文件缺失或未正确加载

**解决：**
1. 检查服务器上是否存在 `supabase-config.js` 文件
2. 查看浏览器控制台是否有 404 错误
3. 重新运行 `generate-config.sh`

### 问题 2：Supabase 连接失败

**症状：** 控制台显示 "Supabase客户端初始化失败"

**原因：** URL 或 KEY 配置错误

**解决：**
1. 检查 `.env` 文件中的配置是否正确
2. 在 Supabase Dashboard > Settings > API 中验证配置
3. 重新生成配置文件

### 问题 3：CORS 错误

**症状：** 浏览器提示跨域错误

**原因：** Supabase 项目未配置允许的域名

**解决：**
1. 登录 Supabase Dashboard
2. 前往 Authentication > URL Configuration
3. 在 "Site URL" 中添加你的域名
4. 在 "Redirect URLs" 中添加回调地址

### 问题 4：RLS 策略错误

**症状：** 注册成功但无法查看用户信息

**原因：** Row Level Security (RLS) 策略未正确配置

**解决：**
参考 `SUPABASE_SETUP.md` 文件中的说明配置 RLS 策略。

## 📊 检查清单

部署前请确认：

- [ ] `.env` 文件已正确配置
- [ ] 已运行 `generate-config.sh` 生成配置文件
- [ ] `supabase-config.js` 文件存在
- [ ] Supabase Dashboard 中已配置域名
- [ ] RLS 策略已正确设置
- [ ] 本地测试通过

部署后请验证：

- [ ] 网站可以正常访问
- [ ] 注册功能正常
- [ ] 登录功能正常
- [ ] 积分系统正常
- [ ] 浏览器控制台无错误

## 🎯 快速命令参考

```bash
# 本地生成配置（Windows）
.\generate-config.ps1

# 本地生成配置（Linux/Mac）
./generate-config.sh

# 检查配置文件是否存在
ls -la supabase-config.js

# 查看环境变量（不显示敏感信息）
head -n 5 .env

# 上传到服务器（使用 scp）
scp supabase-config.js user@server:/path/to/project/

# 在服务器上生成配置
ssh user@server "cd /path/to/project && ./generate-config.sh"
```

## 📞 获取帮助

如果仍然遇到问题：

1. 查看浏览器开发者工具的 Console 和 Network 标签
2. 检查 Supabase Dashboard 的日志
3. 参考 `SECURITY.md` 和 `SUPABASE_SETUP.md` 文档
4. 提交 Issue 到项目仓库

---

✨ 祝部署顺利！
