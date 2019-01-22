sap.ui.controller("sap.ui.project.e2etm.controller.ManualTPList", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf e2etm.view.ManualTPList
*/
	onInit: function() {
		sap.ui.core.routing.Router.getRouter("MyRouter").attachRoutePatternMatched(this.onRouteMatched, this);
	},
	
	onRouteMatched:function(evt){
		if(evt.getParameter("name") == "manualtp"){
			var oShell = oComponent.oContainer.getParent();		
			oShell.setAppWidthLimited(false);
			this.fetchDetails();
		}
	},
	
	fetchDetails:function(){
		oComponent.getModel("reservation").read("/ManualTpListSet", null, null, true, jQuery.proxy(function(oData, response) {
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(oData.results);
			this.getView().byId("tblTpList").setModel(oModel,"manualtp");	

		},this), jQuery.proxy(function(error) {
			
			
		},this));
	
	//	this.getView().byId("tblHotelList").bindRows("reservation>/HotelDetailsSet");
	},
	onTPAdd:function(evt){
		sap.ui.core.routing.Router.getRouter("MyRouter").navTo("manualtpcreate",{type:"Create"});
	},
	onTPEdit:function(evt){
		var path = evt.getSource().getParent().getBindingContext("manualtp").sPath;
		var data = evt.getSource().getParent().getBindingContext("manualtp").getModel().getProperty(path);
	
		sap.ui.core.routing.Router.getRouter("MyRouter").navTo("manualtpcreate",{reinr:data.Reinr,type:"Change"});
	},
	onLiveSearch:function(evt){
		var value = evt.getSource().getValue();
		var model = new sap.ui.model.Filter({path:"Empname",operator:"Contains",value1:value});
		var aFilters = [new sap.ui.model.Filter({path:"Reinr",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"BegdaTxt",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"EnddaTxt",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"FromCountryTxt",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"ToCountryTxt",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"FromLocTxt",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"ToLocTxt",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Email",operator:"Contains",value1:value}),
		             	];
		
		var oFilter = new sap.ui.model.Filter(aFilters,false);
		this.getView().byId("tblTpList").getBinding("rows").filter(oFilter);
	},
	onBookClick:function(evt){
		var path = evt.getSource().getParent().getBindingContext("manualtp").sPath;
		var data = evt.getSource().getParent().getBindingContext("manualtp").getModel().getProperty(path);
	
		sap.ui.core.routing.Router.getRouter("MyRouter").navTo("reservation",{reinr:data.Reinr,pernr:data.Pernr});
	},
	  onImport:function(evt){
			
			var file = evt.getParameter("files")[0];
			var importFile = $.Deferred();
			sap.ui.project.e2etm.util.StaticUtility.setBusy(true, this);
			importFile = sap.ui.project.e2etm.util.StaticUtility.onXLSFileImport(file,"ManualTpListSet","ManualTpListToTpNav",oComponent.getModel("reservation"))
			importFile.done(jQuery.proxy(function(response){
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
				sap.m.MessageToast.show("Uploaded Successfully");
				this.fetchDetails();
			},this));
			
			importFile.fail(jQuery.proxy(function(response){
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
				sap.m.MessageToast.show("Error occurs");
				
			},this));
		
		},
		onExportCSV:function(){			
			var table = this.getView().byId("tblTpList");
			var model = table.getModel("manualtp");
			var columns = this.getAccExcelColumns();
			sap.ui.project.e2etm.util.StaticUtility.exportCSV(table,model,"Manual TP List",columns);		
		},
		getAccExcelColumns:function(){
			var columns = [{
				name : "Employee No_Pernr",
				template : {
					content : "{Pernr}"
				}
			},{
				name : "Employee Name_Empname",
				template : {
					content : "{Empname}"
				}
			}, {
				name : "Travel Plan_Reinr",
				template : {
					content : "{Reinr}"
				}
			}, {
				name : "Travel Type_Trvky",
				template : {
					content : "{Trvky}"
				}
			}, {
				name : "From Country_Frmcn",
				template : {
					content : "{Frmcn}"
				// "{Width} x {Depth} x {Height} {DimUnit}"
				}
			}, {
				name : "To Country_Tocnt",
				template : {
					content : "{Tocnt}"
				}
			}, {
				name : "From Location_Frloc",
				template : {
					content : "{Frloc}"
				}
			},{
				name : "To Location_Toloc",
				template : {
					content : "{Toloc}"
				}
			},
			{
				name : "Start Date_Begda",
				template : {
					content : "{Begda}"
				}
			},{
				name : "End Date_Endda",
				template : {
					content : "{Endda}"
				}
			},{
				name : "Department_Department",
				template : {
					content : "{Department}"
				}
			},{
				name : "Level_Level",
				template : {
					content : "{Level}"
				}
			},{
				name : "Cost Center_Kostl",
				template : {
					content : "{Kostl}"
				}
			},{
				name : "Budget Code_BudgetCode",
				template : {
					content : "{BudgetCode}"
				}
			},{
				name : "Visa Category_Visa",
				template : {
					content : "{Visa}"
				}
			},{
				name : "Email_Email",
				template : {
					content : "{Email}"
				}
			}];
			
			return columns;
		
		},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf e2etm.view.ManualTPList
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf e2etm.view.ManualTPList
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf e2etm.view.ManualTPList
*/
//	onExit: function() {
//
//	}

});