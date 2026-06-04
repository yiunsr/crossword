export const baseWordCatalogPath = 'data/words/base-words.json';

export function createUserWord({ word, clue, theme, tags = [] }) {
  return {
    id: crypto.randomUUID(),
    word,
    clue,
    theme,
    tags,
    source: 'user',
    createdAt: new Date().toISOString(),
  };
}
