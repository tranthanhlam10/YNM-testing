Làm một data engineer nhiều kinh nghiệp, nhờ bạn tạo giúp t 1 tập data test, trong đó, tạo các record tương tự "Data cần tạo" từ "Tập data 1"


Chỉ thay đổi so với record Data cần tạo các fieid: social_id, title, sold, crawled_date, product_item_id trong đó: 


- socialid = id bỏ đi phần prefix source, ví dụ social_id = 12350538190
- title = title
- sold: Random(từ 1 đến 100)
- crawled_date: 3 tháng gần nhất cho đến hôm nay
- product_item_id: id (lấy y nguyên, không cần bỏ gì)




Tập data 1


[
      {
        "id":"shopee_12350538190",
        "title":"Bổ xương Glucosamine 1500mg của Orihiro Nhật"},
      {
        "id":"shopee_6170538475",
        "title":"Viên uống thơm miệng Breath Pearls 50 viên Úc"},
      {
        "id":"shopee_5467520349",
        "title":"Viên uống Vitamin C trắng da, mờ thâm nám Cinal C 100 viên Nhật Bản"},
      {
        "id":"shopee_7353886695",
        "title":"[HÀNG MỚI VỀ] Viên Bổ Mắt Hami Hàn Quốc Health of eye Vitamin A, Hộp 120 Viên"},
      {
        "id":"shopee_5378435809",
        "title":"Tiêu Khiết Thanh - Hộp 30 viên uống giúp trong sáng giọng nói, tốt cho thanh quản - cvspharmacy"},
      {
        "id":"shopee_3434980605",
        "title":"An Hầu Đan - Viên Ngậm Giảm Viêm Họng, Amidan - 6 Tặng 1 Hộp (Hộp 20 Viên)"},
      {
        "id":"shopee_11833314248",
        "title":"Biotin HD New - Giảm Gãy Rụng Tóc, Sạm Da - Cho Tóc Chắc Khỏe, Làm Chậm Lão Hóa - Hộp 100 viên"},
      {
        "id":"shopee_12859674354",
        "title":"TPCN bổ sung Sắt Blackmores 30v (đủ bill, tem chemist)"},
      {
        "id":"shopee_18167058155",
        "title":"Men vi sinh phụ nữ Optibac Probiotics For Women ngăn ngừa nhiễm trùng đường tiết niệu [Hộp 30 viên]"},
      {
        "id":"shopee_23345960882",
        "title":"Viên ngậm Ho Bảo Thanh ( vỉ 5 viên )"}]


Data cần tạo:


[
  {
    "social_id": 25254600017,
    "title": "Núm bọc cần Analog tay cầm PS4/P4PLUS/PS5/XBOX/Pro Controller Silicone Bảo vệ Cover Controller nắp dạ quang 2 đầu",
    "link": "https://shopee.vn/i-i.923088255.25254600017",
    "sold": 315,
    "temporary_sold": 24,
    "price_1": 16000,
    "price_2": 20000,
    "sell_price_1": 8000,
    "sell_price_2": 10000,
    "location": "Tỉnh Bắc Ninh",
    "shop_social_id": 923088255,
    "shop_name": "MC.PC",
    "shop_link": "https://shopee.vn/shop/923088255",
    "shop_status": null,
    "official": 0,
    "category_level_1": 100634,
    "raw_brand_1": null,
    "total_rating": 319,
    "rating_score": 4.987460815047022,
    "is_ads": 0,
    "is_flash_sale": 0,
    "favorite_store": 0,
    "favorite_plus_store": 0,
    "liked_count": 1806,
    "stock_status": 1,
    "stock_count": 1,
    "upcoming_flash_sale": null,
    "thumbnail": "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lpltfsc71zu7f5_tn",
    "product_created_at": "2023-12-23T04:41:33.000Z",
    "crawled_date": "2026-10-02T02:25:48.366Z",
    "is_kw_gift": 0,
    "is_crawling_active": 1,
    "shard": "20251002",
    "product_item_daily_id": "20251002!shopee!25254600017",
    "product_item_id": "shopee_25254600017",
    "ranking_product_item_id": null,
    "source_id": "shopee.vn",
    "latest_sold": 315,
    "shop_id": "shopee!923088255",
    "sell_price": 9000,
    "price": 18000,
    "domain": "vn",
    "crawler_type": "PI_BY_SHOP",
    "platform": "shopee",
    "latest_price": 18000,
    "latest_sell_price": 9000,
    "city_id": 11,
    "country_id": 1
  }
]

