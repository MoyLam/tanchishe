# 🔧 Supabase 完整配置指南

当前错误：`406 (Not Acceptable)` 和 `PGRST116: Cannot coerce the result to a single JSON object`

**原因**：`user_profiles` 数据库表未创建，导致查询失败。

---

## 📋 **快速解决步骤**

### 1️⃣ **创建数据库表**（5 分钟）

1. 访问 Supabase Dashboard：https://app.supabase.com
2. 选择你的项目（URL 中包含 `uiixvbwozggzqvftkifm`）
3. 点击左侧菜单 **"SQL Editor"**
4. 点击 **"New query"**
5. 打开项目中的 `supabase-setup.sql` 文件
6. **复制整个文件内容** 粘贴到 SQL Editor
7. 点击右下角 **"Run"** 按钮执行

✅ 执行成功后会看到：`Success. No rows returned`

---

### 2️⃣ **配置网站 URL**（2 分钟）

1. 在 Supabase Dashboard 点击左侧 **"Authentication"**
2. 点击 **"URL Configuration"** 标签
3. 在 **"Site URL"** 中填入：
   ```
   https://moylam.github.io/tanchishe/
   ```
4. 在 **"Redirect URLs"** 中添加（点击 "Add URL"）：
   ```
   https://moylam.github.io/tanchishe/
   https://moylam.github.io/tanchishe/index.html
   ```
5. 点击 **"Save"** 保存

---

### 3️⃣ **禁用邮箱验证**（可选，推荐）

如果不想配置 SMTP 邮件服务：

1. 在 Supabase Dashboard 点击 **"Authentication"**
2. 点击 **"Providers"** 标签
3. 找到 **"Email"** 提供商，点击编辑（铅笔图标）
4. **取消勾选** "Confirm email"（确认邮箱）
5. 点击 **"Save"** 保存

✅ 这样注册后可以立即登录，无需邮箱验证

---

### 4️⃣ **测试注册功能**

1. 访问部署的网站：https://moylam.github.io/tanchishe/
2. 点击 **"立即注册"**
3. 填写信息：
   - 用户名：`testuser`
   - 邮箱：`test@example.com`
   - 密码：`Test123456`（至少 6 位）
4. 点击 **"注册"**

**预期结果**：
- ✅ 看到 "注册成功" 消息
- ✅ 自动跳转到游戏界面
- ✅ 右上角显示 "欢迎，testuser！"
- ✅ 显示 "积分: 100"（注册赠送的积分）

---

## 🔍 **验证数据库**

在 Supabase SQL Editor 中执行：

```sql
-- 查看所有用户档案
SELECT * FROM public.user_profiles;
```

应该能看到刚注册的用户数据：
- `id`: 用户 UUID
- `username`: 用户名
- `email`: 邮箱
- `points`: 100（注册赠送）
- `high_score`: 0

---

## 🛠️ **SQL 脚本说明**

`supabase-setup.sql` 脚本做了以下事情：

1. ✅ 创建 `user_profiles` 表
2. ✅ 创建索引提高查询性能
3. ✅ 启用 Row Level Security (RLS) 保护数据安全
4. ✅ 创建 RLS 策略（用户只能访问自己的数据）
5. ✅ 创建触发器自动更新 `updated_at` 字段
6. ✅ 创建触发器：用户注册时自动创建档案

**自动创建档案触发器** 的好处：
- 新用户注册时自动在 `user_profiles` 表中创建记录
- 自动赠送 100 积分
- 无需手动调用 `createUserProfile()` 方法

---

## 📊 **数据库表结构**

```sql
user_profiles
├── id (UUID, Primary Key) - 关联 auth.users
├── username (TEXT, UNIQUE) - 用户名
├── email (TEXT, UNIQUE) - 邮箱
├── points (INTEGER) - 积分，默认 100
├── high_score (INTEGER) - 最高分，默认 0
├── created_at (TIMESTAMP) - 创建时间
└── updated_at (TIMESTAMP) - 更新时间
```

---

## ❓ **常见问题**

### Q1: 执行 SQL 脚本时出现 "permission denied" 错误

**解决方案**：
- 确保你是项目的 Owner 或有足够权限
- 检查是否选择了正确的项目

---

### Q2: 注册后仍然报错 406

**解决方案**：
1. 检查 SQL 脚本是否执行成功
2. 在 SQL Editor 执行：`SELECT * FROM public.user_profiles;`
3. 如果表不存在，重新执行 `supabase-setup.sql`

---

### Q3: 注册成功但积分显示为 0

**解决方案**：
- 检查触发器是否创建成功
- 手动插入测试数据：
  ```sql
  INSERT INTO public.user_profiles (id, username, email, points, high_score)
  VALUES (
      (SELECT id FROM auth.users LIMIT 1),
      'testuser',
      'test@example.com',
      100,
      0
  );
  ```

---

### Q4: 想要删除测试数据重新开始

**在 SQL Editor 执行**：
```sql
-- 删除所有用户档案
DELETE FROM public.user_profiles;

-- 删除所有认证用户
DELETE FROM auth.users;
```

---

## ✅ **完成检查清单**

- [ ] ✅ 执行 `supabase-setup.sql` 脚本
- [ ] ✅ 配置 Site URL 和 Redirect URLs
- [ ] ✅ 禁用邮箱验证（可选）
- [ ] ✅ 测试注册功能
- [ ] ✅ 验证数据库中有用户数据

---

## 🎉 **配置完成！**

完成以上步骤后，你的贪吃蛇游戏应该可以：
- ✅ 正常注册新用户
- ✅ 登录已有用户
- ✅ 保存积分和最高分
- ✅ 跨设备同步数据

如有问题，请查看浏览器控制台（F12）的错误信息。
