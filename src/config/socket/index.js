const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
    transports: ['polling', 'websocket'],
    cors: {
        origin: ["http://localhost:3000", "http://localhost:3001"],
        methods: ['GET', 'POST']
    }
})

io.on('connection', socket => {

})

module.exports = {app, server, io}