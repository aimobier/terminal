var util = util || {};
util.toArray = function (list) {
    return Array.prototype.slice.call(list || [], 0);
};

// 存储服务

class Terminal {

    constructor(cmdLineContainer, outputContainer) {

        this.history_ = [];
        this.histpos_ = 0;
        this.histtemp_ = 0;
        this.cmdLine_ = document.querySelector(cmdLineContainer);
        this.output_ = document.querySelector(outputContainer);

        window.URL = window.URL || window.webkitURL;
        window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

        window.addEventListener('click', e => this.cmdLine_.focus(), false);
        this.cmdLine_.addEventListener('click', ()=> this.cmdLine_.value = this.cmdLine_.value, false);
        this.cmdLine_.addEventListener('keydown', this.historyHandler_.bind(this), false);
        this.cmdLine_.addEventListener('keydown', this.processNewCommand_.bind(this), false);
        this.enginemethod_();
    }

    /// 处理请求到用户
    handleuser(user) {
        if (!this.chatroom) {
            this.chatroom = new ChatRoom(this, user);
        }
        this.currentuser = user;
        const uid = user.get(USER_IDENTIFIER);
        const uname = user.get(USER_USERNAME);
        if (!uname) {
            $('.prompt').html('[' + uid + '@HTML5] # ');
            this.outwarning("u don's have name, input 'uname [name]' to set/update name <br> example: uname aimobier");
        } else {
            $('.prompt').html('[' + uname + '@HTML5] # ');
        }
    }


//    打印方法

    output(html) {
        this.output_.insertAdjacentHTML('beforeEnd', '<p>' + html + '</p>');
    }

    outerror(html) {
        this.output_.insertAdjacentHTML('beforeEnd', '<p class="error">' + html + '</p>');
    }

    outwarning(html) {
        this.output_.insertAdjacentHTML('beforeEnd', '<p class="warning">' + html + '</p>');
    }

    outsuccess(html) {
        this.output_.insertAdjacentHTML('beforeEnd', '<p class="success">' + html + '</p>');
    }


    /**
     *
     *  Private Methods
     *
     */


    /**
     * 启动引擎需要用到的方法
     *
     * 打印出默认的终端展示字符串
     * 完成 CMDS 的集合的创建 保证终端的各个功能创建
     *
     * @private
     */
    enginemethod_() {

        this.initHtmlElment =
            '<img align="left" src="http://www.w3.org/html/logo/downloads/HTML5_Badge_128.png" ' +
            'width="100" height="100" style="padding: 0px 10px 20px 0px">' +
            '<h2 style="letter-spacing: 4px">HTML5 Web Terminal</h2>' +
            '<p>' + new Date() + '</p>' +
            '<p>Enter "help" for more information.</p><br><hr/>';
        this.output(this.initHtmlElment);

        this.CMDS_ = {
            user: {
                help: "<span style='color: #FF9966;font-size: 1.1em;'>user</span><br><br>\
                    Include login, set password, set user name, view user's current state and other user related operations.<br>\
                You can personalize your users here. This is your first step in using this application.<br>\
                    <br>\
                    <span style='color: #FF9966'>-s</span> displays a table about current user related information.<br>\
                    <span style='color: #FF9966'>-n [name]</span> setting the user's user nickname，ps: nicknames do not contain parentheses.<br>\
                    <span style='color: #FF9966'>-h</span> all command documents that display the operation.<br>\
                    ",
                handle: (args, cmd) => {

                    if (args[0] === "-s") {
                        this.terminal_user_s_();
                    } else if (args[0] === "-n" && args[1] != undefined) {
                        this.currentuser.set(USER_USERNAME, args[1]);
                        this.currentuser.save().then(user => {
                            this.handleuser(user);
                        }, error => {
                            this.outerror(error.toString());
                        });
                    } else {
                        this.output(cmd.help);
                    }
                }
            },
            clear: {
                help: "<span style='color: #FF9966;font-size: 1.1em;'>clear</span><br><br>\
                    Empty the current terminal to display all contents to facilitate users to access content. \
                    ps: that the content after cleaning is not recoverable<br>\
                    <span style='color: #FF9966'>-h</span> all command documents that display the operation.<br>\
                    ",
                handle: () => {
                    this.output_.innerHTML = '';
                    this.cmdLine_.value = '';
                }
            },
            date: {
                help: "<span style='color: #FF9966;font-size: 1.1em;'>date</span><br><br>\
                    It's a boring operation to show the current time. I like it, it doesn't matter<br>\
                    <span style='color: #FF9966'>-f [fromatstring]</span> Formatted presentation of the current time.<br>\
                    <span style='color: #FF9966'>-h</span> all command documents that display the operation.<br>\
                    ",
                handle: (args) => {
                    this.output(dateFormat(new Date(), args[1]));
                }
            },
            echo: {
                help: "<span style='color: #FF9966;font-size: 1.1em;'>echo</span><br><br>\
                    This command is used for the output of strings. There is no egg. <br>\
                    <span style='color: #FF9966'>-s [string]</span> Print the string of the successful style.<br>\
                    <span style='color: #FF9966'>-w [string]</span> Print the string of the warnings style.<br>\
                    <span style='color: #FF9966'>-e [string]</span> Print the string of the error style.<br>\
                    <span style='color: #FF9966'>-h [string]</span> all command documents that display the operation.<br>\
                    ",
                handle: (args) => {
                    if (args[1] != undefined) {
                        if (args[0] === "-s") {
                            this.outsuccess(args[1]);
                        } else if (args[0] === "-w") {
                            this.outwarning(args[1]);
                        } else if (args[0] === "-e") {
                            this.outerror(args[1]);
                        } else {
                            this.output(args.join(""));
                        }
                    } else {
                        this.output(args.join(""));
                    }
                }
            },
        };
    }

    /**
     * 处理 键盘点击的方法
     *
     * 主要处理 上下键的点击方法
     *
     * @param e
     * @private
     */
    historyHandler_(e) {
        if (this.history_.length) {
            if (e.keyCode == 38 || e.keyCode == 40) {
                if (this.history_[this.histpos_]) {
                    this.history_[this.histpos_] = this.cmdLine_.value;
                } else {
                    this.histtemp_ = this.cmdLine_.value;
                }
            }

            if (e.keyCode == 38) { // up
                this.histpos_--;
                if (this.histpos_ < 0) {
                    this.histpos_ = 0;
                }
            } else if (e.keyCode == 40) { // down
                this.histpos_++;
                if (this.histpos_ > this.history_.length) {
                    this.histpos_ = this.history_.length;
                }
            }

            if (e.keyCode == 38 || e.keyCode == 40) {
                this.cmdLine_.value = this.history_[this.histpos_] ? this.history_[this.histpos_] : this.histtemp_;
                this.cmdLine_.value = this.cmdLine_.value; // Sets cursor to end of input.
            }
        }
    }

    /**
     * 监听 tab 以及 enter 键位的点击
     *
     * 目前 tab 没有任何操作
     * enter 对于字符串进行处理后 完成 cmd 以及 args的分配
     *
     * @param e
     * @private
     */
    processNewCommand_(e) {

        if (e.keyCode == 9) { // tab
            e.preventDefault();
            // Implement tab suggest.
        } else if (e.keyCode == 13) { // enter
            // Save shell history.
            if (this.cmdLine_.value) {
                this.history_[this.history_.length] = this.cmdLine_.value;
                this.histpos_ = this.history_.length;
            }

            // Duplicate current input and append to output section.
            var line = this.cmdLine_.parentNode.parentNode.cloneNode(true);
            line.removeAttribute('id')
            line.classList.add('line');
            var input = line.querySelector('input.cmdline');
            input.autofocus = false;
            input.readOnly = true;
            this.output_.appendChild(line);

            if (this.cmdLine_.value && this.cmdLine_.value.trim()) {
                var args = this.cmdLine_.value.split(' ').filter(function (val, i) {
                    return val;
                });
                var cmd = args[0].toLowerCase();
                args = args.splice(1); // Remove cmd from arg list.
            }

            const cmdobj = this.CMDS_[cmd];

            if (cmdobj != undefined) {
                if (args[0] === "-h") {
                    this.output(cmdobj.help);
                } else {
                    cmdobj.handle(args, cmdobj);
                }
            } else {
                if (cmd === "help") {
                    this.terminal_help_();
                    return;
                }
                this.outwarning(cmd + ': command not found', "warning");
            }

            window.scrollTo(0, this.getDocHeight_());
            this.cmdLine_.value = ''; // Clear/setup line for next input.
        }
    }


    /**
     * 展示 当前 所有的CMD 以及他们的帮助信息
     *
     * @private
     */
    terminal_help_() {

        var helpStr = "";

        for (var key in this.CMDS_) {
            helpStr += "<div style='font-size: 1em;'>";
            helpStr += this.CMDS_[key].help + "<br>";
            helpStr += "<br><br></div>";
        }

        this.output(helpStr);
    }


    /**
     * 获取当前页面的高度
     * 和滑动方法一起使用完成 命令过多时 自动向下
     *
     * @returns {number} 当前的页面的高度
     * @private
     */
    getDocHeight_() {
        var d = document;
        return Math.max(
            Math.max(d.body.scrollHeight, d.documentElement.scrollHeight),
            Math.max(d.body.offsetHeight, d.documentElement.offsetHeight),
            Math.max(d.body.clientHeight, d.documentElement.clientHeight)
        );
    }

    /**
     * 终端 user -s 命令的处理方法
     *
     * 显示 用户当前的状态 使用 table 显示出来
     *
     * @private
     */
    terminal_user_s_() {

        function S4() {
            return (((1 + Math.random()) * 0x1000000) | 0).toString(16).substring(1);
        }

        const uname = this.currentuser.get(USER_USERNAME);

        const elmentId = S4();

        const tab = '\
        <table border="1"> \
        <tr>\
        <th>uname</th>\
        <th>uid</th>\
        <th>is regist</th>\
        <th>is login</th>\
        </tr>\
        <tr>\
        <td>' + (uname ? uname : "not set") + '</td>\
        <td>' + this.currentuser.id + '</td>\
        <td>' + (this.currentuser.get(USER_ISEASEMOBUSER) == true) + '</td>\
        <td>' + (this.islogin == true) + '</td>\
        </tr>\
        </table>\
        <p id="' + elmentId + '">click this to show/hidden more help for table title.</p>\
        <pre id="' + elmentId + '-content"  style="color: brown">\
uname:      The name of the current user.<br>\
uid:        The unique indication of the current user<br>\
is regist:  Is the current user registered to a dist<br>\
is login:   Is the user currently linked to the dist and can chat<br>\
        </pre>\
        ';
        this.output(tab);
        const divEl = $("#" + elmentId + "-content");
        divEl.hide();
        $("#" + elmentId).click(()=> {
            if (divEl.is(":hidden")) {
                divEl.show();
                window.scrollTo(0, this.getDocHeight_());
            } else {
                divEl.hide(300);
            }
        });
    }
}


/**
 * 聊天室
 *
 * 主要功能用来链接环信 进行一些基本的操作的操作
 */
class ChatRoom {

    constructor(term) {

        this.conn = new WebIM.connection({
            isMultiLoginSessions: WebIM.config.isMultiLoginSessions,
            https: typeof WebIM.config.https === 'boolean' ? WebIM.config.https : location.protocol === 'https:',
            url: WebIM.config.xmppURL,
            heartBeatWait: WebIM.config.heartBeatWait,
            autoReconnectNumMax: WebIM.config.autoReconnectNumMax,
            autoReconnectInterval: WebIM.config.autoReconnectInterval,
            apiUrl: WebIM.config.apiURL,
            isAutoLogin: true
        });

        /// 监听链接消息
        this.conn.listen({
            onTextMessage: function (message) {
                const mess = "<p>" + message.from + "   <span style='color: #96b38a'>" + (new Date()) + "</span></p>" +
                    "<p style='color: #FF9966'>" + message.sourceMsg + "</p><hr>";
                term.output(mess, "success");
            },    //收到文本消息
            onOpened: () => term.output("connection success!!!!!", "success"), //连接成功回调
            onClosed: () => term.output("connection fail!!!!!", "warning"), //连接失败回调
            onOnline: () => term.output("status change -> onLine", "success"),//本机网络连接成功
            onOffline: () => term.output("status change -> offLine", "error"), //本机网络掉线
            onError: () => term.output(message, "error") // 任何错误
        });
    }
}


/**
 * 用户的Classname
 * 保存在 LeanCloud 中时，需要存储到的Class
 */
const USERCLASSNAME = "Terminal_user";

/**
 * 用户的唯一标示字段
 */
const USER_IDENTIFIER = "terminal_identifier";

/**
 * 用户的 名称
 */
const USER_USERNAME = "terminal_username";

/**
 * 用户的是否注册了环信
 */
const USER_ISEASEMOBUSER = "terminal_iseasemobuser";

/**
 *  终端用户对象
 *
 *  默认一个浏览器中只存在一个终端用户
 *  并且该值 不会因为重启电脑而失效
 */
class TerminalUser {

    /**
     * 初始化方法 完成对于 用户对象的构建
     * 传入 terminal 对象是为了 在 终端中打印一些需要打印的数据
     *
     * @param terminal 终端对象
     */
    constructor(terminal) {
        this.terminal = terminal;
    }

    /**
     * 获取用户
     *
     * 首先从数据库中获取，没有就创建
     * 之后根据环信相关，填充相关信息 包裹 是否注册 是否登陆等
     */
    async getUser() {
        var fingerprint = function (resolve) {
            new Fingerprint2().get(function (result) {
                resolve(result)
            });
        }.bind(this);

        this.getUserByFinger_(await new Promise(fingerprint));
    }

    /**
     * 根据 提供的token 去获取用户
     *
     * 获取到 交给 terminal 处理
     * 没有获取到 创建一个用户 并交给 terminal 处理
     *
     * @param token 用户的唯一标示
     */
    getUserByFinger_(token) {
        var query = new AV.Query(USERCLASSNAME);
        query.equalTo(USER_IDENTIFIER, token);
        query.find().then(results => {
            if (results.length <= 0) { // 没有找到
                this.createUser_(token);
            } else { // 保存该用户
                this.terminal.handleuser(results[0]);
            }
        }, error => {
            this.terminal.outerror(error.toString());
        });
    }

    /**
     * 根据用户的 token 创建一个用户
     *
     *  创建成功 交给 terminal 处理
     *  创建失败 打印 创建失败 详细信息
     *
     * @param token 用户唯一标示
     */
    createUser_(token) {
        var TerminalUser = AV.Object.extend(USERCLASSNAME);
        var tUser = new TerminalUser();
        tUser.set(USER_IDENTIFIER, token);
        tUser.save().then(user => {
            this.terminal.handleuser(user);
        }, error => {
            this.terminal.outerror(error.toString());
        });
    }
}
