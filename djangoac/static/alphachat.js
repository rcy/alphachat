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

function add_slash(url) {
    if (url[url.length-1] == '/') return url;
    return url + '/';
}

function get(url, onSuccess, onError) {
    $.ajax({url: add_slash(url)+'?'+$.param(g_fbqa),
            type: "GET",
            dataType: "json",
            cache: false,
            timeout: 50000,
            success: onSuccess,
            error: onError});
}

function post(url, args, onSuccess, onError) {
    $.extend(args, g_fbqa);
    $.ajax({url: add_slash(url),
            type: "POST",
            data: $.param(args),
            dataType: "json",
            success: onSuccess,
            error: onError});
}
function html(url, selector, onSuccess) {
    url = add_slash(url);
    $.ajax({url: add_slash(url),
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
                 get('/a/room/chatters_html/'+chat.room.id, 
                     function(r) { $("#chatters").html(r.html); });

                 // wire up the form submit event to send messages to server
                 $('#inputform').bind('submit', 
                                      function() { 
                                          chat.form_submit($(this)); 
                                          return false; 
                                      });

                 // start chatting
                 chat.join();

                 // start the send message queue
                 queue.start(chat.send_message, 100);
             });
    },
    join: function() {
        chat.queue_message("JOIN");
        chat.poll();
    },

    poll: function() {
        //chat.display_message("<div>&gt; poll in</div>");
        get('/a/message/updates/'+chat.room.id, 
            // success
            function(response) {
                m = response.messages;
                for (i in m) {
                    chat.display_message_object(m[i]);
                }
                window.setTimeout(chat.poll, 0);
                //chat.display_message("<div>&lt; poll out</div>");
            },
            // error
            function(xhr,status) {
                chat.display_message('<div>on_poll_error: ' + status + '</div>');
                setTimeout(chat.poll, 5000);
            });
    },

    form_submit: function(form) {
        //var message = form.formToDict();
        input = $("#inputbar")// TODO: should be able to get this from the FORM arg
        if (input.val() != "") {
            chat.queue_message(input.val());
            input.val("");
        }
    },
    queue_message: function(msg) {
        //chat.display_message('<div>'+msg+'</div>');
        queue.add(msg);
    },
    send_message: function(msg) {
        var args = {};
        args.body = msg;
        post('/a/message/new/'+chat.room.id, 
             args, chat.onSendMessageSuccess, on_error);
    },
    onSendMessageSuccess: function(response) {
        // the response has the message if we want to do something
        // with it here
    },

    display_message_object: function(msgobj) {
        chat.display_message(msgobj.html);
    },
    display_message: function(msg) {
        var div = $("#chat")
        div.append(msg);
        // certain browsers have a bug such that scrollHeight is too small
        // when content does not fill the client area of the element
        var scrollHeight = Math.max(div[0].scrollHeight, div[0].clientHeight);
        div[0].scrollTop = scrollHeight - div[0].clientHeight;
    },
    debug: function(msg) {
        chat.display_message("<div>debug: "+msg+"</div>");
    }
}


// ################################################################
var queue = {
    data: Array(),
    fn: null,
    interval_id: null,

    add: function(msg) {
        queue.data.push(msg);
    },
    // next: function() {
    //     return queue.data.shift();
    // },
    start: function(fn, timeout) {
        queue.fn = fn;
        queue.interval_id = setInterval("queue.run()", timeout);
    },
    stop: function() {
        clearInterval(queue.interval_id);
    },
    run: function() {
        if (queue.data.length > 0) {
            console.log("running queue function on data: "+queue.data);
            queue.fn(queue.data.shift());
        }
    }
}
