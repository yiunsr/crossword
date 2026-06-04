<script setup>
const openOptionsPage = () => {
  const extensionApi = globalThis.browser ?? globalThis.chrome;
  extensionApi.runtime.openOptionsPage();
};
</script>

<template>
  <main class="popup panel">
    <h1>한국어 십자말 풀이</h1>
    <p>
      스테이지, 사용자 단어, 자주 틀리는 단어 우선 출제 기능을 위한
      초기 확장프로그램 골격입니다.
    </p>

    <button type="button" @click="openOptionsPage">게임 화면 열기</button>
  </main>
</template>

<style scoped>
.popup {
  width: 360px;
  padding: 20px;
}

h1 {
  margin: 0 0 12px;
  font-size: 1.2rem;
}

p {
  margin: 0 0 16px;
  color: #475569;
}

button {
  width: 100%;
  padding: 12px 14px;
  border: 0;
  border-radius: 12px;
  background: #2563eb;
  color: white;
  cursor: pointer;
}
</style>
