
var app = angular.module('webs1', ['PointyPony', 'ui.router']);

app.constant('appConfig', {
  courseToken: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.IldlYnMxIg.uGpO7JypD9I6gKr-n6pW_J8loElFd0Elt2MY-8niG0o",
});

app.config(function($stateProvider, $httpProvider) {

    $stateProvider
    .state('home', {
        url: '/',
        templateUrl: 'home.html'
    })
    .state('page', {
        url: '/{url:.+}',
        template: '<div ng-include="url" updatelinks></div>',
        controller: function($scope, $stateParams) {
            $scope.url = $stateParams.url;
        }
    });
});

app.directive('updatelinks', function($compile) {
    return {
        link: function(scope, element) {
            var links = element.find('a').each(function(a) {
                var href = $(this).attr('href');
                if(!$(this).hasClass('no_ajax') && href.indexOf('http') !== 0) {
                    $(this).attr('href', '#/'+href);
                }
            });

        }
    };
});

function livepreview(code_element) {
    function dirname(path) {
        return path.substring(0, path.lastIndexOf('/'));
    }

    code = $(code_element);
    var css_span = code.find('.css');
    var has_css = css_span.length > 0;
    var inputs = $();

    if(has_css) {
        css_span.html(css_span.html().trim().replace(/&nbsp;$/, ''));
        inputs = css_span.find('select,input');
        inputs.each(function(i, el) {
            $(el).parent().css('position', 'relative');
            $(el).css('top', $(el).position().top + 8);
            var placeholder = $('<span class="placeholder"></span>');
            placeholder.data('input', el);
            $(el).replaceWith(placeholder);
        }).data('template', css_span);
        var css_height = css_span.outerHeight();
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
            .css('height', css_height + 8 + 8 + 1 + 5)
            .html(css_span.html());

        editors.append(css_editor);
        ace_css_editor = get_editor(css_editor[0]);
        ace_css_editor.getSession().setMode("ace/mode/css");
        inputs.data('editor', ace_css_editor);
    } else {
        ace_css_editor = undefined;
    }

    var html_editor = $('<code class="editor html"></code>')
        .css('height', code.outerHeight())
        .html(code.html());
    editors.append(html_editor);

    ace_html_editor = get_editor(html_editor[0]);
    ace_html_editor.getSession().setMode("ace/mode/html");

    // Create a live preview of the textarea
    var preview = $('<iframe class="live_preview"></iframe>');
    editors.after(preview);

    var height = html_editor.outerHeight() - 2;
    if(has_css)
        height += css_editor.outerHeight();
    preview.height(height);

    function update_function(ace_html_editor, ace_css_editor, preview) {
        return function() {
            var base = dirname(window.location.hash.substring(2));
            var head = '<base target="_top" href="http://'+window.location.host+window.location.pathname+base+'/">';

            if(has_css)
                head += '<style>' + ace_css_editor.getSession().getValue() + '</style>';

            var body = ace_html_editor.session.getValue();

            preview.contents().find('head').html(head);
            preview.contents().find('body').html(body);
            preview.contents().find('a').click(function() {return this.doclick;});
        }
    };
    var update = update_function(ace_html_editor, ace_css_editor, preview);
    ace_html_editor.on('change', update);
    if(has_css)
        ace_css_editor.on('change', update);

    update();
    window.setTimeout(update, 1000);

    preview.after($('<p class="live_preview"></p>'));

    // Add event handlers to the inputs
    function input_change() {
        var editor = $(this).data('editor');
        var template = $(this).data('template');
        template = template.clone(true);
        template.find('.placeholder').each(function(i, el) {
            $(this).replaceWith($($(this).data('input')).val());
        });

        editor.session.setValue(template.text());
    }
    inputs.on('input', input_change).on('change', input_change);
    if(inputs.length > 0) {
        input_change.call(inputs[0]);
        window.setTimeout(function() {
            input_change.call(inputs[0]);
        }, 1000);
    }

    // Remove original element
    code.detach();

    if(has_css) {
        css_editor.append(inputs);
    }
}

app.directive('livepreview', function() {
    return {
        restrict: 'C',
        link: function(scope, element, attrs) {
            livepreview(element[0]);

        }
    }
})