exports = class Appliance{
    constructor(i2cAddress,name){
        this.i2cAddress = i2cAddress;
        this.name = name;
    }
    setState(state){
        this.state = state;
    }
}