# Review testcase 04-F04 — Bản dễ hiểu cho Fresher

> Mục đích: giúp người mới đọc là hiểu ngay testcase đang sai gì và cần sửa như thế nào.  
> Requirement dùng để review: `04-F04-push-notification.md` phiên bản 1.5.  
> Testcase hiện tại: 49 case, từ `F04-TC-001` đến `F04-TC-049`.

---

# Cách đọc tài liệu này

Mỗi vấn đề sẽ được giải thích theo bốn ý:

1. **Hiện tại đang viết gì?**
2. **Vì sao chưa đúng?**
3. **Cần sửa như thế nào?**
4. **Ví dụ sau khi sửa.**

Nếu chưa quen requirement, hãy đọc phần thuật ngữ dưới đây trước.

## Thuật ngữ cần biết

| Thuật ngữ                | Giải thích đơn giản                                                                     |
| ------------------------ | --------------------------------------------------------------------------------------- |
| PIC                      | Người được giao phụ trách một Alert Rule. Phase 1 chỉ gửi push cho người này.           |
| Heartbeat                | Tín hiệu web gửi về server mỗi 60 giây để báo user vẫn đang online.                     |
| Offline                  | Không có heartbeat trong hơn 5 phút, chưa từng heartbeat, hoặc heartbeat trả 401.       |
| Pending window           | Danh sách tin đang chờ PIC kiểm tra trong ba ngày gần nhất.                             |
| Tin mới                  | Tin vừa được pipeline đưa vào rule và chưa từng được tính cho push.                     |
| Pending cũ               | Tin vẫn chưa xử lý nhưng đã được tính trong một lần push trước.                         |
| Re-filter                | Tin cũ vào Pending window vì PIC sửa Alert Conditions. Đây không phải tin mới.          |
| Auto-alert               | Tin đã được hệ thống tự động gửi khách. PIC không cần nhận push để verify tin này.      |
| Collapse                 | Push mới thay thế push cũ chưa đọc, thay vì tạo nhiều notification riêng.               |
| Expected result / Oracle | Kết quả cụ thể để tester quyết định Pass hay Fail.                                      |
| Traceability             | Ghi testcase đang kiểm tra BR/AC nào để khi requirement đổi còn biết case nào phải sửa. |
| Phase 1                  | Phạm vi đang build và test ở release hiện tại.                                          |
| Phase 2                  | Chức năng để sau, không được dùng làm điều kiện Pass/Fail của Phase 1.                  |

---

# 1. Nhận xét tổng quan

## Kết luận ngắn gọn

**Bộ testcase hiện tại chưa sẵn sàng để chạy test Phase 1.**

Nguyên nhân chính:

- Có 16 testcase đang test chức năng Crisis Leader, nhưng chức năng này đã chuyển sang Phase 2.
- Một số testcase vẫn dùng requirement cũ như `is_migrated` hoặc “chỉ Negative mới được tính”.
- Chưa test các chức năng quan trọng mới như re-filter, auto-alert, collapse và Notification Detail.
- Nhiều testcase chỉ ghi “có pending” nhưng requirement cần phân biệt “tin mới” và “tổng pending”.
- Tất cả testcase đều để Priority Medium và Test Type Functional, kể cả performance test.
- Cột Remarks của 49 testcase đều trống nên không biết testcase liên quan BR/AC nào.

## Mức coverage hiện tại

Requirement v1.5 có 16 Acceptance Criteria:

| Kết quả               | Số lượng | Hiểu đơn giản                                                |
| --------------------- | -------: | ------------------------------------------------------------ |
| Đã cover đầy đủ       |        3 | Có testcase đủ điều kiện và Expected rõ ràng                 |
| Có test nhưng chưa đủ |        7 | Có testcase gần đúng nhưng thiếu dữ liệu hoặc thiếu Expected |
| Chưa có testcase      |        6 | Không có testcase kiểm tra hành vi này                       |

Vì vậy không nên chỉ sửa vài câu rồi chạy. Cần cập nhật lại scope và bổ sung coverage.

---

# 2. Các vấn đề trong testcase hiện tại

## Vấn đề 1 — Đang test chức năng ngoài Phase 1

### Hiện tại đang viết gì?

Các testcase dưới đây kiểm tra Crisis Leader, cron 08:30, permission escalation hoặc no-app escalation:

`TC-018…028`, `TC-035`, `TC-041`, `TC-042`, `TC-043`, `TC-049`.

Tổng cộng 16 testcase.

### Vì sao chưa đúng?

Requirement v1.5 đã nói rõ:

- Phase 1 chỉ push cho PIC.
- Crisis Leader escalation chuyển sang Phase sau.
- Không còn permission `receive_escalated_notification` trong scope v1.
- Nếu PIC chưa đăng nhập app thì v1 không có kênh push thay thế.

Nếu vẫn chạy các testcase này, tester có thể báo bug cho chức năng mà team chưa cần build.

### Cần sửa như thế nào?

- Xóa các case này khỏi test cycle Phase 1.
- Không cần xóa vĩnh viễn.
- Chuyển chúng sang một sheet hoặc suite riêng tên `Phase 2 — Leader Escalation`.
- Ghi Remarks: `OUT Phase 1 / Move to P2-01`.

### Ví dụ

`TC-026` hiện kỳ vọng Leader nhận push khi PIC chưa login app.

Expected đúng cho Phase 1 phải là:

> Không gửi push vì PIC không có active device token. Tin vẫn còn trong tab Cần xét duyệt. Không gửi push Leader hoặc kênh thay thế.

---

## Vấn đề 2 — Dùng mô hình `is_migrated` đã cũ

### Hiện tại đang viết gì?

`TC-014` kiểm tra topic có `is_migrated=ON/OFF`.

### Vì sao chưa đúng?

Requirement mới không còn xác định flow mới bằng cờ `is_migrated`.

Một mention được tính cho PIC khi:

- Mention thuộc Alert Rule.
- User đang là PIC của Alert Rule đó.
- Mention nằm trong Pending window.

### Cần sửa như thế nào?

Thay `TC-014` bằng testcase kiểm tra scope Alert Rule/PIC.

### Ví dụ sau khi sửa

**Test name:** Chỉ tính pending thuộc Alert Rule mà user là PIC.

**Test data:**

- Rule R1: user A là PIC, có 2 pending.
- Rule R2: user B là PIC, có 3 pending.
- Flow cũ không có Alert Rule: có 4 pending.

**Expected:**

- Push của user A có count=2.
- Không tính R2.
- Không tính dữ liệu flow cũ.

---

## Vấn đề 3 — Hiểu sai rằng chỉ Negative mới được tính

### Hiện tại đang viết gì?

`TC-043` có tên “Chỉ mention Negative tính tồn đọng”.

### Vì sao chưa đúng?

Điều kiện để mention vào rule là:

`Negative OR Keyword OR Rating`

Vì vậy:

- Mention Positive vẫn có thể vào rule nếu match Keyword.
- Mention Neutral vẫn có thể vào rule nếu match Rating.

### Cần sửa như thế nào?

Thay case này bằng testcase kiểm tra cả ba đường vào rule.

### Ví dụ sau khi sửa

**Test data:**

- Mention A: Sentiment Negative.
- Mention B: Sentiment Positive nhưng match Keyword.
- Mention C: Sentiment Neutral nhưng match Rating.

**Expected:**

- Cả ba mention đều vào Pending window nếu chưa xử lý.
- Push count=3.

---

## Vấn đề 4 — Chưa phân biệt “tin mới” và “tổng pending”

### Hiện tại đang viết gì?

Nhiều testcase chỉ ghi:

> `pending_count=5`

Các case bị ảnh hưởng gồm `TC-005`, `TC-007`, `TC-008`, `TC-009`, `TC-012`, `TC-017`, `TC-044`.

### Vì sao chưa rõ?

Requirement dùng hai con số khác nhau:

- Có ít nhất một **tin mới** thì mới trigger push.
- Nội dung push hiển thị **tổng pending**, gồm cả tin mới và pending cũ.

Ví dụ:

- 2 tin mới.
- 3 pending cũ.
- Hệ thống phải gửi push vì có 2 tin mới.
- Nội dung push phải hiển thị 5, không phải 2.

### Cần sửa như thế nào?

Trong Test Data luôn tách riêng:

- `new_unpushed`.
- `old_pending`.
- `total_pending`.

### Ví dụ Expected rõ ràng

> Cron gửi đúng một push tới mọi thiết bị active của PIC. Title hiển thị “Có 5 tin chờ verify”. Sau khi gửi thành công, hai tin mới được đánh dấu đã-push. Ba pending cũ không bị đánh dấu lại.

---

## Vấn đề 5 — Case “không pending” chưa cover đúng BR-08

### Hiện tại đang viết gì?

`TC-009` dùng `pending_count=0` và Expected là không push.

### Vì sao chưa đủ?

BR-08 không chỉ nói “không có pending”. BR-08 còn yêu cầu:

- Vẫn có pending cũ.
- Nhưng không còn tin mới chưa push.
- Hệ thống không được push lại.

Case hiện tại không phát hiện được lỗi duplicate push.

### Cần sửa như thế nào?

**Test data mới:**

- `old_pending=4`.
- `new_unpushed=0`.
- `pushed_flag=true` cho bốn tin cũ.

**Expected:**

- Không có push mới.
- Bốn tin vẫn còn trong feed để PIC xử lý.

---

## Vấn đề 6 — Thiếu testcase re-filter

### Hành vi cần test

PIC sửa Alert Conditions làm các mention cũ vào Pending window. Những mention này không được tính là tin mới.

### Vì sao phải test?

Nếu Dev chỉ kiểm tra “mention vừa xuất hiện trong window” thì một lần sửa rule có thể tạo hàng loạt push không cần thiết.

### Testcase cần thêm

**Pre-condition:** PIC offline, có active token, không có tin mới pipeline.

**Steps:**

1. Sửa Alert Conditions để sáu mention cũ vào Pending window.
2. Chạy cron.
3. Kiểm tra push log.

**Expected:**

- Không gửi push.
- Sáu mention được đánh dấu có nguồn re-filter, không phải pipeline new.

---

## Vấn đề 7 — Thiếu testcase auto-alert

### Hành vi cần test

Tin auto-alert đã được tự động gửi khách nên PIC không cần nhận push verify.

### Case cần có

1. Chỉ có auto-alert → không push.
2. Có auto-alert và một tin manual mới → gửi push, nhưng count không gồm auto-alert.

### Expected ví dụ

> Hai mention auto-alert bị loại. Một mention manual pending được tính. Hệ thống gửi một push với count=1.

---

## Vấn đề 8 — Thiếu testcase mark đã-push và chống gửi lặp

### Vì sao phải có?

Sau khi push thành công, tin mới phải được đánh dấu đã-push. Nếu không, cron sau sẽ gửi lại cùng một nội dung.

### Hai case cần có

**Case A — Send thành công:**

- Cron lần một gửi push và mark đã-push.
- Không thêm tin mới.
- Cron lần hai gửi 0 push.

**Case B — Send thất bại:**

- Provider timeout.
- Không retry trong cùng lần cron.
- Không mark đã-push.
- Cron tự nhiên kế tiếp thử gửi lại.

---

## Vấn đề 9 — Thiếu testcase collapse notification

### Hành vi cần test

- PIC đã có push count=2 chưa đọc.
- Đợt sau tổng pending tăng thành 5.
- Push mới phải thay push cũ.

### Expected

- OS tray chỉ còn một notification count=5.
- Notification Center/List chỉ còn một item count=5.
- Không xuất hiện hai dòng count=2 và count=5 cùng lúc.

---

## Vấn đề 10 — Notification Detail mới chỉ được test rất sơ sài

### Hiện tại đang viết gì?

`TC-029` và `TC-030` chỉ kiểm tra màn Detail có title, body, timestamp và CTA.

### Requirement thực tế cần kiểm tra thêm

- Tổng pending.
- Số Alert Rule.
- Chỉ hiển thị rule user là PIC và đang có pending.
- Breakdown Very High, High, Low, Unclassified.
- Màu theo level nặng nhất.
- Sắp xếp tổng pending giảm dần.
- Tên rule tối đa hai dòng.
- Nút “Xem tất cả ở Crisis Monitoring” dính ở đáy màn hình.

### Cách sửa

Không nên gom tất cả vào một case lớn. Tách thành các testcase nhỏ:

- Hero/count/timestamp.
- Rule scope và tổng đối soát.
- Negative Level breakdown.
- Severity color.
- Sort.
- Long rule name.
- Sticky CTA.

Khi fail, tester sẽ biết chính xác phần nào hỏng.

---

## Vấn đề 11 — `TC-031` đang tự mâu thuẫn

### Hiện tại đang viết gì?

Expected vừa nói:

> Mở Crisis Content Monitoring trong WebView.

Lại vừa nói:

> Không ràng buộc WebView hay external browser.

### Vì sao sai?

Hai điều kiện này không thể cùng dùng làm tiêu chí Pass/Fail.

Ngoài ra testcase đang gộp:

- Tap View all.
- Tap một Alert Rule.

Hai action có màn đích khác nhau.

### Cần sửa như thế nào?

Tách thành hai case:

**Case 1 — View all**

> Mở tab Cần xét duyệt với chip Tất cả. Không yêu cầu đăng nhập lại. Không kiểm tra WebView hay browser.

**Case 2 — Tap rule R2**

> Mở tab Cần xét duyệt với R2 được chọn sẵn. Không yêu cầu đăng nhập lại.

---

## Vấn đề 12 — Chưa test rule bị paused hoặc deleted

### Case paused

Rule vẫn tồn tại nên phải mở đúng rule. Feed có thể rỗng nhưng không được báo “rule không còn”.

### Case deleted

Rule không còn nên phải:

- Hiển thị message “Alert Rule này không còn”.
- Mở chip Tất cả.

Nếu user không còn rule pending nào, tab Cần xét duyệt phải hiển thị empty state.

---

## Vấn đề 13 — Test Type và Priority chưa đúng

### Hiện tại

- 49/49 testcase đều Priority Medium.
- Tất cả đều Functional.

### Cách sửa

| Testcase                           | Test Type nên dùng          |
| ---------------------------------- | --------------------------- |
| TC-034, 036, 037, 038, 039         | Performance/Operational     |
| TC-040                             | Regression                  |
| Happy path, validation, navigation | Functional/API/E2E tùy case |

Gợi ý Priority:

- **P0:** heartbeat/offline-gating, cron trigger, idempotency, auto-alert, re-filter, View all/rule deep-link, authorization, NFR chính.
- **P1:** UI detail phụ, localization, error/loading, concurrency.
- **P2:** layout boundary ít ảnh hưởng như tên rule rất dài.

---

## Vấn đề 14 — Remarks trống toàn bộ

### Vì sao cần sửa?

Khi requirement đổi, người review không biết testcase liên quan rule nào.

### Cách ghi Remarks đơn giản

Ví dụ:

> `BR-06 / BR-10 / US-01-AC-01 · Cần FCM sandbox · Cần time-mock`

Không cần viết đoạn văn dài. Chỉ cần đủ để truy ngược requirement và dependency.

---

# 3. Testcase nào cần sửa, giữ hoặc chuyển scope?

## 3.1 Có thể giữ, chỉ cần làm rõ

`TC-002`, `TC-003`, `TC-006`, `TC-011`, `TC-012`, `TC-015`, `TC-017`, `TC-044`, `TC-046`, `TC-047`, `TC-048`.

Việc cần làm:

- Thêm time source/timezone nếu dùng time-mock.
- Ghi rõ tin mới, pending cũ và total.
- Thêm traceability.
- Chỉnh Priority/Test Type.

## 3.2 Cần viết lại nội dung hoặc Expected

`TC-001`, `TC-004`, `TC-005`, `TC-007`, `TC-008`, `TC-010`, `TC-013`, `TC-016`, `TC-029`, `TC-030`, `TC-033`.

## 3.3 Cần thay bằng testcase mới

| Testcase cũ | Thay bằng                                           |
| ----------- | --------------------------------------------------- |
| TC-009      | Còn pending cũ nhưng không có tin mới → không push  |
| TC-014      | Chỉ tính Alert Rule user là PIC; loại flow cũ       |
| TC-043      | Positive/Neutral match Keyword/Rating vẫn được tính |

## 3.4 Cần tách thành nhiều testcase

- `TC-031`: tách View all và tap rule.
- `TC-032`: tách auth fail View all và auth fail rule.

## 3.5 Cần chuyển sang Phase 2

`TC-018…028`, `TC-035`, `TC-041`, `TC-042`, `TC-049`.

## 3.6 Cần bỏ hoặc merge vì trùng

- Bỏ assertion 65 giây khỏi `TC-001`; giữ ở `TC-039`.
- Merge/bỏ `TC-045` vì đã có `TC-011` và boundary `TC-047`; đồng thời `TC-045` còn nhắc Leader.

Chi tiết từng testcase nằm trong sheet `Current Disposition` của workbook cải thiện.

---

# 4. Testcase nên bổ sung

## Nhóm bắt buộc P0

| Nhóm             | Testcase cần bổ sung                             | Tại sao cần có                                |
| ---------------- | ------------------------------------------------ | --------------------------------------------- |
| Trigger          | Tin mới=2, pending cũ=3, push count=5            | Chứng minh trigger và display count khác nhau |
| Idempotency      | Cron sau không gửi lại pending cũ đã push        | Chống duplicate notification                  |
| Error            | Provider fail thì không mark đã-push             | Tránh mất notification                        |
| Re-filter        | Chỉ có re-filter → 0 push                        | Chống spam khi sửa rule                       |
| Mixed re-filter  | Re-filter + một tin mới → có push                | Kiểm tra decision table phức tạp              |
| Auto-alert       | Chỉ auto-alert → 0 push                          | Không nhắc PIC xử lý tin đã gửi khách         |
| Mixed auto-alert | Auto-alert + manual → count chỉ gồm manual       | Kiểm tra filter chính xác                     |
| Collapse         | Push mới thay push cũ chưa đọc                   | Tránh nhiều notification                      |
| PIC scope        | Không tính rule người khác                       | Chống sai quyền và sai count                  |
| Entry OR         | Positive/Neutral match điều kiện vẫn vào pending | Tránh lọc sai chỉ Negative                    |
| Detail           | Tổng hero bằng tổng các card                     | Phát hiện dữ liệu không khớp                  |
| View all         | Mở chip Tất cả                                   | Khóa đúng requirement v1.4                    |
| Rule card        | Mở đúng rule                                     | Tránh deep-link sai                           |
| Deleted rule     | Message + fallback Tất cả                        | Xử lý dữ liệu cũ an toàn                      |
| Authorization    | User khác không đọc được notification/rule       | Chống lộ dữ liệu                              |

## Nhóm boundary

- 5m00s vẫn online.
- 5m01s offline.
- 07:59 không chạy.
- 08:00 chạy.
- Tick 23:55 chạy với interval mặc định 5 phút.
- 00:00 không chạy.
- 72h00m và 72h01m sau khi BA xác nhận cách tính.

## Nhóm UI/UX

- Negative Level breakdown.
- Màu level nặng nhất.
- Sort giảm dần.
- Tên rule dài.
- Sticky CTA.
- EN/VN.
- Loading, API error/retry và empty state.

---

# 5. Cách viết một testcase rõ ràng

## Mẫu nên dùng

### Test name

Viết theo cấu trúc:

> `[Điều kiện] → [Kết quả chính]`

Ví dụ tốt:

> PIC offline có tin mới nhận push với tổng pending tại cron.

Không nên viết quá chung:

> Kiểm tra push notification.

### Pre-condition

Phải nói rõ trạng thái đã có trước khi test:

- User là PIC rule nào.
- Online hay offline.
- Có active token hay không.
- Cron đang trong giờ nào.
- Có cần time-mock/FCM sandbox hay không.

### Test steps

- Mỗi bước chỉ nên có một hành động chính.
- Bước cuối nên là kiểm tra kết quả.
- Không ghi Expected vào giữa Steps.

### Test data

Không chỉ ghi `pending=5`. Nên ghi:

```text
new_unpushed=2
old_pending=3
total_pending=5
active_devices=2
cron_time=10:00
```

### Expected result

Phải là câu khẳng định đo được:

```text
- Mỗi active device nhận đúng 1 push.
- Title hiển thị count=5.
- Hai tin mới được mark đã-push sau khi send thành công.
- Cron kế tiếp không gửi lại nếu không có tin mới.
```

Không nên ghi:

> Push đúng theo BR-06.

Người mới không nên phải mở một tài liệu khác mới biết Pass hay Fail.

---

# 6. Vì sao từng nhóm testcase phải có?

## Heartbeat và presence

Nếu xác định online/offline sai, toàn bộ push sẽ sai:

- Online nhưng bị push làm phiền.
- Offline nhưng không nhận push.

Vì vậy phải test cả trạng thái và lúc chuyển trạng thái.

## Cron và khung giờ

Cron chỉ chạy trong giờ vận hành. Boundary test giúp bắt lỗi chạy sớm, chạy quá giờ hoặc bỏ mất tick đầu tiên.

## Tin mới và pending cũ

Đây là phần dễ nhầm nhất. Pending cũ vẫn hiển thị trong tổng nhưng không được tự trigger một push mới.

## Re-filter

Sửa điều kiện rule có thể đưa rất nhiều tin cũ vào window. Không có case này thì hệ thống có thể spam PIC.

## Auto-alert

Tin đã tự gửi khách không cần PIC xử lý. Nếu vẫn tính, count và workload của PIC sẽ sai.

## Idempotency và provider failure

Push là xử lý bất đồng bộ. Phải kiểm tra cả DB flag, provider result và cron sau để tránh gửi lặp hoặc làm mất push.

## Notification Detail

PIC dùng màn này để quyết định rule nào cần xử lý trước. Sai count, level, màu hoặc sort có thể khiến PIC ưu tiên sai crisis.

## Deep-link và stale rule

Rule có thể đổi trạng thái sau khi push được gửi. Case paused/deleted giúp app không crash và không mở sai dữ liệu.

## Security/PIC scope

User chỉ được xem rule mình phụ trách. Đây là phần permission thực của Phase 1 và phải test chống truy cập dữ liệu của user khác.

## NFR

Feature này phục vụ crisis monitoring nên notification đúng nhưng đến quá chậm vẫn là lỗi. NFR phải có môi trường, công cụ và cách đo rõ ràng.

---

# 7. Các bước để Fresher sửa bộ testcase

Thực hiện theo đúng thứ tự sau:

## Bước 1 — Dọn scope

- Đánh dấu 16 case Leader là `OUT Phase 1`.
- Chuyển chúng sang suite Phase 2.

## Bước 2 — Sửa thuật ngữ cũ

- Bỏ `is_migrated`.
- Bỏ giả định chỉ Negative được tính.
- Dùng Alert Rule/PIC và Entry OR.

## Bước 3 — Sửa test data

Trong các case cron, tách:

- `new_unpushed`.
- `old_pending`.
- `total_pending`.
- `active_device_tokens`.

## Bước 4 — Sửa các case có sẵn

- Làm theo nhóm ở phần 3.
- Tách `TC-031` và `TC-032`.
- Merge/bỏ `TC-045`.

## Bước 5 — Bổ sung case thiếu

Ưu tiên theo thứ tự:

1. Re-filter.
2. Auto-alert.
3. Mark đã-push và provider failure.
4. Collapse.
5. Notification Detail.
6. View all/rule/deleted rule.
7. PIC authorization.

## Bước 6 — Sửa Priority và Test Type

- Core behavior = P0.
- UI/edge phụ = P1/P2.
- NFR không được để Functional.

## Bước 7 — Điền Remarks

Mỗi testcase ghi BR/AC và dependency.

## Bước 8 — Tự review lại từng dòng

Tự hỏi năm câu:

1. Người khác có dựng được pre-condition không?
2. Steps có nói chính xác phải làm gì không?
3. Test data có giá trị cụ thể không?
4. Expected có quyết định Pass/Fail được không?
5. Remarks có chỉ ra BR/AC không?

Nếu có câu nào trả lời “không”, testcase chưa sẵn sàng để review.

---

# 8. Những điểm phải hỏi BA/Dev, không tự đoán

| Vấn đề              | Cần hỏi gì?                                                      |
| ------------------- | ---------------------------------------------------------------- |
| Push cũ đã đọc      | Khi có push mới thì giữ lịch sử hay tạo item mới?                |
| Re-filter + tin mới | Count hiển thị có bao gồm mention re-filter không?               |
| Hai rule bằng count | Sort phụ theo severity, name hay id?                             |
| Biên 72 giờ         | Đúng 72h có được tính không? Dùng timezone nào?                  |
| Rule bị đổi PIC     | User cũ tap notification thì xử lý như thế nào?                  |
| API security        | Truy cập notification người khác trả 403 hay 404?                |
| Stale token         | Một token fail và một token thành công thì mark đã-push thế nào? |
| Performance         | Load volume, concurrency và error budget là bao nhiêu?           |

Các case liên quan nên để `DRAFT` và ghi dependency cho tới khi có câu trả lời.

---

# 9. Checklist trước khi gửi review lại

- [ ] Không còn case Phase 2 trong test cycle Phase 1.
- [ ] Không còn `is_migrated`.
- [ ] Không còn câu “chỉ Negative được tính”.
- [ ] Các case cron đã tách tin mới, pending cũ và tổng pending.
- [ ] Đã có re-filter, auto-alert, idempotency và collapse.
- [ ] Đã test đầy đủ Notification Detail.
- [ ] View all và tap rule là hai testcase riêng.
- [ ] Đã có paused/deleted rule.
- [ ] NFR và Regression có Test Type đúng.
- [ ] Priority không còn toàn bộ Medium.
- [ ] Remarks có BR/AC cho 100% testcase.
- [ ] Expected không chỉ ghi “theo BR-xx”.
- [ ] Các câu hỏi P0 đã được BA/Dev trả lời hoặc ghi dependency rõ ràng.
