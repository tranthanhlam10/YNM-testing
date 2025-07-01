import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import fs from 'fs';

// Convert proxy từ CSV format thành code format
function convertProxyFormat(csvProxy) {
  try {
    // CSV: 165.231.157:12345:media2014:8983UHDk33455skdjfkjconvertProxyFormat
    // Code: http://media2014:8983UHDk33455skdjfkj@165.231.157:12345
    
    const parts = csvProxy.trim().split(':');
    if (parts.length !== 4) {
      console.error(`❌ Invalid proxy format: ${csvProxy}`);
      return null;
    }
    
    const [host, port, username, password] = parts;
    const proxyUrl = `http://${username}:${password}@${host}:${port}`;
    console.log(`🔄 Converted: ${csvProxy} → ${proxyUrl}`);
    return proxyUrl;
  } catch (error) {
    console.error('❌ Error converting proxy:', error.message);
    return null;
  }
}

// Đọc CSV file
function readProxyCSV(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      return [];
    }
    
    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.trim().split('\n');
    
    if (lines.length < 2) {
      console.error('❌ CSV must have header + data rows');
      return [];
    }
    
    console.log(`📁 Reading ${lines.length - 1} proxies from CSV...`);
    
    // Parse header
    const headers = lines[0].split(',').map(h => h.trim().replace(/['"]/g, ''));
    console.log(`📋 Headers: ${headers.join(', ')}`);
    
    // Parse data
    const proxies = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',').map(v => v.trim().replace(/['"]/g, ''));
      const proxyData = {};
      
      headers.forEach((header, index) => {
        proxyData[header] = values[index] || '';
      });
      
      // Convert proxy format
      if (proxyData.proxy) {
        const convertedProxy = convertProxyFormat(proxyData.proxy);
        if (convertedProxy) {
          proxyData.convertedProxy = convertedProxy;
          proxies.push(proxyData);
        } else {
          console.warn(`⚠️ Skipping invalid proxy for ID: ${proxyData.id}`);
        }
      }
    }
    
    console.log(`✅ Successfully loaded ${proxies.length} valid proxies`);
    return proxies;
    
  } catch (error) {
    console.error('❌ Error reading CSV:', error.message);
    return [];
  }
}

// Test YouTube với 1 proxy
async function testYouTubeWithProxy(proxyData, index, total) {
  const query = 'Lê Dương Bảo Lâm';
  const encodedQuery = encodeURIComponent(query);
  const url = `https://www.youtube.com/results?search_query=${encodedQuery}&sp=CAISBAgBEAE%253D`;
  
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
  };

  // Add cookie if exists
  if (proxyData.cookie && proxyData.cookie.trim()) {
    headers['Cookie'] = proxyData.cookie;
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 Testing [${index + 1}/${total}] ID: ${proxyData.id}`);
  console.log(`📍 Original: ${proxyData.proxy}`);
  console.log(`🔗 Converted: ${proxyData.convertedProxy}`);
  console.log(`📅 Expires: ${proxyData.expired_date || 'N/A'}`);

  try {
    const agent = new HttpsProxyAgent(proxyData.convertedProxy);
    const startTime = Date.now();
    
    const response = await axios.get(url, {
      headers,
      httpsAgent: agent,
      timeout: 30000,
      maxRedirects: 5
    });
    
    const responseTime = Date.now() - startTime;
    const dataSize = response.data ? response.data.length : 0;
    
    console.log(`✅ SUCCESS!`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Time: ${responseTime}ms`);
    console.log(`   Size: ${dataSize} chars`);
    console.log(`   Title check: ${response.data.includes('YouTube') ? 'OK' : 'FAIL'}`);
    
    return {
      id: proxyData.id,
      originalProxy: proxyData.proxy,
      convertedProxy: proxyData.convertedProxy,
      status: 'SUCCESS',
      statusCode: response.status,
      responseTime: responseTime,
      dataSize: dataSize,
      expired_date: proxyData.expired_date,
      hasYouTubeTitle: response.data.includes('YouTube')
    };
    
  } catch (error) {
    const errorMsg = error.code || error.message || 'Unknown error';
    console.log(`❌ FAILED: ${errorMsg}`);
    
    return {
      id: proxyData.id,
      originalProxy: proxyData.proxy,
      convertedProxy: proxyData.convertedProxy,
      status: 'FAILED',
      error: errorMsg,
      expired_date: proxyData.expired_date
    };
  }
}

// Main function
async function testAllProxies(csvFilePath = 'proxies.csv') {
  console.log('🎯 YouTube Proxy Tester Started');
  console.log('='.repeat(60));
  
  const proxies = readProxyCSV(csvFilePath);
  
  if (proxies.length === 0) {
    console.log('❌ No valid proxies found. Exiting...');
    return;
  }
  
  const results = [];
  const startTime = Date.now();
  
  // Test each proxy
  for (let i = 0; i < proxies.length; i++) {
    const result = await testYouTubeWithProxy(proxies[i], i, proxies.length);
    results.push(result);
    
    // Small delay between requests
    if (i < proxies.length - 1) {
      console.log('⏳ Waiting 2 seconds...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Summary
  const totalTime = Date.now() - startTime;
  const successful = results.filter(r => r.status === 'SUCCESS');
  const failed = results.filter(r => r.status === 'FAILED');
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 FINAL SUMMARY');
  console.log('='.repeat(60));
  console.log(`⏱️  Total time: ${Math.round(totalTime/1000)}s`);
  console.log(`📈 Success rate: ${successful.length}/${results.length} (${((successful.length/results.length)*100).toFixed(1)}%)`);
  console.log(`✅ Working: ${successful.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  
  if (successful.length > 0) {
    console.log('\n🎉 WORKING PROXIES:');
    successful.forEach((r, i) => {
      console.log(`   ${i+1}. ID:${r.id} | ${r.responseTime}ms | ${r.originalProxy}`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\n💥 FAILED PROXIES:');
    failed.forEach((r, i) => {
      console.log(`   ${i+1}. ID:${r.id} | ${r.error} | ${r.originalProxy}`);
    });
  }
  
  // Save results
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const resultFile = `proxy_test_results_${timestamp}.json`;
  
  try {
    fs.writeFileSync(resultFile, JSON.stringify({
      testDate: new Date().toISOString(),
      totalTested: results.length,
      successful: successful.length,
      failed: failed.length,
      successRate: ((successful.length/results.length)*100).toFixed(1) + '%',
      results: results
    }, null, 2));
    
    console.log(`\n💾 Results saved to: ${resultFile}`);
  } catch (error) {
    console.error('❌ Failed to save results:', error.message);
  }
}

// Run the test
console.log('Starting proxy test...');
testAllProxies('news_forum_proxies_202507011042_Lamtt_Test.csv').then(() => {
  console.log('\n🏁 Test completed!');
}).catch(error => {
  console.error('❌ Test failed:', error.message);
});