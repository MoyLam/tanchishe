# Supabase 数据库设置指南

## 问题说明
当前遇到的 406 错误是由于 Supabase 的行级安全策略（RLS）限制导致的。匿名用户无法访问 `user_profiles` 表。

## 解决方案

### 1. 登录到 Supabase Dashboard
访问：https://supabase.com/dashboard/project/uiixvbwozggzqvftkifm

### 2. 检查现有策略并更新

如果策略已存在，先删除再重新创建：

```sql
-- 删除现有策略（如果存在）
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow username lookup for login" ON user_profiles;

-- 重新创建策略
-- 允许已认证用户读取自己的档案
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

-- 允许已认证用户更新自己的档案
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- 允许已认证用户插入自己的档案（注册时）
CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 如果需要支持用户名登录，添加此策略（可选）
CREATE POLICY "Allow username lookup for login" ON user_profiles
    FOR SELECT USING (true);
```

### 3. 确保 RLS 已启用

```sql
-- 启用 RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
```

### 4. 简化版本（推荐）

如果上述方法复杂，可以使用以下简化命令：

```sql
-- 启用 RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 删除所有现有策略
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow username lookup for login" ON user_profiles;

-- 创建一个允许用户完全访问自己数据的策略
CREATE POLICY "Enable all access for users based on user_id" ON user_profiles
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
```

### 4. 验证表结构

确保 `user_profiles` 表包含以下字段：

```sql
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    points INTEGER DEFAULT 100,
    high_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 当前临时解决方案

在 RLS 策略配置完成之前，系统已临时禁用用户名登录功能，只支持邮箱登录。

## 测试步骤

1. 配置好 RLS 策略后
2. 刷新应用页面
3. 尝试注册新账户
4. 使用邮箱地址登录

## 注意事项

- 注册功能应该正常工作，因为它使用 Supabase Auth
- 用户档案创建可能需要适当的 RLS 策略
- 积分更新功能需要用户已登录状态