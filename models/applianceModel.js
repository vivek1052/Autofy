'use strict'
module.exports = class Appliance{
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