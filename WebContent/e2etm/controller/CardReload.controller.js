jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("sap.ui.project.e2etm.util.Formatter");
jQuery.sap.require("sap.ui.project.e2etm.util.StaticUtility");
jQuery.sap.require("sap.ui.core.util.Export");
jQuery.sap.require("sap.ui.core.util.ExportType");
jQuery.sap.require("sap.ui.core.util.ExportTypeCSV");
var oController;
var oDataModel = new sap.ui.model.odata.ODataModel(sServiceUrl);
sap.ui.controller("sap.ui.project.e2etm.controller.CardReload", {
	/**
	 * Called when a controller is instantiated and its View controls (if
	 * available) are already created. Can be used to modify the View before it
	 * is displayed, to bind event handlers and do other one-time
	 * initialization.
	 * 
	 * @memberOf e2etm.view.CardReload
	 */
	onInit : function() {
		oController = this;
		if (this.oView.sViewName == "sap.ui.project.e2etm.view.CardReload") {
			var fileModel = new sap.ui.model.json.JSONModel();
			fileModel.setData({
				Files : []
			});
			this.getView().setModel(fileModel, "new");
			var tablemodel = new sap.ui.model.json.JSONModel();
			tablemodel.setData([]);
			oController.getView().byId("advncetable").setModel(tablemodel);
			sap.ui.core.routing.Router.getRouter("MyRouter").attachRoutePatternMatched(this.onRouteMatched, this);
		} else {
			var dialog = sap.ui.xmlfragment("sap.ui.project.e2etm.fragment.CardReload.MonthlyRemittanceContent", oController);
			var content = sap.ui.xmlfragment("sap.ui.project.e2etm.fragment.CardReload.MonthlyRemittanceDepm", oController);
			sap.ui.core.routing.Router.getRouter("MyRouter").attachRoutePatternMatched(this.onRouteMatchedDashboard, this);
		}
	},
	onRouteMatched : function(evt, data) {
		if (evt.getParameter("name") == "card") {
			var view = evt.mParameters.view;
			oController = view.getController();
			sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oController);
			oController.clearData();
			var pData = sap.ui.getCore().getModel("profile").getData();
			var gData = sap.ui.getCore().getModel("global").getData();
			oController.getView().setModel(sap.ui.getCore().getModel("profile"), "profilemodel");
			oController.getView().byId("comments").setValue("");
			oController.setTableProperties(pData.currentRole);
			if (pData.currentRole == "EMP" || pData.currentRole == "GRM") {
				var objhdr = oController.getView().byId("objhdr");
				objhdr.setTitle("Travel Plan: " + gData.ZZ_TRV_REQ);
				if (pData.currentRole == "GRM") {
					gData.ZZ_REQ_TYP = gData.ZZ_TRV_CAT;
				}
				if (gData.ZZ_REQ_TYP == "SECO") {
					gData.ZZ_TRV_REQ = gData.ZZ_DEP_REQ;
				}
				oController.fetchCardReloadSet(gData.ZZ_TRV_REQ, gData.ZZ_REQ_TYP, gData.ZZ_DEP_PERNR, pData.currentRole);
			} else {
				var cardmodel = sap.ui.getCore().getModel("cardmodel").getData();
				var objhdr = oController.getView().byId("objhdr");
				objhdr.setTitle("Travel Plan: " + cardmodel.TravelPlan);
				oController.fetchCardReloadSet(cardmodel.TravelPlan, cardmodel.TravelType, cardmodel.EmpNo, pData.currentRole);
			}
		}
	},
	setTableProperties : function(role) {
		if (role == "EMP") {
			oController.getView().byId("advncetable").setMode("MultiSelect");
		} else {
			oController.getView().byId("advncetable").setMode("SingleSelectMaster");
		}
	},
	clearData : function() {
		filesAll = [];
		uploadFile = [];
		var uploadModel = new sap.ui.model.json.JSONModel();
		uploadModel.setData(filesAll);
		var UploadCollection = oController.getView().byId("UploadCollection");
		// UploadCollection.setModel(uploadModel);
		// UploadCollection.unbindObject("undefined");
		if (sap.ui.getCore().getModel("profile").getData().currentRole == "MRCR") {
			oController.getView().byId("panelrequest").setVisible(true);
			oController.getView().byId("request").setValue("");
		} else {
			oController.getView().byId("request").setValue("");
			oController.getView().byId("panelrequest").setVisible(true);
		}
		var tabledata = oController.getView().byId("advncetable").getModel().getData();
		tabledata = [];
		oController.getView().byId("advncetable").getModel().setData(tabledata);
	},
	fetchCardReloadSet : function(travelPlan, travelType, empNo, loginRole) {
		// var cardmodel = sap.ui.getCore().getModel("cardmodel").getData();
		var getworklist;
		if (loginRole == "EMP" || loginRole == "GRM") {
			getworklist = oDataModel.createBatchOperation("ForexWorklistSet?$filter=LoginRole+eq+'" + loginRole + "'+and+TravelPlan+eq+'" + travelPlan + "'+and+TravelType+eq+'" + travelType + "'+and+EmpNo+eq+'" + empNo + "'", "GET");
		}
		var getcomments = oDataModel.createBatchOperation("CardReloadComSet?$filter=Pernr+eq+'" + empNo + "'+and+Reinr+eq+'" + travelPlan + "'+and+Trvky+eq+'" + travelType + "'+and+Modid+eq+'CARD'", "GET");
		var getAttachments = oDataModel.createBatchOperation("DmsDocsSet?$filter=DepReq+eq+'" + travelPlan + "'+and+EmpNo+eq+'" + empNo + "'+and+DocType+eq+'CRD'", "GET");
		var getBank = oDataModel.createBatchOperation("BankDetailsSet(EmpNo='" + empNo + "',TravelPlan='" + travelPlan + "',TravelType='" + travelType + "')", "GET");
		var getForexHistory = oDataModel.createBatchOperation("ForexHistorySet?$filter=EmpNo+eq+'" + empNo + "'+and+TravelPlan+eq+'" + travelPlan + "'+and+TravelType+eq+'" + travelType + "'", "GET");
		var getCardsAll = oDataModel.createBatchOperation("ForexCardsAllSet?$filter=EmpNo+eq+'" + empNo + "'", "GET");
		if (loginRole == "EMP" || loginRole == "GRM")
			oDataModel.addBatchReadOperations([ getworklist, getcomments, getAttachments, getBank, getForexHistory, getCardsAll ]);
		else
			oDataModel.addBatchReadOperations([ getcomments, getAttachments, getBank, getForexHistory, getCardsAll ]);
		oDataModel.submitBatch(function(oResult) {
			try {
				var bankdetails;
				var cardsAll = [];
				var forexhistory = [];
				if (loginRole == "EMP" || loginRole == "GRM") {
					oController.setTravelDetails(oResult.__batchResponses[0].data.results[0]);
					if (oResult.__batchResponses[0].data.results.length != 0) {
						oController.setProperties(loginRole, oResult.__batchResponses[0].data.results[0]);
						oController.getCradSet(travelPlan, empNo, travelType, oResult.__batchResponses[0].data.results[0].SeqNo);
					} else {
						oController.setProperties(loginRole, "");
					}
					var commentModel = new sap.ui.model.json.JSONModel();
					commentModel.setData(oResult.__batchResponses[1].data.results);
					var commentsList = oController.getView().byId(sap.ui.core.Fragment.createId("AppoveInfo", "idListApprove"));
					commentsList.bindItems("/", new sap.m.FeedListItem({
						text : "{Comnt}",
						sender : "{Dname}",
						timestamp : "Date: " + "{path:'Erdat',formatter: 'sap.ui.project.e2etm.util.Formatter.formatTicketCommentsDate'}",
					}));
					commentsList.setModel(commentModel);
					// Attachments
					filesAll = oResult.__batchResponses[2].data.results;
					var uploadModel = oController.getView().getModel("new");
					uploadModel.setData({
						Files : filesAll
					});
					bankdetails = oResult.__batchResponses[3].data;
					forexhistory = oResult.__batchResponses[4].data.results;
					cardsAll = oResult.__batchResponses[5].data.results;
				} else {// /role="MRCR OR DEPM"
					var carddata = sap.ui.getCore().getModel("cardmodel").getData();
					oController.setTravelDetails(carddata);
					oController.setProperties(loginRole, carddata);
					oController.getCradSet(travelPlan, empNo, travelType, carddata.SeqNo);
					var commentModel = new sap.ui.model.json.JSONModel();
					commentModel.setData(oResult.__batchResponses[0].data.results);
					var commentsList = oController.getView().byId(sap.ui.core.Fragment.createId("AppoveInfo", "idListApprove"));
					commentsList.bindItems("/", new sap.m.FeedListItem({
						text : "{Comnt}",
						sender : "{Dname}",
						timestamp : "Date: " + "{path:'Erdat',formatter: 'sap.ui.project.e2etm.util.Formatter.formatTicketCommentsDate'}",
					}));
					commentsList.setModel(commentModel);
					// Attachments
					var filesAll = oResult.__batchResponses[1].data.results;
					var uploadModel = oController.getView().getModel("new");
					uploadModel.setData({
						Files : filesAll
					});
					bankdetails = oResult.__batchResponses[2].data;
					forexhistory = oResult.__batchResponses[3].data.results;
					cardsAll = oResult.__batchResponses[4].data.results;
				}
				var model = new sap.ui.model.json.JSONModel();
				model.setData(bankdetails);
				oController.getView().setModel(model, "bankdetails");
				// CardsAll
				var model = new sap.ui.model.json.JSONModel();
				model.setData(cardsAll);
				oController.getView().setModel(model, "cardsAll");
				oController.setForexHistory(forexhistory);
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
			} catch (err) {
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
			}
		}, function(error) {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
		}, true);
	},
	onAdd : function(evt) {
		var tabledata = oController.getView().byId("advncetable").getModel().getData();
		tabledata.push({});
		oController.getView().byId("advncetable").getModel().setData(tabledata);
	},
	onDel : function(evt) {
		var table = evt.oSource.getParent().getParent();
		var tabledata = table.getModel().getData();
		var index = table.getSelectedItems();
		if (index.length != 0) {
			for ( var i = index.length - 1; i >= 0; i--) {
				var tableIndex = table.indexOfItem(index[i]);
				tabledata.splice(tableIndex, 1);
			}
			table.getModel().setData(tabledata);
		} else {
			sap.m.MessageToast.show("Please select atleast one row");
		}
	},
	onCardsAllChange : function(evt) {
		var table = evt.oSource.getParent().getParent();
		var currency = evt.oSource.getValue();
		var data = oController.getView().getModel("cardsAll").getData();
		var tabledata = table.getModel().getData();
		var index = table.indexOfItem(evt.oSource.getParent());
		var selectedCard;
		for ( var i = 0; i < data.length; i++) {
			if (data[i].Currency == currency) {
				selectedCard = data[i];
				break;
			}
		}
		if (selectedCard) {
			tabledata[index].IssuerBank = selectedCard.IssuedBanker;
			tabledata[index].CardNo = selectedCard.CardNo;
			tabledata[index].CardValidity = selectedCard.CardValidUpto;
			table.getModel().setData(tabledata);
		}
	},
	setForexHistory : function(results) {
		var data = {};
		var model = new sap.ui.model.json.JSONModel();
		model.setData(results);
		oController.getView().byId("forexhistory").setModel(model, "frexhistory");
	},
	setTravelDetails : function(data) {
		// var carddata = sap.ui.getCore().getModel("cardmodel").getData();
		var jsonModel = new sap.ui.model.json.JSONModel();
		jsonModel.setData(data);
		oController.getView().setModel(jsonModel, "traveldetails");
	},
	getCradSet : function(travelPlan, empNo, travelType, seqno) {
		oDataModel.read("ForexCradSet?$filter=TravelPlan eq '" + travelPlan + "' and EmpNo eq '" + empNo + "' and TravelType eq '" + travelType + "' and Module eq 'CARD' and SeqNo eq " + seqno + "", null, null, true,
		// success
		function(oData, response) {
			var tabelmodel = new sap.ui.model.json.JSONModel();
			tabelmodel.setData(oData.results);
			oController["tableStoredData"] = (oData.results).slice();
			oController.getView().byId("advncetable").setModel(tabelmodel);
			// var table =
			// oController.getView().byId("icontabbaradmin").getItems()[1].getContent()[0];
			// table.setModel(worklistModel);
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
		}, function(error) {
			// error
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
		});
	},
	setProperties : function(role, oData) {
		var result;
		var jsonModel = new sap.ui.model.json.JSONModel();
		var role1 = oData.Role;
		var action = oData.Action;
		this.getView().byId("btnAddNewCard").setVisible(false);
		if (role != "EMP" && role != "GRM") {
			var cardmodel = sap.ui.getCore().getModel("cardmodel").getData();
		}
		result = {
				sVisible : false,
				aVisible : false,
				rVisible : false,
				saVisible : false,
				editable : false,
				amteditable : false,
				pvisible : false,
				peditable : false
			};
		switch (role) {
		case "MRCR":
			if (cardmodel.whichtab == "" || cardmodel.whichtab == "CARD" || cardmodel.whichtab == "__filter0") {
				result = {
					sVisible : true,
					aVisible : true,
					rVisible : false,
					saVisible : false,
					editable : false,
					amteditable : true,
					pvisible : true,
					peditable : true
				};
			} else if (cardmodel.whichtab == "APPROVE" || cardmodel.whichtab == "REJECT") {
				result = {
					sVisible : false,
					aVisible : false,
					rVisible : false,
					saVisible : false,
					editable : false,
					amteditable : false,
					pvisible : true,
					peditable : true
				};
			}
			break;
		case "DEPM":
			if (cardmodel.whichtab == "" || cardmodel.whichtab == "CARD" || cardmodel.whichtab == "__filter0") {
				result = {
					sVisible : true,
					aVisible : true,
					rVisible : false,
					saVisible : false,
					editable : false,
					amteditable : false,
					pvisible : false,
					peditable : false
				};
			} else if (cardmodel.whichtab == "APPROVE" || cardmodel.whichtab == "REJECT") {
				result = {
					sVisible : false,
					aVisible : false,
					rVisible : false,
					saVisible : false,
					editable : false,
					amteditable : false,
					pvisible : false,
					peditable : false
				};
			} else if (cardmodel.whichtab == "CLOSE") {
				result = {
					sVisible : false,
					aVisible : false,
					rVisible : false,
					saVisible : false,
					editable : false,
					amteditable : false,
					pvisible : false,
					peditable : false
				};
			}
			break;
		case "EMP":
			this.getView().byId("btnAddNewCard").setVisible(true);
			if (role1 == "01" && action == "01") {
				result = {
					sVisible : false,
					aVisible : false,
					rVisible : false,
					saVisible : false,
					editable : false,
					amteditable : false,
					pvisible : false,
					peditable : false
				};
			} else if ((role1 == "01" && action == "00") || (role1 == "02" && action == "02") || (role1 == "04" && action == "02") || (role1 == "09" && action == "02")) {// Employee
																																											// Creation
				result = {
					sVisible : false,
					aVisible : false,
					rVisible : false,
					saVisible : true,
					editable : true,
					amteditable : true,
					pvisible : false,
					peditable : false
				};
			} else {
				result = {
					sVisible : false,
					aVisible : false,
					rVisible : false,
					saVisible : false,
					editable : false,
					amteditable : false,
					pvisible : false,
					peditable : false
				};
			}
			var flag = sap.ui.project.e2etm.util.StaticUtility.checkTodayEndDate(oData.EndDate);
			if (flag == false) {
				result = {
					sVisible : false,
					aVisible : false,
					rVisible : false,
					saVisible : false,
					editable : false,
					amteditable : false,
					pvisible : false,
					peditable : false
				};
			}
			break;
		case "GRM":
			result = {
				sVisible : true,
				aVisible : true,
				rVisible : false,
				saVisible : false,
				editable : false,
				amteditable : false,
				pvisible : false,
				peditable : false
			};
		}
		// if (role == "MRCR") {
		//
		// result = {
		// sVisible : true,
		// aVisible : true,
		// rVisible : true,
		// saVisible : false
		// };
		//
		// } else if (role == "DEPM") {
		//
		// result = {
		// sVisible : true,
		// aVisible : true,
		// rVisible : false,
		// saVisible : false
		// };
		//
		// } else if (role == "EMP") {
		//
		// } else {
		//
		// result = {
		// sVisible : true,
		// aVisible : true,
		// rVisible : false,
		// saVisible : false
		// };
		// }
		jsonModel.setData(result);
		oController.getView().setModel(jsonModel, "bProperties");
	},
	onRouteMatchedDashboard : function(evt) {
		if (evt.getParameter("name") == "cardDashBoard") {
			var view = evt.mParameters.view;
			oController = view.getController();
			sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oController);
			var pData = sap.ui.getCore().getModel("profile").getData();		
			oController.getView().setModel(sap.ui.getCore().getModel("profile"), "profilemodel");
			
			var key = oController.getView().byId("icontabbaradmin").getSelectedKey();
			oController.setFieldDashboard(key);
			oController.setDashboardTabProperties();
			oController.setMRTabProperties();
			oController.getCardReloadSet(pData.currentRole);
			// get Reimbursement request for PE- pay role admin team(TGG1HC)
			if (pData.currentRole == "MRCR") {
				oController.getView().byId("reimIcon").setVisible(true);
				// create model list of reimbursements
				var oModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(oModel, "listReim");
				// //get profile
				// this.getView().setModel(sap.ui.getCore().getModel("profile"),
				// "profile");
				// get reimbursement list
				// var searchString =
				// oThis.getView().byId("idSearch").getValue();
				this.getView().byId("idIconTabBarReimAdmin").getItems()[0].setCount("");
				this.getView().byId("idIconTabBarReimAdmin").getItems()[1].setCount("");
				this.getFilter("NEW", "");
			} else {
				oController.getView().byId("reimIcon").setVisible(false);
			}
		}
	},
	setDashboardTabProperties:function(){
		var role = sap.ui.getCore().getModel("profile").getData().currentRole;
		
		if (role == "MRCR" || role == "DEPM" || role == "MRCA") {	
			oController.getView().byId("forexIcon").setVisible(false);
		} else {		
			oController.getView().byId("forexIcon").setVisible(true);
		}
		
		var cardTable = oController.getView().byId("cardIcon").getContent()[0];

		if (role == "MRCR") {
			cardTable.getHeaderToolbar().setVisible(true);
			oController.getView().byId("filterPanel").setVisible(false);
			
			cardTable.setMode(sap.m.ListMode.MultiSelect);
		//	oController.setMRTabContent(role);
			oController.getView().byId("rejIcon").setVisible(true);
		} else if (role == "DEPM") {
			cardTable.getHeaderToolbar().setVisible(false);
			oController.getView().byId("filterPanel").setVisible(false);
		
			oController.getView().byId("rejIcon").setVisible(true);
			cardTable.setMode(sap.m.ListMode.MultiSelect);
		//	oController.setMRTabContent(role);
		} else if (role == "FINA") {
			cardTable.setMode(sap.m.ListMode.SingleSelectMaster);
			cardTable.getHeaderToolbar().setVisible(false);
			oController.getView().byId("appIcon").getContent()[1].setMode("MultiSelect");
			oController.getView().byId("filterPanel").setVisible(false);
		
			oController.getView().byId("rejIcon").setVisible(false);
		//	oController.setMRTabContent(role);
		}else if (role == "MRCA"){
			cardTable.getHeaderToolbar().setVisible(false);
			oController.getView().byId("filterPanel").setVisible(false);
			oController.getView().byId("appIcon").getContent()[1].setMode("SingleSelectMaster");
			cardTable.setMode(sap.m.ListMode.SingleSelectMaster);		
			oController.getView().byId("rejIcon").setVisible(true);
		}
	
	},
	setMRTabProperties : function() {
		var pData = sap.ui.getCore().getModel("profile").getData();
		var mrtab = sap.ui.getCore().byId("mrtab");
		var items = mrtab.getItems();
		if(pData.currentRole == "MRCR" || pData.currentRole == "FINA" || pData.currentRole == "MRCA"){
		if (pData.currentRole == "MRCR" || pData.currentRole == "MRCA") {
			for ( var i = 0; i < items.length; i++) {
				items[i].setVisible(true);
			}
		} else if (pData.currentRole == "FINA") {
			for ( var i = 0; i < items.length; i++) {
				if (items[i].getKey() == "NEW" || items[i].getKey() == "APP")
					items[i].setVisible(true);
				else {
					items[i].setVisible(false);
				}
			}
		}
		    var monthtab = sap.ui.getCore().byId("verticalmr");
		    var monthIcon = oController.getView().byId("monthIcon");
		    monthIcon.removeAllContent();
		    monthIcon.insertContent(monthtab, 0);
		}else{
			var monthremdepm = sap.ui.getCore().byId("monthremdepm");
			var monthIcon = oController.getView().byId("monthIcon");
			monthIcon.removeAllContent();
			monthIcon.insertContent(monthremdepm, 0);
		}
		
		
	},
	onDashboardRefresh : function(evt) {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oController);
		var pData = sap.ui.getCore().getModel("profile").getData();
		oController.getCardReloadSet(pData.currentRole);
	},
	getCardReloadSet : function(role) {
			this.setFinanceDashboard(role);
	},
	setFinanceDashboard : function(role) {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
		var icontabbaradmin = this.getView().byId("icontabbaradmin");
		var key = icontabbaradmin.getSelectedKey();
        for(var i=0;i<icontabbaradmin.getItems().length;i++){
        	if(icontabbaradmin.getItems()[i].getVisible()){
        		key = icontabbaradmin.getSelectedKey();
        		break;
        	}
        }
//		if(key=="MONTH"){
//				key="FOREX";	
//				icontabbaradmin.setSelectedKey(key);
//		}
		
		if (key == "FOREX") {
			icontabbaradmin.fireSelect({
				item : this.getView().byId("forexIcon"),
				key : key,
				selectedKey:key
			});
		} else if (key == "CARD") {
			icontabbaradmin.fireSelect({
				item : this.getView().byId("cardIcon"),
				key : key
			});
		} else if (key == "APPROVE") {
			icontabbaradmin.fireSelect({
				item : this.getView().byId("appIcon"),
				key : key
			});
		} else if (key == "CLOSE") {
		} else if (key == "REJECT") {
			icontabbaradmin.fireSelect({
				item : this.getView().byId("rejIcon"),
				key : key
			});
		}else if(key=="MONTH"){
			icontabbaradmin.fireSelect({
				item : this.getView().byId("monthIcon"),
				key : key,
				selectedKey:key
			});
	}
	},
	setMRDepmTable : function(results) {
		var monthremdepm = sap.ui.getCore().byId("monthremdepm");
		var header = [];
		var item = [];
		for ( var i = 0; i < results.length; i++) {
			if (results[i].Header == "X") {
				header.push(results[i]);
			} else if (results[i].Header == "") {
				item.push(results[i]);
			}
		}
		var model = new sap.ui.model.json.JSONModel();
		model.setData(item);
		monthremdepm.setModel(model);
		var binding = monthremdepm.getBinding("items");
		var aSorters = [];
		aSorters.push(new sap.ui.model.Sorter("Currency", true, function(oContext) {
			var currency = oContext.getProperty("Currency");
			var amount;
			for ( var i = 0; i < header.length; i++) {
				if (header[i].Currency == currency) {
					amount = header[i].Amount;
					break;
				}
			}
			return {
				key : currency,
				text : "Currency:" + currency + "," + "Total Amount:" + amount
			};
		}));
		binding.sort(aSorters);
	},
	setMRTabContent : function(role) {
		if (role == "MRCR" || role == "FINA" || role == "MRCA") {
			var monthtab = sap.ui.getCore().byId("verticalmr");
			var monthIcon = oController.getView().byId("monthIcon");
			monthIcon.removeAllContent();
			monthIcon.insertContent(monthtab, 0);
		} else {
			var monthremdepm = sap.ui.getCore().byId("monthremdepm");
			var monthIcon = oController.getView().byId("monthIcon");
			monthIcon.removeAllContent();
			monthIcon.insertContent(monthremdepm, 0);
		}
	},
	setMRTable : function(result) {
		var mrtab = sap.ui.getCore().byId("mrtab");
		var items = mrtab.getItems();
		var jsModel = new sap.ui.model.json.JSONModel();
		jsModel.setData(result);
		var content;
		for ( var i = 0; i < items.length; i++) {
			if (items[i].getVisible()) {
				var key = items[i].getKey();
				content = items[i].getContent()[0];
				content.setModel(jsModel);
				var filter = oController.getMRFilter(key);
				var bindItems = content.getBinding("items");
				var filteredItems = bindItems.filter(filter);
				var model = oController.setBinding(filteredItems.aIndices, result);
				content.setModel(model);
				items[i].setCount(filteredItems.getLength());
			}
		}
	},
	getMRFilter : function(key) {
		var oFilter;
		var aFilters = [];
		switch (key) {
		// case 0:
		case "NEW":
			oFilter = new sap.ui.model.Filter("Tab", "EQ", "NEW");
			aFilters.push(oFilter);
			break;
		// case 1:
		case "REV":
			oFilter = new sap.ui.model.Filter("Tab", "EQ", "REVW");
			aFilters.push(oFilter);
			break;
		// case 2:
		case "APP":
			oFilter = new sap.ui.model.Filter("Tab", "EQ", "APPR");
			aFilters.push(oFilter);
			break;
		// case 3:
		case "ONH":
			oFilter = new sap.ui.model.Filter("Tab", "EQ", "HOLD");
			aFilters.push(oFilter);
			// oFilter = new sap.ui.model.Filter("Tab", "EQ", "ISSF");
			// aFilters.push(oFilter);
			break;
		case "SBAP":
			oFilter = new sap.ui.model.Filter("Tab", "EQ", "SBAP");
			aFilters.push(oFilter);
			break;
		case "SBRW":
			oFilter = new sap.ui.model.Filter("Tab", "EQ", "SBRW");
			aFilters.push(oFilter);
			break;
		}
		return aFilters;
	},
	setDataTable : function(result) {
		var items = oController.getView().byId("icontabbaradmin").getItems();
		var jsModel = new sap.ui.model.json.JSONModel();
		jsModel.setData(result);
		var content;
		for ( var i = 1; i < items.length; i++) {
			var key = items[i].getKey();
			if (key == "CARD" || key == "FOREX" || key == "APPROVE" || key == "REJECT") {
				if (items[i].getVisible()) {
					if (key != "APPROVE") {
						content = items[i].getContent()[0];
					} else {
						content = items[i].getContent()[1];
					}
					content.setModel(jsModel);
					var filter = oController.getCardForexFilter(key);
					var bindItems = content.getBinding("items");
					var filteredItems = bindItems.filter(filter);
					var model = oController.setBinding(filteredItems.aIndices, result);
					content.setModel(model);
					items[i].setCount(filteredItems.getLength());
				}
			}
		}
	},
	getCardForexFilter : function(key) {
		var oFilter;
		var aFilters = [];
		switch (key) {
		// case 0:
		case "CARD":
			oFilter = new sap.ui.model.Filter("Tab", "EQ", "CARD");
			aFilters.push(oFilter);
			break;
		// case 1:
		case "FOREX":
			oFilter = new sap.ui.model.Filter("Tab", "EQ", "FINF");
			aFilters.push(oFilter);
			break;
		// case 2:
		case "APPROVE":
			oFilter = new sap.ui.model.Filter("Tab", "EQ", "APPR");
			aFilters.push(oFilter);
			break;
		// case 3:
		case "REJECT":
			oFilter = new sap.ui.model.Filter("Tab", "EQ", "REJC");
			aFilters.push(oFilter);
			// oFilter = new sap.ui.model.Filter("Tab", "EQ", "ISSF");
			// aFilters.push(oFilter);
			break;
		case "CLOSE":
			oFilter = new sap.ui.model.Filter("Tab", "EQ", "CLOS");
			aFilters.push(oFilter);
			break;
		}
		return aFilters;
	},
	onCloseSearchForex : function(evt) {
		var key = oController.getView().byId("icontabbaradmin").getSelectedKey();
		sap.ui.project.e2etm.util.StaticUtility.onCloseSearchForex(evt, oController,key);
	},
	setBinding : function(aindice, results) {
		var result = [];
		for ( var i = 0; i < aindice.length; i++) {
			var index = aindice[i];
			result.push(results[index]);
		}
		var model = new sap.ui.model.json.JSONModel();
		model.setData(result);
		return model;
	},
	onTitlePress : function(evt) {
		var responsivepop = this.getView().byId("responsivepop");
		var domRef = evt.getParameter("domRef");
		responsivepop.openBy(domRef);
	},
	onFileUpload : function(evt) {
		var file = evt.getParameters("files").files[0];
		var oData = evt.oSource.getParent().getModel("traveldetails").getData();
		var sModule = "CRD";
		sap.ui.project.e2etm.util.StaticUtility.uploadCollectionFile(oController, file, oData.TravelPlan, oData.EmpNo, sModule);
	},
	onFileDeleted : function(oEvent) {
		// prepare FileName
		var sFileName = oEvent.getParameters("item").item.getFileName();
		// prepare DocType
		var oData = oEvent.oSource.getParent().getModel("traveldetails").getData();
		var sDocType;
		sDocType = "CRD";
		// prepare travel request number
		var sDepReq = oData.TravelPlan;
		// prepare employee number
		var sEmpNo = oData.EmpNo;
		// prepare index
		var sIndex = 0;
		sap.ui.project.e2etm.util.StaticUtility.deleteUploadCollectionFile(oController, oEvent, sDepReq, sFileName, sDocType, sEmpNo, sIndex);
	},
	onUploadComplete : function(oEvent) {
		oController.getView().getModel("new").refresh(true);
		// oEvent.oSource.setUploadUrl("");
	},
	onMenu : function(evt) {
		menuRef = sap.ui.project.e2etm.util.StaticUtility.customMenuOpen(oController, evt);
	},
	onMenuItemSelect : function(evt) {
		var aFilters = [];
		var aSorters = [];
		var filterString = "";
		var requestFlag,table,sPath,oBinding;
		
		var key = oController.getView().byId("icontabbaradmin").getSelectedKey();
		var role = sap.ui.getCore().getModel("profile").getData().currentRole;
		var menu = oController.getView().byId("menu_settings");

		if (key == "MONTH") {
			
			 table = oController.getMrTableForMenu();
			 sPath = oController.findMRProperty();
		     oBinding = table.getBinding("items");
			 requestFlag = sap.ui.project.e2etm.util.StaticUtility.customMenuItemSelect(oController, evt, menuRef, sPath, oBinding);
		} else {		
			 table = oController.getTable();
			 sPath = oController.findProperty();
		     oBinding = table.getBinding("items");
			 requestFlag = sap.ui.project.e2etm.util.StaticUtility.customMenuItemSelect(oController, evt, menuRef, sPath, oBinding);			
			
		}
		if(requestFlag){
			if(sPath=="TravelPlan"||sPath=="EmpNo"){
				var tab = this.getTab();
				if (key == "MONTH") {
				   filterString = "MRWorklistSet?$filter=LoginRole eq '"+role+"' and "+sPath+" eq '"+evt.getParameter("item").getValue()+"' and Tab eq '" + tab + "'";
				}else{					
				   filterString = "ForexWorklistSet?$filter=LoginRole eq '"+role+"' and "+sPath+" eq '"+evt.getParameter("item").getValue()+"' and Tab eq '" + tab + "'";
				}
				this.getSelectedTabValues(filterString,table);
			}
		}
		
	},
	getMrTableForMenu : function() {
		var key = sap.ui.getCore().byId("mrtab").getSelectedKey();
		if(key == "" || !(key)){
			key = "NEW";
		}
		var table = sap.ui.getCore().byId(sap.ui.core.Fragment.createId(key, "mrtabledetails"));
		return table;
	},
	findMRProperty : function() {
		var sPath;
		switch (menuRef.getText()) {
		case "Employee No":
			sPath = "EmpNo";
			break;
		case "Employee Name":
			sPath = "EmpName";
			break;
		case "Travel Plan":
			sPath = "TravelPlan";
			break;
		case "Start Date":
			sPath = "StartDate";
			break;
		case "End Date":
			sPath = "EndDate";
			break;
		case "Received Date":
			sPath = "ReceivedDt";
			break;
		case "To Country":
			sPath = "ToCountryText";
			break;
		}
		return sPath;
	},
	getTable : function() {
		var key = oController.getView().byId("icontabbaradmin").getSelectedKey();
		var table;
		switch (key) {
		case "" || "CARD":
			// table =
			// oController.getView().byId("icontabbaradmin").getItems()[0].getContent()[0];
			table = oController.getView().byId("cardIcon").getContent()[0];
			break;
		case "FOREX":
			// table =
			// oController.getView().byId("icontabbaradmin").getItems()[1].getContent()[0];
			table = oController.getView().byId("forexIcon").getContent()[0];
			break;
		case "APPROVE":
			// table =
			// oController.getView().byId("icontabbaradmin").getItems()[2].getContent()[0];
			table = oController.getView().byId("appIcon").getContent()[1];
			break;
		case "REJECT":
			// table =
			// oController.getView().byId("icontabbaradmin").getItems()[3].getContent()[0];
			table = oController.getView().byId("rejIcon").getContent()[0];
			break;
		case "MONTH":
			table = oController.getView().byId("monthIcon").getContent()[0];
			break;
		}
		return table;
	},
	findProperty : function() {
		var sPath;
		switch (menuRef.getText()) {
		case "Travel Req":
			sPath = "TravelPlan";
			break;
		case "Employee No":
			sPath = "EmpNo";
			break;
		case "Name":
			sPath = "EmpName";
			break;
		case "Start Date":
			sPath = "StartDate";
			break;
		case "Location":
			sPath = "Location";
			break;
		case "Request With":
			sPath = "ForexResp";
			break;
		case "Request Type":
			sPath = "RequestType";
			break;
		case "Received Date" || "Invoice Date":
			sPath = "ReceivedDt";
			break;
		}
		return sPath;
	},
	onMRItemPress : function(evt) {// pE-PAYROLL
		if (evt.getParameter("listItem").getAggregation("cells")) {
			var global = sap.ui.getCore().getModel("global").getData();
			var itemSelected = evt.getParameter("listItem");
			var listIndex = evt.oSource.indexOfItem(itemSelected);
			var aIndices = evt.oSource.getBinding("items").aIndices;
			var index = aIndices[listIndex];
			var bindItem = evt.oSource.getBinding("items").oList[index];
			global.ZZ_DEP_PERNR = bindItem.EmpNo;
			global.ZZ_TRV_REQ = bindItem.TravelPlan;
			global.ZZ_REQ_TYP = bindItem.TravelType;
			global.tabkey = sap.ui.getCore().byId("mrtab").getSelectedKey();
			sap.ui.getCore().getModel("global").setData(global);
			sap.ui.core.routing.Router.getRouter("MyRouter").navTo("monthrem");
		}
	},
	onMRItemPressDepm : function(evt) {// HRL TD
		if (evt.getParameter("listItem").getAggregation("cells")) {
			var global = sap.ui.getCore().getModel("global").getData();
			var itemSelected = evt.getParameter("listItem");
			var index = evt.oSource.indexOfItem(itemSelected);
			// index = index - 1;
			// var bindItem = evt.oSource.getBinding("items").oList[index];
			// global.ZZ_DEP_PERNR = bindItem.EmpNo;
			// global.ZZ_TRV_REQ = bindItem.TravelPlan;
			// global.ZZ_REQ_TYP = bindItem.TravelType;
			// global.tabkey = "MONTH";
			global.ZZ_DEP_PERNR = itemSelected.getCells()[0].getText();
			global.ZZ_TRV_REQ = itemSelected.getCells()[2].getText();
			global.ZZ_REQ_TYP = itemSelected.getCells()[7].getText();
			global.tabkey = "MONTH";
			sap.ui.getCore().getModel("global").setData(global);
			sap.ui.core.routing.Router.getRouter("MyRouter").navTo("monthrem");
		}
	},
	onReport : function(evt) {
		// sap.ui.core.routing.Router.getRouter("MyRouter").navTo("mrreports");
		var router = sap.ui.core.routing.Router.getRouter("MyRouter");
		var url = router.getURL("mrreports");
		var url1 = window.document.URL.split("#");
		url = url1[0] + "#/" + url;
		window.open(url, "_blank");
	},
	onItemPress : function(evt) {
		if (evt.getParameter("listItem").getAggregation("cells")) {
			var icontabbaradmin = oController.getView().byId("icontabbaradmin");
			var key = icontabbaradmin.getSelectedKey();
			// var itemSelected = evt.getParameter("listItem");
			var items = evt.oSource.getBinding("items");
			var listIndex = evt.oSource.indexOfItem(evt.getParameter("listItem"));
			var index = items.aIndices[listIndex];
			// var index = evt.oSource.indexOfItem(itemSelected);
			var bindItem = evt.oSource.getBinding("items").oList[index];
			var role = sap.ui.getCore().getModel("profile").getData().currentRole;
			if (role == "FINA") {
				if (key == "MONTH") {
					var model = new sap.ui.model.json.JSONModel();
					bindItem.whichtab = key;
					model.setData(bindItem);
					sap.ui.getCore().setModel(model, "forexitem");
					sap.ui.core.routing.Router.getRouter("MyRouter").navTo("monthrem");
				}else if(key=="CHCLS"){
					var model = new sap.ui.model.json.JSONModel();
					bindItem.whichtab = key;
					model.setData(bindItem);
					sap.ui.getCore().setModel(model, "forexitem");
					sap.ui.core.routing.Router.getRouter("MyRouter").navTo("modifyclose");
				}else {
					var model = new sap.ui.model.json.JSONModel();
					bindItem.whichtab = key;
					model.setData(bindItem);
					sap.ui.getCore().setModel(model, "forexitem");
					sap.ui.core.routing.Router.getRouter("MyRouter").navTo("forex");
				}
			} else {
				if (key == "FOREX") {
					var model = new sap.ui.model.json.JSONModel();
					bindItem.whichtab = key;
					model.setData(bindItem);
					sap.ui.getCore().setModel(model, "forexitem");
					sap.ui.core.routing.Router.getRouter("MyRouter").navTo("forex");
				} else if (key == "MONTH") {
					if (role == "DEPM") {
						oController.onMRItemPress(evt);
					} else {
						var model = new sap.ui.model.json.JSONModel();
						bindItem.whichtab = key;
						model.setData(bindItem);
						sap.ui.getCore().setModel(model, "forexitem");
						sap.ui.core.routing.Router.getRouter("MyRouter").navTo("monthrem");
					}
				} else {
					var data = {};
					data = bindItem;
					data.whichtab = key;
					var datamodel = new sap.ui.model.json.JSONModel();
					datamodel.setData(data);
					sap.ui.getCore().setModel(datamodel, "cardmodel");
					// sap.ui.getCore().getModel("global").setData(data);
					sap.ui.core.routing.Router.getRouter("MyRouter").navTo("card");
				}
			}
		}
	},
	openDialogTable : function() {
		var dialog, mrtable;
		if (!(sap.ui.getCore().byId("mrtable")))
			mrtable = sap.ui.xmlfragment("sap.ui.project.e2etm.fragment.CardReload.MonthlyRemittanceDialog", oController);
		if (!(sap.ui.getCore().byId("mrdialog")))
			dialog = new sap.ui.commons.Dialog("mrdialog", {
				title : "Item Details",
				autoClose : true,
				modal : true,
				content : [ mrtable ]
			});
		else
			dialog = sap.ui.getCore().byId("mrdialog");
		dialog.open();
	},
	setFieldDashboard : function(key) {
		var pepayroll = {};
		pepayroll.spvisible = false;
		pepayroll.auvisible = false;
		pepayroll.role = sap.ui.getCore().getModel("profile").getData().currentRole;
		// Monthly Remittance tab not displayed for FIN team only
		var monthIcon = oController.getView().byId("monthIcon");
		var bankIcon = oController.getView().byId("bankIcon");
		var loginrole = sap.ui.getCore().getModel("profile").getData().currentRole;
		this.getView().byId("tabUPL").setVisible(false);
		if (loginrole == "FINA") {
			monthIcon.setVisible(false);
			bankIcon.setVisible(true);
		} else {
			monthIcon.setVisible(true);
			bankIcon.setVisible(false);
		}
		var properties = {};
		
		if(loginrole == "MRCR")
			this.getView().byId("tabUPL").setVisible(true);
		
		
		
		if (sap.ui.getCore().getModel("profile").getData().currentRole != "FINA") {
			oController.getView().byId("finreports").setVisible(false);
			if (sap.ui.getCore().getModel("profile").getData().currentRole == "MRCR") {
				oController.getView().byId("finreports").setVisible(true);
			}
			if (key == "CARD") {
				properties = {
					barvisible : true,
					appvisible : true,
					mremvisible : false,
					accvisible : false,
					rejvisible : false,
					revvisible : false,
					clsvisible : false
				};
				// bar.setVisible(true);
				// approve.setVisible(true);
				// monthrem.setVisible(false);
			} else if (key == "APPROVE") {
				oController.getView().byId("appIcon").getContent()[1].setMode("SingleSelectMaster");
				properties = {
					barvisible : false,
					appvisible : false,
					mremvisible : false,
					accvisible : false,
					rejvisible : false,
					revvisible : false,
					clsvisible : false
				};
				// bar.setVisible(false);
				// approve.setVisible(false);
				// monthrem.setVisible(false);
			} else if (key == "FOREX") {
				// bar.setVisible(false);
				properties = {
					barvisible : false,
					appvisible : false,
					mremvisible : false,
					accvisible : false,
					rejvisible : false,
					revvisible : false,
					clsvisible : false
				};
			} else if (key == "REJECT") {
				properties = {
					barvisible : false,
					appvisible : false,
					mremvisible : false,
					accvisible : false,
					rejvisible : false,
					revvisible : false,
					clsvisible : false
				};
				// bar.setVisible(false);
			} else if (key == "MONTH" || key == "") {
				if (sap.ui.getCore().getModel("profile").getData().currentRole == "DEPM") {
					properties = {
						barvisible : true,
						appvisible : true,
						mremvisible : false,
						accvisible : true,
						rejvisible : true,
						revvisible : false,
						clsvisible : false
					};
					// bar.setVisible(true);
					// approve.setVisible(false);
					// monthrem.setVisible(false);
					// accept.setVisible(true);
					// reject.setVisible(true);
				} else if (sap.ui.getCore().getModel("profile").getData().currentRole == "MRCR" || 
						sap.ui.getCore().getModel("profile").getData().currentRole == "MRCA") {
					properties = oController.setMonthlyFieldProperties();
					properties.clsvisible = false;
				} else {
					properties = {
						barvisible : false,
						appvisible : true,
						mremvisible : false,
						accvisible : false,
						rejvisible : false,
						revvisible : false,
						clsvisible : false
					};
					// bar.setVisible(false);
				}
			} else {
				// bar.setVisible(false);
				properties = {
					barvisible : false,
					appvisible : false,
					mremvisible : false,
					accvisible : false,
					rejvisible : false,
					revvisible : false,
					clsvisible : false
				};
			}
			properties.bnkpayvisible = false;
		} else {// Role="fina"
			oController.getView().byId("finreports").setVisible(true);
			if (key == "CARD") {
				properties = {
					barvisible : false,
					appvisible : false,
					mremvisible : false,
					accvisible : false,
					rejvisible : false,
					revvisible : false,
					clsvisible : false,
					bnkpayvisible : false,
				};
				// bar.setVisible(false);
			} else if (key == "APPROVE") {
				oController.getView().byId("appIcon").getContent()[1].setMode("MultiSelect");
				properties = {
					barvisible : true,
					appvisible : false,
					mremvisible : false,
					accvisible : false,
					rejvisible : false,
					revvisible : false,
					clsvisible : true,
					bnkpayvisible : false,
				};
				pepayroll.spvisible = true;
				pepayroll.auvisible = false;
				// bar.setVisible(true);
				// approve.setVisible(false);
				// monthrem.setVisible(true);
			} else if (key == "FOREX") {
				properties = {
					barvisible : false,
					appvisible : false,
					mremvisible : false,
					accvisible : false,
					rejvisible : false,
					revvisible : false,
					clsvisible : false,
					bnkpayvisible : false,
				};
				// bar.setVisible(false);
			} else if (key == "REJECT") {
				properties = {
					barvisible : false,
					appvisible : false,
					mremvisible : false,
					accvisible : false,
					rejvisible : false,
					revvisible : false,
					clsvisible : false,
					bnkpayvisible : false,
				};
				// bar.setVisible(false);
			} else if (key == "MONTH" || key == "") {
				properties = oController.setMonthlyFieldProperties();
				properties.clsvisible = false;
				properties.bnkpayvisible = false;
				// properties = {
				// barvisible : true,
				// appvisible : false,
				// mremvisible : false,
				// accvisible : true,
				// rejvisible : true,
				// revvisible:false
				// };
				// bar.setVisible(true);
				// approve.setVisible(false);
				// monthrem.setVisible(false);
				// accept.setVisible(true);
				// reject.setVisible(true);
			} else if (key == "CLOSE"||key=="CHCLS") {
				properties = {
					barvisible : true,
					appvisible : false,
					mremvisible : false,
					accvisible : false,
					rejvisible : false,
					revvisible : false,
					clsvisible : false,
					bnkpayvisible : false,
				};
				pepayroll.spvisible = true;
				pepayroll.auvisible = true;
			} else if (key == "BTRN") {
				properties = oController.setBankTransfer();
			} else {
				properties = {
					barvisible : true,
					appvisible : false,
					mremvisible : false,
					accvisible : false,
					rejvisible : false,
					revvisible : false,
					clsvisible : false,
					bnkpayvisible : false,
				};
			}
		}
		
		
		if(sap.ui.getCore().getModel("profile").getData().currentRole == "MRCA"){
		properties = {
				barvisible : true,
				appvisible : false,
				mremvisible : false,
				accvisible : false,
				rejvisible : false,
				revvisible : false,
				clsvisible : false,
				bnkpayvisible:false
			};
		}
		
		if (!(oController.getView().getModel("fielddashboardproperties"))) {
			var model = new sap.ui.model.json.JSONModel();
			model.setData(properties);
			oController.getView().setModel(model, "fielddashboardproperties")
		} else {
			oController.getView().getModel("fielddashboardproperties").setData(properties);
		}
		var payrollmodel = new sap.ui.model.json.JSONModel();
		payrollmodel.setData(pepayroll);
		oController.getView().setModel(payrollmodel, "pepayroll");
		
		//oController.setDashboardTabProperties();
	},
	setBankTransfer : function() {
		var properties;
		var subkey = oController.getView().byId("bnktransfertab").getSelectedKey();
		if (subkey == "NEW") {
			properties = {
				barvisible : true,
				appvisible : false,
				mremvisible : false,
				accvisible : false,
				rejvisible : false,
				revvisible : false,
				clsvisible : false,
				bnkpayvisible : true,
			};
		} else {
			properties = {
				barvisible : true,
				appvisible : false,
				mremvisible : false,
				accvisible : false,
				rejvisible : false,
				revvisible : false,
				clsvisible : false,
				bnkpayvisible : false,
			};
		}
		return properties;
	},
	onBankTransferTabSelect : function(evt) {
		var properties = oController.setBankTransfer();
		oController.getView().getModel("fielddashboardproperties").setData(properties);
	},
	onMonthTabSelect : function(evt) {
		var properties = oController.setMonthlyFieldProperties();
		properties.clsvisible = false;
		properties.bnkpayvisible = false;
		oController.getView().getModel("fielddashboardproperties").setData(properties);
		var role = sap.ui.getCore().getModel("profile").getData().currentRole;
		var filterString = "MRWorklistSet?$filter=LoginRole eq '"+role+"' and Tab eq '" +  this.getMrTab(sap.ui.getCore().byId("mrtab").getSelectedKey()) + "'";
		this.getSelectedTabValues(filterString,this.getMrTableForMenu());
		
		
		// var key = evt.oSource.getSelectedKey();
		// var table =
		// sap.ui.getCore().byId(sap.ui.core.Fragment.createId(key,"mrtabledetails"));
		//		
		// if(key=="APP")
		// {
		// table.getHeaderToolbar().setVisible(true);
		// }
		// else{
		// table.getHeaderToolbar().setVisible(false);
		// }
	},
	setMonthlyFieldProperties : function() {
		var mrtab = sap.ui.getCore().byId("mrtab");
		var properties = {};
		var key = mrtab.getSelectedKey();
		var role = sap.ui.getCore().getModel("profile").getData().currentRole;
		if (role == "MRCR") {//Approver
			if (key == "NEW" || key == "") {
				properties = {
					barvisible : true,
					appvisible : false,
					mremvisible : false,
					accvisible : false,
					rejvisible : false,
					revvisible : false
				};
			} else if (key == "REV") {
				properties = {
					barvisible : true,
					appvisible : true,
					mremvisible : false,
					accvisible : false,
					rejvisible : false,
					revvisible : false
				};
			} else {
				properties = {
					barvisible : false,
					appvisible : false,
					mremvisible : false,
					accvisible : false,
					rejvisible : false,
					revvisible : false
				};
			}
		} else if (role == "FINA") {
			if (key == "NEW" || key == "") {
				properties = {
					barvisible : false,// true,
					appvisible : false,// true,
					mremvisible : false,
					accvisible : false,
					rejvisible : false,
					revvisible : false
				};
			} else if (key == "APP") {
				pepayroll.visible = true;
				properties = {
					barvisible : false,
					appvisible : false,
					mremvisible : false,
					accvisible : false,
					rejvisible : false,
					revvisible : false
				};
			}
		}else if(role == "MRCA"){//Reviewer
			if (key == "NEW" || key == "") {
				properties = {
					barvisible : true,
					appvisible : false,
					mremvisible : false,
					accvisible : false,
					rejvisible : false,
					revvisible : true
				};
			} else if (key == "REV") {
				properties = {
					barvisible : true,
					appvisible : false,
					mremvisible : false,
					accvisible : false,
					rejvisible : false,
					revvisible : false
				};
			} else {
				properties = {
					barvisible : false,
					appvisible : false,
					mremvisible : false,
					accvisible : false,
					rejvisible : false,
					revvisible : false
				};
			}
		}
		return properties;
	},
	onIconTabSelectAdmin : function(evt) {
		var tab;
		var filterString;
		var key = evt.getParameter("key");
		var role = sap.ui.getCore().getModel("profile").getData().currentRole;
		oController.setFieldDashboard(key);
//		if (role == "FINA") {
			switch (key) {
			case "MONTH":
				if(role == "DEPM")
					table = sap.ui.getCore().byId("monthremdepm");
				else
				    table = this.getMrTableForMenu();
				break;
			case "FOREX":
				table = evt.getParameter("item").getContent()[0];
				break;
			case "CARD":
				table = evt.getParameter("item").getContent()[0];
				break;
			case "APPROVE":
				table = evt.getParameter("item").getContent()[1];
				break;
			case "REJECT":
				table = evt.getParameter("item").getContent()[0];
				break;
			}
		tab = this.getTab();
		if (tab && table){
			if(key == "MONTH"){
				//this.getMRTabSelectedData(filterString,table);
				 filterString = "MRWorklistSet?$filter=LoginRole eq '"+role+"' and Tab eq '" + tab + "'";
			}else{		
				 filterString = "ForexWorklistSet?$filter=LoginRole eq '"+role+"' and Tab eq '" + tab + "'";		
			}
			this.getSelectedTabValues(filterString,table);
		}
//		}
	},
	
	getSelectedTabValues : function(filterString,table) {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oController);
		var profileRole = sap.ui.getCore().getModel("profile").getData().currentRole;
		oDataModel.read(filterString, null, null, true,
		// success
		jQuery.proxy(function(oData, response) {
			if(table.getId() == "monthremdepm"){
			   	this.setMRDepmTable(oData.results);
			}else{
		    	var worklistModel = new sap.ui.model.json.JSONModel();
		    	worklistModel.setData(oData.results);
		    	table.setModel(worklistModel);		    	
			}
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
		},this), function(error) {
			// error
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
		});
	},
	getTab : function() {
		var key = this.getView().byId("icontabbaradmin").getSelectedKey();
		switch (key) {
		case "CARD":
			return "CARD";
		case "FOREX":
			return "FINF";
		case "APPROVE":
			return "APPR";
		case "REJECT":
			return "REJC";
		case "MONTH":
			if(sap.ui.getCore().getModel("profile").getData().currentRole == "DEPM")
				return "MNTH";
			else
			    return this.getMrTab(sap.ui.getCore().byId("mrtab").getSelectedKey());
			//getMrTableForMenu
			
		}
	},
	getMrTab : function(key) {

		if(key == "" || !(key)){
			key = "NEW";
		}
		
		switch (key) {
	
		case "NEW":
			return  "NEW";
		
		case "REV":
			return  "REVW";
			
		case "APP":
			return  "APPR";
		
		case "ONH":
			return  "HOLD";
			
		case "SBAP":
			return  "SBAP";
			
		case "SBRW":
			return  "SBRW";
			
		}
	
	},
	onMassApprove : function() {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oController);
		var icontabbaradmin = oController.getView().byId("icontabbaradmin");
		var profileRole = sap.ui.getCore().getModel("profile").getData().currentRole;
		var key = icontabbaradmin.getSelectedKey();
		if (key == "" || key == "MONTH") {
			if (profileRole == "MRCR" || profileRole == "MRCA") {
				var table = sap.ui.getCore().byId("mrtab").getItems()[1].getContent()[0];
				oController.monthRemMassAction(table, "04", "03");
			} else if (profileRole == "FINA") {
				var table = sap.ui.getCore().byId("mrtab").getItems()[0].getContent()[0];
				oController.monthRemMassAction(table, "06", "03");
			} else if (profileRole == "DEPM") {
				var table = sap.ui.getCore().byId("monthremdepm");
				oController.monthRemMassActionDepm(table, "09", "03");
			}
		} else {
			var results = {};
			results.LoginRole = profileRole;
			results.ForexTransSet = [];
			var icontabbaradmin = oController.getView().byId("icontabbaradmin");
			var table = oController.getView().byId("cardIcon").getContent()[0];
			var request = table.getHeaderToolbar().getContent()[1].getValue();
			var items = table.getSelectedItems();
			if (results.LoginRole == "MRCR") {
				if (items.length != 0) {
					if (request != "") {
						var carddata = table.getModel().getData();
						for ( var i = 0; i < items.length; i++) {
							var j = table.indexOfItem(items[i]);
							results.ForexTransSet.push({
								TravelPlan : carddata[j].TravelPlan,
								TravelType : carddata[j].TravelType,
								EmpNo : carddata[j].EmpNo,
								Module : "CARD",
								SeqNo : carddata[j].SeqNo,
								VersionReason : carddata[j].VersionReason,
								Action : "03",
								Role : "04",
								Duration : carddata[j].Duration,
								ForexResp : request,
								Comments : ""
							});
						}
						oDataModel.create("ForexWorklistSet", results, null, function(oData, response) {
							sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
							// window.history.go(-1);
							sap.m.MessageToast.show("Updated Successfully", {
								duration : 10000,
								closeOnBrowserNavigation : false
							});
						}, function(error) {
							sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
							sap.m.MessageToast.show("Internal Server Error");
						}, true);
					} else {
						sap.m.MessageToast.show("Please enter request number");
						sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
					}
				} else {
					sap.m.MessageToast.show("Please select atleast one row");
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
				}
			} else if (results.LoginRole == "DEPM") {
				if (items.length != 0) {
					var carddata = table.getModel().getData();
					for ( var i = 0; i < items.length; i++) {
						var j = table.indexOfItem(items[i]);
						results.ForexTransSet.push({
							TravelPlan : carddata[j].TravelPlan,
							TravelType : carddata[j].TravelType,
							EmpNo : carddata[j].EmpNo,
							Module : "CARD",
							SeqNo : carddata[j].SeqNo,
							VersionReason : carddata[j].VersionReason,
							Action : "03",
							Role : "09",
							Duration : carddata[j].Duration,
							ForexResp : "",
							Comments : ""
						});
					}
					oDataModel.create("ForexWorklistSet", results, null, function(oData, response) {
						// oController.uploadFiles(oData.TravelPlan);
						sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
						// window.history.go(-1);
						sap.m.MessageToast.show("Updated Successfully", {
							duration : 10000,
							closeOnBrowserNavigation : false
						});
					}, function(error) {
						sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
						sap.m.MessageToast.show("Internal Server Error");
					}, true);
				} else {
					sap.m.MessageToast.show("Please select atleast one row");
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
				}
			}
		}
	},
	onMassSendBack : function() {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oController);
		var icontabbaradmin = oController.getView().byId("icontabbaradmin");
		var profileRole = sap.ui.getCore().getModel("profile").getData().currentRole;
		var key = icontabbaradmin.getSelectedKey();
		if (key == "" || key == "MONTH") {
			if (profileRole == "DEPM") {
				var table = sap.ui.getCore().byId("monthremdepm");
				oController.monthRemMassActionDepm(table, "09", "02");
			}
		}
	},
	onMassReview : function() {
		var table = sap.ui.getCore().byId("mrtab").getItems()[0].getContent()[0];
		oController.monthRemMassAction(table, "04", "16");
	},
	monthRemMassAction : function(table, role, action) {
		var items = table.getSelectedItems();
		if (items.length != 0) {
			var modelData = table.getModel().getData();
			var results = {};
			results.MRTransSet = [];
			results.LoginRole = sap.ui.getCore().getModel("profile").getData().currentRole;
			for ( var i = 0; i < items.length; i++) {
				var index = table.indexOfItem(items[i]);
				results.MRTransSet.push({
					TravelPlan : modelData[index].TravelPlan,
					TravelType : modelData[index].TravelType,
					EmpNo : modelData[index].EmpNo,
					Country : modelData[index].ToCountry,
					Role : role,
					Action : action,
					DepuReq : modelData[index].DepuReq,
				});
			}
			oController.createMRWorklistSet(results);
		} else {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
			sap.m.MessageToast.show("Please select atleast one row");
		}
	},
	monthRemMassActionDepm : function(table, role, action) {
		var items = table.getSelectedItems();
		if (items.length != 0) {
			var modelData = table.getModel().getData();
			var results = {};
			results.MRTransSet = [];
			results.LoginRole = sap.ui.getCore().getModel("profile").getData().currentRole;
			for ( var i = 0; i < items.length; i++) {
				var cells = items[i].getCells();
				// var index = table.indexOfItem(items[i]);
				// index = index - 1;
				// results.MRTransSet.push({
				// TravelPlan : modelData[index].TravelPlan,
				// TravelType : modelData[index].TravelType,
				// EmpNo : modelData[index].EmpNo,
				// Country : modelData[index].ToCountry,
				// Role : role,
				// Action : action,
				// DepuReq : modelData[index].DepuReq,
				// });
				results.MRTransSet.push({
					TravelPlan : cells[2].getText(),
					TravelType : cells[7].getText(),
					EmpNo : cells[0].getText(),
					Country : cells[9].getText(),
					Role : role,
					Action : action,
					DepuReq : cells[8].getText(),
				});
			}
			oController.createMRWorklistSet(results);
		} else {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
			sap.m.MessageToast.show("Please select atleast one row");
		}
	},
	createMRWorklistSet : function(results) {
		oDataModel.create("MRWorklistSet", results, null, function(oData, response) {
			oController.getMRWorklistSet(results.LoginRole);
			sap.m.MessageToast.show("Updated Successfully", {
				duration : 10000,
				closeOnBrowserNavigation : false
			});
		}, function(error) {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
			sap.m.MessageToast.show("Internal Server Error");
		}, true);
	},
	getMRWorklistSet : function(role) {
		oDataModel.read("MRWorklistSet?$filter=LoginRole eq '" + role + "'", null, null, false, function(oData, response) {
			if (role == "MRCR" || role == "FINA")
				oController.setMRTable(oData.results);
			else if (role == "DEPM")
				oController.setMRDepmTable(oData.results);
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
		}, function(error) {
			// table.setModel(null);
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
		});
	},
	onRefresh : function(evt) {
		var that = evt.getSource();
		setTimeout(function() {
			var role = sap.ui.getCore().getModel("profile").getData().currentRole;
			oController.getMRWorklistSet(role);
			that.hide();
		}, 1000);
	},
	onMassClose : function() {
		var table = oController.getView().byId("appIcon").getContent()[1];

		var items = table.getSelectedItems();
	//	results.LoginRole = sap.ui.getCore().getModel("profile").getData().currentRole;
		if(items.length!=0){
		var dialog = new sap.m.Dialog({
			title : 'Date',
			showHeader : true,			
			type : 'Standard',
			content : [ new sap.m.HBox({alignItems:"Center",justifyContent:"SpaceBetween",items:[new sap.m.Label({text:"Enter Date:"}),
				                               new sap.m.DatePicker("postDate",{displayFormat:"dd.MM.yyyy",valueFormat:"yyyyMMdd"})
			]})],
			
			beginButton :new sap.m.Button({
				text : 'Cancel',
				type : sap.m.ButtonType.Emphasized,
				press : function() {
					dialog.close();
				}
			}), 
			endButton : new sap.m.Button({
				text : 'Run Simulation',
				type : sap.m.ButtonType.Emphasized,
				press:jQuery.proxy(function(){
					var postValue = sap.ui.getCore().byId("postDate").getValue();
					if(postValue==""){
						sap.m.MessageToast.show("Please enter Date");
					}else{
					dialog.close();
					this.prepareSimulationData(postValue);
					}
				},this)}),
			afterClose : function() {
				dialog.destroy();
			}
		});
		dialog.open();
		
			
//			for ( var i = 0; i < items.length; i++) {
//				var j = table.indexOfItem(items[i]);
//				results.ForexTransSet.push({
//					TravelPlan : carddata[j].TravelPlan,
//					TravelType : carddata[j].TravelType,
//					EmpNo : carddata[j].EmpNo,
//					Module : carddata[j].Module,
//					SeqNo : carddata[j].SeqNo,
//					// VersionReason : carddata[j].VersionReason,
//					Action : "14",
//					Role : "06",
//				});
//			}
//			oDataModel.create("ForexWorklistSet", results, null, function(oData, response) {
//				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
//				// window.history.go(-1);
//				sap.m.MessageToast.show("Closed Successfully", {
//					duration : 10000,
//					closeOnBrowserNavigation : false
//				});
//				oController.getView().byId("dashboardRefresh").firePress();
//			}, function(error) {
//				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
//				sap.m.MessageToast.show("Internal Server Error");
//			}, true);
		} else {
			sap.m.MessageToast.show("Please select atleast one row");
		}
	},
	prepareSimulationData:function(postDateValue){
		var results = {Date:postDateValue,SmlRun:'X'};
	
		results.ForexAutomationACNav = [];
		var icontabbaradmin = oController.getView().byId("icontabbaradmin");
		var table = oController.getView().byId("appIcon").getContent()[1];

		var items = table.getSelectedItems();
	

			var carddata = table.getModel().getData();
			for ( var i = 0; i < items.length; i++) {
				var j = table.indexOfItem(items[i]);
				results.ForexAutomationACNav.push({
					
				    Date:postDateValue,
					REINR : carddata[j].TravelPlan,
					TRVKY : carddata[j].TravelType,
					PERNR : carddata[j].EmpNo,
					MODID : carddata[j].Module,				
				});
			}
			
			var postDef = this.onPostAmounts(results);
		   
			postDef.done(jQuery.proxy(function(results){
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
				this.openPostDialog(results);
			},this));
	},
	onPostAmounts:function(oData){
		var postDef = $.Deferred();
		oDataModel.create("ForexAutomationDateSet", oData, null, function(oData, response) {
			//sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
		   // this
			postDef.resolve(oData);
		}, function(error) {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
			sap.m.MessageToast.show("Internal Server Error");
		}, true);	 
		return postDef.promise();
	},
	openPostDialog : function(oData) {
		var accTable;
		
			
		if (!(sap.ui.getCore().byId("frexAccTable")))
			accTable = sap.ui.xmlfragment("sap.ui.project.e2etm.fragment.CardReload.AccountingTable", this);
		else
			accTable = sap.ui.getCore().byId("frexAccTable");
		
		var model = new sap.ui.model.json.JSONModel();
		model.setData(oData.ForexAutomationAmountNav.results);
		sap.ui.getCore().byId("expTable").setModel(model);
		
		var model = new sap.ui.model.json.JSONModel();
		model.setData(oData.ForexAutomationErrorNav.results);
		sap.ui.getCore().byId("errTable").setModel(model);
		//sap.ui.getCore().byId("Table").setModel(model,"travelsettlement");
		
		var dialog = new sap.m.Dialog({
			title : 'Confirm',
			showHeader : true,
			stretch : true,
			type : 'Standard',
			content : [ accTable ],
			customHeader:new sap.m.Bar({contentMiddle:[new sap.m.Label({text:"Details"})],
				                       }),
			beginButton :new sap.m.Button({
				text : 'Cancel',
				type : sap.m.ButtonType.Emphasized,
				press : function() {
					dialog.close();
				}
			}), 
			endButton : new sap.m.Button({
				text : 'Post',
				type : sap.m.ButtonType.Emphasized,
				press:jQuery.proxy(function(){
					oData.SmlRun = '';
					oData.ActPost = 'X';
					var postDef = this.onPostAmounts(oData);
					   
					postDef.done(jQuery.proxy(function(results){
						
						dialog.close();
						sap.m.MessageToast.show("Posted Successfully");
						this.getCardReloadSet();
					},this));
				},this)}),
			afterClose : function() {
				dialog.destroy();
			}
		});
		dialog.open();
	},
	onMonthlyRemittance : function() {
		var results = {};
		results.LoginRole = sap.ui.getCore().getModel("profile").getData().currentRole;
		results.ForexTransSet = [];
		var icontabbaradmin = oController.getView().byId("icontabbaradmin");
		var table = oController.getView().byId("appIcon").getContent()[1];
		// var request = table.getHeaderToolbar().getContent()[1].getValue();
		var items = table.getSelectedItems();
		if (items.length != 0) {
			var carddata = table.getModel().getData();
			for ( var i = 0; i < items.length; i++) {
				var j = table.indexOfItem(items[i]);
				results.ForexTransSet.push({
					TravelPlan : carddata[j].TravelPlan,
					TravelType : carddata[j].TravelType,
					EmpNo : carddata[j].EmpNo,
					Module : carddata[j].Module,
					SeqNo : carddata[j].SeqNo,
					VersionReason : carddata[j].VersionReason,
					Action : carddata[j].Action,
					Role : "",
					Duration : carddata[j].Duration,
					// ForexResp : request,
					Comments : "",
					Check : "X"
				});
			}
			oDataModel.create("ForexWorklistSet", results, null, function(oData, response) {
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
				// window.history.go(-1);
				sap.m.MessageToast.show("Updated Successfully", {
					duration : 10000,
					closeOnBrowserNavigation : false
				});
			}, function(error) {
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
				sap.m.MessageToast.show("Internal Server Error");
			}, true);
		} else {
			sap.m.MessageToast.show("Please select atleast one row");
		}
	},
	onBack : function() {
		window.history.go(-1);
	},
	onSave : function(evt) {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oController);
		var oData;
		var pData = sap.ui.getCore().getModel("profile").getData();
		var comments = oController.getView().byId("comments").getValue();
		var travel = oController.getView().getModel("traveldetails").getData();
		var bid = evt.oSource.getId();
		var id = bid.split("--");
		switch (id[1]) {
		case "save":
			if (pData.currentRole == "EMP") {
				oData = {
					TravelPlan : travel.TravelPlan,
					TravelType : travel.TravelType,
					EmpNo : travel.EmpNo,
					Module : "CARD",
					SeqNo : travel.SeqNo,
					VersionReason : travel.VersionReason,
					Action : "00",
					Role : "01",
					Duration : travel.Duration,
					Comments : comments
				};
			} else if (pData.currentRole == "MRCR") {
				oData = {
					TravelPlan : travel.TravelPlan,
					TravelType : travel.TravelType,
					EmpNo : travel.EmpNo,
					Module : "CARD",
					SeqNo : travel.SeqNo,
					VersionReason : travel.VersionReason,
					Action : "00",
					Role : "04",
					Duration : travel.Duration,
					Comments : comments
				};
			}
			oController.saveModel(oData, "Saved Successfully");
			break;
		case "submit":
			if (pData.currentRole == "EMP") {
				oData = {
					TravelPlan : travel.TravelPlan,
					TravelType : travel.TravelType,
					EmpNo : travel.EmpNo,
					SeqNo : travel.SeqNo,
					Module : "CARD",
					VersionReason : travel.VersionReason,
					ForexResp : '',
					ForexRespName : '',
					Action : "01",
					Role : "01",
					Duration : travel.Duration,
					Comments : comments
				};
					oController.saveModel(oData, "Submitted Successfully");	
				
			}
			
			break;
		case "sendback":
			if (pData.currentRole == "MRCR") {
				oData = {
					TravelPlan : travel.TravelPlan,
					TravelType : travel.TravelType,
					EmpNo : travel.EmpNo,
					Module : "CARD",
					SeqNo : travel.SeqNo,
					VersionReason : travel.VersionReason,
					Action : "02",
					Role : "04",
					SeqNo : travel.SeqNo,
					Duration : travel.Duration,
					Comments : comments
				};
				oController.saveModel(oData, "Sent Back Successfully");
			} else if (pData.currentRole == "FINA") {
				oData = {
					TravelPlan : travel.TravelPlan,
					TravelType : travel.TravelType,
					EmpNo : travel.EmpNo,
					Module : "CARD",
					SeqNo : travel.SeqNo,
					VersionReason : travel.VersionReason,
					Action : "02",
					Role : "06",
					Duration : travel.Duration,
					Comments : comments
				};
				oController.saveModel(oData, "Sent Back Successfully");
			} else if (pData.currentRole == "DEPM") {
				oData = {
					TravelPlan : travel.TravelPlan,
					TravelType : travel.TravelType,
					EmpNo : travel.EmpNo,
					Module : "CARD",
					SeqNo : travel.SeqNo,
					VersionReason : travel.VersionReason,
					Action : "02",
					Role : "09",
					Duration : travel.Duration,
					Comments : comments
				};
				oController.saveModel(oData, "Sent Back Successfully");
			} else if (pData.currentRole == "GRM") {
				oData = {
					TravelPlan : travel.TravelPlan,
					TravelType : travel.TravelType,
					EmpNo : travel.EmpNo,
					Module : "CARD",
					SeqNo : travel.SeqNo,
					VersionReason : travel.VersionReason,
					Action : "02",
					Role : "02",
					Duration : travel.Duration,
					Comments : comments
				};
				oController.saveModel(oData, "Sent Back Successfully");
			}
			break;
		case "approve":
			var request = oController.getView().byId("request").getValue();
			if (pData.currentRole == "MRCR") {
				if (request != "") {
					oData = {
						TravelPlan : travel.TravelPlan,
						TravelType : travel.TravelType,
						EmpNo : travel.EmpNo,
						Module : "CARD",
						SeqNo : travel.SeqNo,
						VersionReason : travel.VersionReason,
						ForexResp : request,
						Action : "03",
						Role : "04",
						Duration : travel.Duration,
						Comments : comments
					};
					oController.saveModel(oData, "Approved Successfully");
				} else {
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
					sap.m.MessageToast.show("Please enter request number");
				}
			} else if (pData.currentRole == "FINA") {
				oData = {
					TravelPlan : travel.TravelPlan,
					TravelType : travel.TravelType,
					EmpNo : travel.EmpNo,
					Module : "CARD",
					SeqNo : travel.SeqNo,
					VersionReason : travel.VersionReason,
					ForexResp : request,
					Action : "03",
					Role : "06",
					Duration : travel.Duration,
					Comments : comments
				};
				oController.saveModel(oData, "Approved Successfully");
			} else if (pData.currentRole == "DEPM") {
				oData = {
					TravelPlan : travel.TravelPlan,
					TravelType : travel.TravelType,
					EmpNo : travel.EmpNo,
					Module : "CARD",
					SeqNo : travel.SeqNo,
					VersionReason : travel.VersionReason,
					ForexResp : "",
					Action : "03",
					Role : "09",
					Duration : travel.Duration,
					Comments : comments
				};
				oController.saveModel(oData, "Approved Successfully");
			} else if (pData.currentRole == "GRM") {
				oData = {
					TravelPlan : travel.TravelPlan,
					TravelType : travel.TravelType,
					EmpNo : travel.EmpNo,
					Module : "CARD",
					SeqNo : travel.SeqNo,
					VersionReason : travel.VersionReason,
					Action : "03",
					Role : "02",
					Duration : travel.Duration,
					Comments : comments
				};
				oController.saveModel(oData, "Approved Successfully");
			}
			break;
		case "reject":
			if (pData.currentRole == "MRCR") {
				oData = {
					TravelPlan : travel.TravelPlan,
					TravelType : travel.TravelType,
					EmpNo : travel.EmpNo,
					Module : "CARD",
					SeqNo : travel.SeqNo,
					VersionReason : travel.VersionReason,
					Action : "08",
					Role : "04",
					Duration : travel.Duration,
					Comments : comments
				};
				oController.saveModel(oData, "Rejected Successfully");
			} else if (pData.currentRole == "FINA") {
				oData = {
					TravelPlan : travel.TravelPlan,
					TravelType : travel.TravelType,
					EmpNo : travel.EmpNo,
					Module : "CARD",
					SeqNo : travel.SeqNo,
					VersionReason : travel.VersionReason,
					Action : "08",
					Role : "06",
					Duration : travel.Duration,
					Comments : comments
				};
				oController.saveModel(oData, "Rejected Successfully");
			} else if (pData.currentRole == "DEPM") {
				oData = {
					TravelPlan : travel.TravelPlan,
					TravelType : travel.TravelType,
					EmpNo : travel.EmpNo,
					Module : "CARD",
					SeqNo : travel.SeqNo,
					VersionReason : travel.VersionReason,
					ForexResp : request,
					Action : "08",
					Role : "09",
					Duration : travel.Duration,
					Comments : comments
				};
				oController.saveModel(oData, "Rejected Successfully");
			}
			break;
		}
	},
	saveModel : function(oData, message) {
		var data = oController.getView().getModel("traveldetails").getData();
		oData.ReceivedDt = oController.getView().getModel("traveldetails").getData().ReceivedDt;
		oData.VisaCode = oController.getView().getModel("traveldetails").getData().VisaCode;
		oData.PePayroll = oController.getView().getModel("traveldetails").getData().PePayroll;
		oData.AdvUpdated = oController.getView().getModel("traveldetails").getData().AdvUpdated;
		oData.IssForex = oController.getView().getModel("traveldetails").getData().IssForex;
		oData.ClosedDate = oController.getView().getModel("traveldetails").getData().ClosedDate;
		oData.MonthlyRem = oController.getView().getModel("traveldetails").getData().MonthlyRem;
		oData.ToCountry = oController.getView().getModel("traveldetails").getData().ToCountry;
		var role = sap.ui.getCore().getModel("profile").getData().currentRole;
		var carddata = oController.getView().byId("advncetable").getModel().getData();
		oData.ForexCardSet = [];
		try {
			if (carddata.length != 0) {
				for ( var j = 0; j < carddata.length; j++) {
					// oData.ForexCardSet.push(carddata[j]);
					if (carddata[j].CardNo == "" || carddata[j].CardNo == undefined || carddata[j].CardNo == null) {
						throw "CARDNO";
					} else {
						oData.ForexCardSet.push({
							TravelPlan : data.TravelPlan,
							TravelType : data.TravelType,
							EmpNo : data.EmpNo,
							SeqNo : data.SeqNo,
							Module : data.Module,
							IssuerBank : carddata[j].IssuerBank,
							CardNo : carddata[j].CardNo,
							CardValidity : carddata[j].CardValidity,
							Amount : carddata[j].Amount,
							Currency : carddata[j].Currency,
							Items : (j + 1)
						});
					}
				}
			} else {
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
				sap.m.MessageToast.show("Submission not possible");
				return;
			}
			oDataModel.create("ForexTransSet", oData, null, function(oData, response) {
				// oController.uploadFiles(oData.TravelPlan, oData.EmpNo);
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
				window.history.go(-1);
				sap.m.MessageToast.show(message, {
					duration : 10000,
					closeOnBrowserNavigation : false
				});
			}, function(error) {
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
				sap.m.MessageToast.show("Internal Server Error");
			}, true);
		} catch (exc) {
			if (exc == "CARDNO") {
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
				sap.m.MessageToast.show("Please enter all details");
			}
		}
	},
	uploadFiles : function(visareq, empno) {
		var token = "";
		var post;
		var get = $.ajax({
			cache : false,
			async : false,
			url : sServiceUrl + "EMP_PASSPORT_INFOSet",
			type : "GET",
			headers : {
				'Authorization' : token
			},
			beforeSend : function(xhr) {
				xhr.setRequestHeader('X-CSRF-Token', 'Fetch');
			}
		});
		get.done(function(result, response, header) {
			for ( var i = 0; i < uploadFile.length; i++) {
				var sUrl = sServiceUrl + "DmsDocsSet";
				var post = oController.onFileUploadto(uploadFile[i].File, sUrl, visareq, empno, header);
			}
		});
	},
	onMRPress : function(evt) {
		// sap.ui.core.routing.Router.getRouter("MyRouter").navTo("mrreports");
		var router = sap.ui.core.routing.Router.getRouter("MyRouter");
		var url = router.getURL("mrreports");
		var url1 = window.document.URL.split("#");
		url = url1[0] + "#/" + url;
		window.open(url, "_blank");
	},
	onFileUploadto : function(file, sUrl, visareq, empno, header) {
		var sSlung = visareq + "," + empno + "," + file.name + "," + "CRD";
		var oHeaders = {
			'X-Requested-With' : "XMLHttpRequest",
			'X-CSRF-Token' : header.getResponseHeader("X-CSRF-Token"),
			'Accept' : "application/json",
			'DataServiceVersion' : "2.0",
			'Content-Type' : "application/json",
			"slug" : sSlung
		};
		post = jQuery.ajax({
			cache : false,
			async : false,
			type : 'POST',
			url : sUrl,
			headers : oHeaders,
			cache : false,
			contentType : file.type,
			processData : false,
			data : file
		});
		post.done(function(data) {
			url = data.d.FileUrl;
			filesAll.push(data.d);
		});
	},
	onFilterDate : function(evt) {
		// var info = evt.oSource.getParent().getParent().getInfoToolbar();
		var date1 = oController.getView().byId("date1").getValue();
		var date2 = oController.getView().byId("date2").getValue();
		var afilters = [];
		var oFilter1, oFilter2, oFilter3;
		var country = oController.getView().byId("country").getValue();
		if (date1 != "") {
			oFilter1 = new sap.ui.model.Filter("ReceivedDt", "GE", date1);
		}
		if (date2 != "") {
			oFilter2 = new sap.ui.model.Filter("ReceivedDt", "LE", date2);
		}
		if (country != "") {
			oFilter3 = new sap.ui.model.Filter("ToCountryText", "Contains", country);
		}
		if (oFilter1 && oFilter2 && oFilter3) {
			oFilter = new sap.ui.model.Filter([ oFilter1, oFilter2, oFilter3 ], true);
			afilters.push(oFilter);
		} else if (oFilter1 && oFilter2) {
			oFilter = new sap.ui.model.Filter([ oFilter1, oFilter2 ], true);
			afilters.push(oFilter);
		} else if (oFilter1 && oFilter3) {
			oFilter = new sap.ui.model.Filter([ oFilter1, oFilter3 ], true);
			afilters.push(oFilter);
		} else if (oFilter2 && oFilter3) {
			oFilter = new sap.ui.model.Filter([ oFilter2, oFilter3 ], true);
			afilters.push(oFilter);
		} else if (oFilter1) {
			afilters.push(oFilter1);
		} else if (oFilter2) {
			afilters.push(oFilter2);
		} else if (oFilter3) {
			afilters.push(oFilter3);
		}
		var bindItems = evt.oSource.getParent().getParent().getContent()[1].getBinding("items");
		bindItems.filter(afilters);
		// if (date1 != "" && country != "") {
		// var oFilter1 = new sap.ui.model.Filter("StartDate", "GE", date1);
		// var oFilter2 = new sap.ui.model.Filter("ToCountryText", "Contains",
		// country);
		//
		// oFilter = new sap.ui.model.Filter([ oFilter1, oFilter2 ], true);
		//
		// afilters.push(oFilter);
		// var bindItems =
		// evt.oSource.getParent().getParent().getContent()[1].getBinding("items");
		// bindItems.filter(afilters);
		// // afilters.push(oFilter2);
		//
		// }
		// else if (date1 != "" && country == "") {
		//		
		// var oFilter1 = new sap.ui.model.Filter("StartDate", "GE", date1);
		// afilters.push(oFilter1);
		// var bindItems =
		// evt.oSource.getParent().getParent().getContent()[1].getBinding("items");
		// bindItems.filter(afilters);
		// } else if (date1 == "" && country != "") {
		// var oFilter1 = new sap.ui.model.Filter("ToCountryText", "Contains",
		// country);
		// afilters.push(oFilter1);
		// var bindItems =
		// evt.oSource.getParent().getParent().getContent()[1].getBinding("items");
		// bindItems.filter(afilters);
		// } else {
		// var bindItems =
		// evt.oSource.getParent().getParent().getContent()[1].getBinding("items");
		// bindItems.filter(null);
		// }
	},
	onValueHelpRequest : function(evt) {
		var yearpick, res;
		if (!(sap.ui.getCore().byId("bnkyearpick"))) {
			yearpick = new sap.ui.unified.calendar.YearPicker("bnkyearpick", {
				select : oController.onYearSelect
			});
		}
		if (!(sap.ui.getCore().byId("bnkresp"))) {
			res = new sap.m.ResponsivePopover("bnkresp", {
				showHeader : true,
				customHeader : new sap.m.Bar({
					contentLeft : [ new sap.m.Button({
						icon : "sap-icon://slim-arrow-left",
						press : oController.left
					}) ],
					contentRight : [ new sap.m.Button({
						icon : "sap-icon://slim-arrow-right",
						press : oController.right
					}) ]
				}),
				content : [ yearpick ]
			});
		} else
			res = sap.ui.getCore().byId("bnkresp");
		// evt.getSource().addDependent(res);
		res.openBy(evt.getSource());
	},
	onBankTransfer : function(evt) {
		sap.ui.core.routing.Router.getRouter("MyRouter").navTo("bnktransfer");
	},
	onProcessPayment : function() {
		// var table =
		// oController.getView().byId("bnktransfertab").getItems()[0].getContent()[1];
		var table = oController.getView().byId("bnktransfertab").getItems()[0].getContent()[1].getContent()[0].getContent()[0];
		var items = table.getSelectedItems();
		if (items.length != 0) {
			var dialog = new sap.m.Dialog({
				title : 'Confirm',
				type : 'Message',
				content : new sap.m.Text({
					text : 'Please download before processing the payment'
				}),
				beginButton : new sap.m.Button({
					text : 'OK',
					press : function() {
						dialog.close();
						oController.processPayment();
					}
				}),
				endButton : new sap.m.Button({
					text : 'Cancel',
					press : function() {
						dialog.close();
					}
				}),
				afterClose : function() {
					dialog.destroy();
				}
			});
			dialog.open();
		} else {
			sap.m.MessageToast.show("Please select atleast one row");
		}
	},
	processPayment : function() {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oController);
		var data = oController.getView().getModel("banktransfer").getData();
		var table = oController.getView().byId("bnktransfertab").getItems()[0].getContent()[1].getContent()[0].getContent()[0];
		var batch = [];
		var items = table.getSelectedItems();
		for ( var i = 0; i < items.length; i++) {
			var index = table.indexOfItem(items[i]);
			var odata = data[index];
			if (odata.__metadata)
				odata.__metadata = undefined;
			batch.push(oDataModel.createBatchOperation("MRBankSet", "POST", odata));
		}
		oDataModel.addBatchChangeOperations(batch);
		oDataModel.submitBatch(function(oResult) {
			try {
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
				sap.m.MessageToast.show("Updated Successfully");
				oController.getView().byId("bankprocesssubmit").firePress();
			} catch (err) {
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
			}
		}, function(error) {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
		}, true);
	},
	onProcessSubmit : function() {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oController);
		var month = oController.getView().byId("bnkmonth").getSelectedKey();
		var year = oController.getView().byId("bnkyear").getValue();
		oDataModel.read("MRBankSet?$filter=Month eq '" + month + "' and Year eq '" + year + "'", null, null, true, function(oData, response) {
			var model = new sap.ui.model.json.JSONModel();
			model.setData(oData.results);
			oController.getView().setModel(model, "banktransfer");
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
		}, function(error) {
		});
	},
	onProcessDownload : function() {
		var data;
		if (oController.getView().getModel("banktransfer"))
			data = oController.getView().getModel("banktransfer").getData();
		else
			data = [];
		var table = oController.getView().byId("bnktransfertab").getItems()[0].getContent()[1].getContent()[0].getContent()[0];
		var selectedData = [];
		var columns = [];
		var items = table.getSelectedItems();
		for ( var i = 0; i < items.length; i++) {
			var index = table.indexOfItem(items[i]);
			selectedData.push(data[index]);
		}
		var tableItems = oController.getView().byId("bnktransfertab").getItems()[0].getContent()[1].getContent()[0].getContent()[0].getBindingInfo("items");
		var cells = tableItems.template.getCells();
		var cols = table.getColumns();
		for ( var i = 0; i < cols.length; i++) {
			// var path =
			// cols[i].getTemplate().getBindingInfo("text").parts[0].path;
			var path = cells[i].getBindingInfo("text").parts[0].path;
			columns.push({
				name : cols[i].getHeader().getText(),
				template : {
					content : "{" + path + "}"
				}
			});
		}
		var model = new sap.ui.model.json.JSONModel();
		model.setData(selectedData);
		// var columns = oController.getColumns();
		oExport = new sap.ui.core.util.Export({
			exportType : new sap.ui.core.util.ExportTypeCSV({
				separatorChar : ","
			}),
			// exportType : new sap.ui.core.util.ExportType({
			// fileExtension : "pdf",
			// mimeType:"application/pdf",
			// charset:"UTF-8"
			// }),
			models : model,
			rows : {
				path : "/"
			},
			columns : columns
		});
		// download exported file
		oExport.saveFile().always(function() {
			this.destroy();
		});
	},
	onUpdateCard:function(){
	    var table = this.getView().byId("advncetable");	   
	    var carddata = this["tableStoredData"];		
	//	rows = table.getSelectedItems();
		if(carddata.length == 0){
					
		var oView = this.getView();
		var oDialog = oView.byId("newCardDialog");		
		if (!oDialog) {		
			oDialog = sap.ui.xmlfragment(oView.getId(),"sap.ui.project.e2etm.fragment.forex.UpdateCard", this);
//			this.getView().byId("ipNewCur").bindItems({path:"/",template:new sap.ui.core.ListItem({additionalText:"{Currency}",text:"{Currency}"})});
//			this.getView().byId("ipNewCur").setModel(oController.getView().getModel("cardsAll"));
			if(!(this.getView().getModel("curModel"))){
				this.callCurrencyHelp(oView,oDialog);
			}else{
				oView.addDependent(oDialog);
				oDialog.open();
			}
			
		}else{
			oDialog.open();
		}
		
		this.getView().byId("ipNewBank").setValue("");
		this.getView().byId("ipNewCard").setValue("");
		this.getView().byId("ipNewCardV").setValue("");
		this.getView().byId("ipNewCur").setValue("");
	
		}else{
			sap.m.MessageToast.show("Update is not possible.Cards already exists.")
		}
	},
	callCurrencyHelp:function(oView,oDialog){
		var getCurr = oDataModel.createBatchOperation("GetF4Help?Srch_help='F4_TCURC_ISOCD'&$format=json", "GET");
	//	oDataModel.callFunction()
		var getBanks = oDataModel.createBatchOperation("GetF4Table?TableName='ZE2E_FOREX_MAS'&Col1='CONST'&Col2='SELPAR'&Col3='VALUE'&Col4=''&Col5=''&Col6=''&Col7=''&Col8=''&Col9=''&Col10=''&$format=json", "GET");
		oDataModel.addBatchReadOperations([ getCurr, getBanks ]);
	
	oDataModel.submitBatch(jQuery.proxy(function(oResult) {
		try {
			var curModel = new sap.ui.model.json.JSONModel();
			curModel.setSizeLimit(oResult.__batchResponses[0].data.results.length);
			curModel.setData(oResult.__batchResponses[0].data.results);
			this.getView().setModel(curModel,"curModel");
			
			var results = oResult.__batchResponses[1].data.results;
			var bank = [];
			for ( var i = 0; i < results.length; i++) {
				if (results[i].FIELD1 == "BANK") {
					bank.push(results[i]);
				} 
			}
			var bankmodel = new sap.ui.model.json.JSONModel();
			bankmodel.setData(bank);			
			this.getView().setModel(bankmodel, "Bank");
	        oView.addDependent(oDialog);
	        oDialog.open();
		}catch(exc){
			
		}
	},this),function(error) {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oForex);
	}, true);
	
	
//		var aData = {Srch_help:'F4_TCURC_ISOCD'};
//		oComponent.getModel().callFunction("GetF4Help", "GET", aData, null, 
//		jQuery.proxy(function(oData, response) {
//         
//		},this), function(error) {
//			
//		}, true);
	},
	onAddNewCard:function(){
		var currency = this.getView().byId("ipNewCur").getValue();
		var curFlag = false;
		if(this.getView().byId("ipNewBank").getValue() == ""||
		   this.getView().byId("ipNewCard").getValue() == ""||
		   this.getView().byId("ipNewCardV").getValue() == ""||
		   this.getView().byId("ipNewCur").getValue() == ""){
			sap.m.MessageToast.show("Please enter all Details");
			return;
		}
//		
		var curList = this.getView().getModel("curModel").getData();
		for(var i=0;i<curList.length;i++){
			if(curList[i].FIELD1 == currency){
				curFlag = true;
				break;
			}
		}		
		if(!curFlag){
			sap.m.MessageToast.show("Please enter valid Currency");
			return;
		}
//		
		var cardsAll = oController.getView().getModel("cardsAll").getData();
		for(var i=0;i<cardsAll.length;i++){
			if(cardsAll[i].Currency == currency){
				sap.m.MessageToast.show("Currency Already Exists.Please select different currency");
				return;
			}
		}
		this["cardNewData"] = jQuery.Deferred();
		
		var oData = {EmpNo:oController.getView().getModel("traveldetails").getData().EmpNo,
			     IssuedBanker:this.getView().byId("ipNewBank").getSelectedKey(),
			     CardNo:this.getView().byId("ipNewCard").getValue(),
			     CardValidUpto:this.getView().byId("ipNewCardV").getValue(),
			     Currency:this.getView().byId("ipNewCur").getValue()};
		
		sap.ui.project.e2etm.util.StaticUtility.addNewCard(oData,this);
		jQuery.when(this["cardNewData"]).done(jQuery.proxy(function(){
			this.updateCardTable();
			this.onNewCardClose();
			this.fetchCardsAll(oController.getView().getModel("traveldetails").getData().EmpNo);
		},this));
	
	},
	onNewCardClose:function(){
		this.getView().byId("newCardDialog").close();
	},
	updateCardTable:function(){
		var table = this.getView().byId("advncetable");
		var carddata = table.getModel().getData();
		var index;
		if(carddata.length==0){
			carddata.push({});
			index = 0;
		}else{
			index = carddata.length - 1;
		}
		   
	//	rows = table.getSelectedItems();
		
		//var generaldata = this.getView().getModel("general").getData();
		var oData = {EmpNo:oController.getView().getModel("traveldetails").getData().EmpNo,
				     IssuedBanker:this.getView().byId("ipNewBank").getSelectedKey(),
				     CardNo:this.getView().byId("ipNewCard").getValue(),
				     CardValidUpto:this.getView().byId("ipNewCardV").getValue(),
				     Currency:this.getView().byId("ipNewCur").getValue()};
		carddata[index]["IssuerBank"] = oData.IssuedBanker;
		carddata[index]["CardNo"] = oData.CardNo;
		carddata[index]["CardValidity"] = oData.CardValidUpto; 
		carddata[index]["Currency"] = oData.Currency;
		table.getModel().setData(carddata);
	},
	fetchCardsAll : function(empno) {
		oDataModel.read("ForexCardsAllSet?$filter=EmpNo eq '" + empno + "'", null, null, true, function(oData, response) {
			var data = oController.getView().getModel("cardsAll").getData();
			data = oData.results;
			oController.getView().getModel("cardsAll").setData(data);
			oController.getView().getModel("cardsAll").refresh(true);
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);

		}, function(error) {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
		});
	},
	onMonthHelpRequest : function(evt) {
		var monthpick, res;
		if (!(sap.ui.getCore().byId("bnkmonthpick"))) {
			monthpick = new sap.ui.unified.calendar.MonthPicker("bnkmonthpick", {
				select : oController.onMonthSelect
			});
		}
		if (!(sap.ui.getCore().byId("bnkmonthresp"))) {
			res = new sap.m.ResponsivePopover("bnkmonthresp", {
				showHeader : false,
				content : [ monthpick ]
			});
		} else
			res = sap.ui.getCore().byId("bnkmonthresp");
		// evt.getSource().addDependent(res);
		res.openBy(evt.getSource());
	},
	left : function(evt) {
		var yearpick = sap.ui.getCore().byId("bnkyearpick");
		yearpick.previousPage();
	},
	right : function(evt) {
		var yearpick = sap.ui.getCore().byId("bnkyearpick");
		yearpick.nextPage();
	},
	onYearSelect : function(evt) {
		var year = evt.oSource.getYear();
		var inputc = sap.ui.getCore().byId("bnkresp").getAggregation("_popup")._oOpenBy;
		// var flag = true;
		inputc.setValue(year);
		sap.ui.getCore().byId("bnkresp").close();
	},
	onMonthSelect : function(evt) {
		var inputc = sap.ui.getCore().byId("bnkmonthresp").getAggregation("_popup")._oOpenBy;
		inputc.setValue(evt.oSource.getMonth());
		// var flag = true;
		sap.ui.getCore().byId("bnkmonthresp").close();
	},
	// ==============Begin of Reimbursement ==============
	// get list of Reimbursement request base on filter tab
	getFilter : function(keyFilter, searchString) {
		switch (keyFilter) {
		// NEW
		case "NEW":
			var sRole = '04';
			var sAction = '00';
			sap.ui.project.e2etm.util.StaticUtility.setBusy(true, this);
			sap.ui.project.e2etm.util.StaticUtility.getListAdmin(sRole, searchString, "REIM", sAction, this, "NEW", "MRCR");
			break;
		// CLOSED
		case "CLOSED":
			var sRole = '04';
			var sAction = '00';
			// sap.ui.project.e2etm.util.StaticUtility.setBusy(true, this);
			// sap.ui.project.e2etm.util.StaticUtility.getListAdmin(sRole,
			// searchString, "REIM", sAction, this, "CLOSED","MRCR");
			if (searchString == "") {
				this.getView().byId("idIconTabBarReimAdmin").getItems()[1].setCount("");
				this.getView().getModel("listReim").setProperty("/results", []);
				sap.m.MessageToast.show("Please enter employee number!");
			} else {
				sap.ui.project.e2etm.util.StaticUtility.setBusy(true, this);
				sap.ui.project.e2etm.util.StaticUtility.getListAdmin(sRole, searchString, "REIM", sAction, this, "CLOSED", "MRCR");
			}
			break;
		}// end switch
	},
	// event triggers when clicking on filter tab
	onReimTabSelect : function(evt) {
		this.getFilter(evt.mParameters.key, this.getView().byId("idSearch").getValue());
	},
	// on item admin list press
	onItemPressReim : function(event) {
		sap.ui.project.e2etm.util.StaticUtility.itemPress(event, this);
	},
	// search employee number
	onSearch : function(evt) {
		sap.ui.project.e2etm.util.StaticUtility.onSearchEmp(evt, this);
	},
	onReportREIMress : function() {
		sap.ui.project.e2etm.util.StaticUtility.reimReport();
	},
	onAccReportsPress:function(){
		sessionStorage.currentRole = sap.ui.getCore().getModel("profile").getData().currentRole;
		var router = sap.ui.core.routing.Router.getRouter("MyRouter");
		
		var url = router.getURL("bookingdetails");
		var url1 = window.document.URL.split("#");
		url = url1[0] + "#/" + url;
		window.open(url, "_blank");
		//sap.ui.core.routing.Router.getRouter("MyRouter").navTo("occupancy");
	},
	
	//dye5kor
	onFrxMassApprove:function(evt){
	
		var index;
		var selectedIndex;
		var selectedData=[];
		var batch = [];
		var cardData=[];
		var cashData=[];
		var cardTotalAmt=0;
		var cardAmtCurr=[];
		var cashAmtCurr=[];
		var selectedFrxData=[];
		var index;
		var oDataModel = new sap.ui.model.odata.ODataModel(sServiceUrl);
		var frxTable = oController.getView().byId("forexIcon").getContent()[0];
		var frxData = frxTable.getModel().getData();
		var frxSelectedData = frxTable.getSelectedItems();
		
		if(frxSelectedData.length==0){	
			sap.m.MessageToast.show("Please select atleast one row");
		}else {
			for(var i=0;i<frxSelectedData.length; i++){
				
				 index = frxSelectedData[i].getBindingContext().sPath;
				 selectedIndex = index.split('/')[1];
				 batch.push( oDataModel.createBatchOperation("ForexCradSet?$filter=TravelPlan+eq+'" + frxData[selectedIndex].TravelPlan + "'+and+EmpNo+eq+'" + frxData[selectedIndex].EmpNo + "'+and+TravelType+eq+'" + frxData[selectedIndex].TravelType + "'+and+Module+eq+'FREX'+and+SeqNo+eq+" + frxData[selectedIndex].SeqNo + "", "GET"));
				 batch.push(oDataModel.createBatchOperation("ForexCashSet?$filter=TravelPlan+eq+'" + frxData[selectedIndex].TravelPlan + "'+and+EmpNo+eq+'" + frxData[selectedIndex].EmpNo + "'+and+TravelType+eq+'" + frxData[selectedIndex].TravelType + "'+and+Module+eq+'FREX'+and+SeqNo+eq+" + frxData[selectedIndex].SeqNo + "", "GET"));
				selectedFrxData.push({ TravelPlan:frxData[selectedIndex].TravelPlan,
					 					TravelType:frxData[selectedIndex].TravelType,
					 					EmpNo:frxData[selectedIndex].EmpNo,
					 					Module:'FREX',
					 					SeqNo:frxData[selectedIndex].SeqNo
				 })
				
				 //selectedFrxData.push(frxData[selectedIndex] );
			}
			
			}
			this.getView().getModel().addBatchReadOperations(batch);
			this.getView().getModel().submitBatch(jQuery.proxy(function(oResult) {
				try {

					sap.ui.project.e2etm.util.StaticUtility.setBusy(true, this);
					
					for(var j=0;j<oResult.__batchResponses.length;j=j+2){			
						 cardData.push( oResult.__batchResponses[j].data.results);
					}
					
					for(var k=1;k<oResult.__batchResponses.length;k=k+2){
						 cashData.push(oResult.__batchResponses[k].data.results);	
					}
				
					for(var i=0;i<cardData.length;i++){
						
						index = -1;
						
						for(var j=0;j<cardData[i].length;j++){
							
							//index = cardAmtCurr.findIndex(x => x.curr==cardData[i][j].Currency);
							cardAmtCurr.forEach(function(item,vIndex){
									if(cardData[i][j].Currency==item.curr){
									index=vIndex;
										return false;
									}
								});
							if(index != -1){
							cardAmtCurr[index].Amt += parseFloat(cardData[i][j].Amount);
								
							}else {
								
								cardAmtCurr.push({ Amt:parseFloat(cardData[i][j].Amount), curr:cardData[i][j].Currency});
							}
							
						}
						
					}
					
					for(var i=0;i<cashData.length;i++){
						
						index = -1;
						
						for(var j=0;j<cashData[i].length;j++){
							
							//index = cashAmtCurr.findIndex(x => x.curr==cashData[i][j].Currency);
						
							cashAmtCurr.forEach(function(item,vIndex){
								if(cashData[i][j].Currency==item.curr){
								index=vIndex;
									return false;
								}
							});
							if(index != -1){
							cashAmtCurr[index].Amt += parseFloat(cashData[i][j].Cash);
								
							}else {
								
								cashAmtCurr.push({ Amt:parseFloat(cashData[i][j].Cash), curr:cashData[i][j].Currency});
							}
							
						}
						
					}
					
					for(i=0;i<cashAmtCurr.length;i++){
						//index = cardAmtCurr.findIndex(x => x.curr==cashAmtCurr[i].curr);
						index = -1;
						cardAmtCurr.forEach(function(item,vIndex){
							if(cashAmtCurr[i].curr==item.curr){
							index=vIndex;
								return false;
							}
						});
						if(index != -1){
							cardAmtCurr[index].Amt += parseFloat(cashAmtCurr[i].Amt);
							}else{
							cardAmtCurr.push({ Amt:cashAmtCurr[i].Cash,curr:cashAmtCurr[i].Currency});	
								
							}
						}
					
					var cardAndCashmodel = new sap.ui.model.json.JSONModel();
					cardAndCashmodel.setData(cardAmtCurr);
					
					
					var dialog = new sap.m.Dialog({
						title: 'Total Amount to be Approved',
						type: 'Message',
					
						beginButton: new sap.m.Button({
							text: 'Submit',
							press: function(){;
							sap.ui.project.e2etm.util.StaticUtility.setBusy(true, this);	
							oController.massFrxApproveSubmit(selectedFrxData);
							sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);	
							sap.m.MessageToast.show("Approved Successfully");
							
							dialog.close();
							}
						}),
						endButton: new sap.m.Button({
							text: 'Cancel',
							press: function () {
								dialog.close();
							}
						}),
						afterClose: function() {
							dialog.destroy();
						}
					});
					dialog.bindAggregation("content",
							{path:"/",template:new sap.m.VBox({ 
						              items:[new sap.m.HBox({justifyContent:"SpaceBetween", width:"100px", items:[
						            	  new sap.m.Label({text:"{curr}"}),new sap.m.Label({text:"{Amt}"})]})]  })});
					
					dialog.setModel(cardAndCashmodel);

					dialog.open();
						
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);	
				} catch (err) {
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
				}
			},this), jQuery.proxy(function(error) {
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
			},this), true);
				
		
		},
		massFrxApproveSubmit:function(selectedFrxData){
		var FrxOdataModel = new sap.ui.model.odata.ODataModel(sServiceUrl)
		if(selectedFrxData.length!=0){
			for(var i=0;i<selectedFrxData.length;i++){
				
				var sUri="ForexTransSet(TravelPlan='"+selectedFrxData[i].TravelPlan+"',TravelType='"+selectedFrxData[i].TravelType+"',EmpNo='"+selectedFrxData[i].EmpNo+"',Module='FREX',SeqNo="+selectedFrxData[i].SeqNo+")";
				FrxOdataModel.update(sUri, selectedFrxData[i], null, function(oData, response) {
					
				}, function(error) {
					//sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oForex);
					sap.m.MessageToast.show("Internal Server Error");
				}, false);
				
			}
			
		}
			
		},
		
		
	
	//dye5kor
// ==============End Reimbursement ==============
	onSalaryUpload:function(evt){
		var file = this.getView().byId("fileUploader").oFileUpload.files[0];
		var importFile = $.Deferred();
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, this);
		importFile = sap.ui.project.e2etm.util.StaticUtility.onXLSFileImport(file,"EmpSalDetlsCggsSet","EmpSalDetlsNav",oComponent.getModel())
		importFile.done(jQuery.proxy(function(response){
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
			sap.m.MessageToast.show("Uploaded Successfully");
			 this.fetchDetails();
		},this));
		
		importFile.fail(jQuery.proxy(function(error){
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
			var message;
			if(error.responseText){
				 message = JSON.parse(error.responseText).error.message.value;					
			}else{
				message = JSON.parse(error.response.body).error.message.value;
			}
			var dialog = new sap.m.Dialog({
				title: 'Error',
				type: 'Message',
				state: 'Error',
				content: new sap.m.Text({
					text: "Cannot save Request."+message
				}),
				beginButton: new sap.m.Button({
					text: 'OK',
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});

			dialog.open();
			//sap.m.MessageToast.show("Please make use of template provided to upload the data");
			
		},this));
	},
	onDownloadTemplate:function(){
		var columns = this.getTemplateColumns();
		sap.ui.project.e2etm.util.StaticUtility.exportCSV(null,new sap.ui.model.json.JSONModel(),"Salary List",columns);
	},
	getTemplateColumns:function(){
		var columns = [{
			name : "Employee No_Pernr",
	        template : {
				content: "{Pernr}"	             
				       }
		}
		, {
			name : "Avg.Monthly Salary_ZzMonthSal",
			template : {
				content : {
				path:	"ZzMonthSal",
				type: 'sap.ui.model.type.Float',
                formatOptions: {
				    maxFractionDigits: 2
                }
			}
		}
		}, {
			name : "Bob in EURO_ZzBob",
			template : {
				content : {
					path:"ZzBob",
					type: 'sap.ui.model.type.Float',
	                formatOptions: {
					    maxFractionDigits: 2
	                }
		}
			}
		},{
			name : "STA Alownace Net_ZzStaNet",
			template : {
				content : {
					path:"ZzStaNet",
						type: 'sap.ui.model.type.Float',
		                formatOptions: {
						    maxFractionDigits: 2
		                }
				}
			}
		},{
			name : "STA Allowance Gross_ZzStaGross",
			template : {
				content : {
					path:"ZzStaGross",
					type: 'sap.ui.model.type.Float',
	                formatOptions: {
					    maxFractionDigits: 2
	                }
				}
			}
		}, {
			name : "Net Housing Allownace_ZzHousingNet",
			template : {
				content : {
					path:"ZzHousingNet",
					type: 'sap.ui.model.type.Float',
	                formatOptions: {
					    maxFractionDigits: 2
	                }
			// "{Width} x {Depth} x {Height} {DimUnit}"
			}
		}
		}, {
			name : "Gross Hosuing Allowance_ZzHousingGross",
			template : {
				content : {
					path:"ZzHousingGross",
					type: 'sap.ui.model.type.Float',
	                formatOptions: {
					    maxFractionDigits: 2
	                }
			}
		}
		},
		{
			name : "Social Security in Germany_ZzSocialSec",
			template : {
				content : {
					path:"ZzSocialSec",
					type: 'sap.ui.model.type.Float',
	                formatOptions: {
					    maxFractionDigits: 2
	                }
				}
			}
		},
		{
			name : "Comparable German gross salary_ZzDeGross",
			template : {
				content : {
					path:"ZzDeGross",
					type: 'sap.ui.model.type.Float',
	                formatOptions: {
					    maxFractionDigits: 2
	                }
				}
			}
		},
		{
			name : "Job Description_ZzJobDesc",
			template : {
				content : "{ZzJobDesc}"
			}
		},
		{
			name : "Area_ZzArea",
			template : {
				content : "{ZzArea}"
			}
		},
		{
			name : "Total_ZzTotalGross",
			template : {
				content : {
					path:"ZzTotalGross",
					type: 'sap.ui.model.type.Float',
	                formatOptions: {
					    maxFractionDigits: 2
	                }
				}
			}
		},
		{
			name : "Currency_ZzCurrency",
			template : {
				content : "{ZzCurrency}"
			}
		},
		{
			name : "CGGS:Job level_ZzLevel",
			template : {
				content : "{ZzLevel}"
			}
		},
		{
			name : "Difference Amount_ZzDiffAmt",
			template : {
				content : "{ZzDiffAmt}"
			}
		},
		{
			name : "Pay out to Associate_ZzPayEmp",
			template : {
				content : "{ZzPayEmp}"
			}
		},
		{
			name : "Fixed Rate1_ZzFixRate1",
			template : {
				content : "{ZzFixRate1}"
			}
		},
		{
			name : "Home Currency_ZzFixCurr1",
			template : {
				content : "{ZzFixCurr1}"
			}
		},
		{
			name : "Fixed Rate2_ZzFixRate2",
			template : {
				content : "{ZzFixRate2}"
			}
		},
		{
			name : "Currency_ZzFixCurr2",
			template : {
				content : "{ZzFixCurr2}"
			}
		},
		{
			name : "Revision effective Frm_ZzRevFrm",
			template : {
				content : {
					path:"ZzRevFrm",
					type : new sap.ui.model.type.Date({
						 pattern:'dd.MM.yyyy',
						  source:{}
						})
					}
			}
		},
		{
			name : "Reason_ZzRevRes",
			template : {
				content : "{ZzRevRes}"
			}
		}
		
		];
		
		return columns;
	
	},
/**
 * Similar to onAfterRendering, but this hook is invoked before the controller's
 * View is re-rendered (NOT before the first rendering! onInit() is used for
 * that one!).
 * 
 * @memberOf e2etm.view.CardReload
 */
// onBeforeRendering: function() {
//
// },
/**
 * Called when the View has been rendered (so its HTML is part of the document).
 * Post-rendering manipulations of the HTML could be done here. This hook is the
 * same one that SAPUI5 controls get after being rendered.
 * 
 * @memberOf e2etm.view.CardReload
 */
// onAfterRendering: function() {
//
// },
/**
 * Called when the Controller is destroyed. Use this one to free resources and
 * finalize activities.
 * 
 * @memberOf e2etm.view.CardReload
 */
// onExit: function() {
//
// }
});