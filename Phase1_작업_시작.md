# Phase 1: shadcn/ui 설정 및 기본 컴포넌트 마이그레이션

## 진행 상황

### ✅ 완료
1. shadcn/ui 의존성 설치
   - class-variance-authority
   - clsx
   - tailwind-merge
   - lucide-react

2. shadcn/ui 설정 파일 생성
   - `components.json` 생성
   - `lib/utils.ts` 생성 (cn 함수)

3. globals.css 업데이트
   - shadcn/ui CSS 변수 추가
   - Tailwind v4 호환

4. 기본 컴포넌트 설치
   - Button ✅
   - Card (진행 중)
   - Badge (진행 중)
   - Input (진행 중)
   - Select (진행 중)
   - Skeleton (진행 중)
   - Toast (진행 중)
   - Tabs (진행 중)

---

## 다음 단계

### 1. 컴포넌트 설치 완료 확인
- 모든 컴포넌트가 `components/ui/` 폴더에 생성되었는지 확인

### 2. 기본 컴포넌트 마이그레이션 시작

#### 우선순위 1: Button
- `components/shell/TopBar.tsx` - 로그아웃 버튼
- `components/farms/FarmSummaryFilters.tsx` - 필터 버튼 (있다면)
- `components/rooms/RoomDetailDrawer.tsx` - 닫기 버튼

#### 우선순위 2: Badge
- `components/common/FreshnessBadge.tsx`
- `components/rooms/RoomCard.tsx` - 상태 배지

#### 우선순위 3: Card
- `components/farms/KpiCards.tsx`
- `components/rooms/RoomCard.tsx`

---

## 마이그레이션 가이드

### Button 마이그레이션 예시

**Before:**
```typescript
<button
  onClick={handleLogout}
  className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
>
  로그아웃
</button>
```

**After:**
```typescript
import { Button } from "@/components/ui/button";

<Button
  onClick={handleLogout}
  variant="destructive"
  size="sm"
>
  로그아웃
</Button>
```

### Badge 마이그레이션 예시

**Before:**
```typescript
<span className="px-2 py-1 text-xs rounded bg-green-200 text-green-800">
  {state.toUpperCase()}
</span>
```

**After:**
```typescript
import { Badge } from "@/components/ui/badge";

<Badge variant={state === "normal" ? "default" : "destructive"}>
  {state.toUpperCase()}
</Badge>
```

### Card 마이그레이션 예시

**Before:**
```typescript
<div className="bg-white p-4 rounded-lg shadow">
  <div className="text-sm text-gray-600">정상</div>
  <div className="text-2xl font-bold text-green-600">{normal}</div>
</div>
```

**After:**
```typescript
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle className="text-sm">정상</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold text-green-600">{normal}</div>
  </CardContent>
</Card>
```

---

## 작업 체크리스트

### 설치
- [x] shadcn/ui 의존성
- [x] components.json
- [x] lib/utils.ts
- [x] globals.css 업데이트
- [ ] Button 컴포넌트
- [ ] Card 컴포넌트
- [ ] Badge 컴포넌트
- [ ] Input 컴포넌트
- [ ] Select 컴포넌트
- [ ] Skeleton 컴포넌트
- [ ] Toast 컴포넌트
- [ ] Tabs 컴포넌트

### 마이그레이션
- [ ] TopBar - Button
- [ ] FreshnessBadge - Badge
- [ ] RoomCard - Badge
- [ ] KpiCards - Card
- [ ] RoomCard - Card
- [ ] FarmSummaryFilters - Input/Select
- [ ] StallTabs - Tabs

---

## 예상 시간

- 컴포넌트 설치: 10분
- 기본 마이그레이션: 2-3시간
- 테스트: 30분

**총 예상 시간: 3-4시간**
