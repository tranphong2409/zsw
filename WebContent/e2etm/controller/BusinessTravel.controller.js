sap.ui.controller("sap.ui.project.e2etm.controller.BusinessTravel", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf e2etm.view.BusinessTravel
*/
	onInit: function() {
		var oModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl,{useBatch:true,defaultBindingMode:"TwoWay"});
//		//oModel.setCountSupported(false);
//		
		this.getView().setModel(oModel);
		
		var viewModel = new sap.ui.model.json.JSONModel();
		this.getView().setModel(viewModel,"viewData");
		var oShell = oComponent.oContainer.getParent();
		oShell.setAppWidthLimited(false);
//		var aDeferredGroups = oModel.getDeferredBatchGroups();
//		
//		aDeferredGroups=aDeferredGroups.concat(["myGET"]);
//
//		oModel.setDeferredBatchGroups(aDeferredGroups);
	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf e2etm.view.BusinessTravel
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf e2etm.view.BusinessTravel
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf e2etm.view.BusinessTravel
*/
//	onExit: function() {
//
//	}

});