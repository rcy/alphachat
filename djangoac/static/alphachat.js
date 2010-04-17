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
            timeout: 50000,     // 50 seconds
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
function get_html(url, selector, onSuccess) {
    $.ajax({url: add_slash(url),
            type: "GET",
            dataType: "json",
            success: function(r) {
                $(selector).html(r.html);
                if (onSuccess) onSuccess();
            },
            error: function(xhr, status, error) {
                var errstr = 'get_html error: '+status+'\n'+error;
                alert(errstr);
                $(selector).html(errstr);
            }});
}

// main
$(document).ready(function() {
        g_fbqa = fb_query_args();
        if (!window.console) window.console = {};
        if (!window.console.log) window.console.log = function() {};
        // start us off by loading the menu
        get_html('/mainmenu.html', "#content",
             function() {
                 $("#faces_others").html('')
                 $("#faces_me").html('')
                 $("#go_chat").bind("click", lobby.setup);
             });
        window.onbeforeunload = function(ev) { return "You won''t be able to return to this chat"; };
        //$(window).unload(function(ev) { alert("unload!?"); });
    });

// budget generic error handler
function on_error(xhr, status) { alert(status); }

var lobby = {
    setup: function() {
        // setup the page, then find a room
        get_html('/lobby.html', "#content", lobby.find_room);
    },
    find_room: function() {
        $("#lobby_box").append(". ");
        // send message to server to indicate we are waiting to play
        get('/a/lobby/find_room/', 
            function(response) {
                if (response) {
                    room_id = response.room_id;
                    my_color = response.color;
                    my_face = response.face;
                    my_vote = response.vote;
                    since = response.since;
                    chat.setup(room_id, my_color, my_face, my_vote, since);
                } else {
                    // server time-out, go again
                    $("#lobby_box").append('<div>WARNING: find_room: server timeout</div>');
                    window.setTimeout(lobby.find_room, 0);
                }
            },
            function(xhr,status) {
                if (status == 'timeout')
                    // client timeout, no problem
                    window.setTimeout(lobby.find_room, 0);
            });
    }
}

var chat = {
    room: {},
    my_color: '',
    my_face: 'http://static.ak.fbcdn.net/pics/q_silhouette.gif',
    my_vote: '',
    since: 0,
    error_wait: 100,
    time: 0,

    setup: function(room_id, color, face, vote, since) {
        chat.room.id = room_id;
        chat.my_color = color;
        if (face) 
            chat.my_face = face;
        chat.my_vote = vote; // we are given an initial choice, cannot abstain
        chat.since = since;
        chat.error_wait = 100;

        // request the chat page
        get_html("/chat.html", "#content", 
             function() {
                 // show the room id in the chat window
                 $('#chat').html('<div class="debug">match: ' + chat.room.id + '</div>');

                 // boot up the progress bar
                 progress.reset();

                 // start the send message queue
                 queue.start(chat.send_message, 100);

                 // setup the form, disabled
                 chat.form_setup();
                 chat.form_disable();

                 // wait for messages
                 chat.poll();

                 // tell server we are ready to go
                 //alert("delay join");
                 window.setTimeout(chat.join, 100);
             });
    },

    form_setup: function() {
        // wire up the form submit event to send messages to server
        $('#inputform').bind('submit', 
                             function(e) { 
                                 chat.form_submit($(this));
                                 return false; 
                             });
        $('inputform').keydown(function(e){
                if (e.keyCode == 13) {
                    $(this).parents('form').submit();
                    return false;
                }
            });
    },
    form_enable: function() {
        chat.display_html('<div class="debug">chat enable</div>');
        $('#inputbar').attr('disabled', false);
        // focus the input bar
        $("input:text:visible:first").focus();
    },
    form_disable: function() {
        chat.display_html('<div class="debug">chat disable</div>');
        $('#inputbar').attr('disabled', true);
    },

    join: function() {
        chat.queue_message({command:'join'});
    },

    poll: function() {
        get('/a/room/msgs/'+chat.room.id+'/'+chat.since+'/',
            // success
            function(response) {
                chat.error_wait = 100;
                chat.since = response.since;
                m = response.messages;

                for (i in m) {
                    var msg = m[i];
                    html = $("#msgtpl_" + msg.command).jqote(msg);
                    chat.display_html(html);

                    switch (msg.command) {
                    case 'state':
                        if (msg.seconds > 0) {
                            progress.start(msg.seconds);
                        }

                        switch (msg.state) {
                        case 'chat':
                            if (msg.seconds > 0) {
                                chat.form_enable();
                                chat.vote_display(chat.my_vote);
                            }
                            break;

                        case 'vote':
                            if (msg.seconds > 0)
                                chat.form_disable();
                            break;
                        case 'results':
                            // show return to main menu button
                            $("#menubutton").css('display','inline');
                            chat.form_enable();
                            break;
                        default:
                            alert("unknown state:"+msg.state);
                        }
                        break;
                    case 'join':
                        // todo: draw the player face card in the sidebar
                        if (msg.color == chat.my_color)
                            msg['face'] = chat.my_face;
                        else
                            msg['face'] = '/media/50x50.png';

                        card = $("#msgtpl_face").jqote(msg);

                        if (msg.color == chat.my_color) 
                            $("#faces_me").append(card);
                        else {
                            $("#faces_others").append(card);
                            // make this card clickable for choosing alpha
                            face = $("#face_"+msg.color);
                            face.addClass("face_button");
                            face.bind("click", {color:msg.color}, chat.vote_click);
                        }

                        break;
                    }
                }
                
                window.setTimeout(chat.poll, 0);
            },
            // error
            function(xhr,status) {
                chat.display_html('<div class="debug">on_poll: ' + status + '</div>');
                if (status == 'timeout')
                    wait_for = 100;
                else
                    wait_for = (chat.error_wait *= 2);

                setTimeout(chat.poll, wait_for);
            });
    },

    vote_click: function(ev) {
        color = ev.data.color;

        // send message to server
        chat.queue_message({command:'vote', color:color});

        // ui
        vote_display(color);

        // refocus the input bar
        $("input:text:visible:first").focus();
    },

    vote_display: function(color) {
        // visibly mark face as picked
        $("*").removeClass("picked");
        $("#face_"+color).addClass("picked");
    },

    form_submit: function(form) {
        input = $("#inputbar").val() // TODO: should be able to get this from the FORM arg
        if (input != "") {
            if (input[0] == '/') {
                // /command
                cmd = input.slice(1)
                chat.display_html($("#msgtpl_debug").jqote({cmd:cmd}));
                if (cmd == 'hide')
                    $('.debug').css('display', 'none');
                else if (cmd == 'unhide')
                    $('.debug').css('display', 'inline');
            } else {
                chat.queue_message({command:'privmsg', body:input});
            }
            $("#inputbar").val("");
        }
    },
    queue_message: function(msgobj) {
        //chat.display_html('<div>'+msg+'</div>');
        queue.add(msgobj);
    },
    send_message: function(msgobj) {
        post('/a/room/post/'+chat.room.id, 
             msgobj, chat.onSendMessageSuccess, on_error);
    },
    onSendMessageSuccess: function(response) {
        // the response has the message if we want to do something
        // with it here
    },

    display_html: function(html) {
        var div = $("#chat")
        div.append(html);
        // certain browsers have a bug such that scrollHeight is too small
        // when content does not fill the client area of the element
        var scrollHeight = Math.max(div[0].scrollHeight, div[0].clientHeight);
        div[0].scrollTop = scrollHeight - div[0].clientHeight;
    },
}


// ################################################################
var queue = {
    data: Array(),
    fn: null,
    interval_id: null,

    add: function(obj) {
        queue.data.push(obj);
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
            queue.fn(queue.data.shift());
        }
    }
}

// ################################################################
var progress = {
    // http://docs.jquery.com/UI/Progressbar
    start_time: 0,
    duration: 0,

    reset: function() {
        progress.stop();
        $("#progressbar").progressbar({value: 0});
    },
    start: function(seconds) {
        progress.reset();
        progress.duration = seconds * 1000; // to get to milliseconds
        progress.start_time = new Date().getTime();
        progress.interval_id = setInterval("progress.update()", 250);
    },
    update: function() {
        now = new Date().getTime();
        percentage = (now - progress.start_time) / progress.duration * 100;
        $("#progressbar").progressbar({value: percentage});
        if (percentage >= 100)
            progress.stop();
    },
    stop: function() {
        if (progress.interval_id) {
            clearInterval(progress.interval_id);
        }
    }
}
