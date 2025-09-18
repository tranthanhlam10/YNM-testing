import axios from 'axios';
import { promises as fs } from 'fs';

async function peekAllMessagesInBatches(method, domain, queueName, userName, passWord, batchSize = 500) {
  try {
    console.log('🔍 Getting queue information...');
    
    // Get queue info to know total message count
    const queueInfo = await getQueueInfo(method, domain, queueName, userName, passWord);
    if (!queueInfo.success) {
      throw new Error(`Failed to get queue info: ${queueInfo.error}`);
    }
    
    const totalMessages = queueInfo.messageCount;
    console.log(`📊 Queue "${queueName}" contains ${totalMessages} messages`);
    
    if (totalMessages === 0) {
      console.log('✅ Queue is empty, nothing to process');
      return { success: true, totalMessages: 0, processedMessages: 0 };
    }
    
    console.log(`🚀 Starting to fetch all ${totalMessages} messages in batches of ${batchSize}...`);
    
    const encodedQueueName = encodeURIComponent(queueName);
    const url = `${method}://${domain}/api/queues/%2F/${encodedQueueName}/get`;
    
    let allPayloads = [];
    let processedCount = 0;
    let batchNumber = 1;
    
    // Tạo thư mục để lưu kết quả
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseDir = 'Data_get_from_rabbitMQ_by_scripts';
    const outputDir = `${baseDir}/messages_${queueName.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}`
    await fs.mkdir(outputDir, { recursive: true });
    
    while (processedCount < totalMessages) {
      const remainingCount = totalMessages - processedCount;
      const currentBatchSize = Math.min(batchSize, remainingCount);
      
      console.log(`\n📦 Batch ${batchNumber}: Fetching ${currentBatchSize} messages (${processedCount + 1} - ${processedCount + currentBatchSize})`);
      
      try {
        const batchResult = await fetchSingleBatch(url, userName, passWord, currentBatchSize);
        
        if (!batchResult.success) {
          console.error(`❌ Batch ${batchNumber} failed:`, batchResult.error);
          break;
        }
        
        if (batchResult.messages.length === 0) {
          console.log(`✅ No more messages available. Queue exhausted at batch ${batchNumber}.`);
          break;
        }
        
        // Process messages từ batch này
        const batchPayloads = processBatchMessages(batchResult.messages, batchNumber);
        
        // Lưu batch này
        await fs.writeFile(
          `${outputDir}/batch_${batchNumber.toString().padStart(3, '0')}.json`,
          JSON.stringify(batchPayloads, null, 2)
        );
        
        allPayloads.push(...batchPayloads);
        processedCount += batchResult.messages.length;
        
        console.log(`✅ Batch ${batchNumber} completed: ${batchResult.messages.length} messages processed`);
        console.log(`📈 Progress: ${processedCount}/${totalMessages} (${((processedCount/totalMessages)*100).toFixed(1)}%)`);
        
        batchNumber++;
        
        // Kiểm tra xem đã đủ messages chưa
        if (processedCount >= totalMessages) {
          console.log('🎉 All messages fetched successfully!');
          break;
        }
        
        // Delay nhỏ giữa các batch
        if (processedCount < totalMessages) {
          console.log('⏳ Waiting 1 second before next batch...');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (batchError) {
        console.error(`❌ Error in batch ${batchNumber}:`, batchError.message);
        
        // Log error
        await fs.writeFile(
          `${outputDir}/batch_${batchNumber}_error.json`,
          JSON.stringify({
            batchNumber,
            error: batchError.message,
            stack: batchError.stack,
            timestamp: new Date().toISOString(),
            processedSoFar: processedCount
          }, null, 2)
        );
        
        // Retry logic cho timeout errors
        if (batchError.code === 'ECONNABORTED' || batchError.response?.status === 504) {
          console.log('🔄 Timeout error - retrying batch...');
          continue; // Retry same batch
        } else {
          console.log('💥 Critical error - stopping processing');
          break;
        }
      }
    }
    
    console.log(`\n🎯 PROCESSING COMPLETED`);
    console.log(`📊 Expected messages: ${totalMessages}`);
    console.log(`✅ Processed messages: ${allPayloads.length}`);
    console.log(`📦 Total batches: ${batchNumber - 1}`);
    
    if (allPayloads.length === 0) {
      console.log('⚠️ No valid payloads found.');
      return { success: true, totalMessages: 0, processedMessages: 0, outputDir };
    }
    
    // Tạo file tổng hợp
    await createFinalOutput(allPayloads, totalMessages, outputDir, queueName);
    
    return {
      success: true,
      totalMessages: totalMessages,
      processedMessages: allPayloads.length,
      totalBatches: batchNumber - 1,
      outputDir
    };
    
  } catch (error) {
    console.error('💥 Critical error in processing:');
    console.error(error.stack);
    return { success: false, error: error.message };
  }
}

async function getQueueInfo(method, domain, queueName, userName, passWord) {
  try {
    const encodedQueueName = encodeURIComponent(queueName);
    const url = `${method}://${domain}/api/queues/%2F/${encodedQueueName}`;
    
    console.log(`🔍 Checking queue info: ${url}`);
    
    const response = await axios({
      method: 'get',
      url: url,
      auth: {
        username: userName,
        password: passWord
      },
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const messageCount = response.data.messages || 0;
    
    return {
      success: true,
      messageCount: messageCount,
      queueInfo: {
        name: response.data.name,
        messages: response.data.messages,
        consumers: response.data.consumers,
        state: response.data.state
      }
    };
    
  } catch (error) {
    console.error('❌ Error getting queue info:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

async function fetchSingleBatch(url, userName, passWord, batchSize) {
  try {
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
      timeout: 60000,
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

function processBatchMessages(messages, batchNumber) {
  const payloads = [];
  
  for (let i = 0; i < messages.length; i++) {
    try {
      const message = messages[i];
      let payload;
      
      if (message.payload) {
        if (typeof message.payload === 'string') {
          try {
            payload = JSON.parse(message.payload);
          } catch (parseErr) {
            // Nếu không parse được JSON, lưu raw string
            payload = { 
              _raw_payload: message.payload,
              _parse_error: true 
            };
          }
        } else {
          payload = message.payload;
        }
        
        // Thêm metadata
        payload._message_metadata = {
          properties: message.properties || {},
          routing_key: message.routing_key || '',
          exchange: message.exchange || '',
          message_count: message.message_count || 0,
          batch_number: batchNumber,
          message_index: i + 1
        };
        
        payloads.push(payload);
      } else {
        console.warn(`⚠️ Message ${i + 1} in batch ${batchNumber} has no payload`);
        // Vẫn lưu message metadata ngay cả khi không có payload
        payloads.push({
          _no_payload: true,
          _message_metadata: {
            properties: message.properties || {},
            routing_key: message.routing_key || '',
            exchange: message.exchange || '',
            message_count: message.message_count || 0,
            batch_number: batchNumber,
            message_index: i + 1
          }
        });
      }
    } catch (err) {
      console.error(`❌ Error processing message ${i + 1} in batch ${batchNumber}:`, err.message);
      // Lưu error message
      payloads.push({
        _processing_error: true,
        _error_message: err.message,
        _message_metadata: {
          batch_number: batchNumber,
          message_index: i + 1
        }
      });
    }
  }
  
  return payloads;
}

async function createFinalOutput(allPayloads, expectedTotal, outputDir, queueName) {
  try {
    console.log('\n📝 Creating final output file...');
    
    // Tạo file tổng hợp tất cả messages
    const finalOutput = {
      metadata: {
        queue_name: queueName,
        total_expected: expectedTotal,
        total_processed: allPayloads.length,
        processing_complete: allPayloads.length >= expectedTotal,
        processed_at: new Date().toISOString(),
        output_directory: outputDir
      },
      messages: allPayloads
    };
    
    await fs.writeFile(
      `${outputDir}/all_messages.json`,
      JSON.stringify(finalOutput, null, 2)
    );
    
    // Tạo file summary
    const summary = {
      queue_name: queueName,
      total_expected: expectedTotal,
      total_processed: allPayloads.length,
      success_rate: ((allPayloads.length / expectedTotal) * 100).toFixed(2) + '%',
      processing_complete: allPayloads.length >= expectedTotal,
      processed_at: new Date().toISOString(),
      files: {
        main_output: `${outputDir}/all_messages.json`,
        summary: `${outputDir}/summary.json`
      },
      statistics: {
        messages_with_errors: allPayloads.filter(p => p._processing_error).length,
        messages_without_payload: allPayloads.filter(p => p._no_payload).length,
        messages_with_parse_errors: allPayloads.filter(p => p._parse_error).length,
        valid_messages: allPayloads.filter(p => !p._processing_error && !p._no_payload && !p._parse_error).length
      }
    };
    
    await fs.writeFile(
      `${outputDir}/summary.json`,
      JSON.stringify(summary, null, 2)
    );
    
    console.log(`\n🎉 OUTPUT FILES CREATED`);
    console.log(`📁 Directory: ${outputDir}/`);
    console.log(`📄 Main file: ${outputDir}/all_messages.json`);
    console.log(`📊 Summary: ${outputDir}/summary.json`);
    console.log(`\n📈 STATISTICS:`);
    console.log(`✅ Valid messages: ${summary.statistics.valid_messages}`);
    console.log(`⚠️ Parse errors: ${summary.statistics.messages_with_parse_errors}`);
    console.log(`❌ Processing errors: ${summary.statistics.messages_with_errors}`);
    console.log(`🚫 No payload: ${summary.statistics.messages_without_payload}`);
    
  } catch (error) {
    console.error('❌ Error creating final output:', error);
    throw error;
  }
}

// Configuration
const testHTTP = 'http';
const stagingHTTP = 'https';

const testDomain = 'rabbitmq-testing.ynm.local';
const stagingDomain = 'rabbitmq-staging.younetmedia.com';

const queueName = "staging.cl.tr.source_replies_no_cookie_crawled_sources";

const userName = 'lamtt'; 
const testPassword = 'lamtt';
const stagingPassword = 'vYoWn4KCmDYpvuFiqovWbF';

// Usage - tự động detect và fetch tất cả messages
peekAllMessagesInBatches(
  stagingHTTP, 
  stagingDomain, 
  queueName, 
  userName, 
  stagingPassword,
  500 // Batch size
).then(result => {
  if (result.success) {
    console.log(`\n🎊 SUCCESS! Processed ${result.processedMessages}/${result.totalMessages} messages.`);
    console.log(`📁 Check folder: ${result.outputDir}`);
  } else {
    console.error(`💥 FAILED: ${result.error}`);
  }
}).catch(error => {
  console.error('💥 Unexpected error:', error);
});