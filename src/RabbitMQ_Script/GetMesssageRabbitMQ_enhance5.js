import axios from 'axios';
import { promises as fs } from 'fs';

async function peekAllMessagesInBatches(method, domain, queueName, userName, passWord, batchSize = 500, concurrency = 3) {
  try {
    console.log('🔍 Getting queue information...');
    
    // Get queue info to know total message count
    const queueInfo = await getQueueInfo(method, domain, queueName, userName, passWord);
    if (!queueInfo.success) {
      throw new Error(`Failed to get queue info: ${queueInfo.error}`);
    }
    
    const totalMessages = queueInfo.messageCount;
    console.log(`📊 Queue "${queueName}" contains ${totalMessages} messages`);
    console.log(`⚡ Concurrency level: ${concurrency} parallel workers`);
    
    if (totalMessages === 0) {
      console.log('✅ Queue is empty, nothing to process');
      return { success: true, totalMessages: 0, processedMessages: 0 };
    }
    
    console.log(`🚀 Starting to fetch all ${totalMessages} messages in batches of ${batchSize}...`);
    
    const encodedQueueName = encodeURIComponent(queueName);
    const url = `${method}://${domain}/api/queues/%2F/${encodedQueueName}/get`;
    
    // Tạo thư mục để lưu kết quả
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseDir = 'Data_get_from_rabbitMQ_by_scripts';
    const outputDir = `${baseDir}/messages_${queueName.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}`;
    await fs.mkdir(outputDir, { recursive: true });
    
    // Tính tổng số messages mỗi worker sẽ fetch (để tránh trùng)
    const messagesPerWorker = Math.ceil(totalMessages / concurrency);
    
    console.log(`📋 Each worker will fetch approximately ${messagesPerWorker} messages`);
    
    // Concurrent processing - mỗi worker fetch tuần tự nhưng workers chạy song song
    const result = await processConcurrentlySequential(
      url, 
      userName, 
      passWord, 
      totalMessages, 
      batchSize, 
      concurrency,
      messagesPerWorker,
      outputDir
    );
    
    console.log(`\n🎯 PROCESSING COMPLETED`);
    console.log(`📊 Expected messages: ${totalMessages}`);
    console.log(`✅ Processed messages: ${result.allPayloads.length}`);
    console.log(`📦 Total batches: ${result.totalBatches}`);
    console.log(`⏱️  Total time: ${result.totalTime}s`);
    console.log(`⚡ Speed: ${(result.allPayloads.length / result.totalTime).toFixed(0)} messages/sec`);
    
    if (result.allPayloads.length === 0) {
      console.log('⚠️ No valid payloads found.');
      return { success: true, totalMessages: 0, processedMessages: 0, outputDir };
    }
    
    // Tạo file tổng hợp
    await createFinalOutput(result.allPayloads, totalMessages, outputDir, queueName, result.totalTime);
    
    return {
      success: true,
      totalMessages: totalMessages,
      processedMessages: result.allPayloads.length,
      totalBatches: result.totalBatches,
      totalTime: result.totalTime,
      outputDir
    };
    
  } catch (error) {
    console.error('💥 Critical error in processing:');
    console.error(error.stack);
    return { success: false, error: error.message };
  }
}

async function processConcurrentlySequential(url, userName, passWord, totalMessages, batchSize, concurrency, messagesPerWorker, outputDir) {
  const startTime = Date.now();
  const allPayloads = [];
  const errors = [];
  let totalBatches = 0;
  
  // Tạo array để track progress của từng worker
  const workerProgress = Array(concurrency).fill(0);
  
  // Worker function - mỗi worker fetch tuần tự một số lượng messages nhất định
  const worker = async (workerId) => {
    const workerMessages = [];
    let workerBatchCount = 0;
    let fetchedCount = 0;
    
    console.log(`[Worker ${workerId}] 🏃 Starting - target: ${messagesPerWorker} messages`);
    
    while (fetchedCount < messagesPerWorker) {
      const remainingForWorker = messagesPerWorker - fetchedCount;
      const currentBatchSize = Math.min(batchSize, remainingForWorker);
      
      if (currentBatchSize <= 0) break;
      
      workerBatchCount++;
      const globalBatchNum = totalBatches + workerBatchCount;
      
      console.log(`[Worker ${workerId}] 📦 Batch ${workerBatchCount}: Fetching ${currentBatchSize} messages (${fetchedCount + 1}-${fetchedCount + currentBatchSize})`);
      
      try {
        const batchResult = await fetchSingleBatch(url, userName, passWord, currentBatchSize);
        
        if (!batchResult.success) {
          console.error(`[Worker ${workerId}] ❌ Batch ${workerBatchCount} failed:`, batchResult.error.message);
          errors.push({
            workerId,
            batchNumber: workerBatchCount,
            error: batchResult.error.message
          });
          
          // Retry logic
          if (batchResult.error.code === 'ECONNABORTED' || batchResult.error.response?.status === 504) {
            console.log(`[Worker ${workerId}] 🔄 Retrying...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
          }
          break;
        }
        
        if (batchResult.messages.length === 0) {
          console.log(`[Worker ${workerId}] ⚠️ Queue exhausted at batch ${workerBatchCount}`);
          break;
        }
        
        // Process messages
        const batchPayloads = processBatchMessages(batchResult.messages, globalBatchNum, workerId);
        
        // Lưu batch file
        await fs.writeFile(
          `${outputDir}/worker${workerId}_batch_${workerBatchCount.toString().padStart(3, '0')}.json`,
          JSON.stringify(batchPayloads, null, 2)
        );
        
        workerMessages.push(...batchPayloads);
        fetchedCount += batchResult.messages.length;
        workerProgress[workerId - 1] = fetchedCount;
        
        // Show progress
        const totalFetched = workerProgress.reduce((a, b) => a + b, 0);
        const overallProgress = ((totalFetched / totalMessages) * 100).toFixed(1);
        
        console.log(`[Worker ${workerId}] ✅ Batch ${workerBatchCount} done: ${batchResult.messages.length} messages`);
        console.log(`[Worker ${workerId}] 📈 Worker progress: ${fetchedCount}/${messagesPerWorker} | Overall: ${totalFetched}/${totalMessages} (${overallProgress}%)`);
        
        // Kiểm tra nếu đã đủ messages cho worker này
        if (fetchedCount >= messagesPerWorker) {
          console.log(`[Worker ${workerId}] ✅ Target reached!`);
          break;
        }
        
        // Small delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
      } catch (batchError) {
        console.error(`[Worker ${workerId}] ❌ Error:`, batchError.message);
        errors.push({
          workerId,
          batchNumber: workerBatchCount,
          error: batchError.message
        });
        break;
      }
    }
    
    console.log(`[Worker ${workerId}] 🏁 Finished - fetched ${fetchedCount} messages in ${workerBatchCount} batches`);
    
    return {
      workerId,
      messages: workerMessages,
      batchCount: workerBatchCount,
      messageCount: fetchedCount
    };
  };
  
  // Chạy tất cả workers song song
  console.log(`\n🚀 Starting ${concurrency} workers...\n`);
  const workerPromises = [];
  for (let i = 1; i <= concurrency; i++) {
    workerPromises.push(worker(i));
  }
  
  // Đợi tất cả workers hoàn thành
  const workerResults = await Promise.all(workerPromises);
  
  // Tổng hợp kết quả
  for (const result of workerResults) {
    allPayloads.push(...result.messages);
    totalBatches += result.batchCount;
  }
  
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
  
  // Log summary
  console.log(`\n📊 WORKER SUMMARY:`);
  workerResults.forEach(r => {
    console.log(`   Worker ${r.workerId}: ${r.messageCount} messages in ${r.batchCount} batches`);
  });
  
  if (errors.length > 0) {
    console.log(`\n⚠️ Total errors: ${errors.length}`);
    await fs.writeFile(
      `${outputDir}/errors_summary.json`,
      JSON.stringify(errors, null, 2)
    );
  }
  
  return {
    allPayloads,
    totalBatches,
    totalTime,
    errors,
    workerResults
  };
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

function processBatchMessages(messages, batchNumber, workerId) {
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
          worker_id: workerId,
          message_index: i + 1
        };
        
        payloads.push(payload);
      } else {
        payloads.push({
          _no_payload: true,
          _message_metadata: {
            properties: message.properties || {},
            routing_key: message.routing_key || '',
            exchange: message.exchange || '',
            message_count: message.message_count || 0,
            batch_number: batchNumber,
            worker_id: workerId,
            message_index: i + 1
          }
        });
      }
    } catch (err) {
      console.error(`❌ Error processing message ${i + 1} in batch ${batchNumber}:`, err.message);
      payloads.push({
        _processing_error: true,
        _error_message: err.message,
        _message_metadata: {
          batch_number: batchNumber,
          worker_id: workerId,
          message_index: i + 1
        }
      });
    }
  }
  
  return payloads;
}

async function createFinalOutput(allPayloads, expectedTotal, outputDir, queueName, totalTime) {
  try {
    console.log('\n📝 Creating final output file...');
    
    // Tạo file tổng hợp
    const finalOutput = {
      metadata: {
        queue_name: queueName,
        total_expected: expectedTotal,
        total_processed: allPayloads.length,
        processing_complete: allPayloads.length >= expectedTotal,
        processed_at: new Date().toISOString(),
        processing_time_seconds: parseFloat(totalTime),
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
      processing_time_seconds: parseFloat(totalTime),
      messages_per_second: (allPayloads.length / parseFloat(totalTime)).toFixed(2),
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
    console.log(`⚡ Speed: ${summary.messages_per_second} msgs/sec`);
    
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

const queueName = "testing.cl.mentions_2_solr_mentions";

const userName = 'lamtt'; 
const testPassword = 'lamtt';
const stagingPassword = 'vYoWn4KCmDYpvuFiqovWbF';

// Usage - với concurrent processing (KHÔNG BỊ TRÙNG)
peekAllMessagesInBatches(
  testHTTP, 
  testDomain, 
  queueName, 
  userName, 
  testPassword,
  1000, // Batch size - số messages mỗi lần fetch
  5     // Concurrency - số workers chạy song song (1-10)
        // VD: 10000 messages, 5 workers => mỗi worker fetch 2000 messages tuần tự
        // Nhưng 5 workers chạy đồng thời => NHANH GẤP 5 LẦN!
).then(result => {
  if (result.success) {
    console.log(`\n🎊 SUCCESS! Processed ${result.processedMessages}/${result.totalMessages} messages in ${result.totalTime}s.`);
    console.log(`📁 Check folder: ${result.outputDir}`);
  } else {
    console.error(`💥 FAILED: ${result.error}`);
  }
}).catch(error => {
  console.error('💥 Unexpected error:', error);
});