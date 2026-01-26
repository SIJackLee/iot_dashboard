# 상태 분포/히트맵 토글 방식 구현 계획

## 📋 작업 요청 사항

**상태 분포(도넛 차트)와 농장 상태 히트맵을 토글해서 보는 방식으로 변경**

---

## 🎯 구현 방안

### 방안 1: 탭(Tabs) 방식 ⭐⭐⭐ (권장)

**장점:**
- ✅ 직관적이고 사용하기 쉬움
- ✅ 이미 프로젝트에서 사용 중 (일관성)
- ✅ 접근성 좋음 (키보드 네비게이션 지원)
- ✅ 모바일에서도 사용하기 편함

**구현 방식:**
```typescript
<Tabs defaultValue="pie" className="w-full">
  <TabsList>
    <TabsTrigger value="pie">상태 분포</TabsTrigger>
    <TabsTrigger value="heatmap">농장 상태 히트맵</TabsTrigger>
  </TabsList>
  <TabsContent value="pie">
    <StatusPieChart ... />
  </TabsContent>
  <TabsContent value="heatmap">
    <FarmHeatmap ... />
  </TabsContent>
</Tabs>
```

**레이아웃:**
```
┌─────────────────────────────────┐
│ [상태 분포] [농장 상태 히트맵] │ ← 탭 버튼
├─────────────────────────────────┤
│                                 │
│     선택된 차트 (전체 너비)     │
│                                 │
└─────────────────────────────────┘
```

---

### 방안 2: 버튼 토글 방식 ⭐⭐

**장점:**
- ✅ 간단한 구현
- ✅ 커스터마이징 용이

**단점:**
- ⚠️ 탭보다 덜 직관적
- ⚠️ 접근성 고려 필요

**구현 방식:**
```typescript
<div className="flex gap-2 mb-4">
  <Button 
    variant={activeView === "pie" ? "default" : "outline"}
    onClick={() => setActiveView("pie")}
  >
    상태 분포
  </Button>
  <Button 
    variant={activeView === "heatmap" ? "default" : "outline"}
    onClick={() => setActiveView("heatmap")}
  >
    농장 상태 히트맵
  </Button>
</div>
{activeView === "pie" ? <StatusPieChart ... /> : <FarmHeatmap ... />}
```

---

### 방안 3: 아이콘 버튼 토글 ⭐

**장점:**
- ✅ 공간 절약
- ✅ 모던한 UI

**단점:**
- ⚠️ 명확성 부족 (아이콘만으로는 의미 파악 어려움)
- ⚠️ 텍스트 라벨 필요

---

## 🎨 권장 구현: 탭(Tabs) 방식

### 디자인 상세

#### PC 레이아웃
```
┌─────────────────────────────────────────────┐
│  전체 요약 카드                              │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│  [상태 분포] [농장 상태 히트맵]             │ ← 탭
├─────────────────────────────────────────────┤
│                                             │
│        선택된 차트 (전체 너비)              │
│        (높이: 도넛 260px, 히트맵 400px)    │
│                                             │
└─────────────────────────────────────────────┘
```

#### 모바일 레이아웃
```
┌─────────────────────┐
│  핵심 요약 카드       │
└─────────────────────┘
┌─────────────────────┐
│ [상태] [히트맵]     │ ← 탭 (작은 크기)
├─────────────────────┤
│                     │
│   선택된 차트        │
│   (전체 너비)        │
│                     │
└─────────────────────┘
```

---

## 📐 구현 세부사항

### 1. 기본값 설정
- **기본 탭**: "상태 분포" (도넛 차트)
- 이유: 상태 분포가 더 일반적으로 사용되는 뷰

### 2. 상태 관리
- `useState`로 현재 선택된 탭 관리
- 또는 `Tabs` 컴포넌트의 `defaultValue` 사용

### 3. 반응형 디자인
- PC: 탭 버튼 크기 적절히
- 모바일: 탭 버튼 크기 조정 (텍스트 크기, 패딩)

### 4. 애니메이션
- 탭 전환 시 부드러운 페이드 효과 (선택사항)
- `TabsContent`에 transition 적용

---

## 🔧 구현 코드 예시

### FarmOverviewHeader.tsx 수정

```typescript
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";

// 컴포넌트 내부
const [activeTab, setActiveTab] = useState("pie");

// 렌더링 부분
<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
  <TabsList className="grid w-full grid-cols-2 mb-4">
    <TabsTrigger value="pie" className="text-sm sm:text-base">
      상태 분포
    </TabsTrigger>
    <TabsTrigger value="heatmap" className="text-sm sm:text-base">
      농장 상태 히트맵
    </TabsTrigger>
  </TabsList>
  <TabsContent value="pie" className="mt-0">
    <StatusPieChart
      title="상태 분포"
      data={statusPieData}
      selectedIds={statusFilter}
      onSelect={onStatusSelect}
    />
  </TabsContent>
  <TabsContent value="heatmap" className="mt-0">
    {farms && farms.length > 0 ? (
      <FarmHeatmap
        farms={farms}
        onFarmClick={onFarmClick}
      />
    ) : (
      <div className="text-center text-gray-500 py-10">
        농장 데이터가 없습니다.
      </div>
    )}
  </TabsContent>
</Tabs>
```

---

## 📊 비교: 현재 vs 토글 방식

### 현재 (2열 그리드)
- ✅ 두 차트를 동시에 볼 수 있음
- ❌ 화면 공간 많이 사용
- ❌ 각 차트가 작아짐 (50% 너비)
- ❌ 모바일에서 가독성 저하

### 토글 방식
- ✅ 화면 공간 효율적
- ✅ 선택한 차트를 크게 볼 수 있음 (100% 너비)
- ✅ 모바일에서 더 나은 UX
- ❌ 두 차트를 동시에 볼 수 없음

---

## 🎯 사용자 경험 개선

### 장점
1. **공간 효율**: 차트를 전체 너비로 표시
2. **가독성 향상**: 큰 차트로 더 명확한 정보 파악
3. **모바일 최적화**: 작은 화면에서도 편리
4. **선택적 집중**: 원하는 정보에 집중 가능

### 고려사항
1. **기본값**: 상태 분포를 기본으로 설정 (더 자주 사용)
2. **전환 속도**: 탭 전환이 즉각적이어야 함
3. **상태 유지**: 페이지 새로고침 시 기본 탭으로 리셋 (또는 localStorage 사용)

---

## 🚀 구현 순서

1. **Tabs 컴포넌트 import 추가**
2. **useState로 탭 상태 관리** (또는 Tabs의 내부 상태 사용)
3. **2열 그리드 제거, Tabs로 교체**
4. **각 차트를 TabsContent로 감싸기**
5. **반응형 스타일 조정**
6. **디버깅 및 빌드 검증**
7. **Git 커밋 및 푸시**

---

## 💡 추가 개선 아이디어 (선택사항)

### 1. 아이콘 추가
```typescript
<TabsTrigger value="pie">
  <PieChart className="h-4 w-4 mr-2" />
  상태 분포
</TabsTrigger>
<TabsTrigger value="heatmap">
  <Grid className="h-4 w-4 mr-2" />
  농장 상태 히트맵
</TabsTrigger>
```

### 2. 통계 요약 표시
각 탭에 해당하는 요약 정보를 함께 표시

### 3. 키보드 단축키
- `1`: 상태 분포
- `2`: 히트맵

---

## 📝 결론

**권장 방안: 탭(Tabs) 방식**

- ✅ 가장 직관적이고 사용하기 쉬움
- ✅ 프로젝트의 기존 패턴과 일관성
- ✅ 접근성 및 모바일 최적화
- ✅ 구현이 간단하고 유지보수 용이

**기본값**: "상태 분포" (도넛 차트)

**레이아웃**: 전체 너비 사용, 탭으로 전환
