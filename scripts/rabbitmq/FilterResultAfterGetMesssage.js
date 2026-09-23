import { promises as fs } from 'fs';

/**
 * Filters JSON records from a file based on provided conditions
 * @param {string} filePath - Path to the JSON file
 * @param {Object|Function} filterConditions - Filter conditions or custom filter function
 * @param {Object} options - Additional options
 * @returns {Array} Filtered records
 */
async function filterJSONRecords(filePath, filterConditions = {}, options = {}) {
  try {
    // Read and parse JSON file
    const fileContent = await fs.readFile(filePath, 'utf8');
    let data = JSON.parse(fileContent);
    
    // Ensure data is an array
    if (!Array.isArray(data)) {
      throw new Error('File content must be an array of records');
    }
    
    console.log(`Loaded ${data.length} records from ${filePath}`);
    
    let filteredData = data;
    
    // Apply filters
    if (typeof filterConditions === 'function') {
      // Custom filter function
      filteredData = data.filter(filterConditions);
    } else if (typeof filterConditions === 'object' && Object.keys(filterConditions).length > 0) {
      // Object-based filter conditions
      filteredData = data.filter(record => {
        return Object.entries(filterConditions).every(([key, condition]) => {
          return applyCondition(record, key, condition);
        });
      });
    }
    
    // Apply additional options
    if (options.limit) {
      filteredData = filteredData.slice(0, options.limit);
    }
    
    if (options.sortBy) {
      filteredData = sortRecords(filteredData, options.sortBy, options.sortOrder || 'asc');
    }
    
    console.log(`Found ${filteredData.length} matching records`);
    
    // Always save to output file
    const outputFile = options.outputFile || generateOutputFileName(filePath, filterConditions);
    await saveFilteredResults(filteredData, outputFile);
    
    return filteredData;
    
  } catch (error) {
    console.error('Error filtering JSON records:', error.message);
    throw error;
  }
}

/**
 * Apply a single condition to a record
 * @param {Object} record - The record to check
 * @param {string} key - The field key (supports nested paths like 'user.name')
 * @param {*} condition - The condition to apply
 * @returns {boolean} Whether the condition matches
 */
function applyCondition(record, key, condition) {
  const value = getNestedValue(record, key);
  
  if (typeof condition === 'object' && condition !== null && !Array.isArray(condition)) {
    // Advanced condition object
    const { operator, value: conditionValue, caseSensitive = true } = condition;
    
    switch (operator) {
      case 'equals':
      case '==':
        return caseSensitive ? value === conditionValue : 
               String(value).toLowerCase() === String(conditionValue).toLowerCase();
      
      case 'not_equals':
      case '!=':
        return caseSensitive ? value !== conditionValue :
               String(value).toLowerCase() !== String(conditionValue).toLowerCase();
      
      case 'contains':
        return caseSensitive ? String(value).includes(conditionValue) :
               String(value).toLowerCase().includes(String(conditionValue).toLowerCase());
      
      case 'not_contains':
        return caseSensitive ? !String(value).includes(conditionValue) :
               !String(value).toLowerCase().includes(String(conditionValue).toLowerCase());
      
      case 'starts_with':
        return caseSensitive ? String(value).startsWith(conditionValue) :
               String(value).toLowerCase().startsWith(String(conditionValue).toLowerCase());
      
      case 'ends_with':
        return caseSensitive ? String(value).endsWith(conditionValue) :
               String(value).toLowerCase().endsWith(String(conditionValue).toLowerCase());
      
      case 'greater_than':
      case '>':
        return Number(value) > Number(conditionValue);
      
      case 'greater_equal':
      case '>=':
        return Number(value) >= Number(conditionValue);
      
      case 'less_than':
      case '<':
        return Number(value) < Number(conditionValue);
      
      case 'less_equal':
      case '<=':
        return Number(value) <= Number(conditionValue);
      
      case 'in':
        return Array.isArray(conditionValue) && conditionValue.includes(value);
      
      case 'not_in':
        return Array.isArray(conditionValue) && !conditionValue.includes(value);
      
      case 'regex':
        const regex = new RegExp(conditionValue, caseSensitive ? 'g' : 'gi');
        return regex.test(String(value));
      
      case 'exists':
        return conditionValue ? value !== undefined : value === undefined;
      
      default:
        return value === condition;
    }
  } else {
    // Simple equality check
    return value === condition;
  }
}

/**
 * Get nested value from object using dot notation
 * @param {Object} obj - The object to search in
 * @param {string} path - The path (e.g., 'user.profile.name')
 * @returns {*} The nested value or undefined
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

/**
 * Sort records by a field
 * @param {Array} records - Records to sort
 * @param {string} sortBy - Field to sort by
 * @param {string} order - 'asc' or 'desc'
 * @returns {Array} Sorted records
 */
function sortRecords(records, sortBy, order = 'asc') {
  return records.sort((a, b) => {
    const valueA = getNestedValue(a, sortBy);
    const valueB = getNestedValue(b, sortBy);
    
    if (valueA < valueB) return order === 'asc' ? -1 : 1;
    if (valueA > valueB) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

// Example usage:

// Simple equality filter
/*
const results1 = await filterJSONRecords('messages.json', {
  status: 'active',
  type: 'user'
});
*/

// Advanced filter with operators
/*
const results2 = await filterJSONRecords('messages.json', {
  'user.age': { operator: '>=', value: 18 },
  'user.name': { operator: 'contains', value: 'john', caseSensitive: false },
  status: { operator: 'in', value: ['active', 'pending'] }
});
*/

// Custom filter function
/*
const results3 = await filterJSONRecords('messages.json', (record) => {
  return record.created_at > '2024-01-01' && record.score > 100;
});
*/

// With options
/*
const results4 = await filterJSONRecords('messages.json', 
  { status: 'active' },
  { 
    limit: 50,
    sortBy: 'created_at',
    sortOrder: 'desc',
    outputFile: 'filtered_results.json'
  }
);
*/

/**
 * Generate output file name based on input file and filter conditions
 * @param {string} filePath - Original file path
 * @param {*} filterConditions - Filter conditions used
 * @returns {string} Generated output file name
 */
function generateOutputFileName(filePath, filterConditions) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const baseName = filePath.replace(/\.[^/.]+$/, ""); // Remove extension
  return `${baseName}_filtered_${timestamp}.json`;
}

/**
 * Save filtered results to file
 * @param {Array} data - Filtered data to save
 * @param {string} outputFile - Output file path
 */
async function saveFilteredResults(data, outputFile) {
  try {
    // Create directory if it doesn't exist
    const outputDir = outputFile.substring(0, outputFile.lastIndexOf('/'));
    if (outputDir && outputDir !== outputFile) {
      await fs.mkdir(outputDir, { recursive: true });
    }
    
    // Save the filtered data
    await fs.writeFile(outputFile, JSON.stringify(data, null, 2));
    console.log(`✅ Filtered results saved to: ${outputFile}`);
    console.log(`📊 Total records saved: ${data.length}`);
    
    // Show file size
    const stats = await fs.stat(outputFile);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`📁 File size: ${fileSizeMB} MB`);
    
  } catch (error) {
    console.error('❌ Error saving filtered results:', error.message);
    throw error;
  }
}

// Example usage and test cases:



async function runExamples(pathFile) {
  try {
    console.log('=== JSON Filter Examples ===\n');

    // Example 1: Simple equality filter
    console.log('1. Simple equality filter:');
    const results1 = await filterJSONRecords(pathFile, {
      mapping_id: null
    });
    console.log(`Found ${results1.length} published articles\n`);

//     // Example 2: Advanced filter with operators
//     console.log('2. Advanced filter with operators:');
//     const results2 = await filterJSONRecords('Data_get_from_rabbitMQ_by_scripts/messages_staging_cl_news_article_urls_2025-01-20T10-30-00-000Z.json', {
//       'author.age': { operator: '>=', value: 25 },
//       'title': { operator: 'contains', value: 'news', caseSensitive: false },
//       'tags': { operator: 'in', value: ['breaking', 'urgent', 'top'] }
//     });
//     console.log(`Found ${results2.length} articles matching advanced criteria\n`);

//     // Example 3: Date range filter
//     console.log('3. Date range filter:');
//     const results3 = await filterJSONRecords('Data_get_from_rabbitMQ_by_scripts/messages_staging_cl_news_article_urls_2025-01-20T10-30-00-000Z.json', {
//       'created_at': { operator: '>=', value: '2024-01-01' },
//       'published_at': { operator: '<', value: '2025-01-01' }
//     });
//     console.log(`Found ${results3.length} articles from 2024\n`);

//     // Example 4: Text search with regex
//     console.log('4. Regex pattern matching:');
//     const results4 = await filterJSONRecords('Data_get_from_rabbitMQ_by_scripts/messages_staging_cl_news_article_urls_2025-01-20T10-30-00-000Z.json', {
//       'url': { operator: 'regex', value: '^https://.*\\.com.*' },
//       'content': { operator: 'regex', value: '\\b(breaking|urgent)\\b', caseSensitive: false }
//     });
//     console.log(`Found ${results4.length} articles with .com URLs and urgent content\n`);

//     // Example 5: Custom filter function
//     console.log('5. Custom filter function:');
//     const results5 = await filterJSONRecords('Data_get_from_rabbitMQ_by_scripts/messages_staging_cl_news_article_urls_2025-01-20T10-30-00-000Z.json', 
//       (record) => {
//         // Custom logic: articles with high engagement
//         const views = record.views || 0;
//         const likes = record.likes || 0;
//         const comments = record.comments || 0;
//         const totalEngagement = views + likes * 2 + comments * 3;
        
//         return totalEngagement > 1000 && record.status === 'published';
//       }
//     );
//     console.log(`Found ${results5.length} high-engagement published articles\n`);

//     // Example 6: With sorting and limiting
//     console.log('6. Filtered with sorting and limit:');
//     const results6 = await filterJSONRecords('Data_get_from_rabbitMQ_by_scripts/messages_staging_cl_news_article_urls_2025-01-20T10-30-00-000Z.json', 
//       { status: 'published' },
//       {
//         sortBy: 'created_at',
//         sortOrder: 'desc',
//         limit: 10,
//         outputFile: 'Data_get_from_rabbitMQ_by_scripts/top_10_latest_articles.json'
//       }
//     );
//     console.log(`Found and saved top 10 latest published articles\n`);

//     // Example 7: Filter by nested object properties
//     console.log('7. Nested object filtering:');
//     const results7 = await filterJSONRecords('Data_get_from_rabbitMQ_by_scripts/messages_staging_cl_news_article_urls_2025-01-20T10-30-00-000Z.json', {
//       'author.name': { operator: 'starts_with', value: 'John' },
//       'metadata.category': { operator: 'in', value: ['tech', 'science', 'health'] },
//       'source.domain': { operator: 'contains', value: 'news' }
//     });
//     console.log(`Found ${results7.length} articles by Johns in tech/science/health categories\n`);

//     // Example 8: Check field existence
//     console.log('8. Field existence check:');
//     const results8 = await filterJSONRecords('Data_get_from_rabbitMQ_by_scripts/messages_staging_cl_news_article_urls_2025-01-20T10-30-00-000Z.json', {
//       'thumbnail': { operator: 'exists', value: true },
//       'video_url': { operator: 'exists', value: false }
//     });
//     console.log(`Found ${results8.length} articles with thumbnails but no videos\n`);

//     console.log('=== All Examples Completed ===');
    
  } catch (error) {
    console.error('Error running examples:', error.message);
  }
}
// Uncomment to run examples:


const pathFile = "Data_get_from_rabbitMQ_by_scripts/messages_staging_cl_tr_reposts_no_cookie_crawled_sources_2025-09-18T09-07-10-795Z/batch_005.json"
runExamples(pathFile);

export { filterJSONRecords, runExamples };