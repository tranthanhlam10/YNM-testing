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

















