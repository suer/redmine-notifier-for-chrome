/**
 * jQuery plugin to use webkit Notifications
 * @author RAISIN
 * @lisence MIT Lisence
 * @version 0.0.1
 */
(function($){
    $.fn.desktopNotifyAddPermission = function(options) {
        this.click(function(e) {
            if (window.webkitNotifications) {
                if (window.webkitNotifications.checkPermission()) {
                    window.webkitNotifications.requestPermission();
                }
            }
        });
        return this;
    };
    $.fn.desktopNotify = function(options) {
        var defaults = {
            picture : "",
            title : "",
            text : "",
            ondisplay : ondisplay,
            onclose : onclose,
            fade : false
        };

        var ondisplay = function() {};
        var onclose = function() {};

        var setting = $.extend(defaults, options);
        if (window.webkitNotifications) {
            if (!window.webkitNotifications.checkPermission()) {
                var popup = window.webkitNotifications.createNotification(
                    setting.picture,
                    setting.title,
                    setting.text
                );
                popup.ondisplay = setting.ondisplay;
                popup.onclose = setting.onclose;
                popup.show();
            }
        }

        return this;
    };
})(jQuery);
