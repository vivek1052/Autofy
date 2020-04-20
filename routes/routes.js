const express = require('express');
const router = express.Router();
const path = require('path');
const dataModel = require('../models/dataModel.js');
const NodeClass = require('../models/nodeModel.js');

router.get("/",(req,res,next)=>{
    res.sendFile(path.join(path.dirname(process.mainModule.filename),"/index.html"))
  });

router.get("/nodes",(req,res,next)=>{
    const nodes=[];
    global.globalNodes.forEach((node)=>{
      const appliances = [];
      node.appliances.forEach(appliance=>{
        appliances.push({i2caddress:appliance.i2cAddress,
                        applianceName:appliance.applianceName,
                        state:appliance.state,
                        pwm:appliance.pwm }); 
      });
      nodes.push({mac:node.mac,
                  nodeName: node.nodeName,
                  appliances: appliances});
    });
    res.json(nodes);
  });

  router.post("/nodes",(req,res,next)=>{
    console.log(req.body);
    dataModel.writetoFile(req.body).then((fulfilled)=>{
      res.sendStatus(200);
    }).catch((err)=>{
      res.sendStatus(500).send(err);
    });
    
  });

  module.exports = router;