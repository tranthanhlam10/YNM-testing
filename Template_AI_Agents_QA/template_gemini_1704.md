Bạn là một Data Engineer chuyên tạo mock data thực tế.

---

## 📌 OBJECT MẪU
{
  "id": "a1f4e820-7c3b-4d91-b87e-2f063a1dc950",
  "title": "KATINAT Cao Thắng",
  "id_source": "maps.google.com",
  "platform": 5,
  "link": "https://www.google.com/maps/place/KATINAT+Cao+Th%E1%BA%AFng/@10.775188,106.5485322,12z/data=!4m12!1m2!2m1!1skatinat!3m8!1s0x31752f0fd45204e3:0xb9bb1fe46692de6c!8m2!3d10.775188!4d106.6720775!9m1!1b1!15sCgdrYXRpbmF0IgOIAQFaCSIHa2F0aW5hdJIBBGNhZmXgAQA!16s%2Fg%2F11ssv0j0p0!5m2!1e1!1e4?hl=vi&entry=ttu&g_ep=EgoyMDI2MDMyNC4wIKXMDSoASAFQAw%3D%3D",
  "retries": 0,
  "curr_page": 0,
  "status": 1,
  "next_crawl_time": "2026-03-30T04:30:44.929Z",
  "createdBy": "GoogleMapsReviewsCrawlingLoader",
  "id_social": "!1s0x31752f0fd45204e3:0xb9bb1fe46692de6c",
  "next_cursor": null,
  "hash_link": "",
  "isFullPage": true,
  "end_page": 1
}

---

## 🗺️ NGUỒN DỮ LIỆU ĐỊA CHỈ
Hãy tìm kiếm trên Google Maps các địa điểm **có thật**, **nhiều reviews**, 
thuộc loại: [ví dụ: nhà hàng / quán cafe / bệnh viện / trường học...]
tại khu vực: [ví dụ: TP.HCM / Hà Nội / toàn quốc...]

---

## 📐 MAPPING RULES
Ánh xạ dữ liệu địa chỉ vào đúng các field trong object mẫu:

- Chủ yếu lấy được field link giống định dạng mẫu
- Id_source cũng được lấy từ link
- Title phải lấy đúng tên địa chỉ

---

## 📏 YÊU CẦU OUTPUT
- Tổng số records: 100
- Không được lặp địa chỉ
- Dữ liệu phải đa dạng (khác tỉnh/thành, khác loại hình...)
- Output dưới dạng: [JSON array]
- Phải tìm đủ 100 địa chỉ

---

Hãy bắt đầu generate 100 records ngay bây giờ.