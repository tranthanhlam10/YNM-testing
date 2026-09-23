const ENCODING_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

function encodeCustomBase(num, alphabet = ENCODING_CHARS) {
    const base = BigInt(alphabet.length);  // Sử dụng BigInt cho base
    let shortcode = '';
    
    while (num > 0) {
        const remainder = num % base;
        shortcode = alphabet[Number(remainder)] + shortcode;
        num = num / base;
    }
    
    return shortcode;
}

// Ví dụ: Mã hóa pk thành code
const pk = BigInt('3533393364987330000');
const code = encodeCustomBase(pk);
console.log(code); 