jQuery.sap.require("sap.ui.project.e2etm.util.Formatter");
jQuery.sap.require("sap.ui.project.e2etm.util.StaticUtility");
sap.ui.controller("sap.ui.project.e2etm.controller.DepuNotifications", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf e2etm.view.DepuNotifications
*/
onInit: function() {

	oThis = this;
	//var ODataModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl,{json:true,useBatch:false});
	var ODataModel = new sap.ui.model.odata.ODataModel(sServiceUrl,{json:true});
	ODataModel.setDefaultCountMode("None");
	ODataModel.setDefaultBindingMode("TwoWay");
	sap.ui.core.routing.Router.getRouter("MyRouter").attachRoutePatternMatched(this.onRouteMatched, this);
	var fileModel = new sap.ui.model.json.JSONModel();
	fileModel.setData({
		Files : []
	});
	oThis.getView().setModel(fileModel, "new");
	oThis.getView().setModel(ODataModel);
	
},

onRouteMatched:function(evt){
	this.getView().byId("MailTxt").setValue("");
	var UnchkData=this.getView().byId("ChkList").getContent();
	for(i=0;i<UnchkData.length;i++){
		UnchkData[i].setSelected(false);
	}
	
},

onFrmCntryChange:function(evt){
	

	var Sel = oThis.getView().byId("FCntry").getSelectedKey();
	var bindId = "fromLocation";
	oThis.bindLocations(Sel,bindId);


},


onToCntryChange:function(evt){
	
	var Sel = oThis.getView().byId("TCntry").getSelectedKey();
	var bindId = "toLocation";
	oThis.bindLocations(Sel,bindId);

},

onFileUpload:function(evt){
	var file = evt.getParameters("files").files[0];	
	 sModule = "NOT";
	 depReq = "9999999";
	 pernr  = "9999999"
	
	sap.ui.project.e2etm.util.StaticUtility.uploadCollectionFile(oThis, file, depReq , pernr, sModule);
},


onFileDeleted: function(evt){
	// prepare FileName
	var sFileName = evt.getParameters("item").item.getFileName();
	var oData =  evt.oSource.getParent().getModel("new").getData();
	sap.ui.project.e2etm.util.StaticUtility.deleteUploadCollectionFile(this,evt, depReq, sFileName, sModule, pernr, 0);
},

bindLocations:function(selectedCntry,LocBindId){

	var ToLocationoDataModel = new sap.ui.model.odata.ODataModel(sServiceUrl);
	
	var ToLocationJModel = new sap.ui.model.json.JSONModel();
	ToLocationoDataModel.read("DEP_LOCATIONSSet?$filter=MOLGA eq '" + selectedCntry + "'  ", null, null, true, jQuery.proxy(function(oData, response) {
		ToLocationJModel.setData(oData.results);
		this.getView().setModel(ToLocationJModel,LocBindId);

	  sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
},this), function(error) {
	sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
})
	
},


onSendMail:function(evt){
	var SelFrmLocTxt;
	var SelToLocTxt;
	
	var ODataModel = new sap.ui.model.odata.ODataModel(sServiceUrl);
	var chkData=this.getView().byId("ChkList").getContent();
	var chkSelectedData;
	for(var i=0;i<chkData.length;i++){
		oData=chkData[i].getBindingContext().getModel().getProperty(chkData[i].getBindingContext().sPath);
		if(oData.Selected){
			if(chkSelectedData)
			 chkSelectedData=oData.DepKey+':'+chkSelectedData;
			else
				chkSelectedData=oData.DepKey;
		}
		
	}
	
	if(!chkSelectedData && this.getView().byId("TrvCat").getSelectedKey()==""){
		sap.m.MessageToast.show("Please select the Recipient");	
	}
	
	
	
	if(this.getView().byId("FrmLoc").getSelectedKey()=="") {
		 SelFrmLocTxt = "";
	}
	else{
		SelFrmLocTxt = this.getView().byId("FrmLoc").getSelectedItem().getText();
	}
	
	if(this.getView().byId("ToLoc").getSelectedKey()==""){
		SelToLocTxt = "";
	}else {
		SelToLocTxt = this.getView().byId("ToLoc").getSelectedItem().getText();	
	}
	
	if(!chkSelectedData){
		
		chkSelectedData = "";
	}
		
	
	
	var odata = { AsgModel:this.getView().byId("AsgModel").getSelectedKey(),
				  DepuType:this.getView().byId("TrvCat").getSelectedKey(),
				  TrvTyp:this.getView().byId("TrvTyp").getSelectedKey(),
				  FrmCntry:this.getView().byId("FCntry").getSelectedKey(),
				  FrmLoc:this.getView().byId("FrmLoc").getSelectedKey(),
				  frmLocTxt:SelFrmLocTxt,
				  ToCntry:this.getView().byId("TCntry").getSelectedKey(),
				  ToLoc:this.getView().byId("ToLoc").getSelectedKey(),
				  toLocTxt:SelToLocTxt,
				  MailTxt:this.getView().byId("MailTxt").getValue(),
				  SendMail:chkSelectedData 
				  }
	
	//var splitStr = MailTxt.split("#");
	
	ODataModel.callFunction("DepusendNotificationMail", "POST", odata, null, jQuery.proxy(function(oData, response) {
		
		sap.m.MessageToast.show("Mail has been sent");
	
	}, this), jQuery.proxy(function(error) {

	}, this), true);
	
	},


		formatSelected:function(value){
		if(value=="X"){
			
			return true;
		}
		return false;
	},
	
	onCheck:function(evt){
		
		evt.getSource().getBindingContext().getModel().getProperty(evt.getSource().getBindingContext().sPath).Selected = evt.getSource().getSelected();
		
	},
	
	onTrvCatChange:function(evt){
		
		var trvCatSelKey = this.getView().byId("TrvCat").getSelectedKey();
		var globalData = sap.ui.getCore().getModel("global").getData();
		var toCntryModel = new sap.ui.model.json.JSONModel();
		var frmCntryModel = new sap.ui.model.json.JSONModel();
		var visa   = globalData.visaType;
		var country = globalData.country;
		toCntryModel.setData(country);
		frmCntryModel.setData(country);
		this.getView().setModel(toCntryModel,"toCntry");
		this.getView().setModel(frmCntryModel,"frmCntry");
		
		this.getView().byId("FCntry").setSelectedKey("");
		this.getView().byId("TCntry").setSelectedKey("");
		this.getView().byId("AsgModel").setSelectedKey("");
		this.getView().byId("TrvTyp").setSelectedKey("");
		
		if(trvCatSelKey=='DOME'){
			
			this.getView().byId("AsgModel").setEnabled(false);
			this.getView().byId("FCntry").setSelectedKey("IN");
			this.getView().byId("TCntry").setSelectedKey("IN");
			this.getView().byId("FCntry").setEnabled(false);
			this.getView().byId("TCntry").setEnabled(false);
			oThis.bindLocations("IN","fromLocation");
			oThis.bindLocations("IN","toLocation");
			oThis.bindVisaData(trvCatSelKey,visa);
		}else{
			
			this.getView().byId("AsgModel").setEnabled(true);
			this.getView().byId("FCntry").setEnabled(true);
			this.getView().byId("TCntry").setEnabled(true);
			oThis.bindVisaData(trvCatSelKey,visa);
			this.getView().setModel(toCntryModel,"toCntry");
			this.getView().setModel(frmCntryModel,"frmCntry");
		}
	},


	bindVisaData:function(trvCatSelKey,visa){
		var visaData=[];
		var index;
		var visaModel =  new sap.ui.model.json.JSONModel();
		if(visa.length!=0){
			visaData.push({ZZ_VKEY:visa[0].ZZ_VKEY,ZZ_VISA_DESC:visa[0].ZZ_VISA_DESC});
			for(i=0;i<visa.length;i++){
				index=-1;
				//index = visaData.findIndex(x => x.ZZ_VKEY==visa[i].ZZ_VKEY);
				
				 visaData.forEach(function(item,vIndex){
					if(visa[i].ZZ_VKEY==item.ZZ_VKEY){
					index=vIndex;
						return false;
					}
				});
				
			
			if(index==-1){
					if(trvCatSelKey==visa[i].ZZ_ZZ_SMODID){
					visaData.push({ZZ_VKEY:visa[i].ZZ_VKEY,ZZ_VISA_DESC:visa[i].ZZ_VISA_DESC});
					}else{
						
						continue;
					}
				}
				else{	
				continue;
			}	
				
			}
		}
		
		visaModel.setData(visaData);	
		this.getView().setModel(visaModel,"visaModel");
	},


	onBack:function(evt){
		
		var oData =  this.getView().getModel("new").getData();
		
		if(oData.Files.length!=0){
		for(i=0;i<oData.Files.length;i++){	
		var sFileName = oData.Files[i].FileName;
		sap.ui.project.e2etm.util.StaticUtility.deleteUploadCollectionFile(this,evt, depReq, sFileName, sModule, pernr, 0);
			}
		}
	
		sap.ui.core.routing.Router.getRouter("MyRouter").navTo("Menu");
	},
	
	
});