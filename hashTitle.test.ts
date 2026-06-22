import assert from 'node:assert/strict';

import { hash16Farm, normalizeText } from './hashTitle.ts';

function testNormalizeTextRemovesSpacesAndNewlines(): void {
  const actual = normalizeText('  San   pham\tA \n moi  ');

  assert.equal(actual, 'SanphamAmoi');
}

function testNormalizeTextRemovesEmojis(): void {
  const actual = normalizeText('Ao thun 👕🔥 size M');

  assert.equal(actual, 'AothunsizeM');
}

function testNormalizeTextUsesNfkcUnicodeNormalization(): void {
  const actual = normalizeText(
    "m bọc cần analog tay cầm ps4/p4plus/ps5/xbox/pro controller silicone bảo vệ cover controller nắp dạ quang 2 đầu",
  );

  assert.equal(actual, 'mbọccầnanalogtaycầmps4/p4plus/ps5/xbox/procontrollersiliconebảovệcovercontrollernắpdạquang2đầu');
}

function testHashAlwaysReturns16HexCharacters(): void {
  const actual = hash16Farm('Sản phẩm A');

  assert.match(actual, /^[0-9a-f]{16}$/);
}

function testHashIgnoresWhitespaceAndEmojis(): void {
  const baseHash = hash16Farm('Sản phẩm A');
  const noisyHash = hash16Farm('  Sản           phẩm\tA 🚀\n');

  console.log(baseHash, noisyHash);
  assert.equal(noisyHash, baseHash);
}

function testLogHashForTitle(title: string): void {
  const normalizedTitle = normalizeText(title);
  const hash = hash16Farm(title);

  console.log('Input title:', title);
  console.log('Normalized title:', normalizedTitle);
  console.log('Hash:', hash);
}

function runHashTitleTests(): void {
  testNormalizeTextRemovesSpacesAndNewlines();
  testNormalizeTextRemovesEmojis();
  testNormalizeTextUsesNfkcUnicodeNormalization();
  testHashAlwaysReturns16HexCharacters();
  testHashIgnoresWhitespaceAndEmojis();
  testLogHashForTitle(
    " ",
  );

  console.log('hashTitle tests passed');
}

runHashTitleTests();
