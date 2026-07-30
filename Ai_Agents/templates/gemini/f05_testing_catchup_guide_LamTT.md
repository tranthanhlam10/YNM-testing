# 🚀 Catch-up Guide — Test Feature 04-F05: Crisis Negative Level Classification

> **Dành cho:** Tester mới tiếp nhận feature
> **Thời gian đọc:** ~15 phút
> **Cập nhật:** 28/07/2026

---

## 1. Feature này làm gì? (Giải thích đơn giản)

### Bối cảnh

Hệ thống SocialHeat theo dõi mạng xã hội cho các client (thương hiệu). Khi phát hiện **tin tiêu cực (crisis)** về thương hiệu, hệ thống dùng **AI (LLM)** để phân loại.

**Trước khi có feature này:**
- AI chỉ trả lời: "Có crisis" hoặc "Không có crisis" → gọi là **Binary** (0 hoặc 1)
- Moderator (người kiểm duyệt) phải tự đánh giá mức độ nghiêm trọng → tốn công, không nhất quán

**Sau khi có feature này:**
- AI có thể trả lời chi tiết hơn: "Không crisis (0)", "Crisis nhẹ (1)", "Crisis vừa (2)", "Crisis nặng (3)"
- Mỗi level kéo theo nhóm xử lý khác nhau bên phía client

### Ví dụ thực tế

Tưởng tượng bạn là hệ thống báo cháy:
- **Trước:** Chỉ kêu "CÓ CHÁY" hoặc "KHÔNG CHÁY"
- **Sau:** Kêu "Không cháy (0)", "Khói nhẹ (1)", "Cháy vừa (2)", "Cháy lớn (3)" → mỗi mức gọi đội khác nhau

### Feature gồm 2 phần

```
┌─────────────────────────────────────────────────────────┐
│  PHẦN 1: CẤU HÌNH (User làm trên giao diện web)        │
│  ─────────────────────────────────────────────────────   │
│  User vào AI Prompt Library → tạo/sửa prompt            │
│  → Bật toggle "Phân loại Negative Level"                 │
│  → Nhập định nghĩa cho Level 1, 2, 3                    │
│  → Lưu prompt                                           │
├─────────────────────────────────────────────────────────┤
│  PHẦN 2: RUNTIME (Hệ thống tự chạy, không có UI)        │
│  ─────────────────────────────────────────────────────   │
│  Khi có tin mới trên mạng xã hội                         │
│  → Hệ thống lấy prompt đã lưu                           │
│  → Gửi cho AI (LLM) phân loại                           │
│  → AI trả về crisis_level (0/1/2/3)                      │
│  → Hệ thống gán negative_level lên mention              │
│  → Moderator verify trên màn hình monitoring             │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Thuật ngữ cần biết

| Thuật ngữ | Nghĩa đơn giản |
|-----------|-----------------|
| **Mention** | Một bài viết/comment trên mạng xã hội nhắc đến thương hiệu |
| **Crisis** | Tin tiêu cực, khủng hoảng truyền thông |
| **Negative Level** | Mức độ nghiêm trọng của crisis (1 = nhẹ, 2 = vừa, 3 = nặng) |
| **LLM** | AI model (như ChatGPT) dùng để phân loại tin |
| **Prompt** | Bộ hướng dẫn gửi cho AI để AI biết cách phân loại |
| **Toggle** | Nút bật/tắt trên giao diện (ON/OFF) |
| **Template Binary** (Template A) | Template mặc định khi toggle OFF — chỉ phân loại crisis/không crisis |
| **Template Level** (Template B) | Template khi toggle ON — phân loại 3 cấp độ |
| **Prompt Library** | Nơi quản lý các prompt trên AI Studio |
| **Pipeline Lớp 2** | Hệ thống backend tự động xử lý mention |
| **DLQ** | Dead Letter Queue — hàng đợi chứa mention bị lỗi khi gọi AI |
| **Moderator** | Người kiểm duyệt kết quả AI |
| **Topic** | Chủ đề theo dõi (mỗi client có nhiều topic) |
| **Luồng copy-data** | Luồng chính xử lý mention realtime |
| **System tag** | Tag tự động gán bởi pipeline (khác với tag user tự gán) |

---

## 3. Ai được dùng feature này?

```
┌─────────────────────────────────────────┐
│  Có quyền "manage_crisis_classification │
│  _prompt"?                              │
│         │                               │
│    ┌────┴────┐                          │
│    │         │                          │
│   CÓ       KHÔNG                        │
│    │         │                          │
│  Thấy     KHÔNG thấy                    │
│  option    option                        │
│  "Crisis   "Crisis                       │
│  Class."   Class."                       │
│  trong     trong                         │
│  dropdown  dropdown                      │
│            (vẫn dùng                     │
│            task type                     │
│            khác OK)                      │
└─────────────────────────────────────────┘
```

**Ai có quyền:** Crisis Team và P&R (admin vận hành). Quyền được cấp thủ công.

---

## 4. Luồng test chính — PHẦN 1: Cấu hình trên UI

### 4.1 Toggle hiện/ẩn

```
User chọn Task Type trong dropdown
        │
        ├── "Crisis Classification" → Toggle "Phân loại Negative Level" HIỆN
        │                              (mặc định OFF, không animation)
        │
        └── Bất kỳ task type khác ──→ Toggle ẨN hoàn toàn
                                       (không phải disabled, mà là ẩn hẳn)
```

> **Lưu ý test:** Toggle phải hiện/ẩn **tức thì**, **không có animation**.

### 4.2 Template chuyển đổi khi toggle

```
Toggle OFF (mặc định)              Toggle ON
┌──────────────────────┐           ┌──────────────────────┐
│ Template A (Binary)  │           │ Template B (Level)   │
│                      │           │                      │
│ ▸ CHỦ THỂ & PHẠM VI │           │ ▸ CHỦ THỂ & PHẠM VI │
│   (user điền)        │           │   (user điền)        │
│                      │           │                      │
│ ▸ TRƯỜNG HỢP LOẠI   │           │ ▸ TRƯỜNG HỢP LOẠI   │
│   TRỪ                │           │   TRỪ                │
│   (có sẵn dòng mặc   │           │   (có sẵn dòng mặc   │
│   định: "nội dung     │           │   định)              │
│   không phải tiếng    │           │                      │
│   Việt")              │           │ ▸ QUY TẮC PHÂN LOẠI │
│                      │           │   ├─ Level 1 (nhẹ)   │
│ ▸ QUY TẮC PHÂN LOẠI │           │   ├─ Level 2 (vừa)   │
│   (không chia level)  │           │   └─ Level 3 (nặng)  │
└──────────────────────┘           └──────────────────────┘
```

> **Phần "NGUYÊN TẮC PHÂN TÍCH CHUNG"** (4 bước do hệ thống quản lý) → **KHÔNG hiển thị** trong textarea. Chỉ được ghép vào lúc runtime.

### 4.3 Khi nào hiện Confirmation Dialog?

```
User chuyển toggle
        │
        ├── User CHƯA sửa gì (textarea = template mặc định)
        │       → Chuyển template NGAY, không hỏi
        │
        └── User ĐÃ sửa nội dung (khác template mặc định)
                → Hiện dialog xác nhận:
                │
                ├── "Confirm" → Reset về template mới
                │               (mất hết nội dung đã nhập!)
                │
                └── "Cancel"  → Giữ nguyên, không đổi gì
```

> **Tin nhắn dialog:**
> - Bật toggle (OFF→ON): *"Prompt sẽ bị reset về template mặc định theo 3 level. Tiếp tục?"*
> - Tắt toggle (ON→OFF): *"Prompt sẽ bị reset về template mặc định. Tiếp tục?"*

### 4.4 Validation khi Save

```
Bấm "Save Prompt"
        │
        ├── Toggle OFF:
        │     ├── CHỦ THỂ & PHẠM VI trống?  → ❌ Block Save
        │     ├── QUY TẮC PHÂN LOẠI trống?  → ❌ Block Save
        │     │   Message: "Vui lòng nhập nội dung definition trước khi lưu."
        │     │
        │     └── Cả hai đã có nội dung?     → ✅ Save OK
        │         (TRƯỜNG HỢP LOẠI TRỪ chỉ có dòng mặc định = KHÔNG tính)
        │
        └── Toggle ON:
              ├── Level 1 trống?  ─┐
              ├── Level 2 trống?  ─┼→ ❌ Block Save + highlight section trống
              ├── Level 3 trống?  ─┘
              │   Message: "Vui lòng nhập định nghĩa cho cả 3 level trước khi lưu."
              │
              └── Cả 3 level đã có? → ✅ Save OK
```

---

## 5. Luồng test chính — PHẦN 2: Runtime (Backend)

### 5.1 AI phân loại mention

```
Mention mới từ mạng xã hội
        │
        ▼
Pipeline Lớp 2 lấy prompt đã lưu của client
        │
        ▼
Ghép full prompt theo thứ tự:
  (1) Vai trò / Nhiệm vụ        ← hệ thống quản lý
  (2) Nguyên tắc phân tích      ← hệ thống quản lý (4 bước)
  (3) Definition                 ← nội dung user đã nhập trong textarea
  (4) Output JSON format         ← hệ thống quản lý
        │
        ▼
Gửi cho LLM → LLM trả về crisis_level
        │
        ▼
Hệ thống map kết quả:
┌────────────────────────────────────────────────────────┐
│                                                        │
│  Toggle ON:                                            │
│    crisis_level = 0  →  negative_level = null (ko crisis) │
│    crisis_level = 1  →  negative_level = 1             │
│    crisis_level = 2  →  negative_level = 2             │
│    crisis_level = 3  →  negative_level = 3             │
│                                                        │
│  Toggle OFF:                                           │
│    crisis_level = 0  →  negative_level = null          │
│    crisis_level = 1  →  negative_level = 1             │
│    (LLM chỉ trả 0 hoặc 1 khi toggle OFF)              │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### 5.2 Khi AI bị lỗi — DLQ Retry Chain

Đây là phần phức tạp nhất. Hãy hình dung như **gọi điện khi mạng kém:**

```
Gọi lần 1 (model mặc định: gpt-5-mini) → FAIL
        │
        ▼ chờ 30 giây, gom tất cả mention fail
        │
Retry 2 (cùng model: gpt-5-mini) ──────→ OK? → Dừng, gán level
        │
        FAIL → chờ 30s
        │
Retry 3 (đổi model: gpt-4.1) ──────────→ OK? → Dừng, gán level
        │
        FAIL → chờ 30s
        │
Retry 4 (đổi cả provider: Gemini gemini-3) → OK? → Dừng, gán level
        │
        FAIL
        │
        ▼
SKIP: crisis_level = null, negative_level = null
      Mention vào topic queue như tin bình thường
      Ghi log lỗi, KHÔNG thông báo user
```

> **Quan trọng:** Cơ chế retry này **chỉ áp dụng cho luồng copy-data** (realtime). 
> Hai luồng khác **KHÔNG** dùng DLQ retry:
> - Re-run Sentiment (Post Spam)
> - Gỡ spam tay

### 5.3 Khi provider hết quota — KHÁC với lỗi thường!

```
┌─────────────────────────────────────────────────┐
│  Lỗi tạm thời (timeout, 5xx...)                │
│  → Vào DLQ → Retry 4 bước                      │
│                                                 │
│  Hết quota / limit / credit / budget cap        │
│  → SKIP NGAY (không retry — vô ích!)            │
│  → crisis_level = null, negative_level = null   │
│  → Nếu limit nội bộ → thông báo department Head │
│  → Nếu limit provider → không thông báo         │
└─────────────────────────────────────────────────┘
```

### 5.4 System Tag

Khi AI xác nhận crisis (crisis_level ≥ 1), hệ thống **tự gán tag** theo môi trường:

| Môi trường | Tag ID |
|-----------|--------|
| Testing | `597426` |
| Staging | `593346` |
| Production | `602334` |

> **Lưu ý:** Tag chỉ gán bởi **AI pipeline**, KHÔNG gán khi tạo topic mới.

---

## 6. Checklist test — Chia theo nhóm (dễ theo dõi)

### 🔐 Nhóm 1: Quyền truy cập
- [ ] User không có quyền → KHÔNG thấy "Crisis Classification" trong dropdown
- [ ] User có quyền → thấy và chọn được
- [ ] Kiểm tra trên cả form Create và Edit

### 🔘 Nhóm 2: Toggle hiện/ẩn
- [ ] Chọn task type khác → toggle ẩn hoàn toàn
- [ ] Chọn "Crisis Classification" → toggle hiện, mặc định OFF
- [ ] Chuyển qua lại → toggle hiện/ẩn tức thì, không animation
- [ ] Đổi task type khỏi Crisis → toggle ẩn, textarea reset

### 📝 Nhóm 3: Template chuyển đổi
- [ ] Toggle OFF → Template Binary (3 mục, có dòng exclusion mặc định)
- [ ] Toggle ON (chưa sửa gì) → chuyển Template Level ngay, không confirm
- [ ] Toggle ON (đã sửa nội dung) → hiện dialog confirm
- [ ] Confirm → reset template, cursor ở Level 1
- [ ] Cancel → giữ nguyên trạng thái
- [ ] Header Level 1/2/3 in đậm, read-only (không xóa được)

### 💾 Nhóm 4: Validation & Save
- [ ] Toggle OFF, chưa nhập gì → block Save + message lỗi
- [ ] Toggle OFF, nhập CHỦ THỂ + QUY TẮC → Save OK
- [ ] Toggle ON, thiếu 1 level → block Save + highlight section trống
- [ ] Toggle ON, đủ 3 level → Save OK + toast thành công
- [ ] Server lỗi → giữ form + nội dung + toast lỗi
- [ ] Reload sau save → toggle + nội dung đúng như đã lưu

### 🤖 Nhóm 5: AI phân loại (Runtime)
- [ ] Toggle ON: crisis_level 1/2/3 → negative_level đúng
- [ ] Toggle ON: crisis_level 0 → negative_level = null
- [ ] Toggle OFF: crisis_level 1 → negative_level = 1
- [ ] Prompt mỗi client riêng biệt (không dùng chung)
- [ ] Output AI chỉ có crisis_level (không có key "reason")

### 🔄 Nhóm 6: DLQ & Error handling
- [ ] LLM trả value lạ (-1, 5, "abc") → vào DLQ
- [ ] Provider timeout/5xx → vào DLQ (không skip ngay)
- [ ] Retry đúng thứ tự: gpt-5-mini → gpt-5-mini → gpt-4.1 → gemini-3
- [ ] Retry thành công giữa chừng → dừng, gán level, không retry tiếp
- [ ] Tất cả retry fail → skip, null, log lỗi, không notify user
- [ ] Provider hết quota → skip ngay, KHÔNG vào DLQ
- [ ] Budget cap nội bộ → skip + thông báo department Head

### 🏷️ Nhóm 7: System tag & Regression
- [ ] crisis_level ≥ 1 → gán đúng tag theo môi trường
- [ ] crisis_level = 0 → KHÔNG gán tag
- [ ] Tag chỉ gán bởi pipeline, không khi tạo topic
- [ ] Mỗi lần gọi LLM (kể cả retry) → log cost riêng
- [ ] is_noisy reset = false khi crisis confirmed
- [ ] DLQ chỉ áp luồng copy-data (không ảnh hưởng re-run/gỡ spam)

---

## 7. Thứ tự test ưu tiên

| Ưu tiên | Nhóm | Lý do |
|---------|------|-------|
| 🔴 **Làm đầu** | Nhóm 1 (Quyền) | Nếu sai → user trái phép truy cập được |
| 🔴 **Làm đầu** | Nhóm 4 (Validation) | Nếu sai → prompt lưu thiếu → AI phân loại sai |
| 🔴 **Làm đầu** | Nhóm 5 (AI mapping) | Nếu sai → level sai → client nhận kết quả sai |
| 🟡 **Làm tiếp** | Nhóm 3 (Template) | Nếu sai → user nhập sai chỗ |
| 🟡 **Làm tiếp** | Nhóm 6 (DLQ/Error) | Nếu sai → mention mất hoặc retry vô hạn |
| 🟡 **Làm tiếp** | Nhóm 7 (Tag/Regression) | Verify không break tính năng cũ |
| 🟢 **Làm sau** | Nhóm 2 (Toggle UI) | Ít risk nhất, chủ yếu UX |

---

## 8. Những chỗ dễ bị nhầm

| # | Dễ nhầm | Sự thật |
|---|---------|---------|
| 1 | Template Binary có **2** section | ❌ Có **3** section (CHỦ THỂ + LOẠI TRỪ + QUY TẮC). AC trong spec ghi "2 phần" nhưng BR-03 ghi rõ 3 mục. |
| 2 | TRƯỜNG HỢP LOẠI TRỪ có dòng mặc định = user đã nhập | ❌ Dòng mặc định **KHÔNG** tính là user nhập. Validation chỉ xét CHỦ THỂ + QUY TẮC. |
| 3 | Confirmation dialog hiện mỗi lần toggle | ❌ Chỉ hiện khi user **đã chỉnh sửa** nội dung so với template mặc định. |
| 4 | Hết quota → vào DLQ retry | ❌ Hết quota → **skip ngay**, KHÔNG retry (cùng account nên retry vô ích). |
| 5 | DLQ retry áp dụng cho mọi luồng | ❌ Chỉ áp dụng **luồng copy-data**. Re-run sentiment và gỡ spam tay KHÔNG qua DLQ. |
| 6 | NGUYÊN TẮC PHÂN TÍCH CHUNG hiển thị trong textarea | ❌ Phần này **ẩn** — do hệ thống quản lý, chỉ ghép vào lúc runtime. |
| 7 | Khi AI fail hoàn toàn → thông báo Moderator | ❌ **Không thông báo** — mention đi vào topic queue im lặng với null. |
| 8 | System tag gán khi tạo topic mới | ❌ Tag **chỉ** gán bởi AI pipeline khi crisis_level ≥ 1. |

---

## 9. Map nhanh: Mình test cái gì → liên quan Business Rule nào

| Mình đang test... | BR liên quan | Ý nghĩa ngắn |
|-------------------|-------------|---------------|
| Quyền xem Crisis Classification | BR-01 | Ẩn option nếu không có quyền |
| Toggle hiện/ẩn | BR-02, BR-07 | Chỉ hiện khi task type đúng |
| Template Binary (OFF) | BR-03 | 3 mục, có exclusion mặc định |
| Template Level (ON) | BR-04 | 3 mục, QUY TẮC chia 3 level |
| Confirm dialog | BR-05, BR-06 | Chỉ khi user đã sửa nội dung |
| Validation Save (ON) | BR-08 | Phải đủ 3 level definition |
| Validation Save (OFF) | BR-09 | Phải có CHỦ THỂ + QUY TẮC |
| Map level 1/2/3 | BR-10 | negative_level = crisis_level |
| Map level 0 | BR-11 | negative_level = null |
| Toggle OFF + level 1 | BR-12 | negative_level = 1, không gọi thêm AI |
| AI lỗi → DLQ | BR-13 | Output invalid hoặc provider lỗi |
| System tag | BR-14 | Tag theo env khi crisis ≥ 1 |
| DLQ retry 4 bước | BR-15→18 | Đổi model escalation |
| Hết quota → skip | BR-19 | Không retry, skip ngay |

---

## 10. Tài liệu tham khảo

| Tài liệu | Đường dẫn |
|-----------|-----------|
| Spec đầy đủ | [04-F05-crisis-negative-level-classification.md](file:///Users/tranthanhlam/product-ai-docs/SocialHeat/specs/04-crisis-realtime-monitoring/04-F05-crisis-negative-level-classification.md) |
| Testcase trên Sheets | [Google Sheets](https://docs.google.com/spreadsheets/d/1umRSp9LEfMlrqbWc5SVN4pivAG0cHaINC0Fumz6YqBU/edit?gid=1704880699) |
| Review chi tiết | testcase_review_F05.md (artifact cùng conversation) |
| Jira Story | [SHDIY-9785](https://jira.younetco.com/browse/SHDIY-9785) |
| Jira Sub-task (TC) | [SHDIY-9993](https://jira.younetco.com/browse/SHDIY-9993) |

---

> [!TIP]
> **Mẹo cho người mới:**
> - Bắt đầu từ **Nhóm 1 (Quyền)** và **Nhóm 4 (Validation)** — đây là phần UI, dễ test nhất
> - Nhóm 5, 6 (Runtime/DLQ) cần **mock LLM response** — hỏi dev cách setup stub
> - Khi gặp gì không hiểu, tìm trong **mục 2 (Thuật ngữ)** hoặc đọc BR tương ứng trong **mục 9**
> - Đọc **mục 8 (Dễ nhầm)** trước khi test — sẽ tránh được nhiều lỗi review
