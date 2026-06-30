Bạn là 1 Data engineer và QC engineer nhiều năm kinh nghiệm, tui đang có 1 fiel raw data và các file data sau khi đã resolve


Nhờ bạn kiểm tra xem các file sau khi resolve đã đúng với yêu cầu chưa, dựa theo test plan và test case + wiki BA cho luồng crawl post from reply


A. File raw data:

Data_get_from_rabbitMQ_by_scripts/messages_testing_cl_x_posts_from_reply_by_cookie_crawled_sources_2026-06-30T03-47-37-655Z.json


B. Danh sách các file đã resolve


1. Mentions
Data_get_from_rabbitMQ_by_scripts/messages_testing_cl_mentions_2_solr_mentions_LamTT_2_2026-06-30T03-37-52-365Z.json


2. Posts

Data_get_from_rabbitMQ_by_scripts/messages_testing_cl_posts_2_mongo_x_posts_LamTT_2026-06-30T03-42-47-625Z.json

3. Replies

Data_get_from_rabbitMQ_by_scripts/messages_testing_cl_replies_2_mongo_x_replies_LamTT_2026-06-30T03-44-15-071Z.json

4. Identity

Data_get_from_rabbitMQ_by_scripts/messages_testing_cl_identities_2_redis_identities_LamTT_2026-06-30T04-40-34-757Z.json



C. API response khi gọi trực tiếp từ nền tảng

Data_get_from_rabbitMQ_by_scripts/x_api_response.json


Ngoài ra là phải đáp ứng được yêu cầu của task:

https://jira.younetco.com/browse/YNMSHGYSG-1169 

+ Test plan: 

file:///Users/tranthanhlam/YNM-testing/Ai_Agents/TestPlan/Data%20local/TestPlan_YNMSHGYSG-1169_Improve_Crawling_Post_From_Reply_X.md


+ Testcases: 

https://docs.google.com/spreadsheets/d/1hJkgSEvk-CEvqVl3UZ2gnq1B3S6oQ8Ux2064Z0FKdVU/edit?gid=1704880699#gid=1704880699


Và đúng với wiki mapping: 


https://wiki.younetco.com/display/FB/X+platform+technical+specification


Nếu có chỗ nào cần confirm, thì note lại giúp t nhé


Đây là file tổng hợp mapping mẫu:


Ai_Agents/TestCases/Data local/data_mapping_reaudit_pantip_comment_2026-06-10.md