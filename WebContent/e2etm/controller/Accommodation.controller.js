jQuery.sap.require("sap.ui.project.e2etm.util.Formatter");
jQuery.sap.require("sap.ui.project.e2etm.util.StaticUtility");
jQuery.sap.require('sap.ui.project.e2etm.controls.customStage');
jQuery.sap.require('sap.ui.project.e2etm.controls.stageItem');
jQuery.sap.require("sap.m.MessageToast");
jQuery.sap.require("sap.m.MessageBox");
sap.ui.controller("sap.ui.project.e2etm.controller.Accommodation", {

	onInit : function() {
		sap.ui.core.routing.Router.getRouter("MyRouter").attachRoutePatternMatched(this.onRouteMatched, this);
//		this.getView().setModel(sap.ui.getCore().getModel("profile"), "profile");
//		this.getView().setModel(sap.ui.getCore().getModel("global"), "global");
//		this.doInit();


	},

//	=======================================EVENT==============================================
	onRouteMatched: function(evt){

		if(evt.getParameter("name")=="home"){
			this.clearData();		
		} else if(evt.getParameter("name")=="accommodation") {
			 oComponent.oContainer.getParent().setAppWidthLimited(true);
			
			if(this.getView().sViewName == "sap.ui.project.e2etm.view.Accommodation"){
//				var oShell = oComponent.oContainer.getParent();
//				oShell.removeStyleClass("customShell1");
//				oShell.addStyleClass("customShellAcc");

				var oModel = new sap.ui.model.json.JSONModel();		
				oModel.setSizeLimit(200);
				this.getView().setModel(oModel,"new");
				this.getView().setModel(sap.ui.getCore().getModel("profile"), "profile");
				//do job from admin page
				var currentRole = this.getView().getModel("profile").getData().currentRole;
				this.getView().getModel("new").setProperty("/Role",currentRole);
				sap.ui.project.e2etm.util.StaticUtility.setBusy(true,this);
				if(currentRole != "EMP"){
					var accAdminData = sap.ui.getCore().getModel("accAdminData").getData();
					var	sPernr = accAdminData.oData.ZZ_OWNER;
					var	sType = accAdminData.oData.ZZ_TRV_KEY;
					var	sTravelRequest = accAdminData.oData.ZZ_TRV_REQ;
					var	sVersion = accAdminData.oData.ZZ_VERSION.trim();
					var filterTab = accAdminData.filterTab;
					var VisaMode = accAdminData.visaMode;
					var sCountry = accAdminData.oData.TRV_HDR.ZZ_LAND1;
					if(VisaMode){
						this.getView().byId("travelTitle").setText("Visa plan info");
						this.getView().byId("idTravelLabel").setText("Visa plan No");
					}else{
						this.getView().byId("travelTitle").setText("Travel Info");
						this.getView().byId("idTravelLabel").setText("Travel Plan No");
					}
					
					this.getView().byId("btnBookRooms").setVisible(false);
					if(accAdminData.asgGroup == "ACCI")
						this.getView().byId("btnBookRooms").setVisible(true);
					
					this.getAccInfo(sPernr,sTravelRequest,sVersion,sType,"INTL",sCountry);
//					var sActive = this.getView().getModel("profile").getData().currentRole;
					//get info comments tab
					sap.ui.project.e2etm.util.StaticUtility.getComment(sTravelRequest,sType,"ACOM",this);
					//set visible
					this.setActivate(currentRole,filterTab);
				
				}else{//do code for employee
					oRequest = sap.ui.getCore().getModel("oRequest").getData();
					var	sPernr = oRequest.ZZ_DEP_PERNR;
//					varsDEPRequest = oRequest.ZZ_TRV_REQ;
					var sType = oRequest.ZZ_REQ_TYP;
					var sTravelRequest = oRequest.ZZ_TRV_REQ;
					var sVersion = oRequest.ZZ_VERSION.trim();
					this.getAccInfo(sPernr,sTravelRequest,sVersion,sType,"INTL",sCountry);
					this.setActivate(currentRole,"");	
					//get info comments tab
					sap.ui.project.e2etm.util.StaticUtility.getComment(sTravelRequest,sType,"ACOM",this);
				}

			}	

		} else if (evt.getParameter("name")=="accommodationAdmin"){
			oComponent.oContainer.getParent().setAppWidthLimited(true);
			if(this.getView().sViewName == "sap.ui.project.e2etm.view.AccommodationAdmin"){
//				var oShell = oComponent.oContainer.getParent();
//				oShell.removeStyleClass("customShell1");
//				oShell.addStyleClass("customShell2");
				//get modid
//				oRequest = sap.ui.getCore().getModel("oRequest").getData();
				var oModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(oModel,"listAcc");


				this.getView().setModel(sap.ui.getCore().getModel("profile"), "profile");
				var currentRole = this.getView().getModel("profile").getData().currentRole;
				if(currentRole == "ACCO"){
					this.getView().getModel("listAcc").setProperty("/RoleAdmin",true);
				}else{
					this.getView().getModel("listAcc").setProperty("/RoleAdmin",false);
				}
				//this.onAdGroupSelect();
				var sPernr = sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_PERNR;		
				this.getAdGroup(sPernr,"ACOM",this);
				//case of visa plan
			}
		}
		try {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
		}catch(exc) {}
	},

	// on submit press
	onSubmit: function(){
		var canContinue = 0; // can continue
		canContinue = this.checkError(canContinue);
		this.sendPostRequest("03","01",canContinue);
//		sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
//		this.doFilter("");
	},

	// on save button
	onSave: function(){
		var canContinue = 0; // can continue
		canContinue = this.checkError(canContinue);
		this.sendPostRequest("03","00",canContinue);
//		this.doFilter("");
	},
	//on cancel
	onCancel: function(){
		var canContinue = 0; // can continue
		canContinue = this.checkError(canContinue);
		this.sendPostRequest("03","09",canContinue);
	},
	// on delete button press
	onDeleteColum: function(){
		this.deleteColum();
	},

	// add colum for table accommodation detail
	onAddColum: function(){
		this.addColum();
	},


	//onIconTabSelect
	onIconTabSelect: function(evt){
		this.getFilter(evt.mParameters.key, this.getView().byId("idSearch").getValue());
	},

	// on item admin list press
	onItemPress: function(event){
		itemSelected = event.getParameter("listItem");
		var items = event.oSource.getBinding("items");

		var index1 = event.oSource.indexOfItem(itemSelected);
		var index = items.aIndices[index1];
		var source = event.oSource;
		var items = event.oSource.getBinding("items");
		var bindingItem = event.oSource.getBinding("items").oList;
		var accAdminData;
		accAdminData = bindingItem[index];
		
//		accAdminData.AdminRole = this.getView().getModel("listAcc").getProperty("/AdminRole");
//		if(!this.getView().getModel("new")){
//		var oModel = new sap.ui.model.json.JSONModel();
//		oModel.setData(accAdminData);
//		this.getView().setModel(oModel,"new");
//		}else{
//		this.getView().getModel("new").setData(accAdminData);
//		}
		if(!sap.ui.getCore().getModel("accAdminData")){
			var oModel = new sap.ui.model.json.JSONModel();		
			oModel.setProperty("/oData",accAdminData);
			var filterTab = this.getView().byId("idIconTabBarAccAdmin").getSelectedKey();
			oModel.setProperty("/filterTab",filterTab);
			oModel.setProperty("/asgGroup",this.getView().byId("idAdGroupSelect").getSelectedKey());
			sap.ui.getCore().setModel(oModel, "accAdminData");
		}else{
			var filterTab = this.getView().byId("idIconTabBarAccAdmin").getSelectedKey();
			sap.ui.getCore().getModel("accAdminData").setProperty("/oData",accAdminData);
			sap.ui.getCore().getModel("accAdminData").setProperty("/filterTab",filterTab);
			sap.ui.getCore().getModel("accAdminData").setProperty("/asgGroup",this.getView().byId("idAdGroupSelect").getSelectedKey());
		}



		sap.ui.core.routing.Router.getRouter("MyRouter").navTo("accommodation");
	},
	//search
	onSearch: function(){

		var searchString =  this.getView().byId("idSearch").getValue();
		//in case of search for date
		if(sap.ui.project.e2etm.util.StaticUtility.isDate(searchString) == true){
			searchString = searchString.substring(6,12) + searchString.substring(3,5) + searchString.substring(0,2) ;
		}
		if(this.getView().byId("idSearch").getProperty("showRefreshButton")==true || searchString==""){
			//refresh data
/*Changes done by Bharadwaj for issue correction*/			
			var key = this.getView().byId("idIconTabBarAccAdmin").getSelectedKey();
			this.getFilter(key,searchString);
/*Changes done by Bharadwaj for issue correction*/			

		}else{
			if (searchString && searchString.length > 0) {
				var key = this.getView().byId("idIconTabBarAccAdmin").getSelectedKey();
				this.getFilter(key,searchString);
			}
		}


	},
//	-------------------begin funtion upload file
	onFileDeleted: function(oEvent){
		// prepare FileName
		var sFileName = oEvent.getParameters("item").item.getFileName();

		// prepare DocType
		var oData =  oEvent.oSource.getParent().getModel("new").getData();
		var sDocType;
		sDocType = "ACC";

		// prepare travel request number
		var sDepReq = oData.Header.ZZ_DEP_REQ;

		// prepare employee number
		var sEmpNo = oData.Detail.ZZ_OWNER;

		// prepare index
		var sIndex = 0;

		sap.ui.project.e2etm.util.StaticUtility.deleteUploadCollectionFile(this, oEvent, sDepReq, sFileName, sDocType, sEmpNo, sIndex);
	},

	onFileUpload:function(evt){
		var file = evt.getParameters("files").files[0];
		var oData =  evt.oSource.getParent().getModel("new").getData();
		var sModule = "ACC";


		if(sap.ui.getCore().getModel("accAdminData")){
			if(sap.ui.getCore().getModel("accAdminData").getData().visaMode){				
				sap.ui.project.e2etm.util.StaticUtility.uploadCollectionFile(this,file,oData.Detail.ZE2E_BVISA_HDR.ZZ_VISA_REQ, oData.Detail.ZZ_OWNER,sModule);
			}else{
				sap.ui.project.e2etm.util.StaticUtility.uploadCollectionFile(this,file,oData.Header.ZZ_DEP_REQ, oData.Detail.ZZ_OWNER,sModule);
			}
		}else{
			sap.ui.project.e2etm.util.StaticUtility.uploadCollectionFile(this,file,oData.Header.ZZ_DEP_REQ, oData.Detail.ZZ_OWNER,sModule);
		}
		
	},

	onUploadComplete:function(oEvent){
		this.getView().getModel("new").refresh(true);
	},


//	------------------------end of function upload file

	// onSelectHotel
	onSelectHotel: function(evt){
		var sSelect = evt.getSource();
		var sItem = evt.getSource().getParent();
		var sTable = this.getView().byId("dependentTableId");
		var Index = sTable.indexOfItem(sItem);
		var oData = this.getView().getModel("new").getData();
		for(i=0;i<oData.Hotel.results.length;i++){
			if(oData.Hotel.results[i].ZZ_HOTEL_KEY == sSelect.mProperties.selectedKey){
				oData.Detail.ZE2E_ACC_DETAILSet[Index].ZZ_ADD_ACC = oData.Hotel.results[i].ZZ_ADDRESS;
				oData.Detail.ZE2E_ACC_DETAILSet[Index].ZZ_HOTEL_KEY = oData.Hotel.results[i].ZZ_HOTEL_KEY;
				oData.Detail.ZE2E_ACC_DETAILSet[Index].ZZ_NAME = oData.Hotel.results[i].ZZ_NAME;
				oData.Detail.ZE2E_ACC_DETAILSet[Index].ZZ_UNITS = oData.Hotel.results[i].ZZ_UNITS;
				oData.Detail.ZE2E_ACC_DETAILSet[Index].ZZ_ADDRESS = oData.Hotel.results[i].ZZ_ADDRESS;
			}
		}
		this.getView().getModel("new").setData(oData);
	},

	//on re-assign button pressed
	onReAssignPress: function(oEvent){
		var oThis = this;
		var sSelectedTable = oThis.getView().byId("idlistAdmin").getSelectedItems();
		if(sSelectedTable.length!=0){
			var dialog = new sap.m.Dialog({
				title: 'Confirm',
				type: 'Message',
				content: [
				          new sap.m.Text({ text: 'Are you sure you want to re-assign request(s) ?' }),

				          new sap.m.TextArea('submitDialogTextarea', {
				        	  liveChange: function(oEvent) {
				        		  var sText = oEvent.getParameter('value');
				        		  parent = oEvent.getSource().getParent();

				        		  parent.getBeginButton().setEnabled(sText.length > 0);
				        	  },
				        	  width: '100%',
				        	  placeholder: 'Comment (required)'
				          }),
				          new sap.m.Select("ResGroup", {
				        	  width: '100%',
				        	  placeholder: 'Comment (required)',
				        	  items: [
				        	          new sap.ui.core.Item({
				        	        	  text:"RBEI-Accommodation",
				        	        	  key:"ACCI",
				        	          }),
				        	          new sap.ui.core.Item({
				        	        	  text:"RBEB-Accommodations",
				        	        	  key:"ACCB",
				        	          }),
				        	          new sap.ui.core.Item({
				        	        	  text:"Bosch India Hotel Desk",
				        	        	  key:"ACCD",
				        	          }),
				        	          new sap.ui.core.Item({
				        	        	  text:"Site HRL",
				        	        	  key:"ACCH",
				        	          }),
				        	          new sap.ui.core.Item({
				        	        	  text:"RBVH",
				        	        	  key:"ACCV",
				        	          }),
				        	          ],
				          })
				          ],
				          beginButton: new sap.m.Button({
				        	  text: 'Re-Assign',
				        	  enabled: false,
				        	  press: function () {
				        		  sap.ui.project.e2etm.util.StaticUtility.setBusy(true,oThis);
				        		  var sText = sap.ui.getCore().byId('submitDialogTextarea').getValue();
				        		  var sSmodid = sap.ui.getCore().byId("ResGroup").getSelectedKey();
//				        		  var oData = oThis.getView().getModel("new").getData();

				        		  var sPernr;
				        		  var sType;
				        		  var sTravelRequest;
				        		  var sVersion;
				        		  var oListData = 	oThis.getView().getModel("listAcc").getData();
				        		  for(i=0;i<sSelectedTable.length;i++){
				        			  var itemIndex = oThis.getView().byId("idlistAdmin").indexOfItem(sSelectedTable[i]);
				        			  var item = oListData.results[itemIndex];
				        			  sPernr = item.ZZ_OWNER;
				        			  sType = item.ZZ_TRV_KEY;
				        			  sTravelRequest = item.ZZ_TRV_REQ;
				        			  sVersion = item.ZZ_VERSION;
				        			  oThis.reAssign(sTravelRequest, sType, sPernr, sText, sSmodid,oThis);  
				        		  }
//				        		  refresh daskboard
				        		  var key = oThis.getView().byId("idIconTabBarAccAdmin").getSelectedKey();
				        		  var searchString =  oThis.getView().byId("idSearch").getValue();
				        		  oThis.getFilter(key,searchString);
				        		  dialog.close();
				        	  }
				          }),
				          endButton: new sap.m.Button({
				        	  text: 'Cancel',
				        	  press: function () {
				        		  dialog.close();
				        	  }
				          }),
				          afterClose: function() {
				        	  dialog.destroy();
				          }
			});
			dialog.open();
		}else{
			sap.m.MessageToast.show("Please choose at least on request!");
		}

	},

	// on nav back
	onNavButton: function(){
		sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
	},

	// handle Link Press
	handleLinkPress: function(){
		var oData = this.getView().getModel("new").getData();
		var	sPernr = oData.Detail.ZZ_OWNER;
		var	sType = oData.Detail.ZZ_TRV_KEY;
		var	sTravelRequest = oData.Detail.ZZ_TRV_REQ;
		var	sModule = "REQ";
		var sHref =sServiceUrl + "TravelPdfSet(EmpNo='{0}',TrNo='{1}',TrvKey='{2}',Module='{3}')/$value";
		sHref = sHref.replace("{0}", sPernr);
		sHref = sHref.replace("{1}", sTravelRequest);
		sHref = sHref.replace("{2}", sType);
		sHref = sHref.replace("{3}", sModule);
		this.getView().byId("idLinkTravelPDF").setHref(sHref);
	},

	// display hotel table trigger by RBEI
	onValueHelpRequest: function(evt){
		var oThis = this;
		var oControl = evt.oSource;  
		var sItem = evt.getSource().getParent();
		var sTable = this.getView().byId("dependentTableId");
		var Index = sTable.indexOfItem(sItem);
		var oData = this.getView().getModel("new").getData();
		if(sItem.getCells()[0].mProperties.selectedKey == "RBEI" || sItem.getCells()[0].mProperties.selectedKey == "HOTEL"){
			var oValueHelpDialog = new sap.ui.comp.valuehelpdialog.ValueHelpDialog({
				supportMultiselect: false,
				cancel: function(oControlEvent) {		       
					oValueHelpDialog.close();
				},
				change : function(){
					alert("changeDialog");
				},
				afterClose: function() {
					oValueHelpDialog.destroy();
				},
				ok: function(oControlEvent) {
					var sKey = oControlEvent.getParameter("tokens")[0].getProperty("key");
//					oControl.setValue(sKey);
					// assign value for other field
					for(i=0;i<oData.Hotel.results.length;i++){
						if(oData.Hotel.results[i].ZZ_HOTEL_KEY == sKey){
							oData.Detail.ZE2E_ACC_DETAILSet[Index].ZZ_ADD_ACC = oData.Hotel.results[i].ZZ_ADDRESS;
							oData.Detail.ZE2E_ACC_DETAILSet[Index].ZZ_HOTEL_KEY = oData.Hotel.results[i].ZZ_HOTEL_KEY;
							oData.Detail.ZE2E_ACC_DETAILSet[Index].ZZ_NAME = oData.Hotel.results[i].ZZ_NAME;
//							oData.Detail.ZE2E_ACC_DETAILSet[Index].ZZ_UNITS = oData.Hotel.results[i].ZZ_UNITS;
							oData.Detail.ZE2E_ACC_DETAILSet[Index].ZZ_ADDRESS = oData.Hotel.results[i].ZZ_ADDRESS;
						}
					}
					oThis.getView().getModel("new").setData(oData);
					oValueHelpDialog.close();

					if( oControl.getId().indexOf("costCenterId")  != -1){
						this.showCostCenterMessage(sKey);
					}
				},  			
			});
			var oRowsModel = new sap.ui.model.json.JSONModel();	    
			oValueHelpDialog.setModel(oRowsModel);
			oValueHelpDialog.theTable.bindRows("/");
			//sidd code start
			this.setHotelF4(oRowsModel, oValueHelpDialog,sItem);
			oValueHelpDialog.open();
		}else{
			sap.m.MessageToast.show("Value search help only support for RBEI CONTRACTED APT and HOTEL!");
		}

	},

	// nav back
	onNavPress: function(evt){
		sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
	},

	// on select unit press
	onSelectUnit: function(evt){
		var oData = this.getView().getModel("new").getData();
		// get current  index of table
		var sSelect = evt.getSource();
		var sItem = evt.getSource().getParent();
		var sTable = this.getView().byId("dependentTableId");
		var Index = sTable.indexOfItem(sItem);
		// assign total cost

		if(oData.Detail.ZE2E_ACC_DETAILSet[Index].ZZ_ACC_COST == ""){
			var sMonthCost = 0 ;
			var sStartDate = sap.ui.project.e2etm.util.Formatter.sapDateddMMyyyy(sItem.getCells()[1].getValue());
			var sEndDate = sap.ui.project.e2etm.util.Formatter.sapDateddMMyyyy(sItem.getCells()[2].getValue());
			var sDayCost = sMonthCost / 30 ;
			var sTotal = sap.ui.project.e2etm.util.StaticUtility.calculateHotelCost(sStartDate, sEndDate, Number(sMonthCost), sDayCost);
			oData.Detail.ZE2E_ACC_DETAILSet[Index].ZZ_TOTAL = String(sTotal);
			this.getView().getModel("new").setData(oData);
		}else{
			var sStartDate = sap.ui.project.e2etm.util.Formatter.sapDateddMMyyyy(sItem.getCells()[1].getValue());
			var sEndDate =  sap.ui.project.e2etm.util.Formatter.sapDateddMMyyyy(sItem.getCells()[2].getValue());
			if(sSelect.mProperties.selectedKey == "PERMONTH"){
				var sMonthCost = Number(sItem.getCells()[4].mProperties.value) + Number(sItem.getCells()[5].mProperties.value);
				var sDayCost = sMonthCost / 30 ;
				var sTotal = sap.ui.project.e2etm.util.StaticUtility.calculateHotelCost(sStartDate, sEndDate, Number(sMonthCost), sDayCost);
				sTotal = Math.round(sTotal * 100) / 100;
				oData.Detail.ZE2E_ACC_DETAILSet[Index].ZZ_TOTAL = String(sTotal);
				this.getView().getModel("new").setData(oData);
			}else if(sSelect.mProperties.selectedKey == "PERDAY"){
				var sDayCost = Number(sItem.getCells()[4].mProperties.value) + Number(sItem.getCells()[5].mProperties.value);
				sMonthCost = sDayCost*30;
				var sTotal = sap.ui.project.e2etm.util.StaticUtility.calculateHotelCost(sStartDate, sEndDate, Number(sMonthCost), sDayCost);
				sTotal = Math.round(sTotal * 100) / 100;
				oData.Detail.ZE2E_ACC_DETAILSet[Index].ZZ_TOTAL = String(sTotal);
				this.getView().getModel("new").setData(oData);
			}else if(sSelect.mProperties.selectedKey == "PERWEEK"){
				var sWeekCost = Number(sItem.getCells()[4].mProperties.value) + Number(sItem.getCells()[5].mProperties.value);
				var sDayCost = sWeekCost/7;
				sMonthCost = sDayCost*30;
				var sTotal = sap.ui.project.e2etm.util.StaticUtility.calculateHotelCost(sStartDate, sEndDate, Number(sMonthCost), sDayCost);
				sTotal = Math.round(sTotal * 100) / 100;
				oData.Detail.ZE2E_ACC_DETAILSet[Index].ZZ_TOTAL = String(sTotal);
				this.getView().getModel("new").setData(oData);
			}else{
				oData.Detail.ZE2E_ACC_DETAILSet[Index].ZZ_TOTAL = "0";
				this.getView().getModel("new").setData(oData);
			}
		}
//		var sMonthCost = oData.Detail.ZE2E_ACC_DETAILSet[Index].ZZ_TOTAL
//		sap.ui.project.e2etm.util.StaticUtility.calculateHotelCost(sStartdate, sEnddate, sMonthCost, sDayCost);
	},

	// on cost lie change
	onCostChange: function(evt){
		var oData = this.getView().getModel("new").getData();
		// get current  index of table
		var sInput = evt.getSource();
		var sItem = evt.getSource().getParent();
		var sTable = this.getView().byId("dependentTableId");
		var Index = sTable.indexOfItem(sItem);
		var sStartDate = sap.ui.project.e2etm.util.Formatter.sapDateddMMyyyy(sItem.getCells()[1].getValue());
		var sEndDate =  sap.ui.project.e2etm.util.Formatter.sapDateddMMyyyy(sItem.getCells()[2].getValue());
		
		if(sItem.getCells()[6].mProperties.selectedKey == "PERMONTH"){
			var sMonthCost = Number(sItem.getCells()[4].mProperties.value) + Number(sItem.getCells()[5].mProperties.value);
			
			var sDayCost = sMonthCost / 30 ;
			var sTotal = sap.ui.project.e2etm.util.StaticUtility.calculateHotelCost(sStartDate, sEndDate, Number(sMonthCost), sDayCost);
			sTotal = Math.round(sTotal * 100) / 100;
			oData.Detail.ZE2E_ACC_DETAILSet[Index].ZZ_TOTAL = String(sTotal);
			this.getView().getModel("new").setData(oData);
		}else if(sItem.getCells()[6].mProperties.selectedKey == "PERDAY"){
			var sDayCost = Number(sItem.getCells()[4].mProperties.value) + Number(sItem.getCells()[5].mProperties.value);
			sMonthCost = sDayCost*30;
			var sTotal = sap.ui.project.e2etm.util.StaticUtility.calculateHotelCost(sStartDate, sEndDate, Number(sMonthCost), sDayCost);
			sTotal = Math.round(sTotal * 100) / 100;
			oData.Detail.ZE2E_ACC_DETAILSet[Index].ZZ_TOTAL = String(sTotal);
			this.getView().getModel("new").setData(oData);
		}else if(sItem.getCells()[6].mProperties.selectedKey == "PERWEEK"){
			var sWeekCost =Number(sItem.getCells()[4].mProperties.value) + Number(sItem.getCells()[5].mProperties.value);
			var sDayCost = sWeekCost/7;
			sMonthCost = sDayCost*30;
			
			var sTotal = sap.ui.project.e2etm.util.StaticUtility.calculateHotelCost(sStartDate, sEndDate, Number(sMonthCost), sDayCost);
			sTotal = Math.round(sTotal * 100) / 100;
			oData.Detail.ZE2E_ACC_DETAILSet[Index].ZZ_TOTAL = String(sTotal);
			this.getView().getModel("new").setData(oData);
		}else{
			oData.Detail.ZE2E_ACC_DETAILSet[Index].ZZ_TOTAL = "0";
			this.getView().getModel("new").setData(oData);
		}
		
		//calculate value and set to Model
//		var i =0;
//		 for(i;i<)

	},

	//Set columns for search help
	setHotelF4: function( oRowsModel, oValueHelpDialog, sItem){				

		oValueHelpDialog.setTitle("HOTEL");
		oValueHelpDialog.setKey("ZZ_HOTEL_KEY");
//		&& oData.Hotel.results[i].ZZ_ACC_TYPE == sItem.getCells()[0].mProperties.selectedKey
		oHotel = this.getView().getModel("new").getData().Hotel.results;
		var iHotelSuggest = [];
		for(i=0;i<oHotel.length;i++){
			if(oHotel[i].ZZ_ACC_TYP == sItem.getCells()[0].mProperties.selectedKey ){
				iHotelSuggest.push(oHotel[i]);
			}
		}		
		oRowsModel.setData(iHotelSuggest);
		oValueHelpDialog.theTable.addColumn(new sap.ui.table.Column({
			label: new sap.ui.commons.Label({text: "HOTEL NAME"}),
			template: new sap.ui.commons.TextView().bindProperty("text", "ZZ_NAME"),
			sortProperty: "ZZ_NAME",
			filterProperty: "ZZ_NAME",
			width: "20%",
		}));
		oValueHelpDialog.theTable.addColumn(new sap.ui.table.Column({
			label: new sap.ui.commons.Label({text: "ADDRESS"}),
			template: new sap.ui.commons.TextView().bindProperty("text", "ZZ_ADDRESS"),
			sortProperty: "ZZ_ADDRESS",
			filterProperty: "ZZ_ADDRESS",
			width: "60%",
		}));
	},

	//chagne hotel search help
	onHotelChange: function(evt){
//		var oData = this.getView().getModel("new").getData();
//		// get current  index of table
//		var sInput = evt.getSource();
//		var sItem = evt.getSource().getParent();
//		var sTable = this.getView().byId("dependentTableId");
//		var Index = sTable.indexOfItem(sItem);
//		var check =true;
//		if(sItem.getCells()[0].mProperties.selectedKey == "RBEI"){
//			check = this.checkHotel(oData, sInput.getValue());
//			if(!check){
//				sap.m.MessageToast.show("Hotel must be in the search help list!");
//				sInput.setValue("");
//			}
//		}


	},
	// check hotel in search help list
	checkHotel: function(oData,inputValue){
		for(i=0;i<oData.Hotel.results.length;i++){
			if(oData.Hotel.results[i].ZZ_HOTEL_KEY == oData){
				check = oData.Hotel.results[i].ZZ_HOTEL_KEY; 
				return false;
			}
		}
	},
	// on select accommodation type press
	onSelectAccType: function(evt){
		var oData = this.getView().getModel("new").getData();
		// get current  index of table
		var sInput = evt.getSource();
		var sItem = evt.getSource().getParent();
		var sTable = this.getView().byId("dependentTableId");
		var Index = sTable.indexOfItem(sItem);
		switch(sItem.getCells()[0].mProperties.selectedKey){
//		case "RBEI":
//			//change unit to 2 value
//			sItem.getCells()[5].removeAllItems();
//			var sItemPerblank = new sap.ui.core.Item({
//				key:"", text: "", tooltip :"", 
//			});
//			var sItemPerMonth = new sap.ui.core.Item({
//				key:"PERMONTH", text: "Per Month", tooltip :"Cost by per month", 
//			});
//			var sItemPerDay = new sap.ui.core.Item({
//				key:"PERDAY", text: "Per day", tooltip :"Cost by per day", 
//			});
//			sItem.getCells()[5].addItem(sItemPerblank);
//			sItem.getCells()[5].addItem(sItemPerMonth);
//			sItem.getCells()[5].addItem(sItemPerDay);
//			break;
//		case "HOTEL":
//			//change unit to per day
//			sItem.getCells()[5].removeAllItems();
//			var sItemPerblank = new sap.ui.core.Item({
//				key:"", text: "", tooltip :"", 
//			});
//			var sItemPerDay = new sap.ui.core.Item({
//				key:"PERDAY", text: "Per day", tooltip :"Cost by per day", 
//			});
//			sItem.getCells()[5].addItem(sItemPerblank);
//			sItem.getCells()[5].addItem(sItemPerDay);
//			break;
		case "OWN":
		
				var accDetail = this.getView().getModel("new").getData().Detail.ZE2E_ACC_DETAILSet;
				var Header = this.getView().getModel("new").getData().Header;
				accDetail[Index]["BEGDA"] = Header.ZZ_DATV1;
				accDetail[Index]["ENDDA"] = Header.ZZ_DATB1;
				accDetail[Index].ZZ_ACC_CURR = "INR";
				accDetail[Index].ZZ_ACC_COST = "0";
				accDetail[Index].ZZ_ADD_ACC = "OWN ARRANGEMENT";
				accDetail[Index].ZZ_HOTEL_KEY="";
				accDetail[Index].ZZ_NAME="OWN ARRANGEMENT";
				accDetail[Index].ZZ_ADDRESS="OWN ARRANGEMENT";
				accDetail[Index].ZZ_COST="0";
				accDetail[Index].ZZ_TAX="0";
				accDetail[Index].ZZ_TOTAL="0";
				accDetail[Index].ZZ_UNITS="PERDAY";
			break;
		default:
			;
		}
		this.getView().getModel("new").refresh(true);
	},
//	======================================END OF EVENT =============================================
//	=====================================FUNCTION=============================================

	//re-assign
	reAssign: function(sTravelRequest,sType,sPernr,sText,sSmodid,oThis){

		var sUrl = sServiceUrl + "ReqAssign?ZZ_TRV_REQ='{0}'&ZZ_TRV_KEY='{1}'&ZZ_PERNR='{2}'&ZZ_COMMENTS='{3}'&ZZ_MODID='{4}'&ZZ_SMODID='{5}'&$format=json";
		sUrl = sUrl.replace("{0}", sTravelRequest);
		sUrl = sUrl.replace("{1}", sType);
		sUrl = sUrl.replace("{2}", sPernr);
		sUrl = sUrl.replace("{3}", sText);
		sUrl = sUrl.replace("{4}", "ACOM");
		sUrl = sUrl.replace("{5}", sSmodid);
		var get = $.ajax({
			cache: false,
			url: sUrl,
			type: "GET"
		});
		get.done(function(result){
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oThis);
			alert("Request(s) is successfully re-assign !");
//			oComponent.getModel().refresh();
		});
		get.fail(function(err) {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oThis);
			alert("Error occurs");
		});
	},
	// get admin group
	getAdGroup: function(ZZ_PERNR,ZZ_MODID,oThis){
		var sAdGroupUrl = "/ZE2E_ADMIN_GROUPSet?$filter=ZZ_PERNR+eq+'{0}'+and+ZZ_MODID+eq+'{1}'";
		sAdGroupUrl = sAdGroupUrl.replace("{0}", ZZ_PERNR);
		sAdGroupUrl = sAdGroupUrl.replace("{1}", ZZ_MODID);
		oComponent.getModel().read(sAdGroupUrl,{
			success : jQuery.proxy(function(mResponse) {
				oThis.getView().getModel("listAcc").setProperty("/AdminRole",mResponse.results);
				if(!sap.ui.getCore().getModel("accAdminData")){
					var searchString =  oThis.getView().byId("idSearch").getValue();
					oThis.getFilter("NEW",searchString);
//					sap.ui.project.e2etm.util.StaticUtility.setBusy(true,this);	

				}else{

					var searchString =  oThis.getView().byId("idSearch").getValue();
					var filterTab = sap.ui.getCore().getModel("accAdminData").getData().filterTab;
					oThis.getFilter(filterTab,searchString);
				}
//				oThis.getListAdmin('01',"",oThis.getView().getModel("listAcc").getData().AdminRole,"01",this);

			}, this),
			error : jQuery.proxy(function(error) {
				jQuery.sap.require("sap.m.MessageToast");
			}, this)
		});
	},

	//get accommodation info
	getAccInfo: function(sPernr,sTravelRequest,sVersion,sType,ZZ_DEP_TYPE,sCountry){
		var oThis = this;			
		var sTravelUrl = "TRV_HDRSet(ZZ_PERNR='{0}',ZZ_DEP_REQ='{1}',ZZ_VERSION='{2}',ZZ_TRV_TYP='{3}')?$expand=DEP_EMP";
		sTravelUrl = sTravelUrl.replace("{0}",sPernr);
		sTravelUrl = sTravelUrl.replace("{1}",sTravelRequest);
		sTravelUrl = sTravelUrl.replace("{2}","");
		sTravelUrl = sTravelUrl.replace("{3}",sType);
//		// acc
		var sAccUrl = "ZE2E_ACC_HDRSet(ZZ_TRV_REQ='{0}',ZZ_OWNER='{1}',ZZ_TRV_KEY='{2}',ZZ_VERSION='{3}')?$expand=ZE2E_ACC_DETAILSet,ZE2E_BVISA_HDR/DEP_EMP";
		sAccUrl = sAccUrl.replace("{0}",sTravelRequest); 
		sAccUrl = sAccUrl.replace("{1}",sPernr); 
		sAccUrl = sAccUrl.replace("{2}",sType);         
		sAccUrl = sAccUrl.replace("{3}",sVersion);        	
//		DmsDocsSet
		var sAccTypeUrl = "ZE2E_ACC_TYPESet";
		//currency
		var sCurrencyURL = "GetF4Help?Srch_help='F4_TCURC_ISOCD'&ZZ_SMODID='{0}'&$format=json";
		sCurrencyURL = sCurrencyURL.replace("{0}",ZZ_DEP_TYPE); 
		//hotel 
//		var sHotelURL = "ZE2E_ACC_HOTELSet";
//		var sHotelURL = "ZE2E_ACC_HOTELSet?$filter=ZZ_CNTY+eq+'DE'";
		var sHotelURL = "ZE2E_ACC_HOTELSet?$filter=ZZ_CNTY+eq+'"+sCountry+"'";
//		sHotelURL.replace("{0}", sCountry);
		// Create batches
		var oBatch0 = oComponent.getModel().createBatchOperation(sTravelUrl, "GET");
		var oBatch1 = oComponent.getModel().createBatchOperation(sAccUrl, "GET");
		var oBatch2 = oComponent.getModel().createBatchOperation(sAccTypeUrl, "GET");
		var oBatch3 = oComponent.getModel().createBatchOperation(sCurrencyURL, "GET");
		var oBatch4 = oComponent.getModel().createBatchOperation(sHotelURL, "GET");
		// Read batches
		oComponent.getModel().addBatchReadOperations([oBatch0,oBatch1,oBatch2,oBatch3,oBatch4]);
		oComponent.getModel().submitBatch(
				function(oResult){
					var oData = {
							Header:"",
							Detail:{
								ZE2E_ACC_DETAILSet:"",
							},
							AccType:"",
							Currency:"",
							Hotel: "",
					};
					oData.Header = oResult.__batchResponses[0].data;
					oData.Detail = oResult.__batchResponses[1].data;
					oData.Detail.ZE2E_ACC_DETAILSet = oResult.__batchResponses[1].data.ZE2E_ACC_DETAILSet.results;
					oData.AccType = oResult.__batchResponses[2].data;
					oData.Currency = oResult.__batchResponses[3].data;
					oData.Hotel = oResult.__batchResponses[4].data;

					if(	 oData.Detail.ZE2E_BVISA_HDR){						
						oData.Header.DEP_EMP.ZZ_DEP_NAME = oData.Detail.ZE2E_BVISA_HDR.DEP_EMP.ZZ_DEP_NAME;
						oData.Header.DEP_EMP.ZZ_DEP_DEPT = oData.Detail.ZE2E_BVISA_HDR.DEP_EMP.ZZ_DEP_DEPT;
						oData.Header.DEP_EMP.ZZ_DEP_PERNR = oData.Detail.ZE2E_BVISA_HDR.DEP_EMP.ZZ_DEP_PERNR;
						oData.Header.ZZ_REINR = oData.Detail.ZE2E_BVISA_HDR.ZZ_VISA_REQ;
						oData.Header.ZZ_DATV1 = oData.Detail.ZE2E_BVISA_HDR.ZZ_VISA_SDATE;
						oData.Header.ZZ_DATB1 = oData.Detail.ZE2E_BVISA_HDR.ZZ_VISA_EDATE;			
						oData.Header.ZZ_LAND1 = oData.Detail.ZE2E_BVISA_HDR.ZZ_VISA_TOCNTRY;
						oData.Header.ZZ_LOCATION_END = "N.A";
						sap.ui.project.e2etm.util.StaticUtility.getDocumentList(oThis,oData.Detail.ZE2E_BVISA_HDR.ZZ_VISA_REQ, oData.Detail.ZZ_OWNER,"ACC","ACOM",oData.Header.ZZ_LAND1);
					}else{
						sap.ui.project.e2etm.util.StaticUtility.getDocumentList(oThis,oData.Header.ZZ_DEP_REQ, oData.Detail.ZZ_OWNER,"ACC","ACOM",oData.Header.ZZ_LAND1);
					}
					oThis.getView().getModel("new").setData(oData,true);

					// get document list
//					sap.ui.project.e2etm.util.StaticUtility.getDocumentList(oThis,oData.Header.ZZ_DEP_REQ, oData.Detail.ZZ_OWNER,"ACOM",sModid,oData.Header.ZZ_LAND1);
				
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oThis);
				},
				function(error){
					alert("No data found");
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oThis);
				});	
	},

	//check date overclap
	checkDateOverclap: function(datePre ,dateCheck){
		datePre = new Date(datePre.substr(0,4), datePre.substr(4,2) - 1, datePre.substr(6,2));
		dateCheck = new Date(dateCheck.substr(0,4), dateCheck.substr(4,2) - 1, dateCheck.substr(6,2));
		if (dateCheck >= datePre) {
			return true;
		} else {
			return false;
		}
	},

	//check date start
	checkDateStart: function(reqStartDate, oTable){
		var currStartDate = oTable.getItems()[0].getCells()[1].getValue();
		if(!this.checkDateOverclap(reqStartDate, currStartDate)){
			oTable.getItems()[0].getCells()[1].setValueState("Error");
			return 1;
		}else{
			oTable.getItems()[0].getCells()[1].setValueState("None");
		}
		return 0;
	},

	//check date end
	checkDateEnd: function(reqEndDate, oTable){
		var tableLength = oTable.getItems().length - 1 ;
		var currEndDate = oTable.getItems()[tableLength].getCells()[2].getValue();
		if(!this.checkDateOverclap(currEndDate, reqEndDate)){
			oTable.getItems()[tableLength].getCells()[2].setValueState("Error");
			return 2;
		}else{
			oTable.getItems()[tableLength].getCells()[2].setValueState("None");
		}
		return 0;
	},

	// check error  table detail 
	checkTableDetail: function(canContinue,oTable){


		for(var i=0; i<= oTable.getItems().length -1; i++){
			var oItem = oTable.getItems()[i];
			//incase of 
			if (oTable.getItems()[i].getCells()[0].getSelectedKey() == 'OWN' || 
				oTable.getItems()[i].getCells()[0].getSelectedKey() == 'OHA'){
				
			}else{
				
				var currStartDate1 = oTable.getItems()[i].getCells()[1].getValue();
				var currEndDate1 = oTable.getItems()[i].getCells()[2].getValue();


				//check start date end date
				if(!this.checkDateOverclap(currStartDate1,currEndDate1)){
					oTable.getItems()[i].getCells()[1].setValueState("Error");
					oTable.getItems()[i].getCells()[2].setValueState("Error");
					return 3;
				}else{
					oTable.getItems()[i].getCells()[1].setValueState("None");
					oTable.getItems()[i].getCells()[2].setValueState("None");
				}
				//check field cost is number.
				var sCost = oTable.getItems()[i].getCells()[4].getValue();
				if(!Number(sCost) && Number(sCost) != 0){
					oTable.getItems()[i].getCells()[4].setValueState("Error");
					return 5;
				}else{
					oTable.getItems()[i].getCells()[4].setValueState("None");
				}
				//check tax
				var sTax = oTable.getItems()[i].getCells()[5].getValue();
				if(!Number(sTax) && Number(sTax) != 0){
					oTable.getItems()[i].getCells()[5].setValueState("Error");
					return 10;
				}else{
					oTable.getItems()[i].getCells()[5].setValueState("None");
				}
				//check unit
				if(oTable.getItems()[i].getCells()[6].getSelectedKey() == ""){
//					oTable.getItems()[i].getCells()[5].setValueState("Error");
					return 6;
				}else{
//					oTable.getItems()[i].getCells()[5].setValueState("None");
				}

				//check total
				if(oTable.getItems()[i].getCells()[7].getValue() == ""){
					oTable.getItems()[i].getCells()[7].setValueState("Error");
					return 7;
				}else{
					oTable.getItems()[i].getCells()[7].setValueState("None");
				}

				//check hotel
				if(oTable.getItems()[i].getCells()[8].getValue() == ""){
					oTable.getItems()[i].getCells()[8].setValueState("Error");
					return 8;
				}else{
					oTable.getItems()[i].getCells()[8].setValueState("None");
				}
//				if(){
//				if(this.checkHotel(this.getView().getModel("new").getData(), inputValue))
//				}


				//check address
				if(oTable.getItems()[i].getCells()[9].getValue() == ""){
					oTable.getItems()[i].getCells()[9].setValueState("Error");
					return 9;
				}else{
					oTable.getItems()[i].getCells()[9].setValueState("None");
				}
//				check over clap



				if(i < oTable.getItems().length -1 ){
					var currStartDate2 = oTable.getItems()[i+1].getCells()[1].getValue();
					var currEndDate2 = oTable.getItems()[i+1].getCells()[2].getValue();
					if(!this.checkDateOverclap(currEndDate1,currStartDate2)){
						oTable.getItems()[i].getCells()[2].setValueState("Error");
						oTable.getItems()[i+1].getCells()[1].setValueState("Error");
						return 4;
					}else{
						oTable.getItems()[i].getCells()[2].setValueState("None");
						oTable.getItems()[i+1].getCells()[1].setValueState("None");
					}
				}
			}
			return 0;
			}
			

	},

	// display edialog error
	displayError: function(canContinue){
		switch(canContinue){
		case 1 :
			sap.m.MessageToast.show("The first Start Date of this Accommodation must be the same or after Travel request!");
			break;
		case 2 : 
			sap.m.MessageToast.show("The last End Date of this Accommodation must be the same or before Travel request!");
			break;
		case 3 : 
			sap.m.MessageToast.show("Start Date must be before End Date!");
			break;
		case 4 : 
			sap.m.MessageToast.show("End Date must be the same or before the next accommodation Start Date!");
			break;
		case 5 : 
			sap.m.MessageToast.show("Cost must be a number!");
			break;	
		case 6: 
			sap.m.MessageToast.show("Please select unit!");
			break;
		case 7: 
			sap.m.MessageToast.show("Total cost must not be blank!");
			break;
		case 8: 
			sap.m.MessageToast.show("Hotel must not be blank!");
			break;
		case 9: 
			sap.m.MessageToast.show("Address must not be blank!");
			break;
		case 10: 
			sap.m.MessageToast.show("Tax must not be blank!");
			break;
		}
	},

	//save 
	sendPostRequest: function(sMDRole,sMDAction,canContinue){

//		this.oBusyDialog.open();
		var mAccInfo = {
				ZE2E_ACC_DETAILSet:"",
				ZZ_OWNER: "",
				ZZ_TRV_KEY: "",
				ZZ_TRV_REQ: "",
				ZZ_VERSION: " ",
		};
		mAccInfo.ZE2E_ACC_DETAILSet  = this.getView().getModel("new").getData().Detail.ZE2E_ACC_DETAILSet;
		mAccInfo.ZZ_OWNER  = this.getView().getModel("new").getData().Detail.ZZ_OWNER;
		mAccInfo.ZZ_TRV_KEY  = this.getView().getModel("new").getData().Detail.ZZ_TRV_KEY;
		mAccInfo.ZZ_TRV_REQ = this.getView().getModel("new").getData().Detail.ZZ_TRV_REQ;
		mAccInfo.ZZ_VERSION  = this.getView().getModel("new").getData().Detail.ZZ_VERSION;
		//check hotel


//		= this.getView().getModel("new").getData().Detail;
//		mAccInfo.ZE2E_ACC_DETAILSet = mAccInfo.ZE2E_ACC_DETAILSet.results;
//		delete mAccInfo.ZE2E_ACC_DETAILSet.results;
//		try{
//		var sText = sap.ui.getCore().byId('submitDialogTextarea').getValue();
//		m2e2_Cargo.ZZ_COMMENT = sText;
//		}catch(err){} ;
		if(canContinue == 0){
			sap.ui.project.e2etm.util.StaticUtility.setBusy(true,this);
			// Send OData Create request
			oThis =this;
			var oModel = this.getView().getModel();
//			var sMDModid = oThis.getView().getModel("profile").getData().currentRole;
			var sMDModid = "ACOM";
			oModel.setHeaders({role: sMDRole,action: sMDAction, modid: sMDModid});
			oModel.create("/ZE2E_ACC_HDRSet", mAccInfo, {
				success : jQuery.proxy(function(mResponse) {
					jQuery.sap.require("sap.m.MessageToast");
					// ID of newly inserted product is available in mResponse.ID
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oThis);
					if( sMDAction == "00" && sMDRole == "03"){	//Save
						sap.m.MessageToast.show("The request has been saved.");
					}else if(sMDAction == '09'){
						sap.m.MessageToast.show("The request has been canceled.");
//						sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
					}else{
						sap.m.MessageToast.show("The request has been submitted.");
						sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
					}

				}, this),
				error : jQuery.proxy(function(error) {
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oThis);					
//					var obsoleteRequest = error.response.body.indexOf("OBSOLETE_REQUEST");					
					if (obsoleteRequest != undefined) {
						sap.m.MessageToast.show("This request is obsolete!");
					} else {
						sap.m.MessageToast.show("Error!");	
					}
				}, this)
			});
		}else{
//			sap.m.MessageToast.show("Check the error!" );
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false,this);
		}// End if (canContinue)

	},

	// check error
	checkError: function(canContinue){
//		0: true
//		1: start wrong
//		2: End wrong
//		3: start>end
//		4: end_i> start_i +1
//		5: cost

		var oTable = this.getView().byId("dependentTableId");
		canContinue = this.checkDateStart(this.getView().getModel("new").getProperty("/Header/ZZ_DATV1"), oTable);
		if(canContinue == 0){
			canContinue = this.checkDateEnd(this.getView().getModel("new").getProperty("/Header/ZZ_DATB1"), oTable);
			if(canContinue == 0){
				canContinue = this.checkTableDetail(canContinue, oTable);
			}
		}
		this.displayError(canContinue);
		return canContinue;
	},

	//add colum
	addColum: function(){
		var oData = this.getView().getModel("new").getData();
		var sDate = new Date();
		var sIndex = oData.Detail.ZE2E_ACC_DETAILSet.length + 1;
		var dataItem = {
				ZZ_TRV_REQ: oData.Detail.ZZ_TRV_REQ,
				ZZ_OWNER: oData.Detail.ZZ_OWNER,
				ZZ_TRV_KEY: oData.Detail.ZZ_TRV_KEY,
				ZZ_VERSION: oData.Detail.ZZ_VERSION,
				SEQNR: String(sIndex),
				ZZ_ACC_TYP : "HOTEL",		
				BEGDA: sDate,
				ENDDA: sDate,
				ZZ_ACC_CURR: "INR",
				ZZ_ACC_COST: "",
				ZZ_ADD_ACC: "",
				ZZ_HOTEL_KEY:"",
				ZZ_NAME:"",
				ZZ_ADDRESS:"",
				ZZ_COST:"0",
				ZZ_TAX:"0",
				ZZ_TOTAL:"0",
				ZZ_UNITS:"PERDAY",
		};
		oData.Detail.ZE2E_ACC_DETAILSet.push(dataItem);
		this.getView().getModel("new").setData(oData);
	},

	//delete colum
	deleteColum: function(){
		var iItem = this.getView().byId("dependentTableId").getSelectedItem();
		var iIndex = this.getView().byId("dependentTableId").indexOfItem(iItem);
		var oData = this.getView().getModel("new").getData();
		if( iIndex == -1 ){
			sap.m.MessageToast.show("Please select one row!");
		}else{
			var oData = this.getView().getModel("new").getData();
//			oData.Detail.ZE2E_ACC_DETAILSet.results.splice(oData.Detail.ZE2E_ACC_DETAILSet.results.length,1);
			oData.Detail.ZE2E_ACC_DETAILSet.splice(iIndex,1);
			for(var i=0;i<oData.Detail.ZE2E_ACC_DETAILSet.length;i++){
				oData.Detail.ZE2E_ACC_DETAILSet[i].SEQNR = (i + 1).toString();
			}
			this.getView().getModel("new").setData(oData);
		}
//		oData.Detail.ZE2E_ACC_DETAILSet.splice(oData.Detail.ZE2E_ACC_DETAILSet.length-1,1);
//		this.getView().getModel("new").setData(oData);
	},

	//set activate component for admin or employee
	//true = admin
	//false = employee
	setActivate: function(currRole,currFilter){
//		this.getView().getModel("new").setProperty("/Role",currRole);
//		this.getView().getModel("new").setProperty("/currFilter",currFilter);

		
		
		if( currRole == 'EMP' ){	// Open
			this.getView().byId("btnSave").setVisible(false);
			this.getView().byId("btnSubmit").setVisible(false);
			this.getView().byId("btnCancel").setVisible(false);
		}else{	// Change
			if(currFilter == "CLOSED" || currFilter == "CANCELLED"){
				this.getView().byId("btnSave").setVisible(false);
				this.getView().byId("btnSubmit").setVisible(false);
				this.getView().byId("btnCancel").setVisible(false);
			}else{
				this.getView().byId("btnSave").setVisible(false);
				this.getView().byId("btnSubmit").setVisible(true);
				this.getView().byId("btnCancel").setVisible(true);
			}
			
		}	
	},
	onAdGroupSelect: function(evt){
		var key = this.getView().byId("idAdGroupSelect").getSelectedKey();
		this.getView().getModel("listAcc").setProperty("/AdminRole",key);
		this.getListAdmin('01',"",this.getView().getModel("listAcc").getData().AdminRole,"01",this);
		this.getView().byId("idIconTabBarAccAdmin").setSelectedKey("NEW");
/*Changes done by Bharadwaj for issue correction*/		
		this.getView().byId("idIconTabBarAccAdmin").getItems()[1].setCount("");
		this.getView().byId("idIconTabBarAccAdmin").getItems()[2].setCount("");
		this.getView().byId("idIconTabBarAccAdmin").getItems()[3].setCount("");
		this.getView().byId("idIconTabBarAccAdmin").getItems()[4].setCount("");
		this.getView().byId("idIconTabBarAccAdmin").getItems()[5].setCount("");
		this.getView().byId("btnReservation").setVisible(false);
		if(key == "ACCI")
			this.getView().byId("btnReservation").setVisible(true);
/*Changes done by Bharadwaj for issue correction*/		
	},

	//-----------------------------ADMIN------------------------

	clearSearch:function(){
		this.getView().byId("idSearchNewRequest").setProperty('value','');
	},

	clearData:function(){
		if( this.getView().getModel("new") ){
			var oData = this.getView().getModel("new").getData();
			oData = {};
			this.getView().getModel("new").setData(oData);
			this.getView().getModel("new").destroy();
		}
	},
	// get acc type
//	getaccType: function(){
//	var sAccUrl = "/ZE2E_ACC_HDRSet?$filter=ZZ_TRV_REQ+eq+'{0}'+and+ZZ_OWNER+eq+'{1}'+and+ ("+ link+ ") +and+ZZ_VERSION+eq+'{3}'&$expand=TRV_HDR,ZE2E_ACC_DETAILSet,ZE2E_BVISA_HDR/DEP_EMP ";
//	},

	//get list
	getListAdmin: function(sRole,ZZ_OWNER,sModid_list,sAction,oThis){

   
		if(this.getView().getModel("listAcc").getData().RoleAdmin==true){
			var smodid_list_ACCO = [];
			var sACCO = {
					ZZ_AD_GROUP: this.getView().byId("idAdGroupSelect").getSelectedKey(),
					ZZ_MODID: "ACOM",
					ZZ_PERNR: "",
					ZZ_SMODID: "",
			};
			smodid_list_ACCO.push(sACCO);
			var link = oThis.createLink(smodid_list_ACCO);
		}else{

			var link = oThis.createLink(sModid_list);
		}

		var sAccUrl = "/ZE2E_ACC_HDRSet?$filter=ZZ_TRV_REQ+eq+'{0}'+and+ZZ_OWNER+eq+'{1}'+and+ ("+ link+ ") +and+ZZ_VERSION+eq+'{3}'&$expand=TRV_HDR,ZE2E_ACC_DETAILSet,ZE2E_BVISA_HDR/DEP_EMP,ZE2E_TR_STATUS";
//		var sAccUrl = "/ZE2E_ACC_HDRSet?$filter=ZZ_TRV_REQ+eq+'{0}'+and+ZZ_OWNER+eq+'{1}'+and+ZZ_TRV_KEY+eq+'{2}'+and+ZZ_VERSION+eq+'{3}'&$expand=TRV_HDR,ZE2E_ACC_DETAILSet";
		sAccUrl = sAccUrl.replace("{0}", sRole);
		sAccUrl = sAccUrl.replace("{1}", ZZ_OWNER);
//		sAccUrl = sAccUrl.replace("{2}", sModid);
		sAccUrl = sAccUrl.replace("{3}", sAction);
		oComponent.getModel().read(sAccUrl,{
			success : jQuery.proxy(function(mResponse) {       
				if(mResponse.results.length != 0){
					
					for(i=0;i<mResponse.results.length;i++){
						if(mResponse.results[i].ZE2E_BVISA_HDR){
							mResponse.results[i].TRV_HDR.ZZ_REINR = mResponse.results[i].ZE2E_BVISA_HDR.ZZ_VISA_REQ;
							mResponse.results[i].TRV_HDR.ZZ_PERNR = mResponse.results[i].ZE2E_BVISA_HDR.ZZ_PERNR;//Changes done by Bharadwaj for issue correction
							mResponse.results[i].TRV_HDR.ZZ_LAND1 = mResponse.results[i].ZE2E_BVISA_HDR.ZZ_VISA_TOCNTRY;
							mResponse.results[i].TRV_HDR.ZZ_DATV1 = mResponse.results[i].ZE2E_BVISA_HDR.ZZ_VISA_SDATE;
							mResponse.results[i].TRV_HDR.ZZ_DATB1 = mResponse.results[i].ZE2E_BVISA_HDR.ZZ_VISA_EDATE;
							mResponse.results[i].TRV_HDR.ZZ_ZDURN = sap.ui.project.e2etm.util.StaticUtility.substractDateTypeString(mResponse.results[i].ZE2E_BVISA_HDR.ZZ_VISA_PEDATE, mResponse.results[i].ZE2E_BVISA_HDR.ZZ_VISA_PSDATE);
							mResponse.results[i].TRV_HDR.ZZ_FMLOC = "N.A";
							mResponse.results[i].TRV_HDR.ZZ_LOCATION_END = mResponse.results[i].ZE2E_BVISA_HDR.ZZ_VISA_TOCNTRY;
						}
					}

				}
				/*Changes done by Bharadwaj for count*/
                this.setCount(mResponse.results.length);
                /*Changes done by Bharadwaj for count*/
				oThis.getView().getModel("listAcc").setProperty("/results",mResponse.results);
				if(oThis["BusyDialog"] != null){
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oThis);	
				}

			}, this),
			error : jQuery.proxy(function(error) {
				jQuery.sap.require("sap.m.MessageToast");
			}, this)
		});
	
	},
	/*Changes done by Bharadwaj for count*/	
	setCount:function(count){
		var key = this.getView().byId("idIconTabBarAccAdmin").getSelectedKey();
		switch(key){
		
		
	case "NEW" :
				
		this.getView().byId("idIconTabBarAccAdmin").getItems()[0].setCount(count);
		break;
		//CHANGED
	case "CHANGED" : 
			
		this.getView().byId("idIconTabBarAccAdmin").getItems()[1].setCount(count);
		
		break;
		//VISA
		//action : 10	Sent Itinerary
		//role : 03 admin
	case "VISA" :
		
		this.getView().byId("idIconTabBarAccAdmin").getItems()[2].setCount(count);
		break;
		//CANCELLED
	case "CANCELLED" :
				
		this.getView().byId("idIconTabBarAccAdmin").getItems()[3].setCount(count);
		break;
		//CLOSE
	case "CLOSED" :
				
		this.getView().byId("idIconTabBarAccAdmin").getItems()[4].setCount(count);
		break;
		//ALL
	case "ALL" :

			
		this.getView().byId("idIconTabBarAccAdmin").getItems()[5].setCount(count);
		

		break;
	}
		
	},
/*Changes done by Bharadwaj for count*/
	//get filter
	getFilter: function(key,searchString){

		if(!sap.ui.getCore().getModel("accAdminData")){
			var oModel = new sap.ui.model.json.JSONModel();		
			oModel.setProperty("/visaMode",false);
			sap.ui.getCore().setModel(oModel, "accAdminData");
		}else{
			sap.ui.getCore().getModel("accAdminData").setProperty("/visaMode", false);
		}
		// display request status for all requets pane
		if(key == "ALL"){
			this.getView().byId("idToLocation").setVisible(false);
			this.getView().byId("idStatus").setVisible(true);
			this.getView().byId("idToCountry").setVisible(false);
		}else{
			this.getView().byId("idToLocation").setVisible(true);
			this.getView().byId("idStatus").setVisible(false);
			this.getView().byId("idToCountry").setVisible(true);
		}
		
		switch(key){
		//NEW
		case "NEW" :
			sap.ui.project.e2etm.util.StaticUtility.setBusy(true,this);
			this.getView().byId("idColTravelReq").setText("Travel Request");
			var smodid_list = this.getView().getModel("listAcc").getData().AdminRole;
			this.getListAdmin('01',searchString,smodid_list,"01",this);
			

			break;
			//CHANGED
		case "CHANGED" : 
			sap.ui.project.e2etm.util.StaticUtility.setBusy(true,this);
			//action = 15
//			this.getListAdmin('03',"","ACCI","01");
			this.getView().byId("idColTravelReq").setText("Travel Request");
			var smodid_list = this.getView().getModel("listAcc").getData().AdminRole;
			
			this.getListAdmin('03',searchString,smodid_list,"04",this);
			

			
			break;
			//VISA
			//action : 10	Sent Itinerary
			//role : 03 admin
		case "VISA" :
			sap.ui.project.e2etm.util.StaticUtility.setBusy(true,this);
			sap.ui.getCore().getModel("accAdminData").setProperty("/visaMode", true);
			this.getView().byId("idColTravelReq").setText("Visa Plan");
			var smodid_list = this.getView().getModel("listAcc").getData().AdminRole;

			this.getListAdmin('03',searchString,smodid_list,"10",this);


			break;
			//CANCELLED
		case "CANCELLED" :
			sap.ui.project.e2etm.util.StaticUtility.setBusy(true,this);
			this.getView().byId("idColTravelReq").setText("Travel Request");
			var smodid_list = this.getView().getModel("listAcc").getData().AdminRole;

			this.getListAdmin('03',searchString,smodid_list,"09",this);
			

			break;
			//CLOSE
		case "CLOSED" :
			if(searchString == ""){
				this.getView().byId("idIconTabBarAccAdmin").getItems()[4].setCount("");
				this.getView().getModel("listAcc").setProperty("/results",[]);
				sap.m.MessageToast.show("Please enter employee number!");
			}else{
				sap.ui.project.e2etm.util.StaticUtility.setBusy(true,this);
				this.getView().byId("idColTravelReq").setText("Travel Request");
				var smodid_list = this.getView().getModel("listAcc").getData().AdminRole;
				
				this.getListAdmin('03',searchString,smodid_list,"01",this);
			}
			break;
			//ALL
		case "ALL" :

			this.getView().byId("idColTravelReq").setText("Travel Request");
			if(searchString == ""){
/*Changes done by Bharadwaj for issue correction*/
				this.getView().byId("idIconTabBarAccAdmin").getItems()[5].setCount("");
				this.getView().getModel("listAcc").setProperty("/results",[]);
/*Changes done by Bharadwaj for issue correction*/				
				sap.m.MessageToast.show("Please enter employee number!");
			}else{
				sap.ui.project.e2etm.util.StaticUtility.setBusy(true,this);
				var smodid_list = this.getView().getModel("listAcc").getData().AdminRole;
				
				this.getListAdmin('',searchString,smodid_list,"",this);
			}

			break;
		}
		try {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false,this);
		} catch(exc) {}
	},
	// PREPARE role link
	createLink: function(slist){
		var slink ="";

		if(!Array.isArray(slist)){
			slink  = "ZZ_TRV_KEY+eq+'"+slist+"'";
		}else{
			for(i=0;i<slist.length;i++){
				var a = slist[i].ZZ_AD_GROUP;
				if(i==0){
					slink = slink = "ZZ_TRV_KEY+eq+'"+a+"'";
				}else{
					slink = slink + "+or+ZZ_TRV_KEY+eq+'"+a+"'";	
				}			
			}
		}

		return slink;
	},
	removeColum: function(){
		var oColumn = this.getView().byId("idCost");
		this.getView().byId("dependentTableId").removeColumn(oColumn);
	},
	
	onRefresh: function(evt){
		var oThis = this;
		
		var that = evt.getSource();
		setTimeout(function() {
			var searchString = "";
			var key = oThis.getView().byId("idIconTabBarAccAdmin").getSelectedKey();
			oThis.getFilter(key,searchString);
			that.hide();
		}, 1000);
	},
	
	onMenu : function(evt) {
		menuRef = sap.ui.project.e2etm.util.StaticUtility.customMenuOpen(this, evt);
	},
	onMenuItemSelect : function(evt) {
		var oController = this;
		var aFilters = [];
		var aSorters = [];
		var menu = oController.getView().byId("menu_settings");
		var table = this.getView().byId("idlistAdmin");
		var sPath = oController.findProperty();
		var oBinding = table.getBinding("items");
		sap.ui.project.e2etm.util.StaticUtility.customMenuItemSelect(oController, evt, menuRef, sPath, oBinding);
	},
	findProperty : function() {
		var sPath;
		switch (menuRef.getText()) {
		case "From Date":
			sPath = "TRV_HDR/ZZ_DATV1";
			
			break;
		case "To Country":
			sPath = "TRV_HDR/ZZ_LAND1";
			break;
		}
		return sPath;
	
		}
	,
	onBack: function(){
		sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
	},
	//-----------------------------END OF EMPLOYEE---------------------
	
	onExpectedTrvelPress: function(){
		sap.ui.core.routing.Router.getRouter("MyRouter").navTo("countexpectedtravel");
	},
	onEmployee_Click:function(){
		sap.ui.core.routing.Router.getRouter("MyRouter").navTo("chplemployeetraveldetailsreport");
	},
	onTravelEstimatePress : function(){
		sap.ui.core.routing.Router.getRouter("MyRouter").navTo("travelestimate");
	},
//	====================================END OF FUNCTION=========================================
onReservation:function(evt){
	//
	sessionStorage.currentRole = sap.ui.getCore().getModel("profile").getData().currentRole;
	var router = sap.ui.core.routing.Router.getRouter("MyRouter");
	var url = router.getURL("AccmTool");
	var url1 = window.document.URL.split("#");
	url = url1[0] + "#/" + url;
	window.open(url, "_blank");
	
},
onBookClick:function(evt){
	sessionStorage.currentRole = sap.ui.getCore().getModel("profile").getData().currentRole;
	var listItem = evt.getSource().getParent();
	var data = listItem.getBindingContext("listAcc").getModel().getProperty(listItem.getBindingContext("listAcc").sPath);
	sap.ui.core.routing.Router.getRouter("MyRouter").navTo("reservation",{reinr:data.ZZ_TRV_REQ,pernr:data.ZZ_OWNER});
},
onBookRooms:function(evt){
	sessionStorage.currentRole = sap.ui.getCore().getModel("profile").getData().currentRole;
	var reinr = this.getView().getModel("new").getData().Header.ZZ_REINR;
	var empNo = this.getView().getModel("new").getData().Header.DEP_EMP.ZZ_DEP_PERNR;
	sap.ui.core.routing.Router.getRouter("MyRouter").navTo("reservation",{reinr:reinr,pernr:empNo});
}
	


});