# 로그인 후 에러 디버깅 완료

## 발견된 문제

### 1. React Hooks 규칙 위반 (주요 문제)
**에러 메시지:** "React has detected a change in the order of Hooks called by FarmsPage"

**원인:**
- `app/farms/page.tsx`에서 조건부 return 이후에 `useEffect`가 호출됨
- React의 Rules of Hooks: 모든 Hooks는 조건부 return 이전에 호출되어야 함

**수정 내용:**
- 모든 `useEffect`를 조건부 return 이전으로 이동
- `useQuery`에 `enabled` 옵션 추가하여 인증 상태에 따라 쿼리 실행 제어

### 2. 누락된 컴포넌트 파일
- `components/farms/StallTabs.tsx` - 생성 완료
- `components/rooms/RoomGrid.tsx` - 생성 완료
- `components/rooms/RoomCard.tsx` - 생성 완료

### 3. 문법 오류
- `router.push(/farms/);` → `router.push(\`/farms/${filteredItems[0].registNo}\`);`로 수정

## 수정된 파일

### `app/farms/page.tsx`
**주요 변경사항:**
1. 모든 Hooks를 조건부 return 이전으로 이동
2. `useQuery`에 `enabled: status === "authenticated"` 추가
3. `filteredItems` 계산을 IIFE로 변경하여 조건부 실행 방지
4. owner 자동 리다이렉트 로직 개선

**수정 전 구조:**
```typescript
// Hooks 호출
useEffect(...) // 인증 체크
useQuery(...)
// 조건부 return
if (loading) return ...
if (error) return ...
if (!data) return null
// 데이터 처리
let filteredItems = ...
// ❌ 조건부 return 이후에 useEffect 호출 (규칙 위반!)
useEffect(...) // owner 리다이렉트
```

**수정 후 구조:**
```typescript
// 모든 Hooks 호출 (조건부 return 이전)
useQuery(...)
useEffect(...) // 인증 체크
useEffect(...) // owner 리다이렉트
// 데이터 처리 (조건부 실행 방지)
const filteredItems = data ? (...) : []
// 조건부 return
if (loading) return ...
if (error) return ...
if (!data) return ...
```

## 테스트 방법

1. **개발 서버 재시작:**
   ```bash
   cd Local_PC/iot-dashboard
   npm run dev
   ```

2. **로그인 테스트:**
   - Admin 계정으로 로그인
   - `/farms` 페이지가 정상적으로 로드되는지 확인
   - React Hooks 에러가 발생하지 않는지 확인

3. **Owner 계정 테스트:**
   - Owner 계정으로 로그인
   - 농장이 1개인 경우 자동으로 `/farms/FARM01`로 리다이렉트되는지 확인

4. **브라우저 콘솔 확인:**
   - React Hooks 에러가 없는지 확인
   - 다른 에러가 없는지 확인

## 예상 결과

- ✅ 로그인 후 `/farms` 페이지 정상 로드
- ✅ React Hooks 에러 없음
- ✅ 농장 목록 정상 표시
- ✅ Owner 계정 자동 리다이렉트 동작

## 추가 확인 사항

1. **API 연결 확인:**
   - `/api/farms/summary` 엔드포인트가 정상 작동하는지 확인
   - 네트워크 탭에서 API 응답 확인

2. **세션 확인:**
   - NextAuth 세션이 정상적으로 생성되는지 확인
   - 브라우저 개발자 도구 > Application > Cookies에서 세션 확인

3. **컴포넌트 렌더링:**
   - `FarmSummaryTable`, `KpiCards` 등 컴포넌트가 정상 렌더링되는지 확인

## 문제가 지속되는 경우

1. **브라우저 캐시 클리어:**
   - Ctrl + Shift + Delete
   - 캐시된 이미지 및 파일 삭제

2. **Next.js 캐시 삭제:**
   ```bash
   rm -rf .next
   npm run dev
   ```

3. **의존성 재설치:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run dev
   ```

4. **에러 로그 확인:**
   - 브라우저 콘솔 (F12)
   - 터미널 출력
   - Next.js 에러 페이지
