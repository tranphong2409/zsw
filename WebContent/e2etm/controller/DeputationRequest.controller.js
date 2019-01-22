jQuery.sap.require("sap.ui.project.e2etm.util.Formatter");
jQuery.sap.require("sap.ui.project.e2etm.util.StaticUtility");
jQuery.sap.require('sap.ui.project.e2etm.controls.customStage');
jQuery.sap.require('sap.ui.project.e2etm.controls.stageItem');
jQuery.sap.require("sap.m.MessageToast");
jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("sap.ca.ui.message.message");

sap.ui.controller("sap.ui.project.e2etm.controller.DeputationRequest", {
	
/*------------------------CONTROLLER EVENT AREA BEGIN------------------------*/
	// This event is called only one time
	onInit: function() {
		if (sap.ui.getCore().getModel("global") != null) {
			oDeputationThis = this;

			// Set the current stage of a deputation request
			oDeputationThis.currentStage = "1";
			oDeputationThis.currentSet = "1_1";
			oDeputationThis.currentSubSet = "1_1_1";
			oDeputationThis.currentSubSubSet = "1_1_1_1";

			oDeputationThis.currentVisa = {};
			oDeputationThis.currentDependentVisa = [];
			oDeputationThis.currentStDate = "";
			oDeputationThis.currentEDate = "";
			// Bind the whole table to model and bind detail to first row in a table
			var oModel = new sap.ui.model.json.JSONModel();
			var aData = {};
			view = oDeputationThis.getView();

			// Deferred object for processing order
			oDeputationThis.locFromEntered = $.Deferred(); // Check if location From is selected or not
			oDeputationThis.locToEntered = $.Deferred(); // Check if location to is selected or not
			oDeputationThis.afterRenderDeffered = $.Deferred(); // Check if afterRendered is done or not
			oDeputationThis.stageDeferred = $.Deferred(); // Check if populateStages is done or not
			oDeputationThis.readDepDeferred = $.Deferred(); // Check if readRequest is done or not
			oDeputationThis.resetFormDeffered = $.Deferred(); // Check if resetForm is done or not
			oDeputationThis.initDeffered = $.Deferred(); // Check if init is done or not
			oDeputationThis.travelDeffered = $.Deferred(); // Check if Travel Plan controller is initiated or not
			oDeputationThis.managerDocsUploadOnApprove = $.Deferred();

			oModel.setData(aData);
			view.setModel(oModel);
			view.bindElement("/screenData");
			oDeputationThis.initDeffered.resolve();

			sap.ui.core.routing.Router.getRouter("MyRouter").attachRoutePatternMatched(oDeputationThis.onRouteMatched, oDeputationThis);
		} else {
			window.location = "/E2ETM_PHASE2/";
		}
	},
	// This event is called only one time
	onAfterRendering: function(evt) {
		try {
			oDeputationThis.afterRenderDeffered.resolve();
		} catch(exc) {}
	},
	// This event is called everytime the URL route is matched
	onRouteMatched : function(oEvent) {
		try {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(true,oHomeThis);
			var routeName = null;
			if (oEvent.mParameters != null) {
				routeName = oEvent.getParameter("name");
			}
			if (routeName == "deputation") {
				// reset the global data if sub navigation is happening

				oDeputationThis.curStagePos = 0;
				oDeputationThis.iconTab = null;

				oDeputationThis.locFromEntered = $.Deferred(); // Check if location From is selected or not
				oDeputationThis.locToEntered = $.Deferred(); // Check if location to is selected or not
				oDeputationThis.travelDeffered = $.Deferred(); // Check if Travel Plan controller is initiated or not
				oDeputationThis.stageDeferred = $.Deferred(); // Check if populateStages is done or not
				oDeputationThis.readDepDeferred = $.Deferred(); // Check if readRequest is done or not
				oDeputationThis.resetFormDeffered = $.Deferred(); // Check if resetForm is done or not

				oDeputationThis.currentDependentVisa = [];

				// invisible all buttons
				oDeputationThis.invisibleAllButtons();

				// invisible all buttons at the top row of deputation screen
				view.byId("lblRequestNumber").setVisible(false);
				//start of changes_dye5kor_phase-3,second set of release
				view.byId("lblTrvlRequestType").setVisible(false);
				view.byId("lblTrvlRequestNumber").setVisible(false);
				//End of change_dye5kor_phase-3,second set of release
				
				view.byId("lnkViewOwnerProfile").setVisible(false);
				view.byId("lnkDeputationContacts").setVisible(false);
				view.byId("lnkViewAllDates").setVisible(false);
				view.byId("lnkViewPrimaryRequest").setVisible(false);
				view.byId("lblRequestType").setVisible(false);
				view.byId("lnkHelpDeputation").setVisible(false);
				view.byId("lnkViewTravelPDF").setVisible(false);

				// Clear current stages and tabs
				view.byId('flexBoxProcess').setVisible(false);
				view.byId('carouselProcessFlow').destroyContent();

				// destroy the icon tab control
				view.byId("pageDeputation").getContent()[2].destroy();
				oDeputationThis.iconTab = new sap.m.IconTabBar({
					expandable: false
				}).addStyleClass("deputation_itb_request margin_top_0");
				oDeputationThis.iconTab.setVisible(false);
				view.byId("pageDeputation").addContent(oDeputationThis.iconTab);
/* Start-CGGS Changes */
				var globalData = sap.ui.getCore().getModel("global").getData();	            				
				if(globalData.ZZ_DEP_REQ){
				this.getView().setModel(new sap.ui.model.json.JSONModel(globalData.cggsdata),"cggsmodel");
				if((!globalData.cggsdata))
					{
					sap.ui.project.e2etm.util.StaticUtility.getCggsData(globalData.ZZ_DEP_PERNR, globalData.ZZ_DEP_REQ, globalData.ZZ_VERSION,oDeputationThis);
					}
				}
	           // sap.ui.getCore().byId("depuCggs--cggsFlxBox").setVisible(cggsFlag);
/* End-CGGS Changes */ 				
			} else {
				var oData = sap.ui.getCore().getModel("global").getData();
				oData.currentStage = "1";
				oData.currentSet = "1_1";
				oData.currentSubSet = "1_1_1";
				// reset the global field isChange
				oData.isChange = false;
				sap.ui.getCore().getModel("global").setData(oData);
			}
			var argDepID = oEvent.getParameter("arguments").depId;
			$.when(oDeputationThis.afterRenderDeffered).then(function() {
				if (routeName == "deputation") {
					setTimeout(function() {
						// Getting deputation ID from URL
						if (argDepID != null && argDepID != "") {
							sDeputationNo = Base64.decode(argDepID);
						} else {
							sDeputationNo = '';
						}

						oDeputationThis.reLoadAllData();
					}, 500);
				}
			});
		} catch(exc) {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
			sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
		}
	},
/*------------------------CONTROLLER EVENT AREA END------------------------*/

	
/*------------------------CUSTOM FUNCTION AREA BEGIN------------------------*/
	// This method is used to load the details page
	reLoadAllData : function() {
		try {
			sap.ui.getCore().byId("UploadVisaSelf").destroy();
			sap.ui.getCore().byId("UploadVisaDependent").destroy();
		} catch(exc) {}

		// Reset the form (including all available forms)
		$.when(oDeputationThis.initDeffered).then(function() {
			// Setting initial value to the model
			oDeputationThis.resetForm();
		});

		// Reading deputation 
		$.when(oDeputationThis.resetFormDeffered).then(function() {
			// Read deputation if any
			oDeputationThis.readRequest();
			oDeputationThis.resetFormDeffered = $.Deferred();
		});

		// Display stages
		$.when(oDeputationThis.readDepDeferred).then(function() {
			// Populate dynamicStages and set current stage / set / subset 
			// to global model
			oDeputationThis.populateDynamicStages(true);
			oDeputationThis.readDepDeferred = $.Deferred();
		});

		// Visible appropriate elements in the page which are dynamically set based on stages
		$.when(oDeputationThis.stageDeferred).then(function() {
			// Display default screen for user if the request is submitted by employee 
			//  or is sent back from manager and deputation
			oDeputationThis.displayDefaultScreen();
		});
	},

	// This method is used to set initial value to the details screen data (view.getModel().getData()).
	// Initial value can be taken from the CREATE NEW REQUEST DIALOG or from the selected request 
	// in the Dash-Board. All those initial values are mainly stored in the global model data 
	// and then are re-assigned to the details screen data (view.getModel().getData())
	resetForm: function() {
		try {
			var globalData = sap.ui.getCore().getModel("global").getData();
			var aData = view.getModel().getData();

			// Deputation data
			aData.screenData = {};

			aData.screenData.ZZ_DEP_REQ = sDeputationNo;
			// Set default value for other radios button and information
			aData.screenData.ZZ_STAT_FLAG = "";
			aData.screenData.ZZ_CONFIRM_FLAG = false;
			aData.screenData.ZZ_CONFIRM_FLAG_ERROR = "None";
			aData.screenData.ZZ_RSN_TRV = "";
			aData.screenData.ZZ_CUST_NAME = "";
			aData.screenData.ZZ_COMMENTS = "";
			aData.screenData.ZZ_NEW_COMMENTS = "";
			aData.screenData.ZZ_DEP_EMAIL = "";
			aData.screenData.ZZ_VERSION = "";
			aData.screenData.ZZ_VREASON = "";
			aData.screenData.ZZ_INS_EX = "";
			aData.screenData.ZZ_COC_EX = "";
			aData.screenData.ZZ_VISA_EX = "";
			aData.screenData.ZZ_TCKT_EX = "";
			aData.screenData.ZZ_ASG_TYP = "";
			aData.screenData.ZZ_REQ_TYP = "";
			aData.screenData.ZZ_TRV_REQ = "";
			aData.screenData.editable = true;
			aData.screenData.confirmation = false;
			aData.screenData.ZZ_DEP_SUB_TYPE = "";
			aData.screenData.ZZ_DEP_TYPE_TXT = "";
			aData.screenData.ZZ_TIMESTAMP = "";
			
			// Prepare visa data initialization
			aData.selfVisa = {
					"ZZ_CURR_VISA_TYP"  : "BUSR",
					"ZZ_VISA_TOCNTRY"   : aData.screenData.ZZ_DEP_TOCNTRY,
					"ZZ_VISA_FCNTRY"  : aData.screenData.ZZ_DEP_FRCNTRY,
					"ZZ_MULT_ENTRY"   : "",
					"ZZ_MULT_ENTRY_CHAR": false,
					"ZZ_VISA_EDATE"   : "",
					"ZZ_VISA_SDATE"   : "",
					"ZZ_VISA_NO"    : "",
					"ZZ_OFFC_ADDRESS"   : "",
					"ZZ_DEP_REQ"    : aData.screenData.ZZ_DEP_REQ,
					"ZZ_VISA_PLAN"    : aData.screenData.ZZ_VISA_PLAN,
			};
			aData.visaExistingDependent = [];
/*Start-CGGS Changes*/
			aData.screenData.ZZ_PARENTNAME = "";
			aData.screenData.ZZ_SPOUSENAME = "";
	        aData.screenData.ZZ_DESIGNATION = "";
/*End-CGGS Changes*/	        
			// If new deputation request is created, fetch value from popup screen
			if (aData.screenData.ZZ_DEP_REQ == "") {
				// Value getting from popup screen
				if (globalData.screenData != null) {
					// From country
					aData.screenData.ZZ_DEP_FRCNTRY = globalData.screenData.ZZ_DEP_FRCNTRY;
					aData.screenData.ZZ_DEP_FRCNTRY_TXT = globalData.screenData.ZZ_DEP_FRCNTRY_TXT;
					// To country
					aData.screenData.ZZ_DEP_TOCNTRY = globalData.screenData.ZZ_DEP_TOCNTRY;
					aData.screenData.ZZ_DEP_TOCNTRY_TXT = globalData.screenData.ZZ_DEP_TOCNTRY_TXT;
					// From location
					aData.screenData.ZZ_DEP_FRMLOC = globalData.screenData.ZZ_DEP_FRMLOC;
					aData.screenData.ZZ_DEP_FRMLOC_TXT = globalData.screenData.ZZ_DEP_FRMLOC_TXT;
					// To location
					aData.screenData.ZZ_DEP_TOLOC = globalData.screenData.ZZ_DEP_TOLOC;
					aData.screenData.ZZ_DEP_TOLOC_TXT = globalData.screenData.ZZ_DEP_TOLOC_TXT;
					// Deputation Type (DOME,INTL)
					aData.screenData.ZZ_DEP_TYPE = globalData.screenData.ZZ_DEP_TYPE;
					// Deputation start date / end date
					aData.screenData.ZZ_DEP_STDATE = globalData.screenData.ZZ_DEP_STDATE;
					aData.screenData.ZZ_DEP_ENDATE = globalData.screenData.ZZ_DEP_ENDATE;
					// Travel category (WRKP,BUSR,TRNG..)
					aData.screenData.ZZ_TRV_CAT = globalData.screenData.ZZ_TRV_CAT;

					// Request type
					aData.screenData.ZZ_REQ_TYP = globalData.screenData.ZZ_REQ_TYP;

					// Setting up screen data with date value
					aData.screenData.ZZ_DEP_STDATE_VALUE = new Date(aData.screenData.ZZ_DEP_STDATE.substr(0, 4), 
							aData.screenData.ZZ_DEP_STDATE.substr(4, 2) - 1, 
							aData.screenData.ZZ_DEP_STDATE.substr(6, 2));
					aData.screenData.ZZ_DEP_ENDATE_VALUE = new Date(aData.screenData.ZZ_DEP_ENDATE.substr(0, 4), 
							aData.screenData.ZZ_DEP_ENDATE.substr(4, 2) - 1, 
							aData.screenData.ZZ_DEP_ENDATE.substr(6, 2));
					aData.screenData.ZZ_DEP_DAYS = globalData.screenData.ZZ_DEP_DAYS;

					aData.screenData.ZZ_VISA_DESC = globalData.screenData.ZZ_VISA_DESC;
					aData.screenData.ZZ_MIN = globalData.screenData.ZZ_MIN;
					aData.screenData.ZZ_MAX = globalData.screenData.ZZ_MAX;

					aData.screenData.ZZ_MIN_WAGE = globalData.screenData.ZZ_MIN_WAGE;
					aData.screenData.ZZ_DEP_TEDATE = globalData.screenData.ZZ_DEP_TEDATE;
					try {
						aData.screenData.ZZ_DEP_TEDATE_VALUE = new Date(aData.screenData.ZZ_DEP_TEDATE.substr(0, 4), 
								aData.screenData.ZZ_DEP_TEDATE.substr(4, 2) - 1, 
								aData.screenData.ZZ_DEP_TEDATE.substr(6, 2));
					} catch(exc) {}
					
					
					var employeeDetail = sap.ui.getCore().getModel("profile").getData().employeeDetail;
					aData.screenData.ZZ_DEP_DOJ = employeeDetail.ZZ_DEP_DOJ;
					aData.screenData.ZZ_DEP_DOB = employeeDetail.ZZ_DEP_DOB;
					aData.screenData.ZZ_DEP_LEVEL = employeeDetail.ZZ_DEP_LEVEL;
					aData.screenData.ZZ_SUR_NAME = sap.ui.getCore().getModel("profile").getData().passportDetail.ZZ_EMP_FNAME;
					aData.screenData.ZZ_GIVEN_NAME = sap.ui.getCore().getModel("profile").getData().passportDetail.ZZ_EMP_LNAME;

					// Setting up screen data if request type is international
					if (aData.screenData.ZZ_DEP_TYPE == "INTL") {
						// Prepare family data initialization
						aData.screenData.ZZ_SP_CMPNY = globalData.screenData.ZZ_SP_CMPNY;
						aData.screenData.ZZ_FAMILY_ACCOMP = false;
						aData.screenData.ZZ_FMY_JSTAT = false;
						aData.screenData.ZZ_VISA_AEXIST = false;
						aData.screenData.ZZ_VISA_PB = false;
						aData.screenData.ZZ_VISA_PLAN = "";

						// Prepare COC data initialization
						aData.screenData.ZZ_COC_STDATE = "00000000";
						aData.screenData.ZZ_COC_EDATE = "00000000";
						aData.screenData.ZZ_COC_NO = "";
						aData.screenData.ZZ_VERSION = "1";
					
					//Start of changes_dye5kor_phase-3,second set of release
						
						/*if(aData.screenData.ZZ_TRV_REQ != "" && aData.screenData.ZZ_TRV_REQ != " "  ){
						 
							view.byId("lblTrvlRequestType").setVisible(true);
							view.byId("lblTrvlRequestNumber").setVisible(true);
							view.byId("lblTrvlRequestType").setText("Travel request No");	
							view.byId("lblTrvlRequestNumber").setText(aData.screenData.ZZ_TRV_REQ);
						}*/
						
					//end of changes_dye5kor_phase-3,second set of release
					}
					// After assigning the value from the popup, delete that node from the global data
				} else {    // Navigated from existing request in home page 
					// This block can only happen if a INFO/SECO/EMER/HOME is about to be created
					if (globalData != null) {
						aData.screenData.ZZ_STAT_FLAG = globalData.ZZ_STAT_FLAG;
						aData.screenData.ZZ_TRV_CAT = globalData.ZZ_TRV_CAT;
						aData.screenData.ZZ_REQ_TYP = globalData.ZZ_REQ_TYP;
						aData.screenData.ZZ_DEP_TYPE = globalData.ZZ_DEP_TYPE;
						aData.screenData.ZZ_DEP_SUB_TYPE = globalData.ZZ_DEP_SUB_TYPE;
						aData.screenData.ZZ_DEP_PERNR = globalData.ZZ_DEP_PERNR;
						aData.screenData.ZZ_DEP_TOCNTRY = globalData.ZZ_DEP_TOCNTRY;
						aData.screenData.ZZ_DEP_TOLOC_TXT = globalData.ZZ_DEP_TOLOC_TXT;
						aData.screenData.ZZ_TRV_REQ = globalData.ZZ_TRV_REQ;
						aData.screenData.ZZ_FSTL = globalData.ZZ_FSTL;
						aData.screenData.ZZ_GEBER = globalData.ZZ_GEBER;
						aData.screenData.ZZ_VREASON = globalData.ZZ_VREASON;
						aData.screenData.ZZ_COMMENTS = globalData.ZZ_COMMENTS;
						aData.screenData.ZZ_VERSION = globalData.ZZ_VERSION;
					}
				}
			} else {
				// This block can only happen if viewing the INFO/SECO/HOME/EMER request
				if (globalData != null) {
					aData.screenData.ZZ_STAT_FLAG = globalData.ZZ_STAT_FLAG;
					aData.screenData.ZZ_TRV_CAT = globalData.ZZ_TRV_CAT;
					aData.screenData.ZZ_REQ_TYP = globalData.ZZ_REQ_TYP;
					aData.screenData.ZZ_DEP_TYPE = globalData.ZZ_DEP_TYPE;
					aData.screenData.ZZ_DEP_SUB_TYPE = globalData.ZZ_DEP_SUB_TYPE;
					aData.screenData.ZZ_DEP_PERNR = globalData.ZZ_DEP_PERNR;
					aData.screenData.ZZ_DEP_TOCNTRY = globalData.ZZ_DEP_TOCNTRY;
					aData.screenData.ZZ_DEP_TOLOC_TXT = globalData.ZZ_DEP_TOLOC_TXT;
					aData.screenData.ZZ_TRV_REQ = globalData.ZZ_TRV_REQ;
					aData.screenData.ZZ_FSTL = globalData.ZZ_FSTL;
					aData.screenData.ZZ_GEBER = globalData.ZZ_GEBER;
					aData.screenData.ZZ_VREASON = globalData.ZZ_VREASON;
					aData.screenData.ZZ_COMMENTS = globalData.ZZ_COMMENTS;
					aData.screenData.ZZ_TIMESTAMP = globalData.ZZ_TIMESTAMP;
					aData.screenData.ZZ_VERSION = globalData.ZZ_VERSION;
					/* Start-CGGS Changes */					
					aData.screenData.ZZ_PARENTNAME = globalData.ZZ_PARENTNAME;
					aData.screenData.ZZ_SPOUSENAME = globalData.ZZ_SPOUSENAME;
					aData.screenData.ZZ_DESIGNATION = globalData.ZZ_DESIGNATION;
					/* End-CGGS Changes */
				}
			}
			

			// Setting up entered screen data for comparing
			eForm = jQuery.extend({}, aData.screenData);

			view.getModel().setData(aData);

			// This means afer calling resetForm method, the object is resolve
			oDeputationThis.resetFormDeffered.resolve();
		} catch(exc) {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
			sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
		}
	},

	// start of changes_dye5kor_phase-3,Second set release
	
	
	
	// End of change_dye5kor_phase-3,second set release
	
	
	
	// This method is used to determine editable fields on the details page
	setEditableFields : function() {
		var aData = view.getModel().getData();
		var globalData = sap.ui.getCore().getModel("global").getData();
		var profileData = sap.ui.getCore().getModel("profile").getData();
		if (sDeputationNo != '') {
			// Set Editable
			if (sap.ui.getCore().getModel("profile").getData().currentRole == "EMP") {
				var prefix = aData.screenData.ZZ_STAT_FLAG.substring(0, 2);
				var action = aData.screenData.ZZ_STAT_FLAG.substring(2, 5);

				// checking if process is change process or not
				if (!globalData.isChange) {

					// Checking if editable mode is on or not
					if ((aData.screenData.ZZ_STAT_FLAG == "AA000" && oDeputationThis.currentStage == "1") || 
							(prefix != "AA" && action == "003" && oDeputationThis.currentStage == "1")) {
						if ( aData.screenData.ZZ_NEXT_APPROVER == profileData.employeeDetail.ZZ_DEP_PERNR) {
							aData.screenData.editable = true;
						
						} else {
							aData.screenData.editable = false;
						}
					} else {
						aData.screenData.editable = false;
					}

					aData.screenData.isChange = aData.screenData.editable;
					// Set other flags to current editable version if process is not change process
					aData.screenData.startDateChange = aData.screenData.editable;
					if (aData.screenData.ZZ_TRV_CAT == "TRFR" && aData.screenData.ZZ_DEP_TYPE == "DOME") {
						aData.screenData.endDateisChange = false;
					} else {
						aData.screenData.endDateisChange = aData.screenData.editable;
					}
					//fix enabled family
					aData.screenData.isSTAandDE = aData.screenData.editable;
					//fix enabled family
					
					//changes to familly  24/08/2016
					//change for depu request and >730
						if(aData.screenData.ZZ_DEP_TOCNTRY == "DE"){
							aData.screenData.isSTAandDE = false;
						}				

				//changes to familly  24/08/2016
				
					aData.screenData.isDependentChangeBeforeDeputation = aData.screenData.editable; // used in radios button
					// this group is used in dependent box
					aData.screenData.changeDeputationReturnDate = aData.screenData.editable; // return date
					aData.screenData.changeDeputationStartDate = aData.screenData.editable; // start date
					aData.screenData.changeDeputationDepeCheck = aData.screenData.editable; // dependent checkbox
					aData.screenData.changeDeputationDepeType = aData.screenData.editable; // dependent type
					aData.screenData.changeDeputationDepeVisaExist = aData.screenData.editable; // dependent visa exist checkbox

					aData.screenData.changeDeputationSelDepeCheck = aData.screenData.editable; // selected dependent checkbox
					aData.screenData.changeDeputationSelDepeType = aData.screenData.editable; // selected dependent type
					aData.screenData.changeDeputationSelDepeVisaExist = aData.screenData.editable; // selected dependent Visa checkbox
					aData.screenData.changeDeputationSelStartDate = aData.screenData.editable; // selected dependent start date
					aData.screenData.changeDeputationSelReturnDate = aData.screenData.editable; // selected dependent return date
					
					aData = oDeputationThis.setDateChangeEditableFields(globalData,aData);
				} else {
					aData.screenData.editable = false;
					aData.screenData.isChange = true;
					// Considering change type here
					if (globalData.changeType == "DA") {
						aData.screenData.startDateChange = true;
						
						if (aData.screenData.ZZ_TRV_CAT == "TRFR" && aData.screenData.ZZ_DEP_TYPE == "DOME") {
							aData.screenData.endDateisChange = false;
						} else {
							aData.screenData.endDateisChange = true;
						}
						
						//fix enabled family
						aData.screenData.isSTAandDE = false;
						//fix enabled family
						aData.screenData.isDependentChangeBeforeDeputation = false;  // used in radios button

						aData.screenData.changeDeputationReturnDate = false; // return date
						aData.screenData.changeDeputationStartDate = false; // start date
//						aData.screenData.changeDeputationReturnDate = true; // return date // added by VAB6KOR on 09.04.2018
//						aData.screenData.changeDeputationStartDate = true; // start date   // added by VAB6KOR on 09.04.2018
						aData.screenData.changeDeputationDepeCheck = false; // dependent checkbox
						aData.screenData.changeDeputationDepeType = false; // dependent type
						aData.screenData.changeDeputationDepeVisaExist = false; // dependent visa exist checkbox

						aData.screenData.changeDeputationSelDepeCheck = false; // selected dependent checkbox
						aData.screenData.changeDeputationSelDepeType = false; // selected dependent type
						aData.screenData.changeDeputationSelDepeVisaExist = false; // selected dependent Visa checkbox
						aData.screenData.changeDeputationSelStartDate = true; // selected dependent start date
						aData.screenData.changeDeputationSelReturnDate = true; // selected dependent return date
					} else if (globalData.changeType == "DB") {
						aData.screenData.startDateChange = false;
						
						if (aData.screenData.ZZ_TRV_CAT == "TRFR" && aData.screenData.ZZ_DEP_TYPE == "DOME") {
							aData.screenData.endDateisChange = false;
						} else {
							aData.screenData.endDateisChange = true;
						}
						//fix enabled family
						aData.screenData.isSTAandDE = false;
						//fix enabled family
						aData.screenData.isDependentChangeBeforeDeputation = false;  // used in radios button

					//	aData.screenData.changeDeputationReturnDate = false; // return date
						aData.screenData.changeDeputationReturnDate = true; // return date // added by VAB6KOR on 09.04.2018
						aData.screenData.changeDeputationStartDate = false; // start date
						aData.screenData.changeDeputationDepeCheck = false; // dependent checkbox
						aData.screenData.changeDeputationDepeType = false; // dependent type
						aData.screenData.changeDeputationDepeVisaExist = false; // dependent visa exist checkbox

						aData.screenData.changeDeputationSelDepeCheck = false; // selected dependent checkbox
						aData.screenData.changeDeputationSelDepeType = false; // selected dependent type
						aData.screenData.changeDeputationSelDepeVisaExist = false; // selected dependent Visa checkbox
						aData.screenData.changeDeputationSelStartDate = false; // selected dependent start date
						aData.screenData.changeDeputationSelReturnDate = false; // selected dependent return date
					} else if (globalData.changeType == "DE") {
						aData.screenData.startDateChange = false;
						aData.screenData.endDateisChange = false;
//						if (aData.screenData.ZZ_TRV_CAT == "TRFR" && aData.screenData.ZZ_DEP_TYPE == "DOME") {
//							aData.screenData.endDateisChange = false;
//						} else {
//							aData.screenData.endDateisChange = true;
//						}
						//fix enabled family
						aData.screenData.isSTAandDE = false;
						//fix enabled family
						aData.screenData.isDependentChangeBeforeDeputation = true;  // used in radios button

						aData.screenData.changeDeputationReturnDate = true; // return date
						aData.screenData.changeDeputationStartDate = true; // start date
						aData.screenData.changeDeputationDepeCheck = true; // dependent checkbox
						aData.screenData.changeDeputationDepeType = true; // dependent type
						aData.screenData.changeDeputationDepeVisaExist = true; // dependent visa exist checkbox

						aData.screenData.changeDeputationSelDepeCheck = true; // selected dependent checkbox
						aData.screenData.changeDeputationSelDepeType = true; // selected dependent type
						aData.screenData.changeDeputationSelDepeVisaExist = true; // selected dependent Visa checkbox
						aData.screenData.changeDeputationSelStartDate = true; // selected dependent start date
						aData.screenData.changeDeputationSelReturnDate = true; // selected dependent return date
					} else if (globalData.changeType == "DF") {
						aData.screenData.startDateChange = false;
						aData.screenData.endDateisChange = false;
						
						//fix enabled family
						aData.screenData.isSTAandDE = false;
						//fix enabled family
						aData.screenData.isDependentChangeBeforeDeputation = true;  // used in radios button

						aData.screenData.changeDeputationReturnDate = true; // return date
						aData.screenData.changeDeputationStartDate = true; // start date
						aData.screenData.changeDeputationDepeCheck = true; // dependent checkbox
						aData.screenData.changeDeputationDepeType = true; // dependent type
						aData.screenData.changeDeputationDepeVisaExist = true; // dependent visa exist checkbox

						aData.screenData.changeDeputationSelDepeCheck = false; // selected dependent checkbox
						aData.screenData.changeDeputationSelDepeType = false; // selected dependent type
						aData.screenData.changeDeputationSelDepeVisaExist = false; // selected dependent Visa checkbox
						aData.screenData.changeDeputationSelStartDate = false; // selected dependent start date
						aData.screenData.changeDeputationSelReturnDate = false; // selected dependent return date
					} else if (globalData.changeType == "DG") {
						aData.screenData.startDateChange = false;
						aData.screenData.endDateisChange = false;
						
						//fix enabled family
						aData.screenData.isSTAandDE = false;
						//fix enabled family
						aData.screenData.isDependentChangeBeforeDeputation = true;  // used in radios button

						aData.screenData.changeDeputationReturnDate = true; // return date
						aData.screenData.changeDeputationStartDate = true; // start date
						aData.screenData.changeDeputationDepeCheck = true; // dependent checkbox
						aData.screenData.changeDeputationDepeType = true; // dependent type
						aData.screenData.changeDeputationDepeVisaExist = true; // dependent visa exist checkbox

						aData.screenData.changeDeputationSelDepeCheck = false; // selected dependent checkbox
						aData.screenData.changeDeputationSelDepeType = false; // selected dependent type
						aData.screenData.changeDeputationSelDepeVisaExist = false; // selected dependent Visa checkbox
						aData.screenData.changeDeputationSelStartDate = false; // selected dependent start date
						aData.screenData.changeDeputationSelReturnDate = false; // selected dependent return date
					} else if (globalData.changeType == "DH") {
						aData.screenData.startDateChange = false;
						aData.screenData.endDateisChange = false;

						//fix enabled family
						aData.screenData.isSTAandDE = false;
						//fix enabled family
						aData.screenData.isDependentChangeBeforeDeputation = false;  // used in radios button

						aData.screenData.changeDeputationReturnDate = false; // return date
						aData.screenData.changeDeputationStartDate = false; // start date
						aData.screenData.changeDeputationDepeCheck = false; // dependent checkbox
						aData.screenData.changeDeputationDepeType = false; // dependent type
						aData.screenData.changeDeputationDepeVisaExist = false; // dependent visa exist checkbox

						aData.screenData.changeDeputationSelDepeCheck = false; // selected dependent checkbox
						aData.screenData.changeDeputationSelDepeType = false; // selected dependent type
						aData.screenData.changeDeputationSelDepeVisaExist = false; // selected dependent Visa checkbox
						aData.screenData.changeDeputationSelStartDate = false; // selected dependent start date
						aData.screenData.changeDeputationSelReturnDate = true; // selected dependent return date
					} else {
						aData.screenData.startDateChange = false;
						aData.screenData.endDateisChange = false;

						//fix enabled family
						aData.screenData.isSTAandDE = false;
						//fix enabled family
						aData.screenData.isDependentChangeBeforeDeputation = false;  // used in radios button

						aData.screenData.changeDeputationReturnDate = false; // return date
						aData.screenData.changeDeputationStartDate = false; // start date
						aData.screenData.changeDeputationDepeCheck = false; // dependent checkbox
						aData.screenData.changeDeputationDepeType = false; // dependent type
						aData.screenData.changeDeputationDepeVisaExist = false; // dependent visa exist checkbox

						aData.screenData.changeDeputationSelDepeCheck = false; // selected dependent checkbox
						aData.screenData.changeDeputationSelDepeType = false; // selected dependent type
						aData.screenData.changeDeputationSelDepeVisaExist = false; // selected dependent Visa checkbox
						aData.screenData.changeDeputationSelStartDate = false; // selected dependent start date
						aData.screenData.changeDeputationSelReturnDate = false; // selected dependent return date
					}
				}
			} else {
				aData.screenData.editable = false;
				aData.screenData.isChange = false;
				aData.screenData.startDateChange = false;
				aData.screenData.endDateisChange = false;

				//fix enabled family
				aData.screenData.isSTAandDE = false;
				//fix enabled family
				aData.screenData.isDependentChangeBeforeDeputation = false;  // used in radios button

				aData.screenData.changeDeputationReturnDate = false; // return date
				aData.screenData.changeDeputationStartDate = false; // start date
				aData.screenData.changeDeputationDepeCheck = false; // dependent checkbox
				aData.screenData.changeDeputationDepeType = false; // dependent type
				aData.screenData.changeDeputationDepeVisaExist = false; // dependent visa exist checkbox

				aData.screenData.changeDeputationSelDepeCheck = false; // selected dependent checkbox
				aData.screenData.changeDeputationSelDepeType = false; // selected dependent type
				aData.screenData.changeDeputationSelDepeVisaExist = false; // selected dependent Visa checkbox
				aData.screenData.changeDeputationSelStartDate = false; // selected dependent start date
				aData.screenData.changeDeputationSelReturnDate = false; // selected dependent return date
			}
			view.getModel().setData(aData);
		
		} else {
			if (aData.screenData.ZZ_TRV_CAT == "TRFR" && aData.screenData.ZZ_DEP_TYPE == "DOME") {
				aData.screenData.endDateisChange = false;
			}
			else if( Number(aData.screenData.ZZ_DEP_DAYS) <= 183 && aData.screenData.ZZ_DEP_TOCNTRY == "DE" ){ 
				//fix enabled family
				aData.screenData.isSTAandDE = false;
				//fix enabled family
			}
			else {
				aData.screenData.endDateisChange = true;
			}

		}
	},

	// Get the duration based on start date and end date
	showDuration : function() {
		var aData = view.getModel().getData();
		if( aData.screenData.ZZ_DEP_STDATE != null && aData.screenData.ZZ_DEP_ENDATE != null ){
			var dStart = new Date(aData.screenData.ZZ_DEP_STDATE.substr(0,4), aData.screenData.ZZ_DEP_STDATE.substr(4,2)-1, aData.screenData.ZZ_DEP_STDATE.substr(6,2));
			var dEnd = new Date(aData.screenData.ZZ_DEP_ENDATE.substr(0,4), aData.screenData.ZZ_DEP_ENDATE.substr(4,2)-1, aData.screenData.ZZ_DEP_ENDATE.substr(6,2));
			var dDur = new Date(dEnd - dStart);
			aData.screenData.ZZ_DEP_DAYS = "" + ( dDur.getTime() / ( 1000*3600*24 ) + 1 );
			aData.screenData.ZZ_DEP_DAYS = "" + Math.round(aData.screenData.ZZ_DEP_DAYS);
			// Setting additional information to screen data (sponsor by company)
			if (aData.screenData.ZZ_DEP_TYPE == "INTL") {
				if (parseInt(aData.screenData.ZZ_DEP_DAYS) > sap.ui.getCore().getModel("global").getData().sponsorPeriod) {
					aData.screenData.ZZ_SP_CMPNY = true;
				} else {
					aData.screenData.ZZ_SP_CMPNY = false;
				}
			}
			view.getModel().setData(aData);
			try {
				oDeputationThis.displayFamilyPanel();
			} catch(exc) {}
			return aData.screenData.ZZ_DEP_DAYS;
		}
	},
	
	// This method is used to display PANEL DOCUMENT
	// (Migration link to DOCUMENTS inside this panel is handled in this method)
	displayUpload : function() {
		if (oDeputationThis.getView().getModel().getData().screenData.ZZ_DEP_TYPE == "INTL" &&
				sap.ui.getCore().getModel("global").getData().currentStage == "1" && 
				sap.ui.getCore().getModel("global").getData().currentSubSet == "1_2_1" &&
				(view.getModel().getData().screenData.ZZ_STAT_FLAG == "JJ006" ||
						view.getModel().getData().screenData.ZZ_STAT_FLAG == "HH001")) {
			sap.ui.getCore().byId("panelDocument").setVisible(false);
		} else {
			try {
				sap.ui.getCore().byId("panelDocument").setVisible(true);

				if (sap.ui.getCore().getModel("profile").getData().currentRole == "DEPU" &&
						oDeputationThis.getView().getModel().getData().screenData.ZZ_REQ_TYP == "DEPU") {
					// Logic to determine migration request
					var get = $.ajax({
						cache: false,
						url: sServiceUrl + "MigrationCheck?ZZ_DEP_REQ='" + 
						oDeputationThis.getView().getModel().getData().screenData.ZZ_DEP_REQ + "'&ZZ_SMOD='" + 
						oDeputationThis.getView().getModel().getData().screenData.ZZ_DEP_TYPE + "'&$format=json",
						type: "GET"
					});
					get.done(function(data) {
						if (data.d.results[0].ZZ_FLAG == "X") {
							setTimeout(function() {
								sap.ui.getCore().byId("flexBoxMigrationDocuments").setVisible(true);
							}, 500);
						} else {
							setTimeout(function() {
								sap.ui.getCore().byId("flexBoxMigrationDocuments").setVisible(false);
							}, 500);
						}
					});
				} else {
					sap.ui.getCore().byId("flexBoxMigrationDocuments").setVisible(false);
				}
			} catch(exc) {}
		}
	},

	// This method is used to display Document files inside PANEL DOCUMENT
	displayDocuments : function() {
		try {
			if( oDeputationThis.getView().getModel().getData().screenData.ZZ_DEP_TYPE == "INTL" &&
					oDeputationThis.getView().getModel().getData().screenData.ZZ_REQ_TYP == "DEPU"  &&
					(( sap.ui.getCore().getModel("global").getData().currentStage == "3" &&
							sap.ui.getCore().getModel("global").getData().currentSubSet == "1_1_1" ) ||
							( sap.ui.getCore().getModel("global").getData().currentStage == "1" &&
									sap.ui.getCore().getModel("global").getData().currentSubSet == "1_2_1" ) || 
									( sap.ui.getCore().getModel("global").getData().currentStage == "2" &&
											( sap.ui.getCore().getModel("global").getData().currentSubSet == "1_1_1"  ||
													sap.ui.getCore().getModel("global").getData().currentSubSet == "1_2_1" ||
													sap.ui.getCore().getModel("global").getData().currentSubSet == "1_3_1" ||
													sap.ui.getCore().getModel("global").getData().currentSubSet == "1_4_1" )))) {
				var aData = view.getModel().getData();
				sap.ui.project.e2etm.util.StaticUtility.getDocument(
						aData.screenData.ZZ_DEP_TOCNTRY, oDeputationThis.getView().getModel().getData().screenData.ZZ_TRV_CAT, oDeputationThis, 
						aData.screenData.ZZ_DEP_REQ, aData.screenData.ZZ_DEP_PERNR);
			}
		} catch(exc) {}
	},

	// This method is used to display Template files inside PANEL DOCUMENT
	displayTemplates : function(evt) {
		try {
			var globalData = sap.ui.getCore().getModel("global").getData();
			$.browser.msie = /msie/.test(navigator.userAgent.toLowerCase()); 
			$.browser.mozilla = /firefox/.test(navigator.userAgent.toLowerCase()); 
			$.browser.chrome = /chrom(e|ium)/.test(navigator.userAgent.toLowerCase()); 

			if ($.browser.msie) { //IE
				url = "file://bosch.com/DfsRB/DfsIN/LOC/Kor/HRL/HRL-TD/HRL-TD-Share/18-Global_Mobility/Immigration";
			} else if ($.browser.mozilla) {
				url = "file://///bosch.com/DfsRB/DfsIN/LOC/Kor/HRL/HRL-TD/HRL-TD-Share/18-Global_Mobility/Immigration";
			} else if ($.browser.chrome) {
				url = "file://///bosch.com/DfsRB/DfsIN/LOC/Kor/HRL/HRL-TD/HRL-TD-Share/18-Global_Mobility/Immigration";
			} else {
				url = "file://bosch.com/DfsRB/DfsIN/LOC/Kor/HRL/HRL-TD/HRL-TD-Share/18-Global_Mobility/Immigration";
			}
//			sap.ui.getCore().byId("linkTemplate").setHref(url + "/" + view.getModel().getData().screenData.ZZ_DEP_TOCNTRY + "/Stage " +
//					globalData.currentStage);
			//change requirement in link
			sap.ui.getCore().byId("linkTemplate").setHref(url + "/" + view.getModel().getData().screenData.ZZ_DEP_TOCNTRY);
		} catch(exc) {}
	},
	
	// This method is used to clear all the styles of the BREADCRUMB TEXT
	removeBreadcrumbTextStyles : function() {
		view.byId("lblRequestNumber").removeStyleClass("request_breadcrumb");
		view.byId("lblRequestNumber").removeStyleClass("request_breadcrumb_change");
		view.byId("lblRequestNumber").removeStyleClass("request_breadcrumb_cancel");
	},

	// This method is used to set the styles of the BREADCRUMB TEXT and 
	// display it at the top of the page
	displayBreadcrumbText : function() {
		var aData = view.getModel().getData();
		var globalData = sap.ui.getCore().getModel("global").getData();

		view.byId("breadCrumbFlexbox").setVisible(true);
		view.byId("lblRequestNumber").setVisible(true);
		
		// Set visibility of request Type
		view.byId("lblRequestType").setVisible(true);
		view.byId("lblRequestType").setText(aData.screenData.ZZ_REQ_TYP);
		view.byId("lblRequestType").setTooltip(sap.ui.project.e2etm.util.Formatter.formatReqType(aData.screenData.ZZ_REQ_TYP));
		// Set visibility of view owner profile
		if (sap.ui.getCore().getModel("profile").getData().currentRole == "EMP") {
			view.byId("lnkViewOwnerProfile").setVisible(false);
		} else {
			view.byId("lnkViewOwnerProfile").setVisible(true);
		}

		// Set data for All dates, Main request
		if (aData.screenData.ZZ_REQ_TYP == "DEPU") {
			// Set visibility of deputation contacts button
			view.byId("lnkDeputationContacts").setVisible(true);
			if (sDeputationNo == "") {
				view.byId("lnkViewAllDates").setVisible(false);
			} else {
				view.byId("lnkViewAllDates").setVisible(true);
				// Set View PDF of Travel request
				if (aData.screenData.ZZ_TRV_REQ != "" && aData.screenData.ZZ_TRV_REQ != "0000000000" && 
						aData.screenData.ZZ_TRV_REQ != null && 
						aData.screenData.ZZ_STAT_FLAG.substring(2, 5) != "000" &&
						aData.screenData.ZZ_STAT_FLAG.substring(2, 5) != "008") {
					view.byId("lnkViewTravelPDF").setVisible(true);
				} else {
					view.byId("lnkViewTravelPDF").setVisible(false);
				}
			}
			view.byId("lnkViewPrimaryRequest").setVisible(false);
		} else {
			view.byId("lnkViewAllDates").setVisible(false);
			if (aData.screenData.ZZ_REQ_TYP == "BUSR" || aData.screenData.ZZ_REQ_TYP == "INFO") {
				view.byId("lnkViewPrimaryRequest").setVisible(false);
			} else {
				if (sDeputationNo == "") {
					view.byId("lnkViewPrimaryRequest").setVisible(false);
				} else {
					view.byId("lnkViewPrimaryRequest").setVisible(true);
				}
			}
			if (sDeputationNo == "") {
				view.byId("lnkViewTravelPDF").setVisible(false);
			} else {
				// Set View PDF of Travel request
				if (aData.screenData.ZZ_DEP_REQ != "" && aData.screenData.ZZ_DEP_REQ != "0000000000" && 
						aData.screenData.ZZ_DEP_REQ != null && 
						aData.screenData.ZZ_STAT_FLAG.substring(2, 5) != "000" &&
						aData.screenData.ZZ_STAT_FLAG.substring(2, 5) != "008") {
					view.byId("lnkViewTravelPDF").setVisible(true);
				} else {
					view.byId("lnkViewTravelPDF").setVisible(false);
				}
			}
		}

		// Set help documents
		//sidd code start
		var url = "http://sgpmis02.apac.bosch.com/Helpdesk/ESS/swifthelpdoc/Deputation/";
		var a = sap.ui.getCore().getModel("global").getData().currentStage;
		var b = sap.ui.getCore().getModel("global").getData().currentSet;
		if (aData.screenData.ZZ_REQ_TYP == "DEPU") {
			view.byId("lnkHelpDeputation").setVisible(true);
			if (a == "1"){
				if(b == "1_1"){
					url = url + "deputationrequeststep.html";
				}
			}
			if(aData.screenData.ZZ_DEP_TYPE == "DOME"){
				if (a == "1") {
					if (b == "1_2") {
						url = url + "permitandapproval.html";
					}
				} else if (a == "2") {
					if (b == "1_1") {
						url = url + "travelplan.html";
					}
					if (b == "1_2") {
						url = url + "travelapproval.html";
					}
				}
			}
			if(aData.screenData.ZZ_DEP_TYPE == "INTL"){
				if (a == "1") {
					if(b == "1_2"){
						url = url + "docsandapproval.html";
					}
				} else if (a == "2"){
					if (b == "1_1") {
						url = url + "verificationandinvite.html";
					}
					if (b == "1_2") {
						url = url + "visadocs.html";
					}
					if (b == "1_3") {
						url = url + "visasubmission.html";
					}
					if (b == "1_4") {
						url = url + "ppcollection.html";
					}
				} else if (a == "3") {
					if (b == "1_1") {
						url = url + "travelplan.html";
					}
					if (b == "1_2") {
						url = url + "travelapproval.html";
					}
				}
			} 
			this.getView().byId("lnkHelpDeputation").setHref(url);
		} else {
			view.byId("lnkHelpDeputation").setVisible(true);
			if (a == "1"){
				if(b == "1_1"){
					url = url + "travelplan.html";
				}
				if(b == "1_2"){
					url = url + "travelapproval.html";
				}
			}
			this.getView().byId("lnkHelpDeputation").setHref(url);
		}
		//sidd code end

		oDeputationThis.removeBreadcrumbTextStyles();
		
		//start of change_dye5kor_TP_SWAP_Changes_Phase-3
		if(sDeputationNo != "" && aData.screenData.ZZ_REQ_TYP == "DEPU"){
			oDeputationThis.getTravelPlan(sDeputationNo,aData.screenData.ZZ_REQ_TYP);			
		}
	//End of change_dye5kor_TP_SWAP_Changes_Phase-3

		if (globalData.isChange) {
			if (globalData.changeType == "DA") {
				view.byId("lblRequestNumber").setText("YOU ARE CHANGING THE DATES OF REQUEST (" + sDeputationNo + ")");
				view.byId("lblRequestNumber").addStyleClass("request_breadcrumb_change");
			} else if (globalData.changeType == "DB") {
				view.byId("lblRequestNumber").setText("YOU ARE CHANGING THE END DATE OF REQUEST (" + sDeputationNo + ")");
				view.byId("lblRequestNumber").addStyleClass("request_breadcrumb_change");
			} else if (globalData.changeType == "DE") {
				view.byId("lblRequestNumber").setText("YOU ARE CHANGING THE FAMILY ACCOMPANIED FOR REQUEST (" + sDeputationNo + ")");
				view.byId("lblRequestNumber").addStyleClass("request_breadcrumb_change");
			} else if (globalData.changeType == "DF") {
				view.byId("lblRequestNumber").setText("YOU ARE ADDING NEW BORN KID FOR THE REQUEST (" + sDeputationNo + ")");
				view.byId("lblRequestNumber").addStyleClass("request_breadcrumb_change");
			} else if (globalData.changeType == "DG") {
				view.byId("lblRequestNumber").setText("YOU ARE ADDING ADDITIONAL MEMBER(S) FOR THE REQUEST (" + sDeputationNo + ")");
				view.byId("lblRequestNumber").addStyleClass("request_breadcrumb_change");
			} else if (globalData.changeType == "DH") {
				view.byId("lblRequestNumber").setText("YOU ARE CHANGING FAMILY RETURNING DATE FOR THE REQUEST (" + sDeputationNo + ")");
				view.byId("lblRequestNumber").addStyleClass("request_breadcrumb_change");
			} else if (globalData.changeType == "TA") {
				view.byId("lblRequestNumber").setText("YOU ARE CHANGING THE TRAVEL REQUEST (" + sDeputationNo + ")");
				view.byId("lblRequestNumber").addStyleClass("request_breadcrumb_change");
			} else {
				view.byId("lblRequestNumber").setText("YOU ARE CHANGING THE REQUEST (" + sDeputationNo + ")");
				view.byId("lblRequestNumber").addStyleClass("request_breadcrumb_change");
			}
		} else {
			if (sDeputationNo == "") {
				if (aData.screenData.ZZ_REQ_TYP == "DEPU") {
					if (aData.screenData.ZZ_TRV_CAT == "WRKP") {
						view.byId("lblRequestNumber").setText("YOU ARE CREATING A NEW DEPUTATION REQUEST");				
					} else if (aData.screenData.ZZ_TRV_CAT == "TRNG") {
						view.byId("lblRequestNumber").setText("YOU ARE CREATING A NEW TRAINING REQUEST");
					} else if (aData.screenData.ZZ_TRV_CAT == "TRFR") {
						view.byId("lblRequestNumber").setText("YOU ARE CREATING A NEW TRANSFER REQUEST");
					} else {
						view.byId("lblRequestNumber").setText("YOU ARE CREATING A NEW DEPUTATION REQUEST");
					}
				} else if (aData.screenData.ZZ_REQ_TYP == "HOME") {
					view.byId("lblRequestNumber").setText("YOU ARE CREATING A NEW HOME TRAVEL");
				} else if (aData.screenData.ZZ_REQ_TYP == "EMER") {
					view.byId("lblRequestNumber").setText("YOU ARE CREATING A NEW EMERGENCY TRAVEL");
				} else if (aData.screenData.ZZ_REQ_TYP == "BUSR") {
					view.byId("lblRequestNumber").setText("YOU ARE CREATING A NEW BUSINESS REQUEST");
				} else if (aData.screenData.ZZ_REQ_TYP == "SECO") {
					view.byId("lblRequestNumber").setText("YOU ARE CREATING A SECONDARY TRAVEL");
				} else if (aData.screenData.ZZ_REQ_TYP == "INFO") {
					view.byId("lblRequestNumber").setText("YOU ARE CREATING AN INFO TRAVEL");
				}
				view.byId("lblRequestNumber").addStyleClass("request_breadcrumb");
			} else {
				if (aData.screenData.ZZ_VREASON == "" || aData.screenData.ZZ_VREASON == null) {
					view.byId("lblRequestNumber").setText("REQUEST NUMBER: " + sDeputationNo);
					view.byId("lblRequestNumber").addStyleClass("request_breadcrumb");
				
				
				
				} else if (aData.screenData.ZZ_VREASON == "DA" || aData.screenData.ZZ_VREASON == "DR") {
					view.byId("lblRequestNumber").setText("THIS REQUEST (" + sDeputationNo + ") HAS BEEN CHANGED IN DATES");
					view.byId("lblRequestNumber").addStyleClass("request_breadcrumb_change");
				} else if (aData.screenData.ZZ_VREASON == "DB") {
					view.byId("lblRequestNumber").setText("THIS REQUEST (" + sDeputationNo + ") HAS BEEN CHANGED IN END DATE");
					view.byId("lblRequestNumber").addStyleClass("request_breadcrumb_change");
				} else if (aData.screenData.ZZ_VREASON == "DC") {
					view.byId("lblRequestNumber").setText("THIS REQUEST (" + sDeputationNo + ") IS SENT FOR CANCELLATION");
					view.byId("lblRequestNumber").addStyleClass("request_breadcrumb_cancel");
				} else if (aData.screenData.ZZ_VREASON == "DD") {
					view.byId("lblRequestNumber").setText("THIS REQUEST INCLUDING CONTRACT LETTER (" + sDeputationNo + ") HAS BEEN APPROVED FOR CANCELLATION");
					view.byId("lblRequestNumber").addStyleClass("request_breadcrumb_cancel");
				} else if (aData.screenData.ZZ_VREASON == "DE") {
					view.byId("lblRequestNumber").setText("THIS REQUEST (" + sDeputationNo + ") HAS BEEN CHANGED IN TRAVELLING DEPENDENTS");
					view.byId("lblRequestNumber").addStyleClass("request_breadcrumb_change");
				} else if (aData.screenData.ZZ_VREASON == "DF") {
					view.byId("lblRequestNumber").setText("THIS REQUEST (" + sDeputationNo + ") HAS ADDED A NEW BORN KID");
					view.byId("lblRequestNumber").addStyleClass("request_breadcrumb_change");
				} else if (aData.screenData.ZZ_VREASON == "DG") {
					view.byId("lblRequestNumber").setText("THIS REQUEST (" + sDeputationNo + ") HAS ADDED ADDITIONAL TRAVELLING MEMBER(S)");
					view.byId("lblRequestNumber").addStyleClass("request_breadcrumb_change");
				} else if (aData.screenData.ZZ_VREASON == "DH") {
					view.byId("lblRequestNumber").setText("THIS REQUEST (" + sDeputationNo + ") HAS BEEN CHANGED IN FAMILY RETURNING DATE");
					view.byId("lblRequestNumber").addStyleClass("request_breadcrumb_change");
				} else if (aData.screenData.ZZ_VREASON == "TA") {
					view.byId("lblRequestNumber").setText("THIS TRAVEL REQUEST (" + sDeputationNo + ") HAS BEEN CHANGED");
					view.byId("lblRequestNumber").addStyleClass("request_breadcrumb_change");
				} else {
					view.byId("lblRequestNumber").setText("PLEASE MAINTAIN THE TEXT FOR THIS REQUEST (" + sDeputationNo + ") IN DOMAIN ZE2E_VREASON");
					view.byId("lblRequestNumber").addStyleClass("request_breadcrumb");
				}
			}
		}
	},

	// This method is used to display the default screen based on the current scenario
	// For example: display DEPUTATION DETAILS screen when manager is about to approve
	// a request
	displayDefaultScreen : function() {
		try {
			var globalData = sap.ui.getCore().getModel("global").getData();
			var aData = view.getModel().getData();
			var prefix = aData.screenData.ZZ_STAT_FLAG.substring(0, 2);
			var action = aData.screenData.ZZ_STAT_FLAG.substring(2, 5);
			// Display default screen for deputation request
			if (aData.screenData.ZZ_REQ_TYP == "DEPU") {
				if (!globalData.isChange) {       // Considerring non-change deputation request
					// For manager to approve a request
					if (aData.screenData.ZZ_STAT_FLAG == "AA003" && 
							(aData.screenData.ZZ_TRV_REQ == "" || aData.screenData.ZZ_TRV_REQ == "0000000000" ||
									aData.screenData.ZZ_TRV_REQ == null) &&
									sap.ui.getCore().getModel("profile").getData().currentRole == "GRM") {
						try {
							oDeputationThis.resetAllTheStageSelectedSymbol();
							oDeputationThis.setSelectedSymbol("1", "1_1");
						} catch(exc) {}
						oDeputationThis.displaySelectedStageItem("1", "1_1");
						return;
					}

					// For employee to modify a sent-back request
					if (prefix != "AA" && action == "003" && 
							(aData.screenData.ZZ_TRV_REQ == "" || aData.screenData.ZZ_TRV_REQ == "0000000000" ||
									aData.screenData.ZZ_TRV_REQ == null) &&
									oDeputationThis.currentStage == "1" && oDeputationThis.currentSubSet == "1_2_1") {
						try {
							oDeputationThis.resetAllTheStageSelectedSymbol();
							oDeputationThis.setSelectedSymbol("1", "1_1");
						} catch(exc) {}
						oDeputationThis.displaySelectedStageItem("1", "1_1");
						return;
					}

					// Sent back from screen Verification
					if (prefix != "AA" && action == "003" && 
							(aData.screenData.ZZ_TRV_REQ == "" || aData.screenData.ZZ_TRV_REQ == "0000000000" ||
									aData.screenData.ZZ_TRV_REQ == null) &&
									oDeputationThis.currentStage == "2" && oDeputationThis.currentSubSet == "1_1_1") {
						try {
							oDeputationThis.resetAllTheStageSelectedSymbol();
							oDeputationThis.setSelectedSymbol("1", "1_2");
							view.byId('carouselProcessFlow').setFirstVisibleIndex(parseInt(oDeputationThis.curStagePos) - 1 - 1);
						} catch(exc) {}
						oDeputationThis.displaySelectedStageItem("1", "1_2");
						return;
					}

					// Sent back from screen Visa Submission
					if (prefix != "AA" && action == "003" && 
							(aData.screenData.ZZ_TRV_REQ == "" || aData.screenData.ZZ_TRV_REQ == "0000000000" ||
									aData.screenData.ZZ_TRV_REQ == null) && 
									oDeputationThis.currentStage == "2" && oDeputationThis.currentSubSet == "1_3_1") {
						try {
							oDeputationThis.resetAllTheStageSelectedSymbol();
							oDeputationThis.setSelectedSymbol("2", "1_2");
							view.byId('carouselProcessFlow').setFirstVisibleIndex(parseInt(oDeputationThis.curStagePos) - 1 - 1);
						} catch(exc) {}
						oDeputationThis.displaySelectedStageItem("2", "1_2");
						return;
					}

					// For manager to approve a Domestic with travel request
					if (action == "003" && aData.screenData.ZZ_DEP_TYPE == "DOME" &&
							oDeputationThis.currentStage == "2" && oDeputationThis.currentSubSet == "1_2_1" &&
							(((aData.screenData.ZZ_TRV_REQ != "0000000000" && aData.screenData.ZZ_TRV_REQ != "") || 
									aData.screenData.ZZ_TRV_REQ == null)) &&
									sap.ui.getCore().getModel("profile").getData().currentRole == "GRM") {
						try {
							oDeputationThis.resetAllTheStageSelectedSymbol();
							oDeputationThis.setSelectedSymbol("2", "1_1");
						} catch(exc) {}
						oDeputationThis.displaySelectedStageItem("2", "1_1");
						return;
					}

					// For manager to approve an international deputation request
					if (action == "003" && aData.screenData.ZZ_DEP_TYPE == "INTL" &&
							oDeputationThis.currentStage == "3" && oDeputationThis.currentSubSet == "1_2_1" &&
							(((aData.screenData.ZZ_TRV_REQ != "0000000000" && aData.screenData.ZZ_TRV_REQ != "") || 
									aData.screenData.ZZ_TRV_REQ == null)) &&
									sap.ui.getCore().getModel("profile").getData().currentRole == "GRM") {
						try {
							oDeputationThis.resetAllTheStageSelectedSymbol();
							oDeputationThis.setSelectedSymbol("3", "1_1");
						} catch(exc) {}
						oDeputationThis.displaySelectedStageItem("3", "1_1");
						return;
					}

					// Sent back from Travel approval screen for domestic with travel plan
					if (aData.screenData.ZZ_DEP_TYPE == "DOME" && 
							((aData.screenData.ZZ_TRV_REQ != "0000000000" && aData.screenData.ZZ_TRV_REQ != "") || 
									aData.screenData.ZZ_TRV_REQ == null)) {
						if (action == "008" && oDeputationThis.currentStage == "2" && oDeputationThis.currentSubSet == "1_2_1") {
							try {
								oDeputationThis.resetAllTheStageSelectedSymbol();
								oDeputationThis.setSelectedSymbol("2", "1_1");
								view.byId('carouselProcessFlow').setFirstVisibleIndex(parseInt(oDeputationThis.curStagePos) - 1 - 1);
							} catch(exc) {}
							oDeputationThis.displaySelectedStageItem("2", "1_1");
							return;
						}
					}
				} else {                    // Display first screen for changing
/*Start-Change Famil Return Dates*/
					if(globalData.changeType == "DH" && aData.screenData.ZZ_DEP_TYPE == "INTL" && aData.screenData.ZZ_REQ_TYP == "DEPU"){
					var chgFlag = sap.ui.project.e2etm.util.StaticUtility.checkChangeDatesLogic(aData.screenData.ZZ_DEP_REQ,"DH");
					if(aData.screenData.ZZ_DEP_TYPE == "INTL" && chgFlag){//For Change Family Return Dates,display the stage to Travel Plan
						oDeputationThis.displaySelectedStageItem("3", "1_1");
						return;
					}
					}
			
/*End-Change Famil Return Dates*/					
					oDeputationThis.displaySelectedStageItem("1", "1_1");
					return;
			
				}
			} else { // Display default screen for BUSR / SECO / HOME / EMER / INFO request
				if (!globalData.isChange) {
					// For manager to approve a request
					if ((action == "003" || action == "006") && sap.ui.getCore().getModel("profile").getData().currentRole == "GRM") {
						try {
							oDeputationThis.resetAllTheStageSelectedSymbol();
							oDeputationThis.setSelectedSymbol("1", "1_1");
						} catch(exc) {}
						oDeputationThis.displaySelectedStageItem("1", "1_1");
						return;
					}

					// For employee to modify a sent-back request
					if (action == "008" & sap.ui.getCore().getModel("profile").getData().currentRole == "EMP") {
						try {
							oDeputationThis.resetAllTheStageSelectedSymbol();
							oDeputationThis.setSelectedSymbol("1", "1_1");
						} catch(exc) {}
						oDeputationThis.displaySelectedStageItem("1", "1_1");
						return;
					}
				} else {                    // Display first screen for changing
					oDeputationThis.displaySelectedStageItem("1", "1_1");
					return;
				}
			}
			oDeputationThis.displaySelectedStageItem(globalData.currentStage, globalData.currentSet);
		} catch(exc) {
			oDeputationThis.displaySelectedStageItem(globalData.currentStage, globalData.currentSet);
		};
	},

	// This method is used to display REQUISITION FORM PANEL
	displayDomesticTransferRequisitionForm : function() {
		if (oDeputationThis.getView().getModel().getData().screenData.ZZ_DEP_TYPE == "DOME" &&
				view.getModel().getData().screenData.ZZ_REQ_TYP == "DEPU" &&
				sap.ui.getCore().getModel("global").getData().currentStage == "1" && 
				sap.ui.getCore().getModel("global").getData().currentSubSet == "1_2_1" &&
				view.getModel().getData().screenData.ZZ_TRV_CAT == "TRFR") {
			try {
				sap.ui.getCore().byId("transferRequisitionPanelId").setVisible(true);
				
				var currentRole = sap.ui.getCore().getModel("profile").getData().currentRole;
				var globalData = sap.ui.getCore().getModel("global").getData();
				var aData = view.getModel().getData();

				// Getting domestic transfer requisition
				var get = $.ajax({
					cache: false,
					url: sServiceUrl + "DmsDocsSet?$filter=DepReq eq '" + aData.screenData.ZZ_DEP_REQ + 
						"' and EmpNo eq '" + aData.screenData.ZZ_DEP_PERNR +  "' and DocType eq 'TRF'&$format=json",
					type: "GET"
				});
				get.fail(function(err) {
					sap.ui.getCore().byId("lblTransferRequisition").setVisible(true);
					sap.ui.getCore().byId("flexBoxTransferRequisition").setVisible(false);
				});
				get.done(function(data){
					aData.screenData.ZZ_TRFR_DOC_PATH = "";
					try {
						aData.screenData.ZZ_TRFR_DOC_PATH = data.d.results[data.d.results.length - 1].FileUrl;
					} catch(exc) {}
					view.getModel().setData(aData);
				}).then(function(){
					if (aData.screenData.ZZ_TRFR_DOC_PATH == "") {
						sap.ui.getCore().byId("lblTransferRequisition").setVisible(true);
						sap.ui.getCore().byId("flexBoxTransferRequisition").setVisible(false);
					} else {
						sap.ui.getCore().byId("lblTransferRequisition").setVisible(false);
						sap.ui.getCore().byId("flexBoxTransferRequisition").setVisible(true);
					}
				});
			} catch(exc) {}
		} else {
			try {
				sap.ui.getCore().byId("transferRequisitionPanelId").setVisible(false);
				sap.ui.getCore().byId("lblTransferRequisition").setVisible(false);
				sap.ui.getCore().byId("flexBoxTransferRequisition").setVisible(false);
			} catch(exc) {}
		}
	},
	
	// This method is used to display CONTRACT LETTER PANEL
	displayContractLetter : function() {
		
		if ((oDeputationThis.getView().getModel().getData().screenData.ZZ_DEP_TYPE == "INTL" || 
				oDeputationThis.getView().getModel().getData().screenData.ZZ_DEP_TYPE == "DOME") &&
				view.getModel().getData().screenData.ZZ_REQ_TYP == "DEPU" &&
				sap.ui.getCore().getModel("global").getData().currentStage == "1" && 
				sap.ui.getCore().getModel("global").getData().currentSubSet == "1_2_1") {
			if(sap.ui.getCore().byId("pnlSalSlip"))
			    sap.ui.getCore().byId("pnlSalSlip").setVisible(false);
			try {
				var aData = view.getModel().getData();
				var prefix = aData.screenData.ZZ_STAT_FLAG.substring(0, 2);
				var action = aData.screenData.ZZ_STAT_FLAG.substring(2, 5);
				var currentRole = sap.ui.getCore().getModel("profile").getData().currentRole;
				var globalData = sap.ui.getCore().getModel("global").getData();
				var aData = view.getModel().getData();

				// Display contract letter
				var get = $.ajax({
					cache: false,
					url: sServiceUrl + "ZE2E_DOCS_DETAILSSet?$filter=ZZ_DEP_REQ eq '" + aData.screenData.ZZ_DEP_REQ + "'&$format=json",
					type: "GET"
				});
				get.done(function(data) {
					if (currentRole == "EMP" || currentRole == "DEPU" || currentRole == "GRM") {
						
						// If ZZ_DOC_PATH is not empty, show that doc
					 if(aData.screenData.ZZ_DEP_TOCNTRY == "DE" && aData.screenData.ZZ_ASG_TYP == "STA"&& 
						aData.screenData.ZZ_TRV_CAT!="TRNG"){
						 sap.ui.getCore().byId("pnlSalSlip").setVisible(true);
						var clIndex = -1;
						for(var i=0;i<data.d.results.length;i++){
							if(data.d.results[i].ZZ_DOKTL == "CL"){
								clIndex = i;
								break;
							}
						}
						var salaryList = [];
						var CLlist = [];
						//dye5kor_cggs_changes_10.09.2018
						/*if(clIndex == 1)
							 salaryList = data.d.results.splice(0,clIndex);
						else if(clIndex>0){
							 salaryList = data.d.results.splice(0,clIndex);
						}else if(clIndex == -1){			
							if(data.d.results.length!=0){
							   salaryList = data.d.results.splice(0);
							}
						}*/
						
						for(var j=0;j<data.d.results.length;j++){
							if(data.d.results[j].ZZ_DOKTL == "CGS"){
								salaryList.push({  
									ZZ_ASG_TYP:data.d.results[j].ZZ_ASG_TYP,
									ZZ_AUTOMATIC:data.d.results[j].ZZ_AUTOMATIC,
									ZZ_DEP_PERNR: data.d.results[j].ZZ_DEP_PERNR,
									ZZ_DEP_REQ: data.d.results[j].ZZ_DEP_REQ,
									ZZ_DOC_PATH: data.d.results[j].ZZ_DOC_PATH,
									ZZ_DOKTL: data.d.results[j].ZZ_DOKTL,
									ZZ_HOSTENTITY: data.d.results[j].ZZ_HOSTENTITY,
									ZZ_JOB: data.d.results[j].ZZ_JOB,
									ZZ_JOB_CLS: data.d.results[j].ZZ_JOB_CLS,
									ZZ_MENTOR:data.d.results[j].ZZ_MENTOR,
									ZZ_SALARY_SHA:data.d.results[j].ZZ_SALARY_SHA,
									ZZ_STADECL_MODE:data.d.results[j].ZZ_STADECL_MODE,
									ZZ_VERSION: data.d.results[j].ZZ_VERSION,
									
								} );
								//data.d.results.splice(j,1);
							}else if(data.d.results[j].ZZ_DOKTL == "CL"){
								CLlist.push({  
									ZZ_ASG_TYP:data.d.results[j].ZZ_ASG_TYP,
									ZZ_AUTOMATIC:data.d.results[j].ZZ_AUTOMATIC,
									ZZ_DEP_PERNR: data.d.results[j].ZZ_DEP_PERNR,
									ZZ_DEP_REQ: data.d.results[j].ZZ_DEP_REQ,
									ZZ_DOC_PATH: data.d.results[j].ZZ_DOC_PATH,
									ZZ_DOKTL: data.d.results[j].ZZ_DOKTL,
									ZZ_HOSTENTITY: data.d.results[j].ZZ_HOSTENTITY,
									ZZ_JOB: data.d.results[j].ZZ_JOB,
									ZZ_JOB_CLS: data.d.results[j].ZZ_JOB_CLS,
									ZZ_MENTOR:data.d.results[j].ZZ_MENTOR,
									ZZ_SALARY_SHA:data.d.results[j].ZZ_SALARY_SHA,
									ZZ_STADECL_MODE:data.d.results[j].ZZ_STADECL_MODE,
									ZZ_VERSION: data.d.results[j].ZZ_VERSION,
									
								} );
								
							}
						}
						
						data.d.results = CLlist;
						
						
						
						//	dye5kor_cggs_changes_10.09.2018
						if(salaryList.length>0){
							sap.ui.getCore().byId("lblSalSlip").setVisible(false);
							sap.ui.getCore().byId("flexBoxSalSlip").setVisible(true);
							aData.screenData.salaryList = salaryList;
							// modify the contract list value

						//	view.getModel().setData(aData);
						}else{
							sap.ui.getCore().byId("lblSalSlip").setVisible(true);
							sap.ui.getCore().byId("flexBoxSalSlip").setVisible(false);
						}
						}
						
						if (data.d.results.length > 0) {
						
							
							sap.ui.getCore().byId("lblContractLetter").setVisible(false);
							sap.ui.getCore().byId("flexBoxContractLetter").setVisible(true);
							aData.screenData.contractList = [];

							// Get the contract letter if any
							var get = $.ajax({
								cache: false,
								url: sServiceUrl + "DEP_CL_STATUSSet(ZZ_DEP_REQ='" + aData.screenData.ZZ_DEP_REQ + "')?$format=json",
								type: "GET"
							});
							get.fail(function(err) {
								sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
							});
							get.done(function(result) {
								if (result.d.ZZ_CL_STATUS != 'E' && result.d.ZZ_CL_STATUS != 'S' &&
										((aData.screenData.ZZ_STAT_FLAG != "HH001" && aData.screenData.ZZ_DEP_TYPE == "INTL") &&
												(aData.screenData.ZZ_STAT_FLAG.substring(2, 5) != "001" && aData.screenData.ZZ_DEP_TYPE == "DOME"))) {
									data.d.results.splice(data.d.results.length - 1, 1);
									if(aData.screenData.salaryList){
									if(aData.screenData.salaryList.length!=0)
										aData.screenData.salaryList.splice(aData.screenData.salaryList.length - 1, 1);
									}
										
								} else {
									if ((result.d.ZZ_CL_STATUS == 'D' || result.d.ZZ_CL_STATUS == "") && currentRole != "DEPU") {
										data.d.results.splice(data.d.results.length - 1, 1);
									//dye5kor_11.09.2018
									if(aData.screenData.salaryList){
									  if(aData.screenData.salaryList.length!=0)
									    aData.screenData.salaryList.splice(aData.screenData.salaryList.length - 1, 1);
										}
									//	dye5kor_11.09.2018
									}
								}
								
								if(aData.screenData.salaryList){
									
								if(aData.screenData.salaryList.length>0){
									sap.ui.getCore().byId("lblSalSlip").setVisible(false);
									sap.ui.getCore().byId("flexBoxSalSlip").setVisible(true);
									aData.screenData.salaryList = aData.screenData.salaryList.reverse();
									for (var i = 0; i < aData.screenData.salaryList.length; i++) {
										if ( i == 0) {
											aData.screenData.salaryList[i].ZZ_DOC_NAME = "Salary Slip (Latest version)";
										} else {
											aData.screenData.salaryList[i].ZZ_DOC_NAME = 
												"Salary Slip version " + (aData.screenData.salaryList.length - i);
										}
									}
								}else{
									if(aData.screenData.ZZ_SH_STATUS == 'G' || aData.screenData.ZZ_SH_STATUS == 'R' || aData.screenData.ZZ_SH_STATUS == 'A' ){
										
										sap.ui.getCore().byId("lblSalSlip").setVisible(false);
										sap.ui.getCore().byId("flexBoxSalSlip").setVisible(false);
									}else {
									sap.ui.getCore().byId("lblSalSlip").setVisible(true);
									sap.ui.getCore().byId("flexBoxSalSlip").setVisible(false);
									}
									}
								}

								aData.screenData.contractList = data.d.results.reverse();
								// modify the contract list value
								for (var i = 0; i < aData.screenData.contractList.length; i++) {
									if ( i == 0) {
										aData.screenData.contractList[i].ZZ_DOC_NAME = "Contract Letter (Latest version)";
									} else {
										aData.screenData.contractList[i].ZZ_DOC_NAME = 
											"Contract Letter version " + (aData.screenData.contractList.length - i);
									}
								}
								view.getModel().setData(aData);
								if (aData.screenData.contractList.length == 0) {
									sap.ui.getCore().byId("lblContractLetter").setVisible(true);
									sap.ui.getCore().byId("flexBoxContractLetter").setVisible(false);
								}
							});
						} else {
							sap.ui.getCore().byId("lblContractLetter").setVisible(true);
							sap.ui.getCore().byId("flexBoxContractLetter").setVisible(false);
						}
					}

					// Consider documents of migrated request for DEPU in domestic deputation workflow
					if (sap.ui.getCore().getModel("profile").getData().currentRole == "DEPU" &&
							oDeputationThis.getView().getModel().getData().screenData.ZZ_REQ_TYP == "DEPU" &&
							oDeputationThis.getView().getModel().getData().screenData.ZZ_DEP_TYPE == "DOME") {
						// Logic to determine migration request
						var get = $.ajax({
							cache: false,
							url: sServiceUrl + "MigrationCheck?ZZ_DEP_REQ='" + 
							oDeputationThis.getView().getModel().getData().screenData.ZZ_DEP_REQ + "'&ZZ_SMOD='" + 
							oDeputationThis.getView().getModel().getData().screenData.ZZ_DEP_TYPE + "'&$format=json",
							type: "GET"
						});
						get.done(function(data) {
							if (data.d.results[0].ZZ_FLAG == "X") {
								sap.ui.getCore().byId("flexBoxMigrationDocuments").setVisible(true);
								sap.ui.getCore().byId("lblContractLetter").setVisible(false);
								sap.ui.getCore().byId("flexBoxContractLetter").setVisible(false);
							} else {
								sap.ui.getCore().byId("flexBoxMigrationDocuments").setVisible(false);
							}
						});
					} else {
						sap.ui.getCore().byId("flexBoxMigrationDocuments").setVisible(false);
					}
				});
			} catch(exc) {}
		} else {
			try {
				sap.ui.getCore().byId("lblContractLetter").setVisible(true);
				sap.ui.getCore().byId("flexBoxContractLetter").setVisible(false);
			} catch(exc) {}
		}
	},
	
	displayAllowanceLetters:function(){
		if((view.getModel().getData().screenData.ZZ_REQ_TYP == "DEPU" || view.getModel().getData().screenData.ZZ_TRV_CAT == "TRNG")  &&
		   sap.ui.getCore().getModel("global").getData().currentStage == "1" && 
		   sap.ui.getCore().getModel("global").getData().currentSubSet == "1_2_1"){
			if(sap.ui.getCore().byId("allowanceDocs--pnSTAAllowanceLetter"))
	    	     sap.ui.getCore().byId("allowanceDocs--pnSTAAllowanceLetter").setVisible(false);
		
		if(sap.ui.project.e2etm.util.Formatter.visibleAllwFormsPanel(
				oDeputationThis.getView().getModel().getData().screenData.ZZ_DEP_TOCNTRY,
				oDeputationThis.getView().getModel().getData().screenData.ZZ_ASG_TYP,
				oDeputationThis.getView().getModel().getData().screenData.ZZ_TRV_CAT,
				oDeputationThis.getView().getModel().getData().screenData.ZZ_DEP_TYPE)){
			
			
		   sap.ui.getCore().byId("allowanceDocs--pnSTAAllowanceLetter").setVisible(true);
		
		   var depReq = oDeputationThis.getView().getModel().getData().screenData.ZZ_DEP_REQ;
		   
			oComponent.getModel().read("ZE2E_DOCS_DETAILSSet?$filter=ZZ_DEP_REQ eq '" + depReq + "' and ZZ_DOKTL eq 'AL' ", null, null, true, 
			        jQuery.proxy(function(oData, response) {
						
			        	 var staAlowanceLetter =  [];
			        	 staAlowanceLetter = oData.results;
			        	 staAlowanceLetter = staAlowanceLetter.reverse();
			             // modify the contract list value
			             for (var i = 0; i < staAlowanceLetter.length; i++) {
			               if ( i == 0) {
			            	   staAlowanceLetter[i].ZZ_DOC_NAME = "Revised Allowance Letter (Latest version)";
			               } else {
			            	   staAlowanceLetter[i].ZZ_DOC_NAME = 
			                   "Allowance Letter version " + (staAlowanceLetter.length - i);
			               }
			             }
			        	 var model = new sap.ui.model.json.JSONModel();
			             model.setData(staAlowanceLetter);
			             sap.ui.getCore().byId("allowanceDocs--flexBoxSTAAllowanceLetter").setModel(model);
			             
			             if(staAlowanceLetter.length!=0){
			            	 sap.ui.getCore().byId("allowanceDocs--flexBoxSTAAllowanceLetter").setVisible(true);
			            	 sap.ui.getCore().byId("allowanceDocs--lblSTAAllowanceLetter").setVisible(false);
			             }else{
			            	 sap.ui.getCore().byId("allowanceDocs--flexBoxSTAAllowanceLetter").setVisible(false);
			            	 sap.ui.getCore().byId("allowanceDocs--lblSTAAllowanceLetter").setVisible(true);	
			            }
			             
			        	 
						
					},this), function(error) {
			    });
			
		}
		}
	},
	
	// This method is used to display COC PANEL
	displayCOC: function() {
		if (oDeputationThis.getView().getModel().getData().screenData.ZZ_DEP_TYPE == "INTL" &&
				sap.ui.getCore().getModel("global").getData().currentStage == "2" && 
				sap.ui.getCore().getModel("global").getData().currentSubSet == "1_3_1") {
			try {
				var currentRole = sap.ui.getCore().getModel("profile").getData().currentRole;
				var globalData = sap.ui.getCore().getModel("global").getData();
				var aData = view.getModel().getData();

				sap.ui.project.e2etm.util.StaticUtility.setBusy(true,oHomeThis);
				// Getting COC letter
				var get = $.ajax({
					cache: false,
					url: sServiceUrl + "DmsDocsSet?$filter=DepReq eq '" + aData.screenData.ZZ_DEP_REQ + "' and EmpNo eq '" + aData.screenData.ZZ_DEP_PERNR +  "'&$format=json",
					type: "GET"
				});
				get.fail(function(err) {
					alert("Error occurs");
					sap.ui.getCore().byId("lblCOC").setVisible(true);
					sap.ui.getCore().byId("flexBoxCOC").setVisible(false);
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
				});
				get.done(function(data){
					aData.screenData.ZZ_DOC_PATH = "";
					for(var i=0;i<data.d.results.length;i++){
						if(data.d.results[i].FileName.substr(0,6) == "CL_COC"){
							aData.screenData.ZZ_DOC_PATH = data.d.results[i].FileUrl;
							break;
						}
					}
					sap.ui.getCore().byId('dateCOCSTDATE').setEnabled(view.byId('btnDEPUCOC').getVisible());
					sap.ui.getCore().byId('dateCOCEDATE').setEnabled(view.byId('btnDEPUCOC').getVisible());
					view.getModel().setData(aData);
				}).then(function(){
					if( view.getModel().getData().screenData.ZZ_STAT_FLAG == "AA007" ||
							view.getModel().getData().screenData.ZZ_STAT_FLAG == "JJ008" ||
							(view.getModel().getData().screenData.ZZ_STAT_FLAG == "JJ009" && 
									currentRole != "DEPU")){
						sap.ui.getCore().byId("COCPanelId").setVisible(false);
					}else{
						sap.ui.getCore().byId("COCPanelId").setVisible(true);
						// If ZZ_DOC_PATH is not empty, show that doc
						if (aData.screenData.ZZ_DOC_PATH == "") {
							sap.ui.getCore().byId("lblCOC").setVisible(true);
							sap.ui.getCore().byId("flexBoxCOC").setVisible(false);
						} else {
							sap.ui.getCore().byId("lblCOC").setVisible(false);
							sap.ui.getCore().byId("flexBoxCOC").setVisible(true);
						}
					}
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
				});
			} catch(exc) {}
		}
	},
	
	// This method is used to display INVITATION PANEL
	displayInvitationLetter : function() {
		if (oDeputationThis.getView().getModel().getData().screenData.ZZ_DEP_TYPE == "INTL" &&
				oDeputationThis.getView().getModel().getData().screenData.ZZ_REQ_TYP == "DEPU" &&
				sap.ui.getCore().getModel("global").getData().currentStage == "2" && 
				( (sap.ui.getCore().getModel("global").getData().currentSubSet == "1_1_1" &&
						oDeputationThis.getView().getModel().getData().screenData.ZZ_STAT_FLAG != "AA005") ||
						sap.ui.getCore().getModel("global").getData().currentSubSet == "1_2_1")) {
			try {
				var currentRole = sap.ui.getCore().getModel("profile").getData().currentRole;
				var globalData = sap.ui.getCore().getModel("global").getData();
				var aData = view.getModel().getData();

				// Getting invitation letter
				var get = $.ajax({
					cache: false,
					url: sServiceUrl + "DmsDocsSet?$filter=DepReq eq '" + aData.screenData.ZZ_DEP_REQ + "' and EmpNo eq '" + aData.screenData.ZZ_DEP_PERNR +  "'&$format=json",
					type: "GET"
				});
				get.fail(function(err) {
					sap.ui.getCore().byId("lblInvitationLetter").setVisible(true);
					sap.ui.getCore().byId("flexBoxInvitationLetter").setVisible(false);
					if (aData.screenData.ZZ_DEP_TOCNTRY == "DE") {
						sap.ui.getCore().byId("lblPreInvitationLetter").setVisible(true);
						sap.ui.getCore().byId("flexBoxPreInvitationLetter").setVisible(false);
					} else {
						sap.ui.getCore().byId("lblPreInvitationLetter").setVisible(false);
						sap.ui.getCore().byId("flexBoxPreInvitationLetter").setVisible(true);
					}
				});
				get.done(function(data){
					aData.screenData.ZZ_DOC_PATH = "";
					aData.screenData.ZZ_PRE_DOC_PATH = "";
					for(var i=0;i<data.d.results.length;i++){
						// Get pre approval list
						if(data.d.results[i].FileName.substr(0,24) == "CL_PRE_INVITATION_LETTER"){
							aData.screenData.ZZ_PRE_DOC_PATH = data.d.results[i].FileUrl;
						}
						if(data.d.results[i].FileName.substr(0,20) == "CL_INVITATION_LETTER"){
							aData.screenData.ZZ_DOC_PATH = data.d.results[i].FileUrl;
						}
					}
					view.getModel().setData(aData);
				}).then(function(){
					if (currentRole == "DEPU" || 
							(currentRole != "DEPU" && aData.screenData.ZZ_STAT_FLAG != "JJ005")) {
						// If ZZ_DOC_PATH is not empty, show that doc
						sap.ui.getCore().byId("invitationLetterPanelId").setVisible(true);
						if (aData.screenData.ZZ_DEP_TOCNTRY == "AT") {
							sap.ui.getCore().byId("invitationLetterPanelId").setText("AMS and INVITATION LETTER");
						} else {
							sap.ui.getCore().byId("invitationLetterPanelId").setText("INVITATION LETTER");
						}

						if (aData.screenData.ZZ_DEP_TOCNTRY == "DE") {
							sap.ui.getCore().byId("invitationPreLetterPanelId").setVisible(true);
						} else {
							sap.ui.getCore().byId("invitationPreLetterPanelId").setVisible(false);
						}
					}
					if (aData.screenData.ZZ_DOC_PATH == "") {
						sap.ui.getCore().byId("lblInvitationLetter").setVisible(true);
						sap.ui.getCore().byId("flexBoxInvitationLetter").setVisible(false);
					} else {
						sap.ui.getCore().byId("lblInvitationLetter").setVisible(false);
						sap.ui.getCore().byId("flexBoxInvitationLetter").setVisible(true);
					}

					if (aData.screenData.ZZ_PRE_DOC_PATH == "") {
						sap.ui.getCore().byId("lblPreInvitationLetter").setVisible(true);
						sap.ui.getCore().byId("flexBoxPreInvitationLetter").setVisible(false);
					} else {
						if (aData.screenData.ZZ_DEP_TOCNTRY == "DE") {
							sap.ui.getCore().byId("lblPreInvitationLetter").setVisible(false);
							sap.ui.getCore().byId("flexBoxPreInvitationLetter").setVisible(true);
						} else {
							sap.ui.getCore().byId("lblPreInvitationLetter").setVisible(true);
							sap.ui.getCore().byId("flexBoxPreInvitationLetter").setVisible(false);
						}
					}
				});
			} catch(exc) {}
		}
	},
	
	// This method is used to display VISA COPY PANEL
	displayVisaCopyPanel : function() {
		var globalData = sap.ui.getCore().getModel("global").getData();
		var aData = view.getModel().getData();
		oDeputationThis.visaCopyPanelDone = $.Deferred();
		if (aData.screenData.ZZ_DEP_TYPE == "INTL" && aData.screenData.ZZ_REQ_TYP == "DEPU" &&
				((globalData.currentStage == "3" && globalData.currentSubSet == "1_1_1") ||
						(globalData.currentStage == "2" && 
								(globalData.currentSubSet == "1_1_1" ||
										globalData.currentSubSet == "1_2_1" ||
										globalData.currentSubSet == "1_3_1" ||
										globalData.currentSubSet == "1_4_1")) ||
										(globalData.currentStage == "1" && globalData.currentSubSet == "1_2_1" &&
												(aData.screenData.ZZ_STAT_FLAG != "JJ006" || aData.screenData.ZZ_STAT_FLAG != "HH001")))){

			var bEnabledVisaSelf = (sap.ui.getCore().getModel("profile").getData().currentRole == "DEPU" &&   //Deputation
					globalData.currentStage == "2" && globalData.currentSubSet == "1_3_1" && !aData.screenData.ZZ_VISA_PB &&
					(aData.screenData.ZZ_STAT_FLAG == "AA007" || aData.screenData.ZZ_STAT_FLAG == "JJ008" )) ||
					(sap.ui.getCore().getModel("profile").getData().currentRole == "EMP" &&   //Employee
							(aData.screenData.ZZ_STAT_FLAG == "AA004" ||
									(aData.screenData.ZZ_STAT_FLAG == "JJ003" && 
											globalData.currentStage == "1" && globalData.currentSet == "1_2") || 
											aData.screenData.ZZ_STAT_FLAG == "JJ007"));

			var bEnabledVisaSelfUpload = bEnabledVisaSelf;
			if( sap.ui.getCore().getModel("profile").getData().currentRole == "EMP" &&
					globalData.currentStage == "3" && globalData.currentSubSet == "1_1_1"){
				bEnabledVisaSelfUpload = true;
			};

			var bEnabledVisaDependent = (sap.ui.getCore().getModel("profile").getData().currentRole == "DEPU" &&    //Deputation
					globalData.currentStage == "2" &&
					globalData.currentSubSet == "1_3_1" && (aData.screenData.ZZ_STAT_FLAG == "AA007" || 
							aData.screenData.ZZ_STAT_FLAG == "JJ008" )) ||
							(sap.ui.getCore().getModel("profile").getData().currentRole == "EMP" &&   //Employee
									(aData.screenData.ZZ_STAT_FLAG == "AA004" ||
											(aData.screenData.ZZ_STAT_FLAG == "JJ003" && 
													globalData.currentStage == "1" && globalData.currentSet == "1_2") || aData.screenData.ZZ_STAT_FLAG == "JJ007")); 

			var bEnabledVisaDependentUpload = bEnabledVisaDependent;
			if( sap.ui.getCore().getModel("profile").getData().currentRole == "EMP" &&
					globalData.currentStage == "3" && globalData.currentSubSet == "1_1_1"){
				bEnabledVisaDependentUpload = true;
			};

			var bEnabledAddress = (sap.ui.getCore().getModel("profile").getData().currentRole == "EMP" &&
					(aData.screenData.ZZ_STAT_FLAG == "AA004" ||
							(aData.screenData.ZZ_STAT_FLAG == "JJ003" && globalData.currentStage == "2" && 
									(globalData.currentSet == "1_1" || globalData.currentSet == "1_2")) || 
									aData.screenData.ZZ_STAT_FLAG == "JJ007"));
			//Get data for existing visa
			try {
				oDeputationThis.visaData = $.Deferred();
				var selectedDependents = aData.selectedDependents;
				if (aData.screenData.ZZ_DEP_TYPE == "INTL") {
					// Getting Visa details
					if (aData.screenData.ZZ_VISA_PLAN != "" && aData.screenData.ZZ_VISA_PLAN != null) { //Visa header exists
						var get = $.ajax({
							cache: false,
							url: sServiceUrl + "DEP_VISA_PLANSet('" + aData.screenData.ZZ_VISA_PLAN + "')?$expand=VISAPLANTOITEM&$format=json",
							type: "GET"
						});
						get.fail(function(err) {
							oDeputationThis.visaData.resolve();
						});
						get.done(function(data){
							// Getting the visa data from backend
							if (data.d.VISAPLANTOITEM != null) {
								aData.visaExistingDependent = data.d.VISAPLANTOITEM.results;
							} else {
								aData.visaExistingDependent = [];
							}

							aData.selfVisa = data.d;
							if (data.d.ZZ_CURR_VISA_TYP == "") {
								aData.selfVisa.ZZ_CURR_VISA_TYP = "BUSR";
							}
							aData.selfVisa.ZZ_DEP_REQ = aData.screenData.ZZ_DEP_REQ;
							if (aData.selfVisa.ZZ_VISA_EDATE == "00000000") {
								aData.selfVisa.ZZ_VISA_EDATE = "";
							} else {
								aData.selfVisa.ZZ_VISA_EDATE_VALUE = new Date(aData.selfVisa.ZZ_VISA_EDATE.substr(0, 4), 
										aData.selfVisa.ZZ_VISA_EDATE.substr(4, 2) - 1, 
										aData.selfVisa.ZZ_VISA_EDATE.substr(6, 2));
							}
							if (aData.selfVisa.ZZ_VISA_SDATE == "00000000") {
								aData.selfVisa.ZZ_VISA_SDATE = "";
							} else {
								aData.selfVisa.ZZ_VISA_SDATE_VALUE = new Date(aData.selfVisa.ZZ_VISA_SDATE.substr(0, 4), 
										aData.selfVisa.ZZ_VISA_SDATE.substr(4, 2) - 1, 
										aData.selfVisa.ZZ_VISA_SDATE.substr(6, 2));
							}
							if (data.d.ZZ_MULT_ENTRY == "") {
								aData.selfVisa.ZZ_MULT_ENTRY_CHAR = false;
							} else {
								aData.selfVisa.ZZ_MULT_ENTRY_CHAR = true;
							}
							delete aData.selfVisa["VISAPLANTOITEM"];

							for (var i = 0; i < aData.visaExistingDependent.length; i++) {
								if (aData.visaExistingDependent[i].ZZ_MULT_ENTRY == "") {
									aData.visaExistingDependent[i].ZZ_MULT_ENTRY_CHAR = false;
								} else {
									aData.visaExistingDependent[i].ZZ_MULT_ENTRY_CHAR = true;
								}
								if (aData.visaExistingDependent[i].ZZ_VISA_EDATE == "00000000") {
									//aData.visaExistingDependent[i].ZZ_VISA_EDATE = "";
								} else {
									aData.visaExistingDependent[i].ZZ_VISA_EDATE_VALUE = new Date(
											aData.visaExistingDependent[i].ZZ_VISA_EDATE.substr(0, 4), 
											aData.visaExistingDependent[i].ZZ_VISA_EDATE.substr(4, 2) - 1, 
											aData.visaExistingDependent[i].ZZ_VISA_EDATE.substr(6, 2));
								}
								if (aData.visaExistingDependent[i].ZZ_VISA_SDATE == "00000000") {
									//aData.visaExistingDependent[i].ZZ_VISA_SDATE = "";
								} else {
									aData.visaExistingDependent[i].ZZ_VISA_SDATE_VALUE = new Date(
											aData.visaExistingDependent[i].ZZ_VISA_SDATE.substr(0, 4), 
											aData.visaExistingDependent[i].ZZ_VISA_SDATE.substr(4, 2) - 1, 
											aData.visaExistingDependent[i].ZZ_VISA_SDATE.substr(6, 2));
								}
								aData.visaExistingDependent[i].visibleOpen = false;
								aData.visaExistingDependent[i].enabled = aData.visaExistingDependent[i].ZZ_PASSPORT_NO == "" && bEnabledVisaDependent;
								aData.visaExistingDependent[i].enabledUpload = bEnabledVisaDependentUpload;
							}

							view.getModel().setData(aData);

							// Store Visa Header for latter comparison
							oDeputationThis.currentVisa = aData.selfVisa;
							// Store Visa items for latter comparison
							oDeputationThis.currentDependentVisa = aData.visaExistingDependent;

							try {
								sap.ui.getCore().byId("txtOfficeAddress").setValue(aData.selfVisa.ZZ_OFFC_ADDRESS);
								sap.ui.getCore().byId("txtOfficeAddress").setEditable(bEnabledAddress);
							} catch(exc) {}
							oDeputationThis.visaData.resolve();
						});
					} else {  //Visa header does not exist
						try {
							sap.ui.getCore().byId("txtOfficeAddress").setValue(aData.selfVisa.ZZ_OFFC_ADDRESS);
							sap.ui.getCore().byId("txtOfficeAddress").setEditable(bEnabledAddress);
						} catch(exc) {}
						oDeputationThis.visaData.resolve();
					}

					// After getting existing visa, control visible or invisible visa copy
					$.when(oDeputationThis.visaData).then(function() {
						var aData = view.getModel().getData();
						aData.selfVisa.visibleOpen = false;
						aData.selfVisa.enabled = bEnabledVisaSelf;
						aData.selfVisa.enabledUpload = bEnabledVisaSelfUpload;
						// If employee uploads visa copy
						if ((globalData.currentStage == "1" && globalData.currentSubSet == "1_2_1" && 
								view.getModel().getData().screenData.ZZ_STAT_FLAG != "HH001" &&
								view.getModel().getData().screenData.ZZ_STAT_FLAG != "JJ006") ||
								(globalData.currentStage == "2" && globalData.currentSubSet == "1_1_1")) {
							// If visa not existing and not processed by bosch or visa existing and not process by Bosch
							if (aData.screenData.ZZ_VISA_AEXIST == false ||
									(aData.screenData.ZZ_VISA_AEXIST == true && aData.screenData.ZZ_VISA_PB == false)) {
								// Employee VISA COPY will not be visible
								sap.ui.getCore().byId("panelExistingEmployeeVisaCopy").setVisible(false);
								sap.ui.getCore().byId("panelExistingAccomodation").setVisible(false);
							} else {
								// Employee VISA COPY will be visible
								sap.ui.getCore().byId("panelExistingEmployeeVisaCopy").setVisible(true);
								sap.ui.getCore().byId("panelExistingAccomodation").setVisible(true);
							}

							// Check if family accompany is yes or no.
							// If Yes, loop through deputation items to find any existing visa
							if (aData.screenData.ZZ_FAMILY_ACCOMP) {
								if (aData.visaExistingDependent.length == 0) {  
									var foundExist = false;
									for (var i = 0; i < selectedDependents.length; i++) {
										if (selectedDependents[i].ZZ_VISA_EX == "X") {
											foundExist = true;
											break;
										}
									}
									if (foundExist == false) {
										sap.ui.getCore().byId("panelExistingDependentVisaCopy").setVisible(false);
									} else {
										// Visible that panel
										sap.ui.getCore().byId("panelExistingDependentVisaCopy").setVisible(true);
										// Display only the dependent that has existing visa
										for (var i = 0; i < selectedDependents.length; i++) {
											var prop = {
													"ZZ_CURR_VISA_TYP"  : "DPND",
													"ZZ_VISA_TOCNTRY"   : aData.screenData.ZZ_DEP_TOCNTRY,
													"ZZ_VISA_FCNTRY"  : aData.screenData.ZZ_DEP_FRCNTRY,
													"ZZ_MULT_ENTRY"   : "",
													"ZZ_MULT_ENTRY_CHAR": false,
													"ZZ_VISA_EDATE"   : "",
													"ZZ_VISA_SDATE"   : "",
													"ZZ_VISA_NO"    : "",
													"ZZ_DEP_REQ"    : "",
													"ZZ_DEPNDT_TYP"   : selectedDependents[i].ZZ_DEPE_TYPE,
													"ZZ_VISA_PLAN"    : "",
													"visibleOpen"   : false,
													"enabled"     : bEnabledVisaDependent,
											};
											if (selectedDependents[i].ZZ_VISA_EX == "X") {
												aData.visaExistingDependent.push(prop);
											}
										}
										if (aData.visaExistingDependent.length == 0) {
											sap.ui.getCore().byId("panelExistingDependentVisaCopy").setVisible(false);
										}
									}
								} else {
/*Start-Date Change */
									if(aData.screenData.ZZ_VREASON == "DF" && aData.screenData.ZZ_REQ_TYP=="DEPU"
										&&aData.screenData.ZZ_DEP_TYPE == "INTL"){//New born kid
										aData = oDeputationThis.addNewBornKid(selectedDependents,aData);									
								    }
/*End-Date Change */									
									for (var i = selectedDependents.length - 1; i >= 0; i--) {
										
										for (var j = aData.visaExistingDependent.length - 1; j >= 0; j--) {
											
											if (selectedDependents[i].ZZ_DEPE_TYPE == aData.visaExistingDependent[j].ZZ_DEPNDT_TYP) {
												if (selectedDependents[i].ZZ_VISA_EX == "X"||selectedDependents[i].ZZ_PROC_BSCH == "X") {
													if (aData.visaExistingDependent[j].ZZ_MULT_ENTRY == "") {
														aData.visaExistingDependent[j].ZZ_MULT_ENTRY_CHAR = false;
													} else {
														aData.visaExistingDependent[j].ZZ_MULT_ENTRY_CHAR = true;
													}
													aData.visaExistingDependent[j].visibleOpen = false;
													aData.visaExistingDependent[j].enabled = aData.visaExistingDependent[j].ZZ_VISA_EX == "X" ? bEnabledVisaSelf:bEnabledVisaDependent;
													aData.visaExistingDependent[j].enabledUpload  = bEnabledVisaDependentUpload;
												if(aData.visaExistingDependent[j].ZZ_VISA_SDATE!="")
													aData.visaExistingDependent[j].ZZ_VISA_SDATE_VALUE = 
														new Date(aData.visaExistingDependent[j].ZZ_VISA_SDATE.substr(0, 4), 
																aData.visaExistingDependent[j].ZZ_VISA_SDATE.substr(4, 2) - 1, 
																aData.visaExistingDependent[j].ZZ_VISA_SDATE.substr(6, 2));
												if(aData.visaExistingDependent[j].ZZ_VISA_EDATE!="")
													aData.visaExistingDependent[j].ZZ_VISA_EDATE_VALUE = 
														new Date(aData.visaExistingDependent[j].ZZ_VISA_EDATE.substr(0, 4), 
																aData.visaExistingDependent[j].ZZ_VISA_EDATE.substr(4, 2) - 1, 
																aData.visaExistingDependent[j].ZZ_VISA_EDATE.substr(6, 2));
												} else {
/*Start-Date Change Issue*/
						
													if(aData.screenData.ZZ_VREASON == "DF" && aData.screenData.ZZ_REQ_TYP=="DEPU"
														&&aData.screenData.ZZ_DEP_TYPE == "INTL"){//New born kid
													aData.visaExistingDependent[j].visibleOpen = true;
													aData.visaExistingDependent[j].enabled = false;
													aData.visaExistingDependent[j].enabledUpload  = false;
													}else{
														aData.visaExistingDependent.splice(j, 1);								
													}
/*End-Date Change Issue*/													
												}
												break;
											}
										}
									}
									if (aData.visaExistingDependent.length > 0) {
										sap.ui.getCore().byId("panelExistingDependentVisaCopy").setVisible(true);
									} else {
										sap.ui.getCore().byId("panelExistingDependentVisaCopy").setVisible(false);
									}
								}
							} else {
								sap.ui.getCore().byId("panelExistingDependentVisaCopy").setVisible(false);
							}
						} else if ((globalData.currentStage == "2" &&     //Deputation team, no visa plan
								globalData.currentSubSet == "1_3_1" && 
								view.getModel().getData().screenData.ZZ_STAT_FLAG != "AA007") ||
								(globalData.currentStage == "3" &&      //Employee upload visa for travel plan
										globalData.currentSubSet == "1_1_1")) {
							try{
								sap.ui.getCore().byId("panelAccomodation").setVisible(true);
							}catch(ex){}
							sap.ui.getCore().byId("panelEmployeeVisaCopy").setVisible(true);
							if (aData.visaExistingDependent.length == 0) {  // dependent has no visa exist
								if (selectedDependents.length == 0) {   // No dependent in travel request
									// Hide dependent panel
									sap.ui.getCore().byId("panelDependentVisaCopy").setVisible(false);
								} else {                  // Show selected dependent
									// Visible dependent panel
									sap.ui.getCore().byId("panelDependentVisaCopy").setVisible(true);
									// Display all the dependents
									for (var i = 0; i < selectedDependents.length; i++) {
										var prop = {
												"ZZ_CURR_VISA_TYP"  : "DPND",
												"ZZ_VISA_TOCNTRY"   : aData.screenData.ZZ_DEP_TOCNTRY,
												"ZZ_VISA_FCNTRY"  : aData.screenData.ZZ_DEP_FRCNTRY,
												"ZZ_MULT_ENTRY"   : "",
												"ZZ_MULT_ENTRY_CHAR": false,
												"ZZ_VISA_EDATE"   : "",
												"ZZ_VISA_SDATE"   : "",
												"ZZ_VISA_NO"    : "",
												"ZZ_DEP_REQ"    : "",
												"ZZ_DEPNDT_TYP"   : selectedDependents[i].ZZ_DEPE_TYPE,
												"ZZ_VISA_PLAN"    : "",
												"visibleOpen"   : false,
												"enabled"     : bEnabledVisaDependent,
												"enabledUpload"   : bEnabledVisaDependentUpload,
										};
										aData.visaExistingDependent.push(prop);
									};
								};
							} else {  //At lease one dependent has visa exist
							
								if (aData.visaExistingDependent.length != selectedDependents.length) {
									for (var i = 0; i < selectedDependents.length; i++) {
										var prop = {
												"ZZ_CURR_VISA_TYP"  : "DPND",
												"ZZ_VISA_TOCNTRY"   : aData.screenData.ZZ_DEP_TOCNTRY,
												"ZZ_VISA_FCNTRY"  : aData.screenData.ZZ_DEP_FRCNTRY,
												"ZZ_MULT_ENTRY"   : "",
												"ZZ_MULT_ENTRY_CHAR": false,
												"ZZ_VISA_EDATE"   : "",
												"ZZ_VISA_SDATE"   : "",
												"ZZ_VISA_NO"    : "",
												"ZZ_DEP_REQ"    : "",
												"ZZ_DEPNDT_TYP"   : selectedDependents[i].ZZ_DEPE_TYPE,
												"ZZ_VISA_PLAN"    : "",
												"visibleOpen"   : false,
												"enabled"     : bEnabledVisaDependent,
												"enabledUpload"   : bEnabledVisaDependentUpload,
										};
/*Start-Date change*/
										var depFound = -1;
										if ((selectedDependents[i].ZZ_VISA_EX == "X" && 
											selectedDependents[i].ZZ_PROC_BSCH == "")||
											(selectedDependents[i].ZZ_VISA_EX == "" && 
											selectedDependents[i].ZZ_PROC_BSCH == "")) {//Original:only selectedDependents[i].ZZ_VISA_EX == ""
											for(var j=aData.visaExistingDependent.length-1;j>=0;j--){
												if(selectedDependents[i].ZZ_DEPE_TYPE == aData.visaExistingDependent[j].ZZ_DEPNDT_TYP){
                                                   depFound = j;
                                                   break;                                                   
												}
											}
											if(depFound==-1)
											aData.visaExistingDependent.push(prop);
										}else{
											for(var j=aData.visaExistingDependent.length-1;j>=0;j--){
												if(selectedDependents[i].ZZ_DEPE_TYPE == aData.visaExistingDependent[j].ZZ_DEPNDT_TYP){
													aData.visaExistingDependent[j]["enabled"] = false;
													aData.visaExistingDependent[j]["enabledUpload"] = false;
												}
											}
										}
/*End-Date change*/										
									}
								}
								sap.ui.getCore().byId("panelDependentVisaCopy").setVisible(true);
							};
						} else if(globalData.currentStage == "2" &&     //Employee upload secondary document
								globalData.currentSubSet == "1_2_1"){
							if(aData.screenData.ZZ_VISA_PB){
								sap.ui.getCore().byId("panelAccomodation").setVisible(false);
							}else{
								sap.ui.getCore().byId("panelAccomodation").setVisible(true);
							}
						}

						// Modify Visa Copy Panel dependent's name
						if (aData.dependentDetail == null) {
							var ntid = "";
							if (sDeputationNo == '') {
								ntid = sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_PERNR;
							} else {
								ntid = aData.screenData.ZZ_DEP_PERNR;
							}

							var get = $.ajax({
								cache: false,
								url: sServiceUrl + "DEP_EMPSet('" + ntid + "')?$expand=EMPtoEMPDEPNDNT&$format=json",
								type: "GET"
							});
							get.fail(function(err) {
								oDeputationThis.visaCopyPanelDone.resolve();
							});
							get.done(function(data){
								for (var i = 0; i < aData.visaExistingDependent.length; i++) {
									for (var j = 0; j < data.d.EMPtoEMPDEPNDNT.results.length; j++) {
										if (data.d.EMPtoEMPDEPNDNT.results[j].ZZ_DEP_TYP == aData.visaExistingDependent[i].ZZ_DEPNDT_TYP) {
											aData.visaExistingDependent[i].ZZ_DEPNDT_TYP = data.d.EMPtoEMPDEPNDNT.results[j].ZZ_DEP_NAME + " (" +
													data.d.EMPtoEMPDEPNDNT.results[j].ZZ_DEP_TYP + ")";
											break;
										}
									}
								}
								view.getModel().setData(aData);
								oDeputationThis.visaCopyPanelDone.resolve();
							});
						} else {
							for (var i = 0; i < aData.visaExistingDependent.length; i++) {
								for (var j = 0; j < aData.dependentDetail.length; j++) {
									if (aData.dependentDetail[j].ZZ_DEP_TYP == aData.visaExistingDependent[i].ZZ_DEPNDT_TYP) {
										aData.visaExistingDependent[i].ZZ_DEPNDT_TYP = aData.dependentDetail[j].ZZ_DEP_NAME + " (" +
										aData.dependentDetail[j].ZZ_DEP_TYP + ")";
										break;
									}
								}
							}
							view.getModel().setData(aData);
							oDeputationThis.visaCopyPanelDone.resolve();
						}
					});
				};
			} catch(exc) {
				oDeputationThis.visaCopyPanelDone.resolve();
			};
		} else {
			oDeputationThis.visaCopyPanelDone.resolve();
		}
	},
	
	// This method is used to display CONFIRMATION PANEL
	displayConfirmationPanel : function() {
		try {
			var aData = view.getModel().getData();
			var globalData = sap.ui.getCore().getModel("global").getData();
			var profileData = sap.ui.getCore().getModel("profile").getData();
			if (sDeputationNo != '' && aData.screenData.ZZ_STAT_FLAG != "AA000") {
				sap.ui.getCore().byId("panelCheckYourProfile").setVisible(false);
				if (!globalData.isChange) {
					var prefix = aData.screenData.ZZ_STAT_FLAG.substring(0, 2);
					var action = aData.screenData.ZZ_STAT_FLAG.substring(2, 5);
					if (prefix != "AA") {
						if (action == "003" && oDeputationThis.currentStage == "1") {
							if (profileData.currentRole == "EMP")
							    sap.ui.getCore().byId("panelConfirmation").setVisible(true);
							else
							    sap.ui.getCore().byId("panelConfirmation").setVisible(false);
						} else {
							sap.ui.getCore().byId("panelConfirmation").setVisible(false);
						}
					} else {
						sap.ui.getCore().byId("panelConfirmation").setVisible(false);
					}
				} else {
					sap.ui.getCore().byId("panelConfirmation").setVisible(true);
				}
			} else {
				if ((aData.screenData.ZZ_STAT_FLAG == "AA000" || aData.screenData.ZZ_STAT_FLAG == "" || aData.screenData.ZZ_STAT_FLAG == null) && 
						oDeputationThis.currentStage == "1" && oDeputationThis.currentSet == "1_1") {
					sap.ui.getCore().byId("panelCheckYourProfile").setVisible(true);
					sap.ui.getCore().byId("panelCheckYourProfile").setModel(sap.ui.getCore().getModel("profile"));
					sap.ui.getCore().byId("panelConfirmation").setVisible(true);
				} else {
					sap.ui.getCore().byId("panelCheckYourProfile").setVisible(false);
					sap.ui.getCore().byId("panelConfirmation").setVisible(false);
				}
			}
		} catch(exc){}
	},
	
	// This method is used to display FAMILY ACCOMPANIED PANEL
	displayFamilyPanel: function() {
		try {
			var viewData = view.getModel().getData();
			var globalData = sap.ui.getCore().getModel("global").getData();
			if (viewData.screenData.ZZ_DEP_TYPE == "INTL" &&
					(viewData.screenData.ZZ_REQ_TYP == "DEPU" || viewData.screenData.ZZ_REQ_TYP == "") ) {
				if (globalData.currentStage == "1" && globalData.currentSet == "1_1") {
					// Radio buttons
					if (sDeputationNo == "") {
						if(viewData.screenData.ZZ_TRV_CAT == "TRFR"){
							sap.ui.getCore().byId("sponsorYesRad").setSelected(true);
							sap.ui.getCore().byId("sponsorNoRad").setSelected(false);
							
						
						}
						else if( Number(viewData.screenData.ZZ_DEP_DAYS) <= 183 && viewData.screenData.ZZ_DEP_TOCNTRY == "DE" ){
							sap.ui.getCore().byId("sponsorYesRad").setSelected(false);
							sap.ui.getCore().byId("sponsorNoRad").setSelected(true);
							//changes to family 25/08/2015
							// changes for ZZ_TRV_CAT = 'TRFR'
						}

						// end of changes to family
						else						
						if( parseInt(viewData.screenData.ZZ_DEP_DAYS) > globalData.sponsorPeriod) { //Disable sponsor parseInt(viewData.screenData.sponsor.ZZ_MAX)
							if (viewData.screenData.ZZ_SP_CMPNY == false) {
								sap.ui.getCore().byId("sponsorYesRad").setSelected(false);
								sap.ui.getCore().byId("sponsorNoRad").setSelected(true);
							} else {

								sap.ui.getCore().byId("sponsorYesRad").setSelected(true);
								sap.ui.getCore().byId("sponsorNoRad").setSelected(false);
							}
						} else {  //Enable sponsor
//							sap.ui.getCore().byId("sponsorYesRad").setSelected(false);
//							sap.ui.getCore().byId("sponsorNoRad").setSelected(true);
							//changes to family 25/08/2015
							// changes for ZZ_TRV_CAT = 'TRFR'
						if(viewData.screenData.ZZ_TRV_CAT == "TRFR"){
							sap.ui.getCore().byId("sponsorYesRad").setSelected(true);
							sap.ui.getCore().byId("sponsorNoRad").setSelected(false);
						}else{
							sap.ui.getCore().byId("sponsorYesRad").setSelected(false);
							sap.ui.getCore().byId("sponsorNoRad").setSelected(true);
						}
						// end of changes to family
						}
					} else {
						//changes to family 
//						if (viewData.screenData.ZZ_SP_CMPNY == false) {
//							sap.ui.getCore().byId("sponsorYesRad").setSelected(false);
//							sap.ui.getCore().byId("sponsorNoRad").setSelected(true);
//						} else {
//							sap.ui.getCore().byId("sponsorYesRad").setSelected(true);
//							sap.ui.getCore().byId("sponsorNoRad").setSelected(false);
//						}
						if(viewData.screenData.ZZ_TRV_CAT == "TRFR"){
							if(viewData.screenData.ZZ_ASG_TYP == "NC"){
								sap.ui.getCore().byId("sponsorYesRad").setSelected(false);
								sap.ui.getCore().byId("sponsorNoRad").setSelected(true);
							}else{
								if(viewData.screenData.ZZ_SP_CMPNY){
							sap.ui.getCore().byId("sponsorYesRad").setSelected(true);
							sap.ui.getCore().byId("sponsorNoRad").setSelected(false);
								}else{
									sap.ui.getCore().byId("sponsorYesRad").setSelected(false);
									sap.ui.getCore().byId("sponsorNoRad").setSelected(true);
								}
							}
						}else{
							//changes to family 
							if (viewData.screenData.ZZ_SP_CMPNY == false) {
								sap.ui.getCore().byId("sponsorYesRad").setSelected(false);
								sap.ui.getCore().byId("sponsorNoRad").setSelected(true);
							} else {
								sap.ui.getCore().byId("sponsorYesRad").setSelected(true);
								sap.ui.getCore().byId("sponsorNoRad").setSelected(false);
							}
						}
						
						
					}

					// Family Accompanied
					if (viewData.screenData.ZZ_TRV_CAT != "TRNG" ) {
						sap.ui.getCore().byId("flexBoxFamilyAcc").setVisible(true);
						sap.ui.getCore().byId("flexBoxFamilyJoining").setVisible(true);
						sap.ui.getCore().byId("flexBoxEligibility").setVisible(true);
						if (viewData.screenData.ZZ_FAMILY_ACCOMP == false) {
							sap.ui.getCore().byId("flexBoxTravellingMembers").setVisible(false);
							sap.ui.getCore().byId("familyAccYesRad").setSelected(false);
							sap.ui.getCore().byId("familyAccNoRad").setSelected(true);

							sap.ui.getCore().byId("flexBoxFamilyJoining").setVisible(false);
						} else {
							sap.ui.getCore().byId("flexBoxTravellingMembers").setVisible(true);
							sap.ui.getCore().byId("flexBoxTravellingMembers").setBusy(true);
							sap.ui.getCore().byId("familyAccYesRad").setSelected(true);
							sap.ui.getCore().byId("familyAccNoRad").setSelected(false);

							sap.ui.getCore().byId("flexBoxFamilyJoining").setVisible(true);
						}
						if (viewData.screenData.ZZ_FMY_JSTAT == false) {
							sap.ui.getCore().byId("joinStatusYesRad").setSelected(false);
							sap.ui.getCore().byId("joinStatusNoRad").setSelected(true);
						} else {
							sap.ui.getCore().byId("joinStatusYesRad").setSelected(true);
							sap.ui.getCore().byId("joinStatusNoRad").setSelected(false);
						}
					} else {
						sap.ui.getCore().byId("flexBoxFamilyAcc").setVisible(false);
						sap.ui.getCore().byId("flexBoxFamilyJoining").setVisible(false);
						sap.ui.getCore().byId("flexBoxTravellingMembers").setVisible(false);
						sap.ui.getCore().byId("flexBoxEligibility").setVisible(false);
					}


					// Visa exist
					if (viewData.screenData.ZZ_VISA_AEXIST == false) {
						sap.ui.getCore().byId("visaYesRad").setSelected(false);
						sap.ui.getCore().byId("visaNoRad").setSelected(true);

						sap.ui.getCore().byId("flexBoxProcessByBosch").setVisible(false);
					} else {
						sap.ui.getCore().byId("visaYesRad").setSelected(true);
						sap.ui.getCore().byId("visaNoRad").setSelected(false);

						sap.ui.getCore().byId("flexBoxProcessByBosch").setVisible(true);
					}
					if (viewData.screenData.ZZ_VISA_PB == false) {
						sap.ui.getCore().byId("pbYesRad").setSelected(false);
						sap.ui.getCore().byId("pbNoRad").setSelected(true);
					} else {
						sap.ui.getCore().byId("pbYesRad").setSelected(true);
						sap.ui.getCore().byId("pbNoRad").setSelected(false);
					}

					// Display all Travelling members
					var ntid = "";
					if (sDeputationNo == '') {
						ntid = sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_PERNR;
					} else {
						ntid = viewData.screenData.ZZ_DEP_PERNR;
					}
					
					this.setEliSponsorship(viewData);

					var get = $.ajax({
						cache: false,
						url: sServiceUrl + "DEP_EMPSet('" + ntid + "')?$expand=EMPtoEMPDEPNDNT&$format=json",
						type: "GET"
					});
					get.done(function(data){
						viewData.dependentDetail = data.d.EMPtoEMPDEPNDNT.results;
						view.getModel().setData(viewData);
						if (viewData.dependentDetail.length == 0) {
							sap.ui.getCore().byId("lblNodataAvailable").setVisible(true);
						} else {
							sap.ui.getCore().byId("lblNodataAvailable").setVisible(false);
						}
					}).then(function(data){
						// Display selected members
						var selectedDependents = viewData.selectedDependents;
						try {
							if (sDeputationNo != "") {
								var checkBoxes = sap.ui.getCore().byId("membersTravelling").getItems();
								for (var i = 0; i < checkBoxes.length; i++) {
									var checkBoxTxt = checkBoxes[i].getItems()[0].getItems()[0].getText();
									var regex = new RegExp(/\(([^)]+)\)/g);
									var dependentType = regex.exec(checkBoxTxt)[1];
									checkBoxes[i].getItems()[0].getItems()[0].setEnabled(viewData.screenData.changeDeputationDepeCheck);
									checkBoxes[i].getItems()[0].getItems()[1].setEnabled(viewData.screenData.changeDeputationDepeType);
									checkBoxes[i].getItems()[0].getItems()[2].setEnabled(viewData.screenData.changeDeputationDepeVisaExist);
									checkBoxes[i].getItems()[0].getItems()[2].setTooltip(checkBoxTxt);
/*Start-Change Return Dates*/									
									if(viewData.screenData.ZZ_DEP_TOCNTRY != "DE")
									checkBoxes[i].getItems()[0].getItems()[3].setEnabled(viewData.screenData.changeDeputationDepeVisaExist);
									else
										checkBoxes[i].getItems()[0].getItems()[3].setEnabled(false);
/*End-Change Return Dates*/									
									checkBoxes[i].getItems()[1].getItems()[0].setEnabled(viewData.screenData.changeDeputationStartDate);
									checkBoxes[i].getItems()[1].getItems()[1].setEnabled(viewData.screenData.changeDeputationReturnDate);
									for (var j = 0; j < selectedDependents.length; j++) {
										if (dependentType == selectedDependents[j].ZZ_DEPE_TYPE) {

											checkBoxes[i].getItems()[0].getItems()[0].setEnabled(viewData.screenData.changeDeputationSelDepeCheck);
											checkBoxes[i].getItems()[0].getItems()[1].setEnabled(viewData.screenData.changeDeputationSelDepeType);
											checkBoxes[i].getItems()[0].getItems()[2].setEnabled(viewData.screenData.changeDeputationSelDepeVisaExist);
/*Start-Change Return Dates*/									
											if(viewData.screenData.ZZ_DEP_TOCNTRY != "DE")
											checkBoxes[i].getItems()[0].getItems()[3].setEnabled(viewData.screenData.changeDeputationSelDepeVisaExist);
											else
												checkBoxes[i].getItems()[0].getItems()[3].setEnabled(false);
/*End-Change Return Dates*/									
											
											checkBoxes[i].getItems()[1].getItems()[0].setEnabled(viewData.screenData.changeDeputationSelStartDate);
											checkBoxes[i].getItems()[1].getItems()[1].setEnabled(viewData.screenData.changeDeputationSelReturnDate);

											checkBoxes[i].getItems()[0].getItems()[0].setChecked(true);
											checkBoxes[i].getItems()[0].getItems()[1].setSelectedKey(selectedDependents[j].ZZ_VISA_TYP);
											if (selectedDependents[j].ZZ_VISA_EX) {
												checkBoxes[i].getItems()[0].getItems()[2].setChecked(true);
/*Start-Change Return Dates*/
							                	 checkBoxes[i].getItems()[0].getItems()[3].setVisible(true);
							                     if(selectedDependents[j].ZZ_PROC_BSCH){
							                    	 checkBoxes[i].getItems()[0].getItems()[3].setChecked(true);
							                     }else{
							                    	 checkBoxes[i].getItems()[0].getItems()[3].setChecked(false);
							                     }					
/*End-Change Return Dates*/													
											} else {
												checkBoxes[i].getItems()[0].getItems()[2].setChecked(false);
												checkBoxes[i].getItems()[0].getItems()[3].setVisible(false);
											}
											// Dates
											checkBoxes[i].getItems()[1].getItems()[0].setYyyymmdd(selectedDependents[j].ZZ_DEP_STDATE);
											checkBoxes[i].getItems()[1].getItems()[1].setYyyymmdd(selectedDependents[j].ZZ_DEP_ENDATE);
											//checkBoxes[i].getItems()[1].getItems()[2].setYyyymmdd(selectedDependents[j].ZZ_DEP_DOB);
										}
									}
								}
							}
						} catch(exc) {
							sap.ui.getCore().byId("flexBoxTravellingMembers").setBusy(false);
						}

						// Display previous members
						var selectedDependents = viewData.selectedPreDependents;
						try {
							if (sDeputationNo != "") {
								var checkBoxes = sap.ui.getCore().byId("preMembersTravelling").getItems();
								for (var i = 0; i < checkBoxes.length; i++) {
									var checkBoxTxt = checkBoxes[i].getItems()[0].getItems()[0].getText();
									var regex = new RegExp(/\(([^)]+)\)/g);
									var dependentType = regex.exec(checkBoxTxt)[1];
									checkBoxes[i].getItems()[0].getItems()[0].setEnabled(false);
									checkBoxes[i].getItems()[0].getItems()[1].setEnabled(false);
									checkBoxes[i].getItems()[0].getItems()[2].setEnabled(false);
									checkBoxes[i].getItems()[0].getItems()[2].setTooltip(checkBoxTxt);
/*Start-Change Return Dates*/									
									
									checkBoxes[i].getItems()[0].getItems()[3].setEnabled(false);
/*End-Change Return Dates*/									
									
									checkBoxes[i].getItems()[1].getItems()[0].setEnabled(false);
									checkBoxes[i].getItems()[1].getItems()[1].setEnabled(false);
									for (var j = 0; j < selectedDependents.length; j++) {
										if (dependentType == selectedDependents[j].ZZ_DEPE_TYPE) {
											checkBoxes[i].getItems()[0].getItems()[0].setChecked(true);
											checkBoxes[i].getItems()[0].getItems()[1].setSelectedKey(selectedDependents[j].ZZ_VISA_TYP);
											if (selectedDependents[j].ZZ_VISA_EX) {
												checkBoxes[i].getItems()[0].getItems()[2].setChecked(true);
/*Start-Change Return Dates*/
												checkBoxes[i].getItems()[0].getItems()[3].setVisible(true);
							                     if(selectedDependents[j].ZZ_PROC_BSCH){
							                    	 checkBoxes[i].getItems()[0].getItems()[3].setChecked(true);
							                     }else{
							                    	 checkBoxes[i].getItems()[0].getItems()[3].setChecked(false);
							                     }					
/*End-Change Return Dates*/																			
											} else {
												checkBoxes[i].getItems()[0].getItems()[2].setChecked(false);
												checkBoxes[i].getItems()[0].getItems()[3].setVisible(false);
											}
											// Dates
											checkBoxes[i].getItems()[1].getItems()[0].setYyyymmdd(selectedDependents[j].ZZ_DEP_STDATE);
											checkBoxes[i].getItems()[1].getItems()[1].setYyyymmdd(selectedDependents[j].ZZ_DEP_ENDATE);
										}
									}
								}
							}
						} catch(exc) {
							sap.ui.getCore().byId("flexBoxTravellingMembers").setBusy(false);
						}
						sap.ui.getCore().byId("flexBoxTravellingMembers").setBusy(false);
					});
				}
			} else {
				if (viewData.screenData.ZZ_REQ_TYP == "DEPU") {
					try {
						sap.ui.getCore().byId("familyPanel").setVisible(false);
					} catch(exc) {}
				}
			}
		} catch(exc) {
			sap.ui.getCore().byId("familyPanel").setVisible(false);
		}
	},
/*Start-Change Return Dates*/	

		onVisaExistSelect : function(evt) {
			var viewData = view.getModel().getData();
		if (evt.getParameter("checked") && viewData.screenData.ZZ_DEP_TOCNTRY != "DE") {
			evt.getSource().getParent().getItems()[3].setVisible(true);
		} else {
			evt.getSource().getParent().getItems()[3].setVisible(false);
		}
	},
/*End-Change Return Dates*/	
	
	// Populate dynamic stages based on the current status of a request
	populateDynamicStages: function(generateTab) {
		// variables used for displaying custom controls
		var zindex = 30;
		oDeputationThis.curStagePos = 0;
		var curStage = "";
		var curSetCount = 0;
		var curSet = "";
		var curSubset = "";
		var tabKey = 1;
		var customStage = null;
		var stageItem = null;

		var viewData = view.getModel().getData();

		var globalData = {};
		if (sap.ui.getCore().getModel("global") != null) {
			globalData = sap.ui.getCore().getModel("global").getData();
		}

		// Selecting which Data from backend to be used
		var aData = [];
		if (sDeputationNo != '' && sDeputationNo != null) {
			aData = view.getModel().getData().currentStages; // This is for displaying current request
		} else {
			aData = view.getModel().getData().generalStages; // This is for creating a new deputation request
		}

		// Stage which is not started will have the status of "0"
		// Stage which is in process will have the status of "1"
		// Stage which is completed will have the status of "2"
		// Firstly, Loop through data and set current process to global model
		var curSubSet = "";
		var foundCurrentStage = false;
		for (var i = 0; i < aData.length; i++) {
			if (aData[i].ZZ_SET_STS == "1") {
				globalData.currentStage = aData[i].ZZ_STAGE;
				globalData.currentSet = aData[i].ZZ_SET;
				globalData.currentSubSet = aData[i].ZZ_SUBSET;
				foundCurrentStage = true;
				if (aData[i].ZZ_SUBSUBSET != "" && aData[i].ZZ_SUBSUBSET != "0") {
					if (aData[i].ZZ_SUBSUBSET_STS == "B") {
						globalData.currentSubSubSet = aData[i].ZZ_SUBSUBSET;
						sap.ui.getCore().getModel("global").setData(globalData);
						view.getModel().setData(viewData);
						break;
					} 
				} else {
					globalData.currentSubSubSet = "";
					sap.ui.getCore().getModel("global").setData(globalData);
					view.getModel().setData(viewData);
					break;
				}
			}
		}
		// If no current stage (status 1) found, then display the last stage
		if (foundCurrentStage == false) {
			try {
				globalData.currentStage = aData[aData.length - 1].ZZ_STAGE;
				globalData.currentSet = aData[aData.length - 1].ZZ_SET;
				globalData.currentSubSet = aData[aData.length - 1].ZZ_SUBSET;
			} catch(exc) {}
		}

		// This will store the current stage in the backend
		oDeputationThis.currentStage = globalData.currentStage;
		oDeputationThis.currentSet = globalData.currentSet;
		oDeputationThis.currentSubSet = globalData.currentSubSet;
		oDeputationThis.currentSubSubSet = globalData.currentSubSubSet;


		// Secondly, populating all the available stages
		for (var i = 0; i < aData.length; i++) {
			// Display Stages on top
			if (aData[i].ZZ_STAGE != curStage) {
				customStage = new sap.ui.project.e2etm.controls.customStage({
					stage : 'Stage' + aData[i].ZZ_STAGE,
					zindex : zindex,
					status : "PROCESS",
				});
				customStage.addStyleClass('margin_left_minus8');
				curStage = aData[i].ZZ_STAGE;
			}
			// Display Set Items which are placed below the stage
			if (aData[i].ZZ_SET != curSet) {
				stageItem = new sap.ui.project.e2etm.controls.stageItem("_" + aData[i].ZZ_STAGE + "_" + aData[i].ZZ_SET, {
					stage    : aData[i].ZZ_STAGE,
					item   : aData[i].ZZ_SET,
					itemName : aData[i].ZZ_SETD,
					status   : aData[i].ZZ_SET_STS,
					zindex   : zindex,
					press    : function(evt) {
						if (evt.getSource().getStatus() == "2") {
							// Display tabs that are done consider edit mode
							evt.getSource().getParent().removeSetAllIsSelectedProperty();
							evt.getSource().setIsSelected("X");
							oDeputationThis.displaySelectedStageItem(this.mProperties.stage, this.mProperties.item, true);
						} else if (evt.getSource().getStatus() == "1") {
							// Display tabs that are processed consider edit mode
							evt.getSource().getParent().removeSetAllIsSelectedProperty();
							evt.getSource().setIsSelected("X");
							oDeputationThis.displaySelectedStageItem(this.mProperties.stage, this.mProperties.item, true);
						} else {
							sap.ca.ui.message.showMessageBox({
								type: sap.ca.ui.message.Type.ERROR,
								message: "You cannot directly view this step",
								details: "Please complete the current step!."
							});
						}
					}
				});
				zindex = zindex - 1;
				curSet = aData[i].ZZ_SET;
				curSetCount++;
				if (aData[i].ZZ_SET_STS == "1") {
					stageItem.setIsSelected("X");
				} else {
					stageItem.setIsSelected("");
				}
				customStage.addItem(stageItem);
			}

			zindex = zindex - 1;
			view.byId('carouselProcessFlow').addContent(customStage);
		}

		// This is to calculate the stages and insert the end of stage
		if (curSetCount > 0) {
			view.byId('carouselProcessFlow').addContent(new sap.m.Label({
				text: "END OF STAGE",
			}).addStyleClass("theendstatus"));
		}

		// Saying that this method has been done
		oDeputationThis.stageDeferred.resolve();
	},
	// Remove the current selected arrow at the PROCESS FLOW area and 
	// reset the IsSelected Property of the custom control StageItem
	resetAllTheStageSelectedSymbol : function() {
		for (var i = 0; i < view.byId("carouselProcessFlow").getContent().length; i++) {
			try {
				view.byId("carouselProcessFlow").getContent()[i].removeSetAllIsSelectedProperty();
			} catch(exc) {
				continue;
			}
			for (var j = 0; j < view.byId("carouselProcessFlow").getContent()[i].getItems().length; j++) {
				view.byId("carouselProcessFlow").getContent()[i].getItems()[j].setIsSelected("");
			}
		}
	},
	// Set the isSelected property of the current screen set
	setSelectedSymbol : function(zz_stage, zz_set) {
		var stageItem = sap.ui.getCore().byId("_" + zz_stage + "_" + zz_set);
		stageItem.getParent().removeSetAllIsSelectedProperty();
		stageItem.setIsSelected("X");
	},
	// This method is used to display all possible panels from one stage
	displaySelectedStageItem : function(zz_stage, zz_set, userClicked) {
		try {
			oDeputationThis.curStagePos = zz_stage;
			oDeputationThis.travelDeffered = $.Deferred(); // Check if Travel Plan controller is initiated or not

			// Selecting which Data from backend to be used
			var viewData = view.getModel().getData();
			var depType = viewData.screenData.ZZ_DEP_TYPE;
			var curSubset = "";
			var tabKey = 1;
			var globalData = sap.ui.getCore().getModel("global").getData();
			var aData = [];
			if (sDeputationNo != '' && sDeputationNo != null) {
				aData = view.getModel().getData().currentStages; // This is for displaying current request
			} else {
				aData = view.getModel().getData().generalStages; // This is for creating a new deputation request
			}

			// If current Stage is same, don't display
			if (sap.ui.getCore().getModel("global").getData().currentSet == zz_set && userClicked == true &&
					sap.ui.getCore().getModel("global").getData().currentStage == zz_stage ) {
				return;
			}

			// Destroy all tabs first
			sap.ui.project.e2etm.util.StaticUtility.setBusy(true,oHomeThis);
			oDeputationThis.iconTab.setVisible(false);
			try {
				sap.ui.getCore().byId("UploadVisaDependent").destroy();
			} catch(exc) {}
			oDeputationThis.iconTab.destroyItems();

			// Stage which is not started will have the status of "0"
			// Stage which is in process will have the status of "1"
			// Stage which is completed will have the status of "2"
			// Firstly, Loop through data and set current process to global model
			for (var i = 0; i < aData.length; i++) {
				// Only process if selected item is matched
				if (aData[i].ZZ_SET == zz_set && aData[i].ZZ_STAGE == zz_stage) {
					// This means that in-progress Set has been selected
					if (aData[i].ZZ_SET_STS == "1") {
						globalData.currentStage = aData[i].ZZ_STAGE;
						globalData.currentSet = aData[i].ZZ_SET;
						globalData.currentSubSet = aData[i].ZZ_SUBSET;
						sap.ui.getCore().getModel("global").setData(globalData);
						break;
					} 
					// This means that completed Set has been selected
					else if (aData[i].ZZ_SET_STS == "2") {
						globalData.currentStage = aData[i].ZZ_STAGE;
						globalData.currentSet = aData[i].ZZ_SET;
						globalData.currentSubSet = aData[i].ZZ_SUBSET;
						sap.ui.getCore().getModel("global").setData(globalData);
						break;
					}
				}
			}

			// Loop through it and display custom stage control
			for (var i = 0; i < aData.length; i++) {
				// Only process if selected item is matched
				if (aData[i].ZZ_SET == zz_set && aData[i].ZZ_STAGE == zz_stage) {
					// Generate tab from screen
					if (aData[i].ZZ_SUBSET != curSubset) {
						var iconTabFilter = new sap.m.IconTabFilter({
							key     : tabKey, 
							text    : aData[i].ZZ_SUBSETD, 
						});
						try {
							var fragment;
							if( viewData.screenData.ZZ_REQ_TYP ==  "BUSR" ||
									viewData.screenData.ZZ_REQ_TYP == "SECO" ||
									viewData.screenData.ZZ_REQ_TYP == "HOME" ||
									viewData.screenData.ZZ_REQ_TYP == "EMER" ||
									viewData.screenData.ZZ_REQ_TYP == "INFO") {
								if (viewData.screenData.ZZ_DEP_TYPE == "BGEN") {
									fragment = new sap.ui.xmlfragment("sap.ui.project.e2etm.fragment.deputation.BUSR." 
											+ "DOME" + "." + aData[i].ZZ_STAGE + "."
											+ aData[i].ZZ_SUBSET , oDeputationThis); // here the Fragment is instantiated
								} else {
									fragment = new sap.ui.xmlfragment("sap.ui.project.e2etm.fragment.deputation.BUSR." 
											+ "INTL" + "." + aData[i].ZZ_STAGE + "."
											+ aData[i].ZZ_SUBSET , oDeputationThis); // here the Fragment is instantiated
								}
							}else{
								fragment = new sap.ui.xmlfragment("sap.ui.project.e2etm.fragment.deputation.DEPU." 
										+ depType + "." + aData[i].ZZ_STAGE + "."
										+ aData[i].ZZ_SUBSET , oDeputationThis); // here the Fragment is instantiated 
							}
							iconTabFilter.addContent(fragment);
							curSubset = aData[i].ZZ_SUBSET;
							oDeputationThis.iconTab.addItem(iconTabFilter);
							tabKey = tabKey + 1;
						} catch(exc) {
							curSubset = aData[i].ZZ_SUBSET;
							continue;
						}
					}
					// Display Subsubset items of permits and approval
					try {
						if (aData[i].ZZ_SUBSUBSET != "0") {
							var panel = new sap.ui.commons.Panel({
								text : aData[i].ZZ_SUBSUBSETD,
								collapsed: true
							});
							var text = "Not maintained";
							var lastNumber = parseInt(aData[i].ZZ_SUBSUBSET.substring(aData[i].ZZ_SUBSUBSET.length - 1, aData[i].ZZ_SUBSUBSET.length)) - 1;
							if (aData[i].ZZ_SUBSUBSET_STS == "A") {
								text = "This step is pending";
								panel.addStyleClass("orange_collapse_background");
							} else if (aData[i].ZZ_SUBSUBSET_STS == "B") {
								text = "This step is pending";
								panel.addStyleClass("orange_collapse_background");
							} else if (aData[i].ZZ_SUBSUBSET_STS == "C") {
								text = "This step is completed";
								panel.addStyleClass("green_collapse_background");
							} else if (aData[i].ZZ_SUBSUBSET_STS == "D") {
								text = "This step is rejected";
								panel.addStyleClass("red_collapse_background");
							} else if (aData[i].ZZ_SUBSUBSET_STS == "E") {
								text = "This step is sent back";
								panel.addStyleClass("yellow_collapse_background");
							} else {
								text = "This step is pending";
								panel.addStyleClass("orange_collapse_background");
							}
							panel.addContent(new sap.ui.commons.TextView({
								text: text,
							}));
							oDeputationThis.iconTab.getItems()[0].getContent()[0].getItems()[1].addContent(panel);
						}
					} catch(exc) {
						var a = 0;
					}
				}
			}

			// Invisible the tab bar if only one tab available
			if (oDeputationThis.iconTab.getItems().length == 1) {
				oDeputationThis.iconTab.addStyleClass("hidden_visibility");
			} else {
				oDeputationThis.iconTab.removeStyleClass("hidden_visibility");
			}

			// Display the last screen if no blue set avaialable
			if (oDeputationThis.iconTab.getItems().length == 0) {
				try {
					var iconTabFilter = new sap.m.IconTabFilter({
						key     : 1, 
						text    : aData[aData.length-1].ZZ_SUBSETD, 
					});
					var fragment;
					if( viewData.screenData.ZZ_REQ_TYP ==  "BUSR" ||
							viewData.screenData.ZZ_REQ_TYP == "SECO" ||
							viewData.screenData.ZZ_REQ_TYP == "HOME" ||
							viewData.screenData.ZZ_REQ_TYP == "EMER" ||
							viewData.screenData.ZZ_REQ_TYP == "INFO"){
						fragment = new sap.ui.xmlfragment("sap.ui.project.e2etm.fragment.deputation.BUSR." 
								+ viewData.screenData.ZZ_DEP_TYPE + "." + aData[aData.length-1].ZZ_STAGE + "."
								+ aData[aData.length-1].ZZ_SUBSET , oDeputationThis); // here the Fragment is instantiated
					}else{
						fragment = new sap.ui.xmlfragment("sap.ui.project.e2etm.fragment.deputation.DEPU." 
								+ viewData.screenData.ZZ_DEP_TYPE + "." + aData[aData.length-1].ZZ_STAGE + "."
								+ aData[aData.length-1].ZZ_SUBSET , oDeputationThis); // here the Fragment is instantiated
					}
					iconTabFilter.addContent(fragment);
					oDeputationThis.iconTab.addItem(iconTabFilter);

					globalData.currentStage = aData[aData.length-1].ZZ_STAGE;
					globalData.currentSet = aData[aData.length-1].ZZ_SET;
					globalData.currentSubSet = aData[aData.length-1].ZZ_SUBSET;
					// Display Subsubset items which are status within a screen
					var lastSet = aData[aData.length-1].ZZ_SET;
					for (var i = 0; i < aData.length; i++) {
						if (aData[i].ZZ_SET == lastSet) {
							var panel = new sap.ui.commons.Panel({
								text : aData[i].ZZ_SUBSUBSETD,
								collapsed: true
							});
							panel.addContent(new sap.ui.commons.TextView({
								text: aData[i].ZZ_SUBSUBSET,
							}));
							try {
								if (aData[i].ZZ_SUBSUBSET != "0") {
									var lastNumber = parseInt(aData[i].ZZ_SUBSUBSET.substring(aData[i].ZZ_SUBSUBSET.length - 1, aData[i].ZZ_SUBSUBSET.length)) - 1;
									if (aData[i].ZZ_SUBSUBSET_STS == "A") {
										panel.addStyleClass("orange_collapse_background");
										panel.setTooltip("This step is pending");
									} else if (aData[i].ZZ_SUBSUBSET_STS == "B") {
										panel.addStyleClass("orange_collapse_background");
										panel.setTooltip("This step is pending");
									} else if (aData[i].ZZ_SUBSUBSET_STS == "C") {
										panel.addStyleClass("green_collapse_background");
										panel.setTooltip("This step is completed");
									} else if (aData[i].ZZ_SUBSUBSET_STS == "D") {
										panel.addStyleClass("red_collapse_background");
										panel.setTooltip("This step is rejected");
									} else if (aData[i].ZZ_SUBSUBSET_STS == "E") {
										panel.addStyleClass("yellow_collapse_background");
										panel.setTooltip("This step is sent back");
									} else {
										panel.addStyleClass("orange_collapse_background");
										panel.setTooltip("This step is pending");
									}
									oDeputationThis.iconTab.getItems()[0].getContent()[0].getItems()[1].addContent(panel);
								}
							} catch(exc) {}
						}
					}
				} catch(exc) {}
			}

			view.byId('flexBoxProcess').setVisible(true);

			oDeputationThis.iconTab.setSelectedKey("1");
			oDeputationThis.iconTab.setVisible(true);

			// Clear all the selected Item symbol
			try {
				oDeputationThis.resetAllTheStageSelectedSymbol();
				oDeputationThis.setSelectedSymbol(zz_stage, zz_set);
			} catch(exc) {}

			// Display document upload
			oDeputationThis.displayUpload();

			// Display appropriate Elements
			oDeputationThis.displayConfirmationPanel();

			// Display all dependents value
			oDeputationThis.displayFamilyPanel();

			// Display requisition form for domestic transfer
			oDeputationThis.displayDomesticTransferRequisitionForm();
			
			// Display contract letter
			oDeputationThis.displayContractLetter();
			
			//Display Allowance Letters
			oDeputationThis.displayAllowanceLetters();

			// Display COC
			oDeputationThis.displayCOC();

			// Display invitation letter
			oDeputationThis.displayInvitationLetter();

			// Display Visa copy panel
			oDeputationThis.displayVisaCopyPanel();

			// Display cancel text if request is sent for cancelation
			oDeputationThis.displayBreadcrumbText();

			// Set editable fields
			oDeputationThis.setEditableFields();

			// Display Document
			oDeputationThis.displayDocuments();

			// Display Templates
			oDeputationThis.displayTemplates();

			// Visible buttons accordingly
			oDeputationThis.displayFooterButtons();
			oDeputationThis.stageDeferred = $.Deferred();

			// Set selected tab
			oDeputationThis.iconTab.setVisible(true);
			// Scroll the Stage control to current stage
			// Set first item to be visible in the carousel
			view.byId('carouselProcessFlow').setFirstVisibleIndex(parseInt(oDeputationThis.curStagePos) - 1);
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
		} catch(exc) {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
		}
	},

	// This method is used to read details of a request which can be a deputation request, 
	// travel request or visa request
	readRequest: function() {
		var globalData = sap.ui.getCore().getModel("global").getData();
		var aData = view.getModel().getData();

		// If the request is about to be created then go inside this if block
		// Only creation of new deputation, business request will go inside this block
		if (sDeputationNo == '') {
			var stageReq = "";

			// preparing service url for the initial stages of new request
			if (aData.screenData.ZZ_REQ_TYP == "BUSR" || aData.screenData.ZZ_REQ_TYP == "SECO" ||
				aData.screenData.ZZ_REQ_TYP == "EMER" || aData.screenData.ZZ_REQ_TYP == "HOME" ||
				aData.screenData.ZZ_REQ_TYP == "INFO") {   //Travel Request
				if (aData.screenData.ZZ_DEP_TYPE == "DOME") {
					stageReq = sServiceUrl + "ZE2E_WF_SATGESet?$filter=ZZ_MODID eq '" + aData.screenData.ZZ_REQ_TYP + 
					"' and ZZ_SMODID eq 'DOME' and ZZ_CATID eq '*'&$format=json";
				} else {
					stageReq = sServiceUrl + "ZE2E_WF_SATGESet?$filter=ZZ_MODID eq '" + aData.screenData.ZZ_REQ_TYP + 
					"' and ZZ_SMODID eq 'INTL' and ZZ_CATID eq '*'&$format=json";
				}
			} else {                      //Deputation Request
				if (aData.screenData.ZZ_DEP_TYPE == "DOME") {
					stageReq = sServiceUrl + "ZE2E_WF_SATGESet?$filter=ZZ_MODID eq 'DEPU' and ZZ_SMODID eq 'DOME' and ZZ_CATID eq '*'&$format=json";
				} else {
					stageReq = sServiceUrl + "ZE2E_WF_SATGESet?$filter=ZZ_MODID eq 'DEPU' and ZZ_SMODID eq 'INTL' and ZZ_CATID eq '*'&$format=json";
				}
			}

			// Calling service to get the intial stages of new request based on Domestic or International
			if (aData.screenData.ZZ_DEP_TYPE == "DOME") {
				$.when($.ajax({cache: false,url:stageReq})).done(function(stageReqData){
					var aData = view.getModel().getData();
					// Getting the general stages from backend
					aData.generalStages = stageReqData.d.results;
					aData.screenData.isApproved = false;
					aData.visaType = sap.ui.getCore().getModel("global").getData().visaType.slice();
					for(var i = aData.visaType.length - 1; i >= 0; i--) {
						if(aData.visaType[i].ZZ_ZZ_SMODID != aData.screenData.ZZ_DEP_TYPE) {
							aData.visaType.splice(i, 1);
						}
					}
					// Saying that this method has been done
					oDeputationThis.readDepDeferred.resolve();
				}).fail(function(err) {
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
					sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
				});
			} else {
				var sSponsor = sServiceUrl + "Cmpny_Sp_days?ZZ_CATID='*'&ZZ_MODID='DEPU'&ZZ_SMODID='" + aData.screenData.ZZ_DEP_TYPE + "'&$format=json";
				$.when($.ajax({cache: false,url:stageReq}),$.ajax({cache: false,url:sSponsor})).done(function(stageReqData,sSponsor){
					var aData = view.getModel().getData();
					// Getting the general stages from backend
					aData.generalStages = stageReqData[0].d.results;
					aData.screenData.sponsor = sSponsor[0].d.results[0];
					aData.screenData.isApproved = false;
					aData.visaType = sap.ui.getCore().getModel("global").getData().visaType.slice();
					for(var i = aData.visaType.length - 1; i >= 0; i--) {
						if(aData.visaType[i].ZZ_ZZ_SMODID != aData.screenData.ZZ_DEP_TYPE) {
							aData.visaType.splice(i, 1);
						}
					}
					// Saying that this method has been done
					oDeputationThis.readDepDeferred.resolve();
				}).fail(function(err) {
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
					sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
				});
			}
		} else {    // This block of code will be used for reading an existing request
			var getDeputation = "";
			if (sap.ui.getCore().getModel("global").getData().ZZ_REQ_TYP == "BUSR" ||
					sap.ui.getCore().getModel("global").getData().ZZ_REQ_TYP == "SECO" ||
					sap.ui.getCore().getModel("global").getData().ZZ_REQ_TYP == "HOME" ||
					sap.ui.getCore().getModel("global").getData().ZZ_REQ_TYP == "EMER" ||
					sap.ui.getCore().getModel("global").getData().ZZ_REQ_TYP == "INFO") {

				if (sap.ui.getCore().getModel("global").getData().ZZ_REQ_TYP == "BUSR") {   // Business travel
					var stagReq = sServiceUrl + "ZE2E_WF_SATGESet?$filter=ZZ_MODID eq '" + 
					sap.ui.getCore().getModel("global").getData().ZZ_REQ_TYP + "' and " +
					"ZZ_SMODID eq '" + sap.ui.getCore().getModel("global").getData().ZZ_DEP_TYPE + "' and ZZ_CATID eq '' and " +
					"ZZ_DEP_REQ eq '" + sDeputationNo + "'&$format=json";
				} else {      // Secondary, home, emergency, info trip
					if (sap.ui.getCore().getModel("global").getData().isCreate == true) {
						var stagReq = sServiceUrl + "ZE2E_WF_SATGESet?$filter=ZZ_MODID eq '" + 
						sap.ui.getCore().getModel("global").getData().ZZ_REQ_TYP + 
						"' and ZZ_SMODID eq '" + sap.ui.getCore().getModel("global").getData().ZZ_DEP_TYPE + "' and ZZ_CATID eq '*'&$format=json";
					} else {
						var stagReq = sServiceUrl + "ZE2E_WF_SATGESet?$filter=ZZ_MODID eq '" + 
						sap.ui.getCore().getModel("global").getData().ZZ_REQ_TYP + "' " +
						"and ZZ_SMODID eq '" + sap.ui.getCore().getModel("global").getData().ZZ_DEP_TYPE + "' and ZZ_CATID eq '' and ZZ_DEP_REQ eq '" + sDeputationNo + "'&$format=json";
						getDeputation = sServiceUrl + "GetDepReq?ZZ_REINR='" + sDeputationNo + "'&ZZ_TTYPE='" + 
						sap.ui.getCore().getModel("global").getData().ZZ_REQ_TYP+ "'&$format=json";
					}
				}
				$.when($.ajax({cache: false,url:stagReq}), $.ajax({cache: false,url:getDeputation})).done(function(stagReqData, depReqData){
					// Getting the stages from backend
					aData.currentStages = stagReqData[0].d.results;
					view.getModel().setData(aData);
					oDeputationThis.readDepDeferred.resolve();
					try {
						oDeputationThis.mainDeputationRequest = depReqData[0].d.results[0].ZZ_DEP_REQ;
					} catch(exc) {}
				});
				return;
			}

			// Getting the details of an existing deputation request including the stage
			var get = $.ajax({
				cache: false,
				url: sServiceUrl + "DEP_HDR_INFOSet(ZZ_DEP_REQ='" + sDeputationNo + "',ZZ_VERSION='')?$expand=HDR_ITEM&$format=json",
				type: "GET"
			});
			get.done(function(data, header, response) {
				eTag = response.getResponseHeader("etag");
				if (eTag == "W/\"''\"" || eTag == "W/\"'0.0000000%20'\"") {
					eTag = "*";
				}
				view.getController().displayDeputationHeader(data.d); // Display Deputation header data from back-end to front-end
				view.getController().displayDeputationItem(data.d); // Display Deputation item data from back-end to front-end
				eForm = jQuery.extend({}, aData.screenData);

				// Getting deputation stages and sponsor by company check
				var depMODID = "DEPU";
				if (aData.screenData.ZZ_REQ_TYP == "BUSR") {
					depMODID = aData.screenData.ZZ_REQ_TYP;
				}
				var depSMODID = data.d.ZZ_DEP_TYPE;
				var stagReq = sServiceUrl + "ZE2E_WF_SATGESet?$filter=ZZ_MODID eq '" + depMODID + "' and " +
				"ZZ_SMODID eq '" + depSMODID + "' and ZZ_CATID eq '" + data.d.ZZ_DEP_SUB_TYPE + "' and " +
				"ZZ_DEP_REQ eq '" + sDeputationNo + "'&$format=json";
				var sSponsor = sServiceUrl + "Cmpny_Sp_days?ZZ_CATID='*'&ZZ_MODID='DEPU'&ZZ_SMODID='" + 
				aData.screenData.ZZ_DEP_TYPE + "'&$format=json";
				var asgModel = sServiceUrl + "AssignmentSet?$filter=ZZ_SMODID eq '" + aData.screenData.ZZ_DEP_TYPE  + "' and ZZ_DEP_REQ eq '" +
				aData.screenData.ZZ_DEP_REQ + "'&$format=json";

				$.when($.ajax({cache: false,url:stagReq}),$.ajax({cache: false,url:sSponsor}),
						$.ajax({cache: false,url:asgModel})).done(function(stagReqData,sSponsorData,asgModelData){
							// Getting the stages from backend
							aData.currentStages = stagReqData[0].d.results;

							// Getting the number of days to determine sponsor by company
							aData.screenData.sponsor = sSponsorData[0].d.results[0];

							// Setting values to dropdownlist
							aData.serviceType = sap.ui.getCore().getModel("global").getData().serviceType;
							aData.purpose = sap.ui.getCore().getModel("global").getData().purpose;
							aData.subType = sap.ui.getCore().getModel("global").getData().subtype;
							aData.assModel = asgModelData[0].d.results;
							aData.visaType = sap.ui.getCore().getModel("global").getData().visaType.slice();
							for (var i = aData.visaType.length - 1; i >= 0; i--) {
								if (aData.visaType[i].ZZ_ZZ_SMODID != aData.screenData.ZZ_DEP_TYPE) {
									aData.visaType.splice(i, 1);
								}
							}
							view.getModel().setData(aData);
							oDeputationThis.readDepDeferred.resolve();
						});
			});
		}

	},
	setEliSponsorship:function(aData){
		if(aData.screenData.ZZ_DEP_TOCNTRY == "KR" && aData.screenData.ZZ_TRV_CAT == "WRKP"){
			aData.screenData.isSTAandDE = false;
			if(aData.screenData.ZZ_DEP_DAYS >=360){
				sap.ui.getCore().byId("sponsorYesRad").setSelected(true);			
			}else{				
				sap.ui.getCore().byId("sponsorNoRad").setSelected(true);
			}
		}
	},
	// This method is used to display deputation header data onto the screen
	displayDeputationHeader: function(aInput) {
		var aData = view.getModel().getData();
		aData.screenData.ZZ_NEXT_APPROVER = aInput.ZZ_NEXT_APPROVER;
		aData.screenData.ZZ_MENTOR_NO = aInput.ZZ_MENTOR_NO;
		aData.screenData.ZZ_MENTOR_NAME = aInput.ZZ_MENTOR_NAME;
		aData.screenData.ZZ_DEP_DOB = aInput.ZZ_DEP_DOB;
		aData.screenData.ZZ_DEP_DOJ = aInput.ZZ_DEP_DOJ;
		aData.screenData.ZZ_DEP_LEVEL = aInput.ZZ_DEP_LEVEL;
		aData.screenData.ZZ_SUR_NAME = aInput.ZZ_SUR_NAME;
		aData.screenData.ZZ_GIVEN_NAME = aInput.ZZ_GIVEN_NAME;
		
		aData.screenData.ZZ_ACTION_MOD = aInput.ZZ_ACTION_MOD;
		aData.screenData.ZZ_DEP_PERNR = aInput.ZZ_DEP_PERNR;
		aData.screenData.ZZ_VERSION = aInput.ZZ_VERSION;
		aData.screenData.ZZ_VREASON = aInput.ZZ_VREASON;
		aData.screenData.ZZ_REQ_TYP = aInput.ZZ_REQ_TYP;
		aData.screenData.ZZ_TIMESTAMP = aInput.ZZ_TIMESTAMP;
		/*Start-Third Party Customer Details*/
		aData.screenData.ZZ_3PARTY_CUST = aInput.ZZ_3PARTY_CUST;	
		/*End-Third Party Customer Details*/		
		//Deputation tab
		aData.screenData.ZZ_DEP_TYPE = aInput.ZZ_DEP_TYPE;
		aData.screenData.ZZ_SH_STATUS = aInput.ZZ_SH_STATUS;
		aData.screenData.ZZ_BEGDA = aInput.ZZ_BEGDA;
		if (aData.screenData.ZZ_DEP_TYPE == "INTL") {
			aData.selfVisa = {
					"ZZ_CURR_VISA_TYP"  : "BUSR",
					"ZZ_VISA_TOCNTRY"   : aInput.ZZ_DEP_TOCNTRY,
					"ZZ_VISA_FCNTRY"  : aInput.ZZ_DEP_FRCNTRY,
					"ZZ_MULT_ENTRY"   : "",
					"ZZ_MULT_ENTRY_CHAR": false,
					"ZZ_VISA_EDATE"   : "",
					"ZZ_VISA_SDATE"   : "",
					"ZZ_OFFC_ADDRESS"   : "",
					"ZZ_VISA_NO"    : "",
					"ZZ_DEP_REQ"    : aInput.ZZ_DEP_REQ,
					"ZZ_VISA_PLAN"    : aInput.ZZ_VISA_PLAN,
			};
			aData.visaExistingDependent = [];
			aData.screenData.ZZ_INS_EX = aInput.ZZ_INS_EX;
			aData.screenData.ZZ_COC_EX = aInput.ZZ_COC_EX;
			aData.screenData.ZZ_VISA_EX = aInput.ZZ_VISA_EX;
			aData.screenData.ZZ_TCKT_EX = aInput.ZZ_TCKT_EX;

			aData.screenData.ZZ_FSTL = aInput.ZZ_FSTL;
			aData.screenData.ZZ_GEBER = aInput.ZZ_GEBER;

			if (aInput.ZZ_MIN_WAGE == "") {
				aData.screenData.ZZ_MIN_WAGE = "NO";
			} else {
				aData.screenData.ZZ_MIN_WAGE = "YES";
			}
			aData.screenData.ZZ_DEP_TEDATE = aInput.ZZ_DEP_TEDATE;
			// Estimated date
			aData.screenData.ZZ_DEP_TEDATE_VALUE = new Date(aData.screenData.ZZ_DEP_TEDATE.substr(0, 4), 
					aData.screenData.ZZ_DEP_TEDATE.substr(4, 2) - 1, 
					aData.screenData.ZZ_DEP_TEDATE.substr(6, 2));
		}

		if (aInput.ZZ_TRV_PUR == "" || aInput.ZZ_TRV_PUR == null) {
			aData.screenData.isApproved = false;
		} else {
			aData.screenData.isApproved = true;
		}

		aData.screenData.ZZ_TTYPE = aInput.ZZ_TTYPE;

		aData.screenData.ZZ_SRVTYP_MONTHS = aInput.ZZ_SRVTYP_MONTHS;
		aData.screenData.ZZ_TRV_PUR = aInput.ZZ_TRV_PUR;
		aData.screenData.ZZ_SERV_TYP = aInput.ZZ_SERV_TYP;
		aData.screenData.ZZ_DEP_TYPE_TXT = aInput.ZZ_DEP_TYPE_TXT;
		aData.screenData.ZZ_DEP_SUB_TYPE = aInput.ZZ_DEP_SUB_TYPE;
		aData.screenData.ZZ_DEP_EMAIL = aInput.ZZ_DEP_EMAIL;
		aData.screenData.ZZ_RSN_TRV = aInput.ZZ_RSN_TRV;
		aData.screenData.ZZ_DEP_FRCNTRY = aInput.ZZ_DEP_FRCNTRY;
		aData.screenData.ZZ_DEP_FRCNTRY_TXT = aInput.ZZ_DEP_FRCNTRY_TXT;

		aData.screenData.ZZ_DEP_TOCNTRY = aInput.ZZ_DEP_TOCNTRY;
		aData.screenData.ZZ_DEP_TOCNTRY_TXT = aInput.ZZ_DEP_TOCNTRY_TXT;

		aData.screenData.ZZ_DEP_FRMLOC = aInput.ZZ_DEP_FRMLOC;
		aData.screenData.ZZ_DEP_FRMLOC_TXT = aInput.ZZ_DEP_FRMLOC_TXT;

		aData.screenData.ZZ_DEP_TOLOC = aInput.ZZ_DEP_TOLOC;
		aData.screenData.ZZ_DEP_TOLOC_TXT = aInput.ZZ_DEP_TOLOC_TXT;

		if( aInput.ZZ_DEP_STDATE != '00000000'){
			aData.screenData.ZZ_DEP_STDATE = aInput.ZZ_DEP_STDATE;
		}
		if( aInput.ZZ_DEP_ENDATE != '00000000'){
			aData.screenData.ZZ_DEP_ENDATE = aInput.ZZ_DEP_ENDATE;
		}

		aData.screenData.ZZ_DEP_STDATE_VALUE = new Date(aData.screenData.ZZ_DEP_STDATE.substr(0, 4), 
				aData.screenData.ZZ_DEP_STDATE.substr(4, 2) - 1, 
				aData.screenData.ZZ_DEP_STDATE.substr(6, 2));
		aData.screenData.ZZ_DEP_ENDATE_VALUE = new Date(aData.screenData.ZZ_DEP_ENDATE.substr(0, 4), 
				aData.screenData.ZZ_DEP_ENDATE.substr(4, 2) - 1, 
				aData.screenData.ZZ_DEP_ENDATE.substr(6, 2));

		// Store start date and end date for change process 
		oDeputationThis.currentStDate = aData.screenData.ZZ_DEP_STDATE;
		oDeputationThis.currentEDate = aData.screenData.ZZ_DEP_ENDATE;

		aData.screenData.ZZ_DEP_DAYS = aInput.ZZ_DEP_DAYS;
		aData.screenData.ZZ_COMMENTS = aInput.ZZ_COMMENTS;
		if (aInput.ZZ_SP_CMPNY == "") {
			aData.screenData.ZZ_SP_CMPNY = false;
		} else {
			aData.screenData.ZZ_SP_CMPNY = true;
		}
		if (aInput.ZZ_FAMILY_ACCOMP == "") {
			aData.screenData.ZZ_FAMILY_ACCOMP = false;
		} else {
			aData.screenData.ZZ_FAMILY_ACCOMP = true;
		}
		if (aInput.ZZ_FMY_JSTAT == "") {
			aData.screenData.ZZ_FMY_JSTAT = false;
		} else {
			aData.screenData.ZZ_FMY_JSTAT = true;
		}
		if (aInput.ZZ_VISA_AEXIST == "") {
			aData.screenData.ZZ_VISA_AEXIST = false;
		} else {
			aData.screenData.ZZ_VISA_AEXIST = true;
		}
		if (aInput.ZZ_VISA_PB == "") {
			aData.screenData.ZZ_VISA_PB = false;
		} else {
			aData.screenData.ZZ_VISA_PB = true;
		}

		aData.screenData.ZZ_STAT_FLAG = aInput.ZZ_STAT_FLAG;
		aData.screenData.ZZ_DEP_NTID = aInput.ZZ_DEP_NTID;
		aData.screenData.ZZ_TRV_REQ = aInput.ZZ_TRV_REQ;

		// Customer tab
		aData.screenData.ZZ_CUST_NAME = aInput.ZZ_CUST_NAME;

		// Confirmation
		if (aInput.ZZ_CONFIRM_FLAG == "X") {
			aData.screenData.ZZ_CONFIRM_FLAG = true;
		} else {
			aData.screenData.ZZ_CONFIRM_FLAG = false;
		}

		// Assignment Model
		aData.screenData.ZZ_ASG_TYP = aInput.ZZ_ASG_TYP;
		if (aData.screenData.ZZ_ASG_TYP == "TRFR") {
			aData.screenData.ZZ_TR_RSN = aInput.ZZ_TR_RSN;
		}

		// Visa Plan Number
		aData.screenData.ZZ_VISA_PLAN = aInput.ZZ_VISA_PLAN;
		aData.screenData.ZZ_TRV_CAT = aInput.ZZ_TRV_CAT;

		// COC dates and Number
		if (aInput.ZZ_COC_STDATE != "00000000") {
			aData.screenData.ZZ_COC_STDATE = aInput.ZZ_COC_STDATE;
			aData.screenData.ZZ_COC_STDATE_VALUE = new Date(aData.screenData.ZZ_COC_STDATE.substr(0, 4), 
					aData.screenData.ZZ_COC_STDATE.substr(4, 2) - 1, aData.screenData.ZZ_COC_STDATE.substr(6, 2));
		} else {
			aData.screenData.ZZ_COC_STDATE = "";
		}
		if (aInput.ZZ_COC_EDATE != "00000000") {
			aData.screenData.ZZ_COC_EDATE = aInput.ZZ_COC_EDATE;
			aData.screenData.ZZ_COC_EDATE_VALUE = new Date(aData.screenData.ZZ_COC_EDATE.substr(0, 4), 
					aData.screenData.ZZ_COC_EDATE.substr(4, 2) - 1, aData.screenData.ZZ_COC_EDATE.substr(6, 2));
		} else {
			aData.screenData.ZZ_COC_EDATE = "";
		}
		if (aInput.ZZ_COC_NO == "000000000000000") {
			aData.screenData.ZZ_COC_NO = "";
		} else {
			aData.screenData.ZZ_COC_NO = aInput.ZZ_COC_NO;
			// Remove leading zeros
			aData.screenData.ZZ_COC_NO = aData.screenData.ZZ_COC_NO.replace(/^0+/, '');
		}

		// Get the previous version if available
		if (aData.screenData.ZZ_VERSION > 1) {
			var get = $.ajax({
				cache: false,
				url: sServiceUrl + "DEP_HDR_INFOSet(ZZ_DEP_REQ='" + sDeputationNo + "',ZZ_VERSION='" + (aData.screenData.ZZ_VERSION - 1) + "')?$expand=HDR_ITEM&$format=json",
				type: "GET"
			});
			get.done(function(result, header, response) {
				// Setting value for previous start date and end date
				aData.screenData.pre_stdate = result.d.ZZ_DEP_STDATE;
				aData.screenData.pre_eddate = result.d.ZZ_DEP_ENDATE;
				aData.screenData.pre_stdate_value = 
					new Date(aData.screenData.pre_stdate.substr(0, 4), aData.screenData.pre_stdate.substr(4, 2) - 1, 
							aData.screenData.pre_stdate.substr(6, 2));
				aData.screenData.pre_eddate_value = 
					new Date(aData.screenData.pre_eddate.substr(0, 4), aData.screenData.pre_eddate.substr(4, 2) - 1, 
							aData.screenData.pre_eddate.substr(6, 2));
				// Setting value for previous dependents
				aData.selectedPreDependents = result.d.HDR_ITEM.results;
				view.getModel().setData(aData);
			});
		} else {
			view.getModel().setData(aData);
		}
	},
	// This method is used to display deputation items(dependents) data onto the screen
	displayDeputationItem : function(aInput) {
		var aData = view.getModel().getData();
		aData.selectedDependents = aInput.HDR_ITEM.results;
		view.getModel().setData(aData);
	},
	
	// EMPLOYEE WORKFLOW ACTION
	employeeAction : function(status, statusString) {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true,oHomeThis);

		// Prepare value before action
		if (status != "CLOSE") {
			status = "AA" + status;
		}

		var data = view.getModel().getData().screenData;
		var aData = {};
		aData.ZZ_DEP_REQ = data.ZZ_DEP_REQ;
		aData.ZZ_DEP_PERNR = data.ZZ_DEP_PERNR;
		aData.ZZ_DEP_NTID = data.ZZ_DEP_NTID;
		aData.ZZ_DEP_TYPE = data.ZZ_DEP_TYPE;
		aData.ZZ_MGR_PERNR = sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_PERNR;
		aData.ZZ_STAT_FLAG = status;
		aData.ZZ_DEP_TYPE_TXT = data.ZZ_DEP_TYPE_TXT;
		aData.ZZ_DEP_FRMLOC_TXT = data.ZZ_DEP_FRMLOC_TXT;
		aData.ZZ_DEP_TOLOC_TXT = data.ZZ_DEP_TOLOC_TXT;
		if (data.ZZ_DEP_TYPE == "DOME") {
			aData.ZZ_STAGE = "1";
			aData.ZZ_SET = "1_2";
			aData.ZZ_SUBSET = "1_2_1";
			aData.ZZ_SUBSUBSET = "1_2_1_3";
			if (status.substring(2, 5) == "014") {
				aData.ZZ_STAGE = "1";
				aData.ZZ_SET = "1_2";
				aData.ZZ_SUBSET = "1_2_1";
				aData.ZZ_SUBSUBSET = "1_2_1_2";
			}
		} else {
			if (status.substring(2, 5) == "005") {
				aData.ZZ_STAGE = "1";
				aData.ZZ_SET = "1_2";
				aData.ZZ_SUBSET = "1_2_1";
				aData.ZZ_SUBSUBSET = "1_2_1_6";
			} else if (status.substring(2, 5) == "007") {
				aData.ZZ_STAGE = "2";
				aData.ZZ_SET = "1_2";
				aData.ZZ_SUBSET = "1_2_1";
				aData.ZZ_SUBSUBSET = "1_2_1_1";
			} else if (status.substring(2, 5) == "004") {
				aData.ZZ_STAGE = "1";
				aData.ZZ_SET = "1_2";
				aData.ZZ_SUBSET = "1_2_1";
				aData.ZZ_SUBSUBSET = "1_2_1_5";
			} else if (status.substring(2, 5) == "008") {
				aData.ZZ_STAGE = "2";
				aData.ZZ_SET = "1_4";
				aData.ZZ_SUBSET = "1_4_1";
				aData.ZZ_SUBSUBSET = "1_4_1_1";
			} else if (status.substring(2, 5) == "014") {
				aData.ZZ_STAGE = "1";
				aData.ZZ_SET = "1_2";
				aData.ZZ_SUBSET = "1_2_1";
				aData.ZZ_SUBSUBSET = "1_2_1_4";
			}
		}

		if (sap.ui.getCore().byId("txtCommonWFComment") != null) {
			aData.ZZ_NEW_COMMENTS = sap.ui.getCore().byId("txtCommonWFComment").getValue();
		}
		// Action
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
			},
		});
		get.done(function(result, response, header) {
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
					xhr.setRequestHeader('If-Match', eTag);
				},
				data: JSON.stringify(aData),
				dataType:"json",
				success: function(result, response, header) {
					try {
						oDeputationThis.oCommonDialog.close();
					} catch(exc) {}
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
					sap.m.MessageToast.show(statusString + "!");

					if (aData.ZZ_STAT_FLAG == "AA004" && aData.ZZ_DEP_TYPE == "INTL") {
						if (header.getResponseHeader('REASON') != "" && 
								header.getResponseHeader('REASON') != null) {
							sap.ca.ui.message.showMessageBox({
								type: sap.ca.ui.message.Type.ERROR,
								message: "Travel request cannot be created. Please contact help desk",
								details: header.getResponseHeader('REASON')
							});
							return;
						}
						// invisible all buttons
						oDeputationThis.invisibleAllButtons();

						// Clear current stages and tabs
						view.byId('flexBoxProcess').setVisible(false);
						view.byId('carouselProcessFlow').destroyContent();

						// destroy the icon tab control
						view.byId("pageDeputation").getContent()[2].destroy();
						oDeputationThis.iconTab = new sap.m.IconTabBar({
							expandable: false
						}).addStyleClass("deputation_itb_request margin_top_0");
						oDeputationThis.iconTab.attachSelect(null, oDeputationThis.onTabSelect, oDeputationThis);
						oDeputationThis.iconTab.setVisible(false);
						view.byId("pageDeputation").addContent(oDeputationThis.iconTab);
						oDeputationThis.reLoadAllData();
					} else {
						if (aData.ZZ_STAT_FLAG == "CLOSE" && data.ZZ_TTYPE == "WTRP") {
							if (header.getResponseHeader('REASON') != "" && 
									header.getResponseHeader('REASON') != null) {
								sap.ca.ui.message.showMessageBox({
									type: sap.ca.ui.message.Type.ERROR,
									message: "Travel request cannot be created. Please contact help desk",
									details: header.getResponseHeader('REASON')
								});
								return;
							}
						}
						sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
						sap.m.MessageToast.show(statusString + "!");
					}
					sap.ui.project.e2etm.util.StaticUtility.setBusy(true,oHomeThis);
				},
			});
			post.fail(function(err) {
				// Call get entity service with deputation request number
				if (err.status == 412) {
					var get = $.ajax({
						cache: false,
						url: sServiceUrl + "DEP_LOCK_USERSet('" + sDeputationNo + "')?$format=json",
						type: "GET",
					});
					get.done(function(result) {
						try {
							oDeputationThis.oCommonDialog.close();
						} catch(exc) {}
						sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
						sap.ca.ui.message.showMessageBox({
							type: sap.ca.ui.message.Type.ERROR,
							message: "This request was modified by " + result.d.ZZ_DEP_NTID + ". Please refresh homepage"
						});
					});
				} else {
					try {
						oDeputationThis.oCommonDialog.close();
					} catch(exc) {}
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
					sap.ca.ui.message.showMessageBox({
						type: sap.ca.ui.message.Type.ERROR,
						message: "Sorry for this inconvenience. Please contact support team",
						details: oError.responseText	
					});
				}
			});
		});
	},
	// 	This method is used to validate Deputation before submitting the deputation request
	validateDeputation : function() {
		var aData = view.getModel().getData();
		var globalData = sap.ui.getCore().getModel("global").getData();
		// Validate current screen before move to next tab(next screen)
		var err = "";

		// Validate start date input
		if (aData.screenData.ZZ_DEP_STDATE.trim() == "") {
			aData.screenData.ZZ_DEP_STDATE_ERROR = "Error";
			err = "Please check start date";
			sap.ca.ui.message.showMessageBox({
				type: sap.ca.ui.message.Type.ERROR,
				message: err,
				details: err
			});
			view.getModel().setData(aData);
			return false;
		}
		if (aData.screenData.ZZ_REQ_TYP == "DEPU" && 
				aData.screenData.ZZ_REQ_TYP != "" && (sap.ui.getCore().getModel("global").getData().changeType == "DA" ||
						sap.ui.getCore().getModel("global").getData().changeType == null ||
						sap.ui.getCore().getModel("global").getData().changeType == "")) {
			// Check date in the past
			if (sap.ui.project.e2etm.util.StaticUtility.checkDateInPast(aData.screenData.ZZ_DEP_STDATE)
					&& aData.screenData.ZZ_VREASON == "") {
				aData.screenData.ZZ_DEP_STDATE_ERROR = "Error";
				err = "Please enter start date in the future";
				sap.ca.ui.message.showMessageBox({
					type: sap.ca.ui.message.Type.ERROR,
					message: err,
					details: err
				});
				view.getModel().setData(aData);
				return false;
			}
//			else {
//				if (aData.screenData.ZZ_TRV_CAT == "TRFR") {
//					if (new Date(aData.screenData.ZZ_DEP_STDATE_VALUE.getFullYear(), 
//								 aData.screenData.ZZ_DEP_STDATE_VALUE.getMonth(), 1).toString() != 
//							aData.screenData.ZZ_DEP_STDATE_VALUE.toString()) {
//						aData.screenData.ZZ_DEP_STDATE_ERROR = "Error";
//						err = "For transfer request, start date must always be start day of the month";
//						sap.ca.ui.message.showMessageBox({
//							type: sap.ca.ui.message.Type.ERROR,
//							message: err,
//							details: err
//						});
//						view.getModel().setData(aData);
//						return false;
//					}
//				}
//				aData.screenData.ZZ_DEP_STDATE_ERROR = "None";
//			}
		}

		// Validate end date input
		if (aData.screenData.ZZ_DEP_ENDATE.trim() == "") {
			aData.screenData.ZZ_DEP_ENDATE_ERROR = "Error";
			err = "Please check end date";
			sap.ca.ui.message.showMessageBox({
				type: sap.ca.ui.message.Type.ERROR,
				message: err,
				details: err
			});
			view.getModel().setData(aData);
			return false;
		}
		if(aData.screenData.ZZ_REQ_TYP == "DEPU" && aData.screenData.ZZ_REQ_TYP != ""){
			// Check date in the past
			if(sap.ui.project.e2etm.util.StaticUtility.checkDateInPast(aData.screenData.ZZ_DEP_ENDATE)){
				aData.screenData.ZZ_DEP_ENDATE_ERROR = "Error";
				err = "Please enter end date in the future";
				sap.ca.ui.message.showMessageBox({
					type: sap.ca.ui.message.Type.ERROR,
					message: err,
					details: err
				});
				view.getModel().setData(aData);
				return false;
			}
//			else{				
//					if (aData.screenData.ZZ_TRV_CAT == "TRFR") {
//						if (new Date(aData.screenData.ZZ_DEP_ENDATE_VALUE.getFullYear(), 
//									 aData.screenData.ZZ_DEP_ENDATE_VALUE.getMonth()+1, 0).toString() != 
//								aData.screenData.ZZ_DEP_ENDATE_VALUE.toString()) {
//							aData.screenData.ZZ_DEP_ENDATE_ERROR = "Error";
//							err = "For transfer request, end date must always be end day of the month";
//							sap.ca.ui.message.showMessageBox({
//								type: sap.ca.ui.message.Type.ERROR,
//								message: err,
//								details: err
//							});
//							view.getModel().setData(aData);
//							return false;
//						}
//					}
//					//aData.screenData.ZZ_DEP_STDATE_ERROR = "None";
//				
//				aData.screenData.ZZ_DEP_ENDATE_ERROR = "None";
//			}
		}

		// Validate if input date is overlapped
		if (oDeputationThis.checkDateOverlapping() == "") {
			aData.screenData.ZZ_DEP_STDATE_ERROR = "None";
			aData.screenData.ZZ_DEP_ENDATE_ERROR = "None";
		} else {
			aData.screenData.ZZ_DEP_STDATE_ERROR = "Error";
			aData.screenData.ZZ_DEP_ENDATE_ERROR = "Error";

			err = oDeputationThis.checkDateOverlapping();

			sap.ca.ui.message.showMessageBox({
				type: sap.ca.ui.message.Type.ERROR,
				message: err,
				details: err
			});
			view.getModel().setData(aData);
			return;
		}

		// Validate duration based on Category of Travel
		if (aData.screenData.ZZ_DEP_STDATE != "" && aData.screenData.ZZ_DEP_ENDATE != "") {
			var dStart = new Date(aData.screenData.ZZ_DEP_STDATE.substr(0,4), aData.screenData.ZZ_DEP_STDATE.substr(4,2)-1, aData.screenData.ZZ_DEP_STDATE.substr(6,2));
			var dEnd = new Date(aData.screenData.ZZ_DEP_ENDATE.substr(0,4), aData.screenData.ZZ_DEP_ENDATE.substr(4,2)-1, aData.screenData.ZZ_DEP_ENDATE.substr(6,2));
			var dDur = new Date(dEnd - dStart);
			aData.screenData.ZZ_DEP_DAYS = "" + ( dDur.getTime() / ( 1000*3600*24 ) + 1 );
			aData.screenData.ZZ_DEP_DAYS = "" + Math.round(aData.screenData.ZZ_DEP_DAYS);
			if (parseInt(aData.screenData.ZZ_DEP_DAYS) > 0) {
				// Validate if input date is between the category duration
				if(aData.screenData.ZZ_TRV_CAT == "WRKP" && aData.screenData.ZZ_DEP_TYPE == "INTL")
				{
				
				    var oCrDt = new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate());
				    if(aData.screenData.ZZ_BEGDA!="" && aData.screenData.ZZ_BEGDA)				    
					   oCrDt = new Date(aData.screenData.ZZ_BEGDA.substr(0, 4), aData.screenData.ZZ_BEGDA.substr(4, 2) - 1, aData.screenData.ZZ_BEGDA.substr(6, 2));
					var oDecDt = new Date(2017, 11, 31);
					if(oCrDt.getTime() > oDecDt.getTime()){
				        err = sap.ui.project.e2etm.util.StaticUtility.
				              checTravelCategoryDuration(aData.screenData.ZZ_TRV_CAT,aData.screenData.ZZ_DEP_DAYS,aData.screenData.ZZ_DEP_TYPE,aData.screenData.ZZ_DEP_TOCNTRY);
					}else{
						if(parseInt(aData.screenData.ZZ_DEP_DAYS) > 730){
							err = "Duration should not exceed more than 730 days for STA assignment travels";						
						}
					}
				}else{
					 err = sap.ui.project.e2etm.util.StaticUtility.
		              checTravelCategoryDuration(aData.screenData.ZZ_TRV_CAT,aData.screenData.ZZ_DEP_DAYS,aData.screenData.ZZ_DEP_TYPE,aData.screenData.ZZ_DEP_TOCNTRY);
				}
				if (err != "") {
					aData.screenData.ZZ_DEP_STDATE_ERROR = "Error";
					aData.screenData.ZZ_DEP_ENDATE_ERROR = "Error";
					sap.ca.ui.message.showMessageBox({
						type: sap.ca.ui.message.Type.ERROR,
						message: err,
						details: err
					});
					view.getModel().setData(aData);
					return;
				} else {
					aData.screenData.ZZ_DEP_STDATE_ERROR = "None";
					aData.screenData.ZZ_DEP_ENDATE_ERROR = "None";
					view.getModel().setData(aData);
				}
			} else {
				aData.screenData.ZZ_DEP_STDATE_ERROR = "Error";
				aData.screenData.ZZ_DEP_ENDATE_ERROR = "Error";
				err = "To Date must be greater than or equal to From Date";
				sap.ca.ui.message.showMessageBox({
					type: sap.ca.ui.message.Type.ERROR,
					message: err,
					details: err
				});
				view.getModel().setData(aData);
				return;
			}
		}

		// Validate if to location is entered
		if (aData.screenData.ZZ_DEP_TOLOC_TXT.trim() == "") {
			aData.screenData.ZZ_DEP_TOLOC_TXT_ERROR = "Error";
			err = "Please enter to location";
			sap.ca.ui.message.showMessageBox({
				type: sap.ca.ui.message.Type.ERROR,
				message: err,
				details: err
			});
			view.getModel().setData(aData);
			return false;
		} else {
			aData.screenData.ZZ_DEP_TOLOC_TXT_ERROR = "None";
		}


		// Validate if Reason of Travel is entered
		if (aData.screenData.ZZ_RSN_TRV.trim() == "") {
			aData.screenData.ZZ_RSN_TRV_ERROR = "Error";
			err = "Please enter reason of travel";
			sap.ca.ui.message.showMessageBox({
				type: sap.ca.ui.message.Type.ERROR,
				message: err,
				details: err
			});
			view.getModel().setData(aData);
			return false;
		} else {
			aData.screenData.ZZ_RSN_TRV_ERROR = "None";
		}

		// Validate if Customer Details is entered
		if (aData.screenData.ZZ_CUST_NAME.trim() == "") {
			aData.screenData.ZZ_CUST_NAME_ERROR = "Error";
			err = "Please enter Customer Details";
			sap.ca.ui.message.showMessageBox({
				type: sap.ca.ui.message.Type.ERROR,
				message: err,
				details: err
			});
			view.getModel().setData(aData);
			return false;
		} else {
			aData.screenData.ZZ_CUST_NAME_ERROR = "None";
		}
		/*Start-CGGS Changes*/	
		if(aData.screenData.ZZ_DEP_TOCNTRY == "DE" && aData.screenData.ZZ_ASG_TYP == "STA" && 
		   aData.screenData.ZZ_REQ_TYP == "DEPU" &&(aData.screenData.ZZ_TRV_REQ == "" || aData.screenData.ZZ_TRV_REQ =="0000000000")){
		if(aData.screenData.ZZ_PARENTNAME.trim()== "" && aData.screenData.ZZ_SPOUSENAME.trim()== ""){
			aData.screenData.ZZ_PARENTNAME_ERROR = "Error";
			aData.screenData.ZZ_SPOUSENAME_ERROR = "Error";
			err = "Please enter either 'Son of/Daughter of' or 'Spouse of'";
			sap.ca.ui.message.showMessageBox({
				type: sap.ca.ui.message.Type.ERROR,
				message: err,
				details: err
			});
			view.getModel().setData(aData);
			return false;
		} else {
			aData.screenData.ZZ_PARENTNAME_ERROR = "None";
			aData.screenData.ZZ_SPOUSENAME_ERROR = "None";
		}	
		
		
		
		if(aData.screenData.ZZ_DESIGNATION.trim()== "" && aData.screenData.ZZ_TRV_CAT == "TRFR"){
			aData.screenData.ZZ_DESIGNATION_ERROR = "Error";
			err = "Please enter Designation";
			sap.ca.ui.message.showMessageBox({
				type: sap.ca.ui.message.Type.ERROR,
				message: err,
				details: err
			});
			view.getModel().setData(aData);
			return false;
		} else {
			aData.screenData.ZZ_DESIGNATION_ERROR = "None";
		}
		}
/*End-CGGS Changes*/
		
//		if(aData.screenData.ZZ_ASG_TYP == "STA")
//			{
//			var oCrDt = new Date(aData.screenData.ZZ_BEGDA.substr(0, 4), aData.screenData.ZZ_BEGDA.substr(4, 2) - 1, aData.screenData.ZZ_BEGDA.substr(6, 2));
//			var oDecDt = new Date(2017, 11, 31);
//			if(oCrDt.getTime() >= oDecDt.getTime()){
//			if(parseInt(aData.screenData.ZZ_DEP_DAYS) > 183){
//				err = "Duration should not exceed more than 183 days for STA assignment travels";
//				aData.screenData.ZZ_DEP_STDATE_ERROR = "Error";
//				aData.screenData.ZZ_DEP_ENDATE_ERROR = "Error";
//				sap.ca.ui.message.showMessageBox({
//					type: sap.ca.ui.message.Type.ERROR,
//					message: err,
//					details: err
//				});
//				view.getModel().setData(aData);
//				return false;
//			}
//			}else{
//				if(parseInt(aData.screenData.ZZ_DEP_DAYS) > 730){
//					err = "Duration should not exceed more than 730 days for STA assignment travels";
//					aData.screenData.ZZ_DEP_STDATE_ERROR = "Error";
//					aData.screenData.ZZ_DEP_ENDATE_ERROR = "Error";
//					sap.ca.ui.message.showMessageBox({
//						type: sap.ca.ui.message.Type.ERROR,
//						message: err,
//						details: err
//					});
//					view.getModel().setData(aData);
//					return false;
//				}
//			}
//			}
		
		if(sap.ui.getCore().getModel("profile").getData().currentRole == "EMP" && 
		   (sap.ui.project.e2etm.util.StaticUtility.checkStvaAsg(aData.screenData.ZZ_ASG_TYP) ||
				aData.screenData.ZZ_TRV_CAT == "TRFR") && aData.screenData.ZZ_DEP_TYPE == "INTL"){
			if(aData.screenData.ZZ_MENTOR_NO == "00000000" || aData.screenData.ZZ_MENTOR_NO.trim()== ""){
				aData.screenData.ZZ_MENTOR_NO_ERROR = "Error";
				err = "Please enter Mentor No";
				sap.ca.ui.message.showMessageBox({
					type: sap.ca.ui.message.Type.ERROR,
					message: err,
					details: err
				});
				view.getModel().setData(aData);
				return false;
			} else {
				aData.screenData.ZZ_MENTOR_NO_ERROR = "None";
			}	
			
			if(aData.screenData.ZZ_MENTOR_NAME.trim()== ""){
				aData.screenData.ZZ_MENTOR_NAME_ERROR = "Error";
				err = "Please enter Mentor Name";
				sap.ca.ui.message.showMessageBox({
					type: sap.ca.ui.message.Type.ERROR,
					message: err,
					details: err
				});
				view.getModel().setData(aData);
				return false;
			} else {
				aData.screenData.ZZ_MENTOR_NAME_ERROR = "None";
			}	
			
			if(aData.screenData.ZZ_DESIGNATION.trim()== ""){
				aData.screenData.ZZ_DESIGNATION_ERROR = "Error";
				err = "Please enter Designation";
				sap.ca.ui.message.showMessageBox({
					type: sap.ca.ui.message.Type.ERROR,
					message: err,
					details: err
				});
				view.getModel().setData(aData);
				return false;
			} else {
				aData.screenData.ZZ_DESIGNATION_ERROR = "None";
			}
			if(aData.screenData.ZZ_SUR_NAME.trim()== ""){
				aData.screenData.ZZ_SUR_NAME = "Error";
				err = "Please enter Surname";
				sap.ca.ui.message.showMessageBox({
					type: sap.ca.ui.message.Type.ERROR,
					message: err,
					details: err
				});
				view.getModel().setData(aData);
				return false;
			} else {
				aData.screenData.ZZ_SUR_NAME_ERROR = "None";
			}
			
			if(aData.screenData.ZZ_GIVEN_NAME.trim()== ""){
				aData.screenData.ZZ_GIVEN_NAME = "Error";
				err = "Please enter Given name";
				sap.ca.ui.message.showMessageBox({
					type: sap.ca.ui.message.Type.ERROR,
					message: err,
					details: err
				});
				view.getModel().setData(aData);
				return false;
			} else {
				aData.screenData.ZZ_GIVEN_NAME_ERROR = "None";
			}
			
		}

		//Check family accompanied and dependent selection
		var iIndex = 0;
		if (aData.screenData.ZZ_DEP_TYPE == "INTL" && aData.screenData.ZZ_FAMILY_ACCOMP) {
			var checkboxes = sap.ui.getCore().byId("membersTravelling").getItems();
			for (iIndex = 0; iIndex < checkboxes.length; iIndex++) {
				if(checkboxes[iIndex].getItems()[0].getItems()[0].getChecked()){
					break;
				}
			}
		}

		if(aData.screenData.ZZ_REQ_TYP == "DEPU" && aData.screenData.ZZ_DEP_TYPE == "INTL"){
			if( iIndex == sap.ui.getCore().byId("membersTravelling").getItems().length &&
					sap.ui.getCore().byId("familyAccYesRad").getSelected()){
				sap.ca.ui.message.showMessageBox({
					type: sap.ca.ui.message.Type.ERROR,
					message: "Please select at least one dependent",
					details: "Please select at least one dependent"
				});
				return false;
			}
		}

		return true;
	},
	//	Check overlapping start and end date
	checkDateOverlapping: function() {
		var aData = view.getModel().getData();
		var aList = sap.ui.getCore().getModel("global").getData().deputationList; //Deputation List
		if (aList != null) {
			for (var i=0; i < aList.length; i++) {
				if (aList[i].ZZ_REQ_TYP == "HOME" || aList[i].ZZ_REQ_TYP == "EMER" ||
						aList[i].ZZ_REQ_TYP == "SECO" || aList[i].ZZ_REQ_TYP == "VISA") {
					continue;
				}
				if (aData.screenData.ZZ_DEP_REQ == aList[i].ZZ_DEP_REQ) {
					continue;
				}
				if (aList[i].ZZ_TRV_CAT == "TRFR" && aList[i].ZZ_DEP_TYPE == "DOME") {
					continue;
				}
				var existSD = aList[i].ZZ_DEP_STDATE;
				var existED = aList[i].ZZ_DEP_ENDATE;
				var newSD = aData.screenData.ZZ_DEP_STDATE;
				var newED = aData.screenData.ZZ_DEP_ENDATE;
				// Validation is ok
				if ((newSD < existSD && newED < existSD) || (newSD > existED && newED > existED)) {
					continue;
				} else {
					return "Request" + " '" + aList[i].ZZ_DEP_REQ + "' " + 
					"has already opened from " + sap.ui.project.e2etm.util.Formatter.sapDate(existSD) + " to " +
					sap.ui.project.e2etm.util.Formatter.sapDate(existED) + ". Please select another date";
				}
			}
		}
		return "";
	},
	// 	Check leading period and rolling duration
	checkPeriod: function(aData){
		var sChecPeriod = sServiceUrl + "Period_Check?ZZ_DEP_EDATE='" + 
		aData.screenData.ZZ_DEP_ENDATE + "'&ZZ_DEP_FRCNTRY='" +
		aData.screenData.ZZ_DEP_FRCNTRY + "'&ZZ_DEP_PERNR='" +
		sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_PERNR + "'&ZZ_DEP_SDATE='" +
		aData.screenData.ZZ_DEP_STDATE + "'&ZZ_DEP_TOCNTRY='" +
		aData.screenData.ZZ_DEP_TOCNTRY + "'&ZZ_TRV_CAT='" +
		aData.screenData.ZZ_REQ_TYP + "'&$format=json";
		var sPastFuture =  sServiceUrl + "DEP_REQ_DATES?CONST='DEP_REQ_DATE'&SELPAR=''&$format=json";
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true,oHomeThis);
		$.when($.ajax({cache: false,url:sChecPeriod}),$.ajax({cache: false,url:sPastFuture})).done(
				function(oChecPeriod,oPastFuture){
					if( sap.ui.project.e2etm.util.StaticUtility.checkFutureMax(oPastFuture[0].d.results[0].VALUE,aData.screenData.ZZ_DEP_STDATE) ){
						sap.ca.ui.message.showMessageBox({
							type: sap.ca.ui.message.Type.ERROR,
							message:  "Request is only created within " + oPastFuture[0].d.results[0].VALUE + " days(s) in the future"
						});
						try {
							oDeputationThis.oCommonDialog.close();
						} catch(exc) {}
						sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
						return;
					}
					if( oChecPeriod[0].d.Period_Check.ZZ_COOL_PRD == "" && oChecPeriod[0].d.Period_Check.ZZ_LEAD_TIME == "") { // Validation is ok
						oDeputationThis.saveDeputation("AA003");
					} else {  //Show error or warning message
						if( oChecPeriod[0].d.Period_Check.ZZ_COOL_PRD != "" ){    //Show error message
							var sError = "You cannot travel to " + sap.ui.project.e2etm.util.Formatter.formatCountry(aData.screenData.ZZ_DEP_TOCNTRY) + 
							" until " + sap.ui.project.e2etm.util.Formatter.sapDate(oChecPeriod[0].d.Period_Check.ZZ_COOL_PRD);
							sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
							sap.ca.ui.message.showMessageBox({
								type: sap.ca.ui.message.Type.ERROR,
								message:  sError,
								details:  sError
							});
						}else if(oChecPeriod[0].d.Period_Check.ZZ_LEAD_TIME != ""){                   //Show confirmation
							if(sap.ui.getCore().getModel("global").getData().isChange) {
								oDeputationThis.saveDeputation("AA003");
							} else {
//								sap.m.MessageBox.confirm(
//										"Travel should start from " + sap.ui.project.e2etm.util.Formatter.sapDate(oChecPeriod[0].d.Period_Check.ZZ_LEAD_TIME) + 
//										" , do you want to continue ?",
//										function (oAction){
//											if (oAction == "OK") {
//												oDeputationThis.saveDeputation("AA003");
//											} else if (oAction == "CANCEL") {
//												sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
//											}
//										});
								oDeputationThis.saveDeputation("AA003");
								sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
							}
						}
					}
				}).fail(function(err){
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
				});
	},
	// 	Mapping input data to deputation header model
	mapHeaderSave: function() {
		var aData = view.getModel().getData();
		var globalData = {};
		if (sap.ui.getCore().getModel("global")) {
			globalData = sap.ui.getCore().getModel("global").getData();
		}

		// Setting up screen data for saving a deputation request
		aData.save = {
				"ZZ_DEP_DEPT": sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_DEPT,
				"ZZ_DEP_DESGN": sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_DESGN,
				"ZZ_DEP_DOB": sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_DOB,
				"ZZ_DEP_DOJ": sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_DOJ,
				"ZZ_DEP_EMAIL": sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_EMAIL,
				"ZZ_DEP_GENDER": sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_GENDER,
				"ZZ_DEP_GRM": sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_GRM,
				"ZZ_DEP_GROUP": sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_GROUP,
				"ZZ_DEP_LEVEL": sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_LEVEL,
				"ZZ_DEP_LOCATN": sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_LOCATN,
				"ZZ_DEP_NAME": sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_NAME,
				"ZZ_DEP_NATIONALITY": sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_NATIONALITY,
				"ZZ_DEP_NTID": sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_NTID,
				"ZZ_DEP_PERNR": sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_PERNR,

				"ZZ_BASE_CNTRY": sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_BASE_CNTRY,
				"ZZ_BASE_LOC": sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_BASE_LOC,
				"ZZ_BASE_LOC_KEY": sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_BASE_LOC_KEY,

				// Personal Sub area
				"ZZ_PERSUBAREA": sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_PERSUBAREA,
		};

		if (aData.screenData.ZZ_DEP_REQ == '') {
			aData.save.ZZ_DEP_REQ = '000000000';
		} else {
			aData.save.ZZ_DEP_REQ = sDeputationNo;
		}

		//Deputation tab
		aData.save.ZZ_DEP_TYPE = aData.screenData.ZZ_DEP_TYPE;
		aData.save.ZZ_CONFIRM_FLAG = aData.screenData.ZZ_CONFIRM_FLAG;

		aData.save.ZZ_DEP_FRCNTRY = aData.screenData.ZZ_DEP_FRCNTRY;
		aData.save.ZZ_DEP_FRCNTRY_TXT = aData.screenData.ZZ_DEP_FRCNTRY_TXT;

		aData.save.ZZ_DEP_TOCNTRY = aData.screenData.ZZ_DEP_TOCNTRY;
		aData.save.ZZ_DEP_TOCNTRY_TXT = aData.screenData.ZZ_DEP_TOCNTRY_TXT;

		aData.save.ZZ_DEP_FRMLOC = aData.screenData.ZZ_DEP_FRMLOC;
		aData.save.ZZ_DEP_FRMLOC_TXT = aData.screenData.ZZ_DEP_FRMLOC_TXT;

		aData.save.ZZ_DEP_TOLOC = aData.screenData.ZZ_DEP_TOLOC;
		aData.save.ZZ_DEP_TOLOC_TXT = aData.screenData.ZZ_DEP_TOLOC_TXT;

		aData.save.ZZ_DEP_STDATE = aData.screenData.ZZ_DEP_STDATE;
		aData.save.ZZ_DEP_ENDATE = aData.screenData.ZZ_DEP_ENDATE;
		aData.save.ZZ_DEP_DAYS = aData.screenData.ZZ_DEP_DAYS;

		aData.save.ZZ_TRV_CAT = aData.screenData.ZZ_TRV_CAT;
		aData.save.ZZ_RSN_TRV = aData.screenData.ZZ_RSN_TRV;
		aData.save.ZZ_NEW_COMMENTS = aData.screenData.ZZ_NEW_COMMENTS;
		
		aData.save.ZZ_MENTOR_NO = aData.screenData.ZZ_MENTOR_NO;
		aData.save.ZZ_MENTOR_NAME = aData.screenData.ZZ_MENTOR_NAME;
		aData.save.ZZ_SUR_NAME = aData.screenData.ZZ_SUR_NAME;
		aData.save.ZZ_GIVEN_NAME = aData.screenData.ZZ_GIVEN_NAME;

		if (aData.save.ZZ_DEP_TYPE == "INTL") {
			aData.save.ZZ_SP_CMPNY = sap.ui.getCore().byId("sponsorYesRad").getSelected() + "";
			aData.save.ZZ_FAMILY_ACCOMP = aData.screenData.ZZ_FAMILY_ACCOMP + "";
			try {
				aData.save.ZZ_FMY_JSTAT = aData.screenData.ZZ_FMY_JSTAT + "";
			} catch(exc) {}
			aData.save.ZZ_VISA_AEXIST = aData.screenData.ZZ_VISA_AEXIST + "";
			try {
				aData.save.ZZ_VISA_PB = aData.screenData.ZZ_VISA_PB + "";
			} catch(exc) {}
			aData.save.ZZ_INS_EX = aData.screenData.ZZ_INS_EX;
			aData.save.ZZ_COC_EX = aData.screenData.ZZ_COC_EX;
			aData.save.ZZ_VISA_EX = aData.screenData.ZZ_VISA_EX;
			aData.save.ZZ_TCKT_EX = aData.screenData.ZZ_TCKT_EX;

			if (aData.screenData.ZZ_MIN_WAGE == "YES") {
				aData.save.ZZ_MIN_WAGE = "X";
			} else {
				aData.save.ZZ_MIN_WAGE = "";
			}
			aData.save.ZZ_DEP_TEDATE = aData.screenData.ZZ_DEP_TEDATE;
		}

		//Customer tab
		aData.save.ZZ_CUST_NAME = aData.screenData.ZZ_CUST_NAME;

		// Confirmation
		aData.save.ZZ_CONFIRM_FLAG = aData.screenData.ZZ_CONFIRM_FLAG + "";

		//Current Stage
		aData.save.ZZ_STAGE = globalData.currentStage;
		aData.save.ZZ_SET = globalData.currentSet;
		aData.save.ZZ_SUBSET = globalData.currentSubSet;

		// set change flag
		if (globalData.isChange) {
			aData.save.ZZ_VREASON = globalData.changeType;
		} else {
			aData.save.ZZ_VREASON = "";
		}
		aData.save.ZZ_VERSION = aData.screenData.ZZ_VERSION;
		
/*Start-CGGS Changes*/
		aData.save.ZZ_PARENTNAME = aData.screenData.ZZ_PARENTNAME;
		aData.save.ZZ_SPOUSENAME = aData.screenData.ZZ_SPOUSENAME;
		aData.save.ZZ_DESIGNATION = aData.screenData.ZZ_DESIGNATION;
/*End-CGGS Changes*/		
	},
	// 	Prepare header/details value and call webservice to create new deputation request
	saveDeputation: function(aMode){
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true,oHomeThis);
		var aData = view.getModel().getData();

		// Map screen Data with data used for save / submit
		oDeputationThis.mapHeaderSave();

		// Prepare line items for data used for save / submit
		aData.save.HDR_ITEM = new Array();
		if (aData.screenData.ZZ_DEP_TYPE == "INTL") {
//Start-New changes			
			if (aData.screenData.ZZ_TRV_CAT == "TRFR") {

				if (aData.screenData.ZZ_DEP_STDATE_VALUE > new Date(aData.screenData.ZZ_DEP_STDATE_VALUE.getFullYear(), 
						 aData.screenData.ZZ_DEP_STDATE_VALUE.getMonth(), 5)) {
					aData.screenData.ZZ_DEP_STDATE_ERROR = "Error";
					err = "For transfer request, start date must always start between 01 and 05";
					sap.ca.ui.message.showMessageBox({
						type: sap.ca.ui.message.Type.ERROR,
						message: err,
						details: err
					});
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
					return;
				}
				
				if (aData.screenData.ZZ_DEP_ENDATE_VALUE.toString() != new Date(aData.screenData.ZZ_DEP_ENDATE_VALUE.getFullYear(), 
						 aData.screenData.ZZ_DEP_ENDATE_VALUE.getMonth()+1, 0).toString()) {
					aData.screenData.ZZ_DEP_ENDATE_ERROR = "Error";
					err = "For transfer request, end date must always be end of the month";
					sap.ca.ui.message.showMessageBox({
						type: sap.ca.ui.message.Type.ERROR,
						message: err,
						details: err
					});
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
					return;
				}
				aData.screenData.ZZ_DEP_ENDATE_ERROR = "None";
				aData.screenData.ZZ_DEP_STDATE_ERROR = "None";
				
			}
//End-New changes
			if (aData.screenData.ZZ_FAMILY_ACCOMP == true) {
				var checkboxes = sap.ui.getCore().byId("membersTravelling").getItems();
				var dependents = sap.ui.getCore().getModel("profile").getData().dependentDetail;
				for (var i = 0; i < checkboxes.length; i++) {
					if (checkboxes[i].getItems()[0].getItems()[0].getChecked()) {
						var existingFlag = "";
	
						if (checkboxes[i].getItems()[0].getItems()[2].getChecked()) {
							existingFlag = "X";
						} else {
							existingFlag = "";
						}
						
/*Start-Change Return Dates*/
						var processFlag = "";
						if (checkboxes[i].getItems()[0].getItems()[3].getChecked()) {
							processFlag = "X";
						} else {
							processFlag = "";
						}
/*End-Change Return Dates*/						
						// validate start date end date of dependents
						var stdate = checkboxes[i].getItems()[1].getItems()[0].getYyyymmdd();
						var eddate = checkboxes[i].getItems()[1].getItems()[1].getYyyymmdd();
						if (stdate == "" || eddate == "") {
							sap.ca.ui.message.showMessageBox({
								type: sap.ca.ui.message.Type.ERROR,
								message: "Please enter start date and end date of dependent " + dependents[i].ZZ_DEP_NAME,
								details: "Start date and End date cannot be blank"
							});
							sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
							return;
						}
						var startDate =  new Date(stdate.substr(0, 4), stdate.substr(4, 2) - 1, stdate.substr(6, 2));
						var endDate =  new Date(eddate.substr(0, 4), eddate.substr(4, 2) - 1, eddate.substr(6, 2));
						if (startDate < aData.screenData.ZZ_DEP_STDATE_VALUE || endDate > aData.screenData.ZZ_DEP_ENDATE_VALUE ||
								startDate > endDate) {
							if (!sap.ui.getCore().getModel("global").getData().isChange ||
									sap.ui.getCore().getModel("global").getData().changeType != "DA") {
								sap.ca.ui.message.showMessageBox({
									type: sap.ca.ui.message.Type.ERROR,
									message: "Please check start date and end date of dependent " + dependents[i].ZZ_DEP_NAME,
									details: "Start date and End date must be in between deputation start date and end date"
								});
								sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
								return;
							}
						}

						// validate if visa type is tourist
						if (checkboxes[i].getItems()[0].getItems()[1].getSelectedKey() == "TOUR") {
							var dDur = new Date(endDate - startDate);
							dDur = "" + ( dDur.getTime() / ( 1000*3600*24 ) + 1 );
							dDur = "" + Math.round(dDur);
							if (parseInt(dDur) > 90) {
								sap.ca.ui.message.showMessageBox({
									type: sap.ca.ui.message.Type.ERROR,
									message: "Please check start date and end date of dependent " + dependents[i].ZZ_DEP_NAME,
									details: "For Tourist visa, duration must be less than 90 days"
								});
								sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
								return;
							}
						}

						var eData = {
								"ZZ_DEP_REQ"  : aData.screenData.ZZ_DEP_REQ,
								"ZZ_DEPE_TYPE"  : dependents[i].ZZ_DEP_TYP,
								"ZZ_DEP_NAME"   : dependents[i].ZZ_DEP_NAME,
								"ZZ_DEP_STDATE" : checkboxes[i].getItems()[1].getItems()[0].getYyyymmdd(),
								"ZZ_DEP_ENDATE" : checkboxes[i].getItems()[1].getItems()[1].getYyyymmdd(),
								"ZZ_DEP_GENDER" : dependents[i].ZZ_DEP_GENDER,
								"ZZ_DEP_DOB"  : dependents[i].ZZ_DEP_DOB      ,
								"ZZ_VISA_TYP"   : checkboxes[i].getItems()[0].getItems()[1].getSelectedKey() + "",
								"ZZ_VISA_EX"    : existingFlag + "",
								"ZZ_PROC_BSCH"  : processFlag
						};
						if (!sap.ui.getCore().getModel("global").getData().isChange ||
								sap.ui.getCore().getModel("global").getData().changeType != "DA") {
						} else {
							// Logic for update dependent startdate
							if (startDate < aData.screenData.ZZ_DEP_STDATE_VALUE ||
									startDate > aData.screenData.ZZ_DEP_ENDATE_VALUE) {
								eData.ZZ_DEP_STDATE = aData.screenData.ZZ_DEP_STDATE;
							}
							// Logic for update dependent enddate
							if (endDate > aData.screenData.ZZ_DEP_ENDATE_VALUE ||
									endDate < aData.screenData.ZZ_DEP_STDATE_VALUE) {
								eData.ZZ_DEP_ENDATE = aData.screenData.ZZ_DEP_ENDATE;
							}
						}
						aData.save.HDR_ITEM.push(eData);
					}
				}
			}
		}

		// Set status of new deputation request
		aData.save.ZZ_STAT_FLAG = aMode;

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
			},
		});
		get.done(function(result, response, header) {
			token = header.getResponseHeader("X-CSRF-Token");
			var myData = JSON.stringify(aData.save, null, "\t");
			var post = $.ajax({
				cache: false,
				url: sServiceUrl + "DEP_HDR_INFOSet",
				type: "POST",
				beforeSend: function(xhr){
					xhr.setRequestHeader('X-Requested-With', "XMLHttpRequest");
					xhr.setRequestHeader('X-CSRF-Token', token);
					xhr.setRequestHeader('Accept', "application/json");
					xhr.setRequestHeader('DataServiceVersion', "2.0");
					xhr.setRequestHeader('Content-Type', "application/json");
				},
				data: myData,
				dataType:"json",
				success: function(data) {
					try {
						oDeputationThis.oCommonDialog.close();
					} catch(exc) {}

					// Update deputation request
					sDeputationNo = data.d.ZZ_DEP_REQ;
					aData.screenData.ZZ_DEP_REQ = sDeputationNo;
					var aGlobalData = sap.ui.getCore().getModel("global").getData();
					aGlobalData.ZZ_STAT_FLAG = aData.save.ZZ_STAT_FLAG;
					sap.ui.getCore().getModel("global").setData(aGlobalData);

					if (aData.save.ZZ_STAT_FLAG == "AA000") { //Save
						aData.screenData.ZZ_STAT_FLAG = "AA000";
						eForm = jQuery.extend({}, aData.screenData);
						view.getModel().setData(aData);
						
						oDeputationThis.checkEMPTransferFormUploaded(aData).then(function () {
							sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
							sap.m.MessageToast.show(view.getModel("i18n").getProperty("dep_req") + " '" + data.d.ZZ_DEP_REQ + "' " 
									+ view.getModel("i18n").getProperty("sav_suc"));
						});
					} else {  // Submit
						aData.screenData.ZZ_STAT_FLAG = "AA003";
						view.getModel().setData(aData);
						
						oDeputationThis.checkEMPTransferFormUploaded(aData).then(function () {
							sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
							sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
							// Show message
							sap.m.MessageToast.show(view.getModel("i18n").getProperty("dep_req") + " '" + data.d.ZZ_DEP_REQ + "' " 
									+ view.getModel("i18n").getProperty("sub_suc"));
						});
					}
				},
				error: function(err) {
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
					sap.ca.ui.message.showMessageBox({
						type: sap.ca.ui.message.Type.ERROR,
						message: view.getModel("i18n").getProperty("sav_err"),
						details: 'Since yours deputation is Head Count transfer case, approval manager information is not available in the system. \n\n' +
								 'Step 1: Please share the name and e-mail ID’s of your 1st and 2nd level approvers at RBEI with RBEI-Deputation team \n\n' +
								 'First level approval \n' +
								 'Name: \n' +
								 'Email ID: \n\n' + 
						         'Second level approval: \n' +								 
								 'Name:  \n' +
								 'Email ID:  \n\n' +								 
								 'It may take 2-3 hrs to get the data updated in the system .\n\n' +
								 'Step 2: After the managers information is updated, date change process can be initiated.'
					});
				}
			});
		});
	},
	// 	This method is used to save Visa plan
	saveVisaPlan:function(aData, sStatus, sMessage, sRequestType) {
		//Delete data before saving
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true,oHomeThis);
		try {
			if (aData.selfVisa.ZZ_MULT_ENTRY_CHAR) {
				aData.selfVisa.ZZ_MULT_ENTRY = 'X';
			} else {
				aData.selfVisa.ZZ_MULT_ENTRY = '';
			}
		} catch(exc) {}
		try{
			for (var i=0; i < aData.visaExistingDependent.length; i++) {

				var regex = new RegExp(/\(([^)]+)\)/g);
				var dependentType = regex.exec(aData.visaExistingDependent[i].ZZ_DEPNDT_TYP)[1];
				aData.visaExistingDependent[i].ZZ_DEPNDT_TYP = dependentType;
				if (aData.visaExistingDependent[i].ZZ_MULT_ENTRY_CHAR) {
					aData.visaExistingDependent[i].ZZ_MULT_ENTRY = 'X';
				} else {
					aData.visaExistingDependent[i].ZZ_MULT_ENTRY = '';
				}
				delete aData.visaExistingDependent[i]["ZZ_MULT_ENTRY_CHAR"];
				delete aData.visaExistingDependent[i]["ZZ_VISA_EDATE_VALUE"];
				delete aData.visaExistingDependent[i]["ZZ_VISA_SDATE_VALUE"];
				delete aData.visaExistingDependent[i]["ZZ_VISA_SDATE_ERROR"];
				delete aData.visaExistingDependent[i]["ZZ_VISA_EDATE_ERROR"];
				delete aData.visaExistingDependent[i]["ZZ_PASSPORT_NO_ERROR"];
				delete aData.visaExistingDependent[i]["ZZ_VISA_NO_ERROR"];
				delete aData.visaExistingDependent[i]["enabled"];
				delete aData.visaExistingDependent[i]["enabledUpload"];
				delete aData.visaExistingDependent[i]["href"];
				delete aData.visaExistingDependent[i]["visibleOpen"];
			}
		}catch(ex){}

		delete aData.selfVisa["ZZ_DEPNDT_TYP"];
		delete aData.selfVisa["ZZ_MULT_ENTRY_CHAR"];
		delete aData.selfVisa["ZZ_VISA_EDATE_VALUE"];
		delete aData.selfVisa["ZZ_VISA_SDATE_VALUE"];
		delete aData.selfVisa["ZZ_VISA_EDATE_ERROR"];
		delete aData.selfVisa["ZZ_VISA_SDATE_ERROR"];
		delete aData.selfVisa["ZZ_PASSPORT_NO_ERROR"];
		delete aData.selfVisa["ZZ_VISA_NO_ERROR"];
		delete aData.selfVisa["enabled"];
		delete aData.selfVisa["enabledUpload"];
		delete aData.selfVisa["href"];
		delete aData.selfVisa["visibleOpen"];
		try {
			delete aData.selfVisa["TRV_HDR"];
		} catch(exc) {}
		try {
			delete aData.selfVisa["__metadata"];
		} catch(exc) {}
		aData.selfVisa.ZZ_VISA_CAT = aData.screenData.ZZ_TRV_CAT;
		aData.selfVisa.VISAPLANTOITEM = aData.visaExistingDependent;
		// Call service to create visa plan
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
			},
		});
		get.done(function(result, response, header) {
			token = header.getResponseHeader("X-CSRF-Token");
			var post = $.ajax({
				cache: false,
				url: sServiceUrl + "DEP_VISA_PLANSet",
				type: "POST",
				beforeSend: function(xhr){
					xhr.setRequestHeader('X-Requested-With', "XMLHttpRequest");
					xhr.setRequestHeader('X-CSRF-Token', token);
					xhr.setRequestHeader('Accept', "application/json");
					xhr.setRequestHeader('DataServiceVersion', "2.0");
					xhr.setRequestHeader('Content-Type', "application/json");
				},
				data: JSON.stringify(aData.selfVisa),
				dataType:"json",
				success: function(result) {
					if(sRequestType == "DEPU"){
						// Update workflow stages
						oDeputationThis.employeeAction(sStatus, sMessage);
					}else{
						sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
					}
				},fail: function(err) {
					alert(err);
				},
			});
		});
	},
	// 	This method is used to upload transfer form for Domestic transfer
	checkEMPTransferFormUploaded : function(aData) {
		var deferred = $.Deferred();
		
		if (aData.screenData.ZZ_TRV_CAT == "TRFR" && view.byId("btnEMPUploadTransferForm").getValue() != "") {
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
				},
			});
			get.done(function(result, response, header) {
				var oControl = view.byId("btnEMPUploadTransferForm");
				var sFileName = "CL_TRFR" + oControl.getValue().substr(oControl.getValue().lastIndexOf("."));
				var file = oControl.oFileUpload.files[0];
				var sUrl = sServiceUrl +  "DmsDocsSet";
				var sEmpNo = sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_PERNR;
				
				var sSlung = aData.screenData.ZZ_DEP_REQ + "," + sEmpNo + "," + sFileName + "," + "TRF";
				var oHeaders = {
						'X-Requested-With': "XMLHttpRequest",
						'X-CSRF-Token': header.getResponseHeader("X-CSRF-Token"),
						'Accept': "application/json",
						'DataServiceVersion': "2.0",
						'Content-Type': "application/json",
						"slug": sSlung,
				};
				var post = jQuery.ajax({
					cache: false,
					type: 'POST',
					url: sUrl,
					headers: oHeaders,
					cache: false,
					contentType: file.type,
					processData: false,
					data: file,
				});
				post.success(function(data){
					view.byId("btnEMPUploadTransferForm").setValue("");
					deferred.resolve();
				});
				post.fail(function(result, response, header) {
					alert('Error in uploading file');
					deferred.resolve();
				});
			});
		} else {
			deferred.resolve();
		}
		return deferred.promise();
	},
	// EMPLOYEE WORKFLOW ACTION
	
	// MANAGER WORKFLOW ACTION
	managerAction : function(status, statusString) {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true,oHomeThis);
		var position = sap.ui.getCore().getModel("profile").getData().currentRole;

		var roleKeys = sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_POSITION.split(";");
		var rolePref = sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_STATUS_TXT.split(";");
		for (var i = 0; i < roleKeys.length; i++) {
			if (roleKeys[i] == position) {
				status = rolePref[i] + status;
				break;
			}
		}

		var data = view.getModel().getData().screenData;
		var aData = {};
		aData.ZZ_DEP_REQ = data.ZZ_DEP_REQ;
		aData.ZZ_DEP_PERNR = data.ZZ_DEP_PERNR;
		aData.ZZ_STAT_FLAG = status;
		aData.ZZ_DEP_NTID = data.ZZ_DEP_NTID;
		aData.ZZ_DEP_EMAIL = data.ZZ_DEP_EMAIL;
		aData.ZZ_DEP_TYPE = data.ZZ_DEP_TYPE;
		aData.ZZ_DEP_TYPE_TXT = data.ZZ_DEP_TYPE_TXT;
		aData.ZZ_DEP_TOCNTRY = data.ZZ_DEP_TOCNTRY;
		aData.ZZ_DEP_FRMLOC_TXT = data.ZZ_DEP_FRMLOC_TXT;
		aData.ZZ_DEP_TOLOC_TXT = data.ZZ_DEP_TOLOC_TXT;
		aData.ZZ_MGR_PERNR = sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_PERNR;
		aData.ZZ_SRVTYP_MONTHS = "6";
		aData.ZZ_TRV_CAT = data.ZZ_TRV_CAT;
		
		aData.ZZ_VERSION = data.ZZ_VERSION.trim();
		aData.ZZ_VREASON = data.ZZ_VREASON;
		
		/*Start-CGGS Changes*/
		if(aData.ZZ_STAT_FLAG.substring(2, 5) == "001"){
		var errorMsg = this.checkCggsData(aData);
		if(errorMsg!=""){
			sap.ca.ui.message.showMessageBox({
				type : sap.ca.ui.message.Type.ERROR,
				message : errorMsg,
				details : errorMsg
			});
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oHomeThis);
			return;
		}
		}
		/*End-CGGS Changes*/
		
		
		if (status.substring(2, 5) == "003" || status.substring(2, 5) == "002") {
			aData.ZZ_NEW_COMMENTS = sap.ui.getCore().byId("txtCommonWFComment").getValue();
		} else if (status.substring(2, 5) == "001") {
			aData.ZZ_NEW_COMMENTS = sap.ui.getCore().byId("txtManagerWFComment").getValue();
			aData.ZZ_DEP_SUB_TYPE = sap.ui.getCore().byId("cbSubType").getSelectedKey();
			aData.ZZ_ASG_TYP = sap.ui.getCore().byId("cbAssModel").getSelectedKey();
			
			if (aData.ZZ_ASG_TYP == "TRFR" && aData.ZZ_DEP_TYPE == "DOME") {
				aData.ZZ_TR_RSN = sap.ui.getCore().byId("cbTransferReason").getSelectedKey();
			} else {
				aData.ZZ_TR_RSN = "";
			}
			
			aData.ZZ_SP_CMPNY = sap.ui.getCore().byId("cbEligible").getSelectedKey();

			if (data.ZZ_VREASON == "") {
				aData.ZZ_TRV_PUR = sap.ui.getCore().byId("cbPurpose").getSelectedKey();
				aData.ZZ_SERV_TYP = sap.ui.getCore().byId("cbServiceCon").getSelectedKey();
				if (aData.ZZ_SERV_TYP == "NORM") {
					if (data.ZZ_DEP_DAYS <= 90) {
						aData.ZZ_SRVTYP_MONTHS = "3";
					} else {
						aData.ZZ_SRVTYP_MONTHS = "6";
					}
				} else {
					aData.ZZ_SRVTYP_MONTHS = sap.ui.getCore().byId("txtServiceDuration").getValue();
				}
				var trvPlan = sap.ui.getCore().byId("managerWFDialogTravelPlanCheck").getChecked();

				if (trvPlan) {
					aData.ZZ_TTYPE = "WTRP";
				} else {
					aData.ZZ_TTYPE = "WOTP";
				}
			} else {
				aData.ZZ_TRV_PUR = data.ZZ_TRV_PUR;
				aData.ZZ_SERV_TYP = data.ZZ_SERV_TYP;
				aData.ZZ_SRVTYP_MONTHS = data.ZZ_SRVTYP_MONTHS;
				aData.ZZ_TTYPE = data.ZZ_TTYPE;
			}

		}

		aData.ZZ_STAGE = "1";
		aData.ZZ_SET = "1_2";
		aData.ZZ_SUBSET = "1_2_1";
		aData.ZZ_SUBSUBSET = "1_2_1_1";
		
		
		var cggsFormsValid = sap.ui.project.e2etm.util.StaticUtility.checkCGGSForms(aData,sap.ui.getCore().byId("grmDetailedCggsChecklist--cggsFormsDisplay"));
		
		if(cggsFormsValid){
			

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
			},
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
					xhr.setRequestHeader('If-Match', eTag);
				},
				data: JSON.stringify(aData),
				dataType:"json",
				success: function(data) {
/*Start-CGGS Changes*/			
					 var cggsdata = oDeputationThis.getView().getModel("cggsmodel").getData();
					
					 var cggsFlag = sap.ui.project.e2etm.util.StaticUtility.visibleCggsData(								
							 view.getModel().getData().screenData.ZZ_TRV_REQ,
								cggsdata.Tocntry,cggsdata.Asgtyp,
								view.getModel().getData().screenData.ZZ_REQ_TYP,
								view.getModel().getData().screenData.ZZ_TRV_CAT);
					 
				     if(cggsFlag){								
							sap.ui.project.e2etm.util.StaticUtility.modifyCggsData(
									sap.ui.getCore().getModel("global").getData().cggsdata);
	
				     }
/*End-CGGS Changes*/
					oDeputationThis.oCommonDialog.close();
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
					sap.m.MessageToast.show(statusString + "!");
					sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
				},
			});
			post.fail(function(err) {
				// Call get entity service with deputation request number
				if (err.status == 412) {
					var get = $.ajax({
						cache: false,
						url: sServiceUrl + "DEP_LOCK_USERSet('" + sDeputationNo + "')?$format=json",
						type: "GET",
					});
					get.done(function(result) {
						try {
							oDeputationThis.oCommonDialog.close();
						} catch(exc) {}
						sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
						sap.ca.ui.message.showMessageBox({
							type: sap.ca.ui.message.Type.ERROR,
							message: "This request was modified by " + result.d.ZZ_DEP_NTID + ". Please refresh homepage"
						});
					});
				} else {
					try {
						oDeputationThis.oCommonDialog.close();
					} catch(exc) {}
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
					sap.ca.ui.message.showMessageBox({
						type: sap.ca.ui.message.Type.ERROR,
						message: "Sorry for this inconvenience. Please contact support team",
						details: oError.responseText
					});
				}
			});
		});
		}else{
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oHomeThis);
			  var message;
			   if(sap.ui.project.e2etm.util.StaticUtility.checkStvaAsg(aData.ZZ_ASG_TYP)  && aData.ZZ_TRV_CAT=="TRFR"){
				   message = "Upload fully approved ST_VA requisition form to proceed further";
			   }else{
				   message = "Please upload valid requistion Forms";
			   }
			   sap.m.MessageToast.show(message);
		}
	},
	// MANAGER WORKFLOW ACTION
	
//	onMgrUploadFile:function(evt){
//		var data = view.getModel().getData().screenData;
//		sap.ui.project.e2etm.util.StaticUtility.validateUploadFile(evt,this,data.ZZ_DEP_REQ,data.ZZ_DEP_PERNR);
//	},
	onCGGSFormsUpload:function(evt){
		var id = evt.getParameter("id").split("--");
		var aData = oDeputationThis.getView().getModel().getData().screenData;
		 var stvaFlag = false;
		    if(aData.ZZ_TRV_CAT == "TRFR")
		    	stvaFlag = true;
		sap.ui.project.e2etm.util.StaticUtility.validateUploadCggsFile(evt,aData.ZZ_DEP_REQ,aData.ZZ_DEP_PERNR,
				                                                       sap.ui.getCore().byId(id[0]+"--cggsFormsDisplay"),
				                                                       stvaFlag,aData.ZZ_VERSION);
	},

	onRemoveCggsForms:function(evt){
		var data = view.getModel().getData().screenData;
		var id = evt.getParameter("id").split("--");
		//if(evt.getParameter("id")=="btnCggsFormsRemove"){
			sap.ui.project.e2etm.util.StaticUtility.deleteFileFromDms(sap.ui.getCore().byId(id[0]+"--cggsFormsDisplay").getModel(),
					data.ZZ_DEP_REQ,
					data.ZZ_DEP_PERNR);
			
		//}else{
		//sap.ui.project.e2etm.util.StaticUtility.deleteFileFromDms(this.getView().byId("cggsFormsDisplay").getModel(),
		//		data.ZZ_DEP_REQ,
		//		data.ZZ_DEP_PERNR);
		//}
	},
	onDownloadCggsForms:function(evt){
		//if(evt.getParameter("id")=="btnCggsFormsDownload"){
		var id = evt.getParameter("id").split("--");
		var sModule = "CGF";
		var aData = oDeputationThis.getView().getModel().getData().screenData;
		var stvaFlag = false;
		    if(aData.ZZ_TRV_CAT == "TRFR")
		    	sModule = "SRQ";
		sap.ui.project.e2etm.util.StaticUtility.downloadCggsForms(sap.ui.getCore().byId(id[0]+"--cggsFormsDisplay").getModel().getData(),
				                                                  oDeputationThis.getView().getModel().getData().screenData.ZZ_DEP_REQ,
				                                                  oDeputationThis.getView().getModel().getData().screenData.ZZ_DEP_PERNR,
				                                                  sModule);
	//	}else{
//			sap.ui.project.e2etm.util.StaticUtility.downloadCggsForms(this.getView().byId("cggsFormsDisplay").getModel().getData(),
//                    oDeputationThis.getView().getModel().getData().screenData.ZZ_DEP_REQ,
//                    oDeputationThis.getView().getModel().getData().screenData.ZZ_DEP_PERNR,
//                    "CGF");
		//}
	},
	
	// DEPU WORKFLOW ACTION
	deputationAction : function(status, statusString) {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true,oHomeThis);

		if (status != "CLOSE") {
			var position = sap.ui.getCore().getModel("profile").getData().currentRole;
			var roleKeys = sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_POSITION.split(";");
			var rolePref = sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_STATUS_TXT.split(";");
			for (var i = 0; i < roleKeys.length; i++) {
				if (roleKeys[i] == position) {
					status = rolePref[i] + status;
					break;
				}
			}
		}

		var data = view.getModel().getData().screenData;
		var aData = {};
		aData.ZZ_DEP_REQ = data.ZZ_DEP_REQ;
		aData.ZZ_DEP_PERNR = data.ZZ_DEP_PERNR;
		aData.ZZ_DEP_NTID = data.ZZ_DEP_NTID;
		aData.ZZ_DEP_EMAIL = data.ZZ_DEP_EMAIL;
		aData.ZZ_DEP_TYPE = data.ZZ_DEP_TYPE;
		aData.ZZ_DEP_SUB_TYPE = data.ZZ_DEP_SUB_TYPE;
		aData.ZZ_DEP_TYPE_TXT = data.ZZ_DEP_TYPE_TXT;
		aData.ZZ_DEP_FRMLOC_TXT = data.ZZ_DEP_FRMLOC_TXT;
		aData.ZZ_DEP_TOLOC_TXT = data.ZZ_DEP_TOLOC_TXT;
		aData.ZZ_MGR_PERNR = sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_PERNR;
		aData.ZZ_STAT_FLAG = status;
		if(status == "JJ003")
		   aData.ZZ_SEND_MGR = sap.ui.getCore().byId("rbtnSndMgr").getSelected()?"X":"";

		if (status.substring(2, 5) == "003" || status.substring(2, 5) == "002") {
			aData.ZZ_NEW_COMMENTS = sap.ui.getCore().byId("txtCommonWFComment").getValue();
		} else if (status.substring(2, 5) == "006") {
			aData.ZZ_NEW_COMMENTS = sap.ui.getCore().byId("txtGenerateCLWFComment").getValue() + "";
			aData.ZZ_ASG_TYP = sap.ui.getCore().byId("cbAssModel").getSelectedKey();
		}

		if (aData.ZZ_DEP_TYPE == "DOME") {
			if (status != "CLOSE") {
				aData.ZZ_STAGE = "1";
				aData.ZZ_SET = "1_2";
				aData.ZZ_SUBSET = "1_2_1";
				aData.ZZ_SUBSUBSET = "1_2_1_2";
			} else {
				aData.ZZ_STAGE = "1";
				aData.ZZ_SET = "1_2";
				aData.ZZ_SUBSET = "1_2_1";
				aData.ZZ_SUBSUBSET = "1_2_1_4";
			}
		} else if (aData.ZZ_DEP_TYPE == "INTL") {
			if (status != "CLOSE") {
				if (status.substring(2, 5) == "005") {
					aData.ZZ_STAGE = "2";
					aData.ZZ_SET = "1_1";
					aData.ZZ_SUBSET = "1_1_1";
					aData.ZZ_SUBSUBSET = "1_1_1_1";
				} else if (status.substring(2, 5) == "007") {
					aData.ZZ_STAGE = "2";
					aData.ZZ_SET = "1_1";
					aData.ZZ_SUBSET = "1_1_1";
					aData.ZZ_SUBSUBSET = "1_1_1_2";
				} else if (status.substring(2, 5) == "006") {
					aData.ZZ_STAGE = "1";
					aData.ZZ_SET = "1_2";
					aData.ZZ_SUBSET = "1_2_1";
					aData.ZZ_SUBSUBSET = "1_2_1_4";
				} else if (status.substring(2, 5) == "008") {
					aData.ZZ_STAGE = "2";
					aData.ZZ_SET = "1_3";
					aData.ZZ_SUBSET = "1_3_1";
					aData.ZZ_SUBSUBSET = "1_3_1_1";
				} else if (status.substring(2, 5) == "009") {
					aData.ZZ_STAGE = "2";
					aData.ZZ_SET = "1_3";
					aData.ZZ_SUBSET = "1_3_1";
					aData.ZZ_SUBSUBSET = "1_3_1_2";
				} else if (status.substring(2, 5) == "010") {
					aData.ZZ_STAGE = "2";
					aData.ZZ_SET = "1_3";
					aData.ZZ_SUBSET = "1_3_1";
					aData.ZZ_SUBSUBSET = "1_3_1_3";
					// COC startdate and enddate
					aData.ZZ_COC_STDATE = data.ZZ_COC_STDATE;
					aData.ZZ_COC_EDATE = data.ZZ_COC_EDATE;
					aData.ZZ_COC_NO = data.ZZ_COC_NO;
				} else if (status.substring(2, 5) == "002") {
					aData.ZZ_STAGE = "1";
					aData.ZZ_SET = "1_2";
					aData.ZZ_SUBSET = "1_2_1";
					aData.ZZ_SUBSUBSET = "1_2_1_4";
				} else if (status.substring(2, 5) == "013") {
					aData.ZZ_STAGE = "2";
					aData.ZZ_SET = "1_4";
					aData.ZZ_SUBSET = "1_4_1";
					aData.ZZ_SUBSUBSET = "1_4_1_2";
				}
			} else {
				aData.ZZ_STAGE = "2";
				aData.ZZ_SET = "1_4";
				aData.ZZ_SUBSET = "1_4_1";
				aData.ZZ_SUBSUBSET = "1_4_1_3";
			}
		}

		var token = "";
		var get = $.ajax({
			cache: false,
			url: sServiceUrl + "EMP_PASSPORT_INFOSet",
			type: "GET",
			beforeSend: function(xhr){
				xhr.setRequestHeader('X-CSRF-Token', 'Fetch');
			},
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
					xhr.setRequestHeader("If-Match", eTag);
					//"W/\"'000000858'\""
				},
				data: JSON.stringify(aData),
				dataType:"json",
				success: function(result, response, header) {
					try {
						oDeputationThis.oCommonDialog.close();
					} catch(exc) {}
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
					if (aData.ZZ_STAT_FLAG == "JJ005" || aData.ZZ_STAT_FLAG == "JJ008" || 
							aData.ZZ_STAT_FLAG == "JJ009" || aData.ZZ_STAT_FLAG == "JJ013") {
						// invisible all buttons
						oDeputationThis.invisibleAllButtons();

						// Clear current stages and tabs
						view.byId('flexBoxProcess').setVisible(false);
						view.byId('carouselProcessFlow').destroyContent();

						// destroy the icon tab control
						view.byId("pageDeputation").getContent()[2].destroy();
						oDeputationThis.iconTab = new sap.m.IconTabBar({
							expandable: false
						}).addStyleClass("deputation_itb_request margin_top_0");
						oDeputationThis.iconTab.attachSelect(null, oDeputationThis.onTabSelect, oDeputationThis);
						oDeputationThis.iconTab.setVisible(false);
						view.byId("pageDeputation").addContent(oDeputationThis.iconTab);

						oDeputationThis.reLoadAllData();
					} else {
						if (aData.ZZ_STAT_FLAG == "CLOSE" && data.ZZ_TTYPE == "WTRP") {
							if (header.getResponseHeader('REASON') != "" && 
									header.getResponseHeader('REASON') != null) {
								sap.ca.ui.message.showMessageBox({
									type: sap.ca.ui.message.Type.ERROR,
									message: "Travel request cannot be created. Please contact help desk.",
									details: header.getResponseHeader('REASON')
								});
								return;
							}
						}
						sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
						sap.m.MessageToast.show(statusString + "!");
					}
				},
			});
			post.fail(function(err) {
				// Call get entity service with deputation request number
				if (err.status == 412) {
					var get = $.ajax({
						cache: false,
						url: sServiceUrl + "DEP_LOCK_USERSet('" + sDeputationNo + "')?$format=json",
						type: "GET",
					});
					get.done(function(result) {
						try {
							oDeputationThis.oCommonDialog.close();
						} catch(exc) {}
						sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
						sap.ca.ui.message.showMessageBox({
							type: sap.ca.ui.message.Type.ERROR,
							message: "This request was modified by " + result.d.ZZ_DEP_NTID + ". Please refresh homepage"
						});
					});
				} else {
					try {
						oDeputationThis.oCommonDialog.close();
					} catch(exc) {}
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
					sap.ca.ui.message.showMessageBox({
						type: sap.ca.ui.message.Type.ERROR,
						message: "Sorry for this inconvenience. Please contact support team",
						details: oError.responseText
					});
				}
			});
		});
	},
	// DEPU WORKFLOW ACTION
	
	// FOOTER ACTION BUTTONS
	// 	This method is used to hide all footer buttons
	invisibleAllButtons : function() {
		// invisible employee buttons
		oDeputationThis.inVisibleEmployeeButtons();
		// invisible manager buttons
		oDeputationThis.inVisibleManagerButtons();
		// invisible deputation buttons
		oDeputationThis.inVisibleDeputationButtons();
	},
	
	// 	This method is used to unhide EMP-related footer buttons
	visibleEmployeeButtons : function(evt) {
		var globalData = sap.ui.getCore().getModel("global").getData();
		var profileData = sap.ui.getCore().getModel("profile").getData();
		var viewData = view.getModel().getData();
		// For each button in this list, logic for showing them should be considered
		// Considerring Deputation request
		if (viewData.screenData.ZZ_REQ_TYP == "DEPU" || viewData.screenData.ZZ_REQ_TYP == "") {
			// 1. Submit Button
			if (sDeputationNo == '') {        // New deputation request flow
				view.byId("btnEMPSubmit").setVisible(true);
			} else {
				if (globalData.currentStage == "1" && globalData.currentSubSet == "1_1_1") {
					var prefix = viewData.screenData.ZZ_STAT_FLAG.substring(0, 2);
					var action = viewData.screenData.ZZ_STAT_FLAG.substring(2, 5);
					if (viewData.screenData.ZZ_STAT_FLAG == "AA000" && oDeputationThis.currentStage == "1") {
						view.byId("btnEMPSubmit").setVisible(true);
					} else {
						// Consider action from non-employee role
						if (prefix != "AA") {
							if (action == "003" && oDeputationThis.currentStage == "1") {
								if(viewData.screenData.ZZ_NEXT_APPROVER == profileData.employeeDetail.ZZ_DEP_PERNR){
								view.byId("btnEMPSubmit").setVisible(true);
								}else{
									view.byId("btnEMPSubmit").setVisible(false);
								}
							} else {
								view.byId("btnEMPSubmit").setVisible(false);
							}
						} else {
							view.byId("btnEMPSubmit").setVisible(false);
						}
					}
				} else {
					view.byId("btnEMPSubmit").setVisible(false);
				}
			}

			// 2. Accept & Reject CL Button
			if (sDeputationNo == '') {
				view.byId("btnEMPAcceptCL").setVisible(false);
				view.byId("btnEMPRejectCL").setVisible(false);
			} else {
				if (globalData.currentStage == "1" && globalData.currentSubSet == "1_2_1") {
					var flag = viewData.screenData.ZZ_STAT_FLAG.substring(2, 5);
					if (flag == "006") {
						view.byId("btnEMPAcceptCL").setVisible(true);
						view.byId("btnEMPRejectCL").setVisible(true);
					} else {
						view.byId("btnEMPAcceptCL").setVisible(false);
						view.byId("btnEMPRejectCL").setVisible(false);
					}
				} else {
					view.byId("btnEMPAcceptCL").setVisible(false);
					view.byId("btnEMPRejectCL").setVisible(false);
				}
			}

			// 3. Submit Docs Button (Considerring sendback from Deputation)
			if (sDeputationNo == '') {
				view.byId("btnEMPSubmitDocs").setVisible(false);
			} else {
				if (viewData.screenData.ZZ_DEP_TYPE == "INTL") {
					if (globalData.currentStage == "1" && globalData.currentSubSet == "1_2_1") {
						if (viewData.screenData.ZZ_STAT_FLAG == "AA004") {
							view.byId("btnEMPSubmitDocs").setVisible(true);
						} else {
							// Consider sendback from Deputation
							if (viewData.screenData.ZZ_STAT_FLAG == "JJ003" &&
									oDeputationThis.currentStage == "2" &&
									oDeputationThis.currentSet == "1_1" &&
									oDeputationThis.currentSubSet == "1_1_1") {

								view.byId("btnEMPSubmitDocs").setVisible(true);
							} else {
								view.byId("btnEMPSubmitDocs").setVisible(false);
							}
						}
					} else {
						view.byId("btnEMPSubmitDocs").setVisible(false);
					}
				} else {
					view.byId("btnEMPSubmitDocs").setVisible(false);
				}
			}

			// 4. Submit Visa Docs Button
			if (sDeputationNo == '') {
				view.byId("btnEMPSubmitVisaDocs").setVisible(false);
			} else {
				if (viewData.screenData.ZZ_DEP_TYPE == "INTL") {
					if (globalData.currentStage == "2" && globalData.currentSubSet == "1_2_1") {
						if (viewData.screenData.ZZ_STAT_FLAG == "JJ007") {
							view.byId("btnEMPSubmitVisaDocs").setVisible(true);
						} else {
							// Consider sendback from Deputation
							if (viewData.screenData.ZZ_STAT_FLAG == "JJ003" &&
									oDeputationThis.currentStage == "2" &&
									oDeputationThis.currentSet == "1_3" &&
									oDeputationThis.currentSubSet == "1_3_1") {

								view.byId("btnEMPSubmitVisaDocs").setVisible(true);
							} else {
								view.byId("btnEMPSubmitVisaDocs").setVisible(false);
							}
						}
					} else {
						view.byId("btnEMPSubmitVisaDocs").setVisible(false);
					}
				} else {
					view.byId("btnEMPSubmitVisaDocs").setVisible(false);
				}
			}

			// 5. Submit Passport Docs Button
			if (sDeputationNo == '') {
				view.byId("btnEMPSubmitPassport").setVisible(false);
			} else {
				if (viewData.screenData.ZZ_DEP_TYPE == "INTL") {
					if (globalData.currentStage == "2" && globalData.currentSubSet == "1_4_1") {
						if (viewData.screenData.ZZ_STAT_FLAG == "JJ010" ||
								viewData.screenData.ZZ_STAT_FLAG == "JJ003") {
							view.byId("btnEMPSubmitPassport").setVisible(true);
						} else {
							view.byId("btnEMPSubmitPassport").setVisible(false);
						}
					} else {
						view.byId("btnEMPSubmitPassport").setVisible(false);
					}
				} else {
					view.byId("btnEMPSubmitPassport").setVisible(false);
				}
			}
			
			// 6. Upload Transfer Form button
			if (sDeputationNo == '' && viewData.screenData.ZZ_TRV_CAT == "TRFR" &&
					viewData.screenData.ZZ_DEP_TYPE == "DOME") {
				view.byId("btnEMPUploadTransferForm").setVisible(true);
			} else {
				if (oDeputationThis.currentStage == "1" && oDeputationThis.currentSubSet == "1_1_1") {
					if (viewData.screenData.ZZ_TRV_CAT == "TRFR" && viewData.screenData.ZZ_STAT_FLAG == "AA000" &&
							viewData.screenData.ZZ_DEP_TYPE == "DOME") {
						view.byId("btnEMPUploadTransferForm").setVisible(true);
					} else {
						view.byId("btnEMPUploadTransferForm").setVisible(false);
					}
				} else if (oDeputationThis.currentStage == "1" && oDeputationThis.currentSubSet == "1_2_1") {
					if (viewData.screenData.ZZ_TRV_CAT == "TRFR" && 
							viewData.screenData.ZZ_STAT_FLAG.substring(2,5) == "003" &&
							viewData.screenData.ZZ_DEP_TYPE == "DOME" &&
							(viewData.screenData.ZZ_TRV_REQ == '' || 
								viewData.screenData.ZZ_TRV_REQ == '0000000000')) {
						view.byId("btnEMPUploadTransferForm").setVisible(true);
					} else {
						view.byId("btnEMPUploadTransferForm").setVisible(false);
					}
				}
			}
		}

		// 7. Submit Travel Plan Button
		view.byId("btnEMPSubmitTravelPlan").setVisible(false);
		view.byId("btnSaveTravelPlan").setVisible(false);
		$.when(oDeputationThis.travelDeffered).then(function(){
			if (sDeputationNo == '') {
				if (viewData.screenData.ZZ_REQ_TYP == "BUSR" || viewData.screenData.ZZ_REQ_TYP == "SECO" ||
						viewData.screenData.ZZ_REQ_TYP == "HOME" || viewData.screenData.ZZ_REQ_TYP == "EMER" ||
						viewData.screenData.ZZ_REQ_TYP == "INFO") {
					view.byId("btnEMPSubmitTravelPlan").setVisible(true);
					if (sap.ui.getCore().getModel("global").getData().isCreate) {
						if (viewData.screenData.ZZ_REQ_TYP != "HOME" && viewData.screenData.ZZ_REQ_TYP != "EMER") {
							view.byId("btnSaveTravelPlan").setVisible(true);
						} else {
							view.byId("btnSaveTravelPlan").setVisible(false);
						}
					} else {
						var curDate = new Date();
						var startDate = new Date(TravelPlanThis.getView().getModel().getData().ZZ_DATV1.substr(0, 4), 
								TravelPlanThis.getView().getModel().getData().ZZ_DATV1.substr(4, 2) - 1, 
								TravelPlanThis.getView().getModel().getData().ZZ_DATV1.substr(6, 2));
						if (startDate < curDate && TravelPlanThis.getView().getModel().getData().ZZ_VERSION.trim() != "1") {
							view.byId("btnSaveTravelPlan").setVisible(false);
						} else {
							view.byId("btnSaveTravelPlan").setVisible(true);
						}
					}
				} else {
					view.byId("btnEMPSubmitTravelPlan").setVisible(false);
					view.byId("btnSaveTravelPlan").setVisible(false);
				}
			} else {
				if ((globalData.currentStage == "1" && globalData.currentSubSet == "1_1_1" && //Travel request
						( viewData.screenData.ZZ_REQ_TYP == "BUSR" || viewData.screenData.ZZ_REQ_TYP == "HOME" || 
								viewData.screenData.ZZ_REQ_TYP == "SECO" || viewData.screenData.ZZ_REQ_TYP == "EMER" ||
								viewData.screenData.ZZ_REQ_TYP == "INFO") ) || 
								(globalData.currentStage == "2" && globalData.currentSubSet == "1_1_1" &&  // Domestic Deputation
										viewData.screenData.ZZ_DEP_TYPE == "DOME" && viewData.screenData.ZZ_REQ_TYP != "BUSR" && 
										viewData.screenData.ZZ_REQ_TYP != "HOME" && viewData.screenData.ZZ_REQ_TYP != "SECO" &&
										viewData.screenData.ZZ_REQ_TYP != "EMER" && viewData.screenData.ZZ_REQ_TYP != "INFO") ||
										(globalData.currentStage == "3" && globalData.currentSubSet == "1_1_1" && // International Deputation
												viewData.screenData.ZZ_DEP_TYPE == "INTL" && viewData.screenData.ZZ_REQ_TYP != "BUSR" && 
												viewData.screenData.ZZ_REQ_TYP != "HOME" && viewData.screenData.ZZ_REQ_TYP != "SECO" &&
												viewData.screenData.ZZ_REQ_TYP != "EMER" && viewData.screenData.ZZ_REQ_TYP != "INFO")) {
					var prefix = viewData.screenData.ZZ_STAT_FLAG.substring(0, 2);
					var action = viewData.screenData.ZZ_STAT_FLAG.substring(2, 5);
					if (sap.ui.getCore().getModel("profile").getData().currentRole == "EMP" && 
							( action == "000" || action == "008" || 
									sap.ui.getCore().getModel("global").getData().isChange ||
									sap.ui.getCore().getModel("global").getData().isCreate)) {  // Save, new SECO/HOME/EMER, send back
						view.byId("btnEMPSubmitTravelPlan").setVisible(true);
						if (sap.ui.getCore().getModel("global").getData().isCreate) {
							if (viewData.screenData.ZZ_REQ_TYP != "HOME" && viewData.screenData.ZZ_REQ_TYP != "EMER") {
								view.byId("btnSaveTravelPlan").setVisible(true);
							} else {
								view.byId("btnSaveTravelPlan").setVisible(false);
							}
						} else {
							var curDate = new Date();
							var startDate = new Date(TravelPlanThis.getView().getModel().getData().ZZ_DATV1.substr(0, 4), 
									TravelPlanThis.getView().getModel().getData().ZZ_DATV1.substr(4, 2) - 1, 
									TravelPlanThis.getView().getModel().getData().ZZ_DATV1.substr(6, 2));
							if (startDate < curDate && TravelPlanThis.getView().getModel().getData().ZZ_VERSION.trim() != "1") {
								view.byId("btnSaveTravelPlan").setVisible(false);
							} else {
								view.byId("btnSaveTravelPlan").setVisible(true);
							}
						}
					} else {
						// Consider action from non-employee role
						view.byId("btnEMPSubmitTravelPlan").setVisible(false);
						view.byId("btnSaveTravelPlan").setVisible(false);
					}
				}
			}
			oDeputationThis.travelDeffered = $.Deferred();
		});
	},
	// 	This method is used to hide EMP-related footer buttons
	inVisibleEmployeeButtons: function(evt) {
		view.byId("btnEMPSubmit").setVisible(false);
		view.byId("btnEMPAcceptCL").setVisible(false);
		view.byId("btnEMPRejectCL").setVisible(false);
		view.byId("btnEMPSubmitDocs").setVisible(false);
		view.byId("btnEMPSubmitVisaDocs").setVisible(false);
		view.byId("btnEMPSubmitPassport").setVisible(false);
		view.byId("btnSaveTravelPlan").setVisible(false);
		view.byId("btnEMPSubmitTravelPlan").setVisible(false);
		view.byId("btnSave").setVisible(false);
		view.byId("btnDelete").setVisible(false);
		view.byId("btnEMPChange").setVisible(false);
		view.byId("btnEMPUploadTransferForm").setVisible(false);
	},

	// 	This method is used to unhide GRM-related footer buttons
	visibleManagerButtons: function(evt) {
		var globalData = sap.ui.getCore().getModel("global").getData();
		// For each button in this list, logic for showing them should be considered
		var viewData = view.getModel().getData();
		var prefix = viewData.screenData.ZZ_STAT_FLAG.substring(0, 2);
		var action = viewData.screenData.ZZ_STAT_FLAG.substring(2, 5);
		if (action == "003") {
			if (prefix == "AA" || prefix == "JJ") { // Submitted in deputation always starts with AA
				// 1. SendBack Button
				view.byId("btnSendBack").setVisible(true);
				// 2. Approve Button
				view.byId("btnApprove").setVisible(true);
				// 3. Reject Button
				view.byId("btnReject").setVisible(true);
			} else { // If travel request is in process
				// Check if this is the case that a non-employee user submits a travel plan for approval
				// At this time, the prefix might vary
				// This only happens from travel plan stage
				if ((viewData.screenData.ZZ_TRV_REQ != "0000000000" && viewData.screenData.ZZ_TRV_REQ != "") || 
						viewData.screenData.ZZ_TRV_REQ == null) {
					// 1. SendBack Button
					view.byId("btnSendBack").setVisible(true);
					// 2. Approve Button
					view.byId("btnApprove").setVisible(true);
					// 3. Reject Button
					view.byId("btnReject").setVisible(true);
				} else {
					// 1. SendBack Button
					view.byId("btnSendBack").setVisible(false);
					// 2. Approve Button
					view.byId("btnApprove").setVisible(false);
					// 3. Reject Button
					view.byId("btnReject").setVisible(false);
				}
			}
		} else {
			if (((viewData.screenData.ZZ_TRV_REQ != "0000000000" && viewData.screenData.ZZ_TRV_REQ != "") || 
					viewData.screenData.ZZ_TRV_REQ == null) && action == "006") {
				// 1. SendBack Button
				view.byId("btnSendBack").setVisible(true);
				// 2. Approve Button
				view.byId("btnApprove").setVisible(true);
				// 3. Reject Button
				view.byId("btnReject").setVisible(true);
			} else {
				// 1. SendBack Button
				view.byId("btnSendBack").setVisible(false);
				// 2. Approve Button
				view.byId("btnApprove").setVisible(false);
				// 3. Reject Button
				view.byId("btnReject").setVisible(false);
			}
		}
	},
	// 	This method is used to hide GRM-related footer buttons
	inVisibleManagerButtons: function(evt) {
		view.byId("btnSendBack").setVisible(false);
		view.byId("btnApprove").setVisible(false);
		view.byId("btnReject").setVisible(false);
		view.byId("btnApproveCancel").setVisible(false);
		view.byId("btnRejectCancel").setVisible(false);
	},

	// 	This method is used to unhide DEPU-related footer buttons
	visibleDeputationButtons: function(evt) {
		var aData = view.getModel().getData();
		var globalData = sap.ui.getCore().getModel("global").getData();
		// For each button in this list, logic for showing them should be considered
		var prefix = aData.screenData.ZZ_STAT_FLAG.substring(0, 2);
		var action = aData.screenData.ZZ_STAT_FLAG.substring(2, 5);

		if (aData.screenData.ZZ_DEP_TYPE == "INTL") {
			// 1. Upload Button
			view.byId("btnDEPUUpload").setVisible(false);
			// 2. Download Button
			view.byId("btnDEPUDownload").setVisible(false);
			// 3. Verified Button in verification and invite
			if (globalData.currentStage == "2" && globalData.currentSubSet == "1_1_1") {
				if (prefix == "AA" && action == "005") {
					view.byId("btnDEPUVerified").setVisible(true);
				} else {
					view.byId("btnDEPUVerified").setVisible(false);
				}
			} else {
				view.byId("btnDEPUVerified").setVisible(false);
			}
			// 4. Verified Docs Button in Visa Submission screen
			if (globalData.currentStage == "2" && globalData.currentSubSet == "1_3_1") {
				if (prefix == "AA" && action == "007") {
					view.byId("btnDEPUVerifiedDocs").setVisible(true);
				} else {
					view.byId("btnDEPUVerifiedDocs").setVisible(false);
				}
			} else {
				view.byId("btnDEPUVerifiedDocs").setVisible(false);
			}
			// 5. Invitation Button
			if (globalData.currentStage == "2" && globalData.currentSubSet == "1_1_1") {
				if (prefix == "JJ" && action == "005") {
					view.byId("btnDEPUInvitation").setVisible(true);
					view.byId("btnDEPUInvitationButton").setVisible(true);
					if (aData.screenData.ZZ_DEP_TOCNTRY == "AT") {
						view.byId("btnDEPUInvitationButton").setButtonText("AMS and Invitation Letter");
					} else {
						view.byId("btnDEPUInvitationButton").setButtonText("Upload Invitation Letter");
					}

					if (aData.screenData.ZZ_DEP_TOCNTRY == "DE") {
						view.byId("btnDEPUPreInvitationButton").setVisible(true);
					} else {
						view.byId("btnDEPUPreInvitationButton").setVisible(false);
					}
				} else {
					view.byId("btnDEPUInvitation").setVisible(false);
					view.byId("btnDEPUInvitationButton").setVisible(false);
					view.byId("btnDEPUPreInvitationButton").setVisible(false);
				}
			} else {
				view.byId("btnDEPUInvitation").setVisible(false);
				view.byId("btnDEPUInvitationButton").setVisible(false);
				view.byId("btnDEPUPreInvitationButton").setVisible(false);
			}
			// 6. Visa copy Button in Visa Submission screen
			if (globalData.currentStage == "2" && globalData.currentSubSet == "1_3_1") {
				if (prefix == "JJ" && action == "008") {
					view.byId("btnDEPUVisaCopy").setVisible(true);
				} else {
					view.byId("btnDEPUVisaCopy").setVisible(false);
				}
			} else {
				view.byId("btnDEPUVisaCopy").setVisible(false);
			}
			// 7. Coc Button
			if (globalData.currentStage == "2" && globalData.currentSubSet == "1_3_1") {
				if (prefix == "JJ" && action == "009") {
					view.byId("btnDEPUCOC").setVisible(true);
					view.byId("btnDEPUCOCButton").setVisible(true);
				} else {
					view.byId("btnDEPUCOC").setVisible(false);
					view.byId("btnDEPUCOCButton").setVisible(false);
				}
			} else {
				view.byId("btnDEPUCOC").setVisible(false);
				view.byId("btnDEPUCOCButton").setVisible(false);
			}
			// 8. Verified Additional Docs Button in Passport Collection screen
			if (globalData.currentStage == "2" && globalData.currentSubSet == "1_4_1") {
				if (prefix == "AA" && action == "008") {
					view.byId("btnDEPUVerifiedAddDocs").setVisible(true);
				} else {
					view.byId("btnDEPUVerifiedAddDocs").setVisible(false);
				}
			} else {
				view.byId("btnDEPUVerifiedAddDocs").setVisible(false);
			}
			// 9. Passport Return Button
			if (globalData.currentStage == "2" && globalData.currentSubSet == "1_4_1") {
				if (prefix == "JJ" && action == "013") {
					view.byId("btnDEPUPassportReturn").setVisible(true);
				} else {
					view.byId("btnDEPUPassportReturn").setVisible(false);
				}
			} else {
				view.byId("btnDEPUPassportReturn").setVisible(false);
			}
		} else {
			// 1. Upload Button
			view.byId("btnDEPUUpload").setVisible(false);
			// 2. Download Button
			view.byId("btnDEPUDownload").setVisible(false);
			// 3. Verified Button
			view.byId("btnDEPUVerified").setVisible(false);
		}

		// 4. Generate CL, Sendback, Reject buttons
		if (action != "002") {
			view.byId("btnDEPUReject").setVisible(true);
		} else {
			view.byId("btnDEPUReject").setVisible(false);
		}
		if (aData.screenData.ZZ_DEP_TYPE == "DOME") {
			if (prefix != "AA" && prefix != "JJ" && prefix != "CL") {
				view.byId("btnDEPUClose").setVisible(false);
				if (action == "001") {
					view.byId("btnDEPUGenerateCL").setVisible(true);
					view.byId("btnDEPUSendBack").setVisible(true);
				} else {
					view.byId("btnDEPUGenerateCL").setVisible(false);
					view.byId("btnDEPUSendBack").setVisible(true);
				}
			} else if (prefix == "AA") {
				if (action == "014") {
					view.byId("btnDEPUGenerateCL").setVisible(true);
				} else {
					view.byId("btnDEPUGenerateCL").setVisible(false);
				}

				// 5. Approve button
				if (aData.screenData.ZZ_STAT_FLAG == "AA004" || aData.screenData.ZZ_STAT_FLAG == "AA002") {
					view.byId("btnDEPUClose").setVisible(true);
					view.byId("btnDEPUSendBack").setVisible(true);
				} else {
					view.byId("btnDEPUSendBack").setVisible(false);
					view.byId("btnDEPUClose").setVisible(false);
				}
			} else if (prefix == "JJ") {
				view.byId("btnDEPUGenerateCL").setVisible(false);
				view.byId("btnDEPUSendBack").setVisible(false);
				view.byId("btnDEPUClose").setVisible(false);
			} else {
				view.byId("btnDEPUGenerateCL").setVisible(false);
				view.byId("btnDEPUSendBack").setVisible(false);
				view.byId("btnDEPUClose").setVisible(false);
			}
		} else {
			if (aData.screenData.ZZ_VREASON == "DH" && action == "001" && prefix != "AA") {
				// Approve button only apply for accepting new returning date
				view.byId("btnDEPUGenerateCL").setVisible(false);
				view.byId("btnDEPUSendBack").setVisible(false);
				view.byId("btnDEPUApprove").setVisible(true);
			} else {
				view.byId("btnDEPUApprove").setVisible(false);
				// Generate CL Button
				if (globalData.currentStage == "1" && globalData.currentSubSet == "1_2_1") {
					if ((prefix == "HH" && action == "001") || (aData.screenData.ZZ_STAT_FLAG == "AA014")) {
						view.byId("btnDEPUGenerateCL").setVisible(true);
					} else {
						view.byId("btnDEPUGenerateCL").setVisible(false);
					}
				} else {
					view.byId("btnDEPUGenerateCL").setVisible(false);
				}

				// Send back
				if ((globalData.currentStage == "1" && globalData.currentSubSet == "1_2_1") ||
						(globalData.currentStage == "2" && globalData.currentSubSet == "1_1_1") ||
						(globalData.currentStage == "2" && globalData.currentSubSet == "1_2_1") ||
						(globalData.currentStage == "2" && globalData.currentSubSet == "1_3_1") || 
						(globalData.currentStage == "2" && globalData.currentSubSet == "1_4_1")) {
					if ((prefix == "HH" && action == "001") || (prefix == "AA" && action == "005") || 
							(prefix == "AA" && action == "007") || (prefix == "AA" && action == "008")) {
						view.byId("btnDEPUSendBack").setVisible(true);
					} else {
						view.byId("btnDEPUSendBack").setVisible(false);
					}
				} else {
					view.byId("btnDEPUSendBack").setVisible(false);
				}
			}
		}
	},
	// 	This method is used to hide DEPU-related footer buttons
	inVisibleDeputationButtons: function(evt) {
		view.byId("btnDEPUSendBack").setVisible(false);
		view.byId("btnDEPUReject").setVisible(false);
		view.byId("btnDEPUClose").setVisible(false);
		view.byId("btnDEPUUpload").setVisible(false);
		view.byId("btnDEPUDownload").setVisible(false);
		view.byId("btnDEPUVerified").setVisible(false);
		view.byId("btnDEPUGenerateCL").setVisible(false);
		view.byId("btnDEPUInvitation").setVisible(false);
		view.byId("btnDEPUInvitationButton").setVisible(false);
		view.byId("btnDEPUPreInvitationButton").setVisible(false);
		view.byId("btnDEPUVerifiedDocs").setVisible(false);
		view.byId("btnDEPUVisaCopy").setVisible(false);
		view.byId("btnDEPUCOC").setVisible(false);
		view.byId("btnDEPUCOCButton").setVisible(false);
		view.byId("btnDEPUPassportReturn").setVisible(false);
		view.byId("btnDEPUVerifiedAddDocs").setVisible(false);
		view.byId("btnDEPUApprove").setVisible(false);
	},

	// 	Display footer buttons based on current status of a request
	displayFooterButtons: function() {
		var globalData = sap.ui.getCore().getModel("global").getData();
		var aData = view.getModel().getData();
		var currentRole = sap.ui.getCore().getModel("profile").getData().currentRole;
		// Set visibility of Left Buttons (always visible)
		view.byId("btnHome").setVisible(true);
		// Consider to display Comment History button
		if (sDeputationNo == "" || sDeputationNo == null) {
			view.byId("btnCommentHistory").setVisible(false);
		} else {
			view.byId("btnCommentHistory").setVisible(true);
		}
		// Non-Cancel process
		if ((aData.screenData.ZZ_REQ_TYP == "DEPU" &&      // Depu check
				aData.screenData.ZZ_STAT_FLAG != "AA001" && 
				aData.screenData.ZZ_STAT_FLAG != "CANCL") ||
				(aData.screenData.ZZ_REQ_TYP != "DEPU" &&      // Travel check 
						(aData.screenData.ZZ_STAT_FLAG.substring(2, 5) != "001" || aData.screenData.ZZ_STAT_FLAG == "FF001") &&
						aData.screenData.ZZ_STAT_FLAG != "FF002" && aData.screenData.ZZ_STAT_FLAG.substring(2, 5) != "009")) {
			if (!globalData.isChange) { // Logic for Forward Process
				// Should not visible any button if it is navigated from my request Tab
				if (globalData.whichTab != "MR") {
					// Set visibility of Middle buttons
					if (currentRole == "EMP") {           // If current role is EMP, visible save button
						// Set visibility of Save deputation button
						if (sDeputationNo == '') {
							if (aData.screenData.ZZ_REQ_TYP == "BUSR" || aData.screenData.ZZ_REQ_TYP == "SECO" ||
									aData.screenData.ZZ_REQ_TYP == "HOME" || aData.screenData.ZZ_REQ_TYP == "EMER" ||
									aData.screenData.ZZ_REQ_TYP == "INFO") {
								view.byId("btnSave").setVisible(false);
							} else {
								view.byId("btnSave").setVisible(true);
							}
						} else {
							if (aData.screenData.ZZ_REQ_TYP == "BUSR" || aData.screenData.ZZ_REQ_TYP == "SECO" ||
									aData.screenData.ZZ_REQ_TYP == "HOME" || aData.screenData.ZZ_REQ_TYP == "EMER" ||
									aData.screenData.ZZ_REQ_TYP == "INFO") {
								view.byId("btnSave").setVisible(false);
							} else {
								var prefix = aData.screenData.ZZ_STAT_FLAG.substring(0, 2);
								var action = aData.screenData.ZZ_STAT_FLAG.substring(2, 5);
								if (aData.screenData.ZZ_STAT_FLAG == "AA000" && oDeputationThis.currentStage == "1" &&
										oDeputationThis.currentSet == "1_1" && 
										(aData.screenData.ZZ_REQ_TYPE == "DEPU" || aData.screenData.ZZ_REQ_TYPE == "" 
											|| aData.screenData.ZZ_REQ_TYPE == null)) {
									view.byId("btnSave").setVisible(true);
								} else {
									view.byId("btnSave").setVisible(false);
								}
							}
						}
						// Set visibility of Save travel plan button
						view.byId("btnSaveTravelPlan").setVisible(false);
						$.when(oDeputationThis.travelDeffered).then(function() {
							if (!globalData.isChange) {
								if (sDeputationNo == '') {
									if (aData.screenData.ZZ_REQ_TYP == "BUSR" || aData.screenData.ZZ_REQ_TYP == "SECO" ||
											aData.screenData.ZZ_REQ_TYP == "HOME" || aData.screenData.ZZ_REQ_TYP == "EMER" ||
											aData.screenData.ZZ_REQ_TYP == "INFO") {

										if (sap.ui.getCore().getModel("global").getData().isCreate) {
											if (aData.screenData.ZZ_REQ_TYP != "HOME" && aData.screenData.ZZ_REQ_TYP != "EMER") {
												view.byId("btnSaveTravelPlan").setVisible(true);
											} else {
												view.byId("btnSaveTravelPlan").setVisible(false);
											}
										} else {
											var curDate = new Date();
											var startDate = new Date(TravelPlanThis.getView().getModel().getData().ZZ_DATV1.substr(0, 4), 
													TravelPlanThis.getView().getModel().getData().ZZ_DATV1.substr(4, 2) - 1, 
													TravelPlanThis.getView().getModel().getData().ZZ_DATV1.substr(6, 2));
											if (startDate < curDate && TravelPlanThis.getView().getModel().getData().ZZ_VERSION.trim() != "1") {
												view.byId("btnSaveTravelPlan").setVisible(false);
											} else {
												view.byId("btnSaveTravelPlan").setVisible(true);
											}
										}

									} else {
										view.byId("btnSaveTravelPlan").setVisible(false);
									}
								} else {
									if ((globalData.currentStage == "1" && globalData.currentSubSet == "1_1_1") || 
											(globalData.currentStage == "2" && globalData.currentSubSet == "1_1_1") ||
											(globalData.currentStage == "3" && globalData.currentSubSet == "1_1_1")) {
										if (aData.screenData.ZZ_STAT_FLAG == "AA000" ||
												aData.screenData.ZZ_STAT_FLAG == "") {
											if (sap.ui.getCore().getModel("global").getData().isCreate) {
												if (aData.screenData.ZZ_REQ_TYP != "HOME" && aData.screenData.ZZ_REQ_TYP != "EMER") {
													view.byId("btnSaveTravelPlan").setVisible(true);
												} else {
													view.byId("btnSaveTravelPlan").setVisible(false);
												}
											} else {
												var curDate = new Date();
												var startDate = new Date(TravelPlanThis.getView().getModel().getData().ZZ_DATV1.substr(0, 4), 
														TravelPlanThis.getView().getModel().getData().ZZ_DATV1.substr(4, 2) - 1, 
														TravelPlanThis.getView().getModel().getData().ZZ_DATV1.substr(6, 2));
												if (startDate < curDate && TravelPlanThis.getView().getModel().getData().ZZ_VERSION.trim() != "1") {
													view.byId("btnSaveTravelPlan").setVisible(false);
												} else {
													view.byId("btnSaveTravelPlan").setVisible(true);
												}
											}
										} else {
											view.byId("btnSaveTravelPlan").setVisible(false);
										}
									} else {
										view.byId("btnSaveTravelPlan").setVisible(false);
									}
								}
							} else {
								view.byId("btnSaveTravelPlan").setVisible(false);
							}
							oDeputationThis.travelDeffered = $.Deferred();
						});
						// Set visibility of delete button
						if (sDeputationNo == "" || sDeputationNo == null) {
							view.byId("btnDelete").setVisible(false);
						} else {
							if ((aData.screenData.ZZ_STAT_FLAG == "AA000"||aData.screenData.ZZ_STAT_FLAG == "BB000"
								||aData.screenData.ZZ_STAT_FLAG == "CC000"||aData.screenData.ZZ_STAT_FLAG == "DD000"
								||aData.screenData.ZZ_STAT_FLAG == "EE000")
									&& oDeputationThis.currentStage == "1" &&
									oDeputationThis.currentSet == "1_1") {
								if (aData.screenData.ZZ_REQ_TYP == "DEPU" || aData.screenData.ZZ_REQ_TYP == "BUSR" ||
										aData.screenData.ZZ_REQ_TYP == "SECO") {
									view.byId("btnDelete").setVisible(true);
								} else {
									view.byId("btnDelete").setVisible(false);
								}
							} else {
								view.byId("btnDelete").setVisible(false);
							}
						}
					} else {                    // If current role is not EMP, invisible save button
						view.byId("btnSave").setVisible(false);
						view.byId("btnSaveTravelPlan").setVisible(false);
					}

					// Set visibility of Right buttons
					if (currentRole == "EMP") {
						// visible employee buttons
						oDeputationThis.visibleEmployeeButtons();
						// invisible manager buttons
						oDeputationThis.inVisibleManagerButtons();
						// invisible deputation buttons
						oDeputationThis.inVisibleDeputationButtons();
					} else if (currentRole == "GRM") {
						// invisible employee buttons
						oDeputationThis.inVisibleEmployeeButtons();
						// visible manager common buttons
						oDeputationThis.visibleManagerButtons();
						// visible deputation buttons
						oDeputationThis.inVisibleDeputationButtons();
					} else if (currentRole == "DEPU") {
						// invisible employee buttons
						oDeputationThis.inVisibleEmployeeButtons();
						// invisible manager buttons
						oDeputationThis.inVisibleManagerButtons();
						// visible deputation buttons
						oDeputationThis.visibleDeputationButtons();
					} else {
						// invisible employee buttons
						oDeputationThis.inVisibleEmployeeButtons();
						// invisible manager buttons
						oDeputationThis.inVisibleManagerButtons();
						// invisible deputation buttons
						oDeputationThis.inVisibleDeputationButtons();
					}
				} else {
					oDeputationThis.invisibleAllButtons();
					if(aData.screenData.ZZ_REQ_TYP == "HOME" || aData.screenData.ZZ_REQ_TYP == "EMER"){
						if(globalData.ZZ_STAT_FLAG && globalData.ZZ_STAT_FLAG!=""){
							if(globalData.ZZ_STAT_FLAG.substring(2,5)=="008"){
								view.byId("btnEMPSubmitTravelPlan").setVisible(true);
							}
						}
					}
				}
			} else {    // Logic for Change Process Buttons
				oDeputationThis.invisibleAllButtons();
				if (currentRole == "EMP") {
					var globalData = sap.ui.getCore().getModel("global").getData();
					if (globalData.currentStage == "1" && globalData.currentSubSet == "1_1_1" && 
							aData.screenData.ZZ_REQ_TYP == "DEPU") {
						view.byId("btnSave").setVisible(false);
						view.byId("btnSaveTravelPlan").setVisible(false);
						view.byId("btnEMPChange").setVisible(true);
						view.byId("btnEMPSubmitTravelPlan").setVisible(false);
						view.byId("btnSaveTravelPlan").setVisible(false);
					} else {
						view.byId("btnSave").setVisible(false);
						view.byId("btnEMPChange").setVisible(false);
						view.byId("btnEMPSubmitTravelPlan").setVisible(true);
						view.byId("btnSaveTravelPlan").setVisible(false);
					}
				} else {
					view.byId("btnSave").setVisible(false);
					view.byId("btnSaveTravelPlan").setVisible(false);
					view.byId("btnEMPChange").setVisible(false);
					view.byId("btnEMPSubmitTravelPlan").setVisible(false);
					view.byId("btnSaveTravelPlan").setVisible(false);
				}
			}
		} else {  // Logic for Cancellation Process
			oDeputationThis.invisibleAllButtons();
			// Consider approve cancel button / reject cancel button
			if (currentRole == "GRM") {
				if ((aData.screenData.ZZ_REQ_TYP == "DEPU" && aData.screenData.ZZ_STAT_FLAG == "AA001") ||  // DEPU Check
						(aData.screenData.ZZ_REQ_TYP != "DEPU" &&                         // TRAVEL Check
								(aData.screenData.ZZ_STAT_FLAG.substring(2, 5) == "001" ||
										aData.screenData.ZZ_STAT_FLAG.substring(2, 5) == "009"))) {
					view.byId("btnApproveCancel").setVisible(true);
					view.byId("btnRejectCancel").setVisible(true);
				} else {
					view.byId("btnApproveCancel").setVisible(false);
					view.byId("btnRejectCancel").setVisible(false);
				}
			} else {
				view.byId("btnApproveCancel").setVisible(false);
				view.byId("btnRejectCancel").setVisible(false);
			}
		}
		view.getModel().setData(aData);
	},
	// FOOTER ACTION BUTTONS
	
	// This method is used for validating the VISA for SELF during uploading visacopy
	validateVisaUploadSelf:function(aData){
		// Validate visa header
		if(aData.selfVisa.ZZ_VISA_SDATE == ""){
			aData.selfVisa.ZZ_VISA_SDATE_ERROR = "Error";
			return "Please check Visa Valid From";
		}else{
			aData.selfVisa.ZZ_VISA_SDATE_ERROR = "None";
		}

		if(aData.selfVisa.ZZ_VISA_EDATE == ""){
			aData.selfVisa.ZZ_VISA_EDATE_ERROR = "Error";
			return "Please check Visa Valid To";
		}else{
			aData.selfVisa.ZZ_VISA_EDATE_ERROR = "None";
		}

		if(parseInt(aData.selfVisa.ZZ_VISA_SDATE) > parseInt(aData.selfVisa.ZZ_VISA_EDATE)){
			aData.selfVisa.ZZ_VISA_SDATE_ERROR = "Error";
			aData.selfVisa.ZZ_VISA_EDATE_ERROR = "Error";
			return "Visa Valid To must be greater than Visa Valid From";
		}else{
			aData.selfVisa.ZZ_VISA_SDATE_ERROR = "None";
			aData.selfVisa.ZZ_VISA_EDATE_ERROR = "None";
		}

//		// Visa enddate must be greater than deputation startdate
//		if(parseInt(aData.selfVisa.ZZ_VISA_EDATE) < parseInt(aData.screenData.ZZ_DEP_STDATE)){
//		aData.selfVisa.ZZ_VISA_EDATE_ERROR = "Error";
//		return "Visa Valid To must be greater than Deputation Start date";
//		}else{
//		aData.selfVisa.ZZ_VISA_EDATE_ERROR = "None";
//		}

		// Visa startdate must be less than deputation startdate
//		if(parseInt(aData.selfVisa.ZZ_VISA_SDATE) > parseInt(aData.screenData.ZZ_DEP_STDATE)){
//		aData.selfVisa.ZZ_VISA_SDATE_ERROR = "Error";
//		return "Visa Valid From must be less than Deputation Start date";
//		}else{
//		aData.selfVisa.ZZ_VISA_SDATE_ERROR = "None";
//		}

		if(aData.selfVisa.ZZ_VISA_NO.trim() == ""){
			aData.selfVisa.ZZ_VISA_NO_ERROR = "Error";
			return "Please enter required field";
		}else{
			aData.selfVisa.ZZ_VISA_NO_ERROR = "None";
		}

		if(aData.selfVisa.ZZ_CURR_VISA_TYP.trim() == ""){
			aData.selfVisa.ZZ_PASSPORT_NO_ERROR = "Error";
			return "Please enter required field";
		}else{
			aData.selfVisa.ZZ_PASSPORT_NO_ERROR = "None";
		}

		if(!aData.selfVisa.visibleOpen &&
				sap.ui.getCore().getModel("profile").getData().currentRole == "EMP"){
			return "Please upload visa copy of the request's owner";
		}
		return  "";
	},
	// This method is used for validating the VISA for DEPENDENTS during uploading visacopy
	validateVisaUploadDependent:function(aData){
		var globalData = sap.ui.getCore().getModel("global").getData();
		var aData = view.getModel().getData();
		if (globalData.currentStage == "1" && globalData.currentSet == "1_2" && aData.screenData.ZZ_DEP_TYPE == "INTL") {
			for (var i=0; i < aData.visaExistingDependent.length; i++) {
				if( aData.visaExistingDependent[i].ZZ_VISA_SDATE == "" ){
					aData.visaExistingDependent[i].ZZ_VISA_SDATE_ERROR = "Error";
					return "Please check visa valid from";
				}else{
					aData.visaExistingDependent[i].ZZ_VISA_SDATE_ERROR = "None";
				}

				if( aData.visaExistingDependent[i].ZZ_VISA_EDATE == "" ){
					aData.visaExistingDependent[i].ZZ_VISA_EDATE_ERROR = "Error";
					return "Please check visa valid to";
				}else{
					aData.visaExistingDependent[i].ZZ_VISA_EDATE_ERROR = "None";
				}

				if(parseInt(aData.visaExistingDependent[i].ZZ_VISA_SDATE) > parseInt(aData.visaExistingDependent[i].ZZ_VISA_EDATE)){
					aData.visaExistingDependent[i].ZZ_VISA_SDATE_ERROR = "Error";
					aData.visaExistingDependent[i].ZZ_VISA_SDATE_ERROR = "Error";
					return "Visa Valid To must be greater than Visa Valid From";
				}else{
					aData.visaExistingDependent[i].ZZ_VISA_SDATE_ERROR = "None";
					aData.visaExistingDependent[i].ZZ_VISA_EDATE_ERROR = "None";
				}

				if( aData.visaExistingDependent[i].ZZ_VISA_NO.trim() == "" ){
					aData.visaExistingDependent[i].ZZ_VISA_NO_ERROR = "Error";
					return "Please enter required field";
				}else{
					aData.visaExistingDependent[i].ZZ_VISA_NO_ERROR = "None";
				}

				if( aData.visaExistingDependent[i].ZZ_CURR_VISA_TYP.trim() == "" ){
					aData.visaExistingDependent[i].ZZ_PASSPORT_NO_ERROR = "Error";
					return "Please enter required field";
				}else{
					aData.visaExistingDependent[i].ZZ_PASSPORT_NO_ERROR = "None";
				}

				if( !aData.visaExistingDependent[i].visibleOpen &&
						sap.ui.getCore().getModel("profile").getData().currentRole == "EMP"){
					return "Please upload visa copy for dependent " + aData.visaExistingDependent[i].ZZ_DEPNDT_TYP;
				}
			}
		}
		return "";
	},
/*------------------------CUSTOM FUNCTION AREA END------------------------*/


/*------------------------USER EVENT HANDLER AREA BEGIN------------------------*/
	// EVENT ON CLOSING THE COMMON DIALOG OF this Controller
	onCloseDialog : function(evt) {
		try {
			oDeputationThis.oCommonDialog.close();
		} catch(exc) {}
	},
	// EVENT ON CHANGE OF DEPUTATION Startdate/Enddate on first screen
	onDeputationDateChange : function(evt) {
		oDeputationThis.showDuration();
	},
	// EVENT ON CLICKING OF BUTTON CHECK PROFILE during creation of a request
	onCheckProfile : function(evt) {
		var globalData = sap.ui.getCore().getModel("global").getData();
		globalData.isProfileView = true;
		sap.ui.getCore().getModel("global").setData(globalData);

		sap.m.MessageBox.confirm(
				"Any unsaved data will be lost, do you want to continue ?",
				function (oAction){
					if(oAction == "OK" ){
						sap.ui.project.e2etm.util.StaticUtility.openProfileDialog(oDeputationThis, view);
					} else if (oAction == "CANCEL") {
						return;
					}
				},
				"Confirmation"
		);
		return;
	},
	// EVENT ON CLICKING OF Document templates LINK inside PANEL DOCUMENT
	onOpenTemplates : function(evt) {
		try {
			$.browser.msie = /msie/.test(navigator.userAgent.toLowerCase()); 
			$.browser.mozilla = /firefox/.test(navigator.userAgent.toLowerCase()); 
			$.browser.chrome = /chrom(e|ium)/.test(navigator.userAgent.toLowerCase()); 

			if ($.browser.msie) { //IE
				url = "file://bosch.com/DfsRB/DfsIN/LOC/Kor/HRL/HRL-TD/HRL-TD-Share/18-Global_Mobility/Immigration";
			} else if ($.browser.mozilla) {
				url = "file://///bosch.com/DfsRB/DfsIN/LOC/Kor/HRL/HRL-TD/HRL-TD-Share/18-Global_Mobility/Immigration";
				sap.ca.ui.message.showMessageBox({
					type: sap.ca.ui.message.Type.ERROR,
					message: "Please right click on this link and copy the URL, then try accessing it from new tab.",
					details: "Please right click on this link and copy the URL, then try accessing it from new tab.",
				});
				return;
			} else if ($.browser.chrome) {
				url = "file://///bosch.com/DfsRB/DfsIN/LOC/Kor/HRL/HRL-TD/HRL-TD-Share/18-Global_Mobility/Immigration";
			} else {
				url = "file://bosch.com/DfsRB/DfsIN/LOC/Kor/HRL/HRL-TD/HRL-TD-Share/18-Global_Mobility/Immigration";
			}
		} catch(exc) {}
	},
	
	/*------------------------------------------------------------------------------------*/
		/* EVENTS from WORKFLOW APPROVAL DIALOG (onChange dropdownlist...)
	/*------------------------------------------------------------------------------------*/
	onServiceTypeChange : function(evt) {
		var strAsignment = sap.ui.getCore().byId("cbAssModel").getSelectedKey();
		var strServiceCon = sap.ui.getCore().byId("cbServiceCon").getSelectedKey();
		var aData = view.getModel().getData();
		if (strServiceCon == "SPCL") {
			sap.ui.getCore().byId("txtServiceDuration").setEnabled(true);
			sap.ui.getCore().byId("txtServiceDuration").setValue("");
			sap.ui.getCore().byId("managerServiceConditionCheck1").setVisible(true);
			sap.ui.getCore().byId("flexBoxServiceCheckManager").setVisible(true);
		} else {
			sap.ui.getCore().byId("txtServiceDuration").setEnabled(false);
			sap.ui.getCore().byId("txtServiceDuration").setValue("6");
			sap.ui.getCore().byId("managerServiceConditionCheck1").setVisible(false);
			sap.ui.getCore().byId("flexBoxServiceCheckManager").setVisible(false);
		}
		
//		if ((strAsignment == "VA" || strAsignment == "VN") && 
//				aData.screenData.ZZ_DEP_TYPE == "INTL") {
//			sap.ui.getCore().byId("txtServiceDuration").setValue("24");
//		}
	},
	// EVENT ON CHANGE OF ASSIGNMENT MODEL IN MANAGER APPROVAL DIALOG
	onAssignmentModelChange : function(evt) {
		var strAsignment = sap.ui.getCore().byId("cbAssModel").getSelectedKey();
		var strServiceCon = sap.ui.getCore().byId("cbServiceCon").getSelectedKey();
/*Start-CGGS Changes*/					
		sap.ui.getCore().byId("cggsFlxBoxDialog").setVisible(false);
/*End-CGGS Changes*/					
		var aData = view.getModel().getData();
		if (aData.screenData.ZZ_DEP_TYPE == 'DOME') {
			if (strAsignment == "TRFR") {
				if (aData.screenData.ZZ_DEP_FRMLOC == aData.screenData.ZZ_DEP_TOLOC) {
					sap.ui.getCore().byId("managerWFDialogTravelPlanCheck").setChecked(false);
				} else {
					sap.ui.getCore().byId("managerWFDialogTravelPlanCheck").setChecked(true);
				}
			} else {
				if (strAsignment == "LDEP" || strAsignment == "BDEP") {
					sap.ui.getCore().byId("managerWFDialogTravelPlanCheck").setChecked(false);
				} else {
					sap.ui.getCore().byId("managerWFDialogTravelPlanCheck").setChecked(true);
				}
			}
		} else if (aData.screenData.ZZ_DEP_TYPE == 'INTL') {
			sap.ui.getCore().byId("managerWFDialogTravelPlanCheck").setChecked(true);
		} else {
			sap.ui.getCore().byId("managerWFDialogTravelPlanCheck").setChecked(true);
		}
		
		if (strAsignment == "TRFR" && aData.screenData.ZZ_DEP_TYPE == "DOME") {
			sap.ui.getCore().byId("flexBoxTransferReasonManager").setVisible(true);
		} else {
			sap.ui.getCore().byId("flexBoxTransferReasonManager").setVisible(false);
		}
		
		// Reset Service duration to 24 by default
//		if ((strAsignment == "VA" || strAsignment == "VN") && 
//				aData.screenData.ZZ_DEP_TYPE == "INTL") {
//			sap.ui.getCore().byId("txtServiceDuration").setValue("24");
//		} else {
			if (strServiceCon == "SPCL") {
				sap.ui.getCore().byId("txtServiceDuration").setEnabled(true);
				sap.ui.getCore().byId("txtServiceDuration").setValue("");
				sap.ui.getCore().byId("managerServiceConditionCheck1").setVisible(true);
				sap.ui.getCore().byId("flexBoxServiceCheckManager").setVisible(true);
			} else {
				sap.ui.getCore().byId("txtServiceDuration").setEnabled(false);
				if (aData.screenData.ZZ_DEP_DAYS <= 90) {
					sap.ui.getCore().byId("txtServiceDuration").setValue("3");
				} else {
					sap.ui.getCore().byId("txtServiceDuration").setValue("6");
				}
				sap.ui.getCore().byId("managerServiceConditionCheck1").setVisible(false);
				sap.ui.getCore().byId("flexBoxServiceCheckManager").setVisible(false);
			}
//		}
		
		var sAsg_type = sap.ui.getCore().byId("cbAssModel").getSelectedKey();
/*Start-CGGS Changes*/		
		sap.ui.getCore().getModel("global").getData().cggsdata.Asgtyp = sAsg_type;
/*End-CGGS Changes*/	
		// changes to family details 10/08/2016
		
		if(aData.screenData.ZZ_DEP_TOCNTRY_TXT == "Germany"){
			if(sAsg_type == "STA"){
				sap.ui.getCore().byId("cbEligible").setSelectedKey("");
	/*Start-CGGS Changes*/			
				 var cggsdata = oDeputationThis.getView().getModel("cggsmodel").getData();
				
				 var cggsFlag = sap.ui.project.e2etm.util.StaticUtility.visibleCggsData(
							
							sap.ui.getCore().getModel("global").getData().ZZ_TRV_REQ,
							cggsdata.Tocntry,cggsdata.Asgtyp,
							sap.ui.getCore().getModel("global").getData().ZZ_REQ_TYP,
							sap.ui.getCore().getModel("global").getData().ZZ_TRV_CAT);
				 
			     sap.ui.getCore().byId("cggsFlxBoxDialog").setVisible(cggsFlag);
	/*End-CGGS Changes*/
			}else if(sAsg_type == "VA" || sAsg_type == "VN"){
				sap.ui.getCore().byId("cbEligible").setSelectedKey("X");
			}else{
				sap.ui.getCore().byId("cbEligible").setSelectedKey("");
			}
			
			
		}	
		 if( sAsg_type == "STVA"){
			if(Number(aData.screenData.ZZ_DEP_DAYS) >= 395){
				sap.ui.getCore().byId("cbEligible").setSelectedKey("X");
			}else{
				sap.ui.getCore().byId("cbEligible").setSelectedKey("");
			}
		}
			//changes to family details
		 sap.ui.getCore().getModel("global").refresh(true);
		 aData.screenData.ZZ_ASG_TYP = sAsg_type;
		 
		 if (aData.screenData.ZZ_ASG_TYP == "NC") {
		    	sap.ui.getCore().byId("cbEligible").setSelectedKey("");
		    	sap.ui.getCore().byId("cbEligible").setEnabled(false); 
		    	sap.ui.getCore().byId("cbServiceCon").setEnabled(false); 
		    	sap.ui.getCore().byId("cbServiceCon").setSelectedKey("NORM"); 
		    	sap.ui.getCore().byId("txtServiceDuration").setValue("6");
		    	sap.ui.getCore().byId("txtServiceDuration").setEnabled(false); 
		 }else if(aData.screenData.ZZ_ASG_TYP == "STA"){
			 sap.ui.getCore().byId("cbEligible").setSelectedKey("");
		     sap.ui.getCore().byId("cbEligible").setEnabled(false); 
		 }else if(aData.screenData.ZZ_ASG_TYP == "VA" || aData.screenData.ZZ_ASG_TYP == "VN"){
			 sap.ui.getCore().byId("cbEligible").setSelectedKey("X");
		     sap.ui.getCore().byId("cbEligible").setEnabled(false); 
		 }
		  
		 sap.ui.project.e2etm.util.StaticUtility.fetchCGGSChecklistForms(aData.screenData,sap.ui.getCore().byId("grmDetailedCggsChecklist--cggsFormsDisplay"));
	
	},
	onCloseTripDialog : function(curEvt) {
		curEvt.getSource().getParent().close();
	},
	// EVENT ON CHANGE OF ASSIGNMENT MODEL IN GENERATE CL DIALOG
	onChangeAssignmentModel : function(evt) {
		var strAssModel = sap.ui.getCore().byId("cbAssModel").getSelectedKey();
		if (strAssModel == "STA" || strAssModel == "TRNG" || strAssModel == "STAPP") {
			sap.ui.getCore().byId("flexBoxMentor").setVisible(false);
			sap.ui.getCore().byId("flexBoxHost").setVisible(false);
			sap.ui.getCore().byId("flexBoxJob").setVisible(false);
		} else {
			sap.ui.getCore().byId("flexBoxMentor").setVisible(true);
			sap.ui.getCore().byId("flexBoxHost").setVisible(true);
			sap.ui.getCore().byId("flexBoxJob").setVisible(true);
		}
	},
	
	/*------------------------------------------------------------------------------------*/
		/* EVENTS from BREADCRUMB BUTTONS
	/*------------------------------------------------------------------------------------*/
	// EVENT ON CLICKING OF BUTTON "EMPLOYEE PROFILE" on TOP OF PAGE
	onViewOwnerProfile : function(evt) {
		if (sap.ui.getCore().getModel("profile").getData().currentRole == "EMP") {
			sap.ui.project.e2etm.util.StaticUtility.openProfileDialog(oDeputationThis, view);
		} else {
			var ownerProfileModel = new sap.ui.model.json.JSONModel();
			var aData = view.getModel().getData();
			var oDataModel = new sap.ui.model.odata.ODataModel(sServiceUrl);
			var batchOperation0 = oDataModel.createBatchOperation("DEP_EMPSet('" + aData.screenData.ZZ_DEP_PERNR + "')?$expand=EMPtoEMPDEPNDNT", "GET");
			var batchOperation1 = oDataModel.createBatchOperation("DEP_PASSPORT_INFOSet('" + aData.screenData.ZZ_DEP_PERNR + "')", "GET");
			oDataModel.addBatchReadOperations([batchOperation0,batchOperation1]);
			oDataModel.submitBatch(function(oResult){
				var data = {};
				data.employeeDetail = oResult.__batchResponses[0].data;
				data.dependentDetail = oResult.__batchResponses[0].data.EMPtoEMPDEPNDNT.results;
				data.employeeDetail.isEditable = false;
				data.passportDetail = oResult.__batchResponses[1].data;
				data.employeeDetail.isNotSingle = oResult.__batchResponses[1].data.ZZ_MARITIAL_STAT != "0";
				ownerProfileModel.setData(data);

				var globalData = sap.ui.getCore().getModel("global").getData();
				globalData.isProfileView = false;
				sap.ui.getCore().getModel("global").setData(globalData);
				sap.ui.project.e2etm.util.StaticUtility.openProfileDialog(oDeputationThis, view, ownerProfileModel);
			},function(oError){
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
				sap.ca.ui.message.showMessageBox({
					type: sap.ca.ui.message.Type.ERROR,
					message: "Sorry for this inconvenience. Please contact support team",
					details: oError.responseText
				});
			});
		};
	},
	// EVENT ON CLICKING OF BUTTON "VIEW MAIN REQUEST" on TOP OF PAGE
	// This button appears when openning a SECO, HOME, EMER
	
	onViewMainRequest : function(evt) {
		oDeputationThis.previousGlobal = {};
		oDeputationThis.previousGlobal = jQuery.extend(true, {}, sap.ui.getCore().getModel("global").getData());
		// Getting the details of an existing deputation request including the stage
		var get = $.ajax({
			cache: false,
			url: sServiceUrl + "DEP_HDR_INFOSet(ZZ_DEP_REQ='" + oDeputationThis.mainDeputationRequest + "',ZZ_VERSION='')?$expand=HDR_ITEM&$format=json",
			type: "GET"
		});
		get.done(function(data, header, response) {
			oHomeThis.navigateToDetailScreen(data.d, "MR", false, "", false);
		});
	},
	// EVENT ON CLICKING OF BUTTON "VIEW TRAVEL PDF" on TOP OF PAGE
	onViewPDF : function(evt) {
		var sRequestNo = "";
		if( view.getModel().getData().screenData.ZZ_REQ_TYP == "SECO" ){
			sRequestNo = view.getModel().getData().screenData.ZZ_DEP_REQ;
		}else{
			sRequestNo = view.getModel().getData().screenData.ZZ_TRV_REQ;
		}

		var sRead = sServiceUrl + "TravelPdfSet(EmpNo='" + view.getModel().getData().screenData.ZZ_DEP_PERNR
		+ "',TrNo='" + sRequestNo + "'," +
		"TrvKey='" + view.getModel().getData().screenData.ZZ_REQ_TYP + "',Module='REQ')/$value";
		window.open(sRead, '_blank');
	},
	// EVENT ON CLICKING OF BUTTON "ALL DATES" on TOP OF PAGE
	onViewRequestDates : function(evt) {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true,oHomeThis);
		var aData = view.getModel().getData();
		var get = $.ajax({
			cache: false,
			url: sServiceUrl + "AllDates?DepReq='" + aData.screenData.ZZ_DEP_REQ + "'&Version='" + aData.screenData.ZZ_VERSION + "'&$format=json",
			type: "GET",
		});
		get.fail(function(err) {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
		});
		get.done(function(result, response, header) {
			if (oDeputationThis.oCommonDialog) {
				oDeputationThis.oCommonDialog.destroy();
			}
			// instantiate the Fragment if not done yet
			oDeputationThis.oCommonDialog = sap.ui.xmlfragment("sap.ui.project.e2etm.fragment.common.AllDatesDialog", oDeputationThis);
			oDeputationThis.oCommonDialog.open();

			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(result.d.results);

			sap.ui.getCore().byId("tableAllDates").setModel(oModel);
			sap.ui.getCore().byId("tableAllDates").bindRows("/");
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
		});
	},
	// EVENT ON CLICKING OF BUTTON "DEPUTATION CONTACTS" on TOP OF PAGE
	onViewDeputationContacts : function(evt) {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true,oHomeThis);
		var aData = view.getModel().getData();
		var get = $.ajax({
			cache: false,
			url: sServiceUrl + "DepuContacts?Country='" + aData.screenData.ZZ_DEP_TOCNTRY + "'&$format=json",
			type: "GET",
		});
		get.fail(function(err) {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
		});
		get.done(function(result, response, header) {
			if (oDeputationThis.oCommonDialog) {
				oDeputationThis.oCommonDialog.destroy();
			}
			// instantiate the Fragment if not done yet
			oDeputationThis.oCommonDialog = sap.ui.xmlfragment("sap.ui.project.e2etm.fragment.common.AllContactsDialog", oDeputationThis);
			oDeputationThis.oCommonDialog.open();

			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(result.d.results);

			sap.ui.getCore().byId("tableAllContacts").setModel(oModel);
			sap.ui.getCore().byId("tableAllContacts").bindRows("/");
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
		});
	},
	// EVENT ON CLOSING "ALL DATES" DIALOG
	onCloseAllDatesDialog : function(evt) {
		try {
			oDeputationThis.oCommonDialog.close();
		} catch(exc) {}
	},
	
	/*------------------------------------------------------------------------------------*/
		/* EVENTS from FAMILY PANEL (onSelect radio buttons...)
	/*------------------------------------------------------------------------------------*/
	onfamilyAccompaniedSelectNo: function(evt){
		var aData = view.getModel().getData();
		aData.screenData.ZZ_FAMILY_ACCOMP = false;
		view.getModel().setData(aData);

		try {
			sap.ui.getCore().byId("flexBoxTravellingMembers").setVisible(false);
			sap.ui.getCore().byId("flexBoxFamilyJoining").setVisible(false);
		} catch(exc) {}
	},
	onfamilyAccompaniedSelectYes: function(evt){
		var aData = view.getModel().getData();
		aData.screenData.ZZ_FAMILY_ACCOMP = true;
		view.getModel().setData(aData);

		try {
			sap.ui.getCore().byId("flexBoxTravellingMembers").setVisible(true);
			sap.ui.getCore().byId("flexBoxFamilyJoining").setVisible(true);
//			oDeputationThis.displayFamilyPanel();
		} catch(exc) {}
	},
	onfamilyJoinSelectYes: function(evt) {
		var aData = view.getModel().getData();
		aData.screenData.ZZ_FMY_JSTAT = true;
		view.getModel().setData(aData);
	},
	onfamilyJoinSelectNo: function(evt) {
		var aData = view.getModel().getData();
		aData.screenData.ZZ_FMY_JSTAT = false;
		view.getModel().setData(aData);
	},
	onvisaSelectNo : function(evt) {
		var aData = view.getModel().getData();
		aData.screenData.ZZ_VISA_AEXIST = false;
		view.getModel().setData(aData);

		try {
			sap.ui.getCore().byId("flexBoxProcessByBosch").setVisible(false);
		} catch(exc) {}
	},
	onvisaSelectYes : function(evt) {
		var aData = view.getModel().getData();
		aData.screenData.ZZ_VISA_AEXIST = true;
		view.getModel().setData(aData);
		try {
			sap.ui.getCore().byId("flexBoxProcessByBosch").setVisible(true);
		} catch(exc) {}
	},
	onpbSelectYes : function(evt) {
		var aData = view.getModel().getData();
		aData.screenData.ZZ_VISA_PB = true;
		view.getModel().setData(aData);
	},
	onpbSelectNo : function(evt) {
		var aData = view.getModel().getData();
		aData.screenData.ZZ_VISA_PB = false;
		view.getModel().setData(aData);
	},
	
	/*------------------------------------------------------------------------------------*/
		/* EVENTS from WORKFLOW ACTIONS
	/*------------------------------------------------------------------------------------*/
	onHomePress : function(evt) {
		var globalData = sap.ui.getCore().getModel("global").getData();
		if (sap.ui.core.routing.History.getInstance().getPreviousHash().substring(0, 17) == "Portal/Deputation") {
			if (oDeputationThis.previousGlobal != null) {
				globalData = oDeputationThis.previousGlobal;
				sap.ui.getCore().getModel("global").setData(globalData);
				sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
				oDeputationThis.previousGlobal = null;
			}
		} else {
			var aData = view.getModel().getData();
			//Deputation request clicks back
			if ((aData.screenData.editable && aData.screenData.ZZ_REQ_TYP == "DEPU") || 
					sap.ui.getCore().getModel("global").getData().isChange == true) {
				sap.m.MessageBox.confirm(
						"Any unsaved data will be lost, do you want to continue ?",
						function (oAction){
							if(oAction == "OK" ){
								sDeputationNo = '';               
								sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
								return;
							}
						},
						"Confirmation"
				);
				return;
			} else {
				globalData.whichTab = "";
				sap.ui.getCore().getModel("global").setData(globalData);

				//Business travel clicks back
				try{
					if( TravelPlanThis.getView().getModel().getData().view.enabled || 
							TravelPlanThis.getView().getModel().getData().view.enableAddDetail ||
							TravelPlanThis.getView().getModel().getData().view.enabledCountry){
						sap.m.MessageBox.confirm(
								"Any unsaved data will be lost, do you want to continue ?",
								function (oAction){
									if(oAction == "OK" ){
										sDeputationNo = '';               
										sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
										TravelPlanThis.getView().getModel().getData().view.enabled = false;
									}
								},
								"Confirmation"
						);
					} else {
						sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
						TravelPlanThis.getView().getModel().getData().view.enabled = false;
					}
				}catch(ext){
					sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
				}
			}
		}
	},
	onCommentHistoryPress : function(evt) {
		var aData = view.getModel().getData();
		if (!oDeputationThis.commentLogPopOver) {
			oDeputationThis.commentLogPopOver = sap.ui.xmlfragment("sap.ui.project.e2etm.fragment.deputation.COMMON.CommentLogPopover", oDeputationThis);
			var flexboxMenu = oDeputationThis.commentLogPopOver.getContent()[1];
		}
		oDeputationThis.commentLogPopOver.openBy(evt.getSource());
		sap.ui.getCore().byId("textAreaCommentHistory").setValue(aData.screenData.ZZ_COMMENTS);
	},
	onTravelPlanPress : function(evt){
		var oData = sap.ui.getCore().getModel("global").getData();
		oData.ZZ_DEP_REQ = view.getModel().getData().form.ZZ_DEP_REQ;
		oData.ZZ_DEP_PERNR = view.getModel().getData().form.ZZ_DEP_PERNR;
		sap.ui.getCore().getModel("global").setData(oData);
		sap.ui.core.routing.Router.getRouter("MyRouter").navTo("travelPlan");
	},
	
	// EMP DELETE Button event
	onDeletePress : function(evt) {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true,oHomeThis);
		var aData = view.getModel().getData();

		if (aData.screenData.ZZ_REQ_TYP == "BUSR" || aData.screenData.ZZ_REQ_TYP == "SECO") {
			var get = $.ajax({
				cache: false,
				url: sServiceUrl + "EMP_PASSPORT_INFOSet",
				type: "GET",
				headers: {
					'Authorization': token
				},
				beforeSend: function(xhr){
					xhr.setRequestHeader('X-CSRF-Token', 'Fetch');
				},
			});
			get.done(function(result, response, header) {
				token = header.getResponseHeader("X-CSRF-Token");
				var sUrl = sServiceUrl + "TRV_HDRSet(ZZ_PERNR='" + sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_PERNR
				+ "',ZZ_DEP_REQ='"+ aData.screenData.ZZ_DEP_REQ + 
				"',ZZ_VERSION='',ZZ_TRV_TYP='" + aData.screenData.ZZ_REQ_TYP + "')";
				var post = $.ajax({
					cache: false,
					url: sUrl,
					type: "DELETE",
					beforeSend: function(xhr){
						xhr.setRequestHeader('X-Requested-With', "XMLHttpRequest");
						xhr.setRequestHeader('X-CSRF-Token', token);
						xhr.setRequestHeader('DataServiceVersion', "2.0");
						xhr.setRequestHeader('If-Match', "*");
					},
					success: function(result, response, header) {
						sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
						sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
						sap.m.MessageToast.show("Request deleted successfully" + "!");
					},
					fail: function(err) {
						sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
					},
				});
			});
		} else {
			// Action
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
				},
			});
			get.done(function(result, response, header) {
				token = header.getResponseHeader("X-CSRF-Token");
				var post = $.ajax({
					cache: false,
					url: sServiceUrl + "DEP_HDR_INFOSet(ZZ_DEP_REQ='" + aData.screenData.ZZ_DEP_REQ + 
					"',ZZ_VERSION='" + aData.screenData.ZZ_VERSION + "')",
					type: "DELETE",
					beforeSend: function(xhr){
						xhr.setRequestHeader('X-Requested-With', "XMLHttpRequest");
						xhr.setRequestHeader('X-CSRF-Token', token);
						xhr.setRequestHeader('DataServiceVersion', "2.0");
						xhr.setRequestHeader('If-Match', "*");
					},
					success: function(result, response, header) {
						sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
						sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
						sap.m.MessageToast.show("Request deleted successfully" + "!");
					},
					fail: function(err) {
						sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
					},
				});
			});
		}
	},
	// EMP SAVE Button event
	onSavePress : function(evt) {
		// Save deputation
		oDeputationThis.saveDeputation("AA000");
	},
	// EMP SUBMIT Button event
	onEMPSubmitPress : function(evt) {
		if (oDeputationThis.validateDeputation()) {
			var aData = view.getModel().getData();
			if (sDeputationNo == "" || sDeputationNo == null) { //Create a new request
				if (aData.screenData.ZZ_CONFIRM_FLAG == true) {
					// begin of Changes to familly details
					if( Number(aData.screenData.ZZ_DEP_DAYS) <= 183 && aData.screenData.ZZ_DEP_TOCNTRY == "DE" &&
							aData.screenData.ZZ_TRV_CAT != 'TRFR'){
						// display pop up
						var dialog = new sap.m.Dialog({
							title: 'Confirm',
							type: 'Message',
							content: [
							          new sap.m.Text({ text: 'Please note if deputation duration is less than 183 days and travelling on STA assignment model, company will not sponsor the expenses of the dependents including Visa, tickets and Insurance' }),

							          ],
							          beginButton: new sap.m.Button({
							        	  text: 'OK',
							        	  press: function () {
							        		  oDeputationThis.checkPeriod(aData);
							        		  dialog.close();
							        	  }
							          }),
							          afterClose: function() {
							        	  dialog.destroy();
							          }
						});
						dialog.open();
						
					}else {
						oDeputationThis.checkPeriod(aData);
					}
						
					
					// end of Changes to familly details
					
				} else {
					aData.screenData.ZZ_CONFIRM_FLAG_ERROR = "Error";
					view.getModel().setData(aData);
					sap.ca.ui.message.showMessageBox({
						type: sap.ca.ui.message.Type.ERROR,
						message: "Please check confirmation and continue",
						details: "Please check confirmation and continue"
					});
					return;
				}
			} else {
				if (aData.screenData.ZZ_STAT_FLAG != "AA000") {
					if (aData.screenData.ZZ_CONFIRM_FLAG == true){
//						oDeputationThis.checkPeriod(aData);
						
						// begin of Changes to familly details
						if( Number(aData.screenData.ZZ_DEP_DAYS) <= 183 && aData.screenData.ZZ_DEP_TOCNTRY == "DE" &&
								aData.screenData.ZZ_TRV_CAT != 'TRFR'){
							// display pop up
							var dialog = new sap.m.Dialog({
								title: 'Confirm',
								type: 'Message',
								content: [
								          new sap.m.Text({ text: 'Please note if deputation duration is less than 183 days and travelling on STA assignment model, company will not sponsor the expenses of the dependents including Visa, tickets and Insurance' }),

								          ],
								          beginButton: new sap.m.Button({
								        	  text: 'OK',
								        	  press: function () {
								        		  oDeputationThis.checkPeriod(aData);
								        		  dialog.close();
								        	  }
								          }),
								          afterClose: function() {
								        	  dialog.destroy();
								          }
							});
							dialog.open();
							
						}else {
							oDeputationThis.checkPeriod(aData);
						}
							
						
						// end of Changes to familly details
					} else {
						aData.screenData.ZZ_CONFIRM_FLAG_ERROR = "Error";
						view.getModel().setData(aData);
						sap.ca.ui.message.showMessageBox({
							type: sap.ca.ui.message.Type.ERROR,
							message: "Please check confirmation and continue",
							details: "Please check confirmation and continue"
						});
					}
				} else {
					if (aData.screenData.ZZ_CONFIRM_FLAG == false) {
						aData.screenData.ZZ_CONFIRM_FLAG_ERROR = "Error";
						view.getModel().setData(aData);
						sap.ca.ui.message.showMessageBox({
							type: sap.ca.ui.message.Type.ERROR,
							message: "Please check confirmation and continue",
							details: "Please check confirmation and continue"
						});
						return;
					} else {
						aData.screenData.ZZ_CONFIRM_FLAG_ERROR = "None";
						view.getModel().setData(aData);
						// begin of Changes to familly details
						if( Number(aData.screenData.ZZ_DEP_DAYS) <= 183 && aData.screenData.ZZ_DEP_TOCNTRY == "DE" &&
								aData.screenData.ZZ_TRV_CAT != 'TRFR'){
							// display pop up
							var dialog = new sap.m.Dialog({
								title: 'Confirm',
								type: 'Message',
								content: [
								          new sap.m.Text({ text: 'Please note if deputation duration is less than 183 days and travelling on STA assignment model, company will not sponsor the expenses of the dependents including Visa, tickets and Insurance' }),

								          ],
								          beginButton: new sap.m.Button({
								        	  text: 'OK',
								        	  press: function () {
								        		  oDeputationThis.checkPeriod(aData);
								        		  dialog.close();
								        	  }
								          }),
								          afterClose: function() {
								        	  dialog.destroy();
								          }
							});
							dialog.open();
							
						}else {
							oDeputationThis.checkPeriod(aData);
						}
							
						
						// end of Changes to familly details
//						oDeputationThis.checkPeriod(aData);
					}
				}

			}
		}
	},
	// EMP SUBMIT First level Docs Button event
	onEMPSubmitDocsPress : function(evt) {
		if(sap.ui.getCore().byId("List_Document_Id").getItems().length != 0){
			var sMsg = sap.ui.project.e2etm.util.StaticUtility.validateUploadFile(sap.ui.getCore().byId("List_Document_Id").getModel());
			if( sMsg == "" ){
				sap.ca.ui.message.showMessageBox({
					type: sap.ca.ui.message.Type.ERROR,
					message: "Please click on upload button to transfer document(s) to server",
					details: "Please click on upload button to transfer document(s) to server"
				});
				return;
			}

			if( !sap.ui.getCore().byId("checkBoxConfirm1").getChecked()){
				sap.ca.ui.message.showMessageBox({
					type: sap.ca.ui.message.Type.ERROR,
					message: "Please check on 'I have submitted the required documents'",
					details: "Please check on 'I have submitted the required documents'"
				});
				return;
			}
		}
		// Perform an action to create visa plan
		// If none of the visa copy panels is visible, that means we don't need to create a visa plan
		// but we directly update the workflow status
		if (!sap.ui.getCore().byId("panelExistingAccomodation").getVisible() &&
				!sap.ui.getCore().byId("panelExistingEmployeeVisaCopy").getVisible() &&
				!sap.ui.getCore().byId("panelExistingDependentVisaCopy").getVisible()) {
			if( !sap.ui.project.e2etm.util.StaticUtility.checkRequredDocuments(sap.ui.getCore().byId("List_Document_Id").getModel()) ){
				sap.m.MessageBox.confirm(
						"Some documents have not been uploaded, do you want to submit ?",
						function (oAction){
							if(oAction == "OK" ){
								oDeputationThis.employeeAction("005", "Submit documents successfully");
							}
						});
			} else {
				oDeputationThis.employeeAction("005", "Submit documents successfully");
			}
		} else {
			// Send data for visa plan creation.
			var aData = view.getModel().getData();
			// Validate if Office address is entered or not
			if (sap.ui.getCore().byId("panelExistingAccomodation").getVisible()) {
				if (sap.ui.getCore().byId("txtOfficeAddress").getValue().trim() == "") {
					sap.ca.ui.message.showMessageBox({
						type: sap.ca.ui.message.Type.ERROR,
						message: "Please enter Office address and continue",
						details: "Please enter Office address and continue"
					});
					sap.ui.getCore().byId("txtOfficeAddress").setValueState("Error");
					return;
				} else {
					aData.selfVisa.ZZ_OFFC_ADDRESS = sap.ui.getCore().byId("txtOfficeAddress").getValue();
					sap.ui.getCore().byId("txtOfficeAddress").setValueState("None");
				} 
			}

			var sError = "";
			// Validate visa header for employee
			if (aData.screenData.ZZ_VISA_AEXIST && aData.screenData.ZZ_VISA_PB) {
				sError = oDeputationThis.validateVisaUploadSelf(aData);
				if (sError != "") {
					sap.ca.ui.message.showMessageBox({
						type: sap.ca.ui.message.Type.ERROR,
						message: sError,
						details: sError
					});
					view.getModel().setData(aData);
					return;
				}
			}

			//Validate visa header for dependent
			sError = oDeputationThis.validateVisaUploadDependent(aData);
			if (sError != "") {
				sap.ca.ui.message.showMessageBox({
					type: sap.ca.ui.message.Type.ERROR,
					message: sError,
					details: sError
				});
				view.getModel().setData(aData);
				return;
			}

			//Confirmation whether all documents are uploaded or not
			if( !sap.ui.project.e2etm.util.StaticUtility.checkRequredDocuments(sap.ui.getCore().byId("List_Document_Id").getModel()) &&
					sap.ui.getCore().byId("List_Document_Id").getItems().length != 0){
				sap.m.MessageBox.confirm(
						"Some documents have not been uploaded, do you want to submit ?",
						function (oAction){
							if(oAction == "OK" ){
								// Call service to create visa plan
								oDeputationThis.saveVisaPlan(aData, "005", "Submit documents successfully","DEPU");
							}
						}
				);
			}else{
				oDeputationThis.saveVisaPlan(aData, "005", "Submit documents successfully","DEPU");
			}
		}
	},
	// EMP SUBMIT Second level Docs Button event
	onEMPSubmitVisaDocsPress : function(evt) {
		var aData = view.getModel().getData();
		// Validate if office address is entered
		if (sap.ui.getCore().byId("txtOfficeAddress").getValue().trim() == "") {
			sap.ca.ui.message.showMessageBox({
				type: sap.ca.ui.message.Type.ERROR,
				message: "Please enter Office address and continue",
				details: "Please enter Office address and continue"
			});
			sap.ui.getCore().byId("txtOfficeAddress").setValueState("Error");
			return;
		}else{
			sap.ui.getCore().byId("txtOfficeAddress").setValueState("None");
			aData.selfVisa.ZZ_OFFC_ADDRESS = sap.ui.getCore().byId("txtOfficeAddress").getValue();
		}

		if( sap.ui.getCore().byId("List_Document_Id").getItems().length != 0 ){
			var sMsg = sap.ui.project.e2etm.util.StaticUtility.validateUploadFile(sap.ui.getCore().byId("List_Document_Id").getModel());
			if( sMsg == "" ){
				sap.ca.ui.message.showMessageBox({
					type: sap.ca.ui.message.Type.ERROR,
					message: "Please click on upload button to transfer document(s) to server",
					details: "Please click on upload button to transfer document(s) to server"
				});
				return;
			}
			if( !sap.ui.getCore().byId("checkBoxConfirm1").getChecked() ){
				sap.ca.ui.message.showMessageBox({
					type: sap.ca.ui.message.Type.ERROR,
					message: "Please check on 'I have submitted the required documents'",
					details: "Please check on 'I have submitted the required documents'"
				});
				return;
			}
		}

		if( !sap.ui.project.e2etm.util.StaticUtility.checkRequredDocuments(sap.ui.getCore().byId("List_Document_Id").getModel()) &&
				sap.ui.getCore().byId("List_Document_Id").getItems().length != 0){
			sap.m.MessageBox.confirm(
					"Some documents have not been uploaded, do you want to submit ?",
					function (oAction){
						if(oAction == "OK" ){
							oDeputationThis.saveVisaPlan(aData, "007", "Submit Visa documents successfully","DEPU");
						}
					});
		}else{
			// Update workflow stages
			oDeputationThis.saveVisaPlan(aData, "007", "Submit Visa documents successfully","DEPU");
		}
	},
	// EMP SUBMIT Third level Docs Button event
	onEMPSubmitPassportPress : function(evt) {
		if(sap.ui.getCore().byId("List_Document_Id").getItems().length != 0){
			var sMsg = sap.ui.project.e2etm.util.StaticUtility.validateUploadFile(sap.ui.getCore().byId("List_Document_Id").getModel());
			if( sMsg == "" ){
				sap.ca.ui.message.showMessageBox({
					type: sap.ca.ui.message.Type.ERROR,
					message: "Please click on upload button to transfer document(s) to server",
					details: "Please click on upload button to transfer document(s) to server"
				});
				return;
			}
			if( !sap.ui.getCore().byId("checkBoxConfirm1").getChecked() ){
				sap.ca.ui.message.showMessageBox({
					type: sap.ca.ui.message.Type.ERROR,
					message: "Please check on 'I have submitted the required documents'",
					details: "Please check on 'I have submitted the required documents'"
				});
				return;
			}
		}
		if( !sap.ui.project.e2etm.util.StaticUtility.checkRequredDocuments(sap.ui.getCore().byId("List_Document_Id").getModel()) &&
				sap.ui.getCore().byId("List_Document_Id").getItems().length != 0){
			sap.m.MessageBox.confirm(
					"Some documents have not been uploaded, do you want to submit ?",
					function (oAction){
						if(oAction == "OK" ){
							oDeputationThis.employeeAction("008", "Submit Passport documents successfully");
						}}
			);
		}else{
			oDeputationThis.employeeAction("008", "Submit Passport documents successfully");
		}
	},
	// EMP ACCEPT CL Button event
	onEMPAcceptCLPress : function(evt) {
		if (oDeputationThis.oCommonDialog) {
			oDeputationThis.oCommonDialog.destroy();
		}
		// instantiate the Fragment if not done yet
		oDeputationThis.oCommonDialog = sap.ui.xmlfragment("sap.ui.project.e2etm.fragment.deputation.COMMON.CommonWFDialog",oDeputationThis);

		// Visible appropriate buttons in the common Dialog
		sap.ui.getCore().byId("btnAcceptCL").setVisible(true);
		sap.ui.getCore().byId("btnRejectCL").setVisible(false);
		sap.ui.getCore().byId("btnSendBack").setVisible(false);
		sap.ui.getCore().byId("btnReject").setVisible(false);
		if(sap.ui.project.e2etm.util.StaticUtility.checkStvaAsg(view.getModel().getData().screenData.ZZ_ASG_TYP)){
			if(view.getModel().getData().screenData.ZZ_ASG_TYP!="NC" && 
			   view.getModel().getData().screenData.ZZ_ASG_TYP!="VN")
		         sap.ui.getCore().byId("chkSTVA").setVisible(true);
		}

		oDeputationThis.oCommonDialog.open();
	},
	// EMP ACCEPT CL WORKFLOW BUTTON event
	onAcceptCLWFButtonClick : function(evt) {
		var aData = view.getModel().getData();
		// Accept Contract Letter action will happen here
		// Validate if the comment is entered
		var comment = sap.ui.getCore().byId("txtCommonWFComment").getValue();
		if (comment.trim() == "" || comment.trim() == null) {
			sap.ca.ui.message.showMessageBox({
				type: sap.ca.ui.message.Type.ERROR,
				message: "Please give some comments",
				details: "Please give some comments"
			});
			return;
		} else {
			if (!sap.ui.project.e2etm.util.StaticUtility.check256Characters(comment.trim())) {
				sap.ca.ui.message.showMessageBox({
					type: sap.ca.ui.message.Type.ERROR,
					message: "Maximum 255 characters allowed",
					details: "Maximum 255 characters allowed"
				});
				return;
			}
			if(sap.ui.project.e2etm.util.StaticUtility.checkStvaAsg(aData.screenData.ZZ_ASG_TYP)){
				
			 if(aData.screenData.ZZ_ASG_TYP!="NC" && aData.screenData.ZZ_ASG_TYP!="VN" && 
			    (!(sap.ui.getCore().byId("chkSTVA").getSelected()))){
				 sap.ca.ui.message.showMessageBox({
						type: sap.ca.ui.message.Type.ERROR,
						message: "Please accept the Anlage 1a",
						details: "Please accept the Anlage 1a"
					});
					return;
			 }	
			}
			
//			if(sap.ui.project.e2etm.util.StaticUtility.checkCggs(aData.screenData.ZZ_DEP_TOCNTRY,
//					aData.screenData.ZZ_ASG_TYP,aData.screenData.ZZ_TRV_CAT)){
//						if(aData.screenData.ZZ_SH_STATUS != "E"){
//							sap.ca.ui.message.showMessageBox({
//								type: sap.ca.ui.message.Type.ERROR,
//								message: "Please sign Salary slip",
//								details: "Please sign Salary slip"
//					});
//			    	return;
//				}
//			}

			// Call webservice to accept contract
			if (sap.ui.getCore().getModel("profile").getData().currentRole == "EMP") {
				var calcSheetDef = $.Deferred();
				if(sap.ui.project.e2etm.util.StaticUtility.checkCggs(aData.screenData.ZZ_DEP_TOCNTRY,
						aData.screenData.ZZ_ASG_TYP,aData.screenData.ZZ_TRV_CAT)){
					    oComponent.getModel().read("DepShStatusSet(DepReq='" + aData.screenData.ZZ_DEP_REQ + "',Version='" + aData.screenData.ZZ_VERSION + "')", 
							{async:true, success:jQuery.proxy(function(oData, response) {
						if(oData.Status != 'E'){
							sap.ca.ui.message.showMessageBox({
								type: sap.ca.ui.message.Type.ERROR,
								message: "Please sign Salary slip",
								details: "Please sign Salary slip"
					});
			    	return;
				}else{
					calcSheetDef.resolve();
				}

			  },this),error: jQuery.proxy(function(error) {},this)});
					
		  }else{
			calcSheetDef.resolve();
		  }
				
		 $.when(calcSheetDef).then(function() {
				var get = $.ajax({
					cache: false,
					url: sServiceUrl + "DEP_CL_STATUSSet(ZZ_DEP_REQ='" + aData.screenData.ZZ_DEP_REQ + "')?$format=json",
					type: "GET"
				});
				get.done(function(result){
					if (result.d.ZZ_CL_STATUS == 'S') {
						if (aData.screenData.ZZ_DEP_TYPE == "DOME") {
							oDeputationThis.employeeAction("CLOSE", "Contract Letter Accepted");
						} else {
							oDeputationThis.employeeAction("004", "Contract Letter Accepted");
						}
					} else {
						sap.ca.ui.message.showMessageBox({
							type: sap.ca.ui.message.Type.ERROR,
							message: "Please sign the contract and then proceed",
							details: "Please sign the contract and then proceed"
						});
						return;
					}
				});
			  });
			}
		}
	},
	// EMP SEND BACK CL Button event
	onEMPSendBackCLPress : function(evt) {
		if (oDeputationThis.oCommonDialog) {
			oDeputationThis.oCommonDialog.destroy();
		}
		// instantiate the Fragment if not done yet
		oDeputationThis.oCommonDialog = sap.ui.xmlfragment("sap.ui.project.e2etm.fragment.deputation.COMMON.CommonWFDialog",oDeputationThis);

		// Visible appropriate buttons in the common Dialog
		sap.ui.getCore().byId("btnAcceptCL").setVisible(false);
		sap.ui.getCore().byId("btnRejectCL").setVisible(false);
		sap.ui.getCore().byId("btnSendBack").setVisible(true);
		sap.ui.getCore().byId("btnReject").setVisible(false);

		oDeputationThis.oCommonDialog.open();
	},
	// EMP SEND BACK CL WORKFLOW BUTTON event
	onSendBackCLWFButtonClick : function(evt) {
		
	},
	// EMP CHANGE REQUEST WORKFLOW BUTTON event
	onEMPChangePress : function(evt) {
		// Validate changed value before submitting
		var aData = view.getModel().getData();
		var globalData = sap.ui.getCore().getModel("global").getData();
		if (globalData.changeType == "DA") {
			var startDate = new Date(aData.screenData.ZZ_DEP_STDATE.substr(0, 4), aData.screenData.ZZ_DEP_STDATE.substr(4, 2) - 1, 
					aData.screenData.ZZ_DEP_STDATE.substr(6, 2));
			var endDate = new Date(aData.screenData.ZZ_DEP_ENDATE.substr(0, 4), aData.screenData.ZZ_DEP_ENDATE.substr(4, 2) - 1, 
					aData.screenData.ZZ_DEP_ENDATE.substr(6, 2));
			// Change in dates: Either start date or end date must be changed
			if (oDeputationThis.currentStDate == aData.screenData.ZZ_DEP_STDATE &&
					oDeputationThis.currentEDate == aData.screenData.ZZ_DEP_ENDATE) {
				sap.ca.ui.message.showMessageBox({
					type: sap.ca.ui.message.Type.ERROR,
					message: "Please change start date or end date",
					details: "Please change start date or end date"
				});
				return;
			} else {
				if (endDate < startDate) {
					sap.ca.ui.message.showMessageBox({
						type: sap.ca.ui.message.Type.ERROR,
						message: "End date cannot be lower than start date",
						details: "End date cannot be lower than start date"
					});
					return;
				}
			}

			// It cannot cross the secondary & home trip
			// Validated Start date
			var validatedBeginDate = null;
			var validatedBeginDateObj = null;

			// Validated End date
			var validatedEndDate = null;
			var validatedEndDateObj = null;

			// Get end date of the last home trip and prepare validated start date
			var validatedList = sap.ui.getCore().getModel("global").getData().deputationList;
			for(var i=0; i<validatedList.length;i++) {
				if ((validatedList[i].ZZ_REQ_TYP == "HOME" || validatedList[i].ZZ_REQ_TYP == "SECO" || 
						validatedList[i].ZZ_REQ_TYP == "EMER" || validatedList[i].ZZ_REQ_TYP == "INFO") 
						&& validatedList[i].ZZ_TRV_REQ.replace(/^0+/, '') == aData.screenData.ZZ_TRV_REQ.replace(/^0+/, '')) {
					// Get the latest day
					if (validatedEndDate != null) { // This will come here for date comparison
						// If current date is less than the current latest date in the list
						// then assign current date to the latest date variable
						if (validatedList[i].ZZ_DEP_ENDATE < validatedEndDate) {
							continue;
						} else {
							validatedEndDate = validatedList[i].ZZ_DEP_ENDATE;
						}
					} else {  // First loop, it will come here to get the first Date in the list for comparison
						validatedEndDate = validatedList[i].ZZ_DEP_ENDATE;
					}
					// Get the earliest day
					if (validatedBeginDate != null) {
						// If current date is less than the current latest date in the list
						// then assign current date to the latest date variable
						if (validatedList[i].ZZ_DEP_STDATE > validatedBeginDate) {
							continue;
						} else {
							validatedBeginDate = validatedList[i].ZZ_DEP_STDATE;
						}
					} else {  // First loop, it will come here to get the first Date in the list for comparison
						validatedBeginDate = validatedList[i].ZZ_DEP_STDATE;
					}
				}
			}
			// If previous start date and end date not found
			if (validatedBeginDate != null && validatedEndDate == null) {
				validatedBeginDateObj = new Date(validatedBeginDate.substr(0, 4), validatedBeginDate.substr(4, 2) - 1, 
						validatedBeginDate.substr(6, 2));
				if (startDate > validatedBeginDateObj || endDate < validatedBeginDateObj) {
					sap.ca.ui.message.showMessageBox({
						type: sap.ca.ui.message.Type.ERROR,
						message: "Please check your start date and end date",
						details: "Start date cannot cross the date " + sap.ui.project.e2etm.util.Formatter.sapDate(validatedBeginDate)
						+ " and End date cannot be less than " + sap.ui.project.e2etm.util.Formatter.sapDate(validatedBeginDate)
					});
					return;
				}
			} else if (validatedBeginDate == null && validatedEndDate != null) {
				validatedEndDateObj = new Date(validatedEndDate.substr(0, 4), validatedEndDate.substr(4, 2) - 1, 
						validatedEndDate.substr(6, 2));
				if (endDate > validatedEndDateObj || endDate < validatedEndDateObj) {
					sap.ca.ui.message.showMessageBox({
						type: sap.ca.ui.message.Type.ERROR,
						message: "Please check your start date and end date",
						details: "Start date cannot cross the date " + sap.ui.project.e2etm.util.Formatter.sapDate(validatedBeginDate)
						+ " and End date cannot be less than " + sap.ui.project.e2etm.util.Formatter.sapDate(validatedBeginDate)
					});
					return;
				}
			} else if (validatedBeginDate != null && validatedEndDate != null) {
				validatedBeginDateObj = new Date(validatedBeginDate.substr(0, 4), validatedBeginDate.substr(4, 2) - 1, 
						validatedBeginDate.substr(6, 2));
				if (startDate > validatedBeginDateObj || endDate < validatedBeginDateObj) {
					sap.ca.ui.message.showMessageBox({
						type: sap.ca.ui.message.Type.ERROR,
						message: "Please check your start date and end date",
						details: "Start date cannot cross the date " + sap.ui.project.e2etm.util.Formatter.sapDate(validatedBeginDate)
						+ " and End date cannot be less than " + sap.ui.project.e2etm.util.Formatter.sapDate(validatedBeginDate)
					});
					return;
				}

				validatedEndDateObj = new Date(validatedEndDate.substr(0, 4), validatedEndDate.substr(4, 2) - 1, 
						validatedEndDate.substr(6, 2));
				if (endDate < validatedEndDateObj || startDate > validatedEndDateObj) {
					sap.ca.ui.message.showMessageBox({
						type: sap.ca.ui.message.Type.ERROR,
						message: "Please check your start date and end date",
						details: "Start date cannot cross the date " + sap.ui.project.e2etm.util.Formatter.sapDate(validatedBeginDate)
						+ " and End date cannot be less than " + sap.ui.project.e2etm.util.Formatter.sapDate(validatedBeginDate)
					});
					return;
				}
			}
		} else if (globalData.changeType == "DB") {
			var startDate =  new Date(oDeputationThis.currentStDate.substr(0, 4), oDeputationThis.currentStDate.substr(4, 2) - 1, 
					oDeputationThis.currentStDate.substr(6, 2));
			var endDate =  new Date(aData.screenData.ZZ_DEP_ENDATE.substr(0, 4), aData.screenData.ZZ_DEP_ENDATE.substr(4, 2) - 1, 
					aData.screenData.ZZ_DEP_ENDATE.substr(6, 2));
			// Change in end date: End date must be changed
			if (oDeputationThis.currentEDate == aData.screenData.ZZ_DEP_ENDATE) {
				sap.ca.ui.message.showMessageBox({
					type: sap.ca.ui.message.Type.ERROR,
					message: "Please change end date",
					details: "Please change end date"
				});
				return;
			} else {
				if (endDate < startDate) {
					sap.ca.ui.message.showMessageBox({
						type: sap.ca.ui.message.Type.ERROR,
						message: "End date cannot be lower than start date",
						details: "End date cannot be lower than start date"
					});
					return;
				}
			}

			// It cannot cross the secondary & home trip
			// Validated Start date
			var validatedBeginDate = null;
			var validatedBeginDateObj = null;

			// Validated End date
			var validatedEndDate = null;
			var validatedEndDateObj = null;

			// Get end date of the last home trip and prepare validated start date
			var validatedList = sap.ui.getCore().getModel("global").getData().deputationList;
			for(var i=0; i<validatedList.length;i++) {
				if ((validatedList[i].ZZ_REQ_TYP == "HOME" || validatedList[i].ZZ_REQ_TYP == "SECO" || 
						validatedList[i].ZZ_REQ_TYP == "EMER" || validatedList[i].ZZ_REQ_TYP == "INFO") 
						&& validatedList[i].ZZ_TRV_REQ.replace(/^0+/, '') == aData.screenData.ZZ_TRV_REQ.replace(/^0+/, '')) {
					// Get the latest day
					if (validatedEndDate != null) { // This will come here for date comparison
						// If current date is less than the current latest date in the list
						// then assign current date to the latest date variable
						if (validatedList[i].ZZ_DEP_ENDATE < validatedEndDate) {
							continue;
						} else {
							validatedEndDate = validatedList[i].ZZ_DEP_ENDATE;
						}
					} else {  // First loop, it will come here to get the first Date in the list for comparison
						validatedEndDate = validatedList[i].ZZ_DEP_ENDATE;
					}
					// Get the earliest day
					if (validatedBeginDate != null) {
						// If current date is less than the current latest date in the list
						// then assign current date to the latest date variable
						if (validatedList[i].ZZ_DEP_STDATE > validatedBeginDate) {
							continue;
						} else {
							validatedBeginDate = validatedList[i].ZZ_DEP_STDATE;
						}
					} else {  // First loop, it will come here to get the first Date in the list for comparison
						validatedBeginDate = validatedList[i].ZZ_DEP_STDATE;
					}
				}
			}
			// If previous start date and end date not found
			if (validatedBeginDate != null && validatedEndDate == null) {
				validatedBeginDateObj = new Date(validatedBeginDate.substr(0, 4), validatedBeginDate.substr(4, 2) - 1, 
						validatedBeginDate.substr(6, 2));
				if (startDate > validatedBeginDateObj || endDate < validatedBeginDateObj) {
					sap.ca.ui.message.showMessageBox({
						type: sap.ca.ui.message.Type.ERROR,
						message: "Start date cannot cross the date " + sap.ui.project.e2etm.util.Formatter.sapDate(validatedBeginDate)
						+ " and End date cannot be less than " + sap.ui.project.e2etm.util.Formatter.sapDate(validatedBeginDate),
						details: "Start date cannot cross the date " + sap.ui.project.e2etm.util.Formatter.sapDate(validatedBeginDate)
						+ " and End date cannot be less than " + sap.ui.project.e2etm.util.Formatter.sapDate(validatedBeginDate)
					});
					return;
				}
			} else if (validatedBeginDate == null && validatedEndDate != null) {
				validatedEndDateObj = new Date(validatedEndDate.substr(0, 4), validatedEndDate.substr(4, 2) - 1, 
						validatedEndDate.substr(6, 2));
				if (endDate > validatedEndDateObj || endDate < validatedEndDateObj) {
					sap.ca.ui.message.showMessageBox({
						type: sap.ca.ui.message.Type.ERROR,
						message: "Please check your start date and end date",
						details: "Start date cannot cross the date " + sap.ui.project.e2etm.util.Formatter.sapDate(validatedBeginDate)
						+ " and End date cannot be less than " + sap.ui.project.e2etm.util.Formatter.sapDate(validatedBeginDate)
					});
					return;
				}
			} else if (validatedBeginDate != null && validatedEndDate != null) {
				validatedBeginDateObj = new Date(validatedBeginDate.substr(0, 4), validatedBeginDate.substr(4, 2) - 1, 
						validatedBeginDate.substr(6, 2));
				if (startDate > validatedBeginDateObj || endDate < validatedBeginDateObj) {
					sap.ca.ui.message.showMessageBox({
						type: sap.ca.ui.message.Type.ERROR,
						message: "Please check your start date and end date",
						details: "Start date cannot cross the date " + sap.ui.project.e2etm.util.Formatter.sapDate(validatedBeginDate)
						+ " and End date cannot be less than " + sap.ui.project.e2etm.util.Formatter.sapDate(validatedBeginDate)
					});
					return;
				}

				validatedEndDateObj = new Date(validatedEndDate.substr(0, 4), validatedEndDate.substr(4, 2) - 1, 
						validatedEndDate.substr(6, 2));
				if (endDate < validatedEndDateObj || startDate > validatedEndDateObj) {
					sap.ca.ui.message.showMessageBox({
						type: sap.ca.ui.message.Type.ERROR,
						message: "Please check your start date and end date",
						details: "Start date cannot cross the date " + sap.ui.project.e2etm.util.Formatter.sapDate(validatedBeginDate)
						+ " and End date cannot be less than " + sap.ui.project.e2etm.util.Formatter.sapDate(validatedBeginDate)
					});
					return;
				}
			}
		} else if (globalData.changeType == "DE" || globalData.changeType == "DG" || globalData.changeType == "DF") {
			// Add new travelling members
			var checkboxes = sap.ui.getCore().byId("membersTravelling").getItems();
			var noOfselectedDependent = 0;
			if (aData.screenData.ZZ_FAMILY_ACCOMP == false) {
				if (globalData.changeType == "DE") {
					sap.ca.ui.message.showMessageBox({
						type: sap.ca.ui.message.Type.ERROR,
						message: "Please add more dependents",
						details: "Please add more dependents"
					});
					return;
				}
			} else {
				for (var i = 0; i < checkboxes.length; i++) {
					if (checkboxes[i].getItems()[0].getItems()[0].getChecked()) {
						noOfselectedDependent++;
					}
				}
				if (oDeputationThis.currentDependentVisa.length == noOfselectedDependent) {
					sap.ca.ui.message.showMessageBox({
						type: sap.ca.ui.message.Type.ERROR,
						message: "Please add more dependents",
						details: "Please add more dependents"
					});
					return;
				} else {
					// Validate entered value
					var dependents = sap.ui.getCore().getModel("profile").getData().dependentDetail;
					for (var i = 0; i < checkboxes.length; i++) {
						if (checkboxes[i].getItems()[0].getItems()[0].getChecked()) {
							// validate start date end date of dependents
							var stdate = checkboxes[i].getItems()[1].getItems()[0].getYyyymmdd();
							var eddate = checkboxes[i].getItems()[1].getItems()[1].getYyyymmdd();
							if (stdate == "" || eddate == "") {
								sap.ca.ui.message.showMessageBox({
									type: sap.ca.ui.message.Type.ERROR,
									message: "Please enter start date and end date of dependent " + dependents[i].ZZ_DEP_NAME,
									details: "Start date and End date cannot be blank"
								});
								sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
								return;
							}
							var startDate =  new Date(stdate.substr(0, 4), stdate.substr(4, 2) - 1, stdate.substr(6, 2));
							var endDate =  new Date(eddate.substr(0, 4), eddate.substr(4, 2) - 1, eddate.substr(6, 2));
							if (startDate < aData.screenData.ZZ_DEP_STDATE_VALUE || endDate > aData.screenData.ZZ_DEP_ENDATE_VALUE ||
									startDate > endDate) {
								sap.ca.ui.message.showMessageBox({
									type: sap.ca.ui.message.Type.ERROR,
									message: "Please check start date and end date of dependent " + dependents[i].ZZ_DEP_NAME,
									details: "Start date and End date must be in between deputation start date and end date"
								});
								sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
								return;
							}

							if (checkboxes[i].getItems()[0].getItems()[2].getChecked() == false &&
									checkboxes[i].getItems()[0].getItems()[2].getEnabled() == true) {
								if (globalData.changeType == "DF") {
									sap.ca.ui.message.showMessageBox({
										type: sap.ca.ui.message.Type.ERROR,
										message: "You cannot add new born kid without a visa. Please check visa exist!",
										details: "You cannot add new born kid without a visa. Please check visa exist!"
									});
									sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
									return;
								}
							}
						}
					}
				}
			}
		} else if (globalData.changeType == "DH") {
			// Check only return date
			if (aData.screenData.ZZ_FAMILY_ACCOMP == false) {
				sap.ca.ui.message.showMessageBox({
					type: sap.ca.ui.message.Type.ERROR,
					message: "You cannot change the return date of your dependents!",
					details: "Cannot change the return date because there is no dependent travelling along with you"
				});
				return;
			} else {
				var checkboxes = sap.ui.getCore().byId("membersTravelling").getItems();
				var changeFound = false;
				for (var i = 0; i < checkboxes.length; i++) {
					if (checkboxes[i].getItems()[0].getItems()[0].getChecked()) {

						var checkBoxTxt = checkboxes[i].getItems()[0].getItems()[0].getText();
						var regex = new RegExp(/\(([^)]+)\)/g);
						var dependentType = regex.exec(checkBoxTxt)[1];

						for (var j = 0; j < aData.selectedDependents.length; j++) {
							if (dependentType == aData.selectedDependents[j].ZZ_DEPE_TYPE) {
								if (checkboxes[i].getItems()[1].getItems()[1].getYyyymmdd() != aData.selectedDependents[j].ZZ_DEP_ENDATE) {
									changeFound = true;
									break;
								}
							}
						}
					}
				}

				if (changeFound == false) {
					sap.ca.ui.message.showMessageBox({
						type: sap.ca.ui.message.Type.ERROR,
						message: "Please change at least one returning date",
						details: "Please change at least one returning date"
					});
					return;
				} else {
					// Validate returning date
					for (var i = 0; i < checkboxes.length; i++) {
						if (checkboxes[i].getItems()[0].getItems()[0].getChecked()) {

							var checkBoxTxt = checkboxes[i].getItems()[0].getItems()[0].getText();
							var regex = new RegExp(/\(([^)]+)\)/g);
							var dependentType = regex.exec(checkBoxTxt)[1];

							for (var j = 0; j < aData.selectedDependents.length; j++) {
								if (dependentType == aData.selectedDependents[j].ZZ_DEPE_TYPE) {
									var newEddate = checkboxes[i].getItems()[1].getItems()[1].getYyyymmdd();
									var maxEddate = aData.screenData.ZZ_DEP_ENDATE;
									var oldStdate = aData.selectedDependents[j].ZZ_DEP_STDATE;
									var newEddateObj =  new Date(newEddate.substr(0, 4), newEddate.substr(4, 2) - 1, newEddate.substr(6, 2));
									var maxEddateObj =  new Date(maxEddate.substr(0, 4), maxEddate.substr(4, 2) - 1, maxEddate.substr(6, 2));
									var oldStdateObj =  new Date(oldStdate.substr(0, 4), oldStdate.substr(4, 2) - 1, oldStdate.substr(6, 2));
									if (newEddateObj < oldStdateObj || newEddateObj > maxEddateObj) {
										sap.ca.ui.message.showMessageBox({
											type: sap.ca.ui.message.Type.ERROR,
											message: "Please check your returning date",
											details: "It must be between " + 
											sap.ui.project.e2etm.util.Formatter.sapDate(oldStdate) + " and " +
											sap.ui.project.e2etm.util.Formatter.sapDate(maxEddate)
										});
										return;
									}
								}
							}
						}
					}
				}
			}
		}

		var curDate = new Date();
		// On deputation
		if (curDate >= aData.screenData.ZZ_DEP_STDATE_VALUE && curDate <= aData.screenData.ZZ_DEP_ENDATE_VALUE) {
			if (oDeputationThis.validateDeputation()) {
				if (sDeputationNo == "" || sDeputationNo == null) { //Create a new request
					if (aData.screenData.ZZ_CONFIRM_FLAG == false) {
						aData.screenData.ZZ_CONFIRM_FLAG_ERROR = "Error";
						view.getModel().setData(aData);
						sap.ca.ui.message.showMessageBox({
							type: sap.ca.ui.message.Type.ERROR,
							message: "Please check confirmation and continue",
							details: "Please check confirmation and continue"
						});
						return;
					}
				} else {
					if (aData.screenData.ZZ_STAT_FLAG != "AA000") {
						if (aData.screenData.ZZ_CONFIRM_FLAG == false){
							aData.screenData.ZZ_CONFIRM_FLAG_ERROR = "Error";
							view.getModel().setData(aData);
							sap.ca.ui.message.showMessageBox({
								type: sap.ca.ui.message.Type.ERROR,
								message: "Please check confirmation and continue",
								details: "Please check confirmation and continue"
							});
						}
					} else {
						if (aData.screenData.ZZ_CONFIRM_FLAG == false) {
							aData.screenData.ZZ_CONFIRM_FLAG_ERROR = "Error";
							view.getModel().setData(aData);
							sap.ca.ui.message.showMessageBox({
								type: sap.ca.ui.message.Type.ERROR,
								message: "Please check confirmation and continue",
								details: "Please check confirmation and continue"
							});
							return;
						}
					}
				}

				if (oDeputationThis.oCommonDialog) {
					oDeputationThis.oCommonDialog.destroy();
				}

				if (aData.screenData.ZZ_DEP_TYPE == "INTL") {
					oDeputationThis.oCommonDialog = sap.ui.xmlfragment("sap.ui.project.e2etm.fragment.deputation.COMMON.EMPChangeDialog", oDeputationThis);

					// Validate if this is COC country or not
					var url = "GetF4Table?TableName='ZE2E_DEP_COC_C'&Col1='ZZ_LAND1'&Col2=''&Col3=''&Col4=''&Col5=''&Col6=''&Col7=''&Col8=''&Col9=''&Col10=''&$format=json";
					var get = $.ajax({
						cache: false,
						url: sServiceUrl + url,
						type: "GET"
					});
					get.done(function(result) {
						var foundCOC = false;
						if (result.d.results != null) {
							for (var i = 0; i < result.d.results.length; i++) {
								if (result.d.results[i].FIELD1 == aData.screenData.ZZ_DEP_TOCNTRY) {
									foundCOC = true;
									break;
								}
							}
						}

						if (foundCOC) {
							oDeputationThis.cocCountry = true;
							sap.ui.getCore().byId("flexboxCOCId").setVisible(true);
						} else {
							oDeputationThis.cocCountry = false;
							sap.ui.getCore().byId("flexboxCOCId").setVisible(false);
						}

						oDeputationThis.oCommonDialog.open();
						var oModel = new sap.ui.model.json.JSONModel();
						oModel.setData({dummy1: "", dummy2: "", dummy3: "", dummy4: ""});
						oDeputationThis.oCommonDialog.setModel(oModel);
					});
				} else {
					oDeputationThis.onEMPSubmitPress();
				}

			}
		} else {
			// reset dependent's start date and end date
//			if (aData.screenData.ZZ_DEP_TYPE == "INTL") {
//			if (aData.screenData.ZZ_FAMILY_ACCOMP == true) {
//			var checkboxes = sap.ui.getCore().byId("membersTravelling").getItems();
//			for (var i = 0; i < checkboxes.length; i++) {
//			if (checkboxes[i].getItems()[0].getItems()[0].getChecked()) {
//			// validate start date end date of dependents
//			checkboxes[i].getItems()[1].getItems()[0].setYyyymmdd(aData.screenData.ZZ_DEP_STDATE);
//			checkboxes[i].getItems()[1].getItems()[1].setYyyymmdd(aData.screenData.ZZ_DEP_ENDATE);
//			}
//			}
//			}
//			}
			oDeputationThis.onEMPSubmitPress();
		}
	},
	// EMP SAVE TRAVEL PLAN WORKFLOW Button event
	onSaveDialogPress : function(evt) {
		TravelPlanThis.onSaveDialogPress(evt);
	},
	// EMP SUBMIT TRAVEL PLAN WORKFLOW Button event
	onSubmitTravelPlan : function(evt) {
		TravelPlanThis.onSubmitTravelPlan(evt);
	},
	// EMP EXTEND REQUEST WORKFLOW BUTTON event
	onEmployeeExtend : function(evt) {
		var aData = view.getModel().getData();

		var insuranceDate = sap.ui.getCore().byId("dateInsuranceExpired").getYyyymmdd();
		var cocDate = sap.ui.getCore().byId("dateCOCExpired").getYyyymmdd();
		var visaDate = sap.ui.getCore().byId("dateVISAExpired").getYyyymmdd();
		var ticketDate = sap.ui.getCore().byId("dateTicketExpired").getYyyymmdd();

		if (insuranceDate == "") {
			sap.ca.ui.message.showMessageBox({
				type: sap.ca.ui.message.Type.ERROR,
				message: "Please enter Insurance Expired Date",
				details: "Please enter Insurance Expired Date"
			});
			return;
		} else {
			aData.screenData.ZZ_INS_EX = insuranceDate;
		}

		if (oDeputationThis.cocCountry) {
			if (cocDate == "") {
				sap.ca.ui.message.showMessageBox({
					type: sap.ca.ui.message.Type.ERROR,
					message: "Please enter COC Expired Date",
					details: "Please enter COC Expired Date"
				});
				return;
			} else {
				aData.screenData.ZZ_COC_EX = cocDate;
			}
		}

		if (visaDate == "") {
			sap.ca.ui.message.showMessageBox({
				type: sap.ca.ui.message.Type.ERROR,
				message: "Please enter VISA Expired Date",
				details: "Please enter VISA Expired Date"
			});
			return;
		} else {
			aData.screenData.ZZ_VISA_EX = visaDate;
		}

		if (ticketDate == "") {
			sap.ca.ui.message.showMessageBox({
				type: sap.ca.ui.message.Type.ERROR,
				message: "Please enter Ticket Expired Date",
				details: "Please enter Ticket Expired Date"
			});
			return;
		} else {
			aData.screenData.ZZ_TCKT_EX = ticketDate;
		}

		view.getModel().setData(aData);

		oDeputationThis.checkPeriod(aData);
	},
	
	// DEPU First level Docs Verify Button event
	onVerifiedPress : function(evt) {
		oDeputationThis.deputationAction("005", "Documents verified");
	},
	// DEPU Second level Docs Verify Button event
	onVerifiedDocsPress : function(evt) {
		oDeputationThis.deputationAction("008", "Visa Documents verified");
	},
	// DEPU Third level Docs Verify Button event
	onVerifiedAdditionalDocsPress : function(evt) {
		oDeputationThis.deputationAction("013", "Additional Documents verified");
	},
	// DEPU CONFIRM VISA UPLOAD Button event
	onUploadVisaCopyPress : function(evt) {
		sap.m.MessageBox.confirm(
				"Please ensure that you have entered and uploaded all neccessary Visa details for dependents",
				function (oAction){
					if(oAction == "OK" ){
						// Perform an action to create visa plan
						// If none of the visa copy panels is visible, that means we don't need to create a visa plan
						// but we directly update the workflow status
						if (!sap.ui.getCore().byId("panelAccomodation").getVisible() &&
								!sap.ui.getCore().byId("panelEmployeeVisaCopy").getVisible() &&
								!sap.ui.getCore().byId("panelDependentVisaCopy").getVisible()) {
							oDeputationThis.deputationAction("009", "Visa Copy Uploaded");
						} else {
							// Send data for visa plan creation.
							var aData = view.getModel().getData();
							// Visa header
							var data = aData.selfVisa;
							// Visa items
							var items = aData.visaExistingDependent;

							// Validate visa header for employee
							var sError = oDeputationThis.validateVisaUploadSelf(aData);
							if (sError != "") {
								sap.ca.ui.message.showMessageBox({
									type: sap.ca.ui.message.Type.ERROR,
									message: sError,
									details: sError
								});
								view.getModel().setData(aData);
								return;
							}

							//Validate visa header for dependent
							sError = oDeputationThis.validateVisaUploadDependent(aData);
							if (sError != "") {
								sap.ca.ui.message.showMessageBox({
									type: sap.ca.ui.message.Type.ERROR,
									message: sError,
									details: sError
								});
								view.getModel().setData(aData);
								return;
							}

							if (data.ZZ_MULT_ENTRY_CHAR) {
								data.ZZ_MULT_ENTRY = 'X';
							} else {
								data.ZZ_MULT_ENTRY = '';
							}

							// Validate if visaExisting Dependent has all value
							for (var i=0; i < items.length; i++) {
								var regex = new RegExp(/\(([^)]+)\)/g);
								var dependentType = regex.exec(items[i].ZZ_DEPNDT_TYP)[1];
								items[i].ZZ_DEPNDT_TYP = dependentType;

								if (items[i].ZZ_MULT_ENTRY_CHAR) {
									items[i].ZZ_MULT_ENTRY = 'X';
								} else {
									items[i].ZZ_MULT_ENTRY = '';
								}
								delete items[i]["ZZ_MULT_ENTRY_CHAR"];
								delete items[i]["ZZ_VISA_EDATE_VALUE"];
								delete items[i]["ZZ_VISA_SDATE_VALUE"];
								delete items[i]["ZZ_VISA_EDATE_ERROR"];
								delete items[i]["ZZ_VISA_SDATE_ERROR"];
								delete items[i]["ZZ_PASSPORT_NO_ERROR"];
								delete items[i]["ZZ_VISA_NO_ERROR"];
								delete items[i].enabled;
								delete items[i].enabledUpload;
								delete items[i].href;
								delete items[i].visibleOpen;
							}
							delete data["ZZ_DEPNDT_TYP"];
							delete data["ZZ_MULT_ENTRY_CHAR"];
							delete data["ZZ_VISA_EDATE_VALUE"];
							delete data["ZZ_VISA_SDATE_VALUE"];
							delete data["ZZ_VISA_EDATE_ERROR"];
							delete data["ZZ_VISA_SDATE_ERROR"];
							delete data["ZZ_PASSPORT_NO_ERROR"];
							delete data["ZZ_VISA_NO_ERROR"];
							delete data["enabled"];
							delete data["enabledUpload"];
							delete data["href"];
							delete data["visibleOpen"];
							data.VISAPLANTOITEM = items;

							// Call service to create visa plan
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
								},
							});
							get.done(function(result, response, header) {
								token = header.getResponseHeader("X-CSRF-Token");
								var post = $.ajax({
									cache: false,
									url: sServiceUrl + "DEP_VISA_PLANSet",
									type: "POST",
									beforeSend: function(xhr){
										xhr.setRequestHeader('X-Requested-With', "XMLHttpRequest");
										xhr.setRequestHeader('X-CSRF-Token', token);
										xhr.setRequestHeader('Accept', "application/json");
										xhr.setRequestHeader('DataServiceVersion', "2.0");
										xhr.setRequestHeader('Content-Type', "application/json");
									},
									data: JSON.stringify(data),
									dataType:"json",
									success: function(result) {
										// Update workflow stages
										oDeputationThis.deputationAction("009", "Visa Copy Uploaded");
									},
								});
							});
						}
					}}
		);
	},
	// DEPU SUBMIT COC Button event
	onUploadCOCPress : function(evt) {
		var aData = view.getModel().getData();
		// Validate if COC document has been uploaded or not
		if (!sap.ui.getCore().byId("flexBoxCOC").getVisible()) {
			sap.ca.ui.message.showMessageBox({
				type: sap.ca.ui.message.Type.ERROR,
				message: "Please Upload COC document before submitting",
				details: "Please Upload COC document before submitting"
			});
			return;
		}

		// Validate COC No, Startdate and enddate before uploading COC
		if (aData.screenData.ZZ_COC_STDATE.trim() == "") {
			sap.ca.ui.message.showMessageBox({
				type: sap.ca.ui.message.Type.ERROR,
				message: "Please check From Date before submitting COC",
				details: "Please check From Date before submitting COC"
			});
			sap.ui.getCore().byId('dateCOCSTDATE').setValueState("Error");
			return;
		} else {
			sap.ui.getCore().byId('dateCOCSTDATE').setValueState("None");
		}
		if (aData.screenData.ZZ_COC_EDATE.trim() == "") {
			sap.ca.ui.message.showMessageBox({
				type: sap.ca.ui.message.Type.ERROR,
				message: "Please check To Date before submitting COC",
				details: "Please check To Date before submitting COC"
			});
			sap.ui.getCore().byId('dateCOCEDATE').setValueState("Error");
			return;
		} else {
			sap.ui.getCore().byId('dateCOCEDATE').setValueState("None");
		}
		if (aData.screenData.ZZ_COC_NO.trim() == "") {
			sap.ca.ui.message.showMessageBox({
				type: sap.ca.ui.message.Type.ERROR,
				message: "Please check COC Number before submitting COC",
				details: "Please check COC Number before submitting COC"
			});
			sap.ui.getCore().byId('inputCOCNO').setValueState("Error");
			return;
		} else {
			sap.ui.getCore().byId('inputCOCNO').setValueState("None");
		}

		if (parseInt(aData.screenData.ZZ_COC_STDATE) > parseInt(aData.screenData.ZZ_COC_EDATE)) {
			sap.ca.ui.message.showMessageBox({
				type: sap.ca.ui.message.Type.ERROR,
				message: "COC To Date must be greater than COC From Date",
				details: "COC To Date must be greater than COC From Date"
			});
			sap.ui.getCore().byId('dateCOCSTDATE').setValueState("Error");
			sap.ui.getCore().byId('dateCOCEDATE').setValueState("Error");
			return;
		} else {
			sap.ui.getCore().byId('dateCOCSTDATE').setValueState("None");
			sap.ui.getCore().byId('dateCOCEDATE').setValueState("None");
		}

		//  Start Commented by VAB6KOR on 13.04.2018 
		// COC start date must be less than deputation start date
     // 	if (parseInt(aData.screenData.ZZ_COC_STDATE) > parseInt(aData.screenData.ZZ_DEP_STDATE)) {
	 //   	sap.ca.ui.message.showMessageBox({
	//			type: sap.ca.ui.message.Type.ERROR,
	//		message: "COC Start Date must be less than or equal to Deputation Start Date",
	//   	details: "COC Start Date must be less than or equal to Deputation Start Date"
	//		});
	//		sap.ui.getCore().byId('dateCOCSTDATE').setValueState("Error");
	//		return;
	//	} else {
	//		sap.ui.getCore().byId('dateCOCSTDATE').setValueState("None");
	//	}

		// COC end date must be greater than deputation end date
	//	if (parseInt(aData.screenData.ZZ_COC_EDATE) < parseInt(aData.screenData.ZZ_DEP_ENDATE)) {
	//		sap.ca.ui.message.showMessageBox({
	//			type: sap.ca.ui.message.Type.ERROR,
	//			message: "COC End Date must be greater than or equal to Deputation End Date",
	//			details: "COC End Date must be greater than or equal to Deputation End Date"
	//		});
	//		sap.ui.getCore().byId('dateCOCEDATE').setValueState("Error");
	//		return;
	//	} else {
	//		sap.ui.getCore().byId('dateCOCEDATE').setValueState("None");
	//	}
	//  End Commented by VAB6KOR on 13.04.2018
		
		oDeputationThis.deputationAction("010", "COC Uploaded");
	},
	// DEPU VISA CLEARANCE Button event
	onPassportReturnPress : function(evt) {
		oDeputationThis.deputationAction("CLOSE", "Passport Returned to Employee");
	},
	// DEPU APPROVE NEW RETURN DATE Button event
	onDEPUApprovePress : function(evt) {
		oDeputationThis.deputationAction("016", "Return date approved");
	},
	// DEPU SUBMIT INVITATION Button event
	onSubmitInvitationPress : function(evt) {
		var aData = view.getModel().getData();
		// Check pre approval letter if any
		if (aData.screenData.ZZ_DEP_TOCNTRY == "DE") {
			if(!sap.ui.getCore().byId("flexBoxPreInvitationLetter").getVisible()){
				sap.ca.ui.message.showMessageBox({
					type: sap.ca.ui.message.Type.ERROR,
					message: "Please upload Pre Approval Letter",
				});
				return;
			}
		}

		// Display popup for uploading Invitation Letter.
		if(sap.ui.getCore().byId("flexBoxInvitationLetter").getVisible()){
			oDeputationThis.deputationAction("007", "Invitation Letters submitted");
		}else{
			sap.ca.ui.message.showMessageBox({
				type: sap.ca.ui.message.Type.ERROR,
				message: "Please upload invitation letter",
				details: "Please upload invitation letter"
			});
		}
	},
	// DEPU GENERATE Button event
	onGeneratePress : function(evt) {
		var aData = view.getModel().getData();
		
		// for domestic transfer scenario, if no requisition form uploaded, cannot generate contract letter
		if (aData.screenData.ZZ_DEP_TYPE == "DOME" && aData.screenData.ZZ_TRV_CAT == "TRFR" &&
				aData.screenData.ZZ_TRFR_DOC_PATH == "") {
			sap.ca.ui.message.showMessageBox({
				type: sap.ca.ui.message.Type.ERROR,
				message: "Please upload transfer requisition form for this request using menu button group in dashboard",
				details: "Please upload transfer requisition form for this request using menu button group in dashboard"
			});
			return;
		}
		
		if(sap.ui.project.e2etm.util.StaticUtility.checkCggs(aData.screenData.ZZ_DEP_TOCNTRY,
				aData.screenData.ZZ_ASG_TYP,aData.screenData.ZZ_TRV_CAT)){
			if(aData.screenData.ZZ_SH_STATUS != "A" && aData.screenData.ZZ_SH_STATUS != "E"){
				sap.ca.ui.message.showMessageBox({
					type: sap.ca.ui.message.Type.ERROR,
					message: "Salary statement not available",
					details: "CGGS calculation sheet is not available. Please make sure approved and signed sheet is available before generating the CL"
				});
				return;
			}
		}
		
		var globalData = sap.ui.getCore().getModel("global").getData();
		// fetch assignment model based on deputation type
		if(sap.ui.project.e2etm.util.StaticUtility.checkCggs(aData.screenData.ZZ_DEP_TOCNTRY,
				aData.screenData.ZZ_ASG_TYP,aData.screenData.ZZ_TRV_CAT)){
			oComponent.getModel().read("/GetCLFormatsSet", {async:true, success:jQuery.proxy(function(oData, response) {				
				globalData.clModes = oData.results;
				sap.ui.getCore().getModel("global").setData(globalData);

			},this),error: jQuery.proxy(function(error) {
				
				
			},this)});
		}
		var get = $.ajax({
			cache: false,
			url: sServiceUrl + "AssignmentSet?$filter=ZZ_SMODID eq '" + aData.screenData.ZZ_DEP_TYPE  + "' and ZZ_DEP_REQ eq '" +
			aData.screenData.ZZ_DEP_REQ + "'&$format=json",
			type: "GET"
		});
		get.done(function(result) {
			if (result != null) {
				var asgModelList = [];
				if (aData.screenData.ZZ_TRV_CAT == "TRFR" && aData.screenData.ZZ_DEP_TYPE == "DOME") {
					for (var i = 0; i < result.d.results.length; i++) {
						if (result.d.results[i].ZZ_ASG_TYP == "TRFR" || 
								result.d.results[i].ZZ_ASG_TYP == "") {
							asgModelList.push(result.d.results[i]);
							continue;
						}
					}
				} else {
					for (var i = 0; i < result.d.results.length; i++) {
						if (result.d.results[i].ZZ_ASG_TYP != "TRFR" || 
								result.d.results[i].ZZ_ASG_TYP == "") {
							asgModelList.push(result.d.results[i]);
							continue;
						}
					}
				}
				
				globalData.assgModel = asgModelList;
				sap.ui.getCore().getModel("global").setData(globalData);
				// display popup
				if (oDeputationThis.oCommonDialog) {
					oDeputationThis.oCommonDialog.destroy();
				}
				// instantiate the Fragment if not done yet
				oDeputationThis.oCommonDialog = sap.ui.xmlfragment("sap.ui.project.e2etm.fragment.deputation.COMMON.GenerateCLWFDialog", oDeputationThis);

				oDeputationThis.oCommonDialog.open();

				sap.ui.getCore().byId("cbAssModel").setSelectedKey(aData.screenData.ZZ_ASG_TYP);
//New Changes-Start				
				sap.ui.getCore().byId("flexBoxCls").setVisible(false);
				sap.ui.getCore().byId("flexBoxSal").setVisible(false);
				sap.ui.getCore().byId("flxClFormats").setVisible(false);
				
				if (aData.screenData.ZZ_VREASON != "") {  // Set visibility of fields based on Change Process
					sap.ui.getCore().byId("flexBoxMentor").setVisible(false);
					sap.ui.getCore().byId("flexBoxHost").setVisible(false);
					sap.ui.getCore().byId("flexBoxJob").setVisible(false);
					if(aData.screenData.ZZ_VREASON == "DA" || aData.screenData.ZZ_VREASON == "DR"){
						if(sap.ui.project.e2etm.util.StaticUtility.checkCggs(aData.screenData.ZZ_DEP_TOCNTRY,
								aData.screenData.ZZ_ASG_TYP,aData.screenData.ZZ_TRV_CAT)){
						  if(!(sap.ui.project.e2etm.util.StaticUtility.checkDateInPast(aData.screenData.ZZ_DEP_STDATE)))
							  sap.ui.getCore().byId("flxClFormats").setVisible(true);
							
						}
					}
				} else {  // Set visibility of fields based on Assigment Model and Deputation type(DOME/INTL)
					if (aData.screenData.ZZ_DEP_TYPE == "DOME") {
						sap.ui.getCore().byId("flexBoxMentor").setVisible(false);
						sap.ui.getCore().byId("flexBoxHost").setVisible(false);
						sap.ui.getCore().byId("flexBoxJob").setVisible(false);
					} else {
						if (aData.screenData.ZZ_ASG_TYP == "STA" || aData.screenData.ZZ_ASG_TYP == "TRNG" ||
								aData.screenData.ZZ_ASG_TYP == "STAPP") {   // if assignment model is STA then don't display
							sap.ui.getCore().byId("flexBoxMentor").setVisible(false);
							sap.ui.getCore().byId("flexBoxHost").setVisible(false);
							sap.ui.getCore().byId("flexBoxJob").setVisible(false);
						} else {  // Otherwise display all fields for international deputation process
							sap.ui.getCore().byId("flexBoxMentor").setVisible(true);
							sap.ui.getCore().byId("flexBoxHost").setVisible(true);
							sap.ui.getCore().byId("flexBoxJob").setVisible(true);
							sap.ui.getCore().byId("txtHost").setValue(aData.screenData.ZZ_CUST_NAME);
							sap.ui.getCore().byId("txtMentor").setValue(aData.screenData.ZZ_MENTOR_NAME);
							
						}
						if (aData.screenData.ZZ_ASG_TYP == "NC"){
							sap.ui.getCore().byId("flexBoxCls").setVisible(true);
							sap.ui.getCore().byId("flexBoxSal").setVisible(true);
							sap.ui.getCore().byId("flexBoxHost").setVisible(false);
							sap.ui.getCore().byId("flexBoxJob").setVisible(true);
						}
						
						if(sap.ui.project.e2etm.util.StaticUtility.checkCggs(aData.screenData.ZZ_DEP_TOCNTRY,
								aData.screenData.ZZ_ASG_TYP,aData.screenData.ZZ_TRV_CAT)){
							sap.ui.getCore().byId("flxClFormats").setVisible(true);
							
						}
					}
				}
			}
		});
	},
	// DEPU EDIT CL Button event
	onGenerateCLButtonClick : function(evt) {
		var aData = view.getModel().getData();

		var strStaDeMode = sap.ui.getCore().byId("cbClFormat").getSelectedKey();
		
		// Validate if the assignment model is entered
		var strAssModel = sap.ui.getCore().byId("cbAssModel").getSelectedKey();
		if (strAssModel == "" || strAssModel == null || strAssModel == "Please select") {
			sap.ca.ui.message.showMessageBox({
				type: sap.ca.ui.message.Type.ERROR,
				message: "Please enter Assignment Model",
				details: "Please enter Assignment Model"
			});
			return;
		}

		// Validation for mentor, host, job for creation process
		var strMentor = "";
		var strHost = "";
		var strJob = "";
		var strCls = "";
		var strSal = "";

		if (aData.screenData.ZZ_VREASON == "") {
			if (aData.screenData.ZZ_DEP_TYPE == "INTL" && aData.screenData.ZZ_ASG_TYP != "STA" &&
					aData.screenData.ZZ_ASG_TYP != "STAPP" && aData.screenData.ZZ_ASG_TYP != "NC" &&
					aData.screenData.ZZ_ASG_TYP != "TRNG") {
				strMentor = sap.ui.getCore().byId("txtMentor").getValue();
				strHost = sap.ui.getCore().byId("txtHost").getValue();
				strJob = sap.ui.getCore().byId("txtJob").getValue();

				// Validate if the Mentor is entered
				if (strMentor.trim() == "" || strMentor.trim() == null) {
					sap.ca.ui.message.showMessageBox({
						type: sap.ca.ui.message.Type.ERROR,
						message: "Please enter Mentor",
						details: "Please enter Mentor"
					});
					return;
				}

				// Validate if the Host is entered
				if (strHost.trim() == "" || strHost.trim() == null) {
					sap.ca.ui.message.showMessageBox({
						type: sap.ca.ui.message.Type.ERROR,
						message: "Please enter Host",
						details: "Please enter Host"
					});
					return;
				}

				// Validate if the Job is entered
				if (strJob.trim() == "" || strJob.trim() == null) {
					sap.ca.ui.message.showMessageBox({
						type: sap.ca.ui.message.Type.ERROR,
						message: "Please enter Job",
						details: "Please enter Job"
					});
					return;
				}
			}else if(aData.screenData.ZZ_ASG_TYP == "NC"){
				strMentor = sap.ui.getCore().byId("txtMentor").getValue();
				strCls = sap.ui.getCore().byId("txtCls").getValue();
				strSal = sap.ui.getCore().byId("txtSal").getValue();

				// Validate if the Mentor is entered
				if (strMentor.trim() == "" || strMentor.trim() == null) {
					sap.ca.ui.message.showMessageBox({
						type: sap.ca.ui.message.Type.ERROR,
						message: "Please enter Mentor",
						details: "Please enter Mentor"
					});
					return;
				}
				if (strCls.trim() == "" || strCls.trim() == null) {
					sap.ca.ui.message.showMessageBox({
						type: sap.ca.ui.message.Type.ERROR,
						message: "Please enter Job Classification",
						details: "Please enter Job Classification"
					});
					return;
				}

				// Validate if the Job is entered
				if (strSal.trim() == "" || strSal.trim() == null) {
					sap.ca.ui.message.showMessageBox({
						type: sap.ca.ui.message.Type.ERROR,
						message: "Please enter Salary",
						details: "Please enter Salary"
					});
					return;
				}
			}
		}

		sap.ui.project.e2etm.util.StaticUtility.setBusy(true,oHomeThis);

		// Getting Contract Letter from the backend
		var token = "";
		var get = $.ajax({
			cache: false,
			url: sServiceUrl + "EMP_PASSPORT_INFOSet",
			type: "GET",
			beforeSend: function(xhr){
				xhr.setRequestHeader('X-CSRF-Token', 'Fetch');
			},
		});
		get.done(function(result, response, header){
			token = header.getResponseHeader("X-CSRF-Token");
			var data = {};
			data.ZZ_DEP_REQ = aData.screenData.ZZ_DEP_REQ;
			data.ZZ_DEP_PERNR = aData.screenData.ZZ_DEP_PERNR;
			data.ZZ_ASG_TYP = strAssModel;
			data.ZZ_AUTOMATIC = '';
			data.ZZ_HOSTENTITY = strHost;
			data.ZZ_JOB = strJob;
			data.ZZ_MENTOR = strMentor;
			data.ZZ_JOB_CLS = strCls;
			data.ZZ_SALARY_SHA = strSal;
			data.ZZ_STADECL_MODE = strStaDeMode;

			var post = $.ajax({
				cache: false,
				url: sServiceUrl + "ZE2E_DOCS_DETAILSSet",
				type: "POST",
				beforeSend: function(xhr){
					xhr.setRequestHeader('X-Requested-With', "XMLHttpRequest");
					xhr.setRequestHeader('X-CSRF-Token', token);
					xhr.setRequestHeader('Accept', "application/json");
					xhr.setRequestHeader('DataServiceVersion', "2.0");
					xhr.setRequestHeader('Content-Type', "application/json");
				},
				data: JSON.stringify(data),
				dataType:"json",
				success: function(data, response, header) {
					// If contract letter is created, then call the get entity service
					var get = $.ajax({
						cache: false,
						url: sServiceUrl + "ZE2E_DOCS_DETAILSSet?$filter=ZZ_DEP_REQ eq '" + aData.screenData.ZZ_DEP_REQ + "'&$format=json",
						type: "GET",
					});
					get.done(function(data) {
						sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
						// Open the link in new window.
						window.open(data.d.results[data.d.results.length - 1].ZZ_DOC_PATH,
								'_blank' // <- This is what makes it open in a new window.
						);
					});
				},
			});
			post.fail(function(err) {
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
				sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
			});
		});
	},
	// DEPU SUBMIT CL TO EMPLOYEE Button event
	onCLSubmitToEMPButtonClick : function(evt) {
		var aData = view.getModel().getData();
		// Deputation generate contract action will happen here
		// Validate if the comment is entered
		var strStaDeMode = sap.ui.getCore().byId("cbClFormat").getSelectedKey();
		var comment = sap.ui.getCore().byId("txtGenerateCLWFComment").getValue();
		var strAssModel = sap.ui.getCore().byId("cbAssModel").getSelectedKey();
		if (comment.trim() == "" || comment.trim() == null) {
			sap.ca.ui.message.showMessageBox({
				type: sap.ca.ui.message.Type.ERROR,
				message: "Please give some comments",
				details: "Please give some comments"
			});
			return;
		} else {
			if (!sap.ui.project.e2etm.util.StaticUtility.check256Characters(comment.trim())) {
				sap.ca.ui.message.showMessageBox({
					type: sap.ca.ui.message.Type.ERROR,
					message: "Maximum 255 characters allowed",
					details: "Maximum 255 characters allowed"
				});
				return;
			}
		}

		// Validate if the assignment model is entered
		if (strAssModel == "" || strAssModel == null || strAssModel == "Please select") {
			sap.ca.ui.message.showMessageBox({
				type: sap.ca.ui.message.Type.ERROR,
				message: "Please enter Assignment Model",
				details: "Please enter Assignment Model"
			});
			return;
		}
		
		
		if(sap.ui.project.e2etm.util.StaticUtility.checkCggs(aData.screenData.ZZ_DEP_TOCNTRY,
				aData.screenData.ZZ_ASG_TYP,aData.screenData.ZZ_TRV_CAT)){
			if(aData.screenData.ZZ_SH_STATUS != "A" && aData.screenData.ZZ_SH_STATUS != "E"){
				sap.ca.ui.message.showMessageBox({
					type: sap.ca.ui.message.Type.ERROR,
					message: "Salary statement not available",
					details: "CGGS calculation sheet is not available. Please make sure approved and signed sheet is available before generating the CL"
				});
				return;
			}
		}

		var strMentor = "";
		var strHost = "";
		var strJob = "";
		var strCls = "";
		var strSal = "";
		if (aData.screenData.ZZ_VREASON == "") {
			if (aData.screenData.ZZ_DEP_TYPE == "INTL" && strAssModel != "STA" &&
					strAssModel != "STAPP" && strAssModel != "NC" &&
					strAssModel != "TRNG") {
				strMentor = sap.ui.getCore().byId("txtMentor").getValue();
				strHost = sap.ui.getCore().byId("txtHost").getValue();
				strJob = sap.ui.getCore().byId("txtJob").getValue();

				// Validate if the Mentor is entered
				if (strMentor.trim() == "" || strMentor.trim() == null) {
					sap.ca.ui.message.showMessageBox({
						type: sap.ca.ui.message.Type.ERROR,
						message: "Please enter Mentor",
						details: "Please enter Mentor"
					});
					return;
				}

				// Validate if the Host is entered
				if (strHost.trim() == "" || strHost.trim() == null) {
					sap.ca.ui.message.showMessageBox({
						type: sap.ca.ui.message.Type.ERROR,
						message: "Please enter Host",
						details: "Please enter Host"
					});
					return;
				}

				// Validate if the Job is entered
				if (strJob.trim() == "" || strJob.trim() == null) {
					sap.ca.ui.message.showMessageBox({
						type: sap.ca.ui.message.Type.ERROR,
						message: "Please enter Job",
						details: "Please enter Job"
					});
					return;
				}
			}else if(strAssModel == "NC"){
				strMentor = sap.ui.getCore().byId("txtMentor").getValue();
				strCls = sap.ui.getCore().byId("txtCls").getValue();
				strSal = sap.ui.getCore().byId("txtSal").getValue();
				strJob = sap.ui.getCore().byId("txtJob").getValue();

				if (strJob.trim() == "" || strJob.trim() == null) {
					sap.ca.ui.message.showMessageBox({
						type: sap.ca.ui.message.Type.ERROR,
						message: "Please enter Job Title",
						details: "Please enter Job Title"
					});
					return;
				}
				
				// Validate if the Mentor is entered
				
				
				if (strMentor.trim() == "" || strMentor.trim() == null) {
					sap.ca.ui.message.showMessageBox({
						type: sap.ca.ui.message.Type.ERROR,
						message: "Please enter Mentor",
						details: "Please enter Mentor"
					});
					return;
				}
				if (strCls.trim() == "" || strCls.trim() == null) {
					sap.ca.ui.message.showMessageBox({
						type: sap.ca.ui.message.Type.ERROR,
						message: "Please enter Job Classification",
						details: "Please enter Job Classification"
					});
					return;
				}

				// Validate if the Job is entered
				if (strSal.trim() == "" || strSal.trim() == null) {
					sap.ca.ui.message.showMessageBox({
						type: sap.ca.ui.message.Type.ERROR,
						message: "Please enter Salary",
						details: "Please enter Salary"
					});
					return;
				}
			}
		}

		sap.ui.project.e2etm.util.StaticUtility.setBusy(true,oHomeThis);

		// Getting Contract Letter from the backend
		var token = "";
		var get = $.ajax({
			cache: false,
			url: sServiceUrl + "EMP_PASSPORT_INFOSet",
			type: "GET",
			beforeSend: function(xhr){
				xhr.setRequestHeader('X-CSRF-Token', 'Fetch');
			},
		});
		get.done(function(result, response, header){
			token = header.getResponseHeader("X-CSRF-Token");
			var data = {};
			data.ZZ_DEP_REQ = aData.screenData.ZZ_DEP_REQ;
			data.ZZ_DEP_PERNR = aData.screenData.ZZ_DEP_PERNR;
			data.ZZ_ASG_TYP = strAssModel;
			data.ZZ_AUTOMATIC = 'X';
			data.ZZ_HOSTENTITY = strHost;
			data.ZZ_JOB = strJob;
			data.ZZ_MENTOR = strMentor;
			data.ZZ_STADECL_MODE = strStaDeMode;

			var post = $.ajax({
				cache: false,
				url: sServiceUrl + "ZE2E_DOCS_DETAILSSet",
				type: "POST",
				beforeSend: function(xhr){
					xhr.setRequestHeader('X-Requested-With', "XMLHttpRequest");
					xhr.setRequestHeader('X-CSRF-Token', token);
					xhr.setRequestHeader('Accept', "application/json");
					xhr.setRequestHeader('DataServiceVersion', "2.0");
					xhr.setRequestHeader('Content-Type', "application/json");
				},
				data: JSON.stringify(data),
				dataType:"json",
				success: function(data, response, header) {
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
					oDeputationThis.deputationAction('006', "Successfully generated CL");
				},
			});
			post.fail(function(err) {
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
				sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
			});
		});
	},
	// DEPU CLOSE A REQUEST
	onClosePress : function(evt) {
		oDeputationThis.deputationAction('CLOSE', "Request has been closed");
	},
	
	// GRM SEND BACK Button event
	onSendBackPress : function(evt){
		if (oDeputationThis.oCommonDialog) {
			oDeputationThis.oCommonDialog.destroy();
		}
		// instantiate the Fragment if not done yet
		oDeputationThis.oCommonDialog = sap.ui.xmlfragment("sap.ui.project.e2etm.fragment.deputation.COMMON.CommonWFDialog",oDeputationThis);

		// Visible appropriate buttons in the common Dialog
		sap.ui.getCore().byId("btnAcceptCL").setVisible(false);
		sap.ui.getCore().byId("btnRejectCL").setVisible(false);
		sap.ui.getCore().byId("btnSendBack").setVisible(true);
		sap.ui.getCore().byId("btnReject").setVisible(false);
		sap.ui.getCore().byId("flxSndBack").setVisible(false);
		sap.ui.getCore().byId("rbtnSndEmp").setSelected(true);
		if(sap.ui.getCore().getModel("profile").getData().currentRole == "DEPU"){
			sap.ui.getCore().byId("flxSndBack").setVisible(true);			
		}
		

		oDeputationThis.oCommonDialog.open();
	},
	// GRM SEND BACK WORKFLOW BUTTON event
	onSendBackWFButtonClick : function(evt) {
		var aData = view.getModel().getData();
		// Send Back action will happen here
		// Validate if the comment is entered
		var comment = sap.ui.getCore().byId("txtCommonWFComment").getValue();
		if (comment.trim() == "" || comment.trim() == null) {
			sap.ca.ui.message.showMessageBox({
				type: sap.ca.ui.message.Type.ERROR,
				message: "Please give some comments",
				details: "Please give some comments"
			});
			return;
		} else {
			if (!sap.ui.project.e2etm.util.StaticUtility.check256Characters(comment.trim())) {
				sap.ca.ui.message.showMessageBox({
					type: sap.ca.ui.message.Type.ERROR,
					message: "Maximum 255 characters allowed",
					details: "Maximum 255 characters allowed"
				});
				return;
			}
		  if(sap.ui.getCore().getModel("profile").getData().currentRole != "EMP" &&
		     sap.ui.getCore().getModel("profile").getData().currentRole != "DEPU"){	
			if (aData.screenData.ZZ_REQ_TYP == "DEPU" && 
					(aData.screenData.ZZ_TRV_REQ == "0000000000" || aData.screenData.ZZ_TRV_REQ == "" ||
							aData.screenData.ZZ_TRV_REQ == null)) {
				// Call webservice to sendback
				if (sap.ui.getCore().getModel("profile").getData().currentRole == "GRM") {
					oDeputationThis.managerAction('003', "Successfully Sent for changes");
				} else if (sap.ui.getCore().getModel("profile").getData().currentRole == "DEPU") {
					oDeputationThis.deputationAction('003', "Successfully Sent for changes");
				} else if (sap.ui.getCore().getModel("profile").getData().currentRole == "EMP") {
					oDeputationThis.employeeAction('014', "Successfully Sent for changes");
				}
			} else {
				var reqNo = "";
				if (aData.screenData.ZZ_REQ_TYP == "BUSR" || aData.screenData.ZZ_REQ_TYP == "SECO" ||
						aData.screenData.ZZ_REQ_TYP == "EMER" || aData.screenData.ZZ_REQ_TYP == "HOME" ||
						aData.screenData.ZZ_REQ_TYP == "INFO") {
					reqNo = aData.screenData.ZZ_DEP_REQ;
				} else {
					reqNo = aData.screenData.ZZ_TRV_REQ;
				}

				var get = $.ajax({
					cache: false,
					url: sServiceUrl + 'TravelSendBack?' + "ZZ_COMMENTS='" + comment +
					"'&ZZ_MGR_PERNR='" + sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_PERNR +
					"'&ZZ_REINR='" + reqNo +
					"'&ZZ_ROLE='" + sap.ui.getCore().getModel("profile").getData().currentRole + 
					"'&ZZ_TTYPE='" + aData.screenData.ZZ_REQ_TYP +
					"'&ZZ_TIMESTAMP='" +  aData.screenData.ZZ_TIMESTAMP +
					"'&$format=json",
					type: "GET"
				});
				get.done(function(result){
					oDeputationThis.oCommonDialog.close();
					sap.m.MessageToast.show("Request sent back for correction!");
					sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
				});
				get.fail(function(err) {
					oDeputationThis.oCommonDialog.close();
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
			}
		  }else{//If role is Emp or depu
			  if(sap.ui.getCore().getModel("profile").getData().currentRole == "EMP"){// then Employee clicks on Send Back Contract Letter
			       oDeputationThis.employeeAction('014', "Successfully Sent for changes");
			  }else if (sap.ui.getCore().getModel("profile").getData().currentRole == "DEPU" && aData.screenData.ZZ_REQ_TYP == "DEPU"){ 
				   oDeputationThis.deputationAction('003', "Successfully Sent for changes");
			  }
		  }
		}
	},
	// GRM REJECT Button event
	onRejectPress : function(evt){
		if (oDeputationThis.oCommonDialog) {
			oDeputationThis.oCommonDialog.destroy();
		}
		// instantiate the Fragment if not done yet
		oDeputationThis.oCommonDialog = sap.ui.xmlfragment("sap.ui.project.e2etm.fragment.deputation.COMMON.CommonWFDialog",oDeputationThis);

		// Visible appropriate buttons in the common Dialog
		sap.ui.getCore().byId("btnAcceptCL").setVisible(false);
		sap.ui.getCore().byId("btnRejectCL").setVisible(false);
		sap.ui.getCore().byId("btnSendBack").setVisible(false);
		sap.ui.getCore().byId("btnReject").setVisible(true);

		oDeputationThis.oCommonDialog.open();
	},
	// GRM REJECT WORKFLOW BUTTON event
	onRejectWFButtonClick : function(evt) {
		var aData = view.getModel().getData();
		// Reject action will happen here
		// Validate if the comment is entered
		
		var comment = sap.ui.getCore().byId("txtCommonWFComment").getValue();
		oThis.getView().byId("txtReject").setVisible(true);	
		if (comment.trim() == "" || comment.trim() == null) {
			sap.ca.ui.message.showMessageBox({
				
				type: sap.ca.ui.message.Type.ERROR,
				message: "Please give some comments",
				details: "Please give some comments"
			});
			return;
		} else {
			if (!sap.ui.project.e2etm.util.StaticUtility.check256Characters(comment.trim())) {
				sap.ca.ui.message.showMessageBox({
					type: sap.ca.ui.message.Type.ERROR,
					message: "Maximum 255 characters allowed",
					details: "Maximum 255 characters allowed"
				});
				return;
			}

			sap.m.MessageBox.confirm(
					"Complete process needs to be reinitiated if rejected. Do you want to continue?",
					function (oAction){
						if (oAction == "OK") {
							if (aData.screenData.ZZ_REQ_TYP == "DEPU" && 
									(aData.screenData.ZZ_TRV_REQ == "0000000000" || aData.screenData.ZZ_TRV_REQ == "" ||
											aData.screenData.ZZ_TRV_REQ == null || aData.screenData.ZZ_ACTION_MOD == "DEPU")) {
								// Call webservice to reject
								if (sap.ui.getCore().getModel("profile").getData().currentRole == "GRM") {
									oDeputationThis.managerAction('002', "Request rejected!");
								} else if (sap.ui.getCore().getModel("profile").getData().currentRole == "DEPU") {
									oDeputationThis.deputationAction('002', "Request rejected!");
								}
							} else {
								var reqNo = "";
								if (aData.screenData.ZZ_REQ_TYP == "BUSR" || aData.screenData.ZZ_REQ_TYP == "SECO" ||
										aData.screenData.ZZ_REQ_TYP == "EMER" || aData.screenData.ZZ_REQ_TYP == "HOME" ||
										aData.screenData.ZZ_REQ_TYP == "INFO") {
									reqNo = aData.screenData.ZZ_DEP_REQ;
								} else {
									reqNo = aData.screenData.ZZ_TRV_REQ;
								}

								var get = $.ajax({
									cache: false,
									url: sServiceUrl + 'TravelReject?' + "ZZ_COMMENTS='" + comment +
									"'&ZZ_MGR_PERNR='" + sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_PERNR +
									"'&ZZ_REINR='" + reqNo +
									"'&ZZ_ROLE='" + sap.ui.getCore().getModel("profile").getData().currentRole + 
									"'&ZZ_TTYPE='" + aData.screenData.ZZ_REQ_TYP +
									"'&ZZ_TIMESTAMP='" +  aData.screenData.ZZ_TIMESTAMP + 
									"'&$format=json",
									type: "GET"
								});
								get.done(function(result){
									oDeputationThis.oCommonDialog.close();
									sap.m.MessageToast.show("Request rejected!");
									sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
								});
								get.fail(function(err) {
									oDeputationThis.oCommonDialog.close();
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
							}
						} else if (oAction == "CANCEL") {
							sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
						}
					});
		}
	},
	// GRM REJECT Button event
	onRejectCLWFButtonClick : function(evt) {
		// Reject Contract Letter action will happen here
		// Validate if the comment is entered
		var comment = sap.ui.getCore().byId("txtCommonWFComment").getValue();
		if (comment.trim() == "" || comment.trim() == null) {
			sap.ca.ui.message.showMessageBox({
				type: sap.ca.ui.message.Type.ERROR,
				message: "Please give some comments",
				details: "Please give some comments"
			});
			return;
		} else {
			if (!sap.ui.project.e2etm.util.StaticUtility.check256Characters(comment.trim())) {
				sap.ca.ui.message.showMessageBox({
					type: sap.ca.ui.message.Type.ERROR,
					message: "Maximum 255 characters allowed",
					details: "Maximum 255 characters allowed"
				});
				return;
			}
			// Call webservice to reject contract
			// Call webservice to accept contract
			if (sap.ui.getCore().getModel("profile").getData().currentRole == "EMP") {
				oDeputationThis.employeeAction("002", "Contract Letter Rejected");
			}
		}
	},
	// GRM APPROVE CANCEL REQUEST Button event
	onWFApproveCancelRequestPress : function(evt) {
		
	},
	// GRM APPROVE CANCEL WORKFLOW BUTTON event
	onWFApproveRequestPress : function(evt) {
		if (oDeputationThis.oCommonDialog) {
			oDeputationThis.oCommonDialog.destroy();
		}
		// instantiate the Fragment if not done yet
		oDeputationThis.oCommonDialog = sap.ui.xmlfragment("sap.ui.project.e2etm.fragment.deputation.COMMON.ApproveRejectCancelDialog",oDeputationThis);

		sap.ui.getCore().byId("btnDialogRejectCancel").setVisible(false);
		sap.ui.getCore().byId("btnDialogApproveCancel").setVisible(true);
		oDeputationThis.oCommonDialog.open();
	},
	// GRM APPROVE CANCEL REQUEST WORKFLOW BUTTON event
	onApproveCancelRequest : function(evt) {
		// Validate comment field
		if (sap.ui.getCore().byId("txtCancelRequestComment").getValue().trim() == "" || 
				sap.ui.getCore().byId("txtCancelRequestComment").getValue()== null) {
			sap.ca.ui.message.showMessageBox({
				type: sap.ca.ui.message.Type.ERROR,
				message: "Please give some comments",
				details: "Please give some comments"
			});
			return;
		}

		var data = view.getModel().getData().screenData;

		// For deputation request before travel plan generated
		if (data.ZZ_REQ_TYP == "DEPU" && 
				(data.ZZ_TRV_REQ == "0000000000" || data.ZZ_TRV_REQ == "" || data.ZZ_TRV_REQ == null)) { 
			// Call backend service to cancel the request
			var get = $.ajax({
				cache: false,
				url: sServiceUrl + "Cancel?DepReq='" + data.ZZ_DEP_REQ + "'&Role='" + 
				sap.ui.getCore().getModel("profile").getData().currentRole + "'&Comment='" + 
				sap.ui.getCore().byId("txtCancelRequestComment").getValue() + "'&Module=''&Button='AcceptCancel'",
				type: "GET",
			});
		} else {
			var get = $.ajax({
				cache: false,
				url: sServiceUrl + "TravelCancel?ZZ_COMMENTS='" + sap.ui.getCore().byId("txtCancelRequestComment").getValue() +
				"'&ZZ_MGR_PERNR='" + sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_PERNR +
				"'&ZZ_REINR='" + data.ZZ_TRV_REQ +
				"'&ZZ_ROLE='" + sap.ui.getCore().getModel("profile").getData().currentRole +
				"'&ZZ_TTYPE='" + data.ZZ_REQ_TYP +
				"'&ZZ_TIMESTAMP='" +  data.ZZ_TIMESTAMP + "'",
				type: "GET",
			});
		}
		get.fail(function(err) {
			oDeputationThis.oCommonDialog.close();
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
		get.done(function(result, response, header){
			oDeputationThis.oCommonDialog.close();
			sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
			sap.m.MessageToast.show("Request cancellation approved!");
		});
	},
	// GRM REJECT CANCEL REQUEST Button event
	onWFRejectCancelRequestPress : function(evt) {
		
	},
	// GRM REJECT CANCEL REQUEST WORKFLOW BUTTON event
	onRejectCancelRequest : function(evt) {
		// Validate comment field
		if (sap.ui.getCore().byId("txtCancelRequestComment").getValue().trim() == "" || 
				sap.ui.getCore().byId("txtCancelRequestComment").getValue()== null) {
			sap.ca.ui.message.showMessageBox({
				type: sap.ca.ui.message.Type.ERROR,
				message: "Please give some comments",
				details: "Please give some comments"
			});
			return;
		}

		var data = view.getModel().getData().screenData;
		// For deputation request before travel plan generated
		if (data.ZZ_REQ_TYP == "DEPU" && 
				(data.ZZ_TRV_REQ == "0000000000" || data.ZZ_TRV_REQ == "" || data.ZZ_TRV_REQ == null)) { 
			// Call backend service to cancel the request
			var get = $.ajax({
				cache: false,
				url: sServiceUrl + "Cancel?DepReq='" + data.ZZ_DEP_REQ + "'&Role='" + 
				sap.ui.getCore().getModel("profile").getData().currentRole + "'&Comment='" + 
				sap.ui.getCore().byId("txtCancelRequestComment").getValue() + "'&Module=''&Button='RejectCancel'",
				type: "GET",
			});
		} else {
			var get = $.ajax({
				cache: false,
				url: sServiceUrl + "TravelCancelReject?ZZ_COMMENTS='" + sap.ui.getCore().byId("txtCancelRequestComment").getValue() +
				"'&ZZ_MGR_PERNR='" + sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_PERNR +
				"'&ZZ_REINR='" + data.ZZ_TRV_REQ +
				"'&ZZ_ROLE='" + sap.ui.getCore().getModel("profile").getData().currentRole +
				"'&ZZ_TTYPE='" + data.ZZ_REQ_TYP + 
				"'&ZZ_TIMESTAMP='" +  data.ZZ_TIMESTAMP + "'",
				type: "GET",
			});
		}
		get.fail(function(err) {
			oDeputationThis.oCommonDialog.close();
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
		get.done(function(result, response, header){
			oDeputationThis.oCommonDialog.close();
			sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
			sap.m.MessageToast.show("Request cancellation rejected!");
		});
	},
	// GRM APPROVE DEPU REQUEST Button event
	onApprovePress : function(evt){
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true,oHomeThis);
		var aData = view.getModel().getData();
		var globalData = sap.ui.getCore().getModel("global").getData();

		if (oDeputationThis.oCommonDialog) {
			oDeputationThis.oCommonDialog.destroy();
		}
		// Check if this is approval of a deputation request or a travel request
		// instantiate the Fragment if not done yet
		// Based on request type and display the popup
		if (aData.screenData.ZZ_REQ_TYP == "DEPU" && 
				(aData.screenData.ZZ_TRV_REQ == "0000000000" || aData.screenData.ZZ_TRV_REQ == "" ||
						aData.screenData.ZZ_TRV_REQ == null)) {
			oDeputationThis.oCommonDialog = sap.ui.xmlfragment("sap.ui.project.e2etm.fragment.deputation.COMMON.ManagerWFDialog", oDeputationThis);
			// fetch assignment model based on deputation type
			var get = $.ajax({
				cache: false,
				url: sServiceUrl + "AssignmentSet?$filter=ZZ_SMODID eq '" + aData.screenData.ZZ_DEP_TYPE  + "' and ZZ_DEP_REQ eq '" +
				aData.screenData.ZZ_DEP_REQ + "'&$format=json",
				type: "GET"
			});
			get.done(function(result) {
				if (result != null) {
					var asgModelList = [];
					if (aData.screenData.ZZ_TRV_CAT == "TRFR" && aData.screenData.ZZ_DEP_TYPE == "DOME") {
						for (var i = 0; i < result.d.results.length; i++) {
							if (result.d.results[i].ZZ_ASG_TYP == "TRFR" || 
									result.d.results[i].ZZ_ASG_TYP == "") {
								asgModelList.push(result.d.results[i]);
								continue;
							}
						}
					} else {
						for (var i = 0; i < result.d.results.length; i++) {
							if (result.d.results[i].ZZ_ASG_TYP != "TRFR" || 
									result.d.results[i].ZZ_ASG_TYP == "") {
								asgModelList.push(result.d.results[i]);
								continue;
							}
						}
					}
					
					globalData.assgModel = asgModelList;
					globalData.ZZ_DEP_TOCNTRY = aData.screenData.ZZ_DEP_TOCNTRY;
					sap.ui.getCore().getModel("global").setData(globalData);


					// Set enabling of checkboxes
					try {
						sap.ui.getCore().byId("managerWFDialogTravelPlanCheck").setChecked(true);
					} catch(exc) {}
					try {
						if (aData.screenData.ZZ_DEP_TYPE == "INTL" && aData.screenData.ZZ_REQ_TYP == "DEPU") {
							sap.ui.getCore().byId("managerWFDialogTravelPlanCheck").setEnabled(false);
/*Start-CGGS Changes*/
							if(aData.screenData.ZZ_DEP_TOCNTRY == "DE"&&aData.screenData.ZZ_ASG_TYP == "STA"){
								sap.ui.getCore().byId("cggsFlxBoxDialog").setVisible(true);
							}else{
								sap.ui.getCore().byId("cggsFlxBoxDialog").setVisible(false);								
							}
/*End-CGGS Changes*/							
						} else {
							sap.ui.getCore().byId("managerWFDialogTravelPlanCheck").setEnabled(false);
							if (aData.screenData.ZZ_DEP_TYPE == "DOME") {
								if (aData.screenData.ZZ_ASG_TYP == "TRFR") {
									if (aData.screenData.ZZ_DEP_FRMLOC == aData.screenData.ZZ_DEP_TOLOC) {
										sap.ui.getCore().byId("managerWFDialogTravelPlanCheck").setChecked(false);
									} else {
										sap.ui.getCore().byId("managerWFDialogTravelPlanCheck").setChecked(true);
									}
								} else {
									if (aData.screenData.ZZ_ASG_TYP == "LDEP" || aData.screenData.ZZ_ASG_TYP == "BDEP") {
										sap.ui.getCore().byId("managerWFDialogTravelPlanCheck").setChecked(false);
									} else {
										sap.ui.getCore().byId("managerWFDialogTravelPlanCheck").setChecked(true);
									}
								}
							} else {
								sap.ui.getCore().byId("managerWFDialogTravelPlanCheck").setChecked(true);
							}
						}
					} catch(exc) {}

					// Set default values for dropdownlist
					sap.ui.getCore().byId("cbSubType").setSelectedKey(aData.screenData.ZZ_DEP_SUB_TYPE);
					sap.ui.getCore().byId("cbAssModel").setSelectedKey(aData.screenData.ZZ_ASG_TYP);

					if (aData.screenData.ZZ_STAT_FLAG == "AA003" && 
							aData.screenData.ZZ_DEP_TYPE == "INTL" &&
							aData.screenData.ZZ_REQ_TYP == "DEPU" &&
							aData.screenData.ZZ_TRV_CAT != "TRNG") {
						// charges to family 10/08/2016
//						sap.ui.getCore().byId("cbEligible").setEnabled(true);
//						sap.ui.getCore().byId("cbEligible").setEnabled(false);
						if (aData.screenData.ZZ_DEP_TOCNTRY_TXT == "Germany") {
							sap.ui.getCore().byId("cbEligible").setEnabled(false);
						} else {
							sap.ui.getCore().byId("cbEligible").setEnabled(true);
						}
						// charges to family 10/08/2016
						sap.ui.getCore().byId("cbEligibleFB").setVisible(true);
						if (aData.screenData.ZZ_SP_CMPNY) {
							sap.ui.getCore().byId("cbEligible").setSelectedKey("X");
						} else {
							sap.ui.getCore().byId("cbEligible").setSelectedKey("");
						}
					}else{
						sap.ui.getCore().byId("cbEligible").setEnabled(false);
						sap.ui.getCore().byId("cbEligibleFB").setVisible(false);
						if (aData.screenData.ZZ_SP_CMPNY) {
							sap.ui.getCore().byId("cbEligible").setSelectedKey("X");
						} else {
							sap.ui.getCore().byId("cbEligible").setSelectedKey("");
						}
					}

					if (aData.screenData.ZZ_DEP_TYPE == "DOME") {
						sap.ui.getCore().byId("flexBoxServiceConditionManager").setVisible(false);
						sap.ui.getCore().byId("flexBoxServiceDurationManager").setVisible(false);
						sap.ui.getCore().byId("flexBoxServiceCheckManager").setVisible(false);
					} else {
						sap.ui.getCore().byId("flexBoxServiceConditionManager").setVisible(true);
						sap.ui.getCore().byId("flexBoxServiceDurationManager").setVisible(true);
						sap.ui.getCore().byId("flexBoxServiceCheckManager").setVisible(true);
						sap.ui.getCore().byId("cbServiceCon").setSelectedKey("NORM");
						sap.ui.getCore().byId("txtServiceDuration").setEnabled(false);
						sap.ui.getCore().byId("txtServiceDuration").setValue("6");
						sap.ui.getCore().byId("managerServiceConditionCheck1").setVisible(false);
					}

					if (aData.screenData.ZZ_TRV_PUR == "") {
						sap.ui.getCore().byId("cbPurpose").setSelectedKey("PROJ");
					} else {
						sap.ui.getCore().byId("cbPurpose").setSelectedKey(aData.screenData.ZZ_TRV_PUR);
					}

					if (aData.screenData.ZZ_SERV_TYP == "") {
						sap.ui.getCore().byId("cbServiceCon").setSelectedKey("NORM");
						sap.ui.getCore().byId("txtServiceDuration").setEnabled(false);

						if (aData.screenData.ZZ_DEP_DAYS <= 90) {
							sap.ui.getCore().byId("txtServiceDuration").setValue("3");
							sap.ui.getCore().byId("cbServiceCon").setEnabled(false);
						} else {
							sap.ui.getCore().byId("txtServiceDuration").setValue("6");
							sap.ui.getCore().byId("cbServiceCon").setEnabled(true);
						}

						sap.ui.getCore().byId("flexBoxServiceCheckManager").setVisible(false);
						sap.ui.getCore().byId("managerServiceConditionCheck1").setVisible(true);
					} else {
						sap.ui.getCore().byId("cbServiceCon").setSelectedKey(aData.screenData.ZZ_SERV_TYP);
						sap.ui.getCore().byId("cbServiceCon").setEnabled(true);
/*Newly added as a part of change*/						
						if (aData.screenData.ZZ_DEP_DAYS <= 90) {
							sap.ui.getCore().byId("txtServiceDuration").setValue("3");
							sap.ui.getCore().byId("cbServiceCon").setEnabled(false);
						} else {
							sap.ui.getCore().byId("txtServiceDuration").setValue("6");
							sap.ui.getCore().byId("cbServiceCon").setEnabled(true);
						}
/*Newly added as a part of change*/									
/*Commented as a part of change*/						
//						sap.ui.getCore().byId("txtServiceDuration").setValue(aData.screenData.ZZ_SRVTYP_MONTHS);
//						sap.ui.getCore().byId("txtServiceDuration").setEnabled(true);
/*Commented as a part of change*/								
						if (aData.screenData.ZZ_SERV_TYP == "NORM") {
							sap.ui.getCore().byId("flexBoxServiceCheckManager").setVisible(true);
						} else {
							sap.ui.getCore().byId("flexBoxServiceCheckManager").setVisible(true);
							sap.ui.getCore().byId("managerServiceConditionCheck1").setVisible(true);
							sap.ui.getCore().byId("managerServiceConditionCheck1").setChecked(true);
							sap.ui.getCore().byId("managerServiceConditionCheck1").setEnabled(true);
						}
					}
					
					if (aData.screenData.ZZ_ASG_TYP == "TRFR" && aData.screenData.ZZ_DEP_TYPE == "DOME") {
						sap.ui.getCore().byId("flexBoxTransferReasonManager").setVisible(true);
					} else {
						sap.ui.getCore().byId("flexBoxTransferReasonManager").setVisible(false);
					}
					
					 if (aData.screenData.ZZ_ASG_TYP == "NC") {
					    	sap.ui.getCore().byId("cbEligible").setSelectedKey("");
					    	sap.ui.getCore().byId("cbEligible").setEnabled(false); 
					    	sap.ui.getCore().byId("cbServiceCon").setEnabled(false); 
					    	sap.ui.getCore().byId("cbServiceCon").setSelectedKey("NORM"); 
					    	sap.ui.getCore().byId("txtServiceDuration").setValue("6");
					    	sap.ui.getCore().byId("txtServiceDuration").setEnabled(false); 
					    }
					
					sap.ui.project.e2etm.util.StaticUtility.fetchCGGSChecklistForms(aData.screenData,sap.ui.getCore().byId("grmDetailedCggsChecklist--cggsFormsDisplay"));
					oDeputationThis.oCommonDialog.open();
					
					
					if (aData.screenData.ZZ_DEP_TYPE == "DOME" && aData.screenData.ZZ_TRV_CAT == "TRFR") {
						var filterGlobalCust = new sap.ui.model.Filter("ZZ_DEP_SUB_TYPE", sap.ui.model.FilterOperator.NE, "GLOB");
						sap.ui.getCore().byId("cbSubType").getBinding("items").
							filter([filterGlobalCust], sap.ui.model.FilterType.Application);
					} else if (aData.screenData.ZZ_DEP_TYPE == "INTL" && aData.screenData.ZZ_TRV_CAT == "TRFR") {
						var filterGlobalCust = new sap.ui.model.Filter("ZZ_DEP_SUB_TYPE", sap.ui.model.FilterOperator.NE, "INRB");
						sap.ui.getCore().byId("cbSubType").getBinding("items").
							filter([filterGlobalCust], sap.ui.model.FilterType.Application);
					}
					
				}
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
			});
		} else {
			oDeputationThis.oCommonDialog = sap.ui.xmlfragment("sap.ui.project.e2etm.fragment.deputation.COMMON.ManagerTPWFDialog", oDeputationThis);
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
			sap.ui.getCore().byId("cbSubType").setSelectedKey(aData.screenData.ZZ_DEP_SUB_TYPE);
//			if (aData.screenData.ZZ_DEP_SUB_TYPE == "" || aData.screenData.ZZ_DEP_SUB_TYPE == "*") {
//			sap.ui.getCore().byId("cbSubType").setEnabled(true);
//			} else {
//			sap.ui.getCore().byId("cbSubType").setEnabled(false);
//			}
			oDeputationThis.oCommonDialog.open();
		}
	},
	// GRM APPROVE DEPU REQUEST WORKFLOW BUTTON event
	onManagerApproveClick : function(evt) {
		var aData = view.getModel().getData();
		// In manager role, if action is approve, 
		// validate deputation subtype
		var strSubType = sap.ui.getCore().byId("cbSubType").getSelectedKey();
		var strPurpose = sap.ui.getCore().byId("cbPurpose").getSelectedKey();
		var strServiceCon = sap.ui.getCore().byId("cbServiceCon").getSelectedKey();
		var strAssModel = sap.ui.getCore().byId("cbAssModel").getSelectedKey();
		var strSponsor = sap.ui.getCore().byId("cbEligible").getSelectedKey();

		// Manager approve action will happen here
		// Validate if the comment is entered
		var comment = sap.ui.getCore().byId("txtManagerWFComment").getValue();
		if (comment.trim() == "" || comment.trim() == null) {
			sap.ca.ui.message.showMessageBox({
				type: sap.ca.ui.message.Type.ERROR,
				message: "Please give some comments",
				details: "Please give some comments"
			});
			return;
		} else {
			if (!sap.ui.project.e2etm.util.StaticUtility.check256Characters(comment.trim())) {
				sap.ca.ui.message.showMessageBox({
					type: sap.ca.ui.message.Type.ERROR,
					message: "Maximum 255 characters allowed",
					details: "Maximum 255 characters allowed"
				});
				return;
			}
		}

		if(strSponsor == "NA"){
			sap.ca.ui.message.showMessageBox({
				type: sap.ca.ui.message.Type.ERROR,
				message: "Please enter Family sponsored",
				details: "Please enter Family sponsored"
			});
			return;
		}

		if (strSubType == "" || strSubType == null || strSubType == "Please select") {
			sap.ca.ui.message.showMessageBox({
				type: sap.ca.ui.message.Type.ERROR,
				message: "Please enter Deputation To",
				details: "Please enter Deputation To"
			});
			return;
		}

		if (strAssModel == "" || strAssModel == null || strAssModel == "Please select") {
			sap.ca.ui.message.showMessageBox({
				type: sap.ca.ui.message.Type.ERROR,
				message: "Please enter Assignment Model",
				details: "Please enter Assignment Model"
			});
			return;
		} else {
			// Validate DE STA
			var globalData = sap.ui.getCore().getModel("global").getData();
			if (aData.screenData.ZZ_DEP_TOCNTRY == "DE" && strAssModel == "STA") {
				// Validate if info type 41 is missing
				if (oHomeThis.missingInfoType != null) {
					if (oHomeThis.missingInfoType) {
						sap.ca.ui.message.showMessageBox({
							type: sap.ca.ui.message.Type.ERROR,
							message: "You cannot approve this request because of missing info type 41",
						});
						return;
					}
				}
				
				if ( sap.ui.getCore().getModel("global").getData().CoolingPeriodCheck.EXCEPTION == "") {
					var nextDate = sap.ui.getCore().getModel("global").getData().CoolingPeriodCheck.NEXT_DATE;
					var nextDateObj = new Date(nextDate.substr(0, 4), nextDate.substr(4, 2) - 1, nextDate.substr(6, 2));
					var startDateObj = new Date(aData.screenData.ZZ_DEP_STDATE.substr(0, 4), 
							aData.screenData.ZZ_DEP_STDATE.substr(4, 2) - 1, aData.screenData.ZZ_DEP_STDATE.substr(6, 2));
					if ((nextDateObj > startDateObj && aData.screenData.ZZ_VREASON == "") || 
							parseInt(aData.screenData.ZZ_DEP_DAYS) > parseInt(sap.ui.getCore().getModel("global").getData().CoolingPeriodCheck.MAX_DURATION)) {
						
						//TGG1HC
						var sMaxday = 0;
						if(parseInt(sap.ui.getCore().getModel("global").getData().CoolingPeriodCheck.MAX_DURATION) > sap.ui.getCore().getModel("global").getData().coolingPeriodMaxdays){
							sMaxday = sap.ui.getCore().getModel("global").getData().coolingPeriodMaxdays;
						}else{
							sMaxday = sap.ui.getCore().getModel("global").getData().CoolingPeriodCheck.MAX_DURATION;
						}
						
							if( sap.ui.project.e2etm.util.StaticUtility.checkCoolingDate( aData.screenData.ZZ_DEP_STDATE, sap.ui.getCore().getModel("global").getData().coolingPeriodStartDate ) ){
//							var text = 'Please check your information. You can only travel to Germany on "STA Assignment Model" from ' 
//								+ sap.ui.project.e2etm.util.Formatter.sapDate(nextDate) + ' for a maximum of ' + 
//								sap.ui.getCore().getModel("global").getData().CoolingPeriodCheck.MAX_DURATION + ' days';
//							var text = 'Please check your information. You can only travel to Germany on "STA Assignment Model" from ' 
//								+ sap.ui.project.e2etm.util.Formatter.sapDate(nextDate);
//							var text = 'Associate can travel to Germany on "STA Assignment Model" only from ' 
//								+ sap.ui.project.e2etm.util.Formatter.sapDate(nextDate)
////								+ ' for a deputation of ' + sap.ui.getCore().getModel("global").getData().CoolingPeriodCheck.MAX_DURATION
//								+ ' for a deputation of ' + sMaxday
//								+ ' days as per RBEI Cooling period guidelines.';
								var coolStartDate = sap.ui.getCore().getModel("global").getData().coolingPeriodStartDate;
								
								var text = 'As per proposed cooling off conditions, associate is not eligible to travel on given date. Proposed start date will be ' 
									+ sap.ui.project.e2etm.util.Formatter.sapDate(nextDate)
									+ ' for a  maximum duration of ' + sMaxday
									+ ' days. Cooling period between two STA assignments will be enforced strictly effective '+sap.ui.project.e2etm.util.Formatter.sapDate(coolStartDate)+'.';
									
								
							sap.ca.ui.message.showMessageBox({
								type: sap.ca.ui.message.Type.ERROR,
								message: text,
							});
							return;
						}else{
//							var text = 'Please check your information. You can only travel to Germany on "STA Assignment Model" from ' 
//								+ sap.ui.project.e2etm.util.Formatter.sapDate(nextDate) + ". Do you want to contunue ?";
							var text = 'Associate can travel to Germany on "STA Assignment Model" only from ' 
								+ sap.ui.project.e2etm.util.Formatter.sapDate(nextDate)
//								+ ' for a deputation of ' + sap.ui.getCore().getModel("global").getData().CoolingPeriodCheck.MAX_DURATION
								+ ' for a deputation of ' + sMaxday
								+ ' days as per RBEI Cooling period guidelines. Do you want to continue?';
							sap.m.MessageBox.confirm(
									text,
									function (oAction){
										if (oAction == "OK") {
											oDeputationThis.managerAction('001', "Successfully Approved");
										}
									});	
							sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
							return;
						}
					}
				}
			}
		}

		// validate Motive for travel
		if (strPurpose == "" || strPurpose == null || strPurpose == "Please select") {
			sap.ca.ui.message.showMessageBox({
				type: sap.ca.ui.message.Type.ERROR,
				message: "Please enter Motive for travel",
				details: "Please enter Motive for travel"
			});
			return;
		} else {
			if (strPurpose != "PROJ" && aData.screenData.ZZ_DEP_TYPE == "DOME" && aData.screenData.ZZ_TRV_CAT != "TRFR") {
				sap.ca.ui.message.showMessageBox({
					type: sap.ca.ui.message.Type.ERROR,
					message: "For domestic deputation, Motive for travel must be Project Development",
					details: "For domestic deputation, Motive for travel must be Project Development"
				});
				return;
			}
		}
		// validate service condition
		if ((strServiceCon == "" || strServiceCon == null || strServiceCon == "Please select") && 
				aData.screenData.ZZ_DEP_TYPE == "INTL") {
			sap.ca.ui.message.showMessageBox({
				type: sap.ca.ui.message.Type.ERROR,
				message: "Please enter Service Condition",
				details: "Please enter Service Condition"
			});
			return;
		} else {
			// Validate service duration
			if (strServiceCon == "SPCL" && aData.screenData.ZZ_DEP_TYPE == "INTL") {
				if (sap.ui.getCore().byId("txtServiceDuration").getValue().trim() == "") {
					sap.ca.ui.message.showMessageBox({
						type: sap.ca.ui.message.Type.ERROR,
						message: "Please enter Service Condition duration",
						details: "Please enter Service Condition duration"
					});
					return;
				} else {
					// Validate if it's a number or not
					if (isNaN(sap.ui.getCore().byId("txtServiceDuration").getProperty("value"))) {
						sap.ca.ui.message.showMessageBox({
							type: sap.ca.ui.message.Type.ERROR,
							message: "Please enter Service Condition duration as a number",
							details: "Please enter Service Condition duration as a number"
						});
						return;
					} else {
						// Validate if it's a positive number or not
						if (parseInt(sap.ui.getCore().byId("txtServiceDuration").getProperty("value")) <= 0) {
							sap.ca.ui.message.showMessageBox({
								type: sap.ca.ui.message.Type.ERROR,
								message: "Please check the Service Condition duration",
								details: "It should be greater than 0"
							});
							return;
						} else {
							if (parseInt(sap.ui.getCore().byId("txtServiceDuration").getProperty("value")) > 24 || 
									parseInt(sap.ui.getCore().byId("txtServiceDuration").getProperty("value")) < 1) {
								sap.ca.ui.message.showMessageBox({
									type: sap.ca.ui.message.Type.ERROR,
									message: "Please check the Service Condition duration",
									details: "It should be >= 1 and <= 24 months"
								});
								return;
							}
						}
					}
				}
			}
		}
		// Validate confirm service condition checkbox
		if (strServiceCon == "SPCL" && aData.screenData.ZZ_DEP_TYPE == "INTL") {
			var serviceChecked = sap.ui.getCore().byId("managerServiceConditionCheck1").getChecked();
			if (!serviceChecked) {
				sap.ca.ui.message.showMessageBox({
					type: sap.ca.ui.message.Type.ERROR,
					message: "Please confirm Service Condition by selecting the checkbox below Service Condition dropdown",
					details: "Please confirm Service Condition by selecting the checkbox below Service Condition dropdown"
				});
				return;
			}
		}

		// Call webservice to approve a request
		oDeputationThis.managerAction('001', "Successfully Approved");
	},
	// GRM APPROVE TRAVEL REQUEST WORKFLOW BUTTON event
	onManagerTRApproveClick : function(evt) {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true,oHomeThis);
		// Validation before approving a travel request
		var data = view.getModel().getData();
		var aData = {};
		// Validate deputation subtype
		if (sap.ui.getCore().byId("cbSubType").getSelectedKey() == "") {
			sap.ca.ui.message.showMessageBox({
				type: sap.ca.ui.message.Type.ERROR,
				message: "Please enter Travel To",
				details: "Please enter Travel To"
			});
			return;
		}
		// Validate Comment field
		if (sap.ui.getCore().byId("txtManagerWFComment").getValue().trim() == "" || 
				sap.ui.getCore().byId("txtManagerWFComment").getValue().trim() == null) {
			sap.ca.ui.message.showMessageBox({
				type: sap.ca.ui.message.Type.ERROR,
				message: "Please give some comments",
				details: "Please give some comments"
			});
			return;
		} else {
			if (!sap.ui.project.e2etm.util.StaticUtility.check256Characters(sap.ui.getCore().byId("txtManagerWFComment").getValue().trim())) {
				sap.ca.ui.message.showMessageBox({
					type: sap.ca.ui.message.Type.ERROR,
					message: "Maximum 255 characters allowed",
					details: "Maximum 255 characters allowed"
				});
				return;
			}
		}

		// Check budget availability first
		var reqNo = "";
		if (data.screenData.ZZ_REQ_TYP == "BUSR" || data.screenData.ZZ_REQ_TYP == "SECO" ||
				data.screenData.ZZ_REQ_TYP == "EMER" || data.screenData.ZZ_REQ_TYP == "HOME" ||
				data.screenData.ZZ_REQ_TYP == "INFO") {
			reqNo = data.screenData.ZZ_DEP_REQ;
		} else {
			reqNo = data.screenData.ZZ_TRV_REQ;
		}

		var get = $.ajax({
			cache: false,
			url: sServiceUrl + "BudgetCheck?ZZ_DEP_SUB_TYP='" + sap.ui.getCore().byId("cbSubType").getSelectedKey() + 
			"'&ZZ_PERNR='" + data.screenData.ZZ_DEP_PERNR + 
			"'&ZZ_MGR_PERNR='" + sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_PERNR + 
			"'&ZZ_REINR='" + reqNo + "'&ZZ_STAT_FLAG='" + data.screenData.ZZ_STAT_FLAG + 
			"'&ZZ_TTYPE='" + data.screenData.ZZ_REQ_TYP +
			"'&$format=json",
			type: "GET"
		});
		get.done(function(output){
			try {
				try{
					var sHasBudget = output.d.results[0].ZZ_BUDGET_AVL;
				}catch(ex){
					var sHasBudget = 'X';
				}
				if (sap.ui.project.e2etm.util.StaticUtility.noBudgetCheck(data.screenData.ZZ_STAT_FLAG, sHasBudget, 
						sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_DEPT,
						data.screenData.ZZ_FSTL, data.screenData.ZZ_GEBER, data.screenData.ZZ_DEP_TYPE)) {

					var get = $.ajax({
						cache: false,
						url: sServiceUrl + "APPROVE_TRAVEL?" + 
						"CATID='" + sap.ui.getCore().byId("cbSubType").getSelectedKey() +
						"'&COMMENT='" + sap.ui.getCore().byId("txtManagerWFComment").getValue() +
						"'&PERNR='" + sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_PERNR +
						"'&REQUEST='" + reqNo +
						"'&TYPE='" + data.screenData.ZZ_REQ_TYP +
						"'&ROLE='" + sap.ui.getCore().getModel("profile").getData().currentRole +
						"'&TIMESTAMP='" +  data.screenData.ZZ_TIMESTAMP +
						"'&$format=json",
						type: "GET"
					});
					get.done(function(result) {
						oDeputationThis.oCommonDialog.close();
						sap.m.MessageToast.show("Approve Travel Request Successfully" + "!");
						sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
					});
					get.fail(function(err) {
						oDeputationThis.oCommonDialog.close();
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
				} else {
					oDeputationThis.oCommonDialog.close();
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
					sap.ca.ui.message.showMessageBox({
						type: sap.ca.ui.message.Type.ERROR,
						message: "Cannot approve this request because budget availability is: " + budget,
						details: "Cannot approve this request because budget availability is: " + budget
					});
				}
			} catch(exc) {
				oDeputationThis.oCommonDialog.close();
				oDeputationThis.displayPopUpMessage();
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
				
//				sap.ca.ui.message.showMessageBox({
//					type: sap.ca.ui.message.Type.ERROR,
//					message: "Cannot approve this request because budget is not available. Contact respective Budget Center owner and CTG BU-Coordinators.\n\n" +
//					"1. Mr. Irshad Pasha (RBEI/CTG13) / 6657-1812 / NE1 Coordinator\n" +
//					"2. Mr. Dilip JS (RBEI/CTG15) / 6757-3156 / NE2 Coordinator\n" +
//					"3. Ms. Vanditha JG (RBEI/CTG15) / 6757-3161 / NE3 & ISY Coordinator\n" +
//					"4. Mr. Narendra Kumar R (RBEI/CTG31) / 6757-3124 / BSV Coordinator\n" +
//					"5. Mr. Nishchay Mallaraj Urs (RBEI/CTG36) / 6757-3123 / Corporate Departments Coordinator",
//				});
			}
		});
	},
	  displayPopUpMessage:function(){
			var odata;
			odata = {
					Selpar : '*'
			};
				odata["Constant"] = "BUDGET_CONTACTS" ;
				oComponent.getModel().callFunction("GetTrstPdfMsg", "GET", odata, null, function(oData, response) {
					var content = oData.GetTrstPdfMsg.Message;
					var html = new sap.ui.core.HTML({
						content : content
					});
					var dialog = new sap.m.Dialog({
						title : 'Information',
						type : 'Message',
						content : html,
						beginButton : new sap.m.Button({
							text : 'OK',
							press : function() {
								dialog.close();
							}
						}),
					});
					dialog.open();
		});
	  },
	// GRM CHECK BUDGET WORKFLOW BUTTON event
	onBudgetCheck: function(evt){
		try {
			sap.ui.getCore().byId("lblTotalAmount").destroy();
			sap.ui.getCore().byId("lblBudgetAvailability").destroy();
		} catch(exc) {}
		var aData = view.getModel().getData();
		if (sap.ui.getCore().byId("cbSubType").getSelectedKey() == "") {
			sap.ca.ui.message.showMessageBox({
				type: sap.ca.ui.message.Type.ERROR,
				message: "Please enter Travel To",
				details: "Please enter Travel To"
			});
		} else {
			var reqNo = "";

			if (aData.screenData.ZZ_REQ_TYP == "BUSR" || aData.screenData.ZZ_REQ_TYP == "HOME" ||
					aData.screenData.ZZ_REQ_TYP == "SECO" || aData.screenData.ZZ_REQ_TYP == "EMER" ||
					aData.screenData.ZZ_REQ_TYP == "INFO") {
				reqNo = aData.screenData.ZZ_DEP_REQ;
			} else {
				reqNo = aData.screenData.ZZ_TRV_REQ;
			}

			var get = $.ajax({
				cache: false,
				url: sServiceUrl + "BudgetCheck?ZZ_DEP_SUB_TYP='" + sap.ui.getCore().byId("cbSubType").getSelectedKey() + 
				"'&ZZ_PERNR='" + aData.screenData.ZZ_DEP_PERNR +
				"'&ZZ_MGR_PERNR='" + sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_PERNR + 
				"'&ZZ_REINR='" + reqNo + 
				"'&ZZ_STAT_FLAG='" + "" + 
				"'&ZZ_TTYPE='" + aData.screenData.ZZ_REQ_TYP +
				"'&$format=json",
				type: "GET"
			});
			get.done(function(output){
				try {
					try{
						var sHasBudget = output.d.results[0].ZZ_BUDGET_AVL;
					}catch(ex){
						var sHasBudget = 'X';
					}
					if( sap.ui.project.e2etm.util.StaticUtility.noBudgetCheck(aData.screenData.ZZ_STAT_FLAG,
							sHasBudget, sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_DEPT,
							aData.screenData.ZZ_FSTL, aData.screenData.ZZ_GEBER, aData.screenData.ZZ_DEP_TYPE) ){
						sap.ca.ui.message.showMessageBox({
							type: sap.ca.ui.message.Type.SUCCESS,
							message: "Budget is available for this travel",
							details: "Budget is available for this travel"
						});
					}else{
						sap.ca.ui.message.showMessageBox({
							type: sap.ca.ui.message.Type.ERROR,
							message: "Budget is not available for this travel",
							details: "Budget is not available for this travel"
						});
					}
				} catch(exc) {
					sap.ca.ui.message.showMessageBox({
						type: sap.ca.ui.message.Type.ERROR,
						message: "Budget is not available for this travel",
						details: "Budget is not available for this travel"
					});
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oHomeThis);
				}
			});

		}
	},
	// GRM CHECK TRIP COST WORKFLOW BUTTON event
	onTripCostCheck : function(evt) {
		var aData = view.getModel().getData();
		if (aData.screenData.ZZ_REQ_TYP == "BUSR") {
			reqNo = aData.screenData.ZZ_DEP_REQ;
		} else {
			reqNo = aData.screenData.ZZ_TRV_REQ;
		}
		if (sap.ui.getCore().byId("cbSubType").getSelectedKey() == "") {
			sap.ca.ui.message.showMessageBox({
				type: sap.ca.ui.message.Type.ERROR,
				message: "Please enter Travel To",
				details: "Please enter Travel To"
			});
		} else {
			var get = $.ajax({
				cache: false,
				url: sServiceUrl + "TripCostSplit?ZZ_DEP_SUB_TYP='" + sap.ui.getCore().byId("cbSubType").getSelectedKey() + 
				"'&ZZ_PERNR='" + aData.screenData.ZZ_DEP_PERNR +
				"'&ZZ_MGR_PERNR='" + sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_PERNR + 
				"'&ZZ_REINR='" + reqNo + "'&ZZ_STAT_FLAG='" + "" + 
				"'&ZZ_TTYPE='" + aData.screenData.ZZ_REQ_TYP +
				"'&$format=json",
				type: "GET"
			});
			get.done(function(data){
				var oModel = new sap.ui.model.json.JSONModel();
				oModel.setData(data.d.results);
				var nTotal = sap.ui.project.e2etm.util.StaticUtility.calculateTotalCost(data.d.results);

				if (!oHomeThis["CostDialog"]) {
					oHomeThis["CostDialog"] = sap.ui.xmlfragment("sap.ui.project.e2etm.fragment.home.HOME_Dialog_Cost", oHomeThis);
					oHomeThis.getView().addDependent(oHomeThis["CostDialog"]);
					oHomeThis["CostDialog"].setModel(oModel);
					sap.ui.getCore().byId("tableCost").bindRows("/");
				}
				sap.ui.getCore().byId("tableCost").setVisibleRowCount(data.d.results.length);
				sap.ui.getCore().byId("totalId").setValue(nTotal);
				oHomeThis["CostDialog"].open();
			});
		}

	},

	/*------------------------------------------------------------------------------------*/
		/* Process for File Upload
	/*------------------------------------------------------------------------------------*/
	onFilePress:function(evt){
		var sPath = evt.getSource().getParent().getBindingContext().getPath();
		var oData = sap.ui.getCore().byId("List_Document_Id").getModel().getProperty(sPath);
		if( oData.URL == "" ){
			sap.m.MessageToast.show("Please open file '" + oData.Content.getProperty("value") + "' from local");
		}
	},
	onUploadPress:function(evt){
		var aData = view.getModel().getData();
		sap.ui.project.e2etm.util.StaticUtility.uploadFile(oDeputationThis, 
				sap.ui.getCore().byId("List_Document_Id").getModel(), aData.screenData.ZZ_DEP_REQ, aData.screenData.ZZ_DEP_PERNR);
	},
	onRemovePress: function(evt){
		sap.ui.project.e2etm.util.StaticUtility.removeFile(oDeputationThis, sap.ui.getCore().byId("List_Document_Id").getModel());
	},
	onFileSizeExceed: function(evt){
		sap.m.MessageToast.show("Not allow file size over 5MB",
				{ my: "center center", at: "center center"});
	},
	onTypeMissmatch: function(evt){
		sap.m.MessageToast.show("Only allow file types: image, text, MS Word, MS Excel, pdf",
				{ my: "center center", at: "center center"});
	},
	onFileSelectPress : function(curEvt) {
		sap.ui.project.e2etm.util.StaticUtility.openDeputationFileDialog(oDeputationThis, 
				sap.ui.getCore().byId("List_Document_Id").getModel());
	},
	onFileDownloadPress : function(curEvt) {
		sap.ui.project.e2etm.util.StaticUtility.donwloadSelectedFile();
	},

	onFileChange : function(evt){
		var aData = view.getModel().getData();
		sap.ui.project.e2etm.util.StaticUtility.uploadFileDeputation(oDeputationThis,evt.getSource(),aData.screenData.ZZ_DEP_REQ, aData.screenData.ZZ_DEP_PERNR);
	},
	onDeputationFileDialogClose : function(evt) {
		sap.ui.project.e2etm.util.StaticUtility.closeFileDialog(oDeputationThis, sap.ui.getCore().byId("List_Document_Id").getModel());
	},
	onDocumentTypeSelect : function(evt){
		sap.ui.project.e2etm.util.StaticUtility.filterDocument(oDeputationThis,sap.ui.getCore().byId("List_Document_Id").getModel(),
				evt.getParameter("selectedItem").getProperty("key"));
	},
	onDeputationFileDialogUpload : function(evt){
		sap.ui.project.e2etm.util.StaticUtility.uploadDocument(oDeputationThis,sap.ui.getCore().byId("List_Document_Id").getModel());
	},
	
	// EVENT SHOW PREVIOUS DEPENDENTS
	showPreviousDependents : function(evt) {
		sap.ui.getCore().byId("rowRepeaterFamilyAccompanies").nextPage();
		sap.ui.getCore().byId("btnPreviousVersionDependent").setEnabled(false);
		sap.ui.getCore().byId("btnCurrentVersionDependent").setEnabled(true);
	},
	// EVENT SHOW CURRENT DEPENDENTS
	showCurrentDependents : function(evt) {
		sap.ui.getCore().byId("rowRepeaterFamilyAccompanies").previousPage();
		sap.ui.getCore().byId("btnPreviousVersionDependent").setEnabled(true);
		sap.ui.getCore().byId("btnCurrentVersionDependent").setEnabled(false);
	},
checkCggsData : function(aData) {
		
		//var data = this.getView().getModel("cggsmodel").getData();
		var data = sap.ui.getCore().getModel("global").getData().cggsdata;
		var depData = view.getModel().getData().screenData;
		var cggsFlag = sap.ui.project.e2etm.util.StaticUtility.visibleCggsData(depData.ZZ_TRV_REQ, depData.ZZ_DEP_TOCNTRY, depData.ZZ_ASG_TYP,depData.ZZ_REQ_TYP,depData.ZZ_TRV_CAT);
		if (cggsFlag) {
			if (data.Zlevel == "" || data.Zlevel == undefined) {
				sap.ui.getCore().byId("ipCggsLevelDialog").setValueState("Error");
				return "Please enter Level in Host country";
			}else{
				sap.ui.getCore().byId("ipCggsLevelDialog").setValueState("None");
			}
			if (data.Jobtitle == "" || data.Jobtitle == undefined) {
				sap.ui.getCore().byId("ipCggsjobTitleDialog").setValueState("Error");
				return "Please enter Job Title";
			}else{
				sap.ui.getCore().byId("ipCggsjobTitleDialog").setValueState("None");
			}
			if (data.Amount == "" || data.Amount == undefined) {
				sap.ui.getCore().byId("ipCggsAmtDialog").setValueState("Error");
				return "Please enter Amount";
			}else{
				sap.ui.getCore().byId("ipCggsAmtDialog").setValueState("None");
			}
		}
		return "";
	},
	onParentNameChange:function(evt){
		if(evt.getSource().getValue()!=""){
			view.getModel().getData().screenData.ZZ_PARENTNAME_ERROR = "None";
		}
	},
	onSpouseNameChange:function(evt){
		if(evt.getSource().getValue()!=""){
			view.getModel().getData().screenData.ZZ_SPOUSENAME_ERROR = "None";
		}
	},
	onDesignationChange:function(evt){
		if(evt.getSource().getValue()!=""){
			view.getModel().getData().screenData.ZZ_DESIGNATION_ERROR = "None";
		}
	},
	onCggsAmtChange:function(evt){
		if(evt.getSource().getValue()==""){
			sap.ui.getCore().getModel("global").getData().cggsdata.Amount = 0;
		}	
	},
	addNewBornKid:function(selectedDependents,aData){
		var depfound = [];
		var depFound = -1;
		for(var i=0;i<selectedDependents.length;i++){
			depFound = -1;
			for(var j=0;j<aData.visaExistingDependent.length;j++){
				if(selectedDependents[i].ZZ_DEPE_TYPE == aData.visaExistingDependent[j].ZZ_DEPNDT_TYP) {
				depFound = 0;
				break;
				}else{
					depFound = -1;
				}
			}
			if(depFound == -1){
				depfound.push(i);
			}
		}

			for(var i=0;i<depfound.length;i++){
				var prop = {
						"ZZ_CURR_VISA_TYP"  : "DPND",
						"ZZ_VISA_TOCNTRY"   : aData.screenData.ZZ_DEP_TOCNTRY,
						"ZZ_VISA_FCNTRY"  : aData.screenData.ZZ_DEP_FRCNTRY,
						"ZZ_MULT_ENTRY"   : "",
						"ZZ_MULT_ENTRY_CHAR": false,
						"ZZ_VISA_EDATE"   : "",
						"ZZ_VISA_SDATE"   : "",
						"ZZ_VISA_NO"    : "",
						"ZZ_DEP_REQ"    : "",
						"ZZ_DEPNDT_TYP"   : selectedDependents[depfound[i]].ZZ_DEPE_TYPE,
						"ZZ_VISA_PLAN"    : "",
						"visibleOpen"   : true,
						"enabled"     : true
				};
				
					aData.visaExistingDependent.push(prop);
			}
			return aData;
	},
	getTravelPlan:function(depReq,reqType){
		var odata = {ZZ_DEP_REQ:depReq,ZZ_TRV_KEY:reqType};
		oComponent.getModel().callFunction("GetTravelPlan", "GET", odata, null, function(oData, response) {
		if(oData.GetTravelPlan.ZZ_TRV_REQ != "" && 
	       oData.GetTravelPlan.ZZ_TRV_REQ != " " &&  oData.GetTravelPlan.ZZ_TRV_REQ != "0000000000"){	
			view.byId("lblTrvlRequestNumber").setVisible(true);
			view.byId("lblTrvlRequestType").setVisible(true);
			view.byId("lblTrvlRequestType").setText("TRAVEL REQUEST NO:");	
			view.byId("lblTrvlRequestNumber").setText(oData.GetTravelPlan.ZZ_TRV_REQ);
			}
	}, function(error) {

	}, true);
	},
	setDateChangeEditableFields:function(globalData,aData){
		var prefix = aData.screenData.ZZ_STAT_FLAG.substring(0, 2);
		var action = aData.screenData.ZZ_STAT_FLAG.substring(2, 5);
		if (prefix != "AA" && action == "003" && oDeputationThis.currentStage == "1") {
		if (globalData.changeType == "DA") {
			aData.screenData.startDateChange = true;
			
			if (aData.screenData.ZZ_TRV_CAT == "TRFR" && aData.screenData.ZZ_DEP_TYPE == "DOME") {
				aData.screenData.endDateisChange = false;
			} else {
				aData.screenData.endDateisChange = true;
			}
			
			//fix enabled family
			aData.screenData.isSTAandDE = false;
			//fix enabled family
			aData.screenData.isDependentChangeBeforeDeputation = false;  // used in radios button

			aData.screenData.changeDeputationReturnDate = false; // return date
			aData.screenData.changeDeputationStartDate = false; // start date
//			aData.screenData.changeDeputationReturnDate = true; // return date // Added by VAB6KOR on 09.04.2018
//			aData.screenData.changeDeputationStartDate = true; // start date   // Added by VAB6KOR on 09.04.2018
			aData.screenData.changeDeputationDepeCheck = false; // dependent checkbox
			aData.screenData.changeDeputationDepeType = false; // dependent type
			aData.screenData.changeDeputationDepeVisaExist = false; // dependent visa exist checkbox

			aData.screenData.changeDeputationSelDepeCheck = false; // selected dependent checkbox
			aData.screenData.changeDeputationSelDepeType = false; // selected dependent type
			aData.screenData.changeDeputationSelDepeVisaExist = false; // selected dependent Visa checkbox
			aData.screenData.changeDeputationSelStartDate = true; // selected dependent start date
			aData.screenData.changeDeputationSelReturnDate = true; // selected dependent return date
		} else if (globalData.changeType == "DB") {
			aData.screenData.startDateChange = false;
			
			if (aData.screenData.ZZ_TRV_CAT == "TRFR" && aData.screenData.ZZ_DEP_TYPE == "DOME") {
				aData.screenData.endDateisChange = false;
			} else {
				aData.screenData.endDateisChange = true;
			}
			//fix enabled family
			aData.screenData.isSTAandDE = false;
			//fix enabled family
			aData.screenData.isDependentChangeBeforeDeputation = false;  // used in radios button

		//	aData.screenData.changeDeputationReturnDate = false; // return date
			aData.screenData.changeDeputationReturnDate = true; // return date // // Added by VAB6KOR on 09.04.2018
			aData.screenData.changeDeputationStartDate = false; // start date
			aData.screenData.changeDeputationDepeCheck = false; // dependent checkbox
			aData.screenData.changeDeputationDepeType = false; // dependent type
			aData.screenData.changeDeputationDepeVisaExist = false; // dependent visa exist checkbox

			aData.screenData.changeDeputationSelDepeCheck = false; // selected dependent checkbox
			aData.screenData.changeDeputationSelDepeType = false; // selected dependent type
			aData.screenData.changeDeputationSelDepeVisaExist = false; // selected dependent Visa checkbox
			aData.screenData.changeDeputationSelStartDate = false; // selected dependent start date
			aData.screenData.changeDeputationSelReturnDate = false; // selected dependent return date
		} else if (globalData.changeType == "DE") {
			aData.screenData.startDateChange = false;
			aData.screenData.endDateisChange = false;
//			if (aData.screenData.ZZ_TRV_CAT == "TRFR" && aData.screenData.ZZ_DEP_TYPE == "DOME") {
//				aData.screenData.endDateisChange = false;
//			} else {
//				aData.screenData.endDateisChange = true;
//			}
			//fix enabled family
			aData.screenData.isSTAandDE = false;
			//fix enabled family
			aData.screenData.isDependentChangeBeforeDeputation = true;  // used in radios button

			aData.screenData.changeDeputationReturnDate = true; // return date
			aData.screenData.changeDeputationStartDate = true; // start date
			aData.screenData.changeDeputationDepeCheck = true; // dependent checkbox
			aData.screenData.changeDeputationDepeType = true; // dependent type
			aData.screenData.changeDeputationDepeVisaExist = true; // dependent visa exist checkbox

			aData.screenData.changeDeputationSelDepeCheck = true; // selected dependent checkbox
			aData.screenData.changeDeputationSelDepeType = true; // selected dependent type
			aData.screenData.changeDeputationSelDepeVisaExist = true; // selected dependent Visa checkbox
			aData.screenData.changeDeputationSelStartDate = true; // selected dependent start date
			aData.screenData.changeDeputationSelReturnDate = true; // selected dependent return date
		} else if (globalData.changeType == "DF") {
			aData.screenData.startDateChange = false;
			aData.screenData.endDateisChange = false;
			
			//fix enabled family
			aData.screenData.isSTAandDE = false;
			//fix enabled family
			aData.screenData.isDependentChangeBeforeDeputation = true;  // used in radios button

			aData.screenData.changeDeputationReturnDate = true; // return date
			aData.screenData.changeDeputationStartDate = true; // start date
			aData.screenData.changeDeputationDepeCheck = true; // dependent checkbox
			aData.screenData.changeDeputationDepeType = true; // dependent type
			aData.screenData.changeDeputationDepeVisaExist = true; // dependent visa exist checkbox

			aData.screenData.changeDeputationSelDepeCheck = false; // selected dependent checkbox
			aData.screenData.changeDeputationSelDepeType = false; // selected dependent type
			aData.screenData.changeDeputationSelDepeVisaExist = false; // selected dependent Visa checkbox
			aData.screenData.changeDeputationSelStartDate = false; // selected dependent start date
			aData.screenData.changeDeputationSelReturnDate = false; // selected dependent return date
		} else if (globalData.changeType == "DG") {
			aData.screenData.startDateChange = false;
			aData.screenData.endDateisChange = false;
			
			//fix enabled family
			aData.screenData.isSTAandDE = false;
			//fix enabled family
			aData.screenData.isDependentChangeBeforeDeputation = true;  // used in radios button

			aData.screenData.changeDeputationReturnDate = true; // return date
			aData.screenData.changeDeputationStartDate = true; // start date
			aData.screenData.changeDeputationDepeCheck = true; // dependent checkbox
			aData.screenData.changeDeputationDepeType = true; // dependent type
			aData.screenData.changeDeputationDepeVisaExist = true; // dependent visa exist checkbox

			aData.screenData.changeDeputationSelDepeCheck = false; // selected dependent checkbox
			aData.screenData.changeDeputationSelDepeType = false; // selected dependent type
			aData.screenData.changeDeputationSelDepeVisaExist = false; // selected dependent Visa checkbox
			aData.screenData.changeDeputationSelStartDate = false; // selected dependent start date
			aData.screenData.changeDeputationSelReturnDate = false; // selected dependent return date
		} else if (globalData.changeType == "DH") {
			aData.screenData.startDateChange = false;
			aData.screenData.endDateisChange = false;

			//fix enabled family
			aData.screenData.isSTAandDE = false;
			//fix enabled family
			aData.screenData.isDependentChangeBeforeDeputation = false;  // used in radios button

			aData.screenData.changeDeputationReturnDate = false; // return date
			aData.screenData.changeDeputationStartDate = false; // start date
			aData.screenData.changeDeputationDepeCheck = false; // dependent checkbox
			aData.screenData.changeDeputationDepeType = false; // dependent type
			aData.screenData.changeDeputationDepeVisaExist = false; // dependent visa exist checkbox

			aData.screenData.changeDeputationSelDepeCheck = false; // selected dependent checkbox
			aData.screenData.changeDeputationSelDepeType = false; // selected dependent type
			aData.screenData.changeDeputationSelDepeVisaExist = false; // selected dependent Visa checkbox
			aData.screenData.changeDeputationSelStartDate = false; // selected dependent start date
			aData.screenData.changeDeputationSelReturnDate = true; // selected dependent return date
		} 
		}
		return aData;
	},

	onRemoveCggsFormsDepu:function(evt){
		sap.ui.project.e2etm.util.StaticUtility.deleteFileFromDms(sap.ui.getCore().byId("cggsFormsDisplay").getModel(),
				oDeputationThis.getView().getModel().getData().screenData.ZZ_DEP_REQ,
				oDeputationThis.getView().getModel().getData().screenData.ZZ_DEP_PERNR);
	}
	
/*------------------------USER EVENT HANDLER AREA END------------------------*/
});