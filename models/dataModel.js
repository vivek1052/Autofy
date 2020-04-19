const fs= require('promise-fs');
const path = require('path');

exports.nodes = [];

exports.writetoFile = (data)=>{
    return(fs.writeFile(path.join(path.dirname(process.mainModule.filename),"/data/node.json")
    ,JSON.stringify(data)));
}

exports.readFile = ()=>{
    return(fs.readFile(path.join(path.dirname(process.mainModule.filename),"/data/node.json")));
}