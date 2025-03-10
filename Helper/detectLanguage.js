import LanguageDetector from 'languagedetect';

function detectVietnameseLanguage(text) {
  if (!text) return false;
  const languageDetector = new LanguageDetector();
  return languageDetector.detect(text, 3).some(i => i[0] == 'vietnamese');
}

const TEXT = 'Hi, its been since 2023 🤭 Who do I remind you ';

console.log(detectVietnameseLanguage(TEXT));
