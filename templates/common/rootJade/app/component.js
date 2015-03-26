// fg-component-injector use:
// Put this on your page:
// <script id="script#<%= appname %>Injector" src="{{project/component_url}}/component.js"></script>
// Then run: `grunt deploy:ENV`


// TODO add coDependant Script...



// The result of build:js scripts/config.js
{{config.js}}

// The result of build:js(.tmp) scripts/main.js
{{main.js}}


var <%= appname %> = {};

<%= appname %>.injector = {
    template: '<div ng-app="<%= scriptAppName %>" id="ng-app">{{main.html}}</div>',

    run: function(){
        // Find the script tag on this page
        var injection_script_tag = $("script#<%= appname %>Injector");
        // Add the template before this point
        $(<%= appname %>.injector.template).insertBefore(injection_script_tag)
    }
};


$(document).ready(function($) {
    <%= appname %>.injector.run();
});