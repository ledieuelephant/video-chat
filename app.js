// create a new express app with http server and socket.io
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var {ExpressPeerServer} = require('peer');
var peerServer = ExpressPeerServer(server, {
    debug: true
});
const { v4: uuidV4 } = require('uuid')

app.use('/peerjs', peerServer);

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`)
})

app.get("/leave", (req, res) => {
    res.render('leave');
})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)
        socket.broadcast.to(roomId).emit('user-connected', userId)
        console.log(roomId)
        socket.on("message", (message) => {
            io.to(roomId).emit("createMessage", message);
        })
        socket.on('disconnect', () => {
            socket.broadcast.to(roomId).emit('user-disconnected', userId)
        })
    })
})


server.listen(3000, function() {
    console.log('Server listening at port 3000');
});