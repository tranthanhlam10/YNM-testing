# Review kiến trúc Skill `ynm-qc-jira-bugs` vs Flow thực tế của QC Team

## Tổng quan

Skill hiện tại có kiến trúc **rất hoàn chỉnh cho Flow 1** (test-case driven), nhưng có **gap đáng kể với Flow 2** (log bug nhanh qua chat). Dưới đây là phân tích chi tiết dựa trên source code skill và 6 bug mẫu thực tế từ JIRA.

---

## Phân tích 6 Bug mẫu thực tế

| Bug | Summary | Format Description | Labels | Env field | Issue Links |
|---|---|---|---|---|---|
| `YNMPDP-5681` | `[Production][Facebook] Parse sai identity của mention` | Tự do: VD code + expected ngắn, không Steps rõ | `[]` | `Production` | 0 |
| `SHDIY-8772` | `[Keyword Management] Number of Email display 2...` | Semi-structured: `*Environment:*`, `*Steps:*`, `*Actual:*` + code block | `[]` | `None` | 3 |
| `YNMPSTR-1718` | `[Update engagement Tiktok] Script ghi nhận DONE dù lỗi` | Semi-structured: `{*}Step{*}`, `{*}Actual result{*}` | `[]` | `None` | 2 |
| `YNMSHGYSG-1517` | `[Linkedin]: Mapping sai field identity name` | Tự do: code block + mô tả ngắn | `[]` | `None` | 2 |
| `SHDIY-10438` | `[Crisis Alert] Không hiển thị popup đổi Sentiment khi zoom` | **Chuẩn nhất**: `*Steps to Reproduce:*`, `*Actual Result:*`, `*Expected Result:*` | `['rc-requirement', 'sys-frontend', 'test-functional']` | `None` | 1 |
| `YNMPDP-6218` | `[Staging][Engagement] Báo lỗi "Empty .update() call detected"` | Tự do: `{*}Actual{*}` + log attachment + `{*}Expect{*}` ngắn | `[]` | `None` | 1 |

---

## Đánh giá theo từng Flow

### ✅ Flow 1: Test-case → Test → Status → Log bug (từ Sheet/File)

> **Verdict: Skill đáp ứng tốt (~90%)**

| Khía cạnh | Đánh giá | Chi tiết |
|---|---|---|
| Schema & header mapping | ✅ Rất tốt | 35 fields, alias tiếng Việt + Anh, `x-header-aliases` linh hoạt |
| Selection mode | ✅ Đầy đủ | 4 modes: `status`, `ready`, `all`, `candidates` |
| Quality gates | ✅ Chặt chẽ | Actual ambiguous, vague, contradictory đều bị chặn |
| Summary generation | ✅ Tốt | Priority từ Bug Summary → Actual → Testname, có transform rules |
| Label taxonomy | ✅ Rất tốt | rc-*, sys-*, test-*, flow-*, found-in-qc allowlist đầy đủ |
| Duplicate detection | ✅ Có | Fingerprint + JQL search + score |
| Manifest & resume | ✅ Có | Partial failure resume |
| Sheet writeback | ✅ Có | Conflict detection, xác nhận riêng |

### ⚠️ Flow 2: Log bug nhanh qua Chat (Vấn đề chính)

> **Verdict: Skill chỉ đáp ứng ~40-50% thực tế**

Đây là phân tích gap lớn nhất dựa trên 6 bug mẫu:

---

## 🔴 Các GAP nghiêm trọng cần cải thiện

### GAP 1: Skill yêu cầu cấu trúc cứng, QC viết tự do

> [!CAUTION]
> **Đây là gap LỚN NHẤT.** Skill yêu cầu chat phải có đủ 4 trường: `Testname`, `Step`, `Actual Result`, `Expected Result`. Nhưng thực tế QC viết rất tự do.

**Bug mẫu thực tế** — QC có thể chỉ nói:

```
Log bug YNMPDP-6218: Crawler báo lỗi "Empty .update() call detected" ở staging.
Check 3 platform tiktok, youtube và x no cookie đều bị.
Expect crawler chạy bình thường không báo lỗi.
```

Hoặc như YNMPDP-5681:
```
Production FB parse sai identity của mention, VD luồng Facebook Web Comment.
Expected: Parse đúng identity.
```

**Vấn đề trong skill hiện tại:**
- [SKILL.md](file:///Users/tranthanhlam/product-ai-docs/.cursor/skills/ynm-qc/ynm-qc-jira-bugs/SKILL.md#L20) line 20: Chat **bắt buộc** `Testname`, `Step`, `Actual Result`, `Expected Result`
- [quality-rules.md](file:///Users/tranthanhlam/product-ai-docs/.cursor/skills/ynm-qc/ynm-qc-jira-bugs/rules/quality-rules.md#L42) line 42: Thiếu bất kỳ field nào → `INVALID`
- Không có logic **tự động extract/parse** từ text tự do

**Khuyến nghị:**
- Thêm **NLP parser layer** cho chat input: dùng LLM để extract Steps/Actual/Expected từ text tự do
- Giảm required fields cho chat xuống chỉ cần: **mô tả bug** + **task key**
- Tự động suy `Testname/Summary` từ mô tả
- Giữ `NEEDS_CLARIFICATION` thay vì `INVALID` khi thiếu Expected

---

### GAP 2: Không xử lý được input có code block / log attachment

> [!WARNING]
> 5/6 bug mẫu chứa code block hoặc log. Skill chưa có rule xử lý.

Thực tế QC log bug với:
- **YNMPDP-5681**: JSON code block dài trong description
- **SHDIY-8772**: JSON callback queue
- **YNMPSTR-1718**: Command line + log reference
- **YNMSHGYSG-1517**: JSON message payload
- **YNMPDP-6218**: Log file attachment reference `[^logs-from-...]`

**Vấn đề:** Khi QC paste code/log vào chat, skill không biết phần nào là Steps, phần nào là Evidence, phần nào là Actual. Schema [bug-candidate.schema.json](file:///Users/tranthanhlam/product-ai-docs/.cursor/skills/ynm-qc/ynm-qc-jira-bugs/config/bug-candidate.schema.json) không có field `code_snippet` hay `log_data`.

**Khuyến nghị:**
- Thêm rule: code block / log trong chat → tự đưa vào Description dưới `{code}` hoặc `Evidence`
- Thêm field `diagnostic_data` vào schema cho code/log snippets
- Khi parse chat, detect `{code}` / triple backtick / JSON → tách riêng khỏi Steps

---

### GAP 3: Environment nằm trong Summary, không phải field riêng

> [!IMPORTANT]
> 4/6 bug mẫu có environment nằm **trong Summary** dạng `[Production]`, `[Staging]` — không phải trong field `environment`.

| Bug | Summary prefix | Environment field |
|---|---|---|
| YNMPDP-5681 | `[Production]` | `Production` ✅ |
| SHDIY-8772 | N/A | `None` (trong Description: `*Environment:* Testing`) |
| YNMPSTR-1718 | N/A | `None` |
| YNMSHGYSG-1517 | N/A | `None` |
| SHDIY-10438 | N/A (Staging in URL) | `None` |
| YNMPDP-6218 | `[Staging]` | `None` |

**Vấn đề:** Skill có `title_prefixes` cho priority và test_metadata, nhưng **không parse `[Production]`, `[Staging]`, `[Testing]` từ summary** để set environment.

**Khuyến nghị:**
- Thêm vào [policies.json](file:///Users/tranthanhlam/product-ai-docs/.cursor/skills/ynm-qc/ynm-qc-jira-bugs/config/policies.json) section `title_prefixes` thêm category `environment`:
  ```json
  "environment": ["production", "staging", "testing", "qa", "dev", "local"]
  ```
- `summary.py` tự extract `[Production]` → set `Found In Environment = Production` + loại prefix khỏi Summary

---

### GAP 4: Auto-gen Labels khi QC nhập qua Chat (YÊU CẦU MỚI — bắt buộc labels)

> [!IMPORTANT]
> **Yêu cầu mới từ sếp:** Sau này tất cả tester **bắt buộc phải đánh labels** vào bug. Skill cần tự động generate labels khi QC nhập thông tin qua chat.

**Thực trạng:** 5/6 bug mẫu hiện tại có `labels: []`. Chỉ SHDIY-10438 có labels đầy đủ (`rc-requirement`, `sys-frontend`, `test-functional`).

#### ✅ Skill đã có sẵn ~80% hạ tầng để auto-gen labels

Inference engine trong [policies.json → `inference`](file:///Users/tranthanhlam/product-ai-docs/.cursor/skills/ynm-qc/ynm-qc-jira-bugs/config/policies.json#L68-L92) đã có keyword mapping:

| Label category | Số keywords đã map | Ví dụ mapping |
|---|---|---|
| `sys-*` (11 labels) | ~50+ keywords | `"ui", "giao dien"` → `sys-frontend`; `"crawl", "crawler"` → `sys-crawling-auto` |
| `flow-*` (9 labels) | ~30+ keywords | `"mapping sai field"` → `flow-transform`; `"token het han"` → `flow-auth` |
| `test-*` (6 labels) | ~15+ keywords | `"functional"` → `test-functional`; `"regression"` → `test-regression` |
| `rc-*` (14 labels) | ❌ **Chưa có** | Hiện tại cấm suy `rc-*` ([bug-label-rules.md#L105](file:///Users/tranthanhlam/product-ai-docs/.cursor/skills/ynm-qc/ynm-qc-jira-bugs/rules/bug-label-rules.md#L105)) |

#### Ví dụ auto-gen hoạt động

**QC nhập chat:**
> "Crawl tiktok bị mapping sai field identity name, chạy ở staging"

**Skill tự suy ra:**
- `sys-crawling-auto` ← keyword `"crawl"` match
- `sys-transform` ← keyword `"mapping"` match
- `flow-transform` ← keyword `"mapping sai field"` match
- `test-functional` ← default khi không nêu rõ loại test
- `found-in-qc` ← default detection source

#### 🔧 3 điểm cần bổ sung để auto-gen đáng tin cậy

**1. Nâng `sys-*` từ "cảnh báo" → "bắt buộc" cho chat (kết hợp auto-infer)**

File cần sửa: [quality-rules.md#L87](file:///Users/tranthanhlam/product-ai-docs/.cursor/skills/ynm-qc/ynm-qc-jira-bugs/rules/quality-rules.md#L87)

Hiện tại:
```
Bắt buộc có tối thiểu một sys-* với nguồn Sheet/file; riêng nguồn chat, thiếu System chỉ là cảnh báo không chặn.
```
Đổi thành:
```
Bắt buộc có tối thiểu một sys-* cho mọi nguồn (Sheet/file và chat). 
Với chat, engine auto-infer sys-* từ keyword matching trước; nếu không match được keyword nào thì chặn và yêu cầu QC bổ sung.
```

**2. Thêm `rc-*` inference markers vào policies.json**

File cần sửa: [policies.json → `inference`](file:///Users/tranthanhlam/product-ai-docs/.cursor/skills/ynm-qc/ynm-qc-jira-bugs/config/policies.json#L68-L92)

Thêm section mới:
```json
"root_cause": {
  "rc-logic": ["sai logic", "code sai", "logic sai", "wrong logic", "bug logic"],
  "rc-validation": ["thieu validate", "missing validation", "sai validation", "khong validate"],
  "rc-data": ["du lieu sai", "data sai", "wrong data", "thieu data", "missing data"],
  "rc-config": ["sai config", "wrong config", "thieu config", "config sai"],
  "rc-integration": ["loi tich hop", "integration fail", "api contract", "service fail"],
  "rc-requirement": ["thieu requirement", "requirement sai", "yeu cau thieu", "spec sai"],
  "rc-infra": ["server die", "pod crash", "k8s fail", "infra fail"],
  "rc-external-api": ["external api", "third party", "platform change", "api thay doi"]
}
```

Đồng thời cập nhật [bug-label-rules.md#L20](file:///Users/tranthanhlam/product-ai-docs/.cursor/skills/ynm-qc/ynm-qc-jira-bugs/rules/bug-label-rules.md#L20):
```diff
- Chỉ thêm đúng một Root Cause label khi nguồn có field ROOT CAUSE, người dùng xác nhận hoặc Dev/Tech Lead đã phân tích. Không suy Root Cause từ System label, summary hay Actual.
+ Chỉ thêm đúng một Root Cause label khi: (a) nguồn có field ROOT CAUSE, (b) người dùng xác nhận, (c) Dev/Tech Lead đã phân tích, hoặc (d) engine auto-infer từ keyword matching trong Actual/Steps. 
+ Khi auto-infer rc-*, phải hiển thị rõ trong preview với tag [auto-inferred] và cho QC confirm/override trước khi tạo JIRA.
+ Nếu không match được rc-* nào, giữ trống và cảnh báo `root_cause_pending` — không bịa root cause.
```

**3. Confirmation step hiển thị labels đã auto-infer**

File cần sửa: [quality-rules.md#L106](file:///Users/tranthanhlam/product-ai-docs/.cursor/skills/ynm-qc/ynm-qc-jira-bugs/rules/quality-rules.md#L106)

Thêm vào preview format:
```
Labels (auto-inferred):
  ├── sys-crawling-auto    [inferred from: "crawl tiktok" in summary]
  ├── sys-transform        [inferred from: "mapping sai" in actual]  
  ├── flow-transform       [inferred from: "mapping sai field" in actual]
  ├── test-functional      [default: không xác định test type]
  ├── rc-logic             [inferred from: "sai logic" in actual] ⚠️ auto-inferred, please confirm
  └── found-in-qc          [default]
  
⚠️ Labels có tag [auto-inferred] cần QC xác nhận trước khi tạo JIRA.
Gõ "confirm labels" để chấp nhận, hoặc chỉnh sửa: "đổi rc-logic thành rc-validation"
```

---

### GAP 5: Jira Server vs Jira Cloud API mismatch

> [!WARNING]
> Skill viết cho Jira Cloud (`/rest/api/3/`), nhưng JIRA thực tế là **Jira Server 9.12.2** (`/rest/api/2/`).

Bằng chứng từ response:
```
"self": "https://jira.younetco.com/rest/api/2/issue/375798"
```

**Vấn đề trong skill:**
- [jira-cloud.md](file:///Users/tranthanhlam/product-ai-docs/.cursor/skills/ynm-qc/ynm-qc-jira-bugs/rules/jira-cloud.md#L61-L63): Dùng `/rest/api/3/issue`, `/rest/api/3/search/jql`, `/rest/api/3/issueLink`
- Jira Server 9.x dùng `/rest/api/2/` và **không có** ADF (Atlassian Document Format) cho description — chỉ dùng **wiki markup**

**Khuyến nghị:**
- Thêm config `jira_api_version` vào policies.json: `"2"` hoặc `"3"`
- Rename `jira-cloud.md` → `jira-integration.md` hoặc thêm section cho Server
- Description format: Jira Server dùng wiki markup (`{code}`, `*bold*`, `h3.`), không phải ADF
- `jira_client.py` cần branch logic cho API version

---

### GAP 6: Thiếu hỗ trợ "related task" linh hoạt

> [!IMPORTANT]
> Skill bắt buộc `--related-task` cho mọi bug. Nhưng Flow 2 QC muốn log nhanh — họ có thể chỉ có project key chứ không có task cụ thể.

Từ 6 bug mẫu:
- YNMPDP-5681: 0 issue links
- SHDIY-8772: 3 issue links
- YNMPDP-6218: 1 issue link

**Khuyến nghị:**
- Cho phép mode `--project-only` khi QC chỉ có project key mà không có task
- Vẫn cảnh báo khi thiếu related task, nhưng không block hoàn toàn
- Sau khi tạo bug, QC có thể link task sau

---

## ✅ Điểm mạnh đáng ghi nhận

| Aspect | Rating | Detail |
|---|---|---|
| **Kiến trúc module** | ⭐⭐⭐⭐⭐ | 18 modules tách biệt, clean separation of concerns |
| **Quality gates** | ⭐⭐⭐⭐⭐ | 5 states (READY_FOR_REVIEW → INVALID), rất mature |
| **Label taxonomy** | ⭐⭐⭐⭐⭐ | Allowlist-based, inference markers, rất chi tiết |
| **Safety & confirmation** | ⭐⭐⭐⭐⭐ | Preview → confirm → create, manifest resume |
| **Duplicate detection** | ⭐⭐⭐⭐ | Fingerprint + JQL + scoring |
| **Test coverage** | ⭐⭐⭐⭐ | 5 test files, fixtures |
| **Documentation** | ⭐⭐⭐⭐⭐ | 6 rules files, rất chi tiết |
| **Sensitive data** | ⭐⭐⭐⭐⭐ | Chặn token/session trong evidence URL |

---

## 🎯 Lộ trình cải thiện đề xuất

### Phase 1: Quick Wins (Ưu tiên cao — Flow 2)

1. **Auto-gen Labels cho chat** — Bật auto-infer `sys-*`, `flow-*`, `test-*` từ keyword matching + thêm `rc-*` inference markers + hiển thị labels đã infer trong preview để QC confirm
2. **Thêm NLP chat parser** — Extract Steps/Actual/Expected từ text tự do bằng LLM
3. **Parse environment từ Summary prefix** — `[Production]`, `[Staging]`
4. **Xử lý code block/log** — Tách code block ra `diagnostic_data`
5. **Fix API version** — Support Jira Server `/rest/api/2/` + wiki markup

### Phase 2: UX Improvements

6. **Cho phép `--project-only`** — Không bắt buộc related task cho quick bugs
7. **Giảm required fields cho chat** — Chỉ cần mô tả bug + task/project

### Phase 3: Advanced

8. **Few-shot examples** — Thêm examples từ 6 bug mẫu thực tế vào skill
9. **Template variants** — Template riêng cho backend bugs (có code/log) vs frontend bugs (có UI steps)
10. **Metrics tracking** — Log success/failure rate, thời gian log bug trước/sau khi dùng skill

---

## Tổng hợp: Danh sách file cần chỉnh sửa

| STT | File | Thay đổi | GAP liên quan |
|---|---|---|---|
| 1 | [policies.json](file:///Users/tranthanhlam/product-ai-docs/.cursor/skills/ynm-qc/ynm-qc-jira-bugs/config/policies.json) | Thêm `inference.root_cause` markers, thêm `title_prefixes.environment`, thêm `jira_api_version` | GAP 3, 4, 5 |
| 2 | [quality-rules.md](file:///Users/tranthanhlam/product-ai-docs/.cursor/skills/ynm-qc/ynm-qc-jira-bugs/rules/quality-rules.md) | Nâng `sys-*` chat từ cảnh báo → bắt buộc (kết hợp auto-infer), thêm preview format cho auto-inferred labels, giảm required fields cho chat | GAP 1, 4 |
| 3 | [bug-label-rules.md](file:///Users/tranthanhlam/product-ai-docs/.cursor/skills/ynm-qc/ynm-qc-jira-bugs/rules/bug-label-rules.md) | Cho phép auto-infer `rc-*` với confirmation step, cập nhật quy trình phân loại | GAP 4 |
| 4 | [bug-candidate.schema.json](file:///Users/tranthanhlam/product-ai-docs/.cursor/skills/ynm-qc/ynm-qc-jira-bugs/config/bug-candidate.schema.json) | Thêm field `diagnostic_data` cho code/log snippets | GAP 2 |
| 5 | [SKILL.md](file:///Users/tranthanhlam/product-ai-docs/.cursor/skills/ynm-qc/ynm-qc-jira-bugs/SKILL.md) | Giảm required chat fields, thêm `--project-only` mode | GAP 1, 6 |
| 6 | [jira-cloud.md](file:///Users/tranthanhlam/product-ai-docs/.cursor/skills/ynm-qc/ynm-qc-jira-bugs/rules/jira-cloud.md) | Rename → `jira-integration.md`, thêm section Jira Server API v2 + wiki markup | GAP 5 |

---

## Kết luận

Skill `ynm-qc-jira-bugs` có **kiến trúc engine rất mature** — separation of concerns, quality gates, label taxonomy, safety mechanisms đều ở level production. 

**Gap lớn nhất** là khoảng cách giữa input cấu trúc mà skill yêu cầu vs input tự do mà QC thực tế viết (Flow 2). Tin tốt là skill đã có sẵn **~80% hạ tầng inference** cho auto-gen labels — chỉ cần bổ sung `rc-*` markers, nâng `sys-*` chat lên bắt buộc (kết hợp auto-infer), và thêm confirmation step hiển thị rõ labels đã suy luận.

Ưu tiên số 1: **Auto-gen labels + NLP parser** — đây là 2 key enablers để sếp yêu cầu "log bug trên chat có labels đầy đủ" thành hiện thực.
