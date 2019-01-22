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
	var aAccom = "accmDomArrange",
		oVModel = "";
	/* End Global var*/
	return sap.ui.controller("sap.ui.project.e2etm.controller.travelrequest.AccmDOM", {

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

			this._initScreenData();
		},
		/* Load adv data */
		_loadAccmData: function() {
			var oData = oVModel.getData(),
				aAccomodation = [];
			var oAcmRow = {
				ZZ_ZPLACE: "",
				ZZ_BEGDA_VALUE: Formatter.ymToDMY(oData.oHeader.ZZ_BEGDA),
				ZZ_ENDDA_VALUE: Formatter.ymToDMY(oData.oHeader.ZZ_ENDDA),
				enabled: true
			};

			//handle call odata later
			if (oData.aAccomodation === undefined || oData.aAccomodation.length === 0) {
				//push empty row
				aAccomodation.push(oAcmRow);
				oData.aAccomodation = aAccomodation;
			}
			oData.nAccomodationLenght = oData.aAccomodation.length;
			oVModel.setData(oData);

		},
		/*Handle show hide from init */
		_initScreenData: function() {
			var oData = oVModel.getData();
			if (oData.EDIT_MODE === false) {
				oData.ZZ_ACCM_REQ_ENB = false;
				oVModel.setData(oData);
				// this._loadAccmData();
				//hide arrange tbl
				this._showHideArrange(false);
			}

		}
		/* Handle show hide arrange */
		,
		_showHideArrange: function(bSwitch) {
			TCommonSrv._handleShowHideObj(aAccom, bSwitch, this, TravelRequestThis); //eslint-disable-line

		}
		/* Handle change advance money DOM */
		,
		_handleChangeAccmArrange: function(oEvent) {
			//hot fix
			// if (oEvent.getParameter('state')) {
			// 	this.$().find('.sapMSwtTextOff').css('display', 'none');
			// 	this.$().find('.sapMSwtTextOn').css('display', 'inherit');
			// } else {
			// 	this.$().find('.sapMSwtTextOn').css('display', 'none');
			// 	this.$().find('.sapMSwtTextOff').css('display', 'inherit');
			// }

			var oData = oVModel.getData(),
				oControl = oEvent.getSource();
			var bValid = TravelRequestDtlThis.validateTravelling(); //eslint-disable-line
			if (bValid) {
				var bState = oEvent.getSource().getState();
				oData.ZZ_ACCM_REQ_ENB = bState;
				this._showHideArrange(bState);
				if (bState === true && !oData.aAccomodation) {
					this.addAccmRow();
				}
				oData.nAccomodationLenght = oData.aAccomodation.length;
				TCommonSrv._switchInject(bState, 0);
			} else {
				oControl.setState(false);
				TCommonSrv._switchInject(false, 0);
				TCommonSrv._showErrMsgByCode("E08", "V");
			}

		},
		/* add new row */
		addAccmRow: function() {
			var oData = oVModel.getData();
			var oAcmRow = {
				ZZ_ZPLACE: "",
				ZZ_BEGDA_VALUE: Formatter.ymToDMY(oData.oHeader.ZZ_BEGDA),
				ZZ_ENDDA_VALUE: Formatter.ymToDMY(oData.oHeader.ZZ_ENDDA),
				enabled: true
			};
			if (!oData.aAccomodation) {
				oData.aAccomodation = [];
			}
			oData.aAccomodation.push(oAcmRow);
			oData.nAccomodationLenght++;
			oVModel.setData(oData);
		},
		/* add cc money row */
		deleteAccmMoneyRow: function(oEvent) {
			var oData = oVModel.getData(),
				oRow = oEvent.getSource().getParent().getParent(),
				nIdx = oRow.getIndex();
			if (oData.aAccomodation.length > 1) {
				oData.aAccomodation.splice(nIdx, 1);
				oData.nAccomodationLenght--;
				oVModel.setData(oData);
			} else {
				TCommonSrv._showMsgBox("Error", "Can't delete all row");
			}

		},
		onChangeAccmDateFrom: function(oEvent) {
			var oData = oVModel.getData(),
				iIndex = oEvent.getSource().getId().substr(oEvent.getSource().getId().length - 1);
			var sAdf = oEvent.getParameter('newValue').trim();
			oData.aAccomodation[iIndex].ZZ_BEGDA_VALUE = sAdf;
			oVModel.setData(oData);

		},
		onChangeAccmDateTo: function(oEvent) {
			var oData = oVModel.getData(),
				iIndex = oEvent.getSource().getId().substr(oEvent.getSource().getId().length - 1);
			var sAdt = oEvent.getParameter('newValue').trim();
			oData.aAccomodation[iIndex].ZZ_ENDDA_VALUE = sAdt;
			oVModel.setData(oData);

		}

	});
});