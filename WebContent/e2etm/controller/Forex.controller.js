//jQuery.sap.require("sap.ui.project.e2etm.util.FileUpload");
//jQuery.sap.require("sap.ui.project.e2etm.util.StaticUtility");
jQuery.sap.require("sap.ui.core.format.NumberFormat");
jQuery.sap.require("sap.ca.ui.dialog.factory");
jQuery.sap.require("sap.ui.project.e2etm.util.Formatter");
jQuery.sap.require("sap.ui.project.e2etm.util.StaticUtility");
jQuery.sap.require("sap.ui.core.util.Export");
jQuery.sap.require("sap.ui.core.util.ExportType");
jQuery.sap.require("sap.ui.core.util.ExportTypeCSV");
// var selctedItem;
sap.ui.controller("sap.ui.project.e2etm.controller.Forex", {
	/**
	 * Called when a controller is instantiated and its View controls (if
	 * available) are already created. Can be used to modify the View before it
	 * is displayed, to bind event handlers and do other one-time
	 * initialization.
	 * 
	 * @memberOf sap.ui.project.e2etm.controller.Forex
	 */
	onInit : function() {
		// admin screen
		if (this.oView.sViewName == "sap.ui.project.e2etm.view.ForexAdmin") {
			sap.ui.core.routing.Router.getRouter("MyRouter").attachRoutePatternMatched(this.onRouteMatchedAdmin, this);
			// detail screen
		} else if (this.oView.sViewName == "sap.ui.project.e2etm.view.Forex" || this.oView.sViewName == "sap.ui.project.e2etm.view.ModifyClose") {
			var fileModel = new sap.ui.model.json.JSONModel();
			fileModel.setData({
				Files : []
			});
			this.getView().setModel(fileModel, "new");
			sap.ui.core.routing.Router.getRouter("MyRouter").attachRoutePatternMatched(this.onRouteMatchedDetail, this);
		}
	},
	// admin screen logic
	onRouteMatchedAdmin : function(event) {
		//oForex = this;
		// forex Admin screen
		if (event.getParameter("name") == "forexAdmin") {
			oForex = event.getParameter("view").getController();
			// sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oForex);
			// get worklist for forex admin
			// Setting the payroll team and advance updated
			var model = new sap.ui.model.json.JSONModel();
			var pepayroll = {};
			pepayroll.spvisible = false;
			pepayroll.auvisible = false;
			pepayroll.role = sap.ui.getCore().getModel("profile").getData().currentRole;
			model.setData(pepayroll);
			oForex.getView().setModel(model, "pepayroll");
			oForex.getWorklist();
		}
	},
	// getWorklist : function() {
	// var OdataModel = new sap.ui.model.odata.ODataModel(sServiceUrl);
	// var worklistModel = new sap.ui.model.json.JSONModel();
	// OdataModel.read("ForexWorklistSet?$filter=LoginRole eq 'FEX'", null,
	// null, true,
	// // success
	// function(oData, response) {
	// worklistModel.setData(oData.results);
	// oForex.getView().setModel(worklistModel, "forexadmin");
	// var iconTabBarForexAdmin =
	// oForex.getView().byId("idIconTabBarForexAdmin");
	// // iconTabBarForexAdmin.fireSelect({
	// oForex.setDataTable(oData.results);
	// sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oForex);
	// }, function(error) {
	// // error
	// sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oForex);
	// });
	// },
	getWorklist : function() {
		var icontab = this.getView().byId("idIconTabBarForexAdmin");
		var key = icontab.getSelectedKey();
		// icontab.setSelectedKey(key);
		if (key == "NEW")
			icontab.fireSelect({
				selectedItem : this.getView().byId("tabNEW"),
				key : key
			});
		else if (key == "NGREE")
			icontab.fireSelect({
				selectedItem : this.getView().byId("tabNGREE"),
				key : key
			});
		else if (key == "ISSUE")
			icontab.fireSelect({
				selectedItem : this.getView().byId("tabISSUE"),
				key : key
			});
		else if (key == "CARD")
			icontab.fireSelect({
				selectedItem : this.getView().byId("tabCARD"),
				key : key
			});
		else if (key == "SBFT")
			icontab.fireSelect({
				selectedItem : this.getView().byId("tabSBFT"),
				key : key
			});
		else if (key == "FSURR")
			icontab.fireSelect({
				selectedItem : this.getView().byId("tabFSURR"),
				key : key
			});
		else if (key == "CANC")
			icontab.fireSelect({
				selectedItem : this.getView().byId("tabCANC"),
				key : key
			});
	},
	onRefresh : function(evt) {
		// sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oForex);
		oForex.getWorklist();
		// var content =
		// oForex.getView().byId("idIconTabBarForexAdmin").getItems()[6].getContent()[0];
		// oForex.getForexSurrTable(content);
	},
	// detail screen logic
	onRouteMatchedDetail : function(event) {
		if ((event.getParameter("name") == "forex"&&this.getView().sViewName==event.getParameter("view").sViewName) || 
		   (event.getParameter("name") == "modifyclose"&&this.getView().sViewName==event.getParameter("view").sViewName)) {
			uploadFile = [];
			oForex = event.getParameter("view").getController();
			sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oForex);
			// set selected list item to model - general details
			var selected = new sap.ui.model.json.JSONModel();
			selctedItem = sap.ui.getCore().getModel("forexitem").getData();
			selected.setData(selctedItem);
			oForex.getView().setModel(selected, "general");
			// object hdr title
			var forexHdr = oForex.getView().byId("forexHdr");
			forexHdr.setTitle("Travel Plan: " + selctedItem.TravelPlan);
			oForex.clearData();
			oForex.setFieldProperties(selctedItem.whichtab);
			oForex.setFixedAttachments(selctedItem);
			// Batch
			// get Currencies
			var getCurr = oDataModel.createBatchOperation("GetF4Help?Srch_help='F4_TCURC_ISOCD'&$format=json", "GET");
			var getCards = oDataModel.createBatchOperation("ForexCradSet?$filter=TravelPlan+eq+'" + selctedItem.TravelPlan + "'+and+EmpNo+eq+'" + selctedItem.EmpNo + "'+and+TravelType+eq+'" + selctedItem.TravelType + "'+and+Module+eq+'" + selctedItem.Module + "'+and+SeqNo+eq+" + selctedItem.SeqNo + "", "GET");
			var getCash = oDataModel.createBatchOperation("ForexCashSet?$filter=TravelPlan+eq+'" + selctedItem.TravelPlan + "'+and+EmpNo+eq+'" + selctedItem.EmpNo + "'+and+TravelType+eq+'" + selctedItem.TravelType + "'+and+Module+eq+'" + selctedItem.Module + "'", "GET");
			var getPassport = oDataModel.createBatchOperation("ForexPassportSet(TravelPlan='" + selctedItem.TravelPlan + "',TravelType='" + selctedItem.TravelType + "',EmpNo='" + selctedItem.EmpNo + "',Module='" + selctedItem.Module + "',MonthlyRem='" + selctedItem.MonthlyRem + "',SeqNo=" + selctedItem.SeqNo + ")", "GET");
			if (selctedItem.TravelType == "DEPU" || selctedItem.TravelType == "HOME") {
				var getAttachments = oDataModel.createBatchOperation("DmsDocsSet?$filter=DepReq+eq+'" + selctedItem.DepuReq + "'+and+EmpNo+eq+'" + selctedItem.EmpNo + "'+and+Module+eq+'FOREX'" + "+and+Country+eq+'" + selctedItem.ToCountry + "'", "GET");
			} else {
				var getAttachments = oDataModel.createBatchOperation("DmsDocsSet?$filter=DepReq+eq+'" + selctedItem.TravelPlan + "'+and+EmpNo+eq+'" + selctedItem.EmpNo + "'+and+Module+eq+'FOREX'" + "+and+Country+eq+'" + selctedItem.ToCountry + "'", "GET");
			}
			var getAttachments1 = oDataModel.createBatchOperation("DmsDocsSet?$filter=DepReq+eq+'" + selctedItem.TravelPlan + "'+and+EmpNo+eq+'" + selctedItem.EmpNo + "'+and+DocType+eq+'FEX'", "GET");
			var getComments = oDataModel.createBatchOperation("CardReloadComSet?$filter=Pernr+eq+'" + selctedItem.EmpNo + "'+and+Reinr+eq+'" + selctedItem.TravelPlan + "'+and+Trvky+eq+'" + selctedItem.TravelType + "'+and+Modid+eq+'" + selctedItem.Module + "'", "GET");
			var getF4 = oDataModel.createBatchOperation("GetF4Table?TableName='ZE2E_FOREX_MAS'&Col1='CONST'&Col2='SELPAR'&Col3='VALUE'&Col4=''&Col5=''&Col6=''&Col7=''&Col8=''&Col9=''&Col10=''&$format=json", "GET");
			var getCardsAll = oDataModel.createBatchOperation("ForexCardsAllSet?$filter=EmpNo+eq+'" + selctedItem.EmpNo + "'", "GET");
			var getTckAttachments = oDataModel.createBatchOperation("DmsDocsSet?$filter=DepReq+eq+'" + selctedItem.TravelPlan + "'+and+EmpNo+eq+'" + selctedItem.EmpNo + "'+and+DocType+eq+'TCK'", "GET");
			if (selctedItem.whichtab == "FSURR") {
				var getCardSur = oDataModel.createBatchOperation("ForexCradSet?$filter=TravelPlan+eq+'" + selctedItem.TravelPlan + "'+and+EmpNo+eq+'" + selctedItem.EmpNo + "'+and+TravelType+eq+'" + selctedItem.TravelType + "'+and+Module+eq+'TRST'+and+SeqNo+eq+" + selctedItem.SeqNo + "", "GET");
				var getCashSur = oDataModel.createBatchOperation("ForexCashSet?$filter=TravelPlan+eq+'" + selctedItem.TravelPlan + "'+and+EmpNo+eq+'" + selctedItem.EmpNo + "'+and+TravelType+eq+'" + selctedItem.TravelType + "'+and+Module+eq+'TRST'", "GET");
				var getInrSur = oDataModel.createBatchOperation("ForexInrSet?$filter=TravelPlan+eq+'" + selctedItem.TravelPlan + "'+and+EmpNo+eq+'" + selctedItem.EmpNo + "'+and+TravelType+eq+'" + selctedItem.TravelType + "'+and+SeqNo+eq+" + selctedItem.SeqNo + "", "GET");
				var getTotal = oDataModel.createBatchOperation("TrvStTotalSet?$filter=EmpNo+eq+'" + selctedItem.EmpNo + "'+and+TravelPlan+eq+'" + selctedItem.TravelPlan + "'+and+TravelType+eq+'" + selctedItem.TravelType + "'+and+LoginRole+eq+'FEX'", "GET");
				var getTrstComments = oDataModel.createBatchOperation("CardReloadComSet?$filter=Pernr+eq+'" + selctedItem.EmpNo + "'+and+Reinr+eq+'" + selctedItem.TravelPlan + "'+and+Trvky+eq+'" + selctedItem.TravelType + "'+and+Modid+eq+'TRST'", "GET");
				oDataModel.addBatchReadOperations([ getCurr, getCards, getCash, getPassport, getAttachments, getAttachments1, getComments, getF4, getCardsAll, getCardSur, getCashSur, getInrSur, getTotal, getTrstComments, getTckAttachments ]);
			} else {
				oDataModel.addBatchReadOperations([ getCurr, getCards, getCash, getPassport, getAttachments, getAttachments1, getComments, getF4, getCardsAll, getTckAttachments ]);
			}
			oDataModel.submitBatch(function(oResult) {
				try {
					var curModel = new sap.ui.model.json.JSONModel();
					curModel.setSizeLimit(oResult.__batchResponses[0].data.results.length);
					curModel.setData(oResult.__batchResponses[0].data.results);
					oForex.getView().setModel(curModel, "curModel");
					// Table Data
					oForex.setCardCashdata(oResult.__batchResponses[1].data.results, oResult.__batchResponses[2].data.results);
					// Passport
					var pmodel = new sap.ui.model.json.JSONModel();
					pmodel.setData(oResult.__batchResponses[3].data);
					oForex.getView().setModel(pmodel, "passport");
					oForex.setObjectAttributes(oResult.__batchResponses[3].data);
					// Comments
					var commentsList = oForex.getView().byId(sap.ui.core.Fragment.createId("AppoveInfo", "idListApprove"));
					var commentModel = new sap.ui.model.json.JSONModel();
					commentModel.setData(oResult.__batchResponses[6].data.results);
					commentsList.bindItems("/", new sap.m.FeedListItem({
						text : "{Comnt}",
						sender : "{Dname}",
						timestamp : "Date: " + "{path:'Erdat',formatter: 'sap.ui.project.e2etm.util.Formatter.formatTicketCommentsDate'}",
					}));
					commentsList.setModel(commentModel);
					// // Attachments
					// filesAll =
					// $.merge(oResult.__batchResponses[4].data.results,
					// oResult.__batchResponses[5].data.results);
					// var uploadModel = oForex.getView().getModel("new");
					//
					// uploadModel.setData({
					// Files : filesAll
					// });
					oForex.setF4Help(oResult.__batchResponses[7].data.results);
					var model = new sap.ui.model.json.JSONModel();
					model.setData({
						cardsAll : oResult.__batchResponses[8].data.results
					});
					oForex.getView().setModel(model, "forexmodel");
					// GetCards All
					if (selctedItem.whichtab == "FSURR") {
						oForex.setForexSurrender(oResult.__batchResponses[8].data.results, oResult.__batchResponses[9].data.results, oResult.__batchResponses[10].data.results, oResult.__batchResponses[11].data.results, oResult.__batchResponses[12].data.results);
						var trstcomments = $.merge(oResult.__batchResponses[13].data.results, oResult.__batchResponses[6].data.results);
						commentModel.setData(trstcomments);
						commentsList.setModel(commentModel);
						// Attachments
						filesAll = filesAll.concat(oResult.__batchResponses[4].data.results, oResult.__batchResponses[5].data.results, oResult.__batchResponses[14].data.results);
						var uploadModel = oForex.getView().getModel("new");
						uploadModel.setData({
							Files : filesAll
						});
					} else {
						// Attachments
						filesAll = filesAll.concat(oResult.__batchResponses[4].data.results, oResult.__batchResponses[5].data.results, oResult.__batchResponses[9].data.results);
						var uploadModel = oForex.getView().getModel("new");
						uploadModel.setData({
							Files : filesAll
						});
//						if(selctedItem.whichtab == "CHCLS"){
//							oForex.setCardTableProperties();
//							oForex.setCashTableProperties
//						}
					}
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oForex);
				} catch (err) {
					// oForex.clearData();
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oForex);
				}
			}, function(error) {
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oForex);
			}, true);
		}
	},
	setFixedAttachments : function(selctedItem) {
		var fileUrl;
		var result;
		var fixedAttach = [];
		if (window.location.hostname == "localhost")
			fileUrl = "proxy/sap/opu/odata/sap/ZE2E_DEP_NWGS_SRV/TravelPdfSet(EmpNo='" + selctedItem.EmpNo + "',TrNo='" + selctedItem.TravelPlan + "',TrvKey='" + selctedItem.TravelType + "',Module='REQ')/$value";
		else
			fileUrl = "/sap/opu/odata/sap/ZE2E_DEP_NWGS_SRV/TravelPdfSet(EmpNo='" + selctedItem.EmpNo + "',TrNo='" + selctedItem.TravelPlan + "',TrvKey='" + selctedItem.TravelType + "',Module='REQ')/$value";
		fixedAttach.push({
			FileName : "TravelPlan.pdf",
			FileUrl : fileUrl,
		});
		// oForex.getDocumentList(oForex,selctedItem.TravelPlan,
		// selctedItem.EmpNo,'FEX','FREX',selctedItem.ToCountry,fixedAttach[0]);
		var model = new sap.ui.model.json.JSONModel();
		model.setData(fixedAttach);
		oForex.getView().setModel(model, "fixedAttachments");
		oForex.getVisaCopies(selctedItem, fixedAttach[0]);
		// var model = new sap.ui.model.json.JSONModel();
		// model.setData(fixedAttach);
		// oForex.getView().setModel(model, "fixedAttachments");
	},
	getVisaCopies : function(selctedItem, fixedAttach) {
		var fileList = [];
		var tpno = "00" + selctedItem.TravelPlan;
		oDataModel.read("DmsDocsSet?$filter=DepReq eq '" + tpno + "' and EmpNo eq '" + selctedItem.EmpNo + "'", null, null, true, function(oData, response) {
			// fileList.push(fixedAttach);
			fileList = oForex.getView().getModel("fixedAttachments").getData();
			for ( var i = 0; i < oData.results.length; i++) {
				if (oData.results[i].FileName.indexOf("CL_VISA_COPY_SELF") != -1) {
					fileList.push(oData.results[i]);
				}
				if (oData.results[i].FileName.indexOf("Passport copies") != -1) {
					fileList.push(oData.results[i]);
				}
			}
			oForex.getView().getModel("fixedAttachments").setData(fileList);
			oForex.getBusinessTravelVisa(selctedItem);
		}, function(error) {
		});
	},
	getBusinessTravelVisa : function(selctedItem) {
		var fileList = [];
		if (selctedItem.TravelType == "BUSR") {
			var tpno = "00" + selctedItem.TravelPlan;
			oDataModel.read("DmsDocsSet?$filter=DepReq eq '" + tpno + "' and EmpNo eq '" + selctedItem.EmpNo + "' and DocType eq 'VIS'", null, null, true, function(oData, response) {
				fileList = oForex.getView().getModel("fixedAttachments").getData();
				for ( var i = 0; i < oData.results.length; i++) {
					fileList.push(oData.results[i]);
				}
				oForex.getView().getModel("fixedAttachments").setData(fileList);
			}, function(error) {
			});
		}
	},
	getDocumentList : function(oController, sRequest, sEmployee, sDocType, sModule, sCountry, fixedAttach) {
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
		var fileList = [];
		var oBatch0 = oComponent.getModel().createBatchOperation(s1stUrl, "GET");
		var oBatch1 = oComponent.getModel().createBatchOperation(s2ndUrl, "GET");
		oComponent.getModel().addBatchReadOperations([ oBatch0, oBatch1 ]);
		oComponent.getModel().submitBatch(function(oResult) {
			var aData = {};
			aData.Files = [];
			aData.Files.push(fixedAttach);
			if (Array.isArray(oResult.__batchResponses[0].data)) {
				fileList = $.extend(oResult.__batchResponses[0].data.results, oResult.__batchResponses[1].data.results);
				// aData.Files = $.extend(fixedAttach,
				// oResult.__batchResponses[0].data.results,
				// oResult.__batchResponses[1].data.results);
			} else {
				fileList = oResult.__batchResponses[1].data.results;
				// aData.Files =
				// $.extend(oResult.__batchResponses[1].data.results);
			}
			for ( var i = 0; i < fileList.length; i++) {
				if ((fileList[i].FileName.indexOf("Passport")) != -1) {
					aData.Files.push(fileList[i]);
				}
				if ((fileList[i].FileName.indexOf("Visa copies")) != -1) {
					aData.Files.push(fileList[i]);
				}
			}
			var model = new sap.ui.model.json.JSONModel();
			model.setData(aData.Files);
			oForex.getView().setModel(model, "fixedAttachments");
		}, function(error) {
			alert("No data found");
		});
	},
	setForexSurrender : function(cardsAll, cardSur, cashSur, inrdata, amount) {
		var data = oForex.getView().getModel("forexsurrender").getData();
		data.cardsAll = cardsAll;
		// if (cardSur.length == 0) {
		// data.cardtable.push({});
		// } else {
		// data.cardtable = cardSur;
		// }
		// if (cashSur.length == 0) {
		// data.cashtable.push({});
		// } else {
		// data.cashtable = cashSur;
		// }
		// if (inrdata.length == 0) {
		// data.inrtable.push({});
		// } else {
		// data.inrtable = inrdata;
		// }
		// if(amount.length==0){
		// data.amount.push({});
		// }else{
		// data.amount = amount;
		// }
		data.cardtable = cardSur;
		data.amount = amount;
		data.inrtable = inrdata;
		data.cashtable = cashSur;
		data.subtotal = oForex.calculateSubTotal(data.subtotal, amount);
		oForex.getView().byId("forexsurrcard").setVisibleRowCount(data.cardtable.length);
		oForex.getView().byId("forexsurrcash").setVisibleRowCount(data.cashtable.length);
		oForex.getView().byId("forexsurrinr").setVisibleRowCount(data.inrtable.length);
		// oForex.getView().byId("forexsurramount").setVisibleRowCount(data.amount.length);
		oForex.getView().byId("forexsurramount").getParent().setVisible(true);
		oForex.getView().getModel("forexsurrender").setData(data);
		oForex.getView().getModel("forexsurrender").refresh(true);
	},
	calculateSubTotal : function(subtotal, amount) {
		var currencyList = [];
		var totalamt = 0;
		for ( var i = 0; i < amount.length; i++) {
			if (currencyList.indexOf(amount[i].TotalCurrency) == -1) {
				currencyList.push(amount[i].TotalCurrency);
			}
		}
		for ( var i = 0; i < currencyList.length; i++) {
			for ( var j = 0; j < amount.length; j++) {
				if (amount[j].TotalCurrency == currencyList[i]) {
					totalamt = totalamt + parseFloat(amount[j].Total);
				}
			}
			subtotal.push({
				Amount : totalamt,
				Currency : currencyList[i]
			});
			totalamt = 0;
		}
		return subtotal;
	},
	onCardsAllChange : function(evt) {
		var table = evt.oSource.getParent().getParent();
		var currency = evt.oSource.getValue();
		var data = oForex.getView().getModel("forexmodel").getData();
		var surrenderdata = oForex.getView().getModel("forexsurrender").getData();
		var index = table.indexOfRow(evt.oSource.getParent());
		var selectedCard;
		for ( var i = 0; i < data.cardsAll.length; i++) {
			if (data.cardsAll[i].Currency == currency) {
				selectedCard = data.cardsAll[i];
				break;
			}
		}
		if (selectedCard) {
			surrenderdata.cardtable[index].IssuerBank = selectedCard.IssuedBanker;
			surrenderdata.cardtable[index].CardNo = selectedCard.CardNo;
			surrenderdata.cardtable[index].CardValidity = selectedCard.CardValidUpto;
			oForex.getView().getModel("forexsurrender").setData(surrenderdata);
		} else {
			surrenderdata.cardtable[index].IssuerBank = "";
			surrenderdata.cardtable[index].CardNo = "";
			surrenderdata.cardtable[index].CardValidity = "";
			oForex.getView().getModel("forexsurrender").setData(surrenderdata);
		}
	},
	setF4Help : function(results) {
		var bank = [];
		var ptype = [];
		var vendor = [];
		var bankmodel = new sap.ui.model.json.JSONModel();
		var ptymodel = new sap.ui.model.json.JSONModel();
		var vendormodel = new sap.ui.model.json.JSONModel();
		for ( var i = 0; i < results.length; i++) {
			if (results[i].FIELD1 == "BANK") {
				bank.push(results[i]);
			} else if (results[i].FIELD1 == "PAYMENTTYPE") {
				ptype.unshift(results[i]);
			} else if (results[i].FIELD1 == "VENDOR") {
				vendor.push(results[i]);
			}
		}
		bankmodel.setData(bank);
		vendormodel.setData(vendor);
		ptymodel.setData(ptype);
		oForex.getView().setModel(bankmodel, "Bank");
		oForex.getView().setModel(vendormodel, "Vendor");
		oForex.getView().setModel(ptymodel, "Payment");
	},
	setObjectAttributes : function(data) {
		var advance = data.Advance.split(";");
		oForex.getView().byId("amount1").setText(advance[0]);
		oForex.getView().byId("amount2").setText(advance[1]);
		oForex.getView().byId("amount3").setText(advance[2]);
	},
	onSelectCardChange : function(evt) {
		var key = evt.oSource.getSelectedKey();
		var cells = evt.getSource().getParent().getCells();
		var carddata = oForex.getView().byId("cardtable").getModel().getData();
		var table = oForex.getView().byId("cardtable");
		var index = table.indexOfRow(evt.getSource().getParent());
		if (key == "INR") {
			carddata[index].ExchangeRate = "";
			carddata[index].Tax = 0;
			// cells[6].setEditable(true);
		} else {
			carddata[index].ExchangeRate = 1;
			carddata[index].Tax = 0;
			// cells[6].setEditable(false);
		}
		table.getModel().setData(carddata);
		table.getModel().refresh(true);
		oForex.onCalculate(evt);
	},
	onSelectCashChange : function(evt) {
		var key = evt.oSource.getSelectedKey();
		var cells = evt.getSource().getParent().getCells();
		var cashdata = oForex.getView().byId("cashtable").getModel().getData();
		var table = oForex.getView().byId("cashtable");
		var index = table.indexOfRow(evt.getSource().getParent());
		if (key == "INR") {
			cashdata[index].ExchangeRate = 0;
			cashdata[index].Tax = 0;
			// cells[3].setEditable(true);
		} else {
			cashdata[index].ExchangeRate = 1;
			cashdata[index].Tax = 0;
			// cells[3].setEditable(false);
		}
		table.getModel().setData(cashdata);
		oForex.onCashExchange(evt);
	},
	setFieldProperties : function(key) {
		var role = sap.ui.getCore().getModel("profile").getData().currentRole;
		var properties = {
			pvisible : false,
		// savvisible : false
		};
		var model = new sap.ui.model.json.JSONModel();
		oForex.getView().byId("comments").setEditable(true);
		oForex.getView().byId("cardtable").getColumns()[6].getTemplate().setEditable(false);
		oForex.getView().byId("cashtable").getColumns()[3].getTemplate().setEditable(false);
		oForex.getView().byId("cardtable").getParent().setCollapsed(false);
		oForex.getView().byId("cashtable").getParent().setCollapsed(false);
		oForex.getView().byId("btnDelimitCard").setVisible(false);
		oForex.getView().byId("btnAddNewCard").setVisible(false);
		oForex.getView().byId("btnEdit").setVisible(false);
		oForex.getView().byId("btnTrstPdf").setVisible(false);
		
		
		if (key == "FSURR") {
			var surrenderModel = new sap.ui.model.json.JSONModel();
			var data = {};
			data.cardtable = [];
			data.cashtable = [];
			data.inrtable = [];
			data.cardsAll = [];
			data.amount = [];
			data.subtotal = [];
			surrenderModel.setData(data);
			oForex.getView().setModel(surrenderModel, "forexsurrender");
			oForex.getView().byId("cardtable").getParent().setCollapsed(true);
			oForex.getView().byId("cashtable").getParent().setCollapsed(true);
			oForex.getView().byId("btnTrstPdf").setVisible(true);
			var item = sap.ui.getCore().getModel("forexitem").getData();
			if (item.subkey == "NEW" || item.subkey == "" || item.subkey == "SEBT") {
				properties = {
					editable : false,
					benabled : false,
					ineditable : false,
					enabled : false,
					peditable : false,
					ibvisible : false,
					cbvisible : false,
					abvisible : false,
					sbvisible : true,
					pxeditable : false,
					surbvisible : true,
					delbvisible : false,
					sureditable : true,
					surineditable : true,
					cashpnlvisible : true,
					valueeditable : false
				// Amount,Payment Type
				};
			} else if (item.subkey == "PSUR") {// Partial Surrender
				properties = {
					editable : false,
					benabled : false,
					ineditable : false,
					enabled : false,
					peditable : false,
					ibvisible : false,
					cbvisible : true,
					surbvisible : false,
					abvisible : false,
					sbvisible : false,
					delbvisible : false,
					pxeditable : false,
					sureditable : false,
					surineditable : true,
					cashpnlvisible : true,
					valueeditable : false
				// Amount,Payment Type
				};
			} else if (item.subkey == "SUR") {
				properties = {
					editable : false,
					benabled : false,
					ineditable : false,
					enabled : false,
					peditable : false,
					ibvisible : false,
					cbvisible : true,
					abvisible : false,
					sbvisible : false,
					pxeditable : false,
					delbvisible : false,
					surbvisible : false,
					sureditable : false,
					surineditable : true,
					cashpnlvisible : true,
					valueeditable : false
				// Amount,Payment Type
				};
			} else if (item.subkey == "SEBT") {
				properties = {
					editable : false,
					benabled : false,
					ineditable : false,
					enabled : false,
					peditable : false,
					ibvisible : false,
					cbvisible : false,
					abvisible : false,
					sbvisible : false,
					pxeditable : false,
					delbvisible : true,
					surbvisible : false,
					sureditable : false,
					surineditable : true,
					cashpnlvisible : true,
					valueeditable : false
				// Amount,Payment Type
				};
			} else if (item.subkey == "CLS") {
				properties = {
					editable : false,
					benabled : false,
					ineditable : false,
					enabled : false,
					peditable : false,
					ibvisible : false,
					cbvisible : false,
					abvisible : false,
					sbvisible : false,
					delbvisible : true,
					pxeditable : false,
					surbvisible : false,
					sureditable : false,
					surineditable : false,
					cashpnlvisible : true,
					valueeditable : false
				// Amount,Payment Type
				};
			}
		}
		if (role == "FEX") {
			if (key == "ISSUE") {
				properties = {
					savvisible : false,
					editable : false,
					benabled : false,
					ineditable : true,// Invoice no,invoice date
					peditable : false,// Tax
					enabled : false,
					ibvisible : false,
					cbvisible : true,
					abvisible : false,
					sbvisible : false,
					delbvisible : false,
					pxeditable : false,
					surbvisible : false,
					cashpnlvisible : true,
					valueeditable : false,
					ptypeeditable : false
				// Amount,Payment Type
				};
				oForex.getView().byId("btnEdit").setVisible(true);
			} else if (key == "CARD") {
				properties = {
					savvisible : false,
					editable : false,
					benabled : false,
					ineditable : true,
					peditable : true,
					enabled : false,
					ibvisible : true,
					cbvisible : false,
					surbvisible : false,
					abvisible : false,
					delbvisible : false,
					sbvisible : false,
					pxeditable : true,
					cashpnlvisible : false,
					valueeditable : false,
					ptypeeditable : true
				// Amount,Payment Type
				};
				oForex.getView().byId("btnDelimitCard").setVisible(true);
				oForex.getView().byId("btnAddNewCard").setVisible(true);
			} else if (key == "CLOSE") {
				properties = {
					savvisible : false,
					editable : false,
					benabled : false,
					ineditable : false,
					enabled : false,
					peditable : false,
					ibvisible : false,
					cbvisible : false,
					abvisible : false,
					delbvisible : false,
					sbvisible : false,
					surbvisible : false,
					pxeditable : false,
					cashpnlvisible : true,
					valueeditable : false,
					ptypeeditable : false
				// Amount,Payment Type
				};
				oForex.getView().byId("comments").setEditable(false);
			} else if (key == "NEW" || key == "NGREE") {
				properties = {
					savvisible : false,
					editable : true,
					benabled : true,
					ineditable : true,
					peditable : true,
					enabled : true,
					ibvisible : true,
					cbvisible : false,
					abvisible : false,
					delbvisible : true,
					sbvisible : false,
					surbvisible : false,
					pxeditable : true,
					cashpnlvisible : true,
					valueeditable : true,
					ptypeeditable : true
				// Amount,Payment Type
				};
				oForex.getView().byId("cardtable").getColumns()[6].getTemplate().setEditable(true);
				oForex.getView().byId("cashtable").getColumns()[3].getTemplate().setEditable(true);// Exchange
				// Rate
				if (sap.ui.getCore().byId("txtDialogComments")) {
					var txtComments = sap.ui.getCore().byId("txtDialogComments").getValue();
					oForex.getView().byId("comments").setValue(txtComments);
				}
			} else if (key == "SBFT") {
				properties = {
					editable : true,
					benabled : true,
					ineditable : true,
					peditable : true,
					enabled : true,
					ibvisible : false,
					cbvisible : true,
					abvisible : false,
					sbvisible : false,
					surbvisible : false,
					delbvisible : false,
					pxeditable : true,
					cashpnlvisible : true,
					valueeditable : true,
					ptypeeditable : true,
					// Amount,Payment Type,
					savvisible : false,
				};
			}
		} else {// role=FINA
			if (key == "FOREX" || key == "CARD") {
				properties = {
					editable : true,
					benabled : true,
					peditable : false,
					ineditable : true,
					enabled : true,
					ibvisible : false,
					cbvisible : false,
					surbvisible : false,
					delbvisible : false,
					abvisible : true,
					sbvisible : true,
					pxeditable : true,
					valueeditable : true,
					ptypeeditable : true
				// Amount,Payment Type
				};
				oForex.getView().byId("cardtable").getColumns()[6].getTemplate().setEditable(true);
				oForex.getView().byId("cashtable").getColumns()[3].getTemplate().setEditable(true);// Exchange
				// Rate
			} else if (key == "APPROVE") {
				if (role == "FINA") {
					properties = oForex.setFinanceProperties();
				} else {
					properties = {
						editable : false,
						benabled : false,
						peditable : false,
						ineditable : false,
						enabled : false,
						ibvisible : false,
						surbvisible : false,
						delbvisible : false,
						cbvisible : false,
						abvisible : false,
						sbvisible : false,
						pxeditable : false,
						valueeditable : false,
						ptypeeditable : false
					// Amount,Payment Type
					};
					oForex.getView().byId("comments").setEditable(false);
				}
			} else if (key == "REJECT" || key == "CLOSE") {
				properties = {
					editable : false,
					benabled : false,
					peditable : false,
					ineditable : false,
					surbvisible : false,
					delbvisible : false,
					enabled : false,
					ibvisible : false,
					cbvisible : false,
					abvisible : false,
					sbvisible : false,
					pxeditable : false,
					valueeditable : false,
					ptypeeditable : false
				// Amount,Payment Type
				};
				oForex.getView().byId("comments").setEditable(false);
			} else if (key == "CHCLS") {
				// properties = {
				// editable : false,
				// benabled:true,
				// ineditable : false,
				// peditable : false,
				// enabled : false,
				// ibvisible : false,
				// cbvisible : false,
				// abvisible : false,
				// sbvisible : false,
				// savvisible : true,
				// surbvisible : false,
				// delbvisible : false,
				// pxeditable : false,
				// cashpnlvisible : true,
				// valueeditable : false,
				// ptypeeditable : false
				// // Amount,Payment Type
				// };
			}
		}
		/* Setting pcurrency,pexchangerate,ptotal visible in card and cash table */
		var item = sap.ui.getCore().getModel("forexitem").getData();
		if (item.Module == "FREX" && item.VisaCode == "3") {
			properties.pvisible = true;
			properties.msgvisible = true;
		} else if (item.Module == "CARD") {
			properties.pvisible = false;
			properties.msgvisible = false;
		} else {
			properties.pvisible = false;
			properties.msgvisible = false;
		}
		if (key == "FSURR") {
			properties.msgvisible = false;
		}
		/* Setting pcurrency,pexchangerate,ptotal visible in card and cash table */
		properties.enabled = true;
		model.setData(properties);
		oForex.getView().setModel(model, "fieldproperties");
	},
	onDownloadTrstPdf : function() {
		var fileUrl;
		var data = oForex.getView().getModel("general").getData();
		var travelplan = data.TravelPlan;
		var pernr = data.EmpNo;
		var traveltype = data.TravelType;
		var version = data.Version;
		var item = 1;
		if (window.location.hostname == "localhost")
			fileUrl = "proxy/sap/opu/odata/sap/ZE2E_DEP_NWGS_SRV/TrstPdfSet(EmpNo='" + pernr + "',TrNo='" + travelplan + "',TrvKey='" + traveltype + "',Module='TRST',Version='" + version + "',Item='" + item + "')/$value";
		else
			fileUrl = "/sap/opu/odata/sap/ZE2E_DEP_NWGS_SRV/TrstPdfSet(EmpNo='" + pernr + "',TrNo='" + travelplan + "',TrvKey='" + traveltype + "',Module='TRST',Version='" + version + "',Item='" + item + "')/$value";
		
		sap.m.URLHelper.redirect(fileUrl, true);
	},
	onEditCard:function(){
		var properties = oForex.getView().getModel("fieldproperties").getData();
		properties = {
				savvisible : false,
				editable : true,
				benabled : false,
				ineditable : true,// Invoice no,invoice date
				peditable : true,// Tax
				enabled : true,
				ibvisible : false,
				cbvisible : true,
				abvisible : false,
				sbvisible : false,
				delbvisible : false,
				pxeditable : false,
				surbvisible : false,
				cashpnlvisible : true,
				valueeditable : true,
				ptypeeditable : true
			// Amount,Payment Type
			};
		oForex.getView().getModel("fieldproperties").setData(properties);
	},
	setFinanceProperties : function() {
		var data = sap.ui.getCore().getModel("forexitem").getData();
		var properties;
		switch (data.Module) {
		case "FREX":
			properties = {
				editable : false,
				benabled : false,
				ineditable : false,
				peditable : false,
				enabled : false,
				ibvisible : false,
				cbvisible : false,
				abvisible : false,
				sbvisible : false,
				surbvisible : false,
				delbvisible : false,
				valueeditable : false,
				ptypeeditable : false
			};
			oForex.getView().byId("comments").setEditable(false);
			break;
		case "CARD":
			properties = {
				editable : false,
				benabled : false,
				ineditable : false,
				peditable : false,
				enabled : false,
				ibvisible : false,
				cbvisible : false,
				abvisible : false,
				sbvisible : false,
				surbvisible : false,
				delbvisible : false,
				valueeditable : false,
				ptypeeditable : false
			};
			oForex.getView().byId("comments").setEditable(false);
			break;
		case "":
			properties = {
				editable : false,
				benabled : false,
				peditable : false,
				ineditable : false,
				enabled : false,
				ibvisible : false,
				cbvisible : false,
				abvisible : false,
				sbvisible : false,
				surbvisible : false,
				delbvisible : false,
				valueeditable : false,
				ptypeeditable : false
			};
			oForex.getView().byId("comments").setEditable(false);
			break;
		}
		return properties;
	},
	clearData : function() {
		oForex.getView().byId("comments").setValue("");
		filesAll = [];
		oForex.getView().byId("UploadCollection").aItems = [];
	},
	setCardCashdata : function(carddata, cashdata) {
		var cardDetails = new sap.ui.model.json.JSONModel();
		var cashDetails = new sap.ui.model.json.JSONModel();
		// var cash = [ {
		// cash : ""
		// } ];
		cardDetails.setData(carddata);
		cashDetails.setData(cashdata);
		oForex.getView().byId("cardtable").setModel(cardDetails);
		oForex.getView().byId("cardtable").setVisibleRowCount(carddata.length);
		oForex.getView().byId("cashtable").setModel(cashDetails);
		oForex.getView().byId("cashtable").setVisibleRowCount(cashdata.length);
		var tabKey = sap.ui.getCore().getModel("forexitem").getData().whichtab;
		if (tabKey == "CHCLS") {
			this["fixedCardRows"] = carddata ? carddata.slice() : [];
			this["fixedCashRows"] = cashdata ? cashdata.slice() : [];
		}
	},
	getCurrentDate : function() {
		var date = new Date();
		// changing the Date to yyyyMMdd
		var yyyy = date.getFullYear().toString();
		var mm = (date.getMonth() + 1).toString();
		mm = ("0" + mm).slice(-2);
		var dd = date.getDate().toString();
		// var date = yyyy + mm + dd;
		return date;
	},
	onItemPress : function(evt) {
		if (evt.getParameter("listItem").getAggregation("cells")) {
			var items = evt.oSource.getBinding("items");
			var listIndex = evt.oSource.indexOfItem(evt.getParameter("listItem"));
			var index = items.aIndices[listIndex];
			selctedItem = evt.oSource.getBinding("items").oList[index];
			selctedItem.whichtab = oForex.getView().byId("idIconTabBarForexAdmin").getSelectedKey();
			var key = selctedItem.whichtab;
			if (key == "NEW" || key == "NGREE") {
				var model = new sap.ui.model.json.JSONModel();
				model.setData(selctedItem);
				sap.ui.getCore().setModel(model, "forexitem");
				var sdate = selctedItem.StartDate;
				var year = sdate.substring(0, 4);
				var month = sdate.substring(4, 6);
				var date = sdate.substring(6, 8);
				// var newdate1 = new Date("2015", "09", "01");
				var subdate = new Date(year, month - 1, date);
				// var daysBetween = oForex.daysBetween(date1) ;
				subdate.setDate(subdate.getDate() - selctedItem.LimitDate);
				var currentDate = oForex.getCurrentDate();
				if (currentDate < subdate) {
					if (!(sap.ui.getCore().byId("dialogAdmin"))) {
						var dialog = new sap.m.Dialog("dialogAdmin", {
							title : "Confirm",
							afterClose : oForex.afterClosePress,
							beforOpen : oForex.beforeOpenPress,
							content : [ new sap.m.FlexBox({
								direction : "Column",
								justifyContent : "SpaceBetween",
								alignItems : "Center",
								items : [ new sap.m.Text({
									text : "Update the Reason for collection forex before 3 days"
								}), new sap.m.TextArea("txtDialogComments", {
									placeholder : "Comments",
									rows : 5,
									cols : 40
								}) ]
							}) ],
							buttons : [ new sap.m.Button({
								text : "Confirm",
								press : oForex.onConfirmPress
							}), new sap.m.Button({
								text : "Cancel",
								press : oForex.onCancelPress
							}) ]
						});
						dialog.open();
					} else {
						var dialog = sap.ui.getCore().byId("dialogAdmin");
						sap.ui.getCore().byId("txtDialogComments").setValue("");
						dialog.open();
					}
				} else {
					var model = new sap.ui.model.json.JSONModel();
					model.setData(selctedItem);
					sap.ui.getCore().setModel(model, "forexitem");
					sap.ui.core.routing.Router.getRouter("MyRouter").navTo("forex");
				}
			} else if (key == "FSURR") {
				var subkey = evt.oSource.getParent().getKey();
				selctedItem.subkey = subkey;
				var model = new sap.ui.model.json.JSONModel();
				model.setData(selctedItem);
				sap.ui.getCore().setModel(model, "forexitem");
				sap.ui.core.routing.Router.getRouter("MyRouter").navTo("forex");
			} else if(key!="CANC") {
				var model = new sap.ui.model.json.JSONModel();
				model.setData(selctedItem);
				sap.ui.getCore().setModel(model, "forexitem");
				sap.ui.core.routing.Router.getRouter("MyRouter").navTo("forex");
			}
		}
	},
	onConfirmPress : function(evt) {
		var txtComments = sap.ui.getCore().byId("txtDialogComments").getValue();
		if (txtComments == "") {
			sap.m.MessageToast.show("Please enter Comments and then proceed")
		} else {
			sap.ui.core.routing.Router.getRouter("MyRouter").navTo("forex");
		}
	},
	onCancelPress : function(evt) {
		evt.oSource.getParent().close();
	},
	afterClosePress : function(evt) {
		var txtDialogComments = sap.ui.getCore().byId("txtDialogComments");
		txtDialogComments.setValue("");
		// evt.oSource.getParent().destroy();
	},
	beforeOpenPress : function() {
		var txtDialogComments = sap.ui.getCore().byId("txtDialogComments");
		txtDialogComments.setValue("");
	},
	daysBetween : function(date1) {
		var one_day = 1000 * 60 * 60 * 24;
		// Convert both dates to milliseconds
		var date1_ms = date1.getTime();
		// Calculate the difference in milliseconds
		var difference_ms = date1_ms - 3;
		// Convert back to days and return
		// return Math.round(difference_ms/one_day);
	},
	// Back button action
	onBack : function() {
		// sap.ca.ui.dialog.confirmation.open({
		// question : "Unsaved data will be lost.Are you sure you want to
		// exit?",
		// showNote : false,
		// title : "Confirm",
		// confirmButtonLabel : "Yes"
		// }, function(oResult) {
		// if (oResult.isConfirmed) {
		// window.history.go(-1);
		// }
		// });
		sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
	},
	// add row to card table
	onAddCash : function(evt) {
		var tableData;
		var date = new Date();
		// changing the Date to yyyyMMdd
		var data = oForex.getView().getModel("general").getData();
		var yyyy = date.getFullYear().toString();
		var mm = (date.getMonth() + 1).toString();
		mm = ("0" + mm).slice(-2);
		var dd = ("0" + date.getDate()).slice(-2);
		var date = yyyy + mm + dd;
		if (oForex.getView().byId("cashtable").getModel().getData()) {
			tableData = oForex.getView().byId("cashtable").getModel().getData();
			tableData.push({
				Pcurrency : data.Pcurrency,
				Invoicedate : date
			});
		} else {
			tableData = [];
			tableData.push({
				Invoicedate : date,
				Pcurrency : data.Pcurrency,
			// Cash:''
			});
		}
		if (data.whichtab == 'CHCLS') {// Modify close
			if (tableData.length > 1)
				$.extend(tableData[tableData.length - 1], tableData[tableData.length - 2]);
			tableData[tableData.length - 1].Pcurrency = "";
		}
		oForex.getView().byId("cashtable").setVisibleRowCount(tableData.length);
		oForex.getView().byId("cashtable").getModel().setData(tableData);
	},
	onDelCash : function(evt) {
		var tabKey = sap.ui.getCore().getModel("forexitem").getData().whichtab;
		var index = oForex.getView().byId("cashtable").getSelectedIndices();
		if (tabKey == "CHCLS") {
			for ( var i = index.length - 1; i >= 0; i--) {
				if (index[i] < this["fixedCashRows"].length) {
					index.splice(i, 1);
					if (index.length == 0) {
						sap.m.MessageToast.show("Deletion not possible");
						return "";
					}
				}
			}
		}
		var tableData = oForex.getView().byId("cashtable").getModel().getData();
		if (index.length == 0) {
			sap.m.MessageToast.show("Please select atleast one row");
		} else {
			for ( var i = index.length - 1; i >= 0; i--) {
				tableData.splice(index[i], 1);
			}
			oForex.getView().byId("cashtable").setVisibleRowCount(tableData.length);
			oForex.getView().byId("cashtable").getModel().setData(tableData);
		}
		// evt.oSource.removeItem(item);
	},
	onAddCard : function() {
		var tableData = oForex.getView().byId("cardtable").getModel().getData();
		var date = new Date();
		// changing the Date to yyyyMMdd
		var yyyy = date.getFullYear().toString();
		var data = oForex.getView().getModel("general").getData();
		var mm = (date.getMonth() + 1).toString();
		mm = ("0" + mm).slice(-2);
		var dd = ("0" + date.getDate()).slice(-2);
		var date = yyyy + mm + dd;
		tableData.push({
			CardValidUpto : "",
			Card : "",
			Amount : "",
			IssuerBank : "",
			Invoicedate : date,
			Pcurrency : data.Pcurrency
		});
		if (data.whichtab == 'CHCLS') {// Modify close
			if (tableData.length > 1)
				$.extend(tableData[tableData.length - 1], tableData[tableData.length - 2]);
			tableData[tableData.length - 1].Pcurrency = "";
		}
		oForex.getView().byId("cardtable").setVisibleRowCount(tableData.length);
		oForex.getView().byId("cardtable").getModel().setData(tableData);
	},
	onAddTrst : function() {
		var tableModel = oForex.getView().byId("forextrst").getModel("trstmodel");
		var tableData = [];
		if (tableModel) {
			tableData = oForex.getView().byId("forextrst").getModel("trstmodel").getData();
		} else {
			tableData = [];
			var model = new sap.ui.model.json.JSONModel();
			model.setData(tableData);
			oForex.getView().setModel(model, "trstmodel");
		}
		var table = oForex.getView().byId("forextrst");
		tableData.push({});
		table.setVisibleRowCount(tableData.length);
		oForex.getView().getModel("trstmodel").setData(tableData);
	},
	onDelTrst : function(evt) {
		var index = oForex.getView().byId("forextrst").getSelectedIndices();
		if (index.length == 0) {
			sap.m.MessageToast.show("Please select atleast one row");
		} else {
			var tableData = oForex.getView().byId("forextrst").getModel("trstmodel").getData();
			for ( var i = index.length - 1; i >= 0; i--) {
				tableData.splice(index[i], 1);
			}
			oForex.getView().byId("forextrst").setVisibleRowCount(tableData.length);
			oForex.getView().byId("forextrst").getModel("trstmodel").setData(tableData);
		}
		// evt.oSource.removeItem(item);
	},
	// delete row from card table
	onDelCard : function(evt) {
		var index = oForex.getView().byId("cardtable").getSelectedIndices();
		var tabKey = sap.ui.getCore().getModel("forexitem").getData().whichtab;
		if (tabKey == "CHCLS") {
			for ( var i = index.length - 1; i >= 0; i--) {
				if (index[i] < this["fixedCardRows"].length) {
					index.splice(i, 1);
					if (index.length == 0) {
						sap.m.MessageToast.show("Deletion not possible");
						return "";
					}
				}
			}
		}
		var tableData = oForex.getView().byId("cardtable").getModel().getData();
		if (index.length == 0) {
			sap.m.MessageToast.show("Please select atleast one row");
		} else {
			for ( var i = index.length - 1; i >= 0; i--) {
				tableData.splice(index[i], 1);
			}
			oForex.getView().byId("cardtable").setVisibleRowCount(tableData.length);
			oForex.getView().byId("cardtable").getModel().setData(tableData);
		}
		// evt.oSource.removeItem(item);
	},
	onMenu : function(evt) {
		menuRef = sap.ui.project.e2etm.util.StaticUtility.customMenuOpen(oForex, evt);
		// var menu =
		// oForex.getView().byId(sap.ui.core.Fragment.createId("custommenu",
		// "menu_settings"));
		// var eDock = sap.ui.core.Popup.Dock;
		// menuRef = evt.oSource;
		// menu.getItems()[2].setValue("");
		// menu.open(false, evt.oSource.getFocusDomRef(), eDock.BeginTop, /*
		// * "Edge"
		// * of
		// * the
		// * menu
		// * (see
		// * sap.ui.core.Popup)
		// */
		// eDock.BeginBottom, /*
		// * "Edge" of the related opener position (see
		// * sap.ui.core.Popup)
		// */
		// evt.oSource.getDomRef() /*
		// * Related opener position (see
		// * sap.ui.core.Popup)
		// */
		// );
	},
	onMenuItemSelect : function(evt) {
		var menu = oForex.getView().byId("menu_settings");
		var table = oForex.getTable();
		var sPath = oForex.findProperty();
		var oBinding = table.getBinding("items");
		var requestFlag = sap.ui.project.e2etm.util.StaticUtility.customMenuItemSelect(oForex, evt, menuRef, sPath, oBinding);
		if (requestFlag) {
			if (sPath == "TravelPlan" || sPath == "EmpNo") {
				var tab = this.getForexTabValue();
				oDataModel.read("ForexWorklistSet?$filter=" + sPath + " eq '" + evt.getParameter("item").getValue() + "' and LoginRole eq 'FEX' and Tab eq '" + tab + "'", null, null, true,
				// success
				function(oData, response) {
					var results = oForex.getTabWorklist(oData.results, tab);
					var worklistModel = new sap.ui.model.json.JSONModel();
					worklistModel.setData(results);
					table.setModel(worklistModel);
				}, function(error) {
					// error
				});
			}
		}
	},
	getForexTabValue : function() {
		var icontab = this.getView().byId("idIconTabBarForexAdmin");
		var key = icontab.getSelectedKey();
		switch (key) {
		case "NEW":
			return "NEW";
		case "NGREE":
			return "NOTG";
		case "CARD":
			return "CARD";
		case "ISSUE":
			return "ISSF";
		case "SBFT":
			return "FISB";
		case "FSURR":
			return this.getForexSurrenderTabValue();
			// sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oForex);
		}
	},
	getForexSurrenderTabValue : function() {
		var surTab = this.getView().byId("tabFSURR").getContent()[0];
		var surKey = surTab.getSelectedKey();
		switch (surKey) {
		case "NEW":
			return "SRNW";
		case "PSUR":
			return "SRPR";
		case "SUR":
			return "SRSR";
		case "SEBT":
			return "SRSB";
		}
	},
	// onMenuItemSelect : function(evt) {
	//		
	// var aFilters = [];
	// var aSorters = [];
	// var menu = oForex.getView().byId("menu_settings");
	// var table = oForex.getTable();
	// var sPath = oForex.findProperty();
	// var oBinding = table.getBinding("items");
	// if ((evt.getParameter("item")) instanceof sap.ui.unified.MenuItem) {
	// var text = evt.getParameter("item").getText();
	// if (text == "Sort Ascending") {
	// menuRef.setIcon("sap-icon://sort-ascending");
	// aSorters.push(new sap.ui.model.Sorter(sPath, false));
	// oBinding.sort(aSorters);
	// } else if (text == "Sort Descending") {
	// menuRef.setIcon("sap-icon://sort-descending");
	// aSorters.push(new sap.ui.model.Sorter(sPath, true));
	// oBinding.sort(aSorters);
	// }
	// } else {
	// var item = evt.getParameter("item").getValue();
	// if (item) {
	// menuRef.setIcon("sap-icon://filter");
	// var oFilter = new sap.ui.model.Filter(sPath, "Contains", item);
	// aFilters.push(oFilter);
	// oBinding.filter(aFilters);
	// } else {
	// menuRef.setIcon("sap-icon://sort");
	// oBinding.filter(null);
	// }
	// }
	// },
	getTable : function() {
		var key = oForex.getView().byId("idIconTabBarForexAdmin").getSelectedKey();
		var table;
		switch (key) {
		case "" || "NEW":
			table = oForex.getView().byId("idIconTabBarForexAdmin").getItems()[0].getContent()[0];
			break;
		case "NGREE":
			table = oForex.getView().byId("idIconTabBarForexAdmin").getItems()[1].getContent()[0];
			break;
		case "CARD":
			table = oForex.getView().byId("idIconTabBarForexAdmin").getItems()[2].getContent()[0];
			break;
		case "ISSUE":
			table = oForex.getView().byId("idIconTabBarForexAdmin").getItems()[3].getContent()[0];
			break;
		case "CLOSE":
			table = oForex.getView().byId("idIconTabBarForexAdmin").getItems()[5].getContent()[0];
			break;
		case "SBFT":
			table = oForex.getView().byId("idIconTabBarForexAdmin").getItems()[4].getContent()[0];
			break;
		case "FSURR":
			var surrTab = oForex.getView().byId("idIconTabBarForexAdmin").getItems()[6].getContent()[0];
			var surKey = surrTab.getSelectedKey();
			if (surKey == "NEW") {
				table = surrTab.getItems()[0].getContent()[0];
			} else if (surKey == "SUR") {
				table = surrTab.getItems()[1].getContent()[0];
			} else if (surKey == "PSUR") {
				table = surrTab.getItems()[2].getContent()[0];
			} else if (surKey == "SEBT") {
				table = surrTab.getItems()[3].getContent()[0];
			} else if (surKey == "CLS") {
				table = surrTab.getItems()[4].getContent()[0];
			}
			break;
		case "CANC":
			table =  oForex.getView().byId("idIconTabBarForexAdmin").getItems()[7].getContent()[0];
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
		case "Received Date":
			sPath = "ReceivedDt";
			break;
		}
		return sPath;
	},
	// currencies value help
	getCurr : function(evt) {
		var oControl = evt.oSource;
		var oValueHelpDialog = new sap.ui.comp.valuehelpdialog.ValueHelpDialog({
			supportMultiselect : false,
			title : "Currency keys",
			cancel : function(oControlEvent) {
				oValueHelpDialog.close();
			},
			change : function() {
				alert("changeDialog");
			},
			afterClose : function() {
				oValueHelpDialog.destroy();
			},
			ok : function(oControlEvent) {
				var sKey = oControlEvent.getParameter("tokens")[0].getProperty("key");
				oControl.setValue(sKey);
				oValueHelpDialog.close();
			},
		});
		oValueHelpDialog.theTable.addColumn(new sap.ui.table.Column({
			label : new sap.ui.commons.Label({
				text : "Currency Code",
				icon : "sap-icon://filter"
			}),
			template : new sap.ui.commons.TextView().bindProperty("text", "FIELD1"),
			sortProperty : "FIELD1",
			filterProperty : "FIELD1"
		}));
		oValueHelpDialog.theTable.addColumn(new sap.ui.table.Column({
			label : new sap.ui.commons.Label({
				text : "Description",
				icon : "sap-icon://filter"
			}),
			template : new sap.ui.commons.TextView().bindProperty("text", "FIELD2"),
			sortProperty : "FIELD2",
			filterProperty : "FIELD2"
		}));
		oValueHelpDialog.setKey("FIELD1");
		oValueHelpDialog.getTable().setModel(oForex.getView().getModel("curModel"));
		oValueHelpDialog.theTable.bindRows("/");
		oValueHelpDialog.open();
	},
	onFileUpload : function(evt) {
		var file = evt.getParameters("files").files[0];
		var oData = evt.oSource.getParent().getModel("general").getData();
		var sModule = "FEX";
		sap.ui.project.e2etm.util.StaticUtility.uploadCollectionFile(oForex, file, oData.TravelPlan, oData.EmpNo, sModule);
	},
	onFileDeleted : function(oEvent) {
		// prepare FileName
		var sFileName = oEvent.getParameters("item").item.getFileName();
		// prepare DocType
		var oData = oEvent.oSource.getParent().getModel("general").getData();
		var sDocType;
		sDocType = "FEX";
		// prepare travel request number
		var sDepReq = oData.TravelPlan;
		// prepare employee number
		var sEmpNo = oData.EmpNo;
		// prepare index
		var sIndex = 0;
		sap.ui.project.e2etm.util.StaticUtility.deleteUploadCollectionFile(oForex, oEvent, sDepReq, sFileName, sDocType, sEmpNo, sIndex);
	},
	onUploadComplete : function(oEvent) {
		this.getView().getModel("new").refresh(true);
		// oEvent.oSource.setUploadUrl("");
	},
	setDataTable : function(result) {
		var items = oForex.getView().byId("idIconTabBarForexAdmin").getItems();
		var jsModel = new sap.ui.model.json.JSONModel();
		jsModel.setData(result);
		for ( var i = 0; i < items.length; i++) {
			var key = items[i].getKey();
			if (key != "FSURR" && key != "CLOSE") {
				var content = items[i].getContent()[0];
				content.setModel(jsModel);
				var filter = oForex.getFilter(key);
				var bindItems = content.getBinding("items");
				var filteredItems = bindItems.filter(filter);
				var model = oForex.setBinding(filteredItems.aIndices, result);
				content.setModel(model);
				items[i].setCount(filteredItems.getLength());
			} else if (key == "FSURR") {
				var content = items[i].getContent()[0];
				oForex.setDataTableContent(content, jsModel, result)
			}
		}
	},
	setDataTableContent : function(content, jsModel, result) {
		var items = content.getItems();
		for ( var i = 0; i < items.length; i++) {
			var key = items[i].getKey();
			if (key != "CLS") {
				var table = items[i].getContent()[0];
				table.setModel(jsModel);
				var filter = oForex.getSurrFilter(key);
				var bindItems = table.getBinding("items");
				var filteredItems = bindItems.filter(filter);
				var model = oForex.setBinding(filteredItems.aIndices, result);
				table.setModel(model);
				items[i].setCount(filteredItems.getLength());
			}
		}
	},
	getSurrFilter : function(key) {
		var oFilter;
		var aFilters = [];
		switch (key) {
		case "NEW":
			oFilter = new sap.ui.model.Filter("Tab", "EQ", "SRNW");
			aFilters.push(oFilter);
			break;
		case "PSUR":
			oFilter = new sap.ui.model.Filter("Tab", "EQ", "SRPR");
			aFilters.push(oFilter);
			break;
		case "SUR":
			oFilter = new sap.ui.model.Filter("Tab", "EQ", "SRSR");
			aFilters.push(oFilter);
			break;
		case "SEBT":
			oFilter = new sap.ui.model.Filter("Tab", "EQ", "SRSB");
			aFilters.push(oFilter);
			break;
		case "CLS":
			oFilter = new sap.ui.model.Filter("Tab", "EQ", "SRCL");
			aFilters.push(oFilter);
			break;
		}
		return aFilters;
	},
	getFilter : function(key) {
		var oFilter;
		var aFilters = [];
		switch (key) {
		case "NEW":
			oFilter = new sap.ui.model.Filter("Tab", "EQ", "NEW");
			aFilters.push(oFilter);
			break;
		case "NGREE":
			oFilter = new sap.ui.model.Filter("Tab", "EQ", "NOTG");
			aFilters.push(oFilter);
			break;
		case "CARD":
			oFilter = new sap.ui.model.Filter("Tab", "EQ", "CARD");
			aFilters.push(oFilter);
			break;
		case "ISSUE":
			oFilter1 = new sap.ui.model.Filter("Tab", "EQ", "ISSF");
			// oFilter2 = new sap.ui.model.Filter("Tab", "EQ", "");
			aFilters.push(oFilter1);
			// aFilters.push(oFilter2);
			break;
		case "CLOSE":
			var oFilter1 = new sap.ui.model.Filter("Tab", "EQ", "FINF");
			var oFilter2 = new sap.ui.model.Filter("Tab", "EQ", "APPR");
			// var oFilter2 = [new sap.ui.model.Filter("", "EQ",
			// "DA"),
			// new sap.ui.model.Filter("VersionReason", "EQ",
			// "DB")];
			// var oFilter3 = new
			// sap.ui.model.Filter(oFilter2,false);
			// oFilter = new
			// sap.ui.model.Filter([oFilter1,oFilter3],true);
			aFilters.push(oFilter1);
			aFilters.push(oFilter2);
			break;
		case "FSURR":
			break;
		case "SBFT":
			oFilter = new sap.ui.model.Filter("Tab", "EQ", "FISB");
			aFilters.push(oFilter);
			break;
		}
		return aFilters;
	},
	onIconTabBarSelect : function(evt) {
		evt.preventDefault();
	},
	onIconTabBarAdminSelect : function(evt) {
		this.getView().byId("btnFrexDownload").setVisible(true);
		var key = evt.getParameter("key");
		var role = sap.ui.getCore().getModel("profile").getData().currentRole;
		oForex.getView().getModel("pepayroll").getData().bankvisible = false;
		switch (key) {
		case "NEW":
			this.getWorklistDetails("NEW", evt.getParameter("selectedItem").getContent()[0]);
			break;
		case "NGREE":
			this.getWorklistDetails("NOTG", evt.getParameter("selectedItem").getContent()[0]);
			break;
		case "CARD":
			oForex.getView().getModel("pepayroll").getData().bankvisible = true;
			this.getWorklistDetails("CARD", evt.getParameter("selectedItem").getContent()[0]);
			break;
		case "ISSUE":
			this.getWorklistDetails("ISSF", evt.getParameter("selectedItem").getContent()[0]);
			break;
		case "SBFT":
			this.getWorklistDetails("FISB", evt.getParameter("selectedItem").getContent()[0]);
			break;
		case "CLOSE":
			var table = evt.getParameter("selectedItem").getContent()[1];
			// sap.ui.project.e2etm.util.StaticUtility.fetchCloseDetails(role,table,oForex);
			break;
		case "CANC":
			this.getWorklistDetails("CANC", evt.getParameter("selectedItem").getContent()[0]);
			break;
		case "FSURR":
			// sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oForex);
			var surTab = evt.getParameter("selectedItem").getContent()[0];
			var surKey = surTab.getSelectedKey();
			if (surKey == "NEW")
				surTab.fireSelect({
					selectedItem : this.getView().byId("tabSURNEW"),
					key : surKey
				});
			else if (surKey == "PSUR")
				surTab.fireSelect({
					selectedItem : this.getView().byId("tabSURPSUR"),
					key : surKey
				});
			else if (surKey == "SUR")
				surTab.fireSelect({
					selectedItem : this.getView().byId("tabSURSUR"),
					key : surKey
				});
			else if (surKey == "SEBT")
				surTab.fireSelect({
					selectedItem : this.getView().byId("tabSURSEBT"),
					key : surKey
				});
			// oForex.getForexSurrTable(content);//
			break;
			
		case "UPL":
			this.getView().byId("btnFrexDownload").setVisible(false);
			break;
		}
		oForex.getView().getModel("pepayroll").refresh(true);
	},
	getTabKeyValue:function(){
		var tabKey;
		var key = oForex.getView().byId("idIconTabBarForexAdmin").getSelectedKey();
		switch (key) {
		case "NEW":
			tabKey = "NEW";
			break;
		case "NGREE":
			tabKey = "NOTG";
			break;
		case "CARD":			
			tabKey = "CARD";
			break;
		case "ISSUE":
			tabKey = "ISSF";
			break;
		case "SBFT":
			tabKey = "FISB";
			break;
		case "CLOSE":
		//	var table = evt.getParameter("selectedItem").getContent()[1];
			// sap.ui.project.e2etm.util.StaticUtility.fetchCloseDetails(role,table,oForex);
			break;
		case "CANC":
			tabKey = "CANC";
			break;
		case "FSURR":
			// sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oForex);
			var surrTab = oForex.getView().byId("idIconTabBarForexAdmin").getItems()[6].getContent()[0];
			var surKey = surrTab.getSelectedKey();
			if (surKey == "NEW")
				tabKey ="SRNW";
			else if (surKey == "PSUR")
				tabKey = "SRSR";
			else if (surKey == "SUR")
				tabKey = "SRPR";
			else if (surKey == "SEBT")
				tabKey = "SRSB";
			// oForex.getForexSurrTable(content);//
			break;
		}
		return tabKey;
	},
	onSurrTabSelect : function(evt) {
		var key = evt.getParameter("key");
		switch (key) {
		case "NEW":
			this.getWorklistDetails("SRNW", evt.getParameter("selectedItem").getContent()[0]);
			break;
		case "SUR":
			this.getWorklistDetails("SRSR", evt.getParameter("selectedItem").getContent()[0]);
			break;
		case "PSUR":
			this.getWorklistDetails("SRPR", evt.getParameter("selectedItem").getContent()[0]);
			break;
		case "SEBT":
			this.getWorklistDetails("SRSB", evt.getParameter("selectedItem").getContent()[0]);
			break;
		}
	},
	getWorklistDetails : function(tab, table) {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oForex);
		oDataModel.read("ForexWorklistSet?$filter=LoginRole eq 'FEX' and Tab eq '" + tab + "'", null, null, true,
		// success
		function(oData, response) {
			var results = oForex.getTabWorklist(oData.results, tab);
			var worklistModel = new sap.ui.model.json.JSONModel();
			worklistModel.setData(results);
			table.setModel(worklistModel);
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oForex);
		}, function(error) {
			// error
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oForex);
		});
	},
	onAllDownload:function(){
//		var tabs = ["NEW","NOTG","CARD","ISSF","FISB","SRNW","SRSR","SRPR","SRSB"];
		var tab = this.getTabKeyValue();
		var tabs = [tab];
		var batch = [];
		for(var i=0;i<tabs.length;i++){			
		  batch.push(oDataModel.createBatchOperation("ForexWorklistSet?$filter=LoginRole+eq+'FEX'+and+Tab+eq+'" + tabs[i] + "'+and+DownloadFlag+eq+'X'","GET"));	
		}
		oDataModel.addBatchReadOperations(batch);
		oDataModel.submitBatch(jQuery.proxy(function(oResult) {
			var aData =[]; 
	        aData = (oResult.__batchResponses[0].data.results);	       
	        this.onExport(aData);
	        
	        
	        		
		},this),function(error) {
			//sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oForex);
		},true);
//		this.onExport();
		
	},
	onExport : function(oData) {
		var table = this.getTable();
		//var oData = table.getModel().getData();
		var model = new sap.ui.model.json.JSONModel();
		model.setData(oData);
		//model.setDefaultCountMode(sap.ui.model.odata.CountMode.None);
		//var sFilterParams = table.getBinding("items").sFilterParams;
		var columns = this.getExcelColumns(table);
		oExport = new sap.ui.core.util.Export({
			exportType : new sap.ui.core.util.ExportTypeCSV({
				separatorChar : ","
			}),
			models : model,
			rows : {
				path : "/"
			},
			columns : columns
		});
		
		//var text = oForex.getView().byId("idIconTabBarForexAdmin").getSelectedItem().getText();
		var text="";
		var key = oForex.getView().byId("idIconTabBarForexAdmin").getSelectedKey();
		var table;
		switch (key) {
		case "" || "NEW":
			text = oForex.getView().byId("idIconTabBarForexAdmin").getItems()[0].getText();
			break;
		case "NGREE":
			text = oForex.getView().byId("idIconTabBarForexAdmin").getItems()[1].getText();
			break;
		case "CARD":
			text = oForex.getView().byId("idIconTabBarForexAdmin").getItems()[2].getText();
			break;
		case "ISSUE":
			text = oForex.getView().byId("idIconTabBarForexAdmin").getItems()[3].getText();
			break;
		case "CLOSE":
			text = oForex.getView().byId("idIconTabBarForexAdmin").getItems()[5].getText();
			break;
		case "SBFT":
			text = oForex.getView().byId("idIconTabBarForexAdmin").getItems()[4].getText();
			break;
		case "FSURR":
			var surrTab = oForex.getView().byId("idIconTabBarForexAdmin").getItems()[6].getContent()[0];
			var surKey = surrTab.getSelectedKey();
			if (surKey == "NEW") {
				text = surrTab.getItems()[0].getText();
			} else if (surKey == "SUR") {
				text = surrTab.getItems()[1].getText();
			} else if (surKey == "PSUR") {
				text = surrTab.getItems()[2].getText();
			} else if (surKey == "SEBT") {
				text = surrTab.getItems()[3].getText();
			} else if (surKey == "CLS") {
				text = surrTab.getItems()[4].getText();
			}
			break;
		case "CANC":
			text =  oForex.getView().byId("idIconTabBarForexAdmin").getItems()[7].getText();
			break;
		}
		oExport.saveFile("Forex Pending Details-"+text).always(function() {
			this.destroy();
		});
	},
	
	getExcelColumns : function(table) {
		var columns = [];
		// table = this.getView().byId("idItemTable");
		var cells = table.getBindingInfo("items").template.getCells();
		var cols = table.getColumns();
		for ( var i = 0; i < cols.length; i++) {
			if(cols[i].getHeader().getText()=="Start Date" || cols[i].getHeader().getText()=="Received Date"){
				if (cells[i].getBindingInfo("text")) {
					var path = cells[i].getBindingInfo("text").parts[0].path;				
							columns.push({
								name : cols[i].getHeader().getText(),
								template : {
									content : { parts : [ path ],
										formatter : sap.ui.project.e2etm.util.Formatter.sapDate}
								}
							});
				
				}	
			}else{
			if (cells[i].getBindingInfo("text")) {
				var path = cells[i].getBindingInfo("text").parts[0].path;				
						columns.push({
							name : cols[i].getHeader().getText(),
							template : {
								content : "{" + path + "}"
							}
						});
			
			}
		}
		}
		
		return columns;
	},
	getTabWorklist : function(oData, tab) {
		var results = [];
		if (tab == "NEW") {
			for ( var i = 0; i < oData.length; i++) {
				if (oData[i].Tab == tab) {
					results.push(oData[i]);
				}
			}
		} else if (tab == "NOTG") {
			for ( var i = 0; i < oData.length; i++) {
				if (oData[i].Tab == tab) {
					results.push(oData[i]);
				}
			}
		} else {
			results = oData;
		}
		return results;
	},
	getForexSurrTable : function(content) {
		var role = sap.ui.getCore().getModel("profile").getData().currentRole;
		oDataModel.read("ForexWorklistSet?$filter=LoginRole eq '" + role + "' and Tab eq 'FS'", null, null, true,
		// success
		function(oData, response) {
			var model = new sap.ui.model.json.JSONModel();
			// oData.results[0].SeqNo = 1;
			model.setData(oData.results);
			oForex.setDataTableContent(content, model, oData.results)
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oForex);
		}, function(error) {
			// error
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oForex);
		});
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
	onINRCalculate : function(evt) {
		var table = evt.oSource.getParent().getParent();
		var index = table.indexOfRow(evt.oSource.getParent());
		var data = oForex.getView().getModel("forexsurrender").getData();
		data.inrtable[index].Total = oForex.formatAmountValue(data.inrtable[index].Cash) * oForex.formatAmountValue(data.inrtable[index].ExchangeRate);
		oForex.getView().getModel("forexsurrender").setData(data);
	},
	onIssueForex : function() {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oForex);
		jQuery.sap.delayedCall(500, oForex, function() {
			// oForex.checkPolicyExchangeRate();
			oForex.saveForexDetails("15", "08");
		});
	},
	onCloseSearchWorklist : function(evt) {// Forex Surrender Close
		var role = sap.ui.getCore().getModel("profile").getData().currentRole;
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oForex);
		var tpno = evt.oSource.getValue();
		var table = evt.oSource.getParent().getParent();
		oDataModel.read("ForexWorklistSet?$filter=LoginRole eq '" + role + "' and TravelPlan eq '" + tpno + "' and Module eq 'FREX' and Tab eq 'CL'", null, null, true,
		// success
		function(oData, response) {
			var model = new sap.ui.model.json.JSONModel();
			// oData.results[0].SeqNo = 1;
			model.setData(oData.results);
			table.setModel(model, "trworklist");
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oForex);
		}, function(error) {
			// error
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oForex);
		});
	},
	onCloseSearchForex : function(evt) {
		sap.ui.project.e2etm.util.StaticUtility.onCloseSearchForex(evt, oForex);
	},
	readForexWorklist : function(role, tpno, nodule) {
	},
	onSurrenderForex : function() {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oForex);
		jQuery.sap.delayedCall(500, oForex, function() {
			oForex.saveForexDetails("20", "08");
		});
	},
	onPartialSurrenderForex : function() {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oForex);
		jQuery.sap.delayedCall(500, oForex, function() {
			oForex.saveForexDetails("24", "08");
		});
	},
	onClose : function() {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oForex);
		jQuery.sap.delayedCall(500, oForex, function() {
			var data = oForex.getView().getModel("general").getData();
			if (data.whichtab == "FSURR" && data.subkey == "PSUR") {
				oForex.saveForexDetails("25", "08");
			} else {
				oForex.saveForexDetails("14", "08");
			}
		});
	},
	onSendback : function() {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oForex);
		jQuery.sap.delayedCall(500, oForex, function() {
			var data = oForex.getView().getModel("general").getData();
			if (data.whichtab == "FSURR" && data.subkey == "NEW") {
				oForex.saveForexDetails("02", "08");// action,role
			} else {
				oForex.saveForexDetails("02", "06");
			}
		});
	},
	onApprove : function() {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oForex);
		jQuery.sap.delayedCall(500, oForex, function() {
			oForex.saveForexDetails("03", "06");
		});
	},
	onSave : function() {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oForex);
		jQuery.sap.delayedCall(500, oForex, function() {
			oForex.saveForexDetails("26", "06");
		});
	},
	onDelimit : function() {
		var carddata = [];
		var oData = {};
		var rows = [];
		var cashrows = [];
		var generaldata = oForex.getView().getModel("general").getData();
		var data = sap.ui.getCore().getModel("forexitem").getData();
		if (data.whichtab != "FSURR") {
			table = oForex.getView().byId("cardtable");
			carddata = table.getModel().getData();
			rows = table.getSelectedIndices();
			cashrows = oForex.getView().byId("cashtable").getSelectedIndices();
		} else {
			table = oForex.getView().byId("forexsurrcard");
			carddata = oForex.getView().getModel("forexsurrender").getData().cardtable;
			rows = table.getSelectedIndices();
			cashrows = oForex.getView().byId("forexsurrcash").getSelectedIndices();
		}
		if (cashrows.length == 0) {
			if (rows.length > 1 || rows.length == 0) {
				// sap.ui.project.e2etm.util.StaticUtility.setBusy(false,
				// oForex);
				sap.m.MessageToast.show("Please select one card detail", {
					duration : 10000,
					closeOnBrowserNavigation : false
				});
			} else if (rows.length == 1) {
				sap.ca.ui.dialog.confirmation.open({
					question : "Do you want to delimit?",
					showNote : false,
					title : "Confirm",
					confirmButtonLabel : "Ok"
				}, function(oResult) {
					if (oResult.isConfirmed) {
						sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oForex);
						oData.EmpNo = generaldata.EmpNo;
						oData.IssuedBanker = carddata[rows[0]].IssuerBank;
						oData.CardNo = carddata[rows[0]].CardNo;
						oData.CardValidUpto = carddata[rows[0]].CardValidity;
						oData.Currency = carddata[rows[0]].Currency;
						oDataModel.create("ForexCardsAllSet", oData, null, function(oData, response) {
							// oForex.uploadFiles(gdata.TravelPlan);
							if (data.whichtab != "FSURR") {
								//carddata.splice(rows[0], 1);
								table.getModel().setData(carddata);
								table.setVisibleRowCount(carddata.length);
								//carddata.splice(rows[0], 1);	
							} else {
								oForex.getView().getModel("forexsurrender").getData().cardtable = carddata;
								oForex.getView().getModel("forexsurrender").refresh(true);
								table.setVisibleRowCount(carddata.length);
							}
							sap.m.MessageToast.show("Delimited Successfully", {
								duration : 10000,
								closeOnBrowserNavigation : false
							});
							oForex.fetchCardsAll(generaldata.EmpNo);
						}, function(error) {
							sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oForex);
							sap.m.MessageToast.show("Internal Server Error");
						}, true);
					}
				});
			}
		} else {
			// sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oForex);
			sap.m.MessageToast.show("Delimit is only possible for card details");
		}
	},
	fetchCardsAll : function(empno) {
		oDataModel.read("ForexCardsAllSet?$filter=EmpNo eq '" + empno + "'", null, null, true, function(oData, response) {
			var data = oForex.getView().getModel("forexmodel").getData();
			data.cardsAll = oData.results;
			oForex.getView().getModel("forexmodel").setData(data);
			oForex.getView().getModel("forexmodel").refresh(true);
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oForex);

		}, function(error) {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oForex);
		});
	},
	saveForexDetails : function(action, role) {
		var results = {};
		var gdata = oForex.getView().getModel("general").getData();
		var carddata = oForex.getView().byId("cardtable").getModel().getData();
		var cashdata = oForex.getView().byId("cashtable").getModel().getData();
		var comments = oForex.getView().byId("comments").getValue();
		var cardtable = oForex.getView().byId("cardtable");
		var fldproperties = oForex.getView().getModel("fieldproperties").getData();
		// if(gdata.whichtab == "FSURR"){
		// gdata.Module = "TRST";
		// }
		results = {
			TravelPlan : gdata.TravelPlan,
			TravelType : gdata.TravelType,
			SeqNo : gdata.SeqNo,
			Module : gdata.Module,
			EmpNo : gdata.EmpNo,
			Duration : isNaN(parseInt(gdata.Duration)) ? 0 : parseInt(gdata.Duration),
			VersionReason : gdata.VersionReason,
			Role : role,
			Action : action,
			ForexResp : sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_PERNR,
			Comments : comments,
			ForexSur : gdata.ForexSur,
			VisaCode : gdata.VisaCode,
			PePayroll : gdata.PePayroll,
			ReceivedDt : gdata.ReceivedDt,
			AdvUpdated : gdata.AdvUpdated,
			IssForex : gdata.IssForex,
			ClosedDate : gdata.ClosedDate,
			MonthlyRem : gdata.MonthlyRem,
			ToCountry : gdata.ToCountry,
		};
		results.ForexCardSet = [];
		results.ForexCashSet = [];
		if (gdata.whichtab == "FSURR") {// Surrender
			results.ForexInrSet = [];
			gdata.Module = "TRST";
			var data = oForex.getView().getModel("forexsurrender").getData();
			for ( var i = 0; i < data.inrtable.length; i++) {
				results.ForexInrSet.push({
					TravelPlan : gdata.TravelPlan,
					TravelType : gdata.TravelType,
					EmpNo : gdata.EmpNo,
					SeqNo : (i + 1),
					Module : gdata.Module,
					Cash : data.inrtable[i].Cash,
					Currency : data.inrtable[i].Currency,
					ExchangeRate : data.inrtable[i].ExchangeRate,
					// Tax : '',
					PaymentType : data.inrtable[i].PaymentType,
					Total : data.inrtable[i].Total,
					Bank : data.inrtable[i].Bank,
					Receipt : data.inrtable[i].Receipt,
					Remarks : data.inrtable[i].Remarks,
				});
			}
			if (results.ForexInrSet.length == 0) {
				results.ForexInrSet.push({});
			}
			carddata = data.cardtable;
			cashdata = data.cashtable;
		}
		// else if (gdata.whichtab == "CHCLS") {
		// carddata.splice(0, this["fixedCardRows"].length);
		// cashdata.splice(0, this["fixedCashRows"].length);
		// }
		try {
		
				if (gdata.whichtab != "CHCLS") {
					for ( var i = 0; i < carddata.length; i++) {
						if ((parseFloat(carddata[i].PexchangeRate) != 0 && carddata[i].PexchangeRate != "") || (gdata.whichtab == "FSURR") || (!(fldproperties.pvisible))) {
							results.ForexCardSet.push({
								TravelPlan : gdata.TravelPlan,
								TravelType : gdata.TravelType,
								EmpNo : gdata.EmpNo,
								SeqNo : gdata.SeqNo,
								Module : gdata.Module,
								Items : i + 1,
								IssuerBank : carddata[i].IssuerBank,
								CardNo : carddata[i].CardNo,
								CardValidity : carddata[i].CardValidity,
								Amount : carddata[i].Amount,
								Currency : carddata[i].Currency,
								ExchangeRate : carddata[i].ExchangeRate,
								PaymentType : carddata[i].PaymentType,
								Tax : carddata[i].Tax,
								Total : carddata[i].Total,
								InvoiceNo : carddata[i].InvoiceNo,
								Invoicedate : carddata[i].Invoicedate,
								Pcurrency : carddata[i].Pcurrency,
								PexchangeRate : carddata[i].PexchangeRate,
								Ptotal : carddata[i].Ptotal,
								Remarks : carddata[i].Remarks,
							});
						} else {
							throw "PExchangeRateCard";
						}
					}
				} else {// tab = CHCLS
					for ( var i = 0; i < carddata.length; i++) {
						if (i >= this["fixedCardRows"].length) {// adding only
							// newly added
							// rows
							results.ForexCardSet.push({
								TravelPlan : gdata.TravelPlan,
								TravelType : gdata.TravelType,
								EmpNo : gdata.EmpNo,
								SeqNo : gdata.SeqNo,
								Module : gdata.Module,
								Items : i + 1,
								IssuerBank : carddata[i].IssuerBank,
								CardNo : carddata[i].CardNo,
								CardValidity : carddata[i].CardValidity,
								Amount : carddata[i].Amount,
								Currency : carddata[i].Currency,
								ExchangeRate : carddata[i].ExchangeRate,
								PaymentType : carddata[i].PaymentType,
								Tax : carddata[i].Tax,
								Total : carddata[i].Total,
								InvoiceNo : carddata[i].InvoiceNo,
								Invoicedate : carddata[i].Invoicedate,
								Pcurrency : carddata[i].Pcurrency,
								PexchangeRate : carddata[i].PexchangeRate,
								Ptotal : carddata[i].Ptotal,
								Remarks : carddata[i].Remarks,
							});
						}
					}
				}
		
		
				if (gdata.whichtab != "CHCLS") {
					for ( var i = 0; i < cashdata.length; i++) {
						if ((parseFloat(cashdata[i].PexchangeRate) != 0 && cashdata[i].PexchangeRate != "") || (gdata.whichtab == "FSURR") || (!(fldproperties.pvisible))) {
							results.ForexCashSet.push({
								TravelPlan : gdata.TravelPlan,
								TravelType : gdata.TravelType,
								EmpNo : gdata.EmpNo,
								SeqNo : i + 1,
								Module : gdata.Module,
								Cash : cashdata[i].Cash,
								Currency : cashdata[i].Currency,
								ExchangeRate : cashdata[i].ExchangeRate,
								Tax : cashdata[i].Tax,
								PaymentType : cashdata[i].PaymentType,
								Total : cashdata[i].Total,
								Vendor : cashdata[i].Vendor,
								InvoiceNo : cashdata[i].InvoiceNo,
								Invoicedate : cashdata[i].Invoicedate,
								Pcurrency : cashdata[i].Pcurrency,
								PexchangeRate : cashdata[i].PexchangeRate,
								Ptotal : cashdata[i].Ptotal,
								Remarks : cashdata[i].Remarks,
							});
						} else {
							throw "PExchangeRateCash";
						}
					}
				} else {//tab = CHCLS
					for ( var i = 0; i < cashdata.length; i++) {
						if (i >= this["fixedCashRows"].length) {// adding only
							// newly added
							// rows
							results.ForexCashSet.push({
								TravelPlan : gdata.TravelPlan,
								TravelType : gdata.TravelType,
								EmpNo : gdata.EmpNo,
								SeqNo : i + 1,
								Module : gdata.Module,
								Cash : cashdata[i].Cash,
								Currency : cashdata[i].Currency,
								ExchangeRate : cashdata[i].ExchangeRate,
								Tax : cashdata[i].Tax,
								PaymentType : cashdata[i].PaymentType,
								Total : cashdata[i].Total,
								Vendor : cashdata[i].Vendor,
								InvoiceNo : cashdata[i].InvoiceNo,
								Invoicedate : cashdata[i].Invoicedate,
								Pcurrency : cashdata[i].Pcurrency,
								PexchangeRate : cashdata[i].PexchangeRate,
								Ptotal : cashdata[i].Ptotal,
								Remarks : cashdata[i].Remarks,
							});
						}
					}
				}
				
				if(results.ForexCashSet.length==0)
					results["ForexCashSet"].push({});
				if(results.ForexCardSet.length==0)
					results["ForexCardSet"].push({});
		
			oDataModel.create("ForexTransSet", results, null, function(oData, response) {
				// oForex.uploadFiles(gdata.TravelPlan);
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oForex);
				window.history.go(-1);
				sap.m.MessageToast.show("Updated Successfully", {
					duration : 10000,
					closeOnBrowserNavigation : false
				});
			}, function(error) {
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oForex);
				sap.m.MessageToast.show("Internal Server Error");
			}, true);
		} catch (exc) {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oForex);
			if (exc == "PExchangeRateCard") {
				sap.m.MessageToast.show("Please enter Policy Exchange Rate in Card table");
			} else if (exc == "PExchangeRateCash") {
				sap.m.MessageToast.show("Please enter Policy Exchange Rate in Cash table");
			}
		}
	},
	uploadFiles : function(visareq) {
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
				var post = oForex.onFileUploadto(uploadFile[i].File, sUrl, visareq, header);
			}
		});
	},
	onFileUploadto : function(file, sUrl, visareq, header) {
		var gdata = oForex.getView().getModel("general").getData();
		var sSlung = gdata.TravelPlan + "," + gdata.EmpNo + "," + file.name + "," + "FEX";
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
	showPopUp : function() {
		sap.ca.ui.dialog.confirmation.open({
			question : "Please update the exchange rate between issued currency and policy currency and inform employee",
			showNote : false,
			title : "Confirm",
			confirmButtonLabel : "Ok"
		}, function(oResult) {
			if (oResult.isConfirmed) {
				// sap.ca.ui.dialog.confirmation.close();
			}
		});
	},
	onCurrencyChange : function(evt) {
		var table = evt.getSource().getParent().getParent();
		var generaldata = oForex.getView().getModel("general").getData();
		var id = table.getId();
		var sid = id.split("--");
		var cells = table.getAggregation("cells");
		var index = table.indexOfRow(evt.getSource().getParent());
		var data = oForex.getView().getModel("fieldproperties").getData();
		switch (sid[1]) {
		case "cardtable":
			var carddata = table.getModel().getData();
			var flag = oForex.checkCurrencyInTable(evt.oSource.getValue(), carddata, index);
			if (flag) {
				if (evt.oSource.getValue() == carddata[index].Pcurrency) {
					carddata[index].PexchangeRate = 1;
					carddata[index].Ptotal = carddata[index].PexchangeRate * carddata[index].Amount;
				} else {
					// cells[12].setEditable();
					carddata[index].PexchangeRate = 0;
					carddata[index].Ptotal = carddata[index].PexchangeRate * carddata[index].Amount;
					if (generaldata.TravelType == "DEPU")
						oForex.showPopUp();
				}
				table.getModel().setData(carddata);
				oForex.setCardDetails(evt);
			} else {
				evt.oSource.setValue("");
				sap.ca.ui.dialog.confirmation.open({
					question : "Please delimit the card before issuing the card for the same currency",
					showNote : false,
					title : "Error",
					confirmButtonLabel : "Ok"
				}, function(oResult) {
					if (oResult.isConfirmed) {
						// sap.ca.ui.dialog.confirmation.close();
					}
				});
			}
			break;
		case "cashtable":
			var cashdata = table.getModel().getData();
			if (evt.oSource.getValue() == cashdata[index].Pcurrency) {
				cashdata[index].PexchangeRate = 1;
				cashdata[index].Ptotal = cashdata[index].PexchangeRate * cashdata[index].Cash;
				// data.enabled= true;
			} else {
				cashdata[index].PexchangeRate = 0;
				cashdata[index].Ptotal = cashdata[index].PexchangeRate * cashdata[index].Cash;
				// data.enabled= false;
				if (generaldata.TravelType == "DEPU")
					oForex.showPopUp();
			}
			table.getModel().setData(cashdata);
			// cells[10].setEditable(false);
			break;
		}
		// oForex.getView().getModel("fieldproperties").setData(data);
	},
	checkCurrencyInTable : function(currency, data, index) {
		var flag = true;
		if (data.length > 1) {
			for ( var i = 0; i < data.length; i++) {
				if (i != index) {
					if (currency == data[i].Currency) {
						flag = false;
						break;
					}
				}
			}
		}
		return flag;
	},
	setCardDetails : function(evt) {
		var table = evt.oSource.getParent().getParent();
		var currency = evt.oSource.getValue();
		var data = oForex.getView().getModel("forexmodel").getData();
		var index = table.indexOfRow(evt.oSource.getParent());
		var selectedCard;
		var cardtable = oForex.getView().byId("cardtable").getModel().getData();
		for ( var i = 0; i < data.cardsAll.length; i++) {
			if (data.cardsAll[i].Currency == currency) {
				selectedCard = data.cardsAll[i];
				break;
			}
		}
		if (selectedCard) {
			cardtable[index].IssuerBank = selectedCard.IssuedBanker;
			cardtable[index].CardNo = selectedCard.CardNo;
			cardtable[index].CardValidity = selectedCard.CardValidUpto;
			oForex.getView().byId("cardtable").getModel().setData(cardtable);
		} else {
			cardtable[index].IssuerBank = "";
			cardtable[index].CardNo = "";
			cardtable[index].CardValidity = "";
			oForex.getView().byId("cardtable").getModel().setData(cardtable);
		}
	},
	onCalculate : function(evt) {
		var carddata = oForex.getView().byId("cardtable").getModel().getData();
		var table = oForex.getView().byId("cardtable");
		var index = table.indexOfRow(evt.getSource().getParent());
		var cells = evt.getSource().getParent().getAggregation("cells");
		// var amount = cells[4].getValue();
		// var ecf = cells[6].getValue();
		// var tax = cells[7].getValue();
		var amount = carddata[index].Amount;
		var ecf = carddata[index].ExchangeRate;
		var tax = carddata[index].Tax;
		if (amount == "") {
			amount = 0;
		} else {
			amount = oForex.formatAmountValue(amount);
		}
		if (ecf == "") {
			ecf = 0;
		} else {
			ecf = oForex.formatAmountValueTo5(ecf);
		}
		if (tax == "") {
			tax = 0;
		} else {
			tax = oForex.formatAmountValue(tax);
		}
		var total = (amount * ecf) + tax;
		carddata[index].Amount = amount;
		carddata[index].ExchangeRate = ecf;
		carddata[index].Total = total;
		carddata[index].Tax = tax;
		// var prate = cells[12].getValue();
		var prate = carddata[index].PexchangeRate;
		if (prate == "") {
			prate = 1;
		} else {
			prate = oForex.formatAmountValueTo5(prate);
		}
		carddata[index].Ptotal = amount * prate;
		oForex.getView().byId("cardtable").getModel().setData(carddata);
	},
	onForexSurrChange : function(evt) {
		var key = evt.oSource.getValue();
		var cells = evt.getSource().getParent().getCells();
		var table = evt.oSource.getParent().getParent();
		var index = table.indexOfRow(evt.getSource().getParent());
		var id = table.getId();
		var sid = id.split("--");
		switch (sid[1]) {
		case "forexsurrcard":
			var carddata = oForex.getView().getModel("forexsurrender").getData();
			if (key == "INR") {
				carddata.cardtable[index].ExchangeRate = "";
				cells[6].setEditable(true);
			} else {
				carddata.cardtable[index].ExchangeRate = 1;
				cells[6].setEditable(false);
			}
			oForex.getView().getModel("forexsurrender").setData(carddata);
			oForex.onForexSurrCalculate(evt);
			break;
		case "forexsurrcash":
			var cashdata = oForex.getView().getModel("forexsurrender").getData();
			if (key == "INR") {
				cashdata.cashtable[index].ExchangeRate = "";
				cells[3].setEditable(true);
			} else {
				cashdata.cashtable[index].ExchangeRate = 1;
				cells[3].setEditable(false);
			}
			oForex.getView().getModel("forexsurrender").setData(cashdata);
			oForex.onForexSurrCalculate(evt);
			break;
		}
	},
	onForexSurrCalculate : function(evt) {
		var table = evt.oSource.getParent().getParent();
		var index = table.indexOfRow(evt.getSource().getParent());
		var id = table.getId();
		var sid = id.split("--");
		switch (sid[1]) {
		case "forexsurrcard":
			oForex.calculateSurrCardTotal(index);
			break;
		case "forexsurrcash":
			oForex.calculateSurrCashTotal(index);
			break;
		}
	},
	calculateSurrCardTotal : function(index) {
		var carddata = oForex.getView().getModel("forexsurrender").getData();
		var amount = oForex.formatAmountValue(carddata.cardtable[index].Amount) * oForex.formatAmountValue(carddata.cardtable[index].ExchangeRate);
		carddata.cardtable[index].Total = amount + oForex.formatAmountValue(carddata.cardtable[index].Tax);
		oForex.getView().getModel("forexsurrender").setData(carddata);
	},
	calculateSurrCashTotal : function(index) {
		var cashdata = oForex.getView().getModel("forexsurrender").getData();
		var amount = oForex.formatAmountValue(cashdata.cashtable[index].Cash) * oForex.formatAmountValue(cashdata.cashtable[index].ExchangeRate);
		cashdata.cashtable[index].Total = amount + oForex.formatAmountValue(cashdata.cashtable[index].Tax);
		oForex.getView().getModel("forexsurrender").setData(cashdata);
	},
	onPRateCard : function(evt) {
		var cells = evt.getSource().getParent().getAggregation("cells");
		var amount = cells[4].getValue();
		var prate = evt.getSource().getValue();
		if (amount == "") {
			amount = 0;
		} else {
			amount = oForex.formatAmountValue(amount);
		}
		if (prate == "") {
			prate = 0;
		} else {
			prate = oForex.formatAmountValue(prate);
		}
		var total = amount * prate;
		var carddata = oForex.getView().byId("cardtable").getModel().getData();
		var table = oForex.getView().byId("cardtable");
		var index = table.indexOfRow(evt.getSource().getParent());
		carddata[index].Ptotal = total;
		oForex.getView().byId("cardtable").getModel().setData(carddata);
		// oForex.getView().byId("cardtable").getModel().refresh(true);
	},
	onCashExchange : function(evt) {
		var index = oForex.getView().byId("cashtable").getSelectedIndex();
		var cashdata = oForex.getView().byId("cashtable").getModel().getData();
		var table = oForex.getView().byId("cashtable");
		var index = table.indexOfRow(evt.getSource().getParent());
		var cells = evt.getSource().getParent().getAggregation("cells");
		// var cash = cells[1].getValue();
		// var exc = cells[3].getValue();
		// var tax = cells[4].getValue();
		var cash = cashdata[index].Cash;
		var exc = cashdata[index].ExchangeRate;
		var tax = cashdata[index].Tax;
		if (cash == "") {
			cash = 0;
		} else {
			cash = oForex.formatAmountValue(cash);
		}
		if (exc == "") {
			exc = 0;
		} else {
			exc = oForex.formatAmountValueTo5(exc);
		}
		if (tax == "") {
			tax = 0;
		} else {
			tax = oForex.formatAmountValue(tax);
		}
		var total = (cash * exc) + tax;
		cashdata[index].Cash = cash;
		cashdata[index].ExchangeRate = exc;
		cashdata[index].Tax = tax;
		cashdata[index].Total = total;
		// var prate = cells[10].getValue();
		var prate = cashdata[index].PexchangeRate;
		if (prate == "") {
			prate = 1;
		} else {
			prate = oForex.formatAmountValueTo5(prate);
		}
		cashdata[index].Ptotal = cash * prate;
		oForex.getView().byId("cashtable").getModel().setData(cashdata);
	},
	onPRateCash : function(evt) {
		var cells = evt.getSource().getParent().getAggregation("cells");
		var cashdata = oForex.getView().byId("cashtable").getModel().getData();
		var table = oForex.getView().byId("cashtable");
		var index = table.indexOfRow(evt.getSource().getParent());
		var cash = cashdata[index].Cash;
		var prate = evt.getSource().getValue();
		if (cash == "") {
			cash = 0;
		} else {
			cash = oForex.formatAmountValue(cash);
		}
		if (prate == "") {
			prate = 0;
		} else {
			prate = oForex.formatAmountValue(prate);
		}
		var total = cash * prate;
		cashdata[index].Ptotal = total;
		oForex.getView().byId("cashtable").getModel().setData(cashdata);
	},
	formatAmountDisplayValue : function(value) {
		var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
			maxFractionDigits : 2,
			groupingEnabled : true,
			groupingSeparator : ",",
			decimalSeparator : "."
		});
		return oNumberFormat.format(value);
	},
	// formatAmountValue : function(value) {
	// var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
	// maxFractionDigits : 2,
	// groupingEnabled : true,
	// groupingSeparator : ",",
	// decimalSeparator : "."
	// });
	//
	// // return oNumberFormat.format(value);
	// return oNumberFormat.parse(value);
	// },
	formatAmountValue : function(value) {
		if (isNaN(parseFloat(value)))
			return 0.00;
		else
			return parseFloat(parseFloat(value).toFixed(4));
	},
	formatAmountValueTo5 : function(value) {
		if (isNaN(parseFloat(value)))
			return 0.00;
		else
			return parseFloat(parseFloat(value).toFixed(5));
	},
	onSurrAdd : function(evt) {
		var id = evt.oSource.getId();
		var sid = id.split("--");
		var data = oForex.getView().getModel("forexsurrender").getData();
		switch (sid[1]) {
		case "surcardadd":
			data.cardtable.push({});
			evt.oSource.getParent().getParent().setVisibleRowCount(data.cardtable.length);
			break;
		case "surcashadd":
			data.cashtable.push({});
			evt.oSource.getParent().getParent().setVisibleRowCount(data.cashtable.length);
			break;
		case "surinradd":
			data.inrtable.push({});
			evt.oSource.getParent().getParent().setVisibleRowCount(data.inrtable.length);
			break;
		}
		oForex.getView().getModel("forexsurrender").setData(data);
	},
	onSurrDel : function(evt) {
		var id = evt.oSource.getId();
		var sid = id.split("--");
		var data = oForex.getView().getModel("forexsurrender").getData();
		var parent = evt.oSource.getParent().getParent();
		var index = parent.getSelectedIndices();
		switch (sid[1]) {
		case "surcarddel":
			data.cardtable = oForex.deleteRows(parent, index, data.cardtable);
			evt.oSource.getParent().getParent().setVisibleRowCount(data.cardtable.length);
			break;
		case "surcashdel":
			data.cashtable = oForex.deleteRows(parent, index, data.cashtable);
			evt.oSource.getParent().getParent().setVisibleRowCount(data.cashtable.length);
			break;
		case "surinrdel":
			data.inrtable = oForex.deleteRows(parent, index, data.inrtable);
			evt.oSource.getParent().getParent().setVisibleRowCount(data.inrtable.length);
			break;
		}
		oForex.getView().getModel("forexsurrender").setData(data);
	},
	deleteRows : function(table, index, expense) {
		for ( var i = index.length - 1; i >= 0; i--) {
			// var tableIndex = table.indexOfItem(index[i]);
			expense.splice(index[i], 1);
		}
		return expense;
	},
	/**
	 * Similar to onAfterRendering, but this hook is invoked before the
	 * controller's View is re-rendered (NOT before the first rendering!
	 * onInit() is used for that one!).
	 * 
	 * @memberOf sap.ui.project.e2etm.controller.Forex
	 */
	// onBeforeRendering: function() {
	//
	// },
	/**
	 * Called when the View has been rendered (so its HTML is part of the
	 * document). Post-rendering manipulations of the HTML could be done here.
	 * This hook is the same one that SAPUI5 controls get after being rendered.
	 * 
	 * @memberOf sap.ui.project.e2etm.controller.Forex
	 */
	onAfterRendering : function() {
		if (this.getView().byId("cardtable")) {
			this.getView().byId("cardtable").onAfterRendering = jQuery.proxy(function() {
				if (sap.ui.table.Table.prototype.onAfterRendering) {
					sap.ui.table.Table.prototype.onAfterRendering.apply(this.getView().byId("cardtable"), arguments);
				}
				$(".datepick_read_only .sapMInputBaseInner").attr('readonly', 'readonly');
				var gdata = oForex.getView().getModel("general").getData();
				if (gdata.whichtab == "CHCLS")
					this.setCardTableProperties();
			}, this);
		}
		if (this.getView().byId("cashtable")) {
			this.getView().byId("cashtable").onAfterRendering = jQuery.proxy(function() {
				if (sap.ui.table.Table.prototype.onAfterRendering) {
					sap.ui.table.Table.prototype.onAfterRendering.apply(this.getView().byId("cashtable"), arguments);
				}
				$(".datepick_read_only .sapMInputBaseInner").attr('readonly', 'readonly');
				var gdata = oForex.getView().getModel("general").getData();
				if (gdata.whichtab == "CHCLS")
					this.setCashTableProperties();
			}, this);
		}
	},
	setCardTableProperties : function() {
		var gdata = oForex.getView().getModel("general").getData();
		var rows = this.getView().byId("cardtable").getRows();
		for ( var i = 0; i < rows.length; i++) {
			if (this["fixedCardRows"]) {
				if (i < this["fixedCardRows"].length) {
					var cells = rows[i].getCells();
					for ( var j = 0; j < cells.length; j++) {
						cells[j].setEditable(false);
					}
				}
			}
		}
	},
	setCashTableProperties : function() {
		var gdata = oForex.getView().getModel("general").getData();
		var rows = this.getView().byId("cashtable").getRows();
		for ( var i = 0; i < rows.length; i++) {
			if (this["fixedCashRows"]) {
				if (i < this["fixedCashRows"].length) {
					var cells = rows[i].getCells();
					for ( var j = 0; j < cells.length; j++) {
						if (cells[j] instanceof sap.m.Select)
							cells[j].setEnabled(false);
						else
							cells[j].setEditable(false);
					}
				}
			}
		}
	},
	onDelimitCard:function(evt){
		oForex.onDelimit();
	},
	onUpdateCard:function(evt){
		var table = oForex.getView().byId("cardtable");
		
		rows = table.getSelectedIndices();
		if(rows.length > 1||rows.length == 0){
			sap.m.MessageToast.show("Please select one Card Detail", {
				duration : 10000,
				closeOnBrowserNavigation : false
			});
		}else{
		
		var oView = this.getView();
		var oDialog = oView.byId("newCardDialog");		
		if (!oDialog) {		
			oDialog = sap.ui.xmlfragment(oView.getId(),"sap.ui.project.e2etm.fragment.forex.UpdateCard", this);		
			oView.addDependent(oDialog);
		}
		this.getView().byId("ipNewBank").setValue("");
		this.getView().byId("ipNewCard").setValue("");
		this.getView().byId("ipNewCardV").setValue("");
		this.getView().byId("ipNewCur").setValue("");
		oDialog.open();
		}
	},
	onAddNewCard:function(){
		var currency = this.getView().byId("ipNewCur").getValue();
		var curFlag = false;
		if(this.getView().byId("ipNewBank").getValue() == ""||
		   this.getView().byId("ipNewCard").getValue() == ""||
		   this.getView().byId("ipNewCardV").getValue() == ""||
		   currency == ""){
				sap.m.MessageToast.show("Please enter all Details");
					return;
				}
//		
		var curList = oForex.getView().getModel("curModel").getData();
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
		var cardsAll = oForex.getView().getModel("forexmodel").getData().cardsAll;
		for(var i=0;i<cardsAll.length;i++){
			if(cardsAll[i].Currency == currency){
				sap.m.MessageToast.show("Currency Already Exists.Please select different currency");
				return;
			}
		}
		
		
		
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oForex);
		var generaldata = oForex.getView().getModel("general").getData();
		var oData = {EmpNo:generaldata.EmpNo,
				     IssuedBanker:this.getView().byId("ipNewBank").getSelectedKey(),
				     CardNo:this.getView().byId("ipNewCard").getValue(),
				     CardValidUpto:this.getView().byId("ipNewCardV").getValue(),
				     Currency:this.getView().byId("ipNewCur").getValue()};
		oDataModel.update("ForexCardsAllSet(EmpNo='"+generaldata.EmpNo+"')", oData, null, jQuery.proxy(function(oData, response) {
			// oForex.uploadFiles(gdata.TravelPlan);
			sap.m.MessageToast.show("Card Details Updated Successfully", {
				duration : 10000,
				closeOnBrowserNavigation : false
			});
			
			oForex.updateCardTable();
			oForex.onNewCardClose();
			oForex.fetchCardsAll(generaldata.EmpNo);
		},this), function(error) {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oForex);
			sap.m.MessageToast.show("Internal Server Error");
		});
	},
	onNewCardClose:function(){
		this.getView().byId("newCardDialog").close();
	},
	updateCardTable:function(){
		var table = oForex.getView().byId("cardtable");
		var carddata = table.getModel().getData();
		rows = table.getSelectedIndices();
		var generaldata = oForex.getView().getModel("general").getData();
		var oData = {EmpNo:generaldata.EmpNo,
				     IssuedBanker:this.getView().byId("ipNewBank").getSelectedKey(),
				     CardNo:this.getView().byId("ipNewCard").getValue(),
				     CardValidUpto:this.getView().byId("ipNewCardV").getValue(),
				     Currency:this.getView().byId("ipNewCur").getValue()};
		carddata[rows[0]]["IssuerBank"] = oData.IssuedBanker;
		carddata[rows[0]]["CardNo"] = oData.CardNo;
		carddata[rows[0]]["CardValidity"] = oData.CardValidUpto; 
		carddata[rows[0]]["Currency"] = oData.Currency;
		table.getModel().setData(carddata);
	},
	onLogSelect:function(evt){
		this.getView().byId("pnlLog").removeAllContent();
	
		if (!(sap.ui.getCore().byId("tblCurr")))
			content = sap.ui.xmlfragment("sap.ui.project.e2etm.fragment.forex.UploadSuccess", this);
		
		if (!(sap.ui.getCore().byId("tblErr")))
			content = sap.ui.xmlfragment("sap.ui.project.e2etm.fragment.forex.UploadError", this);
		
		if(this.getView().byId("pnlSegBtn").getSelectedKey() == "SUC" || 
		   this.getView().byId("pnlSegBtn").getSelectedKey() == ""){

				content = sap.ui.getCore().byId("tblCurr");			
			
		}else{
				content = sap.ui.getCore().byId("tblErr");		
			
		}
		this.getView().byId("pnlLog").addContent(content);
	},
	onMassFileUpload:function(){
		var file = this.getView().byId("forexFileUploader").oFileUpload.files[0];
		var importFile = $.Deferred();
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, this);
		var reader = new FileReader();		
		var oData = {};
		var nav;
		//oData[nav] = [];
		
		 reader.onload = function(e) {

	           data = e.target.result;

	         var wb = XLSX.read(data, {type: 'binary'});

	         wb.SheetNames.forEach(function(sheetName,index) {
              if(index == 0){
            	  nav = "ForexCardSet";
              }else if(index == 1){
            	  nav = "ForexCashSet";
              }
              oData[nav] = [];
	           var data = XLSX.utils.sheet_to_row_object_array(wb.Sheets[sheetName]);

	           for(var i=0;i<data.length;i++){
	        	   oData[nav].push({});	
	        	   delete data[i]["__rowNum__"];
	        	   for(var prop in data[i]){
	        		   var column = prop.split("_");
	        		   
	        		   oData[nav][i][column[1]] = data[i][prop];
	        		  
	        	   }
	           }
	         
	           

	         });
	         
	         var oDataModel = new sap.ui.model.odata.ODataModel(sServiceUrl,true);
	           oDataModel.setHeaders({action:"UPLOAD"});
	           oDataModel.create("/ForexTransSet", oData, {success:jQuery.proxy(function(oData, response) {
				// oController.uploadFiles(global.ZZ_TRV_REQ);
	       		importFile.resolve(oData);	
			},this), error:jQuery.proxy(function(error) {
				importFile.reject(error);	
			},this),async:true});

	         //return result;

	       }
	       importFile.done(jQuery.proxy(function(response){
	    	   this.getView().byId("pnlLog").setVisible(true);
	    	   var result = {Details:[]};
	    	   this.getView().byId("pnlLog").destroyContent();
	    	   this.onLogSelect();  
	    	   if(response.ForexCardSet){
	    	   for(var i=0;i<response.ForexCardSet.results.length;i++){
	    		   var rowIndex = -1;
	    		   $.map(result.Details, function(elem, index) {
	    			   if (elem.Currency == response.ForexCardSet.results[i].Currency) {
	    			       rowIndex = index;
	    			       elem.Amount = parseFloat(elem.Amount) + parseFloat(response.ForexCardSet.results[i].Amount);
	    			      // break;
	    			       elem.Details.push(response.ForexCardSet.results[i]);
	    			       return false;
	    			    
	    			   }
	    			  });
	    		   
	    		   if(rowIndex==-1){
	    			   result.Details.push({Currency:response.ForexCardSet.results[i].Currency,Amount:response.ForexCardSet.results[i].Amount,
	    				                    Details:[response.ForexCardSet.results[i]]});
	    			   }
	    		   }	    	     
	    	   var model = new sap.ui.model.json.JSONModel();
               model.setData({currencies:result});
               sap.ui.getCore().byId("tblCurr").setModel(model);
	    	   }
	    	   if(response.ForexCashSet){
	    		   var model = new sap.ui.model.json.JSONModel();
                   model.setData(response.ForexCashSet.results);
	    		   sap.ui.getCore().byId("tblErr").setModel(model);;		
	    	   }
	    	 

	    	   
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
			
			},this));
			
			importFile.fail(jQuery.proxy(function(response){
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
				
				
			},this));
			

	       reader.readAsBinaryString(file);

	},
	getColumnProperty:function(text){
		switch(text){
		case "Travel Plan":
			return "TravelPlan";
		case "Employee No":
			return "EmpNo";
		case "Issuer Bank":
			return "IssuerBank";
		case "Card No":
			return "CardNo";
		case "Card Validity":
			return "CardValidity";
			
		}
	}
	
/**
 * Called when the Controller is destroyed. Use this one to free resources and
 * finalize activities.
 * 
 * @memberOf sap.ui.project.e2etm.controller.Forex
 */
// onExit: function() {
//
// }
});