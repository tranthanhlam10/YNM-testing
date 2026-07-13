# TEST PLAN
## [DATA PLATFORM] [New Crawler] Youtube Post
### Feature: Youtube - Crawl Post From Source

| Field | Value |
|---|---|
| **Mã tài liệu** | TP-YNMPDP-6004-v1.1 |
| **Dự án** | YNMP - Data Platform |
| **Ngày tạo** | 10/07/2026 |
| **Người tạo** | QA Team (AI-assisted) |
| **Phiên bản** | 1.1 - Updated after Test Plan Review |
| **Trạng thái** | Draft - Pending Final Review/Sign-off |
| **Jira chính** | https://jira.younetco.com/browse/YNMPDP-6004 |
| **Subtask liên quan** | YNMPDP-6082 - Testcase; YNMPDP-6083 - Testing |
| **Due date** | 17/07/2026 |
| **Tài liệu tham chiếu** | Wiki technical: https://wiki.younetco.com/pages/viewpage.action?spaceKey=FB&title=%5BYoutube%5D+%5Bynm-crawler%5D+Crawl+Post+From+Source |
| **Wiki script/message** | https://wiki.younetco.com/pages/viewpage.action?pageId=317161648 |
| **Tài liệu review** | `Ai_Agents/templates/test_plan_review_YNMPDP_6004.md` |
| **Deployment tham chiếu** | `ynmpdp-6004-testing-ynm-crawler-empty` |

---

## 1. MỤC TIÊU & TỔNG QUAN (Introduction & Objective)

### 1.1 Bối cảnh

Task `YNMPDP-6004` thực hiện chuyển đổi luồng **Crawl Youtube Post From Source** từ repo cũ sang repo mới `ynm-crawler`. Luồng này lấy danh sách Youtube source từ collection identity, crawl danh sách video/post của channel thông qua Youtube API, sau đó resolver dữ liệu thành **mentions** và **youtube posts** để downstream service lưu vào Solr/Mongo và cập nhật trạng thái source.

Đây là tính năng thuộc nhóm backend/data pipeline, không có thay đổi UI trực tiếp. Rủi ro chính nằm ở contract message giữa các queue, mapping dữ liệu, paging, lock/release source và tính tương thích dữ liệu giữa crawler cũ và crawler mới.

### 1.2 Tóm tắt luồng kỹ thuật

| Bước | Thành phần | Mô tả |
|---|---|---|
| 1 | Loader | Load Youtube identity với `platform = 7`, filter theo `country_code`, `last_status`, `next_crawl_time`, `priority` |
| 2 | Redis Lock | Lock source bằng Redis key `YoutubePostApiCrawlingLoader` để tránh crawl trùng |
| 3 | RabbitMQ | Publish crawling source vào `<env>.cl.yt.posts_crawling_sources` |
| 4 | Builder | Consume source và build request Youtube API, convert channel id dạng `UC...` sang upload playlist id dạng `UU...` |
| 5 | Crawler | Consume crawling request, lấy token từ Token Manager với crawler type `YT_IDENTITY_CRAWLER`, gọi Youtube API |
| 6 | Crawled Source | Publish response sang `<env>.cl.yt.posts_crawled_sources` qua exchange `<env>.cl.yt.crawled_source` |
| 7 | Resolver | Resolve response thành mention/post, publish qua `<env>.cl.resolved_data` |
| 8 | Next Page/Finished Source | Nếu còn `nextPageToken` thì publish next page; nếu hoàn tất thì publish finished source để update/release source |

### 1.3 Mục tiêu kiểm thử

- Đảm bảo luồng mới chạy end-to-end từ Loader -> Builder -> Crawler -> Resolver -> Data Pusher/Source Updater.
- Đảm bảo crawler load đúng Youtube identity theo tiêu chí filter trong wiki và không crawl source bị exclude.
- Đảm bảo Builder tạo request đúng endpoint/params Youtube API: `playlistItems`, `part=snippet,contentDetails`, `maxResults=50`, `playlistId=UU...`.
- Đảm bảo Resolver mapping đúng dữ liệu mention và post theo wiki, bao gồm id, link, source, title, thumbnail, created date, country, KOL, engagement.
- Đảm bảo paging, retry, idempotency và lock/release source hoạt động ổn định, không gây duplicate hoặc kẹt source.
- Đảm bảo output contract tương thích downstream queue, Solr `mentions`, Mongo `youtube_posts` và source updater.

### 1.4 [Giả định - Assumption] và điểm cần confirm

| # | Assumption/Need Confirm | Lý do |
|---|---|---|
| 1 | **[Need Confirm]** Collection source thực tế đang dùng là `identity`, `identity_crawling` hoặc alias tương ứng trên môi trường testing/staging. | Wiki có mô tả load từ `identity`, phần DB ghi `identity_crawling`. QA cần xác nhận tên collection/query thực tế trước khi query dữ liệu. |
| 2 | **[Need Confirm]** Data Pusher và Source Updater đã được deploy/bật config tương ứng cho Youtube post trên testing. | Wiki tập trung vào crawler; downstream service cần sẵn sàng để test persistence end-to-end. |
| 3 | **[Need Confirm]** Crawler mới cần đạt parity với repo cũ ở mức field output chính, nhưng không yêu cầu so sánh 100% historical data/backfill. | Jira nói chuyển từ repo cũ sang repo mới, chưa nêu yêu cầu migration/backfill. |
| 4 | **[Need Confirm]** Có quota/token Youtube API đủ cho bộ test regression và paging. | Youtube API phụ thuộc token/quota bên ngoài hệ thống crawler. |
| 5 | **[Need Confirm]** Danh sách country/priority cần test chính thức do BA/Dev cung cấp. | Loader filter theo `country_code` và priority range nhưng wiki chưa chỉ định matrix country/priority bắt buộc. |
| 6 | **[Need Confirm]** Cơ chế lấy `views`, `likes`, `comments`: Resolver có gọi thêm Youtube `videos.list` với `part=statistics` hay statistics đã được enrich trước khi resolve. | Wiki mapping ghi lấy từ `videos.list`, nhưng luồng 8 bước chỉ mô tả `playlistItems`. |
| 7 | **[Need Confirm]** Rule cụ thể để derive field `shard` từ `created_date`. | Wiki chỉ ghi `shard` derived from `created_date`, chưa nêu format hoặc algorithm. |
| 8 | **[Need Confirm]** Giá trị numeric của constant `MENTION_TYPE.POST` trên Solr/mention output. | QA cần expected value cụ thể để assert field `mention_type`. |
| 9 | **[Need Confirm]** Thumbnail `standard` trong response Youtube có bị bỏ qua hay được đưa vào priority chain. | Wiki mapping ghi `maxres > high > medium > default`, trong response mẫu có thêm `standard`. |
| 10 | **[Need Confirm]** Logic `delay_time_rules`, `from_date`, `to_date` ảnh hưởng đến `next_crawl_time`, paging stop condition và window crawl như thế nào trong implementation mới. | Các field này có trong crawling request sample nhưng wiki chưa mô tả expected behavior chi tiết. |

---

## 2. PHẠM VI KIỂM THỬ (Scope of Testing)

### 2.1 In-Scope

#### Module 1: Loader - Load Youtube Source From Identity

| STT | Hạng mục | Mô tả |
|---|---|---|
| 1 | Filter source | Verify chỉ load source thỏa **tất cả** điều kiện: `platform = 7`, đúng `country_code` theo config, `priority` nằm trong range `[min_priority, max_priority]`, `next_crawl_time <= time_next_cycle`, và `last_status` **không thuộc** `(4, 5)` theo exclude filter `-last_status` |
| 2 | Field source | Verify source message có đủ field cần thiết: `id`, `id_social`, `link`, `fullname`, `post_updated_at`, `post_last_date`, `category`, `priority`, `is_kol`, `country_code` |
| 3 | Sort order | Verify sorter theo `next_crawl_time asc`, sau đó `id asc` |
| 4 | Cursor tracking | Verify cursor loader được lưu/cập nhật trong MySQL `ynm_crawling_loaders.crawling_loaders` |
| 5 | Redis lock | Verify source được add lock khi load và không bị load lặp trong cùng cycle |
| 6 | Queue output | Verify message publish vào `<env>.cl.yt.posts_crawling_sources` đúng format |

#### Module 2: Builder - Build Youtube Crawling Request

| STT | Hạng mục | Mô tả |
|---|---|---|
| 7 | Consume crawling source | Builder consume đúng queue `cl.yt.posts_crawling_sources` |
| 8 | Convert playlist id | Verify channel id dạng `UC...` được convert thành upload playlist id dạng `UU...` |
| 9 | Request params | Verify request params gồm `playlistId`, `maxResults=50`, `part=["snippet","contentDetails"]` |
| 10 | Source metadata | Verify crawling request giữ đúng `platform=7`, `createdBy=YoutubePostApiCrawlingLoader`, `id_social`, `link`, `priority`, `delay_time_rules`, `from_date`, `to_date` |
| 10a | Delay rules metadata | [Need Confirm] Verify `delay_time_rules` được giữ nguyên từ source và được dùng đúng để tính/update `next_crawl_time` sau khi source finished |
| 10b | Date window metadata | [Need Confirm] Verify `from_date`/`to_date` được build đúng theo rule của loader và không làm mất post hợp lệ trong crawl window |
| 11 | Queue output | Verify message publish vào `<env>.cl.yt.posts_crawling_requests` đúng contract |
| 12 | Next page source | Verify Builder xử lý source từ queue next page `<env>.cl.yt.posts_crawling_sources_next_pages` khi Resolver phát hiện `nextPageToken` |

#### Module 3: Crawler - Call Youtube API

| STT | Hạng mục | Mô tả |
|---|---|---|
| 13 | Token Manager integration | Verify service lấy token đúng crawler type `YT_IDENTITY_CRAWLER` |
| 14 | Youtube API call | Verify gọi đúng endpoint Youtube `playlistItems` và parse response thành crawled source |
| 15 | Crawled source contract | Verify crawled source gồm `source`, `data.code`, `data.body`, `key` routing đúng pattern `cl.7.*.*.posts` |
| 16 | Error handling | Verify API trả lỗi quota/token/not found/private channel không làm service crash và có retry/log phù hợp |
| 17 | Queue output | Verify publish qua exchange `<env>.cl.yt.crawled_source` tới `<env>.cl.yt.posts_crawled_sources` |

#### Module 4: Resolver - Mapping Mention/Post

| STT | Hạng mục | Mô tả |
|---|---|---|
| 18 | Extract video id | Verify ưu tiên `contentDetails.videoId`, fallback `snippet.resourceId.videoId` |
| 19 | Mention id/link | Verify `id = hashUuid('yt_' + videoId)`, `id_social = videoId`, `link = https://www.youtube.com/watch?v={videoId}` |
| 20 | Mention source mapping | Verify `platform=7`, `domain=youtube.com`, `id_source = hashUuid('yt_channel_' + source.id)`, `identity = id_source` |
| 21 | Mention content mapping | Verify `identity_name`, `mention_type = MENTION_TYPE.POST` **[Need Confirm: numeric value]**, `title`, `search_text`, `attachment`, `created_date`, `updated_at`, `country_code`, `is_kol`, `source_category`, `shard` **[Need Confirm: shard derivation rule]** |
| 22 | Engagement mapping | Verify `views`, `likes`, `comments` lấy từ Youtube `videos.list` statistics hoặc mechanism đã được Dev confirm; `shares=0`; `engagement_total=views+likes+comments`; `engagement_s_c=comments` |
| 22a | Statistics API call | [Need Confirm] Nếu service gọi riêng `videos.list`, verify request dùng `part=statistics`, đúng danh sách `videoId`, batch/rate limit hợp lý và không vượt quota bất thường |
| 22b | Statistics error handling | Nếu `videos.list` lỗi/thiếu statistics, verify fallback engagement đúng rule, không làm rớt toàn bộ batch mention/post |
| 23 | Post mapping | Verify `id`, `id_social`, `video_id`, `id_source`, `title`, `created_date`, `crawled_date`, `last_status=0`, `is_kol`, `priority`, `likes`, `comments`, `views` |
| 24 | Thumbnail priority | Verify attachment chọn ảnh tốt nhất theo thứ tự `maxres > high > medium > default` |
| 24a | Standard thumbnail behavior | [Need Confirm] Verify thumbnail `standard` trong Youtube response được bỏ qua theo wiki hoặc được bổ sung vào priority chain nếu Dev xác nhận |
| 25 | Missing optional fields | Verify title/description/thumbnail/statistics thiếu không làm crash, mapping fallback đúng theo wiki |
| 26 | Queue output mention | Verify publish mention vào `<env>.cl.mentions_2_solr_mentions` với routing `cl.<platform>.<mention_type>.<country>.mentions` |
| 27 | Queue output post | Verify publish post vào `<env>.cl.posts_2_mongo_yt_posts` với routing `cl.<platform>.posts` |

#### Module 5: Paging, Finished Source, Lock Release

| STT | Hạng mục | Mô tả |
|---|---|---|
| 28 | Next page | Khi response có `nextPageToken`, Resolver publish source next page với routing `cl.7.*.*.posts.next_page` |
| 29 | Stop paging | Khi không còn `nextPageToken` hoặc đạt điều kiện dừng, không publish thêm next page |
| 30 | Finished source | Verify publish finished source vào `<env>.cl.identities_finished_sources` với routing `cl.7.identities` |
| 31 | Release lock | Verify Redis lock được remove sau khi source hoàn tất hoặc sau lỗi đã xử lý theo rule |
| 32 | Update source | Verify source updater cập nhật trạng thái/metadata như `next_crawl_time`, `post_last_date` hoặc field tương ứng theo implementation thực tế |
| 33 | Idempotency | Re-run cùng source/video không tạo duplicate mention/post ngoài cơ chế upsert dự kiến |

#### Module 6: Data Persistence và Regression

| STT | Hạng mục | Mô tả |
|---|---|---|
| 34 | Solr mentions | Verify mention hợp lệ được lưu vào Solr `mentions` với field chính đúng mapping |
| 35 | Mongo youtube_posts | Verify post được lưu/upsert vào MongoDB `ynm_crawler.youtube_posts` |
| 36 | Cursor loader | Verify MySQL cursor không bị reset sai khi service restart |
| 37 | Redis lock state | Verify Redis DB 1 không còn lock treo sau test complete |
| 38 | Parity repo cũ | So sánh output chính của repo mới với luồng cũ trên một số source mẫu nếu có sample baseline từ Dev |
| 39 | Regression shared services | Verify không ảnh hưởng các queue chung `cl.resolved_data`, `cl.resolved_source`, Token Manager, Data Pusher, Source Updater |

### 2.2 Out-of-Scope

| Hạng mục | Lý do |
|---|---|
| **UI/UX Testing** | Task thuộc backend/data crawler, không có màn hình hoặc thay đổi trải nghiệm người dùng trực tiếp |
| **Youtube API correctness** | Không kiểm thử tính đúng đắn dữ liệu gốc do Youtube trả về; chỉ kiểm thử hệ thống gọi API và xử lý response đúng contract |
| **Crawl comment/profile/engagement riêng biệt ngoài post statistics** | Wiki chỉ mô tả crawl danh sách post/video từ source, không mô tả luồng comment/profile riêng |
| **Token Manager/Proxy Manager internal logic** | Chỉ kiểm thử integration lấy token/proxy ở mức crawler sử dụng được; không test thuật toán cấp phát/renew token |
| **Full data migration/backfill từ repo cũ** | Jira nêu chuyển luồng sang repo mới, chưa có requirement migrate historical data hoặc chạy backfill toàn bộ |
| **Load/Stress test production-scale** | Wiki chưa nêu SLA/throughput; chỉ test stability và throughput cơ bản trên môi trường testing/staging |
| **Full regression toàn bộ crawler platform** | Chỉ regression các thành phần dùng chung và luồng Youtube Post liên quan trực tiếp |

---

## 3. CHIẾN LƯỢC KIỂM THỬ (Test Strategy & Approach)

### 3.1 Functional Testing

| Nhóm test | Kỹ thuật áp dụng | Mô tả |
|---|---|---|
| Loader criteria testing | Boundary/Decision Table | Test matrix theo `country_code`, priority min/max, `next_crawl_time`, `last_status` |
| Queue contract testing | Contract Testing | Verify message schema và routing key qua từng queue/exchange |
| Mapping validation | Field-by-field Verification | So sánh mention/post output với mapping table trong wiki |
| Paging testing | State Transition Testing | Test có next page, không có next page, nhiều page liên tiếp, dừng paging |
| Error handling | Negative Testing | API lỗi, token lỗi, source invalid, response thiếu field, statistics thiếu field |
| Idempotency/retry | Retry/Replay Testing | Publish lại cùng source/crawled source để verify không duplicate ngoài upsert dự kiến |
| Source lifecycle | End-to-end Testing | Verify lock -> crawl -> resolve -> finished source -> release lock/update source |

### 3.2 API/Integration Testing

| Điểm tích hợp | Phương pháp kiểm thử | Cách kiểm tra |
|---|---|---|
| RabbitMQ | Monitor queue depth, routing key, sample message | RabbitMQ Management UI hoặc script consume peek |
| Youtube API | Verify request params và response handling | Service logs, crawled source payload, mock/replay data khi cần |
| Token Manager | Verify crawler lấy token đúng type | Logs và trạng thái token service |
| Redis | Verify lock add/remove đúng source | Redis CLI/query key `YoutubePostApiCrawlingLoader` |
| MySQL crawling loaders | Verify cursor tracking | Query `ynm_crawling_loaders.crawling_loaders` |
| MongoDB | Verify `youtube_posts` upsert đúng | Query theo `id_social`, `video_id`, `id_source` |
| Solr | Verify mention được index đúng | Query theo `id`, `id_social`, `platform=7` |
| Source Updater | Verify finished source được consume và update source | Queue/log/DB trước và sau crawl |

### 3.3 Data Sync/Persistence Testing

| Hạng mục | Mục tiêu |
|---|---|
| Mention persistence | Mention hợp lệ từ Resolver phải đi đến Solr, không mất field bắt buộc |
| Post persistence | Post hợp lệ phải đi đến Mongo `youtube_posts`, không duplicate theo `videoId` |
| Source state | Source sau crawl phải có trạng thái/metadata phù hợp để cycle sau không crawl sai |
| Loader cursor | Cursor không gây skip source hoặc load trùng batch sau restart |
| Repo parity | Output chính của repo mới cần tương thích contract downstream đang dùng từ repo cũ |

### 3.4 Non-functional Testing

| NFR | Tiêu chí đánh giá | Cách kiểm tra |
|---|---|---|
| Stability | Service không crash khi gặp response rỗng, thiếu field, API lỗi hoặc token lỗi | Theo dõi pod logs và restart count |
| Observability | Log đủ trace source id/video id/routing key, không log secret/token | Search logs theo source/video và kiểm tra masking |
| Idempotency | Retry/replay không tạo duplicate mention/post không mong muốn | Query Solr/Mongo trước và sau replay |
| Basic performance | Với batch/concurrency testing, queue được consume ổn định, không backlog bất thường | Monitor queue depth, processing timestamp |
| Security | Không expose token Youtube, Redis password hoặc API key trong log/message output | Kiểm tra log và sample message |

### 3.5 Ước lượng test coverage

| Nhóm test | Số case dự kiến | Priority |
|---|---:|---|
| Loader filter, cursor, Redis lock | 10-14 | P0 |
| Builder request contract | 6-8 | P0 |
| Crawler API success/error | 8-10 | P0 |
| Resolver mapping mention/post | 16-22 | P0 |
| Paging/finished source/source updater | 8-12 | P0 |
| Persistence Solr/Mongo/MySQL/Redis | 8-10 | P1 |
| Negative/edge cases | 10-14 | P1 |
| Regression/parity repo cũ | 5-8 | P1 |
| **Tổng ước tính** | **71-98 cases** | |

---

## 4. TIMELINE & EFFORT ESTIMATION

### 4.1 Timeline theo milestone Jira

| Phase | Thời gian | Effort dự kiến | Owner | Ghi chú |
|---|---|---:|---|---|
| Test Plan update & review | 10/07 | 0.5 man-day | QA Owner + QA Lead | Cập nhật theo review, resolve các điểm Critical |
| Test Design & Test Case Review | 10/07 - 11/07 | 1.5 man-days | QA Owner | Gắn với subtask `YNMPDP-6082` |
| Test Data Preparation | 10/07 - 11/07 | 0.5 man-day | QA + Dev support | Chuẩn bị source/channel/video cho happy path, paging, edge cases |
| Smoke Test trên Testing env | 11/07 | 0.5 man-day | QA Owner | Gate trước khi full execution |
| Functional + Integration Testing | 11/07 - 14/07 | 3 man-days | QA Owner | Ưu tiên P0/P1 |
| Bug Fix & Retest | 14/07 - 15/07 | 1 man-day | Dev Owner + QA Owner | Tùy số lượng/severity bug |
| Regression trên Staging | 15/07 - 16/07 | 1 man-day | QA Owner | Verify staging trước sign-off |
| Test Summary & Sign-off | 17/07 | 0.5 man-day | QA Lead/Manager | Go/No-Go |
| **Tổng** | **10/07 - 17/07** | **~8 man-days** |  |  |

### 4.2 Timeline risk

| Risk | Đánh giá | Hành động |
|---|---|---|
| Timeline chỉ còn khoảng 5 ngày làm việc từ 10/07 đến 17/07 | Cao | Ưu tiên P0 trước, P1 theo rủi ro, P2 có thể defer nếu có approval |
| Test suite dự kiến 71-98 cases, khá lớn cho một QA owner | Cao | Chạy smoke gate sớm; chia execution theo module; cần Dev support nhanh khi có blocker |
| Sprint `DC: 22 Jun 2026 - 03 Jul 2026` đã overdue so với trạng thái QA hiện tại | Trung bình | Align với PM/Scrum Master về expectation, scope tối thiểu để staging sign-off |
| Chưa resolve các Need Confirm kỹ thuật trong ngày 10/07 | Cao | Escalate Dev Owner để confirm collection, statistics API, shard, mention type, delay rules |

> **Lưu ý:** Buffer gần như không có. Nếu gặp blocker từ deployment, Youtube API quota/token hoặc bug paging/mapping nghiêm trọng, mốc `Test done 14/07` và `Done staging 17/07` có nguy cơ trượt.

---

## 5. ROLES & RESPONSIBILITIES

| Vai trò | Người/Team | Trách nhiệm |
|---|---|---|
| QA Owner | Lam Tran Thanh | Cập nhật test plan/test cases, chuẩn bị data, execute test, log bug, cung cấp evidence |
| Dev Owner | Van Huynh Kien | Hỗ trợ setup/debug, clarify technical design, fix bug, confirm các Need Confirm kỹ thuật |
| Reporter/BA/PO | Thach Dung Pham Nhu | Clarify requirement/business expectation khi có gap từ Jira/Wiki |
| QA Lead/Manager | **[Need Confirm]** | Review test plan/test result, approve risk/defer, ký QA sign-off |
| DevOps/Infra | **[Need Confirm]** | Deploy testing/staging, kiểm tra queue binding, cấp quyền log/DB nếu cần |
| Data/Platform Support | **[Need Confirm]** | Hỗ trợ query Solr/Mongo/MySQL/Redis và kiểm tra downstream service |

---

## 6. SMOKE TEST CHECKLIST

Smoke test là gate bắt buộc trước khi chạy full execution. Nếu một item P0 smoke fail, QA cần dừng full test và raise blocker.

| # | Check item | Expected result | Priority | Status |
|---|---|---|---|---|
| 1 | Deployment `ynmpdp-6004-testing-ynm-crawler-empty` healthy | Pod running, không restart loop | P0 | ☐ |
| 2 | RabbitMQ queue/exchange binding đúng | Các queue trong Section 8.3 tồn tại và bind đúng routing key | P0 | ☐ |
| 3 | Redis DB 1 accessible | Query được lock key `YoutubePostApiCrawlingLoader` | P0 | ☐ |
| 4 | MongoDB `ynm_crawler` accessible | Query được collection source/post liên quan | P0 | ☐ |
| 5 | Solr `mentions` accessible | Query smoke được theo `platform=7` hoặc id test | P0 | ☐ |
| 6 | MySQL `ynm_crawling_loaders` accessible | Query được table `crawling_loaders` | P1 | ☐ |
| 7 | Token Manager trả token cho `YT_IDENTITY_CRAWLER` | Crawler lấy token thành công, không log lỗi auth/quota | P0 | ☐ |
| 8 | Loader load được ít nhất 1 Youtube source hợp lệ | Có message vào `<env>.cl.yt.posts_crawling_sources` | P0 | ☐ |
| 9 | E2E 1 source thành công | Có mention/post output và ghi được vào Solr/Mongo | P0 | ☐ |
| 10 | Log không expose secret | Không thấy token/API key/password trong logs/evidence | P0 | ☐ |

---

## 7. REQUIREMENT TRACEABILITY MATRIX

| Wiki/Jira Requirement | Test Plan Module | Test case group dự kiến trong `YNMPDP-6082` | Coverage |
|---|---|---|---|
| Load identity query với filter `platform=7`, country, priority, `next_crawl_time`, exclude `last_status` 4/5 | Module 1: Loader | TC-001 -> TC-014 | P0 |
| Lock source bằng Redis, track cursor loader | Module 1 + Module 5 | TC-010 -> TC-018, TC-055 -> TC-060 | P0 |
| Builder convert `UC...` sang `UU...`, build request `playlistItems` | Module 2: Builder | TC-015 -> TC-022 | P0 |
| Crawler gọi Youtube API qua Token Manager | Module 3: Crawler | TC-023 -> TC-032 | P0 |
| Resolver mapping mention theo wiki | Module 4: Resolver | TC-033 -> TC-046 | P0 |
| Resolver mapping post theo wiki | Module 4: Resolver | TC-047 -> TC-054 | P0 |
| Engagement lấy từ `videos.list` statistics hoặc mechanism được confirm | Module 4: Resolver | TC-041 -> TC-044 | P0 - Need Confirm |
| Paging với `nextPageToken` | Module 5: Paging | TC-055 -> TC-062 | P0 |
| Finished source và release/update source | Module 5: Finished Source | TC-063 -> TC-066 | P0 |
| Persistence Solr/Mongo/MySQL/Redis | Module 6: Persistence | TC-067 -> TC-076 | P1 |
| Regression/parity repo cũ | Module 6: Regression | TC-077 -> TC-084 | P1 |

> **[Need Confirm]** Dải TC ID sẽ được cập nhật theo Google Sheet cuối cùng của subtask `YNMPDP-6082`.

---

## 8. MÔI TRƯỜNG KIỂM THỬ (Test Environment)

### 8.1 Môi trường sử dụng

| Môi trường | Mục đích | Giai đoạn |
|---|---|---|
| **Local** | Smoke service, replay/mock message, debug mapping nhanh | Chuẩn bị testcase và reproduce bug |
| **Testing/K8s** | Test chính theo deployment `ynmpdp-6004-testing-ynm-crawler-empty` | Functional, integration, negative |
| **Staging** | Regression, dữ liệu gần production, sign-off release | Trước khi release |
| **Production** | Monitor sau release, không dùng test data chủ động nếu chưa được approve | Post-release monitoring |

### 8.2 Services cần chạy/quan sát

| Service/Component | Vai trò |
|---|---|
| `@ynm/cl-crawling-loader-service` | Load Youtube source từ identity và publish crawling source |
| `@ynm/cl-yt-post-crawler-service` | Builder/Crawler/Resolver cho Youtube Post |
| Token Manager Service | Cấp token cho Youtube API crawler |
| RabbitMQ | Queue/exchange trung gian của toàn bộ pipeline |
| Redis DB 1 | Lưu lock source `YoutubePostApiCrawlingLoader` |
| MySQL `ynm_crawling_loaders` | Lưu cursor loader |
| MongoDB `ynm_crawler.youtube_posts` | Lưu Youtube post |
| Solr `mentions` | Lưu mention |
| Source Updater Service | Update/release source sau khi crawl |
| Data Pusher Service | Consume resolved data để ghi Solr/Mongo |

### 8.3 Queue/Exchange cần monitor

| Nhóm | Queue/Exchange |
|---|---|
| Crawling source | `<env>.cl.yt.posts_crawling_sources` |
| Next page source | `<env>.cl.yt.posts_crawling_sources_next_pages`, exchange `<env>.cl.resolved_source`, routing `cl.7.*.*.posts.next_page` |
| Crawling request | `<env>.cl.yt.posts_crawling_requests` |
| Crawled source | exchange `<env>.cl.yt.crawled_source`, queue `<env>.cl.yt.posts_crawled_sources`, routing `cl.7.*.*.posts` |
| Mention output | exchange `<env>.cl.resolved_data`, queue `<env>.cl.mentions_2_solr_mentions`, routing `cl.7.<mention_type>.<country>.mentions` |
| Post output | exchange `<env>.cl.resolved_data`, queue `<env>.cl.posts_2_mongo_yt_posts`, routing `cl.7.posts` |
| Finished source | exchange `<env>.cl.resolved_source`, queue `<env>.cl.identities_finished_sources`, routing `cl.7.identities` |

### 8.4 Test data cần chuẩn bị

| Nhóm data | Mục đích |
|---|---|
| Youtube channel hợp lệ có nhiều video | Happy path, mapping, persistence |
| Youtube channel có nhiều page video | Verify `nextPageToken` và next page |
| Youtube channel ít video hoặc không có video | Verify empty response và finished source |
| Source thiếu `fullname` | Verify `identity_name` fallback sang `channelTitle` hoặc empty string |
| Source thiếu `country_code`, `category`, `is_kol` | Verify fallback/validation theo implementation thực tế |
| Video thiếu thumbnail cấp cao | Verify attachment fallback `high/medium/default` |
| Video thiếu statistics hoặc statistics trả string/empty | Verify default/parse engagement đúng |
| Source bị `last_status` 4/5 | Verify Loader không load |
| Source có `next_crawl_time` tương lai | Verify Loader không load |
| Replay cùng crawled source | Verify idempotency/upsert |

#### 8.4.1 Sample data cần chốt trước execution

| Nhóm | Channel ID / Video ID mẫu | Đặc điểm | Owner | Ghi chú |
|---|---|---|---|---|
| Happy path | **[Need Confirm]** | Channel public, có video mới, có statistics | QA + Dev | Chọn từ identity collection testing/staging |
| Paging | **[Need Confirm]** | Channel có >50 video để đảm bảo có `nextPageToken` | QA + Dev | Cần tối thiểu 2 pages |
| Empty response | **[Need Confirm]** | Channel public nhưng không có video hoặc API trả `items=[]` | Dev support | Dùng để verify finished source |
| Private/deleted/not found | **[Need Confirm]** | API trả 403/404 hoặc lỗi tương đương | Dev support | Dùng cho negative Crawler test |
| Thumbnail fallback | **[Need Confirm]** | Video thiếu `maxres`/`high`, chỉ còn lower thumbnail | QA | Verify priority/fallback |
| Statistics missing/error | **[Need Confirm]** | Video thiếu statistics hoặc `videos.list` fail | Dev support/mock | Verify engagement fallback |

### 8.5 Nền tảng/thiết bị

Task không có UI, nên không yêu cầu matrix browser/mobile. QA sử dụng các công cụ backend/data sau:

- RabbitMQ Management UI hoặc script inspect message.
- K8s logs/deployment dashboard.
- MongoDB client.
- Solr admin/query tool.
- Redis CLI/client.
- MySQL client.
- Google Sheet testcase ở subtask `YNMPDP-6082`.

---

## 9. TIÊU CHÍ ĐÁNH GIÁ (Entry & Exit Criteria)

### 9.1 Entry Criteria

| # | Điều kiện bắt đầu test |
|---|---|
| 1 | Jira `YNMPDP-6004` ở trạng thái ready for QA/To be Tested và Dev đã thông báo code done |
| 2 | Wiki technical và wiki script/message đã được cập nhật, QA có đủ thông tin queue/config chính |
| 3 | Deployment `ynmpdp-6004-testing-ynm-crawler-empty` đã deploy thành công trên môi trường testing |
| 4 | Các service phụ thuộc sẵn sàng: RabbitMQ, Redis, MySQL, MongoDB, Solr, Token Manager, Data Pusher, Source Updater |
| 5 | Token/quota Youtube API đủ để chạy testcase chính |
| 6 | QA có quyền đọc log, inspect queue và query DB trên môi trường testing/staging |
| 7 | Test data đã được chuẩn bị hoặc Dev cung cấp source mẫu hợp lệ/invalid |
| 8 | Test cases trong subtask `YNMPDP-6082` đã được review/approve bởi QA Lead hoặc Dev Owner trước khi full execution |
| 9 | Các Need Confirm P0 đã có câu trả lời hoặc có workaround được QA Lead chấp nhận: collection source, statistics API, queue binding, token/quota |

### 9.2 Exit Criteria

| # | Điều kiện kết thúc test/sign-off |
|---|---|
| 1 | 100% P0/P1 test cases đã executed trên testing; các case N/A có lý do rõ ràng |
| 2 | 0 bug Critical/Blocker/High còn open |
| 3 | Các bug Medium liên quan mapping/persistence/paging đã fix hoặc có approval defer rõ ràng |
| 4 | Luồng end-to-end chạy thành công từ source -> mention/post -> Solr/Mongo -> finished source/update source |
| 5 | Không phát hiện duplicate dữ liệu bất thường khi retry/replay cùng source/video |
| 6 | Redis lock không bị treo sau khi source hoàn tất hoặc sau lỗi đã xử lý |
| 7 | Logs không có error lặp liên tục, không expose token/API key/password |
| 8 | Regression trên staging pass với ít nhất một bộ source mẫu hợp lệ |
| 9 | Test Summary Report đã được gửi, có evidence queue/DB/log cho các flow chính |
| 10 | Test execution rate đạt **>= 95%** tổng số test cases planned; các case N/A phải có lý do rõ ràng |
| 11 | Pass rate sau fix/retest đạt **>= 90%** tổng số test cases executed |
| 12 | 100% smoke checklist P0 pass trên Testing trước full execution và 100% regression P0 pass trên Staging trước sign-off |
| 13 | QA Lead/Manager ký Go/No-Go dựa trên criteria 1-12 và danh sách risk còn lại |

---

## 10. BUG SEVERITY / PRIORITY CLASSIFICATION

| Severity | Criteria trong context `YNMPDP-6004` | Ví dụ |
|---|---|---|
| Blocker | Pipeline không thể chạy hoặc không thể test end-to-end | Service crash ngay khi start, deployment không healthy, queue binding thiếu làm message không đi tiếp |
| Critical | Gây mất dữ liệu, duplicate dữ liệu nghiêm trọng, lock source treo diện rộng hoặc output không thể pusher | Mention/post không được lưu, duplicate theo `videoId`, Redis lock không release sau finished source |
| Major | Sai mapping field quan trọng, sai engagement, paging thiếu/thừa page, source update sai nhưng có workaround | Sai `id_source`, sai `created_date`, `views/likes/comments` sai, loop next page |
| Minor | Lỗi không ảnh hưởng dữ liệu chính nhưng ảnh hưởng trace/debug/quality | Log thiếu source id/video id, timestamp format khác expected nhưng dữ liệu vẫn dùng được |
| Trivial | Lỗi cosmetic hoặc typo không ảnh hưởng execution/data | Typo trong log message, field order trong JSON khác nhưng contract vẫn hợp lệ |

| Priority | Criteria xử lý | SLA đề xuất |
|---|---|---|
| P0 | Blocker/Critical hoặc ảnh hưởng trực tiếp sign-off | Fix/retest trong ngày |
| P1 | Major, ảnh hưởng một phần flow hoặc regression quan trọng | Fix trước staging sign-off |
| P2 | Minor, có workaround rõ ràng | Có thể defer nếu QA Lead/PO approve |
| P3 | Trivial/nice-to-have | Backlog cải thiện |

---

## 11. GO/NO-GO, ROLLBACK & POST-RELEASE MONITORING

### 11.1 Go Criteria

| # | Go Criteria |
|---|---|
| 1 | Tất cả Exit Criteria ở Section 9.2 đạt hoặc có approval defer chính thức |
| 2 | 0 bug Blocker/Critical/High open |
| 3 | Các Need Confirm P0 đã resolve, không còn ambiguity ảnh hưởng expected result |
| 4 | Smoke Testing và Staging Regression đều pass P0 |
| 5 | Test Summary Report có evidence đầy đủ cho Loader, Builder, Crawler, Resolver, Persistence và Source Update |

### 11.2 No-Go Criteria

| # | No-Go Criteria |
|---|---|
| 1 | Pipeline end-to-end không chạy được hoặc không có mention/post output |
| 2 | Mapping sai field định danh quan trọng: `id`, `id_social`, `id_source`, `identity`, `link`, `created_date` |
| 3 | Duplicate dữ liệu bất thường hoặc lock source treo không có cleanup/workaround an toàn |
| 4 | Paging loop vô hạn hoặc làm backlog queue tăng liên tục |
| 5 | Token/API key/password bị expose trong log/message/evidence |
| 6 | Staging regression P0 fail chưa được fix hoặc chưa có approval risk |

### 11.3 Rollback Plan

| Tình huống | Hành động rollback/mitigation | Owner |
|---|---|---|
| Production phát hiện service crash hoặc queue backlog tăng mạnh | Disable deployment/scale down service mới, route lại luồng cũ nếu rollback path còn sẵn | Dev Owner + DevOps |
| Mapping sai gây data dirty | Dừng pusher liên quan nếu cần, khoanh vùng batch/source/video id, chuẩn bị script cleanup/reprocess theo approval | Dev Owner + Data Support |
| Redis lock treo nhiều source | Dừng loader/crawler, export danh sách lock, cleanup lock theo source test/affected list sau khi xác nhận | Dev Owner + QA |
| Youtube API quota/token issue | Tạm pause crawler hoặc giảm concurrency, đổi token/quota theo quy trình Token Manager | Dev Owner |
| Bug chỉ ảnh hưởng edge case không critical | Defer có approval, thêm monitoring và backlog fix | QA Lead + PO |

### 11.4 Post-release Monitoring

| Thời điểm | Check item | Tool/Method | Owner |
|---|---|---|---|
| 0-1h sau release | Pod healthy, không restart loop | K8s dashboard/logs | DevOps + Dev |
| 0-1h sau release | Queue không backlog bất thường | RabbitMQ Management | QA + Dev |
| 0-1h sau release | Không có error pattern mới liên quan Youtube crawler | Log search theo deployment/source id | QA + Dev |
| 1-4h sau release | Mention/Post mới xuất hiện trong Solr/Mongo | Query sample theo `platform=7`, `videoId` | QA/Data Support |
| 1-4h sau release | Redis lock không treo bất thường | Redis CLI/client | Dev |
| 24h sau release | Throughput và error rate không lệch bất thường so với baseline | Monitoring dashboard/log metrics | Dev + QA |
| 24h sau release | Source update/next crawl cycle hoạt động ổn định | Query source/cursor sample | QA + Dev |

---

## 12. RỦI RO & HƯỚNG GIẢI QUYẾT (Risks & Mitigations)

| # | Risk | Impact | Mitigation |
|---|---|---|---|
| 1 | Youtube API quota/token không đủ hoặc token hết hạn trong lúc test | Block Crawler/API test, khó phân biệt bug code và lỗi external dependency | Chuẩn bị token/quota trước khi test; có mock/replay crawled source để test Resolver độc lập; log rõ lỗi token/quota |
| 2 | Mapping output repo mới lệch repo cũ hoặc lệch downstream contract | Mention/post có thể thiếu field, sai id, sai link, gây lỗi pusher/reporting | Tạo checklist field-by-field theo wiki; so sánh với sample output repo cũ nếu Dev cung cấp; bắt buộc verify Solr/Mongo sau pusher |
| 3 | Redis lock không release khi lỗi hoặc khi paging dừng bất thường | Source bị kẹt, không crawl lại ở cycle sau | Test negative path API error/empty response; monitor Redis trước/sau; có script cleanup test lock khi cần |
| 4 | Paging xử lý sai `nextPageToken` gây duplicate hoặc loop vô hạn | Queue backlog, duplicate post, tốn quota Youtube API | Test nhiều page với giới hạn quan sát; verify stop condition; monitor số message next page và count video unique |
| 5 | Loader filter/cursor sai làm skip source hoặc load trùng source | Mất dữ liệu hoặc crawl trùng diện rộng | Test boundary theo `next_crawl_time`, priority, country, last_status; verify MySQL cursor sau restart |
| 6 | Dữ liệu Youtube thay đổi realtime trong lúc test | Expected count/title/statistics có thể lệch giữa lần crawl và lần verify | Không assert cứng count lớn; verify theo contract và một số video id cố định; ghi timestamp test evidence |
| 7 | Queue binding/routing key trên env testing/staging chưa đúng | Message không tới downstream, QA nhìn như service không hoạt động | Trước khi execute full test, chạy smoke queue contract; confirm binding với Dev/Ops |
| 8 | Config/log vô tình expose secret từ script môi trường | Rủi ro bảo mật khi log/evidence được chia sẻ | Không đưa password/token vào testcase/evidence; kiểm tra log masking; chỉ refer config key, không lưu secret vào test plan |
| 9 | Timeline quá tight so với 71-98 test cases | Không đủ thời gian execute full suite và staging regression | Ưu tiên P0/P1, chốt defer P2 sớm, escalate blocker trong ngày |
| 10 | Cơ chế `videos.list` statistics chưa rõ | Không xác định được expected engagement hoặc quota thực tế | Dev confirm trong ngày 10/07; nếu chưa confirm, mock/replay Resolver để isolate mapping |
| 11 | `shard`, `mention_type`, `standard` thumbnail chưa có expected rõ | Testcase khó assert chính xác, dễ tranh luận khi bug | Đưa vào Need Confirm blocking cho test design; cập nhật expected sau khi Dev xác nhận |

---

## 13. TÀI LIỆU BÀN GIAO (Deliverables)

| Deliverable | Mô tả | Owner | Thời điểm |
|---|---|---|---|
| Test Plan | Kế hoạch kiểm thử cho `YNMPDP-6004` | QA | Trước khi execute full test |
| Test Cases | Testcase chi tiết trên Google Sheet/subtask `YNMPDP-6082` | QA | Trước hoặc trong ngày bắt đầu testing |
| Test Data Set | Danh sách source/channel/video dùng cho happy path, paging, invalid, replay | QA + Dev support | Trước khi execute |
| Bug Report | Bug trên Jira, có evidence logs/queue/DB và steps reproduce | QA | Trong quá trình testing |
| Evidence Package | Screenshot/log/message sample/query result cho các luồng chính | QA | Khi test pass từng module hoặc trước sign-off |
| Test Summary Report | Tổng kết scope, execution result, bug status, risk còn lại, recommendation release | QA | Sau khi hoàn tất testing/staging |
| Release Sign-off/Go-No-Go | Kết luận QA cho phép release hoặc block release | QA Lead/QA Manager | Trước khi merge/release production |
