peers = {}
const path = require('path')
// open the database


var name;
module.exports = (io) => {
    io.on('connection', socket => {
        socket.on('join-room', (roomId, userId) => {
          socket.join(roomId)
          socket.to(roomId).broadcast.emit('user-connected', userId)
            
        socket.on('joining msg', (username) => {
            name = username;
            io.emit('chat message', `---${name} joined the chat---`);
        });
        
        socket.on('disconnect', () => {
          console.log('user disconnected');
          io.emit('chat message', `---${name} left the chat---`);
          
        });

        
        socket.on('chat message', (msg) => {
          socket.broadcast.emit('chat message', msg);         //sending message to all except the sender
        });
      
          socket.on('disconnect', () => {
            socket.to(roomId).broadcast.emit('user-disconnected', userId)
          })
        })
      })
}