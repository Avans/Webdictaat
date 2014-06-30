$(function() {
    function livepreview() {
        $('.livepreview').each(function(i, code) {
            code = $(code);
            var css_span = code.find('.css');
            var has_css = css_span.length > 0;

            if(has_css) {
                css_span.html(css_span.html().trim().replace(/&nbsp;$/, ''))
                var css_height = css_span.height() + 5;
                css_span.detach();
            }
            code.html(code.html().trim().replace(/&nbsp;$/, ''));

            var editors = $('<div class="editors"></div>');
            code.after(editors);

            var get_editor = function(element) {
                var editor = ace.edit(element);
                editor.setTheme("ace/theme/chrome");
                editor.setHighlightActiveLine(false);
                editor.setShowFoldWidgets(false);
                editor.setShowPrintMargin(false);
                editor.session.setUseWrapMode(true);
                editor.renderer.setShowGutter(false);
                editor.renderer.setScrollMargin(8, 8, 0, 0);
                editor.renderer.setPadding(10);
                return editor;
            };

            //Make a copy of the code element as an editor
            if(has_css) {
                var css_editor = $('<code class="editor css"></code>')
                    .height(css_height)
                    .html(css_span.html());

                editors.append(css_editor);
                ace_css_editor = get_editor(css_editor[0]);
                ace_css_editor.getSession().setMode("ace/mode/css");
            } else {
                ace_css_editor = undefined;
            }

            var html_editor = $('<code class="editor html"></code>')
                .height(code.height())
                .html(code.html());
            editors.append(html_editor);


            ace_html_editor = get_editor(html_editor[0]);
            ace_html_editor.getSession().setMode("ace/mode/html");

            // Create a live preview of the textarea
            var preview = $('<iframe class="live_preview"></iframe>');
            editors.after(preview);

            var height = html_editor.height();
            if(has_css)
                height += css_editor.height() + 17;
            preview.height(height);

            function update_function(ace_html_editor, ace_css_editor, preview) {
                return function() {
                    var base = dirname(window.location.hash.substring(2));
                    var html = '<base target="_top" href="http://'+window.location.host+window.location.pathname+base+'/"/>';

                    if(has_css)
                        html += '<style>' + ace_css_editor.getSession().getValue() + '</style>';

                    html += ace_html_editor.session.getValue();

                    preview.contents().find('body').html(html);
                    preview.contents().find('a').mouseup(linkmouseup).click(function() {return this.doclick;});
                }
            };
            var update = update_function(ace_html_editor, ace_css_editor, preview);
            ace_html_editor.on('change', update);
            if(has_css)
                ace_css_editor.on('change', update);

            update();
            window.setTimeout(update, 500);

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