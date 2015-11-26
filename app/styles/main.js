$(function(){
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
  $('.items-catalog').imagesLoaded( function() {
    $('.items-catalog ul').masonry({
      // options
      itemSelector : 'li',
      'containerStyle' : {
        position: 'relative'
      },
      columnWidth: 20
    });
  });

  /**
   * Обработчик нажатия на стрелку на главной странице
   */
  $('a[href="#main-catalog"]').click(function(e){
    console.log('click');
    e.preventDefault();

    $('html, body').animate({
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
      if($(window).scrollTop() > 1){
        $('.header-bar-white').switchClass('header-bar-white', 'header-bar-dark', 200);
      } else {
        $('.header-bar-dark').switchClass('header-bar-dark', 'header-bar-white', 200);
      }
    }

    /**
     * Параллакс
     */
    if($(window).scrollTop() <= 400){
      $('header .vertical-center .inner, header .header-footer').css({
        'transform' : 'translateY(' + $(window).scrollTop()/2 + 'px)'
      });
    }
  };
  $(window).bind('scroll.main', eventScroll);

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
  $('body').perfectScrollbar();

  /**
   * Подменю в сайдбаре
   */
  $('.sidebar-wrapper .lists-menu>ul>li>a').click(function(e){
    if($(this).parent().find('ul').length > 0){
      e.preventDefault();

      if($(this).parent().find('ul').hasClass('open')){
        var that = this;
        $(this).parent().find('ul').slideUp(function(){
          $(that).parent().removeClass('current');
        }).removeClass('open');
      } else {
        $(this).parent().parent().find('> li').removeClass('current');
        $(this).parent().addClass('current');
        $('.sidebar-wrapper .lists-menu>ul').find('li ul').removeClass('open').slideUp();
        $(this).parent().find('ul').slideDown().addClass('open');
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
    var $scrollTop = $(window).scrollTop();
    $(window).bind('scroll.block', function(){
      $(this).scrollTop($scrollTop);
    });
    $(window).unbind('scroll.main');
    $('.ps-scrollbar-y-rail').hide();
  });
  setTimeout(function(){
    $('* [data-simplersidebar="mask"]').click(function(){
      console.log('close');
      $(window).unbind('scroll.block');
      $(window).bind('scroll.main', eventScroll);
      $('.ps-scrollbar-y-rail').show();
    });
  }, 500);

  /**
   * Изменение количества товара в корзине
   */
  $('.sidebar-wrapper .cart-list ul li .description .form_quantity .buttons button').each(function(i, e){
    if($(e).hasClass('plus')){
      $(e).click(function(){
        var quantity = parseInt($(this).parent().parent().find('.quantity').text()) + 1;
        $(this).parent().parent().find('.quantity').text(quantity);
      });
    }
    if($(e).hasClass('minus')){
      $(e).click(function(){
        var quantity = parseInt($(this).parent().parent().find('.quantity').text()) - 1;

        if(quantity <= 0){
          quantity = 1;
        }

        $(this).parent().parent().find('.quantity').text(quantity);
      });
    }
  });

  /**
   * Удаление товара их корзины
   */
  $('.sidebar-wrapper .cart-list ul li .description .form_quantity .remove').each(function(i, e){
    $(e).click(function(event){
      event.preventDefault();
      $(this).parent().parent().parent().remove();
    });
  });

  /**
   * Карусель на странице товара
   */
  $('.product-images ul').slick({
    centerMode: true,
    centerPadding: '60px',
    slidesToShow: 3,
    arrows: false
  });
});
