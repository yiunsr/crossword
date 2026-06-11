<script setup>
import { computed, ref } from 'vue';
import JSZip from 'jszip';
import dictionaryCsvText from '../../data/사전.v0001.csv?raw';
import { parseCsv } from '@/utils/csv';
import { shuffleWithSeed } from '@/utils/seededRandom';

const categoryOrder = ['일상', '과학', '경제', '지리', '고사성어'];
const gradeOptions = ['1', '2', '3', '4'];
const batchStageCount = 10;

const stageNumber = ref(25);
const seed = ref(27);
const rows = ref(10);
const columns = ref(10);
const targetPlayWords = ref(9);
const selectedCategories = ref(['일상', '과학', '경제', '고사성어']);
const selectedGrades = ref(['1', '2', '3']);
const rerollCount = ref(0);
const pinnedWords = ref(new Set());
const replaceCounters = ref({});
const warnings = ref([]);
const saveStatus = ref('');
const generationState = ref(null);
const isSaving = ref(false);

const dictionary = parseCsv(dictionaryCsvText)
  .map((row, index) => ({
    id: `${row.단어}-${index}`,
    word: String(row.단어 || '').trim(),
    category: String(row.카테고리 || '').trim(),
    grade: Number(row.등급 || 0),
    description: String(row.뜻풀이 || '').trim(),
  }))
  .filter((item) => item.word && item.category && item.grade && item.description);

function normalizeSeed(nextSeed) {
  return Math.max(0, Math.min(100, Number(nextSeed) || 0));
}

function normalizeStageNumber(nextStageNumber) {
  return Math.max(1, Number(nextStageNumber) || 1);
}

function uniqueChars(word) {
  return [...new Set([...word])];
}

function getSharedChars(left, right) {
  const rightCharSet = new Set(uniqueChars(right.word));
  return uniqueChars(left.word).filter((char) => rightCharSet.has(char));
}

function getCrossChar(left, right) {
  return getSharedChars(left, right)[0] ?? '';
}

function isCrossable(left, right) {
  return Boolean(left && right && left.word !== right.word && getCrossChar(left, right));
}

function getStageFilename(nextStageNumber) {
  return `stage-${String(normalizeStageNumber(nextStageNumber)).padStart(3, '0')}.xml`;
}

function getZipFilename(nextStageNumber) {
  return `stages-${String(normalizeStageNumber(nextStageNumber)).padStart(3, '0')}-${String(normalizeStageNumber(nextStageNumber) + batchStageCount - 1).padStart(3, '0')}.zip`;
}

function getStageSeedValue(nextStageNumber, offset = 0) {
  return normalizeSeed(seed.value) + normalizeStageNumber(nextStageNumber) * 1009 + offset;
}

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: 'application/xml;charset=utf-8' });
  downloadBlob(filename, blob);
}

function isDevServerEnvironment() {
  return typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);
}

function supportsFilePicker() {
  return typeof window !== 'undefined' && typeof window.showSaveFilePicker === 'function';
}

async function saveWithFilePicker(fileName, blob, description, accept) {
  const handle = await window.showSaveFilePicker({
    suggestedName: fileName,
    types: [
      {
        description,
        accept,
      },
    ],
  });

  const writable = await handle.createWritable();
  await writable.write(blob);
  await writable.close();

  return {
    ok: true,
    mode: 'picker',
    message: '선택한 위치에 파일을 저장했습니다.',
  };
}

async function saveViaDevServer(fileName, content) {
  const response = await fetch('/api/save-stage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fileName, content }),
  });

  const result = await response.json();

  if (!response.ok || !result.ok) {
    throw new Error(result.message || '파일 저장에 실패했습니다.');
  }

  return {
    ok: true,
    mode: 'server',
    message: result.path,
  };
}

async function saveStageFile(fileName, content) {
  if (supportsFilePicker()) {
    try {
      return await saveWithFilePicker(
        fileName,
        new Blob([content], { type: 'application/xml;charset=utf-8' }),
        'Stage XML',
        {
          'application/xml': ['.xml'],
          'text/xml': ['.xml'],
        },
      );
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('파일 저장이 취소되었습니다.');
      }
    }
  }

  if (isDevServerEnvironment()) {
    return saveViaDevServer(fileName, content);
  }

  downloadTextFile(fileName, content);
  return {
    ok: true,
    mode: 'download',
    message: '브라우저 다운로드 방식으로 저장했습니다.',
  };
}

async function saveZipFile(fileName, blob) {
  if (supportsFilePicker()) {
    try {
      return await saveWithFilePicker(fileName, blob, 'Stage ZIP', {
        'application/zip': ['.zip'],
        'application/x-zip-compressed': ['.zip'],
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('파일 저장이 취소되었습니다.');
      }
    }
  }

  downloadBlob(fileName, blob);
  return {
    ok: true,
    mode: 'download',
    message: '브라우저 다운로드 방식으로 저장했습니다.',
  };
}

const availableEntries = computed(() => {
  const allowedCategories = new Set(selectedCategories.value);
  const allowedGrades = new Set(selectedGrades.value.map(Number));

  return dictionary.filter(
    (item) => allowedCategories.has(item.category) && allowedGrades.has(item.grade),
  );
});

const groupedCandidates = computed(() => ({
  idioms: availableEntries.value.filter((item) => item.category === '고사성어'),
  nonIdioms: availableEntries.value.filter((item) => item.category !== '고사성어'),
}));

const minPlayWords = computed(() => Math.max(1, Number(targetPlayWords.value) - 1));
const maxPlayWords = computed(() => Number(targetPlayWords.value) + 1);

function choosePairForAnchor(anchor, candidates, excludedIds, seedBase) {
  const pool = shuffleWithSeed(
    candidates.filter((item) => !excludedIds.has(item.id) && item.id !== anchor.id),
    seedBase,
  );

  return pool.find((candidate) => isCrossable(anchor, candidate)) ?? null;
}

function chooseFreePair(candidates, excludedIds, seedBase) {
  const pool = shuffleWithSeed(
    candidates.filter((item) => !excludedIds.has(item.id)),
    seedBase,
  );

  for (let leftIndex = 0; leftIndex < pool.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < pool.length; rightIndex += 1) {
      if (isCrossable(pool[leftIndex], pool[rightIndex])) {
        return [pool[leftIndex], pool[rightIndex]];
      }
    }
  }

  return null;
}

function buildGenerationState(selectedGroups) {
  return {
    groups: selectedGroups.map((group) => ({
      ...group,
      crossChar: getCrossChar(group.words[0], group.words[1]),
    })),
  };
}

function generateRecommendationState({ nextStageNumber, rerollOffset = 0, lockedWords = [] } = {}) {
  const nextWarnings = [];
  const lockedIdSet = new Set(lockedWords.map((item) => item.id));
  const idioms = groupedCandidates.value.idioms;
  const nonIdioms = groupedCandidates.value.nonIdioms;

  if (!idioms.length) {
    return {
      state: null,
      warnings: ['선택한 카테고리/등급 조합으로는 고사성어 후보를 찾을 수 없습니다.'],
    };
  }

  if (nonIdioms.length < 3) {
    return {
      state: null,
      warnings: ['필수 단어를 구성하기 위한 일반 단어 후보가 부족합니다.'],
    };
  }

  const lockedIdiom = lockedWords.find((item) => item.category === '고사성어') ?? null;
  const seedBase = getStageSeedValue(nextStageNumber, rerollOffset);
  const idiomPool = lockedIdiom ? [lockedIdiom] : shuffleWithSeed(
    idioms.filter((item) => !lockedIdSet.has(item.id)),
    seedBase,
  );

  let selectedGroups = null;

  for (let idiomIndex = 0; idiomIndex < idiomPool.length; idiomIndex += 1) {
    const idiom = idiomPool[idiomIndex];
    const usedIds = new Set(lockedIdSet);
    usedIds.add(idiom.id);

    const lockedGroupPartner = lockedWords.find(
      (item) => item.id !== idiom.id && isCrossable(idiom, item),
    ) ?? null;

    const idiomPartner = lockedGroupPartner
      ?? choosePairForAnchor(idiom, nonIdioms, usedIds, seedBase + idiomIndex + 11);

    if (!idiomPartner) {
      continue;
    }

    usedIds.add(idiomPartner.id);

    const remainingLocked = lockedWords.filter(
      (item) => !usedIds.has(item.id),
    );

    let groupBWords = null;

    if (remainingLocked.length === 2 && isCrossable(remainingLocked[0], remainingLocked[1])) {
      groupBWords = remainingLocked;
    } else if (remainingLocked.length === 1) {
      const partner = choosePairForAnchor(
        remainingLocked[0],
        nonIdioms,
        usedIds,
        seedBase + idiomIndex + 37,
      );
      if (partner) {
        groupBWords = [remainingLocked[0], partner];
      }
    } else if (remainingLocked.length === 0) {
      groupBWords = chooseFreePair(nonIdioms, usedIds, seedBase + idiomIndex + 59);
    }

    if (!groupBWords) {
      continue;
    }

    selectedGroups = [
      { id: 'A', words: [idiom, idiomPartner] },
      { id: 'B', words: groupBWords },
    ];
    break;
  }

  if (!selectedGroups) {
    return {
      state: null,
      warnings: ['현재 조건으로는 실제 교차 가능한 필수 단어 4개를 찾지 못했습니다.'],
    };
  }

  const allWords = selectedGroups.flatMap((group) => group.words);
  const uniqueWordCount = new Set(allWords.map((item) => item.id)).size;

  if (uniqueWordCount !== 4) {
    nextWarnings.push('추천 결과에 중복 단어가 있어 다시 추천이 필요합니다.');
  }

  return {
    state: buildGenerationState(selectedGroups),
    warnings: nextWarnings,
  };
}

function generateRecommendation() {
  const lockedWords = generationState.value?.groups
    ?.flatMap((group) => group.words)
    .filter((item) => pinnedWords.value.has(item.id)) ?? [];

  const result = generateRecommendationState({
    nextStageNumber: stageNumber.value,
    rerollOffset: rerollCount.value,
    lockedWords,
  });

  generationState.value = result.state;
  warnings.value = result.warnings;
}

function handleRecommend() {
  pinnedWords.value = new Set();
  replaceCounters.value = {};
  rerollCount.value = 0;
  generateRecommendation();
}

function handleReroll() {
  rerollCount.value += 1;
  generateRecommendation();
}

function toggleCategory(category) {
  if (category === '고사성어') {
    return;
  }

  const next = new Set(selectedCategories.value);
  if (next.has(category)) {
    next.delete(category);
  } else {
    next.add(category);
  }
  selectedCategories.value = [...next, '고사성어'].filter((value, index, array) => array.indexOf(value) === index);
}

function toggleGrade(grade) {
  const next = new Set(selectedGrades.value);
  if (next.has(grade)) {
    if (next.size === 1) {
      return;
    }
    next.delete(grade);
  } else {
    next.add(grade);
  }

  selectedGrades.value = [...next].sort((left, right) => Number(left) - Number(right));
}

function togglePinnedWord(wordId) {
  const next = new Set(pinnedWords.value);
  if (next.has(wordId)) {
    next.delete(wordId);
  } else {
    next.add(wordId);
  }
  pinnedWords.value = next;
}

function replaceWord(groupId, wordId) {
  if (!generationState.value) {
    return;
  }

  const group = generationState.value.groups.find((item) => item.id === groupId);
  const currentWord = group?.words.find((item) => item.id === wordId);
  const partnerWord = group?.words.find((item) => item.id !== wordId);

  if (!group || !currentWord || !partnerWord) {
    return;
  }

  const pool = currentWord.category === '고사성어'
    ? groupedCandidates.value.idioms
    : groupedCandidates.value.nonIdioms;

  const usedIds = new Set(
    generationState.value.groups
      .flatMap((item) => item.words)
      .map((item) => item.id)
      .filter((id) => id !== currentWord.id),
  );

  const counterKey = `${groupId}:${wordId}`;
  const nextCounter = (replaceCounters.value[counterKey] ?? 0) + 1;
  replaceCounters.value = {
    ...replaceCounters.value,
    [counterKey]: nextCounter,
  };

  const replacement = shuffleWithSeed(
    pool,
    getStageSeedValue(stageNumber.value, rerollCount.value + nextCounter + 100),
  )
    .filter((candidate) => !usedIds.has(candidate.id))
    .find((candidate) => isCrossable(candidate, partnerWord));

  if (!replacement) {
    warnings.value = ['교체 가능한 후보를 찾지 못했습니다. 카테고리나 등급을 넓혀 보세요.'];
    return;
  }

  group.words = group.words.map((item) => (item.id === wordId ? replacement : item));
  group.crossChar = getCrossChar(group.words[0], group.words[1]);
  warnings.value = warnings.value.filter((item) => !item.includes('교체 가능한 후보'));
}

function buildXmlText({ nextStageNumber, state }) {
  if (!state) {
    return '';
  }

  const normalizedStageNumber = normalizeStageNumber(nextStageNumber);
  const categoriesXml = selectedCategories.value
    .map((category) => `    <category name="${category}" />`)
    .join('\n');
  const gradesXml = selectedGrades.value
    .map((grade) => `    <grade value="${grade}" />`)
    .join('\n');
  const groupsXml = state.groups
    .map((group) => `    <group id="${group.id}">\n${group.words.map((word) => `      <word text="${word.word}" category="${word.category}" grade="${word.grade}" />`).join('\n')}\n    </group>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<stage>\n  <meta\n    id="stage-${String(normalizedStageNumber).padStart(3, '0')}"\n    level="${normalizedStageNumber}"\n    title="stage-${String(normalizedStageNumber).padStart(3, '0')}"\n    version="1.0"\n  />\n\n  <dictionary version="v0001" />\n\n  <board rows="${rows.value}" columns="${columns.value}" />\n\n  <playWords target="${targetPlayWords.value}" range="1" />\n\n  <categories>\n${categoriesXml}\n  </categories>\n\n  <grades>\n${gradesXml}\n  </grades>\n\n  <requiredGroups>\n${groupsXml}\n  </requiredGroups>\n\n  <randomWordPolicy count="1" />\n\n  <seedPolicy defaultSeed="${normalizeSeed(seed.value)}" min="0" max="100" />\n</stage>`;
}

async function handleSaveXml() {
  if (!generationState.value) {
    warnings.value = ['저장할 추천 결과가 없습니다. 먼저 추천하기를 실행하세요.'];
    return;
  }

  const filename = getStageFilename(stageNumber.value);
  const xmlText = buildXmlText({
    nextStageNumber: stageNumber.value,
    state: generationState.value,
  });

  isSaving.value = true;
  saveStatus.value = '';

  try {
    const result = await saveStageFile(filename, xmlText);
    if (result.mode === 'server') {
      saveStatus.value = `프로젝트 저장 완료: ${result.message}`;
    } else if (result.mode === 'picker') {
      saveStatus.value = `파일 저장 완료: ${filename}`;
    } else {
      saveStatus.value = `다운로드 완료: ${filename}`;
    }
    warnings.value = warnings.value.filter((item) => !item.includes('저장'));
  } catch (error) {
    saveStatus.value = '';
    warnings.value = [
      ...(warnings.value.filter((item) => !item.includes('저장'))),
      `저장 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
    ];
  } finally {
    isSaving.value = false;
  }
}

async function handleBatchDownload() {
  isSaving.value = true;
  saveStatus.value = '';

  try {
    const startStageNumber = normalizeStageNumber(stageNumber.value);
    const zip = new JSZip();

    for (let index = 0; index < batchStageCount; index += 1) {
      const currentStageNumber = startStageNumber + index;
      const result = generateRecommendationState({ nextStageNumber: currentStageNumber });

      if (!result.state) {
        throw new Error(`${getStageFilename(currentStageNumber)} 생성 실패: ${result.warnings.join(' ')}`);
      }

      const xmlText = buildXmlText({
        nextStageNumber: currentStageNumber,
        state: result.state,
      });

      zip.file(getStageFilename(currentStageNumber), xmlText);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const zipFileName = getZipFilename(startStageNumber);
    await saveZipFile(zipFileName, zipBlob);
    saveStatus.value = `ZIP 다운로드 완료: ${zipFileName}`;
    warnings.value = warnings.value.filter((item) => !item.includes('저장') && !item.includes('생성 실패'));
  } catch (error) {
    saveStatus.value = '';
    warnings.value = [
      ...(warnings.value.filter((item) => !item.includes('저장') && !item.includes('생성 실패'))),
      `저장 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
    ];
  } finally {
    isSaving.value = false;
  }
}

const groups = computed(() => generationState.value?.groups ?? []);
const checkItems = computed(() => {
  const requiredWords = groups.value.flatMap((group) => group.words);
  const idiomCount = requiredWords.filter((item) => item.category === '고사성어').length;
  const allCrossable = groups.value.every((group) => isCrossable(group.words[0], group.words[1]));

  return [
    `필수 단어 ${requiredWords.length}개 / 4개`,
    `고사성어 포함: ${idiomCount >= 1 ? '예' : '아니오'}`,
    `허용 등급: ${selectedGrades.value.join(', ')}`,
    `목표 플레이 단어: ${targetPlayWords.value} (자동 ${minPlayWords.value}~${maxPlayWords.value})`,
    `그룹 연결성: ${allCrossable ? '양호' : '재검토 필요'}`,
  ];
});

const xmlPreview = computed(() => buildXmlText({
  nextStageNumber: stageNumber.value,
  state: generationState.value,
}));

handleRecommend();
</script>

<template>
  <main class="designer-page">
    <header class="page-header panel">
      <div>
        <p class="eyebrow">LEVEL DESIGNER</p>
        <h1>stage.xml 제작 도구</h1>
        <p class="page-description">
          스테이지 조건을 입력하고 필수 단어 4개를 검토한 뒤 stage.xml 생성을 준비합니다.
        </p>
      </div>
      <a class="back-link" href="/">메뉴로 돌아가기</a>
    </header>

    <section class="layout-grid">
      <aside class="panel sidebar">
        <h2 class="section-title">1. 스테이지 설정</h2>

        <div class="field-grid two-columns">
          <label>
            <span>시작 스테이지 번호</span>
            <input v-model.number="stageNumber" type="number" min="1" @change="stageNumber = normalizeStageNumber(stageNumber)" />
          </label>
          <label>
            <span>Seed (0~100)</span>
            <input v-model.number="seed" type="number" min="0" max="100" @change="seed = normalizeSeed(seed)" />
          </label>
        </div>

        <div class="field-grid two-columns">
          <label>
            <span>행</span>
            <input v-model.number="rows" type="number" min="2" />
          </label>
          <label>
            <span>열</span>
            <input v-model.number="columns" type="number" min="2" />
          </label>
        </div>

        <label class="field-block">
          <span>플레이 단어 수</span>
          <input v-model.number="targetPlayWords" type="number" min="5" />
          <small>자동 적용 범위: {{ minPlayWords }} ~ {{ maxPlayWords }} (-1 ~ +1)</small>
        </label>

        <section class="selector-block">
          <span class="block-label">사용 카테고리</span>
          <div class="chip-list">
            <button
              v-for="category in categoryOrder"
              :key="category"
              type="button"
              class="chip button-chip"
              :class="{ active: selectedCategories.includes(category), locked: category === '고사성어' }"
              @click="toggleCategory(category)"
            >
              {{ category }}
            </button>
          </div>
          <small>고사성어는 필수 단어 4개 중 1개를 반드시 포함합니다.</small>
        </section>

        <section class="selector-block">
          <span class="block-label">허용 등급</span>
          <div class="chip-list">
            <button
              v-for="grade in gradeOptions"
              :key="grade"
              type="button"
              class="chip button-chip"
              :class="{ active: selectedGrades.includes(grade) }"
              @click="toggleGrade(grade)"
            >
              {{ grade }}
            </button>
          </div>
          <small>멀티 선택으로 허용 등급을 조정합니다.</small>
        </section>

        <div class="button-row">
          <button type="button" class="primary" @click="handleRecommend">추천하기</button>
          <button type="button" class="dark" @click="handleReroll">다시 추천</button>
        </div>

        <button type="button" class="success full-width" :disabled="isSaving" @click="handleSaveXml">
          {{ isSaving ? '저장 중...' : '현재 stage.xml 저장' }}
        </button>
        <button type="button" class="batch full-width" :disabled="isSaving" @click="handleBatchDownload">
          {{ isSaving ? 'ZIP 생성 중...' : `${batchStageCount}개 ZIP 다운로드` }}
        </button>
        <p class="helper-text batch-help">
          시작 스테이지 번호부터 {{ batchStageCount }}개를 +1씩 생성해 ZIP으로 묶습니다.
        </p>
        <p v-if="saveStatus" class="save-status">{{ saveStatus }}</p>
      </aside>

      <section class="panel content-panel">
        <h2 class="section-title">2. 필수 단어 추천 결과</h2>
        <p class="helper-text">필수 단어 4개는 실제 교차 가능한 2개 그룹으로 제안됩니다.</p>

        <div v-if="groups.length === 0" class="empty-state">
          추천 결과가 없습니다. 왼쪽에서 조건을 조정한 뒤 추천하기를 눌러 주세요.
        </div>

        <div v-for="group in groups" :key="group.id" class="group-card">
          <div class="group-header">
            <h3>그룹 {{ group.id }}</h3>
            <span>추천 교차 글자: {{ group.crossChar || '없음' }}</span>
          </div>
          <article v-for="item in group.words" :key="item.id" class="word-card">
            <div>
              <strong>{{ item.word }}</strong>
              <p>{{ item.category }} · 등급 {{ item.grade }} · {{ item.description }}</p>
            </div>
            <div class="word-actions">
              <button type="button" :class="{ active: pinnedWords.has(item.id) }" @click="togglePinnedWord(item.id)">
                {{ pinnedWords.has(item.id) ? '고정됨' : '고정' }}
              </button>
              <button type="button" @click="replaceWord(group.id, item.id)">교체</button>
            </div>
          </article>
        </div>
      </section>

      <aside class="panel summary-panel">
        <h2 class="section-title">3. 검증 및 XML 요약</h2>

        <section class="summary-box soft">
          <h3>자동 검증</h3>
          <ul>
            <li v-for="item in checkItems" :key="item">{{ item }}</li>
          </ul>
        </section>

        <section class="summary-box warn">
          <h3>메모</h3>
          <p>현재 결과는 Seed {{ normalizeSeed(seed) }} + Stage {{ normalizeStageNumber(stageNumber) }} 기준 추천 조합입니다.</p>
          <p>연결단어와 leaf단어 수는 생성 시 실제 배치 결과에 따라 결정됩니다.</p>
          <p v-for="warning in warnings" :key="warning">• {{ warning }}</p>
        </section>

        <section class="summary-box code-box">
          <h3>stage.xml 미리보기</h3>
          <pre>{{ xmlPreview }}</pre>
        </section>
      </aside>
    </section>
  </main>
</template>

<style scoped>
.designer-page {
  max-width: 1440px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  padding: 24px;
  margin-bottom: 20px;
}

.eyebrow {
  margin: 0 0 8px;
  color: #2563eb;
  font-size: 0.875rem;
  font-weight: 700;
}

h1 {
  margin: 0 0 8px;
}

.page-description {
  margin: 0;
  color: #475569;
}

.back-link {
  color: #1d4ed8;
  text-decoration: none;
  font-weight: 600;
}

.layout-grid {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr) 320px;
  gap: 20px;
}

.sidebar,
.content-panel,
.summary-panel {
  padding: 20px;
}

.field-grid {
  display: grid;
  gap: 12px;
  margin-bottom: 16px;
}

.two-columns {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

label,
.field-block {
  display: grid;
  gap: 6px;
}

label span,
.block-label {
  font-weight: 700;
  color: #334155;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: #f8fafc;
}

small,
.helper-text {
  color: #64748b;
}

.save-status {
  margin: 12px 0 0;
  color: #15803d;
  font-weight: 700;
}

.batch-help {
  margin: 10px 0 0;
}

.selector-block {
  margin-bottom: 16px;
}

.chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 10px 0 6px;
}

.chip {
  padding: 7px 12px;
  border-radius: 999px;
  background: #e2e8f0;
  color: #475569;
  font-weight: 700;
  font-size: 0.9rem;
}

.button-chip {
  border: 0;
  cursor: pointer;
}

.chip.active {
  background: #dbeafe;
  color: #1d4ed8;
}

.chip.locked {
  box-shadow: inset 0 0 0 1px #1d4ed8;
}

.button-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 20px 0 12px;
}

button {
  padding: 12px 14px;
  border: 0;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 700;
}

button:disabled {
  cursor: wait;
  opacity: 0.72;
}

.primary {
  background: #2563eb;
  color: white;
}

.dark {
  background: #0f172a;
  color: white;
}

.success {
  background: #16a34a;
  color: white;
}

.batch {
  width: 100%;
  margin-top: 10px;
  background: #7c3aed;
  color: white;
}

.full-width {
  width: 100%;
}

.empty-state {
  margin-top: 16px;
  padding: 18px;
  border: 1px dashed #cbd5e1;
  border-radius: 16px;
  color: #64748b;
}

.group-card {
  margin-top: 16px;
  padding: 18px;
  border-radius: 16px;
  background: #f8fafc;
  border: 1px solid #d8e0ec;
}

.group-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  margin-bottom: 14px;
}

.group-header h3,
.summary-box h3 {
  margin: 0;
}

.group-header span {
  color: #64748b;
  font-size: 0.9rem;
}

.word-card {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  padding: 16px;
  border-radius: 14px;
  background: white;
  border: 1px solid #d8e0ec;
}

.word-card + .word-card {
  margin-top: 12px;
}

.word-card strong {
  display: block;
  margin-bottom: 8px;
  font-size: 1.4rem;
}

.word-card p {
  margin: 0;
  color: #475569;
}

.word-actions {
  display: flex;
  gap: 8px;
}

.word-actions button {
  background: #e2e8f0;
  color: #334155;
}

.word-actions button.active {
  background: #dbeafe;
  color: #1d4ed8;
}

.summary-box {
  padding: 18px;
  border-radius: 16px;
}

.summary-box + .summary-box {
  margin-top: 16px;
}

.soft {
  background: #f8fafc;
  border: 1px solid #d8e0ec;
}

.warn {
  background: #fff7ed;
  border: 1px solid #fed7aa;
}

.warn p {
  margin: 10px 0 0;
  color: #9a3412;
}

.code-box {
  background: #0f172a;
  color: #e2e8f0;
}

.code-box pre {
  margin: 12px 0 0;
  white-space: pre-wrap;
  word-break: break-word;
  color: #bfdbfe;
}

.summary-box ul {
  margin: 12px 0 0;
  padding-left: 18px;
}

.summary-box li {
  margin-bottom: 8px;
}

@media (max-width: 1200px) {
  .layout-grid {
    grid-template-columns: 1fr;
  }
}
</style>
