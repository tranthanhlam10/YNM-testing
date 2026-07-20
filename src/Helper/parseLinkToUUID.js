import { v5 as uuidv5 } from 'uuid';

const URL_NAMESPACE = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';

function youtubeToUUID(url) {
  const normalized = url.replace(/^https?:\/\//, '');
  return uuidv5(normalized, URL_NAMESPACE);
}

// Test
console.log(youtubeToUUID("youtube.com/watch?v=GLasPd9rnqs"));
