const start = new Date('2026-02-01');
const end = new Date();

const result = [];

for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  result.push(`${y}${m}${day}`);
}

console.log(result.join(','));