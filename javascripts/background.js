$(function(){
    var redmineApikey = localStorage["redmine-api-key"];
    var websocketUrl   = localStorage["websocket-url"];

    console.log(websocketUrl);

    if (websocketUrl == null || redmineApikey == null) {
        return;
    }

    var POLLING_TIME = 60 * 1000;

    $.ajaxSetup({
        "error": function() {
            $.fn.desktopNotify(
                {
                    picture: getIcon("FAILURE"),
                    title: "Failed to access to redmine",
                    text : websocketUrl
                }
            );
        }
    });

    function getIcon(result) {
        var url = "images/blue.png";
        if (result == "UNSTABLE") {
            url = "images/yellow.png";
        } else if (result == "FAILURE") {
            url = "images/red.png";
        }
        return url;
    }

    function getColor(result) {
        var color = [0, 0, 255, 200];
        if (result == "UNSTABLE") {
            color =  [255, 255, 0, 200];
        } else if (result == "FAILURE") {
            color = [255, 0, 0, 200];
        }
        return color;
    }

    // replace popup event
    chrome.browserAction.setPopup({popup : ""});
    chrome.browserAction.onClicked.addListener(function(tab) {
        window.open(websocketUrl);
    });

    function fetch(url) {
        $.getJSON(url, function(json, result) {
            if (result != "success") {
                return;
            }
            if (prevBuild != json.number) {
                prevBuild = json.number;
                chrome.browserAction.setBadgeText({text: String(json.number)});
                chrome.browserAction.setBadgeBackgroundColor({color: getColor(json.result)});
                $.fn.desktopNotify(
                    {
                        //picture: getIcon(json.result),
                        title: json,
                        text : json
                    }
                );
            }
        });
    }

    function popup(json) {
        chrome.browserAction.setBadgeText({text: "Redmine"});
        //chrome.browserAction.setBadgeBackgroundColor({color: getColor(json.result)});
        $.fn.desktopNotify(
            {
                //picture: getIcon(json.result),
                title: json.title,
                text :json.message
            }
        );

    }

    var retryTime = 2500;
    function bind(wsUrl) {
        var ws = $("<div />");

        ws.bind("websocket::connect", function() {
            console.log('opened connection');
            retryTime = 5000;
        });

        ws.bind("websocket::message", function(_, obj) {
            console.log('receive message ' + obj);
            popup(obj);
        });

        ws.bind("websocket::error", function() {
            $.fn.desktopNotify(
                {
                    picture: getIcon("FAILURE"),
                    title: "Failed to access to Redmine Websocket Notifier. Please check your websocket URL",
                    text : wsUrl
                }
            );
        });

        // auto reconnect
        ws.bind('websocket::close', function() {
            console.log('closed connection');
            retryTime *= 2;
            setTimeout(function() {
                bind(websocketUrl);
            }, retryTime);
        });

        ws.webSocket({
            entry : wsUrl
        });
    }

    bind(websocketUrl);
});
