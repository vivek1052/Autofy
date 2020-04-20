const dataModel = require('../models/dataModel.js');

const NODE_STATUS_REQ = 0;
const NODE_STATUS_RES = 1;


onSocketData = function (data) {
    let parsedData = {};
    try {
        parsedData = JSON.parse(data.toString());
    } catch (e) {
        return;
    }
    switch (parsedData.cmd) {
        case NODE_STATUS_RES: {
            const response = parsedData.response || {};
            if (!response.mac) {
                return;
            }
            const node = new dataModel.Node(this.socket);
            global.globalNodes.push(node);
            node.setMAC(response.mac);
            dataModel.readFile().then(content => {
                const nodeConfig = JSON.parse(content);
                if (nodeConfig[node.mac] && nodeConfig[node.mac].nodeName) {
                    node.setName(nodeConfig[node.mac].nodeName);
                }
            });
            const devices = response.devices || [];
            devices.forEach(device => {
                const appliance = new dataModel.Appliance(device.i2cAddress).setPWM(device.pwm).setState(device.state);
                node.addAppliance(appliance);
                dataModel.readFile().then(content => {
                    const nodeConfig = JSON.parse(content);
                    if (nodeConfig[node.mac] && nodeConfig[node.mac].appliances &&
                        nodeConfig[node.mac].appliances[device.i2cAddress] &&
                        nodeConfig[node.mac].appliances[device.i2cAddress].applianceName) {
                        appliance.setName(nodeConfig[node.mac].appliances[device.i2cAddress].applianceName);
                    }
                });
            });
            break;
        }
    }
}

onSocketEnd = function () {
    global.globalNodes.forEach((node, index) => {
        if (node.socket === this.socket) {
            console.log("Connection ended with " + global.globalNodes[index].mac);
            global.globalNodes.splice(index, 1);
        }
    });
}

sendCommand = (socket, cmd) => {
    const command = {};
    command.cmd = cmd
    socket.write(JSON.stringify(command));
}

exports.onSocketConnection = (socket) => {
    // 'connection' listener.
    console.log('client connected' + socket.remoteAddress);
    socket.on('end', onSocketEnd.bind({ 'socket': socket }));
    socket.on('data', onSocketData.bind({ 'socket': socket }));
    socket.pipe(socket);
    sendCommand(socket, NODE_STATUS_REQ);
}

exports.onServerError = (err) => {
    console.log(err);
}
