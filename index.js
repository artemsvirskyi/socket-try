var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var messages = [];
var activeSockets = [];
var i = 0;

io.on('connection', function(socket){
    var index = ++i;

    activeSockets.push({
        index: index,
        socket: socket
    });

    console.log('connection', index);

    socket.emit('messages', {messages: messages, connection: index});

    socket.on('add', function(message){
        messages = messages.concat(message);

        activeSockets.forEach(function(socketData){
            socketData.socket.emit('messages', {messages: messages, connection: index});
        });
    });

    socket.on('disconnect', function () {
        console.log('disconnect', index);

        removeActiveSocketByIndex(activeSockets, index);

        activeSockets.forEach(function(socket){
            console.log(socket.index);
        });
    });
});

function removeActiveSocketByIndex(sockets, id){
    var index = getSocketIndexInArray(sockets, id);

    console.log('removing index - ', index);

    sockets.splice(index, 1);
}

function getSocketIndexInArray(sockets, id){
    var socketIndexInArray = -1;

    sockets.some(function(socket, socketIndex){
        var isTheOne = socket.index === id;

        if(isTheOne){
            socketIndexInArray = socketIndex
        }

        return isTheOne;
    });

    return socketIndexInArray;
}

app.use(express.static('public'));

app.set('port', process.env.PORT || 3000);
server.listen(process.env.PORT || 3000);