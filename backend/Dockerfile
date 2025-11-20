# 构建阶段：编译 Nest + 生成 Prisma Client
FROM node:18-alpine AS build

WORKDIR /app

# 复制依赖配置
COPY package*.json ./
COPY prisma ./prisma/

# 安装所有依赖（包括 devDependencies，因为需要编译）
RUN npm install

# 复制源代码
COPY . .

# 生成 Prisma Client
RUN npx prisma generate

# 编译 TypeScript
RUN npm run build

# 运行阶段
FROM node:18-alpine

WORKDIR /app

# 复制依赖配置
COPY package*.json ./
COPY prisma ./prisma/

# 只安装生产依赖
RUN npm install --omit=dev

# 生成 Prisma Client（生产环境也需要）
RUN npx prisma generate

# 从构建阶段复制编译后的代码
COPY --from=build /app/dist ./dist

# 创建 uploads 目录
RUN mkdir -p uploads

EXPOSE 3000

# 启动时先执行 Prisma 迁移，再启动应用
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]

