import axios from 'axios';
import { createWriteStream } from 'fs';
import csvWriter from 'csv-write-stream';
import { promises as fs } from 'fs';

async function peekMessagesAndSaveToCSV(method, domain, queueName, userName, passWord, count) {
  try {

    const encodedQueueName = encodeURIComponent(queueName);
    
    const url = `${method}://${domain}/api/queues/%2F/${encodedQueueName}/get`;
    
    console.log(`Sending request to: ${url}`);

    const response = await axios({
      method: 'post',
      url: url,
      auth: {
        username: userName,
        password: passWord
      },
      data: {
        count: count ,       
        encoding: 'auto', // Thêm encoding auto để RabbitMQ tự xử lý
        ackmode: 'reject_requeue_true',
        truncate: 500000 // Giới hạn kích thước message để tránh vấn đề với messages quá lớn
      },
      timeout: 30000000,    // Giảm timeout xuống mức hợp lý hơn
      headers: {
        'Content-Type': 'application/json'
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    if (!response.data || response.data.length === 0) {
      console.log('No messages found in the queue.');
      return;
    }


    await fs.writeFile('raw_messages.json', JSON.stringify(response.data, null, 2));
    console.log(`Saved raw messages to raw_messages.json`);


    const messages = response.data;
    const payloads = [];

    for (const message of messages) {
      try {
        let payload;
        if (message.payload) {
          if (typeof message.payload === 'string') {
            try {
              payload = JSON.parse(message.payload);
            } catch (parseErr) {
              payload = { raw_payload: message.payload };
            }
          } else {
            payload = message.payload;
          }
          
  
          
          payloads.push(payload);
        } else {
          console.warn("Message doesn't have a payload property:", 
                     JSON.stringify(message).substring(0, 200) + "...");
        }
      } catch (err) {
        console.error('Error parsing message payload:', err.message);
        // Lưu message gốc để debug
        await fs.writeFile(`failed_message_${Date.now()}.txt`, 
          JSON.stringify(message, null, 2));
        console.log(`Saved failed message to file for debugging`);
      }
    }

    if (payloads.length === 0) {
      console.log('No valid payloads found in messages.');
      return;
    }

    const allKeys = new Set();
    payloads.forEach(payload => {
      const flattened = flattenObject(payload);
      Object.keys(flattened).forEach(key => allKeys.add(key));
    });

    const headers = Array.from(allKeys);
    const writer = csvWriter({ headers });
    const fileStream = createWriteStream('messages_peek.csv', { encoding: 'utf8' });

    writer.pipe(fileStream);

    for (const payload of payloads) {
      const flattened = flattenObject(payload);
      
      Object.keys(flattened).forEach(key => {
        const value = flattened[key];
        
        if (value !== null && typeof value === 'object') {
          flattened[key] = JSON.stringify(value);
        }
        
        if (typeof flattened[key] === 'string') {
          flattened[key] = flattened[key].replace(/"/g, '""');
        }
      });
      
      writer.write(flattened);
    }

    writer.end();

    await fs.writeFile('messages_peek.json', JSON.stringify(payloads, null, 2));

    console.log(`Successfully peeked ${payloads.length} messages (messages remain in queue).`);
    console.log(`- CSV saved to messages_peek.csv`);
    console.log(`- JSON saved to messages_peek.json`);

  } catch (error) {
    console.error('Error occurred:');
    if (error.response) {
      console.error(`Server Error: ${error.response.status}`);
      console.error(`Response data:`, error.response.data);
      await fs.writeFile('error_response.json', JSON.stringify({
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      }, null, 2));
    } else if (error.request) {
      console.error('No response received');
      console.error(error.request);
    } else {
      console.error('Error:', error.message);
    }
    console.error(error.stack);
  }
}


function flattenObject(obj, prefix = '') {
  if (!obj || typeof obj !== 'object') return {};
  
  const result = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const pre = prefix.length ? prefix + '.' : '';
      

      if (obj[key] === null) {
        result[pre + key] = null;
      } else if (Array.isArray(obj[key])) {
        result[pre + key] = JSON.stringify(obj[key]);
      } else if (typeof obj[key] === 'object') {
        Object.assign(result, flattenObject(obj[key], pre + key));
      } else {
        result[pre + key] = obj[key];
      }
    }
  }
  
  return result;
}
const testHTTP = 'http';
const stagingHTTP = 'https';

const testDomain= 'rabbitmq-testing.ynm.local';
const stagingDomain= 'rabbitmq-staging.younetmedia.com';

const queueName = "staging.cl.tr.reposts_no_cookie_crawled_sources";


const userName = 'lamtt'; 
const testPassword = 'lamtt';
const stagingPassword = 'vYoWn4KCmDYpvuFiqovWbF';


peekMessagesAndSaveToCSV(
  stagingHTTP, 
  stagingDomain, 
  queueName, 
  userName, 
  stagingPassword,
  100
);