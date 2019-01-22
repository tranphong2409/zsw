jQuery.sap.require("sap.ui.project.e2etm.util.Formatter");
jQuery.sap.require("sap.ui.project.e2etm.util.StaticUtility");
sap.ui.controller("sap.ui.project.e2etm.controller.CSGeneration", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf e2etm.view.CSGeneration
*/
	onInit: function() {
		sap.ui.core.routing.Router.getRouter("MyRouter").attachRoutePatternMatched(this.onRouteMatched, this);
	},
	onRouteMatched : function(evt) {
		this.getView().byId("cgtabbaradmin").fireSelect();
	},
/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf e2etm.view.CSGeneration
*/
//	onBeforeRendering: function() {
//
//	},
	onIconTabSelect:function(){
		this.getView().byId("btnGenerate").setVisible(false);
		this.getView().byId("btnRegen").setVisible(false);
		this.getView().byId("clTemplate").setVisible(false);//Template Column in Table
		this.getView().byId("srchBox").setVisible(false);
		this.getView().byId("rbtnGroupTrvl").setVisible(false);
		this.getView().byId("clLink").setVisible(false);//Link Column in Table
		this.getView().byId("flxBegda").setVisible(true);
		this.getView().byId("flxEndda").setVisible(true);
	//	this.getView().byId("btnLog").setVisible(false);
		var key = this.getView().byId("cgtabbaradmin").getSelectedKey();
	    var aFilters = [];
		switch(key){
		case "NEW":
			this.getView().byId("rbtnGroupTrvl").setVisible(true);
			this.getView().byId("btnGenerate").setVisible(true);
			
			if(this.getView().byId("rbtnGroupTrvl").getSelectedIndex()==0){
			aFilters = [new sap.ui.model.Filter({path:"Tab",operator:"EQ",value1:"NEWT"})];
			}else{
				this.onRbSelect();
			}
			break;
			
		case "REVW":
			this.getView().byId("btnRegen").setVisible(true);
			this.getView().byId("clLink").setVisible(true);
			aFilters = [new sap.ui.model.Filter({path:"Tab",operator:"EQ",value1:key})];
			break;
			
		case "APPV":
			this.getView().byId("btnRegen").setVisible(true);
			this.getView().byId("clLink").setVisible(true);
			aFilters = [new sap.ui.model.Filter({path:"Tab",operator:"EQ",value1:key})];
			break;
		case "CLSD":
			this.getView().byId("flxBegda").setVisible(false);
			this.getView().byId("flxEndda").setVisible(false);
			this.getView().byId("ipBegda").setValue("");
			this.getView().byId("ipEndda").setValue("");
			this.getView().byId("srchBox").setVisible(true);
			break;
			
		}
		
		
	//	this.getView().byId("tblDetls").getBinding("items").filter(aFilters);
		if(aFilters.length==0){
			this.getView().byId("tblDetls").setModel(null);	
		}else{
		this.getDetails(aFilters);
		}
	},
	getDetails:function(aFilters){
		oComponent.getModel().read("/CggsCalcSheetSet", {async:true, filters:aFilters,success:jQuery.proxy(function(oData, response) {
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(oData.results);
			this.getView().byId("tblDetls").setModel(oModel);	

		},this),error: jQuery.proxy(function(error) {
			
			
		},this)});
	},
	onManualSearch:function(evt){
		var begda = this.getView().byId("ipBegda").getValue();
		var endda = this.getView().byId("ipEndda").getValue();
		var pernr = this.getView().byId("ipPernr").getValue();
		var depreq = this.getView().byId("ipDepreq").getValue();
		var aFilters = [];
		if(begda!=""){
			aFilters.push(new sap.ui.model.Filter({path:"Begda",operator:"EQ",value1:begda}));
		}
		
		if(endda!=""){
			aFilters.push(new sap.ui.model.Filter({path:"Endda",operator:"EQ",value1:endda}));
		}
		if(pernr!=""){
			aFilters.push(new sap.ui.model.Filter({path:"Pernr",operator:"EQ",value1:pernr}));
		}
		
		if(depreq!=""){
			aFilters.push(new sap.ui.model.Filter({path:"DepReq",operator:"EQ",value1:depreq}));
		}
		
		if(aFilters.length == 0){
			sap.m.MessageToast.show("Please enter atleast one search criteria");
			return;
		}else{
			var key = this.getView().byId("cgtabbaradmin").getSelectedKey();
			if(key == "NEW")
				key = "NEWM";
	
			aFilters.push(new sap.ui.model.Filter({path:"Tab",operator:"EQ",value1:key}));
		}
			
		this.getDetails(aFilters);
		//this.getView().byId("tblDetls").getBinding("items").filter(aFilters);
		
	},
	postCS:function(oData){
		  var oDef = $.Deferred();
	      oComponent.getModel().create("CggsCalcSheetSet", oData, {success:jQuery.proxy(function(oData, response) { 
	    	  if(oData.EMessage!=""){
	    		  this.errorDetls.push({type:'Error',
	                  title:oData.EMessage,
	                  description:oData.EMessage});
	    	  }
	     	oDef.resolve();
	  },this), error:jQuery.proxy(function(error) {
		  var title = "";
		   var message = "";
		   title = "Error in Salary slip generation for Dep Req No:"+JSON.parse(error.request.body).DepReq;
		   if(error.responseText){
				message = JSON.parse(error.responseText).error.message.value;					
			}else{
				message = JSON.parse(error.response.body).error.message.value;
			}
		   this.errorDetls.push({type:'Error',
	          title:title,
	          description:message});
		  oDef.resolve();
	  },this), async:true});
	      
	      return oDef;
	  },
	onUpdateStatus:function(evt){
		var sStatus,vMessage;
		var batch = [];
		
		this.errorDetls = [];
		var selItems = this.getView().byId("tblDetls").getSelectedItems();
		if(selItems.length==0){
			sap.m.MessageToast.show("Please select atleast one request");
			return;
		}
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, this);
		var bId = evt.getSource().getId();
		if(bId.indexOf("btnGenerate")!=-1){
			sStatus = 'G';
			vMessage = "Generated Successfully";
		}else if(bId.indexOf("btnRegen")!=-1){
			sStatus = 'G';
			vMessage = "Generated Successfully";
		}
	
		
		 for(var i = 0;i<selItems.length;i++){
	        	var data = selItems[i].getBindingContext().getModel().getProperty(
	        			   selItems[i].getBindingContext().sPath);
	        	
	        	data.ShStatus = sStatus;	        	  
	        	batch.push(this.postCS(data));
	        
	        	
	        	//batch.push(oComponent.getModel().createBatchOperation("CggsCalcSheetSet", "POST", data));
             }
	        	
		 $.when.apply($,batch).done(
 				jQuery.proxy(function(csData){   					
 				    	sap.ui.project.e2etm.util.StaticUtility.setBusy(false,this);   
 				    	if(this.errorDetls.length!=0){
 				    		sap.m.MessageToast.show("Transaction complete.Please check the log for error details(if any)");
 							this.getView().byId("btnLog").setVisible(true);
 						}else{ 							
 							sap.m.MessageToast.show(vMessage);	
 							this.getView().byId("btnLog").setVisible(false);							
 						}
 						this.onIconTabSelect();
 					   			        
 				    },this));
//	        oComponent.getModel().addBatchChangeOperations(batch);
//	        oComponent.getModel().submitBatch(jQuery.proxy(function(oResult) {
//				try {				
//					for(var i=0;i<oResult.__batchResponses[0].__changeResponses.length;i++){
//						if(oResult.__batchResponses[0].__changeResponses[i].data.EMessage!=""){
//							this.errorDetls.push({type:'Error',
//				                  title:oResult.__batchResponses[0].__changeResponses[i].data.EMessage,
//				              description:oResult.__batchResponses[0].__changeResponses[i].data.EMessage});
//						}
////						if(oResult.__batchResponses[i].response){
////						if(oResult.__batchResponses[i].response.statusCode == "400"){
////							//this.errorDetls.push(JSON.parse(oResult.__batchResponses[i].response.body).error.message.value);
////							this.errorDetls.push({type:'Error',
////								                  title:JSON.parse(oResult.__batchResponses[i].response.body).error.message.value,
////								              description:JSON.parse(oResult.__batchResponses[i].response.body).error.message.value});
////						}
////					}
//					}
//					
//					sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
//					if(this.errorDetls.length!=0){
//						this.getView().byId("btnLog").setVisible(true);
//					}else{
//						this.getView().byId("btnLog").setVisible(false);
//						sap.m.MessageToast.show(vMessage);	
//						
//					}
//					this.onIconTabSelect();
//					
//					
//				} catch (err) {
//					sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
//				}
//			},this), jQuery.proxy(function(error) {
//				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
//			},this), true);
	},
	onRefresh:function(evt){
		var key = this.getView().byId("cgtabbaradmin").getSelectedKey();
		if(key == "NEW"){
			if(this.getView().byId("rbtnGroupTrvl").getSelectedIndex()==1){
				this.onManualSearch();
				return;
			}
		}
		this.onIconTabSelect();
	},
	onRbSelect:function(evt){
		this.getView().byId("clTemplate").setVisible(false);
		this.getView().byId("srchBox").setVisible(false);
		this.getView().byId("tblDetls").setModel(null);	
		if(this.getView().byId("rbtnGroupTrvl").getSelectedIndex()==1){
			this.getView().byId("clTemplate").setVisible(true);
			this.getView().byId("srchBox").setVisible(true);
		}
	},
	onSearch:function(evt){
		var value = evt.getSource().getValue();
		
		var aFilters = [
			new sap.ui.model.Filter({path:"Pernr",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"DepReq",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Name",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"ReqType",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"AsgTyp",operator:"Contains",value1:value}),
		             
		             	];
		
		var oFilter = new sap.ui.model.Filter(aFilters,false);
		this.getView().byId("tblDetls").getBinding("items").filter(oFilter);
	},
	onLogPress:function(evt){
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
		oModel.setData(this["errorDetls"]);
		pop.setModel(oModel);
		pop.openBy(evt.getSource());
	},
	onSalLink:function(evt){
		var router = sap.ui.core.routing.Router.getRouter("MyRouter");
		var url = router.getURL("cggssaldetails");
		var url1 = window.document.URL.split("#");
		url = url1[0] + "#/" + url;
		window.open(url, "_blank");
	}
/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf e2etm.view.CSGeneration
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf e2etm.view.CSGeneration
*/
//	onExit: function() {
//
//	}

});