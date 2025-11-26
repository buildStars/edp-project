#!/bin/bash
# uni-app H5本地构建脚本

echo "🚀 开始构建 uni-app H5版本..."

# 进入项目目录
cd "$(dirname "$0")"

# 检查node_modules
if [ ! -d "node_modules" ]; then
    echo "❌ node_modules不存在"
    echo "💡 请在HBuilderX中打开此项目，它会自动安装依赖"
    exit 1
fi

# 构建H5版本
echo "📦 正在构建..."
npm run build:h5

# 检查构建产物
if [ -d "dist/build/h5" ]; then
    echo "✅ 构建成功！输出目录: dist/build/h5"
    ls -lh dist/build/h5/
elif [ -d "unpackage/dist/build/h5" ]; then
    echo "✅ 构建成功！输出目录: unpackage/dist/build/h5"
    ls -lh unpackage/dist/build/h5/
    # 创建软链接方便Docker使用
    ln -sf unpackage/dist dist 2>/dev/null || true
else
    echo "❌ 构建失败，未找到输出目录"
    exit 1
fi

echo ""
echo "🎉 构建完成！现在可以执行："
echo "   cd ../docker-stack"
echo "   docker-compose build uniapp-h5"
echo "   docker-compose up -d uniapp-h5"

