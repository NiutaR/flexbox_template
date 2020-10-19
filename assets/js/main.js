(function ($) {

  $(document).ready(function() {
      $('body').niceScroll();
  });

  $('.header-menu__btn').on('click', function() {
    $(this).toggleClass('active');
    $('.header-menu__list').toggleClass('active');
  });

})(jQuery);