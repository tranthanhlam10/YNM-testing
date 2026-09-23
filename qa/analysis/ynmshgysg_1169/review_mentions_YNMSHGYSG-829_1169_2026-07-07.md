# Review Mentions - YNMSHGYSG-829 & YNMSHGYSG-1169

Ngày audit: 07/07/2026

File kiểm tra: `Data_get_from_rabbitMQ_by_scripts/messages_testing_cl_mentions_2_solr_mentions_LamTT_2_2026-07-07T04-39-09-920Z.json`

Phạm vi: audit 16 mentions trong file này, tập trung mapping của 2 tasks:

- YNMSHGYSG-1169 - Improve Crawling Post From Reply On Platform X
- YNMSHGYSG-829 - X special cases Article, Space, Broadcast

## 1. Tổng quan dữ liệu

| Chỉ số | Kết quả |
|---|---:|
| Wrapper messages | 16 |
| Total mentions | 16 |
| Unique `id` | 16 |
| Unique `id_social` | 16 |
| `createdBy` | 16/16 là `XPostFromReplyCrawlingLoader` |

Phân bố:

| Field | Count |
|---|---:|
| `mention_type=1` | 5 |
| `mention_type=2` | 8 |
| `mention_type=3` | 3 |
| `mention_type_details=1` | 5 |
| `mention_type_details=2` | 8 |
| `mention_type_details=3` | 3 |
| `attachment.type=status` | 7 |
| `attachment.type=photo` | 3 |
| `attachment.type=video` | 3 |
| `attachment.type=animated_gif` | 3 |

## 2. Kết luận nhanh

| Requirement | Kết luận |
|---|---|
| YNMSHGYSG-1169 - required fields mention | Pass: 16/16 không thiếu field chính. |
| YNMSHGYSG-1169 - bỏ `is_admin_creator` | Pass: 0 record có field `is_admin_creator`. |
| YNMSHGYSG-1169 - engagement mapping | Pass: `reaction=likes`, `shares=engage_repost+engage_quote`, `engagement_total=likes+comments+shares`, `engagement_s_c=comments+shares`. |
| YNMSHGYSG-1169 - reply relation | Pass: 8/8 reply mentions có `id_reference`, và `id_reference` trỏ đúng parent mention trong cùng file. |
| YNMSHGYSG-1169 - parent_posts | Pass: 8/8 reply wrappers có `parent_posts` đúng parent context. |
| YNMSHGYSG-829 - Article/Space/Broadcast | Chưa đủ coverage: file này không có Article, Audio Space, Broadcast/Livestream. |

## 3. Mapping Pass

### 3.1 Required fields

Không có mention thiếu các field chính:

- `id`
- `link`
- `platform`
- `domain`
- `id_social`
- `id_source`
- `identity`
- `identity_name`
- `mention_type`
- `mention_type_details`
- `source_type`
- `created_date`
- `updated_at`
- `search_text`

Attachment JSON parse được cho 16/16 records.

### 3.2 Reply relation

8 reply mentions đều có parent reference:

| Reply `id_social` | Parent `id_reference` | Kết luận |
|---|---|---|
| `2071323117021245696` | `092105df-b053-598e-88d4-31c0624427fe` | Pass |
| `2071473297624080461` | `2a7fa179-ec32-580c-8ab3-8cb13d7b7c99` | Pass |
| `2071470433652674753` | `c6d6d53c-1cf4-5cf5-ab0a-10587fd5c7d9` | Pass |
| `2071514933636788430` | `054a081b-8ec4-5a2c-abd1-42554ab4ee77` | Pass |
| `2071436206634889260` | `6472f52a-431a-57d5-b0b0-63219f1c2cbd` | Pass |
| `2071289942895124577` | `4a59265c-8d52-5a83-8089-4e1f70e2e87f` | Pass |
| `2071166698216993018` | `ae3a0cc5-4776-5c35-92e8-a718956eb457` | Pass |
| `2071092589583855994` | `c8bf7d5b-6b16-57cb-9b41-ff18f16d2cc6` | Pass |

`parent_posts` trong wrapper của các reply cũng khớp với parent mention về `title/caption/shared_content/created_date`.

### 3.3 Quote / repost mapping

3 quote/repost mentions đều pass core mapping:

| `id_social` | Attachment | `link_shared` | `search_text[2]` | Kết luận |
|---|---|---|---|---|
| `2071503785038356664` | `video` | `x.com/1972647177022312448/status/2070418955496239461` | Có `ynm_des`, `ynm_name` | Pass |
| `2071272826594861283` | `status` | `x.com/938912443702677505/status/2071056567382724675` | Có `ynm_des`, `ynm_name` | Pass |
| `2071091724823519515` | `animated_gif` | `x.com/1876125897268310016/status/2071078502632194140` | Có `ynm_des`, `ynm_name` | Pass |

## 4. Need Confirm / Potential Issues

### NC-1: GIF comment rỗng content

Affected:

| Field | Actual |
|---|---|
| `id_social` | `2071092589583855994` |
| `link` | `x.com/1876125897268310016/status/2071092589583855994` |
| `mention_type/details` | `2/2` |
| `attachment.type` | `animated_gif` |
| `search_text[0]` | `""` |
| `search_text[1]` | `""` |
| `search_text[2]` | `null` |

Nếu BA áp rule fallback "không có title/content/search_text[2] thì lấy `attachment.type`" cho mention comment/reply, output hiện chưa đạt. Nếu rule fallback chỉ áp cho title/post layer hoặc không bắt buộc với comment GIF rỗng, có thể accept.

### NC-2: External link trong comment chỉ có `ynm_link`, thiếu domain/card metadata

Affected:

| Field | Actual |
|---|---|
| `id_social` | `2071436206634889260` |
| `link_shared` | `https://pump.fun/coin/FezAb6oDwEZgjQpGnt4U82Df1T3c9NrRpTuyxKNTpump` |
| `link_shared_domain` | `null` |
| `search_text[2]` | `{"ynm_link":"https://pump.fun/coin/FezAb6oDwEZgjQpGnt4U82Df1T3c9NrRpTuyxKNTpump"}` |

Need Confirm: nếu raw API không có card metadata thì có thể accept tối thiểu `ynm_link`. Nếu BA yêu cầu external link phải có `ynm_caption/domain`, hiện output thiếu `link_shared_domain` và metadata domain.

### NC-3: Internal X link chỉ có `ynm_link`

Affected:

| Field | Actual |
|---|---|
| `id_social` | `2071114633197257110` |
| `link_shared` | `x.com/din_hossam25090/status/2071082331566117352/video/1` |
| `search_text[2]` | `{"ynm_link":"x.com/din_hossam25090/status/2071082331566117352/video/1"}` |

Need Confirm: nếu BA chỉ yêu cầu preserve internal X link thì pass. Nếu yêu cầu enrich metadata như `ynm_name/ynm_des`, output chưa đủ.

## 5. Coverage Cho YNMSHGYSG-829

File này không có:

- `attachment.type=article`
- `attachment.type=audio`
- `attachment.type=broadcast`
- `link_shared` chứa `x.com/i/article`
- `link_shared` chứa `x.com/i/spaces`
- `link_shared` chứa `x.com/i/broadcasts`

Kết luận: không dùng file này để sign-off YNMSHGYSG-829 cho Article/Space/Broadcast. Cần dùng lại file/samples có special content như các audit trước:

- Article sample có body dài
- Audio Space sample `x.com/i/spaces/...`
- Broadcast sample `x.com/i/broadcasts/...`

## 6. Sync Với Posts/Replies Hiện Có

Đối chiếu nhanh với files 07/07 đã audit:

- 8 parent mentions trong file này đều tìm thấy trong posts file 07/07.
- 8 reply mentions không tìm thấy trong replies file 07/07.

Không kết luận đây là bug vì replies file 07/07 đang là batch/test set khác. Trong chính file mentions này, relation reply-parent đã đúng qua `id_reference` và `parent_posts`.

## 7. Kết luận cuối

Với file mentions `2026-07-07T04-39-09-920Z`:

- YNMSHGYSG-1169: pass core mention mapping và relation parent/reply.
- YNMSHGYSG-829: chưa đủ data để sign-off vì không có Article/Space/Broadcast.
- Còn 3 điểm Need Confirm: GIF comment rỗng có cần fallback `attachment.type`, external link comment thiếu domain/card metadata, internal X link chỉ có `ynm_link`.
