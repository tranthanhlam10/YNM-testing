# Test Case Review — 04-F04

> `/ynm-qc-review-testcase` · 27/07/2026
> **Nguồn TC:** `Downloads/[AI Studio][Crisis] Build Push Notification Mechanism - Build Push Notification Mechanism (1).csv` — 45 TC (`F04-TC-001`…`F04-TC-045`)
> **Spec đối chiếu:** [04-F04-push-notification.md](../04-F04-push-notification.md) (v1.2)
> **Plan đối chiếu:** [Overall](./04-crisis-realtime-monitoring-test-plan-overall.md) · [09 notification-jobs](./test-plan-09-notification-jobs.md) · [11 mobile-push-ui](./test-plan-11-mobile-push-notification-ui.md) · [12 web-login-ticket](./test-plan-12-mobile-web-login-ticket.md)
> **Guideline:** Writing Standardized Test Cases v1.0 (YouNet)

> **QC đọc gì:** Action board → §1 Fix → §2 Coverage → §3 Dup → §4 Design → §5 Scope cần chốt.
> **§2 ≠ §4:** §2 = BR/US/AC **chưa có TC nào** (presence) · §4 = **đã có TC** nhưng thiếu biên/ô/nhánh (depth).
> Finding Major+: **Evidence ‖ Rule ‖ Reason**. Appendix = audit / risk map.

---

## Action board

| | |
|--|--|
| **Gate / Score** | **NEED_FIX** · **Score 5.5**/10 |
| **Design Score** | **8.0**/10 · open 1/5 · Applicable: DES-BVA · DT · ST · PERM · ERR *(k = technique Partial+Missing, m = Applicable scored)* |
| **Risk map** | Tier: **HIGH** · Categories: RC-RELIAB · RC-PERF · RC-AUTH · RC-AUTHZ · RC-SEC · Source: **plan** (RK-07/RK-08 High P0; SC-04/SC-05 SP-T1) |
| **TC inventory** | 45 cases · `F04-TC-001`–`F04-TC-045` · 14 cột (không có Post-condition → WARN) |
| **Counts** | Critical 0 · Major 2 · Minor 5 · GAP P0 0 · GAP P1 0 · F-DES Major 1 |
| **Blocking** | *Không* — 0 Critical, 0 GAP P0 (presence FRD đủ) |
| **Next step** | Sửa 2 Major writing (Test Type NFR · Expected điều kiện) + bổ sung 4 biên §4; chốt scope §5 với QC lead. |
| **Owner / Due** | QC (NHIPT) · — |

### Checklist trước approve

| Done | Mức | Việc |
|:---:|---|---|
| ☐ | Must-fix | Đổi Test Type 5 TC NFR sang Performance (TC-034…038) + 2 TC Regression (TC-040, TC-041) |
| ☐ | Must-fix | Viết lại Expected dạng khẳng định cho TC-005, TC-012, TC-015, TC-022 (đang dùng "nếu" / trỏ BR) |
| ☐ | Must-fix | Bổ sung 4 biên còn thiếu (§4): 5m0s · 7:59 · 8:29 · đúng 72h |
| ☐ | Nice-to-have | Làm rõ Pre-condition 3 case NFR (TC-036/037/038): tool + ENV cụ thể thay vì "Có công cụ load test" |
| ☐ | Nice-to-have | Ghi dependency môi trường vào Remarks (BL-01 / GAP-04 / TBD-5) — **giữ Status = Open**, không đánh Blocked lúc viết |
| ☐ | Nice-to-have | Điền Remarks BR/US/AC cho 45 TC (hoặc tạo `04-F04-traceability.md`) |
| ☐ | Nice-to-have | Tách Priority theo Plan: verifier P0 / Leader P2 (đang toàn Medium) |
| ☐ | Nice-to-have | Gộp assert 65s của TC-001 vào TC-039 |
| ☐ | Nice-to-have | Bỏ chữ "WebView" khỏi Expected TC-031 (xem §5 AMB-01) |
| ☐ | Cần chốt | Scope §5: bộ TC ticket (TTL/one-time/no-JWT), mark-đã-push, mobile list/detail — có thuộc sheet này không |

---

## 1. Fix existing TC

Sửa trên case **đã có**. Critical → Major → Minor.

| Done | Sev | Code | TC | Error (Evidence ‖ Rule ‖ Reason) | Action |
|:---:|---|---|---|---|---|
| ☐ | Major | F-FMT-TYPE | TC-034…038 (+040, 041) | Evidence: TC-036 `TEST TYPE = Functional` nhưng Expected `P95 response time < 500ms`; tương tự TC-034/035 (trễ ≤30s), TC-037 (P95 < 60s), TC-038 (cron < 30s); TC-040/041 tên "Regression …" vẫn Functional ‖ Rule: `F-FMT-TYPE` ‖ Reason: 5 case đo hiệu năng đang bị xếp là Functional, nên khi chạy vòng functional (Wave W3) tester không chuẩn bị APM/load tool và sẽ bỏ qua hoặc chạy sai cách; Plan xếp các case này ở Wave W4 (NFR-T-01…05). | Đổi Test Type: Performance cho TC-034…038, Regression cho TC-040/041 |
| ☐ | Major | F-FMT-EXP | TC-005, TC-012, TC-015, TC-022 | Evidence: TC-015 Expected `Push count = 1 nếu chỉ mention mới đủ điều kiện`; TC-022 `Gửi push escalation nếu có tồn đọng`; TC-005 `Đủ điều kiện nhận push verifier nếu có pending`; TC-012 `Push được gửi theo BR-06/BR-10` ‖ Rule: `F-FMT-EXP` ‖ Reason: 4 Expected này dùng "nếu" hoặc trỏ sang mã BR nên không chốt được pass/fail — hai tester đọc cùng case có thể kết luận khác nhau. TC-012 và TC-015 nằm trên đường P0 (NJ-01, NJ-04). | Viết oracle cụ thể: TC-015 `Push count = 1; mention 4 ngày không được tính`; TC-012 `Push gửi tới thiết bị đã login; title "Có 2 tin chờ verify"`; TC-022/TC-005 nêu rõ điều kiện đã set trong Test Data |
| ☐ | Minor | F-FEAS | TC-036, TC-037, TC-038 (+ nhóm cần time-mock/FCM: TC-011, 015, 018, 020, 021, 022, 026, 027, 045, 007, 017, 029, 030) | Evidence: TC-036 Pre-condition = `Có công cụ load test` (không nêu tool / ENV), Steps `Gửi heartbeat 1000 request`; TC-037/038 tương tự không nêu công cụ đo. Nhóm còn lại cần time-mock hoặc FCM sandbox mà Plan đang để Open: Overall §16 `BL-01 STAGING/FCM chưa sẵn`, §12 `GAP-04 ENV: STAGING URL/FCM/time-mock`, plan-09 §6 `B-03 Presence schema TBD-5` ‖ Rule: `F-FEAS` ‖ Reason: tester nhận TC-036 không biết dùng tool nào, chạy ở ENV nào nên phải đi hỏi trước khi chạy; các case cần time-mock/FCM cũng không ghi phụ thuộc nên khi lên lịch W3 dễ bị giao lẫn với case chạy được ngay. | Pre-condition TC-036/037/038 ghi tool + ENV cụ thể (vd. `k6 trên ENV-02, APM bật cho /heartbeat`); các case còn lại ghi dependency vào Remarks (`cần time-mock — GAP-04`). **Giữ Status = Open** — Blocked là trạng thái khi chạy, không phải lúc viết |
| ☐ | Minor | F-TRC | 45/45 TC | Evidence: cột `REMARKS` trống toàn bộ 45 dòng; `qc-docs/` không có `04-F04-traceability.md` (chỉ có bản của F05) ‖ Rule: `F-TRC` ‖ Reason: không có cột nào nối case về BR/US/AC nên khi FRD đổi rule, QC phải đọc lại từng case để biết case nào bị ảnh hưởng. | Điền Remarks `BR-xx / US-xx-AC-yy` hoặc tạo file traceability |
| ☐ | Minor | F-FMT-PRIO | 45/45 TC | Evidence: cột `PRIORITY` = `Medium` ở toàn bộ 45 dòng; Plan Overall §3.6 xếp `SC-04`/`SC-05` = **P0 SP-T1**, `SC-09` (Leader) = **P2 SP-T3 OUT D1** ‖ Rule: `F-FMT-PRIO` ‖ Reason: mọi case cùng Medium nên không biết chạy gì trước; đặc biệt 11 case Leader (TC-018…028) thực tế ngoài phạm vi D1 vẫn trông ngang hàng với case verifier P0. | Đặt P0 cho verifier/presence/nav, P2 cho nhóm Leader |
| ☐ | Minor | F-DUP-SOFT | TC-001 ↔ TC-039 | Evidence: TC-001 Expected `last_seen_at được cập nhật trong vòng 65s`; TC-039 Expected `Trạng thái phản ánh online trong 65s sau ping hợp lệ cuối` ‖ Rule: `F-DUP-SOFT` ‖ Reason: hai case assert cùng mốc 65s; TC-001 là case functional heartbeat, TC-039 là case NFR freshness — giữ mốc 65s ở một chỗ để khỏi sửa hai nơi khi buffer đổi. | TC-001 chỉ assert `last_seen_at` được cập nhật + trạng thái online; để mốc 65s cho TC-039 |
| ☐ | Minor | F-ACC-SPEC | TC-031 | Evidence: TC-031 Expected `Mở Crisis Content Monitoring trong WebView`; FRD BR-19 ghi chú `Phương thức mở (WebView / external browser) do Dev quyết định`; plan-12 §1 `CTA Detail → issue ticket → external browser login_url`, §1 Out: `ép WebView (arch = browser)` ‖ Rule: `F-ACC-SPEC` ‖ Reason: FRD US-04-AC-03 có chữ "WebView" nhưng BR-19 để Dev chọn và kiến trúc D1 đã chốt external browser — nếu Dev làm đúng browser thì TC-031 vẫn Fail và tester báo bug oan. | Bỏ ràng buộc phương thức: `Trang Crisis Content Monitoring mở ở tab "Cần xét duyệt", không yêu cầu đăng nhập lại` (xem AMB-01) |

---

## 2. Coverage — BR chưa có TC (presence)

> **Chỉ hỏi:** Spec ID này đã có **≥1 TC** chưa?
> **Không hỏi:** biên / BVA / ô DT — cái đó là **§4**.

**Presence: đủ — mọi BR/US/AC trong scope đã có ≥1 TC.** BR-01…BR-20, US-01…US-04 (17 AC), EC-01…EC-05 và 6 NFR S4 đều có case neo — chi tiết Appendix D.

*(Test area của Detail Plan chưa có TC → §5, không phải GAP presence: đó là hạng mục tech-layer không có BR/US/AC tương ứng trong FRD.)*

---

## 3. Duplicates — giữ / bỏ

| Giữ | Bỏ / gộp | Lý do ngắn |
|---|---|---|
| TC-039 (NFR freshness 65s) | Mốc 65s trong Expected TC-001 | Cùng assert 65s; TC-001 chỉ cần assert `last_seen_at` + online |

Không có trùng cứng (`F-DUP`) — các cặp gần nhau đều assert khác nhau: TC-002 (offline theo gap) vs TC-003 (offline do 401); TC-011/045 (khung đêm verifier) vs TC-021 (khung đêm Leader); TC-024 (user không permission) vs TC-025 (không ai có permission).

---

## 4. Design — đã có TC, thiếu độ sâu (depth)

> **Chỉ hỏi:** TC **đã cover** rule — còn thiếu biên/ô/nhánh không?
> **Không hỏi:** "BR chưa có TC" — cái đó là **§2**.

**Depth:** CÒN VIỆC (1 technique Partial — DES-BVA · 4 biên) · DT / ST / PERM / ERR ổn

| # | Prio | TC neo (đã có) | Biên / ô / nhánh còn thiếu | Gợi ý bổ sung (input → expected) |
|---|------|----------------|----------------------------|----------------------------------|
| 1 | P0 | TC-002 (gap 5m 1s) | Biên đúng **5m 0s** của mốc "> 5 phút" (BR-03) | `gap = 5m 0s` → user **vẫn online** (rule dùng `>`, không `>=`) |
| 2 | P0 | TC-012 (08:00 chạy) | Biên **7:59** của khung 8:00–24:00 (BR-09) | `cron_time = 07:59` → cron verifier không được kích hoạt, không push |
| 3 | P1 | TC-022 (08:30 chạy) · TC-021 (08:15) | Biên **8:29** của khung 8:30–24:00 (BR-15) — 08:15 không phải biên | `cron_time = 08:29` → cron Leader không kích hoạt |
| 4 | P1 | TC-015 (4 ngày / 2 ngày) | Biên **đúng 72h** của Pending window 3 ngày | `copied_at = now − 72h 0m` và `now − 72h 1m` → chỉ mention trong 3 ngày được tính |

Đã đủ độ sâu: threshold 30 phút (TC-020 đúng 30m0s + TC-018 31m — có cả hai phía), tổ hợp offline ∧ pending ∧ app-login (TC-007 all-true + TC-008/009/010 mỗi lần một điều kiện false), state online↔offline (TC-001…005), permission allow/deny (TC-024/025/042), error path push fail (TC-033).

---

## 5. Scope cần chốt — test area Plan chưa có TC · ambiguity

Không tính vào Score (không phải BR/US/AC của FRD) nhưng cần QC lead xác nhận: sheet này chỉ phủ FRD, hay phủ cả 3 Detail Plan.

| # | Prio Plan | Area | Chưa có TC | Oracle sẵn có? |
|---|---|---|---|---|
| S-01 | **P0** | [plan-12](./test-plan-12-mobile-web-login-ticket.md) MLT-04 · MLT-05 | Ticket TTL **120s** hết hạn → login; ticket **one-time** (dùng lại bị từ chối); **revoke khi logout** | Có — TTL 120s + one-time + revoke ghi trong plan-12 §1/§4-5 |
| S-02 | **P0** | plan-12 MLT-07 (Sec) | `login_url` **không chứa JWT** | Có — plan-12 §1 "Không JWT trên URL" |
| S-03 | **P0** | [plan-09](./test-plan-09-notification-jobs.md) NJ-05 | **mark đã-push** → chu kỳ cron kế tiếp không push lặp cùng bộ pending | Có — plan-09 §1 "mark đã-push"; FRD không nêu |
| S-04 | P1 | plan-12 MLT-03 | Deep link mang `rule_id` (TC-032 chỉ assert `return_url`) | Một phần — plan-12 §3 dẫn arch §5.12 |
| S-05 | P1 (Blocked) | [plan-11](./test-plan-11-mobile-push-notification-ui.md) MPU-03/04/05 | Notification list gộp + empty/loading/error · Detail breakdown Rule + Negative Level · API list/detail PIC + mark read | **Chưa** — plan-11 §6 `B-01 endpoint TBD (SKELETON)`, `B-02 mark read chờ BA` → nên viết case Status Blocked |

**Ambiguity / oracle mơ hồ**

| ID | Nội dung | Nguồn xung đột | Đề xuất |
|---|---|---|---|
| AMB-01 | Phương thức mở Crisis Content Monitoring: **WebView** hay **external browser** | FRD US-04-AC-03 ghi "trong WebView" ↔ FRD BR-19 ghi chú "do Dev quyết định" ↔ plan-12 + arch D1 = external browser (Out: "ép WebView") | Oracle TC không ràng buộc phương thức (xem §1 TC-031); BA chốt lại AC-03 cho khớp BR-19 |
| AMB-02 | 11 case Leader (TC-018…028, 041, 043) thuộc `SC-09` = **OUT D1** (DEC-02, RK-12) nhưng nằm chung sheet, cùng Priority Medium | Plan Overall §1.3 + §3.6 + DEC-02 | Giữ case nhưng đánh P2 + Remarks "P2-01 / OUT D1" để không bị chạy như P0 ở W3 |

---

## Appendix A — Scope & limitation

- **Review mode:** `full` (có FRD v1.2 + Overall Plan + 3 Detail Plan)
- **Sampling:** 100% (45/45 TC) — tier HIGH, oracle-critical full-scan
- **Limitation:**
  - Không đối chiếu tech spec chi tiết (`tasks/09|11|12/*`) — ngoài phạm vi skill review TC; các hạng mục tech-layer đã gom ở §5.
  - Không chấm chất lượng FRD/Plan (→ `/ynm-qc-review-docs`, `/ynm-qc-review-techs`). AMB-01 chỉ ghi nhận xung đột, không NC BA.
  - Không sửa file CSV.
- **Risk sampling:**

| Module / Area | Tier | Source ref | Categories | Sampling | Design bar |
|---------------|------|------------|------------|----------|------------|
| Verifier cron + presence (NJ-*) | HIGH | Plan RK-07/08 High P0 · SC-04 SP-T1 | RC-RELIAB · RC-PERF · RC-AUTH | Full | High |
| Mobile UI + login ticket (MPU-*, MLT-*) | HIGH | Plan RK-08 · SC-05 SP-T1 | RC-RELIAB · RC-AUTH · RC-SEC | Full | High |
| Leader escalation | LOW | Plan RK-12 Low P2 · SC-09 OUT D1 (DEC-02) | RC-AUTHZ | Full (đã có sẵn) | Baseline — không uplift |

---

## Appendix B — Guideline checklist (R1–R11)

Tick **derived** từ finding / STEP — [`review-boundaries.md`](../../../../.cursor/skills/ynm-qc/ynm-qc-review-testcase/rules/review-boundaries.md).

| # | Tiêu chí | Result | Note |
|---|---|---|---|
| R1 | Format Compliance | **FAIL** | `F-FMT-TYPE` + `F-FMT-EXP` Major trên đường P0 |
| R2 | Clarity | PARTIAL | Expected dùng "nếu" / trỏ mã BR (4 TC) |
| R3 | Uniqueness | PARTIAL | Chỉ `F-DUP-SOFT` (TC-001↔039), không có `F-DUP` |
| R4 | Completeness | PARTIAL | Remarks trống 45/45; sheet không có cột Post-condition (WARN) |
| R5 | Accuracy | PARTIAL | TC-031 WebView vs arch D1 (AMB-01); phần còn lại khớp FRD |
| R6 | Traceability | PARTIAL | `F-TRC` Minor — Remarks trống, chưa có file traceability F04 |
| R7 | Automation-ready | PARTIAL | derived `F-FMT-EXP` (oracle chưa chốt); Steps đánh số + có Verify là tốt |
| R8 | Feasibility | PARTIAL | derived `F-FEAS` Minor — Pre-condition 3 case NFR chưa nêu tool/ENV; dependency môi trường chưa ghi ở Remarks |
| R9 | Coverage | **PASS** | Presence FRD đủ (Appendix D); thiếu hụt là test area Plan → §5 |
| R10 | Reusability | **PASS** | Test Data dùng `<var>` nhất quán, Steps tham chiếu biến — không hard-code hàng loạt |
| R11 | Review readiness | PASS | Mọi Major có Evidence ‖ Rule ‖ Reason |

---

## Appendix C — Findings detail (evidence)

| ID | Sev | Code | TC | Issue | Remediation |
|---|---|---|---|---|---|
| F-01 | Major | F-FMT-TYPE | TC-034…038, 040, 041 | NFR/Regression gắn Test Type = Functional | Đổi Type theo nội dung |
| F-02 | Major | F-FMT-EXP | TC-005, 012, 015, 022 | Expected điều kiện ("nếu") / trỏ mã BR | Viết oracle đo được |
| F-03 | Minor | F-FEAS | TC-036, 037, 038 (+ nhóm time-mock/FCM) | Pre-condition NFR không nêu tool/ENV; dependency môi trường không ghi | Pre-condition cụ thể; dependency vào Remarks (giữ Status Open) |
| F-04 | Minor | F-TRC | 45/45 | Remarks trống, không file traceability | Điền link BR/US/AC |
| F-05 | Minor | F-FMT-PRIO | 45/45 | Toàn bộ Priority = Medium | Tách P0/P2 theo Plan |
| F-06 | Minor | F-DUP-SOFT | TC-001 ↔ 039 | Trùng assert mốc 65s | Gộp về TC-039 |
| F-07 | Minor | F-ACC-SPEC | TC-031 | Hardcode WebView, xung đột arch D1 | Bỏ ràng buộc phương thức |
| F-08 | Major | F-DES-PART | TC-002, 012, 022, 015 | DES-BVA Partial — thiếu 4 biên (§4) | Bổ sung 4 case biên |

---

## Appendix D — Coverage vs spec

| Req / BR / AC / NFR | Status | TC ID |
|---|---|---|
| BR-01 heartbeat 60s (web only) | Covered | TC-001, TC-006 |
| BR-02 cập nhật `last_seen_at` | Covered | TC-001 |
| BR-03 `> 5 phút` → offline (gồm chưa từng heartbeat) | Covered (thiếu biên 5m0s → §4) | TC-002, TC-005 |
| BR-04 heartbeat 401 → offline ngay | Covered | TC-003 |
| BR-05 offline + heartbeat hợp lệ → online | Covered | TC-004 |
| BR-06 offline ∧ pending ≥1 ∧ đã login app → push mọi thiết bị | Covered | TC-007, TC-010, TC-017 |
| BR-07 online → không push | Covered | TC-008 |
| BR-08 Pending window = 0 → không push | Covered | TC-009 |
| BR-09 cron verifier chỉ 8:00–24:00 | Covered (thiếu biên 7:59 → §4) | TC-011, TC-012, TC-045 |
| BR-10 count tại thời điểm cron | Covered | TC-013, TC-016 |
| BR-11 job 8:30 no-app → 1 push gộp, 1 lần/ngày | Covered | TC-026, TC-027 |
| BR-12 tồn đọng > threshold (Negative, pending) | Covered | TC-018, TC-020, TC-043 |
| BR-13 body liệt kê từng verifier, loại verifier sạch | Covered | TC-018, TC-023 |
| BR-14 không tồn đọng → không push | Covered | TC-019 |
| BR-15 cron Leader chỉ 8:30–24:00 | Covered (thiếu biên 8:29 → §4) | TC-021, TC-022 |
| BR-16 không permission → không nhận | Covered | TC-024 |
| BR-17 tap OS push → Notification Detail | Covered | TC-029 |
| BR-18 tap Notification Center → Detail | Covered | TC-030 |
| BR-19 CTA → auto-auth → tab "Cần xét duyệt" | Covered (oracle cần sửa — AMB-01) | TC-031 |
| BR-20 auto-auth fail → login + `return_url` | Covered | TC-032 |
| Pending window: `is_migrated` ON · 3 ngày · status pending | Covered (thiếu biên 72h → §4) | TC-014, TC-015, TC-016 |
| EC-01 push fail → log, không retry cùng lần cron | Covered | TC-033 |
| EC-02 no-app escalation | Covered | TC-026 |
| EC-03 không ai có permission | Covered | TC-025 |
| EC-04 Leader kiêm PIC → 2 push độc lập | Covered | TC-028 |
| EC-05 auto-auth fail | Covered | TC-032 |
| US-01 (6 AC) | Covered | TC-001…013 |
| US-02 (5 AC) | Covered | TC-018…025, TC-028 |
| US-03 (2 AC) | Covered | TC-025, TC-026 |
| US-04 (4 AC) | Covered | TC-029…032 |
| NFR cron verifier trễ ≤30s | Covered (Type sai → §1) | TC-034 |
| NFR cron Leader trễ ≤30s | Covered (Type sai) | TC-035 |
| NFR heartbeat P95 < 500ms | Covered (Type sai) | TC-036 |
| NFR push delivery P95 < 60s | Covered (Type sai) | TC-037 |
| NFR cron execution < 30s | Covered (Type sai) | TC-038 |
| NFR online freshness ≤ 65s | Covered | TC-039 |
| Scope IN: permission mới trên UI Role & Permission | Covered | TC-042 |
| Scope OUT: per-mention push | Covered (negative) | TC-044 |
| Config động: verifier interval · Pending threshold | Covered | TC-040, TC-041 |

---

## Appendix E — Structure / order

**OK** — sheet đi theo nhóm chức năng: heartbeat/presence (001–006) → verifier cron (007–017) → Leader escalation (018–028) → navigation (029–032) → error (033) → NFR (034–039) → regression/config (040–045). Khớp thứ tự Guideline §6 (positive → negative → boundary → business rule → exception → performance).

---

## Appendix F — Change log

| Date | Reviewer | Note |
|---|---|---|
| 27/07/2026 | AI `/ynm-qc-review-testcase` | Review 45 TC từ Downloads CSV, đối chiếu FRD v1.2 + Overall Plan + Detail 09/11/12. NEED_FIX · Score 5.5 · Design 8.0 (open 1/5). 2 Major writing (Test Type NFR, Expected điều kiện), 5 Minor, 1 F-DES-PART (4 biên). Presence FRD đủ 100%; test area Plan chưa có TC gom vào §5 để chốt scope. `F-FEAS` hạ Major→Minor: `Blocked` là trạng thái thực thi, không áp lúc viết TC — chỉ yêu cầu ghi dependency + Pre-condition cụ thể. |