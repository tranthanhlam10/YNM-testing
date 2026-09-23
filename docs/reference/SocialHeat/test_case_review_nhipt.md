# Test Case Review — 04-F05

> `/ynm-qc-review-testcase` · 24/07/2026  
> **Nguồn TC:** `C:\Users\nganltk.YNG\Downloads\[AI Studio][Crisis] AI Negative Level Classification - [Crisis] AI Negative Level Classification.csv`  
> **Spec đối chiếu:** `SocialHeat/specs/04-crisis-realtime-monitoring/04-F05-crisis-negative-level-classification.md`  
> **Guideline:** Writing Standardized Test Cases v1.0 (YouNet)

> **QC đọc gì:** Action board → §1 Fix → §2 Add → §3 Dup. Appendix chỉ khi cần bằng chứng / audit.

---

## Action board

| | |
|--|--|
| **Gate / Score** | NEED_FIX · 6.0/10 |
| **TC inventory** | 57 cases · TC-F05-001–TC-F05-057 |
| **Counts** | Critical 1 · Major 7 · Minor 9 · GAP P0 1 · GAP P1 4 |
| **Blocking** | F-01 tag `597462` → `597426`; GAP-01 (BR-09 từng field) |
| **Next step** | Blocker + Expected sai (009/020/043) + GAP-01 → re-review Step 2–4 |
| **Owner / Due** | — · — |

### Checklist trước approve

| Done | Mức | Việc |
|:---:|---|---|
| ☐ | Blocker | TC-041: tag `597462` → `597426` |
| ☐ | Blocker | Viết 2 TC GAP-01 (thiếu chỉ CHỦ THỂ / chỉ QUY TẮC) |
| ☐ | Must-fix | Sửa Expected sai/thiếu: 009, 020, 043; Blocked/TBD TC-038 |
| ☐ | Must-fix | Xóa TC-017, TC-025; Type NFR 031–033, 053 |
| ☐ | Nice-to-have | Vague 002/033; exclusion default 008; GAP-02…05; Module/Remarks |

---

## 1. Fix existing TC

Sửa trên case **đã có**. Critical → Major → Minor.

| Done | Sev | Code | TC | Error | Action |
|:---:|---|---|---|---|---|
| ☐ | Critical | F-ACC-DATA | TC-F05-041 | Tag testing `597462` ≠ FRD `597426`; mâu thuẫn TC-044 | Data + Expected → `597426` |
| ☐ | Major | F-ACC-SPEC | TC-F05-009 | Expected chỉ CHỦ THỂ + Level 1/2/3; **thiếu TRƯỜNG HỢP LOẠI TRỪ** theo BR-04 (Template Level = 3 mục Definition). AC-03 cũng ghi 2 phần — lệch BR | Expected: thêm section TRƯỜNG HỢP LOẠI TRỪ (cite BR-04); OQ BA nếu giữ AC-03 |
| ☐ | Major | F-ACC-SPEC | TC-F05-020 | Expected “Binary **2 section**” — BR-03 Binary = CHỦ THỂ + LOẠI TRỪ + QUY TẮC (**3 mục**). “2 section” theo wording EC/AC cũ → oracle sai | Expected → Template Binary 3 mục (không chia level) |
| ☐ | Major | F-FMT-EXP | TC-F05-043 | Skip hết retry (BR-18) nhưng Expected **không** assert `crisis_level = null` / `negative_level = null` (050 có đủ) | Expected: thêm 2 assert null như TC-050 |
| ☐ | Major | F-ACC-SPEC | TC-F05-038 | Assert OFF + `crisis_level = 0` → null — **BR-11 chỉ cover toggle ON**; không có BR cho OFF+0 | Status → `Blocked`/`Ignore` + Remarks OQ; hoặc xóa tới khi BA chốt |
| ☐ | Major | F-DUP | TC-016 / 017 | Trùng Confirm bật + cursor Level 1 | Xóa TC-017 |
| ☐ | Major | F-DUP | TC-025 / 026 | Trùng Save Binary happy; 025 chỉ note exclusion | Gộp note vào Expected 026; xóa 025 |
| ☐ | Major | F-FMT-TYPE | TC-031, 032, 033, 053 | NFR nhưng Type=Functional | Type → Performance; Priority → Low; thiếu APM → Blocked |
| ☐ | Minor | F-FMT-EXP | TC-F05-002 | “Chọn được bình thường” — không đo được | Expected: chọn được option Crisis Classification; không toast lỗi |
| ☐ | Minor | F-FMT-EXP | TC-F05-033 | “không lag rõ rệt” — mơ hồ; đã có P95 &lt;300ms | Xóa cụm lag; giữ P95 &lt; 300ms |
| ☐ | Minor | F-FMT-EXP | TC-F05-008 | Có đủ 3 mục Binary nhưng **không** assert dòng exclusion mặc định (BR-03) | Expected: TRƯỜNG HỢP LOẠI TRỪ có dòng default “không phải tiếng Việt” |
| ☐ | Minor | F-FMT-STEP | TC-021–024, 036, 045–052 | P0 thiếu bước Verify | Thêm Verify cho kết quả chính |
| ☐ | Minor | F-FMT-MOD | ~18 TC | Module trống | Điền `AI Negative Level` |
| ☐ | Minor | F-FMT-PRIO | All | Toàn Medium | High: permission/save/map/DLQ; Low: animation/NFR |
| ☐ | Minor | F-TRC | ~001–040 | Không cite BR/US | Remarks / Trace |
| ☐ | Minor | F-FMT-NAME | TC-F05-047 | Name nhồi mã BR | Bỏ `(BR-15 đến BR-18)` |
| ☐ | Minor | F-DUP-SOFT | TC-006 / 007 | 007 lặp animation của 006 | Xóa TC-007 |

---

## 2. Add missing TC (GAP)

| Done | Prio | GAP | Spec | Case cần viết (input → expected) |
|:---:|---|---|---|---|
| ☐ | P0 | GAP-01 | BR-09 | (1) Toggle OFF, có QUY TẮC, thiếu CHỦ THỂ → block Save + `validation.definition_required`<br>(2) Toggle OFF, có CHỦ THỂ, thiếu QUY TẮC → cùng message |
| ☐ | P1 | GAP-02 | BR-16, BR-17 | Mid-success bước 3 (gpt-4.1) và bước 4 (gemini-3) |
| ☐ | P1 | GAP-03 | BR-14 | Staging → tag `593346`; production → `602334` khi crisis_level ≥ 1 |
| ☐ | P1 | GAP-04 | (FRD chưa tách) | Toggle OFF + crisis_level ∈ {2,3}/invalid — Blocked/TBD (liên quan TC-038) |
| ☐ | P1 | GAP-05 | BR-09 / US Edit | Edit form + Binary đủ CHỦ THỂ+QUY TẮC → Save OK + `save.success` (sheet chỉ có Create 026 + Edit Level 028) |

---

## 3. Duplicates — giữ / bỏ

| Giữ | Bỏ / gộp | Lý do ngắn |
|---|---|---|
| TC-F05-016 | TC-F05-017 | Confirm + reset; cursor đã có trong 016 |
| TC-F05-026 | TC-F05-025 | Save Binary happy; 025 chỉ note exclusion |
| TC-F05-006 | TC-F05-007 | Soft: animation đã nằm trong 006 |

**Không gộp:** TC-015 ≠ 016 (Cancel vs Confirm).

---

## Appendix A — Scope & limitation

- **Review mode:** `full` (có FRD 04-F05)
- **Limitation:** Chỉ CSV Downloads user `@`; không trộn `qc-docs/04-F05-test-cases.*`. Chưa đọc tech-spec. Thiếu cột Post-condition → WARN. ID convention: `TC-F05-###`.
- **Re-audit:** 24/07/2026 — bổ sung Expected sai/mơ hồ + GAP Edit Binary.

---

## Appendix B — Guideline checklist (R1–R11)

| # | Tiêu chí | Result | Note |
|---|---|---|---|
| R1 | Format Compliance | FAIL | Module trống 18/57; Priority 57× Medium; Type 57× Functional |
| R2 | Clarity | PARTIAL | Phần lớn rõ; 002/033 Expected mơ hồ |
| R3 | Uniqueness | FAIL | DUP 016↔017, 025↔026; soft 006↔007 |
| R4 | Completeness | PASS | Không TC trống lõi |
| R5 | Accuracy | FAIL | Tag 041; Binary “2 section” 020; 009 thiếu loại trừ; 043 thiếu null; 038 không có BR |
| R6 | Traceability | PARTIAL | 14/57 có Remarks BR/US/QC |
| R7 | Automation-ready | PARTIAL | Ít Verify trên P0 |
| R8 | Feasibility | PASS | Cần stub LLM/DLQ; NFR cần APM |
| R9 | Coverage | PARTIAL | GAP-01…05 |
| R10 | Reusability | PASS | Data dạng biến |
| R11 | Review readiness | FAIL | Critical + GAP P0 + Expected sai |

---

## Appendix C — Findings detail (evidence)

| ID | Sev | Code | TC | Issue | Remediation |
|---|---|---|---|---|---|
| F-01 | Critical | F-ACC-DATA | 041 | Tag `597462` ≠ `597426` | → `597426` |
| F-02 | Major | F-ACC-SPEC | 009 | Thiếu TRƯỜNG HỢP LOẠI TRỪ vs BR-04 | Bổ sung Expected / OQ BA |
| F-03 | Major | F-ACC-SPEC | 020 | “2 section” ≠ Binary 3 mục BR-03 | Sửa Expected |
| F-04 | Major | F-FMT-EXP | 043 | Thiếu null levels sau BR-18 | Thêm assert như 050 |
| F-05 | Major | F-ACC-SPEC | 038 | OFF+0 không có BR | Blocked/TBD |
| F-06 | Major | F-DUP | 016/017 | Trùng Confirm+cursor | Xóa 017 |
| F-07 | Major | F-DUP | 025/026 | Trùng Save Binary | Xóa 025 |
| F-08 | Major | F-FMT-TYPE | 031–033, 053 | NFR = Functional | Đổi Type |
| F-09 | Minor | F-FMT-EXP | 002 | “bình thường” | Cụ thể hóa |
| F-10 | Minor | F-FMT-EXP | 033 | “không lag rõ rệt” | Xóa cụm |
| F-11 | Minor | F-FMT-EXP | 008 | Thiếu dòng exclusion default | Bổ sung Expected |
| F-12–F-16 | Minor | FMT/TRC/DUP-SOFT | … | Module, Priority, Trace, Name, soft-dup | Như §1 |

---

## Appendix D — Coverage vs spec

| Req / BR / AC / NFR | Status | TC ID hoặc GAP |
|---|---|---|
| BR-01 Permission Create/Edit | Covered | 001–003 |
| BR-02 Toggle ẩn | Covered | 004, 005 |
| BR-03 Binary default (+ dòng exclusion) | Partial | 008 (thiếu assert dòng default) |
| BR-04 Level đủ 3 mục Definition | Partial | 009 thiếu loại trừ; 010 đủ |
| BR-05 / 06 Confirm | Covered | 014–020 (017 trùng) |
| BR-07 Task change | Covered | 006 |
| BR-08 thiếu level + highlight | Covered | 023, 024 (có highlight) |
| BR-09 template mặc định | Covered | 021, 022 |
| BR-09 từng field | **Gap** | GAP-01 |
| Save Binary Create | Covered | 026 (025 trùng) |
| Save Binary Edit | **Gap** | GAP-05 |
| Save Level / Reload / fail | Covered | 027–030 |
| S4 NFR | Covered (type/vague) | 031–033, 053 |
| BR-10…12 | Covered / risk | 036–039 (038 risk) |
| BR-14 tag | Partial | 041 sai; GAP-03 |
| BR-13…18 DLQ | Covered / thin | 045–050 (043 thiếu null) |
| Mid-success 3/4 | **Gap** | GAP-02 |
| BR-19 / QC | Covered | 051–057 |
| DOC-GAP OFF + level lạ | **Gap** | GAP-04 |

---

## Appendix E — Structure / order

OK — khớp guideline §6. Không sắp lại lớn.

---

## Appendix F — Change log

| Date | Reviewer | Note |
|---|---|---|
| 24/07/2026 | AI `/ynm-qc-review-testcase` | Full review Downloads CSV (57 TC) |
| 24/07/2026 | AI `/ynm-qc-review-testcase` | Restructure reader-first |
| 24/07/2026 | AI `/ynm-qc-review-testcase` | Re-audit: Expected sai/mơ hồ (009/020/043/038/002/033/008) + GAP-05 Edit Binary; Score 6.0 |