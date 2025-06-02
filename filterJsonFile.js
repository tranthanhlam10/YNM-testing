import { promises as fs } from 'fs';

/**
 * Hàm lọc file JSON
 * @param {string} inputPath - Đường dẫn file JSON input
 * @param {Function|Object|Array} filterCondition - Điều kiện lọc
 * @param {string} outputPath - Đường dẫn file JSON output (optional)
 * @returns {Promise<Object|Array>} - Kết quả đã lọc
 */
async function filterJSONFile(inputPath, filterCondition, outputPath = null) {
    try {
        // Đọc file JSON
        const fileContent = await fs.readFile(inputPath, 'utf8');
        const jsonData = JSON.parse(fileContent);
        
        // Lọc dữ liệu
        const filteredData = filterData(jsonData, filterCondition);
        
        // Ghi file output nếu có đường dẫn
        if (outputPath) {
            await fs.writeFile(outputPath, JSON.stringify(filteredData, null, 2), 'utf8');
            console.log(`Filtered data saved to: ${outputPath}`);
        }
        
        return filteredData;
    } catch (error) {
        throw new Error(`Error processing file: ${error.message}`);
    }
}

/**
 * Hàm lọc dữ liệu
 */
function filterData(data, filterCondition) {
    // Nếu data là array
    if (Array.isArray(data)) {
        if (typeof filterCondition === 'function') {
            return data.filter(filterCondition);
        } else if (typeof filterCondition === 'object') {
            return data.filter(item => {
                return Object.keys(filterCondition).every(key => {
                    return item[key] === filterCondition[key];
                });
            });
        }
        return data;
    }
    
    // Nếu data là object
    if (typeof data === 'object' && data !== null) {
        const result = {};
        
        if (typeof filterCondition === 'function') {
            // Lọc theo function
            for (const [key, value] of Object.entries(data)) {
                if (filterCondition(value, key)) {
                    result[key] = value;
                }
            }
        } else if (Array.isArray(filterCondition)) {
            // Lọc theo danh sách keys
            for (const key of filterCondition) {
                if (data.hasOwnProperty(key)) {
                    result[key] = data[key];
                }
            }
        } else if (typeof filterCondition === 'object') {
            // Lọc theo object condition
            for (const [key, value] of Object.entries(data)) {
                if (matchesCondition(value, filterCondition)) {
                    result[key] = value;
                }
            }
        }
        
        return result;
    }
    
    return data;
}

/**
 * Kiểm tra điều kiện match
 */
function matchesCondition(item, condition) {
    return Object.keys(condition).every(key => {
        return item && item[key] === condition[key];
    });
}

// ===== VÍ DỤ SỬ DỤNG =====

// // Ví dụ 1: Lọc array từ file
// async function example1() {
//     try {
//         // File users.json chứa array users
//         const activeUsers = await filterJSONFile(
//             './users.json',
//             user => user.active === true
//         );
//         console.log('Active Users:', activeUsers);
//     } catch (error) {
//         console.error('Error:', error.message);
//     }
// }

// // Ví dụ 2: Lọc object từ file
// async function example2() {
//     try {
//         // File data.json chứa object với nhiều keys
//         const specificData = await filterJSONFile(
//             './data.json',
//             ['user1', 'user3', 'settings'] // Chỉ lấy những keys này
//         );
//         console.log('Specific Data:', specificData);
//     } catch (error) {
//         console.error('Error:', error.message);
//     }
// }

// Ví dụ 3: Lọc và lưu file mới
async function example3() {
    try {
        await filterJSONFile(
            'news-testing.dev.articles_2.json',
            item => item.id_source === 'nguoiquansat.vn',
            'output.json' // Lưu kết quả vào file mới
        );
    } catch (error) {
        console.error('Error:', error.message);
    }
}

example3(); // Gọi hàm ví dụ 3


// Export
export default { filterJSONFile };