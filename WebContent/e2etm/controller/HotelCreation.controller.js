jQuery.sap.require("sap.ui.project.e2etm.util.Formatter");
jQuery.sap.require("sap.ui.project.e2etm.util.StaticUtility");
//jQuery.sap.require("sap.ca.ui.message");
jQuery.sap.require("sap.m.MessageBox");

sap.ui.controller("sap.ui.project.e2etm.controller.HotelCreation", {

	/**
	 * Called when a controller is instantiated and its View controls (if
	 * available) are already created. Can be used to modify the View before it
	 * is displayed, to bind event handlers and do other one-time
	 * initialization.
	 * 
	 * @memberOf e2etm.view.HotelCreation
	 */
	onInit : function() {
		sap.ui.core.routing.Router.getRouter("MyRouter").attachRoutePatternMatched(this.onRouteMatched, this);

		this.getView().setModel(oComponent.getModel("reservation"),"hotelDet");
	},
	onRouteMatched : function(evt) {
		
		if (evt.getParameter("name") == "hotelCreate") {
//			var oShell = oComponent.oContainer.getParent();
//			oShell.setAppWidthLimited(false);
			this.getView().byId("hotelDet").unbindElement("hotelDet");
			this.getView().byId("docsSet").destroyItems();
			var model = new sap.ui.model.json.JSONModel();
			model.setData({Type:evt.getParameter("arguments").type});
			this.getView().setModel(model,"viewData");
			if (evt.getParameter("arguments").type == "Change") {
				var hCode = evt.getParameter("arguments").code;
				this.getView().byId("hotelDet").bindElement("hotelDet>/HotelDetailsSet('" + hCode + "')", 
						{
							model : "hotelDet",
							
						});
				 this.getView().byId("hotelDet").getElementBinding("hotelDet").attachDataReceived(jQuery.proxy(function(evt){
					   var data = evt.getSource().getBoundContext("hotelDet").getModel().getProperty(evt.getSource().getBoundContext("hotelDet").sPath);
					   this.getView().byId("ipHcnty").fireChange({value:data.Country,itemPressed:false});
				   },this));
				var aFilters = [new sap.ui.model.Filter({path:"Hcode",operator:"EQ",value1:hCode}),
					            new sap.ui.model.Filter({path:"DocType",operator:"EQ",value1:"ACH"})];
				this.getView().byId("docsSet").getBinding("items").filter(aFilters);
				
			} else {
				var oData = {
					Hcode : "",Hname:"",Hcnty:"",Hcity:"",Mrent:"",Waers:"",Rfreq:"",Begda:"",Endda:"",Phone:"",Email:""
				};
				var oCtx = this.getView().byId("hotelDet").getModel("hotelDet").createEntry(
						"/HotelDetailsSet", oData);
				this.getView().byId("hotelDet").setBindingContext(oCtx,"hotelDet");
				// this.getView().byId("hotelDet").bindElement("hotelDet>/HotelDetailsSet('')",{model:"hotelDet"});

			}
			

			//this.getView().byId("docsSet").getBinding("items").filter(aFilters);
			this.getCurrency();

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
			this.getView().byId("ipWaers").setModel(model, "currency");

			var freqModel = new sap.ui.model.json.JSONModel();
			freqModel.setData(oResult.__batchResponses[1].data.results);
			this.getView().byId("ipRfreq").setModel(freqModel, "period");
		}, this));

	},
	onSave : function(evt) {
        if(this.validateDetails()){
//		this.getView().byId("hotelDet").getModel("hotelDet").submitChanges({groupId: "myId",success:
//				function(oData) {
//					sap.m.MessageToast.show("Created Successfully");
//				},error: function(error) {
//					sap.m.MessageToast.show("Error");
//				}});
        	
			sap.ui.project.e2etm.util.StaticUtility.setBusy(true, this);
        	
        	var viewData =  this.getView().getModel("viewData").getData();
        
		var path = this.getView().byId("hotelDet").getBindingContext("hotelDet").sPath;
		var oData = this.getView().byId("hotelDet").getBindingContext("hotelDet").getModel().getProperty(path);
		
		delete oData["_bCreate"];
		delete oData["__metadata"];
		this.getView().byId("hotelDet").getModel("hotelDet").setHeaders({Action:viewData.Type});
		this.getView().byId("hotelDet").getModel("hotelDet").create("/HotelDetailsSet", oData, {
			success:jQuery.proxy(function(oData, response) {	
		
				sap.m.MessageToast.show("Updated Successfully");
			
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
		},this),
		    error: jQuery.proxy(function(error) {
//			sap.ca.ui.message.showMessageBox({
//				type : sap.ca.ui.message.Type.ERROR,
//				message : "Cannot save request in system",
//				details : JSON.parse(error.responseText).error.message.value
//			});
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
        }
    
	},
	validateDetails:function(){
		var path = this.getView().byId("hotelDet").getBindingContext("hotelDet").sPath;
		var oData = this.getView().byId("hotelDet").getBindingContext("hotelDet").getModel().getProperty(path);
		for(var prop in oData){
			if(prop == "Hcode" || prop == "Hname" || prop == "Hcnty" || prop == "Begda" || prop == "Endda" || 
			    prop == "Mrent" || prop == "Waers" || prop=="Rfreq"|| prop == "Hcity" || prop == "Phone"){

				if(oData[prop] == "" || !(oData[prop])){				
					sap.m.MessageToast.show("Please enter some value");
					this.getView().byId("ip"+prop).setValueState("Error");
					return false;
				}
//				else{
//					if(prop == "Phone"){
//						if(isNaN(oData[prop])){
//							sap.m.MessageToast.show("Please enter valid phone number");
//							this.getView().byId("ip"+prop).setValueState("Error");
//                            return false;
//					}
//					
//				}
//					this.getView().byId("ip"+prop).setValueState("None");
//			}
		}
		}
	   return true;
	},
	onFormsUpload:function(evt){
		var path = this.getView().byId("hotelDet").getBindingContext("hotelDet").sPath;
		var oData = this.getView().byId("hotelDet").getBindingContext("hotelDet").getModel().getProperty(path);
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, this);
		if(oData.Hcode == ""||!(oData.Hcode)){
			sap.m.MessageToast.show("Please enter Hotel Code");
			return;
		}
		this.getView().getModel("hotelDet").setTokenHandlingEnabled(true);

		this.getView().getModel("hotelDet").refreshSecurityToken(jQuery.proxy(function() {

			var file = evt.getParameters("files").files[0];

			var sSlung = oData.Hcode+","+oData.Hname+","+file.name+",ACH";

//			var source = evt.getSource();
//
//			source.insertHeaderParameter(new sap.ui.unified.FileUploaderParameter({
//				name: "slug",
//				value: sSlung
//			}),0);
//			source.insertHeaderParameter(new sap.ui.unified.FileUploaderParameter({
//				name: "x-csrf-token",
//				value: this.getView().getModel("hotelDet").getHeaders()["x-csrf-token"]
//			}),1);
			var sUrl = resServiceUrl+"DmsDocs4ResSet";
			var oHeaders = {
					'X-Requested-With' : "XMLHttpRequest",
					'X-CSRF-Token' : this.getView().getModel("hotelDet").getHeaders()["x-csrf-token"],
					'Accept' : "application/json",
					'DataServiceVersion' : "2.0",
					'Content-Type' : "application/json",
					"slug" : sSlung,
				};
				var post = jQuery.ajax({
					cache : false,
					type : 'POST',
					url : sUrl,
					headers : oHeaders,
					cache : false,
					contentType : file.type,
					processData : false,
					data : file,
				});
				post.success(jQuery.proxy(function(data) {
				//	var oData = oController.getView().getModel("new").getData();
					var aFilters = [new sap.ui.model.Filter({path:"Hcode",operator:"EQ",value1:oData.Hcode}),
						new sap.ui.model.Filter({path:"DocType",operator:"EQ",value1:"ACH"})
						];
					this.getView().byId("docsSet").getBinding("items").filter(aFilters);
					sap.m.MessageToast.show("Uploaded Succesfully");
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);

				},this));
				post.fail(function(result, response, header) {
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
				
				});				
			
	

		}, this), function() {

			console.log('Error retrieving CSRF Token');

		}, false);
	},
	refreshDocsModel:function(){
		var path = this.getView().byId("hotelDet").getBindingContext("hotelDet").sPath;
		var oData = this.getView().byId("hotelDet").getBindingContext("hotelDet").getModel().getProperty(path);
		var aFilters = [new sap.ui.model.Filter({path:"Hcode",operator:"EQ",value1:oData.Hcode}),
			            new sap.ui.model.Filter({path:"DocType",operator:"EQ",value1:"ACH"})];
		this.getView().byId("docsSet").getBinding("items").filter(aFilters);
	},
	
	onUploadComplete:function(evt){
		this.getView().byId("docsSet").getModel("hotelDet").refresh(true);
	},
	onRemoveForms:function(evt){
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, this);
		this.getView().getModel("hotelDet").refreshSecurityToken(jQuery.proxy(function() {
			var iRequest = 0;
			var iResponse = 0;
			var oModel = this.getView().byId("docsSet").getModel("hotelDet").getData();
			var items = this.getView().byId("docsSet").getItems();
			for(var i=0;i<items.length;i++){
				if(items[i].getItems()[2].getSelected()){
					var path = items[i].getBindingContext("hotelDet").sPath;
					var oData = items[i].getBindingContext("hotelDet").getModel().getProperty(path);
				
						if (oData.FileUrl != "") { 						
							var oHeaders = {
								"x-csrf-token" : this.getView().getModel("hotelDet").getHeaders()["x-csrf-token"],
							};
							
							iRequest++;
							var sUrl = resServiceUrl + "DmsDocs4ResSet(Hcode='" + oData.Hcode + "',FileName='" + oData.FileName + "',DocType='" + oData.DocType + "',Hname='')";
							var oItem = jQuery.ajax({
								cache : false,
								type : 'DELETE',
								url : sUrl,
								headers : oHeaders,
								cache : false,
								processData : false
							});
							oItem.success(jQuery.proxy(function(data, response, header) {
								   iResponse++;
									if (iRequest == iResponse) {
										  sap.m.MessageToast.show("Deleted Succesfully");
										  this.refreshDocsModel();
										  sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
										}
									
								},this));
							oItem.fail(jQuery.proxy(function(err) {
								iResponse++;
								if (iRequest == iResponse) {
									sap.ca.ui.message.showMessageBox({
										type : sap.ca.ui.message.Type.ERROR,
										message : "Error occurs, please click on remove button again",
										details : "Error occurs, please click on remove button again"
									});
									 sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
								}
							},this));
						} else { // Document has not uploaded
							
							
						}
					}
				}

				if(iRequest == 0){
					sap.m.MessageToast.show("Please select atleast one file");
					 sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
				}
		
			},this),true);
		
	},
	onCountryChange : function(evt) {
		var filter = new sap.ui.model.Filter({
			path : "MOLGA",
			operator : "EQ",
			value1 : evt.getSource().getSelectedKey()
		});
		this.getView().byId("ipHcity").getBinding("items").filter([ filter ]);
	},
	getIcon : function(sFileName) {
		return sap.ui.project.e2etm.util.StaticUtility.getIconFileType(sFileName.substr(sFileName.lastIndexOf(".")));
	
	},
	onNavBack : function() {
//		this.getView().byId("hotelDet").getModel("hotelDet").deleteCreatedEntry(
//				this.getView().byId("hotelDet").getBindingContext("hotelDet"));
//		this.getView().byId("hotelDet").unbindElement("hotelDet");

		window.history.go(-1);
	}
/**
 * Similar to onAfterRendering, but this hook is invoked before the controller's
 * View is re-rendered (NOT before the first rendering! onInit() is used for
 * that one!).
 * 
 * @memberOf e2etm.view.HotelCreation
 */
// onBeforeRendering: function() {
//
// },
/**
 * Called when the View has been rendered (so its HTML is part of the document).
 * Post-rendering manipulations of the HTML could be done here. This hook is the
 * same one that SAPUI5 controls get after being rendered.
 * 
 * @memberOf e2etm.view.HotelCreation
 */
// onAfterRendering: function() {
//
// },
/**
 * Called when the Controller is destroyed. Use this one to free resources and
 * finalize activities.
 * 
 * @memberOf e2etm.view.HotelCreation
 */
// onExit: function() {
//
// }
});