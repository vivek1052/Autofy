const fs= require('promise-fs');
const path = require('path');

exports.writetoFile = (data)=>{
    return(fs.writeFile(path.join(path.dirname(process.mainModule.filename),"/data/node.json")
    ,JSON.stringify(data)));
}

exports.readFile = ()=>{
    return(fs.readFile(path.join(path.dirname(process.mainModule.filename),"/data/node.json")));
}

module.exports.Node = class{
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

exports.Appliance = class{
    constructor(i2cAddress){
        this.i2cAddress = i2cAddress;
    }
    setState(state){
        this.state = state;
        return this;
    }
    setName(name){
        this.applianceName = name;
        return this;
    }
    setPWM(value){
        this.pwm = value;
        return this;
    }
}