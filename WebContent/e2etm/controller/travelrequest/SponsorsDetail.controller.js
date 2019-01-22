// jQuery.sap.require("sap.ui.project.e2etm.util.Formatter");
// jQuery.sap.require("sap.ui.project.e2etm.util.StaticUtility");
// jQuery.sap.require("sap.ca.ui.dialog.factory");
// jQuery.sap.require("sap.m.MessageBox");
// /* Global var */
// var oCommonSrv = sap.ui.project.e2etm.util.TCommonSrv;
// 	var oVModel ="";
// /* End Global var*/

// sap.ui.controller("sap.ui.project.e2etm.controller.travelrequest.SponsorsDetail", {
// 	onInit: function() {
// 	oVModel = TravelRequestThis.getView().getModel("trvRequestDtl");  //eslint-disable-line
// 	}

// });
var SponsorshipThis; //eslint-disable-line
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
	var oVModel = "";
	var sGeber = "";
	/* End Global var*/
	return sap.ui.controller("sap.ui.project.e2etm.controller.travelrequest.SponsorsDetail", {

		formatter: Formatter,
		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function() {
			SponsorshipThis = this; //set global controller
			oVModel = TravelRequestThis.getView().getModel("trvRequestDtl"); //eslint-disable-line

			var oViewModel = new JSONModel({
				busy: false,
				CostAsgn: [{
					ZZ_PERCENT: 100
				}],
				delay: 0
			});

			this._table = this.getView().byId("tabCostAssignment");
			if (this._table) {
				this._table.onAfterRendering = jQuery.proxy(function() {
					if (sap.ui.table.Table.prototype.onAfterRendering) {
						sap.ui.table.Table.prototype.onAfterRendering.apply(this._table, arguments);
					}
					$(".budget_center_read_only>input").attr("readonly", "readonly");
				}, this);
			}
			this.getView().setModel(oViewModel, "sponsorDetail");
			// this.getCostAssignment({});
			// public method for other controller
			var oEventBus = sap.ui.getCore().getEventBus();
			oEventBus.subscribe("Sponsor", "GetCostAssignment", this.getCostAssignment, this);
			// console.log(Formatter, oCommonSrv, oVModel, MessageBox);
		},

		// _GetData: function() {
		// 	var oModel = this.getModel();

		// 	if (sap.ui.getCore().getModel("global").getData().isCreate) {
		// 		var batchOperation7 = oDataModel.createBatchOperation("TRV_HDRSet(ZZ_PERNR='" + screenData.ZZ_DEP_PERNR + "',ZZ_DEP_REQ='" +
		// 			screenData.ZZ_TRV_REQ + "',ZZ_VERSION='',ZZ_TRV_TYP='" + "DEPU" +
		// 			"')?$expand=TRV_HDRtoTRV_COST_ASGN,TRV_HDRtoTRV_travel_Data,TRV_HDRtoTRV_ACCOM,TRV_HDRtoTRV_ADVANCE,DEP_VISA_PLAN", "GET");
		// 	} else {
		// 		var batchOperation7 = oDataModel.createBatchOperation("TRV_HDRSet(ZZ_PERNR='" + screenData.ZZ_DEP_PERNR + "',ZZ_DEP_REQ='" +
		// 			screenData.ZZ_DEP_REQ + "',ZZ_VERSION='',ZZ_TRV_TYP='" + screenData.ZZ_REQ_TYP +
		// 			"')?$expand=TRV_HDRtoTRV_COST_ASGN,TRV_HDRtoTRV_travel_Data,TRV_HDRtoTRV_ACCOM,TRV_HDRtoTRV_ADVANCE,DEP_VISA_PLAN", "GET");
		// 	}
		// 	var sPath = "TRV_HDRSet(ZZ_PERNR='" + screenData.ZZ_DEP_PERNR + "',ZZ_DEP_REQ='" +
		// 			screenData.ZZ_TRV_REQ + "',ZZ_VERSION='',ZZ_TRV_TYP='" + "DEPU" +
		// 			"')?$expand=TRV_HDRtoTRV_COST_ASGN";
		// 		oModel.read(sPath, {
		// 		success: function(data) {

		// 		},error: function(){}
		// 	});
		// },
		// On Add new line in cost assignment
		onCostAssignmentAddPress: function(evt) {
			var oData = this.getView().getModel("sponsorDetail").getProperty("/CostAsgn"); //eslint-disable-line
			var oDataItem = {
				ZZ_PERCENT: 100
			};
			// if (oData.ZZ_TRV_TYP == "SECO") {
			// 	oDataItem.ZZ_GEBER = "F03";
			// 	TravelRequestThis.getView().byId("flexBoxFundF03").setVisible(true);
			// }
			console.log(oData);
			oData.push(oDataItem);
			// oData.TRV_HDRtoTRV_COST_ASGN.results.push(oDataItem);
			// oData.view.costLength++;
			this._table.getModel("sponsorDetail").setProperty("/CostAsgn", oData);
			// TravelRequestThis.getView().getModel().setData(oData);
		},

		// On remove a line in cost assignment
		onCostAssignmentDeletePress: function(evt) {
			var iIndex = this._table.getSelectedIndex();
			if (iIndex !== -1) {
				var oSponsorModel = this.getView().getModel("sponsorDetail");
				var oData = oSponsorModel.getProperty("/CostAsgn");
				switch (oData[iIndex].ZZ_GEBER) {
					case "F03":
						this.getView().byId("flexBoxFundF03").setVisible(false);
						break;
					case "F02":
						this.getView().byId("flexBoxFundF02").setVisible(false);
						this.getView().byId("flexBoxFundF01F02F04").setVisible(false);
						break;
					case "F01":
					case "F04":
						this.getView().byId("flexBoxFundF01F02F04").setVisible(false);
						break;
				}
				/* End-CI Reporting Changes */
				oData.splice(iIndex, 1);
				oSponsorModel.setProperty("/CostAsgn", oData);
				this._table.clearSelection();
			}
		},
		getCostAssignment: function(oData, oVData, oF4Source) {
			var oThis = this;
			var oCostDeferred = $.Deferred();

			if (oData.wbsElement === undefined) {
				// sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oDeputationThis);
				// var oTravelHeader = {
				// 	ZZ_REINR: "0000000000",
				// 	ZZ_PERNR: oData.empDetail.ZZ_DEP_PERNR,
				// 	ZZ_TRV_TYP: "BUSR",
				// 	ZZ_TTYPE: "BUSR",
				// 	ZZ_LAND1: "DE",
				// 	ZZ_BEGDA: "20190928",
				// 	ZZ_ENDDA: "20190929",
				// 	ZZ_DATV1: "20190928",
				// 	ZZ_DATB1: "20190929"
				// };
				var oTravelHeader = oVData.oHeader; //get header
				sGeber = oVData.ZZ_SP_FUND_KEY; //set fund key for global
				var sModId = oVData.TRV_REQ_TYPE;
				var sRequest = oVData.ZZ_TRV_REQ_NUM;
				if (oData.ZZ_MODID === "SECO") {
					sRequest = sap.ui.getCore().getModel("global").getData().ZZ_TRV_REQ;
				}
				var oDataModel = new sap.ui.model.odata.ODataModel(sServiceUrl); //eslint-disable-line
				// var batchOperation0 =
				// oDataModel.createBatchOperation("GetF4Help?Srch_help='ZBUD'&$format=json",
				// "GET");
				// var batchOperation1 =
				// oDataModel.createBatchOperation("GetF4Table?TableName='PRPS'&Col1='PSPNR'&Col2='POSID'&Col3='POST1'&Col4=''&Col5=''&Col6=''&Col7=''&Col8=''&Col9=''&Col10=''&$format=json",
				// "GET");
				var batchOperation0 = oDataModel.createBatchOperation("WBSf4Help?" + "ZZ_REINR='" + sRequest + "'&ZZ_PERNR='" + oTravelHeader.ZZ_PERNR +
					"'&ZZ_TTYPE='" + oTravelHeader.ZZ_TRV_TYP + "'&ZZ_LAND1='" + oTravelHeader.ZZ_LAND1 + "'&$format=json", "GET");
				// TGG1HC
				// var batchOperation0 =
				// oDataModel.createBatchOperation("ZE2E_FUND_CENTERSet","GET");
				// var batchOperation2 =
				// oDataModel.createBatchOperation("GetF4Table?TableName='CSKT'&Col1='KOKRS'&Col2='KOSTL'&Col3='KTEXT'&Col4='LTEXT'&Col5=''&Col6=''&Col7=''&Col8=''&Col9=''&Col10=''&$format=json",
				// "GET");
				var batchOperation1 = oDataModel.createBatchOperation("CostCenterF4Help?" + "ZZ_REINR='" + sRequest + "'&ZZ_TTYPE='" + oTravelHeader
					.ZZ_TRV_TYP +
					"'&ZZ_PERNR='" + oTravelHeader.ZZ_PERNR + "'&ZZ_LAND1='" + oTravelHeader.ZZ_LAND1 + "'&$format=json", "GET");
				var batchOperation2 = oDataModel.createBatchOperation("Fund_F4_Help?ZZ_BEGDA='" + oTravelHeader.ZZ_DATV1 + "'&ZZ_ENDDA='" +
					oTravelHeader.ZZ_DATB1 + "'&$format=json", "GET");
				// var batchOperation3 =
				// oDataModel.createBatchOperation("BudgetCenter_F4_Help?ZZ_BEGDA='"
				// + oData.ZZ_DATV1 + "'&ZZ_ENDDA='" + oData.ZZ_DATB1 +
				// "'&$format=json", "GET");
				// tgg1hc buget center
				var batchOperation3 = oDataModel.createBatchOperation("ZE2E_FUND_CENTERSet", "GET");
				var batchOperation4 = oDataModel.createBatchOperation("VKMNames?VKMName='DE'&$format=json", "GET");
				var batchOperation5 = oDataModel.createBatchOperation("Commit_item_f4?" + "GEBER='" + sGeber + "'&ZZ_SMODID='" + sModId +
					"'&$format=json",
					"GET"); //eslint-disable-line
				oDataModel.addBatchReadOperations([batchOperation0, batchOperation1, batchOperation2, batchOperation3, batchOperation4,
					batchOperation5
				]);
				oDataModel.submitBatch(function(oResult) {
					// Search help for WBS element
					oData.wbsElement = oResult.__batchResponses[0].data.results;
					// Search help for cost center
					oData.costCenter = oResult.__batchResponses[1].data.results;
					// Search help for fund
					oData.fund = oResult.__batchResponses[2].data.results;
					// Search help for budget center
					oData.budgetCenter = oResult.__batchResponses[3].data.results;
					// Search help for VKM
					oData.vkm = oResult.__batchResponses[4].data.results;
					// budget code
					oData.budgetCost = oResult.__batchResponses[5].data.results;

					sap.ui.project.e2etm.util.StaticUtility.showTooltipFund(oData);
					sap.ui.project.e2etm.util.StaticUtility.showTooltipBudgetCode(oData);
					sap.ui.project.e2etm.util.StaticUtility.showTooltipVKM(oData);
					// sap.ui.project.e2etm.util.StaticUtility();
					oThis.getView().getModel("sponsorDetail").setProperty("/F4Value", oData);
					// oThis.getView().getModel().setData(oData);
					// sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oDeputationThis);
					oCostDeferred.resolve();
				}, function(oError) {
					// sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oDeputationThis);
					sap.ca.ui.message.showMessageBox({
						type: sap.ca.ui.message.Type.ERROR,
						message: "Sorry for this inconvenience. Please contact support team",
						details: oError.responseText
					});
				});
			}
			//get data complete
			$.when(oCostDeferred).done(
				function() {
					//set call = true
					oVData.ZZ_SP_F4_CALLED = true;
					oVModel.setData(oVData);
					oThis._updateInitTextField();
					StaticUtility.setBusy(false, TravelRequestThis); //eslint-disable-line

					if (oF4Source) {

						oThis.handleValueHelpData(oF4Source); //all open F4 help
					}
				});
		},

		// F4 
		//set description
		_setFieldText: function(nIdx, sFieldId, sText) {
			var oData = oVModel.getData();
			switch (sFieldId) {
				case "sponsoredId":
					oData.aSponsorshipDtl[nIdx].ZZ_FISTL_TEXT = sText; // Budget Center
					break;
				case "costCenterId":
					oData.aSponsorshipDtl[nIdx].ZZ_KOSTL_TEXT = sText; //cost center
					break;
				case "projectId":
					oData.aSponsorshipDtl[nIdx].ZZ_FIPOS_TEXT = sText; //wbs element
					break;
				case "expenseId":
					oData.aSponsorshipDtl[nIdx].ZZ_FIPEX_TEXT = sText; //budget code
					break;

			}
			oVModel.setData(oData);
		},
		//handle data for value help
		onValueHelpRequest: function(oEvent) {
			StaticUtility.setBusy(true, TravelRequestThis); //eslint-disable-line
			//call reparedata
			var oVData = oVModel.getData();
			//check travelling Detail
			var bValid = TravelRequestDtlThis.validateTravelling(); //eslint-disable-line
			if (bValid) {
				if (oVData.ZZ_SP_F4_CALLED === true) {
					StaticUtility.setBusy(false, TravelRequestThis); //eslint-disable-line
					this.handleValueHelpData(oEvent.oSource); //call open F4 help

				} else {
					//call first time
					this.getCostAssignment({}, oVData, oEvent.oSource);
				}
			} else {
				TCommonSrv._showErrMsgByCode("E08", "V");
				StaticUtility.setBusy(false, TravelRequestThis); //eslint-disable-line
			}
		},
		// Open value help request
		handleValueHelpData: function(oControl) {

			// var oControl = evt.oSource;//temps tinhtd
			var oThis = this;
			var oTemp = {
				ZZ_SMODID: ""
			};
			var aData = this.getView().getModel("sponsorDetail").getProperty("/CostAsgn");
			var aF4Data = this.getView().getModel("sponsorDetail").getProperty("/F4Value");
			var oValueHelpDialog = new sap.ui.comp.valuehelpdialog.ValueHelpDialog({
				supportMultiselect: false,
				cancel: function(oControlEvent) {
					oValueHelpDialog.close();
				},
				change: function() {
					alert("changeDialog");
				},
				afterClose: function() {
					oValueHelpDialog.destroy();

				},
				ok: function(oControlEvent) {
					var sKey = oControlEvent.getParameter("tokens")[0].getProperty("key");
					var sText = oControlEvent.getParameter("tokens")[0].getProperty("text");
					oControl.setValue(sKey);
					var nIdx = oControl.mBindingInfos.value.binding.oContext.sPath.split("/")[2];
					//set description
					oThis._setFieldText(nIdx, oControl.getId().split("-")[2], sText);
					//check validation
					oThis._handleFieldChange(oControlEvent, oControl.getId().split("-")[2], nIdx);
					oValueHelpDialog.close();
				}
			});
			//end add text

			var oRowsModel = new sap.ui.model.json.JSONModel();
			oValueHelpDialog.setModel(oRowsModel);
			oValueHelpDialog.theTable = oValueHelpDialog.getTable();
			oValueHelpDialog.theTable.bindRows("/");
			// sidd code start
			if (oControl.getId().indexOf("vkmId") !== -1) { // vkm
				oThis.setVKMF4(oRowsModel, oValueHelpDialog);
			}
			if (oControl.getId().indexOf("customerId") !== -1) { // Customer search
				// help
				oThis.setCustomerF4(oRowsModel, oValueHelpDialog);
				// oValueHelpDialog.open();//tinhtd disable temp
				oThis._handleBeforeOpenDlg(oValueHelpDialog);
			} else if (oControl.getId().indexOf("FromLocationId") !== -1) {
				oThis.setLocationF4(oRowsModel, oValueHelpDialog, oTemp.ZZ_FMCNTRY);
			} else if (oControl.getId().indexOf("ToLocationId") !== -1) {
				oThis.setLocationF4(oRowsModel, oValueHelpDialog, oTemp.ZZ_LAND1);
			}
			/* Start-CI Reporting Changes */
			else if (oControl.getId().indexOf("ipDivision") !== -1) {
				oThis.setDivisionF4(oRowsModel, oValueHelpDialog, aF4Data);
			} else if (oControl.getId().indexOf("ipDepartment") !== -1) {
				oThis.setDepartmentF4(oRowsModel, oValueHelpDialog, aF4Data);
			} else if (oControl.getId().indexOf("ipGroup") !== -1) {
				oThis.setGroupF4(oRowsModel, oValueHelpDialog, aF4Data);
			}
			/* End-CI Reporting Changes */
			else { // Table columns search help
				//TinhTD Temp
				var oData = oVModel.getData();
				sGeber = oData.ZZ_SP_FUND_KEY; //set fund key for global
				var sModId = oData.TRV_REQ_TYPE;
				// var sControlId = oControl.getId().substr(oControl.getId().length - 9, 4);
				var sControlId = this._GetControlIdNew(oControl.getId().split("-")[2]);
				//End TinhTD

				if (sControlId === "col5") {
					var iIndex = oControl.getId().substring(oControl.getId().indexOf("row") + 3, oControl.getId().length);
					// if (aData[iIndex].ZZ_GEBER === undefined || aData[iIndex].ZZ_GEBER.trim() === "") {
					if (sGeber === undefined || sGeber.trim() === "") {
						sap.m.MessageToast.show("Please enter Fund value");
					} else {
						// sap.ui.project.e2etm.util.StaticUtility.setBusy(true, TravelPlanThis);
						var get = $.ajax({
							cache: false,
							url: sServiceUrl + "Commit_item_f4?" + "GEBER='" + sGeber + "'&ZZ_SMODID='" + sModId + "'&$format=json", //eslint-disable-line
							type: "GET"
						});
						get.fail(function(err) {
							// sap.ui.project.e2etm.util.StaticUtility.setBusy(false, TravelPlanThis);
						});
						get.done(function(result, response, header) {
							aF4Data.budgetCost = result.d.results;
							if (aF4Data.budgetCost.length === 0) {
								sap.m.MessageToast.show("Invalid Fund");
							} else {
								oThis.setColumnF4Table(sControlId, oRowsModel, oValueHelpDialog, oControl);
								// oValueHelpDialog.open();//tinhtd disable temp
								oThis._handleBeforeOpenDlg(oValueHelpDialog);
							}
							// sap.ui.project.e2etm.util.StaticUtility.setBusy(false, TravelPlanThis);
						});
					}
				} else {
					oThis.setColumnF4Table(sControlId, oRowsModel, oValueHelpDialog, oControl);
					// oValueHelpDialog.open();//tinhtd disable temp
					oThis._handleBeforeOpenDlg(oValueHelpDialog);

				}
			}
		},
		setDivisionF4: function(oRowsModel, oValueHelpDialog, data) {
			var oThis = this;
			oValueHelpDialog.setTitle("Division");
			oValueHelpDialog.setKey("Division");
			oValueHelpDialog.theTable.addColumn(new sap.ui.table.Column({
				label: new sap.ui.commons.Label({
					text: "Division"
				}),
				template: new sap.ui.commons.TextView().bindProperty("text", "Division"),
				sortProperty: "Division",
				filterProperty: "Division"
			}));

			if (!(data.hasOwnProperty("CiCustomerDetls"))) {
				this.getCICustomerDetails("Division", oRowsModel, oValueHelpDialog);
			} else {
				oRowsModel.setData(data.CiDivision);
				// oValueHelpDialog.open();//tinhtd disable temp
				oThis._handleBeforeOpenDlg(oValueHelpDialog);
			}
		},
		setDepartmentF4: function(oRowsModel, oValueHelpDialog, data) {
			oValueHelpDialog.setTitle("Department");
			oValueHelpDialog.setKey("Department");
			oValueHelpDialog.theTable.addColumn(new sap.ui.table.Column({
				label: new sap.ui.commons.Label({
					text: "Department"
				}),
				template: new sap.ui.commons.TextView().bindProperty("text", "Department"),
				sortProperty: "Department",
				filterProperty: "Department"
			}));
			oValueHelpDialog.theTable.addColumn(new sap.ui.table.Column({
				label: new sap.ui.commons.Label({
					text: "BU"
				}),
				template: new sap.ui.commons.TextView().bindProperty("text", "BU"),
				sortProperty: "BU",
				filterProperty: "BU"
			}));
			if (!(data.hasOwnProperty("CiCustomerDetls"))) {
				this.getCICustomerDetails("Department", oRowsModel, oValueHelpDialog);
			} else {
				var department = this.getDeptByDivision(data);
				oRowsModel.setData(department);
				oValueHelpDialog.open();
			}
		},
		setGroupF4: function(oRowsModel, oValueHelpDialog, data) {

			oValueHelpDialog.setTitle("Group");
			oValueHelpDialog.setKey("Group");
			oValueHelpDialog.theTable.addColumn(new sap.ui.table.Column({
				label: new sap.ui.commons.Label({
					text: "Group"
				}),
				template: new sap.ui.commons.TextView().bindProperty("text", "Group"),
				sortProperty: "Group",
				filterProperty: "Group"
			}));
			if (!(data.hasOwnProperty("CiCustomerDetls"))) {
				this.getCICustomerDetails("Group", oRowsModel, oValueHelpDialog);
			} else {
				var group = this.getGroupbyDept(data);
				oRowsModel.setData(group);
				oValueHelpDialog.open();
			}
		},

		// sidd code starts
		setVKMF4: function(oRowsModel, oValueHelpDialog) {
			var aData = this.getView().getModel("sponsorDetail").getProperty("/F4Value");
			oValueHelpDialog.setTitle("VKM");
			oValueHelpDialog.setKey("VKMCode");
			oValueHelpDialog.theTable.addColumn(new sap.ui.table.Column({
				label: new sap.ui.commons.Label({
					text: "VKM NAME"
				}),
				template: new sap.ui.commons.TextView().bindProperty("text", "VKMName"),
				sortProperty: "VKMName",
				filterProperty: "VKMName"
			}));
			oValueHelpDialog.theTable.addColumn(new sap.ui.table.Column({
				label: new sap.ui.commons.Label({
					text: "VKM CODE"
				}),
				template: new sap.ui.commons.TextView().bindProperty("text", "VKMCode"),
				sortProperty: "VKMCode",
				filterProperty: "VKMCode"
			}));
			oValueHelpDialog.theTable.addColumn(new sap.ui.table.Column({
				label: new sap.ui.commons.Label({
					text: "DEPARTMENT"
				}),
				template: new sap.ui.commons.TextView().bindProperty("text", "Department"),
				sortProperty: "Department",
				filterProperty: "Department"
			}));
			oValueHelpDialog.theTable.addColumn(new sap.ui.table.Column({
				label: new sap.ui.commons.Label({
					text: "BUSINESS UNIT"
				}),
				template: new sap.ui.commons.TextView().bindProperty("text", "BusinessUnit"),
				sortProperty: "BusinessUnit",
				filterProperty: "BusinessUnit"
			}));
			oRowsModel.setData(aData.vkm);
		},
		// Set location for search help
		setLocationF4: function(oRowsModel, oValueHelpDialog, sCountry) {
			// sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oDeputationThis);
			var get = $.ajax({
				cache: false,
				url: sServiceUrl + "DEP_LOCATIONSSet?$filter=MOLGA eq '" + sCountry + "'&$format=json", //eslint-disable-line
				type: "GET"
			});
			get.done(function(result) {
				if (result !== null) {
					oValueHelpDialog.setTitle("LOCATION");
					oValueHelpDialog.setKey("BLAND");
					oValueHelpDialog.theTable.addColumn(new sap.ui.table.Column({
						label: new sap.ui.commons.Label({
							text: "LOCATION"
						}),
						template: new sap.ui.commons.TextView().bindProperty("text", "BLAND"),
						sortProperty: "BLAND",
						filterProperty: "BLAND"
					}));
					oRowsModel.setData(result.d.results);
					// sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oDeputationThis);
					oValueHelpDialog.open();
				}
			});
			get.fail(function(err) {
				// sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oDeputationThis);
				alert("No location is maintained");
			});
		},
		setColumnF4Table: function(sControlId, oRowsModel, oValueHelpDialog, oControl) {
			var aData = this.getView().getModel("sponsorDetail").getProperty("/F4Value");
			switch (sControlId) {
				case 'col1': // Fund
					oValueHelpDialog.setTitle("FUND");
					oValueHelpDialog.setKey("fincode");
					oValueHelpDialog.setDescriptionKey("beschr");
					oValueHelpDialog.theTable.addColumn(new sap.ui.table.Column({
						label: new sap.ui.commons.Label({
							text: "FUND"
						}),
						filtered: true,
						template: new sap.ui.commons.TextView().bindProperty("text", "fikrs"),
						sortProperty: "fikrs",
						filterProperty: "fikrs"
					}));
					oValueHelpDialog.theTable.addColumn(new sap.ui.table.Column({
						label: new sap.ui.commons.Label({
							text: "NAME"
						}),
						filtered: true,
						template: new sap.ui.commons.TextView().bindProperty("text", "fincode"),
						sortProperty: "fincode",
						filterProperty: "fincode"
					}));
					oValueHelpDialog.theTable.addColumn(new sap.ui.table.Column({
						label: new sap.ui.commons.Label({
							text: "DESCRIPTION"
						}),
						filtered: true,
						template: new sap.ui.commons.TextView().bindProperty("text", "beschr"),
						sortProperty: "beschr",
						filterProperty: "beschr"
					}));

					oRowsModel.setData(aData.fund);
					break;
				case 'col2': // Budget Center

					oValueHelpDialog.setTitle("BUDGET CENTER");
					oValueHelpDialog.setKey("ZzFundC");
					oValueHelpDialog.setDescriptionKey("ZzFundDes");
					oValueHelpDialog.theTable.addColumn(new sap.ui.table.Column({
						label: new sap.ui.commons.Label({
							text: "Department"
						}),
						filtered: true,
						template: new sap.ui.commons.TextView().bindProperty("text", "ZzFundC"),
						sortProperty: "ZzFundC",
						filterProperty: "ZzFundC"
					}));
					oValueHelpDialog.theTable.addColumn(new sap.ui.table.Column({
						label: new sap.ui.commons.Label({
							text: "DESCRIPTION"
						}),
						filtered: true,
						template: new sap.ui.commons.TextView().bindProperty("text", "ZzFundDes"),
						sortProperty: "ZzFundDes",
						filterProperty: "ZzFundDes"
					}));
					// TGG1HC fixing display search help
					var aWBs = [];
					/*if (oControl.getParent().getCells()[1].getValue() === "F02")*/
					// if (oControl.getBindingContext().getModel().getProperty(oControl.getBindingContext().sPath).ZZ_GEBER === "F02") {
					// if (oControl.getParent().getParent().getCells()[1].getItems()[0].getValue() === "F02") {
					if (sGeber === "F02") {
						for (var i = 0; i < aData.budgetCenter.length; i++) {
							if (aData.budgetCenter[i].ZzVkmFund === "X") {
								var oWBs = {
									ZzFundC: "",
									ZzFundDes: "",
									ZzVkmFund: "",
									ZzVkmOwner: ""
								};
								oWBs.ZzFundC = aData.budgetCenter[i].ZzFundC;
								oWBs.ZzFundDes = aData.budgetCenter[i].ZzFundDes;
								oWBs.ZzVkmFund = aData.budgetCenter[i].ZzVkmFund;
								oWBs.ZzVkmOwner = aData.budgetCenter[i].ZzVkmOwner;
								aWBs.push(oWBs);
							}
						}
					} else {
						for (var j = 0; j < aData.budgetCenter.length; j++) {
							if (aData.budgetCenter[j].ZzVkmFund === "") {
								var oWBs = {
									ZzFundC: "",
									ZzFundDes: "",
									ZzVkmFund: "",
									ZzVkmOwner: ""
								};
								oWBs.ZzFundC = aData.budgetCenter[j].ZzFundC;
								oWBs.ZzFundDes = aData.budgetCenter[j].ZzFundDes;
								oWBs.ZzVkmFund = aData.budgetCenter[j].ZzVkmFund;
								oWBs.ZzVkmOwner = aData.budgetCenter[j].ZzVkmOwner;
								aWBs.push(oWBs);
							}
						}
					}
					oRowsModel.setData(aWBs);
					break;
				case 'col3': // WBS Element
					oValueHelpDialog.setTitle("WBS ELEMENT");
					oValueHelpDialog.setKey("ZZ_POSKI");
					oValueHelpDialog.setDescriptionKey("ZZ_POST1");
					oValueHelpDialog.theTable.addColumn(new sap.ui.table.Column({
						label: new sap.ui.commons.Label({
							text: "WBS ELEMENT"
						}),
						filtered: true,
						template: new sap.ui.commons.TextView().bindProperty("text", "ZZ_POSKI"),
						sortProperty: "ZZ_POSKI",
						filterProperty: "ZZ_POSKI"
					}));
					oValueHelpDialog.theTable.addColumn(new sap.ui.table.Column({
						label: new sap.ui.commons.Label({
							text: "DESCRIPTION"
						}),
						filtered: true,
						template: new sap.ui.commons.TextView().bindProperty("text", "ZZ_POST1"),
						sortProperty: "ZZ_POST1",
						filterProperty: "ZZ_POST1"
					}));
					oRowsModel.setData(aData.wbsElement);
					break;
				case 'col4': // Cost center
					oValueHelpDialog.setTitle("COST CENTER");
					oValueHelpDialog.setKey("KOSTL");
					oValueHelpDialog.setDescriptionKey("KTEXT");
					oRowsModel.setData(aData.costCenter);
					oValueHelpDialog.theTable.addColumn(new sap.ui.table.Column({
						label: new sap.ui.commons.Label({
							text: "COST CENTER NAME"
						}),
						filtered: true,
						template: new sap.ui.commons.TextView().bindProperty("text", "VERAK"),
						sortProperty: "VERAK",
						filterProperty: "VERAK"
					}));
					oValueHelpDialog.theTable.addColumn(new sap.ui.table.Column({
						label: new sap.ui.commons.Label({
							text: "DESCRIPTION"
						}),
						filtered: true,
						template: new sap.ui.commons.TextView().bindProperty("text", "KTEXT"),
						sortProperty: "KTEXT",
						filterProperty: "KTEXT"
					}));
					oValueHelpDialog.theTable.addColumn(new sap.ui.table.Column({
						label: new sap.ui.commons.Label({
							text: "COST CENTER"
						}),
						filtered: true,
						template: new sap.ui.commons.TextView().bindProperty("text", "KOSTL"),
						sortProperty: "KOSTL",
						filterProperty: "KOSTL"
					}));

					break;
				case 'col5': // Budget cost
					oValueHelpDialog.setTitle("BUDGET CODE");
					oValueHelpDialog.setKey("FIPEX");
					oValueHelpDialog.setDescriptionKey("ZZ_BUD_DESC");
					oRowsModel.setData(aData.budgetCost);
					oValueHelpDialog.theTable.addColumn(new sap.ui.table.Column({
						label: new sap.ui.commons.Label({
							text: "BUDGET CODE"
						}),
						filtered: true,
						template: new sap.ui.commons.TextView().bindProperty("text", "FIPEX"),
						sortProperty: "FIPEX",
						filterProperty: "FIPEX",
						width: "20%"
					}));
					oValueHelpDialog.theTable.addColumn(new sap.ui.table.Column({
						label: new sap.ui.commons.Label({
							text: "DESCRIPTION"
						}),
						filtered: true,
						template: new sap.ui.commons.TextView().bindProperty("text", "ZZ_BUD_DESC"),
						sortProperty: "ZZ_BUD_DESC",
						filterProperty: "ZZ_BUD_DESC",
						width: "60%"
					}));
					break;
			}
		},

		// Set customer for search help
		setCustomerF4: function(oRowsModel, oValueHelpDialog) {
			var aData = this.getView().getModel("sponsorDetail").getProperty("/F4Value");
			oValueHelpDialog.setTitle("CUSTOMER");
			oValueHelpDialog.setKey("NAME1");
			oValueHelpDialog.theTable.addColumn(new sap.ui.table.Column({
				width: "170px",
				label: new sap.ui.commons.Label({
					text: "CUSTOMER NAME"
				}),
				template: new sap.ui.commons.TextView().bindProperty("text", "NAME1"),
				sortProperty: "NAME1",
				filterProperty: "NAME1"
			}));
			oValueHelpDialog.theTable.addColumn(new sap.ui.table.Column({
				width: "170px",
				label: new sap.ui.commons.Label({
					text: "CUSTOMER NO"
				}),
				template: new sap.ui.commons.TextView().bindProperty("text", "KUNNR"),
				sortProperty: "KUNNR",
				filterProperty: "KUNNR"
			}));
			oValueHelpDialog.theTable.addColumn(new sap.ui.table.Column({
				width: "170px",
				label: new sap.ui.commons.Label({
					text: "COUNTRY"
				}),
				template: new sap.ui.commons.TextView().bindProperty("text", {
					path: "LAND1",
					formatter: function(fValue) {
						if (fValue) {
							return sap.ui.project.e2etm.util.Formatter.formatCountry(fValue);
						}
						return "0";
					}
				}),
				sortProperty: "LAND1",
				filterProperty: "LAND1"
			}));
			oValueHelpDialog.theTable.addColumn(new sap.ui.table.Column({
				width: "170px",
				label: new sap.ui.commons.Label({
					text: "CITY"
				}),
				template: new sap.ui.commons.TextView().bindProperty("text", "ORT01"),
				sortProperty: "ORT01",
				filterProperty: "ORT01"
			}));
			oValueHelpDialog.theTable.addColumn(new sap.ui.table.Column({
				width: "170px",
				label: new sap.ui.commons.Label({
					text: "POSTAL CODE"
				}),
				template: new sap.ui.commons.TextView().bindProperty("text", "PSTLZ"),
				sortProperty: "PSTLZ",
				filterProperty: "PSTLZ"
			}));
			oValueHelpDialog.theTable.addColumn(new sap.ui.table.Column({
				width: "170px",
				label: new sap.ui.commons.Label({
					text: "HOME ADDRESS"
				}),
				template: new sap.ui.commons.TextView().bindProperty("text", "STRAS"),
				sortProperty: "STRAS",
				filterProperty: "STRAS"
			}));
			oValueHelpDialog.theTable.addColumn(new sap.ui.table.Column({
				width: "170px",
				label: new sap.ui.commons.Label({
					text: "SEARCH TERM"
				}),
				template: new sap.ui.commons.TextView().bindProperty("text", "SORTL"),
				sortProperty: "SORTL",
				filterProperty: "SORTL"
			}));
			oValueHelpDialog.theTable.addColumn(new sap.ui.table.Column({
				width: "170px",
				label: new sap.ui.commons.Label({
					text: "PHONE NO"
				}),
				template: new sap.ui.commons.TextView().bindProperty("text", "TELF1"),
				sortProperty: "TELF1",
				filterProperty: "TELF1"
			}));
			oRowsModel.setData(aData.customer);
		},
		/* TinhTD Handle */
		_handleBeforeOpenDlg: function(oValueHelpDialog) {

			oValueHelpDialog.open();
			//add hint text 
			var sTableId = oValueHelpDialog.theTable.getId();
			$("<span class='sp_hint_fade'>Please on the column name to filter the value</span>").insertBefore("#" + sTableId);
		},
		_GetControlIdNew: function(sId) {
			var sCid = "col1";
			switch (sId) {
				case "sponsoredId":
					sCid = "col2"; // Budget Center
					break;
				case "costCenterId":
					sCid = "col4"; //cost center
					break;
				case "projectId":
					sCid = "col3"; //wbs element
					break;
				case "expenseId":
					sCid = "col5"; //budget code
					break;

			}
			return sCid;
		},
		_updateSummary: function(oData) {
			var aSponsorshipDtl = oData.aSponsorshipDtl;
			var sText = "",
				nFund = 0,
				nTotal = 0,
				aFundSel = [];
			for (var i = 0; i < aSponsorshipDtl.length; i++) {
				if (aSponsorshipDtl[i].ZZ_PERCENT.toString() !== "0" && aSponsorshipDtl[i].ZZ_PERCENT.toString() !== "") {
					sText += aSponsorshipDtl[i].ZZ_GEBER + "->" + aSponsorshipDtl[i].ZZ_PERCENT + "%,";
					nFund += 1;
					nTotal += parseInt(aSponsorshipDtl[i].ZZ_PERCENT);

					if (aFundSel.indexOf(aSponsorshipDtl[i].ZZ_GEBER) === -1) {
						aFundSel.push(aSponsorshipDtl[i].ZZ_GEBER);
					}
				}
			}
			sText = sText.substring(0, sText.length - 1) + " - ";
			sText = sText + "Remain:" + (100 - nTotal) + "%";
			var oHeadSum = this.getView().byId("spHeader");
			if (nTotal === 100) {
				//success
				oHeadSum.removeStyleClass("red_bold_text");
				oHeadSum.addStyleClass("green_bold_text");
			} else {
				//error
				oHeadSum.addStyleClass("red_bold_text");
				oHeadSum.removeStyleClass("green_bold_text");
			}
			oData.aFunTotal = nTotal;
			oData.aFundSelect = aFundSel;
			oData.sponsorshipText = sText;
		},
		//count total percent sponsor
		_getTotalPercent: function(oData) {
			var aSponsorshipDtl = oData.aSponsorshipDtl;
			var nTotal = 0;
			for (var i = 0; i < aSponsorshipDtl.length; i++) {
				if (aSponsorshipDtl[i].ZZ_PERCENT.toString() !== "0" && aSponsorshipDtl[i].ZZ_PERCENT.toString() !== "") {
					nTotal += parseInt(aSponsorshipDtl[i].ZZ_PERCENT);
				}
			}
			return nTotal;
		},
		onChangeFundCenter: function(oEvent) {
			var oData = oVModel.getData();
			var oFund = oEvent.getSource();
			var nTotal = this._getTotalPercent(oData);
			if (oData.ZZ_SP_VALID === true) {
				if (nTotal === 100 && (oData.aFundSelect.indexOf(oFund.getSelectedKey()) === -1)) {
					TCommonSrv._showMsgBox("INFORMATION", "Total percent must be 100%, can't add more sponsorship", "SUCCESS");
					oFund.setSelectedKey(oData.ZZ_SP_CURR_KEY);
				} else {
					if (nTotal > 100) {
						TCommonSrv._showMsgBox("INFORMATION", "Total percent must be 100%, Pleae check again", "ERROR");
						oFund.setSelectedKey(oData.ZZ_SP_CURR_KEY);
					} else {
						oData.ZZ_SP_FUND_KEY = oFund.getSelectedKey();
						oData.ZZ_SP_CURR_KEY = oFund.getSelectedKey();
						this._handleSponsorshipDtl(oFund.getSelectedKey());
						this._updateSummary(oData);
						oVModel.setData(oData);

					}
				}
			} else {
				TCommonSrv._showErrMsgByCode("E12", "V");
				oFund.setSelectedKey(oData.ZZ_SP_CURR_KEY);
			}

		},
		//check location
		onAllocationChange: function() {
			var oData = oVModel.getData();
			this._updateSummary(oData);
		},
		_getAllItemsByFund: function(aItems, sFKey) {
			var aFItems = [];
			for (var i = 0; i < aItems.length; i++) {

				if (aItems[i].ZZ_GEBER === sFKey) {
					aItems[i].ZZ_FUND_ITEMS_VISIBLE = true;
					aFItems.push(aItems[i]);
				}

			}
			//set last item expanded
			var aFLen = aFItems.length;
			if (aFLen > 1) {
				aFItems[aFLen - 1].ZZ_EXPANDED = true;
				aFItems[aFLen - 1].ZZ_VISIBLE = false;
			} else {
				aFItems[0].ZZ_EXPANDED = true;
				aFItems[0].ZZ_VISIBLE = false;
			}
			return aFItems;
		},
		_handleSponsorshipDtl: function(sFKey) {
			var oData = oVModel.getData();
			var aSponsorshipDtl = oData.aSponsorshipDtl;

			var aTemps = [],
				aFTemps = [],
				bHasRow = false;
			for (var i = 0; i <= aSponsorshipDtl.length; i++) {
				//check and add different fund center
				if (aSponsorshipDtl[i] !== undefined) {
					if (aSponsorshipDtl[i].ZZ_GEBER === sFKey) {
						bHasRow = true;
						aFTemps = this._getAllItemsByFund(aSponsorshipDtl, sFKey);
					} else {
						aSponsorshipDtl[i].ZZ_FUND_ITEMS_VISIBLE = false;
						aSponsorshipDtl[i].ZZ_EXPANDED = false;
						aSponsorshipDtl[i].ZZ_VISIBLE = false;
						aTemps.push(aSponsorshipDtl[i]);
					}
				}
			}
			//add new row if empty
			if (bHasRow === false) {
				var oSpRow = TCommonSrv.buildSponsorDtlEmpRow(sFKey);
				oSpRow.ZZ_FUND_ITEMS_VISIBLE = true;
				aTemps.push(oSpRow);
			}
			oData.aSponsorshipDtl = aFTemps.concat(aTemps);
			oVModel.setData(oData);
		},
		addSponsorshipDtl: function() {

			var oData = oVModel.getData(),
				oSpRow = TCommonSrv.buildSponsorDtlEmpRow(oData.ZZ_SP_FUND_KEY);
			for (var i = 0; i < oData.aSponsorshipDtl.length; i++) {
				oData.aSponsorshipDtl[i].ZZ_EXPANDED = false;
				oData.aSponsorshipDtl[i].ZZ_VISIBLE = false;
			}
			oData.aSponsorshipDtl.push(oSpRow);
			oData.aSponsorshipLen++;
			oVModel.setData(oData);
		},
		remSponsorshipDtl: function() {
			var oData = oVModel.getData();
			if (oData.aSponsorshipDtl.length > 1) {
				var nLastLen = oData.aSponsorshipDtl.length - 1;
				// oData.aSponsorshipDtl.splice(nLastLen, 1);
				// oData.aSponsorshipDtl[nLastLen - 1].ZZ_EXPANDED = true;
				// oData.aSponsorshipDtl[nLastLen - 1].ZZ_VISIBLE = true;
				var aFItems = this._changeItemProperty(oData, "rem");
				oData.aSponsorshipDtl = aFItems;

			} else {
				TCommonSrv._showMsgBox("Error", "Can't delete all row");

			}
			oVModel.setData(oData);
		},
		onSponsorshipExpand: function(oEvent) {

		},
		_changeItemProperty: function(oData, sRType) {
			var result = [],
				aTemps = [],
				sFKey = oData.ZZ_SP_FUND_KEY;

			oData.aSponsorshipDtl.forEach(function(o) {
				if (o.ZZ_GEBER === sFKey) {
					result.push(o);
				} else {
					aTemps.push(o);
				}

			});
			//change property for item
			var aFLen = result.length;
			if (sRType === "add") {

				if (aFLen > 1) {
					// result[aFLen - 1].ZZ_TB_VISIBLE = false;
					result[aFLen - 1].ZZ_EXPANDED = false;
					result[aFLen - 1].ZZ_VISIBLE = true;
				} else {
					// result[0].ZZ_TB_VISIBLE = false;
					result[0].ZZ_EXPANDED = false;
					result[0].ZZ_VISIBLE = true;
				}
			} else if (sRType === "clear") {
				//clear value
				if (aFLen > 1) {
					result[aFLen - 1].ZZ_PERCENT = ""; // location
					result[aFLen - 1].ZZ_FISTL = ""; // sponsored
					result[aFLen - 1].ZZ_KOSTL = ""; // costcenter
					result[aFLen - 1].ZZ_FIPOS = ""; // project
					result[aFLen - 1].ZZ_FIPEX = ""; // expense type
					result[aFLen - 1].ZZ_FISTL_TEXT = "";
					result[aFLen - 1].ZZ_KOSTL_TEXT = "";
					result[aFLen - 1].ZZ_FIPOS_TEXT = "";
					result[aFLen - 1].ZZ_FIPEX_TEXT = "";
					result[aFLen - 1].ZZ_CCNAME = "";
					result[aFLen - 1].ZZ_CCDEPT = "";
					result[aFLen - 1].ZZ_EANO = "";
					result[aFLen - 1].ZZ_PONO = "";
					result[aFLen - 1].ZZ_CCOST = "";

				} else {
					result[0].ZZ_PERCENT = ""; // location
					result[0].ZZ_FISTL = ""; // sponsored
					result[0].ZZ_KOSTL = ""; // costcenter
					result[0].ZZ_FIPOS = ""; // project
					result[0].ZZ_FIPEX = ""; // expense type
					result[0].ZZ_FISTL_TEXT = "";
					result[0].ZZ_KOSTL_TEXT = "";
					result[0].ZZ_FIPOS_TEXT = "";
					result[0].ZZ_FIPEX_TEXT = "";
					result[0].ZZ_CCNAME = "";
					result[0].ZZ_CCDEPT = "";
					result[0].ZZ_EANO = "";
					result[0].ZZ_PONO = "";
					result[0].ZZ_CCOST = "";
				}
			} else {
				//rem item
				if (aFLen > 1) {
					result.splice(aFLen - 1, 1);
					result[aFLen - 2].ZZ_TB_VISIBLE = true;
					result[aFLen - 2].ZZ_EXPANDED = true;
					result[aFLen - 2].ZZ_VISIBLE = true;
				} else {
					result.splice(0, 1);
				}
			}
			return result.concat(aTemps);

		},
		clearSponsorInfoHandl: function() {
			var oData = oVModel.getData();

			var aFItems = this._changeItemProperty(oData, "clear");
			oData.aSponsorshipDtl = aFItems;
			this._updateSummary(oData);
			oVModel.setData(oData);
		},
		addSponsorInfoHandl: function() {
			var oData = oVModel.getData();
			if (oData.ZZ_SP_VALID === true) {
				//show msg
				MessageToast.show("Add Record Successfully");

				//handle show add button
				var aFItems = this._changeItemProperty(oData, "add");
				oData.aSponsorshipDtl = aFItems;
				this._updateSummary(oData);
				oVModel.setData(oData);
			} else {
				TCommonSrv._showErrMsgByCode("E12", "V");
			}

		},
		//handle validation sponsor ship detail
		_handleFieldChange: function(oEvent, sCxId, nCIdx) {

			var oData = oVModel.getData();
			//set id and index from value help
			var sCId = sCxId;
			var nIdx = nCIdx;
			//check function call is change or submit
			if (oEvent.sId === "change" || oEvent.sId === "submit") {
				nIdx = oEvent.getSource().mBindingInfos.value.binding.oContext.sPath.split("/")[2];
				sCId = oEvent.getSource().getId().split("-")[2];
			}
			var sMsgCode = "";
			var bValid = TravelRequestDtlThis.validateTravelling(); //eslint-disable-line
			var oCurrEdit = oData.aSponsorshipDtl[nIdx];
			if (bValid) {

				var oF4Val = this.getView().getModel("sponsorDetail").getData().F4Value;
				switch (sCId) {
					case "allocationId":
						var nTotal = this._getTotalPercent(oData);
						if (oCurrEdit.ZZ_PERCENT.toString() !== "") {
							if (oCurrEdit.ZZ_PERCENT.toString() === "0") {
								sMsgCode = "E05";
								oData.aSponsorshipDtl[nIdx].ZZ_PERCENT_ERROR = "Error";
							} else {

								if (parseInt(oCurrEdit.ZZ_PERCENT) > 100 || parseInt(nTotal) > 100) {
									sMsgCode = "E05";
									oData.aSponsorshipDtl[nIdx].ZZ_PERCENT_ERROR = "Error";
								} else {

									oData.aSponsorshipDtl[nIdx].ZZ_PERCENT_ERROR = "None";
								}
							}
						} else {
							sMsgCode = "E05";
							oData.aSponsorshipDtl[nIdx].ZZ_PERCENT_ERROR = "Error";
						}
						break;
					case "sponsoredId":

						if (oCurrEdit.ZZ_FISTL.toString() !== "") {
							var aBudgets = oF4Val.budgetCenter;
							var oExistFistl = TCommonSrv.checkExistingArray(aBudgets, "ZzFundC", oCurrEdit.ZZ_FISTL.toString().toLocaleUpperCase());
							if (oExistFistl === undefined) {
								sMsgCode = "E06";
								oData.aSponsorshipDtl[nIdx].ZZ_FISTL_ERROR = "Error";
							} else {
								oCurrEdit.ZZ_FISTL = oCurrEdit.ZZ_FISTL.toString().toLocaleUpperCase();
								oData.aSponsorshipDtl[nIdx].ZZ_FISTL_ERROR = "None";
							}
						} else {
							sMsgCode = "E07";
							oData.aSponsorshipDtl[nIdx].ZZ_FISTL_ERROR = "Error";
						}
						break;
					case "costCenterId":
						var aCost = oF4Val.costCenter;
						var oExistKostl = TCommonSrv.checkExistingArray(aCost, "KOSTL", oCurrEdit.ZZ_KOSTL.toString().toLocaleUpperCase());
						if (oCurrEdit.ZZ_KOSTL.toString() !== "") {
							if (oExistKostl === undefined) {
								sMsgCode = "E09";
								oData.aSponsorshipDtl[nIdx].ZZ_KOSTL_ERROR = "Error";
							} else {
								oCurrEdit.ZZ_KOSTL = oCurrEdit.ZZ_KOSTL.toString().toLocaleUpperCase();
								oData.aSponsorshipDtl[nIdx].ZZ_KOSTL_ERROR = "None";
							}
						} else {
							sMsgCode = "E07";
							oData.aSponsorshipDtl[nIdx].ZZ_KOSTL_ERROR = "Error";
						}
						break;
					case "projectId":

						if (oCurrEdit.ZZ_FIPOS.toString() !== "") {
							var aWbs = oF4Val.wbsElement;
							var oExistFipos = TCommonSrv.checkExistingArray(aWbs, "ZZ_POSKI", oCurrEdit.ZZ_FIPOS.toString().toLocaleUpperCase());
							if (oExistFipos === undefined) {
								sMsgCode = "E10";
								oData.aSponsorshipDtl[nIdx].ZZ_FIPOS_ERROR = "Error";
							} else {
								oCurrEdit.ZZ_FIPOS = oCurrEdit.ZZ_FIPOS.toString().toLocaleUpperCase();
								oData.aSponsorshipDtl[nIdx].ZZ_FIPOS_ERROR = "None";
							}
						} else {
							sMsgCode = "E07";
							oData.aSponsorshipDtl[nIdx].ZZ_FIPOS_ERROR = "Error";
						}
						break;
					case "expenseId":

						if (oCurrEdit.ZZ_FIPEX.toString() !== "") {
							var aBudget = oF4Val.budgetCost;
							var oExistFipex = TCommonSrv.checkExistingArray(aBudget, "FIPEX", oCurrEdit.ZZ_FIPEX.toString().toLocaleUpperCase());
							if (oExistFipex === undefined) {
								sMsgCode = "E11";
								oData.aSponsorshipDtl[nIdx].ZZ_FIPEX_ERROR = "Error";
							} else {
								oCurrEdit.ZZ_FIPEX = oCurrEdit.ZZ_FIPEX.toString().toLocaleUpperCase();
								oData.aSponsorshipDtl[nIdx].ZZ_FIPEX_ERROR = "None";
							}
						} else {
							sMsgCode = "E07";
							oData.aSponsorshipDtl[nIdx].ZZ_FIPEX_ERROR = "Error";
						}
						break;

				}

				if (sMsgCode !== "") {
					oData.ZZ_SP_VALID = false;
					TCommonSrv._showErrMsgByCode(sMsgCode, "V");
				} else {
					oData.ZZ_SP_VALID = true;
				}
				//update summary of cost assignment
				this._updateSummary(oData);

				//check total
				if (parseInt(oData.aFunTotal) === 100) {
					oCurrEdit.ZZ_TB_VISIBLE = false;
				} else {
					oCurrEdit.ZZ_TB_VISIBLE = true;

				}

			} else {
				TCommonSrv._showErrMsgByCode("E08", "V");
				StaticUtility.setBusy(false, TravelRequestThis); //eslint-disable-line
			}
		},
		_checkSponsorship: function(sField, nIdx) {
			var oData = oVModel.getData();
			// var aSponsorship = oData.aSponsorshipDtl;
			// var oCurrEdit = TCommonSrv.findFundSelected(aSponsorship,oData.ZZ_SP_CURR_KEY);  
			var oCurrEdit = oData.aSponsorshipDtl[nIdx];

			var sMsgCode = "";
			switch (sField) {
				case "allocationId":
					if (oCurrEdit.ZZ_PERCENT.toString() !== "") {
						if (oCurrEdit.ZZ_PERCENT.toString() === "0") {
							sMsgCode = "E05";
							oData.aSponsorshipDtl[nIdx].ZZ_PERCENT_ERROR = "Error";
						} else {
							oData.aSponsorshipDtl[nIdx].ZZ_PERCENT_ERROR = "None";
						}
					} else {
						sMsgCode = "E05";
						oData.aSponsorshipDtl[nIdx].ZZ_PERCENT_ERROR = "Error";
					}
					break;
				case "sponsoredId":
					if (oCurrEdit.ZZ_FISTL.toString() !== "") {
						if (!oCurrEdit.ZZ_FISTL) {
							sMsgCode = "E06";
							oData.aSponsorshipDtl[nIdx].ZZ_FISTL_ERROR = "Error";
						} else {

							oData.aSponsorshipDtl[nIdx].ZZ_FISTL_ERROR = "None";
						}
					} else {
						sMsgCode = "E07";
						oData.aSponsorshipDtl[nIdx].ZZ_FISTL_ERROR = "Error";
					}
					break;

			}
			oVModel.setData(oData);
			return sMsgCode;
		},
		//Upadte text for field when screen init
		_updateInitTextField: function() {
			var oSVM = this.getView().getModel("sponsorDetail");
			var oData = oVModel.getData();
			var oSD = oSVM.getData();
			var aBudgets = oSD.F4Value.budgetCenter;
			var oSponsor = oData.aSponsorshipDtl[0];
			var oExistFistl = TCommonSrv.checkExistingArray(aBudgets, "ZzFundC", oSponsor.ZZ_FISTL.toString().toLocaleUpperCase());
			var aCost = oSD.F4Value.costCenter;
			var oExistKostl = TCommonSrv.checkExistingArray(aCost, "KOSTL", oSponsor.ZZ_KOSTL.toString().toLocaleUpperCase());
			if (oExistFistl) {

				this._setFieldText(0, "sponsoredId", oExistFistl.ZzFundDes);
			}
			if (oExistKostl) {

				this._setFieldText(0, "costCenterId", oExistKostl.KTEXT);
			}
			this._setFieldText(0, "expenseId", "TRAVEL-FOREIGN (106)");

		}
		/* End tinhtd */
	});
});