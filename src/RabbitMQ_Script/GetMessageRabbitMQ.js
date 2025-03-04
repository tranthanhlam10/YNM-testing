const axios = require('axios');
const fs = require('fs');

async function fetchMessages(url ,batchSize, totalMessages) {
    const auth = Buffer.from("lamtt:vYoWn4KCmDYpvuFiqovWbF").toString("base64");

    let messages = [];
    let currentCount = 0;

    while (currentCount < totalMessages) { // Lặp đến khi đạt totalMessages
        try {
            const remainingMessages = totalMessages - currentCount;
            const count = Math.min(batchSize, remainingMessages); // Điều chỉnh batchSize ở lần cuối

            const response = await axios.post( 
                url,
                {
                    vhost: "/",
                    name: "testing.cl.tr.mentions_2_solr_mentions",
                    truncate: "50000",
                    ackmode: "ack_requeue_true",
                    encoding: "auto",
                    count: count
                },
                {
                    headers: {
                        "accept": "*/*",
                        "authorization": `Basic ${auth}`,
                        "content-type": "text/plain;charset=UTF-8"
                    },
                    httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
                }
            );

            if (response.data.length === 0) {
                console.log("No more messages in the queue.");
                break; 
            }

            messages.push(...response.data.map(message => message.payload));
            currentCount += response.data.length;

            console.log(`Fetched ${currentCount}/${totalMessages} messages...`);
        } catch (error) {
            console.error("Error fetching messages:", error);
            break;
        }
    }

    return messages;
}

// Hàm kiểm tra số lượng payload trùng id
function findDuplicateIds(payloads) {
    const idCounts = {};
    const duplicates = [];

    payloads.forEach(payload => {
        try {
            const parsedPayload = JSON.parse(payload); 
            const id = parsedPayload.id;

            if (id) {
                idCounts[id] = (idCounts[id] || 0) + 1;
                if (idCounts[id] === 2) {
                    duplicates.push(id);
                }
            }
        } catch (error) {
            console.error("Error parsing payload:", error);
        }
    });

    return {
        duplicateCount: duplicates.length,
        duplicateIds: duplicates
    };
}

// RabbitMQ config
const url = "https://rabbitmq-staging.younetmedia.com/api/queues/%2F/testing.cl.tr.mentions_2_solr_mentions/get";

const url2 = "https://rabbitmq-staging.younetmedia.com/api/queues/%2F/staging.cl.tr.posts_by_topic_finished_sources/get";
const batchSize = 100;
const totalMessages = 472;


fetchMessages(url2, batchSize, totalMessages).then(payloads => {
    // Lưu chỉ phần payload vào file JSON
    fs.writeFile("payloads_staging_topic.json", JSON.stringify(payloads, null, 2), (err) => {
        if (err) {
            console.error("Error writing to file:", err);
        } else {
            console.log("Payloads saved to payloads_staging_topic.json");

            // Kiểm tra các payload bị trùng ID
            const { duplicateCount, duplicateIds } = findDuplicateIds(payloads);
            console.log(`Found ${duplicateCount} duplicate IDs.`);
            if (duplicateCount > 0) {
                console.log("Duplicate IDs:", duplicateIds);
            }
        }
    });
}).catch(error => {
    console.error("Error in fetching messages:", error);
});
