#!/bin/bash

# EDP Docker 一键部署脚本
# 使用方法: ./deploy.sh [start|stop|restart|logs|rebuild]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 项目根目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 打印带颜色的消息
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查 Docker 是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    if ! command -v docker compose &> /dev/null; then
        print_error "Docker Compose 未安装或版本过低"
        print_info "请升级到 Docker Compose v2"
        exit 1
    fi
    
    print_info "Docker 环境检查通过"
}

# 检查环境变量文件
check_env() {
    if [ ! -f ".env" ]; then
        print_warn ".env 文件不存在"
        if [ -f "env-template.txt" ]; then
            print_info "正在从模板创建 .env 文件..."
            cp env-template.txt .env
            print_warn "请编辑 .env 文件并修改配置："
            print_warn "  nano .env"
            print_warn "修改完成后再次运行此脚本"
            exit 1
        else
            print_error "env-template.txt 模板文件不存在"
            exit 1
        fi
    fi
    print_info "环境变量文件检查通过"
}

# 停止可能冲突的服务
stop_conflicting_services() {
    print_info "检查并停止可能冲突的服务..."
    
    # 停止 PM2
    if command -v pm2 &> /dev/null; then
        pm2 stop all 2>/dev/null || true
        pm2 delete all 2>/dev/null || true
        print_info "已停止 PM2 服务"
    fi
    
    # 停止系统 MySQL
    if systemctl is-active --quiet mysql 2>/dev/null; then
        sudo systemctl stop mysql
        print_info "已停止系统 MySQL 服务"
    fi
    
    # 停止系统 Redis
    if systemctl is-active --quiet redis-server 2>/dev/null; then
        sudo systemctl stop redis-server
        print_info "已停止系统 Redis 服务"
    fi
}

# 启动服务
start_services() {
    print_info "正在启动服务..."
    docker compose up -d
    
    print_info "等待服务启动..."
    sleep 10
    
    # 检查服务状态
    docker compose ps
    
    print_info "================================"
    print_info "🎉 服务启动成功！"
    print_info "================================"
    print_info "管理后台: http://192.168.0.28/"
    print_info "后端API:  http://192.168.0.28/api/"
    print_info "================================"
    print_info "查看日志: docker compose logs -f"
    print_info "查看状态: docker compose ps"
}

# 停止服务
stop_services() {
    print_info "正在停止服务..."
    docker compose stop
    print_info "服务已停止"
}

# 重启服务
restart_services() {
    print_info "正在重启服务..."
    docker compose restart
    print_info "服务已重启"
}

# 查看日志
view_logs() {
    docker compose logs -f
}

# 重新构建并启动
rebuild_services() {
    print_info "正在重新构建镜像..."
    docker compose down
    docker compose build --no-cache
    start_services
}

# 清理所有数据
cleanup_all() {
    read -p "⚠️  确定要删除所有容器和数据吗？(yes/no): " confirm
    if [ "$confirm" == "yes" ]; then
        print_warn "正在清理所有数据..."
        docker compose down -v
        docker system prune -f
        print_info "清理完成"
    else
        print_info "取消清理操作"
    fi
}

# 主函数
main() {
    case "${1:-}" in
        start)
            check_docker
            check_env
            stop_conflicting_services
            start_services
            ;;
        stop)
            stop_services
            ;;
        restart)
            restart_services
            ;;
        logs)
            view_logs
            ;;
        rebuild)
            check_docker
            check_env
            rebuild_services
            ;;
        cleanup)
            cleanup_all
            ;;
        *)
            echo "EDP Docker 部署脚本"
            echo ""
            echo "使用方法:"
            echo "  ./deploy.sh start     - 启动所有服务"
            echo "  ./deploy.sh stop      - 停止所有服务"
            echo "  ./deploy.sh restart   - 重启所有服务"
            echo "  ./deploy.sh logs      - 查看实时日志"
            echo "  ./deploy.sh rebuild   - 重新构建并启动"
            echo "  ./deploy.sh cleanup   - 清理所有数据（危险）"
            exit 1
            ;;
    esac
}

main "$@"

