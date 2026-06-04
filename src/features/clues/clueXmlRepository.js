export const clueXmlPath = 'data/clues/base-clues.xml';

export function buildClueEntry({ word, theme, description }) {
  return {
    word,
    theme,
    description,
  };
}
