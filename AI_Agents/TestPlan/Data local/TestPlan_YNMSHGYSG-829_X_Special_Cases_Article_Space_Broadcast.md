# TEST PLAN
## [TECH DEPT][X Platform] Special Cases: Article, Space, Broadcast Content Completeness
### Feature: X Post From Reply - Special Content Resolver Mapping

| Field | Value |
|---|---|
| **Mã tài liệu** | TP-YNMSHGYSG-829-v1.0 |
| **Dự án** | YouNet Media - SocialHeat Global |
| **Ngày tạo** | 26/06/2026 |
| **Ngày cập nhật** | 26/06/2026 |
| **Người tạo** | QA Team (AI-assisted) |
| **Phiên bản** | 1.0 - Initial Draft |
| **Trạng thái** | Draft - Pending Review/Sign-off |
| **Jira chính** | https://jira.younetco.com/browse/YNMSHGYSG-829 |
| **Story/Script tham chiếu** | https://jira.younetco.com/browse/YNMSHGYSG-269 |
| **Bug liên quan** | YNMSHGYSG-516, YNMSHGYSG-741 |
| **Subtask QA/Testcase** | YNMSHGYSG-1396, YNMSHGYSG-1397 |
| **Due date** | 06/07/2026 |
| **MR/Deployment tham chiếu** | MR #2598; deployment `ynmshgysg-1169-testing-ynm-crawler-empty` *(theo comment Jira, cần Dev confirm đây là deployment final cho YNMSHGYSG-829)* |

---

## 1. MỤC TIÊU & TỔNG QUAN

### 1.1 Bối cảnh

Task `YNMSHGYSG-829` xử lý các trường hợp đặc biệt của nền tảng X trong luồng **Crawl Post By Reply**:

- **Article**: bài X Article có nội dung dài, có title/body/link article riêng.
- **Space / Audio Space**: bài dạng audio space có link `x.com/i/spaces/...`, có title/state/host metadata.
- **Broadcast / Livestream**: bài dạng broadcast/livestream có link/video metadata, có thể bị hệ thống cũ nhận diện sai là not found/invalid và skip.

Vấn đề ghi nhận từ Jira:

- Article bị lấy thiếu nội dung, `search_text` không chứa full article body.
- Có case lưu dư hoặc sai `link_shared` đối với post article.
- Có case `search_text` phần tử chứa JSON `ynm_link` nhưng phần nội dung bài viết bị thiếu.
- Các dạng `space`, `article`, `livestream/broadcast` từng bị skip mention với log `Skip handle when source finishes, because post is not found or invalid`; task này cần cải thiện để không mất data hợp lệ.

### 1.2 Yêu cầu nghiệp vụ / Tạm hiểu hiện tại

| Nhóm | Quy tắc kỳ vọng | Source |
|---|---|---|
| Article content | Lấy đủ title/body/preview/full content vào `search_text` và/hoặc `parent_posts.caption`, không chỉ lưu title/preview ngắn. | YNMSHGYSG-741 |
| Article link metadata | Link article được lưu để trace qua `ynm_link` hoặc `link_shared` theo rule BA final. | YNMSHGYSG-516, YNMSHGYSG-741 |
| Article/Space/Broadcast direct post | BA comment: post dạng article, audio space, broadcast có `mention_type=3`, `mention_type_details=3`, và có `link_shared`. | YNMSHGYSG-516 comment 30/03 |
| Shared Article special case | Nếu post A share article B nhưng X trả `is_quoted_status=false`, có comment BA chấp nhận post A vẫn `mention_type=1` và lưu `link_shared` để thống kê share của B. | YNMSHGYSG-741 comment |
| Not found/invalid skip | Article/Space/Broadcast còn sống không được bị skip như post not found/invalid. | YNMSHGYSG-741 |

> **Need Confirm quan trọng:** Có mâu thuẫn lịch sử giữa bug 516/741 về việc Article có/không có `link_shared`. Test plan này tách 2 scenario: **direct special content** và **normal post share special content**. Trước khi execute full regression, BA/Dev cần confirm rule final cho từng scenario.

### 1.3 Mục tiêu kiểm thử

- Đảm bảo crawler/resolver lấy đủ nội dung của Article, Space, Broadcast, không để `search_text` rỗng/thiếu/truncated sai.
- Đảm bảo mapping `mention_type`, `mention_type_details`, `link_shared`, `link_shared_domain`, `attachment`, `parent_posts` đúng theo rule BA final.
- Đảm bảo các post special content còn sống không bị skip nhầm là not found/invalid.
- Đảm bảo output mention/post/identity/detect country không regression so với luồng X Post By Reply hiện có.
- Đảm bảo data hợp lệ được push vào normal queue/DB; data thiếu bắt buộc được handle có kiểm soát, không crash service, không spam log.

---

## 2. PHẠM VI KIỂM THỬ

### 2.1 In-Scope

#### Module 1: Builder/Crawler Baseline

| STT | Hạng mục | Mô tả |
|---|---|---|
| 1 | Consume crawling source | Nhận source từ `testing.cl.x.posts_from_reply_by_cookie_crawling_sources` hoặc routing `cl.*.*.*.posts_from_reply` |
| 2 | Build request | Request đúng `id_social`, `platform=11`, crawler type `X_POST_FROM_REPLY_BY_COOKIE_CRAWLER` |
| 3 | Crawl response special content | Crawler parse được raw response chứa Article, Space, Broadcast, không throw null/undefined |
| 4 | Paging/next page | Nếu response có cursor thì publish next page đúng routing, không duplicate/infinite loop |

#### Module 2: Article Resolver & Mapping

| STT | Hạng mục | Mô tả |
|---|---|---|
| 5 | Article full content | `search_text`/`parent_posts.caption` chứa full article content, không chỉ title/preview ngắn |
| 6 | Article title/preview/body | Verify title, preview, body được ghép đúng thứ tự, không mất newline/unicode |
| 7 | Article link metadata | Verify `ynm_link`, `link_shared`, `link_shared_domain` theo rule final |
| 8 | Article mention type | Verify `mention_type`, `mention_type_details` cho direct article và share article |
| 9 | Article attachment | Verify `attachment` có `type=status` và `parent_info` nếu spec yêu cầu |
| 10 | Article parent_posts | Verify `parent_posts` có title/caption/created_date đúng nếu resolver build parent post |

#### Module 3: Space / Audio Space Resolver

| STT | Hạng mục | Mô tả |
|---|---|---|
| 11 | Space content | Lấy đủ title/description/state/host metadata vào output |
| 12 | Space link mapping | Link `x.com/i/spaces/<space_id>` được map đúng vào shared/link metadata |
| 13 | Space states | Cover live/upcoming/ended/canceled/unavailable nếu có sample |
| 14 | Space not skipped | Space hợp lệ không bị skip mention với reason not found/invalid |

#### Module 4: Broadcast / Livestream Resolver

| STT | Hạng mục | Mô tả |
|---|---|---|
| 15 | Broadcast content | Lấy đủ title/description/video/broadcast metadata nếu API trả về |
| 16 | Broadcast link mapping | Link broadcast/livestream đúng, không map nhầm link post cha |
| 17 | Broadcast states | Cover live/replay/ended/deleted/unavailable nếu có sample |
| 18 | Broadcast not skipped | Broadcast hợp lệ không bị skip mention; sample từ comment: `2039252621245268352` |

#### Module 5: Data Contract & Persistence

| STT | Hạng mục | Mô tả |
|---|---|---|
| 19 | Required fields | Mention hợp lệ có đủ id, id_social, id_source, domain, identity, identity_name, platform, mention_type, source_type, engagement, search_text, link, attachment, created_date, updated_at |
| 20 | Solr mentions | Mention Article/Space/Broadcast được push và query lại đúng field |
| 21 | Mongo posts/replies | Post/reply được upsert đúng id, parent relation, content |
| 22 | Identity queues | Identity được push sang Solr/Redis identity queues nếu có identity mới |
| 23 | Detect country handoff | Message detect country không bị thiếu posts/mentions, identity author đúng |
| 24 | Source updater | Source không bị treo, status update đúng khi special content valid/invalid |

#### Module 6: Regression & Non-functional

| STT | Hạng mục | Mô tả |
|---|---|---|
| 25 | Normal post regression | Text/photo/video/quote/repost bình thường không bị thay đổi sai |
| 26 | Bug regression YNMSHGYSG-516 | Không lặp lỗi lưu sai `search_text`/dư `link_shared` theo rule final |
| 27 | Bug regression YNMSHGYSG-741 | Không còn thiếu nội dung article, không skip article/space/broadcast hợp lệ |
| 28 | Stability | Malformed special response không crash service |
| 29 | Idempotency | Re-run cùng source không duplicate mention/post |
| 30 | Security/logging | Log/output không lộ token/cookie/proxy secret |

### 2.2 Out-of-Scope

| Hạng mục | Lý do |
|---|---|
| UI/App display | Task thuộc data crawler pipeline |
| Accuracy của detect country | Chỉ verify input/handoff format, accuracy là service khác |
| Token/proxy auto renew | Không phải scope của task 829, chỉ smoke token/proxy health |
| Full regression toàn bộ X platform | Chỉ regression các flow liên quan resolver Post By Reply |
| Chat/reply content trong Space | Nếu X API không trả transcript/chat thì không verify nội dung này |
| Nội dung article bị giới hạn bởi X API | QA verify theo raw response crawler nhận được, không đòi hỏi crawl vượt khả năng API |

---

## 3. CHIẾN LƯỢC KIỂM THỬ

### 3.1 Test Approach

| Nhóm test | Kỹ thuật | Mô tả |
|---|---|---|
| Article/Space/Broadcast classification | Equivalence Partitioning | Tách direct Article, direct Space, direct Broadcast, normal post share Article, normal quote/repost |
| Mapping rules | Decision Table Testing | Cross-check `mention_type`, `mention_type_details`, `link_shared`, `search_text`, `attachment` theo content type |
| Content completeness | Boundary Value Analysis | Short content, long article > 10k chars, unicode/newline, content rỗng/null |
| Error handling | Error Guessing | Missing article body, missing card binding, missing legacy, deleted/unavailable special content |
| Queue contract | Contract Testing | Verify payload qua RabbitMQ đúng schema, không thiếu required fields |
| Persistence | Integration Testing | Verify Solr/Mongo/Redis after pusher |
| Regression | Targeted Regression | Chạy lại case normal post/photo/video/quote và bug 516/741 |
| NFR | Stability/Idempotency | Retry, duplicate source, timeout, no log spam |

### 3.2 Decision Table: Special Content Mapping

| Scenario | X response signal | Expected mention_type | Expected details | Expected link metadata | Expected content |
|---|---|---:|---:|---|---|
| Direct Article | Article/card/article URL is primary shared object | 3 *(Need Confirm)* | 3 *(Need Confirm)* | `link_shared` or `ynm_link` theo BA final | Full article title + body |
| Normal post share Article, `is_quoted_status=false` | Post A trong quotes của Article B nhưng X flag false | 1 theo comment BA | 1 | Có `link_shared` để thống kê share Article B | Text của post A + article content/metadata theo rule final |
| Audio Space | Link `x.com/i/spaces/<id>` hoặc space object | 3 *(Need Confirm)* | 3 *(Need Confirm)* | Link space | Space title/description/state |
| Broadcast/Livestream | Broadcast/livestream object/link | 3 *(Need Confirm)* | 3 *(Need Confirm)* | Link broadcast | Broadcast title/description/video metadata |
| Normal quote/repost | `quoted_status_result`/`retweeted_status_result` | 3 | 3 | Link shared post | Content quote/repost normal |
| External URL share | Non-X external URL | 1 | Theo domain mapping | External URL | Text + URL metadata |

### 3.3 Requirement -> Test Scenario Estimate

| Requirement/Issue | Estimated Test Cases | Priority |
|---|---:|---|
| Article full content and search_text structure | 10-14 | High |
| Article link_shared / ynm_link / mention_type rules | 8-10 | High |
| Space content and not-skip behavior | 6-8 | High |
| Broadcast content and not-skip behavior | 6-8 | High |
| Queue contract and required fields | 6-8 | High |
| Persistence to Solr/Mongo/Redis | 5-7 | Medium |
| Detect country handoff regression | 3-4 | Medium |
| Source updater and retry/idempotency | 4-5 | Medium |
| Regression normal X post by reply | 6-8 | Medium |
| Security/stability/no log spam | 4-6 | Medium |
| **Tổng ước tính** | **58-78 cases** | |

---

## 4. MÔI TRƯỜNG KIỂM THỬ

### 4.1 Environments

| Môi trường | Mục đích | Giai đoạn |
|---|---|---|
| Local/K8s Testing | Smoke, mock raw response, debug mapping Article/Space/Broadcast | Phân tích + local |
| Testing | Execute functional/integration main suite | Test chính |
| Staging | Regression/sign-off trước release | Sau khi pass Testing |
| Production | Monitor sau release, không inject test data trực tiếp | Post-release |

### 4.2 Services cần chạy/quan sát

| Service | Scope | Ghi chú |
|---|---|---|
| `@ynm/cl-x-post-from-reply-crawler-service` | Builder/Crawler/Resolver special content | Service chính |
| Token Manager Service | Cấp token X | Dùng crawler type `X_POST_FROM_REPLY_BY_COOKIE_CRAWLER` |
| Proxy Manager Service | Cấp proxy X | Chỉ smoke, không test auto-renew |
| `@ynm/cl-data-pusher-service` | Push mention/post/reply vào Solr/Mongo | Cần bật pusher liên quan |
| `@ynm/cl-source-updater-service` | Update source state | Verify không stuck special content |
| Identity Country Service | Downstream detect country | Chỉ verify input message |

### 4.3 Queues/Exchange cần monitor

| Nhóm | Queue/Pattern |
|---|---|
| Crawling source | `<env>.cl.x.posts_from_reply_by_cookie_crawling_sources` |
| Crawling request | `<env>.cl.x.posts_from_reply_by_cookie_crawling_requests` |
| Crawled source | `<env>.cl.x.posts_from_reply_by_cookie_crawled_sources` |
| Next page | routing `cl.11.*.*.posts_from_reply_by_cookie.next_page` |
| Mentions | `<env>.cl.mentions_2_solr_mentions` |
| Posts | `<env>.cl.posts_2_mongo_x_posts` |
| Replies | `<env>.cl.replies_2_mongo_x_replies` |
| Identities | `<env>.cl.identities_2_solr_identities`, `<env>.cl.identities_2_redis_identities` |
| Detect country | `<env>.cl.x.identity_countries*` |
| Invalid data | `<env>.cl.x.invalid_data_crawling_sources` *(Need Confirm nếu task 829 có route invalid riêng cho special content)* |

### 4.4 Test Data cần chuẩn bị

| Nhóm data | Mục đích | Sample/Hint |
|---|---|---|
| Direct Article | Verify full article body/search_text/link metadata | Article link `http://x.com/i/article/2030871214206689280`; post `2030872456807023091` |
| Post share Article | Verify case `is_quoted_status=false` nhưng vẫn cần link_shared | Source/post trong YNMSHGYSG-741 |
| Audio Space | Verify Space not skipped, content mapping | Các source dạng `x.com/i/spaces/...` |
| Broadcast/Livestream | Verify broadcast not skipped | Comment có sample `2039252621245268352` |
| Normal text/photo/video | Regression normal post by reply | Lấy source thực từ Testing/Staging |
| Quote/repost normal | Regression mention_type=3 non-special | Source có `quoted_status_result` |
| Deleted/unavailable special content | Error handling | Mock raw response tombstone/unavailable |
| Long Article | Boundary content length/encoding | Article > 10k chars, nhiều newline/unicode |
| Duplicate source | Idempotency | Publish cùng source 2 lần |

### 4.5 Cách tạo test data

| Nguồn | Mô tả | Dùng cho | Owner |
|---|---|---|---|
| Real source từ RabbitMQ | Get message thực, sanitize trước khi replay | Happy path/regression | QA |
| Mock crawled source | Publish raw response vào crawled queue để bypass API | Edge/invalid/special response | QA + Dev |
| Jira sample | Rebuild từ YNMSHGYSG-516/741 | Article regression | QA |
| Dev sample | Sample raw response final từ MR/deployment | Confirm mapping final | Dev |
| Replay same source | Publish lại cùng source | Idempotency/source updater | QA |

---

## 5. ENTRY & EXIT CRITERIA

### 5.1 Entry Criteria

| # | Tiêu chí | Bắt buộc |
|---|---|---|
| 1 | Code/MR final của `YNMSHGYSG-829` đã deploy lên Testing | Bắt buộc |
| 2 | Dev confirm deployment/MR final đúng với task 829 | Bắt buộc |
| 3 | Wiki/script run service của Post By Reply đã cập nhật | Bắt buộc |
| 4 | Queue crawling source/request/crawled/next_page được bind đúng | Bắt buộc |
| 5 | Có token/proxy usable cho `X_POST_FROM_REPLY_BY_COOKIE_CRAWLER` | Bắt buộc |
| 6 | Có sample Article, Space, Broadcast hợp lệ trên Testing/Staging hoặc mock raw response | Bắt buộc |
| 7 | BA/Dev confirm rule `mention_type/link_shared/search_text` trong Phụ lục A | Bắt buộc |
| 8 | QA có quyền RabbitMQ, log service, Solr/Mongo/Redis query | Bắt buộc |
| 9 | Data pusher/source updater/detect country service chạy đủ để test integration | Bắt buộc |
| 10 | Testcase sheet của YNMSHGYSG-1396 có quyền access cho QA team | Khuyến khích |

### 5.2 Exit Criteria

| # | Tiêu chí | Bắt buộc |
|---|---|---|
| 1 | 100% High priority test cases pass trên Testing | Bắt buộc |
| 2 | Article full content không bị thiếu/truncated sai, pass cả direct/share case | Bắt buộc |
| 3 | Space và Broadcast hợp lệ không bị skip not found/invalid | Bắt buộc |
| 4 | Mapping `mention_type`, `mention_type_details`, `link_shared`, `search_text`, `attachment` đúng rule final | Bắt buộc |
| 5 | Valid mentions được push/persist đúng Solr/Mongo; invalid/malformed không tạo data rác | Bắt buộc |
| 6 | Không có uncaught exception/log spam trong 30 phút execute regression | Bắt buộc |
| 7 | Regression normal post by reply pass, không gây bug mới cho text/photo/video/quote/repost | Bắt buộc |
| 8 | Source updater không stuck source special content | Bắt buộc |
| 9 | Staging smoke pass trước release | Bắt buộc |
| 10 | Không còn blocker/critical bug open liên quan Article/Space/Broadcast | Bắt buộc |

### 5.3 Suspension/Resume Criteria

| Trạng thái | Điều kiện |
|---|---|
| Suspend | X API bị block/timeout hàng loạt; token/proxy unusable; queue binding sai; BA rule mapping chưa confirm; service crash liên tục |
| Resume | Dev fix/deploy lại; token/proxy restored; BA/Dev confirm rule; queue/drain/log ổn định |

---

## 6. TEST MODULES & COVERAGE DETAIL

### 6.1 Article Content

| ID | Scenario | Priority | Notes |
|---|---|---|---|
| ART-01 | Direct Article có title + body đầy đủ | High | Verify full body, newline, unicode |
| ART-02 | Article body dài > 10k chars | High | Boundary/truncation policy |
| ART-03 | Article chỉ có title/preview, body missing | Medium | Fallback không crash |
| ART-04 | Article link metadata `ynm_link` đúng | High | Verify JSON escape và link |
| ART-05 | Article `link_shared` rule final | High | Depends NC-1 |
| ART-06 | Article parent_posts title/caption/created_date | Medium | Verify relation |
| ART-07 | Post share Article with `is_quoted_status=false` | High | Regression YNMSHGYSG-741 |
| ART-08 | Article deleted/unavailable | Medium | No crash/source status |

### 6.2 Space Content

| ID | Scenario | Priority | Notes |
|---|---|---|---|
| SPC-01 | Live Space | High | Not skipped, content not empty |
| SPC-02 | Ended Space | High | Still capture title/metadata |
| SPC-03 | Scheduled/Upcoming Space | Medium | Scheduled time/state |
| SPC-04 | Space missing description | Medium | Fallback title/link |
| SPC-05 | Space unavailable/deleted | Medium | Error handling |
| SPC-06 | Space mention_type/link_shared rule | High | Depends NC-1 |

### 6.3 Broadcast Content

| ID | Scenario | Priority | Notes |
|---|---|---|---|
| BRC-01 | Live Broadcast | High | Not skipped |
| BRC-02 | Ended/replay Broadcast | High | Content/link/video metadata |
| BRC-03 | Broadcast sample `2039252621245268352` | High | Regression comment Jira |
| BRC-04 | Broadcast missing metadata | Medium | Fallback link/title |
| BRC-05 | Broadcast unavailable/deleted | Medium | Error handling |
| BRC-06 | Broadcast mention_type/link_shared rule | High | Depends NC-1 |

### 6.4 Queue/DB/Regression

| ID | Scenario | Priority |
|---|---|---|
| QDB-01 | Mention output required fields đầy đủ | High |
| QDB-02 | Solr mention query đúng field | High |
| QDB-03 | Mongo post/reply upsert đúng relation | Medium |
| QDB-04 | Detect country payload có posts/mentions | Medium |
| QDB-05 | Source updater status finished/failed có kiểm soát | Medium |
| REG-01 | Normal text post không regression | Medium |
| REG-02 | Photo/video/animated_gif không regression | Medium |
| REG-03 | Quote/repost normal không regression | Medium |
| REG-04 | Timeout/rate limit không tạo data rác | Medium |
| NFR-01 | Re-run same source no duplicate | Medium |
| NFR-02 | 20 malformed special responses no crash/log spam | Medium |
| SEC-01 | Output/log không lộ token/cookie/proxy | High |

---

## 7. RISK & MITIGATION

| Risk | Impact | Mitigation |
|---|---|---|
| BA rule về `link_shared` đang có comment lịch sử mâu thuẫn | Fail case sai kỳ vọng | Confirm NC-1 trước execution, tách scenario direct/share |
| X API response shape cho Article/Space/Broadcast thay đổi | Parser crash/missing content | Lấy raw response mới từ Testing/Staging, thêm mock malformed |
| Article content quá dài vượt limit Solr/queue | Truncate/mất data | Confirm max length, test boundary và verify truncation có kiểm soát |
| Special content bị X giới hạn quyền truy cập | False fail do API không trả content | Dùng sample public + mock raw response |
| Token/proxy block làm chậm test | Delay schedule | Chuẩn bị token/proxy trước, có mock crawled source fallback |
| Data pusher/source updater không chạy cùng env | Không verify DB/status được | Entry criteria bắt buộc service integration chạy |
| Testcase sheet 1396 chưa access được | Khó đối chiếu case hiện có | Request permission hoặc export snapshot trước review |

---

## 8. TIMELINE & RESPONSIBILITY

### 8.1 Timeline tham chiếu

| Milestone | Date | Owner | Notes |
|---|---|---|---|
| Wiki/Testcases | 26/06/2026 | QA | Theo subtask YNMSHGYSG-1396 |
| Done local | 01/07/2026 | QA + Dev | Smoke + mock edge |
| Done testing | 03/07/2026 | QA | Full functional/integration |
| Done staging | 06/07/2026 | QA + Dev + BA | Regression/sign-off |

### 8.2 Roles

| Role | Responsibility |
|---|---|
| QA Owner | Lập test plan/testcase, execute, report bug, sign-off recommendation |
| Dev Owner | Confirm MR/deployment, cung cấp raw response/sample, fix defect |
| BA/PO | Confirm rule mapping `mention_type/link_shared/search_text` |
| DevOps/Infra | Hỗ trợ env, queue, token/proxy/log access nếu cần |

---

## 9. PHỤ LỤC A - NEED CONFIRM

| ID | Nội dung cần confirm | Owner | Impact nếu chưa confirm |
|---|---|---|---|
| NC-1 | Rule final cho `link_shared` của direct Article/Space/Broadcast và normal post share Article | BA/Dev | High - ảnh hưởng expected mapping |
| NC-2 | Vị trí/format chính xác của `search_text` cho Article: title, full content, `ynm_link` nằm ở index nào | BA/Dev | High - ảnh hưởng testcase Article |
| NC-3 | `mention_type=3`, `mention_type_details=3` có áp dụng cho cả Article, Space, Broadcast trong mọi flow hay chỉ direct special post | BA/Dev | High |
| NC-4 | Max length/truncation policy cho Article/Space/Broadcast content trước khi push Solr | Dev/BA | Medium |
| NC-5 | `parent_posts` có bắt buộc cho Article hay chỉ attachment parent_info/search_text là đủ | Dev/BA | Medium |
| NC-6 | Special content unavailable/deleted sẽ đi invalid queue, source failed, hay skip có log | Dev | Medium |
| NC-7 | Queue/routing invalid final nếu special content thiếu required fields | Dev | Medium |
| NC-8 | Testcase sheet YNMSHGYSG-1396 permission cho QA/reviewer | QA Lead | Low |

---

## 10. PHỤ LỤC B - SAMPLE DATA IDS

| Data | Value | Source |
|---|---|---|
| Article post id_social | `2030872456807023091` | YNMSHGYSG-516/741 |
| Article link | `http://x.com/i/article/2030871214206689280` | YNMSHGYSG-516/741 |
| Article source id | `x_834671629426794496` | YNMSHGYSG-516/741 |
| Source message id_social | `2036958960201482626` | YNMSHGYSG-741 |
| Broadcast/livestream sample | `2039252621245268352` | YNMSHGYSG-741 comment |
| Crawler type | `X_POST_FROM_REPLY_BY_COOKIE_CRAWLER` | YNMSHGYSG-269/829 |

> Lưu ý: Không copy token/cookie/proxy/password từ Jira/log vào test plan hoặc testcase. Khi cần chạy local, dùng secret manager/env của team theo đúng quyền truy cập.

---

## 11. SIGN-OFF

| Vai trò | Tên | Trạng thái | Ngày |
|---|---|---|---|
| QA Owner | LamTT | Pending | |
| Dev Owner | Huy Nguyen Vo Quoc | Pending | |
| BA/PO | Pending | Pending | |
| QA Lead | Pending | Pending | |

