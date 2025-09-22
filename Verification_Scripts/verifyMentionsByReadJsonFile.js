import { readFileSync } from 'fs';

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
function verifyParentPostFields(record, searchText) {
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

    // Kiểm tra có parentPost không
    if (!record.parentPost || typeof record.parentPost !== 'object') {
        return result;
    }
    
    result.hasParentPost = true;

    // Kiểm tra title
    if (record.parentPost.title !== undefined) {
        result.hasTitle = true;
        result.titleMatch = record.parentPost.title === searchText[0];
    }

    // Kiểm tra caption
    if (record.parentPost.caption !== undefined) {
        result.hasCaption = true;
        result.captionMatch = record.parentPost.caption === searchText[1];
    }

    // Kiểm tra shared_content (chỉ cho bài share facebook, threads)
    if (record.parentPost.shared_content !== undefined) {
        result.hasSharedContent = true;
        // Giả sử ynm_des là một function xử lý search_text[2]
        // Bạn cần implement function này theo logic của mình
        const expectedSharedContent = processYnmDes(searchText[2]);
        result.sharedContentMatch = record.parentPost.shared_content === expectedSharedContent;
    }

    // Kiểm tra tổng thể
    result.isValid = result.hasParentPost && 
                    result.hasTitle && result.titleMatch &&
                    result.hasCaption && result.captionMatch &&
                    (result.hasSharedContent ? result.sharedContentMatch : true);

    return result;
}

/**
 * Function giả lập xử lý ynm_des - bạn cần implement theo logic thực tế
 * @param {string} text - Text cần xử lý
 * @returns {string} Kết quả sau khi xử lý
 */
function processYnmDes(text) {
    // Implement logic xử lý ynm_des ở đây
    // Hiện tại chỉ return text gốc
    return text;
}

/**
 * Kiểm tra xem record có createdBy hợp lệ không
 * @param {Object} record - Record cần kiểm tra
 * @returns {boolean}
 * 
 * Có thể custom ở hàm này những CreatedBy mình mong muốn
 */
function isValidCreatedBy(record) {
    const validCreatedBy = [
        "ThreadsKeywordPostNoCookieCrawlingLoader",
        "ThreadsHashtagPostNoCookieCrawlingLoader"
    ];
    
    return validCreatedBy.includes(record.createdBy);
}

/**
 * Hàm chính để verify toàn bộ file JSON
 * @param {string} filePath - Đường dẫn đến file JSON
 * @param {Array} searchText - Mảng chứa [title, caption, shared_content]
 * @returns {Object} Kết quả tổng hợp
 */
function verifyJsonFile(filePath, searchText) {
    const jsonData = readJsonFile(filePath);
    
    if (!Array.isArray(jsonData)) {
        console.error('Dữ liệu trong file không phải là mảng');
        return null;
    }

    if (!Array.isArray(searchText) || searchText.length < 3) {
        console.error('searchText phải là mảng có ít nhất 3 phần tử');
        return null;
    }

    const results = {
        totalRecords: jsonData.length,
        targetRecords: 0, // Records có createdBy cần check
        validParentPostRecords: 0,
        skippedRecords: 0, // Records bị bỏ qua
        details: []
    };

    jsonData.forEach((record, index) => {
        // Chỉ xử lý những record có createdBy target
        if (isValidCreatedBy(record)) {
            results.targetRecords++;
            
            const recordResult = {
                index: index,
                createdBy: record.createdBy,
                checked: true,
                id: record.id,  
                parentPostVerification: verifyParentPostFields(record, searchText)
            };
            
            if (recordResult.parentPostVerification.isValid) {
                results.validParentPostRecords++;
            }
            
            results.details.push(recordResult);
        } else {
            // Bỏ qua record này
            results.skippedRecords++;
            const unVerifyRecords =  results.details.push({
                index: index,
                createdBy: record.createdBy,
                checked: false,
                parentPostVerification: null,
                reason: 'createdBy không thuộc target list'
            });

            // console.log(`Bỏ qua record ${index} với createdBy: ${record.createdBy}`); // Log lý do bỏ qua
            // console.log (unVerifyRecords);
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
    console.log(`Số record có parentPost hợp lệ: ${results.validParentPostRecords}`);
    console.log('');

    // Hiển thị chi tiết các record target không hợp lệ
    const invalidTargetRecords = results.details.filter(detail => 
        detail.checked && 
        detail.parentPostVerification && 
        !detail.parentPostVerification.isValid
    );

    if (invalidTargetRecords.length > 0) {
        console.log('=== CHI TIẾT RECORDS KHÔNG HỢP LỆ ===');
        invalidTargetRecords.forEach(detail => {
            console.log(`Record ${detail.index}: KHÔNG HỢP LỆ`);
            console.log(`Record có id ${detail.id}: KHÔNG HỢP LỆ`);
            console.log(`  - createdBy: ${detail.createdBy}`);
            console.log(`  - parentPost exists: ${detail.parentPostVerification.hasParentPost}`);
            console.log(`  - title match: ${detail.parentPostVerification.titleMatch}`);
            console.log(`  - caption match: ${detail.parentPostVerification.captionMatch}`);
            console.log(`  - shared_content match: ${detail.parentPostVerification.sharedContentMatch}`);
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
}

// Ví dụ sử dụng
function main() {
    const filePath = 'Data_get_from_rabbitMQ_by_scripts/messages_staging_cl_mentions_2_solr_mentions_TrangHK_2025-09-22T09-26-19-812Z.json'; // Thay đổi đường dẫn file của bạn
    const searchText = ['title_text', 'caption_text', 'shared_content_text'];
    
    const results = verifyJsonFile(filePath, searchText);
    displayResults(results);
}

// Export các hàm để sử dụng ở nơi khác
export default {
    readJsonFile,
    verifyParentPostFields,
    verifyJsonFile,
    displayResults,
    isValidCreatedBy,
    processYnmDes
};

// Uncomment dòng dưới để chạy ví dụ
main();