const net = require('net');
const dgram = require('dgram');
const tcpController = require('./controller/tcpController.js');
const requestingIPGuid = '5ef0b3f6-56a5-4437-bc4b-99a23b6e4159';
global.globalNodes = [];

///////////////////UDP Server////////////////////////
const udpserver = dgram.createSocket('udp4');
udpserver.on("message", (msg, rinfo) => {
  console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
  if (msg.toString() === requestingIPGuid) {
    udpserver.send("Acknowledgement of receiving UDP Packet", rinfo.port, rinfo.address);
  }
});
udpserver.on("error", (err) => {
  console.log(err);
});
udpserver.bind(5555);


////////////////TCP Server////////////////////////////
const server = net.createServer(tcpController.onSocketConnection);
server.on('error', tcpController.onServerError);
server.listen(5555, () => {
  console.log('Server Listening on 5555');
});


////////////////////Web Server////////////////////////

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const router = require('./routes/routes.js');

const app = express();
app.use(express.static(path.join(path.dirname(process.mainModule.filename),'public')));
app.use(bodyParser.json());
app.use(router);
app.listen(1000);