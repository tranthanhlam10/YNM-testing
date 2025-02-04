const crypto = require('crypto');
 
function generateUUIDv5(input, namespace) {
  const ns = Buffer.from(namespace.replace(/-/g, ''), 'hex');
  const inputBuffer = Buffer.from(input);
   
  // Concatenate namespace and input
  const combined = Buffer.concat([ns, inputBuffer]);
   
  // Generate SHA-1 hash
  const hash = crypto.createHash('sha1').update(combined).digest();
   
  // Modify bits according to RFC 4122 section 4.3
  hash[6] = (hash[6] & 0x0f) | 0x50; // Set version to 5
  hash[8] = (hash[8] & 0x3f) | 0x80; // Set variant
   
  // Convert to hex and insert dashes
  const uuid = hash.slice(0, 16).toString('hex').replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
   
  return uuid;
}
 
// Example usagetiktok
const url = "threads.net/t/DDq6RP6TjTw";
const namespace = "6ba7b811-9dad-11d1-80b4-00c04fd430c8"; // Namespace for URL (RFC 4122)
 
const uuid = generateUUIDv5(url, namespace);
console.log(uuid);

