import axios from 'axios';
import { createWriteStream } from 'fs';
import csvWriter from 'csv-write-stream';

async function fetchMessagesAndSaveToCSV() {
  try {
    const response = await axios.post(
      'http://rabbitmq-testing.ynm.local/api/queues/%2F/testing.cl.tr.identities_crawled_sources_LamTT/get',
      {
        count: 100,
        ackmode: 'ack_requeue_false',
        encoding: 'auto'
      },
      {
        auth: {
          username: 'lamtt',
          password: 'lamtt'
        },
        timeout: 100000,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.data || response.data.length === 0) {
      console.log('No messages found in the queue.');
      return;
    }

    // Chỉ lấy phần payload của tin nhắn
    const payloads = response.data.map(message => 
      typeof message.payload === 'string' ? JSON.parse(message.payload) : message.payload
    );

    // Xác định headers từ payload đầu tiên
    const headers = Object.keys(payloads[0] || {});
    
    // Khởi tạo csv writer với headers
    const writer = csvWriter({ headers });
    const fileStream = createWriteStream('messages.csv', { encoding: 'utf8' });
    writer.pipe(fileStream);

    // Ghi payload vào CSV
    payloads.forEach(payload => {
      writer.write(flattenObject(payload));
    });

    writer.end();
    console.log(`Successfully saved ${payloads.length} messages to messages.csv`);

  } catch (error) {
    if (error.response) {
      console.error('Server Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
  }
}

function flattenObject(obj, prefix = '') {
  // Xử lý trường hợp obj có thể là null hoặc không phải object
  if (!obj || typeof obj !== 'object') return {};
  
  return Object.keys(obj).reduce((acc, key) => {
    const pre = prefix.length ? prefix + '.' : '';
    
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      Object.assign(acc, flattenObject(obj[key], pre + key));
    } else {
      acc[pre + key] = obj[key];
    }
    
    return acc;
  }, {});
}

fetchMessagesAndSaveToCSV();