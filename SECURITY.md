# 安全配置指南

## 🔒 保护Supabase配置信息

为了防止敏感的Supabase配置信息泄露，请遵循以下安全最佳实践：

### 1. 配置文件安全

#### 使用模板文件
- 使用 `supabase-config.template.js` 作为配置模板
- 复制模板文件为 `supabase-config.js` 并填入真实配置
- 真实配置文件已自动添加到 `.gitignore`

#### 环境变量方式（推荐）
```bash
# 复制环境变量示例文件
cp .env.example .env

# 编辑 .env 文件，填入你的配置
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

### 2. Git版本控制安全

#### 已保护的文件类型
以下文件类型已自动添加到 `.gitignore`：
- `supabase-config.js`
- `config.js`
- `.env*` 文件
- `user-config.js`
- `local-config.js`

#### 检查提交内容
```bash
# 提交前检查是否包含敏感信息
git status
git diff --cached

# 如果意外提交了敏感信息，立即撤销
git reset HEAD~1
```

### 3. 部署安全

#### 生产环境
- 使用环境变量而不是配置文件
- 启用Supabase的行级安全策略(RLS)
- 定期轮换API密钥
- 监控API使用情况

#### 开发环境
- 不要在开发环境使用生产数据库
- 使用不同的Supabase项目进行开发和生产
- 定期清理开发数据

### 4. 代码安全

#### 避免硬编码
```javascript
// ❌ 错误：硬编码密钥
const supabase = createClient('https://xxx.supabase.co', 'eyJhbGc...')

// ✅ 正确：使用环境变量或配置文件
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
```

#### 客户端安全
- 只在客户端使用匿名密钥(anon key)
- 永远不要在客户端代码中使用服务密钥(service key)
- 使用RLS策略控制数据访问权限

### 5. 应急响应

#### 如果密钥泄露
1. 立即在Supabase控制台重新生成密钥
2. 更新所有使用该密钥的应用
3. 检查访问日志，确认是否有异常访问
4. 考虑重置受影响用户的密码

#### 监控和审计
- 定期检查Supabase项目的访问日志
- 监控异常的API调用模式
- 设置使用量警报

### 6. 团队协作安全

#### 密钥分享
- 使用安全的密钥管理工具（如1Password、LastPass）
- 不要通过聊天工具或邮件分享密钥
- 为每个团队成员创建独立的Supabase账户

#### 权限管理
- 遵循最小权限原则
- 定期审查团队成员的访问权限
- 及时移除离职人员的访问权限

## 📞 联系方式

如果发现安全问题，请立即联系项目维护者。

---

**记住：安全是一个持续的过程，而不是一次性的设置。定期审查和更新你的安全配置。**