const ENCODING_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
 
function decodeCustomBase(shortcode, alphabet = ENCODING_CHARS) {
    const base = BigInt(alphabet.length);  // Sử dụng BigInt cho base
    let num = BigInt(0);
     
    for (let i = 0; i < shortcode.length; i++) {
        const char = shortcode[i];
        const power = BigInt(shortcode.length - (i + 1));
        num += BigInt(alphabet.indexOf(char)) * (base ** power);
    }
     
    return num.toString();
}


const pk = "DFHeiJsJDwk";
const code = decodeCustomBase(pk);
console.log(code); 


