# 🔍 SENIOR QA REVIEW — Bộ Testcase YNMPECA-9325
## Crawl PI Detail ưu tiên theo Shop Priority

| Thuộc tính | Giá trị |
| --- | --- |
| Reviewer | Senior QA/Test Analyst |
| Ngày review | 25/08/2026 |
| Jira | [YNMPECA-9325](https://jira.younetco.com/browse/YNMPECA-9325) |
| Test Plan | [TestPlan_YNMPECA-9325](file:///Users/tranthanhlam/YNM-testing/Ai_Agents/test_plans/local/eci_crawl_pi_detail_priority/TestPlan_YNMPECA-9325_Crawl_PI_Detail_Priority.md) |
| Tổng test case hiện tại | **49 test cases** |
| Modules covered | Feature Flag & Configuration (7), Priority Schedule (15), Zone Selection (10), Solr Eligibility Filter (15), Batch & Chunking (8), RabbitMQ Routing & Capacity (7), Cursor & Redis (7), Reliability & Observability (9) |

---

## 1. NHẬN XÉT TỔNG QUAN

### 1.1. Điểm mạnh ✅

1. **Bao phủ nghiệp vụ tốt**: Bộ testcase phủ được hầu hết các module chính của requirement — từ Feature Flag, Priority Schedule, Zone Selection, Solr Filter, Batch/Chunking, Queue Routing đến Cursor/Redis và Reliability. Đây là dấu hiệu cho thấy người viết đã đọc kỹ cả BA Wiki, Technical Wiki và Jira comment.

2. **Pre-condition chi tiết, thực thi được**: Mỗi test case đều có pre-condition rất cụ thể, bao gồm build version, quyền truy cập, PI seed ID, trạng thái queue/Redis/cursor, và điều kiện cách ly dữ liệu. Đây là điểm rất chuyên nghiệp — nhiều bộ testcase thực tế thiếu yếu tố này.

3. **Test Data dạng JSON có cấu trúc**: Việc sử dụng JSON format cho test data giúp QA executor có thể tái hiện chính xác kịch bản test, giảm nhầm lẫn khi seed data vào Solr.

4. **Ghi nhận "Need Confirm" đúng chỗ**: Các case có expected result phụ thuộc vào quyết định chưa chốt (A-01 đến A-09) đều được đánh dấu rõ ràng. Đây là cách tiếp cận an toàn và đúng quy trình — không tự ý pass/fail khi requirement chưa xác nhận.

5. **Boundary testing tốt**: Các boundary đã được thiết kế nghiêm túc ở các filter: `latest_sold` (999/1000/1001), `count_failed` (4/5), `crawled_date` (trước/đúng/sau 30 ngày), `next_crawl_time` (trước/đúng/sau NOW), batch size (99/100/101), chunk size (4/5/6).

6. **Edge case quan trọng không thiếu**: Overlap schedule (tuần + cuối tháng), tháng nhuận, timezone boundary, PI thỏa cả 2 nhánh OR, cross-domain isolation — tất cả đều đã có test case.

7. **Fault injection có mặt**: Các case TC_STATE_003, TC_STATE_004 và TC_RELIABILITY_001–009 cho thấy tư duy test không chỉ dừng ở happy path mà đã mở rộng sang crash/restart/timeout/permission.

### 1.2. Điểm cần cải thiện ⚠️

1. **Test Steps quá generic và lặp lại**: 80% test cases dùng cùng 5 bước giống hệt nhau. Điều này khiến QA executor không biết cụ thể cần làm gì tại mỗi case, đặc biệt khi các case có setup khác nhau (fault injection, concurrent loaders, queue depth manipulation).

2. **Thiếu traceability rõ ràng đến requirement rule**: Không có mapping giữa TC ID và FR/OR/SC/DT ID trong test plan. Không thể xác nhận nhanh "FR-05 đã có TC nào cover?" mà không đọc từng case.

3. **Thiếu một số loại test case quan trọng**: Xem chi tiết ở mục 4.

4. **Expected Result một số case chưa đủ cụ thể**: Có case chỉ ghi "PI được chọn" mà không ghi rõ assert gì (Solr query? Queue message count? PI ID set-diff?).

5. **Chưa tách biệt test type**: Tất cả 49 TC đều ghi `Functional` ở cột TEST TYPE, trong khi có case rõ ràng thuộc `Integration`, `Performance`, `Security/Observability` hoặc `Data Consistency`.

6. **PI ID naming không nhất quán**: Một số case dùng format `filter001`, một số dùng `shopee.vn!cfg001`, `batch-001`, `crash-pre-1`, `rel-solr-1`... Cần convention thống nhất.

---

## 2. CÁC LỖI/VẤN ĐỀ TRONG TESTCASE HIỆN TẠI

### 2.1. Lỗi logic hoặc sai sót trong test data

| TC ID | Vấn đề | Mức độ | Chi tiết |
| --- | --- | --- | --- |
| TC_SCHEDULE_009 | **Test data ghi sai boundary** | 🔴 High | Test data ghi `dates: ["2027-02-26", "2027-02-27", "2027-02-28"]` nhưng expected ghi "26–28/02 chọn priority". Nếu tháng 2/2027 có 28 ngày và `MONTH_END_PRIORITY_DAYS=3`, thì 3 ngày cuối = ngày 26, 27, 28. Expected result ghi đúng nhưng ngày 25/02 không có trong test data để chứng minh negative. Cần thêm ngày 25/02 vào test data. |
| TC_SCHEDULE_006 | **Trùng nội dung với TC_CONFIG_006** | 🟡 Medium | TC_CONFIG_006 đã test "3 ngày cuối tháng có 30 ngày" với tháng 09/2026. TC_SCHEDULE_011 test lại cùng scenario. Khác biệt quá nhỏ (domain context). |
| TC_CONFIG_005 | **Clock/date không match week mapping** | 🟡 Medium | Test data ghi 07/09/2026 nhưng cần xác nhận 07/09/2026 thực sự là Monday. Kiểm tra: 07/09/2026 là **Thứ Hai** ✅. Tuy nhiên, expected ghi "VN chọn priority 10–13/09" — cần kiểm tra 13/09 là Chủ Nhật (day_index=0) thuộc rule `0,4,5,6` nên đúng priority. OK nhưng cần ghi rõ hơn tại sao 13/09 priority. |
| TC_ZONE_007 | **Test data dùng `ba_expression` sai** | 🟡 Medium | Ghi `ba_expression: "official=0 OR industry_id missing"` nhưng PI này có `official=1`. BA expression này mô tả Vùng 3, không phải điều kiện của PI. Dễ gây hiểu nhầm rằng PI thuộc tính `official=0`. Nên tách BA expression ra REMARKS. |
| TC_BATCH_006 | **Expected chunk size cần xác nhận** | 🟡 Medium | Ghi "19×5 + 1×4" — tổng = 95+4 = 99 ✅. Đúng toán học. Tuy nhiên test plan ghi "99 → 20 message: 19×5 + 1×4". Kiểm tra: `ceil(99/5) = 20` ✅. OK. |
| TC_STATE_002 | **PI ID naming inconsistent** | 🟢 Low | Pre-condition ghi `state101-001` đến `state101-101` nhưng expected cursor sequence ghi `state-100`, `state-101`. Không khớp. |

### 2.2. Vấn đề về cấu trúc và tính rõ ràng

| Vấn đề | Ảnh hưởng | TC bị ảnh hưởng |
| --- | --- | --- |
| **Test Steps bị copy-paste** | QA executor không biết cần assertion cụ thể nào; case fault injection không có step mô phỏng lỗi | TC_FILTER_001–015, TC_SCHEDULE_001–004, TC_ZONE_001–010 |
| **Không có cột REQUIREMENT MAPPING** | Không thể nhanh chóng kiểm tra coverage theo requirement rule | Tất cả 49 TC |
| **Cột ACTUAL RESULT luôn trống** | Đúng nếu chưa execute, nhưng nên ghi "Pending execution" thay vì để trống tuyệt đối | Tất cả |
| **TEST TYPE luôn là "Functional"** | Misleading cho TC_RELIABILITY_007 (Performance), TC_RELIABILITY_008 (Security/Log), TC_QUEUE_003 (Integration), TC_STATE_003-004 (Fault Injection) | ~12 TC |
| **Thiếu EXECUTION NOTES/ENVIRONMENT cột** | Không rõ case chạy trên env nào, build tag gì | Tất cả |

### 2.3. Các test case bị trùng hoặc có thể merge

| Nhóm TC | Lý do có thể merge | Đề xuất |
| --- | --- | --- |
| TC_SCHEDULE_002 + TC_SCHEDULE_003 + TC_SCHEDULE_004 | Cả 3 đều test VN priority vào ngày ưu tiên (Thu/Fri/Sat/Sun). Test steps và expected đều giống nhau, chỉ khác clock. | Merge thành 1 TC data-driven "VN priority trên các ngày ưu tiên" với bảng dữ liệu chứa 4 ngày |
| TC_SCHEDULE_006 + TC_SCHEDULE_007 | TH priority vào Fri/Sat — cùng expected, cùng steps | Merge thành 1 TC data-driven |
| TC_CONFIG_006 + TC_SCHEDULE_011 | Cùng test 3 ngày cuối tháng 30 ngày | Giữ TC_CONFIG_006 ở module Config, bỏ duplicate ở Schedule hoặc refocus TC_SCHEDULE_011 vào tương tác tuần + cuối tháng |
| TC_FILTER_012 + TC_FILTER_013 | Boundary test count_failed 4 và 5 — nên gộp thành 1 boundary test case | Merge: seed cả 2 PI cùng lúc, assert 1 pass 1 fail |

---

## 3. TESTCASE CẦN CHỈNH SỬA

### 3.1. TC_STATE_002 — Fix PI ID naming

**Hiện tại:**
- Pre-condition ghi `state101-001` đến `state101-101`
- Expected cursor sequence: `["state-100", "state-101"]`

**Đề xuất sửa:**
- Thống nhất: `state101-001` → cursor expected `state101-100` sau cycle 1, `state101-101` sau cycle 2
- Hoặc đổi PI naming thành `state-001` đến `state-101`

---

### 3.2. TC_SCHEDULE_009 — Thêm negative date

**Hiện tại:** Chỉ test 26, 27, 28/02/2027

**Đề xuất sửa:** Thêm ngày 25/02/2027 vào test data với expected = "normal" (không phải month-end). Cũng cần test ngày 01/03/2027 nếu A-02 được chốt.

---

### 3.3. Tất cả TC_FILTER_* — Cụ thể hóa test steps

**Hiện tại (copy-paste cho mọi case):**
```
1. Seed PI theo TEST DATA vào Solr test.
2. Set feature flag và clock theo TEST DATA.
3. Trigger đúng một cycle loader.
4. Capture Solr query, log và RabbitMQ message.
5. Đối chiếu PI ID actual với expected.
```

**Đề xuất sửa cho TC_FILTER_004 (PI link=null):**
```
1. Seed 2 PI vào Solr: 
   - `filter004` (link=null, mọi field khác hợp lệ)
   - `filter004-control` (có link, giống hệt filter004)
2. Set clock=2026-09-10T10:00:00+07:00, loader=true, auto-select=1.
3. Trigger đúng một cycle loader VN.
4. Capture Solr query thực tế từ application log.
5. Assert: query chứa `link:[* TO *]`.
6. Assert: queue VN chỉ có `filter004-control`, không có `filter004`.
7. Assert: Redis không tạo member cho `filter004`.
```

---

### 3.4. TC_RELIABILITY_005-009 — Sửa TEST TYPE

Đổi `TEST TYPE` từ `Functional` sang:
- TC_RELIABILITY_001-004: `Fault Injection / Reliability`
- TC_RELIABILITY_005: `Security / Permission`
- TC_RELIABILITY_006: `Regression`
- TC_RELIABILITY_007: `Performance`
- TC_RELIABILITY_008: `Security / Observability`
- TC_RELIABILITY_009: `Fault Tolerance`

---

### 3.5. TC_QUEUE_006 — Cần chi tiết hơn test steps cho concurrent scenario

**Hiện tại:** Steps quá đơn giản cho concurrent test.

**Đề xuất sửa:**
```
1. Set queue depth = 999 bằng cách publish 999 dummy messages.
2. Seed PI `race-001` cho instance A và `race-002` cho instance B.
3. Đồng thời trigger 2 loader instance (hoặc dùng 2 pod).
4. Theo dõi final queue depth liên tục trong 30s.
5. Export toàn bộ message queue sau khi cả 2 instance hoàn thành.
6. Assert: total depth ≤ 1000 (hoặc tuân thủ overshoot contract).
7. Assert: không duplicate PI giữa 2 instance.
8. Assert: cursor không conflict/overwrite.
```

---

## 4. TESTCASE NÊN BỔ SUNG

### 4.1. Thiếu hoàn toàn — Critical Gap

| # | TC đề xuất | Module | Lý do cần | Requirement mapping |
| --- | --- | --- | --- | --- |
| 1 | **TC_FILTER_016**: PI source_id sai domain (VN PI dùng `shopee.th`) | Solr Filter | FR-02 yêu cầu đúng source. Hiện chỉ test shop exclusion, chưa test source_id filter. | FR-02 |
| 2 | **TC_FILTER_017**: PI crawled_date = null | Solr Filter | A-09 ghi nhận data legacy. Null crawled_date có thể bypass 30-day check. | FR-04, A-09 |
| 3 | **TC_QUEUE_008**: Loader VN gửi đúng domain metadata trong payload | Queue | OR-03 chỉ test queue name. Cần test payload chứa đúng domain/source. | OR-03, A-08 |
| 4 | **TC_QUEUE_009**: Downstream consumer xử lý thành công 1 message 5 PI | Integration | Test plan §3.2 yêu cầu smoke integration với downstream. Hiện chưa có TC nào test consumer. | §3.2, OR-02 |
| 5 | **TC_SCHEDULE_016**: Boundary chuyển ngày 23:59:59 → 00:00:00 khi ngày thường → priority | Schedule | Test plan §3.1 mô tả boundary chuyển ngày là scenario chính. TC_SCHEDULE_015 chỉ test timezone nhưng không test exact midnight transition thường → priority. | §3.1 |
| 6 | **TC_CONFIG_008**: Thay đổi feature flag từ auto-select=1 sang 0 runtime (hot reload) | Config | Test plan đề cập rollback bằng flag. Cần test hot reload hoặc restart sau đổi config. | SC-02, A-05 |
| 7 | **TC_STATE_008**: Cursor reset/recovery khi giá trị cursor bị corrupt trong DB | Cursor & Redis | R-09 nêu rủi ro cursor cũ. Cần test DB có cursor value không tồn tại trong Solr. | R-09 |
| 8 | **TC_BATCH_009**: Batch chứa mix PI valid và PI đã có trong Redis (dedup trong batch) | Batch & Chunking | TC_STATE_006 test single PI dedup. Cần test dedup khi một phần batch đã có trong Redis. | OR-06 |

### 4.2. Thiếu nhưng có thể chấp nhận ở phase sau — Medium Gap

| # | TC đề xuất | Module | Lý do |
| --- | --- | --- | --- |
| 9 | **TC_DATA_001**: Chạy full cycle VN rồi so sánh tập PI expected (Golden Dataset full reconciliation) | Data Consistency | Test plan §3.3 yêu cầu data consistency nhưng chưa có TC riêng cho full reconciliation flow |
| 10 | **TC_DATA_002**: Chạy 2 cycle liên tiếp, assert không duplicate PI nào (cross-cycle dedup) | Data Consistency | Hiện chỉ test dedup trong 1 cycle (Redis), chưa test cross-cycle |
| 11 | **TC_SCHEDULE_017**: Tháng 12 → tháng 01 năm mới (cross-year month-end) | Schedule | Edge case tháng cuối năm: Dec 29, 30, 31, Jan 01 |
| 12 | **TC_RELIABILITY_010**: Loader restart giữa chừng khi đang chia chunk (sau fetch, đang chunk) | Reliability | Hiện có crash before/after publish. Thiếu crash during chunking |
| 13 | **TC_PERF_001**: Nhiều cycle liên tiếp (stress/soak test nhỏ - 10 cycles) | Performance | TC_RELIABILITY_007 chỉ test 5 run. Cần đo resource leak qua nhiều cycle hơn |
| 14 | **TC_ZONE_011**: Ngày thường, PI vùng ưu tiên không bị enqueue (negative cross-zone) | Zone Selection | Chứng minh PI Mall/Official KHÔNG được lấy vào ngày thường |
| 15 | **TC_FILTER_018**: PI có `count_failed` > 5 (ví dụ 10) cũng bị loại | Solr Filter | Chỉ test boundary 4/5, chưa test giá trị lớn hơn nhiều |

---

## 5. BỘ TESTCASE PHIÊN BẢN CẢI THIỆN

### 5.1. Thay đổi cấu trúc đề xuất

> [!IMPORTANT]
> Thêm 2 cột mới vào spreadsheet:

| Cột mới | Mục đích |
| --- | --- |
| **REQUIREMENT REF** | Mapping đến FR-xx, OR-xx, SC-xx, DT-xx, A-xx từ Test Plan |
| **ENVIRONMENT** | Staging/Local/UAT — giúp planning execution |

### 5.2. Thay đổi TEST TYPE cho các case hiện tại

| TC ID | TEST TYPE hiện tại | TEST TYPE đề xuất |
| --- | --- | --- |
| TC_QUEUE_003 | Functional | Integration |
| TC_STATE_003, TC_STATE_004 | Functional | Fault Injection |
| TC_RELIABILITY_001–004, TC_RELIABILITY_009 | Functional | Fault Injection / Reliability |
| TC_RELIABILITY_005 | Functional | Security |
| TC_RELIABILITY_006 | Functional | Regression |
| TC_RELIABILITY_007 | Functional | Performance |
| TC_RELIABILITY_008 | Functional | Security / Observability |

### 5.3. Merge recommendations

| Action | TC gốc | TC mới |
| --- | --- | --- |
| Merge | TC_SCHEDULE_002 + 003 + 004 | **TC_SCHEDULE_002**: "VN priority trên các ngày ưu tiên (Thu/Fri/Sat/Sun)" — data-driven 4 rows |
| Merge | TC_SCHEDULE_006 + 007 | **TC_SCHEDULE_006**: "TH priority trên các ngày ưu tiên (Fri/Sat)" — data-driven 2 rows |
| Merge | TC_FILTER_012 + 013 | **TC_FILTER_012**: "Boundary count_failed=4 (pass) vs 5 (fail)" — 2 PI seed cùng lúc |
| Remove duplicate | TC_SCHEDULE_011 | Remove (covered by TC_CONFIG_006 + TC_SCHEDULE_012) |

### 5.4. Tổng hợp số lượng sau cải thiện

| Loại | Số lượng |
| --- | --- |
| TC hiện tại | 49 |
| TC bị merge/remove | -4 |
| TC bổ sung Critical | +8 |
| TC bổ sung Medium | +7 |
| **Tổng sau cải thiện** | **~60 TC** |

---

## 6. PHÂN TÍCH CHI TIẾT TẠI SAO TỪNG NHÓM CASES PHẢI CÓ

### 6.1. Feature Flag & Configuration (TC_CONFIG_001–007)

#### Tại sao phải có?

Feature flag là **cơ chế rollback duy nhất không cần deploy lại code**. Nếu feature flag không hoạt động đúng:
- Bật loader nhưng không chạy = mất data crawl hàng ngày
- Tắt loader nhưng vẫn chạy = tốn tài nguyên, có thể conflict với maintenance
- Bật auto-select nhưng không filter = crawl sai vùng, data nghiệp vụ bị trễ
- Tắt auto-select nhưng vẫn filter = regression, crawl ít hơn bình thường

#### Phân tích từng case:

| TC | Loại | Tại sao? |
| --- | --- | --- |
| TC_CONFIG_001 | Happy path | **Proof of life**: chứng minh hệ thống hoạt động ở trạng thái bình thường. Nếu case này fail, tất cả case khác đều vô nghĩa. Đây là "smoke test" đầu tiên phải pass. |
| TC_CONFIG_002 | Negative | **Kill switch**: chứng minh khi tắt loader, hệ thống THỰC SỰ dừng. Quan trọng vì nếu loader vẫn chạy khi tắt flag, ta không có cách rollback an toàn. Test gọi trigger 2 lần để loại trừ race condition "đang chạy dở". |
| TC_CONFIG_003 | Positive | **Core feature**: auto-select là toàn bộ mục đích của YNMPECA-9325. Case này chứng minh khi bật, Solr query thực sự thêm filter `(official:1 OR industry_id:[* TO *])`. Nếu query không thay đổi, feature không hoạt động. |
| TC_CONFIG_004 | Positive/Regression | **Backward compatibility**: khi tắt auto-select, hệ thống phải quay về query baseline cũ. Đây là guard chống regression — đảm bảo code mới không vô tình thay đổi behavior cũ. Phụ thuộc A-05 (baseline query). |
| TC_CONFIG_005 | Positive | **Mapping correctness**: `0,4,5,6` phải map đúng Sun/Thu/Fri/Sat. Sai mapping = sai ngày priority = crawl sai vùng toàn bộ tuần. Case test 7 ngày liên tiếp để phát hiện off-by-one hoặc nhầm Monday=0 vs Sunday=0. |
| TC_CONFIG_006 | Positive/Boundary | **Month-end accuracy**: `MONTH_END_PRIORITY_DAYS=3` phải chọn đúng 3 ngày cuối. Test 4 ngày (27–30/09) chứng minh boundary: 28 trở đi = priority, 27 = không. Sai 1 ngày = dữ liệu cuối kỳ bị crawl sai vùng. |
| TC_CONFIG_007 | Negative/Defensive | **Invalid config guard**: Technical Wiki ghi code chưa validate `MONTH_END_PRIORITY_DAYS`. Nếu deploy giá trị 0, -1, 32 hoặc "abc", loader có thể crawl 0 ngày cuối tháng (mất data) hoặc crash. Case này expose deployment risk. |

---

### 6.2. Priority Schedule (TC_SCHEDULE_001–015)

#### Tại sao phải có?

Schedule quyết định **VÀO NGÀY NÀO, CRAWL VÙNG NÀO**. Sai schedule = crawl sai vùng = dữ liệu kinh doanh (Mall, Official, industry có khách) bị trễ hoặc thiếu vào đúng thời điểm báo cáo.

Đặc biệt nguy hiểm vì:
- **Sai im lặng**: job vẫn success, queue vẫn có message, nhưng tập PI ID sai
- **Khó phát hiện**: chỉ khi đối soát PI ID mới thấy sai vùng
- **Impact lớn**: ảnh hưởng đến toàn bộ PI của domain (hàng chục ngàn records)

#### Phân tích từng case:

| TC | Loại | Tại sao? |
| --- | --- | --- |
| TC_SCHEDULE_001 | Positive | **Ngày thường VN**: chứng minh Mon/Tue/Wed dùng Vùng 3 `(official:0 AND -industry_id:*)`. Nếu ngày thường vẫn crawl Vùng 1+2, data không cần thiết bị crawl, làm chậm processing PI thường. |
| TC_SCHEDULE_002 | Positive | **Ngày priority VN — Thu**: day_index=4 thuộc rule `0,4,5,6`. Chứng minh hệ thống nhận đúng Thứ Năm là priority. |
| TC_SCHEDULE_003 | Positive | **Ngày priority VN — Fri+Sat**: day_index=5,6. Cover 2 ngày cùng lúc giảm effort. |
| TC_SCHEDULE_004 | Positive | **Chủ Nhật = day_index=0**: Edge case vì nhiều implementation dùng 0=Monday. Case này chứng minh system đúng 0=Sunday (theo Java/JavaScript convention). Nếu sai, mất 1/4 ngày priority. |
| TC_SCHEDULE_005 | Edge/Need Confirm | **TH weekday conflict**: BA nói TH chỉ Fri+Sat, Technical Wiki config `0,4,5,6`. Case này document conflict và buộc phải chốt trước khi test. Nếu không có case này, QA có thể test theo 1 source sai. |
| TC_SCHEDULE_006–007 | Positive | **TH priority Fri+Sat**: khi A-01 chốt, đây là happy path cho TH. |
| TC_SCHEDULE_008 | Edge/Need Confirm | **TH Sunday conflict**: tương tự TC_SCHEDULE_005 nhưng cho Sunday. |
| TC_SCHEDULE_009 | Edge/Boundary | **Tháng 28 ngày**: Feb non-leap year. Chứng minh "3 ngày cuối tháng" không hard-code ngày 28 hoặc 29. Nếu code dùng `lastDayOfMonth - 2`, Feb phải ra 26/27/28. |
| TC_SCHEDULE_010 | Edge/Boundary | **Tháng nhuận**: Feb 29 chỉ xảy ra mỗi 4 năm. Nếu code không xử lý leap year, ngày 29/02 có thể crash hoặc bị tính nhầm sang tháng 3. |
| TC_SCHEDULE_011 | Edge/Boundary | **Tháng 30 ngày**: September. Overlap với TC_CONFIG_006 — nên merge hoặc refocus. |
| TC_SCHEDULE_012 | Edge/Boundary | **Tháng 31 ngày**: August. Chứng minh 29/30/31 = priority, 28 = không. Phát hiện hard-code `30` thay vì dùng calendar API. |
| TC_SCHEDULE_013 | Edge/Need Confirm | **Ngày 01 tháng mới**: BA nói vẫn priority, Technical Wiki không nói. Case này test 4 timestamps: 23:59:59 ngày 30, 00:00:00 ngày 01, 23:59:59 ngày 01, 00:00:00 ngày 02. Chứng minh toàn bộ ngày 01 = priority và ngày 02 quay về weekly rule. |
| TC_SCHEDULE_014 | Edge/Dedup | **Overlap tuần + cuối tháng**: 31/10/2026 vừa là Saturday (weekly priority) vừa là cuối tháng. Chứng minh không duplicate query/message khi 2 rule cùng fire. |
| TC_SCHEDULE_015 | Edge/Integration | **Timezone**: Server UTC, business VN/TH. 16:59:59Z = 23:59:59+07 (ngày 27) vs 17:00:00Z = 00:00:00+07 (ngày 28). Sai timezone = chuyển vùng sớm/muộn 7 tiếng — ảnh hưởng đến nửa ngày crawl. |

---

### 6.3. Zone Selection (TC_ZONE_001–010)

#### Tại sao phải có?

Zone Selection kiểm tra **FILTER SOLR CÓ ĐÚNG KHÔNG**. Đây là lõi nghiệp vụ của YNMPECA-9325. Nếu filter sai:
- PI Mall bị crawl vào ngày thường → trễ data khách hàng
- PI Non-Mall bị crawl vào ngày ưu tiên → chiếm capacity của PI quan trọng
- PI rơi ngoài cả 2 vùng → bị bỏ sót hoàn toàn

Decision table `official` × `industry_id` tạo ra 6 tổ hợp (DT-01 đến DT-06). Mỗi tổ hợp phải có ít nhất 1 TC.

#### Phân tích từng case:

| TC | DT mapping | Tại sao? |
| --- | --- | --- |
| TC_ZONE_001 | DT-02 | PI `official=1, industry=null`: thuộc Vùng 1 vì `official:1` match nhánh OR. Chứng minh nhánh `official:1` hoạt động độc lập không cần `industry_id`. |
| TC_ZONE_002 | DT-03 (Vùng 1) | PI `official=0, industry=101 (có khách)`: theo BA thuộc Vùng 1. Chứng minh nhánh `industry_id:[* TO *]` chọn đúng PI non-Mall nhưng có industry quan trọng. |
| TC_ZONE_003 | DT-03 (Vùng 2) | PI `official=0, industry=202 (không khách)`: theo BA thuộc Vùng 2. Tuy nhiên technical query gộp Vùng 1+2, nên case này verify PI có industry bất kỳ đều vào vùng ưu tiên. |
| TC_ZONE_004 | DT-04 | PI `official=0, industry=null`: đúng là Vùng 3. Chứng minh `(official:0 AND -industry_id:[* TO *])` chọn PI "bình thường nhất". Đây là volume lớn nhất trong hệ thống. |
| TC_ZONE_005 | DT-01 | PI `official=1, industry=101`: thỏa CẢ HAI nhánh OR. Case quan trọng vì OR trong Solr có thể trả duplicate nếu query builder sai. Chứng minh PI chỉ xuất hiện 1 lần. |
| TC_ZONE_006 | DT-03/A-07 | PI `official=0, industry=202` test vào ngày thường. BA dùng OR (thuộc Vùng 3), Technical dùng AND (không thuộc Vùng 3). Case này document conflict và bắt phải chốt. |
| TC_ZONE_007 | DT-02/A-07 | PI `official=1, industry=null` test vào ngày thường. Nếu dùng BA OR logic, PI này match Vùng 3 (vì thiếu industry). Nếu dùng Technical AND logic, PI không match Vùng 3 (vì official≠0). Case phát hiện gap giữa 2 logic. |
| TC_ZONE_008 | DT-06/A-09 | PI `official=null, industry=null`: data legacy. Không match Vùng ưu tiên (official≠1, không có industry) VÀ không match Vùng thường theo Technical (official≠0). PI bị "bỏ rơi" — đây là bug tiềm ẩn nghiêm trọng. |
| TC_ZONE_009 | A-03 | **Block detection**: BA yêu cầu khi bị block, ưu tiên Vùng 1 trước Vùng 2. Technical chưa implement. Case này buộc Dev phải clarify cơ chế block. |
| TC_ZONE_010 | A-03 | **Vùng 1 hết → chuyển Vùng 2**: continuation của TC_ZONE_009. Chứng minh state transition đúng. |

---

### 6.4. Solr Eligibility Filter (TC_FILTER_001–015)

#### Tại sao phải có?

Mỗi filter là một **cổng an toàn** ngăn PI không đủ điều kiện bị crawl. Crawl PI sai:
- PI link=null → Shopee API fail, tốn quota
- PI inactive → crawl hoài không có kết quả, waste resources
- PI sold < 1000 → không cần crawl detail (shop crawl đã đủ chính xác)
- PI failed ≥ 5 → Shopee có thể đã xóa/block, crawl lại chỉ tăng error rate
- PI quá cũ (> 30 ngày) → data không còn giá trị cập nhật

Mỗi filter cần **ít nhất 1 positive + 1 negative** case. Boundary filter cần **thêm edge case**.

#### Phân tích từng case:

| TC | Filter Rule | Loại | Tại sao? |
| --- | --- | --- | --- |
| TC_FILTER_001 | FR-01 | Positive | `next_crawl_time < NOW` → PI đã đến hạn. Chứng minh filter hoạt động cơ bản. |
| TC_FILTER_002 | FR-01 | Boundary | `next_crawl_time = NOW` → inclusive boundary. Solr `[* TO NOW]` phải bao gồm đúng NOW. Off-by-one ở đây = mất 1 batch PI. |
| TC_FILTER_003 | FR-01 | Negative | `next_crawl_time = NOW+1s` → chưa đến hạn. Chứng minh filter loại đúng PI chưa cần crawl. |
| TC_FILTER_004 | FR-03 | Negative | `link=null` → không thể crawl. Nếu enqueue, downstream crawler sẽ fail 100%. |
| TC_FILTER_005 | FR-03 | Negative | `is_crawling_active=0` → PI đã bị tắt crawl. Business decision, phải tuân thủ. |
| TC_FILTER_006 | FR-03 | Negative | `product_status=0` → sản phẩm không hoạt động. Crawl PI đã xóa/ẩn trên Shopee = wasted request. |
| TC_FILTER_007 | FR-05 | Boundary/Neg | `latest_sold=999` → dưới ngưỡng 1000. PI này Shopee trả sold chính xác qua shop crawl, không cần detail crawl. |
| TC_FILTER_008 | FR-05 | Boundary/Pos | `latest_sold=1000,1001` → đúng ngưỡng và trên ngưỡng. Chứng minh boundary inclusive. |
| TC_FILTER_009 | FR-04 | Positive | `crawled_date` trong 30 ngày → PI còn fresh, cần update. |
| TC_FILTER_010 | FR-04 | Boundary | `crawled_date` đúng 30 ngày → boundary inclusive. Sai boundary = mất hàng trăm PI ở cận 30 ngày. |
| TC_FILTER_011 | FR-04 | Negative | `crawled_date` quá 30 ngày → PI quá cũ, không cần crawl. |
| TC_FILTER_012 | FR-06 | Boundary/Pos | `count_failed=4` → vẫn trong ngưỡng retry. PI còn cơ hội crawl thành công. |
| TC_FILTER_013 | FR-06 | Boundary/Neg | `count_failed=5` → đạt ngưỡng loại. PI đã fail quá nhiều, cần human intervention. |
| TC_FILTER_014 | FR-07 | Negative/VN | Shop exclusion VN: `469064007`, `1506174776`. Các shop này có issue riêng (có thể là shop test/spam). Chứng minh query loại đúng. |
| TC_FILTER_015 | FR-07 | Negative/TH | Shop exclusion TH: `1449018616`. Chứng minh danh sách VN/TH không cross-use (VN shop exclusion không loại shop TH). |

---

### 6.5. Batch & Chunking (TC_BATCH_001–008)

#### Tại sao phải có?

Batch/Chunk quyết định **CÁCH CHIA DATA THÀNH MESSAGE**. Sai chia:
- Message > 5 PI → Shopee API reject → mất data
- Message rỗng → waste queue/processing
- Thiếu PI → data loss
- Trùng PI → double crawl, sai metric sold

Test plan định nghĩa rõ: `expected_messages = ceil(fetched_PI / 5)`. Các boundary cần test:

| TC | Scenario | Tại sao? |
| --- | --- | --- |
| TC_BATCH_001 | 0 PI | **Empty result**: chứng minh loader không crash khi Solr trả rỗng và không tạo message rỗng. Đây là case đầu tiên khi deploy lên env mới. |
| TC_BATCH_002 | 1 PI | **Minimum viable**: 1 PI → 1 message với 1 PI. Chứng minh không padding null ID vào message. |
| TC_BATCH_003 | 4 PI | **Under chunk size**: 4 < 5 → 1 message với 4 PI. Chứng minh không split dư thành 2 message. |
| TC_BATCH_004 | 5 PI | **Exact chunk size**: 5 = 5 → 1 message đúng giới hạn Shopee. Chứng minh boundary inclusive. |
| TC_BATCH_005 | 6 PI | **Over chunk size**: 6 = 5+1 → 2 messages. Chứng minh split đúng, không message nào > 5. |
| TC_BATCH_006 | 99 PI | **Under batch size**: 99 < 100 → fetch 1 lần, 20 messages (19×5+1×4). Chứng minh cursor không trigger batch 2 không cần thiết. |
| TC_BATCH_007 | 100 PI | **Exact batch size**: 100 = batch_size → fetch 1 lần, 20 messages (20×5). Boundary of fetch. |
| TC_BATCH_008 | 101 PI | **Over batch size**: 101 → fetch 100 đầu + cursor → fetch 1 còn lại. Chứng minh multi-batch hoạt động, cursor đúng, không mất PI thứ 101. |

---

### 6.6. RabbitMQ Routing & Capacity (TC_QUEUE_001–007)

#### Tại sao phải có?

Queue routing quyết định **DATA ĐI ĐÂU**. Cross-domain = bug Critical vì data VN xuất hiện trong report TH và ngược lại. Queue threshold quyết định **KHÔNG LÀM QUÁ TẢI DOWNSTREAM**.

| TC | Scenario | Tại sao? |
| --- | --- | --- |
| TC_QUEUE_001 | VN → queue VN | **Positive routing**: PI VN phải đi `eca_shopee_product_item_unify_crawling`. Nếu sai queue, downstream VN không nhận data, TH nhận data lạ. |
| TC_QUEUE_002 | TH → queue TH | **Positive routing TH**: tương tự VN. Cần confirm source_id TH chính thức. |
| TC_QUEUE_003 | VN+TH concurrent | **Cross-domain isolation**: 2 loader chạy đồng thời. Chứng minh không cross-enqueue, không dùng nhầm exclusion list, không share cursor/Redis. Đây là case Critical vì production chạy VN+TH song song. |
| TC_QUEUE_004 | Queue depth=999 | **Boundary threshold under**: 999 < 1000 → còn capacity → publish thêm. Chứng minh loader không dừng sớm. |
| TC_QUEUE_005 | Queue depth=1000 | **Boundary threshold exact**: 1000 = max → loader KHÔNG publish thêm. Nếu vẫn publish, downstream bị overload. |
| TC_QUEUE_006 | Concurrent loaders, depth=999 | **Race condition**: 2 loader cùng thấy capacity=1 nhưng cả 2 đều publish → vượt 1000. Đây là concurrency bug phổ biến. |
| TC_QUEUE_007 | DLQ | **Fault tolerance**: message lỗi không mất. Chứng minh DLQ routing hoạt động, message có thể retry/investigate. Nếu không có DLQ, data loss im lặng. |

---

### 6.7. Cursor & Redis (TC_STATE_001–007)

#### Tại sao phải có?

Cursor và Redis là **bộ nhớ trạng thái** của loader. Sai trạng thái:
- Cursor vượt quá → PI bị skip vĩnh viễn = data loss
- Cursor không tiến → PI bị crawl lặp vô tận = waste + duplicate
- Redis không dedup → PI crawl trùng trong cycle
- Redis xóa nhầm → PI đang crawl bị gọi lại

| TC | Scenario | Tại sao? |
| --- | --- | --- |
| TC_STATE_001 | Cursor update after success | **Contract verification**: cursor chỉ tiến SAU KHI publish thành công. Nếu cursor tiến trước → crash = mất data. |
| TC_STATE_002 | Multi-batch cursor | **Continuity**: 101 PI qua 2 batch. Cursor phải đúng sau batch 1 (100) và batch 2 (101). Đây là case production thực tế khi dataset lớn. |
| TC_STATE_003 | Crash before publish | **No data loss**: crash trước khi gửi = cursor không tiến = restart sẽ gửi lại. Chứng minh atomicity. |
| TC_STATE_004 | Crash after publish, before cursor | **Duplicate handling**: message đã gửi nhưng cursor chưa lưu → restart gửi lại → duplicate. Case này verify delivery semantic (at-least-once thì duplicate OK). |
| TC_STATE_005 | Redis cleanup expired | **Cache hygiene**: expired record phải xóa để PI có thể được re-crawl khi đến hạn lại. Active record phải giữ để tránh duplicate trong cycle hiện tại. |
| TC_STATE_006 | Redis dedup active PI | **Prevent duplicate**: PI đang có trong Redis (chưa hết hạn) không được gửi lại dù Solr vẫn trả. Đây là cơ chế chống crawl trùng chính. |
| TC_STATE_007 | VN/TH state isolation | **Cross-domain safety**: restart TH không reset cursor VN. Redis key VN/TH phải khác nhau. Nếu share key, restart 1 domain ảnh hưởng domain kia. |

---

### 6.8. Reliability & Observability (TC_RELIABILITY_001–009)

#### Tại sao phải có?

Production luôn có **failure**. Solr timeout, RabbitMQ restart, Redis full, DB failover... Nếu loader không xử lý đúng:
- Publish data thiếu → sai metric
- Cursor tiến khi data chưa gửi → mất data vĩnh viễn
- Crash loop → service down
- Log không đủ → không investigate được khi incident xảy ra

| TC | Scenario | Tại sao? |
| --- | --- | --- |
| TC_RELIABILITY_001 | Solr timeout | Solr là nguồn data duy nhất. Timeout = không có PI → loader KHÔNG được tạo message từ partial data hoặc cache cũ. |
| TC_RELIABILITY_002 | RabbitMQ timeout | Publish fail = PI chưa gửi. Cursor KHÔNG được tiến. Retry phải xảy ra khi recover. |
| TC_RELIABILITY_003 | Redis down | Redis down = không dedup được. Loader phải fail-safe: hoặc dừng (fail-closed) hoặc chấp nhận duplicate (fail-open). Phải chốt contract. |
| TC_RELIABILITY_004 | DB cursor write fail | Cursor không lưu được = restart sẽ gửi lại batch → duplicate. Loader không được báo "success" nếu cursor chưa persist. |
| TC_RELIABILITY_005 | Permission denied | Security: credential sai → RabbitMQ reject. Loader phải log error, cursor không tiến, **KHÔNG in password/token vào log**. |
| TC_RELIABILITY_006 | Rollback by flag | **Operational safety**: chứng minh tắt auto-select = quay về behavior cũ mà không cần rollback image. Đây là runbook step #1 khi incident. |
| TC_RELIABILITY_007 | Performance baseline | Đo thời gian xử lý 100 PI × 5 runs. Phát hiện regression, memory leak, resource exhaustion trước khi lên production. |
| TC_RELIABILITY_008 | Log quality + security | Log phải đủ để investigate (run ID, domain, zone, counts) nhưng KHÔNG chứa password/token. Cân bằng giữa observability và security. |
| TC_RELIABILITY_009 | Malformed data | Solr có thể chứa data legacy sai kiểu (`latest_sold="one-thousand"`). 1 PI sai không được crash toàn batch. Isolation contract. |

---

## TÓM TẮT ĐÁNH GIÁ CHUNG

| Tiêu chí | Đánh giá | Ghi chú |
| --- | --- | --- |
| Coverage so với requirement | ⭐⭐⭐⭐ (4/5) | Thiếu 8 TC Critical, đặc biệt source_id filter, downstream integration, cross-zone negative |
| Chất lượng test data | ⭐⭐⭐⭐⭐ (5/5) | JSON structured, boundary values đầy đủ, PI ID truy vết được |
| Chất lượng test steps | ⭐⭐⭐ (3/5) | Quá generic, copy-paste, cần cụ thể hóa assertion cho từng case |
| Chất lượng expected result | ⭐⭐⭐⭐ (4/5) | Hầu hết rõ ràng, có ghi Need Confirm đúng chỗ, nhưng một số case thiếu assertion cụ thể |
| Tổ chức/cấu trúc | ⭐⭐⭐⭐ (4/5) | Chia module tốt, thiếu requirement mapping column, TEST TYPE không chính xác |
| Need Confirm handling | ⭐⭐⭐⭐⭐ (5/5) | Xuất sắc — ghi rõ dependency, không tự đánh pass, document conflict |
| Tính thực thi | ⭐⭐⭐⭐ (4/5) | Có thể execute ngay sau khi Need Confirm được chốt, pre-condition đủ chi tiết |

> [!TIP]
> **Recommendation**: Bộ testcase hiện tại đã đạt mức **GOOD** với 49 TC. Sau khi áp dụng các cải thiện ở trên (thêm 8 TC Critical, merge 4 TC trùng, cụ thể hóa test steps, thêm requirement mapping), bộ testcase sẽ đạt mức **EXCELLENT** với ~60 TC comprehensive coverage.
