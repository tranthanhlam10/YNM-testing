# Task loader luồng prioriy của a Đức


## Scope

Đều chỉnh priority của luồng crawl detail , load đi crawl theo priority


## Hướng xử lý


Phương án đề xuất là gom vùng 1 + vùng 2 lại (tạm gọi vùng A), gom vùng 3 + vùng 4 lại (tạm gọi vùng B).

Từ thứ 5 đến hết chủ nhật sẽ bật vùng A, những ngày còn lại trong tuần thì bật vùng B.

Nếu gặp trường hợp bị block thì chỉ ưu tiên vùng 1, nếu crawl hết thì load vùng 2.

Nếu rơi vào cuối tháng thì crawl vùng A từ bắt đầu 3 ngày cách cuối tháng đến hết ngày đầu tiên của tháng.




## Cách chạy


shopee-ynm-cl-eca-crawling-loader-service-testing

https://k8s.ynm.local/#/deployment/crawler-testing/shopee-ynm-cl-eca-crawling-loader-service-testing?namespace=crawler-testing