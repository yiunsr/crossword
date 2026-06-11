# `stage.xml` 필드 명세서

## 문서 목적
이 문서는 한국어 십자말 풀이 게임에서 사용하는 `stage.xml` 파일의 구조와 각 필드의 의미를 정의한다.

`stage.xml`은 퍼즐의 완성된 칸 배치를 저장하는 파일이 아니라,

- 스테이지 메타 정보
- 보드 크기
- 플레이 단어 수 규칙
- 허용 카테고리
- 허용 등급
- 필수 단어 4개와 그룹 구조
- seed 정보
- 랜덤 단어 / connector word 정책

을 저장하는 **퍼즐 생성 조건 파일**이다.

---

## 설계 원칙
`stage.xml`은 다음 원칙을 따른다.

1. 같은 `stage + dictionaryVersion + seed`이면 동일한 퍼즐 생성 결과를 기대할 수 있어야 한다.
2. 필수 단어는 항상 4개이며, 2개 그룹으로 저장한다.
3. 필수 단어 4개 중 1개는 반드시 `고사성어`이다.
4. 플레이 단어 수는 목표값 1개만 저장하고, 실제 생성 시 `-1 ~ +1` 범위를 자동 적용한다.
5. 허용 등급은 범위가 아니라 **멀티 선택된 등급 목록**으로 저장한다.

---

## 최상위 구조
권장 최상위 구조는 다음과 같다.

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
  <connectorWordPolicy />
  <seedPolicy />
</stage>
```

---

# 1. `<stage>`

## 설명
최상위 루트 요소.

## 예시
```xml
<stage>
  ...
</stage>
```

## 역할
- 하나의 스테이지 정의 전체를 감싼다.

---

# 2. `<meta>`

## 설명
스테이지 기본 메타 정보를 저장한다.

## 예시
```xml
<meta
  id="stage-025"
  level="25"
  title="기초 과학과 일상"
  version="1.0"
/>
```

## 속성

### `id`
- 타입: 문자열
- 예시: `stage-025`
- 역할:
  - 스테이지 고유 식별자
  - 파일명 및 내부 참조에 사용

### `level`
- 타입: 정수 문자열
- 예시: `25`
- 역할:
  - 스테이지 번호

### `title`
- 타입: 문자열
- 예시: `기초 과학과 일상`
- 역할:
  - 사람이 읽는 스테이지 이름
  - 없어도 되지만 권장

### `version`
- 타입: 문자열
- 예시: `1.0`
- 역할:
  - 해당 stage 파일 형식 또는 내용 버전

---

# 3. `<dictionary>`

## 설명
스테이지 생성에 사용하는 사전 버전을 지정한다.

## 예시
```xml
<dictionary version="v0001" />
```

## 속성

### `version`
- 타입: 문자열
- 예시: `v0001`
- 역할:
  - 어떤 사전 데이터 파일을 기준으로 단어를 고를지 고정
  - 같은 seed라도 사전 버전이 달라지면 결과가 달라질 수 있으므로 필수

---

# 4. `<board>`

## 설명
퍼즐 보드의 행과 열 크기를 지정한다.

## 예시
```xml
<board rows="10" columns="10" />
```

## 속성

### `rows`
- 타입: 정수 문자열
- 예시: `10`
- 역할:
  - 보드 행 개수

### `columns`
- 타입: 정수 문자열
- 예시: `10`
- 역할:
  - 보드 열 개수

## 비고
UI에서는 `행`, `열`을 따로 입력받는다.

---

# 5. `<playWords>`

## 설명
실제 퍼즐에서 사용할 플레이 단어 수의 목표값과 자동 허용 범위를 저장한다.

## 예시
```xml
<playWords target="9" range="1" />
```

## 속성

### `target`
- 타입: 정수 문자열
- 예시: `9`
- 역할:
  - 디자이너가 입력한 목표 플레이 단어 수

### `range`
- 타입: 정수 문자열
- 예시: `1`
- 역할:
  - 목표값 기준 자동 허용 범위
  - 실제 최소/최대는 다음처럼 계산
    - `min = target - range`
    - `max = target + range`

## 예시 해석
```xml
<playWords target="9" range="1" />
```
는 다음 의미이다.

- 목표값: `9`
- 실제 허용 범위: `8 ~ 10`

---

# 6. `<categories>`

## 설명
이 스테이지에서 사용할 수 있는 카테고리 목록을 저장한다.

## 예시
```xml
<categories>
  <category name="일상" />
  <category name="과학" />
  <category name="경제" />
  <category name="고사성어" />
</categories>
```

## 자식 요소

### `<category>`
- 속성: `name`
- 예시:
  - `일상`
  - `과학`
  - `경제`
  - `지리`
  - `고사성어`

## 역할
- 필수 단어 후보군 제한
- 랜덤 단어 후보군 제한
- connector word 후보군 제한

## 특별 규칙
- `고사성어`는 필수 단어 4개 중 1개를 보장하기 위해 포함되어야 한다.

---

# 7. `<grades>`

## 설명
허용 가능한 단어 등급 목록을 저장한다.

## 예시 1
```xml
<grades>1,2</grades>
```

## 예시 2
```xml
<grades>
  <grade value="1" />
  <grade value="2" />
</grades>
```

## 권장 방식
처음에는 단순성을 위해 텍스트 방식도 가능하지만,
확장성과 파싱 안정성을 생각하면 자식 요소 방식이 더 좋다.

### 권장 예시
```xml
<grades>
  <grade value="1" />
  <grade value="2" />
</grades>
```

## 역할
- 필수 단어 추천 시 허용 등급 제한
- 랜덤 단어 선택 시 허용 등급 제한
- connector word 선택 시 허용 등급 제한

## 허용값
- `1`
- `2`
- `3`
- `4`

## 의미
- `1 ~ 2`: 초등학교 수준 목표
- `3`: 중학교 수준 목표
- `4`: 고등학교 수준 목표

---

# 8. `<requiredGroups>`

## 설명
필수 단어 4개를 2개 그룹으로 저장한다.

## 예시
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

## 역할
- 필수 단어 4개 고정
- 추천 시점에 검토가 끝난 구조를 명시적으로 저장
- 퍼즐 생성기는 이 그룹 구조를 기반으로 레이아웃을 시작

---

## 8.1 `<group>`

### 설명
필수 단어 2개를 하나의 그룹으로 저장한다.

### 속성

#### `id`
- 타입: 문자열
- 예시: `A`, `B`
- 역할:
  - 그룹 식별자

### 규칙
- 그룹은 정확히 2개 사용
- 각 그룹에는 정확히 2개 단어를 저장
- 그룹 내부 두 단어는 실제 교차 가능해야 함

---

## 8.2 `<word>`

### 설명
필수 단어 정보를 저장한다.

### 속성

#### `text`
- 타입: 문자열
- 예시: `타산지석`
- 역할:
  - 실제 단어 본문

#### `category`
- 타입: 문자열
- 예시: `고사성어`
- 역할:
  - 단어 카테고리

#### `grade`
- 타입: 정수 문자열
- 예시: `3`
- 역할:
  - 단어 등급

## 선택 확장 필드
필요하면 다음 속성을 추가할 수 있다.

#### `crossChar`
- 타입: 문자열
- 예시: `타`
- 역할:
  - 그룹 내부에서 추천된 교차 문자 기록

예시:
```xml
<word text="타산지석" category="고사성어" grade="3" crossChar="타" />
```

다만 초기 버전에서는 생략 가능하다.

---

# 9. `<randomWordPolicy>`

## 설명
seed 기반 랜덤 단어 선택 규칙을 저장한다.

## 예시
```xml
<randomWordPolicy count="1" />
```

## 속성

### `count`
- 타입: 정수 문자열
- 예시: `1`
- 역할:
  - 필수 단어 외에 seed로 선택할 랜덤 단어 수

## 현재 규칙
- 초기 설계에서는 `1` 고정
- 이 랜덤 단어가 seed의 의미를 만든다

---

# 10. `<connectorWordPolicy>`

## 설명
필수 단어와 랜덤 단어 외에 레이아웃을 완성하기 위한 connector word 규칙을 저장한다.

## 예시
```xml
<connectorWordPolicy min="3" max="5" />
```

## 속성

### `min`
- 타입: 정수 문자열
- 예시: `3`
- 역할:
  - 최소 connector word 수

### `max`
- 타입: 정수 문자열
- 예시: `5`
- 역할:
  - 최대 connector word 수

## 역할
- 두 그룹을 연결하는 단어 수 범위 지정
- 퍼즐 생성기가 보드 완성도를 확보할 수 있게 함

## 비고
정확한 개수는 다음 값에 따라 달라질 수 있다.

- playWords 목표값
- 실제 랜덤 단어 선택 결과
- 레이아웃 생성 성공 여부

---

# 11. `<seedPolicy>`

## 설명
seed 사용 정책을 저장한다.

## 예시
```xml
<seedPolicy defaultSeed="27" min="0" max="100" />
```

## 속성

### `defaultSeed`
- 타입: 정수 문자열
- 예시: `27`
- 역할:
  - 기본 추천 seed 값
  - 디자이너가 승인한 대표 seed

### `min`
- 타입: 정수 문자열
- 예시: `0`
- 역할:
  - 허용 최소 seed

### `max`
- 타입: 정수 문자열
- 예시: `100`
- 역할:
  - 허용 최대 seed

## 비고
데모 단계에서는 `0 ~ 100` 범위를 유지한다.

---

# 12. 권장 전체 예시

```xml
<?xml version="1.0" encoding="UTF-8"?>
<stage>
  <meta
    id="stage-025"
    level="25"
    title="기초 과학과 일상"
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

  <connectorWordPolicy min="3" max="5" />

  <seedPolicy defaultSeed="27" min="0" max="100" />
</stage>
```

---

# 13. 저장 전 검증 규칙
`stage.xml` 저장 전 최소한 아래 조건을 만족해야 한다.

1. `requiredGroups`가 존재하는가
2. 그룹이 정확히 2개인가
3. 각 그룹에 단어가 정확히 2개씩 있는가
4. 필수 단어 총합이 4개인가
5. 필수 단어 중 `고사성어`가 정확히 1개 이상 포함되는가
6. 모든 단어 등급이 `grades` 허용 목록 또는 예외 규칙에 맞는가
7. `playWords.target`이 정수인가
8. `board.rows`, `board.columns`가 유효한 정수인가
9. `seedPolicy.defaultSeed`가 `0 ~ 100` 범위 안에 있는가
10. 그룹 내부 단어가 실제 교차 가능한가

---

# 14. 구현 시 해석 규칙 요약
게임 프로그램 또는 생성기는 `stage.xml`을 다음과 같이 해석한다.

1. 사전 버전 확인
2. 보드 크기 확인
3. 플레이 단어 목표값과 자동 범위 계산
4. 허용 카테고리 확인
5. 허용 등급 목록 확인
6. 필수 단어 4개 로드
7. seed 기반 랜덤 단어 1개 선택
8. connector word를 선택하여 전체 단어 수를 맞춤
9. 레이아웃 생성 시도
10. 실패 시 seed 기반 결정 규칙으로 재시도

---

# 15. 향후 확장 가능 항목
초기 버전에는 생략하지만 다음 항목은 향후 확장 가능하다.

- `<generator version="..." />`
- 단어별 뜻풀이 저장
- 필수 단어별 고정 좌표 힌트
- connector 카테고리 가중치
- 랜덤 단어 카테고리 제한
- 필수 단어 예외 등급 허용 정책
- 스테이지 설명 또는 테마 문구

---

# 16. 결론
`stage.xml`은 단순 데이터 파일이 아니라,
해당 스테이지의 퍼즐 생성 규칙을 고정하는 핵심 파일이다.

따라서 다음 정보를 명확하게 포함해야 한다.

- 스테이지 식별 정보
- 사전 버전
- 보드 크기
- 플레이 단어 목표값
- 허용 카테고리
- 허용 등급
- 필수 단어 4개와 그룹 구조
- 랜덤 단어 정책
- connector word 정책
- seed 정책

이 명세를 기준으로 레벨디자인 프로그램은 `stage.xml`을 생성하고,
게임 프로그램은 이 파일을 읽어 퍼즐을 구성한다.
