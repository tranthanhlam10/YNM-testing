# Quy tắc gắn label bug YouNet

Nguồn chuẩn: [QUY ƯỚC ĐÁNH LABEL BUG](https://wiki.younetco.com/pages/viewpage.action?pageId=274915579), page ID `274915579`, version `29`, cập nhật `2026-07-15`.

## Thứ tự ưu tiên khi tài liệu có nội dung cũ

1. Áp dụng changelog và mục 4.1 mới nhất: môi trường phát hiện bug nằm trong custom field `Found In Environment`; không dùng label `found-in-*`.
2. Hiểu “Detection Source” còn sót ở mục 5 là dữ liệu môi trường phát hiện bug, không tự tạo thêm label ngoài taxonomy.
3. Cho phép để trống Root Cause lúc tạo bug khi chưa đủ phân tích theo mục 7.3, nhưng phải cảnh báo và cập nhật trước khi đóng bug.

## Quy trình phân loại

1. Map môi trường nguồn sang đúng một giá trị `Found In Environment`: `Testing`, `Staging` hoặc `Production`. Không đoán khi nguồn chỉ nêu browser/OS mà không nêu stage.
2. Chọn tối thiểu một System label từ hành vi quan sát được. Cho phép nhiều System label khi bug thực sự ảnh hưởng nhiều hệ thống.
3. Chọn đúng một Test Type label theo hoạt động test đã bắt được bug. Ưu tiên `TEST TYPE` nguồn; không suy ra từ những loại test có thể bắt được bug.
4. Chỉ thêm Flow label khi source/steps/actual chỉ rõ flow tương ứng. Flow là optional.
5. Chỉ thêm đúng một Root Cause label khi nguồn có field `ROOT CAUSE`, người dùng xác nhận hoặc Dev/Tech Lead đã phân tích. Không suy Root Cause từ System label, summary hay Actual.
6. Chỉ thêm `lc-reopen` khi bug thật sự được mở lại sau khi đã fix/closed.
7. Giữ label truy vết như `generated-by-qc`, `linked-testcase` hoặc `no-testcase`, nhưng không dùng chúng thay cho taxonomy bắt buộc.

## Root Cause — đúng một label khi đã xác nhận

| Label | Dùng khi |
| --- | --- |
| `rc-requirement` | Requirement thiếu, mơ hồ, mâu thuẫn hoặc thay đổi chưa cập nhật đủ |
| `rc-design-db` | Thiết kế DB chưa phù hợp: schema, index, constraint, migration |
| `rc-design-system` | Thiết kế hệ thống, kiến trúc hoặc luồng tổng thể chưa phù hợp |
| `rc-design-nonfunctional` | Thiếu/sai yêu cầu performance, security hoặc scalability |
| `rc-logic` | Logic xử lý trong code sai |
| `rc-validation` | Thiếu/sai validation đầu vào hoặc đầu ra |
| `rc-data` | Dữ liệu test hoặc dữ liệu thực tế sai/thiếu |
| `rc-config` | Sai cấu hình môi trường, permission hoặc cron |
| `rc-integration` | Lỗi tích hợp service/API hoặc contract |
| `rc-release` | Lỗi build, deploy hoặc release |
| `rc-process` | Thiếu/bỏ qua bước bắt buộc, thay đổi không sync hoặc thiếu điều kiện để test |
| `rc-external-api` | Thay đổi/issue từ nền tảng hoặc external API |
| `rc-infra` | Sự cố hạ tầng |
| `rc-assumption` | Có thể confirm/align nhưng đã tự giả định |
| `rc-document` | Rule có thật nhưng document thiếu, mơ hồ hoặc không truy cập được |

## System — tối thiểu một label

| Label | Dấu hiệu rõ để gắn |
| --- | --- |
| `sys-crawling-auto` | Crawl/scrape tự động hoặc lấy dữ liệu từ nguồn ngoài qua flow chuẩn |
| `sys-crawling-manual` | Crawl được trigger thủ công từ tool/admin UI |
| `sys-crawling-adhoc` | Script/tool tạm thời, debug hoặc one-time crawl |
| `sys-transform` | Transform, mapping hoặc chuẩn hóa dữ liệu |
| `sys-ai` | Model, prompt, inference hoặc scoring AI/ML |
| `sys-frontend` | UI/UX, hiển thị hoặc hành vi phía client |
| `sys-api` | Request/response, API contract, endpoint hoặc timeout |
| `sys-db` | Schema, index, constraint, migration hoặc query DB |
| `sys-security` | Auth, permission, role, security hoặc data exposure |
| `sys-performance` | Slow response, high load, memory hoặc hiệu năng |
| `sys-infra` | Server, network, CI/CD hoặc cloud resource |

Không tự gắn một System label chỉ vì tên module chứa từ khóa rộng; ưu tiên title, steps, expected và actual của bug cụ thể.

## Test Type — đúng một label khi xác định được

| Label | Hoạt động test thực tế |
| --- | --- |
| `test-functional` | Test chức năng theo requirement hoặc user flow |
| `test-regression` | Chạy regression sau thay đổi/release |
| `test-boundary` | Giá trị biên, limit, min/max hoặc edge case |
| `test-negative` | Dữ liệu sai, thiếu hoặc không hợp lệ |
| `test-integration` | Luồng tích hợp giữa hệ thống/service |
| `test-exploratory` | Test tự do dựa trên kinh nghiệm/quan sát |

Nếu nguồn chứa nhiều Test Type trái nhau, không chọn hộ; đánh dấu `NEEDS_CLARIFICATION`.

## Flow — optional

| Label | Dùng khi |
| --- | --- |
| `flow-source-load` | Load source config lỗi hoặc config URL/param/platform sai |
| `flow-source-build` | Build URL/request hoặc mapping param đầu vào sai |
| `flow-auth` | Token/proxy/cookie/credential thiếu, sai hoặc hết hạn |
| `flow-fetch` | Call API fail/timeout hoặc raw response sai format |
| `flow-transform` | Mapping field hoặc xử lý dữ liệu sai |
| `flow-pagination` | Sai `next_page`/`has_more`, miss hoặc duplicate data |
| `flow-pusher` | Insert fail, duplicate hoặc missing data trong DB |
| `flow-updater` | Update fail/sai/thiếu sau crawling |
| `flow-token-proxy-manager` | Service token/proxy không ổn định |

## Rule chất lượng label

- System không xác định được → cảnh báo chặn `missing_system_label`.
- Root Cause chưa có → cảnh báo không chặn `root_cause_pending`; tuyệt đối không thêm `rc-logic` như một default.
- Root Cause có nhiều hơn một hoặc label không thuộc taxonomy → cảnh báo chặn.
- Test Type thiếu → cảnh báo không chặn; có nhiều hơn một → cảnh báo chặn.
- Flow label không thuộc taxonomy → cảnh báo chặn.
- Environment có nội dung nhưng không map được sang ba giá trị Jira → cảnh báo chặn.
- Preview phải hiển thị label theo nhóm để QC review trước khi tạo Jira.
