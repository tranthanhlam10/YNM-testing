# TEST PLAN
## [ECI] Setup ClickHouseDB VN va TL
### Feature: Setup database luu tru moi cho Product Item Histories va migration calculation/pusher sang ClickHouse

| Field | Value |
|---|---|
| **Ma tai lieu** | TP-YNMPECA-9280-v1.0 |
| **Du an** | YNMP - Ecommerce Intelligence (ECI) |
| **Ngay tao** | 06/07/2026 |
| **Ngay cap nhat** | 06/07/2026 |
| **Nguoi tao** | QA Team (AI-assisted) |
| **Phien ban** | 1.0 - Draft |
| **Trang thai** | Draft - Pending Review/Sign-off |
| **Jira chinh** | https://jira.younetco.com/browse/YNMPECA-9280 |
| **Due date** | 10/07/2026 |
| **Tech Wiki** | https://wiki.younetco.com/pages/viewpage.action?pageId=308413227 |
| **Reference phu** | `/Users/tranthanhlam/product-ai-docs/EcomHeat/specs/01-product-tracking-title-change/01-F01-tracking-product-title-change.md` |
| **Scope nguon chinh** | Jira `YNMPECA-9280`, cac sub-task, Tech Wiki ClickHouse `product_item_histories` |

---

## 1. MUC TIEU & TONG QUAN (Introduction & Objective)

### 1.1 Boi canh

ECI dang luu va xu ly lich su crawl cua Product Item tren TimescaleDB de phuc vu cac nghiep vu quan trong:

- Tinh weekly/monthly sold, GMV, average price, average sell price, discount percent cho Product Item.
- Phat hien du lieu crawl sai, vi du `delta_sold < 0`.
- Cap nhat realtime xuong `product_items`.
- Load lich su Product Item Histories cho App/Product Management, bao gom cac man hinh can xem sold history trong timerange dai.

Task `YNMPECA-9280` la nhom task setup ClickHouseDB cho VN va TL, chuyen cac luong luu/truy van `product_item_histories` tu Timescale sang ClickHouse. Day la thay doi co risk cao vi anh huong truc tiep den data correctness, calculation output, pusher, API/App va performance.

### 1.2 Giai phap ky thuat trong scope

Theo Tech Wiki, ClickHouse se co database/table chinh:

| Thanh phan | Mo ta |
|---|---|
| Database | `eci` tren cluster `clickhouse_cluster` |
| Local table | `eci.product_item_histories_local` tren cac nodes |
| Distributed table | `eci.product_item_histories` |
| Engine | `ReplicatedReplacingMergeTree` dung `updated_date` lam version column |
| Partition | Theo tuan: `toYYYYMMDD(toMonday(crawled_date))` |
| ORDER BY | `(product_item_id, crawled_date)` |
| Materialized fields | `delta_sold = total_sold - last_total_sold`, `gmv = delta_sold * sell_price` khi hop le |
| Sharding | `cityHash64(product_item_id)` de cung product vao cung shard |

Cac luong thay doi chinh:

- Xay dung `ClickhouseAdapter` cho service `ynm-eca`.
- Chuyen query `checkInvalidRecords` sang ClickHouse.
- Chuyen query `calculatePIHistories` sang ClickHouse.
- Truoc khi calculation can trigger Merge de tranh tinh tren duplicate row cua `ReplacingMergeTree`.
- Chuyen luong pusher raw/history va luong pusher PW/PM tu Timescale sang ClickHouse.
- Cap nhat realtime xuong `Product Items` voi muc tieu `1p / 10.000 records`.
- Thay doi App adapter de load Product Item Histories tu ClickHouse voi timerange 1 nam.
- Xoa field legacy `crawled_history`, `sold_history` trong product item resolver/data pusher theo dung thu tu deploy.

### 1.3 Muc tieu kiem thu

- Dam bao ClickHouse schema/table/cluster san sang va dung contract voi luong ECI.
- Dam bao du lieu insert vao ClickHouse dung mapping, dung kieu du lieu, khong mat/nhan doi data.
- Dam bao output calculation tu ClickHouse tuong duong voi Timescale trong cac dataset doi chieu duoc.
- Dam bao Merge/deduplicate duoc xu ly truoc khi tinh toan, khong tinh sai do duplicate row.
- Dam bao pusher va realtime update hoat dong dung khi nguon luu moi la ClickHouse.
- Dam bao App/Product Management load lich su 1 nam khong bi sai data, timeout, hoac phu thuoc field cu.
- Dam bao deployment co thu tu an toan, dac biet voi task xoa `crawled_history`, `sold_history`.

### 1.4 Trang thai sub-task tai thoi diem tao test plan

| Jira | Summary | Trang thai | Huong xu ly QA |
|---|---|---|---|
| `YNMPECA-9282` | Xay dung ClickhouseAdapter cua `ynm-eca` | To be Tested | Test ngay: adapter, connection, query, error handling |
| `YNMPECA-9283` | Thay doi query `checkInvalidRecords` va trigger Merge | To be Tested | Test ngay: correctness + cursor + merge |
| `YNMPECA-9284` | Thay doi query `calculatePIHistories` va trigger Merge | To be Tested | Test ngay: aggregate correctness + merge |
| `YNMPECA-9285` | Pusher du lieu tinh toan PW/PM tu Timescale vao ClickHouse | To be Tested | Test ngay: data flow calculation output |
| `YNMPECA-9286` | Pusher thay vi vao Timescale thi vao ClickHouse | Open | Theo doi readiness, chua sign-off parent neu chua test |
| `YNMPECA-9287` | Cap nhat realtime xuong Product Items: `1p / 10.000 records` | Open | Chuan bi performance/throughput test |
| `YNMPECA-9288` | App adapter load Product Item Histories tu ClickHouse, timerange 1 nam | Open | Chuan bi API/App regression |
| `YNMPECA-9295` | Xoa `crawled_history`, `sold_history` trong resolver/data pusher | Open | Can confirm thu tu deploy voi App |
| `YNMPECA-9299` | Wiki/testcases | In Progress | Review/update testcases |
| `YNMPECA-9300` | Testing | Open | Track execution |

> Note timeline: Jira comment dang ghi `Done testing: 07/07`, `Fixbug: 08/07`, `Done staging: 10/07`. Co comment "Thu 2 7/7 dev done" nhung ngay 07/07/2026 la thu Ba, can confirm lai moc nay voi PM/Dev.

---

## 2. PHAM VI KIEM THU (Scope of Testing)

### 2.1 In-Scope

#### Module 1: ClickHouse schema, cluster va storage contract

| STT | Hang muc | Mo ta |
|---|---|---|
| 1 | Database/table creation | Verify `eci`, `product_item_histories_local`, `product_item_histories` ton tai dung cluster |
| 2 | Schema/data type | Verify cac field identity, product info, price, sales, flags, ratings, brand dung nullable/type |
| 3 | Materialized columns | Verify `delta_sold`, `gmv` tu dong tinh dung khi insert |
| 4 | Partition/order/sharding | Verify partition theo tuan, ORDER BY `(product_item_id, crawled_date)`, cung PI vao cung shard |
| 5 | Replication/distributed query | Query distributed table tra du lieu hop nhat tu cac local table |
| 6 | Deduplication | Duplicate cung `(product_item_id, crawled_date)` giu record co `updated_date` moi hon sau Merge |

#### Module 2: ClickhouseAdapter trong `ynm-eca`

| STT | Hang muc | Mo ta |
|---|---|---|
| 7 | Connection config | Adapter ket noi dung ClickHouse env, database, user, timeout |
| 8 | Query execution | Execute select/insert/batch query thanh cong |
| 9 | Parameter binding | `startDate`, `endDate`, `latestProductItemId`, `limit` khong bi sai format/timezone |
| 10 | Error handling | Xu ly connection timeout, query syntax error, retry/log khong lam crash job |
| 11 | Backward compatibility | Khi feature flag/config chua bat, luong cu khong bi anh huong *(Need Confirm neu co feature flag)* |

#### Module 3: Query `checkInvalidRecords`

| STT | Hang muc | Mo ta |
|---|---|---|
| 12 | Filter date range | `crawled_date >= startDate` va `< endDate` dung ky vong |
| 13 | Filter abnormal | Chi lay `is_abnormal = 0` |
| 14 | Filter negative sold | Chi lay `delta_sold < 0` |
| 15 | Cursor | Chi lay `product_item_id > latestProductItemId` |
| 16 | Sort/limit | Sort `product_item_id ASC`, limit dung batch size default 500 hoac input |
| 17 | Unique PI | Khong tra duplicate `product_item_id`; neu doi `DISTINCT` sang `GROUP BY` thi output khong doi |
| 18 | Merge before calculation | Du lieu duplicate phai duoc merge/final truoc khi query de khong phat hien sai |

#### Module 4: Query `calculatePIHistories`

| STT | Hang muc | Mo ta |
|---|---|---|
| 19 | Filter date range | `crawled_date >= startDate` va `<= endDate` dung design |
| 20 | Filter sold hop le | Chi tinh `is_abnormal = 0` va `delta_sold > 0` |
| 21 | Aggregate sold/gmv | `SUM(delta_sold)`, `SUM(gmv)` dung voi expected dataset |
| 22 | Average price | `AVG(price)`, `AVG(sell_price)` dung, bo qua/null theo ClickHouse semantics |
| 23 | Discount percent | `AVG(if(price = 0, NULL, (price - sell_price) / price))` khong chia cho 0 |
| 24 | Abnormal detection | `is_abnormal` output dung voi abnormalDetectionQuery ClickHouse |
| 25 | Cursor/order/limit | `product_item_id > latestProductItemId`, order ASC, limit default 1000 |
| 26 | Parity Timescale | So sanh output ClickHouse vs Timescale tren tap PI/time range mau |

#### Module 5: Pusher raw Product Item Histories vao ClickHouse

| STT | Hang muc | Mo ta |
|---|---|---|
| 27 | Input mapping | Message/record tu crawler/resolver map dung vao cac column ClickHouse |
| 28 | Batch insert | Insert batch thanh cong, khong mat record, khong duplicate ngoai y muon |
| 29 | Nullable fields | Field null/empty cua product, shop, price, rating khong gay fail insert |
| 30 | Decimal/int/bool conversion | `price`, `sell_price`, `total_sold`, flags duoc convert dung type |
| 31 | Idempotency | Replay cung record khong lam output calculation sai sau Merge |
| 32 | Retry/error | ClickHouse insert fail tam thoi co retry/log, khong ack mat message neu chua insert thanh cong *(Need Confirm queue/ack mechanism)* |

#### Module 6: Pusher calculation PW/PM va realtime Product Items

| STT | Hang muc | Mo ta |
|---|---|---|
| 33 | PW/PM data flow | Du lieu tinh weekly/monthly tu ClickHouse day vao dich dung |
| 34 | Realtime update Product Items | Product Items duoc cap nhat theo batch, target `1p / 10.000 records` |
| 35 | Data freshness | Record moi vao ClickHouse duoc phan anh xuong Product Items trong SLA da chot *(Need Confirm SLA final)* |
| 36 | Partial failure | Mot batch loi khong lam mat/toan bo batch khac, co retry/recover |
| 37 | Consistency | ClickHouse calculation, Product Items current state, PW/PM aggregate khong lech bat thuong |

#### Module 7: App adapter load Product Item Histories

| STT | Hang muc | Mo ta |
|---|---|---|
| 38 | API load histories | App/API lay du lieu lich su PI tu ClickHouse thanh cong |
| 39 | Timerange 1 nam | Query duoc timerange 1 nam, khong timeout trong nguong chap nhan |
| 40 | Sold history correctness | Sold, sell price, title, crawled date hien dung voi ClickHouse |
| 41 | Pagination/sort | Lich su sort dung theo thoi gian va paging neu co |
| 42 | Regression Product Management | Cac man hinh/tool xem sold histories khong crash sau khi doi adapter |

#### Module 8: Remove legacy fields `crawled_history`, `sold_history`

| STT | Hang muc | Mo ta |
|---|---|---|
| 43 | Resolver output | Khong con depend/return `crawled_history`, `sold_history` o resolver khi deploy dung thu tu |
| 44 | Data pusher | Data pusher khong ghi doc field cu neu App da chuyen sang ClickHouse |
| 45 | Deployment order | Task chi deploy sau khi App tool sold histories da sua xong |
| 46 | Backward compatibility | Consumer/API cu khong crash neu field da bi remove *(Need Confirm consumer list)* |

#### Module 9: Data quality diagnostics va related work trong Tech Wiki

| STT | Hang muc | Mo ta |
|---|---|---|
| 47 | Duplicate sold islands | Query xu ly record co sold trung va dung gan nhau tra ket qua dung, performance gan 9s theo wiki neu co benchmark |
| 48 | Broken last sold chain | Phat hien `last_crawled_date` / `last_total_sold` khong tro dung record lien truoc |
| 49 | Phuong an rai so tu ClickHouse | Verify output khong lech so voi business rule hien tai *(Need Confirm scope Jira rieng)* |

### 2.2 Out-of-Scope

| Hang muc | Ly do |
|---|---|
| Full provisioning hardware/ZooKeeper/cluster capacity planning | QA chi verify cluster/schema/behavior tren env test/staging; provisioning chi tiet thuoc DevOps/DBA |
| Full backfill lich su production neu khong co script/data ban giao | Test plan chi cover data sample, Q1/2026+, va 1 nam cho App khi data san sang |
| Thay doi nghiep vu detect abnormal ngoai query duoc migrate | Neu abnormalDetectionQuery thay doi logic nghiep vu can task/spec rieng |
| UI redesign Product Management | Scope chi verify App/API load history khong bi regression, khong test UI redesign |
| Tracking title change BR-01 -> BR-12 | Reference phu chi dung de nhan dien regression sold history/Product Management, khong phai scope chinh cua `YNMPECA-9280` |
| Performance production-scale tuyet doi | Chi verify muc tieu duoc neu trong Jira/wiki co so lieu, dac biet `1p / 10.000 records` va timerange 1 nam |

---

## 3. CHIEN LUOC KIEM THU (Test Strategy & Approach)

### 3.1 Functional Testing

| Nhom test | Ky thuat ap dung | Mo ta |
|---|---|---|
| Schema verification | Contract Testing | Doi chieu schema ClickHouse voi Tech Wiki, verify table local/distributed |
| Query correctness | Data-driven Testing | Tao dataset co expected output ro cho `checkInvalidRecords` va `calculatePIHistories` |
| Boundary date testing | Boundary Value Analysis | Test `startDate`, `endDate`, dau/cuoi ngay, dau/cuoi tuan, timezone VN/TL |
| Dedup/Merge testing | State Transition + Error Guessing | Insert duplicate row cung key, verify record moi hon thang sau Merge |
| Pusher testing | End-to-end Integration | Day message/record vao luong pusher, query ClickHouse va downstream |
| Legacy field regression | Backward Compatibility Testing | Verify App/consumer khong con phu thuoc `crawled_history`, `sold_history` |

### 3.2 API/Integration Testing

| Diem tich hop | Phuong phap kiem thu | Bang chung can thu |
|---|---|---|
| `ynm-eca` -> ClickHouse | Run job/query qua adapter | Log job, query result, error log neu co |
| Crawler/Data Pusher -> ClickHouse | Publish/replay record mau | Message id, ClickHouse row, count parity |
| ClickHouse -> PW/PM calculation | Run calculation batch | Output weekly/monthly rows, compare expected |
| ClickHouse -> Product Items realtime | Run batch 10k records | Product Items updated count, duration, failed count |
| App -> ClickHouse | Call API/tool sold histories | API response, query timing, ClickHouse source rows |
| Timescale -> ClickHouse parity | Chay cung PI/time range tren 2 nguon | Diff report theo sold/gmv/avg/discount |

### 3.3 Data Migration/Data Sync Testing

| Hang muc | Cach kiem tra |
|---|---|
| Row count parity | Count theo ngay/tuan/platform/crawler_type giua nguon input va ClickHouse |
| Sample parity | Chon PI dai han, PI co sold tang, sold giam, null price, duplicate crawl trong ngay |
| Aggregate parity | So sanh weekly/monthly sold, gmv, avg price giua Timescale va ClickHouse |
| Dedupe parity | Verify duplicate trong ClickHouse khong lam aggregate lon hon Timescale expected |
| Data freshness | Do thoi gian tu input pusher -> ClickHouse -> Product Items/App |

### 3.4 Non-functional Testing

| NFR | Tieu chi danh gia | Cach kiem tra |
|---|---|---|
| Performance `checkInvalidRecords` | Query chay on dinh voi data tu Q1/2026+, khong timeout | Query log, job duration |
| Performance `calculatePIHistories` | Batch 1000 PI chay trong nguong job hien tai chap nhan *(Need Confirm threshold)* | Job duration, CPU/memory ClickHouse |
| Realtime throughput | Cap nhat `10.000 records/phut` theo sub-task `YNMPECA-9287` | Batch test 10k records, do duration |
| App timerange 1 nam | API/tool sold histories load 1 nam khong timeout | API timing, response count |
| Stability | ClickHouse timeout/insert fail khong lam service crash/mat message | Log, retry, queue backlog |
| Observability | Co log trace theo batch/product_item_id/job id | Log sample va dashboard neu co |

### 3.5 Regression Testing

| Nhom regression | Ly do |
|---|---|
| Calculation weekly/monthly hien tai | Day la output nghiep vu quan trong, de sai so lieu bao cao khach |
| Product Items current state | Realtime update co the lam sai sold/current price/title |
| Product Management sold histories | App doi adapter sang ClickHouse, can verify khong crash/khong mat data |
| Title change/Product Management reference | BA 01-F01 can sold history va title trong detail; migration khong duoc lam hong tab sold history |
| Data pusher/resolver legacy fields | Xoa `crawled_history`, `sold_history` can dam bao consumer da san sang |

### 3.6 Requirement -> Coverage uoc tinh

| Requirement/Sub-task | Estimated Test Cases | Priority |
|---|---:|---|
| ClickHouse schema/local/distributed/dedup | 10-14 | P0 |
| `ClickhouseAdapter` | 6-8 | P0 |
| `checkInvalidRecords` | 8-12 | P0 |
| `calculatePIHistories` | 12-16 | P0 |
| Pusher raw histories vao ClickHouse | 10-14 | P0 |
| Pusher PW/PM calculation | 6-10 | P0 |
| Realtime Product Items 10k/min | 5-8 | P1 |
| App Product Item Histories 1 nam | 6-10 | P1 |
| Remove legacy fields | 5-8 | P1 |
| Data quality diagnostics | 4-8 | P2/P1 tuy scope final |
| **Tong uoc tinh** | **72-108 cases** | |

---

## 4. MOI TRUONG KIEM THU (Test Environment)

### 4.1 Moi truong

| Moi truong | Muc dich | Giai doan su dung |
|---|---|---|
| Local/K8s | Smoke adapter, query, dataset nho, debug nhanh | Phase chuan bi |
| Testing | Execute P0/P1 tren deployment cua task | Phase test chinh |
| Staging | Regression, data parity voi dataset dai, sign-off | Truoc release |
| Production | Chi monitor sau release, khong push test data truc tiep | Post-release |

### 4.2 Services va storage can quan sat

| Thanh phan | Muc dich |
|---|---|
| ClickHouse cluster | Query `eci.product_item_histories`, local/distributed, system tables |
| `ynm-eca` | Adapter, invalid records, calculation, pusher PW/PM |
| Crawling/Data Pusher service | Insert raw Product Item Histories vao ClickHouse |
| App/API service | Load Product Item Histories timerange 1 nam |
| Product Items storage/search | Verify realtime update current state |
| TimescaleDB | Baseline doi chieu trong giai doan migration |
| Logs/APM/monitoring | Query time, job duration, insert fail, retry, merge status |

### 4.3 Data can chuan bi

| Nhom data | Muc dich |
|---|---|
| PI co sold tang deu | Verify `delta_sold > 0`, sold/gmv aggregate |
| PI co sold giam | Verify `checkInvalidRecords`, `delta_sold < 0` |
| PI co duplicate cung `crawled_date` | Verify ReplacingMergeTree + Merge |
| PI co null price/sell_price | Verify `gmv`, avg, discount null handling |
| PI co price = 0 | Verify discount khong chia cho 0 |
| PI co nhieu record trong cung ngay | Verify daily/latest behavior neu App dung sold history theo ngay |
| PI co data dai Q1/2026+ | Verify comment Jira can so lieu dai |
| PI co lich su 1 nam | Verify App adapter timerange 1 nam |
| Batch 10.000 records | Verify realtime Product Items throughput |
| Data VN va TL | Verify timezone/domain/country/source khong bi lech |

### 4.4 Quyen truy cap va cong cu

| Quyen/Cong cu | Bat buoc |
|---|---|
| Query ClickHouse tren Testing/Staging | Bat buoc |
| Query Timescale baseline | Bat buoc cho parity |
| Xem log `ynm-eca`, pusher, App/API | Bat buoc |
| Quyen trigger job/calculation hoac nho Dev trigger | Bat buoc |
| Quyen push/replay test message neu co queue | Khuyen khich |
| Quyen Google Sheet testcases | Bat buoc cho execution tracking |

---

## 5. TIEU CHI DANH GIA (Entry & Exit Criteria)

### 5.1 Entry Criteria - Dieu kien de QA bat dau test

| # | Tieu chi | Bat buoc |
|---|---|---|
| 1 | Sub-task can test da chuyen `To be Tested` hoac Dev confirm build/deployment final | Bat buoc |
| 2 | ClickHouse database/table da setup tren Testing/Staging dung schema Tech Wiki | Bat buoc |
| 3 | QA co connection/query access vao ClickHouse va Timescale baseline | Bat buoc |
| 4 | Co dataset tu Q1/2026+ hoac data dai du de doi chieu calculation | Bat buoc |
| 5 | Dev confirm co trigger Merge/FIRST FINAL strategy truoc calculation | Bat buoc |
| 6 | `ynm-eca` da deploy adapter ClickHouse va config dung env | Bat buoc |
| 7 | Pusher raw histories/PW/PM da deploy neu test Module 5/6 | Bat buoc theo module |
| 8 | App adapter da deploy neu test Module 7 | Bat buoc theo module |
| 9 | Dev/App confirm thu tu deploy cho `YNMPECA-9295` xoa legacy fields | Bat buoc truoc khi test/remove |
| 10 | QA co test case sheet/quyen tracking execution | Bat buoc |
| 11 | PM/Dev confirm lai timeline 07/07, 08/07, 10/07 va ngay "Thu 2 7/7" | Khuyen khich nhung can chot som |

### 5.2 Exit Criteria - Dieu kien QA cho phep release/sign-off

| # | Tieu chi | Bat buoc |
|---|---|---|
| 1 | 100% P0 test cases executed voi ket qua Passed hoac Fixed/Re-tested Passed | Bat buoc |
| 2 | 0 bug Critical/High open lien quan data loss, sai calculation, mat message, service crash | Bat buoc |
| 3 | ClickHouse schema/local/distributed/dedup pass tren env can release | Bat buoc |
| 4 | `checkInvalidRecords` va `calculatePIHistories` output dung expected dataset | Bat buoc |
| 5 | Parity Timescale vs ClickHouse dat nguong chap nhan da chot voi BA/Dev/PM | Bat buoc |
| 6 | Merge/dedup khong lam sai output calculation | Bat buoc |
| 7 | Pusher ghi vao ClickHouse dung, co retry/error handling chap nhan duoc | Bat buoc |
| 8 | Realtime Product Items va App adapter pass neu nam trong release cung dot | Bat buoc theo scope release |
| 9 | Remove legacy fields khong lam App/tool/API crash | Bat buoc neu release `YNMPECA-9295` |
| 10 | Test Summary Report da neu ro coverage, bug con lai, residual risk | Bat buoc |
| 11 | PM/BA/Dev accept cac Medium/Low bug con lai neu co | Khuyen khich |

---

## 6. RUI RO & HUONG GIAI QUYET (Risks & Mitigations)

| # | Rui ro | Muc do | Xac suat | Huong giai quyet |
|---|---|---|---|---|
| R1 | `ReplacingMergeTree` merge bat dong bo, calculation chay truoc merge lam sai sold/gmv | Cao | Cao | Entry Criteria bat buoc co trigger Merge/FINAL strategy; test duplicate dataset truoc khi sign-off |
| R2 | Boundary date khac nhau: `checkInvalidRecords` dung `< endDate`, `calculatePIHistories` dung `<= endDate` | Cao | Trung binh | Viet test boundary dau/cuoi ngay; confirm business rule voi Dev/BA |
| R3 | Timezone VN/TL hoac `DateTime` ClickHouse lam lech ngay/tuan partition | Cao | Trung binh | Test data gan 00:00/23:59, dau tuan, cuoi tuan, VN/TL |
| R4 | Null/Decimal semantics ClickHouse khac Timescale lam lech avg/discount/gmv | Cao | Trung binh | Tao dataset null price, price=0, decimal; compare expected bang tay |
| R5 | Data parity Timescale vs ClickHouse lech do backfill/insert thieu record | Cao | Trung binh | Count parity theo partition/time range/platform; sample parity theo PI |
| R6 | Sub-task con dang `Open` nhung parent can release gap | Cao | Cao | Tach sign-off theo module; khong close parent neu `9286/9287/9288/9295` chua ready/test |
| R7 | Xoa `crawled_history`, `sold_history` truoc khi App/tool sua xong gay crash | Cao | Trung binh | Confirm deployment order; smoke App sold histories truoc/sau release |
| R8 | Performance query 1 nam/App hoac batch 10k/min khong dat | Trung binh | Trung binh | Chay benchmark tren data dai; log query time; escalate index/projection neu fail |
| R9 | Query `DISTINCT` vs `GROUP BY` cho `checkInvalidRecords` output/performance khac nhau | Trung binh | Trung binh | So sanh output va query profile tren dataset thuc |
| R10 | QA thieu quyen ClickHouse/Timescale/log lam blocked evidence | Trung binh | Cao | Request access truoc; dua vao Entry Criteria |

---

## 7. TAI LIEU BAN GIAO (Deliverables)

| # | Tai lieu/Bang chung | Mo ta | Deadline de xuat | Owner |
|---|---|---|---|---|
| 1 | Test Plan `YNMPECA-9280` | Scope, strategy, entry/exit, risk, timeline | 06/07/2026 | QA |
| 2 | Test Cases | 72-108 TC theo module, uu tien P0 | 06/07/2026 -> 07/07/2026 | QA |
| 3 | Data Preparation Note | Danh sach PI/test dataset, expected output bang tay | Truoc execution | QA + Dev |
| 4 | SQL/Query Evidence | ClickHouse/Timescale query, result screenshots/export | Ongoing | QA |
| 5 | Job/Log Evidence | Log adapter, pusher, calculation, merge, App API | Ongoing | QA + Dev |
| 6 | Parity Report | So sanh Timescale vs ClickHouse theo sample/range | Truoc sign-off | QA |
| 7 | Performance Report | Query 1 nam, batch 10k/min, job duration | Truoc staging sign-off | QA |
| 8 | Bug Reports | Jira bug kem input, actual, expected, query/log evidence | Ongoing | QA |
| 9 | Test Execution Report | Status Passed/Failed/Blocked tung testcase | Hang ngay | QA |
| 10 | Test Summary Report + Sign-off | Tong ket coverage, defects, residual risk, release recommendation | 10/07/2026 | QA |

---

## 8. TIMELINE & UOC LUONG KIEM THU

### 8.1 Timeline theo Jira comment

| Phase | Ngay | Noi dung | Output |
|---|---|---|---|
| Test plan/testcases | 03/07/2026 -> 06/07/2026 | Hoan thien test plan, testcase, test data | Draft test plan/testcases |
| Execution Testing | 07/07/2026 | Chay P0/P1 cho cac sub-task ready | Execution report, bug list |
| Fix bug | 08/07/2026 | Retest bug fix, run impacted regression | Retest report |
| Staging sign-off | 09/07/2026 -> 10/07/2026 | Regression, parity/performance, final sign-off | Test summary + release recommendation |

> Need Confirm: Timeline rat chat cho migration data pipeline. Neu `9286/9287/9288/9295` chi ready sau 07/07, can tach release/sign-off theo module hoac cap nhat lai deadline.

### 8.2 Effort estimation

| Hoat dong | Effort uoc tinh | Ghi chu |
|---|---:|---|
| Hoan thien test plan + test cases | 1.0-1.5 man-days | Bao gom review voi Dev/BA |
| Chuan bi data + expected output | 1.0-1.5 man-days | Can data Q1/2026+ va duplicate/null cases |
| P0 execution adapter/query/calculation | 2.0-3.0 man-days | `9282-9285` |
| Pusher/realtime/App execution | 2.0-3.0 man-days | Phu thuoc readiness `9286-9288` |
| Legacy fields + regression | 0.5-1.0 man-day | Phu thuoc `9295` |
| Performance/parity report | 1.0-1.5 man-days | Can access/log/export |
| Bug triage/retest buffer | 1.0-2.0 man-days | Migration risk cao |
| **Tong effort** | **8.5-13.5 man-days** | Gia dinh 1 QA chinh + Dev support |

---

## 9. VAI TRO & TRACH NHIEM

| Vai tro | Nguoi/Team | Trach nhiem |
|---|---|---|
| QA Lead/Tester | Lam Tran Thanh | Test plan, test cases, test data, execution, bug report, sign-off recommendation |
| Owner parent story | Minh Huynh Cong | Dieu phoi readiness, confirm scope release |
| Dev `ynm-eca` | Tinh Nguyen Thanh / HungPD team | Adapter, queries, calculation, pusher PW/PM, merge behavior |
| Dev pusher/crawling | Huy Nguyen Tuan / Duc Truong Cong | Pusher raw histories, realtime Product Items, legacy fields |
| App owner | Tan Vo Duy / App team | App adapter Product Item Histories, tool sold histories |
| BA/Reporter | Nhung Nguyen Thi Cam | Confirm expected behavior, date range, parity threshold |
| PM/Release owner | Need Confirm | Approve timeline, residual risk, release decision |
| DevOps/DBA | Need Confirm | ClickHouse cluster, access, monitoring, rollback support |

---

## 10. GIA DINH & PHU THUOC

### 10.1 Assumptions

| # | Gia dinh | Anh huong neu sai |
|---|---|---|
| A1 | ClickHouse schema trong Tech Wiki version 74 la schema final de QA doi chieu | Neu schema thay doi, can update test cases va expected queries |
| A2 | Timescale van la baseline duoc phep query trong giai doan migration | Neu khong, parity chi co the so voi expected dataset bang tay |
| A3 | Data Q1/2026+ da duoc load vao ClickHouse de test dai han | Neu chua, nhieu TC parity/App 1 nam bi blocked |
| A4 | `updated_date` la version column final cho dedup | Neu doi version column, test dedup phai update |
| A5 | Output PW/PM business logic khong doi, chi doi datasource Timescale -> ClickHouse | Neu logic doi, can BA/Dev spec rieng |
| A6 | `YNMPECA-9295` chi deploy sau khi App sold histories tool da sua | Neu deploy nguoc thu tu, risk crash cao |

### 10.2 Dependencies

| # | Phu thuoc | Owner | Trang thai can co |
|---|---|---|---|
| D1 | ClickHouse cluster Testing/Staging san sang | DevOps/DBA | Ready |
| D2 | Deployment `ynm-eca` co ClickhouseAdapter | Dev | Ready cho `9282` |
| D3 | Merge trigger/strategy implemented | Dev | Ready cho `9283/9284/9285` |
| D4 | Pusher raw histories vao ClickHouse | Dev | Ready cho `9286` |
| D5 | Realtime Product Items batch update | Dev | Ready cho `9287` |
| D6 | App adapter ClickHouse histories | App | Ready cho `9288` |
| D7 | App tool sold histories fixed truoc khi remove legacy fields | App + Dev | Ready truoc `9295` |
| D8 | QA access ClickHouse/Timescale/logs/sheet | DevOps/PM | Ready truoc execution |

---

## 11. BUG SEVERITY CLASSIFICATION

| Severity | Dinh nghia | Vi du trong scope |
|---|---|---|
| Critical | Data loss, service crash, calculation output sai dien rong, khong recover duoc | Pusher ack thanh cong nhung ClickHouse khong co row; calculation sai sold/gmv hang loat; App crash toan bo sold histories |
| High | Chuc nang chinh sai, co workaround han che, anh huong report/client data | `checkInvalidRecords` bo sot PI `delta_sold < 0`; `calculatePIHistories` sai discount/gmv; duplicate chua merge lam so lieu tang |
| Medium | Sai mot nhom case/edge case, anh huong co khoanh vung | Timerange 1 nam cham hon nguong; null price handling sai voi mot so PI; log retry thieu trace id |
| Low | Loi cosmetic/documentation/log khong anh huong ket qua chinh | Typo log, warning thua, query comment/document chua cap nhat |

---

## PHU LUC

### A. Tong hop diem can xac nhan (Need Confirm)

| # | Cau hoi | Nguoi can hoi | Anh huong | Muc do |
|---|---|---|---|---|
| NC-1 | `checkInvalidRecords` co bat buoc doi `DISTINCT` sang `GROUP BY` trong release nay khong? | Dev | Anh huong expected query/performance test | Medium |
| NC-2 | Merge trigger cu the la `OPTIMIZE ... FINAL`, query `FINAL`, hay mechanism khac? Chay tren local hay distributed table? | Dev/DBA | Blocking dedup/calculation correctness | Blocking |
| NC-3 | Nguong parity Timescale vs ClickHouse chap nhan la 100% hay co tolerance cho decimal/rounding? | BA/Dev/PM | Blocking sign-off calculation | Blocking |
| NC-4 | `calculatePIHistories` dung `<= endDate` trong khi `checkInvalidRecords` dung `< endDate` co phai intentional? | Dev/BA | Blocking boundary test | Blocking |
| NC-5 | Timezone final cho `crawled_date`/input date la UTC hay Asia/Ho_Chi_Minh? TL co rule rieng khong? | Dev/BA | Blocking date range/partition test | Blocking |
| NC-6 | App Product Item Histories API endpoint nao dung ClickHouse adapter va response contract co thay doi khong? | App | Anh huong App test cases | Blocking theo module |
| NC-7 | SLA query/job duration cho `checkInvalidRecords`, `calculatePIHistories`, App 1 nam la bao nhieu? | PM/Dev | Anh huong performance pass/fail | Medium |
| NC-8 | Pusher raw histories dung queue/topic nao, ack/retry mechanism the nao? | Dev | Anh huong pusher failure test | Blocking theo module |
| NC-9 | `YNMPECA-9295` phu thuoc App task nao sua tool sold histories? Link Jira/MR? | App/Dev | Blocking deployment order | Blocking |
| NC-10 | Cac work items trong Tech Wiki: duplicate sold islands, `findBrokenLastSoldChain`, rai so tu ClickHouse co nam trong release `YNMPECA-9280` khong? | PM/Dev | Anh huong scope va so TC | Medium |
| NC-11 | Test data dai Q1/2026+ da load vao ClickHouse chua? Neu chua, ai phu trach backfill? | Dev/DBA | Blocking parity/App 1 nam | Blocking |
| NC-12 | Comment "Thu 2 7/7 dev done" co nghia ngay nao? 07/07/2026 la thu Ba. | PM/Dev | Anh huong timeline | Medium |

### B. Smoke checklist truoc khi full execution

| # | Check | Expected |
|---|---|---|
| 1 | Query `SHOW DATABASES` / `SHOW TABLES` tren ClickHouse | Co database `eci`, table local/distributed |
| 2 | Insert 1 record PI co `total_sold`, `last_total_sold`, `sell_price` | `delta_sold`, `gmv` tu tinh dung |
| 3 | Insert duplicate cung `(product_item_id, crawled_date)` voi `updated_date` moi hon | Sau merge/final, record moi hon duoc dung |
| 4 | Chay `ClickhouseAdapter` select 1 PI | Job/query thanh cong, log co trace |
| 5 | Chay `checkInvalidRecords` voi data co `delta_sold < 0` | Tra dung PI, sort/limit dung |
| 6 | Chay `calculatePIHistories` voi dataset nho | Sold/gmv/avg/discount dung expected |
| 7 | Day 1 record pusher raw history | ClickHouse co row moi |
| 8 | Call App/API sold histories cho 1 PI | Response co data tu ClickHouse, khong crash |
| 9 | Query Product Items sau batch update | Field current/aggregate duoc update dung |
| 10 | Search logs error/timeout | Khong co error blocking |

### C. Data matrix uu tien

| Case | total_sold | last_total_sold | price | sell_price | Expected |
|---|---:|---:|---:|---:|---|
| Sold tang | 120 | 100 | 20000 | 15000 | `delta_sold = 20`, `gmv = 300000` |
| Sold giam | 90 | 100 | 20000 | 15000 | `delta_sold = -10`, vao `checkInvalidRecords` |
| Sold bang nhau | 100 | 100 | 20000 | 15000 | `delta_sold = 0`, khong tinh sold positive |
| Missing total_sold | null | 100 | 20000 | 15000 | `delta_sold = 0`, `gmv = 0` |
| Missing last_total_sold | 100 | null | 20000 | 15000 | `delta_sold = 0`, `gmv = 0` |
| Missing sell_price | 120 | 100 | 20000 | null | `delta_sold = 20`, `gmv = 0` |
| price = 0 | 120 | 100 | 0 | 0 | Discount percent = null/khong chia 0 |
| Duplicate updated older/newer | 120/130 | 100 | 20000 | 15000 | Row `updated_date` moi hon thang sau Merge |

### D. Coverage theo sub-task

```
YNMPECA-9280
├── YNMPECA-9282 ClickhouseAdapter
│   ├── connection/config
│   ├── query execution
│   └── error handling
├── YNMPECA-9283 checkInvalidRecords
│   ├── delta_sold < 0
│   ├── is_abnormal = 0
│   ├── cursor/order/limit
│   └── merge before calculation
├── YNMPECA-9284 calculatePIHistories
│   ├── sold/gmv aggregate
│   ├── avg price/sell price
│   ├── discount percent
│   ├── abnormal detection
│   └── merge before calculation
├── YNMPECA-9285 Pusher PW/PM to ClickHouse
├── YNMPECA-9286 Raw histories pusher to ClickHouse
├── YNMPECA-9287 Realtime Product Items 10k/min
├── YNMPECA-9288 App ClickHouse adapter, histories 1 year
├── YNMPECA-9295 Remove crawled_history/sold_history
├── YNMPECA-9299 Wiki/testcases
└── YNMPECA-9300 Testing execution
```

---

*-- Het tai lieu Test Plan --*
