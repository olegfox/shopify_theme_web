#!/bin/bash

grunt build
cp ./styles/theme.css ../shopify_theme/shop/assets/
cp ./js/script.js ../shopify_theme/shop/assets/
cd ../shopify_theme
grunt shopify:upload:shop/assets/theme.css
grunt shopify:upload:shop/assets/script.js
grunt shopify:upload:shop/snippets/footer.liquid
