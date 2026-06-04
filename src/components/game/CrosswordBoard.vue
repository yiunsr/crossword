<script setup>
const previewRows = [
  ['원', '자', '', '', '', '', ''],
  ['', '세', '', '', '', '', ''],
  ['', '포', '학', '', '', '', ''],
  ['', '', '설', '명', '', '', ''],
  ['', '', '', '테', '마', '', ''],
  ['', '', '', '', '단', '어', ''],
  ['', '', '', '', '', '', ''],
];
</script>

<template>
  <section class="board-wrapper">
    <h2 class="section-title">게임 보드</h2>
    <div class="board">
      <div
        v-for="(row, rowIndex) in previewRows"
        :key="`row-${rowIndex}`"
        class="board-row"
      >
        <div
          v-for="(cell, colIndex) in row"
          :key="`cell-${rowIndex}-${colIndex}`"
          class="board-cell"
          :class="{ filled: cell }"
        >
          {{ cell }}
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.board-wrapper {
  padding: 20px;
}

.board {
  display: grid;
  gap: 4px;
}

.board-row {
  display: grid;
  grid-template-columns: repeat(7, 48px);
  gap: 4px;
}

.board-cell {
  height: 48px;
  border-radius: 10px;
  border: 1px dashed #cbd5e1;
  display: grid;
  place-items: center;
  background: #f8fafc;
  color: transparent;
}

.board-cell.filled {
  background: white;
  color: #111827;
  border-style: solid;
}
</style>
