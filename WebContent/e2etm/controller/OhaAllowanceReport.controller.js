sap.ui.controller("sap.ui.project.e2etm.controller.OhaAllowanceReport", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf e2etm.controller.OhaAllowanceReport
*/
//	onInit: function() {
//
//	},
	onCountryChange : function(evt) {
		var filter = new sap.ui.model.Filter({
			path : "MOLGA",
			operator : "EQ",
			value1 : evt.getSource().getSelectedKey()
		});

		
		
		this.getView().byId("ipHcity").getBinding("items").filter([ filter ]);
	},
	onSearch:function(){
			
		var country = this.getView().byId("ipHcnty").getSelectedKey();
		
		var month = this.getView().byId("ipMonth").getSelectedKey();
		var year = this.getView().byId("ipYear").getValue();
		this.getView().byId("ipHcnty").setValueState("None");

		this.getView().byId("ipYear").setValueState("None");
		

		if(year == ""){
			sap.m.MessageToast.show("Please enter Year");
			this.getView().byId("ipYear").setValueState("Error");
			return;
		}
		var filterString = "/OhaAllowanceRepSet?$filter=Country eq '"+country+"' and Month eq '"+month+"' and Year eq '"+year+"'";
		this.fetchDetails(filterString);
		
	},
	fetchDetails:function(filterString){
		oComponent.getModel("reservation").read(filterString, null, null, true, jQuery.proxy(function(oData, response) {
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(oData.results);
			this.getView().byId("tblOhaDet").setModel(oModel,"ohaReport");	
		

		},this), jQuery.proxy(function(error) {
			
			
		},this));
	
	//	this.getView().byId("tblHotelList").bindRows("reservation>/HotelDetailsSet");
	},
	onExportCSV:function(){			
		var table = this.getView().byId("tblOhaDet");
		var model = table.getModel("ohaReport");
		var columns = sap.ui.project.e2etm.util.StaticUtility.getAccReportsExcelColumns(table);
		sap.ui.project.e2etm.util.StaticUtility.exportCSV(table,model,"OHA Report",columns);		
	},
/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf e2etm.controller.OhaAllowanceReport
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf e2etm.controller.OhaAllowanceReport
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf e2etm.controller.OhaAllowanceReport
*/
//	onExit: function() {
//
//	}

});