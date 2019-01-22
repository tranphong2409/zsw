
jQuery.sap.require("sap.ui.project.e2etm.util.Formatter");
jQuery.sap.require("sap.ui.project.e2etm.util.StaticUtility");
jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("sap.m.MessageToast");

sap.ui.controller("sap.ui.project.e2etm.controller.InsSlaReport", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf e2etm.view.InsSlaReport
*/
	onInit: function() {
	

			
			
		sap.ui.core.routing.Router.getRouter("MyRouter").attachRoutePatternMatched(this.onRouteMatchedDetail, this);
		
		
		this.getView().byId("idToDate").onsapenter=jQuery.proxy(this.dateSearch,this);
			
		that=this;
		this.getView().byId("pgInsRecRep").setShowNavButton(true);
		if(this.getView().getId()=="insRecView"){
			this.getView().byId("pgInsRecRep").setShowNavButton(false);
			this.getData();
		}
	
	},
	
		
	onRouteMatchedDetail : function(evt){
		
		if(evt.getParameter("name") == "InsSlaReport"){
			var oShell = oComponent.oContainer.getParent();
			oShell.setAppWidthLimited(false);	
		    this.getData();
				
		}else if(evt.getParameter("name") == "setlInsRecRep"){
			var oShell = oComponent.oContainer.getParent();
			oShell.setAppWidthLimited(false);	
			this.getView().byId("pgInsRecRep").setShowNavButton(false);
		    this.getData();
		}
//		else{
//			var oShell = oComponent.oContainer.getParent();
//			oShell.setAppWidthLimited(true);	
//		}
	},
	getData:function(){
		var oDataModel =  new sap.ui.model.odata.ODataModel(sServiceUrl,true);
		var that = this;
		
		oDataModel.callFunction('InsSlaReport',{method:'GET', success:function(oData,response){
			
		var Jsonmodel = new sap.ui.model.json.JSONModel();
		
		Jsonmodel.setData(oData.results);
		that.getView().byId("InsSlaReportTable").setModel(Jsonmodel);
		
					
		},error:function(oError){
			
			
		}});
	},
	
	
	
	dateSearch : function(evt){
		var sFromDate = this.getView().byId("idFromDate").getValue();
		var sToDate = this.getView().byId("idToDate").getValue();
		if(sFromDate!=" " && sToDate !=" "    ){
			
		var oTabledata = this.getView().byId("InsSlaReportTable").getValue();
		
		};
	
	},

	backPress : function(evt){
		
		sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
		
	},


	onSearch : function(evt){
		var aFilters =[];
		searchString = this.getView().byId("idSearch").getValue();
		if (searchString != "") {
			var oDateFilterSearch = new sap.ui.model.Filter({ path: "ZZ_PERNR" , operator: "EQ", value1: searchString });
			var oDateFilterSearch1 = new sap.ui.model.Filter({ path: "ZZ_TRV_REQ" , operator: "EQ", value1: searchString });
			aFilters.push(oDateFilterSearch);
			aFilters.push(oDateFilterSearch1);
			var oFilter = new sap.ui.model.Filter(aFilters,false);
			this.getView().byId("InsSlaReportTable").getBinding("items").filter(oFilter);
		
		}else {
			
			this.getView().byId("InsSlaReportTable").getBinding("items").filter(null);
			
			
		}
	
		
	
	},
	


});