# Pantip Crawl Comment Mapping Re-audit

Ngày audit: 10/06/2026

## 1. Phạm vi

| Dữ liệu | Kết quả |
|---|---:|
| Topic | `43763911` |
| Mention output | 710 records: 709 root comments + 1 reply |
| Mention duy nhất theo `id`/`id_social` | 710/710 |
| Identity output | 701 records, 690 identity duy nhất |
| API live đã đối chiếu exact | 100 comments trang đầu |
| Source của parent post | `pt_222` |
| Parent post UUID | `8f57d4a5-733c-5f07-b468-3ae744807824` |

Nguồn requirement:

- Schema Mention, Post, Identity, version 14.
- Pantip platform technical specification, version 9.
- Pantip platform capability & feature research, version 6.

## 2. Kết luận

Mapping hiện tại **chưa pass**. Có bốn lỗi chắc chắn ảnh hưởng trực tiếp đến dữ liệu:

| Mức độ | Field | Kết quả |
|---|---|---|
| High | `id_source` | Sai 710/710 mentions |
| High | `country_code` | Sai casing trên 710 mentions và 701 identity records |
| High | Identity `shard` | Thiếu 701/701 records |
| High | `updated_at` | Đang map crawl time thay vì platform update time |

Ngoài ra còn lỗi attachment emoji và một số field có nguy cơ sai ngữ nghĩa hoặc chưa thống nhất requirement.

## 3. Lỗi chắc chắn

### 3.1. `id_source`

Expected cho toàn bộ comment/reply của topic:

```json
"id_source": "pt_222"
```

Actual:

- 710/710 records có `id_source == identity`.
- Có 690 giá trị `id_source` khác nhau.
- Chỉ 1 record có `id_source = pt_222` vì người comment tình cờ cũng là `pt_222`.

Ví dụ comment 1:

```json
{
  "id_source": "pt_7939088",
  "identity": "pt_7939088"
}
```

Expected:

```json
{
  "id_source": "pt_222",
  "identity": "pt_7939088"
}
```

### 3.2. `country_code`

Cả schema chung và wiki Pantip đều quy định `"th"`.

Actual:

- Mention: 710/710 là `"TH"`.
- Identity: 701/701 là `"TH"`.

Nếu downstream xử lý case-sensitive, dữ liệu có thể bị phân nhóm sai hoặc không match enum.

### 3.3. Identity `shard`

Expected:

- Lấy ngày từ `data_utime`.
- Format `YYYYMMDD`.

Actual: thiếu field `shard` trên 701/701 identity records.

### 3.4. Emoji bị map thành photo attachment

Có 66 mentions mang `attachment.type = "photo"`:

- 26 là emoji/sticker từ `ptcdn.info/toy` hoặc `ptcdn.info/emoticons`.
- 39 là ảnh nội dung từ `f.ptcdn.info`.
- 1 là thumbnail YouTube.

Theo wiki, image/emoji HTML không được lấy như nội dung media. Ít nhất 26 emoji attachment phải bị loại bỏ, chỉ giữ `parent_info`.

Ví dụ:

```json
{
  "link": "pantip.com/topic/43763911/comment22",
  "attachment": {
    "type": "photo",
    "media_src": "https://ptcdn.info/emoticons/mao_investor/mao27.png"
  }
}
```

### 3.5. `updated_at` sai ngữ nghĩa

Schema chung định nghĩa `updated_at` là thời điểm mention được update trên platform.

Actual:

- 710/710 records mang thời điểm xử lý/crawl ngày 08/06/2026.
- API có `last_modified` và `last_mod_iso_time` cho comment đã chỉnh sửa.

Ví dụ comment 23:

| Field | Giá trị |
|---|---|
| API `last_mod_iso_time` | `11/07/2025 18:23:22` giờ Thái Lan |
| Expected UTC | `2025-11-07T11:23:22.000Z` |
| Output `updated_at` | `2026-06-08T04:48:26.953Z` |

Nếu comment chưa từng chỉnh sửa, cần thống nhất `updated_at` là `null`/không emit hay bằng `created_date`; không nên dùng crawl time.

## 4. Nguy cơ sai hoặc cần xác nhận

| Field | Hiện trạng | Rủi ro / câu hỏi |
|---|---|---|
| `id_reference` | Parent post UUID | Wiki Pantip ghi raw `paging.topic_id`. UUID hợp lý để join nội bộ, nhưng tài liệu cần thống nhất. |
| `id_parent_comment` | Parent mention UUID | Quan hệ nội bộ đúng, nhưng wiki đang ghi `comment_id`, dễ hiểu là raw Pantip ID. |
| `comments` | Thiếu 710/710 | Schema chung quy định comment lưu số replies. Root comment 708 có 1 reply nhưng không có `comments: 1`. |
| `likes` / `reaction` | Thiếu 710/710 | Trong 100 comments API trang đầu, 95 có `emotion.sum > 0`; wiki research xác nhận reaction có thể collect nhưng comment mapping chưa quy định công thức. |
| Photo `href` | Thiếu trên 40 media không phải emoji | Schema attachment mẫu có `href`; cần xác nhận Pantip chỉ cần `media_src` hay phải giữ link gốc. |
| YouTube embed | Thumbnail đang map `type: "photo"` | Có nguy cơ phải map dạng link/embed thay vì photo. |
| `search_text` | 3 records rỗng | Comment 23 đã đối chiếu API và đúng là message rỗng; hai record còn lại chỉ có image/emoji. Cần xác nhận hệ thống có chấp nhận mention không có text. |
| `title` | Rỗng 710/710 | Pantip comment spec không yêu cầu title, nhưng schema chung mô tả title áp dụng cho all mentions. |
| Identity duplicate | 11 identity IDs bị emit hai lần | Payload giống nhau ngoài `created_date`; không sai identity nhưng tăng volume và có thể gây update không cần thiết. |

## 5. Các field đã kiểm tra đúng

| Hạng mục | Kết quả |
|---|---|
| Số lượng | 709 root comments + 1 reply |
| Duplicate mention | Không có |
| `id` | UUID v5 build đúng từ canonical link, 710/710 |
| `link` | Đúng format, không còn tiền tố `//`, 710/710 |
| Reply `id_parent_comment` | Trỏ đúng UUID root comment |
| `platform` | `14`, 710/710 |
| `domain` | `pantip.com`, 710/710 |
| `id_social` | Duy nhất, dạng number, 710/710 |
| `identity` | `pt_{user.mid}`, 710/710 |
| `identity_name` | Match Identity output |
| `mention_type` | `2`, 710/710 |
| `mention_type_details` | `2`, 710/710 |
| `source_type` | `1`, 710/710 |
| `created_date` | Exact match API sau khi đổi giờ Thái Lan sang UTC trên 100/100 records trang đầu |
| `shard` | Có đủ và khớp ngày `created_date`, 710/710 |
| `search_text` HTML | Không còn raw HTML |
| Parent attachment | JSON hợp lệ và có đúng parent link/title |
| Identity coverage | Đủ toàn bộ 690 author duy nhất |
| Identity `id`, `id_social`, `link` | Quan hệ format đúng |
| Identity avatar | Có đủ và dùng HTTPS |

## 6. Thứ tự fix đề xuất

1. Sửa `id_source` lấy từ source object của parent post.
2. Chuẩn hóa `country_code` thành lowercase `"th"`.
3. Bổ sung Identity `shard`.
4. Map `updated_at` từ `last_mod_iso_time`, không dùng crawl time.
5. Phân biệt `img-in-emotion`/sticker với ảnh nội dung trước khi tạo attachment.
6. Xác nhận contract cho interaction fields, `id_reference`, `id_parent_comment` và photo `href`.
7. Deduplicate Identity theo `id` trước khi publish.
