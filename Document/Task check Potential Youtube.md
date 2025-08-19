# Task potential Youtube


## Mục đích 

Tạo luồng update subscriber count từ potential source của platform Youtube.

## Flow hoạt động

- Hiện tại luồng sẽ load source từ Mongo của Platform Youtube, ở **collection identity_last_mentions**

- Sau đó sẽ chạy luồng  Youtube Follower Crawler để crawl số subscriber_count cho source Youtube đó

- Tiếp theo là sẽ update vào Solr và Redis số subscriber_count

- Cuối cùng là sẽ update lại vào Mongo thời gian đã đi crawl của record đó

### Cách chạy theo dev


Bước 1: Load identity từ MongoDB và tiến hành kiểm tra identity có nằm trong lock sources không. Nếu có nằm trong lock sources thì sẽ kết thúc workflow. Ngược lại thì đi đến bước 2.

Bước 2: Thêm identity vào buffer.

Bước 3: Lấy identity từ buffer ra.

Bước 4: Tiến hành gọi Youtube API để lấy chỉ số follower của identity. Nếu gọi Youtube API thành công thì sẽ  đi đến bước 5. Nếu gọi Youtube API thất thì sẽ tiến hành kiểm tra identity có thể retry được không. Nếu identity có thể retry thì quay lại bước 2, ngược lại thì đi đến bước 8.

Bước 5: Gán chỉ số follower mới vào field subscriber_count của identity.

Bước 6: Gán chỉ thời gian hiện tại vào field last_crawled_followers của identity.

Bước 7: Update identity đã có các thông tin cần thiết vào Solr, Redis và MongoDB với các field tương ứng với schema của mỗi DB.

Bước 8: Release identity cho lần xử lý tiếp theo và kết thúc workflow.


## Cách chạy

youtube-ynmpdp-5136-testing-crawler-empty-container
kubectl get pods -n crawler-testing | grep youtube-ynmpdp-5136-testing-crawler-empty-container
kubectl exec -it youtube-ynmpdp-5136-testing-crawler-empty-container-84ccbf6mcf2 -n crawler-testing -- sh
kubectl config use-context lamtt-k8s-local

script chạy:
node services.js
node scripts/youtubeV2/get_latest_potential_channels_info.js


// Chạy mongoDB bằng terminal


mongosh


mongosh mongodb://qc_lamtt:hk233ASNOFe4ahs@192.168.1.108:27017/socialheat_testing?authSource=socialheat_testing


// Câu lệnh query find đơn gianr
db.identity_last_mentions.find().limit(5).pretty()


// Cách sử dụng câu aggregations ở mongo
db.identity_last_mentions.aggregate([ { $group: { _id: "$platform", count: { $sum: 1 } } } ])


// Câu query thứ nhất của đều kiện phân trang
db.identity_last_mentions.find({ last_crawl_followers: { $exists: false },platform:7 }).count()

// Câu lệnh query đơn giản
{ platform: 7,  last_crawl_followers: { $exists: false }  }
{ last_mention_in_topic: -1 }

## Những services cần phải check

- MongoDB
identity_last_mentions

- Solr
identity


- Redis
check identity trong redis


## Điều kiện load

[
  {
    $match: {
      $and: [
        { platform: 7 },
        {
          $or: [
            { last_crawl_followers: { $exists: false } },
            { last_crawl_followers: { $lte: moment().subtract(30, "days").toDate() } }
          ]
        },
        {
          $or: [
            { last_mention_in_topic: { $gt: lastMentionInTopic } },
            {
              last_mention_in_topic: lastMentionInTopic,
              _id: { $gt: lastId },
            }
          ]
        }
      ]
    }
  },
  {
    $sort: {
      last_mention_in_topic: 1,
      _id: 1,
    }
  },
  {
    $project: {
      _id: 1,
      platform: 1,
      last_mention_in_topic: 1,
      last_crawl_followes: 1
    }
  },
  {
    $limit: 1000
  }
]



## Câu lệnh chạy loader trên mongosh

// Đây là giá trị mặc định mà AI gen ra
const lastMentionInTopic = ISODate("2025-07-29T00:00:00.000Z"); 
const lastId = ObjectId("66baedcb8c9c3ebf4033ed2a");             
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

// Đây là các giá trị mà mình config
const lastMentionInTopic = ISODate("2025-07-29T00:00:00.000Z"); 
const lastId = ObjectId("66baedcb8c9c3ebf4033ed2a");
const thirtyDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);     


**Đây là câu lệnh hiển thị danh sách**

db.identity_last_mentions.aggregate([
  {
    $match: {
      $and: [
        { platform: 7 },
        {
          $or: [
            { last_crawl_followers: { $exists: false } },
            { last_crawl_followers: { $lte: thirtyDaysAgo } }
          ]
        },
        {
          $or: [
            { last_mention_in_topic: { $gt: lastMentionInTopic } },
            {
              last_mention_in_topic: lastMentionInTopic,
              _id: { $gt: lastId }
            }
          ]
        }
      ]
    }
  },
  {
    $sort: {
      last_mention_in_topic: 1,
      _id: 1
    }
  },
  {
    $project: {
      _id: 1,
      platform: 1,
      last_mention_in_topic: 1,
      last_crawl_followes: 1
    }
  },
  {
    $limit: 1000
  }
])



**Đây là câu lệnh hiện count**
db.identity_last_mentions.aggregate([
  {
    $match: {
      $and: [
        { platform: 7 },
        {
          $or: [
            { last_crawl_followers: { $exists: false } },
            { last_crawl_followers: { $lte: thirtyDaysAgo } }
          ]
        },
        {
          $or: [
            { last_mention_in_topic: { $gt: lastMentionInTopic } },
            {
              last_mention_in_topic: lastMentionInTopic,
              _id: { $gt: lastId }
            }
          ]
        }
      ]
    }
  },
  {
    $count: "total"
  }
])


// Giá trị trả ra khi chạy câu query trên
[ { total: 366 } ]



### Câu lệnh sau khi đẫ phân tích và hiểu về cơ chế aggregations của mongosh

// Câu lệnh default
const lastMentionInTopic = ISODate("2025-07-29T00:00:00.000Z"); 
const lastId = "UCmxlh9SAGEL8TstliMjb5..."; // thay bằng _id cuối bạn đã crawl
const thirtyDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); 


// Câu lệnh chỉnh sửa 
const lastMentionInTopic = ISODate("2025-01-01T00:00:00.000Z"); 
const lastId = "";
const thirtyDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); 


// Câu lệnh lấy danh sách

db.identity_last_mentions.aggregate([
  {
    $match: {
      $and: [
        { platform: 7 },
        {
          $or: [
            { last_crawl_followers: { $exists: false } },
            { last_crawl_followers: { $lte: thirtyDaysAgo } }
          ]
        },
        {
          $or: [
            { last_mention_in_topic: { $gt: lastMentionInTopic } },
            {
              last_mention_in_topic: lastMentionInTopic,
              _id: { $gt: lastId }
            }
          ]
        }
      ]
    }
  },
  {
    $sort: {
      last_mention_in_topic: 1,
      _id: 1
    }
  },
  {
    $project: {
      _id: 1,
      platform: 1,
      last_mention_in_topic: 1,
      last_crawl_followes: 1
    }
  },
  {
    $limit: 1000
  }
])


// Câu lệnh tính tổng

db.identity_last_mentions.aggregate([
  {
    $match: {
      $and: [
        { platform: 7 },
        {
          $or: [
            { last_crawl_followers: { $exists: false } },
            { last_crawl_followers: { $lte: thirtyDaysAgo } }
          ]
        },
        {
          $or: [
            { last_mention_in_topic: { $gt: lastMentionInTopic } },
            {
              last_mention_in_topic: lastMentionInTopic,
              _id: { $gt: lastId }
            }
          ]
        }
      ]
    }
  },
  { $count: "total" }
])



db.identity_last_mentions.updateMany(
  {
    platform: 7,
    last_crawl_followers: { $exists: true }
  },
  {
    $set: { last_crawl_followers: null }
  }
)

use social_data;
db.identity_last_mentions.updateMany(
  {
    platform: 7,
    last_crawl_followers: { $exists: true }
  },
  {
    $unset: { last_crawl_followers: "" }
  }
)




### Những log cần phải thêm

- Nhờ Huy log ra thêm số lượng identites được load lên (Nếu log được thêm id nữa thì càng tốt)
- Những identity nào đã được cập nhật xuống thành công Solr, Redis, Mongo


## Những source Youtube cần phải check thêm

UCLVPfHxWFMOgHLtCW0VqoBQ
UCTzY_Cgz0JnL6aVNWbCYHiw
UCOFf208323whaKVLn6Yx0fA
UCqwHXI8DjYZM5lq-Ldnxjfw


{
  "_id": "UCxTYgnyy0sEoV3Ndr6XVdGQ",
  "last_mention_in_topic": {
    "$date": "2025-07-29T07:05:34.070Z"
  },
  "platform": 7,
}



 {
        "id":"UCLVPfHxWFMOgHLtCW0VqoBQ",
        "reply_next_crawl_time":"2025-03-13T10:37:07.865Z",
        "next_crawl_time":"2025-03-13T10:37:07.865Z",
        "domain":"youtube.com",
        "link":"youtube.com/channel/UCLVPfHxWFMOgHLtCW0VqoBQ",
        "platform":7,
        "updated_at":"2025-03-13T10:22:07.865Z",
        "id_social":"UCLVPfHxWFMOgHLtCW0VqoBQ",
        "subscriber_count": {"set": null},
        "fullname":"@KieuNguyen-xt6kn",
        "created_date":"2025-03-13T10:22:07.865Z",
        "repost_next_crawl_time":"2025-03-13T10:37:07.865Z"}

 {
        "id":"UCTzY_Cgz0JnL6aVNWbCYHiw",
        "reply_next_crawl_time":"2025-03-13T10:37:07.865Z",
        "next_crawl_time":"2025-03-13T10:37:07.865Z",
        "domain":"youtube.com",
        "link":"youtube.com/channel/UCTzY_Cgz0JnL6aVNWbCYHiw",
        "platform":7,
        "updated_at":"2025-03-13T10:22:07.865Z",
        "id_social":"UCTzY_Cgz0JnL6aVNWbCYHiw",
             "subscriber_count": {"set": null},
        "fullname":"@khienhoang2367",
        "created_date":"2025-03-13T10:22:07.865Z",
        "repost_next_crawl_time":"2025-03-13T10:37:07.865Z"}




// Case channel bị xóa

youtube.com/channel/UCrBcAkBD3U2bvvypI29cPgg
https://www.youtube.com/channel/UC2EWK1kdwE4F0Ycu0AOPVdQ

UC7BHduYWtULJxT2buC68EYg

UCrBcAkBD3U2bvvypI28cPgg


[{
  "_id": "UCrBcAkBD3U2bvvypI29cPgg",
  "last_mention_in_topic": {
    "$date": "2025-07-29T07:05:34.070Z"
  },
  "platform": 7,
}


{
  "_id": "UC2EWK1kdwE4F0Ycu0AOPVdQ",
  "last_mention_in_topic": {
    "$date": "2025-07-29T07:05:34.070Z"
  },
  "platform": 7,
}


{
  "_id": "UC7BHduYWtULJxT2buC68EYg",
  "last_mention_in_topic": {
    "$date": "2025-07-29T07:05:34.070Z"
  },
  "platform": 7,
},
{
  "_id": "UCSKPpO74W8E0d7jrG8K9Yzw",
  "last_mention_in_topic": {
    "$date": "2025-07-31T07:59:42.821Z"
  },
  "platform": 7
}


]



{
  "_id": "UCfKMTybh9hHX51Z8QDxBY9Q",
  "last_mention_in_topic": {
    "$date": "2025-07-31T07:59:42.821Z"
  },
  "platform": 7
}


 {
        "id":"UC7BHduYWtULJxT2buC68EYg",
        "language":1,
        "reply_next_crawl_time":"2025-03-13T10:37:07.865Z",
        "priority":1,
        "next_crawl_time":"2025-03-13T10:37:07.865Z",
        "domain":"youtube.com",
        "link":"youtube.com/channel/UC7BHduYWtULJxT2buC68EYg",
        "platform":7,
        "updated_at":"2025-06-20T16:52:44.344Z",
        "is_kol":true,
        "last_status":0,
        "id_social":"UC7BHduYWtULJxT2buC68EYg",
        "subscriber_count": {"set": null},
        "fullname":"@tanhoang791",
        "created_date":"2025-03-13T10:22:07.865Z",
        "repost_next_crawl_time":"2025-03-13T10:37:07.865Z"
  }




{
        "id":"UCrBcAkBD3U2bvvypI29cPgg",
        "language":1,
        "reply_next_crawl_time":"2025-03-13T10:36:56.836Z",
        "priority":1,
        "next_crawl_time":"2025-03-13T10:36:56.836Z",
        "domain":"youtube.com",
        "link": {"set":"youtube.com/channel/UCrBcAkBD3U2bvvypI29cPgg"},
        "platform":7,
        "updated_at":"2025-06-22T15:21:40.309Z",
        "is_kol":true,
        "last_status":0,
        "id_social":"UCrBcAkBD3U2bvvypI29cPgg",
        "fullname":"@thietphamthi4830cccc",
        "created_date":"2025-03-13T10:21:56.836Z",
        "repost_next_crawl_time":"2025-03-13T10:36:56.836Z"}

  {
        "id":"UClYUCB6tyZl50_7OcbgUHCA",
        "reply_next_crawl_time":"2025-06-25T08:25:33.371Z",
        "next_crawl_time":"2025-06-25T08:25:33.371Z",
        "domain":"youtube.com",
        "link":"youtube.com/channel/UClYUCB6tyZl50_7OcbgUHCA",
        "platform":7,
        "updated_at":"2025-06-25T08:10:33.371Z",
        "id_social":"UClYUCB6tyZl50_7OcbgUHCA",
        "subscriber_count":{"set": null},
        "fullname":"VẤN ĐỀ HÔM NAY",
        "created_date":"2025-06-25T08:10:28.980Z",
        "repost_next_crawl_time":"2025-06-25T08:25:33.371Z"}


 {
        "id":"UC2EWK1kdwE4F0Ycu0AOPVdQ",
        "language":1,
        "reply_next_crawl_time":"2025-03-13T10:37:07.865Z",
        "priority":1,
        "next_crawl_time":"2025-03-13T10:37:07.865Z",
        "domain":"youtube.com",
        "link":"youtube.com/channel/UC2EWK1kdwE4F0Ycu0AOPVdQ",
        "platform":7,
        "updated_at":"2025-06-20T12:41:28.959Z",
        "is_kol":true,
        "last_status":{"set": 0 },
        "id_social":"UC2EWK1kdwE4F0Ycu0AOPVdQ",
        "subscriber_count":null,
        "fullname":"@BichNguyen-xx7ry",
        "created_date":"2025-03-13T10:22:07.865Z",
        "repost_next_crawl_time":"2025-03-13T10:37:07.865Z"}



 {
        "id":"UCrBcAkBD3U2bvvypI29cPgg",
        "avatar":"https://yt3.ggpht.com/ytc/AIdro_lHSo7vIDgnLDzkXOnXsedsYU3bymEyNWJL1YTB_aSnppw=s88-c-k-c0x00ffffff-no-rj",
        "language":1,
        "reply_next_crawl_time":"2025-03-13T10:36:56.836Z",
        "priority":1,
        "next_crawl_time":"2025-03-13T10:36:56.836Z",
        "domain":"youtube.com",
        "link":"youtube.com/channel/UCrBcAkBD3U2bvvypI29cPgg",
        "platform":7,
        "updated_at":"2025-07-31T07:48:42.320Z",
        "is_kol":true,
        "last_status":0,
        "id_social":"UCrBcAkBD3U2bvvypI29cPgg",
        "subscriber_count":{"set": null},
        "fullname":"Thiết Phạm Thị",
        "created_date":"2025-03-13T10:21:56.836Z",
        "repost_next_crawl_time":"2025-03-13T10:36:56.836Z"
 }



{
            "id": "UCrBcAkBD3U2bvvypI29cPgg",
    "fullname": "@thietphamthi4830",
    "created_date": "2025-03-13T10:22:07.850Z",
}

{
    "id": "UCOmHUn--16B90oW2L6FRR3A",
    "fullname": "@BLACKPINK",
    "created_date": "2025-07-11T09:49:15.594Z",
}


 {
        "id":"UCOmHUn--16B90oW2L6FRR3A",
        "reply_next_crawl_time":"2025-07-11T09:47:22.369Z",
        "next_crawl_time":"2025-07-11T09:47:22.369Z",
        "domain":"youtube.com",
        "link":"youtube.com/channel/UCOmHUn--16B90oW2L6FRR3A",
        "platform":7,
        "updated_at":"2025-07-11T09:32:22.369Z",
        "last_status":0,
        "id_social":"UCOmHUn--16B90oW2L6FRR3A",
        "subscriber_count":{"set": null},
        "fullname":"BLACKPINK",
        "created_date":"2025-07-11T09:32:20.031Z",
        "repost_next_crawl_time":"2025-07-11T09:47:22.369Z"}


UCOmHUn--16B90oW2L6FRR3A



Những records cần check thêm


// Update bình thường
{
  "_id": "UCfKMTybh9hHX51Z8QDxBY9Q",
  "last_mention_in_topic": {
    "$date": "2025-07-31T07:59:42.821Z"
  },
  "platform": 7
}


{
    "id": "UCfKMTybh9hHX51Z8QDxBY9Q",
    "fullname": "@zenotv219",
    "created_date": "2025-07-11T09:49:15.594Z"
        "subscriber_count": 982000000000
}



{
        "id":"UCfKMTybh9hHX51Z8QDxBY9Q",
        "reply_next_crawl_time":"2025-08-01T07:49:00.337Z",
        "next_crawl_time":"2025-08-01T07:49:00.337Z",
        "domain":"youtube.com",
        "link":"youtube.com/channel/UCfKMTybh9hHX51Z8QDxBY9Q",
        "platform":7,
        "updated_at":"2025-08-01T07:34:00.337Z",
        "last_status":0,
        "id_social":"UCfKMTybh9hHX51Z8QDxBY9Q",
        "fullname":"Zeno tv",
        "created_date":"2025-08-01T07:33:58.306Z",
        "repost_next_crawl_time":"2025-08-01T07:49:00.337Z"}



// Update mà không có trên Redis
{
  "_id": "UCJVslw0KrVj4oaMeisOrveA",
  "last_mention_in_topic": {
    "$date": "2025-07-31T07:59:42.821Z"
  },
  "platform": 7
}





{
        "id":"UCJVslw0KrVj4oaMeisOrveA",
        "reply_next_crawl_time":"2025-08-01T03:24:56.462Z",
        "next_crawl_time":"2025-08-01T03:24:56.462Z",
        "domain":"youtube.com",
        "link":"youtube.com/channel/UCJVslw0KrVj4oaMeisOrveA",
        "platform":7,
        "updated_at":"2025-08-01T03:09:56.462Z",
        "last_status":0,
        "id_social":"UCJVslw0KrVj4oaMeisOrveA",
        "fullname":"Nguyễn Hùng - Topic",
        "subscriber_count": 44444444,
        "created_date":"2025-08-01T03:09:49.844Z",
        "repost_next_crawl_time":"2025-08-01T03:24:56.462Z"}


// Hiện tại nếu redis đã có subscriber_count thì đã cập nhật tiếp tục được 

{
    "id": "UCgHRtKZViPr1ePeg1uMOE6Q",
    "fullname": "BigDataPhim",
    "created_date": "2025-07-11T09:49:15.594Z"
}


{
  "_id": "UCgHRtKZViPr1ePeg1uMOE6Q",
  "last_mention_in_topic": {
    "$date": "2025-07-31T07:59:42.821Z"
  },
  "platform": 7
}









### Data mẫu để check trên staging 



youtube-ynmpdp-5136-staging-crawler-empty-container
kubectl get pods -n crawler-staging | grep youtube-ynmpdp-5136-staging-crawler-empty-container
kubectl exec -it youtube-ynmpdp-5136-staging-crawler-empty-container-845df9gft2q -n crawler-staging -- sh
kubectl config use-context lamtt-k8s-ovh



script chạy:
node services.js
node scripts/youtubeV2/get_latest_potential_channels_info.js

#### Câu lệnh kết nối DB staging bằng mongosh
mongosh mongodb://qc_lamtt:hk233ASNOFe4ahs@54.39.48.235:27017/socialheat_staging?authSource=socialheat_staging

use your_database_name; // ví dụ: use socialheat_staging

youtube-ynmpdp-5136-staging-crawler-empty-container
kubectl get pods -n crawler-staging | grep youtube-ynmpdp-5136-staging-crawler-empty-container
kubectl exec -it youtube-ynmpdp-5136-staging-crawler-empty-container-787bc6blzgd -n crawler-staging -- sh
kubectl config use-context lamtt-k8s-ovh



script chạy:
node services.js
node scripts/youtubeV2/get_latest_potential_channels_info.js

db.createCollection("identity_last_mentions");

 {
  "_id": "UCOmHUn--16B90oW2L6FRR3A",
  "last_mention_in_topic": {
    "$date": "2025-07-31T07:59:42.821Z"
  },
  "platform": 7
}

{    "fullname": "Pupe Signature",    "created_date": "2024-06-24T08:54:02.223Z"}


{
    "id": "UCzCWSfs-gfx8nT2yRulQ1QA",
    "fullname": "@Lam Test",
    "created_date": "2025-07-11T09:49:15.594Z"
}


{
        "id":"UCOmHUn--16B90oW2L6FRR3A",
        "reply_next_crawl_time":"2025-07-11T09:47:22.369Z",
        "next_crawl_time":"2025-07-11T09:47:22.369Z",
        "domain":"youtube.com",
        "link":"youtube.com/channel/UCOmHUn--16B90oW2L6FRR3A",
        "platform":7,
        "updated_at":"2025-07-11T09:32:22.369Z",
        "last_status":0,
        "id_social":"UCOmHUn--16B90oW2L6FRR3A",
        "fullname":"BLACKPINK",
        "created_date":"2025-07-11T09:32:20.031Z",
        "repost_next_crawl_time":"2025-07-11T09:47:22.369Z"}