# 构建 Vue 前端
FROM node:18-alpine AS build

WORKDIR /app

# 复制依赖配置
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 构建生产版本
RUN npm run build

# Nginx 运行阶段
FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# 复制打包好的静态文件到 Nginx 根目录
COPY --from=build /app/dist ./

# 自定义 Nginx 配置（包括 /api 反向代理）
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

