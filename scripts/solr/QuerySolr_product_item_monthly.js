import axios from 'axios';
import { promises as fs } from 'fs';

// ============================================================
// ⚙️  CONFIG — chỉnh các thông số này mỗi lần chạy
// ============================================================
const SOLR_URL    = 'https://eci-testing.younetmedia.com/solr/product_item_monthly/select';
const SHARDS      = [
  '202201', '202202', '202203', '202204', '202205', '202206',
  '202207', '202208', '202209', '202210', '202211', '202212',
  '202301', '202302', '202303', '202304', '202305', '202306',
  '202307', '202308', '202309', '202310', '202311', '202312',
  '202401', '202402', '202403', '202404', '202405', '202406',
  '202407', '202408', '202409', '202410', '202411', '202412',
  '202501', '202502', '202503', '202504', '202505', '202506',
  '202507', '202508', '202509', '202510', '202511', '202512',
  '202601', '202602', '202603', '202604', '202605',
];                                                              // 👈 danh sách shard cần query
const SOURCE_JSON = 'Data_get_from_rabbitMQ_by_scripts/messages_cl_eca_loader_industry_2026-05-19T07-01-37-117Z.json'; // 👈 file JSON gốc từ RabbitMQ
const BATCH_SIZE  = 200;                                        // 👈 số docs mỗi Solr request (rows)
const OUTPUT_DIR  = 'Data_get_from_rabbitMQ_by_scripts';
const FL          = '*';                                        // 👈 fields muốn lấy
const AUTH        = { username: 'app', password: 'iamapp' };   // 👈 Basic Auth
// ============================================================

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const POST_CONFIG = {
  timeout : 60000,
  auth    : AUTH,
  headers : { 'Content-Type': 'application/x-www-form-urlencoded' },
};

function buildBody(idFilter, start = 0, rows = BATCH_SIZE) {
  const body = new URLSearchParams();
  body.append('q',      '*:*');
  body.append('q.op',   'OR');
  body.append('indent', 'true');
  if (SHARDS && SHARDS.length > 0) {
    body.append('fq', `shard:(${SHARDS.join(' ')})`);
  }
  body.append('fq',    idFilter);
  body.append('rows',  String(rows));
  body.append('start', String(start));
  body.append('fl',    FL);
  return body;
}

// Query 1 filter → trả về toàn bộ docs
async function fetchAllForFilter(idFilter, filterIdx, total) {
  // Probe để lấy numFound
  const probeResp = await axios.post(SOLR_URL, buildBody(idFilter, 0, 0), POST_CONFIG);
  const numFound  = probeResp.data?.response?.numFound ?? 0;

  if (numFound === 0) return [];

  const docs         = [];
  const totalBatches = Math.ceil(numFound / BATCH_SIZE);

  for (let i = 0; i < totalBatches; i++) {
    const start = i * BATCH_SIZE;
    const resp  = await axios.post(SOLR_URL, buildBody(idFilter, start), POST_CONFIG);
    const batch = resp.data?.response?.docs ?? [];
    docs.push(...batch);
  }
  return docs;
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────
async function querySolr() {
  try {
    // 1. Đọc danh sách messages gốc
    console.log(`📂 Đọc source JSON: ${SOURCE_JSON}`);
    const raw      = await fs.readFile(SOURCE_JSON, 'utf8');
    const messages = JSON.parse(raw);
    console.log(`✅ Loaded ${messages.length} messages (filters)\n`);

    console.log(`🔗 Solr URL : ${SOLR_URL}`);
    console.log(`📦 Shards   : ${SHARDS.length} shards (${SHARDS[0]} → ${SHARDS[SHARDS.length - 1]})\n`);

    // 2. Query từng filter riêng lẻ để tránh maxBooleanClauses
    const allDocs = [];
    let totalNumFound = 0;

    for (let idx = 0; idx < messages.length; idx++) {
      const idFilter = messages[idx].filters?.trim();
      if (!idFilter) {
        console.log(`  ⏭️  Message ${idx + 1}/${messages.length}: không có filter, bỏ qua`);
        continue;
      }

      // Đếm số IDs trong filter để hiển thị
      const idCount = (idFilter.match(/M\w+/g) || []).length;

      process.stdout.write(`  🔍 Message ${String(idx + 1).padStart(2)}/${messages.length} (${idCount} IDs)... `);

      const probeResp = await axios.post(SOLR_URL, buildBody(idFilter, 0, 0), POST_CONFIG);
      const numFound  = probeResp.data?.response?.numFound ?? 0;
      totalNumFound  += numFound;

      if (numFound === 0) {
        console.log(`numFound=0, skip`);
        continue;
      }

      console.log(`numFound=${numFound}`);

      const totalBatches = Math.ceil(numFound / BATCH_SIZE);
      for (let i = 0; i < totalBatches; i++) {
        const start = i * BATCH_SIZE;
        process.stdout.write(`    ⏳ batch ${i + 1}/${totalBatches} (start=${start})... `);
        const resp  = await axios.post(SOLR_URL, buildBody(idFilter, start), POST_CONFIG);
        const batch = resp.data?.response?.docs ?? [];
        allDocs.push(...batch);
        console.log(`✅ +${batch.length} (total: ${allDocs.length})`);
      }
    }

    // 3. Lưu kết quả
    console.log(`\n📊 Tổng numFound (cộng dồn): ${totalNumFound}`);
    console.log(`📊 Tổng docs thực tế lấy  : ${allDocs.length}`);

    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    const timestamp  = new Date().toISOString().replace(/[:.]/g, '-');
    const shardLabel = SHARDS.length === 1 ? SHARDS[0] : `multi${SHARDS.length}shards`;
    const outputFile = `${OUTPUT_DIR}/solr_product_item_monthly_${shardLabel}_${timestamp}.json`;

    await fs.writeFile(outputFile, JSON.stringify(allDocs, null, 2), 'utf8');

    console.log(`\n✅ Hoàn thành!`);
    console.log(`📄 Đã lưu ${allDocs.length} docs vào: ${outputFile}`);

  } catch (error) {
    console.error('\n💥 Lỗi xảy ra:');
    if (error.response) {
      console.error(`   HTTP Status : ${error.response.status}`);
      console.error(`   Response    :`, JSON.stringify(error.response.data).substring(0, 500));
    } else if (error.request) {
      console.error('   Không nhận được response từ server');
    } else {
      console.error('   Error:', error.message);
    }
    console.error(error.stack);
  }
}

// ─────────────────────────────────────────────
// Run
// ─────────────────────────────────────────────
querySolr();
