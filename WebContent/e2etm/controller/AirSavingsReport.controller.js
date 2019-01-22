jQuery.sap.require("sap.ui.project.e2etm.util.Formatter");
jQuery.sap.require("sap.ui.project.e2etm.util.StaticUtility");
jQuery.sap.require("sap.ui.core.util.Export");
jQuery.sap.require("sap.ui.core.util.ExportType");
jQuery.sap.require("sap.ui.core.util.ExportTypeCSV");
sap.ui.controller("sap.ui.project.e2etm.controller.AirSavingsReport", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf e2etm.view.AirSavingsReport
*/
//	onInit: function() {
//
//	},
	onExport : function() {
		var table = this.getView().byId("airSavings");
		var model = oComponent.getModel();
		model.setDefaultCountMode(sap.ui.model.odata.CountMode.None);
		var sFilterParams = table.getBinding("items").sFilterParams;
		var columns = this.getExcelColumns(table);
		oExport = new sap.ui.core.util.Export({
			exportType : new sap.ui.core.util.ExportTypeCSV({
				separatorChar : ","
			}),
			models : this.getView().byId("airSavings").getModel(),
			rows : {
				path : "/"
			},
			columns : columns
		});
		oExport.saveFile("Air Savings Report").always(function() {
			this.destroy();
		});
	},
	
	getExcelColumns : function(table) {
		var columns = [];
		var table;
		// table = this.getView().byId("idItemTable");
		var cells = table.getBindingInfo("items").template.getCells();
		var cols = table.getColumns();
		for ( var i = 0; i < cols.length; i++) {
			if((cols[i].getId().indexOf("lAirline")!=-1)||(cols[i].getId().indexOf("pAirline")!=-1)||
			   (cols[i].getId().indexOf("status")!=-1)||(cols[i].getId().indexOf("remarks")!=-1)){
				if (cells[i].getBindingInfo("text")) {
					var path = cells[i].getBindingInfo("text").parts[0].path;
					// var path = cells[i].getBindingInfo("text").parts[0].path;
								
							columns.push({
								name : cols[i].getHeader().getText(),
								template : {
									content : {
										path:path,
										formatter:function(value){
											if(value!=""&&value){
												value = "\""+value+"\"";
												return value;
											}
										}
									}
								}
							});
				
				}	
			}else{
			if (cells[i].getBindingInfo("text")) {
				var path = cells[i].getBindingInfo("text").parts[0].path;
				// var path = cells[i].getBindingInfo("text").parts[0].path;
							
						columns.push({
							name : cols[i].getHeader().getText(),
							template : {
								content : "{" + path + "}"
							}
						});
			
			}
		}
		}
		return columns;
	},
	
	onSearch:function(){
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, this);
		var fromdate = this.getView().byId("idFromDate").getValue();
		var todate = this.getView().byId("idToDate").getValue();
		fromdate = fromdate+"T00:00:00";
		todate = todate+"T00:00:00";
		
		
		oComponent.getModel().read("TcktAirSavingsSet?$filter=FromDate eq datetime'"+fromdate+"' and ToDate eq datetime'"+todate+"'", null, null, true,
				// success
				jQuery.proxy(function(oData, response) {
					var model = new sap.ui.model.json.JSONModel();
					model.setData(oData.results);
					this.getView().byId("airSavings").setModel(model);
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
				},this), jQuery.proxy(function(error) {
					// error
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
				},this));
		
	}
	
/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf e2etm.view.AirSavingsReport
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf e2etm.view.AirSavingsReport
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf e2etm.view.AirSavingsReport
*/
//	onExit: function() {
//
//	}

});