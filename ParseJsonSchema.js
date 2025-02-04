function generateJsonSchema(json) {
    // Helper function to detect type
    const getType = (value) => {
      if (Array.isArray(value)) return 'array';
      if (value === null) return 'null';
      return typeof value;
    };
  
    // Helper function to process array items
    const processArray = (arr) => {
      if (arr.length === 0) {
        return {
          type: 'array',
          items: {}
        };
      }
  
      // Get schema for first item as sample
      const itemSchema = generateSchemaForValue(arr[0]);
      
      // Check if all items have same type
      const allSameType = arr.every(item => getType(item) === getType(arr[0]));
      
      return {
        type: 'array',
        items: allSameType ? itemSchema : {},
        minItems: 0
      };
    };
  
    // Helper function to process object properties
    const processObject = (obj) => {
      const properties = {};
      const required = [];
  
      Object.keys(obj).forEach(key => {
        properties[key] = generateSchemaForValue(obj[key]);
        if (obj[key] !== undefined && obj[key] !== null) {
          required.push(key);
        }
      });
  
      return {
        type: 'object',
        properties,
        required,
        additionalProperties: false
      };
    };
  
    // Main function to generate schema for a value
    const generateSchemaForValue = (value) => {
      const valueType = getType(value);
      
      switch (valueType) {
        case 'string':
          return {
            type: 'string'
          };
        case 'number':
          return {
            type: 'number'
          };
        case 'boolean':
          return {
            type: 'boolean'
          };
        case 'array':
          return processArray(value);
        case 'object':
          return processObject(value);
        case 'null':
          return {
            type: 'null'
          };
        default:
          return {};
      }
    };
  
    // Generate the complete schema
    const schema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      ...generateSchemaForValue(json)
    };
  
    return schema;
  }
  
  // Example usage:
  const sampleJson = [
    {
        "id": 432,
        "name": "Nokia C30",
        "val": 432,
        "total_sold": 15,
        "total_gmv": 22840000,
        "avg_discount": 15.6425,
        "prev_total_gmv": 0,
        "total_gmv_growth": null,
        "avg_sell_price": 1522666.6667,
        "selling_price_change": null,
        "platform": [
            "tiki.vn"
        ],
        "rank_change": "new"
    },
    {
        "id": 1,
        "name": "Galaxy S21",
        "val": 1,
        "total_sold": 1,
        "total_gmv": 245000,
        "avg_discount": 2,
        "prev_total_gmv": 0,
        "total_gmv_growth": null,
        "avg_sell_price": 245000,
        "selling_price_change": null,
        "platform": [
            "shopee.vn"
        ],
        "rank_change": "new"
    },
    {
        "id": 47755,
        "name": "[B] amity",
        "val": 47755,
        "total_sold": 1,
        "total_gmv": 98000,
        "avg_discount": 0,
        "prev_total_gmv": 0,
        "total_gmv_growth": null,
        "avg_sell_price": 98000,
        "selling_price_change": null,
        "platform": [
            "lazada.vn"
        ],
        "rank_change": "new"
    }
]
  
  const schema = generateJsonSchema(sampleJson);
  console.log(JSON.stringify(schema, null, 2));