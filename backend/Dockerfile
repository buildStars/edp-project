# 构建阶段：编译 Nest + 生成 Prisma Client
# 使用 Alpine 3.17，它包含 openssl1.1-compat（Prisma 5.x 需要）
FROM node:18-alpine3.17 AS build

# 安装 OpenSSL 兼容库（Prisma 需要）
RUN apk add --no-cache openssl1.1-compat

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

# 验证编译结果（调试用）
RUN ls -la dist/ && echo "Build completed successfully"

# 运行阶段
# 使用 Alpine 3.17，它包含 openssl1.1-compat（Prisma 5.x 需要）
FROM node:18-alpine3.17

# 安装 OpenSSL 兼容库（Prisma 需要）
RUN apk add --no-cache openssl1.1-compat

WORKDIR /app

# 复制依赖配置
COPY package*.json ./
COPY prisma ./prisma/

# 配置 npm 镜像源并安装生产依赖
RUN npm config set registry https://registry.npmmirror.com && \
    npm install --omit=dev --legacy-peer-deps --network-timeout=600000

# 安装 prisma CLI（仅用于数据库迁移，不用于生成 Client）
RUN npm install prisma@5.8.0 --legacy-peer-deps --network-timeout=600000

# 从构建阶段复制编译后的代码和已生成的 Prisma Client
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma/client ./node_modules/@prisma/client

# 创建 uploads 目录
RUN mkdir -p uploads

EXPOSE 3000

# 启动时先执行 Prisma 迁移，再启动应用（使用本地安装的版本）
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node dist/src/main.js"]

