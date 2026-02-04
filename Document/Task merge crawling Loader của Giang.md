# Task merge crawling Loader của Giang


## Scope

- Merge các crawling-loader của các platform thành 1
- Gom các Solr Lib của Loader, Updater, Pusher thành 1 file


## Các case cần phải check


1. Functional
- Kiểm tra xem khi chạy loader thì loader có chạy được service hay không
- Kiểm tra xem khi chạy loader thì có load message lên hay không
- Kiểm tra xem khi chạy loader thì message load lên có đúng yêu cầu không
- Kiểm tra xem khi chạy loader thì có lưu lại cursor hay không
- Kiểm tra xem khi chạy loader thì có cache lại ở Redis hay không


2. Config


- enable: Bật hoặc tắt một bộ tải (loader) cụ thể trong dịch vụ cào dữ liệu.
- country: Xác định quốc gia mục tiêu đang được thực hiện cào dữ liệu.
- crawlingLoaderType: Phân loại bộ tải và xác định con trỏ (cursor) để theo dõi tiến trình khi load trang.
- outputQueue: Tên hàng đợi (queue) mục tiêu nơi dữ liệu sau khi cào sẽ được đẩy vào.
- maxMsgInQueue: Giới hạn số lượng tin nhắn tối đa trong hàng đợi để hệ thống quyết định có tiếp tục load thêm dữ liệu hay không.
- maxWaitingMessageInQueueCheck: Khoảng thời gian hệ thống sẽ chờ để kiểm tra lại hàng đợi sau khi đã đạt giới hạn maxMsgInQueue.
- cyclePerDay: Sử dụng định dạng Cron để lập lịch chu kỳ chạy tiếp theo ngay sau khi kết thúc chu kỳ hiện tại.
- defaultDataDuration: Thiết lập độ ưu tiên cho các nguồn dữ liệu (Source priority).
- dataLoadBatchSize: Quy định số lượng tin nhắn được tải vào hàng đợi đầu ra trong mỗi đợt (batch).
- delayTimeRules: Các quy tắc để thiết lập thời gian cào lại (next_crawling_time), giúp hệ thống lọc và sắp xếp dữ liệu trước khi đưa vào hàng đợi.


3. Connection

- Tắt Solr
- Tắt mySQL
- Tắt Redis
- Tắt mongo