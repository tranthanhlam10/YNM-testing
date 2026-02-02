# Task fix pusher news của Huy


## Vấn đề


Hiện tại, logic code của Data Pusher News đang gặp vấn đề dẫn tới hiện tượng chỉ insert data vào collection article_urls và Redis, còn 2 collection article_titles và article_crawling thì bị bỏ qua.

## Scope

+ Khi insert data vào collection article_urls thì logic code check new records đang không đúng, mô phỏng lại quá trình bị sai như sau:

Step 1: Insert data có giá trị là [A, B, C] (Với A và C là data mới chưa tồn tại trong hệ thống) vào collection article_urls và response sau khi insert vào collection article_urls lúc này là [ "0": A, "2": C ]

Step 2: Nhưng logic lấy new article url đang dựa vào index của mảng thay vì key của response dẫn tới giá trị của new article url là [A, B].


## Hướng giải quyết

Hiện Huy sẽ fix để lấy key của response


## Cách chạy


ynmpdp-5822-

kubectl get pods -n crawler-staging | grep ynmpdp-5822-
kubectl exec -it ynmpdp-5755-testing-ynm-crawler-empty-8546cd4bf8-cx2bw -n crawler-staging -- sh
kubectl config use-context lamtt-k8s-ovh


- Deployment gốc
ynm-cl-data-pusher-news-service-staging


- Pusher

export LOG_LEVEL=debug

export ARTICLE_2_MONGO_ARTICLE_PUSHER_ENABLE=true

export MONGO_NEWS_ENABLE=true
export MONGO_NEWS_AUTH_SOURCE="ynm_crawler_staging"
export MONGO_NEWS_DATABASE="ynm_crawler_staging"
export MONGO_NEWS_REPLICA_SET="rs0"

yarn start --scope=@ynm/cl-data-pusher-service



ynm-cl-news-crisis-keyword-


{
  "article_urls": [
    {
      "id": "01492b2a-1fa1-5009-b0b8-adceafc61474",
      "platform": 3,
      "id_category": "0",
      "id_source": "vn.investing.com",
      "link": "https://vn.investing.com/news/stock-market-news/prudential-tang-co-phan-trong-cong-ty-bao-hiem-malaysia-len-70-93CH-2517136",
      "title": "Investing.com Việt NamPrudential tăng cổ phần trong công ty bảo hiểm Malaysia lên 70%Investing.com -- Prudential plc hôm thứ Năm cho biết công ty đã đồng ý tăng tỷ lệ sở hữu tại Prudential Assurance Malaysia Berhad (PAMB) lên 70% bằng cách....23 hours ago",
      "views_avg": 0,
      "priority": 1,
      "status": 1,
      "failed_type": 1,
      "count_failed": 0,
      "crawled_date": "1970-01-01T00:00:00.000Z",
      "createdBy": "NewsArticleUrlFromCrisisKeywordCrawlingLoader"
    },
    {
      "id": "1382c209-f4b1-5fca-a81e-00439e17a488",
      "platform": 3,
      "id_category": "0",
      "id_source": "baotintuc.vn",
      "link": "https://baotintuc.vn/the-gioi/ba-tap-doan-lon-thu-hoi-sua-cong-thuc-vi-nguy-co-nhiem-doc-to-20260123005227639.htm",
      "title": "baotintuc.vnBa tập đoàn lớn thu hồi sữa công thức vì nguy cơ nhiễm độc tốNestlé, Danone và Lactalis đang tiến hành thu hồi quy mô lớn các sản phẩm sữa công thức dành cho trẻ sơ sinh trên toàn cầu..8 hours ago",
      "views_avg": 0,
      "priority": 1,
      "status": 1,
      "failed_type": 1,
      "count_failed": 0,
      "crawled_date": "1970-01-01T00:00:00.000Z",
      "createdBy": "NewsArticleUrlFromCrisisKeywordCrawlingLoader"
    },
    {
      "id": "56e19411-55af-5643-93d3-9e26abbd17af",
      "platform": 3,
      "id_category": "0",
      "id_source": "vietnambiz.vn",
      "link": "https://vietnambiz.vn/tung-thach-thuc-coca-cola-pepsi-mot-ong-lon-nganh-giai-khat-viet-nay-phai-chat-vat-de-ton-tai-202612293811780.htm",
      "title": "VietnamBizTừng thách thức Coca-Cola, Pepsi, một ông lớn ngành giải khát Việt nay phải chật vật để sinh tồnChìm trong chuỗi thua lỗ 20 quý liên tiếp cùng áp lực nợ vay đáo hạn, biểu tượng..1 day ago",
      "views_avg": 0,
      "priority": 1,
      "status": 1,
      "failed_type": 1,
      "count_failed": 0,
      "crawled_date": "1970-01-01T00:00:00.000Z",
      "createdBy": "NewsArticleUrlFromCrisisKeywordCrawlingLoader"
    }
  ]
}




I'm visiting the Twilight Highlands for the first time as a Dracthyr... the ...
Canada: German TKMS and Korean Hanwah identified as possible ...
Kristian Jack interviewing Zorhan Bassong, Ralph Priso and Shola ...
