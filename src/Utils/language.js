//import emojiRegex 
function getRandomGreeting() {
    // Import emoji-regex
    const emojiRegex = require('emoji-regex');
    
    const greetings = {
        'viet': 'Trump on Elon Musk: “He’s not gonna be president…you know why? He can’t be; he wasn’t born in this country. Haha.”\n\ntrump #elon #joke #president',
        //'anh': 'Hello 👋, nice to meet you! www.example.com',
        //'thai': 'สวัสดี 🙏, ยินดีที่ได้รู้จัก! http://thai.com',
        //'tay_ban_nha': '¡Hola 👋, encantado de conocerte! example.com/hello'
    };
    
    // Chọn câu chào ngẫu nhiên
    const languages = Object.keys(greetings);
    const randomLang = languages[Math.floor(Math.random() * languages.length)];
    let greeting = greetings[randomLang];
    
    // Pattern để remove links
    const urlPattern = /https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/g;
    
    // Xử lý text
    greeting = greeting
        // Remove emojis
        .replace(emojiRegex(), '')
        // Remove links
        .replace(urlPattern, '')
        // Remove extra spaces
        .replace(/\s+/g, ' ')
        .trim();
    
    return greeting;
}

// Sử dụng:
console.log(getRandomGreeting());