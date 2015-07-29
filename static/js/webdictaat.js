$(function() {
    var accordion = $('#theory').accordion({
        collapsible: true,
        active: false,
        heightStyle: "content",
        navigation: true
    });

    // Add little down arrows to menus with submenus
    $('.nav li:has(ol)').children('a').append('<i class="icon-chevron-down pull-right"></i>');
});