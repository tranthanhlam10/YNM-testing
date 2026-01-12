# Task check updater của Huy

Nội dung điều chỉnh:
+ Thay đổi logic update thông tin identity trên Redis: Không sử dụng field id của value trong Redis để làm key update, thay vào đó sẽ sử dụng trực tiếp field id của crawling source làm key update. Mục đích là để tránh trường hợp 1 số identity trên Redis không có field id trong value.

Deployment:
+ ynmpdp-5779-staging-crawler-empty-container (Luồng cũ)
+ new-ynmpdp-5779-staging-crawler-empty*(Luồng mới)*

Code commit:
+ https://git.younetmedia.com/YNM/crawler/-/merge_requests/2686 (Luồng cũ)
+ https://git.younetmedia.com/ynm-dataplatform/ynm-crawler/-/merge_requests/1835 (Luồng mới)

Scripts:
+ node scripts/facebookV3/update_user_profile_info_socialift_potential.js (Luồng cũ)
+ node scripts/facebookV3/update_page_profile_info_socialift_potential.js (Luồng cũ)
+ node scripts/tiktok/get_latest_user_info_potential.js (Luồng cũ)


https://wiki.younetco.com/display/~huynvq/%5BData%5D+Script+To+Run+Services+About+Detecting+Country+For+Facebook+Identities (Luồng mới)