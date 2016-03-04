$ ->

  ###*
  # Cлайдер с товарами на главной
  ###

  ###*
  # detect IE
  # returns version of IE or false, if browser is not Internet Explorer
  ###

  detectIE = ->
    ua = window.navigator.userAgent
    msie = ua.indexOf('MSIE ')
    if msie > 0
# IE 10 or older => return version number
      return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10)
    trident = ua.indexOf('Trident/')
    if trident > 0
# IE 11 => return version number
      rv = ua.indexOf('rv:')
      return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10)
    edge = ua.indexOf('Edge/')
    if edge > 0
# Edge (IE 12+) => return version number
      return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10)
    # other browser
    false

  ###*
  # Каталог товаров
  ###

  convertImgToDataURLviaCanvas = (url, callback, outputFormat) ->
    img = new Image
    img.crossOrigin = 'Anonymous'

    img.onload = ->
      canvas = document.createElement('CANVAS')
      ctx = canvas.getContext('2d')
      dataURL = undefined
      canvas.height = @height
      canvas.width = @width
      ctx.drawImage this, 0, 0
      dataURL = canvas.toDataURL(outputFormat)
      imgNew = new Image
      imgNew.src = dataURL
      callback dataURL, imgNew
      canvas = null
      return

    img.src = url
    return

  cropImagesCatalog = ($images) ->
    $images.each (i, e) ->
      canvas = $(e)[0]

      $('.items-catalog ul').masonry 'reloadItems'
      $('.items-catalog ul').masonry 'layout',
        isAnimated: false
        transitionDuration: 0

    return

  ###*
  # Выравнивание сетки товаров на странице коллекции
  ###

  #if($('.items-catalog').length > 0) {
  #  var countSize60 = $('.size-60').length;
  #
  #  // Если в сетке товаров есть большие карточки товара
  #  if(countSize60 > 0) {
  #
  #    //Скрываем карточки с размером size-20
  #
  #  }
  #}

  ###*
  # Ajax подгрузка товаров
  ###

  loadMore = ->
    scrollNode = $('.footer-catalog .btn-load-more').last()
    scrollURL = $('.footer-catalog .next a').attr('href')
    if scrollNode.length > 0 and scrollNode.css('display') != 'none'
      $.ajax
        type: 'GET'
        url: scrollURL
        beforeSend: ->
#scrollNode.clone().empty().insertAfter(scrollNode).append('<img src=\"{{ "loading.gif" | asset_url }}\" />');
          scrollNode.hide()
          return
        success: (data) ->
# remove loading feedback
          scrollNode.next().remove()
          filteredData = $(data).find('.items-catalog li:not(.sizer)')
          $newFooterCatalog = $(data).find('.footer-catalog')
          $oldFooterCatalog = $('.footer-catalog:last-child')
          $container = $('.items-catalog ul')
          filteredData.addClass 'hide'
          filteredData.find('canvas').addClass 'new'
          $newFooterCatalog.insertAfter $oldFooterCatalog
          $oldFooterCatalog.remove()
          $('.items-catalog ul').append(filteredData).masonry 'appended', filteredData
          # Обрезка фотографий в каталоге
          cropImagesCatalog $('.items-catalog ul li canvas.new')
          scrollNode.show()
          if $('.footer-catalog .btn-load-more').length > 0
            $('.footer-catalog .btn-load-more').unbind('click').bind 'click', ->
              loadMore()
              return
          return
        dataType: 'html'
    return

  if $('.carousel ul').length > 0
    $('.carousel ul').slick
      infinite: true
      slidesToShow: 5
      slidesToScroll: 5

  # Если есть каталог с товарами
  if $('.items-catalog ul').length > 0
    $('.items-catalog ul').masonry
      isInitLayout: false,
      columnWidth: '.sizer'
      percentPosition: true
      itemSelector: 'li'
      'containerStyle': position: 'relative'
      isAnimated: false
      transitionDuration: 0

    $('.items-catalog ul').data('masonry').on 'layoutComplete', ->
      $('.items-catalog ul li').removeClass 'hide'

    # Обрезка фотографий в каталоге
    cropImagesCatalog $('.items-catalog ul li canvas')

  ###*
  # Обработчик нажатия на стрелку на главной странице
  ###

  $('a[href="#main-catalog"]').click (e) ->
    console.log 'click'
    e.preventDefault()
    $('.content').animate { scrollTop: $($(this).attr('href')).offset().top }, duration: 1000
    return

  ###*
  # Обработчик скролла
  ###

  eventScroll = ->
    top = parseInt($('.ps-scrollbar-y-rail').css('top'))
    $('header .wrap').css 'opacity': 1 - ($(this).scrollTop() / ($('body, html').height() - ($('.3').height() * 2)))
    $('header .vertical-center .inner').css 'opacity': 1 - ($(this).scrollTop() / ($('body, html').height() - ($('.wrap-header-bar').height() * 2)))
    if !$('.header-bar').hasClass('header-bar-static')
      if $('body > .content').scrollTop() > $(window).height() - 10
        $('.wrap-header-bar').addClass 'wrap-header-bar-fixed'
        $('.header-bar-white').addClass 'header-bar-dark'
      else if $('body > .content').scrollTop() < $(window).height() - 10
        $('.header-bar-dark').removeClass 'header-bar-dark'
        $('.wrap-header-bar').removeClass 'wrap-header-bar-fixed'
      return


    ###*
    # Параллакс
    ###

    # Если это не IE
    if !detectIE()
      if $('body > .content').scrollTop() <= 400
        $('header .vertical-center .inner, header .header-footer').css 'transform': 'translateY(' + $('.content').scrollTop() / 2 + 'px)'
    return

  $('body > .content').bind 'scroll.main', eventScroll

  ###*
  # Боковое меню слева
  ###

  $(document).ready ->
    $('#sidebar').simplerSidebar
      top: 0
      opener: '#toggle-sidebar'
      attr: 'simplersidebar'
      animation: easing: 'easeOutQuint'
      sidebar:
        align: 'left'
        width: 300
        closingLinks: '.close-sb'
    return

  ###*
  # Кастомный скроллбар
  ###

  $('.content').perfectScrollbar()

  ###*
  # Подменю в сайдбаре
  ###

  $('.sidebar-wrapper .lists-menu>ul>li>a').click (e) ->
    if $(this).parent().find('ul').length > 0
      e.preventDefault()
      if $(this).parent().find('ul').hasClass('open')
        that = this
        $(this).parent().find('ul').slideUp(->
          socialStickMenuSidebar()
          $(that).parent().removeClass 'current'
          return
        ).removeClass 'open'
      else
        $(this).parent().parent().find('> li').removeClass 'current'
        $(this).parent().addClass 'current'
        $('.sidebar-wrapper .lists-menu>ul').find('li ul').removeClass('open').slideUp()
        $(this).parent().find('ul').slideDown(->
          socialStickMenuSidebar()
          return
        ).addClass 'open'
    return

  ###*
  # Корзина
  ###

  $(document).ready ->
    $('#cart').simplerSidebar
      top: 0
      opener: '#toggle-cart'
      attr: 'simplersidebar'
      animation: easing: 'easeOutQuint'
      sidebar:
        align: 'right'
        width: 300
        closingLinks: '.close-sb'
    return
  # Блокировка скроллинга
  $('#toggle-sidebar, #toggle-cart').click ->
    $scrollTop = $('body > .content').scrollTop()
    $('body > .content').bind 'scroll.block', ->
      $(this).scrollTop $scrollTop
      return
    $('body > .content').unbind 'scroll.main'
    $('.ps-scrollbar-y-rail').hide()
    return
  setTimeout (->
    $('* [data-simplersidebar="mask"]').click ->
      console.log 'close'
      $('body > .content').unbind 'scroll.block'
      $('body > .content').bind 'scroll.main', eventScroll
      $('.ps-scrollbar-y-rail').show()
      return
    return
  ), 500

  ###*
  # Изменение количества товара в корзине
  ###

  Shopify.quantityChange()

  ###*
  # Удаление товара их корзины
  ###

  Shopify.removeProduct()

  ###*
  # Обработка формы аутентификации пользователя
  ###

  Shopify.signIn()

  ###*
  # Карусель на странице товара
  ###

  if $('.product-images ul li').length <= 3 && $('.product-images ul li').length > 1
    $('.product-images ul li:last').after $('.product-images ul li').clone()

  $('.product-images ul li').addClass 'hide'

  $('.product-images ul').on 'init', () ->
    $('.product-images ul').imagesLoaded ->
      $('.product-images ul li').removeClass 'hide'
      return
    return

  ###*
  # Добавление товара в корзину
  ###

  $('#AddToCartForm').submit (line_item) ->
    Shopify.addItemFromForm $(this).attr('id'), (line_item) ->
      Shopify.getCart()
      Shopify.onItemAdded line_item
      $('#toggle-cart').click()
      return
    false

  ###*
  # Фиксирование панели продукта при скроллинге
  ###

  # Вычисляем высоту слайдера с изображениями продукта

  calculateProductBlock = ->
    $('.product-images ul').imagesLoaded ->
      heightBlock = $(window).height() - $('.wrap-header-bar').outerHeight() - $('.product .wrap-shop-bar').outerHeight() - parseInt($('.product .product-images').css('padding-top'))
      $('.product .product-images').css height: heightBlock
      $('.product-images ul li img').each (i, e) ->
        if $(e).parent().width() >= $(e).width()
          $(e).css
            'max-height': 'inherit'
            'width': '100%'
        if $(e).height() > heightBlock
          $(e).css
            'max-height': heightBlock
            'width': 'auto'
        return
      $('.product-images ul').css
        'top': 0
        'padding-top': ($('.product-images').height() - $('.product-images ul').height()) / 2

      $('.product-images ul').slick
        centerMode: true
        centerPadding: '0px'
        slidesToShow: 3
        sliderPerRow: 1
        swipeToSlide: true
        arrows: true
        infinite: true
        autoplay: false
        variableWidth: true

      setTimeout ->
        $('.product-images ul img').css 'opacity': 1
      , 1
      return
    #}
    return

  calculateProductBlock()
  $(window).resize ->
    calculateProductBlock()
    return
  if $('.footer-catalog .btn-load-more').length > 0
    $('.footer-catalog .btn-load-more').unbind('click').bind 'click', ->
      loadMore()
      return

  ###*
  # Sign in
  ###

  time = 500

  closeSignIn = ->
    $('[href="/account/login/"]').removeClass 'current'
    $('.wrap-login').removeClass 'visible'
    $('body > .content').removeClass 'mTop'
    # Разблокировка скроллинга
    $('body > .content').unbind 'scroll.block'
    $('body > .content').bind 'scroll.main', eventScroll
    $('.ps-scrollbar-y-rail').show()
    $('body > .content .black-background').animate { opacity: '0' }, 1000, ->
      $('body > .content').find('.black-background').remove()
      # Если IE
      if detectIE()
        $('.wrap-header-bar').css 'position': 'fixed'
      return
    return

  $('[href="/account/login/"]').click (e) ->
    e.preventDefault()
    if $(this).hasClass('current')
      closeSignIn()
    else
      $(this).addClass 'current'
      # Если IE
      if detectIE()
        $('.wrap-header-bar').css 'position': 'absolute'
      $('.wrap-login').addClass 'visible'
      $('body > .content').addClass 'mTop'
      # Блокировка скроллинга
      $scrollTop = $('body > .content').scrollTop()
      $('body > .content').bind 'scroll.block', ->
        $(this).scrollTop $scrollTop
        return
      $('body > .content').unbind 'scroll.main'
      $('.ps-scrollbar-y-rail').hide()
      #Затемняем контент
      $('body > .content').append '<div class=\'black-background\'></div>'
      $('body > .content .black-background').animate({ opacity: '0.5' }, 500).click ->
        closeSignIn()
        return
    return
  $('.wrap-login .close').click (e) ->
    closeSignIn()
    return
  $(document).keyup (e) ->
    if e.keyCode == 27
      closeSignIn()
    return

  ###*
  # Custom input number
  ###

  $('input[type=\'number\']').stepper()

  ###*
  # Панель поиска
  ###

  $(document).ready ->
    $('#search').simplerSidebar
      top: 0
      opener: '#toggle-search'
      attr: 'simplersidebar'
      animation: easing: 'easeOutQuint'
      sidebar:
        align: 'right'
        width: 300
        closingLinks: '.close-sb'
    return

  ###*
  # Обработчик формы поиска
  ###

  Shopify.search()

  ###*
  # Обработчик нажатия на строку с заказом в списке заказов
  ###

  $('.list-order table tbody tr:not(.select)').click ->
    if !$(this).hasClass('select')
      $('.list-order table tbody tr.select').removeClass 'select'
      $(this).addClass 'select'
      $(this).next().removeClass('hide').addClass 'select'
      $(this).next().next().removeClass('hide').addClass 'select'
    else
      $('.list-order table tbody tr.select').removeClass 'select'
      $(this).next().addClass('hide').removeClass 'select'
      $(this).next().next().addClass('hide').removeClass 'select'
    return

  ###*
  # Табы на странице аакаунта
  ###

  if $('.wrap-link-tabs').length > 0
    if window.location.hash
      hash = window.location.hash
      #Puts hash in variable, and removes the # character
      $('.wrap-link-tabs li').removeClass 'current'
      $('.wrap-link-tabs li a[href*="' + hash + '"]').parent().addClass 'current'
      $('.tab').removeClass 'tab-active'
      $(hash).addClass 'tab-active'
      # Disable hash jump
      $('.ps-container').scrollTop 0
    $('.wrap-link-tabs li a').unbind('click').bind 'click', (e) ->
      `var hash`
      if $(this).get(0).hash
        e.preventDefault()
        hash = $(this).get(0).hash
        $('.wrap-link-tabs li').removeClass 'current'
        $(this).parent().addClass 'current'
        window.location.hash = hash
        $('.tab').removeClass 'tab-active'
        $(hash).addClass 'tab-active'
        # Disable hash jump
        $('.ps-container').scrollTop 0
      return

  ###*
  # Сохрание формы на странице аккаунта
  ###

  if $('.form-account').length > 0
    $('.form-account .btn').unbind('click').bind 'click', ->
      $('.form-account form').each (i, e) ->
        $form = $(e)
        $.post $form.attr('action').replace(/^.*\/\/[^\/]+/, ''), $form.serialize(), (data) ->
          console.log data
          return
        return
      return

  ###*
  # Подгрузка регионов для каждой страны
  ###

  if $('*[name="address[country]"]').length > 0

    cityChange = ->
      provinces = $('*[name="address[country]"]').find('option:selected').data('provinces')
      $('*[name="address[province]"] option').remove()
      i = 0
      while i < provinces.length
        value = provinces[i][0]
        $('*[name="address[province]"]').append '<option value="' + value + '">' + value + '</option>'
        i++
      # Выбор города по умолчанию
      $provinceDefault = $('*[name="address[province]"]').data('default')
      if $provinceDefault.length > 0
        $('*[name="address[province]"] option[value="' + $provinceDefault + '"]').attr 'selected', 'selected'
      return

    # Выбор страны по умолчанию
    $countryDefault = $('*[name="address[country]"]').data('default')
    if $countryDefault.length > 0
      $('*[name="address[country]"] option[value="' + $countryDefault + '"]').attr 'selected', 'selected'
    # Загрузка городов при загрузке страницы
    cityChange()
    # Загрузка городов при изменении страны
    $('*[name="address[country]"]').change ->
      cityChange()
      return

  ###*
  # Отправка формы забыл пароль
  ###

  if $('#RecoverPasswordForm').length > 0
    $form = $('#RecoverPasswordForm form')
    #Отключение html5 валидации
    $form.attr 'novalidate', 'novalidate'
    $form.unbind('submit').bind 'submit', ->
# Валидация email

      validateEmail = (email) ->
        re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        re.test email

      if !validateEmail($('#RecoverPasswordForm input[type="email"]').val())
        $('#RecoverPasswordForm input[type="email"]').addClass 'error'
      else
        $('#RecoverPasswordForm input[type="email"]').removeClass 'error'
        $.post $form.attr('action'), $form.serialize(), (data) ->
          $('#RecoverPasswordForm form').hide()
          $('#RecoverPasswordForm .message').removeClass 'hide'
          setTimeout (->
            hideRecoverPasswordForm()
            $('#RecoverPasswordForm form').show()
            $('#RecoverPasswordForm .message').addClass 'hide'
            return
          ), 5000
          return
      false

  ###*
  # Открепление от низа социальных кнопок если содержимое sidebar не влезает
  ###

  socialStickMenuSidebar = ->
    console.log 'content height = ' + parseInt($('.lists-menu').height()) + parseInt($('.sidebar-wrapper .header').height())
    console.log 'window height = ' + $(window).height()
    if parseInt($('.lists-menu').height()) + parseInt($('.sidebar-wrapper .header').height()) + 100 > $(window).height()
      $('.sidebar-wrapper .social').addClass 'no-stick'
    else
      $('.sidebar-wrapper .social').removeClass 'no-stick'
    return

  socialStickMenuSidebar()
  $(window).bind 'resize', ->
    socialStickMenuSidebar()
    return

  ###*
  # Открепление от низа кнопки checkout если содержимое sidebar не влезает
  ###

  cartStickMenuSidebar = ->
    console.log 'content height = ' + parseInt($('.cart-list').height()) + parseInt($('#cart-wrapper .header').height())
    console.log 'window height = ' + $(window).height()
    if parseInt($('.cart-list').height()) + parseInt($('#cart-wrapper .header').height()) + 240 > $(window).height()
      $('#cart-wrapper .block_total').addClass 'no-stick'
    else
      $('#cart-wrapper .block_total').removeClass 'no-stick'
    return

  cartStickMenuSidebar()
  $(window).bind 'resize', ->
    cartStickMenuSidebar()
    return

  ###*
  # Переключение кллекий на странице каталога
  ###

  listCollectionClick = ->
    $('.list ul li a').click (e) ->
      e.preventDefault()
      if !$(this).parent().hasClass('current')
        url = $(this).attr('href')
        $('.list ul li').removeClass 'current'
        $(this).parent().addClass 'current'
        if window.history.pushState
          window.history.pushState '', '', url
        $.get url, {}, (data) ->
          $('.breadcrumbs').empty().html $(data).find('.breadcrumbs').html()
          $('section.catalog > h2').empty().text $(data).find('section.catalog > h2').text()
          $('.items-catalog').empty().html $(data).find('.items-catalog').html()
          $('.footer-catalog').empty().html $(data).find('.footer-catalog').html()
          $('.items-catalog li').find('canvas').addClass 'new'

          $('.items-catalog ul').masonry
            columnWidth: '.sizer'
            percentPosition: true
            itemSelector: 'li'
            'containerStyle': position: 'relative'
            isAnimated: false
            transitionDuration: 0

          $('.items-catalog ul').data('masonry').on 'layoutComplete', ->
            $('.items-catalog ul li').removeClass 'hide'

          # Обрезка фотографий в каталоге
          cropImagesCatalog $('.items-catalog ul li canvas.new')
          if $('.footer-catalog .btn-load-more').length > 0
            $('.footer-catalog .btn-load-more').unbind('click').bind 'click', ->
              loadMore()
              return
          return
      return
    return

  listCollectionClick()

  ###*
  # Paypalbutton в Корзине
  ###
  if  $('.paypal-button').length > 0
    $('.paypal-button').click (e) ->
      e.preventDefault()
      $('#your-shopping-cart form.cart').append('<input type="hidden" name="goto_pp" value="paypal" />')
      $('#your-shopping-cart form.cart').submit()
      return

  ###*
  # Парсинг параметров товара из его описания
  ###

  if $('.product-info').length > 0
    parse = [
      '#details'
      '#options'
    ]
    descriptionString = $('.product-info .text .inner-text').text()
    info = ''
    detailsArray = {}
    optionsArray = []
    if descriptionString.indexOf(parse[0]) > -1 or descriptionString.indexOf(parse[1]) > -1
      if descriptionString.indexOf(parse[0]) > -1
        detailsString = ''
        if descriptionString.indexOf(parse[1]) > -1
          detailsString = descriptionString.substring(descriptionString.indexOf(parse[0]) + parse[0].length, descriptionString.indexOf(parse[1])).trim()
        else
          detailsString = descriptionString.substring(descriptionString.indexOf(parse[0]) + parse[0].length, descriptionString.length).trim()
        detailsArray = detailsString.split('\n').map((s) ->
          s.trim()
        ).map((s) ->
          {
            'key': s.substring(0, s.indexOf(':'))
            'value': s.substring(s.indexOf(':') + 1, s.length).trim()
          }
        )
      if descriptionString.indexOf(parse[1]) > -1
        optionsString = ''
        if descriptionString.indexOf(parse[0]) > -1 and descriptionString.indexOf(parse[0]) > descriptionString.indexOf(parse[1])
          optionsString = descriptionString.substring(descriptionString.indexOf(parse[1]) + parse[1].length, descriptionString.indexOf(parse[0])).trim()
        else
          optionsString = descriptionString.substring(descriptionString.indexOf(parse[1]) + parse[1].length, descriptionString.length).trim()
        optionsArray = optionsString.split('\n').map((s) ->
          s.replace('-', '').trim()
        ).filter((s) ->
          s.length > 0
        )
      if descriptionString.indexOf(parse[0]) > descriptionString.indexOf(parse[1]) and descriptionString.indexOf(parse[1]) > -1
        info = descriptionString.substring(0, descriptionString.indexOf(parse[1]))
      else
        if descriptionString.indexOf(parse[0]) > -1
          info = descriptionString.substring(0, descriptionString.indexOf(parse[0]))
        else
          info = descriptionString.substring(0, descriptionString.indexOf(parse[1]))
    else
      info = descriptionString
    if detailsArray.length > 0
      $('section.product .wrap-product-info .product-info .description .details ul li').remove()
      i = 0
      while i < detailsArray.length
        $('section.product .wrap-product-info .product-info .description .details ul').append '<li><div class="head">' + detailsArray[i].key + '</div><div class="value">' + detailsArray[i].value + '</div></li>'
        i++
    else
      $('section.product .wrap-product-info .product-info .description .details').hide()
    if optionsArray.length > 0
      $('section.product .wrap-product-info .product-info .options ul li').remove()
      i = 0
      while i < optionsArray.length
        $('section.product .wrap-product-info .product-info .options ul').append '<li><span>&mdash;</span>' + optionsArray[i] + '</li>'
        i++
    else
      $('section.product .wrap-product-info .product-info .options').hide()
    $('section.product .wrap-product-info .product-info .text .inner-text').empty().append '<p>' + info + '</p>'
    $('.product-info .text').css 'display': 'inline-block'

  return

# ---
# generated by js2coffee 2.1.0
