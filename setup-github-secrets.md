# 📝 GitHub Secrets 快速配置指南

## 第一步：获取配置值

从你的 `.env` 文件中获取以下信息：

```bash
# 查看你的配置（Windows PowerShell）
Get-Content .env | Select-String "SUPABASE"

# 或者（Linux/Mac）
cat .env | grep SUPABASE
```

你会看到类似这样的内容：
```
SUPABASE_URL=https://uiixvbwozggzqvftkifm.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 第二步：在 GitHub 添加 Secrets

### 方法 1：通过网页界面（推荐）

1. **打开仓库 Settings**
   ```
   https://github.com/你的用户名/你的仓库名/settings
   ```

2. **找到 Secrets 设置**
   - 左侧菜单 → `Secrets and variables` → `Actions`

3. **添加第一个 Secret**
   - 点击 `New repository secret`
   - Name: `SUPABASE_URL`
   - Secret: 粘贴你的 Supabase URL
   - 点击 `Add secret`

4. **添加第二个 Secret**
   - 再次点击 `New repository secret`
   - Name: `SUPABASE_ANON_KEY`
   - Secret: 粘贴你的 Supabase Anon Key
   - 点击 `Add secret`

### 方法 2：使用 GitHub CLI（高级用户）

```bash
# 安装 GitHub CLI（如果未安装）
# Windows: winget install GitHub.cli
# Mac: brew install gh
# Linux: 参考 https://cli.github.com/

# 登录 GitHub
gh auth login

# 添加 Secrets
gh secret set SUPABASE_URL < .env
gh secret set SUPABASE_ANON_KEY < .env

# 或者手动输入
gh secret set SUPABASE_URL
# 粘贴你的 URL 并按 Ctrl+D

gh secret set SUPABASE_ANON_KEY
# 粘贴你的 Key 并按 Ctrl+D
```

---

## 第三步：验证配置

### 检查 Secrets 是否添加成功

1. 访问：`https://github.com/你的用户名/你的仓库名/settings/secrets/actions`
2. 你应该看到两个 secrets：
   - ✅ `SUPABASE_URL`
   - ✅ `SUPABASE_ANON_KEY`

注意：出于安全考虑，你看不到实际的值，只能看到名称和最后更新时间。

---

## 第四步：测试部署

### 触发首次部署

```bash
# 提交更改
git add .github/workflows/deploy.yml
git add GITHUB-DEPLOY.md
git commit -m "添加 GitHub Actions 自动部署"
git push origin main
```

### 查看部署状态

1. 访问：`https://github.com/你的用户名/你的仓库名/actions`
2. 你会看到一个新的工作流运行
3. 点击它查看详细日志
4. 等待绿色勾号 ✓ 表示成功

---

## 🎯 配置检查清单

部署前确认：

- [ ] `.env` 文件存在且包含正确的配置
- [ ] 已创建 GitHub 仓库
- [ ] 已添加两个 GitHub Secrets
- [ ] 已创建 `.github/workflows/deploy.yml` 文件
- [ ] 已启用 GitHub Pages（Settings → Pages）

---

## 📋 常见问题

### Q1: 我找不到 Secrets 设置在哪里？

**A:** 确保你是仓库的所有者或有管理员权限。路径：
```
仓库首页 → Settings → 左侧菜单 → Secrets and variables → Actions
```

### Q2: 添加 Secret 后能修改吗？

**A:** 可以！点击 Secret 名称右侧的 `Update` 按钮即可修改。

### Q3: 如何删除 Secret？

**A:** 点击 Secret 名称，然后点击 `Remove secret` 按钮。

### Q4: Secret 会被泄露吗？

**A:** 不会。GitHub 会：
- 加密存储 Secrets
- 在日志中自动隐藏 Secret 值
- 只在工作流运行时注入环境变量

### Q5: 可以在多个仓库共享 Secrets 吗？

**A:** 可以使用 Organization Secrets，但个人仓库需要单独配置。

---

## 🔐 安全提示

### ✅ 安全做法

1. **定期轮换密钥**
   - 每 3-6 个月更新一次
   - 更新后同步修改 GitHub Secrets

2. **最小权限原则**
   - 使用 Supabase 的 `anon` key，不要用 `service_role` key
   - `anon` key 可以公开，受 RLS 策略保护

3. **监控使用情况**
   - 定期检查 Supabase Dashboard 的使用日志
   - 注意异常访问模式

### ❌ 避免的错误

1. ❌ 不要截图包含 Secret 值的页面
2. ❌ 不要在公开的 Issue 中粘贴配置
3. ❌ 不要将 `.env` 提交到 Git
4. ❌ 不要使用 `service_role` key 在前端

---

## 📊 你的配置信息

将以下信息填写完整，方便后续参考：

```
GitHub 用户名: ___________________
仓库名称: ___________________
GitHub Pages URL: https://___________.github.io/___________/

Supabase 项目 ID: ___________________
Supabase URL: https://_____________________.supabase.co

已添加的 Secrets:
  ☐ SUPABASE_URL
  ☐ SUPABASE_ANON_KEY

部署状态:
  ☐ GitHub Actions 工作流创建成功
  ☐ 首次部署成功
  ☐ 网站可以访问
  ☐ 登录功能正常
  ☐ 注册功能正常
```

---

## 🚀 下一步

配置完成后：

1. **推送代码触发部署**
2. **访问你的 GitHub Pages 网站**
3. **测试登录注册功能**
4. **查看 GITHUB-DEPLOY.md 了解更多**

---

配置完成！🎉 享受自动化部署的便利吧！
