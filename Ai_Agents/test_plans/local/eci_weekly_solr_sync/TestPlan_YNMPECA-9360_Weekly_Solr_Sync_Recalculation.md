# TEST PLAN
## [ClickHouseDB] Đồng bộ Weekly Sales xuống Solr sau khi re-adjust
### Feature: Detect Invalid Record và xóa Weekly Sales không còn hợp lệ

| Thông tin | Giá trị |
|---|---|
| **Mã tài liệu** | TP-YNMPECA-9360-v1.2 |
| **Dự án** | YNMP - Ecommerce Intelligence (ECI) |
| **Ngày tạo** | 06/08/2026 |
| **Ngày cập nhật** | 06/08/2026 |
| **Người tạo** | QA Team (AI-assisted) |
| **Phiên bản** | 1.2 - Diễn giải đơn giản cho QA và các stakeholder |
| **Trạng thái** | Bản nháp - Chờ QA/Dev/BA review và sign-off |
| **Jira chính** | https://jira.younetco.com/browse/YNMPECA-9360 |
| **Jira Testing** | `YNMPECA-9361` |
| **Jira Wiki/Test Cases** | `YNMPECA-9362` |
| **Dev Document chính** | `Document/ECI/dev_doc_clickhouse_sync.md` |
| **Jira attachment** | https://jira.younetco.com/secure/attachment/295732/qc-weekly-solr-sync.md |
| **Timeline từ Jira** | Wiki/Test cases: 06/08/2026; Done Testing: 10/08/2026; Done Staging: 12/08/2026 |

---

## 1. MỤC TIÊU & TỔNG QUAN (Introduction & Objective)

### 1.1 Đọc nhanh trong 1 phút

Tính năng này xử lý dữ liệu bán hàng theo tuần bị sai sau khi hệ thống phát hiện lịch sử `total_sold` bất thường.

QA chỉ cần nhớ bốn kết quả chính:

| Tình huống sau khi tính lại tuần trước | Hệ thống phải làm gì? |
|---|---|
| Vẫn còn dữ liệu hợp lệ và tổng `sold=0`, `gmv=0` | **Xóa** document Weekly Sales trên Solr |
| Tất cả dữ liệu của tuần đều bị đánh dấu bất thường, không còn dữ liệu hợp lệ | **Xóa** document Weekly Sales trên Solr |
| Vẫn còn dữ liệu hợp lệ và ít nhất một trong hai giá trị `sold`, `gmv` khác 0 | **Cập nhật** document Weekly Sales, không xóa |
| Job không xác định được `prevWeek` | **Không ghi gì xuống Solr**; phần cập nhật ClickHouse vẫn chạy |

Điểm nguy hiểm nhất là xóa sai document. Vì vậy, QA phải chứng minh được hệ thống xóa **đúng Product Item và đúng tuần**, đồng thời giữ nguyên các document không thuộc phạm vi xử lý.

Nếu chỉ cần review nhanh, nên đọc theo thứ tự: **1.1 Đọc nhanh → 1.6 Hai trường hợp xóa → 4.3 Test data → 5.2 Exit Criteria**.

### 1.2 Bối cảnh

Job `jobs/detect-invalid-record` quét dữ liệu lịch sử Product Item trong ClickHouse để tìm các PI có `total_sold` giảm bất thường theo thời gian. Những record này được đánh dấu `is_abnormal`. Hệ thống loại chúng khỏi dữ liệu hợp lệ, tính lại các field liên quan và tính lại Weekly Sales của tuần trước (`prevWeek`).

Kết quả tính toán bằng ClickHouse đã được team xác nhận khớp với TimeScale. Phần QA cần tập trung là đồng bộ kết quả tính lại xuống Solr collection `product_item_weekly`. Đặc biệt, có hai trường hợp phải **xóa hẳn Weekly Sales document** thay vì cập nhật về `sold=0`, `gmv=0` hoặc giữ lại dữ liệu cũ.

### 1.3 Giải thích thuật ngữ

| Thuật ngữ | Giải thích dễ hiểu |
|---|---|
| **PI - Product Item** | Một sản phẩm cụ thể của một shop/nguồn dữ liệu. |
| **WS - Weekly Sales** | Kết quả bán hàng tổng hợp theo tuần, lưu ở Solr collection `product_item_weekly`. |
| **`prevWeek`** | Tuần trước mà job cần tính lại. Giá trị này được suy ra từ `dateRun`. |
| **Record abnormal** | Dòng lịch sử bị xem là sai vì `total_sold` ở quá khứ cao hơn một mốc mới hơn, thể hiện số bán bị giảm bất thường theo thời gian. |
| **Record valid/normal** | Dòng lịch sử còn hợp lệ sau khi loại các dòng abnormal. |
| **Candidate PI** | PI có dấu hiệu bất thường và được chọn để job kiểm tra. |
| **Preloader** | Bước lấy danh sách Candidate PI từ ClickHouse. |
| **Puller** | Bước lấy đầy đủ lịch sử của các Candidate PI để tính lại. |
| **Builder** | Phần code phát hiện abnormal, tính lại Weekly Sales và quyết định update hay delete Solr. |
| **Pusher** | Phần ghi kết quả abnormal và các field đã tính lại về ClickHouse. |
| **`piWeeklyDocs`** | Danh sách Weekly Sales document được tính lại từ những ngày còn hợp lệ. |
| **`docsToUpdate`** | Danh sách document cần cập nhật lên Solr. |
| **`idsToDelete`** | Danh sách ID document cần xóa khỏi Solr. |
| **Chunk** | Một nhóm nhỏ ID gửi trong một request xóa. Hệ thống giới hạn tối đa 100 ID/nhóm. |
| **Idempotent** | Chạy lại cùng dữ liệu không tạo thêm tác động sai hoặc làm kết quả cuối thay đổi. |

### 1.4 Luồng xử lý đã xác nhận

```text
Worker tạo job `detect-invalid-record`
  ├─ Chỉ tạo vào cuối tuần hoặc cuối tháng
  └─ Mỗi lượt xử lý tối đa 500 PI
          │
          ▼
Bước 1 - Lấy danh sách PI cần kiểm tra (Preloader)
  Điều kiện ClickHouse: is_abnormal = 0 AND delta_sold < 0
          │
          ▼
Bước 2 - Lấy lịch sử của các PI (Puller)
  Khoảng thời gian: từ prevWeek đến curWeek
  Điều kiện: is_abnormal = 0 AND total_sold > 0
          │
          ▼
Bước 3 - Phân tích và tính lại (Builder.process())
  1. Sắp xếp lịch sử từ ngày mới nhất về ngày cũ nhất
  2. Xác định các record bất thường → recordsToMarkAbnormal
  3. Loại record bất thường khỏi tập dữ liệu hợp lệ
  4. Tính lại last_total_sold và delta_sold
  5. Tính lại sold/gmv của prevWeek → piWeeklyDocs
          │
          ├─ Trường hợp 1: sold == 0 VÀ gmv == 0 ────────────┐
          │                                                   │
          ├─ Trường hợp 2: có record bị đánh abnormal         │
          │  trong prevWeek VÀ không còn ngày hợp lệ ─────────┤
          │                                                   ▼
          │                                        idsToDelete → Xóa khỏi Solr theo ID
          │
          └─ Các document còn lại → docsToUpdate → Cập nhật Solr

Bước 4 - Ghi is_abnormal / last_total_sold / last_crawled_date về ClickHouse (Pusher)
```

### 1.5 Cách hệ thống xác định một record là abnormal

Lịch sử của từng PI được sắp xếp từ ngày mới nhất về ngày cũ nhất. Hệ thống ghi nhớ giá trị `total_sold` nhỏ nhất đã gặp, gọi là `minAllowedSold`.

Nếu một ngày cũ hơn có `total_sold` lớn hơn `minAllowedSold`, điều đó có nghĩa số bán đã giảm ở một ngày mới hơn. Ngày cũ hơn này bị đánh dấu `is_abnormal=true`.

Ví dụ:

| Ngày | `total_sold` | Cách hiểu | Kết quả |
|---|---:|---|---|
| 22/06 | 90 | Ngày mới nhất, đặt `minAllowedSold=90` | Hợp lệ |
| 17/06 | 200 | Ngày cũ có 200, nhưng ngày mới chỉ còn 90; số bán đã giảm 200 → 90 | Record 17/06 bị đánh abnormal |

Ngược lại, chuỗi `100 → 120 → 150` khi đi từ ngày cũ tới ngày mới là tăng bình thường và không bị đánh abnormal.

Các điều kiện data quan trọng:

- Bước chọn PI cần kiểm tra: `is_abnormal=0 AND delta_sold<0`.
- Bước lấy lịch sử: `is_abnormal=0 AND total_sold>0`, trong khoảng từ `prevWeek` đến `curWeek`.
- Record đã có `is_abnormal=1` từ lần chạy trước không được kéo lại ở lần sau.

### 1.6 Hai trường hợp phải xóa dữ liệu Solr

| Rule | Điều kiện | Hiểu đơn giản | Kết quả |
|---|---|---|---|
| **BR-01 - Tổng tuần bằng 0** | PI vẫn còn ít nhất một record hợp lệ trong `prevWeek`, nhưng sau khi tính lại thì `sold == 0 AND gmv == 0` | Vẫn có dữ liệu đầu vào hợp lệ, nhưng tuần đó không còn phát sinh sold và GMV | Xóa document WS; không giữ document có giá trị 0 |
| **BR-02 - Không còn ngày hợp lệ** | Tất cả record của PI trong `prevWeek` bị đánh abnormal ở lần chạy hiện tại | Không còn dữ liệu sạch để tạo Weekly Sales document | Tự tạo đúng Solr ID rồi xóa document WS cũ |

Các nhánh đã được Dev document xác nhận:

- Nếu chỉ `sold=0` nhưng `gmv!=0`, hoặc ngược lại, **không thuộc BR-01**; document vẫn được cập nhật.
- PI vốn không có record nào trong `prevWeek` không thuộc BR-02 và không có thao tác Solr.
- PI chỉ có một phần record abnormal, vẫn còn record hợp lệ và tổng cuối > 0 thì cập nhật document, không xóa.
- Nếu `prevWeek` rỗng, hệ thống không cập nhật hoặc xóa Solr; Pusher vẫn ghi kết quả về ClickHouse.

### 1.7 Cách hệ thống tạo ID và xóa Solr

| Thành phần | Quy tắc kỹ thuật |
|---|---|
| Collection | `product_item_weekly`, lấy từ config `detectInvalid.weeklyCollection` |
| Kỳ dữ liệu (period) | Lấy tuần và năm từ `prevWeek.weekEnd`, format `WW-YYYY`, ví dụ `25-2026` |
| Document ID | Ghép tuần + năm + Product Item ID: `W{weekNumber}{year}_{product_item_id}`. Ví dụ: `W252026_PI-1001` |
| Cách xóa | Xóa bằng query chứa danh sách ID chính xác |
| Query mẫu | `id:"W252026_PI-1001" OR id:"W252026_PI-2002" OR ...` |
| Giới hạn mỗi request | Tối đa 100 ID. Nếu có 101 ID, hệ thống phải gửi ít nhất 2 request. |
| Giới hạn mỗi lượt job | 500 PI. Mỗi lượt xử lý và ghi Solr độc lập. |

### 1.8 QA cần chứng minh điều gì?

- Xác nhận hệ thống chọn đúng PI cần kiểm tra, phát hiện đúng record abnormal và tính lại đúng các field liên quan.
- Xác nhận chính xác BR-01 và BR-02, bao gồm các nhánh gần biên không được xóa.
- Đảm bảo build đúng `period`, đúng Solr ID và xóa đủ document khi danh sách vượt 100 ID.
- Đảm bảo một document không bị đưa nhầm vào cả danh sách cập nhật và danh sách xóa.
- Đảm bảo chỉ PI thực sự thay đổi mới được ghi Solr.
- Đảm bảo hệ thống ghi đúng `is_abnormal`, `last_total_sold`, `last_crawled_date` xuống ClickHouse.
- Đảm bảo không ghi Solr khi `prevWeek` rỗng.
- Đảm bảo chạy lại không xử lý lặp record đã abnormal.
- Đảm bảo có thể đối chiếu số PI đầu vào với số document cập nhật, xóa hoặc không cần xử lý trong từng lượt 500 PI.

---

## 2. PHẠM VI KIỂM THỬ (Scope of Testing)

### 2.1 In-Scope

#### Module 1: Lịch chạy và vòng đời từng lượt xử lý

| STT | Hạng mục | Nội dung kiểm thử |
|---:|---|---|
| 1 | Chạy vào cuối tuần | Job chỉ được tạo khi `dateRun - 2 ngày` là thứ Bảy theo `isEndOfWeek` |
| 2 | Chạy vào cuối tháng | Job được tạo đúng vào cuối tháng theo `isEndOfMonth` |
| 3 | Ngày không hợp lệ | Không tạo job mới nếu ngày chạy không thỏa điều kiện cuối tuần hoặc cuối tháng |
| 4 | `prevWeek` tồn tại | Job thực hiện calculate và sync Solr theo flow |
| 5 | `prevWeek` rỗng | Không cập nhật hoặc xóa Solr; ClickHouse vẫn được ghi |
| 6 | Tối đa 500 PI/lượt | Nếu có nhiều hơn 500 PI, job phải chia thành nhiều lượt và mỗi lượt ghi Solr độc lập |
| 7 | Xử lý hết danh sách | Job tiếp tục cho đến khi hết PI cần kiểm tra, không bỏ sót hoặc lặp vô hạn |

Ví dụ về điều kiện cuối tuần: nếu `dateRun` là thứ Hai và `dateRun - 2 ngày` rơi vào thứ Bảy, `isEndOfWeek` được xem là đúng. Timezone chính xác vẫn cần Dev xác nhận tại NC-01.

#### Module 2: Chọn PI, lấy lịch sử và phát hiện bất thường

| STT | Hạng mục | Nội dung kiểm thử |
|---:|---|---|
| 8 | Điều kiện chọn PI | Chỉ chọn PI có `is_abnormal=0 AND delta_sold<0` |
| 9 | Điều kiện lấy lịch sử | Chỉ lấy record `is_abnormal=0 AND total_sold>0` từ `prevWeek` đến `curWeek` |
| 10 | Thứ tự xử lý | Lịch sử phải được xử lý từ ngày mới nhất về ngày cũ nhất (`crawled_date DESC`) |
| 11 | Dữ liệu tăng bình thường | `total_sold` không giảm thì không đánh dấu abnormal |
| 12 | Dữ liệu giảm bất thường | Record cũ hơn có `total_sold > minAllowedSold` phải bị đánh dấu abnormal |
| 13 | Nhiều điểm bất thường | Đánh dấu đủ tất cả record vi phạm trong cùng một PI |
| 14 | Record abnormal từ lần trước | Record đã có `is_abnormal=1` không được lấy lại để xử lý |
| 15 | Tính lại chuỗi dữ liệu | `last_total_sold`, `last_crawled_date`, `delta_sold` đúng sau khi loại abnormal |
| 16 | Chỉ ghi PI có thay đổi | PI không thay đổi không được update/delete Solr |

#### Module 3: BR-01 - Tổng sold và GMV của tuần bằng 0

| STT | Hạng mục | Nội dung kiểm thử |
|---:|---|---|
| 17 | `sold=0 AND gmv=0` | Document WS bị xóa, không update về 0 |
| 18 | Cả `sold` và `gmv` đều lớn hơn 0 | Cập nhật document, không xóa |
| 19 | Chỉ `sold=0` | Cập nhật document, không xóa |
| 20 | Chỉ `gmv=0` | Cập nhật document, không xóa |
| 21 | Vẫn còn record hợp lệ | BR-01 chỉ áp dụng khi PI vẫn tạo được một document trong `piWeeklyDocs` |
| 22 | Không vi phạm quy tắc tăng | Nếu tổng tuần bằng 0 nhưng history không giảm bất thường thì không set `is_abnormal=true` |

#### Module 4: BR-02 - Không còn record hợp lệ trong `prevWeek`

| STT | Hạng mục | Nội dung kiểm thử |
|---:|---|---|
| 23 | Tuần chỉ có một record | Record duy nhất bị abnormal; WS document bị xóa |
| 24 | Tất cả record đều abnormal | Xóa WS document của `prevWeek` |
| 25 | Chỉ một phần record abnormal | Nếu vẫn còn record hợp lệ thì không xóa qua BR-02 |
| 26 | Vốn không có dữ liệu trong tuần | Không xóa vì đây không phải trường hợp dữ liệu bị loại do abnormal |
| 27 | Abnormal ở tuần khác | Chỉ tạo/xóa ID của đúng `prevWeek` |
| 28 | Abnormal trong lần chạy hiện tại | BR-02 chỉ xét `recordsToMarkAbnormal` của lần chạy này |

#### Module 5: Quy tắc cập nhật và xóa Solr

| STT | Hạng mục | Nội dung kiểm thử |
|---:|---|---|
| 29 | Period format | `prevWeek.weekEnd` được format đúng `WW-YYYY` |
| 30 | ID format | ID đúng `W{weekNumber}{year}_{product_item_id}` |
| 31 | Query xóa theo đúng ID | Query có đúng dấu quote, toán tử `OR` và không match document khác |
| 32 | Tối đa 100 ID/request | Không request nào chứa quá 100 ID |
| 33 | Từ 101 ID trở lên | Danh sách được chia thành nhiều request và xóa đủ tất cả ID |
| 34 | Cùng lượt có cả update và delete | Mỗi document đi đúng một nhánh: cập nhật hoặc xóa |
| 35 | Không có PI thay đổi | Không gọi update/delete Solr; log thể hiện đã bỏ qua |
| 36 | Dữ liệu đã hiển thị trạng thái mới | Sau thời gian commit của Solr, query trả đúng `numFound` |

#### Module 6: Ghi ClickHouse, chạy lại và kiểm tra log

| STT | Hạng mục | Nội dung kiểm thử |
|---:|---|---|
| 37 | Ghi cờ abnormal | Các record trong `recordsToMarkAbnormal` được ghi `is_abnormal=true` |
| 38 | Ghi các field đã tính lại | Ghi đúng `last_total_sold` và `last_crawled_date` |
| 39 | Chạy lại cùng dữ liệu | PI đã abnormal không được lấy lại; không lặp update/delete Solr |
| 40 | Log cập nhật Solr | Log `[Solr write]` có collection/docs/changedPiCount |
| 41 | Log xóa Solr | Log `[Solr delete]` có collection/docs/period |
| 42 | Log ghi ClickHouse | Log `[CH write] applyHistoryInserts ...` xuất hiện đúng |
| 43 | Đối chiếu từng lượt 500 PI | Tổng PI đầu vào phải giải thích được bằng số PI update, delete hoặc không cần xử lý |
| 44 | Xử lý khi có lỗi | Solr/ClickHouse lỗi phải có log; trạng thái job và retry theo contract **(Need Confirm)** |

### 2.2 Out-of-Scope

| Hạng mục | Lý do |
|---|---|
| Đối chiếu lại toàn bộ ClickHouse với TimeScale | Team đã xác nhận hai bên tính giống nhau; QA chỉ dùng một số mẫu để kiểm tra luồng tính lại và đồng bộ |
| Monthly Sales collection | Scope chỉ ghi/xóa `product_item_weekly`; end-of-month là điều kiện tạo job, không phải sync monthly |
| Các Solr collection khác | Config/Dev document chỉ nêu `detectInvalid.weeklyCollection` |
| Thiết kế lại UI/UX | Thay đổi nằm ở backend job và data sync; chỉ smoke test màn hình/report liên quan nếu có |
| Full migration/backfill lịch sử | Không được mô tả trong requirement |
| Cross-browser/Mobile | Không có Web/Mobile UI change |
| Security/Penetration chuyên sâu | Không có auth/permission/public endpoint change; chỉ smoke log không lộ secret |
| Thay đổi thuật toán phát hiện abnormal | QA kiểm tra code theo thiết kế hiện tại, không thiết kế lại thuật toán nghiệp vụ |

---

## 3. CHIẾN LƯỢC KIỂM THỬ (Test Strategy & Approach)

### 3.1 Functional Testing

| Nhóm test | Kỹ thuật | Mục tiêu |
|---|---|---|
| Ngày chạy và ngày cắt dữ liệu | Phân tích giá trị biên | Cuối tuần, cuối tháng, ngày thường và trường hợp `prevWeek` rỗng |
| Điều kiện chọn dữ liệu | Bảng quyết định | Kết hợp các giá trị `is_abnormal`, `delta_sold`, `total_sold` và khoảng ngày |
| Thuật toán phát hiện abnormal | Kiểm thử theo bộ dữ liệu | Chuỗi sold tăng, giữ nguyên, giảm một lần hoặc giảm nhiều lần |
| BR-01/BR-02 | Bảng quyết định và chuyển trạng thái | Chứng minh hệ thống chọn đúng hành động: cập nhật, xóa hoặc không làm gì |
| Period và document ID | Phân vùng tương đương và giá trị biên | Tuần thường, W1, W52/W53, chuyển năm và Product Item ID hợp lệ |
| Chia nhóm ID khi xóa | Phân tích giá trị biên | 0, 1, 99, 100, 101 và tối đa 500 ID cần xóa trong một lượt |
| Chạy lại | Kiểm thử tính idempotent | Lần hai không lấy lại PI đã abnormal và không lặp thao tác Solr |

#### Decision table trọng tâm

| ID | Còn record hợp lệ trong `prevWeek`? | Có record bị đánh abnormal ở lần chạy này? | Weekly sold | Weekly gmv | Solr phải làm gì? |
|---|---|---|---:|---:|---|
| DT-01 | Có | Có hoặc không | 0 | 0 | Xóa theo BR-01 |
| DT-02 | Có | Có hoặc không | >0 | >0 | Cập nhật |
| DT-03 | Có | Có hoặc không | 0 | Khác 0 | Cập nhật, không xóa |
| DT-04 | Có | Có hoặc không | Khác 0 | 0 | Cập nhật, không xóa |
| DT-05 | Không | Có; toàn bộ record tuần bị abnormal | Không có | Không có | Xóa theo BR-02 |
| DT-06 | Không | Không; PI vốn không có dữ liệu trong tuần | Không có | Không có | Không thao tác Solr |
| DT-07 | Có | Chỉ một phần record bị abnormal | >0 | >0 | Cập nhật, không xóa theo BR-02 |
| DT-08 | Bất kỳ | Bất kỳ | Bất kỳ | Bất kỳ | Nếu `prevWeek` rỗng: không thao tác Solr |

### 3.2 API/Integration Testing

| Điểm tích hợp | Cách kiểm tra | Bằng chứng cần lưu |
|---|---|---|
| Worker → `detect-invalid-record` | Chạy job với `dateRun` do QA kiểm soát | Dữ liệu job, `prevWeek`, `curWeek`, số thứ tự lượt xử lý |
| Bước chọn PI → ClickHouse | Query đúng điều kiện chọn PI | Danh sách PI được chọn và kết quả query |
| Bước lấy lịch sử → ClickHouse | Query toàn bộ history từ `prevWeek` đến `curWeek` | Các record trước khi xử lý |
| Builder → Solr update | Kiểm tra danh sách `docsToUpdate` | Log `[Solr write]`, dữ liệu Solr trước và sau |
| Builder → Solr delete | Kiểm tra `idsToDelete` và từng nhóm tối đa 100 ID | Log `[Solr delete]`, kết quả `numFound` |
| Pusher → ClickHouse | Kiểm tra abnormal và các field được tính lại | Log `[CH write]` và kết quả SQL sau xử lý |

### 3.3 Data Sync Testing

| Hạng mục | Cách kiểm tra |
|---|---|
| ClickHouse trước và sau | Lưu `total_sold`, `last_total_sold`, `last_crawled_date`, `delta_sold`, `is_abnormal`, `gmv` |
| Solr trước và sau | Query đúng document ID của WS trước và sau khi chạy job |
| Đối chiếu số lượng | Mọi PI có thay đổi phải được giải thích là đã cập nhật, đã xóa hoặc không tạo được weekly document |
| Bảo vệ dữ liệu ngoài phạm vi | Query cùng PI ở tuần khác và PI khác trong cùng period để chắc chắn không bị thay đổi |
| Kiểm tra xóa đủ | Với 101+ ID, tất cả ID mong đợi đều phải có `numFound=0` sau khi xóa |

### 3.4 Non-functional Testing

| Loại | Áp dụng | Phạm vi |
|---|---|---|
| Độ tin cậy | Có | Chạy lại, record đã abnormal từ trước và lỗi xảy ra giữa chừng **(Need Confirm retry policy)** |
| Hiệu năng | Có, phạm vi mục tiêu | Lượt 500 PI và nhóm xóa 100 ID; đo thời gian/lỗi, ngưỡng **Need Confirm** |
| Khả năng xử lý ở giới hạn | Có | 500 PI với nhiều request update/delete trong cùng lượt |
| Khả năng theo dõi qua log | Có | Kiểm tra ba nhóm log trong Dev document và khả năng đối chiếu số liệu |
| Xử lý đồng thời | Theo rủi ro | Hai job/lượt xử lý trùng PI nếu scheduler/worker cho phép **(Need Confirm)** |
| Bảo mật | Smoke test | Không ghi credential/secret vào log; không có thay đổi tính năng bảo mật |
| Tương thích thiết bị/trình duyệt | Không | Không có thay đổi UI, thiết bị hoặc trình duyệt |

### 3.5 Test case coverage ước tính

| Nhóm | Số TC ước tính | Priority |
|---|---:|---|
| Ngày chạy, ngày cắt dữ liệu và `prevWeek` | 6-8 | P0/P1 |
| Chọn PI, lấy history và phát hiện abnormal | 10-12 | P0 |
| BR-01 | 5-7 | P0 |
| BR-02 | 5-7 | P0 |
| Solr period, ID, update, delete và chia nhóm ID | 9-12 | P0 |
| Ghi ClickHouse, chạy lại và log | 6-8 | P1 |
| Xử lý lỗi, hiệu năng và chạy đồng thời | 4-7 | P1 |
| **Tổng** | **45-61** | |

---

## 4. MÔI TRƯỜNG KIỂM THỬ (Test Environment)

### 4.1 Môi trường

| Môi trường | Mục đích | Điều kiện |
|---|---|---|
| Local/Dev độc lập | Chuẩn bị dữ liệu, kiểm tra thuật toán và mô phỏng lỗi | Có thể chạy job với `dateRun` tùy chỉnh |
| Testing | Full functional/integration/data sync | Job, ClickHouse, Solr và log access sẵn sàng |
| Staging | Chạy lại P0 và kiểm tra hồi quy bản sắp release | Cấu hình gần Production |
| Production | Theo dõi sau release | Chỉ đọc/kiểm tra mẫu; không tạo hoặc xóa test data nếu chưa được duyệt |

### 4.2 Thành phần cần thiết

| Thành phần | Chi tiết |
|---|---|
| Job | `jobs/detect-invalid-record` |
| Builder | `detect-invalid.builder.ts` |
| ClickHouse source/verify table | `product_item_histories_distributed` theo query verify trong Dev document |
| Solr collection | `product_item_weekly` / config `detectInvalid.weeklyCollection` |
| Batch config | `batchSize=500` PI |
| Nhóm ID trong mỗi request xóa | Tối đa 100 ID chính xác/request |
| Logs | Job logs chứa `[Solr write]`, `[Solr delete]`, `[CH write]` |

Không yêu cầu browser/device matrix. Browser chỉ dùng để mở Solr Admin hoặc log dashboard nếu cần.

### 4.3 Test data cần chuẩn bị

| Data ID | Dữ liệu đầu vào | Kết quả mong đợi |
|---|---|---|
| TD-01 / TC1 | `PI-1001` vẫn có record hợp lệ trong `prevWeek`; sau khi tính lại, tổng `sold=0`, `gmv=0` | Xóa WS document. Không set abnormal nếu chuỗi `total_sold` không giảm bất thường. |
| TD-02 / TC2 | `PI-1002` có 5/7 ngày `delta_sold=0`, hai ngày còn lại `delta_sold>0` | WS document vẫn tồn tại và được cập nhật `sold/gmv>0`. |
| TD-03 / TC3 | `PI-2002`: ngày 17/06 có `total_sold=200`; ngày 22/06 có `total_sold=90` | Record 17/06 bị đánh abnormal; xóa WS document của tuần N-1. |
| TD-04 / TC4 | `PI-2003`: tất cả record của tuần N-1 đều cao hơn mốc nhỏ nhất ở tuần N | Tất cả record tuần N-1 bị abnormal; xóa WS document tuần N-1. |
| TD-05 / TC5 | `PI-2004`: chỉ một phần record tuần N-1 bị abnormal, phần còn lại vẫn hợp lệ | Không xóa theo BR-02; cập nhật WS nếu tổng cuối lớn hơn 0. |
| TD-06 / TC6 | `PI-9999` không có record bị abnormal và không có field nào thay đổi | Không gọi update hoặc delete Solr cho PI này. |
| TD-07 / TC7 | Job chạy ở window cuối tháng khiến `prevWeek` rỗng | Không update/delete Solr; ClickHouse vẫn được cập nhật. |
| TD-08 / TC8 | Chạy lại TD-03 mà không thay đổi dữ liệu | Không lấy lại `PI-2002`; không lặp thao tác Solr. |
| TD-09 / TC9 | Có ít nhất 101 PI cùng cần xóa trong một lượt | Chia thành nhiều request, mỗi request tối đa 100 ID; xóa đủ tất cả ID. |
| TD-10 | Weekly result có `sold=0`, `gmv!=0` | Cập nhật WS document, không xóa. |
| TD-11 | Weekly result có `sold!=0`, `gmv=0` | Cập nhật WS document, không xóa. |
| TD-12 | PI vốn không có record nào trong `prevWeek` | Không thuộc BR-01/BR-02; không thao tác Solr. |
| TD-13 | Một lượt đủ 500 PI, gồm PI cần update, delete và không cần thao tác | Xử lý đủ 500 PI và đối chiếu được kết quả của từng nhóm. |

### 4.4 Query verify mẫu

ClickHouse:

```sql
SELECT product_item_id, crawled_date, total_sold, last_total_sold,
       last_crawled_date, delta_sold, is_abnormal, gmv, updated_date
FROM product_item_histories_distributed
WHERE product_item_id IN ('PI-1001', 'PI-2002')
ORDER BY product_item_id, crawled_date;
```

Solr:

```text
GET /solr/product_item_weekly/select?q=id:"W252026_PI-1001"
GET /solr/product_item_weekly/select?q=id:"W252026_PI-2002"
```

Document đã xóa phải trả `numFound: 0`, nghĩa là Solr không còn tìm thấy document. Document được cập nhật phải vẫn tồn tại và có `sold`/`gmv` đúng với kết quả job vừa tính lại.

---

## 5. TIÊU CHÍ ĐÁNH GIÁ (Entry & Exit Criteria)

### 5.1 Entry Criteria

| # | Tiêu chí | Mức độ |
|---:|---|---|
| 1 | Code/MR `YNMPECA-9360` đã review, merge và deploy đúng build lên Testing | Bắt buộc |
| 2 | Job `detect-invalid-record` chạy được với `dateRun` và bộ dữ liệu do QA kiểm soát | Bắt buộc |
| 3 | Config `detectInvalid.weeklyCollection` trỏ đúng `product_item_weekly` Testing | Bắt buộc |
| 4 | `batchSize=500` và delete chunk 100 đúng build cần test | Bắt buộc |
| 5 | QA có quyền chuẩn bị/query dữ liệu ClickHouse và query Solr trước/sau khi chạy | Bắt buộc |
| 6 | TD-01 đến TD-13 đã chuẩn bị và không trùng dữ liệu nghiệp vụ đang sử dụng | Bắt buộc |
| 7 | Log `[Solr write]`, `[Solr delete]`, `[CH write]` có thể truy cập | Bắt buộc |
| 8 | Có kết quả chuẩn để đối chiếu cho period, document ID và số liệu tính lại | Bắt buộc |
| 9 | Solr/ClickHouse không có incident môi trường tại thời điểm execution | Bắt buộc |
| 10 | Dev đã xác nhận cách xử lý lỗi/retry trước khi QA mô phỏng lỗi | Bắt buộc cho recovery testing |

### 5.2 Exit Criteria

| # | Tiêu chí | Mức độ |
|---:|---|---|
| 1 | 100% P0 executed và pass sau retest | Bắt buộc |
| 2 | Ít nhất 95% test P0+P1 đã chạy; case bị chặn có người xử lý và đánh giá rủi ro rõ ràng | Bắt buộc |
| 3 | Không còn bug Critical/High về xóa sai, không xóa dữ liệu WS cũ, sai ClickHouse hoặc bỏ sót nhóm ID | Bắt buộc |
| 4 | BR-01 và BR-02 pass trên Testing và Staging | Bắt buộc |
| 5 | Các nhánh `sold/gmv` chỉ một giá trị bằng 0 pass: update, không delete | Bắt buộc |
| 6 | `prevWeek` rỗng pass: no Solr action, CH write vẫn đúng | Bắt buộc |
| 7 | Trường hợp 101+ ID và lượt đủ 500 PI không bỏ sót hoặc xóa nhầm document | Bắt buộc |
| 8 | Chạy lại không lấy lại record đã abnormal và không lặp thao tác Solr | Bắt buộc |
| 9 | Có thể đối chiếu đầy đủ dữ liệu ClickHouse và Solr trước/sau khi chạy | Bắt buộc |
| 10 | Không tác động PI không thay đổi hoặc tuần ngoài `prevWeek` | Bắt buộc |
| 11 | Không có suy giảm hiệu năng nghiêm trọng ở bộ dữ liệu đại diện; ngưỡng được owner chấp nhận | Bắt buộc |
| 12 | Test Summary Report và các rủi ro còn lại đã được gửi trước khi quyết định release | Bắt buộc |

---

## 6. RỦI RO & HƯỚNG GIẢI QUYẾT (Risks & Mitigations)

| # | Rủi ro | Mức độ | Xác suất | Hướng giảm thiểu |
|---:|---|---|---|---|
| R1 | Tạo sai period/ID khiến dữ liệu WS cũ không bị xóa hoặc xóa nhầm document | Critical | Trung bình | Test đúng ID ở W1/W52/W53/chuyển năm; lưu trạng thái các document không thuộc phạm vi |
| R2 | Code dùng OR thay vì AND cho `sold/gmv`, xóa nhầm document vẫn còn giá trị | High | Trung bình | P0 cho `0/non-zero` và `non-zero/0`; review branch condition |
| R3 | BR-02 xóa PI vốn không có dữ liệu trong `prevWeek` | High | Trung bình | Phân biệt rõ “vốn không có dữ liệu” và “có dữ liệu nhưng tất cả bị đánh abnormal” |
| R4 | Chỉ một phần record abnormal nhưng hệ thống hiểu nhầm là toàn bộ và xóa document | High | Trung bình | Dùng bộ dữ liệu có cả record hợp lệ và abnormal; kiểm tra `piWeeklyDocs` và ClickHouse sau xử lý |
| R5 | `prevWeek` rỗng bị hiểu nhầm là bug, hoặc code vẫn ghi Solr trái với thiết kế | Medium/High | Cao | Test riêng window cuối tháng; xác nhận không có log/action Solr và ClickHouse vẫn được ghi |
| R6 | Danh sách trên 100 ID bị chia nhóm sai, gây bỏ sót ID hoặc query không hợp lệ | High | Trung bình | Test 99/100/101/500 ID và đối chiếu từng ID mong đợi |
| R7 | Lỗi giữa lượt 500 PI làm ClickHouse và Solr không nhất quán | High | Trung bình | Chỉ mô phỏng lỗi sau khi Dev xác nhận retry; lưu dữ liệu và log trước/sau từng lượt |
| R8 | Record abnormal cũ bị kéo lại và xử lý lặp | Medium | Thấp | Re-run test; verify filter `is_abnormal=0` và không có repeated action |
| R9 | Log xóa gộp BR-01 và BR-02 nên khó xác định lý do | Medium | Cao | Lưu ClickHouse trước/sau và mapping expected; đề xuất log thêm reason nếu cần audit |
| R10 | Job cuối tuần/cuối tháng chạy trùng hoặc tính sai ngày do timezone | High | Trung bình | Test biên `dateRun`; Dev xác nhận timezone **(Need Confirm)** |
| R11 | Solr commit chậm khiến QA query quá sớm và thấy dữ liệu cũ | Medium | Trung bình | Chốt thời gian dữ liệu hiển thị; query lặp có giới hạn thời gian **(Need Confirm)** |
| R12 | Không có cách khôi phục document bị xóa nhầm | Critical | Thấp/Trung bình | Xác nhận cách tính lại/khôi phục/backup trước Production |

### 6.1 Rollback/Data recovery

| Trigger | Hành động |
|---|---|
| Số lượng xóa bất thường hoặc document ngoài phạm vi biến mất | Dừng job/scheduler, rollback build, lưu job/lượt xử lý và Solr logs |
| ClickHouse đúng nhưng Solr sai trên nhiều PI | Dừng lượt tiếp theo; đối chiếu dữ liệu; chỉ cập nhật/tạo lại WS sau khi được duyệt |
| Solr lỗi giữa các nhóm ID | Xác định nhóm nào thành công/thất bại rồi mới chạy lại đúng nhóm bị lỗi |
| Không xác định được phạm vi | NO-GO release; audit theo period, product_item_id, batch và timestamps |

---

## 7. TÀI LIỆU BÀN GIAO (Deliverables)

| # | Tài liệu bàn giao | Nội dung | Thời điểm |
|---:|---|---|---|
| 1 | Test Plan v1.2 | Phạm vi và chiến lược được diễn giải rõ theo Dev document | 06/08/2026 |
| 2 | Test Cases chi tiết | 45-61 cases, gồm tối thiểu TC1-TC9 của Dev document | Sau khi review Test Plan |
| 3 | Test Data và kết quả chuẩn | History ClickHouse, record abnormal mong đợi, field tính lại và Solr document IDs | Trước khi chạy test |
| 4 | Báo cáo Testing | Kết quả, build, logs và bằng chứng ClickHouse/Solr | Trước/đến 10/08/2026 |
| 5 | Bug Reports | Các bước, dữ liệu, job/lượt xử lý, ClickHouse/Solr trước-sau và logs | Trong khi chạy test |
| 6 | Bằng chứng chia nhóm và đối chiếu | Danh sách ID trong từng nhóm tối đa 100 và kết quả kiểm tra | Trong khi chạy test |
| 7 | Báo cáo hồi quy Staging | P0, giá trị biên, chia nhóm ID và chạy lại | Trước/đến 12/08/2026 |
| 8 | Test Summary và QA Sign-off | Phạm vi đã test, bug, rủi ro còn lại và khuyến nghị release | Sau khi đạt Exit Criteria |
| 9 | Checklist sau release | Logs, số lượng update/delete, mẫu Solr/ClickHouse và điều kiện rollback | Trước Production |

---

## 8. GIẢ ĐỊNH & CÁC ĐIỂM CẦN XÁC NHẬN

Dev document đã xác nhận luồng nghiệp vụ, thuật toán, định dạng ID và cách chia lượt/nhóm ID. Các điểm dưới đây chưa có trong tài liệu và cần Dev/BA xác nhận:

| # | Câu hỏi cần xác nhận | Người trả lời | Mức độ ảnh hưởng |
|---:|---|---|---|
| NC-01 | Job dùng timezone nào để tính `dateRun`, ngày cuối tuần/cuối tháng và W1/W52/W53? | Dev/BA | Chặn test biên ngày/tuần |
| NC-02 | Nếu request cập nhật/xóa Solr lỗi, job thử lại bao nhiêu lần, chờ bao lâu và báo trạng thái gì? | Dev | Chặn test phục hồi |
| NC-03 | Nếu đã ghi ClickHouse nhưng chưa ghi được Solr, hệ thống phát hiện và chạy lại bằng cách nào? | Dev/Data | Chặn quyết định release an toàn |
| NC-04 | Solr dùng commit/soft commit nào và sau bao lâu QA có thể query thấy kết quả mới? | Dev/SRE | Cao |
| NC-05 | Nếu một nhóm 100 ID bị lỗi sau khi nhóm trước đã thành công, job chạy lại toàn bộ hay chỉ nhóm lỗi? | Dev | Cao |
| NC-06 | Hai job/lượt xử lý có thể cùng xử lý một PI và period không? Nếu có, hệ thống ngăn xung đột thế nào? | Dev | Cao |
| NC-07 | Thời gian xử lý chấp nhận được cho một lượt 500 PI và toàn job là bao nhiêu? | Dev/Data/SRE | Cao |
| NC-08 | Nếu xóa nhầm WS document, team sẽ tạo lại document từ nguồn dữ liệu nào và bằng thao tác nào? | Dev/Data | Chặn release Production |
| NC-09 | Có cần log thêm lý do xóa là `BR-01` hay `BR-02` để dễ audit không? | Dev/QA/BA | Trung bình |

---

## 9. TIMELINE & TRÁCH NHIỆM

| Giai đoạn | Mốc | Output |
|---|---|---|
| Test Plan + clarification | 06/08/2026 | Test Plan v1.2, danh sách cần xác nhận |
| Test Cases + chuẩn bị dữ liệu | 06-07/08/2026 | Test cases, dữ liệu test và kết quả chuẩn |
| Testing execution/retest | Hoàn tất trước/đến 10/08/2026 | Testing Report |
| Staging regression/sign-off | Hoàn tất trước/đến 12/08/2026 | Staging Report, QA recommendation |
| Production monitoring | Theo release plan **(Need Confirm)** | Monitoring result |

| Vai trò | Trách nhiệm |
|---|---|
| QA | Lập kế hoạch/test cases, chuẩn bị dữ liệu, chạy test, đối chiếu, log bug và đưa khuyến nghị release |
| Dev/Data | Giải thích kỹ thuật, hỗ trợ tạo/chạy dữ liệu, sửa bug và cung cấp cách phục hồi |
| BA/Product | Xác nhận kết quả nghiệp vụ mong đợi và rủi ro còn lại |
| DevOps/SRE | Chuẩn bị môi trường, quyền truy cập Solr/ClickHouse/log, monitoring và rollback |
| PM/Release Owner | Quyết định cuối cùng GO hoặc NO-GO |

---

## 10. BUG SEVERITY TRONG SCOPE

| Severity | Ví dụ |
|---|---|
| **Critical** | Xóa nhầm nhiều PI/period, không thể phục hồi hoặc làm sai Weekly Sales diện rộng |
| **High** | BR-01/BR-02 sai; bỏ sót document cần xóa; chỉ abnormal một phần nhưng bị xóa; ClickHouse và Solr không khớp; bỏ sót ID |
| **Medium** | Log, retry hoặc thời gian hiển thị dữ liệu sai nhưng kết quả cuối có thể phục hồi và phạm vi ảnh hưởng nhỏ |
| **Low** | Câu chữ log hoặc tài liệu sai nhưng không ảnh hưởng dữ liệu/kết quả xử lý |

---

## 11. PHÊ DUYỆT / SIGN-OFF

| Vai trò | Họ tên | Ngày | Trạng thái | Ghi chú |
|---|---|---|---|---|
| QA Lead/Tester |  |  | Pending | Sign-off sau Exit Criteria |
| Developer/Dev Lead |  |  | Pending | Confirm technical contract/recovery |
| BA/Product Owner |  |  | Pending | Confirm business expectation |
| DevOps/SRE |  |  | Pending | Confirm environment/rollback |
| PM/Release Owner |  |  | Pending | Final release decision |

---

## PHỤ LỤC A - SMOKE CHECKLIST

| # | Hạng mục kiểm tra | Kết quả mong đợi |
|---:|---|---|
| 1 | Chạy job ở ngày hợp lệ | Job xác định được `prevWeek`, `curWeek` và danh sách PI cần kiểm tra |
| 2 | Query PI và history trên ClickHouse | Đúng điều kiện lọc và đúng dữ liệu đã chuẩn bị |
| 3 | Chạy một mẫu BR-01 | Xóa đúng WS ID; ClickHouse không đánh abnormal nếu chuỗi sold không giảm |
| 4 | Chạy một mẫu BR-02 | ClickHouse đánh abnormal và xóa đúng WS ID |
| 5 | Chạy mẫu có tổng tuần lớn hơn 0 | Solr cập nhật document, không xóa |
| 6 | Chạy mẫu không có PI thay đổi | Không gọi update/delete Solr; có log bỏ qua |
| 7 | Chạy lại mẫu BR-02 | Không lấy lại PI và không lặp thao tác Solr |
| 8 | Kiểm tra log | Có `[Solr write]`, `[Solr delete]`, `[CH write]` đúng với thao tác thực tế |

---

## PHỤ LỤC B - RELEASE GO/NO-GO

| Check | GO | NO-GO |
|---|---|---|
| BR-01/BR-02 | Cả hai pass | Một rule fail |
| Document ID/period | Đúng ở mọi giá trị biên đã chốt | Xóa sai document hoặc không xóa đúng mục tiêu |
| Chia nhóm ID | 101+/500 ID không bị bỏ sót | Thiếu ID hoặc query không hợp lệ |
| Trạng thái ClickHouse | Abnormal và các field tính lại đúng | Dữ liệu ClickHouse sai hoặc không khớp Solr |
| Chạy lại | Không có thao tác lặp | PI cũ bị lấy và xử lý lại sai |
| Phục hồi | Cách retry/phục hồi đã được xác nhận và test | Không phục hồi được khi lỗi giữa chừng |
| Bug | Không còn Critical/High | Còn Critical/High hoặc rủi ro chưa được chấp nhận |

---

*-- Hết tài liệu Test Plan --*

*Tài liệu v1.2 được cập nhật từ Jira `YNMPECA-9360` và Dev Document hoàn chỉnh `Document/ECI/dev_doc_clickhouse_sync.md`. Nội dung kỹ thuật được giữ nguyên nhưng đã được diễn giải lại để QA Fresher và các stakeholder không chuyên sâu về data pipeline dễ đọc hơn.*
