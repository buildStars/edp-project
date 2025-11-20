# EDP 项目 Docker 部署完整指南

## 📋 项目修改总结

### ✅ 已创建/修改的文件

| 文件路径 | 说明 | 状态 |
|---------|------|------|
| `backend/Dockerfile` | 后端 NestJS 容器化配置 | ✅ 已创建 |
| `admin-frontend/Dockerfile` | 前端 Vue3 容器化配置 | ✅ 已创建 |
| `admin-frontend/nginx.conf` | Nginx 反向代理配置 | ✅ 已创建 |
| `docker-stack/docker-compose.yml` | Docker 编排配置 | ✅ 已创建 |
| `docker-stack/env-template.txt` | 环境变量模板 | ✅ 已创建 |
| `docker-stack/deploy.sh` | 一键部署脚本 | ✅ 已创建 |
| `docker-stack/README.md` | 详细使用文档 | ✅ 已创建 |

### 🔧 无需修改的文件

以下文件保持不变，无需修改：

- ✅ `backend/src/**` - 后端源代码
- ✅ `admin-frontend/src/**` - 前端源代码
- ✅ `backend/package.json` - 后端依赖配置
- ✅ `admin-frontend/package.json` - 前端依赖配置
- ✅ `admin-frontend/vite.config.ts` - Vite 配置（开发时用代理，生产时用Nginx）
- ✅ `backend/.env` - 本地开发环境变量（Docker不使用）

## 🚀 服务器部署步骤

### 1. 将文件同步到服务器

#### 方式一：使用 Git（推荐）

```bash
# 在服务器上
cd /home/ycsa

# 克隆或更新后端
git clone https://github.com/buildStars/erp-backend.git
# 或者如果已存在：cd erp-backend && git pull

# 克隆或更新前端
git clone https://github.com/buildStars/erp-admin.git
# 或者如果已存在：cd erp-admin && git pull
```

#### 方式二：手动上传文件

如果你已经在本地创建了文件，需要上传到服务器：

```bash
# 在本地项目根目录
# 上传后端 Dockerfile
scp backend/Dockerfile ycsa@192.168.0.28:/home/ycsa/erp-backend/

# 上传前端文件
scp admin-frontend/Dockerfile ycsa@192.168.0.28:/home/ycsa/erp-admin/
scp admin-frontend/nginx.conf ycsa@192.168.0.28:/home/ycsa/erp-admin/

# 上传 docker-stack 整个目录
scp -r docker-stack ycsa@192.168.0.28:/home/ycsa/erp-stack
```

### 2. 在服务器上创建目录结构

```bash
ssh ycsa@192.168.0.28

# 创建目录
mkdir -p /home/ycsa/erp-backend
mkdir -p /home/ycsa/erp-admin
mkdir -p /home/ycsa/erp-stack
```

### 3. 配置环境变量

```bash
cd /home/ycsa/erp-stack

# 复制环境变量模板
cp env-template.txt .env

# 编辑环境变量（重要！）
nano .env
```

**必须修改的配置项：**

```env
# MySQL 密码（生产环境务必改强密码）
MYSQL_ROOT_PASSWORD=your_strong_root_password_here
MYSQL_PASSWORD=your_strong_db_password_here

# Redis 密码
REDIS_PASSWORD=your_strong_redis_password_here

# JWT 密钥（务必改成随机字符串）
JWT_SECRET=your_random_jwt_secret_key_at_least_32_characters

# 服务器 IP（改成你的实际 IP）
APP_URL=http://192.168.0.28
```

保存并退出：`Ctrl+O` → `Enter` → `Ctrl+X`

### 4. 给部署脚本添加执行权限

```bash
cd /home/ycsa/erp-stack
chmod +x deploy.sh
```

### 5. 停止现有服务（避免端口冲突）

```bash
# 停止 PM2
pm2 stop all
pm2 delete all

# 停止系统 MySQL
sudo systemctl stop mysql

# 停止系统 Redis
sudo systemctl stop redis-server

# 或者使用脚本自动处理
./deploy.sh start  # 脚本会自动停止冲突服务
```

### 6. 启动 Docker 服务

```bash
cd /home/ycsa/erp-stack

# 方式一：使用部署脚本（推荐）
./deploy.sh start

# 方式二：手动启动
docker compose up -d
```

**首次启动会：**
1. 拉取 MySQL、Redis 镜像
2. 构建后端镜像（安装依赖、编译 TypeScript）
3. 构建前端镜像（安装依赖、打包 Vue）
4. 创建网络和数据卷
5. 启动所有容器

**预计耗时：** 5-10分钟（取决于网络速度）

### 7. 查看启动状态

```bash
# 查看容器状态
docker compose ps

# 应该看到 4 个容器都是 running 状态：
# edp-mysql      running
# edp-redis      running
# edp-backend    running
# edp-frontend   running

# 查看后端日志
docker compose logs backend -f

# 等待看到类似信息：
# Nest application successfully started
# Application is running on: http://0.0.0.0:3000
```

### 8. 验证部署

在浏览器中访问：

- **管理后台**: http://192.168.0.28/
- **后端API**: http://192.168.0.28/api/health（如果有health接口）
- **后端直连**: http://192.168.0.28:3000/（可选）

## 🔍 常见问题排查

### 问题1: 后端容器无法启动

**查看日志：**
```bash
docker compose logs backend
```

**可能原因：**
- 数据库连接失败 → 检查 MySQL 是否正常运行
- Prisma 迁移失败 → 手动执行迁移
- 端口被占用 → 停止冲突的服务

**解决方案：**
```bash
# 进入后端容器手动排查
docker compose exec backend sh

# 检查数据库连接
npx prisma db pull

# 手动执行迁移
npx prisma migrate deploy
```

### 问题2: 前端页面无法访问

**查看日志：**
```bash
docker compose logs frontend
```

**可能原因：**
- Nginx 构建失败 → 检查 Dockerfile
- 前端打包失败 → 检查 package.json 的 build 脚本
- 端口80被占用 → 检查系统是否有其他服务占用

**解决方案：**
```bash
# 重新构建前端
docker compose up -d --build frontend

# 检查 Nginx 配置
docker compose exec frontend cat /etc/nginx/conf.d/default.conf
```

### 问题3: 前端能访问但 /api 请求失败

**可能原因：**
- 后端容器未启动
- Nginx 反向代理配置错误
- 网络问题

**解决方案：**
```bash
# 检查后端是否运行
docker compose ps backend

# 测试后端直连
curl http://192.168.0.28:3000/health

# 检查容器网络
docker network ls
docker network inspect erp-stack_edp-network
```

### 问题4: 数据库迁移失败

**解决方案：**
```bash
# 进入后端容器
docker compose exec backend sh

# 查看迁移状态
npx prisma migrate status

# 重置数据库（危险！会删除所有数据）
npx prisma migrate reset

# 或者手动执行迁移
npx prisma migrate deploy
```

### 问题5: 上传文件后无法访问

**原因：** uploads 目录权限问题

**解决方案：**
```bash
# 检查 uploads 卷
docker volume ls | grep uploads

# 进入后端容器检查权限
docker compose exec backend ls -la /app/uploads

# 如果需要，修改权限
docker compose exec backend chmod -R 755 /app/uploads
```

## 📦 日常维护操作

### 更新代码

```bash
# 1. 在本地提交并推送代码到 GitHub
git add .
git commit -m "feat: add new feature"
git push

# 2. 在服务器上拉取最新代码
cd /home/ycsa/erp-backend
git pull

cd /home/ycsa/erp-admin
git pull

# 3. 重新构建并启动
cd /home/ycsa/erp-stack
./deploy.sh rebuild
```

### 只重启某个服务

```bash
cd /home/ycsa/erp-stack

# 只重启后端
docker compose restart backend

# 只重启前端
docker compose restart frontend

# 重启数据库（谨慎）
docker compose restart mysql
```

### 查看日志

```bash
cd /home/ycsa/erp-stack

# 实时查看所有日志
docker compose logs -f

# 只看后端日志
docker compose logs backend -f

# 查看最近100行日志
docker compose logs --tail=100 backend

# 查看特定时间的日志
docker compose logs --since 30m backend
```

### 备份数据库

```bash
cd /home/ycsa/erp-stack

# 导出数据库
docker compose exec mysql mysqldump -u root -p${MYSQL_ROOT_PASSWORD} edp_db > backup_$(date +%Y%m%d_%H%M%S).sql

# 定期备份脚本（可以加到 crontab）
echo "0 2 * * * cd /home/ycsa/erp-stack && docker compose exec mysql mysqldump -u root -p\${MYSQL_ROOT_PASSWORD} edp_db > /home/ycsa/backups/edp_db_\$(date +\%Y\%m\%d).sql" | crontab -
```

### 恢复数据库

```bash
cd /home/ycsa/erp-stack

# 从备份恢复
docker compose exec -T mysql mysql -u root -p${MYSQL_ROOT_PASSWORD} edp_db < backup_20250120.sql
```

### 清理磁盘空间

```bash
# 查看 Docker 占用空间
docker system df

# 清理未使用的镜像、容器、卷
docker system prune -a

# 或使用脚本
cd /home/ycsa/erp-stack
./deploy.sh cleanup  # 会提示确认
```

## 🔒 安全建议

### 1. 修改默认密码

生产环境务必修改 `.env` 中的所有密码：

```env
MYSQL_ROOT_PASSWORD=使用强密码（至少16位，包含大小写字母+数字+特殊字符）
MYSQL_PASSWORD=使用强密码
REDIS_PASSWORD=使用强密码
JWT_SECRET=使用随机字符串（至少32位）
```

### 2. 配置防火墙

```bash
# 只开放必要的端口
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 22/tcp    # SSH
sudo ufw enable

# 不要开放 3000, 3306, 6379 端口给外网
```

### 3. 使用 HTTPS

建议配置 SSL 证书（Let's Encrypt）：

```bash
# 安装 certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d yourdomain.com

# 修改 docker-compose.yml 添加 443 端口映射
# 修改 nginx.conf 添加 SSL 配置
```

### 4. 限制访问

在 `.env` 中配置允许的 IP：

```env
ALLOWED_IPS=192.168.0.0/24
```

修改 `nginx.conf` 添加 IP 限制。

### 5. 定期更新

```bash
# 定期更新 Docker 镜像
docker compose pull
docker compose up -d

# 定期更新系统
sudo apt update && sudo apt upgrade -y
```

## 📊 性能优化

### 1. 调整 MySQL 配置

在 `docker-compose.yml` 中添加：

```yaml
mysql:
  command: >
    --max_connections=1000
    --innodb_buffer_pool_size=1G
    --query_cache_size=0
```

### 2. 调整 Redis 配置

```yaml
redis:
  command: >
    redis-server
    --maxmemory 512mb
    --maxmemory-policy allkeys-lru
```

### 3. 启用 Gzip 压缩

已在 `nginx.conf` 中配置。

### 4. 监控资源使用

```bash
# 实时监控容器资源
docker stats

# 查看磁盘使用
df -h
docker system df
```

## 🎯 生产环境检查清单

部署前请确认：

- [ ] 修改了所有默认密码和密钥
- [ ] 配置了 `.env` 文件
- [ ] 备份了现有数据（如有）
- [ ] 测试了数据库连接
- [ ] 测试了 API 接口
- [ ] 配置了防火墙规则
- [ ] 设置了自动备份
- [ ] 配置了日志轮转
- [ ] 配置了监控告警（可选）
- [ ] 准备了回滚方案

## 📞 获取帮助

如遇到问题：

1. 查看日志：`docker compose logs -f`
2. 检查状态：`docker compose ps`
3. 参考文档：`docker-stack/README.md`
4. 联系技术支持

## 🎉 总结

完成以上步骤后，你的 EDP 系统将：

- ✅ 运行在独立的 Docker 容器中
- ✅ 数据持久化存储（即使容器重启也不丢失）
- ✅ 一键启动/停止/重启
- ✅ 便于更新和维护
- ✅ 易于迁移和扩展

**访问地址：**
- 管理后台: http://192.168.0.28/
- 后端API: http://192.168.0.28/api/

祝部署顺利！🚀

