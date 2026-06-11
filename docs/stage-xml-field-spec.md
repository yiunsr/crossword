# `stage.xml` 필드 명세서

## 문서 목적
이 문서는 한국어 십자말 풀이 게임에서 사용하는 `stage.xml`의 최종 구조와 각 필드의 의미를 정의한다.

`stage.xml`은 완성된 퍼즐 배치 파일이 아니라, 퍼즐 생성 조건을 저장하는 파일이다.

저장 대상은 다음과 같다.

- 스테이지 메타 정보
- 사전 버전
- 보드 크기
- 플레이 단어 수 목표
- 허용 카테고리
- 허용 등급
- 필수 단어 4개와 그룹 구조
- 랜덤 단어 정책
- seed 정책

연결단어와 leaf단어의 개수는 `stage.xml`에 미리 저장하지 않는다. 이 둘은 실제 퍼즐 생성 후 각 단어의 교차수에 따라 결정된다.

---

## 설계 원칙
1. 같은 `stage + dictionaryVersion + seed` 조합이면 동일한 퍼즐 생성 결과를 기대할 수 있어야 한다.
2. 필수 단어는 항상 4개이며, 2개 그룹으로 저장한다.
3. 필수 단어 4개 중 1개는 반드시 `고사성어`이다.
4. 플레이 단어 수는 목표값 1개와 자동 허용 범위만 저장한다.
5. 허용 등급은 범위가 아니라 멀티 선택된 등급 목록으로 저장한다.
6. 연결단어 / leaf단어 분류는 `stage.xml`이 아니라 최종 배치 결과로 판정한다.

---

## 최상위 구조
```xml
<stage>
  <meta />
  <dictionary />
  <board />
  <playWords />
  <categories />
  <grades />
  <requiredGroups />
  <randomWordPolicy />
  <seedPolicy />
</stage>
```

---

## 1. `<meta>`
스테이지의 기본 메타 정보.

### 예시
```xml
<meta
  id="stage-025"
  level="25"
  title="stage-025"
  version="1.0"
/>
```

### 속성
- `id`: 스테이지 고유 식별자. 예: `stage-025`
- `level`: 스테이지 번호. 예: `25`
- `title`: 표시용 이름. 예: `stage-025`
- `version`: stage 파일 형식 버전. 예: `1.0`

---

## 2. `<dictionary>`
퍼즐 생성에 사용하는 사전 버전.

### 예시
```xml
<dictionary version="v0001" />
```

### 속성
- `version`: 사전 데이터 버전. 같은 seed라도 사전 버전이 다르면 결과가 달라질 수 있으므로 필수.

---

## 3. `<board>`
퍼즐 보드의 크기.

### 예시
```xml
<board rows="10" columns="10" />
```

### 속성
- `rows`: 행 수
- `columns`: 열 수

---

## 4. `<playWords>`
플레이 단어 수의 목표값과 자동 허용 범위.

### 예시
```xml
<playWords target="9" range="1" />
```

### 속성
- `target`: 목표 플레이 단어 수
- `range`: 자동 허용 범위

### 해석
- `target="9" range="1"` 이면 실제 허용 범위는 `8 ~ 10`
- 생성 엔진은 이 범위 안에서 전체 단어 수를 맞춘다.
- 연결단어 수와 leaf단어 수는 이 안에서 동적으로 결정된다.

---

## 5. `<categories>`
허용 카테고리 목록.

### 예시
```xml
<categories>
  <category name="일상" />
  <category name="과학" />
  <category name="경제" />
  <category name="고사성어" />
</categories>
```

### 역할
- 필수 단어 후보군 제한
- 랜덤 단어 후보군 제한
- 기타 추가 단어 후보군 제한

### 특별 규칙
- `고사성어`는 필수 단어 4개 중 1개를 보장하기 위해 포함되어야 한다.

---

## 6. `<grades>`
허용 가능한 단어 등급 목록.

### 예시
```xml
<grades>
  <grade value="1" />
  <grade value="2" />
  <grade value="3" />
</grades>
```

### 역할
- 필수 단어 추천 시 허용 등급 제한
- 랜덤 단어 선택 시 허용 등급 제한
- 기타 추가 단어 선택 시 허용 등급 제한

### 허용값
- `1`
- `2`
- `3`
- `4`

---

## 7. `<requiredGroups>`
필수 단어 4개를 2개 그룹으로 저장한다.

### 예시
```xml
<requiredGroups>
  <group id="A">
    <word text="타산지석" category="고사성어" grade="3" />
    <word text="타이어" category="일상" grade="1" />
  </group>
  <group id="B">
    <word text="기온" category="과학" grade="1" />
    <word text="기차" category="일상" grade="1" />
  </group>
</requiredGroups>
```

### 역할
- 필수 단어 4개를 고정한다.
- 각 그룹의 2개 단어는 추천 시점에서 실제 교차 가능해야 한다.
- 생성 엔진은 이 그룹 구조를 시작점으로 레이아웃을 구성한다.

### `<group>` 속성
- `id`: 그룹 식별자. 예: `A`, `B`

### `<word>` 속성
- `text`: 단어 문자열
- `category`: 단어 카테고리
- `grade`: 단어 등급

---

## 8. `<randomWordPolicy>`
seed 기반으로 선택되는 랜덤 단어 정책.

### 예시
```xml
<randomWordPolicy count="1" />
```

### 속성
- `count`: 랜덤 단어 개수. 현재는 `1`로 고정

### 역할
- 필수 단어 외에 seed를 이용해 선택되는 단어 수를 정의한다.
- 선택된 랜덤 단어는 실제 배치 결과에 따라 연결단어 또는 leaf단어가 될 수 있다.

---

## 9. `<seedPolicy>`
seed 기본값과 허용 범위.

### 예시
```xml
<seedPolicy defaultSeed="27" min="0" max="100" />
```

### 속성
- `defaultSeed`: 기본 seed 값
- `min`: 최소 seed 값
- `max`: 최대 seed 값

### 역할
- 같은 stage / dictionary / seed 조합에서 동일한 생성 결과를 재현하는 기준값

---

## 단어 분류 규칙
`stage.xml`은 필수단어만 직접 저장한다. 나머지 단어 분류는 생성 결과로 판정한다.

- `필수단어`: `requiredGroups`에 저장된 단어
- `연결단어`: 최종 배치에서 교차수 2개 이상인 단어
- `leaf단어`: 최종 배치에서 교차수 1개인 단어

즉 연결단어와 leaf단어는 `stage.xml`의 사전 설정 항목이 아니라 퍼즐 생성 결과이다.

---

## 최종 예시
```xml
<?xml version="1.0" encoding="UTF-8"?>
<stage>
  <meta
    id="stage-025"
    level="25"
    title="stage-025"
    version="1.0"
  />

  <dictionary version="v0001" />

  <board rows="10" columns="10" />

  <playWords target="9" range="1" />

  <categories>
    <category name="일상" />
    <category name="과학" />
    <category name="경제" />
    <category name="고사성어" />
  </categories>

  <grades>
    <grade value="1" />
    <grade value="2" />
    <grade value="3" />
  </grades>

  <requiredGroups>
    <group id="A">
      <word text="타산지석" category="고사성어" grade="3" />
      <word text="타이어" category="일상" grade="1" />
    </group>
    <group id="B">
      <word text="기온" category="과학" grade="1" />
      <word text="기차" category="일상" grade="1" />
    </group>
  </requiredGroups>

  <randomWordPolicy count="1" />

  <seedPolicy defaultSeed="27" min="0" max="100" />
</stage>
```
