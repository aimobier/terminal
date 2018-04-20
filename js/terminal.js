var util = util || {};
util.toArray = function (list) {
    return Array.prototype.slice.call(list || [], 0);
};

// 存储服务

class Terminal {

    constructor(cmdLineContainer, outputContainer) {

        this.fs_ = null;
        this.cwd_ = null;
        this.history_ = [];
        this.histpos_ = 0;
        this.histtemp_ = 0;
        this.cmdLine_ = document.querySelector(cmdLineContainer);
        this.output_ = document.querySelector(outputContainer);

        this.CMDS_ = [
            'cat', 'clear', 'date', 'echo', 'help', 'uname', 'whoami'
        ];

        window.URL = window.URL || window.webkitURL;
        window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;


        window.addEventListener('click', e => this.cmdLine_.focus(), false);

        this.cmdLine_.addEventListener('click', this.inputTextClick_.bind(this), false);
        this.cmdLine_.addEventListener('keydown', this.historyHandler_.bind(this), false);
        this.cmdLine_.addEventListener('keydown', this.processNewCommand_.bind(this), false);
        this.init();
    }

    //
    inputTextClick_(e) {
        this.cmdLine_.value = this.cmdLine_.value;

    init(){

        this.initHtmlElment =
            '<img align="left" src="http://www.w3.org/html/logo/downloads/HTML5_Badge_128.png" ' +
            'width="100" height="100" style="padding: 0px 10px 20px 0px">' +
            '<h2 style="letter-spacing: 4px">HTML5 Web Terminal</h2>' +
            '<p>' + new Date() + '</p>' +
            '<p>Enter "help" for more information.</p><br><hr/>';
        this.output(this.initHtmlElment);
    }

    //
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

    //
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

            switch (cmd) {
                case 'cat':
                    var url = args.join(' ');
                    if (!url) {
                        this.output('Usage: ' + cmd + ' https://s.codepen.io/...');
                        this.output('Example: ' + cmd + ' https://s.codepen.io/AndrewBarfield/pen/LEbPJx.js');
                        break;
                    }
                    $.get(url, function (data) {
                        var encodedStr = data.replace(/[\u00A0-\u9999<>\&]/gim, function (i) {
                            return '&#' + i.charCodeAt(0) + ';';
                        });
                        this.output('<pre>' + encodedStr + '</pre>');
                    });
                    break;
                case 'clear':
                    output_.innerHTML = '';
                    this.cmdLine_.value = '';
                    return;
                case 'date':
                    this.output(new Date());
                    break;
                case 'echo':
                    this.output(args.join(' '));
                    break;
                case 'help':
                    this.output('<div class="ls-files">' + this.CMDS_.join('<br>') + '</div>');
                    break;
                case 'uname':
                    if (args.length == 1) {

                        this.currentuser.set(USER_USERNAME, args[0]);
                        this.currentuser.save().then(user => {
                            this.handleuser(user);
                        }, error => {
                            this.output(error.toString(), "error");
                        });

                    } else {
                        this.output(this.currentuser.get(USER_USERNAME));
                    }
                    break;
                case 'whoami':
                    this.output("<pre>"+JSON.stringify(this.currentuser,null,2)+"</pre>");
                    break;
                default:
                    if (cmd) {
                        this.output(cmd + ': command not found',"warning");
                    }
            }

            window.scrollTo(0, this.getDocHeight_());
            this.cmdLine_.value = ''; // Clear/setup line for next input.
        }
    }

    //
    formatColumns_(entries) {
        var maxName = entries[0].name;
        util.toArray(entries).forEach(function (entry, i) {
            if (entry.name.length > maxName.length) {
                maxName = entry.name;
            }
        });

        var height = entries.length <= 3 ?
        'height: ' + (entries.length * 15) + 'px;' : '';

        // 12px monospace font yields ~7px screen width.
        var colWidth = maxName.length * 7;

        return ['<div class="ls-files" style="-webkit-column-width:',
            colWidth, 'px;', height, '">'];
    }

    //
    output(html, cls) {
        this.output_.insertAdjacentHTML('beforeEnd', '<p class=' + cls + '>' + html + '</p>');
    }

    // Cross-browser impl to get document's height.
    getDocHeight_() {
        var d = document;
        return Math.max(
            Math.max(d.body.scrollHeight, d.documentElement.scrollHeight),
            Math.max(d.body.offsetHeight, d.documentElement.offsetHeight),
            Math.max(d.body.clientHeight, d.documentElement.clientHeight)
        );
    }

    /// 处理请求到用户
    handleuser(user) {
        this.currentuser = user;
        const uid = user.get(USER_IDENTIFIER);
        const uname = user.get(USER_USERNAME);
        if (!uname) {
            $('.prompt').html('[' + uid + '@HTML5] # ');
            this.output("u don's have name, input 'uname [name]' to set/update name <br> example: uname aimobier", "warning");
        } else {
            $('.prompt').html('[' + uname + '@HTML5] # ');
        }
    }

/**
 * 聊天室
 *
 * 主要功能用来链接环信 进行一些基本的操作的操作
 */
class ChatRoom{

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
            onTextMessage: function ( message ) {
                const mess = "<p>"+message.from+"   <span style='color: #96b38a'>"+(new Date())+"</span></p>" +
                    "<p style='color: #FF9966'>"+message.sourceMsg+"</p><hr>";
                term.output(mess,"success");
            },    //收到文本消息
            onOpened: () => term.output("connection success!!!!!","success"), //连接成功回调
            onClosed: () => term.output("connection fail!!!!!","warning"), //连接失败回调
            onOnline: () => term.output("status change -> onLine","success") ,//本机网络连接成功
            onOffline: () => term.output("status change -> offLine","error"), //本机网络掉线
            onError: () => term.output(message,"error") // 任何错误
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

        this.getUserByFinger(await new Promise(fingerprint));
    }

    /**
     * 根据 提供的token 去获取用户
     *
     * 获取到 交给 terminal 处理
     * 没有获取到 创建一个用户 并交给 terminal 处理
     *
     * @param token 用户的唯一标示
     */
    getUserByFinger(token){
        var query = new AV.Query(USERCLASSNAME);
        query.equalTo(USER_IDENTIFIER,token);
        query.find().then(results => {
            if (results.length <= 0){ // 没有找到
                this.createUser(token);
            }else{ // 保存该用户
                this.terminal.handleuser(results[0]);
            }
        },error => {
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
    createUser(token){
        var TerminalUser = AV.Object.extend(USERCLASSNAME);
        var tUser = new TerminalUser();
        tUser.set(USER_IDENTIFIER,token);
        tUser.save().then(user => {
            this.terminal.handleuser(user);
        },error => {
            this.terminal.outerror(error.toString());
        });
    }
}
