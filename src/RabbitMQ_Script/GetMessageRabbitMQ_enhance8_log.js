import axios from 'axios';
import { promises as fs } from 'fs';
import crypto from 'crypto';

// ============================================================
// ⚙️  MASTER CONFIG — chỉ cần chỉnh ở đây
// ============================================================
const ACTIVE_ENV = 'staging'; // 👈 Đổi: 'testing' | 'staging'

const ENVIRONMENTS = {
  testing: {
    method:   'http',
    domain:   'rabbitmq-testing.ynm.local',
    userName: 'lamtt',
    password: 'lamtt',
  },
  staging: {
    method:   'https',
    domain:   'rabbitmq-staging.younetmedia.com',
    userName: 'lamtt',
    password: 'vYoWn4KCmDYpvuFiqovWbF',
  },
};

// Queue muốn peek
const TARGET_QUEUE = 'staging.cl.tt.identity_countries_crawling_sources.nganltk'; // 👈 Đổi queue

// Tuning
const BATCH_SIZE  = 300;
const CONCURRENCY = 2;

// Dup logging: 'none' | 'id' | 'full'
// - 'none' : chỉ log số lượng dup
// - 'id'   : log thêm id/key của từng dup (dùng ID_FIELDS để tự detect)
// - 'full' : log toàn bộ nội dung message bị dup
const DUP_LOG_MODE = 'id'; // 👈 Đổi

// Các field được dùng để đại diện cho ID khi DUP_LOG_MODE = 'id'
// Script sẽ lấy field đầu tiên tìm thấy trong message
const ID_FIELDS = ['id', '_id', 'messageId', 'message_id', 'uuid', 'postId', 'post_id'];
// ============================================================

const { method, domain, userName, password } = ENVIRONMENTS[ACTIVE_ENV];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function hashMessage(msg) {
  const { _message_metadata, ...content } = msg;
  return crypto.createHash('md5').update(JSON.stringify(content)).digest('hex');
}

function extractId(msg) {
  for (const field of ID_FIELDS) {
    if (msg[field] !== undefined) return { field, value: msg[field] };
  }
  // Fallback: lấy 60 ký tự đầu của JSON
  return { field: '(raw)', value: JSON.stringify(msg).slice(0, 60) + '...' };
}

function logDuplicate(msg, hash, dupIndex) {
  if (DUP_LOG_MODE === 'none') return;

  if (DUP_LOG_MODE === 'id') {
    const { field, value } = extractId(msg);
    console.log(`   🔁 Dup #${dupIndex}  hash=${hash.slice(0, 8)}  ${field}=${JSON.stringify(value)}`);
  } else if (DUP_LOG_MODE === 'full') {
    console.log(`   🔁 Dup #${dupIndex}  hash=${hash.slice(0, 8)}`);
    console.log(JSON.stringify(msg, null, 4));
  }
}

// ─────────────────────────────────────────────
// Core
// ─────────────────────────────────────────────
async function peekAllMessagesInBatches(batchSize = 500, concurrency = 3) {
  try {
    console.log(`🌍 Environment : ${ACTIVE_ENV.toUpperCase()}`);
    console.log(`📬 Queue       : ${TARGET_QUEUE}`);
    console.log(`🔍 Dup log mode: ${DUP_LOG_MODE.toUpperCase()}\n`);

    const queueInfo = await getQueueInfo();
    if (!queueInfo.success) throw new Error(`Failed to get queue info: ${queueInfo.error}`);

    const totalMessages = queueInfo.messageCount;
    console.log(`📊 Queue contains ${totalMessages} messages`);
    console.log(`⚡ Concurrency : ${concurrency} workers`);

    if (totalMessages === 0) {
      console.log('✅ Queue is empty, nothing to process');
      return { success: true, totalMessages: 0, processedMessages: 0 };
    }

    const encodedQueueName = encodeURIComponent(TARGET_QUEUE);
    const url = `${method}://${domain}/api/queues/%2F/${encodedQueueName}/get`;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputDir = `Data_get_from_rabbitMQ_by_scripts/messages_${TARGET_QUEUE.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}`;
    await fs.mkdir(outputDir, { recursive: true });

    const messagesPerWorker = Math.ceil(totalMessages / concurrency);

    const result = await processConcurrently(url, totalMessages, batchSize, concurrency, messagesPerWorker, outputDir);

    console.log(`\n🎯 PROCESSING COMPLETED`);
    console.log(`📊 Expected   : ${totalMessages}`);
    console.log(`✅ Unique      : ${result.allPayloads.length}`);
    console.log(`🔁 Duplicates : ${result.dupCount}`);
    console.log(`📦 Batches    : ${result.totalBatches}`);
    console.log(`⏱️  Time       : ${result.totalTime}s`);
    console.log(`⚡ Speed      : ${(result.allPayloads.length / result.totalTime).toFixed(0)} msgs/sec`);

    if (result.allPayloads.length === 0) {
      console.log('⚠️  No valid payloads found.');
      return { success: true, totalMessages: 0, processedMessages: 0, outputDir };
    }

    await createFinalOutput(result.allPayloads, totalMessages, outputDir, result.totalTime, result.dupCount, result.dupDetails);

    return {
      success: true,
      totalMessages,
      processedMessages: result.allPayloads.length,
      dupCount: result.dupCount,
      totalBatches: result.totalBatches,
      totalTime: result.totalTime,
      outputDir,
    };
  } catch (error) {
    console.error('💥 Critical error:', error.stack);
    return { success: false, error: error.message };
  }
}

async function processConcurrently(url, totalMessages, batchSize, concurrency, messagesPerWorker, outputDir) {
  const startTime = Date.now();
  const allPayloads = [];
  const errors = [];
  let totalBatches = 0;
  const workerProgress = Array(concurrency).fill(0);

  const worker = async (workerId) => {
    const workerMessages = [];
    let workerBatchCount = 0;
    let fetchedCount = 0;

    console.log(`[Worker ${workerId}] 🏃 Starting — target: ${messagesPerWorker} messages`);

    while (fetchedCount < messagesPerWorker) {
      const currentBatchSize = Math.min(batchSize, messagesPerWorker - fetchedCount);
      if (currentBatchSize <= 0) break;

      workerBatchCount++;
      const globalBatchNum = totalBatches + workerBatchCount;

      console.log(`[Worker ${workerId}] 📦 Batch ${workerBatchCount}: fetching ${currentBatchSize} messages`);

      try {
        const batchResult = await fetchSingleBatch(url, currentBatchSize);

        if (!batchResult.success) {
          errors.push({ workerId, batchNumber: workerBatchCount, error: batchResult.error.message, timestamp: new Date().toISOString() });
          const delay = Math.min(30000, 2000 * Math.pow(1.5, errors.filter(e => e.workerId === workerId).length));
          console.log(`[Worker ${workerId}] 🔄 Retry in ${(delay / 1000).toFixed(1)}s...`);
          await new Promise(r => setTimeout(r, delay));
          continue;
        }

        if (batchResult.messages.length === 0) {
          console.log(`[Worker ${workerId}] ⚠️  Queue exhausted at batch ${workerBatchCount}`);
          break;
        }

        const batchPayloads = processBatchMessages(batchResult.messages, globalBatchNum, workerId);
        await fs.writeFile(
          `${outputDir}/worker${workerId}_batch_${workerBatchCount.toString().padStart(3, '0')}.json`,
          JSON.stringify(batchPayloads, null, 2)
        );

        workerMessages.push(...batchPayloads);
        fetchedCount += batchResult.messages.length;
        workerProgress[workerId - 1] = fetchedCount;

        const totalFetched = workerProgress.reduce((a, b) => a + b, 0);
        console.log(`[Worker ${workerId}] ✅ Batch done: ${batchResult.messages.length} msgs | Overall: ${totalFetched}/${totalMessages} (${((totalFetched / totalMessages) * 100).toFixed(1)}%)`);

        if (fetchedCount >= messagesPerWorker) break;
        await new Promise(r => setTimeout(r, 300));

      } catch (err) {
        errors.push({ workerId, batchNumber: workerBatchCount, error: err.message, timestamp: new Date().toISOString() });
        const delay = Math.min(30000, 2000 * Math.pow(1.5, errors.filter(e => e.workerId === workerId).length));
        console.log(`[Worker ${workerId}] 🔄 Retry in ${(delay / 1000).toFixed(1)}s...`);
        await new Promise(r => setTimeout(r, delay));
      }
    }

    console.log(`[Worker ${workerId}] 🏁 Done — ${fetchedCount} messages in ${workerBatchCount} batches`);
    return { workerId, messages: workerMessages, batchCount: workerBatchCount, messageCount: fetchedCount };
  };

  console.log(`\n🚀 Launching ${concurrency} workers...\n`);
  const workerResults = await Promise.all(
    Array.from({ length: concurrency }, (_, i) => worker(i + 1))
  );

  // ── Dedup + dup logging ──
  const seen = new Map(); // hash → first occurrence index in allPayloads
  const dupDetails = [];  // sẽ ghi vào file nếu DUP_LOG_MODE !== 'none'
  let dupCount = 0;

  if (DUP_LOG_MODE !== 'none') {
    console.log(`\n🔍 Dedup scan (mode: ${DUP_LOG_MODE})...`);
  }

  for (const result of workerResults) {
    totalBatches += result.batchCount;
    for (const msg of result.messages) {
      const hash = hashMessage(msg);
      if (!seen.has(hash)) {
        seen.set(hash, allPayloads.length);
        allPayloads.push(msg);
      } else {
        dupCount++;
        logDuplicate(msg, hash, dupCount);

        if (DUP_LOG_MODE !== 'none') {
          const entry = { dupIndex: dupCount, hash, originalIndex: seen.get(hash) };
          if (DUP_LOG_MODE === 'id') {
            entry.id = extractId(msg);
          } else if (DUP_LOG_MODE === 'full') {
            entry.content = msg;
          }
          dupDetails.push(entry);
        }
      }
    }
  }

  if (dupCount === 0) {
    console.log('\n✅ No duplicates found');
  } else {
    console.log(`\n🔁 Removed ${dupCount} duplicates — ${allPayloads.length} unique messages kept`);
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(`\n📊 WORKER SUMMARY:`);
  workerResults.forEach(r => console.log(`   Worker ${r.workerId}: ${r.messageCount} msgs / ${r.batchCount} batches`));

  if (errors.length > 0) {
    await fs.writeFile(`${outputDir}/errors_summary.json`, JSON.stringify(errors, null, 2));
    console.log(`\n⚠️  ${errors.length} errors logged → ${outputDir}/errors_summary.json`);
  }

  return { allPayloads, totalBatches, totalTime, dupCount, dupDetails, errors, workerResults };
}

// ─────────────────────────────────────────────
// API helpers
// ─────────────────────────────────────────────
async function getQueueInfo() {
  try {
    const url = `${method}://${domain}/api/queues/%2F/${encodeURIComponent(TARGET_QUEUE)}`;
    console.log(`🔍 Queue info: ${url}`);
    const response = await axios({ method: 'get', url, auth: { username: userName, password }, timeout: 30000 });
    return {
      success: true,
      messageCount: response.data.messages || 0,
      queueInfo: {
        name: response.data.name,
        messages: response.data.messages,
        consumers: response.data.consumers,
        state: response.data.state,
      },
    };
  } catch (error) {
    console.error('❌ Error getting queue info:', error.message);
    return { success: false, error: error.message };
  }
}

async function fetchSingleBatch(url, batchSize) {
  try {
    const response = await axios({
      method: 'post', url,
      auth: { username: userName, password },
      data: { count: batchSize, encoding: 'auto', ackmode: 'reject_requeue_true', truncate: 500000 },
      timeout: 60000,
      headers: { 'Content-Type': 'application/json' },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
    return { success: true, messages: response.data || [] };
  } catch (error) {
    return { success: false, error };
  }
}

function processBatchMessages(messages, batchNumber, workerId) {
  return messages.map((message, i) => {
    try {
      if (!message.payload) return { _no_payload: true };
      if (typeof message.payload === 'string') {
        try { return JSON.parse(message.payload); }
        catch { return { _raw_payload: message.payload, _parse_error: true }; }
      }
      return message.payload;
    } catch (err) {
      return { _processing_error: true, _error_message: err.message, _message_metadata: { batch_number: batchNumber, worker_id: workerId, message_index: i + 1 } };
    }
  });
}

// ─────────────────────────────────────────────
// Output
// ─────────────────────────────────────────────
async function createFinalOutput(allPayloads, expectedTotal, outputDir, totalTime, dupCount, dupDetails) {
  console.log('\n📝 Writing final output...');

  await fs.writeFile(`${outputDir}/all_messages.json`, JSON.stringify(allPayloads, null, 2));

  // Ghi file dup nếu có
  if (dupDetails.length > 0 && DUP_LOG_MODE !== 'none') {
    await fs.writeFile(`${outputDir}/duplicates.json`, JSON.stringify(dupDetails, null, 2));
    console.log(`🔁 Dup details → ${outputDir}/duplicates.json`);
  }

  const summary = {
    environment: ACTIVE_ENV,
    queue_name: TARGET_QUEUE,
    dup_log_mode: DUP_LOG_MODE,
    total_expected: expectedTotal,
    total_processed: allPayloads.length,
    duplicates_removed: dupCount,
    success_rate: ((allPayloads.length / expectedTotal) * 100).toFixed(2) + '%',
    processing_time_seconds: parseFloat(totalTime),
    messages_per_second: (allPayloads.length / parseFloat(totalTime)).toFixed(2),
    processed_at: new Date().toISOString(),
    statistics: {
      valid_messages: allPayloads.filter(p => !p._processing_error && !p._no_payload && !p._parse_error).length,
      messages_with_errors: allPayloads.filter(p => p._processing_error).length,
      messages_without_payload: allPayloads.filter(p => p._no_payload).length,
      messages_with_parse_errors: allPayloads.filter(p => p._parse_error).length,
    },
  };

  await fs.writeFile(`${outputDir}/summary.json`, JSON.stringify(summary, null, 2));

  console.log(`\n🎉 OUTPUT READY`);
  console.log(`📁 Dir     : ${outputDir}/`);
  console.log(`📄 Messages: ${outputDir}/all_messages.json`);
  console.log(`📊 Summary : ${outputDir}/summary.json`);
  console.log(`\n📈 STATS:`);
  console.log(`   ✅ Valid   : ${summary.statistics.valid_messages}`);
  console.log(`   🔁 Dups    : ${dupCount}`);
  console.log(`   ⚠️  Parse  : ${summary.statistics.messages_with_parse_errors}`);
  console.log(`   ❌ Errors  : ${summary.statistics.messages_with_errors}`);
  console.log(`   ⚡ Speed   : ${summary.messages_per_second} msgs/sec`);
}

// ============================================================
// Run
// ============================================================
peekAllMessagesInBatches(BATCH_SIZE, CONCURRENCY)
  .then(result => {
    if (result.success) {
      console.log(`\n🎊 SUCCESS! ${result.processedMessages}/${result.totalMessages} unique messages in ${result.totalTime}s`);
      console.log(`🔁 Duplicates removed: ${result.dupCount}`);
      console.log(`📁 Output: ${result.outputDir}`);
    } else {
      console.error(`💥 FAILED: ${result.error}`);
    }
  })
  .catch(err => console.error('💥 Unexpected error:', err));