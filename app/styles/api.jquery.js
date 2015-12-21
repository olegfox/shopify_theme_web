// (c) Copyright 2009 Jaded Pixel. Author: Caroline Schnapp. All Rights Reserved.

/*

IMPORTANT:

Ajax requests that update Shopify's cart must be queued and sent synchronously to the server.
Meaning: you must wait for your 1st ajax callback to send your 2nd request, and then wait
for its callback to send your 3rd request, etc.

*/

if ((typeof Shopify) === 'undefined') {
  Shopify = {};
}

/*

Override so that Shopify.formatMoney returns pretty
money values instead of cents.

*/

Shopify.money_format = '${{amount}}';

/*

Events (override!)

Example override:
  ... add to your theme.liquid's script tag....

  Shopify.onItemAdded = function(line_item) {
    $('message').update('Added '+line_item.title + '...');
  }

*/

Shopify.onError = function(XMLHttpRequest, textStatus) {
  // Shopify returns a description of the error in XMLHttpRequest.responseText.
  // It is JSON.
  // Example: {"description":"The product 'Amelia - Small' is already sold out.","status":500,"message":"Cart Error"}
  var data = eval('(' + XMLHttpRequest.responseText + ')');
  if (!!data.message) {
    alert(data.message + '(' + data.status  + '): ' + data.description);
  } else {
    alert('Error : ' + Shopify.fullMessagesFromErrors(data).join('; ') + '.');
  }
};

Shopify.fullMessagesFromErrors = function(errors) {
  var fullMessages = [];
  jQuery.each(errors, function(attribute, messages) {
    jQuery.each(messages, function(index, message) {
      fullMessages.push(attribute + ' ' + message);
    });
  });
  return fullMessages
}

Shopify.onCartUpdate = function(cart) {
  Shopify.quantityUpdate(cart);
  Shopify.totalUpdate(cart);
};

Shopify.onCartShippingRatesUpdate = function(rates, shipping_address) {
  var readable_address = '';
  if (shipping_address.zip) readable_address += shipping_address.zip + ', ';
  if (shipping_address.province) readable_address += shipping_address.province + ', ';
  readable_address += shipping_address.country
  alert('There are ' + rates.length + ' shipping rates available for ' + readable_address +', starting at '+ Shopify.formatMoney(rates[0].price) +'.');
};

Shopify.onItemAdded = function(line_item) {
  if($('.cart-list ul li#cart-product' + line_item.id).length > 0) {
    $('.cart-list ul li#cart-product' + line_item.id)
      .find('.quantity')
      .text(line_item.quantity);
  } else {
    $('.cart-tempate').clone().appendTo('.cart-list ul');

    $('.cart-list ul li:last')
      .show()
      .removeClass('cart-tempate')
      .attr('id', 'cart-product' + line_item.id)
      .find('.image img')
      .attr('src', line_item.image) // Image in cart product
      .end()
      .find('.title').html(line_item.title) // Title product
      .end()
      .find('.price').text(Shopify.formatMoney(line_item.price)) // Price product
      .end()
      .find('.quantity').text(line_item.quantity)
      .end()
      .find('#variant_id').val(line_item.variant_id)
    ;

    Shopify.quantityChange();
    Shopify.removeProduct();
  }
};

/**
 * Изменение количества товара в корзине
 */
Shopify.quantityChange = function() {
  $('.sidebar-wrapper .cart-list ul li .description .form_quantity .buttons button').each(function(i, e){
    if($(e).hasClass('plus')){
      $(e).click(function(){
        var quantity = parseInt($(this).parent().parent().find('.quantity').text()) + 1,
          variantId = $(this).parent().parent().find('#variant_id').val();

        if(quantity <= 0){
          quantity = 1;
        }

        $(this).parent().parent().find('.quantity').text(quantity);

        Shopify.changeItem(variantId, quantity);
      });
    }
    if($(e).hasClass('minus')){
      $(e).click(function(){
        var quantity = parseInt($(this).parent().parent().find('.quantity').text()) - 1,
          variantId = $(this).parent().parent().find('#variant_id').val();


        if(quantity <= 0){
          quantity = 1;
        }

        $(this).parent().parent().find('.quantity').text(quantity);
        Shopify.changeItem(variantId, quantity);
      });
    }
  });
};

/**
 * Удаление товара их корзины
 */
Shopify.removeProduct = function() {
  $('.sidebar-wrapper .cart-list ul li .description .form_quantity .remove').each(function(i, e){
    $(e).click(function(event){
      event.preventDefault();
      var that = this;
      var variantId = $(this).parent().find('#variant_id').val();
      Shopify.removeItem(variantId, function(){
        $(that).parent().parent().parent().remove();
      });
    });
  });
};

Shopify.onProduct = function(product) {
  alert('Received everything we ever wanted to know about ' + product.title);
};

/* Tools */

/*
Examples of call:
Shopify.formatMoney(600000, '€{{amount_with_comma_separator}} EUR')
Shopify.formatMoney(600000, '€{{amount}} EUR')
Shopify.formatMoney(600000, '${{amount_no_decimals}}')
Shopify.formatMoney(600000, '{{ shop.money_format }}') in a Liquid template!

In a Liquid template, you have access to a shop money formats with:
{{ shop.money_format }}
{{ shop.money_with_currency_format }}
{{ shop.money_without_currency_format }}
All these formats are editable on the Preferences page in your admin.
*/
Shopify.formatMoney = function(cents, format) {
  if (typeof cents == 'string') { cents = cents.replace('.',''); }
  var value = '';
  var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  var formatString = (format || this.money_format);

  function defaultOption(opt, def) {
     return (typeof opt == 'undefined' ? def : opt);
  }

  function formatWithDelimiters(number, precision, thousands, decimal) {
    precision = defaultOption(precision, 2);
    thousands = defaultOption(thousands, ',');
    decimal   = defaultOption(decimal, '.');

    if (isNaN(number) || number == null) { return 0; }

    number = (number/100.0).toFixed(precision);

    var parts   = number.split('.'),
        dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands),
        cents   = parts[1] ? (decimal + parts[1]) : '';

    return dollars + cents;
  }

  switch(formatString.match(placeholderRegex)[1]) {
    case 'amount':
      value = formatWithDelimiters(cents, 2);
      break;
    case 'amount_no_decimals':
      value = formatWithDelimiters(cents, 0);
      break;
    case 'amount_with_comma_separator':
      value = formatWithDelimiters(cents, 2, '.', ',');
      break;
    case 'amount_no_decimals_with_comma_separator':
      value = formatWithDelimiters(cents, 0, '.', ',');
      break;
  }

  return formatString.replace(placeholderRegex, value);
}

Shopify.resizeImage = function(image, size) {
  try {
    if(size == 'original') { return image; }
    else {
      var matches = image.match(/(.*\/[\w\-\_\.]+)\.(\w{2,4})/);
      return matches[1] + '_' + size + '.' + matches[2];
    }
  } catch (e) { return image; }
};

/* Ajax API */

// -------------------------------------------------------------------------------------
// POST to cart/add.js returns the JSON of the line item associated with the added item.
// -------------------------------------------------------------------------------------
Shopify.addItem = function(variant_id, quantity, callback) {
  var quantity = quantity || 1;
  var params = {
    type: 'POST',
    url: '/cart/add.js',
    data: 'quantity=' + quantity + '&id=' + variant_id,
    dataType: 'json',
    success: function(line_item) {
      if ((typeof callback) === 'function') {
        callback(line_item);
      }
      else {
        Shopify.onItemAdded(line_item);
      }
    },
    error: function(XMLHttpRequest, textStatus) {
      Shopify.onError(XMLHttpRequest, textStatus);
    }
  };
  jQuery.ajax(params);
};

// ---------------------------------------------------------
// POST to cart/add.js returns the JSON of the line item.
// ---------------------------------------------------------
Shopify.addItemFromForm = function(form_id, callback) {
    var params = {
      type: 'POST',
      url: '/cart/add.js',
      data: jQuery('#' + form_id).serialize(),
      dataType: 'json',
      success: function(line_item) {
        if ((typeof callback) === 'function') {
          callback(line_item);
        }
        else {
          Shopify.onItemAdded(line_item);
        }
      },
      error: function(XMLHttpRequest, textStatus) {
        Shopify.onError(XMLHttpRequest, textStatus);
      }
    };
    jQuery.ajax(params);
};

// ---------------------------------------------------------
// GET cart.js returns the cart in JSON.
// ---------------------------------------------------------
Shopify.getCart = function(callback) {
  jQuery.getJSON('/cart.js', function (cart, textStatus) {
    if ((typeof callback) === 'function') {
      callback(cart);
    }
    else {
      Shopify.onCartUpdate(cart);
    }
  });
};

Shopify.pollForCartShippingRatesForDestination = function(shippingAddress, callback, errback) {
  errback = errback || Shopify.onError;
  var poller = function() {
    jQuery.ajax('/cart/async_shipping_rates', {
      dataType: 'json',
      success: function(response, textStatus, xhr) {
        if (xhr.status === 200) {
          if ((typeof callback) == 'function') {
            callback(response.shipping_rates, shippingAddress)
          } else {
            Shopify.onCartShippingRatesUpdate(response.shipping_rates, shippingAddress)
          }
        } else {
          setTimeout(poller, 500);
        }
      },
      error: errback
    })
  }

  return poller;
}

Shopify.getCartShippingRatesForDestination = function(shippingAddress, callback, errback) {
  errback = errback || Shopify.onError;
  var params = {
    type: 'POST',
    url: '/cart/prepare_shipping_rates',
    data: Shopify.param({'shipping_address': shippingAddress}),
    success: Shopify.pollForCartShippingRatesForDestination(shippingAddress, callback, errback),
    error: errback
  }

  jQuery.ajax(params);
}

// ---------------------------------------------------------
// GET products/<product-handle>.js returns the product in JSON.
// ---------------------------------------------------------
Shopify.getProduct = function(handle, callback) {
  jQuery.getJSON('/products/' + handle + '.js', function (product, textStatus) {
    if ((typeof callback) === 'function') {
      callback(product);
    }
    else {
      Shopify.onProduct(product);
    }
  });
};

// ---------------------------------------------------------
// POST to cart/change.js returns the cart in JSON.
// ---------------------------------------------------------
Shopify.changeItem = function(variant_id, quantity, callback) {
  var params = {
    type: 'POST',
    url: '/cart/change.js',
    data:  'quantity='+quantity+'&id='+variant_id,
    dataType: 'json',
    success: function(cart) {
      if ((typeof callback) === 'function') {
        callback(cart);
      }
      else {
        Shopify.onCartUpdate(cart);
      }
    },
    error: function(XMLHttpRequest, textStatus) {
      Shopify.onError(XMLHttpRequest, textStatus);
    }
  };
  jQuery.ajax(params);
};

// ---------------------------------------------------------
// POST to cart/change.js returns the cart in JSON.
// ---------------------------------------------------------
Shopify.removeItem = function(variant_id, callback) {
  var params = {
    type: 'POST',
    url: '/cart/change.js',
    data:  'quantity=0&id='+variant_id,
    dataType: 'json',
    success: function(cart) {
      callback(cart);
      Shopify.onCartUpdate(cart);
    },
    error: function(XMLHttpRequest, textStatus) {
      Shopify.onError(XMLHttpRequest, textStatus);
    }
  };
  jQuery.ajax(params);
};

// ---------------------------------------------------------
// POST to cart/clear.js returns the cart in JSON.
// It removes all the items in the cart, but does
// not clear the cart attributes nor the cart note.
// ---------------------------------------------------------
Shopify.clear = function(callback) {
  var params = {
    type: 'POST',
    url: '/cart/clear.js',
    data:  '',
    dataType: 'json',
    success: function(cart) {
      if ((typeof callback) === 'function') {
        callback(cart);
      }
      else {
        Shopify.onCartUpdate(cart);
      }
    },
    error: function(XMLHttpRequest, textStatus) {
      Shopify.onError(XMLHttpRequest, textStatus);
    }
  };
  jQuery.ajax(params);
};

// ---------------------------------------------------------
// POST to cart/update.js returns the cart in JSON.
// ---------------------------------------------------------
Shopify.updateCartFromForm = function(form_id, callback) {
  var params = {
    type: 'POST',
    url: '/cart/update.js',
    data: jQuery('#' + form_id).serialize(),
    dataType: 'json',
    success: function(cart) {
      if ((typeof callback) === 'function') {
        callback(cart);
      }
      else {
        Shopify.onCartUpdate(cart);
      }
    },
    error: function(XMLHttpRequest, textStatus) {
      Shopify.onError(XMLHttpRequest, textStatus);
    }
  };
  jQuery.ajax(params);
};

// ---------------------------------------------------------
// POST to cart/update.js returns the cart in JSON.
// To clear a particular attribute, set its value to an empty string.
// Receives attributes as a hash or array. Look at comments below.
// ---------------------------------------------------------
Shopify.updateCartAttributes = function(attributes, callback) {
  var data = '';
  // If attributes is an array of the form:
  // [ { key: 'my key', value: 'my value' }, ... ]
  if (jQuery.isArray(attributes)) {
    jQuery.each(attributes, function(indexInArray, valueOfElement) {
      var key = attributeToString(valueOfElement.key);
      if (key !== '') {
        data += 'attributes[' + key + ']=' + attributeToString(valueOfElement.value) + '&';
      }
    });
  }
  // If attributes is a hash of the form:
  // { 'my key' : 'my value', ... }
  else if ((typeof attributes === 'object') && attributes !== null) {
    jQuery.each(attributes, function(key, value) {
        data += 'attributes[' + attributeToString(key) + ']=' + attributeToString(value) + '&';
    });
  }
  var params = {
    type: 'POST',
    url: '/cart/update.js',
    data: data,
    dataType: 'json',
    success: function(cart) {
      if ((typeof callback) === 'function') {
        callback(cart);
      }
      else {
        Shopify.onCartUpdate(cart);
      }
    },
    error: function(XMLHttpRequest, textStatus) {
      Shopify.onError(XMLHttpRequest, textStatus);
    }
  };
  jQuery.ajax(params);
};

// ---------------------------------------------------------
// POST to cart/update.js returns the cart in JSON.
// ---------------------------------------------------------
Shopify.updateCartNote = function(note, callback) {
  var params = {
    type: 'POST',
    url: '/cart/update.js',
    data: 'note=' + attributeToString(note),
    dataType: 'json',
    success: function(cart) {
      if ((typeof callback) === 'function') {
        callback(cart);
      }
      else {
        Shopify.onCartUpdate(cart);
      }
    },
    error: function(XMLHttpRequest, textStatus) {
      Shopify.onError(XMLHttpRequest, textStatus);
    }
  };
  jQuery.ajax(params);
};


if (jQuery.fn.jquery >= '1.4') {
  Shopify.param = jQuery.param;
} else {
  Shopify.param = function( a ) {
    var s = [],
      add = function( key, value ) {
        // If value is a function, invoke it and return its value
        value = jQuery.isFunction(value) ? value() : value;
        s[ s.length ] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
      };

    // If an array was passed in, assume that it is an array of form elements.
    if ( jQuery.isArray(a) || a.jquery ) {
      // Serialize the form elements
      jQuery.each( a, function() {
        add( this.name, this.value );
      });

    } else {
      for ( var prefix in a ) {
        Shopify.buildParams( prefix, a[prefix], add );
      }
    }

    // Return the resulting serialization
    return s.join("&").replace(/%20/g, "+");
  }

  Shopify.buildParams = function( prefix, obj, add ) {
    if ( jQuery.isArray(obj) && obj.length ) {
      // Serialize array item.
      jQuery.each( obj, function( i, v ) {
        if ( rbracket.test( prefix ) ) {
          // Treat each array item as a scalar.
          add( prefix, v );

        } else {
          Shopify.buildParams( prefix + "[" + ( typeof v === "object" || jQuery.isArray(v) ? i : "" ) + "]", v, add );
        }
      });

    } else if ( obj != null && typeof obj === "object" ) {
      if ( Shopify.isEmptyObject( obj ) ) {
        add( prefix, "" );

      // Serialize object item.
      } else {
        jQuery.each( obj, function( k, v ) {
          Shopify.buildParams( prefix + "[" + k + "]", v, add );
        });
      }

    } else {
      // Serialize scalar item.
      add( prefix, obj );
    }
  }

  Shopify.isEmptyObject = function( obj ) {
    for ( var name in obj ) {
      return false;
    }
    return true;
  }

  // ---------------------------------------------------------
  // Обновление количества товара в HTML тегах
  // ---------------------------------------------------------

  Shopify.quantityUpdate = function( cart ) {
    $('.sidebar-wrapper#cart-wrapper .number, .wrap-header-bar .header-bar .grid-item .cart span.number').html(cart.item_count);

    // Скрываем панель с корзиной если там пусто
    if(cart.item_count == 0) {
      $('div[data-simplersidebar="mask"]').click();
    }
  }

  // ---------------------------------------------------------
  // Обновление общей стоимости в корзине
  // ---------------------------------------------------------

  Shopify.totalUpdate = function( cart ) {
    $('.sidebar-wrapper .cart-list .block_total .total').html(Shopify.formatMoney(cart.total_price));
  }

  // ---------------------------------------------------------
  // Аутентификация
  // ---------------------------------------------------------

  Shopify.signIn = function( ) {

    var $email = $('form#customer_login').find('input[type="email"]'), // Email
        $password = $('form#customer_login').find('input[type="password"]'); // Пароль

    // Обработка ввода в поля email и password
    $email.bind('keyup keypress change', function() {
      $(this).removeClass('error');
    });

    $password.bind('keyup keypress change', function() {
      $(this).removeClass('error');
    });

    // Отправка данных формы аутентификации
    function login(email, password) {
      var data = {
        'customer[email]': email,
        'customer[password]': password,
        form_type: 'customer_login',
        utf8: '✓'
      };

      var promise = $.ajax({
        url: '/account/login',
        method: 'post',
        data: data,
        dataType: 'html',
        async: true
      });

      return promise;
    }

    // Получение checkoutUrl для перенаправления пользователя
    function getCheckoutUrl() {
      function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
          results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
      }
      return getParameterByName('checkout_url');
    }

    // Обработка отправки формы аутентификации
    $('form#customer_login').submit(function() {

      login($email.val(), $password.val()).done(function (html) {

        if (html.indexOf('Invalid login credentials') !== -1) {

          $email.addClass('error');
          $password.addClass('error');

        } else {

          var checkoutUrl = getCheckoutUrl();
          if (checkoutUrl) {
            window.location.href = checkoutUrl;
          } else {
            window.location.href = '/';
          }

        }

      });

      return false;
    });

  }

  // ---------------------------------------------------------
  // Поиск
  // ---------------------------------------------------------

  Shopify.search = function( ) {
    var $form = $('.form-search form');

    $form.bind('submit', function() {
      $.get($form.attr('action'), $form.serialize(), function(data){
        var result = JSON.parse(data);

        console.log('length ' + result.length);

        $('#search .results ul').html('');

        if(result.length > 0) {

          $.each(result, function(i, e) {

            console.log(e);
            $('.search-sidebar .sidebar-wrapper .results ul').append('<li>' +
              '<div class="image"><a href="/products/' + e.handle + '"><img src="' + e.featured_image + '" alt=""></a></div>' +
              '<div class="description"><a href="" class="title">' + e.title + '</a>' +
              '<div class="price">' + Shopify.formatMoney(e.price) + '</div>' +
              '</div>' +
              '<hr/>' +
              '</li>');

            console.log($('.search-sidebar .sidebar-wrapper .results ul').html());
          });

          console.log(result);
        }
      });

      return false;
    });
  }
}


/* Used by Tools */

function floatToString(numeric, decimals) {
  var amount = numeric.toFixed(decimals).toString();
  if(amount.match(/^\.\d+/)) {return "0"+amount; }
  else { return amount; }
}

/* Used by API */

function attributeToString(attribute) {
  if ((typeof attribute) !== 'string') {
    // Converts to a string.
    attribute += '';
    if (attribute === 'undefined') {
      attribute = '';
    }
  }
  // Removing leading and trailing whitespace.
  return jQuery.trim(attribute);
}
