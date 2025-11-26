# 批量修改SVG图标颜色
# 项目配色方案：
# - 默认灰色（常规图标）：#333333
# - 主题色（北大红）：#C8161D
# - 浅灰色（禁用状态）：#999999

$iconDir = "d:\edp-project\frontend-uniapp\static\icons"
$defaultColor = "#333333"  # 深灰色，适合大多数场景

Write-Host "=== 开始批量修改SVG图标颜色 ===" -ForegroundColor Green
Write-Host "目标目录: $iconDir"
Write-Host "默认颜色: $defaultColor"
Write-Host ""

# 获取所有SVG文件
$svgFiles = Get-ChildItem -Path $iconDir -Filter "*.svg"
$totalFiles = $svgFiles.Count
$modifiedCount = 0

Write-Host "找到 $totalFiles 个SVG文件"
Write-Host ""

foreach ($file in $svgFiles) {
    try {
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
        $originalContent = $content
        
        # 检查是否已有fill属性
        if ($content -match 'fill=') {
            # 替换现有的fill颜色
            $content = $content -replace 'fill="#[0-9A-Fa-f]{6}"', "fill=""$defaultColor"""
            $content = $content -replace 'fill="#[0-9A-Fa-f]{3}"', "fill=""$defaultColor"""
        } else {
            # 如果没有fill属性，添加到svg标签
            $content = $content -replace '<svg\s+', "<svg fill=""$defaultColor"" "
        }
        
        # 只有内容变化时才写入
        if ($content -ne $originalContent) {
            Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
            Write-Host "✅ $($file.Name) - 已修改" -ForegroundColor Green
            $modifiedCount++
        } else {
            Write-Host "⏭️  $($file.Name) - 无需修改" -ForegroundColor Gray
        }
    }
    catch {
        Write-Host "❌ $($file.Name) - 修改失败: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== 修改完成 ===" -ForegroundColor Green
Write-Host "总文件数: $totalFiles"
Write-Host "已修改: $modifiedCount"
Write-Host "未修改: $($totalFiles - $modifiedCount)"
