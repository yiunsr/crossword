<template>
  <main class="home-page">
    <section class="hero panel">
      <p class="eyebrow">KOREAN CROSSWORD</p>
      <h1>한국어 십자말 풀이</h1>
      <p class="description">
        게임을 플레이하거나, 스테이지와 필수 단어를 설계하는 제작 도구로 이동하세요.
      </p>
    </section>

    <section class="menu-grid">
      <a class="menu-card panel" href="/game.html">
        <span class="menu-label">GAME</span>
        <h2>게임 플레이</h2>
        <p>현재 스테이지를 열고 보드, 힌트, 타이머 기반으로 퍼즐을 플레이합니다.</p>
      </a>

      <a class="menu-card panel" href="/designer.html">
        <span class="menu-label">DESIGNER</span>
        <h2>십자말 제작</h2>
        <p>필수 단어 4개를 추천받고 stage.xml 생성을 준비하는 레벨디자인 프로그램입니다.</p>
      </a>
    </section>
  </main>
</template>

<style scoped>
.home-page {
  max-width: 1120px;
  margin: 0 auto;
  padding: 32px 24px 48px;
}

.hero {
  padding: 32px;
  margin-bottom: 24px;
}

.eyebrow,
.menu-label {
  display: inline-block;
  color: #2563eb;
  font-weight: 700;
  font-size: 0.875rem;
  letter-spacing: 0.04em;
}

h1 {
  margin: 12px 0;
  font-size: 2rem;
}

.description {
  margin: 0;
  max-width: 720px;
  color: #475569;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.menu-card {
  display: block;
  padding: 28px;
  color: inherit;
  text-decoration: none;
}

.menu-card h2 {
  margin: 12px 0 10px;
}

.menu-card p {
  margin: 0;
  color: #475569;
}

@media (max-width: 800px) {
  .menu-grid {
    grid-template-columns: 1fr;
  }
}
</style>
