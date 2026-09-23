# TEST PLAN
## [DATA] Improve Crawling Post From Reply On Platform X
### Feature: X Post From Reply - Mapping, Invalid Data Handling, Detect Country Handoff

| Field | Value |
|---|---|
| **Mã tài liệu** | TP-YNMSHGYSG-1169-v1.1 |
| **Dự án** | YouNet Media - SocialHeat Global |
| **Ngày tạo** | 26/06/2026 |
| **Ngày cập nhật** | 26/06/2026 |
| **Người tạo** | QA Team (AI-assisted) |
| **Phiên bản** | 1.1 - Incorporated Review |
| **Trạng thái** | Draft - Pending Review/Sign-off |
| **Jira chính** | https://jira.younetco.com/browse/YNMSHGYSG-1169 |
| **Due date** | 06/07/2026 |
| **Tài liệu tham chiếu** | Wiki run script: https://wiki.younetco.com/pages/viewpage.action?pageId=268894605 ; Related Jira: YNMSHGYSG-1119, YNMSHGYSG-1054, YNMSHGYSG-661, YNMSHGYSG-1139, YNMSHGYSG-1117 |
| **MR/Deployment tham chiếu** | MR #2598; deployment `ynmshgysg-1169-testing-ynm-crawler-empty` *(Need Confirm: MR #2598 là code final trước khi QA full test)* |

---

## 1. MỤC TIÊU & TỔNG QUAN (Introduction & Objective)

### 1.1 Bối cảnh

Luồng **Crawl Post From Reply on Platform X** nhận source từ `cl.resolved_source` với routing key dạng `cl.*.*.*.posts_from_reply`, sau đó crawl post bằng cookie, resolver dữ liệu thành **mentions**, **posts**, **replies**, **identities**, rồi đẩy tiếp qua Data Pusher, Source Updater và luồng detect country.

Task `YNMSHGYSG-1169` là task cải tiến chất lượng dữ liệu và độ ổn định cho luồng này. Các thay đổi chính được port từ các bug/task đã xử lý ở luồng X hashtag/keyword:

- X API hiện chỉ trả social id của community, không còn tín hiệu xác định admin/mod post.
- Một số response X bị thiếu field hoặc sai shape làm resolver/crawler log lỗi liên tục.
- Message đẩy sang luồng detect country cần theo logic dùng author và phải đủ payload để downstream xử lý.

### 1.2 Giải pháp trong scope task

| Nhóm thay đổi | Mô tả | Reference |
|---|---|---|
| **Community/Admin mapping** | Bỏ field `is_admin_creator` khỏi mention khi nền tảng không trả tín hiệu admin. Identity community thiếu tên sẽ build `name/fullname` dạng `user_<social_id>`. | YNMSHGYSG-1119 |
| **Invalid mention handling** | Mention thiếu field bắt buộc không được làm service crash hoặc spam log; phải được route sang `<env>.cl.x.invalid_data_crawling_sources`. | YNMSHGYSG-1054 |
| **Detect country handoff** | Điều chỉnh message gửi qua luồng Update Identity Info/detect country theo author; payload không được thiếu `mentions`. | YNMSHGYSG-661, YNMSHGYSG-1139 |
| **Mapping consistency** | Đảm bảo các field như `id_source`, `source_type`, `identity`, `identity_name` đúng theo spec BA cho X/community. | YNMSHGYSG-1117 |

### 1.3 Mục tiêu kiểm thử

- Đảm bảo luồng X Post From Reply chạy end-to-end từ crawling source đến Mongo/Solr/Redis/Source Updater.
- Đảm bảo mapping mention/post/reply/identity đúng contract mới, đặc biệt với community.
- Đảm bảo invalid mention được tách sang invalid queue, không lọt vào normal queue và không làm gián đoạn batch hợp lệ.
- Đảm bảo message detect country đúng format, có `mentions`, đúng identity/author cần detect.
- Đảm bảo không regression sang các luồng X keyword/hashtag community và X source post/shared có dùng chung resolver/mapping.

---

## 2. PHẠM VI KIỂM THỬ (Scope of Testing)

### 2.1 In-Scope

#### Module 1: Builder/Crawler/Resolver - X Post From Reply

| STT | Hạng mục | Mô tả |
|---|---|---|
| 1 | Consume crawling source | Nhận message từ `cl.x.posts_from_reply_by_cookie_crawling_sources` hoặc source routed từ `cl.resolved_source` đúng format |
| 2 | Build crawling request | Builder tạo request đúng `id`, `type`, `platform`, `link`, `createdBy`, paging config |
| 3 | Crawl post from reply | Crawler gọi X API bằng token/proxy đúng crawler type và xử lý response thành crawled source |
| 4 | Paging/next page | Nếu response có next page/cursor thì publish resolved source đúng routing key `.next_page` |
| 5 | Resolver output | Resolver tạo đúng mentions, posts, replies, identities, identity country messages |

#### Module 2: Mapping Mention/Post/Reply/Identity

| STT | Hạng mục | Mô tả |
|---|---|---|
| 6 | Mention mapping cơ bản | Verify các field bắt buộc: `id`, `id_social`, `id_source`, `link`, `platform`, `domain`, `identity`, `identity_name`, `mention_type`, `source_type`, engagement, `search_text`, `created_date`, `updated_at` |
| 7 | Mapping consistency theo YNMSHGYSG-1117 | Verify riêng các field từng sai ở community flow: `id_source`, `source_type`, `identity`, `identity_name`, link/source mapping |
| 8 | Post mapping | Verify post output sang `cl.posts_2_mongo_x_posts`, bao gồm id/link/source/engagement/caption/created date |
| 9 | Reply mapping | Verify reply output sang `cl.replies_2_mongo_x_replies`, đúng relation với post/reply parent |
| 10 | Identity mapping | Verify identity output sang `cl.identities_2_solr_identities` và `cl.identities_2_redis_identities` |
| 11 | Community fallback name | Khi community chỉ có social id, identity name/fullname được build dạng `user_<social_id>` |
| 12 | Bỏ `is_admin_creator` | Mention community không còn field `is_admin_creator` khi nền tảng không cung cấp tín hiệu admin |

#### Module 3: Invalid Data Handling

| STT | Hạng mục | Mô tả |
|---|---|---|
| 13 | Validate required fields | Resolver kiểm tra đủ field bắt buộc trước khi publish mention |
| 14 | Route invalid mention | Mention invalid được publish sang `<env>.cl.x.invalid_data_crawling_sources` |
| 15 | Không crash service | Invalid data không gây exception liên tục kiểu `Cannot read property ...`, `Cannot convert undefined or null to object`, `Invalid time value` |
| 16 | Partial success | Một batch có cả valid và invalid record thì valid vẫn đi normal queue, invalid đi invalid queue |
| 17 | Invalid evidence | Invalid payload có đủ dữ liệu để trace nguyên nhân: source id, createdBy, missing fields/error reason *(Need Confirm)* |

#### Module 4: Detect Country Handoff

| STT | Hạng mục | Mô tả |
|---|---|---|
| 18 | Publish identity countries source | Resolver publish message sang `cl.x.identity_countries...` khi `RESOLVER_IS_DETECT_COUNTRY=true` |
| 19 | Payload có mentions | Message detect country không được rỗng `mentions` như bug YNMSHGYSG-1139 |
| 20 | Detect theo author | Verify identity được gửi đi detect là author của post theo logic YNMSHGYSG-661 |
| 21 | Không duplicate detect message | Cùng identity/post không bị publish lặp vô hạn khi retry hoặc next page |
| 22 | Tắt detect country | Khi `RESOLVER_IS_DETECT_COUNTRY=false`, không publish message sang identity country queue |

#### Module 5: Data Pusher, Source Updater, Regression

| STT | Hạng mục | Mô tả |
|---|---|---|
| 23 | Data Pusher - Post | Upsert post vào Mongo collection X posts đúng idempotency |
| 24 | Data Pusher - Reply | Upsert reply vào Mongo collection X replies đúng parent relation |
| 25 | Identity Pusher | Insert/update identity vào Solr và Redis đúng id |
| 26 | Source Updater | Source/crawled source được update status, next crawl/paging state đúng |
| 27 | Regression: X keyword community mapping | Verify community name, bỏ `is_admin_creator`, fallback name không bị regression |
| 28 | Regression: X hashtag community invalid queue | Verify invalid mention vẫn đi đúng invalid queue, không đi normal mention queue |
| 29 | Regression: X source post/shared detect country | Verify detect country payload vẫn đúng format, có `mentions`, mapping source/shared không bị lệch |

### 2.2 Out-of-Scope

| Hạng mục | Lý do |
|---|---|
| **UI/App display** | Task thuộc Data crawler pipeline, không thay đổi UI |
| **Độ chính xác thuật toán detect country** | Scope chỉ kiểm tra handoff format và identity được gửi đi; accuracy của service detect country là luồng khác |
| **Khôi phục khả năng nhận biết admin/mod của X** | Nền tảng không trả tín hiệu admin, task chỉ bỏ field `is_admin_creator` |
| **Token/proxy auto renew** | Luồng dùng token/proxy manager hiện có, task không thay đổi logic cấp token/proxy |
| **Load/Stress test quy mô lớn** | Không có NFR throughput cụ thể; chỉ kiểm tra stability cơ bản và không log lỗi liên tục |
| **Full regression toàn bộ Platform X** | Chỉ regression các luồng có dùng chung resolver/mapping liên quan: post from reply, keyword/hashtag community, source post/shared |

---

## 3. CHIẾN LƯỢC KIỂM THỬ (Test Strategy & Approach)

### 3.1 Functional Testing - Trọng tâm chính

| Nhóm test | Kỹ thuật áp dụng | Mô tả |
|---|---|---|
| **Queue Contract Testing** | Contract Testing | Verify message qua từng queue đúng exchange/routing/payload, không thiếu field bắt buộc |
| **Mapping Validation** | Field-by-field Verification | So sánh output mention/post/reply/identity với spec BA và related bugs |
| **Invalid Data Matrix** | Decision Table Testing | Tạo data thiếu từng nhóm field bắt buộc, verify route invalid queue |
| **Community Edge Cases** | Equivalence Partitioning | Community có đủ name, thiếu name, chỉ có social id, shared/quoted post từ community |
| **Detect Country Handoff** | Integration Testing | Verify message sang identity country queue đúng author và có `mentions` |
| **Partial Failure Handling** | Error Guessing | Một batch lẫn valid/invalid; API trả null/undefined object; date invalid; author missing |
| **Regression** | Smoke + Targeted Regression | Chạy lại X keyword community, X hashtag community, X source post/shared có dùng chung resolver/mapping |

#### Mapping Requirement -> Test Scenarios

| Requirement/Issue | Estimated Test Cases | Priority |
|---|---:|---|
| Community mapping bỏ `is_admin_creator` và fallback `user_<social_id>` | 6-8 cases | P0 |
| Required field validation và invalid queue | 12-16 cases | P0 |
| Detect country handoff theo author, payload có `mentions` | 8-10 cases | P0 |
| Mapping consistency theo YNMSHGYSG-1117 | 4-6 cases | P0 |
| X post from reply happy path + paging | 6-8 cases | P1 |
| Data Pusher/Source Updater persistence | 5-7 cases | P1 |
| Regression keyword/hashtag/source post/shared | 7-9 cases | P1 |
| Edge cases: empty response, duplicate, malformed response, retry | 6-8 cases | P1 |
| **Tổng ước tính** | **54-72 cases** | |

### 3.2 API/Integration Testing

| Điểm tích hợp | Phương pháp kiểm thử | Công cụ/Cách thức |
|---|---|---|
| **RabbitMQ - crawling sources/requests/crawled sources** | Monitor queue depth và message sample | RabbitMQ Management UI / script get message |
| **X API / X Graph Service** | Verify crawler gọi được endpoint và handle response lỗi | Service logs + crawled source output |
| **Token Manager / Proxy Manager** | Verify lấy đúng crawler type `X_POST_FROM_REPLY_BY_COOKIE_CRAWLER` | Logs + token/proxy manager status |
| **Resolver -> resolved_data** | Verify mention/post/reply/identity publish đúng routing | RabbitMQ message sample |
| **Data Pusher -> Mongo** | Verify post/reply upsert đúng collection | Mongo query theo `id_social`/`id` |
| **Identity Pusher -> Solr/Redis** | Verify identity tồn tại và đúng fallback name | Solr query + Redis key |
| **Resolver -> Identity Country flow** | Verify message detect country có `mentions`, `posts`, identity author | RabbitMQ queue `cl.x.identity_countries...` |
| **Invalid Queue** | Verify invalid payload không đi normal queue | Queue `<env>.cl.x.invalid_data_crawling_sources` |

### 3.3 Non-functional Testing

| NFR | Tiêu chí đánh giá | Cách kiểm tra |
|---|---|---|
| **Stability** | Service không crash khi gặp malformed/partial response | Theo dõi logs trong lúc push invalid test data |
| **No log spam** | Không xuất hiện lỗi lặp liên tục kiểu `Cannot read property ...`, `Cannot convert undefined or null to object`, `Invalid time value` cho invalid data đã được handle | Search logs theo keyword lỗi cũ |
| **Idempotency** | Re-run cùng source không tạo duplicate post/reply/identity không mong muốn | Query DB/queue theo id sau retry |
| **Partial processing** | Batch có invalid record không làm mất valid record | So sánh count valid input vs output normal queue |
| **Processing latency cơ bản** | Message đi qua Resolver/Pusher trong thời gian hợp lý của môi trường testing | Đo timestamp message/log, không yêu cầu SLA production |

### 3.4 Data Persistence/Data Sync

| Hạng mục | Mô tả |
|---|---|
| **Mongo X posts** | Verify post được upsert đúng, không mất relation với source/reply |
| **Mongo X replies** | Verify reply được lưu đúng parent post/comment relation |
| **Solr mentions** | Verify mention hợp lệ vào Solr, invalid mention không vào Solr |
| **Solr/Redis identities** | Verify identity community fallback name và id đúng |
| **Source update** | Verify source/crawled source status không bị treo khi có invalid data |

---

## 4. MÔI TRƯỜNG KIỂM THỬ (Test Environment)

### 4.1 Môi trường

| Môi trường | Mục đích | Giai đoạn sử dụng |
|---|---|---|
| **Local/K8s Testing** | Smoke, verify queue contract, debug invalid payload | Phase phân tích và local test |
| **Testing** | Test chức năng chính theo deployment `ynmshgysg-1169-testing-ynm-crawler-empty` | Phase test chính |
| **Staging** | Regression và sign-off trước release | Sau khi pass testing |
| **Production** | Monitor sau release, không test trực tiếp bằng test data | Post-release monitoring |

### 4.2 Services cần chạy/quan sát

| Service | Scope | Ghi chú |
|---|---|---|
| `@ynm/cl-x-post-from-reply-crawler-service` | Builder/Crawler/Resolver | Service chính của task |
| `@ynm/cl-data-pusher-service` | Push post/reply vào Mongo | Bật `POST_2_MONGO_X_POST_ENABLE`, `REPLY_2_MONGO_X_REPLY_ENABLE` |
| `@ynm/cl-source-updater-service` | Update source state | Bật `X_POST_ENABLE`, `X_REPLY_ENABLE` |
| Token Manager Service | Cấp token X crawler | Dùng crawler type của post from reply |
| Proxy Manager Service | Cấp proxy X crawler | Dùng crawler type của post from reply |
| Identity Country Service | Downstream detect country | Chỉ cần verify input/handoff trong scope task |

### 4.3 Queue/Exchange cần monitor

| Nhóm | Queue/Pattern |
|---|---|
| Crawling source/request/crawled | `<env>.cl.x.posts_from_reply_by_cookie_crawling_sources`, `<env>.cl.x.posts_from_reply_by_cookie_crawling_requests`, `<env>.cl.x.posts_from_reply_by_cookie_crawled_sources` |
| Resolved data | `<env>.cl.mentions_2_solr_mentions`, `<env>.cl.posts_2_mongo_x_posts`, `<env>.cl.replies_2_mongo_x_replies`, `<env>.cl.identities_2_solr_identities`, `<env>.cl.identities_2_redis_identities` |
| Detect country | `<env>.cl.x.identity_countries_crawling_sources`, `<env>.cl.x.identity_countries_crawling_requests`, `<env>.cl.x.identity_countries_crawled_sources` |
| Invalid data | `<env>.cl.x.invalid_data_crawling_sources` *(hard blocker: cần confirm queue binding/routing key final trước khi chạy Module 3)* |
| Finished/source update | Queue source updater tương ứng X post/reply *(Need Confirm: tên queue final trên env test)* |

### 4.4 Test data cần chuẩn bị

| Nhóm data | Mục đích |
|---|---|
| Post from reply hợp lệ | Happy path, pusher, updater |
| Post/reply từ community có đủ name | Community normal mapping |
| Community chỉ có social id, không có name | Verify fallback `user_<social_id>` |
| Mention type = 3 có shared link | Verify `link_shared` required và mapping shared fields |
| Response thiếu author/user object | Verify invalid queue hoặc fallback theo rule |
| Response thiếu created date/date invalid | Verify invalid queue, không crash |
| Batch gồm valid + invalid records | Verify partial success |
| Duplicate source/retry same source | Verify idempotency |

### 4.5 Cách tạo test data

| Nguồn | Mô tả | Dùng cho | Owner |
|---|---|---|---|
| **Real crawling source** | Lấy message thật từ RabbitMQ testing/staging hoặc production đã được sanitized | Happy path, community normal, baseline mapping | QA |
| **Mock crawled source** | Tự tạo JSON message publish vào crawled/source queue phù hợp để bypass API khi cần | Invalid testing, edge cases, date malformed | QA + Dev support |
| **Dev sample data** | Data sample từ Dev trong quá trình develop/MR #2598 | Baseline comparison, reproduce bug fix | Dev |
| **Modified real data** | Clone real data, xóa/sửa field để tạo invalid matrix | Required field validation, partial success | QA |
| **Replay same source** | Publish lại cùng source/crawled source nhiều lần | Idempotency, retry, duplicate handling | QA |

---

## 5. TIÊU CHÍ ĐÁNH GIÁ (Entry & Exit Criteria)

### 5.1 Entry Criteria - Điều kiện để QA bắt đầu test

| # | Tiêu chí | Bắt buộc |
|---|---|---|
| 1 | Code/MR của `YNMSHGYSG-1169` đã deploy lên Testing | Bắt buộc |
| 2 | Wiki/script run service đã cập nhật cho post from reply | Bắt buộc |
| 3 | Queue `posts_from_reply_by_cookie_*`, resolved data queues, identity country queues đã được bind đúng | Bắt buộc |
| 4 | Queue invalid data `<env>.cl.x.invalid_data_crawling_sources` đã được tạo/bind | Bắt buộc |
| 5 | Token/proxy cho `X_POST_FROM_REPLY_BY_COOKIE_CRAWLER` có sẵn và usable | Bắt buộc |
| 6 | Có test data/source đủ để cover happy path, community, invalid, detect country | Bắt buộc |
| 7 | Data Pusher và Source Updater chạy được trên cùng môi trường | Bắt buộc |
| 8a | BA/Dev đã confirm NC-1, NC-2, NC-4, NC-7 trong Phụ lục A | Bắt buộc |
| 8b | BA/Dev đã confirm NC-3, NC-5, NC-6, NC-8 trong Phụ lục A | Khuyến khích |
| 9 | QA có quyền xem RabbitMQ logs/message sample và query Mongo/Solr/Redis cần thiết | Bắt buộc |
| 10 | MR #2598 được Dev xác nhận là code final trước khi bắt đầu full execution | Bắt buộc |

### 5.2 Exit Criteria - Điều kiện để QA cho phép release

| # | Tiêu chí | Bắt buộc |
|---|---|---|
| 1 | 100% P0 test cases đã executed với kết quả Passed hoặc Bug Fixed/Re-tested Passed | Bắt buộc |
| 2 | 0 bug Critical/High mở liên quan data loss, service crash, invalid data làm nghẽn luồng | Bắt buộc |
| 3 | Community mapping pass: không còn `is_admin_creator`, fallback `user_<social_id>` đúng | Bắt buộc |
| 4 | Invalid data handling pass: invalid mention vào invalid queue, không vào normal queue, không crash/log spam | Bắt buộc |
| 5 | Detect country handoff pass: message có `mentions`, đúng author/identity theo rule | Bắt buộc |
| 6 | Happy path end-to-end pass: post/reply/mention/identity được push đúng storage/queue | Bắt buộc |
| 7 | Regression X keyword/hashtag/source post/shared pass ở các case mapping liên quan | Bắt buộc |
| 8 | Test case execution rate >= 95% cho P0 + P1 | Bắt buộc |
| 9 | P0 pass rate = 100% và P0+P1 pass rate >= 98% sau retest | Bắt buộc |
| 10 | Bug Medium/Low còn mở đã được PM/BA/Dev Lead đánh giá và chấp nhận release | Khuyến khích |
| 11 | Test Summary Report đã được gửi cho PM/Dev/BA | Khuyến khích |

---

## 6. TIMELINE & ƯỚC LƯỢNG KIỂM THỬ (Timeline & Estimation)

### 6.1 Timeline theo Jira comment

| Phase | Bắt đầu | Kết thúc | Nội dung | Output | Owner |
|---|---|---|---|---|---|
| Test Plan/Test Cases/Wiki | 26/06/2026 | 26/06/2026 | Hoàn thiện test plan v1.1, viết test cases, chuẩn bị danh sách Need Confirm | Test plan, test cases draft, questions list | QA |
| Smoke/Env Readiness | 26/06/2026 | 27/06/2026 | Start service, verify queue binding, chạy smoke checklist Phụ lục D | Smoke report, env blocker list | QA + DevOps |
| Local/K8s Execution | 27/06/2026 | 30/06/2026 | Execute full TC trên local/K8s, ưu tiên P0 invalid/mapping/detect country | Local execution report, bugs | QA |
| Testing Env Execution | 01/07/2026 | 02/07/2026 | Execute/retest trên Testing env `ynmshgysg-1169` | Testing execution report | QA + Dev |
| Staging Regression | 03/07/2026 | 06/07/2026 | Regression X keyword/hashtag/source post/shared, final retest | Staging execution report | QA |
| Final Sign-off | 06/07/2026 | 06/07/2026 | Tổng kết bug, coverage, residual risks, release recommendation | Test Summary Report + Sign-off | QA + PM/BA/Dev |

> Lưu ý: Timeline 03/07 -> 06/07 có thể chạm cuối tuần. PM cần xác nhận resource support cuối tuần hoặc điều chỉnh expectation nếu bug High/Critical phát sinh trên Staging.

### 6.2 Effort estimation

| Hoạt động | Effort ước tính | Ghi chú |
|---|---:|---|
| Hoàn thiện test plan + test cases | 1.0 man-day | Bao gồm update sau review |
| Chuẩn bị test data + smoke env | 0.5-1.0 man-day | Phụ thuộc queue invalid và quyền truy cập DB/RabbitMQ |
| Local/K8s execution | 2.0-2.5 man-days | Ưu tiên P0 trước |
| Testing execution + retest | 1.5-2.0 man-days | Có thể tăng nếu bug invalid/detect country |
| Staging regression | 1.0-1.5 man-days | Targeted regression |
| Test summary + sign-off | 0.5 man-day | Sau khi pass exit criteria |
| Bug triage/retest buffer | 1.0-1.5 man-days | Buffer cho bug fix/re-deploy |
| **Tổng effort** | **7.5-10.0 man-days** | Giả định 1 QA chính; timeline khá gấp nhưng khả thi nếu blocker được resolve trong ngày 26/06 |

---

## 7. VAI TRÒ & TRÁCH NHIỆM (Roles & Responsibilities)

| Vai trò | Người phụ trách | Trách nhiệm |
|---|---|---|
| QA Lead/Tester | Lam Tran Thanh | Viết test plan/test cases, chuẩn bị data, execute, report bug, test summary, sign-off QA |
| Developer | Huy Nguyen Vo Quoc | Confirm technical contract, fix bug, support debug logs, xác nhận MR/deployment |
| BA/Reporter | Tai Vuong Ngoc | Confirm requirement, review `Need Confirm`, approve expected behavior |
| PM/Release Owner | *(Need Confirm)* | Approve timeline, accept residual risk, quyết định release/carry-over |
| DevOps/Infra | *(Need Confirm)* | Setup deployment, queue binding, RabbitMQ/DB access, rollback support |
| App/Consumer owner | *(Need Confirm nếu có consumer phụ thuộc `is_admin_creator`)* | Confirm tác động tới downstream consumer ngoài Data pipeline |

---

## 8. GIẢ ĐỊNH & PHỤ THUỘC (Assumptions & Dependencies)

### 8.1 Assumptions

| # | Giả định | Ảnh hưởng nếu sai |
|---|---|---|
| A1 | X API giữ nguyên response shape trong thời gian testing, không có breaking change mới | Có thể phát sinh invalid case ngoài scope, cần re-evaluate mapping |
| A2 | Token/Proxy Manager hoạt động ổn định và không phải nguyên nhân chính gây fail test | Nếu token/proxy fail, nhiều TC crawler bị blocked do infra |
| A3 | MR #2598 là code final cho full QA execution | Nếu có commit/MR mới, cần re-smoke và có thể re-run impacted TC |
| A4 | Luồng X keyword/hashtag community đã stable ở sprint trước, chỉ cần targeted regression | Nếu chưa stable, regression scope phải mở rộng |
| A5 | Dev/BA có thể trả lời các `Need Confirm` blocker trong 1 ngày làm việc | Nếu chậm, test case design và invalid/detect country execution bị delay |

### 8.2 Dependencies

| # | Phụ thuộc | Owner | Trạng thái cần có trước test |
|---|---|---|---|
| D1 | Deploy MR #2598 lên Testing env thành công | Dev + DevOps | Done |
| D2 | Queue `<env>.cl.x.invalid_data_crawling_sources` được tạo/bind đúng | DevOps | Done trước Module 3 |
| D3 | Data Pusher + Source Updater version tương thích đang chạy | DevOps | Done |
| D4 | QA có quyền truy cập RabbitMQ Management, Mongo, Solr, Redis trên Testing/Staging | DevOps | Done |
| D5 | Test data thật/mock đủ cho happy path, community, invalid, detect country | QA + Dev | Ready |
| D6 | Identity Country downstream queue có thể monitor message input | DevOps + QA | Ready |

---

## 9. RỦI RO & HƯỚNG GIẢI QUYẾT (Risks & Mitigations)

### 9.1 Rủi ro kỹ thuật

| # | Rủi ro | Mức độ | Xác suất | Hướng giải quyết |
|---|---|---|---|---|
| R1 | **X API thay đổi shape hoặc thiếu field bất thường** làm khó reproduce case invalid | Cao | Trung bình | Chuẩn bị cả test data thật và mock/crawled source message để chủ động verify resolver |
| R2 | **Invalid queue chưa được bind/config trên env test** khiến không verify được scope quan trọng nhất | Cao | Trung bình | Confirm queue/routing key trước test; bổ sung queue vào regex RabbitMQ monitor; đưa NC-7 vào Entry Criteria bắt buộc |
| R3 | **Resolver dùng chung logic với X keyword/hashtag/source post** nên fix post from reply có thể gây regression | Cao | Trung bình | Chạy targeted regression cho keyword community, hashtag community, source post/shared sau khi pass post from reply |
| R4 | **Detect country payload sai nhưng downstream vẫn ack** làm bug khó thấy nếu chỉ nhìn final DB | Cao | Trung bình | Bắt message trực tiếp ở identity country queue để verify contract |
| R5 | **Field required chưa thống nhất về empty/null/default** dẫn đến QA và Dev hiểu khác nhau | Trung bình | Cao | Chốt decision table required fields trước khi viết test cases chi tiết |
| R6 | **Fallback `user_<social_id>` áp dụng không rõ field nào** | Trung bình | Trung bình | Confirm rõ `identity_name` trong mention và `name/fullname` trong identity |
| R7 | **Pusher/updater idempotency khó verify nếu DB đã có data cũ** | Trung bình | Trung bình | Dùng id/link test riêng, cleanup trước khi chạy hoặc query theo timestamp/source id |

### 9.2 Rủi ro quy trình

| # | Rủi ro | Mức độ | Xác suất | Hướng giải quyết |
|---|---|---|---|---|
| R8 | **Ticket phụ/related bugs đã Closed nhưng spec rải rác ở nhiều Jira** | Trung bình | Cao | Tổng hợp requirement vào phụ lục và xin Dev/BA review test plan trước khi viết TC |
| R9 | **Môi trường Testing thiếu token/proxy hoặc service restart liên tục** | Trung bình | Trung bình | Chạy smoke env trước, ghi rõ blocker nếu fail do infra |
| R10 | **Task carry-over sang sprint sau** do sprint hiện tại kết thúc 26/06 nhưng due date là 06/07 | Trung bình | Cao | PM xác nhận timeline/capacity sprint sau; QA báo status hằng ngày |
| R11 | **MR thay đổi giữa quá trình test** làm kết quả execution không còn hợp lệ | Cao | Trung bình | Confirm MR #2598 final trước full test; nếu có commit mới, chạy re-smoke và impacted regression |

### 9.3 Rủi ro nghiệp vụ

| # | Rủi ro | Mức độ | Xác suất | Hướng giải quyết |
|---|---|---|---|---|
| R12 | **Bỏ `is_admin_creator` có thể ảnh hưởng consumer cũ đang expect field này** | Cao | Thấp | Confirm với BA/App rằng field này không còn required cho X community mention; regression pusher/API nếu có consumer liên quan |
| R13 | **Invalid mention bị loại bỏ làm giảm số lượng mention hợp lệ so với trước** | Trung bình | Trung bình | Phân biệt data truly invalid vs data có thể fallback; invalid queue phải có reason để audit |

### 9.4 Rollback plan

| Tình huống rollback | Trigger | Người quyết định | Hành động | Data recovery/Follow-up |
|---|---|---|---|---|
| Service crash hoặc queue backlog nghiêm trọng trên Staging/Production | Bug Critical, crawler không xử lý được valid data | PM/Release Owner + Dev Lead | Rollback deployment về image/version trước MR #2598 | Export affected messages, replay sau khi fix |
| Invalid data bị publish vào normal mention queue hàng loạt | Bug High, có nguy cơ dirty Solr/Mongo | PM/BA + Dev Lead | Stop affected consumer/crawler, rollback service | Identify records theo `createdBy`/timestamp/source id, cleanup hoặc reprocess |
| Detect country payload sai gây update country sai diện rộng | Bug High/Critical tùy impact | PM/BA + Dev Lead | Tắt `RESOLVER_IS_DETECT_COUNTRY` hoặc rollback service | Audit identity country messages, re-run detect sau fix |
| Regression ảnh hưởng X keyword/hashtag/source post | Bug High trên targeted regression | PM/Dev Lead | Rollback hoặc hotfix scoped mapping resolver | Re-run regression impacted flows |

---

## 10. PHÂN LOẠI MỨC ĐỘ BUG (Bug Severity Classification)

| Severity | Định nghĩa | Ví dụ trong scope task |
|---|---|---|
| **Critical** | Service crash, data loss, luồng chính bị nghẽn hoàn toàn, valid data không thể đi qua pipeline | Resolver crash khi gặp invalid data; valid mention/post/reply bị mất toàn batch; queue backlog không recover |
| **High** | Chức năng chính sai, data contract sai nghiêm trọng, có nguy cơ dirty data hoặc downstream fail | Invalid mention đi vào normal queue; detect country message thiếu `mentions`; `is_admin_creator` vẫn xuất hiện khi phải bỏ; mapping `id_source/source_type` sai diện rộng |
| **Medium** | Chức năng phụ sai hoặc data không chính xác nhưng không gây mất data/không nghẽn pipeline | Fallback name sai format nhưng identity vẫn tạo được; engagement phụ mapping sai; duplicate detect message số lượng thấp |
| **Low** | Lỗi log/documentation/cosmetic, không ảnh hưởng dữ liệu chính | Log warning thừa; message có field thừa không được downstream dùng; typo trong wiki/test script |

---

## 11. TÀI LIỆU BÀN GIAO (Deliverables)

| # | Tài liệu | Mô tả | Deadline | Owner | Người nhận |
|---|---|---|---|---|---|
| 1 | **Test Plan v1.1** | Kế hoạch kiểm thử tổng thể, scope, strategy, risk, timeline, owner | 26/06/2026 | QA - Lam Tran Thanh | PM, Dev Lead, BA |
| 2 | **Test Cases** | Chi tiết 54-72 test cases: steps, test data, expected result | 26/06/2026 | QA - Lam Tran Thanh | PM, BA, Dev |
| 3 | **Smoke Test Report** | Kết quả smoke env, queue binding, service start, sample message | 27/06/2026 | QA - Lam Tran Thanh | PM, Dev |
| 4 | **RabbitMQ Evidence** | Message samples ở normal queues, invalid queue, identity country queue | Ongoing | QA - Lam Tran Thanh | Dev, QA |
| 5 | **DB Verification Evidence** | Query result Mongo/Solr/Redis cho post/reply/mention/identity | Ongoing | QA - Lam Tran Thanh | Dev, QA |
| 6 | **Bug Reports** | Jira bug kèm input message, output actual, expected, logs | Ongoing | QA - Lam Tran Thanh | Dev Team |
| 7 | **Test Execution Report - Local/K8s** | Trạng thái pass/fail/blocked từng testcase ở local/K8s | 30/06/2026 | QA - Lam Tran Thanh | PM |
| 8 | **Test Execution Report - Testing** | Trạng thái pass/fail/blocked từng testcase ở Testing env | 02/07/2026 | QA - Lam Tran Thanh | PM |
| 9 | **Staging Regression Report** | Kết quả targeted regression trên Staging | 06/07/2026 | QA - Lam Tran Thanh | PM, Dev Lead, BA |
| 10 | **Test Summary Report + Sign-off** | Tổng kết coverage, bugs, residual risk, release recommendation | 06/07/2026 | QA - Lam Tran Thanh | PM, Dev Lead, Stakeholders |

---

## 12. PHÊ DUYỆT / SIGN-OFF

| Vai trò | Họ tên | Ngày ký | Trạng thái | Ghi chú |
|---|---|---|---|---|
| QA Lead/Tester | Lam Tran Thanh |  | Pending | Sign-off sau khi đạt Exit Criteria |
| Developer/Dev Lead | Huy Nguyen Vo Quoc |  | Pending | Confirm bug fixed và technical readiness |
| BA/Reporter | Tai Vuong Ngoc |  | Pending | Confirm expected behavior và residual risk |
| PM/Release Owner | *(Need Confirm)* |  | Pending | Final release decision |
| DevOps/Infra | *(Need Confirm)* |  | Pending | Confirm deployment/rollback readiness nếu cần |

---

## PHỤ LỤC

### A. Tổng hợp các điểm cần xác nhận *(Need Confirm)*

> Các điểm dưới đây cần confirm trước khi chốt test cases chi tiết để tránh QA viết sai expected result. NC-1, NC-2, NC-4, NC-7 là blocker theo Entry Criteria.

| # | Câu hỏi | Người cần hỏi | Ảnh hưởng nếu chưa confirm | Mức độ |
|---|---|---|---|---|
| NC-1 | Payload của `<env>.cl.x.invalid_data_crawling_sources` gồm raw crawled source, transformed mention, hay object có `reason/errors`? | Dev | Ảnh hưởng expected result của toàn bộ invalid TC | Blocking |
| NC-2 | Fallback `user_<social_id>` áp dụng cho field nào: `identity_name` trong mention, `fullname/name` trong identity, hay cả hai? | BA + Dev | Ảnh hưởng mapping TC community | Blocking |
| NC-3 | `is_admin_creator` bỏ cho mọi X mention hay chỉ mention từ community? | BA | Ảnh hưởng regression và expected mapping | Nice-to-have trước full regression |
| NC-4 | Với post from reply, detect country theo author của original post, reply author, source/community, hay theo rule ưu tiên nào? | BA + Dev | Blocking detect country TC | Blocking |
| NC-5 | Nếu toàn bộ batch invalid, Source Updater mark source là finished, failed, hay partial success? | Dev | Ảnh hưởng TC updater | Nice-to-have |
| NC-6 | Required field check xử lý empty string, `0`, `null`, `undefined`, empty array thế nào? | Dev | Ảnh hưởng invalid decision table | Nice-to-have |
| NC-7 | Queue invalid data đã được bind trên Testing/Staging chưa? Routing key final là gì? | DevOps + Dev | Blocking invalid queue verification | Blocking |
| NC-8 | Có cần verify App consumer nào đang phụ thuộc field `is_admin_creator` không? | BA + App | Ảnh hưởng scope regression | Nice-to-have |
| NC-9 | MR #2598 có phải code final để QA full execution không? Có commit/MR nào khác pending không? | Dev | Nếu có code change, cần re-smoke/re-run impacted TC | Blocking trước full execution |
| NC-10 | PM có approve timeline carry-over sang sprint sau và support cuối tuần cho Staging 03/07-06/07 không? | PM | Ảnh hưởng cam kết deadline 06/07 | Nice-to-have nhưng cần chốt sớm |

### B. Required fields for Mention Validation

Theo related Jira `YNMSHGYSG-1054`, các field mention bắt buộc cần cover trong invalid test matrix:

| Field | Required | Note |
|---|---|---|
| `id` | Yes | Mention id |
| `id_source` | Yes | Source/author/community id theo mapping BA |
| `domain` | Yes | `x.com` |
| `identity` | Yes | Identity id |
| `identity_name` | Yes | Có thể fallback `user_<social_id>` nếu rule cho phép |
| `platform` | Yes | Platform X = 11 |
| `mention_type` | Yes | Post/shared/reply mention type |
| `source_type` | Yes | Theo BA spec |
| `likes` | Yes | Required đối với social platform |
| `comments` | Yes | Engagement field |
| `shares` | Yes | Engagement field |
| `engagement_total` | Yes | Engagement total |
| `engagement_s_c` | Yes | Engagement social count |
| `search_text` | Yes | Text dùng search/index |
| `link` | Yes | Mention link |
| `link_shared` | Conditional | Required khi `mention_type = 3` |
| `attachment` | Yes | Có thể là empty/default theo rule *(Need Confirm)* |
| `created_date` | Yes | Date hợp lệ |
| `updated_at` | Yes | Date hợp lệ |

### C. Mapping Requirement -> Test Coverage

```
YNMSHGYSG-1169:
├── Flow chính: X Post From Reply
│   ├── Builder/Crawler/Resolver happy path
│   ├── Paging/next page
│   └── Data Pusher + Source Updater
├── Mapping consistency (YNMSHGYSG-1117)
│   ├── id_source
│   ├── source_type
│   ├── identity
│   └── identity_name
├── Community/Admin mapping (YNMSHGYSG-1119)
│   ├── Remove is_admin_creator
│   └── Fallback name = user_<social_id>
├── Invalid data handling (YNMSHGYSG-1054)
│   ├── Required field validation
│   ├── Invalid queue
│   ├── No crash/log spam
│   └── Partial success
├── Detect country handoff (YNMSHGYSG-661, YNMSHGYSG-1139)
│   ├── Detect by author
│   ├── Payload contains mentions
│   └── RESOLVER_IS_DETECT_COUNTRY on/off
└── Regression
    ├── X keyword community
    ├── X hashtag community
    └── X source post/shared resolver mapping
```

### D. Smoke checklist trước khi chạy full test

| # | Check | Expected |
|---|---|---|
| 1 | Service `@ynm/cl-x-post-from-reply-crawler-service` start được | Không lỗi config/token/proxy |
| 2 | Push 1 source hợp lệ vào crawling source queue | Có message sang crawling request và crawled source |
| 3 | Resolver bật | Có output mention/post/reply/identity tương ứng |
| 4 | Data Pusher bật | Post/reply được upsert vào Mongo |
| 5 | Identity pusher bật | Identity vào Solr/Redis |
| 6 | Detect country bật | Có message ở `cl.x.identity_countries...` và payload có `mentions` |
| 7 | Push 1 invalid crawled source | Message vào invalid queue, service không crash |
| 8 | Chạy targeted regression 1 case X keyword/hashtag community | Không regression mapping community |

---

*-- Hết tài liệu Test Plan --*

*Tài liệu này được tạo bởi QA Team với sự hỗ trợ của AI, dựa trên Jira YNMSHGYSG-1169, các Jira liên quan, wiki run script, review test plan và phân tích luồng dữ liệu X Post From Reply. Các giả định đã được đánh dấu rõ bằng `Need Confirm` để follow-up trước khi viết/execution test cases chi tiết.*
