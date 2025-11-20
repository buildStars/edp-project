# EDP Docker 部署方案

一键部署前端、后端、MySQL、Redis 全栈应用。

## 📋 目录结构

```
/home/ycsa/
├── erp-backend/          # 后端项目（已有 Dockerfile）
├── erp-admin/            # 前端项目（已有 Dockerfile + nginx.conf）
└── erp-stack/            # Docker 编排目录（本目录）
    ├── docker-compose.yml
    ├── .env              # 环境变量配置
    └── README.md
```

## 🚀 快速开始

### 1. 准备环境变量

复制示例配置文件：

```bash
cd /home/ycsa/erp-stack
cp .env.example .env
```

编辑 `.env` 文件，修改以下关键配置：

```env
# MySQL 密码
MYSQL_ROOT_PASSWORD=your_strong_password
MYSQL_PASSWORD=your_db_password

# Redis 密码
REDIS_PASSWORD=your_redis_password

# JWT 密钥（务必修改）
JWT_SECRET=your_jwt_secret_key

# 服务器 IP
APP_URL=http://192.168.0.28
```

### 2. 停止已有服务（避免端口冲突）

```bash
# 停止 PM2
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# 停止系统 MySQL/Redis
sudo systemctl stop mysql 2>/dev/null || true
sudo systemctl stop redis-server 2>/dev/null || true
```

### 3. 启动所有服务

```bash
cd /home/ycsa/erp-stack

# 首次启动（会构建镜像）
docker compose up -d

# 查看启动状态
docker compose ps

# 查看日志
docker compose logs -f
```

## 🔍 验证部署

### 访问地址

- **管理后台**: http://192.168.0.28/
- **后端API**: http://192.168.0.28/api/...
- **后端直连**: http://192.168.0.28:3000/（可选）

### 检查服务状态

```bash
# 查看所有容器状态
docker compose ps

# 查看后端日志
docker compose logs backend -f

# 查看前端日志
docker compose logs frontend -f

# 查看数据库日志
docker compose logs mysql -f
```

### 健康检查

```bash
# 后端健康检查（如果有 /health 接口）
curl http://192.168.0.28:3000/health

# 前端页面检查
curl -I http://192.168.0.28/
```

## 📦 日常操作

### 重启服务

```bash
cd /home/ycsa/erp-stack

# 重启所有服务
docker compose restart

# 只重启后端
docker compose restart backend

# 只重启前端
docker compose restart frontend
```

### 更新代码

当你在 GitHub 上更新了代码后：

```bash
# 1. 拉取最新代码
cd /home/ycsa/erp-backend
git pull

cd /home/ycsa/erp-admin
git pull

# 2. 重新构建并启动
cd /home/ycsa/erp-stack
docker compose up -d --build
```

### 查看日志

```bash
cd /home/ycsa/erp-stack

# 实时查看后端日志
docker compose logs backend -f

# 查看最近 100 行日志
docker compose logs --tail=100 backend

# 查看所有服务日志
docker compose logs -f
```

### 停止服务

```bash
cd /home/ycsa/erp-stack

# 停止所有容器（保留数据）
docker compose stop

# 停止并删除容器（保留数据卷）
docker compose down

# 停止并删除所有（包括数据卷，谨慎使用！）
docker compose down -v
```

### 进入容器调试

```bash
# 进入后端容器
docker compose exec backend sh

# 进入前端容器
docker compose exec frontend sh

# 进入 MySQL 容器
docker compose exec mysql bash

# 连接 MySQL 数据库
docker compose exec mysql mysql -u edp_user -p edp_db
```

## 🔧 数据库管理

### 执行 Prisma 迁移

```bash
# 进入后端容器
docker compose exec backend sh

# 执行迁移
npx prisma migrate deploy

# 查看迁移状态
npx prisma migrate status
```

### 数据备份

```bash
# 备份数据库
docker compose exec mysql mysqldump -u root -p${MYSQL_ROOT_PASSWORD} edp_db > backup_$(date +%Y%m%d_%H%M%S).sql

# 恢复数据库
docker compose exec -T mysql mysql -u root -p${MYSQL_ROOT_PASSWORD} edp_db < backup.sql
```

### 查看数据库数据

```bash
# 连接到 MySQL
docker compose exec mysql mysql -u edp_user -p edp_db

# 在 MySQL 命令行中
SHOW TABLES;
SELECT COUNT(*) FROM users;
```

## 📊 监控和性能

### 查看资源使用

```bash
# 查看容器资源占用
docker stats

# 查看特定容器资源
docker stats edp-backend edp-frontend
```

### 查看容器详情

```bash
# 查看后端容器详情
docker compose exec backend node --version
docker compose exec backend npm --version

# 查看磁盘使用
docker system df
```

## 🐛 故障排查

### 后端无法连接数据库

```bash
# 检查 MySQL 是否正常运行
docker compose ps mysql

# 查看 MySQL 日志
docker compose logs mysql

# 测试数据库连接
docker compose exec backend sh -c 'npx prisma db pull'
```

### 前端页面无法访问

```bash
# 检查 Nginx 配置
docker compose exec frontend cat /etc/nginx/conf.d/default.conf

# 重启前端容器
docker compose restart frontend

# 查看前端日志
docker compose logs frontend
```

### 端口被占用

```bash
# 查看端口占用
sudo netstat -tunlp | grep :80
sudo netstat -tunlp | grep :3000
sudo netstat -tunlp | grep :3306

# 停止占用端口的进程
sudo kill -9 <PID>
```

### 重置所有容器和数据

```bash
cd /home/ycsa/erp-stack

# 停止并删除所有容器和数据卷
docker compose down -v

# 删除所有镜像（可选）
docker rmi $(docker images -q edp-*)

# 重新启动
docker compose up -d --build
```

## 🔄 CI/CD 集成

### GitHub Actions 自动部署

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /home/ycsa/erp-backend
            git pull
            cd /home/ycsa/erp-admin
            git pull
            cd /home/ycsa/erp-stack
            docker compose up -d --build
```

## 📝 环境变量说明

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| MYSQL_ROOT_PASSWORD | MySQL root 密码 | root123456 |
| MYSQL_DATABASE | 数据库名称 | edp_db |
| MYSQL_USER | 数据库用户 | edp_user |
| MYSQL_PASSWORD | 数据库密码 | edp_pass123 |
| REDIS_PASSWORD | Redis 密码 | redis123456 |
| JWT_SECRET | JWT 密钥 | 需修改 |
| WECHAT_APPID | 微信小程序 AppID | - |
| WECHAT_SECRET | 微信小程序 Secret | - |
| APP_URL | 应用访问地址 | http://192.168.0.28 |
| NODE_ENV | 运行环境 | production |

## ⚠️ 注意事项

1. **生产环境务必修改所有密码和密钥**
2. **定期备份 MySQL 数据**
3. **监控磁盘空间（Docker 日志和数据卷）**
4. **配置防火墙规则**
5. **使用 HTTPS（建议配置 SSL 证书）**

## 📞 技术支持

如有问题，请查看日志：

```bash
docker compose logs -f
```

或联系技术团队。

