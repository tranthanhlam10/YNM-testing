# Tổng hợp integration ECI cho release ClickHouse

Ngày rà soát: **24/08/2026**  
Khoảng Jira được đọc: **24/07/2026–24/08/2026**, lấy cả task được tạo mới hoặc có cập nhật trong kỳ.  
Release Jira: [YNMPECA-9354](https://jira.younetco.com/browse/YNMPECA-9354) — `RELEASE CLICKHOUSE V1.38.0 (31/08/2026)`.

## 1. Kết luận nhanh

Chưa nên kết luận **Go** cho integration/release ở trạng thái hiện tại. Release ticket đang liệt kê 5 task chính, nhưng luồng dữ liệu thực tế còn phụ thuộc Detect Invalid, Calculate Report, Airflow, ghi ngược Weekly Sales về Solr, parity dữ liệu và các regression trên crawler/App.

Các điều kiện đang chặn hoặc cần hoàn tất trước sign-off:

1. `YNMPECA-9348` còn **In Progress** và `YNMPECA-9349` còn **Open**.
2. `YNMPECA-9352` còn **Testing**; sheet Airflow còn 3 test case **OPEN**.
3. Bộ `YNMPECA-9280` có 30 test case nhưng báo cáo hiện là 12 Passed, 1 Failed/Bug, 1 Open, 1 N/A, 15 Ignore. Nhiều case bị Ignore thuộc đúng core flow Detect Invalid, Calculate, parity và VN/TL.
4. Bộ `YNMPECA-9360` có 71 test case: 66 Passed, 2 Bug, 3 Ignore. Jira bug `YNMPECA-9374` đã Closed nhưng sheet vẫn chưa được re-test/cập nhật về Passed.
5. Bộ `YNMPECA-9338` có 25 test case: 24 Passed, 1 Ignore. Case bị Ignore là kiểm tra downstream Weekly/Monthly không double-count sau rải số — đây là integration gate, không nên để out-of-scope cho release ClickHouse.
6. Code review `YNMPECA-9338` và kết quả execution chưa đồng nhất về idempotency, duplicate, `Math.random()`, cursor termination và cách dùng `FINAL`. Cần chốt version code/requirement và evidence mới nhất.

## 2. Task chính trong release

| Jira | Nội dung | Trạng thái 24/08 | Vai trò trong integration | Hành động bắt buộc |
| --- | --- | --- | --- | --- |
| [YNMPECA-9280](https://jira.younetco.com/browse/YNMPECA-9280) | Setup ClickHouseDB VN/TL | To Be Deployed | Schema, adapter, Detect Invalid/Calculate query, pusher, App histories, remove legacy history | Chạy lại core cases đang Ignore/Open/Bug; xác nhận VN và TL; parity Timescale/AWS/ClickHouse; rollback datasource |
| [YNMPECA-9338](https://jira.younetco.com/browse/YNMPECA-9338) | Thay đổi phương án rải số ở ClickHouse | To Be Deployed | Fill missing dates trước khi tính WS/MS | Chạy dry-run → write trên bảng cô lập → rerun/overlap → `FINAL` → targeted WS/MS; chốt duplicate/idempotency và deterministic rule |
| [YNMPECA-9348](https://jira.younetco.com/browse/YNMPECA-9348) | Migrate `sold_history` VN/TL từ 2023 đến hiện tại | In Progress | Điều kiện dữ liệu đầu vào trước cutover | Chốt count/min-max date/checksum theo source, failed IDs, resume/retry, VN/TL, post-migration parity và rollback |
| [YNMPECA-9349](https://jira.younetco.com/browse/YNMPECA-9349) | Chuyển các luồng crawler còn dùng `sold_history/crawled_history` | Open | Ngăn crawler/pusher/loader/resolver phụ thuộc Solr history sau cutover | Inventory code/service/queue; test từng luồng; chứng minh không còn read/write legacy field; xác nhận thứ tự deploy |
| [YNMPECA-9352](https://jira.younetco.com/browse/YNMPECA-9352) | Chuyển Airflow calculation sang ClickHouse | Testing | Orchestration Detect Invalid → Calculate Report → Priority Migration | Chạy nốt 3 OPEN cases; verify weekly/monthly branch, blocking khi report chưa DONE, failure propagation và rerun |

## 3. Task phụ thuộc phải đưa vào integration

| Jira | Trạng thái | Lý do phải chạy/đối chiếu |
| --- | --- | --- |
| [YNMPECA-9339](https://jira.younetco.com/browse/YNMPECA-9339) | To Be Deployed | Tối ưu trực tiếp Detect Invalid và Calculate Report cho ClickHouse; phải test cùng `9280/9352`, không tách rời |
| [YNMPECA-9360](https://jira.younetco.com/browse/YNMPECA-9360) | To Be Deployed | Ghi ngược/xóa WS ở Solr sau re-adjust; là downstream trực tiếp của Detect Invalid |
| [YNMPECA-9374](https://jira.younetco.com/browse/YNMPECA-9374) | Closed | Bug từng xóa `currentWeek` thay vì `prevWeek`; cần regression evidence trên build release |
| [YNMPECA-9350](https://jira.younetco.com/browse/YNMPECA-9350) | Closed | Dataset/reference đối chiếu WS/MS Jun–Jul giữa ClickHouse, AWS và Timescale |
| [YNMPECA-9322](https://jira.younetco.com/browse/YNMPECA-9322) | In Progress | Task verify số liệu ClickHouse; cần chốt threshold parity và danh sách chênh lệch được chấp thuận |
| [YNMPECA-9344](https://jira.younetco.com/browse/YNMPECA-9344) | In Progress | Quy tắc WS/MS sau khi thay Timescale bằng ClickHouse chưa hoàn tất; đây là test oracle |
| [YNMPECA-9113](https://jira.younetco.com/browse/YNMPECA-9113) | Open | Bỏ khái niệm Solr `sold_history`; liên quan trực tiếp cutover và tránh hai nguồn ghi song song |
| [YNMPECA-9378](https://jira.younetco.com/browse/YNMPECA-9378) | In Progress | Migration PI histories từ Solr/Timescale sang ClickHouse; cần tránh trùng scope hoặc bỏ sót với `9348` |
| [YNMPECA-9320](https://jira.younetco.com/browse/YNMPECA-9320) / [YNMPECA-9321](https://jira.younetco.com/browse/YNMPECA-9321) | To be Tested | Sync PIW/PIM và query export bằng ClickHouse; cần smoke extraction/report sau cutover |

## 4. Regression bắt buộc từ `Document/ECI`

### 4.1 Crawler, loader, resolver, pusher

Theo `Task clickhouse của ECI.md` và `YNMPECA-9349`, cần chạy toàn bộ đường đi:

`crawler/loader → resolver → data pusher → cl.eca.product_item_histories → ClickHouse → Detect Invalid/Calculate → Solr PIW/PIM → App/report`.

Tối thiểu phải kiểm tra:

- VN và TL cho Shopee, Tiki, Lazada, TikTok theo service có sẵn.
- Message đủ field, mapping đúng, không mất message khi ClickHouse lỗi, retry không ghi trùng logic.
- Không còn service dùng `cl-team-timescaledb-...` hoặc đọc `sold_history/crawled_history` ngoài fallback được phê duyệt.
- Queue lag, DLQ, retry, count input/insert/error và log không lộ secret.

### 4.2 Tracking title change — `YNMPECA-9228`

Task đã Closed nhưng tài liệu ECI vẫn tham chiếu pusher Timescale. Cần smoke lại:

- `cl.eca.product_item_histories` → detect title change → `app.eci.sync_title_changed` / `app.eci.sync_title_miss`.
- `title_history`, Redis `title_hash`, Solr `product_items`, filter và popup lịch sử trên App.
- Cold cache, title không đổi sau normalize, title đổi thật, retry/duplicate và timezone.

### 4.3 Official/Mall — `YNMPECA-9240`

Field `official` có trong history schema và đi qua loader/resolver/pusher. Chạy smoke E2E để bảo đảm:

- Giá trị `official=1` không bị hạ về `0/null`.
- Rule đúng cho loader, resolver, data pusher và source updater.
- VN/TL và các platform có deployment trong tài liệu; chú ý ghi nhận cũ cho biết Shopee staging từng lỗi.

### 4.4 Lock industry/report sync — `YNMPECA-9276`

ClickHouse cutover không được làm thay đổi dữ liệu WS/MS đã chốt. Chạy lại bộ regression ưu tiên:

- Locked/unlocked ở open và closed period; cả record-side và current-PI-side.
- Weekly/monthly boundary, ngày 17, timezone và cross-year.
- Hai message locked/unlocked, `lookupFilters`, full/restricted range.
- Redis hash lifecycle, callback order, partial success/failure và trạng thái chỉ `Synced` khi hết hash.
- Concurrency giữa Sync PI và Sync Industry; record-level diff thay vì chỉ aggregate.

## 5. Đối chiếu test plan/test cases hiện có

| Bộ test | Hiện trạng | Nhận xét/gap trước release |
| --- | --- | --- |
| [9280 Google Sheet](https://docs.google.com/spreadsheets/d/1EF6cHhZ4ncRRK0N9LutwmbdAGuD65nko_K6hTMoBiYg/edit) | 30 TC: 12 Passed, 1 Failed/Bug, 1 Open, 1 N/A, 15 Ignore | Chưa đủ làm release evidence. Core Detect Invalid/Calculate/parity đang bị Ignore; `TC_CALC_008` là Bug, `TC_PUSHER_004` Open |
| [9280 Test Plan](../test_plans/local/eci_clickhouse_product_item_histories/TestPlan_YNMPECA-9280_Setup_ClickHouseDB_ECI.md) | Draft/Pending sign-off; trạng thái subtask trong plan đã cũ | Cập nhật theo Jira live; chốt Merge/FINAL, timezone, date boundary, parity threshold, queue retry, VN/TL và rollback |
| [9338 Google Sheet](https://docs.google.com/spreadsheets/d/13rZrkCYRJq9ZeFZ9BIFYrUcLHB7Octzoi43ytESJk5M/edit) | 25 TC: 24 Passed, 1 Ignore | Bắt buộc chạy `TC_OUT_004` targeted Weekly/Monthly để loại double-count |
| [9338 Test Plan](../test_plans/local/eci_clickhouse_fill_missing_date/TestPlan_YNMPECA-9338_Change_Number_Distribution_Method.md) | Draft/Pending review | Exit criteria yêu cầu no duplicate/idempotency, nhưng execution đang chấp nhận dùng `FINAL`; cần chốt contract chính thức |
| [9338 Code Review](../test_plans/local/eci_clickhouse_fill_missing_date/CodeReview_YNMPECA-9338_Migrate_Fill_Missing_Dates_ClickHouse.md) | Khuyến nghị không sign-off Production ở version được review | Reconcile lại finding Critical/High với code/build hiện tại: FR-02, FR-05, cursor, duplicate, random, Remove Buff, left anchor, partial write |
| [9352 Google Sheet](https://docs.google.com/spreadsheets/d/1Gn17ScfLAWDlqgMjNhIMtmzpaR-wqFWSk7CJNghY9pA/edit) | 14 TC: 11 Passed, 3 Open | Chạy `TC-AIRFLOW-004`, `TC-AIRFLOW-013`, `TC-AIRFLOW-014`; subtask Wiki/testcase vẫn To be Tested |
| [9360 Google Sheet](https://docs.google.com/spreadsheets/d/1VqzPpsqxtbB9y2j3r4-NDbpGqtHoT1GKET08Aj7dJf0/edit) | 71 TC: 66 Passed, 2 Bug, 3 Ignore | Re-test 2 BUG cases trên build fix; chạy/waive có owner cho recovery và cross-system failure; cập nhật sheet/Jira đồng nhất |
| [9360 Test Plan](../test_plans/local/eci_weekly_solr_sync/TestPlan_YNMPECA-9360_Weekly_Solr_Sync_Recalculation.md) | Draft/Pending sign-off | Chốt retry, concurrency, Solr commit SLA và runbook restore; exit criteria không cho còn Critical/High xóa sai |
| [9276 Test Plan](../test_plans/local/lock_industry_sync/TestPlan_YNMPECA-9276_Exclude_Locked_Industries_Sync.md) + [84 TC v3](../test_cases/lock_industry_sync/TestCases_YNMPECA-9276_Exclude_Locked_Industries_Sync_v3.md) | Jira Closed nhưng local plan còn Draft; TC v3 chưa có execution result | Dùng làm regression pack, không dùng như bằng chứng đã pass. Ưu tiên mismatch, queue/hash/callback, boundary và concurrency |
| [Title Change Test Plan](../test_plans/TestPlan_01-F01_Tracking_Product_Title_Change.md) | Draft/Pending Review | Dùng smoke regression; chốt source ClickHouse thay Timescale và data freshness |

## 6. Thứ tự chạy integration đề xuất

### Gate 0 — Readiness và safety

1. Freeze build/version của App, Data, crawler và Airflow.
2. Chốt DDL/table engine, `FINAL`/merge semantics, natural key, timezone, date boundary, parity threshold và SLA.
3. Snapshot count/checksum/min-max date theo VN/TL và từng source; chuẩn bị backup/restore/rollback.
4. Scale/pause các writer cũ theo runbook để không phát sinh dual-write conflict.

### Gate 1 — Storage, migration và pusher

1. Smoke ClickHouse local/distributed table, schema, permission, partition, replica và query `FINAL`.
2. Chạy `9348` theo batch có resume; đối chiếu count/checksum, missing/duplicate IDs, min/max date.
3. Chạy raw history pusher cho VN/TL; fault injection timeout/partial batch; kiểm tra retry/DLQ/no lost ACK.
4. Xác nhận `9349/9113`: không còn đọc/ghi legacy history ngoài fallback.

### Gate 2 — Detect Invalid, Calculate và Airflow

1. Chạy Detect Invalid positive/negative/boundary/dedup; kiểm tra abnormal và rebuild chain.
2. Chạy Weekly và Monthly calculation; đối chiếu sold, GMV, price/discount, null/zero và exact period.
3. Chạy Airflow weekly branch (thứ Hai), monthly branch (ngày 1), report-check blocking, PriorityMigration và failure propagation.
4. Parity cùng snapshot giữa ClickHouse, AWS và Timescale theo `9350/9322`.

### Gate 3 — Fill Missing Dates

1. Dry-run trên seed cô lập; verify eligibility, nhiều gap, boundary tháng/năm/leap day, buff/abnormal.
2. Write có kiểm soát; verify exact dates, `FILL_MISSING`, chain/patch, effective và physical duplicates.
3. Rerun cùng range và overlap range; query bằng semantics Production (`FINAL` nếu là contract chính thức).
4. Chạy targeted Weekly/Monthly và chứng minh không double-count sold/GMV.

### Gate 4 — Solr WS và App/report

1. Re-test fix `9374`: xóa đúng `prevWeek`, không xóa `currentWeek` hoặc PI gần giống.
2. Test BR-01/BR-02, partial abnormal, 0/1/99/100/101/500 delete IDs, update+delete mixed batch.
3. Mô phỏng Solr/ClickHouse lỗi giữa chừng; kiểm tra trạng thái, retry/reconcile và restore.
4. Query App Product Histories 1 năm, PIW/PIM, export/query và data freshness.

### Gate 5 — Regression và staging E2E

1. Title change, Official/Mall, Lock Industry/Report Sync.
2. Full chain cho ít nhất một PI mỗi source/market từ crawl đến App/report.
3. Monitor queue lag/DLQ, job status, ClickHouse errors, Solr update/delete count và parity dashboard.
4. Chỉ Go khi toàn bộ blocker đóng hoặc có waiver ghi rõ owner, impact, expiry và rollback trigger.

## 7. Go/No-Go checklist

- [ ] `9348`, `9349`, `9352` đạt trạng thái release-ready; build đã freeze.
- [ ] 9280 core Detect Invalid/Calculate/parity/VN-TL không còn Ignore/Open/Bug chưa waiver.
- [ ] 9338 targeted downstream pass; duplicate/idempotency/random/FINAL contract đã chốt bằng evidence.
- [ ] 9360 hai BUG case re-test Passed; recovery/partial failure có runbook hoặc waiver.
- [ ] 9352 ba OPEN cases Passed.
- [ ] Parity WS/MS và histories đạt threshold đã phê duyệt trên cùng snapshot.
- [ ] Migration count/checksum/min-max date và failed ID report đầy đủ cho VN/TL.
- [ ] Không còn dual-write hoặc dependency không kiểm soát vào `sold_history/crawled_history` cũ.
- [ ] Smoke Title Change, Official/Mall, Lock Industry và export/report Passed.
- [ ] Rollback đã thử hoặc ít nhất dry-run/readiness review hoàn tất; monitoring/owner trực release rõ ràng.

## 8. Nguồn local đã đối chiếu

- `Document/ECI/Task clickhouse của ECI.md`
- `Document/ECI/dev_doc_clickhouse_sync.md`
- `Document/ECI/Cách chạy của luồng migrate.md`
- `Document/ECI/Seed data for Fill Missing Dates.md`
- `Document/ECI/Task tính WS của anh Minh.md`
- `Document/ECI/Task lock sync của ECI của anh Tân.md`
- `Document/ECI/Logic của task sync.md`
- `Document/ECI/Logic của task report sync ECI.md`
- `Document/ECI/Task title change.md`
- `Document/ECI/Task ECI điều chỉnh thông tin shop mall của anh Đức.md`
