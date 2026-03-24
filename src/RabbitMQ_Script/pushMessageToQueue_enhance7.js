import fs from 'fs';
import axios from 'axios';

// ─── Helper: chia mảng thành các chunk ───────────────────────────────────────
function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

// ─── Helper: encode vhost an toàn ────────────────────────────────────────────
function encodeVhost(vhost) {
  return vhost === '/' ? '%2F' : encodeURIComponent(vhost);
}

// ─── Helper: gửi 1 message (có retry + backoff) ───────────────────────────────
async function publishOne(apiUrl, auth, queueName, vhost, message, retries = 3) {
  const payload = {
    vhost,
    name: 'amq.default',
    properties: { delivery_mode: 2, headers: {} },
    routing_key: queueName,
    delivery_mode: '2',
    payload: JSON.stringify(message),
    payload_encoding: 'string',
    headers: {},
    props: {},
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.post(apiUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${auth}`,
        },
      });
      return response.data?.routed === true;
    } catch (err) {
      if (attempt === retries) throw err;
      // Backoff: 200ms, 400ms, 800ms…
      await new Promise((r) => setTimeout(r, 200 * attempt));
    }
  }
}

/**
 * Đẩy messages theo batch với concurrency kiểm soát được.
 *
 * @param {string}  jsonFilePath  - File JSON chứa dữ liệu (array hoặc object)
 * @param {object}  [opts]
 * @param {string}  [opts.host]        - RabbitMQ hostname
 * @param {string}  [opts.queue]       - Tên queue
 * @param {string}  [opts.username]
 * @param {string}  [opts.password]
 * @param {string}  [opts.vhost]
 * @param {number}  [opts.batchSize]   - Số message mỗi batch   (default: 50)
 * @param {number}  [opts.concurrency] - Request song song / batch (default: 10)
 * @param {number}  [opts.retries]     - Số lần retry mỗi message (default: 3)
 * @returns {Promise<{sent: number, failed: number}>}
 */
async function pushMessagesInBatch(jsonFilePath, opts = {}) {
  const {
    host = 'rabbitmq-staging.younetmedia.com',
    queue = 'staging.cl.mentions_2_solr_mentions',
    username = 'lamtt',
    password = 'vYoWn4KCmDYpvuFiqovWbF',
    vhost = '/',
    batchSize = 50,
    concurrency = 10,
    retries = 3,
  } = opts;

  // 1. Đọc & parse file
  const raw = fs.readFileSync(jsonFilePath, 'utf8');
  const data = JSON.parse(raw);
  const messages = Array.isArray(data) ? data : [data];

  const auth = Buffer.from(`${username}:${password}`).toString('base64');

  // ✅ Fix: encode vhost '/' thành %2F
  const apiUrl = `https://${host}/api/exchanges/${encodeVhost(vhost)}/amq.default/publish`;

  const batches = chunkArray(messages, batchSize);
  let totalSent = 0;
  let totalFailed = 0;

  console.log(
    `📦 Tổng: ${messages.length} messages | ${batches.length} batches | batchSize=${batchSize} | concurrency=${concurrency}`
  );

  // 2. Xử lý từng batch
  for (let bIdx = 0; bIdx < batches.length; bIdx++) {
    const batch = batches[bIdx];
    const batchStart = bIdx * batchSize;
    let batchSent = 0;
    let batchFailed = 0;

    // 3. Trong mỗi batch, gửi song song tối đa `concurrency` request
    const subBatches = chunkArray(batch, concurrency);

    for (const sub of subBatches) {
      const results = await Promise.allSettled(
        sub.map((msg) => publishOne(apiUrl, auth, queue, vhost, msg, retries))
      );

      for (const result of results) {
        if (result.status === 'fulfilled' && result.value === true) {
          batchSent++;
        } else {
          batchFailed++;
          if (result.reason) {
            console.warn(`  ⚠️  Lỗi gửi message: ${result.reason?.message}`);
          }
        }
      }
    }

    totalSent += batchSent;
    totalFailed += batchFailed;

    console.log(
      `  Batch ${bIdx + 1}/${batches.length} ` +
        `[${batchStart + 1}–${batchStart + batch.length}] ` +
        `✓ ${batchSent}  ✗ ${batchFailed}`
    );
  }

  console.log(`\n✅ Xong! Đã gửi: ${totalSent} | Thất bại: ${totalFailed}`);
  return { sent: totalSent, failed: totalFailed };
}

/**
 * Push messages từ file JSON vào RabbitMQ queue sử dụng Management HTTP API
 * (Hàm gốc - gửi tuần tự từng message)
 */
async function pushMessagesToRabbitMQ(
  jsonFilePath,
  rabbitmqHost = 'rabbitmq-staging.younetmedia.com',
  queueName = 'staging.cl.mentions_2_solr_mentions',
  username = 'lamtt',
  password = 'vYoWn4KCmDYpvuFiqovWbF',
  vhost = '/'
) {
  try {
    const data = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
    const messages = Array.isArray(data) ? data : [data];
    const auth = Buffer.from(`${username}:${password}`).toString('base64');

    // ✅ Fix: encode vhost '/' thành %2F
    const apiUrl = `https://${rabbitmqHost}/api/exchanges/${encodeVhost(vhost)}/amq.default/publish`;

    console.log(`Đẩy tin nhắn vào queue ${queueName} sử dụng HTTP API...`);

    let messageCount = 0;

    for (const message of messages) {
      const payload = {
        vhost,
        name: 'amq.default',
        properties: { delivery_mode: 2, headers: {} },
        routing_key: queueName,
        delivery_mode: '2',
        payload: JSON.stringify(message),
        payload_encoding: 'string',
        headers: {},
        props: {},
      };

      const response = await axios.post(apiUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${auth}`,
        },
      });

      if (response.data && response.data.routed) {
        messageCount++;
        if (messageCount % 100 === 0) {
          console.log(`Đã gửi ${messageCount} tin nhắn...`);
        }
      } else {
        console.warn(`Không thể gửi tin nhắn: ${JSON.stringify(response.data)}`);
      }
    }

    console.log(`Đã gửi thành công ${messageCount} tin nhắn vào queue '${queueName}'`);
    return messageCount;
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(`Không tìm thấy file JSON: ${jsonFilePath}`);
    } else if (error instanceof SyntaxError) {
      console.error(`Định dạng JSON không hợp lệ trong file: ${jsonFilePath}`);
    } else if (error.response) {
      console.error(`Lỗi API (${error.response.status}): ${JSON.stringify(error.response.data)}`);
    } else {
      console.error(`Lỗi: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Lấy thông tin queue từ RabbitMQ Management API
 */
async function getQueueInfo(
  rabbitmqHost = 'rabbitmq-staging.younetmedia.com',
  queueName = 'staging.cl.mentions_2_solr_mentions',
  username = 'lamtt',
  password = 'vYoWn4KCmDYpvuFiqovWbF',
  vhost = '/'
) {
  try {
    const auth = Buffer.from(`${username}:${password}`).toString('base64');

    // ✅ Fix: encode vhost '/' thành %2F
    const apiUrl = `https://${rabbitmqHost}/api/queues/${encodeVhost(vhost)}/${encodeURIComponent(queueName)}`;

    const response = await axios.get(apiUrl, {
      headers: { Authorization: `Basic ${auth}` },
    });

    console.log('Thông tin queue:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Không thể lấy thông tin queue: ${error.message}`);
    throw error;
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  for (let i = 0; i < 5000; i++) {
    try {
      await getQueueInfo();

      const { sent, failed } = await pushMessagesInBatch('Document/data_luannx_mentions_staging.json', {
        batchSize: 50,    // 50 messages mỗi batch
        concurrency: 10,  // 10 request song song trong mỗi batch
        retries: 3,       // retry tối đa 3 lần nếu lỗi
      });

      console.log(`Lần ${i + 1}: sent=${sent} failed=${failed}`);
      console.log('-----------------------------------');
    } catch (error) {
      console.error('Không thể gửi tin nhắn:', error);
    }
  }
}

main();

export { pushMessagesToRabbitMQ, pushMessagesInBatch, getQueueInfo };