sap.ui.controller("sap.ui.project.e2etm.controller.RoomCreation", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf e2etm.view.RoomCreation
*/
	onInit : function() {
		sap.ui.core.routing.Router.getRouter("MyRouter").attachRoutePatternMatched(this.onRouteMatched, this);
//		var resModel = new sap.ui.model.odata.v2.ODataModel(resServiceUrl, {json:true,defaultOperationMode:"Client",useBatch:false	});
//		resModel.setDefaultBindingMode("TwoWay");
//		this.getView().byId("roomDet").setModel(resModel,"reservation");
	},
       onRouteMatched : function(evt) {
		
		if (evt.getParameter("name") == "roomCreate") {
//			var oShell = oComponent.oContainer.getParent();
//			oShell.setAppWidthLimited(false);
			var oArgs = evt.getParameter("arguments");
			var model = new sap.ui.model.json.JSONModel();
			model.setData({Hcode:oArgs.code,Hname:oArgs["?query"].name,Type:oArgs.type});
			this.getView().setModel(model,"viewData");
			this.getView().byId("roomDet").unbindElement("reservation");
//			this.getView().byId("roomDet").getModel("reservation").deleteCreatedEntry(
//					this.getView().byId("roomDet").getBindingContext("reservation"));
			
			var hCode = oArgs.code;
			if (oArgs.type == "Change") {
               var romno = oArgs["?query"].room;//.replace("~","/");
			   this.getView().byId("roomDet").bindElement("reservation>/RoomListSet(Hcode='" + hCode + "',Romno='"+romno+"')",
					{
					   model : "reservation"
					});
				
			} else {
				var oData = {
						Hcode : hCode,Romno:"",Rtype:"",Rcost:"",Waers: "",Rsize:"",Runit:"",Rstat:"",Floor:"",
						 Trmgr:"",Begda:"",Endda:"",Nopers:"",Rfreq:""
					};
					var oCtx = this.getView().byId("roomDet").getModel("reservation").createEntry("/RoomListSet", oData);
					this.getView().byId("roomDet").setBindingContext(oCtx,"reservation");
					this.fetchHotelDetails(hCode);
				
		

			}
		}
	},
	fetchHotelDetails:function(hCode){
		oComponent.getModel("reservation").read("/HotelDetailsSet(Hcode='"+hCode+"')", null, null, true, jQuery.proxy(function(oData, response) {
		    var oCtx = this.getView().byId("roomDet").getBindingContext("reservation");
			var data = oCtx.getModel().getProperty(oCtx.sPath);
			data.Waers = oData.Waers;
			data.Begda = oData.Begda;
			data.Endda = oData.Endda;
			data.Rcost = oData.Mrent;
	
			oCtx.getModel().setProperty(oCtx.sPath,data);

			var aInputs = [this.getView().byId("ipWaers"),this.getView().byId("ipBegda"),
			               this.getView().byId("ipEndda"),this.getView().byId("ipRcost")];
			jQuery.each(aInputs, function (i, oInput) {
				if(oInput instanceof sap.m.ComboBox || oInput instanceof sap.m.Select){
					oInput.getBinding("selectedKey").refresh(true);
				}else{
				    oInput.getBinding("value").refresh(true);
				}
			});
			
			//this.getView().byId("ipWaers").getBinding("selectedKey").refresh(true);

	},this), jQuery.proxy(function(error) {
		
		
	},this));	
	},
	onSave : function(evt) {
        if(this.validateDetails()){
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, this);
		var viewData =  this.getView().getModel("viewData").getData();
		var path = this.getView().byId("roomDet").getBindingContext("reservation").sPath;
		var oData = this.getView().byId("roomDet").getBindingContext("reservation").getModel().getProperty(path);
		oData.Hcode = viewData.Hcode;
		oData.Nopers = parseInt(oData.Nopers)
		delete oData["_bCreate"];
		delete oData["__metadata"];
		this.getView().byId("roomDet").getModel("reservation").setHeaders({Action:viewData.Type});
		this.getView().byId("roomDet").getModel("reservation").create("/RoomListSet", oData, {
			success:jQuery.proxy(function(oData, response) {
		
			if(viewData.Type == "Change")
				sap.m.MessageToast.show("Changed Successfully");
			else
			    sap.m.MessageToast.show("Created Successfully");
			
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
			
		},this),
		error: jQuery.proxy(function(error) {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
			var message;
			if(error.responseText){
				 message = JSON.parse(error.responseText).error.message.value;					
			}else{
				message = JSON.parse(error.response.body).error.message.value;
			}
			var dialog = new sap.m.Dialog({
				title: 'Error',
				type: 'Message',
				state: 'Error',
				content: new sap.m.Text({
					text: "Cannot save Request."+message
				}),
				beginButton: new sap.m.Button({
					text: 'OK',
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});

			dialog.open();
		},this)});
		
        }
	},
	validateDetails:function(){
		var path = this.getView().byId("roomDet").getBindingContext("reservation").sPath;
		var oData = this.getView().byId("roomDet").getBindingContext("reservation").getModel().getProperty(path);
		for(var prop in oData){
			if(prop == "Romno" || prop == "Rtype" || prop == "Rcost" || prop == "Waers" || prop == "Rsize" || prop=="Rfreq" ||
			    prop == "Runit" || prop == "Rstat" || prop=="Floor"|| prop == "Begda" || prop == "Endda"){
				if(oData[prop] == "" || !(oData[prop])){
					sap.m.MessageToast.show("Please enter some value");
					this.getView().byId("ip"+prop).setValueState("Error");
					return false;
				}else{
					this.getView().byId("ip"+prop).setValueState("None");
				}
			}
		}
	   return true;
	},
	onNavBack : function() {
		window.history.go(-1);
	}
/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf e2etm.view.RoomCreation
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf e2etm.view.RoomCreation
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf e2etm.view.RoomCreation
*/
//	onExit: function() {
//
//	}

});