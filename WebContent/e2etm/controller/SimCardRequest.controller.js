
sap.ui.controller("sap.ui.project.e2etm.controller.SimCardRequest", {

	onInit: function() {

		oThis = this;
		sap.ui.core.routing.Router.getRouter("MyRouter").attachRoutePatternMatched(this.onRouteMatched, this);
		var fileModel = new sap.ui.model.json.JSONModel();
		fileModel.setData({
			Files : []
		});
		oThis.getView().setModel(fileModel, "new");
	
	},

	onRouteMatched:function(evt){
		
	if(evt.getParameter("name")=="SimCardRequest"){	
	var reinr = evt.getParameter("arguments").reinr;
	var pernr = evt.getParameter("arguments").pernr;
		Tab = evt.getParameters().arguments["?query"].Tab;
		subTab  = evt.getParameters().arguments["?query"].subTab;
		subSubTab = evt.getParameters().arguments["?query"].subSubTab;
	 oThis.disableButtons(Tab, subTab, subSubTab,oThis);
	var oDataModel = new sap.ui.model.odata.ODataModel(sServiceUrl);
	var batchOperation1 = oDataModel.createBatchOperation("TRV_HDRSet(ZZ_PERNR='" + pernr + "',ZZ_DEP_REQ='" + reinr + "',ZZ_VERSION='',ZZ_TRV_TYP='" + "BUSR" + "')", "GET");
	var batchOperation2 = oDataModel.createBatchOperation("SimCardEmpDataSet(pernr='" + pernr + "')", "GET");
	var batchOperation3 = oDataModel.createBatchOperation("DmsDocsSet?$filter=DepReq+eq+'" + reinr + "'+and+EmpNo+eq+'" + pernr + "'+and+DocType+eq+'SIM'", "GET");
	var aBatch = [ batchOperation1, batchOperation2,batchOperation3 ];
	oDataModel.addBatchReadOperations(aBatch);
	sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oThis);
	oDataModel.submitBatch(jQuery.proxy(function(oResults) { 	
	var oModel = new sap.ui.model.json.JSONModel();	
		oModel.setData(oResults.__batchResponses[0].data);
		this.getView().setModel(oModel,'empTravelData');
		var oEmpModel = new sap.ui.model.json.JSONModel();	
		oEmpModel.setData(oResults.__batchResponses[1].data);
		this.getView().setModel(oEmpModel,'EmpData');
//		oThis.disableButtons(Tab, subTab, subSubTab,oThis);
//new change		
		oThis.getView().byId("UploadCollection").aItems = [];
		var filesAll = oResults.__batchResponses[2].data.results;
		var uploadData = oThis.getView().getModel("new").getData();
		uploadData.Files = filesAll;
		oThis.getView().getModel("new").setData(uploadData);
		oThis.getView().getModel("new").refresh(true);
//		new change
		sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
	},this),function(error){
		
		sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
	});
	
	
	this.getView().byId("comments").setValue("");
	oDataModel.read("SimCardAdminDataSet?$filter=reinr eq '" + reinr + "' and pernr eq '" + pernr + "' ", null, null, true, jQuery.proxy(function(oData, response) {
		var oTableModel = new sap.ui.model.json.JSONModel();
		if(oData.results.length=="0"){
			oData.results.push({simNo:"",
				simBegda:"",
				simEndda:"",
				SimMobileNo:"",
				simIssueDate:"",
				toCntry:"",
				remarks:"",
				isEnable:"X",
				 });

		}
		oTableModel.setData(oData.results);
		var oTable= this.getView().byId("SimAdminTable");
		  this.getView().setModel(oTableModel,'SimCardTableDataSet');
//		  oThis.disableTableRows(Tab,subTab, subSubTab,oThis)
		  sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
	},this), function(error) {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
	});
	
	if(Tab=='R'){
		
		oDataModel.read("SimcardInvoiceSet?$filter=reinr eq '" + reinr + "' and pernr eq '" + pernr + "' ", null, null, true, jQuery.proxy(function(oData, response) {
			var osimInvoiceTableModel = new sap.ui.model.json.JSONModel();
			if(oData.results.length=="0"){
				oData.results.push({rDate:"",
					simTotAmt:"",
					simCurr:"",
					remarks:"",
					SimPersonalCallAmt:"",
					SimOfficialCallAmt:"",
					adminEnable:"X",
					EmpPersonalcallEnable:"",
					EmpOfficialCallEnable:"",
					TypeofDeclare:"",
					});

			}
			osimInvoiceTableModel.setData(oData.results);
			var osimInvoiceTable= this.getView().byId("SimInvoiceTable");
			  this.getView().setModel(osimInvoiceTableModel,'SimCardInvoiceDataSet');
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
		},this), function(error) {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
		});
		
			}
	
		}
	
	},
	
	
	onAdd:function(evt){
		if(evt.getParameter("id").indexOf("simDetailAdd")!=-1){
		var data = 	oThis.getView().getModel("SimCardTableDataSet").getData();
		data.push({simNo:"",
				simBegda:"",
				simEndda:"",
				SimMobileNo:"",
				remarks:"",
				simAmount:"",
				simCurrency:"" ,
				simIssueDate:"",
				toCntry:"",
				isEnable:"X",
		});				
		
		oThis.getView().getModel("SimCardTableDataSet").setData(data);	
		
		}else if(evt.getParameter("id").indexOf("simInvoiceAdd")!=-1){
			var Invoicedata = 	oThis.getView().getModel("SimCardInvoiceDataSet").getData();
			Invoicedata.push({rDate:"",
				simTotAmt:"",
				simCurr:"",
				simPersonalCallAmt:"",
				simOfficialAmt:"",
				remarks:"" ,
				adminEnable:"X",
				EmpPersonalcallEnable:"",
				EmpOfficialCallEnable:"",
				TypeofDeclare:"",
			});	
			
			oThis.getView().getModel("SimCardInvoiceDataSet").setData(Invoicedata);
			
		}
	},


	onDel:function(evt){
		
		var data;
		var modelSetData;
		if(evt.getParameter("id").indexOf("simDetailDel")!=-1){		
		data =	 oThis.getView().getModel("SimCardTableDataSet").getData();
		modelSetData="SimCardTableDataSet";
		}else if(evt.getParameter("id").indexOf("simInvoiceDel")!=-1){
			data =	 oThis.getView().getModel("SimCardInvoiceDataSet").getData();
			modelSetData="SimCardInvoiceDataSet";
		}
		
		var parent = evt.oSource.getParent().getParent();
		//var data = oThis.getView().getModel("SimCardTableDataSet").getData();
		var index = parent.getSelectedItems();
		if (index.length == 0){
			
			sap.m.MessageToast.show("Please select atleast one row");
		}else{
			
			data = oThis.deleteRows(parent, index, data);
			oThis.getView().getModel(modelSetData).setData(data);		
		}
	},


	deleteRows:function(table, index,Simdata){
		for ( var i = index.length - 1; i >= 0; i--) {
			var tableIndex = table.indexOfItem(index[i]);
			Simdata.splice(tableIndex, 1);
		}
		return Simdata;
		
	},
	
	
	
onBack:function(evt){
		
		if(sap.ui.getCore().getModel("profile").getData().currentRole=="EMP"){
			sap.ui.core.routing.Router.getRouter("MyRouter").navTo("home");
		}else {
			sap.ui.core.routing.Router.getRouter("MyRouter").navTo("SimCard");
		}
				
		},
	
	onSave:function(){
		
		oThis.performAction(oThis.getView().byId("save").getText());
		
		
	},

	onReject:function(){
		
		oThis.performAction(oThis.getView().byId("reject").getText());
		sap.m.MessageToast.show("Request has been Rejected");	
		oThis.onBack();
	
	},
	
	onNotify:function(){
		
		oThis.performAction(oThis.getView().byId("notify").getText());
		oThis.onBack();
	},
	
	onClose:function(){
		
		oThis.performAction(oThis.getView().byId("close").getText());
		oThis.onBack();
	},
	
	
	onSdeclare:function(){
		
		oThis.performAction(oThis.getView().byId("sDeclare").getText());
		sap.m.MessageToast.show("Request has been sent for declaration");	
		oThis.onBack();
		
		
	},
	
	/*onSentdeclare:function(){
		oThis.performAction(oThis.getView().byId("stDeclare").getText());
		oThis.onBack();

	},*/
	
	onSubmit:function(){
		oThis.performAction(oThis.getView().byId("submit").getText());
		sap.m.MessageToast.show("Request has been submitted");
		oThis.onBack();
		
	},
	
	checkTableData:function(tableData){
		
		if(Tab=="I"){
		for(var i=0;i<tableData.length;i++){
			if(tableData[i].simNo ==""|| tableData[i].simBegda =="" || tableData[i].simEndda =="" || tableData[i].SimMobileNo =="" ){
				return 'Error';
				break;
			}
		
		}
		
		}else if(Tab=="R"){
			for(var i=0;i<tableData.length;i++){
				if(tableData[i].rDate =="" ){
					return 'Error';
					break;
					
				}
			
			}
			
			
		}
		
	},
	
	disableButtons:function(Tab,subTab, subSubTab,othis){
		
	//	othis.disableTableRows(Tab,subTab, subSubTab,othis);
		
		othis.getView().byId("notify").setVisible(false);
		othis.getView().byId("save").setVisible(false);
		othis.getView().byId("reject").setVisible(false);
		othis.getView().byId("save1").setVisible(false);
		othis.getView().byId("close").setVisible(false);
		othis.getView().byId("sDeclare").setVisible(false);
		//othis.getView().byId("stDeclare").setVisible(false);
		othis.getView().byId("submit").setVisible(false);
		othis.getView().byId("simDetailAdd").setEnabled(true);
		othis.getView().byId("simDetailDel").setEnabled(true);
		
		if(Tab=="I"){		
		othis.getView().byId("SImInvoice").setVisible(false);
		if(subTab=='N' || subTab=='D'){
			if(subSubTab=='S'){
				othis.getView().byId("reject").setVisible(true);
				othis.getView().byId("save1").setVisible(true);	
			
			}else if(subSubTab=='A'){
				othis.getView().byId("notify").setVisible(true);
				othis.getView().byId("save").setVisible(true);
				othis.getView().byId("reject").setVisible(true);
				
			}else if(subSubTab=='E'){
				othis.getView().byId("close").setVisible(true);	
				othis.getView().byId("simDetailAdd").setEnabled(false);
				othis.getView().byId("simDetailDel").setEnabled(false);
			}
			
		}else if(subTab=='R' || subTab=='E'){
			othis.getView().byId("close").setVisible(true);	
			othis.getView().byId("simDetailAdd").setEnabled(false);
			othis.getView().byId("simDetailDel").setEnabled(false);
		}else if(subTab=='C'){	
		othis.getView().byId("simDetailAdd").setEnabled(false);
		othis.getView().byId("simDetailDel").setEnabled(false);
		
		}	
		
	}else if(Tab=="R"){
		othis.getView().byId("SImInvoice").setVisible(true);
		othis.getView().byId("simDetailAdd").setEnabled(false);
		othis.getView().byId("simDetailDel").setEnabled(false);
		
		if(subTab=='N'){
			othis.getView().byId("save").setVisible(true);
			othis.getView().byId("reject").setVisible(true);	
			othis.getView().byId("sDeclare").setVisible(true);
		}else if(subTab=='F'){
//			othis.getView().byId("stDeclare").setVisible(true);
			if(sap.ui.getCore().getModel("profile").getData().currentRole=="EMP"){
		//		othis.getView().byId("stDeclare").setVisible(false);
				othis.getView().byId("submit").setVisible(true);
			}
		}else if(subTab=='L'){
		
			othis.getView().byId("simInvoiceAdd").setEnabled(false);
			othis.getView().byId("simInvoiceDel").setEnabled(false);
			if(sap.ui.getCore().getModel("profile").getData().currentRole=="EMP"){	
			othis.getView().byId("close").setVisible(false);	
			}else {
				
				othis.getView().byId("close").setVisible(true);
			}
		}
		
		
	
		}
				
	
	},
	
	disableTableRows:function(Tab,subTab, subSubTab,othis){
		
	/*	
		var osimAdimtableData = oThis.getView().getModel("SimCardTableDataSet").getData();
		for(var i=0;i<osimAdimtableData.length;i++){
					
			osimAdimtableData[i].isEnable=true;
			if(Tab=='R'){
				osimAdimtableData[i].isEnable=false;
			}else if(Tab=='I' && (subTab=='R' || subTab=='C') ){
					osimAdimtableData[i].isEnable=false;
					
				}
				
		}
		
		othis.getView().getModel("SimCardTableDataSet").setData(osimAdimtableData);
		
		
		
		
		var tableRowIsEnable = othis.getView().getModel("EmpData");
		tableRowIsEnable.setProperty("/isSimDataEnable") ;
		var data=othis.getView().getModel("EmpData").getData();
		
	if(Tab=='I'){
		if(subTab=='C' || subTab=='R'){
			data.isSimDataEnable=false;
			othis.getView().getModel("EmpData").setData(data);
		}else{
			data.isSimDataEnable=true;
			othis.getView().getModel("EmpData").setData(data);
		}
		
	}else if(Tab=='R'){
		data.isSimDataEnable=false;
		tableRowIsEnable.setProperty("/isSimInvoiceAdminEnable") ;
		tableRowIsEnable.setProperty("/isSimInvoiceEmpEnable") ;
		
		othis.getView().getModel("EmpData").setData(data);
		if(subTab=="N" || subTab=="F"){		
			data.isSimInvoiceAdminEnable = true;
			data.isSimInvoiceEmpEnable = false;
			if(sap.ui.getCore().getModel("profile").getData().currentRole=="EMP" && subTab=="F" ){
				data.isSimInvoiceAdminEnable = false;
				data.isSimInvoiceEmpEnable = true;		
			}
			
			othis.getView().getModel("EmpData").setData(data);
		}else if(subTab=="L"){
			
			data.isSimInvoiceAdminEnable = flase;
			data.isSimInvoiceEmpEnable = true;
			othis.getView().getModel("EmpData").setData(data);
		}else if(subTab=="C"){
			data.isSimInvoiceAdminEnable = false;
			data.isSimInvoiceEmpEnable = false;
			othis.getView().getModel("EmpData").setData(data);
	
		}
	}*/
	
	},
	
	
	SimAdminSelect:function(){
		
		if(oThis.getView().byId("AdminIconTab").getSelectedKey()=="comment"){
			
			var commentsList = oThis.getView().byId(sap.ui.core.Fragment.createId("AppoveInfo", "idListApprove"));
			var comments = new sap.ui.model.json.JSONModel();

			oDataModel.read("SimcardCommentsSet?$filter=reinr eq '" + oThis.getView().getModel("empTravelData").getData().ZZ_REINR + "' and pernr eq '" + oThis.getView().getModel("empTravelData").getData().ZZ_PERNR + "' ", null, null, true, jQuery.proxy(function(oData, response) {
				comments.setData(oData.results)
			
			commentsList.bindItems("/", new sap.m.FeedListItem({
				text : "{comments}",
				sender : "{uname}",
				timestamp : "Date: " + "{path:'date'}",
			}));
				
				commentsList.setModel(comments);
				
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
			},this), function(error) {
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
			});
			
			
		}else if(oThis.getView().byId("AdminIconTab").getSelectedKey()=='attachments'){
			
			
		}
		
		
	},
	
	
	
	performAction:function(action){
		
		var oData = {};
		var oDataModel1 =  new sap.ui.model.odata.ODataModel(sServiceUrl);
		var data;
		if(Tab=='I'){
		 data = oThis.getView().getModel("SimCardTableDataSet").getData();
		}else if(Tab=='R'){
		 data = oThis.getView().getModel("SimCardInvoiceDataSet").getData();	
		}
		var sError = oThis.checkTableData(data);
		
		if(sError == "Error" ){
			if(action=='Save'){
			sap.m.MessageToast.show("Please Enter All Table data Fields");
			return;
			
			}
		}
		
		
		
		
		oData = {
				pernr:oThis.getView().getModel("EmpData").getData().pernr,
				comments:oThis.getView().byId("comments").getValue(),
				action:action,
				FirstTab:Tab,
				FsubTab:subTab,
				FssubTab:subSubTab
				}
		
		oData.SimEmpToAdminDataNav = [ ];
		for(var i=0;i<data.length;i++){
			oData.SimEmpToAdminDataNav.push({
				
				reinr:oThis.getView().getModel("empTravelData").getData().ZZ_DEP_REQ,
				pernr:oThis.getView().getModel("EmpData").getData().pernr,
				simNo:data[i].simNo,
				simBegda:data[i].simBegda,
				simEndda:data[i].simEndda,
				SimMobileNo:data[i].SimMobileNo,
				simIssueDate:data[i].simIssueDate,
				toCntry:data[i].toCntry,
				remarks:data[i].remarks,
			});	
		
		}
		
		if(oData.SimEmpToAdminDataNav.length==0)
		{
			oData.SimEmpToAdminDataNav.push({
				reinr:oThis.getView().getModel("empTravelData").getData().ZZ_DEP_REQ,
				pernr:oThis.getView().getModel("EmpData").getData().pernr,
				isEnable:"X"
				
			});
			
		}
		
		if(Tab=="R"){
			var inoviceData = oThis.getView().getModel("SimCardInvoiceDataSet").getData()
			oData.SimEmpToSimInvoice = [ ];
			
			for(var j=0;j<inoviceData.length;j++ ){
			
			oData.SimEmpToSimInvoice.push({
				
				reinr:oThis.getView().getModel("empTravelData").getData().ZZ_DEP_REQ,
				pernr:oThis.getView().getModel("EmpData").getData().pernr,
				rDate:inoviceData[j].rDate,
				simTotAmt:inoviceData[j].simTotAmt,
				simCurr:inoviceData[j].simCurr,
				SimPersonalCallAmt:inoviceData[j].SimPersonalCallAmt,
				SimOfficialCallAmt:inoviceData[j].SimOfficialCallAmt,
				remarks:inoviceData[j].remarks, 
				TypeofDeclare:inoviceData[j].TypeofDeclare
				})
			
			
			}
			
		if(oData.SimEmpToSimInvoice.length==0)
			oData.SimEmpToSimInvoice.push({
				reinr:oThis.getView().getModel("empTravelData").getData().ZZ_DEP_REQ,
				pernr:oThis.getView().getModel("EmpData").getData().pernr,	
				adminEnable:'X'
			});
		}
		
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oThis);
		oDataModel1.create("SimCardEmpDataSet", oData, null, function(oData, response) {		
			if(action=='Save'){
				sap.m.MessageToast.show("Data has been saved");	
				
			}
			
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
		}, function(error) {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
			sap.m.MessageToast.show("Internal Server Error");
		}, true);	

			
	},



	OnPdfPress:function(evt){
		var empno = oThis.getView().getModel("EmpData").getData().pernr;
		var tpno = oThis.getView().getModel("empTravelData").getData().ZZ_DEP_REQ;
		
		var fileUrl;
		if (window.location.hostname == "localhost")
			fileUrl = "proxy/sap/opu/odata/sap/ZE2E_DEP_NWGS_SRV/TravelPdfSet(EmpNo='" + empno + "',TrNo='" + tpno + "',TrvKey='" + "BUSR" + "',Module='REQ')/$value";
		else
			fileUrl = "/sap/opu/odata/sap/ZE2E_DEP_NWGS_SRV/TravelPdfSet(EmpNo='" + empno + "',TrNo='" + tpno + "',TrvKey='" + "BUSR" + "',Module='REQ')/$value";

		window.open(fileUrl, "_blank");	
		
		
	},
	
	onFileUpload:function(evt){
		var file = evt.getParameters("files").files[0];	
		var sModule = "SIM";
		sap.ui.project.e2etm.util.StaticUtility.uploadCollectionFile(oThis, file, oThis.getView().getModel("empTravelData").getData().ZZ_DEP_REQ , oThis.getView().getModel("EmpData").getData().pernr, sModule);
		
	},
	
	onFileDeleted : function(evt) {
		var sFileName = evt.getParameters("item").item.getFileName();
		var sDocType;
		sDocType = "SIM";
		var sDepReq = oThis.getView().getModel("empTravelData").getData().ZZ_DEP_REQ;
		var sEmpNo = oThis.getView().getModel("EmpData").getData().pernr;
		var sIndex = 0;
		sap.ui.project.e2etm.util.StaticUtility.deleteUploadCollectionFile(oThis, evt, sDepReq, sFileName, sDocType, sEmpNo, sIndex);
		
	},
	
	onUploadComplete : function(oEvent) {
		oThis.getView().getModel("new").refresh(true);
	},

	onPersonalCallsLiveChange:function(evt){
		
	if(sap.ui.getCore().getModel("profile").getData().currentRole=="EMP"){
	var oSimInvoiceTableData =  oThis.getView().getModel("SimCardInvoiceDataSet").getData();
		
	var path=evt.getSource().getParent().getBindingContext("SimCardInvoiceDataSet").sPath;
	
	var oData=evt.getSource().getParent().getBindingContext("SimCardInvoiceDataSet").getModel().getProperty(path);
	
	oData.SimOfficialCallAmt=parseFloat(oData.simTotAmt) - parseFloat(oData.SimPersonalCallAmt);
	
	}
	},


});