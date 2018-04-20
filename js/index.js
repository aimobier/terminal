$(function() {

  var { Query, User } = AV;
  AV.init("Nzr6uILxRVGe2jgpykgH1fyg-gzGzoHsz", "nTBkk57i7SYrn2OUEP1mn78Y");

  $('.prompt').html('[loading user...@HTML5] # ');

  var term = new Terminal('#input-line .cmdline', '#container output');

  const terminaluser = new TerminalUser(term);
  terminaluser.getUser();
});
