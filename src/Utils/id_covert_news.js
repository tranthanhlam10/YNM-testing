const crypto = require('crypto');
const { URL } = require('url');

function generateIdFromLink(link) {
    console.log("Generating ID for:", link);
    try {
        const parsedUrl = new URL(link);
        const normalizedLink = parsedUrl.hostname + parsedUrl.pathname;
        const hash = crypto.createHash('sha1').update(normalizedLink).digest('hex');
        
        // Convert hash to UUID format
        const uuid = [
            hash.slice(0, 8),        // 8 characters
            hash.slice(8, 12),       // 4 characters
            '5' + hash.slice(13, 16), // 4 characters, set version 5
            '8' + hash.slice(17, 20), // 4 characters, set variant
            hash.slice(20, 32)       // 12 characters
        ].join('-');
        
        console.log("Normalized Link:", normalizedLink);
        console.log("Generated Hash:", hash);
        console.log("Generated UUID:", uuid);
        
        return uuid;
    } catch (error) {
        console.error("Error generating ID:", error);
        return null;
    }
}

// Test
console.log("File is running...");
const link = "https://moitruongvaxahoi.vn/quan-12-tphcm-khai-mac-cho-hoa-an-suong-truoc-them-tet-nguyen-dan-at-ty-2025-702894838.html";
const parsedId = generateIdFromLink(link);
console.log("Final ID:", parsedId);