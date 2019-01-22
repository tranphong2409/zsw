jQuery.sap.require("sap.ui.core.util.Export");
jQuery.sap.require("sap.ui.core.util.ExportType");
jQuery.sap.require("sap.ui.core.util.ExportTypeCSV");
jQuery.sap.require("sap.m.Dialog");
jQuery.sap.require("sap.m.TablePersoController");
var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);

sap.ui.controller("sap.ui.project.e2etm.controller.SetlUsetlReport", {
	/**
	 * Called when a controller is instantiated and its View controls (if
	 * available) are already created. Can be used to modify the View before it
	 * is displayed, to bind event handlers and do other one-time
	 * initialization.
	 * 
	 * @memberOf e2etm.view.SetlUsetlReport
	 */
	onInit : function() {
		// var filter = new sap.ui.model.Filter("Indicator","EQ","A");
		// this.getView().byId("setlusetlrep").getBinding("items").filter([filter]);
	
		oModel.setDefaultCountMode(sap.ui.model.odata.CountMode.None);
		this.getView().setModel(oModel);
		
		var html = this.getView().byId("html");
		html.setContent("<div><ul><li>Settled-Travel plans which are processed for Settlement and process is completed</li>" +
				"<li>Unsettled-Travel plans which are yet to be initiated for settlement</li>" +
				"<li>In process-Travel plans which are submitted for settlement and under process of completion</li></ul></div>")
		
		
		var DemoPersoService = {
			oData : {
				_persoSchemaVersion : "1.0",
				aColumns : []
			},
			getPersData : function() {
				var oDeferred = new jQuery.Deferred();
				if (!this._oBundle) {
					this._oBundle = this.oData;
				}
				var oBundle = this._oBundle;
				oDeferred.resolve(oBundle);
				return oDeferred.promise();
			},
			setPersData : function(oBundle) {
				var oDeferred = new jQuery.Deferred();
				this._oBundle = oBundle;
				oDeferred.resolve();
				return oDeferred.promise();
			},
			resetPersData : function() {
				var oDeferred = new jQuery.Deferred();
				var oInitialData = {
					_persoSchemaVersion : "1.0",
					aColumns : []
				};
				// set personalization
				this._oBundle = oInitialData;
				oDeferred.resolve();
				return oDeferred.promise();
			},
		// this caption callback will modify the TablePersoDialog' entry for the
		// 'Weight' column
		// to 'Weight (Important!)', but will leave all other column names as
		// they are.
		// getCaption : function (oColumn) {
		// if (oColumn.getHeader() && oColumn.getHeader().getText) {
		// if (oColumn.getHeader().getText() === "Weight") {
		// return "Weight (Important!)";
		// }
		// }
		// return null;
		// },
		//				
		// getGroup : function(oColumn) {
		// if( oColumn.getId().indexOf('productCol') != -1 ||
		// oColumn.getId().indexOf('supplierCol') != -1) {
		// return "Primary Group";
		// }
		// return "Secondary Group";
		// }
		};
		this.table = new sap.m.TablePersoController({
			table : this.getView().byId("setlusetlrep"),
			persoService : DemoPersoService,
		}).activate();
	},
	onPersoButtonPressed : function(evt) {
		this.table.openDialog();
	},
	onUpdateFinished:function(evt){
		this.getView().byId("lblCount").setText("Details("+evt.getParameter("actual")+")");
	},
	
	onChange : function(evt) {
		var key = evt.getSource().getSelectedKey();
		filter = new sap.ui.model.Filter("Indicator", "EQ", key);
		this.getView().byId("setlusetlrep").getBinding("items").aFilters = [];
		this.getView().byId("setlusetlrep").getBinding("items").filter(filter);
	},
	onExport : function() {
		var table = this.getView().byId("setlusetlrep");
		var model = this.getView().getModel();
		model.setDefaultCountMode(sap.ui.model.odata.CountMode.None);
		var sFilterParams = table.getBinding("items").sFilterParams;
		var columns = this.getExcelColumns(table);
		oExport = new sap.ui.core.util.Export({
			exportType : new sap.ui.core.util.ExportTypeCSV({
				separatorChar : ","
			}),
			models : model,
			rows : {
				path : "/TrstSetlUsetlSet?$top=0&" + sFilterParams
			},
			columns : columns
		});
		oExport.saveFile("Settled/Unsetteled Report").always(function() {
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
			if (cells[i].getBindingInfo("text")) {
				var path = cells[i].getBindingInfo("text").parts[0].path;
				// var path = cells[i].getBindingInfo("text").parts[0].path;
				var text = cols[i].getId();
				if (text) {
					var id = text.split("--");
					if (id[1] == "txtDate1" || id[1] == "txtDate2") {
						columns.push({
							name : cols[i].getHeader().getText(),
							template : {
								content : {
									// parts:[
									// {path:path,
									// type:new
									// sap.ui.model.type.Date({oFormatOptions:{style:'short'}})}],
									path : path,
									type : new sap.ui.model.type.DateTime({
										  pattern:'dd.MM.yyyy'
									})
								}
							}
						});
					}else if(id[1]=="txtPacmp"||id[1]=="txtReim"||id[1]=="txtCost"){
						columns.push({
							name : cols[i].getHeader().getText(),
							template : {
								content : {
									// parts:[
									// {path:path,
									// type:new
									// sap.ui.model.type.Date({oFormatOptions:{style:'short'}})}],
									path : path,
									type : new sap.ui.model.type.Float({
										oFormatOptions: {
							                maxFractionDigits: 2,
							                groupingEnabled: true, 
							                groupingSeparator: ','
							                	}
									})
								}
							}
						});
					}else {
						columns.push({
							name : cols[i].getHeader().getText(),
							template : {
								content : "{" + path + "}"
							}
						});
					}
				} else {
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
	
/**
 * Similar to onAfterRendering, but this hook is invoked before the controller's
 * View is re-rendered (NOT before the first rendering! onInit() is used for
 * that one!).
 * 
 * @memberOf e2etm.view.SetlUsetlReport
 */
// onBeforeRendering: function() {
//
// },
/**
 * Called when the View has been rendered (so its HTML is part of the document).
 * Post-rendering manipulations of the HTML could be done here. This hook is the
 * same one that SAPUI5 controls get after being rendered.
 * 
 * @memberOf e2etm.view.SetlUsetlReport
 */
// onAfterRendering: function() {
//
// },
/**
 * Called when the Controller is destroyed. Use this one to free resources and
 * finalize activities.
 * 
 * @memberOf e2etm.view.SetlUsetlReport
 */
// onExit: function() {
//
// }
});