$(function() {
    // io-client
    // 连接成功会触发服务器端的connection事件
    var socket = io(); 

    // 点击输入昵称
    $('#nameBtn').click(()=> {  
      var imgN = Math.floor(Math.random()*4)+1; // 随机分配头像
      if($('#name').val().trim()!=='')
          socket.emit('login', { 
            name: $('#name').val(),
            img: 'image/user' + imgN + '.jpg'
          });  // 触发登录事件
      return false;  
    });
    // 登录成功，隐藏登录层
    socket.on('loginSuc', ()=> { 
      $('.name').hide(); 
    })
    socket.on('loginError', ()=> {
      alert('用户名已存在，请重新输入！');
      $('#name').val('');
    }); 

    // 系统提示消息
    socket.on('system', (user)=> { 
      var data = new Date().toTimeString().substr(0, 8);
      $('#messages').append(`<p class='system'><span>${data}</span><br /><span>${user.name}  ${user.status}了聊天室<span></p>`);
      // 滚动条总是在最底部
      $('#messages').scrollTop($('#messages')[0].scrollHeight);
    });

    // 显示在线人员
    socket.on('disUser', (usersInfo)=> {
      displayUser(usersInfo);
    });

    // 发送消息
    $('#sub').click(sendMsg);
    $('#m').keyup((ev)=> {
      if(ev.which == 13) {
        sendMsg();
      }
    });

    // 接收消息
    socket.on('receiveMsg', (obj)=> { 
      // 提取文字中的表情加以渲染
      var msg = obj.msg;
      var content = '';
      while(msg.indexOf('[') > -1) {  // 其实更建议用正则将[]中的内容提取出来
        var start = msg.indexOf('[');
        var end = msg.indexOf(']');

        content += '<span>'+msg.substr(0, start)+'</span>';
        content += '<img src="image/emoji/emoji%20('+msg.substr(start+6, end-start-6)+').png">';
        msg = msg.substr(end+1, msg.length);
      }
      content += '<span>'+msg+'</span>';
      
      $('#messages').append(`
        <li class='${obj.side}'>
          <img src="${obj.img}">
          <div>
            <span>${obj.name}</span>
            <p style="color: ${obj.color};">${content}</p>
          </div>
        </li>
      `);
      // 滚动条总是在最底部
      $('#messages').scrollTop($('#messages')[0].scrollHeight);
    }); 


    // 发送消息
    var color = '#000000'; 
    function sendMsg() { 
      if($('#m').val() == '') {
        alert('请输入内容！');
        return false;
      }
      color = $('#color').val(); 
      socket.emit('sendMsg', {
        msg: $('#m').val(),
        color: color
      });
      $('#m').val(''); 
      return false; 
    }

    // 显示在线人员
    function displayUser(users) {
      $('#users').text(''); // 每次都要重新渲染
      if(!users.length) {
        $('.contacts p').show();
      } else {
        $('.contacts p').hide();
      }
      $('#num').text(users.length);
      for(var i = 0; i < users.length; i++) {
        var $html = `<li>
          <img src="${users[i].img}">
          <span>${users[i].name}</span>
        </li>`;
        $('#users').append($html);
      }
    }

    // 清空历史消息
    $('#clear').click(()=> {
      $('#messages').text('');
      socket.emit('disconnect');
    });
 
    // 渲染表情
    init();
    function init() {
      for(var i = 0; i < 141; i++) {
        $('.emoji').append('<li id='+i+'><img src="image/emoji/emoji ('+(i+1)+').png"></li>');
      }
    }

    // 显示表情
    $('#smile').click(()=> {
      $('.selectBox').css('display', "block");
    });
    $('#smile').dblclick((ev)=> { 
      $('.selectBox').css('display', "none");
    });  
    $('#m').click(()=> {
      $('.selectBox').css('display', "none");
    }); 

    // 用户点击发送表情
    $('.emoji li img').click((ev)=> {
        ev = ev || window.event;
        var src = ev.target.src;
        var emoji = src.replace(/\D*/g, '').substr(6, 8);
        var old = $('#m').val();
        $('#m').val(old+'[emoji'+emoji+']');
        $('.selectBox').css('display', "none");
    });
});