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
  $(window).scroll(function(){
    $('header .wrap').css({
      'opacity': 1 - $(this).scrollTop() / ($('body, html').height() - $('.wrap-header-bar').height() * 2)
    });

    if($(this).scrollTop() >= 200){
      $('.header-bar-white').switchClass('header-bar-white', 'header-bar-dark', 500);
    } else {
      $('.header-bar-dark').switchClass('header-bar-dark', 'header-bar-white', 500);
    }
  });

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
});
