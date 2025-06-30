/**
 * Kiểm tra xem proxy có hoạt động không
 * @param {string|Object} proxy - Proxy có thể là string "ip:port" hoặc object {host, port, username, password}
 * @param {string} credential - Credential dạng "username:password" (optional)
 * @param {number} timeout - Timeout tính bằng milliseconds (mặc định 10 giây)
 * @param {string} testUrl - URL để test (mặc định là httpbin.org)
 * @returns {Promise<Object>} Kết quả kiểm tra proxy
 */
async function checkProxy(proxy, credential = null, timeout = 10000, testUrl = 'https://httpbin.org/ip') {
    const startTime = Date.now();
    
    try {
        let proxyUrl;
        let authHeader = null;
        
        // Xử lý proxy input
        if (typeof proxy === 'object') {
            // Nếu proxy là object {host, port, username, password}
            const { host, port, username, password } = proxy;
            proxyUrl = `http://${host}:${port}`;
            if (username && password) {
                authHeader = 'Basic ' + btoa(`${username}:${password}`);
            }
        } else {
            // Nếu proxy là string
            if (proxy.startsWith('http://') || proxy.startsWith('https://')) {
                proxyUrl = proxy;
            } else {
                proxyUrl = `http://${proxy}`;
            }
            
            // Xử lý credential nếu có
            if (credential) {
                authHeader = 'Basic ' + btoa(credential);
            }
        }

        // Tạo controller để có thể cancel request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        // Chuẩn bị headers
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json, text/plain, */*'
        };
        
        if (authHeader) {
            headers['Proxy-Authorization'] = authHeader;
        }

        // Test proxy bằng cách gửi request qua proxy
        const response = await fetch(testUrl, {
            method: 'GET',
            signal: controller.signal,
            headers: headers
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            return {
                proxy: typeof proxy === 'object' ? `${proxy.host}:${proxy.port}` : proxy,
                status: 'working',
                responseTime: Date.now() - startTime,
                ip: data.origin || 'unknown',
                success: true,
                error: null,
                hasAuth: !!authHeader
            };
        } else {
            return {
                proxy: typeof proxy === 'object' ? `${proxy.host}:${proxy.port}` : proxy,
                status: 'failed',
                responseTime: null,
                ip: null,
                success: false,
                error: `HTTP ${response.status}: ${response.statusText}`,
                hasAuth: !!authHeader
            };
        }

    } catch (error) {
        return {
            proxy: typeof proxy === 'object' ? `${proxy.host}:${proxy.port}` : proxy,
            status: 'failed',
            responseTime: null,
            ip: null,
            success: false,
            error: error.name === 'AbortError' ? 'Timeout' : error.message,
            hasAuth: !!authHeader
        };
    }
}

/**
 * Kiểm tra nhiều proxy cùng lúc
 * @param {Array<string|Object>} proxies - Mảng các proxy cần kiểm tra
 * @param {Array<string>} credentials - Mảng credential tương ứng (optional)
 * @param {number} concurrent - Số lượng proxy kiểm tra đồng thời (mặc định 5)
 * @param {number} timeout - Timeout cho mỗi proxy
 * @returns {Promise<Array>} Kết quả kiểm tra tất cả proxy
 */
async function checkMultipleProxies(proxies, credentials = [], concurrent = 5, timeout = 10000) {
    const results = [];
    
    // Chia proxies thành các batch
    for (let i = 0; i < proxies.length; i += concurrent) {
        const batch = proxies.slice(i, i + concurrent);
        
        // Kiểm tra batch hiện tại
        const batchPromises = batch.map((proxy, index) => {
            const credential = credentials[i + index] || null;
            return checkProxy(proxy, credential, timeout);
        });
        const batchResults = await Promise.allSettled(batchPromises);
        
        // Xử lý kết quả
        batchResults.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                results.push(result.value);
            } else {
                results.push({
                    proxy: batch[index],
                    status: 'failed',
                    responseTime: null,
                    ip: null,
                    success: false,
                    error: result.reason.message
                });
            }
        });
        
        // Log progress
        console.log(`Đã kiểm tra ${Math.min(i + concurrent, proxies.length)}/${proxies.length} proxy`);
    }
    
    return results;
}

/**
 * Lọc ra các proxy hoạt động tốt
 * @param {Array} results - Kết quả từ checkMultipleProxies
 * @param {number} maxResponseTime - Thời gian phản hồi tối đa (ms)
 * @returns {Array} Danh sách proxy hoạt động tốt
 */
function getWorkingProxies(results, maxResponseTime = 5000) {
    return results.filter(result => 
        result.success && 
        result.responseTime && 
        result.responseTime <= maxResponseTime
    ).sort((a, b) => a.responseTime - b.responseTime);
}

/**
 * Parse proxy data từ database format
 * @param {Array} proxyData - Dữ liệu proxy từ database
 * @returns {Array} Mảng proxy đã parse
 */
function parseProxyData(proxyData) {
    return proxyData.map(row => {
        // Giả sử row có format: {proxy: "ip:port", credential: "user:pass"}
        const proxy = row.proxy || row.A2_proxy;
        const credential = row.credential || row.A2_credential;
        
        if (credential && credential !== 'NULL') {
            return {
                proxy: proxy,
                credential: credential
            };
        }
        
        return {
            proxy: proxy,
            credential: null
        };
    });
}

// Ví dụ sử dụng:
async function example() {
    // Test 1 proxy không có credential
    const singleResult1 = await checkProxy('165.231.105.163:12345');
    console.log('Proxy without auth:', singleResult1);
    
    // Test 1 proxy có credential
    const singleResult2 = await checkProxy('103.79.143.225:49350', 'user49350:password123');
    console.log('Proxy with auth:', singleResult2);
    
    // Test proxy với object format
    const proxyObj = {
        host: '165.231.105.163',
        port: 12345,
        username: 'user123',
        password: 'pass123'
    };
    const objResult = await checkProxy(proxyObj);
    console.log('Proxy object format:', objResult);
    
    // Test nhiều proxy với credential
    const proxies = [
        '165.231.105.163:12345',
        'http://103.79.143.225:49350',
        '191.101.110.66:12345',
        '177.234.143.6:12345'
    ];
    
    const credentials = [
        null, // proxy đầu không cần auth
        'user49350:JGmn7PvaEt', // proxy thứ 2 cần auth
        'user49204:pxAHueHDu', // proxy thứ 3 cần auth
        null // proxy thứ 4 không cần auth
    ];
    
    const results = await checkMultipleProxies(proxies, credentials, 3, 8000);
    console.log('All results:', results);
    
    // Lấy proxy hoạt động tốt
    const workingProxies = getWorkingProxies(results);
    console.log('Working proxies:', workingProxies);
    
    // Thống kê theo loại auth
    const withAuth = results.filter(r => r.hasAuth);
    const withoutAuth = results.filter(r => !r.hasAuth);
    console.log(`Proxy có auth: ${withAuth.length} - Proxy không auth: ${withoutAuth.length}`);
    
    // Thống kê
    const totalProxies = results.length;
    const workingCount = results.filter(r => r.success).length;
    const failedCount = totalProxies - workingCount;
    
    console.log(`Tổng kết: ${totalProxies} proxy - ${workingCount} hoạt động - ${failedCount} lỗi`);
}

// Ví dụ với data từ database
async function exampleWithDBData() {
    // Giả sử data từ database
    const dbData = [
        { proxy: 'http://198.154.80.186:12345', credential: 'media2014:8983UHDk33455skdjfkj' },
        { proxy: 'http://103.79.143.225:49350', credential: 'user49350:JGmn7PvaEt' },
        { proxy: '191.101.110.66:12345', credential: 'user49204:pxAHueHDu' }
    ];
    
    // Parse data
    const parsedData = parseProxyData(dbData);
    
    // Tách proxy và credential
    const proxies = parsedData.map(item => item.proxy);
    const credentials = parsedData.map(item => item.credential);
    
    // Test tất cả
    const results = await checkMultipleProxies(proxies, credentials);
    console.log('DB Results:', results);
}

// Chạy ví dụ
//example();

exampleWithDBData();