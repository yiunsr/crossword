<script setup>
defineProps({
  stage: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <div>
    <p class="eyebrow">STAGE {{ stage.id }}</p>
    <h1>{{ stage.title }}</h1>
    <p class="meta">
      난이도 {{ stage.difficulty }} · 테마 {{ stage.theme }} · 필수 단어
      {{ stage.requiredWords.join(', ') }}
    </p>
  </div>
</template>

<style scoped>
.eyebrow {
  margin: 0 0 8px;
  color: #2563eb;
  font-size: 0.875rem;
  font-weight: 700;
}

h1 {
  margin: 0 0 8px;
}

.meta {
  margin: 0;
  color: #475569;
}
</style>
