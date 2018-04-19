// 用户 Classname
const USERCLASSNAME = "Terminal_user";
const USER_IDENTIFIER = "terminal_identifier";
const USER_USERNAME = "terminal_username";

/// ES6
/// 用户对象
class TerminalUser {

  constructor(terminal) {
    this.terminal = terminal;
  }

  /// 获取用户开始
  async getUser() {
    var fingerprint = function (resolve) {
      new Fingerprint2().get(function (result) {
        resolve(result)
      });
    }.bind(this);

    this.getUserByFinger(await new Promise(fingerprint));
  }

  getUserByFinger(token){
    /// 创建一个查询
    var query = new AV.Query(USERCLASSNAME);
    /// 查询 用户ID
    query.equalTo(USER_IDENTIFIER,token);
    /// 进行请求
    query.find().then(results => {
      if (results.length <= 0){ // 没有找到
        this.createUser(token);
      }else{ // 保存该用户
        this.terminal.handleuser(results[0]);
      }
    },error => {
      this.terminal.output(error.toString(),"error");
    });
  }

  /// 根据 token 创建用户
  createUser(token){
    var TerminalUser = AV.Object.extend(USERCLASSNAME);
    var tUser = new TerminalUser();
    tUser.set(USER_IDENTIFIER,token);
    tUser.save().then(user => {
      this.terminal.handleuser(user);
    },error => {
      this.terminal.output(error.toString(),"error");
    });
  }
}
