jQuery.sap.require("sap.ui.project.e2etm.util.Formatter");
jQuery.sap.require("sap.ui.project.e2etm.util.StaticUtility");

sap.ui.controller("sap.ui.project.e2etm.controller.AccmTool", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf e2etm.view.AccmTool
*/
	onInit: function() {

		sap.ui.core.routing.Router.getRouter("MyRouter").attachRoutePatternMatched(this.onRouteMatched, this);
	//	sap.ui.core.routing.Router.getRouter("MyRouter").attachRouteMatched(this.onGenRouteMatched, this);
		this.getCurrency();
	},

	onRouteMatched : function(evt) {
	//	sap.ui.project.e2etm.util.StaticUtility.displayViewBasedOnRole("ACCD;ACCO");
		var icontab = this.getView().byId("adminBar");
		var mainTab = this.getView().byId("mainBar");
		var name = evt.getParameter("name");
		var oShell = oComponent.oContainer.getParent();
		if(this.getView().getParent().getCurrentPage().getParent().getPreviousPage())
			this.getView().byId("btnHome").setVisible(true);
		else
			this.getView().byId("btnHome").setVisible(false);
		this.tabsVisibleBasedOnRole();
		if(evt.getParameter("name")=="AccmTool"){	
		
			oShell.setAppWidthLimited(false);
		   //this.onAdminTabSelect();
		  this.onTabSelect();
		   
		}else if(name =="reservation" || name == "manualtp" || name == "manualtpcreate" ||name == "hotelsList" || 
				 name == "hotelCreate" || name == "hotelRoomsList" || name == "roomCreate" || name == "ohaallowance" || 
				 name == "monthlyroomrent" ){
			oShell.setAppWidthLimited(false);
			if(mainTab.getSelectedKey()!="ADMN")
				mainTab.setSelectedKey("ADMN");
			switch(name)
			{
			case "reservation":
				if(icontab.getSelectedKey()!="ADVR")
				    icontab.setSelectedKey("ADVR");
				break;
			case "manualtp":
				if(icontab.getSelectedKey()!="ADTP")
				     icontab.setSelectedKey("ADTP");
				break;
			case "manualtpcreate":
				if(icontab.getSelectedKey()!="ADTP")
				     icontab.setSelectedKey("ADTP");
				break;
			case "hotelsList":
				if(icontab.getSelectedKey()!="ADHT")
				     icontab.setSelectedKey("ADHT");
				break;
			case "hotelCreate":
				if(icontab.getSelectedKey()!="ADHT")
				     icontab.setSelectedKey("ADHT");
				break;
			case "hotelRoomsList":
				if(icontab.getSelectedKey()!="ADHT")
				     icontab.setSelectedKey("ADHT");
				break;
			case "roomCreate":
				if(icontab.getSelectedKey()!="ADHT")
				     icontab.setSelectedKey("ADHT");
				break;
			case "ohaallowance":
				if(icontab.getSelectedKey()!="ADOA")
				     icontab.setSelectedKey("ADOA");
				break;
			case "monthlyroomrent":
				if(icontab.getSelectedKey()!="ADRT")
				     icontab.setSelectedKey("ADRT");
				break;
			}
			

		}else if(name =="occupancy" || name =="bookingdetails" || name == "payrollteamreport" || 
				 name =="booksetlreport" || name == "costanlrep" || name == "ohaallwreport"){
			oShell.setAppWidthLimited(false);
			if(mainTab.getSelectedKey()!="REPT")
				mainTab.setSelectedKey("REPT");
			switch(name){
			case "occupancy":					
			if(this.getView().byId("reportBar").getSelectedKey()!="RPOR")
		        this.getView().byId("reportBar").setSelectedKey("RPOR");
			break;
			case "bookingdetails":
			if(this.getView().byId("reportBar").getSelectedKey()!="RPBD")
			     this.getView().byId("reportBar").setSelectedKey("RPBD");
			break;
			case "payrollteamreport":
			if(this.getView().byId("reportBar").getSelectedKey()!="RPDP")
			    this.getView().byId("reportBar").setSelectedKey("RPDP");
			break;
			case "booksetlreport":
			if(this.getView().byId("reportBar").getSelectedKey()!="RPSR")
				this.getView().byId("reportBar").setSelectedKey("RPSR");
			break;
			case "costanlrep":
			if(this.getView().byId("reportBar").getSelectedKey()!="RPCA")
				this.getView().byId("reportBar").setSelectedKey("RPCA");
			break;
			case "ohaallwreport":
				if(this.getView().byId("reportBar").getSelectedKey()!="RPOH")
					this.getView().byId("reportBar").setSelectedKey("RPOH");
				break;		
			}
	}
		
		
			
	},
	tabsVisibleBasedOnRole:function(){
		var position = sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_POSITION;
		var roles = position.split(";");
		var currentRole = localStorage.getItem('currentRole');
		this.getView().byId("tabAdmin").setVisible(false);
		this.getView().byId("tabOccRep").setVisible(false);
		this.getView().byId("tabCost").setVisible(false);
		this.getView().byId("tabBookDetls").setVisible(false);
		this.getView().byId("tabPayroll").setVisible(false);
		this.getView().byId("tabSetlRep").setVisible(false);
		this.getView().byId("tabOhaRep").setVisible(false);
		
		
		if(currentRole == "FINA"){
    		this.getView().byId("tabBookDetls").setVisible(true);
    		this.getView().byId("tabSetlRep").setVisible(true);    		
    	
		}else if(currentRole == "MRCR"){
			this.getView().byId("tabBookDetls").setVisible(true);
		}
		else if(currentRole == "TRST"){
    		this.getView().byId("tabSetlRep").setVisible(true);
		}else{
			this.getView().byId("tabAdmin").setVisible(true);
    		this.getView().byId("tabOccRep").setVisible(true);
    		this.getView().byId("tabCost").setVisible(true);
    		this.getView().byId("tabBookDetls").setVisible(true);
    		this.getView().byId("tabPayroll").setVisible(true);
    		this.getView().byId("tabSetlRep").setVisible(true);
    		this.getView().byId("tabOhaRep").setVisible(true);
		}
		
  
	},
	onTabSelect:function(evt){
		var key = this.getView().byId("mainBar").getSelectedKey();
		var role = sap.ui.getCore().getModel("profile").getData().currentRole;
		switch(key){
		case "ADMN":
//			if(role=="MRCR" ||  role == "FINA"){
//				sap.m.MessageToast.show("You are not authorized to view Administrator tab");
//				this.getView().byId("mainBar").setSelectedKey("REPT");
//				this.onReportTabSelect();
//				return;
//			}
			this.onAdminTabSelect();
			break;
		case "REPT":
			this.onReportTabSelect();
		    break;		
		}
	},
	onAdminTabSelect:function(evt){
		var key = this.getView().byId("adminBar").getSelectedKey();
		switch(key){
		case "ADHT":
			sap.ui.core.routing.Router.getRouter("MyRouter").navTo("hotelsList");
			break;
		case "ADVR":
			sap.ui.core.routing.Router.getRouter("MyRouter").navTo("reservation");			
			break;
		case "ADOA":
			sap.ui.core.routing.Router.getRouter("MyRouter").navTo("ohaallowance");			
			break;
		case "ADRT":
			sap.ui.core.routing.Router.getRouter("MyRouter").navTo("monthlyroomrent");			
			break;
		case "ADTP":
			sap.ui.core.routing.Router.getRouter("MyRouter").navTo("manualtp");			
			break;			
		}
	},
	
	onReportTabSelect:function(evt){
		var key = this.getView().byId("reportBar").getSelectedKey();
		switch(key){
		case "RPOR":
			sap.ui.core.routing.Router.getRouter("MyRouter").navTo("occupancy");
			break;
		case "RPCA":
			sap.ui.core.routing.Router.getRouter("MyRouter").navTo("costanlrep");			
			break;
		case "RPBD":
			sap.ui.core.routing.Router.getRouter("MyRouter").navTo("bookingdetails");			
			break;		
		case "RPDP":
			sap.ui.core.routing.Router.getRouter("MyRouter").navTo("payrollteamreport");			
			break;	
		case "RPSR":
			sap.ui.core.routing.Router.getRouter("MyRouter").navTo("booksetlreport");			
			break;	
		case "RPOH":
			sap.ui.core.routing.Router.getRouter("MyRouter").navTo("ohaallwreport");			
			break;	
			
			
		}
	},
	getCurrency : function(evt) {
		var getCurr = oComponent.getModel().createBatchOperation(
				"GetF4Help?Srch_help='F4_TCURC_ISOCD'&$format=json", "GET");
		var getFreq = oComponent.getModel().createBatchOperation(
				"GetDomain?DomainName='ZE2E_RFREQ'&$format=json", "GET");
		oComponent.getModel().addBatchReadOperations([ getCurr, getFreq ]);
		oComponent.getModel().submitBatch(jQuery.proxy(function(oResult) {

			var model = new sap.ui.model.json.JSONModel();
			model.setData(oResult.__batchResponses[0].data.results);
			this.getView().setModel(model, "curModel");

			var freqModel = new sap.ui.model.json.JSONModel();
			freqModel.setData(oResult.__batchResponses[1].data.results);
			this.getView().setModel(freqModel, "period");
		}, this));

	},
	onHomePress:function(){
		var viewname = this.getView().getParent().getCurrentPage().getParent().getPreviousPage().sViewName;
//		if(viewname == "sap.ui.project.e2etm.view.AccommodationAdmin"){
			sap.ui.core.routing.Router.getRouter("MyRouter").navTo("accommodationAdmin",{user:"Admin"});
//		}
//		else{
//	    	sap.ui.core.routing.Router.getRouter("MyRouter").navTo("accommodation",{},true);
//		}
	}
//	getCurrency:function(){
//		var odata = {Srch_help:'F4_TCURC_ISOCD'};
//		oComponent.getModel().callFunction("GetF4Help", "GET", odata, null, jQuery.proxy(function(oData, response) {
//			
//			var model = new sap.ui.model.json.JSONModel();
//			model.setData(oData.results);
//			this.getView().setModel(model,"curModel");
//			
//		}, this), jQuery.proxy(function(error) {
//			
//		}));
//		
//	}
	


/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf e2etm.view.AccmTool
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf e2etm.view.AccmTool
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf e2etm.view.AccmTool
*/
//	onExit: function() {
//
//	}

});