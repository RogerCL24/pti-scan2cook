import { cleanText } from './cleaner.js';
import { parseWithRegex } from './parserRegex.js';

const cases = [
  'LINE1\nLINE2\nTotal 10.00',
  { text: 'PROD A\nPROD B\nVisa' },
  [{ text: 'array item' }, 'SOMETHING'],
  null,
  { foo: 'bar' }
];

for (const c of cases) {
  try {
    const cleaned = cleanText(c);
    console.log('--- INPUT ---');
    console.log(c);
    console.log('--- CLEANED ---');
    console.log(cleaned);
    console.log('--- PARSED ---');
    console.log(parseWithRegex(c));
  } catch (err) {
    console.error('Error for input', c, err);
  }
}
