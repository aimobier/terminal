$(function() {


  var { Query, User } = AV;
  AV.init("Nzr6uILxRVGe2jgpykgH1fyg-gzGzoHsz", "nTBkk57i7SYrn2OUEP1mn78Y");

  // Set the command-line prompt to include the user's IP Address
  // $('.prompt').html('[' + codehelper_ip["IP"] + '@HTML5] # ');
  $('.prompt').html('[loading user...@HTML5] # ');

  // Initialize a new terminal object
  var term = new Terminal('#input-line .cmdline', '#container output');

  const terminaluser = new TerminalUser(term);
  terminaluser.getUser();
});
