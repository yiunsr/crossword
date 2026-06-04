export const mistakeStorageKey = 'crossword:mistakes';

export function createMistakeRecord(word) {
  return {
    word,
    wrongCount: 1,
    lastMistakenAt: new Date().toISOString(),
  };
}

export function sortWordsByMistakes(records = []) {
  return [...records].sort((left, right) => right.wrongCount - left.wrongCount);
}
