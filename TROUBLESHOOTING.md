# 🐛 部署后注册/登录失败故障排查指南

## 📋 问题诊断步骤

### 步骤 1：检查浏览器控制台

1. 访问：https://moylam.github.io/tanchishe/
2. 按 `F12` 打开开发者工具
3. 切换到 `Console` 标签
4. 尝试注册账户
5. 查看错误信息

---

## 🔍 常见问题及解决方案

### ❌ 问题 1：CORS 跨域错误

**错误信息**：
```
Access to fetch at 'https://xxx.supabase.co' from origin 'https://moylam.github.io' 
has been blocked by CORS policy
```

**原因**：Supabase 未配置允许的网站域名

**解决方案**：

1. **登录 Supabase Dashboard**
   - 访问：https://supabase.com/dashboard/project/uiixvbwozggzqvftkifm

2. **配置 URL**
   - 导航到：`Authentication` → `URL Configuration`
   
3. **添加网站 URL**
   - **Site URL**：
     ```
     https://moylam.github.io/tanchishe
     ```
   
   - **Redirect URLs**（添加以下所有 URL）：
     ```
     https://moylam.github.io/tanchishe/*
     https://moylam.github.io/tanchishe
     http://localhost:*
     http://127.0.0.1:*
     ```

4. **点击 Save**

---

### ❌ 问题 2：邮箱确认配置问题

**错误信息**：
```
注册成功，但无法登录
或者：需要验证邮箱
```

**原因**：Supabase 默认要求邮箱验证

**解决方案 A：禁用邮箱验证（快速测试）**

1. 登录 Supabase Dashboard
2. 导航到：`Authentication` → `Providers` → `Email`
3. 找到 **"Confirm email"** 选项
4. **取消勾选** "Enable email confirmations"
5. 点击 **Save**

**解决方案 B：配置邮箱服务（生产环境推荐）**

1. 导航到：`Settings` → `Auth` → `SMTP Settings`
2. 配置你的邮件服务器
3. 测试邮件发送

---

### ❌ 问题 3：数据库表或 RLS 策略问题

**错误信息**：
```
406 Not Acceptable
或者：permission denied for table user_profiles
```

**原因**：数据库表不存在或 RLS 策略未正确配置

**解决方案**：

#### 3.1 创建 user_profiles 表

1. 登录 Supabase Dashboard
2. 导航到：`SQL Editor`
3. 执行以下 SQL：

```sql
-- 创建 user_profiles 表
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    points INTEGER DEFAULT 100,
    high_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 删除旧策略（如果存在）
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- 创建新策略
-- 允许用户查看自己的档案
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

-- 允许用户更新自己的档案
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- 允许用户插入自己的档案（注册时）
CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

#### 3.2 验证表和策略

```sql
-- 检查表是否存在
SELECT * FROM information_schema.tables 
WHERE table_name = 'user_profiles';

-- 检查 RLS 是否启用
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- 查看所有策略
SELECT * FROM pg_policies 
WHERE tablename = 'user_profiles';
```

---

### ❌ 问题 4：Supabase 配置未正确生成

**错误信息**：
```
Supabase未配置，将使用演示模式
或者：supabase is not defined
```

**原因**：GitHub Actions 生成的配置文件有问题

**解决方案**：

1. **检查 gh-pages 分支的配置文件**
   - 访问：https://github.com/MoyLam/tanchishe/blob/gh-pages/supabase-config.js
   - 确认文件存在且包含正确的 URL 和 KEY

2. **重新触发部署**
   - 访问：https://github.com/MoyLam/tanchishe/actions
   - 手动触发 "Deploy to GitHub Pages"

---

### ❌ 问题 5：密码策略问题

**错误信息**：
```
Password should be at least 6 characters
或者：Password is too weak
```

**原因**：密码不符合 Supabase 的安全要求

**解决方案**：

1. 确保密码至少 6 个字符
2. 建议包含字母和数字
3. 或在 Supabase 中调整密码策略：
   - `Authentication` → `Policies` → `Password Policy`

---

## 🔧 完整配置检查清单

### Supabase Dashboard 配置

- [ ] **URL Configuration**
  - [ ] Site URL 已设置为 `https://moylam.github.io/tanchishe`
  - [ ] Redirect URLs 包含网站地址

- [ ] **Email Provider**
  - [ ] Email confirmations 已禁用（测试阶段）
  - 或 SMTP 已正确配置（生产环境）

- [ ] **数据库**
  - [ ] `user_profiles` 表已创建
  - [ ] RLS 已启用
  - [ ] 策略已正确配置

### GitHub 配置

- [ ] **Secrets 配置**
  - [ ] `SUPABASE_URL` 正确
  - [ ] `SUPABASE_ANON_KEY` 正确

- [ ] **部署状态**
  - [ ] GitHub Actions 工作流成功
  - [ ] `gh-pages` 分支存在
  - [ ] `supabase-config.js` 已生成

---

## 🧪 测试步骤

### 1. 基础连接测试

打开浏览器控制台，输入：

```javascript
// 检查 Supabase 是否初始化
console.log('Supabase:', supabase);
console.log('isConfigured:', isConfigured);
```

**预期结果**：
- `isConfigured` 应该是 `true`
- `supabase` 应该是一个对象，不是 `null`

### 2. 注册测试

使用以下信息注册：
- 用户名：`testuser`
- 邮箱：`test@example.com`
- 密码：`test123456`（至少 6 个字符）

**查看控制台错误信息**

### 3. 网络请求测试

1. 打开 `Network` 标签
2. 尝试注册
3. 查看失败的请求
4. 点击查看详细错误信息

---

## 📞 获取详细帮助

如果问题仍未解决，请提供以下信息：

1. **浏览器控制台的完整错误信息**
2. **Network 标签中失败请求的详细信息**
3. **注册时使用的信息**（不要包含真实密码）
4. **Supabase Dashboard 的配置截图**

---

## 🎯 快速修复流程

大多数问题可以通过以下步骤解决：

```bash
✓ 步骤 1: 配置 Supabase URL
  → Authentication → URL Configuration
  → 添加 https://moylam.github.io/tanchishe

✓ 步骤 2: 禁用邮箱验证（测试阶段）
  → Authentication → Providers → Email
  → 取消 "Confirm email"

✓ 步骤 3: 创建数据库表和策略
  → SQL Editor
  → 执行上面的 SQL 脚本

✓ 步骤 4: 清除浏览器缓存
  → Ctrl + Shift + Delete
  → 清除缓存后重新访问

✓ 步骤 5: 测试注册功能
  → 使用简单的测试账户
  → 检查控制台是否有错误
```

---

**大部分注册问题都是 CORS 配置或邮箱验证设置导致的！**

先尝试上述步骤 1 和步骤 2，90% 的问题都能解决。
