import axios from 'axios';
import { writeFileSync } from 'fs';

async function getSolrIds(solrUrl, core, username, password, query = '*:*', rows = 10, filters = [], sort = '', fields = ['id']) {
  const solrQueryUrl = `${solrUrl}/${core}/select`;
  const params = {
    q: query,
    rows: rows,
    fl: fields.join(','),
    wt: 'json'
  };
  
  // Xử lý filters đúng cách
  if (filters.length > 0) {
    // Truyền filters dưới dạng mảng để axios xử lý đúng
    params.fq = filters;
  }
  
  if (sort) {
    params.sort = sort;
  }
  
  try {
    console.log("Đang gửi request với params:", params);
    
    const response = await axios.get(solrQueryUrl, {
      params,
      auth: { username, password },
      // Thêm cấu hình để hiển thị URL thực tế được gửi đi
      paramsSerializer: params => {
        let result = [];
        for (let key in params) {
          if (Array.isArray(params[key])) {
            // Xử lý đúng cho mảng params
            params[key].forEach(val => {
              result.push(`${key}=${encodeURIComponent(val)}`);
            });
          } else {
            result.push(`${key}=${encodeURIComponent(params[key])}`);
          }
        }
        return result.join('&');
      }
    });
    
    const documents = response.data.response.docs;
    writeFileSync('solr_data.json', JSON.stringify(documents, null, 2));
    console.log(`Đã lưu ${documents.length} documents vào solr_data.json`);
  } catch (error) {
    console.error("Lỗi khi truy vấn Solr:", error);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error message:", error.message);
    }
    console.error("Request URL:", error.config?.url);
    console.error("Request params:", error.config?.params);
  }
}

// Ví dụ sử dụng với Basic Auth
const solrUrl = "https://solr-staging.younetmedia.com/solr";
const core = "identity";
const username = "app";
const password = "iamapp";
const filters = ["platform:10", "-last_status:4", "info_updated_at:[* TO *]"];
const sort = "info_updated_at asc";
const fields = ["id", "info_updated_at"];

getSolrIds(solrUrl, core, username, password, '*:*', 5000, filters, sort, fields);