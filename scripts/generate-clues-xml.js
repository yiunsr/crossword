import { writeFileSync } from 'node:fs';

const outputPath = new URL('../data/clues/generated-clues.xml', import.meta.url);

const exampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<clues>
  <clue>
    <word>예시</word>
    <theme>샘플</theme>
    <description>LLM이 생성한 설명이 저장됩니다.</description>
  </clue>
</clues>
`;

writeFileSync(outputPath, exampleXml, 'utf8');
console.log('generated-clues.xml 파일을 생성했습니다.');
