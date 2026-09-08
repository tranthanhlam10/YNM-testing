# YNMPECA-9338 — Mapping 23 Solr PID với seed ClickHouse

## Mapping

| # | Product Item ID | Dataset | From–To đề xuất | Expected chính |
|---:|---|---|---|---|
| 1 | `shopee_26952042194` | Không có ngày thiếu | `20260719–20260726` | Không tạo `FILL_MISSING`. |
| 2 | `shopee_27451767455` | Chỉ một điểm dữ liệu | `20260201–20260216` | Skip theo FR-01. |
| 3 | `shopee_29801091997` | Solr-only, 0 điểm ClickHouse | `20260201–20260216` | Không insert source row; skip an toàn. |
| 4 | `shopee_27801769915` | Happy path, output, chain, rerun | `20260201–20260216` | Fill 02/02–09/02, count 8. |
| 5 | `shopee_25429221908` | Cùng tuần đi qua cuối tháng | `20260427–20260501` | Business expected 0; code cũ tạo 28/04–30/04. |
| 6 | `shopee_25129493636` | Không có dữ liệu tuần sau | `20260201–20260216` | Không extrapolate sau 04/02. |
| 7 | `shopee_24830284719` | Có observed record Thứ Năm | `20260201–20260218` | Không fill tuần chứa 12/02. |
| 8 | `shopee_25863055292` | Có observed record Thứ Sáu | `20260201–20260218` | Không fill tuần chứa 13/02. |
| 9 | `shopee_23459346593` | Có observed record Thứ Bảy | `20260201–20260218` | Không fill tuần chứa 14/02. |
| 10 | `shopee_25378833951` | Thứ Tư control | `20260201–20260218` | Thứ Tư không tự chặn fill. |
| 11 | `shopee_25705672113` | Delta sold = 0 | `20260201–20260216` | Không fill. |
| 12 | `shopee_6382537091` | Delta sold = 1 | `20260201–20260216` | Không fill. |
| 13 | `shopee_27501283747` | Delta sold = 2 | `20260201–20260216` | Được xét fill, expected 8 ngày. |
| 14 | `shopee_25825887492` | Delta sold âm | `20260201–20260216` | Không sinh sold âm. |
| 15 | `shopee_24003945432` | Synthetic left anchor | `20260201–20260216` | Dùng `last_*` 31/01; fill bắt đầu 01/02. |
| 16 | `shopee_29000353085` | Record đầu giữa tuần | `20260201–20260216` | Fill bắt đầu 04/02. |
| 17 | `shopee_29000811682` | Gap dài 16 ngày | `20260201–20260221` | Fill 02/02–17/02. |
| 18 | `shopee_21487373172` | Hai gap | `20260201–20260221` | Fill 02/02–09/02 và 11/02–17/02. |
| 19 | `shopee_28726417602` | Deterministic/remainder | `20260201–20260216` | 5 dry-run phải giống nhau sau khi fix. |
| 20 | `shopee_28408282291` | Mega-sale hard-code | `20241208–20241222` | Đi qua hard-code 14/12–21/12. |
| 21 | `shopee_26105984446` | Mega-sale control | `20241124–20241208` | Cùng duration/delta, không có special date. |
| 22 | `shopee_10288121996` | Buff nằm giữa timeline | `20260201–20260216` | Bỏ điểm 9999; dùng cận sạch 100→120. |
| 23 | `shopee_25724548715` | Sau Remove Buff chỉ còn một điểm | `20260201–20260216` | Skip theo FR-01 sau clean. |

## Trình tự chạy

1. Chạy collision query ở đầu file SQL.
2. Nếu một PID đã có row trong đúng range của scenario, chưa chạy seed; cần đổi range hoặc làm sạch theo phương án Dev/Data phê duyệt.
3. Chạy `INSERT ... VALUES`.
4. Chạy verification query cuối file; phải có 22 PID trong ClickHouse. PID số 3 phải vắng mặt.
5. Chạy migration với `--dry_run=1` và filter đúng một PID.
6. Chỉ bật write sau khi dry-run khớp expected.

Ví dụ happy path:

```bash
node scripts/solrmaster/migrate_ECA_PI_missing_dates_clickhouse.js \
  --collection=product_items \
  --filter='id:shopee_27801769915' \
  --from_date=20260201 \
  --to_date=20260216 \
  --datasetId=eci_testing \
  --tableId=product_item_histories_distributed \
  --destination_source=product_item_histories_fill_missing_tmp \
  --dry_run=1
```

## Cảnh báo dữ liệu

- Không chạy `INSERT` hai lần trên cùng source dataset.
- Không dùng `destination_source=product_item_histories_distributed` khi chưa có phê duyệt và cleanup/rollback plan.
- Code hiện tại dùng `Math.random()` và chưa idempotent; output write phải nằm trong bảng tạm cô lập.
