//inicializacion de variables
var express = require('express'),
app = express(),
//creamos el servidor  y le pasamos app 
server = require('http').createServer(app),
//indicamos a io que escuche a server
io = require("socket.io").listen(server),
nicknames = {};

//server.listen(8000); * si lo corres local
//configuramos esto para la web de hosting
console.log(process.env.PORT);
const port = process.env.PORT || 3000;
const ip = process.env.IP || '127.0.0.1';


server.listen(port, ip);

//mandamos un archivo en la respuesta
app.get('/', function(req, res) {
    res.sendfile(__dirname + '/index.html');
});



io.sockets.on('connection', function(socket) {
    socket.on('send message', function(data) {
        io.sockets.emit('new message', {msg: data, nick: socket.nickname});
    });
    
    socket.on('new user', function(data, callback) {
        if (data in nicknames) {
            callback(false);
        } else {
            callback(true);
            socket.nickname = data;
            nicknames[socket.nickname] = 1;
            updateNickNames();
        }
    });
    
    //limpia user que se desconectan 
    socket.on('disconnect', function(data) {
        if(!socket.nickname) return;
        delete nicknames[socket.nickname];
        updateNickNames();
    });
    
    function updateNickNames() {
        io.sockets.emit('usernames', nicknames);
    }
});