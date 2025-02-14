const fs = require('fs');
const ENCODING_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

function decodeCustomBase(shortcode, alphabet = ENCODING_CHARS) {
    const base = BigInt(alphabet.length);
    let num = BigInt(0);
     
    for (let i = 0; i < shortcode.length; i++) {
        const char = shortcode[i];
        const power = BigInt(shortcode.length - (i + 1));
        num += BigInt(alphabet.indexOf(char)) * (base ** power);
    }
     
    return num.toString();
}

function processThreads(jsonData) {
    try {
        // If the input is a string, parse it as JSON
        const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
        
        // Ensure the data is an array
        const dataArray = Array.isArray(data) ? data : [data];
        
        // Chỉ trả về mảng các ID đã decode
        return dataArray.map(item => {
            const threadId = item.link.split('/t/')[1];
            return decodeCustomBase(threadId);
        });
    } catch (error) {
        console.error('Error processing JSON:', error.message);
        throw error;
    }
}

try {
    // Đọc và kiểm tra file input
    if (!fs.existsSync('format-input.json')) {
        console.error('Error: Input file "format-input.json" not found');
        process.exit(1);
    }

    const jsonData = fs.readFileSync('format-input.json', 'utf8');
    
    // Kiểm tra xem dữ liệu có rỗng không
    if (!jsonData.trim()) {
        console.error('Error: Input file is empty');
        process.exit(1);
    }


    const results = processThreads(jsonData);
    
 
    const csvContent = results.join('\n');

    // Lưu file CSV
    fs.writeFileSync('decoded_ids.csv', csvContent);
    
    console.log('Successfully processed', results.length, 'threads');
    console.log('Results saved to decoded_ids.csv');

} catch (error) {
    console.error('An error occurred:', error.message);
    process.exit(1);
}