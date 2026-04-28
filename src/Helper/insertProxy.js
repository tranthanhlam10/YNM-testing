/**
 * Hàm tạo câu lệnh SQL INSERT cho danh sách proxy
 * @param {string} rawProxyText - Raw text chứa danh sách proxy
 * @param {string} crawlerType - Loại crawler (mặc định 'FB_ARTICLE_URL_FROM_KEYWORD_CRAWLER')
 * @param {string} country - Mã quốc gia (mặc định 'VN')
 * @returns {string} Câu lệnh SQL hoàn chỉnh
 */
function generateProxyInsertSQL(rawProxyText, crawlerType = 'TT_POST_TRANSCRIPT_CRAWLER_LamTT', country = 'VN') {
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
172.245.242.171:12345:media2014:8983UHDk33455skdjfkj
196.199.10.12:12345:media2014:8983UHDk33455skdjfkj
104.168.53.202:12345:media2014:8983UHDk33455skdjfkj
209.242.211.12:12345:media2014:8983UHDk33455skdjfkj
196.240.254.193:12345:media2014:8983UHDk33455skdjfkj
196.240.38.184:12345:media2014:8983UHDk33455skdjfkj
172.245.229.214:12345:media2014:8983UHDk33455skdjfkj
168.227.140.193:12345:media2014:8983UHDk33455skdjfkj
192.198.108.102:12345:media2014:8983UHDk33455skdjfkj
191.96.95.126:12345:media2014:8983UHDk33455skdjfkj
23.104.162.148:12345:media2014:8983UHDk33455skdjfkj
190.123.210.50:12345:media2014:8983UHDk33455skdjfkj
207.244.118.20:12345:media2014:8983UHDk33455skdjfkj
192.3.177.3:12345:media2014:8983UHDk33455skdjfkj
196.198.13.253:12345:media2014:8983UHDk33455skdjfkj
45.125.245.79:12345:media2014:8983UHDk33455skdjfkj
107.173.19.243:12345:media2014:8983UHDk33455skdjfkj
190.123.210.60:12345:media2014:8983UHDk33455skdjfkj
23.94.177.154:12345:media2014:8983UHDk33455skdjfkj
202.14.4.141:12345:media2014:8983UHDk33455skdjfkj
185.158.106.115:12345:media2014:8983UHDk33455skdjfkj
207.244.118.105:12345:media2014:8983UHDk33455skdjfkj
165.140.199.59:12345:media2014:8983UHDk33455skdjfkj
162.212.171.19:12345:media2014:8983UHDk33455skdjfkj
200.10.47.47:12345:media2014:8983UHDk33455skdjfkj
192.198.108.45:12345:media2014:8983UHDk33455skdjfkj
192.241.95.55:12345:media2014:8983UHDk33455skdjfkj
202.14.7.156:12345:media2014:8983UHDk33455skdjfkj
162.212.170.163:12345:media2014:8983UHDk33455skdjfkj
23.94.10.32:12345:media2014:8983UHDk33455skdjfkj
162.212.171.18:12345:media2014:8983UHDk33455skdjfkj
107.150.71.164:12345:media2014:8983UHDk33455skdjfkj
191.96.95.223:12345:media2014:8983UHDk33455skdjfkj
200.10.47.110:12345:media2014:8983UHDk33455skdjfkj
196.197.25.113:12345:media2014:8983UHDk33455skdjfkj
23.94.148.244:12345:media2014:8983UHDk33455skdjfkj
192.198.108.13:12345:media2014:8983UHDk33455skdjfkj
107.158.95.212:12345:media2014:8983UHDk33455skdjfkj
196.240.38.63:12345:media2014:8983UHDk33455skdjfkj
185.158.106.183:12345:media2014:8983UHDk33455skdjfkj
50.3.221.73:12345:media2014:8983UHDk33455skdjfkj
202.14.5.187:12345:media2014:8983UHDk33455skdjfkj
192.241.95.61:12345:media2014:8983UHDk33455skdjfkj
209.242.211.120:12345:media2014:8983UHDk33455skdjfkj
200.10.47.237:12345:media2014:8983UHDk33455skdjfkj
209.127.28.219:12345:media2014:8983UHDk33455skdjfkj
165.140.199.228:12345:media2014:8983UHDk33455skdjfkj
191.96.95.121:12345:media2014:8983UHDk33455skdjfkj
196.240.38.245:12345:media2014:8983UHDk33455skdjfkj
43.225.191.128:12345:media2014:8983UHDk33455skdjfkj
45.92.28.127:12345:media2014:8983UHDk33455skdjfkj
192.198.108.194:12345:media2014:8983UHDk33455skdjfkj
172.245.242.144:12345:media2014:8983UHDk33455skdjfkj
192.3.114.24:12345:media2014:8983UHDk33455skdjfkj
23.108.252.75:12345:media2014:8983UHDk33455skdjfkj
131.108.18.49:12345:media2014:8983UHDk33455skdjfkj
177.234.138.230:12345:media2014:8983UHDk33455skdjfkj
165.140.199.211:12345:media2014:8983UHDk33455skdjfkj
200.10.47.53:12345:media2014:8983UHDk33455skdjfkj
107.175.80.118:12345:media2014:8983UHDk33455skdjfkj
50.3.222.214:12345:media2014:8983UHDk33455skdjfkj
107.174.108.121:12345:media2014:8983UHDk33455skdjfkj
190.123.210.189:12345:media2014:8983UHDk33455skdjfkj
107.158.95.28:12345:media2014:8983UHDk33455skdjfkj
190.123.219.135:12345:media2014:8983UHDk33455skdjfkj
45.92.28.239:12345:media2014:8983UHDk33455skdjfkj
191.101.109.247:12345:media2014:8983UHDk33455skdjfkj
23.105.157.14:12345:media2014:8983UHDk33455skdjfkj
192.241.72.207:12345:media2014:8983UHDk33455skdjfkj
192.198.108.57:12345:media2014:8983UHDk33455skdjfkj
196.240.254.238:12345:media2014:8983UHDk33455skdjfkj
192.210.174.48:12345:media2014:8983UHDk33455skdjfkj
192.3.177.39:12345:media2014:8983UHDk33455skdjfkj
190.123.210.196:12345:media2014:8983UHDk33455skdjfkj
200.10.47.17:12345:media2014:8983UHDk33455skdjfkj
23.104.162.69:12345:media2014:8983UHDk33455skdjfkj
172.245.242.140:12345:media2014:8983UHDk33455skdjfkj
172.245.242.133:12345:media2014:8983UHDk33455skdjfkj
23.108.252.7:12345:media2014:8983UHDk33455skdjfkj
202.14.6.189:12345:media2014:8983UHDk33455skdjfkj
202.14.7.162:12345:media2014:8983UHDk33455skdjfkj
131.108.19.109:12345:media2014:8983UHDk33455skdjfkj
23.105.159.135:12345:media2014:8983UHDk33455skdjfkj
23.108.252.174:12345:media2014:8983UHDk33455skdjfkj
202.14.6.181:12345:media2014:8983UHDk33455skdjfkj
192.241.72.141:12345:media2014:8983UHDk33455skdjfkj
172.245.242.168:12345:media2014:8983UHDk33455skdjfkj
23.94.77.49:12345:media2014:8983UHDk33455skdjfkj
192.241.72.108:12345:media2014:8983UHDk33455skdjfkj
162.212.174.20:12345:media2014:8983UHDk33455skdjfkj
196.242.114.246:12345:media2014:8983UHDk33455skdjfkj
200.10.47.58:12345:media2014:8983UHDk33455skdjfkj
103.197.170.30:12345:media2014:8983UHDk33455skdjfkj
196.199.10.18:12345:media2014:8983UHDk33455skdjfkj
45.125.245.206:12345:media2014:8983UHDk33455skdjfkj
173.234.154.212:12345:media2014:8983UHDk33455skdjfkj
209.242.211.201:12345:media2014:8983UHDk33455skdjfkj
23.94.148.183:12345:media2014:8983UHDk33455skdjfkj
23.108.254.156:12345:media2014:8983UHDk33455skdjfkj
162.212.173.202:12345:media2014:8983UHDk33455skdjfkj
104.168.5.87:12345:media2014:8983UHDk33455skdjfkj
85.208.115.234:12345:media2014:8983UHDk33455skdjfkj
162.212.175.184:12345:media2014:8983UHDk33455skdjfkj
185.158.106.71:12345:media2014:8983UHDk33455skdjfkj
190.123.210.205:12345:media2014:8983UHDk33455skdjfkj
192.227.191.130:12345:media2014:8983UHDk33455skdjfkj
43.225.191.43:12345:media2014:8983UHDk33455skdjfkj
131.108.19.80:12345:media2014:8983UHDk33455skdjfkj
202.14.4.176:12345:media2014:8983UHDk33455skdjfkj
196.240.254.27:12345:media2014:8983UHDk33455skdjfkj
192.241.72.253:12345:media2014:8983UHDk33455skdjfkj
5.157.20.153:12345:media2014:8983UHDk33455skdjfkj
196.240.254.46:12345:media2014:8983UHDk33455skdjfkj
196.199.10.44:12345:media2014:8983UHDk33455skdjfkj
107.158.95.58:12345:media2014:8983UHDk33455skdjfkj
23.108.4.160:12345:media2014:8983UHDk33455skdjfkj
23.108.254.207:12345:media2014:8983UHDk33455skdjfkj
192.198.108.171:12345:media2014:8983UHDk33455skdjfkj
23.108.254.178:12345:media2014:8983UHDk33455skdjfkj
131.108.18.109:12345:media2014:8983UHDk33455skdjfkj
107.173.211.245:12345:media2014:8983UHDk33455skdjfkj
200.10.47.230:12345:media2014:8983UHDk33455skdjfkj
131.108.19.161:12345:media2014:8983UHDk33455skdjfkj
172.245.196.3:12345:media2014:8983UHDk33455skdjfkj
43.225.191.252:12345:media2014:8983UHDk33455skdjfkj
161.0.1.165:12345:media2014:8983UHDk33455skdjfkj
192.241.95.49:12345:media2014:8983UHDk33455skdjfkj
23.108.254.210:12345:media2014:8983UHDk33455skdjfkj
43.225.191.157:12345:media2014:8983UHDk33455skdjfkj
`;

const result = generateProxyInsertSQL(inputData);
console.log(result);