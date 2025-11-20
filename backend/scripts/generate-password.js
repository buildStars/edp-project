/**
 * 密码哈希生成工具
 * 用于为用户生成 bcrypt 加密的密码哈希
 */
const bcrypt = require('bcrypt');

async function generatePasswordHash(password) {
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  console.log('\n密码哈希生成成功！\n');
  console.log('原始密码:', password);
  console.log('加密哈希:', hash);
  console.log('\n请将上面的哈希值复制到数据库的 password 字段中\n');
  return hash;
}

// 从命令行参数获取密码，如果没有则使用默认密码
const password = process.argv[2] || '123456';

generatePasswordHash(password)
  .then(() => process.exit(0))
  .catch(error => {
    console.error('生成密码哈希失败:', error);
    process.exit(1);
  });

