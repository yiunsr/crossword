<script setup>
import { ref } from 'vue';

const word = ref('');
const description = ref('');
const theme = ref('');

const submitWord = () => {
  console.log('사용자 단어 등록 예정', {
    word: word.value,
    description: description.value,
    theme: theme.value,
  });

  word.value = '';
  description.value = '';
  theme.value = '';
};
</script>

<template>
  <form class="form" @submit.prevent="submitWord">
    <label>
      단어
      <input v-model="word" type="text" placeholder="예: 반도체" />
    </label>

    <label>
      설명
      <textarea v-model="description" rows="3" placeholder="단어 설명을 입력하세요." />
    </label>

    <label>
      테마
      <input v-model="theme" type="text" placeholder="예: 시사" />
    </label>

    <button type="submit">단어 저장</button>
  </form>
</template>

<style scoped>
.form {
  display: grid;
  gap: 12px;
}

label {
  display: grid;
  gap: 6px;
  font-weight: 600;
}

input,
textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
}

button {
  justify-self: start;
  padding: 10px 16px;
  border: 0;
  border-radius: 10px;
  background: #0f172a;
  color: white;
  cursor: pointer;
}
</style>
