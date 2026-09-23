# RETEST SCOPE TRÊN MÔI TRƯỜNG TESTING
## Auto Refill Token & Renew Proxies

| Field | Value |
|---|---|
| Feature | 08-F01 Token Auto-Distribution, 08-F02 Proxy Monthly Renew |
| Source docs | `Feature_Flow_Detail_Auto_Refill_Token_Renew_Proxies.md`, `TestPlan_Auto_Refill_Token_Renew_Proxies.md`, Google Sheet test cases |
| Local status | Đã test xong ở môi trường local |
| Target env | Testing |
| Goal | Chọn các test case cần test lại sau khi task đã deploy lên môi trường testing |

---

## 1. Vì sao không cần chạy lại quá nhiều case?

Vì local đã test xong phần lớn logic nghiệp vụ, khi lên testing không nên chạy lại toàn bộ test suite nếu không có thay đổi lớn về code. Trên testing, mục tiêu chính là xác nhận các điểm mà local không đại diện đầy đủ:

- Service đã deploy đúng trên K8s testing.
- Job đọc đúng DB/config/env của testing.
- Slack webhook/channel testing hoạt động.
- RabbitMQ testing hoạt động với Queue Checker.
- Airflow DAG và BuyProxies config hoạt động.
- Các bug local đã được fix hoặc vẫn còn tồn tại trên testing.
- Crawler hiện tại không bị regression sau deploy.

Vì vậy, scope hợp lý là **bộ smoke + bug retest + integration regression**, không phải full regression.

---

## 2. Bộ bắt buộc chạy lại trên testing

Đề xuất chạy **18 test cases bắt buộc**. Đây là bộ đủ gọn để tiết kiệm thời gian nhưng vẫn cover các rủi ro lớn nhất sau deploy.

| Test case | Module | Vì sao chọn test lại |
|---|---|---|
| `TC_CrawlerConfig_002` | Token Resource Config | Verify service testing đọc config mới mà không cần restart pod. Đây là smoke test quan trọng cho DB config + K8s job. |
| `TC_CrawlerConfig_003` | Token Resource Config | Local đang BUG `YNMPDP-5989`. Cần retest duplicate config để biết bug còn hay đã fix trên testing. |
| `TC_TokenPool_002` | Pool Tổng | Local đang BUG `YNMPDP-5990`. Cần verify crawler query không lấy token Blocked/Pool Tổng sai. |
| `TC_TokenPool_003` | Pool Tổng | Local đang BUG liên quan token Blocked/Broken. Cần verify watcher có bơm bù khi token bị block. |
| `TC_Watcher_001` | Token Orchestrator | Happy path cốt lõi: pool đủ thì bơm đúng số lượng token thiếu. Nếu case này fail thì feature F01 chưa ổn trên testing. |
| `TC_Watcher_005` | Token Orchestrator | Local đang BUG `YNMPDP-5991`. Cần retest DB disconnect: log, Slack alert, pod không crash. |
| `TC_Watcher_006` | Token Orchestrator | Verify worker chỉ bơm đúng platform. Testing thường chạy nhiều worker/platform nên cần check lại. |
| `TC_QueueChecker_001` | Queue + Token Checker | Case này phụ thuộc RabbitMQ + Slack testing, local chưa verify đầy đủ. Cần test alert khi queue tồn đọng nhưng token đủ. |
| `TC_QueueChecker_002` | Queue + Token Checker | Verify không alert sai khi queue tồn đọng do thiếu token. Đây là điều kiện AND quan trọng của Queue Checker. |
| `TC_PoolAlert_001` | Pool Alert & Mode | Verify Warning mode và `pool_alert` trên Slack testing. Local từng có Slack 403 nên cần check lại channel/webhook thật. |
| `TC_PoolAlert_003` | Pool Alert & Mode | Verify Scarcity Mode được kích hoạt đúng khi pool xuống ngưỡng nguy hiểm. Đây là mode rủi ro cao nhất của token distribution. |
| `TC_PoolAlert_006` | Pool Alert & Mode | Local đang BUG `YNMPDP-5993`. Cần retest P0 xử lý đúng trong Scarcity. |
| `TC_Scarcity_002` | Scarcity Mode | Local đang BUG `YNMPDP-5994`. Cần retest P1 không bơm khi đã >= 50% quota và không loop bất thường. |
| `TC_Scarcity_005` | Scarcity Mode | Verify thoát Scarcity khi pool hồi phục. Nếu sai, hệ thống có thể bị kẹt ở Scarcity Mode. |
| `TC_ProxyRenew_001` | Proxy Monthly Renew | Happy path cốt lõi của F02: Airflow DAG chạy thành công, import proxy mới, expire proxy cũ. |
| `TC_ProxyRenew_003` | Proxy Monthly Renew | Local đang BUG: API fail 3 lần cần giữ proxy cũ và gửi Slack alert. Đây là failure path quan trọng nhất của proxy renew. |
| `TC_Regression_001` | Regression | Sau deploy, crawler hiện tại phải vẫn lấy token được và không phát sinh lỗi mới. |
| `TC_DataIntegrity_001` | Data Integrity | Sau các cycle bơm token, tổng token Active không được mất hoặc bị thay đổi sai. |

---

## 3. Case nên chạy thêm nếu còn thời gian

Nhóm này không bắt buộc trong vòng retest đầu tiên. Chỉ chạy nếu còn thời gian, nếu testing env rảnh, hoặc nếu case bắt buộc phía trên phát hiện bất thường.

| Test case | Module | Khi nào nên chạy |
|---|---|---|
| `TC_CrawlerConfig_001` | Token Resource Config | Chạy nếu cần smoke test insert config mới trên DB testing. |
| `TC_TokenPool_001` | Pool Tổng | Chạy nếu cần verify import token mới vào Pool Tổng trên testing. |
| `TC_Watcher_003` | Token Orchestrator | Chạy nếu nghi ngờ over-distribution: count đủ quota nhưng service vẫn bơm. |
| `TC_Watcher_004` | Token Orchestrator | Chạy nếu muốn bắt lỗi boundary quota - 1. |
| `TC_Watcher_008` | Token Orchestrator | Chạy nếu testing có thể setup pool = 0 an toàn. |
| `TC_PoolAlert_004` | Pool Alert & Mode | Chạy nếu cần verify boundary pool = 1.0x không vào Scarcity. |
| `TC_PoolAlert_005` | Pool Alert & Mode | Chạy nếu cần verify boundary pool < 1.0x vào Scarcity. |
| `TC_Scarcity_001` | Scarcity Mode | Chạy nếu muốn cover đầy đủ P0/P1/P2 trong một cycle. |
| `TC_Scarcity_015` | Scarcity Mode | Chạy nếu muốn verify P0 dùng hết pool thì P1 skip. |
| `TC_SlackAlert_001` | Slack Alerts | Chạy nếu cần đo alert latency <= 1 phút. |
| `TC_SlackAlert_002` | Slack Alerts | Có thể gộp khi chạy `TC_PoolAlert_001`. |
| `TC_SlackAlert_003` | Slack Alerts | Có thể gộp khi chạy `TC_QueueChecker_001`. |
| `TC_SlackAlert_004` | Slack Alerts | Có thể gộp khi chạy `TC_PoolAlert_003`. |
| `TC_ProxyRenew_002` | Proxy Monthly Renew | Chạy nếu có cách simulate API fail lần 1 rồi success lần 2 mà không ảnh hưởng dữ liệu thật. |
| `TC_ProxyRenew_005` | Proxy Monthly Renew | Có thể gộp khi chạy `TC_ProxyRenew_001` bằng cách check log thứ tự import trước, expire sau. |
| `TC_Regression_002` | Regression | Chạy nếu nghi ngờ migration/data seed testing chưa đúng. |
| `TC_DataIntegrity_003` | Data Integrity | Chạy nếu thấy crawler_type trong tokens không khớp config. |

---

## 4. Case có thể bỏ qua trong vòng retest này

Các case dưới đây đã pass local, bị duplicate, status IGNORE, cần mock third-party, hoặc không đem lại nhiều giá trị khi testing chỉ cần retest sau deploy.

| Nhóm case | Lý do bỏ qua |
|---|---|
| `TC_CrawlerConfig_004`, `TC_CrawlerConfig_005`, `TC_CrawlerConfig_006` | Schema/worker config đã pass local; chỉ chạy lại nếu nghi ngờ migration/env testing sai. |
| `TC_ProxyConfig_001`, `TC_ProxyConfig_002`, `TC_ProxyConfig_003` | Proxy config không phải rủi ro chính sau deploy; F02 nên tập trung vào DAG renew thật. |
| `TC_Watcher_007`, `TC_Watcher_009`, `TC_Watcher_010` | Đã pass local hoặc là config/interval test; không cần chạy trong smoke regression testing. |
| `TC_QueueChecker_003`, `TC_QueueChecker_004`, `TC_QueueChecker_005` | RabbitMQ down/unknown queue/frequency nên để test riêng nếu có window; không nên phá env testing khi smoke. |
| `TC_PoolAlert_002` | Nội dung case đang lệch giữa tên, step và expected; nên sửa test case trước khi dùng làm evidence. |
| `TC_Scarcity_003`, `TC_Scarcity_004`, `TC_Scarcity_009`, `TC_Scarcity_011`, `TC_Scarcity_013`, `TC_Scarcity_014` | Sheet đang ghi IGNORE/duplicate/đã confirm bỏ qua theo Dev/BA. |
| `TC_Scarcity_006`, `TC_Scarcity_007`, `TC_Scarcity_008`, `TC_Scarcity_010` | Edge cases đã pass local; chỉ chạy nếu bug Scarcity vẫn còn trên testing. |
| `TC_ProxyRenew_004`, `TC_ProxyRenew_006`, `TC_ProxyRenew_007` | Schedule/timeout/retry interval cần điều kiện đặc biệt hoặc mock API; không phù hợp với smoke retest nhanh. |
| `TC_DataIntegrity_002` | Case nặng, cần setup nhiều luồng/token; không cần chạy nếu không có nghi ngờ overlap interval. |

---

## 5. Thứ tự execute đề xuất

Nên chạy theo thứ tự sau để giảm nhiễu data và dễ debug:

1. **Smoke config + watcher**
   - `TC_CrawlerConfig_002`
   - `TC_Watcher_001`
   - `TC_Watcher_006`

2. **Retest bug local**
   - `TC_CrawlerConfig_003`
   - `TC_TokenPool_002`
   - `TC_TokenPool_003`
   - `TC_Watcher_005`
   - `TC_PoolAlert_006`
   - `TC_Scarcity_002`
   - `TC_ProxyRenew_003`

3. **Integration testing-only**
   - `TC_QueueChecker_001`
   - `TC_QueueChecker_002`
   - `TC_PoolAlert_001`
   - `TC_PoolAlert_003`
   - `TC_ProxyRenew_001`

4. **Mode recovery + regression cuối**
   - `TC_Scarcity_005`
   - `TC_Regression_001`
   - `TC_DataIntegrity_001`

---

## 6. Kết luận

Scope retest hợp lý trên testing là:

- **Bắt buộc:** 18 cases
- **Chạy thêm nếu còn thời gian:** 17 cases
- **Bỏ qua/tạm hoãn:** các case còn lại

Lý do không chọn nhiều hơn: local đã cover logic chi tiết rồi. Testing chỉ cần chứng minh deploy thật hoạt động đúng với dependency thật và retest các bug/rủi ro chính.
