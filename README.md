# YNM Testing Workspace

Workspace này tập hợp script hỗ trợ QA, tài liệu nghiệp vụ, test artifact và các tool dùng trong quy trình kiểm thử.

## Cấu trúc

| Thư mục | Nội dung |
| --- | --- |
| `scripts/` | Script vận hành theo nhóm RabbitMQ, verification, helper, utility và Solr |
| `tests/` | Test tự động có thể chạy độc lập |
| `fixtures/` | Dữ liệu mẫu nhỏ được quản lý bằng Git |
| `qa/` | Test plan, test case, analysis, template và skill phục vụ QA |
| `docs/` | Tài liệu tham khảo theo platform và hướng dẫn dùng chung |
| `tools/` | Tool/skill độc lập có source code và test riêng |
| `config/` | Cấu hình mẫu đã được loại bỏ thông tin nhạy cảm |
| `playground/` | Code học tập hoặc thử nghiệm, không thuộc luồng vận hành |

Hai thư mục `TestData/` và `Data_get_from_rabbitMQ_by_scripts/` chứa dữ liệu cục bộ hoặc output dung lượng lớn nên không được đưa vào Git.

## Bắt đầu nhanh

```bash
npm install
npm test
npm run typecheck
```

Các script vận hành thường chứa tham số môi trường hoặc đường dẫn input ngay trong file. Hãy kiểm tra cấu hình ở đầu script trước khi chạy, đặc biệt với các thao tác RabbitMQ có thể push hoặc purge message.

## Quy ước thêm nội dung

- Script mới được đặt theo hệ thống mà nó thao tác, không đặt trực tiếp ở root.
- Dữ liệu mẫu ổn định và nhỏ đặt trong `fixtures/`; dữ liệu chạy thực tế đặt trong thư mục đã được ignore.
- Test plan/test case mới đặt dưới `qa/` theo feature hoặc ticket.
- Tài liệu nghiệp vụ đặt dưới `docs/reference/<platform>/`.
- Không commit credential, service account, log, cache hay output sinh ra khi chạy script.
