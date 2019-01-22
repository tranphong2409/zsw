sap.ui.controller("sap.ui.project.e2etm.controller.CostAnalysis", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf e2etm.view.CostAnalysis
*/
	onInit: function() {
		sap.ui.core.routing.Router.getRouter("MyRouter").attachRoutePatternMatched(this.onRouteMatched, this);
	},
	onRouteMatched : function(evt) {
			
			
	},
	onCountryChange : function(evt) {
		var filter = new sap.ui.model.Filter({
			path : "MOLGA",
			operator : "EQ",
			value1 : evt.getSource().getSelectedKey()
		});

		
		
		this.getView().byId("ipHcity").getBinding("items").filter([ filter ]);
	},
	onSearch:function(){
		sap.ui.project.e2etm.util.StaticUtility.onOccCostReportSearch(this,"CostAnalysisSet");	
		
	},
	fetchDetails:function(filterString){
		oComponent.getModel("reservation").read(filterString, null, null, true, jQuery.proxy(function(oData, response) {
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(oData.results);
			this.getView().byId("tblCostList").setModel(oModel,"costReport");	
			this.calculateTotalValues(oData.results);
		},this), jQuery.proxy(function(error) {
			
			
		},this));
	
	//	this.getView().byId("tblHotelList").bindRows("reservation>/HotelDetailsSet");
	},
	calculateTotalValues:function(results){
		var currencyList = [];
		var oData = [];
	
		for ( var i = 0; i < results.length; i++) {
			if (currencyList.indexOf(results[i].Waers) == -1) {
				currencyList.push(results[i].Waers);
			}
		
		}
		// Paid by emp,paid by cmp,currency
		for ( var i = 0; i < currencyList.length; i++) {
           var amount = 0;
           var noccamt = 0;
			for ( var j = 0; j < results.length; j++) {
				if (results[j].Waers == currencyList[i]) {
					if (results[j].Amount != undefined)
						amount = amount + parseFloat(results[j].Amount);
					if (results[j].NoccAmt != undefined)
						noccamt = noccamt + parseFloat(results[j].NoccAmt);
					
				}
				
			}
			oData.push({Amount:amount,NoccAmt:noccamt,Waers:currencyList[i]});
		}
		var oModel = new sap.ui.model.json.JSONModel();
		oModel.setData(oData);
		this.getView().byId("tblFooter").setModel(oModel,"footer")
	},
	onLiveSearch:function(evt){
		var value = evt.getSource().getValue();
		
		var aFilters = [new sap.ui.model.Filter({path:"Hname",operator:"Contains",value1:value}),
		            	new sap.ui.model.Filter({path:"Nrooms",operator:"EQ",value1:value}),
		             	new sap.ui.model.Filter({path:"Amount",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"NoccAmt",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"NoccDays",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"MonthTxt",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Waers",operator:"Contains",value1:value}),
		            	new sap.ui.model.Filter({path:"Country",operator:"Contains",value1:value}),
		            	new sap.ui.model.Filter({path:"City",operator:"Contains",value1:value}),
		        
		             	
		             	];
		
		var oFilter = new sap.ui.model.Filter(aFilters,false);
		this.getView().byId("tblCostList").getBinding("rows").filter(oFilter);
	},
	onEntriesDisplay:function(evt){
		this.getView().byId("tblCostList").setVisibleRowCount(parseInt(evt.getSource().getSelectedKey()));
	},
	onExportCSV:function(){			
		var table = this.getView().byId("tblCostList");
		var model = table.getModel("costReport");
		var columns = sap.ui.project.e2etm.util.StaticUtility.getAccReportsExcelColumns(table);
		sap.ui.project.e2etm.util.StaticUtility.exportCSV(table,model,"Cost Analysis",columns);		
	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf e2etm.view.CostAnalysis
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf e2etm.view.CostAnalysis
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf e2etm.view.CostAnalysis
*/
//	onExit: function() {
//
//	}

});