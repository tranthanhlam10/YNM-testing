# Re-audit YNMSHGYSG-1169 với X API response trực tiếp

Ngày audit: 30/06/2026

## 1. Input bổ sung

File API trực tiếp từ X:

```text
Data_get_from_rabbitMQ_by_scripts/x_api_response.json
```

Mục tiêu round này:

- Dùng response trực tiếp từ X làm nguồn ground truth.
- So lại với raw crawled source từ RabbitMQ.
- So tiếp với các output resolver: mention, post, reply, identity.
- Xác nhận các lỗi đã flag ở report trước là lỗi resolver/output hay do API/raw thiếu dữ liệu.

Report trước:

```text
Ai_Agents/phan_tich_issue_by_agents/reaudit_resolved_data_YNMSHGYSG-1169_2026-06-30.md
```

## 2. Kết luận nhanh

Kết luận sau khi check với `x_api_response.json`: **các issue chính ở report trước vẫn đúng, và có thêm bằng chứng mạnh hơn là API direct đã có đủ dữ liệu để resolver map đúng**.

| Nhóm | Kết luận |
|---|---|
| API direct vs raw RabbitMQ | Cùng 2 tweet id và các core field dùng mapping đều khớp |
| Community fallback | API direct có community id `1852470645847957569`, nhưng không có community name; đúng case phải fallback `user_1852470645847957569` |
| Mention mapping | Mention output map đúng author, source community, type, engagement, attachment |
| Identity output | Vẫn thiếu community identity và reply author identity |
| Reply output | Vẫn thiếu parent relation rõ ràng và `caption` vẫn không phải nội dung reply |

Vì vậy, lỗi không nằm ở việc gọi API X thiếu field. Lỗi/rủi ro nằm ở bước resolver hoặc bước publish output sau resolver.

## 3. API response baseline

`x_api_response.json` parse được 2 Tweet objects:

| Loại | Tweet id | Author | Community | Parent |
|---|---|---|---|---|
| Root post | `2071322178189197339` | `x_1483643346166087681` / `𝗨𝗦𝗠𝗔𝗡 𝗠𝗨𝗚𝗛𝗔𝗟` | `x_1852470645847957569` | Không có |
| Reply | `2071323117021245696` | `x_1901220599143223296` / `Neha Saleem` | `x_1852470645847957569` | `2071322178189197339` |

Các field quan trọng trong API direct:

| Field | Root post | Reply |
|---|---|---|
| `conversation_id_str` | `2071322178189197339` | `2071322178189197339` |
| `in_reply_to_status_id_str` | Không có | `2071322178189197339` |
| `in_reply_to_user_id_str` | Không có | `1483643346166087681` |
| `in_reply_to_screen_name` | Không có | `MughalZaada001` |
| `community_results.result.id_str` | `1852470645847957569` | `1852470645847957569` |
| Community name | Không có | Không có |

Điểm quan trọng:

- API direct xác nhận đây là community post/reply.
- API direct chỉ có community social id, không có name.
- Đây đúng business case của `YNMSHGYSG-1169`: build fallback `user_<social_id>` và bỏ `is_admin_creator`.

## 4. Các mapping đang đúng khi đối chiếu API direct

### 4.1. Root post mention

Expected từ API:

- Author: `x_1483643346166087681`
- Author name: `𝗨𝗦𝗠𝗔𝗡 𝗠𝗨𝗚𝗛𝗔𝗟`
- Source/community: `x_1852470645847957569`
- Likes/comments/shares/views: `8/2/5/307`
- Media: video

Actual mention:

- `identity = x_1483643346166087681`: đúng.
- `identity_name = 𝗨𝗦𝗠𝗔𝗡 𝗠𝗨𝗚𝗛𝗔𝗟`: đúng.
- `id_source = x_1852470645847957569`: đúng.
- `mention_type = 1`: đúng với root post.
- Engagement đúng: `likes = 8`, `comments = 2`, `shares = 5`, `views = 307`.
- Attachment video lấy đúng `href` và `media_src`.
- Không có field `is_admin_creator`: đúng task.

### 4.2. Reply mention

Expected từ API:

- Reply id: `2071323117021245696`
- Author: `x_1901220599143223296`
- Author name: `Neha Saleem`
- Parent/root post: `2071322178189197339`
- Source/community: `x_1852470645847957569`
- Text reply sau normalize: `Ronaldo k fans ka dill garden garden ho gyaa😃`

Actual mention:

- `identity = x_1901220599143223296`: đúng.
- `identity_name = Neha Saleem`: đúng.
- `id_source = x_1852470645847957569`: đúng.
- `mention_type = 2`: đúng với reply.
- `id_reference = 092105df-b053-598e-88d4-31c0624427fe`: trỏ đúng UUID root post mention.
- `search_text` có nội dung reply sau normalize: chấp nhận được.
- Attachment `type = status` và có `parent_info`: đúng hướng.
- Không có field `is_admin_creator`: đúng task.

## 5. Các lỗi/rủi ro vẫn giữ nguyên

### 5.1. Thiếu identity community fallback

API direct có:

```json
{
  "community_id": "1852470645847957569",
  "community_name": null
}
```

Expected identity theo task:

```json
{
  "id": "x_1852470645847957569",
  "id_social": "1852470645847957569",
  "name": "user_1852470645847957569",
  "fullname": "user_1852470645847957569",
  "platform": 11,
  "domain": "x.com"
}
```

Actual identity Redis output:

- Không có `x_1852470645847957569`.

Kết luận:

- Fail requirement chính của `YNMSHGYSG-1169`.
- Fail testcase `TC_DB_003`.

### 5.2. Thiếu identity của reply author

API direct có reply author:

```json
{
  "id": "x_1901220599143223296",
  "name": "Neha Saleem"
}
```

Mention reply cũng đã dùng đúng identity này:

```json
{
  "identity": "x_1901220599143223296",
  "identity_name": "Neha Saleem"
}
```

Actual identity Redis output:

- Không có `x_1901220599143223296`.

Kết luận:

- Resolver/publisher đang emit thiếu identity so với các identity được mentions reference.
- Cần confirm có file `cl.identities_2_solr_identities` riêng không; với Redis output hiện tại thì coverage chưa đạt.

### 5.3. Reply Mongo thiếu parent relation

API direct có đủ parent relation:

```json
{
  "reply_id": "2071323117021245696",
  "conversation_id_str": "2071322178189197339",
  "in_reply_to_status_id_str": "2071322178189197339",
  "in_reply_to_user_id_str": "1483643346166087681"
}
```

Actual `replies_2_mongo_x_replies`:

```json
{
  "id_social": "2071323117021245696",
  "level": 1,
  "post_created_date": "2026-06-28T19:57:45.000Z"
}
```

Không thấy field join parent rõ ràng như:

- `id_reference`
- `id_parent_comment`
- `id_post`
- `conversation_id_str`
- `in_reply_to_status_id_str`

Kết luận:

- API direct có đủ dữ liệu parent, nhưng reply output không giữ lại.
- Fail/risk cao với testcase `TC_RESOLVER_003` và `TC_DB_002`.

### 5.4. Reply Mongo `caption` không phải nội dung reply

API direct reply text:

```text
@MughalZaada001 Ronaldo k fans ka dill garden garden ho gyaa😃
```

Actual reply Mongo caption:

```text
The jersey gives him +100 accuracy and confidence. That top-corner finish and the perfect "Siu" celebration were absolutely spot on! 🙌
#FIFAWorldCup2026
```

Đây là caption parent post, không phải reply content.

Kết luận:

- Nếu `x_replies.caption` expected là nội dung reply thì đây là lỗi chắc chắn.
- Nếu schema `x_replies.caption` cố tình lưu parent post caption, cần Dev/BA confirm field nào lưu reply content, vì output hiện tại không thấy field chứa nội dung reply.

## 6. Kết luận theo requirement YNMSHGYSG-1169

| Requirement | Kết quả với API direct |
|---|---|
| Bỏ `is_admin_creator` khỏi mention | Pass |
| Community chỉ có social id thì fallback `user_<social_id>` | Fail ở identity output |
| Mention đủ field bắt buộc | Pass với sample valid |
| Invalid mention route sang invalid queue | Chưa có file invalid queue để verify |
| Detect country payload có `mentions` và theo author | Chưa có file identity country queue để verify |
| Reply relation đúng parent/root | Mention pass, reply Mongo output fail/risk cao |
| Identity coverage cho identities được mention reference | Fail với Redis output hiện tại |

## 7. Đề xuất bước tiếp theo

1. Fix resolver/publisher để emit community identity:
   - `id = x_1852470645847957569`
   - `name/fullname = user_1852470645847957569`
2. Emit identity cho reply author `x_1901220599143223296`, hoặc confirm nếu Redis identity queue chỉ nhận root author.
3. Bổ sung parent relation rõ ràng cho `replies_2_mongo_x_replies`.
4. Sửa `caption` reply Mongo để lưu reply content, hoặc confirm field khác đang dùng để lưu content.
5. Capture thêm output:
   - `cl.identities_2_solr_identities`
   - `cl.x.identity_countries...`
   - `cl.x.invalid_data_crawling_sources`
6. Sau khi fix, rerun cùng `x_api_response.json` hoặc cùng source id để verify lại end-to-end.
