jQuery.sap.require("sap.ui.project.e2etm.util.Formatter");
jQuery.sap.require("sap.ui.project.e2etm.util.StaticUtility");
sap.ui.controller("sap.ui.project.e2etm.controller.DepuMonthlyRep", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf e2etm.view.DepuMonthlyRep
*/
//	onInit: function() {
//
//	},
	onSearch:function(){
		var month = this.getView().byId("ipMonth").getSelectedKey();
		var year = this.getView().byId("ipYear").getValue();
		var asgTyp = this.getView().byId("ipAsgtyp").getSelectedKey();
		var aFilters = [];
		if(month!="")
			aFilters.push(new sap.ui.model.Filter({path:"Month",operator:"EQ",value1:month}));
		if(asgTyp!="")
			aFilters.push(new sap.ui.model.Filter({path:"AsgType",operator:"EQ",value1:asgTyp}));
		if(year!="")
			aFilters.push(new sap.ui.model.Filter({path:"Year",operator:"EQ",value1:year}));
		
		if(aFilters.length == 0){
			sap.m.MessageToast.show("Please enter atleast one search criteria");
			return;
		}
		
		if(this.getView().byId("rbtnOn").getSelected() && this.getView().byId("rbtnRt").getSelected()){
			//var mode = 'ONRT';
			aFilters.push(new sap.ui.model.Filter({path:"Mode",operator:"EQ",value1:"'ONRT'"}));
		}else{
		if(this.getView().byId("rbtnOn").getSelected()){
			aFilters.push(new sap.ui.model.Filter({path:"Begda",operator:"EQ",value1:year+month+"%"}));
		}else{
			aFilters.push(new sap.ui.model.Filter({path:"Endda",operator:"EQ",value1:year+month+"%"}));
		}
		}
		
		//this.getView().byId("tblHotelList").bindAggregation("rows",{path:"/AsgMonthlyRepSet",filters:aFilters});
		oComponent.getModel().read("/AsgMonthlyRepSet", {async:true, filters:aFilters, success:jQuery.proxy(function(oData, response) {
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(oData.results);
			this.getView().byId("tblList").setModel(oModel,"asgReport");	

		},this), error: jQuery.proxy(function(error) {
			
			
		},this)});

	},
	onLiveSearch:function(evt){
		var value = evt.getSource().getValue();
		var model = new sap.ui.model.Filter({path:"Pernr",operator:"Contains",value1:value});
		var aFilters = [new sap.ui.model.Filter({path:"Name",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Begda",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Endda",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Tocntry",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Toloc",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Duration",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Mname",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Mno",operator:"Contains",value1:value}),
		            	new sap.ui.model.Filter({path:"OAddress",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Department",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Section",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"BU",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Level",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Status",operator:"Contains",value1:value}),
		            	new sap.ui.model.Filter({path:"Cldate",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Andate",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Invdate",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Predate",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"S2Docs",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"VisaCl",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Contact",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"GID",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"HostEntity",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"AsgType",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Dependents",operator:"Contains",value1:value}),
		             	];
		
		var oFilter = new sap.ui.model.Filter(aFilters,false);
		this.getView().byId("tblList").getBinding("rows").filter(oFilter);
	},
	onExportCSV:function(){			
		var table = this.getView().byId("tblList");
		var model = table.getModel("asgReport");
		var columns = sap.ui.project.e2etm.util.StaticUtility.getAccReportsExcelColumns(this.getView().byId("tblList"));
		sap.ui.project.e2etm.util.StaticUtility.exportCSV(table,model,"Monthly Report",columns);		
	},
/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf e2etm.view.DepuMonthlyRep
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf e2etm.view.DepuMonthlyRep
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf e2etm.view.DepuMonthlyRep
*/
//	onExit: function() {
//
//	}

});