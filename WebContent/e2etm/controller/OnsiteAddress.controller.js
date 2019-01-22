jQuery.sap.require("sap.m.MessageBox");
sap.ui
.controller(
		"sap.ui.project.e2etm.controller.OnsiteAddress",
		{
			onInit : function() {
				var oModel = new sap.ui.model.json.JSONModel();
				var oData = {};
				oModel.setData(oData);
				oModel.setSizeLimit(300);
				this.getView().setModel(oModel, "onsiteAddress");
				var oThis = this;
				sap.ui.core.routing.Router.getRouter("MyRouter")
				.attachRoutePatternMatched(this.onRouteMatched,
						this);

			},

			onRouteMatched : function(oEvent) {
				if (oEvent.getParameter("name") == "onsiteaddress") {
					var oThis = this;					
					sap.ui.project.e2etm.util.StaticUtility.setBusy(
							true, oThis);
					this.fetchDetails();
				}
			},

			fetchDetails : function() {
				var oThis = this;
				// Assign employee number, employee name
				var sDate = new Date();				
				var global = sap.ui.getCore().getModel("global").getData();
				var oInitData = this.getView().getModel("onsiteAddress").getData();
				var aEmployeeDetail = sap.ui.getCore().getModel("profile").getData().employeeDetail;
				oInitData = {
						ZZ_TRV_REQ : global.Travel_Request,
						ZZ_EMP_NO : global.Requester,
						ZZ_VALID_FROM : sDate,
						ZZ_DEPT : aEmployeeDetail.ZZ_DEP_DEPT,
						ZZ_TO_COUNTRY : global.ZZ_DEP_TOCNTRY,
						ZZ_WORK_LOC : global.ZZ_DEP_TOLOC_TXT,
						ZZ_RES_ADDR : "",
						ZZ_CONTACT_MOBI : "",
						ZZ_CONTACT_OFFI : "",
						ZZ_DEP_STDATE : global.ZZ_DEP_STDATE,
						ZZ_DEP_STDATE_VALUE :
							new Date(global.ZZ_DEP_STDATE.substr(0, 4), global.ZZ_DEP_STDATE.substr(4, 2) - 1, global.ZZ_DEP_STDATE.substr(6, 2)),							
						ZZ_DEP_EDATE : global.ZZ_DEP_ENDATE,
						ZZ_DEP_EDATE_VALUE : new Date(global.ZZ_DEP_ENDATE.substr(0, 4), global.ZZ_DEP_ENDATE.substr(4, 2) - 1, global.ZZ_DEP_ENDATE.substr(6, 2)),
						ZZ_REP_MGR_NAME : "",
						ZZ_REP_MGR_DEPT : "",
						ZZ_REP_MGR_MOBI : "",
						ZZ_EMER_NAME : "",
						ZZ_EMER_MOBILE : "",
						ZZ_EMER_CITY : "",
						ZZ_EMER_NAME1 : "",
						ZZ_EMER_MOBILE1 : "",
						ZZ_EMER_CITY1 : "",
						ZZ_RES_CO_NAME : "",
						ZZ_REMARK : "",
						ZZ_EMP_NAME : aEmployeeDetail.ZZ_DEP_NAME,
						view : {
							editable : (sap.ui.getCore().getModel("profile").getData().currentRole == "EMP") ? true : false,
							visible : (sap.ui.getCore().getModel("profile").getData().currentRole == "EMP") ? true : false
						}
				};
				this.getView().getModel("onsiteAddress").setData(oInitData);
				
				var sUrl = "ZE2E_ONSITE_ADDRSet(ZZ_TRV_REQ='{0}',ZZ_EMP_NO='{1}',ZZ_VALID_FROM={2})";
				sUrl = sUrl.replace("{0}", global.Travel_Request);
				sUrl = sUrl.replace("{1}", global.Requester);
				sUrl = sUrl.replace("{2}", this.formatDateOdataURL(sDate));
				
				var batchOperation0 = oDataModel.createBatchOperation(sUrl, "GET");
				var batchOperation1 = oDataModel.createBatchOperation("DEP_COUNTRIESSet", "GET");
				
				oDataModel.addBatchReadOperations([batchOperation0, batchOperation1]);
				oDataModel.submitBatch(function(oResult) {
					var oData = oThis.getView().getModel("onsiteAddress").getData();
					var oOnsiteDetail = oResult.__batchResponses[0].data;
					if (oOnsiteDetail !== undefined) {
						oData.ZZ_RES_ADDR = oOnsiteDetail.ZZ_RES_ADDR;
						oData.ZZ_CONTACT_MOBI = oOnsiteDetail.ZZ_CONTACT_MOBI;
						oData.ZZ_CONTACT_OFFI = oOnsiteDetail.ZZ_CONTACT_OFFI;
						oData.ZZ_REP_MGR_NAME = oOnsiteDetail.ZZ_REP_MGR_NAME;
						oData.ZZ_REP_MGR_DEPT = oOnsiteDetail.ZZ_REP_MGR_DEPT;
						oData.ZZ_REP_MGR_MOBI = oOnsiteDetail.ZZ_REP_MGR_MOBI;
						oData.ZZ_EMER_NAME = oOnsiteDetail.ZZ_EMER_NAME;
						oData.ZZ_EMER_MOBILE = oOnsiteDetail.ZZ_EMER_MOBILE;
						oData.ZZ_EMER_CITY = oOnsiteDetail.ZZ_EMER_CITY;
						oData.ZZ_EMER_NAME1 = oOnsiteDetail.ZZ_EMER_NAME1;
						oData.ZZ_EMER_MOBILE1 = oOnsiteDetail.ZZ_EMER_MOBILE1;
						oData.ZZ_EMER_CITY1 = oOnsiteDetail.ZZ_EMER_CITY1;
						oData.ZZ_RES_CO_NAME = oOnsiteDetail.ZZ_RES_CO_NAME;
						oData.ZZ_REMARK = oOnsiteDetail.ZZ_REMARK;
					}					
					
					var oCountry = oResult.__batchResponses[1].data;
					if (oCountry !== undefined) {
						var mCountry = oCountry.results;
						oData.country = mCountry;
					}
					
					oThis.getView().getModel("onsiteAddress").setData(oData);
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
				}, function(oError) {
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
					jQuery.sap.log.info("Odata Error occured");
				});
			},

			onSubmitPress : function(oEvent) {
				var oData = this.getView().getModel("onsiteAddress").getData();
				var sError = this.checkInput(oData);
				
				if (sError != "") {
					sap.ca.ui.message.showMessageBox({
						type : sap.ca.ui.message.Type.ERROR,
						message : sError,
						details : sError
					});
					this.getView().getModel("onsiteAddress").setData(oData);
				} else {
					if ( oData.ZZ_TRV_REQ !== null && oData.ZZ_TRV_REQ !== undefined && oData.ZZ_TRV_REQ !== "") {  
						var oThis = this;
						oData.ZZ_DEP_STDATE_VALUE.setHours(15);
						oData.ZZ_DEP_EDATE_VALUE.setHours(15);
						var mOnsiteAddress = {
								ZZ_TRV_REQ : oData.ZZ_TRV_REQ,
								ZZ_EMP_NO : oData.ZZ_EMP_NO,
								ZZ_VALID_FROM : new Date(),
								ZZ_DEPT : oData.ZZ_DEPT,
								ZZ_TO_COUNTRY : oData.ZZ_TO_COUNTRY,
								ZZ_WORK_LOC : oData.ZZ_WORK_LOC,
								ZZ_RES_ADDR : oData.ZZ_RES_ADDR,
								ZZ_CONTACT_MOBI : oData.ZZ_CONTACT_MOBI,
								ZZ_CONTACT_OFFI : oData.ZZ_CONTACT_OFFI,
								ZZ_DEP_STDATE : oData.ZZ_DEP_STDATE_VALUE, 
								ZZ_DEP_EDATE : oData.ZZ_DEP_EDATE_VALUE, 
								ZZ_REP_MGR_NAME : oData.ZZ_REP_MGR_NAME,
								ZZ_REP_MGR_DEPT : oData.ZZ_REP_MGR_DEPT,
								ZZ_REP_MGR_MOBI : oData.ZZ_REP_MGR_MOBI,
								ZZ_EMER_NAME : oData.ZZ_EMER_NAME,
								ZZ_EMER_MOBILE : oData.ZZ_EMER_MOBILE,
								ZZ_EMER_CITY : oData.ZZ_EMER_CITY,
								ZZ_EMER_NAME1 : oData.ZZ_EMER_NAME1,
								ZZ_EMER_MOBILE1 : oData.ZZ_EMER_MOBILE1,
								ZZ_EMER_CITY1 : oData.ZZ_EMER_CITY1,
								ZZ_RES_CO_NAME : oData.ZZ_RES_CO_NAME,
								ZZ_REMARK : oData.ZZ_REMARK,
								ZZ_EMP_NAME : oData.ZZ_EMP_NAME
						};
	
						sap.ui.project.e2etm.util.StaticUtility.setBusy(true,oThis);
	//					 Send OData Create request
						var oModel = this.getView().getModel();
						oModel.create("/ZE2E_ONSITE_ADDRSet", mOnsiteAddress, {
							success : jQuery.proxy(function(mResponse) {
								jQuery.sap.require("sap.m.MessageToast");
								sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
								sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
							}, this),
							error : jQuery.proxy(function(error) {
								sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
								sap.m.MessageToast.show("Error!");
							}, this)
						});
					} else {
						sap.ca.ui.message.showMessageBox({
							type : sap.ca.ui.message.Type.ERROR,
							message : "Travel request number is missing",
							details : "Travel request number is missing"
						});
					}
				}
			},

			onBackPress : function() {
				if (sap.ui.getCore().getModel("profile").getData().currentRole == "EMP") {
					sap.m.MessageBox
					.confirm(
							"Any unsaved data will be lost, do you want to continue ?",
							function(oAction) {
								if (oAction == "OK") {
									window.history.go(-1);
								} else if (oAction == "CANCEL") {
									return;
								}
							}, "Confirmation");
				}				
			},			

			formatDate: function(sDate) {
				var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "yyyyMMdd" });
				try {
					return oDateFormat.format(new Date(sDate.substr(0, 4), sDate.substr(5, 2) - 1, sDate.substr(8, 2)));
				}
				catch(exc) {
					return oDateFormat.format(sDate);
				}
			},
			
			formatDateOdataURL: function(sDate) {
				var sDay = sDate.getDate();
			    var sMonth = sDate.getMonth() + 1; //Months are zero based
			    var sYear = sDate.getFullYear();
			    if(sDay<10){
			    	sDay='0'+sDay;
			    } 
			    if(sMonth<10){
			    	sMonth='0'+sMonth;
			    }
			    var sToday = "datetime'{0}-{1}-{2}T00%3A00%3A00'";
			    sToday = sToday.replace("{0}", sYear);
			    sToday = sToday.replace("{1}", sMonth);
				sToday = sToday.replace("{2}", sDay);
			    return sToday;
			},
			
			checkInput: function(oData) {
				//Employee info
				if (oData.ZZ_EMP_NAME == null || oData.ZZ_EMP_NAME == "") {
					oData.view.ZZ_EMP_NAME_ERROR = 'Error';
					return this.getView().getModel("i18n").getProperty("enter_required_field");
				} else {
					oData.view.ZZ_EMP_NAME_ERROR = 'None';
				}
				
				if (oData.ZZ_EMP_NO == null || oData.ZZ_EMP_NO == "") {
					oData.view.ZZ_EMP_NO_ERROR = 'Error';
					return this.getView().getModel("i18n").getProperty("enter_required_field");
				} else {
					oData.view.ZZ_EMP_NO_ERROR = 'None';
				}
				
				if (oData.ZZ_DEPT == null || oData.ZZ_DEPT == "") {
					oData.view.ZZ_DEPT_ERROR = 'Error';
					return this.getView().getModel("i18n").getProperty("enter_required_field");
				} else {
					oData.view.ZZ_DEPT_ERROR = 'None';
				}
				
				if (oData.ZZ_TO_COUNTRY == null || oData.ZZ_TO_COUNTRY == "") {
					oData.view.ZZ_TO_COUNTRY_ERROR = 'Error';
					return this.getView().getModel("i18n").getProperty("enter_required_field");
				} else {
					oData.view.ZZ_TO_COUNTRY_ERROR = 'None';
				}
				
				if (oData.ZZ_WORK_LOC == null || oData.ZZ_WORK_LOC == "") {
					oData.view.ZZ_WORK_LOC_ERROR = 'Error';
					return this.getView().getModel("i18n").getProperty("enter_required_field");
				} else {
					oData.view.ZZ_WORK_LOC_ERROR = 'None';
				}
				
				//Emergency info
				if (oData.ZZ_EMER_NAME == null || oData.ZZ_EMER_NAME == "") {
					oData.view.ZZ_EMER_NAME_ERROR = 'Error';
					return this.getView().getModel("i18n").getProperty("enter_required_field");
				} else {
					oData.view.ZZ_EMER_NAME_ERROR = 'None';
				}
				if (oData.ZZ_EMER_MOBILE == null || oData.ZZ_EMER_MOBILE == "") {
					oData.view.ZZ_EMER_MOBILE_ERROR = 'Error';
					return this.getView().getModel("i18n").getProperty("enter_required_field");
				} else {
					oData.view.ZZ_EMER_MOBILE_ERROR = 'None';
				}				
				if (oData.ZZ_EMER_CITY == null || oData.ZZ_EMER_CITY == "") {
					oData.view.ZZ_EMER_CITY_ERROR = 'Error';
					return this.getView().getModel("i18n").getProperty("enter_required_field");
				} else {
					oData.view.ZZ_EMER_CITY_ERROR = 'None';
				}
				if (oData.ZZ_EMER_NAME1 == null || oData.ZZ_EMER_NAME1 == "") {
					oData.view.ZZ_EMER_NAME1_ERROR = 'Error';
					return this.getView().getModel("i18n").getProperty("enter_required_field");
				} else {
					oData.view.ZZ_EMER_NAME1_ERROR = 'None';
				}
				if (oData.ZZ_EMER_MOBILE1 == null || oData.ZZ_EMER_MOBILE1 == "") {
					oData.view.ZZ_EMER_MOBILE1_ERROR = 'Error';
					return this.getView().getModel("i18n").getProperty("enter_required_field");
				} else {
					oData.view.ZZ_EMER_MOBILE1_ERROR = 'None';
				}
				if (oData.ZZ_EMER_CITY1 == null || oData.ZZ_EMER_CITY1 == "") {
					oData.view.ZZ_EMER_CITY1_ERROR = 'Error';
					return this.getView().getModel("i18n").getProperty("enter_required_field");
				} else {
					oData.view.ZZ_EMER_CITY1_ERROR = 'None';
				}				
				if (oData.ZZ_RES_ADDR == null || oData.ZZ_RES_ADDR == "") {
					oData.view.ZZ_RES_ADDR_ERROR = 'Error';
					return this.getView().getModel("i18n").getProperty("enter_required_field");
				} else {
					oData.view.ZZ_RES_ADDR_ERROR = 'None';
				}
				if (oData.ZZ_CONTACT_MOBI == null || oData.ZZ_CONTACT_MOBI == "") {
					oData.view.ZZ_CONTACT_MOBI_ERROR = 'Error';
					return this.getView().getModel("i18n").getProperty("enter_required_field");
				} else {
					oData.view.ZZ_CONTACT_MOBI_ERROR = 'None';
				}
				if (oData.ZZ_CONTACT_OFFI == null || oData.ZZ_CONTACT_OFFI == "") {
					oData.view.ZZ_CONTACT_OFFI_ERROR = 'Error';
					return this.getView().getModel("i18n").getProperty("enter_required_field");
				} else {
					oData.view.ZZ_CONTACT_OFFI_ERROR = 'None';
				}
				if (oData.ZZ_DEP_STDATE == null || oData.ZZ_DEP_STDATE == "") {
					oData.view.ZZ_DEP_STDATE_ERROR = 'Error';
					return this.getView().getModel("i18n").getProperty("enter_required_field");
				} else {
					oData.view.ZZ_DEP_STDATE_ERROR = 'None';
				}
				if (oData.ZZ_DEP_EDATE == null || oData.ZZ_DEP_EDATE == "") {
					oData.view.ZZ_DEP_EDATE_ERROR = 'Error';
					return this.getView().getModel("i18n").getProperty("enter_required_field");
				} else {
					oData.view.ZZ_DEP_EDATE_ERROR = 'None';
				}
				//Comapre 2 dates
				if (oData.ZZ_DEP_EDATE != "" && parseInt(oData.ZZ_DEP_STDATE) > parseInt(oData.ZZ_DEP_EDATE)) {
					oData.view.ZZ_DEP_STDATE_ERROR = 'Error';
					oData.view.ZZ_DEP_EDATE_ERROR = 'Error';
					return "Start Date must be less than or equal to End Date";
				} else {
					oData.view.ZZ_DEP_EDATE_ERROR = 'None';
				}
				
				if (oData.ZZ_REP_MGR_NAME == null || oData.ZZ_REP_MGR_NAME == "") {
					oData.view.ZZ_REP_MGR_NAME_ERROR = 'Error';
					return this.getView().getModel("i18n").getProperty("enter_required_field");
				} else {
					oData.view.ZZ_REP_MGR_NAME_ERROR = 'None';
				}
				
				if (oData.ZZ_REP_MGR_DEPT == null || oData.ZZ_REP_MGR_DEPT == "") {
					oData.view.ZZ_REP_MGR_DEPT_ERROR = 'Error';
					return this.getView().getModel("i18n").getProperty("enter_required_field");
				} else {
					oData.view.ZZ_REP_MGR_DEPT_ERROR = 'None';
				}
				
				if (oData.ZZ_REP_MGR_MOBI == null || oData.ZZ_REP_MGR_MOBI == "") {
					oData.view.ZZ_REP_MGR_MOBI_ERROR = 'Error';
					return this.getView().getModel("i18n").getProperty("enter_required_field");
				} else {
					oData.view.ZZ_REP_MGR_MOBI_ERROR = 'None';
				}				
				
				return "";
			},
			
			onEditPress:function(oEvent) {
				var oData = this.getView().getModel("onsiteAddress").getData();
				//Change icon & text
				if (oData.view.editable == true ) {
					this.getView().byId("btnEdit").setText("Display");
					this.getView().byId("btnEdit").setIcon("sap-icon://display")
				} else {
					this.getView().byId("btnEdit").setText("Edit");
					this.getView().byId("btnEdit").setIcon("sap-icon://edit")
				}
				
				//Change editable status				
				oData.view.editable = (oData.view.editable == true ) ? false : true;
				this.getView().getModel("onsiteAddress").setData(oData);
			}		
		});