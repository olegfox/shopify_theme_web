#!/bin/bash

compass compile
grunt build
cp ./styles/theme.css ../shopify_theme/shop/assets/
cp ./js/script.js ../shopify_theme/shop/assets/
cd ../shopify_theme
grunt shopify:upload:shop/assets/theme.css
grunt shopify:upload:shop/assets/script.js
grunt shopify:upload:shop/layout/theme.liquid
grunt shopify:upload:shop/snippets/footer.liquid
grunt shopify:upload:shop/templates/product.liquid
grunt shopify:upload:shop/templates/collection.liquid
grunt shopify:upload:shop/snippets/breadcrumb.liquid
grunt shopify:upload:shop/templates/index.liquid
grunt shopify:upload:shop/templates/search.liquid
grunt shopify:upload:shop/snippets/cart.liquid
grunt shopify:upload:shop/snippets/search-bar.liquid
grunt shopify:upload:shop/snippets/site-nav.liquid
grunt shopify:upload:shop/snippets/login.liquid
grunt shopify:upload:shop/snippets/search-sorting.liquid
grunt shopify:upload:shop/snippets/pagination-custom.liquid
grunt shopify:upload:shop/templates/customers/register.liquid
