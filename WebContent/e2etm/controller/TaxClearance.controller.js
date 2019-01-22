jQuery.sap.require("sap.ui.project.e2etm.util.Formatter");
jQuery.sap.require("sap.ui.project.e2etm.util.StaticUtility");
jQuery.sap.require('sap.ui.project.e2etm.controls.customStage');
jQuery.sap.require('sap.ui.project.e2etm.controls.stageItem');
jQuery.sap.require("sap.m.MessageToast");
jQuery.sap.require("sap.m.MessageBox");
var path; 
var value;
var sorter;
sap.ui.controller("sap.ui.project.e2etm.controller.TaxClearance", {
	onInit:function(){
		sap.ui.core.routing.Router.getRouter("MyRouter").attachRoutePatternMatched(this.onRouteMatched, this);
	},

	onRouteMatched: function(evt){
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true,this);
		if(evt.getParameter("name")=="home"){
//			this.clearData();
		}else if(evt.getParameter("name")=="taxclearance") {
			if(this.getView().sViewName == "sap.ui.project.e2etm.view.TaxClearance"){
				oThis = this;
				sap.ui.project.e2etm.util.StaticUtility.setBusy(true,oThis);

				var oModel = new sap.ui.model.json.JSONModel();
				//Set data to new item root
				this.getView().setModel(oModel,"new");

				var taxclearanceAdmin  = sap.ui.getCore().getModel("taxclearanceAdmin").getData();

				var sVisaType          = taxclearanceAdmin.oData.ZZ_CURR_VISA_TYP;
				this.getView().getModel("new").setProperty("/VISATYPE" , sVisaType);

				var sAccFamily		   = taxclearanceAdmin.oData.ZZ_FAMILY_ACCOMP;
				this.getView().getModel("new").setProperty("/ACCFAMILY" , sAccFamily);

				var sSTA		   = taxclearanceAdmin.oData.ZZ_ASG_TYP;
				this.getView().getModel("new").setProperty("/STA" , sSTA);

				var	sPernr             = taxclearanceAdmin.oData.ZZ_OWNER;
				var	sType              = taxclearanceAdmin.oData.ZZ_TRV_KEY;
				var	sTravelRequest     = taxclearanceAdmin.oData.ZZ_TRV_REQ;
				var sVersion 		   = taxclearanceAdmin.oData.ZZ_VERSION;

				var oDataModel = new sap.ui.model.odata.ODataModel(sServiceUrl);

				var sPath = "/TRV_HDRSet(ZZ_PERNR='$param1',ZZ_DEP_REQ='$param2',ZZ_VERSION='',ZZ_TRV_TYP='$param3')?$expand=DEP_EMP";
				sPath = sPath.replace("$param1",sPernr);
				sPath = sPath.replace("$param2",sTravelRequest);
				sPath = sPath.replace("$param3",sType);		
				var batchOperation0 = oDataModel.createBatchOperation(sPath, "GET");

				var sPath_1 = "/ZE2E_TAX_HDRSET(ZZ_COUNTRY_G='',ZZ_OWNER='$param1',ZZ_TRV_REQ='$param2',ZZ_TRV_KEY='$param3')?$expand=ZE2E_REQ_STATUS";
				sPath_1 = sPath_1.replace("$param1",sPernr);
				sPath_1 = sPath_1.replace("$param2",sTravelRequest);
				sPath_1 = sPath_1.replace("$param3",sType);		
				var batchOperation1 = oDataModel.createBatchOperation(sPath_1, "GET");

				oComponent.getModel().addBatchReadOperations([batchOperation0, 
				                                              batchOperation1]);

				oComponent.getModel().submitBatch(
						function(oResult){

							// Get Travelling Data
							var aTrv_HRD = oResult.__batchResponses[0].data;
							oModel.setProperty("/trvhdr" , aTrv_HRD);	

//							var aREQ_Status = oResult.__batchResponses[1].data.results;
//							var role = sap.ui.getCore().getModel("profile").getData().currentRole;
//							if (role = "TAX"){
//								for (var i = 0; i < aREQ_Status.length; i++ ){
//									if(aREQ_Status[i].ZZ_TRV_REQ == sTravelRequest &&
//											aREQ_Status[i].ZZ_TRV_KEY == sType &&
//											aREQ_Status[i].ZZ_MODID  == "TAXC" &&
//											aREQ_Status[i].ZZ_ACTION == "01" && aREQ_Status[i].ZZ_NROLE != "01"){
//
//										oThis.getView().byId("btnApprove").setVisible(false);
//										oThis.getView().byId("comment").setEditable(false);
//										oThis.getView().byId("comment").setVisible(false);
//										break;
//									}else{
//										oThis.getView().byId("btnApprove").setVisible(true);
//										oThis.getView().byId("comment").setEditable(true);
//										oThis.getView().byId("comment").setVisible(true);										
//									}
//								}
//							}
							var aREQ_Status = oResult.__batchResponses[1].data.ZE2E_REQ_STATUS;
							
							if(aREQ_Status.ZZ_ACTION == "01" && aREQ_Status.ZZ_NROLE != "01"){

								oThis.getView().byId("btnApprove").setVisible(false);
								oThis.getView().byId("comment").setEditable(false);
								oThis.getView().byId("comment").setVisible(false);
							}else{
								oThis.getView().byId("btnApprove").setVisible(true);
								oThis.getView().byId("comment").setEditable(true);
								oThis.getView().byId("comment").setVisible(true);										
							}
									
									

							oThis.getView().getModel("new").setData(oModel.getData());							

							sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oThis);

						},
						function(error){
							alert("No data found");
							sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oThis);
						});	
				sap.ui.project.e2etm.util.StaticUtility.getComment(sTravelRequest, sType, "TAXC",oThis);
			}
		}else if(evt.getParameter("name")=="taxclearanceAdmin") {
			if(this.getView().sViewName == "sap.ui.project.e2etm.view.TaxClearanceAdmin"){

				//Create an JSON model
				var oModel = new sap.ui.model.json.JSONModel();				
				//Set data to new item root
				this.getView().setModel(oModel,"taxinfo");
				//Initialize data
//				this.getTaxInfo();	
				var key = this.getView().byId("idIconTaxClearanceAdmin").getSelectedKey();
				this.getView().byId("idIconTaxClearanceAdmin").setSelectedKey(key);
				this.getFilter(key);				
				this.loadHomeView();
				if(value != "" && value != undefined){
					var oFilter = new sap.ui.model.Filter({
						path : path,
						operator : 'EQ',
						value1 : value});
					this.getView().byId('taxtable').getBinding('items').filter(oFilter);
				}
				if(sorter != "" && sorter != undefined){
					var aSorter = [];
					if(sorter == "Sort Ascending"){
						aSorter.push(new sap.ui.model.Sorter(path, false)); 
						this.getView().byId('taxtable').getBinding('items').sort(aSorter);
					}else if(sorter == "Sort Descending"){
						aSorter.push(new sap.ui.model.Sorter(path, true)); 
						this.getView().byId('taxtable').getBinding('items').sort(aSorter);
					}
				}	
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false,this);
			}
		}
		sap.ui.project.e2etm.util.StaticUtility.setBusy(false,this);
	},

	//When click button Back
	onNavButton: function(){		
		sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();

	},

	//When click button Submit
	onSubmitData:function(){
		var oRole = "";
		if( sap.ui.getCore().getModel("profile").getData().currentRole == "EMP" ){
			oRole = "01";
		}else{	//Admin
			oRole = "03";
		}
		this.doModify("01",oRole);
	},	

	getTaxInfo:function(){
		var oModel = this.getView().getModel("taxinfo");
		this.onInitialTaxInfo(oModel);
	},

	onInitialTaxInfo:function(oModel){

		var sPath = "/ZE2E_TAX_HDRSET";

		var aTaxInfo = [];
		// Retrieve Traveling header data				
		this.getView().getModel().read(sPath,{
			async: false,
			success: function(evt){
				aTaxInfo = evt.results;
			},
			error: function(error){
				alert(error);	
			}
		});	

	},

	doModify:function(sMDAction,sMDRole){	

		var oThis = this;
		var oModel = oThis.getView().getModel("new");
		var today = new Date();

		//Preparing TAX Header
		var oTaxHdr = {
				ZZ_COUNTRY_G: oModel.getData().trvhdr.ZZ_LAND1,
				ZZ_OWNER    : oModel.getData().trvhdr.ZZ_PERNR,
				ZZ_TRV_REQ  : oModel.getData().trvhdr.ZZ_REINR,
				ZZ_TRV_KEY  : oModel.getData().trvhdr.ZZ_TRV_TYP,
				ZZ_VERSION  : oModel.getData().trvhdr.ZZ_VERSION,
				ZZ_BILL_SUB : "",				
		};

		oModel.setProperty("/newtaxreq" , oTaxHdr);
		oThis.getView().getModel("new").setData(oModel.getData());

		var sMDModid = "TAXC";

		this.getView().getModel().setHeaders({role: sMDRole,action: sMDAction, modid: sMDModid, comment:this.getView().byId("comment").getValue()});			

		sap.ui.project.e2etm.util.StaticUtility.setBusy(true,this);
		//Using create deep entity to insert to table header and detail.
		this.getView().getModel().create("/ZE2E_TAX_HDRSET", oModel.getData().newtaxreq, {
			success : jQuery.proxy(function(mResponse) {

				jQuery.sap.require("sap.m.MessageToast");
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oThis);
				//Save, currently, we don't use this mode.
				if( sMDAction == "00" && sMDRole == "01"){						
					sap.m.MessageToast.show("The request has been saved.");
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oThis);	

					//Submitted by Employee. But we will run backgroud job for this mode.
				}else if(sMDAction == "01" && sMDRole == "01"){
					sap.m.MessageToast.show("The request has been submitted.");
					sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oThis);

					//Submitted by Admin	
				}else if(sMDAction == "01" && sMDRole == "03"){
					sap.m.MessageToast.show("The request has been submitted by Admin");
					sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oThis);
				}

			}, oThis),
			error : jQuery.proxy(function(error) {				
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oThis);
				if (obsoleteRequest != undefined) {
					sap.m.MessageToast.show("This request is obsolete!");
				} else {
					sap.m.MessageToast.show("Error!");	
				}
			}, oThis)
		});
	},

	onItemPress:function(evt){

		itemSelected = evt.getParameter("listItem");
		var items = evt.oSource.getBinding("items");

		var index1 = evt.oSource.indexOfItem(itemSelected);
		var index = items.aIndices[index1];
		var source = evt.oSource;
		var items = evt.oSource.getBinding("items");
		var bindingItem = evt.oSource.getBinding("items").oList;
		var taxclearanceAdmin;
		taxclearanceAdmin = bindingItem[index];

		if(!sap.ui.getCore().getModel("taxclearanceAdmin")){
			var oModel = new sap.ui.model.json.JSONModel();		
			oModel.setProperty("/oData",taxclearanceAdmin);
			var filterTab = this.getView().byId("idIconTaxClearanceAdmin").getSelectedKey();
			oModel.setProperty("/filterTab",filterTab);
			sap.ui.getCore().setModel(oModel, "taxclearanceAdmin");
		}else{
			var filterTab = this.getView().byId("idIconTaxClearanceAdmin").getSelectedKey();
			sap.ui.getCore().getModel("taxclearanceAdmin").setProperty("/oData",taxclearanceAdmin);
			sap.ui.getCore().getModel("taxclearanceAdmin").setProperty("/filterTab",filterTab);
		}

		sap.ui.core.routing.Router.getRouter("MyRouter").navTo("taxclearance");
	},

	onIconTabBarSelect_Top:function(evt){
		var key = evt.mParameters.key;
		if (key == "APP"){			
			var key = this.getView().byId("idIconTaxClearanceAdmin").getSelectedKey();
			this.getView().byId("idIconTaxClearanceAdmin").setSelectedKey(key);
			this.getFilter(key);
		}

	},

	// event triggers when clicking on filter tab
	onIconTabBarSelect: function(evt){
		this.getFilter(evt.mParameters.key);
	},

	//get list of Reimbursement request base on filter tab
	getFilter: function(keyFilter){

		switch(keyFilter){
		//TAX Approvel
		case "01" :
			sap.ui.project.e2etm.util.StaticUtility.setBusy(true,this);
			this.getlistAdmin('01',"1234","TAXC","01",this);
			break;

			//Done
		case "03" : 
			sap.ui.project.e2etm.util.StaticUtility.setBusy(true,this);
			this.getlistAdmin('03',"1234","TAXC","01",this);
			break;
		}

		sap.ui.project.e2etm.util.StaticUtility.setBusy(false,this);
	},

	getlistAdmin: function(sRole,ZZ_OWNER,sModid,sAction,oThis){

		//Get data from gateway
		var sPath = "/ZE2E_TAX_HDRSET?$filter=ZZ_TRV_REQ+eq+'{0}'+and+ZZ_OWNER+eq+'{1}'+and+ZZ_TRV_KEY+eq+'{2}'+and+ZZ_COUNTRY_G+eq+'{3}'";	

		sPath = sPath.replace("{0}", sRole);
		sPath = sPath.replace("{1}", ZZ_OWNER);
		sPath = sPath.replace("{2}", sModid);
		sPath = sPath.replace("{3}", sAction);

		aTrv_HRD = [];

		this.getView().getModel().read(sPath,{
			async: false,
			success: function(evt){
				aTrv_HRD = evt.results;			

				//Create an JSON model
				var oModel = new sap.ui.model.json.JSONModel();	
				oModel.setSizeLimit(512);
				//Set data to new item root
				oThis.getView().setModel(oModel,"taxinfo");

				oThis.getView().getModel("taxinfo").setData(aTrv_HRD);

			},
			error: function(error){
				alert(error);	
			}
		});	
	},

	// Begin functions for uploading file
	// Do upload file
	onFileUpload:function(evt){
		var file = evt.getParameters("files").files[0];
		var oData =  evt.oSource.getParent().getModel("new").getData();
		var sModule = "TAXC";

		sap.ui.project.e2etm.util.StaticUtility.uploadCollectionFile(this,file,oData.trvhdr.ZZ_REINR, oData.trvhdr.ZZ_PERNR,sModule);
	},
	// When upload complete refresh model
	onUploadComplete:function(oEvent){
		this.getView().getModel("new").refresh(true);
	},
	// When do delete file 
	onFileDeleted: function(oEvent){
		// prepare FileName
		var sFileName = oEvent.getParameters("item").item.getFileName();

		// prepare DocType
		var oData =  oEvent.oSource.getParent().getModel("new").getData();
		var sDocType;
		sDocType = "TAXC";

		// prepare travel request number
		var sDepReq = oData.trvhdr.ZZ_REINR;

		// prepare employee number
		var sEmpNo = oData.trvhdr.ZZ_PERNR;

		// prepare index
		var sIndex = 0;

		sap.ui.project.e2etm.util.StaticUtility.deleteUploadCollectionFile(this, oEvent, sDepReq, sFileName, sDocType, sEmpNo, sIndex);
	},
	// End functions for uploading file 


//	==========================================Begin of TGG1HC==================================================
	/*------------------------CUSTOM FUNCTION AREA BEGIN------------------------*/
	// This method is used to load the home page depending upon the role
	loadHomeView : function() {
		try {
			// Open busy dialog
			sap.ui.project.e2etm.util.StaticUtility.setBusy(true,this);

			// Bind value to screen's component
			this.bindDataBasedOnRole();

		} catch(exc) {}
	},

	// TAX DATA
	setTAXMyTaskData : function(results) {
		if (results != null) {
			// Bind the whole table to model
			var tableTAXMyTasks = this.getView().byId("tableTAXMyTasks");
			// Set Date Filter Type to all columns
			sap.ui.project.e2etm.util.StaticUtility.setFilterTypeToAllDateColumns(tableTAXMyTasks);
			var flexboxTAXMyTaskDetail = this.getView().byId("flexboxTAXMyTaskDetail");

			// This model is used for the whole table
			var myTAXTaskModel = new sap.ui.model.json.JSONModel();
			myTAXTaskModel.setSizeLimit(1500);

			// Set data to Manager my task table model
			myTAXTaskModel.setData(results);

			// Set model to Manager mytask table
			tableTAXMyTasks.setModel(myTAXTaskModel);
			tableTAXMyTasks.bindRows("/");

			this.myTAXTaskNumberofRows = tableTAXMyTasks.getBinding("rows").getLength();

			// Get the first My taks record index
			var iIndex = sap.ui.project.e2etm.util.StaticUtility.getArrayIndex(results,"ZZ_TAB_FLAG","MT");
			if (iIndex != -1) {
				// Visibility of proper details components
				this.getView().byId("lblTAXNodata").setVisible(false);
				this.getView().byId("btnTAXRefreshMyTaskTable").setVisible(true);
				tableTAXMyTasks.setVisible(true);

				// Set selected record based on the first item of my task table.
				// This statement will trigger the onChangeRow of table
				setTimeout(function() {
					tableTAXMyTasks.setSelectedIndex(0);
				}, 100);
			} else {
				this.getView().byId("lblTAXNodata").setVisible(true);
				this.getView().byId("btnTAXRefreshMyTaskTable").setVisible(false);
				tableTAXMyTasks.setVisible(false);
				flexboxTAXMyTaskDetail.setVisible(false);
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false,this);
			}

			// Display notification text on each Tab
			this.setNotifications(false);
		}
//		this.taskDeffered.resolve();
	},
	// TAX DATA
	// This method is used to bind data to the corresponding UI Components based on the role
	bindDataBasedOnRole : function() {
		var myRole = sap.ui.getCore().getModel("profile").getData().currentRole;
		var oDataModel = new sap.ui.model.odata.ODataModel(sServiceUrl);
		var batchArray = [];
		var batchOperation;
		var oThis = this;
		var pernr = "";

		if( myRole != "DEPU" ){
			pernr = sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_PERNR;
		}

		batchArray.push(oDataModel.createBatchOperation("DEP_HDR_INFOSet?$filter=ZZ_DEP_PERNR+eq+'" + pernr + 
				"'+and+ZZ_ROLE_NAME+eq+'" + myRole + "'&$expand=ZE2E_REQ_STATUSSet&$format=json", "GET"));

		oDataModel.addBatchReadOperations(batchArray);
		oDataModel.submitBatch(function(oResult){
			var oData = oResult.__batchResponses[0].data.results;

			// From the results, add all 'my task' data into array myTaskData
			// From the results, add all 'my request' data into array myRequestData
			var myTaskData = [];
			var myRequestData = [];
			for (var i = 0; i < oData.length; i++) {
				if (oData[i].ZZ_TAB_FLAG == "MT") {
					myTaskData.push(oData[i]);
				}
				if (oData[i].ZZ_TAB_FLAG == "MR") {
					myRequestData.push(oData[i]);
				}
			}

			if (myRole == "TAX") {
//				this.requestDeffered.resolve();
				oThis.setTAXMyTaskData(myTaskData);
			}

			$.when(this.requestDeffered, this.taskDeffered).then(function() {
				oThis.requestDeffered = $.Deferred();
				oThis.taskDeffered = $.Deferred();
//				oThis.getView().byId("tabStrip").setVisible(true);
				if (myRole == "EMP") {
					oThis.setEmployeeOpenRequest();
				}
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oThis);
			});
		},function(oError){
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false,this);
			sap.ca.ui.message.showMessageBox({
				type: sap.ca.ui.message.Type.ERROR,
				message: "Sorry for this inconvenience. Please contact support team",
				details: oError.response.statusText
			});
			this.getView().byId("tabStrip").setVisible(true);
		});
	},



	// This method is used to display REQUEST DETAILS PANEL on HOME PAGE
	setSelectedMyTask : function(selectedDep, reqTyp) {
		var myRole = sap.ui.getCore().getModel("profile").getData().currentRole;
		var allData = null;
		var model = new sap.ui.model.json.JSONModel();
		var flag = false;
		var oThis = this;
		if (myRole == "EMP" || myRole == null) {
			var flexboxEmployeeMyTaskDetail = this.getView().byId("flexboxEmployeeMyTaskDetail");
			flexboxEmployeeMyTaskDetail.setVisible(false);
			allData = this.getView().byId("tableEmployeeMyTasks").getModel().getData();

			if (allData != null) {
				for (var i = 0 ; i < allData.length; i++) {
					if (allData[i].ZZ_DEP_REQ == selectedDep && allData[i].ZZ_REQ_TYP == reqTyp) {
						// Set etag
						eTagHome = allData[i].__metadata.etag;
						if (eTagHome == "W/\"''\"" || eTagHome == "W/\"'0.0000000%20'\"") {
							eTagHome = "*";
						}

						model.setData(allData[i]);
						flexboxEmployeeMyTaskDetail.setModel(model, "myEmployeeSelectedTaskModel");

						flag = true;
						//sidd code start
						if(reqTyp == "VISA"){
							this.getView().byId("labelFromLocation").setVisible(false);
							this.getView().byId("labeltoLocation").setVisible(false);
						}
						break;
					}
				}
			}
			if (flag) {
				// Set contract letter if any
				this.setEmployeeContractLetter();
				$.when(this.contractletterDeferred).done(function(){
					flexboxEmployeeMyTaskDetail.setVisible(true);
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false,this);
					this.contractletterDeferred = $.Deferred();
				});
			} else {
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false,this);
			}
		} else if (myRole == "TAX") {
			var flexboxTAXMyTaskDetail = this.getView().byId("flexboxTAXMyTaskDetail");
			flexboxTAXMyTaskDetail.setVisible(false);
			var selectedData = {};
			allData = this.getView().byId("tableTAXMyTasks").getModel().getData();

			if (allData != null) {
				for (var i = 0 ; i < allData.length; i++) {
					if (allData[i].ZZ_DEP_REQ == selectedDep && allData[i].ZZ_REQ_TYP == reqTyp) {
						// Set etag
						eTagHome = allData[i].__metadata.etag;
						if (eTagHome == "W/\"''\"" || eTagHome == "W/\"'0.0000000%20'\"") {
							eTagHome = "*";
						}

						selectedData = jQuery.extend({}, allData[i]);
						if (allData[i].ZZ_DEP_SUB_TYPE == "") {
							selectedData.ZZ_DEP_SUB_TYPE = "";
						} else {
							selectedData.ZZ_DEP_SUB_TYPE = allData[i].ZZ_DEP_SUB_TYPE;
						}

						if (allData[i].ZZ_ASG_TYP == "") {
							selectedData.ZZ_ASG_TYP = "";
						} else {
							selectedData.ZZ_ASG_TYP = allData[i].ZZ_ASG_TYP;
						}

						if (allData[i].ZZ_TRV_PUR == "" || allData[i].ZZ_TRV_PUR == "PROJ") {
							selectedData.ZZ_TRV_PUR = "PROJ";
						} else {
							selectedData.ZZ_TRV_PUR = allData[i].ZZ_TRV_PUR;
						}

						if (allData[i].ZZ_SERV_TYP == "" || allData[i].ZZ_SERV_TYP == "NORM") {
							selectedData.ZZ_SERV_TYP = "NORM";
						} else {
							selectedData.ZZ_SERV_TYP = allData[i].ZZ_SERV_TYP;
						}
						// Populate dropdownlist in manager my task detail
						selectedData.serviceType = sap.ui.getCore().getModel("global").getData().serviceType;
						selectedData.purpose = sap.ui.getCore().getModel("global").getData().purpose;
						selectedData.subtype = sap.ui.getCore().getModel("global").getData().subtype;

						flag = true;
						break;
					}
				}
			}

			if (flag && (selectedData.ZZ_TRV_REQ == "" || selectedData.ZZ_TRV_REQ == "0000000000")) {
				// fetch assignment model based on deputation type
				var get = $.ajax({
					cache: false,
					url: sServiceUrl + "AssignmentSet?$filter=ZZ_SMODID eq '" + selectedData.ZZ_DEP_TYPE  + "' and ZZ_DEP_REQ eq '" +
					selectedData.ZZ_DEP_REQ + "'&$format=json",
					type: "GET"
				});
				get.done(function(result) {
					if (result != null) {
						selectedData.assmodel = result.d.results;
						model.setData(selectedData);
						if(!flexboxTAXMyTaskDetail.getModel("myTAXSelectedTaskModel")){
							flexboxTAXMyTaskDetail.setModel(model, "myTAXSelectedTaskModel");
						}else{
							flexboxTAXMyTaskDetail.getModel("myTAXSelectedTaskModel").setData(selectedData);
						}
						flexboxTAXMyTaskDetail.setVisible(true);				

					}
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oThis);
					
				});

			} else {
				model.setData(selectedData);
				flexboxTAXMyTaskDetail.setModel(model, "myTAXSelectedTaskModel");
				flexboxTAXMyTaskDetail.setVisible(true);
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false,this);
				this.assigmentDeferred.resolve();
			}
		} 
	},

	onTAXMyTaskTableChange : function(evt) {
		try {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(true,this);
			var rowIndex = evt.mParameters.rowIndex;
			if (rowIndex >= this.getView().byId("tableTAXMyTasks").getVisibleRowCount()) {
				rowIndex = rowIndex - this.getView().byId("tableTAXMyTasks").getVisibleRowCount();
			}
			var depId = this.getView().byId("tableTAXMyTasks").getRows()[rowIndex].getCells()[1].getText();
			var reqTyp = this.getView().byId("tableTAXMyTasks").getRows()[rowIndex].getCells()[0].getText();
			this.setSelectedMyTask(depId, reqTyp);
		} catch(exc) {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false,this);
		}
	},

	// This method is used to set notification (number) on each tab
	setNotifications : function(requestDisplay) {
		var oHomeThis = this;
		var myRole = sap.ui.getCore().getModel("profile").getData().currentRole;
		// Set notifications in Tab my Request
		if (requestDisplay) {
			try {
				if (myRole == "GRM") {
					oHomeThis.getView().byId("tabMyRequests").setText("TEAM REQUESTS");
					return;
				} else if (myRole == "DEPU") {
					oHomeThis.getView().byId("tabMyRequests").setText("ALL REQUESTS");
					return;
				} else {
					oHomeThis.getView().byId("tabMyRequests").setText("MY REQUESTS");
				}
				var curText = oHomeThis.getView().byId("tabMyRequests").getText();
				oHomeThis.getView().byId("tabMyRequests").setText(curText + " (" + oHomeThis.myRequestNumberofRows + ") ");
			} catch(exc) {}
		} else {
			// Set notifications in Tab my Task
			if (myRole == "GRM") {
				try {
					oHomeThis.getView().byId("tabMyTasks").setText("");
					oHomeThis.getView().byId("tabMyTasks").setText("MY TASKS (" + oHomeThis.myManagerTaskNumberofRows + ")");
				} catch(exc) {}
			} else if (myRole == "DEPU") {
				try {
					oHomeThis.getView().byId("tabMyTasks").setText("");
					oHomeThis.getView().byId("tabMyTasks").setText("MY TASKS (" + oHomeThis.myDeputationTaskNumberofRows + ")");
				} catch(exc) {}
			} else if (myRole == "EMP") {
				try {
					oHomeThis.getView().byId("tabMyTasks").setText("");
					oHomeThis.getView().byId("tabMyTasks").setText("MY TASKS (" + oHomeThis.myEmployeeTaskNumberofRows + ")");
				} catch(exc) {}
			} else if (myRole == "ECO") {
				try {
					oHomeThis.getView().byId("tabMyTasks").setText("");
					oHomeThis.getView().byId("tabMyTasks").setText("MY TASKS (" + oHomeThis.myECOTaskNumberofRows + ")");
				} catch(exc) {}
			} else if (myRole == "TAX") {
				try {
					oHomeThis.getView().byId("tabMyTasks").setText("");
					oHomeThis.getView().byId("tabMyTasks").setText("MY TASKS (" + oHomeThis.myTAXTaskNumberofRows + ")");
				} catch(exc) {}
			} else if (myRole == "CTG") {
				try {
					oHomeThis.getView().byId("tabMyTasks").setText("");
					oHomeThis.getView().byId("tabMyTasks").setText("MY TASKS (" + oHomeThis.myCTGTaskNumberofRows + ")");
				} catch(exc) {}
			}
		}
	},

	// TAX WORKFLOW EVENTS
	onTAXSentBackForChange:function(curEvt){
		this.taxAction('003', "Successfully Sent for changes");
	},
	onTAXApproveRequest : function(curEvt) {
		this.taxAction('001', "Successfully Approved");
	},
	onTAXRejectRequest : function(curEvt) {
		this.taxAction('002', "Request rejected");
	},
	
	onRefreshData : function(evt) {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true,this);
		this.bindDataBasedOnRole();
	},

	// TAX WORKFLOW ACTION
	taxAction: function(status, statusString) {
		var oHomeThis =this;
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true,oHomeThis);
		var comment = this.getView().byId("textAreaTAXComment").getValue();
		var data = this.getView().byId("flexboxTAXMyTaskDetail").getModel("myTAXSelectedTaskModel").getData();
		/*----------Begin of Travel Request----------------------------------------------------*/
		if(data.ZZ_REQ_TYP == 'BUSR' || data.ZZ_REQ_TYP == 'SECO'  || 
				data.ZZ_REQ_TYP == 'HOME' || data.ZZ_REQ_TYP == 'EMER' || data.ZZ_REQ_TYP == 'INFO'){
			// In manager dashboard, comment field is mandatory
			if (comment.trim() == "" || comment == null) {
				oHomeThis.getView().byId("textAreaTAXComment").setValueState("Error");
				sap.ca.ui.message.showMessageBox({
					type: sap.ca.ui.message.Type.ERROR,
					message: "Please give some comments",
					details: "Please give some comments"
				});
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
				return;
			}

			if(status == '001'){
				var get = $.ajax({
					cache: false,
					url: sServiceUrl + "APPROVE_TRAVEL?" + 
					"CATID='" + data.ZZ_DEP_SUB_TYPE +
					"'&COMMENT='" + comment +
					"'&PERNR='" + sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_PERNR +
					"'&REQUEST='" + data.ZZ_DEP_REQ +
					"'&TYPE='" + data.ZZ_REQ_TYP +
					"'&ROLE='" + sap.ui.getCore().getModel("profile").getData().currentRole +
					"'&TIMESTAMP='" +  data.ZZ_TIMESTAMP +
					"'&$format=json",
					type: "GET"
				});
				get.done(function(result) {
					sap.m.MessageToast.show(statusString + "!");
					oHomeThis.bindDataBasedOnRole();
					oHomeThis.getView().byId("textAreaTAXComment").setValue("");
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
				});
				get.fail(function(err) {
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
					var sMsg = err.responseText;
					if( sMsg.indexOf("EX_OBSOLETE") != -1 ){
						sMsg = "This request status is obsolete, please click refresh on the dashboard to retrieve new version";
					}
					sap.ca.ui.message.showMessageBox({
						type: sap.ca.ui.message.Type.ERROR,
						message: "Sorry for this inconvenience. Please contact support team",
						details: sMsg
					});
				});
			}else if(status == '002'){
				var get = $.ajax({
					cache: false,
					url: sServiceUrl + "TravelReject?ZZ_COMMENTS='" + comment +
					"'&ZZ_MGR_PERNR='" + sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_PERNR +
					"'&ZZ_REINR='" + data.ZZ_DEP_REQ +
					"'&ZZ_ROLE='" + sap.ui.getCore().getModel("profile").getData().currentRole +
					"'&ZZ_TTYPE='" + this.getView().byId("flexboxTAXMyTaskDetail").getModel("myTAXSelectedTaskModel").getData().ZZ_REQ_TYP +
					"'&ZZ_TIMESTAMP='" +  this.getView().byId("flexboxTAXMyTaskDetail").getModel("myTAXSelectedTaskModel").getData().ZZ_TIMESTAMP +
					"'&$format=json",
					type: "GET"
				});
				get.done(function(result){
					sap.m.MessageToast.show(statusString + "!");
					oHomeThis.bindDataBasedOnRole();
					oHomeThis.getView().byId("textAreaTAXComment").setValue("");
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
				});
				get.fail(function(err) {
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
					sap.ca.ui.message.showMessageBox({
						type: sap.ca.ui.message.Type.ERROR,
						message: "Sorry for this inconvenience. Please contact support team",
						details: err.responseText
					});
				});
			}else if(status == '003'){
				var get = $.ajax({
					cache: false,
					url: sServiceUrl + 'TravelSendBack?' + 
					"ZZ_COMMENTS='" + comment +
					"'&ZZ_MGR_PERNR='" + sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_PERNR +
					"'&ZZ_REINR='" + data.ZZ_DEP_REQ +
					"'&ZZ_ROLE='" + sap.ui.getCore().getModel("profile").getData().currentRole + 
					"'&ZZ_TTYPE='" + data.ZZ_REQ_TYP +
					"'&ZZ_TIMESTAMP='" +  data.ZZ_TIMESTAMP +
					"'&$format=json",
					type: "GET"
				});
				get.done(function(result){
					sap.m.MessageToast.show(statusString + "!");
					oHomeThis.bindDataBasedOnRole();
					oHomeThis.getView().byId("textAreaTAXComment").setValue("");
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
				});
				get.fail(function(err) {
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
					sap.ca.ui.message.showMessageBox({
						type: sap.ca.ui.message.Type.ERROR,
						message: "Sorry for this inconvenience. Please contact support team",
						details: err.responseText
					});
				});
			}
			return;
		}
		/*----------End of Travel Request------------------------------------------------------*/

		var position = sap.ui.getCore().getModel("profile").getData().currentRole;

		var roleKeys = sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_POSITION.split(";");
		var rolePref = sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_STATUS_TXT.split(";");
		for (var i = 0; i < roleKeys.length; i++) {
			if (roleKeys[i] == position) {
				status = rolePref[i] + status;
				break;
			}
		}

		var aData = {};
		aData.ZZ_DEP_REQ = data.ZZ_DEP_REQ;
		aData.ZZ_DEP_PERNR = data.ZZ_DEP_PERNR;
		aData.ZZ_DEP_NAME = data.ZZ_DEP_NAME;
		aData.ZZ_DEP_STDATE = data.ZZ_DEP_STDATE;
		aData.ZZ_DEP_ENDATE = data.ZZ_DEP_ENDATE;
		aData.ZZ_DEP_ENDATE = data.ZZ_DEP_ENDATE;
		aData.ZZ_DEP_FRMLOC_TXT = data.ZZ_DEP_FRMLOC_TXT;
		aData.ZZ_DEP_TOLOC_TXT = data.ZZ_DEP_TOLOC_TXT;
		aData.ZZ_STAT_FLAG = status;
		aData.ZZ_DEP_NTID = data.ZZ_DEP_NTID;
		aData.ZZ_DEP_EMAIL = data.ZZ_DEP_EMAIL;
		aData.ZZ_DEP_TYPE = data.ZZ_DEP_TYPE;
		aData.ZZ_DEP_TYPE_TXT = data.ZZ_DEP_TYPE_TXT;
		aData.ZZ_MGR_PERNR = sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_PERNR;
		aData.ZZ_NEW_COMMENTS = comment;
		aData.ZZ_ASG_TYP = data.ZZ_ASG_TYP;
		aData.ZZ_SRVTYP_MONTHS = data.ZZ_SRVTYP_MONTHS;
		aData.ZZ_SP_CMPNY = data.ZZ_SP_CMPNY;

		aData.ZZ_STAGE = "1";
		aData.ZZ_SET = "1_2";
		aData.ZZ_SUBSET = "1_2_1";
		aData.ZZ_SUBSUBSET = "1_2_1_3";

		// Validation before action
		// In manager dashboard, comment field is mandatory
		if (comment.trim() == "" || comment == null) {
			this.getView().byId("textAreaTAXComment").setValueState("Error");
			sap.ca.ui.message.showMessageBox({
				type: sap.ca.ui.message.Type.ERROR,
				message: "Please give some comments",
				details: "Please give some comments"
			});
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
			return;
		} else {
			if(!sap.ui.project.e2etm.util.StaticUtility.check256Characters(comment.trim())) {
				this.getView().byId("textAreaTAXComment").setValueState("Error");
				sap.ca.ui.message.showMessageBox({
					type: sap.ca.ui.message.Type.ERROR,
					message: "Maximum 255 characters allowed",
					details: "Maximum 255 characters allowed"
				});
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
				return;
			} else {
				this.getView().byId("textAreaTAXComment").setValueState("None");
			}
		}
		// In manager dashboard, if action is approve, 
		var action = status.substring(2, 5);
		if (action == "001") {
			// validate deputation subtype
			if (data.ZZ_DEP_SUB_TYPE == "" || data.ZZ_DEP_SUB_TYPE == null || data.ZZ_DEP_SUB_TYPE == "Please select") {
				sap.ca.ui.message.showMessageBox({
					type: sap.ca.ui.message.Type.ERROR,
					message: "Please enter Deputation To",
					details: "Please enter Deputation To"
				});
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
				return;
			} else {
				aData.ZZ_DEP_SUB_TYPE = data.ZZ_DEP_SUB_TYPE;
			}
			// validate purpose of travel
			if (data.ZZ_TRV_PUR == "" || data.ZZ_TRV_PUR == null || data.ZZ_TRV_PUR == "Please select") {
				sap.ca.ui.message.showMessageBox({
					type: sap.ca.ui.message.Type.ERROR,
					message: "Please enter Purpose of travel",
					details: "Please enter Purpose of travel"
				});
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
				return;
			} else {
				aData.ZZ_TRV_PUR = data.ZZ_TRV_PUR;
			}
			// validate service condition
			if (data.ZZ_SERV_TYP == "" || data.ZZ_SERV_TYP == null || data.ZZ_SERV_TYP == "Please select") {
				sap.ca.ui.message.showMessageBox({
					type: sap.ca.ui.message.Type.ERROR,
					message: "Please enter Service Condition",
					details: "Please enter Service Condition"
				});
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
				return;
			} else {
				aData.ZZ_SERV_TYP = data.ZZ_SERV_TYP;
			}
		}

		// Update the deputation with new status
		var token = "";
		var get = $.ajax({
			cache: false,
			url: sServiceUrl + "EMP_PASSPORT_INFOSet",
			type: "GET",
			headers: {
				'Authorization': token
			},
			beforeSend: function(xhr){
				xhr.setRequestHeader('X-CSRF-Token', 'Fetch');
			}
		});
		get.done(function(result, response, header){
			token = header.getResponseHeader("X-CSRF-Token");
			var post = $.ajax({
				cache: false,
				url: sServiceUrl + "DEP_HDR_INFOSet(ZZ_DEP_REQ='" + aData.ZZ_DEP_REQ + "',ZZ_VERSION='')",
				type: "PUT",
				beforeSend: function(xhr){
					xhr.setRequestHeader('X-Requested-With', "XMLHttpRequest");
					xhr.setRequestHeader('X-CSRF-Token', token);
					xhr.setRequestHeader('Accept', "application/json");
					xhr.setRequestHeader('DataServiceVersion', "2.0");
					xhr.setRequestHeader('Content-Type', "application/json");
					xhr.setRequestHeader('If-Match', eTagHome);
				},
				data: JSON.stringify(aData),
				dataType:"json",
				success: function(data) {
					sap.m.MessageToast.show(statusString + "!");
					oHomeThis.bindDataBasedOnRole();
					oHomeThis.getView().byId("textAreaTAXComment").setValue("");
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
				}
			});
			post.fail(function(err) {
				// Call get entity service with deputation request number
				if (err.status == 412) {
					var get = $.ajax({
						cache: false,
						url: sServiceUrl + "DEP_LOCK_USERSet('" + data.ZZ_DEP_REQ + "')?$format=json",
						type: "GET",
					});
					get.done(function(result) {
						sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
						sap.ca.ui.message.showMessageBox({
							type: sap.ca.ui.message.Type.ERROR,
							message: "This request was modified by " + result.d.ZZ_DEP_NTID + ". Please refresh homepage"
						});
					});
				} else {
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
					sap.ca.ui.message.showMessageBox({
						type: sap.ca.ui.message.Type.ERROR,
						message: "Sorry for this inconvenience. Please contact support team",
						details: err.responseText
					});
				}
			});
		});
	},
	// TAX WORKFLOW ACTION
//	==========================================End of TGG1HC==================================================
	onMenu : function(evt) {

		var countryList = sap.ui.getCore().getModel("global").getData().country;
		if(evt.oSource.mAggregations.customData[0] != undefined){		
			for (var i = 0; i < countryList.length; i ++) {
				if(evt.oSource.mAggregations.customData[0].mProperties.value == countryList[i].MOLGA){
					menuRef.mAggregations.customData[0].mProperties.value = countryList[i].LTEXT;
					break;
				}
			}	
		}
		menuRef = sap.ui.project.e2etm.util.StaticUtility.customMenuOpen(this, evt);
//		var countryList = sap.ui.getCore().getModel("global").getData().country;
//		for (var i = 0; i < countryList.length; i ++) {
//		if(menuRef.mAggregations.customData[0].mProperties.value == countryList[i].MOLGA){
//		menuRef.mAggregations.customData[0].mProperties.value = countryList[i].LTEXT;
//		break;
//		}
//		}	

	},
	onMenuItemSelect : function(evt) {
		var countryList = sap.ui.getCore().getModel("global").getData().country;
		var aFilters = [];
		var aSorters = [];
		var menu = this.getView().byId("menu_settings");
		var table = this.getView().byId("taxtable");
		var sPath = this.findProperty();
		var oBinding = table.getBinding("items");
		path = sPath;

		if(evt.getParameter("item").mProperties.label == "Filter"){
			value = evt.getParameter("item").getValue();
			if( sPath == "ZZ_COUNTRY_G"){
				for (var i = 0; i < countryList.length; i ++) {
					if (countryList[i].LTEXT.toLowerCase() == evt.getParameter("item").getValue().toLowerCase()) {
						evt.getParameter("item").setValue(countryList[i].MOLGA)  ;
					}
				}
			}	
		}else{
			sorter = evt.getParameter("item").getText();
		}	
		sap.ui.project.e2etm.util.StaticUtility.customMenuItemSelect(this, evt, menuRef, sPath, oBinding);
	},
	findProperty : function() {
		var sPath;
		switch (menuRef.getText()) {
		case "Travel Req":
			sPath = "ZZ_TRV_REQ";
			break;
		case "Employee No":
			sPath = "ZZ_OWNER";
			break;
		case "Country":
			sPath = "ZZ_COUNTRY_G";
			break;
		case "Tax Inititation date":
			sPath = "ZZ_REQ_DATE";
			break;
		case "Travel end date":
			sPath = "ENDDA";
			break;
		case "Assignment Model":
			sPath = "ZZ_ASG_TYP";
			break;		
		}
		return sPath;
	},

});