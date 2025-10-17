# 🔴 422 错误快速修复指南

## 错误信息
```
POST https://uiixvbwozggzqvftkifm.supabase.co/auth/v1/signup 422 (Unprocessable Content)
```

---

## 🎯 **422 错误常见原因**

### 1️⃣ **密码太短**（最常见）
Supabase 默认要求密码至少 **6 个字符**。

**解决方案**：
- 使用至少 6 位的密码
- 建议使用字母+数字组合，如：`Test123456`

---

### 2️⃣ **邮箱格式错误**
邮箱必须符合标准格式。

**解决方案**：
- 使用正确的邮箱格式：`user@example.com`
- 不要使用中文或特殊字符

---

### 3️⃣ **邮箱已被注册**
该邮箱已经在系统中注册过。

**解决方案**：
- 使用其他邮箱注册
- 或直接使用该邮箱登录

---

### 4️⃣ **Supabase 邮箱验证配置问题**
如果 Supabase 启用了邮箱验证但没有配置 SMTP，可能导致注册失败。

**解决方案**：
按照以下步骤**禁用邮箱验证**：

#### **步骤：**
1. 访问 Supabase Dashboard：https://app.supabase.com
2. 选择你的项目
3. 点击左侧 **"Authentication"**
4. 点击 **"Providers"** 标签
5. 找到 **"Email"** 提供商，点击编辑（铅笔图标）
6. **取消勾选** "Confirm email"
7. 点击 **"Save"** 保存

✅ 完成后重新尝试注册

---

### 5️⃣ **Site URL 配置错误**
Supabase 需要配置允许的网站 URL。

**解决方案**：

#### **步骤：**
1. 在 Supabase Dashboard 点击 **"Authentication"**
2. 点击 **"URL Configuration"** 标签
3. 在 **"Site URL"** 中填入：
   ```
   https://moylam.github.io/tanchishe/
   ```
4. 在 **"Redirect URLs"** 中添加（点击 "Add URL"）：
   ```
   https://moylam.github.io/tanchishe/
   https://moylam.github.io/tanchishe/index.html
   http://localhost:5500
   http://127.0.0.1:5500
   ```
5. 点击 **"Save"** 保存

---

## 🧪 **测试步骤**

### 1. 等待 GitHub Actions 部署完成（刚刚推送了新代码）

访问：https://github.com/MoyLam/tanchishe/actions

等待最新的工作流运行完成（约 1-2 分钟）

### 2. 强制刷新浏览器

- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

### 3. 打开浏览器控制台（F12）

查看 Console 标签，现在会显示详细的错误信息，例如：
- `密码至少需要 6 个字符`
- `该邮箱已被注册`
- `邮箱格式不正确`

### 4. 使用正确的注册信息

**示例**：
- 用户名：`testuser`
- 邮箱：`test123@example.com`（使用未注册的邮箱）
- 密码：`Test123456`（至少 6 位）
- 确认密码：`Test123456`

---

## 📋 **完整检查清单**

在尝试注册前，请确认：

- [ ] ✅ 密码至少 6 个字符
- [ ] ✅ 邮箱格式正确（包含 `@` 和域名）
- [ ] ✅ 使用未注册的邮箱
- [ ] ✅ 在 Supabase 中禁用了邮箱验证
- [ ] ✅ 在 Supabase 中配置了 Site URL
- [ ] ✅ 执行了 `supabase-setup.sql` 脚本
- [ ] ✅ GitHub Actions 部署成功
- [ ] ✅ 浏览器已强制刷新

---

## 🔍 **查看详细错误信息**

新版本代码已经增强了错误日志，注册时会在控制台显示：

```
开始注册，用户名: xxx, 邮箱: xxx@xxx.com
```

如果失败，会显示：
```
注册错误详情: { message: "具体错误原因" }
```

**请按 F12 打开控制台，尝试注册，然后把控制台的错误信息告诉我！**

---

## ⚡ **快速修复步骤**

如果你不想配置 Supabase，可以：

1. **临时禁用邮箱验证**（上面第 4 点）
2. **使用简单的测试数据**：
   - 用户名：`test`
   - 邮箱：`test@test.com`
   - 密码：`123456`（6 位数字）

---

## 💡 **下一步**

1. **等待新代码部署**（GitHub Actions 正在运行）
2. **刷新页面**（Ctrl + Shift + R）
3. **按 F12 打开控制台**
4. **尝试注册**
5. **把控制台的错误信息告诉我**

这样我就能准确知道 422 错误的具体原因了！🎯
