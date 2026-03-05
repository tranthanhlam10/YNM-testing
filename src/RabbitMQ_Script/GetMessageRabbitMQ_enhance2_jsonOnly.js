import axios from 'axios';
import { promises as fs } from 'fs';

async function peekMessagesAndSaveToJSON(method, domain, queueName, userName, passWord, count) {
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
        count: count,       
        encoding: 'auto',
        ackmode: 'reject_requeue_true',
        truncate: 500000000
      },
      timeout: 30000000,
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
        // Lưu message lỗi vào payloads để không mất data
        payloads.push({
          _error: true,
          _error_message: err.message,
          _original_message: message
        });
      }
    }

    if (payloads.length === 0) {
      console.log('No valid payloads found in messages.');
      return;
    }

    // Tạo thư mục output nếu cần
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputDir = 'Data_get_from_rabbitMQ_by_scripts';
    await fs.mkdir(outputDir, { recursive: true });

    // Chỉ lưu file JSON duy nhất
    const outputFile = `${outputDir}/messages_${queueName.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.json`;
    
    await fs.writeFile(outputFile, JSON.stringify(payloads, null, 2));

    console.log(`Successfully peeked ${payloads.length} messages (messages remain in queue).`);
    console.log(`JSON saved to: ${outputFile}`);

  } catch (error) {
    console.error('Error occurred:');
    if (error.response) {
      console.error(`Server Error: ${error.response.status}`);
      console.error(`Response data:`, error.response.data);
    } else if (error.request) {
      console.error('No response received');
      console.error(error.request);
    } else {
      console.error('Error:', error.message);
    }
    console.error(error.stack);
  }
}

const testHTTP = 'http';
const stagingHTTP = 'https';

const testDomain = 'rabbitmq-testing.ynm.local';
const stagingDomain = 'rabbitmq-staging.younetmedia.com';

const queueName = "staging.cl.identities_finished_sources_LamTT";
const queueName1 = "staging.cl.identities_2_solr_identities_LamTT";
const queueName2 = "staging.cl.identities_2_redis_identities_LamTT";
const queue_name3 =  "testing.cl.ig.keyword_posts_web_crisis_crawled_sources"; 
const queue_name4 = "staging.cl.mentions_2_solr_mentions_LamTT";
const queue_name5 = "staging.cl.posts_2_solr_ig_posts_LamTT";

const queue_name6 = "staging.cl.ig.posts_crawling_sources";
const queue_name7 = "staging.cl.identities_finished_sources";
const queue_name8 = "app.socialheat.crawling.fb_post_url_LamTT";
const queue_name9 = "testing.cl.fb.article_urls_from_keyword_crawling_requests";
const queue_name10 = "testing.cl.fb.article_urls_from_keyword_crawling_sources";



//const queue_name7 = "staging.cl.tr.keyword_posts_crisis_no_cookie_crawling_sources";


const userName = 'lamtt'; 
const testPassword = 'lamtt';
const stagingPassword = 'vYoWn4KCmDYpvuFiqovWbF';

peekMessagesAndSaveToJSON(
  testHTTP,
  testDomain,
  queue_name8,
  userName,
  testPassword,
  1000
);