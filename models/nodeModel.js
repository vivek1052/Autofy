module.exports = class Node {
    static findNodeByMAC(mac){
        global.globalNodes.forEach(node => {
            if(node.mac === mac){
                return node;
            }
        });
    }
    constructor(socket){
        this.socket = socket;
        this.appliances = [];
    }
    setMAC(mac){
        this.mac = mac;
    }
    setName(name){
        this.nodeName = name;
    }
    addAppliance(appliance){
        this.appliances.push(appliance);
    }
}