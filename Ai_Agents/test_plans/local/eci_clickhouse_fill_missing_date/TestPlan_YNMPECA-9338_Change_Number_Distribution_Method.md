# TEST PLAN
## YNMPECA-9338 — Thay đổi phương án rải số cho ngày thiếu

| Thuộc tính | Nội dung |
|---|---|
| Mã tài liệu | TP-YNMPECA-9338-v1.1 |
| Dự án | YouNet Media — ECI |
| Loại thay đổi | Backend/Data — ClickHouse calculation |
| Ngày lập | 13/08/2026 |
| Trạng thái | Draft — Pending Dev/QC Review |
| Jira | [YNMPECA-9338](https://jira.younetco.com/browse/YNMPECA-9338) |
| Technical Wiki | `[ECI][Clickhouse] - Fill missing date` |
| Technical Wiki tổng quan | `[ECI][Clickhouse] - Fill Missing Dates Product Item Histories` |
| Phạm vi được xác nhận | Chỉ kiểm thử phần **thay đổi phương án rải số/fill missing date** |

> Tài liệu đã được đối chiếu với Jira và hai trang Technical Wiki qua phiên đăng nhập ngày 13/08/2026. Wiki quy định rõ điều kiện được fill và đặc điểm output, nhưng **chưa mô tả công thức phân bổ `sold` cho từng ngày**. Vì vậy tài liệu tách rõ: **Rule chính thức**, **cách hiểu để test**, và **ví dụ minh họa có giả định**. Ví dụ giả định không được dùng làm Acceptance Criteria nếu Dev chưa xác nhận.

---

## 1. MỤC TIÊU & TỔNG QUAN (Introduction & Objective)

### 1.1 Tổng quan

Task `YNMPECA-9338` thay đổi phương án xử lý **rải số cho các ngày bị thiếu dữ liệu** khi tính toán từ lịch sử Product Item trên ClickHouse.

Trước đây script adhoc dựa vào `sold_history` của Product Item trên Solr. Sau khi lịch sử sold được chuyển sang ClickHouse, cần có script thay thế để đọc timeline từ `product_item_histories`, bổ sung những ngày bị miss crawl và lưu lại kết quả trên ClickHouse.

Đây là thay đổi kỹ thuật ở tầng calculation/data. Trọng tâm QA không phải kiểm thử toàn bộ ClickHouse migration hoặc toàn bộ nghiệp vụ Product Management, mà là xác nhận:

- Phương án mới xác định đúng các ngày cần rải số.
- Kết quả rải số tuân thủ đúng business rule hiện hành.
- Tổng số liệu trước và sau khi rải không bị tăng, giảm hoặc thất thoát ngoài mong đợi.
- Kết quả phương án mới tương đương baseline hiện tại đối với các trường hợp không thay đổi business rule.
- Không phát sinh duplicate, ghi đè sai hoặc sai số sau khi chạy lại calculation.

### 1.2 Giải thích nghiệp vụ bằng ngôn ngữ đơn giản

Crawler không phải lúc nào cũng lấy được dữ liệu mỗi ngày. Ví dụ một PI được crawl ngày 01/02 với `total_sold = 100`, sau đó bị block và đến 10/02 mới crawl lại với `total_sold = 120`. Hệ thống biết tổng sold đã tăng 20, nhưng không biết chính xác 20 sản phẩm đó bán vào ngày nào trong khoảng 02/02–09/02.

“Rải số” là thao tác tạo các record kỹ thuật cho những ngày bị thiếu để chuỗi lịch sử không bị đứt. Các record này không phải dữ liệu crawler quan sát trực tiếp; chúng là dữ liệu được suy ra theo thuật toán. Vì vậy bắt buộc phải:

- Chỉ fill khi có đủ mốc dữ liệu đáng tin cậy.
- Đánh dấu rõ record được sinh bằng `crawler_type = FILL_MISSING`.
- Không để dữ liệu buff tham gia rải.
- Không sửa hoặc ghi đè record gốc đã tồn tại.
- Nối lại quan hệ record trước/sau để calculation sold/GMV không bị cộng trùng.

### 1.3 Thuật ngữ QA cần hiểu

| Thuật ngữ | Giải thích | QA dùng để kiểm tra gì? |
|---|---|---|
| Product Item / PI / PID | Một sản phẩm cụ thể trên sàn, được nhận diện bằng `product_item_id`. | Mọi bước chọn timeline, fill và query output phải cô lập đúng PI; không được lấy dữ liệu PI khác làm mốc. |
| Timeline | Danh sách record lịch sử của một PI, sắp xếp theo `crawled_date`. | Kiểm tra thứ tự thời gian, ngày thiếu, record trước/sau và chain sau fill. |
| Record gốc / observed record | Record được crawler thu thập thật, không phải do script fill sinh ra. | Phải được giữ nguyên; append-only không được overwrite/xóa record gốc. |
| Missing date / miss crawl | Ngày không có record hợp lệ vì crawler bị block, lỗi hoặc không crawl được. | Xác định chính xác tập ngày có thể fill, không nhầm ngày đã có dữ liệu. |
| Fill / backfill / rải số | Sinh record kỹ thuật cho ngày thiếu dựa trên các mốc dữ liệu hợp lệ. | Kiểm tra ngày được sinh, giá trị, metadata và tính liên tục. |
| Cận trái | Điểm dữ liệu hợp lệ gần nhất đứng trước khoảng cần fill. Với tuần đầu tiên, có thể là record đầu tiên trong tuần hoặc record gần nhất trước đó. | Xác nhận ngày bắt đầu fill là ngày ngay sau cận trái; không ghi đè cận trái. |
| Cận phải | Điểm dữ liệu hợp lệ nằm sau khoảng thiếu, dùng để xác định khoảng và mức tăng trưởng. | Xác nhận chỉ fill khi có đủ dữ liệu tương lai theo rule; ngày kết thúc fill là ngày ngay trước cận phải. |
| Tuần sau | Tuần kế tiếp chứa dữ liệu đủ để kết luận/fill cho tuần đang xét. | Một tuần chưa có dữ liệu tuần sau thì chưa được fill vội. |
| Ngày cuối tuần theo rule ECI | Trong Wiki task này, “ngày cuối tuần” được định nghĩa là **Thứ Năm, Thứ Sáu hoặc Thứ Bảy**; không đồng nghĩa đơn thuần với Chủ Nhật. | Nếu tuần đã có record vào một trong ba ngày này thì không fill thêm cho tuần đó. |
| Tăng trưởng sold | Chênh lệch sold giữa hai mốc hợp lệ. Wiki ghi điều kiện `số bán > 1`. | Test biên delta 0, 1 và 2 để xác nhận phép so sánh là `> 1`, không phải `>= 1`. |
| Buff data | Dữ liệu sold tăng bất thường/không đại diện cho bán thật, được luồng Remove Buff xác định. | Remove Buff phải chạy trước Fill; record buff không được dùng làm cận hoặc được sao chép vào record fill. |
| Append-only | Chỉ insert record còn thiếu; không update/delete record lịch sử đã có. | Snapshot record gốc trước/sau; count insert đúng bằng số missing date hợp lệ. |
| Chain lịch sử | Quan hệ tuần tự giữa các record qua thời gian, thường thể hiện bằng giá trị/mốc record liền trước như `last_total_sold`, `last_crawled_date` **[tên field cần confirm]**. | Sau fill, mỗi record phải trỏ/đối chiếu đúng record liền trước để delta không bị đứt hoặc tính hai lần. |
| Idempotency | Chạy lại cùng input nhiều lần vẫn cho cùng kết quả. | Lần chạy thứ hai không được sinh thêm record `FILL_MISSING` hoặc thay đổi record gốc. |
| Invariant | Điều kiện luôn phải đúng dù thuật toán chia số chi tiết thay đổi. | Dùng để assert: không overwrite, đúng số ngày, đúng metadata, đúng tổng/chain theo contract. |

### 1.4 Rule chính thức từ Jira/Wiki

#### 1.4.1 Điều kiện được phép fill

| Rule ID | Rule chính thức | Cách QA hiểu và kiểm tra |
|---|---|---|
| FR-01 | Phải có ít nhất 2 điểm dữ liệu. | Timeline chỉ có 0 hoặc 1 observed record thì không được sinh `FILL_MISSING`. |
| FR-02 | `From` và `To` phải đi qua tối thiểu 2 tuần. | Date range nằm trọn trong một tuần phải skip. Cần confirm chính xác cách tính “đi qua 2 tuần” ở biên Chủ Nhật/Thứ Hai. |
| FR-03 | Muốn fill dữ liệu của một tuần phải có dữ liệu của tuần sau. | Không fill tuần cuối chưa có future evidence. Ví dụ có record 01/02 và 10/02 thì có thể fill 02/02–09/02. |
| FR-04 | Tuần đầu tiên chỉ fill từ điểm cận trái. | Nếu cận trái là 31/01 thì trong range từ 01/02 có thể bắt đầu fill 01/02; nếu record đầu tuần là 03/02 thì bắt đầu fill 04/02. |
| FR-05 | Nếu đã có dữ liệu vào ngày cuối tuần thì không fill nữa. Ngày cuối tuần = Thứ Năm, Sáu, Bảy. | Tạo ba case riêng có observed record vào từng ngày Thứ Năm/Thứ Sáu/Thứ Bảy và verify tuần đó không có record fill. |
| FR-06 | Phải có tăng trưởng `sold > 1` giữa hai điểm dữ liệu. | Test delta 0 và 1: không fill; delta 2: đủ điều kiện fill nếu các điều kiện khác đều đúng. |

#### 1.4.2 Yêu cầu output

| Rule ID | Rule chính thức | Cách QA hiểu và kiểm tra |
|---|---|---|
| OR-01 | Record được rải không chứa dữ liệu buff. | Dùng dataset có một điểm buff; verify điểm đó đã bị loại trước khi xác định cận và không xuất hiện trong field của record fill. |
| OR-02 | `crawler_type` của record được rải là `FILL_MISSING`. | Query toàn bộ ngày sinh mới; 100% phải có đúng giá trị này. |
| OR-03 | Sau rải, các record phải liên kết theo thứ tự thời gian để chuỗi lịch sử liên tục. | Sort theo `crawled_date`, đối chiếu field previous của từng record với record ngay trước nó và tính lại delta. |
| OR-04 | Cơ chế append-only: chỉ bổ sung record thiếu, không ảnh hưởng dữ liệu hiện có. | So sánh snapshot/hash observed record trước và sau; không field nào của record gốc thay đổi. |
| OR-05 | Remove Buff bắt buộc chạy trước Fill Missing Date. | Kiểm tra log/pipeline order hoặc tạo dữ liệu buff để chứng minh fill không dùng raw timeline chưa clean. |

### 1.5 Luồng xử lý kỹ thuật và điểm quan sát

```text
1. Duyệt PID từ Solr product_items
   -> filter + cursorMark, rows=1000, sort id asc, optional shard
2. Đọc toàn bộ timeline của batch PID từ ClickHouse
3. Remove Buff
   -> loại dữ liệu không hợp lệ trước khi chọn cận
4. Fill Missing Date
   -> kiểm tra FR-01...FR-06
   -> xác định cận trái, cận phải và danh sách ngày thiếu
   -> sinh record crawler_type=FILL_MISSING
5. Lưu kết quả theo append-only
6. Nối lại chain record theo crawled_date
7. Đối soát output và targeted weekly/monthly calculation
```

| Giai đoạn | Input | Output | Evidence QA cần thu |
|---|---|---|---|
| Duyệt PID | Solr collection/filter/shard | Danh sách `product_item_id` theo batch | CLI parameters, log count/cursor, danh sách PID test. |
| Đọc timeline | Batch PID + From/To | Observed records từ ClickHouse | Query trước chạy, count và thứ tự `crawled_date`. |
| Remove Buff | Raw timeline | Clean timeline | Log record bị loại hoặc diff raw/clean; reason/flag buff **[Need Confirm]**. |
| Xét điều kiện fill | Clean timeline | Eligible/Skipped PI hoặc gap | Log reason cụ thể cho từng FR; không chỉ log chung “skip”. |
| Sinh record | Eligible gap | Các record `FILL_MISSING` | Ngày, sold/total_sold, price fields, crawler_type, timestamps và các field chain. |
| Lưu và nối chain | Observed + fill records | Timeline hoàn chỉnh | Query sau chạy, diff before/after, chain validation và duplicate check. |

### 1.6 Công thức và invariant cần tách biệt

Wiki hiện chưa mô tả công thức chia sold theo ngày. QA không nên mặc định “chia đều” là requirement. Cần phân biệt:

- **Eligibility rules:** FR-01…FR-06 — đã có thể test ngay.
- **Structural output rules:** OR-01…OR-05 — đã có thể test ngay.
- **Value distribution formula:** giá trị sold/total_sold từng ngày, cách làm tròn, remainder, copy price/metadata — cần lấy từ code hoặc Dev xác nhận.

Các invariant nên yêu cầu Dev chốt:

```text
missing_days = các ngày lịch không có observed record trong khoảng đủ điều kiện
inserted_fill_count = số missing_days thực sự được phép fill

observed record trước chạy = observed record sau chạy (append-only)
mọi inserted record.crawler_type = FILL_MISSING
không có hai record fill trùng product_item_id + crawled_date

Nếu sold là cumulative:
  total_sold phải không giảm trên clean timeline (trừ rule abnormal riêng)
  delta của toàn chuỗi sau fill phải khớp chênh lệch hai cận

Nếu sold là daily value:
  tổng sold các ngày fill phải khớp lượng cần phân bổ theo công thức
```

> **[Need Confirm quan trọng]:** Field `sold` trong rule Wiki đang mang nghĩa cumulative sold tại thời điểm crawl hay daily/delta sold được phân bổ. Đây là điểm quyết định cách tính expected và câu query kiểm tra tổng.

### 1.7 Giả định và điểm cần xác nhận

| ID | Nội dung | Trạng thái | Ảnh hưởng QA |
|---|---|---|---|
| NC-01 | Nghiệp vụ phải kế thừa logic hệ thống cũ; cần chốt output mới phải parity 100% hay có thay đổi đã approve. | **[Need Confirm — BA/Dev]** | Quyết định pass/fail khi diff với Solr script cũ. |
| NC-02 | Công thức rải sold chính xác: chia đều, tuyến tính theo cumulative sold, chia theo trọng số hay rule khác. | **[Need Confirm — Dev]** | Blocking expected value từng ngày. |
| NC-03 | Các field được tính/copy cho record fill: `sold`, `total_sold`, `last_total_sold`, price, gmv và metadata nào khác. | **[Need Confirm — Dev]** | Xác định field mapping cần đối soát. |
| NC-04 | Quy tắc làm tròn và phân bổ phần dư cho từng ngày. | **[Need Confirm — BA/Dev]** | Tránh kết luận sai ở case không chia hết. |
| NC-05 | Timezone và quy tắc xác định một “ngày” trên ClickHouse. | **[Need Confirm — Dev]** | Ảnh hưởng gap sát 00:00 và biên kỳ. |
| NC-06 | Record nguồn nào được xem là hợp lệ để làm hai đầu mốc rải; cách xử lý abnormal/null/duplicate. | **[Need Confirm — Dev]** | Ảnh hưởng selection và kết quả rải. |
| NC-07 | Wiki nêu script `scripts/solrmaster/migrate_ECA_PI_missing_dates_clickhouse.js`; cần chốt repo/commit/MR, deployment và câu query chính thức. | **[Need Confirm — Dev]** | Blocking setup và evidence. |
| NC-08 | Task có chạy lại dữ liệu lịch sử hay chỉ áp dụng calculation mới sau deploy. | **[Need Confirm — PM/Dev]** | Xác định phạm vi regression/backfill. |
| NC-09 | “Đi qua tối thiểu 2 tuần” tính theo ISO week, business week nào và From/To inclusive hay exclusive. | **[Need Confirm — Dev]** | Ảnh hưởng boundary case. |
| NC-10 | “Có dữ liệu tuần sau” nghĩa là có bất kỳ observed record hay phải là record thuộc ngày cuối tuần (Thứ Năm/Sáu/Bảy). | **[Need Confirm — BA/Dev]** | Ảnh hưởng eligibility. |
| NC-11 | Rule ví dụ 100→101 đi cùng câu `sold > 1` đang thể hiện case không fill hay chỉ là ví dụ thiếu ký hiệu. | **[Need Confirm — BA]** | Cần test rõ delta=1 và delta=2. |
| NC-12 | Cách nhận biết/loại buff, flag/table trung gian và hành vi nếu tất cả cận tiềm năng đều là buff. | **[Need Confirm — Dev]** | Blocking OR-01/OR-05. |

---

## 2. PHẠM VI KIỂM THỬ (Scope of Testing)

### 2.1 In-Scope

| Module | Phạm vi kiểm thử |
|---|---|
| Nhận diện missing date | Xác định đúng ngày có dữ liệu, ngày thiếu đơn lẻ và chuỗi nhiều ngày thiếu trong date range. |
| Phương án rải số mới | Kiểm tra số được phân bổ cho từng ngày theo công thức Dev/BA chốt. |
| Data conservation | Đối soát tổng số liệu trước/sau khi rải; không mất hoặc tự sinh thêm số ngoài rule. |
| Parity với phương án cũ | Chạy cùng dataset bằng phương án cũ và mới, so sánh output nếu business rule không đổi. |
| Date boundaries | Khoảng thiếu nằm trong cùng tuần/tháng và cắt qua cuối tuần, cuối tháng, cuối năm. |
| Rounding/remainder | Giá trị chia hết, không chia hết, phần dư và sai số decimal theo rule được chốt. |
| Input data edge cases | Không thiếu ngày, thiếu một ngày, thiếu liên tiếp, nhiều “đảo” thiếu ngày, một đầu mốc, sold bằng 0, sold không đổi, sold giảm/abnormal, null, duplicate, nhiều record cùng ngày. |
| Idempotency | Chạy lại cùng input không làm tăng số, nhân đôi record hoặc thay đổi output ngoài mong đợi. |
| Targeted downstream regression | Kiểm tra tổng weekly/monthly hoặc output downstream trực tiếp nhận kết quả rải số không bị lệch. |
| Log/error handling | Query/job lỗi phải log đủ PI/date range, fail an toàn và không ghi output dở dang như kết quả hoàn chỉnh. |
| Performance cơ bản | So sánh thời gian chạy, memory/CPU và số record xử lý với baseline trên dataset đại diện. |

### 2.2 Out-of-Scope

| Hạng mục | Lý do |
|---|---|
| Toàn bộ migration Timescale sang ClickHouse | Thuộc nhóm task setup/migration khác; task này chỉ đổi phương án rải số. |
| Kiểm thử toàn bộ schema, cluster, replication và sharding ClickHouse | Không phải phần code thay đổi của `YNMPECA-9338`. |
| Toàn bộ luồng `checkInvalidRecords`/detect abnormal | Chỉ dùng abnormal như input edge case nếu có ảnh hưởng đến rải số. |
| Full regression calculation weekly/monthly | Chỉ kiểm tra targeted regression trên output trực tiếp bị ảnh hưởng. |
| Pusher, realtime sync và Product Management UI | Không test end-to-end toàn hệ thống nếu task không sửa các thành phần này. |
| Tracking Product Title Change | Không liên quan đến thay đổi phương án rải số. |
| Backfill toàn bộ Production | Chỉ thực hiện khi có plan, script, rollback và phê duyệt riêng. |
| Performance production-scale | Chưa có SLA trong dữ liệu đầu vào; chỉ benchmark tương đối hoặc theo ngưỡng Dev cung cấp. |

---

## 3. CHIẾN LƯỢC KIỂM THỬ (Test Strategy & Approach)

### 3.1 Functional Testing — Trọng tâm chính

| Nhóm dữ liệu | Mục đích kiểm thử | Expected ở cấp Test Plan |
|---|---|---|
| Không có ngày thiếu | Kiểm tra phương án mới không can thiệp sai. | Output giữ nguyên; không sinh record rải ngoài mong đợi. |
| Thiếu đúng 1 ngày giữa hai mốc | Happy path nhỏ nhất. | Ngày thiếu được tạo/tính đúng theo công thức đã chốt. |
| Thiếu nhiều ngày liên tiếp | Kiểm tra phân bổ qua một gap dài. | Đủ ngày, đúng thứ tự, đúng từng giá trị và đúng tổng. |
| Có nhiều gap tách biệt | Kiểm tra xử lý nhiều đoạn trong cùng PI/date range. | Mỗi gap được xử lý độc lập, không cross-range. |
| Gap qua cuối tuần/tháng/năm | Boundary date và downstream period. | Không mất/trùng ngày; tổng của từng kỳ đúng theo rule. |
| Chỉ có một đầu mốc | Không đủ dữ liệu để tính khoảng rải. | Skip/fallback/error theo rule Dev chốt; không tự suy diễn số. |
| Delta chia hết | Baseline đơn giản. | Phân bổ chính xác, không có remainder. |
| Delta không chia hết | Kiểm tra rounding/remainder. | Tổng sau làm tròn vẫn khớp invariant được chốt. |
| Delta bằng 0 | Không có tăng trưởng giữa hai mốc. | Không phát sinh sold/GMV dương ngoài mong đợi. |
| Delta âm/record abnormal | Negative path. | Loại trừ hoặc xử lý theo rule detect-invalid được chốt; không rải số âm ngoài ý muốn. |
| Null/duplicate/multiple records per day | Data quality. | Chọn đúng record đại diện hoặc fail/skip an toàn theo contract. |
| Chạy lại cùng input | Idempotency. | Record/count/value không đổi sau lần chạy lại. |

#### 3.1.1 Decision table — Khi nào được fill?

Khi execute, QA nên tách từng điều kiện thành một cột. Một PI/gap chỉ được fill khi **tất cả điều kiện bắt buộc** đều đạt.

| Case | ≥ 2 điểm | From–To ≥ 2 tuần | Có dữ liệu tuần sau | Tuần đã có Thu/Năm-Sáu-Bảy | Tăng sold > 1 | Kỳ vọng |
|---|---:|---:|---:|---:|---:|---|
| DT-01 | Không | Có | Không/Không quan trọng | Không | Không/Không quan trọng | Không fill — thiếu mốc dữ liệu. |
| DT-02 | Có | Không | Có | Không | Có | Không fill — date range chưa đi qua 2 tuần. |
| DT-03 | Có | Có | Không | Không | Có | Không fill tuần chưa có dữ liệu tuần sau. |
| DT-04 | Có | Có | Có | Có | Có | Không fill tuần đã có observed record ngày Thứ Năm/Sáu/Bảy. |
| DT-05 | Có | Có | Có | Không | Không, delta = 0 | Không fill — không tăng trưởng. |
| DT-06 | Có | Có | Có | Không | Không, delta = 1 | Không fill nếu rule chính xác là `> 1`. |
| DT-07 | Có | Có | Có | Không | Có, delta = 2 | Fill các ngày hợp lệ nếu không vướng rule khác. |
| DT-08 | Có | Có | Có | Không | Có | Fill — happy path đầy đủ điều kiện. |
| DT-09 | Có nhưng một mốc là buff | Có | Có | Không | Có | Remove Buff trước; đánh giá lại điều kiện bằng clean timeline. |
| DT-10 | Có | Có | Có | Không | Có, nhưng ngày thiếu đã có `FILL_MISSING` | Không insert trùng khi rerun. |

> Cách đọc DT-04: chỉ cần có observed record vào **một** trong ba ngày cuối tuần theo định nghĩa của Wiki là điều kiện “không fill tuần đó” được kích hoạt. QA phải test riêng Thứ Năm, Thứ Sáu và Thứ Bảy để tránh code chỉ handle một ngày.

#### 3.1.2 Ví dụ chính thức từ Wiki và cách kiểm tra

| Ví dụ | Input | Kết quả theo Wiki | QA kiểm tra |
|---|---|---|---|
| EX-01 — Chỉ một điểm | From 01/02/2026, To 16/02/2026; chỉ có record 13/02 | Không fill. | Count record `FILL_MISSING` mới = 0; observed record 13/02 không đổi; log reason = insufficient data points hoặc tương đương. |
| EX-02 — Chưa đủ hai tuần | From 01/02/2026, To 07/02/2026 | Không fill. | Không insert; không có write query; log skip vì date range. |
| EX-03 — Đã có ngày cuối tuần | From 01/02/2026, To 16/02/2026; có record 01/02 và 13/02 (Thứ Sáu) | Không fill tuần đã có dữ liệu cuối tuần. | Không sinh record cho tuần tương ứng; không nhầm 13/02 là cận phải để fill hàng loạt. |
| EX-04 — Có dữ liệu tuần sau | From 01/02/2026, To 16/02/2026; có record 01/02 và 10/02 | Fill 02/02–09/02. | Tập ngày insert đúng 8 ngày, không insert 01/02 hoặc 10/02; metadata/giá trị/chain đúng. |
| EX-05 — Gap dài | From 01/02/2026, To 21/02/2026; có record 01/02 và 18/02 | Fill 02/02–17/02. | Tập ngày insert đúng 16 ngày; không bỏ ngày khi qua biên tuần; không insert trùng cận. |
| EX-06 — Cận trái ngoài range | From 01/02/2026, To 16/02/2026; record gần nhất là 31/01 | Tuần đầu có thể bắt đầu fill từ 01/02 nếu đủ các điều kiện còn lại. | Query phải đọc được cận trái trước From; ngày đầu insert là From, không phải 02/02. |
| EX-07 — Cận trái trong tuần đầu | From 01/02/2026, To 16/02/2026; record đầu là 03/02 | Bắt đầu fill từ 04/02 nếu đủ điều kiện. | Không backfill 01/02–02/02 vì chưa có cận trái; không overwrite 03/02. |

#### 3.1.3 Ví dụ cách tính tay — chỉ để hướng dẫn QA

Wiki chưa công bố công thức phân bổ. Ví dụ dưới đây minh họa **cách lập bảng expected** nếu Dev xác nhận thuật toán là nội suy/chia đều cumulative sold. Không xem các con số này là requirement trước khi Dev xác nhận NC-02/NC-04.

Giả sử:

- Cận trái 01/02: `total_sold = 100`.
- Cận phải 05/02: `total_sold = 110`.
- Các ngày cần fill: 02/02, 03/02, 04/02.
- Có 4 bước thời gian từ 01/02 đến 05/02.
- Tăng trưởng tổng là `110 - 100 = 10`.

Nếu thuật toán chia đều delta theo 4 bước, QA có thể lập expected như sau:

| Ngày | Loại record | Cumulative sold minh họa | Delta so với record trước |
|---|---|---:|---:|
| 01/02 | Observed — cận trái | 100 | — |
| 02/02 | `FILL_MISSING` | 102 hoặc 103 | Theo rounding rule |
| 03/02 | `FILL_MISSING` | 105 | Theo rounding rule |
| 04/02 | `FILL_MISSING` | 107 hoặc 108 | Theo rounding rule |
| 05/02 | Observed — cận phải | 110 | Phần còn lại |

Điểm QA cần bắt không phải chỉ là một giá trị riêng lẻ, mà là:

- Chuỗi cumulative sold không giảm.
- Record cuối vẫn đúng 110.
- Tổng các delta từ sau 01/02 đến 05/02 bằng đúng 10.
- Remainder được phân bổ theo đúng rule và deterministic: chạy lại vẫn cho cùng kết quả.
- Hai observed records 01/02 và 05/02 không bị thay đổi.

Nếu code dùng công thức khác, giữ nguyên phương pháp kiểm tra nhưng thay cột expected bằng output tính theo công thức chính thức.

#### 3.1.4 Bộ test boundary tối thiểu

| Boundary | Data đề xuất | Lỗi thường bắt được |
|---|---|---|
| Số điểm dữ liệu | 0, 1, 2, 3 records | Kiểm tra sai `>= 2`, null timeline, nhầm fill với một cận. |
| Độ dài range | 1 tuần; vừa chạm tuần thứ hai; 2 tuần đầy đủ; >2 tuần | Off-by-one hoặc tính tuần sai. |
| Sold growth | -1, 0, 1, 2, giá trị lớn | Nhầm `> 1` thành `>= 1`; rải sold âm; overflow. |
| Cuối tuần ECI | Record vào Thứ Tư, Năm, Sáu, Bảy, Chủ Nhật | Chỉ code Thứ Bảy hoặc dùng định nghĩa weekend thông thường. |
| Vị trí cận trái | Trước From; đúng From; giữa tuần đầu; không tồn tại | Fill dư trước cận, bỏ ngày đầu hợp lệ. |
| Vị trí cận phải | Tuần kế tiếp; đúng To; sau To; không tồn tại | Đọc dư ngoài range hoặc fill tuần cuối thiếu evidence. |
| Gap | 1, 2, 7, 8, 16 ngày; nhiều gap | Bỏ ngày, trùng ngày, cross-gap. |
| Biên kỳ | Qua Chủ Nhật/Thứ Hai; cuối tháng; 31/12→01/01; tháng nhuận | Sai calendar, partition hoặc shard/week-year. |
| Rerun | Lần 1, lần 2, chạy overlap range | Duplicate `FILL_MISSING`, double calculation. |

Phương pháp áp dụng:

- **Golden Dataset:** Dev/BA cung cấp một số input nhỏ có expected từng ngày tính tay được.
- **A/B Parity:** chạy phương án cũ và mới trên cùng snapshot ClickHouse, so sánh theo `product_item_id + date`.
- **Invariant Testing:** kiểm tra count ngày, tổng sold/GMV và tổng delta theo rule đã chốt.
- **Boundary Value Analysis:** 0/1/2/n ngày thiếu; đầu/cuối date range; cuối tuần/tháng/năm.
- **Property-based/Data-driven:** sinh nhiều độ dài gap và delta khác nhau để bắt lỗi rounding hoặc off-by-one.

### 3.2 Cách test thực tế từng bước

#### Bước 1 — Chốt test oracle trước khi chạy

`Test oracle` là nguồn dùng để kết luận Actual đúng hay sai. Với task này, thứ tự ưu tiên là:

1. Business rule và ví dụ đã được BA/Dev approve.
2. Golden dataset có expected tính tay theo công thức Dev xác nhận.
3. Output script Solr cũ trên cùng input nếu requirement yêu cầu kế thừa hoàn toàn.
4. Invariant độc lập với công thức: eligibility, count ngày, append-only, metadata, no buff, chain, idempotency.

Không dùng output code mới làm expected của chính code mới. Nếu chưa có công thức, QA vẫn test được rule chọn/skip và cấu trúc output, nhưng case value distribution phải ghi `Blocked — NC-02/NC-04`.

#### Bước 2 — Chọn và cô lập PI test

- Chọn PI không bị job/crawler khác update trong thời gian test, hoặc dùng PID synthetic được Dev hỗ trợ.
- Ghi lại `product_item_id`, platform/source, From/To, shard và timezone.
- Query tất cả record trong range và ít nhất một khoảng trước/sau range để tìm cận thật.
- Export snapshot trước test: row count, ngày, sold/total_sold, crawler_type, abnormal/buff flag, price và chain fields.

#### Bước 3 — Vẽ timeline trước khi chạy

QA nên tạo bảng đơn giản:

| Date | Có observed record? | Buff? | Sold/Total sold | Vai trò dự kiến |
|---|---:|---:|---:|---|
| 01/02 | Có | Không | 100 | Cận trái |
| 02/02 | Không | — | — | Missing — dự kiến fill |
| 03/02 | Không | — | — | Missing — dự kiến fill |
| 04/02 | Không | — | — | Missing — dự kiến fill |
| 05/02 | Có | Không | 110 | Cận phải |

Từ bảng này, QA xác định trước:

- Có đủ 2 điểm hay không.
- From–To có qua tối thiểu 2 tuần hay không.
- Tuần cần fill có future data hay không.
- Có record Thứ Năm/Sáu/Bảy hay không.
- Delta sold có lớn hơn 1 hay không.
- Danh sách ngày dự kiến insert.

#### Bước 4 — Chạy dry-run trước

Wiki cung cấp CLI dạng:

```bash
NODE_ENV=local_testing node scripts/solrmaster/migrate_ECA_PI_missing_dates_clickhouse.js \
  --collection=product_items \
  --filter='<filter PI/source đã cô lập>' \
  --from_date=YYYYMMDD \
  --to_date=YYYYMMDD \
  --datasetId=eci_testing \
  --tableId=product_item_histories_distributed \
  --destination_source=product_item_histories_distributed \
  --configKey=clickhouse_eci \
  --allow_write_source=0 \
  --shard=<test-shard>
```

`allow_write_source=0` ở đây là khuyến nghị dry-run cần Dev xác nhận script hỗ trợ đúng semantics. QA kiểm tra log/dataset output dự kiến trước khi bật ghi thật. Không chạy filter rộng hoặc Production trong giai đoạn functional test.

#### Bước 5 — Chạy write có kiểm soát

- Chỉ đổi sang `--allow_write_source=1` sau khi dry-run đúng PID, range và count.
- Lưu run ID, commit/build, CLI parameters, start/end time và output log.
- Theo dõi số PID đọc, số PID eligible/skipped, số missing date và số row insert.
- Nếu output count khác dự kiến, dừng mở rộng batch và điều tra trước.

#### Bước 6 — Query và đối soát sau chạy

Đối chiếu theo bốn lớp:

1. **Eligibility:** PI đáng lẽ skip có thực sự không insert không?
2. **Date coverage:** danh sách ngày insert có đúng chính xác không?
3. **Field correctness:** `crawler_type`, sold/total_sold, price/metadata, buff flag và chain fields có đúng không?
4. **Aggregate/invariant:** tổng delta, weekly/monthly và observed records có giữ nguyên không?

#### Bước 7 — Kiểm tra chain lịch sử

Sort timeline tăng dần theo `crawled_date`. Với từng record từ record thứ hai:

- `last_crawled_date` phải bằng `crawled_date` của record liền trước **nếu field này thuộc schema**.
- `last_total_sold` phải bằng `total_sold` của record liền trước **nếu field này thuộc schema**.
- `delta_sold` phải khớp công thức giữa record hiện tại và record trước.
- Không có gap còn lại trong đoạn đã được xác định eligible.
- Không có hai record cùng natural key sau dedup/merge.

Đặc biệt kiểm tra record observed cận phải: sau khi insert các record fill, chain của cận phải có thể phải được nối với record fill cuối cùng thay vì cận trái ban đầu. Vì hệ thống được mô tả append-only, Dev cần giải thích cơ chế “nối lại” mà không update observed record; đây là một điểm technical cần evidence.

#### Bước 8 — Rerun và overlap range

- Chạy lại cùng command lần hai.
- Chạy một range nhỏ nằm trong range cũ.
- Chạy một range lớn overlap range cũ.
- Kỳ vọng: không insert trùng, không đổi giá trị deterministic, không cộng lại sold/GMV.

#### Bước 9 — Targeted downstream regression

- Chạy calculation weekly/monthly cho một PI đã fill.
- So sánh tổng kỳ chứa missing dates trước/sau hoặc với baseline đã duyệt.
- Kiểm tra record fill không bị xem như observed/buff hoặc bị cộng hai lần.
- Không cần regression toàn bộ UI/Pusher ngoài đường dữ liệu trực tiếp bị ảnh hưởng.

### 3.3 API/Integration Testing

Chỉ thực hiện ở các điểm tích hợp trực tiếp với calculation thay đổi:

- Job/service đọc đúng records trong ClickHouse theo PI và date range.
- Query không bỏ sót hoặc lấy dư ngày ở biên `start_date`/`end_date`.
- Output ghi đúng table/queue/collection và đúng khóa định danh, không duplicate.
- Weekly/monthly calculation trực tiếp nhận dữ liệu rải có tổng khớp với nguồn.
- Khi ClickHouse timeout/query fail, job retry hoặc fail theo contract và không commit partial output sai.

### 3.4 Data Migration / Data Sync

- Không thực hiện migration tổng thể trong scope này.
- Nếu có re-calculate lịch sử, QA đối chiếu count và aggregate trước/sau theo PI, ngày, tuần và tháng.
- Lưu snapshot baseline trước khi chạy phương án mới để có thể parity và rollback verification.
- Kiểm tra chạy lại cùng date range không duplicate và không thay đổi kết quả đã ổn định.
- Mọi chênh lệch với baseline phải được phân loại: thay đổi business rule đã approve, bug của phương án mới hoặc data nguồn khác nhau.

### 3.5 Non-functional Testing

| Loại | Cách đánh giá |
|---|---|
| Performance | Benchmark phương án cũ/mới trên cùng dataset: duration, rows read/written, peak memory, CPU và error rate. Pass threshold **[Need Confirm]**. |
| Stability | Chạy nhiều PI, gap dài và nhiều date range liên tiếp; job không crash/OOM và không treo batch. |
| Reliability | Retry/re-run không duplicate, không double-distribute và không để trạng thái partial khó phục hồi. |
| Observability | Log có job/run ID, PI hoặc batch, date range, số missing dates, record xử lý, success/fail và duration; không log dữ liệu nhạy cảm không cần thiết. |

### 3.6 UI/UX, Security và Compatibility

- **UI/UX Testing:** Không áp dụng vì scope không thay đổi UI.
- **Security chuyên sâu:** Không áp dụng; chỉ kiểm tra parameter/date range không làm query lỗi hoặc lộ stack trace.
- **Browser/Mobile Compatibility:** Không áp dụng; đây là backend calculation trên ClickHouse.

### 3.7 Query mẫu để QA đối soát ClickHouse

> Các query dưới đây là template. Thay `<database>`, `<table>`, PID và timestamp theo môi trường. Xóa field không tồn tại hoặc bổ sung field theo schema Dev bàn giao. Không chạy `ALTER`, `DELETE`, `TRUNCATE` hoặc `OPTIMIZE` trên Production để test task này.

#### 3.7.1 Lấy timeline trước/sau khi chạy

```sql
SELECT
    product_item_id,
    crawled_date,
    crawler_type,
    total_sold,
    last_total_sold,
    last_crawled_date,
    delta_sold,
    sell_price,
    gmv,
    is_abnormal,
    updated_date
FROM <database>.<table>
WHERE product_item_id = '<test_product_item_id>'
  AND crawled_date >= toDateTime('<from_boundary>')
  AND crawled_date <= toDateTime('<to_boundary>')
ORDER BY crawled_date ASC, updated_date ASC;
```

Nên mở rộng `from_boundary` sớm hơn From và `to_boundary` muộn hơn To để nhìn thấy cận trái/cận phải thật. Không chỉ query đúng range CLI vì có thể bỏ mất record làm mốc.

#### 3.7.2 Liệt kê riêng record do script fill

```sql
SELECT
    product_item_id,
    toDate(crawled_date) AS fill_date,
    crawled_date,
    crawler_type,
    total_sold,
    last_total_sold,
    last_crawled_date,
    delta_sold,
    sell_price,
    gmv
FROM <database>.<table>
WHERE product_item_id = '<test_product_item_id>'
  AND crawler_type = 'FILL_MISSING'
  AND crawled_date >= toDateTime('<from_boundary>')
  AND crawled_date <= toDateTime('<to_boundary>')
ORDER BY crawled_date ASC;
```

Đối chiếu `fill_date` với danh sách ngày dự kiến. Một diff tốt nên có ba tập:

```text
Expected only = ngày phải fill nhưng không có Actual      -> Missing output
Actual only   = ngày hệ thống fill nhưng Expected không có -> Over-fill
Intersection  = ngày đúng vị trí, tiếp tục compare fields  -> Value/metadata check
```

#### 3.7.3 Phát hiện record fill trùng ngày

```sql
SELECT
    product_item_id,
    toDate(crawled_date) AS fill_date,
    count() AS record_count
FROM <database>.<table>
WHERE product_item_id = '<test_product_item_id>'
  AND crawler_type = 'FILL_MISSING'
  AND crawled_date >= toDateTime('<from_boundary>')
  AND crawled_date <= toDateTime('<to_boundary>')
GROUP BY product_item_id, fill_date
HAVING record_count > 1
ORDER BY fill_date;
```

Nếu hệ thống hợp lệ cho phép nhiều record fill trong một ngày thì natural key phải được Dev cung cấp và query này cần đổi. Theo cách Wiki mô tả “fill ngày thiếu”, mặc định QA kỳ vọng tối đa một fill record/ngày **[Need Confirm]**.

#### 3.7.4 Kiểm tra chain bằng window function

```sql
SELECT
    product_item_id,
    crawled_date,
    crawler_type,
    total_sold,
    last_total_sold,
    last_crawled_date,
    lagInFrame(total_sold, 1) OVER (
        PARTITION BY product_item_id
        ORDER BY crawled_date
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS expected_last_total_sold,
    lagInFrame(crawled_date, 1) OVER (
        PARTITION BY product_item_id
        ORDER BY crawled_date
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS expected_last_crawled_date
FROM <database>.<table>
WHERE product_item_id = '<test_product_item_id>'
  AND crawled_date >= toDateTime('<from_boundary>')
  AND crawled_date <= toDateTime('<to_boundary>')
ORDER BY crawled_date;
```

Sau đó compare:

- `last_total_sold` với `expected_last_total_sold`.
- `last_crawled_date` với `expected_last_crawled_date`.
- `delta_sold` với `total_sold - expected_last_total_sold` nếu đây là công thức schema chính thức.

Lưu ý record đầu tiên trong vùng query không nhất thiết là record đầu timeline; muốn kiểm tra chain của nó phải query thêm record ngay trước `from_boundary`.

#### 3.7.5 Kiểm tra observed record có bị thay đổi

Trước khi chạy, export toàn bộ observed record của PID trong phạm vi thành evidence. Sau chạy, chạy lại đúng query với điều kiện:

```sql
AND crawler_type != 'FILL_MISSING'
```

Compare theo khóa record chính thức và toàn bộ business fields. Kỳ vọng:

- Count observed record không đổi.
- Khóa và `crawled_date` không đổi.
- Sold/price/source fields không đổi.
- Nếu một số chain fields của observed record được phép thay đổi để nối lại timeline, Dev phải mô tả rõ ngoại lệ; nếu không có mô tả, mọi thay đổi observed record là nghi vấn vi phạm append-only.

#### 3.7.6 Kiểm tra tổng delta/sold trong khoảng hai cận

```sql
SELECT
    product_item_id,
    sum(delta_sold) AS distributed_delta,
    sum(gmv) AS distributed_gmv,
    countIf(crawler_type = 'FILL_MISSING') AS fill_count
FROM <database>.<table>
WHERE product_item_id = '<test_product_item_id>'
  AND crawled_date > toDateTime('<left_boundary_time>')
  AND crawled_date <= toDateTime('<right_boundary_time>')
GROUP BY product_item_id;
```

`distributed_delta` phải được so với invariant/công thức Dev xác nhận. Không mặc định nó luôn bằng `right.total_sold - left.total_sold` nếu hệ thống có rule abnormal, remove buff hoặc tính delta khác.

### 3.8 Cách đọc kết quả và khoanh vùng lỗi

| Hiện tượng Actual | Kiểm tra đầu tiên | Loại lỗi có khả năng |
|---|---|---|
| PI không được xử lý | Solr filter/shard/cursor có lấy PID không? | Stage Duyệt PID hoặc CLI config. |
| Có PID nhưng timeline rỗng/thiếu | From/To, timezone, ClickHouse table và query batch. | Stage Đọc Timeline. |
| PI đáng lẽ fill nhưng bị skip | Log FR-01…FR-06; clean timeline sau Remove Buff. | Eligibility rule hoặc remove buff. |
| PI đáng lẽ skip nhưng vẫn fill | Condition `>=2`, `>1`, weekend hoặc future-week. | Over-fill/business rule bug — ưu tiên cao. |
| Ngày fill thiếu một ngày đầu/cuối | Compare danh sách expected–actual; kiểm tra inclusive/exclusive. | Off-by-one/date boundary. |
| Fill cả ngày đã có observed record | Query observed + fill theo ngày. | Vi phạm append-only/dedup. |
| `crawler_type` khác `FILL_MISSING` | Field mapping output. | Metadata/contract bug. |
| Sold đúng tổng nhưng sai từng ngày | Công thức/rounding/remainder. | Value distribution bug; cần golden expected. |
| Sold/GMV tổng bị tăng gấp đôi | Rerun, duplicate key, downstream cộng cả old/new record. | Idempotency/double-count bug — data correctness P0. |
| Chain sai sau fill | Window query `lagInFrame`; record cận phải. | Re-link history bug. |
| Record fill chứa buff | Log Remove Buff và field nguồn copy. | Pipeline order/data cleaning bug. |
| Lần 2 sinh thêm record | Count `FILL_MISSING` theo run/range. | Idempotency bug. |
| Chỉ sai khi qua tháng/năm | Partition, timezone, week calculation, shard format. | Calendar/partition boundary bug. |
| Job báo success nhưng insert thiếu | Compare planned count, inserted count và ClickHouse count. | Partial write/observability bug. |

### 3.9 Evidence tối thiểu cho một test case

Một test case chỉ được đánh dấu Pass/Fail khi lưu đủ:

- Build/commit hoặc image tag của script.
- CLI parameters đã che thông tin nhạy cảm; đặc biệt filter, From/To, shard và `allow_write_source`.
- Timeline trước chạy và bảng ngày expected.
- Log cho biết PID được chọn, điều kiện fill/skip và số record dự kiến/đã insert.
- Timeline sau chạy và query riêng `FILL_MISSING`.
- Diff observed records trước/sau.
- Kết quả chain/invariant và targeted weekly/monthly nếu case yêu cầu.
- Kết quả rerun đối với case idempotency.

---

## 4. MÔI TRƯỜNG KIỂM THỬ (Test Environment)

| Môi trường | Mục đích |
|---|---|
| Local/Dev | Dev verify query/công thức trên golden dataset nhỏ. |
| Testing | QA functional, parity, boundary, idempotency và error handling. |
| Staging | Chạy dataset gần thực tế, targeted downstream regression và benchmark. |
| Production | Chỉ smoke/monitor sau deploy hoặc controlled backfill có approval; không thử nghiệm dữ liệu tùy ý. |

Thành phần cần có:

- ClickHouse database/table chứa `product_item_histories` và quyền query read-only cho QA.
- Script `scripts/solrmaster/migrate_ECA_PI_missing_dates_clickhouse.js`; cần Dev cung cấp repo/commit và deployment/job thực thi.
- Cơ chế chạy phương án cũ hoặc snapshot output baseline để A/B comparison.
- Output table/queue/collection và weekly/monthly destination trực tiếp liên quan **[Need Confirm]**.
- Application/job log, ClickHouse query log và dashboard resource.
- Script/query reset dữ liệu test hoặc namespace/PI test riêng để chạy lại an toàn.

Test data tối thiểu gồm 10–20 PI bao phủ toàn bộ matrix tại mục 3.1, trong đó có PI gap dài, nhiều gap, crossing period, rounding và data abnormal/null/duplicate. Mỗi PI phải có bảng timeline before/expected riêng; không dùng một PI đang bị crawler update liên tục cho golden test.

---

## 5. TIÊU CHÍ ĐÁNH GIÁ (Entry & Exit Criteria)

### 5.1 Entry Criteria

- BA/Dev xác nhận cách hiểu FR-02, FR-03, FR-05, FR-06; đặc biệt định nghĩa tuần, future data, ngày cuối tuần và `sold > 1`.
- Dev xác nhận rõ công thức rải, field áp dụng, rounding/remainder và core invariants.
- Có MR/build/deployment chứa đúng thay đổi `YNMPECA-9338`, đã pass Unit Test/code review.
- Dev cung cấp repo/commit của script, bảng input/output, date boundary, timezone và cách trigger.
- Có golden dataset kèm expected hoặc baseline phương án cũ được xác nhận là đúng.
- Testing/Staging có dữ liệu đại diện và QA có quyền query/log cần thiết.
- Có cách cô lập/reset dữ liệu để kiểm tra idempotency và rerun.
- Cơ chế dry-run và ý nghĩa `allow_write_source` đã được Dev xác nhận; không thử semantics của cờ bằng dữ liệu thật.
- Remove Buff đã sẵn sàng và có evidence chứng minh chạy trước Fill Missing Date.

### 5.2 Exit Criteria

- 100% test case P0/P1 của phương án rải số đã execute và pass.
- Không còn bug Critical/High; không còn bug Medium ảnh hưởng data correctness chưa được chấp thuận.
- Kết quả golden dataset khớp 100% expected đã duyệt.
- Parity với baseline đạt ngưỡng đã chốt; mọi chênh lệch đều có giải thích và approval.
- Không vi phạm invariant về tổng số liệu, count ngày và khóa dữ liệu.
- Rerun cùng input không duplicate/double-distribute và cho kết quả ổn định.
- Targeted weekly/monthly regression pass trên các kỳ có gap và crossing boundary.
- Benchmark đạt SLA hoặc không regression vượt ngưỡng Dev/PM phê duyệt.
- Test Summary Report và residual risks đã được QA/Dev/PM review.

---

## 6. RỦI RO & HƯỚNG GIẢI QUYẾT (Risks & Mitigations)

| ID | Rủi ro | Tác động | Mitigation |
|---|---|---|---|
| R-01 | Chưa có công thức rải và expected định lượng. | QA không thể kết luận đúng/sai chính xác. | Xem NC-01…NC-04 là Entry Criteria blocking; yêu cầu golden dataset có tính tay. |
| R-02 | Off-by-one ở start/end date hoặc khi qua biên kỳ. | Thiếu/trùng ngày, lệch weekly/monthly. | Test gap ở đầu/cuối range và crossing tuần/tháng/năm; đối soát count ngày. |
| R-03 | Rounding hoặc phân bổ remainder làm sai tổng. | Sold/GMV bị tăng hoặc thất thoát. | Chốt precision; test delta không chia hết; kiểm tra invariant tổng trước/sau. |
| R-04 | Duplicate/multiple records per day trên ClickHouse làm rải hai lần. | Double count và sai aggregate. | Chốt record representative/dedup strategy; test trước và sau ClickHouse merge nếu liên quan. |
| R-05 | Rerun/backfill không idempotent. | Dữ liệu lịch sử bị cộng lặp hoặc khó rollback. | Snapshot trước chạy; dùng deterministic key/upsert; test rerun cùng range nhiều lần. |
| R-06 | Phương án mới nhanh hơn nhưng output lệch baseline. | Data report sai dù performance tốt. | Data correctness là gate P0; chỉ benchmark sau khi golden/parity pass. |
| R-07 | Data abnormal/null bị đưa vào làm mốc rải. | Sinh chuỗi số không hợp lệ. | Xác nhận input eligibility; tạo dataset negative; log rõ record bị skip. |
| R-08 | Dataset Testing quá nhỏ so với Production. | Không phát hiện OOM/query chậm/gap dài. | Staging benchmark với volume và phân bố gap gần thực tế; theo dõi ClickHouse query metrics. |
| R-09 | Code hiểu “weekend” là Thứ Bảy/Chủ Nhật thay vì định nghĩa ECI Thứ Năm/Sáu/Bảy. | Over-fill tuần đã đủ dữ liệu hoặc skip sai. | Test riêng observed record vào từng Thứ Năm, Sáu, Bảy và Chủ Nhật; assert theo FR-05. |
| R-10 | Fill chạy trước Remove Buff hoặc dùng mốc buff. | Phân bổ dựa trên sold giả, làm sai toàn chuỗi. | Gate pipeline order; log clean timeline; test một cận buff và cả hai cận buff. |
| R-11 | Append-only mâu thuẫn với yêu cầu nối lại chain nếu chain fields nằm trên observed record cận phải. | Chain sai hoặc observed record bị update trái requirement. | Dev mô tả data model/re-link mechanism; snapshot field-level trước/sau; thống nhất ngoại lệ trước sign-off. |
| R-12 | Wiki đang có trạng thái `PROCESSING` và một số ví dụ chưa ghi rõ pass/fail. | QA hiểu khác Dev, expected thay đổi trong lúc test. | Chốt version Wiki/AC dùng để test; freeze golden cases; cập nhật Change Log khi rule đổi. |
| R-13 | PID được duyệt từ Solr nhưng timeline nằm ở shard/table ClickHouse khác hoặc thiếu data. | Skip nhầm PI đủ điều kiện hoặc partial coverage. | Reconcile PID count Solr→ClickHouse; log PID không có timeline; test nhiều source/shard có kiểm soát. |

---

## 7. TÀI LIỆU BÀN GIAO (Deliverables)

| Deliverable | Nội dung |
|---|---|
| Test Plan | Scope hẹp cho thay đổi phương án rải số của `YNMPECA-9338`. |
| Test Cases | Golden, parity, boundary, rounding, abnormal, idempotency, error và performance cases. |
| Test Data Manifest | PI ID, input records, date range, expected missing dates và expected output từng ngày. |
| Glossary & Rule Matrix | Thuật ngữ, FR-01…FR-06, OR-01…OR-05 và decision table fill/skip. |
| Parity Report | Diff phương án cũ/mới theo PI/date và aggregate tuần/tháng. |
| Before/After Reconciliation | Snapshot observed/fill records, date diff, chain diff và invariant results. |
| Bug Reports | Steps, input snapshot, query/job version, actual/expected, output diff và log evidence. |
| Performance Benchmark | Duration, rows read/written, peak memory/CPU và comparison với baseline. |
| Test Summary Report | Coverage, pass/fail/block, defect, chênh lệch được approve và release recommendation. |

---

## Checklist thông tin Dev cần bàn giao trước khi QA execute

- [ ] Công thức/phương án rải số mới và ví dụ tính tay.
- [ ] Business invariant và ngưỡng parity chấp nhận.
- [ ] Field được rải, kiểu dữ liệu, precision và rounding/remainder rule.
- [ ] Xác nhận `sold > 1` là delta hay giá trị tuyệt đối; test biên 0/1/2.
- [ ] Định nghĩa tuần, “đi qua hai tuần”, future-week data và From/To inclusive/exclusive.
- [ ] Quy tắc start/end date, timezone, ngày cuối tuần ECI và record representative.
- [ ] Repo/commit script, job/deployment, input/output table và cách trigger.
- [ ] Xác nhận semantics `allow_write_source=0/1` và dry-run output.
- [ ] Baseline phương án cũ hoặc snapshot output đáng tin cậy.
- [ ] Rule/flag Remove Buff và bằng chứng pipeline order trước Fill.
- [ ] Quy tắc abnormal/null/duplicate/out-of-order/multiple records per day.
- [ ] Cơ chế append-only và cách nối lại chain, đặc biệt observed record cận phải.
- [ ] Cách rerun, rollback và phạm vi dữ liệu lịch sử bị ảnh hưởng.
- [ ] Version Wiki/AC được freeze để QA sign-off.
