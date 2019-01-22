jQuery.sap.require("sap.ui.project.e2etm.util.Formatter");
jQuery.sap.require("sap.ui.project.e2etm.util.StaticUtility");
sap.ui.controller("sap.ui.project.e2etm.controller.Cargo", {
	onInit : function() {
		sap.ui.core.routing.Router.getRouter("MyRouter").attachRoutePatternMatched(this.onRouteMatched, this);
		this.getView().setModel(sap.ui.getCore().getModel("profile"), "profile");
		this.getView().setModel(sap.ui.getCore().getModel("global"), "global");
	},

	onRouteMatched: function(evt){
		if(evt.getParameter("name")=="cargo" || evt.getParameter("name")=="CargoVAVN") {
			//bind static eligibility
			this.getView().byId("idStaticEligibility").bindElement("/CommonSet(MODULE='CARO',SUB_MODULE='',TEXT_NAME='ZE2E_CARGO_ELIGIBILITY')");

			globalData = sap.ui.getCore().getModel("global").getData();
			sVersion = globalData.ZZ_VERSION.trim();
			sPernr = globalData.ZZ_DEP_PERNR;
			sDEPRequest = globalData.ZZ_DEP_REQ;
			sTravelRequest = globalData.ZZ_TRV_REQ;
			sType = globalData.ZZ_REQ_TYP;
			sCargoType = globalData.ZZ_CAR_TYP;
			sDepType = globalData.ZZ_DEP_TYPE;
			// test
//			var testModel = this.getView().getModel();
//			var testData = testModel.getData();
			// end test
           this.setCargoPolicy();
			if(sCargoType == "V" || sCargoType == "S" ){
				switch (globalData.action) {
				case "00": //Create
					this.doCreatNewCargo();
//					this.typeCargo(sCargoType,this, globalData);
					this.setEnableButons(true);
					this.getView().byId("btnCancel").setEnabled(false);
					break;
				case "01": //Change
					this.doInit();
					this.setEnableButons(true);
					this.getView().byId("btnCancel").setEnabled(false);
					break;
				case "02": //Open
					this.doInit();
					this.setEnableButons(false);
					this.getView().byId("btnCancel").setEnabled(true);
					break;
				case "09": //Cancelled
					this.doInit();
					this.setEnableButons(true);
					this.getView().byId("btnCancel").setEnabled(false);
					break;
				}
				this.resetField(this.getView());

			} else {

				switch (globalData.action) {
				case "00": //Create
					this.doCreatNewCargo();
//					this.typeCargo(sCargoType,this, globalData);
					this.setEnableButons(true);
					this.getView().byId("btnCancel").setEnabled(false);
					break;
				case "01": //Change
					this.doInit();
					this.setEnableButons(true);
					this.getView().byId("btnCancel").setEnabled(false);
					break;
				case "02": //Open
					this.doInit();
					this.setEnableButons(false);
					this.getView().byId("btnCancel").setEnabled(true);
					break;
				case "09": //Cancelled
					this.doInit();
					this.setEnableButons(true);
					this.getView().byId("btnCancel").setEnabled(false);
					break;
				}

				this.resetField(this.getView());
				
			}
		
			
		} else if (evt.getParameter("name")=="cargoAdmin"){
			this.getView().byId("idStaticEligibility").bindElement("/CommonSet(MODULE='CARO',SUB_MODULE='',TEXT_NAME='ZE2E_CARGO_ELIGIBILITY')");
			globalData = sap.ui.getCore().getModel("global").getData();
			this.getListSearch('01',"","CARO","01");
		} 
	},

//	change Cargo
	doInit : function(){
		this.getCargo(sPernr,sDEPRequest,sType,sCargoType,sTravelRequest,sVersion,globalData);
	},

	onDetailSelect : function(){
		// If user not selecting cargo_form tab then save, submit, cancel button will be hidden
		if ( this.getView().byId("idIconTabBar").getSelectedKey() != "cargo_form"){
			this.getView().byId("idButtonBar").setVisible(false);
		} else {
			this.getView().byId("idButtonBar").setVisible(true);
		}
	},

	onSelectLongtermStorage : function(){
		if (this.getView().getModel("new") && this.getView().byId("idRB_Longterm_yes").getSelected()){
			// If user select 'Yes' for Long Term storage, display field "Period", else hide it 
			this.getView().getModel("new").setProperty("/LongTermStorage", this.getView().byId("idRB_Longterm_yes").getSelected());
		}
	},

	onDeleteDate : function(){
		this.getView().byId("idTimeInput").setValue("");
	},

	doSaveVA: function(){
		var view = this.getView();

		// Validate mandatory input must not be empty
		var inputs = [
		              //Address
		              view.byId("idPresentAddressInput"),
		              //Family
		              view.byId("idEmailInput"),
		              view.byId("idAdultsInput"),
		              view.byId("idChildrenInput"),
		              //Further Details
		              view.byId("idHomeStreetInput"),
		              view.byId("idHomeCountryInput"),
		              view.byId("idHomeCityInput"),
		              view.byId("idHomeZIPCodeInput"),
		              // Future work address
		              view.byId("idWorkCompanyInput"),
		              view.byId("idWorkCountryInput"),
		              view.byId("idWorkCityInput"),
		              view.byId("idDivisionDebitedInput"),
		              ];
		jQuery.each(inputs, function (i, input){
			if (!input.getValue()){
				input.setValueState("Error");
			} else {
				input.setValueState("None");
			}
		});

		var LongTermRadioButton = view.byId("idRB_Longterm_yes");
		var PeriodInput = view.byId("idPeriodInput");
		// If user select yes on Long Term storage then user must input Period
		if (LongTermRadioButton.getSelected()){
			if (!PeriodInput.getValue()){
				PeriodInput.setValueState("Error");
			} else {
				PeriodInput.setValueState("None");
			}	
		} else {
			PeriodInput.setValueState("None");
		}
		inputs.push(PeriodInput);

		// Validate Number inputs
		var numberInputs = [
		                    view.byId("idRoomNoInput"),
		                    view.byId("idLivingSpaceInput")
		                    ];
		jQuery.each(numberInputs, function (i, input){
			if (!Number(input.getValue()) && input.getValue()){
				input.setValueState("Error");
			} else {
				input.setValueState("None");
			}
		});
		inputs.push(view.byId("idRoomNoInput"));	
		inputs.push(view.byId("idLivingSpaceInput"));	

		// Check states of inputs
		var canContinue = true;
		jQuery.each(inputs, function (i, input){
			if ("Error" === input.getValueState()){
				canContinue = false;
				return false;
			}
		});

		if (canContinue){

			// Data on screen
			var screenData = this.getView().getModel("new").getData();

			// Prepare data for insert
			var newCargo = {};
			// Cargo Key
			newCargo.ZZ_REINR   = screenData.Header.ZZ_DEP_REQ; // travel request number
			newCargo.ZZ_OWNER   = screenData.Header.ZZ_PERNR;   // Owner of the request
			newCargo.ZZ_TRV_KEY = screenData.Header.ZZ_TRV_TYP; // request type
			newCargo.ZZ_VERSION = screenData.Header.ZZ_VERSION; // version
			newCargo.ZZ_CAR_TYP = screenData.Detail.ZZ_CAR_TYP; // Cargo type

			// Cargo properties
			newCargo.ZZ_ADD_LOC = screenData.Detail.ZZ_ADD_LOC;  // Address in India
			newCargo.ZZ_ADD_INT = screenData.Detail.ZZ_ADD_INT;  // Address in deputation country
			newCargo.ZZ_COMMENT = screenData.Detail.ZZ_COMMENT;  // Additional instruction
			newCargo.ZZ_MOBILE  = screenData.Detail.ZZ_MOBILE;   // Mobile number

			// Cargo_e data
			newCargo.ZE2E_CARGO_E  = {};
			// Cargo_e key
			newCargo.ZE2E_CARGO_E.ZZ_REINR   = screenData.Header.ZZ_DEP_REQ; // travel request number
			newCargo.ZE2E_CARGO_E.ZZ_OWNER   = screenData.Header.ZZ_PERNR;   // Owner of the request
			newCargo.ZE2E_CARGO_E.ZZ_TRV_KEY = screenData.Header.ZZ_TRV_TYP; // request type
			newCargo.ZE2E_CARGO_E.ZZ_VERSION = screenData.Header.ZZ_VERSION; // version
			newCargo.ZE2E_CARGO_E.ZZ_CAR_TYP = screenData.Detail.ZZ_CAR_TYP; // Cargo type

			// Cargo_e properties
			newCargo.ZE2E_CARGO_E.ZZ_ASG_TYP = screenData.Detail.ZE2E_CARGO_E.ZZ_ASG_TYP; // Cargo assignment type
			newCargo.ZE2E_CARGO_E.E_EMAIL    = screenData.Detail.ZE2E_CARGO_E.E_EMAIL;    // employee email
			newCargo.ZE2E_CARGO_E.ZZ_ADULT   = screenData.Detail.ZE2E_CARGO_E.ZZ_ADULT;   // Check later
			newCargo.ZE2E_CARGO_E.ZZ_CHILD   = screenData.Detail.ZE2E_CARGO_E.ZZ_CHILD;   // Check later
			if (this.getView().byId("idRB_LoadingPlace_yes").getSelected()) {
				newCargo.ZE2E_CARGO_E.ZZ_CAR_LOA_F   = "X";           //Loading place
			}
			newCargo.ZE2E_CARGO_E.ZZ_CAR_STR_F   = screenData.Detail.ZE2E_CARGO_E.ZZ_CAR_STR_F;  // street and floor
			newCargo.ZE2E_CARGO_E.ZZ_CAR_CON_F   = screenData.Detail.ZE2E_CARGO_E.ZZ_CAR_CON_F;  // country
			newCargo.ZE2E_CARGO_E.ZZ_CAR_CITY_F  = screenData.Detail.ZE2E_CARGO_E.ZZ_CAR_CITY_F; // city
			newCargo.ZE2E_CARGO_E.ZZ_CAR_ZIP_F   = screenData.Detail.ZE2E_CARGO_E.ZZ_CAR_ZIP_F;  // ZIP code
			if (this.getView().byId("idRB_Longterm_yes").getSelected()){
				newCargo.ZE2E_CARGO_E.ZZ_CAR_LON_STR = "X";                  //Longterm storage
				newCargo.ZE2E_CARGO_E.ZZ_CAR_PER     = Number(screenData.Detail.ZE2E_CARGO_E.ZZ_CAR_PER); // Period
			}
			if (this.getView().byId("idRB_RoleOut_yes").getSelected()){
				newCargo.ZE2E_CARGO_E.ZZ_CAR_EXI = "X";                      //Role out storage
			}
			newCargo.ZE2E_CARGO_E.ZZ_CAR_MOV_TIME = screenData.Detail.ZE2E_CARGO_E.ZZ_CAR_MOV_TIME;    // Preferred moving time frame
			newCargo.ZE2E_CARGO_E.ZZ_CAR_COM_W    = screenData.Detail.ZE2E_CARGO_E.ZZ_CAR_COM_W;       // Future company
			newCargo.ZE2E_CARGO_E.ZZ_CAR_CON_W    = screenData.Detail.ZE2E_CARGO_E.ZZ_CAR_CON_W;       // Future company country
			newCargo.ZE2E_CARGO_E.ZZ_CAR_CITY_W   = screenData.Detail.ZE2E_CARGO_E.ZZ_CAR_CITY_W;      // Future company city
			newCargo.ZE2E_CARGO_E.ZZ_CAR_DIV_W    = screenData.Detail.ZE2E_CARGO_E.ZZ_CAR_DIV_W;       // Division being debited
			newCargo.ZE2E_CARGO_E.ZZ_ROOM_NO      = screenData.Detail.ZE2E_CARGO_E.ZZ_ROOM_NO;         // Current household number of room
			if ( Number(this.getView().byId("idLivingSpaceInput").getValue())){
				newCargo.ZE2E_CARGO_E.ZZ_LIV_SPA      = Number(screenData.Detail.ZE2E_CARGO_E.ZZ_LIV_SPA); // Current household living space
			}
			newCargo.ZE2E_CARGO_E.ZZ_COMMENT      = screenData.Detail.ZE2E_CARGO_E.ZZ_COMMENT;     // Current household comment

			var oModel = this.getView().getModel();

			if (this.dialog == null) {
				this.dialog = new sap.m.BusyDialog();
			}
			this.dialog.open();

			oModel.create("/ZE2E_CARGOSet", newCargo, {
				success : jQuery.proxy(function(mResponse) {
					alert("Your request has been saved.");
					this.dialog.close();
				}, this),
				error : jQuery.proxy(function() {
					alert("Your request has failed.");
					this.dialog.close();
				}, this)
			});

		} // End if (canContinue)
	},

	onFileDeleted: function(oEvent){

		// prepare FileName
		var sFileName = oEvent.getParameters("item").item.getFileName();

		// prepare DocType
		var oData =  oEvent.oSource.getParent().getModel("new").getData();
		var sDocType;
		if (oData.CargoName == "ONWARD"){
			sDocType = "CAO";
		} else if (oData.CargoName == "RETURN"){
			sDocType = "CAR";
		}

		// prepare travel request number
		var sDepReq = oData.ZZ_REINR;

		// prepare employee number
		var sEmpNo = oData.ZZ_PERNR;

		// prepare index
		var sIndex = 0;

		sap.ui.project.e2etm.util.StaticUtility.deleteUploadCollectionFile(this, oEvent, sDepReq, sFileName, sDocType, sEmpNo, sIndex);
	},

	onFileUpload:function(evt){
		var file = evt.getParameters("files").files[0];
		var oData =  evt.oSource.getParent().getModel("new").getData();
		var sModule;
		if(oData.CargoName == "ONWARD"){
			sModule = "CAO";
		} else if(oData.CargoName == "RETURN"){
			sModule = "CAR";
		}

		sap.ui.project.e2etm.util.StaticUtility.uploadCollectionFile(this,file,oData.ZZ_DEP_REQ,oData.ZZ_PERNR,sModule);
	},

	onUploadComplete:function(oEvent){
		this.getView().getModel("new").refresh(true);
	},

	typeCargo: function(sCargoType,oThis,globalData){
		switch(sCargoType){
		case "O":
//			var oFragment = sap.ui.xmlfragment("sap.ui.project.e2etm.fragment.cargo.OnwardInfo");
//			this.getView().byId("idInfo").addContent(oFragment);
			if(this.getView().byId("idLBDomestic")){
				this.getView().byId("idLBDomestic").setText("Domestic address");	
			}
			this.getView().getModel("new").setData({
				CargoName: "ONWARD",
				Mode: {
					OnwardMode: true, // onward
					ReturnMode: false,
					DiscontinuedFlag: true,
				}
			},true);
			if(globalData.action){
				sap.ui.project.e2etm.util.StaticUtility.getComment(sTravelRequest,sType,"CARO",oThis);
			}


			return;
		case "V":
			if(this.getView().byId("idLBDomestic")){
				this.getView().byId("idLBDomestic").setText("*Domestic address");	
			}
			this.getView().getModel("new").setData({
				CargoName: "ONWARD",
				Mode: {
					OnwardMode: true, // onward
					ReturnMode: false,
					DiscontinuedFlag: true,
				}
			},true);
			if(globalData.action){
				sap.ui.project.e2etm.util.StaticUtility.getComment(sTravelRequest,sType,"CARO",oThis);
			}
			return;
		case "R":
//			var oFragment = sap.ui.xmlfragment("sap.ui.project.e2etm.fragment.cargo.ReturnInfo");
			this.getView().byId("idInfo");
//			this.getView().getModel("new").Mode.cargoMode = true;
			this.getView().byId("idLBDomestic").setText("*Home address in India");
			this.getView().getModel("new").setData({
				CargoName: "RETURN",
				Mode: {
					OnwardMode: false, // onward
					ReturnMode: true,
					DiscontinuedFlag: true
				}
			},true);
			if(globalData.action){
				sap.ui.project.e2etm.util.StaticUtility.getComment(sTravelRequest,sType,"CARR",oThis);
			}
			return;

		case "S":
			this.getView().byId("idInfo");
			this.getView().byId("idLBDomestic").setText("*Home address in India");
			this.getView().getModel("new").setData({
				CargoName: "RETURN",
				Mode: {
					OnwardMode: false, // onward
					ReturnMode: true,
					DiscontinuedFlag: true
				}
			},true);
			if(globalData.action){
				sap.ui.project.e2etm.util.StaticUtility.getComment(sTravelRequest,sType,"CARR",oThis);
			}
			return;
		}
	},
	// set detail data:
	setDetailData: function(){

	},
	// get cargo information from Gateway
	getCargo: function(sPernr,sRequest,sType,sCargoType,sTravelRequest,sVersion,globalData){

		var oThis = this;
		var sURL0 = "TRV_HDRSet(ZZ_PERNR='{0}',ZZ_DEP_REQ='{1}',ZZ_VERSION='{2}',ZZ_TRV_TYP='{3}')?$expand=DEP_EMP,TRV_HDRtoTRV_travel_Data";
		sURL0 = sURL0.replace("{0}", sPernr);
		sURL0= sURL0.replace("{1}", sTravelRequest);
		sURL0 = sURL0.replace("{2}", sVersion);
		sURL0 = sURL0.replace("{3}", sType);
		var sURL1 = "ZE2E_CARGOSet(ZZ_REINR='{0}',ZZ_OWNER='{1}',ZZ_TRV_KEY='{2}',ZZ_VERSION='{3}',ZZ_CAR_TYP='{4}')?$expand=DEP_HDR_INFO,ZE2E_REQ_STATUS";
		sURL1 = sURL1.replace("{0}", sTravelRequest);
		sURL1 = sURL1.replace("{1}", sPernr);
		sURL1= sURL1.replace("{2}", sType);
		sURL1= sURL1.replace("{3}", sVersion);
		sURL1 = sURL1.replace("{4}", sCargoType);
//		var sURL2 = "GetF4Table?TableName='ZE2E_CARGO_ELI'&Col1='ZZ_CAR_TYP'&Col2='ZZ_FROM'&Col3='ZZ_TO'&Col4='ZZ_CAR_LIMIT'&Col5=''&Col6=''&Col7=''&Col8=''&Col9=''&Col10=''";
		var sURL2;
		
		if(globalData.ZZ_DEP_TOCNTRY == "AT" && globalData.ZZ_DEP_TOLOC == "VNA"){
			sURL2 = "ZE2E_CARGO_ELISet?$filter=ZZ_DEP_TOCNTRY+eq+'{0}'+and+ZZ_DEP_TOLOC+eq+'{1}'";
			sURL2 = sURL2.replace("{0}", globalData.ZZ_DEP_TOCNTRY);
			sURL2 = sURL2.replace("{1}", globalData.ZZ_DEP_TOLOC);
		}else{
		sURL2 = "ZE2E_CARGO_ELISet";
		}

		var oBatch0 = oComponent.getModel().createBatchOperation(sURL0, "GET");
		var oBatch1 = oComponent.getModel().createBatchOperation(sURL1, "GET");
		var oBatch2 = oComponent.getModel().createBatchOperation(sURL2, "GET");
		oComponent.getModel().addBatchReadOperations([oBatch0,oBatch1,oBatch2]);
		oComponent.getModel().submitBatch(
				function(oResult){
					var oData = $.extend({}, oResult.__batchResponses[0].data, oResult.__batchResponses[1].data, oResult.__batchResponses[2].data);
					//Lock for admin if current request have been handled
					var currentRole = sap.ui.getCore().getModel("profile").getData().currentRole;
					if (currentRole == "CARG"){
						var selectedButton = oThis.getView().byId("idFilterRadio").getSelectedButton().getText();
						if (selectedButton == "Onward Request" || selectedButton == "Return Request"){
							if (oData.ZE2E_REQ_STATUS.ZZ_ACTION != "01"){
								alert("This request has been changed!");
								oThis.doFilter('');
							}
						}
					}					
					//Cargo eligibility table
					oData.EligibilityTable = oThis.filterEligibilityTable(oResult.__batchResponses[2].data.results, sCargoType);					
					var bindUrl = "/ZE2E_CARGO_ELISet(ZZ_TRV_KEY='{0}',ZZ_CAR_TYP='{1}',ZZ_FROM='{2}',ZZ_TO='{3}',ZZ_DEP_TOCNTRY='{4}',ZZ_DEP_TOLOC='{5}')";
					bindUrl = bindUrl.replace("{0}", oResult.__batchResponses[1].data.ZZ_TRV_KEY);
					bindUrl = bindUrl.replace("{1}", oResult.__batchResponses[1].data.ZZ_CAR_TYP);
					bindUrl = bindUrl.replace("{2}", oData.ZZ_ZDURN.trim());
					bindUrl = bindUrl.replace("{3}", oData.ZZ_ZDURN.trim());
					bindUrl = bindUrl.replace("{4}", sap.ui.getCore().getModel("global").getData().ZZ_DEP_TOCNTRY);
					bindUrl = bindUrl.replace("{5}", sap.ui.getCore().getModel("global").getData().ZZ_DEP_TOLOC);

					//bind Vendor account
					oThis.getView().byId("idZZ_ACCOUNT").bindElement(bindUrl);

					oData.Header = oResult.__batchResponses[0].data;
					//set detail data:
					var detailData = {
							ZZ_REINR: oResult.__batchResponses[1].data.ZZ_REINR,
							ZZ_TRV_KEY: oResult.__batchResponses[1].data.ZZ_TRV_KEY,
							ZZ_VERSION:oResult.__batchResponses[1].data.ZZ_VERSION,
							ZZ_CAR_TYP:oResult.__batchResponses[1].data.ZZ_CAR_TYP,
							ZZ_OWNER: oResult.__batchResponses[1].data.ZZ_OWNER,
							ZZ_CAR_AVA:oResult.__batchResponses[1].data.ZZ_CAR_AVA,
							ZZ_CAR_PLA:oResult.__batchResponses[1].data.ZZ_CAR_PLA ,
							ZZ_ADD_LOC:oResult.__batchResponses[1].data.ZZ_ADD_LOC,
							ZZ_STD_LOC:oResult.__batchResponses[1].data.ZZ_STD_LOC,
							ZZ_ADD_INT:oResult.__batchResponses[1].data.ZZ_ADD_INT,
							ZZ_STD_INT:oResult.__batchResponses[1].data.ZZ_STD_INT,
							ZZ_CONTACT_NO:oResult.__batchResponses[1].data.ZZ_CONTACT_NO,
							ZZ_MOBILE: oResult.__batchResponses[1].data.ZZ_MOBILE,
							ZZ_OFF_NO:oResult.__batchResponses[1].data.ZZ_OFF_NO,
							ZZ_RES_NO:oResult.__batchResponses[1].data.ZZ_RES_NO,
							ZZ_OFF_NO:oResult.__batchResponses[1].data.ZZ_OFF_NO,
							ZZ_COMMENT:oResult.__batchResponses[1].data.ZZ_COMMENT,
							ZZ_ADD_INS:oResult.__batchResponses[1].data.ZZ_ADD_INS,
							ZZ_PIN: oResult.__batchResponses[1].data.ZZ_PIN,
							ZZ_ELIGIBILITY: oResult.__batchResponses[1].data.ZZ_ELIGIBILITY,
							ZZ_ELIGIBILITY_DEP: oResult.__batchResponses[1].data.ZZ_ELIGIBILITY_DEP,
					};
					if(detailData.ZZ_OFF_NO == "000000000000000"){
						detailData.ZZ_OFF_NO ="";
					}
					if(detailData.ZZ_CONTACT_NO == "000000000000000"){
						detailData.ZZ_CONTACT_NO ="";
					}
					if(detailData.ZZ_RES_NO == "000000000000000"){
						detailData.ZZ_RES_NO ="";
					}
//					oData.Detail = oResult.__batchResponses[1].data;
					oData.Detail = detailData;
//					oThis.deleteReplicateTravelDetail(oData,oResult.__batchResponses[5].data);
					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData(oData);
					oThis.getView().setModel(oModel, "new");
					var lt_dependent = oResult.__batchResponses[0].data.TRV_HDRtoTRV_travel_Data.results;
					var iNoOfTravellers = 0;
					var aTravellers = [];
					if (lt_dependent.length > 1){
						for (var i = 0; i < lt_dependent.length; i++) { 
							 if(sap.ui.project.e2etm.util.StaticUtility.getArrayIndex(aTravellers,"ZZ_ZSLFDPD",lt_dependent[i].ZZ_ZSLFDPD) == -1){
								 aTravellers.push(lt_dependent[i]);
							 }
						}
					}
					iNoOfTravellers = aTravellers.length;
					oThis.getView().getModel("new").setProperty("/Dependents",iNoOfTravellers); //Actually it's no. of travellers					
					if(!oData.Detail){
						oThis.initializeNewCargoData();
					}else{
						oThis.initializeEditCargoData();
					}
					oThis.typeCargo(sCargoType,oThis,globalData);
//					sap.ui.project.e2etm.util.StaticUtility.getComment(sTravelRequest,sType,"CRGO",sDepType,oThis);
					// get files
					var sModule;
					var sModid;
					var sModule_2;
					if (sCargoType == "O" || sCargoType == "V"){
						sModule = "CAO";
						sModid = "CARG";
						sModule_2 = "CARO";
					}  else if (sCargoType == "R" || sCargoType == "S"){
						sModule = "CAR";
						sModid = "CARG";
						sModule_2 = "CARR";
					} 

					//NHI1HC
					var sUrl = sServiceUrl + "TravelPdfSet(EmpNo='{0}',TrNo='{1}',TrvKey='{2}',Module='{3}')/$value"; //sua module nay
					sUrl = sUrl.replace("{0}", sPernr);
					sUrl = sUrl.replace("{1}", sTravelRequest);
					sUrl = sUrl.replace("{2}", sType);
					sUrl = sUrl.replace("{3}", sModule_2);

					oThis.getView().byId('idCargoLeterLink').setHref(sUrl);
					//NHI1HC

					sap.ui.project.e2etm.util.StaticUtility.getDocumentList(oThis,oData.ZZ_REINR, oData.ZZ_OWNER,sModule,sModid,oData.ZZ_LAND1);
					if(oHomeThis)
						sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);					
				},
				function(error){
					alert("No data found");
				});
	},

	//Initialize modify cargo
	initializeEditCargoData : function() {
		var oDataEdit = this.getView().getModel("new").getData();
		if(oDataEdit.Detail.ZZ_MOBILE==""){

			oDataEdit.Detail.ZZ_MOBILE = oDataEdit.Header.ZZ_MOBILE;
		}
		this.getView().getModel("new").setData(oDataEdit);
		if (sap.ui.getCore().getModel("global")){
			this.getView().getModel("new").setData({
				ZZ_DEP_TOCNTRY_TXT: sap.ui.getCore().getModel("global").getData().ZZ_DEP_TOCNTRY_TXT,
				Mode: {
					editMode: true,
				},
				Constant: {
					ZZ_ELIGIBILITY: "Please note: There will be additional fee for cargo movements that shall take place on short notice. This applies for all mode of Cargo movement:\n\n" +
					" - Landfreight: with less than 10 working days handling time left (from placing the order till pick up date). The fee is about 750 EUR. \n" +
					" - Seafreight: with less than 15 working days handling time left (from placing the order till pick up date). The fee is about 1000 USD \n" +
					" - Airfreight: with less than 5 working days handling time left (from placing the order till pick up date). The fee is about 475 USD \n\n" +
					"The fee can be avoided if the cargo movement date can be delayed. Incase cargo has to be moved in short notice, additional charges will be recovered from you. The exact amount can be confirmed only after we receive invoice." 
				},

			},"true");
		};
	},

	//Initialize create cargo
	initializeNewCargoData : function() {
		var oDataEdit = this.getView().getModel("new").getData();
		this.getView().getModel("new").setData({
			ZZ_DEP_TOCNTRY_TXT: sap.ui.getCore().getModel("global").getData().ZZ_DEP_TOCNTRY_TXT,

			Detail: {
				ZZ_REINR: oDataEdit.ZZ_REINR,
				ZZ_TRV_KEY: oDataEdit.ZZ_TRV_TYP,
				ZZ_VERSION:oDataEdit.ZZ_VERSION,
				ZZ_CAR_TYP:sap.ui.getCore().getModel("global").getData().ZZ_CAR_TYP,
				ZZ_OWNER: oDataEdit.ZZ_PERNR,
				ZZ_CAR_AVA:"X",
				ZZ_CAR_PLA:"" ,
				ZZ_ADD_LOC:"",
				ZZ_STD_LOC:"",
				ZZ_ADD_INT:"",
				ZZ_STD_INT:"",
				ZZ_CONTACT_NO:"",
				ZZ_MOBILE: oDataEdit.ZZ_MOBILE,
				ZZ_OFF_NO:"",
				ZZ_RES_NO:"",
				ZZ_OFF_NO:"",
				ZZ_COMMENT:"",
				ZZ_ADD_INS:"",
				ZZ_PIN: "",
			},
			Mode: {
				editMode: true,
			},
			DEP_HDR_INFO: {
				ZZ_ASG_TYP : sap.ui.getCore().getModel("global").getData().ZZ_ASG_TYP ,
				ZZ_DEP_DAYS : sap.ui.getCore().getModel("global").getData().ZZ_DEP_DAYS ,
				ZZ_FAMILY_ACCOMP :  sap.ui.getCore().getModel("global").getData().ZZ_FAMILY_ACCOMP,
			},
			Constant: {
				ZZ_ELIGIBILITY: "Please note: There will be additional fee for cargo movements that shall take place on short notice. This applies for all mode of Cargo movement:\n\n" +
				" - Landfreight: with less than 10 working days handling time left (from placing the order till pick up date). The fee is about 750 EUR. \n" +
				" - Seafreight: with less than 15 working days handling time left (from placing the order till pick up date). The fee is about 1000 USD \n" +
				" - Airfreight: with less than 5 working days handling time left (from placing the order till pick up date). The fee is about 475 USD \n\n" +
				"The fee can be avoided if the cargo movement date can be delayed. Incase cargo has to be moved in short notice, additional charges will be recovered from you. The exact amount can be confirmed only after we receive invoice." 
			},

		},"true");
	},


	//save cargo
	sendPostRequest: function(sMDRole,sMDAction){
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true,this);
//		this.oBusyDialog.open();
		var m2e2_Cargo = this.getView().getModel("new").getData().Detail;
		try{
			var sText = sap.ui.getCore().byId('submitDialogTextarea').getValue();
			m2e2_Cargo.ZZ_COMMENT = sText;
		}catch(err){}
		var canContinue = this.checkError(this.getView()) ;

		if(canContinue){
			// Send OData Create request
			oThis =this;
			var oModel = this.getView().getModel();
			oModel.setHeaders({role: sMDRole,action: sMDAction});
			oModel.create("/ZE2E_CARGOSet", m2e2_Cargo, {
				success : jQuery.proxy(function(mResponse) {
					jQuery.sap.require("sap.m.MessageToast");
					// ID of newly inserted product is available in mResponse.ID
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oThis);
					if( sMDAction == "00" ){	//Save
						sap.m.MessageToast.show("The request has been saved.");
					}else{
						sap.m.MessageToast.show("The request has been submitted.");						
					}
					if(sMDRole!="03"){//Not Admin
						sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
					}else{
						this.getView().byId("idFilterRadio").fireSelect();
					}
				}, this),
				error : jQuery.proxy(function(error) {
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oThis);					
					var obsoleteRequest = error.response.body.indexOf("OBSOLETE_REQUEST");					
					if (obsoleteRequest != undefined) {
						sap.m.MessageToast.show("This request is obsolete!");
						oThis.doFilter('');
					} else {
						sap.m.MessageToast.show("Error!");	
					}
				}, this)
			});
		}else{
			sap.m.MessageToast.show("Check the error!" );
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false,this);
		}// End if (canContinue)

	},

	doCreateVAVN : function (oRequest){
		var oThis = this;
		// declare Batches
		// TravelUrl
		var sTravelUrl = "TRV_HDRSet(ZZ_PERNR='{0}',ZZ_DEP_REQ='{1}',ZZ_VERSION='{2}',ZZ_TRV_TYP='{3}')?$expand=DEP_EMP";
		sTravelUrl = sTravelUrl.replace("{0}",oRequest.ZZ_DEP_PERNR);
		sTravelUrl = sTravelUrl.replace("{1}",oRequest.ZZ_TRV_REQ);
		sTravelUrl = sTravelUrl.replace("{2}",oRequest.ZZ_VERSION.trim());
		sTravelUrl = sTravelUrl.replace("{3}",oRequest.ZZ_REQ_TYP);
		// CargoUrl
		var sCargoUrl = "ZE2E_CARGOSet(ZZ_REINR='{0}',ZZ_OWNER='{1}',ZZ_TRV_KEY='{2}',ZZ_VERSION='{3}',ZZ_CAR_TYP='{4}')?$expand=ZE2E_CARGO_E";
		sCargoUrl = sCargoUrl.replace("{0}",oRequest.ZZ_TRV_REQ); 
		sCargoUrl = sCargoUrl.replace("{1}",oRequest.ZZ_DEP_PERNR); 
		sCargoUrl = sCargoUrl.replace("{2}",oRequest.ZZ_REQ_TYP);         
		sCargoUrl = sCargoUrl.replace("{3}",oRequest.ZZ_VERSION.trim());       
		sCargoUrl = sCargoUrl.replace("{4}",oRequest.ZZ_CAR_TYP);     	   // V or S
		// DmsDocsSet
		var sDmsDocsSet = "DmsDocsSet?$filter=DepReq+eq+'{0}'+and+EmpNo+eq+'{1}'+and+DocType+eq+'{2}'";
		sDmsDocsSet = sDmsDocsSet.replace("{0}",oRequest.ZZ_TRV_REQ);
		sDmsDocsSet = sDmsDocsSet.replace("{1}",oRequest.ZZ_DEP_PERNR);
		switch(oRequest.ZZ_CAR_TYP){
		case "V": //If cargo type is ONWARD
			sDmsDocsSet = sDmsDocsSet.replace("{2}","CAO");
			break;
		case "S": //If cargo type is RETURN
			sDmsDocsSet = sDmsDocsSet.replace("{2}","CAR"); 
			break;
		}
		// Create batches
		var oBatch0 = oComponent.getModel().createBatchOperation(sTravelUrl, "GET");
		var oBatch1 = oComponent.getModel().createBatchOperation(sCargoUrl, "GET");
		var oBatch2 = oComponent.getModel().createBatchOperation(sDmsDocsSet, "GET");

		// Read batches
		oComponent.getModel().addBatchReadOperations([oBatch0,oBatch1,oBatch2]);
		oComponent.getModel().submitBatch(
				function(oResult){
					var oData = $.extend({}, oResult.__batchResponses[0].data, oResult.__batchResponses[1].data, oResult.__batchResponses[2].data);
					oData.Header = oResult.__batchResponses[0].data;
					oData.Detail = oResult.__batchResponses[1].data;
					oData.DocsSet = oResult.__batchResponses[2].data;
					oData.mode = {};
					oData.mode.editMode = false;

					if (oData.ZZ_REINR  == ""){
						oData.ZZ_REINR = oData.ZZ_DEP_REQ;
					}

					// Set cargo title
					switch(oRequest.ZZ_CAR_TYP){
					case "V":
						oData.CargoName = "ONWARD";
						break;
					case "S":
						oData.CargoName = "RETURN";
						break;
					}

					oData.mode.editMode = true;

					oData.Detail = {};
					oData.Detail.ZE2E_CARGO_E = {};

					// Cargo Header Key
					oData.Detail.ZZ_REINR   = oData.Header.ZZ_DEP_REQ; // travel request number
					oData.Detail.ZZ_OWNER   = oData.Header.ZZ_PERNR;   // Owner of the request
					oData.Detail.ZZ_TRV_KEY = oData.Header.ZZ_TRV_TYP; // request type
					oData.Detail.ZZ_VERSION = oData.Header.ZZ_VERSION; // version
					oData.Detail.ZZ_CAR_TYP = oRequest.ZZ_CAR_TYP; 	   // Cargo type

					// Cargo Extend Key
					oData.Detail.ZE2E_CARGO_E.ZZ_REINR   = oData.Header.ZZ_DEP_REQ; // travel request number
					oData.Detail.ZE2E_CARGO_E.ZZ_OWNER   = oData.Header.ZZ_PERNR;   // Owner of the requester
					oData.Detail.ZE2E_CARGO_E.ZZ_TRV_KEY = oData.Header.ZZ_TRV_TYP; // request type
					oData.Detail.ZE2E_CARGO_E.ZZ_VERSION = oData.Header.ZZ_VERSION; // version
					oData.Detail.ZE2E_CARGO_E.ZZ_CAR_TYP = oRequest.ZZ_CAR_TYP; 	// Cargo type

					//Set Cargo type
					oData.Detail.ZZ_CAR_TYP = oRequest.ZZ_CAR_TYP;
					oData.Detail.ZE2E_CARGO_E.ZZ_CAR_TYP = oRequest.ZZ_CAR_TYP;

					//Set Assignment type
					oData.Detail.ZE2E_CARGO_E.ZZ_ASG_TYP = oRequest.ZZ_ASG_TYP;

					// Set radio button default values
					oData.LoadingPlace = oThis.getView().byId("idRB_LoadingPlace_yes").getSelected();
					oData.LongTermStorage = oThis.getView().byId("idRB_Longterm_yes").getSelected();
					oData.RoleOut = oThis.getView().byId("idRB_RoleOut_yes").getSelected();
					oData.NotLongTermStorage = !oData.LongTermStorage;

					// If mobile is null, set mobile by default value of ZZ_MOBILE in Travel header table
					if (!oData.Detail.ZZ_MOBILE){
						oThis.getView().byId("idMobileInput").setValue(oData.Header.ZZ_MOBILE);	
					}

					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData(oData);
					oThis.getView().setModel(oModel, "new");
				},
				function(error){
					alert("No data found");
				});
	},

	doModifyVAVN : function(oRequest){
		var oThis = this;
		// declare Batches
		// TravelUrl
		var sTravelUrl = "TRV_HDRSet(ZZ_PERNR='{0}',ZZ_DEP_REQ='{1}',ZZ_VERSION='{2}',ZZ_TRV_TYP='{3}')?$expand=DEP_EMP";
		sTravelUrl = sTravelUrl.replace("{0}",oRequest.ZZ_DEP_PERNR);
		sTravelUrl = sTravelUrl.replace("{1}",oRequest.ZZ_TRV_REQ);
		sTravelUrl = sTravelUrl.replace("{2}",oRequest.ZZ_VERSION.trim());
		sTravelUrl = sTravelUrl.replace("{3}",oRequest.ZZ_REQ_TYP);
		// CargoUrl
		var sCargoUrl = "ZE2E_CARGOSet(ZZ_REINR='{0}',ZZ_OWNER='{1}',ZZ_TRV_KEY='{2}',ZZ_VERSION='{3}',ZZ_CAR_TYP='{4}')?$expand=ZE2E_CARGO_E";
		sCargoUrl = sCargoUrl.replace("{0}",oRequest.ZZ_TRV_REQ); 
		sCargoUrl = sCargoUrl.replace("{1}",oRequest.ZZ_DEP_PERNR); 
		sCargoUrl = sCargoUrl.replace("{2}",oRequest.ZZ_REQ_TYP);         
		sCargoUrl = sCargoUrl.replace("{3}",oRequest.ZZ_VERSION.trim());       
		sCargoUrl = sCargoUrl.replace("{4}",oRequest.ZZ_CAR_TYP);     	   // V or S
		// DmsDocsSet
		var sDmsDocsSet = "DmsDocsSet?$filter=DepReq+eq+'{0}'+and+EmpNo+eq+'{1}'+and+DocType+eq+'{2}'";
		sDmsDocsSet = sDmsDocsSet.replace("{0}",oRequest.ZZ_TRV_REQ);
		sDmsDocsSet = sDmsDocsSet.replace("{1}",oRequest.ZZ_DEP_PERNR);
		switch(oRequest.ZZ_CAR_TYP){
		case "V": //If cargo type is ONWARD
			sDmsDocsSet = sDmsDocsSet.replace("{2}","CAO");
			break;
		case "S": //If cargo type is RETURN
			sDmsDocsSet = sDmsDocsSet.replace("{2}","CAR"); 
			break;
		}
		// Create batches
		var oBatch0 = oComponent.getModel().createBatchOperation(sTravelUrl, "GET");
		var oBatch1 = oComponent.getModel().createBatchOperation(sCargoUrl, "GET");
		var oBatch2 = oComponent.getModel().createBatchOperation(sDmsDocsSet, "GET");

		// Read batches
		oComponent.getModel().addBatchReadOperations([oBatch0,oBatch1,oBatch2]);
		oComponent.getModel().submitBatch(
				function(oResult){
					var oData = $.extend({}, oResult.__batchResponses[0].data, oResult.__batchResponses[1].data, oResult.__batchResponses[2].data);
					oData.Header = oResult.__batchResponses[0].data;
					oData.Detail = oResult.__batchResponses[1].data;
					oData.DocsSet = oResult.__batchResponses[2].data;
					oData.mode = {};
					oData.mode.editMode = false;

					if (oData.ZZ_REINR  == ""){
						oData.ZZ_REINR = oData.ZZ_DEP_REQ;
					}

					// Set cargo title
					switch(oRequest.ZZ_CAR_TYP){
					case "V":
						oData.CargoName = "ONWARD";
						break;
					case "S":
						oData.CargoName = "RETURN";
						break;
					}

					oData.mode.editMode = true;

					// If Number of rooms and Living space equal 0 then remove 0 value
					if (oData.Detail.ZE2E_CARGO_E.ZZ_ROOM_NO == "0"){
						oData.Detail.ZE2E_CARGO_E.ZZ_ROOM_NO = "";
					}
					if (oData.Detail.ZE2E_CARGO_E.ZZ_LIV_SPA == 0){
						oData.Detail.ZE2E_CARGO_E.ZZ_LIV_SPA = "";
					}

					// Set selected radio buttons
					if (oData.Detail.ZE2E_CARGO_E.ZZ_CAR_LOA_F == "X"){
						oData.LoadingPlace = true;
					} else {
						oData.LoadingPlace = false;
					}
					if (oData.Detail.ZE2E_CARGO_E.ZZ_CAR_LON_STR == "X"){
						oData.LongTermStorage = true;
					} else {
						oData.LongTermStorage = false;

					}
					if (oData.Detail.ZE2E_CARGO_E.ZZ_CAR_EXI == "X"){
						oData.RoleOut = true;
					} else {
						oData.RoleOut = false;
					}

					oData.NotLongTermStorage = !oData.LongTermStorage;

					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData(oData);
					oThis.getView().setModel(oModel, "new");
				},
				function(error){
					alert("No data found");
				});

	},


	doSubmitVAVN : function (oRequest){
		var oThis = this;
		// declare Batches
		// TravelUrl
		var sTravelUrl = "TRV_HDRSet(ZZ_PERNR='{0}',ZZ_DEP_REQ='{1}',ZZ_VERSION='{2}',ZZ_TRV_TYP='{3}')?$expand=DEP_EMP";
		sTravelUrl = sTravelUrl.replace("{0}",oRequest.ZZ_DEP_PERNR);
		sTravelUrl = sTravelUrl.replace("{1}",oRequest.ZZ_TRV_REQ);
		sTravelUrl = sTravelUrl.replace("{2}",oRequest.ZZ_VERSION.trim());
		sTravelUrl = sTravelUrl.replace("{3}",oRequest.ZZ_REQ_TYP);
		// CargoUrl
		var sCargoUrl = "ZE2E_CARGOSet(ZZ_REINR='{0}',ZZ_OWNER='{1}',ZZ_TRV_KEY='{2}',ZZ_VERSION='{3}',ZZ_CAR_TYP='{4}')?$expand=ZE2E_CARGO_E";
		sCargoUrl = sCargoUrl.replace("{0}",oRequest.ZZ_TRV_REQ); 
		sCargoUrl = sCargoUrl.replace("{1}",oRequest.ZZ_DEP_PERNR); 
		sCargoUrl = sCargoUrl.replace("{2}",oRequest.ZZ_REQ_TYP);         
		sCargoUrl = sCargoUrl.replace("{3}",oRequest.ZZ_VERSION.trim());       
		sCargoUrl = sCargoUrl.replace("{4}",oRequest.ZZ_CAR_TYP);     	   // V or S
		// DmsDocsSet
		var sDmsDocsSet = "DmsDocsSet?$filter=DepReq+eq+'{0}'+and+EmpNo+eq+'{1}'+and+DocType+eq+'{2}'";
		sDmsDocsSet = sDmsDocsSet.replace("{0}",oRequest.ZZ_TRV_REQ);
		sDmsDocsSet = sDmsDocsSet.replace("{1}",oRequest.ZZ_DEP_PERNR);
		switch(oRequest.ZZ_CAR_TYP){
		case "V": //If cargo type is ONWARD
			sDmsDocsSet = sDmsDocsSet.replace("{2}","CAO");
			break;
		case "S": //If cargo type is RETURN
			sDmsDocsSet = sDmsDocsSet.replace("{2}","CAR"); 
			break;
		}
		// Create batches
		var oBatch0 = oComponent.getModel().createBatchOperation(sTravelUrl, "GET");
		var oBatch1 = oComponent.getModel().createBatchOperation(sCargoUrl, "GET");
		var oBatch2 = oComponent.getModel().createBatchOperation(sDmsDocsSet, "GET");

		// Read batches
		oComponent.getModel().addBatchReadOperations([oBatch0,oBatch1,oBatch2]);
		oComponent.getModel().submitBatch(
				function(oResult){
					var oData = $.extend({}, oResult.__batchResponses[0].data, oResult.__batchResponses[1].data, oResult.__batchResponses[2].data);
					oData.Header = oResult.__batchResponses[0].data;
					oData.Detail = oResult.__batchResponses[1].data;
					oData.DocsSet = oResult.__batchResponses[2].data;
					oData.mode = {};
					oData.mode.editMode = false;

					if (oData.ZZ_REINR  == ""){
						oData.ZZ_REINR = oData.ZZ_DEP_REQ;
					}

					// Set cargo title
					switch(oRequest.ZZ_CAR_TYP){
					case "V":
						oData.CargoName = "ONWARD";
						break;
					case "S":
						oData.CargoName = "RETURN";
						break;
					}

					// If Number of rooms and Living space equal 0 then remove 0 value
					if (oData.Detail.ZE2E_CARGO_E.ZZ_ROOM_NO == "0"){
						oData.Detail.ZE2E_CARGO_E.ZZ_ROOM_NO = "";
					}
					if (oData.Detail.ZE2E_CARGO_E.ZZ_LIV_SPA == 0){
						oData.Detail.ZE2E_CARGO_E.ZZ_LIV_SPA = "";
					}

					// Set selected radio buttons
					if (oData.Detail.ZE2E_CARGO_E.ZZ_CAR_LOA_F == "X"){
						oData.LoadingPlace = true;
					} else {
						oData.LoadingPlace = false;
					}
					if (oData.Detail.ZE2E_CARGO_E.ZZ_CAR_LON_STR == "X"){
						oData.LongTermStorage = true;
					} else {
						oData.LongTermStorage = false;

					}
					if (oData.Detail.ZE2E_CARGO_E.ZZ_CAR_EXI == "X"){
						oData.RoleOut = true;
					} else {
						oData.RoleOut = false;
					}

					oData.NotLongTermStorage = !oData.LongTermStorage;

					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData(oData);
					oThis.getView().setModel(oModel, "new");
				},
				function(error){
					alert("No data found");
				});
	},

	onSave: function(evt){
		if(sCargoType=="V" || sCargoType=="S"){
			this.sendPostRequest("01","00");
		}else{
			this.sendPostRequest("01","00");
		}
	},

	onReject: function(oEvent){
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
			        	  placeholder: 'Comment (required)'
			          })
			          ],
			          beginButton: new sap.m.Button({
			        	  text: 'Reject',
			        	  enabled: false,
			        	  press: function () {
			        		  sap.ui.project.e2etm.util.StaticUtility.setBusy(true,oThis);
			        		  var sText = sap.ui.getCore().byId('submitDialogTextarea').getValue();
			        		  var oData = oThis.getView().getModel("new").getData();
			        		  var sUrl = sServiceUrl + "CargoReject?ZZ_COMMENTS='{0}'&ZZ_TRV_KEY='{1}'&ZZ_TRV_REQ='{2}'&ZZ_MODID='{3}'&$format=json";
			        		  sUrl = sUrl.replace("{0}", sText);
			        		  sUrl = sUrl.replace("{1}", oData.ZZ_TRV_KEY);
			        		  sUrl = sUrl.replace("{2}", oData.ZZ_REINR);

			        		  var sModid;
			        		  if (oData.ZZ_CAR_TYP == "O" || oData.ZZ_CAR_TYP == "V"){
			        			  sModid = "CARO";
			        		  } else if (oData.ZZ_CAR_TYP == "R" || oData.ZZ_CAR_TYP == "S"){
			        			  sModid = "CARR";
			        		  }
			        		  sUrl = sUrl.replace("{3}", sModid);

			        		  var get = $.ajax({
			        			  cache: false,
			        			  url: sUrl,
			        			  type: "GET"
			        		  });
			        		  get.done(function(result){
			        			  sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oThis);
			        			  alert("Request is successfully rejected !");
			        			  oComponent.getModel().refresh();
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

	onSendBackPress : function(oEvent){
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
			        		  var sUrl = sServiceUrl + "CargoSendBack?ZZ_COMMENTS='{0}'&ZZ_TRV_KEY='{1}'&ZZ_TRV_REQ='{2}'&ZZ_MODID='{3}'&$format=json";
			        		  sUrl = sUrl.replace("{0}", sText);
			        		  sUrl = sUrl.replace("{1}", oData.ZZ_TRV_KEY);
			        		  sUrl = sUrl.replace("{2}", oData.ZZ_REINR);

			        		  var sModid;
			        		  if (oData.ZZ_CAR_TYP == "O" || oData.ZZ_CAR_TYP == "V"){
			        			  sModid = "CARO";
			        		  } else if (oData.ZZ_CAR_TYP == "R" || oData.ZZ_CAR_TYP == "S"){
			        			  sModid = "CARR";
			        		  }
			        		  sUrl = sUrl.replace("{3}", sModid);

			        		  var get = $.ajax({
			        			  cache: false,
			        			  url: sUrl,
			        			  type: "GET"
			        		  });
			        		  get.done(function(result){
			        			  sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oThis);
			        			  alert("Request is successfully sent back !");
			        			  oComponent.getModel().refresh();
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

	onSubmit: function(evt){
		if(sCargoType=="O" || sCargoType=="R"){
			var oRole = "";
			if( sap.ui.getCore().getModel("profile").getData().currentRole == "EMP" ){
				oRole = "01";
				//validate file data
//				var canContinue = false;
//				var aFiles = this.getView().getModel("new").getData().Files;
//				jQuery.each(aFiles, function (i, file){
//				if (file.FileName == "CargoLetterTemplate.pdf"){
//				canContinue = true;
//				return true;
//				}
//				});
			}else{	//Admin
				oRole = "03";
			}
			// validate file data
//			if (canContinue){
			var oThis = this;
			var dialog = new sap.m.Dialog({
				title: 'Confirm',
				type: 'Message',
				content: [
				          new sap.m.Text({ text: 'Are you sure you want to submit this request ?' }),
				          new sap.m.TextArea('submitDialogTextarea', {
				        	  width: '100%',
				        	  placeholder: 'Comment (optional)'
				          })
				          ],
				          beginButton: new sap.m.Button({
				        	  text: 'Submit',
				        	  enabled: true,
				        	  press: function () {
				        		  dialog.close();
				        		  oThis.sendPostRequest(oRole,"01");
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
			//validate file data
//			} else {
//			jQuery.sap.require("sap.m.MessageToast");
//			sap.m.MessageToast.show("You haven't upload CargoLetterTemplate.pdf yet!");
//			this.getView().byId("idIconTabBarMulti").setSelectedKey("attachmentTab");
//			}
		}else{
			var oRole = "";
			if( sap.ui.getCore().getModel("profile").getData().currentRole == "EMP" ){
				oRole = "01";
			}else{	//Admin
				oRole = "03";
			}
			var oThis = this;		
/*Start-Cargo Changes*/			
			this.checkAttachments();
/*End-Cargo Changes*/			
			
			this["attachments"].done(function(){
			
			var dialog = new sap.m.Dialog({
				title: 'Confirm',
				type: 'Message',
				content: [
					//new sap.ui.core.HTML({content:"<p><b>* Kindly download the excel document and submit later directly to the cargo vendor</b></p>"}),
//					      new sap.m.Text({text:'Kindly download the excel document and submit later directly to the cargo vendor'}),
				          new sap.m.Text({ text: 'Are you sure you want to submit this request ?' }),
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
				        	  text: 'Submit',
				        	  enabled: false,
				        	  press: function () {
				        		  var sText = sap.ui.getCore().byId('submitDialogTextarea').getValue();
				        		  var oData = oThis.getView().getModel("new").getData();
				        		  oData.Detail.ZZ_COMMENT = sText;
				        		  oThis.getView().getModel("new").setData(oData);
				        		  oThis.sendPostRequest(oRole,"01");
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
			
			})
			.fail(jQuery.proxy(function(){				
				this.getView().byId("idIconTabBarMulti").setSelectedKey("attachmentTab");
				var message = "Kindly fill the '{0}' which is available in the attachment icon and submit the request";
				message = message.replace("{0}","CARGO_AIRFREIGHT_"+sap.ui.getCore().getModel("global").getData().ZZ_ASG_TYP+"_"+
						this.getView().getModel("new").getData().ZZ_PERNR+"_"+this.getView().getModel("new").getData().ZZ_REINR+".PDF");
		
				var dialog = new sap.m.Dialog({
					title: 'Error',
					type: 'Message',
					state: 'Error',
					content: new sap.m.Text({
						//text: jQuery.parseXML(error.response.body).querySelector("message").textContent
						text: message
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
				return;
		
			},this));
		}
		

	},
	checkAttachments:function(){
		
		this["attachments"] = $.Deferred();
		if (sap.ui.getCore().getModel("profile").getData().currentRole == "EMP") {//Employee
			
//			var searchIndex = -1;
//			var files = this.getView().getModel("new").getData().Files;
//				$.each(files, function(index, elem) {
//					
//					if (((elem.FileName).indexOf("Airfreight"))!=-1){
//						searchIndex = index;
//					    return false;
//					}
//				});
//				if (searchIndex == -1) {
//					this["attachments"].reject();
//				}else
//					this["attachments"].resolve();
		
			var odata = {ZZ_REINR:this.getView().getModel("new").getData().ZZ_REINR,
					     ZZ_CAR_TYP:sCargoType};
			
		//	oComponent.getModel().setHeaders({"Cache-Control":"no-cache"});
			oComponent.getModel().callFunction("GetCargoFormStatus", "POST", odata, null, jQuery.proxy(function(oData, response) {
				
			if(oData.GetCargoFormStatus.ZZ_SAV_STATUS == 'S'){
				this["attachments"].resolve();
			}else{
				this["attachments"].reject();
			}
		},this), function(error) {

		});
				
	}else {//Admin
	   		this["attachments"].resolve();
		  }
		return this["attachments"];
	},

	handleChange: function (oEvent) {
//		var oText = this.byId("T1");
		var oDP = oEvent.oSource;
		var sValue = oEvent.getParameter("value");
		var bValid = oEvent.getParameter("valid");
//		this._iEvent++;
//		oText.setText("Change - Event " + this._iEvent + ": DatePicker " + oDP.getId() + ":" + sValue);

		if (bValid) {
			oDP.setValueState(sap.ui.core.ValueState.None);
			return true;
		} else {
			oDP.setValueState(sap.ui.core.ValueState.Error);
			return false;
		}
	},

//	create new cargo 
	doCreatNewCargo: function(){
		var oThis = this;
		var sURL0 = "TRV_HDRSet(ZZ_PERNR='{0}',ZZ_DEP_REQ='{1}',ZZ_VERSION='{2}',ZZ_TRV_TYP='{3}')?$expand=DEP_EMP,TRV_HDRtoTRV_travel_Data";
		sURL0 = sURL0.replace("{0}", sPernr);
		sURL0= sURL0.replace("{1}", sTravelRequest);
		sURL0 = sURL0.replace("{2}", sVersion);
		sURL0 = sURL0.replace("{3}", sType);
		var sURL1;
		var globalData = sap.ui.getCore().getModel("global").getData();
		if(globalData.ZZ_DEP_TOCNTRY == "AT" && globalData.ZZ_DEP_TOLOC == "VNA"){
			sURL1 = "ZE2E_CARGO_ELISet?$filter=ZZ_DEP_TOCNTRY+eq+'{0}'+and+ZZ_DEP_TOLOC+eq+'{1}'";
			sURL1 = sURL1.replace("{0}", globalData.ZZ_DEP_TOCNTRY);
			sURL1 = sURL1.replace("{1}", globalData.ZZ_DEP_TOLOC);
		}else{
			sURL1 = "ZE2E_CARGO_ELISet";
		}
		
//		var sURL1 = "GetF4Table?TableName='ZE2E_CARGO_ELI'&Col1='ZZ_CAR_TYP'&Col2='ZZ_FROM'&Col3='ZZ_TO'&Col4='ZZ_CAR_LIMIT'&Col5=''&Col6=''&Col7=''&Col8=''&Col9=''&Col10=''";

		// Create batches
		var oBatch0 = oComponent.getModel().createBatchOperation(sURL0, "GET");
		var oBatch1 = oComponent.getModel().createBatchOperation(sURL1, "GET");

		// Read batches
		oComponent.getModel().addBatchReadOperations([oBatch0,oBatch1]);
		oComponent.getModel().submitBatch(
				function(oResult){
					var oData = $.extend({}, oResult.__batchResponses[0].data, oResult.__batchResponses[1].data);
					var oModel = new sap.ui.model.json.JSONModel();
					//Get eligibility Table
					oData.EligibilityTable = oThis.filterEligibilityTable(oResult.__batchResponses[1].data.results, sCargoType);

					oModel.setData(oData);
					oThis.getView().setModel(oModel,"new");
					
					var lt_dependent = oResult.__batchResponses[0].data.TRV_HDRtoTRV_travel_Data.results;
					var iNoOfTravellers = 0;
					var aTravellers = [];
					if (lt_dependent.length > 1){
						for (var i = 0; i < lt_dependent.length; i++) { 
							 if(sap.ui.project.e2etm.util.StaticUtility.getArrayIndex(aTravellers,"ZZ_ZSLFDPD",lt_dependent[i].ZZ_ZSLFDPD) == -1){
								 aTravellers.push(lt_dependent[i]);
							 }
						}
					}
					iNoOfTravellers = aTravellers.length;
					oThis.initializeNewCargoData();
					oThis.getView().getModel("new").setProperty("/Dependents",iNoOfTravellers); //Actually it's no. of travellers	
//					
//					var lt_dependent = oResult.__batchResponses[0].data.TRV_HDRtoTRV_travel_Data.results;
//					var sDependents;
//					if (sType == "TRFR") {
//						sDependents = lt_dependent.length;
//					} else {
//						sDependents = lt_dependent.length/2;
//					}
//					oThis.initializeNewCargoData();
//					oThis.getView().getModel("new").setProperty("/Dependents",sDependents); //Actually it's no. of travellers
					
					oThis.typeCargo(sCargoType,oThis,globalData);
					oThis.getView().getModel("new").setProperty("/ZZ_CAR_TYP",sCargoType);
					
					var sURL2 = "ZE2E_CARGO_ELISet(ZZ_TRV_KEY='{0}',ZZ_CAR_TYP='{1}',ZZ_FROM='{2}',ZZ_TO='{3}',ZZ_DEP_TOCNTRY='{4}',ZZ_DEP_TOLOC='{5}')";
					sURL2 = sURL2.replace("{0}", sType);
					sURL2 = sURL2.replace("{1}", sCargoType);
					sURL2 = sURL2.replace("{2}", oData.ZZ_ZDURN.trim());
					sURL2 = sURL2.replace("{3}", oData.ZZ_ZDURN.trim());
					sURL2 = sURL2.replace("{4}", sap.ui.getCore().getModel("global").getData().ZZ_DEP_TOCNTRY);
					sURL2 = sURL2.replace("{5}", sap.ui.getCore().getModel("global").getData().ZZ_DEP_TOLOC);
					
					var sURL3 = "ZE2E_CARGO_ELISet(ZZ_TRV_KEY='{0}',ZZ_CAR_TYP='{1}',ZZ_FROM='{2}',ZZ_TO='{3}',ZZ_DEP_TOCNTRY='{4}',ZZ_DEP_TOLOC='{5}')";
					sURL3 = sURL3.replace("{0}", sType);
					sURL3 = sURL3.replace("{1}", sCargoType + "1");
					sURL3 = sURL3.replace("{2}", oData.ZZ_ZDURN.trim());
					sURL3 = sURL3.replace("{3}", oData.ZZ_ZDURN.trim());
					sURL3 = sURL3.replace("{4}", sap.ui.getCore().getModel("global").getData().ZZ_DEP_TOCNTRY);
					sURL3 = sURL3.replace("{5}", sap.ui.getCore().getModel("global").getData().ZZ_DEP_TOLOC);
					
					// Create batches
					var oBatch2 = oComponent.getModel().createBatchOperation(sURL2, "GET");
					var oBatch3 = oComponent.getModel().createBatchOperation(sURL3, "GET");
					
					// Read batches
					var oThis_eli = oThis;
					oComponent.getModel().addBatchReadOperations([oBatch2,oBatch3]);
					oComponent.getModel().submitBatch(
					function (oResult){
						var sEmp_eligibility;
						var sDep_eligibility;
						sEmp_eligibility = oResult.__batchResponses[0].data.ZZ_CAR_LIMIT.trim() + " " + oResult.__batchResponses[0].data.ZZ_CAR_UNIT;
						
						var stvaFlag = sap.ui.project.e2etm.util.StaticUtility.checkValidCargoTp(
								sap.ui.getCore().getModel("global").getData().ZZ_ASG_TYP,
								sap.ui.getCore().getModel("global").getData().ZZ_TRV_REQ,
								sap.ui.getCore().getModel("global").getData().ZZ_DEP_TOCNTRY,
								sap.ui.getCore().getModel("global").getData().ZZ_DEP_TOLOC);
						
						if(stvaFlag &&
						   (sap.ui.getCore().getModel("global").getData().ZZ_CAR_TYP=="V"||
						    sap.ui.getCore().getModel("global").getData().ZZ_CAR_TYP=="S")){//AA Logistics
						var duration = Number(oThis_eli.getView().getModel("new").getData().ZZ_ZDURN.trim());
						sDep_eligibility = "0";
						if(sap.ui.getCore().getModel("global").getData().ZZ_DEP_TOCNTRY == "AT"){
							if(duration>=90 && duration<=365)
								sEmp_eligibility =  "100 KG";
							else if(duration>=366 && duration<=515)
								sEmp_eligibility =  "200 KG";
							else if(duration>=516 && duration<=730)
								sEmp_eligibility =  "300 KG";
						}else{
						if(duration>=90 && duration<=365)
							sEmp_eligibility =  "100 KG";
						else if(duration>=366 && duration<=730)
							sEmp_eligibility =  "200 KG";
						}
						}else{//if not STVA
						
						if (oResult.__batchResponses[1].data.ZZ_TRV_KEY != 'X'){
							var sDepNum = iNoOfTravellers - 1;
							sDep_eligibility = oResult.__batchResponses[1].data.ZZ_CAR_LIMIT * sDepNum;
							sDep_eligibility = sDep_eligibility + " " + oResult.__batchResponses[1].data.ZZ_CAR_UNIT;
						} else {
							sDep_eligibility =  oResult.__batchResponses[1].data.ZZ_CAR_LIMIT;
						}
						}
						oThis_eli.getView().getModel("new").setProperty("/Detail/ZZ_ELIGIBILITY",sEmp_eligibility);
						oThis_eli.getView().getModel("new").setProperty("/Detail/ZZ_ELIGIBILITY_DEP",sDep_eligibility);
					}, function (error){
						sap.m.MessageToast.show("Cannot get Cargo eligibility", {
							duration : 10000,
							closeOnBrowserNavigation : false
						});
					});

					var sModule;
					var sModid;
					var sModule_2;
					if (sCargoType == "O" || sCargoType == "V"){
						sModule   = "CAO";
						sModid    = "CARG";
						sModule_2 = "CARO";
					}  else if (sCargoType == "R" || sCargoType == "S"){
						sModule   = "CAR";
						sModid    = "CARG";
						sModule_2 = "CARR";
					} 

					//NHI1HC
					var sUrl = sServiceUrl + "TravelPdfSet(EmpNo='{0}',TrNo='{1}',TrvKey='{2}',Module='{3}')/$value"; //sua module nay
					sUrl = sUrl.replace("{0}", sPernr);
					sUrl = sUrl.replace("{1}", sTravelRequest);
					sUrl = sUrl.replace("{2}", sType);
					sUrl = sUrl.replace("{3}", sModule_2);

					oThis.getView().byId('idCargoLeterLink').setHref(sUrl);
					//NHI1HC

					// Get document list
					sap.ui.project.e2etm.util.StaticUtility.getDocumentList(oThis,sTravelRequest, sPernr,sModule,sModid,oData.ZZ_LAND1);
					if(oHomeThis)
						sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
				}, function(error){
					alert("No data found");
				});

//		oComponent.getModel().read(sURL0,null,null,false,		
//		function(oData,oRespone){
//		var oModel = new sap.ui.model.json.JSONModel();
//		oModel.setData(oData);
//		oThis.getView().setModel(oModel,"new");
//		oThis.initializeNewCargoData();

//		var sURL2 = "ZE2E_CARGO_ELISet(ZZ_TRV_KEY='{0}',ZZ_CAR_TYP='{1}',ZZ_FROM='{2}',ZZ_TO='{3}')";
//		sURL2 = sURL2.replace("{0}", sType);
//		sURL2 = sURL2.replace("{1}", sCargoType);
//		sURL2 = sURL2.replace("{2}", oData.ZZ_ZDURN.trim());
//		sURL2 = sURL2.replace("{3}", oData.ZZ_ZDURN.trim());
//		var oThis_eli = oThis;
//		oComponent.getModel().read(sURL2,null,null,false,		
//		function(oData_eli,oRespone_eli){
//		oThis_eli.getView().getModel("new").setProperty("/Detail/ZZ_ELIGIBILITY",oData_eli.ZZ_CAR_LIMIT);
//		},function(error){
//		alert("Cannot get Cargo eligibility");
//		});

//		var sModule;
//		var sModid;
//		var sModule_2;
//		if (sCargoType == "O" || sCargoType == "V"){
//		sModule   = "CAO";
//		sModid    = "CARG";
//		sModule_2 = "CARO";
//		}  else if (sCargoType == "R" || sCargoType == "S"){
//		sModule   = "CAR";
//		sModid    = "CARG";
//		sModule_2 = "CARR";
//		} 

//		//NHI1HC
//		var sUrl = sServiceUrl + "TravelPdfSet(EmpNo='{0}',TrNo='{1}',TrvKey='{2}',Module='{3}')/$value"; //sua module nay
//		sUrl = sUrl.replace("{0}", sPernr);
//		sUrl = sUrl.replace("{1}", sTravelRequest);
//		sUrl = sUrl.replace("{2}", sType);
//		sUrl = sUrl.replace("{3}", sModule_2);

//		oThis.getView().byId('idCargoLeterLink').setHref(sUrl);
//		//NHI1HC

//		// Get document list
//		sap.ui.project.e2etm.util.StaticUtility.getDocumentList(oThis,sTravelRequest, sPernr,sModule,sModid,oData.ZZ_LAND1);
//		},
//		function(error){
//		alert("No data found");
//		}
//		);
	},
//	on cancel click
	onCancel: function(){
//		case of create
		switch (globalData.action) {
		case "00": //Create
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

			break;
		case "01": //Change

			break;
		case "02": //Open
			var oThis = this;
			var dialog = new sap.m.Dialog({
				title: 'Confirm',
				type: 'Message',
				content: [
				          new sap.m.Text({ text: 'Are you sure you want to cancel this request ?If any changes to the data required, please contact Cargo team to send the request back for correction' }),
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
				        	  text: 'Accept',
				        	  enabled: false,
				        	  press: function () {
				        		  sap.ui.project.e2etm.util.StaticUtility.setBusy(true,oThis);
				        		  var sText = sap.ui.getCore().byId('submitDialogTextarea').getValue();
				        		  var oData = oThis.getView().getModel("new").getData();
				        		  var sUrl = sServiceUrl + "ReqCancel?ZZ_TRV_REQ='{0}'&ZZ_TRV_KEY='{1}'&ZZ_COMMENTS='{2}'&ZZ_MODID='{3}'&$format=json";
				        		  sUrl = sUrl.replace("{0}", oData.ZZ_REINR);
				        		  sUrl = sUrl.replace("{1}", oData.ZZ_TRV_KEY);
				        		  sUrl = sUrl.replace("{2}", sText);
				        		  var sModid;
				        		  if (oData.ZZ_CAR_TYP == "O" || oData.ZZ_CAR_TYP == "V"){
				        			  sModid = "CARO";
				        		  } else if (oData.ZZ_CAR_TYP == "R" || oData.ZZ_CAR_TYP == "S"){
				        			  sModid = "CARR";
				        		  }
				        		  sUrl = sUrl.replace("{3}", sModid);

				        		  var get = $.ajax({
				        			  cache: false,
				        			  url: sUrl,
				        			  type: "GET"
				        		  });
				        		  get.done(function(result){
				        			  sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oThis);
				        			  alert("Request is successfully cancelled !");
				        			  oComponent.getModel().refresh();
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
			break;
		}






	},
	//CARGO ADMIN

	// select list item
	onMasterListSelect: function(oEvent){
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

		sPernr = oRequest.ZZ_OWNER;
		sDEPRequest = oRequest.ZZ_REINR;
		sType = oRequest.ZZ_TRV_KEY;
		sCargoType = oRequest.ZZ_CAR_TYP;
		sTravelRequest = oRequest.ZZ_REINR;
		sVersion = oRequest.ZZ_VERSION.trim();

		sDepType = oRequest.ZZ_DEP_TYPE;

		var globalData = sap.ui.getCore().getModel("global").getData();
		this.getCargo(sPernr,sDEPRequest,sType,sCargoType,sTravelRequest,sVersion,globalData);
		var sModule = "";
		switch(sCargoType){
		case "O":
			sModule = "CARO";
			break;
		case "R":
			sModule = "CARR";
			break;
		case "V":
			sModule = "CARO";
			break;
		case "S":
			sModule = "CARR";
			break;
		}
		sap.ui.project.e2etm.util.StaticUtility.setBusy(false,this);
	},

	onUpdateStarted:function(oEvent){
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true,this);
	},

	onUpdateFisnish: function(oEvent){
		if( oEvent.getSource().getItems().length > 0 ){
			this.setEnableButons(true);
			this.onRouteMatched(oEvent);
			var sPath = oEvent.getSource().getItems()[0].getBindingContext().getPath();
			oEvent.getSource().setSelectedItem(oEvent.getSource().getItems()[0], true);
			var oRequest = oEvent.getSource().getModel().getProperty(sPath,null,true);
			var oData = sap.ui.getCore().getModel("global").getData();
			if(oRequest.ZE2E_REQ_STATUS.ZZ_NROLE == "01" &&
					oRequest.ZE2E_REQ_STATUS.ZZ_ACTION == "01"){
				oData.action = "01";	//Change
			}else if(oRequest.ZE2E_REQ_STATUS.ZZ_NROLE == "01" &&
					oRequest.ZE2E_REQ_STATUS.ZZ_ACTION == "09"){//action
				oData.action = "09";	//Cancel
			}else{
				oData.action = "02";	//Open
			}
			sap.ui.getCore().getModel("global").setData(oData);

			sPernr = oRequest.ZZ_OWNER;
			sDEPRequest = oRequest.ZZ_REINR;
			sType = oRequest.ZZ_TRV_KEY;
			sCargoType = oRequest.ZZ_CAR_TYP;
			sTravelRequest = oRequest.ZZ_REINR;
			sVersion = oRequest.ZZ_VERSION.trim();

			sDepType = oRequest.ZZ_DEP_TYPE;
			var sModule = "";
			switch(sCargoType){
			case "O":
				sModule = "CARO";
				break;
			case "R":
				sModule = "CARR";
				break;
			case "V":
				sModule = "CARO";
				break;
			case "S":
				sModule = "CARR";
				break;
			}
			var globalData = sap.ui.getCore().getModel("global").getData();
			this.getCargo(sPernr,sDEPRequest,sType,sCargoType,sTravelRequest,sVersion,globalData);
			this.displayNoRequest(false);
			// If admin select tab closed request disable buttons
			if(oRequest.ZE2E_REQ_STATUS.ZZ_NROLE == "03" &&
					(oRequest.ZE2E_REQ_STATUS.ZZ_ACTION == "01" || oRequest.ZE2E_REQ_STATUS.ZZ_ACTION == "08")){
				this.setEnableButons(false);
				this.getView().byId("idZZ_ELIGIBILITY").setEditable(false);
				this.getView().byId("idZZ_ELIGIBILITY_DEP").setEditable(false);
			}else if(oRequest.ZE2E_REQ_STATUS.ZZ_NROLE == "01" &&
					oRequest.ZE2E_REQ_STATUS.ZZ_ACTION == "09"){//Cancel
				this.setEnableButons(false);
				this.getView().byId("idZZ_ELIGIBILITY").setEditable(false);
				this.getView().byId("idZZ_ELIGIBILITY_DEP").setEditable(false);
			}else{
				this.getView().byId("idZZ_ELIGIBILITY").setEditable(true);
				this.getView().byId("idZZ_ELIGIBILITY_DEP").setEditable(true);
				this.setEnableButons(true);
			}

			sap.ui.project.e2etm.util.StaticUtility.setBusy(false,this);
		} else {
			this.clearData();
			this.setEnableButons(false);
			this.displayNoRequest(true);
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false,this);

		}
	},

	displayNoRequest:function(bBool){
		if( bBool ){
			sap.ui.core.routing.Router.getRouter("MyRouter").myNavToWithoutHash({
				currentView : this.getView(),
				targetViewName : "sap.ui.project.e2etm.view.NoData",
				targetViewType : "XML",
				transition : "slide"
			},"cargoSplitApp");
		}else{
			sap.ui.core.routing.Router.getRouter("MyRouter").backWithoutHash(this.getView(),"cargoSplitApp");
		}
	},

	clearData:function(){
		if( this.getView().getModel("new") ){
			var oData = this.getView().getModel("new").getData();
			oData = {};
			this.getView().getModel("new").setData(oData);
			this.getView().getModel("new").destroy();
		}
	},
	setEnableButons:function(bBool){
		try {
			this.getView().byId("btnSendBack").setEnabled(bBool);
		}catch(err){}

		try {
			this.getView().byId("btnSubmit").setEnabled(bBool);
		}catch(err){}

		try {
			this.getView().byId("btnSave").setEnabled(bBool);
		}catch(err){}

		try {
//			this.getView().byId("btnReject").setEnabled(bBool);
		}catch(err){}

	},

	onSearch: function(){

		var searchString =  this.getView().byId("searchField").getValue();
		if(this.getView().byId("searchField").getProperty("showRefreshButton")==true || searchString==""){
			//refresh data
			var sURL = "/ZE2E_CARGOSet?$expand=ZE2E_REQ_STATUS";
			if(	this.getView().byId("list")){
				this.getView().byId("list").unbindItems();	
			}

			this.getView().byId("list").bindItems({
				path:sURL,
				template: new sap.m.StandardListItem({
					title: "Request No: {ZZ_REINR}",
					info:"Type: {ZZ_TRV_KEY}",
					description:"Employee No: {ZZ_OWNER}",
				})
			});
		}else{
			var searchString =  this.getView().byId("searchField").getValue();
			if (searchString && searchString.length > 0) {
				var sURL0 = "/ZE2E_CARGOSet?$filter=ZZ_OWNER+eq+'{0}'&$expand=ZE2E_REQ_STATUS";
				sURL0 = sURL0.replace("{0}", searchString);
				if(	this.getView().byId("list")){
					this.getView().byId("list").unbindItems();	
				}
				this.getView().byId("list").bindItems({
					path:sURL0,
					template: new sap.m.StandardListItem({
						title: "Request No: {ZZ_REINR}",
						info:"Type: {ZZ_TRV_KEY}",
						description:"Employee No: {ZZ_OWNER}",
					})
				});

			}
		}


	},
	onCheckBoxSelect: function(){
		var DiscontinuedFlag = this.getView().getModel("new").getProperty("/Mode/DiscontinuedFlag");
		if(DiscontinuedFlag){
			this.getView().getModel("new").setProperty("/Mode/DiscontinuedFlag",false);
			this.getView().byId("idZZ_ADD_INT").setValue("");
		}else{
			this.getView().getModel("new").setProperty("/Mode/DiscontinuedFlag",true);
			this.getView().byId("idZZ_ADD_INT").setValue("");
		}

	},

	filterEligibilityTable: function(aTable, sCargoType){
		var sVendor;
		var aTempTable = [];
		if	(sCargoType == 'O' || sCargoType == 'R'){
			sVendor = 'DHL';
		} else {
			sVendor = 'AAL';
		}

		try{
			jQuery.each(aTable, function (i, record){		
				//If DHL
				if (sVendor == 'DHL'){
					if (record.ZZ_CAR_TYP == 'O' || record.ZZ_CAR_TYP == 'R' || record.ZZ_CAR_TYP == 'O1' || record.ZZ_CAR_TYP == 'R1'){
						aTempTable.push(aTable[i]);
					}
					//If AAL
				} else {
					if (record.ZZ_CAR_TYP == 'V' || record.ZZ_CAR_TYP == 'S' || record.ZZ_CAR_TYP == 'V1' || record.ZZ_CAR_TYP == 'S1'){
						aTempTable.push(aTable[i]);
					}
				}
			});   //end jQery.each			

			aTable = [];
			aTable = aTempTable;
			if (sVendor == 'AAL'){
				aTable.sort(function(a,b){
					if (a.ZZ_CAR_TYP > b.ZZ_CAR_TYP){
						return -1;
					}
					if (a.ZZ_CAR_TYP < b.ZZ_CAR_TYP){
						return 1;
					}
					return 0;
				});
			}
		}catch(error){}
		return aTable;
	},

	//check error field
	checkError: function(view){
		// Validate mandatory input must not be empty
		//onward
		var canContinue = true;
		if(sCargoType=="O" || sCargoType=="V"){
			var inputs = [
			              view.byId("idZZ_ADD_LOC"),
			              view.byId("idZZ_PIN"),
			              view.byId("idZZ_MOBILE"),
			              view.byId("idZZ_CONTACT_NO"),
//			              view.byId("idZZ_ADD_INS"),

			              ];
		}else if(sCargoType=="R" || sCargoType=="S") {
			var inputs = [

			              view.byId("idZZ_ADD_LOC"),
			              view.byId("idZZ_PIN"),
			              view.byId("idZZ_MOBILE"),
//			              view.byId("idZZ_OFF_NO"),
			              view.byId("idZZ_RES_NO"),
//			              view.byId("idZZ_ADD_INS"),
			              ];
		}

		jQuery.each(inputs, function (i, input){
			if (!input.getValue()){
				input.setValueState("Error");
				input.focus();

			}
			else {
				input.setValueState("None");
			}
		});
		//check date
		if( sap.ui.getCore().getModel("profile").getData().currentRole == "EMP" ){
			var date = this.getView().byId("idZZ_CAR_PLA").getValue();
			var currentDate = new Date();

			if (sap.ui.project.e2etm.util.StaticUtility.substractDate(date,currentDate) < 0){
				this.getView().byId("idZZ_CAR_PLA").setValueState("Error");
				this.getView().byId("idZZ_CAR_PLA").focus();
				canContinue = false;
			} 
			else {
				this.getView().byId("idZZ_CAR_PLA").setValueState("None");
			}
		}


//		var startDate = this.getView().getModel("new").getProperty("/Header/ZZ_DATV1");
//		if (sap.ui.project.e2etm.util.StaticUtility.substractDate(startDate,date) > 0){
//		this.getView().byId("idZZ_CAR_PLA").setValueState("Error");
//		canContinue = false;
//		} 
//		else {
//		this.getView().byId("idZZ_CAR_PLA").setValueState("None");
//		}

		// validate number
		//check PIN NUMBER
		var pinNo = [view.byId("idZZ_PIN")];
		jQuery.each(pinNo, function (i, input){
			if (!Number(input.getValue())){
				input.setValueState("Error");
				canContinue = false;
			} 
			else {
				input.setValueState("None");
			}
		});
		//check Mobile number
//		var mobileNo = [view.byId("idZZ_MOBILE")];
//		jQuery.each(mobileNo, function (i, input){
//		if (!Number(input.getValue())){
//		input.setValueState("Error");
//		canContinue = false;
//		} 
//		else {
//		input.setValueState("None");
//		}
//		});
		if(!sap.ui.project.e2etm.util.StaticUtility.checkPhoneNo(this.getView().byId("idZZ_MOBILE").getValue())){
			this.getView().byId("idZZ_MOBILE").setValueState("Error");
			this.getView().byId("idZZ_MOBILE").focus();
			canContinue = false;
		}else{
			this.getView().byId("idZZ_MOBILE").setValueState("None");
		}

		// Validate Number inputs
		if(sCargoType=="O" || sCargoType=="V"){
//			var numberInputs = [
//			view.byId("idZZ_CONTACT_NO"),
//			];
			var sZZ_CONTACT_NO = this.getView().byId("idZZ_CONTACT_NO").getValue();
			if(sZZ_CONTACT_NO != ""){
				if(!sap.ui.project.e2etm.util.StaticUtility.checkPhoneNo(sZZ_CONTACT_NO)){
					this.getView().byId("idZZ_CONTACT_NO").setValueState("Error");
					this.getView().byId("idZZ_CONTACT_NO").focus();
					canContinue = false;
				}else{
					this.getView().byId("idZZ_CONTACT_NO").setValueState("None");
				}
			}

		}else if(sCargoType=="R" || sCargoType=="S") {
//			var numberInputs = [
//			view.byId("idZZ_OFF_NO"),
//			view.byId("idZZ_RES_NO"),
//			];
			//idZZ_OFF_NO
			var sZZ_OFF_NO  = this.getView().byId("idZZ_OFF_NO").getValue();
			if(sZZ_OFF_NO != ""){
				if(!sap.ui.project.e2etm.util.StaticUtility.checkPhoneNo(sZZ_OFF_NO)){
					this.getView().byId("idZZ_OFF_NO").setValueState("Error");
					this.getView().byId("idZZ_OFF_NO").focus();
					canContinue = false;
				}else{
					this.getView().byId("idZZ_OFF_NO").setValueState("None");
				}
			}

			// idZZ_RES_NO
			var sZZ_RES_NO = this.getView().byId("idZZ_RES_NO").getValue();
			if(sZZ_RES_NO != ""){
				if(!sap.ui.project.e2etm.util.StaticUtility.checkPhoneNo(sZZ_RES_NO)){
					this.getView().byId("idZZ_RES_NO").setValueState("Error");
					this.getView().byId("idZZ_RES_NO").focus();
					canContinue = false;
				}else{
					this.getView().byId("idZZ_RES_NO").setValueState("None");
				}
			}

		}




//		jQuery.each(numberInputs, function (i, input){
//		if (!Number(input.getValue())){
//		input.setValueState("Error");
//		canContinue = false;
//		} 
//		else {
//		input.setValueState("None");
//		}
//		});


		// Check states of inputs

		jQuery.each(inputs, function (i, input){
			if ("Error" === input.getValueState()){
				canContinue = false;
				return false;
			}
		});
		return canContinue;
	} ,// end of check error

	//reset field
	resetField: function(view){
		var inputs = [
		              view.byId("idZZ_ADD_LOC"),
		              view.byId("idZZ_PIN"),
		              view.byId("idZZ_MOBILE"),
		              view.byId("idZZ_CONTACT_NO"),
		              view.byId("idZZ_ADD_INS"),
		              view.byId("idZZ_OFF_NO"),
		              view.byId("idZZ_RES_NO"),
		              ];
		jQuery.each(inputs, function (i, input){
			if(input!=null){
				input.setValueState("None");
			}
		});
	},


	IconTabSelect:function(evt){
		switch (evt.mParameters.key){
		case this.getView().sId +"--IconTabOnward":
			this.getListSearch('01',"","CARO","01");
		return;
		case this.getView().sId + "--IconTabReturn":
			this.getListSearch('01',"","CARR","01");
		return;
		case this.getView().sId+ "--IconTabClose":
			this.getListSearch('03',"","","01");
		return;
		}
	},


//	=========================================
//	get list Search
	//ZZ_REINR = role
	//ZZ_OWNER = ZZ_OWNER
	//ZZ_TRV_KEY= zz_modid
	//ZZ_VERSION = action
	//ZZ_STD_LOC: type of cargo (ZZ_CAR_TYP)
	getListSearch: function(sRole,ZZ_OWNER,sModid,sAction){
//		var sURL0 = "/ZE2E_REQ_LOGSet?$filter=ZZ_TRV_REQ+eq+'{0}'+and+ZZ_TRV_KEY+eq+'{1}'+and+ZZ_MODID+eq+'{2}'+and+ZZ_SMODID+eq+'{3}'";
//		var sURL0 = "/ZE2E_CARGOSet?$filter=ZZ_STD_LOC+eq+'{0}'+and+ZZ_OWNER+eq+'{1}'&expand=ZE2E_REQ_STATUS";
		var sURL0 = "/ZE2E_CARGOSet?$filter=ZZ_REINR+eq+'{0}'+and+ZZ_OWNER+eq+'{1}'+and+ZZ_TRV_KEY+eq+'{2}'+and+ZZ_VERSION+eq+'{3}'+&$expand=ZE2E_REQ_STATUS";
		sURL0 = sURL0.replace("{0}", sRole);
		sURL0 = sURL0.replace("{1}", ZZ_OWNER);
		sURL0 = sURL0.replace("{2}", sModid);
		sURL0 = sURL0.replace("{3}", sAction);
		if(	this.getView().byId("list")){
			this.getView().byId("list").unbindItems();		
			this.getView().byId("list").bindItems({
				path:sURL0,
				template: new sap.m.StandardListItem({
					title: "Req No: {ZZ_REINR}",
					info:"Plan date:  {path:'ZZ_CAR_PLA' , formatter: 'sap.ui.project.e2etm.util.Formatter.sapDate'}",
//					info:"Type: {path : 'ZZ_CAR_TYP', formatter: 'sap.ui.project.e2etm.util.Formatter.getTextCargoType'}",
					description:"Emp No: {ZZ_OWNER}",
					icon: "{path : 'ZZ_CAR_TYP', formatter: 'sap.ui.project.e2etm.util.Formatter.getTextCargoType'}",
				})
			});
		}

	},

	onSearchFieldOnward: function(){
		var searchString =  this.getView().byId("searchFieldOnward").getValue();
		this.getListSearch('01',searchString,"CARO","01");
	},

	onSearchFieldReturn: function(){
		var searchString =  this.getView().byId("searchFieldReturn").getValue();
		this.getListSearch('01',searchString,"CARR","01");
	},

	onSearchFieldClose: function(){
		var searchString =  this.getView().byId("searchFieldClose").getValue();
		this.getListSearch('03',searchString,"","01");
	},


	onFilterRadioSelect:function(oEvent){
		this.clearSearch();
		this.doFilter('');
	},

	clearSearch:function(){
		this.getView().byId("idSearchNewRequest").setProperty('value','');
	},

	doFilter:function(sEmpNo){
		var oFilterRadio = this.getView().byId("idFilterRadio");
		switch (oFilterRadio.getSelectedIndex()){
		case 0:
			this.getListSearch('01',sEmpNo,"CARO","01");
			this.setEnableButons(true);
			return;
		case 1:
			this.getListSearch('01',sEmpNo,"CARR","01");
			this.setEnableButons(true);
			return;
		case 2:
			this.getListSearch('03',sEmpNo,"","01");
			this.setEnableButons(false);
			return;	
		case 3:
			this.getListSearch('01',sEmpNo,"","09");
			this.setEnableButons(false);
			return;	
		}
	},

	onSearch:function(oEvent){
		this.doFilter(oEvent.getParameter("query"));
	},

//	end of Cargo admin
	onBack: function(){
//		case of create
		switch (globalData.action) {
		case "00": //Create
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

			break;
		case "01": //Change
			sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
			break;
		case "02": //Open
			sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
			break;
		case "09": //Open
			sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
			break;
		}
	},
	
	// on button Report pressed
	onReportCAROPress: function(){
//		var oModel = this.getView().getModel();
		// set caro type = onward
		CARGOTYPE ="CARO";
		var oGlobal = sap.ui.getCore().getModel("global").getData();
		oGlobal.CARGOTYPE = CARGOTYPE;
		sap.ui.getCore().getModel("global").setData(oGlobal);
		
//		oModel.setHeaders({CARGOTYPE:CARGOTYPE});
		sap.ui.core.routing.Router.getRouter("MyRouter").navTo("CargoReport");
	},
	onReportCARRPress: function(){
	
		// set caro type = return
		CARGOTYPE ="CARR";
		var oGlobal = sap.ui.getCore().getModel("global").getData();
		oGlobal.CARGOTYPE = CARGOTYPE;
		sap.ui.getCore().getModel("global").setData(oGlobal);
	
		sap.ui.core.routing.Router.getRouter("MyRouter").navTo("CargoReport");
	},
	setCargoPolicy:function(){
		var html = this.getView().byId("html1");
		var str = "<div style='font-family:Arial;font-size:16px'><h3>Cargo Policy</h3><p><i><u>Return Cargo</u></i></p>" +
				"<ul><li>Associates will not able to send personal baggage shipment throughout India, " +
				"however it can be sent to other city in Tamil Nadu / Karnataka. " +
				"But associates have to visit customs in the nearest port for clearance.</li>" +
				"<li>Shipments cannot be sent to North Location as personal baggage clearance " +
				"will not feasible in BOM / DEL port.</li>" +
				"<li>If shipment addressed to DHL Non Serviceable location (Tamil Nadu / Karnataka) " +
				"it will additional take 2-3 days for delivery by BlueDart post customs clearance " +
				"process or associates are requested for self-collection from Local BlueDart office " +
				"in case of Blue dart Non serviceable location</li></ul>" +
				"<p><i><u>Shipment addressed to Kerala - Clearance process</u></i></p>" +
				"<p>Personal baggage clearance possible in Cochin (Kerala) - If associates agree to pay " +
				"additional Rs. 5000 INR appx for clearance other than duty and taxes, we can transship " +
				"the shipment for clearance.</p>" +
				"<p>Additional formality to be done for delivery in Kerala</p>" +
				"<p>As per Kerala state government any personal baggage entering their state has to  " +
				"have Form 16A , this needs to be submitted to local Blue dart office " +
				"with your valid govt. authorized id proof for processing, this will take min 2-3 days</p>" +
				"<p><i><u>Onward journey:</u></i></p>" +
				"<p>Japan - Format will be issued in flight which should be filled and submitted " +
				"to JP customs for duty free clearance. </p>" +
				"<p>Austria - Customs duty will be there for baggage more than apx 1500 INR</p>" +
				"<p>UK - There is duty for personal baggage.</p>" +
				"<p>Turkey - Broker clearance no DHL clearance.</p>" +
				"<p>Spain - consignee should bear brokerage cost as clearance is done by BR, DHL doesn't " +
				"have license. 	</p>" +
				"<p>Vietnam - High value consignee should pay duty</p>" +
				"<p>Used goods are allowed to import to Vietnam provided the consignee name must be individual, " +
				"the consignee must have the arrival/departure card which is within 30 days from the date of " +
				"import into Vietnam. A copy of consignee's passport is required. The duty will be exempted " +
				"if the value of shipment is under 5.000.000 VND, approximately USD 300</p></div>";
	
		html.setContent(str);
	}
	
	
});