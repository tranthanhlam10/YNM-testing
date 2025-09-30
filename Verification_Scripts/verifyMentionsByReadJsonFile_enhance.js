import { readFileSync } from 'fs';
import path from 'path';

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
function verifyParentPostFields(record) {
    const result = {
        hasParentPost: false,
        hasTitle: false,
        hasCaption: false,
        hasSharedContent: false,
        isValid: false
    };
    if (!record.parentPost || typeof record.parentPost !== 'object') {
        return result;
    }

    result.hasParentPost = true;

    if (record.parentPost.title !== undefined) {
        result.hasTitle = true;
        //result.titleMatch = record.parentPost.title === record.search_text[0];
    }

    if (record.parentPost.caption !== undefined) {
        result.hasCaption = true;
        //result.captionMatch = record.parentPost.caption === record.search_text[1];
    }


    if (record.platform === 1 || record.platform === 10) {
        if (record.parentPost.shared_content !== undefined) {
            result.hasSharedContent = true;
        }
    } else {
        result.hasSharedContent = true;
    }



    // result.isValid = result.hasParentPost &&
    //     result.hasTitle && result.titleMatch &&
    //     result.hasCaption && result.captionMatch &&
    //     result.hasSharedContent;


    result.isValid = result.hasParentPost &&
        result.hasTitle &&
        result.hasCaption &&
        result.hasSharedContent;


    return result;
}


function verifyMentionPostShare(record) {
    const result = {
        hasNoCaption: false,
        hasNoSharedContent: false,
        isValid: false
    };

    // Kiểm tra caption ở root - KHÔNG có caption = pass
    if (record.caption === undefined || record.caption === null || record.caption === '') {
        console.log(record.caption)
        result.hasNoCaption = true;
    }

    // Kiểm tra shared_content ở root 
    if (record.platform === 1 || record.platform === 10) {
        // Với Facebook/Threads - cần check shared_content
        if (record.shared_content === undefined || record.shared_content === null || record.shared_content === '') {
            result.hasNoSharedContent = true;
        }
    } else {
        // Với platform khác (TikTok, YouTube...) - không cần check shared_content
        result.hasNoSharedContent = true;
    }

    // Pass nếu KHÔNG có caption và KHÔNG có shared_content
    result.isValid = result.hasNoCaption && result.hasNoSharedContent;
    console.log(result);    
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
    const parsed = path.parse(scriptPath);
    const fileName = parsed.name; // e.g. "crawl_post_by_keywords"
    const parentDir = path.basename(path.dirname(scriptPath)); // e.g. "facebookV3"
    
    // Domain = bỏ số version (facebookV3 -> facebook, youtubeV2 -> youtube)
    // Regex mới: xóa V + số, hoặc chỉ số, và WithNextCrawlTime
    const domain = parentDir
        .replace(/V\d+/gi, "") // Xóa V3, V4, V2, etc.
        .replace(/\d+/gi, "") // Xóa các số còn lại
        .replace(/WithNextCrawlTime/gi, ""); // Xóa WithNextCrawlTime
    
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
        "YoutubePostFromCrisisKeywordCrawlingLoader",
        "PageWebCommentCrawlingLoader",
        "HighPriorityNewsDetailSourcesCrawlingLoader",
        "TiktokTagPostCrawlingLoader"

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
        validCreatedBy.push(getCreatedBy(s));
    });


    //console.log(validCreatedBy);    

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

    // if (!Array.isArray(searchText) || searchText.length < 3) {
    //     console.error('searchText phải là mảng có ít nhất 3 phần tử');
    //     return null;
    // }

    const results = {
        totalRecords: jsonData.length,
        targetCommentReplyRecords: 0,
        targetPostShareRecords: 0,
        validParentPostRecords: 0,
        validPostShareRecords: 0,
        skippedRecords: 0,
        details: []
    };

    jsonData.forEach((record, index) => {

        if (isValidCreatedBy(record)) {
            if (record.mention_type === 2) {
                results.targetCommentReplyRecords++;

                const recordResult = {
                    index: index,
                    createdBy: record.createdBy,
                    checked: true,
                    id: record.id,
                    parentPostVerification: verifyParentPostFields(record)
                };

                if (recordResult.parentPostVerification.isValid) {
                    results.validParentPostRecords++;
                }

                results.details.push(recordResult);
            } else {
                results.targetPostShareRecords++;
                // //console.log(`Record ${index} là post/share, createdBy hợp lệ: ${record.createdBy}`);
                // results.details.push({
                //     index: index,
                //     createdBy: record.createdBy,
                //     checked: true,
                //     parentPostVerification: null,
                //     reason: 'record là post/share hợp lệ, không cần kiểm tra parentPost'
                // });
                const recordResult = {
                    index: index,
                    createdBy: record.createdBy,
                    checked: true,
                    id: record.id,
                    postShareVerification: verifyMentionPostShare(record)
                };

                if (recordResult.postShareVerification.isValid) {
                    results.validPostShareRecords++;
                }

                results.details.push(recordResult);

            }
        } else {

            //Bỏ qua record này
            results.skippedRecords++;
            results.details.push({
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


function displayResults(results) {
    if (!results) {
        console.log('Không có kết quả để hiển thị');
        return;
    }

    console.log('=== KẾT QUẢ KIỂM TRA ===');
    console.log(`Tổng số record: ${results.totalRecords}`);
    console.log(`Số record comment/reply cần kiểm tra (target createdBy): ${results.targetCommentReplyRecords}`);
    console.log(`Số record post/share cần kiểm tra (target createdBy): ${results.targetPostShareRecords}`);
    console.log(`Số record bỏ qua: ${results.skippedRecords}`);
    console.log(`Số record reply/comment parentPost hợp lệ: ${results.validParentPostRecords}`);
    console.log(`Số record post/share hợp lệ: ${results.validPostShareRecords}`);
    console.log('');

    // === THÊM PHẦN GOM NHÓM CREATEDBY HỢP LỆ ===
    const validCreatedByGroups = {
        commentReply: {},
        postShare: {}
    };

    // Gom nhóm các records đã check (có createdBy hợp lệ)
    results.details.filter(detail => detail.checked).forEach(detail => {
        const createdBy = detail.createdBy;
        
        if (detail.parentPostVerification) {
            // Đây là comment/reply record
            if (!validCreatedByGroups.commentReply[createdBy]) {
                validCreatedByGroups.commentReply[createdBy] = {
                    total: 0,
                    valid: 0,
                    invalid: 0
                };
            }
            validCreatedByGroups.commentReply[createdBy].total++;
            
            if (detail.parentPostVerification.isValid) {
                validCreatedByGroups.commentReply[createdBy].valid++;
            } else {
                validCreatedByGroups.commentReply[createdBy].invalid++;
            }
            
        } else if (detail.postShareVerification) {
            // Đây là post/share record
            if (!validCreatedByGroups.postShare[createdBy]) {
                validCreatedByGroups.postShare[createdBy] = {
                    total: 0,
                    valid: 0,
                    invalid: 0
                };
            }
            validCreatedByGroups.postShare[createdBy].total++;
            
            if (detail.postShareVerification.isValid) {
                validCreatedByGroups.postShare[createdBy].valid++;
            } else {
                validCreatedByGroups.postShare[createdBy].invalid++;
            }
        }
    });

    // Hiển thị thống kê theo createdBy
    console.log('=== THỐNG KÊ THEO CREATEDBY HỢP LỆ ===');
    
    if (Object.keys(validCreatedByGroups.commentReply).length > 0) {
        console.log('\n--- COMMENT/REPLY RECORDS ---');
        Object.entries(validCreatedByGroups.commentReply).forEach(([createdBy, stats]) => {
            const percentage = ((stats.valid / stats.total) * 100).toFixed(1);
            console.log(`${createdBy}:`);
            console.log(`  - Tổng: ${stats.total} records`);
            console.log(`  - Hợp lệ: ${stats.valid} records (${percentage}%)`);
            console.log(`  - Không hợp lệ: ${stats.invalid} records`);
        });
    }

    if (Object.keys(validCreatedByGroups.postShare).length > 0) {
        console.log('\n--- POST/SHARE RECORDS ---');
        Object.entries(validCreatedByGroups.postShare).forEach(([createdBy, stats]) => {
            const percentage = ((stats.valid / stats.total) * 100).toFixed(1);
            console.log(`${createdBy}:`);
            console.log(`  - Tổng: ${stats.total} records`);
            console.log(`  - Hợp lệ: ${stats.valid} records (${percentage}%)`);
            console.log(`  - Không hợp lệ: ${stats.invalid} records`);
        });
    }

    console.log('');

    // Hiển thị chi tiết các record không hợp lệ
    const invalidTargetRecords = results.details.filter(detail =>
        (detail.checked &&
            detail.parentPostVerification &&
            !detail.parentPostVerification.isValid)
    );

    if (invalidTargetRecords.length > 0) {
        console.log('=== CHI TIẾT RECORDS REPLY/COMMENT KHÔNG HỢP LỆ ===');
        invalidTargetRecords.forEach(detail => {
            console.log(`Record ${detail.index}: KHÔNG HỢP LỆ`);
            console.log(`Record có id ${detail.id}: KHÔNG HỢP LỆ`);
            console.log(`  - createdBy: ${detail.createdBy}`);
            console.log(`  - parentPost exists: ${detail.parentPostVerification.hasParentPost}`);
            console.log(`  - title exists: ${detail.parentPostVerification.hasTitle}`);
            console.log(`  - caption exists: ${detail.parentPostVerification.hasCaption}`);
            console.log(`  - shared_content exists: ${detail.parentPostVerification.hasSharedContent}`);
            console.log('');
        });
    }

    const invalidPostShareRecords = results.details.filter(detail =>
        (detail.checked &&
            detail.postShareVerification &&
            !detail.postShareVerification.isValid)
    );

    if (invalidPostShareRecords.length > 0) {
        console.log('=== CHI TIẾT RECORDS POST SHARE KHÔNG HỢP LỆ ===');
        invalidPostShareRecords.forEach(detail => {
            console.log(`Record ${detail.index}: KHÔNG HỢP LỆ`);
            console.log(`Record có id ${detail.id}: KHÔNG HỢP LỆ`);
            console.log(`  - createdBy: ${detail.createdBy}`);
            console.log(`  - caption no exists: ${detail.postShareVerification.hasNoCaption}`);
            console.log(`  - shared_content no exists: ${detail.postShareVerification.hasNoSharedContent}`);
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
    const allValidCreatedBy = new Set([
        ...Object.keys(validCreatedByGroups.commentReply),
        ...Object.keys(validCreatedByGroups.postShare)
    ]);

    console.log('\n=== DANH SÁCH TẤT CẢ CREATEDBY HỢP LỆ ĐÃ KIỂM TRA ===');
    console.log(`Tổng số loại createdBy hợp lệ: ${allValidCreatedBy.size}`);
    Array.from(allValidCreatedBy).sort().forEach((createdBy, index) => {
        console.log(`${index + 1}. ${createdBy}`);
    });
}

// Ví dụ sử dụng
function main() {
    const filePath = "Data_get_from_rabbitMQ_by_scripts/mentions_ParseDetailNew2.json"
    const results = verifyJsonFile(filePath);
    displayResults(results);
}

// Export các hàm để sử dụng ở nơi khác
export default {
    readJsonFile,
    verifyParentPostFields,
    verifyJsonFile,
    displayResults,
    isValidCreatedBy

};

// Uncomment dòng dưới để chạy ví dụ
main();