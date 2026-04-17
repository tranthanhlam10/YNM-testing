# Task improve luồng tiktok transcript của Huy



## Issue

+ Hiện tại, luồng đang gọi đến service graph-tiktok để crawl transcript, nhưng service graph-tiktok đang gặp hiện tượng quá tải do có nhiều cùng gọi đến.
+ Cách giải quyết là điều chỉnh lại thành gọi trực tiếp đến Tiktok API.

