jQuery.sap.require("sap.ui.project.e2etm.util.Formatter");
jQuery.sap.require("sap.ui.project.e2etm.util.StaticUtility");
jQuery.sap.require('sap.ui.project.e2etm.controls.customStage');
jQuery.sap.require('sap.ui.project.e2etm.controls.stageItem');
jQuery.sap.require("sap.m.MessageToast");
jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("sap.ui.core.util.Export");
jQuery.sap.require("sap.ui.core.util.ExportType");
jQuery.sap.require("sap.ui.core.util.ExportTypeCSV");
sap.ui.controller("sap.ui.project.e2etm.controller.CargoReport", {

	onInit : function() {
		sap.ui.core.routing.Router.getRouter("MyRouter").attachRoutePatternMatched(this.onRouteMatched, this);
//		this.getView().setModel(sap.ui.getCore().getModel("profile"), "profile");
//		this.getView().setModel(sap.ui.getCore().getModel("global"), "global");
//		this.doInit();

		
	},

//	=======================================EVENT==============================================
	onRouteMatched: function(evt){

		if(evt.getParameter("name")=="home"){
			
		} else if(evt.getParameter("name")=="CargoReport") {
			var CARGOTYPE = sap.ui.getCore().getModel("global").getData().CARGOTYPE;
			var oModel = this.getView().getModel();
			oModel.setHeaders({CARGOTYPE:CARGOTYPE});
			if(CARGOTYPE=="CARO"){
				//this.getView().byId("idItemTable").getColumns()[10].setVisible(false);
				this.getView().byId("cargoPage").setTitle("CARGO REPORT FOR ONWARD");
			}else{
				//this.getView().byId("idItemTable").getColumns()[10].setVisible(true);
				this.getView().byId("cargoPage").setTitle("CARGO REPORT FOR RETURN");
			}
//			oModel.refresh(true,false);
			this.getView().byId("idSearch").fireSearch();
			
		}
	},

	onBack: function(){
		sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
	},
	checkDate:function(ref,oFromDate,oToDate){
		var FromDate = oFromDate.getValue();
		var ToDate = oToDate.getValue();
//			reset 
		if(FromDate!=""&&ToDate!="")
			{
		oFromDate.setValueState("None");
		oToDate.setValueState("None");
//			parse format to Date		
		var oDateFormat = sap.ui.core.format.DateFormat
		.getDateTimeInstance({
			pattern : "yyyyMMddHHmmss"
		});
		var FromDateVL = oDateFormat.parse(FromDate);
		var ToDateVL = oDateFormat.parse(ToDate);
       if(FromDateVL > ToDateVL){
			sap.m.MessageToast.show("Date is invalid");
			oToDate.setValueState("Error");
			oFromDate.setValueState("Error");
			return false;
		}
			}
		return true;
	},
	
	onSearch: function(){
		var sCheck = this.checkDate(this,this.getView().byId("idFromDate"), this.getView().byId("idToDate"));
		if(sCheck == true){
			var aFilters =[];

//			//check and get fromdate
//			var sFromDate = this.getView().byId("idFromDate").getValue();
//			if(sFromDate != ""){
////				sFromDate= sap.ui.project.e2etm.util.StaticUtility.formatDate(sFromDate);
//				var oDateFilterFrom = new sap.ui.model.Filter({ path: "BEGDA", operator: "GE", value1: sFromDate });
//				aFilters.push(oDateFilterFrom);
//			}
//			
//			// check and get todate
//			var sToDate = this.getView().byId("idToDate").getValue();
//			//get time by the end of the day		
//			if(sToDate != ""){
////				sToDate= sap.ui.project.e2etm.util.StaticUtility.formatDate(sToDate);
//				var oDateFilterTo = new sap.ui.model.Filter({ path: "ENDDA", operator: "LE", value1: sToDate });
//				aFilters.push(oDateFilterTo);
//			}
			
			//check and get fromdate
			var sFromDate = this.getView().byId("idFromDate").getValue();
			// check and get todate
			var sToDate = this.getView().byId("idToDate").getValue();
			
//			if(sFromDate != "" && sToDate != ""){
//				sFromDate= sap.ui.project.e2etm.util.StaticUtility.formatDate(sFromDate);
				var oDateFilter = new sap.ui.model.Filter({ path: "BEGDA", operator: "BT", value1: sFromDate, value2: sToDate });
				aFilters.push(oDateFilter);
//			}
		
		
			searchString = this.getView().byId("idSearch").getValue();
			var oDateFilterSearch = new sap.ui.model.Filter({ path: "SNAME", operator: "EQ", value1: searchString });
			aFilters.push(oDateFilterSearch);
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
				path : "/ZE2E_CARO_REPORTSet?$top=5000&"+sFilterParams
			},
			columns : columns
		});

	oExport.saveFile("Cargo Report").always(function() {
		this.destroy();
	});
	},

//	====================================END OF FUNCTION=========================================


});