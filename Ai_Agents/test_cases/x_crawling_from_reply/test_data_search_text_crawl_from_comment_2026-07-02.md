# Test Data Search Text - Crawl From Comment

Ngày tạo: 02/07/2026

Mục tiêu: tạo payload input để crawl từ **comment/reply id** nhằm verify mapping `search_text[0]`, `search_text[1]`, `search_text[2]` theo spec BA.

File payload để push queue:

- `Data_get_from_rabbitMQ_by_scripts/test_data_search_text_crawl_from_comment_2026-07-02.json`

Nguồn đã đối chiếu local:

- `Data_get_from_rabbitMQ_by_scripts/messages_testing_cl_x_identity_countries_crawling_sources_2026-06-30T09-51-44-473Z.json`

## 1. Payload Format

```json
{
  "id": "uuid-ngau-nhien",
  "id_social": "comment_or_reply_id",
  "type": 1,
  "platform": 11,
  "retries": 0,
  "createdBy": "XKeywordPostWebCrisisCrawlingLoader"
}
```

## 2. Danh sách data đã collect được

| Case | Mục tiêu test | Parent post | Comment id dùng crawl | Comment link | Expected focus |
|---|---|---|---|---|---|
| STC_X_SEARCH_TEXT_001 | Text-only/status post từ comment | `2071468859974955279` | `2071473297624080461` | `x.com/1940862202115678208/status/2071473297624080461` | Verify post/comment text map vào `search_text[1]`; `search_text[2]` có thể null nếu không quote/card. |
| STC_X_SEARCH_TEXT_002 | Photo post từ comment | `2071435488670462255` | `2071436206634889260` | `x.com/1959889748631142400/status/2071436206634889260` | Verify media photo không làm lệch `search_text[1]`; attachment type expected `photo`. |
| STC_X_SEARCH_TEXT_003 | Video post từ comment | `2071322178189197339` | `2071323117021245696` | `x.com/1901220599143223296/status/2071323117021245696` | Verify media video, attachment type expected `video`; `search_text[1]` lấy full_text/note_tweet text. |
| STC_X_SEARCH_TEXT_004 | GIF post từ comment | `2071455306802962697` | `2071470433652674753` | `x.com/1671221477138665472/status/2071470433652674753` | Verify attachment type expected `animated_gif`; `search_text[1]` vẫn lấy text. |
| STC_X_SEARCH_TEXT_005 | Quote text/status từ comment | `2071272826594861283` | `2071289942895124577` | `x.com/1503884796178710537/status/2071289942895124577` | Verify quote map `search_text[2].ynm_name` và `search_text[2].ynm_des` từ quoted status. |
| STC_X_SEARCH_TEXT_006 | Quote video từ comment | `2071503785038356664` | `2071514933636788430` | `x.com/1715154022221451264/status/2071514933636788430` | Verify quote video vẫn map thông tin post gốc ở `search_text[2]`, đồng thời attachment parent là `video`. |
| STC_X_SEARCH_TEXT_007 | Quote GIF từ comment | `2071091724823519515` | `2071092589583855994` | `x.com/1876125897268310016/status/2071092589583855994` | Verify quote GIF map `search_text[2]` từ quoted status, attachment parent là `animated_gif`. |
| STC_X_SEARCH_TEXT_008 | Post/comment chứa internal X link | `2071114633197257110` | `2071166698216993018` | `x.com/1798991502133305344/status/2071166698216993018` | Verify case có link X trong text: `link_shared` expected là X status/video link và `search_text[2].ynm_link` có link đó. |

## 3. Payloads

```json
[
  {
    "id": "1c6f8d2a-9b3e-4d10-ae78-2f18c35a9011",
    "id_social": "2071473297624080461",
    "type": 1,
    "platform": 11,
    "retries": 0,
    "createdBy": "XKeywordPostWebCrisisCrawlingLoader"
  },
  {
    "id": "7f42b8c1-6d90-4f3a-9f22-8e13c0d74b65",
    "id_social": "2071436206634889260",
    "type": 1,
    "platform": 11,
    "retries": 0,
    "createdBy": "XKeywordPostWebCrisisCrawlingLoader"
  },
  {
    "id": "4b9e7a10-2f65-4f0e-8d7a-63c9152fb084",
    "id_social": "2071323117021245696",
    "type": 1,
    "platform": 11,
    "retries": 0,
    "createdBy": "XKeywordPostWebCrisisCrawlingLoader"
  },
  {
    "id": "e28a3f64-0f95-45a1-82e9-37d4b1c906af",
    "id_social": "2071470433652674753",
    "type": 1,
    "platform": 11,
    "retries": 0,
    "createdBy": "XKeywordPostWebCrisisCrawlingLoader"
  },
  {
    "id": "9db7e241-8b05-4c93-9d7d-2cf0a16f5e43",
    "id_social": "2071289942895124577",
    "type": 1,
    "platform": 11,
    "retries": 0,
    "createdBy": "XKeywordPostWebCrisisCrawlingLoader"
  },
  {
    "id": "2f5c9d71-3a84-47e6-b28d-61a0e95c4f37",
    "id_social": "2071514933636788430",
    "type": 1,
    "platform": 11,
    "retries": 0,
    "createdBy": "XKeywordPostWebCrisisCrawlingLoader"
  },
  {
    "id": "b6a9e143-70dc-4625-a8e4-1d53ef9b820a",
    "id_social": "2071092589583855994",
    "type": 1,
    "platform": 11,
    "retries": 0,
    "createdBy": "XKeywordPostWebCrisisCrawlingLoader"
  },
  {
    "id": "d3f18a6b-5e4c-4b82-b7f1-0a9d624c5e38",
    "id_social": "2071166698216993018",
    "type": 1,
    "platform": 11,
    "retries": 0,
    "createdBy": "XKeywordPostWebCrisisCrawlingLoader"
  }
]
```

## 4. Cases chưa đủ comment id chuẩn

Các case dưới đây chưa đưa vào payload push vì hiện chưa có **comment/reply id thật đã verify local**:

| Nhóm | Lý do chưa đưa vào payload |
|---|---|
| External Link - crawl từ comment | Local có nhiều post-level samples external link/card, nhưng chưa có cặp `comment id -> parent external link post` đã resolve. Không nên dùng post id thay cho comment id vì lệch scope "crawl từ comment lấy post". |
| Link Quote - crawl từ comment | Chưa có sample comment id local cho quote external link/card. |
| Poll Post/Comment/Quote | Chưa tìm thấy native X Poll trong các file X local. Cần collect thêm bằng live crawler/API để lấy comment id thật dưới một poll post. |

## 5. Gợi ý collect thêm

- Với External Link: chọn một post X có card external link và có ít nhất 1 reply public, dùng **reply/comment id** làm `id_social`.
- Với Poll: chọn một native X Poll có reply public, dùng **reply/comment id** dưới poll làm `id_social`.
- Sau khi crawl xong, verify:
  - `search_text[1]` lấy `full_text` hoặc `note_tweet.text`.
  - External Link: `search_text[2]` có `ynm_name`, `ynm_des`, `ynm_caption`, `ynm_link` từ card/entity URL.
  - Poll: `search_text[2].ynm_story` có options và vote count từ card choices/count.
