<script setup>
defineProps({
  theme: {
    type: String,
    default: '',
  },
  clues: {
    type: Array,
    default: () => [],
  },
});
</script>

<template>
  <aside class="clue-panel">
    <h2 class="section-title">문제 힌트</h2>
    <p class="theme">테마: {{ theme || '미정' }}</p>

    <ul class="clue-list">
      <li v-for="item in clues" :key="`${item.direction}-${item.number}`">
        <strong>{{ item.direction }} {{ item.number }}</strong>
        <span>{{ item.clue }}</span>
      </li>
    </ul>
  </aside>
</template>

<style scoped>
.clue-panel {
  padding: 20px;
}

.theme {
  margin: 0 0 16px;
  color: #475569;
}

.clue-list {
  margin: 0;
  padding-left: 18px;
}

.clue-list li {
  margin-bottom: 10px;
}

.clue-list span {
  display: block;
  color: #475569;
}
</style>
