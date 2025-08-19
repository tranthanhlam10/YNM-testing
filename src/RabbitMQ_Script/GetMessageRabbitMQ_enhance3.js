import axios from 'axios';
import { createWriteStream } from 'fs';
import csvWriter from 'csv-write-stream';
import { promises as fs } from 'fs';

async function peekMessagesInBatches(method, domain, queueName, userName, passWord, totalCount, batchSize = 500) {
  try {
    console.log(`Starting to peek ${totalCount} messages in batches of ${batchSize}...`);
    
    const encodedQueueName = encodeURIComponent(queueName);
    const url = `${method}://${domain}/api/queues/%2F/${encodedQueueName}/get`;
    
    let allPayloads = [];
    let allRawMessages = [];
    let processedCount = 0;
    let batchNumber = 1;
    
    // Tạo thư mục để lưu batch files
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const batchDir = `batch_messages_${timestamp}`;
    await fs.mkdir(batchDir, { recursive: true });
    
    while (processedCount < totalCount) {
      const remainingCount = totalCount - processedCount;
      const currentBatchSize = Math.min(batchSize, remainingCount);
      
      console.log(`\n--- Batch ${batchNumber}: Getting ${currentBatchSize} messages (${processedCount + 1} - ${processedCount + currentBatchSize}) ---`);
      
      try {
        const batchResult = await fetchSingleBatch(url, userName, passWord, currentBatchSize);
        
        if (!batchResult.success) {
          console.error(`Batch ${batchNumber} failed:`, batchResult.error);
          break;
        }
        
        if (batchResult.messages.length === 0) {
          console.log(`No more messages available in queue. Stopping at batch ${batchNumber}.`);
          break;
        }
        
        // Lưu batch raw data
        await fs.writeFile(
          `${batchDir}/raw_batch_${batchNumber.toString().padStart(3, '0')}.json`,
          JSON.stringify(batchResult.messages, null, 2)
        );
        
        // Process messages từ batch này
        const batchPayloads = await processBatchMessages(batchResult.messages, batchNumber, batchDir);
        
        allPayloads.push(...batchPayloads);
        allRawMessages.push(...batchResult.messages);
        processedCount += batchResult.messages.length;
        batchNumber++;
        
        console.log(`Batch ${batchNumber - 1} completed: ${batchResult.messages.length} messages processed`);
        console.log(`Total processed so far: ${processedCount}/${totalCount}`);
        
        // Delay ngắn giữa các batch để tránh quá tải server
        if (processedCount < totalCount) {
          console.log('Waiting 2 seconds before next batch...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
      } catch (batchError) {
        console.error(`Error in batch ${batchNumber}:`, batchError.message);
        
        // Lưu error log
        await fs.writeFile(
          `${batchDir}/batch_${batchNumber}_error.json`,
          JSON.stringify({
            batchNumber,
            error: batchError.message,
            stack: batchError.stack,
            timestamp: new Date().toISOString()
          }, null, 2)
        );
        
        // Có thể continue hoặc break tùy thuộc vào loại lỗi
        if (batchError.code === 'ECONNABORTED' || batchError.response?.status === 504) {
          console.log('Timeout error - continuing with next batch...');
          batchNumber++;
          continue;
        } else {
          console.log('Critical error - stopping batch processing');
          break;
        }
      }
    }
    
    console.log(`\n=== BATCH PROCESSING COMPLETED ===`);
    console.log(`Total messages processed: ${allPayloads.length}`);
    console.log(`Total batches: ${batchNumber - 1}`);
    
    if (allPayloads.length === 0) {
      console.log('No valid payloads found in any batch.');
      return { success: true, totalMessages: 0, batchDir };
    }
    
    // Tạo CSV tổng hợp từ tất cả batches
    await createConsolidatedFiles(allPayloads, allRawMessages, batchDir);
    
    return {
      success: true,
      totalMessages: allPayloads.length,
      totalBatches: batchNumber - 1,
      batchDir
    };
    
  } catch (error) {
    console.error('Critical error in batch processing:');
    console.error(error.stack);
    return { success: false, error: error.message };
  }
}

async function fetchSingleBatch(url, userName, passWord, batchSize) {
  try {
    console.log(`Fetching batch of ${batchSize} messages from: ${url}`);
    
    const response = await axios({
      method: 'post',
      url: url,
      auth: {
        username: userName,
        password: passWord
      },
      data: {
        count: batchSize,
        encoding: 'auto',
        ackmode: 'reject_requeue_true',
        truncate: 500000
      },
      timeout: 60000, // 60 seconds timeout cho mỗi batch
      headers: {
        'Content-Type': 'application/json'
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
    
    return {
      success: true,
      messages: response.data || []
    };
    
  } catch (error) {
    return {
      success: false,
      error: error
    };
  }
}

async function processBatchMessages(messages, batchNumber, batchDir) {
  const payloads = [];
  const failedMessages = [];
  
  for (let i = 0; i < messages.length; i++) {
    try {
      const message = messages[i];
      let payload;
      
      if (message.payload) {
        if (typeof message.payload === 'string') {
          try {
            payload = JSON.parse(message.payload);
          } catch (parseErr) {
            payload = { raw_payload: message.payload };
          }
        } else {
          payload = message.payload;
        }
        
        payloads.push(payload);
      } else {
        console.warn(`Message ${i + 1} in batch ${batchNumber} doesn't have payload`);
        failedMessages.push({ messageIndex: i, message });
      }
    } catch (err) {
      console.error(`Error processing message ${i + 1} in batch ${batchNumber}:`, err.message);
      failedMessages.push({ messageIndex: i, error: err.message, message: messages[i] });
    }
  }
  
  // Lưu failed messages nếu có
  if (failedMessages.length > 0) {
    await fs.writeFile(
      `${batchDir}/failed_messages_batch_${batchNumber.toString().padStart(3, '0')}.json`,
      JSON.stringify(failedMessages, null, 2)
    );
  }
  
  // Lưu processed payloads của batch này
  await fs.writeFile(
    `${batchDir}/processed_batch_${batchNumber.toString().padStart(3, '0')}.json`,
    JSON.stringify(payloads, null, 2)
  );
  
  return payloads;
}

async function createConsolidatedFiles(allPayloads, allRawMessages, batchDir) {
  try {
    console.log('\nCreating consolidated files...');
    
    // Lưu tất cả raw messages
    await fs.writeFile(
      `${batchDir}/all_raw_messages.json`,
      JSON.stringify(allRawMessages, null, 2)
    );
    
    // Lưu tất cả processed payloads
    await fs.writeFile(
      `${batchDir}/all_processed_messages.json`,
      JSON.stringify(allPayloads, null, 2)
    );
    
    // Tạo CSV tổng hợp
    const allKeys = new Set();
    allPayloads.forEach(payload => {
      const flattened = flattenObject(payload);
      Object.keys(flattened).forEach(key => allKeys.add(key));
    });
    
    const headers = Array.from(allKeys);
    const writer = csvWriter({ headers });
    const fileStream = createWriteStream(`${batchDir}/all_messages.csv`, { encoding: 'utf8' });
    
    writer.pipe(fileStream);
    
    for (const payload of allPayloads) {
      const flattened = flattenObject(payload);
      
      Object.keys(flattened).forEach(key => {
        const value = flattened[key];
        
        if (value !== null && typeof value === 'object') {
          flattened[key] = JSON.stringify(value);
        }
        
        if (typeof flattened[key] === 'string') {
          flattened[key] = flattened[key].replace(/"/g, '""');
        }
      });
      
      writer.write(flattened);
    }
    
    writer.end();
    
    // Tạo summary file
    const summary = {
      totalMessages: allPayloads.length,
      totalRawMessages: allRawMessages.length,
      processedAt: new Date().toISOString(),
      files: {
        csv: `${batchDir}/all_messages.csv`,
        allProcessed: `${batchDir}/all_processed_messages.json`,
        allRaw: `${batchDir}/all_raw_messages.json`
      }
    };
    
    await fs.writeFile(
      `${batchDir}/summary.json`,
      JSON.stringify(summary, null, 2)
    );
    
    console.log(`\n=== FILES CREATED ===`);
    console.log(`📁 Batch directory: ${batchDir}/`);
    console.log(`📊 CSV file: ${batchDir}/all_messages.csv`);
    console.log(`📄 All processed: ${batchDir}/all_processed_messages.json`);
    console.log(`📄 All raw: ${batchDir}/all_raw_messages.json`);
    console.log(`📋 Summary: ${batchDir}/summary.json`);
    
  } catch (error) {
    console.error('Error creating consolidated files:', error);
    throw error;
  }
}

function flattenObject(obj, prefix = '') {
  if (!obj || typeof obj !== 'object') return {};
  
  const result = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const pre = prefix.length ? prefix + '.' : '';
      
      if (obj[key] === null) {
        result[pre + key] = null;
      } else if (Array.isArray(obj[key])) {
        result[pre + key] = JSON.stringify(obj[key]);
      } else if (typeof obj[key] === 'object') {
        Object.assign(result, flattenObject(obj[key], pre + key));
      } else {
        result[pre + key] = obj[key];
      }
    }
  }
  
  return result;
}

// Configuration
const testHTTP = 'http';
const stagingHTTP = 'https';

const testDomain = 'rabbitmq-testing.ynm.local';
const stagingDomain = 'rabbitmq-staging.younetmedia.com';

const queueName = "staging.cl.posts_2_solr_yt_posts";

const userName = 'lamtt'; 
const testPassword = 'lamtt';
const stagingPassword = 'vYoWn4KCmDYpvuFiqovWbF';

// Usage example - lấy 10000 messages, mỗi batch 500
peekMessagesInBatches(
  stagingHTTP, 
  stagingDomain, 
  queueName, 
  userName, 
  stagingPassword,
  10000, // Total messages to fetch
  500    // Batch size
).then(result => {
  if (result.success) {
    console.log(`\n✅ Successfully completed! Processed ${result.totalMessages} messages in ${result.totalBatches} batches.`);
    console.log(`📁 Check folder: ${result.batchDir}`);
  } else {
    console.error(`❌ Process failed: ${result.error}`);
  }
}).catch(error => {
  console.error('❌ Unexpected error:', error);
});