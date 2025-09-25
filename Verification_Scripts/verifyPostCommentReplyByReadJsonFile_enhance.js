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
function verifyPosts(record) {
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


    if (record.title !== undefined) {
        result.hasTitle = true;
    }

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
        result.hasTitle && 
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


/**
 * Convert script path -> createdBy
 * @param {string} scriptPath - e.g. "scripts/facebookV3/crawl_post_by_keywords.js"
 * @returns {string} createdBy - e.g. "FacebookCrawlPostByKeywords"
 */
function getCreatedBy(scriptPath) {
    // Lấy tên file và thư mục cha
    const parsed = path.parse(scriptPath);
    const fileName = parsed.name; // e.g. "crawl_post_by_keywords"
    const parentDir = path.basename(path.dirname(scriptPath)); // e.g. "facebookV3"

    // Domain = bỏ số version (facebookV3 -> facebook)
    const domain = parentDir.replace(/[0-9]/gi, "").replace(/WithNextCrawlTime/gi, "");

    // Convert fileName snake_case -> PascalCase
    const pascal = fileName
        .split("_")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join("");

    // Gắn lại Domain (PascalCase) + Script
    return domain.charAt(0).toUpperCase() + domain.slice(1) + pascal;
}



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

    ];

    const oldScripts = [
        "scripts/facebookV3/get_latest_group_posts.js",
        "scripts/facebookV3/get_latest_priority_group_posts.js",
        "scripts/facebookV3/get_latest_crisis_group_posts.js",
        "scripts/facebookV3/get_latest_priority_close_group_posts.js",
        "scripts/facebookV3/crawl_post_by_keywords.js",
        "scripts/facebookV4/get_latest_hashtag_posts.js",
        "scripts/facebookV4/get_latest_hashtag_posts_crisis.js",
        "scripts/facebookV3/crawl_post_by_keywords_crisis.js",
        "scripts/commentsV3/crawl_url_comments.js",
        "scripts/commentsV3/crawl_reviews.js",
        "scripts/forumV3/get_posts.js",
        "scripts/forumV3/get_posts_prev.js",
        "scripts/articlesV3WithNextCrawlTime/crawlYoutubeDetails.js",
        "scripts/youtubeV2/get_latest_top_50_trending.js",
        "scripts/youtubeV3/monitoring_priority_channel.js",
        "scripts/youtubeV3/monitoring_priority_video.js",
        "scripts/youtubeV3/monitoring_channel.js",
        "scripts/youtubeV3/monitoring_video.js",
        "scripts/youtubeV3/get_latest_priority_channels_videos_by_api.js",
        "scripts/youtubeV3/get_latest_priority_videos_comments_by_api.js",
        "scripts/youtubeV2/get_latest_priority_channels_info.js",
        "scripts/youtubeV2/get_latest_priority_comments_replies.js",
        "scripts/youtubeV2/get_latest_priority_channels_info_monthly.js",
        "scripts/youtubeV2/get_latest_potential_channels_info.js",
        "scripts/tiktok/get_latest_user_posts.js",
        "scripts/tiktok/get_latest_priority_user_posts.js",
        "scripts/tiktok/get_latest_user_posts_SL.js",
        "scripts/tiktok/get_latest_post_comments.js",
        "scripts/tiktok/get_latest_priority_post_comments.js",
        "scripts/tiktok/get_latest_post_comments_SL.js",
    ];

    oldScripts.forEach(s => {
        validCreatedBy.push( getCreatedBy(s) ); 
    });


   // console.log(validCreatedBy);    

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
        validPostRecords: 0,
        skippedRecords: 0,
        details: []
    };

    jsonData.forEach((record, index) => {

        // if (isValidCreatedBy(record)) {
            results.targetRecords++;

            const recordResult = {
                index: index,
                createdBy: record.createdBy,
                checked: true,
                id: record.id,
                postVerification: verifyPosts(record)
            };

            if (recordResult.postVerification.isValid) {
                results.validPostRecords++;
            }

            results.details.push(recordResult);
        // } else {
        //     // Bỏ qua record này
        //     results.skippedRecords++;
        //         results.details.push({
        //         index: index,
        //         createdBy: record.createdBy,
        //         checked: false,
        //         postVerification: null,
        //         reason: 'createdBy không thuộc target list'
        //     });

        //     // console.log(`Bỏ qua record ${index} với createdBy: ${record.createdBy}`); // Log lý do bỏ qua
        //     // console.log (unVerifyRecords);
        // }
    });

    return results;
}

/**
 * Hàm hiển thị kết quả một cách dễ đọc
 * @param {Object} results - Kết quả từ verifyJsonFile
//  */
// function displayResults(results) {
//     if (!results) {
//         console.log('Không có kết quả để hiển thị');
//         return;
//     }

//     console.log('=== KẾT QUẢ KIỂM TRA ===');
//     console.log(`Tổng số record: ${results.totalRecords}`);
//     console.log(`Số record cần kiểm tra (target createdBy): ${results.targetRecords}`);
//     console.log(`Số record bỏ qua: ${results.skippedRecords}`);
//     console.log(`Số record có parentPost hợp lệ: ${results.validPostRecords}`);
//     console.log('');

//     // Hiển thị chi tiết các record target không hợp lệ
//     const invalidTargetRecords = results.details.filter(detail =>
//         detail.checked &&
//         detail.postVerification &&
//         !detail.postVerification.isValid
//     );

//     if (invalidTargetRecords.length > 0) {
//         console.log('=== CHI TIẾT RECORDS KHÔNG HỢP LỆ ===');
//         invalidTargetRecords.forEach(detail => {
//             console.log(`Record ${detail.index}: KHÔNG HỢP LỆ`);
//             console.log(`Record có id ${detail.id}: KHÔNG HỢP LỆ`);
//             // console.log(`  - createdBy: ${detail.createdBy}`);
//             console.log(`  - title match: ${detail.postVerification.titleMatch}`);
//             console.log(`  - caption match: ${detail.postVerification.captionMatch}`);
//             console.log(`  - shared_content match: ${detail.postVerification.sharedContentMatch}`);
//             console.log('');
//         });
//     }

//     // Tóm tắt records bỏ qua
//     const skippedByCreatedBy = {};
//     results.details.filter(detail => !detail.checked).forEach(detail => {
//         const createdBy = detail.createdBy || 'null';
//         skippedByCreatedBy[createdBy] = (skippedByCreatedBy[createdBy] || 0) + 1;
//     });

//     if (Object.keys(skippedByCreatedBy).length > 0) {
//         console.log('=== RECORDS BỎ QUA THEO CREATEDBY ===');
//         Object.entries(skippedByCreatedBy).forEach(([createdBy, count]) => {
//             console.log(`${createdBy}: ${count} records`);
//         });
//     }
// }

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
    console.log(`Số record có post hợp lệ: ${results.validPostRecords}`);
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
        
        if (detail.postVerification && detail.postVerification.isValid) {
            validCreatedByGroups[createdBy].valid++;
        } else {
            validCreatedByGroups[createdBy].invalid++;
        }
    });

    // Hiển thị thống kê theo createdBy
    if (Object.keys(validCreatedByGroups).length > 0) {
        console.log('=== THỐNG KÊ THEO CREATEDBY ĐÃ KIỂM TRA ===');
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
        detail.postVerification &&
        !detail.postVerification.isValid
    );

    if (invalidTargetRecords.length > 0) {
        console.log('=== CHI TIẾT RECORDS KHÔNG HỢP LỆ ===');
        invalidTargetRecords.forEach(detail => {
            console.log(`Record ${detail.index}: KHÔNG HỢP LỆ`);
            console.log(`Record có id ${detail.id}: KHÔNG HỢP LỆ`);
            console.log(`  - createdBy: ${detail.createdBy}`);
            console.log(`  - has title: ${detail.postVerification.hasTitle}`);
            console.log(`  - has caption: ${detail.postVerification.hasCaption}`);
            console.log(`  - has shared_content: ${detail.postVerification.hasSharedContent}`);
            console.log(`  - title match: ${detail.postVerification.titleMatch}`);
            console.log(`  - caption match: ${detail.postVerification.captionMatch}`);
            console.log(`  - shared_content match: ${detail.postVerification.sharedContentMatch}`);
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

    // === TỔNG KẾT CREATEDBY ĐÃ KIỂM TRA ===
    const allCheckedCreatedBy = Object.keys(validCreatedByGroups);

    console.log('\n=== DANH SÁCH TẤT CẢ CREATEDBY ĐÃ KIỂM TRA ===');
    console.log(`Tổng số loại createdBy đã kiểm tra: ${allCheckedCreatedBy.length}`);
    allCheckedCreatedBy.sort().forEach((createdBy, index) => {
        const stats = validCreatedByGroups[createdBy];
        const percentage = ((stats.valid / stats.total) * 100).toFixed(1);
        console.log(`${index + 1}. ${createdBy} - ${stats.valid}/${stats.total} (${percentage}%)`);
    });
}



// Ví dụ sử dụng
function main() {
    const filePath = 'Data_get_from_rabbitMQ_by_scripts/post_FacebookGetLatestHashtagPosts.json'; 

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

main();