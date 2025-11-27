/**
 * 图片压缩脚本
 * 用于压缩小程序中的大图片，确保符合微信小程序规范
 * 
 * 使用方法：
 * 1. 安装依赖：npm install sharp --save-dev
 * 2. 运行脚本：node scripts/compress-images.js
 */

const fs = require('fs');
const path = require('path');

// 配置
const config = {
  // 需要压缩的图片列表
  images: [
    {
      input: 'static/images/logo.png',
      output: 'static/images/logo-compressed.png',
      maxSize: 200, // KB
      quality: 80
    }
  ],
  
  // 图片目录扫描（可选）
  scanDirs: [
    'static/images',
    'static/icons'
  ],
  
  // 压缩阈值（超过此大小的图片会被压缩）
  threshold: 100, // KB
};

/**
 * 获取文件大小（KB）
 */
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return Math.round(stats.size / 1024 * 100) / 100;
  } catch (error) {
    return 0;
  }
}

/**
 * 压缩单个图片（不依赖 sharp）
 * 提供压缩建议
 */
function analyzeImage(imagePath) {
  const size = getFileSize(imagePath);
  const fileName = path.basename(imagePath);
  
  console.log(`\n📊 分析: ${fileName}`);
  console.log(`   当前大小: ${size} KB`);
  
  if (size > config.threshold) {
    console.log(`   ⚠️  超过阈值 ${config.threshold}KB，建议压缩`);
    console.log(`   推荐压缩方式:`);
    console.log(`   1. 在线工具: https://tinypng.com/`);
    console.log(`   2. 命令行: pngquant --quality=65-80 ${imagePath}`);
    console.log(`   3. WebP格式: cwebp -q 80 ${imagePath} -o ${imagePath.replace('.png', '.webp')}`);
    return false;
  } else {
    console.log(`   ✅ 大小合适，无需压缩`);
    return true;
  }
}

/**
 * 扫描目录中的所有图片
 */
function scanDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  const images = [];
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isFile() && /\.(png|jpg|jpeg)$/i.test(file)) {
      images.push(filePath);
    }
  });
  
  return images;
}

/**
 * 主函数
 */
function main() {
  console.log('🎨 小程序图片压缩分析工具\n');
  console.log('=' .repeat(60));
  
  // 分析配置中指定的图片
  console.log('\n📁 分析指定图片:');
  config.images.forEach(item => {
    if (fs.existsSync(item.input)) {
      analyzeImage(item.input);
    } else {
      console.log(`\n⚠️  文件不存在: ${item.input}`);
    }
  });
  
  // 扫描目录
  console.log('\n\n📂 扫描图片目录:');
  config.scanDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      console.log(`\n目录: ${dir}`);
      const images = scanDirectory(dir);
      
      let needCompress = 0;
      images.forEach(img => {
        const size = getFileSize(img);
        if (size > config.threshold) {
          needCompress++;
          console.log(`  ⚠️  ${path.basename(img)}: ${size} KB`);
        }
      });
      
      if (needCompress === 0) {
        console.log(`  ✅ 所有图片大小合适`);
      } else {
        console.log(`  📊 共 ${images.length} 张图片，${needCompress} 张需要压缩`);
      }
    } else {
      console.log(`\n⚠️  目录不存在: ${dir}`);
    }
  });
  
  // 输出统计信息
  console.log('\n\n' + '=' .repeat(60));
  console.log('📊 压缩建议总结:\n');
  console.log('1. 使用在线工具压缩:');
  console.log('   - TinyPNG: https://tinypng.com/');
  console.log('   - Squoosh: https://squoosh.app/');
  console.log('');
  console.log('2. 使用命令行工具:');
  console.log('   - pngquant: pngquant --quality=65-80 input.png -o output.png');
  console.log('   - ImageMagick: magick convert input.png -quality 85 output.png');
  console.log('');
  console.log('3. 转换为 WebP:');
  console.log('   - cwebp -q 80 input.png -o output.webp');
  console.log('');
  console.log('⚠️  注意: 压缩后需要替换原文件，并测试小程序显示效果');
  console.log('=' .repeat(60));
}

// 运行
main();

