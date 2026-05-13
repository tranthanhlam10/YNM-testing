# Task AI Usage Overview



## Issue

Team phát triển/department/user cần có màn hình để thống kê cũng như tracking lại toàn bộ những request AI


## Scope

- Những function phải test

+ Filter

Date Range
Company
Department
Topic
User
Task Type
Model


+ 4 Usage Metrics

Total costs
AI requests
Input tokens
Output tokens

+ Export

Excel
Csv


+ Permission: Full-view

Full: toàn công ty + mọi department. Set budget department (hàng tháng).

+ Permission: Department

Department only: chỉ số liệu department của mình. Set budget user (tùy chọn, hàng tháng)

+ Permission: User

Department only: xem số liệu department (và usage bản thân). Nếu Head chưa set budget cá nhân: không có cảnh báo 80% cấp user; vẫn bị giới hạn bởi tổng usage department (hết budget department → không chạy thêm AI Request / Quick Test / Batch Test). Nếu Head đã set budget cá nhân: xem tiến độ + cảnh báo/chặn theo ngưỡng user.


## Thông tin task


1. Jira:

https://jira.younetco.com/browse/SHDIY-9691
https://jira.younetco.com/browse/SHDIY-9692
https://jira.younetco.com/browse/SHDIY-9750
https://jira.younetco.com/browse/SHDIY-9749
https://jira.younetco.com/browse/SHDIY-9698
https://jira.younetco.com/browse/SHDIY-9699

2. Testcases:

https://docs.google.com/spreadsheets/d/1H5kDyGS-8e8ExQgQoKVZK-EgD0VXzmG2JzLZ2J-rRWQ/edit?gid=1927008873#gid=1927008873

3. Nhánh dev





## Phân tích

1. Filter

- Test như filter bình thường 
+ Để ý limit của filter/selection của filter
+ Kiểm tra data có apply filter để hiển thị dữ liệu không
+ Kiểm tra khi filter thì các API có liên quan đến fitler đó có truyền các params vào fitler hay không


2. Export

- Test như export bình thường
+ Kiểm tra xem export có đúng với data đang hiển thị tren UI hay không
+ Kiểm tra nếu export có filter thì như nào
+ Kiểm tra export file excel
+ Kiểm tra export file csv

4. 4 Usage metrics


- Kiểm tra xem 4 metrics đó được load từ API nào
- Kiểm tra công thức của từng metric đang tính như nào
- Kiểm tra xem API response của từng metric có đang tính đúng công thức
- Kiểm tra xem khi view các kết quả từ API lên thì có đúng công thức không
- Kiểm tra công thức với filter (Nhớ phải kiểm tra luôn params có truyền lên hay không)






5. Permission: Full-view

- 


6. Permission: Department-view

-

7. Permission: User-view

- 


-> Chỗ view này nên hỏi lại chị Linh



## Các câu lệnh query để tính toán công thức

1. 4 metrics usage


SELECT 
    sum(cost_usd) AS total_cost,
    sum(input_tokens) AS total_input_tokens,
    sum(output_tokens) AS total_output_tokens,
    sum(input_tokens + output_tokens) AS total_tokens
FROM usage_overview_agg
WHERE billed_at >= toDateTime('2026-04-30 17:00:00', 'UTC') 
  AND billed_at < toDateTime('2026-05-30 17:00:00', 'UTC');




Giờ t muốn tính tổng số request dựa trên field id_classification_request, field này không unique, với các điều kiện bên dưới

Vậy thì câu query của t có đúng hay không

SELECT
COUNT (DISTINCT id_classification_request) AS total_unique_ids
FROM socialheat. usage_overview_agg
WHERE run_bucket = 'MANUAL'
AND task_type IN ('ATTRIBUTE_CLASSIFICATION',
'POST_SPAM_CLASSIFICATION') AND (billed_at ›= toDateTime('2026-04-11 17:00:00', 'UTC')
AND billed_at < toDateTime('2026-05-11 17:00:00', 'UTC'));
GROUP BY id_classification_request;



2. Phân quyền 


LamTT_AI_Usage_UserRole@younetmedia.com/Lam@12345 -> DONE


LamTT_AI_Usage_DepartmentRole@younetmedia.com/Lam@12345 -> Hiện tại có 2 bugs (Nếu như fix chỗ user thì cần check thêm là nếu truyền user khác lên department của urls thì có báo lỗi 403 hay không)


LamTT_AI_Usage_FullViewRole@younetmedia.com/Lam@12345 -> DONE


LamTT_AI_Usage_CombineRole@younetmedia.com/Lam@12345 -> Đã bắt bug


LamTT_AI_Usage_CombineRole_1@younetmedia.com/Lam@12345 -> DONE




2. Chart stacked usage cost USD/pie usage cost USD percentage

- Chung:

+ Kiểm tra kĩ logic hiển thị ngày 

+ Kiểm tra đúng số tiền hiển thị cho department/user

+ Kiểm tra số lượng department/user hiển thị trong chart (20 + others)


- Riêng:

+ Kiểm tra nếu khác quyền, thì có lỗi gì không

+ Nếu full quyền thì hiển thị department, còn nếu quyền department thì hiển thị user

+ Quyền department thì ẩn chart pie


- Câu lệnh query


+ Câu query chuẩn, tính cho từng department:


WITH DepartmentCosts AS (
    SELECT
        department_id,
        SUM(cost_usd) AS total_cost
    FROM socialheat.usage_overview_agg
    WHERE billed_at >= toDateTime('2026-04-07 17:00:00', 'UTC')
      AND billed_at <  toDateTime('2026-05-08 17:00:00', 'UTC')
    GROUP BY department_id
),
RankedDepartments AS (
    SELECT
        department_id,
        total_cost,
        ROW_NUMBER() OVER (ORDER BY total_cost DESC) AS rn
    FROM DepartmentCosts
)
SELECT
    IF(rn <= 20, toString(department_id), 'Others') AS department_group,
    SUM(total_cost) AS final_cost
FROM RankedDepartments
GROUP BY department_group
ORDER BY department_group = 'Others' ASC, final_cost DESC;



+ Câu lệnh query chuẩn, tính cho từng user:

WITH UserCosts AS (
    SELECT
        user_id,
        SUM(cost_usd) AS total_cost
    FROM socialheat.usage_overview_agg
    WHERE billed_at >= toDateTime('2026-04-07 17:00:00', 'UTC')
      AND billed_at <  toDateTime('2026-05-08 17:00:00', 'UTC')
      AND department_id = [ĐIỀN_DEPARTMENT_ID]
    GROUP BY user_id
),
RankedUsers AS (
    SELECT
        user_id,
        total_cost,
        ROW_NUMBER() OVER (ORDER BY total_cost DESC) AS rn
    FROM UserCosts
)
SELECT
    IF(rn <= 20, toString(user_id), 'Others') AS user_group,
    SUM(total_cost) AS final_cost
FROM RankedUsers
GROUP BY user_group
ORDER BY user_group = 'Others' ASC, final_cost DESC;


+ Câu lệnh query theo pie chart

WITH DepartmentCosts AS (
    SELECT
        department_id,
        SUM(cost_usd) AS total_cost
    FROM socialheat.usage_overview_agg
    WHERE billed_at >= toDateTime('2026-04-07 17:00:00', 'UTC')
      AND billed_at <  toDateTime('2026-05-08 17:00:00', 'UTC')
    GROUP BY department_id
),
RankedDepartments AS (
    SELECT
        department_id,
        total_cost,
        ROW_NUMBER() OVER (ORDER BY total_cost DESC) AS rn
    FROM DepartmentCosts
)
SELECT
    IF(rn <= 20, toString(department_id), 'Others') AS department_group,
    SUM(total_cost) AS final_cost,
    -- Tính phần trăm và làm tròn 2 chữ số thập phân
    ROUND((SUM(total_cost) / SUM(SUM(total_cost)) OVER ()) * 100, 2) AS percentage_cost
FROM RankedDepartments
GROUP BY department_group
ORDER BY department_group = 'Others' ASC, final_cost DESC;


