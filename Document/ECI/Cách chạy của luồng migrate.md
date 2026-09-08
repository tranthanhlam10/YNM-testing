NODE_ENV=local_testing node scripts/solrmaster/migrate_ECA_PI_missing_dates_clickhouse.js \
--collection=product_items \
--filter='id:(shopee_26952042194 OR shopee_27451767455 OR shopee_29801091997 OR shopee_27801769915 OR shopee_25429221908 OR shopee_25129493636 OR shopee_24830284719 OR shopee_25863055292 OR shopee_23459346593 OR shopee_25378833951 OR shopee_25705672113 OR shopee_6382537091 OR shopee_27501283747 OR shopee_25825887492 OR shopee_24003945432 OR shopee_29000353085 OR shopee_29000811682 OR shopee_21487373172 OR shopee_28726417602 OR shopee_28408282291 OR shopee_26105984446 OR shopee_10288121996 OR shopee_25724548715)' \
--from_date=20241124 \
--to_date=20260728 \
--datasetId=eci_testing \
--tableId=product_item_histories_distributed \
--destination_source=product_item_histories_missing \
--configKey=clickhouse_eci \
--allow_write_source=1 \
--dry_run=1









NODE_ENV=local_testing node scripts/solrmaster/migrate_ECA_PI_missing_dates_clickhouse.js \
--collection=product_items \
--shard=shard1 \
--filter='source_id:shopee.vn AND crawled_date:[NOW-180DAYS TO NOW]' \
--from_date=20260701 \
--to_date=20260810 \
--datasetId=eci_testing \
--tableId=product_item_histories_distributed \
--destination_source=product_item_histories_missing \
--configKey=clickhouse_eci \
--allow_write_source=1 \
--dry_run=1



NODE_ENV=local_testing node scripts/solrmaster/migrate_ECA_PI_missing_dates_clickhouse.js \
--collection=product_items \
--shard=shard1 \
--filter='source_id: tiki.vn AND crawled_date:[NOW-60DAYS TO NOW] AND brand_id: [* TO *]' \
--from_date=20250101 \
--to_date=20260810 \
--datasetId=eci_testing \
--tableId=product_item_histories_distributed \
--destination_source=product_item_histories_missing \
--configKey=clickhouse_eci \
--allow_write_source=1 \
--dry_run=0




NODE_ENV=local_testing node scripts/solrmaster/migrate_ECA_PI_missing_dates_clickhouse.js \
--collection=product_items \
--shard=shard1 \
--filter='source_id: lazada.vn AND crawled_date:[NOW-60DAYS TO NOW] AND brand_id: [* TO *]' \
--from_date=20250101 \
--to_date=20260810 \
--datasetId=eci_testing \
--tableId=product_item_histories_distributed \
--destination_source=product_item_histories_distributed \
--configKey=clickhouse_eci \
--allow_write_source=1 \
--dry_run=0



NODE_ENV=local_testing node scripts/solrmaster/migrate_ECA_PI_missing_dates_clickhouse.js \
  --collection=product_items \
  --filter='source_id:tiki.vn AND crawled_date:[NOW-60DAYS TO NOW] AND brand_id:[* TO *]' \
  --from_date=20260620 \
  --to_date=20260819 \
  --databaseId=eci_testing \
  --tableId=product_item_histories_distributed \
  --destination_source=product_item_histories_distributed \
  --configKey=clickhouse_eci \
  --allow_write_source=1 \
  --dry_run=0



source_id: tiki.vn AND crawled_date:[NOW-60DAYS TO NOW] AND latest_sold: [1 TO *] AND brand_id: [* TO *]