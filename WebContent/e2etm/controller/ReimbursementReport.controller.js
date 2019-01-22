jQuery.sap.require("sap.ui.project.e2etm.util.Formatter");
jQuery.sap.require("sap.ui.project.e2etm.util.StaticUtility");
jQuery.sap.require('sap.ui.project.e2etm.controls.customStage');
jQuery.sap.require('sap.ui.project.e2etm.controls.stageItem');
jQuery.sap.require("sap.m.MessageToast");
jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("sap.ui.core.util.Export");
jQuery.sap.require("sap.ui.core.util.ExportType");
jQuery.sap.require("sap.ui.core.util.ExportTypeCSV");
sap.ui.controller("sap.ui.project.e2etm.controller.ReimbursementReport", {

	onInit : function() {
		sap.ui.core.routing.Router.getRouter("MyRouter").attachRoutePatternMatched(this.onRouteMatched, this);
//		this.getView().setModel(sap.ui.getCore().getModel("profile"), "profile");
//		this.getView().setModel(sap.ui.getCore().getModel("global"), "global");
//		this.doInit();

		
	},

//	=======================================EVENT==============================================
	onRouteMatched: function(evt){

		if(evt.getParameter("name")=="home"){
			
		} else if(evt.getParameter("name")=="ReimbursementReport") {
			var sRole = sap.ui.getCore().getModel("global").getData().sRole;
			var sAction = sap.ui.getCore().getModel("global").getData().sAction;
			
			var oModel = this.getView().getModel();
			oModel.setSizeLimit(500);
			oModel.setHeaders({sRole:sRole, sAction: sAction});
//			oModel.refresh(true,false);
//			this.getView().byId("idSearch").fireSearch();
			
		}
	},

	onBack: function(){
		sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
	},
	
	onSearch: function(){
		var sCheck = sap.ui.project.e2etm.util.StaticUtility.checkDate(this,this.getView().byId("idFromDate"), this.getView().byId("idToDate"));
		if(sCheck == true){
			var aFilters =[];

			//check and get fromdate
			var sFromDate = this.getView().byId("idFromDate").getValue();
//			if(sFromDate != ""){
////				sFromDate= sap.ui.project.e2etm.util.StaticUtility.formatDate(sFromDate);
//				var oDateFilterFrom = new sap.ui.model.Filter({ path: "ZZ_OWNER", operator: "GE", value1: sFromDate });
//				aFilters.push(oDateFilterFrom);
//			}
//			
//			// check and get todate
			var sToDate = this.getView().byId("idToDate").getValue();
//			//get time by the end of the day		
//			if(sToDate != ""){
////				sToDate= sap.ui.project.e2etm.util.StaticUtility.formatDate(sToDate);
//				var oDateFilterTo = new sap.ui.model.Filter({ path: "ZZ_TRV_REQ", operator: "LE", value1: sToDate });
//				aFilters.push(oDateFilterTo);
//			}
			
//			sFromDate= sap.ui.project.e2etm.util.StaticUtility.formatDate(sFromDate);
			var oDateFilter = new sap.ui.model.Filter({ path: "ZZ_OWNER", operator: "BT", value1: sFromDate, value2: sToDate });
			aFilters.push(oDateFilter);
			
			var searchString = this.getView().byId("idSearch").getValue();
			var oDateFilterSearch = new sap.ui.model.Filter({ path: "SNAME", operator: "EQ", value1: searchString });
			aFilters.push(oDateFilterSearch);
			
			// post sub modid to back end
			var sSmodid = sap.ui.getCore().getModel("global").getData().sSmodid;
			var oDateFilterSmodid = new sap.ui.model.Filter({ path: "ZZ_EXP_INCUR", operator: "EQ", value1: sSmodid });
			aFilters.push(oDateFilterSmodid);
			
			//get search for department
			var searchDept = this.getView().byId("idSearchDept").getValue();
			var oDateFilterSearchDep = new sap.ui.model.Filter({ path: "ZZ_COMMENTS", operator: "Contains", value1: searchDept });
			aFilters.push(oDateFilterSearchDep);

			var oFilter = new sap.ui.model.Filter(aFilters,true);
		
			
				// Build the nested filter with ORs between the values of each group and
				// ANDs between each group
			this.fnApplyFilter(oFilter);
			
		}
	},
	
	fnApplyFilter:function(aFilter){
		this.getView().byId("idItemTable").getBinding("items").filter(aFilter);
//		this.getView().byId("idItemTable").getBinding("items").sort([new sap.ui.model.Sorter("SERIAL")]);
	},
	// on nav back
	onNavPress: function(){
		sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
	},
	
//	onExportExcel : function(oEvent) {
//		var id = "#" + this.getView().byId("idItemTable").getTableDomRef().id;
//		$(id).tableExport({type:'excel',escape:'false'});
//	},
	
	onExportExcel : function(oEvent) {
		var table = this.getView().byId("idItemTable");
		var sFilterParams = table.getBinding("items").sFilterParams;
		var columns = sap.ui.project.e2etm.util.StaticUtility.getExcelColumns(table);
		oExport = new sap.ui.core.util.Export({
			exportType : new sap.ui.core.util.ExportTypeCSV({
				separatorChar : ","
			}),
			models : oComponent.getModel(),
			rows : {
				path : "/ZE2E_REI_REPORTSet?"+sFilterParams
			},
			columns : columns
		});

	oExport.saveFile("Reimbursement Report").always(function() {
		this.destroy();
	});
	},

//	====================================END OF FUNCTION=========================================


});