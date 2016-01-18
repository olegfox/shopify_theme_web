$(function(){
  /**
   * detect IE
   * returns version of IE or false, if browser is not Internet Explorer
   */
  function detectIE() {
    var ua = window.navigator.userAgent;

    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
      // IE 10 or older => return version number
      return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    var trident = ua.indexOf('Trident/');
    if (trident > 0) {
      // IE 11 => return version number
      var rv = ua.indexOf('rv:');
      return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    var edge = ua.indexOf('Edge/');
    if (edge > 0) {
      // Edge (IE 12+) => return version number
      return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }

    // other browser
    return false;
  }

  /**
   * Cлайдер с товарами на главной
   */
  $('.carousel ul').slick({
    infinite: true,
    slidesToShow: 5,
    slidesToScroll: 5
  });

  /**
   * Каталог товаров
   */

  function convertImgToDataURLviaCanvas(url, callback, outputFormat){
    var img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function(){
      var canvas = document.createElement('CANVAS');
      var ctx = canvas.getContext('2d');
      var dataURL;
      canvas.height = this.height;
      canvas.width = this.width;
      ctx.drawImage(this, 0, 0);
      dataURL = canvas.toDataURL(outputFormat);
      var imgNew = new Image();
      imgNew.src = dataURL;
      callback(dataURL, imgNew);
      canvas = null;
    };
    img.src = url;
  }

  function cropImagesCatalog($images){
    $images.each(function(i, e){

      var imageUrl = $(e).data('src'),
          options = {width: $(e).data('width'), height: $(e).data('height')};

      convertImgToDataURLviaCanvas(imageUrl, function(base64Img, img){

        img.onload = function(){

          SmartCrop.crop(img, options, function(result){
            var crop = result.topCrop,
              canvas = $('<canvas>')[0],
              ctx = canvas.getContext('2d');
            canvas.width = options.width;
            canvas.height = options.height;

            ctx.drawImage(img, crop.x, crop.y, crop.width, crop.height, 0, 0, canvas.width, canvas.height);

            $(e)
              .after(canvas)
              .hide()
              .removeClass('new');

            if(($images.length - 1) === i) {
              $('.items-catalog ul li').removeClass('hide');
            }

            $('.items-catalog ul').masonry('reloadItems');
            $('.items-catalog ul').masonry('layout', {isAnimated: false, transitionDuration: 0});
          });

        };

      });

    });
  }

  $('.items-catalog ul li').addClass('hide');

  $('.items-catalog ul').masonry({
    // options
    columnWidth: '.sizer',
    percentPosition: true,
    itemSelector : 'li',
    'containerStyle' : {
      position: 'relative'
    },
    isAnimated: false,
    transitionDuration: 0
  });

  // Обрезка фотографий в каталоге
  cropImagesCatalog($('.items-catalog ul li img'));

  /**
   * Обработчик нажатия на стрелку на главной странице
   */
  $('a[href="#main-catalog"]').click(function(e){
    console.log('click');
    e.preventDefault();

    $('.content').animate({
      scrollTop: $($(this).attr('href')).offset().top
    }, {
      duration: 1000
    });
  });

  /**
   * Обработчик скролла
   */
  var eventScroll = function(){
    var top = parseInt($('.ps-scrollbar-y-rail').css('top'));

    $('header .wrap').css({
      'opacity': 1 - $(this).scrollTop() / ($('body, html').height() - $('.wrap-header-bar').height() * 2)
    });

    $('header .vertical-center .inner').css({
      'opacity': 1 - $(this).scrollTop() / ($('body, html').height() - $('.wrap-header-bar').height() * 2)
    });

    if(!$('.header-bar').hasClass('header-bar-static')){
      if($("body > .content").scrollTop() > 1){
        $('.header-bar-white').addClass('header-bar-dark');
      } else {
        $('.header-bar-dark').removeClass('header-bar-dark');
      }
    }

    /**
     * Параллакс
     */
    // Если это не IE
    if(!detectIE()){
      if($("body > .content").scrollTop() <= 400){
        $('header .vertical-center .inner, header .header-footer').css({
          'transform' : 'translateY(' + $(".content").scrollTop()/2 + 'px)'
        });
      }
    }
  };
  $("body > .content").bind('scroll.main', eventScroll);



  /**
   * Боковое меню слева
   */
  $( document ).ready(function() {
    $( '#sidebar' ).simplerSidebar({
      top: 0,
      opener: '#toggle-sidebar',
      attr: 'simplersidebar',
      animation: {
        easing: 'easeOutQuint'
      },
      sidebar: {
        align: 'left',
        width: 300,
        closingLinks: '.close-sb'
      }
    });
  });

  /**
   * Кастомный скроллбар
   */
  $('.content').perfectScrollbar();

  /**
   * Подменю в сайдбаре
   */
  $('.sidebar-wrapper .lists-menu>ul>li>a').click(function(e){
    if($(this).parent().find('ul').length > 0){
      e.preventDefault();

      if($(this).parent().find('ul').hasClass('open')){
        var that = this;
        $(this).parent().find('ul').slideUp(function(){
          socialStickMenuSidebar();
          $(that).parent().removeClass('current');
        }).removeClass('open');
      } else {
        $(this).parent().parent().find('> li').removeClass('current');
        $(this).parent().addClass('current');
        $('.sidebar-wrapper .lists-menu>ul').find('li ul').removeClass('open').slideUp();
        $(this).parent().find('ul').slideDown(function(){
          socialStickMenuSidebar();
        }).addClass('open');
      }
    }
  });

  /**
   * Корзина
   */
  $( document ).ready(function() {
    $( '#cart' ).simplerSidebar({
      top: 0,
      opener: '#toggle-cart',
      attr: 'simplersidebar',
      animation: {
        easing: 'easeOutQuint'
      },
      sidebar: {
        align: 'right',
        width: 300,
        closingLinks: '.close-sb'
      }
    });
  });

  // Блокировка скроллинга
  $('#toggle-sidebar, #toggle-cart').click(function(){
    var $scrollTop = $('body > .content').scrollTop();
    $('body > .content').bind('scroll.block', function(){
      $(this).scrollTop($scrollTop);
    });
    $('body > .content').unbind('scroll.main');
    $('.ps-scrollbar-y-rail').hide();
  });
  setTimeout(function(){
    $('* [data-simplersidebar="mask"]').click(function(){
      console.log('close');
      $('body > .content').unbind('scroll.block');
      $('body > .content').bind('scroll.main', eventScroll);
      $('.ps-scrollbar-y-rail').show();
    });
  }, 500);

  /**
   * Изменение количества товара в корзине
   */
  Shopify.quantityChange();

  /**
   * Удаление товара их корзины
   */
  Shopify.removeProduct();

  /**
   * Обработка формы аутентификации пользователя
   */
  Shopify.signIn();

  /**
   * Карусель на странице товара
   */
  if($('.product-images ul li').length <= 3) {
    $('.product-images ul li:last').after($('.product-images ul li').clone());
  }

  $('.product-images ul').slick({
    centerMode: true,
    centerPadding: '0px',
    slidesToShow: 3,
    sliderPerRow: 1,
    swipeToSlide: true,
    arrows: true,
    infinite: true,
    autoplay: false,
    variableWidth: true
  });

  /**
   * Добавление товара в корзину
   */
  $('#AddToCartForm').submit(function(line_item){
    Shopify.addItemFromForm($(this).attr('id'), function(line_item){
      Shopify.getCart();
      Shopify.onItemAdded(line_item);
      $('#toggle-cart').click();
    });

    return false;
  });

  /**
   * Фиксирование панели продукта при скроллинге
   */

  // Вычисляем высоту слайдера с изображениями продукта
  var calculateProductBlock = function() {
    //var heightBlock = $(window).height() -
    //                  $(".wrap-header-bar").outerHeight() -
    //                  $(".product .wrap-head").innerHeight() -
    //                  $(".product .wrap-shop-bar").outerHeight() - parseInt($(".product .product-images").css("padding-top"));
    //
    //console.log(".window" + $(window).height());
    //console.log(".wrap-header-bar" + $(".wrap-header-bar").outerHeight());
    //console.log(".product .wrap-head" + $(".product .wrap-head").outerHeight());
    //console.log(".product .social-bar" + $(".product .social-bar").outerHeight());
    //console.log(".product .wrap-shop-bar" + $(".product .wrap-shop-bar").outerHeight());
    //
    //$(".product .product-images").css({
    //  height: heightBlock
    //});

    //if(window.innerWidth < 1440) {
    //  $('.product-images ul li img').css({
    //    'max-height': 'inherit',
    //    'width': '100%'
    //  });
    //
    //  $('.product-images ul').css({
    //    'margin-top': ($('.product-images').height() - $('.product-images ul').height())/2
    //  });
    //} else {

      $('.product-images ul').imagesLoaded(function(){
        var heightBlock = $(window).height() -
          $(".wrap-header-bar").outerHeight() -
          $(".product .wrap-head").innerHeight() -
          $(".product .wrap-shop-bar").outerHeight() - parseInt($(".product .product-images").css("padding-top"));

        $(".product .product-images").css({
          height: heightBlock
        });

        $('.product-images ul li img').each(function(i, e){

          if($(e).parent().width() >= $(e).width()) {
            $(e).css({
              'max-height': 'inherit',
              'width': '100%'
            });
          }

          if($(e).height() > heightBlock) {
            $(e).css({
              'max-height': heightBlock,
              'width': 'auto'
            });
          }
        });

        $('.product-images ul').css({
          'top': 0,
          'padding-top': ($('.product-images').height() - $('.product-images ul').height())/2
        });
        $('.product-images ul img').css({
          'opacity': 1
        });
      });

    //}
  };

  calculateProductBlock();

  $(window).resize(function() {

    calculateProductBlock();

  });

  /**
   * Выравнивание сетки товаров на странице коллекции
   */
  //if($('.items-catalog').length > 0) {
  //  var countSize60 = $('.size-60').length;
  //
  //  // Если в сетке товаров есть большие карточки товара
  //  if(countSize60 > 0) {
  //
  //    //Скрываем карточки с размером size-20
  //
  //  }
  //}

  /**
   * Ajax подгрузка товаров
   */
  function loadMore() {
    scrollNode = $('.footer-catalog .btn-load-more').last();
    scrollURL = $('.footer-catalog .next a').attr("href");
    if(scrollNode.length > 0 && scrollNode.css('display') != 'none') {
      $.ajax({
        type: 'GET',
        url: scrollURL,
        beforeSend: function() {
          //scrollNode.clone().empty().insertAfter(scrollNode).append('<img src=\"{{ "loading.gif" | asset_url }}\" />');
          scrollNode.hide();
        },
        success: function(data) {
          // remove loading feedback
          scrollNode.next().remove();
          var filteredData = $(data).find(".items-catalog li:not(.sizer)"),
              $newFooterCatalog = $(data).find(".footer-catalog"),
              $oldFooterCatalog = $(".footer-catalog:last-child"),
              $container = $('.items-catalog ul');

          filteredData.addClass('hide');
          filteredData.find('img').addClass('new');

          $newFooterCatalog.insertAfter($oldFooterCatalog);
          $oldFooterCatalog.remove();

          $(".items-catalog ul").append( filteredData ).masonry( 'appended', filteredData );

          // Обрезка фотографий в каталоге
          cropImagesCatalog($('.items-catalog ul li img.new'));

          scrollNode.show();

          if($('.footer-catalog .btn-load-more').length > 0) {
            $('.footer-catalog .btn-load-more').unbind('click').bind('click', function(){
              loadMore();
            });
          }

        },
        dataType: "html"
      });
    }
  }

  if($('.footer-catalog .btn-load-more').length > 0) {
    $('.footer-catalog .btn-load-more').unbind('click').bind('click', function(){
      loadMore();
    });
  }

  /**
   * Sign in
   */
  var time = 500,
      closeSignIn = function () {

        $('[href="/account/login/"]').removeClass('current');
        $('.wrap-login').removeClass('visible');

        $('body > .content').removeClass("mTop");

        // Разблокировка скроллинга
        $('body > .content').unbind('scroll.block');
        $('body > .content').bind('scroll.main', eventScroll);
        $('.ps-scrollbar-y-rail').show();

        $('body > .content .black-background').animate({
          opacity: '0'
        }, 1000, function(){
          $('body > .content').find('.black-background').remove();

          // Если IE
          if(detectIE()) {
            $('.wrap-header-bar').css({
              'position': 'fixed'
            });
          }
        });
      };

  $('[href="/account/login/"]').click(function(e){
    e.preventDefault();
    if($(this).hasClass('current')) {
      closeSignIn();
    } else {
      $(this).addClass('current');

      // Если IE
      if(detectIE()) {
        $('.wrap-header-bar').css({
          'position': 'absolute'
        });
      }

      $('.wrap-login').addClass('visible');

      $('body > .content').addClass("mTop");

      // Блокировка скроллинга
      var $scrollTop = $('body > .content').scrollTop();
      $('body > .content').bind('scroll.block', function(){
        $(this).scrollTop($scrollTop);
      });
      $('body > .content').unbind('scroll.main');
      $('.ps-scrollbar-y-rail').hide();

      //Затемняем контент
      $('body > .content').append("<div class='black-background'></div>");
      $('body > .content .black-background')
        .animate({
          opacity: '0.5'
        }, 500)
        .click(function(){
          closeSignIn();
        });
    }
  });

  $('.wrap-login .close').click(function(e){
    closeSignIn();
  });

  $(document).keyup(function(e) {
    if (e.keyCode == 27) {
      closeSignIn();
    }
  });

  /**
   * Custom input number
   */
  $("input[type='number']").stepper();

  /**
   * Панель поиска
   */
  $( document ).ready(function() {
    $( '#search' ).simplerSidebar({
      top: 0,
      opener: '#toggle-search',
      attr: 'simplersidebar',
      animation: {
        easing: 'easeOutQuint'
      },
      sidebar: {
        align: 'right',
        width: 300,
        closingLinks: '.close-sb'
      }
    });
  });

  /**
   * Обработчик формы поиска
   */
  Shopify.search();

  /**
   * Обработчик нажатия на строку с заказом в списке заказов
   */
  $('.list-order table tbody tr:not(.select)').click(function(){
    if(!$(this).hasClass('select')) {
      $('.list-order table tbody tr.select').removeClass('select');
      $(this).addClass('select');

      $(this).next().removeClass('hide').addClass('select');
      $(this).next().next().removeClass('hide').addClass('select');
    } else {
      $('.list-order table tbody tr.select').removeClass('select');

      $(this).next().addClass('hide').removeClass('select');
      $(this).next().next().addClass('hide').removeClass('select');
    }
  });

  /**
   * Табы на странице аакаунта
   */
  if($('.wrap-link-tabs').length > 0) {
    if(window.location.hash) {
      var hash = window.location.hash; //Puts hash in variable, and removes the # character

      $('.wrap-link-tabs li').removeClass('current');
      $('.wrap-link-tabs li a[href*="' + hash + '"]').parent().addClass('current');
      $('.tab').removeClass('tab-active');
      $(hash).addClass('tab-active');

      // Disable hash jump
      $('.ps-container').scrollTop(0);
    }

    $('.wrap-link-tabs li a').unbind('click').bind('click', function(e) {
      if($(this).get(0).hash){
        e.preventDefault();

        var hash = $(this).get(0).hash;

        $('.wrap-link-tabs li').removeClass('current');
        $(this).parent().addClass('current');
        window.location.hash = hash;
        $('.tab').removeClass('tab-active');
        $(hash).addClass('tab-active');

        // Disable hash jump
        $('.ps-container').scrollTop(0);
      }
    });
  }

  /**
   * Сохрание формы на странице аккаунта
   */
  if($('.form-account').length > 0) {
    $('.form-account .btn').unbind('click').bind('click', function(){
      $('.form-account form').each(function(i, e) {
        var $form = $(e);

        $.post($form.attr('action').replace(/^.*\/\/[^\/]+/, ''), $form.serialize(), function(data){
          console.log(data);
        });
      });
    });
  }

  /**
   * Подгрузка регионов для каждой страны
   */
  if($('*[name="address[country]"]').length > 0){
    var cityChange = function() {

      var provinces = $('*[name="address[country]"]').find('option:selected').data('provinces');

      $('*[name="address[province]"] option').remove();

      for(var i = 0; i < provinces.length; i++){
        var value = provinces[i][0];
        $('*[name="address[province]"]').append('<option value="'+ value +'">' + value + '</option>');
      }

      // Выбор города по умолчанию
      var $provinceDefault = $('*[name="address[province]"]').data('default');
      if($provinceDefault.length > 0){
        $('*[name="address[province]"] option[value="' + $provinceDefault + '"]').attr('selected', 'selected');
      }
    };

    // Выбор страны по умолчанию
    var $countryDefault = $('*[name="address[country]"]').data('default');
    if($countryDefault.length > 0){
      $('*[name="address[country]"] option[value="' + $countryDefault + '"]').attr('selected', 'selected');
    }

    // Загрузка городов при загрузке страницы
    cityChange();

    // Загрузка городов при изменении страны
    $('*[name="address[country]"]').change(function() {
      cityChange();
    });
  }

  /**
   * Отправка формы забыл пароль
   */
  if($('#RecoverPasswordForm').length > 0){
    var $form = $('#RecoverPasswordForm form');

    //Отключение html5 валидации
    $form.attr('novalidate', 'novalidate');

    $form.unbind('submit').bind('submit', function(){

      // Валидация email
      function validateEmail(email) {
        var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
      }

      if(!validateEmail($('#RecoverPasswordForm input[type="email"]').val())){
        $('#RecoverPasswordForm input[type="email"]').addClass('error');
      } else {
        $('#RecoverPasswordForm input[type="email"]').removeClass('error');

        $.post($form.attr('action'), $form.serialize(), function(data){

          $('#RecoverPasswordForm form').hide();
          $('#RecoverPasswordForm .message').removeClass('hide');

          setTimeout(function(){
            hideRecoverPasswordForm();
            $('#RecoverPasswordForm form').show();
            $('#RecoverPasswordForm .message').addClass('hide');
          }, 5000);

        });
      }

      return false;
    });
  }

  /**
   * Открепление от низа социальных кнопок если содержимое sidebar не влезает
   */
  var socialStickMenuSidebar = function(){
    console.log('content height = ' + (parseInt($('.lists-menu').height()) + parseInt($('.sidebar-wrapper .header').height())));
    console.log('window height = ' + $(window).height());
    if((parseInt($('.lists-menu').height()) + parseInt($('.sidebar-wrapper .header').height())) + 100 > $(window).height()){
      $('.sidebar-wrapper .social').addClass('no-stick');
    } else {
      $('.sidebar-wrapper .social').removeClass('no-stick');
    }
  }

  socialStickMenuSidebar();

  $(window).bind('resize', function(){
    socialStickMenuSidebar();
  });

  /**
   * Открепление от низа кнопки checkout если содержимое sidebar не влезает
   */
  var cartStickMenuSidebar = function(){
    console.log('content height = ' + (parseInt($('.cart-list').height()) + parseInt($('#cart-wrapper .header').height())));
    console.log('window height = ' + $(window).height());
    if((parseInt($('.cart-list').height()) + parseInt($('#cart-wrapper .header').height())) + 240 > $(window).height()){
      $('#cart-wrapper .block_total').addClass('no-stick');
    } else {
      $('#cart-wrapper .block_total').removeClass('no-stick');
    }
  }

  cartStickMenuSidebar();

  $(window).bind('resize', function(){
    cartStickMenuSidebar();
  });

  /**
   * Переключение кллекий на странице каталога
   */
  var listCollectionClick = function(){

    $('.list ul li a').click(function(e){

      e.preventDefault();

      if(!$(this).parent().hasClass('current')){

        var url = $(this).attr('href');

        $('.list ul li').removeClass('current');
        $(this).parent().addClass('current');

        if(window.history.pushState){
          window.history.pushState('', '', url);
        }

        $.get(url, {}, function(data){
          $('.breadcrumbs').empty().html($(data).find('.breadcrumbs').html());
          $('section.catalog > h2').empty().text($(data).find('section.catalog > h2').text());
          $('.items-catalog').empty().html($(data).find('.items-catalog').html());
          $('.footer-catalog').empty().html($(data).find('.footer-catalog').html());

          $('.items-catalog li').addClass('hide');
          $('.items-catalog li').find('img').addClass('new');

          $('.items-catalog ul').masonry({
            // options
            columnWidth: '.sizer',
            percentPosition: true,
            itemSelector : 'li',
            'containerStyle' : {
              position: 'relative'
            },
            isAnimated: false,
            transitionDuration: 0
          });

          // Обрезка фотографий в каталоге
          cropImagesCatalog($('.items-catalog ul li img.new'));

          if($('.footer-catalog .btn-load-more').length > 0) {
            $('.footer-catalog .btn-load-more').unbind('click').bind('click', function(){
              loadMore();
            });
          }

        });

      }

    });

  };

  listCollectionClick();

});
