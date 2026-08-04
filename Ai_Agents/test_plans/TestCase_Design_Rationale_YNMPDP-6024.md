# GIẢI THÍCH THIẾT KẾ TEST CASE
## YNMPDP-6024 - Refactor Token Management

| Field | Value |
|---|---|
| Jira | YNMPDP-6024 |
| Feature | Migrate `monitor_fb_token` sang `tokens` |
| Test Plan | `TestPlan_YNMPDP-6024_Refactor_Token_Management.md` |
| Số lượng test case | 33 |
| Ngày cập nhật | 24/06/2026 |

---

## 1. Mục đích tài liệu

Tài liệu này giải thích lý do bộ test case được chia thành các nhóm:

- Data Migration
- Token Selection
- Proxy Selection
- Service Runtime
- Security
- Performance và Reliability

Task nhìn bề ngoài chỉ là đổi table lưu token, nhưng thực tế ảnh hưởng đến toàn bộ đường đi:

```text
Data cũ
  -> Migration
  -> Table tokens
  -> Logic chọn token
  -> Logic chọn proxy
  -> Facebook GraphQL
  -> Cập nhật trạng thái token
  -> Log, monitoring và output business
```

Nếu chỉ kiểm tra service gọi API thành công thì chưa đủ. Service vẫn có thể chạy nhưng lấy sai token, sai proxy, mất dữ liệu migration, lộ secret hoặc lỗi khi chạy đồng thời.

---

## 2. Requirement được chuyển thành test coverage như thế nào

| Requirement | Rủi ro chính | Nhóm test case |
|---|---|---|
| Migrate `monitor_fb_token` sang `tokens` | Mất record, map sai field, duplicate, sai timezone | `TC_MIGRATION_*` |
| Loại bỏ các field không còn sử dụng | Code vẫn query field cũ và crash runtime | `TC_MIGRATION_003`, `TC_MIGRATION_010` |
| `access_token` đổi thành `token` | Token bị truncate hoặc gắn sai record | `TC_MIGRATION_001`, `TC_MIGRATION_007` |
| `blocked_date` đổi thành `blockedAt` | Lệch timezone hoặc chọn nhầm token bị block | `TC_MIGRATION_008`, `TC_TOKEN_QUERY_003` |
| Query theo `crawler_type`, `country`, `status`, `blockedAt` | Lấy token sai điều kiện | `TC_TOKEN_QUERY_001` đến `010` |
| Không query theo `token_type`, `user_type` | Logic cũ vẫn còn ảnh hưởng | `TC_TOKEN_QUERY_004` |
| Luôn lấy proxy VN | Fallback sai country hoặc phụ thuộc field legacy | `TC_PROXY_001` đến `004` |
| Tận dụng service phân phối token | Dependency lỗi làm service crash hoặc fallback table cũ | `TC_RUNTIME_004`, `TC_RUNTIME_005` |
| Giữ nguyên behavior của `fbapi-sample` | Refactor làm thay đổi output business | `TC_RUNTIME_002`, `TC_RUNTIME_005` |

---

## 3. Lý do thiết kế nhóm Data Migration

Migration là phần có rủi ro data integrity cao nhất. Sai ở bước này có thể không xuất hiện ngay, nhưng về sau service sẽ dùng token thiếu dữ liệu hoặc sai trạng thái.

### 3.1 Kiểm tra mapping field

`TC_MIGRATION_001` kiểm tra tất cả field được nêu trong technical spec trong cùng một record:

```text
access_token  -> token
status        -> status
error_code    -> error_code
error_message -> error_message
cookie        -> cookie
blocked_date  -> blockedAt
```

Case này là happy path chính, giúp xác nhận migration script thực hiện đúng contract cơ bản.

### 3.2 Kiểm tra NULL, empty và field không hợp lệ

`TC_MIGRATION_002` dùng Equivalence Partitioning:

- Token hợp lệ, optional field là `null`.
- Token bắt buộc là `null`.
- Token bắt buộc là chuỗi rỗng.

Ba nhóm này có behavior khác nhau. Optional field `null` có thể hợp lệ, nhưng token `null` hoặc rỗng tuyệt đối không được cấp phát.

### 3.3 Kiểm tra loại bỏ field legacy

`TC_MIGRATION_003` không chỉ nhìn schema. Case này chạy service với record không có field legacy để phát hiện:

- Query SQL vẫn còn nhắc field cũ.
- Model/entity vẫn bắt buộc field cũ.
- Runtime đọc `undefined` và crash.

### 3.4 Đối soát số lượng và duplicate

`TC_MIGRATION_004` và `TC_MIGRATION_005` kiểm tra hai lỗi phổ biến:

- Migration báo thành công nhưng mất một phần record.
- Cùng một token được tạo thành nhiều record khả dụng.

Duplicate token có thể làm sai thống kê, tăng request bằng cùng credential và gây rate limit nhanh hơn.

### 3.5 Idempotency và interruption

`TC_MIGRATION_006` và `TC_MIGRATION_009` được tạo theo Error Guessing:

- Script được chạy lại do deploy/retry.
- Process bị kill giữa batch.

Migration thực tế rất dễ gặp hai tình huống này. Hệ thống phải resume hoặc fail an toàn, không tạo duplicate và không để dữ liệu nửa vời.

### 3.6 Boundary dữ liệu và timezone

`TC_MIGRATION_007` kiểm tra chuỗi dài, Unicode và ký tự đặc biệt.

`TC_MIGRATION_008` dùng Boundary Value Analysis cho:

- Đầu ngày.
- Cuối ngày.
- Milliseconds.
- Giá trị `null`.
- Chuyển đổi UTC và `Asia/Ho_Chi_Minh`.

`blockedAt` ảnh hưởng trực tiếp việc token có được sử dụng hay không, nên lệch timezone là lỗi nghiệp vụ nghiêm trọng.

---

## 4. Lý do thiết kế nhóm Token Selection

Logic query mới là trung tâm của task. Bộ case dùng Decision Table để kiểm tra từng điều kiện độc lập và tổ hợp nhiều điều kiện.

### 4.1 Happy path

`TC_TOKEN_QUERY_001` xác nhận token chỉ được chọn khi đồng thời thỏa:

```json
{
  "crawler_type": "FB_GRAPHQL_API",
  "country": "VN",
  "status": "active",
  "blockedAt": "not_blocked"
}
```

### 4.2 Loại từng điều kiện sai

`TC_TOKEN_QUERY_002` dùng một token hợp lệ làm control record, sau đó tạo các token chỉ sai một field:

- Sai `crawler_type`.
- Sai `country`.
- Sai `status`.

Cách này giúp xác định chính xác filter nào bị thiếu trong query.

### 4.3 Boundary của `blockedAt`

`TC_TOKEN_QUERY_003` kiểm tra:

- `blockedAt = null`.
- `blockedAt < now`.
- `blockedAt = now`.
- `blockedAt > now`.

Requirement chưa nói rõ `blockedAt` là thời điểm bắt đầu block hay thời điểm hết block. Vì vậy expected result được đánh dấu `Need Confirm`, tránh QA tự suy diễn business rule.

### 4.4 Xác nhận loại bỏ logic cũ

`TC_TOKEN_QUERY_004` tạo các token có `token_type` và `user_type` khác nhau nhưng điều kiện mới giống nhau.

Nếu kết quả chọn token khác nhau, chứng tỏ code vẫn còn phụ thuộc logic cũ.

### 4.5 Invalid data, normalization và SQL Injection

`TC_TOKEN_QUERY_005` kiểm tra `null` và malformed data không trở thành wildcard.

`TC_TOKEN_QUERY_006` kiểm tra case sensitivity và khoảng trắng để phát hiện behavior khác nhau do DB collation.

`TC_TOKEN_QUERY_010` kiểm tra parameter binding, vì `crawler_type` và `country` được đưa vào query DB.

### 4.6 Pool hỗn hợp và concurrency

`TC_TOKEN_QUERY_007` mô phỏng pool gần thực tế, gồm token hợp lệ và không hợp lệ trộn lẫn.

`TC_TOKEN_QUERY_008` kiểm tra hệ thống phục hồi khi token mới được thêm.

`TC_TOKEN_QUERY_009` kiểm tra race condition: token bị block trong lúc nhiều request đang chạy.

---

## 5. Lý do thiết kế nhóm Proxy Selection

Technical spec yêu cầu luôn dùng proxy VN. Vì vậy không chỉ kiểm tra proxy VN hoạt động, mà còn phải kiểm tra các đường fallback.

| Test case | Mục tiêu |
|---|---|
| `TC_PROXY_001` | Xác nhận không còn phụ thuộc `proxy_location` trong token. |
| `TC_PROXY_002` | Không âm thầm dùng proxy quốc gia khác khi hết proxy VN. |
| `TC_PROXY_003` | Proxy VN lỗi phải failover sang proxy VN khác, không đánh token invalid nhầm. |
| `TC_PROXY_004` | Kiểm tra concurrent allocation và response proxy sai location. |

Proxy timeout và token invalid là hai loại lỗi khác nhau. Nếu service phân loại sai, token tốt có thể bị block chỉ vì proxy lỗi.

---

## 6. Lý do thiết kế nhóm Runtime và Integration

Các case runtime xác nhận từng component đúng khi ghép thành flow hoàn chỉnh.

### 6.1 Configuration

`TC_RUNTIME_001` kiểm tra cả config hợp lệ và thiếu config.

Mục tiêu là ngăn service chạy với wildcard hoặc default không được document, dẫn đến lấy token sai crawler/country.

### 6.2 End-to-end

`TC_RUNTIME_002` là case xác nhận giá trị cuối cùng của task:

```text
fbapi-sample
  -> lấy token từ tokens
  -> lấy proxy VN
  -> gọi Facebook GraphQL
  -> trả output business đúng
```

### 6.3 Token error lifecycle

`TC_RUNTIME_003` phân biệt:

- Invalid token.
- Expired token.
- Rate limit.

Ba loại lỗi không nên có cùng cách xử lý. Rate limit thường là tạm thời, còn invalid/expired có thể cần ngưng cấp phát token.

### 6.4 Dependency failure

`TC_RUNTIME_004` kiểm tra Facebook, DB, token service và proxy bị timeout/unavailable.

Case này tìm các lỗi:

- Retry vô hạn.
- Connection leak.
- Crash loop.
- Fallback về table cũ.
- Đánh token invalid nhầm do lỗi network.

### 6.5 Recovery và regression

`TC_RUNTIME_005` xác nhận service phục hồi sau no-token/restart và output business không đổi sau refactor.

---

## 7. Lý do có test Security

Token, cookie và proxy credential là secret. Refactor thường phát sinh log debug tạm thời, nên có nguy cơ lộ dữ liệu.

`TC_SECURITY_001` kiểm tra secret không xuất hiện trong:

- Application log.
- APM tag.
- Stack trace.
- HTTP error response.

`TC_SECURITY_002` kiểm tra:

- Least privilege cho service account.
- Không cần quyền đọc table cũ.
- Query được parameterize.
- Payload SQL Injection không bypass filter.

---

## 8. Lý do có test Performance và Reliability

Logic query mới thêm các điều kiện `crawler_type`, `country`, `status`, `blockedAt`. Nếu thiếu index hoặc query không tối ưu, performance có thể giảm mạnh khi table lớn.

`TC_PERFORMANCE_001` dùng dataset một triệu record để phát hiện:

- Full table scan.
- Query timeout.
- Index không phù hợp.
- Chọn sai token khi phần lớn record không hợp lệ.

`TC_PERFORMANCE_002` kết hợp concurrent test và soak test để phát hiện:

- Memory leak.
- Connection leak.
- Deadlock.
- Pool exhaustion.
- Race condition khi chọn token/proxy.

---

## 9. Cách áp dụng kỹ thuật thiết kế test

| Kỹ thuật | Cách áp dụng |
|---|---|
| Equivalence Partitioning | Token hợp lệ, inactive, blocked, sai crawler, sai country, NULL, malformed. |
| Boundary Value Analysis | `blockedAt` trước/bằng/sau hiện tại; đầu/cuối ngày; chuỗi sát giới hạn; tải lớn. |
| Decision Table | Tổ hợp `crawler_type + country + status + blockedAt`. |
| State Transition | Token active -> invalid/expired/rate-limited/blocked -> được hoặc không được cấp phát lại. |
| Error Guessing | Migration chạy lại, bị kill giữa batch, dependency timeout, proxy mismatch, log lộ secret. |
| Pairwise/Combination | Pool token hỗn hợp và các dependency lỗi riêng biệt. |
| Regression Testing | So sánh output trước/sau refactor và xác nhận table cũ không còn được dùng. |

---

## 10. Lý do phân Priority

### High

Priority `High` được dùng cho các case có thể gây:

- Mất hoặc sai dữ liệu migration.
- Lấy nhầm token.
- Dùng token bị block/inactive.
- Dùng sai proxy country.
- Service crash hoặc không gọi được Facebook.
- Lộ token/cookie/proxy credential.
- Regression output business.

### Medium

Priority `Medium` được dùng cho:

- Chuỗi rất dài và Unicode.
- Case sensitivity/collation.
- Concurrent proxy allocation.
- Dataset cực lớn, load và soak test.

Các case này quan trọng nhưng ít xảy ra hơn happy path và các lỗi data/auth trực tiếp.

---

## 11. Lý do sử dụng Test Data dạng JSON

Test Data được viết dạng JSON khi có nhiều field vì:

- Dễ copy để seed DB hoặc tạo fixture.
- Thể hiện rõ kiểu dữ liệu `string`, `number`, `boolean`, `null`.
- Dễ nhìn quan hệ giữa nhiều record.
- Giảm hiểu nhầm so với chuỗi mô tả bằng dấu chấm phẩy.
- Có thể tái sử dụng cho automation test.

---

## 12. Các điểm Need Confirm

Những điểm sau không được BA/Dev mô tả đủ rõ nên không nên tự đặt expected result:

1. Giá trị chính xác của status active/inactive.
2. `blockedAt` là thời điểm bắt đầu block hay thời điểm hết block.
3. Boundary `blockedAt = now` là blocked hay available.
4. Timezone chuẩn của `blocked_date`.
5. Quy tắc xử lý duplicate token khi metadata xung đột.
6. Quy tắc xử lý token NULL/rỗng trong migration.
7. Case sensitivity và trim của `crawler_type`, `country`.
8. Có cho phép fallback proxy ngoài VN hay không.
9. Retry, cache refresh và error code khi hết token.
10. SLA cho query token, concurrent load và soak test.

Các case liên quan vẫn được viết để không bỏ sót coverage, nhưng Expected Result có ghi `Need Confirm` nhằm tránh QA đánh Passed/Failed dựa trên giả định cá nhân.

---

## 13. Coverage tổng kết

| Nhóm | Số case | Mục tiêu |
|---|---:|---|
| Data Migration | 10 | Schema, mapping, NULL, duplicate, idempotency, timezone, interruption, cutover |
| Token Selection | 10 | Query condition, boundary, invalid data, pool, concurrency, SQL Injection |
| Proxy Selection | 4 | Proxy VN, no-proxy, failover, concurrent allocation |
| Runtime/Integration | 5 | Config, end-to-end, token errors, dependency failure, recovery/regression |
| Security | 2 | Secret masking, access control, parameterized query |
| Performance/Reliability | 2 | Large table, concurrent load, soak test |
| **Tổng** | **33** | Bao phủ functional, integration, data integrity, security và reliability |

---

## 14. Kết luận

Bộ test case được thiết kế theo nguyên tắc:

- Không chỉ kiểm tra service chạy được, mà phải kiểm tra service sử dụng đúng dữ liệu.
- Không chỉ kiểm tra happy path, mà phải kiểm tra migration failure, invalid data và dependency failure.
- Không chỉ kiểm tra functional, mà phải bảo vệ data integrity và secret.
- Không tự suy diễn các business rule chưa được mô tả; các điểm đó được đánh dấu `Need Confirm`.

Với phạm vi requirement hiện tại, 33 test case là bộ coverage cô đọng nhưng vẫn kiểm tra được các rủi ro quan trọng nhất của việc chuyển từ cơ chế quản lý token cũ sang table `tokens` và token distribution service.
