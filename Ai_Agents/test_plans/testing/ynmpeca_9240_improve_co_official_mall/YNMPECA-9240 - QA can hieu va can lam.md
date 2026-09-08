# YNMPECA-9240 - QA cần hiểu gì và cần làm gì?

## 1. Tóm tắt task trong một câu

Task này sửa cơ chế cập nhật cờ Mall để dữ liệu chỉ được đi theo một chiều:

```text
Shop/PI thường hoặc chưa xác định  ->  Shop/PI Mall
0 / false / null                  ->  1 / true
```

Một Shop hoặc Product Item (PI) đã là Mall thì không được bị bất kỳ lần
crawl, message đến trễ, retry hoặc service downstream nào cập nhật ngược
về `0`, `false` hoặc `null`.

Đây là task bảo vệ tính toàn vẹn dữ liệu, không phải task yêu cầu crawler
luôn nhận diện đúng Mall trong mọi trường hợp.

## 2. Vấn đề cũ là gì?

Ví dụ:

1. Trong Solr, Shop A đang có `official = 1`.
2. Một lần crawl mới không bóc tách được cờ Mall và trả
   `official = false`.
3. Message tiếp tục đi qua Resolver, Data Pusher hoặc Source Updater.
4. Giá trị `false` bị ghi xuống DB.
5. Shop A bị hạ từ Mall thành shop thường.

Task này phải chặn bước 4 ở tất cả các đường có thể cập nhật field
`official`.

## 3. Điều quan trọng nhất cần nhớ

### 3.1. Bảng quyết định cuối cùng tại database

| Giá trị trong DB trước test | Giá trị message mới | Kết quả DB |
| --- | --- | --- |
| `1` | `1` | Giữ `1` |
| `1` | `0` hoặc `false` | Giữ `1` |
| `1` | `null` | Giữ `1` |
| `1` | Không có field `official` | Giữ `1` |
| `0` hoặc `null` | `1` hoặc `true` | Cập nhật thành `1` |
| `0` hoặc `null` | `0`, `false`, `null` hoặc thiếu field | Giữ nguyên |

Có thể ghi nhớ bằng công thức:

```text
official cuối cùng = DB hiện tại OR thông tin Mall mới crawl được
```

### 3.2. `null` có hai ý nghĩa khác nhau

Ở output của Resolver:

```json
{
  "official": null
}
```

Giá trị này có nghĩa là:

```text
Không có bằng chứng mới để nâng thành Mall.
```

Nó không có nghĩa là:

```text
Hãy set official trong DB thành null.
```

Data Pusher và Source Updater phải loại field này khỏi câu lệnh update.

### 3.3. Raw crawler trả `false` chưa chắc là bug

Crawler vẫn có thể trả `false`, `0` hoặc `null`. Điều cần kiểm tra là:

- Resolver có áp dụng đúng rule để tạo output hay không.
- Pusher/Updater có bỏ qua giá trị không phải `1` hay không.
- DB cuối cùng có giữ được Mall hay không.

Không nên Fail test chỉ vì raw crawler message có `official = false`.

## 4. Phân biệt vai trò của từng thành phần

| Thành phần | Vai trò trong task | QA cần kiểm tra |
| --- | --- | --- |
| Crawling Loader | Đọc source từ Solr và tạo message để đi crawl | Message phải mang theo `official` hiện tại nếu source có field này |
| Crawler | Crawl dữ liệu mới từ platform | Giữ được cả thông tin source và kết quả `official` vừa bóc tách |
| PI Resolver | Áp dụng business rule theo `crawler_type`, sau đó tạo message PI/Shop/Ranking/History | Chỉ tạo `official = 1` khi đủ điều kiện; nếu không thì output `null`, không output lệnh hạ Mall |
| Data Pusher | Consume message kết quả và ghi PI/Shop/Ranking/PIW/PIM xuống DB | Chỉ map `official` xuống DB khi giá trị bằng `1` |
| Source Updater | Cập nhật source sau khi crawl xong và release Redis lock | Cùng rule với Pusher; DB thành công rồi mới release đúng lock |

Điểm dễ nhầm:

- Loader không phải thành phần quyết định nâng/hạ Mall trong DB.
- Resolver quyết định giá trị output nhưng không trực tiếp ghi Solr.
- Data Pusher ghi dữ liệu đã resolve, không release source lock.
- Source Updater vừa cập nhật source vừa release Redis lock dựa vào
  `created_by`.

## 5. Sơ đồ luồng cần hình dung

### 5.1. Shop Detail/Shop Info

```text
Solr shops
  -> Crawling Loader
  -> eca_{platform}_shop_info_crawling
  -> Shop crawler
  -> cl.eca.shop_finish_sources
  -> Source Updater
  -> Solr shops
  -> release Redis lock
```

Luồng này không đi qua PI Resolver và Data Pusher.

### 5.2. Các luồng Product Item

```text
Solr source
  -> Crawling Loader
  -> Platform crawling queue
  -> Crawler
  -> cl.eca.product_items_crawled_sources
  -> PI Resolver
  -> cl.eca.product_items
  -> cl.eca.shops
  -> cl.eca.ranking_product_items
  -> cl.eca.product_item_histories
  -> Data Pusher
  -> Solr / TimescaleDB
```

Mỗi chặng đều cần lưu evidence để biết lỗi bắt đầu từ service nào.

## 6. Rule riêng theo từng flow

### 6.1. Crawl PI By Shop

Resolver có hai nguồn thông tin:

- `source.official`: trạng thái Mall hiện tại của Shop đang được load đi
  crawl.
- `data[].official`: trạng thái Mall vừa bóc tách được từ từng PI.

Rule:

| Shop source | PI vừa crawl | Output PI | Output Shop |
| --- | --- | --- | --- |
| `1` | Bất kỳ | `1` | Không được tạo giá trị hạ Mall |
| Không phải `1` | `1` | `1` | `1` |
| Không phải `1` | `0/false/null` | `null` | `null` |

Ý nghĩa nghiệp vụ:

- Nếu Shop đã là Mall, các PI của Shop đó phải được coi là Mall.
- Nếu Shop chưa là Mall nhưng crawl thấy một PI Mall, nâng cả PI và Shop.
- Nếu không tìm thấy bằng chứng Mall, không thay đổi trạng thái cũ.

### 6.2. Crawl PI By Category

Flow này không có Shop Mall source để làm căn cứ. Resolver dựa vào từng PI:

| PI vừa crawl | Output PI | Output Shop |
| --- | --- | --- |
| `1` | `1` | `1` |
| `0/false/null` | `null` | `null` |

Theo Jira, QA không cần kiểm tra queue/category DB. Tuy nhiên, rule tạo
message PI và Shop vẫn phải đúng nếu dùng flow này làm dữ liệu đại diện.

### 6.3. Crawl PI Detail

Resolver có:

- `source.official`: trạng thái hiện tại của PI đang đi crawl.
- `data[].official`: trạng thái vừa crawl được.

Rule:

| PI source | PI vừa crawl | Kết quả bắt buộc |
| --- | --- | --- |
| `1` | Bất kỳ | Shop liên quan phải được giữ/nâng thành Mall; PI trong DB không được bị hạ |
| Không phải `1` | `1` | PI và Shop thành `1` |
| Không phải `1` | `0/false/null` | PI và Shop giữ nguyên |

### 6.4. Crawl Shop Detail/Shop Info

| Shop source trong DB | Kết quả crawl mới | Kết quả DB |
| --- | --- | --- |
| `1` | Bất kỳ | Giữ `1` |
| Không phải `1` | `1` | Nâng thành `1` |
| Không phải `1` | `0/false/null` | Giữ nguyên |

Đây là flow được yêu cầu ưu tiên test trước.

## 7. Chính xác task đã sửa ở đâu?

### 7.1. Loader

Bổ sung field `official` vào source message của bốn flow:

1. PI Detail.
2. PI Detail Batch.
3. Shop Detail/Shop Info.
4. PI By Shop.

Nếu Loader không truyền field này, Resolver/Crawler không biết source cũ
đã là Mall và có thể áp dụng sai rule.

### 7.2. Resolver

Phân loại message theo `crawler_type`:

```text
PI_BY_SHOP
PI_BY_CATE
PI_DETAIL
```

Sau đó tính lại `official` cho PI và Shop:

- Có bằng chứng Mall: output `1`.
- Không có bằng chứng Mall: output `null`.
- Không được output `0/false` như một lệnh hạ Mall.

### 7.3. Data Pusher và Source Updater

Rule mapping kỹ thuật:

```javascript
official: (item) => item?.official == 1 ? 1 : null
```

Mapping trả `null` thì repository/upsert phải bỏ qua field `official`.

Lưu ý schema có thể khác nhau theo service:

- Data Pusher thường nhận giá trị trực tiếp: `"official": 1`.
- Source Updater có thể nhận atomic object:
  `"official": {"set": 1}`.

QA cần đối chiếu contract thực tế của queue đang test. Dù input dùng dạng
nào, kết quả vẫn phải tuân theo rule một chiều: chỉ chấp nhận cập nhật lên
`1`; `set:0` hoặc `set:null` phải bị loại khỏi update.

Atomic update gửi tới Solr không được chứa:

```json
{
  "official": {
    "set": 0
  }
}
```

hoặc:

```json
{
  "official": {
    "set": null
  }
}
```

## 8. QA cần làm gì?

### Bước 1: Chốt phạm vi và môi trường trước khi chạy

Xác nhận:

- Deployment nào đang chứa build của task.
- Loader/Resolver/Pusher/Updater cần test đã `ENABLE=true`.
- Queue prefix của VN và TH.
- Tên deployment TH đang active.
- Platform đại diện cho từng flow.
- Có quyền xem RabbitMQ, Solr, TimescaleDB, Redis DB1 và K8s log.

Không nên bắt đầu E2E khi chưa chắc consumer nào đang bật vì message có
thể bị service khác consume trước khi QA lấy evidence.

### Bước 2: Chuẩn bị hai nhóm dữ liệu nền

Nhóm A - đã là Mall:

```json
{
  "shop_id": "qa_mall_shop_001",
  "product_item_id": "qa_mall_pi_001",
  "official": 1
}
```

Nhóm B - chưa là Mall:

```json
{
  "shop_id": "qa_normal_shop_001",
  "product_item_id": "qa_normal_pi_001",
  "official": 0
}
```

Mỗi record cần có ID riêng, dễ tìm trong queue/log và không trùng dữ liệu
của QA khác.

### Bước 3: Test từng service độc lập trước

Thứ tự đề xuất:

1. Loader: query source và kiểm tra message có đúng `official`.
2. Resolver: publish trực tiếp payload vào input queue và kiểm tra các
   output queue.
3. Data Pusher: publish trực tiếp message `1/0/null/missing` và query DB.
4. Source Updater: publish finish message, query DB và kiểm tra Redis.

Cách này giúp xác định lỗi chính xác hơn so với chỉ chạy full flow.

### Bước 4: Chạy matrix giá trị bắt buộc

Ít nhất phải chạy:

```text
DB=1 + message=0       -> DB=1
DB=1 + message=false   -> DB=1
DB=1 + message=null    -> DB=1
DB=1 + missing field   -> DB=1
DB=0 + message=1       -> DB=1
DB=null + message=1    -> DB=1
DB=0 + message=0/null  -> DB không đổi
```

Áp dụng cho:

- `shops`
- `product_items`
- `product_item_ranking`
- PI Weekly/Monthly nếu consumer được bật
- Product Item History/Timescale theo phạm vi xác nhận

### Bước 5: Chạy E2E theo flow

Ưu tiên:

1. Shop Detail/Shop Info.
2. PI By Shop.
3. PI Detail.
4. PI Detail Batch.
5. Cross-region VN/TH.

Mỗi E2E phải chứng minh được:

- Loader lấy đúng source.
- Message raw chứa đúng dữ liệu source và crawler.
- Resolver output đúng rule.
- Pusher/Updater không tạo update hạ Mall.
- DB cuối cùng đúng.
- Queue được ack, không có error ngoài dự kiến.
- Redis lock được release đúng thời điểm đối với Source Updater.

### Bước 6: Test rủi ro kỹ thuật

Các case quan trọng:

- Batch ở boundary `99/100/101` khi batch size là 100.
- Hai message cùng ID có `official=1` và `official=0` đến đồng thời.
- Event đến đảo thứ tự hoặc được replay.
- DB timeout/HTTP 503 và retry.
- Restart service giữa lúc xử lý.
- Thiếu hoặc sai `created_by`.
- `official` sai kiểu: chuỗi, object, `2`, `-1`.
- Queue VN và TH không consume/ghi chéo database.

Kết quả cuối cùng vẫn phải bảo đảm: record từng nhận `official=1` không
bao giờ quay về trạng thái không phải Mall.

## 9. Điểm cần quan sát và evidence phải lưu

| Chặng | Evidence |
| --- | --- |
| Trước test | Query Solr/Timescale thể hiện ID và `official` ban đầu |
| Loader output | Screenshot/export message có `source.official` |
| Raw crawler output | `source`, `data[]`, `crawler_type`, correlation ID |
| Resolver output | Message tại PI/Shop/Ranking/History queue |
| Trước khi ghi DB | Mapping hoặc atomic update payload nếu log có hỗ trợ |
| Sau test | Query DB cùng ID, chứng minh giá trị cuối |
| Updater | Redis member trước và sau khi DB update |
| Error handling | Retry count, error log và DLQ nếu có |

Không chỉ chụp DB sau test. Nếu DB sai mà không có evidence từng chặng,
QA sẽ khó xác định bug thuộc Loader, Resolver hay Pusher/Updater.

## 10. Cách khoanh vùng bug nhanh

| Hiện tượng | Thành phần cần kiểm tra trước |
| --- | --- |
| Source trong Solr là `1`, nhưng message đi crawl thiếu `official` | Loader |
| Raw message đúng nhưng PI/Shop output sai | Resolver |
| Resolver output `null`, DB bị set thành null/0 | Data Pusher |
| Finish message có `set:0`, DB Mall bị hạ | Source Updater |
| DB update thành công nhưng source không được crawl lại | Redis release hoặc `created_by` của Source Updater |
| Message bị mất sau lỗi DB | Retry/DLQ của Pusher hoặc Updater |
| VN message ghi sang TH | Queue prefix, deployment domain hoặc DB connection |

## 11. Điều kiện Pass của task

Task chỉ nên được kết luận Pass khi thỏa tất cả:

- Loader của các flow trong scope truyền được `official` hiện tại.
- Resolver áp dụng đúng rule theo từng `crawler_type`.
- Resolver không tạo lệnh hạ Mall.
- Pusher/Updater chỉ ghi `official` khi giá trị bằng `1`.
- DB đang `official=1` vẫn giữ `1` sau các input `0/false/null/missing`.
- DB chưa Mall được nâng thành `1` khi có bằng chứng Mall mới.
- Các field khác vẫn cập nhật bình thường khi `official` bị bỏ qua.
- Updater không release Redis lock trước khi DB update thành công.
- Retry, batch và concurrency không làm thay đổi kết quả cuối.
- VN và TH dùng đúng queue/database của từng vùng.

## 12. Phạm vi hiện tại theo Jira

- Việt Nam: Shopee, Lazada, Tiki, TikTok.
- Thái Lan: Shopee, Lazada, TikTok.
- Mỗi flow chỉ cần chọn một platform đại diện.
- Ưu tiên Shop Detail/Shop Info.
- Khi kiểm tra Resolver và Data Pusher, tập trung:
  - `product_items`
  - `shops`
  - `product_item_ranking`
  - Timescale qua `product_item_histories`
- Không cần kiểm tra category DB/queue như một đầu ra độc lập.

## 13. Các điểm còn mâu thuẫn hoặc cần Dev/BA xác nhận

### 13.1. Platform của Shop Detail

Jira nêu phạm vi quốc gia gồm nhiều platform, nhưng wiki Shop Info Loader
V1.1 ghi flow mới chỉ áp dụng Shopee và TikTok; Tiki/Lazada vẫn chạy script
cũ.

**Need Confirm:** Shop Detail của Tiki/Lazada có thuộc build này không, hay
chỉ cần test Shop Detail trên Shopee/TikTok?

### 13.2. Product Item History/Timescale

Wiki rule tổng ghi `official` trong history hiện không được report dùng và
không thay đổi logic. Jira lại yêu cầu kiểm tra Timescale qua
`product_item_histories`.

**Need Confirm:** Timescale chỉ cần regression để bảo đảm không ghi giá trị
hạ Mall, hay có code mapping mới trong task này?

### 13.3. PI Detail khi source đã là Mall

Wiki mô tả rõ phải set Shop output thành Mall. Tài liệu chưa hoàn toàn rõ PI
output bắt buộc phải là `1` hay có thể là `null`, miễn PI trong DB không bị
hạ.

**Need Confirm:** Expected của Resolver PI output trong trường hợp
`source.official=1` và raw crawler `official=false`.

### 13.4. Tên queue Ranking

Các tài liệu đang dùng không thống nhất:

```text
cl.eca.product_item_ranking
cl.eca.ranking_product_items
```

**Need Confirm:** Dùng tên queue thực tế trên RabbitMQ của deployment đang
test làm chuẩn.

### 13.5. Giá trị chuỗi

Mapping hiện dùng so sánh lỏng:

```javascript
item?.official == 1
```

Vì vậy chuỗi `"1"` có thể được coi là Mall.

**Need Confirm:** Schema có chấp nhận `"1"` hay chỉ chấp nhận số `1` và
boolean `true`?

## 14. Kế hoạch ngắn gọn nếu thời gian gấp

Nếu không đủ thời gian chạy toàn bộ 52 test case, ưu tiên bộ smoke/risk
sau:

1. Shop Detail: DB `1`, crawler trả `0` -> DB vẫn `1`.
2. Shop Detail: DB `0`, crawler trả `1` -> DB thành `1`.
3. PI By Shop: Shop source `1`, PI raw `false` -> PI/Shop không bị hạ.
4. PI By Shop: Shop source `0`, PI raw `1` -> PI và Shop thành `1`.
5. PI Detail: source `1`, raw `false` -> PI/Shop cuối cùng vẫn Mall.
6. Pusher trực tiếp: DB `1`, lần lượt gửi `0/null/missing` -> DB vẫn `1`.
7. Updater trực tiếp: `set:0/set:null` -> DB vẫn `1`, Redis xử lý đúng.
8. Concurrent messages `1` và `0` cùng ID -> DB cuối cùng `1`.
9. Một flow VN và một flow TH -> không ghi chéo region.
10. DB timeout -> retry/DLQ đúng và không mất message.

## 15. Checklist cá nhân trước khi bắt đầu test

- [ ] Tôi biết record nào đang là Mall và record nào chưa là Mall.
- [ ] Tôi biết flow đang test dùng source là Shop hay PI.
- [ ] Tôi biết input queue, output queue và DB cuối của flow.
- [ ] Tôi biết consumer nào đang bật.
- [ ] Tôi đã lưu trạng thái DB trước test.
- [ ] Tôi có ID/correlation ID riêng để tìm message và log.
- [ ] Tôi kiểm tra cả message trung gian, không chỉ DB cuối.
- [ ] Tôi xác nhận các field khác vẫn update khi `official` bị bỏ qua.
- [ ] Tôi kiểm tra retry/DLQ nếu có lỗi.
- [ ] Với Updater, tôi kiểm tra cả Redis lock và `created_by`.

## 16. Tài liệu và test case liên quan

- Test plan chi tiết:
  [Task YNMPECA-9240 - Improve co official Mall.md](./Task%20YNMPECA-9240%20-%20Improve%20co%20official%20Mall.md)
- Jira:
  [YNMPECA-9240](https://jira.younetco.com/browse/YNMPECA-9240)
- Wiki rule tổng:
  [Cách cập nhật Shop Mall](https://wiki.younetco.com/pages/viewpage.action?pageId=310444173)
- Test case:
  [Google Sheet](https://docs.google.com/spreadsheets/d/1t29StoB76s0_HdpWWV1IUC6PI_-kbhpodmjvqCR2bhk/edit?gid=1704880699)
- Resolver:
  [Luồng Resolver/Data Pusher mới](https://wiki.younetco.com/pages/viewpage.action?pageId=108364338)
- Data Pusher:
  [Data Pusher Services Design](https://wiki.younetco.com/pages/viewpage.action?pageId=75799415)
- Source Updater:
  [Source Updater Services Design](https://wiki.younetco.com/pages/viewpage.action?pageId=75799413)
- Crawling Loader:
  [Crawling Loader Services Design](https://wiki.younetco.com/pages/viewpage.action?pageId=75799362)

## 17. Kết luận dễ nhớ

Khi test bất kỳ flow nào, chỉ cần luôn tự hỏi ba câu:

1. Service này lấy `official` từ đâu?
2. Nếu giá trị mới không phải `1`, service có đang cố ghi đè field cũ
   không?
3. Sau toàn bộ pipeline, record đã từng là Mall có còn `official=1`
   không?

Nếu câu 3 là "không", task chưa đạt yêu cầu dù các queue khác vẫn chạy và
không có crash.
