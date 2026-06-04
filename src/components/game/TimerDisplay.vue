<script setup>
import { computed } from 'vue';

const props = defineProps({
  seconds: {
    type: Number,
    default: 0,
  },
});

const formattedTime = computed(() => {
  const minutes = String(Math.floor(props.seconds / 60)).padStart(2, '0');
  const seconds = String(props.seconds % 60).padStart(2, '0');

  return `${minutes}:${seconds}`;
});
</script>

<template>
  <div class="timer panel-inner">
    <span class="label">진행 시간</span>
    <strong>{{ formattedTime }}</strong>
  </div>
</template>

<style scoped>
.panel-inner {
  min-width: 140px;
  padding: 12px 16px;
  border-radius: 12px;
  background: #eff6ff;
}

.label {
  display: block;
  margin-bottom: 4px;
  color: #1d4ed8;
  font-size: 0.875rem;
}

strong {
  font-size: 1.4rem;
}
</style>
