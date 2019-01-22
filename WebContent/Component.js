jQuery.sap.declare("sap.ui.project.Component");
jQuery.sap.require("sap.ui.project.MyRouter"); 
jQuery.sap.require("sap.ui.core.routing.History");
var oComponent = null;

sap.ui.core.UIComponent.extend("sap.ui.project.Component", {

	metadata : {
		name : "E2ETM",
		version : "1.0",
		includes : ["jszip/jszip.js","jszip/jsUtil.js","jszip/FileSaver.js","js/constants.js",
		            "js/Base64.js","jszip/jquery.base64.js","jszip/tableExport.js","xlsx/xlsx.js"],
		dependencies : {
			libs : [ "sap.m" ],
		},
		config : {
			resourceBundle : "i18n/messageBundle_en.properties"
		},
	},
	
	init : function() {
		sap.ui.core.UIComponent.prototype.init.apply(this, arguments);
		oComponent = this;
		
		oComponent.getAggregation("rootControl").addStyleClass("loading_background");
		
		// Create and set domain model to the component
		var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);
		oModel.setCountSupported(false);
		this.setModel(oModel);
		
		var resModel = new sap.ui.model.odata.ODataModel(resServiceUrl, {json:true});
		resModel.setDefaultCountMode("None");
		resModel.setDefaultBindingMode("TwoWay");
		this.setModel(resModel,"reservation");

		// set i18n model
		var i18nModel = new sap.ui.model.resource.ResourceModel({
			bundleUrl : "i18n/messageBundle.properties"
		});
		this.setModel(i18nModel, "i18n");
		
		// set device model
		var deviceModel = new sap.ui.model.json.JSONModel({
			isTouch : sap.ui.Device.support.touch,
			isNoTouch : !sap.ui.Device.support.touch,
			isPhone : sap.ui.Device.system.phone,
			isNoPhone : !sap.ui.Device.system.phone,
			listMode : sap.ui.Device.system.phone ? "None" : "SingleSelectMaster",
					listItemType : sap.ui.Device.system.phone ? "Active" : "Inactive"
		});
		deviceModel.setDefaultBindingMode("OneWay");
		this.setModel(deviceModel, "device");

		// Custom router
		var oConfig = {
			"config" : {
				"routerClass" : sap.ui.project.MyRouter,
				"clearTarget" : false
			},
		};
		
		this["busyDialog"] = new sap.m.BusyDialog();
		
		var get = $.ajax({
		    url: sServiceUrl + "DEP_EMPSet",
		    type: "GET",
		    dataType: 'json',
		    async: false,
		});
		get.fail(function(){
			oStaticRoutes.login = {
				"pattern" : "",
				"name" : "login",
				"view" : "Login",
				"viewType" : "XML",
				"viewPath" : "sap.ui.project.e2etm.view",
				"targetControl" : "appID",
				"targetAggregation" : "pages",
    		};
			oStaticRoutes.home = {
				"pattern" : "Home",
				"name" : "home",
				"view" : "Home",
				"viewType" : "XML",
				"viewPath" : "sap.ui.project.e2etm.view",
				"targetControl" : "appID",
				"targetAggregation" : "pages",
			};
			var router = new sap.ui.project.MyRouter(oStaticRoutes, oConfig, oComponent);
			router.register("MyRouter");
			router.initialize();
		});
		get.done(function(result) {
			// Setting up profile data
			if (result != null) {
				var profileModel = new sap.ui.model.json.JSONModel();
				var aData = {};
				
				aData.employeeDetail = result.d.results[0];
				aData.myAction = "";
				
				// Check if this account has manager role and set it to model Profile
				var role = result.d.results[0].ZZ_POSITION;
				var roles = role.split(";");
				var hasMgr = false;
				var hasDepu = false;
				for(var i = 0; i < roles.length; i++) {
					if (roles[i] == "") {
						continue;
					}
					var curRole = roles[i];
					aData.currentRole = curRole;
					if (curRole == "DEPU") {
						hasDepu = true;
						continue;
					}
					if (curRole == "GRM") {
						hasMgr = true;
						break;
					}
				}
				if (hasMgr) {
					aData.currentRole = "GRM";
				} else {
					if (hasDepu) {
						aData.currentRole = "DEPU";
					}
				}
				profileModel.setData(aData);
				sap.ui.getCore().setModel(profileModel, "profile");
			}
		}).then(function(){
			// Setting up global data
			if (sap.ui.getCore().getModel("global") == null) {

				// Global model and data
				var oModel = new sap.ui.model.json.JSONModel();
				oModel.setSizeLimit(300);
				var globalData = {};

				// Profile data
				var aData = sap.ui.getCore().getModel("profile").getData();
				var pernr = aData.employeeDetail.ZZ_DEP_PERNR;

				var batchOperation0 = oDataModel.createBatchOperation("ZE2E_DEP_SERVICESet", "GET");
				var batchOperation1 = oDataModel.createBatchOperation("DEP_VISA_TYPSet", "GET");
				var batchOperation2 = oDataModel.createBatchOperation("DEP_COUNTRIESSet", "GET");
				var batchOperation3 = oDataModel.createBatchOperation("DEP_TRV_PURPOSESet", "GET");
				var batchOperation4 = oDataModel.createBatchOperation("DEP_STYPSet", "GET");
				var batchOperation5 = oDataModel.createBatchOperation("DEP_PASSPORT_INFOSet('" + pernr + "')", "GET");
				var batchOperation6 = oDataModel.createBatchOperation("DEP_EMPSet('" + pernr + "')?$expand=EMPtoEMPDEPNDNT", "GET");
				var batchOperation7 = oDataModel.createBatchOperation("GetConstant?CONST='HOME'&SELPAR='INTL_DURATION'&$format=json", "GET");
				var batchOperation8 = oDataModel.createBatchOperation("GetConstant?CONST='HOME'&SELPAR='DOME_DURATION'&$format=json", "GET");
				var batchOperation9 = oDataModel.createBatchOperation("GetConstant?CONST='HOME'&SELPAR='DOME_PERIOD'&$format=json", "GET");
				var batchOperation10 = oDataModel.createBatchOperation("GetConstant?CONST='DEPU'&SELPAR='SPONSOR_PERIOD'&$format=json", "GET");
				var batchOperation11 = oDataModel.createBatchOperation("GetConstant?CONST='HOME'&SELPAR='OLD_TRAVEL'&$format=json", "GET");
				var batchOperation12 = oDataModel.createBatchOperation("GetConstant?CONST='CARGO'&SELPAR='MIN_DAY'&$format=json", "GET");
				var batchOperation13 = oDataModel.createBatchOperation("GetConstant?CONST='CARGO'&SELPAR='MIN_DUR'&$format=json", "GET");
				var batchOperation14 = oDataModel.createBatchOperation("GetConstant?CONST='CARGO_CONDITION'&SELPAR='DATE'&$format=json", "GET");
				var batchOperation15 = oDataModel.createBatchOperation("GetConstant?CONST='COOLING_DATE_S'&SELPAR=''&$format=json", "GET");
				var batchOperation16 = oDataModel.createBatchOperation("GetConstant?CONST='COOLING_DAYS_M'&SELPAR=''&$format=json", "GET");
				var batchOperation17 = oDataModel.createBatchOperation("GetTravelDurationDays?CONST='BUSR_DURATION'&$format=json", "GET");
				var batchOperation18 = oDataModel.createBatchOperation("GetConstant?CONST='CARGOSTVA'&SELPAR='MIN_DUR'&$format=json", "GET");
				var batchOperation19 = oDataModel.createBatchOperation("GetConstant?CONST='CARGOSTVA'&SELPAR='TPNO'&$format=json", "GET");
				var batchOperation20 = oDataModel.createBatchOperation("GetConstant?CONST='CHGDATFRM'&SELPAR='1'&$format=json", "GET");
				var batchOperation21 = oDataModel.createBatchOperation("GetConstant?CONST='STA_2018'&SELPAR='DATE'&$format=json", "GET");
				var batchOperation22 = oDataModel.createBatchOperation("GetConstant?CONST='STVA_REMINDER'&SELPAR='DAYS'&$format=json", "GET");
				oDataModel.addBatchReadOperations([batchOperation0,batchOperation1,batchOperation2,batchOperation3,
				                                   batchOperation4,batchOperation5,batchOperation6, batchOperation7,
				                                   batchOperation8,batchOperation9,batchOperation10,batchOperation11,
				                                   batchOperation12,batchOperation13,batchOperation14,batchOperation15, 
				                                   batchOperation16,batchOperation17,batchOperation18,batchOperation19,
				                                   batchOperation20,batchOperation21,batchOperation22]);
				oDataModel.submitBatch(function(oResult) {
					// Set dropdownlist data to global model
					globalData.serviceType = oResult.__batchResponses[0].data.results; // ServiceType manager
					globalData.visaType = oResult.__batchResponses[1].data.results;
					globalData.country = oResult.__batchResponses[2].data.results;
					globalData.purpose = oResult.__batchResponses[3].data.results; // PurposeTravel manager
					globalData.subtype = oResult.__batchResponses[4].data.results; // Subtype manager
					globalData.intlDuration = oResult.__batchResponses[7].data.GetConstant.VALUE;
					globalData.domeDuration = oResult.__batchResponses[8].data.GetConstant.VALUE;
					globalData.domePeriod = oResult.__batchResponses[9].data.GetConstant.VALUE;
					globalData.sponsorPeriod = oResult.__batchResponses[10].data.GetConstant.VALUE;
					globalData.oldTravelLink = oResult.__batchResponses[11].data.GetConstant.VALUE;
					globalData.DurStartDate = oResult.__batchResponses[12].data.GetConstant.VALUE;//durration before start date
					globalData.timeActiveCargo = oResult.__batchResponses[13].data.GetConstant.VALUE;// time to active Cargo
					globalData.cargoCondition  = oResult.__batchResponses[14].data.GetConstant.VALUE;// time to switch between AAL and DHL in return Cargo
					globalData.coolingPeriodStartDate  = oResult.__batchResponses[15].data.GetConstant.VALUE;// Start date of cooling period shows error message
					globalData.coolingPeriodMaxdays  = oResult.__batchResponses[16].data.GetConstant.VALUE;
					
					globalData.busrDuration  = oResult.__batchResponses[17].data.results;
					globalData.cargoStvaMinDur  = oResult.__batchResponses[18].data.GetConstant.VALUE;
					globalData.cargoStvaTp = oResult.__batchResponses[19].data.GetConstant.VALUE;
					globalData.changeDateValidity = oResult.__batchResponses[20].data.GetConstant.VALUE;
					globalData.sta2018 = oResult.__batchResponses[21].data.GetConstant.VALUE;
					globalData.stvaReminder = oResult.__batchResponses[22].data.GetConstant.VALUE;
					// Set default value for later usage in Deputation Request Screen
					globalData.selectedDepuType = "Deputation Request";
					globalData.currentStage = "1";
					globalData.currentSet = "1_1";
					globalData.currentSubSet = "1_1_1";
					globalData.currentSubSubSet = "";

					oModel.setData(globalData);
					sap.ui.getCore().setModel(oModel, "global");

					// Update profile model with employee details, passport details and family details
					try {
						aData.passportDetail = oResult.__batchResponses[5].data;
						aData.employeeDetail.isNotSingle = aData.passportDetail.ZZ_MARITIAL_STAT != "0";
						aData.employeeDetail.isEditable = aData.employeeDetail.isNotSingle;
					} catch(exc) {
						aData.employeeDetail.isNotSingle = false;
						aData.employeeDetail.isEditable = false;
					}
					try {
						aData.dependentDetail = oResult.__batchResponses[6].data.EMPtoEMPDEPNDNT.results;
						for(var i=0;i<aData.dependentDetail.length;i++){
							if( aData.dependentDetail[i].ZZ_DATE_EXPIRY != '00000000' &&  aData.dependentDetail[i].ZZ_DATE_EXPIRY != ''){
								aData.dependentDetail[i].ZZ_DATE_EXPIRY_VALUE = new Date(aData.dependentDetail[i].ZZ_DATE_EXPIRY.substr(0, 4), 
										aData.dependentDetail[i].ZZ_DATE_EXPIRY.substr(4, 2) - 1, 
										aData.dependentDetail[i].ZZ_DATE_EXPIRY.substr(6, 2));
							}
							if( aData.dependentDetail[i].ZZ_DATE_ISSUE != '00000000' &&  aData.dependentDetail[i].ZZ_DATE_ISSUE != ''){
								aData.dependentDetail[i].ZZ_DATE_ISSUE_VALUE = new Date(aData.dependentDetail[i].ZZ_DATE_ISSUE.substr(0, 4), 
										aData.dependentDetail[i].ZZ_DATE_ISSUE.substr(4, 2) - 1, 
										aData.dependentDetail[i].ZZ_DATE_ISSUE.substr(6, 2));
							}
						}
					} catch(exc) {}
					aData.yesorno = [{key: "", description: "No"},{key: "X", description: "Yes"}];
					aData.country = globalData.country;
					var oItem = {MOLGA: "", LTEXT: "Please select"};
					aData.country.unshift(oItem);
					sap.ui.getCore().getModel("profile").setData(aData);

					oComponent.getAggregation("rootControl").removeStyleClass("loading_background");
					
					// Initialize router once global values completed
					oStaticRoutes.home = {
						"pattern" : "",
						"name" : "home",
						"view" : "Home",
						"viewType" : "XML",
						"viewPath" : "sap.ui.project.e2etm.view",
						"targetControl" : "appID",
						"targetAggregation" : "pages",
					};
					var router = new sap.ui.project.MyRouter(oStaticRoutes, oConfig, oComponent);
					router.register("MyRouter");
					router.initialize();
				},function(oError) {
					oComponent["busyDialog"].close();
					sap.ca.ui.message.showMessageBox({
						type: sap.ca.ui.message.Type.ERROR,
						message: "Sorry for this inconvenience. Please contact support team",
						details: oError.responseText
					});
				});
			}
		});
	},
	
	createContent : function() {
		var oView = sap.ui.view({
			viewName : "sap.ui.project.e2etm.static-view.App",
			type : "JS",
			viewData : {
				component : this
			}
		});
		oView.component = this;
		return oView;
	}
});