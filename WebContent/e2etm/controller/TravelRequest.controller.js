//Define global main controller to use in child controller
var TravelRequestThis; //eslint-disable-line
jQuery.sap.require('sap.ui.project.e2etm.controls.customFlowStage');
jQuery.sap.require('sap.ui.project.e2etm.controls.stageItem');
sap.ui.define([
	"sap/ui/project/e2etm/util/Formatter",
	"sap/ui/project/e2etm/util/StaticUtility",
	"sap/ca/ui/dialog/factory",
	"sap/ui/project/e2etm/util/TCommonSrv",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(Formatter, StaticUtility, factory, TCommonSrv, JSONModel, MessageToast, Filter, FilterOperator) {
	"use strict";
	/* Global var */
	var oTrip = {
		oneway: 0,
		roundtrip: 1,
		multicity: 2
	};
	/* End Global var*/
	return sap.ui.controller("sap.ui.project.e2etm.controller.TravelRequest", {
		onInit: function() {
			oHomeThis = this; //eslint-disable-line
			TravelRequestThis = this;
			//manual object page
			this.oObjectPageLayout = this.getView().byId("ObjectPageLayout");
			this.aSectionIds = this.oObjectPageLayout.getSections();
			//reset request
			localStorage.setItem("nRequest", "initial");
			//Define View Model
			var oViewModel = new sap.ui.model.json.JSONModel();

			this.getView().setModel(oViewModel, "trvRequestDtl");

			//check route match
			var sRoute = sap.ui.core.routing.Router.getRouter("MyRouter")._oRouter._prevMatchedRequest.split("/")[1];

			if (this.oView.sViewName === "sap.ui.project.e2etm.view.TravelRequest" && sRoute === "TravelRequest") {
				//remove old content

				sap.ui.core.routing.Router.getRouter("MyRouter").attachRoutePatternMatched(this.onRouteMatched, this);
			} else {
				sap.ui.core.routing.Router.getRouter("MyRouter").attachRoutePatternMatched(this.onAdminRouteMatched, this);
			}
			this._handleSectionNavigate();
		},
		// Manual navigate
		_handleSectionNavigate: function() {
			if (this.aSectionIds.length > 0 && this.aSectionIds) {
				for (var s = 0; s < this.aSectionIds.length; s++) {
					this._attachEventToObjPage(this.aSectionIds[s].sId);
				}
			}
		},
		_attachEventToObjPage: function(sSecId) {
			var oThis = this;
			var oSec = this.getView().byId(sSecId);
			oSec.addEventDelegate({
				attachPageDataLoaded: function(oEvent) {
					oThis.onSectionClickHandle(oEvent);
				}
			});
		},
		onSectionClickHandle: function(oEvent) {

		},
		//manuval navigate
		/*Handle route mached */
		onRouteMatched: function(evt) {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oHomeThis); //eslint-disable-line
			//call attach event to section
			//create new request
			var view = evt.mParameters.view;
			TravelRequestThis = view.getController();
			//check route match
			var sRoute = sap.ui.core.routing.Router.getRouter("MyRouter")._oRouter._prevMatchedRequest.split("/")[1];

			if (sRoute === "TravelRequest") {
				if (evt.getParameter("name") === "TravelRequest") {
					this.getView().byId("carouselProcessFlow").destroyContent();
					var oModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, { //eslint-disable-line
						useBatch: true,
						defaultBindingMode: "TwoWay"
					});
					//extra class for custom css class
					if (!$("html").find(".sapMShellCentralBox").hasClass("flexWidth")) {
						$("html").find(".sapMShellCentralBox").addClass("flexWidth");
					}
					this.getView().setModel(oModel);

				}
				var sReqIdArg = evt.getParameter("arguments").reqId;
				if (sReqIdArg !== undefined) {
					//show detail request and edit
					var sReqId = Base64.decode(sReqIdArg); //eslint-disable-line
					//modify req
					var bReqValdid = TCommonSrv.isValidReqId(sReqId);
					if (bReqValdid === false) {
						this._initScreenData(sReqId);
					} else {
						//invalid request id nav to home page
						sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis); //eslint-disable-line

						TCommonSrv._showMsgBox("Error", "Invalid Request Id");
						sap.ui.core.routing.Router.getRouter("MyRouter").navTo("home");
					}

				} else {
					//init screen data
					// sap.ui.project.e2etm.util.StaticUtility.setBusy(true, this); //eslint-disable-line

					this._initScreenData("");
				}
			}

		},
		/* preapare screen for create */
		_getLocKeyByCity: function(oDataModel, sCityName, sCntCode) {
			var oLocObj = "",
				sPath = "/GetLocationCombo",
				sUrlParams = "ZZ_CITYNAME='" + sCityName + "'&ZZ_COUNTRYCODE='" + sCntCode + "'",
				oLocDefered = $.Deferred();
			oDataModel.read(sPath, {
				urlParameters: sUrlParams,
				success: function(oLocData) {
					oLocObj = oLocData;
					oLocDefered.resolve();

				},
				error: function(err) {
					//console.clear(); //eslint-disable-line
					console.info("Error" + err); //eslint-disable-line
				}
			});
			$.when(oLocDefered).done(
				function() {
					return oLocObj;
				});
		},
		//set simcard
		_setSIMCardInfo: function(sMode, oData, oRequestDetail) {

			var sMd = oData.ZZ_STATUS;
			if (sMd) {

				if (sMd.substring(2, sMd.length) === "003") {
					oData.ZZ_SIM_REQ_KEY = oRequestDetail.ZZ_SIM_REQ_KEY;
					oData.ZZ_SIM_TYP_KEY = oRequestDetail.ZZ_SIM_TYP_KEY;
					oData.ZZ_SIM_DATA_KEY = oRequestDetail.ZZ_SIM_DATA_KEY;
				}
			}

		},
		//set default sponsor
		_setDefaultSponsor: function(oData) {
			var oEmpData = oData.empDetail;
			oData.sponsorshipState = "green_bold_text";
			oData.sponsorshipText = "F01->100% - Remain: 0%";
			oData.aSponsorshipDtl[0].ZZ_GEBER = "F01";
			oData.aSponsorshipDtl[0].ZZ_PERCENT = "100";
			oData.aSponsorshipDtl[0].ZZ_KOSTL = oEmpData.ZZ_EMPCOSTCENTER.trim();
			oData.aSponsorshipDtl[0].ZZ_FISTL = oEmpData.ZZ_DEP_DEPT.trim();
			oData.aSponsorshipDtl[0].ZZ_FIPEX = "106";
			oData.aSponsorshipDtl[0].ZZ_TB_VISIBLE = false;
		},
		//update header information when update
		_updateHeaderInfo: function(oData, oHeadData) {
			oHeadData.dateFrom = Formatter.ymToMDY(oHeadData.dateFrom);
			oHeadData.dateTo = Formatter.ymToMDY(oHeadData.dateTo);
			var sFrom = TCommonSrv.buildDateHeader(oHeadData.dateFrom),
				sTo = TCommonSrv.buildDateHeader(oHeadData.dateTo);
			oData.empDetail.travelLoc = oHeadData.travelFrom.replace(",", " - ") + " to " + oHeadData.travelTo.replace(",", " - ");
			oData.empDetail.travelDate = sFrom + " to " + sTo;
		},
		//get trip type 
		_getTripTypeByRecord: function(nRec) {
			var sType = oTrip.oneway;
			if (parseInt(nRec) === 1) {
				sType = oTrip.oneway;
			} else if (parseInt(nRec) >= 2 && parseInt(nRec) < 3) {
				sType = oTrip.roundtrip;
			} else {
				sType = oTrip.multicity;
			}
			return sType;
		},
		//create next row by first row
		_createPsgNextRow: function(nPass, oFirstRow, sDep, sTripTab) {
			var nPsg = nPass + 1;
			var oRow = TCommonSrv.buildPassengerRow(sDep);
			oRow.ZZ_PSG_NAME = "Traveler 0" + nPsg; //set psg name

			// oRow.ZZ_ZSLFDPD = this.getPsDepend(nPass); //set default dependent
			oRow.ZZ_VISIBLE = false; //visible field for intl or dom
			oRow.ZZ_ENABLED = true; //enable field for intl or dom
			oRow.ZZ_EXPANDED = false;
			var oFnRow = TravelRequestDtlThis.copPrevPassData(oFirstRow, oRow, sTripTab); //eslint-disable-line

			return oFnRow;
		},
		//for multiple dependent 
		_buildMulDepdendent: function(nRec, aPassList, oTravelObj, oOrgData, oData, sTripType) {
			var aBData = oOrgData.TRV_HDRtoTRV_travel_Data.results,
				oHeadData = {
					travelFrom: "",
					travelTo: "",
					dateFrom: "",
					dateTo: ""
				};

			if (sTripType === oTrip.oneway) {
				//one way
				console.info("One Way Mul Binding ");
				oTravelObj.bindType = sTripType;
				var oRow = TCommonSrv.buildPassengerRow(aBData[0].ZZ_ZSLFDPD, true);
				var oFromLoc = TCommonSrv.checkExistingArray(oData.aCountries, "CITY", aBData[0].ZZ_ZFRPLACE);
				var oToLoc = TCommonSrv.checkExistingArray(oData.aCountries, "CITY", aBData[0].ZZ_ZTOPLACE);

				oRow.ZZ_ZSEAT = oOrgData.ZZ_ZSEAT;
				oRow.ZZ_ZMEAL = oOrgData.ZZ_ZMEAL;
				oRow.ZZ_MOBILE = oOrgData.ZZ_MOBILE;
				oRow.ZZ_LOC_FROM_KEY = oFromLoc.CITY_COUNTRY_CODE;
				oRow.ZZ_LOC_TO_KEY = oToLoc.CITY_COUNTRY_CODE;
				oRow.ZZ_FMDATE_VALUE = Formatter.ymToDMY(aBData[0].ZZ_BEGDA);
				oRow.ZZ_TODATE_VALUE = Formatter.ymToDMY(aBData[0].ZZ_ENDDA);
				oRow.ZZ_FMCNTRY = oFromLoc.COUNTRYCODE;
				oRow.ZZ_TOCNTRY = oToLoc.COUNTRYCODE;
				oRow.ZZ_FMCITY = oFromLoc.CITY;
				oRow.ZZ_TOCITY = oToLoc.CITY;
				oRow.ZZ_FMDATE = aBData[0].ZZ_BEGDA;
				oRow.ZZ_TODATE = aBData[0].ZZ_ENDDA;
				oRow.ZZ_FMTIME = aBData[0].ZZ_BEGUR;
				oRow.ZZ_TOTIME = aBData[0].ZZ_ENDUZ;
				oRow.ZZ_ZMODE = aBData[0].ZZ_ZMODE;

				oTravelObj.aPassenger.push(oRow);
				for (var mo = 1; mo < aBData.length; mo++) {
					//call function create next row from first row
					var oNextRow = this._createPsgNextRow(oTravelObj.aPassenger.length, oTravelObj.aPassenger[0], aBData[mo].ZZ_ZSLFDPD, sTripType);
					oTravelObj.aPassenger.push(oNextRow);
				}

				//set header data
				oHeadData.travelFrom = oFromLoc.CITY_COUNTRY;
				oHeadData.travelTo = oToLoc.CITY_COUNTRY;
				oHeadData.dateFrom = aBData[0].ZZ_BEGDA;
				oHeadData.dateTo = aBData[0].ZZ_ENDDA;

			} else if (sTripType === oTrip.roundtrip) {
				//round trip
				console.info("Round trip Mul Binding");
				oTravelObj.bindType = oTrip.roundtrip;
				oTravelObj.aPassenger = aPassList;
				for (var r = 0; r < aPassList.length; r++) {
					var oPass = aPassList[r];
					for (var rd = 0; rd < aBData.length; rd++) {
						if (oPass.ZZ_ZSLFDPD === aBData[rd].ZZ_ZSLFDPD) {
							var oMDRRow = TCommonSrv.buildPassengerDtlEmptyRow(aBData[r].ZZ_ZSLFDPD);
							var oMDRFromLoc = TCommonSrv.checkExistingArray(oData.aCountries, "CITY", aBData[rd].ZZ_ZFRPLACE);
							var oMDRToLoc = TCommonSrv.checkExistingArray(oData.aCountries, "CITY", aBData[rd].ZZ_ZTOPLACE);

							oMDRRow.ZZ_ZSEAT = oOrgData.ZZ_ZSEAT;
							oMDRRow.ZZ_ZMEAL = oOrgData.ZZ_ZMEAL;
							oMDRRow.ZZ_MOBILE = oOrgData.ZZ_MOBILE;
							oMDRRow.ZZ_LOC_FROM_KEY = oMDRFromLoc.CITY_COUNTRY_CODE;
							oMDRRow.ZZ_LOC_TO_KEY = oMDRToLoc.CITY_COUNTRY_CODE;
							//temp TinhTD
							oMDRRow.ZZ_TRV_FROM_LOC = oMDRFromLoc.CITY_COUNTRY_CODE;
							oMDRRow.ZZ_TRV_FROM_TEXT = oMDRFromLoc.CITY_COUNTRY;
							oMDRRow.ZZ_TRV_TO_LOC = oMDRToLoc.CITY_COUNTRY_CODE;
							oMDRRow.ZZ_TRV_TO_TEXT = oMDRToLoc.CITY_COUNTRY;

							//end temp
							oMDRRow.ZZ_FMCNTRY = oMDRFromLoc.COUNTRYCODE;
							oMDRRow.ZZ_TOCNTRY = oMDRToLoc.COUNTRYCODE;
							oMDRRow.ZZ_FMCITY = oMDRFromLoc.CITY;
							oMDRRow.ZZ_TOCITY = oMDRToLoc.CITY;
							oMDRRow.ZZ_FMDATE_VALUE = Formatter.ymToDMY(aBData[rd].ZZ_BEGDA);
							oMDRRow.ZZ_TODATE_VALUE = Formatter.ymToDMY(aBData[rd].ZZ_ENDDA);
							oMDRRow.ZZ_FMDATE = aBData[rd].ZZ_BEGDA;
							oMDRRow.ZZ_TODATE = aBData[rd].ZZ_ENDDA;
							oMDRRow.ZZ_FMTIME = aBData[rd].ZZ_BEGUR;
							oMDRRow.ZZ_TOTIME = aBData[rd].ZZ_ENDUZ;
							oMDRRow.ZZ_ZMODE = aBData[rd].ZZ_ZMODE;
							//feedback 2019/01/17
							if (rd === 0 && ((aBData[rd].ZZ_BEGDA === aBData[rd].ZZ_ENDDA) || aBData[rd].ZZ_ENDDA === "00000000")) {
								oMDRRow.ZZ_TODATE_VALUE = "";
								oMDRRow.ZZ_TODATE = "";
								oMDRRow.ZZ_TOTIME = "";
							}
							if (rd === 1 && ((aBData[rd].ZZ_BEGDA === aBData[rd].ZZ_ENDDA) || aBData[rd].ZZ_ENDDA === "00000000")) {
								oMDRRow.ZZ_DATE_VALUE = Formatter.ymToDMY(aBData[rd].ZZ_BEGDA);
								oMDRRow.ZZ_TODATE_VALUE = "";
								oMDRRow.ZZ_TODATE = "";
								oMDRRow.ZZ_TOTIME = "";
							}

							if (r === 0 && rd > 0) {
								oMDRRow.ZZ_LOCK_ND = false;
							}
							if (r > 0) {
								oMDRRow.ZZ_F_ROW = false;
								oMDRRow.ZZ_LOCK_ND = false;
							}

							oPass.aPassengerDtl.push(oMDRRow);
						}
					}
				}

				oTravelObj.nPassengerDtLenght = oTravelObj.aPassenger[0].aPassengerDtl.length;
			} else {
				//mutlticty
				console.info("Multicity Mul Binding");
				oTravelObj.bindType = oTrip.multicity;

				oTravelObj.aPassenger = aPassList;
				for (var mp = 0; mp < aPassList.length; mp++) {
					var oPass = aPassList[mp];
					for (var md = 0; md < aBData.length; md++) {
						if (oPass.ZZ_ZSLFDPD === aBData[md].ZZ_ZSLFDPD) {
							var oMDRow = TCommonSrv.buildPassengerDtlEmptyRow(aBData[md].ZZ_ZSLFDPD);
							var oMDFromLoc = TCommonSrv.checkExistingArray(oData.aCountries, "CITY", aBData[md].ZZ_ZFRPLACE);
							var oMDToLoc = TCommonSrv.checkExistingArray(oData.aCountries, "CITY", aBData[md].ZZ_ZTOPLACE);
							oMDRow.ZZ_TRV_FROM_LOC = oMDFromLoc.CITY_COUNTRY_CODE;
							oMDRow.ZZ_TRV_FROM_TEXT = oMDFromLoc.CITY_COUNTRY;
							oMDRow.ZZ_TRV_TO_LOC = oMDToLoc.CITY_COUNTRY_CODE;
							oMDRow.ZZ_TRV_TO_TEXT = oMDToLoc.CITY_COUNTRY;
							oMDRow.ZZ_DATE_VALUE = Formatter.ymToDMY(aBData[md].ZZ_BEGDA);
							oMDRow.ZZ_TIME_VALUE = aBData[md].ZZ_BEGUR;
							oMDRow.ZZ_ZMODE = aBData[md].ZZ_ZMODE;
							oPass.aPassengerDtl.push(oMDRow);
						}
					}
				}

				oTravelObj.nPassengerDtLenght = oTravelObj.aPassenger[0].aPassengerDtl.length;
			}

			return oTravelObj;
		},
		//for single dependent
		_buildSingleDependent: function(nRec, oTravelObj, oOrgData, oData) {
			var aBData = oOrgData.TRV_HDRtoTRV_travel_Data.results,
				oHeadData = {
					travelFrom: "",
					travelTo: "",
					dateFrom: "",
					dateTo: ""
				};
			//travel base data
			var oRow = TCommonSrv.buildPassengerRow(aBData[0].ZZ_ZSLFDPD, true);
			if (oData.TRV_REQ_TYPE === "DOME") {
				oRow.ZZ_VISIBLE = false;
			}
			oRow.ZZ_ZSEAT = oOrgData.ZZ_ZSEAT;
			oRow.ZZ_ZMEAL = oOrgData.ZZ_ZMEAL;
			oRow.ZZ_MOBILE = oOrgData.ZZ_MOBILE;

			if (parseInt(nRec) === 1) {
				//one way
				console.info("One Way Single Binding");
				oTravelObj.bindType = oTrip.oneway;
				var oFromLoc = TCommonSrv.checkExistingArray(oData.aCountries, "CITY", aBData[0].ZZ_ZFRPLACE);
				var oToLoc = TCommonSrv.checkExistingArray(oData.aCountries, "CITY", aBData[0].ZZ_ZTOPLACE);
				oRow.ZZ_LOC_FROM_KEY = oFromLoc.CITY_COUNTRY_CODE;
				oRow.ZZ_LOC_TO_KEY = oToLoc.CITY_COUNTRY_CODE;
				oRow.ZZ_FMDATE_VALUE = Formatter.ymToDMY(aBData[0].ZZ_BEGDA);
				oRow.ZZ_TODATE_VALUE = Formatter.ymToDMY(aBData[0].ZZ_ENDDA);
				oRow.ZZ_FMCNTRY = oFromLoc.COUNTRYCODE;
				oRow.ZZ_TOCNTRY = oToLoc.COUNTRYCODE;
				oRow.ZZ_FMCITY = oFromLoc.CITY;
				oRow.ZZ_TOCITY = oToLoc.CITY;
				oRow.ZZ_FMDATE = aBData[0].ZZ_BEGDA;
				oRow.ZZ_TODATE = aBData[0].ZZ_ENDDA;
				oRow.ZZ_FMTIME = aBData[0].ZZ_BEGUR;
				oRow.ZZ_TOTIME = aBData[0].ZZ_ENDUZ;
				oRow.ZZ_ZMODE = aBData[0].ZZ_ZMODE;

				oTravelObj.aPassenger.push(oRow);
				//set header data
				oHeadData.travelFrom = oFromLoc.CITY_COUNTRY;
				oHeadData.travelTo = oToLoc.CITY_COUNTRY;
				oHeadData.dateFrom = aBData[0].ZZ_BEGDA;
				oHeadData.dateTo = aBData[0].ZZ_ENDDA;

			} else if (parseInt(nRec) === 2) {
				//round trip
				console.info("Round trip Single Binding");
				oTravelObj.bindType = oTrip.roundtrip;
				oRow.aPassengerDtl = [];
				for (var rd = 0; rd < aBData.length; rd++) {
					if (oRow.ZZ_ZSLFDPD === aBData[rd].ZZ_ZSLFDPD) {
						var oMDRRow = TCommonSrv.buildPassengerDtlEmptyRow(oRow.ZZ_ZSLFDPD);
						var oMDRFromLoc = TCommonSrv.checkExistingArray(oData.aCountries, "CITY", aBData[rd].ZZ_ZFRPLACE);
						var oMDRToLoc = TCommonSrv.checkExistingArray(oData.aCountries, "CITY", aBData[rd].ZZ_ZTOPLACE);

						oMDRRow.ZZ_ZSEAT = oOrgData.ZZ_ZSEAT;
						oMDRRow.ZZ_ZMEAL = oOrgData.ZZ_ZMEAL;
						oMDRRow.ZZ_MOBILE = oOrgData.ZZ_MOBILE;
						oMDRRow.ZZ_LOC_FROM_KEY = oMDRFromLoc.CITY_COUNTRY_CODE;
						oMDRRow.ZZ_LOC_TO_KEY = oMDRToLoc.CITY_COUNTRY_CODE;
						//temp TinhTD
						oMDRRow.ZZ_TRV_FROM_LOC = oMDRFromLoc.CITY_COUNTRY_CODE;
						oMDRRow.ZZ_TRV_FROM_TEXT = oMDRFromLoc.CITY_COUNTRY;
						oMDRRow.ZZ_TRV_TO_LOC = oMDRToLoc.CITY_COUNTRY_CODE;
						oMDRRow.ZZ_TRV_TO_TEXT = oMDRToLoc.CITY_COUNTRY;
						//end temp
						oMDRRow.ZZ_FMCNTRY = oMDRFromLoc.COUNTRYCODE;
						oMDRRow.ZZ_TOCNTRY = oMDRToLoc.COUNTRYCODE;
						oMDRRow.ZZ_FMCITY = oMDRFromLoc.CITY;
						oMDRRow.ZZ_TOCITY = oMDRToLoc.CITY;
						oMDRRow.ZZ_FMDATE_VALUE = Formatter.ymToDMY(aBData[rd].ZZ_BEGDA);
						oMDRRow.ZZ_TODATE_VALUE = Formatter.ymToDMY(aBData[rd].ZZ_ENDDA);
						oMDRRow.ZZ_FMDATE = aBData[rd].ZZ_BEGDA;
						oMDRRow.ZZ_TODATE = aBData[rd].ZZ_ENDDA;
						oMDRRow.ZZ_FMTIME = aBData[rd].ZZ_BEGUR;
						oMDRRow.ZZ_TOTIME = aBData[rd].ZZ_ENDUZ;
						oMDRRow.ZZ_ZMODE = aBData[rd].ZZ_ZMODE;
						oMDRRow.ZZ_DATE_VALUE = Formatter.ymToDMY(aBData[rd].ZZ_BEGDA);
						//feedback 2019/01/17
						if (rd === 0 && ((aBData[rd].ZZ_BEGDA === aBData[rd].ZZ_ENDDA) || aBData[rd].ZZ_ENDDA === "00000000")) {
							oMDRRow.ZZ_TODATE_VALUE = "";
							oMDRRow.ZZ_TODATE = "";
							oMDRRow.ZZ_TOTIME = "";
						}
						if (rd === 1 && ((aBData[rd].ZZ_BEGDA === aBData[rd].ZZ_ENDDA) || aBData[rd].ZZ_ENDDA === "00000000")) {
							oMDRRow.ZZ_DATE_VALUE = Formatter.ymToDMY(aBData[rd].ZZ_BEGDA);
							oMDRRow.ZZ_TODATE_VALUE = "";
							oMDRRow.ZZ_TODATE = "";
							oMDRRow.ZZ_TOTIME = "";
						}

						oRow.aPassengerDtl.push(oMDRRow);
					}
				}

				oTravelObj.aPassenger.push(oRow);
				oTravelObj.nPassengerDtLenght = 2;

			} else {
				//mutlticty
				console.info("Multicity Single Binding");
				oTravelObj.bindType = oTrip.multicity;
				oRow.aPassengerDtl = [];
				for (var mc = 0; mc < aBData.length; mc++) {
					var oDRow = TCommonSrv.buildPassengerDtlEmptyRow(aBData[mc].ZZ_ZSLFDPD);
					var oMFromLoc = TCommonSrv.checkExistingArray(oData.aCountries, "CITY", aBData[mc].ZZ_ZFRPLACE);
					var oMToLoc = TCommonSrv.checkExistingArray(oData.aCountries, "CITY", aBData[mc].ZZ_ZTOPLACE);
					oDRow.ZZ_TRV_FROM_LOC = oMFromLoc.CITY_COUNTRY_CODE;
					oDRow.ZZ_TRV_FROM_TEXT = oMFromLoc.CITY_COUNTRY;
					oDRow.ZZ_TRV_TO_LOC = oMToLoc.CITY_COUNTRY_CODE;
					oDRow.ZZ_TRV_TO_TEXT = oMToLoc.CITY_COUNTRY;
					oDRow.ZZ_DATE_VALUE = Formatter.ymToDMY(aBData[mc].ZZ_BEGDA);
					oDRow.ZZ_TIME_VALUE = aBData[mc].ZZ_BEGUR;
					oDRow.ZZ_ZMODE = aBData[mc].ZZ_ZMODE;
					oRow.aPassengerDtl.push(oDRow);
				}
				oTravelObj.aPassenger.push(oRow);
				oTravelObj.nPassengerDtLenght = aBData.length;

				//set header data
				// oHeadData.travelFrom = oFromLoc.CITY_COUNTRY;
				// oHeadData.travelTo = oToLoc.CITY_COUNTRY;
				// oHeadData.dateFrom = aBData[0].ZZ_BEGDA;
				// oHeadData.dateTo = aBData[0].ZZ_ENDDA;
			}
			//call update header
			if (oTravelObj.bindType === oTrip.oneway) {
				this._updateHeaderInfo(oData, oHeadData);
				TravelRequestDtlThis.setHeaderData(oRow); //eslint-disable-line
				TravelRequestDtlThis.showHideByLocation(oFromLoc.COUNTRYCODE, oToLoc.COUNTRYCODE); //eslint-disable-line
			}

			return oTravelObj;
		},
		_restructureTravellingData: function(oOrgData, oData) {
			var aBData = oOrgData.TRV_HDRtoTRV_travel_Data.results;
			var nRec = aBData.length,
				oTravelObj = {
					bindType: "",
					aPassenger: []
				};
			var sTrvType = oOrgData.ZZ_SMODID,
				sMainDep = aBData[0].ZZ_ZSLFDPD; //get first dependen for check single or multiple dependent in case DOMESTIC

			if (sTrvType === "DOME") {
				var bSingle = true;
				//for domestic
				if (parseInt(nRec) >= 2) {
					//check single or multi
					var nRecT = 1;
					var oMDRow = TCommonSrv.buildPassengerRow(aBData[0].ZZ_ZSLFDPD, false);
					oMDRow.ZZ_VISIBLE = false;
					var aPassList = [oMDRow];
					for (var s = 1; s < aBData.length; s++) {
						if (sMainDep !== aBData[s].ZZ_ZSLFDPD) {
							bSingle = false;
							//get all parent
							var oExist = TCommonSrv.checkExistingArray(aPassList, "ZZ_ZSLFDPD", aBData[s].ZZ_ZSLFDPD);
							if (!oExist) {
								oMDRow = TCommonSrv.buildPassengerRow(aBData[s].ZZ_ZSLFDPD, false);
								var nPsg = parseInt(aPassList.length) + 1;
								oMDRow.ZZ_PSG_NAME = "Traveller 0" + nPsg;
								oMDRow.ZZ_VISIBLE = false;
								oMDRow.ZZ_EXPANDED = false;
								aPassList.push(oMDRow);
							}
						} else {
							nRecT++;
						}
					}
					if (bSingle === true) {
						//single dependen
						oTravelObj = this._buildSingleDependent(nRec, oTravelObj, oOrgData, oData);
					} else {
						//multi dependent
						var sTripType = this._getTripTypeByRecord(nRecT);
						oTravelObj = this._buildMulDepdendent(nRec, aPassList, oTravelObj, oOrgData, oData, sTripType);
					}

				} else {
					//single dep
					oTravelObj = this._buildSingleDependent(nRec, oTravelObj, oOrgData, oData);
				}

			} else {
				//for international

				this._buildSingleDependent(nRec, oTravelObj, oOrgData, oData);

			}
			return oTravelObj;

		},
		_prepareScreenData: function(oDataModel, empDetail, sReqId, oRequestDetail, sReqType) {
			var oThis = this,
				oVModel = this.getView().getModel("trvRequestDtl"),
				oData = oVModel.getData(),
				sPath = "",
				sUrlParams = "",
				oDependentDeferred = $.Deferred(),
				oFlightSeatDeferred = $.Deferred(),
				oMealDeferred = $.Deferred(),

				oTrvModeDeferred = $.Deferred(),
				oTrvCatDeferred = $.Deferred(),
				oCurrDeferred = $.Deferred(),
				oAddPrefDeferred = $.Deferred(),
				oFlowStateDeferred = $.Deferred(),
				oFrequentDeferred = $.Deferred();
			//set travel mode
			if (oRequestDetail.ZZ_SMODID && oRequestDetail.ZZ_SMODID !== undefined) {
				oData.TRV_REQ_TYPE = oRequestDetail.ZZ_SMODID;
			} else {
				oData.TRV_REQ_TYPE = "INTL";
			}
			//process state
			oData.currentStage = "1";
			oData.currentSet = "1_1";
			oData.currentSubSet = "1_1_1";
			oData.currentSubSubSet = "1_1_1_1";
			sPath = "/ZE2E_WF_SATGESet";
			var oStateFilter = [];
			oStateFilter.push(new Filter("ZZ_MODID", FilterOperator.EQ, "BUSR"));
			oStateFilter.push(new Filter("ZZ_SMODID", FilterOperator.EQ, oData.TRV_REQ_TYPE));
			if (sReqType === "edit") {

				oStateFilter.push(new Filter("ZZ_CATID", FilterOperator.EQ, ""));
				oStateFilter.push(new Filter("ZZ_DEP_REQ", FilterOperator.EQ, sReqId));
				// sUrlParams = "$filter=ZZ_MODID eq 'BUSR' and " +
				// 	"ZZ_SMODID eq '" + oData.TRV_REQ_TYPE + "' and ZZ_CATID eq '' and " +
				// 	"ZZ_DEP_REQ eq '" + sReqId + "'";
			} else {
				oStateFilter.push(new Filter("ZZ_CATID", FilterOperator.EQ, "*"));
				// sUrlParams = "$filter=ZZ_MODID eq 'BUSR' and " +
				// 	"ZZ_SMODID eq '" + oData.TRV_REQ_TYPE + "' and ZZ_CATID eq '*'";
			}
			oDataModel.read(sPath, {
				filters: oStateFilter,
				urlParameters: sUrlParams,
				success: function(oSData) {
					if (sReqType === "edit") {
						oData.currentStages = oSData.results;
					} else {
						oData.generalStages = oSData.results;
					}

					oFlowStateDeferred.resolve();

				},
				error: function(err) {
					//console.clear(); //eslint-disable-line
					console.info("Error" + err.responseText); //eslint-disable-line
				}
			});
			//set limit size
			// oVModel.setSizeLimit(1000);
			//header information
			oData.ZZ_VERSION = "";
			oData.ZZ_TAXI_LINK_ENABLED = false;
			oData.EDIT_MODE = false;
			oData.ZZ_TRV_REQ_NUM = sReqId;
			oData.ZZ_TRIP_TAB = oTrip.oneway;

			//Employee
			oData.empDetail = empDetail;
			//end header information

			//Travelling Detail
			oData.ZZ_REMOVE_PSG = false; //disable remove passenger first time
			var oTravelingDtl = {};
			//purpose cattegory id
			oData.ZZ_ZPURPOSE = oRequestDetail.ZZ_ZPURPOSE;
			oData.ZZ_CATID = "GLOB";
			oData.ZZ_CATID_IDX = 0;

			//passenger list
			oTravelingDtl.aPassenger = [];
			var oRow = {};
			if (sReqType === "edit") {
				oData.ZZ_COMMENTS = oRequestDetail.ZZ_COMMENTS;
				oData.ZZ_VERSION = oRequestDetail.ZZ_VERSION;
				oData.EDIT_MODE = true;
				//binding data from backend
				//convert data structure from entity to data on the UI
				var oTravelObj = this._restructureTravellingData(oRequestDetail, oData);
				oTravelingDtl.aPassenger = oTravelObj.aPassenger;
				oData.ZZ_TRIP_TAB = oTravelObj.bindType;
				if (oTravelObj.bindType === oTrip.multicity) {
					oTravelingDtl.nPassengerDtLenght = oTravelObj.nPassengerDtLenght;
				}
			} else {
				oData.ZZ_COMMENTS = "";
				oRow = TCommonSrv.buildPassengerRow("00");
				var oDefaultLoc = TCommonSrv.checkExistingArray(oData.aCountries, "CITY", empDetail.ZZ_BASE_LOC);
				oData.ZZ_DEFAULT_FROM_LOC = oDefaultLoc.CITY_COUNTRY_CODE;
				oRow.ZZ_LOC_FROM_KEY = oDefaultLoc.CITY_COUNTRY_CODE;
				oRow.ZZ_FMCNTRY = oDefaultLoc.COUNTRYCODE;
				oRow.ZZ_FMCITY = oDefaultLoc.CITY;
				oData.empDetail.travelFrom = oDefaultLoc.CITY_COUNTRY.replace(",", "-");
				oTravelingDtl.aPassenger.push(oRow);
			}

			//dependent
			sPath = "/GetDomain";
			sUrlParams = "DomainName='ZSLFDPD'";
			oDataModel.read(sPath, {
				urlParameters: sUrlParams,
				success: function(oCData) {
					oTravelingDtl.aDependent = oCData.results;
					oDependentDeferred.resolve();

				},
				error: function(err) {
					//console.clear(); //eslint-disable-line
					console.info("Error" + err); //eslint-disable-line
				}
			});
			//Fligh seat list
			sPath = "/GetDomain";
			sUrlParams = "DomainName='FTPD_FLIGHT_PREF_SEAT'";
			oDataModel.read(sPath, {
				urlParameters: sUrlParams,
				success: function(oCData) {
					oTravelingDtl.aFlighSeat = oCData.results;
					oFlightSeatDeferred.resolve();

				},
				error: function(err) {
					//console.clear(); //eslint-disable-line
					console.info("Error" + err); //eslint-disable-line
				}
			});

			//Set meal list
			sPath = "/GetDomain";
			sUrlParams = "DomainName='FTPD_MEALCODE'";
			oDataModel.read(sPath, {
				urlParameters: sUrlParams,
				success: function(oCData) {
					oTravelingDtl.aMeal = oCData.results;
					oMealDeferred.resolve();

				},
				error: function(err) {
					//console.clear(); //eslint-disable-line
					console.info("Error" + err); //eslint-disable-line
				}
			});

			/*	// Get Country list
			sPath = "/DEP_LOCATION_COMBOSET";
			oDataModel.read(sPath, {
				success: function(oCData) {
					oData.aCountries = oCData.results;
					oCountry.resolve();

				},
				error: function(err) {
					//console.clear(); //eslint-disable-line
					console.info("Error" + err); //eslint-disable-line
				}
			}); tempdisable TINHTD*/

			//travel mode
			sPath = "/GetDomain";
			sUrlParams = "DomainName='ZINF_MODE'";
			oDataModel.read(sPath, {
				urlParameters: sUrlParams,
				success: function(oCData) {
					oTravelingDtl.aTrvMode = oCData.results;
					oTrvModeDeferred.resolve();

				},
				error: function(err) {
					//console.clear(); //eslint-disable-line
					console.info("Error" + err); //eslint-disable-line
				}
			});

			//travel mode
			sPath = "/DEP_STYPSet";
			sUrlParams = "";
			oDataModel.read(sPath, {
				urlParameters: sUrlParams,
				success: function(oCData) {
					oCData.results.splice(0, 1); //remove first blank value
					oTravelingDtl.aTravelCat = oCData.results;
					oTrvCatDeferred.resolve();

				},
				error: function(err) {
					//console.clear(); //eslint-disable-line
					console.info("Error" + err); //eslint-disable-line
				}
			});

			//End Travelling Detail
			oData.ZZ_ADVM_REQ_ENB = false;
			if (sReqType === "edit") {
				//accomodation
				if (oData.TRV_REQ_TYPE === "DOME") {
					oData.aAccomodation = [];
					oData.ZZ_ACCM_REQ_ENB = true;
					var aAccmResult = oRequestDetail.TRV_HDRtoTRV_ACCOM.results;
					oData.nAccomodationLenght = aAccmResult.length;
					for (var c = 0; c < aAccmResult.length; c++) {
						var oAccmRow = aAccmResult[c];
						oAccmRow.enabled = true;
						oAccmRow.ZZ_ZPLACE = aAccmResult[c].ZZ_ZPLACE;
						oAccmRow.ZZ_BEGDA_VALUE = aAccmResult[c].ZZ_BEGDA;
						oAccmRow.ZZ_ENDDA_VALUE = aAccmResult[c].ZZ_ENDDA;
						oData.aAccomodation.push(oAccmRow);
					}
				}
				//Adv Money

				oData.ZZ_ADVM_REQ_ENB = true;
				oData.ZZ_ADV_INTL = true;
				oData.aAdvMoney = [];
				var oAdvResult = oRequestDetail.TRV_HDRtoTRV_ADVANCE.results[0];
				var aAdv = TCommonSrv.convertAdvanceObjToArr(oAdvResult);
				oData.aAdvMoneyLenght = aAdv.length;
				for (var a = 0; a < aAdv.length; a++) {
					var oAdvRow = aAdv[a];
					oAdvRow.enabled = true;
					if (oData.TRV_REQ_TYPE === "DOME") {
						oAdvRow.enabled = false;
						oData.ZZ_ADV_INTL = false;
					}
					oData.aAdvMoney.push(oAdvRow);
				}

			}

			//Set meal list
			sPath = "/GetF4Help";
			sUrlParams = "Srch_help='F4_TCURC_ISOCD'";
			oDataModel.read(sPath, {
				urlParameters: sUrlParams,
				success: function(oCData) {
					oData.aCurrencies = oCData.results;
					oCurrDeferred.resolve();

				},
				error: function(err) {
					//console.clear(); //eslint-disable-line
					console.info("Error" + err); //eslint-disable-line
				}
			});

			//End Adv Money
			//Sponsor detail 

			oData.aFunds = TCommonSrv.buildAFundDefault();
			oData.aFundSelect = ["F01"];
			oData.ZZ_SP_VALID = true;
			oData.ZZ_SP_CURR_KEY = "F01";
			oData.ZZ_SP_FUND_KEY = "F01"; //set default key of fund center
			oData.aSponsorshipDtl = [];
			if (sReqType === "edit") {
				//load fun data
				var aCost = oRequestDetail.TRV_HDRtoTRV_COST_ASGN.results;
				oData.ZZ_SP_FUND_KEY = aCost[0].ZZ_GEBER; //set default key of fund center
				for (var s = 0; s < aCost.length; s++) {
					var oCostRow = aCost[s];
					oCostRow.ZZ_HEAD_TITLE = aCost[s].ZZ_GEBER;
					oCostRow.ZZ_EXPANDED = true;
					oCostRow.ZZ_VISIBLE = false;
					oCostRow.ZZ_TB_VISIBLE = true;
					oData.aSponsorshipDtl.push(oCostRow);
				}
			} else {

				var oSpRow = TCommonSrv.buildSponsorDtlEmpRow("F01");
				oData.aSponsorshipDtl.push(oSpRow);
			}

			//end sponsor detal
			// Get Additional Preference list
			sPath = "/Profile_preferencesSet('" + empDetail.ZZ_DEP_PERNR + "')";
			oDataModel.read(sPath, {
				success: function(oAddData) {
					if (oAddData) {
						if (oData.EDIT_MODE === false) {
							//check and set default data for create new request
							// oTravelingDtl.aPassenger[0].ZZ_ZSEAT = oAddData.zz_seat;
							// oTravelingDtl.aPassenger[0].ZZ_ZMEAL = oAddData.zz_meal;
							// oTravelingDtl.aPassenger[0].ZZ_MOBILE = oAddData.zz_mobile;
							oTravelingDtl.profileDefault = oAddData;
							TCommonSrv.setProfileData(oTravelingDtl.aPassenger[0], oAddData);
						}
					}
					oAddPrefDeferred.resolve();
				},
				error: function(oError) {
					jQuery.sap.log.error(oError);
				}
			});
			// Get Frequent Location
			sPath = "/GetFrequentLocations";
			sUrlParams = "ZZ_DEP_PERNR='" + empDetail.ZZ_DEP_PERNR + "'";
			oDataModel.read(sPath, {
				urlParameters: sUrlParams,
				success: function(oFreData) {
					oData.aFreqData = oFreData;
					oFrequentDeferred.resolve();
				},
				error: function(oError) {
					jQuery.sap.log.error(oError);
				}
			});
			//keep status
			oData.ZZ_STATUS = oRequestDetail.ZZ_STATUS;

			//check request done
			$.when(oDependentDeferred, oFlightSeatDeferred, oMealDeferred, oCurrDeferred, oTrvModeDeferred, oTrvCatDeferred, oAddPrefDeferred,
				oFlowStateDeferred, oFrequentDeferred).done(
				function() {

					oData.travelingDtl = oTravelingDtl;
					//set sim data
					oData.ZZ_SIM_REQ_KEY = "N";
					oThis._setSIMCardInfo(oData.ZZ_STATUS, oData, oRequestDetail);

					//set default sponsor shipdata
					oThis._setDefaultSponsor(oData);

					//handle screen editable
					oThis._handleScreenMode(oData.ZZ_STATUS, oData);
					if (TrvSimCardThis !== undefined) { //eslint-disable-line

						TrvSimCardThis._initScreenData(); //eslint-disable-line
					}
					//process state
					oThis._handleProcessFlowState(oData);

					oVModel.setData(oData);
					oVModel.refresh();
					if (oData.EDIT_MODE === true && oData.ZZ_TRIP_TAB !== oTrip.oneway) {
						TravelRequestDtlThis._updateHeaderTitle(); //eslint-disable-line
					}
					// StaticUtility.setBusy(false, oThis); //eslint-disable-line
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oHomeThis); //eslint-disable-line
					//call back update
					// var oEventBus = sap.ui.getCore().getEventBus();
					// oEventBus.publish("TravellingDtl", "UpdateHeader", {});
					console.info("Finish request");
					oThis._handleTabEvent("003");

				});

		},
		_initScreenData: function(sReqId) {
			var oThis = this,
				oDataModel = this.getView().getModel(),
				sPath = "",
				sUrlParams = "",
				oMainDeferred = $.Deferred(),
				oCountry = $.Deferred();

			//Employee
			var empDetail = sap.ui.getCore().getModel("profile").getData().employeeDetail;
			empDetail.travelLoc = "";
			empDetail.travelDate = "";
			//end header information

			//Global model
			sPath = "/TRV_HDRSet(ZZ_PERNR='" + empDetail.ZZ_DEP_PERNR + "',ZZ_DEP_REQ='" + sReqId + "',ZZ_VERSION='',ZZ_TRV_TYP='BUSR')";
			sUrlParams = "$expand=TRV_HDRtoTRV_travel_Data,TRV_HDRtoTRV_COST_ASGN,TRV_HDRtoTRV_ADVANCE,TRV_HDRtoTRV_ACCOM,DEP_VISA_PLAN";
			oDataModel.read(sPath, {
				urlParameters: sUrlParams,
				success: function(oCData) {

					var oMainModel = new sap.ui.model.json.JSONModel();
					oMainModel.setData(oCData);
					oThis.getView().setModel(oMainModel, "viewModel");

					oMainDeferred.resolve();

				},
				error: function(err) {
					//console.clear(); //eslint-disable-line
					console.info("Error" + err); //eslint-disable-line
				}
			});
			// Get Country list
			// sPath = "/DEP_LOCATION_COMBOSET";
			sPath = "/LocationByEmployee";
			sUrlParams = "ZZ_DEP_PERNR='" + empDetail.ZZ_DEP_PERNR + "'";
			oDataModel.read(sPath, {
				urlParameters: sUrlParams,
				success: function(oCData) {
					var oVModel = oThis.getView().getModel("trvRequestDtl"),
						oData = oVModel.getData();
					oData.aCountries = oCData.results;
					oCountry.resolve();
					oVModel.setData(oData);

				},
				error: function(err) {
					//console.clear(); //eslint-disable-line
					console.info("Error" + err); //eslint-disable-line
				}
			});
			$.when(oMainDeferred, oCountry).done(
				function() {
					//console.clear();
					var oRData = oThis.getView().getModel("viewModel").getData();
					if (sReqId !== "") {
						var nTravel = oRData.TRV_HDRtoTRV_travel_Data.results.length;
						if (oRData.ZZ_REINR === "" || nTravel === 0) {
							var bReq = localStorage.getItem("nRequest");
							if (bReq !== "requested") {
								//request
								localStorage.setItem("nRequest", "requested");
								sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis); //eslint-disable-line
								//invalid request id nav to home page
								TCommonSrv._showMsgBox("Error", "Invalid Request Id");
								sap.ui.core.routing.Router.getRouter("MyRouter").navTo("home");
							}
						} else {
							//edit page
							console.info("Update Travel Request : " + sReqId); //eslint-disable-line

							oThis._prepareScreenData(oDataModel, empDetail, sReqId, oRData, "edit");
						}
					} else {
						//create page
						console.info("Create new Travel Request"); //eslint-disable-line
						oThis._prepareScreenData(oDataModel, empDetail, "0000000000", {}, "create");
					}

				});

		},
		// Populate dynamic stages based on the current status of a request
		populateDynamicStages: function(oData) {
			// variables used for displaying custom controls
			var zindex = 30;
			oData.curStagePos = 0;
			var curStage = "";
			var curSetCount = 0;
			var curSet = "";
			var curSubset = "";
			var tabKey = 1;
			var customStage = null;
			var stageItem = null;
			var view = this.getView();
			var oVModel = this.getView().getModel("trvRequestDtl");
			var viewData = oVModel.getData();
			//remove old content

			/* temp disable
			var aExitFlow = $('.carousel_process');
			for (var i = 0; i < aExitFlow.length; i++) {
				$('#' + aExitFlow[i].id).empty();

			}*/
			view.byId('carouselProcessFlow').destroyContent();
			var globalData = {};
			if (sap.ui.getCore().getModel("global") != null) {
				globalData = sap.ui.getCore().getModel("global").getData();
			}

			// Selecting which Data from backend to be used
			var aData = [];
			if (oData.ZZ_TRV_REQ_NUM !== '' && oData.ZZ_TRV_REQ_NUM !== null && oData.ZZ_TRV_REQ_NUM !== "0000000000") {
				aData = oData.currentStages; // This is for displaying current request
			} else {
				aData = oData.generalStages; // This is for creating a new deputation request
			}

			// Stage which is not started will have the status of "0"
			// Stage which is in process will have the status of "1"
			// Stage which is completed will have the status of "2"
			// Firstly, Loop through data and set current process to global model
			var curSubSet = "";
			var foundCurrentStage = false;
			for (var i = 0; i < aData.length; i++) {
				if (aData[i].ZZ_SET_STS === "1") {
					globalData.currentStage = aData[i].ZZ_STAGE;
					globalData.currentSet = aData[i].ZZ_SET;
					globalData.currentSubSet = aData[i].ZZ_SUBSET;
					foundCurrentStage = true;
					if (aData[i].ZZ_SUBSUBSET !== "" && aData[i].ZZ_SUBSUBSET !== "0") {
						if (aData[i].ZZ_SUBSUBSET_STS === "B") {
							globalData.currentSubSubSet = aData[i].ZZ_SUBSUBSET;
							sap.ui.getCore().getModel("global").setData(globalData);
							oVModel.setData(viewData);
							break;
						}
					} else {
						globalData.currentSubSubSet = "";
						sap.ui.getCore().getModel("global").setData(globalData);
						oVModel.setData(viewData);
						break;
					}
				}
			}
			// If no current stage (status 1) found, then display the last stage
			if (foundCurrentStage === false) {
				try {
					globalData.currentStage = aData[aData.length - 1].ZZ_STAGE;
					globalData.currentSet = aData[aData.length - 1].ZZ_SET;
					globalData.currentSubSet = aData[aData.length - 1].ZZ_SUBSET;
				} catch (exc) {
					//
				}
			}

			// This will store the current stage in the backend
			oData.currentStage = globalData.currentStage;
			oData.currentSet = globalData.currentSet;
			oData.currentSubSet = globalData.currentSubSet;
			oData.currentSubSubSet = globalData.currentSubSubSet;

			// Secondly, populating all the available stages
			for (var i = 0; i < aData.length; i++) {
				// Display Stages on top
				if (aData[i].ZZ_STAGE !== curStage) {
					customStage = new sap.ui.project.e2etm.controls.customFlowStage({
						stage: 'Stage' + aData[i].ZZ_STAGE,
						zindex: zindex,
						status: "PROCESS"
					});
					customStage.addStyleClass('margin_left_minus8');
					curStage = aData[i].ZZ_STAGE;
				}
				// Display Set Items which are placed below the stage
				if (aData[i].ZZ_SET !== curSet) {
					stageItem = new sap.ui.project.e2etm.controls.stageItem("busr_" + aData[i].ZZ_STAGE + "_" + aData[i].ZZ_SET, {
						stage: aData[i].ZZ_STAGE,
						item: aData[i].ZZ_SET,
						itemName: aData[i].ZZ_SETD,
						status: aData[i].ZZ_SET_STS,
						zindex: zindex,
						press: function(evt) {
							if (evt.getSource().getStatus() === "2") {
								// Display tabs that are done consider edit mode
								evt.getSource().getParent().removeSetAllIsSelectedProperty();
								evt.getSource().setIsSelected("X");
								// oDeputationThis.displaySelectedStageItem(this.mProperties.stage, this.mProperties.item, true);
							} else if (evt.getSource().getStatus() === "1") {
								// Display tabs that are processed consider edit mode
								evt.getSource().getParent().removeSetAllIsSelectedProperty();
								evt.getSource().setIsSelected("X");
								// oDeputationThis.displaySelectedStageItem(this.mProperties.stage, this.mProperties.item, true);
							} else {
								// sap.ca.ui.message.showMessageBox({
								// 	type: sap.ca.ui.message.Type.ERROR,
								// 	message: 
								// 	details: 
								// });
								TCommonSrv._showMsgBox("You cannot directly view this step", "Please complete the current step!.", "");
							}
						}
					});
					zindex = zindex - 1;
					curSet = aData[i].ZZ_SET;
					curSetCount++;
					if (aData[i].ZZ_SET_STS === "1") {
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
					text: "END OF STAGE"
				}).addStyleClass("theendstatus"));
			}

		},
		_handleProcessFlowState: function(oData) {
			console.info("On handle process flow");
			var oFlowState = {};

			// oData.FlowState = oFlowState;
			var sRoute = sap.ui.core.routing.Router.getRouter("MyRouter")._oRouter._prevMatchedRequest.split("/")[1];
			if (sRoute === "TravelRequest") {
				this.getView().byId('carouselProcessFlow').destroyContent();
				this.populateDynamicStages(oData); //temp disable
			}

		},
		/*Handle screen  mode */
		_handleFieldState: function(bState, oData, sMode) {
			//set edit mode
			oData.ZZ_TRV_STATUS = bState;
			//set ediable travelling
			if (sMode === "d") {

				var oTravel = oData.travelingDtl;
				var aPass = oTravel.aPassenger;
				for (var i = 0; i < aPass.length; i++) {
					aPass[i].ZZ_TRV_STATUS = bState;
					aPass[i].ZZ_F_ROW = bState;
					var aPassDtl = aPass[i].aPassengerDtl;
					if (aPassDtl.length > 0) {
						for (var j = 0; j < aPassDtl.length; j++) {
							aPassDtl[j].ZZ_TRV_STATUS = bState;
							aPassDtl[j].ZZ_F_ROW = bState;
						}
					}

				}
				if (oData.ZZ_TRIP_TAB !== oTrip.oneway) {
					//

				}

			}
			//advance money
			if (oData.aAdvMoneyLenght !== "0" || oData.aAdvMoneyLenght > 0) {
				for (var a = 0; a < oData.aAdvMoneyLenght; a++) {
					oData.aAdvMoney[a].enabled = bState;
				}
			} else {
				oData.aAdvMoney[0].enabled = bState;
			}
		},
		_handleTabEvent: function(sMode) {

			var aTab = $('.sapUiTab');
			for (var i = 0; i < aTab.length; i++) {
				var sTabId = aTab[i].id;
				if (sMode === "003") {

					$("#" + sTabId).addClass('disable_tab_event');
				} else {
					$("#" + sTabId).removeClass('disable_tab_event');
				}
			}
			// switch (sTripTab) {
			// 	case oTrip.oneway:
			// 		aTab[0]
			// 		break;
			// 	case oTrip.roundtrip:
			// 		oData.travelingDtl.aPassenger[0].aPassengerDtl[0].ZZ_ZMODE = sMode;
			// 		oData.travelingDtl.aPassenger[0].aPassengerDtl[1].ZZ_ZMODE = sMode;
			// 		break;
			// 	case oTrip.multicity:
			// 		var aPassDtl = oData.travelingDtl.aPassenger[0].aPassengerDtl;
			// 		for (var m = 0; m < aPassDtl.length; m++) {
			// 			aPassDtl[m].ZZ_ZMODE = sMode;
			// 		}
			// 		break;
			// }

		},
		_handleScreenMode: function(sMode, oData) {
			if (sMode !== "" && sMode !== undefined) {
				sMode = sMode.substring(2, sMode.length);
				if (sMode === "003") {
					//submited
					console.info("Request State:" + sMode);
					this._handleFieldState(false, oData, "d");
					//handle tab
					// this._handleTabEvent(sMode);
				} else {
					//saved
					console.info("Request State:" + sMode);
					this._handleFieldState(true, oData, "e");
				}
			} else {
				this._handleFieldState(true, oData, "e");
			}

		},
		/*end handle screen mode */
		/* End init screen data*/

		/*Handle save travel request */
		/* Traveling detail */
		createRndTravelerObj: function(oPass, oPassDtl) {
			var oTraveler = TCommonSrv.buidTravellerEmpty(oPass.ZZ_ZSLFDPD);
			oTraveler.ZZ_BEGDA = oPassDtl.ZZ_FMDATE;
			oTraveler.ZZ_BEGUR = oPassDtl.ZZ_FMTIME;
			oTraveler.ZZ_ENDDA = oPassDtl.ZZ_TODATE;
			oTraveler.ZZ_ENDUZ = oPassDtl.ZZ_TOTIME;
			oTraveler.ZZ_ZFRPLACE = oPassDtl.ZZ_FMCITY;
			oTraveler.ZZ_ZMODE = oPassDtl.ZZ_ZMODE;
			oTraveler.ZZ_ZTOPLACE = oPassDtl.ZZ_TOCITY;
			return oTraveler;
		},
		createTravelerObj: function(oTravelerRow) {
			var oTraveler = TCommonSrv.buidTravellerEmpty(oTravelerRow.ZZ_ZSLFDPD);
			oTraveler.ZZ_BEGDA = oTravelerRow.ZZ_FMDATE;
			oTraveler.ZZ_BEGUR = oTravelerRow.ZZ_FMTIME;
			oTraveler.ZZ_ENDDA = oTravelerRow.ZZ_TODATE;
			oTraveler.ZZ_ENDUZ = oTravelerRow.ZZ_TOTIME;
			oTraveler.ZZ_ZFRPLACE = oTravelerRow.ZZ_FMCITY;
			oTraveler.ZZ_ZMODE = oTravelerRow.ZZ_ZMODE;
			oTraveler.ZZ_ZTOPLACE = oTravelerRow.ZZ_TOCITY;
			return oTraveler;
		},
		createMulTravelerObj: function(oPass, oPassDtl) {
			var oTraveler = TCommonSrv.buidTravellerEmpty(oPass.ZZ_ZSLFDPD);
			oTraveler.ZZ_BEGDA = Formatter.dateToYM(oPassDtl.ZZ_DATE_VALUE);
			oTraveler.ZZ_BEGUR = oPassDtl.ZZ_TIME_VALUE;
			oTraveler.ZZ_ENDDA = Formatter.dateToYM(oPassDtl.ZZ_DATE_VALUE);
			oTraveler.ZZ_ENDUZ = oPassDtl.ZZ_TIME_VALUE;
			oTraveler.ZZ_ZFRPLACE = oPassDtl.ZZ_TRV_FROM_TEXT.split(",")[0].trim();
			oTraveler.ZZ_ZMODE = oPassDtl.ZZ_ZMODE;
			oTraveler.ZZ_ZTOPLACE = oPassDtl.ZZ_TRV_TO_TEXT.split(",")[0].trim();
			return oTraveler;
		},
		buildTravelingData: function(oData) {
			var oTravelData = oData.travelingDtl,
				aTravelingDtl = [];
			var aPass = oTravelData.aPassenger;
			switch (oData.TRV_REQ_TYPE) {
				case "DOME":
					// for domestic

					if (oData.ZZ_TRIP_TAB === oTrip.multicity) {
						//multicity
						for (var i = 0; i < aPass.length; i++) {
							var aPassDtl = aPass[i].aPassengerDtl;
							for (var j = 0; j < aPassDtl.length; j++) {
								if (aPass[i].ZZ_ZSLFDPD === aPassDtl[j].ZZ_ZSLFDPD) {
									var oTraveler = this.createMulTravelerObj(aPass[i], aPassDtl[j]);
									aTravelingDtl.push(oTraveler);
								}

							}
						}
					} else {
						//for round trip
						if (oData.ZZ_TRIP_TAB === oTrip.roundtrip) {
							for (var r = 0; r < aPass.length; r++) {
								aPassDtl = aPass[r].aPassengerDtl;
								for (var rd = 0; rd < aPassDtl.length; rd++) {
									if (aPass[r].ZZ_ZSLFDPD === aPassDtl[rd].ZZ_ZSLFDPD) {
										oTraveler = this.createRndTravelerObj(aPass[r], aPassDtl[rd]);
										aTravelingDtl.push(oTraveler);
									}

								}
							}
						} else {
							//one way
							for (var o = 0; o < aPass.length; o++) {

								oTraveler = this.createTravelerObj(aPass[o], oTrip.oneway);

								aTravelingDtl.push(oTraveler);
							}
						}

					}

					break;
				case "INTL":
					//for international
					if (oData.ZZ_TRIP_TAB === oTrip.multicity) {
						//for multicity
						aPassDtl = aPass[0].aPassengerDtl;
						for (var m = 0; m < aPassDtl.length; m++) {
							oTraveler = this.createMulTravelerObj(aPass[0], aPassDtl[m]);
							aTravelingDtl.push(oTraveler);

						}
					} else {
						if (oData.ZZ_TRIP_TAB === oTrip.roundtrip) {
							//round trip
							aPassDtl = aPass[0].aPassengerDtl;
							for (var rs = 0; rs < aPassDtl.length; rs++) {
								oTraveler = this.createRndTravelerObj(aPass[0], aPassDtl[rs]);
								aTravelingDtl.push(oTraveler);

							}
						} else {
							//one way
							oTraveler = this.createTravelerObj(aPass[0], oTrip.oneway);
							aTravelingDtl.push(oTraveler);
						}

					}

					break;
			}

			return aTravelingDtl;
		},
		/* Passport Visa detail */
		buildPassportVisaData: function() {

		},
		/* Accommodation  detail */
		buildAccmData: function(aAccmOr) {
			var aAccm = [];
			if (aAccmOr !== undefined && aAccmOr.length > 0) {
				for (var i = 0; i < aAccmOr.length; i++) {
					var oAccm = {};
					if (TCommonSrv.isEmpty(aAccmOr[i].ZZ_BEGDA_VALUE) === false && TCommonSrv.isEmpty(aAccmOr[i].ZZ_BEGDA_VALUE) === false) {
						oAccm.ZZ_ZPLACE = aAccmOr[i].ZZ_ZPLACE;
						oAccm.ZZ_BEGDA = Formatter.dateToYM(aAccmOr[i].ZZ_BEGDA_VALUE);
						oAccm.ZZ_ENDDA = Formatter.dateToYM(aAccmOr[i].ZZ_ENDDA_VALUE);
						oAccm.ZZ_CONTACT = "";

						aAccm.push(oAccm);
					}

				}
			}

			return aAccm;

		},
		/* Advance Money  detail */
		buildAdvMoneyData: function(oData) {
			var aAdvMoney = [];
			var oAdv = TCommonSrv.converttAdvArrToObj(oData.aAdvMoney);
			aAdvMoney.push(oAdv);
			return aAdvMoney;

		},
		/* Sponsorship detail */
		buildSponsorShipData: function(aOSponsor) {
			var aSponsor = Array.from(Object.create(aOSponsor));
			var aFSponsor = [];
			for (var i = 0; i < aSponsor.length; i++) {
				//delete unnecessary field
				// delete aSponsor[i].ZZ_HEAD_TITLE;
				// delete aSponsor[i].ZZ_EXPANDED;
				// delete aSponsor[i].ZZ_TB_VISIBLE;
				// delete aSponsor[i].ZZ_VISIBLE;
				// delete aSponsor[i].ZZ_FUND_ITEMS_VISIBLE;
				aSponsor[i].ZZ_PERCENT = parseInt(aSponsor[i].ZZ_PERCENT); //convert string to int
				if (aSponsor[i].ZZ_PERCENT > 0 && !isNaN(aSponsor[i].ZZ_PERCENT)) {
					var oSaveSpon = {};
					oSaveSpon.ZZ_GEBER = aSponsor[i].ZZ_GEBER;
					oSaveSpon.ZZ_PERCENT = aSponsor[i].ZZ_PERCENT;
					oSaveSpon.ZZ_CCDEPT = aSponsor[i].ZZ_CCDEPT;
					oSaveSpon.ZZ_CCNAME = aSponsor[i].ZZ_CCNAME;
					oSaveSpon.ZZ_CCOST = aSponsor[i].ZZ_CCOST;
					oSaveSpon.ZZ_EANO = aSponsor[i].ZZ_EANO;
					oSaveSpon.ZZ_FIPEX = aSponsor[i].ZZ_FIPEX;
					oSaveSpon.ZZ_FIPOS = aSponsor[i].ZZ_FIPOS;
					oSaveSpon.ZZ_FISTL = aSponsor[i].ZZ_FISTL;
					oSaveSpon.ZZ_PONO = aSponsor[i].ZZ_PONO;
					oSaveSpon.ZZ_KOSTL = aSponsor[i].ZZ_KOSTL;
					aFSponsor.push(oSaveSpon);
				}
			}
			return aFSponsor;
		},

		/*mapping header data */
		mapHeaderItem: function(oMainData, oData, sActionCode) {
			var oHeader = oData.oHeader;
			if (oHeader !== undefined) {
				oMainData.ZZ_ZDURN = oData.ZZ_ZDURN.toString();
				oMainData.ZZ_DATB1 = oHeader.ZZ_DATB1;
				oMainData.ZZ_DATV1 = oHeader.ZZ_DATV1;
				oMainData.ZZ_LAND1 = oHeader.ZZ_LAND1;
				oMainData.ZZ_LOCATION_END = oHeader.ZZ_LOCATION_END;
				oMainData.ZZ_FMCNTRY = oHeader.ZZ_FMCNTRY;
				oMainData.ZZ_FMLOC = oHeader.ZZ_FMLOC;
				oMainData.ZZ_TRV_TYP = oHeader.ZZ_TRV_TYP;
				oMainData.ZZ_ZCATG = "C";
				oMainData.ZZ_PERNR = oHeader.ZZ_PERNR;
				oMainData.ZZ_REINR = oData.ZZ_TRV_REQ_NUM;
				oMainData.ZZ_LEVEL = oHeader.ZZ_LEVEL;
				oMainData.ZZ_ZVISAT = "1"; //1 for BUSR
				oMainData.ZZ_MODID = oHeader.ZZ_MODID;
				oMainData.ZZ_STATUS = sActionCode;
				oMainData.ZZ_SIM_REQ_KEY = oData.ZZ_SIM_REQ_KEY;
				oMainData.ZZ_SIM_TYP_KEY = oData.ZZ_SIM_TYP_KEY;
				oMainData.ZZ_SIM_DATA_KEY = oData.ZZ_SIM_DATA_KEY;
				oMainData.ZZ_SMODID = oData.TRV_REQ_TYPE;
				oMainData.ZZ_KUNDE = oData.ZZ_ZPURPOSE; //consider purpose field
				oMainData.ZZ_CUST_NAME = ""; // no need in this case
				oMainData.ZZ_DEP_REQ = "";
				oMainData.ZZ_ZPURPOSE = oData.ZZ_ZPURPOSE; //consider purpose field
				oMainData.ZZ_COMMENTS = oData.ZZ_COMMENTS;
				oMainData.ZZ_DEP_REQ = "";
				oMainData.ZZ_MOBILE = oHeader.ZZ_MOBILE;
				oMainData.ZZ_ZMEAL = oHeader.ZZ_ZMEAL;
				oMainData.ZZ_ZSEAT = oHeader.ZZ_ZSEAT;
				oMainData.ZZ_UHRV1 = oHeader.ZZ_UHRV1;
				oMainData.ZZ_UHRB1 = oHeader.ZZ_UHRB1;
				oMainData.ZZ_CATID = oData.ZZ_CATID; //temp disable wait services
				oMainData.ZZ_VERSION = oData.ZZ_VERSION.trim();
				// oMainData.ZZ_NEW_COMMENTS = oData.ZZ_NEW_COMMENTS;
				// oMainData.ZZ_ZINSUR = "";
				// oMainData.ZZ_FSTL = "";
				// oMainData.ZZ_MGR_PERNR = "";
				// oMainData.ZZ_TRV_AMOUNT = "";
				// oMainData.ZZ_TOT_AMOUNT = "";
				// oMainData.ZZ_BUDGET_AVL = "";
				// oMainData.ZZ_DEP_SUB_TYPE = oData.ZZ_CATID;
				// oMainData.ZZ_VKMGP = "";
				// oMainData.ZZ_CHANGE_GE = "";
				// oMainData.ZZ_CHANGE_CO = "";
				// oMainData.ZZ_CHANGE_DE = "";
				// oMainData.ZZ_CHANGE_AC = "";
				// oMainData.ZZ_CHANGE_AD = "";
				// oMainData.ZZ_CARGO = "";
				// oMainData.ZZ_TIMESTAMP = TCommonSrv.getTimeStamp();
				// oMainData.ZZ_VREASON = "";
				// oMainData.ZZ_TO_CNTRY_TXT = "";
				// oMainData.ZZ_FR_CNTRY_TXT = "";
			}
			delete oMainData.__metadata;
			delete oMainData.DEP_VISA_PLAN;

		},
		sendRequestDataHandle: function(sActionCode) {
			var oVModel = this.getView().getModel("trvRequestDtl"),
				oData = oVModel.getData(),
				oThis = this,
				saveData = {},
				oMainModel = TravelRequestThis.getView().getModel("viewModel"),
				oMainData = $.extend(false, {}, oMainModel.getData());
			//validate travelling
			var bValid = TravelRequestDtlThis.validateTravelling(); //eslint-disable-line
			//sponsor detail
			if (bValid) {

				bValid = oData.ZZ_SP_VALID;
			}
			if (bValid) {
				sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oHomeThis); //eslint-disable-line
				//Travelling data
				oMainData.TRV_HDRtoTRV_travel_Data = this.buildTravelingData(oData);

				//Accommodation
				if (oData.TRV_REQ_TYPE === "DOME") {
					oMainData.TRV_HDRtoTRV_ACCOM = oData.aAccomodation;
					oMainData.TRV_HDRtoTRV_ACCOM = this.buildAccmData(oMainData.TRV_HDRtoTRV_ACCOM);

				} else {
					//set blank data
					oMainData.TRV_HDRtoTRV_ACCOM = [];
				}
				/*var oGCat = TravelRequestThis.byId("trvCategoryGrp");
				var oCatId = oGCat.getSelectedButton().getBindingContext("trvRequestDtl").getObject();
				oData.ZZ_CATID = oCatId.ZZ_DEP_SUB_TYPE;
				oData.ZZ_CATID_IDX = oGCat.getSelectedIndex();*/
				//Advance Money
				oMainData.TRV_HDRtoTRV_ADVANCE = this.buildAdvMoneyData(oData);

				//sponsorship
				oMainData.TRV_HDRtoTRV_COST_ASGN = this.buildSponsorShipData(oData.aSponsorshipDtl);

				//header base data
				this.mapHeaderItem(oMainData, oData, sActionCode);
				//save data
				saveData = oMainData;

				//submit save data
				var oDataModel = this.getView().getModel(),
					sPath = "",
					oSaveDeferred = $.Deferred(),
					sAction = "";

				//Employee
				var empDetail = sap.ui.getCore().getModel("profile").getData().employeeDetail;
				empDetail.travelLoc = "";
				empDetail.travelDate = "";
				//end header information
				//Global model
				/* Request new*/
				sPath = "/TRV_HDRSet";
				oDataModel.create(sPath, saveData, {
					async: false,
					success: function(data, header) {
						//console.clear(); //eslint-disable-line

						var oNData = oVModel.getData(),
							sMsg = "";
						//old logic
						if (data.ZZ_REINR === "0000000000") {
							//request fail
							// TCommonSrv._showMsgBox("Cannot save request in system", data.ZZ_COMMENTS);
							// StaticUtility.setBusy(false, oThis); //eslint-disable-line
							sMsg = data.ZZ_COMMENTS;
						} else {
							//request success
							//keep header text
							var oEmpData = oNData.empDetail;
							oNData.empDetail.travelLoc = oEmpData.travelFrom + " to " + oEmpData.travelTo;
							oNData.empDetail.travelDate = oEmpData.travelDateFrom + " to " + oEmpData.travelDateTo;
							//update request number
							oNData.ZZ_TRV_REQ_NUM = data.ZZ_REINR;
							oNData.ZZ_REINR = data.ZZ_REINR;
							oVModel.setData(oNData);
							if (saveData.ZZ_REINR === "0000000000") {

								sMsg = "Travel plan " + data.ZZ_REINR + " is created successfully";
								sAction = "created";
							} else {
								//check save or submit
								if (saveData.ZZ_STATUS === "AA000") {
									sMsg = "Saved successfully";
									sAction = "saved";
								} else {
									sMsg = "Submitted successfully";
									// sap.m.MessageToast.show(sMsg);
									sAction = "submited";

								}
							}
							// Save travel plan: VISA, BankCard
							if (oNData.TRV_REQ_TYPE === "INTL") {
								// if (TravelPlanThis.getView().getModel().getData().view.visaExist === "X") {
								PassportVisaThis.getView().getModel().getData().selfVisa.ZZ_DEP_REQ = data.ZZ_REINR; //eslint-disable-line
								PassportVisaThis.saveVisaPlan(PassportVisaThis.getView().getModel().getData(), "", "", "BUSR"); //eslint-disable-line
								// if (sap.ui.getCore().byId('UploadVisaSelf').oFileUpload.files.length !== 0) {
								// 	sap.ui.project.e2etm.util.StaticUtility.uploadFileDeputation(PassportVisaThis, sap.ui.getCore().byId('UploadVisaSelf'), data.ZZ_REINR, //eslint-disable-line
								// 		empDetail.ZZ_DEP_PERNR, sMsg);
								// }
								// }
							}

							//End save info
						}
						if (data.ZZ_REINR === "0000000000") {
							TCommonSrv._showMsgBox("Cannot save request in system", sMsg);
						} else {
							MessageToast.show(sMsg);
							if (sAction === "submited") {
								//nav back home page
								sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
							} else {
								//nav to detail page
								var sReqEncode = Base64.encode(oData.ZZ_REINR); //eslint-disable-line
								sap.ui.core.routing.Router.getRouter("MyRouter").navTo("TravelRequest", {
									"reqId": sReqEncode
								});
								// StaticUtility.setBusy(true, oThis); //eslint-disable-line
								sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oHomeThis); //eslint-disable-line
								window.location.reload();
							}
						}

						// oSaveDeferred.resolve();
						// $.when(oSaveDeferred).done(
						// 	function(oResData) {

						// 	});
					},
					error: function(oError) {
						console.info("Create error" + oError.responseText); //eslint-disable-line
					}
				});
				//end save
			} else {
				TCommonSrv._showMsgBox("Mandatory Information", "Please fill mandatory information under travelling details to continue");
			}
			// StaticUtility.setBusy(false, oThis); //eslint-disable-line
			// sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oHomeThis); //eslint-disable-line

		},

		/*Handle save travel request 
		Code: AA000 save
		AA003 submit
		*/
		saveTravelRequest: function() {
			this.sendRequestDataHandle("AA000");
		},
		deleteTravelRequest: function() {

		},
		/*Handle submit travel request */
		submitTravelRequest: function() {
			this.sendRequestDataHandle("AA003");
		},
		/*Handle when user click back */
		onBackPress: function() {
			sap.ca.ui.dialog.confirmation.open({
				question: "Unsaved data will be lost.Are you sure you want to exit?",
				showNote: false,
				title: "Confirm",
				confirmButtonLabel: "Yes"
			}, function(oResult) {
				if (oResult.isConfirmed) {
					TravelRequestThis.getView().byId('carouselProcessFlow').destroyContent();
					//remove class for custom css class
					$("html").find(".sapMShellCentralBox").removeClass("flexWidth");
					sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
				}
			});
		}

	});
});