# Xác định lại scope khi test task clickhouse

Link task: https://jira.younetco.com/browse/YNMPECA-9280


Còn đây là link App đang giải thích bussiness các luồng ảnh hưởng:

file:///Users/tranthanhlam/Downloads/qc-detect-invalid-and-calculate-flow.md

## Scope

Task clickhouse này 2 bên team dev sẽ làm:

- Kiểm tra lại các pod của bên App, xem có đang action với clickhouse hay không 
detect-invalid-record, ws-ms-calculate-pi-histories

- Kiểm tra lại câu query bên App đã thay đổi khi sử dụng clickhouse so với timescale

- Kiểm tra xem các tính năng view product_history ở màn hình Product_items của App

- Kiểm tra lại luồng data pusher -> Khi mà data được crawl về, thì có được push vào clickhouse -> Team data


Thông qua những thông tin trên và qua testcases bên dưới:

https://docs.google.com/spreadsheets/d/1EF6cHhZ4ncRRK0N9LutwmbdAGuD65nko_K6hTMoBiYg/edit?gid=1704880699#gid=1704880699


Bạn hãy chỉnh sửa lại testcase phù hợp với scope và thông tin trên


