jQuery.sap.require("sap.ui.project.e2etm.util.Formatter");
jQuery.sap.require("sap.ui.core.util.Export");
jQuery.sap.require("sap.ui.core.util.ExportType");
jQuery.sap.require("sap.ui.core.util.ExportTypeCSV");
var trnsRep;
sap.ui.controller("sap.ui.project.e2etm.controller.TransferReport", {
	/**
	 * Called when a controller is instantiated and its View controls (if
	 * available) are already created. Can be used to modify the View before it
	 * is displayed, to bind event handlers and do other one-time
	 * initialization.
	 * 
	 * @memberOf zswift_final.TransferReport
	 */
	onInit : function() {
		trnsRep = this;
		sap.ui.core.routing.Router.getRouter("MyRouter").attachRoutePatternMatched(this.onRouteMatched, this);
	},
	onRouteMatched : function(evt) {
		var oShell = oComponent.oContainer.getParent();
		if (evt.getParameter("name") == "trnsrep") {
		var flag = trnsRep.checkHomeView();
		if(flag)
			oShell.setAppWidthLimited(false);
		else
			sap.ui.core.routing.Router.getRouter("MyRouter").navTo("home");
		}
			
		 else {
			oShell.setAppWidthLimited(true);
		}
	}, 
	checkHomeView:function(){
		var flag=false;
		var views = sap.ui.core.routing.Router.getRouter("MyRouter").getViews()._oViews;
		for(var index in views){
	       if(index=="sap.ui.project.e2etm.view.Home")
	    	   {
	    	   flag = true;
	    	   break;
	    	   }
		}
		return flag;
	},
	onItemPress : function() {
		var masterlist = trnsRep.getView().byId("masterlist");
		var index = masterlist.indexOfItem(masterlist.getSelectedItem());
		if (index == 0) {
			trnsRep.getView().byId("location").setVisible(false);
			trnsRep.getView().byId("country").setVisible(true);
		} else {
			trnsRep.getView().byId("location").setVisible(true);
			trnsRep.getView().byId("country").setVisible(false);
		}
		if (trnsRep.getView().getModel("transfer")) {
			var data = trnsRep.getView().getModel("transfer").getData();
			data = [];
			trnsRep.getView().getModel("transfer").setData(data);
		} else {
			var tabelmodel = new sap.ui.model.json.JSONModel();
			tabelmodel.setData([]);
			trnsRep.getView().setModel(tabelmodel, "transfer");
		}
	},
	onSubmit : function() {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, trnsRep);
		var flag = trnsRep.checkDates();
		if(flag)
			{
		var masterlist = trnsRep.getView().byId("masterlist");
		var index = masterlist.indexOfItem(masterlist.getSelectedItem());
		if (index == 0 || index == -1) {
			trnsRep.fetchDetails("STVA");
		} else if (index == 1) {
			trnsRep.fetchDetails("TRFR");
		}
			}
	},
	checkDates:function(){
		var stdate = trnsRep.getView().byId("fromdate").getValue();
		var endate = trnsRep.getView().byId("todate").getValue();
		if((stdate==undefined || stdate=="")&&(endate==undefined || endate==""))
			{
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, trnsRep);
			sap.m.MessageToast.show("Please enter Deputation Start and End date");
			return false;
			}
		else if(stdate!=""&&endate!=""){
			
			var syear = stdate.substring(0, 4);
			var smonth = stdate.substring(4, 6);
			var sdate = stdate.substring(6, 8);
			
			var startdate = new Date(syear, smonth - 1, sdate);
			
			var eyear = endate.substring(0, 4);
			var emonth = endate.substring(4, 6);
			var edate = endate.substring(6, 8);
			
			var enddate = new Date(eyear, emonth - 1, edate);
			if(enddate<startdate)
				{
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, trnsRep);
				sap.m.MessageToast.show("Deputation End date should be greater than Start Date");
				return false;
				}
			
		}
		return true;
	},
	fetchDetails : function(type) {
		var sdate = trnsRep.getView().byId("fromdate").getValue();
		var edate = trnsRep.getView().byId("todate").getValue();
		oDataModel.read("TransferRepSet?$filter=StartDate eq '" + sdate + "' and EndDate eq '" + edate + "' and ContractType eq '" + type + "'", null, null, true,
		// success
		function(oData, response) {
			if (trnsRep.getView().getModel("transfer")) {
				var data = trnsRep.getView().getModel("transfer").getData();
				data = oData.results;
				trnsRep.getView().getModel("transfer").setData(data);
			} else {
				var tabelmodel = new sap.ui.model.json.JSONModel();
				tabelmodel.setData(oData.results);
				trnsRep.getView().setModel(tabelmodel, "transfer");
			}
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, trnsRep);
		}, function(error) {
			// error
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, trnsRep);
		});
	},
	onChangeMode : function() {
		if (trnsRep.getView().byId("splitapp").getMode() != "HideMode")
			trnsRep.getView().byId("splitapp").setMode("HideMode");
		else
			trnsRep.getView().byId("splitapp").setMode("ShowHideMode");
	},
	onDataExport : function() {
		var data = trnsRep.getView().getModel("transfer").getData();
		if (data.length != 0) {
			var columns = trnsRep.getColumns();
			oExport = new sap.ui.core.util.Export({
				exportType : new sap.ui.core.util.ExportTypeCSV({
					separatorChar : ","
				}),
				// exportType : new sap.ui.core.util.ExportType({
				// fileExtension : "pdf",
				// mimeType:"application/pdf",
				// charset:"UTF-8"
				// }),
				models : trnsRep.getView().getModel("transfer"),
				rows : {
					path : "/"
				},
				columns : columns
			});
			// download exported file
			oExport.saveFile().always(function() {
				this.destroy();
			});
		} else {
			sap.m.MessageToast.show("No data exists to download");
		}
	},
	getColumns : function() {
		var columns = [];
		var table = trnsRep.getView().byId("transferrep");
		var items = table.getItems();
		var cells = items[0].getCells();
		var cols = table.getColumns();
		for ( var i = 0; i < cols.length; i++) {
			var path = cells[i].getBindingInfo("text").parts[0].path;
			columns.push({
				name : cols[i].getHeader().getText(),
				template : {
					content : "{" + path + "}"
				}
			});
		}
		return columns;
	},
	onMenu : function(evt) {
		menuRef = sap.ui.project.e2etm.util.StaticUtility.customMenuOpen(trnsRep,evt);

	},
	onMenuItemSelect : function(evt) {
		var aFilters = [];
		var aSorters = [];
		var menu = trnsRep.getView().byId("menu_settings");
		var table = trnsRep.getView().byId("transferrep");
		var sPath = trnsRep.findProperty();
		var oBinding = table.getBinding("items");
		sap.ui.project.e2etm.util.StaticUtility.customMenuItemSelect(trnsRep,evt,menuRef,sPath,oBinding);

	},
	getItembyKey:function(){
		var item;
		var iconTab = trnsRep.getView().byId("idIconTabBarTcktAdmin");
		var key = iconTab.getSelectedKey();
		var items = iconTab.getItems();
		$.each(items,function(index,value){
			if(value.getKey()==key){
				found=index;
				item = value;
				return false;
			}
		});
		if(!item) {
			item = iconTab.getItems()[0];
		}
		return item;
	},

	findProperty : function() {
		var sPath;
		var id = menuRef.getId().split("--");
		switch (id[1]) {
		case "empname":
			sPath = "EmpName";
			break;
		case "empno":
			sPath = "EmpNo";
			break;
		case "dept":
			sPath = "Department";
			break;
		case "section":
			sPath = "Section";
			break;
		case "bu":
			sPath = "BU";
			break;
		case "ctype":
			sPath = "ContractType";
			break;
		case "level":
			sPath = "Level";
			break;
		case "cntry":
			sPath = "ToCountryText";
			break;
		case "depsdate":
			sPath = "StartDate";
			break;
		case "depedate":
			sPath = "EndDate";
			break;
			case "aduration":
			sPath = "Duration";
			break;

		}
		return sPath;
	},
/**
 * Similar to onAfterRendering, but this hook is invoked before the controller's
 * View is re-rendered (NOT before the first rendering! onInit() is used for
 * that one!).
 * 
 * @memberOf zswift_final.TransferReport
 */
// onBeforeRendering: function() {
//
// },
/**
 * Called when the View has been rendered (so its HTML is part of the document).
 * Post-rendering manipulations of the HTML could be done here. This hook is the
 * same one that SAPUI5 controls get after being rendered.
 * 
 * @memberOf zswift_final.TransferReport
 */
// onAfterRendering: function() {
//
// },
/**
 * Called when the Controller is destroyed. Use this one to free resources and
 * finalize activities.
 * 
 * @memberOf zswift_final.TransferReport
 */
// onExit: function() {
//
// }
});