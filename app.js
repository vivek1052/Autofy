const net = require('net');
const dgram = require('dgram');
const requestingIPGuid = '5ef0b3f6-56a5-4437-bc4b-99a23b6e4159';
const receivedIPGuid = '0a2520d0-d3a8-491c-80c3-12ed7f688acc';

const NETWORK_MAP_RES = 1;

const sockets = {};

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

const server = net.createServer((socket) => {
  // 'connection' listener.
  console.log('client connected' + socket.remoteAddress);
  socket.on('end', () => {
    delete sockets[socket.remoteAddress];
  });
  socket.on('data', (data) => {
    const parsedData = JSON.parse(data.toString());
    switch(parsedData.cmd){
      case NETWORK_MAP_RES:{
        sockets[socket.remoteAddress].uniqueIDs = parsedData.response;
      }
    }
    console.log(data.toString());
  });
  socket.pipe(socket);
  sockets[socket.remoteAddress] = socket;
  //Send command to acknowledge mac address
  const command = {};
  command.cmd = 0;
  socket.write(JSON.stringify(command));
});
server.on('error', (err) => {
  console.log(err);
  delete sockets[socket.remoteAddress];
});
server.listen(5555, () => {
  console.log('server bound');
});

getSocketByMAC=(mac)=>{
  for(socket in sockets){
    if(mac == socket.uniqueIDs.mac){
      return socket;
    }
  }
}

getAllMAC=()=>{
  const MACs = [];
  for(socket in sockets){
    MACs.push(socket.uniqueIDs.mac);
  }
  return MACs;
}

////////////////////Web Server////////////////////////

const express = require('express')