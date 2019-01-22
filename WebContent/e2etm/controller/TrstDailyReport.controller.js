jQuery.sap.require("sap.ui.project.e2etm.util.Formatter");
jQuery.sap.require("sap.ui.project.e2etm.util.StaticUtility");
jQuery.sap.require("sap.ui.core.util.Export");
jQuery.sap.require("sap.ui.core.util.ExportType");
jQuery.sap.require("sap.ui.core.util.ExportTypeCSV");
sap.ui.controller("sap.ui.project.e2etm.controller.TrstDailyReport", {
	/**
	 * Called when a controller is instantiated and its View controls (if
	 * available) are already created. Can be used to modify the View before it
	 * is displayed, to bind event handlers and do other one-time
	 * initialization.
	 * 
	 * @memberOf e2etm.view.TrstDailyReport
	 */
	// onInit: function() {
	//
	// },
	onExport : function() {
		var table = this.getView().byId("dailyRep");
		var model = oComponent.getModel();
		model.setDefaultCountMode(sap.ui.model.odata.CountMode.None);
		var sFilterParams = table.getBinding("items").sFilterParams;
		var columns = this.getExcelColumns(table);
		oExport = new sap.ui.core.util.Export({
			exportType : new sap.ui.core.util.ExportTypeCSV({
				separatorChar : ","
			}),
			models : model,
			rows : {
				path : "/TrstDailyReportSet?$top=0&" + sFilterParams
			},
			columns : columns
		});
		oExport.saveFile("Daily Report").always(function() {
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
					if (id[1] == "txtAwt" || id[1] == "txtSur" || id[1] == "txtScn" ||
						id[1] == "txtBegda" || id[1] == "txtEndda") {
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
										  pattern:'dd.MM.yyyy'
									})
								}
							}
						});
					} else {
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
 * @memberOf e2etm.view.TrstDailyReport
 */
// onBeforeRendering: function() {
//
// },
/**
 * Called when the View has been rendered (so its HTML is part of the document).
 * Post-rendering manipulations of the HTML could be done here. This hook is the
 * same one that SAPUI5 controls get after being rendered.
 * 
 * @memberOf e2etm.view.TrstDailyReport
 */
// onAfterRendering: function() {
//
// },
/**
 * Called when the Controller is destroyed. Use this one to free resources and
 * finalize activities.
 * 
 * @memberOf e2etm.view.TrstDailyReport
 */
// onExit: function() {
//
// }
});