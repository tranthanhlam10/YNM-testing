# TEST CASES
## YNMPECA-9280 - Setup ClickHouseDB VN và TL cho ECI

| Field | Value |
|---|---|
| Jira chính | https://jira.younetco.com/browse/YNMPECA-9280 |
| Test Plan | `Ai_Agents/test_plans/local/eci_clickhouse_product_item_histories/TestPlan_YNMPECA-9280_Setup_ClickHouseDB_ECI.md` |
| Review tham chiếu | `Ai_Agents/templates/codex/review_testplan_YNMPECA-9280.md` |
| Ngày tạo | 06/07/2026 |
| Phiên bản | v1.0 - Bổ sung theo review |
| Ghi chú | Bộ test case này viết bằng tiếng Việt có dấu, ưu tiên P0 cho các sub-task đã `To be Tested`, và tách rõ các case đang phụ thuộc sub-task còn `Open`. |

---

## 1. Quy ước chung

### 1.1. Nhóm ưu tiên

| Priority | Ý nghĩa |
|---|---|
| P0 | Bắt buộc chạy trước khi sign-off phần core: schema, adapter, query, merge, calculation parity |
| P1 | Chạy khi các sub-task pusher, realtime, App adapter đã sẵn sàng |
| P2 | Chạy nếu PM/Dev xác nhận nằm trong scope release hoặc còn đủ thời gian |

### 1.2. Trạng thái readiness theo Jira

| Nhóm | Sub-task | Readiness tại thời điểm review | Cách xử lý trong test case |
|---|---|---|---|
| Core adapter/query/calculation | `YNMPECA-9282`, `9283`, `9284`, `9285` | To be Tested | Có thể execute ngay sau khi resolve các NC blocking |
| Pusher raw, realtime, App, legacy fields | `YNMPECA-9286`, `9287`, `9288`, `9295` | Open | Đánh dấu Conditional/Blocked cho tới khi Dev confirm ready |
| Scope mơ hồ trong Tech Wiki | duplicate sold islands, `findBrokenLastSoldChain`, rải số từ ClickHouse | Need Confirm | Chỉ execute nếu PM/Dev xác nhận thuộc scope `YNMPECA-9280` |

### 1.3. Test data dùng chung

| Test Data ID | Mô tả | Giá trị chính | Expected chính |
|---|---|---|---|
| `DS-SOLD-UP` | PI có sold tăng | `total_sold=120`, `last_total_sold=100`, `price=20000`, `sell_price=15000` | `delta_sold=20`, `gmv=300000` |
| `DS-SOLD-DOWN` | PI có sold giảm | `total_sold=90`, `last_total_sold=100`, `price=20000`, `sell_price=15000` | `delta_sold=-10`, được trả về bởi `checkInvalidRecords` |
| `DS-SOLD-SAME` | PI có sold không đổi | `total_sold=100`, `last_total_sold=100` | `delta_sold=0`, không vào calculation positive |
| `DS-NULL-TOTAL` | Thiếu `total_sold` | `total_sold=null`, `last_total_sold=100` | `delta_sold=0`, `gmv=0` |
| `DS-NULL-LAST` | Thiếu `last_total_sold` | `total_sold=100`, `last_total_sold=null` | `delta_sold=0`, `gmv=0` |
| `DS-NULL-SELL-PRICE` | Thiếu `sell_price` | `total_sold=120`, `last_total_sold=100`, `sell_price=null` | `delta_sold=20`, `gmv=0` |
| `DS-PRICE-ZERO` | Giá bằng 0 | `price=0`, `sell_price=0` | Discount percent là `NULL`, không chia cho 0 |
| `DS-DUP-MERGE` | Hai row cùng `(product_item_id, crawled_date)` | Row cũ `updated_date=10:00`, row mới `updated_date=10:05` | Sau Merge/FINAL, row `updated_date=10:05` thắng |
| `DS-BOUNDARY-DATE` | Data sát biên ngày | `2026-07-06T00:00:00`, `2026-07-06T23:59:59`, `2026-07-07T00:00:00` | Xác định đúng `< endDate` và `<= endDate` |
| `DS-Q1-2026` | Dataset dài từ Q1/2026 | Nhiều PI, nhiều tuần, VN/TL | Dùng cho parity Timescale vs ClickHouse |
| `DS-PI-1Y` | Một PI có lịch sử 1 năm | 365 ngày hoặc nhiều record hơn nếu crawl nhiều lần/ngày | Dùng cho App adapter timerange 1 năm |
| `DS-BATCH-10K` | Batch 10.000 records | 10.000 Product Item records hợp lệ | Dùng cho realtime throughput |
| `DS-CONCURRENT` | Data cùng PI được insert song song | Hai pusher/job cùng insert cùng PI/time range | Dùng cho concurrent behavior |

---

## 2. Test cases P0 - Readiness và Need Confirm blocking

| TEST CASE ID | MODULE/FEATURE | TEST NAME | PRE-CONDITION | TEST STEPS | TEST DATA | EXPECTED RESULT |
|---|---|---|---|---|---|---|
| TC_READY_001 | Readiness | [P0][Blocking] Chốt cơ chế Merge trước khi execute test dedup/calculation | Có Dev/DBA tham gia NC meeting | 1. Hỏi Dev cơ chế dùng trước calculation. 2. Ghi nhận là `OPTIMIZE ... FINAL`, query `FINAL`, trigger job riêng hoặc cơ chế khác. 3. Cập nhật lại expected trong test case dedup. | NC-2 | Cơ chế Merge/FINAL được chốt rõ. Nếu chưa chốt, block các TC `TC_CH_SCHEMA_008`, `TC_CHKINV_008`, `TC_CALC_011`, `TC_CONCURRENT_001`. |
| TC_READY_002 | Readiness | [P0][Blocking] Chốt rule biên ngày `< endDate` và `<= endDate` | Có Dev/BA tham gia NC meeting | 1. Đưa ví dụ record đúng `endDate`. 2. Confirm `checkInvalidRecords` dùng `< endDate`. 3. Confirm `calculatePIHistories` dùng `<= endDate`. | NC-4, `DS-BOUNDARY-DATE` | QA có expected chính thức cho boundary date. Nếu chưa chốt, block các TC boundary. |
| TC_READY_003 | Readiness | [P0][Blocking] Chốt timezone cho VN/TL | Có Dev/BA tham gia NC meeting | 1. Confirm input date đang dùng UTC hay `Asia/Ho_Chi_Minh`. 2. Confirm TL có rule timezone riêng không. 3. Ghi lại cách convert date khi query ClickHouse. | NC-5 | Timezone được chốt để tránh sai partition, sai ngày, sai weekly calculation. |
| TC_READY_004 | Readiness | [P0][Blocking] Chốt parity threshold Timescale vs ClickHouse | Có PM/BA/Dev tham gia | 1. Hỏi ngưỡng chấp nhận cho sold/gmv/count/avg. 2. Hỏi rounding decimal có tolerance không. 3. Ghi vào execution sheet. | NC-3 | Có tiêu chí pass/fail rõ: ví dụ 100% parity cho count/sold, tolerance `< 0.01%` cho decimal/rounding nếu được chấp nhận. |
| TC_READY_005 | Readiness | [P0][Blocking] Xác nhận data Q1/2026+ đã load vào ClickHouse | QA có quyền query ClickHouse | 1. Query min/max `crawled_date`. 2. Query count theo tháng từ 01/2026. 3. So sánh với thông tin Dev/DBA bàn giao. | NC-11, `DS-Q1-2026` | ClickHouse có data dài đủ để test parity và App 1 năm. Nếu chưa có, block parity dài hạn và App timerange 1 năm. |
| TC_READY_006 | Readiness | [P1][Conditional] Chốt queue/topic và ack/retry của pusher raw histories | Sub-task `YNMPECA-9286` sẵn sàng hoặc Dev confirm design | 1. Hỏi queue/topic input. 2. Hỏi ack khi insert ClickHouse fail. 3. Hỏi retry/dead-letter policy. | NC-8 | Có thông tin để execute pusher failure test. Nếu chưa chốt, block Module Pusher raw. |

---

## 3. Test cases P0 - ClickHouse schema, storage và materialized fields

| TEST CASE ID | MODULE/FEATURE | TEST NAME | PRE-CONDITION | TEST STEPS | TEST DATA | EXPECTED RESULT |
|---|---|---|---|---|---|---|
| TC_CH_SCHEMA_001 | ClickHouse Schema | [P0][Positive] Kiểm tra database `eci` tồn tại trên cluster | QA có quyền query ClickHouse | 1. Chạy `SHOW DATABASES`. 2. Kiểm tra database `eci`. | N/A | Database `eci` tồn tại trên môi trường test/staging đúng cluster. |
| TC_CH_SCHEMA_002 | ClickHouse Schema | [P0][Positive] Kiểm tra local table và distributed table tồn tại | Database `eci` đã có | 1. Chạy `SHOW TABLES FROM eci`. 2. Kiểm tra `product_item_histories_local`. 3. Kiểm tra `product_item_histories`. | N/A | Hai bảng tồn tại đúng tên, không thiếu bảng local/distributed. |
| TC_CH_SCHEMA_003 | ClickHouse Schema | [P0][Positive] Kiểm tra các field bắt buộc theo Tech Wiki | Bảng đã tạo | 1. Chạy `DESCRIBE TABLE eci.product_item_histories_local`. 2. Đối chiếu field identity, date, shop, product, price, sales, flags, ratings, brand. | Schema Tech Wiki | Tất cả field bắt buộc có đúng tên và kiểu dữ liệu cơ bản. |
| TC_CH_SCHEMA_004 | ClickHouse Schema | [P0][Positive] Kiểm tra engine `ReplicatedReplacingMergeTree` và version column `updated_date` | Có quyền xem `SHOW CREATE TABLE` | 1. Chạy `SHOW CREATE TABLE eci.product_item_histories_local`. 2. Kiểm tra engine và version column. | N/A | Engine là `ReplicatedReplacingMergeTree`, version column là `updated_date`. |
| TC_CH_SCHEMA_005 | ClickHouse Schema | [P0][Positive] Kiểm tra partition theo tuần | Có quyền xem table DDL | 1. Chạy `SHOW CREATE TABLE`. 2. Kiểm tra `PARTITION BY toYYYYMMDD(toMonday(crawled_date))`. | N/A | Partition expression đúng theo Tech Wiki. |
| TC_CH_SCHEMA_006 | ClickHouse Schema | [P0][Positive] Kiểm tra ORDER BY và sharding key | Có quyền xem DDL | 1. Kiểm tra `ORDER BY (product_item_id, crawled_date)`. 2. Kiểm tra Distributed engine dùng `cityHash64(product_item_id)`. | N/A | ORDER BY và sharding key đúng, cùng PI có xu hướng vào cùng shard. |
| TC_CH_SCHEMA_007 | Materialized Fields | [P0][Positive] Insert sold tăng và verify `delta_sold`, `gmv` tự tính | QA có quyền insert test data hoặc nhờ Dev insert | 1. Insert record test. 2. Query lại record trong ClickHouse. 3. Kiểm tra materialized fields. | `DS-SOLD-UP` | `delta_sold=20`, `gmv=300000`. |
| TC_CH_SCHEMA_008 | Dedup/Merge | [P0][Positive] Verify duplicate cùng key giữ row có `updated_date` mới hơn | Cơ chế Merge/FINAL đã được chốt | 1. Insert hai row cùng `(product_item_id, crawled_date)`. 2. Trigger Merge hoặc query `FINAL` theo design. 3. Query lại record. | `DS-DUP-MERGE` | Chỉ row có `updated_date` mới hơn được dùng cho output calculation. |
| TC_CH_SCHEMA_009 | Materialized Fields | [P0][Edge] Verify `delta_sold=0` khi `total_sold` hoặc `last_total_sold` NULL | Có data test null | 1. Insert `DS-NULL-TOTAL`. 2. Insert `DS-NULL-LAST`. 3. Query materialized fields. | `DS-NULL-TOTAL`, `DS-NULL-LAST` | `delta_sold=0`, `gmv=0`, insert không fail. |
| TC_CH_SCHEMA_010 | Materialized Fields | [P0][Edge] Verify `gmv=0` khi `sell_price` NULL | Có data test null price | 1. Insert record có `sell_price=null`. 2. Query `delta_sold`, `gmv`. | `DS-NULL-SELL-PRICE` | `delta_sold=20`, `gmv=0`, không lỗi kiểu dữ liệu. |
| TC_CH_SCHEMA_011 | Distributed Query | [P1][Positive] Query distributed table trả dữ liệu hợp nhất từ local shards | Cluster có nhiều shard/replica | 1. Insert/query data qua distributed table. 2. Query local table theo shard nếu có quyền. 3. So sánh count. | Một batch 10-100 PI | Distributed table trả đủ dữ liệu, không thiếu shard. |
| TC_CH_SCHEMA_012 | Partition | [P1][Edge] Verify record đầu tuần/cuối tuần vào đúng partition | Có data sát thứ Hai/chủ nhật | 1. Insert records ở đầu tuần và cuối tuần. 2. Query partition qua `system.parts`. | Data ngày thứ Hai và Chủ nhật | Partition theo `toMonday(crawled_date)` đúng, không lệch tuần. |

---

## 4. Test cases P0 - ClickhouseAdapter của `ynm-eca`

| TEST CASE ID | MODULE/FEATURE | TEST NAME | PRE-CONDITION | TEST STEPS | TEST DATA | EXPECTED RESULT |
|---|---|---|---|---|---|---|
| TC_ADAPTER_001 | ClickhouseAdapter | [P0][Positive] Adapter kết nối thành công đến ClickHouse | `ynm-eca` đã deploy config ClickHouse | 1. Trigger health check hoặc job query đơn giản. 2. Xem log kết nối. | N/A | Adapter kết nối đúng host/database/user, không lỗi authentication/timeout. |
| TC_ADAPTER_002 | ClickhouseAdapter | [P0][Positive] Adapter execute SELECT có parameter date | Có data trong ClickHouse | 1. Trigger query có `startDate`, `endDate`. 2. Xem query result. | `DS-Q1-2026` | Query chạy thành công, parameter date được bind đúng format ClickHouse. |
| TC_ADAPTER_003 | ClickhouseAdapter | [P0][Positive] Adapter execute query có cursor `latestProductItemId` | Có nhiều PI test | 1. Chạy query lần 1 với cursor rỗng. 2. Lấy item cuối làm cursor. 3. Chạy lần 2. | 10 PI test | Lần 2 chỉ trả PI có `product_item_id` lớn hơn cursor, không lặp dữ liệu. |
| TC_ADAPTER_004 | ClickhouseAdapter | [P0][Negative] ClickHouse timeout không làm service crash | Có thể simulate timeout hoặc dùng env lỗi | 1. Cấu hình timeout thấp hoặc nhờ Dev simulate. 2. Trigger query. 3. Kiểm tra log/service status. | N/A | Service không crash, log lỗi có context, job trả trạng thái fail/retry rõ ràng. |
| TC_ADAPTER_005 | ClickhouseAdapter | [P0][Negative] Query syntax/error được log đủ thông tin debug | Dev hỗ trợ trigger query lỗi trên test env | 1. Trigger query lỗi có kiểm soát. 2. Kiểm tra log. | N/A | Log có query/job id/module/error message, không lộ secret. |
| TC_ADAPTER_006 | ClickhouseAdapter | [P1][Conditional] Feature flag OFF dùng Timescale, ON dùng ClickHouse | Dev confirm có feature flag/config toggle | 1. Tắt flag. 2. Trigger query. 3. Bật flag. 4. Trigger lại query. | Dataset nhỏ | OFF dùng Timescale, ON dùng ClickHouse, log thể hiện datasource rõ ràng. |
| TC_ADAPTER_007 | ClickhouseAdapter | [P1][Conditional] Toggle datasource không làm mất batch đang xử lý | Có feature flag runtime hoặc deploy config | 1. Chạy job batch. 2. Toggle datasource theo hướng dẫn Dev. 3. Theo dõi output. | Batch 100-500 PI | Không mất batch, không duplicate ngoài ý muốn, log trạng thái rõ. |

---

## 5. Test cases P0 - Query `checkInvalidRecords`

| TEST CASE ID | MODULE/FEATURE | TEST NAME | PRE-CONDITION | TEST STEPS | TEST DATA | EXPECTED RESULT |
|---|---|---|---|---|---|---|
| TC_CHKINV_001 | checkInvalidRecords | [P0][Positive] Trả PI có `delta_sold < 0` trong tuần hiện tại | Có data sold giảm | 1. Insert/chuẩn bị `DS-SOLD-DOWN`. 2. Chạy `checkInvalidRecords`. 3. Kiểm tra output. | `DS-SOLD-DOWN` | Output có `product_item_id` của PI sold giảm. |
| TC_CHKINV_002 | checkInvalidRecords | [P0][Negative] Không trả PI có `delta_sold >= 0` | Có data sold tăng và sold bằng nhau | 1. Chuẩn bị `DS-SOLD-UP`, `DS-SOLD-SAME`. 2. Chạy query. | `DS-SOLD-UP`, `DS-SOLD-SAME` | Output không chứa các PI có `delta_sold >= 0`. |
| TC_CHKINV_003 | checkInvalidRecords | [P0][Negative] Không trả PI `is_abnormal = 1` | Có PI sold giảm nhưng đã abnormal | 1. Insert PI `delta_sold < 0`, `is_abnormal=1`. 2. Chạy query. | PI abnormal | Output không chứa PI abnormal. |
| TC_CHKINV_004 | checkInvalidRecords | [P0][Boundary] Verify `crawled_date >= startDate` | Có record đúng bằng `startDate` | 1. Tạo record tại đúng `startDate`. 2. Chạy query. | `DS-BOUNDARY-DATE` | Record đúng `startDate` được tính nếu thỏa điều kiện khác. |
| TC_CHKINV_005 | checkInvalidRecords | [P0][Boundary] Verify `crawled_date < endDate` | Rule `endDate` đã confirm | 1. Tạo record đúng bằng `endDate`. 2. Chạy query. | `DS-BOUNDARY-DATE` | Record đúng `endDate` không được trả về nếu query dùng `< endDate`. |
| TC_CHKINV_006 | checkInvalidRecords | [P0][Positive] Cursor `latestProductItemId` hoạt động đúng | Có nhiều PI sold giảm | 1. Chạy query với cursor giữa danh sách PI. 2. Kiểm tra output. | 10 PI sold giảm | Chỉ trả PI có `product_item_id > latestProductItemId`. |
| TC_CHKINV_007 | checkInvalidRecords | [P0][Positive] Sort ASC và limit đúng batch size | Có hơn 500 PI sold giảm | 1. Chạy query với `limit=500`. 2. Kiểm tra count và order. | Batch > 500 PI | Output tối đa 500 records, sort `product_item_id ASC`. |
| TC_CHKINV_008 | checkInvalidRecords | [P0][Dedup] Query không trả sai do duplicate chưa merge | Cơ chế Merge đã confirm | 1. Tạo duplicate cùng PI/time. 2. Trigger Merge/FINAL. 3. Chạy query. | `DS-DUP-MERGE` | Output dựa trên row thắng sau Merge, không bị duplicate làm sai kết quả. |
| TC_CHKINV_009 | checkInvalidRecords | [P1][Performance] Batch 500 chạy trong threshold đã chốt | Dev/PM đã chốt threshold, ví dụ `< 60s` | 1. Chạy query trên data Q1/2026+. 2. Đo duration. | `DS-Q1-2026` | Duration nhỏ hơn threshold đã chốt, không timeout. |
| TC_CHKINV_010 | checkInvalidRecords | [P1][Compare] `DISTINCT` và `GROUP BY` trả cùng output nếu Dev đổi query | Dev confirm có đổi `DISTINCT` sang `GROUP BY` | 1. Chạy query version cũ và mới trên cùng dataset. 2. So sánh list PI. | Dataset sold giảm có duplicate | Output giống nhau về tập `product_item_id`; nếu khác phải log bug/Need Confirm. |

---

## 6. Test cases P0 - Query `calculatePIHistories`

| TEST CASE ID | MODULE/FEATURE | TEST NAME | PRE-CONDITION | TEST STEPS | TEST DATA | EXPECTED RESULT |
|---|---|---|---|---|---|---|
| TC_CALC_001 | calculatePIHistories | [P0][Positive] Tính `sold` đúng với `delta_sold > 0` | Có PI sold tăng | 1. Chuẩn bị `DS-SOLD-UP`. 2. Chạy calculation. 3. Kiểm tra `sold`. | `DS-SOLD-UP` | `sold=20` cho PI test. |
| TC_CALC_002 | calculatePIHistories | [P0][Positive] Tính `gmv` đúng | Có PI sold tăng và sell price hợp lệ | 1. Chạy calculation. 2. Kiểm tra `gmv`. | `DS-SOLD-UP` | `gmv=300000`. |
| TC_CALC_003 | calculatePIHistories | [P0][Negative] Không tính record `delta_sold <= 0` | Có sold giảm và sold bằng nhau | 1. Chuẩn bị `DS-SOLD-DOWN`, `DS-SOLD-SAME`. 2. Chạy calculation. | `DS-SOLD-DOWN`, `DS-SOLD-SAME` | Các record này không đóng góp vào `sold/gmv` positive. |
| TC_CALC_004 | calculatePIHistories | [P0][Negative] Không tính record `is_abnormal = 1` | Có PI sold tăng nhưng abnormal | 1. Insert PI `delta_sold > 0`, `is_abnormal=1`. 2. Chạy calculation. | PI abnormal | Record abnormal bị loại khỏi calculation. |
| TC_CALC_005 | calculatePIHistories | [P0][Positive] Tính `avg_price` và `avg_sell_price` đúng | Có nhiều record giá khác nhau | 1. Chuẩn bị 3 record cùng PI. 2. Chạy calculation. 3. Tính expected bằng tay. | PI nhiều price | `avg_price`, `avg_sell_price` đúng với ClickHouse AVG semantics. |
| TC_CALC_006 | calculatePIHistories | [P0][Edge] Discount percent không chia cho 0 | Có record `price=0` | 1. Chuẩn bị `DS-PRICE-ZERO`. 2. Chạy calculation. | `DS-PRICE-ZERO` | Discount percent là `NULL` hoặc bị bỏ qua trong AVG theo query, job không lỗi. |
| TC_CALC_007 | calculatePIHistories | [P0][Edge] `sell_price=null` không làm sai `gmv` và AVG | Có record thiếu sell price | 1. Chuẩn bị `DS-NULL-SELL-PRICE`. 2. Chạy calculation. | `DS-NULL-SELL-PRICE` | `gmv=0`; AVG xử lý NULL đúng, không crash. |
| TC_CALC_008 | calculatePIHistories | [P0][Boundary] Verify `crawled_date >= startDate` | Rule date đã confirm | 1. Tạo record đúng `startDate`. 2. Chạy calculation. | `DS-BOUNDARY-DATE` | Record đúng `startDate` được tính nếu thỏa điều kiện khác. |
| TC_CALC_009 | calculatePIHistories | [P0][Boundary] Verify `crawled_date <= endDate` | Rule `<= endDate` đã confirm | 1. Tạo record đúng `endDate`. 2. Chạy calculation. | `DS-BOUNDARY-DATE` | Record đúng `endDate` được tính nếu query dùng `<= endDate`. |
| TC_CALC_010 | calculatePIHistories | [P0][Positive] Cursor/order/limit đúng với batch 1000 | Có hơn 1000 PI hợp lệ | 1. Chạy calculation với `limit=1000`. 2. Kiểm tra order và cursor. | Batch > 1000 PI | Output tối đa 1000 PI, sort ASC, không lặp khi chạy batch tiếp theo. |
| TC_CALC_011 | calculatePIHistories | [P0][Dedup] Calculation không bị sai do duplicate row | Cơ chế Merge/FINAL đã chốt | 1. Chuẩn bị `DS-DUP-MERGE`. 2. Trigger Merge/FINAL. 3. Chạy calculation. | `DS-DUP-MERGE` | Calculation dùng row mới nhất, không cộng duplicate. |
| TC_CALC_012 | calculatePIHistories | [P0][Parity] So sánh sold/gmv ClickHouse với Timescale trên cùng PI | QA có quyền query Timescale | 1. Chọn 5-10 PI mẫu. 2. Chạy query ClickHouse. 3. Chạy query Timescale. 4. So sánh. | `DS-Q1-2026` | Sai lệch nằm trong parity threshold đã chốt. |
| TC_CALC_013 | calculatePIHistories | [P1][Performance] Batch 1000 chạy trong threshold đã chốt | Dev/PM chốt threshold, ví dụ `< 5 phút` | 1. Chạy job batch 1000 PI. 2. Đo duration. | `DS-Q1-2026` | Duration nhỏ hơn threshold, không timeout, không spike tài nguyên bất thường. |
| TC_CALC_014 | calculatePIHistories | [P1][Timezone] Calculation không lệch ngày khi data VN/TL sát 00:00 | Timezone đã chốt | 1. Tạo data sát 00:00 và 23:59 cho VN/TL. 2. Chạy calculation theo ngày/tuần. | `DS-BOUNDARY-DATE` VN/TL | Record được tính vào đúng ngày/tuần theo timezone đã chốt. |

---

## 7. Test cases P0/P1 - Data parity và sample SQL

| TEST CASE ID | MODULE/FEATURE | TEST NAME | PRE-CONDITION | TEST STEPS | TEST DATA | EXPECTED RESULT |
|---|---|---|---|---|---|---|
| TC_PARITY_001 | Data Parity | [P0][Positive] Count parity theo tuần giữa Timescale và ClickHouse | Data Q1/2026+ đã load | 1. Chạy query count theo tuần ở ClickHouse. 2. Chạy query tương ứng ở Timescale. 3. So sánh count. | `DS-Q1-2026` | Count theo tuần khớp hoặc lệch trong threshold đã chốt; mọi lệch đều có lý do. |
| TC_PARITY_002 | Data Parity | [P0][Positive] Aggregate parity theo PI | Có danh sách PI mẫu | 1. Chọn PI sold tăng, sold giảm, null price. 2. Query aggregate ở hai nguồn. 3. So sánh. | 10-20 PI mẫu | `sold`, `gmv`, `avg_price`, `avg_sell_price`, discount khớp threshold. |
| TC_PARITY_003 | Data Parity | [P0][Positive] Parity theo platform/crawler_type | Có data nhiều crawler type | 1. Count theo `crawler_type`. 2. So sánh Timescale vs ClickHouse. | Data VN/TL nhiều crawler type | Không thiếu crawler type, count hợp lý. |
| TC_PARITY_004 | Data Parity | [P1][Edge] Parity cho PI có nhiều record trong cùng ngày | Có PI crawl nhiều lần/ngày | 1. Chọn PI nhiều record/ngày. 2. So sánh raw count và aggregate. | PI nhiều record/ngày | ClickHouse giữ đúng N record/ngày trước dedup key; aggregate không sai. |
| TC_PARITY_005 | Data Parity | [P1][Edge] Parity cho duplicate sau Merge | Có duplicate test hoặc duplicate thật | 1. Query raw/final ở ClickHouse. 2. So sánh với baseline. | `DS-DUP-MERGE` | Output final không cộng duplicate ngoài ý muốn. |
| TC_PARITY_006 | Data Parity | [P1][Negative] Phát hiện missing partition hoặc missing shard | Có quyền query `system.parts` | 1. Count theo partition. 2. Kiểm tra partition trống bất thường. 3. So sánh với Timescale. | `DS-Q1-2026` | Không thiếu partition/shard; nếu thiếu phải log bug/block release. |

---

## 8. Test cases P1 - Pusher raw histories và pusher PW/PM

| TEST CASE ID | MODULE/FEATURE | TEST NAME | PRE-CONDITION | TEST STEPS | TEST DATA | EXPECTED RESULT |
|---|---|---|---|---|---|---|
| TC_PUSHER_001 | Raw Histories Pusher | [P1][Conditional] Pusher ghi record raw vào ClickHouse đúng mapping | `YNMPECA-9286` ready | 1. Push/replay một record PI hợp lệ. 2. Query ClickHouse theo `product_item_id`. | `DS-SOLD-UP` | ClickHouse có row mới, field mapping đúng, materialized fields đúng. |
| TC_PUSHER_002 | Raw Histories Pusher | [P1][Conditional] Batch insert không mất record | Pusher raw ready | 1. Push batch 100 records. 2. Query count theo batch id/time. | Batch 100 PI | Count trong ClickHouse bằng số record hợp lệ đã push. |
| TC_PUSHER_003 | Raw Histories Pusher | [P1][Conditional] Nullable fields không làm fail insert | Pusher raw ready | 1. Push records có null price, null sold, null brand. 2. Query ClickHouse. | `DS-NULL-TOTAL`, `DS-NULL-LAST`, `DS-NULL-SELL-PRICE` | Insert thành công, NULL được lưu đúng, không crash pusher. |
| TC_PUSHER_004 | Raw Histories Pusher | [P1][Conditional] Decimal/int/bool convert đúng | Pusher raw ready | 1. Push record có price decimal, flags boolean/int. 2. Query type/value. | PI có nhiều flags | Field giá, sold, flags được convert đúng type/value. |
| TC_PUSHER_005 | Raw Histories Pusher | [P1][Conditional] Insert fail không ack mất message | Dev đã chốt ack/retry | 1. Simulate ClickHouse insert fail. 2. Theo dõi queue/log. 3. Khôi phục ClickHouse. | Batch nhỏ | Message không mất, được retry hoặc vào DLQ theo design; log đủ trace. |
| TC_PUSHER_006 | PW/PM Pusher | [P0][Positive] Pusher PW nhận output calculation từ ClickHouse | `YNMPECA-9285` To be Tested | 1. Chạy calculation weekly. 2. Theo dõi output pusher. 3. Query đích weekly. | `DS-SOLD-UP` | Weekly output có sold/gmv đúng với calculation ClickHouse. |
| TC_PUSHER_007 | PW/PM Pusher | [P0][Positive] Pusher PM nhận output calculation từ ClickHouse | `YNMPECA-9285` ready | 1. Chạy calculation monthly. 2. Query output monthly. | `DS-Q1-2026` | Monthly output đúng, không còn phụ thuộc Timescale nếu scope đã migrate. |
| TC_PUSHER_008 | PW/PM Pusher | [P1][Regression] Re-run cùng batch không tạo duplicate aggregate | Pusher PW/PM ready | 1. Chạy cùng job 2 lần. 2. Query output aggregate. | Một batch PI | Không nhân đôi sold/gmv; idempotency đúng theo design. |

---

## 9. Test cases P1 - Realtime Product Items, App adapter và legacy fields

| TEST CASE ID | MODULE/FEATURE | TEST NAME | PRE-CONDITION | TEST STEPS | TEST DATA | EXPECTED RESULT |
|---|---|---|---|---|---|---|
| TC_REALTIME_001 | Product Items Realtime | [P1][Conditional] Cập nhật 10.000 records trong 1 phút | `YNMPECA-9287` ready, có môi trường benchmark | 1. Chuẩn bị batch 10.000 records. 2. Trigger realtime update. 3. Đo duration và failed count. | `DS-BATCH-10K` | Hoàn tất trong 1 phút hoặc threshold đã chốt; failed count = 0 hoặc có retry thành công. |
| TC_REALTIME_002 | Product Items Realtime | [P1][Conditional] Partial failure không làm mất cả batch | Realtime service ready | 1. Trộn 1-2 record lỗi vào batch. 2. Trigger update. 3. Query kết quả. | Batch mixed valid/invalid | Record hợp lệ vẫn được cập nhật; record lỗi có log/retry, không làm fail toàn batch. |
| TC_FRESHNESS_001 | Data Freshness | [P1][Bổ sung review] Đo end-to-end freshness | SLA đã chốt | 1. Ghi nhận timestamp khi record vào pusher. 2. Query ClickHouse. 3. Query Product Items. 4. Call App/API. | Một PI mới | Thời gian từ input đến App thấy data mới nhỏ hơn SLA đã chốt. |
| TC_APP_001 | App Adapter | [P1][Conditional] API load Product Item Histories từ ClickHouse | `YNMPECA-9288` ready | 1. Call API/tool sold histories cho PI test. 2. Query ClickHouse cùng PI. 3. So sánh response. | `DS-PI-1Y` | API trả data đúng từ ClickHouse, không crash. |
| TC_APP_002 | App Adapter | [P1][Performance] Load lịch sử 1 năm không timeout | App adapter ready, threshold đã chốt | 1. Call API với range 1 năm. 2. Đo response time. | `DS-PI-1Y` | Response time nhỏ hơn threshold đã chốt, ví dụ `< 5 giây` nếu được confirm. |
| TC_APP_003 | App Adapter | [P1][Regression] Sold history hiển thị đúng sold/sell price/title | App/UI hoặc API sẵn sàng | 1. Mở tool sold histories hoặc call API. 2. So sánh với ClickHouse. | PI có nhiều record/ngày | Sold, sell price, title, `crawled_date` đúng với source ClickHouse. |
| TC_LEGACY_001 | Legacy Fields | [P1][Conditional] Remove `crawled_history`, `sold_history` không làm resolver/data pusher crash | `YNMPECA-9295` ready, App đã sửa tool | 1. Deploy version remove fields theo thứ tự. 2. Push record PI. 3. Theo dõi log. | PI hợp lệ | Resolver/data pusher không còn phụ thuộc field cũ, không crash. |
| TC_LEGACY_002 | Legacy Fields | [P1][Regression] App/tool sold histories không phụ thuộc field cũ | App task dependency đã done | 1. Call tool sold histories sau khi remove field. 2. Query ClickHouse. | `DS-PI-1Y` | Tool lấy dữ liệu từ ClickHouse, không lỗi thiếu `crawled_history` hoặc `sold_history`. |

---

## 10. Test cases bổ sung theo review - Concurrent behavior

| TEST CASE ID | MODULE/FEATURE | TEST NAME | PRE-CONDITION | TEST STEPS | TEST DATA | EXPECTED RESULT |
|---|---|---|---|---|---|---|
| TC_CONCURRENT_001 | Concurrent Behavior | [P0][Bổ sung review] Insert trong khi calculation đang chạy | Có thể trigger pusher và calculation song song | 1. Start calculation job. 2. Trong lúc job chạy, insert batch mới vào ClickHouse. 3. Kiểm tra output calculation. | `DS-CONCURRENT` | Output không tính sai do row mới/duplicate chưa merge. Nếu design yêu cầu snapshot, output phải nhất quán theo snapshot. |
| TC_CONCURRENT_002 | Concurrent Behavior | [P1][Bổ sung review] Hai pusher instance insert cùng PI | Có 2 worker/pusher hoặc simulate song song | 1. Trigger hai insert cùng PI/time. 2. Trigger Merge/FINAL. 3. Query final output. | `DS-DUP-MERGE`, `DS-CONCURRENT` | Dedup đúng theo `updated_date`; không nhân đôi aggregate. |
| TC_CONCURRENT_003 | Concurrent Behavior | [P1][Bổ sung review] Query khi Merge đang chạy không lỗi/timeout | Có thể trigger `OPTIMIZE ... FINAL` hoặc merge job | 1. Start Merge/Optimize. 2. Chạy `checkInvalidRecords`. 3. Chạy `calculatePIHistories`. | Dataset lớn vừa đủ | Query không lỗi/timeout vượt threshold; nếu bị lock/chậm cần log bug hoặc điều chỉnh strategy. |

---

## 11. Test cases bổ sung theo review - Feature flag/config toggle

| TEST CASE ID | MODULE/FEATURE | TEST NAME | PRE-CONDITION | TEST STEPS | TEST DATA | EXPECTED RESULT |
|---|---|---|---|---|---|---|
| TC_FLAG_001 | Feature Flag | [P0][Conditional] Flag OFF dùng Timescale | Dev confirm có flag datasource | 1. Set flag OFF. 2. Chạy `checkInvalidRecords`. 3. Kiểm tra log datasource. | Dataset nhỏ | Service dùng Timescale, không gọi ClickHouse cho query trong scope flag. |
| TC_FLAG_002 | Feature Flag | [P0][Conditional] Flag ON dùng ClickHouse | Dev confirm có flag datasource | 1. Set flag ON. 2. Chạy `checkInvalidRecords` và `calculatePIHistories`. 3. Kiểm tra log/query. | Dataset nhỏ | Service dùng ClickHouse, output đúng expected. |
| TC_FLAG_003 | Feature Flag | [P1][Conditional] Rollback datasource bằng config không mất data | Có hướng dẫn rollback/toggle | 1. Chạy một batch với flag ON. 2. Rollback về OFF. 3. Chạy lại batch khác. 4. Kiểm tra output. | 2 batch PI khác nhau | Không mất batch, không duplicate ngoài ý muốn, log thể hiện datasource từng batch. |

---

## 12. Test cases bổ sung theo review - Rollback/Fallback

| TEST CASE ID | MODULE/FEATURE | TEST NAME | PRE-CONDITION | TEST STEPS | TEST DATA | EXPECTED RESULT |
|---|---|---|---|---|---|---|
| TC_ROLLBACK_001 | Rollback | [P0][Bổ sung review] Rollback khi parity sai vượt threshold | Dev/PM đã chốt rollback action | 1. Simulate hoặc phát hiện parity sai vượt threshold. 2. Thực hiện rollback theo runbook. 3. Chạy smoke lại datasource fallback. | Dataset parity | Service quay về datasource an toàn trong thời gian đã chốt; không tiếp tục phát sinh output sai. |
| TC_ROLLBACK_002 | Rollback | [P1][Bổ sung review] Rollback khi pusher insert fail hàng loạt | Có runbook pusher rollback | 1. Simulate ClickHouse insert fail hàng loạt. 2. Revert pusher hoặc tắt ClickHouse pusher theo hướng dẫn. 3. Kiểm tra queue/message. | Batch nhỏ | Message không mất, có thể replay sau khi fix; pusher cũ/fallback hoạt động nếu có. |
| TC_ROLLBACK_003 | Rollback | [P1][Bổ sung review] Rollback khi App crash sau remove legacy fields | Có runbook App + data pusher | 1. Deploy version remove fields. 2. Simulate/call App sold histories bị lỗi. 3. Rollback App hoặc restore field theo runbook. | `DS-PI-1Y` | App hoạt động lại, không còn lỗi thiếu field; residual data được kiểm tra. |
| TC_ROLLBACK_004 | Rollback | [P1][Bổ sung review] ClickHouse cluster down có fallback hoặc block an toàn | DevOps confirm kịch bản | 1. Simulate ClickHouse unavailable. 2. Trigger job/query. 3. Kiểm tra behavior. | Dataset nhỏ | Nếu có fallback thì dùng Timescale; nếu không có fallback thì job fail an toàn, không ghi sai/mất message. |

---

## 13. Test cases P2/Conditional - Module 9 Data Quality Diagnostics

| TEST CASE ID | MODULE/FEATURE | TEST NAME | PRE-CONDITION | TEST STEPS | TEST DATA | EXPECTED RESULT |
|---|---|---|---|---|---|---|
| TC_DQ_001 | Conditional Scope | [P2][Conditional] PM/Dev xác nhận Module 9 in-scope hoặc out-of-scope | Có PM/Dev trong NC meeting | 1. Hỏi scope duplicate sold islands. 2. Hỏi scope `findBrokenLastSoldChain`. 3. Hỏi scope rải số từ ClickHouse. | NC-10 | Module 9 được gắn rõ In-scope, Out-of-scope hoặc tạo task riêng. |
| TC_DQ_002 | Duplicate Sold Islands | [P2][Conditional] Phát hiện chuỗi sold trùng đứng gần nhau | Module 9 được confirm in-scope | 1. Chuẩn bị PI có 3 record liên tiếp cùng `total_sold`. 2. Chạy query diagnostic. | PI sold trùng 3 lần | Query trả đúng PI/group có `group_size >= 3`, duration trong benchmark đã chốt. |
| TC_DQ_003 | Broken Last Sold Chain | [P2][Conditional] Phát hiện `last_crawled_date` trỏ sai record liền trước | Module 9 in-scope | 1. Chuẩn bị PI có chain đúng và chain sai. 2. Chạy diagnostic. | PI chain đúng/sai | Output chỉ ra `expected_last_crawled_date`, `expected_last_total_sold`, flag sai đúng. |
| TC_DQ_004 | Rải số từ ClickHouse | [P2][Conditional] Output rải số không lệch business rule hiện tại | Scope rải số được confirm | 1. Chạy phương án rải số từ ClickHouse. 2. So sánh với baseline hiện tại. | Dataset rải số mẫu | Output khớp business rule đã chốt; nếu khác phải có BA/PM approve. |

---

## 14. Phụ lục A - Sample parity SQL cho QA

> Cần chỉnh tên database/schema Timescale theo môi trường thực tế trước khi chạy. Nếu Dev có query chính thức, ưu tiên dùng query Dev bàn giao.

### A.1. Count parity theo tuần

```sql
-- ClickHouse
SELECT
  toYYYYMMDD(toMonday(crawled_date)) AS week_partition,
  count() AS total_rows
FROM eci.product_item_histories
WHERE crawled_date >= toDateTime('2026-01-01 00:00:00')
  AND crawled_date < toDateTime('2026-04-01 00:00:00')
GROUP BY week_partition
ORDER BY week_partition;
```

```sql
-- TimescaleDB/PostgreSQL
SELECT
  date_trunc('week', crawled_date)::date AS week_partition,
  count(*) AS total_rows
FROM product_item_histories
WHERE crawled_date >= '2026-01-01 00:00:00'
  AND crawled_date < '2026-04-01 00:00:00'
GROUP BY week_partition
ORDER BY week_partition;
```

### A.2. Aggregate parity cho một Product Item

```sql
-- ClickHouse
SELECT
  product_item_id,
  SUM(delta_sold) AS sold,
  SUM(gmv) AS gmv,
  AVG(price) AS avg_price,
  AVG(sell_price) AS avg_sell_price,
  AVG(if(price = 0, NULL, (price - sell_price) / price)) AS avg_percent_discount
FROM eci.product_item_histories FINAL
WHERE product_item_id = 'shopee_12350538190'
  AND crawled_date >= toDateTime('2026-01-01 00:00:00')
  AND crawled_date <= toDateTime('2026-03-31 23:59:59')
  AND is_abnormal = 0
  AND delta_sold > 0
GROUP BY product_item_id;
```

```sql
-- TimescaleDB/PostgreSQL
SELECT
  product_item_id,
  SUM(total_sold - last_total_sold) AS sold,
  SUM(CASE
        WHEN (total_sold - last_total_sold) > 0 AND sell_price IS NOT NULL
        THEN (total_sold - last_total_sold) * sell_price
        ELSE 0
      END) AS gmv,
  AVG(price) AS avg_price,
  AVG(sell_price) AS avg_sell_price,
  AVG((price - sell_price) / NULLIF(price, 0)) AS avg_percent_discount
FROM product_item_histories
WHERE product_item_id = 'shopee_12350538190'
  AND crawled_date >= '2026-01-01 00:00:00'
  AND crawled_date <= '2026-03-31 23:59:59'
  AND is_abnormal = false
  AND (total_sold - last_total_sold) > 0
GROUP BY product_item_id;
```

### A.3. Query kiểm tra duplicate theo key ReplacingMergeTree

```sql
-- ClickHouse: kiểm tra duplicate trước khi Merge/FINAL
SELECT
  product_item_id,
  crawled_date,
  count() AS duplicate_count,
  min(updated_date) AS oldest_updated_date,
  max(updated_date) AS newest_updated_date
FROM eci.product_item_histories
WHERE crawled_date >= toDateTime('2026-01-01 00:00:00')
  AND crawled_date < toDateTime('2026-04-01 00:00:00')
GROUP BY product_item_id, crawled_date
HAVING duplicate_count > 1
ORDER BY duplicate_count DESC
LIMIT 100;
```

### A.4. Query kiểm tra `checkInvalidRecords` theo ClickHouse

```sql
SELECT
  product_item_id
FROM eci.product_item_histories FINAL
WHERE crawled_date >= toDateTime('2026-07-06 00:00:00')
  AND crawled_date < toDateTime('2026-07-13 00:00:00')
  AND is_abnormal = 0
  AND delta_sold < 0
  AND product_item_id > ''
GROUP BY product_item_id
ORDER BY product_item_id ASC
LIMIT 500;
```

---

## 15. Phụ lục B - Mapping review gap sang test case

| Gap trong review | Test case đã bổ sung |
|---|---|
| Timeline không khả thi, cần tách đợt execution | `TC_READY_001` đến `TC_READY_006`, readiness theo module |
| Thiếu rollback/fallback strategy | `TC_ROLLBACK_001` đến `TC_ROLLBACK_004` |
| Thiếu sample parity SQL | Phụ lục A.1 đến A.4, `TC_PARITY_001` đến `TC_PARITY_006` |
| Thiếu concurrent behavior | `TC_CONCURRENT_001` đến `TC_CONCURRENT_003` |
| Module 9 scope mơ hồ | `TC_DQ_001` đến `TC_DQ_004` |
| Thiếu feature flag/config toggle verification | `TC_FLAG_001` đến `TC_FLAG_003` |
| Thiếu data freshness SLA verification | `TC_FRESHNESS_001` |
| Performance threshold chưa rõ | `TC_CHKINV_009`, `TC_CALC_013`, `TC_APP_002`, `TC_REALTIME_001` |
| Need Confirms blocking chưa resolve | `TC_READY_001` đến `TC_READY_005` |

---

*Hết bộ Test Cases YNMPECA-9280.*
