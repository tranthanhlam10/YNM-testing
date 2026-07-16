
Dựa vào các file bên dưới, hãy làm t 1 file check mapping tương tự file này:

Ai_Agents/test_cases/x_crawling_from_reply/data_mapping_search_text_x_post_from_reply_all_types_2026-07-02.md



- Data khi crawl ở File crawled source trước khi resolve:
Data_get_from_rabbitMQ_by_scripts/messages_testing_cl_yt_posts_crawled_sources_2026-07-15T04-23-06-359Z.json




- Đây là data khi gọi API

Data_get_from_rabbitMQ_by_scripts/data_youtube_testing.json


- Đây là data sau khi resolve

Post:
Data_get_from_rabbitMQ_by_scripts/messages_testing_cl_posts_2_mongo_yt_posts_LamTT_2026-07-15T07-08-53-398Z.json


Mentions:

Data_get_from_rabbitMQ_by_scripts/messages_testing_cl_mentions_2_solr_mentions_LamTT_2026-07-15T07-07-54-490Z.json


Identities:

Data_get_from_rabbitMQ_by_scripts/messages_testing_cl_identities_2_solr_identities_LamTT_2026-07-15T07-08-12-775Z.json



Dựa vào các thông tin trên, kiểm tra xem crawled_source đã gọi được đúng như data của API không

Và Post/mentions/Identities đã được mapping đúng với crawled_sources và API chưa, cũng như là đúng ở mục mapping table như dev đã define trong wik này:


https://wiki.younetco.com/pages/viewpage.action?spaceKey=FB&title=%5BYoutube%5D+%5Bynm-crawler%5D+Crawl+Post+From+Source