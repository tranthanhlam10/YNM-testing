- Nghiên cứu test phần first page
    - Hiện tại phần đó chỉ test lại chỗ loader và resolver
        - Loader: Thêm loader cho platform Blog, Ecom và Review
        - Resolver: có thay đổi nhỏ chỉ publish message cho luồng openai đối với platform News (id_table = 3)
        - Các service khác không thay đổi : nhưng cần check lại vì sẽ publish chung về 1 queue để xử lý chung
- Phần wiki của chị Trang
    - Câu query của loader
    Đầu tiên là loads cate link từ **monitor_news_categories**

→ Sau đó lấy crawler_type từ Redis **HTTP_CRAWLER**

→ Tiếp tục push vào queue c**l.news.article_urls_crawling_sources**

→ Chuyển status thành **UPDATING và update vào table**  **monitor_news_categories**.

Những giá trị table_id cần load

NEWS = 3

BLOG = 5

REVIEW = 13

ECOM = 15

Những câu query của service load


BlogArticleUrlByFirstPageCrawlingLoader

SELECT 
    id, 
    link, 
    id_source, 
    id_table, 
    state, 
    count_failed, 
    count_page_failed, 
    priority, 
    curr_page, 
    curr_page_link, 
    end_of_page, 
    parser_failed, 
    views_avg, 
    post_form, 
    first_page_next_crawl_time, 
    is_homepage, 
    openai_batch_next_time
FROM 
    monitor_news_categories
WHERE 
    state = 2
    AND id_table NOT IN (9)
    AND id_table IN (5)
    AND first_page_next_crawl_time <= NOW()
ORDER BY 
    first_page_next_crawl_time ASC
LIMIT 100
OFFSET 0

// Câu lệnh tính tổng
SELECT 
    COUNT(*) AS total_count
FROM 
    monitor_news_categories
WHERE 
    state = 2
    AND id_table NOT IN (9)
    AND id_table IN (5)
    AND first_page_next_crawl_time <= NOW();




EcomArticleUrlByFirstPageCrawlingLoader

SELECT 
   id, 
   link, 
   id_source, 
   id_table, 
   state, 
   count_failed, 
   count_page_failed, 
   priority, 
   curr_page, 
   curr_page_link, 
   end_of_page, 
   parser_failed, 
   views_avg, 
   post_form, 
   first_page_next_crawl_time, 
   is_homepage, 
   openai_batch_next_time
FROM 
   monitor_news_categories
WHERE 
   state = 2
   AND id_table NOT IN (9)
   AND id_table IN (15)
   AND first_page_next_crawl_time <= NOW()
ORDER BY 
   first_page_next_crawl_time ASC
LIMIT 100
OFFSET 0

// Câu lệnh tính tổng 
SELECT 
    COUNT(*) AS total_count
FROM 
    monitor_news_categories
WHERE 
    state = 2
    AND id_table NOT IN (9)
    AND id_table IN (15)
    AND first_page_next_crawl_time <= NOW();




NewsArticleUrlByFirstPageCrawlingLoader

SELECT 
   id, 
   link, 
   id_source, 
   id_table, 
   state, 
   count_failed, 
   count_page_failed, 
   priority, 
   curr_page, 
   curr_page_link, 
   end_of_page, 
   parser_failed, 
   views_avg, 
   post_form, 
   first_page_next_crawl_time, 
   is_homepage, 
   openai_batch_next_time
FROM 
   monitor_news_categories
WHERE 
   state = 2
   AND id_table NOT IN (9)
   AND id_table IN (3)
   AND first_page_next_crawl_time <= NOW()
ORDER BY 
   first_page_next_crawl_time ASC
LIMIT 100
OFFSET 0


// Câu lệnh tính tổng 
SELECT 
    COUNT(*) AS total_count
FROM 
    monitor_news_categories
WHERE 
    state = 2
    AND id_table NOT IN (9)
    AND id_table IN (3)
    AND first_page_next_crawl_time <= NOW();



ReviewArticleUrlByFirstPageCrawlingLoader

SELECT 
   id, 
   link, 
   id_source, 
   id_table, 
   state, 
   count_failed, 
   count_page_failed, 
   priority, 
   curr_page, 
   curr_page_link, 
   end_of_page, 
   parser_failed, 
   views_avg, 
   post_form, 
   first_page_next_crawl_time, 
   is_homepage, 
   openai_batch_next_time
FROM 
   monitor_news_categories
WHERE 
   state = 2
   AND id_table NOT IN (9)
   AND id_table IN (13)
   AND first_page_next_crawl_time <= NOW()
ORDER BY 
   first_page_next_crawl_time ASC
LIMIT 100
OFFSET 0


// Câu lệnh tính tổng 
SELECT 
    COUNT(*) AS total_count
FROM 
    monitor_news_categories
WHERE 
    state = 2
    AND id_table NOT IN (9)
    AND id_table IN (13)
    AND first_page_next_crawl_time <= NOW();

    
Resolver

The service Resolver lấy message từ **cl.news.article_urls_crawled_sources** , và phân ra 2 task là **cl.news.resolved_data**

- Trong taskl Transfrom, parse html thành urls và chuyển đến article url, nếu parse không bị lỗi thì nó sẽ push vào queue **cl.news.article_urls**
- Với phần source  *for crawling by first page*, thì service sẽ push phần openai batch vào queue  **cl.news.html_2_mysql_openai_batches**
    - Những đều kiện để build phần openai batch input


    getOpenaiBatchSources(source: ArticleUrlCrawledSource) {
    if (
        source.getSource().mode !== CategoryCrawlingMode.CRAWL_FIRST_PAGE ||
        !source.getSource().categoryInfo.is_homepage
    )
        return [];

    if (
        source.getSource().categoryInfo.openai_batch_next_time &&
        moment().isBefore(
            moment(source.getSource().categoryInfo.openai_batch_next_time),
        )
    )
        return [];

    const openaiBatchSource = RawHtml2ArticleUrl.toOpenaiBatchSource(source);
    return [openaiBatchSource];
}
        

- Task resolver
    - Nếu như mà có lỗi, thì nó tăng count fail lên, xong push vào queue finish source
    - Còn nếu như không lỗi, thì vẫn vào finish source






// Những deployment liên quan đnến 
ynm-cl-news-article-url-crawler-service-testing
ynm-cl-news-crawling-loader-service-testing


// Những deployment đã tồn tại mà không cần chỉnh sửa


BLOG_ARTICLE_URL_BY_FIRST_PAGE_CRAWLING_LOADER_ENABLE
ECOM_ARTICLE_URL_BY_FIRST_PAGE_CRAWLING_LOADER_ENABLE
NEWS_ARTICLE_URL_BY_FIRST_PAGE_CRAWLING_LOADER_ENABLE
REVIEW_ARTICLE_URL_BY_FIRST_PAGE_CRAWLING_LOADER_ENABLE





news-ynmpdp-5010-testing-ynm-crawler-empty






kubectl get pods -n crawler-testing | grep news-ynmpdp-5010-testing-ynm-crawler-empty
kubectl exec -it news-ynmpdp-5010-testing-ynm-crawler-empty-c58478455-7grpz -n crawler-testing -- sh


// Thông tin của Redis ex
redis-social-suite, db: 1

// Câu lệnh join của 2 bảng để lấy thông tin 
id (monitor_sources) với id_source (monitor_news_categories) nha anh



queue cl.news.article_urls,cl.news.category_links_finished_sources,cl.news.html_2_mysql_openai_batches
^cl\.news\.(article_urls|category_links_finished_sources|html_2_mysql_openai_batches)$
// Câu regex này chính xác hơn nè
cl\.news\.(article_urls|category_links_finished_sources|html_2_mysql_openai_batches)

cl.news.article_urls | cl.news.category_links_finished_sources | cl.news.html_2_mysql_openai_batches    



// Các message trong queue Finished source 
{"id":366362,"curr_page":2,"curr_page_link":"http://www.lazada.vn/dep-xo-ngon-cho-nam/?ajax=true&page=2&sort=popularity","end_of_page":0,"updated_date":1745567487.107,"count_failed":0,"parser_failed":0,"state":2,"first_page_next_crawl_time":"2025-04-25 08:06:27","createdBy":"EcomArticleUrlByFirstPageCrawlingLoader"}


{"id":414009,"curr_page":1,"curr_page_link":"","end_of_page":0,"updated_date":1745567512.268,"count_failed":1,"parser_failed":2,"state":2,"first_page_next_crawl_time":"2025-04-25 08:06:52","createdBy":"NewsArticleUrlByFirstPageCrawlingLoader"}


{"id":306625,"curr_page":1,"curr_page_link":"","end_of_page":0,"updated_date":1745567565.96,"count_failed":1,"parser_failed":2,"state":2,"first_page_next_crawl_time":"2025-04-25 08:07:45","createdBy":"ReviewArticleUrlByFirstPageCrawlingLoader"}


{"id":345025,"curr_page":1,"curr_page_link":"","end_of_page":0,"updated_date":1745567624.33,"count_failed":1,"parser_failed":2,"state":2,"first_page_next_crawl_time":"2025-04-25 08:08:44","createdBy":"BlogArticleUrlByFirstPageCrawlingLoader"}


// Các deployment ở staging của phần first page
ynm-cl-news-crawling-loader-service-staging
ynm-cl-news-article-url-service-staging
ynm-cl-news-source-updater-service-staging
ynm-cl-news-data-pusher-service-staging