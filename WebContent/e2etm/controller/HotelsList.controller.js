jQuery.sap.require("sap.ui.core.util.Export");
jQuery.sap.require("sap.ui.core.util.ExportType");
jQuery.sap.require("sap.ui.core.util.ExportTypeCSV");
sap.ui.controller("sap.ui.project.e2etm.controller.HotelsList", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf e2etm.view.HotelsList
*/
	onInit: function() {
		sap.ui.core.routing.Router.getRouter("MyRouter")
		.attachRoutePatternMatched(this.onRouteMatched, this);
	},
	onRouteMatched:function(evt){
		if (evt.getParameter("name") == "hotelsList") {
//			var oShell = oComponent.oContainer.getParent();		
//			oShell.setAppWidthLimited(false);
		    this.fetchDetails();			
		}			
	},
	fetchDetails:function(){
		oComponent.getModel("reservation").read("/HotelDetailsSet", null, null, true, jQuery.proxy(function(oData, response) {
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(oData.results);
			this.getView().byId("tblHotelList").setModel(oModel,"reservation");	

		},this), jQuery.proxy(function(error) {
			
			
		},this));
	
	//	this.getView().byId("tblHotelList").bindRows("reservation>/HotelDetailsSet");
	},
	onHotelAdd:function(){
		sap.ui.core.routing.Router.getRouter("MyRouter").navTo("hotelCreate",{type:"Create"});
	},
	onDelete:function(){
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, this);
		var items = this.getView().byId("tblHotelList").getSelectedIndices();
		if(items.length==0){
			sap.m.MessageToast.show("Please select atleast one Hotel");
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
			return;
		}
		var rows = this.getView().byId("tblHotelList").getRows();
		var oData={HotelDetailstoDetNav:[]};
		for(var i=0;i<items.length;i++){
			var row = rows[items[i]];
			var data = row.getBindingContext("reservation").getModel().getProperty(row.getBindingContext("reservation").sPath);
			delete data["HotelDetailstoDetNav"];
			delete data["__metadata"];
			oData.HotelDetailstoDetNav.push(data);
		}
		
		oComponent.getModel("reservation").create("/HotelDetailsSet", oData, {success:jQuery.proxy(function(oData, response) {
			// oController.uploadFiles(global.ZZ_TRV_REQ);
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
		
			sap.m.MessageToast.show("Deleted Successfully", {
				duration : 10000,
				closeOnBrowserNavigation : false
			});
			 this.fetchDetails();	
		},this), error:jQuery.proxy(function(error) {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
			sap.m.MessageToast.show("Internal Server Error");
		},this)});
	},
	onHotelEditPress:function(evt){
		var path = evt.getSource().getParent().getBindingContext("reservation").sPath;
		var data = evt.getSource().getParent().getBindingContext("reservation").getModel().getProperty(path);

		sap.ui.core.routing.Router.getRouter("MyRouter").navTo("hotelCreate",{type:"Change",code:data.Hcode});
	},
	onRoomsPress:function(evt){
		var path = evt.getSource().getParent().getBindingContext("reservation").sPath;
		var data = evt.getSource().getParent().getBindingContext("reservation").getModel().getProperty(path);
      
		sap.ui.core.routing.Router.getRouter("MyRouter").navTo("hotelRoomsList",{code:data.Hcode,query:{name:data.Hname}});
	},
	onLiveSearch:function(evt){
		var value = evt.getSource().getValue();
		var model = new sap.ui.model.Filter({path:"Hcode",operator:"Contains",value1:value});
		var aFilters = [new sap.ui.model.Filter({path:"Hname",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"City",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Country",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Cpers",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Email",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Phone",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Mrent",operator:"Contains",value1:value}),
		             	];
		
		var oFilter = new sap.ui.model.Filter(aFilters,false);
		this.getView().byId("tblHotelList").getBinding("rows").filter(oFilter);
	},
	onSortPress:function(evt){
		var id = evt.getSource().getId();
		var icon = evt.getSource().getSrc();
		var bDesc;
		var aSorters = [];
		
		if(icon == "sap-icon://sorting-ranking"){
			bDesc = false;
			evt.getSource().setSrc("sap-icon://sort-ascending");
		}
		else if(icon == "sap-icon://sort-ascending"){
			bDesc = true;
			evt.getSource().setSrc("sap-icon://sort-descending");
		}
		else if(icon == "sap-icon://sort-descending"){
			bDesc = undefined;
			evt.getSource().setSrc("sap-icon://sorting-ranking");
		}
			
		if(bDesc!=undefined){
		     aSorters.push(new sap.ui.model.Sorter(id.split("--")[1], bDesc));
		     this.getView().byId("tblHotelList").getBinding("items").sort(aSorters);
		}
		
		
		
	},
	onImport:function(evt){
		
		var file = evt.getParameter("files")[0];
		var importFile = $.Deferred();
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, this);
		importFile = sap.ui.project.e2etm.util.StaticUtility.onXLSFileImport(file,"HotelDetailsSet","HotelDetailstoDetNav",oComponent.getModel("reservation"))
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
		
		var table = this.getView().byId("tblHotelList");
		var model = table.getModel("reservation");
		var columns = this.getAccExcelColumns();
		sap.ui.project.e2etm.util.StaticUtility.exportCSV(table,model,"Hotels List",columns);
	
	},
	onEntriesDisplay:function(evt){
		this.getView().byId("tblOccList").setVisibleRowCount(parseInt(evt.getSource().getSelectedKey()));
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
			name : "Hotel Name_Hname",
			template : {
				content : "{Hname}"
			}
		}, {
			name : "Address_Hlocn",
			template : {
				content : "{Address}"
			}
		}, {
			name : "City_Hcity",
			template : {
				content : "{Hcity}"
			// "{Width} x {Depth} x {Height} {DimUnit}"
			}
		}, {
			name : "Country_Hcnty",
			template : {
				content : "{Hcnty}"
			}
		}, {
			name : "Email_Email",
			template : {
				content : "{Email}"
			}
		},{
			name : "Phone_Phone",
			template : {
				content : "{Phone}"
			}
		},{
			name : "Contact Person_Cpers",
			template : {
				content : "{Cpers}"
			}
		},{
			name : "Contract Start Date_Begda",
			template : {
				content : "{Begda}"
			}
		},{
			name : "Contract End Date_Endda",
			template : {
				content : "{Endda}"
			}
		},{
			name : "Room Rent_Mrent",
			template : {
				content : "{Mrent}"
			}
		},{
			name : "Currency_Waers",
			template : {
				content : "{Waers}"
			}
		},{
			name : "Frequency_Rfreq",
			template : {
				content : "{Rfreq}"
			}
		},{
			name : "Notes_Notes",
			template : {
				content : "{Notes}"
			}
		},{
			name : "Hotel Rules_Hruls",
			template : {
				content : "{Hruls}"
			}
		}
		];
		
		return columns;
	
	},
	onLocationPress:function(evt){
		var path = evt.getSource().getParent().getBindingContext("reservation").sPath;
		var data = evt.getSource().getParent().getBindingContext("reservation").getModel().getProperty(path);

		sap.ui.core.routing.Router.getRouter("MyRouter").navTo("officeLocation",{code:data.Hcode,query:{name:data.Hname}});
	}
	
/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf e2etm.view.HotelsList
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf e2etm.view.HotelsList
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf e2etm.view.HotelsList
*/
//	onExit: function() {
//
//	}

});