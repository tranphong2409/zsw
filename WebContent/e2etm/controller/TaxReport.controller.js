jQuery.sap.require("sap.ui.project.e2etm.util.Formatter");
jQuery.sap.require("sap.ui.project.e2etm.util.StaticUtility");
jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("sap.m.MessageToast");
jQuery.sap.require("sap.ui.core.util.Export");
jQuery.sap.require("sap.ui.core.util.ExportType");
jQuery.sap.require("sap.ui.core.util.ExportTypeCSV");

sap.ui.controller("sap.ui.project.e2etm.controller.TaxReport", {

	onInit : function(evt) {
		sap.ui.core.routing.Router.getRouter("MyRouter").attachRoutePatternMatched(this.onRouteMatched, this);
	},
	
	onRouteMatched : function(evt) {
		var oShell = oComponent.oContainer.getParent();
		// Put the routename that will be displayed in bigger screen
		oShell.removeStyleClass("customShell1");
		oShell.addStyleClass("customShell2");
	},
	
	backPress : function(evt) {
		sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
	},
	
	onSearch: function(evt){
		var aFilters =[];
		var sCheck = sap.ui.project.e2etm.util.StaticUtility.checkDate(this,this.getView().byId("idFromDate"), this.getView().byId("idToDate"));
		if(sCheck == true){
			
			//check and get fromdate
			var sFromDate = this.getView().byId("idFromDate").getValue();
			// check and get todate
			var sToDate = this.getView().byId("idToDate").getValue();
			
			if(sFromDate != "" && sToDate != ""){
//				sFromDate= sap.ui.project.e2etm.util.StaticUtility.formatDate(sFromDate);
				var oDateFilter = new sap.ui.model.Filter({ path: "ZZ_DEP_STDATE", operator: "BT", value1: sFromDate, value2: sToDate });
				aFilters.push(oDateFilter);
			}
		}
		searchString = this.getView().byId("idSearch").getValue();
		if (searchString != "") {
			var oDateFilterSearch = new sap.ui.model.Filter({ path: "ZZ_OWNER", operator: "EQ", value1: searchString });
			aFilters.push(oDateFilterSearch);
		}
		
		var oFilter = new sap.ui.model.Filter(aFilters,true);
			// Build the nested filter with ORs between the values of each group and
			// ANDs between each group
		this.getView().byId("taxReportTable").getBinding("items").filter(oFilter);
	},
	
//	onExportExcel : function(oEvent) {
//		var id = "#" + this.getView().byId("taxReportTable").getTableDomRef().id;
//		$(id).tableExport({type:'excel',escape:'false'});
//	}
	
	onExportExcel : function(oEvent) {
		var table = this.getView().byId("taxReportTable");
		
		var sFilterParams = table.getBinding("items").sFilterParams;
		var columns = sap.ui.project.e2etm.util.StaticUtility.getExcelColumns(table);
		oExport = new sap.ui.core.util.Export({
			exportType : new sap.ui.core.util.ExportTypeCSV({
				separatorChar : ","
			}),
			models : oComponent.getModel(),
			rows : {
				path : "/ZE2E_TAX_REPORTSet?"+sFilterParams
			},
			columns : columns
		});

	oExport.saveFile("Tax Report").always(function() {
		this.destroy();
	});
	},
});