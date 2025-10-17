#!/bin/bash
set -e

echo "=================================="
echo "🚀 Vercel 构建脚本开始执行"
echo "=================================="
echo ""

# 显示环境信息
echo "📋 环境信息："
echo "  - 当前目录: $(pwd)"
echo "  - Shell: $SHELL"
echo "  - 用户: $USER"
echo ""

# 检查环境变量
echo "🔍 检查环境变量..."
if [ -z "$SUPABASE_URL" ]; then
    echo "  ⚠️  SUPABASE_URL 未设置"
else
    echo "  ✅ SUPABASE_URL 已设置: ${SUPABASE_URL:0:30}..."
fi

if [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "  ⚠️  SUPABASE_ANON_KEY 未设置"
else
    echo "  ✅ SUPABASE_ANON_KEY 已设置: ${SUPABASE_ANON_KEY:0:20}..."
fi
echo ""

# 如果环境变量未设置，使用演示模式
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "⚠️  环境变量未配置，使用演示模式"
    echo "💡 要启用完整功能，请在 Vercel Dashboard 配置："
    echo "   Settings → Environment Variables"
    echo "   添加: SUPABASE_URL 和 SUPABASE_ANON_KEY"
    echo ""
    echo "📝 复制 demo-config.js 作为配置文件..."
    
    # 确保 supabase-config.js 存在（即使是空的演示模式）
    if [ ! -f "supabase-config.js" ]; then
        echo "// 演示模式 - 使用 demo-config.js" > supabase-config.js
        echo "window.isConfigured = false;" >> supabase-config.js
    fi
    
    echo "✅ 演示模式配置完成"
    exit 0
fi

# 生成真实配置
echo "📝 使用环境变量生成 Supabase 配置..."

cat > supabase-config.js << 'HEREDOC_END'
// Supabase 配置文件
// 由 Vercel 构建时自动生成
// 请勿手动编辑此文件

(function() {
    'use strict';
    
    // 从环境变量注入的配置
    const SUPABASE_URL = 'PLACEHOLDER_URL';
    const SUPABASE_ANON_KEY = 'PLACEHOLDER_KEY';
    const isConfigured = true;

    window.SUPABASE_URL = SUPABASE_URL;
    window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
    window.isConfigured = isConfigured;

    console.log('✅ Supabase 配置已加载');
    console.log('📍 URL:', SUPABASE_URL);
})();
HEREDOC_END

# 替换占位符
sed -i "s|PLACEHOLDER_URL|${SUPABASE_URL}|g" supabase-config.js
sed -i "s|PLACEHOLDER_KEY|${SUPABASE_ANON_KEY}|g" supabase-config.js

echo "✅ Supabase 配置文件生成成功"
echo ""
echo "📄 配置文件内容预览："
head -n 15 supabase-config.js
echo ""
echo "=================================="
echo "🎉 构建完成！"
echo "=================================="

exit 0
