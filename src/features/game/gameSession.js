export function createGameSession({ stageId, words }) {
  return {
    stageId,
    words,
    startedAt: Date.now(),
    elapsedSeconds: 0,
    solvedWords: [],
  };
}
