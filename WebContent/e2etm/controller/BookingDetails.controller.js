//Monthly Rent Report
jQuery.sap.require("sap.m.TablePersoController");
jQuery.sap.require("sap.ui.table.TablePersoController");
sap.ui.controller("sap.ui.project.e2etm.controller.BookingDetails", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf e2etm.view.CostAnalysis
*/
	onInit: function() {
		sap.ui.core.routing.Router.getRouter("MyRouter").attachRoutePatternMatched(this.onRouteMatched, this);
		var tbl = this.getView().byId("tblBookDet");
		var columns = tbl.getColumns();
		var vOrder = 0;
		var aColumns = columns.map(function(column,index){
			var cId =  column.getId(); 
			var bPass = cId.indexOf("PernrCol")!=-1 || cId.indexOf("ReinrCol")!=-1 || cId.indexOf("HnameCol")!=-1 ||
			            cId.indexOf("RomnoCol")!=-1 || cId.indexOf("CountryCol")!=-1 || cId.indexOf("MonthTxtCol")!=-1 ||
			            cId.indexOf("BegdaCol")!=-1 || cId.indexOf("EnddaCol")!=-1 || cId.indexOf("DaysCol")!=-1 || 
			            cId.indexOf("MrentCol")!=-1 || cId.indexOf("DrentCol")!=-1 || cId.indexOf("ActRentCol")!=-1 || 
			            cId.indexOf("TotalRentCol")!=-1 || cId.indexOf("WaersCol")!=-1;

				vOrder = vOrder + 1;
	
				return {
					id : tbl.getId()+"-"+cId,
					order:vOrder,
					text: column.getLabel().getText(),
					visible: bPass
				};

		});
		
		
		var DemoPersoService = {

				oData : {
					_persoSchemaVersion: "1.0",
					aColumns : aColumns
				},

				getPersData : function () {
					var oDeferred = new jQuery.Deferred();
					if (!this._oBundle) {
						this._oBundle = this.oData;
					}
					var oBundle = this._oBundle;
					oDeferred.resolve(oBundle);
					return oDeferred.promise();
				},

				setPersData : function (oBundle) {
					var oDeferred = new jQuery.Deferred();
					this._oBundle = oBundle;
					oDeferred.resolve();
					return oDeferred.promise();
				},
				
				delPersData : function (oBundle) {
					var oDeferred = new jQuery.Deferred();
				
					oDeferred.resolve();
					return oDeferred.promise();
				},
			
				resetPersData : function () {
					var oDeferred = new jQuery.Deferred();
					var oInitialData = {
							_persoSchemaVersion: "1.0",
							aColumns : aColumns
					};

					//set personalization
					this._oBundle = oInitialData;
					
					oDeferred.resolve();
					return oDeferred.promise();
				},
			

			};
		this.persTable = new sap.ui.table.TablePersoController({
			table: this.getView().byId("tblBookDet"),
			persoService: DemoPersoService,
		});
		this.persTable.savePersonalizations();
//		this.persTable.refresh();
	},
	onSettings:function(evt){
		this.persTable.openDialog();
	},
	onRouteMatched : function(evt) {
		//if(evt.getParameter("name") == "bookingdetails")
	//	sap.ui.project.e2etm.util.StaticUtility.fetchBookingDetails(this,"RPBD",this.getView().byId("tblBookDet"));
		if(evt.getParameter("name") == "bookingdetails")
		   this.persTable.refresh();
	},
	onSearch:function(){
		sap.ui.project.e2etm.util.StaticUtility.fetchBookingDetails(this,"RPBD",this.getView().byId("tblBookDet"));
	},
	onLiveSearch:function(evt){
		var value = evt.getSource().getValue();
	
		var aFilters = [new sap.ui.model.Filter({path:"Pernr",operator:"Contains",value1:value}),
			new sap.ui.model.Filter({path:"Romno",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Hname",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"BegdaTxt",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"EnddaTxt",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Reinr",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Days",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"MonthTxt",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Rsize",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Runit",operator:"Contains",value1:value}),
		             	
		             	new sap.ui.model.Filter({path:"Mrent",operator:"Contains",value1:value}),
		            	new sap.ui.model.Filter({path:"Drent",operator:"Contains",value1:value}),
		              	new sap.ui.model.Filter({path:"ActRent",operator:"Contains",value1:value}),
		            	new sap.ui.model.Filter({path:"Country",operator:"Contains",value1:value}),
		              	new sap.ui.model.Filter({path:"TotalRent",operator:"Contains",value1:value}),
		            	new sap.ui.model.Filter({path:"Waers",operator:"Contains",value1:value}),
		            	
		             	];
		
		var oFilter = new sap.ui.model.Filter(aFilters,false);
		this.getView().byId("tblBookDet").getBinding("rows").filter(oFilter);
	},
	onEntriesDisplay:function(evt){
		this.getView().byId("tblBookDet").setVisibleRowCount(parseInt(evt.getSource().getSelectedKey()));
	},
	onExportCSV:function(){			
		var table = this.getView().byId("tblBookDet");
		var model = table.getModel("bookReport");
		var columns = sap.ui.project.e2etm.util.StaticUtility.getAccReportsExcelColumns(table);
		sap.ui.project.e2etm.util.StaticUtility.exportCSV(table,model,"Montly Rent",columns);		
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
					if (results[j].ActRent != undefined)
						amount = amount + parseFloat(results[j].ActRent);
					
					
				}
				
			}
			oData.push({ActRent:amount,Waers:currencyList[i]});
		}
		var oModel = new sap.ui.model.json.JSONModel();
		oModel.setData(oData);
		this.getView().byId("tblFooter").setModel(oModel,"footer")
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