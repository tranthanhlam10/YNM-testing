// ============================================================
// ⚙️  MASTER CONFIG
// ============================================================
const ACTIVE_ENV = 'testing';

const ENVIRONMENTS = {
  testing: { method: 'http',  domain: 'rabbitmq-testing.ynm.local',          userName: 'lamtt', password: 'lamtt' },
  staging: { method: 'https', domain: 'rabbitmq-staging.younetmedia.com',    userName: 'lamtt', password: 'vYoWn4KCmDYpvuFiqovWbF' },
};

const TARGET_QUEUE = "eca_shopee_product_item_unify_crawling";
const BATCH_SIZE    = 200;
const CONCURRENCY   = 5;

// Dừng khi không tìm được message mới sau N batch LIÊN TIẾP (tính trên tất cả workers)
// Tăng nếu queue lớn và dup nhiều, giảm nếu muốn nhanh hơn
const STOP_AFTER_STALE_BATCHES = 3;

// 'none' | 'id' | 'full'
const DUP_LOG_MODE = 'id';
const ID_FIELDS    = ['id', '_id', 'messageId', 'message_id', 'uuid', 'postId', 'post_id'];
// ============================================================

const { method, domain, userName, password } = ENVIRONMENTS[ACTIVE_ENV];

import axios from 'axios';
import { promises as fs } from 'fs';
import crypto from 'crypto';

function hashMessage(msg) {
  const { _message_metadata, ...content } = msg;
  return crypto.createHash('md5').update(JSON.stringify(content)).digest('hex');
}

function extractId(msg) {
  for (const field of ID_FIELDS) {
    if (msg[field] !== undefined) return { field, value: msg[field] };
  }
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

// ─────────────────────────────────────────────────────────────
// Shared state giữa các workers
// ─────────────────────────────────────────────────────────────
function createSharedState() {
  return {
    seen: new Map(),           // hash → index trong allPayloads
    allPayloads: [],
    dupDetails: [],
    dupCount: 0,
    staleBatchCount: 0,        // số batch liên tiếp không có unique message mới
    shouldStop: false,
    totalBatches: 0,
    lock: false,               // simple mutex cho việc update shared state
  };
}

// Merge batch vào shared state, trả về số unique mới tìm được
function mergeBatch(state, messages, dupDetails) {
  let newUniqueCount = 0;

  for (const msg of messages) {
    const hash = hashMessage(msg);
    if (!state.seen.has(hash)) {
      state.seen.set(hash, state.allPayloads.length);
      state.allPayloads.push(msg);
      newUniqueCount++;
    } else {
      state.dupCount++;
      logDuplicate(msg, hash, state.dupCount);

      if (DUP_LOG_MODE !== 'none') {
        const entry = { dupIndex: state.dupCount, hash, originalIndex: state.seen.get(hash) };
        if (DUP_LOG_MODE === 'id')   entry.id      = extractId(msg);
        if (DUP_LOG_MODE === 'full') entry.content = msg;
        state.dupDetails.push(entry);
      }
    }
  }

  return newUniqueCount;
}

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────
async function peekAllMessagesInBatches() {
  try {
    console.log(`🌍 Environment  : ${ACTIVE_ENV.toUpperCase()}`);
    console.log(`📬 Queue        : ${TARGET_QUEUE}`);
    console.log(`🔍 Dup log mode : ${DUP_LOG_MODE.toUpperCase()}`);
    console.log(`🛑 Stop after   : ${STOP_AFTER_STALE_BATCHES} stale batches\n`);

    const queueInfo = await getQueueInfo();
    if (!queueInfo.success) throw new Error(`Failed to get queue info: ${queueInfo.error}`);

    const totalMessages = queueInfo.messageCount;
    console.log(`📊 Queue contains ${totalMessages} messages`);

    if (totalMessages === 0) {
      console.log('✅ Queue is empty');
      return { success: true, totalMessages: 0, processedMessages: 0 };
    }

    const encodedQueue = encodeURIComponent(TARGET_QUEUE);
    const url          = `${method}://${domain}/api/queues/%2F/${encodedQueue}/get`;
    const timestamp    = new Date().toISOString().replace(/[:.]/g, '-');
    const outputDir    = `Data_get_from_rabbitMQ_by_scripts/messages_${TARGET_QUEUE.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}`;

    await fs.mkdir(outputDir, { recursive: true });

    const result = await runWorkers(url, totalMessages, outputDir);

    console.log(`\n🎯 COMPLETED`);
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

async function runWorkers(url, totalMessages, outputDir) {
  const startTime = Date.now();
  const state     = createSharedState();
  const errors    = [];

  // ── Worker: chạy liên tục cho đến khi shared state báo dừng ──
  const worker = async (workerId) => {
    let batchCount = 0;

    console.log(`[Worker ${workerId}] 🏃 Started`);

    while (!state.shouldStop) {
      batchCount++;
      state.totalBatches++;

      console.log(`[Worker ${workerId}] 📦 Batch ${batchCount} | Unique so far: ${state.allPayloads.length} | Stale: ${state.staleBatchCount}/${STOP_AFTER_STALE_BATCHES}`);

      try {
        const batchResult = await fetchSingleBatch(url, BATCH_SIZE);

        if (!batchResult.success) {
          errors.push({ workerId, batchNumber: batchCount, error: batchResult.error.message, timestamp: new Date().toISOString() });
          const delay = Math.min(30000, 2000 * Math.pow(1.5, errors.filter(e => e.workerId === workerId).length));
          console.log(`[Worker ${workerId}] 🔄 Retry in ${(delay / 1000).toFixed(1)}s...`);
          await new Promise(r => setTimeout(r, delay));
          continue;
        }

        if (batchResult.messages.length === 0) {
          console.log(`[Worker ${workerId}] ⚠️  Queue returned 0 messages`);
          state.staleBatchCount++;
        } else {
          const batchPayloads = processBatchMessages(batchResult.messages, batchCount, workerId);

          await fs.writeFile(
            `${outputDir}/worker${workerId}_batch_${batchCount.toString().padStart(3, '0')}.json`,
            JSON.stringify(batchPayloads, null, 2)
          );

          // ── Update shared state ──
          const newUnique = mergeBatch(state, batchPayloads, state.dupDetails);

          if (newUnique > 0) {
            // Tìm được message mới → reset stale counter
            state.staleBatchCount = 0;
            console.log(`[Worker ${workerId}] ✅ +${newUnique} new unique | Total unique: ${state.allPayloads.length}/${totalMessages}`);
          } else {
            // Không có gì mới
            state.staleBatchCount++;
            console.log(`[Worker ${workerId}] 〰️  No new unique messages (stale ${state.staleBatchCount}/${STOP_AFTER_STALE_BATCHES})`);
          }
        }

        // ── Kiểm tra điều kiện dừng ──
        if (state.staleBatchCount >= STOP_AFTER_STALE_BATCHES) {
          console.log(`\n[Worker ${workerId}] 🛑 Stopping — ${STOP_AFTER_STALE_BATCHES} consecutive stale batches across all workers`);
          state.shouldStop = true;
          break;
        }

        await new Promise(r => setTimeout(r, 300));

      } catch (err) {
        errors.push({ workerId, batchNumber: batchCount, error: err.message, timestamp: new Date().toISOString() });
        const delay = Math.min(30000, 2000 * Math.pow(1.5, errors.filter(e => e.workerId === workerId).length));
        console.log(`[Worker ${workerId}] 🔄 Retry in ${(delay / 1000).toFixed(1)}s...`);
        await new Promise(r => setTimeout(r, delay));
      }
    }

    console.log(`[Worker ${workerId}] 🏁 Exited after ${batchCount} batches`);
  };

  console.log(`\n🚀 Launching ${CONCURRENCY} workers (convergence mode)...\n`);
  await Promise.all(Array.from({ length: CONCURRENCY }, (_, i) => worker(i + 1)));

  if (errors.length > 0) {
    await fs.writeFile(`${outputDir}/errors_summary.json`, JSON.stringify(errors, null, 2));
    console.log(`⚠️  ${errors.length} errors → ${outputDir}/errors_summary.json`);
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);

  return {
    allPayloads:  state.allPayloads,
    dupDetails:   state.dupDetails,
    dupCount:     state.dupCount,
    totalBatches: state.totalBatches,
    totalTime,
    errors,
  };
}

// ─────────────────────────────────────────────────────────────
// API helpers + output (không đổi)
// ─────────────────────────────────────────────────────────────
async function getQueueInfo() {
  try {
    const url      = `${method}://${domain}/api/queues/%2F/${encodeURIComponent(TARGET_QUEUE)}`;
    const response = await axios({ method: 'get', url, auth: { username: userName, password }, timeout: 30000 });
    return { success: true, messageCount: response.data.messages || 0 };
  } catch (error) {
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

async function createFinalOutput(allPayloads, expectedTotal, outputDir, totalTime, dupCount, dupDetails) {
  await fs.writeFile(`${outputDir}/all_messages.json`, JSON.stringify(allPayloads, null, 2));

  if (dupDetails.length > 0 && DUP_LOG_MODE !== 'none') {
    await fs.writeFile(`${outputDir}/duplicates.json`, JSON.stringify(dupDetails, null, 2));
    console.log(`🔁 Dup details → ${outputDir}/duplicates.json`);
  }

  const summary = {
    environment: ACTIVE_ENV, queue_name: TARGET_QUEUE, dup_log_mode: DUP_LOG_MODE,
    stop_strategy: `stale_batches=${STOP_AFTER_STALE_BATCHES}`,
    total_expected: expectedTotal, total_processed: allPayloads.length, duplicates_removed: dupCount,
    success_rate: ((allPayloads.length / expectedTotal) * 100).toFixed(2) + '%',
    processing_time_seconds: parseFloat(totalTime),
    messages_per_second: (allPayloads.length / parseFloat(totalTime)).toFixed(2),
    processed_at: new Date().toISOString(),
    statistics: {
      valid_messages:              allPayloads.filter(p => !p._processing_error && !p._no_payload && !p._parse_error).length,
      messages_with_errors:        allPayloads.filter(p => p._processing_error).length,
      messages_without_payload:    allPayloads.filter(p => p._no_payload).length,
      messages_with_parse_errors:  allPayloads.filter(p => p._parse_error).length,
    },
  };

  await fs.writeFile(`${outputDir}/summary.json`, JSON.stringify(summary, null, 2));

  console.log(`\n🎉 OUTPUT READY → ${outputDir}/`);
  console.log(`   ✅ Valid  : ${summary.statistics.valid_messages}`);
  console.log(`   🔁 Dups   : ${dupCount}`);
  console.log(`   ⚡ Speed  : ${summary.messages_per_second} msgs/sec`);
}

// ============================================================
// Run
// ============================================================
peekAllMessagesInBatches()
  .then(result => {
    if (result.success) {
      console.log(`\n🎊 SUCCESS! ${result.processedMessages}/${result.totalMessages} unique | ${result.dupCount} dups removed | ${result.totalTime}s`);
    } else {
      console.error(`💥 FAILED: ${result.error}`);
    }
  })
  .catch(err => console.error('💥 Unexpected error:', err));