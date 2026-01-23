# Admin 비밀번호 해시 업데이트 가이드

## 문제
`app_users` 테이블의 `password_hash` 필드에 평문 비밀번호가 저장되어 있어 로그인이 실패합니다.

## 해결 방법

### 방법 1: Node.js 스크립트 사용 (권장)

1. 프로젝트 루트에서 실행:
```bash
cd Local_PC/iot-dashboard
node scripts/generate-password-hash.js admin123
```

2. 출력된 SQL 쿼리를 Supabase SQL Editor에서 실행:
```sql
UPDATE app_users 
SET password_hash = '$2a$10$생성된해시값' 
WHERE username = 'admin';
```

3. 로그인 테스트:
   - 사용자명: `admin`
   - 비밀번호: `admin123` (스크립트에 입력한 비밀번호)

### 방법 2: 직접 SQL로 해시 생성 (Supabase SQL Editor)

Supabase SQL Editor에서 다음 쿼리를 실행:

```sql
-- bcrypt 해시 생성 (PostgreSQL pgcrypto 확장 사용)
-- 주의: Supabase에서 pgcrypto가 활성화되어 있어야 합니다.

-- 방법 A: pgcrypto 사용 (가능한 경우)
UPDATE app_users 
SET password_hash = crypt('admin123', gen_salt('bf', 10))
WHERE username = 'admin';

-- 방법 B: Node.js에서 생성한 해시 사용 (권장)
-- 먼저 scripts/generate-password-hash.js로 해시 생성 후
UPDATE app_users 
SET password_hash = '$2a$10$YourGeneratedHashHere'
WHERE username = 'admin';
```

### 방법 3: Node.js REPL 사용

```bash
cd Local_PC/iot-dashboard
node
```

그 다음:
```javascript
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('admin123', 10);
console.log(hash);
// 출력된 해시를 복사하여 SQL에서 사용
```

### Owner 계정도 업데이트

`owner01` 계정도 동일하게 업데이트:

```bash
node scripts/generate-password-hash.js owner123
```

```sql
UPDATE app_users 
SET password_hash = '$2a$10$생성된해시값' 
WHERE username = 'owner01';
```

## 확인

업데이트 후 Supabase Table Editor에서 확인:
- `app_users` 테이블의 `password_hash` 필드가 `$2a$10$...` 형식의 해시로 변경되었는지 확인
- 평문 비밀번호가 아닌 해시 문자열이어야 함

## 주의사항

- 비밀번호는 평문으로 저장하지 마세요
- 해시는 `$2a$10$`로 시작하는 bcrypt 형식이어야 합니다
- 로그인 시 사용자가 입력한 평문 비밀번호와 DB의 해시를 `bcryptjs.compare`로 비교합니다
