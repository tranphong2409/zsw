sap.ui.controller("sap.ui.project.e2etm.controller.BUSR.TravelDetails", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf e2etm.view.BUSR.TravelDetails
*/
	onInit: function() {
		var oModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl,{defaultBindingMode:"TwoWay",useBatch:true});
		oModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
		oModel.setDeferredBatchGroups(["myGroupId"]);
		oModel.setChangeBatchGroups({
		    "TRV_travel_Data": {
		    	batchGroupId: "myGroupId",
		    	changeSetId:"myGroupId"
		    }
		});
		this.byId("tbl").setModel(oModel);
	},
	
	onAfterRendering:function(evt){
		var oModel = this.getView().getModel();
		
		var fnSuccess = jQuery.proxy(function(oData){
			var jModel = this.getView().getModel("viewData");
			var aData = jModel.getData();
			aData.ModeF4 = oData.results;
			jModel.setData(aData);
			
		},this);
		
		var oHandle = oModel.callFunction("/GetDomain", {urlParameters: {DomainName:"ZINF_MODE"},batchGroupId:"GetF4",
			                                             success:fnSuccess});
		
		var fnLocSuccess = jQuery.proxy(function(oData){
			var jModel = this.getView().getModel("viewData");
			var aData = jModel.getData();
			aData.LocationF4 = oData.results;
			jModel.setData(aData);
		},this);
		
		oModel.read("/LocationSet",{batchGroupId:"GetF4",success:fnLocSuccess});
	
		var aDeferredGroups = oModel.getDeferredBatchGroups();	
		aDeferredGroups=["GetF4"];
		oModel.setDeferredBatchGroups(aDeferredGroups);
		oModel.submitChanges({aDeferredGroups});
	},
	
	onAdd:function(evt){
		var oList = this.byId("tbl"),
		oBinding = oList.getBinding("items");
		oModel = oList.getModel();
		
		
	    var oContext = oList.getModel().createEntry("/TRV_travel_DataSet",{batchGroupId: "myGroupId",properties:{
			"ZZ_ZFRPLACE" : "",
			"ZZ_ZTOPLACE" : "",
			"ZZ_BEGDA" : "",
			"ZZ_ZMODE":""
		},success:function(){
			alert("success");
		},error:function(error){
			alert("success");
		}});
	    


	    var nItem = new sap.m.ColumnListItem({cells:[new sap.m.Input({value:"{ZZ_ZFRPLACE}",suggestionItemSelected:this.onItemSelect,showSuggestion:true,suggestionItems:{
	    	path:'viewData>/LocationF4',template:new sap.ui.core.ListItem({text:"{viewData>Name}",additionalText:"{viewData>Region}"})
	    }}),
	    	                                         new sap.m.Input({value:"{ZZ_ZTOPLACE}",suggestionItemSelected:this.onItemSelect,showSuggestion:true,suggestionItems:{
	    	                                 	    	path:'viewData>/LocationF4',template:new sap.ui.core.ListItem({text:"{viewData>Name}",additionalText:"{viewData>Region}"})
	    	                                 	    }}),
	    	                                         new sap.m.Input({value:"{ZZ_BEGDA}"}),
    	                                             new sap.m.ComboBox({selectedKey:"{ZZ_ZMODE}",items:{path:'viewData>/ModeF4',
	    	                                        	                 template:new sap.ui.core.Item({key:"{viewData>DOMVALUE_L}",text:"{viewData>DDTEXT}"})},
	    	                                         
    	                                        	         })]});

//	    var nItem = new sap.m.ColumnListItem({cells:[new sap.m.Input({value:"{ZZ_ZFRPLACE}"}),
//	    	                                         new sap.m.Input({value:"{ZZ_ZTOPLACE}"}),
//	    	                                         new sap.m.Input({value:"{ZZ_BEGDA}"}),
//	    	                                         new sap.m.ComboBox({selectedKey:"{ZZ_ZMODE}",items:{path:'viewData>/ModeF4',
//	    	                                        	                 template:new sap.ui.core.Item({key:"{viewData>DOMVALUE_L}",text:"{viewData>DDTEXT}"})},
//	    	                                         
//	    	                                        	         })]});
	    	                                         
	    nItem.setBindingContext(oContext,undefined);
	    oList.insertItem(nItem,0);

	},
	onItemSelect:function(evt){
		var item = evt.getParameter("selectedItem");
		var oData = item.getBindingContext("viewData").getModel().getProperty(item.getBindingContext("viewData").sPath);
		
		evt.getSource().setValue(oData.Name);
	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf e2etm.view.BUSR.TravelDetails
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf e2etm.view.BUSR.TravelDetails
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf e2etm.view.BUSR.TravelDetails
*/
//	onExit: function() {
//
//	}

});