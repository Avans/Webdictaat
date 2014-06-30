$(function() {
    function livepreview() {
        $('.livepreview').each(function(i, code) {
            code = $(code);
            var css_span = code.find('.css');
            var has_css = css_span.length > 0;

            if(has_css) {
                css_span.html(css_span.html().trim())
                var css_height = css_span.height() + 5;
                css_span.detach();
            }

            code.html(code.html().trim());

            var textareas = $('<div></div>');
            code.after(textareas);

            //Make a copy of the code element as a textarea
            if(has_css) {
                var css_textarea = $('<textarea class="live_preview css"></textarea>');
                textareas.append(css_textarea);
                css_textarea.text(css_span.text().trim())
                css_textarea.height(css_height);
            }

            var html_textarea = $('<textarea class="live_preview html"></textarea>');
            textareas.append(html_textarea);

            html_textarea.text(code.text().trim());
            code.width(html_textarea.width());
            html_textarea.height(code.height());

            html_textarea.data('html_textarea', html_textarea);
            html_textarea.data('css_textarea', css_textarea);

            if(has_css) {
                css_textarea.data('html_textarea', html_textarea);
                css_textarea.data('css_textarea', css_textarea);
            }

            // Create a live preview of the textarea
            var preview = $('<iframe class="live_preview"></iframe>');
            textareas.after(preview);

            var height = html_textarea.height();
            if(has_css)
                height += css_textarea.height() + 17;
            preview.height(height);

            function update(e) {
                var base = dirname(window.location.hash.substring(2));
                var html = '<base target="_top" href="http://'+window.location.host+window.location.pathname+base+'/"/>';

                if($(this).data('css_textarea'))
                    html += '<style>' + $(this).data('css_textarea')[0].value + '</style>';

                html += $(this).data('html_textarea')[0].value;

                preview.contents().find('body').html(html);
                preview.contents().find('a').mouseup(linkmouseup).click(function() {return this.doclick;});
            };

            html_textarea.keyup(update);
            html_textarea.change(update);
            update.call(html_textarea);

            if(has_css) {
                css_textarea.keyup(update);
                css_textarea.change(update);
                 update.call(css_textarea);
            }

            window.setTimeout(function() {
                update.call(html_textarea);
            }, 100);

            preview.after($('<p class="live_preview"></p>'));

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
    function dirname(path) {
        return path.substring(0, path.lastIndexOf('/'));
    }
    // Function to navigate to another (external) page
    // Please use for all internal navigation
    function navigate(url) {
        if(url.match("^https?://")) {
            // Navigate to external page
            window.location = url;
        } else if(url.length > 1) {
            // Load content
            $('#content').load(url, function(responseText, textStatus, req) {
                if(textStatus == 'error') {
                    window.location = url;
                }
                livepreview();

                // Prepend the directory name to all links in the content
                function prependBase(index, value) {
                    return dirname(url) + '/' + value;
                };
                $('#content img').attr('src', prependBase);
                $('#content a:not([href*="://"],[href^="mailto:"],[href^="#"])').attr('href', prependBase);
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
    var linkmouseup = function(e) {
        // Check if it is a link to a local page
        var regex = '^' + window.location.origin + window.location.pathname + '([/_a-zA-Z0-9]+\\.html)$';

        var match = this.href.match(regex);
        if(match) {
            var hash_part = '/' + match[1];
            if(e.which == 2) {
                // Middle mouse button
                window.open(window.location.origin + window.location.pathname + '#' + hash_part, '_blank');
            } else {
                // Normal mouse button
                window.location.hash = hash_part;
            }
            this.doclick = false;
        } else {
            this.doclick = true;
        }
    };

    $('body')
        .delegate('a', 'mouseup', linkmouseup)
        .delegate('a', 'click', function() {
            return this.doclick;
        });

    navigate(window.location.hash.replace('#/', ''))

    $(window).on('hashchange', function(e) {
        navigate(window.location.hash.substring(2))
    });

    // Add little down arrows to menus with submenus
    $('.nav li:has(ol)').children('a').append('<i class="icon-chevron-down pull-right"></i>');



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