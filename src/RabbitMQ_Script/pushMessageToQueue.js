// Cách 2: Sử dụng ES modules (cần thêm "type": "module" vào package.json)
import fs from 'fs';
import axios from 'axios';

/**
 * Push messages từ file JSON vào RabbitMQ queue sử dụng Management HTTP API
 * 
 * @param {string} jsonFilePath - Đường dẫn đến file JSON chứa dữ liệu cần gửi
 * @param {string} rabbitmqHost - Hostname của RabbitMQ server
 * @param {string} queueName - Tên queue để gửi message
 * @param {string} username - Tên đăng nhập RabbitMQ
 * @param {string} password - Mật khẩu RabbitMQ
 * @param {string} vhost - Virtual host trong RabbitMQ
 * @returns {Promise<number>} - Số lượng message đã gửi thành công
 */
async function pushMessagesToRabbitMQ(
  jsonFilePath,
  rabbitmqHost = 'rabbitmq-cluster-staging.younetmedia.com',
  queueName = 'staging.cl.tr.identities_crawled_sources',
  username = 'lamtt',
  password = 'vYoWn4KCmDYpvuFiqovWbF',
  vhost = '/'
) {
  try {
    const data = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
    
    const messages = Array.isArray(data) ? data : [data];
    
    const auth = Buffer.from(`${username}:${password}`).toString('base64');

    const apiUrl = `https://${rabbitmqHost}/api/exchanges/${encodeURIComponent(vhost)}/amq.default/publish`;
    
    console.log(`Đẩy tin nhắn vào queue ${queueName} sử dụng HTTP API...`);

    let messageCount = 0;
    
    for (const message of messages) {

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
        }
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


async function getQueueInfo(
  rabbitmqHost = 'rabbitmq-cluster-staging.younetmedia.com',
  queueName = 'staging.cl.tr.identities_crawled_sources',
  username = 'lamtt',
  password = 'vYoWn4KCmDYpvuFiqovWbF',
  vhost = '/'
) {
  try {
    const auth = Buffer.from(`${username}:${password}`).toString('base64');
    const apiUrl = `https://${rabbitmqHost}/api/queues/${encodeURIComponent(vhost)}/${encodeURIComponent(queueName)}`;
    
    const response = await axios.get(apiUrl, {
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });
    
    console.log('Thông tin queue:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Không thể lấy thông tin queue: ${error.message}`);
    throw error;
  }
}


async function main() {
  
  for(let i = 0; i < 5000; i++){
    try {
 
    await getQueueInfo();
    
    const count = await pushMessagesToRabbitMQ('src/RabbitMQ_Script/data.json');
    console.log(`Tổng số tin nhắn đã gửi: ${count}`);
    console.log(`Thứ tự tin nhắn: ${i+1}`);
    console.log('-----------------------------------');
  } catch (error) {
    console.error('Không thể gửi tin nhắn:', error);
  }
}
}


main();


export { pushMessagesToRabbitMQ, getQueueInfo };