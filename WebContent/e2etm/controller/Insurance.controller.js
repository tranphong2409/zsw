	jQuery.sap.require("sap.ui.project.e2etm.util.Formatter");
	jQuery.sap.require("sap.ui.project.e2etm.util.StaticUtility");
	jQuery.sap.require("sap.ui.project.e2etm.util.FileUpload");
	jQuery.sap.require("sap.m.MessageToast");
	
	sap.ui.controller("sap.ui.project.e2etm.controller.Insurance", {
		/*---------------------------------------------------------------------------------------------------------------
		 * 														Screen event
		 ---------------------------------------------------------------------------------------------------------------*/		
		onInit : function() {
			sap.ui.core.routing.Router.getRouter("MyRouter").attachRoutePatternMatched(this.onRouteMatched, this);
			this.getView().setModel(sap.ui.getCore().getModel("profile"), "profile");
			this.getView().setModel(sap.ui.getCore().getModel("global"), "global");
		},
	
		onRouteMatched:function(oEvent){
			if( oEvent.getParameter("name") == "insurance" ){
				sap.ui.project.e2etm.util.StaticUtility.setBusy(true,this);
				if(sap.ui.getCore().getModel("profile").getData().currentRole == "EMP"){
					if( sap.ui.getCore().getModel("global").getData().action == "00" ){	//Create
						this.doCreate();
					}else{	//Change
						this.doModify();
						
					}
					this.displayNext();
				}
			}else if(oEvent.getParameter("name") == "insuranceAdmin"){
				this.displaySubmit();
				this.doFilter('');
			}
		},
	
		onChange: function(oEvent) {
			sap.ui.project.e2etm.util.FileUpload.onChange(oEvent,this);
		},
	
		onUploadComplete:function(oEvent){
			this.getView().getModel("new").refresh(true);
		},
	
		onSavePress:function(oEvent){
			var sError = this.doValidation();
			if(sError == ""){
				oComponent.getModel().setHeaders({role: "01",action:"00"});
				this.sendPostRequest("00");
			}
		},
	
		onSubmitPress:function(oEvent){
			var sError = this.doValidation("01");
			if(sError == ""){
				var oRole = "";
				if( sap.ui.getCore().getModel("profile").getData().currentRole == "EMP" ){
					oRole = "01";
				}else{	//Admin
					oRole = "03";
				}
				oComponent.getModel().setHeaders({role: oRole,	action:"01"});
				this.doSubmit(oEvent);
			}
		},
	
		onNextPress:function(oEvent){
			var sError = this.doValidation();
			if(sError == ""){
				if( this.getView().byId("iconTabBarId").getSelectedKey() != this.getView().getId() + "--idIconTabFilter3" ){
					this.getView().byId("iconTabBarId").setSelectedKey(this.getView().getId() + "--idIconTabFilter3");
					this.displaySubmit();
				}else{
					this.displayNext();
				}
			}else{
				sap.m.MessageToast.show(sError);
			}
		},
	
		onCancelPress:function(oEvent){
			if( sap.ui.getCore().getModel("global").getData().action == "02" ){
				sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
			}else{
				var dialog = new sap.m.Dialog({
					title: 'Confirm',
					type: 'Message',
					content: new sap.m.Text({ text: 'Unsaved information will be lost. Do you want to cancel ?' }),
					beginButton: new sap.m.Button({
						text: 'Yes',
						press: function () {
							sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
							dialog.close();
						}
					}),
					endButton: new sap.m.Button({
						text: 'No',
						press: function () {
							dialog.close();
						}
					}),
					afterClose: function() {
						dialog.destroy();
					}
				});
				dialog.open();
			}
		},
	
		onTabBarSelect:function(oEvent){
			if( this.getView().byId("iconTabBarId").getSelectedKey() ==  this.getView().getId() + "--idIconTabFilter3" ){
				this.displaySubmit();
			}else{
				this.displayNext();
			}
		},
	
		onMasterListSelect:function(oEvent){
			sap.ui.project.e2etm.util.StaticUtility.setBusy(true,this);
			var sPath = oEvent.getSource().getSelectedItem().getBindingContext().getPath();
			var oRequest = oEvent.getSource().getModel().getProperty(sPath,null,true);
			var oData = sap.ui.getCore().getModel("global").getData();
			if(oRequest.ZE2E_REQ_STATUS.ZZ_NROLE == "01" &&
					oRequest.ZE2E_REQ_STATUS.ZZ_ACTION == "01"){
				oData.action = "01";	//Change
			}else{
				oData.action = "02";	//Open
			}
			sap.ui.getCore().getModel("global").setData(oData);
			this.doModify(oRequest);
		},
	
		onUpdateStarted:function(oEvent){
			sap.ui.project.e2etm.util.StaticUtility.setBusy(true,this);
		},
	
		onUpdateFisnish:function(oEvent){
			//Set amount of records
			this.getView().byId("idListHeader").setText("Request List (" + oEvent.getSource().getItems().length + ")");
			switch (this.getView().byId("idFilterRadio").getSelectedIndex()) {
				case 0:
					this.getView().byId("idFilterRadio").getSelectedButton().setText(oEvent.getSource().getItems().length + " New Request");
					break;
				case 1:
					this.getView().byId("idFilterRadio").getSelectedButton().setText(oEvent.getSource().getItems().length + " Extend Date");
					break;
				case 2:
					this.getView().byId("idFilterRadio").getSelectedButton().setText(oEvent.getSource().getItems().length + " Shorten Date");
					break;
				case 3:
					this.getView().byId("idFilterRadio").getSelectedButton().setText(oEvent.getSource().getItems().length + " Change Traveller");
					break;
				case 4:
					this.getView().byId("idFilterRadio").getSelectedButton().setText(oEvent.getSource().getItems().length + " Closed Request");
					break;
			}
			if( oEvent.getSource().getItems().length > 0 ){
				var sPath = oEvent.getSource().getItems()[0].getBindingContext().getPath();
				oEvent.getSource().setSelectedItem(oEvent.getSource().getItems()[0], true);
				var oRequest = oEvent.getSource().getModel().getProperty(sPath,null,true);
				var oData = sap.ui.getCore().getModel("global").getData();
				if(oRequest.ZE2E_REQ_STATUS.ZZ_NROLE == "01" &&
						oRequest.ZE2E_REQ_STATUS.ZZ_ACTION == "01"){
					oData.action = "01";	//Change
				}else{
					oData.action = "02";	//Open
				}
				sap.ui.getCore().getModel("global").setData(oData);
				this.displayNoRequest(false);
				this.doModify(oRequest);
			}else{
				this.clearData();
				this.displayNoRequest(true);
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false,this);
			}
		},
	
		onQuestionSelect:function(oEvent){
			var sPath = oEvent.oSource.getParent().getBindingContext("new").getPath();
			var iMember = sPath.substr(33,1);
			var iQuestion = sPath.substr(48,1);
			var oData = oEvent.oSource.getParent().getModel("new").getData();
			oData.ZE2E_INS_HDR.ZE2E_INS_DETAILSet[iMember].ZE2E_INS_ANS[iQuestion].ZZ_ANS = oEvent.getParameter("selectedIndex") == 0 ? "X":"";
			oEvent.oSource.getParent().getModel("new").setData(oData);
		},
	
		onQuestionnaireSelect:function(oEvent){
			this.getView().byId("questionnairePanelId").setVisible(oEvent.getParameter("selectedIndex") == 0);
			var oData = oEvent.oSource.getParent().getModel("new").getData();
			oData.ZE2E_INS_HDR.ZZ_INS_QUE = oEvent.getParameter("selectedIndex") == 0 ? "X":"";
			oEvent.oSource.getParent().getModel("new").setData(oData);
		},
	
		onSponsoreSelect:function(oEvent){
			var oData = oEvent.oSource.getParent().getModel("new").getData();
			oData.ZE2E_INS_HDR.ZZ_SPONSOR = oEvent.getParameter("selectedIndex") == 0 ? "X":"";
			oEvent.oSource.getParent().getModel("new").setData(oData);
		},
	
		onSearch:function(oEvent){
			if( oEvent.getParameter("query").indexOf('/') != -1 ){	//Date input
				if( sap.ui.project.e2etm.util.StaticUtility.isDate(oEvent.getParameter("query")) ){
					this.doFilter(oEvent.getParameter("query"));
				}else{
					sap.m.MessageToast.show("Please enter date format  DD/MM/YYYY");
				}
			}else{
	//			oEvent.getSource().setValueState('None');
				this.doFilter(oEvent.getParameter("query"));
			}
		},
	
		onFileUpload:function(oEvent){
			var oData = oEvent.oSource.getParent().getModel("new").getData();
			var oFile = oEvent.getParameters("files").files[0];
			sap.ui.project.e2etm.util.StaticUtility.uploadCollectionFile(this, oFile, oData.ZZ_REINR, oData.ZZ_DEP_PERNR, "INS");
		},
	
		onSendBackPress:function(oEvent){
			this.doSendBack(oEvent);
		},
	
		onIconTabFilterSelect:function(oEvent){
			this.clearSearch();
			this.doFilter('');
		},
	
		onFilterRadioSelect:function(oEvent){
			this.clearSearch();
			this.doFilter('');
		},
	
		onFileDeleted: function(oEvent){
			// prepare FileName
			var sFileName = oEvent.getParameters("item").item.getFileName();
			var oData =  oEvent.oSource.getParent().getModel("new").getData();
			sap.ui.project.e2etm.util.StaticUtility.deleteUploadCollectionFile(this,oEvent, oData.ZZ_TRV_REQ, sFileName, "INS", oData.ZZ_DEP_PERNR, 0);
		},
	
		/*---------------------------------------------------------------------------------------------------------------
		 * 														Main flow
		 ---------------------------------------------------------------------------------------------------------------*/	
		doCreate: function(){
			var oThis = this;
			var sPernr = sap.ui.getCore().getModel("global").getData().ZZ_DEP_PERNR;
			var sRequest = sap.ui.getCore().getModel("global").getData().ZZ_TRV_REQ;
			var sType = sap.ui.getCore().getModel("global").getData().ZZ_REQ_TYP;
			var sVisaPlan = sap.ui.getCore().getModel("global").getData().ZZ_VISA_PLAN;
	
			var oBatch0 = oComponent.getModel().createBatchOperation("TRV_HDRSet(ZZ_PERNR='"+ sPernr + "',ZZ_DEP_REQ='" + sRequest + "',ZZ_VERSION='',ZZ_TRV_TYP='" + sType + "')?$expand=ZE2E_INS_HDR,TRV_HDRtoTRV_travel_Data/ZE2E_INS_DETAIL/ZE2E_INS_ANS/ZE2E_INS_QA", "GET");
			var oBatch1 = oComponent.getModel().createBatchOperation("DEP_VISA_PLANSet('" + sVisaPlan + "')?$expand=VISAPLANTOITEM", "GET");		
			var oBatch2 = oComponent.getModel().createBatchOperation("DEP_PASSPORT_INFOSet('" + sPernr + "')", "GET");
			var oBatch3 = oComponent.getModel().createBatchOperation("DEP_EMPSet('" + sPernr + "')?$expand=EMPtoEMPDEPNDNT", "GET");
			var oBatch4 = oComponent.getModel().createBatchOperation("GetDomain?DomainName='ZSLFDPD'&$format=json", "GET");
			var oBatch5 = oComponent.getModel().createBatchOperation("ZE2E_INS_QASet", "GET");
			var oBatch6 = oDataModel.createBatchOperation("GetConstant?CONST='INSR'&SELPAR='TRFR'&$format=json", "GET");
			oComponent.getModel().addBatchReadOperations([oBatch0,oBatch1,oBatch2,oBatch3,oBatch4,oBatch5,oBatch6]);
			oComponent.getModel().submitBatch(
					function(oResult){
						var oData = $.extend({}, oResult.__batchResponses[0].data, oResult.__batchResponses[1].data, 
								oResult.__batchResponses[2].data,oResult.__batchResponses[3].data);
						oData.DEPENDENT_TYPE = oResult.__batchResponses[4].data;
						oData.QUESTION = oResult.__batchResponses[5].data;
						oData.DAYS = oResult.__batchResponses[6].data.GetConstant.VALUE;
						oThis.prepareDataForCreation(oData,oData.QUESTION);
						var oModel = new sap.ui.model.json.JSONModel();
						oModel.setData(oData);
						oThis.getView().setModel(oModel, "new");
						oThis.displayNext();
						oThis.getView().byId("iconTabBarId").setSelectedKey(oThis.getView().getId() + "--idIconTabFilter0");
						//TGG1hC
						sap.ui.project.e2etm.util.StaticUtility.getDocumentList(oThis,oData.ZZ_TRV_REQ, oData.ZZ_DEP_PERNR,'INS','INSR',oData.ZZ_LAND1);
						//TGG1HC
						sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oThis);
	
					},
					function(error){
						sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oThis);
						sap.m.MessageToast.show("No data found");
					});
		},
	
		doModify:function(oRequest){
			var oThis = this;
			if( sap.ui.getCore().getModel("profile").getData().currentRole == "EMP" ){
				var sPernr = sap.ui.getCore().getModel("global").getData().ZZ_DEP_PERNR;
				var sRequest = sap.ui.getCore().getModel("global").getData().ZZ_TRV_REQ;
				var sType = sap.ui.getCore().getModel("global").getData().ZZ_REQ_TYP;
				var sVisaPlan = sap.ui.getCore().getModel("global").getData().ZZ_VISA_PLAN;
				var sVersion = '';
			}else{
				var sPernr = oRequest.ZZ_OWNER;
				var sRequest = oRequest.ZZ_TRV_REQ;
				var sType = oRequest.ZZ_TRV_KEY;
				var sVisaPlan = '';
				var sVersion = '';
			}
	
			if (sType == "VISA") {	//Visa request
				var sINS_HDR = "ZE2E_INS_HDRSet(ZZ_TRV_REQ='{0}',ZZ_OWNER='{1}',ZZ_TRV_KEY='{2}',ZZ_VERSION='{3}')?$expand=ZE2E_INS_DETAILSet/ZE2E_INS_ANS,ZE2E_REQ_STATUS,ZE2E_BVISA_HDR";
			} else {				//Travel request
				var sINS_HDR = "ZE2E_INS_HDRSet(ZZ_TRV_REQ='{0}',ZZ_OWNER='{1}',ZZ_TRV_KEY='{2}',ZZ_VERSION='{3}')?$expand=ZE2E_INS_DETAILSet/ZE2E_INS_ANS,ZE2E_REQ_STATUS";
			}
			sINS_HDR = sINS_HDR.replace("{0}", sRequest);
			sINS_HDR = sINS_HDR.replace("{1}", sPernr);
			sINS_HDR = sINS_HDR.replace("{2}", sType);
			sINS_HDR = sINS_HDR.replace("{3}", sVersion);
	
			var sTRV_HDR = "TRV_HDRSet(ZZ_PERNR='{0}',ZZ_DEP_REQ='{1}',ZZ_VERSION='{2}',ZZ_TRV_TYP='{3}')";
			sTRV_HDR = sTRV_HDR.replace("{0}", sPernr);
			sTRV_HDR = sTRV_HDR.replace("{1}", sRequest);
			sTRV_HDR = sTRV_HDR.replace("{2}", sVersion);
			sTRV_HDR = sTRV_HDR.replace("{3}", sType);
	
			var oBatch0 = oComponent.getModel().createBatchOperation(sINS_HDR, "GET");
			var oBatch1 = oComponent.getModel().createBatchOperation("DEP_VISA_PLANSet('" + sVisaPlan + "')?$expand=VISAPLANTOITEM", "GET");		
			var oBatch2 = oComponent.getModel().createBatchOperation("DEP_PASSPORT_INFOSet('" + sPernr + "')", "GET");
			var oBatch3 = oComponent.getModel().createBatchOperation("DEP_EMPSet('" + sPernr + "')?$expand=EMPtoEMPDEPNDNT", "GET");
			var oBatch4 = oComponent.getModel().createBatchOperation("GetDomain?DomainName='ZSLFDPD'&$format=json", "GET");
			var oBatch5 = oComponent.getModel().createBatchOperation("ZE2E_INS_QASet", "GET");
			var oBatch6 = oComponent.getModel().createBatchOperation(sTRV_HDR, "GET");
			var  sAmountURL= "InsAmount?ZZ_TRV_KEY='{0}'&ZZ_TRV_REQ='{1}'&$format=json";
			sAmountURL = sAmountURL.replace("{0}", sType);
			sAmountURL = sAmountURL.replace("{1}", sRequest);
			var oBatch7 = oComponent.getModel().createBatchOperation(sAmountURL, "GET");
	
			oComponent.getModel().addBatchReadOperations([oBatch0,oBatch1,oBatch2,oBatch3,oBatch4,oBatch5,oBatch6,oBatch7]);
			oComponent.getModel().submitBatch(
					function(oResult){
						var oData = $.extend({}, oResult.__batchResponses[0].data, oResult.__batchResponses[1].data, 
								oResult.__batchResponses[2].data,oResult.__batchResponses[3].data,oResult.__batchResponses[6].data);
						
						//Lock for admin if current request have been handled
						var currentRole = sap.ui.getCore().getModel("profile").getData().currentRole;
						if (currentRole != "EMP"){
							var selectedButton = oThis.getView().byId("idFilterRadio").getSelectedButton().getText();
							if (selectedButton == "New Request"  || selectedButton == "Extend Date" || 
							    selectedButton == "Shorten Date" ||	selectedButton == "Change Traveller"){
								if (oData.ZE2E_REQ_STATUS.ZZ_ACTION != "01"){
									sap.m.MessageToast.show("This request has been changed!");
									oThis.doFilter('');
								}
							}
						}
										
						oData.ZE2E_INS_HDR = oResult.__batchResponses[0].data;
						oData.ZE2E_INS_HDR.ZZ_CLEVEL = oResult.__batchResponses[7].data.InsAmount.ZZ_CLEVEL;
						oData.ZE2E_INS_HDR.ZZ_INS_AMOUNT = oResult.__batchResponses[7].data.InsAmount.ZZ_INS_RNMEDICAL_AMOUNT;
						oData.ZE2E_INS_HDR.ZZ_INS_CURR = oResult.__batchResponses[7].data.InsAmount.ZZ_INS_RNMEDICAL_CURR;
						oData.ZE2E_INS_HDR.ZZ_DAY_AMOUNT = oResult.__batchResponses[7].data.InsAmount.ZZ_INS_RMEDICAL_AMOUNT;
						oData.ZE2E_INS_HDR.ZZ_DAY_CURR = oResult.__batchResponses[7].data.InsAmount.ZZ_INS_RMEDICAL_CURR;
//						oData.ZE2E_INS_HDR.ZZ_RECOVERY_CURR = oResult.__batchResponses[7].data.InsAmount.ZZ_RECOVERY_CURR;
//						oData.ZE2E_INS_HDR.ZZ_RECOVERY_AMT = oResult.__batchResponses[7].data.InsAmount.ZZ_RECOVERY_AMT;
	
						oData.DEPENDENT_TYPE = oResult.__batchResponses[4].data;
						oData.QUESTION = oResult.__batchResponses[5].data;
						oThis.prepareDataForModification(oData);
						
						if (oData.ZZ_TRV_KEY == "VISA") {
							oData.ZZ_TRV_TYP = "VISA";
							oData.ZZ_REINR = oData.ZE2E_BVISA_HDR.ZZ_VISA_REQ;
							oData.ZZ_DATV1 = oData.ZE2E_BVISA_HDR.ZZ_VISA_PSDATE;
							oData.ZZ_DATB1 = oData.ZE2E_BVISA_HDR.ZZ_VISA_PEDATE;
							oData.ZZ_ZDURN = "NA";
							oData.ZZ_LAND1 = oData.ZE2E_BVISA_HDR.ZZ_VISA_TOCNTRY;
						}
						
						//Start of change_dye5kor
						if(oData.ZE2E_REQ_STATUS.ZZ_NROLE=="03" && oData.ZE2E_REQ_STATUS.ZZ_REASON=="6" ){
						oData.ZZ_CAN_TXT = oRequest.ZZ_CAN_TXT;
						}					
						
						//end of change_dye5kor
						
						if (currentRole != "EMP"){
							if (selectedButton == "10 Closed Request"){
								oData.ZE2E_INS_HDR.ZE2E_REQ_STATUS.ZZ_REASON = oData.ZE2E_INS_HDR.ZZ_REASON;
							}
						}
						var oModel = new sap.ui.model.json.JSONModel();
						oModel.setData(oData);
						oThis.getView().setModel(oModel, "new");
	
						if( oData.ZE2E_REQ_STATUS.ZZ_REASON.trim() != ''  ){	//Compare version
							oThis.getPreviousVersion(oThis);
						}
						sap.ui.project.e2etm.util.StaticUtility.getComment(oData.ZZ_TRV_REQ,oData.ZZ_TRV_TYP,"INSR",oThis);
						sap.ui.project.e2etm.util.StaticUtility.getDocumentList(oThis,oData.ZZ_TRV_REQ, oData.ZZ_DEP_PERNR,'INS','INSR',oData.ZZ_LAND1);
	//					Invisible button SendBack and questionare for VISA travel
						if (currentRole != "EMP"){
							oThis.invisibleForVISATravel(oThis,oData.ZZ_TRV_TYP);
							//Set Text for button Submit
							oThis.getView().byId("btnSubmit").setText("Issue Insurance");
						
							//start of change_dye5kor_26.06.2017_ins_cancel requests
							
							if( oData.ZE2E_REQ_STATUS.ZZ_REASON.trim()=="5" ){
								oThis.getView().byId("btnSubmit").setText("Close");
								oThis.getView().byId("btnSubmit").setVisible(true);
								oThis.getView().byId("btnSendBack").setVisible(false);
								
							 }
							
					//end of change_dye5kor_26.06.2017_ins_cancel requests
						
						}
	
						sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oThis);
					},
					function(error){
						sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oThis);
						sap.m.MessageToast.show("No data found");
					});
		},
	
		doValidation:function(sAction){
			var sError = this.validateInsuranceHeader();
			if(sError != ""){
				sap.m.MessageToast.show(sError);
				return sError;
			}
	
			sError = this.validateFamilyMember();
			if(sError != ""){
				sap.m.MessageToast.show(sError);
				return sError;
			}
	
			sError = this.validateInsuranceNo();
			if(sError != ""){
				sap.m.MessageToast.show(sError);
				return sError;
			}
	
			sError = this.validateQuestion();
			if(sError != ""){
				sap.m.MessageToast.show(sError);
				return sError;
			}
	
			sError = this.validateConfirmCheckBox(sAction);
			if(sError != ""){
				sap.m.MessageToast.show(sError);
				return sError;
			}
			return "";
		},
	
//		There are two lines in travel details so keep one line is enough
		prepareDataForCreation: function(oData,aQuestion){
			oData.ZE2E_INS_HDR = {
					ZZ_ASG_TYP: sap.ui.getCore().getModel("global").getData().ZZ_ASG_TYP,
					ZZ_SPONSOR : sap.ui.getCore().getModel("global").getData().ZZ_SP_CMPNY,
					ZZ_TRV_REQ: oData.ZZ_REINR,
					ZZ_TRV_KEY: oData.ZZ_TRV_TYP,
					ZZ_OWNER: oData.ZZ_DEP_PERNR,
					ZZ_VERSION: oData.ZZ_VERSION,
					ZZ_INS_QUE: 'X',
					ZZ_LAND1: oData.ZZ_LAND1,
			};
			oData.ZE2E_INS_HDR.ZE2E_INS_DETAILSet = [];
	//		for(var i=0; i<oData.TRV_HDRtoTRV_travel_Data.results.length; i++){
	//			if( i % 2 == 0 ){
	//				var oDetail = this.prepareInsuranceDetailData(oData,i);
	//				this.prepareQuestionData(oDetail,aQuestion);
	//				oData.ZE2E_INS_HDR.ZE2E_INS_DETAILSet.push(oDetail);
	//			}
	//		}
			var i =0;
			var j = 0;
			var ZZ_ZSLFDPD ='';
			
			for(i=0; i<oData.TRV_HDRtoTRV_travel_Data.results.length; i++){
				var check = 0;
				ZZ_ZSLFDPD = oData.TRV_HDRtoTRV_travel_Data.results[i].ZZ_ZSLFDPD;
				
				// check if rei_detail array  already has this ZZ_ZSLFDPD or not
				if(oData.ZE2E_INS_HDR.ZE2E_INS_DETAILSet){ 
					for (var n =0;n< oData.ZE2E_INS_HDR.ZE2E_INS_DETAILSet.length;n++){
						if(oData.ZE2E_INS_HDR.ZE2E_INS_DETAILSet[n].ZZ_DEPNDT_TYP == ZZ_ZSLFDPD){
							check =1;
							break;
						}
					}
				}
				 //if still not have in array
				if(check == 0){
					for(j= i+1; j<=oData.TRV_HDRtoTRV_travel_Data.results.length; j++){
						
						if(j == oData.TRV_HDRtoTRV_travel_Data.results.length){ // for the last element of array
							var oDetail = this.prepareInsuranceDetailData(oData,i,j-1);
							if(oDetail){
							this.prepareQuestionData(oDetail,aQuestion);
							oData.ZE2E_INS_HDR.ZE2E_INS_DETAILSet.push(oDetail);
							break;
							}
						}else{
							if(ZZ_ZSLFDPD == oData.TRV_HDRtoTRV_travel_Data.results[j].ZZ_ZSLFDPD){
								 //do nothing
							 }else{ 
									var oDetail = this.prepareInsuranceDetailData(oData,i,j-1);
									if(oDetail){
									this.prepareQuestionData(oDetail,aQuestion);
									oData.ZE2E_INS_HDR.ZE2E_INS_DETAILSet.push(oDetail);
									break;
									}
							 }
						}

					}
				}
	
					
	//		}
			}
		},
	
		prepareDataForModification: function(oData){
			var aINS_DETAIL = [];
			for(var i=0;i<oData.ZE2E_INS_HDR.ZE2E_INS_DETAILSet.results.length;i++){
				if(oData.ZE2E_INS_HDR.ZE2E_INS_DETAILSet.results[i].ZZ_TRV_KEY == "DEPU" && 
				   oData.ZE2E_INS_HDR.ZE2E_INS_DETAILSet.results[i].ZZ_VISA_TYPE == "TOUR" 
				&& oData.ZE2E_INS_HDR.ZE2E_INS_DETAILSet.results[i].ZZ_DEPNDT_TYP != "00"&&
				oData.ZE2E_INS_HDR.ZZ_SPONSOR != "X"){
					continue;
				}
				oData.ZE2E_INS_HDR.ZE2E_INS_DETAILSet.results[i] = this.setDPNDDetails(oData.ZE2E_INS_HDR.ZE2E_INS_DETAILSet.results[i],oData);
				aINS_DETAIL.push(oData.ZE2E_INS_HDR.ZE2E_INS_DETAILSet.results[i]);
				var aINS_QA = [];
				aINS_DETAIL[i].ZE2E_INS_ANS = aINS_DETAIL[i].ZE2E_INS_ANS.results;
				delete aINS_DETAIL[i].ZE2E_INS_ANS.results;
			}
			oData.ZE2E_INS_HDR.ZE2E_INS_DETAILSet = aINS_DETAIL;	
		},
	
		doSubmit:function(oEvent){
			if(sap.ui.getCore().getModel("profile").getData().currentRole == "EMP"){
				var sTitle = "Kindly attach a copy of Tickets with this request  if not attached yet. ";
			}else{
				var sTitle = "Do you want to submit the request ?";
			}
			var oThis = this;
			var dialog = new sap.m.Dialog({
				title: 'Confirm',
				type: 'Message',
				content: [
				          new sap.m.Text({ text: sTitle }),
				          new sap.m.TextArea('submitDialogTextarea', {
				        	  width: '100%',
				        	  placeholder: 'Comment (Optional)'
				          })
				          ],
				          beginButton: new sap.m.Button({
				        	  text: 'Submit',
				        	  enabled: true,
				        	  press: function () {
				        		  var sText = sap.ui.getCore().byId('submitDialogTextarea').getValue();
				        		  var oData = oThis.getView().getModel("new").getData();
				        		  oData.ZE2E_INS_HDR.ZZ_COMMENTS = sText;
				        		  oThis.getView().getModel("new").setData(oData);
				        		  oThis.sendPostRequest("01");
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
		},
	
		doSendBack:function(oEvent){
			var oThis = this;
			var dialog = new sap.m.Dialog({
				title: 'Confirm',
				type: 'Message',
				content: [
				          new sap.m.Text({ text: 'Are you sure you want to send back this request?' }),
				          new sap.m.TextArea('submitDialogTextarea', {
				        	  liveChange: function(oEvent) {
				        		  var sText = oEvent.getParameter('value');
				        		  var parent = oEvent.getSource().getParent();
	
				        		  parent.getBeginButton().setEnabled(sText.length > 0);
				        	  },
				        	  width: '100%',
				        	  placeholder: 'Comment (required)'
				          })
				          ],
				          beginButton: new sap.m.Button({
				        	  text: 'Send Back',
				        	  enabled: false,
				        	  press: function () {
				        		  sap.ui.project.e2etm.util.StaticUtility.setBusy(true,oThis);
				        		  var sText = sap.ui.getCore().byId('submitDialogTextarea').getValue();
				        		  var oData = oThis.getView().getModel("new").getData();
				        		  var sUrl = sServiceUrl + "InsSendBack?ZZ_COMMENTS='{0}'&ZZ_TRV_KEY='{1}'&ZZ_TRV_REQ='{2}'&$format=json";
				        		  sUrl = sUrl.replace("{0}", sText);
				        		  sUrl = sUrl.replace("{1}", oData.ZZ_TRV_KEY);
				        		  sUrl = sUrl.replace("{2}", oData.ZZ_TRV_REQ);
	
				        		  var get = $.ajax({
				        			  cache: false,
				        			  url: sUrl,
				        			  type: "GET"
				        		  });
				        		  get.done(function(result){
				        			  sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oThis);
				        			  sap.m.MessageToast.show("Request successfully sent back !");
				        			  oThis.clearSearch();
				        			  oThis.doFilter('');
				        		  });
				        		  get.fail(function(err) {
				        			  sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oThis);
				        			  sap.m.MessageToast.show("Error occurs");
				        		  });
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
		},
	
		doFilter:function(sEmpNo){
			var oFilterRadio = this.getView().byId("idFilterRadio");
			switch (oFilterRadio.getSelectedIndex()){
			case 0:
				this.getView().byId("idList").setGrowing(false);
				this.getListSearch('01','01',sEmpNo,'');
				this.setEnableButons(true);
				return;
			case 1:
				this.getView().byId("idList").setGrowing(false);
				this.getListSearch('01','01',sEmpNo,'1');
				this.setEnableButons(true);
				return;
			case 2:
				this.getView().byId("idList").setGrowing(false);
				this.getListSearch('01','01',sEmpNo,'2');
				this.setEnableButons(true);
				return;	
			case 3:
				this.getView().byId("idList").setGrowing(false);
				this.getListSearch('01','01',sEmpNo,'3');
				this.setEnableButons(true);
				return;
			case 4:
				this.getView().byId("idList").setGrowing(true);
				this.getListSearch('03','01',sEmpNo,'');
				this.setEnableButons(false);
				return;
			//Start of changes_dye5kor_to enhance with the cancel requests
			case 5:
				this.getView().byId("idList").setGrowing(true);
				this.getListSearch('03','01',sEmpNo,'5');
				this.getView().byId("canReq").setVisible(true);
				this.getView().byId("btnSubmit").setText("Close");
				this.getView().byId("btnSubmit").setEnabled(true);
				this.getView().byId("btnSendBack").setVisible(false);
				return;
		
			//end of changes_dye5kor_to enhance with the cancel requests
			
			}
	
	
	//		var oIconTabFilter = this.getView().byId("idIconTabFilter");
	//		switch (oIconTabFilter.getSelectedKey()){
	//		case this.getView().sId +"--idIconTabNewRequest":
	//		this.getListSearch('01','01',sEmpNo,'');
	//		return;
	//		case this.getView().sId + "--idIconTabChangeMembers":
	//		this.getListSearch('01','01',sEmpNo,'2');
	//		return;
	//		case this.getView().sId+ "--idIconTabChangeDate":
	//		this.getListSearch('01','01',sEmpNo,'1');
	//		return;
	//		case this.getView().sId+ "--IconTabClose":
	//		this.getListSearch('02','01',sEmpNo,'');
	//		return;
	//		}
		},
	
		/*---------------------------------------------------------------------------------------------------------------
		 * 														Dynamic & refresh screen
		 ---------------------------------------------------------------------------------------------------------------*/
	
		displaySubmit:function(){
			if( sap.ui.getCore().getModel("global").getData().action == "02" ){
				this.getView().byId("btnNext").setVisible(false);
				this.getView().byId("btnSave").setVisible(false);
				this.getView().byId("btnSubmit").setVisible(false);
			}else{
				this.getView().byId("btnNext").setVisible(false);
				this.getView().byId("btnSave").setVisible(sap.ui.getCore().getModel("profile").getData().currentRole == "EMP");
				this.getView().byId("btnSubmit").setVisible(true);
			}
		},
	
		displayNext:function(){
			if( sap.ui.getCore().getModel("global").getData().action == "02" ){	//Open
				this.getView().byId("btnNext").setVisible(false);
				this.getView().byId("btnSave").setVisible(false);
				this.getView().byId("btnSubmit").setVisible(false);
				//start of change_dye5kor
				 if(this.getView().getModel("new").getData().ZE2E_REQ_STATUS.ZZ_REASON=="5"){
					 this.getView().byId("btnSubmit").setVisible(true);
					 this.getView().byId("btnSubmit").setText("Close");	
					}
				//end of change_dye5kor
			}else{
				this.getView().byId("btnNext").setVisible(sap.ui.getCore().getModel("profile").getData().currentRole == "EMP");
				this.getView().byId("btnSave").setVisible(sap.ui.getCore().getModel("profile").getData().currentRole == "EMP");
				if(sap.ui.getCore().getModel("profile").getData().currentRole == "EMP"){
					this.getView().byId("btnSubmit").setVisible(false);
				}else{
					this.getView().byId("btnSubmit").setVisible(true);
				}
			}
		},
	
		clearData:function(){
			if( this.getView().getModel("new") ){
				var oData = this.getView().getModel("new").getData();
				oData = {};
				this.getView().getModel("new").setData(oData);
			}
		},
	
		clearSearch:function(){
			this.getView().byId("idSearchNewRequest").setProperty('value','');
		},
	
		setEnableButons:function(bBool){
			this.getView().byId("btnSendBack").setEnabled(bBool);
			this.getView().byId("btnSubmit").setEnabled(bBool);
		},
	
		displayNoRequest:function(bBool){
			if( bBool ){
				sap.ui.core.routing.Router.getRouter("MyRouter").myNavToWithoutHash({
					currentView : this.getView(),
					targetViewName : "sap.ui.project.e2etm.view.NoData",
					targetViewType : "XML",
					transition : "slide"
				},"insuranceSplitApp");
			}else{
				sap.ui.core.routing.Router.getRouter("MyRouter").backWithoutHash(this.getView(),"insuranceSplitApp");
			}
		},
	
		getListSearch: function(sRole,sAction,sOwner,sReason){
			var sURL0 = "/ZE2E_INS_HDRSet?$filter=ZZ_TRV_REQ+eq+'{0}'+and+ZZ_TRV_KEY+eq+'{1}'+and+ZZ_OWNER+eq+'{2}'+and+ZZ_VERSION+eq+'{3}'&$expand=ZE2E_REQ_STATUS";
			sURL0 = sURL0.replace("{0}", sRole);
			sURL0 = sURL0.replace("{1}", sAction);
			sURL0 = sURL0.replace("{2}", sOwner);
			sURL0 = sURL0.replace("{3}", sReason);
			this.getView().byId("idList").unbindItems();
			this.getView().byId("idList").bindItems({
				path:sURL0,
				template: new sap.m.StandardListItem({
					title: "Req. : {ZZ_TRV_REQ}",
					description:"Emp. : {ZZ_OWNER}",
					icon: "{path : 'ZZ_TRV_KEY', formatter: 'sap.ui.project.e2etm.util.Formatter.iconFormat'}",
					info: "Date: {path : 'ZZ_CTIMESTAMP', formatter: 'sap.ui.project.e2etm.util.Formatter.sapDate'}",
					infoState: "Success",
					adaptTitleSize: false,
				})
			});
		},
		
		invisibleForVISATravel: function(oController, sTravelType){
			if	(sTravelType == "VISA"){
				oController.getView().byId("btnSendBack").setVisible(false);
				var oData = oController.getView().getModel("new").getData();
				oData.ZE2E_INS_HDR.ZZ_INS_QUE = "";
			} else {
				oController.getView().byId("btnSendBack").setVisible(true);
			}
		},
	
		/*---------------------------------------------------------------------------------------------------------------
		 * 														Validation
		 ---------------------------------------------------------------------------------------------------------------*/
		validateQuestion: function(){
			if( this.getView().byId("questionnaireRadioId").getSelectedIndex() == 0 ){
				var oCarousel = this.getView().byId("carouselQuestionId");
				for(var i=0;i<oCarousel.getPages().length;i++){
					var oSelectedPage = oCarousel.getPages()[i];
					var oTable = oSelectedPage.getContent()[1];
	
					for(var j=0;j<oTable.getItems().length;j++){
						var oRadio = oTable.getItems()[j].getCells()[1];
						var oText = oTable.getItems()[j].getCells()[2];
						if(oRadio.getProperty("selectedIndex") == 2){	//Not selected yet
							oRadio.setValueState("Error");
							this.getView().byId("iconTabBarId").setSelectedKey(this.getView().getId() + "--idIconTabFilter0");
							if( sap.ui.getCore().getModel("profile").getData().currentRole == "EMP" ){
								this.displayNext();
							}
							oCarousel.setActivePage(oSelectedPage);
							oCarousel.focus();
							return "Please select the answer !";
						}else{											//Already selected
							if( oRadio.getProperty("selectedIndex") == 0 && 
									oText.getValue().trim() == ""){			//Answer = YES and no comment
								oText.setValueState("Error");
								this.getView().byId("iconTabBarId").setSelectedKey(this.getView().getId() + "--idIconTabFilter0");
								if( sap.ui.getCore().getModel("profile").getData().currentRole == "EMP" ){
									this.displayNext();
								}
								oCarousel.setActivePage(oSelectedPage);
								oCarousel.focus();
								return "Please enter comment !";
							}else{
								oText.setValueState("None");
							}
							oRadio.setValueState("None");
						}
					}
				}
			}
			return "";
		},
	
		validateFamilyMember:function(){
			var oTable = this.getView().byId("dependentTableId");
			var oColumns = oTable.getColumns();
			for(var i=0;i<oTable.getItems().length;i++){
				var oItem = oTable.getItems()[i];
				for(var j=0;j<oItem.getCells().length;j++){
					if( oItem.getCells()[j] instanceof sap.m.InputBase ){
						if( oItem.getCells()[j].getValue().trim() == "" && oItem.getCells()[j].getEditable()){
							oItem.getCells()[j].setValueState("Error");
							this.getView().byId("iconTabBarId").setSelectedKey(this.getView().getId() + "--idIconTabFilter0");
							if( sap.ui.getCore().getModel("profile").getData().currentRole == "EMP" ){
								this.displayNext();
							}
							oTable.focus();
							oItem.getCells()[j].focus();
							return "Please enter required field !";
						}else{
							if( oItem.getCells()[j] instanceof sap.m.DatePicker ){	//Check date type
								if( !sap.ui.project.e2etm.util.StaticUtility.checkDateFormat( oItem.getCells()[j].getValue().trim() ) ){
									oItem.getCells()[j].setValueState("Error");
									this.getView().byId("iconTabBarId").setSelectedKey(this.getView().getId() + "--idIconTabFilter0");
									if( sap.ui.getCore().getModel("profile").getData().currentRole == "EMP" ){
										this.displayNext();
									}
									oTable.focus();
									oItem.getCells()[j].focus();
									return "Please enter a valid date !";
								}
									
								else{
									if(oItem.getCells()[j].getBindingInfo("value").parts[0].path=="ZZ_BEGDA"||
											oItem.getCells()[j].getBindingInfo("value").parts[0].path=="ZZ_ENDDA"){
										var errorMsg = this.checkValidStartEndDate(oItem.getCells()[j].getValue(),i,
												oItem.getCells()[j].getBindingInfo("value").parts[0].path);
										if(errorMsg==""){
											oItem.getCells()[j].setValueState("None");
										}else{
											oItem.getCells()[j].setValueState("Error");
											if( sap.ui.getCore().getModel("profile").getData().currentRole == "EMP" ){
												this.displayNext();
											}
											oTable.focus();
											oItem.getCells()[j].focus();
											return errorMsg;
										}
									}else{
									      oItem.getCells()[j].setValueState("None");
									}
								};
							}
						}
					}else if(oItem.getCells()[j] instanceof sap.m.Select && oItem.getCells()[j].getSelectedKey()==""){
							if(oItem.getCells()[j].getBindingInfo("selectedKey").parts[0].path!="ZZ_DEPNDT_TYP"){			
								return "Please select the value in " +oColumns[j].getHeader().getText()  ;
							}
					}
				}
			}
			return "";
		},
		
		checkValidStartEndDate : function(eDate,rowIndex,prop) {
			    var oData = this.getView().getModel("new").getData();
			    var tStartDate;
			    var curBegDa;
			    var tEndDate;
			    if(rowIndex == 0){
	             tStartDate = oData.ZZ_DATV1;
	             tEndDate = oData.ZZ_DATB1;
			    }else{
			    	tStartDate = oData.ZE2E_INS_HDR.ZE2E_INS_DETAILSet[0].ZZ_BEGDA;
		            tEndDate = oData.ZE2E_INS_HDR.ZE2E_INS_DETAILSet[0].ZZ_ENDDA;
			    }			 	    
			    
				eDate = this.convertToDate(eDate.substring(0, 4), eDate.substring(4, 6), eDate.substring(6, 8));
				
				   if(prop == "ZZ_ENDDA"){
				    	curBegDa = oData.ZE2E_INS_HDR.ZE2E_INS_DETAILSet[rowIndex].ZZ_BEGDA;
				    	curBegDa = this.convertToDate(curBegDa.substring(0, 4), curBegDa.substring(4, 6), curBegDa.substring(6, 8));
				    	if(eDate < curBegDa){
							return "End Date should not be less than Start Date";
						}
				    }		
				
				tStartDate = this.convertToDate(tStartDate.substring(0, 4), tStartDate.substring(4, 6), tStartDate.substring(6, 8));
				tEndDate = this.convertToDate(tEndDate.substring(0, 4), tEndDate.substring(4, 6), tEndDate.substring(6, 8));
				
				
				if (eDate >= tStartDate && eDate<=tEndDate) {
					return "";
				} else {
							if (rowIndex != 0) {
								if (prop == "ZZ_BEGDA")
									return "Start Date should lie between Start and End date of Employee !";
								else
									return "End Date should lie between Start and End date of Employee !";
							} else {
								if (prop == "ZZ_BEGDA")
									return "Start Date should lie between Travel Start and End date!";
								else
									return "End Date should lie between Travel Start and End date!";
							}
				}
				

		
		},
		convertToDate : function(year, month, date) {
			var date1 = new Date(year, month - 1, date);
			return date1;
		},
	
		validateInsuranceNo:function(){
			if( sap.ui.getCore().getModel("profile").getData().currentRole != "EMP" ){
				var k = 4;
				var oData = this.getView().getModel("new").getData();
				for(var i=0;i<oData.ZE2E_INS_DETAILSet.results.length-1;i++){
					for(var j=i+1;j<oData.ZE2E_INS_DETAILSet.results.length;j++){
						var oTable = this.getView().byId("dependentTableId");
						
						var oItem = oTable.getItems()[j];
						if(oItem){
						if( oData.ZE2E_INS_DETAILSet.results[i].ZZ_INS_NO.trim() == oData.ZE2E_INS_DETAILSet.results[j].ZZ_INS_NO.trim() ){
						//start of change_dye5kor_13.07.2017
						
							if(oData.ZE2E_INS_DETAILSet.results[i].ZZ_DEPDNT_TYP=="00"){
								k=3;
							}
					    //End of change_dye5kor_13.07.2017
							
							oTable.focus();
							oItem.getCells()[k].focus();
							oItem.getCells()[k].setValueState("Error");
							return "Visa Insurance Number cannot be the same";
						}else{
							oItem.getCells()[k].setValueState("None");
						}
						}
					}
				}
			}
			return "";
		},
	
		validateInsuranceHeader: function(){
			var oControl = this.getView().byId("sponsoredRadioId");
			if( oControl.getSelectedIndex() == 2 ){
				oControl.setValueState("Error");
				this.getView().byId("iconTabBarId").setSelectedKey(this.getView().getId() + "--idIconTabFilter0");
				if( sap.ui.getCore().getModel("profile").getData().currentRole == "EMP" ){
					this.displayNext();
				}
				oControl.focus();
				return "Please enter required field !";
			}else{
				oControl.setValueState("None");
			}
			return "";
		},
	
		validateConfirmCheckBox:function(sAction){
			if(sap.ui.getCore().getModel("profile").getData().currentRole == "EMP" && sAction == '01'){
				if( !this.getView().byId("confirmCheckboxId").getSelected() ){
					this.getView().byId("confirmCheckboxId").focus();
					return "Please check on 'I have read and understood the above statement'";
				}
			}
			return "";
		},
	
		/*---------------------------------------------------------------------------------------------------------------
		 * 														Convert data from model to view
		 ---------------------------------------------------------------------------------------------------------------*/
	
	//	Initiate node for question in create scenario
		prepareQuestionData:function(oDetail,aQuestion){
			oDetail.ZE2E_INS_ANS = [];
			for(var i=0;i<aQuestion.results.length;i++){
				var oQuestion = {
						ZZ_TRV_REQ: 	oDetail.ZZ_TRV_REQ,
						ZZ_TRV_KEY: 	oDetail.ZZ_TRV_KEY,
						ZZ_OWNER:		oDetail.ZZ_DEP_PERNR,
						ZZ_VERSION: 	oDetail.ZZ_VERSION,
						ZZ_DEPNDT_TYP:	oDetail.ZZ_DEPNDT_TYP,
						ZZ_QA_KEY:		aQuestion.results[i].ZZ_QA_KEY
				};
				oDetail.ZE2E_INS_ANS.push(oQuestion);
			}
		},
		prepareInsuranceDetailData:function(oData, iIndex, iIndex1){
			var oDetail = {
					ZZ_TRV_REQ: 	oData.ZZ_REINR,
					ZZ_TRV_KEY: 	oData.ZZ_TRV_TYP,
					ZZ_OWNER:		oData.ZZ_DEP_PERNR,
					ZZ_VERSION: 	oData.ZZ_VERSION,
					ZZ_DEPNDT_TYP:  oData.TRV_HDRtoTRV_travel_Data.results[iIndex].ZZ_ZSLFDPD,
					ZZ_DEP_NAME:	this.getName(oData,oData.TRV_HDRtoTRV_travel_Data.results[iIndex].ZZ_ZSLFDPD),
					ZZ_DEP_GENDER:	this.getGender(oData,oData.TRV_HDRtoTRV_travel_Data.results[iIndex].ZZ_ZSLFDPD),
					ZZ_VISA_TYPE:	this.getVisaType(oData,oData.TRV_HDRtoTRV_travel_Data.results[iIndex].ZZ_ZSLFDPD),
					ZZ_DOB:			this.getDOB(oData,oData.TRV_HDRtoTRV_travel_Data.results[iIndex].ZZ_ZSLFDPD),
					ZZ_PASSPORT:	this.getPassport(oData,oData.TRV_HDRtoTRV_travel_Data.results[iIndex].ZZ_ZSLFDPD),
					ZZ_BEGDA: 		oData.TRV_HDRtoTRV_travel_Data.results[iIndex].ZZ_BEGDA,
					ZZ_INS_NO:		oData.TRV_HDRtoTRV_travel_Data.results[iIndex].ZZ_INS_NO,
			};
			
			
			if(oDetail.ZZ_TRV_KEY == "DEPU" && oDetail.ZZ_VISA_TYPE == "TOUR" && oDetail.ZZ_DEPNDT_TYP != "00" &&
					oData.ZE2E_INS_HDR.ZZ_SPONSOR != "X"){
				return undefined;
			}
			
			
			oDetail = this.setDPNDDetails(oDetail,oData);
			
			//Only one month for transfer
			if( sap.ui.getCore().getModel("global").getData().ZZ_TRV_CAT == "TRFR" &&
					sap.ui.getCore().getModel("global").getData().ZZ_DEP_TYPE == "INTL"){
				var sEndDate = oData.TRV_HDRtoTRV_travel_Data.results[iIndex1].ZZ_BEGDA;
				var dDate = new Date(sEndDate.substr(0, 4), sEndDate.substr(4, 2) - 1, sEndDate.substr(6, 2));
				dDate.setTime(dDate.getTime() + (parseInt(oData.DAYS) * 1000 * 60 * 60 * 24) );
				var yyyy = dDate.getFullYear().toString();
				var mm = (dDate.getMonth()+1).toString(); // getMonth() is zero-based
				var dd  = dDate.getDate().toString();
				oDetail.ZZ_ENDDA = yyyy + (mm[1]?mm:"0"+mm[0]) + (dd[1]?dd:"0"+dd[0]);
			}else{
	//			if( iIndex1 + 1 < oData.TRV_HDRtoTRV_travel_Data.results.length ){
					oDetail.ZZ_ENDDA = oData.TRV_HDRtoTRV_travel_Data.results[iIndex1].ZZ_BEGDA;
	//			}
			}
			
		
			
			return oDetail;
		},
		setDPNDDetails:function(oDetail,oData){
			//if(oDetail.ZZ_VISA_TYPE == ""||oDetail.ZZ_VISA_TYPE ==" "||!(oDetail.ZZ_VISA_TYPE)){
				switch (oDetail.ZZ_TRV_KEY) {
				case "INFO":
				case "SECO":
				case "BUSR":
					if (oDetail.ZZ_DEPNDT_TYP == "00"){
						oDetail.ZZ_VISA_TYPE = "BUSR";
						oDetail.ZZ_PAY_TYP = "PBRB";
					}else{
						oDetail.ZZ_VISA_TYPE = "TOUR";
						oDetail.ZZ_PAY_TYP = " ";
					}
					break;
				case "DEPU":								
						
						if(oData.ZE2E_INS_HDR.ZZ_SPONSOR == "X"){
							  oDetail.ZZ_PAY_TYP = "PBRB";
						}else{
							if(oDetail.ZZ_DEPNDT_TYP == "00"){
			                    oDetail.ZZ_PAY_TYP = "PBRB";
			               }else{
			            	    oDetail.ZZ_PAY_TYP = "PBEM";
			               }                    
						}
					break;
				} 
				
   
//               if(oDetail.ZZ_DEPNDT_TYP == "00"){
//                    oDetail.ZZ_PAY_TYP = "PBRB";
//               }else{
//            	   oDetail.ZZ_PAY_TYP = " ";
//               }                    
                    return oDetail;

		},
		onDPNDChange:function(evt){
			var odata = evt.getSource().getParent().getBindingContext("new").getModel().getProperty(evt.getSource().getParent().getBindingContext("new").sPath);
			odata = this.setDPNDDetails(odata,this.getView().getModel("new").getData());
			odata.ZZ_VISA_TYPE = " ";
            evt.getSource().getParent().getBindingContext("new").getModel().setProperty(evt.getSource().getParent().getBindingContext("new").sPath,odata);
			
		},
	
	//	prepareInsuranceDetailData:function(oData, iIndex){
	//		var oDetail = {
	//				ZZ_TRV_REQ: 	oData.ZZ_REINR,
	//				ZZ_TRV_KEY: 	oData.ZZ_TRV_TYP,
	//				ZZ_OWNER:		oData.ZZ_DEP_PERNR,
	//				ZZ_VERSION: 	oData.ZZ_VERSION,
	//				ZZ_DEPNDT_TYP:  oData.TRV_HDRtoTRV_travel_Data.results[iIndex].ZZ_ZSLFDPD,
	//				ZZ_DEP_NAME:	this.getName(oData,oData.TRV_HDRtoTRV_travel_Data.results[iIndex].ZZ_ZSLFDPD),
	//				ZZ_DEP_GENDER:	this.getGender(oData,oData.TRV_HDRtoTRV_travel_Data.results[iIndex].ZZ_ZSLFDPD),
	//				ZZ_VISA_TYPE:	this.getVisaType(oData,oData.TRV_HDRtoTRV_travel_Data.results[iIndex].ZZ_ZSLFDPD),
	//				ZZ_DOB:			this.getDOB(oData,oData.TRV_HDRtoTRV_travel_Data.results[iIndex].ZZ_ZSLFDPD),
	//				ZZ_PASSPORT:	this.getPassport(oData,oData.TRV_HDRtoTRV_travel_Data.results[iIndex].ZZ_ZSLFDPD),
	//				ZZ_BEGDA: 		oData.TRV_HDRtoTRV_travel_Data.results[iIndex].ZZ_BEGDA,
	//				ZZ_INS_NO:		oData.TRV_HDRtoTRV_travel_Data.results[iIndex].ZZ_INS_NO,
	//		};
	//		
	//		//Only one month for transfer
	//		if( sap.ui.getCore().getModel("global").getData().ZZ_TRV_CAT == "TRFR" &&
	//				sap.ui.getCore().getModel("global").getData().ZZ_DEP_TYPE == "INTL"){
	//			var sEndDate = oData.TRV_HDRtoTRV_travel_Data.results[iIndex].ZZ_BEGDA;
	//			var dDate = new Date(sEndDate.substr(0, 4), sEndDate.substr(4, 2) - 1, sEndDate.substr(6, 2));
	//			dDate.setTime(dDate.getTime() + (parseInt(oData.DAYS) * 1000 * 60 * 60 * 24) );
	//			var yyyy = dDate.getFullYear().toString();
	//			var mm = (dDate.getMonth()+1).toString(); // getMonth() is zero-based
	//			var dd  = dDate.getDate().toString();
	//			oDetail.ZZ_ENDDA = yyyy + (mm[1]?mm:"0"+mm[0]) + (dd[1]?dd:"0"+dd[0]);
	//		}else{
	//			if( iIndex + 1 < oData.TRV_HDRtoTRV_travel_Data.results.length ){
	//				oDetail.ZZ_ENDDA = oData.TRV_HDRtoTRV_travel_Data.results[iIndex + 1].ZZ_BEGDA;
	//			}
	//		}
	//		return oDetail;
	//	},
	
		getName: function(oData,sType){
			var sTypeHR = sap.ui.project.e2etm.util.StaticUtility.mappingDependent(sType);
			if( sTypeHR == "" ){	//Self
				return oData.ZZ_DEP_NAME;
			}
			//Dependent
			var iIndex = sap.ui.project.e2etm.util.StaticUtility.getArrayIndex(oData.EMPtoEMPDEPNDNT.results,"ZZ_DEP_TYP", sTypeHR);
			if( iIndex != -1 ){
				return oData.EMPtoEMPDEPNDNT.results[iIndex].ZZ_DPND_FNAME + " " +
				oData.EMPtoEMPDEPNDNT.results[iIndex].ZZ_DPND_LNAME;
			}
			return "";
		},
	
		getGender: function(oData,sType){
			var sTypeHR = sap.ui.project.e2etm.util.StaticUtility.mappingDependent(sType);
			if( sTypeHR == "" ){	//Self
				return oData.ZZ_DEP_GENDER;
			}
			//Dependent
			var iIndex = sap.ui.project.e2etm.util.StaticUtility.getArrayIndex(oData.EMPtoEMPDEPNDNT.results,"ZZ_DEP_TYP", sTypeHR);
			if( iIndex != -1 ){
				return oData.EMPtoEMPDEPNDNT.results[iIndex].ZZ_DEP_GENDER;
			}
			return "";
		},
	
		getPassport: function(oData, sType){
			var sTypeHR = sap.ui.project.e2etm.util.StaticUtility.mappingDependent(sType);
			if( sTypeHR == "" ){	//Self
				if(oData.ZZ_PASSPORT_NO == "N/A")
					{
					oData.ZZ_PASSPORT_NO = "";
					}
				return oData.ZZ_PASSPORT_NO;
			}
			//Dependent
			var iIndex = sap.ui.project.e2etm.util.StaticUtility.getArrayIndex(oData.EMPtoEMPDEPNDNT.results,"ZZ_DEP_TYP", sTypeHR);
			if( iIndex != -1 ){
				if(oData.EMPtoEMPDEPNDNT.results[iIndex].ZZ_PASSPORT_NO == "N/A")
				{
					oData.EMPtoEMPDEPNDNT.results[iIndex].ZZ_PASSPORT_NO = "";
				}
				return oData.EMPtoEMPDEPNDNT.results[iIndex].ZZ_PASSPORT_NO ;
			}
			return "";
		},
	
		getDOB: function(oData, sType){
			var sTypeHR = sap.ui.project.e2etm.util.StaticUtility.mappingDependent(sType);
			if( sTypeHR == "" ){	//Self
				return oData.ZZ_DEP_DOB;
			}
			//Dependent
			var iIndex = sap.ui.project.e2etm.util.StaticUtility.getArrayIndex(oData.EMPtoEMPDEPNDNT.results,"ZZ_DEP_TYP", sTypeHR);
			if( iIndex != -1 ){
				return oData.EMPtoEMPDEPNDNT.results[iIndex].ZZ_DEP_DOB;
			}
			return "";
		},
	
		getDependentText: function(oData, sType){
			var iIndex = sap.ui.project.e2etm.util.StaticUtility.getArrayIndex(oData.DEPENDENT_TYPE.results,"DOMVALUE_L", sType);
			if( iIndex != -1 ){
				return oData.DEPENDENT_TYPE.results[iIndex].DDTEXT;
			}
			return "";
		},
	
		getVisaType: function(oData, sType){
			var sTypeHR = sap.ui.project.e2etm.util.StaticUtility.mappingDependent(sType);
			if( sTypeHR == "" ){	//Self
				return oData.ZZ_CURR_VISA_TYP;
			}
			//Dependent
			var iIndex = sap.ui.project.e2etm.util.StaticUtility.getArrayIndex(oData.VISAPLANTOITEM.results,"ZZ_DEPNDT_TYP", sTypeHR);
			if( iIndex != -1 ){
				return oData.VISAPLANTOITEM.results[iIndex].ZZ_CURR_VISA_TYP ;
			}
			return "";
		},
	
		getPreviousVersion:function(oThis){
			var oData = oThis.getView().getModel("new").getData();
			var sINS_HDR = "ZE2E_INS_HDRSet(ZZ_TRV_REQ='{0}',ZZ_OWNER='{1}',ZZ_TRV_KEY='{2}',ZZ_VERSION='{3}')?$expand=ZE2E_INS_DETAILSet";
			sINS_HDR = sINS_HDR.replace("{0}", oData.ZZ_TRV_REQ);
			sINS_HDR = sINS_HDR.replace("{1}", oData.ZZ_DEP_PERNR);
			sINS_HDR = sINS_HDR.replace("{2}", oData.ZZ_TRV_KEY);
			sINS_HDR = sINS_HDR.replace("{3}", parseInt(oData.ZZ_VERSION) - 1 + "");
	
			oComponent.getModel().read(sINS_HDR,null,null,true,
					function (oResult, oRequest) {
				oData.OLD_VERSION = oResult;
				oThis.getView().getModel("new").setData(oData);
			},
			function(error){
				sap.m.MessageToast.show("Cannot get previous version");
			});
	
		},
	
		/*---------------------------------------------------------------------------------------------------------------
		 * 														Save flow
		 ---------------------------------------------------------------------------------------------------------------*/
	
		sendPostRequest:function(sAction){
			sap.ui.project.e2etm.util.StaticUtility.setBusy(true,this);
			var oData = this.getView().getModel("new").getData().ZE2E_INS_HDR;
			var oThis = this;
			//start of change_dye5kor
			if(sAction!="00" && sAction!="01" ){
			if(oData.ZE2E_REQ_STATUS.ZZ_REASON=="5")
				{				
				oData.ZE2E_REQ_STATUS.ZZ_REASON=="6"
				}
			}
			//end of change_dye5kor
			oComponent.getModel().create("/ZE2E_INS_HDRSet", oData, {
				success : jQuery.proxy(function(mResponse) {
					if( sAction == "00" ){	//Save
						sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oThis);
						sap.m.MessageToast.show("The request has been saved.");
					}else{
						sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oThis);
						if(sap.ui.getCore().getModel("profile").getData().currentRole == "EMP"){
							sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
						}else{
							oThis.clearSearch();
							oThis.doFilter('');
						}
						sap.m.MessageToast.show("The request has been submitted.");
					}
				}, this),
				error : jQuery.proxy(function() {
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oThis);
					sap.m.MessageToast.show("The request has failed.");
				}, this)
			});
		},
		//TGG1HC
		onBackPress:function(){
			if(sap.ui.getCore().getModel("profile").getData().currentRole == "EMP"){
				if( sap.ui.getCore().getModel("global").getData().action == "00" ){	//Create
					if( sap.ui.getCore().getModel("profile").getData().currentRole != "EMP" ){
						var oData = sap.ui.getCore().getModel("profile").getData();
						oData.currentRole = "EMP";
						sap.ui.getCore().getModel("profile").setData(oData);
					}
					//		sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
	
	
					if( sap.ui.getCore().getModel("global").getData().action == "02" ){
						sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
					}else{
						var dialog = new sap.m.Dialog({
							title: 'Confirm',
							type: 'Message',
							content: new sap.m.Text({ text: 'Unsaved information will be lost. Do you want to cancel ?' }),
							beginButton: new sap.m.Button({
								text: 'Yes',
								press: function () {
									sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
									dialog.close();
								}
							}),
							endButton: new sap.m.Button({
								text: 'No',
								press: function () {
									dialog.close();
								}
							}),
							afterClose: function() {
								dialog.destroy();
							}
						});
						dialog.open();
					}
				}else{	//Change
					sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
				}
			}
		},
	
		OnItemPress:function(evt){
			evt.getSource().getParent().getModel("new").refresh(true);
			//this.getview().byId("dependentTableId").getModel().refresh(true);
			
			
		},
	
	});