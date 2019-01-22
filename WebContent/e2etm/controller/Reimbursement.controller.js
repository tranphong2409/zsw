jQuery.sap.require("sap.ui.project.e2etm.util.Formatter");
jQuery.sap.require("sap.ui.project.e2etm.util.StaticUtility");
jQuery.sap.require('sap.ui.project.e2etm.controls.customStage');
jQuery.sap.require('sap.ui.project.e2etm.controls.stageItem');
jQuery.sap.require("sap.m.MessageToast");
jQuery.sap.require("sap.m.MessageBox");
sap.ui.controller("sap.ui.project.e2etm.controller.Reimbursement", {

	onInit:function(){
		sap.ui.core.routing.Router.getRouter("MyRouter").attachRoutePatternMatched(this.onRouteMatched, this);
	},

	onRouteMatched: function(evt){

		if(evt.getParameter("name")=="home"){
		}else if(evt.getParameter("name")=="reimbursement") {
			if(this.getView().sViewName == "sap.ui.project.e2etm.view.Reimbursement"){			

				//get role of user
				var currentRole = sap.ui.getCore().getModel("profile").getData().currentRole;
				//set busy
				sap.ui.project.e2etm.util.StaticUtility.setBusy(true,this);

				//in case of employee
				if(currentRole == "EMP"){
					//Create an JSON model					
					var oModel = new sap.ui.model.json.JSONModel();
					//Set data to new item root
					this.getView().setModel(oModel,"new");	


					// Owner
					var PERNR   = sap.ui.getCore().getModel("oRequest").getData().ZZ_DEP_PERNR;

					// Traveling request
					var TRV_REQ = sap.ui.getCore().getModel("oRequest").getData().ZZ_TRV_REQ;

					// Traveling request type
					var REQ_TYP = sap.ui.getCore().getModel("oRequest").getData().ZZ_REQ_TYP;

					var sVisaPlan = sap.ui.getCore().getModel("oRequest").getData().ZZ_VISA_PLAN;

					oModel.setProperty("/FAMACC", sap.ui.getCore().getModel("oRequest").getData().ZZ_FAMILY_ACCOMP);
					oModel.setProperty("/SPONSOR", sap.ui.getCore().getModel("oRequest").getData().ZZ_SP_CMPNY);

					//Initialize data
					var oThis = this;
					var oModel = this.getView().getModel("new");
					oModel.refresh(true);
					oModel.setSizeLimit(200);

					var oDataModel = new sap.ui.model.odata.ODataModel(sServiceUrl);
//					begin of improve performance --02/08/2016
//					var sPath = "/TRV_HDRSet(ZZ_PERNR='$param1',ZZ_DEP_REQ='$param2',ZZ_VERSION='',ZZ_TRV_TYP='$param3')?$expand=ZE2E_INS_HDR," +
//							"DEP_EMP,ZE2E_ACC_DETAILSet,TRV_HDRtoTRV_travel_Data/ZE2E_INS_DETAIL/ZE2E_INS_ANS/ZE2E_INS_QA";
					var sPath = "/TRV_HDRSet(ZZ_PERNR='$param1',ZZ_DEP_REQ='$param2',ZZ_VERSION='',ZZ_TRV_TYP='$param3')?$expand=DEP_EMP";
//					end of improve performance --02/08/2016
				
					sPath = sPath.replace("$param1",PERNR);
					sPath = sPath.replace("$param2",TRV_REQ);
					sPath = sPath.replace("$param3",REQ_TYP);		
					var batchOperation0 = oDataModel.createBatchOperation(sPath, "GET");

					var sPath_1 = "/ZE2E_REI_HDRSet?$filter=ZZ_TRV_REQ+eq+'{0}'+and+ZZ_OWNER+eq+'{1}'+and+ZZ_TRV_KEY+eq+'{2}'+and+ZZ_VERSION+eq+'{3}'+and+WAERS+eq+'T'&$expand=ZE2E_REI_DETAIL ";		
					sPath_1 = sPath_1.replace("{0}", TRV_REQ);
					sPath_1 = sPath_1.replace("{1}", PERNR);
					sPath_1 = sPath_1.replace("{2}", REQ_TYP);
					sPath_1 = sPath_1.replace("{3}", "0");
					var batchOperation1 = oDataModel.createBatchOperation(sPath_1, "GET");

					var sPath_2 = "/DEP_VISA_PLANSet('$param4')";		
					sPath_2 = sPath_2.replace('$param4',sVisaPlan);
					var batchOperation2 = oDataModel.createBatchOperation(sPath_2, "GET");

					var sPath_3 = "/GetF4Help?Srch_help='F4_TCURC_ISOCD'&ZZ_SMODID='REIM'&$format=json";
					var batchOperation3 = oDataModel.createBatchOperation(sPath_3, "GET");

					var sPath_4 = "/ZE2E_REI_EXPENSESet?$filter=ZZ_NATURE+eq+'{0}'+and+ZZ_COUNTRY_G+eq+'{1}'+and+ZZ_DESCIPTION+eq+'{2}'";
					sPath_4 = sPath_4.replace("{0}", "");
					sPath_4 = sPath_4.replace("{1}", sap.ui.getCore().getModel("oRequest").getData().ZZ_DEP_TOCNTRY);
					sPath_4 = sPath_4.replace("{2}", "");					
					var batchOperation4 = oDataModel.createBatchOperation(sPath_4, "GET");

					var sPath_5 = "/BankDetailsSet(EmpNo='$param1',TravelPlan='$param2',TravelType='$param3')";
					sPath_5 = sPath_5.replace("$param1",PERNR);
					sPath_5 = sPath_5.replace("$param2",TRV_REQ);
					sPath_5 = sPath_5.replace("$param3",REQ_TYP);

					var batchOperation5 = oDataModel.createBatchOperation(sPath_5, "GET");

//					var sPath_6 = "/ZE2E_REQ_STATUSSet";
					var sPath_6 = "/ZE2E_REQ_STATUSSet?$filter=ZZ_TRV_REQ+eq+'{0}'+and+ZZ_MODID+eq+'{1}'";
					sPath_6 = sPath_6.replace("{0}", TRV_REQ);
					sPath_6 = sPath_6.replace("{1}", 'REIM');
					var batchOperation6 = oDataModel.createBatchOperation(sPath_6, "GET");


					// TGG1HC get message
					var batchOperation7 = oDataModel.createBatchOperation("GetF4Table?TableName='ZE2E_DEP_TAX_C'&Col1='ZZ_LAND1'&Col2=''&Col3=''&Col4=''&Col5=''&Col6=''&Col7=''&Col8=''&Col9=''&Col10=''&$format=json", "GET");
					var batchOperation8 = oDataModel.createBatchOperation("GetConstant?CONST='BILL_ADDR'&SELPAR='NONPE'&$format=json", "GET");
					var batchOperation9 = oDataModel.createBatchOperation("GetConstant?CONST='BILL_ADDR'&SELPAR='PE'&$format=json", "GET");

					oComponent.getModel().addBatchReadOperations([batchOperation0, 
					                                              batchOperation1, 
					                                              batchOperation2, 
					                                              batchOperation3, 
					                                              batchOperation4, 
					                                              batchOperation5,
					                                              batchOperation6,
					                                              batchOperation7,
					                                              batchOperation8,
					                                              batchOperation9,]);

					oComponent.getModel().submitBatch(
							function(oResult){

								// Get Travelling Data
								var aTrv_HRD = oResult.__batchResponses[0].data;
								oModel.setProperty("/trvhdr" , aTrv_HRD);		

								// Get Riemburstment Data
								var aReim_HDR = oResult.__batchResponses[1].data.results;

								//Add data of TRV Header to new model		
								if(aReim_HDR.length != 0){
									oModel.setProperty("/reimhdr" , aReim_HDR);
								}else{	

									var aItem = {
											ZZ_OWNER:   PERNR,
											ZZ_TRV_REQ: TRV_REQ,
											ZZ_TRV_KEY: REQ_TYP,
											ZZ_VERSION: "",
											SEQNR: "",
											ZZ_BILL_NO:"",
											ZZ_BILL_DATE:"",
											ZZ_EXP_TYPE:"",
											ZZ_EXP_INCUR:"",
											ZZ_NATURE:"",
											ZZ_AMOUNT:"",
											ZZ_VAT:"",
											ZZ_AMOUNT_N:"",				
											ZZ_ATTACEMENT:"",
											ZZ_REMARKS:""
									};

									var aresults = [];
									aresults.push(aItem);

									var ta = {
											results: aresults,
									};

									var tet = [{
										ZZ_OWNER  : PERNR,
										ZZ_TRV_KEY: REQ_TYP,
										ZZ_TRV_REQ: TRV_REQ,
										ZZ_VERSION: "",
										ZZ_COUNTRY_G : oModel.getData().trvhdr.ZZ_LAND1,
										WAERS: "EUR",
										ZE2E_REI_DETAIL: ta
									}];

									oModel.setProperty("/reimhdr" , tet);									
								}

								// Get Visa Data
								var aVisa = oResult.__batchResponses[2].data;
								oModel.setProperty("/visa", aVisa);

								// Get Currency Data
								var aCurrency = oResult.__batchResponses[3].data.results;
								oModel.setProperty("/currency" , aCurrency);

								// Get Nature Expense Data
								var aNatureExp = oResult.__batchResponses[4].data.results;
								oModel.setProperty("/natureexp" , aNatureExp);

								// Get Bank's Information
								var bankDetail = oResult.__batchResponses[5].data;
								oModel.setProperty("/bankdetail" , bankDetail);

								// Get Request Status
								var aREQ_Status = oResult.__batchResponses[6].data.results;	


								// Get PE Country list TGG1HC
								var aPECountry = oResult.__batchResponses[7].data.results;

								// Get address NONPE 
								var aNONPE = oResult.__batchResponses[8].data.GetConstant;

								// Get address PE 
								var aPE = oResult.__batchResponses[9].data.GetConstant;

								//get address to display

								var address ="";

								for(var i =0; i<aPECountry.length; i++){
									if(aPECountry[i].FIELD1 == oModel.getData().trvhdr.ZZ_LAND1){
										address = aPE;
										break;
									}else if(aPECountry[i].FIELD1 != oModel.getData().trvhdr.ZZ_LAND1){
										address = aNONPE;										
									}

								}
								oModel.setProperty("/address" , address.VALUE);

								// Flag for creating new version
								var sReq_Flg = false;
								// Flag for checking request is sent back or not
								var sent_back = false;
								// Array for all REIM Request that belong to TRV 
								var act_req  = [];								

								var sTotalAmount = 0;
								var sVATAmount   = 0;
								var sNetAmount   = 0;

								var aDetail = oModel.getData().reimhdr;
								var Caro_page = oThis.getView().byId("itemdetail").getPages();	
								var oData = oThis.getView().getModel("new").getData();

								//Get all request belong to REIM to using in Formatter for enabled status
								for(var i = 0; i < aREQ_Status.length; i++){	

									if( 	aREQ_Status[i].ZZ_TRV_REQ == TRV_REQ && 
											aREQ_Status[i].ZZ_TRV_KEY == REQ_TYP && 
											aREQ_Status[i].ZZ_MODID   == "REIM"){

										act_req.push(aREQ_Status[i]);
									}
								}	
								oModel.setProperty("/reqstt" , act_req);
								if(act_req.length == 0){									
									//Set enable for button Add, Remove and Currency in line item.
									//When req = 0 -> new req -> enable = true
//									Caro_page[0].mAggregations.headerToolbar.mAggregations.content[0].setEnabled(true);
//									Caro_page[0].mAggregations.headerToolbar.mAggregations.content[1].setEnabled(true);
//									Caro_page[0].mAggregations.headerToolbar.mAggregations.content[7].setEnabled(true);
								}else{

									act_req.sort(function(version1, version2){ return version2.ZZ_VERSION - version1.ZZ_VERSION; });
									for(var i = 0; i < act_req.length; i++){
										// If current req was approved
										if( act_req[i].ZZ_TRV_REQ == TRV_REQ && act_req[i].ZZ_TRV_KEY == REQ_TYP && 
												act_req[i].ZZ_NROLE   == "" && 	act_req[i].ZZ_ACTION  == ""){

											sReq_Flg = true;
											oThis.getView().byId("btnSave").setEnabled(true);
											oThis.getView().byId("btnEMPSubmmit").setEnabled(true);

											// If current req was reject
										}else if ( act_req[i].ZZ_TRV_REQ == TRV_REQ && act_req[i].ZZ_TRV_KEY == REQ_TYP && 
												act_req[i].ZZ_ACTION  == "08"){

											sReq_Flg = true;
											oThis.getView().byId("btnSave").setEnabled(true);
											oThis.getView().byId("btnEMPSubmmit").setEnabled(true);
											break;

											// If current req is proccessing
										}else if ( act_req[i].ZZ_TRV_REQ == TRV_REQ && act_req[i].ZZ_TRV_KEY == REQ_TYP && 
												act_req[i].ZZ_ACTION  == "02"){

											oThis.getView().byId("btnSave").setEnabled(true);
											oThis.getView().byId("btnEMPSubmmit").setEnabled(true);	
											sReq_Flg  = false;
											sent_back = true;
											break;
											// If current req is proccessing
										}else if ( act_req[i].ZZ_TRV_REQ == TRV_REQ && act_req[i].ZZ_TRV_KEY == REQ_TYP && 
												act_req[i].ZZ_NROLE   == "01" && act_req[i].ZZ_ACTION  == "00"){

											sReq_Flg = false;
											oThis.getView().byId("btnSave").setEnabled(true);
											oThis.getView().byId("btnEMPSubmmit").setEnabled(true);
											break;

										}else if ( act_req[i].ZZ_TRV_REQ == TRV_REQ && act_req[i].ZZ_TRV_KEY == REQ_TYP && 
												act_req[i].ZZ_NROLE   != "" && act_req[i].ZZ_ACTION  != ""){

											sReq_Flg = false;
											oThis.getView().byId("btnSave").setEnabled(false);
											oThis.getView().byId("btnEMPSubmmit").setEnabled(false);

											//set visible for reim letter
											oThis.getView().byId("idReimLeterLink").setEnabled(true);
											break;

										}
									};

									// After check flag above. If true -> all current reqs was approved.
									// End user can create new req
									if (sReq_Flg == true){
										oThis.onNewRequestVersion(PERNR, TRV_REQ, REQ_TYP);	
									}

									Caro_page = oThis.getView().byId("itemdetail").getPages();

									//Update value for header toolbar (Total amount)
									for(var k = 0; k < aDetail.length;){
										for(var i = 0; i < Caro_page.length; i++, k++){

											// Update Header Value for each caro page		
											var aItem_Array = Caro_page[i].mAggregations.items;
											if(aItem_Array){
												for(var j = 0; j < Caro_page[i].mAggregations.items.length; j++ ){
													if(Caro_page[i].mAggregations.items[j].mAggregations.cells[5].getValue() != ""){
														sTotalAmount = sTotalAmount + parseFloat(Caro_page[i].mAggregations.items[j].mAggregations.cells[5].getValue());
													}
													if(Caro_page[i].mAggregations.items[j].mAggregations.cells[6].getValue() != ""){
														sVATAmount   = sVATAmount   + parseFloat(Caro_page[i].mAggregations.items[j].mAggregations.cells[6].getValue());
													}
													if(Caro_page[i].mAggregations.items[j].mAggregations.cells[7].getValue() != ""){
														sNetAmount   = sNetAmount   + parseFloat(Caro_page[i].mAggregations.items[j].mAggregations.cells[7].getValue());
													}

												}

											}

											//tgg1hc
											oModel.getData().reimhdr[i].sTotalAmount = sTotalAmount;
											oModel.getData().reimhdr[i].sVATAmount = sVATAmount;
											oModel.getData().reimhdr[i].sNetAmount = sNetAmount;

											Caro_page[i].mAggregations.headerToolbar.mAggregations.content[7].setSelectedKey(aDetail[k].WAERS);		
										}

									}
								}

								for(var i = 0; i < oData.reimhdr.length; i++){
									for(var j = 0; j< oData.reimhdr[i].ZE2E_REI_DETAIL.results.length; j++){
										oData.reimhdr[i].ZE2E_REI_DETAIL.results[j].INDEX = i;
										oData.reimhdr[i].ZE2E_REI_DETAIL.results[j].LENGTH  = oData.reimhdr.length;
										oData.reimhdr[i].ZE2E_REI_DETAIL.results[j].REQFLG  = sReq_Flg;
										oData.reimhdr[i].ZE2E_REI_DETAIL.results[j].ACT     = act_req;
										oModel.setProperty("/Role" , currentRole);
										oModel.setProperty("/act_req" , act_req);
										oModel.setProperty("/LENGTH" , oData.reimhdr.length);
										oModel.setProperty("/REQFLG" , sReq_Flg);
										oModel.setProperty("/INDEX" , i);
									}
								}													

								// get info comments tab
								sap.ui.project.e2etm.util.StaticUtility.getComment(TRV_REQ, REQ_TYP, "REIM",oThis);
								sap.ui.project.e2etm.util.StaticUtility.getDocumentList(oThis,oData.trvhdr.ZZ_REINR, oData.trvhdr.ZZ_PERNR,"REIM","REIM",oData.trvhdr.ZZ_LAND1);
								sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oThis);

								// set display button
								oThis.checkRoleToDisplay(currentRole,"NONE");	

								// generate letter TGG1HC
								var sVersion = oThis.getView().byId("itemdetail").getPages().length;
								var sUrl = sServiceUrl + "TravelPdfSet(EmpNo='{0}',TrNo='{1}',TrvKey='{2}',Module='{3}')/$value"; //sua module nay
								sUrl = sUrl.replace("{0}", sVersion);
								sUrl = sUrl.replace("{1}", TRV_REQ);
								sUrl = sUrl.replace("{2}", REQ_TYP);
								sUrl = sUrl.replace("{3}", "REIM");

								oThis.getView().byId('idReimLeterLink').setHref(sUrl);

								//do for forex card
								oThis.getForexCard(PERNR,oThis,oModel, oThis.getView().byId("itemdetail"),"OPEN");	


								if (oModel.getData().forexCard.CARDNO != "" && oModel.getData().bankdetail.Bkact != ""){
									oThis.getView().byId("bankPanel").setVisible(true);
									oThis.getView().byId("cardPanel").setVisible(false);	
									oThis.getView().byId("empty").setVisible(false);
									
								}else if(oModel.getData().forexCard.CARDNO == "" && oModel.getData().bankdetail.Bkact == ""){
									oThis.getView().byId("empty").setVisible(true);
									oThis.getView().byId("bankPanel").setVisible(false);
									oThis.getView().byId("cardPanel").setVisible(false);	
								}else{
									if(oModel.getData().bankdetail.Bkact != ""){
										oThis.getView().byId("bankPanel").setVisible(true);
										oThis.getView().byId("cardPanel").setVisible(false);
										oThis.getView().byId("empty").setVisible(false);
									}else if (oModel.getData().forexCard.CARDNO != ""){
										oThis.getView().byId("bankPanel").setVisible(false);
										oThis.getView().byId("cardPanel").setVisible(true);
										oThis.getView().byId("empty").setVisible(false);
									}
								}

							},
							function(error){
								alert("No data found");
								sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oThis);
							});

				}else{ // in case of admin Binoculus click to detail

					//Create an JSON model
					var oModel = new sap.ui.model.json.JSONModel();

					//Set data to new item root
					this.getView().setModel(oModel,"new");

					var reimAdminData  = sap.ui.getCore().getModel("reimAdminData").getData();		


					var	sPernr         = reimAdminData.oData.ZZ_OWNER;
					var	sType          = reimAdminData.oData.ZZ_TRV_KEY;
					var	sTravelRequest = reimAdminData.oData.ZZ_TRV_REQ;
					var	sVersion       = reimAdminData.oData.ZZ_VERSION.trim();
					var sVISA_PLAN     = reimAdminData.oData.ZZ_VISA_PLAN;
					var filterTab      = reimAdminData.filterTab;

					var oRole = this.getView().getModel("new");
					oRole.setProperty("/Role" , currentRole);		
					this.getView().getModel("new").setData(oRole.getData());

					this.doInit(sPernr,sTravelRequest,sType, sVISA_PLAN, sVersion);						

					var oData = oModel.getData();

					sap.ui.project.e2etm.util.StaticUtility.getComment(sTravelRequest, sType, "REIM",this);
					//fix bug CTG, PE-Admin does not display attachment - CNY1HC
					sap.ui.project.e2etm.util.StaticUtility.getDocumentList(this,sTravelRequest, sPernr,"REIM","REIM",reimAdminData.oData.TRV_HDR.ZZ_LAND1);
					this.checkRoleToDisplay(currentRole,reimAdminData.filterTab);
				}

			}
		}
		// do for reimbursement admin Binoculus
		else if(evt.getParameter("name")=="reimbursementAdmin") {
			if(this.getView().sViewName == "sap.ui.project.e2etm.view.ReimbursementAdmin"){
				sap.ui.project.e2etm.util.StaticUtility.setBusy(true,this);
				// create model list of reimbursements 
				var oModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(oModel,"listReim");

				//get profile
				if(sap.ui.getCore().getModel("reimAdminData")){
					var filterTab = sap.ui.getCore().getModel("reimAdminData").getData().filterTab;
				}else{
					var filterTab = this.getView().byId("idIconTabBarReimAdmin").getSelectedKey();
				}
				//set counts
				this.getView().byId("idIconTabBarReimAdmin").getItems()[0].setCount("");
				this.getView().byId("idIconTabBarReimAdmin").getItems()[1].setCount("");
				//get reimbursement list  	
				this.getFilter(filterTab,"");
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false,this);
			}else{

			}
		}
	},

	//When click button Back
	onNavButton: function(){
		sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
	},

	//When click button Save 
	onSaveData:function(oEvent){

		var oRole = "";
		var oAction = "";

		// Employee Submit
		if( sap.ui.getCore().getModel("profile").getData().currentRole == "EMP" ){
			oRole = "01";
			oAction = "00";
		}
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true,this);

		var oThis = this;
		var sError; 		
		var sError = this.doCheckRequestAmount();

		var oModel = oThis.getView().getModel("new");
		var Caro_Page = this.getView().byId("itemdetail").getPages();

		var ZZ_VISA_PLAN;
		if(sap.ui.getCore().getModel("profile").getData().currentRole=="EMP"){
			ZZ_VISA_PLAN = sap.ui.getCore().getModel("oRequest").getData().ZZ_VISA_PLAN + "";	
		}else{
			ZZ_VISA_PLAN =	sap.ui.getCore().getModel("reimAdminData").getData().oData.VISA_PLAN;
		}
		//Preparing Reimbursement Header
		var oReimHeader = {
				ZZ_OWNER     : oModel.getData().trvhdr.ZZ_PERNR,
				ZZ_TRV_REQ   : oModel.getData().trvhdr.ZZ_REINR,
				ZZ_TRV_KEY   : oModel.getData().trvhdr.ZZ_TRV_TYP,
				ZZ_VERSION   : this.getView().byId("itemdetail").getPages().length + "",
				ZZ_COUNTRY_G : oModel.getData().trvhdr.ZZ_LAND1,
				WAERS		 : oModel.getData().reimhdr[0].WAERS,
				ZZ_VISA_PLAN : ZZ_VISA_PLAN,
				ZZ_TOTAL_NET :  Math.round(oModel.getData().reimhdr[0].sTotalAmount * 1000) / 1000 + "",
				ZZ_TOTAL_VAT :  Math.round(oModel.getData().reimhdr[0].sVATAmount * 1000) / 1000 + "",
				ZZ_AMOUNT    : Math.round(oModel.getData().reimhdr[0].sNetAmount * 1000) / 1000  + "",	
				ZZ_FAMILY_ACCOMP: sap.ui.getCore().getModel("oRequest").getData().ZZ_FAMILY_ACCOMP,
				ZZ_SP_CMPNY: sap.ui.getCore().getModel("oRequest").getData().ZZ_SP_CMPNY,
		};

		oModel.setProperty("/newreimreq" , oReimHeader);
		oThis.getView().getModel("new").setData(oModel.getData());

		var data = this.getView().getModel("new").getData().reimhdr;
		var array = [];
		for(var i = 0; i < data.length; i++){
			array.push(data[i].ZE2E_REI_DETAIL.results);
		};

		var item_array = [];
		var newimdex = array.length - 1;

		for(var j = 0; j < array[0].length; j++){

			delete array[0][j].INDEX;
			delete array[0][j].LENGTH;
			delete array[0][j].REQFLG;
			delete array[0][j].ACT;

			if(array[0][j].ZZ_VERSION == ""){	

				array[0][j].ZZ_VERSION = this.getView().byId("itemdetail").getPages().length + "";
				array[0][j].SEQNR = (j + 1) +"";

			}else{
				var ver = array[0][j].ZZ_VERSION;
				array[0][j].ZZ_VERSION = ver + "";
				array[0][j].SEQNR = (j + 1) + "";
			}

			if(array[0][j].ZZ_EXP_TYPE == ""){
				array[0][j].ZZ_EXP_TYPE = "01";
			}

			if(array[0][j].ZZ_EXP_INCUR == ""){
				array[0][j].ZZ_EXP_INCUR = "01";
			}

			array[0][j].ZZ_AMOUNT   = array[0][j].ZZ_AMOUNT + "";
			array[0][j].ZZ_VAT      = array[0][j].ZZ_VAT + "";
			array[0][j].ZZ_AMOUNT_N = array[0][j].ZZ_AMOUNT_N + "";

			if(array[0][j].ZZ_AMOUNT.trim() != "0" && array[0][j].ZZ_AMOUNT.trim() != ""){
				item_array.push(array[0][j]);
			}

		}

		if(item_array.length != 0){
			var aReimItem = item_array;
			var oData     = oModel.getData();	

			for( var i = 0; i < aReimItem.length; i++ ){
				if(aReimItem[i].__metadata != "" || aReimItem[i].__metadata!= "undefined"){
					delete aReimItem[i].__metadata;
				}
			}

			oData.newreimreq.ZE2E_REI_DETAIL = aReimItem;

			//Check total amount(line item level) with the standard amount 
			var sError = this.doCheckRequestAmount();

			var sMDModid = "REIM";

			if(sError == ""){
				if(this.getView().byId("UploadCollection").getItems().length > 0){
					this.setAttchementChk(oData);

					oThis.getView().getModel().setHeaders({role: oRole,action: oAction, modid: sMDModid, comment: "" });	
					this.doModify(oAction,oRole,oEvent, "");

				}else{
					for(var i = 0; i < aReimItem.length; i++){
						if(aReimItem[i].ZZ_NATURE == "01"){
							sap.m.MessageToast.show("Please attach course and costs details received from the institute (pdf)");
							break;
						}else{
							sap.m.MessageToast.show("Please attach pdf copy of your bills to proceed");							
						}
					}
				}
			}else{
				sap.m.MessageToast.show(sError);
			}
		}else{
			sap.m.MessageToast.show("The line items are empty. The request cannot proccess");	
		}

		sap.ui.project.e2etm.util.StaticUtility.setBusy(false,this);
	},

	onEMPSubmitData:function(oEvent){		

		var oThis = this;
		var sError; 		
		var sError = this.doCheckRequestAmount();

		var oModel = oThis.getView().getModel("new");
		var Caro_Page = this.getView().byId("itemdetail").getPages();

		var ZZ_VISA_PLAN;
		if(sap.ui.getCore().getModel("profile").getData().currentRole=="EMP"){
			ZZ_VISA_PLAN = sap.ui.getCore().getModel("oRequest").getData().ZZ_VISA_PLAN + "";	
		}else{
			ZZ_VISA_PLAN =	sap.ui.getCore().getModel("reimAdminData").getData().oData.VISA_PLAN;
		}
		//Preparing Reimbursement Header
		var oReimHeader = {
				ZZ_OWNER     : oModel.getData().trvhdr.ZZ_PERNR,
				ZZ_TRV_REQ   : oModel.getData().trvhdr.ZZ_REINR,
				ZZ_TRV_KEY   : oModel.getData().trvhdr.ZZ_TRV_TYP,
				ZZ_VERSION   : this.getView().byId("itemdetail").getPages().length + "",
				ZZ_COUNTRY_G : oModel.getData().trvhdr.ZZ_LAND1,
				WAERS		 : oModel.getData().reimhdr[0].WAERS,
				ZZ_VISA_PLAN : ZZ_VISA_PLAN,
				ZZ_TOTAL_NET :  Math.round(oModel.getData().reimhdr[0].sTotalAmount * 1000) / 1000 + "",
				ZZ_TOTAL_VAT :  Math.round(oModel.getData().reimhdr[0].sVATAmount * 1000) / 1000 + "",
				ZZ_AMOUNT    : Math.round(oModel.getData().reimhdr[0].sNetAmount * 1000) / 1000  + "",			
				ZZ_FAMILY_ACCOMP: sap.ui.getCore().getModel("oRequest").getData().ZZ_FAMILY_ACCOMP,
				ZZ_SP_CMPNY: sap.ui.getCore().getModel("oRequest").getData().ZZ_SP_CMPNY,
		};

		oModel.setProperty("/newreimreq" , oReimHeader);
		oThis.getView().getModel("new").setData(oModel.getData());

		var data = this.getView().getModel("new").getData().reimhdr;
		var array = [];
		for(var i = 0; i < data.length; i++){
			array.push(data[i].ZE2E_REI_DETAIL.results);
		};

		var item_array = [];
		var newimdex = array.length - 1;

		for(var j = 0; j < array[0].length; j++){

			delete array[0][j].INDEX;
			delete array[0][j].LENGTH;
			delete array[0][j].REQFLG;
			delete array[0][j].ACT;

			if(array[0][j].ZZ_VERSION == ""){	

				array[0][j].ZZ_VERSION = this.getView().byId("itemdetail").getPages().length + "";
				array[0][j].SEQNR = (j + 1) +"";

			}else{
				var ver = array[0][j].ZZ_VERSION;
				array[0][j].ZZ_VERSION = ver + "";
				array[0][j].SEQNR = (j + 1) + "";
			}

			if(array[0][j].ZZ_EXP_TYPE == ""){
				array[0][j].ZZ_EXP_TYPE = "01";
			}

			if(array[0][j].ZZ_EXP_INCUR == ""){
				array[0][j].ZZ_EXP_INCUR = "01";
			}

			array[0][j].ZZ_AMOUNT   = array[0][j].ZZ_AMOUNT + "";
			array[0][j].ZZ_VAT      = array[0][j].ZZ_VAT + "";
			array[0][j].ZZ_AMOUNT_N = array[0][j].ZZ_AMOUNT_N + "";

			if(array[0][j].ZZ_AMOUNT.trim() != "0" && array[0][j].ZZ_AMOUNT.trim() != ""){
				item_array.push(array[0][j]);
			}

		}

		if(item_array.length != 0){
			var aReimItem = item_array;
			var oData     = oModel.getData();	

			for( var i = 0; i < aReimItem.length; i++ ){
				if(aReimItem[i].__metadata != "" || aReimItem[i].__metadata!= "undefined"){
					delete aReimItem[i].__metadata;
				}
			}

			oData.newreimreq.ZE2E_REI_DETAIL = aReimItem;

			//Check total amount(line item level) with the standard amount 
			var sError = this.doCheckRequestAmount();

			var sMDModid = "REIM";


			if(sError == ""){
				if(this.getView().byId("UploadCollection").getItems().length > 0){
					this.setAttchementChk(oData);

					var dialog = new sap.m.Dialog({
						title: 'Confirm',
						type: 'Message',
						content: [
						          new sap.m.Text({ text: 'Are you sure you want to submit this request ? ' }),
						          new sap.m.TextArea('submitDialogTextarea', {
						        	  liveChange: function(oEvent) {
						        		  var sText = oEvent.getParameter('value');
						        		  var parent = oEvent.getSource().getParent();

						        		  parent.getBeginButton().setEnabled(sText.length > 0);
						        	  },
						        	  width: '100%',
						        	  placeholder: 'Please enter comment (Optional)'
						          }) 
						          ],
						          beginButton: new sap.m.Button({
						        	  text: 'Submit',
						        	  enabled: true,
						        	  press: function () {

						        		  var sText = sap.ui.getCore().byId('submitDialogTextarea').getValue();
						        		  var oRole = "";
						        		  var oAction = "";
						        		  
						        		  if(sText!="")
						        			  sText = sText.replace(/\n/g, " ");

						        		  // Employee Submit
						        		  if( sap.ui.getCore().getModel("profile").getData().currentRole == "EMP" ){
						        			  oRole = "01";
						        			  oAction = "01";
						        		  }
						        		  oThis.getView().getModel().setHeaders({role: oRole,action: oAction, modid: sMDModid, comment: sText });	
						        		  oThis.doModify(oAction,oRole,oEvent, sText);

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
					for(var i = 0; i < aReimItem.length; i++){
						if(aReimItem[i].ZZ_NATURE == "01"){
							sap.m.MessageToast.show("Please attach course and costs details received from the institute (pdf)");
							break;
						}else{
							sap.m.MessageToast.show("Please attach pdf copy of your bills to proceed");							
						}
					}
				}
			}else{
				sap.m.MessageToast.show(sError);
			}

		}else{
			sap.m.MessageToast.show("The line items are empty. The request cannot proccess");	
		}
	},

//	When click button Submit
	onSubmitData:function(oEvent){
		var oRole = "";
		var oAction = "";

		// Employee Submit
		if( sap.ui.getCore().getModel("profile").getData().currentRole == "EMP" ){
			oRole = "01";
			oAction = "01";

			//Admin	
		}else{	
			oRole = "10";
			oAction ="03";
		}
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true,this);
		this.doModify(oAction,oRole,oEvent);
		sap.ui.project.e2etm.util.StaticUtility.setBusy(false,this);	
	},

	//When click button Reject
	onReject:function(oEvent){

		var oThis = this;

		var dialog = new sap.m.Dialog({
			title: 'Confirm',
			type: 'Message',
			content: [
			          new sap.m.Text({ text: 'Are you sure you want to reject this request ?' }),
			          new sap.m.TextArea('submitDialogTextarea', {
			        	  liveChange: function(oEvent) {

			        		  var sText = oEvent.getParameter('value');
			        		  var parent = oEvent.getSource().getParent();

			        		  parent.getBeginButton().setEnabled(sText.length > 0);
			        	  },
			        	  width: '100%',
			        	  placeholder: 'Please enter comment (Mandatory)'
			          })
			          ],
			          beginButton: new sap.m.Button({
			        	  text: 'Reject',
			        	  enabled: false,
			        	  press: function () {

			        		  sap.ui.project.e2etm.util.StaticUtility.setBusy(true,oThis);

			        		  var sText = sap.ui.getCore().byId('submitDialogTextarea').getValue();

			        		  var oData = oThis.getView().getModel("new").getData();

			        		  var sUrl = sServiceUrl + "ReqReject?ZZ_TRV_REQ='{0}'&ZZ_TRV_KEY='{1}'&ZZ_COMMENTS='{2}'&ZZ_MODID='{3}'&ZZ_VERSION='{4}'&ZZ_NROLE='{5}'&$format=json";

			        		  sUrl = sUrl.replace("{0}", oData.reimhdr[0].ZZ_TRV_REQ);
			        		  sUrl = sUrl.replace("{1}", oData.reimhdr[0].ZZ_TRV_KEY);			        		 
			        		  sUrl = sUrl.replace("{2}", sText);

			        		  // ModID
			        		  sUrl = sUrl.replace("{3}", "REIM");

			        		  // Version
			        		  sUrl = sUrl.replace("{4}", oData.reimhdr[0].ZZ_VERSION);

			        		  // Role			        		 
			        		  switch (oData.Role){
			        		  // BINO approve
			        		  case "REBI":
			        			  sUrl = sUrl.replace("{5}", "10");
			        			  break;

			        			  // Manager approve  
			        		  case "GRM":
			        			  sUrl = sUrl.replace("{5}", "02");
			        			  break;				        		
			        		  };

			        		  var get = $.ajax({
			        			  cache: false,
			        			  url: sUrl,
			        			  type: "GET"
			        		  });
			        		  get.done(function(result){
			        			  sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oThis);
			        			  alert("Request is successfully rejected !");
			        			  oComponent.getModel().refresh();
			        			  sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
			        		  });
			        		  get.fail(function(err) {
			        			  sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oThis);
			        			  alert("Error occurs");
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

	//When click button Send Back
	onSendBack:function(oEvent){

		var oThis = this;

		var dialog = new sap.m.Dialog({
			title: 'Confirm',
			type: 'Message',
			content: [
			          new sap.m.Text({ text: 'Are you sure you want to send back this request ?' }),
			          new sap.m.TextArea('submitDialogTextarea', {
			        	  liveChange: function(oEvent) {
			        		  var sText = oEvent.getParameter('value');
			        		  var parent = oEvent.getSource().getParent();

			        		  parent.getBeginButton().setEnabled(sText.length > 0);
			        	  },
			        	  width: '100%',
			        	  placeholder: 'Please enter comment (Mandatory)'
			          })
			          ],
			          beginButton: new sap.m.Button({
			        	  text: 'Send Back',
			        	  enabled: false,
			        	  press: function () {

			        		  sap.ui.project.e2etm.util.StaticUtility.setBusy(true,oThis);

			        		  var sText = sap.ui.getCore().byId('submitDialogTextarea').getValue();

			        		  var oData = oThis.getView().getModel("new").getData();

			        		  var sUrl = sServiceUrl + "ReqSendback?ZZ_TRV_REQ='{0}'&ZZ_TRV_KEY='{1}'&ZZ_COMMENTS='{2}'&ZZ_MODID='{3}'&ZZ_VERSION='{4}'&ZZ_NROLE='{5}'&$format=json";

			        		  sUrl = sUrl.replace("{0}", oData.reimhdr[0].ZZ_TRV_REQ);
			        		  sUrl = sUrl.replace("{1}", oData.reimhdr[0].ZZ_TRV_KEY);			        		 
			        		  sUrl = sUrl.replace("{2}", sText);

			        		  // ModID
			        		  sUrl = sUrl.replace("{3}", "REIM");

			        		  // Version
			        		  sUrl = sUrl.replace("{4}", oData.reimhdr[0].ZZ_VERSION);

			        		  // Role			        		 
			        		  switch (oData.Role){

			        		  // BINO approve
			        		  case "REBI":
			        			  sUrl = sUrl.replace("{5}", "10");
			        			  break;
			        			  // Manager approve  
			        		  case "GRM":
			        			  sUrl = sUrl.replace("{5}", "02");
			        			  break;				        		
			        		  };	

			        		  var get = $.ajax({
			        			  cache: false,
			        			  url: sUrl,
			        			  type: "GET"
			        		  });
			        		  get.done(function(result){
			        			  sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oThis);
			        			  sap.m.MessageToast.show("Request is successfully sent back !");
			        			  oComponent.getModel().refresh();
			        			  sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
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

	onApprove:function(oEvent){

		var oThis = this;

		var dialog = new sap.m.Dialog({
			title: 'Confirm',
			type: 'Message',
			content: [
			          new sap.m.Text({ text: 'Are you sure you want to approve this request ? ' }),
			          new sap.m.TextArea('submitDialogTextarea', {
			        	  liveChange: function(oEvent) {
			        		  var sText = oEvent.getParameter('value');
			        		  var parent = oEvent.getSource().getParent();

			        		  parent.getBeginButton().setEnabled(sText.length > 0);
			        	  },
			        	  width: '100%',
			        	  placeholder: 'Please enter comment (Optional)'
			          })
			          ],
			          beginButton: new sap.m.Button({
			        	  text: 'Approve',
			        	  enabled: true,
			        	  press: function () {

			        		  sap.ui.project.e2etm.util.StaticUtility.setBusy(true,oThis);

			        		  var sText = sap.ui.getCore().byId('submitDialogTextarea').getValue();

			        		  var oData = oThis.getView().getModel("new").getData();

			        		  var sUrl = sServiceUrl + "ReqApprove?ZZ_TRV_REQ='{0}'&ZZ_TRV_KEY='{1}'&ZZ_OWNER='{2}'&ZZ_COMMENTS='{3}'&ZZ_MODID='{4}'&ZZ_VERSION='{5}'&ZZ_NROLE='{6}'&$format=json";

			        		  sUrl = sUrl.replace("{0}", oData.reimhdr[0].ZZ_TRV_REQ);
			        		  sUrl = sUrl.replace("{1}", oData.reimhdr[0].ZZ_TRV_KEY);
			        		  sUrl = sUrl.replace("{2}", oData.reimhdr[0].ZZ_OWNER);
			        		  sUrl = sUrl.replace("{3}", sText);

			        		  // ModID
			        		  sUrl = sUrl.replace("{4}", "REIM");

			        		  // Version
			        		  sUrl = sUrl.replace("{5}", oData.reimhdr[0].ZZ_VERSION);

			        		  // Role
			        		  switch (oData.Role){
			        		  // BINO approve
			        		  case "REBI":
			        			  sUrl = sUrl.replace("{6}", "10");
			        			  break;
			        			  // Payrole Admin
			        		  case "MRCR":
			        			  sUrl = sUrl.replace("{6}", "04");
			        			  break;			        			  
			        			  // Manager approve  
			        		  case "GRM":
			        			  sUrl = sUrl.replace("{6}", "02");
			        			  break;

			        			  // PE Team approve  
			        		  case "REMR":
			        			  sUrl = sUrl.replace("{6}", "05");
			        			  break;

			        			  // Travel settlement approve  
			        		  case "TRST":
			        			  sUrl = sUrl.replace("{6}", "11");
			        			  break;
			        		  };

			        		  var get = $.ajax({
			        			  cache: false,
			        			  url: sUrl,
			        			  type: "GET"
			        		  });
			        		  get.done(function(result){
			        			  sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oThis);
			        			  sap.m.MessageToast.show("Request is successfully approval !");
			        			  oComponent.getModel().refresh();
			        			  sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
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

	//Add new request with new version.
	onNewRequestVersion:function(ZZ_OWNER, ZZ_TRV_REQ, ZZ_TRV_KEY){

		var oModel = this.getView().getModel("new");

		//Create new data
		var aItem = {
				ZZ_OWNER:   ZZ_OWNER,
				ZZ_TRV_REQ: ZZ_TRV_REQ,
				ZZ_TRV_KEY: ZZ_TRV_KEY,
				ZZ_VERSION: "",
				SEQNR: "",
				ZZ_BILL_NO:"",
				ZZ_BILL_DATE: "",
				ZZ_EXP_TYPE:"",
				ZZ_EXP_INCUR:"",
				ZZ_NATURE:"",
				ZZ_AMOUNT: 0,
				ZZ_VAT: 0,
				ZZ_AMOUNT_N:"",				
				ZZ_ATTACEMENT:"",
				ZZ_REMARKS   :""
		};

		var aresults = [];
		aresults.push(aItem);

		var ta = {
				results: aresults,
		};

		var tet = {
				ZZ_OWNER  : ZZ_OWNER,
				ZZ_TRV_KEY: ZZ_TRV_KEY,
				ZZ_TRV_REQ: ZZ_TRV_REQ,
				ZZ_VERSION: "",
				ZZ_COUNTRY_G : oModel.getData().trvhdr.ZZ_LAND1,
				WAERS: "EUR",
				ZE2E_REI_DETAIL: ta
		};

		var oData = this.getView().getModel("new").getData();					
		oData.reimhdr.unshift(tet);

		for(var i = 0; i < oData.reimhdr.length; i++){
			for(var j = 0; j< oData.reimhdr[i].ZE2E_REI_DETAIL.results.length; j++){
				oData.reimhdr[i].ZE2E_REI_DETAIL.results[j].INDEX = i;
				oData.reimhdr[i].ZE2E_REI_DETAIL.results[j].LENGTH  = oData.reimhdr.length;
			}
		}	

		this.getView().getModel("new").setData(oData);				
	},


	//When click on button Add Row
	onAddRow:function(){	

		var oModel = this.getView().getModel("new");
		var newSenr = this.getView().byId("itemdetail").getPages().length;

		//Create new data
		var aItem = {
				ZZ_OWNER:   oModel.getData().trvhdr.ZZ_PERNR,
				ZZ_TRV_REQ: oModel.getData().trvhdr.ZZ_REINR,
				ZZ_TRV_KEY: oModel.getData().trvhdr.ZZ_TRV_TYP,
				ZZ_VERSION: this.getView().byId("itemdetail").getPages().length,
				SEQNR: newSenr + "",
				ZZ_BILL_NO:"",
				ZZ_BILL_DATE:"",
				ZZ_EXP_TYPE:"",
				ZZ_EXP_INCUR:"",
				ZZ_NATURE:"",
				ZZ_AMOUNT:"",
				ZZ_VAT:"",
				ZZ_AMOUNT_N:"",				
				ZZ_ATTACEMENT:"",
				ZZ_REMARKS:""
		};		

		var oData = this.getView().getModel("new").getData();	
		oData.reimhdr[0].ZE2E_REI_DETAIL.results.push(aItem);
		this.getView().getModel("new").setData(oData);		
	},

	//When click on button Delete Row
	onDelRow:function(evt){

		var page  = this.getView().byId("itemdetail").getPages().length;
		var index = page - 1;	
		var sTotalAmount = 0;
		var sVATAmount  = 0;
		var sNetAmount = 0;

		var iItem = this.getView().byId("itemdetail").mAggregations.pages[0].getSelectedItem();	
		var iIndex = this.getView().byId("itemdetail").mAggregations.pages[0].indexOfItem(iItem);

		if( iIndex == -1 ){

			sap.m.MessageToast.show("Please select one row!");
		}else{

			var oData = this.getView().getModel("new").getData();

			oData.reimhdr[0].ZE2E_REI_DETAIL.results.splice(iIndex,1);
			this.getView().getModel("new").setData(oData);

			Caro_page = this.getView().byId("itemdetail").getPages();
			if(Caro_page[0].mAggregations.items != undefined){
				for(var i = 0; i < Caro_page[0].mAggregations.items.length; i++ ){
					if(Caro_page[0].mAggregations.items[i].mAggregations.cells[5].getValue() != ""){
						sTotalAmount = sTotalAmount + parseFloat(Caro_page[0].mAggregations.items[i].mAggregations.cells[5].getValue());
					}
					if(Caro_page[0].mAggregations.items[i].mAggregations.cells[6].getValue() != ""){
						sVATAmount   = sVATAmount   + parseFloat(Caro_page[0].mAggregations.items[i].mAggregations.cells[6].getValue());
					}
					if(Caro_page[0].mAggregations.items[i].mAggregations.cells[7].getValue() != ""){
						sNetAmount   = sNetAmount   + parseFloat(Caro_page[0].mAggregations.items[i].mAggregations.cells[7].getValue());
					}

				}
				oData.reimhdr[0].sTotalAmount = sTotalAmount;
				oData.reimhdr[0].sVATAmount = sVATAmount;
				oData.reimhdr[0].sNetAmount = sNetAmount;

			}else{
				oData.reimhdr[0].sTotalAmount = 0;
				oData.reimhdr[0].sVATAmount = 0;
				oData.reimhdr[0].sNetAmount = 0;
			}
			this.getView().getModel("new").setData(oData);
		}
	},

	//Initialize data for Reimbursement View
	doInit:function(PERNR, TRV_REQ, REQ_TYP, VISA_PLAN, VERSION){	

		var oThis = this;
		var oModel = this.getView().getModel("new");
		oModel.setSizeLimit(200);

		var oDataModel = new sap.ui.model.odata.ODataModel(sServiceUrl);
		
//		oModel.setProperty("/FAMACC", sap.ui.getCore().getModel("oRequest").getData().ZZ_FAMILY_ACCOMP);
//		oModel.setProperty("/SPONSOR", sap.ui.getCore().getModel("oRequest").getData().ZZ_SP_CMPNY);

//		begin of improve performance --02/08/2016		
//		var sPath = "/TRV_HDRSet(ZZ_PERNR='$param1',ZZ_DEP_REQ='$param2',ZZ_VERSION='',ZZ_TRV_TYP='$param3')?$expand=ZE2E_INS_HDR,DEP_EMP,ZE2E_ACC_DETAILSet,TRV_HDRtoTRV_travel_Data/ZE2E_INS_DETAIL/ZE2E_INS_ANS/ZE2E_INS_QA";
		var sPath = "/TRV_HDRSet(ZZ_PERNR='$param1',ZZ_DEP_REQ='$param2',ZZ_VERSION='',ZZ_TRV_TYP='$param3')?$expand=DEP_EMP";
//		end of improve performance --02/08/2016
		
		sPath = sPath.replace("$param1",PERNR);
		sPath = sPath.replace("$param2",TRV_REQ);
		sPath = sPath.replace("$param3",REQ_TYP);		
		var batchOperation0 = oDataModel.createBatchOperation(sPath, "GET");

		var sPath_1 = "/ZE2E_REI_HDRSet?$filter=ZZ_TRV_REQ+eq+'{0}'+and+ZZ_OWNER+eq+'{1}'+and+ZZ_TRV_KEY+eq+'{2}'+and+ZZ_VERSION+eq+'{3}'+and+WAERS+eq+'T'&$expand=ZE2E_REI_DETAIL ";		
		sPath_1 = sPath_1.replace("{0}", TRV_REQ);
		sPath_1 = sPath_1.replace("{1}", PERNR);
		sPath_1 = sPath_1.replace("{2}", REQ_TYP);
		sPath_1 = sPath_1.replace("{3}", "0");
		var batchOperation1 = oDataModel.createBatchOperation(sPath_1, "GET");

		var sPath_2 = "/DEP_VISA_PLANSet('$param4')";		
		sPath_2 = sPath_2.replace('$param4',VISA_PLAN);
		var batchOperation2 = oDataModel.createBatchOperation(sPath_2, "GET");

		var sPath_4 = "/ZE2E_REI_EXPENSESet?$filter=ZZ_NATURE+eq+'{0}'+and+ZZ_COUNTRY_G+eq+'{1}'+and+ZZ_DESCIPTION+eq+'{2}'";
		sPath_4 = sPath_4.replace("{0}", "");
		sPath_4 = sPath_4.replace("{1}", sap.ui.getCore().getModel("reimAdminData").getData().oData.ZZ_COUNTRY_G);
		sPath_4 = sPath_4.replace("{2}", oModel.getData().Role);
		var batchOperation4 = oDataModel.createBatchOperation(sPath_4, "GET");

		var sPath_5 = "/BankDetailsSet(EmpNo='$param1',TravelPlan='$param2',TravelType='$param3')";
		sPath_5 = sPath_5.replace("$param1",PERNR);
		sPath_5 = sPath_5.replace("$param2",TRV_REQ);
		sPath_5 = sPath_5.replace("$param3",REQ_TYP);

		var batchOperation5 = oDataModel.createBatchOperation(sPath_5, "GET");

		// TGG1HC get message
		var batchOperation7 = oDataModel.createBatchOperation("GetF4Table?TableName='ZE2E_DEP_TAX_C'&Col1='ZZ_LAND1'&Col2=''&Col3=''&Col4=''&Col5=''&Col6=''&Col7=''&Col8=''&Col9=''&Col10=''&$format=json", "GET");
		var batchOperation8 = oDataModel.createBatchOperation("GetConstant?CONST='BILL_ADDR'&SELPAR='NONPE'&$format=json", "GET");
		var batchOperation9 = oDataModel.createBatchOperation("GetConstant?CONST='BILL_ADDR'&SELPAR='PE'&$format=json", "GET");

		oComponent.getModel().addBatchReadOperations([batchOperation0, 
		                                              batchOperation1, 
		                                              batchOperation2, 
//		                                              batchOperation3, 
		                                              batchOperation4, 
		                                              batchOperation5,
		                                              batchOperation7,
		                                              batchOperation8,
		                                              batchOperation9,]);

		oComponent.getModel().submitBatch(
				function(oResult){

					// Get Travelling Data
					var aTrv_HRD = oResult.__batchResponses[0].data;
					oModel.setProperty("/trvhdr" , aTrv_HRD);		

					// Get Riemburstment Data
					var aReim_HDR = oResult.__batchResponses[1].data.results;
					oModel.setProperty("/reimhdr" , aReim_HDR);
					
					//set familly accommodation
					oModel.setProperty("/FAMACC", aReim_HDR[0].ZZ_FAMILY_ACCOMP);
					oModel.setProperty("/SPONSOR", aReim_HDR[0].ZZ_SP_CMPNY);


					// Get Visa Data
					var aVisa = oResult.__batchResponses[2].data;
					oModel.setProperty("/visa", aVisa);

					var aCurrecy = [];
					var sCurrency = "/GetF4Help?Srch_help='F4_TCURC_ISOCD'&ZZ_SMODID='$currency'&$format=json";
					$currency = oThis.getView().getModel("new").getData().trvhdr.ZZ_SMODID;
					oThis.getView().getModel().read(sCurrency,{
						async: false,
						success: function(evt){
							aCurrecy = evt.results;
						},
						error: function(error){
							alert(error);	
						}
					});	

					oModel.setProperty("/currency" , aCurrecy);

					// Get Nature Expense Data
					var aNatureExp = oResult.__batchResponses[3].data.results;
					oModel.setProperty("/natureexp" , aNatureExp);

					//Get Bank's Information
					var bankDetail = oResult.__batchResponses[4].data;
					oModel.setProperty("/bankdetail" , bankDetail);

					// Get PE Country list TGG1HC
					var aPECountry = oResult.__batchResponses[5].data.results;

					// Get address NONPE 
					var aNONPE = oResult.__batchResponses[6].data.GetConstant;

					// Get address PE 
					var aPE = oResult.__batchResponses[7].data.GetConstant;
					//get address
					var address ="";

					for(var i =0; i<aPECountry.length; i++){
						if(aPECountry[i].FIELD1 == oModel.getData().trvhdr.ZZ_LAND1){
							address = aPE;
							break;
						}else if(aPECountry[i].FIELD1 != oModel.getData().trvhdr.ZZ_LAND1){
							address = aNONPE;										
						}

					}
					oModel.setProperty("/address" , address.VALUE);

					var sTotalAmount = 0;
					var sVATAmount   = 0;
					var sNetAmount   = 0;

					var aDetail = oModel.getData().reimhdr;
					var Caro_page = oThis.getView().byId("itemdetail").getPages();

					for(var k = 0; k < aDetail.length;){
						for(var i = 0; i < Caro_page.length; i++, k++){
							// Update Header Value for each caro page
							sTotalAmount = 0;
							sVATAmount   = 0;
							sNetAmount   = 0;

							var aItem_Array = Caro_page[i].mAggregations.items;
							for(var j = 0; j < Caro_page[i].mAggregations.items.length; j++ ){
								sTotalAmount = sTotalAmount + parseFloat(Caro_page[i].mAggregations.items[j].mAggregations.cells[5].getValue());
								sVATAmount   = sVATAmount   + parseFloat(Caro_page[i].mAggregations.items[j].mAggregations.cells[6].getValue());
								sNetAmount   = sNetAmount   + parseFloat(Caro_page[i].mAggregations.items[j].mAggregations.cells[7].getValue());
							}
							Caro_page[i].mAggregations.headerToolbar.mAggregations.content[4].setValue(sTotalAmount);
							Caro_page[i].mAggregations.headerToolbar.mAggregations.content[5].setValue(sVATAmount);
							Caro_page[i].mAggregations.headerToolbar.mAggregations.content[6].setValue(sNetAmount);		

							//TGG1HC
							Caro_page[i].mAggregations.headerToolbar.mAggregations.content[7].setSelectedKey(aDetail[k].WAERS);

						}

					}

					var Caro_page = oThis.getView().byId("itemdetail").getPages();	

//					for(var i = 0; i < Caro_page.length; i++){							
//						Caro_page[i].mAggregations.headerToolbar.mAggregations.content[0].setEnabled(false);
//						Caro_page[i].mAggregations.headerToolbar.mAggregations.content[1].setEnabled(false);
//						Caro_page[i].mAggregations.headerToolbar.mAggregations.content[7].setEnabled(false);
//					}

					// generate letter TGG1HC
					var sVersion = oThis.getView().byId("itemdetail").getPages().length;
					var sUrl = sServiceUrl + "TravelPdfSet(EmpNo='{0}',TrNo='{1}',TrvKey='{2}',Module='{3}')/$value"; //sua module nay
					sUrl = sUrl.replace("{0}", sVersion);
					sUrl = sUrl.replace("{1}", TRV_REQ);
					sUrl = sUrl.replace("{2}", REQ_TYP);
					sUrl = sUrl.replace("{3}", "REIM");

					oThis.getView().byId('idReimLeterLink').setHref(sUrl);
					//set visible for reim letter
					oThis.getView().byId("idReimLeterLink").setEnabled(true);

					//do for forex card
					oThis.getForexCard(PERNR,oThis,oModel, oThis.getView().byId("itemdetail"),"OPEN");
					
					if (oModel.getData().forexCard.CARDNO != "" && oModel.getData().bankdetail.Bkact != ""){
						oThis.getView().byId("bankPanel").setVisible(true);
						oThis.getView().byId("cardPanel").setVisible(false);
						oThis.getView().byId("empty").setVisible(false);
					}else if(oModel.getData().forexCard.CARDNO == "" && oModel.getData().bankdetail.Bkact == ""){
						oThis.getView().byId("empty").setVisible(true);
						oThis.getView().byId("bankPanel").setVisible(false);
						oThis.getView().byId("cardPanel").setVisible(false);	
					}else{
						if(oModel.getData().bankdetail.Bkact != ""){
							oThis.getView().byId("bankPanel").setVisible(true);
							oThis.getView().byId("cardPanel").setVisible(false);
							oThis.getView().byId("empty").setVisible(false);
						}else if (oModel.getData().forexCard.CARDNO != ""){
							oThis.getView().byId("bankPanel").setVisible(false);
							oThis.getView().byId("cardPanel").setVisible(true);
							oThis.getView().byId("empty").setVisible(false);
						}
					}

					sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oThis);

				},
				function(error){
					alert("No data found");
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oThis);
				});	

	},

	//Get nature expense data
	onInitializeNexpense:function(oModel){

		//Get nature of expense data
		var aNatureExp = [];
		var sCurrency = "/ZE2E_REI_EXPENSESet";		
		this.getView().getModel().read(sCurrency,{
			async: false,
			success: function(evt){
				aNatureExp = evt.results;
			},
			error: function(error){
				alert(error);	
			}
		});	

		oModel.setProperty("/natureexp" , aNatureExp);
		this.getView().getModel("new").setData(oModel.getData());
	},	

	onInitializeBankInfo:function(oModel){
		//Get nature of expense data
		var bankDetail = [];

		var sZZ_OWNER   = oModel.getData().trvhdr.ZZ_PERNR;
		var sZZ_TRV_REQ = oModel.getData().trvhdr.ZZ_REINR;
		var sZZ_TRV_KEY = oModel.getData().trvhdr.ZZ_TRV_TYP;

		var sPath = "/BankDetailsSet(EmpNo='$param1',TravelPlan='$param2',TravelType='$param3')";

		sPath = sPath.replace("$param1",sZZ_OWNER);
		sPath = sPath.replace("$param2",sZZ_TRV_REQ);
		sPath = sPath.replace("$param3",sZZ_TRV_KEY);

		this.getView().getModel().read(sPath,{
			async: false,
			success: function(evt){
				bankDetail = evt;
			},
			error: function(error){
				alert(error);	
			}
		});	

		oModel.setProperty("/bankdetail" , bankDetail);
		this.getView().getModel("new").setData(oModel.getData());
	},

	//Convert the SAP flag ('X' or blank) to SAPUI5 flag (true, false)
	setAttchementChk:function(oData){
		var anewRedArray = oData.newreimreq.ZE2E_REI_DETAIL;
		var caro_page = this.getView().byId("itemdetail").getPages();
		var table = caro_page[0].mAggregations.items;
		for (var i = 0; i< table.length;i++ ){
			var inputChek = table[i].mAggregations.cells[8].getSelected();
			if(table[i].mAggregations.cells[5].getValue() != "" && table[i].mAggregations.cells[5].getValue() != "0"){
				if(inputChek == true){
					anewRedArray[i].ZZ_ATTACEMENT = "X";
				}else{
					anewRedArray[i].ZZ_ATTACEMENT = "";
				}
			}

		}
	}, 

	doCheckSelfAmount:function(){

		var oModel = this.getView().getModel("new");
		var sFError = "";
		var total_amount = 0;
		var fix_amount = 0;
		var monthly_amount = 0;
		var aInputAmount = [];
		var bill_date = "";
		var reqstt = oModel.getData().reqstt;
		var rejectindex = 0;

		var aStandardAmount = [];

		var sPath = "/ZE2E_REI_ELISet";
		this.getView().getModel().read(sPath,{
			async: false,
			success: function(evt){
				aStandardAmount = evt.results;				
			},
			error: function(error){
				alert(error);	
			}
		});

		var sWAERS = oModel.getData().reimhdr[0].WAERS;	

		for(var i = 0; i < oModel.getData().reimhdr.length; i++){
			if(oModel.getData().reimhdr[i].WAERS == sWAERS){				
				for(var j = 0; j < oModel.getData().reimhdr[i].ZE2E_REI_DETAIL.results.length; j++){
					aInputAmount.push(oModel.getData().reimhdr[i].ZE2E_REI_DETAIL.results[j]);	
				}
			}
		}		

		//get Reject version
		if(reqstt.length != 0){
			for(var i = 0; i < reqstt.length; i++){
				if(reqstt[i].ZZ_ACTION == "08"){
					for( j = 0; j < aInputAmount.length; j++){
						if(aInputAmount[j].ZZ_VERSION == reqstt[i].ZZ_VERSION ){
							aInputAmount.splice(j);
						}
					}

				}
			}
		}

		var maxVersion = aInputAmount[0].ZZ_VERSION;
		for(i = 0; i < aStandardAmount.length; i++){
			for(var j = 0; j < aInputAmount.length; j++){

				if (    
						aInputAmount[j].ZZ_EXP_INCUR == aStandardAmount[i].ZZ_EXP_INCUR &&
						aInputAmount[j].ZZ_NATURE == aStandardAmount[i].ZZ_NATURE &&  
						aStandardAmount[i].ZZ_COUNTRY_G == oModel.getData().trvhdr.ZZ_LAND1 &&
						aStandardAmount[i].ZE2E_AMOUNT_T == "T"){

					total_amount = total_amount + parseFloat(aInputAmount[j].ZZ_AMOUNT_N);					
				}

				if (    
						aInputAmount[j].ZZ_EXP_INCUR == aStandardAmount[i].ZZ_EXP_INCUR &&
						aInputAmount[j].ZZ_NATURE == aStandardAmount[i].ZZ_NATURE && 
						aInputAmount[j].ZZ_VERSION == maxVersion &&
						aStandardAmount[i].ZZ_COUNTRY_G == oModel.getData().trvhdr.ZZ_LAND1 &&
						aStandardAmount[i].ZE2E_AMOUNT_T == "F"){

					fix_amount = parseFloat(aInputAmount[j].ZZ_AMOUNT_N);					
				}

				if (    
						aInputAmount[j].ZZ_EXP_INCUR == aStandardAmount[i].ZZ_EXP_INCUR &&
						aInputAmount[j].ZZ_NATURE == aStandardAmount[i].ZZ_NATURE && 						
						aStandardAmount[i].ZZ_COUNTRY_G == oModel.getData().trvhdr.ZZ_LAND1 &&
						aStandardAmount[i].ZE2E_AMOUNT_T == "M"){

					if(bill_date == ""){
						bill_date = aInputAmount[j].ZZ_BILL_DATE.substring(4, 6);
					}

					if(bill_date == aInputAmount[j].ZZ_BILL_DATE.substring(4, 6)){
						monthly_amount = monthly_amount + parseFloat(aInputAmount[j].ZZ_AMOUNT_N);
					}

				}

			}

			for(var j = 0; j < aInputAmount.length; j++){
				aInputAmount[j].ZZ_VERSION = aInputAmount[j].ZZ_VERSION + "";
				if(aInputAmount[j].ZZ_VERSION.trim() == maxVersion.trim()){

					if ( 
							aInputAmount[j].ZZ_EXP_INCUR == aStandardAmount[i].ZZ_EXP_INCUR &&
							aInputAmount[j].ZZ_NATURE == aStandardAmount[i].ZZ_NATURE &&  
							aStandardAmount[i].ZZ_COUNTRY_G == oModel.getData().trvhdr.ZZ_LAND1 &&
							aStandardAmount[i].ZE2E_AMOUNT_T == "T"){

						if (aStandardAmount[i].ZZ_NATURE == "01" && total_amount > aStandardAmount[i].ZE2E_AMOUNT){
							sFError = "The entered amount is out of your eligibility for "+ aStandardAmount[i].ZZ_EXPENSE_DESC.toLowerCase() +", Kindly check.(Total Amount Type)";							
							break;

						}else if(aStandardAmount[i].ZZ_NATURE != "01" && total_amount > aStandardAmount[i].ZE2E_AMOUNT){
							sFError = "The entered amount is out of your eligibility for "+ aStandardAmount[i].ZZ_EXPENSE_DESC.toLowerCase() +", Kindly check.(Total Amount Type)";							
							break;
						}						
					}else if ( 
							aInputAmount[j].ZZ_EXP_INCUR == aStandardAmount[i].ZZ_EXP_INCUR &&
							aInputAmount[j].ZZ_NATURE == aStandardAmount[i].ZZ_NATURE &&  
							aStandardAmount[i].ZZ_COUNTRY_G == oModel.getData().trvhdr.ZZ_LAND1 &&
							aStandardAmount[i].ZE2E_AMOUNT_T == "F"){

						if (fix_amount > aStandardAmount[i].ZE2E_AMOUNT){
							sFError = "The entered amount is out of your eligibility for "+ aStandardAmount[i].ZZ_EXPENSE_DESC.toLowerCase() +", Kindly check.(Fix Amount Type)";							
							break;
						}
					}else if ( 
							aInputAmount[j].ZZ_EXP_INCUR == aStandardAmount[i].ZZ_EXP_INCUR &&
							aInputAmount[j].ZZ_NATURE == aStandardAmount[i].ZZ_NATURE &&  
							aStandardAmount[i].ZZ_COUNTRY_G == oModel.getData().trvhdr.ZZ_LAND1 &&
							aStandardAmount[i].ZE2E_AMOUNT_T == "M"){

						if (monthly_amount > aStandardAmount[i].ZE2E_AMOUNT){
							sFError = "The entered amount is out of your eligibility for "+ aStandardAmount[i].ZZ_EXPENSE_DESC.toLowerCase() +", Kindly check.(Monthly Amount Type)";							
							break;
						}
					}
				}

			}

			total_amount = 0;
		}

		return sFError;
	},

	//Check input amount with standard amount
	//If "input amount" > the standard amount
	//Need to attach mail confirm from manager	
	doCheckRequestAmount:function(){

		var sError = "";	

		var oModel = this.getView().getModel("new");

		var sError = this.doCheckSelfAmount();

		return sError;
	},

	doModify:function(sMDAction,sMDRole, oEvent, sComment){	

		if( sap.ui.getCore().getModel("profile").getData().currentRole == "EMP" ){

			sap.ui.project.e2etm.util.StaticUtility.setBusy(true,this);

			var oThis = this;
			var oModel = oThis.getView().getModel("new");

			//Using create deep entity to insert to table header and detail.
			this.getView().getModel().create("/ZE2E_REI_HDRSet", oModel.getData().newreimreq, {
				success : jQuery.proxy(function(mResponse) {

					jQuery.sap.require("sap.m.MessageToast");	

					//Save
					if( sMDAction == "00" && sMDRole == "01"){						
						sap.m.MessageToast.show("The request has been saved.");

						//Submit by Employee
					}else if(sMDAction == "01" && sMDRole == "01"){
						sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oThis);
						sap.m.MessageToast.show("The request has been submitted by Employee");
						sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();

						//Submit by Admin
					}else if(sMDAction == "03" && sMDRole == "10"){
						sap.m.MessageToast.show("The request has been submitted by Admin");
						sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
					}

				}, oThis),
				error : jQuery.proxy(function(error) {				

					if (obsoleteRequest != undefined) {
						sap.m.MessageToast.show("This request is obsolete!");
					} else {
						sap.m.MessageToast.show("Error!");	
					}
				}, oThis)
			});
		}else{
			this.onApprove(oEvent);
		}

	},
	onPayment:function(){
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true,this);
		var reimAdminData  = sap.ui.getCore().getModel("reimAdminData").getData();	
		
		var aData = {ZZ_TRV_REQ:reimAdminData.oData.ZZ_TRV_REQ,ZZ_TRV_KEY:reimAdminData.oData.ZZ_TRV_KEY,
				     ZZ_VERSION:reimAdminData.oData.ZZ_VERSION.trim(),
				     ZZ_OWNER:reimAdminData.oData.ZZ_OWNER,ZZ_NROLE:"11",ZZ_MODID:"REIM",ZZ_COMMENTS:''};
		
		oComponent.getModel().callFunction("ReimPayment", "GET", aData, null, 
		jQuery.proxy(function(oData, response) {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false,this);
			sap.m.MessageToast.show("The request has been processed successfully");
			sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
		},this), jQuery.proxy(function(error) {
			sap.m.MessageToast.show("Internal Server Error");
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false,this);
		},this), true);
	},

	doUpdval:function(evt){

		if(evt.getParameters().value == ""){
			evt.getParameters().value = 0;
		}
		var sTotalAmount = parseFloat(evt.getParameters().value);

		if(isNaN(sTotalAmount) == true){			
			sap.m.MessageToast.show("Only type number is allow");
			evt.getSource().getParent().mAggregations.cells[5].setValue("");

		}else{
			var sTaxAmout ;

			if (evt.getSource().getParent().mAggregations.cells[6].getValue() == "" ){			
				evt.getSource().getParent().mAggregations.cells[7].setValue(sTotalAmount);
			}else{			
				sTaxAmout    = parseFloat(evt.getSource().getParent().mAggregations.cells[6].getValue());
				evt.getSource().getParent().mAggregations.cells[7].setValue(sTotalAmount + sTaxAmout);
			}
			this.doUpdHeadVal();
		}		


	},

	doUpdval_vat:function(evt){

		var sTotalAmount;

		if(evt.getSource().getParent().mAggregations.cells[5].getValue() == ""){
			sTotalAmount = 0;
		}else{
			sTotalAmount = parseFloat(evt.getSource().getParent().mAggregations.cells[5].getValue());
		}		

		if(evt.getParameters().value == ""){
			evt.getParameters().value = 0;
		}
		var sTaxAmout    = parseFloat(evt.getParameters().value);

		if(isNaN(sTaxAmout) == true){
			sap.m.MessageToast.show("Only type number is allow");
			evt.getSource().getParent().mAggregations.cells[6].setValue("");
		}else{
			evt.getSource().getParent().mAggregations.cells[7].setValue(sTotalAmount + sTaxAmout);
		}


		this.doUpdHeadVal();
	},

	doUpdHeadVal:function(){

		var oModel = this.getView().getModel("new");
		var oThis = this;	
		var sTotalAmount = 0;
		var sVATAmount   = 0;
		var sNetAmount   = 0;

		var aDetail = oModel.getData().reimhdr;
		var Caro_page = this.getView().byId("itemdetail").getPages();

		for(var i = 0; i < Caro_page.length; i++){
			// Update Header Value for each caro page
			sTotalAmount = 0;
			sVATAmount   = 0;
			sNetAmount   = 0;

			var aItem_Array = Caro_page[i].mAggregations.items;
			for(var j = 0; j < Caro_page[i].mAggregations.items.length; j++ ){
				if(Caro_page[i].mAggregations.items[j].mAggregations.cells[5].getValue() == ""){
					sTotalAmount = sTotalAmount + 0;
				}else{
				
					sTotalAmount = sTotalAmount + parseFloat(Caro_page[i].mAggregations.items[j].mAggregations.cells[5].getValue());
				}

				if(Caro_page[i].mAggregations.items[j].mAggregations.cells[6].getValue() == ""){
					sVATAmount = sVATAmount + 0;
				}else{
					sVATAmount   = sVATAmount   + parseFloat(Caro_page[i].mAggregations.items[j].mAggregations.cells[6].getValue());
				}

				if(Caro_page[i].mAggregations.items[j].mAggregations.cells[7].getValue() == ""){
					sNetAmount = sNetAmount + 0;
				}else{
					sNetAmount   = sNetAmount   + parseFloat(Caro_page[i].mAggregations.items[j].mAggregations.cells[7].getValue());
				}
			}
			//TGG1HC
			oModel.getData().reimhdr[i].sTotalAmount = sTotalAmount;
			oModel.getData().reimhdr[i].sVATAmount = sVATAmount;
			oModel.getData().reimhdr[i].sNetAmount = sNetAmount;
			oModel.getData().reimhdr[i].currency = Caro_page[i].mAggregations.headerToolbar.mAggregations.content[7].getSelectedKey();	

		}
	},

	//Navigate to the Attachment tab
	onAttachFile:function(evt){
		var oModel = this.getView().getModel("new");
		if(evt.getParameters().selected == true){
			this.getView().byId("attchement").setSelected(true);
			var pages = this.getView().byId("itemdetail").getPages();
			for(var i = 0; i < pages[0].mAggregations.items.length; i++){
				if(pages[0].mAggregations.items[i].mAggregations.cells[8].getSelected() == true){
					oModel.getData().reimhdr[0].ZE2E_REI_DETAIL.results[i].ZZ_ATTACEMENT = 'X';
				}
			}
			this.getView().byId("idIconTabBarMulti").setSelectedKey("attach");
		}else{
			this.getView().byId("attchement").setSelected(false);
			var pages = this.getView().byId("itemdetail").getPages();
			for(var i = 0; i < pages[0].mAggregations.items.length; i++){
				if(pages[0].mAggregations.items[i].mAggregations.cells[8].getSelected() == false){
					oModel.getData().reimhdr[0].ZE2E_REI_DETAIL.results[i].ZZ_ATTACEMENT = '';
				}
			}
		}	
	},

	//Begin functions for uploading file
	// Do upload file
	onFileUpload:function(evt){
		var file = evt.getParameters("files").files[0];
		var oData =  evt.oSource.getParent().getModel("new").getData();
		var sModule = "REIM";

		sap.ui.project.e2etm.util.StaticUtility.uploadCollectionFile(this,file,oData.trvhdr.ZZ_REINR, oData.trvhdr.ZZ_PERNR,sModule);

	},

	//When upload complete refresh model
	onUploadComplete:function(oEvent){
		this.getView().getModel("new").refresh(true);
	},

	//When do delete file 
	onFileDeleted: function(oEvent){
		// prepare FileName
		var sFileName = oEvent.getParameters("item").item.getFileName();

		// prepare DocType
		var oData =  oEvent.oSource.getParent().getModel("new").getData();
		var sDocType;
		sDocType = "REIM";

		// prepare travel request number
		var sDepReq = oData.trvhdr.ZZ_REINR;

		// prepare employee number
		var sEmpNo = oData.trvhdr.ZZ_PERNR;

		// prepare index
		var sIndex = 0;

		sap.ui.project.e2etm.util.StaticUtility.deleteUploadCollectionFile(this, oEvent, sDepReq, sFileName, sDocType, sEmpNo, sIndex);
	},
	// End functions for uploading file 

	onBack: function(){
		sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
	},
	//===== Do code for admin========

	//get list of Reimbursement request base on filter tab
	getFilter: function(keyFilter,searchString){
		var currentRole = sap.ui.getCore().getModel("profile").getData().currentRole;
		var sRole="";
		var sAction="";
		// get Binocolus request
		if(currentRole =="REBI"){
			sRole ="10";
			sAction = "00";
			// get accounting request
		}else if(currentRole ="REMR"){
			sRole ="05";
			sAction = "00";
		}
		switch(keyFilter){

		//NEW
		case "NEW" :

			sap.ui.project.e2etm.util.StaticUtility.setBusy(true,this);
			sap.ui.project.e2etm.util.StaticUtility.getListAdmin(sRole,searchString,"REIM",sAction,this,"NEW",currentRole);
			break;

			//CLOSED
		case "CLOSED" : 
			if(searchString == ""){
				this.getView().byId("idIconTabBarReimAdmin").getItems()[1].setCount("");
				this.getView().getModel("listReim").setProperty("/results",[]);
				sap.m.MessageToast.show("Please enter employee number!");
			}else{
				sap.ui.project.e2etm.util.StaticUtility.setBusy(true,this);
				sap.ui.project.e2etm.util.StaticUtility.getListAdmin(sRole,searchString,"REIM",sAction,this,"CLOSED",currentRole);
			}
			break;
		}// end switch

	},

	// event triggers when clicking on filter tab
	onIconTabSelect: function(evt){
		this.getFilter(evt.mParameters.key, this.getView().byId("idSearch").getValue());
	},

	// on item admin list press
	onItemPressReim: function(event){
		sap.ui.project.e2etm.util.StaticUtility.itemPress(event,this);
	},


	// check role to display buttons
	// Status is closed or new
	checkRoleToDisplay: function(sRole,sStatus){
		this.getView().byId("btnPayment").setVisible(false);
		if(sRole == "EMP"){
			this.getView().byId("btnBack").setVisible(true);
			this.getView().byId("btnSave").setVisible(true);
			this.getView().byId("btnReject").setVisible(false);
			this.getView().byId("btnSendBack").setVisible(false);
			this.getView().byId("btnEMPSubmmit").setVisible(true);
			this.getView().byId("btnSummit").setVisible(false);			
			this.getView().byId("btnSummit").setText("Submit");
			
		}else if(sStatus == "CLOSED"){
			this.getView().byId("btnBack").setVisible(true);
			this.getView().byId("btnSave").setVisible(false);
			this.getView().byId("btnReject").setVisible(false);
			this.getView().byId("btnSendBack").setVisible(false);
			this.getView().byId("btnEMPSubmmit").setVisible(false);
			this.getView().byId("btnSummit").setVisible(false);
			

		}else if(sRole == "REBI" || sRole=="GRM" ||sRole=="MRCR" || sRole=="REMR" ||sRole=="TRST"){
			this.getView().byId("btnBack").setVisible(false);
			this.getView().byId("btnSave").setVisible(false);
			this.getView().byId("btnReject").setVisible(true);
			this.getView().byId("btnSendBack").setVisible(true);
			this.getView().byId("btnEMPSubmmit").setVisible(false);
			this.getView().byId("add").setEnabled(false);
			this.getView().byId("del").setEnabled(false);
			this.getView().byId("currencyid").setEnabled(false);
			this.getView().byId("btnSummit").setVisible(true);
			
			if( sRole=="REMR"||sRole=="TRST"){
				this.getView().byId("btnSummit").setText("Close request");
			}else{
				this.getView().byId("btnSummit").setText("Approve");	
			}
			if(sRole=="TRST"){
				this.getView().byId("btnReject").setVisible(false);
				if(sStatus == "NEW"){
					this.getView().byId("btnPayment").setVisible(true);
					this.getView().byId("btnSummit").setVisible(false);
					
				}else if(sStatus == "PAYMENT"){
					this.getView().byId("btnPayment").setVisible(false);
					this.getView().byId("btnSummit").setVisible(true);
					this.getView().byId("btnSendBack").setVisible(false);
				}
			}

		}
	},

	// search employee number
	onSearch : function(evt){
		sap.ui.project.e2etm.util.StaticUtility.onSearchEmp(evt,this);

	},

	//===== End code for admin========

	onPageChange:function(oEvent){		
		var oModel = this.getView().getModel("new");		
		var page_0 = oEvent.oSource.getPages()[0].sId;
		//do for generate letter
		var sVersion = "0";
		var i =0;
		for(var  i = 0;i<=oEvent.oSource.getPages().length;i++){
			if(oEvent.oSource.getActivePage() == oEvent.oSource.getPages()[i].sId){
				sVersion = oEvent.oSource.getPages().length-i;
				break;
			}
		}

		var sPernr = oModel.getData().trvhdr.ZZ_PERNR;
		this.getForexCard(sPernr,this,oModel,oEvent.oSource,"CHANGE");
		
		if (oModel.getData().forexCard.CARDNO != "" && oModel.getData().bankdetail.Bkact != ""){
			this.getView().byId("bankPanel").setVisible(true);
			this.getView().byId("cardPanel").setVisible(false);
			this.getView().byId("empty").setVisible(false);
		}else if((oModel.getData().forexCard.CARDNO == "" || oModel.getData().forexCard.CARDNO == "NA") && oModel.getData().bankdetail.Bkact == ""){
			this.getView().byId("empty").setVisible(true);
			this.getView().byId("bankPanel").setVisible(false);
			this.getView().byId("cardPanel").setVisible(false);	
		}else{
			if(oModel.getData().bankdetail.Bkact != ""){
				this.getView().byId("bankPanel").setVisible(true);
				this.getView().byId("cardPanel").setVisible(false);
				this.getView().byId("empty").setVisible(false);
			}else if (oModel.getData().forexCard.CARDNO != ""){
				this.getView().byId("bankPanel").setVisible(false);
				this.getView().byId("cardPanel").setVisible(true);
				this.getView().byId("empty").setVisible(false);
			}
		}

		var sUrl = sServiceUrl + "TravelPdfSet(EmpNo='{0}',TrNo='{1}',TrvKey='{2}',Module='{3}')/$value"; //sua module nay
		sUrl = sUrl.replace("{0}", sVersion);
		sUrl = sUrl.replace("{1}", oModel.getData().trvhdr.ZZ_REINR);
		sUrl = sUrl.replace("{2}", oModel.getData().trvhdr.ZZ_TRV_TYP);
		sUrl = sUrl.replace("{3}", "REIM");

		this.getView().byId('idReimLeterLink').setHref(sUrl);
		if(page_0 != oEvent.oSource.getActivePage()){
			this.getView().byId("btnSave").setEnabled(false);
			this.getView().byId("btnEMPSubmmit").setEnabled(false);
			var oPage = oEvent.oSource.mAggregations.pages;
			for(var i = 0; i < oPage.length; i++){
				if( i != 0){
					oPage[i].mAggregations.headerToolbar.mAggregations.content[0].setEnabled(false);
					oPage[i].mAggregations.headerToolbar.mAggregations.content[1].setEnabled(false);
					oPage[i].mAggregations.headerToolbar.mAggregations.content[7].setEnabled(false);
				}
			}
			this.getView().byId("add").setEnabled(false);
			this.getView().byId("del").setEnabled(false);
			this.getView().byId("idReimLeterLink").setEnabled(true);
		}else{
			for(var i = 0; i < oModel.getData().act_req.length; i++){			

				if(oModel.getData().act_req[i].ZZ_ACTION == "02"){
					this.getView().byId("btnSave").setEnabled(true);
					this.getView().byId("btnEMPSubmmit").setEnabled(true);
					this.getView().byId("idReimLeterLink").setEnabled(true);
				}else if(oModel.getData().act_req[i].ZZ_ACTION == "08"){
					this.getView().byId("btnSave").setEnabled(true);
					this.getView().byId("btnEMPSubmmit").setEnabled(true);
					this.getView().byId("idReimLeterLink").setEnabled(true);
				}else if(oModel.getData().act_req[i].ZZ_NROLE == "01" && oModel.getData().act_req[i].ZZ_ACTION == "00"){
					this.getView().byId("btnSave").setEnabled(true);
					this.getView().byId("btnEMPSubmmit").setEnabled(true);
					this.getView().byId("idReimLeterLink").setEnabled(true);
				}else if(oModel.getData().act_req[i].ZZ_NROLE == "" && oModel.getData().act_req[i].ZZ_ACTION == ""){
					this.getView().byId("btnSave").setEnabled(true);
					this.getView().byId("btnEMPSubmmit").setEnabled(true);
					this.getView().byId("idReimLeterLink").setEnabled(false);
					this.getView().byId("idReimLeterLink").setEnabled(false);
				}else{
					this.getView().byId("btnSave").setEnabled(false);
					this.getView().byId("btnEMPSubmmit").setEnabled(false);
					break;
				}
			}

		}
	},
	// get forex card
	getForexCard: function(sPernr,oController,oModel,Caro_page,status){

		var sCurrency ="";

		// get the last
		if(status =="OPEN"){
			for(var i = 0;i<Caro_page.getPages().length;i++){
				sCurrency = Caro_page.getPages()[i].mAggregations.headerToolbar.mAggregations.content[7].getSelectedKey();
			}
		}else if(status=="CHANGE"){
			for(var i = 0;i<Caro_page.getPages().length;i++){
				if(Caro_page.getActivePage() == Caro_page.getPages()[i].sId){
					sCurrency = Caro_page.getPages()[i].mAggregations.headerToolbar.mAggregations.content[7].getSelectedKey();
					break;
				}
			}
		}else if(status=="CHANGECURR"){
			sCurrency = Caro_page;
		}


		var sUrl = "/ZE2E_FOREX_CARDSSet(PERNR='{0}',BANK='',BEGDA='',CURR='{1}')";	

		sUrl = sUrl.replace("{0}", sPernr);
		sUrl = sUrl.replace("{1}", sCurrency);			        		 
		var forexCard ={
				CARDNO: "",
				BANK:"",
				ENDDA:"",
				CURR :"",
		};
		this.getView().getModel().read(sUrl,{
			async: false,
			success: function(evt){
				forexCard = evt;
				oModel.setProperty("/forexCard" , forexCard);
				oController.getView().getModel("new").setData(oModel.getData());
			},
			error: function(error){
				forexCard.CARDNO ="NA";
				forexCard.BANK ="NA";
				forexCard.ENDDA ="NA";
				forexCard.CURR ="NA";
				oModel.setProperty("/forexCard" , forexCard);
				oController.getView().getModel("new").setData(oModel.getData());
			}
		});	


	},
	//on change currency
	onCurrChange: function(evt){
		var sCurrency = evt.getSource().getSelectedKey();
		var oModel = this.getView().getModel("new");
		var Caro_page = this.getView().byId("itemdetail");
		var sPernr = oModel.getData().trvhdr.ZZ_PERNR;
		this.getForexCard(sPernr,this,oModel,sCurrency,"CHANGECURR");
		
		if (oModel.getData().forexCard.CARDNO != "" && oModel.getData().bankdetail.Bkact != ""){
			this.getView().byId("bankPanel").setVisible(true);
			this.getView().byId("cardPanel").setVisible(false);
			this.getView().byId("empty").setVisible(false);
		}else if((oModel.getData().forexCard.CARDNO == "" || oModel.getData().forexCard.CARDNO == "NA") && oModel.getData().bankdetail.Bkact == ""){
			this.getView().byId("empty").setVisible(true);
			this.getView().byId("bankPanel").setVisible(false);
			this.getView().byId("cardPanel").setVisible(false);	
		}else{
			if(oModel.getData().bankdetail.Bkact != ""){
				this.getView().byId("bankPanel").setVisible(true);
				this.getView().byId("cardPanel").setVisible(false);
				this.getView().byId("empty").setVisible(false);
			}else if (oModel.getData().forexCard.CARDNO != ""){
				this.getView().byId("bankPanel").setVisible(false);
				this.getView().byId("cardPanel").setVisible(true);
				this.getView().byId("empty").setVisible(false);
			}
		}
	},

	onReportREIMress: function(){
		sap.ui.project.e2etm.util.StaticUtility.reimReport();
	},

	onChangeIncurr:function(evt){
		var oEvent = evt;
		var oModel = this.getView().getModel("new");
		var selectedkey = evt.getParameters().selectedItem.getKey();

		var sPath = "/ZE2E_REI_EXPENSESet?$filter=ZZ_NATURE+eq+'{0}'+and+ZZ_COUNTRY_G+eq+'{1}'+and+ZZ_DESCIPTION+eq+'{2}'";
		sPath = sPath.replace("{0}", selectedkey);
		sPath = sPath.replace("{1}", oModel.getData().trvhdr.ZZ_LAND1);		
		sPath = sPath.replace("{2}", "");
	
		
		this.getView().getModel().read(sPath,{
			async: false,
			success: function(evt){
				var oSelect = oEvent.getSource().getParent().getCells()[4];
				oSelect.destroyItems();
				for(var i=0 ; i<evt.results.length; i++){
					var oItem = new sap.ui.core.Item({key: evt.results[i].ZZ_NATURE, text:evt.results[i].ZZ_DESCIPTION });
					oSelect.insertItem(oItem,i);
				}
				if( evt.results.length > 0 ){
					oSelect.setSelectedKey(evt.results[0].ZZ_NATURE);
				}
			},
			error: function(error){
			}
		});	
	}
});