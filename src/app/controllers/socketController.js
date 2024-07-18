

class SocketController {
    constructor() {
      this.initializeSocketEvents();
    }
  
    initializeSocketEvents() {
      io.on('connection', (socket) => {
        console.log('A client connected');
  
        socket.on('disconnect', () => {
          console.log('A client disconnected');
        });
  
    
      });
    }
  }
  
  module.exports = new SocketController();