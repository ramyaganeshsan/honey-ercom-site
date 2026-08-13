# MongoDB / Mongoose models

Generated from Sequelize models in `src/v1/models/`.

## Infrastructure

- `connection.js` — connects via `process.env.MONGODB_URI` or `mongodb://127.0.0.1:27017/${DATABASE_NAME||honey_ecommerce}`
- `counters.js` — `getNextSequence(name)` for numeric auto-increment PKs
- `models/` — one schema file per collection; `timestamps: false`

## Collections (73)

| Export name | Collection | Auto-inc PK | Fields |
|---|---|---|---|
| `ads_mgmt` | `ads_mgmt` | `ads_id` | 11 |
| `attribute` | `attribute` | `attribute_id` | 5 |
| `attribute_group` | `attribute_group` | `attribute_group_id` | 4 |
| `banner_image` | `banner_image` | `banner_id` | 10 |
| `billing_info` | `billing_info` | `id` | 14 |
| `billing_reg_info` | `billing_reg_info` | `id` | 15 |
| `blog` | `blog` | `blog_id` | 21 |
| `blog_comments` | `blog_comments` | `comments_id` | 10 |
| `blog_settings` | `blog_settings` | `blog_settings_id` | 4 |
| `brand` | `brand` | `brand_id` | 12 |
| `brand_module_settings` | `brand_module_settings` | — | 3 |
| `brand_product` | `brand_product` | — | 6 |
| `captcha_codes` | `captcha_codes` | — | 6 |
| `cart` | `cart` | `cart_id` | 44 |
| `cart_items` | `cart_items` | `item_id` | 37 |
| `category` | `category` | `category_id` | 28 |
| `category_attribute` | `category_attribute` | `id` | 4 |
| `category_attribute_group` | `category_attribute_group` | `id` | 4 |
| `category_attribute_values` | `category_attribute_values` | `id` | 4 |
| `category_products` | `category_products` | `id` | 3 |
| `city` | `city` | `city_id` | 11 |
| `cms` | `cms` | `cms_id` | 8 |
| `color_code` | `color_code` | `id` | 4 |
| `company_domain` | `company_domain` | `domain_id` | 34 |
| `company_sms_settings` | `company_sms_settings` | `id` | 7 |
| `contact` | `contact` | `contact_id` | 6 |
| `country` | `country` | `country_id` | 8 |
| `currency` | `currency` | — | 6 |
| `delivery_types` | `delivery_types` | `Did` | 6 |
| `dummy_transaction` | `dummy_transaction` | — | 5 |
| `email_settings` | `email_settings` | `settings_id` | 15 |
| `email_subscribe` | `email_subscribe` | `subscribe_id` | 10 |
| `event` | `event` | `event_id` | 5 |
| `facebook_shop` | `facebook_shop` | — | 7 |
| `hesabe_payment_log` | `hesabe_payment_log` | `id` | 13 |
| `image_resize` | `image_resize` | `id` | 8 |
| `module_settings` | `module_settings` | `module_id` | 19 |
| `module_settings_data` | `module_settings_data` | — | 11 |
| `notification_template` | `notification_template` | `id` | 8 |
| `order_cancel` | `order_cancel` | `order_cancel_id` | 16 |
| `package_account_transaction` | `package_account_transaction` | `id` | 27 |
| `package_info` | `package_info` | `id` | 24 |
| `payment_gateway` | `payment_gateway` | `payment_gateway_id` | 13 |
| `pos` | `pos` | `pos_id` | 13 |
| `product` | `product` | `deal_id` | 50 |
| `product_attribute` | `product_attribute` | `id` | 4 |
| `product_policy` | `product_policy` | `id` | 3 |
| `product_size` | `product_size` | `product_size_id` | 6 |
| `promocodes` | `promocodes` | `id` | 17 |
| `rate_review` | `rate_review` | `id` | 10 |
| `request_fund` | `request_fund` | `request_id` | 13 |
| `reviews` | `reviews` | — | 6 |
| `sessions` | `sessions` | — | 5 |
| `settings` | `settings` | `id` | 131 |
| `shipping_address` | `shipping_address` | `shipping_id` | 14 |
| `shipping_info` | `shipping_info` | `shipping_id` | 15 |
| `shipping_module_settings` | `shipping_module_settings` | `ship_module_id` | 7 |
| `shops` | `shops` | `id` | 6 |
| `size` | `size` | `size_id` | 6 |
| `sms_otp` | `sms_otp` | `otp_id` | 6 |
| `state` | `state` | `state_id` | 6 |
| `stores` | `stores` | `store_id` | 30 |
| `sub_products` | `sub_products` | `id` | 12 |
| `supplier` | `supplier` | `id` | 4 |
| `temp_transaction` | `temp_transaction` | `temp_id` | 5 |
| `transaction` | `transaction` | `id` | 81 |
| `transaction_mapping` | `transaction_mapping` | `id` | 17 |
| `users` | `users` | `user_id` | 62 |
| `users_access_token` | `users_access_token` | `id` | 7 |
| `users_products_notification` | `users_products_notification` | `users_products_notification_id` | 5 |
| `view_count_location` | `view_count_location` | `view_id` | 8 |
| `view_count_location_bkup` | `view_count_location_bkup` | — | 8 |
| `view_count_locationbkupdec10` | `view_count_locationbkupdec10` | `view_id` | 8 |

## Notes

- Numeric MySQL primary keys are stored as Number fields (not used as Mongo `_id`).
- On save, missing auto-increment PKs are assigned via `getNextSequence(collectionName)`.
- `sessions` has no Sequelize model; schema added to match the SQL `sessions` table.
- Sequelize `VIRTUAL` fields on `product` (`inStock`, `image`, `ratings`) are omitted.
- Sequelize models under `src/v1/models/` are kept until the migration is complete.
