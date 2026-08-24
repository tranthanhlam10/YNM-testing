import axios from 'axios';
import { promises as fs } from 'fs';

// ============================================================
// ⚙️  CONFIG — chỉnh 3 dòng này mỗi lần chạy
// ============================================================
const ACTIVE_ENV   = 'testing';                                              // 👈 'testing' | 'staging'
const TARGET_QUEUE = "app.socialheat.mentions_to_topic_7_thutt"; // 👈 queue
const MSG_COUNT    = 500;                                                   // 👈 số message cần lấy
// ============================================================

const ENVIRONMENTS = {
  testing: {
    method: "http",
    domain: "rabbitmq-testing.ynm.local",
    username: "qc_giangnt1",
    password: "lvWJAHcLrxQT5GLI",
  },
  staging: {
    method: "https",
    domain: "rabbitmq-staging.younetmedia.com",
    username: "lamtt",
    password: "vYoWn4KCmDYpvuFiqovWbF",
  },
};

const { method, domain, username, password } = ENVIRONMENTS[ACTIVE_ENV];


// ─────────────────────────────────────────────
// Core
// ─────────────────────────────────────────────
async function peekMessagesAndSaveToJSON() {
  try {
    const encodedQueueName = encodeURIComponent(TARGET_QUEUE);
    const url = `${method}://${domain}/api/queues/%2F/${encodedQueueName}/get`;

    console.log(`🌍 Environment : ${ACTIVE_ENV.toUpperCase()}`);
    console.log(`📬 Queue       : ${TARGET_QUEUE}`);
    console.log(`🔗 URL         : ${url}\n`);

    const response = await axios({
      method: 'post',
      url,
      auth: { username, password },
      data: {
        count:    MSG_COUNT,
        encoding: 'auto',
        ackmode:  'reject_requeue_true',
        truncate: 500000000,
      },
      timeout: 30000000,
      headers: { 'Content-Type': 'application/json' },
      maxContentLength: Infinity,
      maxBodyLength:    Infinity,
    });

    if (!response.data || response.data.length === 0) {
      console.log('⚠️  No messages found in the queue.');
      return;
    }

    const messages = response.data;
    const payloads = [];

    for (const message of messages) {
      try {
        if (!message.payload) {
          console.warn('⚠️  Message has no payload:', JSON.stringify(message).substring(0, 200));
          continue;
        }

        let payload;
        if (typeof message.payload === 'string') {
          try {
            payload = JSON.parse(message.payload);
          } catch {
            payload = { raw_payload: message.payload };
          }
        } else {
          payload = message.payload;
        }

        payloads.push(payload);
      } catch (err) {
        console.error('❌ Error parsing message payload:', err.message);
        payloads.push({
          _error:            true,
          _error_message:    err.message,
          _original_message: message,
        });
      }
    }

    if (payloads.length === 0) {
      console.log('⚠️  No valid payloads found in messages.');
      return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputDir = 'Data_get_from_rabbitMQ_by_scripts';
    await fs.mkdir(outputDir, { recursive: true });

    const outputFile = `${outputDir}/messages_${TARGET_QUEUE.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.json`;
    await fs.writeFile(outputFile, JSON.stringify(payloads, null, 2));

    console.log(`✅ Peeked ${payloads.length} messages (messages remain in queue)`);
    console.log(`📄 Saved to: ${outputFile}`);

  } catch (error) {
    console.error('💥 Error occurred:');
    if (error.response) {
      console.error(`   Server Error : ${error.response.status}`);
      console.error(`   Response     :`, error.response.data);
    } else if (error.request) {
      console.error('   No response received');
    } else {
      console.error('   Error:', error.message);
    }
    console.error(error.stack);
  }
}


// ─────────────────────────────────────────────
// Run
// ─────────────────────────────────────────────
peekMessagesAndSaveToJSON();