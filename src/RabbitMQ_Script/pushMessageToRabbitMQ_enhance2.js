import fs from 'fs';
import axios from 'axios';

/**
 * Push messages từ nhiều file JSON vào RabbitMQ queue với retry vô hạn
 * 
 * @param {string[]} jsonFilePaths - Mảng đường dẫn đến các file JSON
 * @param {string} rabbitmqHost - Hostname của RabbitMQ server
 * @param {string} queueName - Tên queue để gửi message
 * @param {string} username - Tên đăng nhập RabbitMQ
 * @param {string} password - Mật khẩu RabbitMQ
 * @param {string} vhost - Virtual host trong RabbitMQ
 * @param {number} messageLimit - Giới hạn số lượng message được push mỗi file (mặc định là không giới hạn)
 * @returns {Promise<Object>} - Thống kê kết quả gửi
 */
async function pushMessagesToRabbitMQ(
  jsonFilePaths,
  rabbitmqHost,
  queueName,
  username,
  password,
  vhost,
  messageLimit = Infinity,
) {
  const stats = {
    totalFiles: jsonFilePaths.length,
    successFiles: 0,
    failedFiles: [],
    totalMessages: 0,
    failedRecords: []
  };

  const auth = Buffer.from(`${username}:${password}`).toString('base64');
  const apiUrl = `https://${rabbitmqHost}/api/exchanges/${encodeURIComponent(vhost)}/amq.default/publish`;
  const httpsAgent = await getHttpsAgent();

  // Xử lý từng file
  for (const filePath of jsonFilePaths) {
    console.log(`\n📁 Đang xử lý file: ${filePath}`);
    
    try {
      // Đọc và parse file
      let data;
      try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        data = JSON.parse(fileContent);
      } catch (error) {
        if (error.code === 'ENOENT') {
          console.error(`❌ Không tìm thấy file: ${filePath}`);
        } else if (error instanceof SyntaxError) {
          console.error(`❌ File không đúng định dạng JSON: ${filePath}`);
        } else {
          console.error(`❌ Lỗi đọc file ${filePath}: ${error.message}`);
        }
        stats.failedFiles.push({ file: filePath, reason: error.message });
        continue; // Bỏ qua file này, xử lý file tiếp theo
      }

      // Chuẩn bị messages
      let messages = Array.isArray(data) ? data : [data];
      
      if (messageLimit !== Infinity && messageLimit > 0) {
        messages = messages.slice(0, messageLimit);
        console.log(`ℹ️  Giới hạn số lượng: ${messages.length}/${Array.isArray(data) ? data.length : 1} messages`);
      }

      console.log(`📤 Bắt đầu gửi ${messages.length} messages từ file: ${filePath}`);

      // Gửi từng message với retry
      let fileMessageCount = 0;
      for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        const recordIdentifier = `${filePath}[${i}]`;

        // Validate message trước khi gửi
        if (!isValidMessage(message)) {
          console.warn(`⚠️  Record không hợp lệ bị bỏ qua: ${recordIdentifier}`);
          stats.failedRecords.push({
            file: filePath,
            index: i,
            reason: 'Invalid message format',
            data: message
          });
          continue;
        }

        // Gửi message với retry vô hạn
        const sent = await sendMessageWithRetry(
          apiUrl,
          queueName,
          vhost,
          auth,
          httpsAgent,
          message,
          recordIdentifier
        );

        if (sent) {
          fileMessageCount++;
          stats.totalMessages++;

          if (fileMessageCount % 100 === 0) {
            console.log(`   ✓ Đã gửi ${fileMessageCount}/${messages.length} messages...`);
          }
        }
      }

      console.log(`✅ Hoàn thành file: ${filePath} - Đã gửi ${fileMessageCount}/${messages.length} messages`);
      stats.successFiles++;

    } catch (error) {
      console.error(`❌ Lỗi không xác định khi xử lý file ${filePath}:`, error.message);
      stats.failedFiles.push({ file: filePath, reason: error.message });
    }
  }

  return stats;
}

/**
 * Gửi message với retry vô hạn khi gặp lỗi RabbitMQ
 */
async function sendMessageWithRetry(
  apiUrl,
  queueName,
  vhost,
  auth,
  httpsAgent,
  message,
  recordIdentifier,
  retryDelay = 1000
) {
  let attempt = 0;

  while (true) {
    attempt++;
    
    try {
      const payload = {
        vhost: vhost,
        name: "amq.default",
        properties: {
          delivery_mode: 2,
          headers: {}
        },
        routing_key: queueName,
        delivery_mode: "2",
        payload: JSON.stringify(message),
        payload_encoding: "string",
        headers: {},
        props: {}
      };

      const response = await axios.post(apiUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`
        },
        httpsAgent,
        timeout: 10000 // 10s timeout
      });

      if (response.data && response.data.routed) {
        if (attempt > 1) {
          console.log(`   ✓ Gửi thành công sau ${attempt} lần thử: ${recordIdentifier}`);
        }
        return true;
      } else {
        console.warn(`⚠️  Message không được route: ${recordIdentifier} - ${JSON.stringify(response.data)}`);
        throw new Error('Message not routed');
      }

    } catch (error) {
      const isNetworkError = error.code === 'ECONNREFUSED' || 
                             error.code === 'ETIMEDOUT' || 
                             error.code === 'ENOTFOUND' ||
                             error.message.includes('timeout');
      
      const isServerError = error.response && error.response.status >= 500;

      if (isNetworkError || isServerError) {
        // Lỗi RabbitMQ hoặc network - retry vô hạn
        const delay = Math.min(retryDelay * Math.pow(1.5, Math.min(attempt - 1, 10)), 30000); // Max 30s
        console.warn(`⚠️  Lỗi RabbitMQ (lần ${attempt}): ${error.message}`);
        console.log(`   🔄 Retry sau ${(delay/1000).toFixed(1)}s cho: ${recordIdentifier}`);
        await sleep(delay);
        continue; // Retry
      } else {
        // Lỗi khác (validation, auth, ...) - không retry
        console.error(`❌ Lỗi không thể retry cho record: ${recordIdentifier}`);
        console.error(`   Chi tiết: ${error.response ? JSON.stringify(error.response.data) : error.message}`);
        return false;
      }
    }
  }
}

/**
 * Validate message trước khi gửi
 */
function isValidMessage(message) {
  if (message === null || message === undefined) {
    return false;
  }
  
  // Message phải là object hoặc primitive type
  if (typeof message === 'object') {
    try {
      JSON.stringify(message);
      return true;
    } catch {
      return false;
    }
  }
  
  return true;
}

/**
 * Sleep helper
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Tạo HTTPS Agent để bỏ qua xác thực SSL
 */
async function getHttpsAgent() {
  const { default: https } = await import('https');
  return new https.Agent({ rejectUnauthorized: false });
}

/**
 * Lấy thông tin queue từ RabbitMQ
 */
async function getQueueInfo(
  rabbitmqHost,
  queueName,
  username,
  password,
  vhost,
) {
  try {
    const auth = Buffer.from(`${username}:${password}`).toString('base64');
    const apiUrl = `https://${rabbitmqHost}/api/queues/${encodeURIComponent(vhost)}/${encodeURIComponent(queueName)}`;
    const httpsAgent = await getHttpsAgent();

    const response = await axios.get(apiUrl, {
      headers: {
        'Authorization': `Basic ${auth}`
      },
      httpsAgent
    });

    console.log('📊 Thông tin queue:', {
      name: response.data.name,
      messages: response.data.messages,
      consumers: response.data.consumers,
      state: response.data.state
    });
    return response.data;
  } catch (error) {
    console.error(`❌ Không thể lấy thông tin queue: ${error.message}`);
    throw error;
  }
}

/**
 * Main function - Ví dụ sử dụng
 */
async function main() {
  const messageLimit = 1000;
  
  // Mảng các file cần push
  const jsonFilePaths = [
  "Data_get_from_rabbitMQ_by_scripts/Data_test_parent_Post_07_010/mention_CrawlReviewConCung_ThuyPN.json",
  "Data_get_from_rabbitMQ_by_scripts/Data_test_parent_Post_07_010/mentions_Crawl_ThuyPN.json",
  "Data_get_from_rabbitMQ_by_scripts/Data_test_parent_Post_07_010/mentions_Facebook_ThuyPN.json",
  "Data_get_from_rabbitMQ_by_scripts/Data_test_parent_Post_07_010/mentions_Forum_ThuyPN.json",
  "Data_get_from_rabbitMQ_by_scripts/Data_test_parent_Post_07_010/mentions_InstagramGetLastestUserComments_ThuyPN.json",
  "Data_get_from_rabbitMQ_by_scripts/Data_test_parent_Post_07_010/mentions_InstagramGetLastestUserPost_ThuyPN.json",
  "Data_get_from_rabbitMQ_by_scripts/Data_test_parent_Post_07_010/mentions_ThreadsComment_ThuyPN.json",
  "Data_get_from_rabbitMQ_by_scripts/Data_test_parent_Post_07_010/mentions_ThreadsParsedDetail_ThuyPN.json",
  "Data_get_from_rabbitMQ_by_scripts/Data_test_parent_Post_07_010/mentions_ThreadsReply_ThuyPN.json",
  "Data_get_from_rabbitMQ_by_scripts/Data_test_parent_Post_07_010/mentions_ThreadsReplyCrawlPost_ThuyPN.json",
  "Data_get_from_rabbitMQ_by_scripts/Data_test_parent_Post_07_010/mentions_ThreadsSourceReply_ThuyPN.json",
  "Data_get_from_rabbitMQ_by_scripts/Data_test_parent_Post_07_010/mentions_TiktokHashtagKeyword_ThuyPN.json",
  "Data_get_from_rabbitMQ_by_scripts/Data_test_parent_Post_07_010/mentions_YoutubeCommentAPI_ThuyPN.json",
  "Data_get_from_rabbitMQ_by_scripts/Data_test_parent_Post_07_010/mentions_YoutubeCrawlDetail_ThuyPN.json",
  "Data_get_from_rabbitMQ_by_scripts/Data_test_parent_Post_07_010/mentions_YoutubeKeywordApiNew_ThuyPN.json"
];
  
  const rabbitmqHost = 'rabbitmq-testing.ynm.local';
  const queueName = 'testing.cl.mentions_2_solr_mentions_LamTT';
  const username = 'lamtt';
  const password = 'lamtt';
  const vhost = '/';

  try {
    console.log('🚀 Bắt đầu quá trình push messages\n');
    
    // Lấy thông tin queue trước khi push
    await getQueueInfo(rabbitmqHost, queueName, username, password, vhost);

    // Push messages từ nhiều file
    const stats = await pushMessagesToRabbitMQ(
      jsonFilePaths,
      rabbitmqHost,
      queueName,
      username,
      password,
      vhost,
      messageLimit
    );

    // In báo cáo tổng kết
    console.log('\n' + '='.repeat(60));
    console.log('📈 BÁO CÁO TỔNG KẾT');
    console.log('='.repeat(60));
    console.log(`✅ Files thành công: ${stats.successFiles}/${stats.totalFiles}`);
    console.log(`📊 Tổng messages đã gửi: ${stats.totalMessages}`);
    
    if (stats.failedFiles.length > 0) {
      console.log(`\n❌ Files thất bại (${stats.failedFiles.length}):`);
      stats.failedFiles.forEach(f => {
        console.log(`   - ${f.file}: ${f.reason}`);
      });
    }
    
    if (stats.failedRecords.length > 0) {
      console.log(`\n⚠️  Records không hợp lệ (${stats.failedRecords.length}):`);
      stats.failedRecords.forEach(r => {
        console.log(`   - ${r.file}[${r.index}]: ${r.reason}`);
      });
    }
    
    console.log('='.repeat(60));

    // Kiểm tra lại queue sau khi push
    console.log('\n');
    await getQueueInfo(rabbitmqHost, queueName, username, password, vhost);

  } catch (error) {
    console.error('❌ Lỗi nghiêm trọng:', error);
    process.exit(1);
  }
}


main();


export { pushMessagesToRabbitMQ, getQueueInfo };