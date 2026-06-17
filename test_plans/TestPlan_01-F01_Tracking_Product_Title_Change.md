# TEST PLAN
## 01-F01 Product Management - Tracking Product Title Change

| Field | Value |
|---|---|
| Mã tài liệu | TP-01-F01-v1.0 |
| Dự án | YouNet Media - EcomHeat |
| Feature | 01-F01 Product Management - Tracking Title Change |
| Priority | P0 |
| Release | Phase 1 |
| Ngày tạo | 17/06/2026 |
| Người tạo | QA Team (AI-assisted) |
| Phiên bản | 1.0 |
| Trạng thái | Draft - Pending Review |
| Tài liệu tham chiếu | BA Spec: `/Users/tranthanhlam/product-ai-docs/EcomHeat/specs/01-product-tracking-title-change/01-F01-tracking-product-title-change.md` |
| Technical wiki | `Technical Documents - Detect Title Changes` - https://wiki.younetco.com/pages/viewpage.action?pageId=307593962 |
| Technical wiki chi tiết | `Technical Documents - Data Pusher - Detect title change` - https://wiki.younetco.com/pages/viewpage.action?pageId=310444432 |

---

## 1. MỤC TIÊU & TỔNG QUAN (Introduction & Objective)

### 1.1 Bối cảnh

EcomHeat có màn hình Product Management để ECI Data Team mapping Brand/Model/Label/Industry cho Product Item (PI). Vấn đề là seller có thể đổi title của một PI thay vì tạo sản phẩm mới. Ví dụ: cùng một PI hôm trước là Model A, hôm sau đổi title thành Model B.

Nếu hệ thống không phát hiện việc đổi title này, mapping cũ có thể bị sai. Khi đó sold/GMV theo tuần/tháng cũng có thể bị tính sai, kéo theo báo cáo gửi khách hàng sai.

Hiện tại ECI Data Team phải đối soát thủ công bằng Excel/VLOOKUP định kỳ. Cách này tốn thời gian, khó mở rộng và dễ bỏ sót PI đã đổi title.

### 1.2 Giải pháp

Feature này giúp hệ thống tự động phát hiện PI đổi title, sau đó hiển thị cho ECI xử lý trên Product Management:

| Nhóm chức năng | Mô tả |
|---|---|
| Detect title change | Khi có record crawl mới, hệ thống so sánh title mới với title ở record liền trước của cùng PI. Nếu title đổi thật, record mới được đánh dấu `is_change_title = TRUE` và Solr `product_items` được cập nhật `last_title_change_date`. |
| Filter Product Management | User có thể lọc PI theo `Last Title Change Date`. Filter này vẫn kết hợp được với các filter cũ như industry/brand/category. |
| View Details popup | User mở chi tiết một PI để xem sold history, marker ngày có đổi title, tooltip có title, và tab `History Title Changes`. |
| Lưu lịch sử kỹ thuật | Theo Dev wiki, Data Pusher đọc queue `eca.product_item_histories`, dùng Redis `title_hash`, publish event sang `sync_title_changed` hoặc `sync_title_miss`, và lưu title đầy đủ vào ClickHouse `title_history` để audit. |

### 1.3 Mục tiêu kiểm thử

- Kiểm tra hệ thống detect đúng PI đổi title và không báo nhầm khi title chỉ khác chữ hoa/thường hoặc khoảng trắng.
- Kiểm tra dữ liệu đi đúng từ queue -> Data Pusher -> Redis/ClickHouse/Solr -> Product Management UI.
- Kiểm tra filter `Last Title Change Date` trả đúng PI và không làm hỏng các filter cũ.
- Kiểm tra popup `View Details` hiển thị đúng lịch sử đổi title, sold history, tooltip và marker.
- Kiểm tra các SLA chính: list query P95 <= 30 giây, popup history P95 <= 3 giây, trendline P95 <= 15 giây, data freshness <= 15 phút, 50 user nội bộ filter đồng thời.

### 1.4 Assumptions & Need Confirm

| ID | Giả định / Điểm cần xác nhận | Trạng thái | Ảnh hưởng QA |
|---|---|---|---|
| AS-01 | BA spec quy định normalize gồm trim, gộp multi-space và lowercase; Dev wiki v2 mô tả normalize/hash có thêm NFKC, remove emoji, remove zero-width joiner, remove tab/newline và có đoạn "loại bỏ ký tự đặc biệt/loại bỏ khoảng trắng". Cần chốt rule normalize cuối cùng. | Need Confirm | Ảnh hưởng expected result cho các case title khác emoji/ký tự đặc biệt/khoảng trắng giữa từ. |
| AS-02 | BA spec nói record đầu tiên của PI không so sánh và `is_change_title = null`; Dev wiki tổng nói cache miss không có bản ghi `title_history` thì coi là mốc lịch sử đầu tiên. Cần xác nhận mốc đầu tiên có được lưu vào `title_history` nhưng không set `is_change_title` hay không. | Need Confirm | Ảnh hưởng test data cold cache/new product. |
| AS-03 | Dev wiki v2 ghi "chỉ hỗ trợ tracking thay đổi đối với nhóm normal"; BA spec không loại trừ PI zero sold/abnormal. Cần xác nhận PI thuộc nhóm Zero Sold/Abnormal có nằm trong scope detect title change Phase 1 không. | Need Confirm | Ảnh hưởng coverage theo group classification của Data Pusher. |
| AS-04 | BA spec dùng khái niệm `is_change_title = TRUE` trên record crawl và `last_title_change_date` trong Solr; Dev wiki nhấn mạnh ClickHouse `title_history`, queue `sync_title_changed/miss`, Redis `title_hash`. Cần xác nhận mapping dữ liệu cuối cùng giữa Timescale, ClickHouse và Solr. | Need Confirm | Ảnh hưởng cách QA kiểm tra DB và API. |
| AS-05 | Timezone dùng cho "ngày dương lịch" trong filter, grouping history và marker trendline chưa được nêu rõ. Giả định Product Management đang dùng timezone business của EcomHeat/ECI, cần Dev/BA confirm. | Need Confirm | Ảnh hưởng case record nằm sát 00:00 UTC/VN/TH. |
| AS-06 | Product Management là web app desktop-first; mobile app không nằm trong scope. | Need Confirm | Ảnh hưởng compatibility matrix. |

### 1.5 Luồng xử lý Data Pusher - QA cần hiểu

Đây là luồng data chính cần nắm trước khi viết test cases. Nói đơn giản: crawler đẩy PI vào queue, Data Pusher kiểm tra title có hợp lệ không, so sánh title mới với title cũ, rồi lưu/publish event nếu có đổi title.

```text
Crawler/Resolver
  -> queue eca.product_item_histories
  -> Data Pusher consume PI
  -> kiểm tra title và crawled_date
     -> không hợp lệ: ack & skip
     -> hợp lệ: phân loại PI và xử lý tiếp
  -> đọc Redis cache theo product_item_id
     -> cache hit: so sánh title_hash mới với title_hash cũ
        -> giống nhau: không đổi title, không tạo event đổi title
        -> khác nhau: đổi title thật, publish sync_title_changed
     -> cache miss: chưa đủ căn cứ kết luận, publish sync_title_miss để đối chiếu với history
  -> lưu/update dữ liệu:
     -> Redis: lưu title_hash mới
     -> ClickHouse title_history: lưu title đầy đủ để audit
     -> Solr product_items: cập nhật title hiện tại và last_title_change_date
  -> Product Management đọc Solr/History để filter và hiển thị View Details
```

#### Diễn giải theo từng bước

| Bước | Data đi qua đâu? | Data Pusher làm gì? | QA cần kiểm tra gì? |
|---|---|---|---|
| 1 | `eca.product_item_histories` | Consume message PI có `product_item_id`, `title`, `crawled_date`, sold và các field liên quan. | Message test vào đúng queue, Data Pusher consume được, log có trace theo PI. |
| 2 | Data Pusher | Kiểm tra `title` và `crawled_date`. Title null/empty hoặc date lỗi thì bỏ qua. | Case title rỗng/date invalid phải `ack & skip`, không tạo event đổi title. |
| 3 | Data Pusher | Phân loại PI theo data sold: Not Valid, Zero Sold, Abnormal, Normal. Theo Dev wiki v2, title tracking đang nói rõ nhất ở nhóm Normal. | Cần confirm AS-03. Nếu chỉ support Normal, QA không fail khi Zero Sold/Abnormal không tạo title event. |
| 4 | Redis | Tạo `title_hash` từ title sau normalize, rồi đọc cache theo key PI. | Redis key đúng format, có `title_hash`; normalize/hash cho kết quả ổn định. |
| 5A | Cache hit | Nếu hash mới giống hash cũ: title không đổi. | Không publish `sync_title_changed`, không cập nhật `last_title_change_date`. |
| 5B | Cache hit | Nếu hash mới khác hash cũ: title đổi thật. | Publish `sync_title_changed`, lưu history, cập nhật Solr `last_title_change_date`. |
| 5C | Cache miss | Không có cache nên chưa biết chắc title đổi thật hay chỉ thiếu cache. | Publish `sync_title_miss`; consumer/flow sau phải đối chiếu với history để tránh false positive. |
| 6 | ClickHouse `title_history` | Lưu title đầy đủ và `crawled_date` để audit lịch sử đổi title. | Query `title_history` thấy đúng title gốc, đúng PI, đúng thời điểm. |
| 7 | Solr `product_items` | Cập nhật title hiện tại và `last_title_change_date` để Product Management filter. | Filter `Last Title Change Date` trả đúng PI, list hiển thị title mới nhất. |
| 8 | Product Management UI | Hiển thị list và popup detail. | UI hiển thị đúng list, History Title Changes, trendline marker và tooltip. |

#### Bảng quyết định dễ nhớ

| Tình huống | Kết quả mong đợi |
|---|---|
| Title null/empty hoặc `crawled_date` không hợp lệ | Bỏ qua message, không tạo event đổi title. |
| Title mới chỉ khác chữ hoa/thường hoặc khoảng trắng theo rule BA | Không tính là đổi title. |
| Cache hit và `title_hash` không đổi | Không publish event đổi title, không cập nhật `last_title_change_date`. |
| Cache hit và `title_hash` đổi | Tạo event đổi title, lưu history, cập nhật Solr. |
| Cache miss nhưng history cho thấy title không đổi | Không tạo event đổi title thật. |
| Cache miss và history cho thấy title đổi, hoặc là mốc history đầu tiên theo rule Dev | Cần xử lý theo rule đã confirm ở AS-02. |
| Một PI đổi title nhiều lần trong cùng ngày | Backend lưu đủ event; UI History Title Changes chỉ hiển thị 1 dòng/ngày là record muộn nhất. |

---

## 2. PHẠM VI KIỂM THỬ (Scope of Testing)

### 2.1 In-Scope

#### Module 1 - Detect Title Change trong luồng ingest/Data Pusher

| STT | Hạng mục | BR/AC tham chiếu | Nội dung kiểm thử |
|---|---|---|---|
| 1 | Message đầu vào | Dev wiki Data Pusher | Data Pusher đọc đúng message PI từ `eca.product_item_histories`. QA cần có log/bằng chứng cho từng PI test. |
| 2 | Title/date không hợp lệ | Dev wiki Data Pusher | Nếu title null/rỗng hoặc `crawled_date` lỗi/future date thì hệ thống `ack & skip`, không tạo event đổi title. |
| 3 | Normalize title | BR-01, BR-02, BR-03 | Nếu title chỉ khác chữ hoa/thường hoặc khoảng trắng dư theo BA rule thì không tính là đổi title. Rule mở rộng của Dev cần confirm ở AS-01. |
| 4 | So sánh với record liền trước | BR-04 | Hệ thống phải so sánh với record crawl gần nhất trước đó của cùng PI, không áp ngưỡng 90 ngày. |
| 5 | Record đầu tiên của PI | BR-04 | Record đầu tiên không có record trước để so sánh nên `is_change_title = null`. Cần confirm thêm behavior lưu mốc đầu tiên vào `title_history` ở AS-02. |
| 6 | Title đổi thật | BR-04, US-03-AC-02 | Khi title sau normalize khác title liền trước, record hiện tại có `is_change_title = TRUE`, Solr có `last_title_change_date`, filter list tìm thấy PI. |
| 7 | Một ngày đổi nhiều lần | BR-05, BR-08 | Backend lưu từng lần đổi; list hiển thị title mới nhất; tab History Title Changes chỉ hiển thị record muộn nhất của ngày đó. |
| 8 | Cache hit | Dev wiki | Cache hit + hash giống: không tạo event. Cache hit + hash khác: publish `sync_title_changed` và xử lý như title đổi thật. |
| 9 | Cache miss | Dev wiki | Cache miss phải publish `sync_title_miss` để đối chiếu với history, tránh tạo false positive chỉ vì thiếu Redis cache. |
| 10 | ClickHouse history | Dev wiki | Event đổi title phải lưu vào `title_history` với title đầy đủ, `product_item_id`, `crawled_date`; không chỉ lưu hash. |
| 11 | Solr `product_items` | BR-04, BR-07 | Solr phải có title hiện tại và `last_title_change_date` đúng để Product Management filter/list hoạt động. |

#### Module 2 - Product Management List & Filter

| STT | Hạng mục | BR/AC tham chiếu | Nội dung kiểm thử |
|---|---|---|---|
| 1 | Filter `Last Title Change Date` | BR-07, US-01-AC-01 | Chỉ trả về PI có `last_title_change_date` nằm trong `[start_date, end_date]`. |
| 2 | Chọn đúng một ngày | US-01-AC-02 | Cho phép `start_date = end_date` và trả về đúng PI đổi title trong ngày đó. |
| 3 | Kết hợp filter hiện có | BR-06, US-01-AC-03 | Kết quả đồng thời thỏa `Last Title Change Date` và filter cũ như industry/brand/category; logic filter cũ không đổi. |
| 4 | Dải ngày rộng bất kỳ | BR-09, US-01-AC-06 | Không giới hạn độ rộng date range, kể cả từ năm 2023 đến hiện tại. |
| 5 | Empty state | EC-01, US-01-AC-04 | Không có PI trong dải ngày thì list rỗng, giữ filter và hiển thị `empty.title_change_list`. |
| 6 | Error state list | EC-02, US-01-AC-05 | Timeout/lỗi query không hiển thị dữ liệu sai, hiển thị `error.title_change_list`, cho phép retry. |
| 7 | Current title trên list | BR-05 | Khi PI có nhiều lần đổi title, Product Management list hiển thị title mới nhất của PI. |

#### Module 3 - View Details Popup

| STT | Hạng mục | BR/AC tham chiếu | Nội dung kiểm thử |
|---|---|---|---|
| 1 | Popup layout và tab switcher | S5.1, US-02-AC-01 | Popup giữ kích thước hiện tại, dùng Segmented Control, có hai tab `Sold history` và `Title change history`, mặc định chọn History Title Changes. |
| 2 | Tab History Title Changes | BR-08, BR-12, US-02-AC-02 | Hiển thị toàn bộ lịch sử record `is_change_title = TRUE` của PI, không giới hạn bởi date range ở list, không hiển thị record không đổi title. |
| 3 | Gom theo ngày | BR-08 | Nếu một ngày có nhiều event đổi title, UI chỉ hiển thị một dòng là record có thời điểm muộn nhất trong ngày. |
| 4 | Sort và pagination | S5.1, US-02-AC-02 | Sort mới nhất đến cũ nhất, 10 dòng/trang, hỗ trợ next page. |
| 5 | Tab trendline sold history | BR-11, US-02-AC-03 | Hiển thị full sold history và selling price theo rule hiện có, không bị cắt bởi filter list. |
| 6 | Data point theo ngày | BR-11 | Mỗi ngày dùng record crawl có timestamp muộn nhất trong ngày làm đại diện cho Sold/Selling Price. |
| 7 | Tooltip title | BR-11 | Hover điểm trên chart hiển thị sold/selling price hiện có và bổ sung Title của record đại diện. |
| 8 | Marker ngày đổi title | BR-11 | Nếu ngày đó có ít nhất một record `is_change_title = TRUE`, UI vẽ ký hiệu nổi bật phía trên điểm dữ liệu, có label theo `ui.trendline.title_change_marker`. |
| 9 | Error state popup | EC-03, US-02-AC-04 | Lỗi/timeout khi tải title history hiển thị lỗi cục bộ trong popup, có retry, không làm mất list bên ngoài. |

#### Module 4 - Integration, Data Integrity & Observability

| STT | Hạng mục | Nội dung kiểm thử |
|---|---|---|
| 1 | Queue integration | Kiểm tra input queue `eca.product_item_histories`, output queues `app.eci.sync_title_changed`, `app.eci.sync_title_miss`, exchange `app.eci.sync_title_exchange`, routing key `cl.eca.title_changed/title_miss`. |
| 2 | Redis cache | Kiểm tra Redis key `<source>_<product_id>` có `total_sold`, `crawled_date`, `title_hash`; sau khi xử lý thì cache được cập nhật đúng. |
| 3 | ClickHouse `title_history` | Kiểm tra title đầy đủ được insert đúng `product_item_id`, `crawled_date`; không mất history cần audit. |
| 4 | Solr `product_items` | Kiểm tra title hiện tại và `last_title_change_date` đúng để phục vụ list filter. |
| 5 | Timescale history | Kiểm tra record crawl vẫn được lưu để phục vụ sold history và marker trên trendline. |
| 6 | Logging/APM | Có log đủ để trace PI qua Data Pusher, queue changed/miss, DB write và API Product Management. |

### 2.2 Out-of-Scope

| Hạng mục | Lý do |
|---|---|
| Tracking thay đổi thuộc tính khác ngoài Title | BA spec ghi rõ Phase 1 chỉ tracking đổi Title. |
| Tự động quyết định Brand/Model/Label/Industry mới sau khi title đổi | Feature chỉ phát hiện và hỗ trợ ECI đối soát; re-map là nghiệp vụ xử lý sau. |
| Notification/alert tự động cho ECI khi title đổi | BA đã loại khỏi scope Phase 1. |
| Thay đổi logic auth/permission Product Management | Unauthorized được xử lý bởi platform auth, ngoài scope 01-F01. Chỉ smoke test user có/không có quyền nếu cần regression. |
| Thay đổi behavior crawler khi PI inactive/hidden và nguồn crawl không trả dữ liệu | BR-10 mô tả behavior nền ingest/crawl và không có AC cover trong scope 01-F01. |
| Quyết định kỹ thuật DB/query design | BA spec ghi ngoài scope; QA chỉ kiểm tra behavior và integration theo implementation đã được Dev cung cấp. |
| Mobile app native iOS/Android | Không có requirement mobile app cho Product Management. AS-06 cần confirm. |
| Backfill toàn bộ lịch sử trước ngày release | Requirement không nêu rõ data backfill. Nếu team yêu cầu historical backfill thì cần plan riêng. |

---

## 3. CHIẾN LƯỢC KIỂM THỬ (Test Strategy & Approach)

### 3.1 Functional Testing - Trọng tâm chính

| Nhóm test | Kỹ thuật áp dụng | Nội dung |
|---|---|---|
| Title normalization | Decision Table | Tạo bảng các cặp title: giống hoàn toàn, chỉ khác hoa/thường, chỉ khác khoảng trắng, đổi nội dung thật. Expected phải rõ: đổi hay không đổi. |
| Detect title change | State Transition | Test chuỗi record theo thời gian của cùng PI: record đầu tiên, record không đổi, record đổi thật, đổi nhiều lần, record cách nhau rất xa ngày. |
| Cache hit/miss | Branch Coverage | Test đủ 3 nhánh dễ lỗi nhất: cache hit/hash giống, cache hit/hash khác, cache miss cần đối chiếu history. |
| Date range filter | Boundary Value Analysis | Test `start_date = end_date`, inclusive start/end, range rất rộng, không có dữ liệu, record sát ranh giới ngày/timezone. |
| Existing filters combination | Regression + Pairwise | Test `Last Title Change Date` kết hợp industry, brand, category. Đồng thời kiểm tra filter cũ vẫn đúng khi không chọn filter mới. |
| View Details history | Data-driven Testing | Test PI có nhiều ngày đổi title và nhiều event trong cùng ngày để kiểm tra sort, pagination, gom một dòng/ngày. |
| Trendline behavior | UI Functional Testing | Test điểm chart lấy record cuối ngày, marker ngày có đổi title, tooltip hiển thị đúng title của record đại diện. |
| Error handling | Negative Testing | Simulate timeout/lỗi list API, detail API, queue/Redis/ClickHouse/Solr nếu staging cho phép. Expected: không hiển thị dữ liệu sai và có retry khi cần. |

#### Mapping User Stories sang nhóm test

| User Story | AC chính | Estimated Test Cases | Priority |
|---|---:|---:|---|
| US-01 - Lọc danh sách PI đổi Title theo dải ngày | 6 AC | 12-16 cases | P0 |
| US-02 - View Details: trendline sold history và title history | 4 AC | 14-18 cases | P0 |
| US-03 - Ghi nhận sự kiện đổi Title theo normalize rule | 2 AC | 12-16 cases | P0 |
| Edge Cases EC-01 to EC-03 | 3 EC | 4-6 cases | P0/P1 |
| Integration Data Pusher/Redis/Queue/ClickHouse/Solr | Dev wiki | 12-18 cases | P0 |
| Regression existing Product Management | Existing behavior | 8-12 cases | P1 |
| Tổng ước tính |  | 62-86 test cases |  |

### 3.2 UI/UX Testing

| Component | Nội dung kiểm thử |
|---|---|
| Last Title Change Date picker | Chọn date range tự do, cho phép chọn cùng một ngày, chặn `start_date > end_date` ngay tại UI, giữ filter sau empty/error state. |
| Product list | Loading state `loading.title_change_list`, empty state, error state, retry, current title hiển thị đúng. |
| View Details popup | Popup không resize bất thường khi đổi tab, Segmented Control đúng label, mặc định mở History Title Changes. |
| History Title Changes table | Header/column layout rõ ràng, sort mới đến cũ, pagination 10 dòng/trang, no data/error state cục bộ. |
| Trendline sold history | Marker không che tooltip/data point, hover hiển thị Title đủ đọc, chart không bị cắt khi có full history dài. |
| Message localization | Kiểm tra các message key EN/VN theo S5.2 nếu hệ thống hỗ trợ multi-language. |

### 3.3 API/Integration Testing

| Điểm tích hợp | Cách kiểm thử | Bằng chứng cần thu thập |
|---|---|---|
| Product Management API - list | Gọi API với `last_title_change_date` range và filter cũ; đối chiếu Solr query/result. | Request/response, query log, screenshot list. |
| Product Management API - details | Gọi API title history/trendline; đối chiếu ClickHouse/Timescale source. | Request/response, bằng chứng query DB. |
| Data Pusher input | Publish/consume message từ `eca.product_item_histories` với test PI. | Queue message, consumer log. |
| Redis cache | Seed cache hoặc xóa cache để tạo cache hit/miss. | Redis key trước/sau xử lý. |
| Queue changed/miss | Kiểm tra message route đúng queue khi title đổi hoặc cache miss. | RabbitMQ queue depth/message sample/log. |
| ClickHouse `title_history` | Query title history theo `product_item_id`, kiểm tra title đầy đủ và `crawled_date`. | DB result. |
| Solr `product_items` | Query `last_title_change_date`, title hiện tại và các filter fields. | Solr result. |
| Timescale history | Query record crawl theo PI/ngày để kiểm tra trendline, marker và record cuối ngày. | DB result. |

### 3.4 Data Migration/Data Sync

| Hạng mục | Cách kiểm tra |
|---|---|
| Schema rollout | Kiểm tra field `last_title_change_date` tồn tại trong Solr `product_items`; `title_history` đã tạo trong ClickHouse; Redis schema có `title_hash`. |
| Existing PI trước release | Với PI đã có lịch sử crawl trước release, kiểm tra behavior khi record mới đến: dùng record liền kề/nguồn history đúng, không tạo event sai do thiếu cache. |
| Cache warm/cold | Test cache đã có hash, cache hết TTL/missing, cache mới tạo sau khi xử lý. |
| Duplicate/retry message | Kiểm tra retry hoặc duplicate message không tạo duplicate history hiển thị sai trên UI. |
| Data freshness | Đo thời gian từ khi record crawl vào queue đến khi PI filter/view detail thấy được event, phải <= 15 phút. |

### 3.5 Non-functional Testing

| NFR | Tiêu chí đánh giá | Cách kiểm tra |
|---|---|---|
| Response Time - List Query | P95 thời gian trả danh sách PI đổi Title <= 30 giây với dải ngày bất kỳ. | APM/backend log, test các range nhỏ/rộng và filter industry lớn. |
| Response Time - View Details | P95 mở popup và tải History Title Changes trang đầu 10 dòng <= 3 giây; trendline full history <= 15 giây. | Frontend timing, API timing log. |
| Data Freshness | Dữ liệu đổi title phản ánh record crawl mới nhất trong tối đa 15 phút sau khi record vào hệ thống. | Đối chiếu timestamp ingest, queue consume, DB write, Solr available. |
| Concurrent Users | Tối thiểu 50 user nội bộ chạy filter đồng thời vẫn giữ các SLA P95. | k6/JMeter hoặc tool nội bộ trên staging với workload thực tế. |
| Reliability | Lỗi ở title history popup không làm mất list bên ngoài; lỗi query không hiển thị dữ liệu sai. | Negative test bằng mock timeout/error. |
| Observability | Có log trace được PI qua queue/cache/DB/Solr/API. | Kiểm tra structured logs/APM. |

### 3.6 Compatibility & Regression Testing

| Nhóm | Nội dung |
|---|---|
| Browser compatibility | Chrome latest, Edge latest, Firefox latest; Safari nếu Product Management đang support. |
| Existing filters | Industry/brand/category và các filter Product Management hiện có không đổi logic khi không dùng `Last Title Change Date`. |
| Existing Product list | Sorting, pagination, search, view details entry point vẫn hoạt động như trước. |
| Existing sold history | Trendline sold/selling price giữ rule hiện tại, chỉ bổ sung title tooltip và marker. |
| Aggregate data | Smoke test `product_item_weekly/monthly` dashboard/report không bị ảnh hưởng bởi thay đổi detect title. |

---

## 4. MÔI TRƯỜNG KIỂM THỬ (Test Environment)

### 4.1 Môi trường

| Môi trường | Mục đích | Ghi chú |
|---|---|---|
| Staging | Test chính: functional, integration, UI/UX, regression và NFR cơ bản. | Cần data setup có quyền ghi/đọc Redis, queues, DB, Solr. |
| UAT | BA/ECI Data Team review behavior và kiểm tra nghiệp vụ trước release. | Dùng bộ test data đại diện, hạn chế thao tác phá dữ liệu. |
| Production | Post-release monitoring, không test phá dữ liệu trực tiếp. | Monitor logs, queue lag, Solr update và feedback từ ECI. |

### 4.2 Hạ tầng & Dependency

| Component | Yêu cầu |
|---|---|
| EcomHeat Product Management FE | Build có filter `Last Title Change Date` và popup `View Details` mới. |
| Product Management Backend/API | Endpoint list/detail đã deploy lên Staging, kết nối Solr/ClickHouse/Timescale. |
| Data Pusher | Consumer xử lý title change đã deploy, có log theo PI. |
| RabbitMQ | Queue input `eca.product_item_histories`, output `app.eci.sync_title_changed`, `app.eci.sync_title_miss`, exchange/routing key theo Dev wiki. |
| Redis | Có thể seed/xóa key test, schema key `<source>_<product_id>` có `title_hash`. |
| ClickHouse | Bảng `title_history` sẵn sàng để query/kiểm tra. |
| TimescaleDB | Có dữ liệu crawl history theo PI, sold, selling price, title, `crawled_date`. |
| Solr | Collection `product_items` có title hiện tại, `last_title_change_date` và các field filter hiện có. |
| APM/Logging | QA có quyền xem backend logs, Data Pusher logs, query timing và queue lag. |

### 4.3 Nền tảng/Thiết bị

| Nền tảng | Chi tiết |
|---|---|
| Web desktop | Chrome latest là browser chính; Edge/Firefox regression; Safari nếu nằm trong support matrix. |
| Mobile web | Out-of-scope chính thức, chỉ smoke responsive nếu Product Management hiện có yêu cầu hỗ trợ. |
| DB/Tooling | DBeaver/CLI query DB, Redis CLI/UI, RabbitMQ Management UI, Solr Admin hoặc API client, Postman/cURL, k6/JMeter nếu chạy NFR. |

### 4.4 Test Data tối thiểu cần chuẩn bị

| Nhóm data | Mục đích |
|---|---|
| PI không đổi title | Kiểm tra không tạo event khi title giống sau normalize. |
| PI chỉ khác case/space | Kiểm tra BR-02/BR-03. |
| PI đổi title thật | Kiểm tra `is_change_title`, `last_title_change_date`, list filter, title history. |
| PI đổi nhiều lần trong một ngày | Kiểm tra backend lưu nhiều event nhưng UI history chỉ hiển thị record muộn nhất trong ngày. |
| PI đổi nhiều ngày khác nhau | Kiểm tra sort desc, pagination, marker theo nhiều ngày. |
| PI có full sold history dài | Kiểm tra trendline load time, record cuối ngày, tooltip title. |
| PI cache hit | Kiểm tra path `sync_title_changed`. |
| PI cache miss | Kiểm tra path `sync_title_miss` và logic đối chiếu history. |
| PI sát ranh giới ngày/timezone | Kiểm tra inclusive date range và grouping theo ngày dương lịch. |
| Dataset lớn theo industry/brand/category | Kiểm tra performance list query và concurrent users. |

---

## 5. TIÊU CHÍ ĐÁNH GIÁ (Entry & Exit Criteria)

### 5.1 Entry Criteria - Điều kiện để QA bắt đầu test

| # | Tiêu chí | Bắt buộc |
|---|---|---|
| 1 | BA spec 01-F01 đã Approved/Ready for Dev và không còn open question blocking scope. | Bắt buộc |
| 2 | Dev technical design đã chốt ít nhất các phần: normalize rule, cache miss behavior, schema `title_history`, Solr field `last_title_change_date`, API contract list/detail. | Bắt buộc |
| 3 | Code FE/BE/Data Pusher đã merge/deploy lên Staging và pass unit test/smoke test của Dev. | Bắt buộc |
| 4 | Schema Solr/ClickHouse/Redis/queue đã được deploy/config trên Staging. | Bắt buộc |
| 5 | QA có quyền truy cập Product Management, logs, RabbitMQ, Redis, Solr, ClickHouse và Timescale để thu thập bằng chứng kiểm thử. | Bắt buộc |
| 6 | Test data đã được seed hoặc có script/setup rõ ràng cho các nhóm data tối thiểu ở mục 4.4. | Bắt buộc |
| 7 | Các dependency service như Data Pusher, Redis, RabbitMQ, Solr, ClickHouse, Timescale hoạt động ổn định trên Staging. | Bắt buộc |
| 8 | BA/Dev đã confirm các assumption AS-01 đến AS-05, hoặc có quyết định tạm thời để QA viết expected result. | Bắt buộc cho case liên quan |
| 9 | NFR tooling đã sẵn sàng nếu cần chạy performance/concurrent test. | Khuyến khích |

### 5.2 Exit Criteria - Điều kiện để QA cho phép release

| # | Tiêu chí | Bắt buộc |
|---|---|---|
| 1 | 100% test cases P0/P1 đã được executed với trạng thái Passed/Failed/Blocked có lý do rõ ràng. | Bắt buộc |
| 2 | 0 bug Critical còn mở. | Bắt buộc |
| 3 | 0 bug High còn mở; tất cả bug High đã fix và re-test Passed. | Bắt buộc |
| 4 | Core flow pass end-to-end: record crawl đổi title -> detect -> lưu history -> cập nhật Solr -> filter list -> View Details hiển thị đúng. | Bắt buộc |
| 5 | Filter `Last Title Change Date` pass các case chính: single day, range rộng, combine filter cũ, empty/error state. | Bắt buộc |
| 6 | View Details pass các case chính: history all events, gom một dòng/ngày, pagination, trendline full history, marker và tooltip. | Bắt buộc |
| 7 | NFR chính đạt SLA hoặc có approval exception từ PM/Tech Lead: list query <= 30 giây P95, history <= 3 giây P95, trendline <= 15 giây P95, freshness <= 15 phút. | Bắt buộc |
| 8 | Regression Product Management không phát hiện lỗi nghiêm trọng ở list/filter/view details/sold history hiện có. | Bắt buộc |
| 9 | Bug Medium/Low còn mở đã được PM/BA/Tech Lead đánh giá và chấp nhận release. | Khuyến khích |
| 10 | Test Summary Report đã được gửi cho PM/BA/Dev Lead và có recommendation release rõ ràng. | Bắt buộc |

---

## 6. RỦI RO & HƯỚNG GIẢI QUYẾT (Risks & Mitigations)

| ID | Risk | Mức độ | Xác suất | Mitigation |
|---|---|---|---|---|
| R1 | Rule normalize giữa BA và Dev chưa khớp: BA chỉ nói trim/multi-space/lowercase, Dev wiki có NFKC, remove emoji, remove whitespace/tab/newline và hash FarmHash. | Cao | Cao | Chốt rule bằng decision table trước khi QA finalize test cases. Tách test case "BA-confirmed" và "Dev-extended" nếu chưa chốt. Không sign-off nếu expected result còn mơ hồ. |
| R2 | Behavior record đầu tiên/cold cache có thể tạo false positive: BA nói record đầu tiên `is_change_title = null`, Dev wiki nói cache miss không có history thì coi là mốc lịch sử đầu tiên. | Cao | Trung bình | Confirm rõ difference giữa "lưu mốc lịch sử đầu tiên" và "đánh dấu đổi title". Chuẩn bị data mới hoàn toàn, cache miss có history giống/khác để kiểm tra. |
| R3 | Dev wiki v2 chỉ hỗ trợ nhóm Normal, trong khi BA không loại trừ Zero Sold/Abnormal. | Cao | Trung bình | BA/Dev cần xác nhận scope group classification. Nếu Zero Sold/Abnormal out-of-scope, ghi rõ trong test plan/test cases và release note; nếu in-scope, bổ sung fix/coverage trước sign-off. |
| R4 | Timezone/range boundary sai làm filter hoặc gom lịch sử theo ngày lệch, đặc biệt record gần 00:00 UTC và dữ liệu VN/TH. | Cao | Trung bình | Chốt timezone business; tạo test data sát ranh giới ngày; kiểm tra cả Solr query, UI grouping và chart marker. |
| R5 | Query range rộng không giới hạn có thể chậm hoặc timeout, ảnh hưởng NFR list query <= 30 giây. | Cao | Trung bình | Test dataset lớn theo industry/brand/category; monitor Solr query time; nếu không đạt, yêu cầu Dev tối ưu index/query hoặc có paging/async strategy trước release. |
| R6 | Full sold history/trendline của PI nhiều năm có thể vượt SLA 15 giây hoặc làm UI lag. | Trung bình | Trung bình | Chuẩn bị PI có lịch sử dài; đo API + render time; yêu cầu lazy loading/aggregation nếu vượt SLA. |
| R7 | Async pipeline Redis -> Queue -> ClickHouse -> Solr có thể gây data freshness > 15 phút hoặc list/detail không đồng bộ tạm thời. | Cao | Trung bình | Đo timestamp từng chặng, monitor queue lag, có alert/log cho failed batch. Test retry/duplicate để đảm bảo eventual consistency đúng. |
| R8 | UI History Title Changes chỉ hiển thị một dòng/ngày nhưng backend vẫn lưu nhiều event; QA/user có thể hiểu nhầm là mất dữ liệu. | Trung bình | Trung bình | Kiểm tra DB lưu đủ event, UI gom đúng record muộn nhất. Ghi rõ expected behavior trong test cases và training note cho ECI nếu cần. |
| R9 | Error handling không cục bộ: lỗi tab history có thể làm đóng popup hoặc refresh list, gây mất context làm việc của ECI. | Trung bình | Thấp | Negative test timeout/error cho từng API trong popup; yêu cầu lỗi hiển thị trong phạm vi tab và giữ trạng thái list ngoài popup. |
| R10 | Thiếu quyền hoặc thiếu tooling trên Staging khiến QA không kiểm tra được queue/cache/DB, chỉ test UI black-box. | Trung bình | Trung bình | Confirm quyền truy cập trước Entry Criteria; nếu không có quyền DB trực tiếp, yêu cầu Dev cung cấp log/bằng chứng query hoặc endpoint debug tạm thời trên Staging. |

---

## 7. TÀI LIỆU BÀN GIAO (Deliverables)

| # | Tài liệu | Mô tả | Thời điểm bàn giao | Người nhận |
|---|---|---|---|---|
| 1 | Test Plan | Tài liệu kế hoạch kiểm thử tổng thể: scope, strategy, environment, criteria, risks. | Trước khi bắt đầu test chính | PM, BA, Dev Lead, QA Team |
| 2 | Test Cases | Chi tiết test scenarios/test steps/test data/expected result, bao gồm functional, integration, UI, regression và NFR. | Sau khi BA/Dev confirm assumptions | PM, BA, Dev, QA |
| 3 | Test Data Checklist | Danh sách PI/test data cần seed: không đổi title, đổi thật, nhiều lần trong ngày, cache hit/miss, full history dài, timezone boundary. | Trước execution | QA, Dev |
| 4 | Bug Reports | Jira tickets cho từng bug, có steps to reproduce, expected/actual, severity, bằng chứng UI/log/DB. | Trong quá trình test | Dev Team, PM |
| 5 | Daily Test Execution Update | Trạng thái executed/pass/fail/blocked, bug mới, blocker, rủi ro môi trường. | Hằng ngày trong test window | PM, Dev Lead, BA |
| 6 | Bằng chứng Performance/NFR | Kết quả đo P95 list query, popup history, trendline, data freshness và concurrent users nếu chạy. | Trước sign-off | PM, Tech Lead |
| 7 | Test Summary Report | Tổng kết test execution, bug summary, unresolved risks, recommendation release/no-release. | Sau khi hoàn thành test | PM, BA, Dev Lead, Stakeholders |

---

## Appendix A - Checklist QA trọng tâm

| Nhóm | Checklist |
|---|---|
| Detect | Không mark đổi title với case/space-only; mark đúng khi title đổi thật; không áp ngưỡng 90 ngày; record đầu tiên đúng rule. |
| Persistence | `is_change_title`, `last_title_change_date`, `title_history`, Redis `title_hash` và Solr current title đồng bộ theo expected behavior. |
| List | Filter date inclusive, single-day, wide range, combine filters, empty/error/retry. |
| Detail | History all events, gom một dòng/ngày, sort desc, 10 rows/page, trendline full history, tooltip title, marker ngày đổi. |
| NFR | List <= 30s P95, history <= 3s P95, trendline <= 15s P95, freshness <= 15 phút, 50 concurrent users. |
| Regression | Product Management filter/list/detail/sold history hiện có không bị thay đổi ngoài phần feature mới. |
