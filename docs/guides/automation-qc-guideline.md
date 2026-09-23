# 📋 QC Automation Guideline — automation-crawler-pipeline

> **Mục đích**: Tài liệu hướng dẫn dành cho QC Auto team để hiểu cấu trúc source, cách cài đặt, cách chạy test, cách viết test case mới, cách assert, và cách xuất report.
>
> **Cập nhật lần cuối**: 2026-09-14

---

## 1. 🏗️ Tổng quan cấu trúc source

### 1.1 Mục đích dự án

Project **automation-crawler-pipeline** là bộ E2E automation test cho **Loader pipeline** trong hệ thống Crawling. Test thực hiện trên hạ tầng thật (K8s, Solr, RabbitMQ, Redis, MySQL) theo mô hình **Seed → Run → Verify**:

1. **Seed** data test vào Solr (identity docs)
2. **Run** Loader thật trên pod K8s
3. **Verify** output: message trong RabbitMQ, dedup trong Redis, schema validation

### 1.2 Sơ đồ cấu trúc thư mục

```
automation-crawler-pipeline/
├── src/                          # Source code chính (framework)
│   ├── config/                   # Cấu hình environment & platform registry
│   │   ├── env.ts                # Load biến môi trường (.env → typed config)
│   │   └── platform-registry.ts  # Đăng ký platform/flow (TikTok, Threads, FB...)
│   ├── harness/                  # Test harness — quản lý lifecycle test
│   │   ├── testContext.ts        # Factory tạo context chung cho mọi test
│   │   └── testLock.ts           # Redis lock chống chạy đồng thời
│   ├── infra/                    # Infra adapters (kết nối hạ tầng thật)
│   │   ├── fixtures/             # Fixture profiles theo platform
│   │   │   ├── types.ts          # Interface IdentityDoc, PlatformFixtureProfile
│   │   │   ├── platformFixtures.ts # Build matching/non-matching docs
│   │   │   └── index.ts          # Re-export
│   │   ├── schemas/              # JSON Schema cho message của từng platform
│   │   │   ├── tiktok-post.loaderMessage.schema.json
│   │   │   ├── threads-source-post-no-cookie.loaderMessage.schema.json
│   │   │   └── ...
│   │   ├── rabbitmqConsumer.ts   # Consume & validate message từ queue
│   │   ├── redisVerifier.ts      # Verify/cleanup Redis keys (SCAN-based)
│   │   ├── mysqlVerifier.ts      # MySQL connectivity & verify (placeholder)
│   │   ├── solrSeeder.ts         # Seed/cleanup/query data vào Solr
│   │   └── schemaLoader.ts       # Load JSON Schema theo platform flow
│   ├── k8s/                      # Kubernetes operations
│   │   ├── k8sClient.ts          # K8s client singleton
│   │   ├── podFinder.ts          # Tìm pod đang Running theo pattern
│   │   ├── podExec.ts            # kubectl exec vào pod
│   │   ├── loaderRunner.ts       # Start/stop Loader trên pod K8s
│   │   ├── podLogReader.ts       # Đọc log từ pod
│   │   └── processCleaner.ts     # Kill process cũ trên pod
│   └── utils/                    # Utilities
│       ├── logger.ts             # Logger thống nhất
│       └── redactLog.ts          # Che credentials trong log
├── tests/                        # Test cases
│   ├── loader/                   # ⭐ Test suite chính — Loader E2E
│   │   ├── tc-loader-001-count.test.ts
│   │   ├── tc-loader-002-collection.test.ts
│   │   ├── tc-loader-003-queue.test.ts
│   │   ├── tc-loader-004-schema.test.ts
│   │   ├── tc-loader-005-field-mapping.test.ts
│   │   ├── tc-loader-006-redis-lock.test.ts
│   │   └── tc-loader-007-skip-locked.test.ts
│   ├── smoke/                    # Smoke test connectivity
│   │   └── connectivity.test.ts
│   └── unit/                     # Unit test cho các module
│       ├── loader-harness.test.ts
│       └── platform-config.test.ts
├── scripts/                      # Helper scripts & custom reporters
│   ├── loader-reporter.ts        # Custom Vitest reporter → Markdown
│   ├── markdown-reporter.ts      # Smoke test reporter → Markdown
│   ├── inspect-loader.ts         # Script kiểm tra Loader logs
│   └── pod-loader.cjs            # Script chạy Loader trên pod K8s
├── docs/                         # Documentation
│   └── loader-e2e.md
├── artifacts/                    # Output artifacts (logs, messages JSON)
├── allure-results/               # Allure raw results
├── allure-report/                # Allure HTML report
├── reports/                      # Markdown reports archive
├── .env                          # Biến môi trường (KHÔNG commit)
├── .env.example                  # Template biến môi trường
├── package.json                  # Dependencies & scripts
├── vitest.config.ts              # Vitest config (timeout, sequential)
└── tsconfig.json                 # TypeScript config
```

---

## 2. 🔗 Kiến trúc & Liên kết giữa các module

### 2.1 Sơ đồ luồng chạy test

```
┌─────────────────────────────────────────────────────────────────┐
│                        TEST FILE (.test.ts)                     │
│  describe("TC_LOADER_XXX - ...")                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ beforeAll()                                              │   │
│  │  1. createTestContext() ──→ TestContext                   │   │
│  │  2. testLock.acquire()  ──→ Redis lock                   │   │
│  │  3. purgeQueue()        ──→ RabbitMQ sạch                │   │
│  │  4. solrSeeder.seed()   ──→ Seed data vào Solr           │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ it("test assertion...")                                  │   │
│  │  5. loaderRunner.start()──→ Chạy Loader trên pod K8s    │   │
│  │  6. consumeMessages()   ──→ Nhận message từ queue        │   │
│  │  7. expect(...)         ──→ Assert kết quả               │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ afterAll()                                               │   │
│  │  8. ctx.cleanup()       ──→ Dọn dẹp Solr, Redis, Queue  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Mối liên kết giữa các file

| Module | Vai trò | Phụ thuộc |
|--------|---------|-----------|
| `config/env.ts` | Load .env → typed `EnvConfig` | `dotenv` |
| `config/platform-registry.ts` | Đăng ký platform (pod pattern, queue, schema...) | — |
| `harness/testContext.ts` | **Factory trung tâm** — tạo toàn bộ connections & adapters | Tất cả module trong `infra/`, `k8s/`, `config/` |
| `harness/testLock.ts` | Redis distributed lock chống chạy đồng thời | `ioredis` |
| `infra/solrSeeder.ts` | Seed & cleanup data Solr | `fixtures/` |
| `infra/fixtures/` | Build identity docs (matching/non-matching) theo platform | `platform-registry.ts` |
| `infra/rabbitmqConsumer.ts` | Purge queue, consume & validate message | `amqplib`, `ajv`, `schemas/` |
| `infra/redisVerifier.ts` | Verify/cleanup Redis keys (SCAN) | `ioredis` |
| `infra/mysqlVerifier.ts` | MySQL connectivity & verify | `mysql2` |
| `k8s/loaderRunner.ts` | Start/stop Loader thật trên pod K8s | `podFinder`, `podExec`, `processCleaner` |
| `k8s/podFinder.ts` | Tìm pod Running theo regex pattern | `@kubernetes/client-node` |
| `k8s/podExec.ts` | kubectl exec commands | `@kubernetes/client-node` |

### 2.3 Luồng data

```
Solr (seed docs) ──→ Loader (trên K8s pod) ──→ RabbitMQ (queue)
                                              ──→ Redis (dedup set)
                                              
Test đọc kết quả từ RabbitMQ & Redis để assert.
```

---

## 3. ⚙️ Cách cài đặt

### 3.1 Prerequisites

| Tool | Version | Mô tả |
|------|---------|-------|
| **Node.js** | ≥ 18.x | Runtime |
| **npm** | ≥ 9.x | Package manager |
| **kubectl** | latest | Kết nối K8s cluster |
| **kubeconfig** | — | File config trỏ tới cluster testing |

### 3.2 Các bước cài đặt

```bash
# 1. Clone repository
git clone <repo-url>
cd automation-crawler-pipeline

# 2. Cài dependencies
npm install

# 3. Tạo file .env từ template
cp .env.example .env

# 4. Điền thông tin credentials vào .env
#    (xin thông tin từ DevOps/Lead)
```

### 3.3 Cấu hình file `.env`

```bash
# ──── K8s ────
# Đường dẫn kubeconfig (mặc định: ~/.kube/config)
# KUBECONFIG=/path/to/your/kubeconfig

# ──── RabbitMQ ────
RABBITMQ_URL=amqp://username:password@host:5672

# ──── Redis ────
REDIS_HOST=your_host
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_DB=1

# ──── Solr ────
SOLR_BASE_URL=http://your_host:8983/solr
SOLR_USERNAME=
SOLR_PASSWORD=

# ──── MySQL ────
MYSQL_HOST=your_host
MYSQL_PORT=3306
MYSQL_USER=your_user
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=ynm_crawling_loaders
```

### 3.4 Verify cài đặt

```bash
# Chạy smoke test để kiểm tra connectivity tới tất cả services
npm run test:smoke
```

> [!IMPORTANT]
> Đảm bảo kubeconfig đã trỏ đúng tới cluster **testing** (KHÔNG phải production).
> Đảm bảo VPN/network đã kết nối tới hạ tầng testing.

---

## 4. 🚀 Cách chạy test

### 4.1 Các lệnh chạy chính

| Lệnh | Mô tả |
|-------|-------|
| `npm run test:loader` | Chạy toàn bộ Loader E2E tests + xuất markdown report |
| `npm run test:loader:watch` | Chạy Loader tests ở chế độ watch (dev) |
| `npm run test:smoke` | Chạy smoke test connectivity |
| `npm run test:smoke:report` | Smoke test + xuất markdown report |
| `npm run loader:logs` | Kiểm tra log Loader trên pod |

### 4.2 Chạy test case cụ thể

```bash
# Chạy 1 file test cụ thể
npx vitest run tests/loader/tc-loader-001-count.test.ts

# Chạy theo tên test (grep)
npx vitest run tests/loader -t "TC_LOADER_001"

# Chạy với timeout tùy chỉnh
npx vitest run tests/loader/tc-loader-001-count.test.ts --testTimeout=600000
```

### 4.3 Lưu ý quan trọng khi chạy

> [!WARNING]
> - Tất cả test **chạy tuần tự** (không parallel) vì dùng chung pod K8s, Redis lock, Solr.
> - Timeout mặc định: **5 phút** (300s) — Loader cần thời gian query Solr + push queue.
> - Mỗi lần chạy tạo `testRunId` unique → data seed và queue đều được isolate.
> - **Không chạy 2 lần cùng lúc** trên cùng platform — Redis lock sẽ chặn.

### 4.4 Đổi platform test

Mặc định test chạy trên platform được khai báo tại `ACTIVE_PLATFORM_KEY` trong [platform-registry.ts](file:///Users/tranthanhlam/automation-crawler-pipeline/src/config/platform-registry.ts#L26):

```typescript
// File: src/config/platform-registry.ts
export const ACTIVE_PLATFORM_KEY = "threads-source-post-no-cookie";
```

Để đổi platform, thay giá trị này bằng key khác có trong `platformRegistry` (ví dụ: `"tiktok-post"`).

---

## 5. ✍️ Cách QC input test case mới

### 5.1 Naming Convention

```
tests/loader/tc-loader-{NNN}-{short-desc}.test.ts
```

| Phần | Quy ước | Ví dụ |
|------|---------|-------|
| `NNN` | Số thứ tự 3 chữ số, tăng dần | `008`, `009`, `010` |
| `short-desc` | Mô tả ngắn, kebab-case | `retry-count`, `batch-size`, `priority-filter` |

### 5.2 Template test case chuẩn

```typescript
// File: tests/loader/tc-loader-008-<mô-tả>.test.ts

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestContext,
  generateTestRunId,
  type TestContext,
} from "../../src/harness/testContext.js";
import { buildMatchingDocs, buildNonMatchingDocs } from "../../src/infra/solrSeeder.js";
import { ACTIVE_PLATFORM_KEY } from "../../src/config/platform-registry.js";

describe("TC_LOADER_008 - <Mô tả ngắn gọn test case>", () => {
  // ── CONFIG ──
  const MATCHING_COUNT = 3;          // Số identity thỏa điều kiện
  const CONSUME_TIMEOUT_MS = 240_000; // Timeout chờ message (4 phút)

  // ── STATE ──
  let ctx: TestContext;
  let testRunId: string;
  let targetQueue: string;

  // ══════════════════════════════════════════════
  // SETUP: beforeAll — chạy 1 lần trước tất cả it()
  // ══════════════════════════════════════════════
  beforeAll(async () => {
    // 1. Tạo context + unique run ID
    testRunId = generateTestRunId();
    ctx = await createTestContext(ACTIVE_PLATFORM_KEY, testRunId);
    targetQueue = `testing${ctx.flow.queueName}`;

    // 2. Acquire lock — chống chạy đồng thời
    await ctx.testLock.acquire(ctx.flow);

    // 3. Purge queue — đảm bảo sạch trước khi test
    await ctx.rabbitmqConsumer.purgeQueue(targetQueue);

    // 4. Seed data vào Solr
    const matchingDocs = buildMatchingDocs(MATCHING_COUNT, testRunId, {
      platformId: ctx.flow.platformId,
    });
    await ctx.solrSeeder.seed(matchingDocs);

    // 5. (Tùy chọn) Verify seed data
    const seededCount = await ctx.solrSeeder.queryCount(`id:*${testRunId}*`);
    expect(seededCount).toBe(MATCHING_COUNT);
  });

  // ══════════════════════════════════════════════
  // TEARDOWN: afterAll — dọn dẹp sau tất cả it()
  // ══════════════════════════════════════════════
  afterAll(async () => {
    await ctx?.cleanup(testRunId);
  });

  // ══════════════════════════════════════════════
  // TEST CASES
  // ══════════════════════════════════════════════

  it("<mô tả assertion 1>", async () => {
    // Start Loader trên pod K8s
    await ctx.loaderRunner.start(ctx.flow);

    // Consume messages từ queue
    const messages = await ctx.rabbitmqConsumer.consumeMessages(targetQueue, {
      expectedCount: MATCHING_COUNT,
      timeoutMs: CONSUME_TIMEOUT_MS,
    });

    // Assert kết quả
    expect(messages).toHaveLength(MATCHING_COUNT);
  });

  it("<mô tả assertion 2>", async () => {
    // ... thêm assertion khác
  });
});
```

### 5.3 Các loại test data có sẵn

| Helper Function | Mô tả | Import từ |
|----------------|-------|-----------|
| `buildMatchingDocs(count, runId, opts)` | Tạo identity docs **thỏa điều kiện** Loader | `src/infra/solrSeeder.ts` |
| `buildNonMatchingDocs(count, runId, opts)` | Tạo docs **KHÔNG thỏa** (future_time, excluded_status, wrong_platform...) | `src/infra/solrSeeder.ts` |
| `buildDocsForWrongCollection(count, runId, platformId)` | Tạo docs cho collection sai | `src/infra/solrSeeder.ts` |

### 5.4 Các service có sẵn trong TestContext

```typescript
const ctx = await createTestContext(ACTIVE_PLATFORM_KEY, testRunId);

ctx.flow              // PlatformFlowConfig — thông tin platform đang test
ctx.fixtureProfile    // PlatformFixtureProfile — fixture builders
ctx.messageSchema     // JSON Schema — dùng validate message
ctx.loaderRunner      // LoaderRunner — start/stop Loader trên K8s
ctx.solrSeeder        // SolrSeeder — seed/cleanup/query Solr
ctx.rabbitmqConsumer  // RabbitmqConsumer — purge/consume RabbitMQ
ctx.redisVerifier     // RedisVerifier — findKeys/cleanup Redis
ctx.mysqlVerifier     // MysqlVerifier — MySQL verify (placeholder)
ctx.testLock          // TestLock — Redis distributed lock
ctx.redis             // ioredis instance — thao tác Redis trực tiếp
ctx.cleanup(runId)    // Dọn dẹp toàn bộ (Solr, Redis, Queue, connections)
ctx.teardown()        // Đóng tất cả connections
```

### 5.5 Thêm platform mới

Khi cần test platform mới (ví dụ: LinkedIn), thêm 3 thứ:

1. **Entry trong `platform-registry.ts`**:

```typescript
"linkedin-post": {
  platform: "linkedin",
  type: "post",
  platformId: PlatformId.LINKEDIN,
  podPattern: /^ynm-cl-li-crawling-loader-service-testing-/,
  namespace: "crawler-testing",
  envPrefix: "LINKEDIN_POST_CRAWLING_LOADER",
  loaderClassName: "LinkedinPostCrawlingLoader",
  loaderClassPath: "/app/dist/linkedin-loader/core/loaders/post/post.crawling-loader",
  schemaPath: "./schemas/linkedin-post.loaderMessage.schema.json",
  fixtureKey: "linkedin-post",
  testingScript: "testing",
  queueName: ".cl.li.posts_crawling_sources",
  solrCollection: "identity",
  solrServiceName: "ynm-cl-source-updater-solr-service-testing",
  mysqlDatabase: "ynm_crawling_loaders",
  redisSetKey: "LinkedinPostCrawlingLoader",
},
```

2. **JSON Schema**: Tạo file `src/infra/schemas/linkedin-post.loaderMessage.schema.json`

3. **Fixture profile**: Thêm entry trong `src/infra/fixtures/platformFixtures.ts`

---

## 6. ✅ Cách viết Assert

### 6.1 Assert cơ bản (Vitest built-in)

```typescript
// Kiểm tra giá trị bằng
expect(messages.length).toBe(5);

// Kiểm tra mảng có độ dài
expect(messages).toHaveLength(5);

// Kiểm tra chứa phần tử
expect(publishedIds).toContain("expected-id");

// Kiểm tra mảng bằng nhau (bất kể thứ tự)
expect([...publishedIds].sort()).toEqual([...expectedIds].sort());

// Kiểm tra object có property
expect(message).toHaveProperty("id");
expect(message).toHaveProperty("platform");

// Kiểm tra type
expect(typeof message.id).toBe("string");
expect(typeof message.platform).toBe("number");
expect(Number.isInteger(message.platform)).toBe(true);
expect(Array.isArray(message.delay_time_rules)).toBe(true);

// Kiểm tra pattern (regex)
expect(message.from_date).toMatch(/^[0-9]+$/);

// Kiểm tra boolean
expect(message.is_kol).toBe(true);
// hoặc
expect(typeof message.is_kol).toBe("boolean");

// Kiểm tra so sánh
expect(Number(message.to_date)).toBeGreaterThanOrEqual(Number(message.from_date));
expect(retries).toBeGreaterThanOrEqual(0);

// Kiểm tra mảng rỗng
expect(extraMessages).toEqual([]);
```

### 6.2 Assert với thông báo lỗi rõ ràng (KHUYẾN KHÍCH)

> [!TIP]
> Luôn thêm message mô tả khi assert — giúp debug nhanh khi test fail.

```typescript
// ✅ TỐT — có message rõ ràng
expect(
  messages.length,
  `Mong đợi ${MATCHING_COUNT} messages nhưng nhận được ${messages.length}. ` +
    `Kiểm tra: Loader có pick up đúng docs thỏa điều kiện không? ` +
    `Queue name "${targetQueue}" có đúng không?`
).toBe(MATCHING_COUNT);

// ❌ KHÔNG TỐT — không có message
expect(messages.length).toBe(MATCHING_COUNT);
```

### 6.3 Assert Schema validation (JSON Schema + Ajv)

```typescript
import Ajv from "ajv";
import { loadPlatformMessageSchema } from "../../src/infra/schemaLoader.js";

// Cách 1: Dùng helper có sẵn
import { isValidLoaderMessage, getValidationErrors } from "../../src/infra/rabbitmqConsumer.js";

expect(
  isValidLoaderMessage(msg, ctx.messageSchema),
  `Message không đúng schema:\n${JSON.stringify(msg, null, 2)}\nErrors: ${getValidationErrors()}`
).toBe(true);

// Cách 2: Dùng Ajv trực tiếp (chi tiết hơn)
const ajv = new Ajv({ allErrors: true });
const schema = loadPlatformMessageSchema(ctx.flow);
const validate = ajv.compile(schema);
const valid = validate(message);
if (!valid) {
  const errorDetail = validate.errors
    ?.map(e => `  - ${e.instancePath || "/"}: ${e.message}`)
    .join("\n");
  expect.fail(
    `Message không đúng schema.\nErrors:\n${errorDetail}\n` +
    `Message thực tế:\n${JSON.stringify(message, null, 2)}`
  );
}
```

### 6.4 Assert Redis (dedup, lock)

```typescript
// Kiểm tra Redis Set có đúng số phần tử
await expect.poll(
  () => ctx.redis.scard(ctx.flow.redisSetKey),
  { timeout: 5_000 }
).toBe(docs.length);

// Kiểm tra type của key
expect(await ctx.redis.type(ctx.flow.redisSetKey)).toBe("set");

// Kiểm tra members trong Set
expect(
  (await ctx.redis.smembers(ctx.flow.redisSetKey)).sort()
).toEqual(docs.map(doc => doc.id).sort());

// Kiểm tra key tồn tại
const exists = await ctx.redisVerifier.keyExists("automation:lock:*");
expect(exists).toBe(true);
```

### 6.5 Assert field mapping (so sánh fixture vs message)

```typescript
// Field copy trực tiếp
expect(message.id).toBe(
  ctx.fixtureProfile.messageIdFromIdentityId?.(fixture.id) ?? fixture.id
);
expect(message.id_social).toBe(fixture.id_social);
expect(message.platform).toBe(fixture.platform);
expect(message.priority).toBe(fixture.priority);

// Field tùy chọn (có thể không có tùy platform)
if ("country_code" in message) {
  expect(message.country_code).toBe(fixture.country_code);
}

// Cấu trúc phức tạp
for (const rule of message.delay_time_rules as Array<Record<string, unknown>>) {
  expect(rule).toHaveProperty("lte");
  expect(rule).toHaveProperty("delay");
  expect(typeof rule.lte).toBe("number");
  expect(typeof rule.delay).toBe("number");
}
```

---

## 7. 📊 Cách xuất Report

### 7.1 Markdown Report (có sẵn)

#### Loader Test Report

```bash
npm run test:loader
# Output: loader_test_report.md (root folder)
```

Report bao gồm:
- Summary: Tổng test / Passed / Failed / Skipped / Thời gian chạy
- Chi tiết từng group test case (table với status và error message)

#### Smoke Test Report

```bash
npm run test:smoke:report
# Output: smoke_report.md (root folder)
```

### 7.2 Allure Report

```bash
# Bước 1: Chạy test (kết quả lưu vào allure-results/)
npm run test:loader

# Bước 2: Generate Allure report
npx allure generate allure-results -o allure-report --clean

# Bước 3: Mở report trong browser
npx allure open allure-report
```

### 7.3 Vitest Default Reporter (console)

```bash
# Mặc định vitest đã output kết quả ra console
npx vitest run tests/loader
```

### 7.4 Artifacts (Logs & Messages)

Sau mỗi lần chạy, test tự lưu:

| File | Đường dẫn | Nội dung |
|------|-----------|----------|
| Loader log | `artifacts/loader/{testRunId}.log` | Log từ Loader process trên pod |
| Messages JSON | `artifacts/loader/{testRunId}.messages.json` | Toàn bộ message đã consume |

---

## 8. 📝 Checklist cho QC trước khi viết test mới

- [ ] Đã đọc hiểu mục **5. Cách QC input test case mới**
- [ ] Đã xác định test thuộc category nào (count, schema, field mapping, dedup...)
- [ ] Đặt tên file đúng convention: `tc-loader-{NNN}-{desc}.test.ts`
- [ ] Dùng `createTestContext()` + `generateTestRunId()` ở `beforeAll`
- [ ] Dùng `testLock.acquire()` trước khi seed data
- [ ] Dùng `purgeQueue()` trước khi chạy Loader
- [ ] Dùng `ctx.cleanup(testRunId)` ở `afterAll`
- [ ] Mọi `expect()` đều có message mô tả lỗi rõ ràng
- [ ] Đã chạy test thành công ít nhất 1 lần local trước khi commit
- [ ] Không hardcode credentials (dùng `.env`)

---

## 9. 🔍 Danh sách test case hiện có (tham khảo)

| ID | File | Mô tả |
|----|------|-------|
| TC_LOADER_001 | `tc-loader-001-count.test.ts` | Loader load đúng số lượng identity thỏa điều kiện |
| TC_LOADER_002 | `tc-loader-002-collection.test.ts` | Loader chỉ load từ đúng Solr collection |
| TC_LOADER_003 | `tc-loader-003-queue.test.ts` | Loader publish message vào đúng queue |
| TC_LOADER_004 | `tc-loader-004-schema.test.ts` | Message đúng schema (đủ field, đúng kiểu) |
| TC_LOADER_005 | `tc-loader-005-field-mapping.test.ts` | Giá trị field message khớp dữ liệu gốc đã seed |
| TC_LOADER_006 | `tc-loader-006-redis-lock.test.ts` | Loader ghi Redis Set và chống publish trùng |
| TC_LOADER_007 | `tc-loader-007-skip-locked.test.ts` | Loader bỏ qua identity đã có trong Redis Set |

---

## 10. ❓ FAQ — Câu hỏi thường gặp

### Q: Test fail với "Lock đang bị chiếm" là sao?
**A**: Có test khác đang chạy trên cùng platform. Chờ test kia kết thúc hoặc xóa Redis lock key thủ công:
```bash
redis-cli -h <host> -p 6379 -a <password> DEL "automation:lock:threads-source-post-no-cookie"
```

### Q: Test timeout sau 5 phút?
**A**: Loader có thể chưa start hoặc pod bị lỗi. Kiểm tra:
```bash
npm run loader:logs
kubectl get pods -n crawler-testing | grep loader
```

### Q: Làm sao test platform khác (không phải Threads)?
**A**: Đổi `ACTIVE_PLATFORM_KEY` trong `platform-registry.ts` sang key mong muốn (ví dụ `"tiktok-post"`). Đảm bảo platform đó đã được đăng ký đầy đủ trong registry.

### Q: Test data có ảnh hưởng production không?
**A**: Không. Mọi data seed đều gắn `testRunId` unique và được cleanup ở `afterAll`. Queue cũng dùng suffix `.automation.{runId}` để isolate.
