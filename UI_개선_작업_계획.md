# UI 개선 작업 계획

## 결정사항

1. ✅ **디자인 시스템:** shadcn/ui 채택
2. ✅ **반응형:** 모바일 & 데스크톱 & 태블릿 호환
3. ✅ **다크모드:** 미적용
4. ✅ **실시간 업데이트:** 현재 폴링 방식 유지 (15초/3초)
5. ✅ **차트:** Pie 차트 도입

---

## Phase 1: shadcn/ui 설정 및 기본 컴포넌트 마이그레이션

### 1.1 shadcn/ui 초기 설정

**작업 내용:**
- shadcn/ui 설치 및 설정
- `components.json` 생성
- 필요한 컴포넌트 설치

**필요한 컴포넌트:**
- Button
- Card
- Table
- Badge
- Input
- Select
- Skeleton
- Toast (알림)
- Dialog (모달)
- Tabs
- Progress

**예상 시간:** 1-2시간

---

### 1.2 기존 컴포넌트 마이그레이션

**우선순위:**
1. **Button** - 로그아웃, 필터 버튼 등
2. **Card** - KpiCards, RoomCard
3. **Table** - FarmSummaryTable
4. **Badge** - FreshnessBadge, 상태 배지
5. **Skeleton** - 로딩 상태
6. **Input/Select** - FarmSummaryFilters
7. **Tabs** - StallTabs
8. **Toast** - 알림 시스템

**예상 시간:** 3-4시간

---

## Phase 2: 핵심 UX 개선

### 2.1 로딩 상태 개선 (스켈레톤 UI)

**구현 항목:**
- `FarmSummaryTableSkeleton` - 테이블 스켈레톤
- `RoomCardSkeleton` - 카드 스켈레톤
- `KpiCardSkeleton` - KPI 카드 스켈레톤
- `RoomGridSkeleton` - 그리드 스켈레톤

**사용 위치:**
- `/farms` 페이지: 테이블 로딩
- `/farms/[registNo]` 페이지: 그리드 로딩
- `/rooms/[key12]` 페이지: 상세 정보 로딩

**예상 시간:** 2-3시간

---

### 2.2 빈 상태 (Empty State) 처리

**구현 항목:**
- `EmptyState` 컴포넌트 (shadcn/ui 기반)
- 필터 결과 없음 상태
- 데이터 없음 상태
- 에러 상태

**사용 위치:**
- 농장 목록이 비어있을 때
- 필터 결과가 없을 때
- 로그 데이터가 없을 때

**예상 시간:** 1-2시간

---

### 2.3 에러 처리 개선

**구현 항목:**
- `ErrorBoundary` 컴포넌트
- 에러 타입별 UI (네트워크, API, 파싱)
- 재시도 버튼
- 친화적인 에러 메시지

**예상 시간:** 2-3시간

---

## Phase 3: 반응형 디자인 개선

### 3.1 모바일 최적화

**작업 내용:**
- 테이블 → 카드 뷰 변환 (모바일)
- 그리드 반응형 (4열 → 2열 → 1열)
- 네비게이션 모바일 메뉴
- 터치 친화적 버튼 크기

**브레이크포인트:**
- Mobile: < 640px (sm)
- Tablet: 640px - 1024px (md-lg)
- Desktop: > 1024px (xl+)

**예상 시간:** 4-5시간

---

### 3.2 테이블 반응형 처리

**작업 내용:**
- 모바일: 카드 뷰로 자동 변환
- 태블릿: 가로 스크롤 또는 카드 뷰
- 데스크톱: 전체 테이블 표시

**예상 시간:** 2-3시간

---

## Phase 4: 데이터 시각화 개선

### 4.1 Pie 차트 도입

**구현 항목:**
- Recharts Pie 차트 컴포넌트
- 상태 분포 Pie 차트 (정상/경고/위험/오프라인)
- 농장별 상태 분포 비교
- 인터랙티브 툴팁

**사용 위치:**
- `/farms` 페이지: 전체 상태 분포
- `/farms/[registNo]` 페이지: 농장별 상태 분포
- KPI 카드 옆 또는 별도 섹션

**예상 시간:** 2-3시간

---

### 4.2 기존 차트 개선

**작업 내용:**
- RoomTrendChart 스타일 개선
- 색상 팔레트 통일
- 반응형 크기 조정
- 애니메이션 효과

**예상 시간:** 1-2시간

---

## Phase 5: 기능 개선

### 5.1 필터링/검색 개선

**구현 항목:**
- 상태별 필터 (다중 선택)
- 필터 칩 표시 (활성 필터)
- 필터 초기화 버튼
- 검색 하이라이트

**예상 시간:** 2-3시간

---

### 5.2 테이블 기능 개선

**구현 항목:**
- 컬럼별 정렬 (클릭)
- 페이지네이션 (100개 이상 시)
- CSV 내보내기 버튼

**예상 시간:** 2-3시간

---

### 5.3 실시간 업데이트 피드백

**구현 항목:**
- 상단 새로고침 인디케이터
- 마지막 업데이트 시간 표시 (상대 시간)
- 변경된 항목 하이라이트 (펄스 효과)

**예상 시간:** 2-3시간

---

## Phase 6: 알림 시스템

### 6.1 Toast 알림 구현

**구현 항목:**
- shadcn/ui Toast 컴포넌트 설정
- 성공/에러/경고 토스트
- 자동 닫기 타이머
- 위치 설정 (상단 우측)

**사용 시나리오:**
- 로그인 성공/실패
- 데이터 저장 성공/실패
- 에러 발생 시

**예상 시간:** 1-2시간

---

## 작업 순서 및 일정

### Week 1: 기반 구축
- **Day 1-2:** shadcn/ui 설정 및 기본 컴포넌트 마이그레이션
- **Day 3-4:** 로딩 상태, 빈 상태, 에러 처리
- **Day 5:** 테스트 및 버그 수정

### Week 2: 반응형 및 시각화
- **Day 1-2:** 반응형 디자인 개선
- **Day 3:** Pie 차트 도입
- **Day 4:** 차트 개선
- **Day 5:** 테스트 및 버그 수정

### Week 3: 기능 개선
- **Day 1-2:** 필터링/검색 개선
- **Day 3:** 테이블 기능 개선
- **Day 4:** 실시간 업데이트 피드백
- **Day 5:** 알림 시스템 및 최종 테스트

---

## 기술 스택 추가

### 패키지 설치
```bash
# shadcn/ui (자동 설치됨)
# Recharts (이미 설치됨)
# 추가 필요 없음
```

### 의존성
- `class-variance-authority` - shadcn/ui 내부 사용
- `clsx` - className 유틸리티
- `tailwind-merge` - Tailwind 클래스 병합
- `lucide-react` - 아이콘 (shadcn/ui 기본)

---

## 디자인 가이드라인

### 색상 팔레트
- **정상:** Green (green-500, green-600)
- **경고:** Yellow (yellow-500, yellow-600)
- **위험:** Red (red-500, red-600)
- **오프라인:** Gray (gray-400, gray-500)
- **기본:** Blue (blue-500, blue-600)

### 타이포그래피
- **제목:** text-2xl, font-bold
- **부제목:** text-xl, font-semibold
- **본문:** text-sm, text-base
- **캡션:** text-xs

### 간격
- **컨테이너:** container mx-auto px-4 py-6
- **카드 간격:** gap-4
- **섹션 간격:** mb-6

### 그림자
- **카드:** shadow
- **호버:** hover:shadow-md
- **모달:** shadow-lg

---

## 체크리스트

### Phase 1: shadcn/ui 설정
- [ ] shadcn/ui 초기화
- [ ] components.json 설정
- [ ] 기본 컴포넌트 설치
- [ ] 기존 컴포넌트 마이그레이션

### Phase 2: 핵심 UX
- [ ] 스켈레톤 UI 구현
- [ ] 빈 상태 처리
- [ ] 에러 처리 개선

### Phase 3: 반응형
- [ ] 모바일 최적화
- [ ] 테이블 반응형 처리
- [ ] 그리드 반응형 처리

### Phase 4: 시각화
- [ ] Pie 차트 구현
- [ ] 기존 차트 개선

### Phase 5: 기능
- [ ] 필터링 개선
- [ ] 테이블 기능 개선
- [ ] 실시간 피드백

### Phase 6: 알림
- [ ] Toast 시스템 구현

---

## 다음 단계

1. **shadcn/ui 설치 및 설정 시작**
2. **Phase 1 작업 진행**
3. **단계별 테스트 및 피드백**

---

## 참고 자료

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [shadcn/ui Components](https://ui.shadcn.com/docs/components)
- [Recharts Pie Chart](https://recharts.org/en-US/api/PieChart)
- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
