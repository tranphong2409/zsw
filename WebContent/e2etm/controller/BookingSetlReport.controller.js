sap.ui.controller("sap.ui.project.e2etm.controller.BookingSetlReport", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf e2etm.view.BookingSetlReport
*/
	onInit: function() {
		this.getView().byId("ipHcnty").setVisible(false);
		sap.ui.core.routing.Router.getRouter("MyRouter").attachRoutePatternMatched(this.onRouteMatched, this);
		
		
//		if(this.getView().getId()=="accSetlView"){
//			 sap.ui.project.e2etm.util.StaticUtility.fetchBookingDetails(this,"RPSR",this.getView().byId("tblSetlRep"));
//		}
	},
	onRouteMatched : function(evt) {
		
	//	this.fetchDetails();
//		if(evt.getParameter("name") == "booksetlreport")
//		    sap.ui.project.e2etm.util.StaticUtility.fetchBookingDetails(this,"RPSR",this.getView().byId("tblSetlRep"));
	},
	onSearch:function(){
		sap.ui.project.e2etm.util.StaticUtility.fetchBookingDetails(this,"RPSR",this.getView().byId("tblSetlRep"));
	},
	fetchDetails:function(){
		oComponent.getModel("reservation").read("/BookingDetailsSet?$filter=RepType eq 'RPSR'", null, null, true, jQuery.proxy(function(oData, response) {

			
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(oData.results);
			this.getView().byId("tblSetlRep").setModel(oModel,"bookReport");	

		},this), jQuery.proxy(function(error) {
			
			
		},this));
	},
	onLiveSearch:function(evt){
		var value = evt.getSource().getValue();
	
		var aFilters = [
			new sap.ui.model.Filter({path:"Romno",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Hname",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Begda",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Endda",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Reinr",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Days",operator:"Contains",value1:value}),
		            	//new sap.ui.model.Filter({path:"Month",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"AccType",operator:"Contains",value1:value}),
		            	new sap.ui.model.Filter({path:"ActRent",operator:"Contains",value1:value}),
		            	new sap.ui.model.Filter({path:"Waers",operator:"Contains",value1:value}),
		             	];
		
		var oFilter = new sap.ui.model.Filter(aFilters,false);
		this.getView().byId("tblSetlRep").getBinding("rows").filter(oFilter);
	},
	onEntriesDisplay:function(evt){
		this.getView().byId("tblSetlRep").setVisibleRowCount(parseInt(evt.getSource().getSelectedKey()));
	},
	onExportCSV:function(){			
		var table = this.getView().byId("tblSetlRep");
		var model = table.getModel("bookReport");
		var columns = sap.ui.project.e2etm.util.StaticUtility.getAccReportsExcelColumns(table);
		sap.ui.project.e2etm.util.StaticUtility.exportCSV(table,model,"Settlement Report",columns);		
	},
/**

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf e2etm.view.BookingSetlReport
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf e2etm.view.BookingSetlReport
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf e2etm.view.BookingSetlReport
*/
//	onExit: function() {
//
//	}

});