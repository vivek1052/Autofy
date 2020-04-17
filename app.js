const net = require('net');
const dgram = require('dgram');
const tcpController = require('./controller/tcpController.js');
const requestingIPGuid = '5ef0b3f6-56a5-4437-bc4b-99a23b6e4159';
const receivedIPGuid = '0a2520d0-d3a8-491c-80c3-12ed7f688acc';

const sockets = [];
const udpserver = dgram.createSocket('udp4');
udpserver.on("message", (msg, rinfo) => {
  console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
  if (msg.toString() === requestingIPGuid) {
    udpserver.send(receivedIPGuid, rinfo.port, rinfo.address);
  }
});
udpserver.on("error", (err) => {
  console.log(err);
});
udpserver.bind(5555);

const server = net.createServer(tcpController.onSocketConnection);
server.on('error', tcpController.onServerError);
server.listen(5555, () => {
  console.log('Server Listening on 5555');
});


////////////////////Web Server////////////////////////

const express = require('express');
const path = require('path');
const app = express();
app.use(express.static(path.join(__dirname,'public')));
app.get("/",(req,res,next)=>{
  res.sendFile(path.join(__dirname,"/index.html"))
});
app.get("/nodes",(req,res,next)=>{
  const nodes=[];
  Object.values(sockets).forEach(socket=>{
    nodes.push({node:socket.uniqueIDs.name,mac:socket.uniqueIDs.mac});
  });
  res.json(nodes);
});
app.listen(1000);