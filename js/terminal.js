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

        this.initHtmlElment =
            '<img align="left" src="http://www.w3.org/html/logo/downloads/HTML5_Badge_128.png" ' +
            'width="100" height="100" style="padding: 0px 10px 20px 0px">' +
            '<h2 style="letter-spacing: 4px">HTML5 Web Terminal</h2>' +
            '<p>' + new Date() + '</p>' +
            '<p>Enter "help" for more information.</p><br><hr/>';


        window.URL = window.URL || window.webkitURL;
        window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;


        window.addEventListener('click', e => this.cmdLine_.focus(), false);

        this.cmdLine_.addEventListener('click', this.inputTextClick_.bind(this), false);
        this.cmdLine_.addEventListener('keydown', this.historyHandler_.bind(this), false);
        this.cmdLine_.addEventListener('keydown', this.processNewCommand_.bind(this), false);

        this.output(this.initHtmlElment);
    }

    //
    inputTextClick_(e) {
        this.cmdLine_.value = this.cmdLine_.value;
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
}
