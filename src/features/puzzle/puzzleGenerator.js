import { shuffleArray } from '@/utils/random';

export function buildPuzzleWordSet({
  requiredWords = [],
  candidateWords = [],
  randomCount = 0,
}) {
  const uniqueRequiredWords = [...new Set(requiredWords)];
  const selectableWords = candidateWords.filter(
    (word) => !uniqueRequiredWords.includes(word),
  );

  const randomWords = shuffleArray(selectableWords).slice(0, randomCount);

  return [...uniqueRequiredWords, ...randomWords];
}

export function createPuzzleBlueprint({ stageId, words }) {
  return {
    stageId,
    words,
    createdAt: new Date().toISOString(),
  };
}
