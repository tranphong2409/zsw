/* Global var */
var PassportVisaThis; //eslint-disable-line
/* End Global var*/

/*global history */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/project/e2etm/util/Formatter",
	"sap/ui/project/e2etm/util/StaticUtility",
	"sap/ca/ui/dialog/factory",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",
	"sap/ui/project/e2etm/util/TCommonSrv"
], function(Controller, Formatter, StaticUtility, Factory, Filter, FilterOperator, MessageBox, TCommonSrv) {
	"use strict";
	var oVModel = "";
	var sRequestPassengerVisaFragment = "sap.ui.project.e2etm.fragment.travel.request.pv/";

	return Controller.extend("sap.ui.project.e2etm.controller.travelrequest.PVDetail", {
		onInit: function() {
			//call global model
			oVModel = TravelRequestThis.getView().getModel("trvRequestDtl"); //eslint-disable-line
			PassportVisaThis = this;
			var model = new sap.ui.model.json.JSONModel({
				selfVisa: "",
				visaExistingDependent: []
			});
			this.getView().setModel(model);
			// var oVM=this.getView().getModel(),
			// 	oVD = oVM.getData();
			// 	oVD.visaExistingDependent = [];
			// console.log(MessageBox);
			// console.log("asda", this, TravelRequestThis);
			this.getPassportData();
		},
		setVPHeader: function(oData) {
			var oVM = PassportVisaThis.getView().getModel(), //eslint-disable-line
				oVD = oVM.getData();

			oVD.selfVisa = {
				"ZZ_CURR_VISA_TYP": "BUSR",
				"ZZ_VISA_CAT": "BUSR",
				"ZZ_VISA_TOCNTRY": oData.oHeader.ZZ_LAND1,
				"ZZ_VISA_FCNTRY": oData.oHeader.ZZ_FMCNTRY,
				"ZZ_MULT_ENTRY": "",
				"ZZ_MULT_ENTRY_CHAR": false,
				"ZZ_VISA_EDATE": "",
				"ZZ_VISA_SDATE": "",
				"ZZ_OFFC_ADDRESS": "",
				"ZZ_VISA_NO": "",
				"ZZ_DEP_REQ": oData.ZZ_TRV_REQ_NUM,
				"ZZ_VISA_PLAN": ""
			};
			oVM.setData(oVD);
		},
		/* Handle upload exist visa */
		_showUploadVisaDlg: function(oEvent) {

			var oThis = TravelRequestThis; //eslint-disable-line
			sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oThis);
			var bValid = TravelRequestDtlThis.validateTravelling(); //eslint-disable-line
			if (bValid) {
				if (!oThis._oExistVisaDialog) {
					oThis._oExistVisaDialog = sap.ui.xmlfragment(sRequestPassengerVisaFragment + "UloadVD", this);
					oThis.getView().addDependent(this._oExistVisaDialog);
				}
				this.getVisaData();
				// oThis._oExistVisaDialog.open();
				// sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
			} else {
				TCommonSrv._showMsgBox("Mandatory Input", "Please fill all field of Travelling Details");
				StaticUtility.setBusy(false, TravelRequestThis); //eslint-disable-line
			}
		},
		getPassportData: function() {
			console.log("Get Passport Data"); //eslint-disable-line
			// var oPassportWarning = sap.ui.core.Fragment.byId(sRequestPassengerVisaFragment + "UploadVisaDialog", "passportWarningText");
			var oThis = TravelRequestThis; //eslint-disable-line
			// var sServiceUrlTemp = sServiceUrl; //eslint-disable-line
			// var oRequestModel = oThis.getView().getModel("trvRequestDtl");
			var empDetail = sap.ui.getCore().getModel("profile").getData().employeeDetail;
			// var oRequestData = oRequestModel.getData();
			var oPassportWarning = this.getView().byId("passportWarningText");
			var oModel = oThis.getView().getModel();
			var sPath = "/DmsDocsSet";
			var aFilter = [];
			var model = new sap.ui.model.json.JSONModel({
				visibleOpen: false,
				href: "",
				filename: ""
			});
			oThis.getView().setModel(model, "Passport");
			aFilter.push(new Filter("DepReq", FilterOperator.EQ, ""));
			// console.log(oRequestData);
			if (empDetail) {
				aFilter.push(new Filter("EmpNo", FilterOperator.EQ, empDetail.ZZ_DEP_PERNR));
			}
			aFilter.push(new Filter("DocType", FilterOperator.EQ, "PP"));
			oModel.read(sPath, {
				filters: aFilter,
				success: function(data) {
					if (data.results.length > 0) {
						var oData = data.results[data.results.length - 1];
						oPassportWarning.setVisible(false);
						var oData2 = {};
						oData2.visibleOpen = true;
						oData2.href = oData.FileUrl;
						oData2.filename = sap.ui.project.e2etm.util.Formatter._injectPPFileName(oData.FileName);
						model.setData(oData2);
						// Close the dialog
					} else {

						oPassportWarning.setVisible(true);
					}
				}
			});

		},

		// init data 
		getVisaData: function() {
			var oThis = TravelRequestThis; //eslint-disable-line
			var sServiceUrlTemp = sServiceUrl; //eslint-disable-line
			var oRequestModel = oThis.getView().getModel("trvRequestDtl");
			var oRequestData = oRequestModel.getData();
			// console.log(oRequestData);
			try {
				sap.ui.getCore().byId("UploadVisaSelf").destroy();
				sap.ui.getCore().byId("UploadVisaDependent").destroy();
			} catch (exc) {
				jQuery.sap.log.error(exc);
			}

			sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oThis);
			// display popup
			if (oThis._oExistVisaDialog) {
				oThis._oExistVisaDialog.destroy();
			}
			// instantiate the Fragment if not done yet
			oThis._oExistVisaDialog = sap.ui.xmlfragment(sRequestPassengerVisaFragment + "UloadVD", this);

			var oRequest = {
				ZZ_VISA_PLAN: "",
				ZZ_DEP_REQ: "",
				ZZ_DEP_PERNR: oRequestData.empDetail.ZZ_DEP_PERNR,
				ZZ_TRV_CAT: "BUSR"
			};
			// call service to get visa items
			var get = $.ajax({
				cache: false,
				url: sServiceUrlTemp + "DEP_VISA_PLANSet('" + oRequest.ZZ_VISA_PLAN + "')?$expand=VISAPLANTOITEM&$format=json",
				type: "GET"
			});
			get.fail(function(err) {
				jQuery.sap.log.error(err);
				oThis._oExistVisaDialog.close();
			});
			get.done(function(data) {
				var model = new sap.ui.model.json.JSONModel();
				var bindData = {};
				bindData.selfVisa = data.d;
				//hard code
				bindData.selfVisa.ZZ_CURR_VISA_TYP = "BUSR"; //2018/12/17
				bindData.selfVisa.visibleOpen = false;
				bindData.selfVisa.ZZ_DEP_REQ = oRequest.ZZ_DEP_REQ;
				bindData.selfVisa.ZZ_DEP_PERNR = oRequest.ZZ_DEP_PERNR;
				bindData.selfVisa.ZZ_TRV_CAT = oRequest.ZZ_TRV_CAT;
				bindData.selfVisa.ZZ_VISA_SDATE_VALUE = new Date(bindData.selfVisa.ZZ_VISA_SDATE.substr(0, 4),
					bindData.selfVisa.ZZ_VISA_SDATE.substr(4, 2) - 1,
					bindData.selfVisa.ZZ_VISA_SDATE.substr(6, 2));
				bindData.selfVisa.ZZ_VISA_EDATE_VALUE = new Date(bindData.selfVisa.ZZ_VISA_EDATE.substr(0, 4),
					bindData.selfVisa.ZZ_VISA_EDATE.substr(4, 2) - 1,
					bindData.selfVisa.ZZ_VISA_EDATE.substr(6, 2));

				bindData.visaItems = data.d.VISAPLANTOITEM.results;
				// Getting the visa data from backend
				if (data.d.VISAPLANTOITEM != null) {
					bindData.visaItems = data.d.VISAPLANTOITEM.results;
				} else {
					bindData.visaItems = [];
				}

				bindData.selfVisa = data.d;
				if (bindData.selfVisa.ZZ_VISA_EDATE === "00000000") {
					bindData.selfVisa.ZZ_VISA_EDATE = "";
				} else {
					bindData.selfVisa.ZZ_VISA_EDATE_VALUE = new Date(bindData.selfVisa.ZZ_VISA_EDATE.substr(0, 4),
						bindData.selfVisa.ZZ_VISA_EDATE.substr(4, 2) - 1,
						bindData.selfVisa.ZZ_VISA_EDATE.substr(6, 2));
				}
				if (bindData.selfVisa.ZZ_VISA_SDATE === "00000000") {
					bindData.selfVisa.ZZ_VISA_SDATE = "";
				} else {
					bindData.selfVisa.ZZ_VISA_SDATE_VALUE = new Date(bindData.selfVisa.ZZ_VISA_SDATE.substr(0, 4),
						bindData.selfVisa.ZZ_VISA_SDATE.substr(4, 2) - 1,
						bindData.selfVisa.ZZ_VISA_SDATE.substr(6, 2));
				}
				if (data.d.ZZ_MULT_ENTRY === "") {
					bindData.selfVisa.ZZ_MULT_ENTRY_CHAR = false;
				} else {
					bindData.selfVisa.ZZ_MULT_ENTRY_CHAR = true;
				}

				for (var i = 0; i < bindData.visaItems.length; i++) {
					bindData.visaItems[i].visibleOpen = false;
					if (bindData.visaItems[i].ZZ_MULT_ENTRY === "") {
						bindData.visaItems[i].ZZ_MULT_ENTRY_CHAR = false;
					} else {
						bindData.visaItems[i].ZZ_MULT_ENTRY_CHAR = true;
					}
					if (bindData.visaItems[i].ZZ_VISA_EDATE !== "00000000") {
						bindData.visaItems[i].ZZ_VISA_EDATE_VALUE = new Date(
							bindData.visaItems[i].ZZ_VISA_EDATE.substr(0, 4),
							bindData.visaItems[i].ZZ_VISA_EDATE.substr(4, 2) - 1,
							bindData.visaItems[i].ZZ_VISA_EDATE.substr(6, 2));
					}
					if (bindData.visaItems[i].ZZ_VISA_SDATE !== "00000000") {
						bindData.visaItems[i].ZZ_VISA_SDATE_VALUE = new Date(
							bindData.visaItems[i].ZZ_VISA_SDATE.substr(0, 4),
							bindData.visaItems[i].ZZ_VISA_SDATE.substr(4, 2) - 1,
							bindData.visaItems[i].ZZ_VISA_SDATE.substr(6, 2));
					}
				}

				var get2 = $.ajax({
					cache: false,
					url: sServiceUrlTemp + "DmsDocsSet?$filter=DepReq+eq+'" +
						oRequest.ZZ_DEP_REQ + "'+and+EmpNo+eq+'" + oRequest.ZZ_DEP_PERNR + "'&$format=json",
					type: "GET"
				});
				get2.done(function(result) {
					for (var i = 0; i < result.d.results.length; i++) {
						var sFileName = result.d.results[i].FileName;
						if (sFileName.substr(0, sFileName.indexOf(".")) === "CL_VISA_COPY_SELF_" + oRequest.ZZ_TRV_CAT) {
							bindData.selfVisa.visibleOpen = true;
							bindData.selfVisa.href = result.d.results[i].FileUrl;
							continue;
						}
						if (sFileName.substr(0, 22) === "CL_VISA_COPY_DEPENDENT") {
							try {
								for (var iIndex = 0; iIndex < bindData.visaItems.length; iIndex++) {
									var regex = new RegExp(/\(([^)]+)\)/g);
									var dependentType = regex.exec(bindData.visaItems[iIndex].ZZ_DEPNDT_TYP)[1];
									if (sFileName.split("_")[4].split(".")[0] === dependentType) {
										bindData.visaItems[iIndex].visibleOpen = true;
										bindData.visaItems[iIndex].href = result.d.results[i].FileUrl;
									}
								}
							} catch (ex) {
								//
							}
							continue;
						}
					}
					model.setData(bindData);
					sap.ui.getCore().byId("dialogUploadVisaCopy").setModel(model);
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
					oThis._oExistVisaDialog.open();
				});

				// Modify Visa Copy Panel dependent's name
				var ntid = oRequest.ZZ_DEP_PERNR;

				var get3 = $.ajax({
					cache: false,
					url: sServiceUrlTemp + "DEP_EMPSet('" + ntid + "')?$expand=EMPtoEMPDEPNDNT&$format=json",
					type: "GET"
				});
				get3.done(function(data) {
					for (var i = 0; i < bindData.visaItems.length; i++) {
						for (var j = 0; j < data.d.EMPtoEMPDEPNDNT.results.length; j++) {
							if (data.d.EMPtoEMPDEPNDNT.results[j].ZZ_DEP_TYP === bindData.visaItems[i].ZZ_DEPNDT_TYP) {
								bindData.visaItems[i].ZZ_DEPNDT_TYP = data.d.EMPtoEMPDEPNDNT.results[j].ZZ_DEP_NAME + " (" +
									data.d.EMPtoEMPDEPNDNT.results[j].ZZ_DEP_TYP + ")";
								model.setData(bindData);
								sap.ui.getCore().byId("dialogUploadVisaCopy").setModel(model);
								sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
								// oHomeThis.oCommonDialog.open();
								oThis._oExistVisaDialog.open();
								break;
							}
						}
					}
				});
			});
		},

		onCloseVisaCopyUpload: function(oEvent) {
			var oThis = TravelRequestThis; //eslint-disable-line
			oThis._oExistVisaDialog.close();
		}
		/*End upload exist visa */
		,

		onPassportFileChange: function(evt) {
			var oThis = TravelRequestThis; //eslint-disable-line
			sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oThis);
			var oPassportWarning = this.getView().byId("passportWarningText");
			var oRequestModel = oThis.getView().getModel("trvRequestDtl");
			var source = evt.getSource();
			var oRequestData = oRequestModel.getData();
			var aData = {
				visibleOpen: false,
				href: "",
				filename: ""
			};
			// console.log(aData);
			var sDepReq = "";
			var sEmpNo = oRequestData.empDetail.ZZ_DEP_PERNR;
			// var trvCat = "BUSR";
			var sFileName;

			var token = "";
			var get = $.ajax({
				cache: false,
				url: sServiceUrl + "EMP_PASSPORT_INFOSet", //eslint-disable-line
				type: "GET",
				headers: {
					'Authorization': token
				},
				beforeSend: function(xhr) {
					xhr.setRequestHeader('X-CSRF-Token', 'Fetch');
				}
			});
			get.done(function(result, response, header) {
				try {
					sFileName = oRequestData.empDetail.ZZ_DEP_PERNR + "_PP" + source.getProperty("value").substr(source.getProperty("value").lastIndexOf(
						"."));
					var file = source.oFileUpload.files[0];
					var sUrl = sServiceUrl + "DmsDocsSet"; //eslint-disable-line
					sDepReq = sDepReq === null || sDepReq === "" ? '999999999' : sDepReq;
					sEmpNo = sEmpNo === null || sEmpNo === "" ? sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_PERNR : sEmpNo;
					var sSlung = sDepReq + "," + sEmpNo + "," + sFileName + "," + "PP";
					// console.log(sSlung);
					var oHeaders = {
						'X-Requested-With': "XMLHttpRequest",
						'X-CSRF-Token': header.getResponseHeader("X-CSRF-Token"),
						'Accept': "application/json",
						'DataServiceVersion': "2.0",
						'Content-Type': "application/json",
						"slug": sSlung
					};
					var post = jQuery.ajax({
						cache: false,
						type: 'POST',
						url: sUrl,
						headers: oHeaders,
						contentType: file.type,
						processData: false,
						data: file
					});
					post.success(function(data) {
						oPassportWarning.setVisible(false);
						aData.visibleOpen = true;
						aData.href = data.d.FileUrl;
						aData.filename = data.d.FileName;
						// console.log(source);
						oThis.getView().getModel("Passport").setData(aData);
						// Close the dialog
						sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
						sap.m.MessageToast.show("Upload Succesfully");
					});
					post.fail(function(result, response, header) {
						sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
					});
				} catch (exc) {
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
				}
			});
		},

		// EVENT ON CLICKING OF UPLOAD VISA COPIES IN VISACOPY PANEL DIALOG BY EMPLOYEE
		onVisaCopyUpload: function(evt) {
			var oThis = TravelRequestThis; //eslint-disable-line
			var oPThis = this;
			var oRequestModel = oThis.getView().getModel("trvRequestDtl");
			var oRequestData = oRequestModel.getData();
			// oRequestData.empDetail.ZZ_DEP_PERNR
			sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oThis);
			// Send data for visa plan creation.
			var aData = sap.ui.getCore().byId("dialogUploadVisaCopy").getModel().getData();
			// Visa header
			var data = aData.selfVisa;
			// Visa items
			var items = aData.visaItems;

			// Validate visa header for employee
			var sError = this.validateVisaUploadSelf(data);

			// console.log(sap.ui.getCore().byId("dialogUploadVisaCopy").getModel(), sServiceUrl);
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			if (sError !== "") {
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
				MessageBox.show(
					sError, {
						icon: MessageBox.Icon.ERROR,
						styleClass: bCompact ? "sapUiSizeCompact" : ""
					}
				);
				// sap.ca.ui.message.showMessageBox({
				// 	type: sap.ca.ui.message.Type.ERROR,
				// 	message: sError,
				// 	details: sError
				// });
				return;
			}

			//Validate visa header for dependent
			sError = this.validateVisaUploadDependent(items);
			if (sError !== "") {
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
				// sap.ca.ui.message.showMessageBox({
				// 	type: sap.ca.ui.message.Type.ERROR,
				// 	message: sError,
				// 	details: sError
				// });
				MessageBox.show(
					sError, {
						icon: MessageBox.Icon.ERROR,
						styleClass: bCompact ? "sapUiSizeCompact" : ""
					}
				);
				return;
			}

			if (data.ZZ_MULT_ENTRY_CHAR) {
				data.ZZ_MULT_ENTRY = 'X';
			} else {
				data.ZZ_MULT_ENTRY = '';
			}

			// Validate if visaExisting Dependent has all value
			for (var i = 0; i < items.length; i++) {
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
				delete items[i]["ZZ_CURR_VISA_TYP_ERROR"];
				delete items[i]["ZZ_VISA_NO_ERROR"];
				delete items[i].enabled;
				delete items[i].enabledUpload;
				delete items[i].href;
				delete items[i].visibleOpen;
			}
			delete data["ZZ_DEP_PERNR"];
			delete data["ZZ_TRV_CAT"];
			delete data["ZZ_DEPNDT_TYP"];
			delete data["ZZ_MULT_ENTRY_CHAR"];
			delete data["ZZ_VISA_EDATE_VALUE"];
			delete data["ZZ_VISA_SDATE_VALUE"];
			delete data["ZZ_VISA_EDATE_ERROR"];
			delete data["ZZ_VISA_SDATE_ERROR"];
			delete data["ZZ_CURR_VISA_TYP_ERROR"];
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
				url: sServiceUrl + "EMP_PASSPORT_INFOSet", //eslint-disable-line
				type: "GET",
				headers: {
					'Authorization': token
				},
				beforeSend: function(xhr) {
					xhr.setRequestHeader('X-CSRF-Token', 'Fetch');
				}
			});
			get.done(function(result, response, header) {
				token = header.getResponseHeader("X-CSRF-Token");
				var post = $.ajax({
					cache: false,
					url: sServiceUrl + "DEP_VISA_PLANSet", //eslint-disable-line
					type: "POST",
					beforeSend: function(xhr) {
						xhr.setRequestHeader('X-Requested-With', "XMLHttpRequest");
						xhr.setRequestHeader('X-CSRF-Token', token);
						xhr.setRequestHeader('Accept', "application/json");
						xhr.setRequestHeader('DataServiceVersion', "2.0");
						xhr.setRequestHeader('Content-Type', "application/json");
					},
					data: JSON.stringify(data),
					dataType: "json",
					success: function(result) {
						// Close the dialog
						if (result.d.ZZ_VISA_PLAN !== "") {

							oPThis.getExistVisaDepen(result.d.ZZ_VISA_PLAN);
						}
						sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
						sap.m.MessageToast.show("Visa copy uploaded successfully!");
						oThis._oExistVisaDialog.close();
					}
				});
			});
		},
		getExistVisaDepen: function(sVisaPlan) {
			var oDataModel = TravelRequestThis.getView().getModel(); //eslint-disable-line
			var oThis = this;
			var sPath = "/DEP_VISA_PLANSet('" + sVisaPlan + "')";
			oDataModel.read(sPath, {
				success: function(result) {

					var oVM = oThis.getView().getModel(),
						oVD = oVM.getData();

					delete result.__metadata;
					delete result.VISAPLANTOITEM;
					delete result.TRV_HDR;
					var upModel = sap.ui.getCore().byId("dialogUploadVisaCopy").getModel();
					var uploadData = upModel.getData();
					if (uploadData.selfVisa.ZZ_MULT_ENTRY === "X") {
						oVD.selfVisa.ZZ_MULT_ENTRY_CHAR = true;
					}
					oVD.selfVisa.ZZ_VISA_NO = uploadData.selfVisa.ZZ_VISA_NO;
					oVD.selfVisa.ZZ_MULT_ENTRY = uploadData.selfVisa.ZZ_MULT_ENTRY;
					oVD.selfVisa.ZZ_VISA_EDATE = uploadData.selfVisa.ZZ_VISA_EDATE;
					oVD.selfVisa.ZZ_VISA_SDATE = uploadData.selfVisa.ZZ_VISA_SDATE;
					oVD.selfVisa.ZZ_VISA_PLAN = sVisaPlan;

					oVD.visaExistingDependent.push(result);
					oVM.setData(oVD);

				},
				error: function(err) {
					console.clear(); //eslint-disable-line
					console.info("Error" + err); //eslint-disable-line
				}
			});
		},
		// EVENT ON UPLOAD VISA COPIES DOCUMENT
		onFileChange: function(evt) {
			var oThis = TravelRequestThis; //eslint-disable-line
			sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oThis);
			// var oRequestModel = oThis.getView().getModel("trvRequestDtl");
			// var oRequestData = oRequestModel.getData();
			// oRequestData.empDetail.ZZ_DEP_PERNR
			var aData = sap.ui.getCore().byId("dialogUploadVisaCopy").getModel().getData();
			// console.log(aData);
			var sDepReq = aData.selfVisa.ZZ_DEP_REQ;
			var sEmpNo = aData.selfVisa.ZZ_DEP_PERNR;
			var source = evt.getSource();
			var trvCat = "BUSR"; //temp disable aData.selfVisa.ZZ_TRV_CAT;
			var sFileName;
			try {
				var iIndex = source.oParent.oParent.oParent.getCurrentPage() - 1;
			} catch (exc) {
				//
			}

			var token = "";
			var get = $.ajax({
				cache: false,
				url: sServiceUrl + "EMP_PASSPORT_INFOSet", //eslint-disable-line
				type: "GET",
				headers: {
					'Authorization': token
				},
				beforeSend: function(xhr) {
					xhr.setRequestHeader('X-CSRF-Token', 'Fetch');
				}
			});
			get.done(function(result, response, header) {
				try {
					if (source.getId() === "UploadVisaSelf") {
						sFileName = "CL_VISA_COPY_SELF_" + trvCat + source.getProperty("value").substr(source.getProperty("value").lastIndexOf("."));
					} else if (source.getId().substr(0, source.getId().indexOf("-")) === "UploadVisaDependent") {
						var regex = new RegExp(/\(([^)]+)\)/g);
						var dependentType = regex.exec(source.getParent().getItems()[0].getItems()[0].getText())[1];
						sFileName = "CL_VISA_COPY_DEPENDENT_" + dependentType + source.getProperty("value").substr(source.getProperty("value").lastIndexOf(
							"."));
					}
					var file = source.oFileUpload.files[0];
					var sUrl = sServiceUrl + "DmsDocsSet"; //eslint-disable-line
					sDepReq = sDepReq === null || sDepReq === "" ? '999999999' : sDepReq;
					sEmpNo = sEmpNo === null || sEmpNo === "" ? sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_PERNR : sEmpNo;
					var sSlung = sDepReq + "," + sEmpNo + "," + sFileName + "," + "L4";
					// console.log(sSlung);
					var oHeaders = {
						'X-Requested-With': "XMLHttpRequest",
						'X-CSRF-Token': header.getResponseHeader("X-CSRF-Token"),
						'Accept': "application/json",
						'DataServiceVersion': "2.0",
						'Content-Type': "application/json",
						"slug": sSlung
					};
					var post = jQuery.ajax({
						cache: false,
						type: 'POST',
						url: sUrl,
						headers: oHeaders,
						contentType: file.type,
						processData: false,
						data: file
					});
					post.success(function(data) {
						if (source.getId() === "UploadVisaSelf") {
							aData.selfVisa.visibleOpen = true;
							aData.selfVisa.href = data.d.FileUrl;
						} else if (source.getId().substr(0, source.getId().indexOf("-")) === "UploadVisaDependent") {
							aData.visaItems[iIndex].visibleOpen = true;
							aData.visaItems[iIndex].href = data.d.FileUrl;
						}
						sap.ui.getCore().byId("dialogUploadVisaCopy").getModel().setData(aData);

						// Close the dialog
						sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
						sap.m.MessageToast.show("Upload Succesfully");
					});
					post.fail(function(result, response, header) {
						sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
					});
				} catch (exc) {
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
				}
			});
		},

		// This method is used for validating the VISA for SELF during uploading visacopy
		validateVisaUploadSelf: function(self) {
			// Validate visa header
			if (self.ZZ_VISA_SDATE === "") {
				self.ZZ_VISA_SDATE_ERROR = "Error";
				return "Please check Visa Valid From";
			} else {
				self.ZZ_VISA_SDATE_ERROR = "None";
			}

			if (self.ZZ_VISA_EDATE === "") {
				self.ZZ_VISA_EDATE_ERROR = "Error";
				return "Please check Visa Valid To";
			} else {
				self.ZZ_VISA_EDATE_ERROR = "None";
			}

			if (parseInt(self.ZZ_VISA_SDATE) > parseInt(self.ZZ_VISA_EDATE)) {
				self.ZZ_VISA_SDATE_ERROR = "Error";
				self.ZZ_VISA_EDATE_ERROR = "Error";
				return "Visa Valid To must be greater than Visa Valid From";
			} else {
				self.ZZ_VISA_SDATE_ERROR = "None";
				self.ZZ_VISA_EDATE_ERROR = "None";
			}

			// Visa enddate must be greater than deputation startdate
			if (parseInt(self.ZZ_VISA_EDATE) < parseInt(self.ZZ_DEP_STDATE)) {
				self.ZZ_VISA_EDATE_ERROR = "Error";
				return "Visa Valid To must be greater than Deputation Start date";
			} else {
				self.ZZ_VISA_EDATE_ERROR = "None";
			}

			// Visa startdate must be less than deputation startdate
			if (parseInt(self.ZZ_VISA_SDATE) > parseInt(self.ZZ_DEP_STDATE)) {
				self.ZZ_VISA_SDATE_ERROR = "Error";
				return "Visa Valid From must be less than Deputation Start date";
			} else {
				self.ZZ_VISA_SDATE_ERROR = "None";
			}

			if (self.ZZ_VISA_NO.trim() === "") {
				self.ZZ_VISA_NO_ERROR = "Error";
				return "Please enter required field";
			} else {
				self.ZZ_VISA_NO_ERROR = "None";
			}

			if (self.ZZ_CURR_VISA_TYP.trim() === "") {
				self.ZZ_CURR_VISA_TYP_ERROR = "Error";
				return "Please enter required field";
			} else {
				self.ZZ_CURR_VISA_TYP_ERROR = "None";
			}

			if (!self.visibleOpen &&
				sap.ui.getCore().getModel("profile").getData().currentRole === "EMP") {
				return "Please upload visa copy of the request's owner";
			}
			return "";
		},
		// This method is used for validating the VISA for DEPENDENTS during uploading visacopy
		validateVisaUploadDependent: function(dependents) {
			for (var i = 0; i < dependents.length; i++) {
				if (dependents[i].ZZ_VISA_SDATE === "") {
					dependents[i].ZZ_VISA_SDATE_ERROR = "Error";
					return "Please check visa valid from";
				} else {
					dependents[i].ZZ_VISA_SDATE_ERROR = "None";
				}

				if (dependents[i].ZZ_VISA_EDATE === "") {
					dependents[i].ZZ_VISA_EDATE_ERROR = "Error";
					return "Please check visa valid to";
				} else {
					dependents[i].ZZ_VISA_EDATE_ERROR = "None";
				}

				if (parseInt(dependents[i].ZZ_VISA_SDATE) > parseInt(dependents[i].ZZ_VISA_EDATE)) {
					dependents[i].ZZ_VISA_SDATE_ERROR = "Error";
					dependents[i].ZZ_VISA_SDATE_ERROR = "Error";
					return "Visa Valid To must be greater than Visa Valid From";
				} else {
					dependents[i].ZZ_VISA_SDATE_ERROR = "None";
					dependents[i].ZZ_VISA_EDATE_ERROR = "None";
				}

				if (dependents[i].ZZ_VISA_NO.trim() === "") {
					dependents[i].ZZ_VISA_NO_ERROR = "Error";
					return "Please enter Visa number";
				} else {
					dependents[i].ZZ_VISA_NO_ERROR = "None";
				}

				if (dependents[i].ZZ_CURR_VISA_TYP.trim() === "") {
					dependents[i].ZZ_CURR_VISA_TYP_ERROR = "Error";
					return "Please enter Visa type";
				} else {
					dependents[i].ZZ_CURR_VISA_TYP_ERROR = "None";
				}

				if (!dependents[i].visibleOpen && sap.ui.getCore().getModel("profile").getData().currentRole === "EMP") {
					return "Please upload visa copy for dependent " + dependents[i].ZZ_DEPNDT_TYP;
				}
			}
			return "";
		},
		// 	This method is used to save Visa plan
		saveVisaPlan: function(aData, sStatus, sMessage, sRequestType) {
			//Delete data before saving
			StaticUtility.setBusy(true, TravelRequestThis); //eslint-disable-line
			try {
				if (aData.selfVisa.ZZ_MULT_ENTRY_CHAR) {
					aData.selfVisa.ZZ_MULT_ENTRY = 'X';
				} else {
					aData.selfVisa.ZZ_MULT_ENTRY = '';
				}
			} catch (exc) {
				//
			}
			try {
				for (var i = 0; i < aData.visaExistingDependent.length; i++) {

					var regex = new RegExp(/\(([^)]+)\)/g);
					var dependentType = regex.exec(aData.visaExistingDependent[i].ZZ_DEPNDT_TYP)[1];
					aData.visaExistingDependent[i].ZZ_DEPNDT_TYP = dependentType;
					if (aData.visaExistingDependent[i].ZZ_MULT_ENTRY_CHAR) {
						aData.visaExistingDependent[i].ZZ_MULT_ENTRY = 'X';
					} else {
						aData.visaExistingDependent[i].ZZ_MULT_ENTRY = '';
					}
					aData.visaExistingDependent[i].ZZ_DEP_REQ = aData.selfVisa.ZZ_DEP_REQ;
					delete aData.visaExistingDependent[i].ZZ_MULT_ENTRY_CHAR;
					delete aData.visaExistingDependent[i].ZZ_VISA_EDATE_VALUE;
					delete aData.visaExistingDependent[i].ZZ_VISA_SDATE_VALUE;
					delete aData.visaExistingDependent[i].ZZ_VISA_SDATE_ERROR;
					delete aData.visaExistingDependent[i].ZZ_VISA_EDATE_ERROR;
					delete aData.visaExistingDependent[i].ZZ_CURR_VISA_TYP_ERROR;
					delete aData.visaExistingDependent[i].ZZ_VISA_NO_ERROR;
					delete aData.visaExistingDependent[i].enabled;
					delete aData.visaExistingDependent[i].enabledUpload;
					delete aData.visaExistingDependent[i].href;
					delete aData.visaExistingDependent[i].visibleOpen;
				}
			} catch (ex) {
				//
			}

			delete aData.selfVisa.ZZ_DEPNDT_TYP;
			delete aData.selfVisa.ZZ_MULT_ENTRY_CHAR;
			delete aData.selfVisa.ZZ_VISA_EDATE_VALUE;
			delete aData.selfVisa.ZZ_VISA_SDATE_VALUE;
			delete aData.selfVisa.ZZ_VISA_EDATE_ERROR;
			delete aData.selfVisa.ZZ_VISA_SDATE_ERROR;
			delete aData.selfVisa.ZZ_CURR_VISA_TYP_ERROR;
			delete aData.selfVisa.ZZ_VISA_NO_ERROR;
			delete aData.selfVisa.enabled;
			delete aData.selfVisa.enabledUpload;
			delete aData.selfVisa.href;
			delete aData.selfVisa.visibleOpen;
			try {
				delete aData.selfVisa.TRV_HDR;
			} catch (exc) {
				//
			}
			try {
				delete aData.selfVisa.__metadata;
			} catch (exc) { //
			}
			aData.selfVisa.ZZ_VISA_CAT = "BUSR"; // TinhTD hard code to busr aData.screenData.ZZ_TRV_CAT;
			aData.selfVisa.VISAPLANTOITEM = []; //TinhTD hard code to [] aData.visaExistingDependent;
			//TinhTD Temp
			aData.selfVisa.ZZ_MULT_ENTRY = aData.visaExistingDependent[0].ZZ_MULT_ENTRY;
			aData.selfVisa.ZZ_VISA_SDATE = Formatter.dateToYM(aData.visaExistingDependent[0].ZZ_VISA_SDATE);
			aData.selfVisa.ZZ_VISA_EDATE = Formatter.dateToYM(aData.visaExistingDependent[0].ZZ_VISA_EDATE);
			aData.selfVisa.ZZ_VISA_NO = aData.visaExistingDependent[0].ZZ_VISA_NO;
			//End TinhTD
			// Call service to create visa plan
			var token = "";
			var get = $.ajax({
				cache: false,
				url: sServiceUrl + "EMP_PASSPORT_INFOSet", //eslint-disable-line
				type: "GET",
				headers: {
					'Authorization': token
				},
				beforeSend: function(xhr) {
					xhr.setRequestHeader('X-CSRF-Token', 'Fetch');
				}
			});
			get.done(function(result, response, header) {
				token = header.getResponseHeader("X-CSRF-Token");
				var post = $.ajax({
					cache: false,
					url: sServiceUrl + "DEP_VISA_PLANSet", //eslint-disable-line
					type: "POST",
					beforeSend: function(xhr) {
						xhr.setRequestHeader('X-Requested-With', "XMLHttpRequest");
						xhr.setRequestHeader('X-CSRF-Token', token);
						xhr.setRequestHeader('Accept', "application/json");
						xhr.setRequestHeader('DataServiceVersion', "2.0");
						xhr.setRequestHeader('Content-Type', "application/json");
					},
					data: JSON.stringify(aData.selfVisa),
					dataType: "json",
					success: function(result) {
						if (sRequestType === "DEPU") {
							// Update workflow stages
							// oDeputationThis.employeeAction(sStatus, sMessage); //temps disable
						} else {
							StaticUtility.setBusy(false, TravelRequestThis); //eslint-disable-line
						}
					},
					fail: function(err) {
						StaticUtility.setBusy(false, TravelRequestThis); //eslint-disable-line
						alert(err);
					}
				});
			});
		},
		updateVisaCopyData: function(sControl, sValue) {
			var uModel = sap.ui.getCore().byId("dialogUploadVisaCopy").getModel();
			var aData = uModel.getData();
			var data = aData.selfVisa;
			switch (sControl) {
				case "start":
					data.ZZ_VISA_SDATE = Formatter.dateToYM(sValue);
					break;
				case "end":
					data.ZZ_VISA_EDATE = Formatter.dateToYM(sValue);
					break;
			}
			uModel.setData(aData);

		},
		onChangeVS: function(oEvent) {
			this.updateVisaCopyData("start", oEvent.getSource().getValue());
		},
		onChangeVE: function(oEvent) {
			this.updateVisaCopyData("end", oEvent.getSource().getValue());

		}

		//end function
		// EVENT ON CLICKING OF UPLOAD VISA COPIES IN VISACOPY PANEL DIALOG BY EMPLOYEE
		,
		onUploadVisaCopiesHandle: function(evt) {
			var oThis = TravelRequestThis; //eslint-disable-line
			var oPThis = this;
			var oRequestModel = oThis.getView().getModel("trvRequestDtl");
			var oRequestData = oRequestModel.getData();
			// oRequestData.empDetail.ZZ_DEP_PERNR
			sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oThis);
			// Send data for visa plan creation.
			var aData = sap.ui.getCore().byId("dialogUploadVisaCopy").getModel().getData();
			// Visa header
			var data = aData.selfVisa;
			// Visa items
			var items = aData.visaItems;

			// Validate visa header for employee
			var sError = this.validateVisaUploadSelf(data);

			// console.log(sap.ui.getCore().byId("dialogUploadVisaCopy").getModel(), sServiceUrl);
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			if (sError !== "") {
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
				MessageBox.show(
					sError, {
						icon: MessageBox.Icon.ERROR,
						styleClass: bCompact ? "sapUiSizeCompact" : ""
					}
				);
				// sap.ca.ui.message.showMessageBox({
				// 	type: sap.ca.ui.message.Type.ERROR,
				// 	message: sError,
				// 	details: sError
				// });
				return;
			}

			//Validate visa header for dependent
			sError = this.validateVisaUploadDependent(items);
			if (sError !== "") {
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
				// sap.ca.ui.message.showMessageBox({
				// 	type: sap.ca.ui.message.Type.ERROR,
				// 	message: sError,
				// 	details: sError
				// });
				MessageBox.show(
					sError, {
						icon: MessageBox.Icon.ERROR,
						styleClass: bCompact ? "sapUiSizeCompact" : ""
					}
				);
				return;
			}

			if (data.ZZ_MULT_ENTRY_CHAR) {
				data.ZZ_MULT_ENTRY = 'X';
			} else {
				data.ZZ_MULT_ENTRY = '';
			}

			// Validate if visaExisting Dependent has all value
			for (var i = 0; i < items.length; i++) {
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
				delete items[i]["ZZ_CURR_VISA_TYP_ERROR"];
				delete items[i]["ZZ_VISA_NO_ERROR"];
				delete items[i].enabled;
				delete items[i].enabledUpload;
				// delete items[i].href;
				delete items[i].visibleOpen;
			}
			/*delete data["ZZ_DEP_PERNR"];
			delete data["ZZ_TRV_CAT"];
			delete data["ZZ_DEPNDT_TYP"];
			delete data["ZZ_MULT_ENTRY_CHAR"];
			delete data["ZZ_VISA_EDATE_VALUE"];
			delete data["ZZ_VISA_SDATE_VALUE"];
			delete data["ZZ_VISA_EDATE_ERROR"];
			delete data["ZZ_VISA_SDATE_ERROR"];
			delete data["ZZ_CURR_VISA_TYP_ERROR"];
			delete data["ZZ_VISA_NO_ERROR"];
			delete data["enabled"];
			delete data["enabledUpload"];
			delete data["href"];
			delete data["visibleOpen"];
			data.VISAPLANTOITEM = items; temps disable */

			//update data temp to main screen

			var oPModel = PassportVisaThis.getView().getModel();
			var oVPD = oPModel.getData();
			var oExVisa = {
				ZZ_VISA_TOCNTRY: oRequestData.oHeader.ZZ_LAND1,
				ZZ_VISA_EDATE: Formatter.ymToDMY(data.ZZ_VISA_EDATE),
				ZZ_VISA_SDATE: Formatter.ymToDMY(data.ZZ_VISA_SDATE),
				ZZ_VISA_NO: data.ZZ_VISA_NO,
				href: data.href,
				ZZ_MULT_ENTRY: data.ZZ_MULT_ENTRY
			};
			var oNVisa = TCommonSrv.checkExistingArray(oVPD.visaExistingDependent, "CITY", data.ZZ_VISA_NO);
			if (oNVisa === undefined) {
				oVPD.visaExistingDependent = [];
				oVPD.visaExistingDependent.push(oExVisa);
			}

			oPModel.setData(oVPD);
		
			oThis._oExistVisaDialog.close();
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
		}
		//
		,
		onChangeMultiEntry: function(oEvent) {
			var bState = oEvent.getSource().getState();
			var aData = sap.ui.getCore().byId("dialogUploadVisaCopy").getModel().getData();
			aData.selfVisa.ZZ_MULT_ENTRY_CHAR = bState;
		},
		_updateVISACountry: function(oData, oVPD, oPVModel) {

			//process visa
			for (var v = 0; v < oVPD.visaExistingDependent.length; v++) {
				var oV = TCommonSrv.checkExistingArray(oData.aCountries, "CITY", oVPD.visaExistingDependent[v].ZZ_VISA_TOCNTRY);
				if (oV !== undefined) {
					oVPD.visaExistingDependent[v].ZZ_VISA_TOCNTRY = oV.COUNTRYCODE;
				}
			}
			oPVModel.setData(oVPD);
		},
		loadExistVisa: function() {
			var oThis = this;
			var oPModel = PassportVisaThis.getView().getModel();
			var oVPD = oPModel.getData();
			var oData = oVModel.getData();
			var oDataModel = TravelRequestThis.getView().getModel(); //eslint-disable-line
			oDataModel.callFunction(
				"/GetVisaDetails", {
					method: "GET",
					urlParameters: {
						ZZ_CURR_VISA_TYP: "BUSR",
						ZZ_DEP_PERNR: oData.empDetail.ZZ_DEP_PERNR
					},
					success: function(oCData) {
						oVPD.visaExistingDependent = oCData.results;
						for (var i = 0; i < oCData.results.length; i++) {
							oCData.results[i].ZZ_VISA_SDATE = Formatter.ymToDMY(oCData.results[i].ZZ_VISA_SDATE);
							oCData.results[i].ZZ_VISA_EDATE = Formatter.ymToDMY(oCData.results[i].ZZ_VISA_EDATE);
						}
						oPModel.setData(oVPD);
						oThis._updateVISACountry(oData, oVPD, oPModel);
					},
					error: function(oError) {
						jQuery.sap.log.error(oError);
					}
				});
		},
		openPPdoc: function(){
			var oPM = this.getView().getModel("Passport");
			var oPD = oPM.getData();
			var sLink = oPD.href;
			window.open(sLink,"_blank");
		}
	});

});