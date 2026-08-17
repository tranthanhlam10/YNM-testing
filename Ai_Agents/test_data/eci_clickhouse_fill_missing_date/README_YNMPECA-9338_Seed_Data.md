# YNMPECA-9338 — Hướng dẫn sử dụng seed data rải số

## 1. File dữ liệu

Chạy file:

`SeedData_YNMPECA-9338_Fill_Missing_Dates.sql`

File insert đúng 19 field của `eci_testing.product_item_histories_distributed` và sử dụng metadata cố định để việc đối soát dễ dàng.

## 2. Điều kiện bắt buộc trước khi chạy

Script migration lấy danh sách `product_item_id` từ Solr trước, sau đó mới query ClickHouse. Các PID `qa_fill_*` trong seed là PID giả lập có chủ đích.

Để chạy end-to-end, chọn một trong hai cách:

1. Tạo các PID tương ứng trong Solr Testing; hoặc
2. Thay PID `qa_fill_*` bằng các PID Testing thật đã tồn tại trong Solr; hoặc
3. Chạy core/offline harness và truyền trực tiếp timeline, bỏ qua bước preload Solr.

Không chạy seed trên Production. Nên dùng destination riêng:

```text
eci_testing.product_item_histories_fill_missing_tmp
```

## 3. Dataset và expected chính

| PID | Test case | Range đề xuất | Expected business |
|---|---|---|---|
| `qa_fill_no_gap` | Không có missing date | `20260719–20260726` | Không tạo `FILL_MISSING`. |
| `qa_fill_one_point` | FR-01 — chỉ 1 điểm | `20260201–20260216` | Skip, fill count = 0. |
| `qa_fill_happy_8d` | Happy path Wiki | `20260201–20260216` | Fill đúng 02/02–09/02, count = 8. |
| `qa_fill_same_week_month_end` | FR-02 | `20260427–20260501` | Business: không fill. Code hiện tại có thể fill 28/04–30/04. |
| `qa_fill_no_future_week` | FR-03 | `20260201–20260216` | Không kéo dài dữ liệu sau record 04/02. |
| `qa_fill_weekend_thu` | FR-05 — Thứ Năm | `20260201–20260218` | Không fill tuần chứa 12/02. |
| `qa_fill_weekend_fri` | FR-05 — Thứ Sáu | `20260201–20260218` | Không fill tuần chứa 13/02. |
| `qa_fill_weekend_sat` | FR-05 — Thứ Bảy | `20260201–20260218` | Không fill tuần chứa 14/02. |
| `qa_fill_weekday_wed` | FR-05 control | `20260201–20260218` | Thứ Tư không tự chặn fill. |
| `qa_fill_delta_0` | FR-06 — delta 0 | `20260201–20260216` | Không fill. |
| `qa_fill_delta_1` | FR-06 — delta 1 | `20260201–20260216` | Không fill. |
| `qa_fill_delta_2` | FR-06 — delta 2 | `20260201–20260216` | Được xét fill nếu các rule khác đạt. |
| `qa_fill_negative_delta` | Sold giảm | `20260201–20260216` | Không sinh sold âm. |
| `qa_fill_left_anchor` | Synthetic left anchor | `20260201–20260216` | Dùng `last_*` ngày 31/01; fill đầu tiên là 01/02. |
| `qa_fill_first_midweek` | Cận trái giữa tuần | `20260201–20260216` | Không fill 01/02–02/02; bắt đầu từ 04/02. |
| `qa_fill_gap_16d` | Gap dài | `20260201–20260221` | Fill 02/02–17/02, count = 16. |
| `qa_fill_two_gaps` | Hai gap | `20260201–20260221` | Hai gap được tính độc lập. |
| `qa_fill_deterministic` | Random/remainder | `20260201–20260216` | Năm dry-run phải cho cùng output sau khi code được sửa. |
| `qa_fill_mega_sale` | Hard-code mega-sale | `20241208–20241222` | Không áp dụng special factor nếu BA chưa approve. |
| `qa_fill_mega_control` | Control mega-sale | `20241124–20241208` | Dùng cùng công thức chuẩn, không special factor. |
| `qa_fill_buff_middle` | Buff ở giữa | `20260201–20260216` | Bỏ record 9999; phân bổ theo cận sạch 100→120. |
| `qa_fill_buff_insufficient` | Thiếu điểm sau Remove Buff | `20260201–20260216` | Sau khi bỏ buff chỉ còn 1 điểm, không fill. |

Case “ClickHouse có 0 điểm” không có dòng seed. Hãy dùng một PID tồn tại trên Solr nhưng không có record tương ứng trong bảng ClickHouse.

## 4. Cách chạy an toàn

Luôn chạy dry-run trước và lọc đúng một PID:

```bash
node scripts/solrmaster/migrate_ECA_PI_missing_dates_clickhouse.js \
  --collection=product_items \
  --filter='id:qa_fill_happy_8d' \
  --from_date=20260201 \
  --to_date=20260216 \
  --datasetId=eci_testing \
  --tableId=product_item_histories_distributed \
  --destination_source=product_item_histories_fill_missing_tmp \
  --dry_run=1
```

Nếu PID QA chưa tồn tại trên Solr, command trên sẽ không preload được PI. Không đổi filter thành `*:*` để xử lý toàn bộ collection.

## 5. Cách kiểm tra output

Các invariant tối thiểu:

```text
1. Chỉ missing date đủ điều kiện có crawler_type = FILL_MISSING.
2. total_sold không giảm và không vượt cận phải.
3. Tổng delta từ cận trái đến cận phải không đổi.
4. last_total_sold và last_crawled_date trỏ record liền trước.
5. Observed record không bị sửa/xóa ngoài patch contract đã được Dev xác nhận.
6. Rerun cùng input không được tăng effective fill count.
```

## 6. Lưu ý về code hiện tại

- Query nguồn chỉ lấy `is_abnormal = 0`; record buff trong seed sẽ không đi vào clean timeline.
- Query chỉ đọc record nằm trong `From–To`. Cận trái ngoài range phải được dựng từ `last_total_sold` và `last_crawled_date` của row đầu tiên.
- Code hiện dùng `Math.random()`, nên case deterministic dự kiến fail trước khi được sửa.
- Các khoảng hard-code thực tế trong code là `14/12/2024–21/12/2024`, `19/01/2025–25/01/2025` và `26/01/2025–01/02/2025`.
- Code hiện chưa chống duplicate khi rerun; cần dùng destination sạch hoặc phương án cleanup đã được Dev/Data phê duyệt.

## 7. Kết quả kiểm tra seed bằng core code hiện tại

Seed đã được chạy qua chính hàm `FillMissingSoldDates.process()` để xác nhận nó đi vào đúng branch:

| Dataset | Output hiện tại của core | Đánh giá |
|---|---|---|
| `qa_fill_happy_8d` | 8 ngày, 02/02–09/02 | Khớp ví dụ Wiki. |
| `qa_fill_same_week_month_end` | 3 ngày, 28/04–30/04 | Tái hiện lỗi FR-02; business expected là 0. |
| `qa_fill_no_future_week` | 0 ngày | Khớp expected. |
| `qa_fill_weekend_thu` | 10 ngày, 02/02–11/02 | Tái hiện lỗi FR-05. |
| `qa_fill_weekend_fri` | 11 ngày, 02/02–12/02 | Tái hiện lỗi FR-05. |
| `qa_fill_weekend_sat` | 12 ngày, 02/02–13/02 | Tái hiện lỗi FR-05. |
| `qa_fill_weekday_wed` | 15 ngày trên hai gap | Control case tiếp tục được fill. |
| `qa_fill_delta_0` | 0 ngày | Khớp FR-06. |
| `qa_fill_delta_1` | 0 ngày | Khớp FR-06. |
| `qa_fill_delta_2` | 8 ngày | Khớp boundary `> 1`. |
| `qa_fill_first_midweek` | 6 ngày, 04/02–09/02 | Khớp expected. |
| `qa_fill_gap_16d` | 16 ngày, 02/02–17/02 | Khớp expected. |
| `qa_fill_two_gaps` | 15 ngày: 02/02–09/02 và 11/02–17/02 | Hai gap được kích hoạt độc lập. |
| `qa_fill_mega_sale` | 13 ngày, 09/12–21/12 | Đi qua đúng hard-code 14/12–21/12. |
| `qa_fill_mega_control` | 13 ngày, 25/11–07/12 | Control có cùng độ dài và delta. |

Với `qa_fill_deterministic`, năm lần chạy cùng input đã cho nhiều chuỗi `total_sold` khác nhau. Dataset này tái hiện trực tiếp rủi ro do `Math.random()`.
