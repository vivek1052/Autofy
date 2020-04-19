sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment"
], function (Controller, JSONModel,Fragment) {
	"use strict";
	return Controller.extend("autofy.controller.App", {

		onInit : function () {
			this.jsonModel = new JSONModel('/nodes')
			this.getView().setModel(this.jsonModel,"nodes");
		},

		onChange: function (oEvent) {
			var bState = oEvent.getParameter("state");
			this.byId("ready").setVisible(bState);
		},

		onMaintTablePress: function(oEvent){
			if(this.maintDialog){
				this.maintDialog.openBy(oEvent.getSource());
			}else{
				Fragment.load({
					name: "autofy.views.maintTable",
					controller: this
				}).then(function(oMainDialog){
					this.maintDialog = oMainDialog;
					this.getView().addDependent(this.maintDialog);
					this.maintDialog.openBy(oEvent.getSource());
				}.bind(this));
			}
		},
		onSaveMaintainence:function(){
			const jsonModelData = this.jsonModel.getData();
			const body = {};
			jsonModelData.forEach(function(nodeData){
				body[nodeData.mac] = {};
				body[nodeData.mac].appliances = {};
				body[nodeData.mac].nodeName = nodeData.nodeName;
				nodeData.appliances.forEach(function(appliance){
					body[nodeData.mac].appliances[appliance.i2caddress] = {};
					body[nodeData.mac].appliances[appliance.i2caddress].applianceName = appliance.applianceName;
				})
			});
			$.ajax({
				url: "/nodes",
				type: "POST",
				contentType: "application/json",
				dataType: "json",
				data:JSON.stringify(body),
				success: function(response){
					this.maintDialog.close();
				}.bind(this),
				error: function(err){
					this.maintDialog.close();
					console.log(err);
				}.bind(this)
			});
		},
		onCancelMaintainence:function(){
			this.maintDialog.close();
		}

	});
});