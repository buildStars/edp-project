# ========================================
# uni-app Web/H5 静态文件部署
# ========================================
# 此项目使用HBuilderX特定版本依赖，无法通过npm在Docker中安装
# 
# 部署前必须：
# 1. 在本地Windows运行: ./build-h5.bat
# 2. 或在HBuilderX中: 发行 → 网站-H5移动版  
# 3. 提交构建产物到git
# ========================================

FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# 复制本地构建产物
# HBuilderX 4.67+输出: unpackage/dist/build/web/
# HBuilderX 旧版输出: unpackage/dist/build/h5/
COPY unpackage/dist/build/web ./

# 复制Nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 验证构建产物
RUN test -f "index.html" && echo "✅ Web静态文件已部署" && ls -lh || \
    (echo "❌ 错误：未找到index.html" && \
     echo "💡 请先运行: ./build-h5.bat 或在HBuilderX中构建" && \
     echo "💡 然后提交: git add -f frontend-uniapp/unpackage/dist/build/web/" && \
     exit 1)

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

