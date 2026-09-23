function isBadLink(link) {
    const linkRegex = /^(javascript:).*|search|tien-ich\/[\w+\-?=&]+|tien-ich|tag-pro|(\?|)tag|(\?|\/)search|Search|tim-kiem|Tim-kiem/;
    return linkRegex.test(link);
}

function isBadTitle(title) {
    const titleRegex = /^(Trang trước|Trang sau|Trang tiếp|Xem theo ngày|Xem tiếp|tìm kiêm|Tìm kiếm|search|Search|Tag)$/;
    return titleRegex.test(title);
}


function shouldRemove({ link, title }) {
    if (isBadLink(link)) return { remove: true, reason: 'link', value: link };
    if (isBadTitle(title)) return { remove: true, reason: 'title', value: title };
    return { remove: false };
}


const link = 'https://www.youtube.com/watch?v=1bJy4HQXeR4';
const title = "Trang trước";

console.log(isBadTitle(title));
//console.log(isBadLink(title));



const arr = ["NGHE VỢ CHỒNG NGÂN COLLAGEN ĂN NÓI BỐ LÁU NÈ - Xem tiếp",
    "Tìm ra nguồn gốc viên kim cương xanh nước D gần 150 tỷ của Ngân Collagen #ngancollagen | Tìm kiếm",
    "Làm giám đốc thu nhập tiền tỷ nhưng Thảo Collagen đi đám cưới phải mặc lại đồ Boss Ngân #shorts | Trang sau",
    "Cách nuôi dạy con của Ngân Collagen, khắt khe với con trai chuyện cân nặng #ngancollagen - Trang tiếp",
    "demo gã săn cá - em xinh say hi #doahoatantroilacgiuakhonggian #exsh #gasanca | search",
    "lấy bài của em xinh say hi làm cho quang hùng hihihi - Tag",
    "Hòa Lạc – Đô thị vệ tinh thông minh|Hoàng Hường - tìm kiêm",
    "Tiếp thị 4.0 - Dịch chuyển từ truyền thống sang công nghệ số | Philip Kotler - Search",
    "Tập 1-30 | Chuyển sinh thành cây Hòe | Người Xa Lạ Vietsub - Trang trước",
    "🔴Trực Tiếp: 800 thành phố biểu tình đúng ngày ông Trump tròn 79 - Xem theo ngày"];

for (let i = 0; i < arr.length; i++) {
    isBadTitle(arr[i]) ? console.log(`Bad title: ${arr[i]}`) : console.log(`Good title: ${arr[i]}`);
}   



// const regex = /^(Trang trước|Trang sau|Trang tiếp|Xem theo ngày|Xem tiếp|tìm kiêm|Tìm kiếm|search|Search|Tag)$/;

// console.log(regex.test("Search"));         // true
// console.log(regex.test("Search video"));   // false
// console.log(regex.test(" search"));        // false
// console.log(regex.test("Tìm kiếm"));       // true
