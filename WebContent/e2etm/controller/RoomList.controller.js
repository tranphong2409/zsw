sap.ui.controller("sap.ui.project.e2etm.controller.RoomList", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf e2etm.view.RoomList
*/
	onInit: function() {
		sap.ui.core.routing.Router.getRouter("MyRouter")
		.attachRoutePatternMatched(this.onRouteMatched, this);
//		var resModel = new sap.ui.model.odata.v2.ODataModel(resServiceUrl, {json:true,defaultOperationMode:"Client"});
//		resModel.setDefaultBindingMode("TwoWay");
//		this.getView().byId("table").setModel(resModel,"reservation");
	},
	onRouteMatched:function(evt){
		if (evt.getParameter("name") == "hotelRoomsList") {
		    // this.fetchDetails();	
//			var oShell = oComponent.oContainer.getParent();		
//			oShell.setAppWidthLimited(false);
			var oArgs = evt.getParameter("arguments");
			var model = new sap.ui.model.json.JSONModel();
			model.setData({Hcode:oArgs.code,Hname:oArgs["?query"].name});
			this.getView().setModel(model,"viewData");
			this.refreshListData();
			
			
		}			
	},
	onLiveSearch:function(evt){
		var value = evt.getSource().getValue();
		var model = new sap.ui.model.Filter({path:"Hcode",operator:"Contains",value1:value});
		var aFilters = [new sap.ui.model.Filter({path:"Romno",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"RtypeDesc",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Rsize",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Rcost",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Waers",operator:"Contains",value1:value}),
		             	
		             	new sap.ui.model.Filter({path:"Runit",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Floor",operator:"Contains",value1:value}),
		            	new sap.ui.model.Filter({path:"BegdaTxt",operator:"Contains",value1:value}),
		            	new sap.ui.model.Filter({path:"EnddaTxt",operator:"Contains",value1:value}),
		            	
		            	
		             	];
		
		var oFilter = new sap.ui.model.Filter(aFilters,false);
		this.getView().byId("table").getBinding("rows").filter(oFilter,"Application");
	},
	refreshListData:function(){
		var viewData = this.getView().getModel("viewData").getData();	
	    //this.getView().byId("table").bindRows("reservation>/HotelDetailsSet(Hcode='"+viewData.Hcode+"')/HotelToRoomListNav");
	oComponent.getModel("reservation").read("/HotelDetailsSet(Hcode='"+viewData.Hcode+"')/HotelToRoomListNav", null, null, true, jQuery.proxy(function(oData, response) {
		var oModel = new sap.ui.model.json.JSONModel();
		oModel.setData(oData.results);
		this.getView().byId("table").setModel(oModel,"reservation");	

	},this), jQuery.proxy(function(error) {
		
		
	},this));
	},
	onRoomAdd:function(){
		var viewData = this.getView().getModel("viewData").getData();	
		sap.ui.core.routing.Router.getRouter("MyRouter").navTo("roomCreate",
				                         {code:viewData.Hcode,type:"Create",query:{name:viewData.Hname}});
	},
	onRoomEdit:function(evt){
		var path = evt.getSource().getParent().getBindingContext("reservation").sPath;
		var data = evt.getSource().getParent().getBindingContext("reservation").getModel().getProperty(path);
		var viewData = this.getView().getModel("viewData").getData();	
		
		//var romno = data.Romno.replace("/","~");
		var romno = encodeURIComponent(data.Romno);

		sap.ui.core.routing.Router.getRouter("MyRouter").navTo("roomCreate",
				                         {code:data.Hcode,type:"Change",query:{room:romno,name:viewData.Hname}});
	},
	onRoomDelete:function(evt){
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, this);
		var viewData = this.getView().getModel("viewData").getData();
		var table = this.getView().byId("table");
		var items = table.getSelectedIndices();
		if(items.length==0){
			sap.m.MessageToast.show("Please select atleast one Room");
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
			return;
		}
		var rows = table.getRows();
		var oData={Hcode:viewData.Hcode,HotelToRoomListNav:[]};
		for(var i=0;i<items.length;i++){
			var row = rows[items[i]];
			var data = row.getBindingContext("reservation").getModel().getProperty(row.getBindingContext("reservation").sPath);
			delete data["HotelToRoomListNav"];
			delete data["__metadata"];
			oData.HotelToRoomListNav.push(data);
		}
		
		oComponent.getModel("reservation").create("/HotelDetailsSet", oData, {success: jQuery.proxy(function(oData, response) {

			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
		
			sap.m.MessageToast.show("Deleted Successfully", {
				duration : 10000,
				closeOnBrowserNavigation : false
			});
			this.refreshListData();
		},this),error: jQuery.proxy(function(error) {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
			sap.m.MessageToast.show("Internal Server Error");
		},this)});
	},
    onImport:function(evt){
		
		var file = evt.getParameter("files")[0];
		var importFile = $.Deferred();
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, this);
		importFile = sap.ui.project.e2etm.util.StaticUtility.onXLSFileImport(file,"HotelDetailsSet","HotelToRoomListNav",oComponent.getModel("reservation"));
		
		importFile.done(jQuery.proxy(function(response){
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
			sap.m.MessageToast.show("Uploaded Successfully");
			 this.refreshListData();
		},this));
		
		importFile.fail(jQuery.proxy(function(response){
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
			sap.m.MessageToast.show("Error occurs");
			
		},this));
	
	},
    onExportCSV:function(){
		
		var table = this.getView().byId("table");
		var model = table.getModel("reservation");
		var columns = this.getAccExcelColumns();
	//	sap.ui.project.e2etm.util.StaticUtility.exportCSV(table,model,"Hotels List",columns);
		sap.ui.project.e2etm.util.StaticUtility.exportCSV(table,model,"Rooms List",columns);
	
	},
	getAccExcelColumns:function(){
		var columns = [{
			name : "Hotel Code_Hcode",
			template : {
				
					content : {
			              path : "Hcode",
			              formatter : sap.ui.project.e2etm.util.Formatter.formatHcodeLeadZero
			            }
				
			}
		}, {
			name : "Room No_Romno",
			template : {
				content : "{Romno}"
			}
		}, {
			name : "Room Type_Rtype",
			template : {
				content : "{Rtype}"
			}
		}, {
			name : "Cost_Rcost",
			template : {
				content : "{Rcost}"
			// "{Width} x {Depth} x {Height} {DimUnit}"
			}
		}, {
			name : "Currency_Waers",
			template : {
				content : "{Waers}"
			}
		},{
			name : "Rent Period_Rfreq",
			template : {
				content : "{Rfreq}"
			}
		}, {
			name : "Room Size_Rsize",
			template : {
				content : "{Rsize}"
			}
		},{
			name : "Room Status_Rstat",
			template : {
				content : "{Rstat}"
			}
		},{
			name : "Floor_Floor",
			template : {
				content : "{Floor}"
			}
		},{
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
			name : "Manager_Trmgr",
			template : {
				content : "{Trmgr}"
			}
		},{
			name : "No of Persons_Nopers",
			template : {
				content : "{Nopers}"
			}
		}];
		
		return columns;
	
	},
	onNavBack : function() {


		window.history.go(-1);
	}
	

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf e2etm.view.RoomList
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf e2etm.view.RoomList
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf e2etm.view.RoomList
*/
//	onExit: function() {
//
//	}

});