sap.ui.controller("sap.ui.project.e2etm.controller.ManualTPCreation", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf e2etm.view.ManualTPCreation
*/
	onInit: function() {
		sap.ui.core.routing.Router.getRouter("MyRouter").attachRoutePatternMatched(this.onRouteMatched, this);
	},
	
	onRouteMatched:function(evt){
		if(evt.getParameter("name") == "manualtpcreate"){
			this.getView().byId("btnDummyTp").setVisible(false);
			var oArgs = evt.getParameter("arguments");
			var model = new sap.ui.model.json.JSONModel();
			model.setData({Reinr:oArgs.reinr,Type:oArgs.type});
			this.getView().setModel(model,"viewData");
			this.getView().byId("tpCreateForm").unbindElement("reservation");
//		
			
		
	  if (oArgs.type == "Change") {

		   this.getView().byId("tpCreateForm").bindElement("reservation>/ManualTpListSet(Reinr='" + oArgs.reinr + "',Pernr='',Trvky='')",
						{
						  model : "reservation"
					    });
		   this.getView().byId("tpCreateForm").getElementBinding("reservation").attachDataReceived(jQuery.proxy(function(evt){
			   var data = evt.getSource().getBoundContext("reservation").getModel().getProperty(evt.getSource().getBoundContext("reservation").sPath);
			   this.getView().byId("ipFrmcn").fireChange({value:data.FromCountryTxt,itemPressed:false});
			   this.getView().byId("ipTocnt").fireChange({value:data.ToCountryTxt,itemPressed:false});
		   },this));
		
	} else {
		this.getView().byId("btnDummyTp").setVisible(true);
			
				var oData = {
					Reinr : "",Pernr:"",Trvky:"",Begda:"",Endda:"",Frmcn:"",Tocnt:"",Frloc:"",Toloc:""
				};
				var oCtx = this.getView().byId("tpCreateForm").getModel("reservation").createEntry(
						"/ManualTpListSet", oData);
				this.getView().byId("tpCreateForm").setBindingContext(oCtx,
						"reservation");
			

			}
		}
	},
	onGenerateTP:function(){
		oComponent.getModel("reservation").callFunction("/GetDummyTp", "GET", {}, null, jQuery.proxy(function(oData, response) {
			 var oCtx = this.getView().byId("tpCreateForm").getBindingContext("reservation");
				var data = oCtx.getModel().getProperty(oCtx.sPath);
			    data.Reinr = oData.GetDummyTp.Reinr;
				oCtx.getModel().setProperty(oCtx.sPath,data);
			    var oInput = this.getView().byId("ipReinr");
			    oInput.getBinding("value").refresh(true);
			
			
			
		}, this), jQuery.proxy(function(error) {
			//this.getView().setBusy(false);
		}));
	},
	onSave:function(evt){
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, this);
		var viewData =  this.getView().getModel("viewData").getData();
		var path = this.getView().byId("tpCreateForm").getBindingContext("reservation").sPath;
		var oData = this.getView().byId("tpCreateForm").getBindingContext("reservation").getModel().getProperty(path);
	//	oData.Hcode = viewData.Hcode;
		delete oData["_bCreate"];
		delete oData["__metadata"];
		this.getView().byId("tpCreateForm").getModel("reservation").setHeaders({Action:viewData.Type});
		this.getView().byId("tpCreateForm").getModel("reservation").create("/ManualTpListSet", oData, {
			success:jQuery.proxy(function(oData, response) {
		
			if(viewData.Type == "Change")
				sap.m.MessageToast.show("Changed Successfully");
			else
			    sap.m.MessageToast.show("Created Successfully");
			
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
			
		},this),
		error: jQuery.proxy(function(error) {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
			var message;
			if(error.responseText){
				 message = JSON.parse(error.responseText).error.message.value;					
			}else{
				message = JSON.parse(error.response.body).error.message.value;
			}
			var dialog = new sap.m.Dialog({
				title: 'Error',
				type: 'Message',
				state: 'Error',
				content: new sap.m.Text({
					text: "Cannot save Request."+message
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
		},this)});
		
        },
    	onCountryChange : function(evt) {
    		var filter = new sap.ui.model.Filter({
    			path : "MOLGA",
    			operator : "EQ",
    			value1 : evt.getSource().getSelectedKey()
    		});
    		var location;
    		if(evt.getSource().getId().indexOf("ipFrmcn")!=-1)
    			location = this.getView().byId("ipFrloc");
    		else
    			location = this.getView().byId("ipToloc");
    		
    		location.getBinding("items").filter([ filter ]);
    	},
    	onTripChange:function(evt){
 		   this.getView().byId("tpCreateForm").bindElement("reservation>/ManualTpListSet(Reinr='" + evt.getSource().getValue() + "',Pernr='',Trvky='')",
					{
					  model : "reservation"
				    });
			
    	},
    	onNavBack : function() {


    		window.history.go(-1);
    	},
    
	
/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf e2etm.view.ManualTPCreation
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf e2etm.view.ManualTPCreation
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf e2etm.view.ManualTPCreation
*/
//	onExit: function() {
//
//	}

});