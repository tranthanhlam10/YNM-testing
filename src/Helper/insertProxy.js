/**
 * Hàm tạo câu lệnh SQL INSERT cho danh sách proxy
 * @param {string} rawProxyText - Raw text chứa danh sách proxy
 * @param {string} crawlerType - Loại crawler (mặc định 'FB_ARTICLE_URL_FROM_KEYWORD_CRAWLER')
 * @param {string} country - Mã quốc gia (mặc định 'VN')
 * @returns {string} Câu lệnh SQL hoàn chỉnh
 */
function generateProxyInsertSQL(rawProxyText, crawlerType = 'TT_IDENTITY_CRAWLER', country = 'VN') {
    // Hàm helper để format thời gian YYYY-MM-DD HH:mm:ss theo giờ local
    const getLocalTimestamp = () => {
        const pad = (n) => n.toString().padStart(2, '0');
        const d = new Date();
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    };

    const createdAt = getLocalTimestamp();

    // Tách chuỗi text thành mảng các dòng và loại bỏ dòng trống
    const lines = rawProxyText.trim().split('\n').filter(line => line.trim() !== '');

    // Map từng dòng thành chuỗi value của SQL
    const values = lines.map(line => {
        const parts = line.trim().split(':');
        
        // Bỏ qua nếu dòng không đủ định dạng IP:PORT:USER:PASS
        if (parts.length !== 4) {
            console.warn(`[Cảnh báo] Bỏ qua dòng sai định dạng: ${line}`);
            return null;
        }

        const [ip, port, username, password] = parts;

        // Sử dụng crypto.randomUUID() (yêu cầu Node.js >= 15.6.0 hoặc trình duyệt hiện đại)
        // Nếu dùng Node bản cũ hơn, bạn có thể dùng thư viện 'uuid' (uuidv4)
        const id = crypto.randomUUID(); 
        const proxyUrl = `http://${ip}:${port}`;
        const credential = `${username}:${password}`;

        return `     ('${id}','${proxyUrl}','${crawlerType}','${credential}',NULL,'ACTIVE','${createdAt}','${country}')`;
    }).filter(Boolean); // Lọc bỏ các giá trị null

    if (values.length === 0) {
        return '-- Không tìm thấy dữ liệu proxy hợp lệ để generate.';
    }

    // Ghép câu lệnh INSERT với các values
    const sqlQuery = `INSERT INTO ynm_proxies.proxies (id,proxy,crawler_type,credential,blocked_at,status,created_at,country) VALUES\n${values.join(',\n')};`;

    return sqlQuery;
}

// ================= TEST CHẠY THỬ =================

const inputData = `
131.108.18.9:12345:media2014:8983UHDk33455skdjfkj
162.212.175.135:12345:media2014:8983UHDk33455skdjfkj
104.160.8.119:12345:media2014:8983UHDk33455skdjfkj
196.196.169.221:12345:media2014:8983UHDk33455skdjfkj
23.108.252.115:12345:media2014:8983UHDk33455skdjfkj
155.94.244.31:12345:media2014:8983UHDk33455skdjfkj
131.108.18.121:12345:media2014:8983UHDk33455skdjfkj
107.158.95.14:12345:media2014:8983UHDk33455skdjfkj
23.108.44.14:12345:media2014:8983UHDk33455skdjfkj
131.108.19.214:12345:media2014:8983UHDk33455skdjfkj
50.3.222.185:12345:media2014:8983UHDk33455skdjfkj
177.234.138.224:12345:media2014:8983UHDk33455skdjfkj
207.244.118.206:12345:media2014:8983UHDk33455skdjfkj
23.104.162.250:12345:media2014:8983UHDk33455skdjfkj
196.242.114.65:12345:media2014:8983UHDk33455skdjfkj
165.140.199.245:12345:media2014:8983UHDk33455skdjfkj
23.108.44.108:12345:media2014:8983UHDk33455skdjfkj
196.199.10.145:12345:media2014:8983UHDk33455skdjfkj
196.240.38.161:12345:media2014:8983UHDk33455skdjfkj
192.241.95.46:12345:media2014:8983UHDk33455skdjfkj
192.198.108.29:12345:media2014:8983UHDk33455skdjfkj
200.10.47.9:12345:media2014:8983UHDk33455skdjfkj
185.158.106.54:12345:media2014:8983UHDk33455skdjfkj
198.46.222.45:12345:media2014:8983UHDk33455skdjfkj
`;

const result = generateProxyInsertSQL(inputData);
console.log(result);