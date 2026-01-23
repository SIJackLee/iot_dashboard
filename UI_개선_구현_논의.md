# UI 개선 구현 논의

## 결정사항 요약

✅ **shadcn/ui 채택** - 디자인 시스템 통일
✅ **반응형:** 모바일/데스크톱/태블릿 모두 호환
✅ **다크모드:** 미적용
✅ **실시간 업데이트:** 현재 폴링 방식 유지
✅ **Pie 차트:** 도입

---

## Phase 1: shadcn/ui 설정 및 마이그레이션

### 1.1 shadcn/ui 초기 설정

**필요 작업:**
```bash
# 1. shadcn/ui 초기화
npx shadcn@latest init

# 2. 필수 컴포넌트 설치
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add table
npx shadcn@latest add badge
npx shadcn@latest add input
npx shadcn@latest add select
npx shadcn@latest add skeleton
npx shadcn@latest add toast
npx shadcn@latest add dialog
npx shadcn@latest add tabs
npx shadcn@latest add progress
```

**설정 파일:**
- `components.json` 생성 (자동)
- `tailwind.config.ts` 업데이트 (자동)
- `app/globals.css` 업데이트 (자동)

**논의 사항:**
- ✅ **스타일:** default (기본)
- ✅ **Base color:** slate
- ✅ **CSS variables:** yes
- ✅ **컴포넌트 경로:** `components/ui`

---

### 1.2 기존 컴포넌트 마이그레이션 전략

**우선순위별 마이그레이션:**

#### 1단계: 기본 컴포넌트 (즉시)
- **Button** → `components/shell/TopBar.tsx` (로그아웃 버튼)
- **Badge** → `components/common/FreshnessBadge.tsx`
- **Card** → `components/farms/KpiCards.tsx`
- **Card** → `components/rooms/RoomCard.tsx`

#### 2단계: 복잡한 컴포넌트
- **Table** → `components/farms/FarmSummaryTable.tsx`
- **Input/Select** → `components/farms/FarmSummaryFilters.tsx`
- **Tabs** → `components/farms/StallTabs.tsx`

#### 3단계: 새로운 컴포넌트
- **Skeleton** → 새로 생성 (로딩 상태)
- **Toast** → 새로 생성 (알림 시스템)
- **Dialog** → `components/rooms/RoomDetailDrawer.tsx` (선택적)

**마이그레이션 원칙:**
- 기존 기능 유지
- 점진적 마이그레이션 (한 번에 하나씩)
- 스타일은 shadcn/ui 기본 사용, 필요시 커스터마이징

---

## Phase 2: 핵심 UX 개선

### 2.1 스켈레톤 UI 구현

**구현할 스켈레톤:**

1. **FarmSummaryTableSkeleton**
   ```typescript
   // 8개 행, 각 행에 8개 셀
   // 테이블 헤더 포함
   ```

2. **RoomCardSkeleton**
   ```typescript
   // 카드 형태, 4열 그리드
   // 제목, 배지, 정보 영역
   ```

3. **KpiCardSkeleton**
   ```typescript
   // 4개 카드, 각 카드에 제목 + 숫자 영역
   ```

4. **RoomGridSkeleton**
   ```typescript
   // 4열 그리드, 각 카드 스켈레톤
   ```

**논의 사항:**
- ✅ **애니메이션:** shadcn/ui Skeleton 기본 사용 (펄스 효과)
- ✅ **개수:** 실제 데이터와 동일한 개수 표시
- ✅ **레이아웃:** 실제 컴포넌트와 동일한 구조

---

### 2.2 빈 상태 (Empty State) 처리

**구현할 EmptyState 컴포넌트:**

```typescript
interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
}
```

**사용 시나리오:**
1. **농장 목록 없음**
   - 제목: "농장이 없습니다"
   - 설명: "등록된 농장이 없습니다."
   - 액션: 없음

2. **필터 결과 없음**
   - 제목: "검색 결과가 없습니다"
   - 설명: "다른 검색어를 시도해보세요."
   - 액션: "필터 초기화" 버튼

3. **로그 데이터 없음**
   - 제목: "로그 데이터가 없습니다"
   - 설명: "선택한 기간에 데이터가 없습니다."
   - 액션: "기간 변경" 버튼

**논의 사항:**
- ✅ **아이콘:** lucide-react 사용 (Inbox, Search, FileText)
- ✅ **스타일:** shadcn/ui Card 기반
- ✅ **위치:** 테이블/그리드 대신 표시

---

### 2.3 에러 처리 개선

**구현할 ErrorDisplay 컴포넌트:**

```typescript
interface ErrorDisplayProps {
  error: Error | string;
  type?: 'network' | 'api' | 'parse' | 'unknown';
  onRetry?: () => void;
}
```

**에러 타입별 UI:**
- **네트워크 에러:** "연결할 수 없습니다" + 재시도 버튼
- **API 에러 (401/403):** "권한이 없습니다" + 로그인 페이지로 이동
- **API 에러 (500):** "서버 오류가 발생했습니다" + 재시도 버튼
- **파싱 에러:** "데이터를 불러올 수 없습니다" + 재시도 버튼

**논의 사항:**
- ✅ **에러 바운더리:** React ErrorBoundary 사용 여부?
- ✅ **재시도 로직:** 자동 재시도 (지수 백오프) vs 수동 재시도
- ✅ **에러 로깅:** 콘솔만 vs 에러 리포팅 서비스

---

## Phase 3: 반응형 디자인

### 3.1 모바일 최적화 전략

**브레이크포인트:**
- **Mobile:** < 640px (sm 미만)
- **Tablet:** 640px - 1024px (sm - lg)
- **Desktop:** > 1024px (xl+)

**컴포넌트별 반응형 처리:**

1. **FarmSummaryTable**
   - Mobile: 카드 뷰 (각 행을 카드로)
   - Tablet: 가로 스크롤 또는 카드 뷰
   - Desktop: 전체 테이블

2. **RoomGrid**
   - Mobile: 1열
   - Tablet: 2열
   - Desktop: 4열

3. **KpiCards**
   - Mobile: 1열 (세로 스택)
   - Tablet: 2열
   - Desktop: 4열

4. **TopBar**
   - Mobile: 햄버거 메뉴 (선택적)
   - Tablet/Desktop: 현재 유지

**논의 사항:**
- ✅ **테이블 모바일:** 카드 뷰로 변환 vs 가로 스크롤
- ✅ **네비게이션:** 모바일 메뉴 필요 여부 (현재는 단순하므로 불필요할 수 있음)
- ✅ **터치 타겟:** 최소 44x44px 유지

---

### 3.2 테이블 반응형 구현

**옵션 A: 카드 뷰 변환 (권장)**
```typescript
// Mobile에서 테이블을 카드로 변환
{isMobile ? (
  <FarmSummaryCards items={items} />
) : (
  <FarmSummaryTable items={items} />
)}
```

**옵션 B: 가로 스크롤**
```typescript
// 테이블을 감싸는 스크롤 컨테이너
<div className="overflow-x-auto">
  <FarmSummaryTable items={items} />
</div>
```

**논의 사항:**
- ✅ **선택:** 옵션 A (카드 뷰) - 모바일 UX가 더 좋음
- ✅ **구현:** `FarmSummaryCards` 컴포넌트 새로 생성
- ✅ **데이터:** 동일한 데이터, 다른 레이아웃만

---

## Phase 4: Pie 차트 도입

### 4.1 Pie 차트 구현

**Recharts Pie 차트 사용:**

```typescript
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
```

**구현할 차트:**

1. **전체 상태 분포 Pie 차트**
   - `/farms` 페이지
   - 정상/경고/위험/오프라인 비율
   - KPI 카드 옆 또는 별도 섹션

2. **농장별 상태 분포 Pie 차트**
   - `/farms/[registNo]` 페이지
   - 해당 농장의 상태 분포

**차트 스타일:**
- **색상:** 정상(녹색), 경고(노랑), 위험(빨강), 오프라인(회색)
- **크기:** 반응형 (모바일 작게, 데스크톱 크게)
- **인터랙티브:** 툴팁, 클릭 가능 (선택적)

**논의 사항:**
- ✅ **위치:** KPI 카드 아래 또는 옆?
- ✅ **크기:** 고정 크기 vs 반응형
- ✅ **인터랙티브:** 클릭 시 필터 적용 여부

---

### 4.2 기존 차트 개선

**RoomTrendChart 개선:**
- 색상 팔레트 통일 (shadcn/ui 색상 사용)
- 반응형 크기 조정
- 툴팁 스타일 개선
- 범례 위치 조정

**논의 사항:**
- ✅ **색상:** shadcn/ui 기본 색상 사용
- ✅ **애니메이션:** 기본 애니메이션 유지

---

## Phase 5: 기능 개선

### 5.1 필터링/검색 개선

**현재:** 기본 검색 + 정렬

**개선 사항:**
1. **상태별 필터 (다중 선택)**
   - Checkbox 그룹
   - 정상/경고/위험/오프라인

2. **필터 칩 표시**
   - 활성 필터를 칩으로 표시
   - 각 칩에 X 버튼 (제거)

3. **필터 초기화 버튼**
   - 모든 필터 제거

**논의 사항:**
- ✅ **UI:** shadcn/ui Checkbox + Badge 사용
- ✅ **위치:** FarmSummaryFilters 컴포넌트 내
- ✅ **상태 관리:** URL 쿼리 파라미터 vs 로컬 상태

---

### 5.2 테이블 기능 개선

**추가 기능:**
1. **컬럼별 정렬**
   - 클릭 시 오름차순/내림차순 토글
   - 정렬 아이콘 표시

2. **페이지네이션**
   - 100개 이상일 때만 표시
   - 페이지 크기 선택 (10/25/50/100)

3. **CSV 내보내기**
   - 현재 필터된 데이터만 내보내기
   - 버튼 위치: 테이블 상단 우측

**논의 사항:**
- ✅ **정렬:** 모든 컬럼 vs 특정 컬럼만
- ✅ **페이지네이션:** 서버 사이드 vs 클라이언트 사이드
- ✅ **CSV:** 현재는 클라이언트 사이드로 충분

---

### 5.3 실시간 업데이트 피드백

**구현 사항:**
1. **새로고침 인디케이터**
   - 상단에 작은 스피너/배지
   - "업데이트 중..." 텍스트

2. **마지막 업데이트 시간**
   - 상대 시간 표시 ("방금 전", "1분 전")
   - TopBar 또는 페이지 상단

3. **변경된 항목 하이라이트**
   - 새로 업데이트된 카드/행에 펄스 효과
   - 3초 후 사라짐

**논의 사항:**
- ✅ **인디케이터 위치:** TopBar vs 페이지 상단
- ✅ **하이라이트:** 모든 변경 vs 중요한 변경만
- ✅ **애니메이션:** 펄스 효과 vs 배경색 변경

---

## Phase 6: 알림 시스템

### 6.1 Toast 알림 구현

**shadcn/ui Toast 사용:**

```typescript
import { useToast } from "@/hooks/use-toast";
```

**사용 시나리오:**
1. **로그인 성공/실패**
2. **데이터 저장 성공/실패**
3. **에러 발생 시**
4. **필터 적용 시** (선택적)

**Toast 타입:**
- Success (녹색)
- Error (빨강)
- Warning (노랑)
- Info (파랑)

**논의 사항:**
- ✅ **위치:** 상단 우측 (기본)
- ✅ **자동 닫기:** 3초
- ✅ **스택:** 최대 3개까지 표시

---

## 구현 순서 제안

### Week 1: 기반 구축
1. **Day 1:** shadcn/ui 설정 + 기본 컴포넌트 설치
2. **Day 2:** Button, Badge, Card 마이그레이션
3. **Day 3:** Table, Input, Select 마이그레이션
4. **Day 4:** Skeleton UI 구현
5. **Day 5:** 테스트 및 버그 수정

### Week 2: UX 개선
1. **Day 1:** 빈 상태 처리
2. **Day 2:** 에러 처리 개선
3. **Day 3:** 반응형 디자인 (모바일)
4. **Day 4:** 반응형 디자인 (태블릿)
5. **Day 5:** 테스트 및 버그 수정

### Week 3: 시각화 및 기능
1. **Day 1:** Pie 차트 구현
2. **Day 2:** 차트 개선
3. **Day 3:** 필터링 개선
4. **Day 4:** 테이블 기능 개선 + 실시간 피드백
5. **Day 5:** Toast 알림 + 최종 테스트

---

## 논의 필요 사항

### 1. 마이그레이션 전략
**질문:** 기존 컴포넌트를 한 번에 교체할지, 점진적으로 교체할지?
- **옵션 A:** 점진적 (한 번에 하나씩, 안정적)
- **옵션 B:** 한 번에 (빠르지만 리스크 있음)
- **제안:** 옵션 A (점진적)

### 2. 테이블 모바일 처리
**질문:** 카드 뷰 vs 가로 스크롤?
- **제안:** 카드 뷰 (UX가 더 좋음)

### 3. 필터 상태 관리
**질문:** URL 쿼리 vs 로컬 상태?
- **제안:** 로컬 상태 (간단함), 필요시 URL 쿼리로 확장

### 4. Pie 차트 위치
**질문:** KPI 카드 옆 vs 아래 vs 별도 섹션?
- **제안:** KPI 카드 아래 (가독성 좋음)

### 5. 실시간 피드백
**질문:** 모든 변경 하이라이트 vs 중요한 변경만?
- **제안:** 중요한 변경만 (위험/경고 상태 변경)

---

## 다음 단계

1. **shadcn/ui 설치 시작** (즉시 가능)
2. **Phase 1 작업 진행**
3. **단계별 리뷰 및 피드백**

---

## 참고

- [shadcn/ui 설치 가이드](https://ui.shadcn.com/docs/installation)
- [Recharts Pie Chart 예제](https://recharts.org/en-US/examples/PieChartWithCustomizedLabel)
- [Tailwind CSS 반응형 디자인](https://tailwindcss.com/docs/responsive-design)
