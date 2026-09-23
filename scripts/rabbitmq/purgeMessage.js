import axios from 'axios';

/**
 * Purge RabbitMQ queues based on regex pattern using Management API
 * @param {string} rabbitmqHttpUrl - RabbitMQ HTTP Management URL (e.g., 'http://rabbitmq-testing.ynm.local')
 * @param {string} username - RabbitMQ username
 * @param {string} password - RabbitMQ password
 * @param {string|RegExp} queuePattern - Regex pattern to match queue names
 * @param {Object} options - Additional options
 * @param {boolean} options.dryRun - If true, only log queues without purging
 * @param {string[]} options.excludeQueues - Array of queue names to exclude
 * @param {string} options.vhost - Virtual host (default: '/')
 */
async function purgeQueuesByRegex(rabbitmqHttpUrl, username, password, queuePattern, options = {}) {
    const {
        dryRun = false,
        excludeQueues = [],
        vhost = '/'
    } = options;

    try {
        // Convert string pattern to RegExp if needed
        const regex = queuePattern instanceof RegExp
            ? queuePattern
            : new RegExp(queuePattern);

        console.log('Fetching queues from RabbitMQ...');

        // Get list of all queues
        const queues = await getQueues(rabbitmqHttpUrl, username, password, vhost);

        // Filter queues by regex
        const matchedQueues = queues.filter(queue => {
            const matches = regex.test(queue.name);
            const notExcluded = !excludeQueues.includes(queue.name);
            return matches && notExcluded;
        });

        console.log(`\nFound ${matchedQueues.length} queues matching pattern: ${regex}`);

        if (matchedQueues.length === 0) {
            console.log('No queues to purge.');
            return { success: true, purged: [] };
        }

        // Display matched queues
        console.log('\nMatched queues:');
        matchedQueues.forEach((q, i) => {
            console.log(`  ${i + 1}. ${q.name} (${q.messages} messages)`);
        });

        if (dryRun) {
            console.log('\n[DRY RUN] No queues were purged.');
            return { success: true, purged: [], dryRun: true };
        }

        // Confirm before purging
        console.log('\nPurging queues...');
        const results = [];

        for (const queue of matchedQueues) {
            try {
                const messageCount = await purgeQueue(
                    rabbitmqHttpUrl,
                    username,
                    password,
                    vhost,
                    queue.name
                );

                console.log(`✓ Purged ${queue.name}: ${messageCount} messages deleted`);
                results.push({
                    queue: queue.name,
                    success: true,
                    messageCount: messageCount
                });
            } catch (error) {
                console.error(`✗ Failed to purge ${queue.name}:`, error.message);
                results.push({
                    queue: queue.name,
                    success: false,
                    error: error.message
                });
            }
        }

        // Summary
        const successCount = results.filter(r => r.success).length;
        const totalMessages = results.reduce((sum, r) => sum + (r.messageCount || 0), 0);

        console.log(`\n--- Summary ---`);
        console.log(`Queues purged: ${successCount}/${matchedQueues.length}`);
        console.log(`Total messages deleted: ${totalMessages}`);

        return {
            success: true,
            purged: results,
            totalMessages
        };

    } catch (error) {
        console.error('Error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Get list of queues from RabbitMQ HTTP API
 */
async function getQueues(rabbitmqHttpUrl, username, password, vhost = '/') {
    const encodedVhost = encodeURIComponent(vhost);
    const url = `${rabbitmqHttpUrl}/api/queues/${encodedVhost}`;

    try {
        const response = await axios.get(url, {
            auth: { username, password },
            headers: {
                'Accept': 'application/json'
            }
        });

        return response.data.map(q => ({
            name: q.name,
            messages: q.messages || 0,
            consumers: q.consumers || 0,
            vhost: q.vhost
        }));
    } catch (error) {
        console.error('Failed to fetch queues:', error.message);
        throw new Error('Cannot get queue list. Check your credentials and RabbitMQ URL.');
    }
}

/**
 * Purge a single queue using RabbitMQ Management API
 */
async function purgeQueue(rabbitmqHttpUrl, username, password, vhost, queueName) {
    const encodedVhost = encodeURIComponent(vhost);
    const encodedQueueName = encodeURIComponent(queueName);
    const url = `${rabbitmqHttpUrl}/api/queues/${encodedVhost}/${encodedQueueName}/contents`;

    try {
        const response = await axios.delete(url, {
            auth: { username, password },
            headers: {
                'Accept': '*/*',
                'Content-Type': 'application/json'
            },
            data: {
                vhost: vhost,
                name: queueName,
                mode: 'purge'
            }
        });

        // RabbitMQ returns 204 No Content on success
        // Get queue info again to check messages purged
        const queueInfo = await getQueueInfo(rabbitmqHttpUrl, username, password, vhost, queueName);
        return queueInfo.messages_ready || 0;

    } catch (error) {
        if (error.response?.status === 204) {
            // Success - 204 No Content
            return 0;
        }
        throw new Error(`Failed to purge queue: ${error.response?.data?.reason || error.message}`);
    }
}

/**
 * Get single queue info
 */
async function getQueueInfo(rabbitmqHttpUrl, username, password, vhost, queueName) {
    const encodedVhost = encodeURIComponent(vhost);
    const encodedQueueName = encodeURIComponent(queueName);
    const url = `${rabbitmqHttpUrl}/api/queues/${encodedVhost}/${encodedQueueName}`;

    try {
        const response = await axios.get(url, {
            auth: { username, password }
        });
        return response.data;
    } catch (error) {
        return { messages_ready: 0 };
    }
}

// ============================================
// USAGE EXAMPLES
// ============================================

// Example 1: Purge all Facebook crawling sources with prefix (dry run)
async function example1() {
    await purgeQueuesByRegex(
        'http://rabbitmq-testing.ynm.local',
        'lamtt',
        'lamtt',
         /^cl\.(fb|tr)\..+_crawling_sources$/,
        { dryRun: true }
    );
}


example1();

// Example 2: Purge all crawling sources
async function example2() {
    await purgeQueuesByRegex(
        'http://rabbitmq-testing.ynm.local',
        'lamtt',
        'lamtt',
        /^testing_id\.cl\.fb\./
    );
}

//example2();

// Example 3: Purge with exclusions
async function example3() {
    await purgeQueuesByRegex(
        'http://rabbitmq-testing.ynm.local',
        'lamtt',
        'lamtt',
        /^testing_id\.cl\.fb\./,
        {
            excludeQueues: [
                'testing_id.cl.fb.user_posts_crawling_sources'
            ]
        }
    );
}

// Example 4: Purge staging services
async function example4() {
    await purgeQueuesByRegex(
        'http://rabbitmq-testing.ynm.local',
        'lamtt',
        'lamtt',
        /^testing_id\.ynm-cl-.+-staging$/
    );
}

// Example 5: Purge specific pattern from your document
async function example5() {
    const patterns = [
        /^testing_id\.cl\.fb\.page_comments_crawling_sources$/,
        /^testing_id\.cl\.fb\.page_posts_crawling_sources$/,
        /^testing_id\.cl\.tr\.source_posts_crawling_sources$/
    ];

    for (const pattern of patterns) {
        await purgeQueuesByRegex(
            'http://rabbitmq-testing.ynm.local',
            'lamtt',
            'lamtt',
            pattern
        );
    }
}

// Run example
// example1();

export default {
    purgeQueuesByRegex,
    getQueues,
    purgeQueue
};