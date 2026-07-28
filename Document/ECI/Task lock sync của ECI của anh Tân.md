# Task lock sync của ECI của anh Tân

## Scope

Period đang mở
→ SYNC

Period đã chốt + record industry lock hoặc PI industry lock
→ SKIP hoàn toàn

Period đã chốt + cả hai phía không lock
→ SYNC



## Hướng giải quyết

App Team xác định mốc thời gian gửi request → chia timerange sync thành 2 messages riêng biệt cho locked industries và unlocked industries.
Mỗi message kèm theo một hash được lưu trên Redis (format: eca:report-sync:<sync_request_id>:<hash_id>).
Message cho locked industries sử dụng lookupFilters dạng industry_id:(1 2 3) với time range bị giới hạn theo rolling boundary.
Message cho unlocked industries sử dụng lookupFilters dạng -industry_id:(1 2 3) với full time range.
Data Team xử lý sync dựa trên filters và điều kiện đi kèm.
Sau khi sync xong, Data Team gọi API (PUT report-synchronizations) để cập nhật status và xóa hash trên Redis.
Request chuyển status “Synced” khi không còn hash nào trên Redis.




## Cách chạy


1. Queue 