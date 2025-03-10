import axios from 'axios';
import fs from 'fs';
import https from 'https';
import path from 'path';

async function fetchAndSavePayloads() {
  try {
    console.log('Fetching messages from RabbitMQ...');
    
    const response = await axios.post(
      'https://rabbitmq-testing.ynm.local/api/queues/%2F/testing.cl.tr.identities_crawling_requests_LamTT/get',
      {
        vhost: "/",
        name: "testing.cl.tr.identities_crawled_sources_LamTT",
        truncate: "5000000", // Increased truncate value to handle larger payloads
        ackmode: "ack_requeue_true",
        encoding: "auto",
        count: "100" // Fetch up to 100 messages
      },
      {
        headers: {
          'accept': '*/*',
          'content-type': 'application/json',
          'authorization': 'Basic bGFtdHQ6bGFtdHQ=',
          'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko)'
        },
        httpsAgent: new https.Agent({
          rejectUnauthorized: false
        }),
        timeout: 60000, // Increased timeout to 60 seconds
        maxContentLength: Infinity, // Allow any response size
        maxBodyLength: Infinity // Allow any request body size
      }
    );

    if (!response.data || response.data.length === 0) {
      console.log('No messages found in the queue.');
      return;
    }

    console.log(`Received ${response.data.length} messages from RabbitMQ.`);
    
    // Create output directory if it doesn't exist
    const outputDir = './rabbitmq_payloads_2';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    
    // Process each message
    response.data.forEach((message, index) => {
      try {
        let payload;
        
        // Handle the payload based on its type
        if (typeof message.payload === 'string') {
          try {
            // Try to parse JSON if it looks like JSON
            if (message.payload.trim().startsWith('{') || message.payload.trim().startsWith('[')) {
              payload = JSON.parse(message.payload);
            } else {
              payload = message.payload;
            }
          } catch (e) {
            // If parsing fails, use the raw string
            payload = message.payload;
          }
        } else {
          // If it's already an object, use it directly
          payload = message.payload;
        }
        
        // Create a unique filename for each message
        const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
        const filename = path.join(outputDir, `payload_${index + 1}_${timestamp}.txt`);
        
        // Save the payload to the file
        if (typeof payload === 'object') {
          fs.writeFileSync(filename, JSON.stringify(payload, null, 2));
        } else {
          fs.writeFileSync(filename, payload);
        }
        
        console.log(`Saved payload ${index + 1} to ${filename}`);
      } catch (e) {
        console.error(`Error processing message ${index + 1}:`, e.message);
      }
    });
    
    console.log(`Successfully saved ${response.data.length} payloads to ${outputDir}/`);
    
  } catch (error) {
    console.error('Error details:');
    if (error.response) {
      console.error('Server Error:', error.response.status);
      console.error('Response headers:', error.response.headers);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received from server');
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
    } else {
      console.error('Error setting up request:', error.message);
    }
    console.error('Full error:', error);
  }
}

fetchAndSavePayloads();