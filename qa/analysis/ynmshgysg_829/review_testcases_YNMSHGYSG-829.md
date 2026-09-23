# 🔍 REVIEW BỘ TESTCASE — YNMSHGYSG-829
## [TECH DEPT][X Platform] Special Cases: Article, Space, Broadcast Content Completeness

**Reviewer:** Senior QA / Test Analyst (AI-assisted)
**Ngày review:** 26/06/2026
**Test Plan tham chiếu:** `TestPlan_YNMSHGYSG-829_X_Special_Cases_Article_Space_Broadcast.md`
**Tổng số TC hiện tại:** 24 cases (Dự kiến Test Plan: 58-78 cases)

---

## 1. Nhận xét tổng quan

> [!NOTE]
> **Đánh giá chung: 7.5/10** — Bộ testcase có tư duy bao quát rất tốt, cover được hầu hết các module quan trọng (kể cả Queue Contract, DB Persistence, Detect Country, Security). Tuy nhiên, nguyên nhân số lượng TC chỉ có 24 (thấp hơn nhiều so với dự kiến 58-78) là do tình trạng **gom nhóm (over-consolidation)** quá mức. Nhiều TC gộp 3-4 kịch bản vào chung 1 case khiến việc tracking bug sẽ rất khó khăn.

### Thống kê hiện tại

| Metric | Giá trị | Nhận xét |
|---|:---:|---|
| **Tổng số TC** | **24** | Thấp hơn nhiều so với ước lượng (58-78). Do gom nhóm TCs. |
| **TC priority High** | 14 (58%) | Phân bổ Priority khá hợp lý. |
| **TC priority Medium** | 10 (42%) | |
| **TC Positive** | 16 (67%) | |
| **TC Negative/Edge** | 8 (33%) | Cần bổ sung thêm các case boundary/NFR. |
| **Test Type** | 100% Functional | Sai lệch Test Type (thực tế có Integration, Security, Regression). |

### Điểm Tốt (✅)
1. **Bao quát đầy đủ các Entity mới:** Có đủ TCs cho Article (TC 001-006), Space (TC 007-009), Broadcast (TC 010-012).
2. **Cover được Data Flow:** Quan tâm đến cả Solr (TC 016), Mongo (TC 017), Detect Country (TC 018), Source Updater (TC 019).
3. **Có ý thức về Contract & Security:** Có case verify Schema Queue (TC 013) và Security rò rỉ token/cookie (TC 024).
4. **Hiểu rõ rule BA:** Nhắc đến các case `is_quoted_status=false` (TC 004) và rule `link_shared` cần BA confirm.

---

## 2. Các lỗi/vấn đề trong testcase hiện tại

### 🔴 2.1. Tình trạng Gom Nhóm (Over-Consolidation) quá mức
Rất nhiều TCs gộp nhiều entity vào chung 1 case. Điều này vi phạm nguyên tắc "Single Responsibility" trong viết TC. Nếu TC fail, ta không biết entity nào gây fail.

- **TC_X_SPECIAL_013 (Queue Contract):** Gộp chung kiểm tra required fields cho cả Article, Space, Broadcast.
- **TC_X_SPECIAL_015 (Partial Success):** Đẩy 1 batch gồm 1 Article valid, 1 Space invalid, 1 Broadcast valid. Quá cồng kềnh để setup mock data.
- **TC_X_SPECIAL_016 (Solr Persistence):** Chạy 3 sample hợp lệ Article, Space, Broadcast rồi check Solr.
- **TC_X_SPECIAL_021 (Regression Normal Content):** Gộp Text, Photo, Video vào chung 1 TC.
- **TC_X_SPECIAL_024 (Security):** Gộp kiểm tra log cho cả 3 loại.

*👉 Tác hại: Khi chạy tự động hoặc manual, nếu Article lỗi nhưng Space pass, đánh fail cả TC thì report coverage sẽ bị sai lệch.*

### 🟡 2.2. Thiếu các Edge/Negative Cases chi tiết theo Test Plan
Test Plan đã liệt kê các case cụ thể nhưng bộ TC hiện tại bỏ sót:
1. **ART-06:** Thiếu verify `parent_posts` title/caption/created_date cho Article.
2. **ART-08:** Thiếu case Article bị deleted/unavailable (hiện chỉ có TC 012 cho Broadcast và TC 019 mock Space).
3. **SPC-03:** Thiếu case Space ở trạng thái Scheduled/Upcoming.
4. **BRC-04:** Thiếu case Broadcast missing metadata (hiện chỉ có TC 006 cho Article và TC 009 cho Space).
5. **NFR-02:** Thiếu case stability (Bắn 20 malformed responses liên tục xem có crash/OOM không).

### 🟡 2.3. Lỗi Idempotency chưa hoàn thiện
**TC_X_SPECIAL_017** có test Re-run same source để check duplicate trong **Mongo**. Tuy nhiên:
- Thiếu check duplicate trong **Solr** (Mentions).
- Thiếu check duplicate request publish qua queue Detect Country.

### 🟡 2.4. Sai lệch Test Type
Tất cả cột Test Type đang để là `Functional`. Cần sửa lại cho đúng bản chất:
- TC_013, 015, 016, 017, 018, 019: **Integration**
- TC_021, 022: **Regression**
- TC_020, 023: **Non-functional** (hoặc Edge/Reliability)
- TC_024: **Security**

### 🟡 2.5. Rủi ro phụ thuộc "Need Confirm"
TC_X_SPECIAL_003 phụ thuộc vào quyết định của BA về `link_shared` và `mention_type`.
*👉 Cần note rõ ràng trong phần "Test Steps" là "Vui lòng cập nhật Expected Result dựa trên latest BA confirmation trước khi execute."*

---

## 3. Testcase cần chỉnh sửa (Tách TC)

Dưới đây là các TC cần TÁCH RA để đảm bảo nguyên tắc 1 TC - 1 Mục tiêu:

| TC Cũ | Tách thành các TC Mới |
|---|---|
| **TC_X_SPECIAL_013** (Queue Contract) | - 013a: Queue Contract cho Article<br>- 013b: Queue Contract cho Space<br>- 013c: Queue Contract cho Broadcast |
| **TC_X_SPECIAL_016** (Solr Persistence) | - 016a: Solr Persistence cho Article<br>- 016b: Solr Persistence cho Space<br>- 016c: Solr Persistence cho Broadcast |
| **TC_X_SPECIAL_021** (Regression Normal) | - 021a: Regression Text post<br>- 021b: Regression Photo post<br>- 021c: Regression Video post |
| **TC_X_SPECIAL_024** (Security) | Tách hoặc chỉ ghi rõ "Execute test security riêng biệt trên môi trường có log đẩy đủ". (Có thể giữ nguyên nhưng test steps phải chạy riêng từng batch). |

*Sửa cột Test Type:* Cập nhật Test Type thành Integration, Regression, Security tương ứng như đã phân tích ở mục 2.4.

---

## 4. Testcase nên bổ sung (Fill Gaps)

Bổ sung 6 TCs sau để cover đủ các case trong Test Plan:

| TC ID Đề xuất | Module | Priority | Test Name | Mô tả / Expected Result |
|---|---|:---:|---|---|
| **TC_X_SPECIAL_025** | Article | Medium | [Negative] Article deleted hoặc unavailable được xử lý an toàn | Crawler gặp Article 404/deleted -> Source cập nhật failed hoặc skipped có kiểm soát, không treo, không rác DB. |
| **TC_X_SPECIAL_026** | Article | High | [Positive] Build đúng parent_posts cho Article | Verify `parent_posts` object (title, caption, created_date) có đầy đủ nếu resolver build post cha. |
| **TC_X_SPECIAL_027** | Space | Medium | [Positive] Space trạng thái Scheduled/Upcoming vẫn lưu đủ metadata | Lấy đủ thông tin giờ dự kiến (scheduled_start), title, host. |
| **TC_X_SPECIAL_028** | Broadcast| Medium | [Negative] Broadcast missing metadata (description/video) | Fallback an toàn lấy title/link, mention vẫn valid hoặc invalid tùy rule, service không crash. |
| **TC_X_SPECIAL_029** | Idempotency | High | [Integration] Re-run same source không duplicate Mentions trong Solr | Chạy 2 lần 1 source Article -> Query Solr chỉ trả về 1 Mention duy nhất. |
| **TC_X_SPECIAL_030** | Stability | Medium | [Non-functional] Bắn liên tục 20 malformed special responses | Bắn 20 raw response bị lỗi format (thiếu ngoặc, null object) -> Service resolver không bị OOM, không crash. |

---

## 5. Tổng kết Action Items

1. **Tách 3 TCs gom nhóm (013, 016, 021)** thành 9 TCs độc lập.
2. **Bổ sung 6 TCs mới** (025 -> 030) để cover các Edge/Negative cases và Idempotency cho Solr.
3. **Cập nhật lại cột `Test Type`** cho toàn bộ file để phản ánh đúng Integration, Regression, Security.
4. **Theo dõi chặt chẽ TC 003**: Dev/QA cần ping BA để chốt rule `link_shared` & `mention_type` trước ngày test execution, nếu không TC này sẽ block.
5. *(Sau khi làm các bước trên, tổng số lượng TC sẽ lên khoảng 36-40 cases, cover sâu hơn và dễ tracking bug hơn rất nhiều).*
