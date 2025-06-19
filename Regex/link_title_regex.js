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
const title = 'Giám đốc Thảo ăn sinh nhật nhưng bánh kem thì phải giống hệt con gái của Ngân Collagen #shorts';

console.log(isBadLink(link));
console.log(isBadLink(title));