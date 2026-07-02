# GIẢI THÍCH CHI TIẾT FLOW — Auto Token Distribution & Proxy Monthly Renew

> **Mục đích tài liệu:** Giúp QA (kể cả Fresher) hiểu rõ **cơ chế hoạt động**, **ý nghĩa tổng thể**, và **lý do tồn tại của từng test case** trước khi bắt tay vào test.
>
> **Tài liệu liên quan:**
> - [Test Plan](file:///Users/tranthanhlam/YNM-testing/Ai_Agents/TestPlan/TestPlan_Auto_Refill_Token_Renew_Proxies.md)
> - [Test Cases](file:///Users/tranthanhlam/YNM-testing/Ai_Agents/TestPlan/TestCases_Auto_Refill_Token_Renew_Proxies.md)
> - [BA Spec F01](file:///Users/tranthanhlam/product-ai-docs/SocialHeat/specs/08-proxy-token-auto-distribution/08-F01-token-auto-distribution.md) · [BA Spec F02](file:///Users/tranthanhlam/product-ai-docs/SocialHeat/specs/08-proxy-token-auto-distribution/08-F02-proxy-monthly-renew.md)

---

# PHẦN 1: TỔNG QUAN HỆ THỐNG

## 1.1 Vấn đề cần giải quyết

Hệ thống SocialHeat thu thập dữ liệu từ các mạng xã hội (Facebook, TikTok, ...) bằng **crawler**. Mỗi crawler cần 2 thứ để hoạt động:

| Tài nguyên | Vai trò | Ví dụ |
|------------|---------|-------|
| **Token** | Chìa khóa xác thực để gọi API mạng xã hội | Token Facebook, Token TikTok |
| **Proxy** | Địa chỉ IP trung gian để tránh bị block khi crawl | IP proxy mua từ BuyProxies |

**Trước khi có tính năng này:**
- Product Support phải **bơm token thủ công** mỗi ngày cho từng luồng crawl → dễ quên, dễ sai, mất thời gian
- Khi token bị block hàng loạt → không ai biết kịp thời → crawler ngưng hoạt động → mất data
- Proxy phải **thay thủ công** mỗi tháng (ngày 20) → login BuyProxies, copy IP, paste vào DB

**Sau khi có tính năng này:**
- Hệ thống **tự động** phát hiện thiếu token → bơm bù ngay trong 1 phút
- Khi token khan hiếm → tự động ưu tiên bơm cho luồng quan trọng (P0) trước
- Proxy **tự động** được làm mới vào ngày 20 hằng tháng → zero manual work

---

## 1.2 Kiến trúc tổng thể

```
┌──────────────────────────────────────────────────────────────────────┐
│                        FEATURE 08-F01                                │
│                   TOKEN AUTO-DISTRIBUTION                            │
│                                                                      │
│  ┌─────────────────┐    ┌──────────────────┐    ┌────────────────┐  │
│  │  Pool Tổng      │    │  crawler_config  │    │  Slack Alert   │  │
│  │  (ynm_tokens.   │    │  (quota, priority│    │  (5 loại       │  │
│  │   tokens)       │    │   platform,      │    │   cảnh báo)    │  │
│  │                 │    │   country)       │    │                │  │
│  │  Token Active   │    │                  │    │                │  │
│  │  crawler_type   │    │  P0 > P1 > P2    │    │                │  │
│  │  = NULL         │    │                  │    │                │  │
│  └────────┬────────┘    └────────┬─────────┘    └───────▲────────┘  │
│           │                      │                       │          │
│           ▼                      ▼                       │          │
│  ┌────────────────────────────────────────────┐          │          │
│  │         TOKEN COUNT WATCHER                │          │          │
│  │         (Cron: mỗi 1 phút)                │──────────┘          │
│  │                                            │                     │
│  │  1. Đếm token Active của từng crawler_type │                     │
│  │  2. So sánh với quota                      │                     │
│  │  3. Nếu thiếu → Bơm từ Pool Tổng          │                     │
│  │  4. Kiểm tra ngưỡng Pool → Alert/Scarcity │                     │
│  └────────────────────────────────────────────┘                     │
│                                                                      │
│  ┌────────────────────────────────────────────┐                     │
│  │      QUEUE + TOKEN CHECKER                 │                     │
│  │      (Cron: mỗi 5 phút)                   │─── Slack Alert      │
│  │                                            │                     │
│  │  1. Đọc queue depth từ RabbitMQ            │                     │
│  │  2. Đọc token count từ DB                  │                     │
│  │  3. Nếu queue tồn đọng + token đủ → Alert │                     │
│  └────────────────────────────────────────────┘                     │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                        FEATURE 08-F02                                │
│                   PROXY MONTHLY RENEW                                │
│                                                                      │
│  ┌────────────────────────────────────────────┐                     │
│  │         AUTO-SYNC JOB (Airflow)            │                     │
│  │         (Cron: ngày 20 hằng tháng)         │                     │
│  │                                            │                     │
│  │  1. Gọi API BuyProxies → lấy IP mới       │                     │
│  │  2. Import proxy mới (status = Active)     │                     │
│  │  3. Vô hiệu hóa proxy cũ (= Expired)      │                     │
│  │  4. Retry tối đa 3 lần nếu lỗi            │                     │
│  │  5. Slack alert nếu thất bại hoàn toàn     │                     │
│  └────────────────────────────────────────────┘                     │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 1.3 Các khái niệm cốt lõi

### Pool Tổng là gì?

**Pool Tổng** = tất cả token Active mà **chưa được gán** cho crawler nào (`crawler_type = NULL`). Đây là "kho dự trữ" trung tâm — khi crawler nào thiếu token, hệ thống lấy từ đây ra bơm.

```
┌──────────────────────────────────────────────┐
│                POOL TỔNG                      │
│          (crawler_type = NULL)                │
│                                              │
│   Token_A  Token_B  Token_C  Token_D ...     │
│   (Active) (Active) (Active) (Active)        │
│                                              │
│   ──── Khi bơm cho FB_Crisis ────            │
│   Token_A.crawler_type = 'FB_Crisis'  ← ra   │
│   Token_B.crawler_type = 'FB_Crisis'  ← ra   │
│                                              │
│   ──── Khi thu hồi từ FB_Mon (P2) ────       │
│   Token_X.crawler_type = NULL  → vào          │
│   Token_Y.crawler_type = NULL  → vào          │
└──────────────────────────────────────────────┘
```

> **Điểm quan trọng:** Token KHÔNG bị tạo mới hay xoá trong quá trình bơm/thu hồi. Chúng chỉ **chuyển quyền sở hữu** bằng cách thay đổi `crawler_type`. Tổng số token Active trong DB phải **luôn không đổi**.

### crawler_config là gì?

Bảng cấu hình cho từng luồng crawl, quyết định:

| Field | Ý nghĩa | Ví dụ |
|-------|---------|-------|
| `crawler_type` | Tên luồng crawl | `FB_Crisis`, `TT_News` |
| `platform` | Nền tảng mạng xã hội | `FB` (Facebook), `TT` (TikTok) |
| `country` | Quốc gia | `VN`, `TH`, `ID` |
| `quota` | Số token tối thiểu luồng đó cần có | 100 |
| `priority` | Mức ưu tiên khi token khan hiếm | `P0` (cao nhất), `P1`, `P2` (thấp nhất) |

### 3 Mode hoạt động

```
                    Pool Tổng
                       │
    ┌──────────────────┼──────────────────┐
    │                  │                  │
    ▼                  ▼                  ▼
 ≥ 1.5×            < 1.5×             < 1.0×
sum(quota)        sum(quota)         sum(quota)
    │                  │                  │
    ▼                  ▼                  ▼
┌────────┐      ┌────────────┐    ┌──────────────┐
│ NORMAL │      │  WARNING   │    │  SCARCITY    │
│ MODE   │      │  MODE      │    │  MODE        │
│        │      │            │    │              │
│Bơm bình│      │Bơm bình   │    │P0: full quota│
│thường  │      │thường +   │    │P1: max 50%   │
│cho tất │      │Slack alert│    │P2: KHÔNG bơm │
│cả luồng│      │"bơm thêm" │    │   + thu hồi  │
└────────┘      └────────────┘    └──────────────┘
                                         │
                                         │ Khi Pool ≥ 1.5×
                                         ▼
                                   ┌────────┐
                                   │ NORMAL │  (tắt Scarcity)
                                   └────────┘
```

**Tại sao ngưỡng TẮT (1.5×) cao hơn ngưỡng BẬT (1.0×)?**

Đây là kỹ thuật **hysteresis** (chống flapping). Nếu bật và tắt ở cùng ngưỡng, khi Pool dao động quanh ngưỡng → hệ thống liên tục bật/tắt Scarcity Mode → rối loạn. Khoảng cách 1.0× → 1.5× tạo "vùng đệm" ổn định.

---

# PHẦN 2: GIẢI THÍCH CHI TIẾT TỪNG FLOW

## Flow 1: Token Count Watcher (Mỗi 1 phút)

```
[START] Cron trigger mỗi 1 phút
    │
    ▼
[1] Kết nối DB
    │
    ├── FAIL → Log lỗi + Slack alert EC-04 → [END]
    │
    ▼ SUCCESS
[2] Đọc crawler_config: lấy danh sách tất cả luồng
    │
    ▼
[3] Với MỖI luồng (crawler_type):
    │
    ├── [3a] Đếm token Active của luồng đó (cùng platform/country)
    │
    ├── [3b] So sánh count vs quota
    │        │
    │        ├── count ≥ quota → SKIP (đủ rồi)
    │        │
    │        └── count < quota → Cần bơm
    │                 │
    │                 ▼
    │        [3c] Kiểm tra mode hiện tại
    │                 │
    │                 ├── NORMAL MODE:
    │                 │    Bơm (quota - count) token từ Pool Tổng
    │                 │    Gán crawler_type = tên luồng
    │                 │
    │                 └── SCARCITY MODE:
    │                      ├── P0: Bơm đến full quota
    │                      ├── P1: Bơm đến max 50% quota
    │                      │       (bỏ qua nếu count ≥ 50%)
    │                      └── P2: KHÔNG bơm
    │                              + Thu hồi token > quota về Pool
    │
    ▼
[4] Sau khi bơm xong, kiểm tra Pool Tổng:
    │
    ├── Pool ≥ 1.5× sum(quota) → Normal Mode (tắt Scarcity nếu đang bật)
    │
    ├── Pool < 1.5× AND ≥ 1.0× → Warning: Slack alert EC-02
    │
    └── Pool < 1.0× → Scarcity Mode: Slack alert EC-07
         Kích hoạt priority distribution
    │
    ▼
[END] Chờ lần chạy tiếp (1 phút sau)
```

### Ý nghĩa của flow này:
- Đây là **trái tim** của hệ thống — chạy mỗi phút để đảm bảo mọi crawler luôn có đủ token
- Nó giải quyết vấn đề **"quên bơm token"** vì hoàn toàn tự động
- Logic priority (P0 > P1 > P2) đảm bảo khi tài nguyên khan hiếm, **luồng quan trọng nhất không bao giờ bị thiếu**

---

## Flow 2: Queue + Token Checker (Mỗi 5 phút)

```
[START] Cron trigger mỗi 5 phút
    │
    ▼
[1] Kết nối RabbitMQ
    │
    ├── FAIL → Log lỗi + Slack alert EC-06 → [END]
    │
    ▼ SUCCESS
[2] Kết nối DB, đọc crawler_config
    │
    ▼
[3] Với MỖI luồng (crawler_type):
    │
    ├── [3a] crawler_type có trong crawler_config?
    │        │
    │        ├── KHÔNG → Log cảnh báo, SKIP → [3 tiếp theo]
    │        │
    │        └── CÓ → Tiếp tục
    │
    ├── [3b] Đọc queue depth từ RabbitMQ
    │
    ├── [3c] Đếm token Active từ DB
    │
    └── [3d] Kiểm tra điều kiện:
             │
             ├── Queue tồn đọng > ngưỡng AND count ≥ quota
             │        → Slack alert EC-03
             │        → KHÔNG bơm (vì token đủ, vấn đề khác)
             │
             └── Queue tồn đọng nhưng count < quota
                      → KHÔNG alert (vì thiếu token → Watcher sẽ bơm)
    │
    ▼
[END]
```

### Ý nghĩa của flow này:
- Flow 1 (Watcher) lo bơm token → giải quyết "thiếu token"
- Flow 2 (Checker) lo **phát hiện vấn đề khác** → khi queue tồn đọng mà token đủ, nghĩa là lỗi nằm ở **demand spike** hoặc **lỗi hệ thống**, không phải thiếu token
- Hai flow **bổ sung cho nhau**: Watcher bơm, Checker cảnh báo

---

## Flow 3: Proxy Monthly Renew (Ngày 20 hằng tháng)

```
[START] Airflow trigger ngày 20
    │
    ▼
[1] Kiểm tra có phải ngày 20?
    │
    ├── KHÔNG → [END]
    │
    ▼ ĐÚNG
[2] Gọi API BuyProxies
    │
    ├── TIMEOUT (> 10s) hoặc LỖI
    │        │
    │        ├── Retry < 3 lần?
    │        │    │
    │        │    ├── CÓ → Chờ 5 phút → [2] retry
    │        │    │
    │        │    └── KHÔNG (đã retry 3 lần)
    │        │         → Giữ nguyên proxy cũ (KHÔNG thay đổi DB)
    │        │         → Slack alert EC-01
    │        │         → [END]
    │        │
    │
    ▼ SUCCESS (có danh sách proxy mới)
[3] Import proxy mới vào DB (status = 'Active')
    │
    ▼
[4] Vô hiệu hóa proxy cũ (status = 'Expired')
    │
    │   ⚠️ THỨ TỰ QUAN TRỌNG: Import trước → Vô hiệu hóa sau
    │   → Đảm bảo tại mọi thời điểm, crawler luôn có proxy Active
    │   → Zero downtime
    │
    ▼
[5] Slack thông báo thành công + số lượng proxy mới
    │
    ▼
[END]
```

### Ý nghĩa của flow này:
- Thay thế hoàn toàn công việc thủ công của Product Support mỗi tháng
- Retry 3 lần + giữ proxy cũ = **fail-safe**: dù API lỗi, crawler vẫn chạy được
- Import trước, vô hiệu hóa sau = **zero downtime**: không có khoảng trống nào mà crawler thiếu proxy

---

# PHẦN 3: Ý NGHĨA TỪNG TEST CASE

## MODULE 1: CRAWLER CONFIG

### TC_CrawlerConfig_001 — Tạo mới cấu hình luồng crawl thành công
> **Ý nghĩa:** Xác nhận bảng `crawler_config` cho phép tạo mới luồng crawl với đầy đủ 5 trường (crawler_type, platform, country, quota, priority). Đây là **pre-condition bắt buộc** cho mọi flow khác — nếu không có config, cả Token Count Watcher lẫn Queue Checker đều không biết bơm cho ai, bao nhiêu.
>
> **Nếu case này FAIL:** Không thể thêm luồng crawl mới vào hệ thống tự động.

### TC_CrawlerConfig_002 — Cập nhật quota/priority áp dụng không cần restart
> **Ý nghĩa:** Xác nhận tính **hot-reload** của cấu hình — khi Product Support thay đổi quota hoặc priority, hệ thống phải áp dụng ngay từ lần chạy kế tiếp mà KHÔNG cần restart job. Điều này rất quan trọng trong vận hành production: không thể restart job mỗi lần thay đổi config.
>
> **Rủi ro nếu thiếu case này:** Job đọc config cũ từ cache → bơm sai số lượng, phân bổ sai priority.

### TC_CrawlerConfig_003 — Tạo trùng crawler_type đã tồn tại
> **Ý nghĩa:** Kiểm tra **data integrity** — mỗi luồng crawl chỉ có đúng 1 bản ghi config (BR-01). Nếu cho phép tạo trùng, hệ thống sẽ không biết đọc config nào → logic bơm bị sai.
>
> **Kỹ thuật:** Negative testing — verify DB constraint hoạt động.

### TC_CrawlerConfig_004 — Tạo cấu hình thiếu trường bắt buộc
> **Ý nghĩa:** Kiểm tra **schema validation** — đảm bảo không thể tạo config thiếu trường quan trọng (VD: thiếu `quota` thì Watcher không biết bơm bao nhiêu). Ngăn chặn lỗi data ngay từ gốc.
>
> **Kỹ thuật:** Negative testing — verify NOT NULL constraint.

---

## MODULE 2: POOL TỔNG & VÒNG ĐỜI TOKEN

### TC_TokenPool_001 — Import token mới vào Pool Tổng
> **Ý nghĩa:** Xác nhận **entry point** của token vào hệ thống. Khi Product Support mua token mới và import, tất cả phải vào Pool Tổng (crawler_type = NULL, status = Active). Đây là nguồn cung cấp cho Token Count Watcher.
>
> **Nếu case này FAIL:** Token mới không vào Pool → Watcher không có nguồn để bơm.

### TC_TokenPool_002 — Crawler query token đúng filter
> **Ý nghĩa:** Xác nhận crawler chỉ lấy được token **đúng thuộc về mình** (đúng crawler_type + đúng status Active + đúng platform/country). Đây là cơ chế kế thừa từ hệ thống cũ (BR-05) — **crawler KHÔNG cần thay đổi code** sau khi migrate.
>
> **Regression risk:** Nếu query sai, crawler lấy nhầm token của luồng khác → gây conflict.

### TC_TokenPool_003 — Token bị block → status cập nhật
> **Ý nghĩa:** Xác nhận **vòng đời token**: Active → Blocked/Broken. Khi crawler phát hiện token lỗi, status phải được cập nhật → count giảm → Token Count Watcher tự động bơm bù. Đây là cách hệ thống **tự phục hồi** khi token bị platform chặn.

---

## MODULE 3: TOKEN COUNT WATCHER

### TC_Watcher_001 — Bơm đủ lượng thiếu khi Pool đủ (Happy path)
> **Ý nghĩa:** Đây là **happy path quan trọng nhất** — xác nhận logic cốt lõi: count(80) < quota(100) → bơm đúng 20 token → count = 100. Đây chính là giá trị cốt lõi của cả feature: **tự động bơm đúng lượng, đúng luồng**.
>
> **Nếu case này FAIL:** Toàn bộ feature vô nghĩa.

### TC_Watcher_002 — Bơm hết Pool khi Pool không đủ
> **Ý nghĩa:** Xử lý **edge case tài nguyên cạn kiệt** — khi Pool chỉ còn 5 token mà cần 20, hệ thống phải bơm hết 5 (tốt hơn không bơm gì). Đồng thời ghi log thiếu hụt nhưng KHÔNG tự ý gửi Slack (EC-02 sẽ lo việc alert riêng).
>
> **Kỹ thuật:** Boundary + Error handling — verify hệ thống không crash khi thiếu tài nguyên.

### TC_Watcher_003 — Không bơm khi count đã đủ quota
> **Ý nghĩa:** Xác nhận **idempotency** — khi count = quota, hệ thống KHÔNG bơm dư. Nếu bơm dư → chiếm token từ Pool → các luồng khác thiếu. Đây là kiểm tra logic `IF count < quota THEN bơm`, đảm bảo không xảy ra false positive.

### TC_Watcher_004 — Boundary: count = quota - 1, bơm đúng 1 token
> **Ý nghĩa:** **Boundary Value Analysis** — kiểm tra tại ranh giới chính xác. Nếu count = 99 và quota = 100, hệ thống phải bơm đúng 1 token (không phải 0, không phải 2). Lỗi off-by-one là bug phổ biến nhất trong logic so sánh.
>
> **Kỹ thuật:** BVA — giá trị ngay dưới ngưỡng.

### TC_Watcher_005 — Mất kết nối DB → bỏ qua, ghi log, Slack alert
> **Ý nghĩa:** Kiểm tra **fault tolerance** — khi DB down, hệ thống phải:
> 1. KHÔNG crash (graceful degradation)
> 2. Bỏ qua lần chạy đó (không retry vô hạn gây resource leak)
> 3. Ghi log + Slack alert để Product Support biết và xử lý
>
> **Rủi ro nếu thiếu case này:** Job crash → cần restart thủ công → mất thời gian.

### TC_Watcher_006 — Bơm đúng platform/country, không lấy nhầm
> **Ý nghĩa:** Xác nhận **data isolation** — token FB/VN chỉ bơm cho crawler FB/VN, KHÔNG lấy từ pool TT/VN. Nếu lấy nhầm → crawler TT thiếu token → gián đoạn crawl TikTok.
>
> **Kỹ thuật:** Cross-contamination testing — đảm bảo filter `platform`/`country` hoạt động chính xác.

### TC_Watcher_007 — Bơm cho nhiều crawler_type cùng lúc
> **Ý nghĩa:** Xác nhận Watcher xử lý **batch processing** — trong 1 lần chạy phải duyệt qua TẤT CẢ crawler_type, bơm cho tất cả luồng thiếu. Nếu chỉ bơm cho 1 luồng rồi dừng → các luồng khác phải chờ đến lần chạy sau.
>
> **Kỹ thuật:** Multi-entity testing.

### TC_Watcher_008 — Pool Tổng = 0, không có token để bơm
> **Ý nghĩa:** **Edge case cực đoan** — Pool hoàn toàn trống. Hệ thống phải xử lý gracefully: không crash, ghi log, để EC-02 alert. Đây là trường hợp xấu nhất — xác nhận hệ thống không bị treo khi tài nguyên = 0.

### TC_Watcher_009 — Tần suất chạy đúng 1 phút (NFR)
> **Ý nghĩa:** Kiểm tra **Non-functional Requirement** — nếu job trễ > 10s, crawler có thể thiếu token lâu hơn expected. Tần suất 1 phút là cam kết SLA: token sẽ được bù trong vòng 1 phút.

---

## MODULE 4: QUEUE + TOKEN CHECKER

### TC_QueueChecker_001 — Alert khi queue tồn đọng, token đủ (Happy path)
> **Ý nghĩa:** Xác nhận logic AND: `queue tồn đọng` AND `count ≥ quota` → alert. Đây là trường hợp **token đủ nhưng crawl vẫn chậm** → nguyên nhân khác (demand spike, lỗi hệ thống) → cần Product Support can thiệp thủ công.
>
> **Giá trị:** Phát hiện vấn đề mà Token Count Watcher không thể giải quyết.

### TC_QueueChecker_002 — KHÔNG alert khi queue tồn đọng do thiếu token
> **Ý nghĩa:** Xác nhận **logic lọc nhiễu** — nếu queue tồn đọng VÌ thiếu token (count < quota), KHÔNG alert Queue Checker (vì Token Count Watcher sẽ bơm bù). Nếu vẫn alert → Product Support nhận quá nhiều noise → bỏ qua cảnh báo thật sự.
>
> **Kỹ thuật:** False positive prevention.

### TC_QueueChecker_003 — Mất kết nối RabbitMQ
> **Ý nghĩa:** Tương tự TC_Watcher_005 nhưng cho RabbitMQ. Xác nhận **fault tolerance** — job không crash khi RabbitMQ down.

### TC_QueueChecker_004 — crawler_type có queue nhưng thiếu config
> **Ý nghĩa:** Xử lý **orphan entity** — khi có queue trên RabbitMQ cho 1 crawler_type nhưng không có config → hệ thống bỏ qua, ghi log, KHÔNG alert (vì không biết ngưỡng so sánh). Ngăn false alarm từ data không hợp lệ.

### TC_QueueChecker_005 — Tần suất chạy đúng 5 phút (NFR)
> **Ý nghĩa:** Kiểm tra NFR — Queue Checker chạy mỗi 5 phút, không quá thường xuyên (tốn resource) cũng không quá thưa (phát hiện chậm).

---

## MODULE 5: POOL ALERT & MODE SWITCHING

### TC_PoolAlert_001 — Pool xuống ngưỡng Warning 1.5×
> **Ý nghĩa:** Xác nhận **cảnh báo sớm** — khi Pool còn nhiều hơn sum(quota) nhưng dưới 1.5×, hệ thống cảnh báo để Product Support có thời gian mua thêm token TRƯỚC KHI hết. Đồng thời verify KHÔNG kích hoạt Scarcity Mode (vì Pool vẫn > 1.0×).
>
> **Giá trị:** Ngăn chặn tình huống khan hiếm trước khi nó xảy ra.

### TC_PoolAlert_002 — Boundary: Pool = 1500 (= 1.5×) → KHÔNG alert
> **Ý nghĩa:** **BVA tại ngưỡng trên** — Pool đúng bằng 1.5× KHÔNG trigger alert (vì điều kiện là `< 1.5×`, không phải `<=`). Xác nhận toán tử so sánh đúng — sai 1 token có thể gây false alert.

### TC_PoolAlert_003 — Boundary: Pool = 1499 (< 1.5×) → alert
> **Ý nghĩa:** **BVA ngay dưới ngưỡng** — Pool = 1499 (chỉ thiếu 1 token so với ngưỡng an toàn) → PHẢI alert. Đảm bảo hệ thống phản ứng chính xác tại ranh giới.

### TC_PoolAlert_004 — Kích hoạt Scarcity Mode khi Pool < 1.0×
> **Ý nghĩa:** Xác nhận **state transition quan trọng nhất**: Normal/Warning → Scarcity. Khi kích hoạt, toàn bộ logic bơm thay đổi (priority-based). Nếu không kích hoạt đúng → P0 bị thiếu token → crawler quan trọng nhất ngưng.

### TC_PoolAlert_005 — Boundary: Pool = 1000 (= 1.0×) → KHÔNG Scarcity
> **Ý nghĩa:** **BVA tại ngưỡng Scarcity** — đúng bằng 1.0× KHÔNG trigger Scarcity (điều kiện `< 1.0×`). Tránh kích hoạt Scarcity quá sớm.

### TC_PoolAlert_006 — Boundary: Pool = 999 (< 1.0×) → kích hoạt Scarcity
> **Ý nghĩa:** **BVA ngay dưới ngưỡng Scarcity** — thiếu 1 token → PHẢI kích hoạt Scarcity. Cặp case 005 + 006 cùng verify ranh giới chính xác.

---

## MODULE 6: SCARCITY MODE — PRIORITY DISTRIBUTION

### TC_Scarcity_001 — P0 được bơm đến full quota trước
> **Ý nghĩa:** Xác nhận **ưu tiên cao nhất** — P0 (crisis monitoring, luồng quan trọng nhất) luôn được bơm đến full quota trước khi xét đến P1/P2. Đây là nghiệp vụ cốt lõi: dù token khan hiếm, luồng quan trọng nhất không bao giờ bị ảnh hưởng.

### TC_Scarcity_002 — P1 bơm đến tối đa 50% quota
> **Ý nghĩa:** Xác nhận **giới hạn P1** — trong Scarcity, P1 chỉ được bơm đến 50% quota (không phải full). Đây là sự đánh đổi: P1 vẫn hoạt động nhưng ở mức giảm → dành token cho P0.

### TC_Scarcity_003 — P1 KHÔNG bơm khi count ≥ 50% quota
> **Ý nghĩa:** Kiểm tra logic **cap** — nếu P1 đã có 60 token (> 50% của 100), hệ thống KHÔNG bơm thêm (vì đã quá cap) nhưng cũng KHÔNG thu hồi (P1 không bị thu hồi, chỉ P2). Đảm bảo logic không gây hại khi P1 đã đủ.

### TC_Scarcity_004 — P2 KHÔNG bơm, thu hồi token dư về Pool
> **Ý nghĩa:** Xác nhận **biện pháp mạnh nhất** — P2 (luồng ít quan trọng nhất) không chỉ bị ngưng bơm mà còn bị **thu hồi token dư** (> quota) về Pool Tổng. Token thu hồi này dùng để bơm cho P0/P1.
>
> **Giá trị:** Tái phân bổ tài nguyên từ luồng ít quan trọng sang luồng quan trọng.

### TC_Scarcity_005 — Xử lý đúng thứ tự P0 → P1 → P2 trong 1 lần chạy
> **Ý nghĩa:** Xác nhận **ordering** — trong cùng 1 lần chạy, thứ tự phải là: P0 bơm đầy trước → P1 bơm đến 50% → P2 thu hồi. Nếu sai thứ tự (VD: P1 bơm trước P0) → P0 có thể thiếu token do Pool hết.
>
> **Kỹ thuật:** End-to-end flow trong Scarcity Mode.

### TC_Scarcity_006 — Tắt Scarcity khi Pool phục hồi ≥ 1.5×
> **Ý nghĩa:** Xác nhận **state transition ngược**: Scarcity → Normal. Khi Product Support bơm thêm token vào Pool → Pool ≥ 1.5× → tự động trở về Normal Mode → tất cả luồng được bơm bình thường.

### TC_Scarcity_007 — Pool = 1499 (< 1.5×) → vẫn giữ Scarcity (Anti-flapping)
> **Ý nghĩa:** Kiểm tra **hysteresis** — Scarcity BẬT ở 1.0× nhưng TẮT ở 1.5× (cao hơn). Nếu Pool = 1499 (dưới 1.5× nhưng trên 1.0×), Scarcity vẫn active. Ngăn chặn bật/tắt liên tục khi Pool dao động.
>
> **Đây là case cực kỳ quan trọng cho production:** flapping gây rối loạn phân bổ token, ảnh hưởng tất cả crawler.

### TC_Scarcity_008 — P1 count đúng 50% quota (Boundary)
> **Ý nghĩa:** **BVA tại cap 50%** — count = 50 (= 50% của quota 100). Kiểm tra toán tử: `≥ 50%` → KHÔNG bơm. Sai toán tử (`>` thay vì `≥`) sẽ gây bơm dư 1 token.

### TC_Scarcity_009 — P2 count = quota → KHÔNG thu hồi
> **Ý nghĩa:** **BVA cho P2** — nếu P2 giữ đúng quota (50 = 50), không có token dư → KHÔNG thu hồi. Xác nhận logic thu hồi chỉ xảy ra khi count > quota, không thu hồi token hợp lệ.

### TC_Scarcity_010 — P2 count < quota → KHÔNG bơm (dù thiếu)
> **Ý nghĩa:** Xác nhận logic **nghiêm ngặt** — P2 trong Scarcity Mode TUYỆT ĐỐI không được bơm, kể cả khi đang thiếu token. Đây là sự hy sinh cần thiết để bảo vệ P0/P1.

### TC_Scarcity_011 — P0 không đủ Pool để bơm full → bơm hết còn lại
> **Ý nghĩa:** **Worst case scenario** — ngay cả P0 cũng không đủ Pool để bơm full. Hệ thống phải bơm hết phần còn lại (tốt hơn không bơm gì), và P1 sẽ không được bơm do Pool = 0. Đảm bảo P0 luôn được ưu tiên tối đa.

---

## MODULE 7: SLACK ALERTS

### TC_SlackAlert_001 — Alert gửi trong vòng 1 phút (NFR)
> **Ý nghĩa:** Xác nhận **alert latency** — khi phát hiện vấn đề, Slack phải gửi trong vòng 60 giây. Nếu alert chậm → Product Support phản ứng chậm → crawler có thể ngưng lâu hơn.

### TC_SlackAlert_002 — Nội dung pool_alert đúng format
> **Ý nghĩa:** Xác nhận **nội dung cảnh báo** — alert phải chứa đúng thông tin (platform, country) để Product Support biết phải bơm token cho pool nào. Alert thiếu context → Product Support không biết xử lý gì.

### TC_SlackAlert_003 — Nội dung queue_alert đúng format
> **Ý nghĩa:** Xác nhận alert chứa đúng `crawler_type`, `count/quota` để Product Support trace nguyên nhân. Ví dụ: "FB_Crisis có queue tồn đọng nhưng token đủ (100/100)" → biết ngay vấn đề không phải thiếu token.

---

## MODULE 8: PROXY MONTHLY RENEW

### TC_ProxyRenew_001 — Sync thành công vào ngày 20 (Happy path)
> **Ý nghĩa:** **Happy path quan trọng nhất** của F02 — xác nhận toàn bộ flow: gọi API → import proxy mới → vô hiệu hóa proxy cũ → Slack thông báo. Nếu case này PASS, nghĩa là Product Support không cần làm gì mỗi tháng.

### TC_ProxyRenew_002 — API thất bại lần 1, retry lần 2 thành công
> **Ý nghĩa:** Kiểm tra **retry mechanism** — API lỗi lần 1 (timeout, 500) → chờ 5 phút → retry → thành công. Xác nhận lỗi tạm thời (transient error) được xử lý tự động, không cần can thiệp thủ công.
>
> **Quan trọng:** Trong thời gian chờ retry (5 phút), proxy cũ phải vẫn hoạt động.

### TC_ProxyRenew_003 — API thất bại sau 3 lần retry → giữ proxy cũ
> **Ý nghĩa:** Kiểm tra **fail-safe** — sau 3 lần retry thất bại, hệ thống KHÔNG thay đổi proxy trong DB (proxy cũ vẫn Active → crawler vẫn chạy) + gửi Slack để Product Support xử lý thủ công. Đây là **nguyên tắc bảo toàn**: thà dùng proxy cũ còn hơn không có proxy.

### TC_ProxyRenew_004 — Job KHÔNG chạy vào ngày khác (19, 21)
> **Ý nghĩa:** Kiểm tra **cron accuracy** — job chỉ trigger ngày 20, không phải ngày 19 hay 21. Nếu chạy ngày 19 → có thể gọi API khi proxy mới chưa sẵn sàng. Nếu chạy ngày 21 → crawler đã dùng proxy hết hạn 1 ngày.

### TC_ProxyRenew_005 — Verify thứ tự: Import trước → Vô hiệu hóa sau
> **Ý nghĩa:** Xác nhận **zero downtime** — import proxy mới TRƯỚC, rồi mới vô hiệu hóa proxy cũ. Tại mọi thời điểm trong quá trình sync, DB luôn có proxy Active. Nếu làm ngược (xoá cũ trước) → có khoảng thời gian crawler không có proxy.
>
> **Đây là case liên quan đến Open Question 1 (F02):** cần confirm với Dev.

### TC_ProxyRenew_006 — API timeout đúng 10s (NFR)
> **Ý nghĩa:** Kiểm tra **timeout configuration** — API phải timeout sau 10s (không chờ vô hạn). Nếu chờ quá lâu → delay toàn bộ flow → ảnh hưởng timing retry.

### TC_ProxyRenew_007 — Retry interval đúng 5 phút (NFR)
> **Ý nghĩa:** Kiểm tra **retry interval** — mỗi lần retry cách nhau 5 phút (không retry ngay lập tức). Interval 5 phút cho phép API phục hồi sau lỗi tạm thời. Retry quá nhanh → vẫn lỗi + tốn resource.

---

## MODULE 9: DATA INTEGRITY & REGRESSION

### TC_Regression_001 — Luồng crawl hiện tại không bị ảnh hưởng
> **Ý nghĩa:** **Regression test quan trọng nhất** — sau khi deploy tính năng mới (Pool Tổng, Watcher, Checker), crawler phải vẫn query và sử dụng token như cũ (BR-05: crawler không cần thay đổi code). Nếu regression → crawler hiện tại ngưng hoạt động → mất data production.

### TC_Regression_002 — Token Pool migration đúng cấu trúc
> **Ý nghĩa:** Xác nhận **data migration** — sau khi migrate toàn bộ token sang Pool Tổng, không có token nào bị "lạc" (thiếu status, thiếu platform/country). Token lạc = token không ai quản lý = lãng phí tài nguyên.

### TC_DataIntegrity_001 — Tổng số token không thay đổi sau bơm/thu hồi
> **Ý nghĩa:** **Data integrity check quan trọng nhất** — token chỉ **chuyển quyền sở hữu** (đổi crawler_type), KHÔNG bị tạo mới hay xoá trong quá trình bơm/thu hồi. Nếu tổng token thay đổi → có bug gây mất hoặc nhân đôi token.
>
> **Kỹ thuật:** Conservation check — "tổng năng lượng" của hệ thống phải bảo toàn.

### TC_DataIntegrity_002 — crawler_config đầy đủ cho tất cả crawler
> **Ý nghĩa:** **Pre-condition verification** — đảm bảo mọi crawler_type có token đều có config tương ứng. Nếu thiếu config → Token Count Watcher không biết quota → không bơm → crawler thiếu token mà không ai biết.

---

# PHẦN 4: BẢNG TỔNG HỢP — MỤC ĐÍCH CỦA TỪNG NHÓM CASE

| Nhóm | Số TC | Mục đích tổng thể | Rủi ro nếu SKIP |
|------|-------|-------------------|-----------------|
| **Crawler Config** | 4 | Đảm bảo cấu hình luồng crawl đúng, không trùng, hot-reload | Job đọc config sai → bơm sai số lượng/priority |
| **Pool Tổng** | 3 | Đảm bảo token vào/ra Pool đúng, crawler query đúng | Token bị lạc, crawler lấy nhầm token |
| **Token Count Watcher** | 9 | Đảm bảo bơm tự động đúng logic, xử lý lỗi tốt | Crawler thiếu token → mất data |
| **Queue + Token Checker** | 5 | Phát hiện vấn đề hệ thống (không phải thiếu token) | Vấn đề nghiêm trọng bị bỏ sót |
| **Pool Alert & Mode** | 6 | Đảm bảo chuyển mode đúng ngưỡng, alert đúng thời điểm | Scarcity Mode không kích hoạt → P0 thiếu token |
| **Scarcity Mode** | 11 | Đảm bảo phân bổ ưu tiên đúng P0>P1>P2 | Luồng quan trọng bị ảnh hưởng khi token khan hiếm |
| **Slack Alerts** | 3 | Đảm bảo cảnh báo kịp thời, đúng nội dung | Product Support không biết xử lý, phản ứng chậm |
| **Proxy Renew** | 7 | Đảm bảo proxy tự động làm mới, retry đúng, fail-safe | Crawler dùng proxy hết hạn → bị block |
| **Regression & Integrity** | 4 | Đảm bảo hệ thống cũ không bị ảnh hưởng | Mất data production |
| **TỔNG** | **52** | | |
