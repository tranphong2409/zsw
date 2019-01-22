jQuery.sap.require("sap.ui.core.format.NumberFormat");
jQuery.sap.require("sap.ca.ui.dialog.factory");
jQuery.sap.require("sap.ui.project.e2etm.util.Formatter");
jQuery.sap.require("sap.ui.project.e2etm.util.StaticUtility");
jQuery.sap.require("sap.ui.core.util.Export");
jQuery.sap.require("sap.ui.core.util.ExportType");
jQuery.sap.require("sap.ui.core.util.ExportTypeCSV");
sap.ui.controller("sap.ui.project.e2etm.controller.MRReports", {
	/**
	 * Called when a controller is instantiated and its View controls (if
	 * available) are already created. Can be used to modify the View before it
	 * is displayed, to bind event handlers and do other one-time
	 * initialization.
	 * 
	 * @memberOf e2etm.view.MRReports
	 */
	onInit : function() {
		oReport = this;
		var oShell = oComponent.oContainer.getParent();
		oShell.setAppWidthLimited(false);
	},
	/**
	 * Similar to onAfterRendering, but this hook is invoked before the
	 * controller's View is re-rendered (NOT before the first rendering!
	 * onInit() is used for that one!).
	 * 
	 * @memberOf e2etm.view.MRReports
	 */
	// onBeforeRendering: function() {
	//
	// },
	onItemPress : function(evt) {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oReport);
		this.getView().byId("btnProcess").setVisible(false);
		this.getView().byId("btnDownload").setVisible(false);
		var item = evt.oSource.getSelectedItem();
		var title = item.getTitle();
		var content;
		var page = oReport.getView().byId("detailpage");
		page.removeAllContent();
		var masterlist = oReport.getView().byId("masterlist");
		var index = masterlist.indexOfItem(masterlist.getSelectedItem());
		var aId = masterlist.getSelectedItem().getId().split("--");
		switch (aId[1]) {
		case "0009Rep":
			this.getView().byId("btnProcess").setVisible(true);
			this.getView().byId("btnDownload").setVisible(true);
			if (!(sap.ui.getCore().byId("bankreport")))
				content = sap.ui.xmlfragment("sap.ui.project.e2etm.fragment.MonthlyRemittance.BankDetailsReport", oReport);
			else
				content = sap.ui.getCore().byId("bankreport");
			page.addContent(content);
			oReport.fetchBankDetails();
			break;
		case "9907Rep":
			this.getView().byId("btnProcess").setVisible(true);
			this.getView().byId("btnDownload").setVisible(true);
			if (!(sap.ui.getCore().byId("report9907")))
				content = sap.ui.xmlfragment("sap.ui.project.e2etm.fragment.MonthlyRemittance.Report9907Chgs", oReport);
			else
				content = sap.ui.getCore().byId("report9907");
			page.addContent(content);
			oReport.fetchRep9907Details();
			break;
		case "9908IRep":
			this.getView().byId("btnProcess").setVisible(true);
			this.getView().byId("btnDownload").setVisible(true);
			if (!(sap.ui.getCore().byId("report9908")))
				content = sap.ui.xmlfragment("sap.ui.project.e2etm.fragment.MonthlyRemittance.Report9908Chgs", oReport);
			else
				content = sap.ui.getCore().byId("report9908");
			page.addContent(content);
			oReport.fetchRep9908Details("9908I");
			break;
		case "primaryRep":
			// this.getView().byId("btnProcess").setVisible(true);
			this.getView().byId("btnDownload").setVisible(true);
			if (!(sap.ui.getCore().byId("reporttpadvancescroll")))
				content = sap.ui.xmlfragment("sap.ui.project.e2etm.fragment.MonthlyRemittance.PrimaryTPAdvance", oReport);
			else {
				content = sap.ui.getCore().byId("reporttpadvancepanel");
				var table = sap.ui.getCore().byId("reporttpadvance");
				var template = table.getBindingInfo("items").template;
				table.bindItems("/PrimaryTPAdvanceRepSet", template);
			}
			page.addContent(content);
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oReport);
			break;
		
		// oReport.fetchRep9908Details();
		case "exceptionRep":
			// this.getView().byId("btnProcess").setVisible(true);
			this.getView().byId("btnDownload").setVisible(true);
			if (!(sap.ui.getCore().byId("reportexceptionsscroll")))
				content = sap.ui.xmlfragment("sap.ui.project.e2etm.fragment.MonthlyRemittance.ExceptionReport", oReport);
			else {
				content = sap.ui.getCore().byId("reportexceptionspanel");
				var table = sap.ui.getCore().byId("reportexceptions");
				var template = table.getBindingInfo("items").template;
				table.bindItems("/RemittanceExceptionRepSet", template);
			}
			page.addContent(content);
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oReport);
			break;
		case "9908Rep"://9908 Changes
			this.getView().byId("btnProcess").setVisible(true);
			this.getView().byId("btnDownload").setVisible(true);
			if (!(sap.ui.getCore().byId("report9908")))
				content = sap.ui.xmlfragment("sap.ui.project.e2etm.fragment.MonthlyRemittance.Report9908Chgs", oReport);
			else
				content = sap.ui.getCore().byId("report9908");
			page.addContent(content);
			oReport.fetchRep9908Details("9908C");
			break;
		case "accMrRep"://Accommodation Monthly Rent
			if(!(sap.ui.getCore().byId("accMrView")))
        		content = sap.ui.view({id:"accMrView",viewName:"sap.ui.project.e2etm.view.BookingDetails", type:sap.ui.core.mvc.ViewType.XML});
			else
				content = sap.ui.getCore().byId("accMrView");
			page.addContent(content);
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oReport);
			break;
		case "accSetlRep"://Accommodation Settlement Rent
			if(!(sap.ui.getCore().byId("accSetlView")))
        		content = sap.ui.view({id:"accSetlView",viewName:"sap.ui.project.e2etm.view.BookingSetlReport", type:sap.ui.core.mvc.ViewType.XML});
			else
				content = sap.ui.getCore().byId("accSetlView");
			page.addContent(content);
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oReport);
			break;
		}
	},
	onNpeSubmit : function() {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oReport);
		var startdate = sap.ui.getCore().byId("npebegda").getValue();
		var enddate = sap.ui.getCore().byId("npeendda").getValue();
		var tpno = sap.ui.getCore().byId("npetravelplan").getValue();
		var oDataModel1 = new sap.ui.model.odata.ODataModel(sServiceUrl, true);
		var odata;
		odata = {
			REINR : tpno,
			BEGDA : startdate,
			ENDDA : enddate,
		};
		oDataModel1.callFunction("NonPEFinbanktransfer", "GET", odata, null, function(oData, response) {
			if (oReport.getView().getModel("tableModel")) {
				var data = oReport.getView().getModel("tableModel").getData();
				data.mrnpe = oData.results;
				oReport.getView().getModel("tableModel").setData(data);
			} else {
				var tabelmodel = new sap.ui.model.json.JSONModel();
				tabelmodel.setData({
					mrnpe : oData.results
				});
				oReport.getView().setModel(tabelmodel, "tableModel");
			}
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oReport);
		}, function(error) {
			// sap.ui.project.e2etm.util.StaticUtility.setBusy(false,
			// VisaPlanThis);
			// visadialog.close();
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oReport);
			sap.m.MessageToast.show("Internal Server Error");
		}, true);
	},
	fetchRep9907Details : function() {
		oDataModel.read("MRRep9907chgsSet", null, null, true,
		// success
		function(oData, response) {
			if (oReport.getView().getModel("tableModel")) {
				var data = oReport.getView().getModel("tableModel").getData();
				data.rep9907 = oData.results;
				oReport.getView().getModel("tableModel").setData(data);
			} else {
				var tabelmodel = new sap.ui.model.json.JSONModel();
				tabelmodel.setData({
					rep9907 : oData.results
				});
				oReport.getView().setModel(tabelmodel, "tableModel");
			}
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oReport);
		}, function(error) {
			// error
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oReport);
		});
	},
	fetchRep9908Details : function(reptype) {
		var item = [];
		var header = [];
		var role = sap.ui.getCore().getModel("profile").getData().currentRole;
		oDataModel.read("MRRep9908chgsSet?$filter=RepType eq '"+reptype+"'", null, null, true,
		// success
		function(oData, response) {
			var results = oData.results;
			if (oReport.getView().getModel("tableModel")) {
				var data = oReport.getView().getModel("tableModel").getData();
				data.rep9908 = oData.results;
				oReport.getView().getModel("tableModel").setData(data);
			} else {
				var tabelmodel = new sap.ui.model.json.JSONModel();
				tabelmodel.setData({
					rep9908 : oData.results
				});

				oReport.getView().setModel(tabelmodel, "tableModel");
			}
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oReport);
		}, function(error) {
			// error
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oReport);
		});
	},
	fetchBankDetails : function() {
		oDataModel.read("MRRepBankDetlsSet", null, null, true,
		// success
		function(oData, response) {
			if (oReport.getView().getModel("tableModel")) {
				var data = oReport.getView().getModel("tableModel").getData();
				data.rep0009 = oData.results;
				oReport.getView().getModel("tableModel").setData(data);
			} else {
				var tabelmodel = new sap.ui.model.json.JSONModel();
				tabelmodel.setData({
					rep0009 : oData.results
				});
				oReport.getView().setModel(tabelmodel, "tableModel");
			}
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oReport);
		}, function(error) {
			// error
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oReport);
		});
	},
	onChangeMode : function() {
		if (oReport.getView().byId("splitapp").getMode() != "HideMode")
			oReport.getView().byId("splitapp").setMode("HideMode");
		else
			oReport.getView().byId("splitapp").setMode("ShowHideMode");
	},
	onDataExport : function() {
		var masterlist = oReport.getView().byId("masterlist");
		var index = masterlist.indexOfItem(masterlist.getSelectedItem());
		var aId = masterlist.getSelectedItem().getId().split("--");
		var oExport;
		switch (aId[1]) {
		case "0009Rep":
			var columns = oReport.getColumns(aId[1]);
			oExport = new sap.ui.core.util.Export({
				exportType : new sap.ui.core.util.ExportTypeCSV({
					separatorChar : ","
				}),
				// exportType : new sap.ui.core.util.ExportType({
				// fileExtension : "pdf",
				// mimeType:"application/pdf",
				// charset:"UTF-8"
				// }),
				models : oReport.getView().getModel("tableModel"),
				rows : {
					path : "/rep0009/"
				},
				columns : columns
			});
			// download exported file
			break;
		case "9907Rep":
			var columns = oReport.getColumns(aId[1]);
			oExport = new sap.ui.core.util.Export({
				exportType : new sap.ui.core.util.ExportTypeCSV({
					separatorChar : ","
				}),
				models : oReport.getView().getModel("tableModel"),
				rows : {
					path : "/rep9907/"
				},
				columns : columns
			});
			break;
		case "9908IRep":
			var columns = oReport.getColumns(aId[1]);
			oExport = new sap.ui.core.util.Export({
				exportType : new sap.ui.core.util.ExportTypeCSV({
					separatorChar : ","
				}),
				models : oReport.getView().getModel("tableModel"),
				rows : {
					path : "/rep9908/"
				},
				columns : columns
			});
			break;
		case "primaryRep":
			var columns = oReport.getColumns(aId[1]);
			oExport = new sap.ui.core.util.Export({
				exportType : new sap.ui.core.util.ExportTypeCSV({
					separatorChar : ","
				}),
				models : oComponent.getModel(),
				rows : {
					path : "/PrimaryTPAdvanceRepSet"
				},
				columns : columns
			});
			break;
		case "exceptionRep":
			var columns = oReport.getColumns(aId[1]);
			oExport = new sap.ui.core.util.Export({
				exportType : new sap.ui.core.util.ExportTypeCSV({
					separatorChar : ","
				}),
				models : oComponent.getModel(),
				rows : {
					path : "/RemittanceExceptionRepSet"
				},
				columns : columns
			});
			break;
		case "9908Rep":
			var columns = oReport.getColumns(aId[1]);
			oExport = new sap.ui.core.util.Export({
				exportType : new sap.ui.core.util.ExportTypeCSV({
					separatorChar : ","
				}),
				models : oReport.getView().getModel("tableModel"),
				rows : {
					path : "/rep9908/"
				},
				columns : columns
			});
			break;
		
		}
		oExport.saveFile().always(function() {
			this.destroy();
		});
	},
	getColumns : function(index) {
		var columns = [];
		var table;
		if (index == "0009Rep") {
			table = sap.ui.getCore().byId("bankreport");
		} else if (index == "9907Rep") {
			table = sap.ui.getCore().byId("report9907");
		} else if (index == "9908IRep"||index=="9908Rep") {
			table = sap.ui.getCore().byId("report9908");
		} else if (index == "primaryRep") {
			table = sap.ui.getCore().byId("reporttpadvance");
		} else if (index == "exceptionRep") {
			table = sap.ui.getCore().byId("reportexceptions");
		}
		var cols = table.getColumns();
		if (index == "0009Rep" || index == "9907Rep" || index == "9908IRep"||index=="9908Rep") {
			for ( var i = 0; i < cols.length; i++) {
				var path = cols[i].getTemplate().getBindingInfo("text").parts[0].path;
				// var path = cells[i].getBindingInfo("text").parts[0].path;
				columns.push({
					name : cols[i].getLabel().getText(),
					template : {
						content : "{" + path + "}"
					}
				});
			}
		} else {
			var cells = table.getBindingInfo("items").template.getCells();
			for ( var i = 0; i < cols.length; i++) {
				if (cells[i].getBindingInfo("text")) {
					var path = cells[i].getBindingInfo("text").parts[0].path;
					if (cols[i].getHeader().getText() == "Request Recd Date") {
						columns.push({
							name : cols[i].getHeader().getText(),
							template : {
								content : {
									path : path,
									type : new sap.ui.model.type.Date({
										pattern : 'dd.MM.yyyy',
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
							content : ""
						}
					});
				}
			}
		}
		return columns;
	},
	onProcess : function() {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oReport);
		var masterlist = oReport.getView().byId("masterlist");
		var index = masterlist.indexOfItem(masterlist.getSelectedItem());
		var aId = masterlist.getSelectedItem().getId().split("--");
		var data = oReport.getView().getModel("tableModel").getData();
		if (index >= 0) {
			var dialog = new sap.m.Dialog({
				title : 'Confirm',
				type : 'Message',
				content : new sap.m.Text({
					text : 'Please download before processing the payment'
				}),
				beginButton : new sap.m.Button({
					text : 'OK',
					press : function() {
						dialog.close();
						switch (aId[1]) {
						case "0009Rep":
							oReport.processPayment0009(data.rep0009);
							break;
						case "9907Rep":
							oReport.processPayment9907(data.rep9907);
							break;
						case "9908IRep":
							oReport.processPayment9908(data.rep9908);
							break;
						case 3:
							break;
						case "9908Rep":
							oReport.processPayment9908(data.rep9908);
							break;
						}
					}
				}),
				endButton : new sap.m.Button({
					text : 'Cancel',
					press : function() {
						dialog.close();
					}
				}),
				afterClose : function() {
					dialog.destroy();
				}
			});
			dialog.open();
		}
	},
	processPayment0009 : function(data) {
		var batch = [];
		var table = sap.ui.getCore().byId("bankreport");
		var indices = table.getSelectedIndices();
		if (indices.length != 0) {
			var bindItems = table.getBinding("rows");
			var aIndices = bindItems.aIndices;
			for ( var i = 0; i < indices.length; i++) {
				var index = aIndices[indices[i]];
				var odata = data[index];
				if (odata.__metadata)
					odata.__metadata = undefined;
				batch.push(oDataModel.createBatchOperation("MRRepBankDetlsSet", "POST", odata));
			}
			oDataModel.addBatchChangeOperations(batch);
			oDataModel.submitBatch(function(oResult) {
				try {
					oReport.fetchBankDetails();
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oReport);
					sap.m.MessageToast.show("Updated Successfully");
					table.setSelectedIndex(-1);
					// oController.getView().byId("bankprocesssubmit").firePress();
				} catch (err) {
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oReport);
				}
			}, function(error) {
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oReport);
			}, true);
		} else {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oReport);
			sap.m.MessageToast.show("Please select atleast  one row");
		}
	},
	processPayment9907 : function(data) {
		var batch = [];
		var table = sap.ui.getCore().byId("report9907");
		var indices = table.getSelectedIndices();
		if (indices.length != 0) {
			var bindItems = table.getBinding("rows");
			var aIndices = bindItems.aIndices;
			for ( var i = 0; i < indices.length; i++) {
				var index = aIndices[indices[i]];
				var odata = data[index];
				if (odata.__metadata)
					odata.__metadata = undefined;
				batch.push(oDataModel.createBatchOperation("MRRep9907chgsSet", "POST", odata));
			}
			oDataModel.addBatchChangeOperations(batch);
			oDataModel.submitBatch(function(oResult) {
				try {
					oReport.fetchRep9907Details();
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oReport);
					sap.m.MessageToast.show("Updated Successfully");
					table.setSelectedIndex(-1);
					// oController.getView().byId("bankprocesssubmit").firePress();
				} catch (err) {
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oReport);
				}
			}, function(error) {
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oReport);
			}, true);
		} else {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oReport);
			sap.m.MessageToast.show("Please select atleast  one row");
		}
	},
	processPayment9908 : function(data) {
		var batch = [];
		var table = sap.ui.getCore().byId("report9908");
		var indices = table.getSelectedIndices();
		if (indices.length != 0) {
			var bindItems = table.getBinding("rows");
			var aIndices = bindItems.aIndices;
			for ( var i = 0; i < indices.length; i++) {
				var index = aIndices[indices[i]];
				var odata = data[index];
				if (odata.__metadata)
					odata.__metadata = undefined;
				if (odata.MRTransSet)
					delete odata.MRTransSet;
				batch.push(oDataModel.createBatchOperation("MRRep9908chgsSet", "POST", odata));
			}
			oDataModel.addBatchChangeOperations(batch);
			oDataModel.submitBatch(function(oResult) {
				try {
					oReport.fetchRep9908Details();
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oReport);
					sap.m.MessageToast.show("Updated Successfully");
					table.setSelectedIndex(-1);
					// oController.getView().byId("bankprocesssubmit").firePress();
				} catch (err) {
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oReport);
				}
			}, function(error) {
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oReport);
			}, true);
		} else {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oReport);
			sap.m.MessageToast.show("Please select atleast  one row");
		}
	},
/**
 * Called when the View has been rendered (so its HTML is part of the document).
 * Post-rendering manipulations of the HTML could be done here. This hook is the
 * same one that SAPUI5 controls get after being rendered.
 * 
 * @memberOf e2etm.view.MRReports
 */
// onAfterRendering: function() {
//
// },
/**
 * Called when the Controller is destroyed. Use this one to free resources and
 * finalize activities.
 * 
 * @memberOf e2etm.view.MRReports
 */
// onExit: function() {
//
// }
});