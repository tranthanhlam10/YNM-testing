import fs from 'fs';
import axios from 'axios';

// ============================================================
// ⚙️  CONFIG — chỉnh 4 dòng này mỗi lần chạy
// ============================================================
const ACTIVE_ENV   = 'testing';                                           // 👈 'testing' | 'staging'
const TARGET_QUEUE = "cl.pt.posts_finished_sources"; // 👈 queue
const MESSAGE_LIMIT = 23000;                                              // 👈 số message tối đa
const JSON_FILE =
  "Data_get_from_rabbitMQ_by_scripts/messages_testing_th_cl_pt_comments_no_cookie_crawling_sources_2026-06-04T10-27-49-560Z/all_messages.json"; // 👈 file input
// ============================================================

const ENVIRONMENTS = {
  testing: {
    host:     'rabbitmq-testing.ynm.local',
    username: 'lamtt',
    password: 'lamtt',
    vhost:    '/',
  },
  staging: {
    host:     'rabbitmq-staging.younetmedia.com',
    username: 'lamtt',
    password: 'vYoWn4KCmDYpvuFiqovWbF',
    vhost:    '/',
  },
};

const { host, username, password, vhost } = ENVIRONMENTS[ACTIVE_ENV];


// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
async function getHttpsAgent() {
  const { default: https } = await import('https');
  return new https.Agent({ rejectUnauthorized: false });
}


// ─────────────────────────────────────────────
// Core functions
// ─────────────────────────────────────────────
async function getQueueInfo() {
  try {
    const auth       = Buffer.from(`${username}:${password}`).toString('base64');
    const apiUrl     = `https://${host}/api/queues/${encodeURIComponent(vhost)}/${encodeURIComponent(TARGET_QUEUE)}`;
    const httpsAgent = await getHttpsAgent();

    const response = await axios.get(apiUrl, {
      headers: { 'Authorization': `Basic ${auth}` },
      httpsAgent,
    });

    console.log('📊 Thông tin queue:', response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Không thể lấy thông tin queue: ${error.message}`);
    throw error;
  }
}

async function pushMessagesToRabbitMQ() {
  try {
    const data   = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));
    let messages = Array.isArray(data) ? data : [data];
    const total  = messages.length;

    if (MESSAGE_LIMIT !== Infinity && MESSAGE_LIMIT > 0) {
      messages = messages.slice(0, MESSAGE_LIMIT);
      console.log(`📋 Giới hạn tin nhắn: ${messages.length} / ${total}`);
    }

    const auth       = Buffer.from(`${username}:${password}`).toString('base64');
    const apiUrl     = `https://${host}/api/exchanges/${encodeURIComponent(vhost)}/amq.default/publish`;
    const httpsAgent = await getHttpsAgent();

    console.log(`🚀 Đẩy tin nhắn vào queue "${TARGET_QUEUE}"...`);

    let messageCount = 0;

    for (const message of messages) {
      const payload = {
        vhost,
        name: 'amq.default',
        properties: { delivery_mode: 2, headers: {} },
        routing_key:      TARGET_QUEUE,
        delivery_mode:    '2',
        payload:          JSON.stringify(message),
        payload_encoding: 'string',
        headers:          {},
        props:            {},
      };

      const response = await axios.post(apiUrl, payload, {
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Basic ${auth}`,
        },
        httpsAgent,
      });

      if (response.data?.routed) {
        messageCount++;
        if (messageCount % 100 === 0) {
          console.log(`   📨 Đã gửi ${messageCount} / ${messages.length} tin nhắn...`);
        }
      } else {
        console.warn(`⚠️  Không thể gửi tin nhắn: ${JSON.stringify(response.data)}`);
      }
    }

    console.log(`✅ Đã gửi thành công ${messageCount} tin nhắn vào queue "${TARGET_QUEUE}"`);
    return messageCount;

  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(`❌ Không tìm thấy file JSON: ${JSON_FILE}`);
    } else if (error instanceof SyntaxError) {
      console.error(`❌ Định dạng JSON không hợp lệ trong file: ${JSON_FILE}`);
    } else if (error.response) {
      console.error(`❌ Lỗi API (${error.response.status}): ${JSON.stringify(error.response.data)}`);
    } else {
      console.error(`❌ Lỗi: ${error.message}`);
    }
    throw error;
  }
}


// ─────────────────────────────────────────────
// Run
// ─────────────────────────────────────────────
async function main() {
  console.log(`🌍 Environment : ${ACTIVE_ENV.toUpperCase()}`);
  console.log(`📬 Queue       : ${TARGET_QUEUE}`);
  console.log(`🔗 Host        : ${host}`);
  console.log(`📄 File        : ${JSON_FILE}\n`);

  try {
    await getQueueInfo();
    const count = await pushMessagesToRabbitMQ();
    console.log(`\n🎊 Tổng số tin nhắn đã gửi: ${count}`);
  } catch (error) {
    console.error('💥 Không thể gửi tin nhắn:', error);
  }
}

main();

export { pushMessagesToRabbitMQ, getQueueInfo };