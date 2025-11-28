function isValidRecord(data, excludeIdSources = []) {

    const IGNORE_LINK_DEFAULT = /^(javascript:).*|search|tien-ich\/[\w+\-?=&]+|tien-ich|tag-pro|(\?|)tag|(\?|\/)search|Search|tim-kiem|Tim-kiem/;
    const IGNORE_TITLE_DEFAULT = /^(Trang trước|Trang sau|Trang tiếp|Xem theo ngày|Xem tiếp|tìm kiêm|Tìm kiếm|search|Search|Tag)$/;
    

    const hasValidFormat = 
        data.id_source &&                                                    // Có id_source
        data.link &&                                                         // Có link
        data.title &&                                                        // Có title
        !excludeIdSources.some(id_source => id_source === data.id_source) && // Không nằm trong blacklist
        !data.link.match(IGNORE_LINK_DEFAULT) &&                            // Link không match ignore pattern
        !data.title.match(IGNORE_TITLE_DEFAULT);                            // Title không match ignore pattern
    
    return hasValidFormat;
}

// ========== TEST ==========

// Test case 1: Valid record
const validRecord = {
    id: "13ed5dc4-ae41-590f-ad6a-35a71eea2cdc",
    id_category: 347712,
    id_source: "lixibox.com",
    platform: 6,
    link: "https://lixibox.com/shop/may-say-toc-ion-am-halio-hypersonic-hair-dryer-pearl-white",
    title: "Máy Sấy Tóc Ion Âm Halio Hypersonic Hair Dryer Pearl White",
    views_avg: 0,
    priority: 1,
    status: 1,
    failed_type: 1,
    count_failed: 0,
    crawled_date: "1970-01-01T00:00:00Z",
    createdBy: "BlogArticleUrlByFirstPageCrawlingLoader"
};

console.log("Valid record:", isValidRecord(validRecord)); // true

// Test case 2: Invalid - link có "search"
const invalidSearch = {
    ...validRecord,
    link: "https://lixibox.com/search?q=product"
};
console.log("Invalid search link:", isValidRecord(invalidSearch)); // false

// Test case 3: Invalid - title là "Tìm kiếm"
const invalidTitle = {
    ...validRecord,
    title: "Tìm kiếm"
};
console.log("Invalid title:", isValidRecord(invalidTitle)); // false

// // Test case 4: Invalid - id_source trong blacklist
// const excludeList = ["lixibox.com", "example.com"];
// console.log("Invalid id_source:", isValidRecord(validRecord, excludeList)); // false

// // Test case 5: Invalid - missing required fields
// const missingFields = {
//     ...validRecord,
//     title: null
// };
// console.log("Missing title:", isValidRecord(missingFields)); // false