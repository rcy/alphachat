var g_fbqa;
function fb_query_args() {
    var assoc = {};
    var qs = unescape(location.search.substring(1));
    var keyValues = qs.split('&');
    for (var i in keyValues) {
        var kv = keyValues[i].split('=');
        if (kv[0].match(/^fb_sig/))
            assoc[kv[0]] = kv[1];
    }
    return assoc;
}

function get(url, onSuccess, onError) {
    $.ajax({url: url+'?'+$.param(g_fbqa),
            type: "GET",
            dataType: "json",
            success: onSuccess,
            error: onError});
}

function post(url, payload, onSuccess, onError) {
    args = g_fbqa
    $.extend(args, payload);
    $.ajax({url: url,
            type: "POST",
            data: $.param(args),
            dataType: "json",
            success: onSuccess,
            error: onError});
}
function html(url, selector, onSuccess) {
    $.ajax({url: url+'?',
            type: "GET",
            dataType: "json",
            success: function(r) {
                selector.html(r.html);
                if (onSuccess) onSuccess();
            },
            error: function(xhr) {
                selector.html(xhr.responseText);
            }});
}

$(document).ready(function() {
    g_fbqa = fb_query_args();
    if (!window.console) window.console = {};
    if (!window.console.log) window.console.log = function() {};

    $("#go_chat").live("click", function() {
        html('/lobby.html',$("#content"),lobby.wait);
        return false;
    });
    $("#scoreboard").live("click", function() {
        $("#button_box").css("display", "none");
        $("#scoreboard_box").css("display", "inline");
        return false;
    });
    $("#menu").live("click", function() {
        $("#help_box").css("display", "none");
        $("#scoreboard_box").css("display", "none");
        $("#button_box").css("display", "inline");
    });

    $("#inputform").live("submit", function() {
        chat.sendMessage($(this));
        return false;
    });

    // start us off by loading the menu
    html('/mainmenu.html', $("#content"));
});

var lobby = {
    wait: function() {
        $("#lobby_box").append(". ");
        // send message to server to indicate we are waiting to play
        get('/a/lobby/wait/', lobby.onSuccess, lobby.onError);
    },
    onSuccess: function(response) {
        if (response) {
            chat.prepare(response);
        } else {
            // server time-out, go again
            lobby.wait();
        }
    },
    onError: function(xhr,status) {
        alert('lobby wait: ' + status);
    }
}

var chat = {
    prepare: function() {
        html("/chat.html", $("#content"), chat.join);
    },
    join: function() {
        get('/a/room/join/',
            function(r) {
                $("#chatters").html(r.status_html);
                chat.poll();
            })
    },

    poll: function() {
        get('/a/message/updates/', chat.onPollSuccess, chat.onPollError);
    },
    onPollSuccess: function(response) {
        m = response.messages
        for (i in m) {
            chat.displayMessage(m[i]);
        }
        chat.poll();
    },
    onPollError: function(xhr) {
        chat.displayMessage(xhr.responseText);
        //alert('onPollError');
    },

    sendMessage: function(form) {
        args = g_fbqa
        nm = $("#inputbar")
        if (nm.val() != "") {
            args.body = nm.val();
            // todo replace
            $.ajax({url: "/a/message/new/",
                    data: $.param(args),
                    dataType: "json",
                    type: "POST",
                    success: chat.onSendMessageSuccess,
                    error: function(xhr,status) { 
                        alert('sendmessage error'+status);
                    }});
            nm.val("");
        }
    },
    onSendMessageSuccess: function(response) {
        //alert(response.html);
    },

    displayMessage: function(message) {
        var div = $("#chat")
        div.append(message.html);
        // certain browsers have a bug such that scrollHeight is too small
        // when content does not fill the client area of the element
        var scrollHeight = Math.max(div[0].scrollHeight, div[0].clientHeight);
        div[0].scrollTop = scrollHeight - div[0].clientHeight;
    },
}
