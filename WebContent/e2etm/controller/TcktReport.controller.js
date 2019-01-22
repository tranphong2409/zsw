jQuery.sap.require("sap.ui.core.util.Export");
jQuery.sap.require("sap.ui.core.util.ExportType");
jQuery.sap.require("sap.ui.core.util.ExportTypeCSV");
jQuery.sap.require("sap.m.Dialog");
jQuery.sap.require("sap.m.TablePersoController");
jQuery.sap.require("sap.ui.project.e2etm.util.Formatter");
jQuery.sap.require("sap.ui.project.e2etm.util.StaticUtility");
sap.ui.controller("sap.ui.project.e2etm.controller.TcktReport", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf e2etm.view.TcktReport
*/
	 onInit: function() {
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
				table: this.getView().byId("slaRep"),
				persoService: DemoPersoService,
			}).activate();
	 },
	 
		onPersoButtonPressed:function(evt){
			
			this.table.openDialog();		

		},
		onExport : function() {
			var table = this.getView().byId("slaRep");
			var model = oComponent.getModel();
			model.setDefaultCountMode(sap.ui.model.odata.CountMode.None);
			var sFilterParams = table.getBinding("items").sFilterParams;
			var columns = this.getExcelColumns(table);
			oExport = new sap.ui.core.util.Export({
				exportType : new sap.ui.core.util.ExportTypeCSV({
					separatorChar : ","
				}),
				models : this.getView().byId("slaRep").getModel(),
				rows : {
					path : "/"
				},
				columns : columns
			});
			oExport.saveFile("Ticketing SLA Report").always(function() {
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
										type : new sap.ui.model.type.Date({
											pattern:'dd.MM.yyyy',
											source: {
												pattern: 'yyyyMMdd'
											}
										})
									}
								}
							});
						}else if(id[1]=="txtTime1"||id[1]=="txtTime2"){
							columns.push({
								name : cols[i].getHeader().getText(),
								template : {
									content : {
										// parts:[
										// {path:path,
										// type:new
										// sap.ui.model.type.Date({oFormatOptions:{style:'short'}})}],
										path : path,
										type : new sap.ui.model.type.Time({
											pattern:'HH:mm:ss',
											source: {
												pattern: 'hhmmss'
											}
										})
									}
								}
							});
						}
						else if(id[1]=="txtTime3"){
							columns.push({
								name : cols[i].getHeader().getText(),
								template : {
									content : {
										// parts:[
										// {path:path,
										// type:new
										// sap.ui.model.type.Date({oFormatOptions:{style:'short'}})}],
										path : path,
										formatter:function(leadTime){
											if(leadTime!=""&&leadTime!=null&&leadTime!=undefined){
												var value = (leadTime.substring(0,2)).trim()+':'+(leadTime.substring(2,4)).trim()+':'+(leadTime.substring(4)).trim();
											    return value+"\t";
											}else
												return "NA";
											}
									}
								}});
						}
						else {
						
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
		onSearch:function(){
			sap.ui.project.e2etm.util.StaticUtility.setBusy(true, this);
			var fromdate = this.getView().byId("idFromDate").getValue();
			var todate = this.getView().byId("idToDate").getValue();
			
			oComponent.getModel().read("TcktSLASet?$filter=FromDate eq '"+fromdate+"' and ToDate eq '"+todate+"'", null, null, true,
					// success
					jQuery.proxy(function(oData, response) {
						var model = new sap.ui.model.json.JSONModel();
						model.setData(oData.results);
						this.getView().byId("slaRep").setModel(model);
						sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
					},this), jQuery.proxy(function(error) {
						// error
						sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
					},this));
			
		}

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf e2etm.view.TcktReport
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf e2etm.view.TcktReport
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf e2etm.view.TcktReport
*/
//	onExit: function() {
//
//	}

});