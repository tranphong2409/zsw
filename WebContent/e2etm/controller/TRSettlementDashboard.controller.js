jQuery.sap.require("sap.ui.core.util.Export");
jQuery.sap.require("sap.ui.core.util.ExportType");
jQuery.sap.require("sap.ui.core.util.ExportTypeCSV");
jQuery.sap.require("sap.ui.project.e2etm.util.Formatter");
jQuery.sap.require("sap.ui.project.e2etm.util.StaticUtility");
jQuery.sap.require("sap.ui.ux3.NotificationBar");
var oController;
sap.ui.controller("sap.ui.project.e2etm.controller.TRSettlementDashboard", {
	/**
	 * Called when a controller is instantiated and its View controls (if
	 * available) are already created. Can be used to modify the View before it
	 * is displayed, to bind event handlers and do other one-time
	 * initialization.
	 * 
	 * @memberOf e2etm.view.TRSettlementDashboard
	 */
	onInit : function() {
		oController = this;
		var icontab = oController.getView().byId("icontabbaradmin");
		var key = icontab.getSelectedKey();
		icontab.setSelectedKey("DOME");
		icontab.fireSelect(icontab.getItems()[0]);
		sap.ui.core.routing.Router.getRouter("MyRouter").attachRoutePatternMatched(this.onRouteMatched, this);
	},
	onItemPress : function(event) {
		if (event.getParameter("listItem").getAggregation("cells")) {
			var itemSelected = event.getParameter("listItem");
			var index1 = event.oSource.indexOfItem(itemSelected);
			var items = event.oSource.getBinding("items");
			var aindices = items.aIndices;
			var index = aindices[index1];
			var bindingItem = event.oSource.getBinding("items").oList;
			var global = sap.ui.getCore().getModel("global").getData();
			global.ZZ_TRV_REQ = bindingItem[index].TravelPlan;
			global.ZZ_REQ_TYP = bindingItem[index].TravelType;
			// global.ZZ_DEP_REQ = bindingItem[index].TravelPlan;
			global.ZZ_DEP_PERNR = bindingItem[index].EmpNo;
			// global.VisaType = bindingItem[index].VisaType;
			global.ZZ_VERSION = bindingItem[index].Version;
			global.whichtab = event.getSource().getParent().getKey();
			global.parentKey = oController.getView().byId("icontabbaradmin").getSelectedKey();
			sap.ui.getCore().getModel("global").setData(global);
			if (global.parentKey == "PYVR")
				sap.ui.core.routing.Router.getRouter("MyRouter").navTo("paymentvoucher");
			else if (global.parentKey == "INRA")
				sap.ui.core.routing.Router.getRouter("MyRouter").navTo("inradvance");
			else
				sap.ui.core.routing.Router.getRouter("MyRouter").navTo("trsettle");
		}
	},
	// ======== Begin of reimbursement info==============
	onRouteMatched : function(evt, data) {
		if (evt.getParameter("name") == "trsettlelist") {
			// get user's profile data
			var view = evt.mParameters.view;
			oController = view.getController();
			// sap.ui.project.e2etm.util.StaticUtility.setBusy(true,
			// oController);
			var pData = sap.ui.getCore().getModel("profile").getData();
			// get Reimbursement request for travel settlement team(TGG1HC)
			if (pData.currentRole == "TRST" || pData.currentRole == "TRSD") {
				this.getView().byId("reimIcon").setVisible(true);
				// create model list of reimbursements
				// create model list of reimbursements
				var oModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(oModel, "listReim");
				// get profile
				if (sap.ui.getCore().getModel("reimAdminData")) {
					var filterTab = sap.ui.getCore().getModel("reimAdminData").getData().filterTab;
				} else {
					var filterTab = this.getView().byId("idIconTabBarReimAdmin").getSelectedKey();
				}
				// get reimbursement list
				this.getFilter(filterTab, "");
				this.fetchDetails();
			} else {
				this.getView().byId("reimIcon").setVisible(false);
			}
		}
	},
	fetchDetails : function() {
		var icontab = oController.getView().byId("icontabbaradmin");
		var key = icontab.getSelectedKey();
		// icontab.setSelectedKey(key);
		if (key == "PYVR")
			icontab.fireSelect(icontab.getItems()[2]);
		else if (key == "INRA")
			icontab.fireSelect(icontab.getItems()[3]);
		else if (key == "DOME")
			icontab.fireSelect(this.getView().byId("tabDomestic"));
		else if (key == "INTL")
			icontab.fireSelect(this.getView().byId("tabInternational"));
		// var currentRole =
		// sap.ui.getCore().getModel("profile").getData().currentRole;
		// var getWorklist =
		// oDataModel.createBatchOperation("TrvStWorklistSet?$filter=LoginRole+eq+'"
		// + currentRole + "'+and+Module+eq+'TRST'", "GET");
		// oDataModel.addBatchReadOperations([ getWorklist ]);
		// oDataModel.submitBatch(function(oResult) {
		// try {
		//
		// oController.setDataTable(oResult.__batchResponses[0].data.results);
		// sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
		// } catch (exe) {
		// sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
		// }
		// });
	},
	onRefresh : function(evt) {
		// sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oController);
		oController.fetchDetails();
	},
	setDataTable : function(result) {
		var items = oController.getView().byId("icontabbaradmin").getItems();
		var jsModel = new sap.ui.model.json.JSONModel();
		jsModel.setData(result);
		var content;
		for ( var i = 0; i < items.length; i++) {
			var key = items[i].getKey();
			if (key == "DOME" || key == "INTL") {
				content = items[i].getContent()[0];
				oController.setDataTableContent(content, jsModel, result, key);
			}
		}
	},
	setDataTableContent : function(content, jsModel, result, parentKey) {
		var items = content.getItems();
		for ( var i = 0; i < items.length; i++) {
			var key = items[i].getKey();
			if (key != "CLSR") {
				var table = items[i].getContent()[0];
				table.setModel(jsModel, "trworklist");
				var filter = oController.getTravelFilter(key, parentKey);
				var bindItems = table.getBinding("items");
				var filteredItems = bindItems.filter(filter);
				var model = oController.setBinding(filteredItems.aIndices, result);
				table.setModel(model, "trworklist");
				items[i].setCount(filteredItems.getLength());
			}
		}
	},
	fetchTrstDetails : function(module) {
		var role = sap.ui.getCore().getModel("profile").getData().currentRole;
		oDataModel.read("TrvStWorklistSet?$filter=LoginRole eq '" + role + "' and Module eq '" + module + "'", null, null, false, function(oData, response) {
			// var model = new sap.ui.model.json.JSONModel();
			return oData.results;
		}, function(error) {
			// sap.ui.project.e2etm.util.StaticUtility.setBusy(false,
			// oController);
		});
	},
	setBinding : function(aindice, results) {
		var result = [];
		for ( var i = 0; i < aindice.length; i++) {
			var index = aindice[i];
			result.push(results[index]);
		}
		var model = new sap.ui.model.json.JSONModel();
		model.setData(result);
		return model;
	},
	onIconTabSelectAdmin : function(evt) {
		var key = evt.oSource.getSelectedKey();
		this.getView().byId("btnReimDownload").setVisible(false);
		this.getView().byId("btnAccount").setVisible(false);
		var content;
		if (key == "DOME") {
			content = evt.oSource.getItems()[0].getContent()[0];
			// oController.getView().byId("awf").getParent().setVisible(false);
			content.getItems()[3].setVisible(true);
			content.getItems()[4].setVisible(false);
			content.getItems()[5].setVisible(false);
			content.getItems()[6].setVisible(false);
			content.getItems()[7].setVisible(false);
			content.getItems()[8].setVisible(false);
			content.getItems()[9].setVisible(true);
			content.getItems()[10].setVisible(true);
			var tab = this.getTabValue(content.getSelectedKey(), key);
			if (tab) {
				var table = this.getTable(content, content.getSelectedKey());
				oController.getDetails(table, "TRST", tab);
			}
		} else if (key == "INTL") {
			content = evt.oSource.getItems()[1].getContent()[0];
			content.getItems()[3].setVisible(false);
			content.getItems()[4].setVisible(false);
			content.getItems()[5].setVisible(true);
			content.getItems()[6].setVisible(true);
			content.getItems()[7].setVisible(true);
			content.getItems()[8].setVisible(true);
			content.getItems()[9].setVisible(true);
			content.getItems()[10].setVisible(true);
			var tab = this.getTabValue(content.getSelectedKey(), key);
			if (tab) {
				var table = this.getTable(content, content.getSelectedKey());
				oController.getDetails(table, "TRST", tab);
			}
		} else if (key == "PYVR") {
			content = evt.oSource.getItems()[2].getContent()[0];
			content.getItems()[3].setVisible(false);
			// content.getItems()[4].setVisible(true);
			content.getItems()[5].setVisible(false);
			content.getItems()[6].setVisible(false);
			content.getItems()[7].setVisible(false);
			content.getItems()[8].setVisible(false);
			content.getItems()[9].setVisible(false);
			content.getItems()[10].setVisible(true);
			var tab = this.getTabValue(content.getSelectedKey(), key);
			if (tab) {
				var table = this.getTable(content, content.getSelectedKey());
				oController.getDetails(table, "PYVR", tab);
			}
		} else if (key == "INRA") {
			content = evt.oSource.getItems()[3].getContent()[0];
			content.getItems()[0].setVisible(true);
			content.getItems()[1].setVisible(true);
			content.getItems()[2].setVisible(true);
			content.getItems()[3].setVisible(false);
			content.getItems()[4].setVisible(false);
			content.getItems()[5].setVisible(false);
			content.getItems()[6].setVisible(false);
			content.getItems()[7].setVisible(false);
			content.getItems()[8].setVisible(false);
			content.getItems()[9].setVisible(false);
			content.getItems()[10].setVisible(true);
			if(this.getView().byId("inra--mrtab").getSelectedKey() == "APP"){
				this.getView().byId("btnAccount").setVisible(true);
			}
			var tab = this.getTabValue(content.getSelectedKey(), key);
			if (tab) {
				var table = this.getTable(content, content.getSelectedKey());
				oController.getDetails(table, "INRA", tab);
			}
		}
	},
	onMonthTabSelect : function(evt) {
		var parentKey = this.getView().byId("icontabbaradmin").getSelectedKey();
		this.getView().byId("btnSendMail").setVisible(false);
		this.getView().byId("btnAccount").setVisible(false);
		
		
		
		var module;
		if (parentKey == "DOME" || parentKey == "INTL") {
			module = "TRST";
		} else {
			module = parentKey;
		}
		var childKey = evt.oSource.getSelectedKey();
		var table = this.getTable(evt.oSource,childKey);
		table.setMode("None");
		if (childKey != 'CLSR') {
			var tab = this.getTabValue(childKey, parentKey);
			var table = evt.getParameter("selectedItem").getContent()[0];
			oController.getDetails(table, module, tab);
			if(childKey =="AWF" ||childKey == "INRE"){
				this.getView().byId("btnSendMail").setVisible(true);
				table.setMode("MultiSelect");
			}
			if(parentKey == "INRA" && childKey =="APP"){
				this.getView().byId("btnAccount").setVisible(true);
				table.setMode("MultiSelect");
			}
		}
	},
	getTable : function(content, key) {
		var items = content.getItems();
		var table;
		if (key == "") {
			key = "NEW";
		}
		for ( var i = 0; i < items.length; i++) {
			var key1 = items[i].getKey();
			if (key == key1) {
				table = items[i].getContent()[0];
				break;
			}
		}
		return table;
	},
	getTabValue : function(key, parentKey) {
		var tab;
		if (parentKey == "DOME") {
			switch (key) {
			// case 0:
			case "":
				tab = "DMN";
				break;
			case "NEW":
				tab = "DMN";
				break;
			// case 1:
			case "REV":
				tab = "DMR";
				break;
			// case 2:
			case "APP":
				tab = "DMA";
				break;
			case "INRE":
				tab = "DMI";
				break;
			case "ACCT":
				tab = "DMP";
				break;
			// case 3:
			}
		} else if (parentKey == "INTL") {
			switch (key) {
			// case 0:
			case "NEW" || "":
				tab = "INN";
				break;
			// case 1:
			case "REV":
				tab = "INR";
				break;
			// case 2:
			case "APP":
				tab = "INA";
				break;
			case "AWF":
				tab = "IAF";
				break;
			case "PSUR":
				tab = "IPS";
				break;
			case "SURR":
				tab = "INS";
				break;
			case "ACCT":
				tab = "INP";
				break;
			case "TAXB":
				tab = "INX";
			// case 3:
			}
		} else if (parentKey == "PYVR") {
			switch (key) {
			// case 0:
			case "NEW" || "":
				tab = "PVN";
				break;
			// case 1:
			case "REV":
				tab = "PVR";
				break;
			// case 2:
			case "APP":
				tab = "PVA";
				break;
			case "PAYB":
				tab = "PVP";
				break;
			// case 3:
			}
		} else if (parentKey == "INRA") {
			switch (key) {
			// case 0:
			case "NEW" || "":
				tab = "IRN";
				break;
			case "REV":
				tab = "IRR";
				break;
			// case 2:
			case "APP":
				tab = "IRA";
				break;
			}
		}
		return tab;
	},
	getDetails : function(table, module, tab) {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oController);
		var role = sap.ui.getCore().getModel("profile").getData().currentRole;
		oDataModel.read("TrvStWorklistSet?$filter=LoginRole eq '" + role + "' and Module eq '" + module + "' and Tab eq '" + tab + "'", null, null, true, function(oData, response) {
			var model = new sap.ui.model.json.JSONModel();
			model.setData(oData.results);
			if (table)
				table.setModel(model, "trworklist");
			// oController.setDataTableContent(content,model,oData.results,tab)
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
		}, function(error) {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
		});
	},
	getTravelFilter : function(key, parentKey) {
		var oFilter;
		var aFilters = [];
		if (parentKey == "DOME") {
			switch (key) {
			// case 0:
			case "NEW":
				oFilter = new sap.ui.model.Filter("Tab", "EQ", "DMN");
				aFilters.push(oFilter);
				break;
			// case 1:
			case "REV":
				oFilter = new sap.ui.model.Filter("Tab", "EQ", "DMR");
				aFilters.push(oFilter);
				break;
			// case 2:
			case "APP":
				oFilter = new sap.ui.model.Filter("Tab", "EQ", "DMA");
				aFilters.push(oFilter);
				break;
			case "INRE":
				oFilter = new sap.ui.model.Filter("Tab", "EQ", "DMI");
				aFilters.push(oFilter);
				break;
			case "ACCT":
				oFilter = new sap.ui.model.Filter("Tab", "EQ", "DMP");
				aFilters.push(oFilter);
				break;
			// case 3:
			}
		} else if (parentKey == "INTL") {
			switch (key) {
			// case 0:
			case "NEW":
				oFilter = new sap.ui.model.Filter("Tab", "EQ", "INN");
				aFilters.push(oFilter);
				break;
			// case 1:
			case "REV":
				oFilter = new sap.ui.model.Filter("Tab", "EQ", "INR");
				aFilters.push(oFilter);
				break;
			// case 2:
			case "APP":
				oFilter = new sap.ui.model.Filter("Tab", "EQ", "INA");
				aFilters.push(oFilter);
				break;
			case "AWF":
				oFilter = new sap.ui.model.Filter("Tab", "EQ", "IAF");
				aFilters.push(oFilter);
				break;
			case "PSUR":
				oFilter = new sap.ui.model.Filter("Tab", "EQ", "IPS");
				aFilters.push(oFilter);
				break;
			case "SURR":
				oFilter = new sap.ui.model.Filter("Tab", "EQ", "INS");
				aFilters.push(oFilter);
				break;
			case "ACCT":
				oFilter = new sap.ui.model.Filter("Tab", "EQ", "INP");
				aFilters.push(oFilter);
				break;
			// case 3:
			}
		} else if (parentKey == "PYVR") {
			switch (key) {
			// case 0:
			case "NEW":
				oFilter = new sap.ui.model.Filter("Tab", "EQ", "PVN");
				aFilters.push(oFilter);
				break;
			// case 1:
			case "REV":
				oFilter = new sap.ui.model.Filter("Tab", "EQ", "PVR");
				aFilters.push(oFilter);
				break;
			// case 2:
			case "APP":
				oFilter = new sap.ui.model.Filter("Tab", "EQ", "PVA");
				aFilters.push(oFilter);
				break;
			case "PAYB":
				oFilter = new sap.ui.model.Filter("Tab", "EQ", "PVP");
				aFilters.push(oFilter);
				break;
			// case 3:
			}
		} else if (parentKey == "INRA") {
			switch (key) {
			// case 0:
			case "NEW":
				oFilter = new sap.ui.model.Filter("Tab", "EQ", "IRN");
				aFilters.push(oFilter);
				break;
			case "REV":
				oFilter = new sap.ui.model.Filter("Tab", "EQ", "IRR");
				aFilters.push(oFilter);
				break;
			// case 2:
			case "APP":
				oFilter = new sap.ui.model.Filter("Tab", "EQ", "IRA");
				aFilters.push(oFilter);
				break;
			}
		}
		return aFilters;
	},
	onCloseSearchWorklist : function(evt) {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oController);
		var icontabbaradmin = oController.getView().byId("icontabbaradmin");
		var key = icontabbaradmin.getSelectedKey();
		if (key == "DOME" || key == "INTL") {
			oController.closeSearchWorklist("TRST", evt);
		} else if (key == "PYVR") {
			oController.closeSearchWorklist("PYVR", evt);
		} else if (key == "INRA") {
			oController.closeSearchWorklist("INRA", evt);
		}
	},
	closeSearchWorklist : function(module, evt) {
		var tpno = evt.oSource.getValue();
		var table = evt.oSource.getParent().getParent();
		if (tpno != "") {
			oDataModel.read("TrvStWorklistSet?$filter=TravelPlan eq '" + tpno + "' and Module eq '" + module + "'", null, null, true, function(oData, response) {
				var model = new sap.ui.model.json.JSONModel();
				model.setData(oData.results);
				table.setModel(model, "trworklist");
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
			}, function(error) {
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
			});
		} else {
			var model = new sap.ui.model.json.JSONModel();
			model.setData([]);
			table.setModel(model, "trworklist");
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
			sap.m.MessageToast.show("Please enter Travel Plan");
		}
	},
	onSearchWorklist : function(evt) {
		var id = evt.oSource.getId();
		var bid = id.split("--");
		var empno, empname, trvltype, recdate, travelreq, module;
		// var table = evt.oSource.getParent().getParent();
		var table = evt.oSource.getParent().getParent().getParent();
		var oFilter;
		var aFilters = [];
		var filtered = [];
		switch (bid[3]) {
		case "trvlreq":
			oFilter = new sap.ui.model.Filter("TravelPlan", "Contains", evt.oSource.getValue());
			aFilters.push(oFilter);
			travelreq = evt.oSource.getValue();
			empno = sap.ui.getCore().byId(bid[0] + "--" + bid[1] + "--" + bid[2] + "--empno").getValue();
			empname = sap.ui.getCore().byId(bid[0] + "--" + bid[1] + "--" + bid[2] + "--empname") ? sap.ui.getCore().byId(bid[0] + "--" + bid[1] + "--" + bid[2] + "--empname").getValue() : "";
			trvltype = sap.ui.getCore().byId(bid[0] + "--" + bid[1] + "--" + bid[2] + "--trvltype").getValue();
			recdate = sap.ui.getCore().byId(bid[0] + "--" + bid[1] + "--" + bid[2] + "--recdate") ? sap.ui.getCore().byId(bid[0] + "--" + bid[1] + "--" + bid[2] + "--recdate").getValue() : "";
			if (empno != "") {
				aFilters = oController.addFilter("EmpNo", empno, aFilters);
			}
			if (empname != "") {
				aFilters = oController.addFilter("EmpName", empname, aFilters);
			}
			if (trvltype != "") {
				aFilters = oController.addFilter("VisaType", trvltype, aFilters);
			}
			if (recdate != "") {
				aFilters = oController.addFilter("ReceivedDt", recdate, aFilters);
			}
			break;
		case "empno":
			oFilter = new sap.ui.model.Filter("EmpNo", "Contains", evt.oSource.getValue());
			aFilters.push(oFilter);
			empno = evt.oSource.getValue();
			travelreq = sap.ui.getCore().byId(bid[0] + "--" + bid[1] + "--" + bid[2] + "--trvlreq").getValue();
			empname = sap.ui.getCore().byId(bid[0] + "--" + bid[1] + "--" + bid[2] + "--empname") ? sap.ui.getCore().byId(bid[0] + "--" + bid[1] + "--" + bid[2] + "--empname").getValue() : "";
			trvltype = sap.ui.getCore().byId(bid[0] + "--" + bid[1] + "--" + bid[2] + "--trvltype").getValue();
			recdate = sap.ui.getCore().byId(bid[0] + "--" + bid[1] + "--" + bid[2] + "--recdate") ? sap.ui.getCore().byId(bid[0] + "--" + bid[1] + "--" + bid[2] + "--recdate").getValue() : "";
			if (travelreq != "") {
				aFilters = oController.addFilter("TravelPlan", travelreq, aFilters);
			}
			if (empname != "") {
				aFilters = oController.addFilter("EmpName", empname, aFilters);
			}
			if (trvltype != "") {
				aFilters = oController.addFilter("VisaType", trvltype, aFilters);
			}
			if (recdate != "") {
				aFilters = oController.addFilter("ReceivedDt", recdate, aFilters);
			}
			break;
		case "empname":
			oFilter = new sap.ui.model.Filter("EmpName", "Contains", evt.oSource.getValue());
			aFilters.push(oFilter);
			travelreq = sap.ui.getCore().byId(bid[0] + "--" + bid[1] + "--" + bid[2] + "--trvlreq").getValue();
			empno = sap.ui.getCore().byId(bid[0] + "--" + bid[1] + "--" + bid[2] + "--empno").getValue();
			trvltype = sap.ui.getCore().byId(bid[0] + "--" + bid[1] + "--" + bid[2] + "--trvltype").getValue();
			recdate = sap.ui.getCore().byId(bid[0] + "--" + bid[1] + "--" + bid[2] + "--recdate").getValue();
			if (travelreq != "") {
				aFilters = oController.addFilter("TravelPlan", travelreq, aFilters);
			}
			if (empno != "") {
				aFilters = oController.addFilter("EmpNo", empno, aFilters);
			}
			if (trvltype != "") {
				aFilters = oController.addFilter("VisaType", trvltype, aFilters);
			}
			if (recdate != "") {
				aFilters = oController.addFilter("ReceivedDt", recdate, aFilters);
			}
			break;
		case "trvltype":
			oFilter = new sap.ui.model.Filter("VisaType", "Contains", evt.oSource.getValue());
			aFilters.push(oFilter);
			travelreq = sap.ui.getCore().byId(bid[0] + "--" + bid[1] + "--" + bid[2] + "--trvlreq").getValue();
			empname = sap.ui.getCore().byId(bid[0] + "--" + bid[1] + "--" + bid[2] + "--empname") ? sap.ui.getCore().byId(bid[0] + "--" + bid[1] + "--" + bid[2] + "--empname").getValue() : "";
			empno = sap.ui.getCore().byId(bid[0] + "--" + bid[1] + "--" + bid[2] + "--empno").getValue();
			recdate = sap.ui.getCore().byId(bid[0] + "--" + bid[1] + "--" + bid[2] + "--recdate") ? sap.ui.getCore().byId(bid[0] + "--" + bid[1] + "--" + bid[2] + "--recdate").getValue() : "";
			if (travelreq != "") {
				aFilters = oController.addFilter("TravelPlan", travelreq, aFilters);
			}
			if (empname != "") {
				aFilters = oController.addFilter("EmpName", empname, aFilters);
			}
			if (empno != "") {
				aFilters = oController.addFilter("EmpNo", empno, aFilters);
			}
			if (recdate != "") {
				aFilters = oController.addFilter("ReceivedDt", recdate, aFilters);
			}
			break;
		case "recdate":
			oFilter = new sap.ui.model.Filter("ReceivedDt", "Contains", evt.oSource.getValue());
			aFilters.push(oFilter);
			travelreq = sap.ui.getCore().byId(bid[0] + "--" + bid[1] + "--" + bid[2] + "--trvlreq").getValue();
			empname = sap.ui.getCore().byId(bid[0] + "--" + bid[1] + "--" + bid[2] + "--empname").getValue();
			empno = sap.ui.getCore().byId(bid[0] + "--" + bid[1] + "--" + bid[2] + "--empno").getValue();
			trvltype = sap.ui.getCore().byId(bid[0] + "--" + bid[1] + "--" + bid[2] + "--trvltype").getValue();
			if (travelreq != "") {
				aFilters = oController.addFilter("TravelPlan", travelreq, aFilters);
			}
			if (empname != "") {
				aFilters = oController.addFilter("EmpName", empname, aFilters);
			}
			if (empno != "") {
				aFilters = oController.addFilter("EmpNo", empno, aFilters);
			}
			if (trvltype != "") {
				aFilters = oController.addFilter("VisaType", trvltype, aFilters);
			}
			break;
		}
		filtered.push(new sap.ui.model.Filter(aFilters, false));
		var bindItems = table.getBinding("items");
		bindItems.filter(filtered);
		if (bid[3] == "trvlreq") {
			if (bindItems.aIndices.length == 0 || travelreq == "" || travelreq == " " || (!travelreq)) {
				var parentKey = oController.getView().byId("icontabbaradmin").getSelectedKey();
				var tab = this.getTabValue(table.getParent().getKey(), parentKey);
				if (parentKey == "DOME" || parentKey == "INTL")
					module = "TRST";
				else
					module = parentKey;
				this.getDetailsByTpEmp("TravelPlan", travelreq, table, module, tab);
			}
		} else if (bid[3] == "empno") {
			if (bindItems.aIndices.length == 0 || empno == "" || empno == " " || (!empno)) {
				var parentKey = oController.getView().byId("icontabbaradmin").getSelectedKey();
				var tab = this.getTabValue(table.getParent().getKey(), parentKey);
				if (parentKey == "DOME" || parentKey == "INTL")
					module = "TRST";
				else
					module = parentKey;
				this.getDetailsByTpEmp("EmpNo", empno, table, module, tab);
			}
		}
	},
	getDetailsByTpEmp : function(property, value, table, module, tab) {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oController);
		var role = sap.ui.getCore().getModel("profile").getData().currentRole;
		oDataModel.read("TrvStWorklistSet?$filter=" + property + " eq '" + value + "' and LoginRole eq '" + role + "' and Module eq '" + module + "' and Tab eq '" + tab + "'", null, null, true, function(oData, response) {
			var model = new sap.ui.model.json.JSONModel();
			model.setData(oData.results);
			if (table)
				table.setModel(model, "trworklist");
			// oController.setDataTableContent(content,model,oData.results,tab)
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
		}, function(error) {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
		});
	},
	addFilter : function(property, value, aFilters) {
		aFilters.push(new sap.ui.model.Filter(property, "Contains", value));
		return aFilters;
	},
	onSubmitPDF : function(evt) {
		sap.ui.project.e2etm.util.StaticUtility.viewPdf(oController);
	},
	// get list of Reimbursement request base on filter tab
	getFilter : function(keyFilter, searchString) {
		this.getView().byId("btnSendMail").setVisible(false);
		this.getView().byId("idlistAdmin").setMode("None");
		
		switch (keyFilter) {
		// NEW
		case "NEW":
			var sRole = '11';
			var sAction = '00';
			sap.ui.project.e2etm.util.StaticUtility.setBusy(true, this);
			this.getView().byId("idColTravelReq").setText("Travel Request");
			this.getListAdmin(sRole, searchString, "REIM", sAction, this, "NEW");
			break;
		// CLOSED
		case "PAYMENT":
			this.getView().byId("btnSendMail").setVisible(true);
			this.getView().byId("btnReimDownload").setVisible(true);
			this.getView().byId("idlistAdmin").setMode("MultiSelect");
			var sRole = '11';
			var sAction = '31';
			sap.ui.project.e2etm.util.StaticUtility.setBusy(true, this);
			//this.getView().byId("idColTravelReq").setText("Travel Request");
			this.getListAdmin(sRole, searchString, "REIM", sAction, this, "PAYMENT");
			break;
		case "CLOSED":
			var sRole = '11';
			var sAction = '00';
			// sap.ui.project.e2etm.util.StaticUtility.setBusy(true, this);
			// this.getListAdmin(sRole, searchString, "REIM", sAction, this,
			// "CLOSED");
			// break;
			if (searchString == "") {
				this.getView().byId("idIconTabBarReimAdmin").getItems()[1].setCount("");
				this.getView().getModel("listReim").setProperty("/results", []);
				sap.m.MessageToast.show("Please enter employee number!");
			} else {
				sap.ui.project.e2etm.util.StaticUtility.setBusy(true, this);
				this.getListAdmin(sRole, searchString, "REIM", sAction, this, "CLOSED");
			}
			break;
		}// end switch
	},
	// get list of Reimbursement request
	getListAdmin : function(sRole, ZZ_OWNER, sModid, sAction, oThis, sStatus) {
		// ZZ_TRV_REQ =ROLE
		// ZZ_OWNER = OWNER
		// ZZ_TRV_KEY = SMODID
		// ZZ_VERSION = ACTION
		// WAERS = type of admin
		var sAccUrl = "/ZE2E_REI_HDRSet?$filter=ZZ_TRV_REQ+eq+'{0}'+and+ZZ_OWNER+eq+'{1}'+and+ZZ_TRV_KEY+eq+'{2}'+and+ZZ_VERSION+eq+'{3}'+and+WAERS+eq+'{4}'+and+ZZ_VISA_PLAN+eq+'{5}'&$expand=TRV_HDR,ZE2E_REI_DETAIL ";
		// var sAccUrl =
		// "/ZE2E_ACC_HDRSet?$filter=ZZ_TRV_REQ+eq+'{0}'+and+ZZ_OWNER+eq+'{1}'+and+ZZ_TRV_KEY+eq+'{2}'+and+ZZ_VERSION+eq+'{3}'&$expand=TRV_HDR,ZE2E_ACC_DETAILSet";
		sAccUrl = sAccUrl.replace("{0}", sRole);
		sAccUrl = sAccUrl.replace("{1}", ZZ_OWNER);
		sAccUrl = sAccUrl.replace("{2}", sModid);
		sAccUrl = sAccUrl.replace("{3}", sAction);
		sAccUrl = sAccUrl.replace("{4}", "NPE");
		sAccUrl = sAccUrl.replace("{5}", sStatus);
		oComponent.getModel().read(sAccUrl, {
			success : jQuery.proxy(function(mResponse) {
				/* Changes done by Bharadwaj for count */
				// this.setCount(mResponse.results.length);
				/* Changes done by Bharadwaj for count */
				oThis.getView().getModel("listReim").setProperty("/results", mResponse.results);
				if (oThis.getView()["BusyDialog"] = !null) {
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
				}
			}, this),
			error : jQuery.proxy(function(error) {
				jQuery.sap.require("sap.m.MessageToast");
			}, this)
		});
	},
	// event triggers when clicking on filter tab
	onReimTabSelect : function(evt) {
		this.getFilter(evt.mParameters.key, this.getView().byId("idSearch").getValue());
		// this.getFilter(evt.mParameters.key, "");
	},
	// on item admin list press
	onItemPressReim : function(event) {
		sap.ui.project.e2etm.util.StaticUtility.itemPress(event, this);
	},
	// checking display search button
	checkingSearchButton : function(key) {
		if (key = "REIM") {
			this.getView().byId("idSearch").setVisible(true);
		} else {
			this.getView().byId("idSearch").setVisible(false);
		}
	},
	// onIconTabSelectAdmin : function(evt) {
	// // checking to display employee number search field
	// // this.checkingSearchButton(evt.getSource().getSelectedKey());
	// },
	// event triggers when clicking on filter tab
	onIconTabSelect : function(evt) {
		this.getFilter(evt.mParameters.key, this.getView().byId("idSearch").getValue());
	},
	// search employee number
	onSearch : function(evt) {
		sap.ui.project.e2etm.util.StaticUtility.onSearchEmp(evt, this);
	},
	onReportREIMress : function() {
		sap.ui.project.e2etm.util.StaticUtility.reimReport();
	},
	onAccounting : function(evt) {
		var table;
		
		var source = evt.getSource();
		var ipMonth = source.getParent().getParent().getParent().getItems()[1].getItems()[1];
		var ipYear = source.getParent().getParent().getParent().getItems()[1].getItems()[2];
		var month = ipMonth.getValue();
		var year = ipYear.getValue();
		ipMonth.setValueState("None");
		ipYear.setValueState("None");
		if(source.getParent().getParent().getItems()[1].getSelectedIndex()==1){
			if(month==""){
				ipMonth.setValueState("Error");
				sap.m.MessageToast.show("Please enter Month");
				return;
			}
			if(year==""){
				ipYear.setValueState("Error");
				sap.m.MessageToast.show("Please enter Year");
				return;
			}
		}
		var key = this.getView().byId("icontabbaradmin").getSelectedKey();
		if (key == "DOME")
			table = this.getView().byId(sap.ui.core.Fragment.createId("domestic", sap.ui.core.Fragment.createId("acct", "accWorklist")));
		else if (key == "INTL")
			table = this.getView().byId(sap.ui.core.Fragment.createId("international", sap.ui.core.Fragment.createId("acct", "accWorklist")));
		var listItem = evt.getSource().getParent().getParent().getParent().getParent();
		var index1 = table.indexOfItem(listItem);
		var items = table.getBinding("items");
		var aindices = items.aIndices;
		var index = aindices[index1];
		var bindList = items.oList;
		
		this["selectedItem"] = bindList[index];
		var odata = {
			SMLRUN : 'X',
			MODID : 'TRST',
			PERNR : bindList[index].EmpNo,
			SMOD : key,
			REINR : bindList[index].TravelPlan,
			TRVTYP : bindList[index].TravelType,
			ACTPOST : '',
			MONTH : month,
			YEAR : year
		};
		var btnLog = source.getParent().getItems()[1];
		this.callFunctionImport(odata,"GET",btnLog);
	},
	onActualPost : function(evt, data) {
		var odata = data.data;
		var btnLog = data.source;
		var dialog = evt.getSource().getParent().getParent();
		odata["SMLRUN"] = '';
		odata["ACTPOST"] = 'X';
		
		this.callFunctionImport(odata,"POST",btnLog,dialog);
	},
	callFunctionImport:function(odata,reqtype,btnLog,dialog){
		this.getView().setBusy(true);
		this["ipData"] = odata;
		oComponent.getModel().callFunction("PostTravelAmounts", "GET", odata, null, jQuery.proxy(function(oData, response) {
			this.getView().setBusy(false);
			
			
			btnLog.setEnabled(false);


			if(reqtype == "POST"){
			    dialog.close();
			    sap.m.MessageToast.show("Successfully Completed");
			    this.fetchDetails();
			}
			else if(reqtype == "GET")
				this.openPostDialog(oData.results, this["ipData"],btnLog);
			
			
		}, this), jQuery.proxy(function(error) {
			this.getView().setBusy(false);
			if(error.response.statusCode!=500){
			var errorObj = JSON.parse(error.response.body);
			var errorDetails = errorObj.error.innererror.errordetails;
			if(errorDetails.length!=0)
			errorDetails.splice(errorDetails.length-1,1);
			var messages = [];
			for ( var i = 0; i < errorDetails.length; i++) {
				if (errorDetails[i].severity == 'warning') {
					messages.push({
						type : 'Warning',
						title : errorDetails[i].message,
						description : errorDetails[i].message
					});
				} else if (errorDetails[i].severity == 'error') {
					messages.push({
						type : 'Error',
						title : errorDetails[i].message,
						description : errorDetails[i].message
					});
				}else{
					messages.push({
						type : 'Information',
						title : errorDetails[i].message,
						description : errorDetails[i].message
					});
				}
			}
//			var btnLog = source.getParent().getItems()[1];
			btnLog.setEnabled(true);
			btnLog.data("ErrorLog", messages);
			this.bindErrorLog(messages,btnLog);
			if(reqtype == "POST")
			  dialog.close();
			//this.openPostDialog(messages);
			}
			else{
				var dialog = new sap.m.Dialog({
					title: 'Error',
					type: 'Message',
					state: 'Error',
					content: new sap.m.Text({
						//text: jQuery.parseXML(error.response.body).querySelector("message").textContent
						text: error.response.body
					}),
					beginButton: new sap.m.Button({
						text: 'OK',
						press: function () {
							dialog.close();
						}
					}),
					afterClose: function() {
						dialog.destroy();
					}
				});
	 
				dialog.open();
				
			}
		}, this), true);
	},
	openPostDialog : function(results, odata,btnLog) {
		var accTable;
		var data = {
			pr05acc : {},
			prfiacc : {}
		};
		data["pr05acc"]["expenses"] = [];
		data["prfiacc"]["expenses"] = [];
		for ( var i = 0; i < results.length; i++) {
			if (results[i].tcode == "PR05") {
				data["pr05acc"]["expenses"].push(results[i]);
			} else if (results[i].tcode == "PRRW") {
				data["prfiacc"]["expenses"].push(results[i]);
			}
		}
		data = this.calculateTotal(data);
		var model = new sap.ui.model.json.JSONModel();
		model.setData(data);		
		if (!(sap.ui.getCore().byId("accountingTable")))
			accTable = sap.ui.xmlfragment("sap.ui.project.e2etm.fragment.travelsettlement.AccountingTable", this);
		else
			accTable = sap.ui.getCore().byId("accountingTable");
		
		sap.ui.getCore().byId("pr05AccTable").setModel(model,"travelsettlement");
		sap.ui.getCore().byId("prfiAccTable").setModel(model,"travelsettlement");
		
		var dialog = new sap.m.Dialog({
			title : 'Confirm',
			showHeader : true,
			stretch : true,
			type : 'Standard',
			content : [ accTable ],
			customHeader:new sap.m.Bar({contentMiddle:[new sap.m.Label({text:"Details"})],
				                        contentRight:[new sap.m.Button({icon:"sap-icon://download",
				                        	                            type : sap.m.ButtonType.Emphasized,
				                        	                            text:"Travel Settlement PDF"				                        	                          
				                        	                            }).attachPress(jQuery.proxy(this.onDownload,this))]}),
			beginButton :new sap.m.Button({
				text : 'Cancel',
				type : sap.m.ButtonType.Emphasized,
				press : function() {
					dialog.close();
				}
			}), 
			endButton : new sap.m.Button({
				text : 'Post',
				type : sap.m.ButtonType.Emphasized}).attachPress({data:odata,source:btnLog},jQuery.proxy(this.onActualPost,this)),
			afterClose : function() {
				dialog.destroy();
			}
		});
		dialog.open();
	},
	onDownload:function(evt){
	    var data = this["selectedItem"];

		var travelplan = data.TravelPlan;
		var empno = data.EmpNo;
		var traveltype = data.TravelType;
		var version = data.Version;
		// var version = 2;
		var item = data.Item.trim();
		if (window.location.hostname == "localhost")
			fileUrl = "proxy/sap/opu/odata/sap/ZE2E_DEP_NWGS_SRV/TrstPdfSet(EmpNo='" + empno + "',TrNo='" + travelplan + "',TrvKey='" + traveltype + "',Module='TRST',Version='" + version + "',Item='" + item + "')/$value";
		else
			fileUrl = "/sap/opu/odata/sap/ZE2E_DEP_NWGS_SRV/TrstPdfSet(EmpNo='" + empno + "',TrNo='" + travelplan + "',TrvKey='" + traveltype + "',Module='TRST',Version='" + version + "',Item='" + item + "')/$value";
		window.open(fileUrl, "_blank");
	},
	
	calculateTotal : function(data) {
		var accData = data["pr05acc"]["expenses"];
		var localAmt = 0;
		var forenAmt = 0;

		for ( var i = 0; i < accData.length; i++) {
			localAmt = this.formatAmountValue(accData[i].lcl_betrg) + localAmt;		
		
		}
		data["pr05acc"]["footer"] = [];
		data["pr05acc"]["footer"].push({
			Text : "Total",
			Lamt : localAmt,
			Lcur : 'INR'
			
		});
		
		accData = data["prfiacc"]["expenses"];
		localAmt = 0;
		for ( var i = 0; i < accData.length; i++) {
			localAmt = this.formatAmountValue(accData[i].gross_debit) + localAmt;
			forenAmt = this.formatAmountValue(accData[i].gross_credit) + forenAmt;
		}
		data["prfiacc"]["footer"] = {
			Text : "Total",	
			Damt : localAmt,
			Camt:forenAmt,
			CDamt:localAmt + forenAmt,
			Cur:"INR"
		}
		return data;
	},
	formatAmountValue : function(value) {
		if (isNaN(parseFloat(value)))
			return 0.00;
		else
			return parseFloat(parseFloat(value).toFixed(2));
	},
	onLogPress : function(evt) {
		var messages = evt.getSource().data("ErrorLog");
		this.bindErrorLog(messages, evt.getSource());
	},
	bindErrorLog : function(errorDetails, button) {
		var pop;
		if (!sap.ui.getCore().byId("msgPopOver")) {
			var oMessageTemplate = new sap.m.MessagePopoverItem({
				type : '{type}',
				title : '{title}',
				description : '{description}'
			});
			pop = new sap.m.MessagePopover("msgPopOver", {
				items : {
					path : '/',
					template : oMessageTemplate
				}
			});
		} else {
			pop = sap.ui.getCore().byId("msgPopOver");
		}
		var oModel = new sap.ui.model.json.JSONModel();
		oModel.setData(errorDetails);
		pop.setModel(oModel);
		pop.openBy(button);
	},
	onYearSelect : function(evt) {
		var vBox = evt.getSource().getParent().getParent();
		vBox.getItems()[1].setVisible(false);
		if (evt.getSource().getSelectedIndex() == 1)
			vBox.getItems()[1].setVisible(true);
		else {
			vBox.getItems()[1].getItems()[1].setValue("");
			vBox.getItems()[1].getItems()[2].setValue("");
		}
	},
	onCurrentYearSelect : function(evt) {
		var vBox = evt.getSource().getParent().getParent();
		if (evt.getParameter("selected"))
			vBox.getItems()[1].setVisible(false);
	},
	onViewRequest:function(){
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oController);
		var role = sap.ui.getCore().getModel("profile").getData().currentRole;
		var tpno = this.getView().byId("srchTp").getValue();
		//var module = this.getView().byId("srchModule").getSelectedKey();
		if (tpno != "") {
			oDataModel.read("TrvStWorklistSet?$filter=TravelPlan eq '" + tpno + "' and Module eq 'TRST' and Tab eq 'SRC'", null, null, true, 
			jQuery.proxy(function(oData, response) {
				if(oData.results.length!=0){
				var tab = oData.results[0].Tab;
				var parentKey;
				   if(tab!=""){
						if(tab.indexOf("I",0) == 0){			  
						  if(tab.indexOf("IR",0) == 0){
							  parentKey = "INRA";
						  }else{
							  parentKey = "INTL";
						  }					
						 }else if(tab.indexOf("D",0) == 0){
							   parentKey = "DOME";   
						   }else if(tab.indexOf("P",0) == 0){
							   parentKey = "PYVR";						   
							}						   
					   }			
				var tabKey = this.getTabKey(oData.results[0].Tab);
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
                this.navigateToModule(oData.results[0].TravelPlan,oData.results[0].TravelType,
                		              oData.results[0].EmpNo,oData.results[0].Version,parentKey,tabKey);
				}else{
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
					sap.m.MessageToast.show("Request does not exist.Please enter valid travel plan");
				}
				
			},this), function(error) {
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
			});
		} else {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
			sap.m.MessageToast.show("Please enter details");
		}
	},
	navigateToModule:function(travelPlan,travelType,empNo,version,parentKey,tabKey){

	
		var global = sap.ui.getCore().getModel("global").getData();
		global.ZZ_TRV_REQ = travelPlan;
		global.ZZ_REQ_TYP = travelType;
		// global.ZZ_DEP_REQ = bindingItem[index].TravelPlan;
		global.ZZ_DEP_PERNR = empNo;
		// global.VisaType = bindingItem[index].VisaType;
		global.ZZ_VERSION = version;
		global.whichtab = tabKey;
		global.parentKey = parentKey;
		sap.ui.getCore().getModel("global").setData(global);
		if (global.parentKey == "PYVR")
			sap.ui.core.routing.Router.getRouter("MyRouter").navTo("paymentvoucher");
		else if (global.parentKey == "INRA")
			sap.ui.core.routing.Router.getRouter("MyRouter").navTo("inradvance");
		else
			sap.ui.core.routing.Router.getRouter("MyRouter").navTo("trsettle");
	},
	getTabKey:function(tab){
		switch(tab){
		case "PVN":
		case "IRN":
		case "DMN":
			tab = "NEW";
			break;
		case "PVR":
		case "IRR":
		case "DMR":
			tab = "REV";
			break;
		case "PVA":
		case "IRA":
		case "DMA":
			tab = "APP";
		     break;
		case "DMI":
			tab = "INRE";			
			break;
		case "INN":
			tab = "NEW";
			break;
		case "INR":
			tab = "REV";
			break;
		case "INA":
			tab = "APP";
		     break;
		case "IAF":
			tab = "APP";
		     break;
		case "IPS":
			tab = "PSUR";
		     break;
		case "INS":
			tab = "SURR";
		     break;
		case "INP":
		case "DMP":
			tab = "CLSR";
			break;
		case "DMC":
		case "INC":
			tab = "CLSR";
			break;
		}
		return tab;
	},
	onSendMail:function(){
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, this);
		var parentKey = this.getView().byId("icontabbaradmin").getSelectedKey();
		if(parentKey!="REIM"){
		var subKey,data;
		var content;
		if(parentKey == "DOME"){
			 content = this.getView().byId("domestic--mrtab");
			 subKey = content.getSelectedKey();
		}else if(parentKey == "INTL"){
			content =  this.getView().byId("international--mrtab");
			subKey = content.getSelectedKey();
		}
		var table = this.getTable(content,subKey);
		var items = table.getSelectedItems();
		if(items.length!=0){
		data = table.getModel("trworklist").getData();
		
		var oData = {TrstSendMailNav:[]};
		
		for(var i=0;i<items.length;i++){
			var index = table.indexOfItem(items[i]);
			oData["TrstSendMailNav"].push(data[index]);
		}
		
		oDataModel.create("TrstSendMailSet", oData, null, jQuery.proxy(function(oData, response) {
			// oController.uploadFiles(global.ZZ_TRV_REQ);
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);

			sap.m.MessageToast.show("Sent Successfully", {
				duration : 10000,
				closeOnBrowserNavigation : false
			});
		},this), jQuery.proxy(function(error) {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
			sap.m.MessageToast.show("Internal Server Error");
		},this), true);
		}else{
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
			sap.m.MessageToast.show("Please select atleast one row");
		}
		}else{
			this.sendReimMail();
		}
	},
	sendReimMail:function(){
		var table = this.getView().byId("idlistAdmin");
		//var items = table.getSelectedItems();
		var items = table.getSelectedItems();
		if(items.length!=0){
		data = this.getView().getModel("listReim").getData().results;
		var oData = {ReimSendMailNav:[]};
		
		for(var i=0;i<items.length;i++){
			var index = table.indexOfItem(items[i]);
			var toCountry = sap.ui.project.e2etm.util.Formatter.formatCountry(data[index].TRV_HDR.ZZ_LAND1);
			oData["ReimSendMailNav"].push({ZZ_PERNR:data[index].TRV_HDR.ZZ_PERNR,ZZ_REINR:data[index].TRV_HDR.ZZ_REINR,
				ZZ_FMLOC:data[index].TRV_HDR.ZZ_FMLOC,ZZ_LOCATION_END:data[index].TRV_HDR.ZZ_LOCATION_END,
				ZZ_LAND1:toCountry,ZZ_DATV1:data[index].TRV_HDR.ZZ_DATV1,
				ZZ_DATB1:data[index].TRV_HDR.ZZ_DATB1,ZZ_ZDURN:data[index].TRV_HDR.ZZ_ZDURN,
				WAERS:data[index].WAERS});
		}
		
		oDataModel.create("ReimSendMailSet", oData, null, jQuery.proxy(function(oData, response) {
			// oController.uploadFiles(global.ZZ_TRV_REQ);
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);

			sap.m.MessageToast.show("Mail has been sent successfully", {
				duration : 10000,
				closeOnBrowserNavigation : false
			});
		},this), jQuery.proxy(function(error) {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
			sap.m.MessageToast.show("Internal Server Error");
		},this), true);
		}else{
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
			sap.m.MessageToast.show("Please select atleast one row");
		}
		
	},
	onExport : function() {
		var table = this.getView().byId("idlistAdmin");
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
		
			oExport.saveFile("Reimbursement Report").always(function() {
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
			if (cols[i].getVisible()) {
				if (cells[i].getBindingInfo("text") || cells[i].getBindingInfo("value") || cells[i].getBindingInfo("dateValue")) {
					var path = cells[i].getBindingInfo("text") ? cells[i].getBindingInfo("text").parts[0].path : (cells[i].getBindingInfo("value") ? cells[i].getBindingInfo("value").parts[0].path : cells[i].getBindingInfo("dateValue").parts[0].path);
					// var path = cells[i].getBindingInfo("text").parts[0].path;
					var text = cols[i].getHeader().getText();
					if (text) {
					//	var id = text.split("--");
						if (text.indexOf("Date")!=-1) {
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
	onMassAccount : function() {
		var table = this.getTable(this.getView().byId("inra--mrtab"),this.getView().byId("inra--mrtab").getSelectedKey());

		var items = table.getSelectedItems();
	//	results.LoginRole = sap.ui.getCore().getModel("profile").getData().currentRole;
		if(items.length!=0){
		var dialog = new sap.m.Dialog({
			title : 'Date',
			showHeader : true,			
			type : 'Standard',
			content : [ new sap.m.HBox({alignItems:"Center",justifyContent:"SpaceBetween",items:[new sap.m.Label({text:"Enter Date:"}),
				                               new sap.m.DatePicker("postDate",{displayFormat:"dd.MM.yyyy",valueFormat:"yyyyMMdd"})
			]})],
			
			beginButton :new sap.m.Button({
				text : 'Cancel',
				type : sap.m.ButtonType.Emphasized,
				press : function() {
					dialog.close();
				}
			}), 
			endButton : new sap.m.Button({
				text : 'Run Simulation',
				type : sap.m.ButtonType.Emphasized,
				press:jQuery.proxy(function(){
					var postValue = sap.ui.getCore().byId("postDate").getValue();
					if(postValue==""){
						sap.m.MessageToast.show("Please enter Date");
					}else{
					dialog.close();
					this.prepareSimulationData(postValue);
					}
				},this)}),
			afterClose : function() {
				dialog.destroy();
			}
		});
		dialog.open();
		
			

		} else {
			sap.m.MessageToast.show("Please select atleast one row");
		}
	},
	prepareSimulationData:function(postDateValue){
		var results = {Date:postDateValue,SmlRun:'X'};
	
		results.ForexAutomationACNav = [];
		
		var table = this.getTable(this.getView().byId("inra--mrtab"),this.getView().byId("inra--mrtab").getSelectedKey());

		var items = table.getSelectedItems();
	

			var oData = table.getModel("trworklist").getData();
			for ( var i = 0; i < items.length; i++) {
				var j = table.indexOfItem(items[i]);
				results.ForexAutomationACNav.push({
					
				    Date:postDateValue,
					REINR : oData[j].TravelPlan,
					TRVKY : oData[j].TravelType,
					PERNR : oData[j].EmpNo,
					MODID : oData[j].Module,				
				});
			}
			
			var postDef = this.onPostAmounts(results);
		   
			postDef.done(jQuery.proxy(function(results){
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
				this.openINRAPostDialog(results);
			},this));
	},
	onPostAmounts:function(oData){
		var postDef = $.Deferred();
		oDataModel.create("ForexAutomationDateSet", oData, null, function(oData, response) {
			//sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
		   // this
			postDef.resolve(oData);
		}, function(error) {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
			sap.m.MessageToast.show("Internal Server Error");
		}, true);	 
		return postDef.promise();
	},
	openINRAPostDialog : function(oData) {
		var accTable;
		
			
		if (!(sap.ui.getCore().byId("frexAccTable")))
			accTable = sap.ui.xmlfragment("sap.ui.project.e2etm.fragment.CardReload.AccountingTable", this);
		else
			accTable = sap.ui.getCore().byId("frexAccTable");
		
		var model = new sap.ui.model.json.JSONModel();
		model.setData(oData.ForexAutomationAmountNav.results);
		sap.ui.getCore().byId("expTable").setModel(model);
		
		var model = new sap.ui.model.json.JSONModel();
		model.setData(oData.ForexAutomationErrorNav.results);
		sap.ui.getCore().byId("errTable").setModel(model);
		//sap.ui.getCore().byId("Table").setModel(model,"travelsettlement");
		
		var dialog = new sap.m.Dialog({
			title : 'Confirm',
			showHeader : true,
			stretch : true,
			type : 'Standard',
			content : [ accTable ],
			customHeader:new sap.m.Bar({contentMiddle:[new sap.m.Label({text:"Details"})],
				                       }),
			beginButton :new sap.m.Button({
				text : 'Cancel',
				type : sap.m.ButtonType.Emphasized,
				press : function() {
					dialog.close();
				}
			}), 
			endButton : new sap.m.Button({
				text : 'Post',
				type : sap.m.ButtonType.Emphasized,
				press:jQuery.proxy(function(){
					oData.SmlRun = '';
					oData.ActPost = 'X';
					var postDef = this.onPostAmounts(oData);
					   
					postDef.done(jQuery.proxy(function(results){
						
						dialog.close();
						sap.m.MessageToast.show("Posted Successfully");
						oController.fetchDetails();
					},this));
				},this)}),
			afterClose : function() {
				dialog.destroy();
			}
		});
		dialog.open();
	},
	
// ======== Begin of reimbursement info==============
/**
 * Similar to onAfterRendering, but this hook is invoked before the controller's
 * View is re-rendered (NOT before the first rendering! onInit() is used for
 * that one!).
 * 
 * @memberOf e2etm.view.TRSettlementDashboard
 */
// onBeforeRendering: function() {
//
// },
/**
 * Called when the View has been rendered (so its HTML is part of the document).
 * Post-rendering manipulations of the HTML could be done here. This hook is the
 * same one that SAPUI5 controls get after being rendered.
 * 
 * @memberOf e2etm.view.TRSettlementDashboard
 */
// onAfterRendering: function() {
//
// },
/**
 * Called when the Controller is destroyed. Use this one to free resources and
 * finalize activities.
 * 
 * @memberOf e2etm.view.TRSettlementDashboard
 */
// onExit: function() {
//
// }
});