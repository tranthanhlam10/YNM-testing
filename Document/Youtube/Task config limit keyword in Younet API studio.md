# Task config limit keyword in Younet API studio



[Feature] Config Limit Keyword riêng biệt theo từng Crawling Type
## 1. Hiện trạng & Vấn đề (Context)

Hiện tại: Hệ thống sử dụng một config chung (KM_MAX_KEYWORDS_PER_PROCESS) để giới hạn số lượng keyword cho tất cả các process.

Vấn đề: Config này không phân biệt Crawling Type (Brand / Campaign / Crisis / Critical Crisis). Khi cần tăng limit cho Crisis, hệ thống bắt buộc phải tăng limit cho tất cả các loại khác, gây lãng phí tài nguyên hoặc sai business logic.

## 2. Nhu cầu (Requirement)

User cần add nhiều keyword hơn cho các process thuộc type Crisis.

Giữ nguyên limit thấp hơn cho các process type khác.

Hệ thống cần hỗ trợ limit keyword riêng biệt theo từng crawling type.

## 3. Giải pháp Kỹ thuật (Technical Solution)

Tách config limit keyword hiện tại thành các config riêng biệt cho từng loại.

Config cũ (Remove/Deprecate):

YAML

- name: KM_MAX_KEYWORDS_PER_PROCESS
  value: '20'

Config mới (Add new):

YAML

- name: KM_BRAND_TRACKING_MAX_KEYWORDS
  value: '20'

- name: KM_CAMPAIGN_TRACKING_MAX_KEYWORDS
  value: '10'

- name: KM_CRISIS_TRACKING_MAX_KEYWORDS
  value: '30'

- name: KM_CRITICAL_CRISIS_MAX_KEYWORDS
  value: '50'

Môi trường deploy: sl-testing (Namespace: sl-testing)

deployment: api-testing-separate-config-sl-api



## 4. Phạm vi ảnh hưởng (Scope & Impact)

Tool test: http://studio-testing-separate-config-testing.ynm.local/keyword-management/processes?status=crawling

Tool: http://studio-testing.ynm.local

Logic: Validate số lượng keyword được add vào process dựa trên Crawling Type của process đó. Không dùng chung limit giữa các type.

Chức năng cần test (Affected Features):

// Màn hình Process:

Create new process

// Edit process

// Màn hình Keyword:

Add keyword trực tiếp vào process (Chọn 1-nhiều keyword -> Add to process)

Note: Các logic khác không bị ảnh hưởng.

## 5. Acceptance Criteria (AC)

- AC1 – Create Process

Khi tạo mới process, hệ thống check limit dựa trên Crawling Type đã chọn:

Brand Tracking: Không add quá KM_BRAND_TRACKING_MAX_KEYWORDS (20).

Campaign Tracking: Không add quá KM_CAMPAIGN_TRACKING_MAX_KEYWORDS (10).

Crisis Tracking: Không add quá KM_CRISIS_TRACKING_MAX_KEYWORDS (30).

Critical Crisis: Không add quá KM_CRITICAL_CRISIS_MAX_KEYWORDS (50).

Expected: Nếu vượt quá limit → Hiển thị lỗi đúng message và chặn không cho tạo.

- AC2 – Edit Process

Khi chỉnh sửa process:

Add thêm keyword: Không cho phép add nếu tổng số lượng vượt quá limit của type tương ứng.

Đổi Process Type: Hệ thống phải check lại số lượng keyword hiện có so với limit của Type mới. (Ví dụ: Đổi từ Crisis [30] sang Campaign [10] mà đang có 20 key -> Báo lỗi).

Edit thông tin khác: Khi edit các trường không phải keyword, hệ thống vẫn validate lại limit keyword (đề phòng trường hợp config thay đổi).

Thay đổi Config: Nếu value trong config thay đổi, hệ thống phải validate theo value mới nhất.

- AC3 – Add Keyword Trực tiếp

Khi thực hiện action "Add to process" từ màn hình danh sách Keyword:

Hệ thống validate đúng limit theo Crawling Type của process đích.

Việc add keyword vào process này không ảnh hưởng limit/logic của các process type khác.




## Testing check list



 			- name: KM_BRAND_TRACKING_MAX_KEYWORDS
              value: '1'
            - name: KM_CAMPAIGN_TRACKING_MAX_KEYWORDS
              value: '2'
            - name: KM_CRISIS_TRACKING_MAX_KEYWORDS
              value: '10'
            - name: KM_CRITICAL_CRISIS_MAX_KEYWORDS
              value: '4'

Exceed 3 keywords in a process. -> Chỉ tồn tại 2 keyword trong Process



// K8s
- Kiểm tra thử xem các config fix đã có ở deployment hay chưa -> Hiện tại đã có ở k8s -> DONE


// UI/UX
- Hiện tại toast message phải hiển thị đúng mã lỗi -> Toast message hiển thị như câu error khi tạo process -> Bug minor (Có thể confirm bỏ qua)

Note:
- Những chỗ create, update này đều gọi API để check

// Màn hình Process
- Tạo Proccess: 
+ Hệ thống check limit dựa trên Crawling Type đã chọn -> Expected: Nếu vượt quá limit → Hiển thị lỗi đúng message và chặn không cho tạo -> DONE (Hiện tại đã hiển thị toast message create fail, hiển thị thêm dòng error đỏ báo vượt quá limit keyword process)

- Edit Process
+ Add thêm keyword: Không cho phép add nếu tổng số lượng vượt quá limit của type tương ứng. -> DONE
+ Đổi Process Type: Hệ thống phải check lại số lượng keyword hiện có so với limit của Type mới. (Ví dụ: Đổi từ Crisis [30] sang Campaign [10] mà đang có 20 key -> Báo lỗi). -> DONE
+ Edit thông tin khác: Khi edit các trường không phải keyword, hệ thống vẫn validate lại limit keyword (đề phòng trường hợp config thay đổi). -> DONE
+ Thay đổi Config: Nếu value trong config thay đổi, hệ thống phải validate theo value mới nhất. -> Vậy những process đã bị dư keyword sẽ như thế nào (Đã confirm, chỗ này không hiện thông báo gì, chỉ là không add thêm được nữa) -> DONE

// Màn hình keyword
- Hệ thống validate đúng limit theo Crawling Type của process đích.
- Việc add keyword vào process này không ảnh hưởng limit/logic của các process type khác.


// Phân quyền
- Các quyền được edit đều phải check limit khi audit process/keyword