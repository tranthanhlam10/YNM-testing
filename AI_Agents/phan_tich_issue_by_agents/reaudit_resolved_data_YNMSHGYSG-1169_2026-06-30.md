# Re-audit resolved data - YNMSHGYSG-1169

Ngày audit: 30/06/2026

## 1. Phạm vi

Audit bộ dữ liệu raw và các output sau resolve của luồng **X - Crawl Post From Reply** theo Jira `YNMSHGYSG-1169`, test plan, testcases và wiki mapping X platform.

### Dữ liệu đầu vào

| Nhóm | File | Count parse được |
|---|---|---:|
| Raw crawled source | `Data_get_from_rabbitMQ_by_scripts/messages_testing_cl_x_posts_from_reply_by_cookie_crawled_sources_2026-06-30T03-47-37-655Z.json` | 1 message, 2 tweet objects |
| Mentions | `Data_get_from_rabbitMQ_by_scripts/messages_testing_cl_mentions_2_solr_mentions_LamTT_2_2026-06-30T03-37-52-365Z.json` | 2 mentions |
| Posts | `Data_get_from_rabbitMQ_by_scripts/messages_testing_cl_posts_2_mongo_x_posts_LamTT_2026-06-30T03-42-47-625Z.json` | 1 post |
| Replies | `Data_get_from_rabbitMQ_by_scripts/messages_testing_cl_replies_2_mongo_x_replies_LamTT_2026-06-30T03-44-15-071Z.json` | 1 reply/comment |
| Identities Redis | `Data_get_from_rabbitMQ_by_scripts/messages_testing_cl_identities_2_redis_identities_LamTT_2026-06-30T04-40-34-757Z.json` | 1 identity |

### Nguồn requirement đã đối chiếu

- Jira: `https://jira.younetco.com/browse/YNMSHGYSG-1169`
- Test plan: `Ai_Agents/TestPlan/Data local/TestPlan_YNMSHGYSG-1169_Improve_Crawling_Post_From_Reply_X.md`
- Testcases sheet: `https://docs.google.com/spreadsheets/d/1hJkgSEvk-CEvqVl3UZ2gnq1B3S6oQ8Ux2064Z0FKdVU/edit?gid=1704880699#gid=1704880699`
- Wiki: `https://wiki.younetco.com/pages/viewpage.action?pageId=273755552`
- Mapping report mẫu: `Ai_Agents/TestCases/Data local/data_mapping_reaudit_pantip_comment_2026-06-10.md`

## 2. Raw data baseline

Raw crawled source có 2 tweet:

| Loại | Tweet id | Author identity | Community identity | Parent |
|---|---|---|---|---|
| Root post | `2071322178189197339` | `x_1483643346166087681` | `x_1852470645847957569` | Không có |
| Reply | `2071323117021245696` | `x_1901220599143223296` | `x_1852470645847957569` | `2071322178189197339` |

Ghi nhận quan trọng:

- Raw có `community_results.result.id_str = 1852470645847957569`.
- Raw community **không có name** trong sample này.
- Đây đúng case cần fallback identity name/fullname dạng `user_1852470645847957569` theo task `YNMSHGYSG-1169`.

## 3. Kết luận

Resolved data hiện tại **chưa đạt full yêu cầu của YNMSHGYSG-1169**.

Phần mention happy path đang khá ổn, nhưng có 3 vấn đề chính:

| Mức độ | Nhóm | Kết luận |
|---|---|---|
| High | Community identity fallback | Thiếu identity của community `x_1852470645847957569`, nên chưa verify được fallback `user_<social_id>` và fail theo requirement chính của task |
| High | Identity coverage | Mention reply trỏ tới `identity = x_1901220599143223296` nhưng identity output Redis không có record này |
| High | Reply Mongo mapping | Reply output thiếu parent relation rõ ràng và `caption` đang là caption của parent post, không phải nội dung reply |

Các phần invalid queue và detect-country chưa thể kết luận pass/fail vì bộ file hiện tại chưa có output của:

- `<env>.cl.x.invalid_data_crawling_sources`
- `<env>.cl.x.identity_countries...`

## 4. Các điểm đã pass

| Hạng mục | Kết quả |
|---|---|
| JSON parse | Tất cả 5 file parse được, không lỗi JSON |
| Count cơ bản | 2 raw tweets -> 2 mentions; 1 root post -> 1 post output; 1 reply -> 1 reply output |
| Duplicate mention | Không có duplicate theo `id` hoặc `id_social` |
| `is_admin_creator` | Không tồn tại trong mention và identity output, đúng yêu cầu bỏ field này |
| Mention required fields | 2/2 mentions có đủ `id`, `id_social`, `id_source`, `link`, `platform`, `domain`, `identity`, `identity_name`, `mention_type`, `source_type`, `search_text`, `created_date` |
| Community source mapping | `id_source = x_1852470645847957569` khớp raw community id |
| Mention type | Root post có `mention_type = 1`; reply có `mention_type = 2`; phù hợp phân loại post/reply |
| Reply mention relation | Mention reply có `id_reference = 092105df-b053-598e-88d4-31c0624427fe`, trỏ về UUID của root post mention |
| Created date/shard | `created_date` khớp raw `legacy.created_at`; `shard = 20260628` đúng ngày |
| Engagement | Root post map `likes = 8`, `comments = 2`, `shares = 5`, `views = 307`; reply map các engagement bằng 0/16 views, đúng raw |
| Attachment root post | Video attachment có `type = video`, `href`, `media_src` |
| Attachment reply text-only | Reply mention có attachment `type = status` và `parent_info`, đúng format text-only/reply context |
| Security output | 4 file resolved không chứa các pattern secret: `auth_token`, `ct0`, `cookie`, `bearer_token`, `proxy_password`, `x-csrf-token` |

## 5. Lỗi chắc chắn / cần fix

### 5.1. Thiếu identity community fallback

Expected theo Jira/testcase:

```json
{
  "id": "x_1852470645847957569",
  "id_social": "1852470645847957569",
  "platform": 11,
  "domain": "x.com",
  "name": "user_1852470645847957569",
  "fullname": "user_1852470645847957569"
}
```

Actual trong file Redis identity:

```json
[
  {
    "id": "x_1483643346166087681",
    "id_social": "1483643346166087681",
    "fullname": "𝗨𝗦𝗠𝗔𝗡 𝗠𝗨𝗚𝗛𝗔𝗟"
  }
]
```

Không có identity `x_1852470645847957569`.

Impact:

- Fail requirement chính của `YNMSHGYSG-1169`: community chỉ có social id thì phải build name dạng `user_<social_id>`.
- Fail testcase `TC_DB_003 - Identity community tồn tại trong Solr và Redis`.
- Downstream có thể thiếu identity source/community khi query theo `id_source`.

### 5.2. Thiếu identity của reply author

Raw reply:

```json
{
  "tweet_id": "2071323117021245696",
  "author_identity": "x_1901220599143223296",
  "author_name": "Neha Saleem"
}
```

Mention reply actual:

```json
{
  "id_social": "2071323117021245696",
  "identity": "x_1901220599143223296",
  "identity_name": "Neha Saleem"
}
```

Identity output actual chỉ có:

```json
{
  "id": "x_1483643346166087681",
  "id_social": "1483643346166087681"
}
```

Impact:

- Mention đã reference `x_1901220599143223296` nhưng Redis identity output không emit identity tương ứng.
- Có rủi ro Solr/Redis identity không đủ coverage cho toàn bộ mentions.
- Cần verify thêm queue `cl.identities_2_solr_identities`, nhưng với file Redis hiện tại thì đang thiếu.

### 5.3. Reply Mongo output thiếu parent relation rõ ràng

Raw reply có:

```json
{
  "id_social": "2071323117021245696",
  "conversation_id_str": "2071322178189197339",
  "in_reply_to_status_id_str": "2071322178189197339"
}
```

Mention reply có:

```json
{
  "id_social": "2071323117021245696",
  "id_reference": "092105df-b053-598e-88d4-31c0624427fe"
}
```

Reply Mongo output actual:

```json
{
  "id": "81e3064b-f8f6-5539-ad96-ea41c054e903",
  "id_social": "2071323117021245696",
  "id_source": "x_1852470645847957569",
  "level": 1,
  "post_created_date": "2026-06-28T19:57:45.000Z"
}
```

Thiếu một trong các field có thể join parent:

- `id_reference`
- `id_post`
- `id_parent_post`
- `id_parent_comment`
- `in_reply_to_status_id_str`
- `conversation_id_str`

Impact:

- Fail hoặc rất rủi ro với testcase `TC_RESOLVER_003` và `TC_DB_002`, vì output reply không thể hiện rõ parent/root post id.
- Nếu Mongo `x_replies` dùng `post_created_date` + `title` để join thì cần Dev confirm, vì contract testcase đang kỳ vọng parent id.

### 5.4. Reply Mongo `caption` đang copy parent post, không phải nội dung reply

Raw reply text:

```text
@MughalZaada001 Ronaldo k fans ka dill garden garden ho gyaa😃
```

Mention reply search text đã normalize thành:

```json
[
  "",
  "Ronaldo k fans ka dill garden garden ho gyaa 😃"
]
```

Reply Mongo output actual:

```json
{
  "id_social": "2071323117021245696",
  "caption": "The jersey gives him +100 accuracy and confidence. That top-corner finish and the perfect \"Siu\" celebration were absolutely spot on! 🙌\n#FIFAWorldCup2026"
}
```

Đây là caption của parent post, không phải reply.

Impact:

- Nếu `x_replies.caption` là nội dung reply, đây là lỗi mất data content.
- Nếu `x_replies.caption` được thiết kế để lưu caption parent post, cần bổ sung field khác cho reply content hoặc confirm schema.
- Hiện tại trong reply output không thấy field nào lưu text reply.

## 6. Điểm cần confirm

| Nhóm | Câu hỏi cần confirm | Lý do |
|---|---|---|
| Identity Redis schema | Identity user thường có bắt buộc field `name` không, hay `fullname` là đủ? | Actual author identity chỉ có `fullname`, không có `name`. Riêng community fallback trong task/testcase đang nhắc rõ `name = user_<social_id>`. |
| Identity coverage | Resolver có chủ đích chỉ emit root post author identity vào Redis không? | Nếu có, cần update test plan/testcase. Nếu không, đang thiếu reply author identity và community identity. |
| Reply Mongo schema | `x_replies` có bắt buộc field parent id không? Field nào là canonical: `id_reference`, `id_parent_comment`, raw `in_reply_to_status_id_str`, hay field khác? | Actual reply output không có parent id rõ ràng. |
| Reply content | `replies_2_mongo_x_replies.caption` expected là reply text hay parent post caption? | Actual đang copy parent post caption và không có reply text ở field khác. |
| Post/Reply Mongo platform/domain | Mongo `x_posts`/`x_replies` có cần lưu `platform`, `domain`, `identity` như testcase DB không? | Actual queue posts/replies không có các field này, nhưng có thể pusher/collection chuyên biệt đã ngầm định X. |
| Detect country | Có file output queue identity country cho run này không? | Chưa thể verify `mentions` non-empty và detect theo author. |
| Invalid data | Có file output invalid queue cho invalid sample không? | Chưa thể verify route `<env>.cl.x.invalid_data_crawling_sources`. |

## 7. Coverage theo testcase chính

| Testcase/nhóm | Kết quả với bộ file này |
|---|---|
| `TC_RESOLVER_001` Mention mapping cơ bản | Pass với 2/2 mentions |
| `TC_RESOLVER_002` Post output | Pass phần id/link/caption/created_date/engagement cơ bản |
| `TC_RESOLVER_003` Reply giữ parent relation | Fail/Risk cao vì reply output thiếu parent id rõ ràng |
| `TC_RESOLVER_004` Text-only attachment status | Pass với reply mention attachment `type = status` |
| `TC_MAPPING_004` Engagement mapping | Pass trên sample này |
| `TC_DB_003` Identity community tồn tại trong Solr/Redis | Fail với Redis output được cung cấp |
| `TC_DB_005` Mention valid required fields và no `is_admin_creator` | Pass trên message queue, chưa verify Solr DB thật |
| `TC_DETECT_001/003/005` Detect country | Chưa đủ dữ liệu để kết luận |
| `TC_INVALID_*` Invalid queue | Chưa đủ dữ liệu để kết luận |
| `TC_SECURITY_001` Secret không nằm trong output queues | Pass với 4 output files được cung cấp; chưa verify log và invalid/detect queues |

## 8. Thứ tự xử lý đề xuất

1. Fix/verify resolver emit đủ identities:
   - Root post author: `x_1483643346166087681`
   - Reply author: `x_1901220599143223296`
   - Community: `x_1852470645847957569` với `name/fullname = user_1852470645847957569`
2. Fix reply output để lưu đúng reply content, không copy nhầm caption parent post.
3. Bổ sung parent relation rõ ràng trong `replies_2_mongo_x_replies`, tối thiểu một field join được về root post hoặc parent reply.
4. Capture thêm output của identity country queue để verify:
   - Payload có `mentions` non-empty
   - Detect target đúng author theo `YNMSHGYSG-661`
5. Chạy thêm invalid sample thiếu required fields để verify queue `<env>.cl.x.invalid_data_crawling_sources`.
6. Sau khi fix, query thật Mongo/Solr/Redis để confirm output queue đã được persist đúng.
