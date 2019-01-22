jQuery.sap.require("sap.ui.core.util.Export");
jQuery.sap.require("sap.ui.core.util.ExportType");
jQuery.sap.require("sap.ui.core.util.ExportTypeCSV");
sap.ui.project.e2etm.util.StaticUtility = {
	// Convert some types of user's date input for filtering
	// 1st: dd/mm/yyyy
	// 2nd: ddmmyyyy
	// 3rd: dd/mm
	convertStringToSAPPosibleValue : function(value) {
		if (value.length == 10 || value.length == 8) {
			var month;
			var year = value.substring(value.length - 4, value.length);
			var day = value.substring(0, 2);
			if (value.length == 10) {
				month = value.substring(3, 5);
			} else {
				month = value.substring(2, 4);
			}
			value = year + "" + month + "" + day;
		} else {
			if (value.length == 5) {
				value = value.substring(value.length - 2, value.length) + "" + value.substring(0, 2);
			}
		}
		return value;
	},
	// Open busy dialog
	setBusy : function(bBoolean, oController) {
		try {
			if (oDeputationThis["BusyDialog"] != null) {
				oDeputationThis["BusyDialog"].close();
			}
		} catch (exc) {
		}
		try {
			if (oHomeThis["BusyDialog"] != null) {
				oHomeThis["BusyDialog"].close();
			}
		} catch (exc) {
		}
		try {
			if (oReportThis["BusyDialog"] != null) {
				oReportThis["BusyDialog"].close();
			}
		} catch (exc) {
		}
		if (bBoolean) {
			if (!oController["BusyDialog"]) {
				oController["BusyDialog"] = new sap.m.BusyDialog();
			}
			oController["BusyDialog"].open();
		} else {
			oController["BusyDialog"].close();
		}
	},
	// Open dialog
	openProfileDialog : function(controller, view, ownerModel) {
		if (ownerModel == null) {
			sap.ui.getCore().setModel(sap.ui.getCore().getModel("profile"), "selectedProfile");
		} else {
			sap.ui.getCore().setModel(ownerModel, "selectedProfile");
		}
		var selectedProfileData = sap.ui.getCore().getModel("selectedProfile").getData();
		selectedProfileData.yesorno = [ {
			key : "",
			description : "No"
		}, {
			key : "X",
			description : "Yes"
		} ];
		selectedProfileData.country = sap.ui.getCore().getModel("global").getData().country;
		var oItem = {
			MOLGA : "",
			LTEXT : "Please select"
		};
		selectedProfileData.country.unshift(oItem);
		if (selectedProfileData.dependentDetail != null) {
			for ( var i = 0; i < selectedProfileData.dependentDetail.length; i++) {
				if (selectedProfileData.dependentDetail[i].ZZ_DATE_EXPIRY !== '00000000' && selectedProfileData.dependentDetail[i].ZZ_DATE_EXPIRY !== '') {
					selectedProfileData.dependentDetail[i].ZZ_DATE_EXPIRY_VALUE = new Date(selectedProfileData.dependentDetail[i].ZZ_DATE_EXPIRY.substr(0, 4), selectedProfileData.dependentDetail[i].ZZ_DATE_EXPIRY.substr(4, 2) - 1, selectedProfileData.dependentDetail[i].ZZ_DATE_EXPIRY.substr(6, 2));
				}
				if (selectedProfileData.dependentDetail[i].ZZ_DATE_ISSUE !== '00000000' && selectedProfileData.dependentDetail[i].ZZ_DATE_ISSUE !== '') {
					selectedProfileData.dependentDetail[i].ZZ_DATE_ISSUE_VALUE = new Date(selectedProfileData.dependentDetail[i].ZZ_DATE_ISSUE.substr(0, 4), selectedProfileData.dependentDetail[i].ZZ_DATE_ISSUE.substr(4, 2) - 1, selectedProfileData.dependentDetail[i].ZZ_DATE_ISSUE.substr(6, 2));
				}
			}
		}
		sap.ui.getCore().getModel("selectedProfile").setData(selectedProfileData);
		sap.ui.project.e2etm.util.StaticUtility.checkDeathDate(sap.ui.getCore().getModel("selectedProfile"));
		sap.ui.core.routing.Router.getRouter("MyRouter").navTo("profile");
	},
	// Check maximum past date when create a new request
	checkPastMax : function(pDays, sDate) {
		var dField = new Date(sDate.substr(0, 4), sDate.substr(4, 2) - 1, sDate.substr(6, 2));
		var dToday = new Date();
		dToday.setHours(0, 0, 0, 0);
		var dDur = new Date(dToday - dField);
		var iDays = dDur.getTime() / (1000 * 3600 * 24);
		iDays = "" + Math.round(iDays);
		return iDays > parseInt(pDays) && iDays >= 0;
	},
	// Check maximum future date when create a new request
	checkFutureMax : function(pDays, sDate) {
		var dField = new Date(sDate.substr(0, 4), sDate.substr(4, 2) - 1, sDate.substr(6, 2));
		var dToday = new Date();
		dToday.setHours(0, 0, 0, 0);
		var dDur = new Date(dField - dToday);
		var iDays = dDur.getTime() / (1000 * 3600 * 24);
		iDays = "" + Math.round(iDays);
		return iDays > parseInt(pDays) && iDays >= 0;
	},
	check256Characters : function(value) {
		if (value == null || value.trim() == "") {
			return false;
		} else {
			var length = value.length;
			if (length > 254) {
				return false;
			} else {
				return true;
			}
		}
	},
	// Hide death date or display read only if death date is filled
	checkDeathDate : function(oModel) {
		var aData = oModel.getData();
		if (aData.dependentDetail != null) {
			for ( var i = 0; i < aData.dependentDetail.length; i++) {
				aData.dependentDetail[i].isEnabled = aData.dependentDetail[i].ZZ_DEATH_DATE != '00000000' && aData.employeeDetail.isEditable;
				aData.dependentDetail[i].isVisible = !aData.dependentDetail[i].isEnabled;
			}
			oModel.setData(aData);
		}
	},
	closeProfileDialog : function(controller) {
		controller["EmployeeDialog"].close();
	},
	// Get Array index
	getArrayIndex : function(aArray, sColumn, sValue) {
		try {
			for ( var i = 0; i < aArray.length; i++) {
				if (aArray[i][sColumn] == sValue) {
					return i;
				}
			}
		} catch (ex) {
			return -1;
		}
		return -1;
	},
	// Check existing in an array
	checkExistingArray : function(aArray, sColumn, sValue) {
		try {
			for ( var i = 0; i < aArray.length; i++) {
				if (aArray[i][sColumn] == sValue) {
					return true;
				}
			}
		} catch (ex) {
			return false;
		}
		return false;
	},
	// Check date in the past
	checkDateInPast : function(date) {
		// Check date in the past
		var dCurrentDate = new Date();
		dCurrentDate = new Date(dCurrentDate.toDateString());
		var dInputDate = new Date(date.substr(0, 4), date.substr(4, 2) - 1, date.substr(6, 2));
		if (dInputDate < dCurrentDate) {
			return true;
		} else {
			return false;
		}
	},
	// Check duration bases on travel category
	checTravelCategoryDuration : function(sTravelCat, iDuration, dep_type, toCountry) {
		try {
			var selectedDesc = sap.ui.getCore().byId("TravelCategoryId").getSelectedItem().getText();
		} catch (exc) {
			var selectedDesc = "";
		}
		// Start
		if (dep_type == "INTL" && sTravelCat == "BUSR") {
			var globalData = sap.ui.getCore().getModel("global").getData();
			var durationData = globalData.busrDuration;
			for ( var i = 0; i < durationData.length; i++) {
				if (durationData[i].CONST == 'BUSR_DURATION' && durationData[i].SELPAR == toCountry) {
					if (parseInt(iDuration) > parseInt(durationData[i].VALUE))
						return "Maximum duration for Business Travels to " + durationData[i].DESCRIPTION + " is " + durationData[i].VALUE + " days. Please check the duration";
					else
						return "";
				}
			}
		}
		// End
		var oGlobalData = sap.ui.getCore().getModel("global").getData().visaType;
		for ( var i = 0; i < oGlobalData.length; i++) {
			if (sTravelCat == oGlobalData[i].ZZ_VKEY && dep_type == oGlobalData[i].ZZ_ZZ_SMODID) {
				if (sTravelCat == "WRKP" && dep_type == "DOME") {
					if (selectedDesc != null && selectedDesc != "") {
						if (selectedDesc.indexOf(oGlobalData[i].ZZ_VISA_DESC) != -1) {
							if (parseInt(iDuration) > parseInt(oGlobalData[i].ZZ_MAX) || parseInt(iDuration) < parseInt(oGlobalData[i].ZZ_MIN)) {
								return err = "As per policy, " + oGlobalData[i].ZZ_VISA_DESC + " category between " + oGlobalData[i].ZZ_MIN + " - " + oGlobalData[i].ZZ_MAX + " day(s).";
							}
						}
					}
				} else {
					if (parseInt(iDuration) > parseInt(oGlobalData[i].ZZ_MAX) || parseInt(iDuration) < parseInt(oGlobalData[i].ZZ_MIN)) {
						if (sTravelCat == "HOME" || sTravelCat == "EMER") {
							return err = "As per policy, " + oGlobalData[i].ZZ_VISA_DESC + " category between " + oGlobalData[i].ZZ_MIN + " - " + oGlobalData[i].ZZ_MAX + " day(s) for yourself.";
						} else {
							if (sTravelCat != "TRFR") {
								return err = "As per policy, " + oGlobalData[i].ZZ_VISA_DESC + " category between " + oGlobalData[i].ZZ_MIN + " - " + oGlobalData[i].ZZ_MAX + " day(s).";
							}
						}
					}
				}
			}
		}
		return "";
	},
	// Check date overlapping
	checkDateOverlapping : function(startDate, endDate, curRequest, type, version, priRequest) {
		var aList = sap.ui.getCore().getModel("global").getData().deputationList; // Deputation
																					// List
		if (aList != null) {
			for ( var i = 0; i < aList.length; i++) {
				if (aList[i].ZZ_DEP_REQ.replace(/^0+/, '') == curRequest.replace(/^0+/, '') || aList[i].ZZ_TRV_REQ.replace(/^0+/, '') == curRequest.replace(/^0+/, '') || aList[i].ZZ_TRV_REQ.replace(/^0+/, '') == priRequest.replace(/^0+/, '')) {
					if (type == "DEPU" || type == "BUSR" || type == "INFO") { // DEPU,
																				// BUSR,
																				// INFO
						continue;
					} else if (type == "SECO" && ((aList[i].ZZ_REQ_TYP == "DEPU" && aList[i].ZZ_TRV_REQ.replace(/^0+/, '') == priRequest.replace(/^0+/, '')) || aList[i].ZZ_DEP_REQ.replace(/^0+/, '') == curRequest.replace(/^0+/, ''))) { // SECO
						continue;
					} else if (aList[i].ZZ_TRV_REQ.replace(/^0+/, '') == curRequest.replace(/^0+/, '')) {
						if (sap.ui.getCore().getModel("global").getData().isCreate) {
							if (aList[i].ZZ_REQ_TYP == "DEPU") {
								continue;
							}
						} else {
							if (aList[i].ZZ_REQ_TYP == "DEPU" || (aList[i].ZZ_REQ_TYP == type && aList[i].ZZ_VERSION == version)) {
								continue;
							}
						}
					}
				}
				if ((aList[i].ZZ_DEP_STDATE <= startDate && aList[i].ZZ_DEP_ENDATE >= startDate) || (aList[i].ZZ_DEP_STDATE <= endDate && aList[i].ZZ_DEP_ENDATE >= endDate) || (aList[i].ZZ_DEP_STDATE >= startDate && aList[i].ZZ_DEP_ENDATE <= endDate)) {
					if ((startDate != aList[i].ZZ_DEP_STDATE && endDate != aList[i].ZZ_DEP_ENDATE && aList[i].ZZ_REQ_TYP == "DEPU" && (type == "BUSR" || type == "INFO")) || aList[i].ZZ_REQ_TYP == "VISA" || (aList[i].ZZ_TRV_CAT == "TRFR" && aList[i].ZZ_DEP_TYPE == "DOME")) {
						continue;
					}
					var sMsg = "Request Number" + " '" + aList[i].ZZ_DEP_REQ + "' " + "has already opened from " + sap.ui.project.e2etm.util.Formatter.sapDate(aList[i].ZZ_DEP_STDATE) + " to " + sap.ui.project.e2etm.util.Formatter.sapDate(aList[i].ZZ_DEP_ENDATE) + ". Please select another date";
					return sMsg;
				}
			}
		}
		return "";
	},
	// Process dependent visa
	onSaveEmployeeDialog : function(evt, oController) {
		var aData = sap.ui.getCore().getModel("profile").getData();
		var sError = this.validateDependent(aData);
		if (sError == undefined) { // Save data
			sap.ui.getCore().getModel("profile").setData(aData);
			this.saveDependent(aData, oController);
		} else { // Show error message
			aData.employeeDetail.selectedTab = 1;
			sap.ui.getCore().getModel("profile").setData(aData);
			sap.m.MessageToast.show(sError);
		}
	},
	validateDependent : function(aData) {
		try {
			for ( var i = 0; i < aData.dependentDetail.length; i++) {
				if (aData.dependentDetail[i].ZZ_PASSPORT_NO.trim() == "" || aData.dependentDetail[i].ZZ_PASSPORT_NO == undefined) {
					// aData.dependentDetail[i].ZZ_PASSPORT_NO_ERROR = "Error";
					// aData.dependentDetail.currentPage = i + 1;
					// return "Please enter required field(s)";
					continue;
				} else {
					aData.dependentDetail[i].ZZ_PASSPORT_NO_ERROR = "None";
				}
				if (aData.dependentDetail[i].ZZ_DATE_ISSUE.trim() == "" || aData.dependentDetail[i].ZZ_DATE_ISSUE == undefined) {
					aData.dependentDetail[i].ZZ_DATE_ISSUE_ERROR = "Error";
					aData.dependentDetail.currentPage = i + 1;
					return "Please enter required field(s)";
				} else {
					aData.dependentDetail[i].ZZ_DATE_ISSUE_ERROR = "None";
				}
				if (aData.dependentDetail[i].ZZ_DATE_EXPIRY.trim() == "" || aData.dependentDetail[i].ZZ_DATE_EXPIRY == undefined) {
					aData.dependentDetail[i].ZZ_DATE_EXPIRY_ERROR = "Error";
					aData.dependentDetail.currentPage = i + 1;
					return "Please enter required field(s)";
				} else {
					aData.dependentDetail[i].ZZ_DATE_EXPIRY_ERROR = "None";
				}
				if (aData.dependentDetail[i].ZZ_CNTRY_ISSUED.trim() == "" || aData.dependentDetail[i].ZZ_CNTRY_ISSUED == undefined) {
					aData.dependentDetail.currentPage = i + 1;
					return "Please enter country issued";
				} else {
				}
				if (aData.dependentDetail[i].ZZ_ISSUED_PLACE.trim() == "" || aData.dependentDetail[i].ZZ_ISSUED_PLACE == undefined) {
					aData.dependentDetail[i].ZZ_ISSUED_PLACE_ERROR = "Error";
					aData.dependentDetail.currentPage = i + 1;
					return "Please enter required field(s)";
				} else {
					aData.dependentDetail[i].ZZ_ISSUED_PLACE_ERROR = "None";
				}
			}
		} catch (ex) {
		}
	},
	saveDependent : function(aData, oController) {
		// Delete validation and date picker
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oHomeThis);
		var aDataCopy = jQuery.extend(true, {}, aData);
		delete aDataCopy.dependentDetail.currentPage;
		delete aDataCopy.employeeDetail.selectedTab;
		delete aDataCopy.employeeDetail.isEditable;
		delete aDataCopy.employeeDetail.isNotSingle;
		delete aDataCopy.employeeDetail.__metadata;
		try {
			for ( var i = 0; i < aDataCopy.dependentDetail.length; i++) {
				delete aDataCopy.dependentDetail[i].ZZ_DATE_ISSUE_VALUE;
				delete aDataCopy.dependentDetail[i].ZZ_DATE_EXPIRY_VALUE;
				delete aDataCopy.dependentDetail[i].ZZ_DATE_ISSUE_ERROR;
				delete aDataCopy.dependentDetail[i].ZZ_DATE_EXPIRY_ERROR;
				delete aDataCopy.dependentDetail[i].ZZ_PASSPORT_NO_ERROR;
				delete aDataCopy.dependentDetail[i].ZZ_ISSUED_PLACE_ERROR;
				delete aDataCopy.dependentDetail[i].isEnabled;
				delete aDataCopy.dependentDetail[i].isVisible;
				delete aDataCopy.dependentDetail[i].__metadata;
				// Delete all other passport info if number is blank
				if (aDataCopy.dependentDetail[i].ZZ_PASSPORT_NO.trim() == "" || aDataCopy.dependentDetail[i].ZZ_PASSPORT_NO == undefined) {
					aDataCopy.dependentDetail[i].ZZ_DATE_ISSUE = "";
					aDataCopy.dependentDetail[i].ZZ_DATE_EXPIRY = "";
					aDataCopy.dependentDetail[i].ZZ_PASSPORT_NO = "";
					aDataCopy.dependentDetail[i].ZZ_ISSUED_PLACE = "";
					aDataCopy.dependentDetail[i].ZZ_CNTRY_ISSUED = "";
					aDataCopy.dependentDetail[i].ZZ_PASSPORT_NAME = "";
				}
			}
		} catch (ex) {
		}
		// Save data in deep entity
		var token = "";
		var get = $.ajax({
			cache : false,
			url : sServiceUrl + "EMP_PASSPORT_INFOSet",
			type : "GET",
			headers : {
				'Authorization' : token
			},
			beforeSend : function(xhr) {
				xhr.setRequestHeader('X-CSRF-Token', 'Fetch');
			},
		});
		get.done(function(result, response, header) {
			token = header.getResponseHeader("X-CSRF-Token");
			var aSave = aDataCopy.employeeDetail;
			aSave.EMPtoEMPDEPNDNT = aDataCopy.dependentDetail;
			jQuery.ajax({
				cache : false,
				url : sServiceUrl + "DEP_EMPSet",
				type : "POST",
				beforeSend : function(xhr) {
					xhr.setRequestHeader('X-Requested-With', "XMLHttpRequest");
					xhr.setRequestHeader('X-CSRF-Token', token);
					xhr.setRequestHeader('Accept', "application/json");
					xhr.setRequestHeader('DataServiceVersion', "2.0");
					xhr.setRequestHeader('Content-Type', "application/json");
				},
				data : JSON.stringify(aSave),
				dataType : "json",
				success : function(data) {
					sap.m.MessageToast.show("Saved successfully");
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oHomeThis);
				},
				fail : function(data) {
					alert("Error occurs");
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oHomeThis);
				}
			});
		});
	},
	// Upload function
	openDeputationFileDialog : function(controller, model) {
		if (!controller[model.getData().FileUpload.length.toString()]) {
			controller[model.getData().FileUpload.length.toString()] = sap.ui.xmlfragment("sap.ui.project.e2etm.fragment.common.DeputationFileDialog", controller);
			controller[model.getData().FileUpload.length.toString()].setModel(model);
			controller.getView().addDependent(controller[model.getData().FileUpload.length.toString()]);
			sap.ui.project.e2etm.util.StaticUtility.filterDocument(controller, model);
		}
		controller[model.getData().FileUpload.length.toString()].open();
	},
	closeFileDialog : function(controller, model) {
		controller[model.getData().FileUpload.length.toString()].close();
	},
	filterDocument : function(controller, model, sDocumentType) {
		var oDocumentName = controller[model.getData().FileUpload.length.toString()].getContent()[0].getItems()[0].getItems()[1].getItems()[1];
		var oDocumentType = controller[model.getData().FileUpload.length.toString()].getContent()[0].getItems()[0].getItems()[0].getItems()[1];
		var sDocType = "P";
		if (sap.ui.getCore().getModel("global").getData().currentStage == "2" && (sap.ui.getCore().getModel("global").getData().currentSubSet == "1_2_1" || sap.ui.getCore().getModel("global").getData().currentSubSet == "1_3_1")) {
			sDocType = "S";
		}
		if (sap.ui.getCore().getModel("global").getData().currentStage == "2" && sap.ui.getCore().getModel("global").getData().currentSubSet == "1_4_1") {
			sDocType = "T";
		}
		var ofilterType = new sap.ui.model.Filter("DOMVALUE_L", sap.ui.model.FilterOperator.EQ, sDocType);
		oDocumentType.getBinding("items").filter([ ofilterType ], sap.ui.model.FilterType.Application);
		var afilter = new Array();
		sap.ui.project.e2etm.util.StaticUtility.setFilter(controller, afilter);
		oDocumentName.getBinding("items").filter(afilter, sap.ui.model.FilterType.Application);
	},
	uploadDocument : function(controller, model) {
		var oFileUpload = controller[model.getData().FileUpload.length.toString()].getContent()[0].getItems()[0].getItems()[2].getItems()[1];
		var oDocumentName = controller[model.getData().FileUpload.length.toString()].getContent()[0].getItems()[0].getItems()[1].getItems()[1];
		if (oFileUpload.getProperty("value").trim() == "") {
			sap.m.MessageToast.show("Please select an upload file", {
				my : "center center",
				at : "center center"
			});
		} else if (!sap.ui.project.e2etm.util.StaticUtility.validateFileName(oDocumentName.getProperty("selectedKey"), model)) {
			sap.m.MessageToast.show("Already uploaded", {
				my : "center center",
				at : "center center"
			});
		} else {
			var oDocumentType = controller[model.getData().FileUpload.length.toString()].getContent()[0].getItems()[0].getItems()[0].getItems()[1];
			var sFileType = oFileUpload.oFileUpload.files[0].type;
			var sImage = sap.ui.project.e2etm.util.StaticUtility.getIconMIMEType(sFileType);
			var sExt = oFileUpload.getProperty("value");
			sExt = sExt.substr(sExt.lastIndexOf("."));
			var oData = {
				FileName : oDocumentName.getProperty("selectedKey"),
				Extension : sExt,
				DocType : oDocumentType.getProperty("selectedKey"),
				Content : oFileUpload,
				Image : sImage,
				Checked : false,
				Deleted : false,
				URL : ""
			};
			controller[model.getData().FileUpload.length.toString()].close();
			model.getData().FileUpload.push(oData);
			// Upload file to server
			var aData = controller.getView().getModel().getData();
			sap.ui.project.e2etm.util.StaticUtility.uploadFile(oDeputationThis, sap.ui.getCore().byId("List_Document_Id").getModel(), aData.screenData.ZZ_DEP_REQ, aData.screenData.ZZ_DEP_PERNR);
		}
	},
	getIconMIMEType : function(sFileType) {
		var sImage = "images/document.jpg";
		var sPrefixType = sFileType.substr(0, sFileType.indexOf("/"));
		if (sFileType == "application/msword" || sFileType == "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
			sImage = "images/word.jpg";
		} else if (sFileType == "application/vnd.ms-excel" || sFileType == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
			sImage = "images/excel.jpg";
		} else if (sFileType == "application/pdf") {
			sImage = "images/pdf.jpg";
		} else if (sPrefixType == "image") {
			sImage = "images/photo.jpg";
		}
		return sImage;
	},
	getIconFileType : function(sExtension) {
		switch (sExtension) {
		case ".gif":
		case ".jpeg":
		case ".png":
		case ".jpg":
			return "images/photo.jpg";
		case ".doc":
		case ".docx":
			return "images/word.jpg";
		case ".xls":
		case ".xlsx":
			return "images/excel.jpg";
		case ".pdf":
			return "images/pdf.jpg";
		}
		return "images/document.jpg";
	},
	validateFileName : function(sFileName, oModel) {
		for ( var i = 0; i < oModel.getData().FileUpload.length; i++) {
			if (sFileName == oModel.getData().FileUpload[i].FileName && oModel.getData().FileUpload[i].Deleted == false) {
				return false;
			}
		}
		return true;
	},
	setCheckMark : function(bChecked, sDocumentName, sDocumentType, oModel) {
		for ( var i = 0; i < oModel.getData().DocumentName.length; i++) {
			if (oModel.getData().DocumentName[i].DocName == sDocumentName && oModel.getData().DocumentName[i].DocType == sDocumentType) {
				if (bChecked == true) {
					oModel.getData().DocumentName[i].Image = "images/icon-green-check.png";
				} else {
					oModel.getData().DocumentName[i].Image = "";
				}
				return;
			}
		}
	},
	// Check all documents are uploaded
	checkRequredDocuments : function(oModel) {
		var aItem = sap.ui.getCore().byId("List_Document_Id").getItems();
		for ( var i = 0; i < aItem.length; i++) {
			if (aItem[i].getContent()[0].getItems()[0].getProperty("src").trim() == "") {
				return false;
			}
		}
		return true;
	},
	getDocument : function(sCountry, sVisaType, controller, sDepReq, sEmpNo) {
		try {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oDeputationThis);
			var oModel = new sap.ui.model.json.JSONModel();
			var oDataModel = new sap.ui.model.odata.ODataModel(sServiceUrl);
			var batchOperation0 = oDataModel.createBatchOperation("VISA_DOCSSet?$filter=Country+eq+'" + sCountry + "'+and+VisaType+eq+'" + sVisaType + "'", "GET");
			var batchOperation1 = oDataModel.createBatchOperation("VISA_DOCSSet?$filter=Country+eq+'" + sCountry + "'+and+VisaType+eq+'DPND'", "GET");
			var batchOperation2 = oDataModel.createBatchOperation("DmsDocsSet?$filter=DepReq+eq+'" + sDepReq + "'+and+EmpNo+eq+'" + sEmpNo + "'", "GET");
			var batchOperation3 = oDataModel.createBatchOperation("GetDomain?DomainName='ZZ_DOC_TYPE'&$format=json", "GET");
			var batch = [batchOperation0,batchOperation1,batchOperation2,batchOperation3];
			var ppCollectionFlag = false;
			if(sap.ui.getCore().getModel("global").getData().currentStage == "2"&&
			   sap.ui.getCore().getModel("global").getData().currentSubSet == "1_4_1" &&
			   oDeputationThis.getView().getModel().getData().screenData.ZZ_TRV_REQ!="0000000000" && 
			   oDeputationThis.getView().getModel().getData().screenData.ZZ_TRV_REQ!="")
				{
				var sRequestNoZero = oDeputationThis.getView().getModel().getData().screenData.ZZ_TRV_REQ.replace(/^0+/, '');
				batch.push(oDataModel.createBatchOperation("DmsDocsSet?$filter=DepReq+eq+'" + sRequestNoZero + "'+and+EmpNo+eq+'" + sEmpNo + "'+and+DocType+eq+'TCK'", "GET"));
				ppCollectionFlag = true;
				}
			
			var cggsFormsFlag = false;
			var asgTyp = controller.getView().getModel().getData().screenData.ZZ_ASG_TYP;
			if(sap.ui.getCore().getModel("global").getData().currentStage == "1"&&
			   sap.ui.getCore().getModel("global").getData().currentSubSet == "1_2_1"&&
			   (sap.ui.getCore().getModel("profile").getData().currentRole == "DEPU" ||
					   sap.ui.getCore().getModel("profile").getData().currentRole == "GRM" || 
					   sap.ui.getCore().getModel("profile").getData().currentRole == "EMP")){
				if(controller.getView().getModel().getData().screenData.ZZ_DEP_TOCNTRY == "DE" &&
						controller.getView().getModel().getData().screenData.ZZ_ASG_TYP == "STA"){
					  batch.push(oDataModel.createBatchOperation("DmsDocsSet?$filter=DepReq+eq+'" + sDepReq + "'+and+EmpNo+eq+'" + sEmpNo + "'+and+DocType+eq+'CGF'", "GET"));
					  cggsFormsFlag = true;
				}else if(sap.ui.project.e2etm.util.StaticUtility.checkStvaAsg(asgTyp) && 
						controller.getView().getModel().getData().screenData.ZZ_TRV_CAT == "TRFR"){
					  batch.push(oDataModel.createBatchOperation("DmsDocsSet?$filter=DepReq+eq+'" + sDepReq + "'+and+EmpNo+eq+'" + sEmpNo + "'+and+DocType+eq+'SRQ'", "GET"));
					  cggsFormsFlag = true;
				}
			}
			
			oDataModel.addBatchReadOperations(batch);
			oDataModel.submitBatch(function(oResult) {
				if (sDeputationNo == '') {
					sap.ui.getCore().byId("FileUploadButtonsId").setVisible(false);
					sap.ui.getCore().byId("ConfirmUploadFileId").setVisible(false);
				} else {
					// Visible and invisible three buttons on top
					try {
						if (sap.ui.getCore().getModel("profile").getData().currentRole == "DEPU") {
							if (sap.ui.getCore().getModel("global").getData().currentStage == "2" && ((sap.ui.getCore().getModel("global").getData().currentSubSet == "1_1_1" && oDeputationThis.getView().getModel().getData().screenData.ZZ_STAT_FLAG == "AA005") || (sap.ui.getCore().getModel("global").getData().currentSubSet == "1_3_1" && oDeputationThis.getView().getModel().getData().screenData.ZZ_STAT_FLAG == "AA007") || (sap.ui.getCore().getModel("global").getData().currentSubSet == "1_4_1" && oDeputationThis.getView().getModel().getData().screenData.ZZ_STAT_FLAG == "AA008"))) {
								sap.ui.getCore().byId("FileUploadButtonsId").setVisible(true);
							
							}else {
								sap.ui.getCore().byId("FileUploadButtonsId").setVisible(false);
							}
							sap.ui.getCore().byId("ConfirmUploadFileId").setVisible(false);
						} else {
							if (controller.getView().getModel().getData().screenData.ZZ_DEP_TYPE == "INTL") {
								if (sap.ui.getCore().getModel("global").getData().currentStage == "1") {
									if (sap.ui.getCore().getModel("global").getData().currentSubSet == "1_2_1" && sap.ui.getCore().getModel("profile").getData().currentRole == "EMP" && (controller.getView().getModel().getData().screenData.ZZ_STAT_FLAG == "AA004" || controller.getView().getModel().getData().screenData.ZZ_STAT_FLAG == "JJ003")) {
										sap.ui.getCore().byId("FileUploadButtonsId").setVisible(true);
										sap.ui.getCore().byId("ConfirmUploadFileId").setVisible(true);
									} else {
										sap.ui.getCore().byId("FileUploadButtonsId").setVisible(false);
										sap.ui.getCore().byId("ConfirmUploadFileId").setVisible(false);
									}
								} else if (sap.ui.getCore().getModel("global").getData().currentStage == "2") {
									if ((sap.ui.getCore().getModel("global").getData().currentSubSet == "1_2_1" && sap.ui.getCore().getModel("profile").getData().currentRole == "EMP" && (controller.getView().getModel().getData().screenData.ZZ_STAT_FLAG == "JJ007" || controller.getView().getModel().getData().screenData.ZZ_STAT_FLAG == "JJ003")) || (sap.ui.getCore().getModel("global").getData().currentSubSet == "1_4_1" && (controller.getView().getModel().getData().screenData.ZZ_STAT_FLAG == "JJ010" || controller.getView().getModel().getData().screenData.ZZ_STAT_FLAG == "JJ003" || controller.getView().getModel().getData().screenData.ZZ_STAT_FLAG == "JJ002"))) {
										// Display Select file and upload
										// buttons
										sap.ui.getCore().byId("FileUploadButtonsId").setVisible(true);
										sap.ui.getCore().byId("ConfirmUploadFileId").setVisible(true);
									} else {
										sap.ui.getCore().byId("FileUploadButtonsId").setVisible(false);
										sap.ui.getCore().byId("ConfirmUploadFileId").setVisible(false);
									}
								} else {
									sap.ui.getCore().byId("FileUploadButtonsId").setVisible(false);
									sap.ui.getCore().byId("ConfirmUploadFileId").setVisible(false);
								}
							} else {
								sap.ui.getCore().byId("FileUploadButtonsId").setVisible(false);
								sap.ui.getCore().byId("ConfirmUploadFileId").setVisible(false);
							}
						}
					} catch (exc) {
					}
					// Get and filter documents
					$.when(oDeputationThis.visaCopyPanelDone).then(function() {
						oDeputationThis.visaCopyPanelDone = $.Deferred();
						var oData = {};
						var viewData = controller.getView().getModel().getData();
						oData.DocumentName = oResult.__batchResponses[0].data.results;
						// For each dependent, append document for them
						if (viewData.selectedDependents.length != 0) {
							oData.DocumentName = jQuery.merge(oData.DocumentName, oResult.__batchResponses[1].data.results);
						}
						// Set CSS for every required document to identify
						// template or not
						for ( var i = 0; i < oData.DocumentName.length; i++) {
							oData.DocumentName[i].isNonURL = oData.DocumentName[i].Url.trim() == "";
							oData.DocumentName[i].isURL = oData.DocumentName[i].Url != "";
						}
						oData.DocumentType = oResult.__batchResponses[3].data.results;
						oModel.setData(oData);
						if (oData.DocumentName, oResult.__batchResponses[2].data) {
							oData.FileUpload = new Array();
							for ( var i = 0; i < oResult.__batchResponses[2].data.results.length; i++) {
								var sFileName = oResult.__batchResponses[2].data.results[i].FileName;
								if (sFileName.substr(0, sFileName.indexOf(".")) == "CL_CONTRACT_LETTER" || sFileName.substr(0, sFileName.indexOf(".")) == "CL_INVITATION_LETTER" || sFileName.substr(0, sFileName.indexOf(".")) == "CL_PRE_INVITATION_LETTER" || sFileName.substr(0, sFileName.indexOf(".")) == "CL_COC") {
									continue;
								}
								if (sFileName.substr(0, sFileName.indexOf(".")) == "CL_VISA_COPY_SELF_" + controller.getView().getModel().getData().screenData.ZZ_TRV_CAT) {
									try {
										viewData.selfVisa.visibleOpen = true;
										viewData.selfVisa.href = oResult.__batchResponses[2].data.results[i].FileUrl;
									} catch (ex) {
										oDeputationThis.visaCopyPanelDone = $.Deferred();
									}
									continue;
								}
								if (sFileName.substr(0, 22) == "CL_VISA_COPY_DEPENDENT") {
									try {
										for ( var iIndex = 0; iIndex < viewData.visaExistingDependent.length; iIndex++) {
											var regex = new RegExp(/\(([^)]+)\)/g);
											var dependentType = regex.exec(viewData.visaExistingDependent[iIndex].ZZ_DEPNDT_TYP)[1];
											if (sFileName.split("_")[4].split(".")[0] == dependentType) {
												viewData.visaExistingDependent[iIndex].visibleOpen = true;
												viewData.visaExistingDependent[iIndex].href = oResult.__batchResponses[2].data.results[i].FileUrl;
											}
										}
									} catch (ex) {
										oDeputationThis.visaCopyPanelDone = $.Deferred();
									}
									continue;
								}
								var bVisible = false;
								try {
									bVisible = sap.ui.getCore().byId("FileUploadButtonsId").getVisible();
								} catch (exp) {
									oDeputationThis.visaCopyPanelDone = $.Deferred();
								}
								var oItem = {
									FileName : sFileName.substr(0, sFileName.indexOf(".")),
									FileContent : oResult.__batchResponses[2].data.results[i].FileContent,
									Extension : sFileName.substr(sFileName.lastIndexOf(".")),
									DocType : sap.ui.project.e2etm.util.StaticUtility.getFileTye(sFileName.substr(0, sFileName.indexOf(".")), oResult.__batchResponses[0].data.results),
									Image : sap.ui.project.e2etm.util.StaticUtility.getIconFileType(sFileName.substr(sFileName.lastIndexOf("."))),
									URL : oResult.__batchResponses[2].data.results[i].FileUrl,
									Content : null,
									Checked : false,
									Deleted : false,
									Visible : bVisible
								};
								oData.FileUpload.push(oItem);
								sap.ui.project.e2etm.util.StaticUtility.setCheckMark(true, oItem.FileName, oItem.DocType, oModel);
							}
							
							if(ppCollectionFlag){//push Ticket document to Document List
								if(oResult.__batchResponses[4].data.results.length!=0){
									for(var pp_i=0;pp_i<oResult.__batchResponses[4].data.results.length;pp_i++){
										var sFileName = oResult.__batchResponses[4].data.results[pp_i].FileName;
										var oItem = {
												FileName : sFileName.substr(0, sFileName.indexOf(".")),
												FileContent : oResult.__batchResponses[4].data.results[pp_i].FileContent,
												Extension : sFileName.substr(sFileName.lastIndexOf(".")),
												DocType : 'T',
												Image : sap.ui.project.e2etm.util.StaticUtility.getIconFileType(sFileName.substr(sFileName.lastIndexOf("."))),
												URL : oResult.__batchResponses[4].data.results[pp_i].FileUrl,
												Content : null,
												Checked : false,
												Deleted : false,
												Visible : sap.ui.getCore().byId("FileUploadButtonsId")?sap.ui.getCore().byId("FileUploadButtonsId").getVisible():false
											};
											oData.FileUpload.push(oItem);
									}
								
								}
							}
							var cggsForms = [];
							var cggsFormsDisplay = sap.ui.getCore().byId("depuDetailedCggsChecklist--cggsFormsDisplay");
							if(cggsFormsDisplay){
								cggsFormsDisplay.setVisible(false);
								sap.ui.getCore().byId("depuDetailedCggsChecklist--btnCggsFormsUploader").setVisible(false);
								sap.ui.getCore().byId("depuDetailedCggsChecklist--btnCggsFormsRemove").setVisible(false);
								
							if(sap.ui.getCore().getModel("profile").getData().currentRole == "DEPU"){
								sap.ui.getCore().byId("depuDetailedCggsChecklist--btnCggsFormsUploader").setVisible(true);
								sap.ui.getCore().byId("depuDetailedCggsChecklist--btnCggsFormsRemove").setVisible(true);
							}
								
							if(cggsFormsFlag){
								for(var i=0;i<oResult.__batchResponses[4].data.results.length;i++){
									var sFileName = oResult.__batchResponses[4].data.results[i].FileName;
									var oItem = {
											FileName : sFileName.substr(0, sFileName.indexOf(".")),
											FileContent : oResult.__batchResponses[4].data.results[i].FileContent,
											Extension : sFileName.substr(sFileName.lastIndexOf(".")),
										    DocType:oResult.__batchResponses[4].data.results[i].DocType,
											Image : sap.ui.project.e2etm.util.StaticUtility.getIconFileType(sFileName.substr(sFileName.lastIndexOf("."))),
											URL : oResult.__batchResponses[4].data.results[i].FileUrl,
											Content : null,
											Checked : false,
											Deleted : false,
											
										};
									
									cggsForms.push(oItem);
									}
								if(cggsForms.length!=0){
									cggsFormsDisplay.setVisible(true);
									//sap.ui.getCore().byId("depuDetailedCggsChecklist--lblCggsForms").setVisible(true);
								}
								
							}
							
							var cggsFormsModel = new sap.ui.model.json.JSONModel();
							cggsFormsModel.setData(cggsForms);							
							cggsFormsDisplay.setModel(cggsFormsModel);
							
							}
							
							oModel.setData(oData);
							controller.getView().getModel().setData(viewData);
							// Filter 1st, 2nd, 3rd documents
							var afilter = new Array();
							try {
								sap.ui.getCore().byId("List_Document_Id").setModel(oModel);
								sap.ui.getCore().byId("ViewRepeatId").setModel(oModel);
								sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oDeputationThis);
								var afilter = new Array();
								ofilter = sap.ui.project.e2etm.util.StaticUtility.setFilter(controller, afilter);
								sap.ui.getCore().byId("ViewRepeatId").getBinding("rows").filter(ofilter, sap.ui.model.FilterType.Application);
								sap.ui.getCore().byId("List_Document_Id").getBinding("items").filter(afilter, sap.ui.model.FilterType.Application);
								// Invisible upload document
								if (sap.ui.getCore().byId("List_Document_Id").getItems().length == 0) {
									sap.ui.getCore().byId("panelDocument").setVisible(false);
								}
							} catch (exc) {
								sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oDeputationThis);
								oDeputationThis.visaCopyPanelDone = $.Deferred();
							}
						}
					});
				}
			}, function(oError) {
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oDeputationThis);
				sap.ca.ui.message.showMessageBox({
					type : sap.ca.ui.message.Type.ERROR,
					message : "Sorry for this inconvenience. Please contact support team",
					details : oError.responseText
				});
			});
		} catch (exc) {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oHomeThis);
		}
	},
	setFilter : function(controller, aFilterArray) {
		var sDocType = "P";
		var oFilterSingle;
		if ((sap.ui.getCore().getModel("global").getData().currentStage == "2" && sap.ui.getCore().getModel("global").getData().currentSubSet == "1_1_1") || (sap.ui.getCore().getModel("global").getData().currentStage == "1" && sap.ui.getCore().getModel("global").getData().currentSubSet == "1_2_1")) {
			sDocType = "P";
			oFilterSingle = new sap.ui.model.Filter("DocType", sap.ui.model.FilterOperator.EQ, sDocType);
			aFilterArray.push(oFilterSingle);
			if (controller.getView().getModel().getData().selectedDependents.length != 0) {
				ofilterL5 = new sap.ui.model.Filter("DocType", sap.ui.model.FilterOperator.EQ, "L5");
				aFilterArray.push(ofilterL5);
			}
		}
		if (sap.ui.getCore().getModel("global").getData().currentStage == "2" && (sap.ui.getCore().getModel("global").getData().currentSubSet == "1_2_1" || sap.ui.getCore().getModel("global").getData().currentSubSet == "1_3_1")) {
			sDocType = "S";
			oFilterSingle = new sap.ui.model.Filter("DocType", sap.ui.model.FilterOperator.EQ, sDocType);
			aFilterArray.push(oFilterSingle);
			// Filter dependent visa
			if (controller.getView().getModel().getData().screenData.ZZ_VISA_PB) {
				var sVisaTypeFilter = new sap.ui.model.Filter("VisaType", sap.ui.model.FilterOperator.EQ, "DPND");
				aFilterArray.push(sVisaTypeFilter);
			}
		}
		if (sap.ui.getCore().getModel("global").getData().currentStage == "2" && sap.ui.getCore().getModel("global").getData().currentSubSet == "1_4_1") {
			sDocType = "T";
			oFilterSingle = new sap.ui.model.Filter("DocType", sap.ui.model.FilterOperator.EQ, sDocType);
			aFilterArray.push(oFilterSingle);
		}
		return oFilterSingle;
	},
	getFileTye : function(sFileName, aArray) {
		for ( var i = 0; i < aArray.length; i++) {
			if (aArray[i].DocName == sFileName) {
				return aArray[i].DocType;
			}
		}
	},
	removeFile : function(oController, oModel) {
		if (!sap.ui.project.e2etm.util.StaticUtility.validateRemoveFile(oModel)) {
			sap.m.MessageToast.show("No document is selected");
			return;
		}
		sap.m.MessageBox.confirm("Do you want to delete selected file(s) ?", function(oAction) {
			if (oAction == "OK") {
				var sDocType = "P";
				if (sap.ui.getCore().getModel("global").getData().currentStage == "2" && (sap.ui.getCore().getModel("global").getData().currentSubSet == "1_2_1" || sap.ui.getCore().getModel("global").getData().currentSubSet == "1_3_1")) {
					sDocType = "S";
				}
				if (sap.ui.getCore().getModel("global").getData().currentStage == "2" && sap.ui.getCore().getModel("global").getData().currentSubSet == "1_4_1") {
					sDocType = "T";
				}
				var ofilterDelete = new sap.ui.model.Filter("Deleted", sap.ui.model.FilterOperator.EQ, false);
				var ofilterDocType = new sap.ui.model.Filter("DocType", sap.ui.model.FilterOperator.EQ, sDocType);
				sap.ui.getCore().byId("ViewRepeatId").getBinding("rows").filter([ ofilterDelete, ofilterDocType ], sap.ui.model.FilterType.Application);
				sap.ui.project.e2etm.util.StaticUtility.deleteFile(oController, oModel, oController.getView().getModel().getData().screenData.ZZ_DEP_REQ, oController.getView().getModel().getData().screenData.ZZ_DEP_PERNR);
			}
		});
	},
	validateUploadFile : function(oModel) {
		var sMsg = "No document found, please click on select file button";
		for ( var i = 0; i < oModel.getData().FileUpload.length; i++) {
			if (oModel.getData().FileUpload[i].URL.trim() == "") {
				return "";
			}
			if (!oModel.getData().FileUpload[i].Deleted && oModel.getData().FileUpload[i].URL != "") {
				sMsg = "Already Uploaded";
			}
		}
		return sMsg;
	},
	validateRemoveFile : function(oModel) {
		for ( var i = 0; i < oModel.getData().FileUpload.length; i++) {
			if (oModel.getData().FileUpload[i].Checked) {
				return true;
			}
		}
		return false;
	},
	uploadFileDeputation : function(oController, oControl, sDepReq, sEmpNo, sMessage) {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oHomeThis);
		var token = "";
		var get = $.ajax({
			cache : false,
			url : sServiceUrl + "EMP_PASSPORT_INFOSet",
			type : "GET",
			headers : {
				'Authorization' : token
			},
			beforeSend : function(xhr) {
				xhr.setRequestHeader('X-CSRF-Token', 'Fetch');
			},
		});
		get.done(function(result, response, header) {
			var sFileName;
			var iIndex;
			if (oControl.getId() == "UploadVisaSelf") {
				sFileName = "CL_VISA_COPY_SELF_" + oController.getView().getModel().getData().screenData.ZZ_TRV_CAT + oControl.getProperty("value").substr(oControl.getProperty("value").lastIndexOf("."));
			} else if (oControl.getId().substr(oControl.getId().length - 23) == "btnDEPUInvitationButton") {
				sFileName = "CL_INVITATION_LETTER" + oControl.getProperty("value").substr(oControl.getProperty("value").lastIndexOf("."));
			} else if (oControl.getId().substr(oControl.getId().length - 26) == "btnDEPUPreInvitationButton") {
				sFileName = "CL_PRE_INVITATION_LETTER" + oControl.getProperty("value").substr(oControl.getProperty("value").lastIndexOf("."));
			} else if (oControl.getId().substr(oControl.getId().length - 16) == "btnDEPUCOCButton") {
				sFileName = "CL_COC" + oControl.getProperty("value").substr(oControl.getProperty("value").lastIndexOf("."));
			} else if (oControl.getId().substr(0, oControl.getId().lastIndexOf("-")) == "UploadVisaDependent-panelDependentVisaCopy" || oControl.getId().substr(0, oControl.getId().lastIndexOf("-")) == "UploadVisaDependent-panelExistingDependentVisaCopy") {
				iIndex = oControl.getId().substr(oControl.getId().lastIndexOf("-") + 1);
				var regex = new RegExp(/\(([^)]+)\)/g);
				var dependentType = regex.exec(oControl.getParent().getItems()[0].getItems()[0].getText())[1];
				sFileName = "CL_VISA_COPY_DEPENDENT_" + dependentType + oControl.getProperty("value").substr(oControl.getProperty("value").lastIndexOf("."));
			}
			var file = oControl.oFileUpload.files[0];
			var sUrl = sServiceUrl + "DmsDocsSet";
			sDepReq = sDepReq == null || sDepReq == "" ? '999999999' : sDepReq;
			sEmpNo = sEmpNo == null || sEmpNo == "" ? sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_PERNR : sEmpNo;
			var sSlung = sDepReq + "," + sEmpNo + "," + sFileName + "," + "L4";
			var oHeaders = {
				'X-Requested-With' : "XMLHttpRequest",
				'X-CSRF-Token' : header.getResponseHeader("X-CSRF-Token"),
				'Accept' : "application/json",
				'DataServiceVersion' : "2.0",
				'Content-Type' : "application/json",
				"slug" : sSlung,
			};
			var post = jQuery.ajax({
				cache : false,
				type : 'POST',
				url : sUrl,
				headers : oHeaders,
				cache : false,
				contentType : file.type,
				processData : false,
				data : file,
			});
			post.success(function(data) {
				var oData = oController.getView().getModel().getData();
				if (oControl.getId() == "UploadVisaSelf") {
					oData.selfVisa.visibleOpen = true;
					oData.selfVisa.href = data.d.FileUrl;
					oController.getView().getModel().setData(oData);
				} else if (oControl.getId().substr(oControl.getId().length - 23) == "btnDEPUInvitationButton") {
					// oDeputationThis.deputationAction("007", "Invitation
					// Letters submitted");
					sap.ui.getCore().byId("lblInvitationLetter").setVisible(false);
					sap.ui.getCore().byId("flexBoxInvitationLetter").setVisible(true);
					oData.screenData.ZZ_DOC_PATH = data.d.FileUrl;
					oController.getView().getModel().setData(oData);
				} else if (oControl.getId().substr(oControl.getId().length - 26) == "btnDEPUPreInvitationButton") {
					if (oData.screenData.ZZ_DEP_TOCNTRY == "DE") {
						sap.ui.getCore().byId("lblPreInvitationLetter").setVisible(false);
						sap.ui.getCore().byId("flexBoxPreInvitationLetter").setVisible(true);
						oData.screenData.ZZ_PRE_DOC_PATH = data.d.FileUrl;
					} else {
						sap.ui.getCore().byId("lblPreInvitationLetter").setVisible(true);
						sap.ui.getCore().byId("flexBoxPreInvitationLetter").setVisible(false);
						oData.screenData.ZZ_PRE_DOC_PATH = data.d.FileUrl;
					}
					oController.getView().getModel().setData(oData);
				} else if (oControl.getId().substr(oControl.getId().length - 16) == "btnDEPUCOCButton") {
					sap.ui.getCore().byId("lblCOC").setVisible(false);
					sap.ui.getCore().byId("flexBoxCOC").setVisible(true);
					oData.screenData.ZZ_DOC_PATH = data.d.FileUrl;
					oController.getView().getModel().setData(oData);
				} else if (oControl.getId().substr(0, oControl.getId().lastIndexOf("-")) == "UploadVisaDependent-panelDependentVisaCopy" || oControl.getId().substr(0, oControl.getId().lastIndexOf("-")) == "UploadVisaDependent-panelExistingDependentVisaCopy") {
					oData.visaExistingDependent[iIndex].visibleOpen = true;
					oData.visaExistingDependent[iIndex].href = data.d.FileUrl;
					oController.getView().getModel().setData(oData);
				}
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oHomeThis);
				if (sMessage) {
					sap.m.MessageToast.show(sMessage);
				} else {
					sap.m.MessageToast.show("Upload Succesfully");
				}
			});
			post.fail(function(result, response, header) {
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oHomeThis);
			});
		});
	},
	deleteFile : function(oController, oModel, sDepReq, sEmpNo) {
		var token = "";
		var get = $.ajax({
			cache : false,
			url : sServiceUrl + "EMP_PASSPORT_INFOSet",
			type : "GET",
			headers : {
				'Authorization' : token
			},
			beforeSend : function(xhr) {
				xhr.setRequestHeader('X-CSRF-Token', 'Fetch');
			},
		});
		var iRequest = 0;
		var iResponse = 0;
		get.done(function(result, response, header) {
			var oData = oModel.getData();
			for ( var i = oData.FileUpload.length - 1; i >= 0; i--) {
				if (oData.FileUpload[i].Checked) {
					if (oData.FileUpload[i].Checked.Url != "") { // Document
																	// has
																	// already
																	// uploaded
						sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oHomeThis);
						var oHeaders = {
							"x-csrf-token" : header.getResponseHeader("X-CSRF-Token")
						};
						var FileName = oData.FileUpload[i].FileName + oData.FileUpload[i].Extension;
						iRequest++;
						var sUrl = sServiceUrl + "DmsDocsSet(DepReq='" + sDepReq + "',FileName='" + FileName + "',DocType='" + oData.FileUpload[i].DocType + "',EmpNo='" + sEmpNo + "',Index=" + iRequest + ",Module='',Country='')";
						var oItem = jQuery.ajax({
							cache : false,
							type : 'DELETE',
							url : sUrl,
							headers : oHeaders,
							cache : false,
							processData : false
						});
						oItem.success(function(data, response, header) {
							for ( var j = 0; j < oData.FileUpload.length; j++) {
								if (oData.FileUpload[j].FileName + oData.FileUpload[j].Extension == header.getResponseHeader('FileName')) {
									sap.ui.project.e2etm.util.StaticUtility.setCheckMark(false, oData.FileUpload[j].FileName, oData.FileUpload[j].DocType, oModel);
									oData.FileUpload.splice(j, 1);
									oModel.setData(oData);
									break;
								}
							}
							iResponse++;
							if (iRequest == iResponse) {
								sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oHomeThis);
								sap.m.MessageToast.show("Deleted Succesfully");
							}
						});
						oItem.fail(function(err) {
							iResponse++;
							if (iRequest == iResponse) {
								sap.ca.ui.message.showMessageBox({
									type : sap.ca.ui.message.Type.ERROR,
									message : "Error occurs, please click on remove button again",
									details : "Error occurs, please click on remove button again"
								});
								sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oHomeThis);
							}
						});
					} else { // Document has not uploaded
						sap.ui.project.e2etm.util.StaticUtility.setCheckMark(false, oData.FileUpload[i].FileName, oData.FileUpload[i].DocType, oModel);
						oData.FileUpload[i].splice(i, 1);
						oModel.setData(oData);
					}
				}
			}
		});
	},
	uploadFile : function(oController, oModel, sDepReq, sEmpNo) {
		var sMessage = sap.ui.project.e2etm.util.StaticUtility.validateUploadFile(oModel);
		if (sMessage != "") {
			sap.m.MessageToast.show(sMessage);
			return;
		}
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oHomeThis);
		var token = "";
		var get = $.ajax({
			cache : false,
			url : sServiceUrl + "EMP_PASSPORT_INFOSet",
			type : "GET",
			headers : {
				'Authorization' : token
			},
			beforeSend : function(xhr) {
				xhr.setRequestHeader('X-CSRF-Token', 'Fetch');
			},
		});
		get.done(function(result, response, header) {
			for ( var i = 0; i < oModel.getData().FileUpload.length; i++) {
				if (oModel.getData().FileUpload[i].URL.trim() == "") {
					var FileName = oModel.getData().FileUpload[i].FileName + oModel.getData().FileUpload[i].Extension;
					var file = oModel.getData().FileUpload[i].Content.oFileUpload.files[0];
					var sUrl = sServiceUrl + "DmsDocsSet";
					var sSlung = sDepReq + "," + sEmpNo + "," + FileName + "," + oModel.getData().FileUpload[i].DocType;
					var oHeaders = {
						'X-Requested-With' : "XMLHttpRequest",
						'X-CSRF-Token' : header.getResponseHeader("X-CSRF-Token"),
						'Accept' : "application/json",
						'DataServiceVersion' : "2.0",
						'Content-Type' : "application/json",
						"slug" : sSlung,
					};
					var oItem = jQuery.ajax({
						cache : false,
						cache : false,
						type : 'POST',
						url : sUrl,
						headers : oHeaders,
						cache : false,
						contentType : file.type,
						processData : false,
						data : file,
					});
					oItem.success(function(data) {
						var oData = oModel.getData();
						for ( var i = 0; oData.FileUpload.length; i++) {
							if (oData.FileUpload[i].FileName + oData.FileUpload[i].Extension == data.d.FileName) {
								oData.FileUpload[i].URL = data.d.FileUrl;
								oModel.setData(oData);
								sap.ui.project.e2etm.util.StaticUtility.setCheckMark(true, oData.FileUpload[i].FileName, oData.FileUpload[i].DocType, oModel);
								oModel.refresh();
								sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oHomeThis);
								sap.m.MessageToast.show("Uploaded Succesfully");
								break;
							}
						}
					});
					oItem.fail(function(err) {
						var oData = oModel.getData();
						// Remove invalid file or server error
						oData.FileUpload.pop();
						oModel.setData(oData);
						sap.ca.ui.message.showMessageBox({
							type : sap.ca.ui.message.Type.ERROR,
							message : "Error occurs, please select a file and upload again",
							details : "Please select following file types: txt, pdf, jpg, png, gif, doc, docx, xls, xlsx"
						});
						sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oHomeThis);
					});
				}
			}
		});
	},
	noBudgetCheck : function(sStatus, sHasBudget, sDepProfile, sDepCost, sFund, sType) {
		if (sHasBudget == "T" || sFund.trim() == "F03" || sType == "DOME") {
			return true;
		} else {
			if (sHasBudget == "X" && // No budget
			(sStatus.substr(2, 5) != "003" && sStatus != "HH006" && sStatus != "CC006")) { // Not
																							// fist
																							// approval,
																							// not
																							// from
																							// tax
																							// or
																							// DH
				return true;
			} else {
				var aDep = sDepCost.split("/");
				var aFund = sFund.split("/");
				for ( var i = 0; i < aDep.length; i++) {
					if (sDepProfile.indexOf(aDep[i].trim()) != -1 && aFund[i].trim() == "F03") {
						return true;
					}
				}
			}
		}
		return false;
	},
	calculateTotalCost : function(aArray) {
		var nTotal = 0;
		try {
			for ( var i = 0; i < aArray.length; i++) {
				nTotal += parseFloat(aArray[i].bag_cost) + parseFloat(aArray[i].board_cost) + parseFloat(aArray[i].con_cost) + parseFloat(aArray[i].dep_cost) + parseFloat(aArray[i].inl_cost) + parseFloat(aArray[i].ins_cost) + parseFloat(aArray[i].lod_cost) + parseFloat(aArray[i].otr_costs) + parseFloat(aArray[i].tkt_cost) + parseFloat(aArray[i].visa_cost);
			}
		} catch (exc) {
		}
		return nTotal;
	},
	showTooltipFund : function(oData) {
		try {
			for ( var i = 0; i < oData.TRV_HDRtoTRV_COST_ASGN.results.length; i++) {
				for ( var j = 0; j < oData.fund.length; j++) {
					if (oData.fund[j].fincode == oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_GEBER) {
						oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_GEBER_TOOLTIP = oData.fund[j].beschr;
						break;
					}
				}
			}
		} catch (ex) {
		}
	},
	showTooltipBudgetCode : function(oData) {
		try {
			for ( var i = 0; i < oData.TRV_HDRtoTRV_COST_ASGN.results.length; i++) {
				for ( var j = 0; j < oData.budgetCost.length; j++) {
					if (oData.budgetCost[j].FIELD1 == oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_FIPEX) {
						oData.TRV_HDRtoTRV_COST_ASGN.results[i].ZZ_FIPEX_TOOLTIP = oData.budgetCost[j].FIELD3;
						break;
					}
				}
			}
		} catch (ex) {
		}
	},
	showTooltipVKM : function(value) {
		try {
			for ( var j = 0; j < oData.vkm.length; j++) {
				if (oData.vkm[j].VKMCode == oData.ZZ_VKM) {
					oData.ZZ_VKM_TOOLTIP = oData.vkm[j].VKMName;
					break;
				}
			}
		} catch (ex) {
		}
	},
	donwloadSelectedFile : function() {
		if (!sap.ui.project.e2etm.util.StaticUtility.validateRemoveFile(sap.ui.getCore().byId("List_Document_Id").getModel())) {
			sap.m.MessageToast.show("No document is selected");
			return;
		}
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oHomeThis);
		setTimeout(function() {
			// Loop through the list of selected files
			var oData = sap.ui.getCore().byId("List_Document_Id").getModel().getData();
			// Function for adding zip in to the jszip instance
			var deferredAddZip = function(url, filename, zip) {
				var deferred = $.Deferred();
				var get = $.ajax({
					cache : false,
					url : sServiceUrl + url,
					type : "GET",
					async : false
				});
				get.done(function(data, header, response) {
					zip.file(filename, data.d.FileContent, {
						base64 : true
					});
					deferred.resolve(data);
				}).fail(function(err) {
					deferred.reject(err);
				});
				return deferred;
			};
			var zip = new JSZip();
			var deferreds = [];
			for ( var i = oData.FileUpload.length - 1; i >= 0; i--) {
				if (oData.FileUpload[i].Checked) {
					var url = "DmsDocsSet(DepReq='" + oDeputationThis.getView().getModel().getData().screenData.ZZ_DEP_REQ + "',EmpNo='" + oDeputationThis.getView().getModel().getData().screenData.ZZ_DEP_PERNR + "',DocType='" + oData.FileUpload[i].DocType + "',FileName='" + oData.FileUpload[i].FileName + oData.FileUpload[i].Extension + "',Index=1,Module='',Country='')?$format=json";
					deferreds.push(deferredAddZip(url, "SWIFT/" + oData.FileUpload[i].FileName + oData.FileUpload[i].Extension, zip));
				}
			}
			// when everything has been downloaded, we can trigger the dl
			$.when.apply($, deferreds).done(function() {
				var blob = zip.generate({
					type : "blob"
				});
				// see FileSaver.js
				saveAs(blob, "SWIFT.zip");
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oHomeThis);
			}).fail(function(err) {
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oHomeThis);
				alert('Browser does not support cross origin resource sharing, please try in Chrome');
			});
		}, 1000);
	},
	checkPhoneNo : function(sPhoneNo) {
		if ((!isNaN(sPhoneNo.charAt(1)) || sPhoneNo.charAt(1) == "+") && sPhoneNo.trim().length > 8) {
			return !isNaN(sPhoneNo.slice(1));
		} else {
			return false;
		}
	},
	findView : function(oControl) {
		if (oControl instanceof sap.ui.core.mvc.View) {
			return oControl;
		}
		return oControl.getParent() ? this.findView(oControl.getParent()) : null;
	},
	mappingDependent : function(sType) {
		switch (sType) {
		case "00": // SELF
			return '';
			break;
		case "01": // Spouse
			return 'Spouse';
			break;
		case "02": // Child 1
			return 'C1';
			break;
		case "90": // Child 2
			return 'C2';
			break;
		case "03": // Child 3
			return 'C3';
			break;
		case "04": // Child 4
			return 'C4';
			break;
		case "05": // Child 5
			return 'C5';
			break;
		}
	},
	checkDateFormat : function(sDate) { // dd/MM/yyyy
		var pattern = /^\d{8}$/;
		return sDate.match(pattern);
	},
	uploadCollectionFile : function(oController, fFile, sDepReq, sEmpNo, sModule, sMessage) {
		var aFiles = oController.getView().getModel("new").getData().Files;
		var bExisted = false;
		if (aFiles) {
			bExisted = this.checkExistingArray(aFiles, "FileName", fFile.name);
		}
		// if file existed
		if (bExisted) {
			sap.m.MessageToast.show("File " + fFile.name + " existed. Please delete it or rename your file before uploading again.");
			// oController.getView().byId("UploadCollection").removeAllItems();
		} else {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oController);
			var token = "";
			var get = $.ajax({
				cache : false,
				url : sServiceUrl + "EMP_PASSPORT_INFOSet",
				type : "GET",
				headers : {
					'Authorization' : token
				},
				beforeSend : function(xhr) {
					xhr.setRequestHeader('X-CSRF-Token', 'Fetch');
				},
			});
			get.done(function(result, response, header) {
				var sFileName = fFile.name;
				var sUrl = sServiceUrl + "DmsDocsSet";
				sDepReq = sDepReq == null || sDepReq == "" ? '999999999' : sDepReq;
				sEmpNo = sEmpNo == null || sEmpNo == "" ? sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_PERNR : sEmpNo;
				var sSlung = sDepReq + "," + sEmpNo + "," + sFileName + "," + sModule;
				var oHeaders = {
					'X-Requested-With' : "XMLHttpRequest",
					'X-CSRF-Token' : header.getResponseHeader("X-CSRF-Token"),
					'Accept' : "application/json",
					'DataServiceVersion' : "2.0",
					'Content-Type' : "application/json",
					"slug" : sSlung,
				};
				var post = jQuery.ajax({
					cache : false,
					type : 'POST',
					url : sUrl,
					headers : oHeaders,
					cache : false,
					contentType : fFile.type,
					processData : false,
					data : fFile,
				});
				post.success(function(data) {
					var oData = oController.getView().getModel("new").getData();
					var oItem = {};
					oItem = {
						Country : "",
						// DepReq: oData.ZZ_REINR,
						DepReq : sDepReq,
						DocType : sModule,
						EmpNo : "",
						FileContent : "",
						FileMimeType : data.d.FileMimeType,
						FileName : data.d.FileName,
						FileUrl : data.d.FileUrl,
						Index : data.d.Index,
						Module : data.d.Module,
					};
					try {
						if (oData.Files.constructor.name == "Object") {
							var tempArray = [];
							oData.Files = tempArray;
						}
					} catch (error) {
					}
					oData.Files.unshift(oItem);
					oController.getView().byId("UploadCollection").getBinding("items").update();
					oController.getView().byId("UploadCollection").aItems = [];
					oController.getView().getModel("new").refresh(true);
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
					if (sMessage) {
						sap.m.MessageToast.show(sMessage);
					} else {
						sap.m.MessageToast.show("Upload Succesfully");
					}
				});
				post.fail(function(result, response, header) {
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
				});
			});
		} // end if existed
	}, // end uploadCollectionFile
	deleteUploadCollectionFile : function(oController, oEvent, sDepReq, sFileName, sDocType, sEmpNo, sIndex) {
		var oThis = this;
		var token = "";
		var get = $.ajax({
			cache : false,
			url : sServiceUrl + "EMP_PASSPORT_INFOSet",
			type : "GET",
			headers : {
				'Authorization' : token
			},
			beforeSend : function(xhr) {
				xhr.setRequestHeader('X-CSRF-Token', 'Fetch');
			},
		});
		var oSource = oEvent.getSource();
		var oParameter = oEvent.getParameters();
		get.done(function(result, response, header) {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oController);
			var oHeaders = {
				"x-csrf-token" : header.getResponseHeader("X-CSRF-Token")
			};
			var sUrl = sServiceUrl + "DmsDocsSet(DepReq='" + sDepReq + "',FileName='" + sFileName + "',DocType='" + sDocType + "',EmpNo='" + sEmpNo + "',Index=" + sIndex + ",Module='',Country='')";
			var oItem = jQuery.ajax({
				cache : false,
				type : 'DELETE',
				url : sUrl,
				headers : oHeaders,
				cache : false,
				processData : false
			});
			oItem.success(function(data, response, header) {
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
				sap.m.MessageToast.show("Deleted Succesfully");
				var aFiles = oController.getView().getModel("new").getData().Files;
				var iFileIndex = oThis.getArrayIndex(aFiles, "FileName", sFileName);
				aFiles.splice(iFileIndex, 1);
				oController.getView().byId("UploadCollection").getBinding("items").update();
				oController.getView().getModel("new").refresh(true);
			});
			oItem.fail(function(err) {
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
				sap.m.MessageToast.show("Deleted Failed");
			});
		});
	}, // End delete upload Collection file
	// binding approve info
	dynamicBindingApprove : function(ZZ_REINR, ZZ_TRV_KEY, ZZ_MODID, ZZ_SMODID, oModel) {
		var oThis = this;
		oComponent.getModel().read("/ZE2E_REQ_LOGSet?$filter=ZZ_REINR+eq+'" + ZZ_REINR + "'+and+ZZ_TRV_KEY+eq+'" + ZZ_TRV_KEY + "'+and+ZZ_MODID+eq+'" + ZZ_MODID + "'+and+ZZ_SMODID+eq+'" + ZZ_SMODID + "'", null, null, false, function(oDataComment, oRespone) {
			oModel.setData(oDataComment);
		}, function(error) {
			alert("No data found for approvaltab");
		});
	},
	//
	getComment : function(sTravelRequest, sType, ZZ_MODID, oThis) {
		// var sURL =
		// "/ZE2E_REQ_LOGSet?$filter=ZZ_TRV_REQ+eq+'{0}'+and+ZZ_TRV_KEY+eq+'{1}'+and+ZZ_MODID+eq+'{2}'+and+ZZ_SMODID+eq+'{3}'";
		var sURL = "/ZE2E_REQ_LOGSet?$filter=ZZ_TRV_REQ+eq+'{0}'+and+ZZ_TRV_KEY+eq+'{1}'+and+ZZ_MODID+eq+'{2}'";
		sURL = sURL.replace("{0}", sTravelRequest);
		sURL = sURL.replace("{1}", sType);
		sURL = sURL.replace("{2}", ZZ_MODID);
		// sURL = sURL.replace("{3}", ZZ_SMODID);
		var oModelApprove = oComponent.getModel();
		oThis.getView().byId("idListApprove").setModel(oModelApprove);
		oThis.getView().byId("idListApprove").bindItems({
			path : sURL,
			template : new sap.m.FeedListItem({
				icon : "sap-icon://employee",
				sender : "{path: 'ZZ_ACTION',formatter: 'sap.ui.project.e2etm.util.Formatter.actionBy'}" + " by " + "{ZZ_NT_ID}",
				timestamp : "{path:'ZZ_RTIMESTAMP', formatter: 'sap.ui.project.e2etm.util.Formatter.dateApprove'}",
				text : "{ZZ_COMMENTS}",
				info : "Date and time"
			})
		});
	},
	// substract 2 date TGG1HC
	substractDate : function(sDate1, sDate2) {
		if (sDate1 != null && sDate2 != null) {
			var dEnd = new Date(sDate1.substr(0, 4), sDate1.substr(4, 2) - 1, sDate1.substr(6, 2));
			// var dStart = new Date(sDate2.substr(0,4),
			// sDate2.substr(4,2)-1,sDate2.substr(6,2));
			var dStart = new Date(sDate2.getFullYear(), sDate2.getMonth(), sDate2.getDate());
			var dDur = new Date(dEnd - dStart);
			var dReturn = dDur.getTime() / (1000 * 3600 * 24) + 1;
			dReturn = "" + Math.round(dReturn);
			return dReturn;
		}
	},
	// substract 2 date with type database string
	substractDateTypeString : function(sDate1, sDate2) {
		if (sDate1 != null && sDate2 != null) {
			var dEnd = new Date(sDate1.substr(0, 4), sDate1.substr(4, 2) - 1, sDate1.substr(6, 2));
			var dStart = new Date(sDate2.substr(0, 4), sDate2.substr(4, 2) - 1, sDate2.substr(6, 2));
			// var dStart = new Date(sDate2.getFullYear(),
			// sDate2.getMonth(),sDate2.getDate());
			var dDur = new Date(dEnd - dStart);
			var dReturn = dDur.getTime() / (1000 * 3600 * 24);
			dReturn = "" + Math.round(dReturn);
			return dReturn;
		}
	},
	getDocumentList : function(oController, sRequest, sEmployee, sDocType, sModule, sCountry) {
		var aaVendorFlag = false;
		var s1stUrl = "DmsDocsSet?$filter=DepReq+eq+'{0}'+and+EmpNo+eq+'{1}'+and+Module+eq+'{2}'+and+Country+eq+'{3}'";
		s1stUrl = s1stUrl.replace("{0}", sRequest);
		s1stUrl = s1stUrl.replace("{1}", sEmployee);
		s1stUrl = s1stUrl.replace("{2}", sModule);
		s1stUrl = s1stUrl.replace("{3}", sCountry);
		var s2ndUrl = "DmsDocsSet?$filter=DepReq+eq+'{0}'+and+EmpNo+eq+'{1}'+and+DocType+eq+'{2}'";
		s2ndUrl = s2ndUrl.replace("{0}", sRequest);
		s2ndUrl = s2ndUrl.replace("{1}", sEmployee);
		s2ndUrl = s2ndUrl.replace("{2}", sDocType);
		// s2ndUrl = s2ndUrl.replace("{2}", "INS");
		var oBatch0 = oComponent.getModel().createBatchOperation(s1stUrl, "GET");
		var oBatch1 = oComponent.getModel().createBatchOperation(s2ndUrl, "GET");
		try {
			if (sModule == "INSR" || sModule == "ACOM") {
				var s3rdUrl = "DmsDocsSet?$filter=DepReq+eq+'{0}'+and+EmpNo+eq+'{1}'+and+DocType+eq+'{2}'";
				var sRequestNoZero = sRequest.replace(/^0+/, '');
				s3rdUrl = s3rdUrl.replace("{0}", sRequestNoZero);
				s3rdUrl = s3rdUrl.replace("{1}", sEmployee);
				s3rdUrl = s3rdUrl.replace("{2}", "TCK");
				var oBatch2 = oComponent.getModel().createBatchOperation(s3rdUrl, "GET");
				oComponent.getModel().addBatchReadOperations([ oBatch0, oBatch1, oBatch2 ]);
			}else if(sModule == "CARG"){
				if(oController.getView().getModel("new").getData().ZZ_CAR_TYP == "V" ||
						oController.getView().getModel("new").getData().ZZ_CAR_TYP == "S"){
					aaVendorFlag = true;
				var s3rdUrl = "DmsDocsSet?$filter=DepReq+eq+'{0}'+and+EmpNo+eq+'{1}'+and+DocType+eq+'{2}'+and+Role+eq+'{3}'";
				var sRequestNoZero = sRequest.replace(/^0+/, '');
				s3rdUrl = s3rdUrl.replace("{0}", sRequestNoZero);
				s3rdUrl = s3rdUrl.replace("{1}", sEmployee);
				if(sDocType=='CAO')
				    s3rdUrl = s3rdUrl.replace("{2}", "CDO");//Cargo Airfreight Document
				else if(sDocType=='CAR')
					s3rdUrl = s3rdUrl.replace("{2}", "CDR");//Cargo Airfreight Document
				s3rdUrl = s3rdUrl.replace("{3}", sap.ui.getCore().getModel("profile").getData().currentRole);
				var oBatch2 = oComponent.getModel().createBatchOperation(s3rdUrl, "GET");
				
				var s4Url = "DmsDocsSet?$filter=DepReq+eq+'{0}'+and+DocType+eq+'{1}'";
				var sRequestNoZero = sRequest.replace(/^0+/, '');
				s4Url = s4Url.replace("{0}", "121212121");
				s4Url = s4Url.replace("{1}", "CAX");
			
				//s3rdUrl = s3rdUrl.replace("{3}", sap.ui.getCore().getModel("profile").getData().currentRole);
				var oBatch3 = oComponent.getModel().createBatchOperation(s4Url, "GET");
				
				oComponent.getModel().addBatchReadOperations([ oBatch0, oBatch1, oBatch2, oBatch3 ]);
				}else{
					oComponent.getModel().addBatchReadOperations([ oBatch0, oBatch1 ]);
				}
			} else {
				oComponent.getModel().addBatchReadOperations([ oBatch0, oBatch1 ]);
			}
		} catch (ex) {
			oComponent.getModel().addBatchReadOperations([ oBatch0, oBatch1 ]);
		}
		oComponent.getModel().submitBatch(function(oResult) {
			var aData = oController.getView().getModel("new").getData();
			// aData.Files = {};
			aData.Files = [];
			if (Array.isArray(oResult.__batchResponses[0].data.results)) {
				// aData.Files = $.extend([],
				// oResult.__batchResponses[0].data.results,
				// oResult.__batchResponses[1].data.results);
				aData.Files = aData.Files.concat(oResult.__batchResponses[0].data.results, oResult.__batchResponses[1].data.results);
			} else {
				// aData.Files = $.extend([],
				// oResult.__batchResponses[1].data.results);
				aData.Files = oResult.__batchResponses[1].data.results;
			}
			try {
				if (sModule == "INSR" || sModule == "ACOM" || (sModule == "CARG" && aaVendorFlag == true)) {
					// aData.Files = $.extend([], aData.Files,
					// oResult.__batchResponses[2].data.results);
					aData.Files = aData.Files.concat(oResult.__batchResponses[2].data.results);
					if(sModule == "CARG"){
						aData.Files = aData.Files.concat(oResult.__batchResponses[3].data.results);
					}
				}
			} catch (ex) {
			}
			// aData.Files = $.extend([],
			// oResult.__batchResponses[0].data.results,
			// oResult.__batchResponses[1].data.results);
			oController.getView().byId("UploadCollection").aItems = [];
			oController.getView().byId("UploadCollection").removeAllItems();
			oController.getView().getModel("new").setData(aData);
			oController.getView().getModel("new").refresh(true);
		}, function(error) {
			alert("No data found");
		});
	},
	checkStartDate : function(date) {
		// Check date in the past
		var dCurrentDate = new Date();
		dCurrentDate = new Date(dCurrentDate.toDateString());
		var dInputDate = new Date(date.substr(0, 4), date.substr(4, 2) - 1, date.substr(6, 2));
		if (dInputDate > dCurrentDate) {
			return true;
		} else {
			return false;
		}
	},
	checkInsrStartDate : function(date) {
		// Check date in the past
		var dCurrentDate = new Date();
		dCurrentDate = new Date(dCurrentDate.toDateString());
		var dInputDate = new Date(date.substr(0, 4), date.substr(4, 2) - 1, date.substr(6, 2));
		if (dInputDate >= dCurrentDate) {
			return true;
		} else {
			return false;
		}
	},
	checkEndDate : function(date) {
		// Check date in the past
		var dCurrentDate = new Date();
		dCurrentDate = new Date(dCurrentDate.toDateString());
		var dInputDate = new Date(date.substr(0, 4), date.substr(4, 2) - 1, date.substr(6, 2));
		if (dInputDate <= dCurrentDate) {
			return true;
		} else {
			return false;
		}
	},
	// Format all Date columns to apply new pattern
	setFilterTypeToAllDateColumns : function(oTable) {
		for ( var i = 0; i < oTable.getColumns().length; i++) {
			var columnName = oTable.getColumns()[i].getLabel().getText();
			for ( var j = 0; j < dateColumnList.length; j++) {
				if (columnName == dateColumnList[j]) {
					oTable.getColumns()[i].setFilterType(dateType);
					break;
				}
			}
		}
	},
	// Calculate hotel cost
	calculateHotelCost : function(sStartdate, sEnddate, sMonthCost, sDayCost) {
		var cost = 0;
		// check the difference in year
		var yearDifference = Number(sEnddate.substring(4)) - Number(sStartdate.substring(4));
		var evenMonth = 0;
		switch (yearDifference) {
		// if startdate and endate are in the same year
		case 0:
			// Calculate month cost
			evenMonth = Number(sEnddate.substring(2, 4)) - Number(sStartdate.substring(2, 4)) - 1;
			if (evenMonth > 0) {
				cost = evenMonth * sMonthCost;
			}
			break;
		// if startdate and endate are not in the same year
		default:
			// Calculate month cost
			evenMonth = Number(sEnddate.substring(2, 4)) + 12 - Number(sStartdate.substring(2, 4)) - 1;
			cost = evenMonth * sMonthCost;
			break;
		}
		// if hotel stay in the same month and year
		if (yearDifference == 0 && (Number(sEnddate.substring(2, 4)) == Number(sStartdate.substring(2, 4)))) {
			cost = cost + (sDayCost * (Number(sEnddate.substring(0, 2)) - Number(sStartdate.substring(0, 2)) + 1));
		} else {
			var dd;
			var datesInMonth;
			// calculate day-price of start month
			// If hotel booked from the first date of the month then it'll be
			// the whole month
			if (sStartdate.substring(0, 2) == "01") {
				cost = cost + sMonthCost;
			} else {
				// else it'll be sDayCost * Number of days
				dd = new Date(sStartdate.substring(4), sStartdate.substring(2, 4), 0);
				datesInMonth = dd.getDate();
				cost = cost + ((datesInMonth - Number(sStartdate.substring(0, 2)) + 1) * sDayCost);
			}
			// calculate day-price of end month
			// If hotel booked to the last date of the month then it'll be the
			// whole month
			dd = new Date(sEnddate.substring(4), sEnddate.substring(2, 4), 0);
			datesInMonth = dd.getDate();
			if (sEnddate.substring(0, 2) == datesInMonth) {
				cost = cost + sMonthCost;
			} else {
				// else it'll be sDayCost * Number of days
				cost = cost + (Number(sEnddate.substring(0, 2)) * sDayCost);
			}
		} // end if hotel stay in the same month and year
		return cost;
	},
	customMenuOpen : function(oThis, evt) {
		var menu = oThis.getView().byId(sap.ui.core.Fragment.createId("custommenu", "menu_settings"));
		var eDock = sap.ui.core.Popup.Dock;
		var menuRef = evt.oSource;
		if (!(menuRef.data("filterValue")))
			menuRef.data("filterValue", '');
		menu.getItems()[2].setValue(menuRef.data("filterValue"));
		menu.open(false, evt.oSource.getFocusDomRef(), eDock.BeginTop, /*
																		 * "Edge"
																		 * of
																		 * the
																		 * menu
																		 * (see
																		 * sap.ui.core.Popup)
																		 */
		eDock.BeginBottom, /*
							 * "Edge" of the related opener position (see
							 * sap.ui.core.Popup)
							 */
		evt.oSource.getDomRef() /*
								 * Related opener position (see
								 * sap.ui.core.Popup)
								 */
		);
		return menuRef;
	},
	customMenuItemSelect : function(oThis, evt, menuRef, sPath, oBinding) {
		var aFilters = [];
		var aSorters = [];
		var index;
		if ((evt.getParameter("item")) instanceof sap.ui.unified.MenuItem) {
			var text = evt.getParameter("item").getText();
			if (text == "Sort Ascending") {
				aSorters.push(new sap.ui.model.Sorter(sPath, false));
				
				menuRef.setIcon("sap-icon://sort-ascending");
			} else if (text == "Sort Descending") {
				aSorters.push(new sap.ui.model.Sorter(sPath, true));
				
				menuRef.setIcon("sap-icon://sort-descending");
			}
			if(sPath == "CrDateTime"){
				aSorters[0].fnCompare = function(date1,date2){
					var aDate = null;
					var oDate = null;
					if(date1!="NA"){
					     aDate = new Date(date1.substring(6,10),date1.substring(3,5) - 1,date1.substring(0,2),
					    		          date1.substring(11,13),date1.substring(14,16),date1.substring(17));
					}
					if(date2!="NA")
					     oDate = new Date(date2.substring(6,10),date2.substring(3,5) - 1,date2.substring(0,2),
					    		          date2.substring(11,13),date2.substring(14,16),date2.substring(17));
					
					 if (aDate == null) {
	                        return -1;
	                    }
	                    if (oDate == null) {
	                        return 1;
	                    }
	                    if (aDate < oDate) {
	                        return -1;
	                    }
	                    if (aDate > oDate) {
	                        return 1;
	                    }
	                    return 0;
				}
			}
			oBinding.sort(aSorters);
		} else {
			var item = evt.getParameter("item").getValue();
			menuRef.data("filterValue", item);
			if(sPath == "CrDateTime" && item!=""){
			var df =  sap.ui.core.format.DateFormat.getDateInstance({pattern : "dd.MM.yyyy" });
			 
			if(!(df.parse(item))){
				sap.m.MessageToast.show("Please enter date in correct format(dd.MM.yyyy)");
			    return;
			  }
			}
			if (item) {
				menuRef.setIcon("sap-icon://filter");
				for ( var i = 0; i < oBinding.aFilters.length; i++) {
					if (oBinding.aFilters[i].sPath == sPath) {
						index = i;
						break;
					}
				}
				if (index >= 0)
					oBinding.aFilters.splice(index, 1);
				var oFilter = new sap.ui.model.Filter(sPath, "Contains", item);
				oBinding.aFilters.push(oFilter);
				oBinding.filter(oBinding.aFilters);
			} else {
				menuRef.setIcon("sap-icon://sort");
				for ( var i = 0; i < oBinding.aFilters.length; i++) {
					if (oBinding.aFilters[i].sPath == sPath) {
						index = i;
						break;
					}
				}
				oBinding.aFilters.splice(index, 1);
				if (oBinding.aFilters.length != 0)
					oBinding.filter(oBinding.aFilters);
				else
					oBinding.filter(null);
			}
			if (oBinding.aIndices.length == 0 || item == "" || item == " " || (!item))
				return true;
		}
	},
	viewPdf : function(oController) {
		var empno = oController.getView().byId("linkempno").getValue();
		var tpno = oController.getView().byId("linktpno").getValue();
		var ttype = oController.getView().byId("linkttype").getValue();
		if (window.location.hostname == "localhost")
			fileUrl = "proxy/sap/opu/odata/sap/ZE2E_DEP_NWGS_SRV/TravelPdfSet(EmpNo='" + empno + "',TrNo='" + tpno + "',TrvKey='" + ttype + "',Module='REQ')/$value";
		else
			fileUrl = "/sap/opu/odata/sap/ZE2E_DEP_NWGS_SRV/TravelPdfSet(EmpNo='" + empno + "',TrNo='" + tpno + "',TrvKey='" + ttype + "',Module='REQ')/$value";
		// pdflink.setHref(fileUrl);
		window.open(fileUrl, "_blank");
	},
	onCloseSearchForex : function(evt, oForex, tabKey) {
		var role = sap.ui.getCore().getModel("profile").getData().currentRole;
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oForex);
		if (tabKey == "CHCLS") {
			var tpno = oForex.getView().byId(sap.ui.core.Fragment.createId("frgCHCLS", "txtForextpno")).getValue();
			var table = evt.oSource.getParent().getParent().getContent()[1];
			var module = "";
			var iadvance = oForex.getView().byId(sap.ui.core.Fragment.createId("frgCHCLS", "iadvance")).getSelected();
			var aadvance = oForex.getView().byId(sap.ui.core.Fragment.createId("frgCHCLS", "aadvance")).getSelected();
		} else {
			var tpno = oForex.getView().byId("txtForextpno").getValue();
			var table = evt.oSource.getParent().getParent().getContent()[1];
			var module = "";
			var iadvance = oForex.getView().byId("iadvance").getSelected();
			var aadvance = oForex.getView().byId("aadvance").getSelected();
		}
		if (iadvance) {
			module = "FREX";
		} else if (aadvance) {
			module = "CARD";
		}
		if (module != "") {
			oDataModel.read("ForexWorklistSet?$filter=LoginRole eq '" + role + "' and TravelPlan eq '" + tpno + "' and Module eq '" + module + "' and Tab eq 'CL'", null, null, true,
			// success
			function(oData, response) {
				var model = new sap.ui.model.json.JSONModel();
				// oData.results[0].SeqNo = 1;
				model.setData(oData.results);
				table.setModel(model);
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oForex);
			}, function(error) {
				// error
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oForex);
			});
		} else {
			sap.m.MessageToast.show("Please select advance type");
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oForex);
		}
	},
	fetchCloseDetails : function(role, table, oController) {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oController);
		oDataModel.read("ForexWorklistSet?$filter=LoginRole eq '" + role + "' and Tab eq 'CL'", null, null, true,
		// success
		function(oData, response) {
			var model = new sap.ui.model.json.JSONModel();
			// oData.results[0].SeqNo = 1;
			model.setData(oData.results);
			table.setModel(model);
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
		}, function(error) {
			// error
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
		});
	},
	// search request by employee number
	onSearchEmp : function(evt, oController) {
		var searchString = oController.getView().byId("idSearch").getValue();
		if (oController.getView().byId("idSearch").getProperty("showRefreshButton") == true || searchString == "") {
			// refresh data
			/* Changes done by Bharadwaj for issue correction */
			var key = oController.getView().byId("idIconTabBarReimAdmin").getSelectedKey();
			oController.getFilter(key, searchString);
			/* Changes done by Bharadwaj for issue correction */
		} else {
			if (searchString && searchString.length > 0) {
				var key = oController.getView().byId("idIconTabBarReimAdmin").getSelectedKey();
				oController.getFilter(key, searchString);
			}
		}
	},
	checkTodayEndDate : function(enddate) {
		var today = new Date();
		if (enddate != "" || enddate != undefined) {
			var eyear = enddate.substring(0, 4);
			var emonth = enddate.substring(4, 6);
			var edate = enddate.substring(6, 8);
			var aenddate = new Date(eyear, emonth - 1, edate);
			if (aenddate < today) {
				return false;
			}
		}
		return true;
	},
	// get request for admin of REIM to go to detail page
	itemPress : function(event, oController) {
		itemSelected = event.getParameter("listItem");
		var items = event.oSource.getBinding("items");
		var index1 = event.oSource.indexOfItem(itemSelected);
		var index = items.aIndices[index1];
		var source = event.oSource;
		var items = event.oSource.getBinding("items");
		var bindingItem = event.oSource.getBinding("items").oList;
		var reimAdminData;
		reimAdminData = bindingItem[index];
		if (!sap.ui.getCore().getModel("reimAdminData")) {
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setProperty("/oData", reimAdminData);
			var filterTab = oController.getView().byId("idIconTabBarReimAdmin").getSelectedKey();
			oModel.setProperty("/filterTab", filterTab);
			sap.ui.getCore().setModel(oModel, "reimAdminData");
		} else {
			var filterTab = oController.getView().byId("idIconTabBarReimAdmin").getSelectedKey();
			sap.ui.getCore().getModel("reimAdminData").setProperty("/oData", reimAdminData);
			sap.ui.getCore().getModel("reimAdminData").setProperty("/filterTab", filterTab);
		}
		sap.ui.core.routing.Router.getRouter("MyRouter").navTo("reimbursement");
	},
	// set filter tab for REIM
	// set count for filter table
	setCount : function(count, oController) {
		var key = oController.getView().byId("idIconTabBarReimAdmin").getSelectedKey();
		switch (key) {
		// NEW
		case "NEW":
			oController.getView().byId("idIconTabBarReimAdmin").getItems()[0].setCount(count);
			break;
		// CLOSE
		case "CLOSED":
			oController.getView().byId("idIconTabBarReimAdmin").getItems()[1].setCount(count);
			break;
		}
	},
	// get list admin for REIM
	// SpecificDB = variant for distinguish dashboard
	getListAdmin : function(sRole, ZZ_OWNER, sModid, sAction, oThis, sStatus, SpecificDB) {
		// ZZ_TRV_REQ =ROLE
		// ZZ_OWNER = OWNER
		// ZZ_TRV_KEY = SMODID
		// ZZ_VERSION = ACTION
		// ZZ_WAERS = type of admin
		// var currentRole =
		// sap.ui.getCore().getModel("profile").getData().currentRole;
		var sAccUrl = "/ZE2E_REI_HDRSet?$filter=ZZ_TRV_REQ+eq+'{0}'+and+ZZ_OWNER+eq+'{1}'+and+ZZ_TRV_KEY+eq+'{2}'+and+ZZ_VERSION+eq+'{3}'+and+WAERS+eq+'{4}'+and+ZZ_VISA_PLAN+eq+'{5}'&$expand=TRV_HDR,ZE2E_REI_DETAIL ";
		sAccUrl = sAccUrl.replace("{0}", sRole);
		sAccUrl = sAccUrl.replace("{1}", ZZ_OWNER);
		sAccUrl = sAccUrl.replace("{2}", sModid);
		sAccUrl = sAccUrl.replace("{3}", sAction);
		sAccUrl = sAccUrl.replace("{4}", SpecificDB);
		sAccUrl = sAccUrl.replace("{5}", sStatus);
		oComponent.getModel().read(sAccUrl, {
			success : jQuery.proxy(function(mResponse) {
				oThis.getView().getModel("listReim").setProperty("/results", mResponse.results);
				if (oThis.getView()["BusyDialog"] = !null) {
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
				}
				// counting
				sap.ui.project.e2etm.util.StaticUtility.setCount(mResponse.results.length, oThis);
			}, this),
			error : jQuery.proxy(function(error) {
				jQuery.sap.require("sap.m.MessageToast");
			}, this)
		});
	},
	// function check weather it is date or not
	isDate : function(value) {
		if (value.substr(2, 1) == "/" && value.length == 10) {
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern : "dd/MM/yyyy"
			});
			var sDate = oDateFormat.parse(value);
			if (sDate == null) {
				return false;
			}
			return true;
		}
		return false;
	},
	checkActionEnable : function(sDOMEorINTL, sType, sStatus, sTravelStartDate, sTravelEnddate) {
		// For example: sDOMEorINTL: DOME/INTL
		// sType : DEPU
		// sStatus : FF001 (TR close)
		// sTravelStartDate:
		// sTravelEndDate:
		var actionArray = [];
		actionArray.CargoOnward = false;
		actionArray.CargoReturn = false;
		actionArray.Insuarance = false;
		actionArray.BankAdviceForm = false;
		actionArray.MonthlyRemittance = false;
		actionArray.Reimbursement = false;
		actionArray.AdditionalAdvance = false; // Card reload
		actionArray.CreateTravelSettlement = false;
		actionArray.PaymentVoucher = false;
		actionArray.TAXClearance = false;
		actionArray.Accommodation = false;
		actionArray.Ticketing = false;
		actionArray.FOREX = false;
		actionArray.BillingToCustomer = false;
		// check DOME or INTL
		if (sDOMEorINTL == "INTL") {
			switch (sType) {
			case "DEPU":
				// if
				break;
			}
		} else if (sDOMEorINTL == "DOME") {
		} // end check DOME or INTL
	},
	// check from date and to date TGG1HC
	checkDate : function(oControl, oFromDate, oToDate) {
		var FromDate = oFromDate.getValue();
		var ToDate = oToDate.getValue();
		// reset
		oFromDate.setValueState("None");
		oToDate.setValueState("None");
		// parse format to Date
		var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
			pattern : "yyyyMMddHHmmss"
		});
		var FromDateVL = oDateFormat.parse(FromDate);
		var ToDateVL = oDateFormat.parse(ToDate);
		// check error
		// if(oDateFormat.parse(FromDate) == null){
		// sap.m.MessageToast.show(oControl.getView().getModel("i18n").getProperty("Dateisinvalid"));
		// oFromDate.setValueState("Error");
		// return false;
		// }else
		// if(oDateFormat.parse(ToDate) == null){
		// sap.m.MessageToast.show(oControl.getView().getModel("i18n").getProperty("Dateisinvalid"));
		// oToDate.setValueState("Error");
		// return false;
		// }else
		if (oToDate.getValue() == "") {
			sap.m.MessageToast.show("Date is invalid");
			oFromDate.setValueState("Error");
			return false;
		} else if (oFromDate.getValue() == "") {
			sap.m.MessageToast.show("Date is invalid");
			oFromDate.setValueState("Error");
			return false;
		} else if (FromDateVL > ToDateVL) {
			sap.m.MessageToast.show("Date is invalid");
			oToDate.setValueState("Error");
			oFromDate.setValueState("Error");
			return false;
		}
		return true;
	},
	// formatDate from mm/dd/yyyy to yyyymmdd
	formatDate : function(sDate) {
		sDate = sDate.substr(6, 4) + sDate.substr(0, 2) + sDate.substr(3, 2);
		return sDate;
	},
	// report button press
	reimReport : function() {
		var sRole = "";
		var sAction = "";
		var currentRole = sap.ui.getCore().getModel("profile").getData().currentRole;
		switch (currentRole) {
		case "MRCR":
			sRole = "04";
			sAction = "00";
			sSmodid = "";
			break;
		case "REBI":
			sRole = "10";
			sAction = "00";
			sSmodid = "";
			break;
		case "REMR":
			sRole = "05";
			sAction = "00";
			sSmodid = "PE";
			break;
		case "TRST":
			sRole = "11";
			sAction = "00";
			sSmodid = "NPE";
			break;
		}
		var oGlobal = sap.ui.getCore().getModel("global").getData();
		oGlobal.sRole = sRole;
		oGlobal.sAction = sAction;
		oGlobal.sSmodid = sSmodid;
		sap.ui.getCore().getModel("global").setData(oGlobal);
		sap.ui.core.routing.Router.getRouter("MyRouter").navTo("ReimbursementReport");
	},
	checkCoolingDate : function(sDepuDate, sCoolingDate) {
		var dCoolingDate = new Date(sCoolingDate.substr(0, 4), sCoolingDate.substr(4, 2) - 1, sCoolingDate.substr(6, 2));
		var dDepuDate = new Date(sDepuDate.substr(0, 4), sDepuDate.substr(4, 2) - 1, sDepuDate.substr(6, 2));
		return dCoolingDate.getTime() < dDepuDate.getTime();
	},
	getExcelColumns : function(table) {
		var columns = [];
		var table;
		// table = this.getView().byId("idItemTable");
		var cells = table.getBindingInfo("items").template.getCells();
		var cols = table.getColumns();
		for ( var i = 0; i < cols.length; i++) {
			if (cells[i].getBindingInfo("text")) {
				var path = cells[i].getBindingInfo("text").parts[0].path;
				// var path = cells[i].getBindingInfo("text").parts[0].path;
				var text = cols[i].getHeader().getText().trim();
				if (text == "E.Date" || text == "DOB" || text == "Start Date" || text == "End Date" || text == "Submitted Date" || text == "Date of Payment" || text == "Request Recd. Date" || text == "Request received Date" || text == "Cargo Movement" || text == "Invoice Date") {
					columns.push({
						name : cols[i].getHeader().getText(),
						template : {
							content : {
								parts : [ path ],
								formatter : sap.ui.project.e2etm.util.Formatter.sapDate
							}
						}
					});
				}
				else if (text == "Valid From" || text == "Travel Start Date" || text == "Travel End Date") {
					columns.push({
						name : cols[i].getHeader().getText(),
						template : {
							content : {
								parts : [ path ],
								formatter : sap.ui.project.e2etm.util.Formatter.sapDate_Onsite
							}
						}
					});				
				} else if (text == "Card Number" || text == "Contact Mobi" || text == "Contact Office" ||
						   text == "Reporting Manager Mobi" || text=="Emergency Mobi 1" || text=="Emergency Mobi 2") 
				     {
					columns.push({
						name : cols[i].getHeader().getText(),
						template : {
							content : {
								path : path,
								formatter : function(value) {
									if (value)
										return "'" + value;
								}
							}
						}
					});
				} else {
					columns.push({
						name : cols[i].getHeader().getText(),
						template : {
							content : {
								path:path,
								formatter:function(value){
									if(value!=""&&value){
										value = "\""+value+"\"";
										return value;
									}
								}
							}
						}
					});
				}
			}
		}
		return columns;
	},
	checkValidCargoTp : function(asgType, trvreq,toCountry,toLoc) {
		var cargoStvaTp = sap.ui.getCore().getModel("global").getData().cargoStvaTp;
		if ((asgType == "STVA" && Number(trvreq) > Number(cargoStvaTp))|| (asgType == "NC")) {
			return true;// apply new logic for Stva;else apply old logic
		}
		return false;
	},
	// check date overclap
	checkDateOverclap : function(datePre, dateCheck) {
		// datePre = new Date(datePre.substr(0,4), datePre.substr(4,2) - 1,
		// datePre.substr(6,2));
		// dateCheck = new Date(dateCheck.substr(0,4), dateCheck.substr(4,2) -
		// 1, dateCheck.substr(6,2));
		if (dateCheck > datePre) {
			return true;
		} else {
			return false;
		}
	},
//	visibleCggsData : function(route, status, trvreq, toCountry, asgtyp) {
//		var profileData = sap.ui.getCore().getModel("profile").getData();
//		switch (profileData.currentRole) {
//		case "GRM":
//			if (route == "DEPU") {
//				if ((status != "" || status != undefined) && status.substring(2, 5) == "001") {
//					if ((trvreq == "" || trvreq == "0000000000")) {// DH
//						if (toCountry == "DE" && asgtyp == "STA") {
//							return true;
//						}
//					}
//				}
//			} else {
//				if ((trvreq == "" || trvreq == "0000000000")) {// DH
//					if (toCountry == "DE" && asgtyp == "STA") {
//						return true;
//					}
//				}
//			}
//			break;
//		case "EMP":
//			if ((status != "" || status != undefined) && (status.substring(2, 5) == "003")) {
//				if ((trvreq == "" || trvreq == "0000000000")) {// DH
//					if (toCountry == "DE" && asgtyp == "STA") {
//						return true;
//					}
//				}
//			}
//			break;
//		}
//		return false;
//	},
	visibleCggsData : function(trvreq, toCountry, asgtyp, reqtyp,trvcat) {
		if (reqtyp == "DEPU"&&trvcat == "WRKP") {
			if ((trvreq == "" || trvreq == "0000000000")) {// DH
				if (toCountry == "DE" && asgtyp == "STA") {
					return true;
				}
			}
		}
		return false;
	},
	checkCggs:function(toCountry, asgtyp ,trvcat){
		if (toCountry == "DE" && asgtyp == "STA" && trvcat == "WRKP") {
			return true;
		}
		return false;
	},
	modifyCggsData : function(data) {
		var dataModel = new sap.ui.model.odata.ODataModel(sServiceUrl);
		var oData = {Amount:data.Amount,Asgtyp:data.Asgtyp,Depreq:data.Depreq,Depsubtype:data.Depsubtype,Deptype:data.Deptype,
				     Frmcntry:data.Frmcntry,Frmloc:data.Frmloc,Jobtitle:data.Jobtitle,Pernr:data.Pernr,Tocntry:data.Tocntry,
				     Toloc:data.Toloc,Version:data.Version,Vreason:data.Vreason,Zlevel:data.Zlevel};
		dataModel.create("CggsDataSet", oData, null, function(oData, response) {
			// oController.uploadFiles(global.ZZ_TRV_REQ);
		}, function(error) {
		}, true);
	},
	getCggsData : function(pernr, depreq, version,controller) {
		if(version!=""&&version!=undefined)
		version = version.trim();
		oComponent.getModel().read("CggsDataSet(Pernr='" + pernr + "',Depreq='" + depreq + "',Version='" + version + "')", null, null, false, function(oData, response) {
			controller.getView().getModel("cggsmodel").setData(oData);
		}, function(error) {
			// table.setModel(null);
		});
	},
	checkChangeDatesLogic:function(depReq,vReason){
		var frmdate = sap.ui.getCore().getModel("global").getData().changeDateValidity;		
		//var oDataModel1 = new sap.ui.model.odata.ODataModel(sServiceUrl, true);
		//var odata;
		var startdate = undefined;
		odata = {
			ZZ_DEP_REQ : depReq,
			ZZ_VREASON : vReason		
		};
		
		var get = $.ajax({
			cache : false,
			async:false,
			url : sServiceUrl+"GetDepuCreationDate?ZZ_DEP_REQ='"+depReq+"'&ZZ_VREASON='"+vReason+"'&$format=json",
			type : "GET"
		});
		get.done(function(result) {
			startdate = result.d.GetDepuCreationDate.ZZ_BEGDA;
		});
		get.fail(function(err) {
			//sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
		});
		
//		oDataModel1.callFunction("GetDepuCreationDate", "GET", odata, null, function(oData, response) {
//			startdate = oData.GetDepuCreationDate.ZZ_BEGDA;
//		}, function(error) {
//
//		}, false);
		
		if (frmdate != "" && frmdate!=undefined && frmdate!=null) {
			var FrmDate = new Date(frmdate.substr(6), frmdate.substr(3, 2) - 1, frmdate.substr(0, 2));
			if(startdate!=undefined){
			var StrDate = new Date(startdate.substr(0,4), startdate.substr(4, 2) - 1, startdate.substr(6, 2));
			if (StrDate >= FrmDate) {
				return true;
			}
			}
		}
	return false;
	},
	addNewCard:function(oData,oController){
		oDataModel.update("ForexCardsAllSet(EmpNo='"+oData.EmpNo+"')", oData, null, jQuery.proxy(function(oData, response) {
			// oForex.uploadFiles(gdata.TravelPlan);
			sap.m.MessageToast.show("Card Details Updated Successfully", {
				duration : 10000,
				closeOnBrowserNavigation : false
			});
			this["cardNewData"].resolve();
			//oForex.updateCardTable();
			//oForex.onNewCardClose();
			//oForex.fetchCardsAll(generaldata.EmpNo);
		},oController), jQuery.proxy(function(error) {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
			sap.m.MessageToast.show("Internal Server Error");
		},this));	
	},
	
	formatDateOnsite: function(sDate) {
		var sDay = sDate.getDate();
	    var sMonth = sDate.getMonth() + 1; //Months are zero based
	    var sYear = sDate.getFullYear();
	    if(sDay<10){
	    	sDay='0'+sDay;
	    } 
	    if(sMonth<10){
	    	sMonth='0'+sMonth;
	    }
	    var sToday = "datetime'{0}-{1}-{2}T00:00:00'";
	    sToday = sToday.replace("{0}", sYear);
	    sToday = sToday.replace("{1}", sMonth);
		sToday = sToday.replace("{2}", sDay);
	    return sToday;
	},
	fetchCGGSChecklistForms:function(aData,cggsDisplay){
		var sModule = "";
		if(aData.ZZ_DEP_TOCNTRY == "DE" && aData.ZZ_ASG_TYP == "STA" && aData.ZZ_TRV_CAT != "TRNG" &&
				sap.ui.getCore().getModel("profile").getData().currentRole == "GRM"){
			sModule = "CGF";
		}else if(sap.ui.project.e2etm.util.StaticUtility.checkStvaAsg(aData.ZZ_ASG_TYP) && 
				  aData.ZZ_TRV_CAT == "TRFR" &&
				  sap.ui.getCore().getModel("profile").getData().currentRole == "GRM"){
			sModule = "SRQ";
		}
		if(sModule!=""){
			var fileUpload =this.uploadDocsRead(aData.ZZ_DEP_REQ, aData.ZZ_DEP_PERNR, sModule);
            fileUpload.done(function(files) {
				//var flxBox = sap.ui.getCore().byId("cggsFormsDisplay");
				var fileModel = new sap.ui.model.json.JSONModel();
				var oData = [];
				for (var i = 0; i < files.length; i++) {
					var sFileName = files[i].FileName;
					var oItem = {
						FileName : sFileName.substr(0, sFileName.indexOf(".")),
						FileContent : files[i].FileContent,
						Extension : sFileName
								.substr(sFileName.lastIndexOf(".")),
						Image : sap.ui.project.e2etm.util.StaticUtility
								.getIconFileType(sFileName.substr(sFileName
										.lastIndexOf("."))),
						URL : files[i].FileUrl,
						DocType : files[i].DocType,
						Content : null,
						Checked : false,
						Deleted : false,

					};
					oData.push(oItem);
				}

				fileModel.setData(oData);
				cggsDisplay.setModel(fileModel);
				if(oData.length==0){
					cggsDisplay.setVisible(false);
					//sap.ui.getCore().byId("lblCggsForms").setVisible(true);
				}else{
					cggsDisplay.setVisible(true);
		//			sap.ui.getCore().byId("lblCggsForms").setVisible(false);
				}
			});

			fileUpload.fail(function() {
			});
		}
		
	},
	checkStvaAsg:function(asgType){
		if(asgType == "STVA" || asgType == "VA" || asgType == "VN" || asgType == "NC"){
			return true;
		}
		return false;
	},
	checkCGGSForms:function(aData,cggsDisplay){
      if(aData.ZZ_STAT_FLAG.substring(2, 5) == "001" && sap.ui.getCore().getModel("profile").getData().currentRole == "GRM"){
		if(aData.ZZ_DEP_TOCNTRY == "DE" && aData.ZZ_ASG_TYP == "STA" && aData.ZZ_TRV_CAT!="TRNG"){
		   if(cggsDisplay.getModel().getData().length!=0)
			  return true;
		   else
			   return false;
		
		}else if(sap.ui.project.e2etm.util.StaticUtility.checkStvaAsg(aData.ZZ_ASG_TYP)
			   && aData.ZZ_TRV_CAT=="TRFR"){
			if(aData.ZZ_VREASON == "" || aData.ZZ_VREASON == "DA" || aData.ZZ_VREASON == "DB" || !(aData.ZZ_VREASON)){
			 if(cggsDisplay.getModel().getData().length==0)
				   return false;
			 else{
				 var files = cggsDisplay.getModel().getData();
				 var found = false;
				 for(var i=0;i<files.length;i++){
					 if(files[i].FileName.indexOf("_"+aData.ZZ_VERSION)!=-1){
						 found = true;
						 break;
					 }
				 }				
					 return found;
			 }
		}
		}	
      }
      return true;
	},
	
	uploadDocsOnApprove:function(oController,vTravelPlan,vEmpNo){
		var dialog;	
		
		if (!(oController.getView().byId("dlgMgrCggsDocs"))) {
			dialog = sap.ui
					.xmlfragment(
							oController.getView().getId(),
							"sap.ui.project.e2etm.fragment.common.ManagerDocsUpload",
							oController);
			oController.getView().addDependent(dialog);

		} else {
			dialog = oController.getView().byId("dlgMgrCggsDocs");
		}
		
		var files =this.uploadDocsRead(vTravelPlan, vEmpNo, "CGF");
		//var flxBox = oController.getView().byId("flxDocContent");
		var flxBox = oController.getView().byId("cggsFormsDisplay");
		var fileModel = new sap.ui.model.json.JSONModel();
		
		if (files.length == 0) {	
			fileModel.setData([]);
		//	oController.getView().byId("flxDocContent").setModel(fileModel);
			flxBox.setModel(fileModel);
			dialog.open();
		} else {
			
	
			var oData = [];
			for (var i = 0; i < files.length; i++) {
				var sFileName = files[i].FileName;
				var oItem = {
						FileName : sFileName.substr(0, sFileName.indexOf(".")),
						FileContent : files[i].FileContent,
						Extension : sFileName.substr(sFileName.lastIndexOf(".")),				
						Image : sap.ui.project.e2etm.util.StaticUtility.getIconFileType(sFileName.substr(sFileName.lastIndexOf("."))),
						URL : files[i].FileUrl,
						DocType:files[i].DocType,
						Content : null,
						Checked : false,
						Deleted : false,
						
					};				
				oData.push(oItem);
			}
			
			fileModel.setData(oData);
			flxBox.setModel(fileModel);
			
				//oController.managerDocsUploadOnApprove.resolve();
				dialog.open();
		
		}			   
		
	},
	uploadDocsRead:function(vTravelPlan,vEmpNo,sModule){
		//var files = [];
		var fileUpload = $.Deferred();
		oComponent.getModel().read(
				"DmsDocsSet?$filter=DepReq eq '" + vTravelPlan
						+ "' and EmpNo eq '" + vEmpNo + "' and DocType eq '"
						+ sModule + "'", null, null, true,
				function(oData, response) {

					//files = oData.results;
					fileUpload.resolve(oData.results);

				}, function(error) {

				
				});
		return fileUpload.promise();;
	},
	validateUploadCggsFile:function(oEvent,vTravelPlan,vEmpNo,cggsDisplay,stvaFlag,version){
		var inputFile = oEvent.getParameters("files");
		var fileToLoad = inputFile.files[0];
		version = version.trim();
		var sModule = "CGF";
		if(stvaFlag)
			sModule = "SRQ";
		
		var fileUploader = oEvent.getSource();
		var upload = $.Deferred();
//		if (fileToLoad.name.endsWith(".zip")) {
//			
//			var fileReader = new FileReader();
//			fileReader.onload = jQuery.proxy(function(fileLoadedEvent) {
//				var zipFileLoaded = new JSZip(fileLoadedEvent.target.result);
//                var nFiles = Object.keys(zipFileLoaded.files).length;                
//                if(nFiles == 2){         
//				upload =  this.uploadFileToDms(oController.getView().byId("flxDocContent"),fileToLoad, vTravelPlan, vEmpNo, sModule);
//			    }else{
//                	sap.m.MessageToast.show("Please upload valid files");
//                	fileUploader.abort();
//                }
//			},this);
//			fileReader.readAsArrayBuffer(fileToLoad);
//		}else{
			upload = this.uploadFileToDms(fileToLoad, vTravelPlan, vEmpNo, sModule,version);
//		}
		
		upload.done(function(response){
			//var fileModel = oController.getView().byId("flxDocContent").getModel();
			
			var fileModel = cggsDisplay.getModel();
			
		    var oData = fileModel.getData();
			var sFileName = response.FileName;
			var oItem = {
					FileName : sFileName.substr(0, sFileName.indexOf(".")),
					FileContent : response.FileContent,
					Extension : sFileName.substr(sFileName.lastIndexOf(".")),				
					Image : sap.ui.project.e2etm.util.StaticUtility.getIconFileType(sFileName.substr(sFileName.lastIndexOf("."))),
					URL : response.FileUrl,
					DocType:sModule,
					Content : null,
					Checked : false,
					Deleted : false,
					
				};
				oData.push(oItem);
				fileModel.setData(oData);
				//oController.getView().byId("flxDocContent").setModel(fileModel)
				cggsDisplay.setModel(fileModel);
				cggsDisplay.setVisible(true);
		});
		
		
	},
	uploadFileToDms:function(file,vTravelPlan, vEmpNo, sModule,version){
	//	fileUploader.setUploadUrl(sServiceUrl + "DmsDocsSet");
		var fileUpload = $.Deferred();
		
		oComponent.getModel().refreshSecurityToken(jQuery.proxy(function() {

			//var file = evt.getParameters("files").files[0];
			var fileN = file.name;
			sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oHomeThis);
			if(sModule == "SRQ"){
				var name = file.name.split(".");
				fileN = name[0]+"_"+version+"."+name[1];
			}
		
			var sSlung = vTravelPlan + "," + vEmpNo + "," + fileN + "," + sModule;
			var sUrl = sServiceUrl + "DmsDocsSet";
			
			var oHeaders = {
					'X-Requested-With' : "XMLHttpRequest",
					'X-CSRF-Token' : oComponent.getModel().getHeaders()["x-csrf-token"],
					'Accept' : "application/json",
					'DataServiceVersion' : "2.0",
					'Content-Type' : "application/json",
					"slug" : sSlung,
				};
				var post = jQuery.ajax({
					cache : false,
					type : 'POST',
					url : sUrl,
					headers : oHeaders,
					cache : false,
					contentType : file.type,
					processData : false,
					data : file,
				});
				post.success(function(data) {
				//	var oData = oController.getView().getModel("new").getData();
					var oItem = {};
					oItem = {
						Country : "",
						// DepReq: oData.ZZ_REINR,
						DepReq : vTravelPlan,
						DocType : sModule,
						EmpNo : "",
						FileContent : "",
						FileMimeType : data.d.FileMimeType,
						FileName : data.d.FileName,
						FileUrl : data.d.FileUrl,
						Index : data.d.Index,
						Module : data.d.Module,
					};
					
					fileUpload.resolve(oItem);					
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oHomeThis);
					sap.m.MessageToast.show("Upload Succesfully");

				});
				post.fail(function(result, response, header) {
					//sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oHomeThis);
				});				
			

		}, this), function() {

			console.log('Error retrieving CSRF Token');

		}, true);
		return fileUpload.promise();
	},
	deleteFileFromDms:function(oModel,sDepReq,sEmpNo){
		oComponent.getModel().refreshSecurityToken(jQuery.proxy(function() {
		var iRequest = 0;
		var iResponse = 0;
		
			var oData = oModel.getData();
			for ( var i = oData.length - 1; i >= 0; i--) {
				if (oData[i].Checked) {
					if (oData[i].URL != "") { // Document															// has
																	// already
																	// uploaded
						sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oHomeThis);
						var oHeaders = {
							"x-csrf-token" : oComponent.getModel().getHeaders()["x-csrf-token"],
						};
						var FileName = oData[i].FileName + oData[i].Extension;
						iRequest++;
						var sUrl = sServiceUrl + "DmsDocsSet(DepReq='" + sDepReq + "',FileName='" + FileName + "',DocType='" + oData[i].DocType + "',EmpNo='" + sEmpNo + "',Index=" + iRequest + ",Module='',Country='')";
						var oItem = jQuery.ajax({
							cache : false,
							type : 'DELETE',
							url : sUrl,
							headers : oHeaders,
							cache : false,
							processData : false
						});
						oItem.success(function(data, response, header) {
							for ( var j = 0; j < oData.length; j++) {
								if (oData[j].FileName + oData[j].Extension == header.getResponseHeader('FileName')) {
								//	sap.ui.project.e2etm.util.StaticUtility.setCheckMark(false, oData.FileUpload[j].FileName, oData.FileUpload[j].DocType, oModel);
								//	oData[j].Image = "";
									oData.splice(j, 1);
									oModel.setData(oData);
									break;
								}
							}
							iResponse++;
							if (iRequest == iResponse) {
								sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oHomeThis);
								sap.m.MessageToast.show("Deleted Succesfully");
							}
						});
						oItem.fail(function(err) {
							iResponse++;
							if (iRequest == iResponse) {
								sap.ca.ui.message.showMessageBox({
									type : sap.ca.ui.message.Type.ERROR,
									message : "Error occurs, please click on remove button again",
									details : "Error occurs, please click on remove button again"
								});
								sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oHomeThis);
							}
						});
					} else { // Document has not uploaded
						//sap.ui.project.e2etm.util.StaticUtility.setCheckMark(false, oData.FileUpload[i].FileName, oData.FileUpload[i].DocType, oModel);
						oData.splice(i, 1);
						oModel.setData(oData);
					}
				}
			}
			if(iRequest == 0){
				sap.m.MessageToast.show("Please select atleast one file");
			}
	
		},this),true);
	},
	downloadCggsForms:function(fileData,vDepReq,vPernr,vDocType){
	
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oHomeThis);
		setTimeout(function() {
			// Loop through the list of selected files
			//var oData = model.getData();
			// Function for adding zip in to the jszip instance
			var deferredAddZip = function(url, filename, zip) {
				var deferred = $.Deferred();
				var get = $.ajax({
					cache : false,
					url : sServiceUrl + url,
					type : "GET",
					async : false
				});
				get.done(function(data, header, response) {
					zip.file(filename, data.d.FileContent, {
						base64 : true
					});
					deferred.resolve(data);
				}).fail(function(err) {
					deferred.reject(err);
				});
				return deferred;
			};
			var zip = new JSZip();
			var deferreds = [];
			for ( var i = fileData.length - 1; i >= 0; i--) {
				if (fileData[i].Checked) {
					var url = "DmsDocsSet(DepReq='" + vDepReq + "',EmpNo='" + vPernr + "',DocType='" + vDocType + "',FileName='" + fileData[i].FileName + fileData[i].Extension + "',Index=1,Module='',Country='')?$format=json";
					deferreds.push(deferredAddZip(url, "SWIFT/" + fileData[i].FileName + fileData[i].Extension, zip));
				}
			}
			
			if(deferreds.length==0){
				sap.m.MessageToast.show("No document is selected");
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oHomeThis);
				return;
			}
			// when everything has been downloaded, we can trigger the dl
			$.when.apply($, deferreds).done(function() {
				var blob = zip.generate({
					type : "blob"
				});
				// see FileSaver.js
				if(vDocType == "CL"){
					saveAs(blob, "Contract Letters.zip");
				}else if(vDocType == "CGS"){
					saveAs(blob, "Salary Slips.zip");
				}else{
				    saveAs(blob, "SWIFT CGGS Forms.zip");
				}
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oHomeThis);
			}).fail(function(err) {
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oHomeThis);
				alert('Browser does not support cross origin resource sharing, please try in Chrome');
			});
			
		}, 1000);
		
		
	},
	onTypeMissmatch:function(evt){
		sap.m.MessageToast.show("File type *." + evt.getParameter("fileType") +
									" is not supported. Choose xlsx file type only");
	},
	onXLSFileImport:function(file,entitySet,nav,model){
		var importFile = $.Deferred();
		var reader = new FileReader();
	
		var oData = {};
		oData[nav] = [];
		
		 reader.onload = function(e) {

	           data = e.target.result;

	         var wb = XLSX.read(data, {type: 'binary'});

	         wb.SheetNames.forEach(function(sheetName) {

	           var data = XLSX.utils.sheet_to_row_object_array(wb.Sheets[sheetName]);

	           for(var i=0;i<data.length;i++){
	        	   oData[nav].push({});	
	        	   delete data[i]["__rowNum__"];
	        	   for(var prop in data[i]){
	        		   var column = prop.split("_");
	        		   
	        		   oData[nav][i][column[1]] = data[i][prop];
	        		   if(nav == "HotelToRoomListNav" && column[1] == "Nopers"){
	        			   oData[nav][i][column[1]] = parseInt(oData[nav][i][column[1]]); 
	        		   }
	        		   if(nav == "EmpSalDetlsNav"){
	        			   if(column[1] == "ZzRevFrm"){
	        				   var revDate = oData[nav][i][column[1]].split(".");
	        				//   var oRevDate = new Date(revDate[2],revDate[1]-1,revDate[0],0,0,0);
	        				//  oData[nav][i][column[1]] = oRevDate;
	        				   oData[nav][i][column[1]] = revDate[2]+"-"+revDate[1]+"-"+revDate[0]+"T00:00:00";
	        			   }
	        		   }
	        		   if(nav == "EmpMgrToMgrNav" || nav == "OhaAllowanceNav" || nav == "Rent"){
	        			   if(column[1] == "Begda" || column[1] == "Endda"){
	        				   var aDate = oData[nav][i][column[1]].split(".");
	        				  // var oDate = new Date(aDate[2],aDate[1]-1,aDate[0]);
	        				   oData[nav][i][column[1]] = aDate[2]+aDate[1]+aDate[0];
	        			   }
	        		   }
	        		  

	        	   }
	           }
	           model.setHeaders({Action:"Create"});
	           model.create("/"+entitySet, oData, {success:jQuery.proxy(function(oData, response) {
				// oController.uploadFiles(global.ZZ_TRV_REQ);
	       		importFile.resolve();	
			},this), error:jQuery.proxy(function(error) {
				importFile.reject(error);	
			},this)});
	           

	         });

	         //return result;

	       }

	       reader.readAsBinaryString(file);
	       return importFile.promise();
	},
	onOccCostReportSearch:function(oController,entitySet){
		var country = oController.getView().byId("ipHcnty").getSelectedKey();
		var city = oController.getView().byId("ipHcity")?oController.getView().byId("ipHcity").getSelectedKey():"";
		var month = oController.getView().byId("ipMonth").getSelectedKey();
		var year = oController.getView().byId("ipYear").getValue();
		oController.getView().byId("ipHcnty").setValueState("None");
		oController.getView().byId("ipHcity").setValueState("None");
		oController.getView().byId("ipYear").setValueState("None");
		
//		if(country == ""){
//			sap.m.MessageToast.show("Please enter Country");
//			oController.getView().byId("ipHcnty").setValueState("Error");
//			return;
//		}
//		if(city == ""){
//			sap.m.MessageToast.show("Please enter City");
//			oController.getView().byId("ipHcity").setValueState("Error");
//			return;
//		}
		if(year == ""){
			sap.m.MessageToast.show("Please enter Year");
			oController.getView().byId("ipYear").setValueState("Error");
			return;
		}
		var filterString = "/"+entitySet+"?$filter=Country eq '"+country+"' and City eq '"+city+"' and Month eq '"+month+"' and Year eq '"+year+"'";
		oController.fetchDetails(filterString);
	},
	fetchBookingDetails:function(oController,repType,table){
		var pernr = oController.getView().byId("ipEmpno").getValue();
		var reinr = oController.getView().byId("ipReinr").getValue();
		var begda = oController.getView().byId("ipBegda").getValue();
		var endda = oController.getView().byId("ipEndda").getValue();
		var tocnty = oController.getView().byId("ipHcnty")?oController.getView().byId("ipHcnty").getSelectedKey():"";
		if(begda!=""&&endda==""){
			sap.m.MessageToast.show("Please enter End Date");
			return;
		}else if(begda==""&&endda!=""){
			sap.m.MessageToast.show("Please enter Start Date");
			return;
		}
		var filterString = "RepType eq '"+repType+"' and Pernr eq '"+pernr+"' and Reinr eq '"+reinr+"' and Begda eq '"+begda+"' and Endda eq '"+endda+"'";
		filterString = filterString + " and Country eq '"+tocnty+"'";
		if(repType=="RPDP"){
			filterString = filterString + "&$expand=BookingDetailsNav";
		}
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oController);
		oComponent.getModel("reservation").read("/BookingDetailsSet?$filter="+filterString, null, null, true, 
				jQuery.proxy(function(oData, response) {

			
			var oModel = new sap.ui.model.json.JSONModel();
            if(repType == "RPDP"){
            	oModel.setData({BookingDetailsNav:[oData.results]});
		    }else{
		    	oModel.setData(oData.results);
		    }			
			table.setModel(oModel,"bookReport");	
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
			if(repType == "RPBD"){
				oController.calculateTotalValues(oData.results);
			}
			

		},this), jQuery.proxy(function(error) {
			
			
		},this));
	},
	exportCSV:function(table,model,fileName,columns){
		//var columns = this.getAccExcelColumns(table);
		var oExport = new sap.ui.core.util.Export({
			exportType : new sap.ui.core.util.ExportTypeCSV({
				separatorChar : ","
//					fileExtension:"xls",
//					mimeType:"application/xls"
			}),
			models : model,
			rows : {
				path : "/"
			},
			columns : columns
		});
		oExport.saveFile(fileName).always(function() {
			this.destroy();
		});
	},
	getAccReportsExcelColumns:function(table){
		var tColumns = table.getColumns();
		var columns = [];
		for(var i=0;i<tColumns.length;i++){
			if(tColumns[i].getVisible()){
			var parts = tColumns[i].getTemplate().getBindingInfo("text").parts;
			var content = "";
			for(var j=0;j<parts.length;j++){
				if(content!="")
					content = content+" {"+parts[j].path+"}";
				else
				     content = "{"+parts[j].path+"}";
			}
		//	var content = tColumns[i].getTemplate().getBindingInfo("text").parts
			if(content == "{BegdaTxt}" || content == "{EnddaTxt}"){
				columns.push({
					name : tColumns[i].getLabel().getText(),
					template : {
						content : {							
							path : parts[0].path,
							type : new sap.ui.model.type.Date({
								  style:'medium',
								  source:{
									  pattern:'dd.MM.yyyy'
								  }
							})
						}
					}
				});
			}else{
			columns.push({
				name : tColumns[i].getLabel().getText(),
				template : {
					content : content
				}
			});
			}
			}
		}
		
		
		
		return columns;
	
	},
//	getAccExcelColumns : function(table) {
//		var columns = [];
//		var table;
//	
//	//	var cells = table.getBindingInfo("items").template.getCells();
//		var cols = table.getColumns();
//		for ( var i = 0; i < cols.length; i++) {
//			var template = cols[i].getTemplate();
//			if (template.getBindingInfo("text")) {
//				if(template.getBindingInfo("text").parts.length==1){
//				var path = template.getBindingInfo("text").parts[0].path;					
//						columns.push({
//							name : cols[i].getLabel().getText(),
//							template : {
//								content : "{" + path + "}"
//							}
//						});
//					}else{
//						columns.push({					
//						name : cols[i].getLabel().getText(),
//						template : {
//							content : "{" + template.getBindingInfo("text").parts[0].path + "}"+","+"{"+template.getBindingInfo("text").parts[1].path + "}"
//						}
//					});
//					}
//			}
//			}
//	
//		return columns;
//	},
	onEntriesDisplay:function(evt){
		var table = evt.getSource().getParent().getParent();
		table.setVisibleRowCount(parseInt(evt.getSource().getSelectedKey()));
	},
	onSimLiveSearch:function(evt){
		var table = evt.getSource().getParent().getParent();
		var value = evt.getSource().getValue();
		var aFilters = [new sap.ui.model.Filter({path:"reinr",operator:"Contains",value1:value}),
         	new sap.ui.model.Filter({path:"pernr",operator:"Contains",value1:value}),
         	new sap.ui.model.Filter({path:"Name",operator:"Contains",value1:value}),
         	new sap.ui.model.Filter({path:"begda",operator:"Contains",value1:value}),
         	new sap.ui.model.Filter({path:"endda",operator:"Contains",value1:value}),
         	new sap.ui.model.Filter({path:"rdate",operator:"Contains",value1:value}),
         	new sap.ui.model.Filter({path:"cntry",operator:"Contains",value1:value}),
         	];

        var oFilter = new sap.ui.model.Filter(aFilters,false);
        table.getBinding("items").filter(oFilter);
	},
	onSimExportCSV:function(evt){
		var table = evt.getSource().getParent().getParent();
		var model = table.getModel("SimcardRepModel");
		var columns = sap.ui.project.e2etm.util.StaticUtility.getSimExcelColumns(table);
		var oExport = new sap.ui.core.util.Export({
			exportType : new sap.ui.core.util.ExportTypeCSV({
				separatorChar : ","
			}),
			models : model,
			rows : {
				path : "/"
			},
			columns : columns
		});
		var filename = "";
		
		if(table.getId().indexOf("SimCardDataRepTable")!=-1){
			filename = "SimCardDataReport";
		}else if(table.getId().indexOf("SimCardDataUsageRepTable")!=-1){
			filename = "SimCardDataUsageReport";
		}	

	oExport.saveFile(filename).always(function() {
		this.destroy();
	});
	},
	getSimExcelColumns : function(table) {
		var columns = [];
		var table;
		// table = this.getView().byId("idItemTable");
		var cells = table.getBindingInfo("items").template.getCells();
		var cols = table.getColumns();
		for ( var i = 0; i < cols.length; i++) {
			if (cells[i].getBindingInfo("text")) {
				var path = cells[i].getBindingInfo("text").parts[0].path;
				// var path = cells[i].getBindingInfo("text").parts[0].path;
				var text = cols[i].getHeader().getText().trim();
				
				 if (text == "Sim Delivery Date" || text == "Travel Start Date" || text == "Travel End Date") {
					 columns.push({
							name : cols[i].getHeader().getText(),
							template : {
								content : {
									path:path,
									formatter:function(value){
										if(value!=""&&value){										
											return value.substr(8,2)+"."+value.substr(5,2)+"."+value.substr(0,4);
										}
									}
								}
							}
						});
				} else {
					columns.push({
						name : cols[i].getHeader().getText(),
						template : {
							content : {
								path:path,
								formatter:function(value){
									if(value!=""&&value){
										value = "\""+value+"\"";
										return value;
									}
								}
							}
						}
					});
				}
			}
		}
		return columns;
	},
	checkTravelCreation:function(aData,link){
		var odata = {Cntry:aData.ZZ_DEP_TOCNTRY,Asgtyp:aData.ZZ_ASG_TYP,Pernr:aData.ZZ_DEP_PERNR,Trvky:aData.ZZ_TRV_CAT};
		if(link.getId().indexOf("lnkHomeTrip")!=-1){
			odata.Trvky = "HOME"; 
		}else if(link.getId().indexOf("lnkSecondary")!=-1){
			odata.Trvky = "SECO"; 
		}else if(link.getId().indexOf("lnkEmergency")!=-1){
			odata.Trvky = "EMER"; 
		}
		
		oComponent.getModel().callFunction("CheckTrvCreation", "GET", odata, null, function(oData, response) {
		 if(oData.CheckTrvCreation.Flag == "X"){
			 link.setEnabled(true);
		 }
	}, function(error) {

	}, true);
	},
	checkEmpOnStaDepu:function(pernr){
		var empDeferred = $.Deferred();
		var odata = {Pernr:pernr};
		
		oComponent.getModel().callFunction("CheckEmpOnStaDepu", "GET", odata, null, function(oData, response) {
		// if(oData.CheckEmpOnStaDeputation.DepReq != ""){
			 empDeferred.resolve(oData.CheckEmpOnStaDeputation.DepReq);
		
	}, function(error) {

	}, true);
		empDeferred.promise();
	},
	checkSTA2018:function(startDate){
		var staDate = sap.ui.getCore().getModel("global").getData().sta2018; 
		if(staDate != ""){
		var aDate = new Date(staDate.substr(0, 4), staDate.substr(4, 2) - 1, staDate.substr(6, 2));
		var sDate = new Date(startDate.substr(0, 4), startDate.substr(4, 2) - 1, startDate.substr(6, 2));
		if (sDate >= aDate) {
			return true;
		 } 
		}
			return false;
		
	},
	checkTrvlDatesOverlapping: function() {
		var aData = sap.ui.getCore().getModel("global").getData();
		var aList = sap.ui.getCore().getModel("global").getData().deputationList; //Deputation List
		if (aList != null) {
			for (var i=0; i < aList.length; i++) {
				var existSD = aList[i].ZZ_DEP_STDATE;
				var existED = aList[i].ZZ_DEP_ENDATE;
				var newSD = aData.ZZ_DEP_STDATE;
				var newED = aData.ZZ_DEP_ENDATE;
				// Validation is ok
				if ((newSD < existSD && newED < existSD) || (newSD > existED && newED > existED)) {
					continue;
				} else {
					if ((newSD != existSD && newED != existED && 
							(aData.ZZ_TRV_CAT == "BUSR" || aData.ZZ_TRV_CAT == "INFO") && 
							aList[i].ZZ_REQ_TYP == "DEPU") || 
						aList[i].ZZ_REQ_TYP == "VISA" ||
						(aList[i].ZZ_TRV_CAT == "TRFR" && aList[i].ZZ_DEP_TYPE == "DOME")) {
						continue;
					} else {
						return true;
					}
				}
			}
		}
		return false;
	}
};