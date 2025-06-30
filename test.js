// test.js
import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';

async function fetchYouTubeSearch() {
  const query = 'Lê Dương Bảo Lâm';
  const encodedQuery = encodeURIComponent(query);
  const url = `https://www.youtube.com/results?search_query=${encodedQuery}&sp=CAISBAgBEAE%253D`;

  // Proxy dạng user:pass@host:port
  const proxy = 'http://media2014:8983UHDk33455skdjfkj@50.207.199.87:12345';  
  const agent = new HttpsProxyAgent(proxy);

  const headers = {
    'authority': 'www.youtube.com',
    'pragma': 'no-cache',
    'cache-control': 'no-cache',
    'sec-ch-ua': '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
    'sec-ch-ua-mobile': '?0',
    'upgrade-insecure-requests': '1',
    'accept-language': 'en-US,en;q=0.8,vi;q=0.6,co;q=0.4',
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'service-worker-navigation-preload': 'true',
    'sec-fetch-site': 'none',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-user': '?1',
    'sec-fetch-dest': 'document',
    'cookie': 'GPS=1; YSC=raDJu7dgOI4; VISITOR_INFO1_LIVE=os4M1Cx7I_k; PREF=tz=Asia.Saigon'
  };

  try {
    const response = await axios.get(url, {
      headers,
      httpsAgent: agent
    });

    console.log('✅ Status:', response.status);
    console.log('📄 First 500 chars:\n', response.data);
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

fetchYouTubeSearch();
