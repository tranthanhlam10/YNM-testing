# YNMPECA-9240 - Cải thiện cơ chế đánh cờ Mall (`official = true`)

## 1. Thông tin task

- Jira: [YNMPECA-9240](https://jira.younetco.com/browse/YNMPECA-9240)
- Summary: `[DATA CRAWLING] - Improve cơ chế đánh cờ Mall (official = true) cho tất cả các luồng crawl`
- Priority: `Major (P3)`
- Trạng thái tại thời điểm tổng hợp: `Testing`
- Due date: `2026-06-16`
- Wiki rule tổng:
  [Mô tả cách cập nhật shop Mall từ các luồng crawl](https://wiki.younetco.com/pages/viewpage.action?pageId=310444173)

## 2. Vấn đề và yêu cầu

### 2.1. Vấn đề

Một số Shop/Product Item đã được xác định là Mall (`official = 1`) trong
Solr. Tuy nhiên, sau khi được crawl lại, message mới có `official = 0`,
`false` hoặc `null` và ghi đè dữ liệu cũ. Kết quả là shop bị hạ cấp từ
Mall thành shop thường.

### 2.2. Business rule

Field `official` chỉ được phép thay đổi theo chiều:

```text
0/false/null -> 1/true
1/true       -> luôn giữ 1/true
```

Không được phép:

```text
1/true -> 0/false/null
```

Quy ước xử lý:

| Input mới | Cách xử lý |
| --- | --- |
| `official = 1` hoặc `true` | Cập nhật DB thành `1` |
| `official = 0`, `false` hoặc `null` | Không cập nhật field `official` |
| Message không có field `official` | Không cập nhật field `official` |

`null` tại output của Resolver có nghĩa là không có thông tin mới để nâng
cấp Mall. Giá trị này không được biến thành lệnh set `official = null`
trong DB.

## 3. Phạm vi thay đổi

### 3.1. Crawling Loader

Bổ sung field `official` lấy từ dữ liệu hiện tại trong Solr vào source
message của các luồng:

1. Crawl PI Detail.
2. Crawl PI Detail Batch.
3. Crawl Shop Detail/Shop Info.
4. Crawl PI By Shop.

Mục đích là để Crawler và Resolver biết Shop/PI trước khi crawl đã là Mall
hay chưa.

### 3.2. PI Resolver

Resolver consume queue:

```text
cl.eca.product_items_crawled_sources
```

Sau đó tách dữ liệu sang các queue:

```text
cl.eca.product_items
cl.eca.shops
cl.eca.product_item_histories
cl.eca.ranking_product_items
eca_category
```

Rule theo `crawler_type`:

| Luồng | Source hiện tại | Dữ liệu vừa crawl | Output |
| --- | --- | --- | --- |
| PI By Shop | Shop `official = 1` | Bất kỳ | PI `official = 1` |
| PI By Shop | Shop không Mall | PI `official = 1` | PI và Shop `official = 1` |
| PI By Shop | Shop không Mall | PI `0/false/null` | PI và Shop `official = null` |
| PI By Category | Không có source Mall | PI `official = 1` | PI và Shop `official = 1` |
| PI By Category | Không có source Mall | PI `0/false/null` | PI và Shop `official = null` |
| PI Detail | PI source `official = 1` | Bất kỳ | Duy trì Mall cho PI/Shop liên quan |
| PI Detail | PI source không Mall | PI crawl `official = 1` | PI và Shop `official = 1` |
| PI Detail | PI source không Mall | PI crawl `0/false/null` | PI và Shop `official = null` |

### 3.3. Data Pusher

Áp dụng cho các pusher:

- Product Item.
- Shop.
- Ranking Product Item.
- Product Item Weekly.
- Product Item Monthly.
- Các output liên quan khác được route từ Resolver.

Mapping mong đợi:

```javascript
official: (item) => item?.official == 1 ? 1 : null
```

Khi mapping trả về `null`, repository/upsert không được ghi đè field
`official` đang có trong DB.

### 3.4. Source Updater

Áp dụng cùng rule với Data Pusher cho:

- Product Item Updater.
- Shop Updater.

Source Updater vẫn phải cập nhật trạng thái crawl và release source khỏi
Redis như flow cũ. Thay đổi chỉ nằm ở cách map và cập nhật `official`.

## 4. Sơ đồ message và queue

### 4.1. Shop Detail

```text
Solr shops
  -> Crawling Loader
  -> eca_{platform}_shop_info_crawling
  -> Shop crawler
  -> cl.eca.shop_finish_sources
  -> Source Updater
  -> Solr shops
```

Queue theo platform:

```text
eca_shopee_shop_info_crawling
eca_tiktok_shop_info_crawling
cl.eca.shop_finish_sources
```

### 4.2. Các luồng Product Item

```text
Solr source
  -> Crawling Loader
  -> Platform crawling queue
  -> Crawler
  -> cl.eca.product_items_crawled_sources
  -> Resolver
  -> cl.eca.product_items
  -> cl.eca.shops
  -> cl.eca.ranking_product_items
  -> cl.eca.product_item_histories
  -> Data Pusher
  -> Solr/TimescaleDB
```

## 5. Message mẫu

> Lưu ý: Sample trong các wiki cũ vẫn có `official = 0`. Sau thay đổi này,
> `0/false/null` có thể tồn tại trong raw crawler message, nhưng không được
> dùng để hạ cấp field `official` trong Solr/TimescaleDB.

### 5.1. Shop Detail - Loader output

Queue:

```text
eca_shopee_shop_info_crawling
```

```json
{
  "id": "shopee!102090825",
  "shop_name": "sample-shop",
  "shop_social_id": "102090825",
  "link": "https://shopee.vn/shop/102090825",
  "source_id": "shopee.vn",
  "official": 1,
  "createdBy": "ShopeeShopInfoCrawlingLoader",
  "platform": "shopee",
  "crawler_type": "SHOP_DETAIL",
  "category": "web",
  "domain": "vn",
  "created_by": "ShopeeShopInfoCrawlingLoader"
}
```

Điểm cần kiểm tra: Loader phải load field `official` nếu source trong Solr
có field này.

### 5.2. Shop Detail - Crawler output là Mall

Queue:

```text
cl.eca.shop_finish_sources
```

```json
[
  {
    "id": "shopee!102090825",
    "failed_type": 0,
    "count_failed": 0,
    "status": 1,
    "shop_status": 1,
    "official": 1,
    "shop_name": {
      "set": "sample-shop"
    },
    "created_by": "ShopeeShopInfoCrawlingLoader"
  }
]
```

Kết quả mong đợi: Source Updater cập nhật `official = 1`.

### 5.3. Shop Detail - Crawler output không xác nhận Mall

Raw crawler có thể trả:

```json
[
  {
    "id": "shopee!102090825",
    "official": 0,
    "created_by": "ShopeeShopInfoCrawlingLoader"
  }
]
```

Kết quả mong đợi khi cập nhật DB:

```text
Nếu Solr đang official = 1 -> vẫn giữ official = 1.
Nếu Solr đang official = 0/null -> giữ nguyên.
```

Updater không được tạo atomic update dạng:

```json
{
  "official": {
    "set": 0
  }
}
```

### 5.4. PI By Shop - Raw crawler input cho Resolver

Queue:

```text
cl.eca.product_items_crawled_sources
```

```json
[
  {
    "code": 200,
    "data": [
      {
        "social_id": "74021317_1",
        "title": "Sample product",
        "shop_social_id": 1,
        "shop_id": "tiki!1",
        "source_id": "tiki.vn",
        "official": 1,
        "crawled_date": "2026-06-12T00:00:00.000Z"
      }
    ],
    "source": {
      "id": "tiki!1",
      "source_id": "tiki.vn",
      "official": 0,
      "crawler_type": "PI_BY_SHOP",
      "created_by": "TikiProductItemByShopCrawlingLoader"
    }
  }
]
```

Vì PI crawl được có `official = 1`, Resolver phải push:

```json
{
  "product_item_output": {
    "product_item_id": "tiki_74021317_1",
    "shop_id": "tiki!1",
    "official": 1
  },
  "shop_output": {
    "id": "tiki!1",
    "official": 1
  }
}
```

### 5.5. PI By Shop - Source đã là Mall, raw PI không Mall

Input rút gọn:

```json
{
  "data": [
    {
      "shop_id": "shopee!100001",
      "official": false
    }
  ],
  "source": {
    "id": "shopee!100001",
    "official": 1,
    "crawler_type": "PI_BY_SHOP"
  }
}
```

Output Resolver mong đợi cho PI:

```json
{
  "shop_id": "shopee!100001",
  "official": 1
}
```

### 5.6. Resolver output khi không có thông tin Mall

Input:

```json
{
  "data": [
    {
      "shop_id": "shopee!100001",
      "official": false
    }
  ],
  "source": {
    "id": "shopee!100001",
    "official": 0,
    "crawler_type": "PI_BY_SHOP"
  }
}
```

Output mong đợi:

```json
{
  "product_item": {
    "official": null
  },
  "shop": {
    "official": null
  }
}
```

Data Pusher phải bỏ qua field `official`, không ghi `null` hoặc `0` vào
DB.

### 5.7. Data Pusher input

Queue:

```text
cl.eca.product_items
```

Message nâng cấp Mall:

```json
[
  {
    "product_item_id": "shopee_123456",
    "shop_id": "shopee!100001",
    "source_id": "shopee.vn",
    "official": 1
  }
]
```

Solr atomic update mong đợi:

```json
{
  "id": "shopee_123456",
  "official": {
    "set": 1
  }
}
```

Message không xác nhận Mall:

```json
[
  {
    "product_item_id": "shopee_123456",
    "shop_id": "shopee!100001",
    "source_id": "shopee.vn",
    "official": null
  }
]
```

Kết quả mong đợi: Atomic update không có field `official`.

## 6. Deployment testing

### 6.1. Việt Nam

Namespace:

```text
crawler-testing
```

| Thành phần | Deployment |
| --- | --- |
| Shopee Loader | `shopee-ynm-cl-eca-crawling-loader-service-testing` |
| Tiki Loader | `tiki-ynm-cl-eca-crawling-loader-service-testing` |
| Lazada Loader | Theo convention `{platform}-ynm-cl-eca-crawling-loader-service-testing` |
| TikTok Loader | Theo convention `{platform}-ynm-cl-eca-crawling-loader-service-testing` |
| Resolver | `cl-team-ynm-cl-eca-product-item-crawler-service-testing` |
| Data Pusher | `cl-team-ynm-cl-eca-data-pusher-service-testing` |
| Source Updater | `cl-team-ynm-cl-eca-source-updater-service-testing` |
| Shopee Shop Detail crawler | `ynmpeca-ynmpeca-7250-shopee-shop-info-testing` |

Liên kết K8s:

- [Shopee Loader](https://k8s-local.younetmedia.com/#/deployment/crawler-testing/shopee-ynm-cl-eca-crawling-loader-service-testing?namespace=crawler-testing)
- [Tiki Loader](https://k8s-local.younetmedia.com/#/deployment/crawler-testing/tiki-ynm-cl-eca-crawling-loader-service-testing?namespace=crawler-testing)
- [Resolver](https://k8s-local.younetmedia.com/#/deployment/crawler-testing/cl-team-ynm-cl-eca-product-item-crawler-service-testing?namespace=crawler-testing)
- [Data Pusher](https://k8s-local.younetmedia.com/#/deployment/crawler-testing/cl-team-ynm-cl-eca-data-pusher-service-testing?namespace=crawler-testing)
- [Source Updater](https://k8s-local.younetmedia.com/#/deployment/crawler-testing/cl-team-ynm-cl-eca-source-updater-service-testing?namespace=crawler-testing)
- [Shopee Shop Detail crawler](https://k8s-local.younetmedia.com/#/deployment/crawler-testing/ynmpeca-ynmpeca-7250-shopee-shop-info-testing?namespace=crawler-testing)

Các config cần kiểm tra:

```text
SHOP_INFO_CRAWLING_LOADER_ENABLE=true
PRODUCT_ITEM_BY_SHOP_CRAWLING_LOADER_ENABLE=true
RESOLVER_ENABLE=true
PRODUCT_ITEM_PUSHER_ENABLE=true
SHOP_PUSHER_ENABLE=true
```

### 6.2. Thái Lan

Phạm vi task yêu cầu test Shopee, Lazada và TikTok tại Thái Lan. Tên
deployment TH không được ghi đầy đủ trong task chính. Các design wiki cho
thấy deployment thường có prefix/suffix theo domain `th`.

Cần xác nhận tên deployment đang active trên namespace Thai testing trước
khi chạy, không nên suy diễn chỉ từ convention.

### 6.3. Công cụ quan sát

- RabbitMQ testing:
  [rabbitmq-clusters-testing.younetmedia.com](https://rabbitmq-clusters-testing.younetmedia.com/)
- TimescaleDB browser được ghi trong comment Jira:
  [192.168.1.102:5050](http://192.168.1.102:5050/browser/)
- Các Solr collection cần kiểm tra:
  - `shops`
  - `product_items`
  - `product_item_ranking`
- Timescale output:
  - Queue `cl.eca.product_item_histories`
  - Bảng/collection tương ứng của Product Item History.

## 7. Phạm vi test theo Jira

- Việt Nam:
  - Shopee.
  - Lazada.
  - Tiki.
  - TikTok.
- Thái Lan:
  - Shopee.
  - Lazada.
  - TikTok.
- Mỗi flow chỉ cần test một platform đại diện.
- Ưu tiên test `Shop Detail/Shop Info` trước.
- Khi test Resolver và Data Pusher, tập trung:
  - `product_items`.
  - `shops`.
  - `product_item_ranking`.
  - Timescale qua `product_item_histories`.
- Không cần test `category`.

## 8. Test matrix tối thiểu

| DB trước khi test | Message mới | Kết quả mong đợi |
| --- | --- | --- |
| `official = 1` | `official = 0` | DB vẫn bằng `1` |
| `official = 1` | `official = false` | DB vẫn bằng `1` |
| `official = 1` | `official = null` | DB vẫn bằng `1` |
| `official = 1` | Không có field | DB vẫn bằng `1` |
| `official = 0` | `official = 1` | DB thành `1` |
| `official = null` | `official = 1` | DB thành `1` |
| `official = 0` | `official = 0/null` | DB giữ nguyên |

Ngoài giá trị DB, cần kiểm tra message tại từng chặng:

1. Loader có load `official` từ source.
2. Raw crawler giữ đúng `source.official` và `data[].official`.
3. Resolver set `1` đúng rule theo `crawler_type`.
4. Resolver không tạo output `official = 0`.
5. Pusher/Updater bỏ qua `official` nếu input không bằng `1`.
6. Record Mall cũ không bị hạ cấp sau khi chạy hết pipeline.

## 9. Tài liệu tham khảo

- [Jira YNMPECA-9240](https://jira.younetco.com/browse/YNMPECA-9240)
- [Wiki rule Mall tổng](https://wiki.younetco.com/pages/viewpage.action?pageId=310444173)
- [PI Resolver design](https://wiki.younetco.com/pages/viewpage.action?pageId=81558078)
- [Data Pusher design](https://wiki.younetco.com/pages/viewpage.action?pageId=75799415)
- [Source Updater design](https://wiki.younetco.com/pages/viewpage.action?pageId=75799413)
- [Crawling Loader design](https://wiki.younetco.com/pages/viewpage.action?pageId=75799362)
- [Shop Info Loader](https://wiki.younetco.com/pages/viewpage.action?pageId=95227813)
- [PI By Shop Loader](https://wiki.younetco.com/pages/viewpage.action?pageId=81546805)
- [Shopee Shop Info dùng cookie](https://wiki.younetco.com/pages/viewpage.action?pageId=95233019)
- [Crawl Shopee Shop Info](https://wiki.younetco.com/pages/viewpage.action?pageId=95230519)
- [TikTok Shop Info](https://wiki.younetco.com/pages/viewpage.action?pageId=81532671)
- [Tiki PI By Shop qua Resolver/Pusher](https://wiki.younetco.com/pages/viewpage.action?pageId=103481607)
