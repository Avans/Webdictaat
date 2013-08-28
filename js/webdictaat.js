$(function() {
    function livepreview() {
        $('.livepreview').each(function(i, code) {
            code = $(code);
            //Make a copy of the code element as a textarea
            var textarea = $('<textarea class="live_preview"></textarea>');
            code.after(textarea)
            textarea.copyCSS(code)
            textarea.text(code.text());

            // Create a live preview of the textarea
            var preview = $('<iframe class="live_preview"></iframe>');
            textarea.before(preview);
            preview.height(textarea.height());
            function update(e) {
                text_area = this;
                if(text_area.length)
                  text_area = text_area[0];

                preview.contents().find('body').html('<base target="_top" />' + text_area.value);
            };

            textarea.keyup(update);
            textarea.change(update);
            update.call(textarea);

            textarea.after($('<p style="clear: both"></p>'));

            // Remove original element
            code.detach();
        });
    };

    var accordion = $('#theory').accordion({
        collapsible: true,
        active: false,
        heightStyle: "content",
        navigation: true
    });

    // Function to navigate to another (external) page
    // Please use for all internal navigation
    function navigate(url) {
        if(url.match("^https?://")) {
            // Navigate to external page
            window.location = url;
        } else if(url.length > 1) {
            // Load content
            var dir_name = url.substring(0, url.lastIndexOf('/'));
            $('base').attr('href', window.location.pathname + 'assignments' + '/');

            $('#content').load(window.location.pathname + url, function() {
                livepreview();
            });
            $('html, body').scrollTop(0);

            // Update navigation
            $('.nav li').removeClass('active')
            $('.nav li:has(> a[href="'+url+'"])').addClass('active');

            menu_index = $('#theory > li:has(a[href="'+url+'"])').index() - 1;
            if(menu_index >= 0)
                accordion.accordion('option', 'active', menu_index);

            // Add to url
            window.location.hash = '/' + url;
        }
    };
    $('.nav a').click(function() {
        window.location.hash = '/' + $(this).attr('href');
        return false;
    })

    // Add little down arrows to menus with submenus
    $('.nav li:has(ol)').children('a').append('<i class="icon-chevron-down pull-right"></i>');

    navigate(window.location.hash.replace('#/', ''))

    $(window).on('hashchange', function(e) {
        navigate(window.location.hash.substring(2))
        console.log(window.location.hash)
        //console.log(window.);
    });

    $.fn.getStyles = function(only, except){

        // the map to return with requested styles and values as KVP
        var product = {};

        // the style object from the DOM element we need to iterate through
        var style;

        // recycle the name of the style attribute
        var name;

        // if it's a limited list, no need to run through the entire style object
        if(only && only instanceof Array){

            for(var i = 0, l = only.length; i < l; i++){
                // since we have the name already, just return via built-in .css method
                name = only[i];
                product[name] = this.css(name);
            }

        } else {

            // otherwise, we need to get everything
            var dom = this.get(0);

            // standards
            if (window.getComputedStyle) {

                // convenience methods to turn css case ('background-image') to camel ('backgroundImage')
                var pattern = /\-([a-z])/g;
                var uc = function (a, b) {
                        return b.toUpperCase();
                };
                var camelize = function(string){
                    return string.replace(pattern, uc);
                };

                // make sure we're getting a good reference
                if (style = window.getComputedStyle(dom, null)) {
                    var camel, value;
                    // opera doesn't give back style.length - use truthy since a 0 length may as well be skipped anyways
                    if (style.length) {
                        for (var i = 0, l = style.length; i < l; i++) {
                            name = style[i];
                            camel = camelize(name);
                            value = style.getPropertyValue(name);
                            product[camel] = value;
                        }
                    } else {
                        // opera
                        for (name in style) {
                            camel = camelize(name);
                            value = style.getPropertyValue(name) || style[name];
                            product[camel] = value;
                        }
                    }
                }
            }
            // IE - first try currentStyle, then normal style object - don't bother with runtimeStyle
            else if (style = dom.currentStyle) {
                for (name in style) {
                    product[name] = style[name];
                }
            }
            else if (style = dom.style) {
                for (name in style) {
                    if (typeof style[name] != 'function') {
                        product[name] = style[name];
                    }
                }
            }

        }

        // remove any styles specified...
        // be careful on blacklist - sometimes vendor-specific values aren't obvious but will be visible...  e.g., excepting 'color' will still let '-webkit-text-fill-color' through, which will in fact color the text
        if(except && except instanceof Array){
            for(var i = 0, l = except.length; i < l; i++){
                name = except[i];
                delete product[name];
            }
        }

        // one way out so we can process blacklist in one spot
        return product;

    };

    // sugar - source is the selector, dom element or jQuery instance to copy from - only and except are optional
    $.fn.copyCSS = function(source, only, except){
        var styles = $(source).getStyles(only, except);
        this.css(styles);
    };
});