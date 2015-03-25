var com = {
    template: '<div ng-app="<%= scriptAppName %>" id="ng-app">{{app/views/main.html}}</div>',

    run: function() {
        console.log ("running");
    }
};

com.run();