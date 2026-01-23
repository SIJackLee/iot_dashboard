# IoT Dashboard 설정 가이드

## 프로젝트 개요

로컬 PC에서 UI/UX 구현 및 테스트를 위한 Next.js 대시보드입니다.
**현재 단계:** 인증/권한 없이 UI/UX 구현에 집중 (Phase 1)

---

## 1. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 입력하세요:

```env
SUPABASE_URL=https://ompufmezugftzoergdbn.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
OFFLINE_TH_DEFAULT_SEC=211
OFFLINE_CACHE_TTL_SEC=300
OFFLINE_LOOKBACK_MIN=120
```

**중요:** 
- `SUPABASE_SERVICE_ROLE_KEY`는 `Cloud_AWS_EC2/supabase_config.py`에서 복사하세요.
- 서비스 키는 절대 브라우저/로그에 노출하지 마세요.

---

## 2. 로컬 실행

```bash
cd Local_PC/iot-dashboard
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

**참고:** 인증 없이 바로 `/farms` 페이지로 이동합니다.

---

## 3. 프로젝트 구조

### 타입 정의
- `types/dto.ts` - 모든 DTO 타입 정의

### 유틸리티
- `lib/supabaseServer.ts` - Supabase 서버 접근 (fetch 기반)
- `lib/timeKst.ts` - KST 시간 변환
- `lib/offlineProfile.ts` - OFFLINE 프로필/캐시 (p95 기반)
- `lib/stateRules.ts` - WARN/DANGER/STATE 규칙

### API Routes (Backend2)
- `app/api/health/route.ts` - 헬스 체크
- `app/api/farms/summary/route.ts` - 농장 요약 (15초 폴링)
- `app/api/farms/[registNo]/detail/route.ts` - 농장 상세 (3초 폴링)
- `app/api/rooms/[key12]/route.ts` - 방 Full DTO
- `app/api/rooms/[key12]/logs/route.ts` - 방 로그

### 페이지
- `app/page.tsx` - 루트 (→ /farms 리다이렉트)
- `app/farms/page.tsx` - 농장 목록
- `app/farms/[registNo]/page.tsx` - 농장 상세
- `app/rooms/[key12]/page.tsx` - 방 상세

### 컴포넌트 (shadcn/ui)
- `components/shell/TopBar.tsx` - 상단 바
- `components/common/FreshnessBadge.tsx` - 최신성 배지
- `components/farms/KpiCards.tsx` - KPI 카드 (반응형)
- `components/farms/FarmSummaryTable.tsx` - 농장 목록 테이블
- `components/farms/FarmSummaryFilters.tsx` - 검색/정렬 필터
- `components/farms/StallTabs.tsx` - Stall 탭
- `components/rooms/RoomGrid.tsx` - 방 그리드
- `components/rooms/RoomCard.tsx` - 방 카드
- `components/rooms/RoomDetailDrawer.tsx` - 방 상세 Drawer
- `components/rooms/SensorsPanel.tsx` - 센서 패널
- `components/rooms/MotorsPanel.tsx` - 모터 패널
- `components/charts/RoomTrendChart.tsx` - 트렌드 차트

---

## 4. 주요 기능

### 데이터 접근
- **인증 없음**: 모든 API는 인증 없이 동작 (UI/UX 테스트 단계)
- **서비스 키 보호**: Supabase SERVICE_ROLE_KEY는 서버(API Routes)에서만 사용

### 시간대 처리
- 모든 시간 필드는 KST(+09:00) ISO 문자열로 반환
- `serverNowKst` 필드 포함

### 센서/모터 표시
- **센서**: ES01, ES02, ES03, ES04, ES09 배열 전체 표시
- **모터**: EC01 항상 포함, ventMode에 따라 EC02 또는 EC03 활성
- 비활성 모터는 null, activeVent 배열 제공

### 요약/상세 분리
- `/farms`: summary만 (15초 폴링)
- `/farms/[registNo]`: Lite (3초 폴링)
- RoomCard 클릭 시 Full DTO 로드

### OFFLINE 판정
- `room_state_log_v3.created_at` 기반 p95 계산
- 기본 임계값: 211초 (global p95=60.27s * 3 + 30)
- `room_raw_snapshot_v3.updated_at` 기반 freshnessSec 계산

---

## 5. UI 동작 확인 체크리스트

### 기본 플로우
1. ✅ **루트 페이지** (`/`) → `/farms`로 자동 리다이렉트
2. ✅ **농장 목록** (`/farms`)
   - KPI 카드 표시 (정상/경고/위험/오프라인)
   - 검색/정렬 필터 작동
   - 농장 테이블 표시
   - 15초 자동 갱신
3. ✅ **농장 상세** (`/farms/[registNo]`)
   - Stall 탭 전환 (1/2/3)
   - Room 그리드 표시 (20개)
   - 3초 자동 갱신
4. ✅ **Room Drawer**
   - RoomCard 클릭 시 Drawer 열림
   - 센서/모터 전체 표시
   - "방 상세 페이지 이동" 버튼
5. ✅ **방 상세** (`/rooms/[key12]`)
   - Full 정보 표시
   - 트렌드 차트 (최근 1시간/24시간)

### 반응형 확인
- 모바일 (< 640px): KpiCards 1열, Filters 세로 배치
- 태블릿 (640px - 1024px): KpiCards 2열
- 데스크톱 (> 1024px): KpiCards 4열

---

## 6. 주의사항

- **서비스 키 노출 금지**: `SUPABASE_SERVICE_ROLE_KEY`는 절대 브라우저/로그에 노출하지 마세요.
- **환경 변수**: `.env.local`은 `.gitignore`에 포함되어 있어 커밋되지 않습니다.
- **인증/권한**: 현재는 인증 없이 모든 데이터 접근 가능 (Phase 2에서 재설계 예정)

---

## 7. 문제 해결

### API 오류
- `.env.local` 파일이 올바르게 설정되었는지 확인
- Supabase 연결 확인 (`/api/health` 엔드포인트 테스트)

### 컴포넌트 오류
- `npm install` 실행
- TypeScript 타입 오류 확인
- 브라우저 콘솔 확인

### 빌드 오류
- `npm run build` 실행하여 에러 확인
- Tailwind CSS 설정 확인

---

## 8. 다음 단계 (Phase 2)

- 인증/권한 시스템 재설계
- 사용자별 데이터 접근 제한
- 로그인/로그아웃 기능