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

    // start us off by loading the menu
    html('/mainmenu.html', $("#content"),
         function() {
             $("#go_chat").bind("click", lobby.setup);
         });
});

// budget generic error handler
function on_error(xhr, status) { alert(status); }

var lobby = {
    setup: function() {
        // setup the page, then find a room
        html('/lobby.html', $("#content"), lobby.find_room);
    },
    find_room: function() {
        $("#lobby_box").append(". ");
        // send message to server to indicate we are waiting to play
        get('/a/lobby/find_room/', lobby.find_room_success, on_error);
    },
    find_room_success: function(response) {
        if (response) {
            roomid = response;
            chat.setup(roomid);
        } else {
            // server time-out, go again
            lobby.find_room();
        }
    }
}

var chat = {
    room: {},

    setup: function(room_id) {
        chat.room.id = room_id;
        // request the chat page
        html("/chat.html", $("#content"), 
             function() {
                 // show the room id in the chat window
                 $('#chat').html(
                     '<div>joined: ' + chat.room.id + '</div>');

                 // show the chatters in the sidebar
                 get('/a/room/chatters_html/', 
                     function(r) { $("#chatters").html(r.html); });

                 // wire up the form submit event to send messages to server
                 $('#inputform').bind('submit', 
                                      function() { 
                                          chat.send_message_form($(this)); return false; 
                                      });

                 // start chatting
                 chat.join();
             });
    },
    join: function() {
        chat.send_message("JOIN");
        chat.poll();
    },

    poll: function() {
        get('/a/message/updates/', chat.onPollSuccess, chat.onPollError);
    },
    onPollSuccess: function(response) {
        m = response.messages;
        for (i in m) {
            chat.displayMessage(m[i]);
        }
        chat.poll();
    },
    onPollError: function(xhr) {
        chat.displayMessage(xhr.responseText);
        //alert('onPollError');
    },

    send_message_form: function(form) {
        input = $("#inputbar")// TODO: should be able to get this from the FORM arg
        if (input.val() != "") {
            chat.send_message(input.val());
            input.val("");
        }
    },
    send_message: function(msg) {
        var args = {};
        args.body = msg;
        post("/a/message/new/", args, 
             chat.onSendMessageSuccess,
             on_error);
    },
    onSendMessageSuccess: function(response) {
        // the response has the message if we want to do something
        // with it here
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
