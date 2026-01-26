// 비밀번호 해시 생성 스크립트
// 사용법: node scripts/generate-password-hash.js <password>

// eslint-disable-next-line @typescript-eslint/no-require-imports
const bcrypt = require("bcryptjs");

const password = process.argv[2];

if (!password) {
  console.error('사용법: node scripts/generate-password-hash.js <password>');
  console.error('예시: node scripts/generate-password-hash.js admin123');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log('비밀번호:', password);
console.log('해시:', hash);
console.log('\nSQL 업데이트 쿼리:');
console.log(`UPDATE app_users SET password_hash = '${hash}' WHERE username = 'admin';`);
