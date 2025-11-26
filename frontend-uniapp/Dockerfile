# 使用Nginx直接部署已构建的静态文件
# 📝 构建前必须先在本地执行：npm run build:h5 或运行 ./build-h5.bat
# 📁 构建产物应在 dist/build/h5 或 unpackage/dist/build/h5 目录
FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# 复制本地构建产物（根据实际构建输出目录修改下面的路径）
# 方式1：如果使用CLI构建（npm run build:h5），输出在 dist/build/h5
# COPY dist/build/h5 ./

# 方式2：如果使用HBuilderX构建，输出在 unpackage/dist/build/h5
COPY unpackage/dist/build/h5 ./

# 复制Nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 验证构建产物
RUN test -f "index.html" && echo "✅ H5构建产物已复制" && ls -lh || \
    (echo "❌ 错误：未找到index.html！请先运行构建脚本" && exit 1)

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

