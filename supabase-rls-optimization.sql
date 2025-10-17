-- ============================================
-- 贪吃蛇游戏 - RLS 策略优化脚本
-- ============================================
-- 使用方法：
-- 1. 登录 Supabase Dashboard (https://app.supabase.com)
-- 2. 选择你的项目
-- 3. 点击左侧菜单 "SQL Editor"
-- 4. 点击 "New query"
-- 5. 复制粘贴此脚本的全部内容
-- 6. 点击 "Run" 执行
-- ============================================

-- 步骤 1: 重新启用 RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 步骤 2: 删除旧的策略
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.user_profiles;

-- 步骤 3: 创建新的 RLS 策略

-- 策略 1: 已登录用户可以查看自己的完整档案
CREATE POLICY "Authenticated users can view own profile"
    ON public.user_profiles
    FOR SELECT
    USING (auth.uid() = id);

-- 策略 2: 已登录用户可以插入自己的档案
CREATE POLICY "Authenticated users can insert own profile"
    ON public.user_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 策略 3: 已登录用户可以更新自己的档案
CREATE POLICY "Authenticated users can update own profile"
    ON public.user_profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 策略 4: 已登录用户可以删除自己的档案
CREATE POLICY "Authenticated users can delete own profile"
    ON public.user_profiles
    FOR DELETE
    USING (auth.uid() = id);

-- 步骤 4: 创建安全的数据库函数用于登录时查询邮箱
CREATE OR REPLACE FUNCTION public.get_email_by_username(p_username TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER  -- 以函数创建者的权限运行，绕过 RLS
SET search_path = public
AS $$
DECLARE
    v_email TEXT;
BEGIN
    -- 只返回邮箱字段，不暴露其他信息
    SELECT email INTO v_email
    FROM public.user_profiles
    WHERE username = p_username
    LIMIT 1;
    
    RETURN v_email;
EXCEPTION
    WHEN OTHERS THEN
        -- 发生错误时返回 NULL
        RETURN NULL;
END;
$$;

-- 步骤 5: 授权函数访问权限
-- 允许匿名用户和已认证用户执行此函数
GRANT EXECUTE ON FUNCTION public.get_email_by_username(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_email_by_username(TEXT) TO authenticated;

-- 步骤 6: 添加函数注释
COMMENT ON FUNCTION public.get_email_by_username(TEXT) IS 
'安全函数：通过用户名查询对应的邮箱地址，用于登录流程。只返回邮箱字段，不暴露其他用户信息。';

-- ============================================
-- 验证安装
-- ============================================
-- 测试函数（将 'lam' 替换为你的用户名）:
-- SELECT public.get_email_by_username('lam');
--
-- 验证 RLS 策略:
-- SELECT * FROM pg_policies WHERE tablename = 'user_profiles';
-- ============================================
