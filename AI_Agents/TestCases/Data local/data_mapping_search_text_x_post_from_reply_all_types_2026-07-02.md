# Data Mapping Search Text - X Post From Reply

Ngày audit: 02/07/2026

Phạm vi: kiểm tra `search_text` sau khi crawl từ comment/reply để lấy post gốc theo các dạng bài trong BA.

## 1. Nguồn dữ liệu

| Output | File | Shape |
|---|---|---|
| Mentions | `Data_get_from_rabbitMQ_by_scripts/messages_testing_cl_mentions_2_solr_mentions_LamTT_2_2026-07-02T08-51-21-693Z.json` | Array message, mỗi message chứa `mentions[]` |
| Posts | `Data_get_from_rabbitMQ_by_scripts/messages_testing_cl_posts_2_mongo_x_posts_LamTT_2026-07-02T08-54-14-938Z.json` | Array message, mỗi message chứa `posts[]` |
| Replies | `Data_get_from_rabbitMQ_by_scripts/messages_testing_cl_replies_2_mongo_x_replies_LamTT_2026-07-02T08-54-31-187Z.json` | Array message, mỗi message chứa `comments[]` |
| Input test | `TestData/data_test_x_post_from_reply.json` | 11 comment/reply ids |

## 2. Rule BA dùng để audit

| Nhóm post | Expected `search_text[0]` | Expected `search_text[1]` | Expected `search_text[2]` |
|---|---|---|---|
| Text-only / Photo / Video / GIF | Theo title/content fallback. Nếu không có title/content/search_text[2] thì fallback `attachment.type` theo note BA | `full_text` hoặc `note_tweet.text` | Null nếu không có quote/link/poll |
| Reply chứa link của X post | Theo title/content fallback | `full_text` hoặc `note_tweet.text` | Metadata của post/link được share nếu resolver lấy được |
| Quote | Theo title/content fallback | `full_text` hoặc `note_tweet.text` | Metadata từ `quoted_status_result`: tối thiểu `ynm_name`, `ynm_des`; nếu quoted post là poll thì có thêm `ynm_story` |
| Link external/card | Theo title/content fallback | `full_text` hoặc `note_tweet.text` | Metadata từ card/entity: `ynm_name`, `ynm_des`, `ynm_caption`, `ynm_link`; nếu card thiếu thì tối thiểu cần `ynm_link` |
| Poll | Theo title/content fallback | `full_text` hoặc `note_tweet.text` | `ynm_story[]` gồm option và count |

## 3. Kết luận tổng quan

| Nhóm | Kết luận |
|---|---|
| Text-only parent | Pass |
| Photo parent | Pass |
| Video parent | Pass |
| GIF parent | Pass |
| Quote status/video/GIF parent | Pass |
| External Link/Card parent | Pass |
| Poll parent | Pass |
| Poll quote/comment | Pass |
| Reply/comment mentions | Mostly pass theo comment content riêng. Need Confirm cho comment GIF rỗng và một số link/card thiếu domain/caption. |
| Posts/Replies output | Pass context parent. Không có field `search_text`, dùng `title`, `caption`, `shared_content` để trace context. |

## 4. Mapping chi tiết theo case

### 4.1 Text-only/status

| Field | Parent post | Reply/comment |
|---|---|---|
| Input comment id |  | `2071473297624080461` |
| Link | `x.com/1915684752545505281/status/2071468859974955279` | `x.com/1940862202115678208/status/2071473297624080461` |
| Mention type | `1/1` | `2/2` |
| Attachment | `status` | `photo` |
| `search_text[0]` | `""` | `""` |
| `search_text[1]` | `W stream today get ready tomorrow...` | `Islam and judaism are antichrist entities.` |
| `search_text[2]` | `null` | `null` |
| Kết luận | Pass: text-only parent lấy đúng full text, không có quote/link nên `search_text[2]=null`. | Pass: comment mention lưu nội dung comment riêng. Replies output vẫn giữ context parent ở `caption`. |

### 4.2 Photo

| Field | Parent post | Reply/comment |
|---|---|---|
| Input comment id |  | `2071436206634889260` |
| Link | `x.com/1657168066701131778/status/2071435488670462255` | `x.com/1959889748631142400/status/2071436206634889260` |
| Mention type | `1/1` | `2/2` |
| Attachment | `photo` | `photo` |
| `search_text[0]` | `""` | `""` |
| `search_text[1]` | `the black bull returns to memes` | `If Solana had a final boss of meme energy...` |
| `search_text[2]` | `null` | `{"ynm_link":"https://pump.fun/coin/..."}` |
| Kết luận | Pass: photo parent lấy đúng full text và không có metadata phụ. | Need Confirm nhẹ: comment có external link, resolver chỉ build `ynm_link`, chưa có `ynm_caption/domain`. Có thể chấp nhận nếu raw không có card metadata. |

### 4.3 Video

| Field | Parent post | Reply/comment |
|---|---|---|
| Input comment id |  | `2071323117021245696` |
| Link | `x.com/1483643346166087681/status/2071322178189197339` | `x.com/1901220599143223296/status/2071323117021245696` |
| Mention type | `1/1` | `2/2` |
| Attachment | `video` | `status` |
| `search_text[0]` | `""` | `""` |
| `search_text[1]` | `The jersey gives him +100 accuracy...` | `Ronaldo k fans ka dill garden garden ho gyaa 😃` |
| `search_text[2]` | `null` | `null` |
| Kết luận | Pass: video parent lấy đúng full text. | Pass: comment mention lấy đúng text riêng. |

### 4.4 GIF

| Field | Parent post | Reply/comment |
|---|---|---|
| Input comment id |  | `2071470433652674753` |
| Link | `x.com/1825588541847388160/status/2071455306802962697` | `x.com/1671221477138665472/status/2071470433652674753` |
| Mention type | `1/1` | `2/2` |
| Attachment | `animated_gif` | `status` |
| `search_text[0]` | `""` | `""` |
| `search_text[1]` | `Earnings check after he just did a packdraw sponsor segment` | `And after he won a Audemars Piguet...` |
| `search_text[2]` | `null` | `null` |
| Kết luận | Pass: GIF parent có text nên map đúng `search_text[1]`. | Pass. |

### 4.5 Quote status

| Field | Parent quote post | Reply/comment |
|---|---|---|
| Input comment id |  | `2071289942895124577` |
| Link | `x.com/965850163695837184/status/2071272826594861283` | `x.com/1503884796178710537/status/2071289942895124577` |
| Mention type | `3/3` | `2/2` |
| Link shared | `x.com/938912443702677505/status/2071056567382724675` | `null` |
| `search_text[0]` | `""` | `""` |
| `search_text[1]` | `Lo más random del partido...` | `El primero que había hecho definía...` |
| `search_text[2]` | Có `ynm_des`, `ynm_name` từ quoted status | `null` |
| Kết luận | Pass: quote parent map đúng metadata quoted post vào `search_text[2]`. | Pass: comment riêng không quote/link nên `search_text[2]=null`; replies output giữ parent `shared_content`. |

### 4.6 Quote video

| Field | Parent quote post | Reply/comment |
|---|---|---|
| Input comment id |  | `2071514933636788430` |
| Link | `x.com/1972647177022312448/status/2071503785038356664` | `x.com/1715154022221451264/status/2071514933636788430` |
| Mention type | `3/3` | `2/2` |
| Attachment | `video` | `status` |
| Link shared | `x.com/1972647177022312448/status/2070418955496239461` | `null` |
| `search_text[1]` | `The Australian fans behind Messi...` | `The greatest of all time after Cristiano Ronaldo.` |
| `search_text[2]` | Có `ynm_des`, `ynm_name` từ quoted status | `null` |
| Kết luận | Pass: quote video vẫn giữ metadata quoted post trong `search_text[2]`. | Pass. |

### 4.7 Quote GIF / no-content GIF comment

| Field | Parent quote post | Reply/comment |
|---|---|---|
| Input comment id |  | `2071092589583855994` |
| Link | `x.com/1581889687513341954/status/2071091724823519515` | `x.com/1876125897268310016/status/2071092589583855994` |
| Mention type | `3/3` | `2/2` |
| Attachment | `animated_gif` | `animated_gif` |
| Link shared | `x.com/1876125897268310016/status/2071078502632194140` | `null` |
| `search_text[0]` | `""` | `""` |
| `search_text[1]` | `"Messi plays against no goal keeper no hate but just facts"` | `""` |
| `search_text[2]` | Có `ynm_des`, `ynm_name` từ quoted status | `null` |
| Kết luận | Pass cho parent quote GIF. | Need Confirm/Potential Fail: comment GIF không có content, `search_text[1]` rỗng và `search_text[0]` cũng rỗng. Theo note BA cho `title/search_text[0]`, nếu không có title/content/search_text[2] thì nên fallback `attachment.type=animated_gif`. |

### 4.8 Internal X link trong text

| Field | Parent post | Reply/comment |
|---|---|---|
| Input comment id |  | `2071166698216993018` |
| Link | `x.com/1917639122316832768/status/2071114633197257110` | `x.com/1798991502133305344/status/2071166698216993018` |
| Mention type | `1/1` | `2/2` |
| Attachment | `video` | `status` |
| Link shared | `x.com/din_hossam25090/status/2071082331566117352/video/1` | `null` |
| `search_text[1]` | Full text có internal X video link | `Freekick genius` |
| `search_text[2]` | `{"ynm_link":"x.com/din_hossam25090/status/2071082331566117352/video/1"}` | `null` |
| Kết luận | Need Confirm: link X trong text đã có `ynm_link`, nhưng chưa có `ynm_name/ynm_des/ynm_caption`. Nếu BA xem internal X link như card/link đầy đủ thì thiếu metadata; nếu chỉ yêu cầu preserve link thì pass. |

### 4.9 Poll - 2 options

| Field | Parent poll post | Reply/comment |
|---|---|---|
| Input comment id |  | `2047711558189674508` |
| Link | `x.com/1282121312/status/2047710215265730755` | `x.com/4106551/status/2047711558189674508` |
| Mention type | `1/1` | `2/2` |
| `search_text[1]` | Full poll question | `You press red for survival...` |
| `search_text[2]` | `ynm_story=[{"option":"Red","count":41476},{"option":"Blue","count":57063}]` | `null` |
| Kết luận | Pass: poll parent map đúng options và vote count vào `ynm_story`. | Pass: comment riêng không poll/link nên null. |

### 4.10 External Link/Card

| Field | Parent external link post | Reply/comment |
|---|---|---|
| Input comment id |  | `2072598309680877668` |
| Link | `x.com/1792884194676494336/status/2071153301371118015` | `x.com/2026854103570329600/status/2072598309680877668` |
| Mention type | `1/5` | `2/2` |
| Link shared | `https://tinyurl.com/Panama-England` | `null` |
| Link shared domain | `tinyurl.com` | `null` |
| `search_text[1]` | Full text chứa external URL | `Tui da cmt ne` |
| `search_text[2]` | Có `ynm_des`, `ynm_name`, `ynm_caption=sportbook.ag`, `ynm_link` | `null` |
| Kết luận | Pass: external link/card map đủ metadata theo BA. | Pass: comment riêng không có link nên null; replies output giữ parent caption. |

### 4.11 Poll quote/comment

| Field | Parent poll post | Reply/comment có quoted poll/link |
|---|---|---|
| Input comment id |  | `1594765232160882688` |
| Link | `x.com/138372303/status/1594764827452383232` | `x.com/1350157832880943105/status/1594765232160882688` |
| Mention type | `1/1` | `2/2` |
| Link shared | `null` | `x.com/1582917419714367489/status/1594762593109168129` |
| `search_text[1]` | `Predictions for our next game? 💭` | `I predicted USA on @FIFAWCAILEAGUE 👀` |
| `search_text[2]` | `ynm_story` có 3 options: USA win, Wales win, Draw | Có `ynm_des`, `ynm_story` 2 options, `ynm_name`, `ynm_link` |
| Kết luận | Pass: poll parent map đúng story/options/count. | Pass: comment/quote poll map được cả nội dung quoted post và `ynm_story`. |

## 5. Trace Posts/Replies

Posts và Replies output không có field `search_text`; dùng để xác nhận context parent khi crawl từ comment.

| Nhóm | Kết quả |
|---|---|
| Posts | Có đủ 11 parent posts tương ứng 11 input cases. `caption/shared_content` giữ đúng context parent. |
| Replies | Có đủ 11 reply/comment records. `caption/shared_content` của reply record giữ context parent post, đúng luồng crawl từ comment lấy post. |
| Duplicate | Posts và replies mỗi parent/reply xuất hiện 3 lần do batch chạy nhiều round. Mentions một số case xuất hiện 2 lần. Đây là queue dump, không kết luận bug search_text; khi verify DB final cần check upsert/idempotency. |

## 6. Issue / Need Confirm

| ID | Mô tả | Mức độ | Gợi ý xử lý |
|---|---|---|---|
| NC-1 | Comment GIF `2071092589583855994` không có content: `search_text[1]=""`, `search_text[2]=null`, `search_text[0]=""`. Theo note BA, `title/search_text[0]` có thể cần fallback `attachment.type=animated_gif`. | Medium | Confirm BA/Dev. Nếu đúng note BA áp dụng cho mention comment, log bug. |
| NC-2 | Internal X link parent `2071114633197257110` chỉ có `search_text[2].ynm_link`, chưa có `ynm_name/ynm_des/ynm_caption`. | Low/Medium | Confirm expectation cho link X nội bộ trong text. Nếu chỉ preserve link thì pass; nếu cần enrich metadata thì thiếu. |
| NC-3 | Photo comment `2071436206634889260` có external link `pump.fun`, nhưng `search_text[2]` chỉ có `ynm_link`, chưa có caption/domain. | Low/Medium | Có thể do raw không có card metadata. Confirm nếu testcase strict card fields. |
| NC-4 | Queue output có duplicate records do chạy nhiều round. | Low | Không ảnh hưởng mapping search_text, nhưng DB final cần verify upsert. |

## 7. Kết luận cuối

Các dạng bài chính của BA hiện đã **pass core mapping `search_text`**:

- Text-only/status
- Photo
- Video
- GIF parent
- Quote status/video/GIF
- External Link/Card
- Poll parent
- Poll quote/comment

Điểm cần chú ý nhất là case comment GIF không content (`2071092589583855994`): nếu BA bắt buộc fallback `search_text[0]=attachment.type` thì hiện output chưa đạt.
