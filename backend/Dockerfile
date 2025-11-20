# 构建阶段：编译 Nest + 生成 Prisma Client
FROM node:18-alpine AS build

WORKDIR /app

# 复制依赖配置
COPY package*.json ./
COPY prisma ./prisma/

# 配置 npm 镜像源并安装所有依赖（包括 devDependencies，因为需要编译）
RUN npm config set registry https://registry.npmmirror.com && \
    npm install --legacy-peer-deps --network-timeout=600000

# 复制源代码
COPY . .

# 生成 Prisma Client（使用本地安装的版本）
RUN npm run prisma:generate

# 编译 TypeScript
RUN npm run build

# 运行阶段
FROM node:18-alpine

WORKDIR /app

# 复制依赖配置
COPY package*.json ./
COPY prisma ./prisma/

# 配置 npm 镜像源并安装生产依赖
RUN npm config set registry https://registry.npmmirror.com && \
    npm install --omit=dev --legacy-peer-deps --network-timeout=600000

# 安装 prisma CLI（用于生成 Client 和数据库迁移）
RUN npm install prisma@5.8.0 --legacy-peer-deps --network-timeout=600000

# 生成 Prisma Client（使用刚安装的版本）
RUN node_modules/.bin/prisma generate

# 从构建阶段复制编译后的代码
COPY --from=build /app/dist ./dist

# 创建 uploads 目录
RUN mkdir -p uploads

EXPOSE 3000

# 启动时先执行 Prisma 迁移，再启动应用（使用本地安装的版本）
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node dist/main.js"]

