var TrvSimCardThis;
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
	var aSIMComps = "simTypeL,simType,simDataL,simData",
		oVModel = "";
	/* End Global var*/
	return sap.ui.controller("sap.ui.project.e2etm.controller.travelrequest.SIMCard", {

		formatter: Formatter,
		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */

		onInit: function() {
			TrvSimCardThis = this;
			//call global model
			oVModel = TravelRequestThis.getView().getModel("trvRequestDtl"); //eslint-disable-line

			//init data for component
			this._initScreenData();
		},
		/*Handle show hide from init */
		_initScreenData: function() {
			var simReqKey = oVModel.getData().ZZ_SIM_REQ_KEY;
			var oSimReq = this.getView().byId("simReq");

			//set state for sim request
			if (simReqKey === "Y") {

				oSimReq.setState(true);
				this._setDefaultSelectVal(aSIMComps);
			} else {

				oSimReq.setState(false);
			}

			//show hide set defaul data for selection

			TCommonSrv._handleShowHideObj(aSIMComps, oSimReq.getState(), this, TravelRequestThis); //eslint-disable-line

		},
		/*set default select */
		_getSelIdx: function(sVal, sType) {
			var sKey = 0;
			if (sType === "st") {
				switch (sVal) {
					case "NO":
						sKey = 1;
						break;
					case "MI":
						sKey = 2;
						break;
					case "NA":
						sKey = 3;
						break;
				}
			} else {
				switch (sVal) {
					case "Y":
						sKey = 1;
						break;
					case "N":
						sKey = 2;
						break;
				}
			}

			return sKey;
		},
		_setDefaultSelectVal: function(aId) {
			var oData = oVModel.getData();
			var sRStatus = "";
			if (oData.ZZ_STATUS !== undefined) {
				sRStatus = oData.ZZ_STATUS.substring(2, oData.ZZ_STATUS.length);
			}
			if (sRStatus !== "003") {
				//for create and save
				oData.ZZ_SIM_TYP_KEY = "P";
				oData.ZZ_SIM_DATA_KEY = "P";
				//UI
				var aIds = aId.split(",");
				if (aIds.length > 0) {
					for (var i = 0; i < aIds.length; i++) {
						var sId = aIds[i];
						if (sId !== "simTypeL" && sId !== "simDataL") {

							var oObj = this.getView().byId(sId);
							var oFItem = oObj.getItems()[0];
							// if (oData.ZZ_STATUS.substring(2, oData.ZZ_STATUS.length) === "003") {
							// 	var nIdx = this._getSelIdx(oData.ZZ_SIM_TYP_KEY, "st");
							// 	if (sId === "simData") {
							// 		nIdx = this._getSelIdx(oData.ZZ_SIM_DATA_KEY, "sd");
							// 	}
							// 	oFItem = oObj.getItems()[nIdx];
							// }
							oObj.setSelectedItem(oFItem, true);
						}

					}
				}
			} else {

				var oSimReq = this.getView().byId("simReq");
				if (oData.ZZ_SIM_REQ_KEY === "Y") {

					oSimReq.setState(true);
				} else {

					oSimReq.setState(false);

				}

			}

			oVModel.setData(oData);

		},
		/* Set select value */
		_setSelectVal: function(sType, sKey) {
			var oData = oVModel.getData();
			switch (sType) {
				case "sr":
					//sim request
					oData.ZZ_SIM_REQ_KEY = sKey;
					break;
				case "st":
					//sim type
					oData.ZZ_SIM_TYP_KEY = sKey;
					break;
				case "sd":
					//sim data
					oData.ZZ_SIM_DATA_KEY = sKey;
					break;

			}
			oVModel.setData(oData);
		},
		/*Handle sim change */
		onSimcardChange: function(oEvent) {
			var oControl = oEvent.getSource();
			var bValid = TravelRequestDtlThis.validateTravelling(); //eslint-disable-line
			if (bValid) {
				var bState = oControl.getState();

				if (bState === true) {
					this._setSelectVal("sr", "Y");
					this._setDefaultSelectVal(aSIMComps);
					TCommonSrv._handleShowHideObj(aSIMComps, bState, this, TravelRequestThis); //eslint-disable-line
				} else {
					this._setSelectVal("sr", "N");
					TCommonSrv._handleShowHideObj(aSIMComps, bState, this, TravelRequestThis); //eslint-disable-line
				}
				//switch css inject
				TCommonSrv._switchInject(bState, 1);
			} else {
				oControl.setState(false);
				//switch css inject
				TCommonSrv._switchInject(false, 1);
				TCommonSrv._showErrMsgByCode("E08", "V");
			}

		}
		/*Handle sim type change */
		,
		onSIMTypeSelect: function(oEvent) {
			var sKey = oEvent.getSource().getSelectedItem().getKey();
			this._setSelectVal("st", sKey);
		}
		/*Handle sim data change */
		,
		onSIMDataSelect: function(oEvent) {
			var sKey = oEvent.getSource().getSelectedItem().getKey();
			this._setSelectVal("sd", sKey);
		}

	});
});