// test-facebook-urls.js
// Chạy với: node test-facebook-urls.js

// Hàm uniqBy tự implement (thay lodash)
function uniqBy(array, key) {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

// Hàm cần test
function transformToFacebookUrls(items) {
  const urls = items.map(source => ({
    postUrl: source.link
      .replace(/\/posts\/.+?\/(\d+).*/, '/posts/$1')
      .replace(/\/posts\/(\d+).*/, '/posts/$1'),
  }));
  const uniqueUrls = uniqBy(urls, 'postUrl');
  return uniqueUrls;
}

// Test data
const testData = [
  { link: 'https://facebook.com/posts/abc/123456789' },
  { link: 'https://facebook.com/posts/xyz/123456789?ref=share' },
  { link: 'https://facebook.com/posts/123456789' },
  { link: 'https://facebook.com/posts/123456789?param=value' },
  { link: 'https://facebook.com/posts/987654321' },
  { link: 'https://facebook.com/posts/abc/123456789/comment' }, // Duplicate với dòng 1
  { link: 'https://facebook.com/posts/def/987654321?foo=bar' }, // Duplicate với dòng 5
];

// Chạy test
console.log('=== TEST FACEBOOK URL TRANSFORM ===\n');

console.log('📥 INPUT:');
testData.forEach((item, index) => {
  console.log(`${index + 1}. ${item.link}`);
});

console.log('\n📤 OUTPUT:');
const result = transformToFacebookUrls(testData);
result.forEach((item, index) => {
  console.log(`${index + 1}. ${item.postUrl}`);
});

console.log(`\n📊 STATS:`);
console.log(`- Input: ${testData.length} URLs`);
console.log(`- Output: ${result.length} unique URLs`);
console.log(`- Removed: ${testData.length - result.length} duplicates`);

// Test chi tiết từng case
console.log('\n🔍 DETAILED TEST CASES:\n');

const testCases = [
  {
    name: 'URL có path giữa /posts/ và ID',
    input: 'https://facebook.com/posts/abc/123456789',
    expected: 'https://facebook.com/posts/123456789',
  },
  {
    name: 'URL có path và query params',
    input: 'https://facebook.com/posts/xyz/123456789?ref=share',
    expected: 'https://facebook.com/posts/123456789',
  },
  {
    name: 'URL đơn giản chỉ có ID',
    input: 'https://facebook.com/posts/123456789',
    expected: 'https://facebook.com/posts/123456789',
  },
  {
    name: 'URL có query params',
    input: 'https://facebook.com/posts/123456789?param=value',
    expected: 'https://facebook.com/posts/123456789',
  },
  {
    name: 'URL có path sau ID',
    input: 'https://facebook.com/posts/abc/123456789/comment',
    expected: 'https://facebook.com/posts/123456789',
  },
];

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
  const result = transformToFacebookUrls([{ link: testCase.input }]);
  const actual = result[0].postUrl;
  const isPassed = actual === testCase.expected;
  
  if (isPassed) passed++;
  else failed++;
  
  console.log(`Test ${index + 1}: ${isPassed ? '✅ PASS' : '❌ FAIL'} - ${testCase.name}`);
  console.log(`  Input:    ${testCase.input}`);
  console.log(`  Expected: ${testCase.expected}`);
  console.log(`  Actual:   ${actual}`);
  if (!isPassed) {
    console.log('  ⚠️  MISMATCH!');
  }
  console.log('');
});

console.log(`\n📈 SUMMARY:`);
console.log(`  Total: ${testCases.length}`);
console.log(`  ✅ Passed: ${passed}`);
console.log(`  ❌ Failed: ${failed}`);
console.log(`  Success Rate: ${((passed / testCases.length) * 100).toFixed(1)}%`);

// Test uniqueness
console.log('\n🔄 UNIQUENESS TEST:');
const duplicateTest = [
  { link: 'https://facebook.com/posts/abc/123' },
  { link: 'https://facebook.com/posts/xyz/123' },
  { link: 'https://facebook.com/posts/123' },
  { link: 'https://facebook.com/posts/def/123?param=1' },
];
const uniqueResult = transformToFacebookUrls(duplicateTest);
console.log(`  Input: ${duplicateTest.length} URLs (all same ID: 123)`);
console.log(`  Output: ${uniqueResult.length} unique URL(s)`);
console.log(`  Result: ${uniqueResult[0].postUrl}`);
console.log(`  ${uniqueResult.length === 1 ? '✅ Correctly removed duplicates' : '❌ Failed to remove duplicates'}`);