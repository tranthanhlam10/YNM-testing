import { readFileSync } from 'fs';
import path  from 'path';

/**
 * Đọc file JSON và trả về mảng dữ liệu
 * @param {string} filePath - Đường dẫn đến file JSON
 * @returns {Array} Mảng dữ liệu từ file JSON
 */
function readJsonFile(filePath) {
    try {
        const data = readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Lỗi khi đọc file:', error.message);
        return [];
    }
}

/**
 * Kiểm tra xem một record có field parentPost với các thuộc tính required hay không
 * @param {Object} record - Record cần kiểm tra
 * @param {Array} searchText - Mảng chứa 3 phần tử [title, caption, shared_content]
 * @returns {Object} Kết quả kiểm tra
 */
function verifyLoaderFields(record) {
    const result = {
        hasParentPost: false,
        hasTitle: false,
        hasCaption: false,
        hasSharedContent: false,
        titleMatch: false,
        captionMatch: false,
        sharedContentMatch: false,
        isValid: false
    };



    // if (record.parentPost.title !== undefined) {
    //     result.hasTitle = true;
    //     result.titleMatch = record.parentPost.title === record.search_text[0];
    // }

    if (record.caption !== undefined) {
        result.hasCaption = true;
    }


    if (record.platform === 3 || record.platform === 10) {
        if (record.parentPost.shared_content !== undefined) {
            result.hasSharedContent = true;
        }
    } else {
        result.hasSharedContent = true;
    }


    result.isValid =
        result.hasCaption &&
        result.hasSharedContent;

    return result;
}

/**
 * Function giả lập xử lý ynm_des - bạn cần implement theo logic thực tế
 * @param {string} text - Text cần xử lý
 * @returns {string} Kết quả sau khi xử lý
 */

/**
 * Kiểm tra xem record có createdBy hợp lệ không
 * @param {Object} record - Record cần kiểm tra
 * @returns {boolean}
 * 
 * Có thể custom ở hàm này những CreatedBy mình mong muốn
 */



function isValidCreatedBy(record) {
      let validCreatedBy = [
        "ThreadsKeywordPostNoCookieCrawlingLoader",
        "ThreadsHashtagPostNoCookieCrawlingLoader",
        "ThreadsSourceReplyNoCookieCrawlingLoader",
        "ThreadsRepostNoCookieCrawlingLoader",
        "ThreadsSourcePostNoCookieCrawlingLoader",
         "ThreadsKeywordPostCrawlingLoader",
        "ThreadsHashtagPostCrawlingLoader",
        "ThreadsSourceReplyCrawlingLoader",
        "ThreadsRepostCrawlingLoader",
        "ThreadsSourcePostCrawlingLoader",
        "YoutubePostFromCrisisKeywordCrawlingLoader"

    ];

    return validCreatedBy.includes(record.createdBy);
}

/**
 * Hàm chính để verify toàn bộ file JSON
 * @param {string} filePath - Đường dẫn đến file JSON
 * @param {Array} searchText - Mảng chứa [title, caption, shared_content]
 * @returns {Object} Kết quả tổng hợp
 */
function verifyJsonFile(filePath) {
    const jsonData = readJsonFile(filePath);

    if (!Array.isArray(jsonData)) {
        console.error('Dữ liệu trong file không phải là mảng');
        return null;
    }

    const results = {
        totalRecords: jsonData.length,
        targetRecords: 0,
        validLoaderRecords: 0,
        skippedRecords: 0,
        details: []
    };

    jsonData.forEach((record, index) => {

        if (isValidCreatedBy(record)) {
            results.targetRecords++;

            const recordResult = {
                index: index,
                createdBy: record.createdBy,
                checked: true,
                id: record.id,
                loaderVerification: verifyLoaderFields(record)
            };

            if (recordResult.loaderVerification.isValid) {
                results.validLoaderRecords++;
            }

            results.details.push(recordResult);
        } else {
            // Bỏ qua record này
            results.skippedRecords++;
                results.details.push({
                index: index,
                createdBy: record.createdBy,
                checked: false,
                loaderVerification: null,
                reason: 'createdBy không thuộc target list'
            });
        }
    });

    return results;
}

/**
 * Hàm hiển thị kết quả một cách dễ đọc
 * @param {Object} results - Kết quả từ verifyJsonFile
 */
function displayResults(results) {
    if (!results) {
        console.log('Không có kết quả để hiển thị');
        return;
    }

    console.log('=== KẾT QUẢ KIỂM TRA ===');
    console.log(`Tổng số record: ${results.totalRecords}`);
    console.log(`Số record cần kiểm tra (target createdBy): ${results.targetRecords}`);
    console.log(`Số record bỏ qua: ${results.skippedRecords}`);
    console.log(`Số record loader hợp lệ: ${results.validLoaderRecords}`);
    console.log('');

    // === THÊM PHẦN GOM NHÓM CREATEDBY HỢP LỆ ===
    const validCreatedByGroups = {};

    // Gom nhóm các records đã check (có createdBy hợp lệ)
    results.details.filter(detail => detail.checked).forEach(detail => {
        const createdBy = detail.createdBy || 'undefined';
        
        if (!validCreatedByGroups[createdBy]) {
            validCreatedByGroups[createdBy] = {
                total: 0,
                valid: 0,
                invalid: 0
            };
        }
        
        validCreatedByGroups[createdBy].total++;
        
        if (detail.loaderVerification && detail.loaderVerification.isValid) {
            validCreatedByGroups[createdBy].valid++;
        } else {
            validCreatedByGroups[createdBy].invalid++;
        }
    });

    // Hiển thị thống kê theo createdBy
    if (Object.keys(validCreatedByGroups).length > 0) {
        console.log('=== THỐNG KÊ THEO CREATEDBY HỢP LỆ ===');
        Object.entries(validCreatedByGroups).forEach(([createdBy, stats]) => {
            const percentage = stats.total > 0 ? ((stats.valid / stats.total) * 100).toFixed(1) : '0.0';
            console.log(`${createdBy}:`);
            console.log(`  - Tổng: ${stats.total} records`);
            console.log(`  - Hợp lệ: ${stats.valid} records (${percentage}%)`);
            console.log(`  - Không hợp lệ: ${stats.invalid} records`);
            console.log('');
        });
    }

    // Hiển thị chi tiết các record target không hợp lệ
    const invalidTargetRecords = results.details.filter(detail =>
        detail.checked &&
        detail.loaderVerification &&
        !detail.loaderVerification.isValid
    );

    if (invalidTargetRecords.length > 0) {
        console.log('=== CHI TIẾT RECORDS KHÔNG HỢP LỆ ===');
        invalidTargetRecords.forEach(detail => {
            console.log(`Record ${detail.index}: KHÔNG HỢP LỆ`);
            console.log(`Record có id ${detail.id}: KHÔNG HỢP LỆ`);
            console.log(`  - createdBy: ${detail.createdBy}`);
            console.log(`  - has caption: ${detail.loaderVerification.hasCaption}`);
            console.log(`  - has shared_content: ${detail.loaderVerification.hasSharedContent}`);
            console.log(`  - caption match: ${detail.loaderVerification.captionMatch}`);
            console.log(`  - shared_content match: ${detail.loaderVerification.sharedContentMatch}`);
            console.log('');
        });
    }

    // Tóm tắt records bỏ qua
    const skippedByCreatedBy = {};
    results.details.filter(detail => !detail.checked).forEach(detail => {
        const createdBy = detail.createdBy || 'null';
        skippedByCreatedBy[createdBy] = (skippedByCreatedBy[createdBy] || 0) + 1;
    });

    if (Object.keys(skippedByCreatedBy).length > 0) {
        console.log('=== RECORDS BỎ QUA THEO CREATEDBY ===');
        Object.entries(skippedByCreatedBy).forEach(([createdBy, count]) => {
            console.log(`${createdBy}: ${count} records`);
        });
    }

    // === TỔNG KẾT CREATEDBY HỢP LỆ ===
    const allValidCreatedBy = Object.keys(validCreatedByGroups);

    console.log('\n=== DANH SÁCH TẤT CẢ CREATEDBY HỢP LỆ ĐÃ KIỂM TRA ===');
    console.log(`Tổng số loại createdBy hợp lệ: ${allValidCreatedBy.length}`);
    allValidCreatedBy.sort().forEach((createdBy, index) => {
        const stats = validCreatedByGroups[createdBy];
        const percentage = ((stats.valid / stats.total) * 100).toFixed(1);
        console.log(`${index + 1}. ${createdBy} - ${stats.valid}/${stats.total} (${percentage}%)`);
    });
}

// Ví dụ sử dụng
function main() {
    const filePath = 'Data_get_from_rabbitMQ_by_scripts/messages_staging_cl_mentions_2_solr_mentions_TrangHK_2025-09-22T09-26-19-812Z.json'; // Thay đổi đường dẫn file của bạn

    const results = verifyJsonFile(filePath);
    displayResults(results);
}

// Export các hàm để sử dụng ở nơi khác
export default {
    readJsonFile,
    verifyJsonFile,
    displayResults,
    isValidCreatedBy
};

// Uncomment dòng dưới để chạy ví dụ
main();