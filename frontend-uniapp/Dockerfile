# 构建阶段
FROM node:18-alpine3.17 AS build

WORKDIR /app

# 复制依赖配置
COPY package*.json ./

# 配置npm镜像源并安装依赖
RUN npm config set registry https://registry.npmmirror.com && \
    npm install --legacy-peer-deps --network-timeout=600000

# 复制源代码
COPY . .

# 构建H5版本
RUN npm run build:h5

# 生产阶段
FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# 复制构建产物（uni-app H5版本输出到 dist/build/h5）
COPY --from=build /app/dist/build/h5 ./h5

# 复制Nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

