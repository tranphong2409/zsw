sap.ui.controller("sap.ui.project.e2etm.controller.OfficeLocation", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf e2etm.view.OfficeLocation
*/
	onInit: function() {
		sap.ui.core.routing.Router.getRouter("MyRouter")
		.attachRoutePatternMatched(this.onRouteMatched, this);
	},
	onRouteMatched:function(evt){
		if (evt.getParameter("name") == "officeLocation") {
			var oShell = oComponent.oContainer.getParent();		
			oShell.setAppWidthLimited(false);
			var oArgs = evt.getParameter("arguments");
			var model = new sap.ui.model.json.JSONModel();
			model.setData({Hcode:oArgs.code,Hname:oArgs["?query"].name});
			this.getView().setModel(model,"viewData");
			this.getView().byId("locDet").unbindElement("reservation");
			var oData = {
					Hcode:oArgs.code,Cname : "",Aname:"",Distance:"",Timed:"",Timew:""
				};
				var oCtx = this.getView().byId("locDet").getModel("reservation").createEntry(
						"/OfficeLocationsSet", oData);
			this.getView().byId("locDet").setBindingContext(oCtx,"reservation");
			this.refreshListData();
		  		
		}			
	},
	refreshListData:function(){
		var viewData = this.getView().getModel("viewData").getData();	
	   
	oComponent.getModel("reservation").read("/OfficeLocationsSet?$filter=Hcode eq '"+viewData.Hcode+"'", null, null, true, jQuery.proxy(function(oData, response) {
		var oModel = new sap.ui.model.json.JSONModel();
		oModel.setData(oData.results);
		this.getView().byId("tblOfficeList").setModel(oModel,"locations");	

	},this), jQuery.proxy(function(error) {
		
		
	},this));
	},
	onAdd:function(evt){
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, this);
    	
    	var viewData =  this.getView().getModel("viewData").getData();
    
	var path = this.getView().byId("locDet").getBindingContext("reservation").sPath;
	var oData = this.getView().byId("locDet").getBindingContext("reservation").getModel().getProperty(path);
	
	delete oData["_bCreate"];
	delete oData["__metadata"];
	//oData.Hcode = viewData.Hcode;
//	this.getView().byId("hotelDet").getModel("hotelDet").setHeaders({Action:viewData.Type});
	this.getView().byId("locDet").getModel("reservation").create("/OfficeLocationsSet", oData, {
		success:jQuery.proxy(function(oData, response) {	
	
			sap.m.MessageToast.show("Updated Successfully");
			this.refreshListData();		
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
	},this),
	    error: jQuery.proxy(function(error) {

		sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
	
	
	},this)});
	},
	onDelete:function(){
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, this);
		var items = this.getView().byId("tblOfficeList").getSelectedIndices();
		if(items.length==0){
			sap.m.MessageToast.show("Please select atleast one Office Location");
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
			return;
		}
		var rows = this.getView().byId("tblOfficeList").getRows();
		var oData={HotelDetailsToLocNav:[]};
		for(var i=0;i<items.length;i++){
			var row = rows[items[i]];
			var data = row.getBindingContext("locations").getModel().getProperty(row.getBindingContext("locations").sPath);
			
			delete data["__metadata"];
			oData.HotelDetailsToLocNav.push(data);
		}
		
		oComponent.getModel("reservation").create("/HotelDetailsSet", oData, {success:jQuery.proxy(function(oData, response) {
			// oController.uploadFiles(global.ZZ_TRV_REQ);
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
		
			sap.m.MessageToast.show("Deleted Successfully", {
				duration : 10000,
				closeOnBrowserNavigation : false
			});
			this.refreshListData();		
		},this), error:jQuery.proxy(function(error) {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
			sap.m.MessageToast.show("Internal Server Error");
		},this)});
	},
	onLiveSearch:function(evt){
		var value = evt.getSource().getValue();
		var model = new sap.ui.model.Filter({path:"Cname",operator:"Contains",value1:value});
		var aFilters = [new sap.ui.model.Filter({path:"Aname",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Distance",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Timed",operator:"Contains",value1:value}),
		             
		             	];
		
		var oFilter = new sap.ui.model.Filter(aFilters,false);
		this.getView().byId("tblOfficeList").getBinding("rows").filter(oFilter);
	},
	onNavBack : function() {
		window.history.go(-1);
	}
/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf e2etm.view.OfficeLocation
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf e2etm.view.OfficeLocation
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf e2etm.view.OfficeLocation
*/
//	onExit: function() {
//
//	}

});