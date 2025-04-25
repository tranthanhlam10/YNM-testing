import axios from 'axios';
import { createWriteStream } from 'fs';
import csvWriter from 'csv-write-stream';
import { promises as fs } from 'fs';

async function peekMessagesAndSaveToCSV() {
  try {
    const response = await axios.post(
      'http://rabbitmq-testing.ynm.local/api/queues/%2F/testing.cl.news.article_urls_crawling_sources/get',
      {
        count: 5000, // Lấy số lượng message phù hợp
        ackmode: 'reject_requeue_true', // Quan trọng: Đảm bảo message vẫn ở trong queue
        encoding: 'auto'
      },
      {
        auth: {
          username: 'lamtt',
          password: 'lamtt'
        },
        timeout: 500000, // Tăng timeout
        headers: {
          'Content-Type': 'application/json'
        },
        maxContentLength: Infinity, // Không giới hạn độ dài phản hồi
        maxBodyLength: Infinity
      }
    );

    if (!response.data || response.data.length === 0) {
      console.log('No messages found in the queue.');
      return;
    }

    // Lưu raw data trước khi xử lý để debug
    await fs.writeFile('raw_messages.json', JSON.stringify(response.data, null, 2));
    console.log(`Saved raw messages to raw_messages.json`);

    // Xử lý từng message
    const messages = response.data;
    const payloads = [];

    for (const message of messages) {
      try {
        let payload;
        if (typeof message.payload === 'string') {
          payload = JSON.parse(message.payload);
        } else {
          payload = message.payload;
        }
        payloads.push(payload);
      } catch (err) {
        console.error('Error parsing message payload:', err.message);
        // Lưu message gốc để debug
        await fs.writeFile(`failed_message_${Date.now()}.txt`, 
          typeof message.payload === 'string' ? message.payload : JSON.stringify(message.payload));
        console.log(`Saved failed message to file for debugging`);
      }
    }

    // Nếu không có payload nào hợp lệ
    if (payloads.length === 0) {
      console.log('No valid payloads found in messages.');
      return;
    }

    // Thu thập tất cả các key có thể có
    const allKeys = new Set();
    payloads.forEach(payload => {
      const flattened = flattenObject(payload);
      Object.keys(flattened).forEach(key => allKeys.add(key));
    });

    // Tạo CSV writer với đầy đủ headers
    const headers = Array.from(allKeys);
    const writer = csvWriter({ headers });
    const fileStream = createWriteStream('messages_peek.csv', { encoding: 'utf8' });

    writer.pipe(fileStream);

    // Ghi từng payload ra CSV sau khi flatten
    for (const payload of payloads) {
      const flattened = flattenObject(payload);
      
      // Xử lý các giá trị đặc biệt
      Object.keys(flattened).forEach(key => {
        const value = flattened[key];
        
        // Nếu là object hoặc array, chuyển thành JSON string
        if (value !== null && typeof value === 'object') {
          flattened[key] = JSON.stringify(value);
        }
        
        // Đảm bảo các chuỗi an toàn cho CSV
        if (typeof flattened[key] === 'string') {
          // Escape dấu nháy kép
          flattened[key] = flattened[key].replace(/"/g, '""');
        }
      });
      
      writer.write(flattened);
    }

    writer.end();

    // Đồng thời lưu toàn bộ dữ liệu dưới dạng JSON để đối chiếu
    await fs.writeFile('messages_peek.json', JSON.stringify(payloads, null, 2));

    console.log(`Successfully peeked ${payloads.length} messages (messages remain in queue).`);
    console.log(`- CSV saved to messages_peek.csv`);
    console.log(`- JSON saved to messages_peek.json`);

  } catch (error) {
    console.error('Error occurred:');
    if (error.response) {
      console.error('Server Error:', error.response.status);
      // Lưu response.data để debug, nhưng cẩn thận nếu nó quá lớn
      await fs.writeFile('error_response.json', JSON.stringify(error.response.data).substring(0, 10000));
    } else if (error.request) {
      console.error('No response received');
    } else {
      console.error('Error:', error.message);
    }
    console.error(error.stack);
  }
}

// Hàm làm phẳng object với xử lý đặc biệt cho các giá trị dài
function flattenObject(obj, prefix = '') {
  // Kiểm tra obj
  if (!obj || typeof obj !== 'object') return {};
  
  const result = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const pre = prefix.length ? prefix + '.' : '';
      
      // Xử lý các trường hợp đặc biệt
      if (obj[key] === null) {
        result[pre + key] = null;
      } else if (Array.isArray(obj[key])) {
        // Xử lý array
        result[pre + key] = JSON.stringify(obj[key]);
      } else if (typeof obj[key] === 'object') {
        // Làm phẳng object lồng nhau
        Object.assign(result, flattenObject(obj[key], pre + key));
      } else {
        // Giá trị cơ bản
        result[pre + key] = obj[key];
      }
    }
  }
  
  return result;
}

// Chạy hàm để xem messages mà không xóa chúng khỏi queue
peekMessagesAndSaveToCSV();