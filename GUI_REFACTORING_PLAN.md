# GUI 리팩토링 작업 계획

## 📋 작업 요청 사항

1. **농장 상태 비교 (상위 20개) 막대 그래프 삭제**
2. **히트맵을 도넛 차트와 통합**
3. **센서 상태 게이지의 원형을 선형화**

---

## 🎯 작업 계획

### 작업 1: 농장 상태 비교 막대 그래프 삭제

**대상 파일:**
- `app/farms/page.tsx`

**작업 내용:**
1. `StatusBarChart` import 제거
2. `StatusBarChart` dynamic import 제거
3. 히트맵과 막대 그래프를 함께 표시하는 그리드 레이아웃 제거
4. 히트맵만 단독으로 표시하도록 수정

**예상 변경:**
```typescript
// 삭제할 부분
const StatusBarChart = dynamic(() => import("@/components/charts/StatusBarChart"), {...});

// 삭제할 부분
<div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
  <FarmHeatmap ... />
  <StatusBarChart ... />  // 삭제
</div>

// 변경 후
<div className="mt-6">
  <FarmHeatmap ... />
</div>
```

---

### 작업 2: 히트맵을 도넛 차트와 통합

**대상 파일:**
- `components/farms/FarmOverviewHeader.tsx`
- `app/farms/page.tsx`

**작업 내용:**
1. `FarmOverviewHeader` 컴포넌트에 히트맵 추가
2. 도넛 차트와 히트맵을 나란히 배치 (PC: 2열 그리드, 모바일: 세로 배치)
3. `app/farms/page.tsx`에서 별도로 표시하던 히트맵 제거
4. 히트맵 클릭 시 농장 상세 페이지로 이동 기능 유지

**레이아웃 구조:**
```
FarmOverviewHeader
├── 마지막 갱신
├── 제목
├── 전체 요약 카드
└── 차트 영역 (PC: 2열 그리드)
    ├── 도넛 차트 (왼쪽)
    └── 히트맵 (오른쪽)
```

**예상 변경:**
```typescript
// FarmOverviewHeader.tsx
const FarmHeatmap = dynamic(() => import("@/components/charts/FarmHeatmap"), {
  ssr: false,
});

// 도넛 차트 영역을 그리드로 변경
<div className="hidden sm:grid sm:grid-cols-2 gap-6">
  <StatusPieChart ... />
  <FarmHeatmap farms={farms} onFarmClick={onFarmClick} />
</div>
```

---

### 작업 3: 센서 상태 게이지 원형 → 선형화

**대상 파일:**
- `components/charts/SensorGaugeChart.tsx`
- `components/charts/SensorGaugeGrid.tsx` (레이아웃 조정 필요할 수 있음)

**작업 내용:**
1. `RadialBarChart` (원형 게이지) 제거
2. 선형 프로그레스 바로 변경
3. 색상 구간 표시 (정상/경고/위험)
4. 현재 값 표시 및 임계값 표시 유지
5. 레이아웃 최적화 (카드 높이 조정)

**선형 게이지 디자인:**
```
┌─────────────────────────────┐
│  온도                        │
│  ┌─────────────────────┐   │
│  │███████████░░░░░░░░░░│   │ ← 프로그레스 바
│  │[정상][경고][위험]   │   │ ← 색상 구간
│  └─────────────────────┘   │
│  25.7 ℃                    │ ← 현재 값
│  경고: 28.0 / 위험: 32.0   │ ← 임계값
└─────────────────────────────┘
```

**구현 방식:**
- HTML/CSS 프로그레스 바 사용
- 또는 recharts의 `BarChart`를 수평으로 사용
- 색상 구간을 시각적으로 표시 (정상: 초록, 경고: 노랑, 위험: 빨강)

**예상 변경:**
```typescript
// SensorGaugeChart.tsx
// RadialBarChart 제거
// 선형 프로그레스 바로 교체

<div className="w-full">
  {/* 프로그레스 바 배경 */}
  <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
    {/* 색상 구간 표시 */}
    <div className="absolute inset-0 flex">
      <div 
        className="bg-green-500" 
        style={{ width: `${(thresholds.warn / max) * 100}%` }}
      />
      <div 
        className="bg-yellow-500" 
        style={{ width: `${((thresholds.danger - thresholds.warn) / max) * 100}%` }}
      />
      <div 
        className="bg-red-500" 
        style={{ width: `${((max - thresholds.danger) / max) * 100}%` }}
      />
    </div>
    {/* 현재 값 표시 */}
    <div 
      className="absolute top-0 h-full bg-black opacity-30"
      style={{ width: `${(value / max) * 100}%` }}
    />
  </div>
</div>
```

---

## 📐 작업 순서

### 1단계: 막대 그래프 삭제
- `app/farms/page.tsx`에서 `StatusBarChart` 관련 코드 제거
- 히트맵만 단독 표시
- 디버깅 및 빌드 검증

### 2단계: 히트맵을 도넛과 통합
- `FarmOverviewHeader`에 히트맵 추가
- 도넛 차트와 히트맵을 2열 그리드로 배치
- `app/farms/page.tsx`에서 별도 히트맵 제거
- 디버깅 및 빌드 검증

### 3단계: 센서 게이지 선형화
- `SensorGaugeChart`를 선형 프로그레스 바로 변경
- 색상 구간 및 현재 값 표시 구현
- 레이아웃 조정
- 디버깅 및 빌드 검증

### 4단계: 최종 검증
- 전체 빌드 검증
- Git 커밋 및 푸시

---

## 🎨 디자인 개선 사항

### 선형 게이지 장점
- ✅ 공간 효율적 (높이 감소)
- ✅ 값 비교 용이 (수평 정렬)
- ✅ 모바일에서 더 명확
- ✅ 임계값 구간 시각화 명확

### 히트맵 통합 장점
- ✅ 관련 정보를 한 곳에 집중
- ✅ 화면 공간 효율적 활용
- ✅ 도넛 차트와 히트맵의 상호 보완

---

## ⚠️ 주의사항

1. **반응형 디자인**: 모바일에서는 히트맵과 도넛 차트를 세로로 배치
2. **성능**: 히트맵이 많은 농장(99개)을 처리할 수 있도록 최적화
3. **접근성**: 선형 게이지도 색상뿐만 아니라 텍스트로 정보 제공
4. **일관성**: 기존 색상 체계 유지 (정상: 초록, 경고: 노랑, 위험: 빨강)

---

## 📊 예상 결과

### Before
- 원형 게이지 (높이 200px)
- 히트맵과 막대 그래프 분리
- 막대 그래프로 인한 화면 공간 사용

### After
- 선형 게이지 (높이 ~80px, 공간 절약)
- 도넛 차트와 히트맵 통합 (관련 정보 집중)
- 막대 그래프 제거 (화면 정리)

---

## 🚀 구현 시작 준비

모든 작업은 단계별로 진행하며, 각 단계 완료 시 디버깅을 수행합니다.
작업 완료 후 Git 푸시까지 진행합니다.
