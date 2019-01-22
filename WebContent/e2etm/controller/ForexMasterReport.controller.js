jQuery.sap.require("sap.ui.project.e2etm.util.Formatter");
jQuery.sap.require("sap.ui.project.e2etm.util.StaticUtility");
jQuery.sap.require('sap.ui.project.e2etm.controls.customStage');
jQuery.sap.require('sap.ui.project.e2etm.controls.stageItem');
jQuery.sap.require("sap.m.MessageToast");
jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("sap.m.Dialog");
jQuery.sap.require("sap.m.TablePersoController");
jQuery.sap.require("sap.ui.core.util.Export");
jQuery.sap.require("sap.ui.core.util.ExportType");
jQuery.sap.require("sap.ui.core.util.ExportTypeCSV");
sap.ui.controller("sap.ui.project.e2etm.controller.ForexMasterReport", {

	onInit : function() {
		sap.ui.core.routing.Router.getRouter("MyRouter").attachRoutePatternMatched(this.onRouteMatched, this);
		var DemoPersoService = {

				oData : {
					_persoSchemaVersion: "1.0",
					aColumns : [
					]
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
			
				resetPersData : function () {
					var oDeferred = new jQuery.Deferred();
					var oInitialData = {
							_persoSchemaVersion: "1.0",
							aColumns : [
									]
					};

					//set personalization
					this._oBundle = oInitialData;
					
					oDeferred.resolve();
					return oDeferred.promise();
				},
			
				//this caption callback will modify the TablePersoDialog' entry for the 'Weight' column
				//to 'Weight (Important!)', but will leave all other column names as they are.
//				getCaption : function (oColumn) {
//					if (oColumn.getHeader() && oColumn.getHeader().getText) {
//						if (oColumn.getHeader().getText() === "Weight") {
//							return "Weight (Important!)";
//						}
//					}
//					return null; 
//				},
			
//				getGroup : function(oColumn) {
//					if( oColumn.getId().indexOf('productCol') != -1 ||
//							oColumn.getId().indexOf('supplierCol') != -1) {
//						return "Primary Group";
//					}
//					return "Secondary Group";
//				}
			};
		this.table = new sap.m.TablePersoController({
			table: this.getView().byId("idItemTable"),
			persoService: DemoPersoService,
		}).activate();
	},

//	=======================================EVENT==============================================
	onRouteMatched: function(evt){		
	if(evt.getParameter("name")=="home"){
			
		} else if(evt.getParameter("name")=="forexencashmentreport") {
		var REPORTFOREXTYPE = sap.ui.getCore().getModel("global").getData().REPORTFOREXTYPE;
		var oModel = this.getView().getModel();
		oModel.setSizeLimit(500);
		oModel.setHeaders({REPORTFOREXTYPE:REPORTFOREXTYPE});
//		this.onSearch();
		}
	},

	onNavPress: function(){
		sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
	},

//	handleChange:function(evt){
//		this.onSearch(evt);
//	},

	onSearch:function(){
		var aFilters =[];
		var sCheck = sap.ui.project.e2etm.util.StaticUtility.checkDate(this,this.getView().byId("idFromDate"), this.getView().byId("idToDate"));
		if(sCheck == true){

			//check and get fromdate
			var sFromDate = this.getView().byId("idFromDate").getValue();
			// check and get todate
			var sToDate = this.getView().byId("idToDate").getValue();

			if(sFromDate != "" && sToDate != ""){
				var oDateFilter = new sap.ui.model.Filter({ path: "BEGDA", operator: "BT", value1: sFromDate, value2: sToDate });
				aFilters.push(oDateFilter);
			}
		}
//		searchString = this.getView().byId("idSearch").getValue();
//		if (searchString != "") {
//			var oDateFilterSearch = new sap.ui.model.Filter({ path: "ZZ_OWNER", operator: "EQ", value1: searchString });
//			aFilters.push(oDateFilterSearch);
//		}

		var oFilter = new sap.ui.model.Filter(aFilters,true);
		// Build the nested filter with ORs between the values of each group and
		// ANDs between each group
		this.getView().byId("idItemTable").getBinding("items").filter(oFilter);
	},

	onPersoButtonPressed:function(evt){
		
		this.table.openDialog();		

	},
//	onExportExcel : function(oEvent) {
//		var id = "#" + this.getView().byId("idItemTable").getTableDomRef().id;
//		$(id).tableExport({type:'excel',escape:'false'});
//	}
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
				path : "/ZE2E_FOREX_REPORTSet?"+sFilterParams
			},
			columns : columns
		});

	oExport.saveFile("Forex Master Report").always(function() {
		this.destroy();
	});
	},
});