<script setup>
import CluePanel from '@/components/game/CluePanel.vue';
import CrosswordBoard from '@/components/game/CrosswordBoard.vue';
import TimerDisplay from '@/components/game/TimerDisplay.vue';
import StageHeader from '@/components/stage/StageHeader.vue';
import UserWordForm from '@/components/words/UserWordForm.vue';

const stage = {
  id: 'stage-001',
  title: '기초 과학',
  difficulty: 1,
  theme: '과학',
  requiredWords: ['원자', '세포'],
};

const elapsedSeconds = 215;

const clues = [
  { direction: '가로', number: 1, answer: '원자', clue: '물질을 이루는 기본 단위' },
  { direction: '세로', number: 2, answer: '세포', clue: '생물체 구조의 기본 단위' },
];
</script>

<template>
  <main class="page">
    <section class="hero panel">
      <StageHeader :stage="stage" />
      <TimerDisplay :seconds="elapsedSeconds" />
    </section>

    <section class="content-grid">
      <CrosswordBoard class="panel" />
      <CluePanel class="panel" :theme="stage.theme" :clues="clues" />
    </section>

    <section class="panel lower-panel">
      <h2 class="section-title">사용자 단어 관리</h2>
      <UserWordForm />
    </section>
  </main>
</template>

<style scoped>
.page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.hero {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  padding: 20px;
  margin-bottom: 20px;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.lower-panel {
  padding: 20px;
}

@media (max-width: 900px) {
  .hero,
  .content-grid {
    grid-template-columns: 1fr;
    display: grid;
  }
}
</style>
