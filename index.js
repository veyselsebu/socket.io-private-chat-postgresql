var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);


const { Pool } = require('pg')
const pool = new Pool({
  user: '',
  host: '',
  database: '',
  password: '',
  port: 5432,
  queueLimit : 0, // unlimited queueing
  connectionLimit : 0
});
nicknames = [];
app.get('/', function (req, res) {
  res.sendfile('index.html');
});

io.on('connection', function (socket) {
  socket.on('new user', function (data, callback) {
    if (nicknames.indexOf(data) != -1) {
      console.log('hata');
      callback(false);
    }
    else {
      callback(true);
      socket.nickname = data;
      console.log('kaydedildi ' + socket.nickname);
      nicknames.push(socket.nickname);
      io.sockets.emit('usernames', nicknames);
      updateNicknames();
    }
  });

  function updateNicknames() {
    io.sockets.emit('usernames', nicknames);
  }
  socket.on('disconnect', function (data) {
    if (!socket.nickname) return;
    nicknames.splice(nicknames.indexOf(socket.nicknames), 1);
    pool.end();
    updateNicknames();
  });
  socket.on('oda1-yukle', function () {
    console.log("girdi");
  });
  function bildirimYolla(){
    
  }
  socket.on('gecmis yukle', function (data) {
    pool.query('SELECT * FROM deneme2 WHERE oda =\'' + data+'\'', (err, res) => {
      console.log(err, res);
      for (i = 0; i < res.rows.length; i++)
        io.emit(socket.nickname+data,{msg:res.rows[i].mesaj , nick:res.rows[i].user});
    });
  });
  socket.on('privateMessage', function (data) {
    console.log("dogru yer dogru zaman ...");
    pool.query('INSERT INTO public.deneme2(\"user\", oda, mesaj) VALUES (\'' + socket.nickname + '\',\''+data.room+'\',\'' + data.msg + '\')', (err, res) => {
      console.log(err, res);
    });
    io.emit(data.room, { msg: data.msg, nick: socket.nickname });
  });

  socket.on('oda1', function (msg) {
    pool.query('INSERT INTO public.deneme2(\"user\", oda, mesaj) VALUES (\'' + socket.nickname + '\',\'oda1\',\'' + msg + '\')', (err, res) => {

      console.log(err, res);
    });
    io.emit('oda1', { msg: msg, nick: socket.nickname });
  });

  socket.on('oda2', function (msg) {
    pool.query('INSERT INTO public.deneme2(\"user\", oda, mesaj) VALUES (\'' + socket.nickname + '\',\'oda2\',\'' + msg + '\')', (err, res) => {
      console.log(err, res);
    })
    console.log('message: ' + msg + " oda 2");
    io.emit('oda2', { msg: msg, nick: socket.nickname });
  });
  socket.on('oda3', function (msg) {
    pool.query('INSERT INTO public.deneme2(\"user\", oda, mesaj) VALUES (\'' + socket.nickname + '\',\'oda3\',\'' + msg + '\')', (err, res) => {
      console.log(err, res);
    })
    console.log('message: ' + msg + " oda3");
    io.emit('oda3', { msg: msg, nick: socket.nickname });
  });
  socket.on('oda4', function (msg) {
    pool.query('INSERT INTO public.deneme2(\"user\", oda, mesaj) VALUES (\'' + socket.nickname + '\',\'oda4\',\'' + msg + '\')', (err, res) => {
      console.log(err, res);
    })
    console.log('message: ' + msg + " oda4");
    io.emit('oda4', { msg: msg, nick: socket.nickname });
  });

  socket.on('genel', function (msg) {
    console.log('message: ' + msg);
    io.emit('genel', { msg: msg, nick: socket.nickname });
  });

  socket.on('typing', function () {
    socket.broadcast.emit('typing', socket.nickname);
    console.log("is typing  " + socket.nickname);
  });

});

http.listen(3000, function () {
  console.log('listening on *:3000');
});
