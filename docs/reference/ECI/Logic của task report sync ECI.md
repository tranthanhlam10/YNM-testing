# Logic của task sync

## Những deployment liên qua cần phải check


Loader lên:


cronjob-eca-loader-job-testing


Tính toán:

eca-load-data-by


lazada_1181200858

lazada_382066653


app.eci.trigger.report_synchronization|cl.eca.loader_industry_1|cl.eca.product_item_weekly|cl.eca.loader_industry|cl.eca.load_data_message_queue_industry|cl.eca.product_item_monthly


# Luồng sync chiều ngược lại


module.exports = {
  //only change config here
  collection: 'product_item_monthly',    
  fields: ['id','product_item_id','industry_id','standard_category_id','brand_id','shard'],   
  filters: 'industry_id: (1 2)',    
  outputQueue: [{              
    name: 'cl.eca.loader_industry_1',
    queueType: 'quorum',
    deadLetterExchange: 'cl.eca.product_items',
    deadLetterRoutingKey: 'cl.eca.product_item_weekly.errors'  }],
  exchange:'cl.eca.loader',
  outputFormat: {      
    id: 'id',
product_item_id:'product_item_id',
industry_id:'industry_id',
standard_category_id:'standard_category_id',
brand_id:(item) => item.brand_id|| null, 
shard:'shard'
  },
  resultOptions: {      
    data: true,
filters:  (docs) => "id: ( " + docs.map(doc => doc.product_item_id).join(" ") + " )"  
  },
  useRedis: true,
  options: {
    limit: 1000,    
    shards: 202509  
  },
}




------------------







app.eci.trigger.report_synchronization|cl.eca.loader_industry_1|cl.eca.product_item_weekly|cl.eca.loader_industry

isLockIndustries: true,



Những pi cần chạy:

M012024_lazada_2068501631
M012024_lazada_2070132747
M012024_shopee_22547682595
M012024_shopee_845736771




{
  "lookupFilters": [
    "-industry_id: (1 2 15 16 19)"
  ],
  "filters": "id:( M012024_lazada_2068501631 M012024_lazada_2070132747 M012024_shopee_22547682595 M012024_shopee_845736771 )",
  "data": [
    {
      "id": "shopee_22547682595",
      "industry_id": 3
    },
    {
      "id": "shopee_845736771",
      "industry_id": 3
    },
    {
      "id": "lazada_2068501631",
      "industry_id": 1
    },
    {
      "id": "lazada_2070132747",
      "industry_id": 1
    }
  ]
}


File config trong job

{
	"MAPPER_PATH": "/config/default.config.js",
	"default.config.js": "module.exports = {
		  //only change config here
		  collection: 'product_item_monthly',
		  fields: ['id', 'avg_price', 'avg_sell_price', 'sell_price', 'avg_discount', 'sold', 'gmv', 'product_item_id', 'shard'],
		  filters: '-title: [* TO *]',
		  outputQueue: [{
		      name: 'cl.eca.loader_industry',
		      queueType: 'quorum',
		      deadLetterExchange: 'cl.eca.product_items',
		      deadLetterRoutingKey: 'cl.eca.product_item_weekly.errors'
		  }],
		  reload:true,
		  exchange:'cl.eca.loader_industry',
		  outputFormat: {
		      id: 'id',
		      avg_price: 'avg_price',
		      avg_sell_price: 'avg_sell_price',
		      sell_price: 'sell_price',
		      avg_discount: 'avg_discount',
		      sold: 'sold',
		      gmv: 'gmv',
		      product_item_id: 'product_item_id',
		      shard: 'shard'
		  },
		  resultOptions: {
		      data: true,
		      filters: (docs) => \"id: ( \" + docs.map(doc => doc.product_item_id).join(\" \") + \" )\"
		  },
		  options: {
		      limit: 1000,
		      shards: ['202509']
		  },
		}
		"
}

kind: ConfigMap
apiVersion: v1
metadata:
name: cronjob-eca-loader-job
namespace: crawler-production
uid: 050526fa-b7ce-4238-8941-53cdc735a691
resourceVersion: '885042892'
creationTimestamp: '2024-11-25T11:05:40Z'
managedFields:
    - manager: Go-http-client
     operation: Update
     apiVersion: v1
     time: '2025-10-17T09:15:33Z'
     fieldsType: FieldsV1
     fieldsV1:
        f:data:
         .: {}
         f:MAPPER_PATH: {}
         f:default.config.js: {}
data:
MAPPER_PATH: /config/default.config.js
default.config.js: |
    module.exports = {
     //only change config here
     collection: 'product_item_monthly',
     fields: ['id', 'avg_price', 'avg_sell_price', 'sell_price', 'avg_discount', 'sold', 'gmv', 'product_item_id', 'shard'],
     filters: '-title: [* TO *]',
     isLockIndustries: true,
     outputQueue: [{
         name: 'cl.eca.loader_industry',
         queueType: 'quorum',
         deadLetterExchange: 'cl.eca.product_items',
         deadLetterRoutingKey: 'cl.eca.product_item_weekly.errors'
     }],
     reload:true,
     exchange:'cl.eca.loader_industry',
     outputFormat: {
         id: 'id',
         avg_price: 'avg_price',
         avg_sell_price: 'avg_sell_price',
         sell_price: 'sell_price',
         avg_discount: 'avg_discount',
         sold: 'sold',
         gmv: 'gmv',
         product_item_id: 'product_item_id',
         shard: 'shard'
     },
     resultOptions: {
         data: true,
         filters: (docs) => "id: ( " + docs.map(doc => doc.product_item_id).join(" ") + " )"
     },
     options: {
         limit: 1000,
         shards: ['202509']
     },
    }





 module.exports = {
      //only change config here
      collection: 'product_item_monthly',
      fields: ['id', 'avg_price', 'avg_sell_price', 'sell_price', 'avg_discount', 'sold', 'gmv', 'product_item_id', 'shard'],
      filters: '-title: [* TO *]',
      outputQueue: [{
          name: 'cl.eca.loader_industry',
          queueType: 'quorum',
          deadLetterExchange: 'cl.eca.product_items',
          deadLetterRoutingKey: 'cl.eca.product_item_weekly.errors'
      }],
      reload:true,
      exchange:'cl.eca.loader_industry',
      outputFormat: {
          id: 'id',
          avg_price: 'avg_price',
          avg_sell_price: 'avg_sell_price',
          sell_price: 'sell_price',
          avg_discount: 'avg_discount',
          sold: 'sold',
          gmv: 'gmv',
          product_item_id: 'product_item_id',
          shard: 'shard'
      },
      resultOptions: {
          data: true,
          filters: (docs) => "id: ( " + docs.map(doc => doc.product_item_id).join(" ") + " )"
      },
      options: {
          limit: 1000,
          shards: ['202509']
      },
    }


File config của chị Thư


{
    "MAPPER_PATH": "/config/default.config.js",
    "default.config.js": "module.exports = {
  collection: 'product_item_weekly',
  fields: ['id','product_item_id','industry_id','standard_category_id','brand_id','shard'],
  filters: 'industry_id:(1 OR 2)',
  outputQueue: [{  
    name: 'cl.eca.loader_industry_1',
    queueType: 'quorum',
    deadLetterExchange: 'cl.eca.product_items',
    deadLetterRoutingKey: 'cl.eca.product_item_weekly.errors'  }],
  exchange:'cl.eca.loader',
  outputFormat: {     
    id: 'id',
product_item_id:'product_item_id',
industry_id:'industry_id',
standard_category_id:'standard_category_id',
brand_id:(item) => item.brand_id|| null,
shard:'shard'
  },
  resultOptions: {     
    data: true,
filters:  (docs) => "id: ( " + docs.map(doc => doc.product_item_id).join(" ") + " )" 
  },
  useRedis: true,
  options: {
    limit: 1000,    
    shards: 202604
  },
        }
        "
} 

