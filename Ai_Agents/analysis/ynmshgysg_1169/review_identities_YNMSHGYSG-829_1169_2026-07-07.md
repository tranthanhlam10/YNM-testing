# Review Identities - YNMSHGYSG-829 & YNMSHGYSG-1169

Ngày audit: 07/07/2026

File kiểm tra: `Data_get_from_rabbitMQ_by_scripts/messages_testing_cl_identities_2_redis_identities_LamTT_2026-07-07T03-30-52-406Z.json`

Phạm vi: chỉ audit output identity Redis queue. Không kết luận cho mention/post/reply/search_text/invalid queue nếu không có file tương ứng.

## 1. Tổng quan dữ liệu

| Chỉ số | Kết quả |
|---|---:|
| Wrapper messages | 186 |
| Total identities sau khi flatten | 250 |
| Unique `id` | 238 |
| `createdBy` | 250 records đều là `XPostFromReplyCrawlingLoader` |
| `platform=11` | 250/250 |
| `domain=x.com` | 250/250 |

Phân bố identity type:

| `fb_user_type` | Ý nghĩa audit | Count | Unique |
|---|---|---:|---:|
| `1` | User identity | 239 | 227 |
| `3` | Community identity fallback | 11 | 11 |

## 2. Kết luận nhanh

| Requirement | Kết luận |
|---|---|
| YNMSHGYSG-1169 - identity id format | Pass: 250/250 records có `id=x_<id_social>`. |
| YNMSHGYSG-1169 - platform/domain/link | Pass: user link đúng `x.com/i/user/<id_social>`, community link đúng `x.com/i/communities/<id_social>`. |
| YNMSHGYSG-1169 - fallback community name | Pass: 11/11 community identities có `fullname=user_<id_social>`. |
| YNMSHGYSG-1169 - required fields identity | Pass: không thiếu `id`, `id_social`, `link`, `platform`, `domain`, `fullname`, `createdBy`. |
| YNMSHGYSG-1169 - invalid queue | Không audit được bằng identity file này. |
| YNMSHGYSG-1169 - detect country handoff | Không audit được bằng identity Redis file này; cần file `cl.x.identity_countries...`. |
| YNMSHGYSG-829 - identity output không regression | Pass cơ bản: identity output vẫn sinh đúng contract. |
| YNMSHGYSG-829 - Article/Space/Broadcast content | Không audit được bằng identity file; nội dung special nằm ở mentions/posts/search_text. |

## 3. Identity Mapping Checks

### 3.1 Required fields

Không có record thiếu các field chính:

- `id`
- `id_social`
- `link`
- `platform`
- `domain`
- `fullname`
- `createdBy`

Không có record `fullname` rỗng.

### 3.2 User identity

239 records user identity có:

- `fb_user_type=1`
- `id=x_<id_social>`
- `link=x.com/i/user/<id_social>`
- `platform=11`
- `domain=x.com`
- `avatar` không rỗng cho user records trong file này
- `friend_count` và `subscriber_count` không âm

Kết luận: user identity mapping đúng.

### 3.3 Community fallback identity

Tìm thấy 11 community identities:

| `id_social` | `id` | `fullname` | `link` |
|---|---|---|---|
| `1761503482136141942` | `x_1761503482136141942` | `user_1761503482136141942` | `x.com/i/communities/1761503482136141942` |
| `1989145163180937726` | `x_1989145163180937726` | `user_1989145163180937726` | `x.com/i/communities/1989145163180937726` |
| `1534680073487454212` | `x_1534680073487454212` | `user_1534680073487454212` | `x.com/i/communities/1534680073487454212` |
| `2001850647625212046` | `x_2001850647625212046` | `user_2001850647625212046` | `x.com/i/communities/2001850647625212046` |
| `2033618289671233830` | `x_2033618289671233830` | `user_2033618289671233830` | `x.com/i/communities/2033618289671233830` |
| `1952190556135956820` | `x_1952190556135956820` | `user_1952190556135956820` | `x.com/i/communities/1952190556135956820` |
| `1902750240496644203` | `x_1902750240496644203` | `user_1902750240496644203` | `x.com/i/communities/1902750240496644203` |
| `1955375702317904365` | `x_1955375702317904365` | `user_1955375702317904365` | `x.com/i/communities/1955375702317904365` |
| `1753598077724975370` | `x_1753598077724975370` | `user_1753598077724975370` | `x.com/i/communities/1753598077724975370` |
| `1940227698451739052` | `x_1940227698451739052` | `user_1940227698451739052` | `x.com/i/communities/1940227698451739052` |
| `1931559633061290137` | `x_1931559633061290137` | `user_1931559633061290137` | `x.com/i/communities/1931559633061290137` |

Các community records đều có:

- `fb_user_type=3`
- `friend_count=0`
- `subscriber_count=0`
- `avatar=null`
- `identity_join_date=null`

Kết luận: đúng với requirement 1169 khi API chỉ trả social id community, identity name/fullname fallback thành `user_<social_id>`.

## 4. Duplicate / Idempotency

File có 250 records nhưng chỉ 238 unique `id`.

Tìm thấy 11 identity ids bị lặp trong queue dump:

- 10 identities lặp 2 lần.
- 1 identity lặp 3 lần: `x_2003220464139931648`.

Các duplicate này có cùng `id_social`, `fullname`, `fb_user_type`, `link`; chỉ khác `created_date` trong thời điểm dump.

Kết luận: không xem là bug mapping trong file RabbitMQ dump. Khi sign-off storage final, nên query Redis/Solr để xác nhận upsert theo `id`, không tạo bản ghi rác.

## 5. Special Content Scope - YNMSHGYSG-829

File identity này không chứa field để verify:

- Article body/title/search_text
- Space link/content
- Broadcast link/content
- `mention_type`, `mention_type_details`, `link_shared`, `attachment`

Có thể dùng file này để confirm identity queue không bị regression sau khi crawl special content, nhưng không đủ để kết luận task 829 pass/fail về nội dung.

Trong các identity special sample đã audit trước đó, file này chỉ thấy `x_1564691327794790402` (`ReUPs™`) là Audio Space author. Các author sample Article/Broadcast trước đó không xuất hiện trong file này, nên chưa đủ coverage identity cho đủ 3 dạng special content.

## 6. Need Confirm / Không thuộc scope file này

| ID | Nội dung | Lý do |
|---|---|---|
| NC-1 | Redis identity chỉ có `fullname`, không có field `name` | Test plan nói `name/fullname`; nếu downstream yêu cầu cả 2 field thì cần confirm. Theo output hiện tại, Redis identity contract đang dùng `fullname`. |
| NC-2 | Detect country handoff đúng author | Cần queue `cl.x.identity_countries...`, không thể chứng minh bằng identity Redis output. |
| NC-3 | Invalid mention route sang invalid queue | Cần invalid queue output/log. |
| NC-4 | Storage idempotency final | Cần query Redis/Solr final, vì file RabbitMQ dump có duplicate do rerun/batch. |

## 7. Kết luận cuối

Với file identity ngày 07/07/2026:

- YNMSHGYSG-1169: pass phần identity mapping và community fallback `user_<social_id>`.
- YNMSHGYSG-829: pass ở mức không thấy identity output regression, nhưng không đủ để sign-off nội dung Article/Space/Broadcast.
- Không thấy lỗi mapping nghiêm trọng trong identity file. Điểm cần follow-up duy nhất là duplicate queue dump và confirm contract `fullname` vs `name` nếu downstream có yêu cầu.
