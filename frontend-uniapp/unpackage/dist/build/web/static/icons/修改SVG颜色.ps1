# 批量修改SVG文件颜色脚本
# 项目颜色规范：
# - 默认图标：#666666（次要文字色）
# - 强调/激活图标：#C8161D（北大红，主题色）
# - liked（已点赞）：#C8161D

$icons = Get-ChildItem -Path "." -Filter "*.svg"

# 定义颜色规则
$colorRules = @{
    # 强调色图标（已激活状态）
    "star.svg" = "#C8161D"          # 收藏-实心（已收藏）
    "liked.svg" = "#C8161D"         # 点赞-实心（已点赞）
    
    # 默认灰色图标
    "search.svg" = "#666666"
    "message.svg" = "#666666"
    "edit.svg" = "#666666"
    "scan.svg" = "#666666"
    "arrow-right.svg" = "#666666"
    "close.svg" = "#666666"
    "delete.svg" = "#666666"
    "back.svg" = "#666666"
    "user.svg" = "#666666"
    "teacher.svg" = "#666666"
    "work.svg" = "#666666"
    "logout.svg" = "#666666"
    "star-o.svg" = "#666666"        # 收藏-空心（未收藏）
    "share.svg" = "#666666"
    "like.svg" = "#666666"          # 点赞-空心（未点赞）
    "check.svg" = "#666666"
    "view.svg" = "#666666"
    "course.svg" = "#666666"
    "association.svg" = "#666666"
    "news.svg" = "#666666"
    "ai.svg" = "#666666"
    "time.svg" = "#666666"
    "location.svg" = "#666666"
    "status.svg" = "#666666"
    "trend.svg" = "#666666"
    "download.svg" = "#666666"
    "about.svg" = "#666666"
    "service.svg" = "#666666"
    "phone.svg" = "#666666"
    "email.svg" = "#666666"
    "wechat.svg" = "#666666"
}

Write-Host "开始处理SVG文件..." -ForegroundColor Green
Write-Host ""

$count = 0
foreach ($icon in $icons) {
    $fileName = $icon.Name
    $color = $colorRules[$fileName]
    
    if ($color) {
        $content = Get-Content $icon.FullName -Raw
        
        # 检查是否已经有 fill 属性
        if ($content -match 'fill="[^"]*"') {
            # 替换现有的 fill 属性
            $newContent = $content -replace 'fill="[^"]*"', "fill=`"$color`""
        } elseif ($content -match '<svg([^>]*)>') {
            # 在 svg 标签中添加 fill 属性
            $newContent = $content -replace '<svg([^>]*)>', "<svg`$1 fill=`"$color`">"
        } else {
            Write-Host "⚠️  跳过: $fileName (无法识别SVG格式)" -ForegroundColor Yellow
            continue
        }
        
        # 保存文件
        Set-Content -Path $icon.FullName -Value $newContent -NoNewline
        
        $count++
        $colorDisplay = if ($color -eq "#C8161D") { "红色(强调)" } else { "灰色(默认)" }
        Write-Host "✅ $fileName -> $colorDisplay ($color)" -ForegroundColor Cyan
    } else {
        Write-Host "⏭️  跳过: $fileName (未在规则中)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "处理完成！共修改 $count 个文件" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "颜色规范:" -ForegroundColor Yellow
Write-Host "  默认图标: #666666 (次要文字色)" -ForegroundColor Gray
Write-Host "  强调图标: #C8161D (北大红)" -ForegroundColor Red

