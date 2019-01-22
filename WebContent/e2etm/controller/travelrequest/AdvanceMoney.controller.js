sap.ui.define([
	"sap/ui/project/e2etm/util/Formatter",
	"sap/ui/project/e2etm/util/StaticUtility",
	"sap/ca/ui/dialog/factory",
	"sap/ui/project/e2etm/util/TCommonSrv",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function(Formatter, StaticUtility, factory, TCommonSrv, JSONModel, MessageToast) {
	"use strict";
	/* Global var */
	var aAdvComps = "advMoneyDetail",
		oVModel = "";
	/* End Global var*/
	return sap.ui.controller("sap.ui.project.e2etm.controller.travelrequest.AdvanceMoney", {

		formatter: Formatter,
		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */

		onInit: function() {
			//call global model
			oVModel = TravelRequestThis.getView().getModel("trvRequestDtl"); //eslint-disable-line

			//init data for component
			this._initScreenData();
		},
		//calculate amount
		_calculatAmount: function(nDuration, oAdvPolicy) {
			var oAdvFill = {
				nAmount: 0,
				sCurr: "USD"
			};
			if (oAdvPolicy !== undefined) {
				var nBoa = nDuration * parseInt(oAdvPolicy.ZE2E_BOAC_AMT);
				var nLod = nDuration * parseInt(oAdvPolicy.ZE2E_LODC_AMT);
				var nCon = nDuration * parseInt(oAdvPolicy.ZE2E_CONC_AMT);
				oAdvFill.nAmount = nBoa + nLod + nCon;
				oAdvFill.sCurr = oAdvPolicy.ZE2E_BOAC_CURR;
			}
			return oAdvFill;
		},
		/* Load adv data */
		_loadAdvData: function() {
			var oData = oVModel.getData(),
				aAdvMoney = [];
			var oAdvFill = this._calculatAmount(parseInt(oData.ZZ_ZDURN), oData.oAdvPolicy);
			var oAdvRow = TCommonSrv.buildAdvMoneyEmpty(oAdvFill.sCurr);
			oAdvRow.ZZ_BODVL1 = oAdvFill.nAmount;
			oData.ZZ_ADV_INTL = true;
			if (oData.TRV_REQ_TYPE === "DOME") {
				oData.aAdvMoney = [];
				oAdvRow.enabled = false;
				oAdvRow.ZZ_CUR1 = "INR";
				oData.ZZ_ADV_INTL = false;
			}
			//handle call odata later
			if (oData.aAdvMoney === undefined || oData.aAdvMoney.length === 0) {
				//push empty row
				aAdvMoney.push(oAdvRow);
				oData.aAdvMoney = aAdvMoney;
			} else {
				if (oData.aAdvMoney[0].ZZ_BODVL1 !== oAdvRow.nAmount) {
					oData.aAdvMoney[0].ZZ_BODVL1 = oAdvFill.nAmount;
					oData.aAdvMoney[0].ZZ_CUR1 = oAdvFill.sCurr;
				}
				//reset first row
				oData.aAdvMoney[0].enabled = true;
			}
			oData.aAdvMoneyLenght = oData.aAdvMoney.length;
			oVModel.setData(oData);

		},
		/*Handle show hide from init */
		_initScreenData: function() {
			var oData = oVModel.getData();
			oData.ZZ_ADVM_REQ_ENB = false;
			oVModel.setData(oData);
			this._loadAdvData();
			// var sAdvReqKey = oVModel.getData().ZZ_ADVM_REQ_KEY;
			// var oAdvReq = this.getView().byId("advMoney");

			// //set state for advance request
			// if (sAdvReqKey === "Y") {
			// 	//load data
			// 	this._loadAdvData();
			// 	oAdvReq.setState(true);
			// } else {

			// 	oAdvReq.setState(false);
			// }

			// //show hide set defaul data for selection
			// TCommonSrv._handleShowHideObj(aAdvComps, oAdvReq.getState(), this, TravelRequestThis); //eslint-disable-line

		},
		/*onAdvancePolicyPress */
		onAdvancePolicyPress: function(sType) {
			var oThis = this;
			StaticUtility.setBusy(true, TravelRequestThis); //eslint-disable-line
			//get header data
			var oMData = oVModel.getData();
			//check travelling Detail
			var bValid = TravelRequestDtlThis.validateTravelling(); //eslint-disable-line
			if (bValid) {
				var oHeader = oMData.oHeader;
				//get advance policy
				var sPath = "/AdvanceAmount";
				var sUrlParams = "ENDDA='" + oHeader.ZZ_DATB1 + "'&STDATE='" + oHeader.ZZ_DATV1 + "'&ZE2E_LEVEL='" + oHeader.ZZ_LEVEL +
					"'&ZZ_CITY='" +
					oHeader.ZZ_LOCATION_END +
					"'&ZZ_FRMLAND='" + oHeader.ZZ_FMCNTRY + "'&ZZ_MODID='" + oHeader.ZZ_MODID + "'&ZZ_SMODID='" + oHeader.ZZ_SMODID + "'&ZZ_TOLAND='" +
					oHeader.ZZ_LAND1 +
					"'";
				var oDataModel = TravelRequestThis.getView().getModel(); //eslint-disable-line
				oDataModel.read(sPath, {
					urlParameters: sUrlParams,
					success: function(oRData) {
						if (sType === "reload") {
							//setback main model
							oMData.oAdvPolicy = oRData.results[0];
							oVModel.setData(oMData);
							oThis._loadAdvData();
						} else {
							if (TravelRequestThis.advanceDialog) { //eslint-disable-line
								TravelRequestThis.advanceDialog.destroy(); //eslint-disable-line
							}
							// instantiate the Fragment if not done yet
							TravelRequestThis.advanceDialog = sap.ui.xmlfragment("sap.ui.project.e2etm.fragment.travel.AdvanceDetails", TravelRequestThis); //eslint-disable-line
							var oModel = new sap.ui.model.json.JSONModel();
							oModel.setData(oRData.results); //eslint-disable-line
							sap.ui.getCore().byId("tableAdvance").setModel(oModel);

							TravelRequestThis.advanceDialog.open(); //eslint-disable-line

						}

						StaticUtility.setBusy(false, TravelRequestThis); //eslint-disable-line

					},
					error: function(err) {
						StaticUtility.setBusy(false, TravelRequestThis); //eslint-disable-line
						console.clear(); //eslint-disable-line
						console.info("Error" + err); //eslint-disable-line
					}
				});

			} else {
				// TCommonSrv._showMsgBox("Mandatory Input", "Please fill all field of Travelling Details");
				TCommonSrv._showErrMsgByCode("E08", "V");
				StaticUtility.setBusy(false, TravelRequestThis); //eslint-disable-line
			}

		},
		/* Handle advance switch */
		onAdvanceMoneySwitch: function(oEvent) {
			var oData = oVModel.getData(),
				oControl = oEvent.getSource();
			var bValid = TravelRequestDtlThis.validateTravelling(); //eslint-disable-line
			var nIdx = 0;
			if (oData.TRV_REQ_TYPE === "DOME") {
				nIdx = 1;
			}
			if (bValid) {
				var bState = oControl.getState();

				if (bState === true) {
					oData.ZZ_ADVM_REQ_KEY = "Y";
					//show table
					TCommonSrv._handleShowHideObj(aAdvComps, bState, this, TravelRequestThis); //eslint-disable-line
					//show policy
					this.onAdvancePolicyPress("reload");
					//load data
					// this._loadAdvData();
				} else {
					oData.ZZ_ADVM_REQ_KEY = "N";
					TCommonSrv._handleShowHideObj(aAdvComps, bState, this, TravelRequestThis); //eslint-disable-line
				}
				oVModel.setData(oData);
				TCommonSrv._switchInject(bState, nIdx);
			} else {
				oControl.setState(false);
				TCommonSrv._switchInject(false, nIdx);
				TCommonSrv._showErrMsgByCode("E08", "V");
			}

		},
		/* add adv money row */
		addAdvMoneyRow: function() {
			var oData = oVModel.getData();
			var oAdvRow = TCommonSrv.buildAdvMoneyEmpty("USD");
			if (oData.aAdvMoney.length !== 0) {
				oAdvRow = TCommonSrv.buildAdvMoneyEmpty(oData.aAdvMoney[0].ZZ_CUR1);
			}

			if (oData.aAdvMoney.length < 3) {
				oData.aAdvMoney.push(oAdvRow);
				oData.aAdvMoneyLenght++;
				oVModel.setData(oData);
			} else {

				TCommonSrv._showErrMsgByCode("E04", "E");
			}
		},
		/* add adv money row */
		deleteAdvMoneyRow: function(oEvent) {
			var oData = oVModel.getData(),
				oRow = oEvent.getSource().getParent().getParent(),
				nIdx = oRow.getIndex();
			if (oData.aAdvMoney.length > 1) {
				oData.aAdvMoney.splice(nIdx, 1);
				oData.aAdvMoneyLenght--;
				oVModel.setData(oData);
			} else {
				TCommonSrv._showMsgBox("Error", "Can't delete all row");
			}

		},
		onAdvCurrencyChange: function(oEvent) {
			var oData = oVModel.getData();
			if (oEvent.getParameter('newValue').trim() !== "") {
				var iIndex = StaticUtility.getArrayIndex(oData.aCurrencies, "FIELD1", oEvent.getParameter("newValue"));
				if (iIndex === -1) {
					oEvent.getSource().setValueState("Error");
					TCommonSrv._showMsgBox("Error", "Invalid currency");
				} else {
					oEvent.getSource().setValueState("None");
					oVModel.refresh();
				}
			}

		},
		onAdvanceMoneyChange: function(evt) {
			var oData = oVModel.getData();
			var iIndex = evt.getSource().getId().substr(evt.getSource().getId().length - 1);
			if (isNaN(evt.getParameter("newValue"))) {
				TCommonSrv._showMsgBox("Error", "Invalid Number");
				oData.aAdvMoney[iIndex].ZZ_BODVL1_ERROR = "Error";
			} else {
				if (evt.getSource().getValue().trim() === "") {
					evt.getSource().setValue(0);
				}
				oData.aAdvMoney[iIndex].ZZ_BODVL1 = parseFloat(oData.aAdvMoney[iIndex].ZZ_BODVL1);
				oData.aAdvMoney[iIndex].ZZ_BODVL1_ERROR = "None";
				if (oData.aAdvMoney[iIndex].ZZ_BODVL1 !== 0 && oData.aAdvMoney[iIndex].ZZ_CUR1.trim() === "") {
					oData.aAdvMoney[iIndex].adv_curr_key_error = "Error";
					TCommonSrv._showMsgBox("Error", "Invalid currency");
				} else {
					oData.aAdvMoney[iIndex].adv_curr_key_error = "None";
				}
				oVModel.refresh();
			}
		}
	});
});