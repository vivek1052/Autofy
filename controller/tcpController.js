const dataModel = require('../models/dataModel.js');
const nodeSchema = require('../models/nodeModel.js');
const applianceSchema = require('../models/applianceModel.js');

const NETWORK_MAP_REQ = 0;
const NETWORK_MAP_RES = 1;
const SEND_APPLIANCES = 2;
const RECE_APPLIANCES = 3;

onSocketData = (data) => {
    const parsedData = JSON.parse(data.toString());
    switch (parsedData.cmd) {
        case NETWORK_MAP_RES: {
            sockets[socket.remoteAddress].uniqueIDs = parsedData.response;
        }
    }
    console.log(data.toString());
}

onSocketEnd = () => {
    delete sockets[socket.remoteAddress];
}

sendCommand = (socket,command)=>{
    const command = {};
    command.cmd = command;
    socket.write(JSON.stringify(command));
}

exports.onSocketConnection = (socket) => {
    // 'connection' listener.
    console.log('client connected' + socket.remoteAddress);
    socket.on('end', onSocketEnd);
    socket.on('data', onSocketData);
    socket.pipe(socket);
    sendCommand(socket,NETWORK_MAP_REQ);
    sendCommand(socket,SEND_APPLIANCES);
}

exports.onServerError = (err) => {
    console.log(err);
    delete sockets[socket.remoteAddress];
}
