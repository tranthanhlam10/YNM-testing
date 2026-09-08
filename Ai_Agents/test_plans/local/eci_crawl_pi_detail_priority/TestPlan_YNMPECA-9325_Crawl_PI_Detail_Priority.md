# TEST PLAN
## YNMPECA-9325 — Crawl PI Detail ưu tiên theo Shop Priority

| Thuộc tính | Nội dung |
| --- | --- |
| Mã tài liệu | TP-YNMPECA-9325-v1.2 |
| Dự án | YouNet Media — ECI |
| Loại thay đổi | Backend/Data — Shopee Product Item Batch Crawling Loader |
| Jira | [YNMPECA-9325](https://jira.younetco.com/browse/YNMPECA-9325) — `[DATA CRAWLER] CRAWL PI DETAIL ƯU TIÊN THEO SHOP PRIORITY` |
| Business requirement | [ECI — Data: Crawl PI detail — Priority](https://wiki.younetco.com/pages/viewpage.action?pageId=321585336) |
| Technical design | [ECI — Shopee Product Item Batch Crawling Loader](https://wiki.younetco.com/pages/viewpage.action?pageId=329646989) |
| Phạm vi sản phẩm | ECI Việt Nam và ECI Thái Lan — Shopee |
| Loại kiểm thử | Backend/Data Crawler, Integration, Data Consistency, Performance/Reliability |
| Phạm vi test case | 88 case được lưu để truy vết: **87 case thuộc release scope của loader** và **1 case downstream optional (`N/A`)** |
| Ngày lập | 24/08/2026 |
| Trạng thái | Draft — Đã căn chỉnh scope loader, Pending BA/Dev/QC Review |

> Tài liệu đã được đối chiếu với Jira, comment trên Jira và hai trang Wiki qua phiên đăng nhập ngày 24/08/2026. Business Wiki và Technical Wiki đang có một số khác biệt về lịch của Thái Lan, ngày đầu tháng kế tiếp, định nghĩa Vùng 3 và cơ chế xử lý Vùng 1/Vùng 2 khi bị block. Test Plan giữ nguyên các nguồn rule, đánh dấu `Need Confirm` và không tự chọn một cách hiểu làm Acceptance Criteria.

> **Ranh giới release scope:** Task YNMPECA-9325 chỉ sửa **Shopee Product Item Batch Crawling Loader**. QA kiểm tra từ lúc loader tạo Solr query đến khi RabbitMQ xác nhận nhận message và loader cập nhật Redis/DB cursor. Logic xử lý bên trong downstream consumer/crawler và việc gọi Shopee API không thuộc release scope; chỉ có một smoke case optional để tham khảo khi team downstream yêu cầu regression.

## 1. MỤC TIÊU & TỔNG QUAN (Introduction & Objective)

### 1.1. Bối cảnh nghiệp vụ

Luồng crawl theo Shop của Shopee có thể chỉ trả số `sold` dạng làm tròn đối với Product Item (PI) có `latest_sold >= 1000` (ví dụ: 1k, 2k, 3k). Vì vậy, hệ thống cần dùng luồng crawl PI detail để lấy lại số sold chính xác.

Hiện tại, luồng `Crawl_PI_Detail` chưa ưu tiên PI theo nhóm Shop/PI quan trọng. Điều này có thể khiến dữ liệu cần thiết cho khách hàng hoặc PI Mall/Official không được làm mới đúng thời điểm nghiệp vụ.

### 1.2. Mục tiêu tính năng

Xây dựng cơ chế tự động lựa chọn vùng dữ liệu cần crawl theo lịch cho **Shopee Product Item Batch Crawling Loader** tại ECI Việt Nam và ECI Thái Lan:

- Ở giai đoạn ưu tiên, tập trung load PI Mall/Official hoặc PI có `industry_id`.
- Ở giai đoạn thường, load PI Non-Mall/Non-Official và chưa có `industry_id`.
- Duy trì các điều kiện chung như thời điểm được phép crawl, trạng thái PI, ngưỡng sold, thời gian crawl gần nhất, số lần thất bại và danh sách shop loại trừ.
- Đảm bảo loader lấy đúng dữ liệu từ Solr, chia batch/chunk, publish đúng RabbitMQ queue của từng quốc gia và cập nhật state nhất quán mà không trùng/sót trong phạm vi loader.

### 1.3. Giải thích nghiệp vụ bằng ngôn ngữ đơn giản

Loader không crawl trực tiếp toàn bộ sản phẩm cùng lúc. Mỗi chu kỳ, loader dùng điều kiện Solr để chọn ra một nhóm PI đang cần làm mới, chia thành các message nhỏ rồi publish vào RabbitMQ. Test của task này kết thúc tại ranh giới RabbitMQ nhận message và loader lưu state; không đánh giá logic xử lý nội bộ của crawler detail.

Thay đổi của task này nằm ở bước **chọn PI nào trước**:

- Trong khung thời gian ưu tiên, hệ thống tập trung vào nhóm PI quan trọng.
- Trong thời gian còn lại, hệ thống xử lý nhóm PI thường.
- Các điều kiện an toàn hiện hữu vẫn phải được giữ, ví dụ PI đang active, có link, đủ ngưỡng sold, chưa retry quá giới hạn và không thuộc shop bị loại trừ.

Nếu chọn sai vùng, hệ thống vẫn có thể chạy và không báo lỗi kỹ thuật nhưng dữ liệu kinh doanh sẽ được cập nhật sai thứ tự. Vì vậy QA phải kiểm tra **ID cụ thể được chọn/loại**, không chỉ nhìn job success hoặc queue có message.

### 1.4. Thuật ngữ QA cần hiểu

| Thuật ngữ | Giải thích | QA dùng để kiểm tra gì? |
| --- | --- | --- |
| Product Item / PI | Một sản phẩm cụ thể trên Shopee. | Đối soát từng PI từ Solr đến message queue; phát hiện thiếu/trùng/cross-domain. |
| `latest_sold` | Số sold mới nhất đang lưu trên PI. | Xác nhận chỉ chọn PI từ ngưỡng 1000; test biên 999/1000/1001. |
| Vùng 1 | Theo BA Wiki: PI Mall hoặc PI thuộc industry đang có khách. | Kiểm tra nhóm ưu tiên cao và hành vi khi luồng bị block; mapping “industry có khách” cần Dev bàn giao. |
| Vùng 2 | Theo BA Wiki: PI thuộc các industry còn lại. | Kiểm tra thứ tự sau Vùng 1 nếu cơ chế block được triển khai. |
| Vùng 3 | Nhóm PI thường. BA và technical design đang khác nhau ở toán tử OR/AND. | Chỉ chốt expected sau NC/A-07; test đủ tổ hợp `official` và `industry_id`. |
| Ngày ưu tiên | Ngày loader áp filter Vùng 1+2 hoặc logic ưu tiên đã được chốt. | Test lịch tuần, cuối tháng, chuyển ngày và timezone. |
| Ngày thường | Ngày loader áp filter Vùng 3. | Chứng minh PI vùng ưu tiên không bị lấy nhầm và ngược lại. |
| Fetch batch | Số record tối đa đọc từ Solr trong một lần, hiện là 100. | Test 99/100/101+ và cursor qua nhiều batch. |
| Chunk | Nhóm PI được đóng trong một RabbitMQ message, tối đa 5 PI. | Test 4/5/6; không message nào vượt giới hạn Shopee. |
| Cursor | Vị trí loader đã xử lý, lưu trong DB. | Test resume sau restart, không mất hoặc lặp dữ liệu ngoài contract. |
| Redis Sorted Set | Bộ nhớ đệm các message/record đang được crawl với expiry. | Test cleanup record hết hạn và tránh load lặp trong cycle. |
| Back-pressure | Cơ chế không tiếp tục bơm message khi queue đã gần/đạt ngưỡng. | Test tại queue depth 999/1000/1001 và concurrent loader. |
| Feature flag | Cấu hình bật/tắt loader hoặc bật/tắt tự chọn vùng. | Test rollback và backward compatibility mà không cần rollback code. |

### 1.5. Rule chính thức và cách QA diễn giải

#### 1.5.1. Rule chọn dữ liệu chung theo Technical Wiki

| Rule ID | Rule từ tài liệu | Cách QA kiểm tra |
| --- | --- | --- |
| FR-01 | PI phải đến hạn: `next_crawl_time <= NOW`. | Test trước, đúng và sau `NOW`; capture query thực tế để kiểm tra inclusive boundary. |
| FR-02 | Đúng nguồn Shopee của domain. | VN dùng `shopee.vn`; source chính thức của TH cần Dev bàn giao. Không PI domain khác được enqueue. |
| FR-03 | PI có `link`, `is_crawling_active=1`, `product_status=1`. | Mỗi predicate có một negative record độc lập; job không được lấy record thiếu link/inactive. |
| FR-04 | `crawled_date` nằm trong 30 ngày gần nhất. | Test ngay trước/đúng/sau mốc 30 ngày và timezone dùng cho `NOW-30DAYS`. |
| FR-05 | `latest_sold >= 1000`. | Test 999 không lấy; 1000 và 1001 được lấy nếu thỏa các điều kiện khác. |
| FR-06 | Loại PI có `count_failed >= 5`. | Test 4 được lấy; 5 không được lấy. |
| FR-07 | Loại các shop đặc biệt theo từng domain. | VN loại 2 shop; TH loại 1 shop như cấu hình. Test không cross-use danh sách. |
| FR-08 | Khi auto-select bật, thêm filter vùng theo thời gian. | Dùng clock cố định, capture query và đối soát tập ID expected. |
| FR-09 | Khi auto-select tắt, bỏ toàn bộ điều kiện phân vùng. | So sánh với baseline query cũ sau khi A-05 được xác nhận. |

#### 1.5.2. Rule batch/queue theo Technical Wiki

| Rule ID | Rule từ tài liệu | Cách QA kiểm tra |
| --- | --- | --- |
| OR-01 | Mỗi lần fetch tối đa 100 PI. | Seed 99/100/101+ PI, theo dõi query count và cursor. |
| OR-02 | Mỗi message tối đa 5 PI ID do giới hạn Shopee. | Đếm PI trong từng payload; test 0/1/4/5/6 và 99/100 records. |
| OR-03 | Queue VN là `eca_shopee_product_item_unify_crawling`. | Assert destination queue và domain trong payload/correlation metadata. |
| OR-04 | Queue TH là `th_eca_shopee_product_item_unify_crawling`. | Assert không message TH nào sang queue VN và ngược lại. |
| OR-05 | Queue threshold hiện là 1000 messages. | Test 999/1000/1001, bao gồm trường hợp nhiều loader chạy đồng thời. |
| OR-06 | Record Redis hết hạn được xóa khi bắt đầu cycle. | Snapshot Sorted Set trước/sau cycle; record chưa hết hạn không bị xóa nhầm. |
| OR-07 | Cursor giúp loader tiếp tục từ vị trí đã xử lý. | Restart tại boundary batch/publish; đối soát hợp PI trước và sau restart. |

### 1.6. Tóm tắt luồng kỹ thuật

`Shopee Product Item Batch Crawling Loader` thực hiện luồng:

`Solr query theo domain + lịch/vùng ưu tiên → fetch tối đa 100 PI → chia chunk tối đa 5 PI/message → kiểm soát Redis/cursor → publish RabbitMQ queue VN hoặc TH`

Release scope kết thúc sau khi RabbitMQ trả publisher confirm theo contract và loader cập nhật state tương ứng. Bước `crawler detail xử lý → gọi Shopee API → cập nhật dữ liệu downstream` không thuộc task này.

Các cấu hình chính theo technical wiki:

| Nhóm | Cấu hình/giá trị hiện tại |
| --- | --- |
| Bật/tắt loader | `PRODUCT_ITEM_BATCH_CRAWLING_LOADER_ENABLE=true` |
| Bật tự chọn vùng | `PRODUCT_ITEM_BATCH_CRAWLING_LOADER_METADATA_ENABLE_AUTO_SELECT_PRIORITY=1` |
| Fetch batch | `PRODUCT_ITEM_BATCH_CRAWLING_LOADER_DATA_LOAD_BATCH_SIZE=100` |
| Queue chunk | `PRODUCT_ITEM_BATCH_CRAWLING_LOADER_CHUNK_SIZE=5` |
| Queue threshold | `PRODUCT_ITEM_BATCH_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=1000` |
| Lịch tuần theo technical wiki | `PRODUCT_ITEM_BATCH_CRAWLING_LOADER_METADATA_WEEKLY_PRIORITY_RULE=0,4,5,6` |
| Số ngày ưu tiên cuối tháng | `PRODUCT_ITEM_BATCH_CRAWLING_LOADER_METADATA_MONTH_END_PRIORITY_DAYS=3` |
| Cursor | DB `ynm_crawling_loaders.crawling_loaders`, record `SHOPEE_PRODUCT_ITEM_BATCH_CRAWLING_LOADER` |
| Redis | DB 1, Sorted Set; score = timestamp hiện tại + expiry |
| Queue VN | `eca_shopee_product_item_unify_crawling` |
| Queue TH | `th_eca_shopee_product_item_unify_crawling` |

### 1.7. Giả định và điểm cần xác nhận trước khi test

| ID | Giả định/điểm chưa thống nhất | Tác động | Chủ thể xác nhận |
| --- | --- | --- | --- |
| A-01 | **[Giả định - Assumption] (Need Confirm):** Technical wiki cấu hình cả VN và TH là `0,4,5,6` (Thứ Năm–Chủ Nhật), trong khi BA wiki quy định TH chỉ ưu tiên **Thứ Sáu–Thứ Bảy**. QA chưa coi lịch nào là expected result cho TH. | Block xác nhận kết quả test lịch tuần TH và release nếu chưa chốt. | BA + Dev |
| A-02 | **[Giả định - Assumption] (Need Confirm):** BA wiki/Jira comment nêu giai đoạn cuối tháng kéo dài từ 3 ngày cuối tháng **đến hết ngày đầu tháng kế**, trong khi technical wiki/config chỉ mô tả **3 ngày cuối tháng**. Cần xác nhận ngày 01 tháng kế tiếp thuộc vùng ưu tiên hay vùng thường. | Ảnh hưởng boundary test tại 00:00 ngày 01 và tính đúng dữ liệu cuối kỳ. | BA + Dev |
| A-03 | **[Giả định - Assumption] (Need Confirm):** BA chia Vùng 1 (Mall hoặc industry đang có khách) và Vùng 2 (industry còn lại), đồng thời yêu cầu khi bị block ưu tiên Vùng 1 rồi mới Vùng 2. Technical design hiện gộp Vùng 1+2 thành `(official:1 OR industry_id:[* TO *])` và không mô tả cơ chế phát hiện/xử lý block. | Chưa thể xác nhận thứ tự Vùng 1 → Vùng 2 khi bị block; có nguy cơ không đúng business priority. | BA + Dev |
| A-04 | **[Giả định - Assumption] (Need Confirm):** Lịch chạy được đánh giá theo timezone của từng domain (VN: `Asia/Ho_Chi_Minh`; TH: `Asia/Bangkok`) hay theo timezone của pod/server. | Ảnh hưởng test chuyển ngày, cuối tháng và thời điểm deploy. | Dev/DevOps |
| A-05 | **[Giả định - Assumption] (Need Confirm):** Khi `...ENABLE_AUTO_SELECT_PRIORITY=0`, “điều kiện thông thường” là query hiện hữu trước thay đổi và không thêm filter vùng; các filter chung trong `EXTRA_FILTER` vẫn được áp dụng. | Cần baseline query/log để đối chiếu backward compatibility. | Dev |
| A-06 | **[Giả định - Assumption] (Need Confirm):** Staging có dữ liệu/fixture độc lập cho VN và TH, cho phép điều khiển system time hoặc trigger loader tại thời điểm giả lập mà không phải chờ ngày thực tế. | Nếu không có, test boundary lịch sẽ kéo dài hoặc thiếu độ tin cậy. | Dev/DevOps |
| A-07 | **[Giả định - Assumption] (Need Confirm):** BA Wiki mô tả Vùng 3 bằng `PI Non-Mall OR PI không thuộc industry`, nhưng Technical Wiki dùng `(official:0 AND -industry_id:[* TO *])`. Đây là hai tập dữ liệu khác nhau; QA chưa coi OR hay AND là expected chính thức. | Có thể làm một phần lớn PI bị lấy thừa hoặc bỏ sót trong ngày thường. | BA + Dev |
| A-08 | **[Giả định - Assumption] (Need Confirm):** Payload schema, natural key/correlation ID, publisher confirm, retry policy và delivery semantic tại ranh giới loader → RabbitMQ chưa được mô tả đầy đủ trong hai Wiki. Logic idempotency của downstream consumer không thuộc scope task. | Blocking tiêu chí duplicate/retry và contract assertion của loader ở mức field. | Dev |
| A-09 | **[Giả định - Assumption] (Need Confirm):** Chưa có rule cho `official=null`, `industry_id=null`, field sai kiểu hoặc PI có dữ liệu legacy không đầy đủ. | Quyết định record được xếp Vùng 3, bị skip hay được xử lý theo fallback. | BA + Dev |

## 2. PHẠM VI KIỂM THỬ (Scope of Testing)

### 2.1. In-Scope

1. **Cơ chế chọn vùng tự động theo lịch**
   - Nhận diện đúng ngày ưu tiên và ngày thường theo rule đã được BA/Dev chốt cho từng quốc gia.
   - Ưu tiên cuối tháng và boundary chuyển tháng, bao gồm tháng 28/29/30/31 ngày.
   - Kiểm tra thứ tự ưu tiên khi điều kiện lịch tuần và lịch cuối tháng giao nhau.
   - Kiểm tra trạng thái bật/tắt của `PRODUCT_ITEM_BATCH_CRAWLING_LOADER_METADATA_ENABLE_AUTO_SELECT_PRIORITY`.

2. **Solr query/filter của Shopee PI**
   - Vùng ưu tiên: `(official:1 OR industry_id:[* TO *])` theo technical design hiện tại.
   - Vùng thường: `(official:0 AND -industry_id:[* TO *])`.
   - Các filter chung: `next_crawl_time <= NOW`, đúng `source_id`, có `link`, `is_crawling_active=1`, `product_status=1`, `crawled_date` trong 30 ngày gần nhất, `latest_sold >= 1000`, `count_failed < 5` và shop exclusion theo từng domain.
   - Boundary tại `latest_sold=999/1000/1001`, `crawled_date` ngay trước/đúng/sau mốc 30 ngày và `count_failed=4/5`.

3. **Phân tách dữ liệu theo quốc gia/domain**
   - VN dùng `source_id=shopee.vn`, loại `shopee!469064007`, `shopee!1506174776` và đẩy queue VN.
   - TH dùng source/filter thực tế của TH, loại `shopee!1449018616` và đẩy queue TH.
   - Không cross-domain, không đẩy nhầm queue hoặc dùng nhầm shop exclusion.

4. **Batch, chunk và RabbitMQ**
   - Mỗi lần fetch tối đa 100 PI.
   - Mỗi message tối đa 5 PI ID; kiểm tra các tập dữ liệu 0, 1, 4, 5, 6, 99, 100 và lớn hơn 100 records.
   - Loader dừng/throttle đúng khi queue đạt ngưỡng cấu hình 1000 messages và tiếp tục đúng khi có capacity.
   - Payload do loader tạo đúng producer contract; không duplicate/missing PI trong một chu kỳ.
   - Queue VN/TH đúng tên; RabbitMQ xác nhận publish và queue được cấu hình đúng Dead Letter Exchange/routing key. Không bắt buộc chạy downstream consumer để tạo message lỗi.

5. **Cursor, Redis cache và khả năng phục hồi**
   - Cursor được lưu/cập nhật đúng sau khi xử lý và dùng để tiếp tục từ vị trí phù hợp.
   - Restart/crash/redeploy không làm bỏ sót hoặc phát sinh duplicate ngoài cơ chế retry cho phép.
   - Redis Sorted Set loại record hết hạn khi bắt đầu cycle; key theo đúng domain convention.
   - Hành vi khi Solr/RabbitMQ/Redis/DB tạm thời unavailable hoặc timeout.

6. **Regression có chọn lọc**
   - Loader bật/tắt đúng bằng feature flag chính.
   - Khi auto-select priority tắt, luồng cũ vẫn load theo điều kiện thông thường đã được xác nhận.
   - Producer contract tại ranh giới RabbitMQ giữ tương thích với schema đã được Dev xác nhận.
   - Smoke downstream, nếu team liên quan yêu cầu, được đánh dấu optional và không dùng làm release gate của YNMPECA-9325.

### 2.2. Out-of-Scope

| Hạng mục | Lý do |
| --- | --- |
| Các platform ngoài Shopee | Acceptance Criteria chỉ yêu cầu apply trước cho Shopee; các platform khác là định hướng tương lai. |
| UI/UX, Web browser, Mobile iOS/Android | Tính năng là backend data loader, không có giao diện người dùng trong requirement. |
| Logic xử lý nội bộ của downstream consumer/crawler sau khi nhận RabbitMQ message | Dev scope chỉ sửa loader. Smoke downstream chỉ chạy khi team liên quan yêu cầu và không block release YNMPECA-9325. |
| Việc downstream gọi Shopee API và độ chính xác dữ liệu API trả về | Thuộc consumer/hệ thống bên thứ ba; loader không trực tiếp thực hiện hoặc xác nhận request này. |
| Migration/phân loại lại toàn bộ dữ liệu lịch sử | Giải pháp chủ đích dùng Solr filter theo thời gian, không yêu cầu migration. |
| Logic cập nhật Shop Mall/Official và mapping industry/customer | Là nguồn dữ liệu đầu vào của filter; chỉ kiểm tra loader đọc/áp dụng field đúng, không kiểm thử quy trình tạo các field này. |
| Benchmark toàn hệ thống ECI hoặc soak test dài ngày trên Production | Không có yêu cầu tải/SLA cụ thể; chỉ thực hiện performance/reliability có trọng tâm cho loader và queue. |
| Validate mọi cấu hình deployment sai | Technical wiki xác định code hiện chưa validate `MONTH_END_PRIORITY_DAYS`; QA kiểm tra cấu hình hợp lệ và cảnh báo deployment, không tự coi mọi input sai là requirement chức năng. |

## 3. CHIẾN LƯỢC KIỂM THỬ (Test Strategy & Approach)

### 3.1. Functional Testing

Áp dụng **risk-based testing**, **equivalence partitioning**, **boundary value analysis** và **decision table**.

#### Ma trận quyết định vùng cần load

Expected result cuối cùng của các ô có liên quan A-01/A-02 chỉ được chốt sau khi BA/Dev confirm.

| Feature flag auto-select | Thời điểm | Expected filter vùng |
| --- | --- | --- |
| `1` | Ngày ưu tiên theo rule của domain | `(official:1 OR industry_id:[* TO *])` |
| `1` | Ngày thường, không thuộc cửa sổ cuối tháng | `(official:0 AND -industry_id:[* TO *])` |
| `1` | N ngày cuối tháng | Vùng ưu tiên |
| `1` | Ngày 01 tháng kế tiếp | **Need Confirm A-02** |
| `0` | Mọi thời điểm | Không thêm filter vùng; dùng query thông thường **Need Confirm A-05** |

#### Nhóm scenario chính

- Happy path cho VN và TH tại ngày ưu tiên/ngày thường.
- Boundary chuyển ngày: 23:59:59 → 00:00:00 trước và sau ngày ưu tiên.
- Boundary tháng: tháng 28/29/30/31 ngày; năm nhuận; 3 ngày cuối tháng; ngày 01 tháng kế.
- Giao nhau giữa rule tuần và rule cuối tháng: rule cuối tháng không được vô tình chuyển sang vùng thường.
- PI thỏa đồng thời `official=1` và có `industry_id` chỉ xuất hiện một lần.
- Bao phủ tổ hợp `official` = 0/1/null và `industry_id` = có/không có.
- Từng filter chung có ít nhất một record positive và một record negative để chứng minh query không lấy thừa.
- Feature flag loader chính `true/false`; feature flag auto-select `1/0`.
- Empty result, result nhỏ hơn batch, đúng batch và nhiều batch.
- Nếu A-03 được xác nhận có triển khai: mô phỏng block, xác nhận Vùng 1 được xử lý trước và Vùng 2 chỉ được load sau điều kiện chuyển tiếp đã chốt.

#### 3.1.1. Test oracle — nguồn kết luận Actual đúng hay sai

Thứ tự ưu tiên của test oracle:

1. Acceptance Criteria hoặc decision table đã được BA/Dev approve bằng văn bản.
2. Solr query chính thức trong Technical Wiki, sau khi các conflict A-01/A-02/A-03/A-07 được giải quyết.
3. Golden dataset có danh sách PI ID expected cho từng domain, ngày chạy và trạng thái feature flag.
4. Invariant kỹ thuật: không cross-domain, không message quá 5 PI, không mất PI qua nhiều batch, cursor/Redis nhất quán và queue không vượt ngưỡng ngoài contract.
5. Baseline của loader cũ khi auto-select tắt.

Không dùng output của code mới làm expected cho chính code mới. Nếu rule business chưa được chốt, case liên quan phải ghi `Blocked — Need Confirm`, không tự đánh Pass theo implementation.

#### 3.1.2. Decision table theo `official` và `industry_id`

Bảng dưới phản ánh **Technical Wiki hiện tại**, không giải quyết thay conflict A-07:

| Case | `official` | `industry_id` | Query vùng ưu tiên `(official:1 OR có industry)` | Query vùng thường `(official:0 AND không industry)` | Lưu ý |
| --- | ---: | --- | ---: | ---: | --- |
| DT-01 | 1 | Có | Chọn | Không chọn | Chỉ xuất hiện một lần dù thỏa cả hai nhánh OR. |
| DT-02 | 1 | Không | Chọn | Không chọn | PI Official/Mall. |
| DT-03 | 0 | Có | Chọn | Không chọn | Thuộc Vùng 1 hoặc Vùng 2 tùy mapping industry có khách. |
| DT-04 | 0 | Không | Không chọn | Chọn | Vùng thường theo technical query. |
| DT-05 | null | Có | Chọn | Không chọn | Được chọn bởi nhánh có `industry_id`; cần kiểm tra Solr null semantics. |
| DT-06 | null | Không | Không chọn | Không chọn | Expected business **Need Confirm A-09**; có nguy cơ bị bỏ khỏi cả hai nhóm. |

Sau khi A-07 được chốt, cập nhật bảng này để chứng minh hai vùng tạo thành tập hợp đúng theo business, không overlap ngoài ý muốn và không tạo “khoảng trống” dữ liệu.

#### 3.1.3. Decision table theo lịch và feature flag

| Case | Loader enable | Auto-select | Ngày tuần | Thuộc N ngày cuối tháng | Kỳ vọng |
| --- | ---: | ---: | --- | ---: | --- |
| SC-01 | false | Bất kỳ | Bất kỳ | Bất kỳ | Loader không query/publish dữ liệu. |
| SC-02 | true | false | Bất kỳ | Bất kỳ | Dùng baseline query thông thường, không thêm filter vùng — chờ A-05. |
| SC-03 | true | true | Ngày ưu tiên | Không | Chọn vùng ưu tiên. |
| SC-04 | true | true | Ngày thường | Không | Chọn vùng thường. |
| SC-05 | true | true | Ngày thường | Có | Chọn vùng ưu tiên do rule cuối tháng. |
| SC-06 | true | true | Ngày ưu tiên | Có | Chọn vùng ưu tiên; không publish trùng do hai rule cùng đúng. |
| SC-07 | true | true | Ngày 01 tháng kế | Không còn thuộc N ngày cuối tháng | **Need Confirm A-02**. |
| SC-08 | true | true | Thứ Năm/Chủ Nhật tại TH | Không | **Need Confirm A-01** vì BA và technical schedule khác nhau. |

#### 3.1.4. Expected count cho batch/chunk

Khi không có record bị Redis dedupe, queue còn capacity và tất cả PI đều hợp lệ:

```text
expected_fetched_PI = min(số PI đủ điều kiện còn lại từ cursor, 100)
expected_messages = ceil(expected_fetched_PI / 5)
mọi message có 1..5 PI; không tạo empty message
hợp PI ID trong message = tập PI ID được fetch của cycle
```

| PI được fetch | Message expected | Kích thước chunk expected |
| ---: | ---: | --- |
| 0 | 0 | Không có message |
| 1 | 1 | 1 |
| 4 | 1 | 4 |
| 5 | 1 | 5 |
| 6 | 2 | 5 + 1 |
| 99 | 20 | 19 × 5 + 1 × 4 |
| 100 | 20 | 20 × 5 |
| 101+ | Cycle đầu tối đa 20 | Phần còn lại xử lý ở cycle/batch sau theo cursor |

Nếu implementation intentionally tạo message theo rule khác, Dev phải cập nhật Technical Wiki và cung cấp expected chính thức trước execution.

#### 3.1.5. Cách test thực tế từng bước

**Bước 1 — Freeze test basis**

- Ghi nhận version Jira/Wiki, build/commit/image tag và toàn bộ biến môi trường liên quan.
- Chốt timezone/domain clock và decision table sau khi giải quyết các `Need Confirm` blocking.
- Không thay config trong khi một test run đang thực thi.

**Bước 2 — Chuẩn bị Golden Dataset**

- Mỗi PI chỉ khác một predicate ở các negative case để xác định chính xác filter gây loại.
- Lập manifest gồm: PI ID, domain, shop, `official`, `industry_id`, `latest_sold`, `crawled_date`, `count_failed`, `next_crawl_time`, trạng thái/link và expected selected/skipped.
- Dùng namespace/data test không bị crawler khác update trong lúc chạy.

**Bước 3 — Ghi baseline trước chạy**

- Snapshot Solr documents của Golden Dataset.
- Ghi queue depth và danh sách message liên quan trước test.
- Ghi Redis key/members/expiry và DB cursor trước cycle.
- Ghi thời gian giả lập, timezone, feature flags và config schedule.

**Bước 4 — Trigger loader có kiểm soát**

- Chạy một domain/lịch/case group tại một thời điểm để dễ truy vết.
- Lưu run ID/correlation ID, start/end time và pod instance.
- Với case queue threshold/restart, chỉ inject trạng thái sau khi baseline functional pass.

**Bước 5 — Capture query và selection**

- Lấy full Solr filter/query thực tế từ log/trace hoặc instrumentation được Dev cung cấp.
- Đối chiếu từng predicate, parentheses của `OR/AND/NOT`, source/domain và shop exclusion.
- So sánh tập `Expected only`, `Actual only`, `Intersection`; không chỉ compare count.

**Bước 6 — Đối soát chunk và RabbitMQ**

- Đếm message, số PI/message, duplicate PI trong/cross message và destination queue.
- So schema/payload fields với producer contract sau khi A-08 được chốt.
- Xác nhận RabbitMQ trả publisher confirm, queue/routing key/DLX đúng cấu hình và không message nào vượt 5 PI IDs.
- Không bắt buộc chạy downstream consumer; `TC_QUEUE_009` chỉ là optional regression và mặc định `N/A`.

**Bước 7 — Đối soát Redis và cursor**

- Kiểm tra expired member được cleanup, active member không bị xóa nhầm.
- Đối chiếu cursor trước/sau với PI cuối đã xử lý theo contract.
- Chạy cycle kế tiếp để chứng minh không mất hoặc lặp lại toàn batch.

**Bước 8 — Rerun, restart và negative integration**

- Rerun cùng data/time/config.
- Restart pod ở trước/sau publish và trước/sau update cursor.
- Mô phỏng timeout ngắn của Solr/Redis/RabbitMQ/DB; kiểm tra retry, log, DLQ và trạng thái phục hồi.

**Bước 9 — Regression và rollback**

- Tắt auto-select, chạy dataset baseline và compare với luồng cũ.
- Tắt loader, xác nhận không có query/publish mới.
- Bật lại theo rollout plan và theo dõi ít nhất một cycle hoàn chỉnh cho VN và TH.

#### 3.1.6. Evidence tối thiểu cho một test case

Một test case chỉ được đánh Pass/Fail khi có đủ evidence phù hợp:

- Build/commit/image tag và config đã che secret.
- Domain, timezone, thời gian test, feature flag và rule schedule được áp dụng.
- Golden Dataset/PI manifest và tập ID expected.
- Solr query thực tế cùng danh sách ID actual.
- RabbitMQ queue, message count, payload/chunk size, publisher confirm và cấu hình routing/DLX; không yêu cầu consumer result.
- Redis key/member/expiry và cursor before/after nếu case liên quan.
- Application log có run/correlation ID, lý do skip/fail và duration.
- Diff Expected-only/Actual-only/Intersection; bug phải đính kèm evidence này nếu sai dữ liệu.

### 3.2. API/Integration Testing

Tính năng không cung cấp public API; integration test tập trung vào các interface nội bộ:

- **Loader ↔ Solr:** xác nhận query thực tế qua application log/trace và tập dữ liệu seed có expected result xác định trước.
- **Loader ↔ RabbitMQ:** xác nhận queue, số message, số PI/message, payload schema, domain, publisher confirm và cấu hình DLX/routing key.
- **Loader ↔ Redis:** xác nhận key, Sorted Set, expiry cleanup và chống load lặp trong chu kỳ.
- **Loader ↔ DB cursor:** xác nhận read/write cursor, resume sau restart và isolation giữa VN/TH.

Integration với downstream crawler không thuộc release scope. Nếu cần kiểm tra tương thích liên team, QA có thể chạy `TC_QUEUE_009` như optional regression; kết quả không ảnh hưởng release decision của loader.

Không chỉ dựa vào số lượng message; QA đối soát theo tập PI ID nguồn để phát hiện mất dữ liệu, trùng dữ liệu hoặc sai vùng.

### 3.3. Data Sync / Data Consistency Testing

Không có data migration. Thực hiện kiểm thử tính nhất quán dữ liệu xuyên suốt Solr → loader → Redis/cursor → RabbitMQ:

- Tập PI đủ điều kiện phải được enqueue đúng một lần trong phạm vi một cycle bình thường.
- PI không đủ điều kiện không được enqueue.
- Tổng PI trong các message phải bằng tập expected sau filter, có xét batch/cursor.
- Sau restart, hợp của dữ liệu trước và sau restart không bị thiếu; duplicate nếu có phải nằm trong chính sách delivery/retry được Dev xác nhận.
- Dữ liệu VN và TH không trộn lẫn.

**[Giả định - Assumption] (Need Confirm):** Loader dùng delivery semantic nào tại ranh giới RabbitMQ (`at-least-once`, `at-most-once`) và retry/publisher-confirm được thực hiện ra sao. QA dùng thông tin này để xác định duplicate do loader sau retry là bug hay expected behavior; không kiểm tra idempotency bên trong downstream consumer.

### 3.4. Non-functional Testing

#### Performance & Capacity

- Đo thời gian xử lý một cycle với 100 PI và nhiều cycle liên tiếp; ghi nhận throughput thực tế làm baseline.
- Kiểm tra chunk size luôn ≤ 5 và loader không làm queue vượt `MAX_MSG_IN_QUEUE=1000` do race condition.
- Theo dõi CPU, memory, Solr latency, tốc độ publish RabbitMQ và queue depth khi backlog gần ngưỡng.
- Xác nhận cơ chế back-pressure/throttle không gây busy loop hoặc tăng log bất thường.

**[Giả định - Assumption] (Need Confirm):** Requirement chưa cung cấp SLA/throughput mục tiêu. Trước performance sign-off, Dev/BA cần chốt ngưỡng chấp nhận hoặc đồng ý dùng production baseline hiện tại và tiêu chí “không regression đáng kể”.

#### Reliability / Recoverability

- Mô phỏng timeout/mất kết nối ngắn với Solr, Redis, RabbitMQ và DB cursor.
- Restart pod tại các điểm trước/sau khi publish message và trước/sau khi cập nhật cursor.
- Xác nhận có retry/log/alert phù hợp, không silent data loss và không làm hỏng cursor.

#### Security & Compatibility

- Không thực hiện security penetration test riêng vì không có endpoint/UI mới và requirement không thay đổi auth/authz.
- Kiểm tra tối thiểu rằng log không in credential/secret/config nhạy cảm và deployment sử dụng secret/config mechanism hiện hành.
- Browser/device compatibility không áp dụng. Compatibility tập trung vào schema Solr, Redis và producer payload/queue configuration của RabbitMQ.

### 3.5. Ưu tiên kiểm thử

| Mức | Nhóm kiểm thử |
| --- | --- |
| P0 | Chọn đúng vùng theo lịch; đúng quốc gia/queue; không mất hoặc cross-domain data; chunk ≤ 5; feature flag rollback. |
| P1 | Boundary cuối tháng/ngày 01; mọi filter chung; cursor/restart; queue threshold; Redis expiry; producer payload và queue configuration. |
| P2 | Fault injection, baseline performance, invalid deployment config, log/monitoring và DLQ. |

## 4. MÔI TRƯỜNG KIỂM THỬ (Test Environment)

### 4.1. Môi trường

| Môi trường | Mục đích | Yêu cầu |
| --- | --- | --- |
| Local/Dev Integration | Kiểm tra nhanh unit/component và query builder | Có mock/fixture cho clock, Solr, Redis, RabbitMQ và DB cursor. |
| Staging/Testing | Thực thi functional, integration, data consistency, fault/restart và performance baseline | Deployment `shopee-ynm-cl-eca-crawling-loader-service-testing`; cấu hình gần Production; data/queue VN và TH tách biệt. |
| UAT | BA xác nhận lịch/vùng và sample PI nghiệp vụ | Chỉ cần nếu quy trình dự án yêu cầu; không dùng dữ liệu khách hàng nhạy cảm ngoài quyền cho phép. |
| Production | Post-deploy smoke và monitoring có kiểm soát | Không seed dữ liệu giả; dùng canary/feature flag, kiểm tra log/metric/queue và rollback khi bất thường. |

### 4.2. Thành phần và quyền truy cập cần thiết

- Solr collection/index của ECI VN và ECI TH.
- RabbitMQ management/metrics và quyền đọc queue VN/TH/DLQ trong môi trường test.
- Redis DB 1 và quyền kiểm tra key/TTL/Sorted Set trong môi trường test.
- DB `ynm_crawling_loaders`, table `crawling_loaders` và record cursor của loader.
- Application log, distributed trace/monitoring, pod log và quyền restart deployment ở Staging.
- Công cụ mock clock hoặc cấu hình trigger theo thời gian để test ngày trong tuần/cuối tháng.
- Không yêu cầu browser, iOS hoặc Android do đây là backend service.

### 4.3. Test data tối thiểu

Chuẩn bị riêng cho mỗi domain một bộ dữ liệu có ID truy vết được, bao phủ:

- Mall/Official; Non-Mall/Non-Official; có/không có `industry_id`.
- `latest_sold`: 999, 1000, 1001.
- `crawled_date`: trong 30 ngày, đúng boundary 30 ngày, quá 30 ngày.
- `count_failed`: 0, 4, 5.
- `next_crawl_time`: quá khứ, đúng `NOW`, tương lai.
- `link`: có/null; `is_crawling_active`: 0/1; `product_status`: active/inactive.
- Các shop bị exclude và shop bình thường.
- Tổng số records: 0, 1, 4, 5, 6, 99, 100, 101+.

## 5. TIÊU CHÍ ĐÁNH GIÁ (Entry & Exit Criteria)

### 5.1. Entry Criteria

QA bắt đầu execution chính thức khi:

- Jira/BA requirement và technical design đã được cập nhật; A-01, A-02, A-03, A-04, A-05, A-07, A-08 và A-09 đã có kết luận bằng văn bản cho các test tương ứng.
- Code complete, peer review/merge hoàn tất; unit test và component test của Dev pass.
- Build đã deploy thành công lên Staging; version/commit/config được ghi nhận.
- Solr, Redis, RabbitMQ, DB cursor và monitoring hoạt động ổn định trên Staging. Downstream consumer không phải dependency bắt buộc để bắt đầu test loader.
- Có test data cho cả VN/TH và có cách điều khiển clock/trigger để test lịch.
- QA có quyền xem query/log, queue message, Redis key và cursor cần thiết.
- Có baseline luồng cũ khi auto-select tắt và rollback plan bằng feature flag.
- Known issues/dependencies được Dev bàn giao; không có blocker môi trường.

Nếu chỉ còn A-06 hoặc SLA performance chưa chốt, QA có thể bắt đầu các test không phụ thuộc nhưng chưa được sign-off phần tương ứng.

### 5.2. Exit Criteria

Cho phép release khi:

- 100% test case P0 và P1 đã execute; 100% P0 pass.
- Trong 88 case được lưu để truy vết, 87 case loader-scope được tính vào execution/release gate; `TC_QUEUE_009` mặc định `N/A` và không tính vào pass rate.
- Tỷ lệ pass tổng thể ≥ 95%; các case fail còn lại phải là bug P2/P3 đã được PO/BA/Engineering chấp nhận rủi ro bằng văn bản và có kế hoạch xử lý.
- Không còn bug Critical/Blocker/High mở; không còn bug gây sai vùng, mất dữ liệu, cross-domain, vượt 5 IDs/message, sai queue hoặc hỏng cursor.
- Functional, integration, data consistency và regression trọng yếu đều pass cho cả VN và TH.
- Kết quả kiểm tra restart/retry chứng minh không silent data loss; duplicate nằm trong delivery semantic đã chốt.
- Queue depth/back-pressure hoạt động đúng; performance không regression vượt ngưỡng/SLA đã thống nhất.
- Các config Production đã được review chéo, đặc biệt lịch tuần, timezone, `MONTH_END_PRIORITY_DAYS`, shop exclusion và queue name.
- Test Summary Report, danh sách known issues, monitoring plan và rollback plan được stakeholders chấp thuận.
- Production smoke sau deploy xác nhận đúng version/config, loader khỏe, message đi đúng queue và metric/log không có bất thường.

## 6. RỦI RO & HƯỚNG GIẢI QUYẾT (Risks & Mitigations)

| ID | Rủi ro | Mức độ | Hướng giải quyết |
| --- | --- | --- | --- |
| R-01 | BA và technical design không thống nhất lịch TH, ngày 01 đầu tháng, Vùng 1/2 và phép OR/AND của Vùng 3. | Critical | Chốt decision table bằng văn bản trước sign-off; cập nhật cả Jira và wiki; tạo automated tests từ rule đã duyệt. |
| R-02 | Sai timezone hoặc boundary tháng làm crawl nhầm vùng vào thời điểm chuyển ngày/tháng. | High | Dùng clock injection; test 23:59:59/00:00:00, tháng 28/29/30/31 ngày và timezone VN/TH; log rõ evaluated time, timezone và rule được chọn. |
| R-03 | Solr filter `OR/AND/NOT` sai precedence khiến lấy thừa/thiếu PI. | Critical | Test từng predicate và tổ hợp; capture query thực tế; đối soát ID expected với ID enqueue; review query escaping/parentheses. |
| R-04 | Cursor cập nhật không atomic với publish RabbitMQ gây mất hoặc trùng PI sau crash/restart. | Critical | Fault injection tại các điểm publish/update cursor; xác nhận publisher confirm và delivery semantic của loader; đối soát PI ID trước/sau restart. Không phụ thuộc logic idempotency downstream. |
| R-05 | Chunk > 5 vi phạm producer contract hoặc batch/chunk sai làm thiếu message. | High | Automated boundary test 4/5/6 và 99/100/101+; assert producer payload trước khi publish; alert khi payload vượt giới hạn. |
| R-06 | Cấu hình `MONTH_END_PRIORITY_DAYS` không được code validate; deploy giá trị 0/âm/quá số ngày tháng gây hành vi sai. | High | Configuration checklist + peer review + admission/pre-deploy validation; khóa allowlist giá trị hợp lệ, khuyến nghị `3`; smoke log sau deploy. |
| R-07 | Dùng nhầm filter/shop exclusion/queue giữa VN và TH gây cross-domain data. | Critical | Tách test data và namespace; assertion domain trong payload; test negative; dashboard/alert theo source-to-queue mapping. |
| R-08 | Queue gần 1000 messages nhưng race condition khiến loader tiếp tục publish, gây backlog hoặc vượt capacity. | High | Test tại 999/1000/1001 và concurrent loaders; xác nhận cơ chế lock/throttle; theo dõi queue depth và publish rate. |
| R-09 | Redis expiry/cursor cũ làm PI không được load lại hoặc bị load lặp. | High | Test TTL cleanup, cursor reset/resume và redeploy; quan sát key/cursor trước-sau cycle; có runbook phục hồi. |
| R-10 | Thiếu dữ liệu Staging hoặc không giả lập được thời gian làm boundary test không đầy đủ. | Medium | Chuẩn bị deterministic fixtures; hỗ trợ override clock/trigger trong non-production; không dùng cách đổi system time ảnh hưởng service khác. |
| R-11 | Nguồn Shopee hoặc hạ tầng Solr/RabbitMQ không ổn định tạo false negative. | Medium | Tách component test với mock khỏi end-to-end; retry có kiểm soát; ghi timestamp/correlation ID và phân loại lỗi dependency. |
| R-12 | Rollout trực tiếp toàn bộ làm sai lịch crawl trên diện rộng. | High | Release bằng feature flag/canary theo domain; quan sát ít nhất một cycle; chuẩn bị rollback bằng cách tắt auto-select hoặc loader theo runbook. |
| R-13 | PI có `official`/`industry_id` null hoặc dữ liệu legacy rơi ngoài cả hai query vùng. | High | Chốt null/fallback rule; đo count tập dữ liệu không thuộc vùng nào trên Production bằng query read-only; thêm metric `unclassified/skipped`. |
| R-14 | Job báo success và có message nhưng tập PI ID thực tế sai. | Critical | Bắt buộc Golden Dataset và set-diff theo ID; không dùng job status hoặc message count làm bằng chứng duy nhất. |

## 7. TÀI LIỆU BÀN GIAO (Deliverables)

QA cung cấp:

1. **Test Plan**: phạm vi, chiến lược, môi trường, tiêu chí và rủi ro của YNMPECA-9325.
2. **Test Cases/Test Checklist**: decision table lịch/vùng; boundary filter; batch/chunk; queue; Redis; cursor; recovery và regression cho VN/TH.
3. **Test Data Matrix**: danh sách PI seed, thuộc tính đầu vào, domain và expected inclusion/exclusion.
4. **Automation Test Suite/Result**: nếu codebase có framework phù hợp, ưu tiên automation cho query builder, clock boundary, chunking và feature flag.
5. **Bug Reports**: mô tả, bước tái hiện, actual/expected, evidence query/log/message/cursor, severity/priority và environment/build.
6. **Test Execution Report**: kết quả theo build, tỷ lệ pass/fail/block, defect mapping và coverage P0/P1/P2.
7. **Performance/Reliability Evidence**: throughput baseline, queue-depth behavior, resource metrics và kết quả restart/fault injection.
8. **Test Summary Report & Release Recommendation**: phạm vi đã test/chưa test, bug còn mở, accepted risks, go/no-go recommendation.
9. **Production Smoke Checklist**: version/config, timezone, domain mapping, queue, metric/log, feature flag và rollback verification.

---

## Phụ lục A — Checklist cấu hình trước release

- [ ] VN và TH đã dùng lịch tuần đúng theo quyết định A-01.
- [ ] Rule ngày 01 tháng kế đã đúng theo quyết định A-02.
- [ ] Logic Vùng 1/2 và tình huống block đã đúng theo quyết định A-03.
- [ ] Toán tử OR/AND và tập PI của Vùng 3 đã đúng theo quyết định A-07.
- [ ] Timezone của từng deployment đã đúng theo quyết định A-04.
- [ ] `PRODUCT_ITEM_BATCH_CRAWLING_LOADER_ENABLE` đúng giá trị rollout.
- [ ] `PRODUCT_ITEM_BATCH_CRAWLING_LOADER_METADATA_ENABLE_AUTO_SELECT_PRIORITY` đúng giá trị rollout.
- [ ] `PRODUCT_ITEM_BATCH_CRAWLING_LOADER_METADATA_MONTH_END_PRIORITY_DAYS=3` và không phải 0/âm/quá giới hạn.
- [ ] `DATA_LOAD_BATCH_SIZE=100`, `CHUNK_SIZE=5`, `MAX_MSG_IN_QUEUE=1000`.
- [ ] `EXTRA_FILTER` VN/TH đúng source, shop exclusion, 30 ngày, sold ≥ 1000 và failed < 5.
- [ ] Queue VN/TH và DLQ routing đúng; không cross-domain.
- [ ] Cursor/Redis key đúng domain; monitoring và rollback đã sẵn sàng.

## Phụ lục B — Điều kiện không thể sign-off nếu chưa làm rõ

QA không sign-off release nếu chưa có quyết định chính thức cho:

1. Lịch ưu tiên hàng tuần của ECI Thái Lan.
2. Expected behavior của ngày 01 tháng kế tiếp.
3. Cách phân biệt Vùng 1 và Vùng 2, cùng hành vi khi “bị block”.
4. Định nghĩa Vùng 3 dùng `OR` hay `AND`, cùng cách xử lý field null/legacy.
5. Timezone dùng để đánh giá lịch.
6. Baseline query khi tắt auto-select priority.
7. Producer payload schema, publisher confirm, retry policy, delivery semantic và natural key của loader dùng để xác định duplicate.

## Phụ lục C — Checklist thông tin Dev cần bàn giao trước khi QA execute

- [ ] Repo/commit/MR/image tag chứa thay đổi của `YNMPECA-9325`.
- [ ] Bản full Solr query thực tế của VN và TH, gồm source ID chính thức của TH.
- [ ] Decision table đã approve cho lịch VN/TH, rule cuối tháng và ngày 01 tháng kế.
- [ ] Định nghĩa chính thức Vùng 1, Vùng 2, Vùng 3; mapping “industry đang có khách”.
- [ ] Cơ chế phát hiện “bị block” và điều kiện chuyển từ Vùng 1 sang Vùng 2, nếu có triển khai.
- [ ] Rule cho `official`/`industry_id` null, missing hoặc dữ liệu legacy.
- [ ] Timezone của scheduler/pod và cách inject/mock clock ở môi trường test.
- [ ] Producer payload schema, PI ID field, domain/source metadata, correlation ID và publisher-confirm contract.
- [ ] Retry/DLX policy, delivery semantic của loader, natural key/dedup rule và expected duplicate behavior tại ranh giới RabbitMQ. Idempotency của downstream consumer không thuộc scope release.
- [ ] Cursor schema/semantics: thời điểm read/write, transaction boundary với publish và cách reset an toàn ở Testing.
- [ ] Redis key đầy đủ cho VN/TH, TTL/expiry rule và cách cô lập key test.
- [ ] Back-pressure behavior khi queue depth đạt/vượt 1000 và khi nhiều loader instance chạy đồng thời.
- [ ] Baseline query/behavior khi tắt auto-select và rollback runbook.
- [ ] Dashboard/log/metric cần theo dõi; log phải có evaluated time, timezone, selected zone, query, counts và run ID.
- [ ] SLA/throughput hoặc baseline performance cùng ngưỡng regression chấp nhận.
