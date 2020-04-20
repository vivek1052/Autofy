const dataModel = require('../models/dataModel.js');
const Node = require('../models/nodeModel.js');
const Appliance = require('../models/applianceModel.js');

const NODE_STATUS_REQ = 0;
const NODE_STATUS_RES = 1;


onSocketData = function (data) {
    console.log(data.toString());
    const parsedData = JSON.parse(data.toString());
    switch (parsedData.cmd) {
        case NODE_STATUS_RES: {
            this.node.setMAC(parsedData.response.mac);
            dataModel.readFile().then(content=>{
                const nodeConfig = JSON.parse(content);
                this.node.setName(nodeConfig[this.node.mac].nodeName);
            });
            parsedData.response.devices.forEach(device => {
                let appliance = new Appliance(device.i2cAddress).setPWM(device.pwm).setState(device.state);
                this.node.addAppliance(appliance);
                dataModel.readFile().then(content=>{
                    const nodeConfig = JSON.parse(content);
                    appliance.setName(nodeConfig[this.node.mac].appliances[device.i2cAddress].applianceName)
                });
            });
            break;
        }
    }

}

onSocketEnd = function () {
    // delete sockets[socket.remoteAddress];
}

sendCommand = (socket, cmd) => {
    const command = {};
    command.cmd = cmd;
    socket.write(JSON.stringify(command));
}

exports.onSocketConnection = (socket) => {
    // 'connection' listener.
    let node = new Node(socket);
    console.log('client connected' + socket.remoteAddress);
    socket.on('end', onSocketEnd.bind({ 'node': node }));
    socket.on('data', onSocketData.bind({ 'node': node }));
    socket.pipe(socket);
    // dataModel.nodes.push(node);
    global.globalNodes.push(node);
    sendCommand(socket, NODE_STATUS_REQ);
}

exports.onServerError = (err) => {
    console.log(err);
}
