exports = class Node{
    constructor(socket){
        this.socket = socket;
    }
    setMAC(mac){
        this.mac = mac;
    }
    setName(name){
        this.name = name;
    }
    addAppliance(appliance){
        this.appliances.push(appliance);
    }
}