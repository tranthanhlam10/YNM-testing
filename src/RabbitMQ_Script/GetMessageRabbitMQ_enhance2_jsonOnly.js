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
const queue_name4 = "testing.cl.mentions_2_solr_mentions_LamTT";
const queue_name5 = "staging.cl.posts_2_solr_fb_posts_LamTT";

const queue_name6 = "staging.cl.ig.posts_crawling_sources";
const queue_name7 = "staging.cl.identities_finished_sources";
const queue_name8 = "app.socialheat.crawling.fb_post_url_LamTT";
const queue_name9 = "testing.cl.fb.article_urls_from_keyword_crawling_requests";
const queue_name10 = "testing.cl.fb.article_urls_from_keyword_crawling_sources";




const queue_name11 = "cl.fb.keyword_posts_crisis_no_token_crawling_sources";
const queue_name12 = "app.socialheat.crawl_keyword.results_LamTT";
const queue_name13 = "testing.cl.fb.crisis_media_download";
const queue_name14 = "testing.cl.fb.user_identity_countries_crawling_sources";
const queue_name15 = "testing.cl.mentions_2_solr_mentions";
const queue_name16 = "testing.cl.tt.posts_from_keyword_by_mobile_api_crawling_sources";
const queue_name17 = "testing.cl.fb.hashtag_posts_critical_crawling_sources";
const queue_name18 = "testing.cl.fb.user_identity_countries_crawling_sources";
const queue_name19 = "testing.cl.tt.crisis_media_download";
const queue_name20 = "rnd.socialheat.llm.image_extraction_LinhH";  
const queue_name21 = "rnd.socialheat.llm.summary_input";  
const queue_name22 = "summry_LinhH";  
const queue_name23 = "testing.cl.fb.engagement_by_topic_crisis_image_crawling_source";  
const queue_name24 = "testing.cl.fb.crisis_media_download";  
const queue_name25 = "rnd.socialheat.llm.image_extraction";  
const queue_name26 = "testing.cl.posts_2_solr_fb_posts_LamTT";
const queue_name27 = "staging.cl.posts_2_solr_ig_posts_LamTT";  
const queue_name28 = "rnd.socialheat.llm.image_extraction_error"

const queue_name29 = "app.socialheat.crawling.yt_post_url_LamTT";
const queue_name30 = "testing.cl.yt.article_urls_from_keyword_crawling_sources";
const queue_name31 = "testing.cl.yt.article_urls_from_keyword_crawling_requests";
const queue_name32 = "testing.cl.yt.article_urls_from_keyword_crawled_sources";
const queue_name33 = "app.socialheat.crawl_keyword.results_LamTT_Youtube";





const userName = 'lamtt'; 
const testPassword = 'lamtt';
const stagingPassword = 'vYoWn4KCmDYpvuFiqovWbF';

peekMessagesAndSaveToJSON(
  testHTTP,
  testDomain,
  queue_name4,
  userName,
  testPassword,
  1000
);