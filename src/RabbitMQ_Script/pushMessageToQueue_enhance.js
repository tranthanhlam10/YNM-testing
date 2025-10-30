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
 * @param {number} messageLimit - Giới hạn số lượng message được push (mặc định là không giới hạn)
 * @returns {Promise<number>} - Số lượng message đã gửi thành công
 */
async function pushMessagesToRabbitMQ(
  jsonFilePath,
  rabbitmqHost,
  queueName,
  username,
  password,
  vhost,
  messageLimit,
) 
    {
        try {
            const data = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
            
            // Xác định danh sách messages cần gửi
            let messages = Array.isArray(data) ? data : [data];
            
            // Áp dụng giới hạn số lượng message

            // Chỗ này nếu load dup thì bị thiếu soort 
            if (messageLimit !== Infinity && messageLimit > 0) {
              messages = messages.slice(0, messageLimit);
              console.log(`Đã giới hạn số lượng tin nhắn: ${messages.length} / ${Array.isArray(data) ? data.length : 1}`);
            }
            
            const auth = Buffer.from(`${username}:${password}`).toString('base64');
        
            const apiUrl = `https://${rabbitmqHost}/api/exchanges/${encodeURIComponent(vhost)}/amq.default/publish`;
            
            console.log(`Đẩy tin nhắn vào queue ${queueName} sử dụng HTTP API...`);
        
            // Tạo HTTPS Agent để bỏ qua xác thực SSL
            const httpsAgent = await getHttpsAgent();
        
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
                },
                httpsAgent  // Bỏ qua xác thực chứng chỉ SSL
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


async function getHttpsAgent() {
    const { default: https } = await import('https');
    return new https.Agent({ rejectUnauthorized: false });
  }
  

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
        
        console.log('Thông tin queue:', response.data);
        return response.data;
      } catch (error) {
        console.error(`Không thể lấy thông tin queue: ${error.message}`);
        throw error;
      }
}


async function main() {
    const messageLimit = 1000;
    const jsonFilePath= 'Data_get_from_rabbitMQ_by_scripts/replyCrawlPost_1.json';
    const rabbitmqHost = 'rabbitmq-testing.ynm.local';
    const queueName = 'testing.cl.tr.reply_posts_crawling_sources';
    const username = 'lamtt';
    const password = 'lamtt';
    const vhost = '/';

  
  for(let i = 0; i < 1; i++) {
    try {
      await getQueueInfo( 
        rabbitmqHost, 
        queueName, 
        username,
        password,
        vhost,);
      
      const count = await pushMessagesToRabbitMQ(jsonFilePath, 
        rabbitmqHost, 
        queueName, 
        username,
        password,
        vhost,
        messageLimit
      );
      
      console.log(`Tổng số tin nhắn đã gửi: ${count}`);
      console.log(`Thứ tự lần gửi: ${i+1}`);
      console.log('-----------------------------------');
    } catch (error) {
      console.error('Không thể gửi tin nhắn:', error);
    }
  }
}


main();


export { pushMessagesToRabbitMQ, getQueueInfo };


