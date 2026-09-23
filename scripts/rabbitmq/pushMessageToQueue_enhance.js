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
    const messageLimit = 23000;
    const jsonFilePath = "Data_get_from_rabbitMQ_by_scripts/messages_testing_cl_tt_identity_countries_crawling_sources_2026-04-28T07-57-48-762Z.json";
    const rabbitmqHost = "rabbitmq-staging.younetmedia.com";
    const rabbitmqHostTesting = "rabbitmq-testing.ynm.local";


    const queue_name1 = "testing.cl.fb.hashtag_posts_critical_crawling_sources";
    const queue_name2 = "testing.cl.fb.keyword_posts_crisis_crawling_sources";
    const queue_name3 = "cl.fb.keyword_posts_crisis_no_token_crawling_sources";
    const queue_name4 = "testing.cl.tt.posts_from_critical_keyword_by_mobile_api_crawling_sources";
    const queue_name5 = "cl.fb.keyword_posts_crisis_no_token_crawling_sources";
    const queue_name6 = "testing.cl.fb.user_identity_countries_crawling_sources";

    const queue_name7 = "cl.fb.keyword_posts_crisis_no_token_crawling_sources";
    const queue_name8 = "staging.cl.fb.keyword_posts_crisis_crawling_sources";
    const queue_name9 = "staging.cl.fb.hashtag_posts_critical_crawling_sources";
    const queue_name10 = "staging.cl.tt.posts_from_crisis_keyword_by_mobile_api_crawling_sources";
    const queue_name11 = "staging.cl.tt.posts_from_critical_keyword_by_mobile_api_crawling_sources";
    const queue_name12 = "testing.cl.mentions_2_solr_mentions";
    

    const queue_name13 = "testing.cl.yt.article_urls_from_keyword_crawling_sources";
    const queue_name14 = "app.socialheat.crawling.fb_post_url";
    const queue_name15 = "staging.cl.mentions_2_solr_mentions";
    
    const queue_name16 = "staging.cl.yt.article_urls_from_keyword_crawling_sources";
    const queue_name17 = "staging.cl.fb.keyword_posts_crisis_crawling_sources";
    const queue_name18 = "staging.cl.news.article_post_from_ggmaps_crawling_sources";
    const queue_name19 = "app.socialheat.crawling.fb_post_url"; 
    const queue_name20 = "staging.cl.tt.identity_countries_crawling_sources";
    const queue_name21 = "testing.cl.tt.article_urls_from_crisis_keyword_crawling_sources";
    const queue_name22 = "testing.cl.tt.identity_countries_crawling_sources";
    




    const username = 'lamtt';
    const password = "vYoWn4KCmDYpvuFiqovWbF";
    const testingPassword = "lamtt";
    const vhost = '/';
  for(let i = 0; i < 1; i++) {
    try {
      await getQueueInfo( 
        rabbitmqHostTesting, 
        queue_name22, 
        username,
        testingPassword,
        vhost,);
      
      const count = await pushMessagesToRabbitMQ(jsonFilePath, 
        rabbitmqHostTesting, 
        queue_name22, 
        username,
        testingPassword,
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


