jQuery.sap.require("sap.ui.core.util.Export");
jQuery.sap.require("sap.ui.core.util.ExportType");
jQuery.sap.require("sap.ui.core.util.ExportTypeCSV");
jQuery.sap.require("sap.ui.project.e2etm.util.Formatter");
jQuery.sap.require("sap.ui.project.e2etm.util.StaticUtility");
sap.ui.controller("sap.ui.project.e2etm.controller.TrstQmmReport", {
	/**
	 * Called when a controller is instantiated and its View controls (if
	 * available) are already created. Can be used to modify the View before it
	 * is displayed, to bind event handlers and do other one-time
	 * initialization.
	 * 
	 * @memberOf e2etm.view.TrstQmmReport
	 */
	onInit : function() {
		sap.ui.core.routing.Router.getRouter("MyRouter").attachRoutePatternMatched(this.onRouteMatched, this);
	},
	onRouteMatched : function(evt) {
		this.getView().byId("txtPlace").setVisible(false);
		this.getView().byId("txtAccdt").setVisible(false);
		this.getView().byId("txtPaydt").setVisible(false);
		this.getView().byId("txtLtime").setVisible(false);
		this.getView().byId("txtDocno").setVisible(false);
		this.getView().byId("txtSLA").setVisible(false);
		this.getView().byId("flxTpEmp").setVisible(false);
		this.getView().byId("flxTkMod").setVisible(false);
		if (evt.getParameter("arguments").name == "QMM") {
			this["Report"] = "QMM";
			this.getView().byId("reportPage").setTitle("QMM-SLA Compliance");
			this.getView().byId("txtInidt").getHeader().setText("Initiation date");
			this.getView().byId("txtClsdt").getHeader().setText("Closed date");
			this.getView().byId("txtAccdt").setVisible(true);
			this.getView().byId("txtLtime").setVisible(true);
			this.getView().byId("txtDocno").setVisible(true);
			this.getView().byId("txtSLA").setVisible(true);
			this.getView().byId("txtPaydt").setVisible(true);
			this.getView().byId("flxTpEmp").setVisible(true);
		} else if (evt.getParameter("arguments").name == "OEI") {
			this["Report"] = "OEI";
			this.getView().byId("reportPage").setTitle("OEI Report");
			this.getView().byId("txtInidt").getHeader().setText("Start date");
			this.getView().byId("txtClsdt").getHeader().setText("End date");
			this.getView().byId("txtPlace").setVisible(true);
			this.getView().byId("flxTkMod").setVisible(true);
		}
	},
	onSubmit : function() {
		var frmdate = this.getView().byId("fromdate").getValue();
		var todate = this.getView().byId("todate").getValue();
		var tp = this.getView().byId("tpno").getValue();
		var empno = this.getView().byId("empno").getValue();
		var traveltype = this.getView().byId("traveltype").getValue();
		var module = this.getView().byId("module").getValue();
		var filterString;
		if (frmdate) {
			filterString = "Inidt ge '" + frmdate + "'";
		}
		if (todate) {
			filterString = filterString + " and Inidt le '" + todate + "'";
		}
		if (tp) {
			filterString = filterString ? (filterString + " and Reinr eq '" + tp + "'") : ("Reinr eq '" + tp + "'");
		}
		if (empno) {
			filterString = filterString ? (filterString + " and Pernr eq '" + empno + "'") : ("Pernr eq '" + empno + "'");
		}
		if (traveltype) {
			filterString = filterString ? (filterString + " and Trvky eq '" + traveltype + "'") : ("Trvky eq '" + traveltype + "'");
		}
		if (module) {
			filterString = filterString ? (filterString + " and Modid eq '" + module + "'") : ("Modid eq '" + module + "'");
		}
		if (filterString) {
			filterString = filterString + " and Report eq '" + this["Report"] + "'";
			oComponent.getModel().read("TrstQmmSlaRepSet?$filter=" + filterString, null, null, true,
			// success
			jQuery.proxy(function(oData, response) {
				var model = new sap.ui.model.json.JSONModel();
				model.setData(oData.results);
				this.getView().byId("qmmRep").setModel(model);
				// sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
			}, this), jQuery.proxy(function(error) {
				// error
				// sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
			}, this));
		} else {
			sap.m.MessageToast.show("Please enter any filter criteria");
		}
	},
	onChange : function(evt) {
		var searchIndex = -1;
		var table = this.getView().byId("qmmRep");
		var data = table.getModel().getData();
		var listIndex = table.indexOfItem(evt.getSource().getParent());
		if (!(this["changedRows"])) {
			this["changedRows"] = [];
			this["changedRows"].push(data[listIndex]);
		} else {
			var crows = this["changedRows"];
			for ( var i = 0; i < crows.length; i++) {
				if (crows[i].Pernr == data[listIndex].Pernr && crows[i].Reinr == data[listIndex].Reinr && crows[i].Trvky == data[listIndex].Trvky && crows[i].Modid == data[listIndex].Modid) {
					searchIndex = i;
					break;
				}
			}
			if (searchIndex != -1) {
				this["changedRows"][searchIndex] = data[listIndex];
			} else {
				this["changedRows"].push(data[listIndex]);
			}
		}
	},
	onSave : function() {
		var oData = {};
		oData["TrstQmmSla"] = this["changedRows"];
		// oData["TrstQmmSla"][0]["Accdt"] = oData["TrstQmmSla"][0]["Scndt"]
		// for(var i=0;i<oData.TrstQmmSla.length;i++){
		// for(var prop in oData.TrstQmmSla[i]){
		// if(prop=="Scndt"||prop=="Accdt"||prop=="Paydt"){
		// var date = oData.TrstQmmSla[i][prop];
		// if(date){
		// if(date instanceof Date){
		// oData.TrstQmmSla[i][prop] = ""+date.getFullYear()+"-"+
		// (date.getMonth() + 1)+"-"+date.getDate()+"T00:00:00";
		// }else{
		// oData.TrstQmmSla[i][prop] = ""+date.substring(0,4)+"-"+
		// (date.substring(4,6))+"-"+date.substring(6,8)+"T00:00:00";
		// }
		// }
		// }
		// }
		// }
		//		
		if(oData["TrstQmmSla"]){
		oComponent.getModel().create("TrstQmmSlaRepSet", oData, null, jQuery.proxy(function(oData, response) {
			sap.m.MessageToast.show("Updated Successfully", {
				duration : 10000,
				closeOnBrowserNavigation : false
			});
			this.onSubmit();
		}, this), function(error) {
			sap.m.MessageToast.show("Internal Server Error");
		}, true);
		}else{
			sap.m.MessageToast.show("No changes to save");
		}
	},
	onExport : function() {
		var table = this.getView().byId("qmmRep");
		var model = table.getModel();
		var columns = this.getExcelColumns(table);
		oExport = new sap.ui.core.util.Export({
			exportType : new sap.ui.core.util.ExportTypeCSV({
				separatorChar : ","
			}),
			models : model,
			rows : {
				path : "/"
			},
			columns : columns
		});
		if (this["Report"] == "QMM") {
			oExport.saveFile("QMM-SLA Compliance").always(function() {
				this.destroy();
			});
		} else {
			oExport.saveFile("OEI Report").always(function() {
				this.destroy();
			});
		}
	},
	getExcelColumns : function(table) {
		var columns = [];
		var table;
		// table = this.getView().byId("idItemTable");
		var cells = table.getBindingInfo("items").template.getCells();
		var cols = table.getColumns();
		for ( var i = 0; i < cols.length; i++) {
			if (cols[i].getVisible()) {
				if (cells[i].getBindingInfo("text") || cells[i].getBindingInfo("value") || cells[i].getBindingInfo("dateValue")) {
					var path = cells[i].getBindingInfo("text") ? cells[i].getBindingInfo("text").parts[0].path : (cells[i].getBindingInfo("value") ? cells[i].getBindingInfo("value").parts[0].path : cells[i].getBindingInfo("dateValue").parts[0].path);
					// var path = cells[i].getBindingInfo("text").parts[0].path;
					var text = cols[i].getId();
					if (text) {
						var id = text.split("--");
						if (id[1] == "txtInidt" || id[1] == "txtScndt" || id[1] == "txtPaydt" || id[1] == "txtAccdt" || id[1] == "txtClsdt") {
							columns.push({
								name : cols[i].getHeader().getText(),
								template : {
									content : {
										// parts:[
										// {path:path,
										// type:new
										// sap.ui.model.type.Date({oFormatOptions:{style:'short'}})}],
										path : path,
										formatter : function(value) {
											if (value != "" && value!=null&&value!=undefined){
												var yyyy = value.substring(0, 4);
											var MM = value.substring(4, 6);
											var dd = value.substring(6, 8);
											var dateStr = dd+"-"+MM+"-"+yyyy;
											return dateStr;
											}
										}
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
		}
		return columns;
	},
/**
 * Similar to onAfterRendering, but this hook is invoked before the controller's
 * View is re-rendered (NOT before the first rendering! onInit() is used for
 * that one!).
 * 
 * @memberOf e2etm.view.TrstQmmReport
 */
// onBeforeRendering: function() {
//
// },
/**
 * Called when the View has been rendered (so its HTML is part of the document).
 * Post-rendering manipulations of the HTML could be done here. This hook is the
 * same one that SAPUI5 controls get after being rendered.
 * 
 * @memberOf e2etm.view.TrstQmmReport
 */
// onAfterRendering: function() {
//
// },
/**
 * Called when the Controller is destroyed. Use this one to free resources and
 * finalize activities.
 * 
 * @memberOf e2etm.view.TrstQmmReport
 */
// onExit: function() {
//
// }
});