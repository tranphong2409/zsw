/* Global var */
var TravelRequestDtlThis; //eslint-disable-line
sap.ui.define([
	"sap/ui/project/e2etm/util/Formatter",
	"sap/ui/project/e2etm/util/StaticUtility",
	"sap/ca/ui/dialog/factory",
	"sap/ui/project/e2etm/util/TCommonSrv"
], function(Formatter, StaticUtility, factory, TCommonSrv) {
	"use strict";
	/* Global var */
	var sRequestPassengerFragment = "sap.ui.project.e2etm.fragment.travel.request.psg/";
	var oVModel = "";
	var oTrip = {
		oneway: 0,
		roundtrip: 1,
		multicity: 2
	};
	/* End Global var*/
	return sap.ui.controller("sap.ui.project.e2etm.controller.travelrequest.TVRDetail", {

		formatter: Formatter,
		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */

		onInit: function() {
			//
			TravelRequestDtlThis = this;
			//call global model
			oVModel = TravelRequestThis.getView().getModel("trvRequestDtl"); //eslint-disable-line

			//set default oneway
			this._handleDatabyTrip(false);
			// public method for other controller
			// var oEventBus = sap.ui.getCore().getEventBus();
			// oEventBus.subscribe("TravellingDtl", "UpdateHeader", this._updateHeaderTitle(), this);

		},
		_prepareScreenLoad: function() {

		},
		/* Select trip */
		onTripChangeHandle: function(oEvent) {
			// var sKey = oEvent.getSource().getSelectedKey();
			var sKey = oEvent.getSource().getSelectedIndex();
			var sId = oEvent.getSource().sId;
			switch (sKey) {
				case oTrip.oneway:
					this._handleDatabyTrip(false, sKey);
					break;
				case oTrip.roundtrip:
					this._handleDatabyTrip(true, sKey);
					break;
				case oTrip.multicity:
					this._handleDatabyTrip(false, sKey);
					break;
			}

		},
		copFtPassMulData: function(aPsg, nLen) {
			if (nLen > 1) {

				if (aPsg[nLen - 1].aPassengerDtl.length === 0) {

					aPsg[nLen - 1].aPassengerDtl = aPsg[0].aPassengerDtl;
					this.copFtPassMulData(aPsg, nLen - 1);

				}
			}
		},
		_handleDatabyTrip: function(bEnable, sTripTab) {
			var oData = oVModel.getData(),
				oTravelData = oData.travelingDtl,
				sId = 0;
			oData.ZZ_ROUND_TRIP = bEnable;
			oData.ZZ_TRIP_TAB = sTripTab;

			if (oTravelData) {
				var oDefaultLoc = TCommonSrv.checkExistingArray(oData.aCountries, "CITY", oData.empDetail.ZZ_BASE_LOC);
				oData.empDetail.travelFrom = oDefaultLoc.CITY_COUNTRY.replace(",", "-");
				oTravelData.aPassenger = [];
				var oPassRow = TCommonSrv.buildPassengerRow("00");
				if (sTripTab === oTrip.oneway) {
					oPassRow.ZZ_LOC_FROM_KEY = oDefaultLoc.CITY_COUNTRY_CODE;
					oPassRow.ZZ_FMCNTRY = oDefaultLoc.COUNTRYCODE;
					oPassRow.ZZ_FMCITY = oDefaultLoc.CITY;
				}
				oTravelData.aPassenger.push(oPassRow);
				switch (sTripTab) {
					case oTrip.multicity:
						delete oTravelData.aPassenger[0].aPassengerDtl;
						var oR = TCommonSrv.buildPassengerDtlEmptyRow("00");
						oPassRow.aPassengerDtl = [];
						oR.ZZ_LOC_FROM_KEY = oDefaultLoc.CITY_COUNTRY_CODE;
						oR.ZZ_FMCNTRY = oDefaultLoc.COUNTRYCODE;
						oR.ZZ_FMCITY = oDefaultLoc.CITY;
						oPassRow.aPassengerDtl.push(oR);
						oTravelData.nPassengerDtLenght = 1;
						this.showHideByLocation(oDefaultLoc.COUNTRYCODE, "DE");
						break;
					case oTrip.roundtrip:
						sId = 1;
						delete oTravelData.aPassenger[0].aPassengerDtl;
						var oRst = TCommonSrv.buildPassengerDtlEmptyRndRow("00");
						var oRNd = TCommonSrv.buildPassengerDtlEmptyRndRow("00");
						oPassRow.aPassengerDtl = [];
						oRst.ZZ_LOC_FROM_KEY = oDefaultLoc.CITY_COUNTRY_CODE;
						oRst.ZZ_FMCNTRY = oDefaultLoc.COUNTRYCODE;
						oRst.ZZ_FMCITY = oDefaultLoc.CITY;
						oPassRow.aPassengerDtl.push(oRst);
						oRNd.ZZ_LOCK_ND = false;
						oRNd.ZZ_LOC_TO_KEY = oDefaultLoc.CITY_COUNTRY_CODE;
						oRNd.ZZ_TOCNTRY = oDefaultLoc.COUNTRYCODE;
						oRNd.ZZ_TOCITY = oDefaultLoc.CITY;
						oPassRow.aPassengerDtl.push(oRNd);
						this.showHideByLocation(oDefaultLoc.COUNTRYCODE, "DE");
						break;
					case oTrip.oneway:
						sId = 2;
						delete oTravelData.aPassenger[0].aPassengerDtl;
						oTravelData.nPassengerDtLenght = 1;
						this.showHideByLocation(oDefaultLoc.COUNTRYCODE, "DE");
						break;

				}

				TCommonSrv.setProfileData(oTravelData.aPassenger[0], oTravelData.profileDefault);

				oData.travelingDtl = oTravelData;

			}
			oVModel.setData(oData);

		}
		/* Handle add more Passenger */
		,
		_setVisibleAddPsgBtn: function() {
			var aAddPsgBtn = $(".btnAddPsgDetail");
			for (var i = 1; i < aAddPsgBtn.length; i++) {
				var sId = aAddPsgBtn[i].id;
				$("#" + sId).hide();
			}
		},
		//copy data for multicity
		copPrevPassDtlRow: function(sDep, oPrevRow, bFRow) {
			var oDRow = TCommonSrv.buildPassengerDtlEmptyRow(sDep);
			oDRow.ZZ_TRV_FROM_LOC = oPrevRow.ZZ_TRV_FROM_LOC;
			oDRow.ZZ_TRV_FROM_TEXT = oPrevRow.ZZ_TRV_FROM_TEXT;
			oDRow.ZZ_TRV_TO_LOC = oPrevRow.ZZ_TRV_TO_LOC;
			oDRow.ZZ_TRV_TO_TEXT = oPrevRow.ZZ_TRV_TO_TEXT;
			oDRow.ZZ_DATE_VALUE = oPrevRow.ZZ_DATE_VALUE;
			oDRow.ZZ_TIME_VALUE = oPrevRow.ZZ_TIME_VALUE;
			oDRow.ZZ_ZMODE = oPrevRow.ZZ_ZMODE;
			oDRow.ZZ_F_ROW = bFRow;
			return oDRow;
		},
		//copy data for round trip
		copPrevPassDtlOneRoundRow: function(sDep, oFRow, bFRow) {
			var oRow = TCommonSrv.buildPassengerDtlEmptyRow(sDep);
			oRow.ZZ_LOC_FROM_KEY = oFRow.ZZ_LOC_FROM_KEY;
			oRow.ZZ_LOC_TO_KEY = oFRow.ZZ_LOC_TO_KEY;
			oRow.ZZ_FMCNTRY = oFRow.ZZ_FMCNTRY;
			oRow.ZZ_TOCNTRY = oFRow.ZZ_TOCNTRY;
			oRow.ZZ_FMCITY = oFRow.ZZ_FMCITY;
			oRow.ZZ_TOCITY = oFRow.ZZ_TOCITY;
			oRow.ZZ_FMDATE = oFRow.ZZ_FMDATE;
			oRow.ZZ_FMDATE_VALUE = oFRow.ZZ_FMDATE_VALUE;
			oRow.ZZ_TODATE_VALUE = oFRow.ZZ_TODATE_VALUE;
			oRow.ZZ_TODATE = oFRow.ZZ_TODATE;
			oRow.ZZ_FMTIME = oFRow.ZZ_FMTIME;
			oRow.ZZ_TOTIME = oFRow.ZZ_TOTIME;
			oRow.ZZ_ZMODE = oFRow.ZZ_ZMODE;
			oRow.ZZ_LOCK_ND = bFRow;
			oRow.ZZ_F_ROW = bFRow;
			return oRow;
		},
		//check handle data previous
		copPrevPassData: function(oFRow, oRow, sTab) {

			//copy all detail items of first row
			switch (sTab) {
				case oTrip.multicity:
					var aFDetail = oFRow.aPassengerDtl;
					var aPDetail = Array.from(Object.create(aFDetail));
					var aTemps = [];
					for (var i = 0; i < aPDetail.length; i++) {
						var oDRow = this.copPrevPassDtlRow(oRow.ZZ_ZSLFDPD, aFDetail[i], false);
						aTemps.push(oDRow);
					}
					oRow.aPassengerDtl = aTemps;
					break;
				case oTrip.oneway:
					oRow.ZZ_LOC_FROM_KEY = oFRow.ZZ_LOC_FROM_KEY;
					oRow.ZZ_LOC_TO_KEY = oFRow.ZZ_LOC_TO_KEY;
					oRow.ZZ_FMCNTRY = oFRow.ZZ_FMCNTRY;
					oRow.ZZ_TOCNTRY = oFRow.ZZ_TOCNTRY;
					oRow.ZZ_FMCITY = oFRow.ZZ_FMCITY;
					oRow.ZZ_TOCITY = oFRow.ZZ_TOCITY;
					oRow.ZZ_FMDATE = oFRow.ZZ_FMDATE;
					oRow.ZZ_FMDATE_VALUE = oFRow.ZZ_FMDATE_VALUE;
					oRow.ZZ_TODATE_VALUE = oFRow.ZZ_TODATE_VALUE;
					oRow.ZZ_TODATE = oFRow.ZZ_TODATE;
					oRow.ZZ_FMTIME = oFRow.ZZ_FMTIME;
					oRow.ZZ_TOTIME = oFRow.ZZ_TOTIME;
					oRow.ZZ_ZMODE = oFRow.ZZ_ZMODE;
					oRow.ZZ_F_ROW = false;

					break;
				case oTrip.roundtrip:
					aFDetail = oFRow.aPassengerDtl;
					aPDetail = Array.from(Object.create(aFDetail));
					aTemps = [];
					for (var r = 0; r < aPDetail.length; r++) {
						var oRDRow = this.copPrevPassDtlOneRoundRow(oRow.ZZ_ZSLFDPD, aFDetail[r], false);
						aTemps.push(oRDRow);
					}

					oRow.aPassengerDtl = aTemps;
					break;
			}
			return oRow;
		},
		hideAddRemPassDtlButton: function(oRow) {
			var aPsDetail = oRow.aPassengerDtl;
			var aPTemps = [];
			for (var i = 0; i < aPsDetail.length; i++) {
				var oPassenger = aPsDetail[i];
				oPassenger.ZZ_F_ROW = false; //visible all button of child
				aPTemps.push(oPassenger);
			}
			oRow.aPassengerDtl = aPTemps;
			return oRow;
		},
		getPsDepend: function(nPass) {
			var sDep = "01";
			switch (nPass) {
				case 2:
					sDep = "0" + nPass;
					break;
				case 3:

					sDep = "90";
					break;
				case 4:
					sDep = "0" + (nPass - 1);
					break;
				case 5:
					sDep = "0" + (nPass - 1);
					break;
			}
			return sDep;
		},
		onAddNewPassenger: function() {
			var oData = oVModel.getData();
			var oTravelData = oData.travelingDtl;
			var nPass = oTravelData.aPassenger.length;
			if (oTravelData !== undefined) {
				var bValid = TCommonSrv.valiDateTravelingFirstRow(oTravelData.aPassenger[0]);
				//temporary for working on multi city
				if (oData.ZZ_TRIP_TAB === oTrip.roundtrip) {
					bValid = TCommonSrv.valiDateTravelingRoundTrip(oTravelData.aPassenger);
				}
				if (oData.ZZ_TRIP_TAB === oTrip.multicity) {
					bValid = TCommonSrv.valiDateTravelingMultiCity(oTravelData.aPassenger);
				}
				if (bValid) {
					if (nPass <= 5) {
						var oFirstRow = oTravelData.aPassenger[0];
						//feedback point 3 from customer Nov
						if (oData.TRV_REQ_TYPE === "DOME") {
							oFirstRow.ZZ_VISIBLE = false;
						}
						var nPsg = nPass + 1;
						var sDep = this.getPsDepend(nPass);
						var oRow = TCommonSrv.buildPassengerRow(sDep);
						oRow.ZZ_PSG_NAME = "Traveler 0" + nPsg; //set psg name

						// oRow.ZZ_ZSLFDPD = this.getPsDepend(nPass); //set default dependent
						oRow.ZZ_VISIBLE = false; //visible field for intl or dom
						oRow.ZZ_ENABLED = true; //enable field for intl or dom
						oRow.ZZ_EXPANDED = false;
						var oFnRow = this.copPrevPassData(oFirstRow, oRow, oData.ZZ_TRIP_TAB); //copy data first row

						oTravelData.aPassenger.push(oFnRow);
					} else {
						TCommonSrv._showErrMsgByCode("E01", "E");
					}
				} else {
					TCommonSrv._showErrMsgByCode("E02", "V");
				}

			}
			oData.travelingDtl = oTravelData;
			oVModel.setData(oData);
		},
		onRemovePassenger: function() {
			var oData = oVModel.getData(),
				oTravelData = oData.travelingDtl;
			if (oTravelData.aPassenger.length > 1) {
				oTravelData.aPassenger.splice(oTravelData.aPassenger.length - 1, 1);

			} else {
				TCommonSrv._showMsgBox("Error", "Can't delete all row");
				oData.ZZ_REMOVE_PSG = true;
			}
			oData.travelingDtl = oTravelData;
			oVModel.setData(oData);
		},
		_removePassengerWhenINTL: function(oData) {
			var oTravelData = oData.travelingDtl;
			if (oTravelData.aPassenger.length > 1) {
				this.onRemovePassenger();
				this._removePassengerWhenINTL(oData);
			}

		},

		_buildPassengerPanel: function(nPsg) {
			var oHeader = sap.ui.xmlfragment(sRequestPassengerFragment + "headers", this);
			//change header title 
			oHeader.mAggregations.content[0].setText("Traveler 0" + nPsg + ":");
			var oContent = sap.ui.xmlfragment(sRequestPassengerFragment + "contents", this);

			//change path info
			// oContent.mBindingInfos.items.path = oContent.mBindingInfos.items.path + nPsg;
			// oContent.mBindingInfos.items.path = oContent.mBindingInfos.items.path;
			oContent.mBindingInfos.rows.path = oContent.mBindingInfos.rows.path;
			var oPanel = new sap.m.Panel({
				id: "psgPanel" + nPsg,
				expandable: true,
				expanded: false,
				headerToolbar: oHeader,
				content: oContent,
				templateShareable: true
			});
			oPanel.addStyleClass("psgPanel");
			return oPanel;

		},
		//update sub traveller
		updateSubPassengerDtl: function(oTravelData) {
			for (var j = 1; j < oTravelData.aPassenger.length; j++) {

				// var oDRow = this.copPrevPassDtlRow(oTravelData.aPassenger[j].ZZ_ZSLFDPD, oFRow, false);
				var aPassDtl = oTravelData.aPassenger[0].aPassengerDtl;

				var aPDetail = Array.from(Object.create(aPassDtl));
				var aTemps = [];
				for (var i = 0; i < aPDetail.length; i++) {
					var oDRow = this.copPrevPassDtlRow(oTravelData.aPassenger[j].ZZ_ZSLFDPD, aPDetail[i], false);

					aTemps.push(oDRow);
				}
				oTravelData.aPassenger[j].ZZ_VISIBLE = false;
				oTravelData.aPassenger[j].aPassengerDtl = aTemps;
			}
			return oTravelData;
		},
		onAddPassengerDetailRow: function(oEvent) {
			StaticUtility.setBusy(true, TravelRequestThis); //eslint-disable-line
			var oData = oVModel.getData();
			var oTravelData = oData.travelingDtl;
			var sIdx = TCommonSrv.getTravelPsgIdx(oEvent, this);
			if (oTravelData !== undefined) {
				var oFRow = TCommonSrv.buildPassengerDtlEmptyRow("00"); //for first row

				var aPassengerDtl = oTravelData.aPassenger[sIdx].aPassengerDtl;
				oFRow.ZZ_ZSLFDPD = oTravelData.aPassenger[sIdx].ZZ_ZSLFDPD; //set dependend                        
				if (aPassengerDtl.length > 0) {
					var nP = oTravelData.nPassengerDtLenght;
					if (nP <= 1) {
						oFRow.ZZ_TRV_FROM_LOC = aPassengerDtl[0].ZZ_TRV_TO_LOC;
						oFRow.ZZ_TRV_FROM_TEXT = aPassengerDtl[0].ZZ_TRV_TO_TEXT;
						oFRow.ZZ_TRV_TO_LOC = aPassengerDtl[0].ZZ_TRV_FROM_LOC;
						oFRow.ZZ_TRV_TO_TEXT = aPassengerDtl[0].ZZ_TRV_FROM_TEXT;
					} else {
						oFRow.ZZ_TRV_FROM_LOC = aPassengerDtl[nP - 1].ZZ_TRV_TO_LOC;
						oFRow.ZZ_TRV_FROM_TEXT = aPassengerDtl[nP - 1].ZZ_TRV_TO_TEXT;
						oFRow.ZZ_TRV_TO_LOC = aPassengerDtl[0].ZZ_TRV_FROM_LOC;
						oFRow.ZZ_TRV_TO_TEXT = aPassengerDtl[0].ZZ_TRV_FROM_TEXT;
					}
				}
				aPassengerDtl.push(oFRow);
				oTravelData.aPassenger[sIdx].aPassengerDtl = aPassengerDtl;

				//handle for multi traveller
				if (oData.TRV_REQ_TYPE === "DOME" && oTravelData.aPassenger.length > 1) {
					oTravelData = this.updateSubPassengerDtl(oTravelData);
				}
			}
			oData.travelingDtl = oTravelData;
			oVModel.setData(oData);
			//call update header title
			this._updateHeaderTitle();
		}
		/* reduce detail row of passenger */
		,
		onRemovePassengerDetailRow: function(oEvent) {
			var oData = oVModel.getData(),
				oRow = oEvent.getSource().getParent();
			// nIdx = oRow.getIndex();
			var nIdx = TCommonSrv.getRowIdxMultiCity(oEvent);
			var sIdx = TCommonSrv.getTravelPsgIdx(oEvent, this);
			if (oData.travelingDtl.aPassenger[0].aPassengerDtl.length > 1) {
				var aPass = oData.travelingDtl.aPassenger;
				for (var i = 1; i < aPass.length; i++) {
					aPass[i].aPassengerDtl.splice(nIdx, 1);
				}
				oData.travelingDtl.aPassenger[sIdx].aPassengerDtl.splice(nIdx, 1);
				oData.travelingDtl.nPassengerDtLenght--;
				oVModel.setData(oData);
				this._updateHeaderTitle();
			} else {
				TCommonSrv._showMsgBox("Error", "Can't delete all row");
			}
		}
		/* Update header title */
		,
		//Recursion to get final from and to country
		_getToCountry: function(aPassengerDtl, nLastRowIdx) {
			var oFirstRow = aPassengerDtl[0],
				oLastRow = aPassengerDtl[nLastRowIdx];
			if (nLastRowIdx === 0) {
				this._setHeaderTitle("tt", oFirstRow, oLastRow, nLastRowIdx);
			} else {
				if ((oFirstRow.ZZ_TRV_FROM_LOC === oLastRow.ZZ_TRV_FROM_LOC) || (oFirstRow.ZZ_TRV_FROM_LOC === oLastRow.ZZ_TRV_TO_LOC)) {
					if (oFirstRow.ZZ_TRV_FROM_LOC === oLastRow.ZZ_TRV_TO_LOC) {
						this._setHeaderTitle("tf", oFirstRow, oLastRow, nLastRowIdx);
					} else {
						//call back to get previeus rows
						this._getToCountry(aPassengerDtl, nLastRowIdx - 1);
					}
				} else {
					if (oFirstRow.ZZ_TRV_FROM_LOC !== oLastRow.ZZ_TRV_FROM_LOC) {
						this._setHeaderTitle("tf", oFirstRow, oLastRow, nLastRowIdx);
					} else {

						this._setHeaderTitle("tt", oFirstRow, oLastRow, nLastRowIdx);
					}
				}
			}

		},
		//update header multicity
		_setHeaderTitle: function(sType, oFirstRow, oLastRow, nLastRowIdx) {
			var oLastRowInfo = {
				fromDate: "",
				toDate: "",
				fromKey: "",
				fromText: "",
				toIdx: 0,
				toKey: "",
				toText: ""
			};
			//prepare data
			oLastRowInfo.fromKey = oFirstRow.ZZ_TRV_FROM_LOC;
			oLastRowInfo.fromText = oFirstRow.ZZ_TRV_FROM_TEXT.replace(",", " -");
			oLastRowInfo.toIdx = nLastRowIdx;
			if (sType === "tt") {
				oLastRowInfo.toKey = oLastRow.ZZ_TRV_TO_LOC;
				oLastRowInfo.toText = oLastRow.ZZ_TRV_TO_TEXT.replace(",", " -");

			} else {
				oLastRowInfo.toKey = oLastRow.ZZ_TRV_FROM_LOC;
				oLastRowInfo.toText = oLastRow.ZZ_TRV_FROM_TEXT.replace(",", " -");

			}
			if (oFirstRow.ZZ_DATE_VALUE.indexOf("/") !== -1) {

				oLastRowInfo.fromDate = Formatter.dateToYM(oFirstRow.ZZ_DATE_VALUE);
			} else {
				oLastRowInfo.fromDate = oFirstRow.ZZ_DATE_VALUE;
			}
			if (oLastRow.ZZ_DATE_VALUE.indexOf("/") !== -1) {

				oLastRowInfo.toDate = Formatter.dateToYM(oLastRow.ZZ_DATE_VALUE);
			} else {
				oLastRowInfo.toDate = oLastRow.ZZ_DATE_VALUE;
			}

			//end prepare data
			var oData = oVModel.getData(),
				oTravelingData = oData.travelingDtl,
				oEmpData = oData.empDetail;

			if (oLastRowInfo) {
				var oPassRow = {};
				//set travelling data
				//get general information
				var oFPass = oTravelingData.aPassenger[0]; //get self gerneral only
				oPassRow.ZZ_ZSLFDPD = oFPass.ZZ_ZSLFDPD;
				oPassRow.ZZ_ZSEAT = oFPass.ZZ_ZSEAT;
				oPassRow.ZZ_ZMEAL = oFPass.ZZ_ZMEAL;
				oPassRow.ZZ_MOBILE = oFPass.ZZ_MOBILE;
				oPassRow.ZZ_FMCNTRY = oLastRowInfo.fromKey.split("-")[1].trim();
				oPassRow.ZZ_TOCNTRY = oLastRowInfo.toKey.split("-")[1].trim();
				oPassRow.ZZ_FMCITY = oLastRowInfo.fromText.split("-")[0].trim();
				oPassRow.ZZ_TOCITY = oLastRowInfo.toText.split("-")[0].trim();
				oPassRow.ZZ_FMDATE = oLastRowInfo.fromDate;
				oPassRow.ZZ_TODATE = oLastRowInfo.toDate;
				oPassRow.ZZ_FMTIME = oFirstRow.ZZ_TIME_VALUE;
				oPassRow.ZZ_TOTIME = oLastRow.ZZ_TIME_VALUE;
				oPassRow.ZZ_ZMODE = oFirstRow.ZZ_ZMODE;

				//set header title information
				//call service to build date with suffix number

				oEmpData.travelDateFrom = TCommonSrv.buildDateHeader(TCommonSrv.convertStringToDate(Formatter.keepDateAlways(oFirstRow.ZZ_DATE_VALUE)));
				oEmpData.travelDateTo = TCommonSrv.buildDateHeader(TCommonSrv.convertStringToDate(Formatter.keepDateAlways(oLastRow.ZZ_DATE_VALUE)));
				if (oPassRow.ZZ_FMCITY !== undefined && oPassRow.ZZ_TOCITY !== undefined) {
					oEmpData.travelLoc = oLastRowInfo.fromText + " to " + oLastRowInfo.toText;
				}
				if (oEmpData.travelDateFrom !== undefined && oEmpData.travelDateTo !== undefined) {
					oEmpData.travelDate = oEmpData.travelDateFrom + " to " + oEmpData.travelDateTo;
				}

				//set header data
				this.setHeaderData(oPassRow);
				oData.empDetail = oEmpData;

				this.showHideByLocation(oPassRow.ZZ_FMCNTRY, oPassRow.ZZ_TOCNTRY);
				//update travel mode
				if (oData.TRV_REQ_TYPE === "INTL" && oPassRow.ZZ_TOCNTRY !== undefined) {

					this._updateTravelMode(oData, oData.ZZ_TRIP_TAB, "A");
				} else {
					// this._updateTravelMode(oData, oTrip.multicity, "");
				}

				//handle for multi traveller
				var oTravelData = oData.travelingDtl;
				if (oData.TRV_REQ_TYPE === "DOME" && oTravelData.aPassenger.length > 1) {
					oTravelData = this.updateSubPassengerDtl(oTravelData);

				} else if (oData.TRV_REQ_TYPE === "DOME" && oTravelData.aPassenger.length === 0) {
					oTravelData.aPassenger[0].ZZ_VISIBLE = false;
					oTravelData.aPassenger[0].ZZ_ENABLED = true;
				} else {
					oTravelData.aPassenger[0].ZZ_VISIBLE = true;
					oTravelData.aPassenger[0].ZZ_ENABLED = false;
				}
				oVModel.setData(oData);
			}
		},
		_updateHeaderTitle: function() {

			var oData = oVModel.getData(),
				oTravelingData = oData.travelingDtl,
				aPassengerDtl = oTravelingData.aPassenger[0].aPassengerDtl,
				nLastRowIdx = aPassengerDtl.length - 1;
			this._getToCountry(aPassengerDtl, nLastRowIdx);
		}
		/* end update header */
		/* set final travel data */
		,
		setBaseTravelling: function() {

		}
		/* Handle show hide panel by location */
		,
		setBaseData: function(sBType) {
			var oData = oVModel.getData();
			if (sBType === "INTL") {
				if (oData.EDIT_MODE === false) {

					this._removePassengerWhenINTL(oData); //remove dom psg and keep 1
				}
				oData.ZZ_REMOVE_PSG = false;
				oData.TRV_REQ_TYPE = "INTL";
				oData.ZZ_SIM_REQ_KEY = "Y";

			} else {
				if (oData.EDIT_MODE === false) {

					oData.ZZ_ACCM_REQ_ENB = false;

					oData.nAccomodationLenght = 0;
				}
				if (oData.TRV_REQ_TYPE === "INTL" && oData.EDIT_MODE === true) {
					oData.ZZ_ACCM_REQ_ENB = false;
					oData.nAccomodationLenght = 0;
				}

				oData.ZZ_REMOVE_PSG = true;
				oData.TRV_REQ_TYPE = "DOME";
				oData.ZZ_SIM_REQ_KEY = "N";

			}
			//adv money base
			if (oData.EDIT_MODE === false) {
				oData.ZZ_ADVM_REQ_KEY = "N";
				oData.ZZ_ADVM_REQ_ENB = false;
			} else {
				oData.ZZ_ADVM_REQ_KEY = "Y";
				oData.ZZ_ADVM_REQ_ENB = true;
			}
			oVModel.setData(oData);
		},
		showHideByLocation: function(sKeyFrom, sKeyTo) {
			var aDom = "addNewPsgBtn,acdDOMSec",
				aIntl = "acdINTLSec,simcardSec,passportVisaSec";

			if (sKeyFrom === "IN" && sKeyTo === "IN") {
				//show dome hide intl
				this.setBaseData("DOME");
				TCommonSrv._handleShowHideObj(aIntl, false, this, TravelRequestThis); //eslint-disable-line
				TCommonSrv._handleShowHideObj(aDom, true, this, TravelRequestThis); //eslint-disable-line
			} else {
				//hide dom show intl
				this.setBaseData("INTL");
				TCommonSrv._handleShowHideObj(aIntl, true, this, TravelRequestThis); //eslint-disable-line
				TCommonSrv._handleShowHideObj(aDom, false, this, TravelRequestThis); //eslint-disable-line
			}
			StaticUtility.setBusy(false, TravelRequestThis); //eslint-disable-line

		},
		//call function to load default data for sub screen

		_prepareDataForSubScr: function() {
			StaticUtility.setBusy(true, TravelRequestThis); //eslint-disable-line
			var that = this,
				oThis = TravelRequestThis, //eslint-disable-line
				oData = oVModel.getData(); //eslint-disable-line

			var oDataModel = TravelRequestThis.getView().getModel(); //eslint-disable-line
			var sPath = "",
				sUrlParams = "",
				oFundDeferred = $.Deferred(),
				oHeader = oData.oHeader;

			//get fund list
			sPath = "/Fund_F4_Help";
			sUrlParams = "ZZ_BEGDA='" + oHeader.ZZ_BEGDA + "'&ZZ_ENDDA='" + oHeader.ZZ_ENDDA + "'";
			oDataModel.read(sPath, {
				urlParameters: sUrlParams,
				success: function(oCData) {
					oData.aFunds = oCData.results;
					oFundDeferred.resolve();

				},
				error: function(err) {
					console.clear(); //eslint-disable-line
					console.info("Error" + err); //eslint-disable-line
				}
			});
			//get cost assignment 
			if (SponsorshipThis !== undefined) { //eslint-disable-line

				SponsorshipThis.getCostAssignment({}, oData); //eslint-disable-line
			}
			//set visa header
			if (oData.TRV_REQ_TYPE === "INTL") {
				PassportVisaThis.setVPHeader(oData); //eslint-disable-line
				PassportVisaThis.loadExistVisa(); //eslint-disable-line
			}
			//request complete
			$.when(oFundDeferred).done(
				function() {
					//inject switch
					var bSim = false;
					var sMode = "000";
					if (oData.ZZ_STATUS !== "" && oData.ZZ_STATUS !== undefined) {
						sMode = oData.ZZ_STATUS.substring(2, sMode.length);
					}
					if (oData.ZZ_SIM_REQ_KEY === "Y" && sMode === "003") {
						bSim = true;
					}
					if (oData.TRV_REQ_TYPE === "DOME") {
						TCommonSrv._switchInject(oData.ZZ_ACCM_REQ_ENB, 0);
						TCommonSrv._switchInject(oData.ZZ_ADVM_REQ_ENB, 1);
						TCommonSrv._switchInject(bSim, 2);
					} else {

						TCommonSrv._switchInject(oData.ZZ_ADVM_REQ_ENB, 0);
						TCommonSrv._switchInject(bSim, 1);
					}
					//set default sponsor shipdata
					// oThis._setDefaultSponsor(oData);
					oVModel.setData(oData);
					oVModel.refresh();
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis); //eslint-disable-line

				});

		},
		//set header infomration base on travelling detail data
		setHeaderData: function(oRowData) {
			var oData = oVModel.getData();
			var oHeader = {
				ZZ_REINR: "0000000000",
				ZZ_PERNR: oData.empDetail.ZZ_DEP_PERNR,
				ZZ_TTYPE: "BUSR",
				ZZ_TRV_TYP: "BUSR",
				ZZ_BEGDA: oRowData.ZZ_FMDATE,
				ZZ_ENDDA: oRowData.ZZ_TODATE,
				ZZ_DATV1: oRowData.ZZ_FMDATE,
				ZZ_DATB1: oRowData.ZZ_TODATE,
				ZZ_LEVEL: oData.empDetail.ZZ_DEP_LEVEL,
				ZZ_LOCATION_END: oRowData.ZZ_TOCITY,
				ZZ_FMCNTRY: oRowData.ZZ_FMCNTRY,
				ZZ_MODID: 'BUSR',
				ZZ_SMODID: oData.TRV_REQ_TYPE,
				ZZ_LAND1: oRowData.ZZ_TOCNTRY,
				ZZ_FMLOC: oRowData.ZZ_FMCITY,
				ZZ_MOBILE: oRowData.ZZ_MOBILE,
				ZZ_ZMEAL: oRowData.ZZ_ZMEAL,
				ZZ_ZSEAT: oRowData.ZZ_ZSEAT,
				ZZ_UHRV1: oRowData.ZZ_FMTIME,
				ZZ_UHRB1: oRowData.ZZ_TOTIME
			};
			//duration
			var nDuration = "0";
			if (oRowData.ZZ_FMDATE && oRowData.ZZ_TODATE) {
				nDuration = TCommonSrv.getDuration(oRowData.ZZ_FMDATE, oRowData.ZZ_TODATE);
			}
			oData.ZZ_ZDURN = nDuration;
			oData.oHeader = oHeader;
			oData.ZZ_SP_F4_CALLED = false; //change header need re call F4 data
			oVModel.setData(oData);
			//call prepare
			this._prepareDataForSubScr();
		},
		//update if more dependent one way
		updateSubTravellerOnw: function(aPass, sTab) {
			var oFRow = aPass[0];
			for (var i = 1; i < aPass.length; i++) {
				aPass[i].ZZ_VISIBLE = false;
				this.copPrevPassData(oFRow, aPass[i], sTab);
			}

		},
		//update sub traveller
		updateSubTravellerRnd: function(oTravelData) {
			for (var j = 1; j < oTravelData.aPassenger.length; j++) {
				var aPassDtl = oTravelData.aPassenger[0].aPassengerDtl;

				var aPDetail = Array.from(Object.create(aPassDtl));
				var aTemps = [];
				for (var i = 0; i < aPDetail.length; i++) {
					var oDRow = this.copPrevPassDtlOneRoundRow(oTravelData.aPassenger[j].ZZ_ZSLFDPD, aPDetail[i], false);

					aTemps.push(oDRow);
				}
				oTravelData.aPassenger[j].ZZ_VISIBLE = false;
				oTravelData.aPassenger[j].aPassengerDtl = aTemps;
			}
			return oTravelData;
		},
		//header info round trip
		updateHeaderDateRnd: function(oData, oHeadData) {
			if (oHeadData.dateFrom && oHeadData.dateTo) {
				oHeadData.dateFrom = Formatter.ymToMDY(oHeadData.dateFrom);
				oHeadData.dateTo = Formatter.ymToMDY(oHeadData.dateTo);
				var sFrom = TCommonSrv.buildDateHeader(oHeadData.dateFrom),
					sTo = TCommonSrv.buildDateHeader(oHeadData.dateTo);
				oData.empDetail.travelDate = sFrom + " to " + sTo;
				var oFRow = this._getFinalRowRnd(oData.travelingDtl.aPassenger[0]);
				this.setHeaderData(oFRow);
			}

		},
		_getFinalRowRnd: function(oPass) {
			var oPst = oPass.aPassengerDtl[0],
				oPnd = oPass.aPassengerDtl[1];
			var oPassRow = {};
			oPassRow.ZZ_ZSLFDPD = oPass.ZZ_ZSLFDPD;
			oPassRow.ZZ_ZSEAT = oPass.ZZ_ZSEAT;
			oPassRow.ZZ_ZMEAL = oPass.ZZ_ZMEAL;
			oPassRow.ZZ_MOBILE = oPass.ZZ_MOBILE;
			oPassRow.ZZ_FMCNTRY = oPst.ZZ_FMCNTRY;
			oPassRow.ZZ_TOCNTRY = oPnd.ZZ_TOCNTRY;
			oPassRow.ZZ_FMCITY = oPst.ZZ_FMCITY;
			oPassRow.ZZ_TOCITY = oPnd.ZZ_TOCITY;
			oPassRow.ZZ_FMDATE = oPst.ZZ_FMDATE;
			oPassRow.ZZ_TODATE = oPnd.ZZ_TODATE;
			oPassRow.ZZ_FMTIME = oPst.ZZ_FMTIME;
			oPassRow.ZZ_TOTIME = oPnd.ZZ_TOTIME;
			oPassRow.ZZ_ZMODE = oPst.ZZ_ZMODE;
			return oPassRow;
		},
		_updateTravelMode: function(oData, sTripTab, sMode) {
			switch (sTripTab) {
				case oTrip.oneway:
					oData.travelingDtl.aPassenger[0].ZZ_ZMODE = sMode;
					break;
				case oTrip.roundtrip:
					oData.travelingDtl.aPassenger[0].aPassengerDtl[0].ZZ_ZMODE = sMode;
					oData.travelingDtl.aPassenger[0].aPassengerDtl[1].ZZ_ZMODE = sMode;
					break;
				case oTrip.multicity:
					var aPassDtl = oData.travelingDtl.aPassenger[0].aPassengerDtl;
					for (var m = 0; m < aPassDtl.length; m++) {
						aPassDtl[m].ZZ_ZMODE = sMode;
					}
					break;
			}

		},
		handleOneRoundTrip: function(oEvent, sField, sValue) {
			var oData = oVModel.getData(),
				oEmpData = oData.empDetail;

			var sIdx = TCommonSrv.getTravelPsgIdx(oEvent, this); //get parent index 
			var oPassFrow = oData.travelingDtl.aPassenger[0]; //get self gerneral only
			var oPassRow = oData.travelingDtl.aPassenger[sIdx];
			//update first row for round trip
			var oFDRow = {},
				bCallBack = false;
			if (oData.ZZ_TRIP_TAB === oTrip.roundtrip) {

				oFDRow = oData.travelingDtl.aPassenger[0].aPassengerDtl[0];

			}
			switch (sField) {
				case "fromcnt":
					oPassRow.ZZ_FMCNTRY = sValue.split("-")[1].trim();
					if (oData.ZZ_TRIP_TAB === oTrip.roundtrip) {
						oFDRow.ZZ_FMCNTRY = sValue.split("-")[1].trim();
					}
					break;
				case "fromloc":
					oPassRow.ZZ_FMCITY = sValue.split(",")[0];
					if (sIdx === "0") {
						oEmpData.travelFrom = sValue.replace(",", " -");
					}
					if (oData.ZZ_TRIP_TAB === oTrip.roundtrip) {
						oFDRow.ZZ_FMCITY = sValue.split(",")[0];
					}
					break;
				case "tocnt":
					oPassRow.ZZ_TOCNTRY = sValue.split("-")[1].trim();
					if (oData.ZZ_TRIP_TAB === oTrip.roundtrip) {
						oFDRow.ZZ_TOCNTRY = sValue.split("-")[1].trim();
					}
					break;
				case "toloc":
					if (oPassRow.ZZ_FMCITY === sValue.split(",")[0]) {
						// TCommonSrv._showMsgBox("Error", "City can't be same");

						oPassRow.ZZ_LOC_TO_KEY = "";
						oPassRow.ZZ_TOCNTRY_ERROR = "Error";
					} else {
						oPassRow.ZZ_TOCNTRY_ERROR = "None";
						oPassRow.ZZ_TOCITY = sValue.split(",")[0];

						if (sIdx === "0") {
							oEmpData.travelTo = sValue.replace(",", " -");
						}
					}
					if (oData.ZZ_TRIP_TAB === oTrip.roundtrip) {
						oFDRow.ZZ_TOCITY = sValue.split(",")[0];
					}
					break;
				case "fromdate":

					oEmpData.travelDateFrom = TCommonSrv.buildDateHeader(oEvent.getSource().getDateValue());
					oPassRow.ZZ_FMDATE = Formatter.dateToYM(sValue);
					//if one way to date = from date + 1 day
					if (oData.ZZ_ROUND_TRIP === false) {
						oEmpData.travelDateTo = TCommonSrv.buildDateHeader(oEvent.getSource().getDateValue(), 0); //plus one day
						oPassRow.ZZ_TODATE = Formatter.dateToYM(sValue, 0);
						oPassRow.ZZ_TODATE_VALUE = Formatter.plusDayToDMY(sValue, 0);
					}
					if (oData.ZZ_TRIP_TAB === oTrip.roundtrip) {
						oFDRow.ZZ_FMDATE = Formatter.dateToYM(sValue);
					}
					break;
				case "todate":

					oEmpData.travelDateTo = TCommonSrv.buildDateHeader(oEvent.getSource().getDateValue());
					oPassRow.ZZ_TODATE = Formatter.dateToYM(sValue);
					if (oData.ZZ_TRIP_TAB === oTrip.roundtrip) {
						oFDRow.ZZ_TODATE = Formatter.dateToYM(sValue);
					}
					break;
				case "fromtime":
					bCallBack = true;
					//if one way set to time = from time
					if (oData.ZZ_ROUND_TRIP === false) {
						oPassRow.ZZ_TOTIME = sValue;
					}
					break;
				case "totime":
					bCallBack = true;
					break;
				case "header":
					//get general information
					oPassRow.ZZ_ZSLFDPD = oPassFrow.ZZ_ZSLFDPD;
					oPassRow.ZZ_ZSEAT = oPassFrow.ZZ_ZSEAT;
					oPassRow.ZZ_ZMEAL = oPassFrow.ZZ_ZMEAL;
					oPassRow.ZZ_MOBILE = oPassFrow.ZZ_MOBILE;
					break;
				case "trvmode":
					bCallBack = true;
					oPassRow.ZZ_ZMODE = sValue;
					break;
			}
			//set header title information
			if (oEmpData.travelFrom !== undefined && oEmpData.travelTo !== undefined) {
				oEmpData.travelLoc = oEmpData.travelFrom + " to " + oEmpData.travelTo;
			}
			if (oEmpData.travelDateFrom !== undefined && oEmpData.travelDateTo !== undefined) {
				oEmpData.travelDate = oEmpData.travelDateFrom + " to " + oEmpData.travelDateTo;
			}

			//set header data
			if (oData.ZZ_TRIP_TAB === oTrip.roundtrip) {

				var oFRow = this._getFinalRowRnd(oData.travelingDtl.aPassenger[0]);
				this.setHeaderData(oFRow);
			} else {
				this.setHeaderData(oPassRow);
			}

			oData.empDetail = oEmpData;
			oVModel.setData(oData);
			this.showHideByLocation(oPassFrow.ZZ_FMCNTRY, oPassFrow.ZZ_TOCNTRY);
			//update travel mode
			if (oData.TRV_REQ_TYPE === "DOME" && oPassFrow.ZZ_TOCNTRY === "IN") {

				// this._updateTravelMode(oData, oData.ZZ_TRIP_TAB, "");
			} else {
				this._updateTravelMode(oData, oData.ZZ_TRIP_TAB, "A");
			}

			//update data
			if (oData.TRV_REQ_TYPE === "DOME" && oData.travelingDtl.aPassenger.length > 1) {
				if (oData.ZZ_TRIP_TAB === oTrip.roundtrip) {

					if (bCallBack === true) {

						this.updateSubTravellerRnd(oData.travelingDtl, oData.ZZ_TRIP_TAB);
					}
				} else {
					this.updateSubTravellerOnw(oData.travelingDtl.aPassenger, oData.ZZ_TRIP_TAB);
				}

			} else if (oData.TRV_REQ_TYPE === "DOME" && oData.travelingDtl.aPassenger.length === 1) {
				oData.travelingDtl.aPassenger[0].ZZ_VISIBLE = false;
				oData.travelingDtl.aPassenger[0].ZZ_ENABLED = true;
			} else {
				oData.travelingDtl.aPassenger[0].ZZ_VISIBLE = true;
				oData.travelingDtl.aPassenger[0].ZZ_ENABLED = false;
			}

		}
		/* Handle select country from, to */
		,
		onFromCountryChange: function(oEvent) {
			// var sRowIdx = oEvent.getSource().getParent().getBindingContextPath().split("/")[3];
			var oData = oVModel.getData(),
				sRowIdx = 0;

			if (oData.ZZ_TRIP_TAB === oTrip.multicity) {
				// sRowIdx = oEvent.getSource().getParent().getIndex();
				sRowIdx = TCommonSrv.getRowIdxMultiCity(oEvent);
				var sIdx = TCommonSrv.getTravelPsgIdx(oEvent, this); //get parent index 

				oData.travelingDtl.aPassenger[sIdx].aPassengerDtl[sRowIdx].ZZ_TRV_FROM_LOC = oEvent.getSource().getSelectedKey();
				oData.travelingDtl.aPassenger[sIdx].aPassengerDtl[sRowIdx].ZZ_TRV_FROM_TEXT = oEvent.getSource().getValue();

				//call update header
				this._updateHeaderTitle();
			} else {

				this.handleOneRoundTrip(oEvent, "fromcnt", oEvent.getSource().getSelectedKey());
				this.handleOneRoundTrip(oEvent, "fromloc", oEvent.getSource().getValue());
				if (oData.ZZ_TRIP_TAB === oTrip.roundtrip) {
					var oPass = oData.travelingDtl.aPassenger[0];
					if (oPass.aPassengerDtl[0].ZZ_LOC_FROM_KEY !== oPass.aPassengerDtl[0].ZZ_LOC_TO_KEY) {
						oPass.aPassengerDtl[0].ZZ_FMCNTRY_ERROR = "None";
						oPass.aPassengerDtl[1].ZZ_LOC_TO_KEY = oPass.aPassengerDtl[0].ZZ_LOC_FROM_KEY;
						oPass.aPassengerDtl[1].ZZ_TOCNTRY = oPass.aPassengerDtl[0].ZZ_FMCNTRY;
						oPass.aPassengerDtl[1].ZZ_TOCITY = oPass.aPassengerDtl[0].ZZ_FMCITY;
						this.updateSubTravellerRnd(oData.travelingDtl, oData.ZZ_TRIP_TAB);
					} else {
						// TCommonSrv._showErrMsgByCode("E03", "V");
						oPass.aPassengerDtl[0].ZZ_LOC_FROM_KEY = "";
						oPass.aPassengerDtl[0].ZZ_FMCNTRY_ERROR = "Error";
					}
				}
			}
			oVModel.refresh();

		},
		onToCountryChange: function(oEvent) {
			// var sRowIdx = oEvent.getSource().getParent().getBindingContextPath().split("/")[3];

			var oData = oVModel.getData(),
				sRowIdx = 0;
			if (oData.ZZ_TRIP_TAB === oTrip.multicity) {
				//logic for multi city
				// sRowIdx = oEvent.getSource().getParent().getIndex(); //for table
				sRowIdx = TCommonSrv.getRowIdxMultiCity(oEvent);
				var sIdx = TCommonSrv.getTravelPsgIdx(oEvent, this); //get parent index 
				oData.travelingDtl.aPassenger[sIdx].aPassengerDtl[sRowIdx].ZZ_TRV_TO_LOC = oEvent.getSource().getSelectedKey();
				if (oData.travelingDtl.aPassenger[sIdx].aPassengerDtl[sRowIdx + 1] !== undefined) {

					oData.travelingDtl.aPassenger[sIdx].aPassengerDtl[sRowIdx + 1].ZZ_TRV_FROM_LOC = oEvent.getSource().getSelectedKey();
					oData.travelingDtl.aPassenger[sIdx].aPassengerDtl[sRowIdx + 1].ZZ_TRV_FROM_TEXT = oEvent.getSource().getValue();
				}
				oData.travelingDtl.aPassenger[sIdx].aPassengerDtl[sRowIdx].ZZ_TRV_TO_TEXT = oEvent.getSource().getValue();
				oVModel.refresh();
				//call update header
				this._updateHeaderTitle();

			} else {

				this.handleOneRoundTrip(oEvent, "tocnt", oEvent.getSource().getSelectedKey());
				this.handleOneRoundTrip(oEvent, "toloc", oEvent.getSource().getValue());
				if (oData.ZZ_TRIP_TAB === oTrip.roundtrip) {
					var oPass = oData.travelingDtl.aPassenger[0];
					if (oPass.aPassengerDtl[0].ZZ_LOC_FROM_KEY !== oPass.aPassengerDtl[0].ZZ_LOC_TO_KEY) {
						oPass.aPassengerDtl[0].ZZ_TOCNTRY_ERROR = "None";
						oPass.aPassengerDtl[1].ZZ_LOC_FROM_KEY = oPass.aPassengerDtl[0].ZZ_LOC_TO_KEY;
						oPass.aPassengerDtl[1].ZZ_FMCNTRY = oPass.aPassengerDtl[0].ZZ_TOCNTRY;
						oPass.aPassengerDtl[1].ZZ_FMCITY = oPass.aPassengerDtl[0].ZZ_TOCITY;
						this.updateSubTravellerRnd(oData.travelingDtl, oData.ZZ_TRIP_TAB);
					} else {
						// TCommonSrv._showErrMsgByCode("E03", "V");
						oPass.aPassengerDtl[0].ZZ_LOC_TO_KEY = "";
						oPass.aPassengerDtl[0].ZZ_TOCNTRY_ERROR = "Error";
					}

				}
			}

		},
		onHeaderChange: function(oEvent) {
			var oData = oVModel.getData();
			if (oData.ZZ_TRIP_TAB === oTrip.multicity) {
				this._updateHeaderTitle();
			} else {
				this.handleOneRoundTrip(oEvent, "header", "");
			}
		},
		onChangeTravelDate: function(oEvent) {
			this._updateHeaderTitle();
		},
		onChangeTravelTime: function(oEvent) {
			this._updateHeaderTitle();
		},
		//multicity
		onChangeTravelMode: function(oEvent) {
			this._updateHeaderTitle();
			var sTrvModeKey = oEvent.getSource().getSelectedKey();
			this.onHandleTaxiMode(sTrvModeKey);
		},
		onChangeTravelDateFrom: function(oEvent) {
			var oData = oVModel.getData();
			var sIdx = TCommonSrv.getRowIdxRoundTrip(oEvent); //get parent index 
			if (oData.ZZ_TRIP_TAB === oTrip.roundtrip) {
				if (sIdx === 1) {
					//for second row
					oData.travelingDtl.aPassenger[0].aPassengerDtl[sIdx].ZZ_FMDATE = Formatter.dateToYM(oEvent.getSource().getValue());
					this.updateSubTravellerRnd(oData.travelingDtl, oData.ZZ_TRIP_TAB);
				} else {
					//user feedback 2019/01/10
					oData.travelingDtl.aPassenger[0].aPassengerDtl[0].ZZ_TODATE = Formatter.dateToYM(oEvent.getSource().getValue());
					this.handleOneRoundTrip(oEvent, "fromdate", oEvent.getSource().getValue());
				}
				if (oData.travelingDtl.aPassenger[0].aPassengerDtl[1].ZZ_TODATE) {
					var oHeaderData = {
						dateFrom: oData.travelingDtl.aPassenger[0].aPassengerDtl[0].ZZ_FMDATE,
						dateTo: oData.travelingDtl.aPassenger[0].aPassengerDtl[1].ZZ_TODATE
					};
					this.updateHeaderDateRnd(oData, oHeaderData);
				} else {
					//user feedback 2019/01/10
					oData.travelingDtl.aPassenger[0].aPassengerDtl[1].ZZ_TODATE = oData.travelingDtl.aPassenger[0].aPassengerDtl[1].ZZ_FMDATE;
					//end feedback
					oHeaderData = {
						dateFrom: oData.travelingDtl.aPassenger[0].aPassengerDtl[0].ZZ_FMDATE,
						dateTo: oData.travelingDtl.aPassenger[0].aPassengerDtl[1].ZZ_TODATE
					};
					this.updateHeaderDateRnd(oData, oHeaderData);
				}

			} else {
				this.handleOneRoundTrip(oEvent, "fromdate", oEvent.getSource().getValue());
			}

		},
		onChangeTravelDateTo: function(oEvent) {
			var oData = oVModel.getData();
			var sIdx = TCommonSrv.getRowIdxRoundTrip(oEvent); //get parent index 
			if (oData.ZZ_TRIP_TAB === oTrip.roundtrip) {
				if (sIdx === 1) {
					//for second row
					oData.travelingDtl.aPassenger[0].aPassengerDtl[sIdx].ZZ_TODATE = Formatter.dateToYM(oEvent.getSource().getValue());
					this.updateSubTravellerRnd(oData.travelingDtl, oData.ZZ_TRIP_TAB);
				} else {
					this.handleOneRoundTrip(oEvent, "todate", oEvent.getSource().getValue());
				}
				if (oData.travelingDtl.aPassenger[0].aPassengerDtl[0].ZZ_FMDATE) {
					var oHeaderData = {
						dateFrom: oData.travelingDtl.aPassenger[0].aPassengerDtl[0].ZZ_FMDATE,
						dateTo: oData.travelingDtl.aPassenger[0].aPassengerDtl[1].ZZ_TODATE
					};
					this.updateHeaderDateRnd(oData, oHeaderData);
				}

			} else {
				this.handleOneRoundTrip(oEvent, "todate", oEvent.getSource().getValue());
			}

		},
		onChangeTravelTimeFrom: function(oEvent) {
			this.handleOneRoundTrip(oEvent, "fromtime", oEvent.getSource().getValue());
		},
		onChangeTravelTimeTo: function(oEvent) {
			this.handleOneRoundTrip(oEvent, "totime", oEvent.getSource().getValue());
		},
		onTravelModeChange: function(oEvent) {
			this.handleOneRoundTrip(oEvent, "trvmode", oEvent.getSource().getSelectedKey());
			var sTrvModeKey = oEvent.getSource().getSelectedKey();
			this.onHandleTaxiMode(sTrvModeKey);
		},
		//handle update dependent 
		_updateDependentDetailRndMul: function(sNewDep, aPassengerDtl) {
			for (var i = 0; i < aPassengerDtl.length; i++) {
				aPassengerDtl[i].ZZ_ZSLFDPD = sNewDep;
			}
		},
		onDependentChange: function(oEvent) {
			var oData = oVModel.getData(),
				oTravelData = oData.travelingDtl;
			var sIdx = TCommonSrv.getTravelPsgIdx(oEvent, this);
			var sNewDep = oEvent.getSource().getSelectedKey();
			var oExistDep = TCommonSrv.checkExistingArray(oTravelData.aPassenger, "ZZ_ZSLFDPD", sNewDep);
			var aPass = oTravelData.aPassenger[sIdx];
			if (oExistDep === undefined) {

				if (oData.ZZ_TRIP_TAB === oTrip.roundtrip || oData.ZZ_TRIP_TAB === oTrip.multicity) {
					//round trp
					this._updateDependentDetailRndMul(sNewDep, aPass.aPassengerDtl);
				} else {
					//one way
				}
			} else {
				if (oData.ZZ_TRIP_TAB === oTrip.roundtrip || oData.ZZ_TRIP_TAB === oTrip.multicity) {
					//round trp
					oTravelData.aPassenger[sIdx].ZZ_ZSLFDPD = aPass.aPassengerDtl[0].ZZ_ZSLFDPD;
				} else {
					//one way
				}

			}

		},
		//end update dependent domestic
		onChangeCustomerCat: function(oEvent) {
			var oData = oVModel.getData();
			var nIdx = oEvent.getSource().getSelectedIndex();
			oData.ZZ_CATID = TCommonSrv.getCustomerCatFromIdx(nIdx);
			oVModel.refresh();
		},
		//handle validate travelling
		validateTravelling: function() {
			var oVData = oVModel.getData(),
				oTravelData = oVData.travelingDtl;
			//check travelling Detail
			var bValid = TCommonSrv.valiDateTravelingFirstRow(oTravelData.aPassenger[0]);
			//temporary for working on multi city
			if (oVData.ZZ_TRIP_TAB === oTrip.roundtrip) {
				bValid = TCommonSrv.valiDateTravelingRoundTrip(oTravelData.aPassenger);
			}
			if (oVData.ZZ_TRIP_TAB === oTrip.multicity) {
				bValid = TCommonSrv.valiDateTravelingMultiCity(oTravelData.aPassenger);
			}
			return bValid;

		},
		onPurpuseChange: function(oEvent) {
			var oData = oVModel.getData();
			var sPurposeKey = oEvent.getSource().getSelectedKey();
			var bValid = TCommonSrv.validPurpose(sPurposeKey);
			if (bValid === true) {
				oData.ZZ_ZPURPOSE_ERROR = "None";
				oData.ZZ_ZPURPOSE = sPurposeKey;
			} else {
				oData.ZZ_ZPURPOSE_ERROR = "Error";
				TCommonSrv._showErrMsgByCode("E13", "V");
			}

			oVModel.refresh();

		},
		//handle navigate to profile page
		onUpdatePofileNav: function() {

			var globalData = sap.ui.getCore().getModel("global").getData();
			globalData.isProfileView = true;
			sap.ui.getCore().getModel("global").setData(globalData);

			sap.m.MessageBox.confirm(
				"Any unsaved data will be lost, do you want to continue ?",
				function(oAction) {
					if (oAction === "OK") {
						//remove class for custom css class
						$("html").find(".sapMShellCentralBox").removeClass("flexWidth");
						sap.ui.project.e2etm.util.StaticUtility.openProfileDialog(TravelRequestThis, TravelRequestThis.getView()); //eslint-disable-line
					} else if (oAction === "CANCEL") {
						return;
					}
				},
				"Confirmation"
			);
			return;
		},
		onHandleTaxiMode: function(sTrvModeKey) {
			var oData = oVModel.getData();
			if (oData.ZZ_TRIP_TAB !== oTrip.oneway && sTrvModeKey === "X") {
				oData.ZZ_TAXI_LINK_ENABLED = true;
			} else {
				oData.ZZ_TAXI_LINK_ENABLED = false;
			}

		},
		onNavToTaxiApp: function() {
			var win = window.open(
				"http://sgpvmc0145.apac.bosch.com/taxiIndent/Enterpriseview.aspx?html.app=EBOSCHTD5f045&html.views=VD_EntTaxi,ESystem535d7,;VD_EntTaxi:vc1,EBOSCHTD5f81b,;VD_EntTaxi:vc1:viewControl1,EBOSCHTD5f069,;VD_EntTaxi:vc1:viewControl1:vPanel,EAppPoint1acea4,;VD_EntTaxi:vc1:viewControl1:vPanel:VC_TopPanel,EAppPoint1add0b,;VD_EntTaxi:vc1:viewControl1:vPanel:VC_TaxiTabs,EAppPoint1b227d,;1542873292209,EAppPoint1b2d7c,;",
				'_blank');
			win.focus();
		},
		_onNavBackProfileReload: function() {
			sap.ui.project.e2etm.util.StaticUtility.openProfileDialog(TravelRequestThis, TravelRequestThis.getView()); //eslint-disable-line
		}
	});
});