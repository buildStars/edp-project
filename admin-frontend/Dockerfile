# 构建 Vue 前端
FROM node:18-alpine AS build

WORKDIR /app

# 复制依赖配置
COPY package*.json ./

# 配置 npm 镜像源（使用淘宝镜像）并安装依赖
RUN npm config set registry https://registry.npmmirror.com && \
    npm install --legacy-peer-deps --network-timeout 600000

# 复制源代码
COPY . .

# 构建生产版本（跳过类型检查以避免 vue-tsc 兼容性问题）
RUN vite build

# Nginx 运行阶段
FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# 复制打包好的静态文件到 Nginx 根目录
COPY --from=build /app/dist ./

# 自定义 Nginx 配置（包括 /api 反向代理）
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

