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
sap.ui.controller("sap.ui.project.e2etm.controller.OnsiteAddressReport", {

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
				getCaption : function (oColumn) {
					if (oColumn.getHeader() && oColumn.getHeader().getText) {
						if (oColumn.getHeader().getText() === "Weight") {
							return "Weight (Important!)";
						}
					}
					return null;
				},

				getGroup : function(oColumn) {
					if( oColumn.getId().indexOf('productCol') != -1 ||
							oColumn.getId().indexOf('supplierCol') != -1) {
						return "Primary Group";
					}
					return "Secondary Group";
				}
		};
		this.table = new sap.m.TablePersoController({
			table: this.getView().byId("idItemTable"),
			persoService: DemoPersoService,
		}).activate();


	},

//	=======================================EVENT==============================================
	onRouteMatched: function(evt){
	},

	onNavPress: function(){
		sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
	},

	onSearch:function(evt){
		var aFilters =[];
		//check and get fromdate
		var sFromDate = this.getView().byId("idFromDate").getValue();
		// check and get todate
		var sToDate = this.getView().byId("idToDate").getValue();
		
		if(sFromDate < sToDate ){
			var oDateFilter = new sap.ui.model.Filter({ path: "ZZ_VALID_FROM", operator: "GE", value1: this.setDate(sFromDate) });
			var oDateFilter_1 = new sap.ui.model.Filter({ path: "ZZ_VALID_FROM", operator: "LE", value1: this.setDate(sToDate) });
			aFilters.push(oDateFilter);
			aFilters.push(oDateFilter_1);
			var oFilter = new sap.ui.model.Filter(aFilters,true);
			// Build the nested filter with ORs between the values of each group and
			// ANDs between each group
			this.getView().byId("idItemTable").getBinding("items").filter(oFilter);
		}		
	},

	onPersoButtonPressed:function(evt){
		this.table.openDialog();	
	},

	onExportExcel : function(oEvent) {
		var table = this.getView().byId("idItemTable");
		var columns = sap.ui.project.e2etm.util.StaticUtility.getExcelColumns(table);
		oExport = new sap.ui.core.util.Export({
			exportType : new sap.ui.core.util.ExportTypeCSV({
				separatorChar : ","
			}),
			models : oComponent.getModel(),
			columns : columns,
			rows : {
				path : "/ZE2E_ONSITE_ADDRSet"
			},
		});
		
		oExport.saveFile("Onsite Address Report").always(function() {
			this.destroy();
		});
	},
	
	setDate:function(sValue){
		var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "yyyy-MM-ddT00:00:00" });
		return oDateFormat.format(new Date(sValue.substr(0, 4), sValue.substr(4, 2) - 1, sValue.substr(6, 2)));
	},
	
	formatDate: function(sDate) {
	    var sDay = sDate.getDate();
	    var sMonth = sDate.getMonth() + 1; //Months are zero based
	    var sYear = sDate.getFullYear();
	    if(sDay<10){
	    	sDay='0'+sDay;
	    } 
	    if(sMonth<10){
	    	sMonth='0'+sMonth;
	    }
	    var sToday = "{0}/{1}/{2}";
	    sToday = sToday.replace("{0}", sDay);
	    sToday = sToday.replace("{1}", sMonth);
		sToday = sToday.replace("{2}", sYear);
	    return sToday;
	},
	


});